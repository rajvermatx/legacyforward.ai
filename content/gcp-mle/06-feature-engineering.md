---
title: "Turning Raw Data into Powerful Features"
slug: "feature-engineering"
description: "Feature engineering is where domain knowledge meets data science. This module covers the complete
    feature engineering toolkit on GCP — from Vertex AI Feature Store for production serving, through
    tf.Transform for scalable preprocessing, to feature crosses, encodings, and selection techniques"
section: "gcp-mle"
order: 6
badges:
  - "Feature Store"
  - "Feature Transforms"
  - "Feature Crosses"
  - "tf.Transform"
  - "Feature Selection"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/06-feature-engineering.ipynb"
---

## 01. Vertex AI Feature Store

![Diagram 1](/diagrams/gcp-mle/feature-engineering-1.svg)

Figure 1 — Vertex AI Feature Store: data from multiple sources is ingested into entity-based feature groups, then served online (low-latency) or offline (batch) to training and prediction workloads.

### Architecture

**Vertex AI Feature Store** is a centralized, managed repository for storing, organizing, and serving ML features. It solves several critical problems: feature reuse across teams, consistent feature values between training and serving, and point-in-time correctness for training data.

The architecture is organized around these concepts:

**Featurestore**: The top-level container (one per project/use-case). Contains all entity types and features.

**Entity Type**: A logical grouping of features about a specific entity (e.g., "user," "product," "transaction"). Each entity type has a unique ID column that identifies individual entities.

**Feature**: An individual measurable property within an entity type (e.g., "age," "total\_purchases," "last\_login\_days\_ago"). Features have a data type (INT64, FLOAT, STRING, BOOL, array types) and are versioned with timestamps.

**Online serving** provides low-latency feature lookups for real-time prediction. The Feature Store maintains an optimized online storage (backed by Bigtable) that returns feature values for a given entity ID in milliseconds. This is used when a prediction endpoint needs to fetch the latest features for a user at inference time.

**Offline serving** provides batch access to historical feature values for training. It performs **point-in-time joins**, ensuring that training examples use only features that were available at the time of each training label. This prevents data leakage from the future.

### Operations: Create, Ingest, Serve, Share

The Feature Store workflow follows four steps:

**1\. Create**: Define the featurestore, entity types, and features using the Vertex AI SDK or REST API. Specify feature names, types, and descriptions.

```
# Create Feature Store resources (requires GCP)
from google.cloud import aiplatform

aiplatform.init(project="my-project", location="us-central1")

# Create a featurestore
fs = aiplatform.Featurestore.create(
    featurestore_id="ecommerce_features",
    online_store_fixed_node_count=1
)

# Create an entity type
user_entity = fs.create_entity_type(
    entity_type_id="users",
    description="User-level features for churn prediction"
)

# Add features to the entity type
user_entity.batch_create_features(
    feature_configs={
        "age": {"value_type": "INT64"},
        "total_purchases": {"value_type": "DOUBLE"},
        "account_age_days": {"value_type": "INT64"},
        "region": {"value_type": "STRING"},
        "is_premium": {"value_type": "BOOL"},
    }
)
```

**2\. Ingest**: Import feature values from BigQuery, GCS (CSV/Avro), or streaming sources. Ingestion is timestamp-aware — each feature value has an associated timestamp for point-in-time lookups.

**3\. Serve**: Read features online (by entity ID for real-time) or offline (batch export with point-in-time joins for training datasets).

**4\. Share**: Features registered in the Feature Store are discoverable by other teams via the Feature Registry. This promotes reuse and consistency across the organization.

>**Feature Store vs Inline Features:** Use the Feature Store when features are shared across multiple models or teams, when you need point-in-time correctness, or when low-latency online serving is required. Use inline features (computed in the query/pipeline) for model-specific features that are only used once or are trivially derived.

## 02. Raw Data to Features

### Numerical Features

Numerical features often need transformation before they are useful for ML models. The key techniques:

**Scaling (Min-Max)**: Maps values to \[0, 1\] range. Formula: `(x - min) / (max - min)`. Use when you need bounded values and the distribution is roughly uniform. Sensitive to outliers.

**Standardization (Z-score)**: Centers at 0 with unit variance. Formula: `(x - mean) / std`. Use for algorithms that assume Gaussian distributions (linear regression, SVMs). Less sensitive to outliers than min-max.

**Log Transform**: Compresses right-skewed distributions. Apply `log(x + 1)` for features like revenue, counts, or prices that span orders of magnitude.

