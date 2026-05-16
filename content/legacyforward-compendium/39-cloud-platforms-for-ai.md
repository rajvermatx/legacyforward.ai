---
title: "Cloud Platforms for AI"
slug: "cloud-platforms-for-ai"
description: "AWS, Azure, and GCP each offer distinct AI service portfolios, managed infrastructure, and native integrations. Platform choice is a long-term architectural commitment — architects who understand the tradeoffs make better decisions than those who follow market momentum."
section: "legacyforward-compendium"
order: 39
part: "Part IV — Enterprise AI Architecture"
---

Part IV — Enterprise AI Architecture

# Cloud Platforms for AI

The major cloud platforms — AWS, Azure, and Google Cloud — have each invested heavily in AI infrastructure, managed services, and developer tooling. For enterprise architects, the question is not whether to use cloud AI infrastructure (the economics almost always favor it) but which platform to use, for which workloads, and with what degree of lock-in. These decisions have multi-year consequences.

### What You Will Learn

- The AI service portfolios of the major cloud platforms and their key differentiators
- The lock-in risks in cloud AI and how to manage them
- The workload placement decisions that matter most
- How to design a multi-cloud AI architecture that does not create unmanageable complexity

## 39.1 Cloud Platform AI Portfolios

**AWS.** Amazon Web Services offers the broadest general cloud infrastructure, with AI services including SageMaker (end-to-end ML platform), Bedrock (managed access to foundation models from Anthropic, Meta, Mistral, and others), Rekognition (computer vision), Comprehend (NLP), and Kendra (enterprise search). AWS's AI advantage is its integration with the broadest set of cloud infrastructure services — for organizations deeply invested in AWS, the integration costs of using other platforms are significant. Bedrock's multi-model access (not just AWS's own models) is a distinctive feature for organizations that want to use frontier models without managing direct provider relationships.

**Microsoft Azure.** Azure's AI differentiation is its deep integration with Microsoft's enterprise software stack — Office 365, Teams, Dynamics, Power Platform — and its exclusive partnership with OpenAI for Azure-hosted OpenAI model access. Azure OpenAI Service provides access to GPT-4 and other OpenAI models with Azure's enterprise commitments (data residency, compliance, SLA). For organizations with significant Microsoft footprint, Azure AI services are often the lowest-friction path to AI capabilities that integrate with existing enterprise tools. Azure Machine Learning provides MLOps capabilities for custom model training and deployment.

**Google Cloud Platform.** Google Cloud's AI advantage is its research heritage and its first-party foundation models: Gemini (generative AI), Vertex AI (managed ML platform), and specialized models for vision, translation, and document understanding. BigQuery ML allows ML models to be trained and run directly within BigQuery on data that already lives there, eliminating ETL overhead for analytics-adjacent AI use cases. For organizations with Google Workspace, the integration path to AI capabilities in Docs, Sheets, and Gmail is straightforward. GCP's Vertex AI Agent Builder provides managed RAG and agentic application infrastructure.

## 39.2 Lock-In Risks in Cloud AI

Cloud AI services create lock-in risks that are more severe than traditional cloud infrastructure lock-in:

**Model lock-in:** Applications built against provider-specific model APIs (OpenAI format vs. Anthropic format vs. Google format) require code changes to switch providers. The API abstraction layers that exist do not fully eliminate this — provider-specific features (function calling formats, safety filters, context window limits) create subtle incompatibilities.

**Data lock-in:** Training data stored in a cloud provider's managed data service (SageMaker Feature Store, Vertex Feature Store) is difficult to move to another provider's services. The migration cost is the data transfer cost plus the re-implementation cost.

**MLOps lock-in:** Organizations that build training pipelines in SageMaker Pipelines or Vertex Pipelines face significant migration effort if they want to change platforms. MLOps tooling is where lock-in is deepest and most underestimated.

**Integration lock-in:** AI services that are deeply integrated with cloud-native services (Bedrock integrating with S3 and IAM, Azure OpenAI integrating with Azure Active Directory) become harder to replace as those integrations are built on.

**Managing lock-in:** Abstract model access behind an internal AI service layer that can be rerouted without application changes. Use open-source MLOps tools (Kubeflow, MLflow) where they provide equivalent capability to managed services. Evaluate data portability when selecting managed data services.

## 39.3 Workload Placement Decisions

Not all AI workloads are equally appropriate for all deployment models:

**Managed model APIs (Bedrock, Azure OpenAI, Vertex AI):** Appropriate for frontier model access, rapid prototyping, and workloads where inference volume does not yet justify self-hosting. Trade-offs: per-token cost at scale, data leaving your environment (typically to a cloud provider's US or EU region, not your own infrastructure), dependency on provider availability.

**Managed ML platforms (SageMaker, Vertex AI):** Appropriate for custom model training, fine-tuning, and deployment when you have ML engineering capability but do not want to manage underlying infrastructure. Trade-offs: significant lock-in, cost premium over bare infrastructure.

**Self-managed on cloud infrastructure:** Deploying open-source models (LLaMA, Mistral) on cloud VMs or Kubernetes gives maximum control over model selection, data handling, and cost optimization at scale. Trade-offs: requires ML engineering capability to manage model serving, updates, and scaling.

**On-premises:** Deploying AI capabilities on-premises is appropriate when data privacy requirements prohibit cloud processing, when latency requirements cannot be met by cloud APIs, or when regulatory requirements mandate specific data residency. Trade-offs: highest infrastructure management burden, limited access to frontier models, slower access to new capabilities.

The workload placement decision should be made per-workload based on its specific requirements, not as a blanket platform policy.

## 39.4 Multi-Cloud AI Architecture

Many enterprise AI architectures span multiple providers — frontier model APIs from one provider, training infrastructure from another, storage from a third. Managing this complexity requires deliberate architectural choices:

**API abstraction layer:** A single internal service that routes AI inference requests to the appropriate provider based on routing rules (model type, cost, availability). Applications call the abstraction layer, not provider APIs directly. This enables provider switching and A/B testing without application changes.

**Vendor-agnostic MLOps:** Using vendor-agnostic MLOps tools (MLflow for experiment tracking and model registry, Airflow for pipeline orchestration, Kubernetes for model serving) reduces the lock-in risk of multi-cloud architectures. These tools run on any cloud and avoid the MLOps lock-in described above.

**Data gravity considerations:** AI training workloads should run close to the training data to avoid expensive cross-provider data transfer. For large training datasets, the cloud platform where data already lives is often the right platform for training, even if inference runs elsewhere.

**Compliance boundaries:** In regulated industries, AI workloads that process regulated data may need to be segregated from workloads that do not. Multi-cloud architectures can enforce these boundaries — regulated data stays in the compliant environment, non-regulated workloads use the most cost-effective platform.

Cloud platform selection is a multi-year architectural commitment. The best decisions are made by evaluating the total cost of ownership (including lock-in costs), the integration complexity for the specific enterprise software stack, and the regulatory requirements for the specific industry — not by following analyst rankings or peer pressure.
