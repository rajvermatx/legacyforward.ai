---
title: "Building & Scaling Models with TensorFlow"
slug: "tensorflow-gcp"
description: "This module covers the entire TensorFlow ecosystem on Google Cloud — from efficient data pipelines
    with tf.data to distributed training on Vertex AI. You will learn to build production-grade
    neural networks with Keras, optimize training with callbacks and custom loops, and scale to multi-GPU"
section: "gcp-mle"
order: 7
badges:
  - "TF Ecosystem"
  - "tf.data Pipelines"
  - "Keras APIs"
  - "Distributed Training"
  - "Vertex AI Training"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/07-tensorflow-gcp.ipynb"
---

## 01. The TensorFlow Ecosystem

### Components Overview

TensorFlow is far more than a single library — it is an **end-to-end platform** for building, training, and deploying machine learning models. Understanding its ecosystem is essential for the MLE exam because many questions test whether you know which component to reach for in a given scenario.

TF

#### TensorFlow Core

The foundational library providing tensor operations, automatic differentiation with `tf.GradientTape`, and the computational graph runtime. TF 2.x uses eager execution by default while allowing `@tf.function` for graph-mode optimization.

K

#### Keras

The high-level API integrated into TF 2.x as `tf.keras`. Provides Sequential, Functional, and Subclassing APIs for model building. The recommended starting point for most ML tasks. Includes built-in training loops, callbacks, and metrics.

X

#### TensorFlow Extended (TFX)

A production ML pipeline framework. Includes components for data validation (TFDV), data transformation (TFT), model training, model evaluation (TFMA), and serving. Powers end-to-end ML pipelines on Vertex AI Pipelines.

L

#### TensorFlow Lite

An optimized runtime for on-device inference on mobile phones, embedded devices, and IoT. Supports model quantization (int8, float16), pruning, and hardware acceleration via delegates (GPU, NNAPI, CoreML).

JS

#### TensorFlow.js

Run ML models directly in the browser or Node.js. Useful for client-side inference (no server round trip), privacy-sensitive applications, and interactive demos. Can import SavedModels or train from scratch in JavaScript.

H

#### TensorFlow Hub

A repository of pre-trained models and reusable model components (embeddings, feature vectors, full models). Supports transfer learning by providing ready-to-use layers that can be fine-tuned on your data.

>**Exam Tip:** The exam frequently tests when to use TF Lite (edge/mobile deployment), TFX (production pipelines), and TF Hub (transfer learning). Know the boundaries: TF Lite is inference-only, TFX is the pipeline orchestrator, and TF Hub provides pre-trained building blocks.

## 02. Input Data Pipelines

### Reading Data from Various Sources

The `tf.data.Dataset` API is TensorFlow's standard mechanism for building efficient, scalable input pipelines. It provides a functional, chainable API that handles reading, parsing, transforming, batching, and prefetching data. On GCP, your data typically lives in **BigQuery**, **Cloud Storage (GCS)**, or as **TFRecord files**.

**TFRecord format** is TensorFlow's native binary serialization format. It stores data as a sequence of serialized protocol buffers (`tf.train.Example`), each containing a dictionary of features. TFRecords are ideal for large datasets because they support efficient sequential reads, work well with GCS, and can be sharded across multiple files for parallel reading.

```
# Reading from GCS (CSV files)
dataset = tf.data.experimental.make_csv_dataset(
    "gs://my-bucket/data/train-*.csv",
    batch_size=32,
    label_name="target",
    num_epochs=1,
    shuffle=True
)

# Reading TFRecord files from GCS
filenames = tf.io.gfile.glob("gs://my-bucket/data/train-*.tfrecord")
dataset = tf.data.TFRecordDataset(filenames, compression_type="GZIP")
dataset = dataset.map(parse_fn, num_parallel_calls=tf.data.AUTOTUNE)

# Reading from BigQuery via BigQuery Connector
from tensorflow_io.bigquery import BigQueryClient
client = BigQueryClient()
read_session = client.read_session(
    "projects/my-project",
    parent_project="my-project",
    table="my-project.dataset.table",
    selected_fields=["feature1", "feature2", "label"],
    output_types=[tf.float32, tf.float32, tf.int32],
    requested_streams=4
)
dataset = read_session.parallel_read_rows()
```

### tf.data Performance Optimization

