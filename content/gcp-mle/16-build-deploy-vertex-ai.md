---
title: "Build & Deploy ML Solutions on Vertex AI"
slug: "build-deploy-vertex-ai"
description: "From AutoML to custom training, from online endpoints to batch prediction — this module covers
    the full lifecycle of building, deploying, and monitoring ML models on Vertex AI. Learn when to use
    AutoML versus custom containers, how to configure endpoints for production traffic, and how to se"
section: "gcp-mle"
order: 16
badges:
  - "AutoML Training"
  - "Custom Training"
  - "Model Deployment"
  - "Model Monitoring"
  - "Cost Optimization"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/16-build-deploy-vertex-ai.ipynb"
---

## 01. Vertex AI AutoML

AutoML lets you train high-quality models **without writing model code**. You provide a labeled dataset, select an objective (classification, regression, object detection, etc.), and AutoML handles architecture search, hyperparameter tuning, and model selection.

### Supported Data Types

T

#### Tabular

Classification and regression on structured data. Sources: BigQuery, CSV, Dataframe. Supports feature importance, time-series forecasting, and automatic feature engineering.

I

#### Image

Classification (single-label, multi-label), object detection, and image segmentation. Supports import from GCS with labels in JSONL format or Vertex AI managed datasets.

X

#### Text

Classification, entity extraction, and sentiment analysis. Supports plain text and documents. Integrates with Document AI for structured document processing.

V

#### Video

Classification, object tracking, and action recognition. Requires video data in GCS. Outputs temporal annotations for each detected object or action.

### End-to-End AutoML Workflow

The AutoML workflow follows a consistent pattern across all data types: (1) Create a managed dataset, (2) Import labeled data, (3) Configure training (objective, budget, column types), (4) Launch training, (5) Evaluate model metrics, (6) Deploy to endpoint.

```
# AutoML tabular classification — end to end
from google.cloud import aiplatform

aiplatform.init(project="my-project", location="us-central1")

# Step 1: Create dataset
dataset = aiplatform.TabularDataset.create(
    display_name="fraud-detection-data",
    bq_source="bq://my-project.ml_data.fraud_features",
)

# Step 2: Train AutoML model
job = aiplatform.AutoMLTabularTrainingJob(
    display_name="fraud-automl-v1",
    optimization_prediction_type="classification",
    optimization_objective="maximize-au-prc",  # AUC-PR for imbalanced data
    column_transformations=[
        {"numeric": {"column_name": "amount"}},
        {"categorical": {"column_name": "merchant_category"}},
        {"timestamp": {"column_name": "transaction_time"}},
    ],
)

model = job.run(
    dataset=dataset,
    target_column="is_fraud",
    budget_milli_node_hours=2000,  # 2 node-hours budget
    training_fraction_split=0.8,
    validation_fraction_split=0.1,
    test_fraction_split=0.1,
)
```

## 02. AutoML Training Configuration

### Data Splits

Vertex AI supports three split strategies: **random** (default, good for i.i.d. data), **chronological** (for time-series, uses a timestamp column), and **manual** (you assign each row to train/validation/test via a column).

>**Exam Warning:** For time-series data, always use **chronological splitting** to prevent data leakage. Random splitting on time-dependent data means the model sees "future" data during training.

### Training Budget

`budget_milli_node_hours` controls how many node-hours AutoML searches for the best model. Higher budgets produce better models but cost more. For tabular, **1000 milli-node-hours (1 node-hour)** is the minimum; production models typically use 2000-8000.

### Optimization Objectives

| Objective | Task | When to Use |
| --- | --- | --- |
| `maximize-au-roc` | Classification | Balanced classes, general binary classification |
| `maximize-au-prc` | Classification | Imbalanced classes (fraud, rare events) |
| `minimize-log-loss` | Classification | When probability calibration matters |
| `minimize-rmse` | Regression | General regression, sensitive to outliers |
| `minimize-mae` | Regression | Robust to outliers |
| `minimize-rmsle` | Regression | Relative errors matter more than absolute |

## 03. Vertex AI Custom Training

