---
title: "Multi-Hop Reasoning"
slug: "multi-hop-reasoning"
description: >-
  How to answer questions that require traversing multiple
  relationships in a knowledge graph. Covers question decomposition,
  chain-of-traversal reasoning, combining graph paths with LLM
  synthesis, a complete multi-hop reasoning agent with step-by-step
  trace, and performance strategies for deep traversals.
section: "graph-ai"
order: 12
part: "Part 04 Graph-Powered AI"
badges:
  - "Multi-hop"
  - "Query Decomposition"
  - "Reasoning Chains"
---

# Multi-Hop Reasoning

Who approved the vendor that supplies the component that failed the safety test? That's 4 hops.

## 01. What Multi-Hop Means


![Diagram 1](/diagrams/graph-ai/ch12-01.svg)
A hop is a single relationship traversal. "Who manages Alice?" is 1 hop — you follow one MANAGES relationship from Alice to her manager. "Who manages Alice's manager?" is 2 hops. "Who approved the vendor that supplies the component that failed the safety test?" is 4 hops:

```
SafetyTest --[FAILED]--> Component --[SUPPLIED_BY]--> Vendor
    --[APPROVED_BY]--> Approver
```

Multi-hop questions are the questions that knowledge graphs were built to answer. They are also the questions that are hardest for LLMs to handle alone, because each hop requires looking up specific data — and the LLM does not have that data in its weights or its context window.

> **Think of it like this:** Imagine someone asks you "What is the name of the architect who designed the building where the company that makes your phone's processor is headquartered?" You know who makes your phone's processor (maybe TSMC or Qualcomm), but you probably do not know their headquarters' architect. Each hop in that question requires a separate lookup in a different knowledge domain. That is exactly what multi-hop graph traversal does — it chains together lookups, where the output of each lookup feeds the input of the next.

## 02. Why This Is Hard for LLMs Alone

LLMs without graph access attempt multi-hop reasoning in one of two ways, both unreliable:

### Failure Mode 1: Guessing the Chain

The LLM tries to answer the full chain from its training data. "Who approved the vendor that supplies the failed component?" The LLM might generate a plausible-sounding answer — "Based on typical procurement processes, the VP of Supply Chain likely approved..." — but it is fabricating, not reasoning. It has no access to your specific approval records.

### Failure Mode 2: Partial Retrieval

With standard RAG, the LLM retrieves chunks related to the question. It might find a chunk mentioning the failed component and another chunk mentioning vendor approvals. But the chunks do not connect — they come from different documents, different time periods, maybe different contexts. The LLM cannot bridge the gap because the connection exists in the graph structure, not in any single text passage.

### What the Graph Provides

The graph makes multi-hop reasoning deterministic. Each hop is a concrete traversal with a concrete result:

```
Hop 1: MATCH (t:Event {name: "Safety Test ST-2024-019"})
           -[:CAUSED_BY]->(c:Component)
        → Component: "Valve X-200"

Hop 2: MATCH (c:Component {name: "Valve X-200"})
           <-[:SUPPLIES]-(v:Organization)
        → Vendor: "Acme Industrial"

Hop 3: MATCH (v:Organization {name: "Acme Industrial"})
           <-[:APPROVED_BY]-(d:Document)
        → Document: "Vendor Approval VA-2023-088"

Hop 4: MATCH (d:Document {name: "Vendor Approval VA-2023-088"})
           -[:APPROVED_BY]->(p:Person)
        → Person: "Sarah Chen, VP Procurement"
```

Each hop is verifiable. Each result is traceable. The final answer — "Sarah Chen approved the vendor" — comes with a complete chain of evidence.

## 03. Decomposing Multi-Hop Questions

The first challenge is breaking a natural language question into individual hops. This is where the LLM shines — understanding language structure — while the graph handles the data lookups.