**Bucketizing / Binning**: Converts continuous values into categorical bins. Use when the relationship between the feature and target is non-linear, or when you want to reduce noise. In BigQuery: `ML.BUCKETIZE(age, [18, 25, 35, 50, 65])`.

Min-Max: x' = (x - min) / (max - min)     Z-score: x' = (x - mean) / std

### Categorical Features

**One-Hot Encoding**: Creates a binary column for each category. Works well for low-cardinality features (<50 categories). In BQML, this is automatic for STRING columns. Drawback: high-cardinality features create very sparse, wide vectors.

**Label Encoding**: Maps categories to integers (A=0, B=1, C=2). Simple but introduces an artificial ordinal relationship. Only use for tree-based models that can handle arbitrary splits.

**Feature Hashing (Hashing Trick)**: Hashes category strings into a fixed number of buckets. Handles high-cardinality features without storing a vocabulary. Collisions are possible but acceptable for large bucket counts. In BQML: `ML.HASH_BUCKETS(column, num_buckets)`.

**Embeddings**: Learn dense vector representations for categories. Best for very high cardinality (user IDs, product IDs). Requires a neural network to learn the embedding during training. Captures semantic similarity between categories.

### Text and Temporal Features

**Text features**: For short text (product names, categories), use TF-IDF or bag-of-words. For longer text (reviews, descriptions), use pre-trained embeddings (BERT, Universal Sentence Encoder). In the GCP context, `tf.Transform` provides `tft.compute_and_apply_vocabulary()` and `tft.tfidf()` for scalable text featurization.

**Temporal features**: Extract components (day of week, hour, month, quarter). Create **cyclical encodings** to capture periodicity: encode hour as `sin(2*pi*hour/24)` and `cos(2*pi*hour/24)`. This ensures hour 23 is close to hour 0. Create **lag features** (value at t-1, t-7) for time-series. Create **rolling aggregates** (7-day average, 30-day max).

>**Cyclical Encoding:** For periodic features (hour of day, day of week, month of year), cyclical encoding with sine/cosine preserves the circular nature. Without it, a model sees hour 23 and hour 0 as far apart; with cyclical encoding, they are adjacent. Formula: `sin_hour = sin(2 * pi * hour / 24)`, `cos_hour = cos(2 * pi * hour / 24)`.

## 03. Feature Engineering Best Practices

### Avoiding Data Leakage

**Data leakage** occurs when information from the target variable or from the future leaks into the training features. This causes artificially high training performance that does not generalize to production. Common sources:

**Target leakage**: A feature that is directly derived from or highly correlated with the label. Example: using "cancellation\_date" as a feature to predict churn — the cancellation date IS the churn event.

**Temporal leakage**: Using future data to predict the past. Example: using a user's total lifetime purchases to predict whether they will make their first purchase. Always ensure features only use data available at prediction time.

**Pre-processing leakage**: Computing statistics (mean, std) on the full dataset including the test set, then using those statistics for scaling. Always fit preprocessing on the training set only, then transform both train and test.

>**Critical Rule:** Every feature must answer: "Would this information be available at prediction time in production?" If the answer is no, it is leakage. This is the single most important question in feature engineering.

### Training-Serving Skew

**Training-serving skew** occurs when the feature engineering code used during training differs from what runs during prediction. This is one of the most insidious bugs in ML systems because the model will silently produce degraded results.

Common causes: different programming languages (Python training vs Java serving), different library versions, manual copy-paste of transformation logic, or different data access patterns (offline batch vs online lookup).

**Solutions on GCP**:

-   **tf.Transform**: Define preprocessing as a TensorFlow graph that is saved with the model and applied identically at training and serving time
-   **BQML TRANSFORM clause**: Feature engineering is part of the model definition, automatically applied during `ML.PREDICT`
-   **Feature Store**: Centralized source of truth for feature values, same store serves training and prediction
-   **Vertex AI Pipelines**: Orchestrate identical preprocessing steps for training and batch prediction

## 04. Feature Crosses

### What They Are and When to Use Them

A **feature cross** is a synthetic feature formed by combining two or more existing features. For categorical features, a cross creates a new feature whose values are the Cartesian product of the original features' values. For example, crossing `city` (3 values) with `device` (2 values) creates 6 new combined values like "NYC\_mobile," "NYC\_desktop," "SF\_mobile," etc.

