---
title: "Data Engineering for BigQuery ML"
slug: "data-engineering-bqml"
description: "Building accurate ML models starts long before training. This module covers the full data transformation
    pipeline on GCP — from raw ingestion through Cloud Dataprep and Dataflow, to clean, partitioned,
    feature-rich tables ready for BQML. Covers exam Sections 1 and 2: data engineering and fea"
section: "gcp-mle"
order: 5
badges:
  - "Data Transformation Pipelines"
  - "Dataprep & Dataflow"
  - "Data Quality & Validation"
  - "Feature Engineering in SQL"
  - "Cost Optimization"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/05-data-engineering-bqml.ipynb"
---

## 01. Data Transformation Pipeline on GCP

![Diagram 1](/diagrams/gcp-mle/data-engineering-bqml-1.svg)

Figure 1 — Data flows from raw sources through ingestion, transformation, and validation before landing in optimized BigQuery tables for BQML training.

### End-to-End Overview

A data transformation pipeline for ML on GCP typically involves four stages: **ingestion** (landing raw data from Cloud Storage, Pub/Sub, or external sources), **cleaning and transformation** (handling missing values, type casting, deduplication), **feature engineering** (creating derived columns, encoding categoricals, generating time-based features), and **loading** into BigQuery with proper partitioning and clustering for efficient ML queries.

GCP offers multiple tools for each stage. The key exam skill is knowing **which tool to use when**. The decision depends on the complexity of the transformation, the data volume, whether the pipeline is batch or streaming, and the team's technical skill level.

### Tool Selection Guide

🔧

#### Cloud Dataprep

Visual, no-code data wrangling. Best for analysts and data scientists who need to explore and clean data interactively. Powered by Trifacta. Runs on Dataflow under the hood.

⚡

#### Cloud Dataflow

Fully managed Apache Beam runner. Best for complex, programmatic ETL pipelines (batch or streaming). Auto-scaling, exactly-once processing. Use when Dataprep is too limited.

📊

#### BigQuery SQL

In-place transformations using SQL. Best for feature engineering directly in the data warehouse. No infrastructure to manage. Ideal for BQML preprocessing.

🚀

#### Cloud Dataproc

Managed Spark/Hadoop clusters. Best when you have existing Spark jobs or need Spark ML libraries. Use for heavy distributed transformations when Beam is not suitable.

>**Exam Tip:** The exam frequently tests tool selection. Remember: Dataprep = visual/no-code, Dataflow = programmatic batch+streaming, BigQuery = SQL transforms, Dataproc = existing Spark workloads. If the question mentions "analyst" or "no-code," pick Dataprep. If it says "streaming" or "real-time," pick Dataflow.

## 02. Cloud Dataprep (Trifacta)

### Concepts and Recipes

**Cloud Dataprep** is a managed, serverless data wrangling service powered by Trifacta. It provides a visual interface for exploring, cleaning, and transforming structured and semi-structured data. There is no code to write — transformations are built interactively through the UI and compiled into **recipes**.

A **recipe** is an ordered set of transformation steps. Each step is a "wrangle" that performs an operation: rename a column, filter rows, split a field, compute a derived column, join datasets, or aggregate. Dataprep automatically profiles the data as you work, showing distributions, missing value counts, and type mismatches. This visual feedback loop makes it excellent for exploratory data preparation.

Under the hood, when you run a Dataprep job, it compiles the recipe into a **Dataflow pipeline** and executes it on managed infrastructure. This means Dataprep gets the scalability of Dataflow without requiring you to write Apache Beam code. Output can be written to BigQuery, Cloud Storage (CSV, JSON, Avro, Parquet), or other sinks.

**Scheduling** is supported natively. You can set up recurring jobs (daily, hourly) that automatically run recipes against new data as it arrives in Cloud Storage. This turns a one-time interactive cleanup into a production pipeline.

### When to Use Dataprep

-   Data exploration and profiling before building a full pipeline
-   Teams without Beam/Spark programming expertise
-   Ad-hoc data cleaning where the transformations may change frequently
-   Small to medium datasets where interactive feedback is valuable
-   Complex multi-source joins with custom logic (use Dataflow instead)
-   Real-time streaming pipelines (use Dataflow instead)
-   Custom ML preprocessing (use tf.Transform or BigQuery SQL instead)

