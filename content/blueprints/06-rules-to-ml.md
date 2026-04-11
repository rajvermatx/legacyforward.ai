---
title: "Rules Engine to ML Migration"
slug: "rules-to-ml"
description: "Migrate from brittle, hard-coded rules engines to machine learning models using a parallel-run architecture that builds organizational trust, enables gradual traffic shifting, and ensures instant rollback."
section: "blueprints"
order: 6
badges:
  - "Shadow Mode"
  - "Comparison Engine"
  - "Gradual Traffic Shift"
  - "Decision Audit Trail"
---

## 1. Overview

Your company has a rules engine that has been running for years — maybe it decides who gets a loan, which insurance claims to auto-approve, or how to route customer service tickets. It works. Mostly. But the rules were written by people who have since left, there are 2,000+ rules that conflict with each other, and every new business scenario requires weeks of rule authoring by specialists. Someone in leadership has heard that machine learning could do this better. They are right — an ML model could learn these patterns from historical data and generalize to new scenarios automatically. But you cannot just rip out the rules engine overnight. It is mission-critical, and the business trusts it.

The migration architecture solves this by running both systems in parallel. The rules engine continues to make real decisions — the ones that actually affect customers and revenue — while the ML model runs in "shadow mode," silently making predictions on the same inputs. A comparison engine tracks how often the two systems agree and, more importantly, investigates every case where they disagree. Over time, as the ML model proves itself across thousands or millions of decisions, you gradually shift live traffic: first 1%, then 5%, then 20%, and eventually the ML model handles everything.

This is not a technology project — it is a trust-building project. The people who wrote and maintained those rules have deep domain knowledge. The regulators who approved the rules-based process need to understand what is changing. The business stakeholders who rely on predictable outcomes need to see evidence, not promises. The architecture must make the comparison transparent, the fallback instant, and the rollback painless. Every decision from both systems goes into an audit trail so that anyone — a domain expert, a regulator, an executive — can inspect exactly what happened and why.

If you force the switch without this parallel-run period, you will face internal resistance from the rules team who feel sidelined, regulatory scrutiny because you cannot explain how the new system makes decisions, and zero organizational buy-in because nobody trusts a black box that replaced a system they understood. The parallel-run approach converts skeptics into advocates because the data speaks for itself. When the ML model agrees with the rules engine 98% of the time and outperforms it on the 2% of edge cases, even the strongest skeptic comes around. That is the power of this architecture: it turns a risky migration into a provable improvement.

## 2. Architecture Diagram

![Diagram 1](/diagrams/blueprints/rules-to-ml-1.svg)

Architecture diagram — Rules Engine to ML Migration: parallel-run with shadow mode, comparison engine, and gradual traffic shifting

## 3. Component Breakdown

👁

#### Shadow Mode Runner

Runs the ML model on every incoming request in parallel with the rules engine, but does not use the ML output for real decisions. Shadow mode captures predictions for comparison without any customer impact.

⚖

#### Comparison Engine

Tracks the agreement rate between the rules engine and ML model. Logs every disagreement with full context — input features, both outputs, and the magnitude of the difference — for human review.

🔄

#### Gradual Traffic Shifting

Canary-style deployment that shifts live traffic from the rules engine to the ML model in controlled increments: 1%, 5%, 10%, 25%, 50%, 100%. Each stage has pass/fail criteria before advancing.

📦

#### Rules Engine Wrapper

An API wrapper around the existing rules engine that normalizes its input/output format. This makes it interchangeable with the ML model endpoint without modifying the legacy system.

🤖

#### ML Model Serving

Hosts the trained ML model behind a low-latency endpoint with the same API contract as the rules engine wrapper. Must match or beat the rules engine's response time to avoid degrading user experience.

📑

#### Decision Audit Trail

Immutable log of every decision made by both systems. Records the input, the decision, which system made it, timestamps, and the comparison result. Essential for regulatory compliance and debugging.

## 4. Decision Points & Trade-offs

| Advantage | Limitation |
| --- | --- |
| Parallel running validates ML before any risk | Running two systems doubles compute cost during migration |
| Gradual traffic shift builds organizational trust | Migration timeline extends from weeks to months |
| ML models generalize to new scenarios automatically | ML decisions are harder to explain than explicit rules |
| Eliminates dependency on scarce rules-authoring specialists | Requires ML engineering talent that may also be scarce |
| Data-driven decisions improve with more data | Institutional knowledge embedded in rules can be lost if not documented |

>**Key Insight:** The biggest risk is not technical — it is organizational. The rules team has deep domain knowledge that the ML team needs. Make them partners in the migration, not casualties of it. Their expertise in reviewing disagreements is what makes the comparison engine valuable.

>**When to stop:** Not every rules engine should be migrated to ML. If the rules are simple, stable, and well-understood, the operational overhead of an ML system may not be justified. Migrate when the rules are too complex to maintain, when the domain is changing faster than rules can be written, or when ML can capture patterns that rules cannot express.

## 5. Cloud Mapping

| Component | GCP | AWS | Azure |
| --- | --- | --- | --- |
| **Traffic Routing** | Cloud Load Balancing + feature flags | ALB + LaunchDarkly | Azure Front Door + feature flags |
| **ML Serving** | Vertex AI Endpoints | SageMaker Endpoints | Azure ML Endpoints |
| **Comparison Engine** | Dataflow + BigQuery | Kinesis + Redshift | Stream Analytics + Synapse |
| **Dashboard** | Looker | QuickSight | Power BI |
| **Audit Trail** | Cloud Logging + BigQuery | CloudTrail + Athena | Azure Monitor + Log Analytics |

## 6. Anti-Patterns

1.  **Big-bang migration** — Switching from rules to ML overnight with no parallel run. One bad prediction and you lose all stakeholder trust with no safety net to fall back on.
2.  **Comparing only accuracy, ignoring deliberate edge cases** — Some rules exist specifically to handle rare but important scenarios. A 98% agreement rate means nothing if the 2% disagreements are the high-stakes decisions.
3.  **No fallback mechanism** — If the ML model starts producing bad predictions, there is no quick rollback to the rules engine. The toggle switch must work instantly, not require a deployment.
4.  **Training on rule outputs only** — If you train the ML model exclusively on what the rules engine decided, you are teaching it to replicate the rules engine's biases and errors. Use ground-truth outcomes wherever possible.
5.  **Excluding the business rules team** — The people who wrote and maintained the rules know why specific rules exist, including the edge cases and business context that are not documented anywhere. Sidelining them guarantees blind spots.

## 7. Architect's Checklist

-   Shadow mode deployed — ML model running on all live traffic without affecting decisions
-   Agreement rate tracked — dashboard shows real-time agreement/disagreement between systems
-   Disagreement cases reviewed by domain experts — every mismatch investigated and categorized
-   Gradual traffic shift plan documented with stage gates and pass/fail criteria
-   Instant rollback tested — verified that traffic can be shifted back to rules engine in under 60 seconds
-   Regulatory review completed — compliance team has approved the migration approach
-   Training data includes ground truth, not just rule outputs — avoids learning the rules engine's biases
-   Performance baseline established — latency, throughput, and accuracy benchmarks for both systems
-   Edge case catalog documented — known special cases from the rules engine explicitly tested against the ML model
-   Stakeholder sign-off at each phase — business, compliance, and engineering approve before advancing
-   Sunset plan for rules engine — timeline and criteria for when the rules engine will be fully decommissioned