```python
import anthropic
import json

client = anthropic.Anthropic()

DECOMPOSITION_PROMPT = """You are a question decomposer. Given a
complex question, break it into a sequence of simple sub-questions
where each sub-question can be answered with a single graph
traversal.

GRAPH SCHEMA:
- Person (name, title, department)
- Organization (name, org_type, status)
- Component (name, part_number, category, status)
- Document (name, doc_type, effective_date)
- Event (name, date, event_type, severity)
- Regulation (name, jurisdiction)
- Location (name, city, state)

RELATIONSHIPS:
- WORKS_AT: Person -> Organization
- MANAGES: Person -> Person
- REPORTS_TO: Person -> Person
- SUPPLIES: Organization -> Component
- APPROVED_BY: Document/Component -> Person
- COMPLIES_WITH: Component -> Regulation
- LOCATED_IN: Organization/Person -> Location
- CAUSED_BY: Event -> Component/Event
- DEPENDS_ON: Component -> Component
- REFERENCES: Document -> Document

RULES:
1. Each sub-question should reference the result of a previous
   sub-question using {{step_N}} notation.
2. The final sub-question should produce the answer.
3. Include the expected entity type for each answer.

QUESTION: {question}

Return JSON:
{{
  "steps": [
    {{
      "step": 1,
      "question": "simple sub-question",
      "expected_type": "Person|Organization|Component|...",
      "cypher_hint": "relationship pattern to use"
    }}
  ]
}}"""


def decompose_question(question: str) -> list[dict]:
    """Break a multi-hop question into sub-questions."""
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": DECOMPOSITION_PROMPT.format(
                question=question
            )
        }]
    )

    text = response.content[0].text
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    result = json.loads(text)
    return result["steps"]
```

### Example Decomposition

**Question:** "Which regulations apply to the components supplied by the vendor that was flagged in last month's audit?"

**Decomposition:**

| Step | Sub-question | Expected Type | Cypher Hint |
| --- | --- | --- | --- |
| 1 | Which audit event from last month flagged a vendor? | Event, Organization | (e:Event)-[:AFFECTED]->(v:Organization) |
| 2 | Which components does {step_1_vendor} supply? | Component | (v:Organization)-[:SUPPLIES]->(c:Component) |
| 3 | Which regulations do {step_2_components} need to comply with? | Regulation | (c:Component)-[:COMPLIES_WITH]->(r:Regulation) |

## 04. Chain-of-Traversal: Step-by-Step Graph Walking

Chain-of-traversal is the graph equivalent of chain-of-thought. Instead of reasoning through logic steps, the agent walks through graph steps — executing one traversal, observing the result, then executing the next traversal using the result.

```python
from neo4j import GraphDatabase
from dataclasses import dataclass, field

driver = GraphDatabase.driver(
    "bolt://localhost:7687",
    auth=("neo4j", "password")
)


@dataclass
class TraversalStep:
    """One step in a chain-of-traversal."""
    step_number: int
    question: str
    cypher_query: str
    results: list[dict] = field(default_factory=list)
    interpretation: str = ""


@dataclass
class TraversalChain:
    """A complete multi-hop reasoning chain."""
    original_question: str
    steps: list[TraversalStep] = field(default_factory=list)
    final_answer: str = ""


def generate_cypher_for_step(
    step: dict,
    previous_results: dict
) -> str:
    """Generate a Cypher query for a decomposed step,
    substituting results from previous steps."""
    # Build context from previous results
    context_parts = []
    for step_num, result in previous_results.items():
        entities = [r.get("name", str(r)) for r in result]
        context_parts.append(
            f"Step {step_num} found: {', '.join(entities)}"
        )

    context = "\n".join(context_parts) if context_parts else "None"

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""Generate a Cypher query for this step.

Previous results:
{context}

Current step: {step['question']}
Expected result type: {step['expected_type']}
Hint: {step.get('cypher_hint', 'none')}

Return ONLY the Cypher query, no explanation.
Use the entity names from previous results where needed.
Always RETURN name and relevant properties.
Add LIMIT 20."""
        }]
    )

    query = response.content[0].text.strip()
    if query.startswith("```"):
        query = query.split("```")[1]
        if query.startswith("cypher"):
            query = query[6:]
        query = query.strip()
    return query


