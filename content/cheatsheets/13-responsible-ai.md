---
title: "Responsible AI"
slug: "responsible-ai"
description: "Quick reference for fairness metrics, bias detection, explainability, privacy techniques, model cards, and audit checklists."
section: "cheatsheets"
order: 13
badges:
  - "AI Ethics"
  - "Quick Reference"
---

## Responsible AI Pillars

Responsible AI is not an optional add-on -- it is a set of engineering practices that prevent your models from causing harm. These six pillars define the minimum standard for any AI system deployed to real users.

| Pillar | Core Question | Key Methods |
|--------|--------------|-------------|
| Fairness | Does the model treat all groups equitably? | Fairness metrics, bias audits |
| Transparency | Can we explain how the model works? | SHAP, LIME, model cards |
| Privacy | Does it protect individual data? | DP, federated learning, anonymization |
| Safety | Can it cause harm? | Red-teaming, guardrails, testing |
| Accountability | Who is responsible for outcomes? | Governance, audit trail, documentation |
| Robustness | Does it work reliably under stress? | Adversarial testing, edge cases |

## Fairness Metrics

Fairness metrics quantify whether your model treats different demographic groups equitably. You cannot satisfy all fairness metrics simultaneously when base rates differ -- so choose the metric that aligns with your specific use case and regulatory requirements.

### Group Fairness Metrics

