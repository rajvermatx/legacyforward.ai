---
title: "GraphRAG — Beyond Vector Search"
slug: "graphrag"
description: "Standard RAG retrieves documents by semantic similarity. GraphRAG retrieves knowledge by traversing relationships between concepts. For questions that require understanding how entities relate — not just what individual documents say — GraphRAG is the architecture that delivers where standard RAG fails."
section: "legacyforward-compendium"
order: 56
part: "Part VI — Advanced AI Patterns"
---

Part VI — Advanced AI Patterns

# GraphRAG — Beyond Vector Search

Standard Retrieval-Augmented Generation (RAG) finds documents that are semantically similar to the user's query and provides them as context for the LLM's response. This works well when the answer to a question is contained in one or a few specific documents. It fails when answering the question requires understanding relationships between entities across many documents — when the answer is not in any single document but emerges from how documents connect.

GraphRAG integrates knowledge graph traversal into the retrieval pipeline. Instead of (or in addition to) retrieving documents by vector similarity, GraphRAG traverses the knowledge graph to gather the connected context that answers the question — even when no single document contains the full answer.

### What You Will Learn

- When standard RAG fails and GraphRAG succeeds
- The GraphRAG architecture and retrieval pipeline
- Community-based summarization — Microsoft's GraphRAG approach
- Hybrid vector + graph retrieval

## 56.1 When Standard RAG Fails

Standard RAG fails predictably on questions that require relationship traversal:

**Multi-hop questions.** "What regulatory requirements apply to products manufactured by companies that supply to organizations in the financial sector?" requires traversing: product → manufacturer → supplier → industry → regulation. No single document answers this question; the answer requires connecting information across many documents.

**Comparative questions.** "How do the warranty terms differ between our three largest suppliers?" requires retrieving and comparing information across three distinct supplier contract sets — not finding the most similar document to the query.

**Aggregation questions.** "Which suppliers are involved in the most regulatory violations?" requires counting relationships in the knowledge graph — a query that vector similarity search cannot execute.

**Relationship questions.** "Who else was involved in the procurement decisions that led to Contract X?" requires traversing the relationship network around a specific entity, not finding semantically similar documents.

Standard RAG answers these questions by returning whatever documents are most semantically similar to the query string — which may be related but not sufficient to answer the question that actually requires relationship traversal.

## 56.2 The GraphRAG Architecture

GraphRAG combines the knowledge graph retrieval of graph databases with the language generation of LLMs.

**Step 1: Query analysis.** The user's query is analyzed to identify: what entities are being asked about, what relationships between entities are relevant, and whether the query requires relationship traversal or document similarity retrieval (or both).

**Step 2: Entity resolution.** The entities mentioned in the query are resolved against the knowledge graph — finding the graph nodes that correspond to the entities the user is asking about. Entity resolution may use fuzzy string matching, embedding similarity, or direct graph lookup by name.

**Step 3: Graph traversal.** Starting from the resolved entities, traverse the knowledge graph to gather related context. The traversal follows specific relationship types to a defined depth — collecting the entities and relationships that are relevant to the query. The traversal result is a subgraph of the knowledge graph.

**Step 4: Context assembly.** The retrieved subgraph is converted to a text representation (a structured description of the entities and relationships) and assembled into the LLM prompt context alongside any relevant document chunks retrieved by vector similarity.

**Step 5: LLM generation.** The LLM generates a response grounded in both the graph context (relationships between entities) and the document context (specific text passages).

## 56.3 Community-Based Summarization

Microsoft Research's GraphRAG approach, published in 2024, introduces community detection as an additional layer. The knowledge graph is analyzed to identify communities — clusters of densely connected nodes that represent coherent topic areas. A summary is generated for each community, describing the entities, relationships, and key facts within it.

At query time, the query is compared against community summaries to identify the most relevant communities. The community summaries and the specific entities/relationships within the relevant communities are assembled as context.

**Advantage:** Community summaries enable global questions — "What are the main themes in our compliance documentation?" or "Who are the key decision-makers across our supplier contracts?" — that require understanding the structure of the entire knowledge base, not just the specific entities mentioned in the query.

**Trade-off:** Community detection and summary generation require significant preprocessing and must be re-run when the knowledge graph is substantially updated. For knowledge graphs that change frequently, the preprocessing cost may outweigh the retrieval benefit.

## 56.4 Hybrid Vector + Graph Retrieval

The most effective enterprise GraphRAG implementations use hybrid retrieval: both vector similarity search and graph traversal, with the results combined.

**Query routing.** Analyze the query to determine the retrieval strategy: primarily vector (the query is about the content of specific documents), primarily graph (the query is about relationships between entities), or hybrid (the query requires both document content and relationship context).

**Parallel retrieval.** For hybrid queries, run vector similarity search and graph traversal in parallel. Combine the results — deduplicating documents that appear in both result sets and prioritizing the most relevant context.

**Re-ranking.** After retrieval, apply a re-ranking step that scores each retrieved piece of context (document chunk or graph relationship) for relevance to the query, and selects the most relevant subset for inclusion in the context window.

**Result weighting.** The LLM prompt can explicitly signal the source of different context pieces: "The following information comes from document retrieval: [...]. The following information comes from the knowledge graph: [...]." This helps the LLM appropriately weight the two sources and enables citation-level attribution in the response.

GraphRAG is not a replacement for standard RAG — it is an extension appropriate for enterprise AI systems where the knowledge base is highly interconnected and where users ask questions that require understanding relationships, not just finding relevant documents.
