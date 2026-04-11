---
title: "Enterprise RAG with Data Lineage"
slug: "enterprise-rag"
description: "A production-grade Retrieval-Augmented Generation architecture with access controls, source citations, freshness guarantees, and end-to-end data lineage — everything a demo RAG leaves out."
section: "blueprints"
order: 10
badges:
  - "Multi-Source Ingestion"
  - "Access Control (ACL)"
  - "Citation Tracking"
  - "Data Lineage"
---

## 1. Overview

Everyone wants to chat with their company's data. Executives want to ask questions about quarterly reports. Engineers want to query internal documentation. Support agents want instant answers from the knowledge base. RAG — Retrieval-Augmented Generation — makes this possible by finding relevant documents and feeding them to a large language model that synthesizes an answer. You have probably seen a demo: chunk some PDFs, embed them into a vector database, and ask questions. It works impressively well for 15 minutes on stage. Then reality sets in.

Enterprise RAG is fundamentally different from a demo RAG. In a demo, you chuck everything into one index and celebrate when the AI gives a plausible-sounding answer. In an enterprise, you need to answer a very different set of questions: Which documents did the AI use to generate this answer? Are those documents current, or is the user getting advice from a policy that was updated last month? Does this user have permission to see those documents? If a junior analyst asks a question, should the AI surface board-level financial data? And critically: if a source document turns out to be wrong, how do you find every AI-generated answer that cited the old version?

This is where data lineage becomes the differentiator between a toy and a production system. Enterprise RAG needs access controls so the AI only surfaces documents a user is authorized to see. It needs source tracking so every answer cites its sources with links. It needs freshness guarantees so answers reflect current data, not stale caches from six months ago. And it needs lineage: a traceable chain from every source document through every chunk and embedding to every answer that referenced it. When a source document is corrected or retracted, you can find and flag every answer that relied on the old version.

Get this wrong and you build a confident-sounding AI that gives wrong answers nobody can trace. An employee makes a decision based on an AI-generated answer that cited an outdated policy. A customer receives advice derived from a document they should never have had access to. A regulator asks "where did this answer come from" and nobody can reconstruct the chain. The architecture in this blueprint prevents all of these scenarios by treating lineage, access control, and citation as first-class requirements — not afterthoughts bolted on when something goes wrong.

## 2. Architecture Diagram

![Diagram 1](/diagrams/blueprints/enterprise-rag-1.svg)

Architecture diagram — Enterprise RAG with Data Lineage: multi-source ingestion, ACL-filtered retrieval, cited generation, and end-to-end lineage tracking

## 3. Component Breakdown

📦

#### Multi-Source Ingestion Pipeline

Connectors for SharePoint, Confluence, S3, databases, and other enterprise data sources. Each connector extracts content, preserves metadata (author, date, ACL), and feeds into the chunking pipeline. Runs on a schedule with change detection.

✏

#### Chunking & Embedding Engine

Splits documents into chunks using context-aware strategies (respecting section boundaries, tables, and lists). Generates vector embeddings for each chunk. Tags each chunk with source document ID, ACL, and freshness timestamp.

🔎

#### Vector Store with Metadata

Stores embeddings alongside rich metadata: source document, chunk position, ACL tags, creation date, and last-updated timestamp. Supports filtered search so retrieval respects access controls and freshness requirements.

🔒

#### Access Control Layer

Document-level ACLs inherited from the source system. When a user queries RAG, retrieval is filtered to only return chunks from documents the user has permission to access. Prevents the AI from surfacing confidential information to unauthorized users.

🔗

#### Citation & Source Tracking

Every AI-generated answer includes citations pointing to the specific source documents and sections used. Users can click through to verify. The system tracks which chunks contributed to each answer for auditability.

📈

#### Data Lineage & Freshness

End-to-end lineage from source document to AI answer. Freshness management ensures stale documents are flagged or excluded. If a source document is updated or retracted, all answers that cited the old version can be identified and flagged.

## 4. Decision Points & Trade-offs

