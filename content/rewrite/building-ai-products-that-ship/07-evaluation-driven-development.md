---
title: "Evaluation-Driven Development"
slug: "evaluation-driven-development"
description: "For AI features, the evaluation dataset is the product spec. It's the concrete, testable artifact that defines what quality means — and who builds it matters."
section: "building-ai-products-that-ship"
order: 7
part: "Part 03 Delivery"
badges:
  - "Evaluation"
  - "Quality Gates"
---

# Evaluation-Driven Development

## Why Evaluation Is a Product Responsibility

Most PMs treat evaluation as an engineering concern — the ML team's job to figure out how accurate the model is. This is a misallocation of responsibility that reliably produces problems.

![Diagram](/diagrams/ai-pm/ch07-1.svg)

The evaluation dataset defines what "correct" means for your AI feature. It encodes the specific quality standard your product requires. It reflects the use cases that matter to your users, the edge cases your product needs to handle gracefully, and the error types your product cannot tolerate. None of those are engineering questions — they're product questions.

When PMs delegate evaluation entirely to ML engineers, the quality standard gets defined by whoever builds the evaluation set, using their judgment about what matters. That judgment is often technically sophisticated and product-naive. ML engineers are good at measuring model quality. They're not necessarily good at predicting which model failures will cause user trust to collapse, or which edge cases represent 40% of your power users' actual usage.

The PM's role in evaluation is not to write the evaluation code. It's to define the quality standard, specify the examples that represent the cases that matter, and make the product decisions about what quality levels are acceptable and what failure modes are unacceptable.

## The Evaluation Dataset as Product Spec

A well-constructed evaluation dataset answers the questions that written requirements leave vague:

**"The AI should produce accurate summaries"** → The dataset contains 200 documents with human-verified reference summaries. The AI's outputs are measured against these. "Accurate" means scoring above the agreed threshold.

**"The AI should handle edge cases gracefully"** → The dataset contains 40 edge case examples, tagged by type (short input, non-English, ambiguous content, adversarial), each with a specified acceptable output or behavior.

**"The AI should not make [specific error type]"** → The dataset contains examples of the input patterns that produce that error, with labels indicating the correct output. This creates a specific test for the failure mode.

The evaluation dataset turns every vague requirement into a concrete test. That's its power as a product artifact.

### Components of a Production-Quality Evaluation Dataset

**Core cases (50–60% of the dataset):** Representative examples of the most common inputs the AI will encounter in production. These should mirror the production distribution. If 60% of real inputs are type A, 60% of core cases should be type A.

**Edge cases (20–30% of the dataset):** Examples at the edges of the input distribution — very short, very long, unusually formatted, in unexpected languages, or structurally atypical. Edge cases often reveal failure modes that don't appear in performance metrics averaged across the full dataset.

**Adversarial cases (10–15% of the dataset):** Examples specifically designed to expose known or suspected failure modes. Inputs with misleading surface features, inputs that test the boundary between two categories, inputs that have historically caused problems in similar systems.

**Golden examples (5–10% of the dataset):** Cases where the AI performing well is particularly important and the quality standard is especially clear — your highest-value user scenarios, your most visible use cases.

## Building the Evaluation Dataset

Building a good evaluation dataset is expensive and takes time. That's not a reason to skip it — it's a reason to start early and treat the investment as equivalent to discovery work, not QA overhead at the end of development.

### Step 1: Source Real Examples

The foundation of your evaluation dataset is real examples from the real world. Synthesized or hypothetical examples are less valuable because they don't capture the actual distribution of inputs users will submit. Sources:

- Historical data from similar workflows (support tickets, documents, queries, whatever your feature will process)
- A limited data collection exercise where you gather real inputs from users during discovery
- Production data from a previous version or a related feature
- A limited alpha release where a small cohort of users generates real inputs that can be harvested for the evaluation set

The more representative the sourcing, the more predictive the evaluation will be of production quality.

### Step 2: Establish Ground Truth Labels

Each example needs a ground truth — the output that a correct AI response would produce, or a judgment about whether a given AI output is acceptable.

For classification tasks, ground truth is a label (the correct category). For generation tasks, ground truth is a reference output (a human-produced example of an acceptable output) or a rubric for what acceptable means. For ranking or retrieval tasks, ground truth is a relevance judgment.

Labeling discipline matters enormously. The quality of your evaluation is bounded by the quality of your labels. Inconsistent labeling creates noise in quality measurements that makes it impossible to detect real model improvements.

Best practices:
- Use at least two independent labelers for each example
- Measure inter-annotator agreement
- Document labeling guidelines explicitly, with examples of difficult cases and how to handle them
- Review disagreements — they're often the most informative examples in the dataset

