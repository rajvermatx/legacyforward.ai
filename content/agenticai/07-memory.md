---
title: "Memory"
slug: "memory"
description: "An agent that forgets what you said three messages ago is not an assistant — it is a stranger you keep re-introducing yourself to. This chapter gives your agents the ability to remember."
section: "agenticai"
order: 7
part: "Part 02 Core Patterns"
---

Part 2: Core Patterns

# Memory

An agent that forgets what you said three messages ago is not an assistant. It is a stranger you keep re-introducing yourself to. This chapter gives your agents the ability to remember.

Reading time: ~25 min Project: Memory Manager Variants: Tech / Software, Healthcare, Finance, Education, E-commerce, Legal

### What You Will Learn

-   Why stateless LLM calls create agents that forget — and how memory solves this
-   Short-term memory: conversation buffers, sliding windows, and their token-cost tradeoffs
-   Summary memory: compressing long conversations without losing critical facts
-   Long-term vector stores: embedding past interactions for semantic retrieval
-   Episodic and semantic memory: modeling experiences vs. facts
-   Memory retrieval strategies: recency, relevance, importance scoring, and hybrid approaches
-   When to use which memory type — a decision framework for production systems
-   Building a multi-tier memory manager that combines all layers

## 7.1 The Forgetting Problem

Imagine you are building a personal finance assistant. A user begins a conversation:

```
User: I just got a raise to $95,000. Help me redo my budget.
Agent: Congratulations! Let's restructure your budget for $95,000...
       [provides detailed breakdown]

User: Actually, also factor in that my rent went up to $2,200.
Agent: Sure, here's the updated budget with $2,200 rent...

User: Now show me how much I can save if I cut dining out.
Agent: I'd be happy to help! What is your current salary and rent?
```

The agent has forgotten everything. The salary, the rent, the entire budget discussion: all gone. The user is now talking to a blank slate that confidently asks for information it was given two messages ago.

This is not a bug in the model. It is the default architecture. Every call to an LLM API is stateless. The model receives a list of messages, generates a completion, and discards everything. There is no persistent memory between calls. If you do not include previous messages in the next request, they never happened.

The naive solution is obvious: include every previous message in every request. This is the conversation buffer, and for short exchanges it works perfectly. But tokens cost money and context windows have limits. A 50-turn conversation about tax planning might consume 40,000 tokens per request. At GPT-4o pricing, that is roughly $0.10 per message, and that is before the model generates a response. A thousand users with fifty-turn conversations means $5,000 in memory costs alone.

The real problem is deeper than cost. Even if context windows were infinite and free, raw conversation history is the wrong data structure for memory. Human memory is not a transcript. It is layered: you remember the gist of last week’s meeting, the exact deadline your boss mentioned, and the pattern that this client always changes requirements on Fridays. Effective agent memory needs the same layered architecture.

## 7.2 Short-Term Memory: Conversation Buffers

The simplest form of memory is the **conversation buffer**, a list that stores every message in the current session and sends all of them with each API call. Every chatbot tutorial starts here:

```
class ConversationBuffer:
    def __init__(self, system_prompt: str):
        self.messages = [{"role": "system", "content": system_prompt}]

    def add_user_message(self, content: str):
        self.messages.append({"role": "user", "content": content})

    def add_assistant_message(self, content: str):
        self.messages.append({"role": "assistant", "content": content})

    def get_messages(self) -> list[dict]:
        return self.messages.copy()
```

This works for short conversations. The problem is that it grows without bound. After 30 exchanges, you might have 15,000 tokens of history, most of which is irrelevant to the current question. You are paying to send a discussion about Monday’s weather every time the user asks about Friday’s dinner reservation.

### Sliding Window Memory

The sliding window keeps only the last *k* messages, discarding older ones. This caps token usage at a predictable ceiling:

```
class SlidingWindowMemory:
    def __init__(self, system_prompt: str, window_size: int = 20):
        self.system = {"role": "system", "content": system_prompt}
        self.messages: list[dict] = []
        self.window_size = window_size

    def add(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
        if len(self.messages) > self.window_size:
            self.messages = self.messages[-self.window_size:]

    def get_messages(self) -> list[dict]:
        return [self.system] + self.messages
```

The tradeoff is brutal and predictable. If the user mentioned their budget constraints in message 3 and you are now on message 25 with a window of 20, that constraint is gone. The agent will recommend expenses the user explicitly ruled out. Sliding windows trade accuracy for cost, and the user never knows which facts have been silently discarded.