>**Key Distinction:** Dataprep is for **interactive data preparation**. Dataflow is for **production-grade programmatic pipelines**. They are complementary: many teams prototype in Dataprep, then graduate complex flows to Dataflow when requirements grow.

## 03. Dataflow & Apache Beam ETL

### Apache Beam Core Concepts

**Apache Beam** is a unified programming model for both batch and streaming data processing. Google Cloud **Dataflow** is a fully managed runner for Beam pipelines. When you write a Beam pipeline and submit it to Dataflow, Google handles autoscaling, worker provisioning, and fault tolerance.

The core abstractions in Apache Beam are:

**Pipeline**: The top-level container that encapsulates the entire data processing workflow. You create a Pipeline object, add transforms to it, and then run it.

**PCollection**: An immutable, distributed dataset. Every transform takes one or more PCollections as input and produces one or more PCollections as output. PCollections can be bounded (batch) or unbounded (streaming).

**PTransform**: A data processing operation. Built-in transforms include `Map` (apply a function to every element), `ParDo` (parallel do — a generalized per-element transform that can output zero, one, or many elements), `GroupByKey` (group elements by key), `CoGroupByKey` (join two PCollections by key), `Flatten` (merge multiple PCollections), and `Combine` (aggregate with a combiner function).

**ParDo** is the most flexible transform. You subclass `DoFn` and implement a `process()` method. Each element in the input PCollection is passed to process(), which can yield zero or more output elements. This is used for filtering, parsing, enrichment, and complex transformations.

**GroupByKey** takes a PCollection of key-value pairs and groups all values for the same key together. This is essential for aggregations, sessionization, and any operation that requires seeing all data for a given entity.

```
# Apache Beam pipeline: read CSV, transform, write to BigQuery
import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions

class ParseCSV(beam.DoFn):
    def process(self, line):
        fields = line.split(',')
        yield {
            'user_id': fields[0],
            'event_type': fields[1],
            'amount': float(fields[2]) if fields[2] else 0.0,
            'timestamp': fields[3]
        }

class FilterInvalid(beam.DoFn):
    def process(self, record):
        if record['amount'] > 0 and record['user_id']:
            yield record

with beam.Pipeline(options=PipelineOptions()) as p:
    (p
     | 'Read' >> beam.io.ReadFromText('gs://bucket/raw/*.csv')
     | 'Parse' >> beam.ParDo(ParseCSV())
     | 'Filter' >> beam.ParDo(FilterInvalid())
     | 'WriteBQ' >> beam.io.WriteToBigQuery(
           'project:dataset.table',
           schema='user_id:STRING,event_type:STRING,amount:FLOAT,timestamp:TIMESTAMP',
           write_disposition=beam.io.BigQueryDisposition.WRITE_APPEND)
    )
```

### ETL Pipeline to BigQuery

A typical Dataflow ETL pipeline for ML follows this pattern: **Read** from Cloud Storage or Pub/Sub, **Parse** raw records (CSV, JSON, Avro), **Clean** (handle nulls, deduplicate, validate types), **Transform** (derive features, aggregate, join enrichment data), and **Write** to BigQuery with a defined schema.

For **batch pipelines**, Dataflow processes all available data and terminates. For **streaming pipelines**, you use windowing (fixed, sliding, session) to group unbounded data into finite chunks for processing. Streaming is needed when data arrives continuously from Pub/Sub and must be available in BigQuery with low latency.

>**Best Practice:** Use `beam.io.WriteToBigQuery` with `WRITE_APPEND` for incremental loads and `WRITE_TRUNCATE` for full refreshes. For streaming, use `method='STREAMING_INSERTS'` for low-latency or `method='FILE_LOADS'` for cost-effective batched micro-loads.

## 04. Data Quality

### Handling Missing Values and Outliers

Missing data is one of the most common data quality issues in ML. The approach depends on the **missing mechanism**: Missing Completely At Random (MCAR), Missing At Random (MAR), or Missing Not At Random (MNAR). For ML on GCP, the practical strategies are:

**Drop rows**: Acceptable when the percentage of missing data is small (<5%) and the missingness is MCAR. In BigQuery: `WHERE column IS NOT NULL`.

**Impute with statistics**: Replace missing values with mean, median, or mode. Use median for skewed distributions, mode for categoricals. In BigQuery: `IFNULL(column, AVG(column) OVER())` or use `ML.IMPUTER` in BQML preprocessing.

