---
title: "Vertex AI Feature Store"
slug: "mlops-feature-store"
description: "Features are the lifeblood of ML models. The Vertex AI Feature Store provides a centralized, managed
    repository for storing, serving, and monitoring features — ensuring consistency between training
    and serving, enabling feature sharing across teams, and solving the critical problem of point-"
section: "gcp-mle"
order: 10
badges:
  - "Feature Store Architecture"
  - "Online vs Offline Serving"
  - "Point-in-Time Correctness"
  - "Feature Monitoring"
  - "BigQuery Integration"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/10-mlops-feature-store.ipynb"
---

## 01. Feature Store Architecture

The Vertex AI Feature Store is a **centralized, managed service** for organizing, storing, and serving ML features. It solves three critical problems: (1) **training-serving skew** — features computed differently at training vs prediction time, (2) **feature duplication** — teams rebuilding the same features independently, and (3) **point-in-time correctness** — using future data that would not have been available at prediction time.

### BigQuery-Backed Design (New Architecture)

The current Vertex AI Feature Store uses **BigQuery as the offline store** and a managed online serving layer for low-latency lookups. Features are defined as views or tables in BigQuery, and the Feature Store manages synchronization between offline and online stores.

![Diagram 1](/diagrams/gcp-mle/mlops-feature-store-1.svg)

Vertex AI Feature Store architecture: BigQuery offline store + managed online store

### Core Concepts

📦

#### Feature Group

A collection of related features backed by a BigQuery table or view. Examples: `user_features`, `transaction_features`. Each group has an entity ID column (e.g., `user_id`) and a timestamp column.

📌

#### Feature

An individual column within a feature group. Has a name, data type, and optional description. Examples: `avg_transaction_amount_30d`, `account_age_days`, `is_verified`.

👁

#### Feature View

A logical view that combines features from one or more feature groups for a specific use case. Used by both online and offline serving. Defines which features to include and how to join them.

🕒

#### Feature Online Store

A managed, low-latency serving infrastructure that stores the latest feature values. Supports millisecond-level lookups by entity ID. Automatically synced from the BigQuery offline store.

## 02. Online vs Offline Feature Serving

Feature Store provides two serving modes, each optimized for different access patterns. Understanding when to use each is critical for the exam.

### Latency Requirements and Architecture

| Dimension | Offline Serving | Online Serving |
| --- | --- | --- |
| **Storage** | BigQuery | Managed online store (Bigtable-based) |
| **Latency** | Seconds to minutes | Single-digit milliseconds |
| **Access pattern** | Batch reads (entire dataset) | Point lookups by entity ID |
| **Data freshness** | Historical (all versions) | Latest values only |
| **Use case** | Training data generation | Real-time prediction serving |
| **Volume** | Millions to billions of rows | Latest row per entity |
| **Point-in-time support** | Yes (time-travel queries) | No (latest only) |

### When to Use Each Mode

📊

#### Offline Serving (Training)

**Use when:** generating training datasets, batch predictions, historical analysis. Feature values are joined with labels using point-in-time correctness. Output is a BigQuery table or export.

⚡

#### Online Serving (Prediction)

**Use when:** real-time inference, fraud detection at transaction time, recommendation systems. Model endpoint calls Feature Store to get latest user/item features in milliseconds.

>**Exam Alert:** A common exam question: "A model needs user features at prediction time with latency under 50ms." The answer is **online serving** from Feature Store. If the question mentions batch predictions or training data generation, the answer is **offline serving** from BigQuery.

## 03. Feature Store Operations

### Create Feature Groups and Features

Feature groups are backed by BigQuery tables. You create a feature group by pointing to an existing BigQuery table, then register individual columns as features with metadata.

```
from google.cloud import aiplatform
from vertexai.resources.preview import feature_store

# Initialize
aiplatform.init(project="my-project", location="us-central1")

# Create a Feature Group backed by a BigQuery table
user_feature_group = feature_store.FeatureGroup.create(
    name="user_features",
    source=feature_store.utils.FeatureGroupBigQuerySource(
        uri="bq://my-project.features.user_features_table",
        entity_id_columns=["user_id"],
    ),
    description="User-level features for fraud detection",
)

# Register individual features with metadata
user_feature_group.create_feature(
    name="avg_transaction_amount_30d",
    description="Average transaction amount over last 30 days",
)
user_feature_group.create_feature(
    name="transaction_count_7d",
    description="Number of transactions in last 7 days",
)
user_feature_group.create_feature(
    name="account_age_days",
    description="Days since account creation",
)
user_feature_group.create_feature(
    name="is_verified",
    description="Whether user has completed identity verification",
)
```

