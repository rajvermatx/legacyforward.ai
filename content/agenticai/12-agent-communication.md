---
title: "Agent Communication"
slug: "agent-communication"
description: "Two agents are assigned to plan a product launch. The marketing agent writes a press release announcing a feature that engineering has already descoped. The engineering agent drafts a deployment timeline that contradicts the date marketing promised to journalists. Neither agent is wrong in isolation"
section: "agenticai"
order: 12
part: "Part 03 Multi Agent"
---

Part 3: Multi-Agent Systems

# Agent Communication

Two agents are assigned to plan a product launch. The marketing agent writes a press release announcing a feature that engineering has already descoped. The engineering agent drafts a deployment timeline that contradicts the date marketing promised to journalists. Neither agent is wrong in isolation. Each followed its instructions perfectly. The failure is that they never talked to each other. Multi-agent systems do not fail because individual agents are incompetent. They fail because communication between agents is absent, ambiguous, or structurally broken.

Reading time: ~22 min Project: Agent Messenger Variants: Tech / Software, Healthcare, Finance, Education, E-commerce, Legal

### What You Will Learn

-   How broadcast, request/reply, and pub/sub message passing patterns shape agent interactions and when each topology is appropriate
-   Why shared state is both the simplest coordination mechanism and the most dangerous source of race conditions in multi-agent systems
-   How to design structured message formats that prevent the ambiguity and data loss that plague unstructured agent conversations
-   What agent protocols are, how they govern turn-taking and authority, and why protocol violations cause cascading failures
-   How to manage conversations between agents: threading, context windows, and preventing infinite loops
-   How agents resolve conflicts when they disagree on facts, priorities, or next steps

## 12.1 Why Communication Is the Hard Problem

A single agent has a straightforward job: receive input, reason, act, return output. The moment you add a second agent, you introduce a problem that no amount of individual agent quality can solve. The agents must agree on what to communicate, when to communicate it, and what format to use. Miss any of these three, and the system produces contradictory outputs, duplicated work, or deadlocks where both agents wait for the other to go first.

This is not a new problem. Distributed systems engineering has spent decades on message passing, consensus protocols, and shared state management. The difference with LLM-based agents is that the messages are not just data packets. They are natural language, which means they carry ambiguity, implicit assumptions, and context that degrades as conversations grow longer. An integer either matches or it does not. A sentence like “the timeline looks fine” can mean six different things depending on who said it and when.

> The Telephone Problem
> 
> When Agent A summarizes its findings for Agent B, and Agent B summarizes those for Agent C, information degrades at every hop. By the time Agent C acts, it may be operating on a distorted version of what Agent A actually found. This is not a theoretical concern. It is the default behavior of multi-agent systems that pass natural language summaries between agents. Every hop is a lossy compression step. Structured message formats exist to prevent this.

The communication patterns in this chapter are not abstractions for their own sake. Each one solves a specific coordination failure. Broadcast solves the problem of agents not knowing what other agents are doing. Request/reply solves the problem of agents needing specific information from a specific source. Pub/sub solves the problem of agents needing to react to events they cannot predict in advance. Shared state solves the problem of agents needing a single source of truth. None of them solves all problems, and using the wrong pattern creates new failures.

## 12.2 Message Passing Patterns

Message passing is the foundational mechanism for agent communication. One agent produces a message. One or more agents consume it. The sending topology, meaning who sends to whom and how, determines the system’s behavior under load, failure, and scale.

### Broadcast

In a broadcast topology, one agent sends a message to all other agents in the system. Every agent receives every message. This is the simplest pattern and the most wasteful. It works when agents are few, messages are rare, and every agent genuinely needs to know everything.

