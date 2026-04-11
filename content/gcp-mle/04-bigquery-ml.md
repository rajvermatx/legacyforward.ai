---
title: "Train ML Models with SQL in BigQuery"
slug: "bigquery-ml"
description: "BigQuery ML lets you create, evaluate, and predict with machine learning models using standard SQL
    — no data movement, no separate training infrastructure. This module covers every model type,
    the CREATE MODEL syntax, feature engineering, evaluation metrics, and how to export
    models to V"
section: "gcp-mle"
order: 4
badges:
  - "CREATE MODEL"
  - "Model Types"
  - "Feature Engineering"
  - "ML.EVALUATE"
  - "Vertex AI Export"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/04-bigquery-ml.ipynb"
---

## 01. BigQuery ML Overview

BigQuery ML (BQML) allows you to create and execute machine learning models directly in BigQuery using standard SQL. The data stays in BigQuery — there is no need to export data to a separate training environment, dramatically reducing time-to-insight.

### Why BigQuery ML?

🚀

#### No Data Movement

Train models where the data lives. No ETL to a separate training service. Reduces latency and data governance risk.

📝

#### SQL Interface

Data analysts and SQL users can build ML models without Python or framework knowledge. Democratizes ML across the organization.

⚡

#### Automatic Preprocessing

BQML handles feature normalization, one-hot encoding of categoricals, and missing value imputation by default.

📈

#### Scales with BigQuery

Leverages BigQuery's distributed infrastructure. Models train on petabyte-scale datasets without managing infrastructure.

>**How It Works:** When you run `CREATE MODEL`, BigQuery allocates training resources, reads data from the specified query, trains the model, and stores it as a BigQuery model object. The model metadata, weights, and training statistics are all accessible via SQL functions like `ML.EVALUATE`, `ML.PREDICT`, and `ML.TRAINING_INFO`.

## 02. Supported Model Types

BQML supports a wide range of model types, from simple linear models to AutoML and imported TensorFlow models. The exam frequently tests your ability to choose the right model type for a given scenario.

### Complete Model Type Reference

| Model Type | SQL Keyword | Task | When to Use |
| --- | --- | --- | --- |
| **Linear Regression** | `LINEAR_REG` | Regression | Predict continuous values (price, revenue, duration). Fast training, interpretable. |
| **Logistic Regression** | `LOGISTIC_REG` | Classification | Binary or multiclass classification. Set `auto_class_weights=TRUE` for imbalanced data. |
| **K-Means Clustering** | `KMEANS` | Clustering | Customer segmentation, anomaly detection. Unsupervised — no label column needed. |
| **Matrix Factorization** | `MATRIX_FACTORIZATION` | Recommendation | Build recommendation systems from user-item interaction data (explicit or implicit feedback). |
| **ARIMA+** | `ARIMA_PLUS` | Time Series | Forecasting with automatic seasonality detection, holiday effects, and trend decomposition. |
| **Boosted Tree Classifier** | `BOOSTED_TREE_CLASSIFIER` | Classification | Higher accuracy than logistic regression for complex, non-linear classification tasks. |
| **Boosted Tree Regressor** | `BOOSTED_TREE_REGRESSOR` | Regression | Non-linear regression with feature interactions. Good default for tabular data. |
| **DNN Classifier** | `DNN_CLASSIFIER` | Classification | Deep neural network for complex classification. Requires more data and training time. |
| **DNN Regressor** | `DNN_REGRESSOR` | Regression | Deep neural network for complex regression. Good when linear/tree models underperform. |
| **AutoML Classifier** | `AUTOML_CLASSIFIER` | Classification | Automated model architecture search. Best accuracy with minimal configuration. Higher cost. |
| **AutoML Regressor** | `AUTOML_REGRESSOR` | Regression | Automated regression model. Use when you want maximum accuracy and budget allows. |
| **TensorFlow (imported)** | `TENSORFLOW` | Any | Import a pre-trained SavedModel for inference in BigQuery. No training in BQML. |
| **XGBoost** | `BOOSTED_TREE_*` | Any tabular | BQML's boosted tree implementation uses XGBoost under the hood. Same SQL syntax. |

