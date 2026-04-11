---
title: "MLOps: DevOps for Machine Learning"
slug: "mlops-getting-started"
description: "Training a model is only the beginning. MLOps is the discipline of deploying, monitoring, and continuously
    improving ML systems in production. This module covers MLOps maturity levels, the Vertex AI MLOps toolkit,
    experiment tracking, model registry, metadata lineage, continuous training tri"
section: "gcp-mle"
order: 9
badges:
  - "MLOps Maturity Levels"
  - "Vertex AI Experiments"
  - "Model Registry"
  - "Continuous Training"
  - "CI/CD for ML"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/09-mlops-getting-started.ipynb"
---

## 01. What is MLOps

**MLOps (Machine Learning Operations)** is the practice of applying DevOps principles — continuous integration, continuous delivery, monitoring, and automation — to machine learning systems. While traditional software delivers deterministic code, ML systems deliver **trained models** that depend on data, code, and configuration simultaneously.

### Why ML is Different from Traditional Software

| Dimension | Traditional Software | Machine Learning Systems |
| --- | --- | --- |
| **Primary artifact** | Code | Code + Data + Model |
| **Testing** | Unit tests, integration tests | Data validation, model validation, code tests |
| **Deployment** | Ship new code | Ship new model (retrained on new data) |
| **Monitoring** | Uptime, latency, errors | Data drift, model staleness, prediction quality |
| **Versioning** | Code (Git) | Code + Data + Model + Hyperparameters + Environment |
| **Debugging** | Stack traces | Data pipelines, feature distributions, training logs |

>**Key Insight:** In ML systems, **data is a first-class citizen**. A model's behavior changes when data changes, even if no code changes. This is why MLOps requires data versioning, data validation, and continuous monitoring — concepts that do not exist in traditional DevOps.

Google identifies **three critical differences** in ML systems: (1) ML development is experimental — you track not just code but experiments, hyperparameters, and metrics. (2) Testing is more complex — you must test data and model quality, not just code. (3) Deployment is not just about code — you deploy a complete ML pipeline that can automatically retrain and serve updated models.

## 02. MLOps Maturity Levels

Google defines three levels of MLOps maturity. Most organizations start at Level 0 and progressively automate. The exam frequently tests your ability to **assess which level an organization is at** and **recommend the next steps** to advance.

### Level 0: Manual Process

At Level 0, data scientists work in Jupyter notebooks, manually train models, and hand off trained artifacts to engineers for deployment. There is no automation, no pipeline, and no continuous training.

📝

#### Characteristics

Manual, script-driven, interactive process. Few or no ML engineers. Data scientists hand off models as serialized files. Infrequent releases (quarterly or slower).

⚠

#### Problems

No reproducibility. Training-serving skew. No monitoring. Models decay silently. Deployment bottleneck between data science and engineering teams.

>**Exam Alert:** If a scenario describes data scientists training in notebooks and handing off pickle files, with no monitoring or automated retraining — that is Level 0. The recommendation is always to build an automated ML pipeline (Level 1).

### Level 1: ML Pipeline Automation

At Level 1, the unit of deployment is not a model but an **ML pipeline**. The pipeline automates data ingestion, validation, transformation, training, evaluation, and model deployment. Continuous training is enabled — the pipeline can be triggered by new data, a schedule, or performance degradation.

⚡

#### Key Capabilities

Automated pipeline execution. Feature Store integration. Metadata tracking. Model validation gates. Continuous training on schedule or trigger. Pipeline orchestration with Vertex AI Pipelines.

📈

#### Benefits

Reproducible experiments. Faster iteration. Reduced training-serving skew via Feature Store. Models stay fresh with automatic retraining. Full lineage from data to deployed model.

```
# Level 1 pipeline pattern (conceptual)
# Deploy the PIPELINE, not the model

pipeline_steps = [
    "data_ingestion",      # Pull from BigQuery / GCS
    "data_validation",      # Schema + distribution checks (TFDV)
    "feature_engineering",   # Transform + Feature Store integration
    "model_training",        # Train with tracked hyperparameters
    "model_evaluation",      # Compare against baseline metrics
    "model_validation",      # Gate: only deploy if metrics pass threshold
    "model_deployment",      # Push to Vertex AI Endpoint
    "monitoring_setup",      # Configure drift detection + alerts
]
```

