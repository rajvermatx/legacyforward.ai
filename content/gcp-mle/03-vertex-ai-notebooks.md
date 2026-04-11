---
title: "Notebook Environments for ML on GCP"
slug: "vertex-ai-notebooks"
description: "GCP offers multiple notebook environments — from serverless Colab Enterprise to fully customizable
    Vertex AI Workbench instances. This module helps you understand the trade-offs, configure runtimes,
    integrate with data services, and choose the right environment for every scenario on the MLE "
section: "gcp-mle"
order: 3
badges:
  - "Colab Enterprise"
  - "Vertex AI Workbench"
  - "Runtime Configuration"
  - "Data Integration"
  - "Security & IAM"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/03-vertex-ai-notebooks.ipynb"
---

## 01. Notebook Options on GCP

Google Cloud provides several Jupyter-based notebook environments, each optimized for different workflows. Understanding the differences is critical for the MLE exam and for real-world architecture decisions.

⚡

#### Colab Enterprise

Serverless, zero-config notebooks in the Google Cloud console. Built for collaboration with IAM integration, no infrastructure to manage. Ideal for quick exploration and sharing.

⚙

#### Vertex AI Workbench — Managed

Google-managed JupyterLab instances with automatic updates, health monitoring, and built-in integrations. Good balance of control and convenience.

🛠

#### Vertex AI Workbench — User-Managed

Full VM-based notebooks with persistent disk, deep customization, GPU/TPU access, and the ability to install arbitrary software. Best for heavy training and custom environments.

📚

#### JupyterLab on Compute Engine

Self-hosted JupyterLab on a GCE VM or GKE. Maximum flexibility but requires manual setup, patching, and security hardening.

### Decision Matrix: When to Use Each Option

| Criteria | Colab Enterprise | Workbench Managed | Workbench User-Managed | Self-Hosted JupyterLab |
| --- | --- | --- | --- | --- |
| **Setup Effort** | None (serverless) | Low (click-to-create) | Medium (configure VM) | High (manual install) |
| **Custom Packages** | pip install in cell | Container customization | Full OS-level control | Full OS-level control |
| **GPU/TPU** | Limited (runtime types) | T4, V100, A100 | Any available accelerator | Any available accelerator |
| **Persistent Disk** | No (ephemeral) | Yes | Yes (customizable size) | Yes (custom) |
| **Collaboration** | Excellent (real-time) | Share via IAM | Single user per instance | Manual setup |
| **IAM Integration** | Native | Native | Native | Manual |
| **Idle Shutdown** | Automatic | Configurable | Configurable | Manual |
| **Cost Model** | Pay-per-use (compute) | VM pricing | VM pricing + disk | VM pricing + disk |
| **Best For** | Quick prototyping, sharing | Team data science | Heavy training, custom envs | Max control, compliance |

>**Exam Tip:** The exam loves asking "which notebook environment should you use?" scenarios. Key signals: **collaboration + no setup** = Colab Enterprise. **custom containers + managed** = Workbench Managed. **full OS control + GPU** = Workbench User-Managed.

## 02. Colab Enterprise

Colab Enterprise brings the familiar Google Colab experience into the Google Cloud console with enterprise-grade security, compliance, and data governance. Notebooks run on serverless infrastructure with no VM to manage.

### Key Features

-   **Serverless & Zero-Config:** No VMs to create, patch, or manage. Runtimes spin up on demand
-   **Real-Time Collaboration:** Multiple users can edit the same notebook simultaneously, similar to Google Docs
-   **IAM Integration:** Access controlled via Cloud IAM roles — `roles/aiplatform.colabEnterpriseUser`
-   **VPC Service Controls:** Notebooks can be placed within a VPC-SC perimeter for data exfiltration prevention
-   **Org Policies:** Admins can enforce notebook-level restrictions (e.g., no external network)
-   **BigQuery Integration:** Native connectors for querying directly from notebook cells

**Runtime types** determine the compute available. You can select CPU-only, GPU-enabled (T4), or high-memory runtimes. Runtimes are ephemeral — when disconnected, local files are lost. Persist results to Cloud Storage or BigQuery.

```
# Colab Enterprise — query BigQuery directly
from google.cloud import bigquery

client = bigquery.Client(project="my-project")
query = """
    SELECT name, SUM(number) as total
    FROM `bigquery-public-data.usa_names.usa_1910_2013`
    GROUP BY name
    ORDER BY total DESC
    LIMIT 10
"""
df = client.query(query).to_dataframe()
df.head()
```

