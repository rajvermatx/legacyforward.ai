---
title: "LLMs, SLMs & Multimodal Models"
slug: "llms-slms-multimodal"
description: "A practitioner's guide to choosing the right model — when to use large vs small, closed vs open, text-only vs multimodal. Includes cost comparisons, capability tradeoffs, and a decision framework for production model selection."
section: "genai"
order: 2
badges:
  - "Model Landscape"
  - "Key Models & Families"
  - "Small Language Models"
  - "Multimodal Capabilities"
  - "Selection Framework"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai/02-llms-slms-multimodal.ipynb"
---

## 01. The LLM Landscape

![Diagram 1](/diagrams/genai/llms-slms-multimodal-1.svg)

Model landscape positioned by capability (vertical) versus cost-per-token (horizontal). The dashed curve represents the value frontier — models on it deliver optimal capability for their price point.

When people say a model is "large," they are referring to its **parameter count** — the number of learned numerical weights that encode the model's knowledge and behavior. But parameter count is just the headline number. What actually determines a model's capability is the combination of parameters, training data quality, and compute used during training. A model with fewer parameters trained on better, more carefully curated data can outperform a larger model trained sloppily. This is why some of the most surprising results in recent years have been small models punching far above their weight.

The major providers break into two camps. On the **closed-weight** side: OpenAI (GPT-4o, o1, o3), Anthropic (Claude 3.5 and 3.7), Google DeepMind (Gemini Flash, Pro, Ultra), and others. These companies keep weights proprietary and give you access through paid APIs. On the **open-weight** side: Meta AI (Llama 3.x), Mistral AI, Alibaba (Qwen 2.5), Microsoft (Phi-3, Phi-4), Google (Gemma 2), and DeepSeek. These labs release model weights publicly — you can download them, run them locally, fine-tune them, and deploy on your own infrastructure.

The landscape changes fast. Models that were state-of-the-art in early 2024 were beaten by mid-2024. GPT-3.5-level capability, which cost meaningful money in 2022, can now run locally for free on a mid-range laptop. The specific model names you memorize today will be outdated within months, but the **frameworks for evaluating and selecting models** stay relevant.

>**Think of it like this:** The model landscape is like the smartphone market in 2010. New flagships appear every few months, last year's premium becomes this year's budget option, and the real skill is not knowing which phone is best today — it is knowing how to evaluate which phone fits your needs.

### What This Means for Practitioners

**Closed-weight vs. open-weight is an engineering decision, not a philosophical one.** Here is when to choose each:

| Factor | Closed-Weight API | Open-Weight Self-Hosted |
| --- | --- | --- |
| Best for | Rapid prototyping, complex reasoning, user-facing chat | Data-sensitive workloads, high-volume inference, custom fine-tuning |
| Data privacy | Data leaves your premises | Data stays on your infrastructure |
| Cost model | Pay per token (scales linearly) | Pay for hardware (fixed cost, unlimited tokens) |
| Maintenance | Zero — provider handles everything | You manage GPUs, updates, monitoring |
| Customization | Limited to prompt engineering | Full fine-tuning, quantization, custom serving |
| Availability | Subject to provider outages and pricing changes | You control uptime and versioning |

**Context windows have expanded dramatically but longer is not always better.** Claude 3.7 Sonnet offers 200K tokens, Gemini 2.0 can handle 1M tokens. But research consistently shows a "lost in the middle" problem — information buried deep in a long context is recalled less reliably. Structured retrieval (RAG) often outperforms naive context stuffing even when the window is technically large enough.

**Mixture-of-Experts (MoE) is how frontier models stay fast despite being huge.** An MoE model has multiple feed-forward blocks ("experts") and a routing network that selects a small subset for each token. Mixtral 8x7B has 46B total parameters but only activates about 12B per inference step — quality closer to a 40B+ dense model at the speed of a 12B model. GPT-4 is widely speculated to use this approach.

