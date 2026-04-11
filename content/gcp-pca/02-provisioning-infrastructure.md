---
title: "Managing and Provisioning Cloud Infrastructure"
slug: "provisioning-infrastructure"
description: "Deep dive into network topologies, storage systems, compute platforms, Vertex AI ML workflows,
    and prebuilt AI solutions. Learn to configure and manage GCP infrastructure at scale."
section: "gcp-pca"
order: 2
badges:
  - "Network Topologies"
  - "Storage Systems"
  - "Compute Platforms"
  - "Vertex AI Workflows"
  - "Prebuilt AI APIs"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-pca/02-provisioning-infrastructure.ipynb"
---

## 01. Network Topologies

### Load Balancing

Google Cloud offers **six types of load balancers**. The exam frequently tests your ability to select the right type based on protocol, scope (global vs regional), and backend type.

| Load Balancer | Protocol | Scope | Backends | Use Case |
| --- | --- | --- | --- | --- |
| **External HTTP(S)** | HTTP/HTTPS/HTTP2 | Global | MIGs, NEGs, GCS buckets | Web apps, APIs, CDN integration |
| **External SSL Proxy** | SSL/TLS | Global | MIGs, NEGs | Non-HTTP SSL traffic |
| **External TCP Proxy** | TCP | Global | MIGs, NEGs | Non-HTTP TCP traffic |
| **External TCP/UDP (Network)** | TCP/UDP | Regional | MIGs, target pools | Gaming, UDP workloads, IP preservation |
| **Internal HTTP(S)** | HTTP/HTTPS | Regional | MIGs, NEGs | Internal microservices, service mesh |
| **Internal TCP/UDP** | TCP/UDP | Regional | MIGs | Internal databases, protocol passthrough |

>**Exam Tip:** **Cloud Armor only works with External HTTP(S) Load Balancer.** If a question mentions DDoS protection or WAF rules, the architecture must use an external HTTP(S) LB as the frontend. Internal LBs and Network LBs do not support Cloud Armor.

### Cloud DNS and CDN

**Cloud DNS** is a managed authoritative DNS service. It supports public and private zones, DNSSEC, DNS peering, and split-horizon DNS (different responses for internal vs external queries).

**Cloud CDN** caches content at Google's edge locations. It integrates exclusively with the External HTTP(S) Load Balancer. Key configuration points include cache modes (CACHE\_ALL\_STATIC, USE\_ORIGIN\_HEADERS, FORCE\_CACHE\_ALL) and signed URLs/cookies for access control.

```
# Enable Cloud CDN on a backend service
gcloud compute backend-services update my-backend \
    --enable-cdn \
    --cache-mode=CACHE_ALL_STATIC \
    --default-ttl=3600 \
    --max-ttl=86400 \
    --global

# Create a Cloud DNS managed zone
gcloud dns managed-zones create my-zone \
    --dns-name=example.com. \
    --description="Production DNS zone" \
    --dnssec-state=on

# Add an A record
gcloud dns record-sets create www.example.com. \
    --zone=my-zone \
    --type=A \
    --ttl=300 \
    --rrdatas=34.120.1.1
```

## 02. Storage Systems

### Cloud Storage Classes and Lifecycle

| Class | Min Duration | Access Cost | Storage Cost | Use Case |
| --- | --- | --- | --- | --- |
| **Standard** | None | Lowest | Highest | Frequently accessed data, hot data |
| **Nearline** | 30 days | Low | Medium | Monthly access, backups |
| **Coldline** | 90 days | Medium | Low | Quarterly access, disaster recovery |
| **Archive** | 365 days | Highest | Lowest | Yearly access, compliance archives |

### Data Transfer Options

| Method | Data Size | Source | Key Feature |
| --- | --- | --- | --- |
| **gsutil / gcloud storage** | <1 TB | Local, GCS | CLI, parallel uploads, resumable |
| **Storage Transfer Service** | Any | AWS S3, Azure, HTTP, GCS | Scheduled, cross-cloud, managed |
| **Transfer Appliance** | 20-300 TB | On-premises | Physical device, offline transfer |
| **BigQuery Data Transfer** | Any | SaaS (GA, Ads), S3 | Direct to BigQuery tables |

>**Decision Rule:** **Over 1 Gbps sustained upload?** Use Storage Transfer Service or Transfer Appliance. **Cross-cloud (AWS/Azure)?** Storage Transfer Service. **One-time offline?** Transfer Appliance.

