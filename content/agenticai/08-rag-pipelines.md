---
title: "RAG Pipelines"
slug: "rag-pipelines"
description: "A customer asks your agent whether the company’s refund policy covers digital subscriptions. The agent responds with absolute confidence: “Yes, all purchases are eligible for a full refund within 30 days.” The real policy, updated six weeks ago, explicitly excludes digital subscriptions. Three hundr"
section: "agenticai"
order: 8
part: "Part 02 Core Patterns"
---

Part 2: Core Patterns

# RAG Pipelines

A customer asks your agent whether the company’s refund policy covers digital subscriptions. The agent responds with absolute confidence: “Yes, all purchases are eligible for a full refund within 30 days.” The real policy, updated six weeks ago, explicitly excludes digital subscriptions. Three hundred support tickets later, someone discovers the agent was answering from training data that predates the policy change. RAG exists because models do not know what they do not know, and they will never tell you they are guessing.

### What You Will Learn

-   Why retrieval-augmented generation solves the stale knowledge and hallucination problems that parametric memory cannot
-   How to load, chunk, and embed documents into a vector store for semantic search
-   The trade-offs between dense, sparse, and hybrid retrieval strategies
-   How re-ranking transforms noisy retrieval results into precise, relevant context
-   How to construct augmented prompts that ground generation in retrieved evidence
-   Evaluation metrics and failure modes specific to RAG systems

## 8.1 Why RAG

Large language models store knowledge in their parameters. This parametric knowledge has three fundamental limitations. First, it is frozen at training time. A model trained in January does not know about a policy change in March. Second, it is lossy. The model compresses billions of documents into billions of parameters, and rare facts, such as your company’s specific refund terms, a patient’s medication history, or last quarter’s financial results, are the first to blur. Third, it is unverifiable. When a model generates an answer from parametric memory, there is no source to cite, no document to check, and no way to distinguish knowledge from confabulation.

Retrieval-Augmented Generation addresses all three by injecting external documents into the prompt at inference time. Instead of asking the model to recall facts from training, you retrieve the relevant documents and hand them to the model as context. The model generates its answer grounded in those documents, not in compressed parametric memory.

The architecture is deceptively simple: given a query, find the relevant documents, insert them into the prompt, and ask the model to answer using only that context. The engineering challenge lives in every part of that sentence. “Find” requires a retrieval system that works at scale. “Relevant” requires understanding what relevance means for your domain. “Insert them into the prompt” requires chunking strategies that preserve meaning within token limits. “Answer using only that context” requires prompt design that prevents the model from falling back to parametric memory when the retrieved context is insufficient.

> RAG vs. Fine-Tuning
> 
> Fine-tuning bakes knowledge into model weights. RAG injects knowledge at inference time. Use fine-tuning to change *how* the model behaves (tone, format, reasoning style). Use RAG to change *what* the model knows (facts, policies, domain data). Most production systems use both: a fine-tuned model with a RAG pipeline for current, verifiable knowledge.

## 8.2 Document Loading

Every RAG pipeline starts with getting documents into a format you can process. This sounds trivial until you face the reality of enterprise data: PDFs where tables render as scattered characters, PowerPoints with speaker notes that contain the real content, Confluence pages with nested macros, and Slack threads where the answer spans twelve messages across two channels.

A document loader is responsible for extracting clean text from source formats while preserving structural information that matters for downstream chunking.

