---
title: "How Modern AI Actually Works"
slug: "foundations-of-genai"
description: "A practitioner's mental model of how LLMs work — what transformers do, why tokenization affects your costs, how embeddings power search, and what controls your model's behavior. No math required."
section: "genai"
order: 1
badges:
  - "Transformer Architecture"
  - "Tokenization"
  - "Embeddings"
  - "Pre-training & RLHF"
  - "Inference Mechanics"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai/01-foundations-of-genai.ipynb"
---

## 01. The Transformer Architecture

![Diagram 1](/diagrams/genai/foundations-of-genai-1.svg)

Figure 1 — Transformer block: token embeddings pass through N stacked layers of Multi-Head Attention and Feed-Forward sublayers, each wrapped in residual + LayerNorm connections. The decoder adds a causal mask and cross-attention to the encoder output.

Before transformers existed, the dominant approach to processing text was the **Recurrent Neural Network (RNN)**. An RNN reads a sentence the way a person reads a ticker tape: one word at a time, left to right, carrying a "memory" state forward from each step. The problem with this approach is profound and practical. If you want to understand the word "bank" in a long document, you might need information from fifty words earlier — the word "river" or "deposit." An RNN has to keep that information alive through every intermediate step, and its memory degrades. Think of it like a game of telephone: by the time the message reaches the hundredth person, the original nuance is lost. RNNs also could not be parallelized across the sequence — every word had to wait for the previous word to finish, which made training on modern GPUs painfully slow.

In 2017, a team of eight researchers at Google Brain published a paper titled **"Attention Is All You Need"** that changed everything. The insight was deceptively simple: instead of reading text sequentially, what if every word could look at every other word simultaneously, and decide how much attention to pay to each one? You give up the sequential constraint entirely and gain two enormous advantages: the model can capture long-range dependencies directly (word 1 and word 100 can interact in a single step), and the entire sequence can be processed in parallel on GPU, making training dramatically faster.

The architecture they proposed — the Transformer — has an **encoder** and a **decoder**. The encoder reads the full input sequence and builds a rich, contextual representation of it. You can think of the encoder as a very thorough reader who annotates every word with deep notes about how it relates to every other word. The decoder then reads those annotations and generates an output sequence, one token at a time. Early Transformers used both halves: the encoder-decoder design is what powers machine translation models like Google Translate, where you read a full French sentence and produce an English one.

Modern large language models like GPT-4, Claude, and Llama are **decoder-only** transformers. They removed the encoder entirely and trained the decoder on the task of predicting the next word given all the previous ones. This sounds like a limitation, but it turns out to be extraordinarily powerful. By training on essentially all text on the internet and beyond, predicting the next word forces the model to build an internal representation of grammar, facts, reasoning, style, code, and everything else — because predicting the next word well requires understanding all of it.

The intuition behind the core mechanism — **attention** — is this: for every word in a sentence, you compute a score representing how relevant every other word is to understanding this particular word. Then you take a weighted combination of all the word representations, weighted by those relevance scores. The word "it" in "The animal didn't cross the street because it was too tired" now has a very high attention score connecting it back to "animal," not "street." The model has learned, from data alone, how to route meaning through a sentence to resolve ambiguity. This is something RNNs consistently failed at across long distances.

>**Historical Note:** The original "Attention Is All You Need" paper used 6 encoder layers and 6 decoder layers (65M parameters). GPT-3 scaled to 96 decoder layers with 175 billion parameters. The architecture is essentially the same — scale is what changed.

>**Think of it like this:** A transformer reading a sentence is like a room full of translators who can all hear each other simultaneously and pass notes about which words matter most. An RNN was like a single translator reading one word at a time, trying to remember what was said five minutes ago — by the end of a long document, the early details have faded.

### What This Means for Practitioners

**Context windows have hard limits.** Every transformer has a maximum sequence length — the context window. This is a fixed architectural constraint. If your input plus the model's output exceeds the context window, the request fails or gets truncated. This is why you cannot simply paste an entire codebase or a 500-page book into a prompt. Different models make different tradeoffs here: Claude 3.5 supports 200K tokens, GPT-4o supports 128K, while many open-source models top out at 8K-32K.