```
# Create a dual-region bucket with Autoclass
gcloud storage buckets create gs://my-autoclass-bucket \
    --location=US \
    --default-storage-class=STANDARD \
    --enable-autoclass \
    --uniform-bucket-level-access

# Enable versioning and retention policy
gcloud storage buckets update gs://my-autoclass-bucket \
    --versioning \
    --retention-period=90d
```

## 03. Compute Systems

### GKE Deep Dive

GKE is the most complex compute platform on the PCA exam. You must understand the differences between **Autopilot** and **Standard** modes, node pool strategies, and cluster networking.

| Feature | GKE Autopilot | GKE Standard |
| --- | --- | --- |
| **Node Management** | Fully managed by Google | You manage node pools |
| **Pricing** | Per pod (CPU/memory/ephemeral) | Per node (VM pricing) |
| **GPU Support** | Yes (via resource requests) | Yes (GPU node pools) |
| **DaemonSets** | Limited (Google-managed only) | Full support |
| **Privileged Containers** | Not allowed | Allowed |
| **SSH to Nodes** | Not allowed | Allowed |
| **SLA** | 99.95% (regional) | 99.95% (regional), 99.5% (zonal) |
| **Best For** | Teams wanting zero node ops | Teams needing full K8s control |

```
# Create a GKE Autopilot cluster
gcloud container clusters create-auto my-autopilot \
    --region=us-central1 \
    --release-channel=regular \
    --enable-private-nodes \
    --master-ipv4-cidr=172.16.0.0/28

# Create a GKE Standard cluster with custom node pool
gcloud container clusters create my-standard \
    --region=us-central1 \
    --num-nodes=2 \
    --enable-autoscaling --min-nodes=1 --max-nodes=5 \
    --machine-type=e2-standard-4 \
    --enable-ip-alias \
    --workload-pool=my-project.svc.id.goog

# Add a GPU node pool
gcloud container node-pools create gpu-pool \
    --cluster=my-standard \
    --region=us-central1 \
    --machine-type=n1-standard-8 \
    --accelerator=type=nvidia-tesla-t4,count=1 \
    --num-nodes=0 \
    --enable-autoscaling --min-nodes=0 --max-nodes=3
```

### Cloud Run Configuration

Cloud Run deploys stateless containers with automatic scaling. Key configuration decisions include concurrency, CPU allocation, and VPC connectivity.

```
# Deploy a Cloud Run service with VPC connector
gcloud run deploy my-api \
    --image=gcr.io/my-project/my-api:v1 \
    --platform=managed \
    --region=us-central1 \
    --memory=512Mi \
    --cpu=1 \
    --concurrency=80 \
    --min-instances=1 \
    --max-instances=100 \
    --vpc-connector=my-connector \
    --vpc-egress=private-ranges-only \
    --set-env-vars=DB_HOST=10.0.0.5 \
    --allow-unauthenticated

# Create a VPC Access connector for Cloud Run
gcloud compute networks vpc-access connectors create my-connector \
    --region=us-central1 \
    --network=my-vpc \
    --range=10.8.0.0/28
```

>**Important:** **Cloud Run CPU allocation:** By default, CPU is only allocated during request processing. For background tasks or websockets, set `--cpu-always-on`. This changes pricing from per-request to per-instance.

## 04. Vertex AI ML Workflows

### Training Pipelines

As a Cloud Architect, you design the infrastructure for ML workflows rather than writing model code. Key decisions include compute selection, data pipeline design, and model serving architecture.

📊

#### AutoML

Zero-code model training. Provide labeled data, Vertex AI handles architecture search and hyperparameter tuning. Best for teams without ML expertise.

🔧

#### Custom Training

Bring your own training code (TensorFlow, PyTorch, scikit-learn). Full control over architecture, hyperparameters, distributed training with GPUs/TPUs.

⚡

#### Vertex AI Pipelines

Orchestrate ML workflows as directed acyclic graphs. Built on Kubeflow Pipelines or TFX. Supports scheduling, caching, and lineage tracking.

📈

#### Feature Store

Centralized feature management. Prevents training-serving skew by serving the same features in both training and inference contexts.

### Model Serving

| Serving Mode | Latency | Scale | Best For |
| --- | --- | --- | --- |
| **Online Prediction** | Low (ms) | Autoscaling endpoints | Real-time APIs, user-facing predictions |
| **Batch Prediction** | High (min-hours) | Temporary compute | Scoring large datasets, nightly jobs |
| **Edge Prediction** | Ultra-low | Device-level | IoT, mobile, offline inference |

## 05. Prebuilt AI Solutions and APIs

### API Catalog