### Step 3: Stratify and Tag

Tag each example by:
- **Input type or category** (enables performance measurement by category, not just overall)
- **Difficulty level** (easy, medium, hard — based on labeler confidence or other signals)
- **Edge case category** if applicable (short input, non-English, ambiguous, adversarial)
- **Importance weight** if some cases matter more than others

Tagging enables sliced analysis rather than aggregate analysis. "Overall accuracy is 87%" is less useful than "overall accuracy is 87%, but accuracy on enterprise customer inputs is 79% and on billing-related inputs is 83%." Sliced analysis reveals where to focus improvement investment.

### Step 4: Version the Dataset

Your evaluation dataset will evolve as you learn more about production inputs and failure modes. Version it rigorously:
- Each version has a timestamp and changelog describing what was added, removed, or revised
- Performance metrics are always reported against a specific version
- When you add examples, re-measure on the full new version to understand whether previous quality claims still hold
- Archive old versions so you can track quality improvement trajectories

## Automated Eval vs. Human Eval vs. LLM-as-Judge

Once you have an evaluation dataset, you need a method for measuring AI quality against it. Three methods exist, each with distinct trade-offs.

### Automated Evaluation

Automated evaluation uses programmatic metrics: precision, recall, F1, BLEU, ROUGE, exact match. These measure how well AI outputs match reference outputs at scale, instantly, and cheaply.

**Best for:** Classification and structured output tasks where correctness is well-defined. Detecting regressions on a large dataset quickly. Continuous integration checks that run on every model update.

**Limitations:** Automated metrics are poor proxies for quality on generation tasks. A summary that scores poorly on ROUGE might still be excellent. A response that scores highly on exact match might be technically correct but confusingly worded. These metrics measure what's measurable, not what matters.

**When to use:** Always — as a baseline for every AI feature. Catches regressions and enables continuous measurement. But not the only method, especially for generation tasks.

### Human Evaluation

Human evaluators review a sample of AI outputs against labeling criteria and provide quality judgments. Human evaluation captures nuance, tone, coherence, and user experience quality that automated metrics cannot.

**Best for:** Generation tasks where quality is multidimensional and hard to quantify. Establishing ground truth for new evaluation examples. Detecting failure modes that automated metrics miss.

**Limitations:** Expensive, slow, doesn't scale to continuous integration. Human judges can be inconsistent without careful calibration. Inter-annotator agreement is often lower than teams expect.

**When to use:** Periodically — for major releases and quarterly quality audits. Also for establishing ground truth labels and validating that automated metrics are tracking the quality dimensions that actually matter.

### LLM-as-Judge

A large language model evaluates the quality of another model's outputs — typically scoring outputs on specified dimensions using a structured prompt. Faster and cheaper than human evaluation while capturing more nuance than automated metrics.

**Best for:** Generation tasks where human evaluation is too expensive but automated metrics are insufficient. Rapid iteration cycles where you need quality feedback faster than human review allows.

**Limitations:** The judge model introduces its own biases. LLM judges tend to prefer outputs that are longer, more confident, and stylistically similar to their own generation style. These biases may not align with user preferences. Always validate against human evaluation on a calibration set before trusting LLM-as-judge as a standalone method.

**When to use:** As a middle layer between automated metrics and full human evaluation. Useful for daily or weekly quality checks during active development, and for quickly screening large volumes of outputs to identify the cases most worth human review.

### A Practical Evaluation Stack

| Layer | Method | Frequency | Purpose |
|---|---|---|---|
| Continuous | Automated metrics on full eval set | Every model update | Catch regressions immediately |
| Weekly | LLM-as-judge on sample (100–200 examples) | Weekly during active development | Track quality trends; flag degradation for human review |
| Periodic | Human evaluation on representative sample | Major releases; quarterly audits | Validate automated metrics; detect systematic bias; establish new ground truth |

## A/B Testing AI Features in Production

A/B testing AI features follows the same statistical principles as traditional A/B testing but has AI-specific design considerations.

### What to Test

AI features offer multiple dimensions for A/B testing that traditional features don't:

**Model version A vs. B:** Testing whether a new model version actually produces better user outcomes in production, not just better eval set scores.

**Output presentation A vs. B:** Testing whether different ways of presenting the same AI output affect adoption, trust, and behavioral outcomes. A confidence indicator might increase trust. An explanation of the AI's reasoning might increase action rates.

**Automation level A vs. B:** Testing whether full automation (AI acts without user review) vs. semi-automation (AI suggests, user approves) produces different user outcomes. The right automation level is often surprising.

**Interaction model A vs. B:** Testing whether surfacing the AI proactively vs. on-demand, inline vs. in a sidebar, affects adoption and value.