def execute_chain(question: str) -> TraversalChain:
    """Execute a full multi-hop reasoning chain."""
    chain = TraversalChain(original_question=question)

    # Step 1: Decompose the question
    steps = decompose_question(question)
    print(f"Decomposed into {len(steps)} steps\n")

    previous_results = {}

    for step_def in steps:
        step_num = step_def["step"]
        print(f"--- Step {step_num}: {step_def['question']} ---")

        # Generate Cypher for this step
        cypher = generate_cypher_for_step(
            step_def, previous_results
        )
        print(f"Cypher: {cypher}")

        # Execute
        step = TraversalStep(
            step_number=step_num,
            question=step_def["question"],
            cypher_query=cypher
        )

        try:
            with driver.session() as session:
                result = session.run(cypher)
                records = [dict(r) for r in result]
                step.results = records
                previous_results[step_num] = records
                print(f"Results: {len(records)} records")
                for r in records[:5]:
                    print(f"  {r}")
        except Exception as e:
            step.results = []
            step.interpretation = f"Query failed: {e}"
            print(f"Error: {e}")

        chain.steps.append(step)
        print()

    # Synthesize final answer
    chain.final_answer = synthesize_answer(chain)
    return chain


def synthesize_answer(chain: TraversalChain) -> str:
    """Synthesize a natural language answer from the
    traversal chain."""
    # Build a summary of all steps and results
    step_summaries = []
    for step in chain.steps:
        results_text = "\n".join(
            f"  - {r}" for r in step.results[:10]
        )
        step_summaries.append(
            f"Step {step.step_number}: {step.question}\n"
            f"Query: {step.cypher_query}\n"
            f"Results:\n{results_text}"
        )

    all_steps = "\n\n".join(step_summaries)

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""Based on this chain of graph traversals,
provide a clear, complete answer to the original question.

Original question: {chain.original_question}

Traversal chain:
{all_steps}

Provide:
1. A direct answer to the question
2. The evidence chain (how each step connects to the next)
3. Any caveats or limitations in the data"""
        }]
    )

    return response.content[0].text
```

## 05. Combining Graph Paths with LLM Synthesis

Sometimes you do not need to decompose — you can traverse the full path in a single Cypher query and then use the LLM to interpret the result.

```python
def single_query_multi_hop(
    question: str
) -> str:
    """For questions where the full path can be queried at once."""
    # Ask the LLM to generate a single multi-hop Cypher query
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""Generate a single Cypher query that
answers this question by traversing multiple relationships.

SCHEMA:
- Person, Organization, Component, Document, Event, Regulation,
  Location
- WORKS_AT, MANAGES, REPORTS_TO, SUPPLIES, APPROVED_BY,
  COMPLIES_WITH, LOCATED_IN, CAUSED_BY, DEPENDS_ON, REFERENCES

Question: {question}

Return ONLY the Cypher query.
Use variable-length paths where the depth is unknown.
LIMIT to 20 results."""
        }]
    )

    cypher = response.content[0].text.strip()
    if "```" in cypher:
        cypher = cypher.split("```")[1]
        if cypher.startswith("cypher"):
            cypher = cypher[6:]
        cypher = cypher.strip()

    print(f"Query: {cypher}\n")

    # Execute
    with driver.session() as session:
        try:
            result = session.run(cypher)
            records = [dict(r) for r in result]
        except Exception as e:
            return f"Query failed: {e}. Falling back to " \
                   f"step-by-step decomposition."

    if not records:
        return "No results found for this traversal."

    # Format results for LLM interpretation
    results_text = "\n".join(
        str(r) for r in records[:20]
    )

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""Based on these graph traversal results,
answer the original question in plain language.

