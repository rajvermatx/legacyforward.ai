---
title: "Manufacturing Defect Detection"
slug: "defect-detection"
description: "Build an end-to-end computer vision pipeline on Google Cloud that detects surface defects
    in real time on manufacturing production lines — from image capture at the edge to
    AutoML Vision training, custom CNN fine-tuning, and low-latency edge deployment with
    Vertex AI and Edge TPU."
section: "gcp-mle-usecases"
order: 4
badges:
  - "AutoML Vision + Custom CNN"
  - "Edge TPU Real-Time Inference"
  - "Active Learning Pipeline"
  - "97.2% Detection Rate"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle-usecases/04-defect-detection.ipynb"
---

## 1. The Problem

### Why Manual Inspection Fails at Scale

Manual visual inspection on manufacturing lines catches only **80% of surface defects** under ideal conditions. But "ideal" is a generous term — human inspectors experience cognitive fatigue after roughly 30 minutes of continuous inspection, at which point detection accuracy drops to approximately **60%**. Manufacturing lines run 24/7; humans cannot sustain that pace.

The financial impact of missed defects is staggering. Automotive recalls average **$500 million per incident**. Electronics returns cost the industry over **$20 billion per year globally**. The asymmetry is brutal: catching a defect on the factory floor costs $1–$10, catching it during assembly costs $10–$100, and catching it after it reaches a customer costs **$100–$10,000** when you factor in warranty claims, brand damage, regulatory penalties, and potential safety recalls.

>**Cost Multiplier Rule:** The **Rule of 10** in manufacturing quality: the cost of fixing a defect multiplies by 10x at each stage of the product lifecycle — design, production, assembly, field. A $0.50 surface scratch caught at inspection becomes a $5,000 warranty claim if the part ships.

### Quality Control as a Throughput Bottleneck

Even when inspection accuracy is acceptable, the inspection station itself becomes a **production bottleneck**. A human inspector can evaluate 1–2 parts per second for simple pass/fail decisions, but complex multi-point inspection (checking welds, surface finish, dimensional tolerances, color matching) drops throughput to 10–15 parts per minute. Modern automated lines can produce 60–200 parts per minute, meaning the inspection station either slows the line or only samples a fraction of output.

Sampling-based inspection (checking every Nth part) is statistically valid for process-level quality monitoring, but it inherently means defective parts **will** ship. For safety-critical applications — brake components, medical device housings, semiconductor packages — 100% inspection is required, and that is where ML-based computer vision becomes essential.

### Defect Types in Manufacturing

Surface defects fall into several categories, each with distinct visual signatures and detection challenges:

| Defect Type | Visual Signature | Detection Difficulty | Typical Cause |
| --- | --- | --- | --- |
| **Scratch** | Linear mark, variable depth and width | Medium — varies with lighting angle | Handling, tooling contact |
| **Crack** | Irregular branching line, often subsurface | High — can be very fine | Thermal stress, material fatigue |
| **Dent** | Localized deformation, circular or oval | Medium — depth-dependent | Impact during handling |
| **Discoloration** | Color or texture variation over an area | Low-Medium — color-dependent | Chemical exposure, heat treatment |
| **Misalignment** | Geometric deviation from reference | Low — measurable offset | Tooling wear, fixture error |

## 2. Solution Architecture

The GCP-native architecture spans from the factory edge to the cloud, with inference happening at the edge for latency-critical decisions and training/retraining happening in the cloud where GPU/TPU resources are elastic.

### Architecture Components

-   Image capture from production line cameras (Cloud IoT Core / Edge TPU)
-   Image preprocessing and augmentation pipeline
-   AutoML Vision for initial model training (no ML expertise needed)
-   Custom Vision model for fine-grained defect classification
-   Edge deployment with Vertex AI endpoints
-   Real-time defect tracking dashboard
-   Feedback loop for continuous model improvement

![Diagram 1](/diagrams/gcp-mle-usecases/defect-detection-1.svg)

End-to-end architecture: from production line cameras through edge preprocessing, cloud training, and back to edge deployment with continuous feedback.