```
from dataclasses import dataclass, field
from typing import Any
import uuid
import time


@dataclass
class Message:
    """Structured message for inter-agent communication."""
    sender: str
    content: Any
    msg_type: str = "info"
    msg_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    timestamp: float = field(default_factory=time.time)
    reply_to: str | None = None


class BroadcastChannel:
    """Sends every message to every registered agent."""

    def __init__(self):
        self._subscribers: dict[str, list] = {}

    def register(self, agent_id: str):
        self._subscribers[agent_id] = []

    def broadcast(self, message: Message):
        """Deliver message to all agents except the sender."""
        for agent_id, inbox in self._subscribers.items():
            if agent_id != message.sender:
                inbox.append(message)

    def receive(self, agent_id: str) -> list[Message]:
        """Drain and return all pending messages for an agent."""
        messages = self._subscribers.get(agent_id, [])
        self._subscribers[agent_id] = []
        return messages
```

Broadcast is appropriate for status updates, phase transitions (“planning is complete, execution begins”), and system-wide announcements. It breaks down when agents are numerous or messages are frequent, because every agent must process every message regardless of relevance. In a system with ten agents exchanging updates every second, each agent processes nine messages per second, most of which it does not care about.

### Request/Reply

Request/reply is a directed, synchronous pattern. One agent sends a request to a specific agent and waits for a response. This is the most intuitive pattern: it mirrors function calls. Agent A asks Agent B a question. Agent B answers.

```
import asyncio
from collections import defaultdict


class RequestReplyBus:
    """Point-to-point request/reply between named agents."""

    def __init__(self):
        self._pending: dict[str, asyncio.Future] = {}
        self._inboxes: dict[str, asyncio.Queue] = defaultdict(asyncio.Queue)

    async def request(self, message: Message, timeout: float = 30.0) -> Message:
        """Send a request and wait for the reply."""
        future = asyncio.get_event_loop().create_future()
        self._pending[message.msg_id] = future
        await self._inboxes[message.content["to"]].put(message)

        try:
            return await asyncio.wait_for(future, timeout=timeout)
        except asyncio.TimeoutError:
            self._pending.pop(message.msg_id, None)
            raise TimeoutError(
                f"Agent '{message.content['to']}' did not reply "
                f"within {timeout}s to message {message.msg_id}"
            )

    async def reply(self, original_msg_id: str, response: Message):
        """Send a reply that resolves the caller's future."""
        future = self._pending.pop(original_msg_id, None)
        if future and not future.done():
            future.set_result(response)

    async def listen(self, agent_id: str) -> Message:
        """Block until a message arrives for this agent."""
        return await self._inboxes[agent_id].get()
```

Request/reply is appropriate when one agent needs specific information that only another agent can provide. It fails when the responding agent is slow, overloaded, or dead. The requesting agent blocks. Always set timeouts. Always handle the timeout case explicitly. A multi-agent system where one slow agent blocks all others is worse than a single-agent system.

### Publish/Subscribe

Pub/sub decouples senders from receivers. Agents publish messages to topics. Other agents subscribe to the topics they care about. A publisher does not know or care which agents receive its messages. A subscriber does not know or care which agent produced the message. This decoupling is the key advantage.

```
class PubSubBroker:
    """Topic-based publish/subscribe for agent messages."""

    def __init__(self):
        self._topics: dict[str, list[str]] = defaultdict(list)
        self._inboxes: dict[str, list[Message]] = defaultdict(list)

    def subscribe(self, agent_id: str, topic: str):
        """Subscribe an agent to a topic."""
        if agent_id not in self._topics[topic]:
            self._topics[topic].append(agent_id)

    def unsubscribe(self, agent_id: str, topic: str):
        """Remove an agent's subscription to a topic."""
        self._topics[topic] = [
            a for a in self._topics[topic] if a != agent_id
        ]

    def publish(self, topic: str, message: Message):
        """Publish a message to all subscribers of a topic."""
        for agent_id in self._topics.get(topic, []):
            if agent_id != message.sender:
                self._inboxes[agent_id].append(message)

    def receive(self, agent_id: str) -> list[Message]:
        """Drain and return all pending messages for an agent."""
        messages = self._inboxes.get(agent_id, [])
        self._inboxes[agent_id] = []
        return messages


# Usage: event-driven agent coordination
broker = PubSubBroker()
broker.subscribe("writer_agent", "research.complete")
broker.subscribe("editor_agent", "draft.complete")
broker.subscribe("qa_agent", "draft.complete")

# When the research agent finishes, writer is notified automatically
broker.publish("research.complete", Message(
    sender="research_agent",
    msg_type="event",
    content={"findings": "...", "sources": 14, "confidence": 0.87},
))
```

