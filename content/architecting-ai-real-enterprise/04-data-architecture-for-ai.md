---
title: Data Architecture for AI
slug: data-architecture-for-ai
description: >-
  If you’ve been working in enterprise architecture for any length of time, you
  already have a data architecture. You have data warehouses humming along, data
  lakes that may or may not be...
section: ai-enterprise-architect
order: 4
notebook: >-
  https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch04-data-pipeline-for-rag.ipynb
audioUrl: /audio/ai-enterprise-architect/audio/04-data-architecture-for-ai.mp3
podcastUrl: /audio/ai-enterprise-architect/podcast/04-data-architecture-for-ai.mp3
---



# Data Architecture for AI

## Your Data Architecture Needs an Upgrade

If you have been working in enterprise architecture for any length of time, you already have a data architecture. You have data warehouses humming along, data lakes that may or may not be well-organized, ETL pipelines that somebody built three years ago and nobody wants to touch, master data management initiatives in various states of maturity, and data governance frameworks that range from aspirational to deeply embedded. None of that goes away when AI enters the picture. AI does not replace any of it. It makes every single piece more important than it was before, and then it adds entirely new requirements on top.



Think of it this way: your existing data architecture is the foundation of a building, and AI is a new set of floors you want to add. If the foundation is solid, you are in good shape. If it is cracked and settling, adding floors will make every existing problem dramatically worse. This chapter is about understanding what changes when AI enters your data landscape, what new components you need to introduce, and how to think about the whole thing as a coherent architectural concern rather than a series of one-off projects.

![](/diagrams/ai-enterprise-architect/chapters/ch04-00.svg)

## The Data Quality Problem

### Why It Matters More Now

In traditional systems, bad data causes bad reports. Someone looks at a dashboard, sees a number that does not make sense, flags it, and a data analyst goes digging to find the problem. It is annoying and wastes time, but it is manageable because there is a human in the loop who can exercise judgment and catch obvious errors before they lead to action.

In AI systems, the dynamic is fundamentally different. Bad data does not just produce bad reports. It produces bad decisions, and those decisions often happen at a speed and scale that makes human review impractical. Consider what this means in practice: your fraud detection model, trained on mislabeled data, will approve fraudulent transactions with high confidence. It will not flag them for review or express uncertainty. It will simply get the answer wrong, systematically, across thousands of transactions before anyone notices a pattern. Your customer service chatbot, grounded in outdated documentation, will give customers wrong answers with the same polished tone it uses to give correct ones. Your recommendation engine, trained on biased historical data, will discriminate against certain groups in ways that are subtle enough to evade casual inspection but significant enough to create real harm and legal exposure.

The fundamental rule to internalize is that AI amplifies your data quality in both directions. Good data becomes a competitive advantage because your models are learning real patterns and making genuinely useful predictions. Bad data becomes an active liability because your models are learning false patterns and acting on them with confidence. There is no neutral middle ground. AI turns your data quality into either a force multiplier or a risk multiplier, and you need to understand which one it is for your organization before you start building.

### Data Quality Dimensions for AI

If you are already familiar with data quality frameworks, the dimensions in the table below will look familiar. What is new is the second column: the AI-specific concerns that layer on top of your traditional data quality worries. Each of these dimensions takes on additional weight and sometimes entirely new meaning when your data is feeding machine learning models or grounding large language model responses.

  
| Dimension | Traditional Concern | AI-Specific Concern |
| --- | --- | --- |
| Accuracy | Reports are wrong | Model predictions are wrong |
| Completeness | Missing records | Biased model (underrepresented groups) |
| Timeliness | Stale dashboards | Model drift (trained on old patterns) |
| Consistency | Conflicting sources | Contradictory training signals |
| Relevance | Unused fields | Noise that degrades model performance |
| Lineage | Audit compliance | Reproducibility, bias tracing |

Completeness is the dimension that catches most enterprise teams off guard. In a traditional reporting context, missing records are an inconvenience. Your quarterly report might undercount revenue by a few percent, and someone will notice and correct it. In an AI context, missing records can create something much more insidious: a model that works well for the populations represented in your data and fails silently for everyone else. If your training data underrepresents certain customer demographics, your model will not know how to handle those customers well, and it will not tell you that. It will just quietly perform worse for them. This is how bias enters AI systems. It is fundamentally a data completeness problem.

