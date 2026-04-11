---
title: "Responsible AI — Interpretability & Transparency"
slug: "responsible-ai-interpretability"
description: "A model that cannot be explained cannot be trusted. This module covers the full spectrum of interpretability
    techniques — from intrinsic methods like linear coefficients and decision-tree splits to post-hoc
    explainers like SHAP, LIME, and Partial Dependence Plots. You will learn how to use V"
section: "gcp-mle"
order: 19
badges:
  - "SHAP & LIME"
  - "Vertex AI Explainability"
  - "What-If Tool"
  - "Model Cards"
  - "GenAI Explainability"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/19-responsible-ai-interpretability.ipynb"
---

## 01. Why Interpretability Matters

### Trust and Debugging

**Trust** is the foundational reason for interpretability. Stakeholders — executives, regulators, end users — will not deploy a model they cannot understand. A credit-scoring model that rejects a loan application must be able to explain *why*. A medical diagnosis model must point to the features (symptoms, lab values) that drove its prediction.

**Debugging** is the engineering reason. When a model performs poorly on a slice of data, interpretability tools reveal whether the model learned a spurious correlation (e.g., predicting pneumonia risk from the hospital ID in the X-ray metadata) or a legitimate signal. Without interpretability, debugging is reduced to trial-and-error retraining.

### Compliance and Scientific Understanding

**Regulatory compliance** increasingly mandates explainability. The EU AI Act classifies high-risk AI systems and requires that their decisions be "sufficiently transparent to enable users to interpret the system's output." GDPR Article 22 gives individuals the right to "meaningful information about the logic involved" in automated decisions. In the US, the Equal Credit Opportunity Act (ECOA) requires lenders to provide specific reasons for adverse credit decisions.

**Scientific understanding** uses interpretability to generate hypotheses. A model trained on genomic data might reveal that certain gene interactions are predictive of disease — insights that drive new research directions. Interpretability transforms ML from a black box into a discovery tool.

>**Key Insight:** Interpretability is not a single technique — it is a spectrum. The right method depends on the audience (data scientist vs regulator), the model type, and whether you need global explanations (how the model works overall) or local explanations (why this specific prediction was made).

## 02. Intrinsic vs Post-Hoc Interpretability

**Intrinsic interpretability** means the model is inherently understandable by design. Linear regression, logistic regression, decision trees, and rule-based systems fall into this category. You can read the coefficients or follow the tree splits to understand exactly how a prediction is made. The trade-off is that intrinsically interpretable models often have lower capacity for complex patterns.

**Post-hoc interpretability** applies explanation techniques *after* a model is trained. This is necessary for complex models (deep neural networks, gradient-boosted ensembles) where the internal structure is too complex for direct human understanding. Post-hoc methods can be model-specific (leveraging internal model structure) or model-agnostic (treating the model as a black box).

| Aspect | Intrinsic | Post-Hoc |
| --- | --- | --- |
| When applied | Built into model design | After model training |
| Model types | Linear, trees, rules | Any model |
| Fidelity | Exact (is the model) | Approximate |
| Complexity trade-off | Limited model capacity | No constraint on model |
| Examples | Coefficients, tree splits | SHAP, LIME, saliency maps |

>**Exam Tip:** When the exam asks about "most interpretable model," the answer is typically linear/logistic regression or decision trees. When it asks about "explaining a complex model," the answer is a post-hoc method like SHAP or Vertex AI Explainability.

## 03. Model-Specific Interpretability Methods

### Linear Models: Coefficients and Feature Importance

In linear regression, each coefficient directly tells you: "For a one-unit increase in feature X, the predicted output changes by *coefficient* units, holding all else constant." In logistic regression, coefficients represent log-odds. **Standardizing features** before training makes coefficients directly comparable, turning them into a feature importance ranking.

**Regularization effects**: L1 (Lasso) regularization drives unimportant coefficients to exactly zero, performing automatic feature selection. L2 (Ridge) shrinks coefficients but keeps all features. Elastic Net combines both. The resulting coefficient magnitudes serve as a built-in feature importance measure.

```
# Linear model interpretability
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)
model = LogisticRegression(penalty='l1', solver='liblinear')
model.fit(X_scaled, y_train)

# Coefficients = feature importance (standardized)
for name, coef in zip(feature_names, model.coef_[0]):
    print(f"{name}: {coef:.4f}")
```

