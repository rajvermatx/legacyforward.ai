---
title: "MLOps for Generative AI"
slug: "mlops-generative-ai"
description: "Traditional MLOps pipelines were designed for classical ML models — tabular data, fixed feature schemas,
    deterministic outputs. Generative AI upends every assumption. This module covers the end-to-end lifecycle
    for deploying, monitoring, and iterating on foundation models in production using"
section: "gcp-mle"
order: 13
badges:
  - "GenAI Lifecycle"
  - "Prompt Management"
  - "Fine-Tuning Ops"
  - "GenAI Evaluation"
  - "RAG Operations"
  - "Monitoring & Safety"
---

## 01. How GenAI MLOps Differs from Traditional MLOps

Traditional MLOps focuses on **training pipelines**: ingest data, engineer features, train a model, validate metrics, deploy an endpoint, and monitor for data drift. GenAI MLOps adds entirely new dimensions that classical pipelines never anticipated.

| Dimension | Traditional MLOps | GenAI MLOps |
| --- | --- | --- |
| **Model Origin** | Train from scratch on your data | Start with a foundation model, adapt via prompting or fine-tuning |
| **Input** | Structured features with fixed schema | Free-form text, images, multi-modal inputs |
| **Output** | Deterministic (classification, regression) | Non-deterministic, open-ended text generation |
| **Evaluation** | Well-defined metrics (accuracy, F1, RMSE) | Subjective quality, requires human/LLM-based evaluation |
| **Versioning** | Model weights + training data | Prompts + model version + retrieval config + system instructions |
| **Monitoring** | Data drift, prediction drift | Output quality drift, safety violations, cost per query, latency |
| **Cost Model** | Fixed compute for serving | Per-token pricing, highly variable per request |

>**Key Insight:** In GenAI MLOps, **the prompt IS the code**. A one-word change to a system prompt can completely alter model behavior. This means prompt versioning, testing, and rollback are as critical as code deployment.

## 02. The GenAI Lifecycle

The GenAI lifecycle is not a simple train-deploy-monitor loop. It is an iterative process with multiple decision points and feedback loops:

![Diagram 1](/diagrams/gcp-mle/mlops-generative-ai-1.svg)

The GenAI lifecycle is iterative — monitoring feeds back into prompt engineering and fine-tuning decisions.

### Stage-by-Stage Decisions

**Model Selection:** Choose between Gemini models (Pro, Flash, Ultra), open-source models on Model Garden, or third-party models. Consider cost, latency, task complexity, and compliance requirements. Vertex AI Model Garden provides 150+ foundation models.

**Prompt Engineering:** Develop system instructions, few-shot examples, and output formatting. Use Vertex AI Studio for rapid experimentation. Version all prompts in source control.

**Fine-Tuning:** When prompting alone is insufficient. Vertex AI supports supervised fine-tuning (SFT), RLHF, and distillation. Decision: *fine-tune only when prompt engineering + RAG cannot achieve required quality.*

**Evaluation:** Automated metrics (BLEU, ROUGE), LLM-as-judge, human evaluation, and domain-specific rubrics. Vertex AI Gen AI Evaluation Service provides built-in evaluation pipelines.

**Deployment:** Direct API calls (Vertex AI endpoints), cached responses for common queries, distilled models for cost optimization. Use traffic splitting for A/B testing.

**Monitoring:** Output quality drift, safety violations, hallucination rate, cost tracking, and latency monitoring. Set up alerts for quality degradation.

## 03. Prompt Management

Prompts in production systems are not ad-hoc strings. They are **versioned artifacts** that must be managed with the same discipline as code. A prompt management system tracks prompt templates, variables, model configurations, and performance metrics.

### Prompt Versioning & Registries

A **prompt registry** is a centralized store for all production prompts. Each entry includes the prompt template, the model it was tested with, evaluation scores, and metadata. Think of it as a model registry but for prompts.

```
# Prompt versioning pattern
PROMPT_REGISTRY = {
    "summarize_v1": {
        "template": "Summarize the following document in {num_sentences} sentences:\n\n{document}",
        "model": "gemini-2.0-flash",
        "temperature": 0.3,
        "version": "1.0.0",
        "eval_score": 0.87,
        "created": "2025-01-15",
    },
    "summarize_v2": {
        "template": "You are a technical writer. Create a {num_sentences}-sentence summary...\n\n{document}",
        "model": "gemini-2.0-flash",
        "temperature": 0.2,
        "version": "2.0.0",
        "eval_score": 0.92,
        "created": "2025-02-20",
    }
}
```

### A/B Testing Prompts

