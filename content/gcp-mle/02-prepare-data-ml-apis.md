---
title: "Data Preparation and Pre-trained ML APIs"
slug: "prepare-data-ml-apis"
description: "Data is the fuel for machine learning. This course covers the GCP data preparation ecosystem — Dataflow, Dataprep, Dataproc —
    and takes a deep dive into Google's pre-trained ML APIs for vision, language, speech, translation, and video intelligence.
    Learn when to use each tool and how to call"
section: "gcp-mle"
order: 2
badges:
  - "Dataflow (Apache Beam)"
  - "Dataprep & Dataproc"
  - "Vision & NLP APIs"
  - "Speech & Translation"
  - "Video Intelligence"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/02-prepare-data-ml-apis.ipynb"
---

## 01. Data Preparation Pipeline on GCP

### Why Data Preparation Matters

Data scientists spend **60-80% of their time on data preparation**. The quality of your ML model is bounded by the quality of your data. Garbage in, garbage out.

On GCP, data preparation is not a single tool but a **pipeline** of services working together. Choosing the right tool for each stage is critical for cost, performance, and maintainability.

### Pipeline Stages

![Diagram 1](/diagrams/gcp-mle/prepare-data-ml-apis-1.svg)

GCP data preparation pipeline: ingest, transform, engineer features, produce ML-ready datasets

>**Key Principle:** The exam tests your ability to **choose the right data tool for the scenario**. The three main contenders are Dataflow, Dataprep, and Dataproc. Each has a distinct sweet spot — understanding the boundaries is more important than memorizing syntax.

## 02. Dataflow (Apache Beam)

**Cloud Dataflow** is Google Cloud's fully managed, serverless service for running **Apache Beam** pipelines. It handles both **batch** and **streaming** data processing with the same programming model.

### Core Pipeline Concepts

| Concept | Description | Example |
| --- | --- | --- |
| **Pipeline** | The entire data processing workflow, defined as a DAG of transforms | `pipeline = beam.Pipeline()` |
| **PCollection** | An immutable, distributed dataset. The input and output of every transform. | Lines of text, rows of data, images |
| **Transform (PTransform)** | An operation on a PCollection. Applied with the `|` (pipe) operator. | `Map`, `Filter`, `GroupByKey`, `ParDo` |
| **Source & Sink** | Where data enters and leaves the pipeline | Read from GCS/BigQuery, write to BigQuery/GCS/Pub/Sub |
| **Window** | Groups streaming data into finite chunks by time | Fixed windows (every 5 min), sliding windows, session windows |
| **Watermark** | Tracks event-time progress to handle late-arriving data | Allows processing even when some events arrive out of order |

### Apache Beam Pipeline Example

```
# Apache Beam pipeline — runs on Dataflow (or locally for testing)
import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions

# Define pipeline options
options = PipelineOptions([
    '--runner=DataflowRunner',        # Use 'DirectRunner' for local testing
    '--project=my-gcp-project',
    '--region=us-central1',
    '--temp_location=gs://my-bucket/temp',
    '--staging_location=gs://my-bucket/staging',
])

# Build the pipeline
with beam.Pipeline(options=options) as p:
    (
        p
        | 'ReadFromBQ' >> beam.io.ReadFromBigQuery(
            query='SELECT * FROM `project.dataset.table`',
            use_standard_sql=True,
        )
        | 'FilterValid' >> beam.Filter(lambda row: row['amount'] > 0)
        | 'TransformData' >> beam.Map(
            lambda row: {
                'customer_id': row['customer_id'],
                'amount_normalized': row['amount'] / 1000.0,
                'category': row['category'].lower(),
            }
        )
        | 'WriteToBQ' >> beam.io.WriteToBigQuery(
            'project:dataset.output_table',
            schema='customer_id:STRING,amount_normalized:FLOAT,category:STRING',
            write_disposition=beam.io.BigQueryDisposition.WRITE_TRUNCATE,
        )
    )
```

```
# Streaming pipeline — process events from Pub/Sub in real time
with beam.Pipeline(options=options) as p:
    (
        p
        | 'ReadPubSub' >> beam.io.ReadFromPubSub(
            topic='projects/my-project/topics/events',
        )
        | 'ParseJSON' >> beam.Map(json.loads)
        | 'Window5Min' >> beam.WindowInto(
            beam.window.FixedWindows(300)  # 5-minute windows
        )
        | 'GroupByUser' >> beam.GroupByKey()
        | 'Aggregate' >> beam.Map(compute_user_stats)
        | 'WriteBQ' >> beam.io.WriteToBigQuery(...)
    )
```

