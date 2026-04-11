---
title: "Modernize Infrastructure and Applications"
slug: "infrastructure-apps"
description: "Learn about cloud migration strategies, compute options from VMs to serverless,
    container orchestration with GKE, API management, and hybrid/multicloud with Anthos."
section: "gcp-cdl"
order: 4
badges:
  - "Migration strategies"
  - "Compute Engine & GKE"
  - "Cloud Run & serverless"
  - "Containers & APIs"
  - "Anthos hybrid/multicloud"
---

## 1. Cloud Migration Strategies

Organizations migrating to the cloud follow different strategies based on their applications, timelines, and goals. Google Cloud and industry analysts identify several common migration patterns, often called the **"6 Rs"** of migration.

| Strategy | Description | When to Use | Effort |
| --- | --- | --- | --- |
| **Rehost** (Lift & Shift) | Move as-is to cloud VMs | Quick wins, legacy apps with no changes | Low |
| **Replatform** (Lift & Optimize) | Minor optimizations during move | Use managed services (e.g., Cloud SQL instead of self-managed MySQL) | Low-Medium |
| **Refactor** (Re-architect) | Redesign for cloud-native | Take advantage of microservices, containers, serverless | High |
| **Repurchase** | Replace with SaaS | Move from on-prem email to Google Workspace | Medium |
| **Retire** | Decommission the application | App no longer needed | Low |
| **Retain** | Keep on-premises | Regulatory requirements, not ready to migrate | None |

>**Google Cloud Migration Tools:** **Migrate to Virtual Machines** (formerly Migrate for Compute Engine) automates lift-and-shift of VMs from on-premises, AWS, or Azure to Compute Engine. **Migrate to Containers** converts VMs into containers for GKE. **Database Migration Service** handles database migrations to Cloud SQL or AlloyDB.

### Migration Phases

1.  **Assess** — Inventory workloads, assess dependencies, determine TCO, identify migration candidates.
2.  **Plan** — Choose migration strategy per workload, design target architecture, plan network connectivity.
3.  **Deploy** — Set up foundation (VPC, IAM, billing), migrate workloads in waves, validate functionality.
4.  **Optimize** — Right-size resources, implement autoscaling, apply cost controls, modernize further.

## 2. Compute Engine

**Compute Engine** provides virtual machines (VMs) running on Google's infrastructure. It is the IaaS compute service — you have full control over the operating system, networking, and installed software.

### Machine Type Families

| Family | Description | Use Cases |
| --- | --- | --- |
| **E2** (General) | Cost-optimized, shared-core options | Dev/test, small apps, microservices |
| **N2/N2D** (General) | Balanced compute, Intel/AMD | Web servers, databases, medium workloads |
| **C2/C2D** (Compute) | Highest per-core performance | Gaming, HPC, single-threaded apps |
| **M2/M3** (Memory) | Ultra-high memory (up to 12 TB) | SAP HANA, in-memory databases |
| **A2/A3** (Accelerator) | GPU-attached (NVIDIA A100/H100) | ML training, rendering, simulations |

### Key Compute Engine Features

L

#### Live Migration

Google migrates running VMs between physical hosts during maintenance with zero downtime. Unique to Google Cloud — no reboot required.

P

#### Preemptible/Spot VMs

60-91% discount for interruptible workloads. Google can reclaim with 30s notice. Ideal for batch processing, CI/CD, fault-tolerant jobs.

A

#### Autoscaling (MIGs)

Managed Instance Groups automatically add/remove VMs based on CPU, memory, or custom metrics. Combined with load balancers for HA.

S

#### Sole-Tenant Nodes

Dedicated physical servers for compliance requirements. No hardware sharing with other tenants. Bring your own licenses (BYOL).

```
# Create a VM instance
gcloud compute instances create web-server \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --tags=http-server

# Create a managed instance group with autoscaling
gcloud compute instance-groups managed create my-mig \
  --template=my-template \
  --size=2 \
  --zone=us-central1-a

gcloud compute instance-groups managed set-autoscaling my-mig \
  --max-num-replicas=10 \
  --target-cpu-utilization=0.6 \
  --zone=us-central1-a
```

## 3. Containers and Google Kubernetes Engine (GKE)

