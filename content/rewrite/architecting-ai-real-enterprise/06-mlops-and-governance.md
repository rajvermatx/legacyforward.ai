---
title: MLOps and AI Governance
slug: mlops-and-governance
description: >-
  Deploying AI models by hand, with no equivalent discipline to CI/CD, is how organizations accumulate expensive surprises. MLOps and AI governance are the practices that close that gap — from automated evaluation pipelines to the AI Register that tells you what is actually running in your enterprise.
section: ai-enterprise-architect
order: 6
notebook: >-
  https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch06-mlops-pipeline.ipynb
audioUrl: /audio/ai-enterprise-architect/audio/06-mlops-and-governance.mp3
podcastUrl: /audio/ai-enterprise-architect/podcast/06-mlops-and-governance.mp3
---

# MLOps and AI Governance

## Your CI/CD Pipeline Needs a Sibling

You would not dream of pushing code to production without automated builds, tests, and deployment pipelines. So here is the question worth losing sleep over: why are so many organizations still deploying AI models by hand, with no equivalent discipline?

The answer is that most teams have not yet internalized that AI models are production software — software that just happens to be written by data instead of developers. The discipline that fills this gap is called MLOps, and getting it right is one of the most important architectural decisions you will make in your AI journey. It is the difference between a one-off demo that wows the boardroom and a system that reliably creates value month after month, year after year.

## MLOps — What It Actually Means

MLOps is the set of practices, tooling, and infrastructure that lets you deploy, monitor, and maintain AI models in production with the same confidence you have in your traditional software systems. DevOps for machine learning. It borrows the same philosophy of automation, reproducibility, and continuous improvement — adapted for the unique challenges that come with statistical models and data dependencies.

### The MLOps Lifecycle

![](/diagrams/ai-enterprise-architect/chapters/ch06-00.svg)

Notice the loop. Unlike traditional software, where you deploy a release and move on to the next feature, ML models live in a continuous cycle. The world changes, the data shifts, and the model that was accurate last quarter may be dangerously wrong this quarter. The closest analogy is your SDLC, but with two additions: data is a first-class input that must be versioned, validated, and tracked just like source code, and model drift is a first-class risk that must be monitored and mitigated just like a security vulnerability.

### MLOps Maturity Levels

| Level | Description | What You Need |
| --- | --- | --- |
| 0 — Manual | Data scientists train models in notebooks, hand off artifacts | Almost nothing (and almost no reliability) |
| 1 — Pipeline | Automated training pipeline, manual deployment | Pipeline orchestrator, model registry |
| 2 — CI/CD | Automated testing, deployment, and rollback | Full MLOps platform, monitoring |
| 3 — Continuous | Automated retraining on data drift, self-healing | Advanced monitoring, feature store, A/B testing |

Most enterprises should target Level 1 or Level 2 as their near-term goal. Level 0 is where almost everyone starts, and there is no shame in that — but you should not stay there long. The risks of manual, ad-hoc model deployment compound quickly once you have more than one or two models in production. Level 3 is genuinely only necessary for high-frequency, high-stakes models like ad ranking systems or real-time fraud detection. If someone tells you every model needs Level 3 maturity, they are probably selling you a platform.

### For GenAI: LLMOps

For teams working with generative AI — building applications on top of large language models — you are usually not training models yourself. You are calling an API. But that does not mean you can skip operational discipline. The operational surface area is different but equally demanding.

| MLOps Concept | LLMOps Equivalent |
| --- | --- |
| Model training | Prompt engineering / fine-tuning |
| Model registry | Prompt registry / template versioning |
| Model evaluation | Prompt evaluation (automated + human) |
| Data drift monitoring | Input distribution monitoring |
| Model serving | LLM API management (gateway, caching) |
| A/B testing | Prompt A/B testing |

Your prompts are your models. When you change a system prompt, you are changing the behavior of your application just as fundamentally as if you had retrained a neural network. That means prompts deserve the same rigor you would apply to any other production artifact: version control, testing, staged rollouts, and the ability to roll back when something goes wrong.

## The Model Registry

### What It Is

If you have ever used a container registry like Docker Hub or ECR, you already understand the concept of a model registry. It is a versioned repository where you store trained models along with all the metadata needed to understand, reproduce, and deploy them. Just as you would not deploy a container without knowing which image tag you are running, you should not deploy a model without knowing exactly which version it is, what data it was trained on, and how it performed during evaluation.

### What to Store

For each model version, your registry should capture a comprehensive record that tells the full story of how that model came to be and how it is performing. That means:

- The model artifact itself — weights and configuration files
- A reference to the exact training data used, including its version or content hash so you can reproduce the training run
- Training hyperparameters — small changes in learning rate or batch size can have outsized effects on model behavior
- Evaluation metrics — accuracy, precision, recall, latency, or whatever metrics matter for your use case; these are your deployment gates
- A model card — a human-readable document explaining what the model does, what it was trained on, its known limitations, and its deployment status