>**Key Advantage:** Dataflow's killer feature is **unified batch and streaming**. The same Apache Beam code runs as batch (bounded PCollection from GCS/BQ) or streaming (unbounded PCollection from Pub/Sub). No need to maintain two separate pipelines.
>**Exam Alert:** When the question mentions **"serverless"** data processing or **"both batch and streaming"**, the answer is almost always **Dataflow**. Dataflow is also the default answer for **ETL/ELT pipelines** unless there is a specific reason to use Spark (existing Spark code, Spark MLlib).

## 03. Dataprep by Trifacta

**Cloud Dataprep** is a visual, no-code data wrangling tool built by Trifacta (now part of Alteryx). It provides an interactive web UI for exploring, cleaning, and transforming data without writing code.

### When to Use Dataprep

-   **Visual data exploration** — Dataprep shows data distributions, anomalies, and patterns automatically
-   **Non-technical users** — Business analysts and data stewards who do not write Python or SQL
-   **One-off data cleaning** — Ad-hoc data preparation tasks, not recurring production pipelines
-   **Data profiling** — Quickly understand data quality (nulls, outliers, distributions)
-   **Recipe-based transforms** — Build a sequence of transformation "recipes" that can be saved and reused

**Under the hood**, Dataprep generates and executes Dataflow jobs. So it is essentially a visual front-end for Dataflow with AI-assisted suggestions for transforms.

>**Limitation:** Dataprep is **not suitable for production streaming pipelines**. It is designed for interactive, ad-hoc data wrangling. For production ETL, use Dataflow directly (code-based). Dataprep also has row count limitations on the visual preview (though the actual execution via Dataflow can handle large datasets).

## 04. Dataproc (Managed Spark/Hadoop)

**Cloud Dataproc** is Google Cloud's managed service for running **Apache Spark**, **Hadoop**, **Flink**, and **Presto** clusters. It provisions clusters in 90 seconds and integrates with GCS, BigQuery, and other GCP services.

### When to Use Dataproc

-   **Existing Spark/Hadoop code** — Lift-and-shift from on-premises Hadoop clusters
-   **Spark MLlib** — Distributed ML training using Spark's ML library
-   **Complex graph processing** — GraphX, Spark GraphFrames
-   **PySpark/Scala Spark jobs** — Teams that already know Spark
-   **Ephemeral clusters** — Spin up a cluster for a job, shut it down when done (cost-effective)

```
# Create a Dataproc cluster via gcloud CLI
gcloud dataproc clusters create my-spark-cluster \
  --region=us-central1 \
  --master-machine-type=n1-standard-4 \
  --worker-machine-type=n1-standard-4 \
  --num-workers=2 \
  --image-version="2.1-debian11" \
  --enable-component-gateway \
  --optional-components=JUPYTER

# Submit a PySpark job
gcloud dataproc jobs submit pyspark \
  gs://my-bucket/scripts/etl_job.py \
  --cluster=my-spark-cluster \
  --region=us-central1 \
  -- --input=gs://my-bucket/raw/ --output=gs://my-bucket/processed/

# Delete cluster when done (ephemeral pattern)
gcloud dataproc clusters delete my-spark-cluster \
  --region=us-central1 --quiet
```

>**Ephemeral Clusters:** The **ephemeral cluster pattern** is a best practice for Dataproc: create a cluster, run the job, delete the cluster. Use **Dataproc Workflow Templates** or **Dataproc Serverless** (Spark Batch) to automate this. You only pay while the cluster is running.
>**Exam Alert:** If the question mentions **"existing Spark code"**, **"Hadoop migration"**, or **"Spark MLlib"**, the answer is **Dataproc**. If it mentions **"serverless"** with no existing Spark/Hadoop, the answer is **Dataflow**.

## 05. Decision Guide: Dataflow vs Dataprep vs Dataproc

### Comparison Table

