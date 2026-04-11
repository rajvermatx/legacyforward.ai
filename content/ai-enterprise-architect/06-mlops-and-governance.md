---
title: MLOps and AI Governance
slug: mlops-and-governance
description: >-
  If you’ve spent any time in enterprise software, you already know the value of
  CI/CD. You wouldn’t dream of pushing code to production without automated
  builds, tests, and deployment pipelines. So...
section: ai-enterprise-architect
order: 6
notebook: >-
  https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch06-mlops-pipeline.ipynb
audioUrl: /audio/ai-enterprise-architect/audio/06-mlops-and-governance.mp3
podcastUrl: /audio/ai-enterprise-architect/podcast/06-mlops-and-governance.mp3
---



# MLOps and AI Governance

## Your CI/CD Pipeline Needs a Sibling

If you’ve spent any time in enterprise software, you already know the value of CI/CD. You wouldn’t dream of pushing code to production without automated builds, tests, and deployment pipelines. So here’s the question that should keep you up at night: why are so many organizations still deploying AI models by hand, with no equivalent discipline?



The answer, frankly, is that most teams haven’t yet internalized that AI models are production software — they just happen to be software that was written by data instead of developers. The discipline that fills this gap is called MLOps, and getting it right is one of the most important architectural decisions you’ll make in your AI journey. It’s the difference between a one-off demo that wows the boardroom and a system that reliably creates value month after month, year after year.

## MLOps — What It Actually Means

At its core, MLOps is the set of practices, tooling, and infrastructure that lets you deploy, monitor, and maintain AI models in production with the same confidence you have in your traditional software systems. Think of it as DevOps for machine learning — borrowing the same philosophy of automation, reproducibility, and continuous improvement, but adapted for the unique challenges that come with statistical models and data dependencies.

### The MLOps Lifecycle

The lifecycle of an ML model in production looks something like this:

![](/diagrams/ai-enterprise-architect/chapters/ch06-00.svg)

Notice the loop. Unlike traditional software, where you deploy a release and move on to the next feature, ML models live in a continuous cycle. The world changes, the data shifts, and the model that was accurate last quarter may be dangerously wrong this quarter. If you’re an enterprise architect, the closest analogy is your SDLC — but with two crucial additions: data is a first-class input that must be versioned, validated, and tracked just like source code, and model drift is a first-class risk that must be monitored and mitigated just like a security vulnerability.

### MLOps Maturity Levels

It’s helpful to think about MLOps maturity as a spectrum. Not every organization needs to be at the cutting edge, and in fact, trying to jump to the highest level before you’ve mastered the basics is a recipe for expensive failure.

  
| Level | Description | What You Need |
| --- | --- | --- |
| 0 — Manual | Data scientists train models in notebooks, hand off artifacts | Almost nothing (and almost no reliability) |
| 1 — Pipeline | Automated training pipeline, manual deployment | Pipeline orchestrator, model registry |
| 2 — CI/CD | Automated testing, deployment, and rollback | Full MLOps platform, monitoring |
| 3 — Continuous | Automated retraining on data drift, self-healing | Advanced monitoring, feature store, A/B testing |

Most enterprises should be targeting Level 1 or Level 2 as their near-term goal. Level 0 is where almost everyone starts, and there’s no shame in that, but you shouldn’t stay there for long — the risks of manual, ad-hoc model deployment compound quickly once you have more than one or two models in production. Level 3, on the other hand, is genuinely only necessary for high-frequency, high-stakes models like ad ranking systems or real-time fraud detection. If someone tells you that every model needs Level 3 maturity, they’re probably selling you a platform.

### For GenAI: LLMOps

Here’s where things get interesting for teams working with generative AI. When you’re building applications on top of large language models, you’re usually not training models yourself — you’re calling an API. But that doesn’t mean you can skip operational discipline. If anything, the operational surface area is different but equally demanding.