When AutoML does not meet your requirements — custom architectures, specific frameworks (PyTorch, JAX, XGBoost), or full control over training logic — use custom training jobs.

### Pre-built Containers vs Custom Containers

| Aspect | Pre-built Container | Custom Container |
| --- | --- | --- |
| Use case | TensorFlow, PyTorch, XGBoost, scikit-learn | Any framework, custom C++ code, special dependencies |
| Setup | Provide a Python training script; container has framework pre-installed | Build and push a Docker image to Artifact Registry |
| GPU drivers | Pre-installed and tested by Google | You must include GPU drivers in your image |
| Maintenance | Google maintains and patches the container | You maintain the image |
| Flexibility | Limited to supported frameworks and versions | Full control over everything |

```
# Custom training with a pre-built container
from google.cloud import aiplatform

job = aiplatform.CustomTrainingJob(
    display_name="pytorch-fraud-model",
    script_path="trainer/task.py",
    container_uri="us-docker.pkg.dev/vertex-ai/training/pytorch-gpu.2-1:latest",
    requirements=["transformers==4.35.0", "wandb"],
    model_serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/pytorch-gpu.2-1:latest",
)

model = job.run(
    replica_count=1,
    machine_type="n1-standard-8",
    accelerator_type="NVIDIA_TESLA_T4",
    accelerator_count=1,
    args=["--epochs", "10", "--batch_size", "32"],
)
```

```
# Custom training with a custom container
job = aiplatform.CustomContainerTrainingJob(
    display_name="custom-jax-model",
    container_uri="us-central1-docker.pkg.dev/my-project/ml-images/jax-trainer:v1",
    model_serving_container_image_uri="us-central1-docker.pkg.dev/my-project/ml-images/jax-server:v1",
)

model = job.run(
    replica_count=1,
    machine_type="a2-highgpu-1g",  # A100 GPU
    args=["--config", "gs://my-bucket/config.yaml"],
)
```

## 04. Custom Training Job Configuration

### Machine Types and Accelerators

| Machine Type | vCPUs | Memory | Use Case |
| --- | --- | --- | --- |
| `n1-standard-4` | 4 | 15 GB | Small models, preprocessing |
| `n1-standard-16` | 16 | 60 GB | Medium models, scikit-learn, XGBoost |
| `n1-highmem-32` | 32 | 208 GB | Large datasets in memory |
| `a2-highgpu-1g` | 12 | 85 GB + A100 | Deep learning, LLM fine-tuning |

### GPU Options

| Accelerator | Memory | Best For |
| --- | --- | --- |
| `NVIDIA_TESLA_T4` | 16 GB | Cost-effective training, inference |
| `NVIDIA_TESLA_V100` | 16 GB | General deep learning training |
| `NVIDIA_TESLA_A100` | 40/80 GB | Large model training, mixed precision |
| `TPU_V3` | 128 GB HBM | TensorFlow/JAX at scale (pods) |

### Distributed Training

Vertex AI supports distributed training out of the box. Configure a **worker pool spec** with multiple replicas. The service handles node provisioning, communication setup (NCCL for GPUs), and environment variables (`TF_CONFIG`, `MASTER_ADDR`/`MASTER_PORT` for PyTorch).

```
# Distributed training: 1 chief + 3 workers
job = aiplatform.CustomJob(
    display_name="distributed-training",
    worker_pool_specs=[
        {  # Chief (worker pool 0)
            "machine_spec": {
                "machine_type": "n1-standard-8",
                "accelerator_type": "NVIDIA_TESLA_V100",
                "accelerator_count": 2,
            },
            "replica_count": 1,
            "container_spec": {
                "image_uri": "us-docker.pkg.dev/vertex-ai/training/tf-gpu.2-14:latest",
                "command": ["python", "trainer/task.py"],
            },
        },
        {  # Workers (worker pool 1)
            "machine_spec": {
                "machine_type": "n1-standard-8",
                "accelerator_type": "NVIDIA_TESLA_V100",
                "accelerator_count": 2,
            },
            "replica_count": 3,
            "container_spec": {
                "image_uri": "us-docker.pkg.dev/vertex-ai/training/tf-gpu.2-14:latest",
                "command": ["python", "trainer/task.py"],
            },
        },
    ],
)
job.run()
```