| Criteria | Dataflow | Dataprep | Dataproc |
| --- | --- | --- | --- |
| **Engine** | Apache Beam | Dataflow (under the hood) | Apache Spark / Hadoop |
| **Management** | Fully serverless | Fully serverless (visual UI) | Managed clusters (or serverless Spark) |
| **Batch** | Yes | Yes | Yes |
| **Streaming** | Yes (unified model) | No | Yes (Spark Structured Streaming) |
| **Coding Required** | Yes (Python/Java) | No (visual UI) | Yes (Python/Scala/Java) |
| **Best For** | New ETL pipelines, streaming, GCP-native | Ad-hoc data wrangling, exploration | Existing Spark/Hadoop, Spark MLlib |
| **Scaling** | Auto-scales workers | Auto-scales (via Dataflow) | Manual or autoscaling clusters |
| **Cost Model** | Per vCPU-hour + GB-hour | Dataflow cost + Trifacta fee | Per cluster VM-hour |

![Diagram 2](/diagrams/gcp-mle/prepare-data-ml-apis-2.svg)

Quick decision guide for GCP data processing tools

>**Exam Decision Rule:** **Default: Dataflow.** Override to Dataproc only if there is existing Spark/Hadoop code or Spark MLlib is needed. Override to Dataprep only if the user is non-technical and the task is ad-hoc exploration. For in-warehouse transforms on structured data already in BigQuery, use BigQuery SQL.

## 06. Pre-trained ML APIs Deep Dive

Google Cloud offers pre-trained ML APIs that require **zero training data and zero ML expertise**. Send data via REST or client library, get structured predictions back. These are the **fastest path to adding ML to an application**.

### Cloud Vision API

🏷

#### Label Detection

Identifies objects, locations, activities, animal species, and products in an image. Returns labels with confidence scores.

📄

#### OCR (Text Detection)

`TEXT_DETECTION` for sparse text (signs, menus). `DOCUMENT_TEXT_DETECTION` for dense documents (pages, articles). Returns text with bounding boxes.

🙂

#### Face Detection

Detects faces with landmarks (eyes, nose, mouth). Returns joy, sorrow, anger, surprise likelihoods. Does NOT identify individuals (no face recognition).

🛡

#### Safe Search

Detects explicit content: adult, violence, racy, spoof, medical. Returns likelihood levels (VERY\_UNLIKELY to VERY\_LIKELY). Essential for user-generated content moderation.

🏛

#### Landmark Detection

Identifies famous landmarks (Eiffel Tower, Taj Mahal). Returns name, confidence, geographic coordinates (latitude/longitude).

🎨

#### Logo Detection

Identifies logos of well-known companies and brands. Returns logo name, confidence score, and bounding polygon.

```
# Cloud Vision API — Label Detection (Python)
from google.cloud import vision

client = vision.ImageAnnotatorClient()

# From a GCS URI
image = vision.Image(source=vision.ImageSource(
    image_uri="gs://my-bucket/photo.jpg"
))

# Or from a URL
image = vision.Image(source=vision.ImageSource(
    image_uri="https://example.com/photo.jpg"
))

response = client.label_detection(image=image, max_results=10)

for label in response.label_annotations:
    print(f"{label.description}: {label.score:.2%}")
```

### Cloud Natural Language API

| Feature | What It Returns | Use Case |
| --- | --- | --- |
| **Sentiment Analysis** | Score (-1 to +1) and magnitude (0 to ∞) for document and each sentence | Product review analysis, social media monitoring, customer feedback |
| **Entity Analysis** | Named entities (PERSON, LOCATION, ORGANIZATION, EVENT, etc.) with salience scores | Information extraction, knowledge graph building, content tagging |
| **Syntax Analysis** | Part-of-speech tags, dependency parse tree, lemmatization | Grammar analysis, text preprocessing, linguistic research |
| **Content Classification** | Categories from a taxonomy of 700+ categories (e.g., "/Arts & Entertainment/Music") | Content organization, ad targeting, content filtering |
| **Entity Sentiment** | Sentiment for each entity mentioned in the text | Brand monitoring ("iPhone is great but MacBook is overpriced") |

```
# Cloud NLP API — Sentiment + Entity Analysis
from google.cloud import language_v1

client = language_v1.LanguageServiceClient()
document = language_v1.Document(
    content="Google Cloud's Vertex AI is an excellent ML platform.",
    type_=language_v1.Document.Type.PLAIN_TEXT,
)

# Sentiment
sentiment = client.analyze_sentiment(document=document).document_sentiment
print(f"Sentiment: score={sentiment.score:.2f}, magnitude={sentiment.magnitude:.2f}")

# Entities
entities = client.analyze_entities(document=document).entities
for entity in entities:
    print(f"  {entity.name}: {entity.type_.name} (salience={entity.salience:.2f})")
```

### Cloud Speech-to-Text