>**GCP MLE Exam Note:** The exam frequently tests your understanding of **when to use AutoML Vision vs. custom models**. AutoML is the right starting point when you have limited ML expertise or want a baseline quickly. Custom models (using Vertex AI Training with TensorFlow/PyTorch) are needed when you require fine-grained control over architecture, loss functions, or need to handle edge cases that AutoML cannot address.

## 3. Data Pipeline

### Image Capture Infrastructure

Industrial inspection cameras capture images at production line speed — typically **10–60 frames per second** depending on line speed and part complexity. Each camera generates 2–10 MB per image (12-bit RAW for maximum dynamic range), which translates to **1–5 TB of image data per camera per day**.

On GCP, image data flows through a multi-tier storage architecture:

```
# GCP Storage Architecture for Manufacturing Images

# Tier 1: Hot storage (recent images, active training data)
gsutil mb -l us-central1 -c standard gs://defect-images-hot/

# Tier 2: Nearline (30-90 day retention, model retraining)
gsutil mb -l us-central1 -c nearline gs://defect-images-nearline/

# Tier 3: Coldline (regulatory archive, 7-year retention)
gsutil mb -l us-central1 -c coldline gs://defect-images-archive/

# Lifecycle rule: auto-transition hot → nearline after 30 days
gsutil lifecycle set lifecycle.json gs://defect-images-hot/
```

### Labeling Strategy

Defect labeling is the most expensive and critical step. For manufacturing defect detection, labels must come from **domain experts** (quality engineers), not general crowdsourcing. GCP provides **Vertex AI Data Labeling Service** which supports custom labeling workflows with multi-annotator consensus and quality metrics.

```
# Vertex AI Data Labeling - Create labeling task
from google.cloud import aiplatform

aiplatform.init(project="manufacturing-qc", location="us-central1")

dataset = aiplatform.ImageDataset.create(
    display_name="defect-detection-v2",
    gcs_source="gs://defect-images-hot/labeled/import.csv",
    import_schema_uri=aiplatform.schema.dataset.ioformat.image
        .single_label_classification,
)

# CSV format: gs://bucket/image.jpg, defect_type
# gs://defect-images-hot/img_001.jpg, scratch
# gs://defect-images-hot/img_002.jpg, crack
# gs://defect-images-hot/img_003.jpg, normal
```

>**Data Balance Tip:** Manufacturing datasets are inherently imbalanced — typically 95%+ of parts are defect-free. You need strategies like **oversampling defective images**, **synthetic defect generation**, and **class-weighted loss functions** to train effective models. Aim for at least 100 labeled images per defect type for AutoML, and 500+ for custom models.

## 4. Image Preprocessing

### Normalization for Industrial Imagery

Industrial images differ significantly from natural images (ImageNet-style data). Manufacturing surfaces are often metallic, reflective, or textured in ways that standard normalization does not handle well. Preprocessing must account for **lighting variation** (different shifts, bulb aging), **camera drift** (focus, exposure), and **part orientation**.

```
import tensorflow as tf

def preprocess_industrial_image(image_path, target_size=(224, 224)):
    """Preprocessing pipeline for manufacturing inspection images."""
    # Read and decode
    img = tf.io.read_file(image_path)
    img = tf.image.decode_jpeg(img, channels=3)

    # Resize with anti-aliasing (preserves fine defect details)
    img = tf.image.resize(img, target_size, antialias=True)

    # CLAHE-style local contrast enhancement
    # (critical for metallic surfaces where defects are subtle)
    img = tf.cast(img, tf.float32) / 255.0

    # Per-channel normalization (not ImageNet means)
    # Use dataset-specific statistics computed from calibration images
    mean = tf.constant([0.485, 0.456, 0.406])
    std  = tf.constant([0.229, 0.224, 0.225])
    img  = (img - mean) / std

    return img
```

### Data Augmentation for Defect Detection

Augmentation is especially important for manufacturing datasets because defects are rare and each defect instance is unique. The augmentation strategy must be **physically plausible** — you can rotate and flip parts (they might arrive at any orientation), but you should not apply extreme color jitter that would mask discoloration defects.

