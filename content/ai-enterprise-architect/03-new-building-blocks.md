---
title: New Building Blocks — AI Components for Your Architecture
slug: new-building-blocks
description: >-
  Over the course of your career as an enterprise architect, you have built up a
  mental library of components that you instinctively reach for when designing
  systems. Databases, message queues, API...
section: ai-enterprise-architect
order: 3
notebook: >-
  https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch03-building-blocks-demo.ipynb
audioUrl: /audio/ai-enterprise-architect/audio/03-new-building-blocks.mp3
podcastUrl: /audio/ai-enterprise-architect/podcast/03-new-building-blocks.mp3
---



# New Building Blocks — AI Components for Your Architecture

## Expanding Your Component Library

Over the course of your career as an enterprise architect, you have built up a mental library of components that you instinctively reach for when designing systems. Databases, message queues, API gateways, load balancers, caching layers — these are the building blocks you know intimately, the ones you can reason about in your sleep. You understand their trade-offs, their failure modes, and the kinds of problems they solve well.



AI introduces a new set of components to that library. The good news is that you do not need to throw away anything you already know. These new pieces fit alongside your existing ones, and many of them behave in ways that will feel familiar once you understand their architectural properties. This chapter walks through each of the major AI building blocks one at a time, so that by the end, you will feel confident placing them in your architecture diagrams right next to the components you have been using for years.

## LLMs — The Universal Text Processor

### What It Is

A Large Language Model is, at its core, a software component that accepts text as input and produces text as output. If you strip away all the hype and mystique, what you are left with is essentially a very capable — and very expensive — function call:

```
f(prompt: string) → response: string
```

What makes this function remarkable is its versatility. A single LLM, without any modification or retraining, can summarize a document, translate it into another language, classify it into categories, extract structured data from it, generate new content based on it, reason through complex questions about it, and answer follow-up questions in context. All of this is accomplished simply by changing the prompt — the text instruction you send to the model. This is a fundamentally different paradigm from traditional software components, where each capability typically requires a separate service or library.

### Architectural Properties

| Property | Value |
| --- | --- |
| Latency | 500ms – 30s (depends on output length) |
| Determinism | Low (temperature-dependent) |
| Cost | $0.001 – $0.10 per call (varies by model/length) |
| Stateless? | Yes (no memory between calls) |
| Scalability | Horizontal (API-based) or GPU-bound (self-hosted) |
| Failure modes | Hallucination, refusal, format violations |

The best mental model for an LLM, from an architecture standpoint, is to think of it like an external SaaS service. It offers high capability, but comes with variable latency and a pay-per-use pricing model. You do not control its internals, and you cannot predict its exact behavior with the same certainty you would expect from a deterministic function. This is not a flaw. It is a trade-off you need to design around, just as you would design around the eventual consistency of a distributed database or the latency characteristics of a third-party API.

### Design Considerations

When integrating an LLM into your architecture, idempotency is one of the first things you will need to grapple with. Unlike a traditional function where the same input reliably produces the same output, sending the same prompt to an LLM twice may yield different results each time. If your system requires consistency — for example, if you are generating compliance reports or populating structured records — you will want to set the model’s temperature parameter to zero and implement a caching layer in front of it. This way, identical requests return identical responses, and you avoid paying for redundant computation.

Timeout handling deserves careful attention as well. Long generations, especially those involving complex reasoning or lengthy output, can take thirty seconds or more. In a synchronous request-response architecture, that kind of latency is often unacceptable. Wherever possible, design for asynchronous interaction. Queue the request, let the model work, and deliver the result when it is ready.

Cost management is another concern that does not exist with most traditional components. Every token that goes into and comes out of an LLM costs money, and those costs can add up remarkably fast if you are not deliberate about prompt design. Architect for prompt efficiency from the start — strip unnecessary context, avoid sending entire documents when a summary will do, and monitor your token usage the way you would monitor database query costs. We will cover cost optimization in depth in Chapter 12, including multi-model routing strategies that can reduce inference costs by 60 to 80 percent.

Finally, be prepared for rate limits. API providers enforce strict limits on how many requests you can send per minute, and hitting those limits can bring your application to a grinding halt. Build queuing and retry logic into your integration layer from day one. This is not unlike the work you have done with other rate-limited external services — the patterns are the same, even if the component is new.