>**Exam Tip:** For distributed TensorFlow, Vertex AI automatically sets `TF_CONFIG` with cluster info. For PyTorch, it sets `MASTER_ADDR`, `MASTER_PORT`, `WORLD_SIZE`, and `RANK`. Your training script must use these environment variables.

## 05. Model Deployment

### Online Endpoints

Online endpoints serve real-time predictions with low latency. Vertex AI offers two types:

D

#### Dedicated Endpoints

Always-on VMs with configurable machine type and accelerator. You control replica count and auto-scaling. Best for production workloads with predictable traffic patterns.

S

#### Serverless Endpoints

Fully managed, pay-per-prediction. No infrastructure config required. Vertex AI handles scaling. Best for bursty or unpredictable traffic, or getting started quickly.

```
# Deploy a model to a dedicated endpoint
from google.cloud import aiplatform

# Create endpoint
endpoint = aiplatform.Endpoint.create(
    display_name="fraud-detection-endpoint",
)

# Deploy model to endpoint
model = aiplatform.Model("projects/my-project/locations/us-central1/models/123456")

model.deploy(
    endpoint=endpoint,
    deployed_model_display_name="fraud-model-v1",
    machine_type="n1-standard-4",
    min_replica_count=1,
    max_replica_count=5,
    accelerator_type="NVIDIA_TESLA_T4",
    accelerator_count=1,
    traffic_percentage=100,
)

# Make a prediction
response = endpoint.predict(instances=[
    {"amount": 150.0, "merchant_category": "electronics", "hour": 23}
])
print(response.predictions)
```

### Batch Prediction

For large-scale offline scoring (millions of rows), use batch prediction. Input data comes from BigQuery, GCS (JSONL, CSV, TFRecord), and results are written to BigQuery or GCS. Batch prediction auto-scales compute and is more cost-effective than online endpoints for bulk processing.

```
# Batch prediction from BigQuery
batch_job = model.batch_predict(
    job_display_name="fraud-batch-scoring",
    bigquery_source="bq://my-project.ml_data.new_transactions",
    bigquery_destination_prefix="bq://my-project.ml_data",
    instances_format="bigquery",
    predictions_format="bigquery",
    machine_type="n1-standard-4",
    max_replica_count=10,
    starting_replica_count=2,
)
```

## 06. Endpoint Management

### Traffic Splitting

A single endpoint can host **multiple deployed models**. You control what percentage of traffic goes to each model. This enables A/B testing and canary deployments.

```
# Deploy two models with traffic splitting
# Model A: existing model (90% traffic)
# Model B: new candidate (10% traffic)

endpoint.deploy(
    model=model_v2,
    deployed_model_display_name="fraud-model-v2",
    machine_type="n1-standard-4",
    min_replica_count=1,
    max_replica_count=3,
    traffic_percentage=10,  # 10% canary
)

# Update traffic split after validation
endpoint.update(traffic_split={
    "deployed-model-id-v1": 50,
    "deployed-model-id-v2": 50,
})
```

### Canary Deployment Pattern

A typical canary rollout: (1) Deploy new model with 5-10% traffic, (2) Monitor error rates and latency for 24-48 hours, (3) If metrics are stable, increase to 50%, (4) After further validation, shift to 100%, (5) Undeploy the old model.

>**A/B Testing vs Canary:** **A/B testing** runs two models simultaneously to compare business metrics (click-through, conversion). **Canary** gradually shifts traffic to validate operational stability (latency, errors) before full rollout. Both use traffic splitting.

## 07. Model Monitoring on Endpoints

Models degrade over time as the real world changes. Vertex AI Model Monitoring continuously analyzes prediction requests and alerts you when data distributions shift beyond configured thresholds.

### Types of Drift

P

#### Prediction Drift

The distribution of model predictions changes over time. Example: a fraud model starts predicting fraud for 20% of transactions instead of the baseline 2%. Detected by comparing recent predictions against a baseline distribution.

F

#### Feature Skew

The distribution of input features at serving time differs from training data. Example: a new merchant category appears that was not in training data. This is **training-serving skew**.

