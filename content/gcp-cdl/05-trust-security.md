---
title: "Trust and Security with Google Cloud"
slug: "trust-security"
description: "Understand cybersecurity fundamentals, Google's defense-in-depth approach, encryption, identity
    and access management, network security, and compliance frameworks on Google Cloud."
section: "gcp-cdl"
order: 5
badges:
  - "Cybersecurity threats"
  - "Encryption at rest & in transit"
  - "IAM & identity"
  - "Cloud Armor & DDoS"
  - "Compliance & governance"
---

## 1. Cybersecurity Threats

Understanding common security threats is fundamental to the CDL exam. Google Cloud provides services to defend against each type, but the customer must understand the threat landscape to configure protections appropriately.

| Threat | Description | Google Cloud Defense |
| --- | --- | --- |
| **DDoS** | Flood service with traffic to overwhelm it | Cloud Armor, Google Front End, global load balancing |
| **Phishing** | Trick users into revealing credentials | Titan Security Keys, 2FA, BeyondCorp, Advanced Protection |
| **Ransomware** | Encrypt data and demand payment | Backup/DR, immutable storage, Security Command Center |
| **Data breach** | Unauthorized access to sensitive data | IAM, VPC Service Controls, DLP API, encryption |
| **Insider threat** | Malicious or negligent employee actions | IAM least privilege, Audit Logs, Access Transparency |
| **Supply chain attack** | Compromise software dependencies | Binary Authorization, Artifact Registry, Software Delivery Shield |
| **Malware** | Malicious software (viruses, trojans) | Chronicle SIEM, VirusTotal, Cloud IDS |

>**Key Concept:** Security is a **shared responsibility** (see Section 1). Google secures the infrastructure, but you must properly configure IAM, firewall rules, encryption keys, and access policies. Most cloud security breaches are caused by **misconfiguration**, not infrastructure vulnerabilities.

## 2. Google's Defense in Depth

Google uses a **defense-in-depth** strategy with multiple layers of security controls. If one layer is compromised, additional layers continue to protect the system.

1

#### Hardware & Physical

Custom-designed servers with Titan security chip (hardware root of trust). Purpose-built data centers with biometric access, guards, and layered perimeters.

2

#### Service Deployment

Every service identity is cryptographically authenticated. Services communicate using mutual TLS. No trust based on network location.

3

#### Data Storage

All data encrypted at rest by default (AES-256). Encryption keys managed by Google KMS with automatic rotation. Customer-managed keys (CMEK) available.

4

#### Internet Communication

Google Front End (GFE) terminates TLS/SSL. Automatic DDoS protection. Certificate management. HTTPS enforced by default.

5

#### Operations

Intrusion detection systems, security monitoring, incident response teams, red team exercises, and bug bounty programs.

6

#### User Identity

Multi-factor authentication, phishing-resistant security keys, BeyondCorp zero-trust model. Access decisions based on user + device + context.

## 3. Encryption on Google Cloud

Google Cloud encrypts data automatically at multiple levels. Understanding encryption options is critical for the CDL exam, especially the differences between Google-managed, customer-managed, and customer-supplied encryption keys.

### Encryption at Rest

All data stored on Google Cloud is encrypted by default using **AES-256**. The encryption hierarchy uses multiple layers of keys:

-   **Data Encryption Key (DEK)** — Encrypts the actual data. Unique per data chunk.
-   **Key Encryption Key (KEK)** — Encrypts the DEK. Managed by Cloud KMS.
-   **Root key** — Protects the KEKs. Stored in Google's key management infrastructure.

### Key Management Options

| Option | Who Manages Keys | Control Level | Use Case |
| --- | --- | --- | --- |
| **Google-managed (default)** | Google | No customer action needed | Most workloads — automatic, transparent |
| **CMEK (Customer-Managed)** | Customer via Cloud KMS | Control key rotation, access, and lifecycle | Regulatory requirements, audit trails |
| **CSEK (Customer-Supplied)** | Customer provides keys directly | Full control — Google never stores keys | Maximum control, highest operational burden |
| **EKM (External Key Manager)** | Customer's external KMS | Keys never enter Google infrastructure | Sovereignty requirements, data residency |

