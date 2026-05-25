---
title: Data Architecture for AI
slug: data-architecture-for-ai
description: >-
  AI amplifies your data quality in both directions — good data becomes a force multiplier, bad data becomes an active liability. This chapter covers the three pipeline types AI requires, how to extend your existing data governance framework, and why the data work consistently takes longer than the model work.
section: ai-enterprise-architect
order: 4
notebook: >-
  https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch04-data-pipeline-for-rag.ipynb
audioUrl: /audio/ai-enterprise-architect/audio/04-data-architecture-for-ai.mp3
podcastUrl: /audio/ai-enterprise-architect/podcast/04-data-architecture-for-ai.mp3
---

# Data Architecture for AI

## Your Data Architecture Needs an Upgrade

You already have a data architecture. Data warehouses humming along, data lakes that may or may not be well-organized, ETL pipelines that somebody built three years ago and nobody wants to touch, master data management initiatives in various states of maturity, data governance frameworks ranging from aspirational to deeply embedded. None of that goes away when AI enters the picture. AI does not replace any of it. It makes every single piece more important than it was before — and then it adds entirely new requirements on top.

Think of your existing data architecture as the foundation of a building. AI is a new set of floors you want to add. If the foundation is solid, you are in good shape. If it is cracked and settling, adding floors makes every existing problem dramatically worse.

![](/diagrams/ai-enterprise-architect/chapters/ch04-00.svg)

## The Data Quality Problem

### Why It Matters More Now

In traditional systems, bad data causes bad reports. Someone looks at a dashboard, sees a number that does not make sense, flags it, and a data analyst goes digging to find the problem. Annoying and wasteful, but manageable because there is a human in the loop who can exercise judgment and catch obvious errors before they lead to action.

In AI systems, the dynamic is fundamentally different. Bad data does not just produce bad reports. It produces bad decisions, and those decisions happen at a speed and scale that makes human review impractical. Your fraud detection model, trained on mislabeled data, will approve fraudulent transactions with high confidence — not flag them for review, not express uncertainty, just get the answer wrong systematically across thousands of transactions before anyone notices. Your customer service chatbot, grounded in outdated documentation, will give customers wrong answers with the same polished tone it uses to give correct ones. Your recommendation engine, trained on biased historical data, will discriminate against certain groups in ways subtle enough to evade casual inspection but significant enough to create real harm and legal exposure.

AI amplifies your data quality in both directions. Good data becomes a competitive advantage. Bad data becomes an active liability. There is no neutral middle ground.

### Data Quality Dimensions for AI

| Dimension | Traditional Concern | AI-Specific Concern |
| --- | --- | --- |
| Accuracy | Reports are wrong | Model predictions are wrong |
| Completeness | Missing records | Biased model (underrepresented groups) |
| Timeliness | Stale dashboards | Model drift (trained on old patterns) |
| Consistency | Conflicting sources | Contradictory training signals |
| Relevance | Unused fields | Noise that degrades model performance |
| Lineage | Audit compliance | Reproducibility, bias tracing |

Completeness is the dimension that catches most enterprise teams off guard. In a traditional reporting context, missing records are an inconvenience — your quarterly report might undercount revenue by a few percent and someone will correct it. In an AI context, missing records create something more insidious: a model that works well for the populations represented in your data and fails silently for everyone else. If your training data underrepresents certain customer demographics, your model will not know how to handle those customers and will not tell you that. It will just quietly perform worse for them. This is how bias enters AI systems. It is fundamentally a data completeness problem.

## Data Pipelines for AI

AI introduces three distinct pipeline types, each with its own architectural characteristics, performance requirements, and operational concerns.

### Training Data Pipelines

The training data pipeline feeds data to the model training process. It runs periodically — daily, weekly, or on-demand — and its job is to take raw data from source systems and transform it into a clean, labeled, versioned dataset.

![](/diagrams/ai-enterprise-architect/chapters/ch04-01.svg)

Three decisions shape this pipeline's architecture and have significant downstream consequences.

**Where and how labeling happens.** Manual labeling by human experts is expensive and slow but produces the most accurate labels — often the right choice for high-stakes domains like medical imaging or legal document classification. Semi-automated labeling, where an LLM generates initial labels and humans review and correct them, can dramatically reduce cost while maintaining reasonable accuracy. Weak supervision, where programmatic rules generate labels automatically, is the cheapest and fastest approach but requires deep domain expertise. Most organizations end up using a combination of all three, depending on the use case and how much labeled data they need.