### Ingest Feature Values

Feature values come from **batch ingestion** (BigQuery tables updated by ETL pipelines) or **streaming ingestion** (real-time updates via the API). The BigQuery-backed architecture means batch ingestion is simply updating the underlying BigQuery table.

```
# Batch ingestion: update the BigQuery source table
# The Feature Store reads from BigQuery, so updating the table = updating features

# Option 1: BigQuery SQL (most common for batch)
# CREATE OR REPLACE TABLE features.user_features_table AS
# SELECT
#   user_id,
#   AVG(amount) OVER (PARTITION BY user_id ORDER BY timestamp
#     ROWS BETWEEN 30 PRECEDING AND CURRENT ROW) AS avg_transaction_amount_30d,
#   COUNT(*) OVER (PARTITION BY user_id ORDER BY timestamp
#     ROWS BETWEEN 7 PRECEDING AND CURRENT ROW) AS transaction_count_7d,
#   DATE_DIFF(CURRENT_DATE(), account_created, DAY) AS account_age_days,
#   is_verified,
#   CURRENT_TIMESTAMP() AS feature_timestamp
# FROM raw_data.transactions
# JOIN raw_data.users USING (user_id)

# Option 2: Streaming ingestion for real-time features
# (via the Feature Store write API)
from google.cloud.aiplatform_v1beta1 import FeatureOnlineStoreServiceClient

# client.write_feature_values(
#     feature_online_store="projects/.../featureOnlineStores/my-store",
#     feature_values=[{
#         "entity_id": "user_12345",
#         "feature_values": {"transaction_count_7d": 42, "is_verified": True}
#     }],
# )
```

### Serve Features for Training (Offline)

For training, the Feature Store generates a **training dataset** by joining feature values with labels, respecting **point-in-time correctness**. This ensures each training example uses only features that were available at the time of the label.

```
# Create a Feature View for the fraud detection use case
fraud_feature_view = feature_store.FeatureView.create(
    name="fraud_detection_features",
    feature_registry_source=feature_store.utils.FeatureViewFeatureRegistrySource(
        feature_groups={
            user_feature_group.resource_name: feature_store.utils.FeatureViewFeatureRegistrySource.FeatureGroup(
                features=[
                    "avg_transaction_amount_30d",
                    "transaction_count_7d",
                    "account_age_days",
                    "is_verified",
                ],
            ),
        },
    ),
)

# Generate training data with point-in-time join
# Labels table has: entity_id, timestamp, label
training_data = fraud_feature_view.batch_serve(
    entity_df="bq://my-project.labels.fraud_labels",
    destination_uri="bq://my-project.training.fraud_training_data",
)
# Result: each row has features as-of the label timestamp
```

### Serve Features for Prediction (Online)

For real-time predictions, the online store provides **millisecond-latency lookups** by entity ID. The prediction service fetches the latest feature values just before calling the model.

```
# Create an online store for low-latency serving
online_store = feature_store.FeatureOnlineStore.create(
    name="fraud-online-store",
    feature_online_store_type=feature_store.utils.FeatureOnlineStoreType.BIGTABLE,
    bigtable_auto_scaling=feature_store.utils.BigtableAutoScaling(
        min_node_count=1,
        max_node_count=3,
        cpu_utilization_target=70,
    ),
)

# Sync feature view to online store
sync_job = online_store.create_feature_view_sync(
    feature_view=fraud_feature_view,
)

# Fetch features at prediction time (single-digit ms)
feature_values = online_store.fetch_feature_values(
    feature_view="fraud_detection_features",
    entity_id="user_12345",
)
# Returns: {"avg_transaction_amount_30d": 450.0, "transaction_count_7d": 12, ...}

# Use these features in your prediction request
# prediction = endpoint.predict(instances=[feature_values])
```

>**Training-Serving Consistency:** Feature Store ensures the **same feature definitions** are used for both training (offline) and prediction (online). This eliminates training-serving skew — one of the most common and hardest-to-debug problems in production ML.

## 04. Feature Monitoring

Feature monitoring detects changes in feature distributions that could degrade model performance. It continuously compares current feature values against a baseline (typically training data distributions).

### Drift Detection

