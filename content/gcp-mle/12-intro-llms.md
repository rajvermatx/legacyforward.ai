---
title: "Introduction to Large Language Models"
slug: "intro-llms"
description: "Large Language Models are the engines behind modern generative AI. This module goes deep into
    how LLMs work — from pre-training objectives and emergent capabilities to fine-tuning strategies,
    evaluation metrics, and inference optimization. Master the concepts needed to select, tune, and
    "
section: "gcp-mle"
order: 12
badges:
  - "LLM Fundamentals"
  - "Fine-Tuning & PEFT"
  - "Google's LLMs"
  - "Evaluation Metrics"
  - "Inference Optimization"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle/12-intro-llms.ipynb"
---

## 01. LLM Fundamentals

### Parameters, Tokens, Context Window, and Pre-training

A **Large Language Model (LLM)** is a neural network with billions of learned parameters trained on vast text corpora to understand and generate human language. The term "large" refers to both the parameter count (typically 1 billion to over 1 trillion) and the training data volume (terabytes of text from books, websites, code repositories, and other sources).

**Parameters** are the learned weights of the neural network. Each parameter is a floating-point number that the model adjusts during training. More parameters generally means more capacity to store knowledge and capture nuanced patterns, but also means more compute for training and inference, more memory, and higher cost. A 70B parameter model in FP16 requires approximately 140 GB of GPU memory just for the weights.

**Tokens** are the atomic units of text that LLMs process. Rather than working with whole words, LLMs use subword tokenization (BPE, SentencePiece, or WordPiece) that breaks text into pieces. Common words remain whole ("the", "is"), while rare words are split into subword pieces ("un" + "believ" + "able"). A rough approximation is that 1 token equals approximately 4 characters or 0.75 words in English.

The **context window** is the maximum number of tokens the model can process in a single forward pass. This includes both the input prompt and the generated output. Early models had 2K-4K context windows; Gemini 1.5 Pro supports up to 1 million tokens. A larger context window allows the model to process entire books, long codebases, or extensive conversation histories, but requires quadratically more computation in standard attention (though modern architectures use efficient attention variants).

>**Scale Reference:** **Gemini 1.5 Pro**: ~1M token context window. **GPT-4**: 128K tokens. **Llama 3**: 8K-128K tokens. **Gemma 2**: 8K tokens. The context window is a critical factor in model selection for tasks requiring long input documents.

## 02. LLM Training

### Pre-training Objectives

LLMs are pre-trained using self-supervised learning objectives that require no human-labeled data. The two dominant pre-training objectives are **next-token prediction** (causal language modeling) and **masked language modeling**.

**Next-token prediction** (used by GPT, Gemini, Llama) trains the model to predict the next token in a sequence given all preceding tokens. The model reads text left-to-right with causal masking, so each token can only attend to tokens before it. This objective is remarkably effective: by forcing the model to predict the next word across trillions of tokens of diverse text, it learns grammar, facts, reasoning patterns, code structure, and much more. The loss function is cross-entropy between the predicted probability distribution and the actual next token.

L = - (1/T) ∑(t=1 to T) log P(x\_t | x\_1, ..., x\_(t-1); θ)

**Masked language modeling** (used by BERT, RoBERTa) randomly masks 15% of input tokens and trains the model to predict the masked tokens using bidirectional context (both left and right). This produces excellent representations for understanding tasks (classification, NER, similarity) but is not directly suited for generation since it sees context from both directions.

**Compute requirements** for pre-training are enormous. The Chinchilla scaling law suggests that optimal training uses approximately 20 tokens per parameter. A 70B model should be trained on approximately 1.4 trillion tokens. This requires thousands of GPUs/TPUs running for weeks, with total compute measured in millions of GPU-hours and costing tens of millions of dollars. This is why pre-training is done by large organizations, and downstream users focus on fine-tuning or prompting.

>**Training Pipeline:** The full LLM training pipeline: (1) **Pre-training** on raw text (self-supervised). (2) **Supervised fine-tuning (SFT)** on instruction-response pairs. (3) **RLHF or DPO** alignment using human preference data. Steps 2 and 3 transform a raw text predictor into a helpful, harmless assistant.