In production, you can route a percentage of traffic to different prompt versions. Vertex AI endpoints support **traffic splitting** natively. For prompt-level A/B testing:

-   Define a control prompt (current production version)
-   Define a treatment prompt (the new version)
-   Route 90/10 traffic split using endpoint config or application-level routing
-   Collect quality metrics: user feedback, automated eval scores, latency
-   Run for statistically significant sample size
-   Promote the winner, archive the loser with full metadata

>**Best Practice:** Store prompts in YAML or JSON files in your Git repository alongside the application code. Use CI/CD to validate prompt changes (run evaluation suite) before deploying.

## 04. Fine-Tuning Operations

### Dataset Preparation

Fine-tuning Gemini models on Vertex AI requires training data in JSONL format. Each line contains an input-output pair. Quality matters far more than quantity — 100 high-quality examples often outperform 10,000 noisy ones.

```
# Training data format for supervised fine-tuning
# Each line in the JSONL file:
{
  "messages": [
    {"role": "system", "content": "You are a medical coding assistant."},
    {"role": "user", "content": "Patient presents with acute bronchitis..."},
    {"role": "model", "content": "ICD-10: J20.9 - Acute bronchitis, unspecified"}
  ]
}
```

>**Dataset Guidelines:** **Minimum:** 10 examples (Vertex AI). **Recommended:** 100-500 high-quality examples. **Maximum:** 10,000 examples per tuning job. Always hold out 20% for validation. Remove PII before uploading to Cloud Storage.

### Supervised Fine-Tuning on Vertex AI

Vertex AI provides a managed fine-tuning service. You upload training data to Cloud Storage, specify the base model and hyperparameters, and Vertex AI handles the infrastructure. The tuned model is deployed as a new endpoint.

```
from google.cloud import aiplatform
from vertexai.tuning import sft

# Initialize Vertex AI
aiplatform.init(project="my-project", location="us-central1")

# Launch supervised fine-tuning job
tuning_job = sft.train(
    source_model="gemini-2.0-flash-001",
    train_dataset="gs://my-bucket/train.jsonl",
    validation_dataset="gs://my-bucket/val.jsonl",
    epochs=3,
    adapter_size=4,          # LoRA rank
    learning_rate_multiplier=1.0,
    tuned_model_display_name="medical-coder-v1",
)

# Monitor tuning progress
print(tuning_job.state)        # PIPELINE_STATE_RUNNING
print(tuning_job.tuned_model)  # Endpoint resource name
```

### RLHF Pipelines

**Reinforcement Learning from Human Feedback (RLHF)** adds a second fine-tuning stage where a reward model learns human preferences. On Vertex AI, RLHF tuning involves:

-   **Step 1:** SFT on instruction-following data
-   **Step 2:** Collect human preference data (pairwise comparisons)
-   **Step 3:** Train a reward model on preference data
-   **Step 4:** Use PPO/DPO to align the model with the reward model

>**Cost Warning:** Fine-tuning Gemini models incurs significant compute costs. SFT jobs typically cost $2-8 per 1,000 training examples. RLHF is even more expensive. Always start with prompt engineering and RAG before resorting to fine-tuning. Use `adapter_size=1` for small experiments.

## 05. GenAI Evaluation

Evaluating generative AI is fundamentally different from evaluating classifiers. There is no single ground truth for open-ended text generation. GenAI evaluation uses a combination of automated metrics, LLM-based judging, and human evaluation.

A

#### Automated Metrics

BLEU, ROUGE, perplexity. Fast and reproducible but correlate poorly with human judgment for open-ended tasks.

J

#### LLM-as-Judge

Use a strong model (e.g., Gemini Pro) to evaluate a weaker model's outputs. Scalable and increasingly reliable.

H

#### Human Evaluation

Gold standard for quality. Expensive and slow but essential for safety-critical and ambiguous tasks.

R

#### RAGAS for RAG

Framework for evaluating RAG: faithfulness, answer relevancy, context precision, context recall.

### LLM-as-Judge: Pointwise & Pairwise

**Pointwise evaluation** scores a single response on a rubric (e.g., 1-5 scale for relevance). **Pairwise evaluation** compares two responses and selects the better one. Pairwise is more reliable because humans (and LLMs) are better at comparisons than absolute ratings.

```
# LLM-as-Judge: Pointwise evaluation
from vertexai.generative_models import GenerativeModel

judge = GenerativeModel("gemini-2.0-pro")

JUDGE_PROMPT = """Rate the following response on a scale of 1-5 for:
- Relevance: Does it answer the question?
- Accuracy: Is the information correct?
- Completeness: Does it cover all aspects?

Question: {question}
Response: {response}

Output JSON: {"relevance": X, "accuracy": X, "completeness": X, "reasoning": "..."}"""

result = judge.generate_content(
    JUDGE_PROMPT.format(question=q, response=r)
)
```