### Decision Trees: Feature Importance and Visualization

Decision trees provide two forms of intrinsic interpretability. First, **tree visualization** lets you trace the exact path from root to leaf for any prediction, seeing every split condition. Second, **feature importance** is computed as the total reduction in impurity (Gini or entropy) contributed by each feature across all splits, normalized to sum to 1.

For ensemble methods (Random Forest, Gradient Boosting), feature importance is averaged across all trees. However, these importances can be **biased toward high-cardinality features** and features with many possible split points. Permutation importance (Section 4) addresses this bias.

```
# Tree-based feature importance
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.tree import export_text

model = GradientBoostingClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Impurity-based importance
importances = model.feature_importances_
for name, imp in sorted(zip(feature_names, importances),
                           key=lambda x: x[1], reverse=True):
    print(f"{name}: {imp:.4f}")
```

### Neural Networks: Attention and Gradient-Based Methods

Neural networks are not intrinsically interpretable, but their internal structure provides model-specific post-hoc methods:

**Attention weights** in Transformer-based models show which input tokens the model "attends to" when generating each output token. While attention weights are not perfect explanations (they show correlation, not causation), they provide useful debugging signals. Multi-head attention can be visualized layer by layer.

**Gradient-based methods** compute the gradient of the output with respect to each input feature. **Vanilla gradients** show which features, if slightly changed, would most affect the prediction. **Integrated Gradients** (used by Vertex AI) accumulate gradients along a path from a baseline input to the actual input, satisfying key axioms (sensitivity and implementation invariance). **SmoothGrad** averages gradients over noisy copies of the input to reduce visual noise.

G

#### Vanilla Gradients

Compute the partial derivative of output w.r.t. each input. Fast but noisy. Shows local sensitivity only.

IG

#### Integrated Gradients

Accumulate gradients from a baseline (e.g., black image) to the input. Satisfies completeness axiom: attributions sum to the prediction difference.

SG

#### SmoothGrad

Average gradients over N noisy copies of the input. Reduces visual noise and produces cleaner saliency maps.

A

#### Attention Visualization

Visualize attention weight matrices across heads and layers. Useful for NLP and vision transformers to see which tokens/patches are attended to.

## 04. Model-Agnostic Methods

Model-agnostic methods treat the model as a black box — they only need the ability to query the model with inputs and observe outputs. This makes them applicable to *any* model type.

### SHAP (SHapley Additive exPlanations)

