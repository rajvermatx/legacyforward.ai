---
title: "Designing Data Processing Systems"
slug: "designing-data-systems"
description: "Covers roughly 22% of the exam. Design for security and compliance, reliability and fidelity,
    flexibility and portability, and plan data migrations. Master IAM, encryption, Dataflow,
    Dataform, Cloud Data Fusion, and migration services."
section: "gcp-pde"
order: 1
badges:
  - "Security & Compliance"
  - "Reliability & Fidelity"
  - "Flexibility & Portability"
  - "Data Migrations"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-pde/01-designing-data-systems.ipynb"
---

## 01. Security and Compliance

### IAM and Access Control

Google Cloud Identity and Access Management (IAM) follows the principle of **least privilege**. Permissions are grouped into **roles**, and roles are bound to **members** (users, groups, service accounts) at a specific **resource level** (organization, folder, project, or individual resource).

| Role Type | Description | Example |
| --- | --- | --- |
| **Basic Roles** | Owner, Editor, Viewer. Very broad. Avoid in production. | `roles/editor` |
| **Predefined Roles** | Granular, service-specific roles managed by Google. | `roles/bigquery.dataViewer` |
| **Custom Roles** | User-defined set of permissions for maximum precision. | `roles/custom.dataAnalyst` |

For data engineering, key IAM considerations include **BigQuery dataset-level access**, **column-level security** via policy tags, and **row-level security** with `CREATE ROW ACCESS POLICY`.

```
-- BigQuery row-level security
CREATE ROW ACCESS POLICY region_filter
ON `project.dataset.sales`
GRANT TO ("group:us-analysts@example.com")
FILTER USING (region = 'US');

-- Column-level security with policy tags
-- Applied via Data Catalog taxonomy in the console
-- Then grant access to the policy tag:
-- roles/datacatalog.categoryFineGrainedReader
```

>**Exam Tip:** When a question mentions "users should only see data for their region" or "restrict PII columns to specific teams," think **row-level access policies** and **column-level policy tags** respectively. These are the primary BigQuery fine-grained security mechanisms.

### Encryption Options

All data in Google Cloud is encrypted at rest by default using **Google-managed encryption keys (GMEK)**. For additional control, you can choose between Customer-Managed Encryption Keys (CMEK) and Customer-Supplied Encryption Keys (CSEK).

| Option | Key Management | Use Case | Supported Services |
| --- | --- | --- | --- |
| **GMEK** | Google manages everything | Default, no compliance requirements | All GCP services |
| **CMEK** | You control keys in Cloud KMS | Regulatory compliance, key rotation control | BigQuery, Cloud Storage, Dataflow, Bigtable, Spanner, Dataproc |
| **CSEK** | You supply keys per API call | Maximum control, keys never stored by Google | Cloud Storage, Compute Engine disks only |
| **Cloud EKM** | Keys in external key manager | Keys must never reside in Google infrastructure | BigQuery, Cloud Storage, GKE, Compute Engine |

```
# Create a CMEK-protected BigQuery dataset
bq mk --dataset \
  --default_kms_key=projects/my-proj/locations/us/keyRings/my-ring/cryptoKeys/my-key \
  my-proj:secure_dataset

# Create a CMEK-encrypted Cloud Storage bucket
gsutil kms encryption \
  -k projects/my-proj/locations/us/keyRings/my-ring/cryptoKeys/my-key \
  gs://my-secure-bucket
```

### PII and Data Governance

**Sensitive Data Protection** (formerly Cloud DLP) provides APIs for discovering, classifying, and protecting sensitive data. It supports 150+ built-in infoTypes for PII detection and offers multiple de-identification techniques.

#### Masking

Replace characters with a fixed character (e.g., \*\*\*\*). Simple but irreversible. Use for display purposes.

#### Tokenization (CryptoReplace)

Replace with a cryptographic token. Reversible with the key. Maintains referential integrity across tables.