Pub/sub shines in event-driven architectures where agents react to changes in the system rather than being explicitly told what to do. It is the right pattern when new agent types will be added later. They just subscribe to the topics they care about, and no existing code changes. It fails when you need guaranteed delivery order or when you need to know that a specific agent received a specific message. Pub/sub is fire-and-forget by default.

![Diagram 1](/diagrams/agenticai/agent-communication-1.svg)

Figure 12-1. Three fundamental agent communication topologies: broadcast delivers to all, request/reply is directed and synchronous, and pub/sub decouples senders from receivers via named topics.

## 12.3 Shared State

Shared state is the alternative to message passing. Instead of agents sending messages to each other, they read from and write to a common data store. A blackboard, a shared document, a database row: the mechanism varies, but the principle is the same. Agents coordinate through a shared artifact rather than through direct communication.

```
import threading
from datetime import datetime


class SharedBlackboard:
    """Thread-safe shared state for multi-agent coordination."""

    def __init__(self):
        self._state: dict[str, Any] = {}
        self._history: list[dict] = []
        self._lock = threading.Lock()

    def write(self, key: str, value: Any, agent_id: str):
        """Write a value to the blackboard with provenance tracking."""
        with self._lock:
            old_value = self._state.get(key)
            self._state[key] = value
            self._history.append({
                "action": "write",
                "key": key,
                "old_value": old_value,
                "new_value": value,
                "agent": agent_id,
                "timestamp": datetime.utcnow().isoformat(),
            })

    def read(self, key: str, default: Any = None) -> Any:
        """Read a value from the blackboard."""
        with self._lock:
            return self._state.get(key, default)

    def read_all(self) -> dict:
        """Return a snapshot of the full state."""
        with self._lock:
            return dict(self._state)

    def history_for(self, key: str) -> list[dict]:
        """Return the write history for a specific key."""
        with self._lock:
            return [h for h in self._history if h["key"] == key]
```

The blackboard pattern is simple and powerful. Every agent can see the current state of the system. There is one source of truth. But simplicity hides real dangers.

**Race conditions.** Two agents read the same value, compute different updates, and write back. The last write wins, and the first agent’s work is silently discarded. Locks help but introduce contention. In LLM-based systems, where each agent call takes seconds, holding a lock for the duration of an LLM call serializes your entire system.

**Unbounded growth.** If agents write intermediate reasoning to the blackboard, it grows without bound. Other agents must process an increasingly large shared context, which degrades their performance and eventually exceeds context window limits.

**Implicit coupling.** Agents that communicate through shared state are coupled to the schema of that state. Change the key name from `status` to `phase`, and every agent that reads `status` silently gets `None`. There is no compiler to catch this. There is no type checker. The failure is silent.

> When to Use Shared State vs. Message Passing
> 
> Use shared state when agents need a consistent view of the world, such as a document being collaboratively edited, a plan being refined, or a set of facts being accumulated. Use message passing when agents need to trigger actions in other agents, request information, or react to events. Most real systems use both: shared state for the current truth (current plan, accumulated facts) and message passing for events and triggers (notifying agents that the state has changed and they should act).

## 12.4 Structured Message Formats

When agents communicate in free-form natural language, every message is an interpretation challenge. Consider an agent that sends: “I found some issues with the data. The revenue numbers look off for Q3, and there might be a problem with the customer counts too.” What exactly is the receiving agent supposed to do with this? Which revenue numbers? Off by how much? “Might be” a problem: is it or is it not?