>**Exam Tip:** The exam often presents a scenario and asks which model type to use. Key signals: **"forecast sales"** = ARIMA\_PLUS. **"segment customers"** = KMEANS. **"recommend products"** = MATRIX\_FACTORIZATION. **"predict churn (yes/no)"** = LOGISTIC\_REG or BOOSTED\_TREE\_CLASSIFIER. **"predict price"** = LINEAR\_REG or BOOSTED\_TREE\_REGRESSOR.

## 03. CREATE MODEL Syntax Deep Dive

The `CREATE MODEL` statement is the core of BigQuery ML. It combines model specification, hyperparameters, and training data in a single SQL statement.

### Basic Syntax

```
-- General CREATE MODEL syntax
CREATE OR REPLACE MODEL `project.dataset.model_name`
OPTIONS (
  model_type = 'LOGISTIC_REG',           -- Required: model type
  input_label_cols = ['target_column'],   -- Label column (supervised)
  auto_class_weights = TRUE,             -- Handle imbalanced classes
  data_split_method = 'AUTO_SPLIT',      -- AUTO_SPLIT, RANDOM, CUSTOM, SEQ, NO_SPLIT
  max_iterations = 20,                    -- Training iterations
  learn_rate = 0.1,                        -- Learning rate
  l1_reg = 0.001,                          -- L1 regularization
  l2_reg = 0.001,                          -- L2 regularization
  early_stop = TRUE,                      -- Stop when no improvement
  min_rel_progress = 0.01                  -- Minimum relative progress
) AS
SELECT
  feature1,
  feature2,
  feature3,
  target_column
FROM
  `project.dataset.training_table`
WHERE
  feature1 IS NOT NULL
```

### Classification Example (Logistic Regression)

```
-- Predict penguin species using logistic regression
CREATE OR REPLACE MODEL `my_dataset.penguin_classifier`
OPTIONS (
  model_type = 'LOGISTIC_REG',
  input_label_cols = ['species'],
  auto_class_weights = TRUE,
  max_iterations = 20
) AS
SELECT
  species,
  island,
  culmen_length_mm,
  culmen_depth_mm,
  flipper_length_mm,
  body_mass_g,
  sex
FROM
  `bigquery-public-data.ml_datasets.penguins`
WHERE
  body_mass_g IS NOT NULL
  AND sex IS NOT NULL
```

### Regression Example (Boosted Tree)

```
-- Predict taxi fare using boosted tree regression
CREATE OR REPLACE MODEL `my_dataset.taxi_fare_model`
OPTIONS (
  model_type = 'BOOSTED_TREE_REGRESSOR',
  input_label_cols = ['fare'],
  num_parallel_tree = 5,
  max_tree_depth = 6,
  subsample = 0.8,
  learn_rate = 0.1,
  early_stop = TRUE,
  data_split_method = 'AUTO_SPLIT'
) AS
SELECT
  fare,
  pickup_latitude, pickup_longitude,
  dropoff_latitude, dropoff_longitude,
  passenger_count,
  EXTRACT(HOUR FROM pickup_datetime) AS pickup_hour,
  EXTRACT(DAYOFWEEK FROM pickup_datetime) AS pickup_day
FROM
  `my_dataset.taxi_trips`
WHERE
  fare > 0 AND fare < 200
```

### Time Series Example (ARIMA\_PLUS)

```
-- Forecast daily sales using ARIMA_PLUS
CREATE OR REPLACE MODEL `my_dataset.sales_forecast`
OPTIONS (
  model_type = 'ARIMA_PLUS',
  time_series_timestamp_col = 'date',
  time_series_data_col = 'total_sales',
  time_series_id_col = 'store_id',       -- Multiple time series
  auto_arima = TRUE,                     -- Auto-detect (p,d,q)
  holiday_region = 'US',                 -- Holiday effects
  data_frequency = 'DAILY'               -- AUTO_FREQUENCY also works
) AS
SELECT
  date,
  store_id,
  total_sales
FROM
  `my_dataset.daily_sales`
```

