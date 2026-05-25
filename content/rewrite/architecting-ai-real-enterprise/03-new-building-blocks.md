---
title: New Building Blocks — AI Components for Your Architecture
slug: new-building-blocks
description: >-
  Six new components belong in your architecture toolkit: LLMs, embeddings, vector databases, prompt templates, RAG, and agents. Each has specific latency, cost, and determinism properties. Here is how to reason about them the same way you reason about the components you already know.
section: ai-enterprise-architect
order: 3
notebook: >-
  https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch03-building-blocks-demo.ipynb
audioUrl: /audio/ai-enterprise-architect/audio/03-new-building-blocks.mp3
podcastUrl: /audio/ai-enterprise-architect/podcast/03-new-building-blocks.mp3
---

# New Building Blocks — AI Components for Your Architecture

## Expanding Your Component Library

Over the course of your career as an enterprise architect, you have built up a mental library of components you instinctively reach for when designing systems. Databases, message queues, API gateways, load balancers, caching layers — building blocks you know intimately, whose trade-offs and failure modes you can reason about without effort.

AI introduces a new set of components to that library. You do not need to throw away anything you already know. These new pieces fit alongside your existing ones, and many of them behave in ways that will feel familiar once you understand their architectural properties. This chapter walks through each one so that by the end, you can place them in your architecture diagrams right next to the components you have been using for years.

## LLMs — The Universal Text Processor

### What It Is

A Large Language Model accepts text as input and produces text as output. Strip away the hype and what you have is essentially a very capable — and very expensive — function call:

```
f(prompt: string) → response: string
```

What makes this function remarkable is its versatility. A single LLM, without modification or retraining, can summarize a document, translate it, classify it, extract structured data from it, generate new content, reason through complex questions, and answer follow-up questions in context. All of this is accomplished by changing the prompt — the text instruction you send to the model. That is a fundamentally different paradigm from traditional software components, where each capability typically requires a separate service or library.

### Architectural Properties

| Property | Value |
| --- | --- |
| Latency | 500ms – 30s (depends on output length) |
| Determinism | Low (temperature-dependent) |
| Cost | $0.001 – $0.10 per call (varies by model/length) |
| Stateless? | Yes (no memory between calls) |
| Scalability | Horizontal (API-based) or GPU-bound (self-hosted) |
| Failure modes | Hallucination, refusal, format violations |

Think of an LLM like an external SaaS service. High capability, variable latency, pay-per-use pricing. You do not control its internals, and you cannot predict its exact behavior with the same certainty you would expect from a deterministic function. That is not a flaw. It is a trade-off you design around, just as you design around the eventual consistency of a distributed database or the latency characteristics of a third-party API.

### Design Considerations

Idempotency is one of the first things you will grapple with. Unlike a traditional function where the same input reliably produces the same output, sending the same prompt to an LLM twice may yield different results. If your system requires consistency — compliance reports, structured records — set the model's temperature to zero and implement a caching layer in front of it. Identical requests return identical responses, and you avoid paying for redundant computation.

Timeout handling deserves careful attention. Long generations can take thirty seconds or more. In a synchronous request-response architecture, that latency is often unacceptable. Design for asynchronous interaction wherever possible: queue the request, let the model work, deliver the result when it is ready.

Cost management does not exist with most traditional components, but it matters here. Every token that goes in and comes out costs money, and those costs add up fast if you are not deliberate about prompt design. Strip unnecessary context. Avoid sending entire documents when a summary will do. Monitor token usage the way you monitor database query costs. Chapter 12 covers multi-model routing strategies that can reduce inference costs by 60 to 80 percent.

Build queuing and retry logic into your integration layer from day one for rate limits. This is not unlike the work you have done with other rate-limited external services — the patterns are the same.

## Embeddings — Making Text Searchable

### What It Is

An embedding model takes a piece of text and converts it into a fixed-length vector of numbers, typically 768 to 3072 dimensions. The useful property: texts with similar meanings produce vectors that are mathematically close to each other, even when they use completely different words.

```
f("How do I reset my password?") → [0.023, -0.041, 0.089, ...]
f("I forgot my login credentials") → [0.021, -0.038, 0.092, ...]  ← similar!
```

This enables semantic search — finding relevant content based on meaning rather than exact keyword matches. If you have been frustrated by a search system that returned nothing because the user typed "car" instead of "automobile," you already understand the problem embeddings solve.

### Architectural Properties

| Property | Value |
| --- | --- |
| Latency | 10–100ms |
| Determinism | High (same input → same vector) |
| Cost | $0.0001 per call |
| Output | Fixed-size vector (768–3072 dimensions) |