**Containers** package an application with all its dependencies into a portable, lightweight unit that runs consistently across environments. **Docker** is the most common container runtime. **Kubernetes** is the open-source system for orchestrating (managing) containers at scale.

### Containers vs. VMs

| Aspect | Virtual Machines | Containers |
| --- | --- | --- |
| Isolation | Full OS per VM (strong isolation) | Shared OS kernel (process isolation) |
| Size | Gigabytes (includes full OS) | Megabytes (app + dependencies only) |
| Startup | Minutes | Seconds |
| Portability | Limited (OS-dependent) | High (runs anywhere Docker runs) |
| Density | 10s per host | 100s per host |
| Use case | Legacy apps, full OS control needed | Microservices, CI/CD, cloud-native apps |

### GKE — Google Kubernetes Engine

**GKE** is Google's managed Kubernetes service. Google manages the control plane (API server, scheduler, etcd) while you manage the worker nodes and workloads. GKE Autopilot goes further by also managing the nodes.

| Feature | GKE Standard | GKE Autopilot |
| --- | --- | --- |
| Node management | You manage nodes | Google manages nodes |
| Pricing | Pay for nodes (VMs) | Pay per pod (resources used) |
| Configuration | Full control over node pools | Best practices enforced |
| Security | You configure hardening | Hardened by default |
| Best for | Teams needing custom node config | Teams wanting fully managed K8s |

```
# Create a GKE Autopilot cluster
gcloud container clusters create-auto my-cluster \
  --region=us-central1

# Deploy an application
kubectl create deployment hello-app \
  --image=us-docker.pkg.dev/google-samples/containers/gke/hello-app:1.0

# Expose it as a service
kubectl expose deployment hello-app \
  --type=LoadBalancer \
  --port=80 \
  --target-port=8080
```

>**Exam Tip:** GKE is the answer when you need **container orchestration at scale**. If you just need to run a single container without managing Kubernetes, use **Cloud Run** instead.

## 4. Serverless Compute

**Serverless** means Google manages all infrastructure — servers, scaling, patching, and capacity planning. You focus only on your code. Google Cloud offers three main serverless compute options.

R

#### Cloud Run

Run stateless containers with automatic scaling (including to zero). Supports any language/framework. Pay per request. Best for HTTP services, APIs, web apps.

F

#### Cloud Functions

Event-driven functions (FaaS). Write a single function triggered by HTTP, Pub/Sub, Cloud Storage events. Pay per invocation. Best for glue code, webhooks, lightweight processing.

A

#### App Engine

Fully managed platform for web applications. Standard environment (sandboxed, fast scaling) and Flexible environment (custom runtimes, Docker). Best for traditional web apps.

| Feature | Cloud Run | Cloud Functions | App Engine |
| --- | --- | --- | --- |
| Unit of deployment | Container image | Single function | Application |
| Language support | Any (container-based) | Node, Python, Go, Java, .NET, Ruby, PHP | Standard: Python, Java, Go, PHP, Node, Ruby. Flexible: any |
| Scale to zero | Yes | Yes | Standard: Yes. Flexible: Min 1 instance |
| Max timeout | 60 min | 9 min (1st gen) / 60 min (2nd gen) | Varies |
| Concurrency | Up to 1000 requests per instance | 1 per instance (1st gen) / configurable (2nd gen) | Automatic |

>**Decision Guide:** **Cloud Run** is the default serverless choice for most new workloads (containers, any language, scale to zero). Use **Cloud Functions** for simple event handlers. Use **App Engine** for legacy web apps or when you want an opinionated web framework.

## 5. Compute Options Comparison

| Service | Model | Control | Scaling | Best For |
| --- | --- | --- | --- | --- |
| **Compute Engine** | IaaS (VMs) | Full (OS, network, storage) | Manual or MIG autoscaler | Legacy apps, custom OS, GPU/TPU workloads |
| **GKE** | CaaS (Containers) | High (pods, nodes, networking) | HPA + cluster autoscaler | Microservices at scale, multi-container apps |
| **Cloud Run** | Serverless containers | Low (just container image) | Auto (0 to N instances) | Stateless HTTP services, APIs |
| **Cloud Functions** | FaaS | Lowest (just function code) | Auto per invocation | Event handlers, glue code, webhooks |
| **App Engine** | PaaS | Low-Medium | Auto | Web apps, RESTful backends |