## Data Pipelines for AI

When architects think about data pipelines, they usually think about ETL or ELT: extracting data from source systems, transforming it, and loading it into a warehouse or lake. AI introduces three distinct types of data pipelines, each with its own architectural characteristics, performance requirements, and operational concerns. Understanding these three pipeline types and how they relate to each other is one of the most important things you can do as an architect working in this space.

### Training Data Pipelines

The training data pipeline is responsible for feeding data to the model training process. It typically runs periodically — daily, weekly, or on-demand when you decide it’s time to retrain — and its job is to take raw data from your source systems and transform it into a clean, labeled, versioned dataset that your data scientists or ML engineers can use to train models.

![](/diagrams/ai-enterprise-architect/chapters/ch04-01.svg)

There are several key architectural decisions you will need to make when designing this pipeline, and each one has significant downstream consequences.

The first is where and how labeling happens. Labeling is the process of attaching ground truth to your data, telling the model what the “right answer” is for each example so it can learn. You have a spectrum of options. Manual labeling by human experts is expensive and slow but produces the most accurate labels, and it is often the right choice for high-stakes domains like medical imaging or legal document classification. Semi-automated labeling, where you use a large language model to generate initial labels and then have humans review and correct them, can dramatically reduce cost while maintaining reasonable accuracy. Weak supervision, where you write programmatic rules to generate labels automatically, is the cheapest and fastest approach but requires deep domain expertise. Most organizations end up using a combination of all three, depending on the use case and how much labeled data they need.

The second decision is how to version your datasets. This might sound like a mundane operational concern, but it is architecturally critical. You need to be able to reproduce any training run exactly as it happened, using the same data, the same preprocessing steps, the same labels. This means versioning your datasets with the same discipline you version your code, and linking dataset versions to model versions so you can always answer the question “what data produced this model?” Tools like DVC, LakeFS, or managed dataset versioning in cloud ML platforms can help, but the important thing is to design this into your architecture from the start rather than trying to retrofit it later.

The third decision is storage format, and this one is more practical than strategic. Parquet works well for tabular data, JSONL is a natural fit for text datasets, TFRecord is the native format for TensorFlow pipelines, and WebDataset works well for image datasets. Choose based on what your training infrastructure expects and what your team is comfortable with. There is no universally right answer, just locally appropriate ones.

### Inference Data Pipelines

While training pipelines prepare data for building models, inference pipelines feed data to models that are already deployed and serving predictions. These come in two forms, and the choice between them matters more than many architects realize.

![](/diagrams/ai-enterprise-architect/chapters/ch04-02.svg)

The most important architectural decision here is whether you actually need real-time inference or whether batch processing will do. There is a strong gravitational pull toward real-time in enterprise AI projects. It feels more impressive, more “AI-like,” and stakeholders often assume it is necessary. But many AI use cases work perfectly well as batch jobs at a fraction of the cost. Document processing, report generation, content classification, lead scoring, risk assessment on a portfolio: all of these can run as nightly or hourly batch jobs and still deliver enormous value. Real-time inference adds significant architectural complexity. You need low-latency serving infrastructure, autoscaling, caching strategies, fallback mechanisms, and monitoring that can detect issues in milliseconds rather than minutes. Only build for real-time when the use case genuinely demands it: when a customer is waiting for a response, when a transaction needs to be approved or declined in the moment, when a safety system needs to react immediately.

The other key component to consider here is the feature store, which becomes relevant when your ML models need computed features at inference time. A feature store like Feast or Vertex AI Feature Store serves as a bridge between your training and serving pipelines, ensuring that the features your model sees at inference time are computed the same way they were during training. Without this consistency, you get a problem called training-serving skew, where your model performs differently in production than it did during evaluation because it is seeing slightly different inputs. If you are building ML models that depend on engineered features, things like “average transaction amount over the last 30 days” or “number of support tickets opened in the last quarter,” a feature store should be part of your architecture.

### RAG Data Pipelines