Structured message formats eliminate this ambiguity by forcing agents to express information in a schema that both sender and receiver agree on.

```
from enum import Enum
from pydantic import BaseModel, Field


class Priority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AgentMessage(BaseModel):
    """Schema-validated inter-agent message."""
    msg_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    sender: str
    recipient: str | None = None   # None = broadcast
    topic: str
    msg_type: str                  # "request", "reply", "event", "error"
    priority: Priority = Priority.MEDIUM
    payload: dict
    reply_to: str | None = None
    timestamp: float = Field(default_factory=time.time)

    class Config:
        extra = "forbid"           # Reject unexpected fields


class FindingPayload(BaseModel):
    """Structured payload for a data-quality finding."""
    metric: str
    period: str
    expected_value: float
    actual_value: float
    deviation_pct: float
    confidence: float = Field(ge=0.0, le=1.0)
    recommendation: str


# Now the message is unambiguous
finding = AgentMessage(
    sender="analyst_agent",
    recipient="reviewer_agent",
    topic="data_quality",
    msg_type="event",
    priority=Priority.HIGH,
    payload=FindingPayload(
        metric="revenue",
        period="Q3-2025",
        expected_value=4_200_000,
        actual_value=3_870_000,
        deviation_pct=-7.86,
        confidence=0.92,
        recommendation="Re-pull source data from ERP; check currency conversion rates",
    ).model_dump(),
)
```

The structured version is longer, but it is unambiguous. The receiving agent knows exactly which metric, which period, the magnitude of the deviation, and what the sender recommends. No interpretation required. No information lost.

Three principles for message format design:

**Use enums for categories, not strings.** A `msg_type` that accepts any string will eventually contain “Request”, “request”, “req”, and “ask”. Enums prevent this drift.

**Make payloads typed per message type.** A request for data analysis has a different payload schema than a status update. Validate each payload against its expected schema. Reject messages that do not conform rather than attempting to parse them.

**Include provenance.** Every message should carry its sender, a unique ID, and a timestamp. Every reply should reference the message it replies to. Without this metadata, debugging a multi-agent conversation is impossible. You cannot trace which agent said what, when, or in response to what.

## 12.5 Agent Protocols

A protocol is a set of rules that governs how agents interact: who speaks when, what types of messages are valid at each stage, and how the interaction terminates. Without protocols, agents talk over each other, repeat themselves, or enter infinite loops where each agent keeps responding to the other’s last message.

```
from enum import Enum


class ProtocolPhase(str, Enum):
    PROPOSE = "propose"
    REVIEW = "review"
    REVISE = "revise"
    ACCEPT = "accept"
    REJECT = "reject"


class ConversationProtocol:
    """Enforces a propose-review-revise protocol between agents."""

    VALID_TRANSITIONS = {
        ProtocolPhase.PROPOSE: {ProtocolPhase.REVIEW},
        ProtocolPhase.REVIEW:  {ProtocolPhase.REVISE, ProtocolPhase.ACCEPT, ProtocolPhase.REJECT},
        ProtocolPhase.REVISE:  {ProtocolPhase.REVIEW},
        ProtocolPhase.ACCEPT:  set(),   # Terminal
        ProtocolPhase.REJECT:  set(),   # Terminal
    }

    def __init__(self, max_rounds: int = 5):
        self.phase = ProtocolPhase.PROPOSE
        self.round = 0
        self.max_rounds = max_rounds
        self.history: list[dict] = []

    def transition(self, next_phase: ProtocolPhase, agent_id: str, content: str) -> bool:
        """Attempt a phase transition. Returns True if valid."""
        if next_phase not in self.VALID_TRANSITIONS[self.phase]:
            raise ProtocolViolation(
                f"Invalid transition: {self.phase.value} -> {next_phase.value} "
                f"by {agent_id}. Valid: {self.VALID_TRANSITIONS[self.phase]}"
            )

        if next_phase == ProtocolPhase.REVIEW:
            self.round += 1
            if self.round > self.max_rounds:
                raise MaxRoundsExceeded(
                    f"Protocol exceeded {self.max_rounds} review rounds. "
                    f"Forcing termination."
                )

        self.history.append({
            "phase": next_phase.value,
            "agent": agent_id,
            "round": self.round,
            "content_preview": content[:200],
        })
        self.phase = next_phase
        return True

    @property
    def is_terminal(self) -> bool:
        return self.phase in {ProtocolPhase.ACCEPT, ProtocolPhase.REJECT}


class ProtocolViolation(Exception):
    pass

class MaxRoundsExceeded(Exception):
    pass
```