```
from pathlib import Path
from dataclasses import dataclass, field

@dataclass
class Document:
    """A loaded document with content and metadata."""
    content: str
    metadata: dict = field(default_factory=dict)
    source: str = ""
    doc_type: str = ""

class DocumentLoader:
    """Load documents from various formats into a unified structure."""

    def __init__(self):
        self._loaders = {
            ".pdf": self._load_pdf,
            ".md": self._load_markdown,
            ".txt": self._load_text,
            ".html": self._load_html,
            ".docx": self._load_docx,
        }

    def load(self, path: str) -> list[Document]:
        """Load a file and return a list of Documents."""
        p = Path(path)
        loader = self._loaders.get(p.suffix.lower())
        if not loader:
            raise ValueError(f"Unsupported format: {p.suffix}")
        return loader(p)

    def _load_pdf(self, path: Path) -> list[Document]:
        import fitz  # PyMuPDF
        docs = []
        pdf = fitz.open(str(path))
        for page_num, page in enumerate(pdf):
            text = page.get_text("text")
            if text.strip():
                docs.append(Document(
                    content=text,
                    metadata={"page": page_num + 1, "total_pages": len(pdf)},
                    source=str(path),
                    doc_type="pdf",
                ))
        return docs

    def _load_markdown(self, path: Path) -> list[Document]:
        text = path.read_text(encoding="utf-8")
        return [Document(content=text, source=str(path), doc_type="markdown")]

    def _load_text(self, path: Path) -> list[Document]:
        text = path.read_text(encoding="utf-8")
        return [Document(content=text, source=str(path), doc_type="text")]

    def _load_html(self, path: Path) -> list[Document]:
        from bs4 import BeautifulSoup
        html = path.read_text(encoding="utf-8")
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()
        text = soup.get_text(separator="\n", strip=True)
        return [Document(content=text, source=str(path), doc_type="html")]

    def _load_docx(self, path: Path) -> list[Document]:
        import docx
        doc = docx.Document(str(path))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return [Document(
            content="\n\n".join(paragraphs),
            source=str(path), doc_type="docx",
        )]
```

**Metadata matters.** Every document should carry its source path, page number, section heading, creation date, and any domain-specific tags. This metadata flows through the entire pipeline. It helps chunking preserve section boundaries, helps retrieval filter by date or category, and helps generation cite sources. Losing metadata at the loading stage is a debt you pay at every downstream stage.

## 8.3 Chunking Strategies

Models have finite context windows. Even with 128k-token models, stuffing entire documents into the prompt wastes tokens on irrelevant content and drowns the relevant passages in noise. Chunking splits documents into smaller pieces that can be independently indexed and retrieved.

The goal of chunking is to create pieces that are semantically self-contained, where each chunk makes sense on its own, and retrieval-aligned, where a relevant query matches the chunk that contains the answer rather than a chunk that contains half the answer and half of something else.

### Fixed-Size Chunking

Split every N characters (or tokens) with an overlap window. Simple, fast, and surprisingly effective as a baseline:

```
def chunk_fixed(text: str, size: int = 512, overlap: int = 64) -> list[str]:
    """Split text into fixed-size chunks with overlap."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk.strip())
        start = end - overlap
    return chunks
```

The problem: fixed-size chunks slice through sentences, paragraphs, and sections without regard for meaning. A chunk might start mid-sentence and end mid-paragraph, making it semantically incoherent.

### Recursive Character Splitting

Try to split on paragraph boundaries first, then sentences, then words, then characters. This produces chunks that respect natural text boundaries:

```
def chunk_recursive(
    text: str,
    max_size: int = 512,
    separators: list[str] = None,
) -> list[str]:
    """Recursively split text using hierarchical separators."""
    if separators is None:
        separators = ["\n\n", "\n", ". ", " "]

    if len(text) <= max_size:
        return [text.strip()] if text.strip() else []

    # Try each separator in order of preference
    for sep in separators:
        if sep in text:
            parts = text.split(sep)
            chunks = []
            current = ""
            for part in parts:
                candidate = current + sep + part if current else part
                if len(candidate) <= max_size:
                    current = candidate
                else:
                    if current.strip():
                        chunks.append(current.strip())
                    current = part
            if current.strip():
                chunks.append(current.strip())

            # If any chunk is still too large, recurse with next separator
            result = []
            remaining_seps = separators[separators.index(sep) + 1:]
            for c in chunks:
                if len(c) > max_size and remaining_seps:
                    result.extend(chunk_recursive(c, max_size, remaining_seps))
                else:
                    result.append(c)
            return result

    # No separator worked; hard split
    return chunk_fixed(text, max_size, overlap=0)
```

### Semantic Chunking

