---
title: "Build Generative AI Applications on Google Cloud"
slug: "generative-ai-apps"
description: "From prompt engineering to RAG pipelines, function calling, and multimodal apps — this module
    covers the full spectrum of building production generative AI applications on Google Cloud using
    Vertex AI, Agent Builder, and Gemini. Master the patterns that appear repeatedly on the MLE exam."
section: "gcp-mle"
order: 17
badges:
  - "Prompt Engineering"
  - "RAG Architecture"
  - "Agent Builder"
  - "Function Calling"
  - "Multimodal & Deployment"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/17-generative-ai-apps.ipynb"
---

## 01. Generative AI Application Patterns on GCP

Generative AI applications on Google Cloud follow a set of repeatable architectural patterns. Understanding these patterns is critical for both the exam and real-world implementation. Each pattern trades off complexity for capability.

1

#### Direct Prompting

Send a prompt to Gemini via Vertex AI and get a response. Simplest pattern — no external data, no tools. Good for summarization, classification, and creative tasks.

2

#### Grounded Generation

Augment the model with Google Search or your own data stores. Reduces hallucination by anchoring responses to verifiable sources.

3

#### RAG (Retrieval-Augmented)

Embed your documents, store in a vector database, retrieve relevant chunks, and feed them into the prompt context for generation.

4

#### Agentic Applications

Use function calling and tool use to let the model take actions: query databases, call APIs, execute code. Built with Vertex AI Agent Builder or custom orchestration.

>**Architecture Decision:** Start with the simplest pattern that meets your requirements. Direct prompting for internal tools, grounding for factual accuracy, RAG for private data, and agents for multi-step workflows.

## 02. Prompting Fundamentals

Effective prompting is the foundation of every GenAI application. The way you structure your prompt directly impacts the quality, consistency, and safety of the model's output.

### System Instructions

**System instructions** define the model's persona, constraints, and output format. They persist across all turns in a conversation. In Vertex AI, system instructions are set when initializing the `GenerativeModel` object and are separate from user messages.

```
# System instruction example
model = GenerativeModel(
    "gemini-1.5-pro",
    system_instruction="""You are a GCP architecture advisor.
    Always respond with specific GCP services.
    Format responses as bullet points.
    Never recommend non-GCP alternatives."""
)
```

### Zero-Shot Prompting

No examples provided. The model relies on pre-trained knowledge. Best for straightforward tasks where the expected output format is obvious.

```
# Zero-shot: classify without examples
prompt = """Classify this support ticket as BILLING, TECHNICAL, or GENERAL.

Ticket: "My Cloud Function keeps timing out after 60 seconds."
Category:"""
```

### Few-Shot Prompting

Provide 2-5 examples to demonstrate the desired input/output pattern. Dramatically improves consistency for classification, extraction, and formatting tasks.

```
# Few-shot: guide output format with examples
prompt = """Extract the GCP service from each sentence.

Sentence: "We store our data in BigQuery."
Service: BigQuery

Sentence: "The model is deployed on Vertex AI."
Service: Vertex AI

Sentence: "We use Cloud Run to host our API."
Service:"""
```

### Chain-of-Thought (CoT)

Ask the model to **"think step by step"** before answering. Significantly improves accuracy on reasoning, math, and multi-step logic problems. Can be combined with few-shot examples that include reasoning traces.

### Output Formatting

Specify the exact output structure you need: JSON, CSV, markdown tables, or structured text. Use explicit format instructions and delimiters to get parseable responses.

```
# Force JSON output
prompt = """Analyze this error log and return a JSON object with keys:
- "service": the GCP service involved
- "error_type": classification of the error
- "severity": HIGH, MEDIUM, or LOW
- "recommendation": one-sentence fix

Error log: Cloud Function 'processOrder' OOM killed at 256MB.

Return ONLY valid JSON, no explanation."""
```

>**Exam Tip:** The exam tests whether you can choose the right prompting technique. Zero-shot for simple tasks, few-shot for consistent formatting, CoT for reasoning, system instructions for persistent behavior.

