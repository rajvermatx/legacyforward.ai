---
title: "ML Pipelines on Google Cloud"
slug: "ml-pipelines-gcp"
description: "Production ML is not a single model — it is an orchestrated system of data ingestion, validation,
    transformation, training, evaluation, and deployment. This module covers TFX, Kubeflow Pipelines,
    Vertex AI Pipelines, and Cloud Composer so you can build reproducible, auditable, and fully auto"
section: "gcp-mle"
order: 15
badges:
  - "TFX Components"
  - "Kubeflow Pipelines"
  - "Vertex AI Pipelines"
  - "Cloud Composer"
  - "ML Metadata & CI/CD"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/15-ml-pipelines-gcp.ipynb"
---

## 01. Why ML Pipelines

### Reproducibility

In production ML, a model is retrained weekly or daily. Without a pipeline, each training run may use different data splits, feature transformations, or hyperparameters. **Pipelines encode the exact sequence of steps** so that every run produces a deterministic, reproducible result. Each artifact (dataset, model, metrics) is versioned and tracked.

Key benefits: identical results across environments (dev, staging, prod), ability to roll back to any previous pipeline run, and compliance with audit requirements in regulated industries (healthcare, finance).

### Automation and Auditability

**Automation** eliminates manual steps that cause errors. A pipeline can be triggered by a schedule (daily retrain), an event (new data arriving in BigQuery), or a CI/CD commit. Each step passes artifacts to the next through a shared metadata store.

**Auditability** comes from ML Metadata (MLMD). Every execution records inputs, outputs, parameters, and the code version used. You can answer questions like "Which training data produced the model currently serving predictions?" — critical for debugging and regulatory compliance.

>**Exam Tip:** When the exam asks "how to ensure reproducibility in ML workflows," the answer is always an orchestrated pipeline with artifact tracking — not manual notebook runs.

## 02. TFX (TensorFlow Extended)

TFX is Google's open-source, production-ready ML pipeline framework. It provides a set of **standard components** that handle every stage of the ML lifecycle. Each component consumes and produces **typed artifacts** tracked by ML Metadata.

### Data Components

1

#### ExampleGen

Ingests data from sources (CSV, TFRecord, BigQuery, Avro) and splits into train/eval sets. Supports span-based ingestion for incremental data loading. Outputs `tf.Example` records.

2

#### StatisticsGen

Computes descriptive statistics (mean, std, histograms, missing values) over the dataset using TensorFlow Data Validation (TFDV). Output is a `DatasetFeatureStatisticsList` proto.

3

#### SchemaGen

Infers a schema from statistics — feature types, ranges, domains, required vs optional. The schema acts as a contract: any future data violating it triggers an alert.

4

#### ExampleValidator

Compares incoming data statistics against the schema. Detects anomalies: unexpected categories, out-of-range values, training-serving skew, and distribution drift between train and eval splits.

5

#### Transform

Applies feature engineering using `tf.Transform`. The transform graph is saved and applied identically at serving time — eliminating training-serving skew for feature processing. Supports bucketization, vocabulary lookup, scaling, and cross features.

### Training and Tuning

6

#### Trainer

Trains the model using a user-defined `run_fn`. Supports TensorFlow, Keras, and custom estimators. Can run locally or on Vertex AI Training with GPUs/TPUs. Consumes transformed examples and the transform graph.

7

#### Tuner

Performs hyperparameter tuning using KerasTuner or Vertex AI Vizier. Outputs the best hyperparameters as an artifact consumed by the Trainer component.

### Evaluation and Deployment

8

#### Evaluator

Uses TensorFlow Model Analysis (TFMA) to compute metrics across data slices. Validates the candidate model against a baseline using configurable thresholds. Produces a `blessing` artifact — only blessed models proceed to deployment.

9

#### InfraValidator

Spins up a sandboxed TensorFlow Serving instance and sends test requests to verify the model can actually be loaded and served. Catches issues like incompatible SavedModel signatures before production deployment.

10

#### Pusher

Pushes a blessed and infra-validated model to the serving infrastructure: a file system path, TensorFlow Serving, or Vertex AI Endpoints. Only executes if both Evaluator and InfraValidator approve.

>**Key Concept:** The TFX pipeline enforces a **gate pattern**: data must pass validation, the model must beat a baseline, and infrastructure must pass health checks before any model reaches production.

## 03. TFX Pipeline Orchestration

TFX pipelines are defined in Python but require an **orchestrator** to execute the DAG of components. The pipeline definition is portable across orchestrators.

