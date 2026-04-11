---
title: "Designing for Security and Compliance"
slug: "security-compliance"
description: "Master IAM, resource hierarchy, encryption strategies, VPC Service Controls, Model Armor,
    Identity-Aware Proxy, and compliance frameworks including HIPAA, SOC 2, and data sovereignty."
section: "gcp-pca"
order: 3
badges:
  - "IAM & Resource Hierarchy"
  - "Encryption & Cloud KMS"
  - "VPC Service Controls"
  - "Model Armor & IAP"
  - "Compliance Frameworks"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-pca/03-security-compliance.ipynb"
---

## 01. IAM Deep Dive

### Role Types

Google Cloud IAM uses a **role-based access control (RBAC)** model. Understanding the three role types and when to use each is critical for the exam.

| Role Type | Example | When to Use | Exam Guidance |
| --- | --- | --- | --- |
| **Basic (Primitive)** | roles/owner, roles/editor, roles/viewer | Development, prototyping only | Almost never the right answer. Too broad for production. |
| **Predefined** | roles/storage.objectViewer, roles/compute.instanceAdmin | Most production scenarios | Default choice. Google-maintained, least-privilege aligned. |
| **Custom** | projects/my-project/roles/customDataReader | When predefined roles are too broad or too narrow | Only when no predefined role matches. Higher maintenance. |

>**Exam Tip:** **Never recommend roles/editor or roles/owner in production.** If a question says "a developer needs to deploy Cloud Run services," the answer is `roles/run.developer`, not `roles/editor`. The exam always prefers the most restrictive predefined role that satisfies the requirement.

### Resource Hierarchy and Policy Inheritance

IAM policies are **inherited down the hierarchy**: Organization → Folder → Project → Resource. A binding at the organization level applies to all projects beneath it.

-   **Organization** — Top level. Org Admin sets organization-wide policies. Tied to a Cloud Identity domain.
-   **Folders** — Group projects by team, environment, or business unit. Apply policies to all projects in a folder.
-   **Projects** — Contain resources. Billing boundary. Most common level for IAM bindings.
-   **Resources** — Individual GCS buckets, BigQuery datasets, etc. Finest-grained IAM binding.

>**Key Concept:** **Organization Policy Constraints** are different from IAM policies. They restrict what can be done regardless of IAM permissions. Example: `constraints/gcp.resourceLocations` restricts which regions resources can be created in. Even an org admin cannot override a deny policy.

### Service Accounts

Service accounts are identities for workloads (VMs, containers, Cloud Functions), not humans. The exam tests best practices for service account management.

-   **Workload Identity (GKE)** — Maps K8s service accounts to GCP service accounts. Eliminates the need for exported keys.
-   **Attached Service Accounts** — VMs and Cloud Run services use attached SAs instead of key files.
-   **Short-lived Credentials** — Use `generateAccessToken` for temporary access instead of persistent keys.
-   **Key Rotation** — If keys are absolutely necessary, rotate every 90 days. Prefer avoiding keys entirely.

```
# Create a service account with minimal permissions
gcloud iam service-accounts create cloud-run-sa \
    --display-name="Cloud Run Service Account"

# Grant specific role (not editor!)
gcloud projects add-iam-policy-binding my-project \
    --member="serviceAccount:cloud-run-sa@my-project.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

# Deploy Cloud Run with the service account
gcloud run deploy my-api \
    --service-account=cloud-run-sa@my-project.iam.gserviceaccount.com \
    --image=gcr.io/my-project/my-api:v1

# Workload Identity binding for GKE
gcloud iam service-accounts add-iam-policy-binding \
    cloud-run-sa@my-project.iam.gserviceaccount.com \
    --role="roles/iam.workloadIdentityUser" \
    --member="serviceAccount:my-project.svc.id.goog[my-namespace/my-ksa]"
```

## 02. Encryption

### Encryption Layers

| Layer | What It Protects | Who Manages Keys | GCP Service |
| --- | --- | --- | --- |
| **Default Encryption (Google-managed)** | Data at rest, all GCP services | Google (automatic) | Built-in, no configuration |
| **CMEK (Customer-Managed Encryption Keys)** | Data at rest with customer key control | Customer (via Cloud KMS) | Cloud KMS + service integration |
| **CSEK (Customer-Supplied Encryption Keys)** | Compute Engine disks only | Customer (keys never stored in GCP) | Compute Engine API |
| **Client-Side Encryption** | Data before it reaches GCP | Customer (application-level) | Application code + Tink library |
| **Encryption in Transit** | Data moving between services | Google (TLS by default) | Automatic TLS, mTLS with service mesh |

### Cloud KMS

Cloud KMS is the central key management service. It supports **symmetric** (AES-256-GCM) and **asymmetric** (RSA, EC) keys, automatic key rotation, and integration with most GCP services via CMEK.