>**Common Pitfall:** The `input_label_cols` option is required for supervised models but must be omitted for unsupervised models (KMEANS, MATRIX\_FACTORIZATION). Including it for KMEANS will cause an error. For ARIMA\_PLUS, use `time_series_data_col` instead.

## 04. Feature Engineering in BQML

BQML provides built-in feature engineering functions that can be applied within the `TRANSFORM` clause. This ensures transformations are consistently applied during both training and prediction.

### The TRANSFORM Clause

The `TRANSFORM` clause defines feature transformations that become part of the model. When you call `ML.PREDICT`, these transformations are automatically applied — you pass raw data and the model handles preprocessing.

```
-- Feature engineering with TRANSFORM clause
CREATE OR REPLACE MODEL `my_dataset.engineered_model`
TRANSFORM (
  -- Pass through label and features
  target_col,

  -- Bucketize continuous features
  ML.BUCKETIZE(age, [18, 25, 35, 50, 65]) AS age_bucket,

  -- Quantile bucketize (data-driven boundaries)
  ML.QUANTILE_BUCKETIZE(income, 10) AS income_decile,

  -- Feature cross (interaction between categoricals)
  ML.FEATURE_CROSS(STRUCT(city, product_category)) AS city_product_cross,

  -- Polynomial expansion
  ML.POLYNOMIAL_EXPAND(STRUCT(feature1, feature2), 2) AS poly_features,

  -- Standard SQL transformations
  LOG(amount + 1) AS log_amount,
  EXTRACT(HOUR FROM timestamp_col) AS hour_of_day,
  EXTRACT(DAYOFWEEK FROM timestamp_col) AS day_of_week,
  IF(category IS NULL, 'unknown', category) AS category_clean
)
OPTIONS (
  model_type = 'BOOSTED_TREE_CLASSIFIER',
  input_label_cols = ['target_col']
) AS
SELECT * FROM `my_dataset.training_data`
```

### Built-in Feature Engineering Functions

| Function | Purpose | Example |
| --- | --- | --- |
| `ML.BUCKETIZE` | Bin continuous values into fixed buckets | `ML.BUCKETIZE(age, [18, 30, 50])` |
| `ML.QUANTILE_BUCKETIZE` | Bin by quantiles (data-driven boundaries) | `ML.QUANTILE_BUCKETIZE(income, 5)` |
| `ML.FEATURE_CROSS` | Combine categoricals into interaction features | `ML.FEATURE_CROSS(STRUCT(city, day))` |
| `ML.POLYNOMIAL_EXPAND` | Create polynomial feature combinations | `ML.POLYNOMIAL_EXPAND(STRUCT(x, y), 2)` |
| `ML.NGRAMS` | Generate n-grams from text | `ML.NGRAMS(tokens, [1, 2])` |
| `ML.HASH_BUCKETIZE` | Hash high-cardinality features into fixed buckets | `ML.HASH_BUCKETIZE(user_id, 1000)` |

>**Best Practice:** Always use the `TRANSFORM` clause instead of applying transformations in the training query. The `TRANSFORM` clause ensures the same transformations are applied during `ML.PREDICT`, preventing training-serving skew.

## 05. Model Evaluation

After training, use `ML.EVALUATE` to assess model performance. The metrics returned depend on the model type.

```
-- Evaluate model performance
SELECT *
FROM ML.EVALUATE(
  MODEL `my_dataset.penguin_classifier`
)

-- Evaluate on a specific holdout set
SELECT *
FROM ML.EVALUATE(
  MODEL `my_dataset.penguin_classifier`,
  (
    SELECT * FROM `my_dataset.penguins_test`
    WHERE body_mass_g IS NOT NULL
  )
)
```

### Key Metrics by Model Type