## Embeddings — Making Text Searchable

### What It Is

An embedding model takes a piece of text — a sentence, a paragraph, an entire document — and converts it into a fixed-length vector of numbers, typically with anywhere from 768 to 3072 dimensions. The magic lies in the fact that texts with similar meanings produce vectors that are mathematically close to each other, even when they use completely different words.

```
f("How do I reset my password?") → [0.023, -0.041, 0.089, ...]
f("I forgot my login credentials") → [0.021, -0.038, 0.092, ...]  ← similar!
```

This is what enables semantic search — the ability to find relevant content based on its meaning rather than relying on exact keyword matches. If you have ever been frustrated by a search system that returned nothing because the user typed “car” instead of “automobile,” you already understand the problem that embeddings solve. They capture the intent and meaning behind language, not just the surface-level words.

### Architectural Properties

| Property | Value |
| --- | --- |
| Latency | 10–100ms |
| Determinism | High (same input → same vector) |
| Cost | $0.0001 per call |
| Output | Fixed-size vector (768–3072 dimensions) |

From an architecture perspective, the best way to think about embeddings is as an indexing service. You run the embedding model once when content is created or updated, store the resulting vector, and then query against those stored vectors at read time. This is a write-time computation that pays off at read time — a pattern you are already familiar with from full-text search indexes, materialized views, and other precomputed data structures. The key difference is that this index captures meaning, not just tokens.

## Vector Databases — The New Index

### What It Is

A vector database is a database that has been purpose-built — or in some cases, extended — to store and query embedding vectors efficiently. Its core operation is something called a nearest-neighbor search: given a query vector, it can find the ten or twenty most similar vectors in the database in a matter of milliseconds, even when the dataset contains millions of entries. This is the infrastructure layer that makes semantic search practical at scale.

### Options

| Database | Type | Best For |
| --- | --- | --- |
| pgvector | PostgreSQL extension | Teams already on PostgreSQL |
| Pinecone | Managed SaaS | Zero-ops, fast start |
| Weaviate | Open source | Self-hosted, flexible |
| Chroma | Lightweight | Prototyping, small datasets |
| Qdrant | Open source | Performance-sensitive |

If your organization is already running PostgreSQL, and most are, the pragmatic starting point is pgvector. Adding an extension to a database you already operate, monitor, and back up is dramatically simpler than introducing an entirely new data store into your technology stack. You avoid the operational overhead of a new deployment, you can leverage your existing connection pooling and access control, and your team does not need to learn a new query language. Move to a dedicated vector database only when you have concrete evidence that you are hitting scale limits with pgvector. Premature optimization in this space is just as wasteful as it is anywhere else.

## Prompt Templates — The New Configuration

### What It Is

A prompt template is a parameterized instruction to an LLM, and it represents one of the most interesting shifts in how we think about system configuration. In concept, it is not unlike a SQL query template or an API request template: the structure of the instruction remains constant, while variables are filled in at runtime based on the specific task at hand.

```
You are a {role}. Analyze the following {document_type}:

{document_content}

Return your analysis as JSON with these fields: {schema}
```

What makes prompt templates architecturally significant is the outsized impact they have on system behavior. In a traditional system, changing a configuration value might adjust a timeout, toggle a feature flag, or reroute traffic. Changing a prompt template, on the other hand, can fundamentally alter what your system does — its tone, its accuracy, its output format, even the kinds of errors it produces. This makes prompt templates one of the most sensitive configuration artifacts in an AI-enabled system.

### Architectural Concerns

Version control for prompt templates is not optional. It is essential. Every prompt template should be versioned in your source control system alongside your code, because a seemingly minor wording change can completely alter system behavior. Imagine changing one sentence in a classification prompt and suddenly having your system categorize customer complaints into the wrong buckets. Without version history, debugging that kind of regression becomes a nightmare.

Testing prompts requires a different mindset than testing traditional code. Unit tests alone are not sufficient, because the output of a prompt is probabilistic and nuanced. What you need are evaluation suites — curated sets of test inputs with expected outputs, scored against quality metrics. Think of it as the difference between testing whether a function returns the right number and testing whether a translation reads naturally to a native speaker. The tooling for this is still maturing, but the discipline needs to be in place from the start.

