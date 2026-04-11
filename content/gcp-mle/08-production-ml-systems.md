---
title: "Designing Production-Grade ML Systems"
slug: "production-ml-systems"
description: "Building a model is only the beginning — running it reliably in production is where the real engineering challenge lives.
    This module covers the architecture decisions, failure modes, and optimization techniques that separate prototypes from
    production systems: training-serving skew, distrib"
section: "gcp-mle"
order: 8
badges:
  - "Training-Serving Skew"
  - "Distributed Training"
  - "TPU vs GPU"
  - "Mixed Precision"
  - "System Design Patterns"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/08-production-ml-systems.ipynb"
---

## 01. Architecting Production ML Systems

### Static vs Dynamic Training & Serving

Production ML systems must make two fundamental architecture decisions: **how to train** (static vs dynamic) and **how to serve** (static vs dynamic). These choices cascade through every other design decision.

ST

#### Static Training

Train the model once (or periodically) on a fixed dataset, then deploy. Simple, reproducible, easy to validate. Best when data distribution is stable and retraining weekly or monthly is sufficient. Most production systems start here.

DT

#### Dynamic Training

Continuously incorporate new data via online learning or frequent retraining. Required when data distribution shifts rapidly (ad click prediction, fraud detection, stock prices). More complex: requires streaming infrastructure, data validation, and rollback mechanisms.

SS

#### Static Serving (Batch Prediction)

Pre-compute predictions for all possible inputs and store them in a lookup table (e.g., BigQuery, Bigtable). Low latency at serving time (just a table lookup). Best when the input space is finite and bounded — e.g., recommend movies for all users nightly.

DS

#### Dynamic Serving (Online Prediction)

Compute predictions on-demand as requests arrive. Required when input space is unbounded (free-text queries, new images). Higher infrastructure cost per prediction. Use Vertex AI Endpoints, TF Serving, or custom containers behind a load balancer.

>**Architecture Decision Matrix:** **Static training + static serving**: simplest, use for stable data + bounded inputs (recommendation systems with nightly refresh). **Static training + dynamic serving**: most common production pattern (retrain weekly, serve online). **Dynamic training + dynamic serving**: most complex, for rapidly changing domains (ad bidding, fraud).

## 02. Training-Serving Skew

### Causes, Detection, and Prevention

**Training-serving skew** is one of the most insidious bugs in production ML. It occurs when the data or feature transformations used during training differ from those used during serving, causing the model to receive inputs it was not trained on. The model may appear healthy in offline evaluation but perform poorly in production.

**Common causes of training-serving skew:**

-   **Feature transformation code duplication**: training uses Python/Spark for preprocessing, serving reimplements the same logic in Java/C++ (or vice versa). Even tiny differences (rounding, null handling) cause skew.
-   **Stale statistics**: normalization uses training-time mean/std, but data distribution has shifted. Serving data gets normalized with wrong parameters.
-   **Data leakage during training**: features computed using information from the future (e.g., averages that include the label period). Model learns shortcuts that are unavailable at serving time.
-   **Different data sources**: training reads from a data warehouse (cleaned, batch-processed), serving reads from a real-time stream (raw, uncleaned).
-   **Feature store inconsistency**: training features are point-in-time correct, but serving features use current values, creating temporal leakage.

**Prevention strategies:**

Use a **shared preprocessing layer**. The single most effective prevention is to embed preprocessing into the model itself using `tf.Transform` (TFX) or Keras preprocessing layers. This guarantees identical transformations during training and serving because the same code path executes in both environments.

Use a **Feature Store** (Vertex AI Feature Store). Feature stores provide a single source of truth for feature values, ensuring that training and serving use the same feature computation logic and the same feature values.