| Orchestrator | Use Case | Managed? |
| --- | --- | --- |
| **Local (BeamDagRunner)** | Development and testing on a single machine | No |
| **Vertex AI Pipelines** | Production GCP workloads, serverless, auto-scaling | Yes (fully managed) |
| **Kubeflow Pipelines** | On-prem or multi-cloud Kubernetes environments | No (self-hosted on GKE) |
| **Cloud Composer (Airflow)** | Complex multi-system DAGs beyond ML (ETL + ML + notifications) | Yes (managed Airflow) |

```
# Defining a TFX pipeline (orchestrator-agnostic)
from tfx.orchestration import pipeline

ml_pipeline = pipeline.Pipeline(
    pipeline_name='my-ml-pipeline',
    pipeline_root='gs://my-bucket/pipeline-root',
    components=[
        example_gen, statistics_gen, schema_gen,
        example_validator, transform, trainer,
        evaluator, infra_validator, pusher
    ],
    metadata_connection_config=metadata.sqlite_metadata_connection_config(
        'metadata.db'
    )
)
```

## 04. Custom TFX Components

When standard TFX components do not cover your needs (e.g., custom data validation, notification steps, non-TF model training), you can create custom components.

### Python Function-Based Components

The simplest approach. Decorate a Python function with `@component`. Inputs and outputs are declared as typed parameters. The function runs in the same process as the orchestrator.

```
from tfx.dsl.component.experimental.decorators import component
from tfx.dsl.component.experimental.annotations import InputArtifact, OutputArtifact, Parameter
from tfx.types.standard_artifacts import Model, String

@component
def notify_slack(
    model: InputArtifact[Model],
    channel: Parameter[str],
    status: OutputArtifact[String]
):
    # Custom logic to post model metrics to Slack
    import requests
    model_uri = model.uri
    requests.post(webhook_url, json={"text": f"Model at {model_uri} is ready"})
    status.value = "notified"
```

### Container-Based Components

For components that need a specific runtime (e.g., PyTorch, R, custom C++ binaries), use container-based components. You define a Docker image and the component runs as a container. This is essential for non-Python workloads or components needing GPU drivers.

>**Exam Warning:** Know when to use function-based vs container-based: function-based for simple Python logic, container-based when you need a different runtime, specific library versions, or GPU access.

## 05. Kubeflow Pipelines (KFP)

Kubeflow Pipelines is an open-source platform for building and deploying ML workflows on Kubernetes. Unlike TFX (which is TensorFlow-specific), KFP is **framework-agnostic** — you can use PyTorch, scikit-learn, XGBoost, or any framework.

### KFP SDK Core Concepts

-   **Component** — A self-contained step (Python function or container image) with typed inputs/outputs
-   **Pipeline** — A DAG of components connected by data dependencies
-   **Run** — A single execution of a pipeline with specific parameters
-   **Experiment** — A logical grouping of runs for comparison and tracking
-   **Artifact** — Typed output (Dataset, Model, Metrics, HTML) tracked by the metadata store

```
# KFP v2 component definition
from kfp import dsl
from kfp.dsl import Input, Output, Dataset, Model, Metrics

@dsl.component(base_image="python:3.10")
def train_model(
    training_data: Input[Dataset],
    model: Output[Model],
    metrics: Output[Metrics],
    learning_rate: float = 0.01
):
    import pickle
    from sklearn.ensemble import GradientBoostingClassifier

    X_train, y_train = load_data(training_data.path)
    clf = GradientBoostingClassifier(learning_rate=learning_rate)
    clf.fit(X_train, y_train)

    with open(model.path, 'wb') as f:
        pickle.dump(clf, f)
    metrics.log_metric("accuracy", clf.score(X_train, y_train))
```

```
# Define a pipeline
@dsl.pipeline(name="training-pipeline")
def my_pipeline(learning_rate: float = 0.01):
    preprocess_task = preprocess_data()
    train_task = train_model(
        training_data=preprocess_task.outputs["output_data"],
        learning_rate=learning_rate
    )
    evaluate_task = evaluate_model(
        model=train_task.outputs["model"]
    )
```

## 06. Vertex AI Pipelines

Vertex AI Pipelines is Google's **fully managed** pipeline orchestration service. It runs KFP v2 and TFX pipelines without requiring you to manage a Kubernetes cluster. Pipelines are compiled to YAML/JSON and submitted via the SDK or console.

### Key Features

-   **Serverless** — No cluster management; pay only for compute used during execution
-   **Pipeline Caching** — Skips steps whose inputs haven't changed, saving time and cost
-   **Scheduling** — Trigger pipelines on a cron schedule or via Cloud Scheduler
-   **Lineage** — Full artifact lineage tracking integrated with Vertex ML Metadata
-   **Google Cloud Pipeline Components** — Pre-built components for AutoML, BigQuery, Dataflow, and more