Feature crosses are powerful because they allow **linear models to learn non-linear patterns**. Without crosses, a linear model can only learn that "being in NYC" has one effect and "using mobile" has another effect, independently. With a cross, the model can learn that the combination "NYC + mobile" has a unique effect that is different from the sum of the individual effects.

**When to use feature crosses**:

-   When the interaction between features matters more than individual features
-   When using linear models (logistic regression, linear regression) that cannot learn interactions natively
-   When combining location + time, user segment + product category, or similar interaction pairs
-   When features are already high-cardinality (crosses multiply cardinality — use hashing to manage)
-   When using tree-based models (they learn interactions automatically through splits)

### Examples

```
-- Feature cross in BQML
CREATE MODEL `project.dataset.model`
TRANSFORM(
  -- Cross two categorical features
  ML.FEATURE_CROSS(STRUCT(city, device_type)) AS city_device,
  -- Cross with hashing to limit dimensionality
  ML.FEATURE_CROSS(STRUCT(
    ML.HASH_BUCKETS(city, 10),
    ML.HASH_BUCKETS(zipcode, 50)
  )) AS city_zip_cross,
  -- Cross bucketed numerical with categorical
  ML.FEATURE_CROSS(STRUCT(
    ML.BUCKETIZE(age, [18, 30, 45, 60]),
    membership_tier
  )) AS age_tier_cross,
  label
)
OPTIONS(model_type='LOGISTIC_REG', input_label_cols=['label'])
AS SELECT * FROM `project.dataset.features`;
```

