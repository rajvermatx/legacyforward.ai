---
title: "MLOps with Vertex AI: Model Evaluation"
slug: "mlops-model-evaluation"
description: "Model evaluation is the gatekeeper between development and production. A model that scores well on training
    data can fail catastrophically in the real world. This module covers every metric, method, and tool you need
    for evaluating both classical ML and generative AI models on GCP — from con"
section: "gcp-mle"
order: 14
badges:
  - "Classification Metrics"
  - "Regression Metrics"
  - "GenAI Evaluation"
  - "Vertex AI Evaluation"
  - "Bias & Fairness"
  - "A/B Testing"
---

## 01. Model Evaluation Fundamentals

Model evaluation answers three critical questions: **Is this model good enough for production?** **Is it better than what we have?** **Is it fair and safe?** Evaluation happens at multiple stages of the ML lifecycle:

| When | What | Purpose |
| --- | --- | --- |
| **During Training** | Validation metrics per epoch | Detect overfitting, tune hyperparameters |
| **Post-Training** | Test set evaluation | Unbiased performance estimate |
| **Pre-Deployment** | Champion-challenger comparison | Decide whether to deploy new model |
| **Post-Deployment** | Continuous evaluation | Detect model degradation in production |

>**Golden Rule:** Never evaluate on training data. Always hold out a test set that the model has never seen. For time-series data, use temporal splits (train on past, test on future). For GenAI, ensure evaluation prompts were not in the fine-tuning dataset.

## 02. Classification Metrics

Classification is the most common ML task on the exam. You must know when to use each metric and the tradeoffs between them.

### The Confusion Matrix

Every classification metric derives from the confusion matrix. For binary classification:

![Diagram 1](/diagrams/gcp-mle/mlops-model-evaluation-1.svg)

The confusion matrix is the foundation of all classification metrics.

### Core Classification Metrics

Accuracy = (TP + TN) / (TP + TN + FP + FN)

**Accuracy** is the simplest metric but misleading for imbalanced datasets. If 99% of emails are not spam, a model that always predicts "not spam" achieves 99% accuracy but catches zero spam.

Precision = TP / (TP + FP) — "Of predicted positives, how many are correct?"

