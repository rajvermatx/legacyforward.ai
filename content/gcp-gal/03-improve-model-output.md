---
title: "Techniques to Improve Gen AI Output"
slug: "improve-model-output"
description: "Learn the key techniques for getting better results from generative AI models: prompt engineering
    (zero-shot, few-shot, chain-of-thought, ReAct), grounding, RAG, fine-tuning, human-in-the-loop
    review, monitoring, and sampling parameters (temperature, top-p, tokens)."
section: "gcp-gal"
order: 3
badges:
  - "Prompt Engineering"
  - "Grounding & RAG"
  - "Fine-Tuning & RLHF"
  - "Sampling Parameters"
  - "HITL & Monitoring"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-gal/03-improve-model-output.ipynb"
---

## 01. Foundation Model Limitations

Before learning techniques to improve output, you must understand **why** improvement is needed. Foundation models, despite their impressive capabilities, have inherent limitations that must be addressed for production use.

### Key Limitations

👻

#### Hallucinations

Models generate plausible-sounding but factually incorrect information. They may cite fake sources, invent statistics, or confidently state falsehoods. This is the #1 limitation.

📅

#### Knowledge Cutoff

Models only know information up to their training data cutoff date. They cannot answer questions about recent events without grounding or RAG.

⚖

#### Bias

Training data contains societal biases that models can reproduce or amplify. Outputs may reflect gender, racial, cultural, or other biases.

📚

#### Context Window Limits

Models can only process a limited amount of text at once. Long documents may exceed the context window, requiring chunking strategies.

💰

#### Cost & Latency

Larger models are expensive to run and slow to respond. Production applications must balance quality with cost and response time.

🔐

#### Lack of Domain Knowledge

General-purpose models lack deep expertise in specialized domains (medical, legal, financial). Fine-tuning or RAG addresses this gap.

>**Exam Focus:** The exam expects you to match each limitation to the correct mitigation technique: **Hallucinations → Grounding/RAG.** **Knowledge cutoff → RAG with current data.** **Bias → Responsible AI practices, diverse training data.** **Domain gaps → Fine-tuning.** **Cost → Smaller models (Flash), caching.**

## 02. Prompt Engineering

**Prompt engineering** is the practice of designing and refining input prompts to guide a generative model toward producing desired outputs. It is the fastest, cheapest, and most accessible technique for improving model output — no training data, no compute, no code changes required.

A well-designed prompt has several components:

-   **Task instruction** — what you want the model to do
-   **Context** — background information or constraints
-   **Input data** — the specific content to process
-   **Output format** — how the response should be structured
-   **Examples** (optional) — demonstrations of desired behavior

### Zero-Shot Prompting

In **zero-shot prompting**, you provide the task instruction without any examples. The model relies entirely on its pre-trained knowledge to generate a response. This works well for simple, well-defined tasks.

```
# Zero-shot: No examples provided
prompt = """Classify the following customer review as POSITIVE, NEGATIVE, or NEUTRAL.

Review: "The delivery was fast but the product quality was below expectations."

Classification:"""

# Model output: NEGATIVE (or NEUTRAL, depending on interpretation)
```

### One-Shot and Few-Shot Prompting

**One-shot** provides a single example, while **few-shot** provides multiple examples (typically 2-5). Examples demonstrate the expected input-output pattern, giving the model a clear template to follow.

```
# Few-shot: Multiple examples guide the model
prompt = """Classify reviews as POSITIVE, NEGATIVE, or NEUTRAL.

Review: "Absolutely love this! Best purchase ever."
Classification: POSITIVE

Review: "Arrived broken, total waste of money."
Classification: NEGATIVE

Review: "It works fine, nothing special."
Classification: NEUTRAL

Review: "The delivery was fast but the product quality was below expectations."
Classification:"""

# Model output: NEGATIVE (more consistent with examples)
```

| Technique | Examples | Best For | Token Cost |
| --- | --- | --- | --- |
| Zero-shot | 0 | Simple tasks, common formats | Lowest |
| One-shot | 1 | Quick format demonstration | Low |
| Few-shot | 2-5+ | Consistent formatting, classification, structured output | Medium |

### Role Prompting (System Instructions)