**How datasets are versioned.** This might sound like a mundane operational concern, but it is architecturally critical. You need to be able to reproduce any training run exactly as it happened — same data, same preprocessing steps, same labels. This means versioning your datasets with the same discipline you version your code, and linking dataset versions to model versions so you can always answer "what data produced this model?" Tools like DVC, LakeFS, or managed dataset versioning in cloud ML platforms can help, but the important thing is to design this in from the start rather than retrofitting it later.

**Storage format.** Parquet works well for tabular data; JSONL is a natural fit for text datasets; TFRecord is the native format for TensorFlow pipelines; WebDataset works well for image datasets. Choose based on what your training infrastructure expects and what your team is comfortable with.

### Inference Data Pipelines

Inference pipelines feed data to models that are already deployed and serving predictions. They come in two forms: real-time (serving predictions as requests arrive) and batch (processing in scheduled runs).

![](/diagrams/ai-enterprise-architect/chapters/ch04-02.svg)

The most important decision is whether you actually need real-time inference. There is a strong gravitational pull toward real-time in enterprise AI projects — it feels more impressive, and stakeholders often assume it is necessary. But many AI use cases work perfectly well as batch jobs at a fraction of the cost. Document processing, report generation, content classification, lead scoring, risk assessment on a portfolio: all of these can run as nightly or hourly batch jobs and still deliver enormous value.

Real-time inference adds significant architectural complexity. You need low-latency serving infrastructure, autoscaling, caching strategies, fallback mechanisms, and monitoring that can detect issues in milliseconds. Only build for real-time when the use case genuinely demands it: when a customer is waiting for a response, when a transaction needs to be approved in the moment, when a safety system needs to react immediately.

If your ML models need computed features at inference time, also consider a feature store (Feast, Vertex AI Feature Store). A feature store ensures that the features your model sees at inference time are computed the same way they were during training. Without this consistency, you get training-serving skew — your model performs differently in production than it did during evaluation because it is seeing slightly different inputs.

### RAG Data Pipelines

RAG pipelines take your organization's documents and knowledge bases, break them into pieces, convert those pieces into embeddings, and store those embeddings in a vector database where they can be efficiently searched at query time.

![](/diagrams/ai-enterprise-architect/chapters/ch04-03.svg)

**Chunking strategy** has the most impact on RAG quality, and teams consistently underestimate this decision. If your chunks are too large — entire chapters or full documents — the embedding for each chunk becomes a blurry average of too many topics and retrieval becomes noisy. If your chunks are too small — individual sentences — each chunk lacks enough context to be useful on its own. Most organizations find a sweet spot in the range of 500 to 1,000 tokens per chunk, with an overlap of about 100 tokens between consecutive chunks so that ideas spanning a chunk boundary do not get lost. The right answer depends heavily on the nature of your documents, and you should expect to experiment.

**Update frequency** also deserves careful thought. Event-driven re-embedding — automatically re-processing a document whenever it changes — gives you the freshest knowledge base but adds significant architectural complexity. Nightly batch re-indexing is simpler and cheaper. For most enterprise use cases, a few hours of latency between a document update and its availability in the RAG system is perfectly acceptable. Start with nightly batch and only move to event-driven updates for documents where freshness is critical, like compliance policies or pricing information.

Do not overlook metadata. When you store embeddings in your vector store, store the source document path, last modified date, author, access level, and any other relevant context alongside each embedding. You will need this for filtering search results (so users only find documents they are authorized to see), for attribution (so the system can tell users where its answers came from), and for debugging.

## Data Governance for AI

### What Changes

If you already have a data governance framework, you do not need to throw it out. AI introduces a set of concerns that your existing framework almost certainly does not cover, and you need to extend it deliberately.

| Existing Governance | AI Extension |
| --- | --- |
| Data catalog | Add: training datasets, model cards, prompt templates |
| Access controls | Add: who can train models on which data |
| Privacy (GDPR, etc.) | Add: right to be forgotten from training data, model outputs |
| Data lineage | Add: which data trained which model version |
| Quality monitoring | Add: data drift detection, feature distribution monitoring |

The access control extension deserves special attention. In traditional systems, you govern who can read data and who can write data. With AI, you need a third dimension: who can *train on* data. Just because someone has read access to a dataset for reporting purposes does not mean they should be able to use that dataset to train a model, especially if that model might be deployed externally or used to make consequential decisions about individuals.