## 03. Prompt Design Best Practices

### Grounding

**Grounding** connects the model to external data sources so it generates responses based on facts rather than training data alone. On Vertex AI, grounding can use Google Search or your own data stores as sources.

Grounding is distinct from RAG in that it is a built-in platform feature — you configure it at the API call level without building a retrieval pipeline. The model automatically searches and cites sources.

### Temperature Tuning

**Temperature** controls randomness. For factual/analytical tasks, use `temperature=0.0` to `0.3`. For creative tasks like marketing copy, use `0.7` to `1.0`. Higher temperatures increase diversity but reduce reliability.

| Parameter | Low Value Effect | High Value Effect | Use Case |
| --- | --- | --- | --- |
| Temperature | Deterministic, focused | Creative, diverse | 0.0 for facts, 0.9 for creativity |
| Top-K | Fewer token choices | More token choices | 1 for greedy, 40 for balanced |
| Top-P | Narrow probability mass | Wider probability mass | 0.1 for precise, 0.95 for open |
| Max Output Tokens | Short responses | Longer responses | Set based on expected output length |

### Safety Settings

Vertex AI provides configurable safety filters across four harm categories: hate speech, dangerous content, sexually explicit content, and harassment. Each category can be set to `BLOCK_NONE`, `BLOCK_ONLY_HIGH`, `BLOCK_MEDIUM_AND_ABOVE`, or `BLOCK_LOW_AND_ABOVE`. For enterprise applications, use at least medium-level filtering.

>**Important:** Safety settings do not replace responsible AI practices. They are a defense layer, not a complete solution. Always combine with prompt engineering, input validation, and output monitoring.

## 04. Retrieval-Augmented Generation (RAG)

### Why RAG?

Large language models have a knowledge cutoff and can hallucinate facts. RAG solves both problems by retrieving relevant documents from your own data sources and injecting them into the prompt context before generation.

H

#### Reduces Hallucination

The model generates answers grounded in your actual documents rather than making up facts from training data.

P

#### Private Data Access

Your proprietary data never needs to be in the model's training set. RAG gives the model access at inference time without fine-tuning.

F

#### Fresh Information

Documents can be updated in real time. No retraining needed when your knowledge base changes.

C

#### Cost Efficient

RAG is cheaper than fine-tuning for most knowledge-grounding use cases. Fine-tuning changes behavior; RAG adds knowledge.

### RAG Architecture: The Four-Step Pipeline

Every RAG system follows the same fundamental pipeline, regardless of implementation:

![Diagram 1](/diagrams/gcp-mle/generative-ai-apps-1.svg)

RAG Pipeline: Embed → Store → Retrieve → Generate

**Step 1 — Embed:** Convert documents into dense vector representations using an embedding model (e.g., `textembedding-gecko` or `text-embedding-004`). Chunk documents into 500-1000 token segments with overlap.

**Step 2 — Store:** Persist embeddings in a vector database. On GCP, options include Vertex AI Vector Search (managed, high-scale), AlloyDB with pgvector, Cloud SQL with pgvector, or Spanner with vector capabilities.

**Step 3 — Retrieve:** At query time, embed the user's question and perform approximate nearest neighbor (ANN) search to find the top-k most relevant document chunks.

**Step 4 — Generate:** Inject the retrieved chunks into the prompt as context and send to Gemini for answer generation. The model synthesizes a response using only the provided context.

### Vertex AI RAG Tools

**Vertex AI Agent Builder (RAG mode)** provides a low-code/no-code RAG pipeline. Upload documents to a data store, and Agent Builder handles chunking, embedding, indexing, and retrieval automatically. Best for teams without ML engineering resources.

**Custom RAG with Vertex AI Vector Search** gives you full control over every stage. You define the chunking strategy, choose the embedding model, configure the ANN index parameters (tree depth, leaf size), and build your own retrieval logic. Best for production systems requiring fine-tuned relevance.

