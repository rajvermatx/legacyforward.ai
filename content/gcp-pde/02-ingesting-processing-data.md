---
title: "Ingesting and Processing Data"
slug: "ingesting-processing-data"
description: "Covers roughly 25% of the exam — the largest section. Plan and build data pipelines,
    understand batch vs streaming processing, windowing, late data handling, and deploy production
    pipelines with Cloud Composer and CI/CD."
section: "gcp-pde"
order: 2
badges:
  - "Pipeline Planning"
  - "Dataflow & Beam"
  - "Batch vs Streaming"
  - "Windowing & Late Data"
  - "Cloud Composer"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-pde/02-ingesting-processing-data.ipynb"
---

## 01. Pipeline Planning

### Sources and Sinks

Every data pipeline has **sources** (where data comes from) and **sinks** (where it goes). For the exam, know which GCP services serve as common sources and sinks:

| Source Type | GCP Services | External Sources |
| --- | --- | --- |
| **Streaming** | Pub/Sub, Bigtable change streams, Datastream CDC | Kafka (Confluent), IoT devices, webhooks |
| **Batch files** | Cloud Storage (CSV, JSON, Avro, Parquet, ORC) | S3, SFTP, on-prem file systems |
| **Databases** | Cloud SQL, Spanner, AlloyDB, Firestore | Oracle, SQL Server, MySQL, PostgreSQL |
| **SaaS/APIs** | BigQuery Data Transfer Service connectors | Google Ads, Salesforce, SAP |

### Encryption in Transit and at Rest

All data moving between GCP services is encrypted in transit by default using TLS. For data flowing between on-premises and GCP, use **Cloud VPN** or **Cloud Interconnect** for encrypted private connectivity.

>**Best Practice:** Use **Private Google Access** to let VMs without external IPs access GCP APIs. For Dataflow workers, enable `--usePublicIps=false` to keep all data flow on Google's internal network.

## 02. Apache Beam and Dataflow

### The Beam Programming Model

Apache Beam provides a **unified model** for both batch and streaming. The key abstractions are:

#### Pipeline

The container for the entire data processing workflow. You create a Pipeline, add transforms, and run it on a runner (Dataflow, Spark, Flink, Direct).

#### PCollection

An immutable, distributed dataset. Can be bounded (batch) or unbounded (streaming). Elements can be any serializable type.

#### PTransform

An operation that takes one or more PCollections as input and produces one or more PCollections as output. ParDo, GroupByKey, CoGroupByKey, Flatten, Partition.

#### Runner

Executes the pipeline. DataflowRunner (GCP), SparkRunner, FlinkRunner, DirectRunner (local testing). The pipeline code is runner-agnostic.

### Core Transforms

| Transform | Description | Use Case |
| --- | --- | --- |
| **ParDo** | Generic parallel processing. Apply a DoFn to each element. | Filtering, parsing, enrichment, any element-wise operation |
| **GroupByKey** | Group values by key (like SQL GROUP BY). Requires KV pairs. | Aggregation, sessionization, per-user stats |
| **CoGroupByKey** | Join multiple PCollections by key (like SQL JOIN). | Enriching stream with lookup data, multi-source joins |
| **Combine** | Reduce elements: globally, per-key, or per-window. | Sum, average, count, top-N |
| **Flatten** | Merge multiple PCollections into one. | Union of multiple data sources |
| **Partition** | Split a PCollection into multiple outputs by a function. | Routing: valid records vs errors, region-based splits |
| **Side Inputs** | Additional read-only data available to a ParDo. | Lookup tables, configuration, ML model parameters |

### Complete Pipeline Example

