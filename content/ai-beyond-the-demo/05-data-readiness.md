---
title: "Data Readiness — The Prerequisite Nobody Talks About"
slug: "data-readiness"
description: "Data readiness is the single most consistently underestimated factor in enterprise AI. The question is not whether you have data — every enterprise has data. The question is whether you have data the AI can use."
section: "ai-beyond-the-demo"
order: 5
part: "Part I — The Enterprise Foundation"
---

Part I — The Enterprise Foundation

# Data Readiness — The Prerequisite Nobody Talks About

Every enterprise AI pitch includes a slide about data. It shows the volume of data the organization holds — terabytes, petabytes, decades of records. What it does not show is what percentage of that data is accessible, clean, labeled, and governed to the standard the AI use case requires. Data readiness is the single most consistently underestimated factor in enterprise AI projects, and closing the gap between "we have data" and "we have AI-ready data" is almost always the longest item on the project plan.

### What You Will Learn

- The four dimensions of data readiness and how to assess each
- Why data volume is not a useful proxy for data readiness
- The data readiness assessment that should precede any AI project scoping
- How data readiness varies by AI task type and what the implications are

## 5.1 The Four Dimensions of Data Readiness

Data readiness is not binary. It has four dimensions, and an organization can be mature on one while being deeply unprepared on another.

**Accessibility** — can the AI system actually reach the data it needs? Accessibility includes technical access (APIs, database connections, file exports), authentication and authorization (does the service account have the right permissions?), and latency (is the access mechanism fast enough for the inference requirements?). Data that exists but cannot be reached by the AI system is not available data.

**Quality** — is the data accurate, complete, and consistent enough for the AI task? Quality standards vary by task type. A classification model that needs 90% accuracy in its predictions requires training data that is labeled with at least 95% accuracy. A recommendation system that surfaces irrelevant results because the product catalog data is incomplete will fail regardless of model quality. Quality is always relative to the use case, never absolute.

**Governance** — does the organization have the right to use the data for the AI task? Governance encompasses data ownership, consent (especially for personal data), data use agreements with third parties, and regulatory constraints on specific data types. Data that is technically accessible but not legally available for the AI use case is not usable data. Many AI projects discover late that the data they planned to train on is covered by a contractual restriction or a consent framework that does not permit AI training use.

**Documentation** — does the organization understand the data well enough to use it correctly? Documentation includes schema documentation, business glossary definitions, known quality issues, transformation history, and data lineage. Undocumented data produces models that learn the wrong things — including the artifacts of bad ETL logic, the biases in historical sampling, and the gaps in historical coverage.

## 5.2 The Data Readiness Assessment

Before scoping an AI project, conduct a data readiness assessment for each required data source. The assessment has six questions:

1. **Where does the data live?** System name, layer (Record / Engagement / Intelligence), technology stack.
2. **How is it accessed?** API, database query, file export, stream. What are the credentials and rate limits?
3. **What is the data format?** Schema, field types, encoding, known quirks.
4. **What are the known quality issues?** Ask the data owners, not the data vendor. Every team that works with enterprise data has a list of known issues.
5. **What are the governance constraints?** Data classification, consent status, contractual use restrictions, regulatory requirements.
6. **What documentation exists?** Data dictionary, lineage, transformation history, business glossary definitions.

A data source that scores poorly on any of these dimensions requires remediation work before the AI project can proceed. The remediation work is scope. It must be in the project plan and the project budget.

## 5.3 Data Readiness by AI Task Type

Different AI tasks have different data readiness requirements. Understanding the requirements for the specific task prevents over-engineering data preparation for simple tasks and under-engineering it for complex ones.

**Classification and extraction** (document classification, entity extraction, sentiment analysis) — requires labeled examples that accurately represent the classes or entities the model will encounter in production. Common gap: training data labeled by a small expert team may not represent the full distribution of real-world cases.

**Generation and summarization** (document summarization, report generation, email drafting) — requires examples of high-quality human-written output to establish quality standards for evaluation. Common gap: no curated examples exist; quality is defined subjectively by whoever reviews the output.

**Retrieval-augmented generation** (knowledge base Q&A, document search, expert assistant) — requires clean, chunked, indexed documents. Common gap: the documents exist but are in formats (scanned PDFs, proprietary binary formats, HTML with complex layouts) that require significant preprocessing before indexing.

**Forecasting and prediction** (demand forecasting, churn prediction, anomaly detection) — requires historical labeled data with sufficient coverage of the outcomes being predicted. Common gap: rare events (fraud, equipment failure, customer churn) are underrepresented in historical data, requiring augmentation strategies.

**Multi-document reasoning** (regulatory compliance, contract comparison, policy synthesis) — requires high-quality documents with clear provenance and known update cycles. Common gap: documents are scattered across systems, exist in multiple versions, and lack metadata about their authority and currency.

## 5.4 The Honest Conversation

The data readiness conversation is often uncomfortable because it surfaces organizational problems — poor data governance, technical debt in the data infrastructure, undocumented business logic — that existed before the AI project and will not be solved by the AI project. The temptation is to scope the AI project around the data quality problem rather than surfacing it.

This is the wrong approach. AI projects scoped around data quality problems inherit those problems as production defects. The model learns from bad data, produces bad outputs, loses user trust, and gets shut down. Surfacing the data readiness gap early and either fixing it or descoping the initiative is the right approach. It is also the approach that produces AI that actually ships.
