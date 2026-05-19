---
title: "Capstone 1: Cross-Document Policy Synthesizer"
slug: "capstone-01"
description: "A compliance analyst at a global bank spends three weeks every quarter reconciling capital adequacy requirements across 12 jurisdictions. The requirements use different vocabulary in different languages. Some contradict each other in ways that are not obvious until a regulator points them out. This capstone builds the system that finds the contradictions first."
section: "beyond-llms-large-concept-models"
order: 17
part: "Part 05 Capstones"
---

Part 5 — Capstones

# Capstone 1: Cross-Document Policy Synthesizer

A compliance analyst at a global bank spends three weeks every quarter reconciling capital adequacy requirements across 12 jurisdictions. The requirements use different vocabulary in different languages. Some contradict each other in ways that are not obvious until a regulator points them out during an examination — at which point the bank has a finding, a remediation timeline, and a public disclosure obligation.

The analyst's current process: translate all non-English documents into English, read each pair of regulations looking for overlapping topics, manually cross-reference clauses that appear related, flag potential contradictions for the legal team. Three weeks, every quarter, for a task that is fundamentally a semantic comparison problem.

This capstone builds the system that does the comparison in concept space — detecting semantic equivalences and contradictions across languages and vocabulary without translation as a preprocessing step.

### What You Will Learn

- Build a complete SONAR encoding pipeline for a multilingual document corpus
- Implement semantic similarity search for cross-jurisdiction equivalence detection
- Implement contradiction detection using concept-space geometry
- Structure output for human expert review
- Measure precision and recall on contradiction detection against a manually annotated gold standard

## C1.1 System Overview

The Cross-Document Policy Synthesizer is a four-component system:

| Component | Input | Output | Technology |
|-----------|-------|--------|------------|
| **Encoder** | Raw regulatory documents (multiple languages) | Concept embedding corpus | SONAR |
| **Index** | Concept embedding corpus | Queryable semantic index | Qdrant / ChromaDB |
| **Analyzer** | Semantic index | Equivalence pairs, contradiction candidates | Concept-space geometry |
| **Reporter** | Equivalence pairs, contradiction candidates | Structured review report | Decoded natural language |

The system does not replace the compliance analyst. It transforms their job from "read all twelve regulations looking for problems" to "review the 30 highest-priority pairs the system flagged." The analyst brings domain judgment; the system brings semantic scale.

## C1.2 Data Model

```python
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

class FindingType(str, Enum):
    EQUIVALENT = "equivalent"
    POTENTIAL_CONTRADICTION = "potential_contradiction"
    PARTIAL_OVERLAP = "partial_overlap"

@dataclass
class RegulatoryClause:
    clause_id: str
    jurisdiction: str
    source_lang: str
    text: str
    document_title: str
    section_reference: str
    embedding: list[float] = field(default_factory=list)

@dataclass
class PolicyFinding:
    finding_id: str
    finding_type: FindingType
    clause_a: RegulatoryClause
    clause_b: RegulatoryClause
    similarity_score: float
    obligation_divergence: float | None  # Only for contradictions
    review_priority: int  # 1 = highest
    analyst_notes: str = ""
    reviewed: bool = False
```

## C1.3 Encoding Pipeline

```python
from sonar.inference_pipelines.text import TextToEmbeddingModelPipeline
import spacy

encoder = TextToEmbeddingModelPipeline(
    encoder="text_sonar_basic_encoder",
    tokenizer="text_sonar_basic_encoder"
)

# Language detection maps ISO codes to SONAR language codes
SONAR_LANG_MAP = {
    "en": "eng_Latn", "fr": "fra_Latn", "de": "deu_Latn",
    "es": "spa_Latn", "ja": "jpn_Jpan", "zh": "zho_Hans",
    # Add languages for your jurisdiction set
}

def encode_regulatory_document(
    document_text: str,
    jurisdiction: str,
    document_title: str,
    source_lang: str
) -> list[RegulatoryClause]:
    """
    Split document into clauses and encode each with SONAR.
    Uses clause-boundary splitting for legal text (not just sentence boundaries).
    """
    # Clause-aware splitting for regulatory text
    clauses = split_into_regulatory_clauses(document_text)
    sonar_lang = SONAR_LANG_MAP[source_lang]
    clause_texts = [c["text"] for c in clauses]

    # Batch encode
    embeddings = encoder.predict(clause_texts, source_lang=sonar_lang)

    return [
        RegulatoryClause(
            clause_id=f"{jurisdiction}_{i:04d}",
            jurisdiction=jurisdiction,
            source_lang=source_lang,
            text=clause["text"],
            document_title=document_title,
            section_reference=clause["section_ref"],
            embedding=emb.tolist()
        )
        for i, (clause, emb) in enumerate(zip(clauses, embeddings))
    ]

def split_into_regulatory_clauses(text: str) -> list[dict]:
    """
    Split regulatory text at clause boundaries.
    Regulatory clauses often span multiple sentences — split at
    numbered clause markers and major structural boundaries.
    """
    import re
    # Pattern: numbered clauses like "12.4", "Article 8", "Section III"
    clause_pattern = re.compile(
        r'(?=(?:Article|Section|Clause|§)\s*\d+|^\d+\.\d+)',
        re.MULTILINE
    )
    parts = clause_pattern.split(text)
    return [
        {"text": part.strip(), "section_ref": f"clause_{i}"}
        for i, part in enumerate(parts) if part.strip()
    ]
```