Retrieval-augmented generation, or RAG, has emerged as one of the most common patterns for enterprise AI, and it introduces a pipeline type that is architecturally distinct from both training and inference pipelines. The RAG pipeline is responsible for taking your organization’s documents and knowledge bases, breaking them into pieces, converting those pieces into mathematical representations called embeddings, and storing those embeddings in a vector database where they can be efficiently searched at query time.

![](/diagrams/ai-enterprise-architect/chapters/ch04-03.svg)

The chunking strategy is the decision that has the most impact on the quality of your RAG system, and it is one that teams consistently underestimate. Chunking is how you split your source documents into pieces for embedding and retrieval, and the way you do it fundamentally determines what your system can and cannot find. If your chunks are too large, say, entire chapters or full documents, the embedding for each chunk becomes a blurry average of too many topics, and retrieval becomes noisy and imprecise. If your chunks are too small, individual sentences or single paragraphs, each chunk lacks enough context to be useful on its own, and the model struggles to generate coherent answers from fragments. Most organizations find a sweet spot in the range of 500 to 1,000 tokens per chunk, with an overlap of about 100 tokens between consecutive chunks so that ideas spanning a chunk boundary do not get lost. The right answer depends heavily on the nature of your documents, and you should expect to experiment.

Update frequency is another architectural decision that deserves careful thought. You need to decide how quickly changes in your source documents should be reflected in your RAG system’s knowledge base. Event-driven re-embedding, where you automatically re-process a document whenever it changes, gives you the freshest possible knowledge base but adds significant architectural complexity. Nightly batch re-indexing is simpler and cheaper, and for most enterprise use cases, a few hours of latency between a document update and its availability in the RAG system is perfectly acceptable. Most enterprises start with nightly batch and only move to event-driven updates for specific documents where freshness is critical, like compliance policies or pricing information.

Do not overlook metadata. When you store embeddings in your vector store, store the source document path, the date it was last modified, the author, the access level, and any other relevant context alongside each embedding. You will need this metadata for filtering search results (so users only find documents they are authorized to see), for attribution (so the system can tell users where its answers came from), and for debugging (so you can figure out why the system gave a particular answer and whether the underlying source material was correct).

## Data Governance for AI

### What Changes

If you already have a data governance framework, and most enterprises do to varying degrees of maturity, you do not need to throw it out and start over. The framework you have provides a solid foundation. AI introduces a set of concerns that your existing framework almost certainly does not cover, and you need to extend it deliberately rather than hoping that your current policies are sufficient.

The table below maps your existing governance capabilities to the AI-specific extensions each one needs. Think of this not as a criticism of your current framework but as a natural evolution. Just as your governance framework had to evolve when you moved from on-premises databases to cloud data lakes, it now needs to evolve again for AI.

 
| Existing Governance | AI Extension |
| --- | --- |
| Data catalog | Add: training datasets, model cards, prompt templates |
| Access controls | Add: who can train models on which data |
| Privacy (GDPR, etc.) | Add: right to be forgotten from training data, model outputs |
| Data lineage | Add: which data trained which model version |
| Quality monitoring | Add: data drift detection, feature distribution monitoring |

The access control extension deserves special attention because it represents a genuinely new governance challenge. In traditional systems, you govern who can *read* data and who can *write* data. With AI, you need a third dimension: who can *train on* data. Just because someone has read access to a dataset for reporting purposes does not mean they should be able to use that dataset to train a model, especially if that model might be deployed externally or used to make consequential decisions about individuals. Your governance framework needs to be able to express and enforce this distinction.

### The Model Card

A model card is the AI equivalent of a system design document. For every model in your architecture, whether it is a fine-tuned model you built in-house, a third-party model you have integrated, or a large language model you are accessing through an API, you should maintain a model card that documents the key information anyone in the organization might need to understand, evaluate, or make decisions about that model.

The model card should describe what data the model was trained on, including what was deliberately excluded and why. It should document known limitations and biases — every model has them, and pretending otherwise is both intellectually dishonest and practically dangerous. It should include performance metrics broken down by demographic group, so you can understand whether the model serves all populations equitably or whether there are groups for whom it performs significantly worse. It should specify the intended use cases, and equally importantly, it should explicitly call out use cases the model is *not* intended for — the uses where it hasn’t been validated, where its error rates would be unacceptable, or where the potential for harm is too high. And it should identify who owns the model and how to report issues when something goes wrong in production.