### Level 2: CI/CD Pipeline Automation

Level 2 adds **CI/CD for the ML pipeline itself**. Changes to pipeline code, model architecture, or hyperparameters go through automated testing, building, and deployment — just like application code in traditional DevOps. This is full MLOps maturity.

🛠

#### CI: Continuous Integration

Test pipeline components (data validation logic, feature transforms, model code). Build pipeline artifacts. Validate pipeline DAG. Run unit + integration tests on every commit.

🚀

#### CD: Continuous Delivery

Deploy new pipeline versions to staging. Run full pipeline on test data. Validate model quality. Promote to production with approval gates. Automated rollback if metrics degrade.

🔍

#### CT: Continuous Training

Pipeline automatically retrains when triggered. Triggers include: new data arrival, scheduled intervals, data drift detected, model performance degradation below threshold.

| Capability | Level 0 | Level 1 | Level 2 |
| --- | --- | --- | --- |
| **Training** | Manual (notebook) | Automated pipeline | Automated pipeline |
| **Deployment unit** | Model file | ML pipeline | ML pipeline |
| **CI/CD** | None | None or minimal | Full CI/CD for pipeline code |
| **Continuous training** | No | Yes (triggered) | Yes (triggered) |
| **Monitoring** | None | Basic (model metrics) | Full (data + model + pipeline) |
| **Feature Store** | No | Yes | Yes |
| **Metadata tracking** | No | Yes | Yes |

## 03. Vertex AI MLOps Components

Vertex AI provides a **unified MLOps platform** with integrated components that work together. Understanding which component to use for each task is critical for the exam.

🔧

#### Vertex AI Pipelines

Orchestrate ML workflows as DAGs using Kubeflow Pipelines SDK. Automate data prep, training, evaluation, and deployment. Supports caching, conditional execution, and parallel steps.

📊

#### Vertex AI Experiments

Track, compare, and analyze experiment runs. Log metrics, parameters, and artifacts. Compare hyperparameter configurations side-by-side. Integrates with TensorBoard.

📦

#### Model Registry

Central repository for trained models. Version management, lineage tracking, deployment state. Organize models with labels and descriptions. Promote versions across environments.

🎯

#### Endpoints

Deploy models for online (real-time) or batch prediction. Traffic splitting across model versions. Auto-scaling, logging, and monitoring built in.

📚

#### Metadata Store

Track artifacts, executions, and their relationships. Full lineage from data source through pipeline to deployed model. Query lineage for debugging and compliance.

📊

#### Model Monitoring

Detect data drift, prediction drift, and feature attribution drift. Configure alert thresholds. Integrates with Cloud Monitoring for operational visibility.

>**Component Selection Guide:** **Need to orchestrate a workflow?** → Pipelines. **Need to track experiments?** → Experiments. **Need to version models?** → Model Registry. **Need to trace data lineage?** → Metadata Store. **Need to serve predictions?** → Endpoints. **Need to detect drift?** → Model Monitoring.

## 04. Vertex AI Experiments Deep Dive

Vertex AI Experiments provides a structured way to **track, compare, and reproduce** ML experiments. Every experiment run captures parameters, metrics, and artifacts — making it possible to answer "which configuration produced the best model?" at any time.

### Tracking Metrics and Parameters

An **experiment** groups related runs. Each **run** captures a single training attempt with specific hyperparameters, metrics, and artifacts.

```
from google.cloud import aiplatform

# Initialize Vertex AI
aiplatform.init(
    project="my-project",
    location="us-central1",
    experiment="fraud-detection-v2",
)

# Start a run within the experiment
with aiplatform.start_run("xgboost-run-001") as run:
    # Log hyperparameters
    run.log_params({
        "learning_rate": 0.01,
        "max_depth": 6,
        "n_estimators": 500,
        "subsample": 0.8,
    })

    # Train model...
    # model = train_xgboost(params)

    # Log metrics
    run.log_metrics({
        "auc_roc": 0.945,
        "precision": 0.89,
        "recall": 0.82,
        "f1_score": 0.854,
    })

    # Log time-series metrics (e.g., per epoch)
    for epoch in range(10):
        run.log_time_series_metrics({
            "train_loss": 0.5 - epoch * 0.04,
            "val_loss": 0.55 - epoch * 0.03,
        })
```

