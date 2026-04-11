---
title: "AI and Machine Learning on Google Cloud"
slug: "intro-ai-ml-gcp"
description: "Your entry point to Google Cloud's AI ecosystem. Understand the hierarchy from AI to GenAI,
    navigate the full portfolio of GCP AI services, and learn when to use pre-trained APIs, AutoML,
    or custom training. Master Vertex AI as the unified platform that ties it all together."
section: "gcp-mle"
order: 1
badges:
  - "AI/ML/DL/GenAI Hierarchy"
  - "GCP AI Portfolio"
  - "Vertex AI Platform"
  - "ML Workflow on GCP"
  - "Generative AI on GCP"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/01-intro-ai-ml-gcp.ipynb"
---

## 01. AI vs ML vs DL vs GenAI

### Definitions and Scope

Understanding the nested relationship between these terms is foundational for the exam. Each is a **subset of the one above it**, and Google Cloud offers products at every level.

| Term | Definition | Example | GCP Product |
| --- | --- | --- | --- |
| **Artificial Intelligence (AI)** | Any technique that enables machines to mimic human-like behavior — perception, reasoning, decision-making | Rule-based expert systems, search algorithms | Cloud AI portfolio (umbrella) |
| **Machine Learning (ML)** | Subset of AI where systems **learn from data** without explicit programming. Statistical models find patterns. | Linear regression, random forests, XGBoost | Vertex AI, AutoML, BigQuery ML |
| **Deep Learning (DL)** | Subset of ML using **neural networks** with multiple layers. Excels at unstructured data (images, text, audio). | CNNs for image recognition, RNNs for sequences | Vertex AI Custom Training, TPUs |
| **Generative AI (GenAI)** | Subset of DL that **creates new content** — text, images, code, audio — using foundation models trained on massive data. | Gemini, Imagen, Codey, PaLM | Vertex AI Studio, Model Garden, Gemini API |

### The Nesting Hierarchy

![Diagram 1](/diagrams/gcp-mle/intro-ai-ml-gcp-1.svg)

AI &superset; ML &superset; DL &superset; GenAI — each is a specialized subset of the layer above

>**Key Concept:** **Not all AI is ML.** A rule-based fraud detection system is AI but not ML. Not all ML is DL. A random forest is ML but not DL. Not all DL is GenAI. An image classifier (CNN) is DL but not GenAI — it classifies rather than generates.
>**Exam Alert:** The exam frequently tests whether you can distinguish between these levels. A question might describe a use case and ask which level of AI it represents, or which GCP product category fits. Know the boundaries.

## 02. Google Cloud AI Portfolio Overview

Google Cloud organizes its AI/ML offerings into four tiers, each trading **ease of use** for **flexibility and control**. The exam tests your ability to recommend the right tier for a scenario.

### Tier 1: Pre-trained APIs (Zero ML Expertise)

Ready-to-use models via REST API. No training data, no model building, no infrastructure. Best for common tasks where Google's models are good enough.

👁

#### Cloud Vision API

Label detection, OCR, face detection, logo detection, safe search, landmark recognition. Send an image, get structured annotations.

💬

#### Cloud Natural Language API

Sentiment analysis, entity extraction, syntax analysis, content classification. Works on text documents and web pages.

🎤

#### Cloud Speech-to-Text

Audio transcription (120+ languages), streaming recognition, speaker diarization, automatic punctuation.

🌐

#### Cloud Translation API

Basic (NMT) and Advanced (AutoML) translation. 100+ languages. Glossaries for domain-specific terms.

🎥

#### Video Intelligence API

Label detection, shot change detection, explicit content detection, object tracking, text detection in video.

🔍

#### Document AI

Extract structured data from documents (invoices, receipts, contracts). Pre-trained parsers for common document types.

### Tier 2: AutoML (Some ML Expertise)

**Bring your own data**, and Google Cloud trains a custom model for you automatically. AutoML handles feature engineering, architecture search, hyperparameter tuning, and model selection. Available through **Vertex AI**.

-   **AutoML Image** — Custom image classification and object detection
-   **AutoML Text** — Custom text classification, entity extraction, sentiment
-   **AutoML Tabular** — Classification and regression on structured data
-   **AutoML Video** — Custom video classification and object tracking
-   **AutoML Translation** — Domain-specific translation models