SHAP is rooted in cooperative game theory. It assigns each feature a **Shapley value** representing its marginal contribution to the prediction, averaged over all possible feature coalitions. SHAP is the only method that satisfies three desirable properties simultaneously: **local accuracy** (attributions sum to the prediction), **missingness** (absent features get zero attribution), and **consistency** (if a feature's contribution increases, its attribution does not decrease).

phi\_i = SUM over S subset of N\\{i}: \[ |S|!(|N|-|S|-1)! / |N|! \] \* \[ f(S union {i}) - f(S) \]

**Kernel SHAP** approximates Shapley values using a weighted linear regression. It works with any model but can be slow for high-dimensional inputs. **Tree SHAP** is an exact, polynomial-time algorithm for tree-based models (XGBoost, LightGBM, Random Forest) — orders of magnitude faster than Kernel SHAP.

SHAP provides multiple visualization types: **summary plots** (global feature importance with distribution), **force plots** (local explanation for a single prediction), **dependence plots** (feature value vs SHAP value, colored by interaction), and **waterfall plots** (step-by-step attribution breakdown).

### LIME (Local Interpretable Model-agnostic Explanations)

LIME explains individual predictions by fitting a **simple interpretable model** (typically linear regression) in the local neighborhood of the instance. The process: (1) generate perturbed samples around the instance, (2) get the black-box model's predictions for each, (3) weight samples by proximity to the original, (4) fit a linear model on the weighted samples. The linear model's coefficients become the local explanation.

**Strengths**: intuitive, fast, works with any model, produces human-readable explanations. **Weaknesses**: explanations can be unstable (different runs may yield different results), the neighborhood size is a hyperparameter that affects quality, and it does not guarantee consistency across instances.

### Partial Dependence Plots (PDP)

A PDP shows the **marginal effect** of one or two features on the model's prediction, averaged over all other features. For feature X\_i, the partial dependence is computed by varying X\_i across its range while keeping all other features at their observed values, then averaging predictions.

PDPs are excellent for revealing non-linear relationships and interactions (with 2D PDPs). However, they assume feature independence — if features are correlated, PDPs may show unrealistic feature combinations. **Individual Conditional Expectation (ICE) plots** address this by showing one line per instance instead of the average.

### Permutation Feature Importance

Permutation importance measures how much the model's performance **degrades** when a single feature's values are randomly shuffled. If shuffling feature X causes a large drop in accuracy, X is important. Unlike impurity-based importance, permutation importance is **unbiased** with respect to feature cardinality and works on the test set (not training set).

The algorithm: (1) compute baseline score on test set, (2) for each feature, shuffle its column, (3) recompute score, (4) importance = baseline score minus shuffled score. Repeat multiple times and average for stability. This method is available in `sklearn.inspection.permutation_importance`.

>**Watch Out:** Permutation importance can underestimate the importance of correlated features. If two features are highly correlated, shuffling one still leaves the other intact, so the model can compensate. Use SHAP or drop-column importance for correlated feature sets.

## 05. Vertex AI Explainability

Vertex AI provides built-in explainability through **feature attributions**. When you deploy a model to a Vertex AI endpoint, you can configure an `ExplanationSpec` that automatically returns feature attributions with every prediction request.

### Supported Attribution Methods

IG

#### Integrated Gradients

Default for TensorFlow models. Requires a baseline input. Best for neural networks where gradients are available. Supports image, tabular, and text data.

XR

#### XRAI

Region-based attribution for images. Segments the image and assigns importance to regions rather than individual pixels. More human-interpretable for vision models.

SA

#### Sampled Shapley

Approximates Shapley values by sampling feature subsets. Works with any model (including AutoML, custom containers). No gradient access required.

### Configuration

You configure explainability when uploading a model or creating an endpoint. The key components are: (1) **ExplanationParameters** — the method and step count, (2) **ExplanationMetadata** — which inputs and outputs to explain, and (3) optional **baselines** for Integrated Gradients.

```
# Vertex AI Explainability configuration
from google.cloud import aiplatform

# Define explanation parameters
explanation_params = aiplatform.explain.ExplanationParameters(
    sampled_shapley_attribution=
        aiplatform.explain.SampledShapleyAttribution(path_count=25)
)

# Define explanation metadata
explanation_metadata = aiplatform.explain.ExplanationMetadata(
    inputs={
        "features": aiplatform.explain.ExplanationMetadata.InputMetadata(
            input_tensor_name="input_layer",
            encoding="BAG_OF_FEATURES",
            modality="numeric",
        )
    },
    outputs={
        "prediction": aiplatform.explain.ExplanationMetadata.OutputMetadata(
            output_tensor_name="output_layer"
        )
    },
)

# Upload model with explainability
model = aiplatform.Model.upload(
    display_name="my-model",
    artifact_uri="gs://bucket/model/",
    serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/tf2-cpu:latest",
    explanation_parameters=explanation_params,
    explanation_metadata=explanation_metadata,
)
```

### Example-Based Explanations

Beyond feature attributions, Vertex AI supports **example-based explanations** that return the most similar training examples to a given prediction. This is useful for debugging ("which training examples led to this prediction?") and for building trust ("here are real cases similar to yours"). Example-based explanations use approximate nearest-neighbor search on the model's learned embedding space.

## 06. Vertex AI Model Evaluation

Vertex AI Model Evaluation provides a unified interface for assessing model quality alongside interpretability. When you run an evaluation job, Vertex AI computes standard metrics (AUC, F1, precision, recall for classification; RMSE, MAE for regression) and can include feature attributions.

**Slice-based evaluation** lets you assess model performance on specific data subgroups. Combined with feature attributions, you can detect if the model relies on different features for different slices — a potential fairness concern. For example, if the model uses "zip code" as a top feature for one demographic group but not another, this warrants investigation.

**Model comparison** lets you compare multiple model versions side by side. Vertex AI tracks evaluation metrics across model versions in the Model Registry, making it easy to see if a new model version changed which features are most important.

>**Best Practice:** Always run model evaluation with feature attributions on validation data before deploying to production. Compare the top features against domain expert expectations. Unexpected top features often indicate data leakage or spurious correlations.

## 07. What-If Tool (WIT)

The **What-If Tool** is an interactive visualization tool for probing ML models without writing code. Originally developed at Google, it integrates with TensorBoard, Jupyter notebooks, and Cloud AI Platform.

### Counterfactual Analysis

WIT's counterfactual feature finds the **most similar example with a different prediction**. For a loan applicant who was rejected, WIT can find the most similar applicant who was approved and highlight the differences. This directly answers the question: "What would need to change for this prediction to flip?" — critical for actionable explanations.

### Feature Exploration

WIT provides interactive scatter plots where you can color, bin, and filter data points by any feature or by model prediction. You can manually edit feature values for any data point and see how the prediction changes in real time. This supports "what-if" scenario analysis: "If this patient's blood pressure were 120 instead of 140, would the diagnosis change?"

### Fairness Exploration

WIT includes built-in fairness metrics. You can define sensitive attributes (race, gender, age group) and compare model performance across groups. Metrics include demographic parity, equal opportunity, and equalized odds. WIT visualizes threshold curves showing the trade-off between fairness metrics and overall accuracy at different classification thresholds.

>**Integration Note:** The What-If Tool works with models served via TensorFlow Serving, Vertex AI Prediction, or any model exposed as a Python function. For Vertex AI models, point WIT at the prediction endpoint URL.

## 08. Transparency Practices

### Model Cards

**Model Cards** are standardized documentation for ML models, introduced by Google in 2019. A Model Card describes: (1) **Model details** — architecture, training data, intended use; (2) **Performance metrics** — overall and broken down by demographic group; (3) **Limitations** — known failure modes, out-of-scope uses; (4) **Ethical considerations** — potential harms, mitigation strategies.

Vertex AI Model Registry supports attaching Model Cards to registered models. The Model Card Toolkit (MCT) automates generation from evaluation data.

### Data Documentation

**Datasheets for Datasets** (Gebru et al., 2018) document the motivation, composition, collection process, preprocessing, distribution, and maintenance of training datasets. Key questions include: "Who collected the data?", "What population does it represent?", "What are the known biases?", and "How should it not be used?"

### Audit Trails

A complete audit trail connects every deployed model to its training data, code version, hyperparameters, evaluation metrics, and approval decisions. On GCP, this is achieved through: **Vertex AI Experiments** (tracking training runs), **Vertex AI Model Registry** (versioning models), **ML Metadata** (artifact lineage), and **Cloud Audit Logs** (who did what and when).

>**Exam Tip:** When the exam asks about "documenting a model for stakeholders," the answer is Model Cards. When it asks about "documenting training data," the answer is Datasheets for Datasets. Both are part of Google's Responsible AI practices.

## 09. Explaining Generative AI

Generative AI models present unique interpretability challenges. Unlike classification models that output a single label, LLMs generate sequences of tokens where each token depends on all previous tokens. Explaining "why the model generated this response" is fundamentally harder.

### Attention Visualization

Attention patterns in Transformer models can be visualized as heatmaps showing which input tokens each output token attended to most strongly. Tools like **BertViz** render multi-head attention patterns across layers. While attention is not a perfect proxy for explanation, it reveals useful patterns: does the model attend to relevant keywords? Does it copy patterns from the prompt?

### Token Attribution

**Token-level attribution** extends gradient-based methods to text. For each generated token, you can compute which input tokens had the highest influence via Integrated Gradients or attention rollout. This is useful for detecting whether a model is grounding its response in the provided context (for RAG systems) or hallucinating from its parametric memory.

### Prompt Sensitivity Analysis

**Prompt sensitivity analysis** systematically varies parts of the prompt and observes how the output changes. This reveals: (1) which instructions the model follows most reliably, (2) whether the output is sensitive to irrelevant prompt variations (fragility), (3) whether few-shot examples actually influence the output. Tools like prompt perturbation frameworks automate this process.

>**Important Caveat:** No current technique fully explains why an LLM generates a specific response. Attention and gradient methods provide *signals*, not *explanations*. For production GenAI systems, combine interpretability signals with evaluation metrics (faithfulness, groundedness) and human review.

## 10. Exam Focus

Section 6 of the GCP MLE exam tests your ability to choose the right interpretability tool and configure Vertex AI Explainability. Here are the key patterns:

-   **Choosing the interpretability method**: SHAP for theoretically grounded global + local explanations; LIME for quick local explanations; PDP for understanding feature effects; permutation importance for unbiased feature ranking; Integrated Gradients for neural networks on Vertex AI.
-   **Vertex AI Explainability setup**: Know the three methods (Integrated Gradients, XRAI, Sampled Shapley), when to use each, how to configure ExplanationSpec, and that Sampled Shapley works with any model type.
-   **Model Cards**: Know what goes in a Model Card (model details, metrics by group, limitations, ethical considerations) and that Vertex AI supports attaching them to the Model Registry.
-   **What-If Tool**: Know it provides counterfactual analysis, interactive feature exploration, and fairness metric visualization without writing code.
-   **Intrinsic vs post-hoc**: Linear models and decision trees are intrinsically interpretable. Complex models require post-hoc methods. The exam may ask you to recommend a model type when interpretability is a hard requirement.
-   **Feature attribution pitfalls**: Permutation importance is biased for correlated features. Impurity-based importance favors high-cardinality features. SHAP is the most theoretically sound but slowest.
-   **Audit trail**: Vertex AI Experiments + Model Registry + ML Metadata + Cloud Audit Logs form the complete audit chain from data to deployment.

>**Decision Framework:** Need global importance? Use SHAP summary plot or permutation importance. Need local explanation? Use SHAP force plot or LIME. Need visual explanation for images? Use XRAI on Vertex AI. Need no-code exploration? Use What-If Tool. Need documentation? Use Model Cards.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Model interpretability is the ability to explain **why** an ML model made a specific prediction. This matters for debugging, regulatory compliance, stakeholder trust, and identifying bias. Techniques fall into two categories: **model-agnostic** methods that work with any model, and **model-specific** methods built into particular architectures. **SHAP** (SHapley Additive exPlanations) uses game-theoretic Shapley values to assign each feature an additive contribution to the prediction — it is theoretically grounded but computationally expensive. **LIME** (Local Interpretable Model-agnostic Explanations) fits a simple interpretable model (linear regression) around a single prediction's neighborhood — fast but less consistent across runs. On Google Cloud, **Vertex Explainable AI** provides built-in feature attributions using sampled Shapley, integrated gradients (for neural networks), and **XRAI** (for image models that highlights salient regions). The **What-If Tool** adds interactive counterfactual exploration. For generative AI, interpretability shifts to attention visualization, chain-of-thought prompting, and grounding with citations. The key engineering skill is choosing the right explanation method for your model type, audience, and regulatory requirements.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| Explain the difference between SHAP and LIME. When would you choose one over the other? | Do you understand Shapley values vs. local surrogate models, and the consistency/speed trade-offs? |
| What is the difference between global and local interpretability? | Can you explain feature importance for the model overall vs. explaining a single prediction? |
| How does Vertex Explainable AI work? What methods does it support? | Do you know sampled Shapley, integrated gradients, and XRAI, and when each applies? |
| How would you explain a deep learning model's predictions to a non-technical stakeholder? | Can you translate technical explanations into business-meaningful narratives? |
| What are the limitations of feature attribution methods? | Do you understand that attributions can be unstable, computationally expensive, and may not capture feature interactions? |

### Model Answers

>**Q1 — SHAP vs. LIME:** **SHAP** is based on Shapley values from cooperative game theory. It computes the average marginal contribution of each feature across all possible feature coalitions. This gives it strong theoretical properties: **consistency** (if a feature's contribution increases, its SHAP value never decreases), **additivity** (SHAP values sum to the difference between the prediction and the baseline), and **symmetry**. However, exact SHAP is exponential in feature count, so practical implementations use approximations (Kernel SHAP, Tree SHAP). **LIME** perturbs the input, generates predictions for perturbed samples, then fits a weighted linear model locally. It is fast and intuitive but can be **unstable** — different runs may produce different explanations depending on the perturbation sampling. Choose SHAP when you need mathematically consistent, auditable explanations (regulatory contexts). Choose LIME when you need quick, approximate explanations for debugging during development.
>**Q2 — Global vs. Local Interpretability:** **Global interpretability** explains the model's overall behavior: which features are most important across all predictions, what patterns the model has learned, and how features interact in aggregate. Methods include SHAP summary plots, permutation importance, and partial dependence plots. **Local interpretability** explains a single prediction: why this specific customer was denied a loan, why this specific image was classified as malignant. Methods include SHAP force plots, LIME explanations, and counterfactual examples ("if income were $10K higher, the prediction would flip"). Both are necessary: global interpretability validates that the model has learned reasonable patterns, while local interpretability supports individual decision explanations required by regulations like the EU AI Act's right to explanation.
>**Q3 — Vertex Explainable AI:** Vertex Explainable AI provides feature attributions automatically when you deploy a model to a Vertex AI endpoint. Three methods are supported: (1) **Sampled Shapley** — approximates Shapley values by sampling feature permutations. Works with any model (tabular, text, image). (2) **Integrated Gradients** — computes attributions by integrating gradients along the path from a baseline input to the actual input. Specific to differentiable models (neural networks). More efficient than Shapley for large feature spaces. (3) **XRAI** — designed for images. It segments the image into regions and ranks them by attribution, producing human-interpretable saliency maps that highlight which parts of the image drove the prediction. You configure the explanation method in the model's metadata when deploying, and attributions are returned alongside predictions in the API response.
>**Q4 — Explaining DL to Non-Technical Stakeholders:** The key is translating feature attributions into domain language. Instead of saying "feature X has a SHAP value of 0.34," say "the model's decision was primarily driven by the patient's elevated blood pressure and age — these two factors accounted for 70% of the risk score." For images, show the XRAI saliency map: "the model focused on this region of the X-ray, which corresponds to where radiologists typically look for this condition." Use **counterfactual explanations** for actionable insights: "if the customer's credit utilization were below 30%, the model would have approved the loan." Always pair explanations with confidence levels and known limitations. The What-If Tool is excellent for live demos with stakeholders because it allows interactive "what-if" exploration without requiring technical expertise.
>**Q5 — Limitations of Feature Attributions:** (1) **Instability** — LIME explanations can vary across runs due to random perturbation sampling. Even SHAP approximations have variance. (2) **Feature interactions** — additive attribution methods struggle to capture synergistic effects (two features that are only important together). SHAP interaction values exist but are expensive. (3) **Baseline dependence** — integrated gradients and SHAP require a baseline input; different baselines produce different attributions. (4) **Computational cost** — exact Shapley values are exponential; approximations trade accuracy for speed. (5) **Correlation confusion** — when features are highly correlated, attributions may be split arbitrarily between them. (6) **Not causal** — attributions show statistical associations, not causal relationships. A feature with high attribution is not necessarily a lever you can pull to change outcomes.

### System Design Scenario

>**Design Challenge:** **Scenario:** A healthcare company deploys a deep learning model for cancer screening on medical images. Regulators require that every positive prediction comes with an explanation. Radiologists need to understand what the model sees. Design the interpretability system.  
>   
> **A strong answer covers:** (1) Explanation method — XRAI for image region attribution, generating saliency maps that highlight suspicious areas. Deploy with Vertex Explainable AI configured for XRAI. (2) Visualization — overlay saliency maps on the original image with a heat map, highlighting the top-3 contributing regions. (3) Confidence calibration — pair explanations with calibrated probability scores so radiologists understand the model's certainty. (4) Counterfactuals — show similar images that were classified differently to give context ("this similar image was classified as benign because region X was absent"). (5) Radiologist workflow — explanations appear alongside the image in the diagnostic tool, not in a separate system. (6) Audit logging — store every prediction with its explanation for regulatory review. (7) Validation — have radiologists evaluate whether model-highlighted regions align with clinically relevant features. (8) Failure modes — document known cases where explanations are misleading (e.g., the model attends to image artifacts rather than tissue).

### Common Mistakes

-   **Confusing interpretability with accuracy** — A model can have high accuracy but be uninterpretable (deep neural networks), or be highly interpretable but less accurate (linear models). Interpretability is an additional requirement, not a substitute for performance. Choose the right balance based on the use case's risk level and regulatory requirements.
-   **Using LIME for regulatory explanations** — LIME's instability (different explanations for the same input across runs) makes it unsuitable for auditable, legally binding explanations. SHAP-based methods are preferred for compliance contexts because of their consistency guarantees and additive faithfulness property.
-   **Treating feature attributions as causal** — Attribution methods reveal correlational patterns, not causal mechanisms. Saying "the model denied the loan because of zip code" is technically a statement about statistical association, not causation. This distinction matters for both regulatory reporting and actionable recommendations to end users.

Previous

[← 18 · Responsible AI — Fairness](18-responsible-ai-fairness.html)

Next

[20 · Responsible AI — Privacy & Safety →](20-responsible-ai-privacy.html)