```
def augment_defect_image(image, label):
    """Physically-plausible augmentation for manufacturing images."""
    # Geometric transforms (parts can arrive at any orientation)
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_flip_up_down(image)

    # Rotation: simulate part orientation variation
    angle = tf.random.uniform([], -0.2, 0.2)  # radians
    image = tfa.image.rotate(image, angle)

    # Brightness/contrast: simulate lighting variation between shifts
    image = tf.image.random_brightness(image, max_delta=0.1)
    image = tf.image.random_contrast(image, 0.9, 1.1)

    # SUBTLE color jitter only (preserve discoloration signal)
    image = tf.image.random_saturation(image, 0.95, 1.05)

    # Random crop and resize (simulate zoom / position variation)
    image = tf.image.random_crop(image, [200, 200, 3])
    image = tf.image.resize(image, [224, 224])

    return image, label

# Build tf.data pipeline with augmentation
train_ds = tf.data.Dataset.from_tensor_slices((train_paths, train_labels))
train_ds = (train_ds
    .map(load_and_preprocess, num_parallel_calls=tf.data.AUTOTUNE)
    .map(augment_defect_image, num_parallel_calls=tf.data.AUTOTUNE)
    .shuffle(1000)
    .batch(32)
    .prefetch(tf.data.AUTOTUNE)
)
```

>**Augmentation Pitfall:** Do **not** apply aggressive color augmentation when discoloration is a defect type. Similarly, avoid heavy Gaussian blur augmentation if you are detecting fine cracks — you would be training the model to ignore the exact features you want it to find. Always validate that your augmentation pipeline preserves the defect signal.

## 5. AutoML Vision

### The Drag-and-Drop Approach

**Vertex AI AutoML Vision** provides a no-code path to training image classification models. For manufacturing teams without dedicated ML engineers, AutoML Vision is the fastest path to a production-quality model. You upload labeled images, specify training budget (node-hours), and AutoML handles architecture search, hyperparameter tuning, and model selection automatically.

```
# AutoML Vision Training via Vertex AI SDK
from google.cloud import aiplatform

# Create dataset from labeled images in GCS
dataset = aiplatform.ImageDataset.create(
    display_name="defect-classification-v3",
    gcs_source="gs://defect-images-hot/labeled/import.csv",
    import_schema_uri=aiplatform.schema.dataset.ioformat
        .image.single_label_classification,
)

# Launch AutoML training job
job = aiplatform.AutoMLImageTrainingJob(
    display_name="defect-automl-v3",
    prediction_type="classification",
    multi_label=False,
    model_type="CLOUD",  # or "MOBILE_TF_LOW_LATENCY_1" for edge
    budget_milli_node_hours=8000,  # 8 node-hours
)

model = job.run(
    dataset=dataset,
    model_display_name="defect-automl-model-v3",
    training_fraction_split=0.8,
    validation_fraction_split=0.1,
    test_fraction_split=0.1,
)
```

### AutoML vs Custom: Decision Framework

| Criterion | AutoML Vision | Custom CNN |
| --- | --- | --- |
| **ML expertise needed** | None | Intermediate to advanced |
| **Time to first model** | Hours | Days to weeks |
| **Dataset size needed** | 100+ images/class | 500+ images/class |
| **Accuracy ceiling** | ~94% | ~98%+ with tuning |
| **Edge deployment** | TF Lite export | Full control over quantization |
| **Custom loss functions** | Not supported | Full flexibility |
| **Cost** | $3.15/node-hour | Variable (GPU/TPU pricing) |

>**Exam Strategy:** When the exam describes a team with **limited ML expertise** or asks for the **fastest path to production**, AutoML Vision is almost always the correct answer. When the question mentions **custom loss functions**, **specific architecture requirements**, or **sub-millisecond latency**, custom training is the answer.

## 6. Custom CNN with Transfer Learning

### Why Transfer Learning Works for Defects

Pre-trained models (EfficientNet, ResNet, MobileNetV2) have learned general visual features — edges, textures, shapes — that transfer remarkably well to industrial defect detection. The lower layers detect edges and gradients (exactly what scratches and cracks are), while higher layers learn compositional patterns. By **freezing** the lower layers and **fine-tuning** the upper layers, you can achieve high accuracy with relatively small datasets.