**Benchmarks are useful for rough comparisons but unreliable for your specific task.** MMLU measures factual recall, not the reasoning or instruction-following that matters in production. The benchmarks that matter most: **LMSYS Chatbot Arena** (human preference voting — the gold standard), **LiveBench** (dynamically updated to prevent contamination), and **GPQA** (graduate-level questions that even PhD experts struggle with). Always build your own evaluation set for your specific use case.

## 02. Key Models — What You Need to Know

Rather than memorize every model's specifications, focus on understanding which model to reach for in which situation. Here is the practical landscape.

**GPT-4o** is OpenAI's flagship. Natively multimodal (text, images, audio in one API call), fast, and strong on most benchmarks. Your default choice when you need maximum capability from the OpenAI ecosystem.

**Claude 3.5 and 3.7 Sonnet** from Anthropic are the best balance of speed, intelligence, and cost in the Claude family. Particularly strong at following complex, nuanced instructions without going off-script — popular for production systems where reliability matters. Claude 3.7 Sonnet adds "extended thinking" for complex reasoning at the cost of higher latency.

**Gemini 2.0 Flash and Pro** from Google are notable for native multimodality from the ground up and extremely competitive pricing. Flash is among the most cost-effective capable models available — a default choice for high-volume applications.

**Llama 3.x** from Meta is the most important open-weight family. The 8B variant runs on consumer hardware. The 70B variant is genuinely competitive with frontier closed models on many tasks. All variants are Apache 2.0 licensed for commercial use.

**Mistral and Mixtral** push the envelope on open-weight efficiency. Common choice for self-hosted deployments, especially in European enterprises with data sovereignty requirements.

**DeepSeek-R1** is an open-weight reasoning model competitive with OpenAI's o1 on math and coding benchmarks. The fact that this capability is now available as downloadable weights is a significant shift.

>**Think of it like this:** Choosing an LLM is like choosing a vehicle. A sports car (GPT-4o, Claude Opus) is amazing for winding mountain roads but expensive to run daily. A reliable sedan (GPT-4o-mini, Gemini Flash) handles 90% of trips at a fraction of the cost. A pickup truck (self-hosted Llama 70B) costs more upfront but pays for itself if you are hauling loads every day.

### What This Means for Practitioners: Model Comparison

| Model | Provider | Strengths | Best For | Pricing (per 1M tokens in/out) |
| --- | --- | --- | --- | --- |
| GPT-4o | OpenAI | Strong reasoning, multimodal, fast | Complex tasks, user-facing chat | $2.50 / $10.00 |
| GPT-4o-mini | OpenAI | Very cheap, surprisingly capable | High-volume simple tasks | $0.15 / $0.60 |
| Claude 3.7 Sonnet | Anthropic | Instruction following, extended thinking, 200K context | Production systems, complex prompts | $3.00 / $15.00 |
| Gemini 2.0 Flash | Google | Cheapest capable model, 1M context | Cost-sensitive pipelines | $0.075 / $0.30 |
| o1 / o3 | OpenAI | Multi-step reasoning, math, code | Genuinely hard reasoning problems | 3-10x GPT-4o cost |
| Llama 3.1 70B | Meta (open) | Self-hostable, fine-tunable, competitive quality | Data-sensitive, high-volume, custom models | Hardware cost only |
| Phi-4 (14B) | Microsoft (open) | Small but strong reasoning, runs on consumer GPU | Edge, offline, budget-constrained | Hardware cost only |

**Practical default choices for this course:** Claude Sonnet or GPT-4o for complex tasks. Gemini Flash or GPT-4o-mini for cost-sensitive pipelines. Llama 3 8B/70B for self-hosted experiments. This covers 95% of real-world use cases.

## 03. Small Language Models (SLMs)

The excitement around GPT-4-scale models can create a false impression that bigger is always better. In many production scenarios, the opposite is true. A **small language model** — typically under 10 billion parameters — can run on a single consumer laptop, respond in near-real-time, operate entirely offline, and cost essentially nothing per query once you own the hardware.

