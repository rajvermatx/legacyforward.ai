---
title: "Maintaining and Automating Workloads"
slug: "maintaining-data-workloads"
description: "Covers roughly 18% of the exam. Optimize resources and costs, automate with Cloud Composer DAGs,
    manage BigQuery workloads with Editions and reservations, monitor and troubleshoot pipelines,
    and design for fault tolerance and data integrity."
section: "gcp-pde"
order: 5
badges:
  - "Resource Optimization"
  - "Automation & DAGs"
  - "Monitoring"
  - "Fault Tolerance"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-pde/05-maintaining-data-workloads.ipynb"
---

## 01. Resource Optimization

### BigQuery Cost Control

#### Partition & Cluster Tables

Partition by date/timestamp, cluster by frequently filtered columns. Use require\_partition\_filter to prevent full scans.

#### Use Editions Pricing

Switch from on-demand ($6.25/TB) to Editions with reservations for predictable costs. Set baseline + autoscaling max.

#### Materialized Views

Pre-compute common aggregations. BQ auto-rewrites queries to use them. Set max\_staleness for zero-compute reads.

#### Storage Optimization

Tables not modified for 90 days get long-term pricing (~50% cheaper). Expiration settings auto-delete old partitions.

#### Query Optimization

SELECT only needed columns, avoid SELECT \*, use APPROX functions, limit JOINs on large tables, denormalize with STRUCT/ARRAY.

#### Custom Cost Controls

Set maximum bytes billed per query. Project-level and user-level quotas. INFORMATION\_SCHEMA for usage tracking.

```
-- Set maximum bytes billed to prevent expensive queries
-- This query will fail if it would scan more than 10 GB
SELECT user_id, COUNT(*) as events
FROM `project.dataset.events`
WHERE DATE(event_time) = CURRENT_DATE()
GROUP BY 1
OPTIONS (maximum_bytes_billed = 10737418240);  -- 10 GB in bytes

-- Monitor slot usage and query costs via INFORMATION_SCHEMA
SELECT
  user_email,
  COUNT(*) AS query_count,
  ROUND(SUM(total_bytes_billed) / POW(1024, 4), 2) AS total_tb_billed,
  ROUND(SUM(total_bytes_billed) / POW(1024, 4) * 6.25, 2) AS estimated_cost_usd,
  ROUND(AVG(total_slot_ms) / 1000, 1) AS avg_slot_seconds
FROM `region-us`.INFORMATION_SCHEMA.JOBS
WHERE creation_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
  AND job_type = 'QUERY'
  AND state = 'DONE'
GROUP BY 1
ORDER BY estimated_cost_usd DESC
LIMIT 20;
```

### Dataflow Optimization

| Technique | Description | Impact |
| --- | --- | --- |
| **Autoscaling** | Use THROUGHPUT\_BASED autoscaling with max\_num\_workers | Scale up/down based on load. Avoid over-provisioning. |
| **Fusion optimization** | Beam automatically fuses compatible steps into single stages | Reduces serialization/deserialization overhead. |
| **Combine vs GroupByKey** | Use Combine instead of GroupByKey + manual aggregation | Combine does partial aggregation before shuffle (less data movement). |
| **Side inputs** | Use AsDict or AsList for small lookup data | Avoids expensive CoGroupByKey for enrichment lookups. |
| **Streaming Engine** | Offloads shuffle to Google-managed service | Reduces worker CPU/memory. Enable with `--enableStreamingEngine`. |
| **Worker machine type** | Choose appropriate machine type for workload | Memory-intensive: n2-highmem. CPU-intensive: c2 or c3. |

### Dataproc Cost Savings

-   **Ephemeral clusters** — Create, run job, delete. Use `--max-idle` for auto-deletion after inactivity.
-   **Preemptible/Spot VMs** — Use for secondary workers (up to 80% savings). Primary workers should be standard VMs.
-   **Autoscaling policies** — Define scale-up/down rules based on YARN metrics. Prevents idle over-provisioning.
-   **Dataproc Serverless** — No cluster management. Pay only for DCU-hours consumed during job execution.
-   **Enhanced Flexibility Mode (EFM)** — Gracefully handles preemptible worker removal without losing in-progress work.

