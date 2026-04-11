---
title: "Innovating with Google Cloud AI"
slug: "ai-ml"
description: "Explore the spectrum of AI and ML options on Google Cloud — from pre-trained APIs that
    require no ML expertise to custom model training with Vertex AI and TensorFlow on TPUs."
section: "gcp-cdl"
order: 3
badges:
  - "AI vs ML vs Deep Learning"
  - "Pre-trained APIs"
  - "AutoML & Vertex AI"
  - "BigQuery ML"
  - "TensorFlow & TPUs"
---

## 1. AI and ML Fundamentals

**Artificial Intelligence (AI)** is the broad field of creating machines that can perform tasks that typically require human intelligence. **Machine Learning (ML)** is a subset of AI where systems learn from data rather than being explicitly programmed. **Deep Learning (DL)** is a subset of ML that uses neural networks with many layers.

```

  +-------------------------------------------+
  |           Artificial Intelligence          |
  |   +-----------------------------------+   |
  |   |        Machine Learning           |   |
  |   |   +---------------------------+   |   |
  |   |   |      Deep Learning        |   |   |
  |   |   |  (Neural Networks, LLMs)  |   |   |
  |   |   +---------------------------+   |   |
  |   +-----------------------------------+   |
  +-------------------------------------------+
        
```

AI, ML, and Deep Learning are nested subsets

### Types of Machine Learning

| Type | Training Data | Use Cases | GCP Example |
| --- | --- | --- | --- |
| **Supervised** | Labeled data (input + correct output) | Classification, regression, prediction | AutoML, BigQuery ML |
| **Unsupervised** | Unlabeled data (input only) | Clustering, anomaly detection, dimensionality reduction | BigQuery ML K-means |
| **Reinforcement** | Reward signals from environment | Robotics, game playing, optimization | Custom training on Vertex AI |

### Key ML Concepts for the Exam

L

#### Label

The correct answer in supervised learning. For image classification, the label is the object category. For regression, it is the numeric target value.

F

#### Feature

An input variable used by the model to make predictions. For a house price model, features include square footage, number of bedrooms, location, and age.

M

#### Model

The mathematical representation learned from data that maps inputs (features) to outputs (predictions). Trained models are deployed to serve predictions.

T

#### Training vs. Inference

Training = learning patterns from data (expensive, done occasionally). Inference = applying the trained model to new data (cheap, done continuously).

## 2. The ML Spectrum on Google Cloud

Google Cloud offers ML solutions at every level of expertise and customization. The exam frequently asks you to choose the right level for a given scenario. The spectrum ranges from no ML expertise needed (pre-trained APIs) to full custom training (Vertex AI with TensorFlow/PyTorch).

