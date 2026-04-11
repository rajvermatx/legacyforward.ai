---
title: "Responsible AI — Fairness and Bias"
slug: "responsible-ai-fairness"
description: "Building ML systems that are fair, unbiased, and accountable is not optional — it is a core
    competency tested on the MLE exam. This module covers bias detection, fairness metrics, mitigation
    strategies, and Google's responsible AI tooling on Vertex AI."
section: "gcp-mle"
order: 18
badges:
  - "AI Principles"
  - "Types of Bias"
  - "Fairness Metrics"
  - "Mitigation Strategies"
  - "What-If Tool & Model Cards"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/18-responsible-ai-fairness.ipynb"
---

## 01. Google's AI Principles and Responsible AI Framework

Google published its **AI Principles** in 2018, establishing seven objectives that guide all AI development at Google and on Google Cloud. These principles are directly referenced in MLE exam questions about responsible AI decisions.

1

#### Be Socially Beneficial

AI should benefit society broadly. Consider the wide range of social and economic factors, and proceed only where benefits substantially outweigh risks.

2

#### Avoid Creating or Reinforcing Unfair Bias

Seek to avoid unjust impacts on people, particularly those related to sensitive characteristics such as race, ethnicity, gender, and nationality.

3

#### Be Built and Tested for Safety

Design AI systems with appropriate caution. Test rigorously using best practices in AI safety research.

4

#### Be Accountable to People

Design AI systems that provide appropriate opportunities for feedback, relevant explanations, and appeal.

5

#### Incorporate Privacy Design Principles

Give opportunity for notice and consent, encourage architectures with privacy safeguards, and provide appropriate transparency and control over data use.

6

#### Uphold High Standards of Scientific Excellence

Strive for technical excellence and make AI available for uses that accord with these principles.

Google also defined four AI application areas it **will not pursue**: technologies that cause overall harm, weapons, surveillance violating internationally accepted norms, and technologies that contravene international law and human rights.

>**Responsible AI Framework:** Google's Responsible AI practices rest on three pillars: (1) Building AI responsibly from the start, (2) Creating tools for responsible AI (What-If Tool, Model Cards, fairness metrics), and (3) Sharing research and best practices openly.

## 02. Types of Bias in Machine Learning

Bias can enter an ML system at every stage: data collection, feature engineering, model training, evaluation, and deployment. Understanding the source of bias is the first step to mitigating it.

### Data-Related Bias

| Bias Type | Definition | Example |
| --- | --- | --- |
| **Historical Bias** | Training data reflects past societal inequities | A hiring model trained on historical data where women were underrepresented in tech roles |
| **Representation Bias** | Certain groups are underrepresented in the training data | A facial recognition model trained mostly on light-skinned faces performs poorly on darker-skinned faces |
| **Measurement Bias** | Features or labels are measured differently across groups | Using zip code as a proxy for creditworthiness, which correlates with race due to historical redlining |
| **Sampling Bias** | Data collection process systematically excludes certain populations | A health study conducted only in urban hospitals misses rural populations |

### Model and Evaluation Bias

| Bias Type | Definition | Example |
| --- | --- | --- |
| **Aggregation Bias** | A single model is used for groups with different underlying patterns | A diabetes prediction model that doesn't account for different risk factors by ethnicity |
| **Evaluation Bias** | Evaluation metrics or benchmark datasets don't represent all groups equally | Model accuracy is 95% overall but only 70% for minority groups (hidden by aggregate metrics) |
| **Deployment Bias** | A model is used in a context different from what it was designed for | A model trained for resume screening is repurposed for performance evaluation |

>**Key Insight:** Bias is rarely introduced intentionally. It is typically a systemic issue rooted in historical data, measurement practices, or unconscious assumptions during system design. Always audit for bias proactively.

## 03. Fairness Definitions and Metrics

There is no single definition of "fairness" — different definitions can even be mathematically incompatible. The right metric depends on the application context and the stakeholders affected.

### Core Fairness Metrics

| Metric | Definition | When to Use |
| --- | --- | --- |
| **Demographic Parity** | P(Ŷ=1 | A=a) = P(Ŷ=1 | A=b) for all groups | When equal positive outcome rates across groups are needed (e.g., loan approval rates) |
| **Equalized Odds** | TPR and FPR are equal across groups | When both true positives and false positives matter equally (e.g., criminal justice) |
| **Equal Opportunity** | TPR is equal across groups (relaxed equalized odds) | When correctly identifying positive cases matters most (e.g., disease screening) |
| **Calibration** | Predicted probabilities match actual outcomes for each group | When the model outputs probabilities used for decision-making (e.g., risk scores) |
| **Individual Fairness** | Similar individuals receive similar predictions | When fairness should be at the individual, not group, level |