The good news is that many of the concepts from traditional MLOps translate directly into what people are starting to call LLMOps. The vocabulary changes, but the underlying principles of version control, evaluation, and monitoring remain the same.

| MLOps Concept | LLMOps Equivalent |
| --- | --- |
| Model training | Prompt engineering / fine-tuning |
| Model registry | Prompt registry / template versioning |
| Model evaluation | Prompt evaluation (automated + human) |
| Data drift monitoring | Input distribution monitoring |
| Model serving | LLM API management (gateway, caching) |
| A/B testing | Prompt A/B testing |

The key insight here is that your prompts are your models. When you change a system prompt, you’re changing the behavior of your application just as fundamentally as if you’d retrained a neural network. That means prompts deserve the same rigor you’d apply to any other production artifact — version control, testing, staged rollouts, and the ability to roll back when something goes wrong.

## The Model Registry

### What It Is

If you’ve ever used a container registry like Docker Hub or ECR, you already understand the concept of a model registry. It’s a versioned repository where you store trained models along with all the metadata needed to understand, reproduce, and deploy them. Just as you wouldn’t deploy a container without knowing which image tag you’re running, you shouldn’t deploy a model without knowing exactly which version it is, what data it was trained on, and how it performed during evaluation.

### What to Store

For each model version, your registry should capture a comprehensive record that tells the full story of how that model came to be and how it’s performing. This means storing the model artifact itself — the weights and configuration files — alongside a reference to the exact training data that was used, including its version or content hash so you can reproduce the training run if needed. You’ll also want to preserve the training hyperparameters, because small changes in learning rate or batch size can have outsized effects on model behavior, and you need to be able to trace any production issue back to a specific set of choices.

Beyond the technical artifacts, every model version should include its evaluation metrics — accuracy, precision, recall, latency, or whatever metrics matter for your use case. These metrics are your audit trail, and they’re what your deployment gates will use to decide whether a model is ready for production. Finally, each model should have a model card: a human-readable document that explains what the model does, what it was trained on, its known limitations, and its deployment status — whether it’s in staging, production, or has been retired.

### Options

The good news is that you don’t have to build a model registry from scratch. Several mature options exist, ranging from open-source tools to fully managed cloud services.

| Registry | Type | Notes |
| --- | --- | --- |
| MLflow | Open source | Most common, flexible |
| Vertex AI Model Registry | GCP managed | Integrated with Vertex |
| SageMaker Model Registry | AWS managed | Integrated with SageMaker |
| Weights & Biases | SaaS | Strong experiment tracking |

If you’re looking for an architect’s recommendation, start with MLflow. It’s open source, it runs anywhere, and it covers about ninety percent of what most teams need. You can always migrate to a cloud-managed registry later if your platform strategy demands it, but MLflow gives you the flexibility to avoid lock-in while you’re still figuring out your MLOps patterns. And because it’s the most widely adopted tool in this space, you’ll find that most data scientists already know how to use it, which dramatically reduces your onboarding friction.

## Model Evaluation — Your AI Test Suite

### Why It’s Different

One of the biggest mental shifts for teams coming from traditional software engineering is accepting that you cannot unit-test an AI model the way you test a function or an API endpoint. There’s no assert statement that tells you whether a model is “correct” — because models operate in a world of probabilities and trade-offs, not deterministic logic. Instead of testing individual predictions, you evaluate the model against a carefully curated test set and measure aggregate metrics that tell you whether the model’s overall behavior meets your quality bar.

This is a fundamentally different testing paradigm, and it requires different infrastructure. You need versioned test datasets, automated evaluation pipelines, and clear pass/fail thresholds that are agreed upon by both the data science team and the business stakeholders who will ultimately rely on the model’s predictions.

### Evaluation Framework

The basic shape of a model evaluation pipeline is straightforward, even if the details can get complex:

![](/diagrams/ai-enterprise-architect/chapters/ch06-01.svg)