```
# Compile and submit to Vertex AI Pipelines
from kfp import compiler
from google.cloud import aiplatform

# Compile pipeline to JSON
compiler.Compiler().compile(
    pipeline_func=my_pipeline,
    package_path="pipeline.json"
)

# Submit to Vertex AI
aiplatform.init(project="my-project", location="us-central1")

job = aiplatform.PipelineJob(
    display_name="training-pipeline-run",
    template_path="pipeline.json",
    parameter_values={"learning_rate": 0.001},
    enable_caching=True
)
job.submit(service_account="my-sa@my-project.iam.gserviceaccount.com")
```

>**Caching Strategy:** Pipeline caching is **enabled by default** on Vertex AI Pipelines. Each component's cache key is computed from its inputs, parameters, and container image. To force re-execution, set `enable_caching=False` or change a component's inputs.

## 07. Cloud Composer (Managed Airflow)

Cloud Composer is Google's managed **Apache Airflow** service. While Vertex AI Pipelines is purpose-built for ML, Composer excels when your workflow involves **cross-system orchestration**: ETL from multiple sources, ML training, post-processing, notifications, and data warehouse updates in a single DAG.

### When to Use Composer vs Vertex Pipelines

| Criterion | Vertex AI Pipelines | Cloud Composer |
| --- | --- | --- |
| Primary use | ML-specific pipelines | General-purpose orchestration |
| Artifact tracking | Built-in ML Metadata | Must add manually |
| Non-ML tasks | Limited | Excellent (1000+ operators) |
| Pricing | Pay per pipeline run | Always-on cluster cost |
| ML component library | Google Cloud Pipeline Components | Generic operators |

```
# Cloud Composer DAG example
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.google.cloud.operators.vertex_ai.custom_job import (
    CreateCustomTrainingJobOperator
)
from airflow.providers.google.cloud.operators.bigquery import (
    BigQueryInsertJobOperator
)
from datetime import datetime, timedelta

default_args = {
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="ml_retrain_pipeline",
    schedule_interval="@weekly",
    start_date=datetime(2026, 1, 1),
    default_args=default_args,
    catchup=False,
) as dag:

    extract_data = BigQueryInsertJobOperator(
        task_id="extract_training_data",
        configuration={"query": {"query": "SELECT * FROM dataset.features"}}
    )

    train_model = CreateCustomTrainingJobOperator(
        task_id="train_model",
        display_name="weekly-retrain",
        script_path="trainer/task.py",
        container_uri="us-docker.pkg.dev/vertex-ai/training/tf-gpu.2-12:latest",
    )

    extract_data >> train_model
```

## 08. ML Metadata (MLMD)

ML Metadata is the backbone of pipeline traceability. Every TFX and Vertex AI Pipeline run automatically records metadata about **artifacts**, **executions**, and **contexts**.

### Core Concepts

A

#### Artifacts

Typed data objects: datasets, models, metrics, schemas. Each has a URI, type, properties, and a unique ID. Artifacts are immutable once created.

E

#### Executions

Records of component runs. Each execution links input artifacts to output artifacts, recording parameters, start/end times, and status (COMPLETE, FAILED, CACHED).

C

#### Contexts

Logical groupings (pipeline run, experiment). A context groups related executions and artifacts, enabling queries like "show all artifacts from pipeline run #42."

### Lineage Queries

Lineage lets you trace **forward** (what was produced from this dataset?) and **backward** (what data and code produced this model?). On Vertex AI, lineage is queryable through the Vertex ML Metadata API.

```
# Query artifact lineage on Vertex AI
from google.cloud import aiplatform

aiplatform.init(project="my-project", location="us-central1")

# Get all artifacts from a specific pipeline run context
context = aiplatform.Context("projects/my-project/locations/us-central1/metadataStores/default/contexts/pipeline-run-123")
artifacts = context.query_artifacts()

for artifact in artifacts:
    print(f"{artifact.display_name}: {artifact.uri}")
```

## 09. CI/CD for ML Pipelines

CI/CD for ML goes beyond application code. You must test **data processing logic**, **model quality gates**, and **pipeline integration** before deploying pipeline changes to production.

### Testing Layers

| Layer | What to Test | Tool |
| --- | --- | --- |
| **Unit tests** | Individual component logic (transform functions, feature engineering) | pytest, unittest |
| **Component tests** | Component input/output contracts, artifact types | KFP local runner, TFX test utilities |
| **Integration tests** | Full pipeline end-to-end on small data | Local pipeline runner, CI environment |
| **System tests** | Pipeline on actual GCP infrastructure | Vertex AI Pipelines (staging project) |

