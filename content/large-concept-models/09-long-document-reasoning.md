---
title: "Long-Document Reasoning at Scale"
slug: "long-document-reasoning"
description: "The flagship enterprise LCM use case: coherent reasoning over documents that exceed what any LLM context window handles well. This chapter covers the architecture, the worked example, and the implementation patterns."
section: "large-concept-models"
order: 9
part: "Part 03 Enterprise Application"
---

Part 3 — Enterprise Application

# Long-Document Reasoning at Scale

A procurement officer at a large US infrastructure company needed to compare a 400-page construction contract against the master agreement it purported to modify. She loaded both documents into a frontier LLM with a 200,000-token context window. The model produced a summary of each document — accurate, well-organized, clearly useful. It did not identify the semantic contradiction buried between clause 12.3 of the master agreement and clause 8.7 of the new agreement, which created an obligation for the company to provide performance bonds that the master agreement explicitly exempted them from.

The obligation cost the company $4.2 million in bonding fees before the legal team caught it during execution, eleven months after contract signing. The LLM did not fail because it was too small. It failed because the token ceiling is a representational constraint, and two clauses that mean contradictory things using entirely different vocabulary are not well-served by token-level attention.

This chapter covers the LCM architecture for long-document reasoning: how to encode, how to reason, and how to surface the results in a form human experts can act on.

### What You Will Learn

- Design a complete LCM pipeline for long-document analysis and comparison
- Apply semantic similarity thresholds for contradiction detection across document sections
- Implement concept-level retrieval for large document corpora
- Structure the output of LCM long-document analysis for human expert review
- Identify the evaluation criteria specific to long-document reasoning tasks

## 9.1 The Architecture Pattern

Long-document reasoning with LCMs follows a consistent four-stage architecture: encode, index, reason, and surface.

**Stage 1: Encode.** Every sentence in every document is encoded by SONAR into a concept embedding. Sentences that span multiple propositions (common in legal and regulatory text) are split at clause boundaries before encoding. The output is a structured corpus: for each document, a list of (sentence_text, concept_embedding, document_id, section_id, sentence_index) tuples. This corpus is the working representation of the document set for all subsequent operations.

**Stage 2: Index.** The concept embeddings are loaded into a vector database organized by document and section. The vector database enables efficient semantic search: given any query concept embedding, retrieve the K most similar embeddings from the corpus, with their source document and section metadata. Pinecone, Weaviate, Qdrant, and ChromaDB all support this pattern. The indexing step converts the flat list of embeddings into a queryable semantic structure.

**Stage 3: Reason.** The concept model operates over the indexed corpus. For comparison tasks, the reasoning step computes pairwise semantic similarities between sections of different documents, identifies clusters of semantically equivalent content, and flags pairs where embeddings are close in subject matter but diverge in semantic direction (potential contradictions). For synthesis tasks, the reasoning step generates output concept embeddings representing the synthesized conclusions across all source documents.

**Stage 4: Surface.** The reasoning results are decoded into natural language and structured for human review. For contradiction detection, the output is a list of candidate contradiction pairs, each presented with the relevant document sections, a similarity score, and the specific semantic dimension that the model identified as divergent. For synthesis, the output is a structured document decoded from the synthesis concept embeddings.

## 9.2 Worked Example: Regulatory Compliance Analysis Across 12 Jurisdictions

A multinational bank must maintain compliance with capital adequacy regulations across 12 jurisdictions. Each jurisdiction has its own regulatory text. Regulations change on different schedules. The compliance team needs to know: which jurisdictions have equivalent requirements that could be addressed by a single control, and which have requirements that appear similar but are subtly different in ways that require separate controls?

**Encoding the corpus:**