| API | Input | Capabilities | Common Use Cases |
| --- | --- | --- | --- |
| **Cloud Vision** | Images | Label detection, OCR, face detection, landmark, safe search | Content moderation, image tagging, receipt scanning |
| **Cloud Natural Language** | Text | Sentiment, entities, syntax, classification | Review analysis, content categorization |
| **Cloud Speech-to-Text** | Audio | Transcription, streaming, speaker diarization | Call center analytics, voice commands |
| **Cloud Text-to-Speech** | Text | Neural voices, SSML, multiple languages | Accessibility, IVR systems |
| **Cloud Translation** | Text | 100+ languages, glossaries, batch translation | Localization, multilingual support |
| **Cloud Video Intelligence** | Video | Label detection, shot change, object tracking, text detection | Media cataloging, compliance monitoring |

### Document AI

**Document AI** provides pre-trained and custom document processors. It extracts structured data from invoices, receipts, tax forms, contracts, and lending documents. Key architectural consideration: Document AI processes run in specific regions — choose the region closest to your data for compliance and latency.

>**Architecture Decision:** **Vision API OCR vs Document AI:** Use Vision API for simple text extraction from images. Use Document AI when you need structured data extraction (key-value pairs, tables, entity recognition from forms). Document AI includes specialized processors for invoices, W-2s, driver's licenses, etc.

## 06. Infrastructure Provisioning

### gcloud Patterns

The `gcloud` CLI is essential for managing GCP resources. The exam may test you on correct command syntax and flag usage for common provisioning tasks.

```
# Create a VPC with custom subnets
gcloud compute networks create prod-vpc \
    --subnet-mode=custom

gcloud compute networks subnets create web-subnet \
    --network=prod-vpc \
    --region=us-central1 \
    --range=10.0.1.0/24 \
    --enable-private-ip-google-access

gcloud compute networks subnets create db-subnet \
    --network=prod-vpc \
    --region=us-central1 \
    --range=10.0.2.0/24 \
    --enable-private-ip-google-access

# Create firewall rules
gcloud compute firewall-rules create allow-http \
    --network=prod-vpc \
    --allow=tcp:80,tcp:443 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=http-server

gcloud compute firewall-rules create allow-internal \
    --network=prod-vpc \
    --allow=tcp,udp,icmp \
    --source-ranges=10.0.0.0/16
```

### Terraform Patterns

```
# Terraform — GKE cluster with Workload Identity
resource "google_container_cluster" "primary" {
  name     = "production-cluster"
  location = "us-central1"

  # Remove default node pool, create custom ones
  remove_default_node_pool = true
  initial_node_count       = 1

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-pool"
  cluster    = google_container_cluster.primary.id
  node_count = 2

  autoscaling {
    min_node_count = 1
    max_node_count = 10
  }

  node_config {
    machine_type = "e2-standard-4"
    disk_size_gb = 100
    disk_type    = "pd-ssd"

    oauth_scopes = ["https://www.googleapis.com/auth/cloud-platform"]

    workload_metadata_config {
      mode = "GKE_METADATA"
    }
  }
}
```

## 07. Exam Tips
>**Scenario 1:** **"A media company needs to serve static assets globally with the lowest latency..."**  
> Answer: **Cloud Storage + External HTTP(S) Load Balancer + Cloud CDN**. GCS backend buckets behind the LB, CDN caching at edge. Signed URLs for access control.
>**Scenario 2:** **"A team needs to migrate a MySQL database with minimal downtime from on-prem to GCP..."**  
> Answer: **Database Migration Service (DMS)** with continuous replication. Set up Cloud SQL as destination, configure DMS for continuous migration, cutover when caught up. Near-zero downtime.
>**Scenario 3:** **"An IoT platform ingests 1 million events per second and needs sub-10ms reads for the last 24 hours of data..."**  
> Answer: **Cloud Bigtable** for time-series storage (high write throughput, low-latency reads with row key design). Pub/Sub for ingestion, Dataflow for stream processing into Bigtable.
>**Scenario 4:** **"A company wants GKE with the least operational overhead and no need for DaemonSets or privileged containers..."**  
> Answer: **GKE Autopilot**. Fully managed node infrastructure, per-pod pricing, built-in security hardening. Standard mode is only needed for DaemonSets, SSH access, or privileged containers.
>**General Strategy:** **For provisioning questions, think automation first.** The exam favors Terraform and IaC over manual gcloud commands. For one-time tasks, gcloud is fine. For reproducible infrastructure, Terraform is always the better answer.

Previous Section

[01 · Designing Cloud Solutions](01-designing-cloud-solutions.html)

Next Section

[03 · Security and Compliance](03-security-compliance.html)

Security & Compliance