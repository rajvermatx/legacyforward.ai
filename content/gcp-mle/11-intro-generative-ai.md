---
title: "Introduction to Generative AI"
slug: "intro-generative-ai"
description: "Generative AI is reshaping how we build intelligent systems. This module covers the foundations
    of generative AI — what it is, how it differs from traditional ML, the models that power it,
    and how Google Cloud makes it accessible through Vertex AI. Essential knowledge for the
    GCP Machine"
section: "gcp-mle"
order: 11
badges:
  - "Generative vs Discriminative AI"
  - "Foundation Models"
  - "Google's GenAI Models"
  - "Vertex AI Studio"
  - "Responsible GenAI"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/11-intro-generative-ai.ipynb"
---

## 01. What Is Generative AI

**Generative AI** is a branch of artificial intelligence that focuses on creating new content — text, images, audio, video, code, or structured data — rather than merely analyzing or classifying existing data. At its core, a generative model learns the underlying probability distribution of its training data and then samples from that distribution to produce novel outputs that are statistically similar to, but not copies of, the training examples.

This represents a fundamental shift in AI capabilities. Traditional machine learning systems were primarily **discriminative**: given an input, they produce a label, a score, or a decision boundary. A spam classifier takes an email and outputs "spam" or "not spam." A recommendation engine takes a user profile and outputs a ranked list. These systems consume and categorize — they do not create.

### Generative vs Discriminative AI

The distinction is mathematical. A **discriminative model** learns the conditional probability `P(Y|X)` — given input features X, what is the probability of each label Y? It draws a decision boundary in the feature space. A **generative model** learns the joint probability `P(X, Y)` or the data distribution `P(X)` itself. Because it models how data is generated, it can produce new samples from that distribution.

D

#### Discriminative AI

Learns decision boundaries. Outputs labels, scores, or classifications. Examples: logistic regression, SVMs, image classifiers, spam filters.

G

#### Generative AI

Learns data distributions. Outputs new content: text, images, code, audio. Examples: GPT, Gemini, DALL-E, Stable Diffusion, music generation.

>**Exam Tip:** The exam tests whether you understand **when** to use generative AI vs traditional ML. If the task is classification, regression, or ranking, traditional discriminative models are often simpler and more appropriate. Generative AI shines for content creation, summarization, translation, and open-ended tasks.

## 02. Foundation Models

A **foundation model** is a large AI model pre-trained on a broad, diverse dataset at massive scale, designed to be adapted (fine-tuned or prompted) to a wide range of downstream tasks. The term was coined by Stanford's Center for Research on Foundation Models (CRFM) in 2021 to describe the paradigm shift where a single pre-trained model serves as the base for many applications, rather than training a separate model for each task.

The key properties of foundation models are **scale**, **self-supervised pre-training**, and **emergence**. Scale refers to both the model size (billions to trillions of parameters) and the training data (terabytes of text, images, code). Self-supervised pre-training means the model learns from unlabeled data using objectives like next-token prediction (for language) or masked image modeling (for vision), avoiding the need for expensive human annotation at scale.

### Pre-training and Emergence

**Emergence** refers to capabilities that appear in large models but are absent in smaller ones, without being explicitly trained for. A model trained only to predict the next token in text somehow acquires the ability to translate between languages, write code, reason about math, and follow complex instructions. These emergent abilities arise from the interaction of scale, data diversity, and the richness of the pre-training objective.

The pre-training process is extraordinarily compute-intensive. Training a frontier model like Gemini or GPT-4 requires thousands of GPUs or TPUs running for weeks to months, costing tens of millions of dollars. This is why foundation models are typically created by large organizations (Google, OpenAI, Meta, Anthropic) and then made available for downstream use through APIs, fine-tuning, or open-weight releases.

>**Key Insight:** Foundation models follow a **pre-train once, adapt many times** paradigm. The enormous upfront investment in pre-training is amortized across thousands of downstream applications. This is why Vertex AI Model Garden exists — it gives you access to pre-trained foundation models that you adapt to your use case.

## 03. Types of Generative Models

### Large Language Models (LLMs)

**Large Language Models** are transformer-based neural networks trained on massive text corpora. They generate text by predicting the next token in a sequence, autoregressively building up responses one token at a time. LLMs are the most impactful category of generative models today, powering applications from chatbots and code assistants to document summarization and question answering.

LLMs vary along several dimensions: **parameter count** (from 1B to 1T+), **context window** (the maximum number of tokens they can process at once, from 4K to 1M+), **modality** (text-only vs multimodal), and **training methodology** (base pre-training, instruction tuning, RLHF). Google's Gemini models are multimodal LLMs that natively process text, images, audio, and video.

