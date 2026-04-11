---
title: "Analyzing and Optimizing Processes"
slug: "analyzing-optimizing"
description: "Master SDLC best practices, CI/CD pipeline design, disaster recovery planning,
    stakeholder management, and cost optimization strategies for cloud architectures."
section: "gcp-pca"
order: 4
badges:
  - "SDLC & CI/CD"
  - "Disaster Recovery"
  - "Cost Optimization"
  - "Stakeholder Management"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-pca/04-analyzing-optimizing.ipynb"
---

## 01. SDLC Best Practices

### Development Models on GCP

The PCA exam expects you to recommend development processes, not just infrastructure. Understanding how teams develop, test, and release software on GCP is critical for architecture decisions.

🛠

#### Trunk-Based Development

Short-lived feature branches merged frequently to main. Enables continuous integration. Preferred for Cloud Build + Cloud Deploy pipelines.

🚀

#### GitOps

Git as the single source of truth for infrastructure and app config. Argo CD or Config Sync watches a repo and reconciles cluster state. Ideal for GKE.

📋

#### Environment Promotion

Dev → Staging → Production pipeline with approval gates. Cloud Deploy handles promotion with rollback capabilities.

### Testing Strategy

| Test Type | Scope | GCP Tool | When |
| --- | --- | --- | --- |
| **Unit Tests** | Individual functions | Cloud Build step | Every commit |
| **Integration Tests** | Service interactions | Cloud Build + test containers | Every PR merge |
| **Load Tests** | Performance at scale | Cloud Monitoring + custom (Locust, k6) | Pre-release |
| **Security Scans** | Vulnerabilities | Artifact Registry scanning, SCC | Every build |
| **Canary Analysis** | Production traffic | Cloud Deploy canary strategy | Deployment |

## 02. CI/CD Pipelines

### Cloud Build

Cloud Build is a serverless CI/CD platform. It executes build steps defined in `cloudbuild.yaml` using builder images. Each step runs in its own container.

```
# cloudbuild.yaml — Build, test, push, deploy
steps:
  # Step 1: Run unit tests
  - name: 'python:3.12'
    entrypoint: 'bash'
    args:
      - '-c'
      - 'pip install -r requirements.txt && pytest tests/'

  # Step 2: Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'us-central1-docker.pkg.dev/$PROJECT_ID/my-repo/my-app:$SHORT_SHA', '.']

  # Step 3: Push to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'us-central1-docker.pkg.dev/$PROJECT_ID/my-repo/my-app:$SHORT_SHA']

  # Step 4: Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'my-app'
      - '--image=us-central1-docker.pkg.dev/$PROJECT_ID/my-repo/my-app:$SHORT_SHA'
      - '--region=us-central1'
      - '--platform=managed'

options:
  logging: CLOUD_LOGGING_ONLY

triggers:
  - name: 'push-to-main'
    github:
      owner: 'my-org'
      name: 'my-repo'
      push:
        branch: '^main$'
```

### Cloud Deploy

Cloud Deploy provides **managed continuous delivery** with promotion, approval gates, and rollback. It defines delivery pipelines as code.

```
# cloud-deploy pipeline definition
apiVersion: deploy.cloud.google.com/v1
kind: DeliveryPipeline
metadata:
  name: my-pipeline
serialPipeline:
  stages:
    - targetId: dev
      profiles: [dev]
    - targetId: staging
      profiles: [staging]
      strategy:
        canary:
          runtimeConfig:
            cloudRun:
              automaticTrafficControl: true
          canaryDeployment:
            percentages: [25, 50, 75]
    - targetId: production
      profiles: [production]
      strategy:
        canary:
          runtimeConfig:
            cloudRun:
              automaticTrafficControl: true
          canaryDeployment:
            percentages: [10, 25, 50]
```

### Artifact Registry

Artifact Registry is the successor to Container Registry. It stores Docker images, language packages (npm, pip, Maven), and OS packages. Key features include vulnerability scanning, remote repositories (proxy for Docker Hub, npm), and virtual repositories (single endpoint for multiple repos).

>**Exam Tip:** **Artifact Registry replaces Container Registry.** If a question mentions storing Docker images, the answer is Artifact Registry (not gcr.io). Artifact Registry also supports non-Docker artifacts and has built-in vulnerability scanning.

## 03. Disaster Recovery

### DR Patterns

| Pattern | RPO | RTO | Cost | How It Works |
| --- | --- | --- | --- | --- |
| **Cold Standby** | Hours | Hours to days | Lowest | Backups in another region. Rebuild infrastructure from IaC after disaster. |
| **Warm Standby** | Minutes | Minutes to hours | Medium | Scaled-down replica running in DR region. Scale up on failover. |
| **Hot Standby** | Seconds | Seconds to minutes | Highest | Full replica in DR region with active traffic. Instant failover. |
| **Multi-Region Active-Active** | Near-zero | Near-zero | Highest | Both regions serve traffic. Global load balancer distributes requests. |

### RPO and RTO

**RPO (Recovery Point Objective)** — Maximum acceptable data loss, measured in time. How much data can you afford to lose?

**RTO (Recovery Time Objective)** — Maximum acceptable downtime. How quickly must the system be back online?