### Comparing Runs and Hyperparameter Tuning

Experiments lets you compare runs as a DataFrame, making it easy to identify the best-performing configuration. This integrates with Vertex AI Vizier for automated hyperparameter tuning.

```
# Get experiment results as a DataFrame
experiment_df = aiplatform.get_experiment_df("fraud-detection-v2")
print(experiment_df[[
    "run_name",
    "param.learning_rate",
    "param.max_depth",
    "metric.auc_roc",
    "metric.f1_score",
]].sort_values("metric.auc_roc", ascending=False))

# Find the best run
best_run = experiment_df.loc[experiment_df["metric.auc_roc"].idxmax()]
print(f"Best run: {best_run['run_name']}, AUC: {best_run['metric.auc_roc']}")
```

>**Integration:** Vertex AI Experiments integrates with **TensorBoard** for visualizing training curves, and with **Vertex AI Pipelines** for automatic experiment logging during pipeline runs. Each pipeline run can automatically create an experiment run with full parameter and metric tracking.

## 05. Model Registry

The Vertex AI Model Registry is a **centralized repository** for managing trained models across their lifecycle. It tracks versions, manages deployments, and maintains lineage back to the training data and pipeline that produced each model.

### Model Versioning and Lineage

Each model in the registry can have multiple **versions**. Versions are immutable snapshots that capture the model artifact, framework, container image, and metadata. Lineage connects each version to the experiment run, training pipeline, and dataset that produced it.

```
from google.cloud import aiplatform

# Upload a model to the registry
model = aiplatform.Model.upload(
    display_name="fraud-detector",
    artifact_uri="gs://my-bucket/models/fraud-v2/",
    serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/sklearn-cpu.1-3:latest",
    labels={"team": "fraud", "env": "production"},
    version_aliases=["champion", "v2"],
    version_description="XGBoost model trained on Q4 2025 data, AUC=0.945",
)
print(f"Model resource: {model.resource_name}")
print(f"Version ID: {model.version_id}")

# List all versions
versions = aiplatform.Model.list(
    filter='display_name="fraud-detector"'
)
for v in versions:
    print(f"  Version {v.version_id}: {v.version_aliases} - {v.version_description}")
```

### Deployment Management

The registry manages which model versions are deployed and where. You can use **version aliases** (like "champion" and "challenger") to implement blue-green or canary deployment patterns.

```
# Deploy from registry to an endpoint
endpoint = aiplatform.Endpoint.create(display_name="fraud-endpoint")

# Deploy champion model with 90% traffic
endpoint.deploy(
    model=model,
    deployed_model_display_name="champion-v2",
    traffic_percentage=90,
    machine_type="n1-standard-4",
    min_replica_count=1,
    max_replica_count=5,
)

# Deploy challenger model with 10% traffic (A/B test)
challenger = aiplatform.Model("projects/my-project/locations/us-central1/models/fraud-detector@challenger")
endpoint.deploy(
    model=challenger,
    deployed_model_display_name="challenger-v3",
    traffic_percentage=10,
    machine_type="n1-standard-4",
)
```

>**Version Aliases:** Use version aliases like `champion` and `challenger` to decouple deployment configuration from version numbers. When a challenger model proves better, simply reassign the `champion` alias — no endpoint redeployment needed.

## 06. Vertex AI Metadata Store

The Metadata Store captures the **full lineage** of your ML workflows — from raw data through feature engineering, training, evaluation, to deployed models. It answers questions like: "Which dataset was used to train this model?", "What pipeline produced this artifact?", and "Which models were trained on data from this source?"

### Artifacts and Executions

Metadata is organized into three core concepts:

-   **Artifacts** — datasets, models, metrics, schemas. Anything that is produced or consumed.
-   **Executions** — pipeline steps, training jobs, preprocessing runs. Actions that produce or consume artifacts.
-   **Events** — relationships between artifacts and executions (input/output edges in the lineage graph).

```
from google.cloud import aiplatform

# Log a dataset artifact
with aiplatform.start_run("training-run-042") as run:
    # Log input artifact (dataset)
    run.log_params({"dataset": "gs://bucket/data/fraud-2025q4.csv"})

    # After training, log the model artifact
    run.log_metrics({"auc": 0.945})

# Query lineage: which artifacts were produced by this execution?
experiment_df = aiplatform.get_experiment_df("fraud-detection-v2")
print(experiment_df)
```

### Lineage Tracking

Lineage tracking allows you to trace the complete history of any artifact — forward (what used this dataset?) or backward (what produced this model?). This is essential for **debugging** (why did model performance degrade?), **compliance** (which data trained this model?), and **reproducibility** (can I retrain this exact model?).

>**Metadata Store vs Experiments:** **Experiments** track runs with parameters and metrics at the experiment level. **Metadata Store** tracks artifacts, executions, and lineage at the platform level across all pipelines and runs. Experiments data is stored *in* the Metadata Store — Experiments is a higher-level API on top of it.

## 07. Continuous Training

Models degrade over time because the world changes — user behavior shifts, fraud patterns evolve, and market conditions fluctuate. **Continuous training (CT)** automatically retrains models to keep them current. This is a hallmark of Level 1+ MLOps maturity.

### Continuous Training Triggers

| Trigger Type | When to Use | Implementation |
| --- | --- | --- |
| **Scheduled** | Data arrives on a known cadence (daily, weekly) | Cloud Scheduler → Pub/Sub → Pipeline trigger |
| **Data drift** | Feature distributions shift significantly | Vertex AI Model Monitoring → alert → Cloud Function → Pipeline |
| **Performance degradation** | Model accuracy drops below threshold | Evaluation pipeline step → conditional retraining |
| **New data volume** | Sufficient new labeled data has accumulated | BigQuery row count trigger → Pipeline |
| **Manual** | Feature changes, architecture changes | Triggered by engineer via API or console |

```
# Continuous training trigger pattern
from google.cloud import aiplatform
from google.cloud import scheduler_v1

# Option 1: Schedule-based trigger (weekly retraining)
# Cloud Scheduler job triggers the pipeline via Pub/Sub
pipeline_job = aiplatform.PipelineJob(
    display_name="weekly-fraud-retrain",
    template_path="gs://my-bucket/pipelines/fraud-pipeline.yaml",
    pipeline_root="gs://my-bucket/pipeline-runs/",
    parameter_values={
        "training_data_uri": "bq://project.dataset.fraud_features",
        "threshold_auc": 0.92,
    },
)

# Create a recurring schedule
schedule = pipeline_job.create_schedule(
    display_name="weekly-fraud-retrain-schedule",
    cron="0 2 * * 0",  # Every Sunday at 2 AM
)

# Option 2: Drift-based trigger (conceptual)
# Model Monitoring detects drift -> sends alert -> Cloud Function triggers pipeline
# def handle_drift_alert(event, context):
#     if event["alertType"] == "feature_drift":
#         pipeline_job.submit()
```

>**Exam Alert:** The exam may ask: "A model's prediction quality has degraded. What should you implement?" The answer is **continuous training with a performance degradation trigger** — not simply redeploying the same model or manually retraining. The key is *automation*.

## 08. CI/CD for ML

CI/CD for ML extends traditional CI/CD to handle the unique challenges of ML systems. You must test not just code, but also **data quality**, **model quality**, and the **full pipeline**.

### Testing Strategy for ML Systems

| Test Type | What It Tests | Example |
| --- | --- | --- |
| **Data tests** | Schema conformance, distribution, completeness | No null values in required columns, feature ranges within bounds |
| **Feature tests** | Feature engineering logic correctness | Feature transform produces expected output for known input |
| **Model unit tests** | Model can train and predict on small data | Model trains without error on 100 samples, output shape correct |
| **Model quality tests** | Performance meets minimum thresholds | AUC > 0.90 on holdout set, latency < 100ms per prediction |
| **Integration tests** | Pipeline steps connect correctly | Full pipeline runs on test data without errors |
| **Serving tests** | Model serves correctly in container | Prediction endpoint returns valid JSON, handles edge cases |

