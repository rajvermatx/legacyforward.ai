---
title: "Fundamentals of Generative AI"
slug: "fundamentals-gen-ai"
description: "Master the foundational concepts of artificial intelligence, machine learning, and generative AI.
    This section covers AI/ML core concepts, foundation models, LLMs, diffusion models, the ML lifecycle,
    choosing models, data types and quality, and Google's foundation model family including Gemi"
section: "gcp-gal"
order: 1
badges:
  - "AI, ML & NLP Concepts"
  - "Foundation Models & LLMs"
  - "ML Lifecycle"
  - "Data Types & Quality"
  - "Google Models (Gemini, Gemma, Imagen, Veo)"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-gal/01-fundamentals-gen-ai.ipynb"
---

## 01. Core AI & ML Concepts

**Artificial Intelligence (AI)** is the broad field of computer science focused on creating systems that can perform tasks that typically require human intelligence. This encompasses reasoning, learning, perception, language understanding, and decision-making. AI systems range from simple rule-based engines to sophisticated deep learning models.

**Machine Learning (ML)** is a subset of AI where systems learn patterns from data rather than being explicitly programmed. Instead of writing rules, you provide examples and the algorithm discovers the rules. ML powers recommendations, fraud detection, language translation, and thousands of other applications.

**Deep Learning (DL)** is a subset of ML that uses neural networks with multiple layers (hence "deep") to learn hierarchical representations of data. Deep learning excels at unstructured data — images, text, audio, and video — and is the foundation for modern generative AI.

### AI vs ML vs Deep Learning

| Concept | Definition | Example |
| --- | --- | --- |
| AI | Machines performing tasks requiring human-like intelligence | Chess-playing programs, virtual assistants |
| ML | Systems that learn patterns from data without explicit programming | Spam filters, recommendation engines |
| Deep Learning | Neural networks with many layers learning hierarchical features | Image recognition, speech-to-text |
| Generative AI | AI that creates new content (text, images, audio, video, code) | Gemini, Imagen, ChatGPT |

>**Exam Tip:** The exam tests your understanding of the nested relationship: **AI ⊃ ML ⊃ Deep Learning ⊃ Generative AI**. Generative AI is a specialized application of deep learning, which itself is a subset of ML, which is a subset of AI.

### NLP Fundamentals

**Natural Language Processing (NLP)** is the branch of AI focused on enabling computers to understand, interpret, and generate human language. Key NLP tasks include:

📝

#### Text Classification

Categorizing text into predefined labels. Examples: sentiment analysis, spam detection, topic classification.

🔍

#### Named Entity Recognition

Identifying entities (people, places, organizations, dates) within text. Foundation for information extraction.

🌐

#### Machine Translation

Translating text between languages. Modern approaches use sequence-to-sequence models with attention mechanisms.

💬

#### Text Generation

Creating new text that is coherent and contextually appropriate. The core task of large language models like Gemini.

## 02. What Is Generative AI

**Generative AI** refers to artificial intelligence systems that can create new content — text, images, audio, video, code, and structured data — rather than merely classifying or analyzing existing data. These models learn the underlying distribution of their training data and generate novel outputs that are statistically similar to, but not copies of, the training examples.

Generative AI represents a paradigm shift from traditional ML. Where traditional systems consume data and produce decisions (classify this email, predict this price), generative systems produce entirely new artifacts. A generative AI model can write a marketing email, generate a product image, compose music, or write working code.

### Generative vs Discriminative Models

This is a fundamental distinction tested on the exam. A **discriminative model** learns the decision boundary between classes — it models P(Y|X), the probability of a label Y given input X. A **generative model** learns the full joint distribution P(X,Y) or P(X), enabling it to generate new data points.

| Aspect | Discriminative | Generative |
| --- | --- | --- |
| Goal | Classify / predict labels | Generate new content |
| Models | P(Y|X) — conditional | P(X) or P(X,Y) — joint |
| Output | Label, score, category | Text, image, audio, video, code |
| Examples | Logistic regression, SVM, random forest | LLMs (Gemini), GANs, diffusion models |

>**Key Concept:** Many modern AI systems combine both approaches. For example, Gemini is primarily generative but can perform discriminative tasks (classification, sentiment analysis) through prompting. The exam may test whether you understand that generative models can also classify.

**Use cases for generative AI** span every industry: content creation (marketing copy, articles), code generation and debugging, customer service automation, document summarization, data augmentation, drug discovery, creative design, and educational tutoring. The exam expects you to identify which scenarios are best suited for generative AI versus traditional ML approaches.