#### Bucketing

Replace exact values with ranges (e.g., age 27 becomes "20-30"). Reduces granularity while preserving analytical value.

#### Date Shifting

Shift dates by a random number of days. Preserves intervals between events for the same individual.

### Data Sovereignty and Residency

Data sovereignty requirements dictate where data can be stored and processed. GCP offers multiple mechanisms to enforce data residency:

-   **Dataset/Bucket location** — BigQuery datasets and Cloud Storage buckets are created in specific regions or multi-regions
-   **Organization policies** — `constraints/gcp.resourceLocations` restricts which regions resources can be created in
-   **VPC Service Controls** — Creates security perimeters around GCP resources to prevent data exfiltration
-   **Assured Workloads** — Automates compliance controls for regulated industries (FedRAMP, HIPAA, PCI DSS)

>**Important:** BigQuery multi-region locations (US, EU) keep data within the specified geographic boundary. For stricter requirements, use single-region locations (e.g., europe-west1). VPC Service Controls add a perimeter to prevent data from leaving the project boundary.

## 02. Reliability and Fidelity

### Dataform and SQLX Workflows

**Dataform** is BigQuery's native SQL transformation service. It uses **SQLX** (an extension of SQL) with dependency management, testing, and documentation. Dataform brings software engineering best practices to data transformation: version control, CI/CD, and automated testing.

```
-- Dataform SQLX: Define a transformation with dependencies
-- File: definitions/staging/stg_orders.sqlx

config {
  type: "view",
  schema: "staging",
  description: "Staged orders with data quality filters",
  assertions: {
    uniqueKey: ["order_id"],
    nonNull: ["order_id", "customer_id", "order_date"]
  }
}

SELECT
  order_id,
  customer_id,
  order_date,
  ROUND(total_amount, 2) AS total_amount,
  status,
  CURRENT_TIMESTAMP() AS _loaded_at
FROM ${ref("raw_orders")}
WHERE order_id IS NOT NULL
  AND total_amount > 0
```

```
-- Dataform SQLX: Incremental table
-- File: definitions/marts/fct_daily_revenue.sqlx

config {
  type: "incremental",
  schema: "marts",
  uniqueKey: ["order_date", "region"],
  bigquery: {
    partitionBy: "order_date",
    clusterBy: ["region"]
  }
}

SELECT
  DATE(order_date) AS order_date,
  region,
  COUNT(DISTINCT order_id) AS num_orders,
  SUM(total_amount) AS total_revenue,
  AVG(total_amount) AS avg_order_value
FROM ${ref("stg_orders")}
${when(incremental(), `WHERE order_date > (SELECT MAX(order_date) FROM ${self()})`) }
GROUP BY 1, 2
```

### Data Validation Strategies

Data validation ensures that data flowing through pipelines meets quality expectations. This includes **schema validation**, **business rule checks**, and **statistical validation**.

| Validation Type | Tool | Example Check |
| --- | --- | --- |
| **Schema validation** | Dataform assertions, Dataflow schemas | Non-null, type checks, unique keys |
| **Business rules** | Dataform assertions, BigQuery SQL | Amount > 0, date in valid range |
| **Statistical checks** | Dataplex data quality tasks | Row count within expected range, distribution checks |
| **Cross-dataset** | BigQuery scheduled queries | Referential integrity, row count reconciliation |
| **Freshness** | Dataplex, Cloud Monitoring | Data updated within last 4 hours |

```
-- Dataplex data quality YAML specification
rules:
  - column: order_id
    dimension: uniqueness
    threshold: 1.0
  - column: total_amount
    dimension: validity
    sql_expression: "total_amount > 0 AND total_amount < 1000000"
    threshold: 0.99
  - column: order_date
    dimension: freshness
    sql_expression: "order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY)"
    threshold: 0.95
  - dimension: completeness
    sql_expression: "order_id IS NOT NULL AND customer_id IS NOT NULL"
    threshold: 1.0
```