**Indicator variables**: Create a binary flag `column_is_missing` and impute the value. This lets the model learn that missingness itself carries information.

For **outliers**, use IQR-based filtering: values beyond 1.5 \* IQR from Q1/Q3 are capped or removed. In BigQuery, use `PERCENTILE_CONT` to compute quartiles. For ML, capping (winsorization) is often preferable to removal because it preserves sample size.

```
-- Handling missing values and outliers in BigQuery
WITH stats AS (
  SELECT
    PERCENTILE_CONT(amount, 0.25) OVER() AS q1,
    PERCENTILE_CONT(amount, 0.75) OVER() AS q3,
    AVG(amount) OVER() AS avg_amount
  FROM `project.dataset.raw_table`
)
SELECT
  user_id,
  -- Impute missing with mean
  IFNULL(amount, avg_amount) AS amount_imputed,
  -- Flag for missingness
  IF(amount IS NULL, 1, 0) AS amount_is_missing,
  -- Cap outliers using IQR
  GREATEST(LEAST(amount, q3 + 1.5 * (q3 - q1)), q1 - 1.5 * (q3 - q1)) AS amount_capped
FROM `project.dataset.raw_table`, stats;
```

### Class Imbalance

Class imbalance occurs when one label dominates the dataset (e.g., 95% non-fraud, 5% fraud). This is critical for ML because models trained on imbalanced data tend to predict the majority class. Strategies in the GCP context:

**BQML auto\_class\_weights**: Set `OPTIONS(auto_class_weights=TRUE)` in your `CREATE MODEL` statement. BQML will automatically weight minority class samples higher during training.

**Oversampling the minority class**: Duplicate minority class rows in SQL. Use `UNION ALL` to append copies of minority samples.

**Undersampling the majority class**: Randomly sample a subset of majority class rows. Use `WHERE RAND() < desired_ratio` on the majority class.

**SMOTE**: For more sophisticated oversampling, export data and use Python (imbalanced-learn library), then re-import. Not natively available in BigQuery.

>**Exam Tip:** When an exam question describes a classification problem with heavily skewed labels, the best BQML-native answer is `auto_class_weights=TRUE`. If the question mentions custom sampling logic, consider exporting to Python or using SQL-based over/undersampling.

## 05. Feature Engineering for BQML

### Derived Features

Feature engineering in BigQuery is done entirely in SQL. This makes it accessible and scalable — BigQuery handles the distributed computation. Common patterns for derived features:

**Arithmetic combinations**: Ratios, differences, products of existing columns. Example: `total_spend / visit_count AS avg_spend_per_visit`.

**Time-based features**: Extract temporal components from timestamps. `EXTRACT(DAYOFWEEK FROM timestamp)`, `EXTRACT(HOUR FROM timestamp)`, `DATE_DIFF(CURRENT_DATE(), signup_date, DAY) AS account_age_days`.

**Window functions for aggregations**: Compute rolling averages, cumulative sums, or lag features. `AVG(amount) OVER(PARTITION BY user_id ORDER BY date ROWS BETWEEN 7 PRECEDING AND CURRENT ROW)` gives a 7-day rolling average per user.

**Binning / Bucketizing**: Use `CASE WHEN` or `ML.BUCKETIZE` to convert continuous features into categorical bins. Example: age ranges (0-17, 18-34, 35-54, 55+).

```
-- Feature engineering in BigQuery SQL
SELECT
  user_id,
  -- Derived ratio
  total_purchases / NULLIF(total_visits, 0) AS purchase_rate,
  -- Time-based features
  EXTRACT(DAYOFWEEK FROM last_activity) AS last_active_dow,
  EXTRACT(HOUR FROM last_activity) AS last_active_hour,
  DATE_DIFF(CURRENT_DATE(), signup_date, DAY) AS account_age_days,
  -- Rolling 30-day average
  AVG(daily_spend) OVER(
    PARTITION BY user_id
    ORDER BY activity_date
    ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
  ) AS avg_spend_30d,
  -- Bucketize age
  CASE
    WHEN age < 18 THEN 'under_18'
    WHEN age < 35 THEN '18_34'
    WHEN age < 55 THEN '35_54'
    ELSE '55_plus'
  END AS age_group,
  label
FROM `project.dataset.user_activity`;
```

### Encoding Categorical Variables