## 03. Emergent Capabilities

### In-Context Learning, Reasoning, and Chain-of-Thought

**Emergent capabilities** are abilities that appear in large models but are absent or minimal in smaller ones, without being explicitly trained for. These capabilities emerge from the combination of massive scale, diverse training data, and the richness of the language modeling objective.

**In-context learning (ICL)** is the ability of LLMs to learn new tasks from examples provided in the prompt, without any parameter updates. You provide a few input-output examples in the prompt, and the model generalizes to produce correct outputs for new inputs. This is remarkable because the model was never trained on your specific task — it infers the pattern from the examples alone. ICL works because the pre-training data contains many implicit "tasks" (translation, summarization, Q&A patterns), and the model learns a general task-inference mechanism.

**Chain-of-thought (CoT) reasoning** is the phenomenon where prompting a model to "think step by step" before answering dramatically improves accuracy on reasoning tasks (math, logic, multi-step problems). Without CoT, a model might jump directly to an answer and get it wrong. With CoT, the model generates intermediate reasoning steps that guide it to the correct answer. This works because the model has seen step-by-step solutions in its training data and can replicate the pattern when prompted to do so.

Other emergent capabilities include **instruction following** (understanding and executing complex natural language instructions), **code generation** (writing correct programs from descriptions), **multilingual transfer** (performing tasks in languages it saw less of during training), and **analogical reasoning** (identifying patterns and applying them to new situations).

>**Important Nuance:** Emergence does not mean the model "understands" in a human sense. It means the model produces outputs that **appear to demonstrate understanding** because its statistical patterns are rich enough to capture complex reasoning structures. The exam may test whether you understand this distinction.

## 04. Tuning Approaches

### Prompt Engineering, Fine-Tuning, RLHF, and DPO

There are multiple ways to adapt a pre-trained LLM to a specific task. The choice depends on your data availability, compute budget, latency requirements, and how far the base model's behavior is from your desired behavior.

**Prompt engineering** is the simplest approach: you craft the input prompt to elicit the desired behavior without modifying the model's weights. Techniques include zero-shot prompting, few-shot prompting, chain-of-thought, system instructions, and structured output formats. Prompt engineering is fast, requires no training data or compute beyond inference, and works well when the base model already has the knowledge needed for the task.

**Fine-tuning** updates the model's weights on a task-specific dataset. Supervised fine-tuning (SFT) trains the model on input-output pairs: (instruction, desired response). This teaches the model your specific domain, style, format, or task structure. Fine-tuning requires labeled data (hundreds to thousands of examples), training compute (GPU hours), and careful hyperparameter tuning to avoid catastrophic forgetting of the base model's general capabilities.

**RLHF (Reinforcement Learning from Human Feedback)** is the alignment technique used to make LLMs helpful, harmless, and honest. After SFT, human evaluators rank multiple model outputs for the same prompt. These rankings train a reward model that predicts human preference. The LLM is then fine-tuned using reinforcement learning (PPO) to maximize the reward model's score. RLHF is what transforms a raw text predictor into a conversational assistant.

**DPO (Direct Preference Optimization)** is a simpler alternative to RLHF that eliminates the need for a separate reward model and RL training loop. DPO directly optimizes the LLM on preference pairs (preferred response vs rejected response) using a modified cross-entropy loss. It is computationally simpler, more stable, and increasingly preferred for alignment.

P

#### Prompt Engineering

No training needed. Fast iteration. Works when base model has the right knowledge. Limited for domain-specific or format-specific needs.

F

#### Fine-Tuning (SFT)

Updates model weights. Requires labeled data and compute. Best for domain adaptation, style/format control, and consistent behavior.

R

#### RLHF

Aligns model to human preferences. Requires reward model + RL loop. Complex but powerful for safety and helpfulness alignment.

D

#### DPO

Simpler alignment via preference pairs. No reward model needed. More stable training. Increasingly popular alternative to RLHF.

## 05. Parameter-Efficient Fine-Tuning (PEFT)

### LoRA, QLoRA, and Adapter Tuning

