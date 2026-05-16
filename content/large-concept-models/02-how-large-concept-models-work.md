---
title: "How Large Concept Models Work"
slug: "how-large-concept-models-work"
description: "The architecture that makes LCMs different is not complicated — it is a pipeline of three components, each with a clear enterprise analogue. The complexity is in knowing what each component does and does not do."
section: "large-concept-models"
order: 2
part: "Part 01 Foundations"
---

Part 1 — Foundations

# How Large Concept Models Work

The architecture that makes LCMs different is not complicated. It is a pipeline of three components, each with a clear enterprise analogue. Understanding it does not require knowing how transformers work, what a gradient is, or how backpropagation updates weights. It requires understanding what moves through the pipeline and what happens to it at each stage.

This chapter builds that mental model. By the end, you will be able to explain how an LCM generates a cross-lingual policy synthesis — without ever processing individual tokens during the reasoning step — in terms any enterprise architect will recognize.

### What You Will Learn

- Describe the three-component LCM pipeline: concept encoder, concept model, concept decoder
- Explain what moves through the pipeline at each stage and why the representation matters
- Map LCM components to familiar enterprise architectural patterns
- Identify what LCMs share with LLMs and what is genuinely different
- Understand why concept-space reasoning produces different outputs than token-space reasoning

## 2.1 The Three-Component Pipeline

![The Large Concept Model Pipeline — SONAR encoder, concept model, SONAR decoder](/diagrams/large-concept-models/ch02-lcm-pipeline.svg)

*Figure 2.1 — The LCM pipeline. Tokens appear only at input and output; all reasoning happens in concept space. The enterprise analogue maps directly to ETL → data warehouse → reporting layer.*

A Large Concept Model is a pipeline with three stages. Meta AI's foundational 2024 paper introduced this architecture as a response to the limitations of token-level generation on tasks that require long-form coherence and cross-lingual reasoning.

**Stage 1: The concept encoder.** The encoder takes raw text — a sentence, a paragraph, a document — and converts it into a dense, fixed-size vector in concept space. This vector is called a concept embedding. It encodes the meaning of the input, not its surface form. The encoder is a pretrained model called SONAR (covered in depth in Chapter 3). SONAR was trained on 200 languages, which means its concept space is shared across languages: an English sentence and its French translation produce concept embeddings that are close neighbors in concept space, not distant strangers.

**Stage 2: The concept model.** The concept model operates entirely in concept space. It takes a sequence of concept embeddings as input and produces a sequence of concept embeddings as output. No tokens are involved in this step. The model reasons over the semantic structure of the input — the relationships between concepts, the coherence of arguments, the logical dependencies between plan steps — and generates a representation of the output in the same space. This is where the distinctive capabilities of LCMs come from: the reasoning happens at the semantic level, not the surface level.

**Stage 3: The concept decoder.** The decoder takes a concept embedding — an output of the concept model — and converts it back into natural language text. Like the encoder in reverse, the decoder maps from the dense, language-agnostic concept space into the surface form of a specific language. The output can be in any language SONAR supports, regardless of the language of the input. This is what makes LCMs natively multilingual without translation as a preprocessing step.

## 2.2 The Enterprise Analogy

Enterprise architects do not need to understand the mathematics of concept embeddings to work effectively with LCM architectures. The pipeline maps cleanly onto familiar patterns.

**The concept encoder is your ETL layer.** Just as an ETL pipeline extracts raw data from source systems, transforms it into a normalized schema, and loads it into a data warehouse, the concept encoder extracts meaning from raw text, transforms it into a normalized semantic representation (the concept embedding), and loads it into concept space. The output is not data in a relational schema — it is meaning in a geometric space — but the architectural role is identical. The encoder is where raw, heterogeneous input (documents in multiple formats, languages, and styles) becomes a uniform, queryable representation.

**The concept space is your semantic data warehouse.** A data warehouse stores normalized, integrated data that was too heterogeneous to query across in its original form. Concept space serves the same function for semantic content. Once documents are encoded into concept embeddings, the system can compute relationships between them — similarity, distance, contradiction, alignment — without any knowledge of the original surface form, language, or vocabulary. Cross-lingual comparison, multi-document synthesis, and semantic search all happen in concept space, for the same reason analytical queries happen in the data warehouse rather than in the source systems.