Use embeddings to detect topic shifts. Compute the embedding of each sentence, then split where the cosine similarity between consecutive sentences drops below a threshold. This produces chunks that align with topic boundaries rather than character counts:

```
import numpy as np

def chunk_semantic(
    sentences: list[str],
    embeddings: np.ndarray,
    threshold: float = 0.75,
    max_size: int = 512,
) -> list[str]:
    """Split sentences into chunks at semantic boundaries."""
    chunks = []
    current_sentences = [sentences[0]]

    for i in range(1, len(sentences)):
        similarity = np.dot(embeddings[i - 1], embeddings[i])
        combined = " ".join(current_sentences + [sentences[i]])

        if similarity < threshold or len(combined) > max_size:
            chunks.append(" ".join(current_sentences))
            current_sentences = [sentences[i]]
        else:
            current_sentences.append(sentences[i])

    if current_sentences:
        chunks.append(" ".join(current_sentences))
    return chunks
```

> Chunk Size Rules of Thumb
> 
> For most use cases, 256–512 tokens per chunk is the sweet spot. Smaller chunks (128 tokens) improve retrieval precision but lose context — you retrieve the exact sentence but not the surrounding explanation. Larger chunks (1024+ tokens) preserve context but reduce precision — half the chunk may be irrelevant. When in doubt, start with 512 tokens with 64-token overlap and measure retrieval quality before optimizing.

## 8.4 Embedding Models

An embedding model converts text into a dense vector — a list of floating-point numbers, typically 384 to 3072 dimensions — such that semantically similar texts have vectors that are close together in the embedding space. This is the foundation of dense retrieval: you embed the query, embed the documents, and find the documents whose vectors are nearest to the query vector.

Choosing an embedding model involves three tradeoffs:

| Factor | Small Models (384d) | Large Models (1536–3072d) |
| --- | --- | --- |
| Latency | ~1ms per chunk | ~5–15ms per chunk |
| Storage | ~1.5 KB per vector | ~6–12 KB per vector |
| Quality | Good for short, domain-specific text | Better for long, nuanced queries |
| Cost | Can run locally on CPU | Often requires API calls or GPU |

```
from openai import OpenAI

client = OpenAI()

def embed_texts(texts: list[str], model: str = "text-embedding-3-small") -> list[list[float]]:
    """Embed a batch of texts using the OpenAI embedding API."""
    response = client.embeddings.create(input=texts, model=model)
    return [item.embedding for item in response.data]

def embed_single(text: str, model: str = "text-embedding-3-small") -> list[float]:
    """Embed a single text string."""
    return embed_texts([text], model=model)[0]
```

**Batch your embeddings.** Embedding one chunk at a time during indexing is the single most common performance mistake in RAG pipelines. The OpenAI API accepts up to 2048 texts per call. Local models like `sentence-transformers` are even faster with batching because they utilize GPU parallelism. Always embed in batches of 64–256 texts.

**Normalize your vectors.** If you plan to use cosine similarity for retrieval (you should), normalize your embeddings to unit length after computing them. This turns cosine similarity into a simple dot product, which vector databases can compute much faster.

## 8.5 Vector Databases

Once you have embeddings, you need a place to store them and a way to search them efficiently. A vector database is an index optimized for nearest-neighbor search over high-dimensional vectors.

The landscape ranges from in-process libraries to managed cloud services:

| Solution | Type | Best For |
| --- | --- | --- |
| FAISS | Library (in-process) | Prototyping, single-machine workloads up to ~10M vectors |
| ChromaDB | Embedded / client-server | Development and small production deployments |
| Qdrant | Client-server / cloud | Production with filtering, payload storage, and horizontal scaling |
| Pinecone | Managed cloud | Zero-ops production with automatic scaling |
| pgvector | PostgreSQL extension | Teams already using PostgreSQL who want vector search without a new service |

