---
title: "Build vs Buy vs Fine-Tune"
slug: "build-buy-finetune"
description: "A structured decision framework for the most consequential architecture choice in AI: whether to build a model from scratch, buy API access to a commercial model, or fine-tune an open-source model with your data."
section: "blueprints"
order: 9
badges:
  - "Decision Matrix"
  - "TCO Calculator"
  - "Build / Buy / Fine-Tune Tracks"
  - "Hybrid Approach"
---

## 1. Overview

Someone on your team says "we should build our own model." Someone else says "just use the API." A third person says "let us fine-tune an open-source model." All three are right — for different situations. This is the most consequential architecture decision in AI because it determines your cost structure, your team composition, your time to market, and your competitive moat. Get it wrong and you either spend millions building something an API call could solve, or you build your entire product on rented intelligence with zero differentiation.

"Build" means training a model from scratch on your own data and architecture. This is rare, expensive ($500K to $5M+ just in compute), and only justified when you have truly unique data and the AI is your core product differentiator. Companies like Google, Meta, and Anthropic build models. Most enterprises should not. "Buy" means calling a commercial API — GPT-4, Claude, Gemini — and wrapping it with your product logic. This is fast to start (days to weeks), costs nothing upfront, but you are renting intelligence: you have no differentiation, you are subject to the provider's pricing changes, and your data flows through a third party.

"Fine-tune" is the middle path that most enterprises overlook. You take a pre-trained model — either open-source (Llama, Mistral) or commercial (GPT-4, Claude) — and adapt it with your domain-specific data. This gives you domain-specific performance without the cost of building from scratch. A fine-tuned model on 10,000 examples from your domain often outperforms a generic frontier model on your specific tasks, at a fraction of the per-token cost. The investment is moderate: $10K-$100K in compute, 3-8 ML engineers, and 2-8 weeks of work.

The smartest approach is usually a progression: start by buying (API), prove the value of AI for your use case, measure the baseline accuracy, then fine-tune where the API falls short. Building from scratch is almost never the right first move. This blueprint gives you a structured decision framework — not an opinion, but a set of questions that lead you to the right answer for your specific situation. And importantly, it is not a one-time decision. As models improve and costs drop (which they do every 6 months), the right answer changes. Build in a review trigger so you revisit the decision periodically.

## 2. Decision Diagram

![Diagram 1](/diagrams/blueprints/build-buy-finetune-1.svg)

Decision diagram — Build vs Buy vs Fine-Tune: structured flowchart with cost, time, and team size annotations for each path

## 3. Component Breakdown

📊

#### Decision Matrix

Scored criteria grid: accuracy requirements, data availability, time-to-market, budget, team skills, differentiation needs, regulatory constraints. Each factor scored 1-5, weighted by business priority, producing a quantified recommendation.

💰

#### Total Cost of Ownership Calculator

Projects 3-year costs for each option: Build (infrastructure + team + maintenance), Buy (per-token at production volume), Fine-Tune (training compute + smaller team + inference). The cheapest option at 100 requests/day is rarely cheapest at 100,000.

🔧

#### Build Track

Full model training from scratch: data collection and curation, model architecture selection, distributed training infrastructure, evaluation benchmarks, and ongoing maintenance. Justified only for core product differentiation with unique data.

🛒

#### Buy Track

Commercial API integration: provider selection (GPT-4, Claude, Gemini), prompt engineering, guardrails, cost monitoring, and fallback between providers. Fastest path to production with the least upfront investment.

🎯

#### Fine-Tune Track

Domain adaptation: data preparation and labeling, base model selection, training configuration, evaluation against the base model, and optimized serving. The sweet spot for most enterprises with domain-specific requirements.

🔄

#### Hybrid Approach

Use Buy (API) for prototyping and low-volume features, Fine-Tune for high-volume production workloads where accuracy matters, and Build only for the specific capability that defines your competitive advantage. Most mature AI organizations use all three.