**The concept decoder is your reporting layer.** A BI or reporting tool takes data from the warehouse and renders it in a form humans can read and act on. The concept decoder takes concept embeddings from concept space and renders them as natural language text in a specific language. Like a reporting layer, the decoder makes choices about presentation (word choice, sentence structure, fluency) without changing the underlying meaning it is expressing. The intelligence is in the warehouse; the decoder is a rendering concern.

## 2.3 What Actually Moves Through the Pipeline

Understanding the pipeline at a functional level is insufficient for practitioners who need to make integration decisions. You need to know what the data looks like at each stage.

**Input: raw text.** The encoder accepts text in any SONAR-supported language. The granularity of the encoding unit is the sentence or short paragraph — SONAR is optimized for sentence-level encoding, not token-level or document-level. For long documents, the encoder processes each sentence (or logical chunk) independently and produces one concept embedding per chunk. A 100-sentence document becomes a sequence of 100 concept embeddings.

**Concept embeddings: 1,024-dimensional dense vectors.** Each concept embedding is a fixed-size vector of floating-point numbers, 1,024 dimensions by default. This vector encodes the meaning of its source sentence in a continuous, geometry-aware space. Sentences that mean similar things have embeddings that are close together (high cosine similarity). Sentences that mean opposite things have embeddings that are far apart. The geometry of concept space encodes semantic relationships that token sequences do not.

**Concept model input and output: sequences of vectors.** The concept model takes a sequence of concept embeddings — the encoded source document or prompt — and produces a new sequence of concept embeddings — the encoded output. The length of the input and output sequences can differ. The concept model is where the reasoning happens: it attends to relationships between concept embeddings rather than between tokens, which is why it can maintain coherence across longer semantic spans than a token-level model.

**Output: decoded natural language.** The decoder maps each output concept embedding back to a natural language sentence. The output is in the target language specified by the user, regardless of the source language. The decoder produces fluent, grammatically correct text because it is a language model operating over its own token vocabulary in the target language — but the content of that text is determined by the concept embedding, not by statistical patterns in the target language corpus.

## 2.4 What LCMs Share with LLMs

The distinction between LCMs and LLMs is real and important, but it is easy to overstate. Several components and principles are shared.

**Both use transformer architectures.** The SONAR encoder, the concept model, and the concept decoder all use variants of the transformer architecture that underlies LLMs. The difference is not the computation mechanism — it is what is being attended to. LLMs attend to token sequences; LCMs attend to concept embedding sequences.

**Both require training data.** SONAR was trained on a large multilingual corpus to learn its concept space. The concept model was trained on pairs of concept embedding sequences representing source and target documents. Like LLMs, LCMs are trained models that encode the statistical properties of their training data, including any biases that data contains.

**Both are probabilistic.** LCM outputs are not deterministic. The concept model samples from a distribution over concept embeddings, and the decoder samples from a distribution over tokens. Running the same input through an LCM twice will produce slightly different outputs, just as with an LLM.

**Both require evaluation.** The LCM's outputs can be wrong, incoherent, or biased. The reasoning happening in concept space is not inspectable in the same way a chain-of-thought trace is, but the output is still subject to quality evaluation. Chapter 14 covers evaluation in detail.

## 2.5 What Is Genuinely Different

The shared foundations make the genuine differences more precise.

**The unit of reasoning.** An LLM's fundamental reasoning unit is the token. Its attention mechanism computes relationships between tokens. Its generation process predicts the next token given previous tokens. An LCM's fundamental reasoning unit is the concept embedding. Its attention mechanism computes relationships between sentence-level semantic vectors. This is not a gradient optimization trick — it is a different information-theoretic level. The concept model has no knowledge of individual tokens during its reasoning step.

**Context is semantic, not positional.** LLM context is defined by position in the token sequence and limited by the context window. LCM context is defined by semantic relevance in concept space, not by token position. A concept model processing a 1,000-sentence document does not degrade in the middle the way an LLM does, because its attention mechanism is computing semantic relationships rather than positional relationships.