### Deployment Gates

Deployment gates are automated checks that must pass before a model can be promoted to production. They prevent deploying models that are worse than the current production model.

```
# Deployment gate pattern in a Vertex AI Pipeline
def evaluate_and_gate(
    model_metrics: dict,
    baseline_metrics: dict,
    thresholds: dict,
) -> bool:
    """
    Deployment gate: model must beat baseline on all thresholds.
    Returns True if model should be deployed.
    """
    gates_passed = True

    # Gate 1: Absolute minimum performance
    if model_metrics["auc"] < thresholds["min_auc"]:
        print(f"FAIL: AUC {model_metrics['auc']:.3f} below minimum {thresholds['min_auc']}")
        gates_passed = False

    # Gate 2: Must beat or match current champion
    if model_metrics["auc"] < baseline_metrics["auc"] - thresholds["regression_tolerance"]:
        print(f"FAIL: AUC regressed vs champion")
        gates_passed = False

    # Gate 3: Latency requirement
    if model_metrics["p99_latency_ms"] > thresholds["max_latency_ms"]:
        print(f"FAIL: Latency {model_metrics['p99_latency_ms']}ms exceeds limit")
        gates_passed = False

    return gates_passed
```

>**Best Practice:** Always compare a new model against the **current production model** (champion), not just against absolute thresholds. A model with 0.91 AUC should not replace a champion with 0.95 AUC, even if 0.91 exceeds your minimum threshold of 0.90.

## 09. Vertex AI Pipelines Overview

Vertex AI Pipelines is the **orchestration engine** for MLOps. It runs ML workflows as directed acyclic graphs (DAGs) using the **Kubeflow Pipelines SDK v2** or **TFX**. Pipelines are covered in depth in Course 15 — here we focus on how they fit into the MLOps architecture.

🔧

#### Pipeline Components

Self-contained steps that take inputs and produce outputs. Each component runs in its own container. Google provides pre-built components for common tasks (BigQuery, AutoML, Custom Training).

🔄

#### Pipeline Features

Caching (skip unchanged steps), conditional execution, parallel branches, parameterized runs, artifact tracking, and automatic Metadata Store integration.

```
# Minimal Vertex AI Pipeline skeleton
from kfp import dsl
from google_cloud_pipeline_components.v1 import (
    bigquery as bq_components,
    custom_job as custom_components,
    endpoint as endpoint_components,
)

@dsl.pipeline(name="fraud-training-pipeline")
def fraud_pipeline(project: str, location: str):
    # Step 1: Extract training data from BigQuery
    data_op = bq_components.BigqueryQueryJobOp(
        query="SELECT * FROM fraud.features WHERE date > '2025-01-01'",
        project=project,
    )

    # Step 2: Train model (depends on data_op)
    train_op = custom_components.CustomTrainingJobOp(
        display_name="fraud-xgboost",
        script_path="train.py",
    ).after(data_op)

    # Step 3: Deploy (depends on train_op)
    deploy_op = endpoint_components.ModelDeployOp(
        model=train_op.outputs["model"],
    ).after(train_op)
```

## 10. Exam Focus

This section maps to **Section 5: Automating and orchestrating ML pipelines** on the GCP Machine Learning Engineer exam. Here are the key patterns to recognize.

### MLOps Maturity Assessment

>**Pattern Recognition:** When a scenario describes the current state, identify the maturity level and recommend the next step:  
> • Manual notebooks + hand-off → **Level 0** → Recommend: automated pipeline (Level 1)  
> • Automated pipeline but no CI/CD for pipeline code → **Level 1** → Recommend: CI/CD + testing (Level 2)  
> • Full automation with CI/CD, CT, and monitoring → **Level 2** → Already mature

### Choosing the Right Vertex AI Component