>**When to Choose AutoML:** Use AutoML when pre-trained APIs do not meet accuracy requirements for your domain, you have labeled training data (typically 100–100,000 examples), and you do not have deep ML expertise on your team. AutoML is the fastest path to a custom model.

### Tier 3: Custom Training (Full ML Expertise)

Full control over model architecture, training code, and infrastructure. Use **Vertex AI Custom Training** with TensorFlow, PyTorch, scikit-learn, or XGBoost. You write the training code and choose the hardware (CPUs, GPUs, TPUs).

-   **Pre-built containers** — Google-maintained images with popular frameworks
-   **Custom containers** — Your own Docker image with any framework or library
-   **Distributed training** — Multi-node, multi-GPU training for large models
-   **Hyperparameter tuning** — Vertex AI Vizier for automated HP search

### Tier 4: Foundation Models (GenAI)

Access Google's foundation models — **Gemini** (multimodal), **Imagen** (image generation), **Codey** (code generation), **Chirp** (speech) — through the Vertex AI Model Garden and Vertex AI Studio. You can use them as-is, prompt-tune them, or fine-tune on your data.

>**Exam Alert:** The exam loves to test the four-tier decision: given a scenario, which tier is most appropriate? Remember: start with the simplest option (pre-trained API), and only move up tiers when requirements demand it. Cost and time increase as you move toward custom training.

## 03. Vertex AI — The Unified ML Platform

**Vertex AI** is Google Cloud's unified platform for building, deploying, and managing ML models at scale. It consolidates what were previously separate services (AI Platform Training, AI Platform Prediction, AutoML) into a single platform with a consistent API and UI.

### Key Components

📝

#### Workbench

Managed JupyterLab notebooks for development. Two flavors: **Managed Notebooks** (fully managed, auto-shutdown) and **User-Managed Notebooks** (more control, custom VM).

🚀

#### Pipelines

Serverless orchestration for ML workflows using Kubeflow Pipelines or TFX. Define DAGs of training, evaluation, and deployment steps. Supports caching and lineage tracking.

📦

#### Model Registry

Central repository for versioning, organizing, and governing ML models. Track model lineage, metadata, and deployment history.

🎯

#### Endpoints

Deploy models for online (real-time) or batch prediction. Supports traffic splitting for A/B testing and canary deployments. Auto-scaling based on traffic.

📊

#### Feature Store

Centralized store for ML features with low-latency online serving and batch export. Prevents training-serving skew by sharing feature definitions across training and prediction.

🏭

#### Model Garden

Discover and deploy foundation models (Gemini, PaLM, open-source models like Llama, Mistral). One-click deployment to Vertex AI endpoints.

### Additional Platform Features

-   **Vertex AI Experiments** — Track and compare training runs (metrics, parameters, artifacts)
-   **Vertex AI Vizier** — Black-box hyperparameter optimization service
-   **Vertex AI TensorBoard** — Managed TensorBoard for training visualization
-   **Vertex AI Matching Engine** — High-performance vector similarity search (ANN) for recommendation and retrieval
-   **Vertex AI Model Monitoring** — Detect data drift, prediction drift, and feature attribution drift in production

>**Architecture Note:** Vertex AI is not a single service — it is an **umbrella platform** that orchestrates many underlying GCP services. Training jobs run on Compute Engine VMs (with GPUs/TPUs), data is stored in Cloud Storage and BigQuery, and endpoints run on GKE or Cloud Run behind the scenes. Understanding this helps you debug issues and estimate costs.

## 04. ML Workflow on GCP

The ML workflow is a **cyclical process**, not a one-time pipeline. Understanding each stage and which GCP services to use at each stage is critical for the exam.

### End-to-End Stages

![Diagram 2](/diagrams/gcp-mle/intro-ai-ml-gcp-2.svg)

ML lifecycle: data preparation through deployment and monitoring, with continuous feedback

### GCP Services per Stage