### Encryption in Transit

All data moving between Google data centers is encrypted using **ALTS** (Application Layer Transport Security), Google's internal protocol. Data from users to Google services is encrypted via **TLS/HTTPS**. This is automatic and cannot be disabled.

>**Exam Tip:** Remember: **Google encrypts all data at rest by default** (no configuration needed). CMEK gives you control over key lifecycle. CSEK gives you maximum control but highest operational burden. EKM keeps keys outside Google entirely.

## 4. Identity and Access Management (IAM)

**Cloud IAM** controls who (identity) can do what (role) on which resource. It is the foundation of Google Cloud security and follows the **principle of least privilege** — grant only the minimum permissions needed.

### IAM Components

| Component | Description | Examples |
| --- | --- | --- |
| **Member (Principal)** | Who is requesting access | Google Account, Service Account, Google Group, Cloud Identity domain |
| **Role** | Collection of permissions | roles/viewer, roles/editor, roles/owner, roles/bigquery.dataEditor |
| **Policy** | Binds members to roles on a resource | "user:alice@example.com has roles/storage.objectViewer on bucket-x" |
| **Resource** | What is being accessed | Project, bucket, dataset, VM instance |

### Role Types

B

#### Basic Roles

**Owner, Editor, Viewer**. Broad permissions across all services. Avoid in production — too permissive. Use only for quick prototyping or personal projects.

P

#### Predefined Roles

Fine-grained, service-specific roles (e.g., `roles/bigquery.dataEditor`). Created and maintained by Google. **Best practice for most use cases.**

C

#### Custom Roles

User-defined roles with specific permissions. For when predefined roles are too broad. Requires ongoing maintenance as new permissions are added.

### Service Accounts

A **service account** is a special account used by applications and VMs (not humans) to authenticate to Google Cloud APIs. It represents the identity of a workload, not a person.

```
# Create a service account
gcloud iam service-accounts create my-app-sa \
  --display-name="My Application Service Account"

# Grant a role to the service account
gcloud projects add-iam-policy-binding my-project \
  --member="serviceAccount:my-app-sa@my-project.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"

# List all IAM bindings for a project
gcloud projects get-iam-policy my-project
```

>**Security Best Practices:** **Least privilege**: Use predefined roles, not basic roles. **Service accounts**: Do not use default service accounts in production; create dedicated ones. **Groups**: Assign roles to Google Groups, not individual users, for easier management.

### Resource Hierarchy

IAM policies are inherited down the resource hierarchy:

```

  [ Organization ] ── org-level policies apply to everything below
       |
  [  Folder  ] ── department or team grouping
       |
  [  Project  ] ── billing boundary, resource container
       |
  [ Resources ] ── VMs, buckets, datasets, etc.
        
```

IAM policies inherit downward: Organization → Folder → Project → Resource

>**Key Concept:** A policy set at the **organization level** applies to every project and resource in the org. A policy at the **folder level** applies to all projects in that folder. You **cannot restrict** at a lower level what was granted at a higher level (policies are additive).

## 5. Network Security

Google Cloud provides multiple layers of network security to protect workloads from external and internal threats.

V

#### VPC (Virtual Private Cloud)

Isolated network environment for your resources. Define subnets, routes, and firewall rules. VPC is global (spans all regions); subnets are regional.

F

#### Firewall Rules

Stateful packet inspection rules that allow or deny traffic. Applied at the VM level. Support for network tags and service account-based targeting.

A

#### Cloud Armor

DDoS protection and WAF for HTTP(S) load balancers. Geo-based blocking, rate limiting, preconfigured OWASP top 10 rules, adaptive protection.

S

#### VPC Service Controls

Create security perimeters around Google Cloud resources. Prevent data exfiltration even if IAM is misconfigured. Controls API-level access to services like BigQuery and Cloud Storage.

### Cloud Armor in Detail

**Cloud Armor** works with Google Cloud's global HTTP(S) load balancer to provide defense against DDoS attacks and application-layer threats.

