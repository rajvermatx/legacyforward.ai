---
title: "Model Risk Management & Governance"
slug: "model-governance"
description: "A comprehensive governance architecture for managing model risk across the entire ML lifecycle — from data lineage and model registry through approval workflows, continuous monitoring, and incident response."
section: "blueprints"
order: 7
badges:
  - "Model Registry"
  - "Data Lineage"
  - "Approval Workflows"
  - "Drift Monitoring"
---

## 1. Overview

Your company now has 50 ML models in production. Some approve loans. Some detect fraud. Some recommend products. Some set prices. Who trained them? On what data? When were they last updated? What happens if one goes wrong? If you cannot answer these questions quickly and confidently, you have a governance problem. And in regulated industries — banking, insurance, healthcare — that governance problem is also a compliance problem. Frameworks like SR 11-7 (Fed/OCC), Solvency II, and increasingly the EU AI Act require that organizations understand and control the models making decisions that affect people.

But governance is not just for regulated companies. Even if no regulator is watching, a pricing model that silently drifts can cost millions in revenue before anyone notices. A recommendation engine that develops subtle biases can erode customer trust over months. A fraud detection model trained on last year's patterns will miss this year's fraud techniques. Without governance, you only discover these problems after the damage is done — through customer complaints, revenue drops, or worse, a front-page news story.

The governance architecture provides five essential capabilities: a model registry that answers "what models exist and who owns them," lineage tracking that answers "what data trained this model," approval workflows that answer "who approved this for production," continuous monitoring that answers "is this model still performing," and incident response that answers "what do we do when something goes wrong." Think of it as compliance infrastructure — the plumbing that makes responsible AI possible at scale.

The critical insight is timing: if you build governance into your ML platform from the start, it is a lightweight, low-friction process that engineers barely notice. If you bolt it on after a regulatory finding or an incident, it becomes a painful, expensive retrofit that slows down every team. The architecture in this blueprint is designed to be built once and used across all models, creating a consistent governance layer that scales with your organization rather than creating per-model overhead.

## 2. Architecture Diagram

![Diagram 1](/diagrams/blueprints/model-governance-1.svg)

Architecture diagram — Model Risk Management & Governance: end-to-end governance layer spanning data lineage through incident response

## 3. Component Breakdown

📚

#### Model Registry & Metadata Catalog

Central inventory of every production model with metadata: owner, training data reference, performance metrics, version history, risk tier, and approval status. The single source of truth for "what models do we have."

🔗

#### Data Lineage & Provenance

Tracks data from its original source through every transformation to the final training dataset. Answers "what data trained this model" and "if this data source is wrong, which models are affected."

✅

#### Approval Workflow

Multi-level gate: model developer submits, model validator reviews methodology and performance, risk committee approves for production. Higher-risk models (e.g., credit decisions) require additional scrutiny.

📈

#### Continuous Monitoring

Tracks model performance, data drift, concept drift, and fairness metrics in real time. Alerts when metrics breach thresholds. Distinguishes between slow degradation and sudden failures.

📄

#### Model Documentation (Model Cards)

Standardized documentation for each model: intended use, training data description, performance across subgroups, known limitations, and ethical considerations. Required before production deployment.

🚨

#### Incident Response & Rollback

Predefined playbooks for model failures: who gets alerted, how to investigate, when to roll back, and how to communicate to stakeholders. Includes automated rollback to the previous model version.

## 4. Decision Points & Trade-offs

| Advantage | Limitation |
| --- | --- |
| Comprehensive audit trail satisfies regulatory requirements | Governance rigor can slow deployment velocity |
| Full data lineage enables root-cause analysis | End-to-end lineage tracking has significant engineering overhead |
| Approval workflows prevent untested models from reaching production | Manual approval gates can become bottlenecks |
| Continuous monitoring catches drift before customer impact | Too many alerts create fatigue and get ignored |

>**Right-size your governance:** Not every model needs the same level of governance. Use a tiering system: Tier 1 (high risk: credit, healthcare) gets full approval workflow and quarterly review. Tier 3 (low risk: internal recommendations) gets automated checks and annual review. One-size-fits-all governance either over-burdens low-risk models or under-governs high-risk ones.

>**Regulatory context:** SR 11-7 (US banking), the EU AI Act, and similar frameworks do not prescribe specific tools — they require demonstrable processes. Your architecture must produce evidence: "here is when this model was approved, by whom, based on what metrics, and here is its current performance." The tools are secondary to the audit trail.

## 5. Cloud Mapping

| Component | GCP | AWS | Azure |
| --- | --- | --- | --- |
| **Model Registry** | Vertex AI Model Registry | SageMaker Model Registry | Azure ML Model Registry |
| **Data Lineage** | Data Catalog + Dataplex | Glue Data Catalog | Microsoft Purview |
| **Approval Workflow** | Custom + Cloud Tasks | Step Functions | Logic Apps |
| **Monitoring** | Vertex AI Model Monitoring | SageMaker Model Monitor | Azure ML Data Drift |
| **Documentation** | Custom model cards | SageMaker Model Cards | Azure ML Responsible AI |
| **Incident Response** | Cloud Monitoring + PagerDuty | CloudWatch + EventBridge | Azure Monitor + Azure Alerts |

## 6. Anti-Patterns

1.  **The spreadsheet registry** — A model registry that lives in a shared spreadsheet is never up to date. Models get deployed without being registered, metadata goes stale, and nobody trusts the inventory. The registry must be automated and integrated into the deployment pipeline.
2.  **Approval workflow as bureaucracy** — If the approval process takes weeks and requires six signatures, teams will route around it. They will deploy models as "experiments" or "proof of concepts" that quietly become production systems. The workflow must be proportional to risk.
3.  **Monitoring only infrastructure metrics** — Tracking latency, CPU, and error rates is necessary but not sufficient. A model can be responding quickly and reliably while producing increasingly wrong predictions. Monitor model quality metrics: accuracy, precision, recall, and fairness.
4.  **No data lineage** — When a regulator asks "what data trained this model," you should be able to answer in minutes, not weeks. If you cannot trace from a model's predictions back to its training data sources, you cannot debug, audit, or explain anything.
5.  **Governance as a one-time audit** — Reviewing models once a year is not governance — it is a checkbox exercise. Models drift, data changes, and business requirements evolve. Governance must be continuous, with automated monitoring triggering reviews when conditions change.

## 7. Architect's Checklist

-   Every production model registered in the model registry with current metadata
-   Data lineage traceable end-to-end from source data to model predictions
-   Model owner assigned and accountable for each production model
-   Approval workflow enforced — no model reaches production without required sign-offs
-   Model card / documentation required and reviewed before deployment
-   Drift monitoring active with alerts configured for each model's key metrics
-   Fairness metrics tracked for models making decisions about people (credit, hiring, pricing)
-   Incident response playbook tested — team has rehearsed model failure scenarios
-   Regular model review cadence established (quarterly for high-risk, annually for low-risk)
-   Regulatory requirements mapped to specific governance controls and evidence
-   Retirement and deprecation process defined for end-of-life models