```
# Create a key ring and key for CMEK
gcloud kms keyrings create my-keyring \
    --location=us-central1

gcloud kms keys create my-key \
    --keyring=my-keyring \
    --location=us-central1 \
    --purpose=encryption \
    --rotation-period=90d \
    --next-rotation-time=2026-06-01T00:00:00Z

# Create a Cloud SQL instance with CMEK
gcloud sql instances create my-db \
    --database-version=POSTGRES_15 \
    --tier=db-custom-4-16384 \
    --region=us-central1 \
    --disk-encryption-key=projects/my-project/locations/us-central1/keyRings/my-keyring/cryptoKeys/my-key

# Create a BigQuery dataset with CMEK
bq mk --dataset \
    --default_kms_key=projects/my-project/locations/us-central1/keyRings/my-keyring/cryptoKeys/my-key \
    my-project:encrypted_dataset
```

>**Important:** **CMEK key and resource must be in the same region.** If your Cloud SQL instance is in `us-central1`, the KMS key must also be in `us-central1` (or `us` multi-region, or `global`). Cross-region CMEK is not supported for most services.

## 03. Network Security

### VPC Service Controls

VPC Service Controls create a **security perimeter** around GCP resources to prevent data exfiltration. Even a user with `roles/owner` cannot copy data out of a perimeter to an external project.

-   **Service Perimeter** — Defines which projects and services are protected. API calls from outside the perimeter are blocked.
-   **Access Levels** — Allow specific exceptions (IP ranges, device trust, identity) to cross the perimeter.
-   **Ingress/Egress Rules** — Fine-grained policies for specific API methods, identities, and resources crossing the perimeter.
-   **Bridge Perimeters** — Allow communication between two regular perimeters.

```
# Create an access policy
gcloud access-context-manager policies create \
    --organization=123456789 \
    --title="Production Security"

# Create a service perimeter
gcloud access-context-manager perimeters create prod-perimeter \
    --policy=POLICY_ID \
    --title="Production Perimeter" \
    --resources="projects/12345,projects/67890" \
    --restricted-services="storage.googleapis.com,bigquery.googleapis.com" \
    --access-levels="accessPolicies/POLICY_ID/accessLevels/corp-vpn"
```

### Identity-Aware Proxy (IAP)

IAP provides **zero-trust access** to applications without a VPN. It verifies user identity and context (device, location) before granting access. Supported for App Engine, Cloud Run, GKE, and Compute Engine backends behind an HTTP(S) Load Balancer.

>**Architecture Pattern:** **IAP + Internal-Only Backends:** Deploy your app on internal-only Compute Engine VMs or GKE pods. Enable IAP on the external HTTP(S) LB. Users authenticate through IAP without needing VPN access or external IPs on backends. This is the preferred zero-trust pattern.

### Cloud Armor

Cloud Armor provides DDoS protection and WAF capabilities. It operates at the edge of Google's network and only integrates with the **External HTTP(S) Load Balancer**.

```
# Create a Cloud Armor security policy
gcloud compute security-policies create my-policy \
    --description="Production WAF policy"

# Block traffic from specific countries
gcloud compute security-policies rules create 1000 \
    --security-policy=my-policy \
    --expression="origin.region_code == 'CN' || origin.region_code == 'RU'" \
    --action=deny-403

# Add OWASP Top 10 protection
gcloud compute security-policies rules create 2000 \
    --security-policy=my-policy \
    --expression="evaluatePreconfiguredWaf('sqli-v33-stable')" \
    --action=deny-403

# Rate limiting
gcloud compute security-policies rules create 3000 \
    --security-policy=my-policy \
    --src-ip-ranges="*" \
    --action=throttle \
    --rate-limit-threshold-count=100 \
    --rate-limit-threshold-interval-sec=60 \
    --conform-action=allow \
    --exceed-action=deny-429
```

## 04. AI/ML Security

### Model Armor

**Model Armor** protects generative AI workloads from adversarial attacks. It provides input sanitization and output filtering for Vertex AI endpoints and Gemini API calls.

🛡

#### Prompt Injection Defense

Detects and blocks attempts to manipulate model behavior through crafted prompts. Filters jailbreak patterns and instruction override attempts.

🔎

#### Output Filtering

Scans model responses for harmful content, PII leakage, and off-topic responses. Configurable sensitivity thresholds per use case.

📊

#### Audit Logging

Logs all model interactions for compliance. Records prompts, responses, filtering decisions, and user context for post-hoc analysis.

### Data Governance for AI

When designing AI solutions, architects must consider data governance:

-   **Training Data Provenance** — Document data sources, consent, and licensing for training data.
-   **VPC-SC for AI Pipelines** — Place Vertex AI resources inside a service perimeter to prevent model and data exfiltration.
-   **CMEK for Models** — Encrypt model artifacts with customer-managed keys in Cloud KMS.
-   **DLP Integration** — Use Cloud DLP to redact PII from training data and model inputs/outputs.

## 05. Compliance Frameworks

### HIPAA