You should also consider environment-specific prompt variations. In development, you might use shorter, cheaper prompts that sacrifice some quality for faster iteration. In production, you deploy the fully optimized version. This is no different from how you might use a smaller dataset in dev or a simplified authentication flow in staging — the principle of environment parity applies, but practicality demands some concessions.

The mental model that serves architects best here is this: prompts are configuration, not code — but they have the impact of code. Treat them with the same rigor you would apply to database schema changes. Review them, test them, version them, and deploy them through your standard release pipeline.

## RAG (Retrieval-Augmented Generation) — Grounding AI in Your Data

### What It Is

RAG is not a single component. It is an architectural pattern that combines two capabilities: search (retrieval) and text generation. Understanding this distinction matters, because when someone says “we need RAG,” they are describing a pattern that involves multiple components working together, not a product you can buy off the shelf.

The pattern works like this. First, a user asks a question or submits a query. The system then takes that question, converts it into an embedding vector, and searches your knowledge base for the documents most relevant to the query. Those retrieved documents — typically the top five or ten results — are then inserted directly into the LLM’s prompt, providing the model with specific, factual context to draw upon. Finally, the LLM generates an answer that is grounded in your actual data rather than relying solely on whatever knowledge was baked into the model during training.

### Components Involved

```
User Query → Embedding Model → Vector DB (search) → Retrieved Docs
                                                          ↓
                                               LLM + Prompt Template → Response
```

The architectural analogy that resonates most with enterprise architects is that RAG is a mashup pattern. You are combining a search service with a generation service, orchestrating them through a lightweight pipeline. The vector database serves as your index, the embedding model powers the search, and the LLM acts as your renderer — taking raw source material and turning it into a polished, contextualized response.

### Why Architects Love RAG

RAG has become the most popular enterprise AI pattern for very good reasons, and most of those reasons are architectural rather than technical.

First, RAG requires no model training. Your proprietary data stays in a database that you control, rather than being baked into the weights of a neural network. This means you do not need a machine learning team to get started, you do not need expensive GPU clusters for fine-tuning, and you do not need to worry about your sensitive data leaking into a model that might be shared or compromised.

Second, your data can be updated in real time. When a document changes, you simply re-embed it and update the vector database. The next query will automatically pick up the new information. Contrast this with model training, where updating knowledge requires a full retraining cycle that can take days or weeks.

Third, RAG provides clear data lineage. Because the system retrieves specific documents and feeds them to the LLM, you can show exactly which sources informed each answer. This is enormously valuable for compliance, auditing, and building user trust. When a stakeholder asks “where did this answer come from?”, you can point to the specific documents rather than shrugging and saying “the model just knows.”

Finally, RAG works with any LLM. You can swap out your language model — upgrading to a newer version, switching providers for cost reasons, or moving to a self-hosted model for data sovereignty — without retraining anything. Your retrieval pipeline, your document store, and your prompt templates all remain intact.

## Agents — Components That Make Decisions

### What It Is

An AI agent is what happens when you give an LLM the ability to take action in the real world. More precisely, an agent is an LLM equipped with tools. These are functions that interact with external systems such as APIs, databases, or file systems. The LLM examines the user’s request, decides which tools to call and in what order, interprets the results of each tool call, and iterates through this loop until the task is complete or it cannot proceed.

```
User: "Book me a flight from SFO to JFK next Tuesday under $500"

Agent thinks: I need to search flights → calls flight_search_api()
Agent thinks: Found 3 options, cheapest is $420 → calls book_flight()
Agent thinks: Booking confirmed → returns result to user
```

This is a fundamentally different kind of component than anything in your traditional architecture toolkit. With a standard workflow engine, you define the steps in advance: if this, then that, else the other thing. With an agent, the LLM dynamically decides the next step based on what it has learned so far. This makes agents extraordinarily flexible, but it also makes them harder to reason about, harder to test, and harder to predict.

### Architectural Properties

| Property | Value |
| --- | --- |
| Latency | Seconds to minutes (multiple LLM calls) |
| Cost | High (each “thought” is an LLM call) |
| Predictability | Low (agent may take unexpected paths) |
| Failure modes | Infinite loops, wrong tool calls, partial completion |