```
# Prevent skew: embed preprocessing in the model
preprocessing = tf.keras.Sequential([
    tf.keras.layers.Normalization(axis=-1),   # Learned mean/std
    tf.keras.layers.CategoryEncoding(num_tokens=100),
])
preprocessing.adapt(training_data)  # Compute statistics from training data

# Full model with preprocessing baked in
model = tf.keras.Sequential([
    preprocessing,               # Same transforms at train + serve
    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.Dense(1)
])
# SavedModel includes preprocessing — no separate serving code needed
```

>**Exam Alert:** Training-serving skew is one of the most heavily tested topics on the MLE exam. The key answer pattern is: **use tf.Transform or Keras preprocessing layers to share the same transformation code between training and serving**. This eliminates the root cause (code duplication) rather than patching symptoms.

## 03. Data Dependencies & Technical Debt

The seminal Google paper "Hidden Technical Debt in Machine Learning Systems" (2015) argues that ML systems have all the maintenance problems of traditional software **plus** a set of ML-specific issues. The actual model code is often a tiny fraction of the total system — the surrounding infrastructure (data collection, feature extraction, configuration, monitoring) is far larger and harder to maintain.

**Data dependencies** are the ML equivalent of code dependencies, but harder to track. If a feature comes from an upstream system and that system changes its data format, units, or semantics, your model silently receives different inputs. There is no compiler to catch this. Key antipatterns to avoid:

-   **Unstable data dependencies**: features from systems you do not own that may change without notice. Mitigate with data contracts and schema validation (TFDV).
-   **Underutilized features**: features added during experimentation that provide marginal value but increase complexity. Regularly audit feature importance and remove low-value features.
-   **Feedback loops**: model predictions influence future training data (e.g., recommendation models show what the model predicts users want, creating a self-reinforcing loop). Detect with holdout experiments and randomized exploration.
-   **Pipeline jungles**: tangled data preparation code that grows organically. Refactor into clean, tested, versioned pipeline stages with TFX or Vertex AI Pipelines.

>**Key Principle:** The code for the ML model itself is typically less than 5% of the total production system. Data validation, feature engineering, monitoring, serving infrastructure, and configuration management make up the remaining 95%. The exam tests whether you understand this reality and can identify which infrastructure component to add when a system is failing.

## 04. Designing Adaptable ML Systems

### Concept Drift & Data Drift

Production models degrade over time because the world changes. There are two distinct forms of change that must be monitored and addressed:

**Data drift** (also called covariate shift) occurs when the statistical distribution of input features changes, even though the underlying relationship between features and labels remains the same. Example: a model trained on summer traffic patterns receives winter data with different driving behaviors. Detection: compare feature distributions between training data and recent serving data using statistical tests (KS test, PSI, chi-squared).

**Concept drift** occurs when the relationship between inputs and outputs changes. The same features now predict different outcomes. Example: a fraud model trained on pre-pandemic transaction patterns fails post-pandemic because legitimate purchasing behavior has changed. Detection: monitor prediction performance metrics (accuracy, AUC) over time using labeled serving data.

**Mitigation strategies:**

-   **Scheduled retraining**: retrain on recent data at fixed intervals (daily, weekly). Simple but effective for gradual drift.
-   **Triggered retraining**: automatically retrain when monitoring detects significant drift (TFDV schema violations, performance below threshold).
-   **Windowed training**: train only on recent data (e.g., last 30 days) to keep the model adapted to current patterns. Risk: lose rare events.
-   **Continuous evaluation**: compare model predictions against actual outcomes and alert on degradation. Vertex AI Model Monitoring provides this out of the box.

>**Exam Tip:** The exam will describe a scenario where model performance degrades over time and ask you to identify whether it is data drift or concept drift, and what the appropriate mitigation is. Key distinction: data drift = same relationship, different inputs. Concept drift = relationship itself has changed.

## 05. High-Performance ML Systems

### Distributed Training: Data vs Model Parallelism