>**Exam Decision Flow:** Need full OS control? → **Compute Engine**. Need container orchestration at scale? → **GKE**. Want serverless containers? → **Cloud Run**. Just a function? → **Cloud Functions**. Traditional web app? → **App Engine**.

## 6. API Management with Apigee

**Apigee** is Google Cloud's full-lifecycle API management platform. It helps organizations design, secure, deploy, monitor, and monetize APIs. APIs are the building blocks of modern application architectures and microservices.

### Why APIs Matter

-   **Microservices architecture** — Services communicate via APIs, enabling independent development and deployment.
-   **Partner integrations** — Expose business capabilities to partners securely via APIs.
-   **Mobile/web backends** — APIs serve as the backend for mobile apps and single-page web applications.
-   **Monetization** — Treat APIs as products with rate limiting, usage tracking, and billing.

### Apigee Key Features

P

#### API Proxies

Facade layer that decouples API consumers from backend services. Apply policies for security, transformation, caching, and rate limiting without changing backend code.

A

#### Analytics

Monitor API traffic, latency, error rates, and developer adoption. Identify performance bottlenecks and usage patterns.

D

#### Developer Portal

Self-service portal for API consumers. Documentation, API key registration, sandbox testing, and community forums.

>**Cloud Endpoints vs. Apigee:** **Cloud Endpoints** is a lightweight API gateway for GCP-hosted backends (simpler, lower cost). **Apigee** is the enterprise-grade platform with advanced analytics, monetization, and multi-cloud support. For the CDL exam, Apigee is the answer for "enterprise API management."

## 7. Hybrid and Multicloud with Anthos

**Anthos** is Google Cloud's platform for managing applications across multiple environments: on-premises data centers, Google Cloud, and other public clouds (AWS, Azure). It provides a consistent development and operations experience everywhere.

### Anthos Components

| Component | Purpose |
| --- | --- |
| **Anthos on GKE** | Managed Kubernetes on Google Cloud (the foundation) |
| **Anthos on-premises** | Run GKE on your own hardware in your data center |
| **Anthos on AWS/Azure** | Attach and manage Kubernetes clusters on other clouds |
| **Anthos Service Mesh** | Managed Istio for service-to-service communication, security, and observability |
| **Anthos Config Management** | GitOps-based policy and configuration management across all clusters |
| **Migrate to Containers** | Automatically containerize VMs for migration to GKE |

>**Exam Tip:** Anthos is the answer whenever the exam mentions **hybrid cloud, multicloud, consistent management across environments**, or running Kubernetes on-premises. It provides a "single pane of glass" for managing workloads everywhere.

### Hybrid Connectivity

-   **Cloud VPN** — Encrypted IPsec tunnel over the internet. Quick to set up, lower cost, but throughput limited by internet bandwidth.
-   **Cloud Interconnect (Dedicated)** — Direct physical connection to Google's network. 10 or 100 Gbps. Lowest latency and highest throughput. Requires colocation facility.
-   **Cloud Interconnect (Partner)** — Connection through a supported service provider. Lower bandwidth than dedicated but easier to set up.

## 8. Exam Tips
>**Exam Strategy:** Section 4 (~17%) tests **compute service selection** and **migration strategies**. Know the difference between lift-and-shift (Compute Engine), containerize (GKE/Cloud Run), and serverless (Cloud Functions). Match the migration strategy (6 Rs) to the scenario.

### Quick Reference

-   "Move VMs to cloud without changes" → **Rehost (Compute Engine)**
-   "Run containers without managing servers" → **Cloud Run**
-   "Orchestrate 100s of microservices in containers" → **GKE**
-   "Run same workloads on-prem and in cloud" → **Anthos**
-   "Manage and secure APIs at enterprise scale" → **Apigee**
-   "Connect on-prem to GCP with high bandwidth" → **Cloud Interconnect**
-   "What is unique about Google Cloud VMs?" → **Live migration (zero-downtime maintenance)**

[

Previous

AI & ML

](03-ai-ml.html)[

Next Section

Trust & Security

](05-trust-security.html)