Disparate Impact Ratio = P(Ŷ=1 | unprivileged) / P(Ŷ=1 | privileged) — should be ≥ 0.8 (80% rule)

>**Impossibility Theorem:** Chouldechova (2017) proved that calibration, equal FPR, and equal FNR cannot all be satisfied simultaneously when base rates differ between groups. You must choose which fairness criterion matters most for your use case.

## 04. Bias Detection Techniques

Detecting bias requires going beyond aggregate metrics. Slice-based evaluation is the most important technique: evaluate model performance separately for each demographic group.

### Slice-Based Evaluation

Instead of reporting a single accuracy number, compute metrics **per group**: accuracy, precision, recall, F1, and AUC for each demographic slice. Look for significant disparities between groups. On Vertex AI, use the Model Evaluation feature to automatically compute slice-based metrics.

### Confusion Matrix Per Group

Build a separate confusion matrix for each demographic group. Compare true positive rates (TPR), false positive rates (FPR), true negative rates (TNR), and false negative rates (FNR) across groups. Disparities in FPR are especially concerning in high-stakes applications (criminal justice, credit scoring).

### Disparate Impact Analysis

Calculate the **disparate impact ratio**: the ratio of positive outcome rates between the unprivileged and privileged groups. A ratio below 0.8 (the "80% rule" from US employment law) indicates potential adverse impact and warrants investigation.

```
# Disparate impact calculation
def disparate_impact(y_pred, sensitive_attr, privileged_value, unprivileged_value):
    privileged_mask = sensitive_attr == privileged_value
    unprivileged_mask = sensitive_attr == unprivileged_value

    rate_privileged = y_pred[privileged_mask].mean()
    rate_unprivileged = y_pred[unprivileged_mask].mean()

    return rate_unprivileged / rate_privileged

# DI >= 0.8 passes the 80% rule
# DI < 0.8 indicates potential adverse impact
```

>**Vertex AI Model Evaluation:** Vertex AI Model Evaluation automatically computes fairness metrics when you specify sensitive attributes. Configure feature-based slicing in the evaluation config to get per-group breakdowns without custom code.

## 05. Bias Mitigation Strategies

Mitigation techniques are categorized by **when** they are applied in the ML pipeline: before training (pre-processing), during training (in-processing), or after training (post-processing).

### Pre-Processing Techniques

Modify the training data to reduce bias before the model ever sees it.

| Technique | How It Works | Trade-off |
| --- | --- | --- |
| **Resampling** | Oversample underrepresented groups or undersample overrepresented groups | May reduce total data or create duplicates |
| **Reweighting** | Assign higher sample weights to underrepresented groups during training | May overfit to minority groups if weights are too aggressive |
| **Feature Removal** | Remove sensitive attributes (or proxies) from features | Proxies are hard to identify; may reduce model performance |
| **Data Augmentation** | Generate synthetic samples for underrepresented groups | Synthetic data may not capture real-world complexity |

### In-Processing Techniques

Modify the training algorithm itself to enforce fairness constraints.

| Technique | How It Works | Trade-off |
| --- | --- | --- |
| **Fairness Constraints** | Add a fairness penalty term to the loss function (e.g., demographic parity constraint) | May reduce overall accuracy to improve fairness |
| **Adversarial Debiasing** | Train an adversary to predict the sensitive attribute from model outputs; penalize the model if the adversary succeeds | Complex to implement and tune |
| **Fair Representation Learning** | Learn representations that are informative for the task but uninformative about sensitive attributes | May lose useful information correlated with sensitive attributes |

### Post-Processing Techniques

Adjust model outputs after training to satisfy fairness criteria.

| Technique | How It Works | Trade-off |
| --- | --- | --- |
| **Threshold Adjustment** | Use different classification thresholds for different groups to equalize TPR or FPR | May be legally questionable (different standards for different groups) |
| **Calibration** | Re-calibrate predicted probabilities per group so they align with actual outcomes | Requires sufficient data per group for reliable calibration |
| **Reject Option Classification** | For uncertain predictions near the decision boundary, assign the favorable outcome to the unprivileged group | Only affects borderline cases |

>**Exam Tip:** The exam often presents a scenario and asks which mitigation technique to apply. Pre-processing when you can fix the data, in-processing when you control the algorithm, post-processing when you have a fixed model.