| Stage | Activities | GCP Services |
| --- | --- | --- |
| **Data Preparation** | Collect, clean, transform, label data | BigQuery, Cloud Storage, Dataflow, Dataprep, Dataproc, Data Labeling Service |
| **Feature Engineering** | Create, select, transform features; build feature pipelines | Vertex AI Feature Store, BigQuery ML, Dataflow |
| **Model Training** | Train model (AutoML, custom, or BigQuery ML) | Vertex AI Training, AutoML, BigQuery ML, TPUs, GPUs |
| **Evaluation & Tuning** | Evaluate metrics, tune hyperparameters, compare experiments | Vertex AI Experiments, Vertex AI Vizier, TensorBoard |
| **Deployment** | Serve predictions (online/batch), A/B test, scale | Vertex AI Endpoints, Vertex AI Batch Prediction |
| **Monitoring** | Detect drift, monitor performance, trigger retraining | Vertex AI Model Monitoring, Cloud Monitoring, Cloud Logging |

>**Common Pitfall:** Many exam questions test whether you understand that the ML workflow is **iterative**. Deploying a model is not the end — you must monitor for data drift, concept drift, and performance degradation, then retrain when metrics degrade.

## 05. Generative AI on Google Cloud

Google Cloud provides access to cutting-edge generative AI through **Vertex AI**. The three key entry points are Model Garden, Vertex AI Studio, and the Gemini API.

### Model Garden

A curated catalog of foundation models you can discover, test, and deploy. Includes:

-   **Google models** — Gemini (multimodal), Imagen (image generation), Codey (code), Chirp (speech), Embeddings
-   **Open-source models** — Llama, Mistral, Falcon, FLAN-T5, and others. Deploy to Vertex AI endpoints with one click.
-   **Partner models** — Models from Anthropic (Claude), AI21 Labs, Cohere, and others available through Model Garden

### Vertex AI Studio

A web-based, no-code/low-code interface for prototyping and testing generative AI. Use it to:

-   Test prompts interactively against Gemini and other models
-   Compare model outputs side-by-side
-   Configure parameters (temperature, top-k, top-p, max tokens)
-   Create and test tuned model variants
-   Generate embeddings for text

### Tuning Approaches

| Approach | Data Needed | Cost | When to Use |
| --- | --- | --- | --- |
| **Prompt Design** | None (just instructions) | Lowest (pay per token) | First try. Use system instructions, few-shot examples, chain-of-thought. |
| **Prompt Tuning / Adapter Tuning** | Dozens to hundreds of examples | Low | Domain-specific style or format. Does not modify base model weights. |
| **Supervised Fine-Tuning (SFT)** | Hundreds to thousands of examples | Medium | Model needs to learn new domain knowledge or behaviors. |
| **RLHF (Reinforcement Learning from Human Feedback)** | Human preference data | Highest | Aligning model outputs with nuanced human preferences. |

>**Tuning Decision Rule:** Always start with **prompt design**. If prompting alone cannot achieve the quality you need, move to adapter/prompt tuning. Only invest in full fine-tuning when you have sufficient labeled data and clear evidence that lighter approaches fail. RLHF is rare outside of model provider companies.
>**Exam Alert:** The exam tests whether you know the **ordering of tuning approaches** by complexity, cost, and data requirements. Prompt design is always the first recommendation. If a question says "the team has no training data," the answer is not fine-tuning.

## 06. Decision Framework: When to Use What

### The Decision Tree

This is the most exam-relevant mental model. Given a scenario, walk through this decision tree:

![Diagram 3](/diagrams/gcp-mle/intro-ai-ml-gcp-3.svg)

Decision tree for choosing the right GCP ML approach

>**Exam Alert:** **Default to the simplest option.** If a pre-trained API can solve the problem, do not recommend AutoML. If AutoML suffices, do not recommend custom training. The exam rewards cost-effective, low-complexity solutions. Also consider: if data lives in BigQuery and the team knows SQL, BigQuery ML may be the fastest path.

## 07. Key GCP Services for ML

### Data and Compute Services