| Scenario | Best Component |
| --- | --- |
| "We need to compare different model architectures" | **Vertex AI Experiments** |
| "We need to track which dataset trained this model" | **Metadata Store** |
| "We need to manage multiple model versions" | **Model Registry** |
| "We need to automate our training workflow" | **Vertex AI Pipelines** |
| "We need to detect data distribution changes" | **Model Monitoring** |
| "We need to serve predictions with auto-scaling" | **Vertex AI Endpoints** |
| "We need to retrain weekly automatically" | **Pipeline Schedule + CT** |

### Key Exam Takeaways

-   MLOps is about deploying **pipelines**, not models. The pipeline is the deployable unit.
-   Continuous training requires **triggers** (schedule, drift, performance) and **validation gates**.
-   Data testing is as important as code testing in ML CI/CD.
-   Metadata Store provides **lineage**; Experiments provides **comparison**.
-   Model Registry manages **versions and aliases** for champion/challenger patterns.
-   Level 2 maturity adds CI/CD **for the pipeline code itself**, not just for the model.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** MLOps is the discipline of deploying, monitoring, and continuously improving ML models in production. It extends DevOps principles to machine learning by treating the **pipeline as the deployable unit**, not just the model. Google defines three maturity levels: Level 0 is manual (notebook-to-deployment), Level 1 adds automated training pipelines with triggers for data drift or schedule, and Level 2 adds CI/CD for the pipeline code itself — testing data schemas, model performance, and infrastructure as code. On GCP, Vertex AI provides integrated tooling: Experiments for tracking hyperparameters and metrics across runs, Model Registry for versioning with champion/challenger aliases, Metadata Store for full lineage from data to deployed endpoint, and Pipelines for orchestrating reproducible ML workflows. The key exam insight is that MLOps maturity is about **automation breadth** — Level 0 automates nothing, Level 1 automates training, Level 2 automates everything including testing and deployment of the pipeline itself.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| What are the three MLOps maturity levels and how do they differ? | Can you articulate the progression from manual processes to fully automated ML pipelines with CI/CD? |
| How does MLOps differ from traditional DevOps? | Do you understand that ML systems have data dependencies, model decay, and experiment tracking needs that standard DevOps doesn't address? |
| Walk me through how you would set up continuous training for a production model. | Can you design trigger-based retraining with validation gates, data checks, and automated deployment? |
| What role does experiment tracking play in MLOps, and how does Vertex AI Experiments work? | Do you know how to log metrics, compare runs, and use experiment results to make promotion decisions? |
| How do you implement CI/CD for ML pipelines on GCP? | Can you describe testing strategies (data validation, model performance tests, infrastructure tests) and deployment gates for ML systems? |

### Model Answers

**1\. MLOps maturity levels** — Level 0 (Manual) means data scientists train models in notebooks and hand them off to engineers for deployment. There is no automation, no monitoring, and retraining requires manual intervention. Level 1 (Pipeline Automation) introduces automated training pipelines triggered by schedules, data drift detection, or performance degradation. The pipeline handles data validation, feature engineering, training, evaluation, and deployment as a single orchestrated workflow. Feature stores ensure training-serving consistency. Level 2 (CI/CD Automation) adds automated testing and deployment of the pipeline code itself — unit tests for data processing components, integration tests for the full pipeline, model validation gates that compare against champion models, and infrastructure-as-code for reproducible environments. The key distinction: Level 1 automates model training, Level 2 automates pipeline development.

**2\. MLOps vs traditional DevOps** — Traditional DevOps manages code deployments where the same input always produces the same output. ML systems add three unique challenges: data dependencies (model behavior changes when data distribution shifts, even without code changes), model decay (performance degrades over time as real-world patterns evolve), and experiment management (teams run hundreds of training experiments with different hyperparameters, features, and architectures). MLOps addresses these by adding data validation pipelines, continuous monitoring for prediction drift, feature stores for consistent feature computation, experiment tracking for reproducibility, and model registries for versioning. The testing surface is also larger — you test not just code correctness but data quality, model performance, fairness metrics, and serving latency.