> Common Mistake
> 
> Setting a sliding window based on message count rather than token count. Twenty messages of “yes” and “no” consume 100 tokens. Twenty messages containing code reviews consume 20,000. Always measure in tokens, not messages, when setting window boundaries.

### Token-Aware Windowing

A better sliding window measures tokens, not messages, ensuring you stay within both budget and context limits:

```
import tiktoken

class TokenWindowMemory:
    def __init__(self, system_prompt: str, max_tokens: int = 4000):
        self.system = {"role": "system", "content": system_prompt}
        self.messages: list[dict] = []
        self.max_tokens = max_tokens
        self.encoder = tiktoken.encoding_for_model("gpt-4o")

    def _count_tokens(self, messages: list[dict]) -> int:
        return sum(len(self.encoder.encode(m["content"])) for m in messages)

    def add(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
        while (self._count_tokens(self.messages) > self.max_tokens
               and len(self.messages) > 1):
            self.messages.pop(0)

    def get_messages(self) -> list[dict]:
        return [self.system] + self.messages
```

## 7.3 Summary Memory

Summary memory solves the sliding window’s amnesia problem. Instead of discarding old messages, you compress them into a running summary. The summary is prepended to the context window, giving the agent a gist of everything that came before, while recent messages remain in full detail.

```
class SummaryMemory:
    def __init__(self, client, system_prompt: str,
                 max_recent: int = 10, summary: str = ""):
        self.client = client
        self.system = system_prompt
        self.recent: list[dict] = []
        self.max_recent = max_recent
        self.summary = summary

    def add(self, role: str, content: str):
        self.recent.append({"role": role, "content": content})
        if len(self.recent) > self.max_recent:
            self._compress()

    def _compress(self):
        """Summarize oldest messages and fold into running summary."""
        to_compress = self.recent[:len(self.recent) - self.max_recent // 2]
        self.recent = self.recent[len(to_compress):]

        transcript = "\n".join(
            f"{m['role']}: {m['content']}" for m in to_compress
        )
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": (
                    "Summarize this conversation segment. Preserve all "
                    "specific facts, numbers, names, and decisions. "
                    "Be concise but never drop a concrete detail."
                )
            }, {
                "role": "user",
                "content": f"Previous summary:\n{self.summary}\n\n"
                           f"New messages:\n{transcript}"
            }]
        )
        self.summary = response.choices[0].message.content

    def get_messages(self) -> list[dict]:
        messages = [{"role": "system", "content": self.system}]
        if self.summary:
            messages.append({
                "role": "system",
                "content": f"Conversation summary so far:\n{self.summary}"
            })
        messages.extend(self.recent)
        return messages
```

> Under the Hood
> 
> Summary memory uses a cheaper, faster model (like `gpt-4o-mini`) for compression. The summarization call adds latency and cost, but both are small compared to the savings from sending 500 tokens of summary instead of 5,000 tokens of raw history. The key instruction is “never drop a concrete detail” — without this, the summarizer will produce vague abstractions that destroy the agent’s ability to reference specific facts.

Summary memory has a fundamental limitation: it is lossy. Every compression step risks dropping something the user considers important but the summarizer considers minor. If the user mentioned a shellfish allergy in passing during a restaurant recommendation conversation, a summarizer focused on key decisions might discard it. Three turns later, the agent recommends a seafood restaurant. For safety-critical facts, you need a memory layer that never compresses.

![Diagram 1](/diagrams/agenticai/memory-1.svg)

Figure 7-1. Multi-tier memory architecture — each layer trades off speed, cost, and fidelity differently.

## 7.4 Long-Term Memory with Vector Stores

Summary memory compresses the current session. But what about yesterday’s conversation? Or the conversation from last month where the user explained their entire project architecture? For cross-session memory, you need a vector store.

The idea is straightforward: take chunks of conversation (or extracted facts), convert them into embedding vectors, and store them in a vector database. When the agent needs context, embed the current query and retrieve the most semantically similar memories.