The critical piece is that pass/fail gate at the end. Without it, evaluation is just an academic exercise. With it, you have a deployment guardrail that prevents bad models from reaching production — the same way a failing test suite should prevent bad code from being merged. Your governance framework should define who sets those thresholds and how they’re updated over time, because a threshold that was appropriate six months ago may be too lax or too strict today.

### Key Metrics

Different types of models call for different evaluation metrics, and choosing the right ones is a genuinely important architectural decision — because what you measure is what you optimize for, and the wrong metric can lead your team to build a model that looks great on paper but fails catastrophically in the real world.

  
| Metric | Use Case | What It Tells You |
| --- | --- | --- |
| Accuracy | Classification | % correct predictions |
| Precision/Recall | When errors have different costs | False positive vs. false negative trade-off |
| BLEU/ROUGE | Text generation | How close to reference text |
| LLM-as-Judge | GenAI quality | Use a stronger model to evaluate a weaker one |
| Latency p95 | All | Worst-case response time |
| Cost per request | All | Operational cost |

Pay special attention to that last row. Cost per request may not feel like a “quality” metric, but in the world of LLM-powered applications, it absolutely is. A model that gives perfect answers but costs ten dollars per request is not a viable production system. Your evaluation suite should treat cost as a first-class constraint, right alongside accuracy and latency.

### Evaluation for GenAI

For LLM-based systems, the evaluation landscape is both newer and more nuanced than traditional ML. You’re no longer just checking whether a classifier got the right label — you’re assessing the quality, safety, and trustworthiness of free-form text. This requires a layered approach that combines automated checks with human judgment.

Factuality is your first line of defense: does the response match known facts? For RAG-based systems, you can automate this by comparing the model’s output against the source documents it was supposed to draw from. If the answer contains claims that aren’t grounded in the retrieved context, that’s a factuality failure. Relevance is equally important: even a factually correct response is useless if it doesn’t actually answer the user’s question. This is where LLM-as-judge techniques shine — you use a stronger, more capable model to evaluate whether a weaker model’s response is on-topic and helpful.

Safety evaluation checks whether the response contains harmful, offensive, or inappropriate content, typically using a dedicated classifier that’s been trained specifically for this purpose. Format compliance is more mechanical but no less critical in production systems — when your application expects JSON output that conforms to a specific schema, a beautifully written response that breaks the schema is a production incident. Finally, hallucination rate tracking measures how often the model invents facts that aren’t present in the source material, which is arguably the single biggest trust risk in any GenAI deployment.

## Monitoring in Production

### What to Monitor

Deploying a model is not the finish line — it’s the starting line. A model in production is a living system that can degrade, drift, and fail in ways that are far more subtle than a crashed server or a thrown exception. Your monitoring strategy needs to cover multiple dimensions simultaneously.

  
| Category | Metrics | Alert When |
| --- | --- | --- |
| Performance | Latency, throughput, error rate | SLA breach |
| Quality | Accuracy on shadow labels, user feedback | Quality drops below threshold |
| Cost | Tokens per request, cost per request, daily spend | Budget threshold exceeded |
| Data | Input distribution shift, new categories appearing | Distribution drift detected |
| Safety | Blocked requests, flagged outputs | Spike in safety violations |

The tricky part is that these categories are interconnected. A shift in input distribution (the Data row) will often lead to a drop in quality (the Quality row), but not always immediately — there can be a lag of days or weeks before degraded inputs produce visibly degraded outputs. This is why monitoring all five dimensions is essential. If you only watch latency and error rates, you’ll catch infrastructure problems but miss the slow, silent quality degradation that is the hallmark of model drift.

### Model Drift

Let’s talk about drift, because it’s the failure mode that catches most teams off guard. Models degrade over time — not because anything is wrong with the model itself, but because the world changes. Customer behavior shifts with the seasons, with the economy, with cultural trends. New products launch and create categories that didn’t exist when the model was trained. Regulations change and alter what’s permissible. The fundamental problem is that a model is a snapshot of the world as it existed during training, and the world doesn’t stand still.