Full fine-tuning updates all parameters of a model, which for a 70B parameter model means storing and updating 70 billion weights plus optimizer states — requiring hundreds of GBs of GPU memory. **Parameter-efficient fine-tuning (PEFT)** methods update only a small fraction of parameters while keeping the rest frozen, dramatically reducing compute and memory requirements.

**LoRA (Low-Rank Adaptation)** is the most widely used PEFT method. Instead of updating a full weight matrix W (of dimension d x d), LoRA adds two small matrices A (d x r) and B (r x d), where r (the rank) is much smaller than d (typically 8-64). The effective weight becomes W + BA, so the model learns a low-rank perturbation to its original weights. Only A and B are trained, reducing trainable parameters by 100-1000x. At inference time, BA can be merged into W with zero additional latency.

W' = W + BA, where B ∈ R^(d×r), A ∈ R^(r×d), r << d

**QLoRA** extends LoRA by quantizing the frozen base model to 4-bit precision, reducing memory by another 4x. The LoRA adapters remain in higher precision (FP16 or BF16) for training stability. QLoRA enables fine-tuning a 65B parameter model on a single 48GB GPU — a task that would require multiple high-end GPUs with full fine-tuning.

**Adapter tuning** inserts small trainable "adapter" modules between the frozen layers of a pre-trained model. Each adapter is a bottleneck layer (down-projection, nonlinearity, up-projection) with a residual connection. Only the adapter parameters are trained. Adapters were an early PEFT method and remain useful, though LoRA has largely superseded them due to zero additional inference latency.

>**Vertex AI PEFT:** Vertex AI supports **supervised tuning** of Gemini and PaLM models with built-in PEFT. You provide training data in JSONL format, and Vertex AI handles the LoRA/adapter configuration automatically. This is the recommended approach for the exam — you do not need to configure LoRA rank manually on Vertex AI.

## 06. Google's LLMs

### Gemini, PaLM 2, and Gemma

Google offers a spectrum of LLMs for different use cases, from the most capable frontier models to lightweight open-source models designed for efficiency and customization.

P

#### Gemini 1.5 Pro

Flagship multimodal model. Up to 1M token context window. Best quality for complex reasoning, long documents, multimodal tasks. Higher cost and latency.

F

#### Gemini 1.5 Flash

Speed-optimized variant. Lower latency, lower cost. Excellent quality for most tasks. Ideal for high-volume production workloads where speed matters.

2

#### PaLM 2

Previous-generation LLM. Strong multilingual and reasoning capabilities. Being superseded by Gemini but still available on Vertex AI.

G

#### Gemma (Open Models)

Open-weight models (2B, 7B, 27B). Built from Gemini research. Free for commercial use. Can be self-hosted, fine-tuned, and customized without API costs.

**Gemini 1.5 Pro** is Google's most capable model, designed for tasks requiring deep reasoning, long-context understanding (up to 1M tokens), and multimodal processing. Its 1M context window allows processing entire codebases, full-length books, or hours of video in a single prompt.

**Gemini 1.5 Flash** is optimized for speed and efficiency while maintaining high quality. It is 5-10x faster than Pro and significantly cheaper per token. For most production workloads, Flash provides the best cost-performance tradeoff.

**Gemma** is Google's family of open-weight models, ranging from 2B to 27B parameters. Gemma models are derived from the same research as Gemini but are designed for self-hosting and customization. They can be deployed on GKE, Cloud Run, or any infrastructure, fine-tuned with your data, and used without per-token API costs. Gemma is ideal when you need full control, data privacy, or offline deployment.

>**Model Selection for the Exam:** The exam will present scenarios requiring model selection. Key decision factors: **Gemini Pro** for maximum quality and long context. **Gemini Flash** for speed and cost at scale. **Gemma** for self-hosting, data privacy, customization, and offline deployment. **PaLM 2** is a valid answer only for legacy scenarios.

## 07. LLM Evaluation

### Metrics and Benchmarks

Evaluating LLMs is fundamentally different from evaluating traditional ML models. There is often no single "correct" answer, and quality is multidimensional (accuracy, fluency, relevance, safety, format compliance). Multiple complementary evaluation approaches are used.