```
# Dataproc autoscaling policy
gcloud dataproc autoscaling-policies create cost-optimized \
  --region=us-central1 \
  --min-instances=2 \
  --max-instances=20 \
  --scale-up-factor=1.0 \
  --scale-down-factor=1.0 \
  --cooldown-period=120s \
  --scale-up-min-worker-fraction=0.0 \
  --scale-down-min-worker-fraction=0.0

# Apply to cluster
gcloud dataproc clusters create my-cluster \
  --region=us-central1 \
  --autoscaling-policy=cost-optimized \
  --num-secondary-workers=10 \
  --secondary-worker-type=spot \
  --worker-machine-type=n2-standard-8 \
  --max-idle=30m
```

### Storage Cost Optimization

| Strategy | Service | Savings |
| --- | --- | --- |
| **Lifecycle policies** | Cloud Storage | Auto-transition Standard to Nearline/Coldline/Archive |
| **Long-term storage** | BigQuery | Tables untouched for 90 days: ~50% cheaper storage |
| **Partition expiration** | BigQuery | Auto-delete old partitions (e.g., 365 days) |
| **Table expiration** | BigQuery | Auto-delete temp/staging tables after N days |
| **Compression** | Cloud Storage | Store Parquet (columnar, compressed) instead of CSV/JSON |
| **Deduplication** | All | Remove duplicate records. Use MERGE for upserts. |

## 02. Automation and Repeatability

### Cloud Composer Operations

Production Composer environments require careful configuration and management:

| Feature | Composer 1 | Composer 2 |
| --- | --- | --- |
| **Architecture** | Fixed GKE cluster | Autopilot GKE, auto-scaling workers |
| **Scaling** | Manual node count | Automatic worker pod scaling |
| **Cost** | Pay for full GKE cluster | Pay for actual compute used (much lower baseline) |
| **Environment size** | N/A | Small, Medium, Large (affects scheduler/web server) |
| **Recommendation** | Legacy | Always use Composer 2 for new environments |

### DAG Design Patterns

```
from airflow import DAG
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.empty import EmptyOperator
from airflow.utils.task_group import TaskGroup
from airflow.utils.dates import days_ago
from datetime import timedelta

# Pattern 1: Task Groups for organizing complex DAGs
with DAG('production_pipeline', start_date=days_ago(1),
         schedule_interval='0 6 * * *', catchup=False) as dag:

    start = EmptyOperator(task_id='start')

    with TaskGroup('ingest') as ingest_group:
        ingest_orders = PythonOperator(task_id='orders', python_callable=ingest_orders_fn)
        ingest_users = PythonOperator(task_id='users', python_callable=ingest_users_fn)
        ingest_products = PythonOperator(task_id='products', python_callable=ingest_products_fn)

    with TaskGroup('transform') as transform_group:
        build_facts = PythonOperator(task_id='facts', python_callable=build_facts_fn)
        build_dims = PythonOperator(task_id='dims', python_callable=build_dims_fn)

    with TaskGroup('validate') as validate_group:
        check_counts = PythonOperator(task_id='row_counts', python_callable=check_counts_fn)
        check_freshness = PythonOperator(task_id='freshness', python_callable=check_freshness_fn)

    notify = PythonOperator(task_id='notify', python_callable=send_notification_fn)

    start >> ingest_group >> transform_group >> validate_group >> notify
```

```
# Pattern 2: Branching based on data quality
def decide_branch(**context):
    """Route based on data quality check results."""
    quality_score = context['ti'].xcom_pull(task_ids='quality_check')
    if quality_score >= 0.95:
        return 'proceed_to_production'
    elif quality_score >= 0.80:
        return 'proceed_with_warning'
    else:
        return 'quarantine_data'

branch = BranchPythonOperator(
    task_id='quality_branch',
    python_callable=decide_branch,
)

# Pattern 3: Retry and alerting configuration
default_args = {
    'owner': 'data-eng',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'retry_exponential_backoff': True,    # Exponential backoff
    'max_retry_delay': timedelta(minutes=60),
    'email_on_failure': True,
    'email_on_retry': False,
    'email': ['data-eng-alerts@example.com'],
    'sla': timedelta(hours=2),            # SLA alerting
    'execution_timeout': timedelta(hours=4),
}
```

