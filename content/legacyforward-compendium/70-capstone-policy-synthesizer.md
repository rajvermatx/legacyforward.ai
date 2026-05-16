---
title: "Capstone: Cross-Document Policy Synthesizer"
slug: "capstone-policy-synthesizer"
description: "Build an LCM-powered policy synthesizer that reads an entire policy corpus, identifies conflicts and redundancies across documents, and produces a consolidated policy brief — demonstrating LCM's advantage over LLMs for cross-document analysis at corpus scale."
section: "legacyforward-compendium"
order: 70
part: "Part VII — Capstones"
---

Part VII — Capstones

# Capstone: Cross-Document Policy Synthesizer

Enterprise policy corpora are notoriously redundant and inconsistent. Policies written by different teams at different times make contradictory claims, use different definitions for the same terms, and cover the same topics with different requirements. Finding these problems requires reading the entire corpus — a task that takes weeks manually and that LLMs handle poorly at corpus scale (the token ceiling described in Chapter 58). This capstone demonstrates the LCM architecture applied to a cross-document analysis task where LLMs fail.

## Scenario

An HR department maintains 85 policies totaling 340,000 words. An annual policy review is required by the company's compliance framework. The review currently takes two HR professionals six weeks. The policy synthesizer completes the cross-document analysis in under an hour and produces a consolidated brief highlighting conflicts, redundancies, and gaps — reducing the human review to validation and resolution rather than discovery.

## Architecture

**Components:**
- Document loader: parses policy documents from the internal document management system
- Sentence segmenter: splits each document into sentence-level concept units
- SONAR encoder: encodes each sentence as a 1,024-dimensional concept vector
- LCM reasoning stage: reasons over the full concept sequence of the corpus
- Conflict detector: identifies semantically contradictory claims across documents
- LLM polisher: converts LCM concept-level output to fluent natural language brief
- Human review interface: structured report for HR policy team

**Why LCM for this task:**

A 340,000-word corpus contains approximately 425,000 tokens — far exceeding any LLM's effective reasoning horizon for cross-document synthesis. The LCM encodes 340,000 words as approximately 15,000 concept vectors (one per sentence), reasoning over the corpus at the concept level without token-level constraints.

## Implementation

**Step 1 — Corpus encoding:**
```python
from sonar.inference_pipelines.text import TextToEmbeddingModelPipeline

encoder = TextToEmbeddingModelPipeline(
    encoder="text_sonar_basic_encoder",
    tokenizer="text_sonar_basic_encoder"
)

corpus_concepts = []
for policy_doc in policy_corpus:
    sentences = segment_into_sentences(policy_doc.text)
    embeddings = encoder.predict(sentences, source_lang="eng_Latn")
    corpus_concepts.extend([
        {"embedding": emb, "sentence": sent, "doc_id": policy_doc.id, "section": policy_doc.section}
        for emb, sent in zip(embeddings, sentences)
    ])
```

**Step 2 — Conflict detection:**
```python
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def find_potential_conflicts(corpus_concepts, similarity_threshold=0.85, cross_doc_only=True):
    embeddings = np.array([c["embedding"] for c in corpus_concepts])
    similarities = cosine_similarity(embeddings)
    
    conflicts = []
    for i in range(len(corpus_concepts)):
        for j in range(i + 1, len(corpus_concepts)):
            if cross_doc_only and corpus_concepts[i]["doc_id"] == corpus_concepts[j]["doc_id"]:
                continue
            if similarities[i][j] > similarity_threshold:
                # High similarity — these sentences cover the same topic
                # Pass to LLM to determine if they conflict
                conflicts.append((corpus_concepts[i], corpus_concepts[j], similarities[i][j]))
    return conflicts
```

**Step 3 — LLM conflict verification:**
```
Two policy statements from different documents address the same topic. Determine whether they:
1. CONFLICT: make contradictory claims that cannot both be correct
2. REDUNDANT: say the same thing in different words (no conflict)
3. COMPLEMENTARY: cover related but non-contradictory aspects of the topic
4. SUPERSEDE: one is more recent and likely intended to replace the other

Statement A (from {doc_a}, section {section_a}):
"{sentence_a}"

Statement B (from {doc_b}, section {section_b}):
"{sentence_b}"

Return: {relationship, confidence, explanation, recommended_action}
```

**Output brief structure:**
```
POLICY CORPUS ANALYSIS — HR Policy Suite
Corpus: 85 documents | 340,000 words | Analysis date: {date}

CONFLICTS IDENTIFIED (require resolution):
[N conflicts, organized by topic area]
→ TOPIC: Remote Work Expense Reimbursement
  Policy A (Remote Work Policy, §3.2): "Employees are eligible for up to $75/month in home office expenses"
  Policy B (Employee Benefits Guide, §8.1): "Home office stipend is $50/month for remote-designated roles"
  Recommendation: Consolidate into Remote Work Policy; archive Benefits Guide reference

REDUNDANCIES (consolidation opportunities):
[M redundant sections across policy pairs]

GAPS (topics not addressed):
[Topics present in industry-standard policies but absent from this corpus]

RECOMMENDED CONSOLIDATION PLAN:
[Prioritized list of policy consolidation actions]
```

## Key Learning Points

**Semantic similarity is the conflict detection mechanism.** The core of this capstone is finding pairs of sentences across documents that are semantically similar (addressing the same topic) and then determining whether they agree or conflict. Cosine similarity of concept vectors identifies topic similarity; LLM judgment determines whether the similar statements conflict.

**LCM provides the breadth; LLM provides the judgment.** The LCM stage finds which statements cover the same topic across the full corpus. The LLM stage determines the relationship between those statements. Neither can do the other's job: the LLM cannot reason across 425,000 tokens; the LCM cannot make nuanced conflict judgments.

**Threshold tuning determines precision and recall.** The cosine similarity threshold (0.85 in the implementation above) determines how similar two statements must be before they are evaluated for conflict. Too high: misses real conflicts between statements that express similar ideas differently. Too low: floods the conflict detection stage with false positives. Tune empirically on a sample of known conflicts.

**The output format must match the policy team's workflow.** Policy teams work with Word documents and SharePoint, not JSON. The output brief should be generated in a format the team can directly use for their review meetings — structured enough to organize the review agenda, readable enough to understand without parsing.
