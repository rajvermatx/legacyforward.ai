---
title: "Designing and Planning a Cloud Solution Architecture"
slug: "designing-cloud-solutions"
description: "The highest-weighted exam section. Master business and technical requirements gathering,
    the Well-Architected Framework, compute/storage/network design, migration planning,
    and AI/ML solution architecture with Gemini, Agent Builder, and Model Garden."
section: "gcp-pca"
order: 1
badges:
  - "Business Requirements"
  - "Well-Architected Framework"
  - "Compute & Network Design"
  - "Migration Planning"
  - "AI/ML Solutions"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-pca/01-designing-cloud-solutions.ipynb"
---

## 01. Requirements Gathering

### Business Requirements

Every architecture decision on the PCA exam traces back to **business requirements**. The exam presents case studies where you must identify constraints before jumping to technical solutions. Key dimensions include:

| Dimension | Questions to Ask | Impact on Architecture |
| --- | --- | --- |
| **Cost** | Budget constraints? OpEx vs CapEx preference? Growth rate? | Serverless vs provisioned, committed use discounts, storage class selection |
| **Compliance** | HIPAA? PCI-DSS? GDPR? SOC 2? Data residency? | Region selection, encryption (CMEK), VPC-SC, audit logging |
| **Time to Market** | MVP timeline? Team velocity? Existing codebase? | Managed services over self-hosted, App Engine/Cloud Run over GKE |
| **Availability** | SLA target? Acceptable downtime? Geographic reach? | Multi-region vs regional, global load balancing, failover design |
| **Scalability** | Expected users? Traffic patterns (bursty vs steady)? | Autoscaling config, database sharding, CDN placement |
| **Security** | Data sensitivity? Zero-trust requirements? Team access model? | IAM design, VPC-SC, IAP, encryption, Secret Manager |

>**Exam Tip:** **Always read the business requirements before the technical ones.** The exam often has answers that are technically correct but violate a business constraint (budget, compliance, timeline). The best answer satisfies both.

### Technical Requirements

Technical requirements define **how** the system must behave. On the exam, you will translate these into specific GCP service selections and configurations.

⚡

#### Latency / Performance

Response time targets drive compute placement, caching strategy (Cloud CDN, Memorystore), database choice (Spanner for global consistency vs Bigtable for low-latency reads).

📊

#### Throughput

Requests per second, data ingestion rate. Impacts load balancer type, Pub/Sub partitioning, Dataflow pipeline sizing, and BigQuery slot reservations.

🔒

#### Durability

Data loss tolerance (RPO). Drives backup strategy, Cloud Storage class, database replication, and cross-region storage configurations.

🔧

#### Maintainability

Team size, skills, operational overhead. Favors managed services, serverless, and IaC (Terraform) for reproducibility and reduced ops burden.

## 02. Google Cloud Well-Architected Framework

### The Five Pillars

The **Google Cloud Well-Architected Framework** provides design principles for building cloud-native systems. The exam heavily references these pillars when evaluating architecture decisions.

| Pillar | Focus Areas | Key GCP Services |
| --- | --- | --- |
| **Operational Excellence** | Automation, monitoring, incident response, CI/CD, IaC | Cloud Build, Cloud Deploy, Cloud Monitoring, Terraform |
| **Security, Privacy & Compliance** | Identity, encryption, network security, compliance controls | IAM, Cloud KMS, VPC-SC, Security Command Center, IAP |
| **Reliability** | High availability, disaster recovery, fault tolerance, resilience | Regional MIGs, Cloud Spanner multi-region, GKE multi-cluster |
| **Cost Optimization** | Right-sizing, committed discounts, autoscaling, storage lifecycle | Recommender, Billing budgets, preemptible/spot VMs, Coldline |
| **Performance Optimization** | Caching, CDN, database tuning, load balancing, compute selection | Cloud CDN, Memorystore, Cloud Load Balancing, TPUs/GPUs |

### Architecture Reviews

Google recommends periodic architecture reviews against the Well-Architected Framework. On the exam, you should recognize when a proposed architecture violates a pillar and suggest the correct remediation.

>**Key Concept:** **Trade-offs are expected.** A multi-region Cloud Spanner deployment maximizes reliability and consistency but costs more than a regional Cloud SQL instance. The exam tests your ability to justify trade-offs based on stated requirements, not pick the most expensive option.

## 03. Compute Design

### GKE vs Cloud Run vs App Engine vs Compute Engine

Compute selection is one of the most-tested topics on the PCA exam. Each service has a sweet spot determined by workload type, team expertise, and operational requirements.