**Role prompting** assigns a persona or role to the model, shaping its behavior, tone, and expertise level. In Vertex AI, this is implemented through **system instructions** that persist across the conversation.

```
# Role prompting via system instructions
from vertexai.generative_models import GenerativeModel

model = GenerativeModel(
    "gemini-1.5-pro",
    system_instruction="""You are a senior cloud architect at a Fortune 500 company.
Answer questions about cloud infrastructure with:
- Technical accuracy suitable for engineering teams
- Cost-optimization considerations
- Security best practices
- Specific Google Cloud service recommendations when applicable"""
)

response = model.generate_content("How should we architect a RAG pipeline?")
```

### Chain-of-Thought (CoT) Prompting

**Chain-of-thought prompting** instructs the model to reason step by step before giving a final answer. This dramatically improves performance on tasks requiring logic, mathematics, or multi-step reasoning.

```
# Chain-of-thought: "Think step by step"
prompt = """A company has 3 data centers. Each data center has 8 racks.
Each rack holds 4 TPU v5e pods. Each pod has 256 chips.
How many TPU chips does the company have in total?

Let's think step by step:"""

# Model output:
# Step 1: 3 data centers x 8 racks = 24 racks
# Step 2: 24 racks x 4 pods = 96 pods
# Step 3: 96 pods x 256 chips = 24,576 chips
# Answer: 24,576 TPU chips
```

>**Key Concept:** Chain-of-thought works because it forces the model to allocate more "compute" (tokens) to reasoning before committing to an answer. Without CoT, the model might jump to an incorrect answer. With CoT, the intermediate steps keep the reasoning on track.

### ReAct Prompting

**ReAct (Reasoning + Acting)** is an advanced prompting pattern where the model alternates between reasoning about a problem and taking actions (calling tools, searching data). This is the foundation for AI agent behavior.

The ReAct loop follows this pattern:

1.  **Thought** — the model reasons about what it needs to do next
2.  **Action** — the model calls a tool or API to get information
3.  **Observation** — the tool returns results
4.  **Repeat** — the model reasons about the new information and decides next steps
5.  **Final Answer** — once enough information is gathered, the model responds

```
# ReAct pattern (conceptual)
# Thought: I need to check the current GCP pricing for TPU v5e.
# Action: search("GCP TPU v5e pricing per chip hour 2024")
# Observation: TPU v5e is $1.20 per chip-hour on-demand.
# Thought: Now I can calculate the daily cost for 256 chips.
# Action: calculate(256 * 1.20 * 24)
# Observation: $7,372.80
# Final Answer: Running 256 TPU v5e chips for one day costs ~$7,373.
```

>**Exam Tip:** The exam distinguishes between prompt engineering techniques by their complexity and use case. **Zero/few-shot = classification and formatting.** **CoT = reasoning and math.** **ReAct = tool use and agents.** **Role prompting = behavior and tone.**

## 03. Grounding

**Grounding** connects model outputs to verifiable external data sources, reducing hallucinations and ensuring factual accuracy. It is the primary technique for making generative AI outputs trustworthy for enterprise use.

Vertex AI supports two main grounding approaches:

| Grounding Type | How It Works | Best For |
| --- | --- | --- |
| Google Search Grounding | Gemini queries Google Search and incorporates web results | Current events, public knowledge, general facts |
| Custom Data Grounding (RAG) | Model retrieves from your own enterprise data stores | Internal docs, proprietary knowledge, private data |

```
# Google Search grounding in Vertex AI
from vertexai.generative_models import GenerativeModel, Tool
from vertexai.generative_models import grounding

model = GenerativeModel("gemini-1.5-pro")

# Enable Google Search grounding
search_tool = Tool.from_google_search_retrieval(
    grounding.GoogleSearchRetrieval()
)

response = model.generate_content(
    "What were Google Cloud's latest AI announcements?",
    tools=[search_tool]
)
# Response is grounded in live web search results
# Includes source citations
```

## 04. RAG Deep Dive

**Retrieval-Augmented Generation (RAG)** is the most important technique for enterprise generative AI. It addresses hallucinations, knowledge cutoff, and domain specificity by providing the model with relevant context from your own data at inference time.