The protocol above enforces a propose-review-revise cycle. An agent proposes, another reviews, and the proposer either revises or the reviewer accepts or rejects. The transitions are explicit: you cannot skip from propose to accept, and you cannot revise without a review. The maximum round limit prevents infinite revision loops.

> Contract Net Protocol
> 
> The Contract Net Protocol (CNP), developed in the 1980s for distributed AI, remains one of the most practical agent interaction patterns. A manager broadcasts a task announcement. Agents evaluate their ability to perform the task and submit bids. The manager evaluates bids and awards the contract. CNP elegantly solves the task allocation problem in systems where agents have different capabilities and workloads. Modern multi-agent frameworks like AutoGen and CrewAI implement variations of this protocol under different names.

## 12.6 Conversation Management

Agent-to-agent conversations are not chat threads. They are structured workflows with memory constraints, context window budgets, and the ever-present risk of loops. Managing these conversations requires explicit mechanisms for threading, summarization, and termination.

### Threading and Context

When multiple conversations happen concurrently, for example Agent A reviewing a document with Agent B while simultaneously coordinating with Agent C on deployment, each conversation must maintain its own context. Cross-contamination between threads produces nonsensical behavior: the reviewer starts discussing deployment timelines, or the deployment coordinator comments on grammar.

```
class ConversationManager:
    """Manages threaded agent conversations with context budgets."""

    def __init__(self, max_context_messages: int = 20):
        self._threads: dict[str, list[Message]] = {}
        self._max_context = max_context_messages

    def create_thread(self, thread_id: str, participants: list[str]):
        """Initialize a new conversation thread."""
        self._threads[thread_id] = []

    def add_message(self, thread_id: str, message: Message):
        """Add a message to a thread, enforcing context budget."""
        thread = self._threads[thread_id]
        thread.append(message)

        # Summarize if context budget is exceeded
        if len(thread) > self._max_context:
            self._summarize_thread(thread_id)

    def get_context(self, thread_id: str) -> list[Message]:
        """Return the current context window for a thread."""
        return list(self._threads.get(thread_id, []))

    def _summarize_thread(self, thread_id: str):
        """Compress older messages into a summary, preserving recent ones."""
        thread = self._threads[thread_id]
        keep_recent = self._max_context // 2

        old_messages = thread[:-keep_recent]
        recent_messages = thread[-keep_recent:]

        summary_text = self._generate_summary(old_messages)
        summary_msg = Message(
            sender="system",
            msg_type="summary",
            content={"summary": summary_text, "messages_compressed": len(old_messages)},
        )
        self._threads[thread_id] = [summary_msg] + recent_messages

    def _generate_summary(self, messages: list[Message]) -> str:
        """Generate a structured summary of messages. In production,
        this calls an LLM with instructions to preserve key decisions,
        action items, and unresolved disagreements."""
        decisions = []
        for msg in messages:
            if isinstance(msg.content, dict) and msg.content.get("decision"):
                decisions.append(msg.content["decision"])
        return f"Prior context: {len(messages)} messages. Key decisions: {decisions}"
```

### Loop Detection

The most insidious failure in agent conversations is the infinite loop. Agent A asks Agent B to refine a plan. Agent B refines it and sends it back. Agent A finds a new issue and asks for another refinement. Agent B adjusts, creating a different issue. This cycle repeats forever, burning tokens and producing no useful output.