>**Key Difference:** Colab Enterprise is NOT the same as free Google Colab. Colab Enterprise notebooks run inside your GCP project with your data governance, IAM policies, and networking. Free Colab runs on Google's shared infrastructure outside your project boundary.

## 03. Vertex AI Workbench

Vertex AI Workbench provides JupyterLab-based notebook instances backed by Compute Engine VMs. There are two variants: **Managed Notebooks** and **User-Managed Notebooks**.

### Managed Notebooks

Managed notebooks are Google-maintained JupyterLab instances. Google handles kernel updates, security patches, and health monitoring. You choose the machine type, then get a JupyterLab URL that is authenticated via IAM.

```
# Create a managed notebook instance via gcloud
gcloud notebooks instances create my-managed-notebook \
  --location=us-central1-a \
  --machine-type=n1-standard-4 \
  --vm-image-project=deeplearning-platform-release \
  --vm-image-family=common-cpu-notebooks
```

**Key properties:** automatic idle shutdown, environment health checks, integration with Vertex AI services (training, pipelines, endpoints), and support for custom containers.

### User-Managed Notebooks

User-managed notebooks give you a full Compute Engine VM with JupyterLab installed via Deep Learning VM images. You have **root/sudo access**, can install arbitrary packages at the OS level, configure networking, and attach multiple GPUs.

```
# Create a user-managed notebook with GPU
gcloud notebooks instances create my-gpu-notebook \
  --location=us-central1-a \
  --machine-type=n1-standard-8 \
  --accelerator-type=NVIDIA_TESLA_T4 \
  --accelerator-core-count=1 \
  --vm-image-project=deeplearning-platform-release \
  --vm-image-family=tf-latest-gpu \
  --boot-disk-size=200GB \
  --install-gpu-driver
```

>**Cost Warning:** User-managed notebooks incur VM costs even when idle unless you configure auto-shutdown or manually stop the instance. Always set `--idle-shutdown-timeout` to avoid surprise bills. Stopped instances still incur disk charges.

| Feature | Managed Notebooks | User-Managed Notebooks |
| --- | --- | --- |
| OS-level access (sudo) | No | Yes |
| Auto-patching | Yes (Google-managed) | No (your responsibility) |
| Custom containers | Yes (specify container URI) | Yes (Deep Learning VM images) |
| Multi-GPU support | Limited | Full (up to 8 GPUs) |
| Scheduled notebooks | Yes (built-in) | Via nbconvert + cron or Cloud Scheduler |
| Health monitoring | Automatic | Manual or via Cloud Monitoring |

## 04. Runtime Configuration

### Machine Types and Accelerators

Choosing the right machine type depends on your workload. For data exploration, a standard CPU machine is sufficient. For model training, you need GPU-accelerated instances.

| Machine Type | vCPUs | Memory | Best For |
| --- | --- | --- | --- |
| `n1-standard-4` | 4 | 15 GB | Light exploration, small datasets |
| `n1-standard-8` | 8 | 30 GB | Medium workloads, feature engineering |
| `n1-highmem-16` | 16 | 104 GB | Large in-memory datasets |
| `a2-highgpu-1g` | 12 | 85 GB + A100 40GB | Deep learning training |

**Accelerator options:**

-   **NVIDIA T4:** Cost-effective for inference and light training (16GB VRAM)
-   **NVIDIA V100:** Good for medium-scale training (16/32GB HBM2)
-   **NVIDIA A100:** High-end training and large models (40/80GB HBM2e)
-   **TPU v2/v3:** Best for TensorFlow/JAX workloads at scale

### Idle Shutdown

Idle shutdown automatically stops a notebook instance after a period of inactivity. This is critical for cost management, especially with GPU instances.

```
# Set idle shutdown to 60 minutes on an existing instance
gcloud notebooks instances update my-notebook \
  --location=us-central1-a \
  --idle-shutdown-timeout=60m

# Disable idle shutdown (not recommended for GPU instances)
gcloud notebooks instances update my-notebook \
  --location=us-central1-a \
  --no-idle-shutdown
```

>**Best Practice:** Always set idle shutdown to 30–90 minutes for GPU-attached notebooks. For CPU-only exploration notebooks, 120 minutes is a reasonable default. Monitor costs via billing alerts tied to notebook instance labels.

## 05. Git Integration and Version Control

All Vertex AI notebook environments support Git integration for version-controlling your notebooks, scripts, and configuration files.

### Workbench Git Integration

Vertex AI Workbench instances include a built-in Git UI in JupyterLab. You can clone repos, create branches, commit, and push directly from the sidebar. For Cloud Source Repositories or GitHub, configure SSH keys or use `gcloud` credential helpers.

