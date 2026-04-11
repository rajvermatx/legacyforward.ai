---
title: "Preparing Data for Analysis and ML"
slug: "preparing-using-data"
description: "Covers roughly 15% of the exam. Data visualization with BI Engine, preparing data for AI/ML with
    BigQuery ML, embeddings and RAG patterns, data sharing with Analytics Hub, and protecting
    sensitive data with Cloud DLP and data masking."
section: "gcp-pde"
order: 4
badges:
  - "BI Engine & Visualization"
  - "BigQuery ML"
  - "Analytics Hub"
  - "DLP & Data Masking"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-pde/04-preparing-using-data.ipynb"
---

## 01. Data Visualization

### BI Engine

**BI Engine** is an in-memory analysis service that accelerates BigQuery queries from BI tools like Looker Studio. It caches frequently accessed data in memory for **sub-second query response times**.

-   Configured as a **reservation** (amount of memory allocated) per project per location
-   Automatically selects which tables/columns to cache based on query patterns
-   Works transparently — no query changes needed
-   Integrates with Looker Studio, Connected Sheets, and the BigQuery API
-   **Preferred tables** can be specified to prioritize caching for specific tables

```
-- Create a BI Engine reservation (via SQL or Console)
-- Sets aside 10 GB of in-memory cache for this project in US

# gcloud equivalent:
bq update --project_id=my-project \
  --bi_reservation_size=10GB \
  --location=US

# Set preferred tables for caching priority
bq update --project_id=my-project \
  --bi_reservation_size=10GB \
  --location=US \
  --preferred_tables=my-project:dataset.daily_summary,my-project:dataset.user_metrics
```

### Materialized Views for BI

Materialized views complement BI Engine by pre-computing expensive aggregations. BigQuery automatically rewrites incoming queries to use materialized views when applicable, even if the user queries the base table directly.

```
-- Materialized view optimized for dashboard queries
CREATE MATERIALIZED VIEW `project.dataset.mv_regional_metrics`
OPTIONS (
  enable_refresh = true,
  refresh_interval_minutes = 30,
  max_staleness = INTERVAL "1:0:0" HOUR TO SECOND  -- Serve stale data for 1 hr
)
AS
SELECT
  DATE(event_time) AS event_date,
  region,
  product_category,
  COUNT(*) AS total_events,
  COUNT(DISTINCT user_id) AS unique_users,
  SUM(revenue) AS total_revenue,
  AVG(session_duration) AS avg_session_seconds
FROM `project.dataset.events`
GROUP BY 1, 2, 3;
```

### Looker and Looker Studio

| Tool | Description | Best For |
| --- | --- | --- |
| **Looker Studio** | Free, self-service dashboards and reports. Drag-and-drop, shareable links. | Ad-hoc exploration, team dashboards, quick reporting |
| **Looker** | Enterprise BI platform with LookML semantic layer. Governed metrics, embedded analytics. | Enterprise-wide BI, consistent metric definitions, data modeling |
| **Connected Sheets** | Access BigQuery from Google Sheets. Pivot tables, charts on live BQ data. | Business users who prefer spreadsheets, ad-hoc analysis |

>**Key Concept:** BI Engine + Materialized Views + Looker Studio form a powerful stack for interactive dashboards: materialized views pre-aggregate data, BI Engine caches it in memory, and Looker Studio provides the visualization layer. Queries that would take seconds now return in milliseconds.

## 02. BigQuery ML

### Supported Model Types

| Model Type | SQL Option | Use Case |
| --- | --- | --- |
| **Linear Regression** | `LINEAR_REG` | Predict continuous values (price, demand) |
| **Logistic Regression** | `LOGISTIC_REG` | Binary/multi-class classification |
| **K-Means Clustering** | `KMEANS` | Customer segmentation, anomaly detection |
| **Matrix Factorization** | `MATRIX_FACTORIZATION` | Recommendation systems |
| **Time Series (ARIMA+)** | `ARIMA_PLUS` | Forecasting (sales, demand, capacity) |
| **Boosted Trees (XGBoost)** | `BOOSTED_TREE_CLASSIFIER/REGRESSOR` | High-accuracy tabular predictions |
| **DNN** | `DNN_CLASSIFIER/REGRESSOR` | Deep learning on tabular data |
| **AutoML Tables** | `AUTOML_CLASSIFIER/REGRESSOR` | Automated model selection and tuning |
| **Imported TensorFlow** | `TENSORFLOW` | Serve pre-trained TF models for inference in SQL |
| **Remote Models** | `REMOTE` | Call Vertex AI or Cloud AI endpoints from SQL |

