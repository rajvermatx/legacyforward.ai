---
title: The AI Landscape — An Architect's Map
slug: ai-landscape-for-architects
description: >-
  Not all AI is the same, and treating it as if it were is how architecture reviews go sideways. This chapter maps the AI stack onto the layered architecture thinking you already know — so you can evaluate any AI technology that crosses your desk with clear eyes.
section: ai-enterprise-architect
order: 2
notebook: >-
  https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch02-model-landscape.ipynb
audioUrl: /audio/ai-enterprise-architect/audio/02-ai-landscape-for-architects.mp3
podcastUrl: /audio/ai-enterprise-architect/podcast/02-ai-landscape-for-architects.mp3
---

# The AI Landscape — An Architect's Map

## Cutting Through the Hype

You have lived through waves of technology hype before — cloud computing, microservices, blockchain, and now AI. Every vendor pitch deck has been hastily rewritten to include the words "AI-powered." Every product demo seems to feature a chatbot whether it makes sense or not.

Your job, right now, is to see through the marketing and understand what is actually useful for your enterprise. This chapter builds a mental framework that will help you evaluate any AI technology that crosses your desk today or three years from now. Not model benchmarks. Not startup funding rounds. A map drawn specifically for someone who thinks in terms of architecture layers, integration patterns, and long-term maintainability.

## The AI Stack — Mapped to What You Know

AI follows the same layered architecture pattern you have been working with for years. At the top, applications: the user-facing experiences powered by AI. Below that, orchestration: where you wire AI components together into workflows, chains, and agentic systems. The models layer contains the actual AI engines — large language models, vision models, embedding models. Beneath the models, a data platform: your lakes, vector stores, and ETL pipelines that feed data into the system. At the foundation, infrastructure: the GPUs, TPUs, and cloud services that provide raw compute.

![](/diagrams/ai-enterprise-architect/chapters/ch02-00.svg)

If you are familiar with TOGAF, this maps directly to your technology architecture. Each layer now contains some new and unfamiliar components, but the patterns of layered architecture, separation of concerns, and well-defined interfaces between layers all still apply. Extend what you know — do not start over.

## Types of AI That Matter for Architects

![](/diagrams/ai-enterprise-architect/chapters/ch02-01.svg)

One of the fastest ways to lose credibility in an architecture review is to treat all AI as if it were the same thing. The architectural implications of a fraud detection model are radically different from those of a generative chatbot, and both are different again from a computer vision system running quality inspection on a factory floor.

### Traditional ML (Predictive AI)

Traditional machine learning is the workhorse that has been quietly running in enterprises for years. It takes input data and predicts an outcome: fraud detection systems flagging suspicious transactions, demand forecasting models helping supply chain teams plan inventory, churn prediction engines alerting customer success before a high-value client walks away. Well-understood problems with well-understood solutions.

From an architecture standpoint, traditional ML is relatively contained and predictable. You need a training pipeline to build and update the model, a serving endpoint where other systems call it for predictions, and monitoring to track whether accuracy is drifting over time. The model itself is essentially a black box behind a clean API — exactly how you want it from an integration perspective.

The sweet spot is structured data with well-defined prediction tasks, especially when you need to make high-volume decisions quickly. Do not reach for a large language model when a gradient-boosted tree will do the job faster and cheaper.

### Generative AI (LLMs, Image, Video)

Generative AI is where most of the current excitement — and confusion — lives. These models create new content: text, images, code, video. They power chatbots, document generation systems, code assistants, and creative tools. For many enterprise use cases — automating knowledge work, building natural language interfaces for complex systems — they are genuinely transformative.

The architectural implications are also far larger than those of traditional ML. These models are expensive to run, often costing orders of magnitude more per inference call. They require careful prompt management, a new discipline that sits somewhere between software engineering and content design. They can hallucinate — confidently producing incorrect information — which means you often need to ground them in your enterprise data through patterns like Retrieval-Augmented Generation. They introduce new categories of security concerns, including prompt injection attacks and the risk of sensitive data leaking through model interactions.

Generative AI shines when you are dealing with unstructured data processing, content generation, natural language interfaces, or automating knowledge work that previously required a human to read, synthesize, and write. It requires a much more thoughtful architecture than "call the API and display the response."

