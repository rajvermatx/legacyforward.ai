---
title: "How LLMs Work — No PhD Required"
slug: "how-llms-work"
description: "Large language models are not magic and they are not mysterious. Understanding how they work at a functional level — what they are doing when they generate text — makes you a better practitioner whether you are a PM, BA, or engineer."
section: "ai-beyond-the-demo"
order: 21
part: "Part III — The Practitioner's Toolkit"
---

Part III — The Practitioner's Toolkit

# How LLMs Work — No PhD Required

You do not need to understand backpropagation to use LLMs effectively. But you do need to understand what they are doing when they generate text — otherwise you will be surprised by their failures in ways that are entirely predictable once you have the right mental model. This chapter provides that mental model without requiring any mathematical background.

### What You Will Learn

- What a large language model is doing when it generates text
- Why LLMs are confident even when they are wrong
- The key parameters that control LLM behavior and what they mean in practice
- The failure modes that follow directly from the architecture

## 21.1 The Core Mechanism: Predicting the Next Token

An LLM generates text one token at a time. A token is roughly a word or a word fragment — "unambiguous" is three tokens: "un", "ambigu", "ous". At each step, the model looks at all the text it has seen so far (the prompt and everything it has generated), and it predicts a probability distribution over every possible next token. It samples from that distribution and appends the result. Then it does it again. And again. Until it decides to stop.

That is the entire mechanism. Everything impressive that LLMs do — answering questions, writing code, summarizing documents, reasoning through problems — emerges from this single repeated operation of predicting the next token based on patterns learned from training data.

The implications are immediate. LLMs do not look up facts in a database. They do not run calculations. They do not reason from first principles. They generate text that is statistically likely to follow the prompt, based on patterns in the training data. When the correct answer is the statistically likely answer — which it often is for common questions in well-represented domains — LLMs perform impressively. When the correct answer is rare, counterintuitive, or requires genuine reasoning, they fail.

## 21.2 Training: Where the Patterns Come From

Before an LLM can generate text, it must be trained. Training is the process of exposing the model to enormous amounts of text — books, websites, code, scientific papers, forum posts — and adjusting the model's internal parameters so that it becomes better at predicting the next token in each sequence it sees.

The scale of training data for modern LLMs is difficult to comprehend. The largest models have been trained on trillions of tokens — effectively, a substantial fraction of all text that has ever been published in digital form. This breadth is why LLMs can discuss almost any topic: the training data contains text about almost any topic.

But breadth is not the same as depth or accuracy. The training data contains wrong answers as well as right ones, biased perspectives as well as neutral ones, outdated information as well as current information. The model learns statistical patterns across all of it. When wrong answers appear frequently in the training data — because a misconception is widely repeated, because a fact has changed since the training cutoff, or because the relevant domain is underrepresented — the model reproduces the wrong answer with the same confidence it reproduces correct ones.

## 21.3 Key Parameters Every Practitioner Should Know

**Temperature** controls the randomness of token selection. At temperature 0, the model always selects the highest-probability next token — fully deterministic, always the same output for the same input. At higher temperatures, lower-probability tokens are selected more often — the model takes more creative risks. For factual tasks where consistency and accuracy matter, use low temperature. For creative tasks where diversity is valuable, use higher temperature.

**Context window** is the maximum amount of text the model can consider at once — the prompt plus everything generated so far. Modern models have context windows measured in tens of thousands to millions of tokens. But length and attention quality are not the same thing: models attend less reliably to content in the middle of long contexts than to content at the beginning and end.

**System prompt** is the instruction given to the model before the user's input. It sets the model's persona, constraints, and behavior. Well-designed system prompts are the primary lever for making LLM behavior consistent and appropriate for a specific enterprise use case.

**Top-p (nucleus sampling)** limits the candidate pool at each token generation step to the smallest set of tokens whose cumulative probability exceeds p. This prevents the model from generating very low-probability tokens even at higher temperatures.

## 21.4 The Failure Modes

Understanding the architecture reveals the failure modes:

**Hallucination:** The model generates factually incorrect content with full confidence because the generation mechanism produces plausible-sounding text, not verified-true text. Hallucination is not a bug — it is the expected behavior of a system that predicts likely text rather than true text.

**Stale knowledge:** Training data has a cutoff date. Events after that date are not in the model's knowledge. The model does not know what it does not know, so it may answer questions about recent events by generating plausible-sounding but incorrect responses.

**Inconsistency:** Because generation is probabilistic, the same prompt at the same temperature may produce different outputs on different runs. For enterprise applications requiring consistency, this must be managed through temperature settings, output parsing, and validation.

**Sycophancy:** Models trained on human feedback learn that agreement is rewarded. They tend to agree with premises in the prompt even when the premises are wrong, and to change their answers when challenged even when their original answer was correct.

**Token boundary errors:** Because models operate on tokens, not words, they make systematic errors on tasks that require character-level awareness: counting letters, reversing strings, identifying specific characters in words.

These failure modes are predictable. Enterprise AI systems that account for them — through validation, human review, output parsing, and retrieval augmentation — are more reliable than systems that ignore them.