| Feature | Agent Builder RAG | Custom Vector Search |
| --- | --- | --- |
| Setup complexity | Low (console or API) | High (code required) |
| Chunking control | Automatic | Full control |
| Embedding model | Default (Google) | Any model |
| Index tuning | Managed | Configurable ANN params |
| Scale | Millions of docs | Billions of vectors |
| Best for | Rapid prototyping, SMBs | High-traffic production |

>**Exam Pattern:** When the question asks about reducing hallucination with private data, the answer is RAG (not fine-tuning). When it asks about changing model behavior or style, the answer is fine-tuning (not RAG).

## 05. Vertex AI Agent Builder

**Vertex AI Agent Builder** (formerly Dialogflow CX + Enterprise Search) is Google's managed platform for building search, conversational, and generative AI applications without writing ML code.

### Data Stores

Data stores are the knowledge base for your application. You can ingest data from: Cloud Storage (PDFs, HTML, text), BigQuery tables, websites (crawled), or the Vertex AI API for structured data. Agent Builder automatically processes, chunks, and indexes the content.

### Search Apps

Build enterprise-grade search experiences over your data stores. Features include: natural language queries, auto-generated summaries with citations, faceted filtering, and relevance tuning. Deploy as a widget or API endpoint.

### Conversation Agents

Create multi-turn conversational agents grounded in your data. Agents can: answer questions from data stores, follow conversation flows (intents, pages), call external tools via webhooks, and hand off to human agents. Supports text and voice channels.

>**Agent Builder vs Custom:** Use Agent Builder when you need a working application in days, not months. Use custom code (LangChain, LlamaIndex, or Vertex AI SDK) when you need fine-grained control over retrieval, ranking, and orchestration logic.

## 06. Grounding with Google Search and Custom Data

**Grounding** is a Vertex AI feature that attaches real-time information sources to your generative model calls. Unlike RAG (where you build the retrieval pipeline), grounding is a parameter you set in the API call.

### Google Search Grounding

When enabled, the model automatically searches Google to find relevant information before generating a response. The response includes inline citations and source URLs. Ideal for questions about current events, facts, or anything beyond the model's training cutoff.

```
# Grounding with Google Search
from vertexai.generative_models import GenerativeModel, Tool
from vertexai.preview.generative_models import grounding

model = GenerativeModel("gemini-1.5-pro")
tool = Tool.from_google_search_retrieval(
    grounding.GoogleSearchRetrieval()
)
response = model.generate_content(
    "What were Google Cloud's latest announcements at Cloud Next?",
    tools=[tool]
)
print(response.text)
```

### Custom Data Grounding

Ground responses against your own Vertex AI Agent Builder data stores. The model searches your indexed documents and generates answers with citations pointing to your content.

```
# Grounding with custom data store
tool = Tool.from_retrieval(
    grounding.Retrieval(
        grounding.VertexAISearch(
            datastore="projects/my-project/locations/global/collections/default_collection/dataStores/my-store"
        )
    )
)
response = model.generate_content(
    "What is our company's vacation policy?",
    tools=[tool]
)
```

>**Grounding vs RAG:** Grounding is a managed, API-level feature with limited customization. RAG is a pattern you build yourself for full control over chunking, ranking, and filtering. Choose grounding for simplicity; choose RAG for precision.

## 07. Function Calling with Gemini

**Function calling** lets the model generate structured function invocations instead of (or alongside) text. You define tools with their parameters, and the model decides when and how to call them based on the user's request.

### How It Works

(1) You define a set of `Tool` objects with function declarations (name, description, parameters as JSON schema). (2) The model receives the user query and your tool definitions. (3) If the model determines a tool call is needed, it returns a `FunctionCall` object with the function name and arguments. (4) Your application executes the function and sends the result back. (5) The model generates a final response using the function result.