A naively constructed input pipeline will bottleneck your training. The GPU sits idle while waiting for data to load, parse, and transform. The `tf.data` API provides several mechanisms to overlap I/O with computation and maximize throughput.

**Prefetch** overlaps data preprocessing with model training. While the GPU processes batch N, the CPU prepares batch N+1. Always use `tf.data.AUTOTUNE` to let TensorFlow dynamically tune the buffer size.

**Interleave** reads from multiple files simultaneously, reducing I/O bottlenecks when data is sharded across many files. The `cycle_length` parameter controls how many files are read concurrently.

**Cache** stores the dataset in memory (or on local disk) after the first epoch, eliminating redundant I/O for subsequent epochs. Use `.cache()` after expensive transformations but before randomized augmentations.

**Parallel map** uses multiple CPU cores to apply transformation functions. Set `num_parallel_calls=tf.data.AUTOTUNE` for automatic parallelism tuning.

```
# Optimized input pipeline pattern
def build_dataset(file_pattern, batch_size=64):
    files = tf.data.Dataset.list_files(file_pattern, shuffle=True)

    dataset = files.interleave(
        lambda f: tf.data.TFRecordDataset(f),
        cycle_length=8,              # Read from 8 files concurrently
        num_parallel_calls=tf.data.AUTOTUNE,
        deterministic=False          # Non-deterministic for speed
    )

    dataset = dataset.map(
        parse_and_augment,
        num_parallel_calls=tf.data.AUTOTUNE
    )

    dataset = dataset.cache()             # Cache after parsing
    dataset = dataset.shuffle(10000)       # Shuffle buffer
    dataset = dataset.batch(batch_size)
    dataset = dataset.prefetch(tf.data.AUTOTUNE)  # Overlap with training

    return dataset
```

>**Common Pitfall:** Order matters in tf.data pipelines. The typical optimal order is: **list\_files → interleave → map (parse) → cache → map (augment) → shuffle → batch → prefetch**. Caching before augmentation ensures augmentations are re-applied each epoch. Caching after augmentation would freeze augmentations. Shuffling after caching is more memory-efficient.
>**tf.data.AUTOTUNE:** Setting `num_parallel_calls=tf.data.AUTOTUNE` and `prefetch(tf.data.AUTOTUNE)` lets TensorFlow's runtime dynamically allocate CPU resources based on available capacity. This is almost always the right choice and is strongly preferred on the exam over hardcoded values.

## 03. Building Neural Networks with Keras

### Sequential and Functional APIs

Keras provides three progressively flexible ways to define models. The **Sequential API** is the simplest: it creates a linear stack of layers. It works for straightforward feed-forward networks but cannot handle multiple inputs, multiple outputs, shared layers, or non-linear topologies.

```
# Sequential API — linear stack of layers
model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation="relu", input_shape=(784,)),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation="relu"),
    tf.keras.layers.Dense(10, activation="softmax")
])
```

The **Functional API** supports arbitrary graph topologies. You define layers as functions called on tensors, enabling multi-input/multi-output architectures, residual connections, and shared layers. This is the most commonly used API for production models.

```
# Functional API — arbitrary graph topologies
inputs = tf.keras.Input(shape=(784,))
x = tf.keras.layers.Dense(128, activation="relu")(inputs)
x = tf.keras.layers.Dropout(0.3)(x)
residual = x
x = tf.keras.layers.Dense(128, activation="relu")(x)
x = tf.keras.layers.Add()([x, residual])    # Residual connection
outputs = tf.keras.layers.Dense(10, activation="softmax")(x)

model = tf.keras.Model(inputs=inputs, outputs=outputs)
```

### Model Subclassing

**Model Subclassing** gives you full control by defining the model as a Python class. You implement `__init__` to create layers and `call` to define the forward pass. This enables dynamic architectures with Python control flow (loops, conditionals) but sacrifices some Keras features like automatic serialization and layer visualization.

```
# Model Subclassing — full Python flexibility
class CustomModel(tf.keras.Model):
    def __init__(self, num_classes=10):
        super().__init__()
        self.dense1 = tf.keras.layers.Dense(128, activation="relu")
        self.dropout = tf.keras.layers.Dropout(0.3)
        self.dense2 = tf.keras.layers.Dense(num_classes, activation="softmax")

    def call(self, inputs, training=False):
        x = self.dense1(inputs)
        x = self.dropout(x, training=training)  # Dropout active only during training
        return self.dense2(x)
```