## 4. Decision Points & Trade-offs

| Factor | Build | Buy (API) | Fine-Tune |
| --- | --- | --- | --- |
| **Time to production** | 6-18 months | Days to weeks | 2-8 weeks |
| **Upfront cost** | $500K-$5M+ | Near zero | $10K-$100K |
| **Ongoing cost** | Infrastructure + team | Per-token | Infrastructure + smaller team |
| **Differentiation** | Maximum | None | Moderate |
| **Data requirement** | Massive | None | Moderate (1K-100K examples) |
| **Team size** | 10-50 ML engineers | 1-3 developers | 3-8 ML engineers |
| **Control** | Full | Minimal | Moderate |

>**The 90% rule:** If a commercial API achieves 90% of your accuracy target with good prompt engineering, seriously consider whether the remaining 10% justifies the cost and complexity of fine-tuning or building. Sometimes "good enough fast" beats "perfect eventually."

>**Revisit regularly:** This decision has a shelf life. Model capabilities improve and costs drop roughly every 6 months. A use case that required fine-tuning in 2025 might be solvable with a prompt in 2026. Set a calendar reminder to re-evaluate your decision with the latest models and pricing.

## 5. Cloud Mapping

| Track | GCP | AWS | Azure |
| --- | --- | --- | --- |
| **Build** | Vertex AI Training + TPUs | SageMaker + Trainium | Azure ML + ND GPUs |
| **Buy** | Vertex AI (Model Garden) | Amazon Bedrock | Azure OpenAI Service |
| **Fine-Tune** | Vertex AI Tuning | SageMaker JumpStart | Azure OpenAI Fine-Tuning |
| **Serving** | Vertex AI Endpoints | SageMaker Endpoints | Azure ML Endpoints |
| **Evaluation** | Vertex AI Evaluation | SageMaker Clarify | Azure ML Evaluation |

## 6. Anti-Patterns

1.  **Building from scratch when an API would suffice** — The most expensive mistake in AI. A team spends 12 months and $2M building a custom model that performs 5% better than GPT-4 with a good prompt. Meanwhile, the competitor shipped with the API in 2 weeks and captured the market.
2.  **Fine-tuning with too little data** — Expecting dramatic improvement from fine-tuning on fewer than 100 examples. The model needs enough examples to learn your domain patterns; with too few, you get overfitting and worse performance than the base model.
3.  **Ignoring per-token costs at scale** — Choosing "buy" for a use case that processes 10 million tokens per day without projecting annual costs. At $15 per million input tokens, that is $54K/year just in API fees — fine-tuning a smaller model might be dramatically cheaper.
4.  **No before/after evaluation** — Fine-tuning without measuring the base model's performance first. If you do not know the baseline, you cannot prove the fine-tuning helped. Use the same evaluation set for both, with metrics agreed upon in advance.
5.  **Treating this as a one-time decision** — Models improve and costs drop every 6 months. A use case that required fine-tuning last year might be solvable with the latest API today. Build in a review trigger to periodically reassess.

## 7. Architect's Checklist

-   Use case requirements documented — accuracy target, latency, throughput, and compliance needs
-   Accuracy baseline measured with commercial API — test GPT-4, Claude, and Gemini on your actual tasks
-   Cost projection completed for each option at production scale (not demo scale)
-   Data availability assessed — volume, quality, and labeling effort for fine-tuning
-   Team skills inventory — do you have the ML engineers for build/fine-tune, or only developers for API?
-   Time-to-market requirement defined — is speed or quality the primary constraint?
-   Vendor lock-in risk evaluated — what happens if the API provider changes pricing or terms?
-   Evaluation metrics agreed upon — same test set and scoring method for all options
-   Build vs buy decision documented with rationale — not just the choice, but why
-   Review trigger defined — calendar reminder to revisit decision every 6 months
-   IP and data privacy implications assessed — what data flows to third parties in the buy option?