## C1.4 Semantic Index

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import uuid

def build_regulatory_index(
    all_clauses: list[RegulatoryClause],
    collection_name: str = "regulatory_corpus"
) -> QdrantClient:
    """
    Load all encoded clauses into a queryable vector database.
    """
    client = QdrantClient(":memory:")  # Use persistent storage for production
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
    )

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=clause.embedding,
            payload={
                "clause_id": clause.clause_id,
                "jurisdiction": clause.jurisdiction,
                "text": clause.text,
                "document_title": clause.document_title,
                "section_reference": clause.section_reference,
                "source_lang": clause.source_lang,
            }
        )
        for clause in all_clauses
    ]
    client.upsert(collection_name=collection_name, points=points)
    return client
```

## C1.5 Equivalence and Contradiction Detection

```python
import numpy as np
from itertools import combinations

def analyze_cross_jurisdiction(
    all_clauses: list[RegulatoryClause],
    index: QdrantClient,
    equivalence_threshold: float = 0.88,
    topic_threshold: float = 0.75,
    contradiction_divergence_threshold: float = 0.25,
    obligation_direction: np.ndarray | None = None
) -> list[PolicyFinding]:
    """
    Find equivalences and contradictions across all jurisdiction pairs.
    """
    findings = []

    # Compare each clause against clauses from other jurisdictions
    for clause in all_clauses:
        results = index.search(
            collection_name="regulatory_corpus",
            query_vector=clause.embedding,
            limit=20,
            score_threshold=topic_threshold,
            query_filter={
                "must_not": [
                    {"key": "jurisdiction", "match": {"value": clause.jurisdiction}}
                ]
            }
        )

        for result in results:
            other_clause = RegulatoryClause(
                clause_id=result.payload["clause_id"],
                jurisdiction=result.payload["jurisdiction"],
                source_lang=result.payload["source_lang"],
                text=result.payload["text"],
                document_title=result.payload["document_title"],
                section_reference=result.payload["section_reference"],
                embedding=result.vector if result.vector else []
            )
            similarity = result.score

            # Determine finding type
            if similarity >= equivalence_threshold:
                finding_type = FindingType.EQUIVALENT
                obligation_divergence = None
                priority = 3  # Lower priority — equivalences are good
            elif obligation_direction is not None:
                # Check for contradiction
                a_emb = np.array(clause.embedding)
                b_emb = np.array(other_clause.embedding)
                a_proj = float(np.dot(a_emb, obligation_direction))
                b_proj = float(np.dot(b_emb, obligation_direction))
                divergence = abs(a_proj - b_proj)

                if divergence > contradiction_divergence_threshold:
                    finding_type = FindingType.POTENTIAL_CONTRADICTION
                    obligation_divergence = divergence
                    priority = 1  # Highest priority
                else:
                    finding_type = FindingType.PARTIAL_OVERLAP
                    obligation_divergence = divergence
                    priority = 2
            else:
                finding_type = FindingType.PARTIAL_OVERLAP
                obligation_divergence = None
                priority = 2

            findings.append(PolicyFinding(
                finding_id=str(uuid.uuid4()),
                finding_type=finding_type,
                clause_a=clause,
                clause_b=other_clause,
                similarity_score=similarity,
                obligation_divergence=obligation_divergence,
                review_priority=priority
            ))

    # Deduplicate (A-B and B-A are the same finding)
    seen = set()
    unique_findings = []
    for f in findings:
        key = tuple(sorted([f.clause_a.clause_id, f.clause_b.clause_id]))
        if key not in seen:
            seen.add(key)
            unique_findings.append(f)

    return sorted(unique_findings, key=lambda f: f.review_priority)