### The RAG Pipeline

A RAG system has two phases: an **offline indexing phase** (prepare your data) and an **online retrieval phase** (serve queries).

### Offline: Indexing

1.  **Document ingestion** — load documents from GCS, BigQuery, URLs, or databases
2.  **Chunking** — split documents into smaller passages (typically 256-1024 tokens)
3.  **Embedding** — convert each chunk into a vector using an embedding model (e.g., text-embedding-004)
4.  **Indexing** — store vectors in a vector database (Vertex AI Vector Search)

### Online: Retrieval & Generation

1.  **Query embedding** — user's question is converted to a vector
2.  **Similarity search** — find the top-K most similar document chunks
3.  **Context assembly** — retrieved chunks are inserted into the prompt
4.  **Generation** — Gemini generates a response grounded in the retrieved context

>**Key Concept:** **Chunking strategy matters.** Too small = context is lost. Too large = irrelevant information dilutes the signal. Overlap between chunks prevents information from being split at boundaries. The exam may test your understanding that chunk size is a key hyperparameter in RAG systems.

### RAG vs Fine-Tuning: When to Use Each

| Factor | RAG | Fine-Tuning |
| --- | --- | --- |
| Data freshness | Always current (updates to data store are immediate) | Static (requires retraining for new data) |
| Setup cost | Low (no training, just index documents) | Higher (requires training data, compute, iteration) |
| Per-query cost | Higher (retrieval + longer prompts) | Lower (knowledge is in the model weights) |
| Traceability | High (can cite source documents) | Low (knowledge is encoded in weights) |
| Best for | Q&A over docs, factual accuracy, changing data | Style, tone, specialized behavior, domain language |

>**Exam Distinction:** **RAG adds knowledge at inference time.** **Fine-tuning bakes knowledge into model weights.** If the question mentions "frequently changing data" or "source citations," the answer is RAG. If it mentions "consistent writing style" or "domain-specific terminology," the answer is fine-tuning.

## 05. Fine-Tuning

**Fine-tuning** is the process of further training a pre-trained model on a specific dataset to customize its behavior for a particular task or domain. Vertex AI supports multiple fine-tuning approaches:

📚

#### Supervised Fine-Tuning (SFT)

Train on input-output pairs showing the desired behavior. Provide hundreds to thousands of examples in your specific format, style, and domain. The most common approach.

🎯

#### RLHF

Reinforcement Learning from Human Feedback. Human evaluators rank model outputs, and the model is trained to prefer higher-ranked responses. Used for alignment and safety.

🔁

#### Distillation

Train a smaller model to mimic a larger model's outputs. Reduces cost and latency while retaining most of the quality. Available for Gemini models on Vertex AI.

🔧

#### Parameter-Efficient (LoRA/Adapter)

Train only a small number of additional parameters rather than the full model. Faster, cheaper, and enables multiple fine-tuned variants from one base model.

```
# Fine-tuning example on Vertex AI (conceptual)
from vertexai.tuning import sft

# Prepare training data as JSONL
# {"messages": [{"role": "user", "content": "..."}, {"role": "model", "content": "..."}]}

tuning_job = sft.train(
    source_model="gemini-1.5-pro-002",
    train_dataset="gs://my-bucket/training-data.jsonl",
    validation_dataset="gs://my-bucket/validation-data.jsonl",
    epochs=3,
    learning_rate_multiplier=1.0,
    tuned_model_display_name="my-custom-gemini",
)

# After tuning, deploy the model
tuned_model = GenerativeModel(tuning_job.tuned_model_endpoint_name)
```

## 06. Human-in-the-Loop (HITL)

**Human-in-the-loop (HITL)** involves integrating human review and oversight into the generative AI pipeline. This is critical for high-stakes applications where errors have significant consequences (medical, legal, financial, safety-critical).

### HITL Patterns

| Pattern | Description | Example |
| --- | --- | --- |
| Pre-publication Review | Human reviews AI output before it reaches end users | Marketing copy approval, medical report review |
| Feedback Loop | Users rate or correct AI outputs, feeding back into training | Thumbs up/down on chatbot responses |
| Confidence-Based Routing | Low-confidence responses are escalated to humans | Customer service agent handoff |
| Collaborative Authoring | AI generates a draft, human edits and refines | AI writes first draft, human editor polishes |

