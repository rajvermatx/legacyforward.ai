---
title: "RAG Pipeline"
slug: "rag-pipeline"
description: "Retrieval-Augmented Generation grounds LLM responses in your own data. Instead of relying solely
    on the model's training knowledge, RAG retrieves relevant documents from a vector database and injects
    them as context — dramatically improving accuracy, reducing hallucination, and enabling real"
section: "genai-arch"
order: 3
badges:
  - "Chunking Strategies"
  - "Embedding Models"
  - "Vector Search"
  - "Reranking"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai-arch/03-rag-pipeline.ipynb"
---

## 1. Architecture Overview

**Retrieval-Augmented Generation (RAG)** is the most important architecture pattern in production GenAI. It bridges the gap between a general-purpose LLM and your proprietary data by retrieving relevant context at query time and inserting it into the prompt. The model then generates a grounded response using both its learned knowledge and the retrieved documents.

RAG has two distinct phases: an **offline indexing phase** where documents are chunked, embedded, and stored in a vector database, and an **online query phase** where user queries trigger similarity search, context assembly, and LLM generation.

### When to Use

-   Q&A over proprietary documents (internal wikis, product docs, legal contracts)
-   Customer support bots grounded in your knowledge base
-   Search-enhanced applications where accuracy matters more than creativity
-   Any scenario where the LLM needs information beyond its training cutoff
-   Reducing hallucination by providing verifiable source material

### Complexity Level

**Moderate.** RAG adds a retrieval layer and a vector database to the simple chat pattern. The biggest challenges are chunking strategy, embedding model selection, and retrieval quality tuning. Getting RAG "good enough" is easy; getting it excellent requires systematic evaluation.

>**Tip:** RAG quality is 80% retrieval quality. If you retrieve the wrong chunks, even the best LLM will produce poor answers. Invest heavily in chunking, embedding selection, and reranking before tuning the generation prompt.

## 2. Architecture Diagram

![Diagram 1](/diagrams/genai-arch/rag-pipeline-1.svg)

Architecture diagram — RAG Pipeline: offline indexing + online retrieval-augmented generation

## 3. Components Deep Dive

### Chunking Strategies

How you split documents into chunks has the single biggest impact on retrieval quality. Choose based on your document structure:

| Strategy | How It Works | Best For |
| --- | --- | --- |
| **Fixed-size** | Split every N characters/tokens with M overlap | Simple, uniform docs (logs, transcripts) |
| **Recursive** | Split by hierarchy: paragraphs → sentences → words | General-purpose, most common default |
| **Semantic** | Use embedding similarity to find natural break points | Long-form prose, articles, research papers |
| **Document-aware** | Split by headers, sections, or markdown structure | Structured docs (Markdown, HTML, code) |
| **Sliding window** | Overlapping windows for maximum context preservation | When context boundaries are critical |

>**Chunk Size Rule of Thumb:** Start with 500-1000 tokens per chunk with 10-20% overlap. Too small = fragments lose context. Too large = dilutes relevance signal. Always test with your actual queries.

🔎

#### Embedding Models

Transform text into dense vector representations. Popular choices: OpenAI text-embedding-3-small (1536d), Cohere embed-v3, Voyage AI, or open-source models like BGE, E5, GTE via sentence-transformers.

🗃

#### Vector Databases

Purpose-built stores for similarity search. **Chroma** (local/dev), **Pinecone** (managed, scalable), **Weaviate** (hybrid search), **pgvector** (Postgres extension, familiar ops).

🎯

#### Similarity Search

Find the most relevant chunks using cosine similarity, dot product, or L2 distance. ANN (Approximate Nearest Neighbor) algorithms like HNSW trade perfect accuracy for speed at scale.

📈

#### Reranking

A second-stage ranker (e.g., Cohere Rerank, cross-encoder models) that reorders the initial retrieval results by relevance. Dramatically improves precision at the cost of added latency.

🔀

#### Hybrid Search

Combines dense vector search with sparse keyword search (BM25/TF-IDF). Catches exact matches that embeddings miss. Most production systems use hybrid with reciprocal rank fusion (RRF).

📚

#### Context Window Management

Assemble retrieved chunks into a prompt that fits the model's context window. Strategies: truncation, summarization of excess context, or hierarchical retrieval (summary first, detail on demand).

## 4. Implementation

### Step 1: Index Documents with ChromaDB

```
import chromadb
from chromadb.utils import embedding_functions

# Initialize client and embedding function
client = chromadb.PersistentClient(path="./chroma_db")
embed_fn = embedding_functions.OpenAIEmbeddingFunction(
    api_key="sk-...",
    model_name="text-embedding-3-small"
)

# Create or get collection
collection = client.get_or_create_collection(
    name="knowledge_base",
    embedding_function=embed_fn,
    metadata={"hnsw:space": "cosine"}
)

# Chunk documents
def chunk_text(text: str, chunk_size=500, overlap=50) -> list[str]:
    """Split text into overlapping chunks."""
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunks.append(text[i : i + chunk_size])
    return chunks

# Add documents to collection
docs = ["Your document text here...", "Another document..."]
for doc_id, doc in enumerate(docs):
    chunks = chunk_text(doc)
    collection.add(
        documents=chunks,
        ids=[f"doc{doc_id}_chunk{i}" for i in range(len(chunks))],
        metadatas=[{"source": f"doc_{doc_id}", "chunk": i} for i in range(len(chunks))]
    )
```

### Step 2: Retrieve Relevant Context

```
def retrieve(query: str, n_results: int = 5) -> list[dict]:
    """Retrieve top-K relevant chunks for a query."""
    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        include=["documents", "distances", "metadatas"]
    )
    return [
        {"text": doc, "score": 1 - dist, "metadata": meta}
        for doc, dist, meta in zip(
            results["documents"][0],
            results["distances"][0],
            results["metadatas"][0]
        )
    ]
```