### Options

| Registry | Type | Notes |
| --- | --- | --- |
| MLflow | Open source | Most common, flexible |
| Vertex AI Model Registry | GCP managed | Integrated with Vertex |
| SageMaker Model Registry | AWS managed | Integrated with SageMaker |
| Weights & Biases | SaaS | Strong experiment tracking |

Start with MLflow. It is open source, runs anywhere, and covers about ninety percent of what most teams need. You can migrate to a cloud-managed registry later if your platform strategy demands it, but MLflow gives you the flexibility to avoid lock-in while you are still figuring out your MLOps patterns. It is the most widely adopted tool in this space, so most data scientists already know how to use it.

## Model Evaluation — Your AI Test Suite

### Why It's Different

You cannot unit-test an AI model the way you test a function or an API endpoint. There is no assert statement that tells you whether a model is "correct," because models operate in a world of probabilities and trade-offs, not deterministic logic. Instead of testing individual predictions, you evaluate the model against a carefully curated test set and measure aggregate metrics that tell you whether the model's overall behavior meets your quality bar.

This requires different infrastructure. Versioned test datasets, automated evaluation pipelines, and clear pass/fail thresholds agreed upon by both the data science team and the business stakeholders who will ultimately rely on the model's predictions.

### Evaluation Framework

![](/diagrams/ai-enterprise-architect/chapters/ch06-01.svg)

The critical piece is the pass/fail gate at the end. Without it, evaluation is just an academic exercise. With it, you have a deployment guardrail that prevents bad models from reaching production — the same way a failing test suite should prevent bad code from being merged.

### Key Metrics

| Metric | Use Case | What It Tells You |
| --- | --- | --- |
| Accuracy | Classification | % correct predictions |
| Precision/Recall | When errors have different costs | False positive vs. false negative trade-off |
| BLEU/ROUGE | Text generation | How close to reference text |
| LLM-as-Judge | GenAI quality | Use a stronger model to evaluate a weaker one |
| Latency p95 | All | Worst-case response time |
| Cost per request | All | Operational cost |

Pay special attention to that last row. Cost per request may not feel like a quality metric, but in the world of LLM-powered applications, it is. A model that gives perfect answers but costs ten dollars per request is not a viable production system. Treat cost as a first-class constraint, right alongside accuracy and latency.

### Evaluation for GenAI

For LLM-based systems, evaluation requires a layered approach combining automated checks with human judgment.

**Factuality** is your first line of defense: does the response match known facts? For RAG-based systems, you can automate this by comparing the model's output against the source documents it was supposed to draw from. **Relevance** checks whether the response actually answers the user's question — even a factually correct response is useless if it is off-topic. **Safety evaluation** checks whether the response contains harmful, offensive, or inappropriate content. **Format compliance** ensures the response conforms to expected structure — when your application expects JSON conforming to a specific schema, a beautifully written response that breaks the schema is a production incident. **Hallucination rate tracking** measures how often the model invents facts not present in the source material, which is the single biggest trust risk in any GenAI deployment.

## Monitoring in Production

### What to Monitor

Deploying a model is the starting line, not the finish line. A model in production is a living system that can degrade, drift, and fail in ways far more subtle than a crashed server or a thrown exception.

| Category | Metrics | Alert When |
| --- | --- | --- |
| Performance | Latency, throughput, error rate | SLA breach |
| Quality | Accuracy on shadow labels, user feedback | Quality drops below threshold |
| Cost | Tokens per request, cost per request, daily spend | Budget threshold exceeded |
| Data | Input distribution shift, new categories appearing | Distribution drift detected |
| Safety | Blocked requests, flagged outputs | Spike in safety violations |

These categories are interconnected. A shift in input distribution often leads to a drop in quality — but not always immediately. There can be a lag of days or weeks before degraded inputs produce visibly degraded outputs. This is why monitoring all five dimensions is essential. If you only watch latency and error rates, you will catch infrastructure problems but miss the slow, silent quality degradation that is the hallmark of model drift.

### Model Drift

Drift is the failure mode that catches most teams off guard. Models degrade over time, not because anything is wrong with the model itself, but because the world changes. Customer behavior shifts with the seasons, the economy, cultural trends. New products launch and create categories that did not exist when the model was trained. Regulations change and alter what is permissible.

Detecting drift requires comparing current input and output distributions against the distributions the model saw during training. Statistical tests like KL divergence and Population Stability Index can automate this comparison and fire alerts when distributions diverge beyond acceptable thresholds. Set these thresholds thoughtfully — too sensitive and you will drown in false alarms; too loose and you will miss real degradation until a business stakeholder calls asking why predictions have gone haywire.