| Level | Expertise Required | Data Required | Service | Use Case |
| --- | --- | --- | --- | --- |
| **1\. Pre-trained APIs** | None | None (Google's models) | Vision, NLP, Speech, Translation, Video AI | Generic ML tasks (OCR, sentiment, transcription) |
| **2\. BigQuery ML** | SQL only | Data already in BigQuery | BigQuery ML | Predictions on structured data using SQL |
| **3\. AutoML** | Low (label data only) | Your labeled dataset | Vertex AI AutoML | Custom models without coding |
| **4\. Custom Training** | High (ML engineering) | Your dataset + code | Vertex AI Custom Training | Novel architectures, unique requirements |

>**Decision Rule for the Exam:** Always choose the **simplest option that meets requirements**. If a pre-trained API works, do not suggest AutoML. If BigQuery ML can solve it with SQL, do not suggest custom training. Escalate complexity only when simpler options cannot meet the need.

## 3. Pre-trained APIs

Google Cloud provides pre-trained ML models accessible via simple REST APIs. No ML expertise, training data, or model management is needed. Just send your data and receive predictions.

| API | Input | Capabilities |
| --- | --- | --- |
| **Cloud Vision API** | Images | Label detection, OCR, face detection, landmark recognition, safe search, logo detection |
| **Cloud Natural Language** | Text | Sentiment analysis, entity recognition, syntax analysis, content classification |
| **Cloud Speech-to-Text** | Audio | Transcription in 125+ languages, streaming recognition, speaker diarization |
| **Cloud Text-to-Speech** | Text | Natural-sounding speech in 220+ voices, SSML support, WaveNet voices |
| **Cloud Translation** | Text | Translation between 130+ languages, glossary support, batch translation |
| **Cloud Video Intelligence** | Video | Label detection, shot change, object tracking, text detection in video |
| **Document AI** | Documents | Extract structured data from forms, invoices, receipts, contracts |
| **Dialogflow** | Text/Voice | Build conversational agents (chatbots) with NLU, intents, and entities |

```
# Example: Call Cloud Vision API with gcloud
gcloud ml vision detect-labels gs://my-bucket/photo.jpg

# Example: Analyze sentiment with NL API
gcloud ml language analyze-sentiment \
  --content="Google Cloud is fantastic for data analytics!"

# Example: Transcribe audio
gcloud ml speech recognize gs://my-bucket/audio.wav \
  --language-code=en-US
```

>**Exam Tip:** Pre-trained APIs are the answer when the scenario involves **common ML tasks with no custom data**: "extract text from scanned documents" (Document AI/Vision OCR), "translate website content" (Translation API), "analyze customer review sentiment" (NL API).

## 4. AutoML on Vertex AI

**AutoML** lets you train custom ML models by simply providing your labeled data. Vertex AI AutoML handles feature engineering, architecture search, hyperparameter tuning, and model selection automatically. No ML coding expertise required.

### AutoML Workflow

1.  **Prepare data** — Upload labeled data (images with categories, text with labels, CSVs with target columns).
2.  **Train model** — Vertex AI automatically tries thousands of architectures and selects the best one.
3.  **Evaluate** — Review precision, recall, F1 score, and confusion matrix in the console.
4.  **Deploy** — Deploy the model to an endpoint for online predictions, or run batch predictions.

### AutoML Data Types

I

#### Image

Classification (single/multi-label), object detection (bounding boxes). Min ~100 images per label, recommended 1,000+.

T

#### Text

Classification, entity extraction, sentiment analysis. Min ~1,000 examples per label for good accuracy.

D

#### Tabular

Classification, regression, forecasting on structured CSV data. Handles missing values and feature engineering automatically.

V

#### Video

Classification, object tracking, action recognition. Processes video segments and labels temporal events.

>**When to Use AutoML vs. Pre-trained APIs:** Use **pre-trained APIs** for generic tasks (general sentiment, common object labels). Use **AutoML** when you need domain-specific recognition (e.g., classify manufacturing defects, identify custom product categories, detect rare medical conditions).

## 5. BigQuery ML

**BigQuery ML (BQML)** lets you create and execute ML models directly in BigQuery using standard SQL. This democratizes ML by enabling SQL analysts to build models without moving data out of the warehouse or learning Python.

```
-- Create a logistic regression model to predict customer churn
CREATE OR REPLACE MODEL `my_dataset.churn_model`
OPTIONS(
  model_type='LOGISTIC_REG',
  input_label_cols=['churned'],
  auto_class_weights=TRUE
) AS
SELECT
  tenure_months,
  monthly_charges,
  contract_type,
  internet_service,
  churned
FROM `my_dataset.customer_data`
WHERE split_col = 'TRAIN';

-- Evaluate the model
SELECT * FROM ML.EVALUATE(MODEL `my_dataset.churn_model`);

-- Make predictions on new data
SELECT * FROM ML.PREDICT(MODEL `my_dataset.churn_model`,
  (SELECT * FROM `my_dataset.new_customers`));
```

### Supported Model Types in BQML

| Model Type | SQL Keyword | Use Case |
| --- | --- | --- |
| Linear Regression | LINEAR\_REG | Predict numeric values (price, revenue) |
| Logistic Regression | LOGISTIC\_REG | Binary/multiclass classification |
| K-Means Clustering | KMEANS | Customer segmentation (unsupervised) |
| Time Series (ARIMA+) | ARIMA\_PLUS | Forecasting (sales, demand) |
| XGBoost | BOOSTED\_TREE\_CLASSIFIER/REGRESSOR | High-accuracy classification/regression |
| Deep Neural Network | DNN\_CLASSIFIER/REGRESSOR | Complex patterns in tabular data |
| TensorFlow import | TENSORFLOW | Import pre-trained TF SavedModels into BQ |

>**Exam Tip:** Choose BigQuery ML when: (1) Data is already in BigQuery, (2) the team knows SQL but not Python, (3) you want to avoid data movement. BQML is the answer for "ML without ML expertise" scenarios where data lives in BigQuery.

## 6. Vertex AI Platform

**Vertex AI** is Google Cloud's unified ML platform that brings together all ML services under one roof. It supports the entire ML lifecycle: data preparation, training (AutoML or custom), evaluation, deployment, monitoring, and MLOps.

### Key Vertex AI Components

G

#### Model Garden

Discover and deploy foundation models (Gemini, PaLM, Llama, Mistral) and fine-tune them on your data. One-click deployment to endpoints.

W

#### Workbench

Managed Jupyter notebooks for data exploration and model prototyping. Pre-installed with ML frameworks. Integrated with BigQuery and Cloud Storage.

P

#### Pipelines

Orchestrate ML workflows as DAGs. Automate data prep, training, evaluation, and deployment. Based on Kubeflow Pipelines and TFX.

F

#### Feature Store

Centralized repository for ML features. Share features across models. Serve features with low latency for online predictions. Prevents training-serving skew.

E

#### Endpoints

Deploy trained models for online (real-time) or batch prediction. Auto-scaling, traffic splitting for A/B testing, and model versioning.

M

#### Model Monitoring

Detect data drift and prediction drift in production. Alerts when model performance degrades, triggering retraining.

### Generative AI on Vertex AI

Vertex AI provides access to Google's foundation models through the **Generative AI Studio** and **Model Garden**. Key models include:

-   **Gemini** — Google's most capable multimodal model. Understands text, images, video, audio, and code.
-   **Imagen** — Image generation and editing from text prompts.
-   **Codey** — Code generation, completion, and explanation.
-   **Chirp** — Advanced speech-to-text with high accuracy across languages.

>**Key Concept:** Vertex AI is a **platform**, not a single service. Think of it as the umbrella that contains AutoML, custom training, Model Garden, pipelines, endpoints, and all ML management tools. When the exam mentions "unified ML platform," the answer is Vertex AI.

## 7. TensorFlow and TPUs

**TensorFlow** is Google's open-source ML framework for building and training neural networks. **TPUs** (Tensor Processing Units) are Google's custom-designed chips optimized for ML workloads, providing significant speedups over GPUs for certain model architectures.

### TPU vs GPU vs CPU

| Hardware | Best For | Speed (Training) | Cost |
| --- | --- | --- | --- |
| **CPU** | General computing, small models, inference | Slowest for ML | Lowest per hour |
| **GPU** | Most DL training, vision models, GANs | 10-100x faster than CPU | Medium |
| **TPU** | Large language models, large batch training | 2-5x faster than GPU (for supported models) | Higher per hour but faster completion |

>**Exam Tip:** TPUs are Google's unique differentiator. They are custom ASIC chips designed specifically for tensor operations. For the exam, know that TPUs are best for **large-scale training of neural networks** (especially transformers and LLMs) and are available exclusively on Google Cloud.

```
# Create a VM with a TPU for training
gcloud compute tpus tpu-vm create my-tpu \
  --zone=us-central1-b \
  --accelerator-type=v4-8 \
  --version=tpu-ubuntu2204-base

# Train a TensorFlow model on GPU via Vertex AI
gcloud ai custom-jobs create \
  --display-name=my-training-job \
  --worker-pool-spec=machine-type=n1-standard-8,\
    accelerator-type=NVIDIA_TESLA_T4,\
    accelerator-count=1,\
    replica-count=1,\
    container-image-uri=gcr.io/my-project/trainer:latest
```

## 8. Responsible AI

Google has published **AI Principles** that guide responsible development and use of AI. The CDL exam tests awareness of these principles and their practical implications.

### Google's AI Principles

1.  **Be socially beneficial** — AI should benefit society broadly.
2.  **Avoid creating or reinforcing unfair bias** — Test for and mitigate bias in data and models.
3.  **Be built and tested for safety** — Rigorous testing and monitoring.
4.  **Be accountable to people** — Human oversight and control.
5.  **Incorporate privacy design principles** — Data minimization and user control.
6.  **Uphold high standards of scientific excellence** — Peer review and reproducibility.
7.  **Be made available for uses that accord with these principles** — Restrict harmful applications.

>**AI Applications Google Will Not Pursue:** Google has explicitly stated it will not develop AI for: weapons, surveillance that violates international norms, technologies that cause overall harm, or applications that violate widely accepted principles of international law and human rights.

### Explainable AI (XAI)

Vertex AI includes **Explainable AI** tools that help you understand why a model made a specific prediction. Feature attributions show which input features contributed most to the output. This is crucial for building trust, debugging models, and meeting regulatory requirements.

## 9. Exam Tips and Decision Guide
>**Exam Strategy:** Section 3 (~16%) focuses on **choosing the right ML approach**. The decision flow is: Can a pre-trained API solve it? If yes, use it. If no, is the data in BigQuery and the team knows SQL? Use BQML. If no, do you have labeled data but no ML expertise? Use AutoML. Otherwise, custom training on Vertex AI.

### Quick Decision Matrix

-   "Detect objects in images with standard labels" → **Vision API**
-   "Classify customer emails into custom categories" → **AutoML Text**
-   "Predict sales from BigQuery data using SQL" → **BigQuery ML**
-   "Train a custom transformer on proprietary data" → **Vertex AI Custom Training**
-   "Build a chatbot" → **Dialogflow** (simple) or **Vertex AI + Gemini** (advanced)
-   "Generate text/images/code" → **Vertex AI Generative AI / Gemini**
-   "What platform unifies all ML?" → **Vertex AI**
-   "What accelerator is unique to Google?" → **TPU**

[

Previous

Data Transformation

](02-data-transformation.html)[

Next Section

Infrastructure & Apps

](04-infrastructure-apps.html)