**Data parallelism** is the most common approach: the model is replicated on each device, each replica processes a different mini-batch, and gradients are averaged across replicas via all-reduce. Total throughput scales linearly with device count (ideally). This is what `MirroredStrategy` and `MultiWorkerMirroredStrategy` implement.

**Model parallelism** splits the model itself across devices. Layer 1-24 on GPU 0, layers 25-48 on GPU 1, etc. Required when the model is too large to fit on a single device (e.g., GPT-3 at 175B parameters requires ~350GB in float16 — no single GPU has this). More complex to implement, lower GPU utilization due to pipeline bubbles. Pipeline parallelism (e.g., GPipe) mitigates this by splitting mini-batches into micro-batches.

>**Decision Guide:** **Data parallelism**: model fits on one GPU, need faster training. Scale to 8-256 GPUs easily. **Model parallelism**: model does not fit on one GPU. Use with very large models (10B+ parameters). **Hybrid**: model parallelism across nodes + data parallelism within each node. This is how GPT-4 and Gemini are trained.

### TPU vs GPU: When to Use Each

Google Cloud offers both **GPUs** (NVIDIA A100, V100, T4, L4) and **TPUs** (v2, v3, v4, v5e) for training and inference. The choice depends on your workload characteristics.

GPU

#### Choose GPU When

Custom CUDA kernels needed. Non-TensorFlow frameworks (PyTorch natively). Small to medium models. Need flexibility for diverse workloads (training + inference + preprocessing). Models with many custom ops or dynamic control flow. Need NVIDIA-specific libraries (cuDNN, TensorRT).

TPU

#### Choose TPU When

Large-batch training (TPUs excel with large batches). Models dominated by matrix multiplications (dense layers, attention). TensorFlow or JAX framework. Need very high throughput for training. Cost efficiency matters for large-scale training. Models that can use bfloat16 precision.

**TPU-specific considerations:**

-   TPUs use **bfloat16** natively for matrix multiplications. This is different from IEEE float16 — bfloat16 has the same exponent range as float32 but fewer mantissa bits, making it more numerically stable for training.
-   Batch size should be a **multiple of 8** (one per TPU core) and ideally a multiple of 128 for optimal memory layout.
-   Avoid **Python-side data processing** in tf.data map functions. TPUs cannot execute Python operations efficiently. Use pure TF ops.
-   Use **tf.data pipelines** (not NumPy arrays or generators). TPUs require efficient data streaming from GCS.

### Mixed Precision Training

**Mixed precision training** uses both float16 (or bfloat16) and float32 during training. Most computations (forward pass, backward pass) use float16 for speed and memory savings, while critical operations (loss computation, gradient accumulation, weight updates) use float32 for numerical stability.

Benefits: **2x memory reduction** (enabling larger batch sizes or models), **2-3x training speedup** on modern GPUs (V100, A100 with Tensor Cores), with minimal accuracy loss.

```
# Enable mixed precision globally
tf.keras.mixed_precision.set_global_policy("mixed_float16")

# Build model — layers automatically use float16 for compute
model = tf.keras.Sequential([
    tf.keras.layers.Dense(256, activation="relu"),
    tf.keras.layers.Dense(128, activation="relu"),
    # Final layer should output float32 for numerical stability
    tf.keras.layers.Dense(10, dtype="float32")
])

# Optimizer with loss scaling to prevent float16 underflow
optimizer = tf.keras.optimizers.Adam(learning_rate=1e-3)
# In TF 2.x, loss scaling is handled automatically by Keras

model.compile(optimizer=optimizer, loss="sparse_categorical_crossentropy")
```

>**Mixed Precision Gotcha:** The **final (output) layer must produce float32** to prevent softmax numerical issues. Use `dtype="float32"` on the last Dense layer, or use a separate `tf.keras.layers.Activation("softmax", dtype="float32")` layer. Loss scaling is handled automatically in TF 2.x but was manual in earlier versions.

## 06. Hybrid ML Systems & Edge Deployment