### End-to-End ML Workflow in SQL

```
-- Step 1: CREATE MODEL (training)
CREATE OR REPLACE MODEL `project.dataset.churn_model`
OPTIONS (
  model_type = 'BOOSTED_TREE_CLASSIFIER',
  input_label_cols = ['churned'],
  auto_class_weights = TRUE,
  num_parallel_tree = 10,
  max_iterations = 50,
  learn_rate = 0.1,
  data_split_method = 'AUTO_SPLIT',
  enable_global_explain = TRUE
) AS
SELECT
  user_tenure_days,
  total_purchases,
  avg_session_minutes,
  support_tickets_30d,
  last_login_days_ago,
  subscription_tier,
  churned
FROM `project.dataset.user_features`
WHERE signup_date < '2025-01-01';

-- Step 2: EVALUATE (model performance)
SELECT *
FROM ML.EVALUATE(MODEL `project.dataset.churn_model`);

-- Step 3: EXPLAIN (feature importance)
SELECT *
FROM ML.GLOBAL_EXPLAIN(MODEL `project.dataset.churn_model`);

-- Step 4: PREDICT (inference)
SELECT
  user_id,
  predicted_churned,
  predicted_churned_probs
FROM ML.PREDICT(
  MODEL `project.dataset.churn_model`,
  (SELECT * FROM `project.dataset.user_features`
   WHERE signup_date >= '2025-01-01')
);

-- Step 5: FORECAST (time series)
CREATE OR REPLACE MODEL `project.dataset.revenue_forecast`
OPTIONS (
  model_type = 'ARIMA_PLUS',
  time_series_timestamp_col = 'date',
  time_series_data_col = 'daily_revenue',
  time_series_id_col = 'region',
  auto_arima = TRUE,
  holiday_region = 'US'
) AS
SELECT date, region, daily_revenue
FROM `project.dataset.daily_revenue`;

SELECT * FROM ML.FORECAST(
  MODEL `project.dataset.revenue_forecast`,
  STRUCT(30 AS horizon, 0.95 AS confidence_level)
);
```

### TRANSFORM Clause for Feature Engineering

```
-- TRANSFORM embeds feature engineering into the model
-- Applied automatically at prediction time too
CREATE OR REPLACE MODEL `project.dataset.model_with_transform`
TRANSFORM(
  ML.STANDARD_SCALER(age) OVER() AS scaled_age,
  ML.BUCKETIZE(income, [20000, 50000, 100000, 200000]) AS income_bucket,
  ML.FEATURE_CROSS(STRUCT(region, device_type)) AS region_device,
  ML.QUANTILE_BUCKETIZE(purchase_count, 5) OVER() AS purchase_quintile,
  IFNULL(last_purchase_days, 999) AS last_purchase_imputed,
  IF(last_purchase_days IS NULL, 1, 0) AS purchase_missing_flag,
  label
)
OPTIONS (
  model_type = 'LOGISTIC_REG',
  input_label_cols = ['label'],
  auto_class_weights = TRUE
) AS
SELECT * FROM `project.dataset.training_data`;
```

>**Exam Tip:** The **TRANSFORM** clause is powerful because transformations are stored with the model and **automatically applied during ML.PREDICT**. You do not need to re-apply the same feature engineering at prediction time. Know the key transform functions: ML.STANDARD\_SCALER, ML.BUCKETIZE, ML.FEATURE\_CROSS, ML.QUANTILE\_BUCKETIZE.

## 03. AI/ML Data Preparation

### Embeddings and Vector Search

BigQuery supports generating and searching **text embeddings** using remote models connected to Vertex AI. This enables semantic search, similarity matching, and RAG directly in SQL.

