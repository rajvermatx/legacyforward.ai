---
title: "Chapter 2: How LLMs Work (No PhD Required)"
slug: "how-llms-work"
description: "You don't need to understand how an engine works to drive a car — but a driver who understands the basics makes better decisions on the road. This chapter gives you the practical understanding of LLM internals that will make you a more effective prompt engineer, a better judge of model outputs, and "
section: "llm-ba-qa"
order: 2
part: "Part 01 Foundations"
---

Part 1 — Foundations

# Chapter 2: How LLMs Work (No PhD Required)

You don't need to understand how an engine works to drive a car — but a driver who understands the basics makes better decisions on the road. This chapter gives you the practical understanding of LLM internals that will make you a more effective prompt engineer, a better judge of model outputs, and a more informed participant in technical conversations about AI adoption.

Reading time: ~20 min Project: Model Comparison Lab

### What You Will Learn

-   How text is broken into tokens and why token limits matter for your workflows
-   The core idea behind Transformers — the architecture powering every major LLM
-   How context windows, temperature, and other parameters affect output quality
-   How to choose the right model for different analyst tasks based on practical trade-offs

## 2.1 Tokens and Language

Every interaction with an LLM begins and ends with tokens. Tokens are the fundamental units that LLMs process — not words, not characters, but something in between. Understanding tokens is not an academic exercise; it directly affects what you can do with an LLM and how much it costs.

A token is typically a word fragment, a whole word, or a punctuation mark. The exact tokenization depends on the model, but here are general rules of thumb:

| Text | Approximate Tokens | Rule of Thumb |
| --- | --- | --- |
| 1 English word | ~1.3 tokens | Most common words = 1 token; longer/rarer words = 2-3 tokens |
| 1 page of text (~500 words) | ~650 tokens | Useful for estimating document sizes |
| A typical user story | ~50-100 tokens | "As a \[role\], I want \[feature\], so that \[benefit\]" plus acceptance criteria |
| A BRD (20 pages) | ~13,000 tokens | May exceed some models' context windows |
| A full test plan | ~5,000-15,000 tokens | Depends on complexity and number of test cases |

Why do tokens matter practically? Three reasons:

**Cost:** LLM APIs charge by the token — both for what you send (input tokens) and what you receive (output tokens). A prompt with a 10-page document attached costs roughly 10 times more than the same prompt without the document. Understanding token counts helps you manage costs and avoid surprises.

**Context limits:** Every model has a maximum context window — the total number of tokens (input + output) it can handle in a single conversation. If your prompt plus the expected response exceeds this limit, the model will either truncate its response or refuse to process the input. We'll explore context windows in detail in Section 2.4.

**Quality:** Longer prompts with more context generally produce better outputs — but only up to a point. Research has shown that information in the middle of very long contexts can be "lost" by the model, a phenomenon called the "lost in the middle" effect. Strategically placing your most important context at the beginning and end of your prompt can improve results.

![Diagram 1](/diagrams/llm-ba-qa/how-llms-work-1.svg)

How an LLM Processes Your Prompt — your text is split into tokens, processed by the Transformer's attention mechanism, and the response is generated one token at a time based on learned probability patterns.