```
import hashlib


class LoopDetector:
    """Detects repetitive patterns in agent conversations."""

    def __init__(self, window_size: int = 6, similarity_threshold: float = 0.85):
        self._window_size = window_size
        self._threshold = similarity_threshold
        self._content_hashes: list[str] = []

    def check(self, content: str) -> bool:
        """Returns True if a loop is detected."""
        content_hash = hashlib.md5(content.encode()).hexdigest()[:12]

        # Exact repetition check
        if content_hash in self._content_hashes[-self._window_size:]:
            return True

        # Pattern check: are the last N messages cycling between
        # the same small set of content hashes?
        self._content_hashes.append(content_hash)
        if len(self._content_hashes) >= self._window_size:
            recent = self._content_hashes[-self._window_size:]
            unique_ratio = len(set(recent)) / len(recent)
            if unique_ratio < (1 - self._threshold):
                return True

        return False

    def reset(self):
        self._content_hashes.clear()
```

Loop detection should be a first-class concern, not an afterthought. Build it into your conversation manager and define what happens when a loop is detected: escalate to a supervisor agent, terminate the conversation with the best result so far, or inject a “change strategy” directive that forces the agents out of the rut.

## 12.7 Conflict Resolution

Agents disagree. A research agent finds evidence that contradicts a planning agent’s assumptions. Two coding agents propose different implementations of the same feature. A safety agent vetoes a marketing agent’s proposed copy. These conflicts are not bugs. They are a sign that the system is working. The question is how the system resolves them.

Four conflict resolution strategies, each appropriate for different situations:

**Hierarchy.** A supervisor agent has final authority. When agents disagree, the supervisor decides. This is the simplest strategy and works when one agent genuinely has more context or authority than others. It fails when the supervisor becomes a bottleneck or when the supervisor lacks the domain expertise to adjudicate.

**Voting.** Each agent casts a vote, and the majority wins. This works when agents have roughly equal expertise and the decision is binary. It fails when one agent has critical information that others lack. Majority rule can overrule the one agent that is actually right.

**Evidence-based arbitration.** Agents must support their position with evidence. A dedicated arbitrator agent evaluates the strength of each side’s evidence and decides. This is slower but produces better outcomes when the disagreement is factual rather than preferential.

```
class ConflictResolver:
    """Resolves disagreements between agents using configurable strategies."""

    def __init__(self, strategy: str = "hierarchy"):
        self.strategy = strategy

    def resolve(self, positions: list[dict], context: dict) -> dict:
        """
        Each position: {"agent": str, "stance": str, "evidence": list, "confidence": float}
        Returns: {"resolution": str, "rationale": str, "winning_agent": str}
        """
        if self.strategy == "hierarchy":
            authority = context.get("authority_order", [])
            for agent in authority:
                for pos in positions:
                    if pos["agent"] == agent:
                        return {"resolution": pos["stance"],
                                "rationale": f"Decided by authority: {agent}",
                                "winning_agent": agent}

        if self.strategy == "voting":
            weighted: dict[str, float] = {}
            for pos in positions:
                weighted[pos["stance"]] = weighted.get(pos["stance"], 0) + pos["confidence"]
            winner = max(weighted, key=weighted.get)
            agents_for = [p["agent"] for p in positions if p["stance"] == winner]
            return {"resolution": winner,
                    "rationale": f"Majority vote: {len(agents_for)}/{len(positions)}",
                    "winning_agent": agents_for[0]}

        if self.strategy == "evidence":
            scored = sorted(
                positions,
                key=lambda p: len(p.get("evidence", [])) * p["confidence"],
                reverse=True,
            )
            w = scored[0]
            return {"resolution": w["stance"],
                    "rationale": f"{w['agent']}: {len(w.get('evidence',[]))} evidence, "
                                 f"{w['confidence']:.0%} confidence",
                    "winning_agent": w["agent"]}

        # Fallback: highest confidence
        best = max(positions, key=lambda p: p["confidence"])
        return {"resolution": best["stance"],
                "rationale": f"Highest confidence: {best['confidence']:.0%}",
                "winning_agent": best["agent"]}
```

