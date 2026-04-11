---
title: "The AI Connection"
slug: "the-ai-connection"
description: >-
  Why vector search alone cannot answer relationship questions, how
  knowledge graphs give AI structured memory, and the three patterns
  for combining graphs with LLMs: graph-enhanced RAG, graph-aware
  agents, and graph-based memory.
section: "graph-ai"
order: 3
part: "Part 01 Why Graphs Matter Now"
badges:
  - "GraphRAG"
  - "Knowledge Graphs"
  - "AI Integration"
---

# The AI Connection

Your RAG chatbot can answer "what is our refund policy?" but fails at "who approved the vendor that supplies the part that failed?" -- here's why.

## 01. The Question That Breaks Your Chatbot


![Diagram 1](/diagrams/graph-ai/ch03-01.svg)

![Diagram 2](/diagrams/graph-ai/ch03-02.svg)
Let us set the scene. Your team has built a RAG (Retrieval-Augmented Generation) chatbot. It indexes your company's documentation — policies, procedures, product specs, vendor contracts — into a vector database. Users ask questions, the system retrieves relevant document chunks, feeds them to an LLM, and gets answers. It works well for straightforward questions.

"What is our refund policy for enterprise customers?" -- The chatbot nails this. It finds the policy document, retrieves the relevant section, and gives an accurate answer.

"Who approved the vendor that supplies the part that failed in the Q3 incident?" -- The chatbot fumbles. It might return fragments from an incident report, a vendor list, and an approval workflow document, but it cannot trace the chain. It does not know that Vendor A supplies Part B, that Part B was involved in Incident C, or that Manager D approved the contract with Vendor A. These connections exist in your organization's data, but they are not in any single document.

This is not a limitation of the LLM. It is a limitation of the retrieval mechanism. Vector search finds documents that are **semantically similar** to a question. It does not find documents that are **structurally connected** to each other in ways that answer the question.

> **Think of it like this:** Vector search is like a librarian who finds books on similar topics. Ask for "refund policy" and they bring you the refund policy manual. Ask "who approved the vendor that supplies the part that failed?" and they bring you three different books — one on vendor approvals, one on parts catalogs, and one on incident reports — but they cannot tell you how the information across those books connects. A knowledge graph is the librarian's index card system that tracks which books reference which other books, and how.

## 02. Why Vector Search Misses Relationships

To understand why this gap exists, you need to understand what vector search actually does.

When you embed a document into a vector database, you convert the text into a high-dimensional numerical representation — a vector. Documents with similar meaning end up close together in this vector space. When a user asks a question, the question is also converted to a vector, and the system finds the nearest document vectors.

This works well for **semantic similarity**: finding documents that talk about the same topic. It fails for **structural relationships** because:

1. **Relationships span documents.** The fact that Vendor A supplies Part B might be in a procurement database. The fact that Part B failed might be in an incident report. The fact that Manager D approved the Vendor A contract might be in an approval log. Vector search finds each document independently — it has no mechanism to chain them together.

2. **Embeddings lose relational structure.** When you embed the sentence "Acme Corp supplies hydraulic valve HV-200," the vector captures the semantic meaning — something about a company and a part. But it does not capture the structured fact `(Acme Corp)-[:SUPPLIES]->(HV-200)` in a way that can be traversed.

3. **Multi-hop questions require traversal, not retrieval.** The question "who approved the vendor that supplies the part that failed?" requires four hops: Failed Part -> Supplied By -> Vendor -> Approved By -> Manager. Vector search retrieves documents; it does not traverse paths.

Here is a comparison:

| Capability | Vector Search | Knowledge Graph | Combined |
| --- | --- | --- | --- |
| "What is our refund policy?" | Excellent | Possible but overkill | Excellent |
| "Summarize this document" | Excellent | Not applicable | Excellent |
| "Find similar contracts" | Excellent | Moderate | Excellent |
| "Who approved Vendor X?" | Poor (needs exact doc) | Excellent (direct traversal) | Excellent |
| "What is the supply chain for Part Y?" | Poor | Excellent | Excellent |
| "Show all entities affected if System Z fails" | Very poor | Excellent | Excellent |
| "What do our policies say about X, considering the org hierarchy?" | Poor | Excellent | Excellent |