>**When to Use Which API:** **Sequential**: simple feed-forward, quick prototyping. **Functional**: multi-input/output, residual connections, shared layers — the default for most production work. **Subclassing**: dynamic architectures, research, custom training logic. The exam often presents a scenario and asks which API is most appropriate.

## 04. Common Neural Network Architectures

### Architecture Selection Guide

Choosing the right architecture depends on the data type and the task. The exam tests your ability to match architectures to problems.

D

#### Dense (Fully Connected)

Best for **tabular/structured data**. Each neuron connects to every neuron in the next layer. Use for classification, regression on feature vectors. Combine with batch normalization and dropout for regularization.

C

#### CNN (Convolutional)

Best for **spatial data**: images, video, spectrograms. Learns local patterns through convolution kernels with weight sharing and translation invariance. Key layers: Conv2D, MaxPooling2D, BatchNormalization. Common architectures: ResNet, EfficientNet, MobileNet.

R

#### RNN / LSTM / GRU

Designed for **sequential data**: time series, text, audio. LSTM uses gates (forget, input, output) to control information flow, solving the vanishing gradient problem. GRU is a simpler alternative with fewer parameters. Use Bidirectional wrappers for tasks needing both past and future context.

T

#### Transformer

State-of-the-art for **sequence-to-sequence** tasks and now dominant across modalities. Self-attention enables parallel processing of entire sequences. Multi-head attention captures different relationship patterns. Positional encodings preserve sequence order. Used in BERT, GPT, ViT, and modern speech models.

>**Architecture Decision Framework:** Tabular data → Dense + feature engineering. Images → CNN (or ViT for large datasets). Short sequences → 1D CNN or LSTM. Long sequences with attention needs → Transformer. Time series forecasting → LSTM or Temporal Fusion Transformer. The exam will present the data type and expect you to choose correctly.

## 05. Training Callbacks

Keras callbacks are objects that hook into the training loop at specific points (epoch start/end, batch start/end) to perform actions like saving checkpoints, adjusting learning rates, or stopping training early. They are essential for production training workflows.

```
# Essential callbacks for production training
callbacks = [
    # Stop training when validation loss stops improving
    tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=5,            # Wait 5 epochs for improvement
        restore_best_weights=True,  # Revert to best epoch
        min_delta=0.001        # Minimum change to qualify
    ),

    # Save the best model checkpoint
    tf.keras.callbacks.ModelCheckpoint(
        filepath="best_model.keras",
        monitor="val_loss",
        save_best_only=True,
        save_weights_only=False  # Save full model
    ),

    # Log metrics for TensorBoard visualization
    tf.keras.callbacks.TensorBoard(
        log_dir="./logs",
        histogram_freq=1,    # Log weight histograms
        profile_batch="10,20" # Profile batches 10-20
    ),

    # Reduce learning rate when metric plateaus
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,            # Halve the learning rate
        patience=3,            # Wait 3 epochs
        min_lr=1e-6            # Minimum learning rate
    ),
]

# Use callbacks in model.fit()
history = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=100,             # Set high; EarlyStopping will halt
    callbacks=callbacks
)
```

>**Exam Tip:** **EarlyStopping** prevents overfitting by halting training when validation performance degrades. **ModelCheckpoint** ensures you never lose the best model even if training continues past the optimum. **ReduceLROnPlateau** is a simple yet effective learning rate schedule. The exam may ask which callback to use for a given problem.

## 06. Custom Training Loops with tf.GradientTape

While `model.fit()` handles most training scenarios, you sometimes need fine-grained control over the training step — for example, when implementing GANs, multi-task learning with custom loss weighting, or gradient accumulation for large effective batch sizes. TensorFlow's `tf.GradientTape` records operations for automatic differentiation.

```
# Custom training loop with tf.GradientTape
optimizer = tf.keras.optimizers.Adam(learning_rate=1e-3)
loss_fn = tf.keras.losses.SparseCategoricalCrossentropy()

for epoch in range(num_epochs):
    for x_batch, y_batch in train_dataset:
        with tf.GradientTape() as tape:
            predictions = model(x_batch, training=True)
            loss = loss_fn(y_batch, predictions)

        # Compute gradients
        gradients = tape.gradient(loss, model.trainable_variables)

        # Optional: clip gradients to prevent exploding gradients
        gradients = [tf.clip_by_norm(g, 1.0) for g in gradients]

        # Apply gradients
        optimizer.apply_gradients(zip(gradients, model.trainable_variables))
```

