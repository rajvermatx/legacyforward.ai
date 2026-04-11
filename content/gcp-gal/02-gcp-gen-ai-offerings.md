---
title: "Google Cloud's Gen AI Offerings"
slug: "gcp-gen-ai-offerings"
description: "The largest exam section. Covers Google's AI-first approach, enterprise AI platform, AI infrastructure
    (TPUs, GPUs, Hypercomputer), prebuilt products (Gemini app, Workspace integrations), customer experience
    tools, and the full Vertex AI developer platform including Model Garden, RAG, and Ag"
section: "gcp-gal"
order: 2
badges:
  - "AI Infrastructure (TPU, GPU)"
  - "Prebuilt Gemini Products"
  - "Vertex AI Platform"
  - "Model Garden & RAG"
  - "Agent Builder & Tooling"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-gal/02-gcp-gen-ai-offerings.ipynb"
---

## 01. Google's AI-First Approach

Google has positioned itself as an **AI-first company** since 2016, when CEO Sundar Pichai declared the shift from "mobile-first" to "AI-first." This philosophy permeates every Google product — from Search and Gmail to Cloud and Android. For Google Cloud specifically, this means AI capabilities are embedded at every layer of the platform.

Google's AI advantages stem from three pillars: (1) **world-class AI research** from Google DeepMind and Google Research, which produced the Transformer architecture, BERT, and Gemini; (2) **massive compute infrastructure** with custom TPUs and hyperscale data centers; and (3) **data at scale** from billions of users across Search, YouTube, Gmail, and Maps.

### Enterprise AI Platform

Google Cloud's enterprise AI strategy centers on **Vertex AI** as the unified platform. Rather than offering disconnected AI services, Google consolidates everything under Vertex AI: model training, deployment, fine-tuning, prompt engineering, RAG, agents, and monitoring. This "single pane of glass" approach simplifies enterprise adoption.

>**Exam Tip:** Google's enterprise AI value proposition centers on three themes the exam tests repeatedly: (1) **choice** — Model Garden offers Google, open-source, and third-party models; (2) **customization** — fine-tuning, RAG, and grounding; (3) **enterprise-grade** — security, compliance, data residency, and VPC controls.

## 02. AI Infrastructure

Training and serving large AI models requires specialized hardware. Google Cloud offers the most comprehensive AI infrastructure portfolio, including custom-designed TPUs, NVIDIA GPUs, and the Hypercomputer architecture that ties them together.

### TPUs (Tensor Processing Units)

**TPUs** are Google's custom Application-Specific Integrated Circuits (ASICs) designed specifically for ML workloads. They excel at matrix multiplication operations that dominate neural network training and inference.

| TPU Version | Focus | Best For |
| --- | --- | --- |
| TPU v5e | Cost-efficient training & inference | Mid-size models, serving at scale, batch processing |
| TPU v5p | Maximum performance training | Training the largest foundation models (Gemini-class) |
| TPU v4 | Proven large-scale training | Large language model training, distributed workloads |

### GPUs on Google Cloud

Google Cloud also provides NVIDIA GPUs for workloads that benefit from the CUDA ecosystem. The **A3 GPU VMs** (powered by NVIDIA H100 GPUs) are designed for large-scale AI training and inference. **A2 GPU VMs** (NVIDIA A100) serve general-purpose ML workloads. **G2 GPU VMs** (NVIDIA L4) are optimized for cost-efficient inference.

### Google Cloud Hypercomputer

The **Hypercomputer** is Google's supercomputing architecture purpose-built for AI. It integrates:

-   **Optimized hardware** — TPUs and GPUs with custom interconnects
-   **Open software** — JAX, PyTorch, TensorFlow with XLA compiler optimization
-   **Flexible consumption** — on-demand, reserved, and Dynamic Workload Scheduler
-   **Managed services** — Vertex AI integrates directly with Hypercomputer resources

>**Key Concept:** The exam tests the distinction between TPUs and GPUs. **TPUs = Google-designed, optimized for Google frameworks (JAX, TF), best price-performance for supported workloads.** **GPUs = NVIDIA, supports CUDA/PyTorch ecosystem, more flexible for diverse workloads.** For Gemini-class model training, Google uses TPUs internally.

## 03. Prebuilt Gemini Products

Google offers ready-to-use AI products powered by Gemini that require no development or infrastructure management. These are designed for end users and business professionals.

### Gemini App, Gemini Advanced, and Gemini Enterprise

| Product | Audience | Model | Key Features |
| --- | --- | --- | --- |
| Gemini App (free) | Consumers | Gemini Pro | Chat, Q&A, writing, image understanding |
| Gemini Advanced | Power users | Gemini Ultra | Extended context, complex reasoning, 1M token window |
| Gemini Enterprise | Organizations | Gemini Ultra | Enterprise security, admin controls, data protection, compliance |

### Gemini for Google Workspace