The pattern is clear: vector search excels at content-based questions. Knowledge graphs excel at relationship-based questions. Most real enterprise questions require both.

## 03. Knowledge Graphs as Structured Memory for AI

A knowledge graph is a graph database populated with structured facts about a domain. Instead of storing documents, it stores entities and the relationships between them.

Here is what a portion of an enterprise knowledge graph might look like:

```cypher
// Entities
CREATE (acme:Vendor {name: 'Acme Corp', risk_rating: 'Medium'})
CREATE (hv200:Part {part_id: 'HV-200', name: 'Hydraulic Valve'})
CREATE (inc_q3:Incident {id: 'INC-2025-Q3-047', severity: 'Critical'})
CREATE (dave:Employee {name: 'Dave Kim', title: 'Procurement Manager'})
CREATE (contract:Contract {id: 'CTR-2024-1138', signed_date: date('2024-06-15')})

// Relationships
CREATE (acme)-[:SUPPLIES]->(hv200)
CREATE (hv200)-[:INVOLVED_IN]->(inc_q3)
CREATE (dave)-[:APPROVED]->(contract)
CREATE (contract)-[:GOVERNS_SUPPLY_FROM]->(acme)
```

Now the chatbot question "who approved the vendor that supplies the part that failed in the Q3 incident?" becomes a graph traversal:

```cypher
MATCH (inc:Incident {id: 'INC-2025-Q3-047'})
      <-[:INVOLVED_IN]-(part:Part)
      <-[:SUPPLIES]-(vendor:Vendor)
      <-[:GOVERNS_SUPPLY_FROM]-(contract:Contract)
      <-[:APPROVED]-(approver:Employee)
RETURN approver.name, vendor.name, part.name, inc.id
```

Result: Dave Kim approved the contract with Acme Corp, which supplies Hydraulic Valve HV-200, which was involved in incident INC-2025-Q3-047. Four hops, one query, milliseconds.

> **Think of it like this:** A vector database gives your AI a very good memory for *what things are*. A knowledge graph gives your AI a very good memory for *how things connect*. An AI with both is like an employee who has read all the company documentation AND understands the organizational chart, the supply chain, and the approval workflows.

## 04. GraphRAG: Microsoft's Approach

In early 2024, Microsoft Research published a paper and open-source library called GraphRAG that formalized one approach to combining graphs with RAG. The idea is straightforward:

1. **Build a knowledge graph from your documents.** Use an LLM to extract entities and relationships from unstructured text, and store them in a graph.
2. **Create community summaries.** Use graph algorithms (like Leiden community detection) to find clusters of related entities, then generate summary descriptions of each cluster.
3. **At query time, search both the graph and the summaries.** For local questions (about specific entities), traverse the graph directly. For global questions (about themes and patterns across the corpus), search the community summaries.

This two-level approach addresses a specific weakness of standard RAG: global questions. If you ask "what are the main themes across all customer complaints?" standard RAG retrieves a few complaint documents, but it cannot synthesize across all of them. GraphRAG's community summaries provide pre-computed answers to these high-level questions.

### How GraphRAG Works — Step by Step

```
Step 1: Document Ingestion
┌─────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  Documents   │ ──> │  LLM Entity  │ ──> │  Knowledge Graph     │
│  (raw text)  │     │  Extraction  │     │  (nodes + relations) │
└─────────────┘     └──────────────┘     └──────────────────────┘

Step 2: Community Detection
┌──────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Knowledge Graph     │ ──> │  Leiden/Louvain   │ ──> │  Community      │
│  (nodes + relations) │     │  Algorithm        │     │  Summaries      │
└──────────────────────┘     └──────────────────┘     └─────────────────┘

Step 3: Query Routing
┌──────────────┐     ┌──────────────────────┐
│  User Query  │ ──> │  Local question?      │
└──────────────┘     │  → Graph traversal    │
                     │  Global question?     │
                     │  → Community summaries│
                     └──────────────────────┘
```