| Metric | Definition | Target | Good For |
|--------|-----------|--------|----------|
| Demographic Parity | P(Y=1\|A=a) = P(Y=1\|A=b) | Equal selection rates across groups | Hiring, lending |
| Equalized Odds | P(Y=1\|Y_true=y, A=a) = P(Y=1\|Y_true=y, A=b) | Equal TPR and FPR across groups | Criminal justice |
| Equal Opportunity | P(Y=1\|Y_true=1, A=a) = P(Y=1\|Y_true=1, A=b) | Equal TPR across groups | Loan approval |
| Predictive Parity | P(Y_true=1\|Y=1, A=a) = P(Y_true=1\|Y=1, A=b) | Equal precision across groups | Medical diagnosis |
| Calibration | P(Y=1\|score=s, A=a) = P(Y=1\|score=s, A=b) | Equal calibration across groups | Risk scoring |
| Counterfactual Fairness | Y(a) = Y(a') for individual | Same prediction if sensitive attribute changed | Any |

### Metric Impossibility Theorem

You cannot simultaneously satisfy all fairness metrics when base rates differ between groups. Choose the metric most appropriate for your context.

### Computing Fairness Metrics

```python
from fairlearn.metrics import (
    demographic_parity_difference,
    equalized_odds_difference,
    MetricFrame
)
from sklearn.metrics import accuracy_score, precision_score, recall_score

# Compute metrics by group
metric_frame = MetricFrame(
    metrics={
        "accuracy": accuracy_score,
        "precision": precision_score,
        "recall": recall_score,
    },
    y_true=y_test,
    y_pred=y_pred,
    sensitive_features=sensitive_features
)

print(metric_frame.by_group)
print(f"Demographic parity diff: {demographic_parity_difference(y_test, y_pred, sensitive_features=sensitive_features)}")
print(f"Equalized odds diff: {equalized_odds_difference(y_test, y_pred, sensitive_features=sensitive_features)}")
```

## Bias Detection

Bias enters your model at every stage -- from data collection through deployment. Detecting it requires systematic checking at each stage, not a one-time audit after training.

### Types of Bias

| Bias Type | Stage | Description | Example |
|-----------|-------|-------------|---------|
| Historical | Data | Training data reflects past discrimination | Hiring data skewed toward majority group |
| Representation | Data | Under/overrepresentation of groups | Medical data mostly from one demographic |
| Measurement | Data | Features proxy for protected attributes | Zip code as proxy for race |
| Aggregation | Modeling | Single model for heterogeneous populations | One model for all age groups |
| Evaluation | Evaluation | Test data not representative | Eval set lacks minority examples |
| Deployment | Deployment | Model used in unintended context | Credit model used for hiring |

### Bias Detection Checklist

- [ ] Examine training data demographics vs target population
- [ ] Check label distribution across protected groups
- [ ] Test for proxy features (correlated with protected attributes)
- [ ] Compute fairness metrics across all protected groups
- [ ] Analyze error rates by subgroup
- [ ] Test with counterfactual examples (change only sensitive attribute)
- [ ] Review feature importance for proxy discrimination
- [ ] Evaluate on diverse test sets

### Bias Mitigation Strategies

| Stage | Technique | Description |
|-------|-----------|-------------|
| Pre-processing | Resampling | Over/under-sample to balance groups |
| Pre-processing | Reweighting | Assign higher weights to underrepresented groups |
| Pre-processing | Feature removal | Remove or transform proxy features |
| In-processing | Constrained optimization | Add fairness constraints to loss function |
| In-processing | Adversarial debiasing | Train adversary to predict sensitive attribute |
| Post-processing | Threshold adjustment | Different classification thresholds per group |
| Post-processing | Calibration | Equalize calibration across groups |

## Explainability

If you cannot explain why your model made a decision, you cannot debug it, audit it, or defend it in a regulatory review. Explainability methods range from fast-and-approximate to slow-and-rigorous -- choose based on your audience and stakes.

### Methods Comparison

| Method | Type | Scope | Speed | Faithfulness |
|--------|------|-------|-------|-------------|
| SHAP | Model-agnostic | Local + Global | Slow | High |
| LIME | Model-agnostic | Local | Medium | Medium |
| Integrated Gradients | Gradient-based | Local | Fast | High |
| Attention weights | Model-specific | Local | Fast | Low-Medium |
| Feature importance | Model-specific | Global | Fast | Medium |
| Counterfactual | Model-agnostic | Local | Medium | High |
| TCAV (Concept-based) | Neural networks | Global | Slow | High |
| Partial Dependence | Model-agnostic | Global | Medium | Medium |

### SHAP Example

```python
import shap

# For tree models (fast)
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
shap.summary_plot(shap_values, X_test)

# For any model (slower)
explainer = shap.KernelExplainer(model.predict, shap.sample(X_train, 100))
shap_values = explainer.shap_values(X_test[:10])
shap.force_plot(explainer.expected_value, shap_values[0], X_test.iloc[0])
```

### LIME Example

```python
from lime.lime_tabular import LimeTabularExplainer

explainer = LimeTabularExplainer(
    X_train.values,
    feature_names=X_train.columns.tolist(),
    class_names=["Denied", "Approved"],
    mode="classification"
)

# Explain single prediction
exp = explainer.explain_instance(
    X_test.iloc[0].values,
    model.predict_proba,
    num_features=10
)
exp.show_in_notebook()
```

### When to Use Which

| Scenario | Recommended Method |
|----------|-------------------|
| Regulatory audit (need consistency) | SHAP (Shapley values are theoretically grounded) |
| Quick debugging a single prediction | LIME |
| Understanding overall model behavior | SHAP summary plot + Partial Dependence |
| Deep learning models | Integrated Gradients, Attention |
| "What would change the outcome?" | Counterfactual explanations |
| Non-technical stakeholder communication | LIME (intuitive), feature importance |

## Privacy Techniques

Privacy is not just about compliance -- a model that memorizes training data can leak personal information at inference time. These techniques protect individual data while preserving the model's ability to learn useful patterns.

### Differential Privacy (DP)

| Concept | Description |
|---------|-------------|
| Epsilon (e) | Privacy budget. Lower = more private. Typical: 1-10 |
| Delta (d) | Probability of privacy breach. Typical: 1/n^2 |
| Sensitivity | Max change one record causes in output |
| Noise mechanism | Laplace (pure DP) or Gaussian (approximate DP) |
| Composition | Privacy degrades with multiple queries |

```python
# DP-SGD training with Opacus (PyTorch)
from opacus import PrivacyEngine

privacy_engine = PrivacyEngine()
model, optimizer, dataloader = privacy_engine.make_private_with_epsilon(
    module=model,
    optimizer=optimizer,
    data_loader=dataloader,
    epochs=10,
    target_epsilon=3.0,
    target_delta=1e-5,
    max_grad_norm=1.0
)
```

### Federated Learning

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Client A │     │ Client B │     │ Client C │
│ (local   │     │ (local   │     │ (local   │
│  data)   │     │  data)   │     │  data)   │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │ gradients      │ gradients      │ gradients
     └───────────┬────┴───────────┬────┘
                 ▼                ▼
          ┌──────────────────────────┐
          │    Aggregation Server    │
          │ (aggregate gradients,    │
          │  update global model)    │
          └──────────────────────────┘
```

### Privacy Technique Selection

| Technique | Protects Against | Use Case |
|-----------|-----------------|----------|
| Differential Privacy | Membership inference, reconstruction | Analytics, ML training |
| Federated Learning | Data centralization | Cross-org collaboration |
| K-anonymity | Re-identification | Data publishing |
| Secure enclaves (TEE) | Server-side access | Cloud computing |
| Homomorphic encryption | Any computation | Very sensitive data |
| Data masking/tokenization | Direct exposure | PII in logs/storage |

## Model Cards

A model card is the nutrition label for your ML model -- it documents what the model does, what it was trained on, where it works well, and where it fails. Every model deployed to production should have one.

### Model Card Template

```markdown
# Model Card: [Model Name]

## Model Details
- **Developer:** [Team/Organization]
- **Model date:** [Date]
- **Model version:** [Version]
- **Model type:** [Architecture]
- **License:** [License]

## Intended Use
- **Primary use:** [Intended application]
- **Out-of-scope:** [What it should NOT be used for]
- **Users:** [Intended users]

## Training Data
- **Dataset:** [Name, size, date range]
- **Preprocessing:** [Steps taken]
- **Demographics:** [Population represented]

## Evaluation
- **Metrics:** [Which metrics, why]
- **Overall performance:** [Results]
- **Disaggregated performance:** [Results by subgroup]

## Limitations
- [Known limitation 1]
- [Known limitation 2]

## Ethical Considerations
- [Potential harms]
- [Mitigations applied]

## Monitoring
- [How the model is monitored in production]
- [Feedback mechanisms]
```

## Audit Checklist

This checklist is your gate between development and production. Skipping any item does not save time -- it creates risk that compounds after deployment when fixing problems is 10x more expensive.

### Pre-Deployment

- [ ] Model card completed and reviewed
- [ ] Training data documented (source, demographics, known biases)
- [ ] Fairness metrics computed across all protected groups
- [ ] Bias mitigation applied where metrics indicate disparities
- [ ] Explainability methods validated (SHAP/LIME outputs make sense)
- [ ] Privacy assessment completed (PII handling, DP if applicable)
- [ ] Red-team testing performed (adversarial inputs, edge cases)
- [ ] Stakeholder review (legal, compliance, affected communities)
- [ ] Performance benchmarks meet minimum thresholds for all subgroups
- [ ] Fallback/override mechanism exists for incorrect predictions

### Post-Deployment

- [ ] Monitoring dashboards active (fairness metrics, performance by group)
- [ ] Drift detection configured (feature, prediction, fairness drift)
- [ ] Feedback collection mechanism live
- [ ] Incident response plan documented
- [ ] Regular re-evaluation scheduled (quarterly minimum)
- [ ] Model deprecation criteria defined

## Regulations and Frameworks

AI regulation is accelerating globally, and non-compliance can mean fines, lawsuits, or deployment bans. Know which frameworks apply to your use case and jurisdiction before you ship.

| Regulation/Framework | Region | Key Requirements |
|---------------------|--------|-----------------|
| EU AI Act | EU | Risk classification, transparency, human oversight |
| NIST AI RMF | US | Govern, Map, Measure, Manage lifecycle |
| CCPA/CPRA | California | Consumer data rights, automated decision rights |
| GDPR Art. 22 | EU | Right to explanation for automated decisions |
| NYC Local Law 144 | NYC | Bias audit for hiring AI, public disclosure |
| Canada AIDA | Canada | High-impact system assessment, transparency |
| ISO 42001 | Global | AI Management System standard |

## Common Pitfalls

Responsible AI failures rarely come from malice -- they come from shortcuts, blind spots, and treating fairness as a checkbox instead of a continuous practice.

| Pitfall | Problem | Fix |
|---------|---------|-----|
| Only checking overall accuracy | Hides group disparities | Always disaggregate metrics by subgroup |
| Removing sensitive attributes | Proxies still cause bias | Test for proxy features, use counterfactuals |
| One-time bias check | Bias can emerge over time | Continuous monitoring in production |
| Explainability as afterthought | Cannot explain model | Choose interpretable models or plan for SHAP/LIME |
| Ignoring downstream effects | Model used in harmful context | Document intended use, monitor deployments |
| Privacy compliance only | Misses ethical concerns | Go beyond legal minimum |
| No human oversight | Automated harm | Human-in-the-loop for high-stakes decisions |
| Cherry-picked fairness metric | Actual fairness not achieved | Report multiple metrics, justify selection |