Converts audio to text using Google's speech recognition models. Supports **120+ languages**, **streaming recognition** (real-time), and **batch transcription** (long audio files).

-   **Synchronous** — Audio up to 1 minute, immediate response
-   **Asynchronous** — Audio up to 480 minutes, results via polling or callback
-   **Streaming** — Real-time transcription as audio flows in

| Feature | Description |
| --- | --- |
| **Speaker Diarization** | Identifies different speakers in the audio ("Speaker 1", "Speaker 2") |
| **Automatic Punctuation** | Adds periods, commas, question marks to transcription |
| **Word Timestamps** | Returns start and end time for each word |
| **Speech Adaptation** | Boost recognition of specific words/phrases (industry jargon, product names) |
| **Multi-channel** | Transcribe separate audio channels independently (e.g., caller vs agent) |

```
# Cloud Speech-to-Text — Transcribe audio from GCS
from google.cloud import speech

client = speech.SpeechClient()

audio = speech.RecognitionAudio(
    uri="gs://my-bucket/audio-sample.wav"
)
config = speech.RecognitionConfig(
    encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
    sample_rate_hertz=16000,
    language_code="en-US",
    enable_automatic_punctuation=True,
    enable_word_time_offsets=True,
    diarization_config=speech.SpeakerDiarizationConfig(
        enable_speaker_diarization=True,
        min_speaker_count=2,
        max_speaker_count=4,
    ),
)

# For audio > 1 min, use long_running_recognize
operation = client.long_running_recognize(config=config, audio=audio)
response = operation.result(timeout=300)

for result in response.results:
    print(f"Transcript: {result.alternatives[0].transcript}")
    print(f"Confidence: {result.alternatives[0].confidence:.2%}")
```

### Cloud Translation API

Two tiers of translation service:

| Feature | Basic (v2) | Advanced (v3) |
| --- | --- | --- |
| **Model** | Google NMT | Google NMT + AutoML Translation |
| **Custom Glossary** | No | Yes — domain-specific term mapping |
| **Custom Model** | No | Yes — train on your parallel corpus |
| **Batch Translation** | No | Yes — translate entire documents/files |
| **Languages** | 100+ | 100+ |
| **Use Case** | Simple translations, language detection | Enterprise, glossaries, domain-specific |

```
# Cloud Translation API v3 (Advanced)
from google.cloud import translate_v2 as translate

client = translate.Client()

# Detect language
detection = client.detect_language("こんにちは世界")
print(f"Detected: {detection['language']} ({detection['confidence']:.0%})")

# Translate
result = client.translate(
    "Machine learning is transforming industries.",
    target_language="es",  # Spanish
)
print(f"Translation: {result['translatedText']}")
```

### Video Intelligence API

Analyzes video content stored in **Cloud Storage**. Processes entire videos and returns time-stamped annotations.

🏷

#### Label Detection

Identifies objects, actions, and concepts throughout the video with timestamps. Segment-level and shot-level labels.

🎦

#### Shot Change Detection

Detects scene transitions (cuts, fades, dissolves). Returns start/end timestamps for each shot. Essential for video editing workflows.

🚫

#### Explicit Content Detection

Frame-by-frame analysis for adult/violent content. Returns likelihood per frame. Required for platforms with user-uploaded video.

🔎

#### Object Tracking

Tracks objects across frames with bounding boxes. Identifies and follows specific objects through the video timeline.

📝

#### Text Detection in Video

OCR on video frames. Detects and extracts text visible in the video (signs, captions, overlays) with timestamps.

🗣

#### Speech Transcription

Transcribes speech in video to text. Same engine as Speech-to-Text but integrated into the video analysis pipeline.

```
# Video Intelligence API — Label Detection
from google.cloud import videointelligence

client = videointelligence.VideoIntelligenceServiceClient()

features = [videointelligence.Feature.LABEL_DETECTION]

operation = client.annotate_video(
    request={
        "input_uri": "gs://my-bucket/video.mp4",
        "features": features,
    }
)
result = operation.result(timeout=300)

for label in result.annotation_results[0].segment_label_annotations:
    print(f"Label: {label.entity.description}")
    for segment in label.segments:
        start = segment.segment.start_time_offset.seconds
        end = segment.segment.end_time_offset.seconds
        conf = segment.confidence
        print(f"  {start}s - {end}s (confidence: {conf:.2%})")
```