| Metric | Model Type | Interpretation |
| --- | --- | --- |
| **accuracy** | Classification | Proportion of correct predictions. Misleading for imbalanced classes. |
| **precision** | Classification | Of predicted positives, how many are correct? High precision = few false positives. |
| **recall** | Classification | Of actual positives, how many did we find? High recall = few false negatives. |
| **f1\_score** | Classification | Harmonic mean of precision and recall. Best single metric for imbalanced data. |
| **roc\_auc** | Binary Classification | Area under ROC curve. 0.5 = random, 1.0 = perfect. Threshold-independent. |
| **log\_loss** | Classification | Measures confidence of predictions. Lower is better. Penalizes confident wrong answers. |
| **mean\_squared\_error** | Regression | Average of squared errors. Sensitive to outliers. Lower is better. |
| **mean\_absolute\_error** | Regression | Average of absolute errors. More robust to outliers than MSE. |
| **r2\_score** | Regression | Proportion of variance explained. 1.0 = perfect. Can be negative for poor models. |
| **davies\_bouldin\_index** | Clustering (KMEANS) | Cluster separation quality. Lower is better (tighter, more separated clusters). |

F1 = 2 × (precision × recall) / (precision + recall)

```
-- View training info (loss curve)
SELECT *
FROM ML.TRAINING_INFO(
  MODEL `my_dataset.penguin_classifier`
)
ORDER BY iteration

-- View confusion matrix for classification
SELECT *
FROM ML.CONFUSION_MATRIX(
  MODEL `my_dataset.penguin_classifier`
)
```

>**Exam Focus:** Know when to use each metric. **Fraud detection** (high cost of false negatives) → optimize for **recall**. **Spam filtering** (high cost of false positives) → optimize for **precision**. **Balanced importance** → use **F1 score**. **Regression with outliers** → prefer **MAE** over RMSE.

## 06. Prediction and Explainability

`ML.PREDICT` generates batch predictions, while `ML.EXPLAIN_PREDICT` adds feature attributions to explain why the model made each prediction.

### Batch Prediction with ML.PREDICT

```
-- Generate predictions on new data
SELECT
  predicted_species,
  predicted_species_probs,
  island,
  body_mass_g
FROM ML.PREDICT(
  MODEL `my_dataset.penguin_classifier`,
  (
    SELECT
      island, culmen_length_mm, culmen_depth_mm,
      flipper_length_mm, body_mass_g, sex
    FROM `my_dataset.new_penguins`
  )
)

-- For regression models, output column is: predicted_<label>
SELECT predicted_fare, actual_fare
FROM ML.PREDICT(
  MODEL `my_dataset.taxi_fare_model`,
  (SELECT * FROM `my_dataset.test_trips`)
)
```

### Explainability with ML.EXPLAIN\_PREDICT

```
-- Get predictions with feature attributions
SELECT *
FROM ML.EXPLAIN_PREDICT(
  MODEL `my_dataset.penguin_classifier`,
  (
    SELECT *
    FROM `bigquery-public-data.ml_datasets.penguins`
    WHERE body_mass_g IS NOT NULL
    LIMIT 5
  ),
  STRUCT(3 AS top_k_features)
)

-- Returns: predicted label + Shapley-based feature attributions
-- Each row includes the top_k most important features for that prediction
```

### ARIMA\_PLUS Forecasting

```
-- Generate 30-day forecast
SELECT *
FROM ML.FORECAST(
  MODEL `my_dataset.sales_forecast`,
  STRUCT(30 AS horizon, 0.95 AS confidence_level)
)

-- Returns: forecast_timestamp, forecast_value,
--          standard_error, prediction_interval_lower_bound,
--          prediction_interval_upper_bound
```

>**Key Difference:** `ML.PREDICT` is used for all model types except ARIMA\_PLUS. For time series models, use `ML.FORECAST` instead. `ML.EXPLAIN_PREDICT` works with classification and regression models and uses Shapley values for feature attribution.

## 07. Exporting Models to Vertex AI

BQML models trained in BigQuery can be exported and deployed to Vertex AI Endpoints for **online (real-time) prediction**. This is the bridge from BQML prototyping to production serving.

