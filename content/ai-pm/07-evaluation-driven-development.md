---
title: "Evaluation-Driven Development"
slug: "evaluation-driven-development"
description: "For AI features, the evaluation dataset is the product spec — it's the concrete, testable artifact that defines what quality means and gates every release. This chapter covers how to build and maintain evaluation sets, the trade-offs between automated evaluation and human judgment, A/B testing AI features in production, and regression testing practices that protect what works as your AI evolves."
section: "ai-pm"
order: 7
part: "Part 03 Delivery"
badges:
  - "Evaluation"
  - "Quality Gates"
---

# Evaluation-Driven Development

## Why Evaluation Is a Product Responsibility

Most PMs think of evaluation as an engineering concern, the ML team's job to figure out how accurate the model is. This is a misallocation of responsibility that reliably produces problems.

![Diagram](/diagrams/ai-pm/ch07-1.svg)

The evaluation dataset defines what "correct" means for your AI feature. It encodes the specific quality standard that your product requires. It reflects the use cases that matter to your users, the edge cases your product needs to handle gracefully, and the error types your product cannot tolerate. None of these are engineering questions. They are product questions.

When PMs delegate evaluation entirely to ML engineers, the quality standard gets defined by whoever builds the evaluation set, using their judgment about what matters. That judgment is often technically sophisticated but product-naive. ML engineers are good at measuring model quality. They are not necessarily good at predicting which model failures will cause user trust to collapse or which edge cases represent 40% of your power users' actual usage.

The PM's role in evaluation is not to write the evaluation code. It is to define the quality standard, specify the examples that represent the cases that matter, and make the product decisions about what quality levels are acceptable and what failure modes are unacceptable.

> **Think of it like this:** A software engineering team writes automated tests to verify that the code does what it is supposed to do. The PM writes acceptance criteria that define what "supposed to do" means. For AI features, the evaluation dataset is the acceptance criteria. Writing it is a product activity, not just an engineering one.

## The Evaluation Dataset as Product Spec

In Chapter 5, we established that the evaluation dataset should be treated as the real requirement document for an AI feature. In this chapter, we build out what that means in practice. Specifically, we examine how to construct an evaluation dataset that is useful as a product specification.

A well-constructed evaluation dataset answers the questions that written requirements leave vague:

**"The AI should produce accurate summaries"** → The dataset contains 200 documents with human-verified reference summaries. The AI's outputs are measured against these reference summaries using an agreed scoring method. "Accurate" means scoring above the agreed threshold.

**"The AI should handle edge cases gracefully"** → The dataset contains 40 edge case examples, each tagged by type (short input, non-English input, ambiguous content, adversarial input), each with a specified acceptable output or behavior.

**"The AI should not make the [specific error type]"** → The dataset contains examples of the specific input patterns that produce that error type, with labels indicating the correct output. This creates a specific test for the failure mode.

The evaluation dataset turns every vague requirement into a concrete test. That's its power as a product artifact.

### Components of a Production-Quality Evaluation Dataset

**Core cases (50–60% of the dataset):** Representative examples of the most common inputs the AI will encounter in production. These should mirror the production distribution. If 60% of your real inputs are of type A, 60% of your core cases should be type A.

**Edge cases (20–30% of the dataset):** Examples at the edges of the input distribution. These include inputs that are very short, very long, unusually formatted, in unexpected languages, or structurally atypical. Edge cases often reveal failure modes that do not appear in performance metrics averaged across the full dataset.

**Adversarial cases (10–15% of the dataset):** Examples specifically designed to expose known or suspected failure modes. These might be inputs with misleading surface features, inputs that test the boundary between two categories, or inputs that have historically caused problems in similar systems.

**Golden examples (5–10% of the dataset):** Examples of ideal outputs, cases where the AI performing well is particularly important and the quality standard is especially clear. Golden examples often represent your highest-value user scenarios or your most visible use cases.

## Building the Evaluation Dataset

Building a good evaluation dataset is expensive and takes time. That is not a reason to skip it. It is a reason to start early and to treat the investment as equivalent to discovery work, not as QA overhead at the end of development.

### Step 1: Source Real Examples

The foundation of your evaluation dataset is real examples from the real world. Synthesized or hypothetical examples are less valuable because they do not capture the actual distribution of inputs your users will submit. Sources for real examples:

- Historical data from similar workflows (support tickets, documents, queries, whatever your feature will process)
- A limited data collection exercise where you gather real inputs from users during discovery research
- Production data from a previous version of the feature or a related feature
- A limited alpha release where a small cohort of users generates real inputs that can be harvested for the evaluation set

The more representative the sourcing, the more predictive the evaluation will be of production quality.

### Step 2: Establish Ground Truth Labels

Each example needs a ground truth — the output that a correct AI response would produce or a judgment about whether a given AI output is acceptable.

For classification tasks, ground truth is a label (the correct category). For generation tasks, ground truth is a reference output (a human-produced example of an acceptable output) or a rubric for what acceptable means (a checklist of properties the output should have). For ranking or retrieval tasks, ground truth is a relevance judgment (this result is relevant / not relevant to this query).

**Labeling discipline matters enormously.** The quality of your evaluation is bounded by the quality of your labels. Inconsistent labeling, where different labelers would assign different labels to the same example, creates noise in your quality measurements that makes it impossible to detect real model improvements.

Best practices for labeling:
- Use at least two independent labelers for each example
- Measure inter-annotator agreement (how often do the labelers agree?)
- Document labeling guidelines explicitly, with examples of difficult cases and how to handle them
- Review disagreements, as they are often the most informative examples in the dataset

### Step 3: Stratify and Tag

Tag each example by:
- **Input type or category** (enables you to measure performance by category, not just overall)
- **Difficulty level** (easy, medium, hard, based on labeler confidence or other signals)
- **Edge case category** if applicable (short input, non-English, ambiguous, adversarial)
- **Importance weight** if some cases matter more than others (high-value user type, high-stakes decision context)

Tagging enables you to analyze performance in slices rather than just in aggregate. "Overall accuracy is 87%" is less useful than "overall accuracy is 87%, but accuracy on enterprise customer inputs is 79% and accuracy on billing-related inputs is 83%." Sliced analysis reveals where to focus improvement investment.

### Step 4: Version the Dataset

Your evaluation dataset will evolve as you learn more about production inputs and failure modes. Version it rigorously:

- Each version has a timestamp and a changelog describing what was added, removed, or revised
- Performance metrics are always reported against a specific version of the dataset
- When you add examples to the dataset, re-measure on the full new version to understand whether previous quality claims still hold
- Archive old versions so you can track quality improvement trajectories

## Automated Eval vs. Human Eval vs. LLM-as-Judge

Once you have an evaluation dataset, you need a method for measuring AI quality against it. Three methods exist, each with distinct trade-offs.

### Automated Evaluation

Automated evaluation uses programmatic metrics: precision, recall, F1, BLEU, ROUGE, exact match. These measure how well AI outputs match reference outputs at scale, instantly, and cheaply.

**Best for:** Classification and structured output tasks where correctness is well-defined. Detecting regressions on a large dataset quickly. Continuous integration checks that run on every model update.

**Limitations:** Automated metrics are poor proxies for quality on generation tasks. A summary that scores poorly on ROUGE (automated text similarity) might still be an excellent summary. A response that scores highly on exact match might be technically correct but confusingly worded. Automated metrics measure what is measurable, not what matters.

**When to use:** Always. Automated evaluation should be a baseline for every AI feature. It catches regressions and enables continuous measurement. But it should not be the only method, especially for generation tasks.

### Human Evaluation

Human evaluators review a sample of AI outputs against labeling criteria and provide quality judgments. Human evaluation captures nuance, tone, coherence, and user experience quality that automated metrics cannot.

**Best for:** Generation tasks (summaries, responses, explanations) where quality is multidimensional and hard to quantify. Establishing ground truth for new evaluation examples. Detecting failure modes that automated metrics miss.

**Limitations:** Expensive, slow, and does not scale to continuous integration. Human judges can be inconsistent without careful calibration. Inter-annotator agreement is often lower than teams expect.

**When to use:** Periodically, typically for major releases and quarterly quality audits. Also for establishing the ground truth labels in your evaluation dataset and for validating that automated metrics are tracking the quality dimensions that actually matter.

### LLM-as-Judge

A large language model is used to evaluate the quality of another model's outputs, typically by scoring outputs on specified dimensions using a structured prompt. LLM-as-judge is faster and cheaper than human evaluation while capturing more nuance than automated metrics.