For healthcare workloads handling Protected Health Information (PHI):

-   **Business Associate Agreement (BAA)** — Must be signed with Google Cloud before processing PHI.
-   **Covered Services** — Only services listed in the BAA may process PHI (Compute Engine, GKE, Cloud Storage, BigQuery, Cloud SQL, etc.).
-   **Encryption** — CMEK required for PHI at rest. TLS for transit.
-   **Audit Logging** — Enable Data Access audit logs on all services handling PHI.
-   **VPC-SC** — Create perimeters around PHI-processing projects.

### SOC 2

SOC 2 compliance focuses on security, availability, processing integrity, confidentiality, and privacy. Google Cloud services are SOC 2 audited. Your responsibility as architect:

-   Implement proper IAM (least privilege, no basic roles in production)
-   Enable audit logging (Admin Activity + Data Access logs)
-   Use Organization Policy constraints to enforce security baselines
-   Deploy Security Command Center for continuous vulnerability scanning

### Data Sovereignty

Data sovereignty requires data to remain within specific geographic boundaries. GCP tools for enforcement:

| Control | How It Works | Scope |
| --- | --- | --- |
| **Resource Location Constraint** | `constraints/gcp.resourceLocations` org policy | Prevents resource creation outside allowed regions |
| **Regional Resources** | Choose regional (not multi-region) for sensitive data | Per-resource configuration |
| **Assured Workloads** | Creates a compliance-controlled environment with guardrails | Project-level, supports FedRAMP, ITAR, EU sovereignty |
| **VPC-SC** | Prevents data from being copied to unauthorized projects | Organization-level perimeters |

```
# Organization policy: restrict resource locations to EU
# policy.yaml
constraint: constraints/gcp.resourceLocations
listPolicy:
  allowedValues:
    - in:europe-west1-locations
    - in:europe-west4-locations

# Apply the policy to a folder
gcloud resource-manager org-policies set-policy policy.yaml \
    --folder=123456789
```

## 06. Security Command Center

**Security Command Center (SCC)** is Google Cloud's centralized security and risk management platform. The exam tests your understanding of its tiers and capabilities.

| Feature | Standard Tier (Free) | Premium Tier |
| --- | --- | --- |
| **Security Health Analytics** | Basic misconfigurations | 140+ detectors, CIS benchmarks |
| **Event Threat Detection** | Not included | Log-based threat detection (malware, crypto mining) |
| **Container Threat Detection** | Not included | Runtime threat detection in GKE |
| **Web Security Scanner** | Basic scans | Managed scans, authentication support |
| **Compliance Monitoring** | Not included | CIS, PCI-DSS, NIST 800-53 benchmarks |
| **Attack Path Simulation** | Not included | Identifies high-value asset exposure paths |

>**Exam Tip:** **SCC Premium is required for compliance monitoring.** If a question mentions CIS benchmarks, PCI-DSS compliance scanning, or threat detection, the answer involves SCC Premium tier. Standard tier only covers basic security health analytics.

## 07. Exam Tips
>**Scenario 1:** **"A company needs to prevent developers from accidentally making Cloud Storage buckets public..."**  
> Answer: Organization Policy constraint `constraints/iam.allowedPolicyMemberDomains` to restrict to corporate domain, plus `storage.publicAccessPrevention` set to `enforced` at the org level.
>**Scenario 2:** **"A data analytics team needs to share BigQuery datasets with a partner organization without allowing data to be copied outside..."**  
> Answer: **VPC Service Controls** with authorized datasets. Create a service perimeter, add BigQuery to restricted services, define ingress rules for the partner's identity. Data stays within the perimeter.
>**Scenario 3:** **"A retail company wants to secure their internal admin portal without requiring employees to use a VPN..."**  
> Answer: **Identity-Aware Proxy (IAP)** on an External HTTP(S) Load Balancer fronting the internal app. Employees authenticate via Google Identity, IAP enforces context-aware access policies. Zero-trust, no VPN needed.
>**Scenario 4:** **"A financial services company deploying generative AI needs to protect against prompt injection and PII leakage..."**  
> Answer: **Model Armor** for input/output filtering, **Cloud DLP** for PII detection and redaction, **VPC-SC** around Vertex AI resources, and audit logging on all model API calls.
>**Security Best Practices Summary:** 1\. **Least privilege** — Predefined roles, not basic roles.  
> 2\. **Defense in depth** — VPC-SC + IAM + encryption + monitoring.  
> 3\. **No exported keys** — Workload Identity, attached SAs, short-lived tokens.  
> 4\. **Encrypt everything** — CMEK for sensitive data, default encryption for everything else.  
> 5\. **Log everything** — Admin Activity + Data Access audit logs, export to SIEM.

Previous Section

[02 · Provisioning Infrastructure](02-provisioning-infrastructure.html)

Next Section

[04 · Analyzing and Optimizing](04-analyzing-optimizing.html)

Process Optimization