### RAGAS for RAG Evaluation

**RAGAS** (Retrieval-Augmented Generation Assessment) provides four key metrics for evaluating RAG pipelines:

| Metric | Measures | Needs |
| --- | --- | --- |
| **Faithfulness** | Is the answer grounded in retrieved context? | Question + Answer + Contexts |
| **Answer Relevancy** | Is the answer relevant to the question? | Question + Answer |
| **Context Precision** | Are retrieved chunks relevant to the question? | Question + Contexts + Ground Truth |
| **Context Recall** | Did retrieval find all necessary info? | Contexts + Ground Truth |

>**Vertex AI Gen AI Evaluation:** Vertex AI provides a built-in **Gen AI Evaluation Service** that supports pointwise and pairwise evaluation with pre-built metrics for summarization, question answering, text generation, and safety. It can be integrated into CI/CD pipelines for automated quality gates.

## 06. Model Versioning & Governance

Foundation models add new governance challenges. You must track not just model weights, but the entire configuration stack: base model version, fine-tuning data, prompt templates, retrieval configuration, and safety filters.

### What to Version

-   **Base model:** e.g., gemini-2.0-flash-001 (the specific version tag)
-   **Prompt templates:** System instructions, few-shot examples, output schemas
-   **Fine-tuning artifacts:** Training data hash, hyperparameters, adapter weights
-   **RAG configuration:** Embedding model, chunk size, overlap, retrieval top-k
-   **Safety settings:** Content filter thresholds, blocked categories
-   **Generation config:** Temperature, top-p, top-k, max output tokens

Use **Vertex AI Model Registry** to register and track model versions. Each deployment should be a tagged combination of all the above. Use Git tags or semantic versioning for prompt+config bundles.

>**Governance Risk:** Google may deprecate or update base model versions. Pin to specific versions (e.g., `gemini-2.0-flash-001`, not `gemini-2.0-flash`) in production. Set up alerts for model deprecation notices.

## 07. Deployment Patterns for GenAI

GenAI deployment is more varied than traditional ML deployment. The right pattern depends on latency requirements, cost constraints, and quality needs.

1

#### Direct API

**Pattern:** Call Gemini API directly via Vertex AI endpoint. **Best for:** Variable workloads, rapid iteration. **Cost:** Per-token pricing.

2

#### Distilled Models

**Pattern:** Fine-tune a smaller model to mimic a larger one. **Best for:** High-volume, cost-sensitive applications. **Cost:** Lower per-token.

3

#### Cached Responses

**Pattern:** Cache common queries and responses. Use context caching in Vertex AI. **Best for:** Repetitive queries. **Cost:** Dramatically reduced.

4

#### Hybrid Routing

**Pattern:** Route simple queries to Flash, complex to Pro. **Best for:** Mixed workloads. **Cost:** Optimized per query complexity.

```
# Context caching for repeated queries (Vertex AI)
from vertexai.generative_models import GenerativeModel
from vertexai import caching

# Create a cached content object for large context
cached_content = caching.CachedContent.create(
    model_name="gemini-2.0-flash-001",
    contents=[large_document],
    ttl=datetime.timedelta(hours=1),
    display_name="product-manual-cache",
)

# Use cached content for multiple queries (saves input tokens)
model = GenerativeModel.from_cached_content(cached_content)
response = model.generate_content("What is the return policy?")
```

## 08. Monitoring GenAI in Production

GenAI monitoring extends far beyond traditional ML monitoring. You cannot simply track prediction drift on a single metric. GenAI monitoring requires a multi-dimensional approach.

| Monitoring Dimension | What to Track | Tools |
| --- | --- | --- |
| **Output Quality Drift** | Average eval scores over time, user satisfaction ratings, automated judge scores | Vertex AI Continuous Evaluation, custom dashboards |
| **Safety Monitoring** | Blocked responses rate, safety filter triggers, toxic output detection | Vertex AI safety filters, custom classifiers |
| **Cost Monitoring** | Token usage per request, cost per user, daily/monthly spend, budget alerts | Cloud Billing, BigQuery export, custom dashboards |
| **Latency** | Time to first token (TTFT), total generation time, p50/p95/p99 latencies | Cloud Monitoring, OpenTelemetry |
| **Hallucination Rate** | Factual accuracy checks, groundedness scoring, citation verification | LLM-as-judge pipelines, RAGAS faithfulness |
| **Usage Patterns** | Query volume, query types, user segments, peak hours | Cloud Logging, BigQuery analytics |