You can estimate token counts and API costs using free online tokenizer tools (such as OpenAI's Tokenizer at platform.openai.com/tokenizer) or by using the rule of thumb: roughly 750 English words equals about 1,000 tokens. A typical user story is 50-100 tokens, so analyzing one costs fractions of a cent with any model.

> **Practical Tip:** When working with large documents, pre-process them before sending to an LLM. Remove boilerplate (headers, footers, page numbers), compress whitespace, and consider sending only the relevant sections rather than the entire document. This reduces cost and often improves output quality.

## 2.2 The Transformer Architecture

Every major LLM — GPT-4, Claude, Gemini, Llama — is built on the same fundamental architecture: the Transformer, introduced in a 2017 research paper titled "Attention Is All You Need." You don't need to understand the mathematics, but understanding the core concept — *attention* — will change how you think about prompt construction.

Before Transformers, language models processed text sequentially — one word at a time, left to right. This meant that by the time the model reached the end of a long paragraph, it had only a fading memory of the beginning. Transformers solved this with the **attention mechanism**, which allows the model to look at all parts of the input simultaneously and determine which parts are most relevant to each other.

Think of it this way: when you read the sentence "The bank was steep and muddy after the rain," you instantly connect "bank" with "steep," "muddy," and "rain" to conclude this is a riverbank, not a financial institution. You don't process words one at a time — you consider the relationships between all the words simultaneously. That's what attention does for an LLM.

The practical implications for analysts:

| Transformer Feature | What It Means | Implication for Your Prompts |
| --- | --- | --- |
| **Self-attention** | The model considers relationships between all parts of the input | You can reference things defined earlier in your prompt; the model will connect them |
| **Parallel processing** | All tokens are processed simultaneously, not sequentially | Longer prompts don't proportionally slow down processing (much) |
| **Layered understanding** | Multiple attention layers build progressively abstract representations | Models can capture both surface-level patterns and deeper semantic relationships |
| **Position encoding** | The model knows where each token appears in the sequence | Order matters in your prompts — put instructions before examples, context before questions |

> **The Attention Analogy:** Imagine you're a BA reviewing a 50-page requirements document for a specific section about payment processing. You don't read every word with equal focus — you scan for relevant sections, then pay deep attention to the parts that matter. That's essentially what attention does in a Transformer: it learns to focus computational resources on the most relevant parts of the input for each part of the output it generates.

The size of an LLM is typically described by its number of **parameters** — the learned values that encode all the patterns the model has absorbed during training. GPT-4 is estimated to have over a trillion parameters. More parameters generally means more capacity to capture nuance, but also higher computational costs. This is why smaller models can be surprisingly effective for specific tasks: if the task doesn't require broad knowledge, a smaller, faster, cheaper model may perform just as well.

## 2.3 Pre-Training and Fine-Tuning

LLMs are created in two major phases, and understanding these phases explains both the strengths and limitations you'll encounter.

**Phase 1: Pre-Training**

In pre-training, the model is exposed to enormous amounts of text — books, websites, articles, code, documentation — and learns to predict what comes next in a sequence. This is an unsupervised process: the model isn't told what's right or wrong, it simply learns the statistical patterns of language. Pre-training is astronomically expensive (millions of dollars in compute costs) and is done once by the model provider.

What pre-training gives the model:

-   Grammar, syntax, and language fluency
-   General world knowledge (up to the training data cutoff date)
-   Understanding of document formats and structures (it has "seen" millions of requirements documents, test plans, and BRDs)
-   Reasoning patterns (from exposure to logical arguments, mathematical proofs, code, etc.)
-   Multi-language capability

**Phase 2: Fine-Tuning and Alignment**

A pre-trained model is powerful but unrefined — it might generate offensive content, ignore instructions, or produce aimless text. Fine-tuning aligns the model to be helpful, harmless, and good at following instructions. This typically involves:

-   **Supervised Fine-Tuning (SFT):** Training on curated examples of good prompt-response pairs
-   **Reinforcement Learning from Human Feedback (RLHF):** Human evaluators rate model responses, and the model is trained to produce higher-rated outputs
-   **Constitutional AI / RLAIF:** Using AI systems to help evaluate and improve responses at scale

For analysts, the key takeaway is: the model you interact with has been specifically trained to follow instructions and be helpful. This means clear, structured instructions will be followed more faithfully than vague ones. The model wants to help — your job is to tell it exactly what help looks like.

> **Knowledge Cutoff:** Because pre-training uses a fixed dataset, every LLM has a knowledge cutoff date. GPT-4o's training data extends through a specific date; it genuinely does not know about events after that date. This means LLMs cannot tell you about your organization's recent policy changes, last week's sprint retrospective, or the latest framework release. Always provide relevant current context in your prompts.

## 2.4 Context Windows Explained

The context window is the total amount of text (measured in tokens) that an LLM can process in a single interaction. It includes both your input (the prompt, any documents you attach, the conversation history) and the model's output. Think of it as the model's working memory — everything it can "see" at once.

Context window sizes vary dramatically between models:

| Model | Context Window | Approximate Page Equivalent | Good For |
| --- | --- | --- | --- |
| GPT-4o | 128K tokens | ~200 pages | Most analyst tasks, including large document analysis |
| GPT-4o-mini | 128K tokens | ~200 pages | Cost-effective tasks with large inputs |
| Claude 3.5 Sonnet | 200K tokens | ~300 pages | Very large document analysis and comparison |
| Gemini 1.5 Pro | 1M+ tokens | ~1,500 pages | Entire codebases, complete specification sets |
| Llama 3 (8B) | 8K tokens | ~12 pages | Quick, focused tasks with minimal context |

Context window management is one of the most practical skills an analyst can develop. Here are the key strategies:

**Strategy 1: Summarize and Reference**

Instead of pasting an entire 50-page document, summarize the relevant sections and paste only the specific parts you need analyzed. You can even ask the LLM to create a summary in one interaction, then use that summary as context in subsequent interactions.

**Strategy 2: Chunking**

Break large tasks into smaller pieces. Instead of asking the LLM to analyze an entire test plan, analyze it section by section. This also improves quality because the model can focus its attention more effectively on smaller inputs.

**Strategy 3: System Messages**

Use the system message (available in API calls) to set persistent context — your role, the project background, output format expectations. This is more token-efficient than repeating context in every user message.

![Diagram 2](/diagrams/llm-ba-qa/how-llms-work-2.svg)

Context Window Explained — everything in a single LLM interaction (your prompt, attached documents, and the model's response) must fit within the model's token limit. A 20-page BRD fits easily in GPT-4o's 128K window, but would overflow an 8K-token model.

To check whether your document fits: add your prompt tokens (typically 200-500), your document tokens (roughly 650 per page), and your expected response tokens (500-2,000). If the total exceeds the model's context window, use one of the three strategies above.

> **Conversation Memory:** In multi-turn conversations (like ChatGPT), the entire conversation history is sent with each new message. A conversation that starts small can gradually fill the context window. If you notice an LLM's responses becoming less coherent or accurate in a long conversation, start a new conversation and provide fresh context.

## 2.5 Temperature and Creativity

When an LLM generates each token, it doesn't just pick the single most likely next word. Instead, it produces a probability distribution over all possible next tokens. The **temperature** parameter controls how this distribution is used to select the actual output token.

Understanding temperature is practical because it directly affects the type of output you get:

| Temperature | Behavior | Best For (Analyst Context) |
| --- | --- | --- |
| **0.0** | Always picks the most likely token. Deterministic — same input gives same output. | Structured data extraction, classification, test case generation from templates |
| **0.3-0.5** | Mostly predictable with slight variation. Focused and consistent. | Requirements writing, acceptance criteria, defect reports, technical documentation |
| **0.7-0.8** | Balanced between consistency and creativity. The default for most models. | Brainstorming user stories, stakeholder communications, exploratory analysis |
| **1.0+** | Highly creative and diverse. Outputs vary significantly between runs. | Generating alternative approaches, creative problem-solving, exploring edge cases |

There are also related parameters you may encounter:

-   **Top-p (nucleus sampling):** Instead of temperature, some models use top-p to control randomness. A top-p of 0.1 means only tokens in the top 10% of probability are considered. Lower top-p = more focused output.
-   **Frequency penalty:** Reduces the likelihood of repeating tokens that have already appeared. Useful for avoiding repetitive output in longer generations.
-   **Presence penalty:** Encourages the model to introduce new topics. Useful when you want broader coverage rather than deep focus.

> **Analyst's Rule of Thumb:** Use temperature 0 for tasks where consistency and accuracy matter most (data extraction, classification, structured output). Use temperature 0.5-0.7 for tasks where quality writing matters (document drafting, communication). Use temperature 0.8+ only when you explicitly want variety and creative options.

**Try it yourself:** In ChatGPT or Claude, ask the same question three times — once requesting "the single most likely answer" (behaves like temperature 0), and once asking to "brainstorm creative alternatives" (behaves like high temperature). Notice how the first gives you a focused, deterministic response, while the second produces varied, exploratory options. When using the API, you control this directly with the `temperature` parameter.

## 2.6 Model Selection for Analysts

Choosing the right model for a task is one of the most impactful decisions you'll make as an LLM-augmented analyst. The landscape is complex and evolving, but the selection framework is straightforward: match the model's strengths to your task's requirements.

Here's a practical decision matrix for common analyst tasks:

| Task Type | Quality Need | Speed Need | Cost Sensitivity | Recommended Tier |
| --- | --- | --- | --- | --- |
| Quick classification / tagging | Medium | High | High | Small model (GPT-4o-mini, Haiku) |
| Requirements analysis | High | Medium | Medium | Large model (GPT-4o, Sonnet) |
| Test case generation (batch) | Medium-High | Medium | High | Medium model with good instruction following |
| Document summarization | High | Low | Medium | Large model with large context window |
| Creative brainstorming | Medium | High | Medium | Large model at higher temperature |
| Data extraction from text | Very High | Medium | Low | Large model at temperature 0 |
| Sensitive internal analysis | High | Low | Low | Self-hosted open-source model |

**The Multi-Model Strategy**

Sophisticated teams don't use a single model for everything. They adopt a tiered strategy:

-   **Tier 1 (Frontier models):** GPT-4o, Claude Sonnet, Gemini Pro — for complex analysis, nuanced writing, and critical deliverables where quality justifies cost
-   **Tier 2 (Efficient models):** GPT-4o-mini, Claude Haiku, Gemini Flash — for high-volume, lower-complexity tasks like classification, summarization, and template-based generation
-   **Tier 3 (Local/Private models):** Llama, Mistral, Phi — for sensitive data that cannot leave organizational boundaries, or for offline/air-gapped environments

> **Cost Optimization:** A common pattern is to prototype with a frontier model (to get the best possible output and validate your prompt design), then test whether a cheaper model produces acceptable results with the same prompt. Many tasks that seem to require GPT-4-class models work perfectly well with GPT-4o-mini at one-tenth the cost.

## 2.7 Limitations You Must Know

Working effectively with LLMs requires clear-eyed awareness of their limitations. These are not theoretical edge cases — they are issues you will encounter regularly in analyst work.

**Hallucination**

LLMs can generate text that is fluent, confident, and completely wrong. They may invent API endpoints that don't exist, cite regulations that were never written, or describe product features that are fabricated. This happens because the model generates text based on patterns, not facts. For analysts, this means every factual claim in LLM output must be verified against authoritative sources. Never use LLM-generated content in a deliverable without fact-checking.

**Inconsistency**

The same prompt can produce different outputs on different runs (unless temperature is set to 0). Even at temperature 0, minor changes in phrasing can produce significantly different results. This means you should not rely on a single LLM run for critical tasks. Generate multiple outputs and compare, or use structured evaluation criteria to assess quality.

**Bias**

LLMs inherit biases from their training data. This can manifest as gender bias in persona descriptions, cultural bias in scenario generation, regional bias in regulatory references, or recency bias toward popular frameworks and tools. Be particularly alert to bias when using LLMs for user research analysis, persona creation, or accessibility testing.

**Sycophancy**

LLMs are trained to be helpful, which can make them agreeable to a fault. If you present a flawed requirement and ask "is this good?", the model may praise it rather than identify problems. Always ask the model to critique, challenge, and identify issues — don't ask for validation.

**Context Sensitivity**

LLMs can be heavily influenced by irrelevant information in the prompt. A throwaway comment or example in your prompt can steer the output in unexpected directions. Be deliberate about what you include in your prompts — every word is signal to the model.

> **The Verification Imperative:** The single most important habit you can develop as an LLM-augmented analyst is systematic verification. Build verification into your workflow: after every LLM generation, review against source materials, check for internal consistency, and validate against domain knowledge. This is not optional — it is the difference between augmented intelligence and automated mistakes.

**Your LLM Output Review Checklist:** Before using any LLM output in a deliverable, scan for these red flags: (1) Phrases like "according to," "studies show," or "the standard requires" — verify the specific claim against an authoritative source. (2) Numerical claims (percentages, statistics) — these are frequently hallucinated and must be fact-checked. (3) Absolute terms ("always," "never," "all," "must") — check whether these are overgeneralizations. (4) Named regulations or standards — confirm they exist and actually say what the LLM claims.

## Project: Model Comparison Lab

In this hands-on project, you'll compare different LLM models on the same analyst task to build practical intuition about model selection. You'll evaluate outputs on quality, speed, cost, and fitness for purpose.

**The Task:** Given a set of raw meeting notes, generate a structured requirements summary with user stories and acceptance criteria.

**How to run this lab (no code required):** Take the same set of meeting notes and paste them into two or three different LLM chat interfaces (e.g., ChatGPT, Claude, Gemini). Use the exact same prompt for each: "Based on the following meeting notes, produce: (1) a requirements summary, (2) three user stories, (3) acceptance criteria for each, and (4) any risks or open questions." Compare the outputs side by side. Note the differences in structure, detail level, and whether any model introduced information not present in the notes.

If you want to try the programmatic approach, the key API call for each provider looks like this:

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

**Evaluation Criteria:** After running the comparison, score each model's output on a 1-5 scale for:

-   **Completeness:** Did it capture all key points from the meeting notes?
-   **Structure:** Are user stories properly formatted? Are acceptance criteria specific and testable?
-   **Accuracy:** Did it introduce any information not present in the notes?
-   **Actionability:** Could a developer work from these requirements without further clarification?

## Summary

-   Tokens are the currency of LLMs — they determine cost, context limits, and quality. Roughly 750 words equals 1,000 tokens for English text.
-   The Transformer architecture's attention mechanism means LLMs consider relationships across all parts of your input simultaneously — making prompt structure and organization matter greatly.
-   Temperature controls the trade-off between consistency and creativity; use low temperature (0-0.3) for structured analyst tasks and higher values for brainstorming.
-   Model selection should be task-driven: frontier models for complex analysis, efficient models for high-volume tasks, and local models for sensitive data.
-   Hallucination, bias, sycophancy, and inconsistency are not bugs that will be fixed — they are inherent characteristics of current LLM technology that require systematic verification practices.

### Exercises

Conceptual

Explain to a non-technical stakeholder why an LLM can write a convincing-sounding paragraph about your company's product even though it has never seen your product documentation. What does this tell you about the nature of LLM knowledge vs. human expertise?

Coding

Write a Python function that takes a document and a model's context window size as inputs, and returns a strategy for processing the document: "direct" if it fits, "chunked" if it needs splitting (with recommended chunk boundaries at paragraph breaks), or "summarize-first" if it's more than 3x the context window.

Design

Your organization is evaluating three LLM providers for a team of 12 analysts. Design a 2-week evaluation protocol that tests each model on representative analyst tasks. Define the tasks, evaluation criteria, scoring rubric, and decision framework. Consider cost, quality, speed, privacy, and team usability.