```
# Clone a repo inside your notebook instance
git clone https://source.developers.google.com/p/my-project/r/my-repo

# Or use GitHub with SSH
git clone git@github.com:my-org/ml-notebooks.git

# Configure credential helper for Cloud Source Repos
git config --global credential.helper gcloud.sh
```

### Colab Enterprise Git Support

In Colab Enterprise, notebooks are stored in Cloud Storage buckets by default. You can integrate with GitHub by connecting your repository and syncing notebooks. Changes are committed via the Colab Enterprise UI or programmatically.

>**Version Control Strategy:** For production ML workflows, store notebooks in Git but keep outputs stripped to avoid merge conflicts. Use `nbstripout` as a Git filter. For experiment tracking, complement Git with Vertex AI Experiments or MLflow.

## 06. Data Access Patterns

Notebooks on GCP can connect to multiple data sources. The three most common patterns for ML workflows are BigQuery, Cloud Storage, and Vertex AI Feature Store.

### BigQuery Integration

BigQuery is the primary data warehouse for ML on GCP. You can query data directly from notebooks using the `google-cloud-bigquery` client library or BigQuery cell magic.

```
# Method 1: Python client
from google.cloud import bigquery
client = bigquery.Client()
df = client.query("SELECT * FROM `project.dataset.table` LIMIT 1000").to_dataframe()

# Method 2: BigQuery cell magic (in Colab / Workbench)
%%bigquery df
SELECT *
FROM `bigquery-public-data.ml_datasets.penguins`
WHERE body_mass_g IS NOT NULL
LIMIT 100
```

### Cloud Storage Access

```
# Read a CSV from Cloud Storage
from google.cloud import storage
import pandas as pd

# Direct pandas read via gcsfs (installed by default)
df = pd.read_csv("gs://my-bucket/data/training.csv")

# Or use the storage client for binary files
client = storage.Client()
bucket = client.get_bucket("my-bucket")
blob = bucket.blob("models/saved_model.pb")
blob.download_to_filename("local_model.pb")
```

### Vertex AI Feature Store

```
# Read features from Vertex AI Feature Store
from google.cloud import aiplatform

aiplatform.init(project="my-project", location="us-central1")

feature_store = aiplatform.Featurestore(featurestore_name="my_featurestore")

# Batch read features for training
df = feature_store.batch_serve_to_df(
    serving_feature_ids={
        "users": ["age", "tenure", "spending_score"],
        "products": ["category", "price"]
    },
    read_instances_df=entity_df
)
```

>**Performance Tip:** For large BigQuery tables, avoid downloading everything to the notebook. Use `%%bigquery` with aggregation/filtering, or use BigQuery DataFrames (`bigframes`) which push computation to BigQuery while providing a pandas-like API.

## 07. Security

### IAM Roles for Notebooks

Access to notebook instances is controlled via IAM. Key roles include:

| IAM Role | Permissions | Use Case |
| --- | --- | --- |
| `roles/notebooks.admin` | Full control over notebook instances | Platform admins |
| `roles/notebooks.viewer` | View notebook instances (no access to JupyterLab) | Auditors |
| `roles/notebooks.runner` | Execute scheduled notebook runs | Automation service accounts |
| `roles/aiplatform.colabEnterpriseUser` | Create and use Colab Enterprise notebooks | Data scientists |

### Service Accounts

Notebook instances run code using a **service account**. By default, the Compute Engine default service account is used. For production, always create a dedicated service account with least-privilege permissions.

```
# Create a dedicated service account for notebooks
gcloud iam service-accounts create notebook-sa \
  --display-name="Notebook Service Account"

# Grant only needed roles
gcloud projects add-iam-policy-binding my-project \
  --member="serviceAccount:notebook-sa@my-project.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"

gcloud projects add-iam-policy-binding my-project \
  --member="serviceAccount:notebook-sa@my-project.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"

# Create notebook with custom service account
gcloud notebooks instances create secure-notebook \
  --location=us-central1-a \
  --machine-type=n1-standard-4 \
  --service-account=notebook-sa@my-project.iam.gserviceaccount.com \
  --vm-image-project=deeplearning-platform-release \
  --vm-image-family=common-cpu-notebooks
```

### VPC Service Controls (VPC-SC)

VPC-SC creates a security perimeter around your GCP resources to prevent data exfiltration. Notebook instances within a VPC-SC perimeter can only access resources within the same perimeter.