```python
from sonar.inference_pipelines.text import TextToEmbeddingModelPipeline
import numpy as np

# Initialize SONAR encoder
encoder = TextToEmbeddingModelPipeline(
    encoder="text_sonar_basic_encoder",
    tokenizer="text_sonar_basic_encoder"
)

def encode_document(doc_text: str, doc_id: str, lang: str) -> list[dict]:
    """Encode a document into sentence-level concept embeddings."""
    sentences = split_into_sentences(doc_text)  # Clause-aware sentence splitter
    embeddings = encoder.predict(sentences, source_lang=lang)

    return [
        {
            "doc_id": doc_id,
            "sentence_idx": i,
            "text": sent,
            "embedding": emb.tolist(),
            "lang": lang
        }
        for i, (sent, emb) in enumerate(zip(sentences, embeddings))
    ]

# Encode all 12 regulatory documents
corpus = []
for doc in regulatory_documents:
    corpus.extend(encode_document(doc.text, doc.jurisdiction, doc.language))
```

**Cross-jurisdiction similarity search:**

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import uuid

client = QdrantClient(":memory:")
client.create_collection(
    collection_name="regulatory_corpus",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
)

# Load corpus into vector DB
points = [
    PointStruct(
        id=str(uuid.uuid4()),
        vector=item["embedding"],
        payload={k: v for k, v in item.items() if k != "embedding"}
    )
    for item in corpus
]
client.upsert(collection_name="regulatory_corpus", points=points)

def find_cross_jurisdiction_equivalents(
    query_embedding: list[float],
    source_jurisdiction: str,
    top_k: int = 10,
    threshold: float = 0.85
) -> list[dict]:
    """Find semantically equivalent requirements in other jurisdictions."""
    results = client.search(
        collection_name="regulatory_corpus",
        query_vector=query_embedding,
        limit=top_k,
        score_threshold=threshold,
        query_filter={
            "must_not": [{"key": "doc_id", "match": {"value": source_jurisdiction}}]
        }
    )
    return [
        {"text": r.payload["text"], "jurisdiction": r.payload["doc_id"],
         "score": r.score, "sentence_idx": r.payload["sentence_idx"]}
        for r in results
    ]
```

**Contradiction detection:**

```python
def detect_contradictions(
    embedding_a: list[float],
    embedding_b: list[float],
    similarity_threshold: float = 0.75,
    contradiction_threshold: float = 0.25
) -> bool:
    """
    Detect potential contradiction: high semantic similarity in subject matter
    but low similarity on the obligation dimension.
    """
    import numpy as np
    a, b = np.array(embedding_a), np.array(embedding_b)
    overall_similarity = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    # High overall similarity means same topic
    if overall_similarity < similarity_threshold:
        return False

    # Project onto the learned obligation direction
    # (obligation_direction is a precomputed vector in concept space)
    a_obligation = np.dot(a, obligation_direction)
    b_obligation = np.dot(b, obligation_direction)

    # Large difference in obligation projection = potential contradiction
    return abs(a_obligation - b_obligation) > contradiction_threshold
```

**Surfacing results for human review:**

The output for each potential contradiction should include: the two source sentences, their jurisdictions, their overall semantic similarity score, and the specific semantic dimension (obligation, scope, timeline, entity) where they diverge. This structure gives the compliance analyst exactly what they need to make a human judgment without reading the full document pair.

```
POTENTIAL CONTRADICTION DETECTED
Similarity score: 0.87 (same topic, high confidence)
Obligation divergence: 0.34 (significant)

US OCC Capital Adequacy Rule §12.4:
"Covered institutions with total assets exceeding $250 billion shall maintain
a minimum common equity tier 1 capital ratio of 13 percent."

EU CRR Article 92(1)(a):
"Institutions shall at all times satisfy the following own funds requirements:
a common equity tier 1 capital ratio of 4.5%."