Think of embeddings as an indexing service. You run the embedding model once when content is created or updated, store the resulting vector, and query against those stored vectors at read time. Write-time computation that pays off at read time — a pattern you already know from full-text search indexes and materialized views. The difference is that this index captures meaning, not just tokens.

## Vector Databases — The New Index

### What It Is

A vector database is purpose-built to store and query embedding vectors efficiently. Its core operation is nearest-neighbor search: given a query vector, it finds the ten or twenty most similar vectors in the database in milliseconds, even when the dataset contains millions of entries.

### Options

| Database | Type | Best For |
| --- | --- | --- |
| pgvector | PostgreSQL extension | Teams already on PostgreSQL |
| Pinecone | Managed SaaS | Zero-ops, fast start |
| Weaviate | Open source | Self-hosted, flexible |
| Chroma | Lightweight | Prototyping, small datasets |
| Qdrant | Open source | Performance-sensitive |

If your organization is already running PostgreSQL — and most are — the pragmatic starting point is pgvector. Adding an extension to a database you already operate, monitor, and back up is dramatically simpler than introducing an entirely new data store. You avoid the operational overhead of a new deployment, leverage your existing connection pooling and access control, and your team does not need to learn a new query language. Move to a dedicated vector database only when you have concrete evidence that you are hitting scale limits with pgvector. Premature optimization is wasteful in this space.

## Prompt Templates — The New Configuration

### What It Is

A prompt template is a parameterized instruction to an LLM. In concept, not unlike a SQL query template or an API request template: the structure of the instruction remains constant while variables are filled in at runtime based on the specific task.

```
You are a {role}. Analyze the following {document_type}:

{document_content}

Return your analysis as JSON with these fields: {schema}
```

What makes prompt templates architecturally significant is their outsized impact on system behavior. In a traditional system, changing a configuration value might adjust a timeout or toggle a feature flag. Changing a prompt template can fundamentally alter what your system does — its tone, its accuracy, its output format, even the kinds of errors it produces. Prompt templates are one of the most sensitive configuration artifacts in an AI-enabled system.

### Architectural Concerns

Version control for prompt templates is essential. Every template should be versioned in source control alongside your code, because a seemingly minor wording change can completely alter system behavior. Change one sentence in a classification prompt and your system might start categorizing customer complaints into the wrong buckets. Without version history, debugging that regression becomes a nightmare.

Testing prompts requires a different mindset than testing traditional code. Unit tests alone are not sufficient, because the output of a prompt is probabilistic and nuanced. What you need are evaluation suites — curated sets of test inputs with expected outputs, scored against quality metrics. The tooling is still maturing, but the discipline needs to be in place from the start.

Consider environment-specific prompt variations. In development, shorter and cheaper prompts that sacrifice some quality for faster iteration. In production, the fully optimized version. This is no different from how you use a smaller dataset in dev or a simplified authentication flow in staging.

The mental model that serves architects best: prompts are configuration, not code — but they have the impact of code. Review them, test them, version them, and deploy them through your standard release pipeline.

## RAG (Retrieval-Augmented Generation) — Grounding AI in Your Data

### What It Is

RAG is not a single component. It is an architectural pattern that combines search (retrieval) and text generation. When someone says "we need RAG," they are describing a pattern that involves multiple components working together.

The pattern: a user asks a question. The system converts that question into an embedding vector and searches your knowledge base for the most relevant documents. Those retrieved documents — typically the top five to ten results — are inserted directly into the LLM's prompt, providing the model with specific, factual context. The LLM generates an answer grounded in your actual data rather than relying solely on whatever knowledge was baked into the model during training.

### Components Involved

```
User Query → Embedding Model → Vector DB (search) → Retrieved Docs
                                                          ↓
                                               LLM + Prompt Template → Response
```

The architectural analogy: RAG is a mashup pattern. You are combining a search service with a generation service, orchestrating them through a lightweight pipeline. The vector database serves as your index, the embedding model powers the search, and the LLM acts as your renderer — taking raw source material and turning it into a polished, contextualized response.

### Why Architects Love RAG

**RAG requires no model training.** Your proprietary data stays in a database you control rather than being baked into the weights of a neural network. No machine learning team required. No expensive GPU clusters for fine-tuning. No risk of sensitive data leaking into a shared model.

**Your data can be updated in real time.** When a document changes, re-embed it and update the vector database. The next query picks up the new information automatically. Contrast this with model training, where updating knowledge requires a full retraining cycle that can take days or weeks.