**Not all long-context models are equal.** A model might technically accept 128K tokens, but that does not mean it handles them well. Research consistently shows a "lost in the middle" problem — information in the middle of a very long context is recalled less reliably than information at the beginning or end. Models with architectural innovations (like sliding window attention in Mistral, or grouped-query attention in Llama 3) handle long contexts more efficiently but still have degradation patterns you should test for.

**Model responses are non-deterministic by default.** Because the model samples from a probability distribution at each token, the same prompt can produce different outputs each time. This is a feature, not a bug — but it matters for testing, debugging, and reproducibility. Set temperature to 0 when you need deterministic outputs (for testing, caching, or compliance).

**Encoder vs. decoder models serve different purposes.** This is one of the most practical architectural decisions you will make:

| Model Type | Architecture | Best For | Examples |
| --- | --- | --- | --- |
| Encoder-only | Bidirectional (sees full input) | Classification, NER, sentiment, search ranking | BERT, RoBERTa, DeBERTa |
| Decoder-only | Causal (sees only prior tokens) | Text generation, chat, code, reasoning | GPT-4, Claude, Llama 3 |
| Encoder-decoder | Full input + autoregressive output | Translation, summarization, structured extraction | T5, BART, Flan-T5 |

When you need to classify support tickets, detect entities in text, or rank search results, an encoder model like BERT is often faster, cheaper, and more accurate than prompting a large decoder model. When you need open-ended generation, reasoning, or multi-turn conversation, decoder-only models are the right choice.

>**Key Takeaway:** The transformer's power comes from three things working together: global attention (every token sees every other), residual connections (allows depth), and massive parallelism (all positions computed simultaneously on GPU). As a practitioner, the key implication is that context window size, model architecture type, and non-determinism all directly affect how you design your applications.

## 02. Tokenization

![Diagram 2](/diagrams/genai/foundations-of-genai-2.svg)

Figure 2 — "Hello, world!" tokenizes into 4 tokens with GPT-2's BPE vocabulary. Note that " world" includes the leading space as part of the token.

Neural networks are mathematical functions that operate on numbers. They cannot read the letter "A" or the word "transformer" directly. So the very first step in working with any language model is converting text into a sequence of integers. This conversion process is called **tokenization**, and understanding it well is critical because it affects cost, latency, model behavior, and fairness in ways that are not obvious at first glance.

The intuitive approach would be to split text into words. But this runs into problems immediately: what do you do with punctuation? With contractions like "don't"? With code like `df.groupby("col")`? With URLs? With emojis? With misspellings? If your vocabulary is every English word, your vocabulary table has hundreds of thousands of entries and you still cannot handle rare words, proper nouns, or any other language. Modern tokenizers solve this with **subword tokenization**: break text into pieces that are larger than individual characters but smaller than full words.

The most widely used algorithm is **Byte Pair Encoding (BPE)**, originally designed for data compression. The algorithm starts with a vocabulary of all individual bytes (or characters), then repeatedly finds the most frequent adjacent pair in the training corpus and merges them into a single new token. After enough merges, common words like "the" and "and" become single tokens, while rare words like "photosynthesis" might be split into "photo", "synth", "esis." The number of merges determines the final vocabulary size. GPT-2 uses 50,257 tokens; Llama 3 uses 128,256. A larger vocabulary means fewer tokens per text (more efficient) but a larger embedding table.

Tokens are decidedly **not words**. This is one of the most important intuitions to internalize. "tokenization" might be tokenized as \["token", "ization"\] — two tokens. The word "unfortunately" in GPT-4's tokenizer is a single token, while "a" is also a single token. Emojis often require 2-4 tokens each. Code is particularly expensive: a Python function with many special characters and indentation can use far more tokens than the equivalent English description of what it does. An important practical consequence: you pay OpenAI per token, so counting tokens before sending a prompt is not just academic.

Language fairness is a real issue with tokenization. English is dramatically more token-efficient than most other languages. Mandarin Chinese, Arabic, and low-resource languages often require 2-5x as many tokens to express the same content as English. This means: (1) prompts in those languages cost more, (2) those languages have less room in the context window, and (3) models have seen far less training data in those languages, compounding disadvantages. This is an active area of research — recent models like Llama 3 improved multilingual tokenization significantly compared to earlier generations.

>**Practical Warning:** When you call OpenAI's API and hit a context length limit, the error is about *tokens*, not characters or words. Always count tokens using the appropriate library (tiktoken for OpenAI, transformers tokenizer for open models) before assuming your input will fit. A rough rule of thumb: 1 token ≈ 4 characters in English, or about 0.75 words.