BQML handles categorical encoding automatically for many model types. When you pass a `STRING` column to a BQML model, it applies one-hot encoding by default. However, understanding the encoding options is important:

**Automatic one-hot**: BQML does this for logistic regression and linear models. Simply include the string column in your `SELECT`.

**ML.FEATURE\_CROSS**: Creates interaction features between two or more categoricals. `ML.FEATURE_CROSS(STRUCT(city, device_type)) AS city_device` captures patterns like "mobile users in New York behave differently than desktop users in New York."

**ML.HASH\_BUCKETS**: For high-cardinality categoricals (e.g., user IDs, URLs), hashing maps values into a fixed number of buckets. This prevents the dimensionality explosion of one-hot encoding.

>**BQML Transform Clause:** Use the `TRANSFORM` clause in `CREATE MODEL` to define feature engineering as part of the model definition. This ensures the same transformations are applied during both training and prediction, avoiding training-serving skew.

```
-- BQML model with TRANSFORM clause for feature engineering
CREATE OR REPLACE MODEL `project.dataset.churn_model`
TRANSFORM(
  ML.FEATURE_CROSS(STRUCT(region, plan_type)) AS region_plan,
  ML.BUCKETIZE(account_age_days, [30, 90, 180, 365]) AS age_bucket,
  ML.HASH_BUCKETS(referral_source, 20) AS referral_hash,
  purchase_rate,
  avg_spend_30d,
  label
)
OPTIONS(
  model_type='LOGISTIC_REG',
  auto_class_weights=TRUE,
  input_label_cols=['label']
) AS
SELECT * FROM `project.dataset.features_table`;
```

## 06. Data Validation Patterns

### Schema Validation

Schema validation ensures that incoming data matches the expected structure before it enters your ML pipeline. On GCP, this involves several layers:

**BigQuery schema enforcement**: BigQuery tables have defined schemas. Inserting data with wrong types or missing required fields will fail. Define schemas explicitly rather than relying on auto-detection for ML tables.

**TensorFlow Data Validation (TFDV)**: Part of TFX, TFDV generates a schema from training data and validates new data against it. It detects anomalies like unexpected categories, missing features, type mismatches, and distribution changes. Integrates with Dataflow for scale.

**Custom SQL validation**: Run assertion queries before training. Check row counts, null percentages, value ranges, and referential integrity. Schedule these as pre-training checks in your pipeline.

```
-- Data validation queries in BigQuery
-- Check for unexpected nulls in required columns
SELECT
  COUNTIF(user_id IS NULL) AS null_user_ids,
  COUNTIF(amount IS NULL) AS null_amounts,
  COUNTIF(label IS NULL) AS null_labels,
  COUNT(*) AS total_rows,
  COUNTIF(amount < 0) AS negative_amounts
FROM `project.dataset.training_data`;

-- Check label distribution for unexpected imbalance
SELECT
  label,
  COUNT(*) AS cnt,
  ROUND(COUNT(*) / SUM(COUNT(*)) OVER(), 4) AS pct
FROM `project.dataset.training_data`
GROUP BY label;
```

### Data Drift Detection

**Data drift** occurs when the statistical properties of the input data change over time, causing model performance to degrade. There are two types:

**Feature drift** (covariate shift): The distribution of input features changes. Example: user demographics shift because you expanded to a new market.

**Concept drift**: The relationship between features and the target changes. Example: customer churn patterns change due to a new competitor entering the market.

On GCP, you can detect drift using **Vertex AI Model Monitoring**, which automatically compares prediction-time feature distributions against training-time baselines. It uses statistical tests (Jensen-Shannon divergence for categoricals, L-infinity distance for numericals) and alerts when drift exceeds a configurable threshold. For BQML workloads, you can build custom drift monitoring with SQL — compare current feature statistics against stored baselines.

>**TFDV Pipeline:** TensorFlow Data Validation (TFDV) can run as a Dataflow pipeline to validate millions of records at scale. Generate a schema from training data using `tfdv.generate_statistics_from_csv()`, then validate new batches with `tfdv.validate_statistics()`. Anomalies are surfaced as structured reports.

## 07. BigQuery Partitioning & Clustering

### Design Patterns for ML Workloads

Proper table design in BigQuery directly impacts both query cost and ML training performance. The two key mechanisms are **partitioning** and **clustering**.