**When to use custom training loops:** GANs (alternating generator/discriminator updates), reinforcement learning, gradient accumulation for large batch simulation, multi-task learning with independent optimizers, or when you need to log intermediate values that `model.fit()` does not expose.

>**Performance Note:** Custom training loops lose some built-in optimizations of `model.fit()`. Use `@tf.function` on your training step to compile it into a TF graph for better performance. Without it, each step runs in eager mode, which is significantly slower for production training.

```
# Optimized custom step with @tf.function
@tf.function
def train_step(x, y):
    with tf.GradientTape() as tape:
        predictions = model(x, training=True)
        loss = loss_fn(y, predictions)
    gradients = tape.gradient(loss, model.trainable_variables)
    optimizer.apply_gradients(zip(gradients, model.trainable_variables))
    return loss
```

## 07. Distributed Training on Vertex AI

### Distribution Strategies

TensorFlow's `tf.distribute` module provides strategies for distributing training across multiple devices and machines. The key insight is that most strategies implement **data parallelism**: the model is replicated on each device, each replica processes a slice of the data, and gradients are aggregated (typically via all-reduce) before updating.

M

#### MirroredStrategy

**Single machine, multiple GPUs.** Creates one model replica per GPU. Uses NCCL all-reduce for gradient synchronization. Zero code changes to the model — just wrap dataset creation and model building inside `strategy.scope()`. The most common strategy for single-node multi-GPU training.

MW

#### MultiWorkerMirroredStrategy

**Multiple machines, each with multiple GPUs.** Extends MirroredStrategy across worker nodes. Requires `TF_CONFIG` environment variable to coordinate workers. Uses all-reduce across machines (ring all-reduce or hierarchical). Use for datasets or models that need more GPUs than a single machine can hold.

T

#### TPUStrategy

**Training on TPU pods.** TPUs use a custom all-reduce interconnect (ICI). Requires resolving the TPU cluster first with `tf.distribute.cluster_resolver.TPUClusterResolver`. Highly efficient for large batch training. Special considerations: use `tf.float32` carefully (TPUs prefer bfloat16), avoid Python-side data processing.

```
# MirroredStrategy — single machine, multi-GPU
strategy = tf.distribute.MirroredStrategy()
print(f"Number of devices: {strategy.num_replicas_in_sync}")

with strategy.scope():
    model = build_model()
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

# Global batch size = per_replica_batch * num_replicas
GLOBAL_BATCH = 64 * strategy.num_replicas_in_sync
train_ds = build_dataset(batch_size=GLOBAL_BATCH)

model.fit(train_ds, epochs=10)

# TPUStrategy
resolver = tf.distribute.cluster_resolver.TPUClusterResolver()
tf.config.experimental_connect_to_cluster(resolver)
tf.tpu.experimental.initialize_tpu_system(resolver)
tpu_strategy = tf.distribute.TPUStrategy(resolver)
```

>**Batch Size Scaling:** When using distributed strategies, the **global batch size = per-replica batch size x number of replicas**. If you had batch\_size=64 on 1 GPU, use batch\_size=64\*N on N GPUs to maintain the same per-replica batch. You may also need to scale the learning rate linearly with the number of replicas (linear scaling rule) and use a warmup period to stabilize training.
>**Exam Decision Tree:** Single machine, multiple GPUs → **MirroredStrategy**. Multiple machines, multiple GPUs → **MultiWorkerMirroredStrategy**. TPU → **TPUStrategy**. Single GPU → no strategy needed (or use `OneDeviceStrategy` for compatibility). The exam will describe the hardware setup and expect you to choose the correct strategy.

## 08. Training at Scale with Vertex AI

### Custom Training Jobs & Hyperparameter Tuning

Vertex AI provides managed infrastructure for training ML models at any scale. You can submit **custom training jobs** that run your training code on Google Cloud compute resources, with options for pre-built containers (TensorFlow, PyTorch, XGBoost) or custom Docker containers.