| RPO/RTO Target | Database Strategy | Compute Strategy | Cost Tier |
| --- | --- | --- | --- |
| **RPO: 24h, RTO: 24h** | Daily backups to cross-region GCS | IaC (Terraform) rebuild from scratch | $ |
| **RPO: 1h, RTO: 4h** | Continuous backup + PITR (Cloud SQL) | Pre-built images, autoscaled MIG in DR | $$ |
| **RPO: 5min, RTO: 30min** | Cross-region read replicas (promote on failover) | Warm MIGs in DR region, scaled to minimum | $$$ |
| **RPO: 0, RTO: ~0** | Cloud Spanner multi-region or AlloyDB HA | Multi-region GKE, global LB active-active | $$$$ |

>**Common Mistake:** **Do not over-engineer DR.** If the business requirement says RPO of 4 hours is acceptable, do not recommend Cloud Spanner multi-region (near-zero RPO). Match the DR strategy to the stated requirements, not the maximum possible reliability.

## 04. Stakeholder Management

### Communication and Change Management

The PCA exam includes questions about non-technical skills — how to communicate architecture decisions and manage organizational change during cloud adoption.

-   **Executive Stakeholders** — Focus on TCO, risk reduction, competitive advantage. Use business metrics, not technical jargon.
-   **Development Teams** — Focus on developer experience, CI/CD improvements, reduced ops burden. Show migration path and training plan.
-   **Security/Compliance Teams** — Focus on control mechanisms, audit capabilities, compliance certifications. Demonstrate defense in depth.
-   **Operations Teams** — Focus on monitoring, alerting, incident response, IaC. Show how managed services reduce toil.

>**Key Concept:** **Architecture Decision Records (ADRs)** document why specific technology choices were made. The exam values architects who can justify decisions with trade-off analysis, not just pick the "best" technology.

## 05. Cost Optimization

### Compute Cost Savings

| Strategy | Savings | Commitment | Best For |
| --- | --- | --- | --- |
| **Spot VMs** | 60-91% | None (preemptible) | Batch, CI/CD, fault-tolerant workloads |
| **Committed Use Discounts (CUDs)** | Up to 57% | 1 or 3 years | Steady-state production workloads |
| **Sustained Use Discounts (SUDs)** | Up to 30% | None (automatic) | VMs running >25% of the month |
| **Right-Sizing Recommendations** | 10-40% | None | Over-provisioned VMs (Recommender) |
| **Autoscaling** | Variable | None | Variable traffic patterns |
| **Scale to Zero (Cloud Run)** | Up to 100% idle | None | Intermittent workloads |

### Storage Cost Savings

-   **Lifecycle Policies** — Automatically transition objects to cheaper storage classes based on age.
-   **Autoclass** — GCS automatically manages storage classes based on access patterns. Zero configuration.
-   **BigQuery Storage Optimization** — Partitioning (reduce scanned data), clustering (sort optimization), materialized views (pre-computed results).
-   **Nearline/Coldline for Backups** — Use appropriate storage class for backup frequency.

### Cost Management Tools

```
# Set up a billing budget alert
gcloud billing budgets create \
    --billing-account=01ABCD-234567-EFGH89 \
    --display-name="Monthly Budget" \
    --budget-amount=5000 \
    --threshold-rule=percent=50,basis=current-spend \
    --threshold-rule=percent=90,basis=current-spend \
    --threshold-rule=percent=100,basis=current-spend \
    --notifications-rule-pubsub-topic=projects/my-project/topics/billing-alerts

# Export billing to BigQuery for analysis
gcloud billing accounts describe 01ABCD-234567-EFGH89

# View Recommender insights for right-sizing
gcloud recommender insights list \
    --insight-type=google.compute.instance.MachineTypeRecommender \
    --project=my-project \
    --location=us-central1-a
```

>**Exam Tip:** **Cost optimization is about matching resources to requirements, not minimizing cost at all costs.** The exam rewards answers that balance cost with performance and reliability. Spot VMs are cheap but wrong for production databases. CUDs are great for steady workloads but waste money for bursty traffic.

## 06. Exam Tips
>**Scenario 1:** **"A company needs to reduce their cloud spending by 30% without impacting production SLAs..."**  
> Answer: 1) Right-size VMs using Recommender insights. 2) Purchase CUDs for steady-state workloads. 3) Move non-production to Spot VMs. 4) Apply storage lifecycle policies. 5) Use autoscaling to scale down during off-peak. Do NOT recommend reducing redundancy or HA.
>**Scenario 2:** **"An e-commerce company needs DR with less than 15 minutes of data loss and less than 1 hour of downtime..."**  
> Answer: **Warm standby**. Cloud SQL with cross-region read replica (promote on failover, ~5 min RPO from async replication). Minimum-sized MIG in DR region with pre-built images. Global LB for automatic failover. This meets RPO <15 min and RTO <1 hour without the cost of hot standby.
>**Scenario 3:** **"A team wants to implement CI/CD for a microservices application on GKE..."**  
> Answer: **Cloud Build** for CI (build, test, push images to Artifact Registry). **Cloud Deploy** for CD with canary deployment strategy through dev → staging → production targets. Artifact Registry for container image storage with vulnerability scanning enabled.
>**General Strategy:** **For optimization questions, think holistically.** Cost optimization alone is not enough — you must also consider operational efficiency, developer productivity, and reliability. The best architecture optimizes across all dimensions, not just one.

Previous Section

[03 · Security and Compliance](03-security-compliance.html)

Next Section

[05 · Managing Implementation](05-managing-implementation.html)

Implementation Management