| Criteria | Compute Engine | GKE | Cloud Run | App Engine |
| --- | --- | --- | --- | --- |
| **Abstraction** | IaaS (full VM) | CaaS (containers + K8s) | Serverless containers | PaaS (managed runtime) |
| **Scale to Zero** | No | No (Autopilot scales pods) | Yes | Standard: No; Flex: No |
| **Max Request Timeout** | Unlimited | Unlimited | 60 min | Standard: 10 min; Flex: 60 min |
| **Stateful Workloads** | Yes (persistent disks) | Yes (StatefulSets, PVs) | No (stateless only) | No |
| **GPU/TPU Support** | Yes | Yes (node pools) | GPU preview | No |
| **Ops Overhead** | High (patch, scale) | Medium (K8s complexity) | Low (fully managed) | Low |
| **Best For** | Legacy apps, custom OS, Windows, HPC | Microservices, multi-container, service mesh | HTTP APIs, event-driven, rapid deploy | Web apps, simple APIs, rapid prototyping |

>**Exam Tip:** **Default to the simplest compute that meets requirements.** If a workload is a stateless HTTP API with bursty traffic, Cloud Run is almost always the answer. Only choose GKE when you need K8s-specific features (StatefulSets, service mesh, multi-container pods, DaemonSets).

### Compute Engine Patterns

When VMs are the right choice, key architecture patterns include:

-   **Managed Instance Groups (MIGs)** — autoscaling, autohealing, rolling updates. Use regional MIGs for high availability across zones.
-   **Sole-Tenant Nodes** — physical server isolation for compliance (HIPAA, PCI). Dedicated hardware, no sharing with other tenants.
-   **Spot/Preemptible VMs** — up to 91% cheaper. Use for fault-tolerant batch, data processing, CI/CD runners. Not for production serving.
-   **Custom Machine Types** — right-size vCPU and memory independently. Cost optimization when standard types over-provision.

```
# Create a regional MIG with autoscaling
gcloud compute instance-templates create web-template \
    --machine-type=e2-medium \
    --image-family=debian-12 \
    --image-project=debian-cloud \
    --tags=http-server \
    --metadata=startup-script='#!/bin/bash
apt-get update && apt-get install -y nginx
systemctl start nginx'

gcloud compute instance-groups managed create web-mig \
    --template=web-template \
    --size=2 \
    --region=us-central1 \
    --target-distribution-shape=EVEN

gcloud compute instance-groups managed set-autoscaling web-mig \
    --region=us-central1 \
    --min-num-replicas=2 \
    --max-num-replicas=10 \
    --target-cpu-utilization=0.6 \
    --cool-down-period=90
```

## 04. Storage Design

### Storage Decision Framework

Storage selection depends on **data model** (structured/unstructured), **access pattern** (OLTP/OLAP/streaming), **consistency** requirements, and **scale**.

| Storage Type | Service | Best For | Anti-Pattern |
| --- | --- | --- | --- |
| **Object Storage** | Cloud Storage | Media, backups, data lake, static web | Transactional data, low-latency lookups |
| **Block Storage** | Persistent Disk / Local SSD | VM file systems, databases on VMs | Shared file access, object storage use cases |
| **File Storage** | Filestore / Cloud Storage FUSE | NFS workloads, shared data, legacy lift-and-shift | High-throughput streaming, analytics |
| **Relational (Regional)** | Cloud SQL | Web apps, CMS, traditional OLTP <10TB | Global distribution, horizontal scaling >64TB |
| **Relational (Global)** | Cloud Spanner | Global finance, inventory, gaming leaderboards | Small workloads where Cloud SQL suffices |
| **NoSQL (Document)** | Firestore | Mobile/web apps, user profiles, game state | Analytics, joins, complex transactions |
| **NoSQL (Wide-column)** | Bigtable | IoT time-series, ad tech, financial ticks, >1TB | <1TB data, complex queries, multi-row transactions |
| **Data Warehouse** | BigQuery | Analytics, BI, ML, petabyte-scale OLAP | OLTP workloads, sub-second point lookups |
| **In-Memory Cache** | Memorystore (Redis/Memcached) | Session store, caching, leaderboards, real-time | Durable primary storage |

### Database Selection by Access Pattern

>**Decision Flow:** **Structured + ACID + <10TB + single region?** Cloud SQL.  
> **Structured + ACID + global?** Cloud Spanner.  
> **Document/hierarchical + mobile/web?** Firestore.  
> **Time-series / wide-column + >1TB?** Bigtable.  
> **Analytics/OLAP?** BigQuery.  
> **Unstructured blobs?** Cloud Storage.