**Microsoft's Phi series** demonstrates what carefully chosen training data can accomplish. Phi-3-mini at 3.8B parameters fits in 4GB of VRAM, has a 128K-token context window, and matches or beats Llama 3 8B on many reasoning benchmarks. Phi-4 at 14B scores higher than Llama 3 70B on several math benchmarks while being five times smaller.

**Gemma 2** from Google at 2B, 9B, and 27B parameters is specifically optimized for on-device inference. The 2B variant can run on a Raspberry Pi or a modern smartphone.

**Quantization** makes small models even smaller. Representing weights in 4-bit precision instead of 16-bit reduces memory by 4x. A 7B model goes from 14GB (needs a $10K GPU) to ~3.5GB (runs on a laptop). Quality penalty is typically 1-3% for int8, 3-7% for int4 — often acceptable for production tasks. The dominant format is **GGUF**, used by llama.cpp and Ollama.

### What This Means for Practitioners: When to Choose an SLM

| Scenario | Why SLM Wins | Recommended Models |
| --- | --- | --- |
| **Privacy-critical data** (medical, legal, financial) | Data never leaves your premises | Llama 3 8B, Phi-4, Mistral 7B |
| **Edge / offline deployment** (mobile, IoT, field tools) | No internet required | Phi-3-mini, Gemma 2B |
| **High-volume simple tasks** (10M+ classifications/day) | Near-zero marginal cost | Phi-3-mini quantized, Gemma 9B |
| **Development and testing** | No API costs, instant iteration | Any model via Ollama |
| **Custom fine-tuned specialist** | Full control, one base + many adapters | Llama 3 8B + LoRA |

**The unit economics are compelling.** A frontier API at $3/1M tokens processing 1M daily queries at 500 tokens average costs ~$547K/year. A 7B model on a single GPU at $2.50/hour costs ~$22K/year — a 25x reduction. The tradeoff is quality (which you must measure on your specific task) and operational complexity.

**Ollama is the fastest way to run local models.** A single command — `ollama run llama3.2` — downloads, quantizes, and serves a model. It also exposes an OpenAI-compatible API on localhost, meaning any code written for the OpenAI SDK works unchanged against a local model.

```
from openai import OpenAI

# Redirect to local Ollama instance
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # required but ignored by Ollama
)

response = client.chat.completions.create(
    model="llama3.2",
    messages=[
        {"role": "user", "content": "Explain quantization in two sentences."}
    ],
    temperature=0.7,
)
print(response.choices[0].message.content)
```

>**Think of it like this:** An SLM is like a specialist surgeon vs. a general hospital. The hospital (GPT-4o) can handle anything, but for the one surgery you do 10,000 times a day, the specialist (a fine-tuned 7B model) is faster, cheaper, and just as good at that specific procedure.

## 04. Multimodal Models

A multimodal model processes multiple types of data — most commonly text and images, but increasingly audio and video. This is not a minor feature addition; it eliminates entire categories of preprocessing pipelines.

The most immediately practical capability is **vision**: send an image alongside a text prompt and have the model reason about both. Screenshot of an error message? Ask the model to debug it. Photo of a whiteboard? Ask for an explanation. PDF page with tables and charts? Send the page as an image and extract structured data directly — no brittle OCR pipeline needed.

**Document understanding** is where multimodal models change the game. Traditional PDF extraction meant: convert to text (lossy), run OCR on scans (error-prone), then process with NLP. With multimodal models, you send a page screenshot directly — the model reads text, understands layout, interprets figures, and reasons about everything together.

**Audio capabilities** add another dimension. OpenAI's Whisper handles speech-to-text with near-human accuracy. GPT-4o's real-time audio API processes speech directly — preserving tone and emotion rather than just transcribing words.

![Diagram 2](/diagrams/genai/llms-slms-multimodal-2.svg)

Multimodal input processing: images are split into 16x16 patches, encoded by a Vision Transformer, and projected into the LLM's embedding space. Text is tokenized and embedded separately. Both are concatenated into a single unified sequence before entering the language model decoder.