**Precision** matters when **false positives are costly**. Example: spam filter (you don't want to send real emails to spam), medical diagnosis (false positive means unnecessary treatment).

Recall = TP / (TP + FN) — "Of actual positives, how many did we find?"

**Recall** matters when **false negatives are costly**. Example: fraud detection (missing a fraud case is expensive), cancer screening (missing a cancer case is dangerous).

F1 = 2 \* (Precision \* Recall) / (Precision + Recall)

**F1 Score** is the harmonic mean of precision and recall. Use it when you need to balance both. It is the default metric for imbalanced classification problems.

>**Exam Tip:** When the exam says "minimize false positives" → **optimize precision**. When it says "minimize false negatives" → **optimize recall**. When it says "imbalanced dataset" → do NOT use accuracy; use **F1, PR-AUC, or ROC-AUC**.

### ROC-AUC and PR-AUC

**ROC-AUC** (Receiver Operating Characteristic - Area Under Curve) plots True Positive Rate vs False Positive Rate at all classification thresholds. AUC = 1.0 is perfect, AUC = 0.5 is random.

**PR-AUC** (Precision-Recall AUC) plots Precision vs Recall. More informative than ROC-AUC for **highly imbalanced datasets** where the positive class is rare (fraud, disease).

| Metric | Best For | Range | Threshold-Free? |
| --- | --- | --- | --- |
| **Accuracy** | Balanced datasets | 0-1 | No |
| **Precision** | FP is costly | 0-1 | No |
| **Recall** | FN is costly | 0-1 | No |
| **F1** | Imbalanced, need balance | 0-1 | No |
| **ROC-AUC** | Overall ranking ability | 0-1 | Yes |
| **PR-AUC** | Imbalanced + rare positive | 0-1 | Yes |

## 03. Regression Metrics

MAE = (1/n) \* ∑ |y\_i - ŷ\_i|

**Mean Absolute Error (MAE)**: Average absolute difference between predictions and actual values. Robust to outliers. Easy to interpret (same units as target).

MSE = (1/n) \* ∑ (y\_i - ŷ\_i)²

**Mean Squared Error (MSE)**: Average squared difference. Penalizes large errors more heavily than MAE. Units are squared (harder to interpret).

RMSE = √MSE

**Root Mean Squared Error (RMSE)**: Square root of MSE. Same units as target, but still penalizes large errors. The most commonly used regression metric.

R² = 1 - (SS\_res / SS\_tot)

**R-Squared (Coefficient of Determination)**: Proportion of variance explained by the model. R² = 1.0 is perfect, R² = 0 means the model is no better than predicting the mean. Can be negative if the model is worse than the mean.

MAPE = (100/n) \* ∑ |y\_i - ŷ\_i| / |y\_i|

**Mean Absolute Percentage Error (MAPE)**: Error as a percentage. Easy for stakeholders to understand ("our predictions are off by 5%"). Undefined when actual value is zero.

>**Choosing Regression Metrics:** Use **RMSE** as the default. Use **MAE** when outliers should not dominate. Use **MAPE** for business stakeholder communication. Use **R²** to explain "how much variance does the model explain?"

## 04. Evaluation for Generative AI

Evaluating generative AI requires fundamentally different approaches than classical ML. There is no single ground truth for open-ended text generation, and traditional metrics like accuracy do not apply.

### Pointwise Evaluation

**Pointwise evaluation** scores a single model response on a rubric. A human or LLM judge rates the response on criteria like relevance, accuracy, completeness, and coherence, typically on a 1-5 scale.

```
# Pointwise evaluation criteria
criteria = {
    "relevance":    "Does the response address the question?",
    "accuracy":     "Is the information factually correct?",
    "completeness": "Does it cover all important aspects?",
    "coherence":    "Is the text well-organized and logical?",
    "safety":       "Is the response free from harmful content?",
}
# Each criterion scored 1-5, aggregate for overall quality
```

### Pairwise Evaluation

**Pairwise evaluation** compares two responses and determines which is better. This is more reliable than pointwise scoring because humans and LLMs are better at relative comparisons than absolute ratings. Used heavily in RLHF for collecting preference data.

### Automated Metrics: BLEU, ROUGE, Perplexity

| Metric | Measures | Best For | Limitation |
| --- | --- | --- | --- |
| **BLEU** | N-gram overlap between generated and reference text | Translation, constrained generation | Ignores meaning; multiple valid outputs score poorly |
| **ROUGE** | Recall-oriented n-gram overlap | Summarization | Only measures surface-level similarity |
| **Perplexity** | How "surprised" the model is by text (lower = better) | Language model quality | Does not measure factual correctness |

>**Important for Exam:** BLEU and ROUGE are fast and reproducible but **correlate poorly with human judgment** for open-ended generation. The exam may test whether you know to use **LLM-based evaluation** (not just BLEU/ROUGE) for GenAI quality assessment.

### LLM-Based Evaluation

LLM-based evaluation uses a strong model (e.g., Gemini Pro) to judge outputs from any model. Key dimensions evaluated:

F

#### Faithfulness

Is the response grounded in the provided context? Critical for RAG systems to prevent hallucination.

R

#### Relevance

Does the response actually answer the question? Measures alignment between query and answer.

C

#### Coherence

Is the response well-structured and logically consistent? No contradictions or random tangents.

S

#### Safety

Is the response free from harmful, biased, or inappropriate content? Required for production deployment.

## 05. Vertex AI Model Evaluation

Vertex AI provides built-in evaluation tools for both classical ML and generative AI models.

### AutoML Model Evaluation

When you train an AutoML model, Vertex AI automatically generates evaluation metrics on the test set. These include confusion matrix, ROC curve, precision-recall curve, and feature importance for classification; MAE, RMSE, R² for regression.

```
# Access AutoML model evaluation via SDK
from google.cloud import aiplatform

model = aiplatform.Model("projects/my-proj/locations/us-central1/models/12345")

# Get all evaluation slices
evaluations = model.list_model_evaluations()
for eval in evaluations:
    print(f"Evaluation: {eval.display_name}")
    print(f"  Metrics: {eval.metrics}")
    print(f"  Slices: {eval.model_evaluation_slices}")
```

### Gen AI Evaluation Service

The **Vertex AI Gen AI Evaluation Service** provides automated evaluation for generative AI models. It supports:

-   **Pointwise metrics:** Fluency, coherence, safety, groundedness
-   **Pairwise comparison:** Compare outputs from two models
-   **Task-specific:** Summarization quality, QA accuracy, text generation
-   **Custom rubrics:** Define your own evaluation criteria
-   **Batch evaluation:** Evaluate hundreds of examples in parallel

```
# Vertex AI Gen AI Evaluation
from vertexai.evaluation import EvalTask, PointwiseMetric

eval_task = EvalTask(
    dataset=eval_dataset,      # List of {prompt, reference, response}
    metrics=[
        "fluency",
        "coherence",
        "safety",
        "groundedness",
        PointwiseMetric(
            metric="custom_quality",
            metric_prompt_template="Rate quality 1-5: {response}",
        ),
    ],
)

result = eval_task.evaluate(
    model=GenerativeModel("gemini-2.0-flash"),
)
print(result.summary_metrics)
print(result.metrics_table)  # Per-example scores
```

## 06. Evaluation Datasets

The quality of your evaluation is only as good as your evaluation dataset. A **golden dataset** (or gold standard dataset) is a curated collection of inputs and expected outputs used as the ground truth for evaluation.

### Creating Golden Datasets

-   **Representative:** Cover all important use cases and edge cases
-   **Diverse:** Include examples from all user segments, languages, topics
-   **Annotated:** Human-verified expected outputs (not model-generated)
-   **Versioned:** Track changes to evaluation data over time
-   **Size:** 100-500 examples minimum for meaningful evaluation

### Avoiding Contamination

>**Data Leakage Warning:** **Test set contamination** is the most common evaluation mistake. Ensure: (1) test data was never in the training set, (2) no duplicate or near-duplicate examples across splits, (3) for GenAI, evaluation prompts were not used during fine-tuning, (4) temporal ordering is preserved for time-series data.

## 07. Continuous Evaluation

Models degrade over time as data distributions shift. **Continuous evaluation** monitors deployed model performance by periodically comparing predictions against ground truth labels that arrive with a delay.

### Vertex AI Continuous Evaluation

Vertex AI supports continuous evaluation for deployed models. It samples predictions from the serving endpoint, collects ground truth labels (when available), and computes metrics over time windows.

| Approach | How | When to Use |
| --- | --- | --- |
| **Ground truth comparison** | Compare predictions to delayed labels | When labels eventually become available (e.g., loan default after 6 months) |
| **Proxy metrics** | Track user engagement, click-through rate, task completion | When ground truth is unavailable or subjective |
| **LLM judge pipeline** | Periodically run LLM-as-judge on sampled outputs | GenAI models where ground truth is not well-defined |
| **Human review sampling** | Send random samples to human reviewers | High-stakes applications (medical, legal, financial) |

>**Retraining Triggers:** Set up alerts to trigger retraining when: (1) evaluation metrics drop below a threshold, (2) data drift is detected, (3) new training data is available, (4) business requirements change. Use Vertex AI Pipelines to automate the retrain-evaluate-deploy cycle.

## 08. Bias and Fairness Evaluation

A model can have excellent aggregate metrics but perform poorly for specific subgroups. **Slice-based evaluation** breaks down metrics by demographic or business-relevant segments.

### Slice-Based Evaluation

Instead of looking only at overall accuracy, compute metrics for each slice of your data:

```
# Slice-based evaluation example
slices = {
    "gender": ["male", "female", "non-binary"],
    "age_group": ["18-30", "31-50", "51+"],
    "region": ["US", "EU", "Asia"],
}

for slice_name, values in slices.items():
    for value in values:
        subset = test_data[test_data[slice_name] == value]
        metrics = compute_metrics(subset.predictions, subset.labels)
        print(f"{slice_name}={value}: F1={metrics['f1']:.3f}, Recall={metrics['recall']:.3f}")
```

### Fairness Metrics

| Metric | Definition | Use Case |
| --- | --- | --- |
| **Demographic Parity** | Equal positive prediction rates across groups | Hiring, lending decisions |
| **Equal Opportunity** | Equal true positive rates across groups | When FN cost varies by group |
| **Equalized Odds** | Equal TPR and FPR across groups | Strictest fairness requirement |
| **Calibration** | Predicted probabilities match actual rates per group | Risk scoring (credit, insurance) |

>**Vertex AI Fairness:** Vertex AI Model Evaluation provides slice-based evaluation out of the box. Use the `model_evaluation_slices` API to retrieve metrics for specific data segments. The What-If Tool (WIT) provides interactive fairness analysis.

## 09. A/B Testing

A/B testing compares two model versions in production by splitting live traffic and measuring real-world performance. Unlike offline evaluation, A/B testing captures user behavior and business metrics.

### Setting Up A/B Tests on Vertex AI

Vertex AI endpoints support **traffic splitting** natively. Deploy two model versions to the same endpoint and configure the traffic split:

```
# Deploy two models with traffic split
endpoint = aiplatform.Endpoint("projects/.../endpoints/12345")

# Champion: current model (90% traffic)
endpoint.deploy(
    model=champion_model,
    deployed_model_display_name="champion-v2",
    traffic_percentage=90,
    machine_type="n1-standard-4",
)

# Challenger: new model (10% traffic)
endpoint.deploy(
    model=challenger_model,
    deployed_model_display_name="challenger-v3",
    traffic_percentage=10,
    machine_type="n1-standard-4",
)
```

### Statistical Significance

Do not declare a winner until you reach **statistical significance**. Key concepts:

-   **Sample size:** Calculate minimum sample size before starting the test
-   **p-value:** Probability the observed difference is due to chance (p < 0.05 typical threshold)
-   **Effect size:** How large is the practical difference between models?
-   **Duration:** Run long enough to capture weekly/seasonal patterns
-   **Multiple comparisons:** If testing many metrics, apply Bonferroni correction

Minimum Sample Size per Variant = (Z\_alpha + Z\_beta)² \* 2 \* p \* (1-p) / (delta)²

>**Common A/B Testing Mistakes:** (1) Stopping the test early when results "look good" (peeking problem). (2) Not accounting for novelty effects (users may interact more with any new model). (3) Testing too many variants at once without proper correction. (4) Using the wrong metric (optimize for business KPI, not just ML metric).

## 10. Exam Focus: Key Takeaways
>**Exam Tips - Sections 5 & 6:** Model evaluation is heavily tested. You must be able to choose the right metric for the scenario and know when to use GenAI-specific evaluation methods.

### Choosing the Right Metric

| Scenario | Metric | Why |
| --- | --- | --- |
| **Balanced classification** | Accuracy, ROC-AUC | Classes are roughly equal |
| **Imbalanced classification** | F1, PR-AUC | Accuracy is misleading |
| **Minimize false positives** | Precision | FP is costly (spam filter) |
| **Minimize false negatives** | Recall | FN is costly (fraud, cancer) |
| **Regression with outliers** | MAE | Robust to outliers |
| **Regression, standard** | RMSE | Default regression metric |
| **Business communication** | MAPE, R² | Easy to explain to stakeholders |
| **GenAI quality** | LLM-as-judge | Scalable, correlates with human judgment |
| **RAG evaluation** | Faithfulness, relevance | Measures retrieval + generation quality |
| **Summarization** | ROUGE + LLM-judge | ROUGE for overlap, LLM for quality |

### GenAI Evaluation Methods

-   Know the difference between **pointwise** (absolute scoring) and **pairwise** (comparative) evaluation
-   **BLEU/ROUGE** are fast but limited; use **LLM-based evaluation** for quality
-   Vertex AI Gen AI Evaluation Service supports both built-in and custom metrics
-   For RAG: evaluate **faithfulness** (grounded in context) and **relevance** (answers the question)

### When to Retrain

-   Continuous evaluation metrics drop below threshold
-   Data drift or concept drift detected
-   Significant new training data is available
-   Business requirements or target distribution changes
-   Scheduled periodic retraining (weekly/monthly depending on domain)

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Model evaluation is the gatekeeper between experimentation and production. For classification, you must choose between precision-focused metrics (when false positives are costly, like spam filtering) and recall-focused metrics (when false negatives are dangerous, like fraud or medical diagnosis). For regression, RMSE penalizes large errors while MAE is robust to outliers. For generative AI, traditional metrics like BLEU and ROUGE measure surface overlap but miss quality—LLM-as-judge evaluation with pointwise scoring or pairwise comparison is the modern standard. On Vertex AI, continuous evaluation runs automated assessments against production traffic, A/B testing validates model changes with statistical rigor, and fairness analysis ensures models don’t discriminate across protected groups. The key principle: never deploy a model without a clear evaluation strategy that ties ML metrics to business outcomes.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| How do you choose the right evaluation metric for a model? | Can you map business requirements (cost of false positives vs false negatives, data balance) to the appropriate metric? |
| When would you use PR-AUC instead of ROC-AUC? | Do you understand that ROC-AUC is misleading on imbalanced datasets and PR-AUC focuses on the positive class? |
| How do you evaluate a generative AI model’s output quality? | Can you explain the shift from BLEU/ROUGE to LLM-as-judge, including pointwise vs pairwise approaches? |
| How do you set up A/B testing for ML models? | Do you understand traffic splitting, statistical significance, sample size calculation, and the peeking problem? |
| How do you ensure fairness in your ML models? | Can you describe fairness metrics, slice-based evaluation, and how to detect and mitigate bias across protected attributes? |

### Model Answers

**Choosing the Right Metric:** I start by understanding the business cost structure. If a false positive is expensive (flagging a legitimate transaction as fraud causes customer friction), I optimize for precision. If a false negative is dangerous (missing a cancer diagnosis), I optimize for recall. For balanced datasets, accuracy and ROC-AUC work well. For imbalanced datasets (99% negative), I use F1-score and PR-AUC because accuracy is misleading—a model predicting all negatives gets 99% accuracy but is useless. For regression, I use RMSE when large errors matter disproportionately and MAE when I want robustness to outliers.

**GenAI Evaluation:** BLEU and ROUGE measure n-gram overlap with reference text, which is useful for translation and summarization but misses semantic quality. For production GenAI, I use LLM-as-judge: a strong model (like Gemini Pro) scores outputs on dimensions like helpfulness, accuracy, and safety. Pointwise evaluation assigns absolute scores to individual responses; pairwise evaluation compares two model outputs to determine which is better. On Vertex AI, the Gen AI Evaluation Service automates this with configurable rubrics and supports both built-in and custom evaluation metrics.

**A/B Testing Models:** I calculate the minimum sample size based on the expected effect size and desired statistical power (typically 80%) before starting. Traffic is split randomly at the user level (not request level) to avoid contamination. I run the test for at least one full business cycle to capture temporal patterns. I never peek at results early because repeated significance testing inflates the false positive rate. When comparing multiple variants, I apply Bonferroni correction. The primary metric is a business KPI, not an ML metric—click-through rate or revenue per user, not just model accuracy.

### System Design Scenario

>**Design Prompt:** **Scenario:** An e-commerce platform wants to replace its current product recommendation model with a new one. How would you design the evaluation and rollout strategy?
> 
> **Approach:** First, evaluate offline using held-out test data with metrics matching business goals: precision@k for relevance, recall@k for coverage, and NDCG for ranking quality. Compare against the current model on the same test set. If offline metrics improve, move to online A/B testing: deploy the new model to a Vertex AI Endpoint with 10% traffic split. Measure business KPIs (click-through rate, add-to-cart rate, revenue per session) over 2–4 weeks. Use Vertex AI Model Monitoring to watch for feature drift. Run fairness analysis to ensure recommendations don’t show demographic bias. If statistically significant improvement is confirmed (p < 0.05), gradually ramp traffic to 50%, then 100%. Keep the old model endpoint warm for 48 hours as a rollback safety net.

### Common Mistakes

-   **Using accuracy on imbalanced datasets** — A fraud detection model that predicts “not fraud” for every transaction achieves 99.9% accuracy but catches zero fraud. Always use F1, PR-AUC, or domain-specific metrics when classes are imbalanced.
-   **Stopping A/B tests early based on promising results** — The peeking problem inflates false positive rates. Pre-commit to a sample size and test duration. If you must check early, use sequential testing methods that control for multiple looks.
-   **Evaluating GenAI with only automated metrics** — BLEU and ROUGE have low correlation with human judgment for open-ended generation. Use LLM-as-judge for scalable quality assessment and periodic human evaluation to calibrate the automated system.

Previous

[← 13 · MLOps for GenAI](13-mlops-generative-ai.html)

Next

[15 · ML Pipelines on GCP →](15-ml-pipelines-gcp.html)