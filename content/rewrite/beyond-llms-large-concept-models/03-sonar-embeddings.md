---
title: "The SONAR Embedding System"
slug: "sonar-embeddings"
description: "SONAR is to LCMs what the tokenizer is to LLMs — the foundational interface between raw text and the model's internal representation. Understanding what it encodes, and what it does not, determines what your LCM can and cannot do."
section: "beyond-llms-large-concept-models"
order: 3
part: "Part 01 Foundations"
---

Part 1 — Foundations

# The SONAR Embedding System

SONAR is to LCMs what the tokenizer is to LLMs — the foundational interface between raw text and the model's internal representation. The difference is that a tokenizer encodes surface form, while SONAR encodes meaning. That difference has downstream consequences that affect everything from how you chunk your documents to how you handle cross-lingual use cases to what kind of bias you need to audit for.

## 3.1 What SONAR Is

SONAR (Sentence-level multimOdal and laNguage-Agnostic Representations) is Meta AI's multilingual sentence embedding model, released as open-source research in 2023 and extended in 2024 as the encoding layer for the LCM architecture. It produces dense, fixed-size vector representations of sentences or short text spans in a shared semantic space across 200 languages.

The key word is "shared." SONAR was not trained to produce English embeddings and French embeddings and German embeddings in separate spaces that happen to have similar geometric properties. It was trained end-to-end to produce embeddings where semantically equivalent content in any supported language lands in the same region of concept space, regardless of vocabulary, syntax, or writing system. An English sentence, its French translation, and its Japanese translation produce concept embeddings that are close neighbors — not because they were aligned after the fact, but because the training objective required them to be.

This is not how most multilingual embedding models work. Models like multilingual BERT produce separate embedding spaces for each language and then apply alignment techniques to bring them together. The alignment is approximate. SONAR's shared space is approximate too — no model is perfect — but it is trained directly for cross-lingual semantic equivalence rather than patched together from monolingual spaces.

## 3.2 Sentence-Level Granularity: Why and What It Means

SONAR encodes at the sentence level. This is a deliberate architectural choice, not a limitation, and understanding why helps you design around it.

**Why sentences?** Sentences are the smallest units of text that reliably express complete propositions. A token expresses a fragment — "un", "ambigu", "ous" are not propositions. A word expresses a concept but lacks the predicate structure that makes a statement. A sentence — "The applicant must provide documentation within thirty days" — expresses a complete, negatable, translatable claim. It is the smallest unit for which semantic equivalence is well-defined.

Paragraphs and documents are also complete semantic units, but they are compositional — their meaning is the aggregated meaning of their sentences in a particular arrangement. Encoding a paragraph as a single embedding loses that compositional structure and forces the encoding model to compress heterogeneous content into a single point in concept space. For tasks that need to reason about the relationships between propositions (cross-document comparison, contradiction detection, hierarchical planning), the sentence is the right granularity.

**What it means for your architecture.** SONAR-based LCM architectures process documents as sequences of sentence embeddings. A 100-sentence document is represented as a sequence of 100 vectors in concept space. Three implications follow:

1. *Document length is not a hard limit.* A 1,000-sentence document produces 1,000 concept embeddings. The constraint on reasoning across the full document is the concept model's sequence length limit, not SONAR's encoding capacity. The concept model can handle much longer sequences than an LLM context window, because each element of the sequence (a concept embedding) encodes more information than each element of a token sequence (a token ID).

2. *Chunking is a concept-level concern, not a token-level concern.* LLM-based RAG systems require careful token-level chunking to fit retrieval units into the context window. LCM-based systems chunk at the sentence boundary (or clause boundary for legal and regulatory content), which is semantically motivated rather than mechanically motivated.

3. *Intra-sentence structure is not preserved.* SONAR produces one embedding per sentence, not one embedding per word or per token. If your task requires reasoning about the internal structure of a sentence — which word is the subject, which clause is the condition — SONAR does not help. Tasks requiring syntactic analysis or token-level reasoning belong with LLMs.

![SONAR Concept Space — cross-lingual semantic clustering across 200 languages](/diagrams/large-concept-models/ch03-sonar-concept-space.svg)

*Figure 3.1 — SONAR's concept space shown as a 2D projection. Semantically equivalent sentences in English, French, German, and Japanese cluster as neighbors. Semantically different concepts (Payment Obligation vs. Force Majeure) are spatially separated by their semantic distance.*

## 3.3 Cross-Lingual Alignment in Practice

The claim that SONAR produces cross-lingually aligned embeddings is worth verifying empirically before building production systems on it.

**What alignment means geometrically.** In concept space, "The applicant must provide documentation within thirty days" (English) and "Le demandeur doit fournir des documents dans les trente jours" (French) should have embeddings with high cosine similarity. High cosine similarity means the two vectors point in similar directions from the origin — their semantic content is close. If alignment is working correctly, the similarity between the English and French embeddings of this sentence will be higher than the similarity between the English embedding and an unrelated English sentence.

**What alignment does not mean.** SONAR alignment is not perfect translation. Two sentences can have high cosine similarity in SONAR space while differing in nuance, register, or precision. "The applicant must provide documentation" and "documentation may be required" will have meaningfully different embeddings — the obligation vs. possibility distinction is a semantic difference SONAR captures. But subtle register differences ("shall" vs. "must" vs. "is required to") may not produce large differences in embedding space. For tasks where legal precision depends on exactly this kind of distinction, validate SONAR alignment on domain-specific examples before relying on it.