Question: {question}
Results: {results_text}

Provide a clear answer with the evidence chain."""
        }]
    )

    return response.content[0].text
```

### When to Decompose vs. Single Query

| Approach | When to Use | Advantage | Risk |
| --- | --- | --- | --- |
| **Single Cypher query** | Path is predictable, schema is simple | Faster (one query) | LLM may generate invalid Cypher |
| **Step-by-step decomposition** | Path is unknown, logic branches, or depth varies | More reliable, traceable | Slower (multiple queries + LLM calls) |
| **Hybrid** | Start with single query, fall back to decomposition on failure | Best of both | More complex to implement |

## 06. The Multi-Hop Reasoning Agent

Here is a complete agent that handles multi-hop questions with a step-by-step trace:

```python
from dataclasses import dataclass


@dataclass
class ReasoningTrace:
    """Complete trace of multi-hop reasoning."""
    question: str
    hop_count: int
    steps: list[dict]
    answer: str
    confidence: str


def multi_hop_agent(question: str) -> ReasoningTrace:
    """Full multi-hop reasoning agent with trace."""

    # Classify the question complexity
    complexity = classify_complexity(question)
    print(f"Question complexity: {complexity['hops']} hops "
          f"({complexity['strategy']})\n")

    if complexity["hops"] <= 1:
        # Simple lookup — no decomposition needed
        return simple_lookup(question)

    if complexity["strategy"] == "single_query":
        # Try single Cypher first
        answer = single_query_multi_hop(question)
        if "Query failed" not in answer:
            return ReasoningTrace(
                question=question,
                hop_count=complexity["hops"],
                steps=[{"type": "single_query",
                        "answer": answer}],
                answer=answer,
                confidence="high"
            )

    # Fall back to decomposition
    chain = execute_chain(question)

    return ReasoningTrace(
        question=question,
        hop_count=len(chain.steps),
        steps=[
            {
                "step": s.step_number,
                "question": s.question,
                "query": s.cypher_query,
                "results": s.results[:5],
                "result_count": len(s.results)
            }
            for s in chain.steps
        ],
        answer=chain.final_answer,
        confidence="high" if all(
            s.results for s in chain.steps
        ) else "low"
    )


def classify_complexity(question: str) -> dict:
    """Estimate question complexity and best strategy."""
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=200,
        messages=[{
            "role": "user",
            "content": f"""Estimate the graph traversal complexity
of this question.

Question: "{question}"

Return JSON:
{{
  "hops": <estimated number of relationship traversals>,
  "strategy": "simple_lookup|single_query|decompose",
  "reasoning": "<one sentence>"
}}"""
        }]
    )

    text = response.content[0].text
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    return json.loads(text)


def simple_lookup(question: str) -> ReasoningTrace:
    """Handle 1-hop questions with a direct query."""
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=300,
        messages=[{
            "role": "user",
            "content": f"""Generate a simple Cypher query for:
"{question}"

Schema: Person, Organization, Component, Document, Event,
Regulation, Location with standard relationships.