### The Model Card

A model card is the AI equivalent of a system design document. For every model in your architecture — fine-tuned in-house, integrated from a third party, or accessed through an API — you should maintain a model card documenting the key information anyone in the organization might need to understand, evaluate, or make decisions about that model.

A model card should describe what data the model was trained on (including what was deliberately excluded and why), its known limitations and biases, performance metrics broken down by demographic group, intended use cases and explicit non-uses, and who owns the model and how to report issues.

Think of model cards the way you think of API documentation. They serve the same fundamental purpose: enabling other teams to understand and correctly use a component they did not build. Model cards should live in your architecture repository alongside system design documents and be subject to the same review and update processes.

### Data Lineage for AI

Lineage in AI becomes a safety and accountability mechanism, not just an audit trail. Four lineage questions you need to be able to answer for any AI component:

1. **Training lineage:** What data was used to train this model? Essential for reproducibility — if you need to retrain or understand why a model is behaving a certain way, you need to know exactly what data shaped it.
2. **Runtime lineage:** What data is this model accessing at inference time? Even a well-trained model can produce bad outputs if the data it accesses at inference time is stale, incorrect, or inappropriate.
3. **Privacy lineage:** Which specific user data has been used in which model's training? Required under regulations like GDPR. If a customer exercises their right to be forgotten, you need to know which models were trained on their data.
4. **Impact lineage:** If a data source is found to be biased or corrupt, which models are affected? Your ability to perform a blast radius analysis when something goes wrong — to quickly identify every downstream AI system that might be compromised and take appropriate action.

![](/diagrams/ai-enterprise-architect/chapters/ch04-04.svg)

### Access Control Patterns for AI Data

Training on data creates a fundamentally different kind of exposure than reading it. When someone reads a customer record to answer a support ticket, that exposure is bounded — once, in a specific context, for a specific purpose. When that same record is used to train a model, its patterns become embedded in the model's weights, potentially influencing every prediction the model makes for years to come. The data's influence extends far beyond the original context in ways that are difficult to fully trace or reverse.

| Tier | Description | Example Controls |
| --- | --- | --- |
| Training data access | Who can include this data in model training | Requires data owner approval, purpose documentation, bias review |
| Inference-time access | Who can feed this data to a model at runtime | Standard read permissions plus PII filtering |
| Model output access | Who can see predictions or generated content | Role-based, may require different controls than source data |
| Evaluation data access | Who can use this data to test model performance | Requires representative sampling review, demographic balance check |

Training access should require explicit approval from the data owner, documentation of the intended purpose, and a review of whether the data is representative enough to avoid introducing bias. Some organizations implement this through a formal "training data request" process that runs alongside their existing data access request workflows.

When a model accesses data at inference time — for example a RAG system retrieving customer records to answer a question — the access controls should reflect not just who the requesting user is, but what the model is allowed to surface. A customer service agent might be authorized to see a customer's account balance, but the model should still be prevented from including that balance in a response logged to a shared transcript. PII filtering at the inference boundary is essential, and it needs to be enforced architecturally, not just through policy.

### Data Retention and Deletion for AI

When a customer exercises their right to be forgotten under GDPR, CCPA, or similar regulations, you cannot simply delete a row from a database and call it done. Data gets absorbed into models, embedded in vector stores, and cached in inference pipelines. You need to understand everywhere that data has left an imprint, and you need a strategy for each.

**Structured data deletion** is the easiest and the one your existing retention policies probably already handle. Delete the records from your databases, purge them from your data warehouse, remove them from backups within your retention window.

**Vector store deletion** is moderately difficult. If the customer's data was embedded and stored in a vector database, those embeddings need to be identified and removed. This requires that you maintained the metadata linking embeddings back to source records — which is why the metadata practices described earlier are not optional.

**Training data removal** is harder. If the customer's data was included in a dataset used to train a model, you need to document which model versions were trained on that data and assess whether retraining is necessary. In many cases, a single customer's data has negligible influence on a model trained on millions of records, and regulators have generally accepted that retraining is not required for every individual deletion request. But you need to demonstrate that you know which models were affected and have made a reasonable assessment.