### When GraphRAG Is Overkill

GraphRAG is powerful but expensive. The entity extraction step requires many LLM calls (one per document chunk), and the community summarization step requires more. For a corpus of 10,000 documents, you might spend $50-200 on the initial graph construction. If your questions are primarily semantic ("what does this policy say about X?"), standard RAG is simpler, cheaper, and sufficient.

| Approach | Best For | Cost | Complexity |
| --- | --- | --- | --- |
| Standard RAG | Content questions, document Q&A | Low | Low |
| GraphRAG | Relationship questions, global synthesis | High | High |
| Graph-enhanced RAG | Both content and relationship questions | Medium | Medium |

## 05. Three Patterns for Graphs + AI

Beyond GraphRAG, there are three broad patterns for combining graph databases with AI systems. Each serves a different purpose, and you may use more than one in a single application.

### Pattern 1: Graph-Enhanced RAG

This is the most common pattern. Your primary retrieval mechanism is still vector search, but you augment it with graph lookups when the question involves relationships.

```python
from neo4j import GraphDatabase
from openai import OpenAI

client = OpenAI()
driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

def answer_question(question: str) -> str:
    # Step 1: Use the LLM to classify the question
    classification = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": """Classify this question as:
            - CONTENT: asks about what something is, what a policy says, etc.
            - RELATIONSHIP: asks about connections, approvals, chains, dependencies
            - BOTH: asks about content in the context of relationships
            Return only the classification."""
        }, {
            "role": "user",
            "content": question
        }]
    ).choices[0].message.content.strip()

    context_parts = []

    # Step 2: If relationship-oriented, query the graph
    if classification in ("RELATIONSHIP", "BOTH"):
        # Use LLM to generate a Cypher query
        cypher = generate_cypher(question)  # see Chapter 5
        with driver.session() as session:
            results = session.run(cypher)
            graph_context = format_results(results)
            context_parts.append(f"Graph data:\n{graph_context}")

    # Step 3: If content-oriented, do vector search
    if classification in ("CONTENT", "BOTH"):
        docs = vector_search(question)  # your existing RAG pipeline
        context_parts.append(f"Documents:\n{docs}")

    # Step 4: Generate answer with combined context
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": "Answer based on the provided context. Cite your sources."
        }, {
            "role": "user",
            "content": f"Question: {question}\n\nContext:\n{'---'.join(context_parts)}"
        }]
    )
    return response.choices[0].message.content
```

### Pattern 2: Graph-Aware Agents

In this pattern, the AI agent has a graph database as one of its tools. The agent decides when to query the graph, what to query, and how to combine graph results with other information.

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "query_knowledge_graph",
            "description": "Query the enterprise knowledge graph to find "
                           "relationships between entities like employees, "
                           "vendors, projects, incidents, and approvals.",
            "parameters": {
                "type": "object",
                "properties": {
                    "cypher_query": {
                        "type": "string",
                        "description": "A Cypher query to execute against "
                                       "the Neo4j knowledge graph"
                    }
                },
                "required": ["cypher_query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_documents",
            "description": "Search company documents using semantic similarity",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Natural language search query"
                    }
                },
                "required": ["query"]
            }
        }
    }
]