```
import tensorflow as tf
from tensorflow.keras import layers

def build_defect_classifier(num_classes=5, input_shape=(224, 224, 3)):
    """EfficientNetB0 with custom classification head for defects."""

    # Load pre-trained backbone (ImageNet weights)
    base_model = tf.keras.applications.EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=input_shape,
    )

    # Freeze backbone initially (Phase 1: train head only)
    base_model.trainable = False

    # Build classification head
    inputs = tf.keras.Input(shape=input_shape)
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = tf.keras.Model(inputs, outputs)

    # Class weights for imbalanced manufacturing data
    model.compile(
        optimizer=tf.keras.optimizers.Adam(lr=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.Precision(),
                 tf.keras.metrics.Recall()],
    )
    return model

# Phase 1: Train head only (10 epochs)
model = build_defect_classifier(num_classes=5)
model.fit(train_ds, validation_data=val_ds, epochs=10,
          class_weight=class_weights)

# Phase 2: Unfreeze top 30 layers and fine-tune
model.layers[1].trainable = True
for layer in model.layers[1].layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(lr=1e-5),  # Lower LR for fine-tuning
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)
model.fit(train_ds, validation_data=val_ds, epochs=20,
          class_weight=class_weights)
```

### Multi-Class Defect Classification

The five-class problem (normal, scratch, crack, dent, discoloration) requires careful attention to **per-class metrics**. Overall accuracy can be misleading when 90%+ of images are "normal." The metrics that matter are **per-defect-type precision and recall**, because the cost of a false negative (missed defect) is far higher than the cost of a false positive (unnecessary re-inspection).

```
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# Evaluate per-class performance
y_pred = model.predict(test_ds)
y_pred_classes = np.argmax(y_pred, axis=1)

class_names = ["normal", "scratch", "crack", "dent", "discoloration"]
print(classification_report(y_true, y_pred_classes,
                            target_names=class_names))

# Output:
#               precision    recall  f1-score   support
#       normal       0.99      0.98      0.99      1200
#      scratch       0.96      0.95      0.96       180
#        crack       0.98      0.97      0.97       120
#         dent       0.95      0.94      0.94       150
# discoloration      0.94      0.93      0.93        90
```

>**Critical: Recall over Precision:** In manufacturing defect detection, **recall is more important than precision**. A false positive means a good part gets re-inspected (cost: $0.10). A false negative means a defective part ships to a customer (cost: $100–$10,000). Tune your classification threshold to maximize recall, even at the expense of some precision. A recall target of **99%+** for safety-critical defects like cracks is standard.

### Focal Loss for Class Imbalance

Standard cross-entropy loss struggles with imbalanced manufacturing datasets because the model can achieve 95% accuracy by simply predicting "normal" for everything. **Focal Loss** down-weights easy examples (correctly classified normal parts) and focuses learning on hard examples (subtle defects). This is the same loss function that powers object detection models like RetinaNet.

```
def focal_loss(gamma=2.0, alpha=0.25):
    """Focal Loss for handling extreme class imbalance."""
    def loss_fn(y_true, y_pred):
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1.0 - 1e-7)
        cross_entropy = -y_true * tf.math.log(y_pred)
        weight = alpha * y_true * tf.pow(1.0 - y_pred, gamma)
        focal = weight * cross_entropy
        return tf.reduce_mean(tf.reduce_sum(focal, axis=-1))
    return loss_fn

# Use focal loss instead of categorical crossentropy
model.compile(
    optimizer=tf.keras.optimizers.Adam(lr=1e-4),
    loss=focal_loss(gamma=2.0, alpha=0.25),
    metrics=["accuracy"],
)
```

## 7. Edge Deployment

### Why Edge Inference for Manufacturing

Cloud-based inference adds **50–200ms of network latency**, which is unacceptable when production line parts are moving at speed. A part moving at 1 meter/second travels 10–20cm during a cloud round-trip — enough to pass the rejection gate before the decision arrives. Edge inference delivers **<20ms** on a Coral Edge TPU, enabling real-time accept/reject decisions.

Additionally, manufacturing facilities may have limited or unreliable internet connectivity. Edge deployment ensures the inspection system continues operating during network outages.