| Service | What It Does | When to Use |
| --- | --- | --- |
| **BigQuery** | Serverless data warehouse. SQL-based analytics and ML (BigQuery ML). Petabyte-scale. | Structured data analytics, feature engineering with SQL, training ML models with SQL (BQML). |
| **Cloud Storage (GCS)** | Object storage. Stores training data, model artifacts, pipeline outputs. | Any unstructured data (images, audio, video, text files). The default data lake for ML. |
| **Dataflow** | Serverless Apache Beam runner. Batch and streaming ETL pipelines. | Data transformation at scale, preprocessing pipelines, real-time feature computation. |
| **Dataproc** | Managed Spark/Hadoop clusters. Ephemeral or long-running. | Existing Spark/Hadoop workloads, large-scale batch processing, Spark MLlib. |
| **Dataprep** | Visual data wrangling tool (by Trifacta). No-code data cleaning. | Exploratory data analysis, one-off data cleaning, non-technical users. |
| **Compute Engine** | Virtual machines. Attach GPUs (NVIDIA T4, V100, A100) or TPUs. | Custom training workloads that need specific hardware. Vertex AI uses Compute Engine under the hood. |
| **Google Kubernetes Engine (GKE)** | Managed Kubernetes. Run containerized ML workloads and serving infrastructure. | Complex serving architectures, multi-model deployments, custom scaling policies. |
| **Cloud Pub/Sub** | Messaging service for event-driven architectures. | Streaming data ingestion for real-time ML pipelines, decoupling pipeline stages. |
| **Cloud Functions / Cloud Run** | Serverless compute for event-driven workloads or containerized services. | Lightweight model serving, preprocessing triggers, API wrappers around ML models. |

```
# Example: Using gcloud CLI to create a Vertex AI training job
gcloud ai custom-jobs create \
  --region=us-central1 \
  --display-name="my-training-job" \
  --worker-pool-spec="machine-type=n1-standard-8,\
    accelerator-type=NVIDIA_TESLA_T4,\
    accelerator-count=1,\
    replica-count=1,\
    container-image-uri=gcr.io/cloud-aiplatform/training/tf-gpu.2-12:latest,\
    local-package-path=./trainer,\
    python-module=trainer.task"
```

```
# Example: BigQuery ML — train a model with SQL
CREATE OR REPLACE MODEL `my_project.my_dataset.my_model`
OPTIONS(
  model_type='LOGISTIC_REG',
  input_label_cols=['is_fraud']
) AS
SELECT
  transaction_amount,
  merchant_category,
  time_of_day,
  is_fraud
FROM `my_project.my_dataset.transactions`
WHERE split = 'train';
```

>**BigQuery ML Shortcut:** If your data is already in BigQuery and the team is SQL-proficient, **BigQuery ML** lets you train and deploy models without leaving SQL. It supports logistic regression, k-means, matrix factorization, XGBoost, DNN, and even importing TensorFlow models. For the exam, this is the answer when the scenario says "the team only knows SQL."

## 08. Exam Tips — Scenario-Based Guidance

### Common Exam Scenarios

>**Scenario 1:** **"A company wants to extract text from scanned invoices..."**  
> Answer: **Document AI** (or Cloud Vision API for simpler OCR). No need for custom training — pre-trained APIs handle this well. If they need structured extraction (fields like amount, date, vendor), Document AI with pre-trained parsers.
>**Scenario 2:** **"A data analyst team wants to predict customer churn using BigQuery data..."**  
> Answer: **BigQuery ML**. The team is SQL-proficient, data is already in BigQuery, and they need a classification model. No infrastructure setup, no Python required.
>**Scenario 3:** **"A startup needs image classification for a very specific domain (e.g., rare plant diseases)..."**  
> Answer: **AutoML Image** on Vertex AI. Pre-trained Vision API will not have domain-specific classes. They need custom labels and have labeled data. AutoML is faster and cheaper than building a custom CNN.
>**Scenario 4:** **"An ML team needs full control over architecture, uses PyTorch, and requires multi-GPU training..."**  
> Answer: **Vertex AI Custom Training** with a custom container. Use a worker pool spec with GPU accelerators. This is the highest-control option.
>**Scenario 5:** **"The team wants to build a chatbot that answers questions about internal documentation..."**  
> Answer: **Vertex AI Search** (formerly Enterprise Search) or a RAG pattern using Gemini + vector search (Vertex AI Matching Engine). Grounding with enterprise data, not fine-tuning on it.
>**General Exam Strategy:** **Always consider the simplest, cheapest, least-maintenance solution first.** The exam rewards Google's recommendation hierarchy: pre-trained API → AutoML → BigQuery ML → Custom Training. Only escalate when the simpler option genuinely cannot meet requirements. Also: always prefer managed/serverless services over self-managed infrastructure.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Google Cloud provides a layered AI/ML stack that lets teams choose the right level of abstraction for their problem. At the top, pre-trained APIs like Vision and Natural Language let you add intelligence with zero ML expertise. In the middle, AutoML and BigQuery ML let analysts build custom models without writing training loops. At the bottom, Vertex AI Custom Training gives full control over frameworks, hyperparameters, and distributed training. The exam—and real-world architecture—rewards picking the **simplest tier that meets requirements**, then escalating only when necessary. Vertex AI ties it all together as the unified platform for data prep, training, evaluation, deployment, and monitoring.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| When would you use AutoML versus custom training on GCP? | Can you match business constraints (timeline, team skill, data size) to the right abstraction level? |
| What is Vertex AI and why does it matter? | Do you understand the unified ML platform concept and how it replaces fragmented services? |
| How does Google recommend choosing between pre-trained APIs, AutoML, and custom models? | Do you know the decision hierarchy and can you justify trade-offs? |
| Explain the difference between AI, ML, deep learning, and generative AI. | Can you articulate the nested relationship and give concrete GCP examples at each level? |
| How would you build an ML pipeline on GCP from data ingestion to serving? | Do you understand the end-to-end workflow: data → feature engineering → training → evaluation → deployment → monitoring? |