### Computer Vision

Computer vision enables machines to understand and interpret images and video. In the enterprise: quality inspection on manufacturing lines, automated document processing through intelligent OCR, surveillance and security systems, medical imaging analysis. A mature and well-proven area with clear ROI in the right contexts.

The architecture challenges are distinct from text-based AI. You are dealing with high compute requirements, large data volumes (video streams can generate enormous amounts of data), and often the need for edge deployment. The key architectural decision is where inference should run: in the cloud, where you have unlimited compute but need to stream data over a network, or at the edge, where latency is lower but hardware is constrained. For any use case involving real-time video processing at scale, this decision can make or break the project.

### Speech and NLP

Speech processing and natural language processing — transcription, translation, sentiment analysis, entity extraction — have matured significantly and are now table stakes for many enterprise applications, from call center analytics to multilingual customer support.

From an architecture perspective: real-time processing is often a hard requirement; users cannot wait thirty seconds for a voice command to be transcribed. This means streaming architectures that can handle audio data in near-real-time. Multi-language support adds complexity, as models may perform unevenly across languages. Increasingly, speech and NLP capabilities are being combined with large language models to create systems that can not only transcribe what was said but understand the intent and generate an intelligent response. That combination creates powerful applications but compounds the architectural complexity.

## The Model Landscape

### Foundation Models (The Big Ones)

The foundation model landscape is evolving rapidly. As an architect, you need a working understanding of the major players and what differentiates them.

| Model Family | Provider | Strengths | Typical Use |
| --- | --- | --- | --- |
| GPT-4o, o1 | OpenAI | Reasoning, code, general | Broad enterprise use |
| Claude | Anthropic | Long context, safety, analysis | Document processing, coding |
| Gemini | Google | Multimodal, Google integration | GCP-native workloads |
| Llama | Meta (open) | Customizable, self-hosted | Privacy-sensitive workloads |
| Mistral | Mistral (open) | Efficient, multilingual | European enterprises, edge |

Beyond picking a model family, there is a more fundamental architectural decision embedded in this landscape. API-based models — OpenAI's GPT-4, Anthropic's Claude — are faster to get started with and require no ML operations expertise, but they create a vendor dependency and mean your data leaves your security perimeter with every call. Self-hosted models — open models like Llama or Mistral — give you more control over data residency and model behavior, but come with a significantly higher operational burden. Neither approach is universally better. The right answer depends on your specific constraints around data sensitivity, cost tolerance, and team capabilities.

### Specialized Models

Reaching for the biggest, most capable foundation model for every problem is like using a fire hose to water a houseplant. Many enterprise tasks are better served by smaller, more focused models that do one thing well.

Embedding models like `text-embedding-3-large` are purpose-built to convert text into vector representations that enable semantic search — far more efficient than asking a general-purpose LLM to understand similarity. Lightweight classifiers can route customer inquiries, label support tickets, and triage incoming documents with lower latency and dramatically lower cost than a full-size foundation model. Document AI and OCR models specialize in extracting structured data from invoices, contracts, and forms. Speech-to-text models are purpose-built for transcription.

Always use the smallest model that reliably solves the problem. A seven-billion parameter model running on a single GPU may outperform GPT-4 on your specific domain task at one-hundredth of the cost. Right-sizing model choices is one of the highest-leverage architectural decisions you can make. Many organizations get this wrong because they default to the most impressive-sounding option rather than the most appropriate one.

## Vendor Landscape for Architects

### Cloud AI Platforms

If your organization is already invested in one of the major cloud platforms, that will naturally shape your AI platform choices. Each of the big three has built out a comprehensive AI service portfolio.

| Platform | Key Services | Best For |
| --- | --- | --- |
| Google Cloud (Vertex AI) | Model Garden, Agent Builder, Gemini | GCP shops, multimodal |
| AWS (Bedrock, SageMaker) | Model marketplace, fine-tuning | AWS shops, existing ML teams |
| Azure (OpenAI Service, AI Studio) | GPT-4, Copilot stack | Microsoft ecosystem |