-   **Perimeter setup:** Include Vertex AI API (notebooks) and BigQuery API in the same service perimeter
-   **Ingress rules:** Define who can access the notebook from outside the perimeter
-   **Egress rules:** Control what data can leave the perimeter (e.g., no external API calls)

### Customer-Managed Encryption Keys (CMEK)

By default, Google encrypts data at rest. With CMEK, you control the encryption key via Cloud KMS. This is required for many compliance frameworks (HIPAA, PCI-DSS).

```
# Create a notebook with CMEK
gcloud notebooks instances create cmek-notebook \
  --location=us-central1-a \
  --machine-type=n1-standard-4 \
  --kms-key=projects/my-project/locations/us-central1/keyRings/my-ring/cryptoKeys/my-key \
  --vm-image-project=deeplearning-platform-release \
  --vm-image-family=common-cpu-notebooks
```

>**Exam Focus:** Security questions often combine multiple concepts: "A data scientist needs notebook access to sensitive data in BigQuery. The organization requires CMEK and VPC-SC. Which notebook type supports this?" Answer: Vertex AI Workbench (both managed and user-managed) support CMEK and VPC-SC. Colab Enterprise also supports VPC-SC.

## 08. Best Practices

### Production Notebooks vs Exploration

| Aspect | Exploration Notebook | Production Notebook |
| --- | --- | --- |
| Purpose | EDA, prototyping, ad-hoc analysis | Scheduled runs, reports, CI/CD integration |
| Execution | Interactive (cell-by-cell) | Parameterized, end-to-end via `papermill` |
| Environment | Colab Enterprise or Managed Workbench | User-Managed Workbench or containerized |
| Version Control | Optional | Mandatory (Git + stripped outputs) |
| Testing | Informal | Unit tests for helper functions, integration tests |
| Output Management | Inline display | Save to GCS/BigQuery, generate reports |

### Parameterized Notebook Execution

**Papermill** allows you to parameterize and execute notebooks programmatically. This is the bridge between exploration and production.

```
# Execute a notebook with parameters via papermill
import papermill as pm

pm.execute_notebook(
    "template_notebook.ipynb",
    "output/run_2024_01.ipynb",
    parameters={
        "start_date": "2024-01-01",
        "end_date": "2024-01-31",
        "model_type": "xgboost",
        "learning_rate": 0.01
    }
)
```

>**Pro Tip:** For scheduled notebook execution on GCP, use **Vertex AI Workbench Scheduled Runs** (managed notebooks) or combine Cloud Scheduler + Cloud Functions + Papermill for user-managed notebooks. Both approaches support parameterized execution.

## 09. Exam Focus: Choosing the Right Notebook Environment

### Scenario Selection Guide

>**Scenario 1:** "A team of data scientists needs to collaboratively explore a new dataset stored in BigQuery. They want zero infrastructure setup." → **Colab Enterprise**
>**Scenario 2:** "An ML engineer needs to train a TensorFlow model on a GPU with a custom Conda environment and specific CUDA libraries." → **Vertex AI Workbench (User-Managed)** with GPU and custom Deep Learning VM image
>**Scenario 3:** "The team wants JupyterLab notebooks that auto-update and integrate with Vertex AI Pipelines, without managing the underlying VM." → **Vertex AI Workbench (Managed)**
>**Scenario 4:** "A healthcare company needs notebooks with CMEK encryption, VPC-SC, and audit logging for processing PHI data." → **Vertex AI Workbench (User-Managed or Managed)** with CMEK key and VPC-SC perimeter configured
>**Scenario 5:** "An analyst needs to run a notebook weekly to generate a report from BigQuery, parameterized by date range." → **Vertex AI Workbench Managed Notebooks** with scheduled execution, or Papermill on a user-managed instance

### Key Exam Takeaways