## 03. Foundation Models & LLMs

A **foundation model** is a large AI model pre-trained on broad, diverse data that can be adapted to a wide range of downstream tasks. The term was coined by Stanford's HAI in 2021 to describe models like BERT, GPT, and PaLM that serve as a "foundation" upon which many applications are built.

Foundation models exhibit **emergent capabilities** — abilities that appear only at sufficient scale that were not explicitly trained for. For example, large language models can perform arithmetic, translate between languages they were not specifically trained on, and reason about novel problems. These emergent properties make foundation models uniquely powerful.

### Key Characteristics of Foundation Models

📚

#### Pre-trained on Massive Data

Trained on terabytes of text, images, or multimodal data. This broad training gives them general knowledge and capabilities.

🔧

#### Adaptable (Fine-tunable)

Can be customized for specific tasks through fine-tuning, prompt engineering, or RAG without retraining from scratch.

🎯

#### Multi-task Capable

A single model handles translation, summarization, Q&A, classification, and code generation without separate training.

🚀

#### Emergent Abilities

At large scale, capabilities emerge that were never explicitly trained: in-context learning, chain-of-thought reasoning, tool use.

### The Transformer Architecture

The **Transformer** is the neural network architecture behind virtually all modern LLMs. Introduced in the 2017 paper "Attention Is All You Need" by Vaswani et al., it replaced recurrent architectures (RNNs, LSTMs) with a **self-attention mechanism** that processes all tokens in parallel rather than sequentially.

Key components of the Transformer:

-   **Self-Attention** — allows each token to attend to every other token, capturing long-range dependencies
-   **Multi-Head Attention** — runs multiple attention operations in parallel to capture different relationship types
-   **Positional Encoding** — injects position information since attention is order-agnostic
-   **Feed-Forward Networks** — applied to each position independently after attention
-   **Layer Normalization** — stabilizes training of deep networks

>**Exam Tip:** You do not need to know the math behind transformers for this exam. Focus on understanding that: (1) transformers use self-attention to process all tokens in parallel, (2) this enables them to capture long-range dependencies, and (3) they are the architecture behind Gemini and all major LLMs.

**Large Language Models (LLMs)** are transformer-based foundation models trained specifically on text data. They predict the next token given a sequence of preceding tokens (autoregressive generation). Modern LLMs have billions to trillions of parameters and are trained on datasets containing trillions of tokens from books, websites, code repositories, and other text sources.

### Diffusion Models

**Diffusion models** are a class of generative models that create data by learning to reverse a noise-adding process. During training, the model learns to progressively denoise a corrupted input. During generation, it starts from pure random noise and iteratively refines it into a coherent output.

Diffusion models power image generation (Imagen), video generation (Veo), and audio synthesis. They produce higher-quality, more diverse outputs than earlier approaches like GANs (Generative Adversarial Networks) and VAEs (Variational Autoencoders), and are more stable to train.

| Model Type | How It Works | Strengths | Google Example |
| --- | --- | --- | --- |
| LLM (Transformer) | Autoregressive next-token prediction | Text, code, reasoning, multimodal | Gemini, Gemma |
| Diffusion Model | Iterative denoising from noise | Photorealistic images, video | Imagen, Veo |
| GAN | Generator vs discriminator adversarial training | Fast generation, style transfer | StyleGAN (historical) |
| VAE | Encode to latent space, decode to output | Smooth interpolation, latent control | Used in Imagen pipeline |

## 04. ML Approaches

Machine learning approaches are categorized by the type of learning signal available during training. Understanding these distinctions is critical for the exam, as questions may ask when to use each approach.

### Supervised, Unsupervised, and Reinforcement Learning

🎯

#### Supervised Learning

Learns from labeled data (input-output pairs). The model maps inputs to known correct outputs. Examples: classification, regression, object detection. Requires labeled datasets.

🔬

#### Unsupervised Learning

Discovers patterns in unlabeled data. No correct answers are provided. Examples: clustering, dimensionality reduction, anomaly detection. Works with raw, unlabeled datasets.

🎲

#### Reinforcement Learning (RL)

Agent learns by interacting with an environment and receiving rewards/penalties. Used in robotics, game playing, and RLHF for LLM alignment.

🔁

#### Semi-Supervised / Self-Supervised

Combines small amounts of labeled data with large amounts of unlabeled data. Self-supervised learning (used in LLM pre-training) creates labels from the data itself (predict next token).