### Model Answers

**AutoML vs Custom Training:** I start with AutoML when the team lacks deep ML expertise, the timeline is tight, or the problem maps cleanly to a supported task type like image classification or tabular regression. AutoML handles architecture search and hyperparameter tuning automatically. I switch to custom training when I need a novel architecture, have very specific performance targets, or need to integrate custom loss functions and preprocessing that AutoML cannot express. The key decision factor is whether the marginal accuracy gain from custom work justifies the engineering and maintenance cost.

**Vertex AI’s Role:** Vertex AI is Google’s unified ML platform that replaced the earlier fragmented services (AI Platform Training, AI Platform Prediction, AutoML standalone products). It provides a single SDK and console for managed datasets, training pipelines, model registry, endpoints, feature store, experiment tracking, and model monitoring. This matters because it eliminates glue code between stages and gives a consistent IAM and networking model across the entire ML lifecycle.

**End-to-End Pipeline:** I would ingest raw data into Cloud Storage or BigQuery, use Dataflow or Dataproc for large-scale preprocessing, register engineered features in Vertex AI Feature Store for reuse, launch a training job (AutoML or custom container) on Vertex AI Training, evaluate the model against baseline metrics, deploy to a Vertex AI Endpoint with traffic splitting for canary rollout, and enable Vertex AI Model Monitoring to detect skew and drift in production. Vertex AI Pipelines (built on Kubeflow or TFX) orchestrates the entire workflow as a reproducible DAG.

### System Design Scenario

>**Design Prompt:** **Scenario:** A retail company wants to classify product images into 200 categories, detect defective items, and generate product descriptions—all on GCP. They have 50k labeled images and a small ML team. Design the architecture.
> 
> **Approach:** Use AutoML Vision for the 200-category classification (sufficient labeled data, standard task). For defect detection, start with AutoML Vision Edge if real-time on-device inference is needed, otherwise AutoML Vision with a Vertex AI Endpoint. For product descriptions, use Gemini via Vertex AI Studio with few-shot prompting, grounded on the product catalog stored in BigQuery. The three models deploy to separate Vertex AI Endpoints behind an API Gateway. Model Monitoring watches for data drift on the image classifiers. The entire pipeline is orchestrated with Vertex AI Pipelines for retraining on a weekly schedule.

### Common Mistakes

-   **Jumping to custom training by default** — Interviewers want to see you consider the simplest viable option first. Always explain why a pre-trained API or AutoML won’t work before proposing custom code.
-   **Confusing Vertex AI with individual services** — Vertex AI is the platform; AutoML, Custom Training, Pipelines, and Feature Store are components within it. Mixing up the terminology signals shallow understanding.
-   **Ignoring the operational side** — Training a model is only half the story. Forgetting to mention monitoring, retraining triggers, A/B deployment, and IAM/VPC controls makes your answer incomplete for production-readiness questions.

Previous Course

[GCP MLE Hub](index.html)

Next Course

[02 · Prepare Data for ML APIs](02-prepare-data-ml-apis.html)

Data Preparation & APIs