> Silent Disagreements Are Worse Than Loud Ones
> 
> The worst kind of conflict is one that never surfaces. When two agents hold contradictory beliefs but never exchange them, the system produces inconsistent outputs that are extremely hard to debug. Design your communication patterns so that agents must share their key assumptions explicitly. A planning agent should broadcast its constraints. A research agent should publish its findings. Conflicts that are detected can be resolved. Conflicts that are hidden propagate until they cause user-visible failures.

## 12.8 Putting It Together: A Communication Framework

Real multi-agent systems combine all the patterns above. Here is a minimal framework that wires together pub/sub messaging, shared state, structured messages, and conversation management into a coherent system.

```
class MultiAgentCommunicationFramework:
    """Unified framework combining message passing, shared state,
    protocols, and conversation management."""

    def __init__(self):
        self.pubsub = PubSubBroker()
        self.blackboard = SharedBlackboard()
        self.conversations = ConversationManager(max_context_messages=20)
        self.loop_detector = LoopDetector()
        self.protocols: dict[str, ConversationProtocol] = {}
        self._agents: dict[str, dict] = {}

    def register_agent(self, agent_id: str, capabilities: list[str],
                       subscriptions: list[str]):
        """Register an agent with its capabilities and topic subscriptions."""
        self._agents[agent_id] = {"capabilities": capabilities}
        for topic in subscriptions:
            self.pubsub.subscribe(agent_id, topic)

    def send(self, message: AgentMessage) -> None:
        """Route a message through the appropriate channel."""
        # Validate message format
        AgentMessage.model_validate(message.model_dump())

        # Check for loops in any active conversation
        thread_id = message.reply_to or message.msg_id
        if self.loop_detector.check(str(message.payload)):
            raise LoopDetected(f"Loop detected in thread {thread_id}")

        # Route based on recipient
        if message.recipient:
            # Direct message: use request/reply semantics
            self.conversations.add_message(thread_id, Message(
                sender=message.sender,
                content=message.payload,
                msg_type=message.msg_type,
                msg_id=message.msg_id,
            ))
        else:
            # No recipient: publish to topic
            self.pubsub.publish(message.topic, Message(
                sender=message.sender,
                content=message.payload,
                msg_type=message.msg_type,
                msg_id=message.msg_id,
            ))

        # Write key events to shared state for observability
        self.blackboard.write(
            f"last_message_{message.topic}",
            {"msg_id": message.msg_id, "sender": message.sender,
             "type": message.msg_type},
            agent_id=message.sender,
        )


class LoopDetected(Exception):
    pass
```

This framework is intentionally minimal. A production system would add persistent message queues, retry logic, dead-letter handling for failed messages, and observability hooks to trace every message through the system. But the core pattern is the same: route messages through typed channels, enforce protocols, detect loops, and maintain shared state for coordination.

## Project: Agent Messenger

Build a multi-agent communication system where at least three agents collaborate on a task using structured messages, a shared blackboard, and an explicit protocol. Your system must demonstrate at least two communication patterns (broadcast and pub/sub, or request/reply and shared state), include loop detection, and log every message with full provenance for post-hoc debugging.

### Requirements

1.  **Structured messages.** Define a Pydantic message schema with typed payloads. Every message must include sender, recipient (or topic), message type, priority, timestamp, and a unique ID. Reject malformed messages at send time.
2.  **Two communication patterns.** Implement at least two of: broadcast, request/reply, pub/sub. Demonstrate when each is used and why in your chosen domain.
3.  **Shared blackboard.** Implement a thread-safe shared state that agents use for coordination. Track write provenance (which agent wrote what, when) and support history queries.
4.  **Protocol enforcement.** Define a conversation protocol with explicit phase transitions and a maximum round limit. Demonstrate what happens when an agent violates the protocol and when the round limit is exceeded.
5.  **Loop detection.** Implement content-based loop detection that triggers after a configurable number of repetitive exchanges. Demonstrate the detection firing and the system recovering gracefully.
6.  **Observability.** Log every message, state change, and protocol transition. Produce a conversation trace that can be printed or visualized to show the full history of agent interactions.