```
from vertexai.generative_models import (
    GenerativeModel, Tool, FunctionDeclaration
)

# Define the tool
get_weather = FunctionDeclaration(
    name="get_current_weather",
    description="Get the current weather for a given location",
    parameters={
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City and state, e.g. San Francisco, CA"
            }
        },
        "required": ["location"]
    }
)

tool = Tool(function_declarations=[get_weather])
model = GenerativeModel("gemini-1.5-pro", tools=[tool])

# The model returns a FunctionCall, not text
response = model.generate_content("What's the weather in Tokyo?")
function_call = response.candidates[0].content.parts[0].function_call
print(f"Function: {function_call.name}")
print(f"Args: {dict(function_call.args)}")
```

### Automatic Function Calling

Vertex AI supports **automatic function calling** where the SDK executes your Python functions directly based on the model's function calls. Define your functions, wrap them as tools, and the SDK handles the round-trip automatically.

>**Exam Tip:** Function calling is different from code execution. Function calling generates structured tool invocations that your application executes. Code execution runs Python code in a sandbox. Know when to use each.

## 08. Multimodal Applications

Gemini models are natively multimodal, accepting text, images, video, audio, and PDF inputs in a single prompt. This enables powerful applications that understand and reason across different content types.

### Text + Image

Send images alongside text prompts for visual Q&A, image captioning, diagram interpretation, OCR, and visual classification. Images can be passed as base64-encoded bytes, GCS URIs, or file objects.

### Text + Video

Gemini can process video files (up to 1 hour for Gemini 1.5 Pro) for summarization, content moderation, visual search, and scene understanding. Video is processed frame by frame with audio transcription.

### Common Multimodal Patterns

D

#### Document Understanding

Extract structured data from invoices, forms, and contracts by sending PDFs/images to Gemini with extraction prompts.

V

#### Visual QA

Answer natural language questions about images: "What product is shown?", "Is this safe?", "Describe defects."

M

#### Content Moderation

Analyze images and video for policy compliance, safety violations, or brand guideline adherence.

A

#### Accessibility

Generate alt-text for images, video captions, and audio descriptions using multimodal understanding.

## 09. Deploying GenAI Applications

Once your GenAI application is built, you need to serve it reliably. Google Cloud offers several options depending on scale, latency requirements, and operational complexity.

| Service | Best For | Scaling | Complexity |
| --- | --- | --- | --- |
| **Cloud Run** | Stateless APIs, webhooks, simple apps | Auto (0 to N) | Low |
| **App Engine** | Web apps with standard runtimes | Auto | Low |
| **GKE** | Complex microservices, GPU workloads | Manual / HPA | High |
| **Cloud Functions** | Event-driven, lightweight triggers | Auto | Very Low |

### Cloud Run Deployment Pattern

Cloud Run is the most common choice for GenAI apps. Package your application as a container, deploy it, and Cloud Run handles scaling (including scale-to-zero). Set environment variables for project ID and location. Use a service account with Vertex AI permissions.

```
# Dockerfile for a GenAI Flask app on Cloud Run
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=8080
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
```

```
# Deploy to Cloud Run
gcloud run deploy genai-app \
  --source . \
  --region us-central1 \
  --service-account genai-sa@my-project.iam.gserviceaccount.com \
  --set-env-vars PROJECT_ID=my-project,LOCATION=us-central1 \
  --allow-unauthenticated
```

>**Architecture Note:** For production GenAI apps, always use a dedicated service account with least-privilege IAM roles (roles/aiplatform.user for Vertex AI calls). Never use the default compute service account.

## 10. Exam Focus

This section distills the most heavily tested topics for the MLE exam from this course.

### RAG vs Fine-Tuning Decision

| Scenario | Choose | Why |
| --- | --- | --- |
| Need to add company knowledge | RAG | Inject knowledge at inference, no retraining |
| Need to change output style/format | Fine-tuning | Modify model behavior, not just knowledge |
| Data changes frequently | RAG | Update documents without retraining |
| Need domain-specific terminology | Fine-tuning | Teach the model specialized language |
| Reduce hallucination on private data | RAG | Ground responses in retrieved facts |
| Improve task accuracy across the board | Fine-tuning | Optimize model weights for specific tasks |