**Pre-built containers** are Google-maintained Docker images with popular ML frameworks pre-installed. Use them when your training code uses standard frameworks and dependencies. They save time and reduce container management overhead.

**Custom containers** give you full control over the runtime environment. Use them when you have custom dependencies, non-standard frameworks, or need specific system libraries. You build a Docker image, push it to Artifact Registry, and reference it in your training job.

```
# Vertex AI Custom Training Job with SDK
from google.cloud import aiplatform

aiplatform.init(project="my-project", location="us-central1")

# Pre-built container approach
job = aiplatform.CustomTrainingJob(
    display_name="tf-training-job",
    script_path="trainer/task.py",
    container_uri="us-docker.pkg.dev/vertex-ai/training/tf-gpu.2-12:latest",
    requirements=["cloudml-hypertune"],
    model_serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/tf2-gpu.2-12:latest",
)

model = job.run(
    replica_count=1,
    machine_type="n1-standard-8",
    accelerator_type="NVIDIA_TESLA_V100",
    accelerator_count=2,
    args=["--epochs=50", "--batch-size=128"],
)

# Custom container approach
custom_job = aiplatform.CustomContainerTrainingJob(
    display_name="custom-container-job",
    container_uri="us-docker.pkg.dev/my-project/my-repo/trainer:latest",
    model_serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/tf2-gpu.2-12:latest",
)
```

**Hyperparameter tuning** on Vertex AI uses the Vizier service to efficiently search the hyperparameter space. You define the parameters to tune, their ranges, the optimization metric, and the search algorithm. Vertex AI manages trial scheduling, early stopping of unpromising trials, and resource allocation.

```
# Hyperparameter Tuning Job
from google.cloud.aiplatform import hyperparameter_tuning as hpt

job = aiplatform.HyperparameterTuningJob(
    display_name="hpt-tf-model",
    custom_job=custom_training_job,
    metric_spec={"val_accuracy": "maximize"},
    parameter_spec={
        "learning_rate": hpt.DoubleParameterSpec(
            min=1e-5, max=1e-1, scale="log"
        ),
        "num_layers": hpt.IntegerParameterSpec(
            min=2, max=8, scale="linear"
        ),
        "dropout_rate": hpt.DoubleParameterSpec(
            min=0.1, max=0.5, scale="linear"
        ),
    },
    max_trial_count=50,
    parallel_trial_count=5,
    search_algorithm=None,  # None = Bayesian (Vizier default)
)

job.run()
```

>**Pre-built vs Custom Containers:** **Use pre-built** when: standard TF/PyTorch/XGBoost, dependencies installable via pip, no custom system packages needed. **Use custom** when: proprietary libraries, specific CUDA versions, custom system dependencies, or multi-framework code. The exam tests this decision frequently.

## 09. Exam Focus Areas

This section summarizes the key concepts from Course 07 that are most likely to appear on the GCP Professional Machine Learning Engineer exam, mapping to **Section 3: Scaling prototypes into ML models**.

### Distribution Strategy Selection

-   **MirroredStrategy**: single machine, multiple GPUs. Most common. Uses NCCL all-reduce.
-   **MultiWorkerMirroredStrategy**: multiple machines. Requires TF\_CONFIG. Use when single machine GPUs are insufficient.
-   **TPUStrategy**: for TPU pods. Requires TPUClusterResolver. Prefer bfloat16 precision.
-   Batch size must scale with replicas. Learning rate may need linear scaling + warmup.

### tf.data Optimization

-   Always use `prefetch(tf.data.AUTOTUNE)` at the end of your pipeline.
-   Use `interleave` for parallel reading from multiple files.
-   Cache after parsing, before augmentation. Shuffle after cache.
-   TFRecord is the preferred format for large-scale training on GCP.

### Container Selection

-   Pre-built containers: standard frameworks, pip-installable dependencies.
-   Custom containers: proprietary code, custom system libraries, specific CUDA versions.
-   Hyperparameter tuning: use Vizier (Bayesian optimization), define metric\_spec and parameter\_spec.
-   Use `cloudml-hypertune` to report metrics from training code to the tuning service.