**Partitioning** divides a table into segments based on a column value. BigQuery supports three partition types: **time-unit** (DATE, TIMESTAMP, or DATETIME column), **ingestion-time** (`_PARTITIONTIME` pseudo-column), and **integer-range** (a specified integer column with start, end, interval). When a query filters on the partition column, BigQuery only scans the relevant partitions — this is called **partition pruning**.

**Clustering** sorts data within each partition by one or more columns (up to four). When a query filters or joins on clustered columns, BigQuery can skip blocks of data that don't match, reducing bytes scanned. Clustering is most effective with high-cardinality columns.

For ML workloads: partition by date (when training data is time-series or you want to train on recent data windows) and cluster by the columns you frequently filter on (e.g., `user_id`, `region`, `label`).

```
-- Create a partitioned and clustered table for ML
CREATE OR REPLACE TABLE `project.dataset.ml_features`
PARTITION BY DATE(event_timestamp)
CLUSTER BY user_id, region
AS
SELECT
  user_id,
  region,
  event_timestamp,
  purchase_rate,
  avg_spend_30d,
  account_age_days,
  label
FROM `project.dataset.raw_features`;
```

### Query Optimization

To benefit from partitioning, always include the partition column in your `WHERE` clause. For ML training, this often means filtering to a specific date range:

```
-- Train BQML model on last 90 days only (partition pruning)
CREATE OR REPLACE MODEL `project.dataset.churn_model`
OPTIONS(model_type='LOGISTIC_REG', input_label_cols=['label'])
AS
SELECT * FROM `project.dataset.ml_features`
WHERE event_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY);
```

>**Exam Tip:** Partition pruning only works when you filter on the partition column directly. Using a function on the partition column (e.g., `YEAR(partition_date) = 2024`) may prevent pruning. Use direct comparisons: `partition_date BETWEEN '2024-01-01' AND '2024-12-31'`.

## 08. Cost Optimization

### Slot Reservations and Pricing Models

BigQuery offers two pricing models for compute:

**On-demand pricing**: Pay per TB of data scanned ($6.25/TB as of current pricing). Best for sporadic or unpredictable workloads. No upfront commitment. Each project gets up to 2,000 concurrent slots by default.

**Capacity pricing (Editions)**: Purchase dedicated slot capacity with commitments (flex, monthly, annual). Slots are units of compute — a slot is one unit of CPU and memory. You pay for slots regardless of how much data you scan. Best for teams with consistent, heavy query loads where on-demand costs would be high.

**BigQuery Editions** (Standard, Enterprise, Enterprise Plus) provide autoscaling slots with a baseline and maximum. This gives predictable costs with the ability to burst when needed.

For **ML training costs**, BQML model training uses slots like any other query. A complex model training on a large table may consume significant slot-hours. Monitor with `INFORMATION_SCHEMA.JOBS` to track slot usage and total bytes billed per training job.

### Storage Cost Management

BigQuery storage costs are: **Active storage** ($0.02/GB/month) for data modified in the last 90 days, and **Long-term storage** ($0.01/GB/month) for data not modified in 90+ days (automatic transition, no performance change).

Cost reduction strategies for ML:

-   Use partitioning and clustering to reduce bytes scanned per query
-   Set partition expiration to auto-delete old training data
-   Use `SELECT specific_columns` instead of `SELECT *`
-   Materialize commonly used feature views as tables rather than views
-   Use `--dry_run` flag to estimate costs before running expensive queries
-   Archive old model versions and intermediate training tables

>**Cost Formula:** On-demand cost = (bytes\_scanned / 1TB) \* $6.25. A BQML training query on a 500GB table with proper partitioning that prunes to 50GB costs: (50/1000) \* $6.25 = $0.31. Without partitioning, the same query scans 500GB: $3.13. Partitioning delivers 10x savings.

## 09. Exam Focus

This section summarizes the high-yield exam topics for Sections 1 and 2 of the GCP Professional ML Engineer exam relating to data engineering.

🎯

#### ETL Tool Selection

**Dataprep** = visual, no-code, analyst-friendly. **Dataflow** = programmatic, Beam, batch+streaming. **Dataproc** = existing Spark. **BigQuery SQL** = in-warehouse transforms. Match the tool to the persona and use case in the question.

🎯

#### Data Quality

Missing values: impute (mean/median for numeric, mode for categorical) or drop if <5%. Class imbalance: `auto_class_weights=TRUE` in BQML. Outliers: cap using IQR method. Know when each strategy is appropriate.