### Domain Variants

Code Review Pipeline Tech / Software: Agents review code for style, security, performance, then negotiate a final verdict

Clinical Case Conference Healthcare: Specialist agents discuss diagnosis and treatment, resolve conflicting recommendations

Investment Committee Finance: Analyst agents debate buy/sell/hold, present evidence, vote on final recommendation

Essay Workshop Education: Agents take roles of writer, critic, and fact-checker to collaboratively improve a draft

Product Listing Optimizer E-commerce: SEO, copywriting, and compliance agents negotiate product descriptions

Contract Negotiation Legal: Agents represent parties, exchange proposals, flag risks, converge on acceptable terms

## Summary

Agent communication is the infrastructure that determines whether a multi-agent system behaves as a coordinated team or a collection of individuals working at cross-purposes. The three fundamental message passing patterns, broadcast, request/reply, and pub/sub, each solve specific coordination problems and introduce specific failure modes. Shared state provides a single source of truth but demands careful concurrency management. Structured message formats eliminate the ambiguity that natural language introduces, ensuring that information survives transmission without distortion. Protocols enforce interaction rules that prevent agents from talking over each other, looping forever, or deadlocking. Conversation management keeps agent dialogues within context budgets and detects repetitive cycles before they waste resources. Conflict resolution transforms disagreements from system failures into decision points with explicit strategies and auditable outcomes.

-   Message passing patterns are not interchangeable. Broadcast works for announcements to small groups, request/reply for directed information needs, and pub/sub for event-driven systems where new agents can subscribe without changing existing code. Choose based on your coupling and delivery requirements, not convenience.
-   Shared state and message passing are complementary, not competing. Use shared state for the current truth (plans, accumulated facts, decisions) and message passing for events and triggers. Most production multi-agent systems use both.
-   Structured message formats with typed payloads, unique IDs, and provenance metadata are not over-engineering. They are the minimum required infrastructure for debugging multi-agent conversations. Free-form natural language between agents degrades information at every hop.
-   Protocols with explicit phase transitions and round limits are the primary defense against infinite loops and deadlocks. Build termination conditions into every agent interaction, and enforce them at the framework level rather than trusting individual agents to self-terminate.
-   Conflict resolution must be an explicit, configurable system component, not an emergent behavior. Silent disagreements between agents produce the hardest-to-debug failures. Design communication patterns that force assumptions to surface so conflicts can be detected and resolved with auditable strategies.

### Exercises

Conceptual

**Pattern selection.** You are building a multi-agent system with eight agents that process incoming customer support tickets. Three agents classify tickets, two agents draft responses, two agents review drafts, and one agent handles escalation. For each pair of interacting agent types, identify the most appropriate communication pattern (broadcast, request/reply, pub/sub, or shared state) and justify your choice. What changes if the system scales to 50 agents?

Coding

**Deadlock breaker.** Implement a deadlock detection mechanism for a request/reply system. Two agents can deadlock if Agent A sends a request to Agent B and waits, while Agent B has already sent a request to Agent A and is also waiting. Your solution should detect this circular dependency within 5 seconds and break it by canceling the lower-priority request. Write tests that demonstrate both the detection and the resolution.

Design

**Cross-system agent federation.** Two organizations each run their own multi-agent systems and want their agents to collaborate on a joint project. Design a federation protocol that addresses: message format translation between the two systems, trust boundaries (which agents can communicate across organizations), rate limiting to prevent one system from overwhelming the other, and audit logging for cross-boundary messages. Sketch the gateway architecture and the message flow for a typical cross-system request.