Return ONLY the Cypher query."""
        }]
    )

    cypher = response.content[0].text.strip()
    if "```" in cypher:
        cypher = cypher.split("```")[1]
        if cypher.startswith("cypher"):
            cypher = cypher[6:]
        cypher = cypher.strip()

    with driver.session() as session:
        try:
            result = session.run(cypher)
            records = [dict(r) for r in result]
        except Exception as e:
            records = []

    answer = "\n".join(str(r) for r in records) if records \
        else "No results found."

    return ReasoningTrace(
        question=question,
        hop_count=1,
        steps=[{
            "step": 1,
            "query": cypher,
            "results": records[:10],
            "result_count": len(records)
        }],
        answer=answer,
        confidence="high" if records else "low"
    )
```

## 07. Performance Considerations

Multi-hop queries can be expensive. Here is how to keep them fast.

### Depth Limits

Every additional hop can multiply the number of paths explored. Set hard limits based on your use case:

```python
# Recommended depth limits by use case
DEPTH_LIMITS = {
    "org_hierarchy": 10,    # Org charts can be deep but narrow
    "supply_chain": 5,      # Supply chains fan out quickly
    "dependency_graph": 4,  # IT dependencies cascade fast
    "approval_chain": 6,    # Approval chains are linear
    "impact_analysis": 3,   # Impact fans out exponentially
    "general": 4            # Default for unknown patterns
}
```

### Why Deep Traversals Explode

The number of paths explored grows exponentially with depth for highly connected graphs:

| Depth | Avg Degree 5 | Avg Degree 10 | Avg Degree 50 |
| --- | --- | --- | --- |
| 1 hop | 5 paths | 10 paths | 50 paths |
| 2 hops | 25 paths | 100 paths | 2,500 paths |
| 3 hops | 125 paths | 1,000 paths | 125,000 paths |
| 4 hops | 625 paths | 10,000 paths | 6.25M paths |
| 5 hops | 3,125 paths | 100,000 paths | 312M paths |

> **Think of it like this:** Each hop is like adding another round to a phone tree. If everyone in the tree calls 10 people, after 3 rounds you have contacted 1,000 people. After 5 rounds, 100,000. The graph database has to explore all those paths to find the answer. Limiting depth is not laziness — it is survival.

### Caching Intermediate Results

When the same entities appear in multiple questions, cache their neighborhoods:

```python
from functools import lru_cache
from datetime import datetime, timedelta

# Simple in-memory cache with TTL
_cache = {}
_cache_ttl = timedelta(minutes=30)


def cached_neighborhood(
    entity_name: str,
    depth: int = 2
) -> list[dict]:
    """Cache the neighborhood of frequently queried entities."""
    cache_key = f"{entity_name}:{depth}"

    if cache_key in _cache:
        result, timestamp = _cache[cache_key]
        if datetime.now() - timestamp < _cache_ttl:
            return result

    with driver.session() as session:
        result = session.run("""
            MATCH (n)
            WHERE toLower(n.name) = toLower($name)
            WITH n LIMIT 1
            MATCH path = (n)-[*1..{depth}]-(connected)
            RETURN connected.name AS name,
                   labels(connected)[0] AS type,
                   min(length(path)) AS distance,
                   [r IN relationships(path) |
                    type(r)] AS via
            ORDER BY distance
            LIMIT 100
        """.format(depth=depth), name=entity_name)

        records = [dict(r) for r in result]

    _cache[cache_key] = (records, datetime.now())
    return records
```

### Pruning Traversals

Not all relationships are equal. When traversing, you can prune low-value paths:

```cypher
// Instead of traversing ALL relationships:
MATCH path = (start)-[*1..4]-(end)

// Traverse only relevant relationship types:
MATCH path = (start)
  -[:SUPPLIES|DEPENDS_ON|CONTAINS*1..4]-
  (end)

// Or prune by node properties:
MATCH path = (start)-[*1..4]-(end)
WHERE ALL(n IN nodes(path) WHERE n.status <> 'inactive')
```

## 08. Hop Count by Use Case

This table provides a reference for how many hops typical questions require, organized from simple to complex:

| Hops | Use Case | Example Question | Typical Latency |
| --- | --- | --- | --- |
| 1 | **Direct lookup** | "Who manages the NYC office?" | < 100ms |
| 2 | **One-step chain** | "Which vendors supply parts for Product X?" | < 200ms |
| 2 | **Peer query** | "Who else reports to Alice's manager?" | < 200ms |
| 3 | **Supply trace** | "Where are the components in Building 7 manufactured?" | < 500ms |
| 3 | **Approval chain** | "Who approved the contract for Vendor X?" | < 500ms |
| 4 | **Root cause** | "Who approved the vendor that supplies the failed part?" | < 1s |
| 4 | **Impact cascade** | "If Supplier A fails, which products are affected?" | < 1s |
| 5 | **Compliance trace** | "Which regulations apply to the components in the product that Customer Y bought?" | 1-3s |
| 6 | **Full investigation** | "Trace the complete chain from safety incident to the person who approved the original vendor selection" | 2-5s |
| 6+ | **Cross-domain analysis** | "Which customers are at risk from the regulatory change that affects components from the supplier being investigated for fraud?" | 5-15s |

## 09. Putting It All Together

Here is a complete example of multi-hop reasoning in action:

```python
# Example: Full trace from incident to responsible party
question = (
    "Who approved the vendor that supplies the component "
    "that caused safety incident SI-2024-003?"
)

trace = multi_hop_agent(question)

print(f"Question: {trace.question}")
print(f"Hops: {trace.hop_count}")
print(f"Confidence: {trace.confidence}")
print(f"\nReasoning chain:")
for step in trace.steps:
    print(f"\n  Step {step['step']}: {step.get('question', '')}")
    print(f"  Query: {step['query']}")
    print(f"  Found: {step['result_count']} results")
    for r in step.get('results', [])[:3]:
        print(f"    - {r}")

print(f"\nAnswer: {trace.answer}")
```

**Expected output:**

```
Question: Who approved the vendor that supplies the component
  that caused safety incident SI-2024-003?
Hops: 4
Confidence: high

Reasoning chain:

  Step 1: Which component caused safety incident SI-2024-003?
  Query: MATCH (e:Event {name: 'SI-2024-003'})-[:CAUSED_BY]->
         (c:Component) RETURN c.name AS name
  Found: 1 results
    - {'name': 'Valve X-200'}

  Step 2: Which vendor supplies the Valve X-200?
  Query: MATCH (v:Organization)-[:SUPPLIES]->
         (c:Component {name: 'Valve X-200'}) RETURN v.name AS name
  Found: 1 results
    - {'name': 'Acme Industrial'}

  Step 3: Which approval document covers Acme Industrial?
  Query: MATCH (d:Document)-[:REFERENCES]->
         (v:Organization {name: 'Acme Industrial'})
         WHERE d.doc_type = 'vendor_approval'
         RETURN d.name AS name
  Found: 1 results
    - {'name': 'Vendor Approval VA-2023-088'}

  Step 4: Who approved document VA-2023-088?
  Query: MATCH (d:Document {name: 'Vendor Approval VA-2023-088'})
         -[:APPROVED_BY]->(p:Person) RETURN p.name AS name,
         p.title AS title
  Found: 1 results
    - {'name': 'Sarah Chen', 'title': 'VP Procurement'}

Answer: Sarah Chen (VP Procurement) approved Acme Industrial
as a vendor (via Vendor Approval VA-2023-088). Acme Industrial
supplies the Valve X-200, which was the component that caused
safety incident SI-2024-003.

The complete evidence chain:
SI-2024-003 → Valve X-200 → Acme Industrial → VA-2023-088
→ Sarah Chen
```

## 10. Chapter Checklist

Before moving to the next chapter, make sure you can answer these questions:

- [ ] Can you explain what multi-hop reasoning is and why LLMs cannot do it alone?
- [ ] Can you decompose a multi-hop question into single-hop sub-questions?
- [ ] Can you implement chain-of-traversal reasoning with intermediate results?
- [ ] Can you decide when to use a single Cypher query vs. step-by-step decomposition?
- [ ] Can you set appropriate depth limits for different use cases?
- [ ] Can you build a complete multi-hop agent with a step-by-step trace?

Multi-hop reasoning is where knowledge graphs and LLMs complement each other most powerfully. The graph provides deterministic, traceable traversal through connected data. The LLM provides natural language understanding, question decomposition, and answer synthesis. Together, they answer questions that neither could handle alone.