>**High-Frequency Exam Topics:** Questions about tf.data optimization order, choosing the right distribution strategy based on hardware description, and deciding between pre-built vs custom containers appear frequently. Know the specific use case for each and be prepared to identify the correct answer from scenario descriptions.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** TensorFlow on GCP is the end-to-end stack for building, training, and deploying deep learning models at scale. It starts with **tf.data** for building efficient input pipelines — using `prefetch`, `interleave`, and `cache` to keep GPUs/TPUs fed without I/O bottlenecks. Models are built with **Keras** using three API tiers: Sequential for simple stacks, Functional for complex architectures (multi-input, skip connections), and Model Subclassing for full custom control. Training scales via **distribution strategies**: MirroredStrategy for multi-GPU on one machine, MultiWorkerMirroredStrategy across machines, and TPUStrategy for TPU pods. **Callbacks** (EarlyStopping, ModelCheckpoint, TensorBoard) automate training management. For production, **Vertex AI Training** provides managed infrastructure with pre-built containers for standard frameworks and custom containers for specialized needs, plus Vizier-based hyperparameter tuning. The key insight is that TensorFlow is not just a modeling library — it is a production system where every component (data pipeline, model, training loop, distribution, serving) is designed to work together seamlessly from prototype to production scale.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| How do you optimize a tf.data input pipeline to avoid GPU starvation? | Do you know the prefetch/interleave/cache pattern and why pipeline ordering matters? |
| When would you choose MirroredStrategy vs MultiWorkerMirroredStrategy vs TPUStrategy? | Can you match distribution strategies to hardware configurations and explain the tradeoffs? |
| What are the three Keras API levels and when do you use each? | Do you understand the flexibility-simplicity tradeoff and when subclassing is truly needed? |
| How does Vertex AI Training handle distributed training and hyperparameter tuning? | Can you describe custom jobs, worker pools, and Vizier integration in practical terms? |
| When should you use a pre-built container vs a custom container on Vertex AI? | Do you know the boundary between standard and custom deployment needs? |

### Model Answers

>**Q1 — tf.data Optimization:** The goal is to overlap data loading, preprocessing, and training so the GPU never waits for data. The canonical pattern: (1) `tf.data.TFRecordDataset` with `interleave(num_parallel_calls=AUTOTUNE)` to read from multiple files in parallel. (2) `.map(parse_fn, num_parallel_calls=AUTOTUNE)` to decode and preprocess. (3) `.cache()` after parsing if the dataset fits in memory — this avoids re-reading from disk on subsequent epochs. (4) `.shuffle(buffer_size)` after cache to randomize order. (5) `.batch(batch_size)` to group examples. (6) `.prefetch(AUTOTUNE)` at the very end to overlap the next batch's preparation with current batch's training. The ordering matters: cache before shuffle (to avoid re-reading), shuffle before batch (for proper randomization), prefetch always last. TFRecord is the preferred format because it stores serialized protocol buffers that are optimized for sequential reads.
>**Q2 — Distribution Strategies:** **MirroredStrategy**: single machine with multiple GPUs. Each GPU holds a complete model replica. Gradients are synchronized via NCCL all-reduce after each step. This is the most common strategy and the simplest to implement — just wrap your training code in `with strategy.scope():`. **MultiWorkerMirroredStrategy**: extends to multiple machines, each with one or more GPUs. Requires `TF_CONFIG` environment variable to coordinate workers. Use when your model fits on a single GPU but your dataset or training time demands more parallelism. **TPUStrategy**: for Cloud TPU pods. Requires `TPUClusterResolver`, prefers bfloat16 precision, and needs batch sizes that are multiples of 8 (number of TPU cores). Best for large-batch, matrix-heavy training on TensorFlow/JAX models. In all cases, batch size should scale linearly with the number of replicas, and learning rate may need linear scaling with warmup.
>**Q3 — Keras API Levels:** **Sequential**: a linear stack of layers, one input and one output. Use for simple architectures like a basic classifier (Dense → Dense → Dense). Cannot handle skip connections, multiple inputs, or shared layers. **Functional API**: defines models as a DAG of layers. Supports multiple inputs/outputs, skip connections (ResNet), shared layers, and complex branching. This is the most commonly used API in production because it covers most architectures while remaining declarative and inspectable. **Model Subclassing**: inherit from `tf.keras.Model` and implement `call()` for full Python control over the forward pass. Use only when you need dynamic computation graphs (e.g., variable-length recursion, conditional logic) that cannot be expressed declaratively. The tradeoff: subclassed models are harder to serialize, inspect, and debug.
>**Q4 — Vertex AI Training:** Vertex AI Training provides **managed infrastructure** for training jobs. You define a `CustomJob` with one or more worker pools (specifying machine type, GPU/TPU count, and container image). For distributed training, Vertex AI sets up the `TF_CONFIG` automatically and manages inter-node communication. **Hyperparameter tuning** uses Vizier (Bayesian optimization): you define a `metric_spec` (metric to optimize and goal), `parameter_spec` (hyperparameter ranges and types), and max trial count. The training code reports metrics via `cloudml-hypertune`. Vertex AI runs parallel trials, uses early stopping on unpromising ones, and returns the best configuration. The key advantage over manual tuning is that Vizier intelligently explores the search space rather than grid or random search.
>**Q5 — Pre-built vs Custom Containers:** **Pre-built containers** are Google-maintained Docker images for standard frameworks (TensorFlow, PyTorch, XGBoost, scikit-learn). Use them when: your dependencies are pip-installable, you use a supported framework version, and you do not need custom system packages. They are faster to set up and are patched by Google for security. **Custom containers** are Docker images you build and push to Artifact Registry. Use them when: you need proprietary libraries, specific CUDA/cuDNN versions, custom system-level dependencies (apt packages), multi-framework code, or non-standard serving logic. You write a Dockerfile, build the image, push it, and reference it in your Vertex AI job spec. The exam frequently tests this decision boundary — if the scenario mentions "standard TensorFlow with pip packages," choose pre-built; if it mentions "custom C++ inference library," choose custom.

