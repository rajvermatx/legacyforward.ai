---
title: "New Building Blocks — AI Components for Your Architecture"
slug: "new-building-blocks"
description: "AI-first architecture introduces a new set of components that do not exist in traditional enterprise system design — vector databases, embedding pipelines, prompt registries, evaluation harnesses. Architects who understand these building blocks design systems that work; those who do not design systems that surprise them."
section: "ai-beyond-the-demo"
order: 34
part: "Part IV — Enterprise AI Architecture"
---

Part IV — Enterprise AI Architecture

# New Building Blocks — AI Components for Your Architecture

Traditional enterprise architecture has a mature vocabulary: relational databases, message queues, API gateways, CDNs, load balancers. AI systems introduce new components that serve analogous functions but operate differently. Architects who map these new components onto traditional analogues without understanding what is actually different will make design decisions that produce systems which behave unexpectedly at scale.

## 34.1 Vector Databases

A vector database stores and queries vectors — numerical representations of content — rather than structured records. When a user queries a RAG system, the query is converted to a vector and the vector database finds the stored content vectors most similar to the query vector. This semantic similarity search is what makes RAG retrieval work.

**How vector databases differ from relational databases:**

Relational databases find records based on exact matches or range queries on specific fields. A SQL query for "customer_id = 12345" finds the exact record. A vector database query for "concepts related to contract termination" finds the chunks of text whose meaning is closest to that phrase — even if none of them contains those exact words.

**When to use each:**

Use relational databases for structured data where exact or range queries dominate — transaction records, customer data, configuration tables. Use vector databases for semantic search over unstructured content — document retrieval, knowledge base lookup, semantic deduplication. Most enterprise AI systems use both: relational for structured data, vector for unstructured content, with joins at the application layer.

**Vector database selection criteria:**

Hosted vs. self-managed: hosted vector databases (Pinecone, Weaviate Cloud, OpenSearch Serverless) reduce operational burden; self-managed (Chroma, Qdrant, pgvector extension) keep data in your environment. Vector dimensions: embedding models produce vectors of specific dimensions; the vector database must support the embedding model's output dimension. Metadata filtering: the ability to filter by document metadata (date, department, document type) before or during similarity search is essential for enterprise RAG. Hybrid search: the ability to combine vector similarity with keyword search (BM25) produces better results than either alone for most enterprise tasks.

## 34.2 Embedding Pipelines

Embedding pipelines convert raw content into vectors for storage in the vector database. They are the data ingestion layer of any RAG or semantic search system.

**The ingestion pipeline components:**

Document loaders extract content from source formats — PDFs via PDF parsers, Word documents via docx parsers, HTML via web scrapers, structured databases via SQL queries. Each format requires specific extraction logic; format diversity is the most consistently underestimated complexity in embedding pipeline design.

Text chunkers split extracted content into segments that fit within the embedding model's context window and represent coherent semantic units. Chunking strategy (fixed-size by token count, by paragraph boundary, by semantic similarity) significantly affects retrieval quality and is worth systematic evaluation.

Embedding models convert chunks to vectors. Embedding model selection affects retrieval quality: models trained on domain-specific corpora outperform general-purpose models for domain-specific retrieval. Models produce vectors of fixed dimensions; dimension choice affects storage cost and query latency.

Vector storage writes the chunk vectors and associated metadata to the vector database. Metadata design — what fields are stored alongside each vector — determines what filtering is possible at retrieval time.

**Operational considerations:** Embedding pipelines must handle source document updates — when a document changes, its chunks must be re-embedded and the old chunks replaced. Incremental ingestion (processing only changed documents) is more efficient than full re-ingestion but more complex to implement correctly.

## 34.3 Prompt Management Infrastructure

In production AI systems, prompts are not strings embedded in application code — they are versioned, evaluated, and managed artifacts. Prompt management infrastructure is the tooling that makes this management practical.

**Prompt registry:** A centralized store of prompt templates, organized by function, with version history. Applications reference prompts by identifier rather than embedding them in code; the registry resolves the identifier to the current prompt version at runtime.

**Prompt versioning:** When a prompt is updated, the old version is retained. The ability to compare prompt versions — both their content and their evaluation metrics — is essential for understanding the impact of changes and for rollback when a prompt update degrades quality.

**Prompt evaluation integration:** The prompt registry should integrate with the evaluation pipeline so that evaluation results are associated with specific prompt versions. A dashboard showing evaluation scores by prompt version is the core tool for prompt engineering at scale.

**Environment promotion:** Prompts, like code, should be promoted through environments — development, staging, production — with evaluation gates between environments. A prompt that fails evaluation in staging should not be promoted to production.

Without prompt management infrastructure, prompt engineering at scale becomes chaotic: teams make changes without tracking what changed, cannot detect regressions, and cannot reliably roll back when problems emerge.

## 34.4 Evaluation Harnesses

An evaluation harness is the infrastructure that measures AI system output quality systematically and continuously. It is the production monitoring system for AI, analogous to application performance monitoring in traditional systems.

**Components of an evaluation harness:**

Evaluation dataset management: storage and versioning of labeled input-output pairs used for evaluation. The dataset is a first-class artifact that must be versioned and maintained like code.

Evaluation runners: infrastructure that passes evaluation dataset inputs through the AI system and collects outputs. Runners should be integrated into the CI/CD pipeline so evaluation runs automatically on every prompt or model change.

Scoring: applying evaluation criteria to collected outputs. Scoring implementations include human rater interfaces (for manual evaluation), LLM-as-judge integrations (for automated semantic evaluation), and automated heuristic checks (for structural evaluation).

Results storage and trending: storing evaluation results with their associated prompt version, model version, and dataset version, and surfacing them in a dashboard that shows the score trend over time.

**Integration with the deployment pipeline:** Evaluation results should gate deployment. A prompt update that reduces evaluation scores below the acceptance threshold should not be deployable without explicit override.

## 34.5 Wiring the Components Together

The reference architecture for an enterprise RAG system:

Source documents → Document loaders → Chunkers → Embedding model → Vector database (ingestion path)

User query → Embedding model → Vector database similarity search → Context assembly → Prompt registry (retrieve current prompt template) → LLM → Response (retrieval path)

Response → Evaluation harness (sampling fraction) → Evaluation scores → Dashboard

This architecture is not prescriptive — real systems vary in how components are combined and where boundaries fall. But architects who understand each component's role can make substitution decisions (changing the embedding model, swapping vector databases, updating the LLM) without breaking the architecture's intended behavior.