Detecting drift requires comparing current input and output distributions against the distributions the model saw during training. Statistical tests like KL divergence and Population Stability Index (PSI) can automate this comparison and fire alerts when the distributions diverge beyond acceptable thresholds. The key is to set these thresholds thoughtfully — too sensitive and you’ll drown in false alarms, too loose and you’ll miss real degradation until a business stakeholder calls you asking why the model’s predictions have gone haywire.

Once you detect drift, the response depends on your architecture. For traditional ML models, the answer is usually to retrain on more recent data, which is where your automated training pipeline and evaluation gates pay for themselves. For RAG-based GenAI systems, drift often manifests as stale knowledge, and the fix is to update your knowledge base with current documents rather than retraining the underlying language model.

## AI Governance Framework

### Governance Structure

Governance is one of those words that makes engineers’ eyes glaze over, and honestly, that’s fair — too many governance frameworks are bureaucratic theater that slows teams down without reducing risk. But AI governance done well is genuinely different, because the risks of ungoverned AI are not hypothetical. They’re financial, legal, and reputational, and they scale with the number of AI systems you have in production.

A practical AI governance framework has three layers: policies that define the rules, standards that make those rules specific and actionable, and implementation that embeds those standards into your actual infrastructure and workflows.

![](/diagrams/ai-enterprise-architect/chapters/ch06-02.svg)

The AI Governance Board at the top is a cross-functional body that should include your CTO or VP of Engineering, your Chief Data Officer, representatives from Legal and Ethics, and your Enterprise Architecture lead. This isn’t a committee that meets once a quarter to rubber-stamp decisions — it’s an active body that reviews high-risk AI deployments, sets policy, and owns the incident response playbook when something goes wrong. The EA lead’s role on this board is particularly important: you’re the one who sees the full portfolio of AI systems across the enterprise and can spot patterns, redundancies, and risks that individual teams might miss.

### Risk Classification

One of the most practical things you can do as an architect is establish a risk classification framework for AI systems, because not every model needs the same level of oversight. An internal tool that summarizes meeting notes for employees is a fundamentally different risk profile than a system that makes lending decisions or provides medical advice. Treating them the same — either by applying heavy governance to everything or by governing nothing — is a failure of architecture.

  
| Risk Level | Examples | Governance Required |
| --- | --- | --- |
| Low | Internal content summary, search | Model card, basic monitoring |
| Medium | Customer-facing chatbot, recommendations | \+ evaluation suite, human review, A/B testing |
| High | Credit decisions, medical, legal | \+ bias testing, explainability, regulatory review |
| Critical | Autonomous actions, safety-critical | \+ formal verification, continuous audit, HITL |

The beauty of a tiered approach is that it lets you move fast where the risk is low while applying rigorous oversight where the stakes are high. Your low-risk internal tools can be deployed with a model card and basic monitoring, keeping the friction minimal and letting teams iterate quickly. But your high-risk systems — anything touching financial decisions, health outcomes, or legal matters — should go through bias testing, explainability review, and regulatory compliance checks before they see a single production request. This isn’t about slowing innovation; it’s about being thoughtful about where you concentrate your governance energy.

### The AI Register

Here’s something that sounds simple but is surprisingly rare in practice: do you actually know every AI system running in your enterprise? If the answer is “not really,” you’re not alone, but you should be alarmed. Shadow AI — models and LLM-powered tools deployed by individual teams without central visibility — is the new shadow IT, and it carries the same risks of data leakage, compliance violations, and architectural sprawl.

The solution is an AI Register: a central, maintained catalog of every AI system in your organization. For each system, the register should capture the system name and its business owner, because every AI system needs a human who is accountable for its behavior. It should record the risk classification, the data sources the system uses (which is critical for compliance and for understanding the blast radius if a data source is compromised), and the model details including provider, version, and type. The register should also track the last evaluation date and results, any known limitations or failure modes, and the system’s incident history.