**Language is a rendering decision, not a reasoning constraint.** For an LLM, the language of the output is constrained by the language of the input context — a model prompted in English will naturally generate English, and cross-lingual tasks require explicit instruction or fine-tuning. For an LCM, the language of the output is a decoder parameter, entirely independent of the language of the input. The reasoning in concept space is language-agnostic. This is not a feature of the decoder — it is a property of the concept space itself.

**There is no token-level coherence pressure.** LLMs are under implicit pressure to produce outputs that are locally coherent at the token level — the next token must be statistically plausible given the previous tokens. This pressure produces fluent prose even when the underlying reasoning is absent. LCMs generate concept embeddings without this pressure, then decode them. The result is that LCM outputs can be globally coherent without being locally fluent, and locally fluent without being globally coherent — the two dimensions decouple. In practice, the decoder is a competent language model and local fluency is rarely the problem. But the decoupling matters for evaluation: you must measure both.

## 2.6 A Worked Example

A multinational energy company needs to compare energy transition commitments across twelve national climate policies, identify where commitments are equivalent despite different vocabulary, and flag policies that contain internally contradictory commitments. The documents are in six languages.

**With an LLM:** Load all twelve policy documents into the context window (total: approximately 600,000 tokens). Prompt the model to identify semantic equivalences and contradictions across documents. The model will produce a response — but it will attend unevenly across the twelve documents, conflate surface-form similarity with semantic equivalence (and miss equivalences obscured by different vocabulary), and produce globally incoherent analysis for any policy pairs that fall in the middle of the context window. Translation preprocessing would be required, adding cost and losing nuance.

**With an LCM:**
1. *Encode:* Each sentence in all twelve documents is encoded by SONAR into a concept embedding. Languages are unified in concept space — a German commitment and its Spanish equivalent are now neighbors regardless of vocabulary.
2. *Reason:* The concept model computes semantic similarity across all 12 × N embedding sequences, identifies clusters of semantically equivalent commitments, and flags embedding sequences where the concepts within a single policy are semantically contradictory.
3. *Decode:* The results are decoded into the analyst's language of choice — English, French, or any other SONAR-supported language.

The LCM processes the task at the level of the task's natural unit: the commitment (a concept), not the word (a token). The cross-lingual unification happens in the encoder, not through translation. The semantic contradiction detection happens in concept space, where distance is semantic rather than lexical.

## Summary

A Large Concept Model is a three-stage pipeline: encode text into concept embeddings, reason over concept embeddings, decode concept embeddings back into text. The concept encoder (SONAR) maps meaning into a shared, language-agnostic semantic space. The concept model reasons over that space using attention mechanisms that operate on semantic vectors rather than token sequences. The concept decoder renders the output in the target language.

- **Three components, three analogues.** Encoder = ETL layer. Concept space = semantic data warehouse. Decoder = reporting layer. The architecture is new; the enterprise function it serves is not.
- **The reasoning happens in concept space.** No tokens are involved in the concept model's computations. This is the source of LCMs' cross-lingual and long-form coherence capabilities.
- **Shared foundations, different units.** Both LCMs and LLMs use transformers, training data, and probabilistic generation. The difference is what is being attended to — tokens vs. concept embeddings.
- **Language is a rendering decision.** The concept decoder determines the output language. The concept model reasons in a language-agnostic space. This is not a translation feature — it is a property of the concept space.

### Exercises

| Type | Exercise | Description |
|------|----------|-------------|
| Conceptual | **Pipeline mapping** | A team proposes using an LCM to power a customer service chatbot. Apply the three-stage pipeline description and the Task Unit Test from Chapter 1. Does the task's natural unit (the customer turn) map to concept-level reasoning? What does the concept encoder add to a task where surface-form fidelity matters more than semantic equivalence detection? |
| Design | **Encoder granularity** | SONAR encodes at the sentence level. For a legal contract review task, the natural unit of analysis is often a clause (which may span multiple sentences) rather than a sentence. Design an encoding strategy that handles multi-sentence clauses. What are the tradeoffs between encoding each sentence independently vs. encoding each clause as a unit? |
| Analysis | **Decoupled coherence** | The chapter argues that global coherence and local fluency decouple in LCM outputs. Design an evaluation protocol that measures each dimension independently for a multi-document policy synthesis task. What does a "globally coherent but locally incoherent" output look like? What does a "locally fluent but globally incoherent" output look like? |
