---
title: "RAG Pipelines — Giving Models Access to Your Data"
slug: "rag-pipelines"
description: "Retrieval-Augmented Generation is the most impactful enterprise AI pattern available today. It solves the knowledge cutoff problem, the hallucination problem, and the proprietary data problem simultaneously."
section: "ai-beyond-the-demo"
order: 24
part: "Part III — The Practitioner's Toolkit"
---

Part III — The Practitioner's Toolkit

# RAG Pipelines — Giving Models Access to Your Data

Retrieval-Augmented Generation (RAG) is the pattern that makes general-purpose LLMs useful for enterprise-specific tasks. Without RAG, LLMs know only what was in their training data — which excludes your organization's documents, policies, procedures, and proprietary data. With RAG, the model retrieves relevant documents at query time and uses them as context for generating its response. The model's knowledge is extended with your organization's knowledge, without fine-tuning.

## 24.1 Why RAG

RAG addresses three limitations that make raw LLMs impractical for most enterprise applications:

**The knowledge cutoff problem:** LLMs do not know about events after their training cutoff, and they do not know about your organization's internal information. RAG provides current, specific information at query time.

**The hallucination problem:** LLMs generate plausible text, not verified text. When the answer to a question is in the retrieved documents, the LLM can ground its response in those documents rather than generating from statistical pattern alone. Citation-grounded responses are more reliable and auditable.

**The context window problem:** LLMs cannot process an entire knowledge base in a single call. RAG retrieves only the relevant portions of the knowledge base for each query, making large-scale knowledge access tractable.

## 24.2 The Ingestion Pipeline

The ingestion pipeline runs before any user queries. It prepares your documents for retrieval.

**Step 1: Document loading.** Load documents from their sources — SharePoint, Confluence, S3, databases, file systems. Handle format diversity: PDFs, Word documents, HTML, plain text, structured data. Each format requires specific parsing logic.

**Step 2: Chunking.** Split documents into chunks small enough to fit in the context window as retrieved context. Chunking strategy matters: fixed-size chunks (by token count) are simple but can split semantic units. Semantic chunking (by paragraph, section, or sentence boundary) preserves meaning at the cost of variable chunk size. For most enterprise document types, paragraph-level or section-level chunking is appropriate.

**Step 3: Embedding.** Convert each chunk to a vector using an embedding model. The embedding model choice matters — it determines how well semantic similarity in the vector space corresponds to semantic relevance for the query.

**Step 4: Indexing.** Store the chunk vectors and their source metadata (document ID, section, page number, date, author) in a vector database. The vector database supports efficient approximate nearest-neighbor search at query time.

## 24.3 The Retrieval Pipeline

The retrieval pipeline runs at query time.

**Step 1: Query embedding.** Embed the user's question using the same embedding model used for document ingestion. Consistency of embedding model between ingestion and retrieval is essential — different models produce vectors in different spaces that are not comparable.

**Step 2: Similarity search.** Search the vector database for the K chunks most similar to the query vector. Typical K values are 3 to 10. More chunks provide more context but increase prompt length and cost.

**Step 3: Filtering.** Apply metadata filters to limit retrieval to relevant documents — by date, by document type, by department, by access control. Metadata filtering prevents the model from retrieving outdated or irrelevant documents that happen to be semantically similar.

**Step 4: Context assembly.** Assemble the retrieved chunks into the prompt context. Order matters — the most relevant chunks should appear first (primacy effect) or last (recency effect), not in the middle.

**Step 5: LLM generation.** Pass the assembled context and the user's question to the LLM. The system prompt instructs the model to answer based on the provided context, cite its sources, and acknowledge when the context does not contain the answer.

## 24.4 RAG Failure Modes

**Retrieval failures:** The correct document exists but is not retrieved — because it was not ingested, because the chunking split it in a way that destroyed the relevant semantic unit, or because the query embedding is too different from the document embedding. Fix: improve chunking strategy, tune retrieval K, add hybrid search (combining vector similarity with keyword matching).

**Context window overflow:** The retrieved chunks are too long for the context window when combined with the system prompt and the user's question. Fix: reduce chunk size, reduce K, or implement context compression that summarizes retrieved chunks before including them.

**Grounding failures:** The LLM ignores the retrieved context and answers from training data instead. Fix: strengthen the system prompt instruction to use provided context, implement citation verification that checks whether claims in the response can be traced to retrieved chunks.

**Stale ingestion:** The document corpus is updated but the vector index is not, causing the model to retrieve outdated information. Fix: implement incremental ingestion that updates the index when source documents change.

**Access control leakage:** A user retrieves documents they should not have access to because the RAG system does not enforce the same access controls as the source system. Fix: implement per-user or per-role access control filtering at retrieval time, synchronized with the source system's permissions.

RAG is the most important pattern in enterprise AI today. The practitioners who master it — including its failure modes — are the ones who can deliver AI that is accurate, grounded, and auditable on proprietary enterprise content.