### Diffusion Models, GANs, and VAEs

**Diffusion models** generate images (or other data) by learning to reverse a gradual noising process. During training, noise is progressively added to real images until they become pure noise. The model learns to denoise at each step, and at inference time, it starts from random noise and iteratively denoises to produce a coherent image. Google's **Imagen** is a diffusion-based text-to-image model. Diffusion models currently produce the highest-quality images of any generative approach.

**Generative Adversarial Networks (GANs)** consist of two networks: a generator that creates fake data and a discriminator that tries to distinguish fake from real. They are trained adversarially until the generator produces outputs indistinguishable from real data. GANs were dominant before diffusion models but suffer from training instability and mode collapse.

**Variational Autoencoders (VAEs)** learn a compressed latent representation of data and can generate new samples by decoding random points from this latent space. They provide smooth, interpretable latent spaces but typically produce blurrier outputs than GANs or diffusion models. VAEs remain useful in applications requiring a structured latent space, such as drug discovery and anomaly detection.

L

#### LLMs

Autoregressive text generation. Transformer-based. Powers chatbots, code gen, summarization. Examples: Gemini, PaLM, GPT-4, Llama.

D

#### Diffusion Models

Iterative denoising for image generation. Highest quality images. Examples: Imagen, Stable Diffusion, DALL-E 3.

G

#### GANs

Generator-discriminator adversarial training. Fast inference, but training instability. Legacy approach for images.

V

#### VAEs

Encoder-decoder with latent space. Smooth interpolation, structured representations. Used in drug discovery, anomaly detection.

## 04. Transformer Architecture Refresher

### Attention and Self-Attention

The **Transformer** architecture, introduced in the 2017 paper "Attention Is All You Need," is the backbone of all modern generative AI models. Its core innovation is the **self-attention mechanism**, which allows every token in a sequence to attend to every other token simultaneously, capturing long-range dependencies without the sequential bottleneck of RNNs.

In self-attention, each token is projected into three vectors: **Query (Q)**, **Key (K)**, and **Value (V)**. The attention score between two tokens is computed as the dot product of one's Query with the other's Key, scaled by the square root of the dimension. After softmax normalization, these scores weight the Value vectors to produce a context-aware representation of each token.

Attention(Q, K, V) = softmax( Q · Kᵀ / √d\_k ) · V

**Multi-head attention** runs this process in parallel across multiple "heads," each with its own learned projections. Different heads specialize in different types of relationships — syntactic structure, semantic similarity, positional patterns — and their outputs are concatenated and projected.

The original Transformer has an **encoder-decoder** structure. The encoder processes the input bidirectionally (each token attends to all others). The decoder generates output autoregressively with causal masking (each token only attends to previous tokens). Modern LLMs like Gemini and GPT-4 use **decoder-only** architectures with causal self-attention only.

>**Architecture Variants:** **Encoder-only** (BERT): bidirectional attention, great for classification and embeddings. **Decoder-only** (GPT, Gemini): causal attention, great for generation. **Encoder-decoder** (T5, original Transformer): both halves, great for translation and summarization.

## 05. Google's Generative AI Models

### The Gemini Family

**Gemini** is Google's most capable family of multimodal AI models. Gemini models are natively multimodal — they can process and generate text, images, audio, video, and code within a single model architecture, rather than stitching together separate specialist models. The Gemini family includes multiple sizes optimized for different use cases:

U

#### Gemini Ultra

Largest and most capable. Designed for highly complex tasks requiring advanced reasoning, math, and multimodal understanding.

P

#### Gemini Pro

Best balance of performance and efficiency. Suitable for most enterprise tasks. Available with up to 1M token context window.

F

#### Gemini Flash

Optimized for speed and cost. Lower latency, lower price per token. Ideal for high-volume, latency-sensitive applications.

N

#### Gemini Nano

Designed for on-device deployment. Runs on mobile phones and edge devices without cloud connectivity.

### PaLM, Imagen, and Chirp

**PaLM 2** (Pathways Language Model) was Google's previous flagship LLM before Gemini. It excelled at multilingual tasks, reasoning, and code generation. PaLM 2 variants powered early versions of Bard and Vertex AI text generation. While Gemini has superseded PaLM 2 for most use cases, understanding PaLM 2 is still relevant for exam preparation as it appears in some study materials.