### Scheduled Queries in BigQuery

For simpler automation that does not need DAG orchestration, BigQuery scheduled queries run SQL at specified intervals:

```
-- Scheduled query: Daily aggregation (runs at 06:00 UTC)
-- Configured via Console, bq CLI, or API

# Create a scheduled query via bq CLI
bq query --use_legacy_sql=false \
  --schedule="every 24 hours" \
  --display_name="Daily Revenue Aggregation" \
  --destination_table=project:dataset.daily_revenue \
  --replace=true \
  '
  SELECT
    DATE(event_time) AS event_date,
    region,
    SUM(revenue) AS total_revenue,
    COUNT(DISTINCT user_id) AS unique_users
  FROM `project.dataset.events`
  WHERE DATE(event_time) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
  GROUP BY 1, 2
  '
```

>**When to Use What:** **Scheduled queries**: Simple, single-step SQL transformations on a schedule. **Dataform**: Multi-step SQL workflows with dependencies and testing. **Cloud Composer**: Complex, multi-service orchestration (Dataflow + BigQuery + GCS + notifications).

## 03. Workload Organization

### BigQuery Editions

BigQuery Editions provide **capacity-based pricing** as an alternative to on-demand (per-TB) pricing. You purchase slot capacity with autoscaling:

| Edition | Price ($/slot-hr) | Commitment | Key Features |
| --- | --- | --- | --- |
| **Standard** | $0.04 | None (pay-as-you-go), 1-yr, 3-yr | Baseline + autoscaling, basic security |
| **Enterprise** | $0.06 | None, 1-yr, 3-yr | CMEK, materialized views, multi-region, BI Engine |
| **Enterprise Plus** | $0.10 | None, 1-yr, 3-yr | Advanced security, multi-region failover, highest SLA |

### Reservations and Assignments

Slots are organized using three concepts:

-   **Capacity commitment** — The total slot capacity purchased (baseline). Can be committed (1-yr, 3-yr for discounts) or flex (pay-as-you-go).
-   **Reservation** — A named pool of slots from the capacity commitment. Multiple reservations can be created (e.g., "etl", "analytics", "adhoc").
-   **Assignment** — Maps a project, folder, or organization to a reservation. Queries from assigned projects use the reservation's slots.

```
-- Create a reservation hierarchy
-- Total capacity: 500 slots (baseline) with burst to 1000

# Create capacity commitment
bq mk --capacity_commitment \
  --project_id=admin-project \
  --location=US \
  --slots=500 \
  --plan=ANNUAL \
  --edition=ENTERPRISE

# Create reservations (split the 500 slots)
bq mk --reservation \
  --project_id=admin-project \
  --location=US \
  --reservation_id=etl_jobs \
  --slots=200 \
  --autoscale_max_slots=400

bq mk --reservation \
  --project_id=admin-project \
  --location=US \
  --reservation_id=analytics \
  --slots=200 \
  --autoscale_max_slots=500

bq mk --reservation \
  --project_id=admin-project \
  --location=US \
  --reservation_id=adhoc \
  --slots=100 \
  --autoscale_max_slots=200

# Assign projects to reservations
bq mk --reservation_assignment \
  --project_id=admin-project \
  --location=US \
  --reservation_id=etl_jobs \
  --assignee_id=etl-project \
  --assignee_type=PROJECT \
  --job_type=QUERY

bq mk --reservation_assignment \
  --project_id=admin-project \
  --location=US \
  --reservation_id=analytics \
  --assignee_id=analytics-project \
  --assignee_type=PROJECT \
  --job_type=QUERY
```

>**Exam Tip:** Reservations provide **workload isolation**: ETL jobs cannot starve interactive analytics queries. Idle slots from one reservation can be borrowed by others (idle slot sharing). The **autoscale\_max\_slots** setting controls burst capacity beyond the baseline.