```
import chromadb

class VectorStore:
    """Simple vector store wrapper around ChromaDB."""

    def __init__(self, collection_name: str = "documents", persist_dir: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    def add(self, chunks: list[str], embeddings: list[list[float]],
            metadatas: list[dict] = None, ids: list[str] = None):
        """Add chunks with their embeddings to the store."""
        if ids is None:
            ids = [f"chunk_{i}" for i in range(len(chunks))]
        self.collection.add(
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas or [{} for _ in chunks],
            ids=ids,
        )

    def query(self, query_embedding: list[float], top_k: int = 5,
              where: dict = None) -> dict:
        """Retrieve the top-k most similar chunks."""
        return self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
```

> Index is Not the Database
> 
> A common mistake is treating the vector store as the source of truth for document content. Store the original documents and metadata in a proper database (PostgreSQL, S3, etc.). The vector store holds embeddings and chunk IDs. When you retrieve chunks, use the IDs to fetch full content from the primary store. This lets you update documents without re-embedding unchanged chunks, and it avoids the data integrity issues that arise when your only copy of a document is scattered across vector store records.

## 8.6 Retrieval Strategies

Retrieval is the most critical stage of a RAG pipeline. A perfect generation model cannot compensate for irrelevant retrieved context, and a flawed retrieval system will produce plausible but wrong answers. There are three fundamental approaches.

![Diagram 1](/diagrams/agenticai/rag-pipelines-1.svg)

Figure 8-1. The complete RAG pipeline: documents are chunked, embedded, and indexed during ingestion; at query time, the user query is embedded, matched against the index, re-ranked, and used to augment the generation prompt.

### Dense Retrieval

Dense retrieval uses embedding similarity to find relevant documents. You embed the query, compute similarity against all indexed vectors, and return the top-k nearest neighbors. This is what most people mean when they say “RAG.”

**Strengths:** Captures semantic similarity. A query about “cancellation policy” retrieves chunks about “refund terms” even if the exact word “cancellation” never appears. Handles paraphrases, synonyms, and conceptual matches naturally.

**Weaknesses:** Struggles with exact keyword matching. A query for error code “ERR-4092” may not retrieve the chunk containing that exact code if the embedding space does not preserve lexical tokens. Dense retrieval also struggles with negation and complex logical queries.

### Sparse Retrieval

Sparse retrieval uses traditional information retrieval methods — TF-IDF, BM25 — that match on lexical tokens. BM25 remains the gold standard for keyword-based search:

```
from rank_bm25 import BM25Okapi
import re

class SparseRetriever:
    """BM25-based sparse retrieval."""

    def __init__(self, chunks: list[str]):
        self.chunks = chunks
        tokenized = [self._tokenize(c) for c in chunks]
        self.bm25 = BM25Okapi(tokenized)

    def _tokenize(self, text: str) -> list[str]:
        return re.findall(r"\w+", text.lower())

    def query(self, q: str, top_k: int = 5) -> list[tuple[str, float]]:
        tokens = self._tokenize(q)
        scores = self.bm25.get_scores(tokens)
        top_indices = scores.argsort()[-top_k:][::-1]
        return [(self.chunks[i], scores[i]) for i in top_indices]
```

**Strengths:** Exact keyword matching. Error codes, product IDs, proper nouns, and domain-specific jargon are all retrieved reliably. Fast, interpretable, and requires no GPU or embedding model.

**Weaknesses:** No semantic understanding. “How do I return an item?” will not match a chunk about “refund process” unless the word “return” appears.

### Hybrid Retrieval

Combine dense and sparse retrieval using Reciprocal Rank Fusion (RRF). Run both retrievers, merge their ranked results, and let the fusion function balance semantic and lexical matching:

```
def reciprocal_rank_fusion(
    ranked_lists: list[list[str]],
    k: int = 60,
) -> list[tuple[str, float]]:
    """Merge multiple ranked lists using Reciprocal Rank Fusion."""
    scores = {}
    for ranked_list in ranked_lists:
        for rank, doc_id in enumerate(ranked_list):
            scores[doc_id] = scores.get(doc_id, 0) + 1.0 / (k + rank + 1)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)

class HybridRetriever:
    """Combine dense and sparse retrieval with RRF."""

    def __init__(self, vector_store: VectorStore, sparse_retriever: SparseRetriever,
                 embed_fn, dense_weight: float = 0.6):
        self.vector_store = vector_store
        self.sparse = sparse_retriever
        self.embed_fn = embed_fn
        self.dense_weight = dense_weight

    def query(self, q: str, top_k: int = 5) -> list[str]:
        # Dense retrieval
        q_embedding = self.embed_fn(q)
        dense_results = self.vector_store.query(q_embedding, top_k=top_k * 2)
        dense_ids = dense_results["ids"][0]

        # Sparse retrieval
        sparse_results = self.sparse.query(q, top_k=top_k * 2)
        sparse_ids = [f"chunk_{i}" for i, _ in enumerate(sparse_results)]

        # Fuse results
        fused = reciprocal_rank_fusion([dense_ids, sparse_ids])
        return [doc_id for doc_id, _ in fused[:top_k]]
```

![Diagram 2](/diagrams/agenticai/rag-pipelines-2.svg)

Figure 8-2. Three retrieval strategies compared: dense captures meaning, sparse captures keywords, hybrid combines both through rank fusion for the most robust results.

## 8.7 Re-ranking

Initial retrieval is fast but imprecise. You cast a wide net with top-50 or top-100 results, then use a more expensive model to re-score and re-order them. Re-ranking is the step that transforms noisy retrieval into precise context selection.

The key insight: retrieval models (bi-encoders) process the query and document independently, comparing their embeddings. Re-ranking models (cross-encoders) process the query and document together, allowing deep token-level interaction. This makes them far more accurate but too slow to run against the full index.

```
from sentence_transformers import CrossEncoder

class Reranker:
    """Cross-encoder re-ranker for retrieved passages."""

    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-12-v2"):
        self.model = CrossEncoder(model_name)

    def rerank(self, query: str, passages: list[str], top_k: int = 5) -> list[tuple[str, float]]:
        """Re-rank passages by relevance to query."""
        pairs = [(query, passage) for passage in passages]
        scores = self.model.predict(pairs)

        scored = sorted(
            zip(passages, scores),
            key=lambda x: x[1],
            reverse=True,
        )
        return scored[:top_k]
```

A typical pipeline retrieves 20–50 candidates with the fast bi-encoder, then re-ranks down to 3–5 passages with the cross-encoder. The re-ranking step adds 50–200ms of latency but can improve answer quality by 15–30% as measured by retrieval precision.

> LLM-as-Reranker
> 
> You can use an LLM itself as a re-ranker by prompting it to score passage relevance on a 1–10 scale. This is slower and more expensive than a dedicated cross-encoder but requires no additional model. For low-volume pipelines, it is a pragmatic shortcut: `“Rate the relevance of this passage to the query on a scale of 1-10. Query: {q} Passage: {p}”`

## 8.8 Augmented Generation

Augmented generation is the step where retrieved context meets the language model. The quality of your prompt template determines whether the model faithfully answers from the retrieved documents or ignores them in favor of parametric memory.

```
def build_rag_prompt(query: str, passages: list[str], system_instruction: str = None) -> list[dict]:
    """Construct a RAG prompt with retrieved context."""
    context_block = "\n\n---\n\n".join(
        f"[Source {i+1}]\n{passage}" for i, passage in enumerate(passages)
    )

    system = system_instruction or (
        "You are a helpful assistant. Answer the user's question using ONLY "
        "the provided context. If the context does not contain enough information "
        "to answer the question, say so clearly. Do not make up information. "
        "Cite your sources using [Source N] notation."
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": (
            f"Context:\n{context_block}\n\n"
            f"---\n\n"
            f"Question: {query}\n\n"
            f"Answer based on the context above:"
        )},
    ]
```

Three prompt design principles that matter for RAG:

**Explicit grounding instructions.** Tell the model to use only the provided context. Without this, models will blend retrieved context with parametric memory, and you lose the verifiability that makes RAG valuable.