Think of model cards the way you think of API documentation. They serve the same fundamental purpose: enabling other teams to understand and correctly use a component they did not build, but for AI components instead of traditional services. Model cards should live in your architecture repository alongside system design documents, and they should be subject to the same review and update processes.

### Data Lineage for AI

Data lineage has always been an important part of enterprise data governance, but AI introduces lineage requirements that go well beyond traditional audit trails. In a traditional system, lineage is primarily about compliance: being able to show an auditor where a number in a report came from, what transformations it went through, and whether those transformations were correct. In an AI system, lineage becomes a safety and accountability mechanism as well.

![](/diagrams/ai-enterprise-architect/chapters/ch04-04.svg)

There are four lineage questions you need to be able to answer for any AI component in your architecture. First, what data was used to train this model? This is training lineage, and it is essential for reproducibility. If you need to retrain a model or understand why it is behaving a certain way, you need to know exactly what data shaped it. Second, what data is this model accessing at inference time? This is runtime lineage, and it matters because even a well-trained model can produce bad outputs if the data it accesses at inference time is stale, incorrect, or inappropriate. Third, which specific user data has been used in which model’s training? This is privacy lineage, and it is becoming a legal requirement under regulations like GDPR. If a customer exercises their right to be forgotten, you need to know which models were trained on their data and what that means for those models. Fourth, if a data source is found to be biased or corrupt, which models are affected? This is impact lineage: your ability to perform a blast radius analysis when something goes wrong with your data, to quickly identify every downstream AI system that might be compromised and take appropriate action.

Building the infrastructure to answer these four questions is not a trivial undertaking, but it’s also not optional if you’re serious about operating AI responsibly at enterprise scale.

### Access Control Patterns for AI Data

Traditional access control deals with two dimensions: who can read data and who can write data. AI introduces a third dimension that most organizations have never had to think about before: who can *train on* data. This distinction matters because training on data creates a fundamentally different kind of exposure than simply reading it. When someone reads a customer record to answer a support ticket, that exposure is bounded. It happens once, in a specific context, for a specific purpose. When that same customer record is used to train a model, its patterns and characteristics become embedded in the model’s weights, potentially influencing every prediction the model makes for years to come. The data’s influence extends far beyond the original context in ways that are difficult to fully trace or reverse.

Your access control framework for AI data needs to distinguish between at least four tiers, and each tier carries its own governance requirements.

| Tier | Description | Example Controls |
| --- | --- | --- |
| Training data access | Who can include this data in model training | Requires data owner approval, purpose documentation, bias review |
| Inference-time access | Who can feed this data to a model at runtime | Standard read permissions plus PII filtering |
| Model output access | Who can see predictions or generated content | Role-based, may require different controls than source data |
| Evaluation data access | Who can use this data to test model performance | Requires representative sampling review, demographic balance check |

The training data tier is where most organizations need to invest the most new governance muscle. Just because a data science team has read access to a dataset for exploratory analysis does not mean they should be able to use that dataset to train a production model. Training access should require explicit approval from the data owner, documentation of the intended purpose, and a review of whether the data is representative enough to avoid introducing bias. Some organizations implement this through a formal "training data request" process that runs alongside their existing data access request workflows: same governance muscle, new dimension of control.

The inference-time tier is more straightforward but still requires attention. When a model accesses data at inference time, for example a RAG system retrieving customer records to answer a question, the access controls should reflect not just who the requesting user is, but what the model is allowed to surface. A customer service agent might be authorized to see a customer’s account balance, but the model should still be prevented from including that balance in a response that gets logged to a shared transcript. PII filtering at the inference boundary is essential, and it needs to be enforced architecturally, not just through policy.

### Data Retention and Deletion for AI

Data retention in an AI context is considerably more complex than in traditional systems. Data does not just sit in a database waiting to be queried. It gets absorbed into models, embedded in vector stores, and cached in inference pipelines. When a customer exercises their right to be forgotten under GDPR, CCPA, or similar regulations, you cannot simply delete a row from a database and call it done. You need to understand everywhere that data has left an imprint, and you need a strategy for each one.