### Deployment Automation

A typical CI/CD flow: (1) developer pushes pipeline code to a branch, (2) Cloud Build triggers unit and component tests, (3) on merge to main, Cloud Build compiles the pipeline and submits an integration test run, (4) on success, the pipeline is registered and scheduled in the production project.

>**Best Practice:** Use separate GCP projects for dev, staging, and production. Pipeline artifacts (compiled YAML) should be stored in Artifact Registry. The same compiled pipeline runs across environments with different parameter values.

## 10. MLflow on GCP

MLflow is an open-source platform for experiment tracking, model packaging, and model registry. While Vertex AI provides native equivalents, many teams use MLflow for its **framework-agnostic** approach and portability across clouds.

### MLflow vs Vertex AI Native Tools

| Capability | MLflow | Vertex AI |
| --- | --- | --- |
| Experiment tracking | MLflow Tracking (runs, params, metrics, artifacts) | Vertex AI Experiments |
| Model registry | MLflow Model Registry (stages, versions, aliases) | Vertex AI Model Registry |
| Model serving | MLflow Models (local, Docker) | Vertex AI Endpoints (managed, auto-scaling) |
| Pipeline orchestration | MLflow Projects (limited) | Vertex AI Pipelines (full DAG support) |
| Multi-cloud | Yes (portable across clouds) | GCP only |

### Running MLflow on GCP

Common deployment patterns: (1) MLflow Tracking Server on a GCE VM or GKE pod, backed by Cloud SQL (PostgreSQL) for metadata and GCS for artifact storage. (2) Use Vertex AI Workbench notebooks with the MLflow client for interactive experiment tracking.

```
# MLflow experiment tracking on GCP
import mlflow

mlflow.set_tracking_uri("http://mlflow-server:5000")
mlflow.set_experiment("fraud-detection-v2")

with mlflow.start_run():
    mlflow.log_param("learning_rate", 0.01)
    mlflow.log_param("n_estimators", 100)

    # Train model...
    mlflow.log_metric("auc", 0.94)
    mlflow.log_metric("f1", 0.87)

    # Log model to GCS-backed artifact store
    mlflow.sklearn.log_model(model, "model")
```

## 11. Exam Focus

### Choosing the Right Orchestrator

>**Decision Framework:** **Pure ML pipeline?** Use Vertex AI Pipelines (managed, serverless, ML-native).  
> **ML + ETL + notifications + cross-system?** Use Cloud Composer (Airflow).  
> **On-prem or multi-cloud Kubernetes?** Use self-hosted Kubeflow Pipelines.  
> **TensorFlow-specific with built-in data validation?** Use TFX on any orchestrator.

### TFX Component Roles

The exam frequently tests whether you know which component handles which task:

-   **Data drift detection?** ExampleValidator (compares statistics against schema)
-   **Feature engineering at scale?** Transform (tf.Transform, same graph at serving)
-   **Model quality gate?** Evaluator (TFMA, threshold-based blessing)
-   **Can the model be served?** InfraValidator (test-loads in sandbox)
-   **Hyperparameter search?** Tuner (KerasTuner or Vertex AI Vizier)
-   **Push model to production?** Pusher (only after blessing + infra validation)

### Pipeline Debugging

Common debugging strategies: (1) Check ML Metadata for failed executions and their input artifacts. (2) Review component logs in Cloud Logging. (3) Use pipeline caching to re-run only the failed step. (4) Run the pipeline locally with a small data sample first. (5) Check for training-serving skew in the Transform component output.