**Source attribution.** Require the model to cite which source or sources it used for each claim. This enables downstream verification and gives users confidence in the answer. A citation that points to a real passage is more valuable than a confident answer with no provenance.

**Graceful failure.** Instruct the model to say it does not have enough information to answer rather than hallucinating when the retrieved context does not contain the answer. This is the hardest instruction to enforce. Models are trained to be helpful, and declining to answer feels unhelpful. Testing this failure mode explicitly is essential.

```
import openai

class RAGPipeline:
    """Complete RAG pipeline: retrieve, re-rank, augment, generate."""

    def __init__(self, retriever: HybridRetriever, reranker: Reranker,
                 model: str = "gpt-4o"):
        self.retriever = retriever
        self.reranker = reranker
        self.model = model
        self.client = openai.OpenAI()

    def answer(self, query: str, top_k_retrieve: int = 20,
               top_k_rerank: int = 5) -> dict:
        """Answer a query using the full RAG pipeline."""
        # Step 1: Retrieve candidates
        candidate_ids = self.retriever.query(query, top_k=top_k_retrieve)

        # Step 2: Fetch full text for candidates
        candidates = self._fetch_texts(candidate_ids)

        # Step 3: Re-rank
        reranked = self.reranker.rerank(query, candidates, top_k=top_k_rerank)
        passages = [text for text, score in reranked]

        # Step 4: Build augmented prompt
        messages = build_rag_prompt(query, passages)

        # Step 5: Generate
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.1,
        )

        return {
            "answer": response.choices[0].message.content,
            "sources": passages,
            "model": self.model,
        }

    def _fetch_texts(self, doc_ids: list[str]) -> list[str]:
        """Fetch full chunk texts from the store by ID."""
        # Implementation depends on your storage backend
        results = self.retriever.vector_store.collection.get(ids=doc_ids)
        return results["documents"]
```

## 8.9 Advanced Patterns

The basic RAG pipeline — retrieve, augment, generate — works for straightforward factual questions. Complex queries require more sophisticated patterns.

### Query Transformation

Users ask vague, ambiguous, or multi-part questions. Transforming the query before retrieval can dramatically improve results:

```
def expand_query(query: str, client: openai.OpenAI) -> list[str]:
    """Generate multiple search queries from a single user question."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "system",
            "content": (
                "Generate 3 different search queries that would help "
                "answer the user's question. Return one query per line."
            )
        }, {
            "role": "user",
            "content": query,
        }],
        temperature=0.7,
    )
    queries = response.choices[0].message.content.strip().split("\n")
    return [q.strip() for q in queries if q.strip()]
```

**Multi-query retrieval** generates multiple reformulations of the user’s question, retrieves for each, then merges the results. This catches relevant documents that any single query formulation might miss.

### Parent Document Retrieval

Small chunks improve retrieval precision, but the model needs surrounding context to generate a good answer. Parent document retrieval solves this by indexing small chunks for retrieval but returning the larger parent document (or section) for generation. You get the precision of small chunks with the context of large documents.

### Contextual Compression

After retrieval, use an LLM to extract only the relevant sentences from each retrieved chunk. This removes noise from the context window, letting you retrieve more documents while keeping token usage manageable.

> The Lost-in-the-Middle Problem
> 
> Research shows that LLMs pay the most attention to information at the beginning and end of the context window, and tend to ignore information in the middle. If you retrieve 10 passages, the model is most likely to use passages 1–2 and 9–10, and least likely to use passages 5–6. Mitigation: retrieve fewer, higher-quality passages (re-ranking helps here), or place the most relevant passages at the beginning of the context block.

## 8.10 Evaluation

RAG evaluation requires measuring two stages independently: **retrieval quality** (did you find the right documents?) and **generation quality** (did you produce the right answer from those documents?).

### Retrieval Metrics

| Metric | What It Measures | When to Use |
| --- | --- | --- |
| Precision@k | Fraction of top-k results that are relevant | When false positives waste tokens and degrade answers |
| Recall@k | Fraction of all relevant documents found in top-k | When missing a relevant document causes wrong answers |
| MRR | Reciprocal rank of the first relevant result | When you mainly use the top-1 result for generation |
| NDCG@k | Quality of the ranking order | When the position of relevant results matters, not just presence |