Gemini is deeply integrated into Google Workspace productivity tools, providing AI assistance directly in the applications people use every day:

📝

#### Gemini in Gmail

Draft emails, summarize threads, suggest replies, and extract action items. "Help me write" generates contextual email drafts from brief instructions.

📄

#### Gemini in Docs

Generate, edit, and refine documents. Create outlines, rewrite for tone, summarize long documents, and brainstorm content.

📊

#### Gemini in Sheets

Generate formulas, analyze data, create charts, and organize information. Converts natural language requests into spreadsheet operations.

🎨

#### Gemini in Slides

Generate presentation content, create images, suggest layouts, and summarize speaker notes. Builds slides from prompts or existing content.

📷

#### Gemini in Meet

Real-time meeting summaries, translated captions, note-taking, and action item extraction. "Take notes for me" captures key discussion points.

💬

#### Gemini in Chat

AI-powered conversation assistance in Google Chat spaces. Summarize conversations, draft responses, and find information across Chat history.

>**Exam Focus:** The exam tests which Workspace integration solves which problem. **Email drafting = Gmail.** **Data analysis = Sheets.** **Meeting summaries = Meet.** **Document generation = Docs.** These are the prebuilt, no-code AI solutions for business users.

## 04. Customer Experience Tools

### Vertex AI Search

**Vertex AI Search** (formerly Enterprise Search) provides Google-quality search for enterprise data. It allows organizations to build search engines over their own documents, websites, and data stores with built-in AI understanding.

Key capabilities include:

-   **Multi-turn search** — conversational follow-up queries that maintain context
-   **Extractive answers** — pulls specific answers from documents, not just links
-   **Summarized answers** — generates AI summaries from multiple sources
-   **Enterprise data connectors** — indexes Cloud Storage, BigQuery, websites, Confluence, and more
-   **Access controls** — respects existing data permissions and ACLs

### Customer Engagement Suite (formerly CCAI)

The **Customer Engagement Suite** (formerly Contact Center AI) brings generative AI to customer service operations. It provides:

🤖

#### Virtual Agent (Dialogflow CX)

AI-powered conversational agents that handle customer inquiries via chat and voice. Now enhanced with Gemini for natural, context-aware conversations.

👥

#### Agent Assist

Real-time AI suggestions for human agents during live conversations. Provides relevant articles, response suggestions, and next-best-action recommendations.

📈

#### Insights

AI-driven analytics on customer conversations. Identifies topics, sentiment trends, and operational inefficiencies across thousands of interactions.

## 05. Vertex AI Platform

**Vertex AI** is Google Cloud's comprehensive AI development platform. It provides everything developers need to build, deploy, and manage generative AI applications. Think of it as the "IDE for AI" on Google Cloud.

### Model Garden

**Model Garden** is a curated catalog of models available through Vertex AI. It provides a single interface to discover, test, and deploy models from multiple sources:

| Category | Description | Examples |
| --- | --- | --- |
| Google First-Party | Google's own foundation models, fully managed | Gemini Pro, Gemini Flash, Imagen, Chirp |
| Google Open Models | Open-weight models from Google, self-deployable | Gemma 2B, Gemma 7B, CodeGemma |
| Open Source | Community models available for deployment | Llama, Mistral, Falcon, Stable Diffusion |
| Third-Party | Partner models with enterprise support | Anthropic Claude, AI21 Jamba |

### Vertex AI Studio

**Vertex AI Studio** is the interactive development environment within Vertex AI for prototyping and testing generative AI models. It provides:

-   **Prompt Design** — visual interface for crafting and testing prompts
-   **Model Comparison** — test the same prompt across multiple models side-by-side
-   **Parameter Tuning** — adjust temperature, top-p, top-k in real-time
-   **System Instructions** — set behavior guidelines for the model
-   **Grounding Configuration** — connect to Google Search or custom data sources
-   **Code Export** — generate Python/cURL code from your prompt configuration

>**Exam Tip:** **Model Garden = model catalog (choose a model).** **Vertex AI Studio = interactive playground (test and configure).** **Vertex AI API = programmatic access (build applications).** The exam tests whether you know when to recommend each.

### Vertex AI Key Capabilities

🔧

#### Fine-Tuning

Customize models with your own data. Supports supervised fine-tuning, distillation, and RLHF. Available for Gemini and Gemma models.

🔍

#### Evaluation

Built-in model evaluation for comparing outputs across models and configurations. Automated metrics plus human evaluation workflows.

🚀

#### Deployment

Deploy models to managed endpoints with autoscaling, traffic splitting, and monitoring. Supports online (real-time) and batch predictions.

🔒

#### Enterprise Controls

VPC Service Controls, CMEK encryption, data residency, IAM, audit logging, and DLP integration for enterprise compliance.

## 06. RAG on Vertex AI

**Retrieval-Augmented Generation (RAG)** is a technique that enhances generative AI by grounding model responses in external knowledge. Instead of relying solely on the model's training data, RAG retrieves relevant documents and includes them as context in the prompt.