```
# Cloud Storage lifecycle policy (cost optimization)
gsutil lifecycle set lifecycle.json gs://my-bucket

# lifecycle.json — transition to Nearline after 30 days, Coldline after 90
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

## 05. Network Design

### VPC Architecture Patterns

Network design on GCP centers around **VPC networks**, which are global resources containing regional subnets. The exam tests your understanding of connectivity models, especially for multi-project and hybrid environments.

| Pattern | Use Case | How It Works | Limitations |
| --- | --- | --- | --- |
| **Shared VPC** | Multi-project, centralized network admin | Host project shares VPC with service projects | Same org only; max 1 host project per service project |
| **VPC Peering** | Cross-org or cross-project connectivity | Direct RFC1918 connectivity between two VPCs | Non-transitive; no overlapping CIDR; max 25 peers |
| **Cloud VPN** | Encrypted tunnel to on-prem or other clouds | IPsec tunnels over public internet | Max 3 Gbps per tunnel (HA VPN); internet-dependent |
| **Cloud Interconnect** | High-bandwidth private on-prem connectivity | Dedicated (10/100 Gbps) or Partner (50 Mbps-50 Gbps) | Higher cost; requires colocation (Dedicated) or partner |
| **Cloud NAT** | Outbound internet for private VMs | NAT gateway for VMs without external IPs | Outbound only; not a load balancer |

>**Exam Tip:** **Shared VPC vs VPC Peering:** If all projects are in the same organization and you want centralized network control, use **Shared VPC**. If connecting across organizations or you need decentralized control, use **VPC Peering**. Remember: VPC Peering is non-transitive (A peers with B, B peers with C, but A cannot reach C through B).

### Hybrid Connectivity Decision

| Requirement | Solution | Bandwidth | Encryption |
| --- | --- | --- | --- |
| **Quick setup, low bandwidth** | Classic VPN | Up to 3 Gbps/tunnel | IPsec (always) |
| **Production, 99.99% SLA** | HA VPN | Up to 3 Gbps/tunnel (multi-tunnel) | IPsec (always) |
| **High bandwidth, consistent latency** | Dedicated Interconnect | 10 or 100 Gbps per link | Not encrypted by default (add MACsec) |
| **Moderate bandwidth, no colocation** | Partner Interconnect | 50 Mbps to 50 Gbps | Not encrypted by default |

```
# Create HA VPN gateway
gcloud compute vpn-gateways create my-ha-vpn \
    --network=my-vpc \
    --region=us-central1

# Create external VPN gateway (on-prem peer)
gcloud compute external-vpn-gateways create on-prem-gw \
    --interfaces 0=203.0.113.1,1=203.0.113.2

# Create Cloud Router for dynamic routing
gcloud compute routers create my-router \
    --network=my-vpc \
    --region=us-central1 \
    --asn=65001