A

#### Attribution Drift

Feature importance changes over time. A feature that was the top predictor during training becomes less important at serving time, suggesting the model's reasoning is no longer aligned with current data patterns.

```
# Configure model monitoring on an endpoint
from google.cloud import aiplatform

# Create monitoring job
monitoring_job = aiplatform.ModelDeploymentMonitoringJob.create(
    display_name="fraud-model-monitoring",
    endpoint=endpoint,
    logging_sampling_strategy={
        "random_sample_config": {"sample_rate": 0.8}  # sample 80% of requests
    },
    monitoring_frequency=1,  # hours between analysis runs
    monitoring_config={
        "skew_detection_config": {
            "data_source": "bq://my-project.ml_data.training_data",
            "skew_thresholds": {
                "amount": {"value": 0.3},
                "merchant_category": {"value": 0.3},
            },
        },
        "drift_detection_config": {
            "drift_thresholds": {
                "amount": {"value": 0.3},
                "merchant_category": {"value": 0.3},
            },
        },
    },
    alert_config={
        "email_alert_config": {
            "user_emails": ["ml-team@company.com"]
        }
    },
)
```

>**Exam Alert:** The exam tests the distinction between **skew** (training vs serving distribution mismatch) and **drift** (serving distribution changes over time). Skew needs training data as baseline; drift uses recent predictions as baseline.

## 08. Vertex AI Pipelines for End-to-End Workflows

Vertex AI Pipelines ties together training, evaluation, and deployment into a single automated workflow. Google provides **pre-built pipeline components** for common operations.

```
# End-to-end pipeline: AutoML train -> evaluate -> deploy
from kfp import dsl
from google_cloud_pipeline_components.v1.automl.training_job import (
    AutoMLTabularTrainingJobRunOp
)
from google_cloud_pipeline_components.v1.endpoint import (
    EndpointCreateOp, ModelDeployOp
)

@dsl.pipeline(name="automl-train-deploy")
def automl_pipeline(project: str, location: str):
    # Train
    training_op = AutoMLTabularTrainingJobRunOp(
        project=project,
        display_name="fraud-automl",
        optimization_prediction_type="classification",
        dataset="projects/.../datasets/...",
        target_column="is_fraud",
        budget_milli_node_hours=2000,
    )

    # Create endpoint
    endpoint_op = EndpointCreateOp(
        project=project,
        display_name="fraud-endpoint",
    )

    # Deploy model to endpoint
    deploy_op = ModelDeployOp(
        model=training_op.outputs["model"],
        endpoint=endpoint_op.outputs["endpoint"],
        dedicated_resources_machine_type="n1-standard-4",
        dedicated_resources_min_replica_count=1,
        dedicated_resources_max_replica_count=3,
    )
```

## 09. BigQuery ML to Vertex AI Endpoint

BigQuery ML lets you train models using SQL. Once trained, you can **export a BQML model** and deploy it to a Vertex AI Endpoint for low-latency online serving.

```
-- Step 1: Train in BigQuery ML
CREATE OR REPLACE MODEL `my_project.ml_data.fraud_model`
OPTIONS(
  model_type='BOOSTED_TREE_CLASSIFIER',
  input_label_cols=['is_fraud'],
  max_iterations=50,
  learn_rate=0.1
) AS
SELECT * FROM `my_project.ml_data.training_features`;
```

```
# Step 2: Export BQML model to Vertex AI Model Registry
from google.cloud import aiplatform

# Register BQML model in Vertex AI
model = aiplatform.Model.upload(
    display_name="bqml-fraud-model",
    artifact_uri="bq://my-project.ml_data.fraud_model",
    serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/tf2-cpu.2-14:latest",
)

# Step 3: Deploy to endpoint
endpoint = model.deploy(
    machine_type="n1-standard-4",
    min_replica_count=1,
    max_replica_count=3,
)
```

>**When to Use BQML + Vertex:** This pattern works best when your data team builds models in SQL and your ML engineering team handles deployment. BQML supports boosted trees, DNNs, linear models, and ARIMA+. For complex architectures, use custom training instead.

## 10. Cost Optimization