**Feature drift** occurs when the statistical distribution of a feature changes over time. For example, if average transaction amounts increase due to inflation, a model trained on older data may underperform.

| Drift Type | What Changes | Detection Method | Impact |
| --- | --- | --- | --- |
| **Feature drift** | Input feature distributions | Jensen-Shannon divergence, KL divergence, chi-squared test | Model receives inputs it was not trained on |
| **Prediction drift** | Model output distributions | Distribution comparison of predictions | Model behavior is changing |
| **Concept drift** | Relationship between features and labels | Monitoring prediction accuracy against ground truth | Model's learned patterns no longer apply |

```
# Configure feature monitoring on a Feature View
# Monitoring checks feature distributions against a baseline

monitoring_config = feature_store.FeatureViewMonitoringConfig(
    snapshot_analysis=feature_store.SnapshotAnalysis(
        monitoring_interval_days=1,  # Check daily
    ),
    numerical_threshold_config=feature_store.NumericalThresholdConfig(
        value=0.3,  # Alert if Jensen-Shannon divergence > 0.3
    ),
    categorical_threshold_config=feature_store.CategoricalThresholdConfig(
        value=0.3,  # Alert if L-infinity distance > 0.3
    ),
)

# Alerts go to Cloud Monitoring, where you can configure
# notification channels (email, PagerDuty, Pub/Sub)
```

### Staleness Alerts

Feature **staleness** occurs when feature values are not updated within the expected timeframe. If a daily feature pipeline fails, the Feature Store will serve yesterday's (or older) values, potentially degrading predictions. Staleness monitoring catches these failures.

>**Monitoring Best Practice:** Configure monitoring at **two levels**: (1) feature-level drift alerts to catch distribution changes, and (2) pipeline-level staleness alerts to catch ingestion failures. Both can trigger continuous training or alert the on-call engineer.

## 05. Point-in-Time Correctness

### Why It Matters

**Point-in-time correctness** is the most critical concept in feature engineering for ML. It means: when constructing training data, each example must use only features that were **available at the time of the label**. Using future data (data leakage) creates artificially high training metrics that do not generalize to production.

>**Data Leakage Example:** **Scenario:** You are training a fraud model. Transaction X happened on Monday and was labeled as fraud on Wednesday. If your training data includes the user's `transaction_count_7d` computed on Wednesday (which includes Tuesday's transactions), you are using **future data**. The model cannot access Wednesday's count when making a prediction on Monday. This is data leakage, and it inflates your metrics by 5-15% typically.

### How Feature Store Handles It

The Feature Store's `batch_serve` method performs a **point-in-time join**: for each (entity\_id, timestamp) pair in your labels table, it looks up the feature values that were current *at or before* that timestamp. This is also called an **as-of join** or **temporal join**.

```
# Point-in-time join: how it works
#
# Labels table:          Feature table (user_features):
# user_id | label_ts    | label     user_id | feature_ts  | txn_count_7d
# u001    | 2025-03-15  | fraud     u001    | 2025-03-10  | 5
# u001    | 2025-04-20  | legit     u001    | 2025-03-17  | 8
#                                   u001    | 2025-04-01  | 12
#                                   u001    | 2025-04-18  | 3
#
# Point-in-time result:
# user_id | label_ts    | label  | txn_count_7d
# u001    | 2025-03-15  | fraud  | 5     (used 03-10 value, NOT 03-17)
# u001    | 2025-04-20  | legit  | 3     (used 04-18 value, NOT future)
#
# Each row gets the feature value that was latest AT OR BEFORE label_ts

# In BigQuery SQL, this is an ASOF JOIN:
# SELECT l.*, f.txn_count_7d
# FROM labels l
# ASOF JOIN features f
#   ON l.user_id = f.user_id
#   AND f.feature_ts <= l.label_ts
```

>**Exam Key Point:** The exam will test whether you understand point-in-time correctness. Remember: **feature values must be looked up as-of the label timestamp**. Feature Store automates this. Without Feature Store, engineers must implement temporal joins manually, which is error-prone and a common source of data leakage.

## 06. Feature Sharing Across Teams

### Discovery and Reuse

Feature Store enables **feature discovery** — teams can browse existing features before building new ones. This eliminates duplicate work where multiple teams independently compute the same features (e.g., "user age" or "30-day transaction count") with slightly different definitions.

🔍

#### Discovery