```
-- Step 1: Export model to Cloud Storage
EXPORT MODEL `my_dataset.penguin_classifier`
OPTIONS (
  URI = 'gs://my-bucket/exported_models/penguin_classifier/'
)

-- Step 2: Register in Vertex AI Model Registry (via gcloud)
gcloud ai models upload \
  --region=us-central1 \
  --display-name=penguin-classifier \
  --artifact-uri=gs://my-bucket/exported_models/penguin_classifier/ \
  --container-image-uri=us-docker.pkg.dev/vertex-ai/prediction/tf2-cpu.2-12:latest

-- Step 3: Deploy to an endpoint
gcloud ai endpoints deploy-model ENDPOINT_ID \
  --region=us-central1 \
  --model=MODEL_ID \
  --display-name=penguin-prod \
  --machine-type=n1-standard-4 \
  --min-replica-count=1 \
  --max-replica-count=3
```

>**When to Export:** Export BQML models to Vertex AI when you need **online (real-time) prediction** with low latency (<100ms). Keep models in BigQuery if you only need **batch prediction** via `ML.PREDICT`.
>**Export Limitations:** Not all BQML model types can be exported. **ARIMA\_PLUS** and **MATRIX\_FACTORIZATION** models cannot be exported to Vertex AI. AutoML models are exported differently (they are already Vertex AI models under the hood).

## 08. Hyperparameter Tuning in BQML

BQML supports automatic hyperparameter tuning using the `num_trials` option. BigQuery uses a Bayesian optimization strategy to search the hyperparameter space.

```
-- Hyperparameter tuning with BQML
CREATE OR REPLACE MODEL `my_dataset.tuned_model`
OPTIONS (
  model_type = 'BOOSTED_TREE_CLASSIFIER',
  input_label_cols = ['species'],

  -- Enable HP tuning
  num_trials = 20,                        -- Number of trials to run
  max_parallel_trials = 5,                -- Parallel trials
  hparam_tuning_objectives = ['roc_auc'], -- Metric to optimize

  -- Hyperparameter search ranges (auto-selected if omitted)
  max_tree_depth = hparam_range(3, 10),
  learn_rate = hparam_range(0.01, 0.3),
  subsample = hparam_range(0.5, 1.0),
  l2_reg = hparam_candidates([0, 0.1, 1.0, 10.0])
) AS
SELECT * FROM `my_dataset.training_data`

-- View tuning results
SELECT *
FROM ML.TRIAL_INFO(
  MODEL `my_dataset.tuned_model`
)
ORDER BY roc_auc DESC
```

>**Tuning Functions:** `hparam_range(min, max)` defines a continuous range for search. `hparam_candidates([v1, v2, v3])` defines discrete values to try. BQML automatically selects the best trial as the final model.

## 09. BQML vs AutoML vs Custom Training

Choosing the right ML approach on GCP depends on your team's skills, data complexity, performance requirements, and time constraints.

| Criteria | BigQuery ML | AutoML (Vertex AI) | Custom (TF/PyTorch) |
| --- | --- | --- | --- |
| **Interface** | SQL | GUI + API | Python (code) |
| **Skill Required** | SQL knowledge | Minimal ML knowledge | Deep ML expertise |
| **Data Location** | Must be in BigQuery | GCS or BigQuery | Anywhere |
| **Model Types** | Pre-defined (see table above) | Tabular, image, text, video | Any architecture |
| **Training Time** | Minutes to hours | Hours (architecture search) | Hours to days |
| **Customization** | Hyperparameters only | Limited (objectives, budget) | Full control |
| **Best For** | Quick prototyping, SQL-based teams, tabular data | High accuracy with minimal effort | Complex architectures, research, unique requirements |
| **Cost Model** | BigQuery compute (on-demand or flat-rate) | Node-hours | Compute Engine / Vertex AI Training |

>**Exam Decision Flow:** **Data already in BigQuery + SQL team + tabular data?** → Start with BQML. **Need highest accuracy with minimal tuning?** → AutoML. **Need custom architecture or unstructured data?** → Custom training. **BQML prototype worked but need online serving?** → Export BQML model to Vertex AI.