### Auto-scaling Configuration

The most important cost lever for online endpoints is **auto-scaling**. Set `min_replica_count` to handle baseline traffic and `max_replica_count` for peak loads. Vertex AI scales based on CPU utilization, GPU utilization, or request count.

| Strategy | Configuration | Trade-off |
| --- | --- | --- |
| **Scale to zero** | `min_replica_count=0` | Zero cost when idle, but cold start latency (30-60s) |
| **Always warm** | `min_replica_count=1` | Constant baseline cost, no cold start |
| **Production** | `min=2, max=10` | High availability (multi-replica), scales with traffic |

### Additional Cost Strategies

-   **Batch prediction** for non-real-time workloads — cheaper than keeping endpoints alive
-   **Spot/preemptible VMs** for training jobs (`scheduling={"disable_retries": false}`) — 60-91% cheaper, but can be preempted
-   **Right-size machine types** — profile your model to find the cheapest machine that meets latency SLOs
-   **Pipeline caching** — avoid re-running unchanged pipeline steps
-   **Model compression** — quantization and distillation reduce serving cost by requiring smaller machines
-   **Regional selection** — us-central1 is often cheapest for Vertex AI resources

>**Exam Pattern:** Cost questions often present a scenario with constraints (latency SLO, budget, traffic pattern) and ask you to pick the optimal deployment config. Always consider: is the traffic predictable? Can you tolerate cold starts? Is batch prediction sufficient?

## 11. Exam Focus

### AutoML vs Custom Training

>**Decision Framework:** **Use AutoML when:** You have labeled data, a standard task (classification, regression, object detection), limited ML engineering resources, or need a quick baseline.  
> **Use custom training when:** You need a specific architecture, custom loss function, unsupported framework, or full control over the training loop.

### Deployment Strategy Selection

-   **Real-time, low latency (<100ms)?** Dedicated online endpoint with GPU
-   **Real-time, variable traffic?** Dedicated endpoint with auto-scaling (min=1)
-   **Occasional requests, cost-sensitive?** Serverless endpoint or scale-to-zero
-   **Millions of predictions, not real-time?** Batch prediction
-   **Multiple model versions in production?** Traffic splitting on endpoint

### Monitoring Setup

For the exam, know that model monitoring requires: (1) a **training dataset** as baseline for skew detection, (2) **sampling rate** configuration (how much prediction traffic to log), (3) **alert thresholds** for each feature, and (4) **notification channels** (email, Cloud Monitoring).

>**Key Exam Patterns:** When the exam describes model performance degradation after deployment: the answer is almost always "set up model monitoring for prediction drift and feature skew" — not "retrain immediately" or "add more training data." Monitoring gives you the signal; retraining is the response.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Vertex AI is Google Cloud’s unified platform for the full ML lifecycle—from training to deployment to monitoring. For training, you choose between AutoML (automated architecture search and hyperparameter tuning for standard tasks) and custom training (full control with pre-built or custom containers for novel architectures). For deployment, online endpoints serve real-time predictions with autoscaling and traffic splitting for canary rollouts, while batch prediction handles high-throughput offline scoring. Endpoint management includes traffic splitting across model versions for A/B testing and gradual rollouts. Model monitoring continuously watches for feature skew (training vs serving distributions diverge) and prediction drift (output distribution changes over time), alerting you before degraded models impact users. The architecture principle is: start with AutoML for speed, graduate to custom training for performance, and always deploy with monitoring enabled.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| When would you use AutoML versus custom training? | Can you match team capability, timeline, and problem complexity to the right training approach? |
| How do you deploy an ML model for real-time serving on GCP? | Do you understand Vertex AI Endpoints, container serving, autoscaling configuration, and traffic management? |
| How do you handle model versioning and rollbacks in production? | Can you explain traffic splitting, canary deployments, and the Model Registry’s role in version management? |
| What is model monitoring and why is it critical? | Do you understand feature skew, prediction drift, and how monitoring detects silent model degradation before business impact? |
| How do you optimize ML serving costs on GCP? | Can you discuss autoscaling policies, machine type selection, batch prediction for offline workloads, and the cost trade-offs of GPUs vs CPUs? |