### AI-Specific A/B Testing Considerations

**Sample size and run time.** AI quality improvements are often smaller in absolute terms than traditional feature improvements. A 3-percentage-point improvement in recommendation click rate requires a larger sample than detecting a 20-point improvement. Run power calculations based on realistic effect sizes before committing to a test.

**Novelty effects.** Users often engage more with new AI features simply because they're new. Metrics that spike on day 1 often decay to baseline by week 3 as novelty wears off. Run AI feature tests for at least 2–3 weeks before drawing conclusions, and analyze weekly cohorts to see whether the effect is stable or novelty-driven.

**Spillover effects.** AI features can affect parts of the product outside their direct scope. A recommendation feature that improves feature adoption might also reduce support ticket volume. Measure downstream metrics, not just direct feature metrics.

**User segment heterogeneity.** AI quality varies by user segment, and results averaged across all users can obscure that a feature excellent for one segment is poor for another. Always analyze A/B test results by user segment.

### The Rollout Strategy

A/B testing is part of a broader production rollout strategy:

1. **Internal dogfooding:** The team uses the feature in their own work to catch obvious issues before external exposure
2. **Limited beta (5–10% of users):** Expose to a representative, not self-selected cohort; measure production quality vs. evaluation set quality
3. **Expanded beta (20–30% of users):** A/B test begins; gather behavioral outcome data; identify segment heterogeneity
4. **Phased rollout (50% → 100%):** Increase exposure while monitoring for quality drift; maintain rollback capability

At each phase, the question is the same: does what we observe match what we expected from the evaluation set? If production quality is materially lower, reactivate Harden before continuing the rollout.

## Regression Testing: Protecting What Works

Every change to an AI feature — model updates, prompt changes, retrieval configuration tweaks, integration changes — can improve quality on some dimensions while degrading it on others. Without regression testing, you know the change improved X but don't know what it broke.

Regression testing for AI features is more complex than for traditional software because "regression" is probabilistic. A model update that improves average accuracy but slightly degrades accuracy on a specific edge case category may or may not be a regression, depending on how important that category is. Unlike traditional software where regression is binary, AI regressions are continuous.

### Building an Effective Regression Test Suite

**Lock a regression subset of your evaluation dataset.** Not all evaluation examples are equally important for regression detection. Select 50–100 examples that represent your most critical use cases, known failure modes, and the cases your users care most about. This regression subset should not change frequently — its value is as a stable baseline.

**Set regression thresholds.** Define what constitutes a regression:
- An overall accuracy drop of X percentage points or more
- A performance drop below Y on any specific category in your tagging taxonomy
- Any increase in errors tagged as "catastrophic" — error types that are unacceptable regardless of frequency

**Run regression tests automatically on every change.** Every model update, every prompt change, every configuration change should trigger an automated regression test run before being merged. This creates a continuous quality floor.

**Maintain a regression history.** Track results over time. Quality that drifts downward gradually without any single large regression — 1% worse after each of six sequential updates — is often more concerning than a discrete regression event.

### The Regression-Innovation Tension

Aggressive regression thresholds prevent degradation but also make it harder to improve the model on new dimensions without touching areas the regression suite protects. This tension is healthy. It forces explicit trade-off conversations about whether an improvement in one area is worth a regression in another.

When a regression test fails on an otherwise valuable update: "Is this regression acceptable given the improvement we're getting?" That's a product call. Make it explicitly, document the reasoning, and update monitoring to watch for the regressed dimension in production.

## The Quality Maintenance Mindset

AI features in production are not static. Model quality drifts as user input distributions evolve, as the world changes in ways training data didn't anticipate, and as foundation model providers update their APIs. Maintaining quality in production is an ongoing product responsibility, not a one-time engineering task.

**Monitor production quality continuously.** Automated quality metrics run in production on a sample of real inputs, compared against evaluation set quality. Alert thresholds trigger investigation when production quality drops below the evaluation set baseline by more than a defined margin.

**Harvest production examples for the evaluation set.** The best source of new evaluation examples is production — specifically cases where the AI's quality was unclear, where users provided corrections or feedback, and where the input type was unexpected. A process for reviewing and importing production examples ensures the evaluation set grows more representative over time.

**Close the feedback loop with users.** Explicit user feedback — thumbs up/down, correction actions, explicit ratings — signals quality that automated metrics miss. Building feedback mechanisms into the product surface and processing that feedback into evaluation improvements is the highest-leverage quality maintenance investment for most AI features.

The teams that take evaluation seriously as a product discipline ship AI features that users trust and continue to use. The teams that treat it as QA overhead ship AI features that work in demos and disappoint in production.
