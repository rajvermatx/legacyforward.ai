---
title: "LLM Primitives — Tokens, Context, and Temperature"
slug: "llm-primitives"
description: "The building blocks that every practitioner must understand before building LLM-powered applications: tokens, context windows, embeddings, completions, and the parameters that control them."
section: "ai-beyond-the-demo"
order: 23
part: "Part III — The Practitioner's Toolkit"
---

Part III — The Practitioner's Toolkit

# LLM Primitives — Tokens, Context, and Temperature

Building LLM-powered applications requires working with a small set of fundamental concepts that appear in every API, every framework, and every architecture decision. Practitioners who understand these primitives make better design decisions and debug production issues faster. Practitioners who do not find themselves guessing at the causes of behavior they did not expect.

## 23.1 Tokens

A token is the fundamental unit of LLM input and output. Tokenizers — the software that converts text to tokens — split text into subword units based on statistical frequency in training data. Common words are single tokens. Rare words are split into multiple tokens. Non-English text is often less efficiently tokenized than English, requiring more tokens for the same semantic content.

Why tokens matter:

**Cost:** LLM API pricing is almost always token-based — you pay per input token and per output token. Understanding token counts is understanding costs. A system that processes 10,000 documents per day at 2,000 tokens per document and 500 output tokens has a very different cost profile than one that processes 100 documents.

**Latency:** Output tokens are generated sequentially. Longer outputs take longer to generate. For latency-sensitive applications, output length constraints are an important design parameter.

**Counting:** LLMs count tokens, not words. Tasks that require counting words, characters, or specific elements are unreliable because the model's internal representation does not map cleanly to these surface-level units.

**Tokenizer mismatch:** The same text may tokenize differently in different models. A system built for one model may behave differently when switched to another, even with identical prompts.

## 23.2 Context Windows

The context window is the maximum number of tokens the model can process in a single call — the prompt plus the conversation history plus any documents provided plus the output. When the context window is full, older content must be truncated or summarized; the model cannot access it.

Practical implications:

**Long documents must be chunked.** A 50-page document typically exceeds the context window. Chunking strategies — splitting by paragraph, by section, by fixed token count — affect retrieval quality and reasoning quality downstream.

**Conversation history has a cost.** Multi-turn chatbots accumulate conversation history in the context window. Long conversations eventually hit the context limit, requiring strategies to summarize and compress history.

**Context position matters.** Empirically, content at the beginning and end of the context window receives more attention than content in the middle. For long contexts, the most important information should appear at the beginning or the end.

**Context window ≠ effective reasoning horizon.** A model with a 128,000-token context window can hold a 100,000-word document in context. It cannot necessarily reason reliably across the entire document. The effective reasoning horizon — the span over which the model maintains semantic coherence — is shorter than the technical context limit.

## 23.3 Embeddings

Embeddings are a different output type from completions. Instead of generating text, an embedding model converts text into a dense numerical vector — typically 768 to 3,072 numbers — that represents the text's meaning in a geometric space.

Embeddings enable:

**Semantic similarity search:** Two texts with similar meaning produce similar vectors. Finding the most similar documents to a query is a matter of finding vectors close to the query vector — which can be done efficiently at scale using vector databases.

**Clustering and classification:** Text can be clustered into groups by semantic similarity without labeled training data. Classification models can be trained on embeddings when labeled data is available.

**Retrieval-Augmented Generation (RAG):** The most common enterprise use of embeddings. Documents are embedded and stored in a vector database. At query time, the user's question is embedded and the most similar document chunks are retrieved and provided to the LLM as context. This gives the LLM access to current, specific information without fine-tuning.

When to use embeddings versus completions: use embeddings when you need to find, compare, or cluster content based on meaning. Use completions when you need to generate, transform, or reason about content.

## 23.4 Key API Parameters

**max_tokens:** The maximum number of tokens the model will generate. Setting this too low truncates outputs. Setting it too high increases cost and latency for no benefit if the model would stop naturally. Set to 20% above the expected maximum output length.

**stop sequences:** Tokens or strings that cause the model to stop generating. Useful for structured outputs where you want the model to stop when it reaches a specific delimiter. Reliable stop sequences prevent the model from continuing past the intended output boundary.

**stream:** When true, tokens are returned as they are generated rather than waiting for the complete response. Streaming improves perceived latency for interactive applications. For batch processing, non-streaming is simpler to implement.

**seed:** For models that support it, a seed value makes outputs deterministic for the same input. Useful for testing and evaluation. Not available in all models and does not guarantee identical outputs across model versions.

**presence_penalty / frequency_penalty:** Reduce the model's tendency to repeat words or phrases it has already generated. Useful for longer outputs where repetition is a quality issue.

Understanding these parameters is the difference between an LLM application that is configured for its actual use case and one running on defaults that were chosen for a different purpose.