>**Exam Alert: Choosing the Right API:** **"Analyze sentiment of customer reviews"** → Cloud NLP API (sentiment analysis).  
> **"Extract text from a scanned PDF"** → Cloud Vision API (DOCUMENT\_TEXT\_DETECTION) or Document AI.  
> **"Transcribe a meeting recording"** → Cloud Speech-to-Text (async, with diarization).  
> **"Detect inappropriate content in user-uploaded videos"** → Video Intelligence API (explicit content detection).  
> **"Translate product descriptions to multiple languages"** → Cloud Translation API (Advanced if glossary needed).

## 07. API Authentication and Quotas

### Authentication Methods

| Method | When to Use | How |
| --- | --- | --- |
| **API Key** | Simple API calls, client-side apps | Pass key as query parameter or header. **Least secure** — no identity, only project-level access. |
| **Service Account** | Server-to-server, production workloads | JSON key file or Workload Identity. IAM roles control access. **Recommended for production**. |
| **OAuth 2.0** | User-facing apps, accessing user data | User consent flow. Access token + refresh token. Scoped permissions. |
| **Application Default Credentials (ADC)** | Development, Compute Engine, GKE | `gcloud auth application-default login` or automatic on GCE/GKE. Client libraries use ADC automatically. |

```
# Set ADC for local development
gcloud auth application-default login

# Set service account for production
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

# Enable an API
gcloud services enable vision.googleapis.com
gcloud services enable language.googleapis.com
gcloud services enable speech.googleapis.com
gcloud services enable translate.googleapis.com
gcloud services enable videointelligence.googleapis.com
```

>**Quota Management:** Every API has **rate limits** (requests per minute) and **usage quotas** (requests per day/month). Default quotas are generous for development but may need to be increased for production. Check quotas at: `Console > IAM & Admin > Quotas`. You can request quota increases through the console.
>**Exam Alert:** The exam may test authentication best practices. Key points: **never embed API keys in code**, use **service accounts with least-privilege IAM roles** for production, and use **ADC** for development. When running on GCE/GKE, prefer **Workload Identity** over key files.

## 08. Exam Tips — Scenario-Based Guidance

### Common Exam Scenarios

>**Scenario 1: Data Pipeline Tool Selection:** **"A company needs to build a real-time data pipeline that reads from Pub/Sub, transforms events, and writes to BigQuery..."**  
> Answer: **Dataflow**. Serverless, supports streaming from Pub/Sub, unified batch/streaming model. This is the textbook Dataflow use case.
>**Scenario 2: Migration from On-Premises:** **"A company has existing PySpark ETL jobs running on an on-premises Hadoop cluster..."**  
> Answer: **Dataproc**. Lift-and-shift existing Spark jobs with minimal code changes. Use ephemeral clusters for cost efficiency.
>**Scenario 3: Non-Technical Data Wrangling:** **"A business analyst needs to clean and prepare a CSV dataset for a one-time analysis..."**  
> Answer: **Dataprep**. Visual UI, no coding required, AI-assisted suggestions. Perfect for non-technical, ad-hoc tasks.
>**Scenario 4: Choosing the Right API:** **"A media company needs to automatically tag uploaded images with content categories..."**  
> Answer: **Cloud Vision API (label detection)**. No training data needed, immediate results. If they need custom labels specific to their domain, upgrade to **AutoML Image**.
>**Scenario 5: Multi-API Pipeline:** **"A call center wants to transcribe calls, analyze sentiment, and extract key entities..."**  
> Answer: Pipeline of **Speech-to-Text** (transcription with diarization) → **Cloud NLP API** (sentiment analysis + entity extraction). These APIs compose naturally in a data pipeline.
>**Scenario 6: Video Content Moderation:** **"A social media platform needs to detect and flag inappropriate video content before publishing..."**  
> Answer: **Video Intelligence API** with explicit content detection. Process uploaded videos asynchronously, flag those exceeding the threshold, and queue for human review.
>**General Exam Strategy for This Course:** **Two key decision frameworks:**  
> (1) **Data tool selection**: Default to Dataflow unless there is a reason for Dataproc (existing Spark) or Dataprep (non-technical, ad-hoc).  
> (2) **API selection**: Match the data type (image, text, audio, video) to the corresponding API. If the pre-trained API's general model is insufficient, escalate to AutoML for a custom model.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Google Cloud’s pre-trained ML APIs—Vision, Natural Language, Translation, Speech-to-Text, and Video Intelligence—let you add production-grade AI to applications with a single REST call, no training data or ML expertise required. For data preparation at scale, GCP offers three complementary tools: **Dataflow** (serverless Apache Beam for streaming and batch ETL), **Dataprep** (visual, no-code wrangling by Trifacta), and **Dataproc** (managed Spark/Hadoop for lift-and-shift workloads). The interview-ready insight is knowing *when* to use each: Dataflow for green-field pipelines needing autoscaling, Dataprep for quick exploratory cleaning, Dataproc when you have existing Spark code, and pre-trained APIs when the task is a solved problem (OCR, sentiment, translation) with no domain-specific labels.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| When would you use pre-trained APIs versus training your own model? | Can you identify when a generic model is sufficient vs. when domain-specific data justifies custom training? |
| Compare Dataflow, Dataprep, and Dataproc for data preparation. | Do you understand the trade-offs between serverless beam, visual wrangling, and managed Spark? |
| How would you handle data cleaning for an ML pipeline at scale on GCP? | Can you design a pipeline that handles missing values, normalization, and feature encoding in a distributed way? |
| What is the Vision API capable of, and what are its limitations? | Do you know the boundary between API capabilities (label detection, OCR, face detection) and custom Vision needs? |
| How do you authenticate and manage quotas for GCP ML APIs in production? | Do you understand service accounts, API keys, OAuth scopes, and rate-limit handling for production workloads? |