Not all inference can happen in the cloud. Latency requirements, connectivity limitations, privacy constraints, or cost considerations may require running models **on-device** (edge) or in a **hybrid** cloud + on-prem architecture.

**TensorFlow Lite** is the primary framework for on-device inference. The workflow is: train a full model in TensorFlow → convert to TFLite format → optimize (quantize/prune) → deploy to device.

```
# Convert Keras model to TF Lite
converter = tf.lite.TFLiteConverter.from_keras_model(model)

# Post-training quantization — reduces model size by ~4x
converter.optimizations = [tf.lite.Optimize.DEFAULT]

# Optional: full integer quantization for maximum speed
converter.target_spec.supported_types = [tf.int8]
def representative_dataset():
    for data in calibration_data.batch(1).take(100):
        yield [data]
converter.representative_dataset = representative_dataset

tflite_model = converter.convert()

# Save the quantized model
with open("model.tflite", "wb") as f:
    f.write(tflite_model)
```

**Hybrid architectures** combine cloud-based training with edge inference, or split inference between edge and cloud. Common patterns include: edge device runs a lightweight model for initial filtering, sends uncertain cases to a larger cloud model for final prediction. This reduces latency and bandwidth while maintaining accuracy on difficult cases.

>**Edge Deployment Considerations:** **Quantization**: float32 → int8 reduces model size by 4x and speeds inference on CPUs without Tensor Cores. **Pruning**: removes low-magnitude weights, creating sparse models. **Knowledge distillation**: train a small "student" model to mimic a large "teacher" model. Combine all three for maximum compression.

## 07. Troubleshooting Production ML Systems

Production ML systems fail in ways that are subtler and harder to debug than traditional software. The model may still return predictions — they are just wrong. Key troubleshooting areas:

### Data Quality Issues

**Symptoms**: sudden accuracy drop, unexpected prediction distributions, NaN losses during retraining. **Root causes**: upstream schema changes, missing values where none existed before, duplicated records, label corruption, stale feature store. **Tools**: TensorFlow Data Validation (TFDV) for schema monitoring, Great Expectations for data testing, Vertex AI Model Monitoring for serving-time data validation.

### Model Performance Degradation

**Symptoms**: gradual accuracy decline over days/weeks, A/B test metrics dropping. **Root causes**: concept drift (world has changed), data drift (input distribution shifted), training-serving skew introduced by a code change. **Diagnosis**: compare current serving data distribution with training data distribution, check feature importance shifts, examine recent code changes to preprocessing.

### Latency & Throughput Problems

**Symptoms**: P99 latency exceeding SLO, prediction timeouts, queueing. **Root causes**: model too large for available hardware, inefficient preprocessing at serving time, cold starts on autoscaled endpoints, network bottlenecks fetching features. **Solutions**: model optimization (quantization, pruning, distillation), GPU/TPU acceleration, precompute features, horizontal scaling, batch prediction for non-latency-sensitive use cases.

### Memory & Compute Optimization

**Symptoms**: OOM errors during training or serving, GPU memory fragmentation, slow batch processing. **Solutions**: mixed precision training (halves memory), gradient accumulation (simulate large batches), model sharding, reduce batch size, optimize tf.data pipeline memory usage (`.cache(filename)` for disk-based caching).

>**Debugging Checklist:** When a production model fails: (1) Check data quality first — 90% of production ML issues are data problems. (2) Compare training and serving feature distributions. (3) Check for code changes in preprocessing pipeline. (4) Verify model version and rollback if recent deployment. (5) Monitor infrastructure metrics (latency, memory, GPU utilization). (6) Check for upstream dependency changes.

## 08. System Design Patterns

B

#### Batch Prediction Pipeline

Run predictions on large datasets offline. Pattern: Cloud Scheduler triggers a Vertex AI Pipeline that reads from BigQuery, runs `model.predict()` on batches, writes results back to BigQuery/GCS. Best for: nightly recommendations, periodic risk scoring, report generation. Use Dataflow or Vertex AI Batch Prediction.