Browse feature groups and features with descriptions, data types, and statistics. Search by name, description, or label. See which teams own which features.

🔄

#### Reuse

Create Feature Views that combine features from any team's feature groups. One team computes `user_age`, another team uses it in their model — same definition, always consistent.

### Governance

Feature governance includes **access control** (IAM policies on feature groups), **lineage tracking** (which models use which features), and **documentation** (descriptions and metadata on every feature). This ensures compliance, auditability, and organizational knowledge retention.

```
# List all available feature groups (discovery)
feature_groups = feature_store.FeatureGroup.list()

print(f"Available feature groups: {len(feature_groups)}")
for fg in feature_groups:
    features = fg.list_features()
    print(f"  {fg.name}: {len(features)} features - {fg.description}")
    for f in features:
        print(f"    - {f.name}: {f.description}")
```

## 07. Feature Store vs Inline Features

Not every feature belongs in a Feature Store. Understanding when to use centralized features vs inline (computed at prediction time) is an important architectural decision.

| Criteria | Use Feature Store | Use Inline Features |
| --- | --- | --- |
| **Shared across models** | Yes — multiple models use the same feature | Feature is specific to one model |
| **Expensive to compute** | Yes — precompute and store (e.g., 30-day aggregates) | Cheap to compute on-the-fly |
| **Requires point-in-time** | Yes — Feature Store handles temporal joins | Feature does not depend on history |
| **Governance required** | Yes — access control, lineage, auditing | No compliance requirements |
| **Available in request** | No — must be looked up by entity ID | Yes — feature comes with the request (e.g., request size) |
| **Latency tolerance** | Can tolerate ms-level lookup overhead | Ultra-low latency, no external calls |

>**Rule of Thumb:** **Feature Store** for precomputed entity features (user history, aggregated stats, profile data). **Inline** for request-level features (transaction amount, time of day, device type) that arrive with the prediction request itself.

## 08. Integration with Vertex AI Pipelines

Feature Store integrates with Vertex AI Pipelines at two key points in the ML lifecycle: (1) **feature ingestion** — pipeline steps that compute and write features, and (2) **training data generation** — pipeline steps that read features with point-in-time joins.

```
# Feature Store integration in a Vertex AI Pipeline
from kfp import dsl

@dsl.pipeline(name="fraud-pipeline-with-features")
def fraud_pipeline(project: str):
    # Step 1: Compute fresh features in BigQuery
    compute_features_op = bq_query_op(
        query="CALL features.compute_user_features()",
        project=project,
    )

    # Step 2: Generate training data from Feature Store
    # Point-in-time join: features + labels
    generate_training_data_op = feature_store_batch_serve_op(
        feature_view="fraud_detection_features",
        entity_source="bq://project.labels.fraud_labels",
        destination="bq://project.training.fraud_data",
    ).after(compute_features_op)

    # Step 3: Train model on feature-store-generated data
    train_op = custom_training_op(
        training_data=generate_training_data_op.outputs["training_data"],
    ).after(generate_training_data_op)

    # Step 4: Sync features to online store for serving
    sync_op = feature_view_sync_op(
        feature_view="fraud_detection_features",
        online_store="fraud-online-store",
    ).after(compute_features_op)

    # Step 5: Deploy model (uses online store at prediction time)
    deploy_op = model_deploy_op(
        model=train_op.outputs["model"],
    ).after(train_op, sync_op)  # Wait for both
```

>**Pipeline Pattern:** Notice the **parallel execution**: feature sync to online store and model training can happen concurrently. Both depend on feature computation, but not on each other. Deployment waits for both to complete. This is a common and efficient pipeline pattern.

## 09. BigQuery Feature Store vs Legacy Feature Store

Google has evolved the Feature Store architecture. The **new architecture** (BigQuery-backed) replaces the **legacy architecture** (Featurestore with EntityTypes). Understanding both is useful for the exam, as some older references still use legacy terminology.

| Aspect | New (BigQuery-Backed) | Legacy (Featurestore) |
| --- | --- | --- |
| **Offline store** | BigQuery (native) | Proprietary storage |
| **Data model** | Feature Groups + Feature Views | Featurestore → EntityType → Feature |
| **Ingestion** | BigQuery tables (batch), API (streaming) | ImportFeatureValues API |
| **Offline serving** | BigQuery SQL / batch\_serve | BatchReadFeatureValues API |
| **Online serving** | FeatureOnlineStore (Bigtable-backed) | Built-in online serving |
| **BigQuery integration** | Native (features are BQ tables) | Export required |
| **Status** | Current, recommended | Deprecated (migration path available) |