## 06. Google's What-If Tool

The **What-If Tool (WIT)** is an interactive visual tool for exploring ML model behavior without writing code. It is available in TensorBoard, Jupyter/Colab, and Cloud AI Platform Notebooks.

### Key Capabilities

E

#### Explore Individual Predictions

Examine how changing individual feature values affects the model's prediction. Great for understanding edge cases and model sensitivity.

F

#### Fairness Analysis

Automatically compute fairness metrics (demographic parity, equalized odds) across groups. Visualize disparities with interactive charts.

C

#### Counterfactual Analysis

Find the closest data point with a different prediction. Understand what would need to change for a different outcome.

T

#### Threshold Tuning

Interactively adjust classification thresholds and see the impact on fairness metrics and confusion matrices in real time.

```
# Launch What-If Tool in a Jupyter notebook
import witwidget
from witwidget.notebook.visualization import WitConfigBuilder, WitWidget

config = WitConfigBuilder(
    test_examples,          # Your test dataset
    feature_columns
).set_model_name("my-model")
 .set_target_feature("label")
 .set_label_vocab(["rejected", "approved"])

WitWidget(config)
```

>**Exam Note:** The What-If Tool is a visual exploration tool, not an automated bias fix. It helps you discover bias; you still need to apply mitigation techniques separately. Know the difference.

## 07. ML Fairness on Vertex AI

Vertex AI integrates fairness into the ML lifecycle through Model Evaluation and Explainability features that operate directly in the managed platform.

### Model Evaluation with Fairness Metrics

When you run a model evaluation job on Vertex AI, you can specify **slicing specs** to compute metrics per demographic group. The platform automatically generates confusion matrices, AUC-ROC curves, and precision-recall curves for each slice.

```
# Configure fairness slicing in Vertex AI evaluation
from google.cloud.aiplatform import ModelEvaluation

evaluation = model.evaluate(
    test_dataset=test_data,
    slicing_specs=[
        {"feature": "gender"},
        {"feature": "age_group"},
        {"feature": "ethnicity"}
    ]
)
```

### Explainability

Vertex AI Explainable AI provides feature attributions that show which features contributed most to each prediction. This helps identify when sensitive attributes (or their proxies) are driving predictions. Methods include:

-   **Integrated Gradients** — attribution method for neural networks
-   **XRAI** — region-based attribution for images
-   **Sampled Shapley** — model-agnostic attribution method

## 08. Data Cards and Model Cards

Documentation is a critical component of responsible AI. **Data Cards** and **Model Cards** are standardized templates for documenting the characteristics, limitations, and intended uses of datasets and models.

### Model Cards

Introduced by Mitchell et al. (2019) at Google, a Model Card documents:

-   **Model Details** — architecture, version, owner, date
-   **Intended Use** — primary use cases, out-of-scope uses
-   **Factors** — relevant demographic groups and environmental conditions
-   **Metrics** — performance metrics chosen and why, per-group breakdowns
-   **Evaluation Data** — datasets used for evaluation, their characteristics
-   **Ethical Considerations** — known risks, limitations, sensitive use cases
-   **Caveats & Recommendations** — known failure modes and mitigation advice

### Data Cards

Data Cards document dataset characteristics: collection methodology, demographic composition, labeling process, known biases, and recommended uses. They help downstream users understand whether a dataset is appropriate for their use case.

>**Exam Tip:** Model Cards and Data Cards are documentation artifacts, not automated tools. The exam may ask what should be included in a Model Card or when to create one (answer: before any model deployment).

## 09. Regulatory Considerations

AI regulation is evolving rapidly. ML engineers must be aware of the regulatory landscape to build compliant systems.

| Framework | Scope | Key Requirements |
| --- | --- | --- |
| **EU AI Act** | European Union | Risk-based classification (unacceptable, high, limited, minimal risk). High-risk AI systems require conformity assessments, human oversight, transparency, and bias testing. |
| **NIST AI RMF** | United States (voluntary) | Framework for managing AI risks across Govern, Map, Measure, and Manage functions. Emphasizes trustworthy AI characteristics: valid, reliable, safe, fair, accountable, transparent, explainable, and privacy-enhanced. |
| **Canada AIDA** | Canada | Artificial Intelligence and Data Act: requires impact assessments for high-impact AI systems, algorithmic transparency, and bias mitigation. |