R

#### Real-Time Serving

Serve predictions on-demand with low latency. Pattern: Vertex AI Endpoint (or Cloud Run with TF Serving) behind a load balancer, with autoscaling based on GPU utilization or QPS. Features fetched from Feature Store at prediction time. Use for: search ranking, fraud detection, chatbot responses.

AB

#### A/B Testing Infrastructure

Compare model versions in production. Pattern: traffic splitting at the endpoint level (90/10 split between champion and challenger). Log predictions and outcomes for both models. Run statistical significance tests on business metrics. Vertex AI Endpoints support traffic splitting natively.

```
# Batch prediction pipeline pattern
import pandas as pd

# Load batch data
df = pd.read_gbq("SELECT * FROM my_dataset.scoring_table")

# Predict in batches (memory-efficient)
BATCH_SIZE = 10000
results = []
for i in range(0, len(df), BATCH_SIZE):
    batch = df.iloc[i:i+BATCH_SIZE]
    features = batch[feature_columns].values
    preds = model.predict(features, batch_size=256)
    results.append(preds)

# Write predictions back
df["prediction"] = np.concatenate(results)
df.to_gbq("my_dataset.predictions", if_exists="replace")

# Vertex AI Batch Prediction (managed)
# batch_prediction_job = model.batch_predict(
#     job_display_name="nightly-scoring",
#     gcs_source="gs://bucket/input.jsonl",
#     gcs_destination_prefix="gs://bucket/output/",
#     machine_type="n1-standard-4",
#     accelerator_type="NVIDIA_TESLA_T4",
#     accelerator_count=1,
# )
```

>**Pattern Selection:** **Batch prediction**: latency not critical, large input volume, periodic (nightly/hourly). **Online prediction**: low latency required, user-facing, unbounded input space. **A/B testing**: always use for model updates in production — never deploy a new model without comparing against the current champion on real traffic.

## 09. Exam Focus Areas

This section summarizes the key concepts from Course 08 that are most likely to appear on the GCP Professional Machine Learning Engineer exam, mapping to **Section 3** (Scaling prototypes), **Section 4** (Serving & scaling models), and **Section 6** (ML solutions monitoring).

### Training Strategy Selection

-   **Data parallelism** (MirroredStrategy): model fits on one GPU, need faster training. Most common.
-   **Model parallelism**: model too large for single GPU (>10B parameters). Split across devices.
-   **Mixed precision**: 2x memory reduction, 2-3x speedup on A100/V100. Always enable on modern hardware.

### TPU vs GPU Scenarios

-   **TPU**: large-batch training, TensorFlow/JAX, matrix-heavy models, cost-efficient at scale.
-   **GPU**: PyTorch, custom CUDA ops, small/medium models, diverse workloads, inference serving.
-   TPU batch size must be a multiple of 8. Use bfloat16. Avoid Python-side preprocessing.

### Debugging Production Issues

-   **Training-serving skew**: use tf.Transform or Keras preprocessing layers. Single transformation code path.
-   **Data drift**: feature distribution changed. Retrain on recent data. Monitor with TFDV/Vertex AI Model Monitoring.
-   **Concept drift**: real-world relationship changed. Monitor prediction metrics. Retrain with new labeled data.
-   **Latency issues**: quantize model, use GPU serving, cache features, batch non-critical predictions.