REVIEW RECOMMENDED: Same subject matter (CET1 ratio requirement),
different obligation amounts (13% vs 4.5%). Verify whether the scope
definitions ("covered institutions" vs "institutions") create different
applicability, or whether these are genuinely contradictory thresholds
for the same entity class.
```

## 9.3 Scale Considerations

Long-document reasoning at enterprise scale involves corpus sizes and query frequencies that require architectural choices beyond the single-system prototype.

**Corpus size.** For corpora under 100,000 sentences (approximately 10,000 pages), in-memory vector databases are sufficient. For larger corpora, distributed vector databases with sharding by document or by topic cluster are appropriate. The embedding size (1,024 floats per sentence × 4 bytes = 4KB per sentence) means 100,000 sentences requires approximately 400MB of embedding storage — manageable in memory. 10 million sentences requires approximately 40GB — requires a distributed system.

**Re-encoding on document update.** When regulatory documents are updated, the affected sentences must be re-encoded and the vector database updated. For corpora that change infrequently (annual regulatory updates), a batch re-encoding process is sufficient. For corpora that change frequently (news feeds, real-time filings), incremental encoding and update pipelines are required.

**Query frequency.** A compliance team running weekly regulatory scans generates a predictable, low-frequency query load. An M&A team doing ad-hoc due diligence generates a bursty, high-frequency load during deal periods. Size the inference infrastructure for peak load, not average load, and plan for SONAR encoding overhead in the peak load calculation.

## 9.4 Evaluation Criteria

Evaluating long-document reasoning systems requires domain-specific criteria. Token-overlap metrics (BLEU, ROUGE) are inappropriate because they measure surface similarity, not semantic accuracy.

**Precision on contradiction detection.** Of the pairs flagged as potential contradictions, what fraction are genuine contradictions (as assessed by domain experts)? High precision means few false alarms that waste expert review time.

**Recall on contradiction detection.** Of the genuine contradictions in the corpus, what fraction does the system flag? High recall means the system is catching the problems that matter. For legal and regulatory use cases, recall is typically more important than precision — a missed contradiction is more costly than a false alarm.

**Cross-jurisdiction equivalence accuracy.** Of the pairs flagged as semantically equivalent across jurisdictions, what fraction are genuinely equivalent? Measure separately for within-language pairs and cross-language pairs, as SONAR alignment quality varies.

**Human expert time reduction.** The practical business metric: how many hours of expert review time does the system save per analysis cycle? This is the metric that justifies the investment and should be tracked from the first production deployment.

## Summary

Long-document reasoning follows a four-stage LCM pattern: encode documents into sentence-level concept embeddings, index in a vector database, reason with semantic similarity and contradiction detection, and surface results for human expert review. The pattern resolves the token-ceiling failure modes that make LLMs unreliable for cross-document comparison and within-document consistency checking.

- **Four stages: encode, index, reason, surface.** Each stage has clear inputs, outputs, and implementation choices.
- **Contradiction detection is geometric.** High semantic similarity + divergent obligation projection = potential contradiction. The geometry makes the detection reliable across vocabulary differences.
- **Scale requires infrastructure planning.** Corpus size and query frequency determine whether in-memory or distributed vector databases are appropriate.
- **Evaluation must be domain-specific.** Precision and recall on contradiction detection, equivalence accuracy, and expert time reduction are the correct metrics. Token overlap is not.

### Exercises

| Type | Exercise | Description |
|------|----------|-------------|
| Coding | **Contradiction detector** | Implement the four-stage pipeline for a small corpus (five regulatory documents, 10-20 pages each, in English). Use SONAR for encoding and ChromaDB for indexing. Implement the contradiction detection function using cosine similarity as the subject-matter similarity measure and a manually defined obligation direction vector. Report the precision of your detector on a set of known contradictions in your test corpus. |
| Design | **Re-encoding pipeline** | A regulatory compliance system must handle quarterly updates to 12 regulatory documents. Design an incremental re-encoding pipeline that identifies which sentences changed, re-encodes only those sentences, and updates the vector database without a full re-indexing pass. What are the edge cases (sentence addition, deletion, reordering) and how does your design handle them? |
| Analysis | **Evaluation protocol** | Design an evaluation protocol for the cross-jurisdiction equivalence detection task. How would you construct a gold standard of known-equivalent and known-non-equivalent sentence pairs? How would you measure precision and recall? What sample size do you need to detect a meaningful performance difference between two system configurations? |