>**Think of it like this:** Tokenization is like breaking a recipe into individual ingredients before cooking. The model doesn't see words — it sees pieces. The word "unhappiness" might become three ingredients: "un", "happi", and "ness." Each ingredient costs money to process, and some languages need far more ingredients to say the same thing.

### What This Means for Practitioners: Tokenization

**One token is not one word — and this affects your budget.** The rule of thumb is 1 token is roughly 4 characters in English, or about 0.75 words. But this varies dramatically by content type. A 1,000-word English blog post might be 1,300 tokens, while 1,000 words of Python code could be 2,500 tokens. Always run your actual content through the tokenizer (tiktoken for OpenAI, the model's tokenizer for open-source models) to get accurate counts before estimating costs or context window usage.

**Non-English languages cost more.** Because tokenizers are trained primarily on English text, other languages are tokenized less efficiently — the same meaning requires more tokens. This has direct financial and capability implications for multilingual applications. Arabic and CJK languages are particularly affected, often requiring 2-4x the tokens of equivalent English text.

**Code is token-expensive.** Special characters, indentation, variable names, and syntax all consume tokens. A Python function might use 3x more tokens than a plain-English description of what it does. This matters when you are sending code for review, generation, or analysis — you are burning through your context window and your budget faster than you might expect.

**How to estimate token counts in practice:**

| Content Type | Tokens per 1,000 Words | Cost Implication |
| --- | --- | --- |
| English prose | ~1,300 tokens | Baseline cost |
| Technical documentation | ~1,500 tokens | ~15% more than prose |
| Python / JavaScript code | ~2,000-2,500 tokens | ~2x prose cost |
| JSON / XML data | ~2,500-3,500 tokens | ~2-3x prose cost |
| Non-English (CJK, Arabic) | ~2,500-5,000 tokens | ~2-4x English cost |
| Emojis / special characters | ~3,000-4,000 tokens | ~3x prose cost |

**Always count before you send.** Use `tiktoken` for OpenAI models and the Hugging Face `transformers` tokenizer for open-source models. Most frameworks also provide a `count_tokens` utility. Building a token-counting step into your pipeline before API calls prevents surprise failures and unexpected bills.

## 03. Embeddings

Once text has been tokenized into a sequence of integer IDs, the model needs to convert those integers into something it can compute with. Each integer ID indexes into a large lookup table — the **embedding matrix** — to retrieve a high-dimensional vector. For GPT-3, these vectors have 12,288 numbers each. For smaller models like GPT-2, it is 768 numbers. These vectors are the model's internal language — every token, every concept, every word gets translated into a point in this high-dimensional space.

The remarkable thing about embedding spaces learned during training is that they develop a geometry of meaning. Words with similar meanings cluster together. "cat" and "dog" are closer to each other than either is to "automobile." Even more striking, **directions in the space carry semantic meaning**. The classic demonstration: take the vector for "king", subtract the vector for "man", and add the vector for "woman." The resulting point in space is extremely close to the vector for "queen." This happens not because anyone programmed it, but because the model learned to represent the structure of meaning implicitly while training on billions of examples.

This geometric property of embeddings is why **Retrieval-Augmented Generation (RAG)** works, which you will build extensively later in this course. When you want to find which documents in a database are relevant to a user's query, you convert both the query and each document into embedding vectors, then find the documents whose vectors are closest to the query vector. "Closest" is measured using cosine similarity (the angle between vectors), which captures semantic relatedness regardless of the exact words used. A query about "ML model deployment" will match a document about "serving machine learning systems in production" even if none of those exact words overlap.

It is important to distinguish between two types of embeddings you will encounter. **Token embeddings** inside the transformer are context-dependent: the word "bank" has a different vector when preceded by "river" versus "investment." This is one of the transformer's key achievements over earlier methods. **Sentence or document embeddings**, which are what you produce when you call the OpenAI embeddings API, are context-free in a different sense — you put in a whole sentence or paragraph, and get back a single vector that represents the entire text. This is produced by running the text through a model and then pooling the resulting token representations (often by averaging them, or taking the special CLS token).

For practical use in this course, embeddings are primarily a tool for **semantic search and similarity**. You will embed user queries and document chunks, store those vectors in a vector database (like Pinecone, Weaviate, or pgvector), and retrieve the most relevant chunks at query time. Understanding how embeddings work under the hood helps you make better decisions about which embedding model to choose, how to chunk your documents, and how to interpret similarity scores.

>**Dimensionality Intuition:** Why 1536 dimensions and not 10? In high-dimensional spaces, you can encode an enormous number of independent "directions" (concepts). With 1536 dimensions, the embedding space can simultaneously encode syntax, semantics, sentiment, topic, language, register, and hundreds of other properties without them interfering with each other. Low-dimensional spaces get "crowded" quickly.

>**Think of it like this:** Embeddings are like GPS coordinates for meaning. Just as two restaurants near each other on a map are physically close, two words with similar embeddings are semantically close. "King" and "queen" are neighbors; "king" and "refrigerator" are continents apart.

### What This Means for Practitioners: Embeddings

**Embeddings turn text into numbers you can compare.** At its simplest, an embedding converts a chunk of text into a list of numbers (a vector). Two texts about similar topics produce vectors that point in similar directions. Two texts about unrelated topics produce vectors that point in different directions. The "cosine similarity" score between two vectors tells you how related they are — a score near 1.0 means very similar, near 0 means unrelated.

**When you need embeddings:**

- **Semantic search / RAG** — Finding relevant documents for a user's query, even when the exact words differ.
- **Clustering** — Grouping support tickets, customer feedback, or documents by topic without predefined categories.
- **Classification** — Using embeddings as features for a lightweight classifier (often faster and cheaper than prompting an LLM for each item).
- **Deduplication** — Finding near-duplicate content in a dataset by comparing embedding similarity.
- **Recommendation** — "Users who liked this document might also like..." based on embedding proximity.

**Choosing an embedding model matters.** Higher dimensions generally mean better quality but more storage and slower search. Smaller models are faster and cheaper but may miss nuanced distinctions. Here is a practical comparison:

| Use Case | Embedding Model | Dimensions | Notes |
| --- | --- | --- | --- |
| General-purpose (OpenAI) | text-embedding-3-small | 1,536 | Best cost/quality ratio for most use cases |
| High-precision (OpenAI) | text-embedding-3-large | 3,072 | Better for fine-grained distinctions; supports MRL truncation |
| Open-source, fast | all-MiniLM-L6-v2 | 384 | Good for prototyping; runs locally; fast inference |
| Open-source, high quality | BGE-large-en-v1.5 | 1,024 | Strong MTEB benchmark scores; self-hostable |
| Code-specific | Voyage Code 2 | 1,536 | Optimized for code search and retrieval |
| Multilingual | multilingual-e5-large | 1,024 | Best for non-English or mixed-language corpora |

**Cosine similarity in practice.** You do not need the formula — just the intuition. When you get a similarity score back from your vector database, interpret it like this: 0.9+ means the texts are about the same thing (near-paraphrase), 0.7-0.9 means they are related, 0.5-0.7 means loosely related, and below 0.5 usually means unrelated. These thresholds vary by model, so always calibrate with your own data. A common mistake is setting a fixed similarity threshold without testing it on representative queries.

**Practical tip: chunk size matters more than embedding model.** When building a RAG pipeline, how you split your documents into chunks has a bigger impact on retrieval quality than which embedding model you choose. Chunks that are too small lose context; chunks that are too large dilute the signal. A good starting point is 200-500 tokens per chunk with 50-100 tokens of overlap.

## 04. Pre-training, Instruction Tuning & RLHF

Training a modern large language model happens in distinct stages, each serving a different purpose. Understanding these stages helps you understand why models behave the way they do — why ChatGPT is helpful and conversational rather than producing raw statistical text, why Claude refuses certain requests, and why fine-tuned models specialize in particular domains. These are not accidents; they are the result of carefully designed training pipelines applied on top of each other.

The first stage, **pre-training**, is the foundation. A raw transformer model with randomly initialized weights is trained on an enormous corpus of text — web pages, books, scientific papers, code repositories, Wikipedia, and more. The training objective is simple: given the previous tokens in a sequence, predict the next token. This sounds almost trivially simple, but at scale it turns out to be an extraordinarily demanding task. To predict the next word reliably across billions of different sentences, the model must implicitly learn grammar, facts about the world, how arguments are structured, how code behaves, social conventions, scientific relationships, and much more. None of this is explicitly taught — it all emerges from the pressure of predicting the next token on enough diverse text.

Pre-training is outrageously expensive. Training GPT-3 (175B parameters) reportedly cost over $4 million in compute. Training GPT-4 is estimated at $60-100 million. These runs require clusters of thousands of specialized AI accelerator chips running for months. The output of pre-training is a "base model" or "foundation model" — an extraordinarily knowledgeable but somewhat feral entity that will complete whatever you give it (often in unexpected directions) rather than helpfully answer questions.

The second stage is **instruction tuning** (also called Supervised Fine-Tuning or SFT). Here you take the base model and continue training it on a carefully curated dataset of (instruction, ideal response) pairs. After instruction tuning, the model has learned to behave like an assistant rather than a document completer. It will answer "What is the capital of France?" with "Paris" rather than completing the question as if it were the start of a trivia quiz. The transformation is dramatic and requires far less compute than pre-training — thousands of high-quality examples rather than trillions of tokens.

The third stage is **RLHF (Reinforcement Learning from Human Feedback)**, which is what made ChatGPT feel dramatically more helpful and safe than earlier GPT-3 variants. Human raters compare pairs of model responses and indicate which one is better. These preferences are used to train a separate **reward model** that can predict human preference scores. Then the main language model is fine-tuned using reinforcement learning (specifically, Proximal Policy Optimization or PPO) to maximize the reward model's score. The result is a model that has been shaped to produce responses humans prefer — more helpful, less likely to produce harmful content, better at following instructions precisely. The combination of all three stages is what gives you Claude, ChatGPT, or Gemini.

>**Chinchilla Scaling Laws:** Research by DeepMind in 2022 showed that most large models at the time were significantly undertrained. The optimal compute budget splits roughly equally between parameters and training tokens, with the rule of thumb being approximately 20 tokens of training data per model parameter. A model with 8 billion parameters should ideally be trained on around 160 billion tokens for optimal efficiency — but Llama 3 8B was trained on 15 trillion tokens, intentionally over-training to produce a smaller model that performs better at inference time.

>**Think of it like this:** Pre-training is like a medical student reading every textbook in the library — they absorb enormous knowledge but have no bedside manner. Instruction tuning is residency — learning to follow procedures and answer questions properly. RLHF is patient feedback — learning which responses actually help people and which ones cause harm.

### What This Means for Practitioners: Training Stages

**Base models, instruction-tuned models, and chat models behave very differently.** The stage of training determines what a model is good at and how you should interact with it. This is one of the most important model selection decisions you will make:

| Model Stage | What It Does | When to Use | Example |
| --- | --- | --- | --- |
| Base model | Completes text based on patterns | Fine-tuning for custom tasks; few-shot prompting where you control the format entirely | Llama 3 8B (base), GPT-3 davinci |
| Instruction-tuned (SFT) | Follows instructions; answers questions | Single-turn tasks, structured extraction, classification | Llama 3 8B-Instruct, Flan-T5 |
| Chat model (SFT + RLHF) | Multi-turn conversation; helpful and safe | User-facing chat, agentic workflows, complex reasoning | Claude 3.5, GPT-4o, Gemini 1.5 |
| Domain fine-tuned | Specialized for a specific domain or task | When general models underperform on your specific use case | CodeLlama, BioMistral, SQLCoder |

**RLHF is why models are helpful — and also why they refuse things.** The same training that makes a model politely answer questions also teaches it to refuse requests that human raters flagged as harmful. This "alignment" creates a capability-safety tradeoff. A highly aligned model is safer for user-facing applications but may be overly cautious for legitimate use cases (like security research or medical information). Understanding this helps you choose the right model and system prompt for your application.

**Alignment is not permanent.** Jailbreaks and prompt injection attacks work because alignment is a learned behavior, not a hard constraint. RLHF adjusts the model's probabilities but does not remove capabilities. This has important security implications for any application you build — never rely on alignment alone for safety-critical decisions.

**When to fine-tune vs. prompt vs. use as-is:**

- **Use as-is** when the model performs well enough with clear instructions and examples. This is the cheapest and fastest option. Start here.
- **Prompt engineering** (system prompts, few-shot examples, structured output formatting) when the model has the right knowledge but needs guidance on format or style. This covers most production use cases.
- **Fine-tune** when you need consistent behavior on a narrow task, the model lacks domain-specific knowledge, or you need to reduce per-request costs by replacing complex prompts with learned behavior. Fine-tuning on a few hundred high-quality examples often outperforms elaborate prompting.
- **Pre-train from scratch** — almost never. Unless you are a well-funded AI lab, this is not a realistic option. Use an existing foundation model and customize from there.

## 05. Inference Mechanics

**Inference** is the process of using a trained model to generate text — what happens every time you send a message to ChatGPT or call an LLM API. Unlike training, no learning occurs during inference: the weights are frozen, and you are simply running the mathematical computation forward through the network. But inference has its own surprising complexity, and understanding how it works helps you make better decisions about temperature, sampling parameters, context windows, and cost.

Modern LLMs generate text **autoregressively**: one token at a time, feeding each generated token back as input for the next step. When you send "Tell me a joke," the model does not see the full answer immediately. It generates the first token ("Why"), then feeds "Tell me a joke Why" back in to generate the second token ("did"), then "Tell me a joke Why did" to generate "the", and so on, until it generates a special end-of-sequence token or hits the maximum length limit. Each step is an independent forward pass through all the model's layers. For a 70B parameter model, this is a substantial computation — typically 30-80 tokens per second on an NVIDIA A100 GPU.

**Temperature** controls how random or deterministic the model's choices are. At the end of each forward pass, the model produces a probability distribution over all ~100,000 vocabulary tokens. With temperature=0 (or "greedy decoding"), you always pick the single most likely next token. This is fully deterministic — the same prompt always produces the same output. As temperature increases, the distribution is spread out (lower-confidence tokens get relatively more probability), producing more varied and surprising outputs. Temperature=1 is the "natural" distribution the model learned. Temperature=2 makes choices very random and usually incoherent. For creative tasks, 0.7-1.0 works well; for factual Q&A or code, 0-0.3 is safer.

The **context window** is the maximum number of tokens the model can consider at once, including both your input and the generated output. GPT-4 originally had 8,192 tokens; modern models have 128K (Claude 3) or even 1M (Gemini 1.5). This matters enormously in practice. If you want to chat with a model about a 500-page book, you cannot simply paste the whole book in — it would exceed the context window. This is one of the key motivations for RAG: instead of stuffing everything into the context, you retrieve only the relevant chunks.

A common misconception is that longer context windows solve all retrieval problems. Research has consistently shown the **"lost in the middle" problem**: models perform much better at recalling information from the beginning and end of a long context than from the middle. Even with a 128K context window, information buried in position 64K may be effectively ignored. This is why structured retrieval (RAG) often outperforms naive context stuffing even when the context window is theoretically large enough to hold all the information.

>**Cost Awareness:** Inference is priced per token (input tokens + output tokens, often at different rates). A 128K input token prompt to GPT-4o at $5/1M input tokens costs $0.64 just for the prompt. Output tokens are typically 3-4x more expensive per token than input tokens. At scale, the choice of temperature (which affects output length indirectly), the context window size, and the model size dominate your costs.

>**Think of it like this:** Inference is like a chef preparing your order. Temperature is how creative they get — low temperature follows the recipe exactly, high temperature improvises. The context window is the size of their cutting board — too many ingredients and things fall off the edge, which is why RAG hands them only what they need.

### What This Means for Practitioners: Inference

**Temperature, top_p, and top_k control the creativity-accuracy tradeoff.** These are the parameters you will tune most often. Here is what each one actually does:

| Parameter | Low Setting | High Setting | Use When |
| --- | --- | --- | --- |
| temperature (0-2) | Deterministic, focused, repetitive (0-0.3) | Creative, varied, sometimes incoherent (0.8-1.5) | Low for factual Q&A, code, extraction. High for brainstorming, creative writing. |
| top_p (0-1) | Only considers the most probable tokens (0.1-0.5) | Considers a wide range of tokens (0.9-1.0) | Low for constrained outputs. 0.9-0.95 is a good default for most tasks. |
| top_k (1-100+) | Only top few tokens considered (1-10) | Many tokens in the running (50-100) | Low for very constrained generation. Not available in all APIs. |
| max_tokens | Short responses | Long responses | Always set this to prevent runaway generation and control costs. |
| frequency_penalty (0-2) | Model can repeat itself freely (0) | Strongly discourages repetition (1-2) | Increase if you see repetitive loops in output. |

**A practical starting point:** For most production applications, use `temperature=0.1, top_p=0.95, max_tokens=<your expected max>`. Adjust temperature up for creative tasks, down to 0 for deterministic extraction or testing.

**Streaming matters for user experience.** When a model generates 500 tokens, the user could wait 5-10 seconds to see anything (non-streaming) or see the first word appear in under a second (streaming). The metric that matters is **time to first token (TTFT)** — how quickly the user sees the response start. For user-facing applications, always stream. For batch processing or background tasks, non-streaming is simpler to implement and debug.

**Input + output must fit the context window.** This is a common source of production bugs. If your system prompt is 2,000 tokens, your retrieved context is 10,000 tokens, and the user's message is 500 tokens, you have used 12,500 tokens of input. If your model's context window is 16K and you set max_tokens to 4,000, you are fine. But if the retrieved context grows to 15,000 tokens, you will hit the limit. Build your pipeline to measure and enforce token budgets.

**The KV cache explains why the first token is slow but the rest are fast.** During generation, the model caches intermediate computations (the Key and Value matrices from attention) for all previous tokens. The first token requires processing your entire input — this is the "prefill" step and is the slowest part. Each subsequent token only needs to process the single new token and look up the cached values. This is why TTFT scales with input length, but tokens-per-second after that is relatively constant. For long inputs, expect a noticeable delay before the first token appears.

**Cost optimization checklist:**

- **Choose the smallest model that meets your quality bar.** GPT-4o-mini or Claude 3.5 Haiku are 10-20x cheaper than their larger siblings and sufficient for many tasks.
- **Set max_tokens explicitly.** Never let a model generate unlimited output — you pay for every token.
- **Cache common prefixes.** If many requests share the same system prompt, use prompt caching (available in Claude and OpenAI APIs) to avoid paying for the same input tokens repeatedly.
- **Use shorter system prompts.** Every token in your system prompt is paid for on every request. A 2,000-token system prompt at 1,000 requests/day adds up.
- **Batch where possible.** Many APIs offer batch processing at 50% discount for non-latency-sensitive workloads.

## Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** Modern generative AI is built on the **Transformer architecture**, introduced in the 2017 "Attention Is All You Need" paper. At its core, a Transformer converts raw text into numerical **tokens**, maps those tokens to high-dimensional **embeddings**, then passes them through a stack of layers where **self-attention** lets every token weigh how relevant every other token is. This is fundamentally different from older recurrent models because attention operates in parallel over the full sequence — making training massively scalable on GPUs. The model is first **pre-trained** on vast internet text using next-token prediction (a self-supervised objective), then **fine-tuned** with human feedback (RLHF) to follow instructions and be safe. At **inference** time, it generates text autoregressively — one token at a time — with parameters like temperature and top-p controlling the creativity-vs-accuracy tradeoff. Understanding this pipeline — tokenization, embeddings, attention, training, and inference — is essential for making informed decisions about prompt design, model selection, cost optimization, and debugging unexpected outputs.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| When would you choose a BERT-style model over GPT for a production task? | Do you understand encoder vs. decoder tradeoffs and can you pick the right tool? |
| Your API costs doubled last month. How would you diagnose and fix it? | Can you reason about tokenization, context windows, model selection, and caching? |
| How does tokenization affect your application's behavior across languages? | Do you understand BPE efficiency differences and their impact on cost, context, and quality? |
| Explain the difference between a base model, an instruction-tuned model, and a chat model. | Do you understand the training pipeline and why each stage matters for model selection? |
| A user reports that the model gives different answers to the same question. What is happening and how do you fix it? | Do you understand temperature, sampling, and determinism in production systems? |

### Model Answers

>**Q1 — Encoder vs. Decoder in Practice:** BERT-style encoder models see the full input bidirectionally, making them excellent at classification, NER, sentiment analysis, and search ranking. They are typically much smaller (110M-340M parameters), faster to run, and cheaper to host than large decoder models. If your task is "categorize this support ticket" or "extract the customer's name from this email," an encoder model is often the right choice. Decoder models like GPT-4 or Claude are necessary when you need open-ended generation, multi-turn reasoning, or complex instruction following. The key decision criteria: if the task has a fixed set of outputs, consider an encoder model; if it requires generating novel text, use a decoder model.
>**Q2 — Diagnosing API Cost Increases:** I would start by checking three things: (1) Token counts per request — are prompts getting longer due to growing system prompts, more retrieved context in RAG, or longer user inputs? (2) Model selection — did someone switch from a smaller model to a larger one without updating the budget? (3) Output length — are max_tokens settings too generous, causing the model to generate unnecessarily long responses? The fixes include implementing prompt caching for shared system prompts, setting stricter max_tokens limits, optimizing RAG chunk sizes to retrieve less but more relevant context, and potentially using a smaller model for simpler tasks while reserving the expensive model for complex ones.
>**Q3 — Tokenization and Multilingual Impact:** Tokenizers are trained primarily on English text, so English gets the most efficient encoding — roughly 1 token per 4 characters. Other languages, especially CJK languages, Arabic, and low-resource languages, require 2-5x more tokens for the same meaning. This has three practical consequences: those languages cost more per API call, they consume more of the context window (leaving less room for actual content), and they effectively get less model "attention" per unit of meaning. When building multilingual applications, I always test token counts across all target languages and adjust context budgets accordingly. Some newer models like Llama 3 have improved multilingual tokenization, but the disparity still exists.
>**Q4 — Base vs. Instruction-Tuned vs. Chat Models:** A **base model** is trained only on next-token prediction — it is a powerful text completer but will not follow instructions naturally. An **instruction-tuned model** has been further trained on (prompt, response) pairs so it understands how to follow instructions and answer questions. A **chat model** adds RLHF on top, which teaches it to be helpful, safe, and conversational across multiple turns. In practice: use base models only if you are fine-tuning for a specialized task; use instruction-tuned models for single-turn structured tasks; use chat models for user-facing applications. The training pipeline is additive — each stage builds on the previous one and costs orders of magnitude less than the stage before it.
>**Q5 — Non-Deterministic Model Outputs:** LLMs generate text by sampling from a probability distribution at each token. With temperature > 0, different tokens can be selected on each run, producing different outputs for the same input. To fix this: set temperature=0 for deterministic outputs, which uses greedy decoding (always picks the most likely token). Note that even at temperature=0, some API providers may introduce variation from infrastructure-level changes. For applications requiring strict reproducibility, also set a seed parameter if the API supports it, and implement output caching so identical requests return cached results.

### System Design Scenario

>**Design Challenge:** **Scenario:** Your team needs to build a real-time customer support chatbot that handles 500 concurrent users with responses under 2 seconds. The product supports 5 languages. Design the inference infrastructure.
>
> **A strong answer covers:** (1) Model selection — choosing a model size that fits GPU memory while maintaining quality, likely a 7-13B parameter model or a fast API tier like GPT-4o-mini or Claude 3.5 Haiku. (2) Tokenization awareness — non-English languages consume more tokens per message, so context window budgets differ by language. (3) Streaming — essential for perceived latency; time-to-first-token matters more than total generation time for user experience. (4) Context management — implementing a sliding window over conversation history rather than sending the full chat history every turn. (5) Temperature settings — low temperature (0.1-0.3) for factual support answers. (6) Cost controls — setting max_tokens per response, caching common system prompts, and using a smaller model for simple FAQ-type queries with routing to a larger model for complex issues.

### Common Mistakes

- **Confusing parameters with tokens** — A 7B-parameter model does not have 7 billion tokens. Parameters are learned weights; tokens are input/output units. Model size (parameters) determines capability and memory footprint; token count determines training data volume and context length.
- **Not counting tokens before sending requests** — A "short" prompt in English might be 50 tokens but 150 tokens in Korean due to tokenizer efficiency differences. Always run text through the actual tokenizer (e.g., `tiktoken`) to get accurate token counts before estimating API costs or context window usage.
- **Ignoring the cost of context window stuffing** — Sending 100K tokens of context "just in case" when 5K of well-retrieved context would produce better results. RAG with good retrieval almost always beats long-context stuffing on both quality and cost.
- **Using high temperature for factual tasks** — Temperature above 0.3 for extraction, classification, or factual Q&A introduces unnecessary variation and errors. Save high temperature for creative and brainstorming tasks.
- **Relying on alignment for security** — RLHF makes models safer but does not create hard security boundaries. Never use model refusals as your only safety layer — validate outputs, implement guardrails, and assume adversarial inputs.

Previous Module

[00 · Prerequisites](00-prerequisites.html)

Next Module

[02 · LLMs, SLMs & Multimodal](02-llms-slms-multimodal.html)

Models & Capabilities