The challenge breaks down into four distinct categories, each with its own level of difficulty.

**Structured data deletion** is the easiest category and the one your existing retention policies probably already handle. Delete the records from your databases, purge them from your data warehouse, and remove them from any backup or archive that falls within your retention window. This is table stakes.

**Vector store deletion** is moderately difficult. If the customer’s data was embedded and stored in a vector database, for example as part of a RAG knowledge base, those embeddings need to be identified and removed. This requires that you maintained the metadata linking embeddings back to source records, which is why the metadata practices described earlier in this chapter are not optional. Without that linkage, you cannot reliably identify which embeddings to delete.

**Training data removal** is harder still. If the customer’s data was included in a dataset used to train a model, you need to document which model versions were trained on that data and assess whether retraining is necessary. In many cases, a single customer’s data has a negligible influence on a model trained on millions of records, and regulators have generally accepted that retraining is not required for every individual deletion request. But you need to be able to demonstrate that you know which models were affected and that you have made a reasonable assessment — which brings us back to the lineage requirements discussed earlier.

**Model unlearning** is the frontier category. Machine unlearning, the ability to remove a specific data point’s influence from a trained model without retraining from scratch, is an active area of research but is not yet practical for most production systems. For now, the pragmatic approach is to maintain clear records of which data was used in which training run, to retrain periodically on updated datasets that reflect deletions, and to document your approach so that you can demonstrate due diligence to regulators. As unlearning techniques mature, they will become part of the standard toolkit. Today, prevention is more practical than cure. Be deliberate about what data enters your training pipelines in the first place.

### AI Data Governance Checklist

The checklist below captures the ten governance capabilities that every organization running AI at enterprise scale needs to have in place. Not every capability needs to be fully mature on day one. Governance is a journey, not a destination. Every one of them should at least be on your roadmap with a clear owner and a timeline for implementation.

| # | Capability | Description | Priority |
| --- | --- | --- | --- |
| 1 | Data cataloging | Maintain a catalog of all datasets used for AI, including training data, evaluation data, and RAG knowledge bases, with metadata on source, owner, sensitivity, and freshness | High |
| 2 | Quality monitoring | Implement automated checks for data quality dimensions (accuracy, completeness, timeliness, consistency, relevance) with alerts when quality degrades below defined thresholds | High |
| 3 | Lineage tracking | Track data from source through transformation to model training and inference, enabling end-to-end traceability from a model’s decision back to the data that shaped it | High |
| 4 | Access control | Enforce distinct access policies for reading, writing, training, and inference, with explicit approval workflows for training data usage | High |
| 5 | PII handling | Implement detection, masking, and filtering of personally identifiable information at both training-time and inference-time boundaries | High |
| 6 | Consent management | Track user consent for data usage across different purposes (analytics, model training, personalization) and enforce consent boundaries in data pipelines | Medium |
| 7 | Data versioning | Version all training datasets and link dataset versions to model versions, enabling exact reproduction of any training run and rollback when issues are discovered | Medium |
| 8 | Bias auditing | Regularly audit training data and model outputs for demographic bias, representation gaps, and fairness violations, with documented remediation plans | Medium |
| 9 | Retention policies | Define and enforce retention and deletion policies that account for structured data, vector embeddings, training datasets, and model artifacts, with documented procedures for right-to-be-forgotten requests | Medium |
| 10 | Incident response | Establish a documented process for responding to data quality incidents, including blast radius assessment (which models are affected), stakeholder notification, and remediation steps | Medium |

Think of this checklist not as a compliance exercise but as an architectural maturity model. Each capability builds on the ones above it. You cannot do meaningful bias auditing without lineage tracking, and you cannot enforce retention policies without data cataloging. Start at the top, build a solid foundation, and work your way down.

## Real-World Example: The Bank’s Data Journey

![](/diagrams/ai-enterprise-architect/chapters/ch04-05.svg)