>**High-Frequency Exam Topics:** Training-serving skew prevention (tf.Transform), data drift vs concept drift distinction, TPU vs GPU selection criteria, mixed precision output layer (must be float32), batch vs online serving decision, and A/B testing for model deployment are the most frequently tested topics from this module.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Production ML systems are fundamentally different from notebook prototypes. The model is often the **smallest component** in a production system — the real complexity lies in data pipelines, serving infrastructure, monitoring, and feedback loops. Key architectural decisions include **static vs dynamic training** (retrain on a schedule or continuously) and **static vs dynamic serving** (precompute predictions or serve on demand). **Training-serving skew** is the most common source of silent production failures, prevented by embedding preprocessing in the model graph via tf.Transform or Keras preprocessing layers. **Technical debt** accumulates through glue code, pipeline jungles, and undeclared data dependencies — Google's famous paper argues that ML systems have a natural tendency toward high-debt architectures. Production systems must handle **concept drift** (the real-world relationship changes) and **data drift** (input distributions shift) through continuous monitoring with Vertex AI Model Monitoring and TFDV. Performance optimization spans **distributed training** (data parallelism, model parallelism, mixed precision), **hardware selection** (TPU for large-batch TF/JAX, GPU for PyTorch and diverse workloads), and **serving optimization** (model quantization, caching, autoscaling). Understanding these production concerns — not just model accuracy — is what separates ML engineers from data scientists.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| What is training-serving skew and how do you prevent it? | Do you understand the most common production ML failure mode and its architectural solutions? |
| How do you decide between batch prediction and online prediction? | Can you reason about latency, throughput, cost, and use-case requirements? |
| What is the difference between data drift and concept drift? | Do you know how to diagnose and respond to model degradation in production? |
| When would you choose TPUs over GPUs for training? | Can you match hardware to workload characteristics beyond just "TPUs are faster"? |
| How do you safely deploy a new model version to production? | Do you understand A/B testing, canary deployments, and rollback strategies for ML? |

### Model Answers