### System Design Scenario

>**Design Challenge:** **Scenario:** Your team needs to train an image classification model on 10 million labeled images (2 TB total) stored in GCS. Training must complete within 8 hours and the model needs to achieve at least 92% accuracy. Design the training infrastructure on GCP.  
>   
> **A strong answer covers:** (1) Data pipeline — convert images to TFRecord shards (e.g., 1000 files x 2 GB each) for efficient parallel reading. Use tf.data with `interleave` across shards, `map` for decoding/augmentation with AUTOTUNE, `cache` if feasible, and `prefetch`. (2) Model architecture — start with a pre-trained EfficientNet or ResNet backbone (transfer learning), fine-tune with a custom classification head. Use Keras Functional API. (3) Distribution strategy — MirroredStrategy with 4x A100 GPUs on a single n1-highmem machine. Scale batch size to 4x base batch with linear learning rate scaling and 5-epoch warmup. (4) Training management — EarlyStopping on validation loss (patience=5), ModelCheckpoint saving best weights, TensorBoard for monitoring. (5) Hyperparameter tuning — Vertex AI HPT with Vizier: tune learning rate (log-uniform 1e-5 to 1e-2), dropout (0.1-0.5), and augmentation strength. 20 trials with 4 parallel. (6) Cost optimization — use preemptible VMs for HPT trials (3x cheaper, acceptable if some fail), reserved GPU for final training run.

### Common Mistakes

-   **Putting prefetch before batch or cache after shuffle** — tf.data pipeline ordering is critical. The correct order is: read → parse/map → cache → shuffle → batch → prefetch. Caching after shuffle wastes the cache (different order each epoch). Prefetching before batching means you prefetch individual examples instead of full batches, losing the overlap benefit.
-   **Not scaling batch size and learning rate with distribution strategy** — When using MirroredStrategy with 4 GPUs, the effective batch size is 4x the per-replica batch. If you do not increase the learning rate proportionally (with warmup), training will converge to a worse optimum because each gradient step averages over more examples without a correspondingly larger update. The standard recipe is: linear LR scaling with a warmup period of 5-10% of total steps.
-   **Using Model Subclassing when the Functional API would suffice** — Subclassed models lose the benefits of Keras's graph tracing: no automatic shape inference, no `model.summary()`, harder serialization, and no easy export to SavedModel format. Unless your forward pass requires dynamic Python control flow, the Functional API is strictly preferable. Interviewers view unnecessary subclassing as a sign of inexperience with the Keras ecosystem.

Previous Module

[06 · Feature Engineering](06-feature-engineering.html)

Next Module

[08 · Production ML Systems](08-production-ml-systems.html)

Production Systems