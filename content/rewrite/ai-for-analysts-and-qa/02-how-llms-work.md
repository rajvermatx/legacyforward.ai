---
title: "Chapter 2: How LLMs Work (No PhD Required)"
slug: "how-llms-work"
description: "You do not need to understand the engine to drive the car — but a driver who understands the basics makes better decisions on the road. Here is the practical understanding of LLM internals that will make you a better prompt engineer and a more informed judge of model output."
section: "ai-for-analysts-and-qa"
order: 2
part: "Part 01 Foundations"
---

Part 1 — Foundations

# Chapter 2: How LLMs Work (No PhD Required)

You do not need to understand how an engine works to drive a car, but a driver who understands the basics makes better decisions on the road. This chapter gives you the practical understanding of LLM internals that will make you a more effective prompt engineer, a better judge of model outputs, and a more informed participant in technical conversations about AI adoption.

Reading time: ~20 min Project: Model Comparison Lab

## 2.1 Tokens and Language

Every interaction with an LLM begins and ends with tokens. Tokens are the fundamental units LLMs process — not words, not characters, but something in between. Understanding tokens is not an academic exercise. It directly affects what you can do with an LLM and what it costs.

A token is typically a word fragment, a whole word, or a punctuation mark. The exact tokenization depends on the model, but general rules of thumb:

| Text | Approximate Tokens | Rule of Thumb |
| --- | --- | --- |
| 1 English word | ~1.3 tokens | Most common words = 1 token; longer/rarer words = 2-3 tokens |
| 1 page of text (~500 words) | ~650 tokens | Useful for estimating document sizes |
| A typical user story | ~50-100 tokens | "As a [role], I want [feature], so that [benefit]" plus acceptance criteria |
| A BRD (20 pages) | ~13,000 tokens | May exceed some models' context windows |
| A full test plan | ~5,000-15,000 tokens | Depends on complexity and number of test cases |

Three reasons token counts matter in practice:

**Cost.** LLM APIs charge by the token, both for input and output. A prompt with a 10-page document attached costs roughly 10 times more than the same prompt without the document. Understanding token counts helps you manage costs and avoid surprises.

**Context limits.** Every model has a maximum context window — the total tokens (input + output) it can handle in a single conversation. If your prompt plus expected response exceeds this limit, the model will either truncate its response or refuse to process the input. Section 2.4 covers context windows in detail.

**Quality.** Longer prompts with more context generally produce better outputs, but only up to a point. Information placed in the middle of very long contexts can effectively get "lost" by the model. Strategically placing your most important context at the beginning and end of a prompt can improve results.

![Diagram 1](/diagrams/llm-ba-qa/how-llms-work-1.svg)

How an LLM Processes Your Prompt — your text is split into tokens, processed by the Transformer's attention mechanism, and the response is generated one token at a time based on learned probability patterns.