# The agent decides which tools to use based on the question
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "system",
        "content": "You are an enterprise assistant with access to a knowledge "
                   "graph and document search. Use the knowledge graph for "
                   "relationship questions (who approved what, what connects to "
                   "what, supply chains, org hierarchy). Use document search "
                   "for content questions (what does a policy say, what are "
                   "the terms of a contract)."
    }, {
        "role": "user",
        "content": user_question
    }],
    tools=tools
)
```

### Pattern 3: Graph-Based Memory

In this pattern, the graph stores the AI's "memory" of past interactions, decisions, and learned facts. Each conversation turn can add nodes and relationships to the graph, building up institutional knowledge over time.

```cypher
// After the AI resolves an incident, store what it learned
CREATE (resolution:Resolution {
    description: 'Replaced hydraulic valve HV-200 with HV-200A',
    resolved_date: date('2025-07-15'),
    confidence: 0.95
})
CREATE (resolution)-[:RESOLVES]->(incident:Incident {id: 'INC-2025-Q3-047'})
CREATE (resolution)-[:INVOLVED_PART]->(part:Part {part_id: 'HV-200'})
CREATE (resolution)-[:RECOMMENDED_BY]->(agent:AIAgent {name: 'IncidentBot'})

// Later, when a similar incident occurs, the agent can query its memory
MATCH (past_resolution:Resolution)-[:RESOLVES]->(past_incident:Incident)
      -[:SIMILAR_TO]->(new_incident:Incident {id: 'INC-2025-Q4-012'})
RETURN past_resolution.description, past_incident.id
```

> **Think of it like this:** Pattern 1 (graph-enhanced RAG) is like giving your chatbot a Rolodex alongside its filing cabinet. Pattern 2 (graph-aware agent) is like giving a researcher access to both a library and an organizational chart — they decide which to consult based on the question. Pattern 3 (graph-based memory) is like the researcher keeping a notebook of lessons learned that they can refer back to.

## 06. Why Graphs + AI Converged Now

The combination of graph databases and AI is not new in concept. Researchers have been exploring knowledge graphs for decades (Google's Knowledge Graph launched in 2012). But the practical convergence happened between 2023 and 2025 for three specific reasons.

### Reason 1: LLMs Can Build Graphs from Text

Before LLMs, building a knowledge graph from unstructured text required custom NLP pipelines — named entity recognition, relation extraction, coreference resolution, entity linking. Each step required specialized models, training data, and significant engineering effort. Building a knowledge graph from 10,000 documents was a multi-month project.

With LLMs, you can extract entities and relationships from text with a single prompt:

```python
extraction_prompt = """
Extract entities and relationships from the following text.
Return them as a list of triples: (subject, predicate, object)

Text: "Dave Kim, the Procurement Manager, approved the contract
CTR-2024-1138 with Acme Corp on June 15, 2024. Acme Corp supplies
hydraulic valve HV-200 to our manufacturing facility."

Triples:
"""

