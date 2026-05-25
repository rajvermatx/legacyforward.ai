---
title: "Prologue: The LegacyForward.ai Framework"
slug: "prologue"
description: "The enterprise AI stack is about to bifurcate. This prologue explains why — and introduces the three-pillar framework for deciding which layer to build on."
section: "beyond-llms-large-concept-models"
order: 0
part: "Prologue"
---

## The Problem

The enterprise AI stack is about to bifurcate. For three years, the dominant pattern has been: take a large language model, wrap it in a prompt, point it at your data, and ship. That pattern works — until the task requires holding a plan across two hundred pages, synthesizing regulatory filings from twelve jurisdictions, or reasoning coherently about a strategic initiative that spans four fiscal years. At that point, the token is the bottleneck. Not the model's size. Not the training data. The unit of representation itself.

Large Concept Models operate at a different level. Instead of predicting the next token, they reason over semantic concepts: sentence-level embeddings that encode meaning rather than surface form. The architecture is fundamentally different, the use cases are different, and the failure modes are different. Enterprise teams that conflate the two will either underbuy (using an LLM for tasks that hit the token ceiling) or overbuy (reaching for an LCM when a simpler tool would do the same job at a tenth of the complexity).

The LegacyForward.ai framework exists to make this decision systematic rather than instinctive.

## The LegacyForward Framework

**Signal Capture** is the discipline of identifying what actually matters before you invest. For Large Concept Models, Signal Capture asks a specific question: does your problem actually run into the token ceiling? Not "could the task benefit from better reasoning?" Almost any task could benefit from better reasoning. The question is whether the natural unit of your task — a regulatory clause, a strategic plan step, a cross-document comparison — is larger than what token-level processing handles reliably. If the answer is no, an LLM will serve you better and cost you less. If yes, you have a real signal for LCM adoption, not technology enthusiasm.

**Grounded Delivery** is how you manage the gap between what AI can do in a demo and what it does reliably in production. The LCM ecosystem as of mid-2026 is materially thinner than the LLM ecosystem. There is no LCM equivalent of the OpenAI SDK, no LangChain for concept-space orchestration, no established evaluation harness for concept-level output. Grounded Delivery is not pessimism about LCMs — it is an honest accounting of where the tooling is and where it is not, so you can plan for the gaps rather than discover them at the wrong moment.

**Legacy Coexistence** is the architectural and organizational reality that most AI strategies pretend does not exist. LCMs do not replace your LLM stack. They extend it upward. The mature enterprise AI architecture will route token-level tasks to LLMs and concept-level tasks to LCMs, with clean handoff points between them. Legacy Coexistence is the framework for designing that routing layer — and for managing the organizational reality that your teams were trained on LLMs, your evaluation frameworks assume token-level outputs, and your monitoring tooling was built for a different model class.

## How This Book Applies It

Signal Capture validates the use case before you write a line of code. The book's core contribution is a decision framework — the Task Unit Test — that lets you identify whether a given enterprise task runs into the token ceiling. Chapters 6 and 7 make this concrete with detailed analysis of where LLMs win and where LCMs win, respectively. The goal is not to make you an LCM advocate. It is to make you precise about when LCMs are the right tool.

Grounded Delivery shapes Chapters 8 and 13 specifically. Chapter 8 is an honest account of LCM performance, cost, and ecosystem maturity as of 2026, including what you should watch as signals for when the tooling gaps close. Chapter 13 maps the LCM tooling landscape and tells you exactly where you will need to build from scratch, where you can adapt LLM-era tools, and where hosted options exist.

Legacy Coexistence is the organizing logic behind Chapter 12 (Hybrid Architectures) and the entire Part 04. The book does not end with a vision of an all-LCM enterprise. It ends with a transition roadmap that works with your existing LLM stack, your existing evaluation processes, and your existing team — because those things are not going away, and any architecture that ignores them will fail in the same way every "rip and replace" strategy has failed.

---

Learn more at [legacyforward.ai](https://legacyforward.ai)