-   Colab Enterprise = serverless, collaborative, no GPU customization, IAM-native
-   Workbench Managed = Google-maintained, auto-patching, scheduled runs, good for teams
-   Workbench User-Managed = full control, sudo access, custom envs, multi-GPU
-   All notebook types support BigQuery and Cloud Storage access
-   VPC-SC and CMEK are supported on Workbench instances for compliance
-   Always configure idle shutdown for GPU instances to control costs
-   Use dedicated service accounts (not default) for production notebooks

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** GCP offers three notebook environments, each optimized for a different workflow. **Colab Enterprise** is the lightweight, browser-based option with built-in sharing, Gemini code assistance, and serverless runtimes—ideal for collaborative exploration. **Vertex AI Workbench Instances** are full JupyterLab VMs where you control the machine type, attach GPUs, and install arbitrary packages—ideal for heavy training and custom environments. The now-deprecated **Managed Notebooks** sit between the two. The key interview insight is that notebook choice depends on three axes: *collaboration needs* (Colab Enterprise wins), *compute requirements* (Workbench Instances win with GPU/TPU attach), and *security posture* (Workbench supports VPC-SC, CMEK, and customer-managed service accounts). In production, notebooks are for prototyping—you graduate to Vertex AI Pipelines for reproducible, scheduled ML workflows.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| When would you use Colab Enterprise versus Vertex AI Workbench? | Can you match notebook type to team size, compute needs, and security requirements? |
| How do you manage GPU costs for notebook-based ML development? | Do you understand idle shutdown, preemptible GPUs, and right-sizing strategies? |
| How would you transition from notebook prototyping to a production ML pipeline? | Do you know the limitations of notebooks and the path to Vertex AI Pipelines or custom training jobs? |
| What security controls are available for notebooks on GCP? | Can you discuss VPC-SC, CMEK, IAM, service accounts, and data access boundaries? |
| How do you handle version control for Jupyter notebooks? | Do you understand Git integration challenges with .ipynb files and strategies like nbstripout or paired scripts? |

### Model Answers

**Colab Enterprise vs Workbench:** I recommend Colab Enterprise when the team needs real-time collaboration, quick spin-up with no infrastructure management, and Gemini-assisted coding. It is serverless—runtimes start in seconds and scale down automatically. I switch to Workbench Instances when the workload requires A100 GPUs, persistent local SSD for large datasets, a specific CUDA version, or custom Docker images. Workbench also supports idle shutdown policies and scheduled execution, making it suitable for recurring experiments.

**GPU Cost Management:** I configure auto-shutdown after 60 minutes of idle time, use preemptible (Spot) VMs for fault-tolerant training experiments, right-size by starting with the smallest GPU (T4) and scaling up only when profiling shows GPU memory or compute bottlenecks. For teams, I enforce org-level quotas to prevent runaway GPU allocation and use labels to track per-project notebook costs in Cloud Billing.

**Notebook to Production:** Notebooks are excellent for exploration but poor for production because they encourage implicit state, non-linear execution, and manual steps. Once a model approach is validated, I refactor the notebook into Python modules, write unit tests for preprocessing functions, package the code into a custom training container, and orchestrate execution via Vertex AI Pipelines. The pipeline handles data ingestion, training, evaluation, and conditional deployment—all versioned and schedulable.

**Security Posture:** For regulated environments, I use Workbench Instances inside a VPC Service Controls perimeter to prevent data exfiltration. I enable CMEK for disk encryption, assign a custom service account with least-privilege BigQuery and GCS permissions, disable public IP on the instance, and use IAP tunneling for access. Colab Enterprise inherits project-level IAM but has fewer granular network controls, so it is better suited for non-sensitive exploratory work.

### System Design Scenario

>**Design Prompt:** **Scenario:** A data science team of 12 needs a shared notebook environment on GCP. They work with sensitive healthcare data (HIPAA), need GPUs for fine-tuning language models, and want reproducible experiments. Design the setup.
> 
> **Approach:** Use Vertex AI Workbench Instances inside a VPC-SC perimeter with no public IPs. Access via IAP tunneling. Enable CMEK with Cloud KMS for disk and notebook encryption. Each data scientist gets a dedicated instance with a T4 or L4 GPU, configured with idle auto-shutdown at 45 minutes. Use a custom service account per instance with BigQuery read-only and GCS bucket-specific permissions. For collaboration, store notebooks in a private GitHub or Cloud Source Repository with nbstripout pre-commit hooks. Use Vertex AI Experiments for tracking metrics across runs. Once models are validated, the ML engineer refactors into Vertex AI Pipelines triggered by Cloud Scheduler for weekly retraining.

### Common Mistakes

-   **Treating notebooks as production artifacts** — Interviewers watch for candidates who plan to run scheduled notebooks in production instead of migrating to proper pipelines. Always articulate the notebook-to-pipeline graduation path.
-   **Ignoring idle costs** — A Workbench Instance with an A100 GPU left running overnight costs more than the training itself. Failing to mention auto-shutdown and cost controls signals lack of operational awareness.
-   **Choosing the wrong notebook type for the constraint** — Recommending Colab Enterprise for HIPAA workloads or Workbench for quick ad-hoc collaboration shows you are not matching the tool to the requirement.

Previous Module

[02 · Prepare Data & ML APIs](02-prepare-data-ml-apis.html)

Next Module

[04 · BigQuery ML](04-bigquery-ml.html)

Create ML Models with SQL