### Step 3: Generate Grounded Response

```
import anthropic

client_llm = anthropic.Anthropic()

def rag_query(question: str) -> str:
    """Full RAG pipeline: retrieve + generate."""
    # 1. Retrieve relevant chunks
    chunks = retrieve(question, n_results=5)
    context = "\n\n---\n\n".join([c["text"] for c in chunks])

    # 2. Build prompt with context
    system = """You are a helpful assistant. Answer questions using ONLY
the provided context. If the context doesn't contain the answer,
say "I don't have enough information to answer that."
Always cite which source document you used."""

    user_msg = f"""Context:\n{context}\n\nQuestion: {question}"""

    # 3. Generate response
    response = client_llm.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=system,
        messages=[{"role": "user", "content": user_msg}],
        temperature=0.2,
    )
    return response.content[0].text

# Usage
answer = rag_query("What is the refund policy for enterprise plans?")
print(answer)
```

### Advanced: Hybrid Search with Reranking

```
from rank_bm25 import BM25Okapi
import numpy as np

class HybridRetriever:
    def __init__(self, collection, documents):
        self.collection = collection
        self.documents = documents
        # Build BM25 index for keyword search
        tokenized = [doc.lower().split() for doc in documents]
        self.bm25 = BM25Okapi(tokenized)

    def search(self, query, k=10, alpha=0.5):
        """Hybrid search: alpha * dense + (1-alpha) * sparse."""
        # Dense retrieval (vector)
        dense = self.collection.query(query_texts=[query], n_results=k)

        # Sparse retrieval (BM25)
        bm25_scores = self.bm25.get_scores(query.lower().split())
        sparse_top_k = np.argsort(bm25_scores)[-k:][::-1]

        # Reciprocal Rank Fusion
        fused = self._rrf_fuse(dense, sparse_top_k, k=60)
        return fused[:k]

    def _rrf_fuse(self, dense_results, sparse_ids, k=60):
        """Reciprocal Rank Fusion combining two ranked lists."""
        scores = {}
        for rank, doc_id in enumerate(dense_results["ids"][0]):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
        for rank, idx in enumerate(sparse_ids):
            doc_id = f"doc_chunk{idx}"
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
        return sorted(scores, key=scores.get, reverse=True)
```

## 5. Data Flow

![Data Flow](/diagrams/genai-arch/rag-pipeline-flow.svg)

### Indexing Phase (Offline)

| Step | Action | Details |
| --- | --- | --- |
| 1 | Load documents | Ingest from file system, S3, database, or API (PDF, TXT, HTML, Markdown) |
| 2 | Clean and preprocess | Remove boilerplate, normalize formatting, extract metadata |
| 3 | Chunk documents | Split into overlapping segments using chosen strategy (recursive, semantic, etc.) |
| 4 | Generate embeddings | Pass each chunk through embedding model to get dense vector |
| 5 | Store in vector DB | Insert vectors + metadata + original text into vector database |

### Query Phase (Online)

| Step | Action | Details |
| --- | --- | --- |
| 1 | User submits query | Natural language question arrives via API |
| 2 | Embed query | Same embedding model converts query to vector |
| 3 | Similarity search | Vector DB returns top-K most similar chunks |
| 4 | Rerank (optional) | Cross-encoder reorders results for precision |
| 5 | Assemble context | Top chunks + user query formatted into LLM prompt |
| 6 | Generate response | LLM produces answer grounded in retrieved context |
| 7 | Return with citations | Response includes source references for verification |

## 6. Trade-offs & Considerations

| Advantage | Limitation |
| --- | --- |
| Grounds responses in real data, reducing hallucination | Retrieval quality bottleneck: garbage in, garbage out |
| No model retraining needed for knowledge updates | Added latency from embedding + vector search |
| Provides verifiable sources and citations | Chunk boundaries can split important context |
| Works with any LLM (model-agnostic) | Embedding model choice significantly impacts quality |
| Scales to millions of documents | Vector DB adds infrastructure complexity and cost |
| Supports incremental updates (add new docs anytime) | Multi-hop reasoning across documents is challenging |

### Vector Database Comparison

| Database | Type | Strengths | Best For |
| --- | --- | --- | --- |
| **ChromaDB** | Embedded | Zero config, Python-native | Prototyping, small datasets |
| **Pinecone** | Managed | Scalable, serverless option | Production, no-ops teams |
| **Weaviate** | Open-source | Hybrid search built-in | Complex search requirements |
| **pgvector** | Extension | Uses existing Postgres | Teams already on Postgres |
| **Qdrant** | Open-source | High performance, filtering | Large-scale, self-hosted |

>**When to upgrade:** If your documents require complex extraction (OCR, table parsing), move to Architecture 04 (Document Processing). If users need multi-step reasoning with external tools, consider Architecture 06 (Agentic Tool Use).

## 7. Production Checklist

-   Evaluate chunking strategy with representative queries (use recall@k metrics)
-   Benchmark embedding models on your domain data (MTEB leaderboard as starting point)
-   Implement hybrid search (dense + sparse) for robust retrieval
-   Add reranking stage for precision-critical applications
-   Set up incremental indexing pipeline for new/updated documents
-   Monitor retrieval quality: track query-to-answer relevance scores
-   Implement metadata filtering (date range, source, category) for targeted search
-   Cache frequent queries and their retrieved contexts
-   Add citation extraction: return source document + chunk location with every answer
-   Set up automated evaluation pipeline (ground truth Q&A pairs, RAGAS metrics)
-   Plan vector DB backup and disaster recovery
-   Monitor embedding drift when switching models or adding new document types