**3\. Setting up continuous training** — Start by defining triggers: a scheduled trigger (e.g., weekly retraining), a data-drift trigger (statistical tests detect distribution shifts in incoming features), and a performance trigger (monitoring shows accuracy dropping below a threshold). When triggered, the pipeline executes: pull fresh data, validate schemas and distributions against a reference baseline, compute features via the Feature Store, train the model, evaluate against hold-out data and the current champion model. If the new model passes all validation gates — accuracy above threshold, fairness metrics within bounds, latency under SLA — it is registered in Model Registry with a "challenger" alias. A canary deployment routes 5-10% of traffic to the challenger. If metrics hold, the alias is promoted to "champion" and traffic shifts fully.

**4\. Experiment tracking with Vertex AI** — Vertex AI Experiments provides a managed experiment tracking service integrated with the Vertex training infrastructure. You create an experiment, then log runs with parameters (learning rate, batch size, architecture), metrics (accuracy, loss, F1), and artifacts (model checkpoints, evaluation plots). The SDK lets you log metrics with `aiplatform.log_metrics()` and parameters with `aiplatform.log_params()`. The UI provides comparison views to visualize metric trends across runs, identify the best-performing configuration, and trace lineage from experiment to deployed model. This is critical for reproducibility — every production model can be traced back to the exact data, code, and parameters that produced it.

**5\. CI/CD for ML pipelines** — ML CI/CD has three testing layers. First, unit tests validate individual pipeline components — data preprocessing functions, feature transformations, and model inference logic. Second, integration tests run the full pipeline on a small dataset to verify end-to-end correctness, including data schema validation (using tools like TensorFlow Data Validation), feature distribution checks, and model output format verification. Third, model validation tests compare the newly trained model against the production champion on a held-out evaluation set — the new model must meet minimum performance thresholds and not regress on critical slices. Deployment gates enforce these checks: Cloud Build triggers on pipeline code changes, runs tests, and only deploys the updated pipeline if all gates pass. The pipeline itself then handles model deployment with canary or blue-green strategies.

### System Design Scenario

>**Design Challenge:** Your company operates an e-commerce recommendation engine serving 10 million users. The model retrains manually every quarter, and you have noticed recommendation quality degrades significantly within weeks of each retraining. Design an MLOps architecture on GCP that moves this system to Level 2 maturity.
> 
> A strong answer should cover:
> 
> -   **Continuous training triggers** — daily feature drift monitoring using Vertex Model Monitoring, scheduled weekly retraining, and performance-triggered retraining when click-through rate drops below threshold
> -   **Pipeline orchestration** — Vertex AI Pipelines with KFP components for data extraction (BigQuery), feature computation (Feature Store), training (Vertex Training with GPUs), evaluation, and conditional deployment
> -   **Testing and validation** — TFDV for schema validation, automated A/B comparison against champion model, fairness checks across user segments, and latency regression tests on the serving endpoint
> -   **Model management** — Model Registry with champion/challenger aliases, canary deployment routing 5% traffic to challenger, automated promotion based on online metrics after 48-hour evaluation window
> -   **CI/CD for pipeline code** — Cloud Build triggers on pipeline repo changes, unit and integration tests, pipeline deployment to staging environment first, then production after manual approval gate

### Common Mistakes

-   **Confusing model deployment with pipeline deployment** — Level 2 maturity means you have CI/CD for the pipeline code, not just for model artifacts. Many candidates describe automated model retraining (Level 1) and call it Level 2. The distinguishing factor is whether changes to the pipeline code itself go through automated testing and deployment.
-   **Ignoring data validation in CI/CD** — ML systems fail silently when data quality degrades. A proper MLOps setup validates data schemas, feature distributions, and label quality before training begins. Without data validation gates, you can retrain a model on corrupted data and deploy it automatically — making the automation harmful rather than helpful.
-   **Treating experiment tracking as optional** — Without experiment tracking, teams cannot reproduce results, compare approaches systematically, or audit why a particular model was deployed. Vertex AI Experiments provides lineage from training run to deployed endpoint, which is essential for debugging production issues and meeting compliance requirements.

Previous Course

[08 · Production ML Systems](08-production-ml-systems.html)

Next Course

[10 · Feature Store](10-mlops-feature-store.html)

Manage Features