You can estimate token counts using free online tokenizer tools (OpenAI's Tokenizer at platform.openai.com/tokenizer is useful) or the rule of thumb: roughly 750 English words equals about 1,000 tokens. A typical user story costs fractions of a cent with any model.

When working with large documents, pre-process before sending: remove boilerplate (headers, footers, page numbers), compress whitespace, and consider sending only the relevant sections. This reduces cost and often improves output quality.

## 2.2 The Transformer Architecture

Every major LLM — GPT-4, Claude, Gemini, Llama — is built on the same fundamental architecture: the Transformer, introduced in a 2017 paper titled "Attention Is All You Need." You do not need to understand the mathematics, but understanding the core concept, *attention*, changes how you think about prompt construction.

Before Transformers, language models processed text sequentially, one word at a time, left to right. By the time the model reached the end of a long paragraph, it had only a fading memory of the beginning. Transformers solved this with the attention mechanism, which allows the model to look at all parts of the input simultaneously and determine which parts are most relevant to each other.

When you read "The bank was steep and muddy after the rain," you instantly connect "bank" with "steep," "muddy," and "rain" to conclude this is a riverbank. You do not process words one at a time — you consider relationships between all the words simultaneously. That is what attention does for an LLM.

Practical implications for analysts:

| Transformer Feature | What It Means | Implication for Your Prompts |
| --- | --- | --- |
| **Self-attention** | The model considers relationships between all parts of the input | You can reference things defined earlier in your prompt; the model will connect them |
| **Parallel processing** | All tokens are processed simultaneously, not sequentially | Longer prompts do not proportionally slow down processing |
| **Layered understanding** | Multiple attention layers build progressively abstract representations | Models capture both surface-level patterns and deeper semantic relationships |
| **Position encoding** | The model knows where each token appears in the sequence | Order matters — put instructions before examples, context before questions |

The size of an LLM is typically described by its number of **parameters**: the learned values that encode all the patterns absorbed during training. GPT-4 is estimated to have over a trillion parameters. More parameters generally means more capacity to capture nuance, but also higher computational costs. This is why smaller models can be surprisingly effective for specific tasks — if the task does not require broad knowledge, a smaller, faster, cheaper model may perform just as well.

## 2.3 Pre-Training and Fine-Tuning

LLMs are created in two major phases.

**Phase 1: Pre-Training.** The model is exposed to enormous amounts of text — books, websites, articles, code, documentation — and learns to predict what comes next in a sequence. This is unsupervised: the model is not told what is right or wrong, it simply learns statistical patterns of language. Pre-training is extraordinarily expensive (millions of dollars in compute) and is done once by the model provider.

What pre-training gives the model: grammar, syntax, and language fluency; general world knowledge up to the training cutoff; understanding of document formats and structures; reasoning patterns from exposure to logical arguments and code; and multi-language capability.

**Phase 2: Fine-Tuning and Alignment.** A pre-trained model is powerful but unrefined — it might ignore instructions or produce aimless text. Fine-tuning aligns the model to be helpful and good at following instructions. This typically involves:

- **Supervised Fine-Tuning (SFT):** Training on curated examples of good prompt-response pairs
- **Reinforcement Learning from Human Feedback (RLHF):** Human evaluators rate model responses, and the model is trained to produce higher-rated outputs
- **Constitutional AI / RLAIF:** Using AI systems to help evaluate and improve responses at scale

The model you interact with has been specifically trained to follow instructions and be helpful. Clear, structured instructions will be followed more faithfully than vague ones. Your job is to tell it exactly what help looks like.

One important consequence of pre-training on a fixed dataset: every LLM has a knowledge cutoff date. LLMs cannot tell you about your organization's recent policy changes, last week's sprint retrospective, or the latest framework release. Always provide relevant current context in your prompts.

## 2.4 Context Windows Explained

The context window is the total amount of text (in tokens) an LLM can process in a single interaction — your input, any documents you attach, the conversation history, and the model's output. Think of it as the model's working memory: everything it can "see" at once.

Context window sizes vary dramatically:

| Model | Context Window | Approximate Page Equivalent | Good For |
| --- | --- | --- | --- |
| GPT-4o | 128K tokens | ~200 pages | Most analyst tasks, including large document analysis |
| GPT-4o-mini | 128K tokens | ~200 pages | Cost-effective tasks with large inputs |
| Claude 3.5 Sonnet | 200K tokens | ~300 pages | Very large document analysis and comparison |
| Gemini 1.5 Pro | 1M+ tokens | ~1,500 pages | Entire codebases, complete specification sets |
| Llama 3 (8B) | 8K tokens | ~12 pages | Quick, focused tasks with minimal context |

Context window management is one of the most practical skills an analyst can develop.

**Strategy 1: Summarize and Reference.** Instead of pasting an entire 50-page document, summarize the relevant sections and paste only the specific parts you need analyzed. You can ask the LLM to create a summary in one interaction, then use that summary as context in subsequent interactions.

**Strategy 2: Chunking.** Break large tasks into smaller pieces. Analyze a test plan section by section rather than all at once. This also improves quality because the model can focus its attention more effectively on smaller inputs.

**Strategy 3: System Messages.** Use the system message (available in API calls) to set persistent context: your role, project background, output format expectations. This is more token-efficient than repeating context in every user message.

![Diagram 2](/diagrams/llm-ba-qa/how-llms-work-2.svg)

Context Window Explained — everything in a single LLM interaction must fit within the model's token limit. A 20-page BRD fits easily in GPT-4o's 128K window, but would overflow an 8K-token model.

To check whether your document fits: add your prompt tokens (typically 200-500), your document tokens (roughly 650 per page), and your expected response tokens (500-2,000). If the total exceeds the model's context window, use one of the three strategies above.

In multi-turn conversations (like ChatGPT), the entire conversation history is sent with each new message. A conversation that starts small can gradually fill the context window. If you notice an LLM's responses becoming less coherent in a long conversation, start a new one and provide fresh context.

## 2.5 Temperature and Creativity

When an LLM generates each token, it produces a probability distribution over all possible next tokens. The **temperature** parameter controls how that distribution is used to select the actual output.

| Temperature | Behavior | Best For (Analyst Context) |
| --- | --- | --- |
| **0.0** | Always picks the most likely token. Deterministic — same input gives same output. | Structured data extraction, classification, test case generation from templates |
| **0.3-0.5** | Mostly predictable with slight variation. Focused and consistent. | Requirements writing, acceptance criteria, defect reports, technical documentation |
| **0.7-0.8** | Balanced between consistency and creativity. The default for most models. | Brainstorming user stories, stakeholder communications, exploratory analysis |
| **1.0+** | Highly creative and diverse. Outputs vary significantly between runs. | Generating alternative approaches, creative problem-solving, exploring edge cases |

Related parameters you may encounter:

- **Top-p (nucleus sampling):** Controls randomness differently from temperature. A top-p of 0.1 means only tokens in the top 10% of probability are considered — lower top-p produces more focused output.
- **Frequency penalty:** Reduces the likelihood of repeating tokens already used. Useful for avoiding repetitive output in longer generations.
- **Presence penalty:** Encourages the model to introduce new topics. Useful when you want broader coverage rather than deep focus.

Analyst rule of thumb: use temperature 0 for tasks where consistency and accuracy matter most (data extraction, classification, structured output). Use 0.5-0.7 for tasks where quality writing matters (document drafting, communication). Use 0.8+ only when you explicitly want variety.

In ChatGPT or Claude, ask the same question twice: once requesting "the single most likely answer" and once asking to "brainstorm creative alternatives." Notice how the first gives a focused, deterministic response while the second produces varied, exploratory options.

## 2.6 Model Selection for Analysts

Choosing the right model is one of the most impactful decisions you will make. The landscape is complex and evolving, but the selection framework is straightforward: match the model's strengths to your task's requirements.

A practical decision matrix for common analyst tasks:

| Task Type | Quality Need | Speed Need | Cost Sensitivity | Recommended Tier |
| --- | --- | --- | --- | --- |
| Quick classification / tagging | Medium | High | High | Small model (GPT-4o-mini, Haiku) |
| Requirements analysis | High | Medium | Medium | Large model (GPT-4o, Sonnet) |
| Test case generation (batch) | Medium-High | Medium | High | Medium model with good instruction following |
| Document summarization | High | Low | Medium | Large model with large context window |
| Creative brainstorming | Medium | High | Medium | Large model at higher temperature |
| Data extraction from text | Very High | Medium | Low | Large model at temperature 0 |
| Sensitive internal analysis | High | Low | Low | Self-hosted open-source model |

**The Multi-Model Strategy.** Sophisticated teams do not use a single model for everything. They adopt a tiered strategy:

- **Tier 1 (Frontier models):** GPT-4o, Claude Sonnet, Gemini Pro. Use for complex analysis, nuanced writing, and critical deliverables where quality justifies cost.
- **Tier 2 (Efficient models):** GPT-4o-mini, Claude Haiku, Gemini Flash. Use for high-volume, lower-complexity tasks like classification, summarization, and template-based generation.
- **Tier 3 (Local/Private models):** Llama, Mistral, Phi. Use for sensitive data that cannot leave organizational boundaries, or offline environments.

A common pattern: prototype with a frontier model to get the best possible output and validate your prompt design, then test whether a cheaper model produces acceptable results with the same prompt. Many tasks that seem to require GPT-4-class models work perfectly well with GPT-4o-mini at one-tenth the cost.

## 2.7 Limitations You Must Know

**Hallucination.** LLMs can generate text that is fluent, confident, and completely wrong. They may invent API endpoints that do not exist, cite regulations that were never written, or describe product features that are fabricated. This happens because the model generates text based on patterns, not facts. Every factual claim in LLM output must be verified against authoritative sources. Never use LLM-generated content in a deliverable without fact-checking.

**Inconsistency.** The same prompt can produce different outputs on different runs unless temperature is set to 0. Even at temperature 0, minor phrasing changes can produce significantly different results. Do not rely on a single LLM run for critical tasks. Generate multiple outputs and compare, or use structured evaluation criteria to assess quality.

**Bias.** LLMs inherit biases from their training data — gender bias in persona descriptions, cultural bias in scenario generation, regional bias in regulatory references, recency bias toward popular frameworks. Be particularly alert when using LLMs for user research analysis, persona creation, or accessibility testing.

**Sycophancy.** LLMs are trained to be helpful, which can make them agreeable to a fault. If you present a flawed requirement and ask "is this good?", the model may praise it rather than identify problems. Always ask the model to critique, challenge, and identify issues. Never ask for validation.

**Context sensitivity.** LLMs can be heavily influenced by irrelevant information in the prompt. A throwaway comment or example can steer output in unexpected directions. Be deliberate about what you include — every word is signal to the model.

The single most important habit you can develop as an LLM-augmented analyst is systematic verification. Build it into your workflow: after every LLM generation, review against source materials, check for internal consistency, and validate against domain knowledge.

Before using any LLM output in a deliverable, scan for these red flags: phrases like "according to," "studies show," or "the standard requires" (verify the specific claim); numerical claims and statistics (frequently hallucinated — fact-check these); absolute terms ("always," "never," "must") — check whether these are overgeneralizations; named regulations or standards — confirm they exist and say what the LLM claims.

## Project: Model Comparison Lab

In this hands-on project, you will compare different LLM models on the same analyst task to build practical intuition about model selection. Evaluate outputs on quality, speed, cost, and fitness for purpose.

**The Task:** Given a set of raw meeting notes, generate a structured requirements summary with user stories and acceptance criteria.

**How to run this lab (no code required):** Take the same meeting notes and paste them into two or three different LLM chat interfaces (ChatGPT, Claude, Gemini). Use the exact same prompt for each: "Based on the following meeting notes, produce: (1) a requirements summary, (2) three user stories, (3) acceptance criteria for each, and (4) any risks or open questions." Compare outputs side by side. Note differences in structure, detail level, and whether any model introduced information not present in the notes.

If you want to try the programmatic approach, the key API call looks like this:

```python
# OpenAI — send a prompt and get a response
from openai import OpenAI
client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o-mini",   # or "gpt-4o" for higher quality
    temperature=0.3,       # low temperature for analytical tasks
    messages=[{"role": "user", "content": your_prompt}]
)
print(response.choices[0].message.content)
```

**Evaluation Criteria.** Score each model's output on a 1-5 scale for:

- **Completeness:** Did it capture all key points from the meeting notes?
- **Structure:** Are user stories properly formatted? Are acceptance criteria specific and testable?
- **Accuracy:** Did it introduce any information not present in the notes?
- **Actionability:** Could a developer work from these requirements without further clarification?

## Exercises

**Conceptual.** Explain to a non-technical stakeholder why an LLM can write a convincing-sounding paragraph about your company's product even though it has never seen your product documentation. What does this tell you about the nature of LLM knowledge versus human expertise?

**Coding.** Write a Python function that takes a document and a model's context window size as inputs, and returns a strategy for processing the document: "direct" if it fits, "chunked" if it needs splitting (with recommended chunk boundaries at paragraph breaks), or "summarize-first" if it is more than 3x the context window.

**Design.** Your organization is evaluating three LLM providers for a team of 12 analysts. Design a 2-week evaluation protocol that tests each model on representative analyst tasks. Define the tasks, evaluation criteria, scoring rubric, and decision framework. Consider cost, quality, speed, privacy, and team usability.