### Model Optimization for Edge TPU

```
# Step 1: Convert to TensorFlow Lite with quantization
converter = tf.lite.TFLiteConverter.from_saved_model("saved_model/")
converter.optimizations = [tf.lite.Optimize.DEFAULT]

# Full integer quantization for Edge TPU compatibility
def representative_dataset():
    for image, _ in calibration_ds.take(100):
        yield [tf.cast(image, tf.float32)]

converter.representative_dataset = representative_dataset
converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS_INT8
]
converter.inference_input_type = tf.uint8
converter.inference_output_type = tf.uint8

tflite_model = converter.convert()

# Save quantized model (~4x smaller than float32)
with open("defect_model_quant.tflite", "wb") as f:
    f.write(tflite_model)

# Step 2: Compile for Edge TPU
# edgetpu_compiler defect_model_quant.tflite
# Output: defect_model_quant_edgetpu.tflite
```

### Deploying with Vertex AI Endpoints

```
# Deploy model to Vertex AI Endpoint for hybrid edge/cloud
endpoint = aiplatform.Endpoint.create(
    display_name="defect-detection-endpoint",
    project="manufacturing-qc",
    location="us-central1",
)

model.deploy(
    endpoint=endpoint,
    deployed_model_display_name="defect-v3-prod",
    machine_type="n1-standard-4",
    min_replica_count=1,
    max_replica_count=3,
    traffic_split={"0": 100},
    # Enable auto-scaling based on GPU utilization
    autoscaling_target_cpu_utilization=70,
)

# Prediction from endpoint
import base64

with open("test_image.jpg", "rb") as f:
    encoded = base64.b64encode(f.read()).decode("utf-8")

prediction = endpoint.predict(
    instances=[{"content": encoded}]
)
print(prediction.predictions)
```

>**Edge vs Cloud Trade-offs:** **Edge:** <20ms latency, works offline, limited model size (8MB for Edge TPU), requires int8 quantization, hardware cost per station.  
> **Cloud:** Unlimited model size, easy scaling, 50–200ms latency, requires reliable network, ongoing API costs. Most production deployments use a **hybrid approach** — edge for real-time pass/fail, cloud for detailed defect analysis and model retraining.

## 8. Active Learning Pipeline

### Why Active Learning Matters

Manufacturing processes evolve. New materials introduce new defect types. Tooling wear causes gradual shifts in defect appearance. A model trained on historical data will **degrade over time** (concept drift). Active learning solves this by automatically identifying images where the model is **uncertain** and routing them to human experts for labeling, then retraining the model with the new data.

```
def compute_uncertainty(predictions):
    """Compute prediction entropy as uncertainty measure."""
    # High entropy = model is uncertain between classes
    entropy = -tf.reduce_sum(
        predictions * tf.math.log(predictions + 1e-7),
        axis=-1
    )
    return entropy

def active_learning_loop(model, new_images, threshold=0.5):
    """Flag uncertain predictions for human review."""
    predictions = model.predict(new_images)
    uncertainties = compute_uncertainty(predictions)

    # Split into confident and uncertain
    confident_mask = uncertainties < threshold
    uncertain_mask = ~confident_mask

    # Auto-accept confident predictions
    auto_results = predictions[confident_mask]

    # Route uncertain images to human review queue
    review_images = new_images[uncertain_mask]
    send_to_review_queue(review_images, uncertainties[uncertain_mask])

    return auto_results, review_images

def send_to_review_queue(images, scores):
    """Publish uncertain images to Pub/Sub for human review."""
    from google.cloud import pubsub_v1
    publisher = pubsub_v1.PublisherClient()
    topic = publisher.topic_path("manufacturing-qc",
                                  "defect-review-queue")

    for img, score in zip(images, scores):
        # Upload image to GCS and publish message
        gcs_path = upload_to_gcs(img)
        publisher.publish(topic,
            data=gcs_path.encode(),
            uncertainty_score=str(float(score))
        )
```

### Retraining Trigger Strategy

Retraining should not happen after every new label — that would be wasteful and cause unnecessary model version churn. Use a combination of triggers:

-   **Volume trigger:** retrain after N new labeled samples (e.g., 200)
-   **Drift trigger:** retrain when prediction distribution shifts significantly
-   **Performance trigger:** retrain when monitored precision/recall drops below threshold
-   **Scheduled:** weekly retraining as a safety net regardless of triggers

>**Vertex AI Model Monitoring:** Vertex AI Model Monitoring can automatically detect **feature drift** (input distribution changes) and **prediction drift** (output distribution changes). Configure alerts to trigger retraining pipelines via Cloud Functions when drift exceeds your configured thresholds.

## 9. Key GCP Components

Each component in the architecture maps to a specific GCP service. Understanding which service to use for each function is critical for the MLE exam.

📷

#### AutoML Vision

No-code image classification and object detection. Automatic architecture search, hyperparameter tuning, and model selection. Supports export to TF Lite and Edge TPU formats. Best for teams without deep ML expertise or for establishing baselines quickly.

⚙️

#### Vertex AI Training

Custom model training with managed infrastructure. Supports TensorFlow, PyTorch, and scikit-learn. Auto-scaling GPU/TPU allocation, distributed training, hyperparameter tuning with Vizier. Required when you need custom architectures or loss functions.

🔥

#### Edge TPU

Purpose-built ASIC for running TF Lite models at the edge. Delivers 4 TOPS at 2W power. Requires int8 quantization. Available in USB, PCIe, and SoM form factors. Ideal for factory-floor deployment where latency and reliability are critical.

📦

#### Cloud Storage

Multi-tier object storage for image data. Standard tier for active training data, Nearline for recent archives, Coldline for regulatory compliance. Lifecycle policies automate data tiering. Integrates natively with Vertex AI datasets.

🧠

#### Transfer Learning

Technique of reusing pre-trained model weights (EfficientNet, ResNet, MobileNet) as a starting point for defect classification. Dramatically reduces data requirements (from 10K+ images to 500+) and training time. Two-phase approach: freeze backbone, then fine-tune upper layers.

🔄

#### Active Learning

Continuous improvement loop where model uncertainty drives new labeling requests. Uses prediction entropy to identify images the model is unsure about. Routes uncertain images to human reviewers via Pub/Sub. Retraining triggered by volume, drift, or performance thresholds.

## 10. Results & Impact

### Performance Metrics

After deploying the custom EfficientNet model with active learning, the system achieved the following production metrics over a 6-month evaluation period:

| Metric | Before (Manual) | After (ML) | Improvement |
| --- | --- | --- | --- |
| **Defect detection rate** | 80% | 97.2% | +21.5% |
| **False escapes** | 20% of defects | 2.8% of defects | 85% reduction |
| **Inspection time per part** | 2–4 seconds | <200ms | 10–20x faster |
| **Throughput** | 15–30 parts/min | 60+ parts/min | 60% increase |
| **Annual cost savings** | Baseline | $3.2M saved | From reduced returns/recalls |

### Per-Defect-Type Accuracy

| Defect Type | Precision | Recall | F1 Score |
| --- | --- | --- | --- |
| **Scratch** | 96% | 95% | 95.5% |
| **Crack** | 98% | 97% | 97.5% |
| **Dent** | 95% | 94% | 94.5% |
| **Discoloration** | 94% | 93% | 93.5% |
| **Misalignment** | 97% | 96% | 96.5% |

>**ROI Calculation:** The $3.2M annual savings comes from: **reduced warranty claims** ($1.8M), **fewer production stoppages** from downstream defect discovery ($0.8M), **reduced manual inspection labor** ($0.4M), and **increased throughput revenue** ($0.2M). Initial deployment cost was $180K (cameras, Edge TPUs, integration), yielding an **ROI of 17.8x in year one**.

## 11. Production Considerations

### Edge vs Cloud Inference Trade-offs

The decision between edge and cloud inference depends on your **latency requirements**, **network reliability**, and **model complexity**. Most production deployments use a hybrid approach:

-   **Edge (Edge TPU):** Binary pass/fail decision at line speed. Lightweight quantized model. Works offline.
-   **Cloud (Vertex AI):** Detailed defect classification, severity scoring, root cause analysis. Larger model, richer features.
-   **Hybrid:** Edge makes immediate pass/fail. Flagged images sent to cloud for detailed analysis. Cloud results feed back into edge model retraining.

