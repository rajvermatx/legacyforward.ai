---
title: "Evaluation-Driven Development"
slug: "evaluation-driven-development"
description: "AI features cannot be shipped without evaluation frameworks. Unlike traditional software, LLM outputs are probabilistic — the same code that passes unit tests today may produce different outputs tomorrow. Evaluation-driven development makes this manageable."
section: "legacyforward-compendium"
order: 27
part: "Part III — The Practitioner's Toolkit"
---

Part III — The Practitioner's Toolkit

# Evaluation-Driven Development

In traditional software development, a unit test either passes or fails — the behavior is deterministic. LLM-powered features are different: the same input can produce different outputs across model versions, temperature settings, and prompt variations. Without evaluation frameworks built from the start, teams discover quality regressions in production rather than in development. Evaluation-driven development is the discipline of building the measurement system before or alongside the feature itself.

### What You Will Learn

- Why LLM outputs require evaluation frameworks rather than unit tests alone
- How to define evaluation criteria before writing the first prompt
- The evaluation types available and when to use each
- How to operationalize evaluation in CI/CD pipelines
- How to use evaluation data to make build vs. buy vs. fine-tune decisions

## 27.1 Why Evaluation Is Different for AI Features

Traditional software testing verifies that code produces a specific output for a specific input. LLM-powered features do not have a single correct output — they have a range of acceptable outputs, some of which are better than others, and a range of unacceptable outputs that represent failures.

This difference has practical consequences:

**Regression detection requires a baseline.** If you do not measure quality before making a change, you cannot detect whether the change made things worse. AI teams that skip baseline measurement discover regressions through user complaints.

**The model is not under your control.** Underlying model updates — even patch versions — can shift output distributions. A prompt that performed well on model version N may perform differently on model version N+1. Evaluation frameworks catch these shifts.

**Prompt changes need measurement.** Prompt engineering without evaluation is intuition. Prompt engineering with evaluation is engineering. Teams that measure prompt changes systematically converge on better prompts faster.

**Volume changes the math.** An LLM feature with a 2% failure rate seems acceptable in testing on ten examples. At 10,000 queries per day, that is 200 failures per day. Evaluation frameworks surface the actual rate before launch.

## 27.2 Defining Evaluation Criteria First

Before writing a prompt, define what a correct output looks like. This is the evaluation-first discipline: specify the acceptance criteria before writing the feature.

For each LLM feature, define:

**The task.** What specific transformation or generation does the feature perform? Be precise: "Extract the payment terms, late fees, and governing law clause from a contract" is a defined task. "Analyze the contract" is not.

**The success criteria.** What properties must a correct output have? These become the rubric for evaluation. For extraction tasks: is the extracted information present and accurate? For generation tasks: does the output follow the specified format? Does it address all required topics? Is the tone appropriate?

**The failure criteria.** What outputs are unacceptable? Hallucinated information that is not in the source document. Missing required fields. Outputs that violate format constraints. Outputs that contain prohibited content.

**The edge cases.** What inputs will stress the feature? Short inputs, long inputs, inputs in unexpected formats, inputs with ambiguous information, inputs that contain adversarial patterns.

Document these criteria before evaluation begins. Teams that define criteria after seeing the outputs tend to define criteria that match the outputs — which defeats the purpose.

## 27.3 Evaluation Types

**Human evaluation:** A human rater reviews each output and scores it against the evaluation criteria. Human evaluation is the ground truth — it is the most accurate measure of quality — but it is expensive and slow. Use human evaluation to calibrate automated evaluation, to evaluate on representative samples at launch, and to audit a random sample of production outputs continuously.

**LLM-as-judge:** Use a capable LLM (typically a larger or more capable model than the one being evaluated) to score outputs against a rubric. The judge model is given the input, the output, and the evaluation criteria, and asked to score each criterion. LLM-as-judge scales to large volumes and can be automated, but requires calibration against human evaluation to ensure the judge's scores are valid.

**Heuristic evaluation:** Rule-based checks that can be automated: does the output contain required fields? Is the output within the specified length range? Does the output parse as valid JSON? Heuristic evaluation is fast and cheap but only catches structural failures, not semantic ones.

**Reference evaluation:** Compare the output to a known-good reference output using similarity metrics (exact match, BLEU, ROUGE, embedding similarity). Reference evaluation is appropriate when there is a single correct answer. It is inappropriate when multiple different outputs could all be correct.

Most production systems use a combination: heuristic evaluation for fast structural checks, LLM-as-judge for semantic quality at scale, and periodic human evaluation for calibration and audit.

## 27.4 Building an Evaluation Dataset

The evaluation dataset is the set of inputs against which the system's outputs are measured. Building a representative evaluation dataset is one of the highest-leverage investments a team can make.

**Coverage:** The dataset should cover the full distribution of inputs the system will encounter — common cases, edge cases, adversarial cases. A dataset of only common cases will not detect failures on edge cases that appear in production.

**Labeling:** Each input in the dataset needs a label — either a reference output (for reference evaluation) or a set of criteria that outputs will be evaluated against (for rubric-based evaluation). Labeling is labor-intensive and should be done by domain experts who understand what correct outputs look like.

**Size:** For most enterprise AI features, 100–500 labeled examples is sufficient for initial evaluation. Below 50 examples, the evaluation results are too noisy to act on. Above 500, the marginal value of additional examples diminishes unless the input distribution is highly variable.

**Freshness:** Evaluation datasets should be updated as the input distribution changes. A dataset that was representative six months ago may not reflect current inputs. Schedule quarterly reviews.

## 27.5 Operationalizing Evaluation

Evaluation is most valuable when it runs automatically on every change. This means integrating evaluation into the development workflow:

**Pre-commit evaluation:** Run the evaluation suite against every prompt change before the change is merged. If evaluation scores drop below the threshold, the change is blocked.

**Regression tracking:** Track evaluation scores over time — prompt versions, model versions, dataset versions. A dashboard that shows the score trend makes regressions visible immediately.

**A/B testing in production:** For significant prompt changes, route a fraction of production traffic to the new prompt and compare scores on production inputs. Production A/B testing validates that evaluation scores on the labeled dataset translate to real-world quality.

**Model upgrade testing:** When the underlying model is upgraded, run the full evaluation suite before deploying the upgrade. Model upgrades that improve average performance sometimes introduce regressions on specific task types.

Evaluation operationalized into the development workflow becomes the guardrail that prevents AI quality from degrading silently between releases.