### What This Means for Practitioners: Multimodal Use Cases

| Use Case | Best Models | Notes |
| --- | --- | --- |
| Document extraction (tables, forms) | Claude 3+, GPT-4o | Send page screenshots, not extracted text |
| Code screenshot debugging | GPT-4o, Claude 3+ | Paste error screenshots directly |
| Chart and diagram analysis | Gemini 1.5+, Claude 3+ | Model reads visual data natively |
| Video understanding | Gemini 2.0 (native video) | Matches audio with visual events at timestamps |
| Speech-to-text preprocessing | Whisper (open-source) | Runs locally, 5GB VRAM for medium model |
| Voice assistants | GPT-4o real-time audio API | Processes speech directly, not transcribe-then-LLM |

**Sending images via API** requires encoding as base64 and including in the message content as a typed content block:

```
import anthropic
import base64
from pathlib import Path

client = anthropic.Anthropic()

image_data = base64.standard_b64encode(Path("chart.png").read_bytes()).decode("utf-8")

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_data}},
            {"type": "text", "text": "Extract all data from this chart as JSON."}
        ],
    }],
)
print(message.content[0].text)
```

**Image tokens cost money.** A 512x512 image consumes approximately 170 tokens in OpenAI's pricing model. Factor this into your cost estimates for vision-heavy pipelines.

## 05. Model Selection Framework

One of the most common mistakes is optimizing for the "best" model on general benchmarks. Benchmark performance may have no correlation with performance on your specific task. A model that scores 5 points lower on MMLU might outperform the leader on your use case because it was fine-tuned on similar data or follows your prompt patterns better.

The **"good enough" principle** is one of the most commercially important ideas in applied AI. A model that achieves 90% of the quality at 20% of the cost and 300% of the speed is almost always the right production choice — provided you can measure that quality gap.

### What This Means for Practitioners: The Decision Framework

**Start with the latency requirement:**

| Latency Need | Model Tier | Examples |
| --- | --- | --- |
| Under 500ms (interactive UI) | Fast/cheap | GPT-4o-mini, Gemini Flash, Claude Haiku, local SLM |
| 1-5 seconds (standard chat) | Balanced | Claude Sonnet, GPT-4o, Gemini Pro |
| 5-30 seconds (complex reasoning) | Premium reasoning | o1/o3, Claude extended thinking |
| Non-real-time (batch processing) | Cheapest that meets quality | Batch API at 50% discount, self-hosted |

**Then check these constraints:**

- **Vision needed?** GPT-4o, Claude 3+, Gemini 1.5+, or Llama 3.2 (open-weight)
- **Private data?** Self-host: Llama 3, Mistral, Phi-4, Qwen via Ollama or vLLM
- **Multilingual?** Qwen 2.5 (strong CJK), Claude (strong European), GPT-4o (broad)
- **Budget-constrained high volume?** Gemini Flash ($0.075/1M in) or self-hosted SLM

**The professional testing methodology:**
1. Define your task and collect 50-200 representative examples
2. Label them with correct outputs (human-annotated or from a trusted model)
3. Run each candidate model with your production prompt
4. Score outputs against golden labels
5. Sort by quality-per-dollar on your specific task
6. Pick the model at the knee of the curve

```
import tiktoken

def estimate_cost(prompt: str, model: str = "gpt-4o") -> dict:
    PRICING = {
        "gpt-4o": (2.50, 10.00), "gpt-4o-mini": (0.15, 0.60),
        "claude-sonnet-4-6": (3.00, 15.00), "gemini-2.0-flash": (0.075, 0.30),
    }
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    input_tokens = len(encoding.encode(prompt))
    price_in, price_out = PRICING.get(model, (3.0, 15.0))
    estimated_output = 300
    return {
        "input_tokens": input_tokens,
        "est_cost_usd": round((input_tokens / 1_000_000) * price_in + (estimated_output / 1_000_000) * price_out, 6),
    }
```