Consider a real-world example that illustrates just how much of the AI journey is actually a data journey. A retail bank wanted to build an AI-powered financial advisor chatbot, one that could answer customer questions about products, help with account inquiries, and provide personalized financial guidance. The technology side of this project, the model selection, the prompt engineering, the user interface, took about three months. The data architecture work took nine months. That ratio is not unusual. It is remarkably consistent across enterprise AI projects.

In **Phase 1, Discovery**, the team conducted an inventory of the data they would need. What they found was sobering but entirely typical. Customer data was spread across 14 different systems, each with its own schema, its own update cadence, and its own quirks around data quality. Transaction data lived in 3 separate databases with inconsistent categorization schemes. Product documentation, the knowledge the chatbot would need to answer customer questions, was scattered across SharePoint sites, Confluence spaces, and approximately 200 PDFs, many of which had not been updated in years and some of which contradicted each other. None of this data was ready for AI. It was good enough for the humans who had learned to navigate its inconsistencies, but it was nowhere near the quality or accessibility bar that an AI system requires.

In **Phase 2, Data Foundation**, the team did the unglamorous but essential work of getting their data house in order. They built a unified customer data pipeline that reconciled customer records across all 14 source systems into a single, consistent view. That project took six months by itself and surfaced data quality issues that had been lurking undetected for years. They created a document processing pipeline to extract content from those 200 PDFs and various wiki pages, structure it consistently, and identify conflicts and outdated information. That took another two months. Finally, they set up the RAG knowledge base with product information, FAQs, and compliance rules, which took about a month once the upstream data was clean and well-organized.

In **Phase 3, Governance**, the team established the controls and documentation that would allow the chatbot to operate responsibly. They classified all data sources by sensitivity level, drawing clear boundaries around what could and couldn’t be used. They defined explicit policies for which data could be sent to external LLM APIs versus which data had to stay on-premises — a critical decision for any financial institution dealing with customer financial data. They created model cards for each AI component in the system, documenting capabilities, limitations, and ownership. And they implemented PII detection in both the input pipeline (to catch personal information in customer queries) and the output pipeline (to prevent the model from inadvertently revealing one customer’s information to another).

In **Phase 4, Operations**, the team built the ongoing monitoring and maintenance processes that would keep the system healthy over time. They automated data quality checks on the RAG knowledge base so that stale or inconsistent documents would be flagged before they could mislead customers. They set up drift detection on the ML models to catch situations where the model’s performance was degrading because the real world had changed in ways the training data didn’t reflect. And they established a monthly data review cadence with the compliance team to ensure ongoing alignment with regulatory requirements.

The lesson here is one that every enterprise architect working on AI needs to internalize: the chatbot was “done” in 3 months, but the data architecture work took 9 months. This is normal — not a sign that something went wrong, but a sign that the team did it right. The organizations that try to skip or shortcut the data work end up with AI systems that are impressive in demos and unreliable in production.

## Key Takeaways

1.  AI amplifies your data quality in both directions — good data becomes a powerful asset while bad data becomes an active liability, so invest in fixing your data before you invest in building models.
2.  You need three distinct types of data pipelines for AI — training pipelines, inference pipelines, and RAG pipelines — and each one has its own architectural requirements, operational characteristics, and failure modes that you need to understand and plan for.
3.  Your existing data governance framework provides a solid foundation, but it needs deliberate extension to cover training data provenance, model cards, AI-specific privacy concerns like the right to be forgotten from training data, and new access control dimensions around who can train on which data.
4.  Data lineage for AI goes beyond traditional audit trails and becomes a safety and accountability mechanism — you need to be able to trace from a model’s decisions all the way back to the specific data that shaped those decisions, and you need to be able to assess blast radius when a data source is found to be problematic.
5.  The data work consistently takes longer than the model work, often by a factor of two to three, and this is not a failure of planning — it is a fundamental characteristic of enterprise AI projects that you should communicate to stakeholders early and often.

## Companion Notebook

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/careeralign/notebooks/blob/main/books/ai-enterprise-architect/ch04-data-pipeline-for-rag.ipynb) — Build a complete RAG data pipeline: ingest PDFs, chunk text, generate embeddings, store in a vector database, and query. See how chunking strategy affects retrieval quality.