### Handling New Defect Types

When a new defect type appears (e.g., a new supplier introduces a material with different failure modes), you cannot wait for hundreds of labeled examples to retrain. **Few-shot learning** techniques like Prototypical Networks or Siamese Networks can detect new defect types with as few as 5–10 examples. On GCP, this means:

```
# Few-shot approach: Siamese network for novel defect detection
# 1. Extract embeddings from the penultimate layer of trained model
embedding_model = tf.keras.Model(
    inputs=model.input,
    outputs=model.layers[-3].output  # 256-dim embedding
)

# 2. Compute mean embedding for new defect type (5-10 examples)
new_defect_embeddings = embedding_model.predict(new_defect_images)
prototype = tf.reduce_mean(new_defect_embeddings, axis=0)

# 3. At inference, compare new image embedding to prototype
def detect_novel_defect(image, prototype, threshold=0.7):
    embedding = embedding_model.predict(image[tf.newaxis, ...])
    similarity = tf.keras.losses.cosine_similarity(embedding, prototype)
    return float(similarity) > threshold
```

### Camera Calibration & Lighting Consistency

The single largest source of model performance degradation in production is **lighting variation**. Bulbs age and dim. Ambient lighting changes with time of day. New cameras have different exposure characteristics. Mitigate this with:

-   **Reference targets:** Place calibration targets in camera FOV. Compare periodically.
-   **LED ring lighting:** Consistent, controllable illumination. Diffused to minimize specular reflection.
-   **White balance correction:** Auto-calibrate using reference patches before each shift.
-   **Exposure locking:** Fixed exposure prevents camera auto-adjustments that shift the input distribution.

### Integration with PLC/SCADA Systems

Manufacturing lines are controlled by **Programmable Logic Controllers (PLCs)** and monitored by **SCADA** systems. The defect detection system must integrate with these industrial control systems to trigger physical actions (diverter gates, stop signals, marking systems). This typically requires an **OPC-UA** gateway or **MQTT bridge** between the ML system and the PLC network.

### Model Size Constraints for Edge Devices

The Coral Edge TPU supports models up to **8MB** after compilation. EfficientNetB0 at int8 quantization is approximately 5.3MB — well within limits. Larger models (EfficientNetB3+, ResNet-50) exceed this and require either aggressive pruning or splitting between edge and cloud. MobileNetV2 at int8 is only 3.4MB, making it the best choice for resource-constrained edge deployments.

### Handling Production Line Speed Changes

Production lines do not run at constant speed. Startups, slowdowns, and emergency stops cause frame rate variation. The image capture system must handle **variable trigger rates** and **motion blur** at high speeds. Solutions include:

-   **Hardware triggering:** Encoder-driven camera triggers synchronized to conveyor speed
-   **Short exposure:** <1ms exposure time to freeze motion at max line speed
-   **Strobe lighting:** High-intensity flash synchronized to camera trigger, eliminates ambient light
-   **Deblurring preprocessing:** Wiener deconvolution for images captured during acceleration/deceleration

## 12. GCP MLE Exam Tips

Manufacturing defect detection is a common exam scenario because it tests several key concepts simultaneously: computer vision, transfer learning, edge deployment, active learning, and MLOps best practices.

>**High-Frequency Exam Topics:** These patterns appear repeatedly in exam questions about manufacturing ML:

### Key Decision Patterns

| Scenario | Correct GCP Service | Why |
| --- | --- | --- |
| "Team has no ML expertise" | AutoML Vision | No-code, automated model building |
| "Need custom loss function" | Vertex AI Custom Training | Full code control required |
| "Real-time at the edge" | Edge TPU + TF Lite | Sub-20ms latency, offline capable |
| "Model accuracy dropping over time" | Vertex AI Model Monitoring + retraining | Detect and respond to drift |
| "Imbalanced dataset (99% normal)" | Focal loss + oversampling + class weights | Standard CE fails on imbalanced data |
| "Need to inspect every part" | Edge inference (not sampling) | 100% inspection requires edge speed |
| "New defect type with few examples" | Few-shot learning / Siamese networks | Cannot wait for large labeled dataset |

