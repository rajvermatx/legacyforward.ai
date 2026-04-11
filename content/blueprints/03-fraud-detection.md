---
title: "Real-Time Fraud Detection with Explainable AI"
slug: "fraud-detection"
description: "Score transactions in under 100ms using ML models, explain every decision with SHAP values,
    and feed outcomes back into a continuous learning loop — the trifecta of speed, accuracy, and transparency."
section: "blueprints"
order: 3
badges:
  - "Sub-100ms Scoring"
  - "SHAP Explainability"
  - "Feedback Loop"
  - "Case Management"
---

## 1. Overview

Every time someone swipes a credit card, a wire transfer processes, or an insurance claim is filed, a fraud detection system has milliseconds to make a decision: legitimate or fraudulent? Get it wrong in one direction and you lose money to fraud — the global cost of payment fraud alone exceeds $30 billion annually. Get it wrong in the other direction and you block a legitimate customer trying to buy groceries or pay their rent, destroying trust and driving them to a competitor. The stakes are high in both directions.

Traditional rule-based systems work by encoding known patterns: "if transaction amount exceeds $10,000 and country differs from home country, flag it." These catch known fraud patterns reliably, but fraudsters adapt quickly. They test the rules, find the edges, and engineer transactions that slip through. Machine learning models flip this around — instead of hand-coding rules, you train a model on millions of historical transactions (both legitimate and fraudulent) and let it learn the subtle patterns that humans miss. The problem? ML models are often black boxes. They flag a transaction, but they can't tell you why.

Regulators and customers both demand explanations. If you block someone's transaction, you need to explain the reason — not just say "the model said so." This is where explainability comes in. Techniques like SHAP (SHapley Additive exPlanations) can break down a fraud score into specific contributing factors: "This transaction scored high because the amount was 5x the customer's average, it occurred at 3 AM in a new country, and the merchant category was inconsistent with spending history." Now a human analyst can review the case intelligently, and a regulator can audit the system.

The architecture challenge is combining all three: speed (sub-100ms decisions so customers don't wait), accuracy (catching real fraud while keeping false positives low enough that you're not blocking 5% of legitimate transactions), and explainability (being able to justify every single decision). This blueprint shows you how to wire together real-time feature engineering, ML scoring, decision engines, and explainability modules into a system that handles millions of transactions per day.

## 2. Architecture Diagram

![Diagram 1](/diagrams/blueprints/fraud-detection-1.svg)

Architecture diagram — Real-Time Fraud Detection: streaming features, ML scoring, decision engine, explainability, and feedback loop

## 3. Component Breakdown

⚡

#### Real-Time Feature Engineering

Computes features on-the-fly from streaming transactions: velocity (transactions per hour), average spend deviation, geographic distance from last transaction, time since last activity, merchant category patterns. Sub-10ms lookup from a feature store.

🧠

#### ML Scoring Engine

Runs inference on feature vectors in under 50ms. Typically gradient-boosted trees (XGBoost, LightGBM) for tabular data, or neural networks for sequence-based patterns. Outputs a fraud probability score between 0 and 1.

⚖

#### Decision Engine

Applies business rules to the ML score: approve (score < 0.3), review (0.3-0.7), block (score > 0.7). Thresholds vary by transaction type, amount, and customer segment. Rules and ML work together.

🔍

#### Explainability Module

Generates SHAP (or LIME) values for every scored transaction, showing which features contributed most to the fraud score. Critical for regulatory compliance (SR 11-7, GDPR Article 22) and analyst efficiency.

📋

#### Case Management Queue

Routes "review" decisions to human analysts with full context: transaction details, fraud score, SHAP explanations, and customer history. Analysts confirm or override, creating labeled training data.

🔄

#### Feedback Loop & Retraining

Analyst decisions and confirmed fraud outcomes feed back into the training pipeline. Models are retrained on a schedule (weekly or triggered by drift detection) to adapt to new fraud patterns.

## 4. Decision Points & Trade-offs

| Advantage | Limitation |
| --- | --- |
| Real-time scoring catches fraud as it happens | Real-time inference has a strict latency budget |
| ML models detect novel, previously unseen fraud patterns | Requires explainability layer for regulatory compliance |
| SHAP values provide per-feature decision explanations | SHAP computation adds latency (often done async) |
| Feedback loop continuously improves model accuracy | Feedback loop introduces label delay (fraud confirmed weeks later) |
| Segment-specific thresholds reduce false positives | More thresholds = more operational complexity to manage |

>**Sync vs. Async Explainability:** Computing SHAP values for every transaction in real-time can add 50-200ms. For the approve/block decision, you only need the score. Compute SHAP asynchronously and attach it to the case record. Analysts get explanations when they open a case, not at scoring time.

>**The False Positive Problem:** A 1% false positive rate sounds low until you process 10 million transactions per day — that's 100,000 legitimate customers blocked daily. Optimize for precision as aggressively as you optimize for recall.

## 5. Cloud Mapping

| Component | GCP | AWS | Azure |
| --- | --- | --- | --- |
| **Streaming** | Pub/Sub + Dataflow | Kinesis + Lambda | Event Hubs + Stream Analytics |
| **Feature Store** | Vertex AI Feature Store | SageMaker Feature Store | Azure ML Feature Store |
| **Model Serving** | Vertex AI Endpoints | SageMaker Real-time | Azure ML Online Endpoints |
| **Explainability** | Vertex Explainable AI | SageMaker Clarify | Azure ML Responsible AI |
| **Case Management** | Custom + Firestore | Custom + DynamoDB | Custom + Cosmos DB |

## 6. Anti-Patterns

1.  **Batch-only scoring for real-time transaction decisions.** If your model scores transactions in a nightly batch, you're approving fraudulent transactions all day and only catching them after the money is gone. Real-time transactions require real-time scoring.
2.  **Black-box models in regulated environments with no explainability.** Financial regulators (OCC, FCA, GDPR) require that you can explain why a customer's transaction was declined. "The model said so" is not an acceptable explanation during an audit.
3.  **No feedback loop — the model never learns from false positives or negatives.** Fraud patterns evolve monthly. If your model was trained on last year's data and never updated, fraudsters will learn exactly how to evade it. Continuous retraining is not optional.
4.  **Feature store lag — using stale features for real-time decisions.** If your "real-time" features are actually 15 minutes old, a fraudster can make 20 transactions before the velocity feature catches up. Measure and guarantee feature freshness.
5.  **Single threshold for all transaction types.** A $50 coffee purchase and a $50,000 wire transfer have completely different risk profiles. Using the same fraud threshold for both will either block too many coffees or miss too many wire frauds.

## 7. Architect's Checklist

-   End-to-end latency verified under 100ms at p95 (feature lookup + inference + decision)
-   Explainability module tested — SHAP values generated for every flagged transaction
-   Feedback loop operational: analyst decisions flow back to training pipeline automatically
-   Feature freshness monitored — alerts if real-time features lag beyond acceptable threshold
-   Model drift detection deployed — alerts on score distribution shifts and accuracy degradation
-   Per-segment threshold tuning for transaction type, amount range, and customer risk tier
-   Regulatory documentation: model cards, validation reports, and explainability audit trail
-   A/B testing framework for comparing champion vs. challenger models in production
-   Fallback to rules-based scoring if ML model fails or exceeds latency budget
-   PII handling verified — no raw customer data in feature store or model logs
-   Complete audit trail for every decision: score, features used, threshold applied, outcome