Once you detect drift, the response depends on your architecture. For traditional ML models, the answer is usually to retrain on more recent data. For RAG-based GenAI systems, drift often manifests as stale knowledge, and the fix is to update your knowledge base with current documents rather than retraining the underlying language model.

## AI Governance Framework

### Governance Structure

AI governance done well is not bureaucratic theater. The risks of ungoverned AI are financial, legal, and reputational — and they scale with the number of AI systems you have in production.

A practical AI governance framework has three layers: policies that define the rules, standards that make those rules specific and actionable, and implementation that embeds those standards into your actual infrastructure and workflows.

![](/diagrams/ai-enterprise-architect/chapters/ch06-02.svg)

The AI Governance Board should include your CTO or VP of Engineering, Chief Data Officer, representatives from Legal and Ethics, and your Enterprise Architecture lead. This is not a committee that meets once a quarter to rubber-stamp decisions. It is an active body that reviews high-risk AI deployments, sets policy, and owns the incident response playbook when something goes wrong. The EA lead's role on this board is particularly important — you are the one who sees the full portfolio of AI systems across the enterprise and can spot patterns, redundancies, and risks that individual teams miss.

### Risk Classification

Not every model needs the same level of oversight. An internal tool that summarizes meeting notes carries a fundamentally different risk profile than a system that makes lending decisions or provides medical advice.

| Risk Level | Examples | Governance Required |
| --- | --- | --- |
| Low | Internal content summary, search | Model card, basic monitoring |
| Medium | Customer-facing chatbot, recommendations | + evaluation suite, human review, A/B testing |
| High | Credit decisions, medical, legal | + bias testing, explainability, regulatory review |
| Critical | Autonomous actions, safety-critical | + formal verification, continuous audit, HITL |

A tiered approach lets you move fast where the risk is low while applying rigorous oversight where the stakes are high. Low-risk internal tools can be deployed with a model card and basic monitoring. High-risk systems — anything touching financial decisions, health outcomes, or legal matters — should go through bias testing, explainability review, and regulatory compliance checks before they see a single production request. This is not about slowing innovation. It is about concentrating your governance energy where it matters most.

### The AI Register

Do you actually know every AI system running in your enterprise? If the answer is "not really," you are not alone — but you should be alarmed. Shadow AI, models and LLM-powered tools deployed by individual teams without central visibility, is the new shadow IT. It carries the same risks of data leakage, compliance violations, and architectural sprawl.

The solution is an AI Register: a central, maintained catalog of every AI system in your organization. For each system, capture: the system name and its business owner (every AI system needs a human who is accountable for its behavior), the risk classification, the data sources the system uses, model details including provider and version, the last evaluation date and results, known limitations or failure modes, and incident history.

This is essentially your enterprise application portfolio — the same artifact enterprise architects have maintained for decades — extended to cover AI components. Treat it as a living document. If a system is not in the register, it should not be in production.

## Real-World Example: The Retailer's MLOps Journey

A major retailer with two hundred stores deployed AI for demand forecasting — predicting how much of each product to stock in each store each week. A classic, high-value ML use case.

In the first three months, data scientists built models in Jupyter notebooks, working with whatever data was convenient, deploying models by manually copying artifacts to a production server. No monitoring, no evaluation gates, no governance. The models worked well enough during normal periods, but when the holiday season arrived, the forecasting model predicted demand based on 2019 patterns — pre-COVID patterns — because nobody had noticed that the training data had not been updated to reflect the massive shifts in consumer behavior that had occurred since then. The result was two million dollars in overstock losses. Two million dollars, because nobody had a drift detection system that would have flagged the stale training data.

During months four through six, the team built a proper MLOps pipeline. They automated training to pull in recent data, added drift detection to flag when input distributions shifted meaningfully, and set the model to retrain monthly rather than whenever someone remembered to do it. This eliminated the category of failure that had caused the overstock incident.

In months seven through nine, they added evaluation gates. No model could be deployed to production without passing accuracy thresholds on a regularly refreshed held-out test set. They introduced A/B testing, where new models would serve only ten percent of forecasting requests initially and only graduate to full traffic once they had proven themselves against the incumbent. This gave them confidence that model updates were genuine improvements, not regressions dressed up in better training metrics.

By months ten through twelve, they established governance around the entire process. Each forecasting model had a model card. Monthly reviews with business stakeholders ensured alignment with changing priorities. An incident response playbook defined exactly what to do when predictions were significantly off — who to notify, how to diagnose root cause, how to roll back to a previous model version.

The total cost of the MLOps platform was about two hundred thousand dollars per year. The cost of the single overstock incident it would have prevented was two million dollars. The math is not subtle.

## Companion Notebook

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch06-mlops-pipeline.ipynb) — Build a simple MLOps pipeline: train a model, log to MLflow, evaluate against a test set, register the model, and simulate a deployment decision gate.