### ACID Guarantees Across GCP Services

Understanding ACID (Atomicity, Consistency, Isolation, Durability) behavior across services is critical for choosing the right storage:

| Service | ACID Support | Scope | Notes |
| --- | --- | --- | --- |
| **Cloud Spanner** | Full ACID | Global, multi-region | Externally consistent (strongest guarantee) |
| **Cloud SQL / AlloyDB** | Full ACID | Single region | Traditional RDBMS transactions |
| **Firestore** | Full ACID | Multi-region | Transactions on up to 500 documents |
| **BigQuery** | ACID per DML | Per-table | Each DML statement is atomic. Multi-statement transactions supported. |
| **Bigtable** | Row-level atomic | Single row | No multi-row transactions. Designed for high throughput. |
| **Cloud Storage** | Object-level atomic | Single object | Strong global consistency for reads-after-writes |

>**Exam Tip:** If a scenario needs globally distributed ACID transactions, the answer is almost always **Cloud Spanner**. If it is a single-region transactional workload with PostgreSQL compatibility, think **AlloyDB**. BigQuery handles ACID at the DML statement level with support for multi-statement transactions using `BEGIN TRANSACTION`.

## 03. Flexibility and Portability

### Multi-Cloud and Hybrid Strategies

GCP provides several approaches for multi-cloud and hybrid data processing:

#### BigQuery Omni

Query data in AWS S3 or Azure Blob Storage directly from BigQuery using cross-cloud connections. No data movement required.

#### Apache Beam Portability

Write pipelines once, run on Dataflow (GCP), Spark, or Flink. The Beam SDK abstracts the runner, enabling cloud portability.

#### Anthos / GKE Enterprise

Run containerized data workloads consistently across GCP, on-premises, and other clouds with Kubernetes.

#### Dataproc on GKE

Run Spark workloads on GKE clusters for Kubernetes-native scheduling, bin-packing, and multi-tenancy.

```
-- BigQuery Omni: Query S3 data from BigQuery
CREATE EXTERNAL TABLE `project.dataset.s3_sales`
WITH CONNECTION `aws-us-east-1.my-connection`
OPTIONS (
  format = 'PARQUET',
  uris = ['s3://my-bucket/sales/*.parquet']
);

SELECT region, SUM(revenue) AS total_revenue
FROM `project.dataset.s3_sales`
GROUP BY region
ORDER BY total_revenue DESC;
```

### Data Governance with Dataplex

**Dataplex** provides a unified data fabric for organizing, managing, and governing data across data lakes, data warehouses, and data marts. Key concepts:

-   **Lakes** — Logical grouping of data representing a business domain
-   **Zones** — Subdivisions within a lake (raw zone, curated zone) with data format expectations
-   **Assets** — Mapped Cloud Storage buckets or BigQuery datasets
-   **Data quality tasks** — Automated quality checks defined in YAML
-   **Auto-discovery** — Automatically catalogs and classifies data assets

>**Key Concept:** Dataplex does not move or copy data. It provides a governance layer on top of existing storage. Data stays in Cloud Storage or BigQuery; Dataplex adds metadata, access control, and quality checks as a virtual fabric.

## 04. Data Migrations

### BigQuery Data Transfer Service

The BigQuery Data Transfer Service automates data loading into BigQuery from SaaS applications (Google Ads, YouTube, etc.), Amazon S3, Amazon Redshift, and Teradata. It runs on a schedule and handles incremental transfers.

```
# Create a scheduled transfer from S3 to BigQuery
bq mk --transfer_config \
  --project_id=my-project \
  --data_source=amazon_s3 \
  --target_dataset=imported_data \
  --display_name="Daily S3 Import" \
  --schedule="every 24 hours" \
  --params='{
    "destination_table_name_template": "s3_events_{run_date}",
    "data_path": "s3://source-bucket/events/*.parquet",
    "access_key_id": "AKIAIOSFODNN7EXAMPLE",
    "file_format": "PARQUET"
  }'
```