### Common Exam Traps

-   **Trap:** Using accuracy as the primary metric for imbalanced defect data. **Correct:** Use per-class precision/recall.
-   **Trap:** Deploying a float32 model to Edge TPU. **Correct:** Edge TPU requires int8 quantization.
-   **Trap:** Retraining on all data whenever new labels arrive. **Correct:** Use triggered retraining with validation gates.
-   **Trap:** Applying heavy color augmentation when discoloration is a defect type. **Correct:** Augmentation must preserve defect signals.
-   **Trap:** Using cloud inference for real-time line rejection. **Correct:** Edge inference for latency-critical decisions.

>**Study Recommendation:** Run the companion Colab notebook to build hands-on intuition. The notebook generates synthetic defect images, trains a MobileNetV2 classifier with transfer learning, evaluates per-class metrics, and visualizes predictions — all skills that map directly to exam questions about computer vision pipelines on GCP.

## 🛠️. Build Your Portfolio

### Fork & Extend

Turn this notebook into a portfolio project in 5 steps:

1.  **Fork the notebook** — Clone the repo and open in Google Colab or locally.
2.  **Swap in real data** — Replace the synthetic dataset with the **MVTec Anomaly Detection (MVTec AD)** dataset, which contains 5,354 high-resolution images across 15 object and texture categories with pixel-level defect annotations. Download it at [mvtec.com/company/research/datasets/mvtec-ad](https://www.mvtec.com/company/research/datasets/mvtec-ad).
3.  **Add defect localization** — Go beyond classification by implementing Grad-CAM or segmentation-based localization that draws bounding boxes or heatmaps around the exact defect region. This shows inspectors *where* the defect is, not just *that* it exists.
4.  **Deploy it** — Wrap it in a Gradio app with an image upload zone, a pass/fail verdict with confidence score, a Grad-CAM heatmap overlay highlighting the defect region, and a defect-type classification label.
5.  **Write a README** — Include architecture diagram, setup instructions, sample outputs, and metrics.

### What Hiring Managers Look For

>**Pro Tip:** Computer vision portfolios stand out when they demonstrate awareness of **production deployment constraints**. Include inference latency benchmarks (ms per image) and model size comparisons (MobileNetV2 vs. EfficientNet vs. ResNet50) showing the accuracy-latency trade-off. Show per-class precision and recall broken down by defect type, and explain why high recall matters more than high precision in safety-critical manufacturing (a missed crack is far more costly than a false alarm). Bonus points for demonstrating TFLite or ONNX model conversion for edge deployment.

### Public Datasets to Use

-   **MVTec Anomaly Detection (MVTec AD)** — 5,354 images across 15 categories (carpet, grid, leather, metal nut, etc.) with pixel-precise defect masks. Available at mvtec.com. The industry-standard benchmark for unsupervised anomaly detection and defect segmentation.
-   **NEU Surface Defect Database** — 1,800 grayscale images of hot-rolled steel strips with six defect types (crazing, inclusion, patches, pitting, rolled-in scale, scratches). Available from Northeastern University. Excellent for multi-class defect classification on real metal surfaces.
-   **Severstal Steel Defect Detection** — 12,568 steel sheet images with pixel-level defect segmentation masks across four defect classes. Available on Kaggle. Great for segmentation-based defect detection with real industrial imagery and class imbalance.

### Deployment Options

| Platform | Best For | Effort |
| --- | --- | --- |
| Streamlit | Inspection dashboard with image upload, defect heatmap overlay, and historical defect rate charts | Low |
| Gradio | Drag-and-drop defect classifier with real-time Grad-CAM visualization and confidence scores | Low |
| FastAPI | Image scoring API accepting base64-encoded images and returning defect class, confidence, and bounding boxes | Medium |
| Docker + Cloud Run | Production inspection microservice with GPU inference, batch processing, and integration with MES systems | High |

Previous Use Case

[← 03 · Churn Prediction](03-churn-prediction.html)

Next Use Case

[05 · Recommendations →](05-recommendation-engine.html)