```
from openai import OpenAI
import chromadb

client = OpenAI()
chroma = chromadb.PersistentClient(path="./memory_store")
collection = chroma.get_or_create_collection(
    name="agent_memory",
    metadata={"hnsw:space": "cosine"}
)

def store_memory(user_id: str, content: str, metadata: dict):
    """Embed and store a memory chunk."""
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=content
    )
    embedding = response.data[0].embedding
    collection.add(
        ids=[f"{user_id}_{metadata['timestamp']}"],
        embeddings=[embedding],
        documents=[content],
        metadatas=[{**metadata, "user_id": user_id}]
    )

def retrieve_memories(user_id: str, query: str, k: int = 5) -> list[str]:
    """Retrieve the k most relevant memories for a query."""
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    )
    query_embedding = response.data[0].embedding
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k,
        where={"user_id": user_id}
    )
    return results["documents"][0]
```

Vector retrieval is powerful but imprecise. The embedding model might consider “I hate spicy food” and “I love spicy food” as highly similar because both are about spicy food preferences. Negation, quantification, and temporal context are poorly captured by embedding similarity alone. This is why production systems never rely on vector search as the sole retrieval strategy.

> Under the Hood
> 
> Embedding models map text into high-dimensional vector space where semantic similarity corresponds to geometric proximity. The `text-embedding-3-small` model produces 1536-dimensional vectors. “Cosine similarity” measures the angle between two vectors — identical meaning yields a score of 1.0, completely unrelated text approaches 0. In practice, most memory retrieval scores cluster between 0.7 and 0.9, making threshold-based filtering unreliable. Rank-based retrieval (top-k) is more robust.

![Diagram 2](/diagrams/agenticai/memory-2.svg)

Figure 7-2. Semantic similarity retrieval — the query vector Q finds nearest neighbors in embedding space, pulling relevant memories from topically related clusters.

## 7.5 Episodic Memory

Episodic memory stores structured records of specific events. Where vector memory answers “what do I know about budgets?”, episodic memory answers “what happened the last time the user asked me to create a budget?” The distinction matters: the user does not just want relevant facts. They want the agent to learn from past interactions.

```
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class Episode:
    timestamp: datetime
    event_type: str            # "task_completed", "error", "preference"
    summary: str               # What happened
    outcome: str               # "success", "failure", "partial"
    details: dict = field(default_factory=dict)
    importance: float = 0.5    # 0.0 to 1.0

class EpisodicMemory:
    def __init__(self):
        self.episodes: list[Episode] = []

    def record(self, event_type: str, summary: str,
               outcome: str, details: dict = None,
               importance: float = 0.5):
        self.episodes.append(Episode(
            timestamp=datetime.now(),
            event_type=event_type,
            summary=summary,
            outcome=outcome,
            details=details or {},
            importance=importance
        ))

    def recall(self, event_type: str = None,
               min_importance: float = 0.0,
               limit: int = 10) -> list[Episode]:
        filtered = self.episodes
        if event_type:
            filtered = [e for e in filtered if e.event_type == event_type]
        filtered = [e for e in filtered if e.importance >= min_importance]
        return sorted(filtered, key=lambda e: e.timestamp,
                     reverse=True)[:limit]
```

Episodic memory enables a pattern that is impossible with buffer or vector memory alone: learning from mistakes. If the agent tried a SQL query that failed last Tuesday, episodic memory can surface that failure when the agent considers the same approach again. The agent can then choose a different strategy without repeating the error.

## 7.6 Semantic Memory: Facts vs. Experiences

Semantic memory stores decontextualized facts extracted from conversations. Where episodic memory records “on March 3rd the user said they are allergic to shellfish during a restaurant conversation,” semantic memory simply stores: `user.allergies = [“shellfish”]`.

```
class SemanticMemory:
    """Key-value store of extracted user facts."""

    def __init__(self, client):
        self.client = client
        self.facts: dict[str, dict] = {}  # user_id -> {key: value}

    def extract_and_store(self, user_id: str, conversation: list[dict]):
        """Use LLM to extract facts from a conversation."""
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": (
                    "Extract user facts from this conversation. Return JSON "
                    "with keys like 'name', 'preferences', 'constraints', "
                    "'goals'. Only include explicitly stated facts."
                )
            }, {
                "role": "user",
                "content": str(conversation)
            }],
            response_format={"type": "json_object"}
        )
        new_facts = json.loads(response.choices[0].message.content)
        if user_id not in self.facts:
            self.facts[user_id] = {}
        self.facts[user_id].update(new_facts)

    def get_facts(self, user_id: str) -> dict:
        return self.facts.get(user_id, {})
```