```
import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions

class ParseEvent(beam.DoFn):
    """Parse JSON event and add derived fields."""
    def process(self, element):
        import json
        record = json.loads(element)
        record['event_hour'] = record['timestamp'][:13]
        yield record

class FilterValid(beam.DoFn):
    """Filter out invalid records."""
    def process(self, element):
        if element.get('user_id') and element.get('amount', 0) >= 0:
            yield beam.pvalue.TaggedOutput('valid', element)
        else:
            yield beam.pvalue.TaggedOutput('invalid', element)

options = PipelineOptions([
    '--runner=DataflowRunner',
    '--project=my-project',
    '--region=us-central1',
    '--temp_location=gs://my-bucket/temp',
    '--staging_location=gs://my-bucket/staging',
    '--streaming',                      # Enable streaming mode
    '--autoscaling_algorithm=THROUGHPUT_BASED',
    '--max_num_workers=20',
    '--usePublicIps=false',             # Private workers
])

with beam.Pipeline(options=options) as p:
    # Read from Pub/Sub
    events = (
        p
        | 'ReadPubSub' >> beam.io.ReadFromPubSub(
            topic='projects/my-project/topics/events')
        | 'Decode' >> beam.Map(lambda x: x.decode('utf-8'))
        | 'Parse' >> beam.ParDo(ParseEvent())
    )

    # Split into valid and invalid
    tagged = events | 'Validate' >> beam.ParDo(FilterValid()).with_outputs('valid', 'invalid')

    # Write valid events to BigQuery
    tagged.valid | 'WriteBQ' >> beam.io.WriteToBigQuery(
        table='my-project:dataset.events',
        schema='user_id:STRING,amount:FLOAT,timestamp:TIMESTAMP,event_hour:STRING',
        write_disposition=beam.io.BigQueryDisposition.WRITE_APPEND,
        insert_retry_strategy=beam.io.gcp.bigquery_tools.RetryStrategy.RETRY_ON_TRANSIENT_ERROR,
        method=beam.io.WriteToBigQuery.Method.STREAMING_INSERTS,
    )

    # Write invalid to dead-letter table
    tagged.invalid | 'WriteErrors' >> beam.io.WriteToBigQuery(
        table='my-project:dataset.events_errors',
        schema='user_id:STRING,amount:FLOAT,timestamp:STRING',
        write_disposition=beam.io.BigQueryDisposition.WRITE_APPEND,
    )
```

>**Exam Tip:** Dataflow provides **exactly-once processing** for streaming pipelines (via checkpointing). Key flags: `--streaming` enables unbounded mode, `--autoscaling_algorithm=THROUGHPUT_BASED` enables auto-scaling, and `--usePublicIps=false` keeps workers on the private network.

## 03. Dataproc and Apache Spark

### Cluster Mode vs Serverless

| Feature | Dataproc Cluster | Dataproc Serverless |
| --- | --- | --- |
| **Management** | You manage cluster lifecycle | Fully managed, no cluster |
| **Startup time** | ~90 seconds | ~60 seconds |
| **Autoscaling** | Configurable autoscaling policies | Automatic |
| **Custom images** | Yes (custom init actions, packages) | No (use custom containers) |
| **Cost** | Pay for cluster uptime + Dataproc fee | Pay per DCU-hour consumed |
| **Best for** | Long-running clusters, custom environments | Ad-hoc Spark SQL, short batch jobs |
| **Preemptible VMs** | Yes (secondary workers) | N/A |

```
# Create an ephemeral Dataproc cluster, run a job, delete it
gcloud dataproc clusters create my-cluster \
  --region=us-central1 \
  --num-workers=4 \
  --worker-machine-type=n2-standard-8 \
  --num-secondary-workers=8 \
  --secondary-worker-type=preemptible \
  --autoscaling-policy=my-policy \
  --enable-component-gateway \
  --optional-components=JUPYTER,HIVE_WEBHCAT \
  --initialization-actions=gs://my-bucket/init/install-deps.sh \
  --max-idle=30m          # Auto-delete after 30 min idle

# Submit a PySpark job
gcloud dataproc jobs submit pyspark \
  --cluster=my-cluster \
  --region=us-central1 \
  --py-files=gs://my-bucket/libs/utils.py \
  gs://my-bucket/jobs/transform.py \
  -- --input=gs://raw-data/ --output=gs://processed/

# Dataproc Serverless (no cluster to manage)
gcloud dataproc batches submit pyspark \
  --region=us-central1 \
  --deps-bucket=gs://my-bucket/deps \
  gs://my-bucket/jobs/transform.py \
  -- --input=gs://raw-data/ --output=gs://processed/
```

### When to Use Spark vs Beam (Dataflow)

| Criteria | Dataflow (Beam) | Dataproc (Spark) |
| --- | --- | --- |
| **Streaming** | Native, exactly-once, auto-scaling | Spark Structured Streaming (at-least-once by default) |
| **Existing Spark code** | Requires rewrite to Beam | Run as-is (lift and shift) |
| **Serverless** | Fully serverless always | Serverless option or managed clusters |
| **ML in pipeline** | Limited (Beam ML, TFX) | Full Spark ML, MLlib ecosystem |
| **Hadoop ecosystem** | Not applicable | Hive, HBase, Pig, Sqoop, Presto |
| **Portability** | Beam SDK runs on multiple runners | Spark runs on Dataproc, EMR, HDInsight |