## 04. Monitoring and Troubleshooting

### Cloud Monitoring

#### BigQuery Metrics

Slot utilization, query count, bytes scanned, job duration. Create alerts for slot saturation or excessive bytes scanned.

#### Dataflow Metrics

System lag, data freshness, worker CPU/memory, backlog size, element count. Key: system\_lag indicates processing delay.

#### Pub/Sub Metrics

Oldest unacked message age, subscription backlog, publish/pull throughput. Alert on growing backlog (consumer falling behind).

#### Composer Metrics

DAG run duration, task failure rate, scheduler heartbeat, worker pod count. Alert on scheduler lag or high failure rates.

```
# Create a Cloud Monitoring alert for Pub/Sub backlog
gcloud alpha monitoring policies create \
  --display-name="PubSub Backlog Alert" \
  --condition-display-name="High backlog" \
  --condition-filter='resource.type="pubsub_subscription" AND metric.type="pubsub.googleapis.com/subscription/num_undelivered_messages"' \
  --condition-threshold-value=10000 \
  --condition-threshold-duration=300s \
  --condition-threshold-comparison=COMPARISON_GT \
  --notification-channels=projects/my-project/notificationChannels/12345
```

### Cloud Logging

Cloud Logging captures logs from all GCP services. Key log sources for data engineering:

-   **BigQuery** — `cloudaudit.googleapis.com/data_access` for query logs, `bigquery.googleapis.com/data_access` for data access
-   **Dataflow** — Worker logs in `dataflow.googleapis.com/`, job messages, step-level diagnostics
-   **Cloud Composer** — Airflow task logs, scheduler logs, DAG processing logs
-   **Pub/Sub** — Dead-letter topic messages for debugging failed message processing

### BigQuery Audit and Usage Analysis

```
-- Identify most expensive queries in the last 7 days
SELECT
  job_id,
  user_email,
  query,
  total_bytes_billed,
  ROUND(total_bytes_billed / POW(1024, 4), 4) AS tb_billed,
  ROUND(total_bytes_billed / POW(1024, 4) * 6.25, 2) AS cost_usd,
  total_slot_ms,
  TIMESTAMP_DIFF(end_time, start_time, SECOND) AS duration_sec
FROM `region-us`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
WHERE creation_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND job_type = 'QUERY'
  AND state = 'DONE'
  AND error_result IS NULL
ORDER BY total_bytes_billed DESC
LIMIT 25;

-- Identify tables without partition pruning
SELECT
  referenced_table.project_id,
  referenced_table.dataset_id,
  referenced_table.table_id,
  COUNT(*) AS query_count,
  SUM(total_bytes_billed) AS total_bytes_billed
FROM `region-us`.INFORMATION_SCHEMA.JOBS_BY_PROJECT,
  UNNEST(referenced_tables) AS referenced_table
WHERE creation_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND total_bytes_billed > 10737418240  -- > 10 GB
GROUP BY 1, 2, 3
ORDER BY total_bytes_billed DESC;
```

## 05. Fault Tolerance and Data Integrity

### Backup and Recovery

| Service | Backup Method | Recovery |
| --- | --- | --- |
| **BigQuery** | Time travel (up to 7 days), table snapshots, cross-region dataset copies | Query any point in time with `FOR SYSTEM_TIME AS OF` |
| **Cloud SQL** | Automated daily backups, on-demand backups, PITR (binlog) | Restore to any point within retention period |
| **Cloud Spanner** | Automatic backups, export to GCS | Restore from backup, import from GCS |
| **Bigtable** | Managed backups (retained up to 30 days) | Restore to same or different instance |
| **Cloud Storage** | Object versioning, cross-region replication | Restore previous object versions |

```
-- BigQuery time travel: Query data as it was 2 hours ago
SELECT *
FROM `project.dataset.events`
FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR)
WHERE DATE(event_time) = '2025-03-01';

-- Restore a deleted table (within 7-day time travel window)
# bq cp project:dataset.events@-3600000 project:dataset.events_restored
# (3600000 ms = 1 hour ago)

-- Create a table snapshot (point-in-time copy without storage cost for shared data)
CREATE SNAPSHOT TABLE `project.dataset.events_snapshot_20250301`
CLONE `project.dataset.events`
FOR SYSTEM_TIME AS OF '2025-03-01 00:00:00 UTC'
OPTIONS (
  expiration_timestamp = TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
);
```