### Database Migration Service (DMS)

DMS provides **continuous replication** from source databases to GCP managed databases. It supports homogeneous migrations (MySQL to Cloud SQL for MySQL) and heterogeneous migrations (Oracle to Cloud SQL for PostgreSQL, or to AlloyDB).

| Source | Target | Migration Type |
| --- | --- | --- |
| MySQL (on-prem/RDS) | Cloud SQL for MySQL | Homogeneous, continuous |
| PostgreSQL (on-prem/RDS) | Cloud SQL for PostgreSQL, AlloyDB | Homogeneous, continuous |
| SQL Server | Cloud SQL for SQL Server | Homogeneous, continuous |
| Oracle | Cloud SQL for PostgreSQL, AlloyDB | Heterogeneous |
| MySQL / PostgreSQL | Cloud Spanner | Heterogeneous (via Harbourbridge) |

>**Best Practice:** For minimal-downtime migrations: (1) Set up continuous replication with DMS, (2) Let it catch up to the source, (3) Promote the replica when ready. The cutover window can be seconds to minutes instead of hours.

### Datastream for Change Data Capture (CDC)

**Datastream** is a serverless CDC and replication service. Unlike DMS (which targets managed databases), Datastream streams changes into **BigQuery** or **Cloud Storage** for analytics.

```
# Datastream architecture flow:
# Source DB (Oracle/MySQL/PostgreSQL/AlloyDB)
#   |
#   v [CDC via log reading]
# Datastream
#   |
#   v [Real-time streaming]
# BigQuery (merge tables) or Cloud Storage (Avro/JSON files)
#   |
#   v [Optional: Dataflow template for processing]
# Final destination (cleaned, transformed)
```

>**Exam Tip:** Know the difference: **DMS** migrates databases to Cloud SQL/AlloyDB/Spanner (operational databases). **Datastream** replicates changes to BigQuery/Cloud Storage (analytics). **BigQuery Data Transfer Service** imports from SaaS apps, S3, Redshift, and Teradata into BigQuery.

## 05. Cloud Data Fusion

### Visual ETL Pipeline Builder

Cloud Data Fusion is a fully managed, **code-free** data integration service built on the open-source CDAP platform. It provides a visual drag-and-drop interface for building ETL/ELT pipelines with 200+ pre-built connectors and transformations.

#### Data Fusion Basic

For simple ETL pipelines. Includes visual pipeline designer, built-in transforms, and basic scheduling. Cost-effective for standard workloads.

#### Data Fusion Enterprise

Adds data lineage, metadata management, integration with Dataproc, advanced security (CMEK), and high availability for production workloads.

#### Wrangler

Interactive data preparation tool within Data Fusion. Point-and-click data cleansing, transformations, and profiling before building pipelines.

#### Pipeline Studio

Drag-and-drop canvas with sources, transforms, sinks, and error handlers. Pipelines compile to MapReduce or Spark jobs on Dataproc.

Data Fusion pipelines execute on **Dataproc clusters** under the hood. You can configure ephemeral (auto-created) or persistent clusters based on workload patterns.

>**When to Use What:** **Data Fusion**: When your team needs a visual, code-free ETL tool with enterprise connectors (SAP, Salesforce, etc.). **Dataflow**: When you need custom streaming/batch pipelines with Apache Beam code. **Dataform**: When transformations are SQL-only within BigQuery (ELT pattern).

## 06. Architecture Patterns

### Lambda vs Kappa Architecture

Two foundational patterns for data processing systems:

| Pattern | Description | GCP Implementation | When to Use |
| --- | --- | --- | --- |
| **Lambda** | Separate batch and speed layers, merged in serving layer | Batch: Dataflow batch + BQ. Speed: Dataflow streaming + BQ streaming buffer | When batch and streaming have different accuracy requirements |
| **Kappa** | Single streaming pipeline handles everything. Replay from event log for reprocessing. | Pub/Sub + Dataflow streaming + BigQuery | When a single pipeline can serve both real-time and historical needs |