**How to measure alignment.** The standard measurement is bitext retrieval: given a set of English sentences and their translations in a target language, measure how often the nearest neighbor of an English embedding in the target language embedding set is the correct translation. SONAR achieves high bitext retrieval accuracy across most supported language pairs, but accuracy varies — high-resource language pairs (English-French, English-German, English-Spanish) perform better than low-resource pairs.

For enterprise use cases, the relevant measurement is domain-specific bitext retrieval. General-language alignment does not guarantee alignment on regulatory, legal, financial, or technical vocabulary. Before deploying an LCM on cross-lingual regulatory analysis, test SONAR alignment on a sample of domain-specific sentence pairs. If alignment accuracy is below threshold, consider domain-adaptive fine-tuning of the encoder.

## 3.4 The 200 Languages: What Coverage Means

SONAR supports 200 languages, which sounds comprehensive until you consider what "support" means in practice. Language coverage in multilingual models follows a power law: high-resource languages (English, French, German, Spanish, Chinese, Japanese) have strong alignment because they are heavily represented in training data. Low-resource languages have weaker alignment because the training signal is sparse.

For enterprise practitioners, the relevant questions:

**Is your target language high-resource?** For English, French, German, Spanish, Portuguese, Italian, Chinese, Japanese, Korean, or Arabic, SONAR alignment is well-validated and suitable for production use.

**Is your use case legally sensitive in a low-resource language?** For languages like Swahili, Bengali, or Vietnamese, SONAR alignment is functional but less thoroughly validated on domain-specific content. Validate alignment on domain samples before relying on it.

**Are you mixing high-resource and low-resource languages in the same analysis?** Cross-lingual reasoning quality will be limited by the lowest-quality language pair in the set. A cross-document analysis spanning English, French, and Swahili will have weaker cross-lingual alignment for the English-Swahili and French-Swahili pairs than for English-French.

## 3.5 SONAR's Limitations

**Limitation 1: Intra-sentence structure is lost.** SONAR produces one vector per sentence. The internal syntactic and semantic structure of the sentence is not directly accessible from the embedding. For tasks that require reasoning about who did what to whom within a sentence — event extraction, relation extraction, fine-grained entity linking — SONAR is not the right tool. These are token-level tasks that belong with LLMs.

**Limitation 2: Long sentences are compressed.** SONAR's sentence-level encoding assumes sentences are short enough to express a single proposition. Long, complex sentences — common in legal and regulatory text — compress multiple propositions into a single embedding, losing the structure between them. For legal and regulatory content, consider splitting long sentences at clause boundaries before encoding, even if the result is not grammatically complete.

**Limitation 3: Domain vocabulary bias.** SONAR's concept space reflects the semantic relationships in its training data, which is general-domain multilingual text. Technical terminology, domain jargon, and proprietary vocabulary may not be well-represented. "Model risk management framework" and "MRM framework" may not have close embeddings if SONAR's training data did not include significant financial regulatory content. Domain adaptation through fine-tuning or embedding calibration addresses this.

**Limitation 4: Temporal and cultural specificity.** SONAR embeddings encode the meaning of text as represented in its training corpus. Terminology that has changed meaning over time, regional variations in vocabulary, and culturally specific concepts may be encoded with systematic biases that reflect the training data rather than current usage.

## 3.6 Validating SONAR for Your Domain

Before building production LCM systems, validate that SONAR is encoding your domain content correctly.

**Step 1: Collect domain sentence pairs.** Identify 50–100 sentence pairs from your domain that should be semantically equivalent (positive pairs) and 50–100 pairs that should be semantically unrelated (negative pairs). For cross-lingual use cases, include language-crossing pairs.

**Step 2: Compute embeddings and cosine similarities.** Encode all sentences using SONAR and compute the cosine similarity for each pair.

**Step 3: Measure separation.** A well-aligned encoder should produce consistently high similarity for positive pairs and consistently low similarity for negative pairs. Measure the mean and standard deviation of similarity for each group. Measure the overlap: what fraction of negative pairs have higher similarity than the median positive pair? Low overlap means SONAR is discriminating correctly in your domain.

**Step 4: Inspect failures.** Manually review the highest-similarity negative pairs (things SONAR thinks are similar but are not) and the lowest-similarity positive pairs (things SONAR thinks are different but should be equivalent). This inspection reveals domain-specific alignment failures to address before production deployment.

### Exercises

| Type | Exercise | Description |
|------|----------|-------------|
| Coding | **Domain alignment test** | Select 20 sentence pairs from a domain your organization works in (regulatory, financial, clinical, technical). Encode each sentence using the SONAR API and compute cosine similarity for positive pairs (semantically equivalent) and negative pairs (semantically unrelated). Plot the similarity distributions. What is the separation between positive and negative pairs? Are there any failures that reveal domain-specific alignment problems? |
| Conceptual | **Chunking strategy design** | A legal team wants to process 200-page contracts with SONAR. Contracts contain sentences that span multiple clauses (e.g., "Subject to clause 7(b), in the event that the counterparty fails to deliver the specified goods within the agreed timeline, the purchasing party shall be entitled to..."). Describe a chunking strategy that preserves semantic coherence while keeping chunk size appropriate for SONAR encoding. What are the tradeoffs? |
| Analysis | **Language coverage audit** | Your organization operates in 8 countries with documents in 5 languages: English, French, German, Portuguese, and Indonesian. Characterize SONAR's coverage quality for each language pair in your cross-lingual analysis requirements. For which pairs would you want domain-specific validation before production deployment? What would that validation look like? |