>**Practical Impact:** Even if not legally required, following frameworks like NIST AI RMF demonstrates due diligence. For the exam, know that high-risk AI systems require bias testing, documentation (Model Cards), human oversight, and ongoing monitoring.

## 10. Exam Focus

Responsible AI questions on the MLE exam test your ability to identify bias sources, choose appropriate fairness metrics, and select mitigation strategies for specific scenarios.

### Identifying Bias Sources

-   Model performs well overall but poorly for a specific group → Representation bias or evaluation bias
-   Training data reflects historical inequities → Historical bias
-   Different measurement standards across groups → Measurement bias
-   Model used for a purpose it wasn't designed for → Deployment bias

### Choosing Mitigation Strategy

| Scenario | Strategy | Technique |
| --- | --- | --- |
| Imbalanced training data | Pre-processing | Resampling or reweighting |
| Need to enforce equal TPR | In-processing | Fairness constraints in loss function |
| Fixed model, need equal FPR | Post-processing | Group-specific threshold adjustment |
| Proxy features causing bias | Pre-processing | Feature removal + proxy detection |
| Need to understand model decisions | Tooling | What-If Tool + Explainable AI |

### Fairness Metric Selection

| Application | Recommended Metric | Rationale |
| --- | --- | --- |
| Loan approval | Demographic parity + calibration | Equal approval rates and accurate risk scores |
| Disease screening | Equal opportunity (equal TPR) | Every group deserves equal detection of disease |
| Criminal risk assessment | Equalized odds | Both FPR and FNR disparities are harmful |
| Content recommendation | Individual fairness | Similar users should get similar recommendations |
| Insurance pricing | Calibration | Predicted risk must match actual risk per group |

>**High-Frequency Exam Topics:** Google AI Principles, historical vs representation bias, demographic parity vs equalized odds, pre/in/post-processing mitigation, What-If Tool capabilities, Model Cards contents, and the 80% rule for disparate impact — these appear repeatedly.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Responsible AI fairness on Google Cloud means systematically identifying and mitigating **bias** across the ML lifecycle. Bias can enter at data collection (**historical bias**, **representation bias**), during training (**aggregation bias**), and at deployment (**evaluation bias**). Fairness is measured using quantitative metrics: **demographic parity** checks whether positive prediction rates are equal across groups, while **equalized odds** checks whether true positive and false positive rates are equal. Google Cloud provides the **What-If Tool** for interactive fairness exploration, **Vertex AI Model Evaluation** for sliced metrics across subgroups, and **Model Cards** for documenting model limitations and intended use. Mitigation strategies operate at three stages: **pre-processing** (resampling, reweighting training data), **in-processing** (adding fairness constraints to the loss function), and **post-processing** (adjusting decision thresholds per group). The regulatory landscape — including the EU AI Act and the NIST AI RMF — increasingly requires organizations to demonstrate fairness auditing, making this a critical engineering and compliance skill.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| What is the difference between demographic parity and equalized odds? | Can you articulate the mathematical definitions and explain when each metric is appropriate? |
| How would you detect bias in an ML model before deploying it? | Do you have a systematic approach: sliced evaluation, fairness metrics, What-If Tool, subgroup analysis? |
| Describe the three stages of bias mitigation (pre-, in-, post-processing). | Do you understand the full toolkit and the trade-offs between intervention points? |
| What are Google's AI Principles, and how do they influence ML system design? | Can you connect high-level principles to concrete engineering decisions and review processes? |
| A model has equal overall accuracy but very different false positive rates across demographic groups. What do you do? | Can you identify equalized odds violation and propose calibration or threshold adjustment? |

### Model Answers