**RAG provides clear data lineage.** Because the system retrieves specific documents and feeds them to the LLM, you can show exactly which sources informed each answer. When a stakeholder asks "where did this answer come from?", you point to specific documents rather than shrugging and saying "the model just knows." That matters enormously for compliance and user trust.

**RAG works with any LLM.** You can swap your language model — upgrading to a newer version, switching providers for cost reasons, moving to a self-hosted model for data sovereignty — without retraining anything. Your retrieval pipeline, document store, and prompt templates remain intact.

## Agents — Components That Make Decisions

### What It Is

An AI agent is what happens when you give an LLM the ability to take action. More precisely: an LLM equipped with tools — functions that interact with external systems such as APIs, databases, or file systems. The LLM examines the user's request, decides which tools to call and in what order, interprets the results, and iterates through this loop until the task is complete or it cannot proceed.

```
User: "Book me a flight from SFO to JFK next Tuesday under $500"

Agent thinks: I need to search flights → calls flight_search_api()
Agent thinks: Found 3 options, cheapest is $420 → calls book_flight()
Agent thinks: Booking confirmed → returns result to user
```

This is fundamentally different from anything in your traditional architecture toolkit. With a standard workflow engine, you define the steps in advance: if this, then that. With an agent, the LLM dynamically decides the next step based on what it has learned so far. This makes agents extraordinarily flexible, but also harder to reason about, harder to test, and harder to predict.

### Architectural Properties

| Property | Value |
| --- | --- |
| Latency | Seconds to minutes (multiple LLM calls) |
| Cost | High (each "thought" is an LLM call) |
| Predictability | Low (agent may take unexpected paths) |
| Failure modes | Infinite loops, wrong tool calls, partial completion |

Think of an agent as a workflow engine where the flowchart is generated on the fly rather than defined in advance. Immensely powerful when it works well; it requires guardrails and constraints that would be unnecessary in a traditional workflow system.

### Design Considerations

**Tool sandboxing** is your first line of defense. An agent should only have access to the specific tools you have explicitly provided, and each tool should be scoped to minimum permissions. Giving an agent unrestricted database access is the AI equivalent of giving a junior developer production root credentials. Define your tool interfaces carefully, validate their inputs rigorously, and limit their blast radius.

**Budget limits** are equally important. Because an agent can theoretically loop forever, you need to cap the number of LLM calls per execution. A reasonable starting point might be ten steps. If the agent cannot complete the task in ten steps, it should return what it has accomplished and escalate to a human. Without budget control, a single confused agent can run up significant costs before anyone notices.

For high-stakes actions — payments, data deletions, account modifications, anything irreversible — implement a human-in-the-loop approval step. The agent researches, recommends, and prepares. A human reviews and approves before the irreversible action is taken.

**Observability** is non-negotiable. Every tool call, every piece of LLM reasoning, every decision point should be logged and available for audit. When an agent does something unexpected — and it will — you need the ability to replay its entire thought process and understand exactly where it went off track. Build this instrumentation from the beginning.

## Guardrails — Safety as Architecture

### What It Is

Guardrails are runtime checks applied to the inputs and outputs of AI components. They are as important to an AI architecture as input validation and output sanitization are to a traditional web application — because that is exactly what they are, reimagined for a world where both inputs and outputs are natural language rather than structured data.

Without guardrails, you are deploying a system that can say anything to anyone. That is not a position any enterprise architect wants to be in.

### Types

| Guardrail | Purpose | Example |
| --- | --- | --- |
| Input filter | Block harmful/irrelevant prompts | "Ignore all previous instructions…" |
| Output filter | Block unsafe/incorrect responses | PII in responses, harmful content |
| Format validator | Ensure structured output | JSON schema validation |
| Factuality check | Verify claims against sources | Cross-reference RAG citations |
| Cost limiter | Prevent runaway costs | Max tokens per request |

The architectural parallel is your API gateway. You already apply rate limiting, input validation, authentication, and content filtering at the gateway layer for your traditional APIs. Guardrails serve the same purpose for your AI components — the policy enforcement layer that sits between your users and the unpredictable capabilities of the model. The concept is identical. Only the implementation is new.

We will revisit RAG, agents, and guardrails as full architecture patterns in Chapter 10, and Chapter 11 provides a deep dive into agent orchestration for production environments.

## Companion Notebook

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch03-building-blocks-demo.ipynb) — Build a mini RAG pipeline from scratch: embed documents, store in a vector DB, retrieve, and generate grounded answers. See each component in action.