### Failover Strategies

#### BigQuery Cross-Region

Use Enterprise Plus edition for cross-region dataset replication. Automatic failover for high-availability analytics.

#### Cloud SQL HA

Regional HA configuration with automatic failover to a standby instance in a different zone. Cross-region read replicas for DR.

#### Spanner Multi-Region

Multi-region configurations (nam-eur-asia1, nam6, eur6) with automatic failover. 99.999% SLA. No manual intervention needed.

#### Dataflow Drain & Update

Drain a streaming pipeline to gracefully stop (finishes in-flight). Update to replace with new version using same state (snapshots).

```
# Dataflow: Gracefully drain a streaming pipeline
gcloud dataflow jobs drain JOB_ID --region=us-central1

# Dataflow: Update a streaming pipeline (preserves state)
python my_pipeline.py \
  --runner=DataflowRunner \
  --update \
  --job_name=my-streaming-job \
  --region=us-central1 \
  --transform_name_mapping='{"OldTransformName": "NewTransformName"}'

# Cloud SQL: Set up HA and cross-region replica
gcloud sql instances create my-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-4-16384 \
  --region=us-central1 \
  --availability-type=REGIONAL         # HA with standby

gcloud sql instances create my-db-replica \
  --master-instance-name=my-db \
  --region=europe-west1                 # Cross-region DR replica
```

>**Exam Tip:** For the exam, know the distinction between **drain** and **cancel** for Dataflow. **Drain** finishes processing in-flight elements, writes final results, and stops. **Cancel** immediately stops without finishing in-flight work. Use drain for graceful shutdown; cancel only for emergencies.

## 06. Exam Tips
>**Scenario: Reduce BigQuery Costs for Large Team:** "A 50-person analytics team runs ad-hoc queries costing $50K/month." → Switch to **Editions pricing** with reservations. Create separate reservations for ETL and ad-hoc queries. Set **maximum\_bytes\_billed** per query. Use INFORMATION\_SCHEMA to identify and optimize expensive queries.
>**Scenario: Orchestrate Multi-Service Pipeline:** "Daily pipeline: wait for GCS file, run Dataflow, load to BQ, run quality checks, send Slack alert." → **Cloud Composer 2** with GCSObjectExistenceSensor, DataflowCreatePythonJobOperator, BigQueryCheckOperator, and SlackWebhookOperator in a DAG with retry and SLA configuration.
>**Scenario: Update Streaming Pipeline:** "Need to update a streaming Dataflow pipeline without losing data." → Use the `--update` flag with `--transform_name_mapping` if transform names changed. Dataflow preserves the pipeline state (watermarks, windows) during the update.
>**Scenario: Recover Deleted BigQuery Data:** "Someone accidentally deleted rows from a production BigQuery table 3 hours ago." → Use **time travel**: query the table `FOR SYSTEM_TIME AS OF` from 3 hours ago. Create a snapshot or copy the historical data back. Time travel works for up to 7 days (configurable).
>**Scenario: Monitor Streaming Pipeline Health:** "Alert when a streaming pipeline falls behind." → Monitor **system\_lag** metric in Cloud Monitoring for Dataflow. For Pub/Sub, monitor **oldest\_unacked\_message\_age**. Set up alerting policies with thresholds and notification channels.

### Automation Decision Matrix

| Need | Tool |
| --- | --- |
| Simple scheduled SQL | **BigQuery Scheduled Queries** |
| SQL transformations with dependencies | **Dataform** |
| Multi-service pipeline orchestration | **Cloud Composer** |
| Simple API workflow | **Workflows** |
| Event-triggered processing | **Cloud Functions / Eventarc** |
| Cron-triggered HTTP call | **Cloud Scheduler** |

Previous

[← Preparing and Using Data](04-preparing-using-data.html)

Back to Hub

[PDE Hub →](index.html)