>**Q1 — Demographic Parity vs. Equalized Odds:** **Demographic parity** requires that the probability of a positive prediction is the same across all groups: P(Ŷ=1|A=a) = P(Ŷ=1|A=b). It ignores the true label entirely — it only looks at prediction rates. **Equalized odds** requires that both the true positive rate and false positive rate are equal across groups, conditioned on the actual label: P(Ŷ=1|Y=y, A=a) = P(Ŷ=1|Y=y, A=b) for y ∈ {0,1}. Demographic parity is appropriate when you want equal selection rates (e.g., hiring). Equalized odds is appropriate when you want equal error rates (e.g., medical diagnosis, where you need both groups to have the same chance of correct detection and false alarms). These metrics can conflict — satisfying one may violate the other.
>**Q2 — Detecting Bias Before Deployment:** A systematic approach: (1) **Data audit** — check class balance and representation across demographic groups in training data. (2) **Sliced evaluation** — compute accuracy, precision, recall, and F1 for each subgroup, not just overall. Vertex AI Model Evaluation supports this natively. (3) **Fairness metrics** — compute demographic parity difference, equalized odds difference, and disparate impact ratio (the 80% rule: if the selection rate for any group is below 80% of the highest group, flag it). (4) **What-If Tool** — interactively explore counterfactuals, adjust thresholds per group, and visualize fairness-accuracy trade-offs. (5) **Intersectional analysis** — check combinations of sensitive attributes (e.g., race + gender), not just individual dimensions.
>**Q3 — Three Stages of Mitigation:** **Pre-processing** modifies the training data: resampling underrepresented groups, reweighting examples, or removing features that serve as proxies for sensitive attributes. **In-processing** modifies the learning algorithm: adding fairness constraints or regularization terms to the loss function so the model directly optimizes for both accuracy and fairness. **Post-processing** modifies the model's outputs: adjusting decision thresholds per group to equalize error rates, or calibrating probability outputs. Pre-processing is simplest but may lose information. In-processing is most principled but requires algorithm changes. Post-processing is easiest to apply to existing models but treats symptoms rather than root causes.
>**Q4 — Google AI Principles in Practice:** Google's seven AI Principles state that AI should be socially beneficial, avoid unfair bias, be safe, be accountable, incorporate privacy, uphold scientific excellence, and be available for uses that accord with these principles. In engineering terms, this translates to: (1) conducting fairness and bias reviews before model launch, (2) building Model Cards that document intended use, limitations, and evaluation across demographic groups, (3) implementing safety filters and content classifiers, (4) maintaining audit logs for model decisions, (5) applying differential privacy and data minimization, and (6) publishing evaluation methodology. These are not aspirational — Google Cloud products embed them: Vertex AI Model Evaluation provides fairness slices, safety settings are built into Gemini, and Model Cards are a first-class resource.
>**Q5 — Unequal False Positive Rates:** This is an **equalized odds violation**. Equal overall accuracy can mask disparate error distributions. The fix depends on context: (1) **Threshold adjustment** — use different classification thresholds per group to equalize false positive rates (post-processing). The What-If Tool lets you explore this interactively. (2) **Data investigation** — the high-FPR group may have noisier features or less training data; improving data quality or collecting more representative samples can help. (3) **Cost-sensitive training** — assign different misclassification costs per group during training (in-processing). (4) **Report transparently** — document per-group metrics in the Model Card and set monitoring alerts for fairness drift in production.

### System Design Scenario

>**Design Challenge:** **Scenario:** Your team is building a loan approval model for a bank. Regulators require you to demonstrate that the model does not discriminate based on race, gender, or age. Design the fairness evaluation and mitigation framework.  
>   
> **A strong answer covers:** (1) Protected attributes — identify race, gender, age, and proxy features (zip code, name) that must be audited. (2) Metrics — compute disparate impact ratio (80% rule), equalized odds, and calibration per group. (3) Sliced evaluation — use Vertex AI to compute approval rates, FPR, and FNR per demographic group and intersectional combinations. (4) What-If Tool — explore counterfactuals ("if this applicant's gender changed, would the decision change?"). (5) Mitigation — pre-processing (reweight underrepresented groups), in-processing (fairness-constrained objective), post-processing (group-specific thresholds). (6) Model Card — document intended use, per-group performance, limitations, and fairness metrics. (7) Monitoring — continuous fairness metric tracking in production with alerts when disparate impact exceeds thresholds. (8) Regulatory documentation — maintain audit trail for EU AI Act / ECOA compliance.

### Common Mistakes

-   **Relying on overall accuracy as proof of fairness** — A model with 95% overall accuracy can have 99% accuracy for one group and 80% for another. Always compute sliced metrics per demographic subgroup. Overall metrics hide disparities.
-   **Removing sensitive attributes and assuming fairness** — Simply dropping race or gender columns does not eliminate bias. Other features (zip code, school name, purchasing patterns) can serve as proxies. Fairness requires measuring outcomes across groups regardless of whether sensitive attributes are used as features.
-   **Treating fairness as a one-time check** — Fairness can degrade over time due to data drift, population changes, or feedback loops. Production models need continuous fairness monitoring with automated alerts, not just a pre-launch review.

Previous

[← 17 · Generative AI Applications](17-generative-ai-apps.html)

Next

[19 · Responsible AI — Interpretability →](19-responsible-ai-interpretability.html)