### Model Answers

**AutoML vs Custom Training:** I default to AutoML when the problem maps to a supported task type (image classification, tabular regression, text sentiment), the team doesn’t have deep ML expertise, and the timeline is tight. AutoML handles neural architecture search and hyperparameter tuning automatically, often delivering 90%+ of custom model performance in days instead of weeks. I switch to custom training when I need a specific architecture (transformers, graph neural networks), custom loss functions, multi-task learning, or when AutoML’s accuracy plateau doesn’t meet the business threshold. On Vertex AI, custom training supports pre-built containers (TensorFlow, PyTorch, XGBoost) for standard frameworks and custom containers for anything else.

**Production Deployment:** I upload the trained model to the Vertex AI Model Registry, then deploy it to an endpoint. For real-time serving, I configure the machine type based on latency requirements (GPU for large models, CPU for lightweight ones), set min/max replica counts for autoscaling based on traffic patterns, and use traffic splitting to route 10% of traffic to the new model version while 90% stays on the proven version. I monitor latency, error rates, and prediction distributions. If the canary performs well over 24–48 hours, I gradually shift traffic to 100%. For high-throughput offline scoring (e.g., nightly batch recommendations), I use batch prediction jobs that spin up resources, process all inputs, write results to BigQuery or Cloud Storage, and shut down—eliminating idle endpoint costs.

**Model Monitoring:** I configure Vertex AI Model Monitoring with two key detection types. Feature skew monitoring compares the statistical distribution of input features at serving time against the training data baseline—if a feature’s distribution shifts beyond a configured threshold, it triggers an alert. Prediction drift monitoring watches the model’s output distribution over time—if predictions start clustering differently than the baseline period, it signals concept drift. I set up notification channels to Cloud Monitoring and configure sampling rates to balance monitoring coverage against cost. When alerts fire, I investigate whether it’s a data pipeline issue or genuine distribution shift, then trigger a retraining pipeline if needed.

### System Design Scenario

>**Design Prompt:** **Scenario:** A ride-sharing company wants to deploy a real-time surge pricing model that predicts demand in each city zone for the next 15 minutes. The model must handle 10,000 predictions per second at peak, update hourly with new data, and minimize serving costs during off-peak hours. Design the architecture.
> 
> **Approach:** Train a custom model (gradient-boosted trees or lightweight neural network) on Vertex AI Custom Training using historical demand data from BigQuery, with features from Vertex AI Feature Store (time-of-day, weather, events, historical demand by zone). Deploy to a Vertex AI Online Endpoint with GPU-backed instances for peak throughput and configure autoscaling with min replicas set to handle baseline traffic and max replicas for peak. Use a Cloud Scheduler + Cloud Function to trigger hourly retraining via a Vertex AI Pipeline: ingest the latest hour’s data, retrain, evaluate against the current model, and deploy only if MAE improves. Enable Model Monitoring for prediction drift (surge predictions shifting unexpectedly) and feature skew (weather API format changes). During off-peak hours (2–6 AM), autoscaling reduces to minimum replicas. For cost optimization, use n1-standard machines with autoscaling rather than over-provisioned GPU instances, and batch non-urgent predictions (like next-day demand forecasts) using batch prediction jobs.

### Common Mistakes

-   **Over-provisioning endpoints for peak traffic** — Running maximum replicas 24/7 wastes significant compute budget. Configure autoscaling with appropriate min/max replicas and scale-down delays. Use batch prediction for offline workloads instead of keeping endpoints running.
-   **Deploying without model monitoring** — Models degrade silently in production as data distributions shift. Without monitoring for feature skew and prediction drift, you won’t know your model is underperforming until users complain or business metrics drop—which could be weeks later.
-   **Using custom training when AutoML suffices** — Building and maintaining custom model code for a standard task (tabular classification, image labeling) adds weeks of engineering effort and ongoing maintenance burden. Always benchmark AutoML first; you can switch to custom training later if needed.

Previous

[← 15 · ML Pipelines on GCP](15-ml-pipelines-gcp.html)

Next

[17 · Generative AI Apps →](17-generative-ai-apps.html)