>**Decision Guide:** Choose **Dataflow** for new streaming pipelines, serverless batch, and when you want exactly-once guarantees. Choose **Dataproc** when migrating existing Spark/Hadoop workloads, when you need Spark ML, or when your team has deep Spark expertise.

## 04. Streaming Pipelines

### Pub/Sub Deep Dive

Cloud Pub/Sub is a global, real-time messaging service. Key concepts for the exam:

#### Topics and Subscriptions

Publishers send to topics. Each subscription gets an independent copy of every message. One topic can have many subscriptions (fan-out).

#### Pull vs Push

Pull: subscriber polls for messages. Push: Pub/Sub sends HTTP POST to endpoint. Pull is more common with Dataflow; Push for Cloud Run/Functions.

#### Ordering

Messages are unordered by default. Enable ordering with an ordering key (e.g., user\_id). Messages with the same key delivered in order within a region.

#### Dead-Letter Topics

Messages that cannot be processed after max delivery attempts are forwarded to a dead-letter topic for investigation. Configure max\_delivery\_attempts.

#### Exactly-Once Delivery

Pub/Sub provides at-least-once delivery. For exactly-once, Dataflow deduplicates using message IDs. BigQuery subscriptions also support exactly-once.

#### Pub/Sub Lite

Lower-cost alternative for high-volume, zonal workloads where global availability is not required. You pre-provision throughput and storage capacity.

```
# Create a topic with a schema
gcloud pubsub topics create events \
  --schema=projects/my-project/schemas/event-schema \
  --message-encoding=JSON

# Create a subscription with dead-letter topic and ordering
gcloud pubsub subscriptions create events-sub \
  --topic=events \
  --dead-letter-topic=projects/my-project/topics/events-dlq \
  --max-delivery-attempts=10 \
  --enable-message-ordering \
  --ack-deadline=60

# Create a BigQuery subscription (direct to BQ, no pipeline needed)
gcloud pubsub subscriptions create events-bq-sub \
  --topic=events \
  --bigquery-table=my-project:dataset.events \
  --use-topic-schema \
  --write-metadata
```

### Windowing Strategies

Windows group unbounded data into finite chunks for aggregation. The four window types in Beam:

| Window Type | Description | Use Case |
| --- | --- | --- |
| **Fixed (Tumbling)** | Non-overlapping windows of fixed duration (e.g., every 5 minutes) | Hourly/daily aggregations, batch-like processing of streams |
| **Sliding** | Overlapping windows: window size + slide interval (e.g., 10 min window, slide every 2 min) | Moving averages, trend detection, rolling metrics |
| **Session** | Dynamic windows based on activity gaps. Window closes after inactivity timeout. | User sessions, click-stream analysis, activity bursts |
| **Global** | Single window for all data. Default for batch. For streaming, requires a trigger. | Running totals, batch pipelines |

```
import apache_beam as beam
from apache_beam import window

# Fixed windows: 5-minute tumbling windows
events | 'FixedWindow' >> beam.WindowInto(window.FixedWindows(5 * 60))

# Sliding windows: 10-minute window, sliding every 2 minutes
events | 'SlidingWindow' >> beam.WindowInto(window.SlidingWindows(10 * 60, 2 * 60))

# Session windows: gap of 30 minutes
events | 'SessionWindow' >> beam.WindowInto(window.Sessions(30 * 60))

# After windowing, aggregate per window
(events
 | 'FixedWindow' >> beam.WindowInto(window.FixedWindows(60))  # 1-min windows
 | 'AddKey' >> beam.Map(lambda e: (e['sensor_id'], e['reading']))
 | 'AvgPerWindow' >> beam.CombinePerKey(beam.combiners.MeanCombineFn())
 | 'WriteBQ' >> beam.io.WriteToBigQuery(...)
)
```

### Late Data, Watermarks, and Triggers

In streaming systems, data can arrive late (after the window has "closed"). Beam uses three mechanisms to handle this:

-   **Watermark** — An estimate of event-time progress. When the watermark passes the end of a window, Beam considers the window "complete." Dataflow tracks watermarks automatically.
-   **Allowed lateness** — How long after the watermark passes to still accept late data. Late elements are added to their original window and trigger re-computation.
-   **Triggers** — Control when window results are emitted. **AfterWatermark** (default), **AfterProcessingTime**, **AfterCount**, or **Repeatedly** for periodic updates.

```
from apache_beam.transforms.trigger import (
    AfterWatermark, AfterProcessingTime, AccumulationMode, AfterCount
)

# Window with late data handling
events | beam.WindowInto(
    window.FixedWindows(5 * 60),          # 5-minute windows
    trigger=AfterWatermark(
        early=AfterProcessingTime(60),     # Speculative results every 60s
        late=AfterCount(1),                # Fire for each late element
    ),
    allowed_lateness=Duration(seconds=3600),  # Accept up to 1 hour late
    accumulation_mode=AccumulationMode.ACCUMULATING,  # Include all data
)
```

>**Exam Tip:** **ACCUMULATING** mode: Each trigger firing emits all data seen so far (cumulative). **DISCARDING** mode: Each firing emits only new data since the last firing. Choose ACCUMULATING when you want the latest aggregate; DISCARDING when downstream does its own aggregation.

### BigQuery Streaming Options

| Method | Latency | Cost | Guarantee |
| --- | --- | --- | --- |
| **Storage Write API (default)** | Seconds | Free (up to quota) | Exactly-once (committed streams) |
| **Legacy Streaming API** | Seconds | $0.05/GB | At-least-once (best effort dedup) |
| **Pub/Sub BQ subscription** | Seconds | Pub/Sub + BQ storage | Exactly-once |
| **Batch load** | Minutes | Free | Atomic per load job |

## 05. Deploying and Operationalizing Pipelines

### Cloud Composer DAGs

Cloud Composer is managed Apache Airflow for orchestrating data pipelines. Key exam concepts:

-   **DAG** (Directed Acyclic Graph) — Defines task dependencies and execution order
-   **Operators** — Define what each task does (BigQueryInsertJobOperator, DataflowCreatePythonJobOperator, GCSToGCSOperator, etc.)
-   **Sensors** — Wait for external conditions (GCSObjectExistenceSensor, BigQueryTableExistenceSensor)
-   **XCom** — Pass data between tasks (small metadata only, not large datasets)
-   **Composer 2** — Auto-scaling workers, smaller environment footprint, lower cost

```
from airflow import DAG
from airflow.utils.dates import days_ago
from airflow.providers.google.cloud.operators.bigquery import (
    BigQueryInsertJobOperator,
    BigQueryCheckOperator,
)
from airflow.providers.google.cloud.operators.dataflow import (
    DataflowCreatePythonJobOperator,
)
from airflow.providers.google.cloud.sensors.gcs import GCSObjectExistenceSensor

default_args = {
    'owner': 'data-eng',
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'email_on_failure': True,
    'email': ['alerts@example.com'],
}

with DAG(
    dag_id='daily_pipeline',
    default_args=default_args,
    schedule_interval='@daily',
    start_date=days_ago(1),
    catchup=False,
    tags=['production', 'bigquery'],
) as dag:

    # Wait for source file
    wait_for_file = GCSObjectExistenceSensor(
        task_id='wait_for_source',
        bucket='raw-data',
        object='events/{{ ds }}/data.parquet',
        timeout=3600,
        poke_interval=300,
    )

    # Run Dataflow pipeline
    run_pipeline = DataflowCreatePythonJobOperator(
        task_id='run_dataflow',
        py_file='gs://my-bucket/pipelines/transform.py',
        job_name='daily-transform-{{ ds_nodash }}',
        options={
            'input': 'gs://raw-data/events/{{ ds }}/',
            'output': 'my-project:dataset.events',
            'temp_location': 'gs://my-bucket/temp',
        },
        project_id='my-project',
        location='us-central1',
    )

    # Data quality check
    quality_check = BigQueryCheckOperator(
        task_id='quality_check',
        sql="""
            SELECT COUNT(*) > 0
            FROM `my-project.dataset.events`
            WHERE DATE(event_time) = '{{ ds }}'
        """,
        use_legacy_sql=False,
    )

    # Build aggregate table
    build_agg = BigQueryInsertJobOperator(
        task_id='build_aggregates',
        configuration={
            'query': {
                'query': """
                    CREATE OR REPLACE TABLE `my-project.dataset.daily_agg`
                    PARTITION BY event_date
                    AS SELECT
                        DATE(event_time) AS event_date,
                        user_id,
                        COUNT(*) AS event_count,
                        SUM(amount) AS total_amount
                    FROM `my-project.dataset.events`
                    GROUP BY 1, 2
                """,
                'useLegacySql': False,
            }
        },
    )

    wait_for_file >> run_pipeline >> quality_check >> build_agg
```