Vertex AI provides managed RAG capabilities through multiple components:

| RAG Step | What Happens | Vertex AI Component |
| --- | --- | --- |
| 1\. Index | Documents are chunked, embedded, and stored in a vector database | Vertex AI Vector Search, text embeddings API |
| 2\. Retrieve | User query is embedded and matched against indexed documents | Vertex AI Search, semantic similarity search |
| 3\. Augment | Retrieved documents are added to the model's context window | Prompt construction with grounding |
| 4\. Generate | Model generates a response grounded in the retrieved context | Gemini with grounding enabled |

```
# RAG with Vertex AI: simplified example
from vertexai.generative_models import GenerativeModel, Tool
from vertexai.preview import rag

# Create a RAG corpus from your documents
corpus = rag.create_corpus(display_name="company-docs")
rag.import_files(corpus.name, paths=["gs://my-bucket/docs/"])

# Query with grounding
model = GenerativeModel("gemini-1.5-pro")
rag_tool = Tool.from_retrieval(
    retrieval=rag.Retrieval(
        source=rag.VertexRagStore(rag_corpora=[corpus.name])
    )
)
response = model.generate_content(
    "What is our company's refund policy?",
    tools=[rag_tool]
)
```

>**Key Concept:** **Grounding vs RAG:** Grounding is the broader concept of connecting model outputs to external data. RAG is a specific grounding technique. Vertex AI also supports **Google Search grounding** (connecting Gemini to live web results) as an alternative to custom RAG.

## 07. Agent Builder

**Vertex AI Agent Builder** is a platform for creating AI agents — autonomous systems that can reason, plan, use tools, and take actions to accomplish goals. Agents go beyond simple Q&A by interacting with external systems and making multi-step decisions.

Agent Builder supports multiple agent types:

💬

#### Conversational Agents

Chat-based agents for customer service, IT help desk, or internal Q&A. Support natural conversation with context maintenance across turns.

🔍

#### Search Agents

Agents that search enterprise data to answer questions. Combine Vertex AI Search with generative AI for summarized, sourced answers.

🔧

#### Tool-Using Agents

Agents that can call APIs, execute code, query databases, and interact with external systems. Use function calling to extend capabilities.

🚀

#### Multi-Agent Systems

Orchestrate multiple specialized agents working together. A coordinator agent routes requests to domain-specific sub-agents.

### Agent Tooling and Extensions

Agents are only as powerful as the tools they can use. Vertex AI provides a rich tooling ecosystem:

| Tool Type | Description | Example Use Case |
| --- | --- | --- |
| Function Calling | Model generates structured function call requests | Book a flight, update a database record |
| Extensions | Pre-built connectors to external APIs and services | Google Search, code interpreter, third-party APIs |
| Data Stores | Connect agents to enterprise document stores | Search internal knowledge base, product catalog |
| Code Interpreter | Execute Python code in a sandboxed environment | Data analysis, chart generation, calculations |

```
# Function calling example with Gemini
from vertexai.generative_models import GenerativeModel, FunctionDeclaration, Tool

# Define a function the model can call
get_weather = FunctionDeclaration(
    name="get_weather",
    description="Get current weather for a city",
    parameters={
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name"}
        },
        "required": ["city"]
    }
)

weather_tool = Tool(function_declarations=[get_weather])
model = GenerativeModel("gemini-1.5-pro", tools=[weather_tool])
response = model.generate_content("What's the weather in Tokyo?")
# Model returns: function_call { name: "get_weather" args: { city: "Tokyo" } }
```

## 08. Choosing the Right Offering

A major theme of the exam is matching scenarios to the correct Google Cloud offering. Use this decision framework:

| Scenario | Best Offering | Why |
| --- | --- | --- |
| Business user needs AI in email/docs | Gemini for Workspace | No-code, integrated into existing tools |
| Developer building custom AI chatbot | Vertex AI + Agent Builder | Full control, custom logic, tool integration |
| Enterprise search over internal docs | Vertex AI Search | Managed, respects permissions, AI summaries |
| Contact center automation | Customer Engagement Suite | Purpose-built for customer service workflows |
| Need on-premises LLM deployment | Gemma via Model Garden | Open-weight, self-deployable, no API dependency |
| Generate marketing images at scale | Imagen via Vertex AI | Specialized image generation with enterprise controls |
| Train custom foundation model from scratch | Hypercomputer + TPUs | Maximum compute for large-scale training |

>**Common Mistake:** Do not recommend Vertex AI (developer platform) when the user is a non-technical business person. The exam distinguishes between **prebuilt products** (Gemini app, Workspace) for end users and **developer tools** (Vertex AI, Agent Builder) for technical teams.

Previous

[← 01 · Fundamentals of Gen AI](01-fundamentals-gen-ai.html)

Next

[03 · Improve Model Output →](03-improve-model-output.html)