🎯

#### Feature Engineering in SQL

BQML `TRANSFORM` clause ensures training-serving consistency. `ML.FEATURE_CROSS` for interactions. `ML.BUCKETIZE` for binning. `ML.HASH_BUCKETS` for high-cardinality categoricals. Window functions for rolling aggregates.

🎯

#### Partitioning & Clustering

Partition by date for time-series ML data. Cluster by frequently filtered columns. Partition pruning requires direct filter on partition column. Reduces cost and speeds up training queries. Know the difference between partition types.

🎯

#### Data Validation

TFDV for automated schema validation at scale. Vertex AI Model Monitoring for drift detection in production. SQL assertions for custom validation checks. Schema enforcement in BigQuery prevents type errors.

🎯

#### Beam Concepts

PCollection = immutable dataset. ParDo = per-element transform (DoFn). GroupByKey = group by key. Pipeline = container. Know batch vs streaming, windowing concepts, and when to use Dataflow vs Dataproc.

>**Common Exam Traps:** 1) Dataprep vs Dataflow: Dataprep is NOT code — it is visual. If the question says "write custom logic," choose Dataflow. 2) BQML handles categorical encoding automatically for strings — you do NOT need to one-hot encode manually. 3) Partition pruning requires filtering on the partition column, not a derived expression. 4) `auto_class_weights` is the simplest BQML answer for imbalance.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Data engineering for ML on GCP is about building **reliable, cost-efficient pipelines** that transform raw data into clean, feature-rich tables ready for training. The stack centers on three tools: **Cloud Dataprep** for visual, no-code wrangling by analysts; **Dataflow** (Apache Beam) for programmatic, scalable batch and streaming ETL; and **BigQuery** for in-warehouse SQL transformations and BQML training. Data quality is enforced through schema validation (TFDV), missing-value imputation, and outlier capping. Features are engineered directly in SQL using BQML's `TRANSFORM` clause, which guarantees training-serving consistency. Tables are **partitioned** by date and **clustered** by high-cardinality filter columns to minimize scan costs — partition pruning alone can deliver 10x cost savings. The entire pipeline is orchestrated by **Cloud Composer** (managed Airflow), which handles scheduling, retries, and dependency management across services. Understanding this end-to-end flow — ingestion, cleaning, feature engineering, partitioning, and orchestration — is essential for building production ML systems that are both performant and cost-effective.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| When would you choose Dataflow over Dataprep for an ETL pipeline? | Do you understand the no-code vs programmatic tradeoff and when custom logic requires Beam? |
| How does Cloud Composer orchestrate an ML pipeline? | Can you describe DAGs, task dependencies, retry policies, and how Airflow coordinates GCP services? |
| What is partition pruning in BigQuery and why does it matter for ML? | Do you understand how partitioning reduces cost and speeds up training data queries? |
| How do you handle missing values and class imbalance in a BQML workflow? | Can you articulate imputation strategies and `auto_class_weights` in practical terms? |
| Explain the role of the BQML TRANSFORM clause and why it prevents training-serving skew. | Do you understand how embedding preprocessing in the model graph ensures consistency at prediction time? |

### Model Answers