## 10. Exam Focus

### Model Type Selection Cheat Sheet

>**Quick Reference:** **Predict a number** (price, count, duration) → `LINEAR_REG` or `BOOSTED_TREE_REGRESSOR`  
> **Predict a category** (yes/no, A/B/C) → `LOGISTIC_REG` or `BOOSTED_TREE_CLASSIFIER`  
> **Group similar items** (customer segments) → `KMEANS`  
> **Recommend items** (products, movies) → `MATRIX_FACTORIZATION`  
> **Forecast future values** (sales, demand) → `ARIMA_PLUS`  
> **Maximum accuracy, tabular data** → `AUTOML_CLASSIFIER` / `AUTOML_REGRESSOR`  
> **Use existing TF model in BQ** → Import `TENSORFLOW` model

### Common Exam Scenarios

>**Scenario 1:** "A retail company has sales data in BigQuery. They want to forecast next quarter's sales by region. The data shows clear weekly and yearly seasonality." → **ARIMA\_PLUS** with `time_series_id_col='region'` and `auto_arima=TRUE`
>**Scenario 2:** "A data analyst (SQL expert, no Python) needs to predict customer churn (binary outcome) using data already in BigQuery." → **LOGISTIC\_REG** in BQML. If accuracy needs improvement, upgrade to **BOOSTED\_TREE\_CLASSIFIER**.
>**Scenario 3:** "The team trained a BQML model for fraud detection. It performs well in batch evaluation. Now they need real-time predictions for incoming transactions." → **Export model** to Cloud Storage, upload to **Vertex AI Model Registry**, deploy to a **Vertex AI Endpoint** for online prediction.
>**Scenario 4:** "An ML engineer wants to ensure consistent feature transformations between training and serving in BQML." → Use the **TRANSFORM** clause in `CREATE MODEL`. Transformations defined here are automatically applied during `ML.PREDICT`.

### Key Exam Takeaways

-   BQML trains models using SQL with no data movement from BigQuery
-   Know all model types and when to use each (especially ARIMA\_PLUS, KMEANS, LOGISTIC\_REG)
-   TRANSFORM clause prevents training-serving skew by embedding preprocessing in the model
-   ML.EVALUATE returns different metrics based on model type (classification vs regression)
-   ML.EXPLAIN\_PREDICT uses Shapley values for feature attribution
-   Export BQML models to Vertex AI for online serving (not all types are exportable)
-   Use ML.FORECAST (not ML.PREDICT) for ARIMA\_PLUS time series models
-   Hyperparameter tuning uses num\_trials with Bayesian optimization
-   Choose precision for "minimize false positives," recall for "minimize false negatives"

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** BigQuery ML lets you create, evaluate, and serve machine learning models using standard SQL directly inside BigQuery—no data export, no Python, no separate infrastructure. You write `CREATE MODEL` with a model type (linear regression, logistic regression, k-means, ARIMA\_PLUS, boosted trees, DNN, or even imported TensorFlow models), point it at a training query, and BigQuery handles distributed training on its serverless compute. Predictions use `ML.PREDICT`, evaluation uses `ML.EVALUATE`, and you can explain predictions with `ML.EXPLAIN_PREDICT`. The key insight is that BQML is ideal when your data already lives in BigQuery, the team is SQL-fluent, and the model complexity fits supported types. For more complex architectures, you export the BQML model to Vertex AI or switch to custom training entirely.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| When would you use BigQuery ML instead of Vertex AI custom training? | Can you identify the sweet spot for SQL-based ML vs. full framework control? |
| Walk me through creating and deploying a forecasting model on GCP. | Do you know ARIMA\_PLUS syntax, evaluation metrics, and the path from BQML to a serving endpoint? |
| How does feature engineering work in BigQuery ML? | Do you understand TRANSFORM clause, automatic preprocessing, and manual SQL-based feature construction? |
| What are the limitations of BigQuery ML? | Can you articulate where BQML stops being sufficient—custom loss functions, novel architectures, GPU training, real-time serving? |
| How would you compare BQML, AutoML, and Vertex AI custom training for a tabular classification problem? | Do you understand the trade-off triangle: speed-to-deploy vs. accuracy ceiling vs. engineering effort? |