```

## C1.6 Report Generation

```python
def generate_review_report(
    findings: list[PolicyFinding],
    max_findings_per_type: int = 15
) -> str:
    """Generate a structured report for human expert review."""
    contradictions = [f for f in findings if f.finding_type == FindingType.POTENTIAL_CONTRADICTION]
    overlaps = [f for f in findings if f.finding_type == FindingType.PARTIAL_OVERLAP]
    equivalences = [f for f in findings if f.finding_type == FindingType.EQUIVALENT]

    sections = [
        "# Cross-Jurisdiction Policy Analysis Report\n",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}\n",
        f"Total findings: {len(findings)} | "
        f"Contradictions: {len(contradictions)} | "
        f"Overlaps: {len(overlaps)} | "
        f"Equivalences: {len(equivalences)}\n",
        "---\n",
        "## Priority 1: Potential Contradictions (Requires Immediate Review)\n"
    ]

    for f in contradictions[:max_findings_per_type]:
        sections.append(f"""
### Finding: {f.finding_id[:8]}
**Similarity score:** {f.similarity_score:.3f} | **Obligation divergence:** {f.obligation_divergence:.3f}

**{f.clause_a.jurisdiction}** ({f.clause_a.source_lang}) — {f.clause_a.section_reference}:
> {f.clause_a.text[:300]}...

**{f.clause_b.jurisdiction}** ({f.clause_b.source_lang}) — {f.clause_b.section_reference}:
> {f.clause_b.text[:300]}...

*These clauses address the same topic (similarity: {f.similarity_score:.2f}) but diverge significantly on obligation direction (divergence: {f.obligation_divergence:.2f}). Review for regulatory conflict.*

---""")

    return "\n".join(sections)
```

## C1.7 Evaluation: Precision and Recall

Build a gold standard by manually annotating a subset of your corpus before running the system. For 50 clause pairs, record whether each is: a genuine equivalence, a genuine contradiction, a partial overlap, or unrelated. Run the system and compare.

```python
def evaluate_system(
    system_findings: list[PolicyFinding],
    gold_standard: list[dict]  # [{"clause_a_id": ..., "clause_b_id": ..., "true_type": ...}]
) -> dict:
    """Measure precision and recall against gold standard."""
    gold_contradictions = {
        tuple(sorted([g["clause_a_id"], g["clause_b_id"]]))
        for g in gold_standard if g["true_type"] == "contradiction"
    }
    system_contradictions = {
        tuple(sorted([f.clause_a.clause_id, f.clause_b.clause_id]))
        for f in system_findings if f.finding_type == FindingType.POTENTIAL_CONTRADICTION
    }

    true_positives = gold_contradictions & system_contradictions
    false_positives = system_contradictions - gold_contradictions
    false_negatives = gold_contradictions - system_contradictions

    precision = len(true_positives) / max(len(system_contradictions), 1)
    recall = len(true_positives) / max(len(gold_contradictions), 1)
    f1 = 2 * precision * recall / max(precision + recall, 1e-10)

    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "true_positives": len(true_positives),
        "false_positives": len(false_positives),
        "false_negatives": len(false_negatives)
    }
```

## Portfolio Project: Cross-Jurisdiction Policy Synthesizer

Build a complete Cross-Document Policy Synthesizer for a domain you have access to. Good options:
- **Regulatory:** GDPR (EU) vs. CCPA (California) vs. PIPEDA (Canada) — all publicly available, overlapping in scope, different in obligation
- **HR policy:** Compare employee handbook policies across fictional subsidiaries you define
- **Technical standards:** Compare ISO 27001 and NIST CSF cybersecurity framework requirements

Your system must: encode all documents into concept space, detect semantic equivalences and potential contradictions across documents, generate a prioritized review report, and measure precision and recall on a manually annotated gold standard.

## Summary

This capstone demonstrated the full LCM pipeline for cross-document comparison: encode into concept space, index for semantic search, analyze with geometry-based contradiction detection, and report with human-readable output. The approach detects semantic relationships that vocabulary-based search misses and contradictions that LLMs miss due to attention decay across long contexts.

- **Encoding is the foundation.** Everything downstream depends on SONAR encoding quality. Validate alignment on your domain before building the analysis layer.
- **Contradiction detection is geometric.** High topic similarity + high obligation divergence = potential contradiction. No vocabulary overlap required.
- **Precision vs. recall tradeoff.** Setting thresholds involves trading precision (fewer false alarms) against recall (fewer missed contradictions). For compliance use cases, recall typically matters more.
- **The report is the product.** The system's value is not the embeddings or the similarity scores — it is the prioritized review agenda that transforms the analyst's workflow.