```
-- Create a remote model connection to Vertex AI embeddings
CREATE OR REPLACE MODEL `project.dataset.embedding_model`
REMOTE WITH CONNECTION `us.vertex-ai-connection`
OPTIONS (
  endpoint = 'text-embedding-005'
);

-- Generate embeddings for documents
CREATE TABLE `project.dataset.doc_embeddings` AS
SELECT
  doc_id,
  title,
  content,
  ml_generate_embedding_result AS embedding
FROM ML.GENERATE_EMBEDDING(
  MODEL `project.dataset.embedding_model`,
  (SELECT doc_id, title, content FROM `project.dataset.documents`),
  STRUCT(TRUE AS flatten_json_output)
);

-- Vector search: Find similar documents
SELECT
  base.doc_id,
  base.title,
  distance
FROM VECTOR_SEARCH(
  TABLE `project.dataset.doc_embeddings`,
  'embedding',
  (SELECT ml_generate_embedding_result AS embedding
   FROM ML.GENERATE_EMBEDDING(
     MODEL `project.dataset.embedding_model`,
     (SELECT 'How to optimize BigQuery costs' AS content)
   )),
  top_k => 5,
  distance_type => 'COSINE'
);
```

### Retrieval-Augmented Generation (RAG)

RAG combines vector search with LLM generation to produce answers grounded in your data:

```
-- RAG pattern in BigQuery SQL
-- Step 1: Retrieve relevant documents via vector search
-- Step 2: Pass context + question to LLM

WITH relevant_docs AS (
  SELECT base.content, distance
  FROM VECTOR_SEARCH(
    TABLE `project.dataset.doc_embeddings`, 'embedding',
    (SELECT ml_generate_embedding_result AS embedding
     FROM ML.GENERATE_EMBEDDING(
       MODEL `project.dataset.embedding_model`,
       (SELECT 'What are BigQuery partitioning best practices?' AS content)
     )),
    top_k => 3
  )
)
SELECT ml_generate_text_llm_result AS answer
FROM ML.GENERATE_TEXT(
  MODEL `project.dataset.gemini_model`,
  (SELECT CONCAT(
    'Based on the following documentation, answer the question.\n\n',
    'Documentation:\n',
    (SELECT STRING_AGG(content, '\n---\n') FROM relevant_docs),
    '\n\nQuestion: What are BigQuery partitioning best practices?'
  ) AS prompt),
  STRUCT(0.2 AS temperature, 1024 AS max_output_tokens)
);
```

## 04. Data Sharing

### Analytics Hub

Analytics Hub enables secure, governed data sharing across organizations without copying data:

#### Data Exchange

A container for listings. Can be public (open to all) or private (restricted to specific organizations). Managed by exchange administrators.

#### Listing

A published dataset within an exchange. Includes description, documentation, sample queries, and access request flow.

#### Linked Dataset

When a subscriber accesses a listing, they get a linked (read-only) dataset. Zero-copy: queries read from the publisher's storage. No data duplication.

#### Access Control

Publishers control who can subscribe. Row-level and column-level security is enforced. The publisher pays for storage; subscribers pay for queries.

### Authorized Views and Datasets

For simpler sharing within an organization, **authorized views** grant access to a view without granting access to the underlying tables:

```
-- Create a view that filters sensitive data
CREATE VIEW `project.shared_dataset.public_orders` AS
SELECT
  order_id,
  order_date,
  product_category,
  quantity,
  region
  -- Excludes: customer_name, email, payment_info
FROM `project.raw_dataset.orders`;

-- Authorize the view to read from raw_dataset
-- (done in Console or via API: authorize the view in raw_dataset settings)
-- Now users with access to shared_dataset.public_orders
-- can query the view without access to raw_dataset.orders
```

## 05. Data Security and Privacy

### Cloud DLP (Sensitive Data Protection)

Sensitive Data Protection provides APIs for discovering, classifying, and de-identifying sensitive data:

| Operation | Description | Example |
| --- | --- | --- |
| **Inspection** | Scan data to find sensitive information types (PII) | Find all SSNs, credit card numbers, email addresses in a BigQuery table |
| **De-identification** | Transform data to remove or obscure sensitive information | Replace SSN with token, mask email domain, redact phone numbers |
| **Re-identification** | Reverse de-identification (with proper keys) | Recover original SSN from token for authorized users |
| **Risk Analysis** | Assess re-identification risk of a dataset | k-anonymity, l-diversity, k-map analysis |

```
# DLP inspection job: Find PII in a BigQuery table
gcloud dlp jobs create \
  --project=my-project \
  --inspect-config='{
    "infoTypes": [
      {"name": "EMAIL_ADDRESS"},
      {"name": "PHONE_NUMBER"},
      {"name": "US_SOCIAL_SECURITY_NUMBER"},
      {"name": "CREDIT_CARD_NUMBER"}
    ],
    "minLikelihood": "LIKELY"
  }' \
  --storage-config='{
    "bigQueryOptions": {
      "tableReference": {
        "projectId": "my-project",
        "datasetId": "raw_data",
        "tableId": "customers"
      }
    }
  }' \
  --actions='[{"savingsFindings": {"outputConfig": {"table": {"projectId": "my-project", "datasetId": "dlp_results", "tableId": "findings"}}}}]'
```

### Dynamic Data Masking

BigQuery **dynamic data masking** allows you to define masking rules on columns using policy tags. Different users see different levels of data based on their IAM permissions:

```
-- Dynamic data masking with policy tags
-- 1. Create a taxonomy and policy tag in Data Catalog
-- 2. Add masking rules to the policy tag:
--    - SHA256 hash (for joining without revealing values)
--    - Nulling (replace with NULL)
--    - Default masking (replace with type-appropriate masked value)
--    - Custom (apply a UDF for custom masking logic)

-- 3. Apply the policy tag to a column
ALTER TABLE `project.dataset.customers`
ALTER COLUMN email SET POLICY TAG
  'projects/my-project/locations/us/taxonomies/123/policyTags/456';

-- Users WITHOUT datacatalog.categoryFineGrainedReader see:
--   email: "****@****.***"  (masked)
-- Users WITH datacatalog.categoryFineGrainedReader see:
--   email: "john@example.com"  (actual value)
```

>**Exam Tip:** **Dynamic data masking** vs **Cloud DLP de-identification**: Use masking when different users need different visibility on the same live table (policy tag approach). Use DLP de-identification when you need to create a sanitized copy of the data for broader access (e.g., anonymized dataset for analytics).

## 06. Exam Tips
>**Scenario: Fast Dashboards:** "Looker Studio dashboards on a 10 TB BigQuery table are too slow." → Create **materialized views** for common aggregations and enable **BI Engine** with a reservation sized to cache the materialized views. Also ensure the base table is partitioned and clustered on dashboard filter columns.
>**Scenario: ML Without Data Movement:** "Data analysts need to build ML models on BigQuery data without learning Python or moving data." → **BigQuery ML**. Train models with SQL using CREATE MODEL, evaluate with ML.EVALUATE, predict with ML.PREDICT. Use TRANSFORM for feature engineering.
>**Scenario: Share Data with Partners:** "Share curated datasets with external partners without data duplication or ongoing ETL." → **Analytics Hub**. Publish a listing; partners subscribe and get a linked dataset (zero-copy). Publisher controls access and pays for storage; subscriber pays for queries.
>**Scenario: PII in Different Teams:** "Marketing needs customer data but should not see SSN or credit card numbers. Analytics needs full access." → Use **dynamic data masking** with policy tags. Apply masking rules to SSN and credit card columns. Grant `datacatalog.categoryFineGrainedReader` only to analytics team.
>**Scenario: Semantic Search on Documents:** "Enable semantic search across millions of documents stored in BigQuery." → Use **BigQuery ML + VECTOR\_SEARCH**. Generate embeddings with ML.GENERATE\_EMBEDDING (remote model to Vertex AI), store in a BQ table, and use VECTOR\_SEARCH for similarity queries.

Previous

[← Storing the Data](03-storing-the-data.html)

Next Section

[Maintaining Data Workloads →](05-maintaining-data-workloads.html)