>**Q1 — Dataflow vs Dataprep:** **Dataprep** is a visual, no-code tool built for analysts who need to explore, clean, and reshape data without writing code. It auto-generates Dataflow jobs under the hood. **Dataflow** is the programmatic option using Apache Beam — you write ParDo transforms, handle windowing for streaming data, and implement custom business logic that cannot be expressed visually. Choose Dataprep when the task is interactive exploration and simple cleaning. Choose Dataflow when you need custom Python/Java logic, streaming pipelines, or CI/CD integration. Choose Dataproc if you have existing Spark/Hadoop code to migrate.
>**Q2 — Cloud Composer Orchestration:** Cloud Composer is managed Apache Airflow. You define a **DAG** (directed acyclic graph) where each node is a task — e.g., run a Dataflow job, execute a BigQuery query, trigger a BQML training run. Composer handles scheduling (cron-based or event-driven), retries on failure, SLA alerts, and cross-service authentication via service accounts. For ML pipelines, a typical DAG might be: ingest from GCS → validate schema with TFDV → run Dataflow transforms → load into partitioned BigQuery table → train BQML model → evaluate and promote. The key advantage over manual scripts is **idempotency and observability** — every run is logged, failures are isolated, and retries do not duplicate data.
>**Q3 — Partition Pruning:** BigQuery tables can be **partitioned** by a date/timestamp column (or integer range), splitting data into physical segments. When a query filters on the partition column (e.g., `WHERE event_date BETWEEN '2024-01-01' AND '2024-03-31'`), BigQuery only scans those partitions — this is **partition pruning**. For a 500 GB table where your training query only needs 3 months of data (50 GB), pruning reduces cost from $3.13 to $0.31 at on-demand pricing. **Clustering** further sorts data within partitions by specified columns, enabling block-level pruning for additional savings. The critical rule: the filter must be on the partition column directly, not a derived expression, or pruning will not activate.
>**Q4 — Missing Values and Class Imbalance:** For **missing values**: if less than 5% of rows are affected, drop them. Otherwise, impute — mean/median for numeric columns, mode for categorical. In BigQuery SQL, use `IFNULL(col, avg_value)` or `COALESCE`. For **class imbalance**, BQML provides `auto_class_weights=TRUE`, which automatically upweights the minority class during training proportional to class frequency. This is the simplest and most exam-relevant solution. For severe imbalance, you can also undersample the majority class or use SMOTE-like techniques in a Dataflow preprocessing step, but BQML's built-in option is usually the best first approach.
>**Q5 — BQML TRANSFORM Clause:** The `TRANSFORM` clause in a BQML `CREATE MODEL` statement defines feature preprocessing steps — such as `ML.BUCKETIZE`, `ML.FEATURE_CROSS`, or `ML.HASH_BUCKETS` — that are **saved as part of the model graph**. This means when you call `ML.PREDICT`, the exact same transformations are applied to raw input data automatically. Without TRANSFORM, you would need to replicate preprocessing logic in your serving pipeline, creating risk of **training-serving skew** where slight differences in transformation code cause silent prediction errors. The TRANSFORM clause eliminates this by making preprocessing and prediction a single atomic operation.

### System Design Scenario

>**Design Challenge:** **Scenario:** Your e-commerce company receives 50 million clickstream events per day from web and mobile. You need to build a pipeline that transforms this raw data into daily-updated training tables for a BQML recommendation model, with end-to-end latency under 2 hours and monthly cost under $500.  
>   
> **A strong answer covers:** (1) Ingestion — stream events via Pub/Sub into a GCS landing zone or directly into BigQuery streaming inserts. (2) Transformation — Dataflow batch job (triggered by Composer) to sessionize clicks, compute features (session duration, pages per session, category affinity scores), and handle late-arriving data with watermarks. (3) Storage — BigQuery table partitioned by event\_date and clustered by user\_id for efficient per-user queries. (4) Feature engineering — BQML TRANSFORM clause with ML.BUCKETIZE for session duration bins and ML.FEATURE\_CROSS for user\_segment x product\_category. (5) Cost control — partition pruning to limit training scans to the last 90 days, flat-rate slots if query volume justifies it, and Dataflow autoscaling with maxWorkers cap. (6) Orchestration — Cloud Composer DAG: ingest → validate → transform → train → evaluate → deploy, with Slack alerts on failure.

### Common Mistakes

-   **Confusing Dataprep with Dataflow** — Dataprep is a visual, no-code UI that generates Dataflow jobs. It is not a coding tool. If an interview question mentions "write custom transformation logic" or "streaming pipeline," the answer is Dataflow (Beam), not Dataprep. Candidates who conflate the two signal they have not used either tool hands-on.
-   **Filtering on derived expressions and expecting partition pruning** — A query like `WHERE EXTRACT(YEAR FROM event_date) = 2024` does NOT trigger partition pruning because BigQuery cannot map the expression back to partition boundaries. You must filter directly on the partition column: `WHERE event_date BETWEEN '2024-01-01' AND '2024-12-31'`. This is a subtle but costly mistake in both cost and interview credibility.
-   **Manually encoding categoricals for BQML** — BQML automatically one-hot encodes string columns during training. Candidates who describe building a manual one-hot encoding step in SQL are adding unnecessary complexity and showing unfamiliarity with BQML's built-in feature handling. The same applies to label encoding — BQML handles it internally.

Previous

[← 04 · BigQuery ML](04-bigquery-ml.html)

Next

[06 · Feature Engineering →](06-feature-engineering.html)