>**Exam Pattern:** Questions about pipeline failures often have "check ML Metadata / artifact lineage" as the correct answer, not "re-run the entire pipeline" or "check the model code."

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Production ML is not about training a single model—it is about orchestrating an end-to-end pipeline that ingests data, validates it, transforms features, trains models, evaluates against baselines, and deploys to serving infrastructure. On GCP, three orchestration layers serve different needs: TFX provides opinionated ML-specific components (ExampleGen, Transform, Trainer, Evaluator, Pusher) with built-in best practices. Kubeflow Pipelines (KFP) offers framework-agnostic pipeline authoring with a Python SDK that compiles to containers on Kubernetes. Vertex AI Pipelines is the managed service that runs KFP or TFX pipelines serverlessly with integrated ML Metadata for artifact tracking and lineage. Cloud Composer (managed Airflow) handles broader data engineering orchestration when ML is one step in a larger ETL workflow. The key architectural principle is that every artifact—data, features, models, metrics—is versioned, tracked, and reproducible through ML Metadata.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| Why use ML pipelines instead of notebooks in production? | Do you understand reproducibility, automation, auditability, and the risks of manual, ad-hoc ML workflows? |
| When would you choose Vertex AI Pipelines vs Cloud Composer? | Can you distinguish ML-specific orchestration (pipelines with artifact tracking) from general workflow orchestration (Airflow DAGs)? |
| What is ML Metadata and why does it matter? | Do you understand artifact lineage, experiment tracking, and how metadata enables debugging, reproducibility, and governance? |
| How do you implement CI/CD for ML pipelines? | Can you describe the three levels: CI for pipeline code, CD for pipeline deployment, and CT (continuous training) for automated retraining? |
| What are the key TFX components and how do they work together? | Can you trace data flow through ExampleGen, StatisticsGen, SchemaGen, Transform, Trainer, Evaluator, and Pusher? |

### Model Answers

**Pipelines vs Notebooks:** Notebooks are great for exploration but fail in production for several reasons: they don’t enforce execution order (cells can be run out of sequence), they mix code with state, they’re hard to version control, and they don’t support automated scheduling or monitoring. ML pipelines encode the workflow as a directed acyclic graph (DAG) where each step is a containerized component with explicit inputs and outputs. This gives you reproducibility (same code + same data = same result), automation (schedule or trigger-based execution), and auditability (ML Metadata tracks every artifact’s lineage).

**Vertex AI Pipelines vs Cloud Composer:** Vertex AI Pipelines is purpose-built for ML workflows—it natively understands ML artifacts (datasets, models, metrics), integrates with the Vertex AI Model Registry, and supports pipeline caching to skip unchanged steps. Use it when the workflow is ML-centric. Cloud Composer (managed Airflow) is better when ML training is one task in a larger data engineering pipeline that includes ETL, data warehouse updates, report generation, and cross-system orchestration. In practice, many teams use Cloud Composer to trigger Vertex AI Pipeline runs as part of a broader workflow.

**CI/CD for ML:** I implement three layers. CI validates pipeline code: unit tests for individual components, integration tests with small data samples, and schema validation. CD automates pipeline deployment: merging to main triggers pipeline compilation and registration in Vertex AI. CT (continuous training) is ML-specific: data drift detection or scheduled triggers automatically re-execute the pipeline, evaluate the new model against the current production model, and promote it only if it passes quality gates. The entire flow is tracked in ML Metadata so any model in production can be traced back to its exact training data, code version, and hyperparameters.

### System Design Scenario

>**Design Prompt:** **Scenario:** A logistics company wants to build an automated ML pipeline that retrains a delivery time prediction model weekly, validates data quality, and only deploys the new model if it outperforms the current one. Design the architecture on GCP.
> 
> **Approach:** Use Vertex AI Pipelines with KFP SDK to define the DAG. Step 1: ExampleGen ingests the latest week’s delivery data from BigQuery. Step 2: StatisticsGen + SchemaGen validate data quality against the expected schema; the pipeline halts on anomalies. Step 3: Transform applies feature engineering (distance calculations, time-of-day encoding, historical delivery patterns) stored in Vertex AI Feature Store for training-serving consistency. Step 4: Trainer runs a custom XGBoost container on Vertex AI Training with hyperparameter tuning. Step 5: Evaluator compares the new model’s MAE against the current production model using a blessed threshold—only if it improves by at least 2% does it proceed. Step 6: Pusher deploys to the Vertex AI Endpoint with 10% canary traffic. Cloud Composer triggers the pipeline every Sunday at 2 AM and sends Slack alerts on failures. ML Metadata tracks every run for audit.

### Common Mistakes

-   **Skipping data validation in the pipeline** — Without schema validation (SchemaGen) and statistics checks (StatisticsGen), your pipeline will silently train on corrupted or drifted data. Data validation is the most important step because garbage in equals garbage out.
-   **Not using pipeline caching** — Re-running data ingestion and transformation when only the training hyperparameters changed wastes hours of compute. Vertex AI Pipelines supports step-level caching—unchanged steps are skipped automatically.
-   **Confusing orchestration tools** — Using Cloud Composer for ML-specific workflows loses ML Metadata integration and artifact tracking. Using Vertex AI Pipelines for complex cross-system ETL forces ML tools into a general orchestration role. Match the tool to the workflow type.

Previous

[← 14 · MLOps & Model Evaluation](14-mlops-model-evaluation.html)

Next

[16 · Build & Deploy on Vertex AI →](16-build-deploy-vertex-ai.html)