```

## 06. Migration Planning

### Google Cloud Migration Phases

Google recommends a **four-phase migration framework**. The exam tests your ability to identify which phase activities belong to and recommend appropriate tools.

1.  **Assess** — Inventory existing workloads, evaluate TCO, identify dependencies, assess cloud readiness. Tools: Migration Center (formerly StratoZone), Application Discovery.
2.  **Plan** — Define migration strategy per workload, establish landing zone (org hierarchy, networking, IAM), set up foundation infrastructure. Tools: Cloud Foundation Toolkit, Terraform.
3.  **Deploy** — Execute migration, validate functionality, run parallel operations. Tools: Migrate to VMs, Migrate to Containers, Database Migration Service.
4.  **Optimize** — Right-size resources, implement monitoring, automate operations, modernize applications. Tools: Recommender, Active Assist, Cloud Monitoring.

### The 6 Rs of Migration

| Strategy | Definition | When to Use | GCP Tooling |
| --- | --- | --- | --- |
| **Rehost (Lift & Shift)** | Move as-is to cloud VMs | Legacy apps, quick migration, minimal changes | Migrate to VMs |
| **Replatform** | Minor optimizations during migration | Replace self-managed DB with Cloud SQL, move to managed services | Database Migration Service, Cloud SQL |
| **Refactor** | Re-architect for cloud-native | Microservices, containers, serverless target | GKE, Cloud Run, Cloud Functions |
| **Repurchase** | Replace with SaaS/managed service | Email to Workspace, CRM to SaaS | Google Workspace, Marketplace |
| **Retire** | Decommission | Unused or redundant applications | N/A |
| **Retain** | Keep on-premises | Regulatory, latency, or dependency constraints | Hybrid with Anthos, Cloud VPN/Interconnect |

>**Common Mistake:** **Do not default to refactoring everything.** The exam rewards pragmatism. A lift-and-shift with post-migration optimization is often the correct answer when the business requirement emphasizes speed or minimal disruption. Refactoring is justified only when the requirements demand cloud-native features (autoscaling, serverless) or when the existing architecture is fundamentally incompatible.

```
# Terraform landing zone — project factory pattern
module "project-factory" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 15.0"

  name                 = "my-migration-project"
  org_id               = "123456789"
  folder_id            = "folders/456789012"
  billing_account      = "01ABCD-234567-EFGH89"

  activate_apis = [
    "compute.googleapis.com",
    "container.googleapis.com",
    "sqladmin.googleapis.com",
    "monitoring.googleapis.com",
  ]

  shared_vpc         = "host-project-id"
  shared_vpc_subnets = [
    "projects/host-project-id/regions/us-central1/subnetworks/shared-subnet",
  ]
}
```

## 07. AI/ML Solution Architecture

### Gemini and Agent Builder

The PCA exam now includes AI/ML solution design. As a Cloud Architect, you need to recommend the right AI approach based on the use case, not train models yourself.

| Use Case | Recommended Service | Why |
| --- | --- | --- |
| **Chatbot grounded in company docs** | Agent Builder + Vertex AI Search | Managed RAG, no custom ML pipeline needed |
| **Code generation / developer assist** | Gemini Code Assist | IDE integration, security-aware suggestions |
| **Cloud operations assistance** | Gemini Cloud Assist | Natural-language queries about GCP resources, troubleshooting |
| **Custom image classification** | Vertex AI AutoML Vision | Domain-specific labels, no ML expertise required |
| **Text extraction from documents** | Document AI | Pre-trained processors for invoices, receipts, forms |
| **Translation at scale** | Cloud Translation API | 100+ languages, batch and real-time |
| **Custom LLM fine-tuning** | Model Garden + Vertex AI Tuning | Supervised fine-tuning, RLHF, adapter tuning on Gemini/open models |

### Model Garden

Vertex AI Model Garden provides a catalog of **Google models** (Gemini, Imagen, Chirp), **open-source models** (Llama, Mistral, Gemma), and **partner models** (Claude, Cohere). As an architect, you choose based on task, latency, cost, and data governance requirements.

>**Architecture Decision:** **Pre-trained API vs AutoML vs Custom Training vs Foundation Model:** Use pre-trained APIs for common tasks (Vision, NLP, Translation). Use AutoML when you have labeled data for a domain-specific task. Use custom training only when you need full control over architecture. Use foundation models (Gemini) for generative tasks, and ground them with RAG for enterprise data.

```
# Deploy a Gemini model endpoint via gcloud
gcloud ai endpoints create \
    --display-name=gemini-endpoint \
    --region=us-central1

# Create an Agent Builder data store
gcloud discovery-engine data-stores create my-datastore \
    --location=global \
    --collection=default_collection \
    --type=CONTENT

# Import documents to the data store
gcloud discovery-engine documents import \
    --data-store=my-datastore \
    --location=global \
    --collection=default_collection \
    --gcs-uri=gs://my-bucket/docs/
```

## 08. Exam Tips
>**Scenario 1:** **"A company needs to migrate 500 VMs to GCP within 3 months. The apps are legacy .NET and Java with minimal cloud-native readiness..."**  
> Answer: **Rehost (lift-and-shift)** using Migrate to VMs. Replatform databases to Cloud SQL after initial migration. Timeline rules out refactoring.
>**Scenario 2:** **"A financial services company needs a globally consistent database for real-time inventory tracking across 4 continents..."**  
> Answer: **Cloud Spanner** with multi-region configuration. Only GCP database offering global strong consistency with SQL semantics. Cloud SQL read replicas do not provide strong consistency.
>**Scenario 3:** **"A startup with 2 developers needs to deploy a REST API that handles 0-10,000 RPS with unpredictable traffic..."**  
> Answer: **Cloud Run**. Scales to zero (cost), handles burst traffic, minimal ops overhead for small team. GKE is overkill for this scenario.
>**Scenario 4:** **"An enterprise needs to connect 10 GCP projects with centralized network policies managed by a dedicated networking team..."**  
> Answer: **Shared VPC**. Central host project, service projects for workloads. Networking team manages firewall rules and subnets centrally. VPC Peering would decentralize control.
>**Scenario 5:** **"A healthcare company wants to build a patient-facing chatbot that answers questions from medical records, with HIPAA compliance..."**  
> Answer: **Agent Builder** with Vertex AI Search for RAG, grounded in Firestore or Cloud Healthcare API data. VPC-SC perimeter for data protection. BAA with Google Cloud for HIPAA. Do NOT fine-tune models on PHI without proper data governance.
>**General Strategy:** **The PCA exam values pragmatism over perfection.** Choose managed services over self-hosted. Choose serverless when stateless. Choose the simplest solution that meets ALL stated requirements (business + technical + compliance). When two answers are technically valid, the one with lower operational complexity is usually correct.

Previous

[PCA Hub](index.html)

Next Section

[02 · Managing and Provisioning Infrastructure](02-provisioning-infrastructure.html)

Infrastructure Provisioning