If this sounds familiar, it should. This is essentially your enterprise application portfolio — the same artifact that enterprise architects have maintained for decades — extended to cover AI components. The difference is that AI systems have additional dimensions of risk (bias, drift, hallucination) that traditional applications don’t, so your register needs to capture those dimensions explicitly. Treat it as a living document, not a one-time census. If a system isn’t in the register, it shouldn’t be in production.

## Real-World Example: The Retailer’s MLOps Journey

Let me walk you through a real-world example that illustrates why all of this matters in practice, not just in theory. A major retailer with two hundred stores decided to deploy AI for demand forecasting — predicting how much of each product to stock in each store each week. It’s a classic, high-value ML use case, and they had a talented data science team that was eager to deliver.

In the first three months, the data scientists built their models in Jupyter notebooks, working with whatever data was convenient and deploying models by manually copying artifacts to a production server. There was no monitoring, no evaluation gates, and no governance. The models worked well enough during normal periods, but when the holiday season arrived, the forecasting model predicted demand based on 2019 patterns — pre-COVID patterns — because nobody had noticed that the training data hadn’t been updated to reflect the massive shifts in consumer behavior that had occurred since then. The result was two million dollars in overstock losses. Two million dollars, because nobody had a drift detection system that would have flagged the stale training data.

During months four through six, humbled by that expensive lesson, the team invested in building a proper MLOps pipeline. They automated the training process to pull in recent data, added drift detection to flag when input distributions shifted meaningfully, and set up the model to retrain monthly rather than whenever someone remembered to do it. This alone eliminated the category of failure that had caused the overstock incident.

In months seven through nine, they went further by adding evaluation gates to the pipeline. No model could be deployed to production without first passing accuracy thresholds on a held-out test set that was regularly refreshed. They also introduced A/B testing, where new models would serve only ten percent of forecasting requests initially, and only graduate to full traffic once they’d proven themselves against the incumbent model. This gave them confidence that model updates were genuine improvements, not regressions dressed up in better training metrics.

By months ten through twelve, the team had established governance around the entire process. Each forecasting model had a model card documenting its purpose, data sources, known limitations, and performance history. Monthly reviews with business stakeholders ensured that the models were aligned with changing business priorities. And an incident response playbook defined exactly what to do when predictions were significantly off — who to notify, how to diagnose the root cause, and how to roll back to a previous model version.

The total cost of the MLOps platform was about two hundred thousand dollars per year. The cost of the single overstock incident it would have prevented was two million dollars. The math is not subtle, and it’s a story that plays out in organizations of every size. The question isn’t whether you can afford to invest in MLOps — it’s whether you can afford not to.

## Key Takeaways

1.  MLOps is the CI/CD equivalent for AI systems, encompassing automated training, rigorous evaluation, staged deployment, and continuous monitoring — and it deserves the same level of investment and architectural attention as your software delivery pipeline.
2.  Start your MLOps journey at Level 1 by building an automated training pipeline with a model registry, rather than trying to implement every capability at once — you can always grow into higher maturity levels as your portfolio of models expands.
3.  For generative AI applications, focus on the LLMOps equivalents: version your prompts like you version your code, build evaluation suites that test for quality and safety, and monitor costs relentlessly because LLM API bills can grow faster than anyone expects.
4.  Classify every AI system by risk level and apply governance that is proportional to that risk — lightweight oversight for internal tools, rigorous review for anything that touches customers, finances, health, or legal decisions.
5.  Maintain an AI Register that catalogs every AI system in your enterprise, because you cannot govern what you cannot see, and shadow AI is the fastest-growing source of unmanaged risk in most organizations.

## Companion Notebook

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch06-mlops-pipeline.ipynb) — Build a simple MLOps pipeline: train a model, log to MLflow, evaluate against a test set, register the model, and simulate a deployment decision gate.