>**Key Concept:** **RLHF (Reinforcement Learning from Human Feedback)** is a critical technique for aligning LLMs. After pre-training, human evaluators rank model outputs, and a reward model is trained on these preferences. The LLM is then fine-tuned using RL to maximize the reward model's score, making outputs more helpful and less harmful.

## 05. ML Lifecycle

The ML lifecycle describes the end-to-end process of developing, deploying, and maintaining ML models. For generative AI projects, the lifecycle includes additional considerations around prompt engineering, evaluation of generated content, and responsible AI guardrails.

| Phase | Activities | Gen AI Considerations |
| --- | --- | --- |
| 1\. Problem Definition | Define business problem, success metrics, feasibility | Determine if gen AI is the right approach vs. traditional ML |
| 2\. Data Collection | Gather, clean, and prepare training data | Collect examples for fine-tuning, RAG documents, evaluation datasets |
| 3\. Model Selection | Choose architecture, model size, pre-trained model | Select from Model Garden: Gemini Pro vs Flash, open-source options |
| 4\. Training / Tuning | Train from scratch or fine-tune, optimize hyperparameters | Prompt engineering, supervised fine-tuning, RLHF alignment |
| 5\. Evaluation | Test on held-out data, measure metrics | Human evaluation, automated metrics (BLEU, ROUGE), safety testing |
| 6\. Deployment | Serve model via API, integrate into applications | Vertex AI Endpoints, grounding configuration, safety filters |
| 7\. Monitoring | Track performance, detect drift, retrain as needed | Monitor for hallucinations, bias drift, cost optimization |

### Choosing the Right Model

Selecting the right model is a critical decision. The exam tests whether you can match scenarios to appropriate model choices. Key factors include:

-   **Task type** — text generation, image creation, classification, or multimodal
-   **Latency requirements** — real-time (use smaller/faster models like Gemini Flash) vs. batch
-   **Cost constraints** — larger models cost more per request; fine-tuning adds upfront cost
-   **Data sensitivity** — on-premises deployment needs (use open-weight Gemma) vs. managed API
-   **Quality needs** — complex reasoning tasks need larger models (Gemini Pro/Ultra)
-   **Customization depth** — prompt engineering (fast) vs. fine-tuning (slower but more tailored)

>**Common Mistake:** Do not assume the largest model is always best. The exam values cost-efficiency. If a task can be accomplished with Gemini Flash and prompt engineering, choosing the more expensive Ultra model is the wrong answer.

## 06. Data Fundamentals

Data is the fuel for all AI systems. The exam covers data types, data quality principles, and the distinction between structured/unstructured and labeled/unlabeled data.

### Structured vs Unstructured Data

| Type | Definition | Examples | AI Approach |
| --- | --- | --- | --- |
| Structured | Organized in rows/columns with a defined schema | Databases, spreadsheets, CSV files | Traditional ML, BigQuery ML |
| Semi-structured | Has some organizational properties but no rigid schema | JSON, XML, email, log files | NLP, parsing, gen AI extraction |
| Unstructured | No predefined schema or organization | Images, audio, video, free text, PDFs | Deep learning, generative AI |

### Labeled vs Unlabeled Data

**Labeled data** has known correct outputs (a tagged image, a classified document). It is required for supervised learning and fine-tuning. Creating labeled data is expensive and time-consuming.

**Unlabeled data** has no associated labels. It is abundant and cheap. Unsupervised learning and self-supervised pre-training (used for LLMs) work with unlabeled data. LLMs are pre-trained on massive unlabeled text corpora using self-supervised objectives (predict the next token).

### Data Quality

Data quality directly impacts model performance. The principle "garbage in, garbage out" applies even more strongly to generative AI, where poor data leads to inaccurate, biased, or hallucinated outputs.

✅

#### Accuracy

Data correctly represents the real-world entities it describes. Inaccurate training data leads to models that produce wrong answers.

📊

#### Completeness

No missing values or gaps in coverage. Incomplete data causes models to have blind spots on certain topics or demographics.

⏱

#### Timeliness

Data is current and up-to-date. Stale training data causes models to lack knowledge of recent events (a key reason for grounding/RAG).

🔢

#### Consistency

No contradictions across data sources. Inconsistent data confuses models and leads to unpredictable outputs.

📈

#### Representativeness

Data reflects the diversity of real-world use. Biased training data leads to models that perform poorly on underrepresented groups.