>**Exam Note:** The exam may reference both architectures. If you see **EntityType** and **Featurestore** (capital F, one word), that is the legacy architecture. If you see **Feature Group** and **Feature View**, that is the new BigQuery-backed architecture. Know both, but recommend the new architecture in design questions.

## 10. Exam Focus

This course maps to **Section 2: Data Processing** (feature engineering, data validation) and **Section 4: ML Model Serving** (online feature serving, training-serving consistency) on the GCP Machine Learning Engineer exam.

### Key Exam Scenarios

| Scenario | Best Answer |
| --- | --- |
| "Need features with sub-10ms latency at prediction time" | **Feature Store online serving** |
| "Need to generate training data without data leakage" | **Feature Store batch serving with point-in-time joins** |
| "Feature distributions are changing, model accuracy declining" | **Feature monitoring with drift detection** + continuous training |
| "Multiple teams compute the same features differently" | **Centralize in Feature Store** for consistency and governance |
| "Transaction amount is available in the prediction request" | **Inline feature** (no Feature Store needed for request-level data) |
| "Need historical user behavior features for training" | **Feature Store offline serving** with BigQuery |
| "Training accuracy is much higher than production accuracy" | Likely **data leakage** — check point-in-time correctness |

### Key Exam Takeaways

-   **Online serving** = low-latency entity lookups for real-time predictions.
-   **Offline serving** = batch feature retrieval with point-in-time joins for training.
-   **Point-in-time correctness** prevents data leakage (using future data in training).
-   Use Feature Store for **shared, precomputed entity features**. Use inline for **request-level features**.
-   Feature monitoring detects **drift** (distribution changes) and **staleness** (ingestion failures).
-   New architecture uses **Feature Groups + Feature Views**; legacy used **Featurestore + EntityTypes**.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** A Feature Store is a centralized repository that manages the computation, storage, and serving of ML features across an organization. It solves the critical **training-serving skew** problem — ensuring that the exact same feature transformations used during training are applied at inference time. Vertex AI Feature Store provides two serving paths: an **offline store** (backed by BigQuery) for batch training data retrieval with point-in-time correctness, and an **online store** (backed by Bigtable) for low-latency feature lookups during real-time prediction. The new architecture uses Feature Groups to organize related features and Feature Views to define which features are synced to the online store. Key capabilities include automatic feature freshness monitoring, drift detection, point-in-time joins that prevent data leakage in training sets, and feature sharing across teams. The decision framework is simple: use Feature Store for **entity-level precomputed features** (user history, product stats), and compute **request-level features** (query text, session context) inline at serving time.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| What is a Feature Store and why would you use one instead of computing features on the fly? | Do you understand training-serving skew and the value of centralized feature management? |
| Explain the difference between online and offline feature serving. | Can you articulate latency requirements and the architectural trade-offs between batch and real-time serving? |
| What is point-in-time correctness and why does it matter for ML training? | Do you understand data leakage and how temporal feature joins prevent using future information during training? |
| How do you monitor feature quality in production? | Can you describe drift detection, staleness monitoring, and distribution validation for feature pipelines? |
| When should you NOT use a Feature Store? | Do you understand that request-level features, simple models, and early-stage projects may not justify the operational overhead? |

### Model Answers

**1\. Why use a Feature Store** — Without a Feature Store, training and serving code compute features independently, which leads to training-serving skew — subtle differences in feature values that silently degrade model performance. A Feature Store centralizes feature definitions: features are computed once via batch or streaming pipelines, stored in a managed repository, and served consistently to both training jobs and prediction endpoints. This also enables feature reuse across teams — a "user\_purchase\_count\_30d" feature computed by the fraud team can be discovered and used by the recommendation team without duplicating the computation logic. On Vertex AI, Feature Groups define the schema and source, while Feature Views control which features are materialized to the online store for low-latency access.

**2\. Online vs offline serving** — The offline store (BigQuery-backed) is optimized for batch reads — training jobs that need millions of feature vectors with point-in-time correctness. Latency is seconds to minutes, but throughput is massive. The online store (Bigtable-backed) is optimized for single-entity lookups — a prediction endpoint that needs the latest features for one user in under 10 milliseconds. Features are synced from offline to online via materialization jobs. The architectural trade-off: the online store only holds the *latest* feature values (no history), while the offline store maintains full temporal history for time-travel queries. You configure sync schedules in Feature Views — high-frequency features (e.g., click counts) may sync every few minutes, while stable features (e.g., user demographics) sync daily.