### Model Answers

**BQML vs Custom Training:** I choose BQML when the data is already in BigQuery (avoiding export costs and latency), the model type is supported (linear/logistic regression, boosted trees, ARIMA\_PLUS, k-means, matrix factorization), and the team consists of analysts or data engineers who are SQL-proficient but not ML engineers. BQML delivers a trained, evaluated model in minutes with zero infrastructure. I switch to Vertex AI custom training when I need a transformer architecture, custom loss functions, distributed GPU training, or real-time sub-10ms inference that BQML batch predictions cannot satisfy.

**ARIMA\_PLUS Forecasting:** I create a time-series model with `CREATE MODEL ... OPTIONS(model_type='ARIMA_PLUS', time_series_timestamp_col='date', time_series_data_col='revenue')`. ARIMA\_PLUS automatically handles seasonality detection, holiday effects, and trend decomposition. I evaluate with `ML.EVALUATE` checking AIC, variance, and seasonal periods. For predictions, `ML.FORECAST` returns point estimates with confidence intervals. If the forecast needs to serve a dashboard, I materialize predictions into a BigQuery table and connect Looker. If it needs a REST endpoint, I export the model to Vertex AI and deploy to an endpoint.

**Feature Engineering in BQML:** BQML provides the `TRANSFORM` clause that embeds preprocessing into the model artifact itself, so the same transformations apply at prediction time automatically. Supported transforms include `ML.BUCKETIZE`, `ML.QUANTILE_BUCKETIZE`, `ML.FEATURE_CROSS`, `ML.POLYNOMIAL_EXPAND`, and standard SQL functions. For features BQML cannot express, I pre-compute them in a SQL view or scheduled query and feed that into `CREATE MODEL`. The TRANSFORM clause is critical because it prevents training-serving skew—the model carries its preprocessing logic.

### System Design Scenario

>**Design Prompt:** **Scenario:** An online marketplace wants to predict customer churn (binary classification) using transaction history stored in BigQuery (500M rows, 40 features). They also need weekly revenue forecasts per product category. The analytics team knows SQL but not Python. Design the ML architecture.
> 
> **Approach:** For churn prediction, use BQML with `model_type='BOOSTED_TREE_CLASSIFIER'` since the data is already in BigQuery, the team is SQL-fluent, and boosted trees handle tabular classification well. Use the `TRANSFORM` clause for feature scaling and bucketing. Evaluate with `ML.EVALUATE` (precision, recall, AUC) and explain top features with `ML.GLOBAL_EXPLAIN`. For revenue forecasting, use `model_type='ARIMA_PLUS'` partitioned by product\_category. Schedule weekly retraining with BigQuery Scheduled Queries. Materialize churn scores into a `churn_predictions` table that the CRM reads via API, and forecast results into a `revenue_forecast` table connected to a Looker dashboard. If churn model accuracy plateaus below target, export to Vertex AI and try AutoML Tabular for a higher accuracy ceiling with minimal extra effort.

### Common Mistakes

-   **Using BQML for everything** — BQML is powerful for supported model types on tabular data, but recommending it for image classification, NLP, or real-time serving shows you do not understand its boundaries. Always state what BQML cannot do.
-   **Forgetting the TRANSFORM clause** — Manually preprocessing features in the training query but not replicating that logic at prediction time causes training-serving skew. The TRANSFORM clause solves this—mention it explicitly.
-   **Ignoring the export-to-Vertex path** — Many candidates treat BQML and Vertex AI as completely separate. Knowing that you can export a BQML model to Vertex AI Model Registry for online serving or further tuning demonstrates full-stack understanding of the GCP ML ecosystem.

Previous Module

[03 · Vertex AI Notebooks](03-vertex-ai-notebooks.html)

Next Module

[05 · Data Engineering for BQML](05-data-engineering-bqml.html)

Feature Engineering & Pipelines