>**Exam Alert:** The exam frequently tests GenAI-specific monitoring. Key differentiators from traditional monitoring: (1) you cannot use data drift detection on free-form text the same way, (2) output quality requires LLM-based evaluation not just statistical tests, (3) cost monitoring is critical because of per-token pricing.

### Setting Up Cost Tracking

```
# Cost tracking pattern for GenAI API calls
import time

class GenAICostTracker:
    def __init__(self):
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_requests = 0

    def log_request(self, response):
        usage = response.usage_metadata
        self.total_input_tokens += usage.prompt_token_count
        self.total_output_tokens += usage.candidates_token_count
        self.total_requests += 1

    def estimate_cost(self, input_price_per_1k=0.000125, output_price_per_1k=0.000375):
        input_cost = (self.total_input_tokens / 1000) * input_price_per_1k
        output_cost = (self.total_output_tokens / 1000) * output_price_per_1k
        return {"input_cost": input_cost, "output_cost": output_cost,
                "total_cost": input_cost + output_cost}
```

## 09. RAG Operations

RAG (Retrieval-Augmented Generation) pipelines have their own operational concerns that go beyond simple model deployment. Managing a RAG system in production requires continuous maintenance of the chunking pipeline, embedding model, and vector index.

### Chunking Pipeline Operations

Documents must be split into chunks for embedding and retrieval. The chunking strategy directly impacts retrieval quality. Operational concerns include:

-   **Chunk size tuning:** 256-1024 tokens per chunk, with overlap of 10-20%
-   **Incremental updates:** When documents change, re-chunk and re-embed only the affected sections
-   **Metadata enrichment:** Attach source, date, section headers to each chunk for filtering
-   **Deduplication:** Remove near-duplicate chunks to improve retrieval precision

### Embedding Updates & Index Management

When you update the embedding model (e.g., from `text-embedding-004` to a newer version), you must **re-embed all documents**. This is a major operational task:

```
# Vertex AI Vector Search index management
from google.cloud import aiplatform

# Create a new index for updated embeddings
index = aiplatform.MatchingEngineIndex.create_tree_ah_index(
    display_name="product-docs-v2",
    dimensions=768,
    approximate_neighbors_count=150,
    distance_measure_type="DOT_PRODUCT_DISTANCE",
    shard_size="SHARD_SIZE_SMALL",
)

# Deploy index to an endpoint for real-time queries
index_endpoint = aiplatform.MatchingEngineIndexEndpoint.create(
    display_name="product-docs-endpoint",
    public_endpoint_enabled=True,
)
index_endpoint.deploy_index(
    index=index, deployed_index_id="prod_v2",
)
```

>**Blue-Green for RAG:** Use blue-green deployment for RAG index updates: build the new index alongside the old one, run evaluation, then switch traffic. This avoids downtime and allows instant rollback.

## 10. Exam Focus: Key Takeaways
>**Exam Tips - Section 5:** These are the most frequently tested topics from this module on the GCP MLE certification exam.

### GenAI-Specific Monitoring

-   Know that GenAI monitoring includes: output quality, safety, cost, latency, and hallucination rate
-   Understand that traditional data drift detection does not directly apply to free-text inputs
-   LLM-as-judge is the scalable approach for automated quality monitoring
-   Cost monitoring is unique to GenAI because of per-token pricing variability

### Fine-Tuning vs RAG Decision Framework

| Scenario | Best Approach | Why |
| --- | --- | --- |
| **Need domain knowledge** | RAG | Add documents to retrieval corpus, no training needed |
| **Need specific output format** | Fine-Tuning | SFT teaches the model your desired format |
| **Need up-to-date information** | RAG | Update docs in real time, no retraining |
| **Need to reduce hallucination** | RAG | Ground responses in retrieved documents |
| **Need style/tone changes** | Fine-Tuning | SFT changes how the model writes |
| **Need both** | Fine-Tune + RAG | Fine-tune for style, RAG for knowledge |

### Key Exam Signals