**3\. Point-in-time correctness** — Point-in-time correctness ensures that when you create training data, each example only uses feature values that were available *at the time the event occurred*. Without this, you get data leakage — the model trains on future information it would not have at prediction time, producing artificially inflated metrics that do not generalize. For example, if you are predicting whether a user will churn this month, the "user\_login\_count" feature must reflect the count *before* the prediction date, not the final count including days after. Vertex AI Feature Store handles this with temporal joins — given a set of entity IDs and timestamps, it retrieves the feature values that were valid at each specific timestamp, preventing accidental leakage.

**4\. Feature monitoring** — Feature monitoring has two dimensions: **freshness** and **drift**. Freshness monitoring checks whether features are being updated on schedule — if a daily batch pipeline fails, the online store serves stale features, and predictions silently degrade. Drift monitoring compares the statistical distribution of feature values in production against a training-time baseline using tests like KL divergence, Jensen-Shannon distance, or population stability index. Significant drift indicates that the real-world data distribution has changed and the model may need retraining. Vertex AI Feature Store provides built-in monitoring that alerts when features go stale or distributions shift beyond configured thresholds. This ties into the broader MLOps monitoring story — feature drift is often the leading indicator of model performance degradation.

**5\. When NOT to use a Feature Store** — Feature Stores add operational complexity and cost. Skip them when: the model is simple with few features that can be computed inline, the project is in early prototyping and features are still changing rapidly, features are entirely request-level (e.g., raw text from the user query) with no entity-level precomputation needed, or the team is small and a shared BigQuery table provides sufficient consistency. The Feature Store becomes valuable when you have multiple models sharing entity features, strict training-serving consistency requirements, need for point-in-time correctness in training data, or organizational feature discovery and reuse across teams.

### System Design Scenario

>**Design Challenge:** You are building a real-time fraud detection system for a payment processor handling 10,000 transactions per second. The model needs both historical user features (transaction patterns over 7/30/90 days) and real-time features (current session behavior). Latency budget for the entire prediction is 50ms. Design the feature architecture using Vertex AI Feature Store.
> 
> A strong answer should cover:
> 
> -   **Feature categorization** — entity features (user transaction history, merchant risk scores, device fingerprints) in Feature Store for precomputed low-latency access; request-level features (transaction amount, time of day, IP geolocation) computed inline at prediction time
> -   **Online store configuration** — Bigtable-backed online store with regional replication for low-latency reads, Feature Views configured for 5-minute sync on high-velocity features (recent transaction counts) and hourly sync on stable aggregates (90-day averages)
> -   **Streaming feature updates** — Dataflow streaming pipeline consuming transaction events from Pub/Sub, computing real-time aggregates (rolling window counts), and writing directly to the online store for sub-minute feature freshness
> -   **Training data generation** — point-in-time correct joins against the offline store to create training datasets without data leakage, using labeled fraud cases with feature snapshots from the exact transaction timestamp
> -   **Monitoring** — feature freshness alerts (critical for fraud — stale features mean missed patterns), distribution drift monitoring comparing production feature distributions against training baseline, and staleness circuit breakers that fall back to a simpler model if key features are unavailable

### Common Mistakes

-   **Putting all features in the Feature Store** — Request-level features (user query text, session ID, current timestamp) should be computed inline at serving time. The Feature Store is for precomputed entity features that need consistency between training and serving. Storing everything adds unnecessary latency and operational burden.
-   **Ignoring point-in-time correctness during training** — Using the latest feature values when creating training data introduces data leakage. If your training labels are from January but features reflect March values, the model learns patterns it cannot exploit at prediction time. Always use temporal joins with event timestamps.
-   **Conflating the new and legacy Feature Store architectures** — The legacy architecture used Featurestore, EntityTypes, and Features as separate resources. The new BigQuery-backed architecture uses Feature Groups and Feature Views with direct BigQuery integration. The exam tests whether you know the current architecture — answers referencing EntityTypes signal outdated knowledge.

Previous Course

[09 · MLOps Getting Started](09-mlops-getting-started.html)

Next Course

[11 · Intro to Generative AI](11-intro-generative-ai.html)

Generative AI