**Imagen** is Google's text-to-image diffusion model, available through Vertex AI. It generates photorealistic images from text descriptions and supports image editing capabilities. **Chirp** is Google's speech model powering speech-to-text and text-to-speech capabilities, supporting over 100 languages. Together, these models represent Google's full-stack approach to generative AI across all modalities.

## 06. Vertex AI for Generative AI

### Model Garden, Vertex AI Studio, and Prompt Design

**Vertex AI Model Garden** is Google Cloud's curated catalog of foundation models. It provides access to Google's own models (Gemini, Imagen, Chirp, Codey) as well as third-party and open-source models (Llama, Mistral, Anthropic's Claude). From Model Garden, you can deploy models to endpoints, access them via API, or fine-tune them on your data.

**Vertex AI Studio** (formerly Generative AI Studio) is a web-based IDE for prototyping and testing generative AI applications. It allows you to experiment with prompts, adjust model parameters (temperature, top-k, top-p), test multimodal inputs, compare model outputs side by side, and iterate on prompt design without writing code. Once you have a working prompt, you can export it as API code.

**Prompt design** is the practice of crafting effective inputs to get desired outputs from generative models. Key techniques include:

-   **Zero-shot prompting** — provide only the task description, no examples
-   **Few-shot prompting** — include 2-5 input-output examples to guide the model
-   **Chain-of-thought** — instruct the model to reason step-by-step before answering
-   **System instructions** — set the model's persona, constraints, and output format

>**Vertex AI Key Concept:** Vertex AI provides a **unified API** for all generative models. Whether you use Gemini, PaLM, or a third-party model, the SDK interface is consistent. This is important for exam scenarios about model switching and A/B testing.

## 07. Generative AI Applications

Generative AI enables a broad range of applications across industries. Understanding these application categories is critical for the exam, as questions often present real-world scenarios and ask which approach or Google Cloud service is most appropriate.

T

#### Text Generation

Content creation, marketing copy, email drafting, creative writing. Uses Gemini or PaLM via Vertex AI with prompt engineering.

S

#### Summarization

Condensing long documents, meeting notes, reports. Extractive vs abstractive summarization. Gemini excels with long context.

C

#### Code Generation

Code completion, bug fixing, code explanation, test generation. Codey models and Gemini both support code tasks.

I

#### Image Generation

Text-to-image with Imagen. Product photography, design mockups, visual content creation. Supports editing and inpainting.

M

#### Multimodal

Processing text + images + video together. Visual question answering, document understanding, video analysis with Gemini.

Q

#### Q&A / Search

Grounded question answering over enterprise data. RAG pipelines with Vertex AI Search and embeddings for accurate retrieval.

## 08. Responsible Generative AI

### Hallucinations, Bias, and Safety

**Hallucination** is the phenomenon where a generative model produces outputs that are fluent and confident but factually incorrect or entirely fabricated. This occurs because LLMs are trained to produce statistically likely text, not to verify truth. A model may generate plausible-sounding citations that do not exist, attribute quotes to the wrong person, or invent statistics. Hallucination is one of the most significant challenges in deploying generative AI in production.

**Mitigation strategies** for hallucination include **grounding** (connecting the model to authoritative data sources via retrieval-augmented generation), **citation verification** (requiring the model to cite sources and verifying them), **temperature reduction** (lowering randomness to favor more deterministic outputs), and **human-in-the-loop review** for high-stakes applications.

**Bias** in generative models reflects biases present in training data. Models may produce outputs that reinforce stereotypes, underrepresent certain groups, or generate harmful content. Google addresses this through data curation, RLHF with safety-focused reward models, and built-in **safety filters** that block harmful content categories (hate speech, violence, sexually explicit content, dangerous activities).

**Google's Responsible AI principles** guide the development and deployment of all GenAI products. These include: AI should be socially beneficial, avoid creating or reinforcing unfair bias, be built and tested for safety, be accountable to people, incorporate privacy design principles, uphold high standards of scientific excellence, and be made available for uses that accord with these principles.

>**Exam Warning:** The exam will present scenarios where generative AI is **not the right choice**. If a task requires guaranteed factual accuracy (medical diagnosis, legal compliance), deterministic outputs, or real-time numerical computation, traditional ML or rule-based systems may be more appropriate. Always evaluate whether GenAI adds genuine value vs risk.

## 09. Exam Focus: GenAI vs Traditional ML

The GCP MLE exam tests your ability to select the right approach for a given scenario. This section consolidates the decision framework for choosing between generative AI and traditional ML approaches.

### When to Use Generative AI

-   The task requires **content creation**: text, code, images, or multimodal outputs
-   The task is **open-ended** with no single correct answer (summarization, brainstorming)
-   You need **natural language understanding** at a level beyond traditional NLP
-   You have **limited labeled data** and can leverage pre-trained knowledge via prompting

### When to Use Traditional ML

-   The task is **structured prediction**: classification, regression, ranking, clustering
-   You need **deterministic, reproducible** outputs (fraud detection, credit scoring)
-   **Latency and cost** constraints make LLM inference impractical at scale
-   You have **abundant labeled data** and a well-defined objective function

>**Decision Framework:** On the exam, always ask: "Does this task require **generating** new content, or **categorizing/predicting** from existing data?" If the former, consider GenAI. If the latter, consider traditional ML first. Also evaluate: cost constraints, latency requirements, accuracy guarantees, and whether the application is customer-facing or internal.

### Key Google Cloud Services for GenAI

G

#### Vertex AI Model Garden

Browse and deploy foundation models. Access Gemini, PaLM, open-source models, and partner models from a unified catalog.

S

#### Vertex AI Studio

Prototype prompts, test models, tune parameters. No-code/low-code interface for rapid GenAI experimentation.

A

#### Vertex AI API

Programmatic access to all GenAI models. Python SDK, REST API, gRPC. Supports streaming, async, and batch inference.

E

#### Vertex AI Search

Enterprise search with grounding. RAG pipelines that connect Gemini to your data for accurate, cited answers.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Generative AI refers to models that create new content — text, images, code, audio, video — rather than simply classifying or predicting from existing data. These models are built on **foundation models**: massive neural networks pretrained on internet-scale datasets that learn general-purpose representations and can be adapted to specific tasks through prompting or fine-tuning. The breakthrough architecture is the **Transformer**, which uses self-attention to process sequences in parallel and capture long-range dependencies. Google's GenAI lineup includes Gemini (multimodal, state-of-the-art), PaLM 2 (strong reasoning and multilingual), and open models like Gemma for on-premises deployment. On GCP, Vertex AI provides the unified platform for accessing these models — Vertex AI Studio for no-code prototyping, the Vertex AI API for programmatic access, Model Garden for browsing and deploying first-party and open models, and Vertex AI Search for enterprise RAG. The key distinction for the exam: generative AI **creates** new content, discriminative AI **classifies** existing content — and the choice between them depends on whether the task requires generation or prediction.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| What is a foundation model and how does it differ from traditional ML models? | Do you understand pretraining at scale, transfer learning, and the paradigm shift from task-specific to general-purpose models? |
| Explain the difference between generative and discriminative AI with examples. | Can you clearly distinguish between models that generate new content and models that classify or predict from existing inputs? |
| What are Google's main GenAI models and when would you choose each one? | Do you know the Gemini, PaLM 2, Codey, Imagen, and Gemma lineup, and can you match models to use cases? |
| How does Vertex AI support generative AI workloads? | Can you describe the full Vertex AI GenAI stack — Studio, API, Model Garden, Search — and when each tool applies? |
| What are the key considerations for responsible GenAI deployment? | Do you understand safety filters, grounding, bias mitigation, and Google's AI Principles as they apply to production GenAI systems? |

### Model Answers

**1\. Foundation models vs traditional ML** — Traditional ML models are trained from scratch on task-specific datasets — a spam classifier trained only on labeled emails, a demand forecaster trained only on sales data. Foundation models are pretrained on massive, diverse datasets (billions of web pages, books, code repositories) to learn general language understanding, reasoning, and world knowledge. They can then be adapted to specific tasks through prompting (zero-shot or few-shot examples in the input), fine-tuning (additional training on task-specific data), or distillation (training a smaller model to mimic the foundation model). The paradigm shift: instead of collecting thousands of labeled examples for each new task, you leverage the foundation model's pretrained knowledge and guide it with instructions or a handful of examples.

**2\. Generative vs discriminative AI** — Discriminative models learn the boundary between classes — given an input, they predict a label or numeric value. Examples: sentiment classification (positive/negative), fraud detection (fraud/legitimate), demand forecasting (predicted sales). Generative models learn the underlying data distribution and can produce new samples from it. Examples: text generation (writing emails, code, summaries), image generation (creating product photos from descriptions), and conversational AI (multi-turn dialogue). The key technical difference: discriminative models learn P(y|x) — the probability of a label given input. Generative models learn P(x) — the probability distribution of the data itself — and can sample new instances. In practice, modern generative models like Gemini handle both — they can generate text and classify inputs through prompted instructions.

**3\. Google's GenAI model lineup** — Gemini is Google's flagship multimodal model family — it natively processes text, images, video, and audio in a single model. Gemini Ultra handles the most complex reasoning tasks, Gemini Pro is the balanced choice for production workloads, and Gemini Nano runs on-device for mobile applications. PaLM 2 is the previous generation, still strong for multilingual and reasoning tasks but being superseded by Gemini. Codey (built on PaLM 2) is specialized for code generation, completion, and chat. Imagen generates and edits images from text descriptions. Gemma is Google's open-weights model family — suitable for on-premises deployment, custom fine-tuning without API dependencies, and use cases requiring full data control. The selection framework: use Gemini for most tasks, Codey for code-heavy workflows, Imagen for image generation, and Gemma when you need open weights or air-gapped deployment.

**4\. Vertex AI GenAI stack** — Vertex AI Studio provides a no-code web interface for prompt prototyping — you can test different models, adjust temperature and top-k/top-p parameters, and compare outputs without writing code. The Vertex AI API (Python SDK and REST) provides programmatic access for production integration — streaming responses, async batch processing, and embedding generation. Model Garden is a curated catalog of first-party (Gemini, PaLM), third-party (Anthropic Claude, Meta Llama), and open-source models that can be deployed to Vertex AI endpoints with one click. Vertex AI Search provides enterprise RAG — connecting Gemini to your organization's data (documents, databases, websites) for grounded, cited answers. Together these components cover the full GenAI lifecycle from experimentation to production deployment.

**5\. Responsible GenAI deployment** — Google's approach to responsible AI centers on safety filters, grounding, and human oversight. Safety filters screen inputs and outputs for harmful content across categories (hate speech, violence, sexual content, dangerous activities) with configurable thresholds. Grounding connects model outputs to verifiable sources — either your own data (via RAG/Vertex AI Search) or Google Search — reducing hallucination by providing factual evidence. Bias mitigation involves evaluating model outputs across demographic groups, using inclusive training data, and monitoring production outputs for fairness. Google's AI Principles require that AI applications be socially beneficial, avoid creating or reinforcing unfair bias, be tested for safety, be accountable to people, incorporate privacy design principles, and uphold high standards of scientific excellence. For the exam, remember that responsible AI is not optional — it is a core requirement for production GenAI systems on GCP.

### System Design Scenario

>**Design Challenge:** Your organization wants to build an internal AI assistant that can answer employee questions about company policies, HR processes, and technical documentation. The system must handle 1,000 daily queries, provide cited answers from internal documents, and enforce role-based access so employees only see information they are authorized to access. Design the architecture using Google Cloud's GenAI services.
> 
> A strong answer should cover:
> 
> -   **Model selection** — Gemini Pro via Vertex AI API for generation, with temperature set low (0.1-0.3) for factual consistency; text-embedding models for document indexing and semantic search
> -   **Knowledge grounding** — Vertex AI Search connected to Cloud Storage and Google Drive sources, with automatic document crawling, chunking, and indexing; or a custom RAG pipeline with AlloyDB/pgvector for vector storage
> -   **Access control** — document-level ACLs synced from the source systems, metadata filtering in search results to enforce role-based access, and VPC Service Controls to keep data within the organization's perimeter
> -   **Safety and compliance** — safety filters configured for enterprise use, PII detection and redaction in both queries and responses, audit logging of all queries and generated answers for compliance review
> -   **Evaluation and monitoring** — automated answer quality scoring (faithfulness to sources, relevance to query), user feedback collection, and weekly reports on answer accuracy and source coverage gaps

### Common Mistakes

-   **Confusing generative AI with all AI** — Generative AI is a subset of AI focused on content creation. Many production ML tasks (classification, regression, ranking, anomaly detection) are better served by discriminative models that are cheaper, faster, and more interpretable. Using a generative model for simple classification is over-engineering.
-   **Treating foundation models as databases of facts** — Foundation models learn statistical patterns from training data, not verified facts. They hallucinate confidently when asked about topics outside their training distribution. Production systems must ground model outputs in verified data sources using RAG or Vertex AI Search, never relying on the model's parametric knowledge alone for factual claims.
-   **Ignoring the cost and latency implications of model size** — Larger models (Gemini Ultra) provide better reasoning but cost more and respond slower. For high-throughput production workloads where tasks are straightforward (summarization, extraction, classification), Gemini Pro or even Gemini Flash may provide sufficient quality at a fraction of the cost and latency. Always benchmark smaller models first before defaulting to the largest available.

Previous

[← 10 · MLOps & Feature Store](10-mlops-feature-store.html)

Next

[12 · Introduction to LLMs →](12-intro-llms.html)