### Model Answers

**Pre-trained vs Custom:** I default to pre-trained APIs when the task matches a general category—sentiment analysis on product reviews, OCR on scanned documents, or translating support tickets. The APIs are continuously improved by Google, require zero training data, and scale instantly. I switch to custom training (AutoML Vision, AutoML Natural Language, or Vertex AI custom) when accuracy on domain-specific classes is critical—for example, classifying medical images where generic labels are insufficient, or detecting industry-specific entities in legal text that the NL API doesn’t recognize.

**Dataflow vs Dataproc vs Dataprep:** Dataflow is my first choice for new pipelines because it’s fully serverless, autoscales to zero, handles both batch and streaming with the same Apache Beam code, and integrates natively with BigQuery and Pub/Sub. Dataproc is the right choice when the team has existing PySpark or Hadoop jobs they want to run on GCP with minimal refactoring—it provisions a cluster in 90 seconds and supports preemptible VMs. Dataprep is ideal for data analysts doing exploratory data quality checks before building a formal pipeline.

**Production API Architecture:** In production, I use service accounts (not API keys) with least-privilege IAM roles, enable the specific APIs in the project, and configure exponential backoff for 429 (quota exceeded) responses. I set up Cloud Monitoring alerts on API usage metrics, use VPC Service Controls to prevent data exfiltration, and batch requests where possible (e.g., Vision API batch annotation) to stay within rate limits and reduce cost.

### System Design Scenario

>**Design Prompt:** **Scenario:** A global e-commerce company receives customer reviews in 15 languages. They want to extract sentiment, detect offensive content, translate all reviews to English, and store structured results for analytics. Design the data pipeline on GCP.
> 
> **Approach:** Reviews land in Pub/Sub from the application backend. A Dataflow streaming pipeline consumes messages, calls the Translation API to normalize text to English, then calls the Natural Language API for sentiment and content classification in parallel. Results are written to BigQuery with columns for original\_language, translated\_text, sentiment\_score, and content\_categories. A separate Dataflow branch calls the Vision API on any attached review images for label detection and SafeSearch. Cloud DLP scans for PII before storage. Monitoring dashboards in Looker visualize sentiment trends by product and region. The pipeline autoscales with Dataflow and requires no cluster management.

### Common Mistakes

-   **Using Dataproc for everything** — Many candidates default to Spark because it’s familiar, but Dataflow is preferred on GCP for new pipelines because it’s serverless and handles streaming natively. Only recommend Dataproc when there’s existing Hadoop/Spark code to migrate.
-   **Forgetting API limitations** — Pre-trained APIs have file size limits, rate quotas, and language support boundaries. Failing to mention these constraints in a design answer signals you haven’t used them in production.
-   **Skipping data quality in the pipeline** — Jumping straight from raw data to model training without addressing missing values, duplicates, encoding issues, and label quality is a red flag. Always describe the data validation and cleaning steps explicitly.

Previous Course

[01 · Intro to AI & ML on GCP](01-intro-ai-ml-gcp.html)

Next Course

[03 · Big Data & ML Fundamentals](03-big-data-ml-fundamentals.html)

Big Data & ML on GCP