The most useful mental model for an agent is a workflow engine where the flowchart is generated on the fly rather than defined in advance. This is immensely powerful when it works well, but it requires guardrails and constraints that would be unnecessary in a traditional workflow system.

### Design Considerations

Tool sandboxing is your first line of defense when deploying agents. An agent should only have access to the specific tools you have explicitly provided, and each of those tools should be scoped to the minimum permissions necessary. Giving an agent unrestricted database access is the AI equivalent of giving a junior developer production root credentials. The potential for catastrophic mistakes is too high. Define your tool interfaces carefully, validate their inputs rigorously, and limit their blast radius.

Budget limits are equally important. Because an agent can theoretically loop forever — calling tools, interpreting results, and deciding to call more tools — you need to cap the number of LLM calls per agent execution. A reasonable starting point might be ten steps. If the agent cannot complete the task in ten steps, it should return what it has accomplished so far and escalate to a human. Without this kind of budget control, a single confused agent can run up significant costs before anyone notices.

For high-stakes actions — payments, data deletions, account modifications, anything that cannot be easily reversed — you should implement a human-in-the-loop approval step. The agent can research, recommend, and prepare, but a human being should review and approve before the irreversible action is taken. This is not a limitation of the technology; it is a sound architectural principle that applies to any system performing consequential operations.

Finally, observability is non-negotiable. Every tool call, every piece of LLM reasoning, every decision point should be logged and made available for audit. When an agent does something unexpected — and it will — you need the ability to replay its entire thought process and understand exactly where it went off track. Build this instrumentation in from the beginning, not as an afterthought.

## Guardrails — Safety as Architecture

### What It Is

Guardrails are runtime checks applied to the inputs and outputs of AI components. They are every bit as important to an AI architecture as input validation and output sanitization are to a traditional web application. Guardrails are input validation and output sanitization, reimagined for a world where both the inputs and the outputs are natural language rather than structured data.

The need for guardrails arises from the inherent unpredictability of LLMs. Because an LLM can generate virtually any text in response to virtually any prompt, you need explicit checks to ensure that what goes in and what comes out conforms to your system’s requirements, your organization’s policies, and basic safety standards. Without guardrails, you are deploying a system that can say anything to anyone. That is not a position any enterprise architect wants to be in.

### Types

  
| Guardrail | Purpose | Example |
| --- | --- | --- |
| Input filter | Block harmful/irrelevant prompts | “Ignore all previous instructions…” |
| Output filter | Block unsafe/incorrect responses | PII in responses, harmful content |
| Format validator | Ensure structured output | JSON schema validation |
| Factuality check | Verify claims against sources | Cross-reference RAG citations |
| Cost limiter | Prevent runaway costs | Max tokens per request |

The architectural parallel here is your API gateway. You already apply rate limiting, input validation, authentication, and content filtering at the gateway layer for your traditional APIs. Guardrails serve the same purpose for your AI components. They are the policy enforcement layer that sits between your users and the unpredictable capabilities of the model. The concept is identical. Only the implementation is new.

## Key Takeaways

1.  This chapter introduced six new building blocks — LLMs, embeddings, vector databases, prompt templates, RAG, and agents — each of which earns a place in your architecture component library alongside the databases, queues, and gateways you already know. We will revisit RAG, agents, and guardrails as full architecture patterns in Chapter 10, and Chapter 11 provides a deep dive into agent orchestration for production environments.
2.  Every one of these components has specific architectural properties around latency, cost, and determinism, and understanding those properties is essential for making sound design decisions about where and how to use them.
3.  RAG is the most widely adopted enterprise AI pattern because it grounds AI responses in your own data without requiring model training, making it accessible to organizations that do not have dedicated machine learning teams.
4.  Agents are among the most powerful components in this new toolkit, but they require deliberate guardrails — including tool sandboxing, budget limits, human-in-the-loop approvals, and comprehensive observability — to be deployed safely.
5.  The most important insight in this chapter is that these components are new boxes on your architecture diagram, not a new discipline entirely — the architectural thinking you have honed over your career applies directly, and the patterns you already know will serve you well.

## Companion Notebook

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch03-building-blocks-demo.ipynb) — Build a mini RAG pipeline from scratch: embed documents, store in a vector DB, retrieve, and generate grounded answers. See each component in action.