**Model unlearning** — removing a specific data point's influence from a trained model without retraining from scratch — is an active area of research but not yet practical for most production systems. The pragmatic approach: maintain clear records of which data was used in which training run, retrain periodically on updated datasets that reflect deletions, and document your approach for regulators. Prevention is more practical than cure. Be deliberate about what data enters your training pipelines in the first place.

### AI Data Governance Checklist

| # | Capability | Description | Priority |
| --- | --- | --- | --- |
| 1 | Data cataloging | Maintain a catalog of all datasets used for AI, including training data, evaluation data, and RAG knowledge bases, with metadata on source, owner, sensitivity, and freshness | High |
| 2 | Quality monitoring | Implement automated checks for data quality dimensions with alerts when quality degrades below defined thresholds | High |
| 3 | Lineage tracking | Track data from source through transformation to model training and inference, enabling end-to-end traceability | High |
| 4 | Access control | Enforce distinct access policies for reading, writing, training, and inference, with explicit approval workflows for training data usage | High |
| 5 | PII handling | Implement detection, masking, and filtering of personally identifiable information at both training-time and inference-time boundaries | High |
| 6 | Consent management | Track user consent for data usage across different purposes and enforce consent boundaries in data pipelines | Medium |
| 7 | Data versioning | Version all training datasets and link dataset versions to model versions, enabling exact reproduction of any training run | Medium |
| 8 | Bias auditing | Regularly audit training data and model outputs for demographic bias, representation gaps, and fairness violations | Medium |
| 9 | Retention policies | Define and enforce retention and deletion policies that account for structured data, vector embeddings, training datasets, and model artifacts | Medium |
| 10 | Incident response | Establish a documented process for responding to data quality incidents, including blast radius assessment, stakeholder notification, and remediation steps | Medium |

Each capability builds on the ones above it. You cannot do meaningful bias auditing without lineage tracking, and you cannot enforce retention policies without data cataloging. Start at the top, build a solid foundation, and work your way down.

## Real-World Example: The Bank's Data Journey

![](/diagrams/ai-enterprise-architect/chapters/ch04-05.svg)

A retail bank wanted to build an AI-powered financial advisor chatbot — one that could answer customer questions about products, help with account inquiries, and provide personalized financial guidance. The technology side of this project, model selection, prompt engineering, and user interface, took about three months. The data architecture work took nine months.

That ratio is not unusual. It is remarkably consistent across enterprise AI projects.

In **Phase 1, Discovery**, the team inventoried the data they would need. Customer data was spread across 14 different systems, each with its own schema, its own update cadence, and its own quirks around data quality. Transaction data lived in 3 separate databases with inconsistent categorization schemes. Product documentation — the knowledge the chatbot would need to answer customer questions — was scattered across SharePoint sites, Confluence spaces, and approximately 200 PDFs, many not updated in years and some contradicting each other. None of this data was ready for AI.

In **Phase 2, Data Foundation**, the team did the unglamorous but essential work. They built a unified customer data pipeline that reconciled customer records across all 14 source systems into a single, consistent view. That project alone took six months and surfaced data quality issues that had been lurking undetected for years. They created a document processing pipeline to extract content from those 200 PDFs and various wiki pages, structure it consistently, and identify conflicts and outdated information. Two more months. Finally, they set up the RAG knowledge base with product information, FAQs, and compliance rules — about a month once the upstream data was clean and well-organized.

In **Phase 3, Governance**, the team established the controls that would allow the chatbot to operate responsibly. They classified all data sources by sensitivity level. They defined explicit policies for which data could be sent to external LLM APIs versus which data had to stay on-premises — a critical decision for any financial institution dealing with customer financial data. They created model cards for each AI component. They implemented PII detection in both the input pipeline (to catch personal information in customer queries) and the output pipeline (to prevent the model from inadvertently revealing one customer's information to another).

In **Phase 4, Operations**, the team built ongoing monitoring. Automated data quality checks on the RAG knowledge base so that stale or inconsistent documents would be flagged before they could mislead customers. Drift detection on the ML models. A monthly data review cadence with the compliance team.

The chatbot was "done" in 3 months. The data architecture work took 9 months. This is normal — not a sign something went wrong, but a sign the team did it right. Organizations that try to skip or shortcut the data work end up with AI systems that are impressive in demos and unreliable in production.

## Companion Notebook

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch04-data-pipeline-for-rag.ipynb) — Build a complete RAG data pipeline: ingest PDFs, chunk text, generate embeddings, store in a vector database, and query. See how chunking strategy affects retrieval quality.
