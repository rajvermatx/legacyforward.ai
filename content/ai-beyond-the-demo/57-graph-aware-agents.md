---
title: "Graph-Aware Agents"
slug: "graph-aware-agents"
description: "Agents with access to knowledge graph tools can reason about relationships in ways that document-only agents cannot. Graph-aware agents are the architecture for enterprise AI that must navigate complex organizational, regulatory, and operational networks."
section: "ai-beyond-the-demo"
order: 57
part: "Part VI — Advanced AI Patterns"
---

Part VI — Advanced AI Patterns

# Graph-Aware Agents

Agents that can traverse knowledge graphs are qualitatively more capable than agents that can only retrieve documents. The difference is not just in the data they can access — it is in the type of reasoning they can perform. Document-retrieval agents answer questions about what documents say. Graph-aware agents can answer questions about how entities relate, what paths connect them, and what patterns emerge across the network. For enterprise AI that must navigate complex organizational, regulatory, and supply chain networks, graph-awareness is not optional.

### What You Will Learn

- Graph tools for agents: what to expose and how to design them
- Reasoning patterns for graph-aware agents
- Enterprise use cases where graph-aware agents deliver distinctive value
- Integration patterns for graph tools in existing agent architectures

## 57.1 Graph Tools for Agents

Graph-aware agents are standard agents with access to a set of graph-specific tools. The design of these tools determines how effectively the agent can reason about graph data.

**Entity lookup tool.** Given an entity name (or partial name), return the matching graph nodes with their properties and labels. This is the entry point for most graph queries — the agent must resolve entity names before traversing their relationships.

```
entity_lookup(name: str, entity_type: str | None) -> List[Entity]
Returns nodes matching the name, optionally filtered by entity type.
```

**Relationship traversal tool.** Given a node identifier, return its relationships — either all relationships or filtered by type and direction. The agent uses this tool to explore the network from a starting entity.

```
get_relationships(node_id: str, relationship_types: List[str] | None, direction: "outgoing" | "incoming" | "both") -> List[Relationship]
Returns edges connected to the specified node.
```

**Path finding tool.** Given two node identifiers, find paths connecting them up to a specified maximum length. This is the tool for questions like "How is Entity A connected to Entity B?"

```
find_paths(start_id: str, end_id: str, max_depth: int, relationship_types: List[str] | None) -> List[Path]
Returns paths between two nodes.
```

**Neighborhood summary tool.** Given a node identifier, return a natural language summary of the node's neighborhood — its relationships and the entities they connect. This reduces the number of individual tool calls the agent must make to understand a node's context.

```
get_neighborhood_summary(node_id: str, depth: int) -> str
Returns a prose summary of the node's graph neighborhood.
```

**Graph query tool.** For advanced agents, expose a direct Cypher or Gremlin query interface. The agent generates the query based on its understanding of the graph schema and the user's question. This tool is powerful but requires the agent to understand the query language and the graph schema — appropriate for specialized agents, not generalist assistants.

## 57.2 Reasoning Patterns for Graph-Aware Agents

Graph-aware agents use the same reasoning patterns as other agents (Chapter 47) but with graph-specific reasoning strategies.

**Iterative traversal.** The agent begins at an entity, retrieves its relationships, selects the most relevant relationships to follow based on the question, traverses those relationships to neighboring entities, and repeats until the question is answered. This ReAct-style pattern is appropriate for exploration queries where the path to the answer is not known in advance.

**Multi-hop planning.** For questions that require a specific traversal sequence ("find all contracts → find their signatories → find those signatories' organizations → find those organizations' regulatory status"), the agent plans the full traversal sequence before executing it. This plan-and-execute pattern is more efficient than iterative traversal when the traversal path is predictable.

**Pattern matching.** The agent formulates a graph pattern that represents the answer — "find all entities matching the pattern [Person]-[EMPLOYED\_BY]->[Organization]-[REGULATED\_BY]->[Regulation] where status is active" — and uses the graph query tool to find all instances of the pattern. Pattern matching is efficient for queries that have a known structure.

**Community exploration.** For summarization and overview questions, the agent retrieves community summaries (from GraphRAG preprocessing) rather than traversing specific entities. This is efficient for questions about themes, trends, or the overall structure of the knowledge base.

## 57.3 Enterprise Use Cases

**Compliance agent.** A compliance agent with access to a regulatory knowledge graph can answer questions like: "What regulations apply to our planned expansion into France?" The agent traverses: France → applicable regulatory frameworks → specific regulations → requirements that the organization's activities trigger → compliance obligations.

**Fraud investigation agent.** A fraud investigation agent with access to a transaction network graph traverses connections between flagged entities to identify fraud rings — clusters of accounts, individuals, and organizations that share suspicious relationship patterns. The agent can identify paths between a flagged account and known fraud entities that are not visible from any single document.

**Supply chain risk agent.** A supply chain agent with access to a supplier network graph identifies risk propagation paths: "If Supplier X becomes unavailable, what products are affected, and which alternative suppliers can be substituted?" This traversal — from supplier through components through products — requires graph reasoning across a network that may have thousands of nodes.

**Organizational knowledge agent.** An internal knowledge agent that can traverse the organization's knowledge graph (documents, people, projects, expertise areas) answers questions like "Who in the organization has expertise in X and has worked on projects similar to Y?" by traversing the relationships between people, their documented expertise, and their project histories.

## 57.4 Integration Patterns

**Graph tools alongside document retrieval.** The most common integration pattern adds graph tools to an agent that already has document retrieval tools. The agent selects graph tools when the question requires relationship reasoning and document tools when the question requires specific document content.

**Graph-first, document-second.** For knowledge graph-intensive domains (compliance, supply chain, fraud), the agent uses graph tools first to identify relevant entities and relationships, then retrieves specific document chunks associated with those entities to ground its response in source text.

**Graph schema in the system prompt.** Agents that use graph query tools need to understand the graph schema to generate correct queries. Including a concise description of the graph schema (entity types, relationship types, key properties) in the system prompt gives the agent the context it needs to formulate queries without hallucinating schema elements that do not exist.

**Freshness synchronization.** The knowledge graph must be kept synchronized with the document corpus. When documents are updated, the entities and relationships extracted from them must be updated in the graph. Agents that query a stale graph provide answers based on outdated relationship data — in compliance and fraud contexts, this is a serious reliability problem.

Graph-aware agents represent the convergence of the graph database and agentic AI capabilities covered in this part of the compendium. Organizations that build the knowledge graph infrastructure (Chapters 53–55) and then equip agents with graph traversal tools unlock reasoning capabilities that are beyond the reach of document-only AI systems.