P

#### Perplexity

Measures how well the model predicts text. Lower is better. Perplexity = exp(-average log likelihood). Good for comparing base models, less useful for task-specific evaluation.

B

#### BLEU

Measures n-gram overlap between generated and reference text. Originally for machine translation. Score 0-1, higher is better. Precision-focused metric.

R

#### ROUGE

Measures recall of n-grams from reference text. Used primarily for summarization. Variants: ROUGE-1 (unigrams), ROUGE-2 (bigrams), ROUGE-L (longest common subsequence).

H

#### Human Evaluation

Gold standard for quality assessment. Human raters judge fluency, relevance, accuracy, helpfulness. Expensive and slow but most reliable for subjective quality.

**Benchmarks** provide standardized evaluation across models. Common benchmarks include **MMLU** (massive multitask language understanding — 57 subjects from STEM to humanities), **HumanEval** (code generation correctness), **GSM8K** (grade school math reasoning), and **TruthfulQA** (factual accuracy and resistance to common misconceptions).

**Vertex AI Model Evaluation** provides built-in evaluation tools. You can evaluate generative models against ground-truth datasets, compute BLEU/ROUGE scores automatically, and use model-based evaluation (using a strong model like Gemini Pro to judge the quality of a weaker model's outputs). This "LLM-as-judge" approach is increasingly popular as it scales better than human evaluation while maintaining reasonable correlation with human judgments.

Perplexity = exp( -(1/T) ∑(t=1 to T) log P(x\_t | x\_<t) )

## 08. LLM Limitations

Understanding LLM limitations is critical for the exam, which frequently tests your ability to identify when LLMs are **not** the right solution or when additional mitigations are needed.

-   **Hallucination** — Models generate plausible but factually incorrect content. They cannot verify their own outputs against ground truth. Mitigate with RAG, grounding, and verification pipelines.
-   **Reasoning errors** — Despite impressive performance, LLMs make systematic errors on multi-step reasoning, arithmetic, and logical deduction. Chain-of-thought helps but does not eliminate errors.
-   **Context window limits** — Even with 1M token windows, models may struggle with information retrieval from the middle of very long contexts ("lost in the middle" phenomenon).
-   **Knowledge cutoff** — Models only know information from their training data. They cannot access real-time information without grounding/RAG.
-   **Cost and latency** — Large models are expensive to run at scale. Token costs accumulate quickly for high-volume applications. Latency may be unacceptable for real-time systems.
-   **Non-determinism** — With temperature > 0, outputs vary between identical requests. This is problematic for applications requiring reproducibility.

>**Exam Pattern:** The exam frequently presents scenarios where an LLM is being used for a task better suited to traditional ML (e.g., real-time fraud scoring, deterministic classification with strict latency SLAs). Always evaluate whether the task truly benefits from generative capabilities or whether a simpler, cheaper, faster model would suffice.

## 09. Inference Optimization

### Quantization, Distillation, and Speculative Decoding

LLM inference is expensive: generating tokens requires running the entire model for each token, and latency scales with model size. Several optimization techniques reduce cost and latency while preserving most of the model's quality.

**Quantization** reduces the precision of model weights from FP32/FP16 to INT8 or INT4. This shrinks model size by 2-4x, reduces memory bandwidth requirements, and enables faster inference on GPUs and TPUs. Modern quantization methods (GPTQ, AWQ, GGUF) can quantize to 4-bit with minimal quality loss. On Vertex AI, Google's serving infrastructure automatically applies optimized quantization.

**Knowledge distillation** trains a smaller "student" model to mimic the outputs of a larger "teacher" model. Rather than training the student on raw data, you train it on the teacher's soft probability distributions over tokens, which contain richer information than hard labels alone. The student captures much of the teacher's capability in a fraction of the parameters. Google's Gemini Flash is essentially a distilled version of Gemini Pro.

**Speculative decoding** uses a small, fast "draft" model to generate candidate tokens, which are then verified in parallel by the large model. The large model accepts tokens where it agrees with the draft model and rejects (and regenerates) where it disagrees. Since the draft model is much faster, and the large model can verify multiple tokens in a single forward pass, this achieves 2-3x speedup with no quality loss. The output is mathematically identical to the large model alone.

Q

#### Quantization

Reduce weight precision (FP16 to INT4). 2-4x memory reduction. Minimal quality loss with modern methods. Applied automatically on Vertex AI.

D

#### Distillation

Train small model to mimic large model. Significant size reduction. Requires training compute upfront. Examples: Gemini Flash, Gemma.

S

#### Speculative Decoding

Draft model + verification. 2-3x speedup. Zero quality loss. Requires a compatible small-large model pair.

## 10. Exam Focus: Fine-Tuning vs Prompt Engineering

One of the most frequently tested topics is knowing when to use prompt engineering versus fine-tuning. This decision tree will help you on exam day:

### Use Prompt Engineering When:

-   The base model **already knows** the domain (general knowledge, common tasks)
-   You need to **iterate quickly** without training infrastructure
-   You have **no training data** or very limited examples
-   The task can be solved with **few-shot examples** in the prompt

### Use Fine-Tuning When:

-   The model needs **domain-specific knowledge** not in pre-training data (medical, legal, proprietary)
-   You need **consistent output format** or style that prompting cannot reliably achieve
-   You have **hundreds+ labeled examples** of desired input-output pairs
-   Prompt engineering results are **not meeting quality targets** despite optimization
-   You want to **reduce token usage** (fine-tuned models need shorter prompts)

### Model Selection Decision Matrix

1

#### Maximum Quality

Choose **Gemini Pro**. Accepts highest cost and latency for best reasoning, long context, and multimodal capability.

2

#### Speed & Cost at Scale

Choose **Gemini Flash**. Best cost-performance ratio for production workloads. Still high quality for most tasks.

3

#### Self-Hosted / Private

Choose **Gemma**. Open weights, no API costs, full data control. Deploy on GKE, Cloud Run, or on-premises.

4

#### Simple Classification

Consider **traditional ML** (AutoML, BigQuery ML). Faster, cheaper, deterministic. No need for generative capabilities.

>**Exam Strategy:** The exam always rewards the **simplest effective solution**. Start with prompt engineering. If that fails, try fine-tuning. If you need full control, use open models. If the task does not require generation, skip LLMs entirely and use traditional ML. Cost-effectiveness and operational simplicity are valued over technical sophistication.

## 🎯. Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Large Language Models are transformer-based neural networks with billions of parameters, pre-trained on massive text corpora using next-token prediction. They acquire broad language understanding during pre-training, then get specialized through fine-tuning (full, LoRA, or prompt tuning) or in-context learning via prompt engineering. On GCP, Google offers the Gemini family (multimodal, up to 1M token context) and the open-weight Gemma models. The key engineering decisions are choosing between prompt engineering (cheapest, fastest iteration), parameter-efficient fine-tuning like LoRA (good quality-cost balance), and full fine-tuning (maximum control but highest cost), while managing inference costs through quantization and distillation.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| What is the difference between pre-training and fine-tuning an LLM? | Do you understand that pre-training learns general language on massive data, while fine-tuning adapts a pre-trained model to a specific task with smaller, targeted data? |
| When would you use LoRA instead of full fine-tuning? | Can you reason about the trade-off between training cost, number of trainable parameters, and model quality for production use cases? |
| How do you handle an LLM that hallucinates facts? | Do you know mitigation strategies: RAG for grounding, lower temperature, structured output, fine-tuning on verified data, and guardrails? |
| Explain the transformer attention mechanism at a high level. | Can you explain self-attention (queries, keys, values) and why it enables capturing long-range dependencies better than RNNs? |
| How do you reduce LLM inference cost in production? | Do you know quantization (FP16, INT8, INT4), distillation to smaller models, KV-cache optimization, batching, and when to use smaller task-specific models instead? |

### Model Answers

#### 1\. Pre-training vs Fine-tuning

Pre-training trains the model from scratch on terabytes of text using self-supervised next-token prediction. This is enormously expensive (millions of dollars, thousands of GPUs). The model learns grammar, facts, reasoning patterns, and world knowledge. Fine-tuning takes a pre-trained model and continues training on a smaller, task-specific dataset. It can adjust all parameters (full fine-tuning), a small set of added parameters (LoRA/adapters), or just the prompt embedding (prompt tuning). Fine-tuning is orders of magnitude cheaper and lets you specialize a general model for your domain without starting from scratch.

#### 2\. LoRA vs Full Fine-tuning

LoRA (Low-Rank Adaptation) freezes the original model weights and injects small trainable low-rank matrices into attention layers, typically training less than 1% of total parameters. Use LoRA when you have limited GPU memory, need to serve multiple task-specific adapters from a single base model, or want fast iteration. Use full fine-tuning when you have abundant compute, a large task-specific dataset, and need maximum quality. QLoRA adds 4-bit quantization of the base model, allowing fine-tuning of 70B models on a single GPU. On Vertex AI, supervised fine-tuning of Gemini uses adapter-based tuning by default.

#### 3\. Handling LLM Hallucinations

Hallucinations occur because LLMs generate plausible-sounding text based on statistical patterns, not factual verification. Mitigation strategies: (1) Retrieval-Augmented Generation (RAG) grounds responses in retrieved documents. (2) Lower temperature reduces randomness. (3) Instruct the model to cite sources and say "I don't know." (4) Fine-tune on domain-specific verified data. (5) Add post-generation fact-checking with a verification pipeline. (6) Use structured outputs (JSON schemas) to constrain generation. The exam favors RAG as the first-line solution for factual grounding.

#### 4\. Transformer Attention Mechanism

Self-attention lets every token in a sequence attend to every other token, computing relevance scores. Each token is projected into three vectors: Query (what am I looking for?), Key (what do I contain?), and Value (what information do I provide?). Attention scores are computed as softmax(QK^T / sqrt(d\_k)) \* V. Multi-head attention runs multiple attention computations in parallel, each head learning different relationship patterns (syntactic, semantic, positional). This mechanism is why transformers outperform RNNs: they capture long-range dependencies in O(1) sequential steps rather than O(n), though at O(n^2) memory cost per layer.

#### 5\. Reducing LLM Inference Cost

Start with model selection: use the smallest model that meets quality requirements. Apply quantization: FP32 to FP16 halves memory with minimal quality loss; INT8 and INT4 (GPTQ, AWQ) further reduce memory and speed up inference. Use KV-cache to avoid recomputing attention for previous tokens. Implement request batching to amortize GPU overhead. For high-volume, consider distillation: train a smaller student model to mimic the larger teacher. On GCP, use Vertex AI endpoints with autoscaling and GPU machine types matched to model size. If the task is narrow (classification, extraction), a fine-tuned smaller model often beats a general-purpose large model in both cost and latency.

### System Design Scenario

>**Design Challenge:** Your company has 50,000 internal technical documents and wants to build an AI assistant that answers employee questions accurately, citing specific documents. The assistant must handle 500 concurrent users, respond within 3 seconds, and never fabricate information about company policies. Design the system on GCP, choosing between fine-tuning a model on company data versus RAG, and explain your serving architecture including model selection, infrastructure, and cost controls.

### Common Mistakes

-   **Jumping to fine-tuning when prompt engineering suffices** — Fine-tuning is expensive and slow to iterate. Always start with prompt engineering and few-shot examples; only fine-tune when you have clear evidence that prompting cannot achieve required quality.
-   **Confusing context window size with model knowledge** — A larger context window lets you pass more text at inference time, but the model's parametric knowledge comes from pre-training data. RAG bridges this gap by injecting relevant external knowledge into the context at query time.
-   **Ignoring quantization trade-offs** — Quantizing to INT4 dramatically reduces memory and cost, but can degrade quality on reasoning-heavy tasks. Always benchmark quantized models on your specific use case before deploying to production.

Previous

[← 11 · Intro to Generative AI](11-intro-generative-ai.html)

Next

[13 · MLOps for GenAI →](13-mlops-generative-ai.html)