🔒

#### Privacy Compliance

Data handling complies with regulations (GDPR, CCPA). PII must be properly managed in training data to avoid legal and ethical issues.

## 07. Gen AI Landscape Layers

The generative AI technology stack can be understood as a layered architecture. Each layer builds on the one below and serves different stakeholders. The exam expects you to understand where Google's offerings fit within this landscape.

| Layer | Description | Google Cloud Offerings |
| --- | --- | --- |
| Infrastructure | Hardware (GPUs, TPUs) and compute for training/serving | Cloud TPUs, A3 GPU VMs, Hypercomputer |
| Foundation Models | Pre-trained large models that power applications | Gemini, Gemma, Imagen, Veo, Chirp |
| Developer Platform | Tools for building AI apps: APIs, SDKs, fine-tuning, RAG | Vertex AI, Model Garden, Agent Builder |
| Pre-built Applications | Ready-to-use AI products for end users | Gemini App, Gemini for Workspace, Customer Engagement Suite |

>**Exam Tip:** The exam frequently asks you to match a scenario to the correct layer. A developer building a custom chatbot uses the **Developer Platform** layer (Vertex AI). A business user summarizing emails uses the **Pre-built Application** layer (Gemini for Workspace). A team training their own model uses the **Infrastructure** layer.

## 08. Google Foundation Models

Google offers a comprehensive family of foundation models, each optimized for different modalities and use cases. Understanding the distinctions between these models is heavily tested on the exam.

### The Gemini Family

**Gemini** is Google's most capable multimodal AI model family. It natively handles text, images, audio, video, and code in a single model. Gemini comes in multiple size variants optimized for different use cases:

| Variant | Size | Best For | Key Features |
| --- | --- | --- | --- |
| Gemini Ultra | Largest | Complex reasoning, research, multimodal analysis | Highest capability, powers Gemini Advanced |
| Gemini Pro | Medium | General-purpose tasks, balanced quality and speed | Best price-performance ratio for most use cases |
| Gemini Flash | Lighter | High-volume, low-latency applications | Fastest response time, lowest cost per token |
| Gemini Nano | Smallest | On-device (phones, IoT), offline scenarios | Runs locally on Pixel, no cloud dependency |

>**Key Concept:** Gemini is **natively multimodal** — trained from the ground up on text, images, audio, and video simultaneously. This differs from earlier approaches that bolted vision capabilities onto text models. Gemini can understand a video, read text in an image, process audio, and generate code all within a single prompt.

### Gemma, Imagen, and Veo

Beyond Gemini, Google offers specialized foundation models for specific modalities:

💎

#### Gemma

Google's family of **open-weight** models built from the same research as Gemini. Available in 2B and 7B parameter sizes. Ideal for on-premises deployment, custom fine-tuning, research, and scenarios requiring full model control. Runs on consumer hardware.

🎨

#### Imagen

Google's text-to-image **diffusion model** that generates photorealistic images from text descriptions. Available through Vertex AI. Features include inpainting, outpainting, style transfer, and image editing. Enterprise-grade with built-in safety filters.

🎥

#### Veo

Google's **video generation model** that creates high-quality videos from text or image prompts. Supports various cinematic styles, camera movements, and creative directions. Targeted at media, advertising, and creative production workflows.

🎤

#### Chirp

Google's speech foundation model powering Cloud Speech-to-Text V2. Supports 100+ languages with improved accuracy. Used for transcription, voice commands, and audio understanding workflows.

>**Exam Distinction:** **Gemini = proprietary, managed API, most capable.** **Gemma = open-weight, self-deployable, smaller.** The exam tests when to recommend each: Gemma when customers need on-premises deployment, full model control, or want to avoid vendor lock-in. Gemini when they need maximum capability, multimodal features, or prefer a managed service.

```
# Quick comparison: Gemini vs Gemma via Vertex AI SDK
from vertexai.generative_models import GenerativeModel

# Gemini Pro - managed API, multimodal
gemini = GenerativeModel("gemini-1.5-pro")
response = gemini.generate_content("Explain quantum computing in 3 sentences.")

# Gemma - open model, deploy to your own endpoint
# Deploy Gemma from Model Garden, then call your custom endpoint
gemma = GenerativeModel("gemma-7b")  # from your deployed endpoint
response = gemma.generate_content("Explain quantum computing in 3 sentences.")
```

Next

[02 · Google Cloud's Gen AI Offerings →](02-gcp-gen-ai-offerings.html)