>**Important Note on Pricing:** API prices change frequently. Always check the current pricing page for each provider before building cost estimates into business cases.

## Interview Ready

>**Elevator Pitch — 2-Minute Interview Explanation:** "The modern model landscape spans three categories. **Large Language Models** like GPT-4o and Claude Sonnet deliver frontier reasoning and multimodal capabilities through paid APIs. **Small Language Models** like Phi-4 and Gemma 2 can run on a single consumer GPU and are the right choice for privacy, offline access, or high-volume inference at near-zero marginal cost. **Multimodal models** extend beyond text to accept images, audio, and video — using Vision Transformers to encode image patches into the same vector space as text tokens. The key engineering decision is not picking the 'best' model — it is building an evaluation set for your specific task and finding the model at the knee of the quality-per-dollar curve."

### Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| When would you choose an SLM over a frontier API? | Can you make practical cost-quality tradeoffs? |
| How does a multimodal model process an image alongside text? | Do you understand ViT + projection, or is it magic? |
| What is Mixture-of-Experts and why does it matter? | Can you explain how MoE decouples parameters from inference cost? |
| How would you decide between closed-weight API and self-hosted open-weight? | Do you think about privacy, cost, latency, and operations holistically? |
| How would you select a model for a new production use case? | Do you have a systematic methodology or just pick the most famous model? |

### Model Answers

>**Q1 — SLM vs. frontier:** SLMs win when data cannot leave your premises, when you need offline/edge deployment, or when running millions of queries daily on a well-defined task. The decision framework: establish a quality ceiling with a frontier model, build a golden eval set, then test smaller alternatives to find where quality drops below your threshold. A quantized 7B model can replace a $500K/year API bill if the task is bounded.
>**Q2 — Multimodal image processing:** The image is divided into 16x16 pixel patches. Each patch is encoded by a Vision Transformer into a visual embedding. A projection layer maps these embeddings into the same dimensional space as text token embeddings. Both are concatenated into a single sequence processed by the language model decoder — image patches become "visual tokens."
>**Q3 — Mixture-of-Experts:** In a dense transformer, every token passes through the same feed-forward network. In MoE, multiple expert FFN blocks exist and a routing network selects a small subset (typically 2) per token. Mixtral 8x7B has 46B total parameters but activates only ~12B per step — quality of a 40B+ dense model at the speed of a 12B model.
>**Q4 — Closed vs. open-weight:** Closed APIs offer frontier quality, zero infrastructure, and continuous updates — but data leaves your premises and costs scale linearly with volume. Open-weight models keep data on-premises, allow fine-tuning, and offer near-zero marginal cost at high volume — but require GPU infrastructure and operational overhead. The decision depends on data sensitivity, volume (at 10M+ daily queries self-hosting saves 25x), and the quality gap on your specific task.
>**Q5 — Model selection methodology:** Define the task, collect 50-200 representative examples, label them, run all candidate models, score against golden labels, and sort by quality-per-dollar. Pick the model at the knee of the curve — the one after which additional quality gains cost disproportionately more.

### Common Mistakes

-   **Defaulting to the largest model for every task.** GPT-4o for simple classification wastes money and adds latency. Measure quality on your specific task — GPT-4o-mini or a fine-tuned 7B model is often sufficient.
-   **Ignoring parameter count when planning infrastructure.** A 70B model at FP16 requires ~140GB VRAM — two A100 GPUs minimum. Proposals to "just deploy Llama 70B" without hardware planning reveal a gap between theory and production readiness.
-   **Treating multimodal as OCR + LLM.** Native multimodal models process layout, figures, and text together. A pipeline of "OCR the document, then send text to an LLM" misses the architectural shift — direct image input handles tables and charts far more reliably.

Previous Module

[01 · Foundations of GenAI](01-foundations-of-genai.html)

Next Module

[03 · APIs for LLMs](03-api-for-llms.html)

Phase: Foundations → API Access