**Best for:** Generation tasks where human evaluation is too expensive but automated metrics are insufficient. Rapid iteration cycles where you need quality feedback faster than human review allows. Evaluating dimensions that are difficult to capture in traditional metrics (tone, helpfulness, coherence).

**Limitations:** The judge model introduces its own biases and blind spots. LLM judges tend to prefer outputs that are longer, more confident, and stylistically similar to their own generation style. These biases may not align with user preferences. LLM-as-judge should always be validated against human evaluation on a calibration set before being trusted as a standalone method.

**When to use:** As a middle layer between automated metrics and full human evaluation. Useful for daily or weekly quality checks during active development, and for quickly screening large volumes of outputs to identify the cases most worth human review.

### A Practical Evaluation Stack

Most AI features benefit from a three-layer evaluation approach:

| Layer | Method | Frequency | Purpose |
|---|---|---|---|
| Continuous | Automated metrics on full eval set | Every model update | Catch regressions immediately |
| Weekly | LLM-as-judge on sample (100–200 examples) | Weekly during active development | Track quality trends; flag degradation for human review |
| Periodic | Human evaluation on representative sample | Major releases; quarterly audits | Validate automated metrics; detect systematic bias; establish new ground truth |

## A/B Testing AI Features in Production

A/B testing AI features in production follows the same statistical principles as traditional A/B testing but has AI-specific design considerations.

### What to Test

AI features offer multiple dimensions for A/B testing that traditional features do not:

**Model version A vs. B:** Testing whether a new model version (higher accuracy on eval set, different approach, updated prompts) actually produces better user outcomes in production.

**Output presentation A vs. B:** Testing whether different ways of presenting the same AI output affect adoption, trust, and behavioral outcomes. A confidence indicator might increase trust. An explanation of the AI's reasoning might increase action rates. Hiding confidence scores might reduce anxiety.

**Automation level A vs. B:** Testing whether automating a task fully (AI acts without user review) vs. semi-automating it (AI suggests, user approves) produces different user outcomes. The right automation level is often surprising.

**Interaction model A vs. B:** Testing whether surfacing the AI proactively vs. on-demand, inline vs. in a sidebar, affects adoption and value.

### AI-Specific A/B Testing Considerations

**Sample size and run time.** AI quality improvements are often smaller in absolute terms than traditional feature improvements. A 3-percentage-point improvement in recommendation click rate requires a larger sample than detecting a 20-point improvement. Run power calculations based on realistic effect sizes before committing to a test.

**Novelty effects.** Users often engage more with new AI features simply because they are new. A/B test metrics that spike on day 1 often decay to baseline by week 3 as the novelty wears off. Run AI feature tests for at least 2-3 weeks before drawing conclusions, and analyze weekly cohorts to see whether the effect is stable or novelty-driven.

**Spillover effects.** AI features can affect parts of the product outside their direct scope. A recommendation feature that improves feature adoption might also reduce support ticket volume. A summarization feature might affect how long users spend in a document. Measure downstream metrics, not just the direct feature metrics.

**User segment heterogeneity.** AI quality varies by user segment, and A/B test results averaged across all users can obscure that a feature that is excellent for one segment is poor for another. Always analyze A/B test results by user segment, not just in aggregate.

### The Rollout Strategy

A/B testing is part of a broader production rollout strategy for AI features. A typical rollout sequence:

1. **Internal dogfooding:** The AI team uses the feature in their own work to catch obvious issues before external exposure
2. **Limited beta (5–10% of users):** Expose to a representative, not self-selected cohort; measure quality in production vs. evaluation set quality
3. **Expanded beta (20–30% of users):** A/B test begins; gather behavioral outcome data; identify segment heterogeneity
4. **Phased rollout (50% → 100%):** Increase exposure while monitoring for quality drift; maintain rollback capability

At each phase, the question is: does what we observe match what we expected from the evaluation set? If production quality is materially lower than evaluation set quality, the Harden phase should be reactivated before continuing the rollout.

## Regression Testing: Protecting What Works

Every change to an AI feature has the potential to improve quality on some dimensions while degrading it on others. This includes model updates, prompt changes, retrieval configuration tweaks, and integration changes. Without regression testing, you are flying blind: you know the change improved X, but you do not know what it broke.