### Data Mesh Principles on GCP

Data mesh decentralizes data ownership to domain teams while maintaining interoperability:

-   **Domain ownership** — Each team owns their data products (BigQuery datasets with quality SLAs)
-   **Data as a product** — Datasets published with documentation, SLAs, and access patterns via Analytics Hub
-   **Self-serve platform** — Dataplex provides the federated governance layer across domains
-   **Federated governance** — Central policies (encryption, PII handling) with domain-specific implementation

```
-- Data mesh pattern: Domain team publishes a data product
-- Step 1: Create a curated, documented dataset
CREATE SCHEMA `sales-domain.product_catalog`
OPTIONS (
  description = "Sales domain data product: Product catalog with daily refresh",
  labels = [("domain", "sales"), ("tier", "gold"), ("sla", "daily")]
);

-- Step 2: Share via Analytics Hub
-- Create a listing in Analytics Hub for cross-domain consumption
-- Consumers get a linked dataset (zero-copy, governed access)
```

>**Architecture Decision:** For the exam, remember: **Analytics Hub** enables the "data as a product" principle of data mesh by providing governed data sharing. **Dataplex** enables the "federated governance" principle by providing cross-domain metadata management and quality enforcement.

## 07. Exam Tips and Scenarios
>**Scenario: Data Sovereignty:** "A company must keep all customer data within the EU." → Use EU multi-region or single EU region for BigQuery datasets and Cloud Storage buckets. Apply organization policy constraints on resource locations. Use VPC Service Controls for perimeter security.
>**Scenario: Minimal-Downtime Migration:** "Migrate an on-premises MySQL database to GCP with minimal downtime." → Use **Database Migration Service (DMS)** for continuous replication. Set up a Cloud SQL for MySQL target. DMS handles initial full dump + ongoing CDC until cutover.
>**Scenario: Real-Time Analytics from OLTP:** "Stream changes from an operational PostgreSQL database into BigQuery for real-time dashboards." → Use **Datastream** for CDC from PostgreSQL to BigQuery. Datastream creates merge tables that reflect the latest state of the source.
>**Scenario: Code-Free ETL:** "A team of data analysts (non-programmers) needs to build ETL pipelines from SAP to BigQuery." → Use **Cloud Data Fusion** with its visual pipeline designer and pre-built SAP connector. Enterprise edition for lineage tracking.
>**Scenario: SQL Transformations in BQ:** "Manage complex SQL transformations in BigQuery with version control and testing." → Use **Dataform** with SQLX, git integration, assertions for data quality, and scheduled execution.
>**Scenario: PII Detection:** "Automatically scan and de-identify PII in a data lake before it reaches analysts." → Use **Sensitive Data Protection (Cloud DLP)** API with inspection jobs for discovery and de-identification templates for masking/tokenization. Integrate with a Dataflow pipeline for automated processing.

### Key Comparisons to Memorize

| Question | Answer |
| --- | --- |
| Migrate database to managed DB? | **Database Migration Service (DMS)** |
| Stream database changes to BQ/GCS? | **Datastream** (CDC) |
| Import from SaaS/S3/Redshift to BQ? | **BigQuery Data Transfer Service** |
| Code-free ETL with visual builder? | **Cloud Data Fusion** |
| SQL transformations in BQ? | **Dataform** |
| Custom streaming/batch pipeline? | **Dataflow** (Apache Beam) |
| Fine-grained column security in BQ? | **Policy tags** (Data Catalog) |
| Row-level security in BQ? | **Row access policies** |
| Unified data governance across lakes? | **Dataplex** |
| Share BQ datasets across orgs? | **Analytics Hub** |

Next Section

[Ingesting and Processing Data →](02-ingesting-processing-data.html)