-   **Preconfigured WAF rules** — Block OWASP Top 10 attacks (SQL injection, XSS, etc.).
-   **IP allowlist/denylist** — Allow or block traffic from specific IPs or CIDR ranges.
-   **Geo-based policies** — Block traffic from specific countries or regions.
-   **Rate limiting** — Throttle requests per client to prevent abuse.
-   **Adaptive Protection** — ML-based anomaly detection that automatically generates rules for detected attacks.

## 6. Security Operations Services

| Service | Purpose | Key Capability |
| --- | --- | --- |
| **Security Command Center (SCC)** | Security posture management | Asset inventory, vulnerability scanning, threat detection, compliance monitoring |
| **Chronicle SIEM** | Security information & event management | Petabyte-scale log analysis, threat hunting, 12-month retention |
| **Cloud DLP** | Data loss prevention | Discover, classify, and de-identify sensitive data (PII, credit cards, etc.) |
| **Cloud Audit Logs** | Activity logging | Who did what, where, when. Admin Activity (always on) and Data Access logs |
| **Access Transparency** | Google employee access logging | Logs when Google personnel access your data for support (enterprise feature) |
| **Binary Authorization** | Deploy-time security | Only allow trusted container images to deploy to GKE/Cloud Run |
| **Secret Manager** | Secrets management | Store and manage API keys, passwords, certificates with versioning and audit |
| **Cloud IDS** | Intrusion detection | Network-based threat detection using Palo Alto Networks engine |

>**SCC Tiers:** **SCC Standard** (free): Asset inventory, security health analytics, web security scanner. **SCC Premium**: Adds Event Threat Detection, Container Threat Detection, Virtual Machine Threat Detection, and compliance reporting (CIS, PCI DSS, etc.).

## 7. Compliance and Governance

Google Cloud maintains a comprehensive set of compliance certifications and supports customers in meeting their own regulatory requirements. The CDL exam tests awareness of key frameworks and how Google Cloud helps achieve compliance.

### Key Compliance Frameworks

| Framework | Region/Industry | Covers |
| --- | --- | --- |
| **SOC 1/2/3** | Global | Internal controls over financial reporting (SOC 1), security/availability/confidentiality (SOC 2) |
| **ISO 27001** | Global | Information security management systems (ISMS) |
| **GDPR** | European Union | Data protection and privacy for EU residents |
| **HIPAA** | United States | Protected health information (PHI) in healthcare |
| **PCI DSS** | Global | Payment card data security |
| **FedRAMP** | US Government | Cloud security assessment for federal agencies |

### Google Cloud Governance Tools

-   **Organization Policy Service** — Centrally define constraints across all projects (e.g., restrict VM locations, disable public IP).
-   **Assured Workloads** — Configure compliance controls (data residency, personnel access) for regulated industries.
-   **Data residency controls** — Choose regions to store data, enforce via organization policies.
-   **Audit Logs** — Admin Activity logs (always on, free, 400-day retention) and Data Access logs (configurable).

>**Exam Tip:** Google Cloud is **compliant with** many frameworks, but compliance is a shared responsibility. Google provides the compliant infrastructure; you must configure and use it correctly. The exam may ask "how do you ensure GDPR compliance?" — the answer involves data residency, DLP, encryption, and IAM, not just "use Google Cloud."

## 8. Exam Tips
>**Exam Strategy:** Section 5 (~17%) emphasizes **IAM best practices**, **encryption options**, and **which security service solves which problem**. Know the principle of least privilege, the difference between CMEK and CSEK, and when to use Cloud Armor vs. VPC Service Controls vs. SCC.

### Quick Reference

-   "Protect against DDoS attacks" → **Cloud Armor + global load balancer**
-   "Control who can access what" → **IAM roles and policies**
-   "Control encryption key lifecycle" → **Cloud KMS with CMEK**
-   "Prevent data exfiltration from APIs" → **VPC Service Controls**
-   "Find and redact PII in data" → **Cloud DLP**
-   "Security posture dashboard" → **Security Command Center**
-   "Store API keys and passwords securely" → **Secret Manager**
-   "Zero-trust access model" → **BeyondCorp Enterprise**
-   "Audit what Google employees do with my data" → **Access Transparency**

[

Previous

Infrastructure & Apps

](04-infrastructure-apps.html)[

Next Section

Scaling & Operations

](06-scaling-operations.html)