-   If the question mentions "latest data" or "real-time information" → RAG
-   If the question mentions "specific format" or "consistent style" → Fine-tuning
-   If the question mentions "monitoring output quality" → Continuous evaluation + LLM-as-judge
-   If the question mentions "cost optimization" → Context caching, model distillation, or routing to Flash
-   If the question mentions "prompt management" → Version control, prompt registry, A/B testing

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** MLOps for generative AI extends traditional MLOps with new challenges: prompts become first-class artifacts that need versioning, testing, and A/B experimentation just like model weights. Evaluation shifts from simple metrics like accuracy to nuanced assessments using LLM-as-judge, RAGAS, and human preference alignment. Fine-tuning operations (SFT, RLHF) require specialized pipelines for dataset curation, training orchestration, and adapter management. On Vertex AI, the GenAI lifecycle is managed through prompt registries, the Gen AI Evaluation Service, supervised fine-tuning APIs, and continuous evaluation with automated drift detection—all integrated into a single platform that treats prompts, models, and RAG configurations as versioned, auditable artifacts.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| How does MLOps for GenAI differ from traditional MLOps? | Can you articulate the new artifact types (prompts, adapters, RAG configs) and why they need their own lifecycle management? |
| How would you implement prompt management in production? | Do you understand version control, A/B testing, and rollback strategies for prompts as production artifacts? |
| How do you evaluate a generative AI model in production? | Can you go beyond BLEU/ROUGE and explain LLM-as-judge, pointwise vs pairwise evaluation, and continuous evaluation pipelines? |
| When would you fine-tune versus use RAG? | Do you know the decision framework: RAG for knowledge/freshness, fine-tuning for style/format, and when to combine both? |
| How do you monitor a GenAI application for quality degradation? | Can you describe continuous evaluation, hallucination detection, toxicity checks, and automated alerting on LLM output quality? |

### Model Answers

**GenAI MLOps vs Traditional:** Traditional MLOps manages code, data, and model weights through CI/CD pipelines. GenAI MLOps adds prompts as versioned artifacts, requires evaluation beyond numeric metrics (using LLM-as-judge and human preference), manages adapter weights from fine-tuning separately from base models, and must handle RAG pipeline configurations (chunk size, embedding model, retrieval strategy) as additional deployable artifacts. The feedback loop also changes—instead of periodic retraining, you iterate on prompts, update retrieval corpora, or fine-tune adapters on a much faster cadence.

**Prompt Management:** I would implement a prompt registry where each prompt template is versioned with its system instructions, few-shot examples, and output parsing logic. Changes go through code review. In production, I use traffic splitting to A/B test prompt variants, measuring quality via automated LLM-as-judge scoring and business metrics. Rollback is instant because switching prompts doesn’t require model redeployment. On Vertex AI, this integrates with the Gen AI Evaluation Service for automated quality gating before promoting a prompt to production.

**Fine-Tuning vs RAG Decision:** If the user needs up-to-date factual information or domain-specific knowledge, I use RAG—it avoids retraining and lets me update the knowledge base in real time. If the requirement is consistent output style, specific formatting, or behavioral alignment, I use supervised fine-tuning. For complex production systems, I combine both: fine-tune the model for tone and format, then use RAG to ground responses in current data. The key signal is whether the gap is in what the model knows versus how it communicates.

### System Design Scenario

>**Design Prompt:** **Scenario:** A financial services company wants to deploy a GenAI assistant that answers customer questions about their accounts, policies, and regulations. Responses must be accurate, compliant, and auditable. Design the MLOps pipeline.
> 
> **Approach:** Use RAG with a Vertex AI Search corpus containing policy documents and regulatory filings, updated nightly via a Cloud Composer pipeline. The base model is Gemini, accessed through Vertex AI endpoints with system prompts versioned in a prompt registry. Implement guardrails: input classification to reject out-of-scope queries, output grounding checks against the retrieved context, and a toxicity/compliance filter. Continuous evaluation uses LLM-as-judge with domain-expert-curated golden datasets, running hourly. Evaluation scores below threshold trigger alerts to the ML team. All prompt-response pairs are logged to BigQuery for audit. Fine-tune an adapter quarterly on expert-corrected responses to improve compliance language. Deploy with traffic splitting for canary rollouts of prompt or adapter changes.

### Common Mistakes

-   **Treating prompts as configuration, not artifacts** — Prompts in production need the same rigor as code: version control, testing, staged rollout, and rollback capability. Hardcoding prompts in application code makes iteration slow and error-prone.
-   **Relying solely on automated metrics for GenAI evaluation** — BLEU and ROUGE measure surface overlap, not quality. Production GenAI systems need LLM-based evaluation for nuance and periodic human evaluation to calibrate the automated judges.
-   **Fine-tuning when RAG would suffice** — Fine-tuning is expensive, creates model management overhead, and bakes knowledge into weights that become stale. Default to RAG for knowledge augmentation and reserve fine-tuning for behavioral changes that prompting alone cannot achieve.

Previous

[← 12 · Introduction to LLMs](12-intro-llms.html)

Next

[14 · Model Evaluation →](14-mlops-model-evaluation.html)