# LLM output:
# (Dave Kim, hasTitle, Procurement Manager)
# (Dave Kim, approved, CTR-2024-1138)
# (CTR-2024-1138, contractWith, Acme Corp)
# (CTR-2024-1138, signedDate, 2024-06-15)
# (Acme Corp, supplies, HV-200)
# (HV-200, type, Hydraulic Valve)
```

This is not perfect — LLMs make extraction errors, miss entities, and hallucinate relationships. But it is 10x faster than building custom NLP pipelines, and the error rate is acceptable for many use cases when combined with human review.

### Reason 2: RAG Hit Its Ceiling

As organizations deployed RAG systems in 2023-2024, they discovered the limitations described in Section 01. Simple Q&A over documents worked well. Complex questions about relationships, hierarchies, and dependencies did not. The market needed a solution, and knowledge graphs were the obvious answer.

### Reason 3: Graph Databases Became Easier

Neo4j Aura launched free and paid tiers that require zero infrastructure management. Amazon Neptune became available as a serverless option. FalkorDB brought graph capabilities to the Redis ecosystem. The barrier to entry dropped from "months of infrastructure work" to "sign up and start querying."

| Year | What Changed | Impact |
| --- | --- | --- |
| 2012 | Google Knowledge Graph | Proved the concept at scale |
| 2019 | Neo4j 4.0, GQL standard work begins | Enterprise-ready graph databases |
| 2022 | ChatGPT launches | LLMs go mainstream |
| 2023 | RAG becomes standard pattern | Vector search + LLMs everywhere |
| 2024 | GraphRAG published, LLM-based entity extraction matures | Graphs become practical for AI |
| 2025 | GQL ISO standard ratified, graph + AI tooling proliferates | Graph + AI becomes a standard pattern |

## 07. Decision Table: When to Add a Graph to Your AI Stack

Not every AI application needs a graph. Here is a decision framework.

| Question | If Yes | If No |
| --- | --- | --- |
| Do your users ask questions about relationships between entities? | Graph adds significant value | Standard RAG may suffice |
| Does your data span multiple systems that need to be connected? | Graph is the natural integration layer | Single-source RAG works |
| Do you need to explain the reasoning chain (compliance, audit)? | Graph provides traceable paths | LLM confidence scores may suffice |
| Is your data mostly unstructured text with few entity relationships? | Standard RAG is sufficient | N/A |
| Do you need real-time answers about organizational structure? | Graph excels (live traversal) | Pre-computed reports may work |
| Are you building an AI agent that needs to navigate enterprise data? | Graph as a tool is very powerful | Document-only tools are simpler |
| Is your budget limited and your use case is simple document Q&A? | Skip the graph for now | N/A |

### The Scoring Approach

Count the "yes" answers to the first six questions:

- **0-1:** Standard RAG is probably sufficient. Focus on good chunking and embedding strategies.
- **2-3:** Consider a lightweight graph for the relationship-heavy parts of your data. You do not need to graph everything.
- **4-6:** A knowledge graph should be a core component of your AI architecture. The investment will pay off in answer quality and user trust.

## 08. A Practical Architecture: Graph + Vector + LLM

For most enterprise AI applications, the optimal architecture combines all three components. Here is what that looks like in practice:

```
                    ┌─────────────────┐
                    │   User Query    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   LLM Router    │
                    │  (classifies    │
                    │   query type)   │
                    └───┬────────┬────┘
                        │        │
           ┌────────────▼──┐  ┌──▼────────────┐
           │  Vector DB    │  │  Graph DB      │
           │  (semantic    │  │  (relationship │
           │   retrieval)  │  │   traversal)   │
           └────────┬──────┘  └──────┬─────────┘
                    │                │
                    └───────┬────────┘
                            │
                   ┌────────▼────────┐
                   │  Context        │
                   │  Assembly       │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │  LLM Response   │
                   │  Generation     │
                   └─────────────────┘
```

The key component is the **router** — the LLM or classifier that examines the user's question and decides which retrieval mechanisms to use. For simple content questions, it queries the vector database. For relationship questions, it queries the graph. For complex questions, it queries both and assembles the context before passing it to the response-generation LLM.

## 09. What You Do Not Need to Know Yet

This chapter has covered a lot of ground at the conceptual level. Here is what we are NOT going to worry about yet:

- **How to build a knowledge graph from your data** — Chapter 4 covers translating your existing data model.
- **How to write graph queries** — Chapter 5 is a complete Cypher tutorial for SQL developers.
- **How to decide which parts of your data to graph** — Chapter 6 provides the decision framework.
- **How to deploy and operate a graph database** — that is a later chapter.
- **How to fine-tune LLMs for entity extraction** — for most use cases, zero-shot prompting with GPT-4o or Claude is sufficient.

## 10. Chapter Checklist

Before moving on, make sure you can answer these questions:

- [ ] Can you explain why vector search fails at multi-hop relationship questions?
- [ ] Can you describe the three patterns for combining graphs with AI (graph-enhanced RAG, graph-aware agents, graph-based memory)?
- [ ] Can you explain GraphRAG at a high level — what it does and when it is overkill?
- [ ] Can you identify at least one question that your users ask today that would benefit from a knowledge graph?
- [ ] Do you understand why LLMs made knowledge graph construction practical?

If you answered yes to all five, you are ready for Part 2, where we shift from "why graphs" to "how to graph" — starting with translating your existing relational data models.
