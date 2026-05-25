---
title: "What AI Actually Does (and What It Doesn't)"
slug: "what-ai-actually-does"
description: "Before strategy, before investment, before governance — a clear-eyed account of what AI systems actually do, where they are genuinely capable, and where vendor claims exceed the technology."
section: "ai-beyond-the-demo"
order: 11
part: "Part II — Strategy and Leadership"
---

Part II — Strategy and Leadership

# What AI Actually Does (and What It Doesn't)

The most important strategic skill in enterprise AI is calibration — knowing where the technology is genuinely capable and where vendor claims exceed it. Executives who lack this calibration make two kinds of errors: they fund AI projects in domains where the technology is not ready, and they fail to fund projects where it would create real value. Both errors are expensive.

## 11.1 What AI Actually Does

At the mechanical level, current AI systems — specifically the large language models and related systems that dominate enterprise AI discussions — do one thing: they predict what output is most likely given an input, based on patterns learned from large amounts of training data.

This sounds simple, and in some ways it is. But the patterns learned from training on billions of documents, images, and code samples are extraordinarily rich, and the predictions those patterns produce are genuinely useful across a wide range of tasks. The key word is "patterns." AI systems do not understand, reason, or decide the way humans do. They recognize patterns and generate outputs consistent with those patterns.

This distinction matters practically. AI systems excel when the task can be solved by pattern recognition — when the answer resembles answers to similar questions in the training data. They struggle when the task requires genuine reasoning from first principles, when it requires knowledge not in the training data, or when it requires being reliably correct rather than reliably plausible.

## 11.2 Where AI Is Genuinely Capable

**Language tasks at scale.** Summarizing documents, extracting information from text, classifying content, generating draft communications, answering questions about documents — these tasks benefit directly from AI's pattern recognition capabilities. An AI trained on millions of contracts can extract key clauses from a new contract reliably. An AI trained on millions of support tickets can classify a new ticket reliably.

**Code assistance.** AI code assistants are among the most mature and reliably valuable AI applications. They accelerate development, catch common errors, and generate boilerplate. They do not replace senior engineers, and they generate bugs, but they reliably increase developer productivity on well-understood tasks.

**Search and retrieval.** AI-powered semantic search finds relevant content based on meaning rather than keyword matching, which improves retrieval quality significantly for unstructured content like documents, emails, and support tickets.

**Anomaly detection and pattern recognition.** AI systems trained on historical operational data can identify anomalous patterns — unusual transactions, equipment behavior outside normal parameters, customer behavior that predicts churn — with greater accuracy than rules-based systems.

## 11.3 Where AI Fails

**Arithmetic and precise reasoning.** AI language models are unreliable at arithmetic, logical deduction, and precise symbolic reasoning. They produce plausible-looking answers that are frequently wrong. Always verify AI outputs for any task requiring numerical precision.

**Knowledge cutoff and currency.** AI systems are trained on data up to a cutoff date. They do not know about events after that date. Coverage is also uneven — some domains are well-represented in training data, others are not.

**Rare events and tail cases.** AI systems trained on typical cases perform poorly on unusual cases underrepresented in training data. In regulated industries where the unusual cases are often the most consequential, this is a significant limitation.

**Consistent factual accuracy.** AI systems generate plausible outputs that are not always factually correct. They hallucinate — producing confident-sounding statements that are wrong. For high-stakes decisions, AI outputs must be verified against authoritative sources.

**Causal reasoning.** AI systems recognize correlation in their training data. They cannot reliably distinguish correlation from causation, which limits their utility for decisions where understanding causal mechanisms matters.

## 11.4 Calibrating Against Vendor Claims

Vendor demonstrations are designed to show AI at its best. The demo uses carefully selected inputs, cherry-picked outputs, and favorable conditions that may not reflect the production environment. Three questions to calibrate any vendor claim:

**What is the failure rate, and what happens when it fails?** Every AI system has a failure rate. The vendor will not lead with this. Ask for it explicitly and ask what the failure mode looks like.

**What data was it trained on, and is that data representative of our environment?** A model trained on publicly available documents may perform poorly on proprietary enterprise documents with specialized terminology. Ask whether the model has been validated on data similar to what you will use it on.

**What human oversight is built into the workflow?** Reliable enterprise AI almost always includes human review for consequential decisions. Ask what the human oversight model is and how it is operationalized.