### Agent Builder vs Custom Code

| Scenario | Choose | Why |
| --- | --- | --- |
| Quick prototype, no ML team | Agent Builder | Low-code, fast setup |
| Complex ranking/reranking logic | Custom | Need fine-grained relevance tuning |
| Multi-source retrieval with fusion | Custom | Agent Builder uses single data store |
| Enterprise search with citations | Agent Builder | Built-in citation and summarization |

### Grounding Strategy Selection

-   Current events / factual questions → Google Search grounding
-   Internal company data → Custom data store grounding or RAG
-   Need full control over retrieval → Custom RAG pipeline
-   Simple factuality improvement → API-level grounding parameter
-   Creative tasks (poetry, brainstorming) → No grounding needed

>**High-Frequency Exam Topics:** Function calling vs code execution, RAG vs fine-tuning, Agent Builder vs custom, grounding with Google Search vs data stores, Cloud Run for serving GenAI, and safety settings configuration — these appear repeatedly.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Building generative AI applications on Google Cloud revolves around the **Vertex AI SDK** and a set of composable patterns. At the simplest level, you send prompts to foundation models like **Gemini** through the API, controlling output with temperature, top-p, and safety settings. To improve factual accuracy, you **ground** responses — either via Google Search or enterprise data stores. For proprietary knowledge, you build a **RAG pipeline**: documents are chunked, embedded, and stored in a vector database (Vertex AI Vector Search), then relevant chunks are retrieved at query time and injected into the prompt context. **Agent Builder** provides a no-code path for search and conversation apps, while **function calling** lets models invoke external APIs and tools. For production deployment, GenAI apps run on **Cloud Run** or **GKE**, with Vertex AI endpoints handling model serving. Understanding when to use grounding vs. RAG vs. fine-tuning, and choosing between Agent Builder and custom pipelines, are the core architectural decisions every GCP GenAI project requires.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| When would you use RAG vs. fine-tuning for a GenAI application? | Do you understand that RAG is for dynamic, retrievable knowledge while fine-tuning changes model behavior/style? |
| Explain grounding in Vertex AI. What are the different grounding sources? | Can you distinguish Google Search grounding from custom data store grounding and articulate when each applies? |
| How does function calling work with Gemini, and how is it different from code execution? | Do you understand that function calling returns a structured request for the app to execute, while code execution runs code server-side? |
| Walk me through designing a RAG pipeline on GCP end-to-end. | Can you describe the full pipeline: document ingestion, chunking, embedding, vector store, retrieval, and prompt augmentation? |
| When would you choose Agent Builder over building a custom GenAI application? | Do you understand the trade-offs between no-code convenience and full architectural control? |

### Model Answers