>**Q1 — Training-Serving Skew:** Training-serving skew is any difference between the data or preprocessing seen during training and what the model encounters at serving time. It has three forms: **data skew** (training data does not represent production data), **feature skew** (feature computation differs between training and serving pipelines), and **distribution skew** (production data distribution shifts over time). Feature skew is the most insidious because it is silent — the model still returns predictions, they are just wrong. Prevention: use **tf.Transform** to embed preprocessing in the SavedModel graph (single code path), use **Keras preprocessing layers** that become part of the model, or use BQML's `TRANSFORM` clause. Monitor with **Vertex AI Model Monitoring** which compares serving input distributions against training baselines and alerts on divergence.
>**Q2 — Batch vs Online Prediction:** **Batch prediction**: precompute predictions for all inputs on a schedule (hourly, nightly). Use when latency is not critical, the input space is bounded (e.g., predict churn for all 1M users), and you want to minimize serving infrastructure costs. Results are stored in BigQuery or GCS for downstream consumption. **Online prediction**: compute predictions on demand via an API endpoint. Use when latency matters (user-facing features, real-time recommendations), the input space is unbounded (any user query), or predictions depend on real-time context. Online requires always-on infrastructure (Vertex AI Endpoints with autoscaling) and is more expensive per prediction. Many production systems use both — batch for background analytics, online for user-facing features.
>**Q3 — Data Drift vs Concept Drift:** **Data drift** (covariate shift) means the distribution of input features has changed — for example, your model was trained on users aged 25-45 but production traffic includes teenagers. The model's learned relationships are still valid, but it is being asked to extrapolate. Fix: retrain on recent data that includes the new distribution. **Concept drift** means the relationship between features and the target has changed — for example, a fraud model trained pre-COVID where spending patterns fundamentally shifted. The input distribution may look the same, but the correct predictions have changed. Fix: retrain with new labeled data that reflects the changed relationship. Detection: monitor feature distributions (TFDV, Vertex AI Model Monitoring) for data drift, monitor prediction metrics (accuracy, AUC) for concept drift. Both require different monitoring signals and different remediation strategies.
>**Q4 — TPU vs GPU Selection:** **Choose TPUs when:** training large-batch, matrix-heavy models (transformers, large CNNs); using TensorFlow or JAX; the workload is primarily dense matrix multiplication; you need cost-efficient scaling across hundreds of accelerators (TPU pods). **Choose GPUs when:** using PyTorch (limited TPU support); custom CUDA kernels are required; workloads include sparse operations, dynamic shapes, or conditional logic; you need flexible hardware for diverse tasks (training, inference, data processing). TPU-specific constraints: batch size must be a multiple of 8 (cores per chip), prefer bfloat16 precision, avoid Python-side preprocessing in the training loop, and use `tf.data` for all input processing. For inference serving, GPUs are almost always preferred due to better framework support and lower latency for single-request scenarios.
>**Q5 — Safe Model Deployment:** Never deploy a new model by replacing the existing one entirely. Use **A/B testing**: route a percentage of traffic (e.g., 5%) to the new model (challenger) while the rest goes to the current model (champion). Compare business metrics (click-through rate, revenue, user engagement) over a statistically significant period. If the challenger wins, gradually increase traffic. **Canary deployment** is similar but focuses on detecting failures: send a small percentage of traffic to the new model and monitor for errors, latency spikes, or anomalous predictions before broader rollout. Always maintain the ability to **rollback** instantly by keeping the previous model version deployed. On Vertex AI, this means keeping the old model endpoint active and using traffic splitting. Shadow mode (serving both models but only returning the champion's predictions) is useful for testing without user impact.

### System Design Scenario

>**Design Challenge:** **Scenario:** Your company's fraud detection model processes 10,000 transactions per second. The current model was trained 6 months ago and accuracy has dropped from 97% to 91%. Latency requirement is under 50ms per prediction. Design a system to continuously maintain model quality.  
>   
> **A strong answer covers:** (1) Diagnosis — determine whether the drop is data drift (new transaction patterns) or concept drift (fraud tactics changed). Use Vertex AI Model Monitoring to compare current feature distributions against training baselines and track prediction confidence over time. (2) Continuous training pipeline — automated TFX pipeline triggered weekly: ingest labeled data (fraud/not-fraud from human review), validate with TFDV, retrain, evaluate against the champion model on a holdout set, and promote only if metrics improve. (3) Serving architecture — Vertex AI online prediction with GPU-backed endpoints, autoscaling from 2 to 20 replicas based on QPS, model quantization (INT8) to meet 50ms latency. (4) Safe deployment — shadow mode first (new model runs but does not affect decisions), then A/B test with 5% traffic, then gradual rollout. (5) Feedback loop — human fraud analysts label flagged transactions, creating a continuous labeled dataset. (6) Monitoring — alert on prediction latency P99, feature drift scores, prediction distribution shifts, and accuracy on labeled examples.

### Common Mistakes

-   **Confusing data drift with concept drift** — Data drift means input distributions changed; concept drift means the target relationship changed. The distinction matters because data drift can be detected by monitoring features alone (no labels needed), while concept drift requires monitoring prediction quality (which needs labels). Treating all model degradation as "the model needs more data" misses the root cause and leads to wasted retraining cycles.
-   **Deploying models without A/B testing** — Replacing a production model wholesale because it has better offline metrics is a common and costly mistake. Offline evaluation does not capture all production dynamics (traffic patterns, feature distributions, business metrics). Always A/B test in production. Even a 1% traffic canary for 24 hours can catch catastrophic issues that offline evaluation misses.
-   **Using float32 for the output layer with mixed precision training** — Mixed precision (float16/bfloat16) dramatically speeds up training and reduces memory, but the **output layer must remain float32** to maintain numerical stability in the loss computation. Forgetting this causes NaN losses or degraded accuracy. In Keras, use `tf.keras.mixed_precision.set_global_policy('mixed_float16')` and explicitly set `dtype='float32'` on the final Dense layer.

Previous Module

[07 · TensorFlow on GCP](07-tensorflow-gcp.html)

Next Module

[09 · MLOps: Getting Started](09-mlops-getting-started.html)

MLOps & Automation