### Generation Metrics

**Faithfulness:** Does the answer contain only claims supported by the retrieved context? An unfaithful answer introduces facts not present in the provided documents, even if those facts happen to be correct. Faithfulness is the defining metric for RAG because the entire point is grounded generation.

**Relevance:** Does the answer address the user’s question? A faithful answer that is off-topic is useless.

**Completeness:** Does the answer cover all aspects of the question? If the user asks about both pricing and availability, an answer that only covers pricing is incomplete.

```
def evaluate_faithfulness(answer: str, sources: list[str],
                          client: openai.OpenAI) -> dict:
    """Use an LLM to evaluate answer faithfulness against sources."""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": (
                "You are an evaluation judge. Given an answer and its source "
                "documents, identify every factual claim in the answer. For each "
                "claim, determine if it is supported by the sources. Return JSON: "
                '{"claims": [{"claim": "...", "supported": true/false, '
                '"source": "Source N or null"}], "faithfulness_score": 0.0-1.0}'
            )
        }, {
            "role": "user",
            "content": (
                f"Answer: {answer}\n\n"
                f"Sources:\n" + "\n---\n".join(
                    f"[Source {i+1}] {s}" for i, s in enumerate(sources)
                )
            ),
        }],
        response_format={"type": "json_object"},
    )
    import json
    return json.loads(response.choices[0].message.content)
```

> The RAGAS Framework
> 
> The open-source RAGAS library provides automated evaluation of RAG pipelines across four dimensions: faithfulness, answer relevance, context precision, and context recall. It uses LLM-as-judge to score each dimension without requiring human-labeled ground truth for every test case. It is the fastest path to systematic RAG evaluation, though you should validate its scores against human judgment on a sample of 50–100 queries before trusting it fully.

## 8.11 Common Failure Modes

RAG systems fail in predictable ways. Knowing these patterns lets you diagnose and fix issues systematically.

**Wrong chunks retrieved.** The most common failure. The retrieval step returns passages that look superficially similar to the query but do not contain the answer. Fix: improve chunking to preserve semantic coherence, add metadata filtering, or switch to hybrid retrieval.

**Answer not in knowledge base.** The user asks a question whose answer is not in your documents. The model, instead of admitting ignorance, generates an answer from parametric memory. Fix: strengthen the grounding instruction in your prompt and add an explicit confidence threshold. If no retrieved passage scores above a minimum relevance, return a canned “I do not have this information” response before the model even sees the query.

**Stale index.** Documents are updated but the vector index still contains embeddings of the old content. The model generates answers from outdated information, which is the exact problem RAG was supposed to solve. Fix: implement incremental indexing with document versioning. When a source document changes, delete its old chunks and re-index the new version.

**Context window overflow.** Too many retrieved passages are inserted into the prompt, exceeding the context window or diluting relevance. Fix: aggressive re-ranking, contextual compression, or parent document retrieval with smaller indexed chunks.

**Contradictory sources.** Two retrieved passages contain conflicting information (an old policy and a new one, for example). The model picks one arbitrarily or tries to reconcile them, producing a confused answer. Fix: metadata-based date filtering to prefer newer documents, or explicit instructions to flag contradictions.

## Project: RAG Pipeline Builder

Build a complete, end-to-end RAG pipeline that ingests documents from at least two formats, chunks and embeds them, stores them in a vector database, retrieves using hybrid search, re-ranks results, and generates cited answers. Your pipeline should include an evaluation harness that measures retrieval precision and answer faithfulness on a test set of at least 20 query-answer pairs.

### Requirements