### Google Cloud Workflows

For simpler orchestration without the overhead of Airflow, **Workflows** is a serverless orchestration service. It uses YAML/JSON to define steps that call GCP APIs, Cloud Functions, or Cloud Run services.

| Feature | Cloud Composer | Workflows |
| --- | --- | --- |
| **Complexity** | Complex DAGs, many dependencies | Simple, linear workflows |
| **Cost model** | Always-on environment | Pay per execution step |
| **Scheduling** | Built-in cron scheduling | Use Cloud Scheduler to trigger |
| **Monitoring** | Airflow UI, logs, metrics | Execution logs, Cloud Monitoring |
| **Best for** | Data pipeline orchestration | API orchestration, microservice coordination |

### CI/CD for Data Pipelines

Production pipelines should follow CI/CD practices:

-   **Source control** — Pipeline code (Beam, Spark, DAGs) in Git
-   **Unit tests** — Test DoFn logic, SQL queries with mock data
-   **Integration tests** — Run with DirectRunner on sample data
-   **Deployment** — Cloud Build triggers deploy DAGs to Composer, Dataflow templates to GCS
-   **Dataflow Flex Templates** — Package pipeline as a Docker container for versioned, parameterized deployments

>**Key Concept:** **Dataflow Templates** come in two flavors. **Classic Templates**: pre-compiled pipeline with runtime parameters (simpler, less flexible). **Flex Templates**: Docker container with pipeline code, built at launch time (more flexible, supports dynamic pipeline construction).

## 06. Service Comparison Matrix

| Service | Type | Best For | Not For |
| --- | --- | --- | --- |
| **Dataflow** | Serverless Beam runner | New streaming/batch pipelines, exactly-once, auto-scaling | Existing Spark code, Hadoop ecosystem |
| **Dataproc** | Managed Spark/Hadoop | Migrate Spark/Hadoop, ML workloads, Hive queries | Simple event streaming |
| **Cloud Data Fusion** | Code-free ETL | Non-programmer ETL, enterprise connectors (SAP) | Custom streaming, high-performance batch |
| **Dataform** | SQL transforms | BQ-native ELT, SQL workflows, version control | Non-BQ targets, non-SQL transforms |
| **Pub/Sub** | Messaging | Event ingestion, decoupling producers/consumers | Data transformation (use with Dataflow) |
| **Cloud Composer** | Orchestration | Complex DAGs, cross-service workflows, scheduling | Simple API orchestration (use Workflows) |

## 07. Exam Tips
>**Scenario: Late-Arriving Data:** "IoT sensors send data that can arrive up to 2 hours late. You need accurate hourly aggregations." → Use **Dataflow** with fixed windows (1 hour), `allowed_lateness=7200` (2 hours), and an AfterWatermark trigger with late firings. Use ACCUMULATING mode for accurate totals.
>**Scenario: Migrate Spark Jobs:** "Lift and shift existing Spark ETL jobs from on-premises Hadoop to GCP." → Use **Dataproc**. Minimal code changes. Store data in Cloud Storage instead of HDFS. Use ephemeral clusters with `--max-idle` for cost savings.
>**Scenario: Event-Driven Architecture:** "Multiple microservices need to react to the same events independently." → Use **Pub/Sub** with one topic and multiple subscriptions (fan-out pattern). Each subscription gets all messages independently.
>**Scenario: Streaming to BigQuery:** "Stream events to BigQuery with exactly-once semantics and minimal cost." → Use the **Storage Write API** with committed streams. It is free (within quota) and provides exactly-once guarantees, unlike the legacy streaming API.
>**Scenario: Orchestrate Daily Pipeline:** "Coordinate a daily pipeline: wait for file, run Dataflow, validate data, build aggregates." → Use **Cloud Composer** with GCSObjectExistenceSensor, DataflowOperator, BigQueryCheckOperator, and BigQueryInsertJobOperator in a DAG.

Previous

[← Designing Data Systems](01-designing-data-systems.html)

Next Section

[Storing the Data →](03-storing-the-data.html)