>**TF Playground Intuition:** The TensorFlow Playground ([playground.tensorflow.org](https://playground.tensorflow.org)) visually demonstrates feature crosses. The classic example: the XOR dataset cannot be separated by a linear model using x1 and x2 alone. Adding the cross feature x1\*x2 makes it linearly separable. Try it: select the XOR dataset, add x1\*x2 as an input, and watch a linear model solve it.

## 05. TensorFlow Transform (tf.Transform)

### The Analyze-and-Transform Pattern

**tf.Transform** is a library for preprocessing data at scale. Its key innovation is the **analyze-and-transform** pattern that separates full-pass computations (like computing the mean of a column across the entire dataset) from per-example transformations (like subtracting that mean from each value).

The central concept is the `preprocessing_fn` — a pure function that defines all feature transformations. Inside this function, you use two types of operations:

**Analyzers** (full-pass): Functions like `tft.mean()`, `tft.min()`, `tft.max()`, `tft.vocabulary()` that need to see the entire dataset to compute a result. These run once during training as a Beam pipeline over the full dataset.

**Mappers** (per-example): Functions like `tft.scale_to_0_1()`, `tft.apply_vocabulary()` that transform individual examples using the values computed by analyzers. These become part of the saved TensorFlow graph.

The key benefit: the preprocessing function is exported as a **TensorFlow graph** that is attached to the model. At serving time, the same graph is applied automatically, guaranteeing identical preprocessing. No Python code runs at serving time — it is all graph ops. This eliminates training-serving skew.

```
import tensorflow_transform as tft

def preprocessing_fn(inputs):
    """Define feature transformations."""
    outputs = {}

    # Numerical: scale to [0, 1] using full-dataset min/max
    outputs['age_scaled'] = tft.scale_to_0_1(inputs['age'])

    # Numerical: z-score normalize
    outputs['income_normalized'] = tft.scale_to_z_score(inputs['income'])

    # Numerical: bucketize into quantile bins
    outputs['age_bucket'] = tft.bucketize(inputs['age'], num_buckets=5)

    # Categorical: compute vocabulary and map to integers
    outputs['city_index'] = tft.compute_and_apply_vocabulary(inputs['city'])

    # Categorical: hash to fixed buckets (high cardinality)
    outputs['zipcode_hash'] = tft.hash_strings(inputs['zipcode'], hash_buckets=100)

    # Text: compute TF-IDF
    outputs['description_tfidf'] = tft.tfidf(
        tft.compute_and_apply_vocabulary(inputs['description']),
        vocab_size=10000
    )

    # Pass through the label
    outputs['label'] = inputs['label']

    return outputs
```

### Dataflow Integration

In production, tf.Transform runs on **Apache Beam / Dataflow**. The workflow is:

1\. Define the `preprocessing_fn` with analyzers and mappers.

2\. Run `tft_beam.AnalyzeAndTransformDataset` on the training data. This executes analyzers as Beam operations (distributed across Dataflow workers) and produces: (a) the transformed training data, and (b) a **transform function** (saved TF graph with computed constants like mean, vocabulary).

3\. Use `tft_beam.TransformDataset` to apply the saved transform to eval/test data (using the constants from step 2, not recomputing them).

4\. Attach the transform function to the serving model so identical preprocessing runs at inference time.

>**Exam Tip:** **tf.Transform vs manual preprocessing**: If the question asks about preventing training-serving skew at scale, the answer is tf.Transform. If it asks about simple SQL-based transforms in BigQuery, the answer is the BQML TRANSFORM clause. tf.Transform is for TensorFlow models; BQML TRANSFORM is for BQML models.

## 06. Preprocessing at Scale

Choosing the right preprocessing approach depends on scale, model framework, and operational requirements. Here is the decision framework:

📊

#### BigQuery SQL

**When**: Data is in BigQuery, using BQML, SQL-expressible transforms. **Scale**: Petabytes. **Skew prevention**: BQML TRANSFORM clause. **Limitation**: Limited to SQL functions.

⚡

#### tf.Transform + Dataflow

**When**: TensorFlow models, complex transforms, need graph-based serving. **Scale**: Terabytes+. **Skew prevention**: Exported TF graph. **Limitation**: TensorFlow ecosystem only.

🔧

#### Dataflow (Beam)

**When**: Custom ETL, multi-framework, streaming. **Scale**: Terabytes+. **Skew prevention**: Must manage manually. **Limitation**: No automatic serving-time replay.

🏭

#### Feature Store

**When**: Features shared across models/teams, need online serving. **Scale**: Enterprise. **Skew prevention**: Single source of truth. **Limitation**: Operational overhead for setup.

>**Decision Rule:** Ask three questions: (1) What model framework? BQML = BigQuery SQL. TensorFlow = tf.Transform. Sklearn/XGBoost = Dataflow or Feature Store. (2) Need online serving? Use Feature Store. (3) Need to prevent skew automatically? tf.Transform or BQML TRANSFORM.

## 07. Feature Selection

### Methods

Feature selection reduces dimensionality, speeds up training, improves generalization, and makes models more interpretable. Three families of methods:

**Filter methods**: Use statistical tests to score features independently of the model. Fast but ignore feature interactions. Examples: correlation with target, chi-squared test (categorical features + categorical target), mutual information (measures any dependency, not just linear), ANOVA F-test (numerical features + categorical target).

**Wrapper methods**: Evaluate feature subsets by training models. Expensive but considers interactions. Examples: forward selection (start empty, add best feature), backward elimination (start full, remove worst), recursive feature elimination (RFE — train, remove least important, repeat).

**Embedded methods**: Feature selection happens during model training. The model itself learns which features matter. Examples: L1 regularization (Lasso — drives unimportant feature weights to zero), tree-based feature importance (how much each feature reduces impurity across all splits).

### Feature Importance

**Tree-based importance**: Random forests and gradient-boosted trees compute feature importance as the total reduction in impurity (Gini or entropy) across all trees. Available in sklearn as `model.feature_importances_`. In BQML, use `ML.FEATURE_IMPORTANCE(MODEL model_name)`.

**Permutation importance**: Shuffle one feature at a time and measure how much model performance degrades. Works with any model. More robust than tree-based importance for correlated features.

**Correlation analysis**: Compute pairwise correlations between features. Highly correlated features (>0.9) are redundant — drop one. Use Pearson for linear relationships, Spearman for monotonic relationships.

```
# Feature importance with sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import mutual_info_classif

# Tree-based importance
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
importances = pd.Series(rf.feature_importances_, index=feature_names)
print(importances.sort_values(ascending=False))

# Mutual information (filter method)
mi_scores = mutual_info_classif(X_train, y_train)
mi_series = pd.Series(mi_scores, index=feature_names)
print(mi_series.sort_values(ascending=False))
```

>**BQML Feature Importance:** In BQML, call ``SELECT * FROM ML.FEATURE_IMPORTANCE(MODEL `project.dataset.model`)`` to get feature attribution scores. This works for all BQML model types and uses the Shapley value method to compute how much each feature contributes to predictions.

## 08. Exam Focus

High-yield topics for exam Sections 2 and 3 relating to feature engineering.

🎯

#### Feature Store vs Inline

Feature Store = shared features, online serving, point-in-time correctness. Inline = model-specific, simple derivations. If the question mentions "multiple teams" or "real-time lookup," choose Feature Store.

🎯

#### tf.Transform vs Manual

tf.Transform = TensorFlow models, prevents skew via saved graph, runs on Dataflow. Manual = Python/pandas in a notebook. If the question asks "how to prevent training-serving skew for a TF model," answer tf.Transform.

🎯

#### Feature Crosses

Enable linear models to capture non-linear interactions. Use `ML.FEATURE_CROSS` in BQML. Combine with hashing for high cardinality. Not needed for tree models (they learn interactions via splits).

🎯

#### Encoding Strategy

Low cardinality: one-hot. High cardinality: hashing or embeddings. Ordinal data: label encoding. Text: TF-IDF or embeddings. BQML auto-encodes strings as one-hot.

🎯

#### Data Leakage

Every feature must be available at prediction time. Fit preprocessing on training set only. Use point-in-time joins in Feature Store. "Would I have this data when making a real prediction?"

🎯

#### Scaling Strategy

BigQuery SQL for BQML. tf.Transform for TF models. Feature Store for shared/multi-model. Dataflow for custom ETL. Match the tool to the model framework and operational needs.

>**Common Exam Traps:** 1) tf.Transform analyzers (mean, vocab) run once on full data, not per-example. 2) Feature Store online serving = low-latency, offline = batch training. 3) Feature crosses multiply cardinality — use hashing to control dimensionality. 4) BQML handles string encoding automatically — you do NOT need to pre-encode. 5) Cyclical encoding (sin/cos) is needed for time features, not just extracting hour as an integer.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Feature engineering is the process of transforming raw data into **informative signals** that improve model performance. On GCP, feature engineering spans three layers: **SQL-level transforms** in BigQuery (bucketizing, hashing, feature crosses via BQML's TRANSFORM clause), **tf.Transform** for TensorFlow models (which runs full-pass analyzers on Dataflow and embeds the transform graph into the SavedModel), and **Vertex AI Feature Store** for managing shared, versioned features across teams with both online (low-latency serving) and offline (batch training) access. The critical principle is **training-serving consistency** — every transformation applied during training must be identically applied at prediction time. tf.Transform and BQML TRANSFORM both solve this by baking preprocessing into the model artifact. Feature crosses let linear models capture non-linear interactions, while hashing controls dimensionality for high-cardinality categoricals. Feature selection (correlation analysis, L1 regularization, feature importance) prunes irrelevant inputs to reduce overfitting and training cost. Mastering this pipeline — from raw columns to production-ready features — is the difference between a model that works in a notebook and one that works in production.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| What is training-serving skew and how do you prevent it in feature engineering? | Do you understand why preprocessing must be embedded in the model graph, not duplicated in serving code? |
| When would you use Vertex AI Feature Store vs inline feature computation? | Can you articulate the tradeoffs between shared/reusable features and model-specific transformations? |
| Explain feature crosses and when they help a model. | Do you understand how combining categorical features creates interaction signals that linear models cannot learn alone? |
| How does tf.Transform differ from doing preprocessing in pandas? | Can you explain the analyze-and-transform pattern, Dataflow execution, and graph embedding? |
| How do you handle high-cardinality categorical features? | Do you know the tradeoffs between one-hot encoding, hashing, and learned embeddings? |

### Model Answers

>**Q1 — Training-Serving Skew:** Training-serving skew occurs when the preprocessing logic applied to training data differs — even slightly — from what is applied at prediction time. For example, if you normalize features using training-set statistics in a Python script but use different statistics or a different code path in your serving API, predictions will be subtly wrong. The fix is to **embed preprocessing into the model artifact**. In TensorFlow, tf.Transform computes full-dataset statistics (means, vocabularies) on Dataflow and generates a transform graph that becomes part of the SavedModel. In BQML, the TRANSFORM clause bakes SQL transforms into the model. Both ensure a single code path for training and prediction, eliminating skew by design.
>**Q2 — Feature Store vs Inline:** **Vertex AI Feature Store** is the right choice when: multiple teams consume the same features (e.g., user demographics used by both recommendation and fraud models), you need low-latency online serving for real-time predictions, or you require point-in-time correctness to avoid data leakage in training. **Inline computation** is appropriate when features are model-specific (e.g., a custom text embedding), simple to derive (e.g., age from birthdate), or when the overhead of Feature Store management is not justified. The Feature Store also provides versioning, monitoring for feature drift, and a central registry that improves governance and discoverability across the organization.
>**Q3 — Feature Crosses:** A feature cross is the Cartesian product of two or more categorical features, creating a new combined feature. For example, crossing `city` and `device_type` creates features like `city_NYC_x_device_mobile`. This matters because **linear models cannot learn interactions** — they treat each feature independently. A feature cross explicitly encodes the interaction so a linear model can assign different weights to "New York + mobile" vs "New York + desktop." In BQML, use `ML.FEATURE_CROSS(STRUCT(city, device_type))`. The cardinality of the cross is the product of the input cardinalities, so for high-cardinality inputs, combine with `ML.HASH_BUCKETS` to cap dimensionality. Tree-based models (XGBoost, Random Forest) learn interactions naturally via splits, so crosses are less necessary for them.
>**Q4 — tf.Transform vs Pandas:** Pandas preprocessing runs on a single machine, computes statistics in memory, and produces a separate script that must be replicated in serving. tf.Transform uses the **analyze-and-transform pattern**: analyzers (like `tft.compute_and_apply_vocabulary` or `tft.scale_to_z_score`) run a full pass over the dataset using **Dataflow** for scalability, computing global statistics. These statistics are then frozen into a TensorFlow graph that is attached to the SavedModel. At serving time, the same graph applies the identical transformations — no separate code, no statistics file to manage, no possibility of skew. The tradeoff is complexity: tf.Transform requires TensorFlow ops (no arbitrary Python), has a learning curve, and is only relevant for TF models.
>**Q5 — High-Cardinality Categoricals:** One-hot encoding fails for high-cardinality features (e.g., 100K product IDs) because it creates an enormous sparse vector. Three better strategies: (1) **Hashing** — `ML.HASH_BUCKETS` in BQML maps values to a fixed number of buckets (e.g., 1000), accepting some collisions in exchange for controlled dimensionality. (2) **Learned embeddings** — in TensorFlow/Keras, an `Embedding` layer maps each category to a dense vector learned during training; this captures semantic similarity. (3) **Frequency-based encoding** — replace categories with their occurrence count or target mean. Hashing is simplest and works well for linear models. Embeddings are most powerful but require neural network training. The choice depends on model type, feature cardinality, and whether you need interpretability.

### System Design Scenario

>**Design Challenge:** **Scenario:** Your company runs 12 ML models across 3 teams (recommendations, fraud, search). Many models share user-level features (demographics, purchase history, session stats). Feature computation is duplicated, causing inconsistencies and wasted compute. Design a feature management architecture.  
>   
> **A strong answer covers:** (1) Central Feature Store — deploy Vertex AI Feature Store with entity types for users, products, and sessions. Define shared feature views that all teams consume. (2) Ingestion pipelines — Dataflow jobs compute features from raw events, write to both online (Bigtable-backed, low-latency) and offline (BigQuery, batch) stores. (3) Point-in-time correctness — use timestamp-based joins for training to prevent leakage; Feature Store handles this natively. (4) Team-specific features — each team adds model-specific features on top of shared ones, either inline or as additional Feature Store feature views. (5) Monitoring — track feature drift using Vertex AI Model Monitoring; alert when distributions shift beyond thresholds. (6) Governance — feature registry with descriptions, owners, freshness SLAs, and lineage tracking.

### Common Mistakes

-   **Fitting preprocessing on the full dataset including test data** — Computing normalization statistics (mean, std) on the entire dataset before splitting leaks test-set information into training. Always fit transformations on the training split only. tf.Transform analyzers should run on the training partition. This is the most common source of inflated evaluation metrics that collapse in production.
-   **Using feature crosses with tree-based models** — Decision trees and gradient-boosted models (XGBoost, LightGBM) learn feature interactions naturally through splits. Adding explicit feature crosses to these models adds dimensionality without improving performance. Feature crosses are primarily valuable for linear and logistic regression models that cannot learn interactions on their own.
-   **Ignoring cyclical encoding for time features** — Extracting `hour_of_day` as an integer (0-23) implies that hour 23 and hour 0 are maximally distant, when they are actually adjacent. The correct approach is cyclical encoding: `sin(2π * hour/24)` and `cos(2π * hour/24)`, which preserves the circular relationship. The same applies to day-of-week and month-of-year features.

Previous

[← 05 · Data Engineering](05-data-engineering-bqml.html)

Next

[07 · TensorFlow on GCP →](07-tensorflow-gcp.html)