Regression testing for AI features is more complex than for traditional software because "regression" is probabilistic. A model update that improves average accuracy but slightly degrades accuracy on a specific edge case category may or may not be a regression, depending on how important that category is. Unlike traditional software where a regression is binary (the function worked, now it does not), AI regressions are continuous (performance was 87%, now it is 84%).

### Building an Effective Regression Test Suite

**Lock a regression subset of your evaluation dataset.** Not all evaluation examples are equally important for regression detection. Select 50-100 examples that represent your most critical use cases, your known failure modes, and the cases your users care most about. This regression subset should not change frequently. Its value is as a stable baseline.

**Set regression thresholds.** Define what constitutes a regression on your regression subset:
- An overall accuracy drop of X percentage points or more
- A performance drop below Y on any specific category in your tagging taxonomy
- Any increase in the rate of errors tagged as "catastrophic" (error types that are unacceptable regardless of frequency)

**Run regression tests automatically on every change.** Every model update, every prompt change, every configuration change should trigger an automated regression test run before being merged. This creates a continuous quality floor.

**Maintain a regression history.** Track the regression test results over time. Quality trends, such as gradual drift downward without any single large regression, are often more concerning than discrete regressions. A model that is 1% worse after each of six sequential updates has regressed by 6% while never triggering a regression threshold.

### The Regression-Innovation Tension

There is a natural tension between regression testing and innovation. Aggressive regression thresholds prevent degradation but also make it harder to improve the model on new dimensions without touching areas the regression suite protects. This tension is healthy. It forces explicit trade-off conversations about whether an improvement in one area is worth a regression in another.

The product decision when a regression test fails on an otherwise valuable update: "Is this regression acceptable given the improvement we are getting?" This is a product call, not an engineering call. Make it explicitly, document the reasoning, and update the monitoring to watch for the regressed dimension in production.

> **Think of it like this:** A regression test suite for an AI feature is like a food safety checklist for a restaurant. Changing the recipe might make some dishes better, but you need to verify that the changes did not inadvertently compromise the dishes that regulars love. The checklist does not prevent you from innovating. It ensures that innovation does not accidentally break trust.

## The Quality Maintenance Mindset

AI features in production are not static. Model quality drifts as user input distributions evolve, as the world changes in ways the training data did not anticipate, and as foundation model providers update their APIs. Maintaining quality in production is an ongoing product responsibility, not a one-time engineering task.

The quality maintenance mindset has three practices:

**Monitor production quality continuously.** Automated quality metrics run in production on a sample of real inputs, compared against evaluation set quality. Alert thresholds trigger investigation when production quality drops below the evaluation set baseline by more than a defined margin.

**Harvest production examples for the evaluation set.** The best source of new evaluation examples is production. Focus specifically on cases where the AI's quality was unclear, where users provided corrections or feedback, and where the input type was unexpected. A process for reviewing and importing production examples into the evaluation set ensures the evaluation set grows more representative over time.

**Close the feedback loop with users.** Explicit user feedback (thumbs up/down, correction actions, explicit ratings) is a signal about quality that automated metrics miss. Building feedback mechanisms into the product surface and processing that feedback into evaluation improvements is the highest-leverage quality maintenance investment for most AI features.

## Summary

Evaluation-driven development treats the evaluation dataset as the product specification. It is the concrete, testable artifact that defines what quality means for your AI feature. Building it is a product responsibility, not only an engineering one, because it encodes the quality standards derived from user research.

A production-quality evaluation dataset includes core cases, edge cases, adversarial cases, and golden examples, all labeled with ground truth and tagged for sliced analysis. It is versioned rigorously so quality trajectories can be tracked. The three-layer evaluation stack, consisting of continuous automated metrics, weekly LLM-as-judge, and periodic human evaluation, provides the breadth, speed, and nuance that no single evaluation method can offer alone.

A/B testing in production needs AI-specific discipline around sample size, novelty effects, spillover, and segment heterogeneity. Regression testing protects quality as the AI evolves, with thresholds that make trade-off decisions explicit rather than invisible. Quality maintenance in production, through monitoring, evaluation set harvesting, and feedback loops, is the ongoing work that keeps shipped AI features trustworthy as the world changes.

The teams that take evaluation seriously as a product discipline ship AI features that users trust and continue to use. The teams that treat it as QA overhead ship AI features that work in demos and disappoint in production.