The power of semantic memory is in its permanence and precision. A conversation buffer forgets after the window slides. A summary might compress away a detail. A vector store might not retrieve a fact if the current query is not semantically similar enough. But a semantic fact store will always know the user’s name, preferences, and constraints, because those are stored as structured data, not buried in conversation text.

> Production Consideration
> 
> Semantic memory extraction should run asynchronously after each conversation, not synchronously during it. Users should not wait an extra 500ms per message so the system can extract facts they just stated. Extract in the background, and the facts will be available for the *next* conversation.

## 7.7 Memory Retrieval Strategies

Having multiple memory stores is useless without a strategy for deciding what to retrieve and when. Production memory systems use hybrid retrieval strategies that combine multiple signals:

### Recency

Recent memories get priority. A conversation from five minutes ago is almost always more relevant than one from five months ago. Recency scoring applies an exponential decay to memory timestamps:

```
import math
from datetime import datetime, timezone

def recency_score(memory_time: datetime, half_life_hours: float = 24.0) -> float:
    """Score from 1.0 (now) decaying with half-life."""
    age_hours = (datetime.now(timezone.utc) - memory_time).total_seconds() / 3600
    return math.pow(0.5, age_hours / half_life_hours)
```

### Relevance (Semantic Similarity)

The cosine similarity score from vector search. Highly relevant memories surface even if they are old. This is why a shellfish allergy mentioned months ago can still appear when the user asks for restaurant recommendations.

### Importance

Not all memories are equal. “The user prefers dark mode” is less important than “the user is allergic to penicillin.” Importance scoring requires either explicit tagging, where the agent marks high-importance facts, or LLM-based scoring at storage time:

```
def score_importance(client, memory_text: str) -> float:
    """Use LLM to rate memory importance from 0 to 1."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "system",
            "content": (
                "Rate the importance of this memory on a scale of 0 to 1. "
                "Safety-critical info (allergies, medical) = 0.9-1.0. "
                "Key preferences/constraints = 0.6-0.8. "
                "Casual observations = 0.1-0.4. "
                "Return only a number."
            )
        }, {
            "role": "user",
            "content": memory_text
        }]
    )
    return float(response.choices[0].message.content.strip())
```

### Hybrid Scoring

Production systems combine all three signals with tunable weights:

```
def hybrid_score(recency: float, relevance: float,
                 importance: float,
                 w_recency: float = 0.3,
                 w_relevance: float = 0.5,
                 w_importance: float = 0.2) -> float:
    return (w_recency * recency +
            w_relevance * relevance +
            w_importance * importance)
```

> Common Mistake
> 
> Weighting relevance too heavily without recency correction. If a user discussed Python extensively three months ago but has since switched to Rust, pure relevance-based retrieval will keep surfacing Python memories for every coding question. Recency decay ensures the system gradually forgets outdated context.

## 7.8 Choosing the Right Memory Type

Every memory type has a sweet spot. Using the wrong type wastes resources or creates blind spots. Here is the decision framework:

| Memory Type | Best For | Retention | Cost | Failure Mode |
| --- | --- | --- | --- | --- |
| **Buffer** | Short conversations (<20 turns) | Session only | Linear with length | Token limit exceeded |
| **Sliding Window** | Long sessions, recent context matters most | Last k messages | Fixed ceiling | Early context lost |
| **Summary** | Long sessions, gist is sufficient | Compressed indefinitely | Extra LLM call | Lossy compression |
| **Vector Store** | Cross-session recall, large knowledge | Permanent | Embedding + storage | Semantic mismatch |
| **Episodic** | Learning from past interactions | Permanent | DB storage | Over-indexing on past |
| **Semantic** | User facts, preferences, constraints | Permanent | Extraction LLM call | Stale facts |

Most production agents need at least two layers: a buffer or sliding window for the current session, plus one long-term store (vector or semantic) for cross-session continuity. The project at the end of this chapter combines all four.

## 7.9 Memory in Practice: Integration Patterns

The final architectural question is how memory integrates with the agent loop. There are two patterns:

**Pre-prompt injection** retrieves relevant memories before the LLM call and injects them into the system prompt or a dedicated memory message. This is the simplest and most common approach:


```
def build_prompt(user_msg: str, memory_manager) -> list[dict]:
    # Retrieve relevant long-term memories
    memories = memory_manager.retrieve(user_msg, k=5)
    memory_block = "\n".join(f"- {m}" for m in memories)

    # Get user facts
    facts = memory_manager.get_user_facts()
    facts_block = json.dumps(facts, indent=2) if facts else "None"

    return [
        {"role": "system", "content": f"""You are a personal assistant.

Known user facts:
{facts_block}

Relevant memories from past conversations:
{memory_block}
"""},
        *memory_manager.get_recent_messages(),
        {"role": "user", "content": user_msg}
    ]
```

**Tool-based retrieval** gives the agent a `search_memory` tool. Instead of automatically retrieving memories, the agent decides when it needs past context and explicitly searches for it. This reduces unnecessary retrieval but requires the agent to know when it is missing information. That meta-cognitive skill is one that smaller models handle poorly.

```
memory_tool = {
    "type": "function",
    "function": {
        "name": "search_memory",
        "description": "Search past conversations and stored facts.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "What to search for in memory"
                },
                "memory_type": {
                    "type": "string",
                    "enum": ["all", "facts", "episodes", "conversations"],
                    "description": "Which memory store to search"
                }
            },
            "required": ["query"]
        }
    }
}
```

> Production Consideration
> 
> Pre-prompt injection is safer for most applications. Tool-based retrieval sounds elegant but introduces a failure mode where the agent *does not realize* it needs to search. A user says “same budget as last time” and the agent — not finding “last time” in the current context — might guess instead of searching. Pre-prompt injection with a relevance threshold is simpler and more reliable.

* * *

## Project: Memory Manager

Build a multi-tier memory system that combines conversation buffer, summary compression, vector-based long-term storage, and semantic fact extraction. The system should maintain context across sessions and retrieve the right memories based on hybrid scoring.

**Core requirements:**

-   Token-aware sliding window for current session
-   Automatic summary compression when window overflows
-   Vector store (ChromaDB) for cross-session memory
-   Semantic fact extraction and structured storage
-   Hybrid retrieval with recency, relevance, and importance scoring
-   Pre-prompt injection that assembles context from all layers

Tech / Software Code context memory — remembers project architecture, past debugging sessions, coding preferences

Healthcare Patient interaction memory — tracks symptoms, allergies, medication history across visits

Finance Client portfolio memory — remembers risk tolerance, investment goals, past advice

Education Student learning memory — tracks mastery levels, misconceptions, learning pace

E-commerce Shopper preference memory — stores size, style, budget, past purchases

Legal Case research memory — remembers cited precedents, argument history, client details

* * *

## Summary

1.  **LLM calls are stateless by default.** Every API call is a blank slate. Memory is not built in. It must be engineered as an explicit system layer that persists, compresses, and retrieves conversation context.
2.  **Buffer memory is simple but does not scale.** Conversation buffers work for short exchanges but grow linearly in cost and eventually hit context limits. Token-aware sliding windows cap costs but silently discard early context.
3.  **Summary memory preserves the gist, not the details.** Compressing old messages into running summaries saves tokens but introduces lossy compression. Always instruct the summarizer to preserve specific facts, numbers, and decisions.
4.  **Vector stores enable cross-session memory through semantic retrieval.** Embedding past interactions and querying by similarity lets agents recall relevant context from days or months ago, but negation and temporal nuance are poorly captured by embeddings alone.
5.  **Production systems combine multiple memory layers with hybrid scoring.** Recency, relevance, and importance each capture different aspects of what the agent should remember. The right weights depend on your domain. A medical agent needs high importance weighting; a chat companion needs high recency weighting.

### Exercises

Conceptual

A customer support agent uses a 10-message sliding window. A user reports a bug in message 2, discusses workarounds in messages 3–8, then asks “Can you summarize the bug I reported?” in message 14. Explain why the agent fails. Design a memory architecture that handles this scenario using no more than 4,000 tokens of context per call.

Coding

Implement a `MemoryManager` class that combines `TokenWindowMemory` and `SummaryMemory`. When the token window overflows, the oldest messages should be summarized (not discarded). Write tests that verify: (a) the summary contains specific numbers mentioned in compressed messages, and (b) total token count stays below the configured limit.

Design

You are building a tutoring agent that works with students over an entire semester. Students revisit topics, forget material, and gradually improve. Design a memory system that tracks: what the student knows, what they struggle with, what has been taught, and which explanations worked. Specify which memory type (buffer, summary, vector, episodic, semantic) handles each requirement and justify your choices.