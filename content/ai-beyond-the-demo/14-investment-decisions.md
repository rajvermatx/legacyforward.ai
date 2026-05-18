---
title: "Making AI Investment Decisions"
slug: "investment-decisions"
description: "AI investment decisions are harder than traditional software investment decisions because the outputs are probabilistic, the costs are variable, and the value attribution is non-trivial. Here is how to make them well."
section: "ai-beyond-the-demo"
order: 14
part: "Part II — Strategy and Leadership"
---

Part II — Strategy and Leadership

# Making AI Investment Decisions

AI investment decisions differ from traditional software investment decisions in three ways: the outputs are probabilistic (the system may be right 90% of the time, not 100%), the costs are variable and hard to predict (inference costs scale with usage in ways that are difficult to forecast), and the value attribution is non-trivial (how much of the revenue increase was the AI, and how much was the market?). Executives who apply traditional ROI frameworks to AI investment decisions consistently get the analysis wrong in both directions.

### What You Will Learn

- Why traditional ROI frameworks misapply to AI investment
- The AI investment evaluation framework that accounts for probabilistic outputs and variable costs
- How to size AI investments correctly given the portfolio model
- The governance model for ongoing AI investment decisions

## 14.1 Why Traditional ROI Fails for AI

Traditional software ROI analysis assumes deterministic outputs. The software either works or it does not. If it works, it produces the value in the business case. This assumption is wrong for AI.

An AI system that is right 85% of the time does not produce 85% of the value of a system that is right 100% of the time. The value depends on what the 15% error rate looks like, who catches the errors, and what the error costs. An AI that is 85% accurate at approving loan applications is not 85% as valuable as a perfect system — the cost of a false approval or a false rejection may be significantly higher than the cost of the application itself.

Traditional ROI also assumes known costs. AI costs include model hosting (often usage-based), inference costs (which scale with query volume and model size), data pipeline costs (ongoing ETL and data preparation), and human oversight costs (the people reviewing AI outputs). These costs are variable and usage-dependent in ways that are different from traditional software licensing.

## 14.2 The AI Investment Evaluation Framework

A better framework evaluates AI investments on four dimensions:

**Value at full accuracy (the ceiling):** What is the value of the task being automated or augmented, assuming perfect AI performance? This establishes the maximum possible value the investment can create.

**Value at expected accuracy (the realistic case):** Given the expected accuracy of the AI system (validated on representative data, not vendor benchmarks), what is the realistic value? This requires accounting for the cost of errors — false positives, false negatives, and the human effort required to review and correct them.

**Cost to deliver (the investment):** The full cost of implementing and operating the AI system, including data preparation, integration work, model hosting, inference costs, human oversight, and ongoing maintenance. This should be a range, not a point estimate, given the inherent uncertainty.

**Strategic option value (the portfolio bet):** Beyond the direct ROI, what capability does this investment build? What future AI applications does it enable? What competitive positioning does it create? Strategic option value is real but hard to quantify — it should be named and estimated in ranges rather than excluded from the analysis.

## 14.3 Sizing AI Investments

AI investments are consistently mis-sized in both directions. Quick wins are under-invested (the data preparation is scoped out, then added back as scope creep). Strategic bets are over-invested early (the architecture is designed for scale before the use case is validated).

The right sizing approach applies to the portfolio model from Chapter 13:

**Quick wins:** Size the minimum viable version — the smallest implementation that produces a measurable result and validates the use case. If the result is positive, more investment is justified. If not, the cost of learning is bounded.

**Capability builders:** Size the infrastructure investment separately from the use-case investment. The data pipeline, the model serving platform, the MLOps tooling — these are infrastructure investments that benefit multiple use cases. Attribute their cost to the portfolio, not to individual use cases.

**Strategic bets:** Stage the investment. Initial investment funds the validation phase — proving that the use case is achievable and that the value is real. Subsequent investment funds the scaling phase, triggered by validated results from the first phase.

## 14.4 Ongoing Investment Governance

AI investments require ongoing governance that traditional software investments do not. Models drift — their accuracy degrades over time as the world changes and the training data becomes less representative. Data pipelines evolve — source system changes break assumptions the model makes. User adoption changes — as users learn to work with the AI, their usage patterns shift in ways that affect the value delivered.

The governance model for ongoing AI investment has three components:

**Performance monitoring:** Continuous measurement of model accuracy, latency, and output quality against baseline. Automated alerting when metrics degrade below thresholds.

**Periodic revalidation:** Quarterly or semi-annual revalidation of the use case value — is the AI still delivering the value that justified the investment? Has the baseline shifted enough that the AI's advantage has eroded?

**Investment adjustment triggers:** Pre-defined triggers for increasing investment (the use case is delivering more value than expected, new adjacent use cases are identified), maintaining investment (performance is within acceptable ranges, value is being delivered), or decreasing investment (performance has degraded and retraining is not cost-effective, the use case value has declined).

AI investment is not a one-time decision. It is an ongoing portfolio management discipline.
