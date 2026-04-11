---
title: "Storing the Data"
slug: "storing-the-data"
description: "Covers roughly 20% of the exam. Select the right storage system for each workload, design
    data warehouses and data lakes, understand BigQuery optimization, and build a unified data platform."
section: "gcp-pde"
order: 3
badges:
  - "Storage Selection"
  - "Data Warehouse Design"
  - "Data Lake Architecture"
  - "BigQuery Optimization"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-pde/03-storing-the-data.ipynb"
---

## 01. Storage Selection Guide

Choosing the right storage service is one of the most heavily tested topics. The decision tree depends on **data structure**, **access pattern**, **latency requirements**, **scale**, and **consistency needs**.

### Relational Databases

| Service | Scale | Best For | Max Size | SLA |
| --- | --- | --- | --- | --- |
| **Cloud SQL** | Single region, read replicas | OLTP web/app backends, MySQL/PG/SQL Server compatibility | 64 TB | 99.95% |
| **AlloyDB** | Single region, columnar engine | High-performance PostgreSQL, mixed OLTP+analytics | 64 TB+ | 99.99% |
| **Cloud Spanner** | Global, horizontal | Globally distributed ACID transactions, financial systems | Unlimited | 99.999% |

>**Decision Framework:** Need **global ACID transactions**? → Spanner. Need **PostgreSQL compatibility with high performance**? → AlloyDB. Need **simple MySQL/PG/SQL Server** for a web app? → Cloud SQL. Each step up adds cost but gains availability and scale.

### NoSQL Databases

| Service | Data Model | Latency | Best For |
| --- | --- | --- | --- |
| **Bigtable** | Wide-column (row-key + column families) | Single-digit ms | Time-series, IoT, analytics at PB scale. HBase compatible. |
| **Firestore** | Document (collections + documents) | Low ms | Mobile/web apps, real-time sync, offline support |
| **Memorystore** | Key-value (Redis/Memcached) | Sub-ms | Caching, session management, leaderboards |

```
# Bigtable: Design a row key for time-series IoT data
# BAD: timestamp#device_id (hotspotting - all writes to latest time)
# GOOD: device_id#reverse_timestamp (distributes writes across nodes)

# Example row key design:
# sensor_001#9999999999-1709827200  (reversed Unix timestamp)
# sensor_002#9999999999-1709827200
# sensor_001#9999999999-1709830800

# This ensures:
# 1. Writes distribute across tablets (different device_ids)
# 2. Reads for a device get latest data first (reversed time)
# 3. Range scans by device are efficient (prefix scan)
```

>**Bigtable Anti-Patterns:** Avoid **monotonically increasing row keys** (timestamps, sequence IDs) as the first component — this causes hotspotting. Always prefix with a high-cardinality, evenly distributed field. Bigtable stores data sorted by row key, so sequential keys all hit the same tablet.

### Object Storage (Cloud Storage)

| Storage Class | Min Duration | Retrieval Cost | Use Case |
| --- | --- | --- | --- |
| **Standard** | None | Free | Frequently accessed data, analytics, ML training |
| **Nearline** | 30 days | $0.01/GB | Monthly access: backups, infrequently accessed data |
| **Coldline** | 90 days | $0.02/GB | Quarterly access: disaster recovery, regulatory archives |
| **Archive** | 365 days | $0.05/GB | Yearly access: long-term compliance, legal holds |

```
# Lifecycle policy: Auto-transition and delete
gsutil lifecycle set lifecycle.json gs://my-bucket

# lifecycle.json:
{
  "rule": [
    {
      "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
      "condition": {"age": 30, "matchesStorageClass": ["STANDARD"]}
    },
    {
      "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
      "condition": {"age": 90, "matchesStorageClass": ["NEARLINE"]}
    },
    {
      "action": {"type": "Delete"},
      "condition": {"age": 365}
    }
  ]
}
```

## 02. BigQuery Deep Dive

### Architecture: Dremel + Colossus + Borg + Jupiter

BigQuery's architecture separates **compute** and **storage**:

-   **Colossus** — Distributed file system for persistent, columnar storage. Data stored in **Capacitor** format (Google's columnar format).
-   **Dremel** — Execution engine that creates a tree of processing nodes. Root server distributes query to intermediate and leaf nodes.
-   **Jupiter** — Google's petabit-scale network connecting compute and storage, enabling the separation.
-   **Borg** — Cluster management system that allocates compute resources (slots) dynamically.

### Partitioning and Clustering

| Feature | Partitioning | Clustering |
| --- | --- | --- |
| **Purpose** | Eliminate entire segments of data from scans | Sort data within partitions for colocated reads |
| **Columns** | One column: DATE, TIMESTAMP, DATETIME, INTEGER range, or ingestion time | Up to 4 columns (any type) |
| **Limit** | Max 4,000 partitions per table | No limit |
| **Cost benefit** | Shows in query dry-run (bytes scanned) | May not show in dry-run (applied at execution) |
| **Best for** | Date-based filtering (WHERE date = ...) | High-cardinality columns used in WHERE/JOIN |

```
-- Partitioned + clustered table
CREATE TABLE `project.dataset.events`
(
  event_id STRING,
  user_id STRING,
  event_type STRING,
  amount NUMERIC,
  region STRING,
  event_time TIMESTAMP
)
PARTITION BY DATE(event_time)
CLUSTER BY user_id, region
OPTIONS (
  partition_expiration_days = 365,
  require_partition_filter = true,  -- Force partition pruning
  description = "Production events table"
);

-- GOOD: Uses partition pruning + cluster pruning
SELECT user_id, SUM(amount)
FROM `project.dataset.events`
WHERE DATE(event_time) = '2025-03-01'
  AND region = 'US'
GROUP BY user_id;

-- BAD: Function on partition column prevents pruning
SELECT * FROM `project.dataset.events`
WHERE EXTRACT(YEAR FROM event_time) = 2025;  -- Full table scan!
```

### Query Optimization Techniques

#### SELECT Only Needed Columns

BigQuery is columnar. SELECT \* reads every column. Only select the columns you need to reduce bytes scanned and cost.

#### Filter Early with WHERE

Apply WHERE clauses before JOINs. Use partition filters. Avoid transforming partition columns in WHERE (breaks pruning).

#### Use APPROX Functions

APPROX\_COUNT\_DISTINCT is much faster than COUNT(DISTINCT). APPROX\_QUANTILES, APPROX\_TOP\_COUNT, APPROX\_TOP\_SUM for approximate aggregations.

#### Avoid Self-Joins

Use window functions (OVER) instead of self-joins. LAG, LEAD, ROW\_NUMBER, running aggregates are faster than joining a table to itself.

#### Denormalize When Possible

BigQuery is optimized for wide, denormalized tables. Use nested/repeated fields (STRUCT, ARRAY) instead of star schema joins.

#### Materialize CTEs

Large CTEs used multiple times in a query get re-executed. Create materialized views or temporary tables for expensive intermediate results.

```
-- Nested and repeated fields (denormalization)
CREATE TABLE `project.dataset.orders_nested` AS
SELECT
  order_id,
  customer_id,
  order_date,
  STRUCT(
    shipping_address.street,
    shipping_address.city,
    shipping_address.state,
    shipping_address.zip
  ) AS shipping,
  ARRAY_AGG(STRUCT(
    item_id,
    product_name,
    quantity,
    unit_price
  )) AS line_items
FROM `project.dataset.orders` o
JOIN `project.dataset.order_items` oi USING (order_id)
JOIN `project.dataset.addresses` a ON o.shipping_address_id = a.address_id
GROUP BY order_id, customer_id, order_date,
  shipping_address.street, shipping_address.city,
  shipping_address.state, shipping_address.zip;

-- Query nested data efficiently (no JOINs needed)
SELECT
  order_id,
  shipping.city,
  (SELECT SUM(li.quantity * li.unit_price) FROM UNNEST(line_items) li) AS total
FROM `project.dataset.orders_nested`
WHERE order_date = '2025-03-01';
```

### Slots and Pricing Models

| Pricing Model | How It Works | Best For |
| --- | --- | --- |
| **On-demand** | $6.25 per TB scanned (first 1 TB/month free) | Ad-hoc queries, variable workloads, getting started |
| **Editions (Standard)** | $0.04/slot-hour, autoscaling, baseline + burst | Predictable workloads, cost control |
| **Editions (Enterprise)** | $0.06/slot-hour, CMEK, multi-region, advanced | Enterprise compliance, advanced features |
| **Editions (Enterprise Plus)** | $0.10/slot-hour, all features, highest availability | Mission-critical, multi-region failover |

>**Exam Tip:** A **slot** is a unit of computational capacity (CPU + memory + network). A query uses multiple slots in parallel. With Editions, you set a **baseline** (committed) and **max reservation** (burst capacity). Autoscaler adjusts between them based on demand.

## 03. Data Warehouse Design

### Data Modeling in BigQuery

BigQuery supports multiple modeling approaches, but its columnar architecture favors **wide, denormalized tables** over traditional normalized schemas:

| Pattern | Description | BigQuery Recommendation |
| --- | --- | --- |
| **Star Schema** | Central fact table + dimension tables (JOINs at query time) | Works but JOINs cost compute slots. Consider pre-joining into wide tables. |
| **Denormalized** | All data in one wide table with nested/repeated fields | Best for BigQuery. Uses STRUCT and ARRAY. Avoids JOINs. |
| **Data Vault** | Hubs, links, satellites for historical tracking | Supported but complex. Useful for audit trails and slowly changing dimensions. |

### Materialized Views

Materialized views pre-compute query results and update automatically when base tables change. BigQuery **transparently rewrites** queries to use materialized views when beneficial.

```
-- Create a materialized view for daily aggregations
CREATE MATERIALIZED VIEW `project.dataset.daily_summary`
PARTITION BY event_date
CLUSTER BY region
OPTIONS (
  enable_refresh = true,
  refresh_interval_minutes = 30,
  max_staleness = INTERVAL "4:0:0" HOUR TO SECOND
)
AS
SELECT
  DATE(event_time) AS event_date,
  region,
  COUNT(*) AS event_count,
  SUM(amount) AS total_amount,
  AVG(amount) AS avg_amount,
  APPROX_COUNT_DISTINCT(user_id) AS unique_users
FROM `project.dataset.events`
GROUP BY 1, 2;

-- This query will automatically use the materialized view:
SELECT region, SUM(total_amount)
FROM `project.dataset.events`
WHERE DATE(event_time) = '2025-03-01'
GROUP BY region;
```

>**Key Concept:** Materialized views support **smart tuning** — BigQuery automatically creates and manages materialized views for frequently run queries. They also support **max\_staleness** which allows reading slightly stale data in exchange for zero compute cost.

## 04. Data Lakes

### BigLake: Unified Storage Engine

BigLake extends BigQuery governance to data stored in Cloud Storage. Create BigLake tables that point to files in GCS and query them with BigQuery SQL, while applying the same row-level and column-level security as native BigQuery tables.

```
-- Create a BigLake table over Parquet files in Cloud Storage
CREATE EXTERNAL TABLE `project.dataset.events_lake`
WITH CONNECTION `us.my-biglake-connection`
OPTIONS (
  format = 'PARQUET',
  uris = ['gs://my-data-lake/events/*.parquet'],
  metadata_cache_mode = 'AUTOMATIC',    -- Cache metadata for performance
  max_staleness = INTERVAL 1 HOUR       -- Refresh metadata hourly
);

-- Query the BigLake table just like a native BQ table
SELECT DATE(event_time) AS dt, COUNT(*) AS events
FROM `project.dataset.events_lake`
WHERE region = 'US'
GROUP BY 1
ORDER BY 1 DESC
LIMIT 30;
```

### Dataplex: Data Fabric

Dataplex organizes data across storage systems into a logical hierarchy:

```
# Create a Dataplex lake for the sales domain
gcloud dataplex lakes create sales-lake \
  --location=us-central1 \
  --display-name="Sales Domain Lake"

# Add a raw zone (accept any format)
gcloud dataplex zones create raw-zone \
  --lake=sales-lake \
  --location=us-central1 \
  --resource-location-type=SINGLE_REGION \
  --type=RAW \
  --display-name="Raw Ingestion Zone"

# Add a curated zone (structured data only)
gcloud dataplex zones create curated-zone \
  --lake=sales-lake \
  --location=us-central1 \
  --resource-location-type=SINGLE_REGION \
  --type=CURATED \
  --display-name="Curated Analytics Zone"

# Attach a Cloud Storage bucket as an asset
gcloud dataplex assets create raw-events \
  --lake=sales-lake \
  --zone=raw-zone \
  --location=us-central1 \
  --resource-type=STORAGE_BUCKET \
  --resource-name=projects/my-project/buckets/sales-raw-data

# Attach a BigQuery dataset as an asset
gcloud dataplex assets create curated-analytics \
  --lake=sales-lake \
  --zone=curated-zone \
  --location=us-central1 \
  --resource-type=BIGQUERY_DATASET \
  --resource-name=projects/my-project/datasets/sales_curated
```

### File Format Comparison

| Format | Type | Compression | Schema | Best For |
| --- | --- | --- | --- | --- |
| **Parquet** | Columnar | Excellent (Snappy, GZIP) | Embedded | Analytics, BigQuery external tables, Spark. Best overall for data lakes. |
| **Avro** | Row-based | Good (Snappy, Deflate) | Embedded (JSON) | Streaming ingestion, schema evolution, Dataflow output. Pub/Sub default. |
| **ORC** | Columnar | Excellent (ZLIB, Snappy) | Embedded | Hive/Hadoop workloads, Dataproc. Similar to Parquet. |
| **CSV** | Row-based | None (gzip separately) | None | Simple data exchange. Not recommended for analytics (no types, slow). |
| **JSON (newline-delimited)** | Row-based | None (gzip separately) | Self-describing | APIs, logs, flexible schemas. Readable but verbose. |

>**Exam Tip:** For data lakes, **Parquet** is almost always the right answer for analytics workloads (columnar, compressed, schema-embedded). Use **Avro** for streaming/CDC pipelines where row-oriented access and schema evolution matter. Use **CSV/JSON** only for simple import/export.

## 05. Data Platform Design

### Lakehouse Architecture on GCP

The modern **lakehouse** combines the low-cost storage of a data lake with the managed query engine and governance of a data warehouse. On GCP, this is implemented with:

-   **Cloud Storage** as the storage layer (Parquet/Avro files)
-   **BigLake** for unified governance and fine-grained security
-   **BigQuery** as the compute/query engine (queries both native and external tables)
-   **Dataplex** for metadata management, data quality, and cataloging
-   **Dataproc** for Spark workloads that read/write to the same data

```
-- Lakehouse pattern: Unified query across native and lake data

-- Native BigQuery table (hot/recent data)
SELECT user_id, event_type, amount, event_time
FROM `project.dataset.events_native`
WHERE DATE(event_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)

UNION ALL

-- BigLake table (cold/historical data in GCS)
SELECT user_id, event_type, amount, event_time
FROM `project.dataset.events_lake`
WHERE DATE(event_time) < DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY);
```

>**Architecture Pattern:** A common pattern: recent data (last 90 days) in native BigQuery tables for fast querying. Historical data in Cloud Storage as Parquet files, queried via BigLake external tables. This balances query performance with storage cost. Use **scheduled queries** or Dataform to move data from native to GCS on a rolling basis.

## 06. Exam Tips
>**Scenario: High-Throughput Time-Series:** "Millions of IoT sensors writing data at sub-second intervals, need low-latency reads by device ID." → **Bigtable**. Design row key as `device_id#reverse_timestamp` to avoid hotspotting and enable efficient scans per device.
>**Scenario: Global Financial Application:** "Banking application needs ACID transactions across multiple regions with 99.999% availability." → **Cloud Spanner**. Only GCP database with global strong consistency and five-nines SLA.
>**Scenario: PostgreSQL Migration with Analytics:** "Migrate PostgreSQL workload that also runs complex analytical queries." → **AlloyDB**. PostgreSQL compatible, 100x faster for analytical queries than standard PostgreSQL thanks to its columnar engine.
>**Scenario: Reduce BigQuery Costs:** "Query costs are too high for a large table queried daily by region." → Partition by date, cluster by region, create materialized views for common aggregations, use `require_partition_filter = true`, and switch to Editions pricing with reservations.
>**Scenario: Govern Data Across Lake and Warehouse:** "Apply consistent access controls and quality checks to data in both Cloud Storage and BigQuery." → Use **BigLake** for unified access control and **Dataplex** for metadata management and data quality tasks across both storage systems.

### Quick Selection Cheat Sheet

| Need | Choose |
| --- | --- |
| Petabyte-scale SQL analytics | **BigQuery** |
| High-throughput NoSQL, time-series | **Bigtable** |
| Global ACID transactions | **Cloud Spanner** |
| PostgreSQL with fast analytics | **AlloyDB** |
| Simple MySQL/PG web backend | **Cloud SQL** |
| Mobile/web real-time sync | **Firestore** |
| Sub-ms caching layer | **Memorystore** |
| Cheap object/file storage | **Cloud Storage** |
| Data lake with BQ governance | **BigLake** |
| Cross-system data governance | **Dataplex** |

Previous

[← Ingesting and Processing Data](02-ingesting-processing-data.html)

Next Section

[Preparing and Using Data →](04-preparing-using-data.html)