Most enterprises will gravitate toward the AI services offered by their primary cloud provider, and that is generally a sensible default. The integration benefits — shared identity management, network connectivity, billing consolidation, compliance posture — are significant. Do not let cloud loyalty blind you to cases where a different provider offers a meaningfully better solution for a specific workload. Multi-cloud AI is more common than you might expect, especially for organizations that want to avoid putting all their AI eggs in one vendor's basket.

### AI Infrastructure Vendors

Beyond the cloud platforms, a rapidly growing ecosystem of specialized AI infrastructure vendors fills important gaps in the stack.

Vector databases — Pinecone, Weaviate, Qdrant, Chroma, pgvector — are now essential for any AI system that needs to search over large collections of unstructured data. They store and query vector embeddings far more efficiently than general-purpose databases.

Orchestration frameworks like LangChain, LlamaIndex, and Microsoft's Semantic Kernel provide the plumbing for connecting AI models with data sources, tools, and multi-step workflows. These frameworks are evolving quickly and are worth evaluating carefully. They can dramatically accelerate development, but they can also introduce abstraction layers that obscure what is happening under the hood.

Observability tools — LangSmith, Weights & Biases, Arize — help you monitor model performance, debug issues in production, and track the quality of AI outputs over time. This is not optional. Running AI in production without proper observability is like running a web application without logging or monitoring.

Guardrails tooling — Guardrails AI, NVIDIA's NeMo Guardrails, and various custom solutions — helps you enforce safety policies, content filters, and output validation on AI-generated content. Treat guardrails as a required component of any production AI system.

### Build vs. Buy Decision Framework

| Factor | Build/Self-Host | Use API/SaaS |
| --- | --- | --- |
| Data sensitivity | High (regulated data) | Low (public data OK) |
| Customization needs | Deep domain-specific | General purpose |
| Team ML expertise | Strong ML eng team | Limited ML skills |
| Volume | Very high (cost advantage) | Low-moderate |
| Time to value | Can wait 3-6 months | Need it now |

Data sensitivity is often the single strongest forcing function. If you are working with healthcare records, financial data, or classified information, compliance requirements may simply rule out sending that data to a third-party API. If you need to get something into production quickly and your team does not have deep ML engineering expertise, trying to self-host and fine-tune your own models is likely to end in frustration and delay. Be honest about where your organization actually is, not where you wish it were.

## What Architects Get Wrong

**Treating all AI as if it were one thing.** A fraud detection model and a customer-facing chatbot have completely different architectural profiles: different latency requirements, different cost structures, different risk profiles, different governance needs. When an architecture review lumps them together under a single "AI platform" box on a diagram, the thinking has not gone deep enough.

**Over-indexing on model choice.** It is easy to get drawn into debates about whether GPT-4 or Claude or Gemini is the "best" model, but in most enterprise deployments, the model turns out to be the easiest part of the puzzle. The genuinely hard work is building reliable data pipelines that feed the model with accurate, up-to-date information, designing integration patterns that connect AI outputs back into business processes, and establishing governance frameworks that ensure the system behaves responsibly over time. If you are spending eighty percent of your architecture discussions on model selection, your priorities are inverted.

**Ignoring cost at design time.** A single GPT-4 API call might cost around three cents, which sounds cheap. At one million requests per day, that is thirty thousand dollars a day — nearly eleven million dollars a year. Cost modeling needs to be a first-class concern from day one, not something you discover painfully in your first production invoice. Design for cost optimization the same way you design for performance and reliability. Chapter 12 provides a complete framework for AI cost modeling, including token economics, GPU budgeting, and optimization strategies at enterprise scale.

**Assuming AI replaces existing systems.** AI augments your existing systems. You still need your ERP, your CRM, your data warehouse, and your integration middleware. AI adds a new layer of intelligence on top of those systems, but it does not eliminate the need for them. Architects who understand this build AI capabilities that integrate cleanly with the existing enterprise landscape. Architects who do not end up with isolated AI experiments that never make it into production.

## Companion Notebook

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch02-model-landscape.ipynb) — Call three different LLMs (OpenAI, Claude, Gemini) with the same prompt. Compare response quality, latency, cost, and token usage. See why model selection matters.