| Advantage | Limitation |
| --- | --- |
| Comprehensive multi-source ingestion covers all enterprise data | More sources means more connectors to build and maintain |
| Document-level ACL prevents unauthorized information access | Fine-grained ACL filtering increases retrieval latency |
| Full lineage enables root-cause analysis and compliance | Lineage tracking adds storage and compute overhead |
| Citations build user trust and enable verification | Citation accuracy depends on retrieval quality and chunk boundaries |
| Freshness management ensures current answers | Frequent re-indexing increases infrastructure costs |

>**Chunking is the most underestimated problem:** The quality of your RAG system depends more on your chunking strategy than on which embedding model or LLM you use. Bad chunking — splitting tables across chunks, breaking numbered lists, separating headers from their content — makes retrieval unreliable no matter how good everything else is. Invest time in testing and tuning your chunking strategy with real documents from your corpus.

>**Hybrid search matters:** Pure vector search misses keyword-exact queries (product names, error codes, policy numbers). Pure keyword search misses semantic meaning. Use hybrid search (vector + BM25) with a re-ranker for the best retrieval quality. Most production RAG systems that report high accuracy use hybrid search.

## 5. Cloud Mapping

| Component | GCP | AWS | Azure |
| --- | --- | --- | --- |
| **Vector Store** | Vertex AI Vector Search | Amazon OpenSearch / Bedrock KB | Azure AI Search |
| **Embedding** | Vertex AI Embeddings | Bedrock Embeddings / Titan | Azure OpenAI Embeddings |
| **Ingestion** | Cloud Functions + Pub/Sub | Lambda + SQS | Azure Functions + Service Bus |
| **Metadata Store** | Firestore / Spanner | DynamoDB | Cosmos DB |
| **Access Control** | IAM + custom ACL | IAM + Lake Formation | Entra ID + custom ACL |
| **LLM** | Vertex AI (Gemini) | Amazon Bedrock | Azure OpenAI |

## 6. Anti-Patterns

1.  **No access controls** — RAG surfaces confidential documents to unauthorized users. This is the most dangerous anti-pattern in enterprise RAG. A junior employee asks a question and the AI happily retrieves board meeting notes, M&A plans, or salary data because nobody implemented document-level ACL filtering.
2.  **Context-destroying chunking** — Splitting documents at arbitrary character counts without respecting structure. Tables get split across chunks, numbered lists lose their ordering, and section headers get separated from their content. The retriever returns fragments that mislead the LLM.
3.  **No freshness management** — Answering questions with outdated information because the index was built once and never refreshed. A user asks about the current expense policy and gets the version from 2024 because the 2026 update was never re-indexed.
4.  **No citations** — Users cannot verify the AI's answer because the system does not show which documents it used. Trust erodes quickly when people cannot check the source, especially for consequential decisions.
5.  **Treating all documents equally** — No prioritization of authoritative sources versus informal content. A Slack message and an official policy document carry equal weight in retrieval. Use source authority scores to rank authoritative documents higher.

## 7. Architect's Checklist

-   Document sources inventoried — complete list of systems to ingest with connector status
-   Access controls mapped — document-level ACLs inherited from source systems and enforced at retrieval
-   Chunking strategy tested and tuned — validated with real documents across all source types
-   Embedding model evaluated for domain — tested on domain-specific queries, not just generic benchmarks
-   Freshness policy defined per source — how often each source is re-indexed and stale content handling
-   Citation format tested with users — confirmed that citations are useful, clickable, and accurate
-   Lineage tracking from source to answer — can trace any answer back to its source documents
-   Retrieval accuracy measured (recall@k) — quantified how often the right documents are retrieved
-   Fallback for no-result queries — graceful handling when retrieval finds nothing relevant
-   PII scanning in ingestion pipeline — detect and handle personal data before embedding
-   Re-indexing strategy for updated documents — incremental updates, not full rebuilds
-   User feedback loop for answer quality — thumbs up/down mechanism feeding back into evaluation