## 07. Monitoring Gen AI in Production

Deploying a generative AI model is not the end — it is the beginning of ongoing monitoring and optimization. Key aspects to monitor:

📊

#### Quality Metrics

Track response quality over time using automated metrics (BLEU, ROUGE, factual accuracy) and human evaluation. Detect quality degradation early.

💰

#### Cost Monitoring

Track token usage, API calls, and compute costs. Identify expensive queries. Optimize by caching common responses or using smaller models for simple tasks.

⏱

#### Latency Tracking

Monitor response times to ensure SLA compliance. Identify slow queries and optimize prompt length, model selection, or caching strategies.

🔒

#### Safety Monitoring

Track safety filter triggers, harmful content attempts, and policy violations. Ensure responsible AI guardrails remain effective over time.

## 08. Sampling Parameters

Sampling parameters control **how** the model selects tokens during generation. They do not change the model itself, but they dramatically affect the output's style, creativity, and consistency. These are critical for the exam.

### Temperature

**Temperature** controls the randomness of token selection. It scales the logits (raw probability scores) before the softmax function:

-   **Temperature = 0** — deterministic, always picks the highest-probability token (greedy decoding). Best for factual, consistent outputs.
-   **Temperature = 0.1-0.3** — mostly deterministic with slight variation. Good for analytical tasks.
-   **Temperature = 0.7-1.0** — balanced creativity. Standard for conversational AI.
-   **Temperature > 1.0** — highly creative/random. May produce incoherent outputs.

>**Exam Tip:** **Factual Q&A = low temperature (0-0.3).** **Creative writing = high temperature (0.7-1.0).** **Code generation = medium-low temperature (0.2-0.4).** The exam loves asking "which temperature setting" for a given scenario.

### Top-P (Nucleus Sampling) and Top-K

**Top-P** limits token selection to the smallest set whose cumulative probability exceeds P. For example, top-p = 0.9 means the model considers only enough tokens to cover 90% of the probability mass.

**Top-K** limits selection to the K most probable tokens. For example, top-k = 40 means only the top 40 tokens are considered at each step.

| Parameter | Low Value | High Value | Default (Gemini) |
| --- | --- | --- | --- |
| Temperature | 0 (deterministic) | 2.0 (very random) | 1.0 |
| Top-P | 0.1 (very focused) | 1.0 (all tokens) | 0.95 |
| Top-K | 1 (greedy) | 100+ (diverse) | 40 |

### Tokens and Context Window

**Tokens** are the basic units of text that models process. A token is roughly 4 characters or 3/4 of a word in English. Understanding token limits is essential for prompt design:

-   **Max input tokens** — the maximum prompt size (context window). Gemini 1.5 Pro supports up to 2 million tokens.
-   **Max output tokens** — the maximum response length. Set via `max_output_tokens` parameter.
-   **Total token budget** = input tokens + output tokens. Longer prompts (e.g., with RAG context) leave fewer tokens for the response.

```
# Configuring sampling parameters
from vertexai.generative_models import GenerativeModel, GenerationConfig

model = GenerativeModel("gemini-1.5-pro")

# For factual Q&A: low temperature, focused sampling
factual_config = GenerationConfig(
    temperature=0.1,
    top_p=0.8,
    top_k=20,
    max_output_tokens=1024,
)

# For creative writing: higher temperature, broader sampling
creative_config = GenerationConfig(
    temperature=0.9,
    top_p=0.95,
    top_k=40,
    max_output_tokens=2048,
)

response = model.generate_content(
    "Write a haiku about cloud computing.",
    generation_config=creative_config
)
```

>**Summary: Technique Selection Guide:** **Start with prompt engineering** (free, fast). If that is not enough, add **grounding/RAG** (moderate effort). If you need behavioral changes, try **fine-tuning** (significant effort). Always include **HITL** for high-stakes applications. Tune **sampling parameters** throughout. Add **monitoring** before production launch.

Previous

[← 02 · GCP Gen AI Offerings](02-gcp-gen-ai-offerings.html)

Next

[04 · Business Strategies →](04-business-strategies.html)