1.  **Document loading.** Support at least PDF and Markdown. Preserve metadata (source, page number, section heading) through the entire pipeline.
2.  **Chunking.** Implement two strategies (recursive character splitting and one of: semantic or fixed-size). Make chunk size and overlap configurable. Compare retrieval quality across strategies.
3.  **Embedding and indexing.** Batch-embed all chunks and store them in a vector database (ChromaDB, FAISS, or Qdrant). Support incremental indexing: adding new documents without re-embedding existing ones.
4.  **Hybrid retrieval.** Implement both dense (vector similarity) and sparse (BM25) retrieval, combined with Reciprocal Rank Fusion.
5.  **Re-ranking.** Add a cross-encoder re-ranker. Measure the precision improvement over retrieval without re-ranking.
6.  **Augmented generation.** Build a prompt template with grounding instructions, source attribution, and graceful failure handling. The model must cite sources in every answer.
7.  **Evaluation.** Create a test set of 20+ questions with known answers. Measure retrieval precision@5, recall@5, answer faithfulness, and answer relevance. Report results in a summary table.

### Domain Variants

| Variant | Domain | Knowledge Sources |
| --- | --- | --- |
| Developer Docs Search | Tech / Software | API docs, READMEs, changelogs, Stack Overflow |
| Clinical Knowledge Base | Healthcare | Drug monographs, clinical guidelines, patient education |
| Financial Analyst Assistant | Finance | Earnings reports, SEC filings, market research notes |
| Course Material Tutor | Education | Textbook chapters, lecture notes, past exams |
| Product Support Agent | E-commerce | Product specs, return policies, shipping FAQs |
| Legal Research Assistant | Legal | Case law, statutes, contract templates, compliance docs |

## Summary

RAG solves the fundamental limitation of parametric knowledge in language models: training data is frozen, lossy, and unverifiable. By retrieving relevant documents at inference time and injecting them into the prompt, RAG gives models access to current, domain-specific, and citable knowledge. The engineering challenge lives in every stage of the pipeline: loading clean text from messy formats, chunking documents into semantically coherent pieces, choosing embedding models that balance cost and quality, building retrieval systems that combine semantic and lexical search, re-ranking to surface the most relevant passages, and designing prompts that ground the model in the retrieved context rather than its parametric memory.

-   RAG addresses the three limitations of parametric knowledge — staleness, lossy compression, and unverifiability — by injecting external documents into the prompt at inference time. It is not a replacement for fine-tuning; it solves a different problem.
-   Chunking strategy determines retrieval quality more than any other single factor. Aim for semantically self-contained chunks of 256–512 tokens, and always preserve metadata through the pipeline for filtering and citation.
-   Hybrid retrieval (dense + sparse with Reciprocal Rank Fusion) consistently outperforms either strategy alone. Dense captures semantics; sparse captures keywords. Production systems should use both.
-   Re-ranking with a cross-encoder transforms noisy retrieval results into precise context. The cost is 50–200ms of additional latency, but the quality improvement of 15–30% in retrieval precision is almost always worth it.
-   Evaluation must measure retrieval and generation independently. Faithfulness — whether the answer contains only claims supported by the retrieved sources — is the defining metric for RAG, because the entire value proposition is grounded, verifiable generation.

### Exercises

| Type | Exercise | Description |
| --- | --- | --- |
| Conceptual | **Chunking trade-offs** | Your RAG pipeline uses 512-token chunks, but users report that answers to questions spanning multiple sections are incomplete. You consider doubling chunk size to 1024 tokens. Analyze the trade-offs: what improves, what degrades, and what alternative approach (not changing chunk size) could address the problem while preserving retrieval precision? |
| Coding | **Incremental indexing** | Implement a document versioning system for your vector store. When a source document is updated, your system should: detect which chunks have changed (using content hashing), delete stale chunk embeddings, embed and index only the new or modified chunks, and update metadata timestamps. Benchmark the time savings compared to full re-indexing on a corpus of 100+ documents. |
| Design | **Multi-tenant RAG** | Design a RAG architecture for a SaaS platform where each customer has their own document corpus but shares the same embedding model and generation infrastructure. Address: data isolation (customer A must never see customer B’s documents in retrieval results), per-tenant index management, cost allocation, and what happens when one customer’s corpus grows to 10x the size of the average tenant. Sketch the data model and the query flow. |