---
title: "How Large Concept Models Work"
slug: "how-lcms-work"
description: "Large Concept Models represent and reason about content at the concept level rather than the token level. Understanding how this works — what concepts are, how they are represented, and how LCMs reason over them — is the foundation for knowing when LCMs are the right tool."
section: "ai-beyond-the-demo"
order: 59
part: "Part VI — Advanced AI Patterns"
---

Part VI — Advanced AI Patterns

# How Large Concept Models Work

Large Concept Models (LCMs) are an architectural family that operates at the level of concepts — semantic units that represent meaning — rather than tokens, which are text fragments that represent statistical patterns in training data. LCMs emerged from research at Meta (FAIR) and other institutions in response to the limitations described in Chapter 58. Understanding how they work requires setting aside the mental model of LLMs and building a new one from first principles.

### What You Will Learn

- What concepts are and how they differ from tokens
- How concept representations are produced and stored
- How LCMs reason over concept sequences
- The LCM architecture variants and their practical implications

## 59.1 What Concepts Are

In the LCM framework, a concept is a high-dimensional vector that represents a unit of meaning — typically a sentence, paragraph, or semantic chunk — in a continuous embedding space. Unlike tokens, which are defined by the tokenizer's statistical split of text, concepts are defined by meaning boundaries.

Two sentences that express the same meaning in different words should produce similar concept vectors. Two sentences that express different meanings, even if they share many words, should produce different concept vectors. This is what distinguishes concepts from tokens: concepts represent what is said, not how it is said.

**Concept granularity:** The appropriate concept granularity depends on the task. For document-level reasoning, concepts might correspond to paragraphs or sections — each concept represents a complete idea. For fine-grained reasoning, concepts might correspond to sentences. For corpus-level reasoning, concepts might correspond to entire documents, with document-level embeddings as the concept representation.

**Language-independent representation:** Because concepts represent meaning rather than tokens, the same concept vector can represent the same meaning expressed in different languages. An LCM trained on multilingual data can reason about concepts regardless of the language in which they were originally expressed — a capability that token-based LLMs achieve less cleanly because their representations are entangled with language-specific token patterns.

## 59.2 Concept Encoders: Producing Concept Representations

LCMs use an encoder model to convert text into concept vectors. The encoder is typically a separately trained neural network — often a variant of a sentence embedding model or a contrastively trained encoder — that is optimized to produce concept representations with specific properties.

**SONAR** (Meta AI, 2023) is the primary encoder used in Meta's LCM research. SONAR produces 1,024-dimensional concept vectors from text in 200 languages. It was trained using contrastive learning over parallel corpora in multiple languages, optimizing for semantic similarity to be reflected in vector similarity.

**Encoding process:**
1. Text is segmented into concept units (sentences, paragraphs, or document sections).
2. Each concept unit is passed through the encoder.
3. The encoder produces a 1,024-dimensional vector for each concept unit.
4. The sequence of concept vectors represents the full document in concept space.

**Decoder:** The inverse operation — converting concept vectors back to text — requires a decoder model. Decoders for concept embeddings are typically sequence-to-sequence models trained to reconstruct text from concept embeddings. The round-trip (text → concept → text) preserves meaning but not surface form: the reconstructed text expresses the same ideas as the original but in potentially different words and sentence structures.

## 59.3 How LCMs Reason

LCMs reason over sequences of concept vectors. The model receives a sequence of input concept vectors (representing the document or context) and produces output concept vectors (representing the response or continuation). The reasoning process operates in concept space — no token-level text processing occurs during the model's primary reasoning steps.

**Architectural variants:**

**One-concept-at-a-time (OCaT) LCM:** The model generates one output concept vector at a time, conditioned on all prior input and output concept vectors. This is structurally analogous to autoregressive token generation in LLMs, but operating at the concept level. OCaT models are simpler to train and implement but require many steps to generate long outputs.

**Diffusion LCM:** The model generates all output concept vectors simultaneously by starting from noise and iteratively denoising toward the target concept sequence. Diffusion LCMs can capture the holistic structure of the output — understanding the beginning, middle, and end simultaneously — rather than generating sequentially. This is advantageous for tasks that require global coherence.

**The reasoning advantage:** Because LCMs operate in concept space, their "context window" is measured in concepts, not tokens. A concept representing a paragraph of text requires one slot in the concept context window, whereas the same paragraph requires hundreds of tokens in a token-based LLM's context window. This compression means LCMs can reason over much larger bodies of content within the same computational budget.

## 59.4 LCM Training

LCMs are trained differently from LLMs. They do not predict tokens — they predict concept vectors.

**Training objective for OCaT LCMs:** The model learns to predict the next concept vector given all prior concept vectors in the sequence. The loss is computed in concept embedding space, not in token space. This requires a large corpus of multi-sentence documents where meaningful concept sequences can be learned.

**Pre-training vs. fine-tuning:** As with LLMs, LCMs can be pre-trained on large corpora and then fine-tuned on specific tasks. Pre-training teaches the model the general patterns of concept sequences — how ideas follow from each other. Fine-tuning adapts the model to specific tasks — summarization, question answering, translation — in concept space.

**Current limitations:** LCM research is less mature than LLM research. The publicly available LCMs (Meta's LCM, released 2024) are smaller and less capable than frontier LLMs in most tasks. They outperform LLMs primarily on the specific tasks where the token ceiling is binding: long-document reasoning, cross-document synthesis, and multilingual concept transfer. Chapter 60 provides the direct comparison.