>**Q1 — RAG vs. Fine-Tuning:** **RAG** is the right choice when you need the model to reference specific, frequently updated knowledge (product catalogs, internal docs, policies). It keeps the model frozen and injects relevant context at query time via retrieval. **Fine-tuning** is appropriate when you need to change the model's tone, style, or teach it a specialized task format — not when you need it to "know" specific facts. Fine-tuning bakes knowledge into weights (which can go stale), while RAG dynamically retrieves current information. On GCP, RAG uses Vertex AI Vector Search + embeddings, while fine-tuning uses Vertex AI supervised tuning jobs. A common pattern is combining both: fine-tune for style, RAG for knowledge.
>**Q2 — Grounding in Vertex AI:** Grounding attaches external knowledge to model responses to reduce hallucination. **Google Search grounding** uses live web results — ideal for current events and general factual questions. **Custom data store grounding** connects to your enterprise data via Vertex AI Search data stores — ideal for internal knowledge bases. Grounding is configured as a parameter in the API call, and the response includes grounding metadata with source citations. The key distinction from RAG is that grounding is a built-in API feature with no custom retrieval pipeline to manage, while RAG gives you full control over chunking, embedding models, vector stores, and retrieval logic.
>**Q3 — Function Calling vs. Code Execution:** **Function calling** lets you declare available tools (as JSON schemas) to the model. When the model determines a tool is needed, it returns a structured function call request — but your application code executes the actual function and returns the result. The model never runs code itself. **Code execution** (available in Gemini) lets the model write and execute Python code in a sandboxed environment on Google's servers. Use function calling when you need to invoke external APIs, databases, or business logic. Use code execution when the model needs to perform calculations, data transformations, or generate charts.
>**Q4 — End-to-End RAG Pipeline on GCP:** (1) **Ingestion**: Documents are loaded from Cloud Storage or other sources. (2) **Chunking**: Documents are split into semantically meaningful chunks (typically 256–1024 tokens) using overlap to preserve context. (3) **Embedding**: Each chunk is converted to a vector using Vertex AI text embedding models (e.g., textembedding-gecko). (4) **Indexing**: Vectors are stored in Vertex AI Vector Search (formerly Matching Engine) with metadata for filtering. (5) **Retrieval**: At query time, the user query is embedded, and the top-k nearest neighbors are retrieved using approximate nearest neighbor (ANN) search. (6) **Augmented generation**: Retrieved chunks are inserted into the prompt context, and Gemini generates a grounded response. Vertex AI RAG Engine provides a managed version of this entire pipeline.
>**Q5 — Agent Builder vs. Custom:** **Agent Builder** (Vertex AI Search and Conversation) is the right choice when you need a search or chatbot application quickly, your data fits supported formats (websites, Cloud Storage documents, BigQuery), and you don't need custom retrieval logic. It handles chunking, embedding, indexing, and serving automatically. Choose a **custom pipeline** when you need control over embedding models, chunking strategies, retrieval algorithms, re-ranking, multi-step reasoning, or integration with external tools via function calling. Custom also makes sense when you need to combine RAG with agents, chain multiple model calls, or implement complex guardrails. Most production systems start with Agent Builder for prototyping, then migrate to custom when requirements exceed its capabilities.

### System Design Scenario

>**Design Challenge:** **Scenario:** Your company has 50,000 internal policy documents that update weekly. Customer service agents need a chatbot that answers policy questions with source citations and handles 200 concurrent users with sub-3-second responses.  
>   
> **A strong answer covers:** (1) Data pipeline — Cloud Storage for documents, a Dataflow or Cloud Function pipeline that detects new/changed documents and triggers re-chunking and re-embedding. (2) Chunking strategy — semantic chunking with ~512 token chunks and 50-token overlap, preserving document metadata (title, date, section). (3) Vector store — Vertex AI Vector Search with metadata filtering (by department, document type). (4) Retrieval — hybrid search combining vector similarity with keyword matching, top-10 retrieval with a cross-encoder re-ranker to select top-3. (5) Generation — Gemini with retrieved chunks in context, system prompt enforcing citation format, low temperature (0.1–0.2). (6) Serving — Cloud Run with auto-scaling, connection pooling to Vector Search. (7) Weekly refresh — incremental index updates rather than full rebuilds. (8) Evaluation — track retrieval precision/recall and answer faithfulness with human review samples.

### Common Mistakes

-   **Choosing fine-tuning when RAG is needed** — Fine-tuning does not reliably teach a model new factual knowledge. If users ask about specific documents, policies, or data, RAG is the correct pattern. Fine-tuning is for behavior and style, not knowledge injection.
-   **Ignoring chunk size trade-offs** — Chunks that are too small lose context and produce fragmented answers. Chunks that are too large dilute relevance and waste context window tokens. Always experiment with chunk sizes (256, 512, 1024 tokens) and measure retrieval quality on representative queries.
-   **Using Google Search grounding for internal data** — Google Search grounding only accesses public web content. For proprietary or internal documents, you must use custom data store grounding or a RAG pipeline. Mixing these up is a common exam and interview pitfall.

Previous

[← 16 · Build & Deploy on Vertex AI](16-build-deploy-vertex-ai.html)

Next

[18 · Responsible AI — Fairness →](18-responsible-ai-fairness.html)