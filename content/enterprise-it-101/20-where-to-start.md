---
title: "Where to Start: Finding the Signal in the Sprawl"
slug: "where-to-start"
description: "With a complex, layered, imperfect enterprise IT landscape, where do you actually start with AI? A practical framework for identifying the seams where AI can deliver real value without requiring a transformation first."
section: "enterprise-it-101"
order: 20
part: "Part 04 Where AI Lands"
---

# Where to Start: Finding the Signal in the Sprawl

After twenty chapters of honest accounting — legacy systems, technical debt, integration spaghetti, vendor lock-in, data swamps, and governance gaps — it would be easy to conclude that enterprise AI is too hard and the landscape too broken for anything to work.

![Diagram](/diagrams/enterprise-it-101/ch20-where-to-start.svg)

That conclusion would be wrong.

Enterprise AI is working. It is working at scale, in large organizations, delivering real and measurable value. Not everywhere, not easily, and not in the way the vendor presentations suggest — but it is working. The organizations doing it successfully share a common approach: they start where the conditions are right, not where the ambition is highest.

This chapter is a practical guide to finding those places.

## The Signal Capture Mindset

The first mental shift required is from "what is the most exciting AI application we could build?" to "where is AI value genuinely achievable given what we have?"

This distinction matters enormously. The most exciting AI application might require integrating five legacy systems, cleaning three years of data, and redesigning a process that involves four departments. That project will take years, cost more than expected, and has a meaningful chance of failure.

A less exciting AI application — one that works with data that is already clean and accessible, that fits into an existing process without requiring redesign, and that solves a problem that the business actually feels acutely — might take months, cost a fraction of the ambitious project, and has a high chance of delivering real value.

The less exciting project is almost always the better starting point. Success builds credibility. Credibility builds organizational capacity for more ambitious work. An enterprise AI practice built on a series of successful smaller applications is far more durable than one that staked everything on a transformational flagship project.

## Four Criteria for a Good Starting Point

A good starting AI use case in an enterprise context meets four practical criteria.

**The data is accessible.** The data required for the AI application already exists in a system that can be accessed without a major integration project. It is reasonably clean, reasonably complete, and can be extracted on a schedule that supports the use case. You may need to do some data preparation, but you are not starting with a data migration.

**The outcome is measurable.** There is a clear, quantifiable metric that the AI application is expected to improve. Processing time. Error rate. Cost per transaction. Customer satisfaction score. If you cannot measure the outcome before and after, you cannot demonstrate that the AI worked — and demonstrating that it worked is how you build support for the next initiative.

**The process has a natural AI integration point.** The AI output — a prediction, a recommendation, a classification, an automated action — can be incorporated into the existing process without requiring the process to be redesigned from scratch. There is a natural place for the AI to add value: before a human makes a decision, after a document arrives, when a threshold is triggered. The simpler the integration into the existing process, the better.

**The scope is bounded.** The use case is specific enough that it can be delivered by a small team in a reasonable timeframe. Not "improve customer service," but "reduce the time to classify incoming support tickets by department." Not "optimize the supply chain," but "flag purchase orders that exceed historical price benchmarks for this supplier." Specific, bounded scope makes delivery achievable and learning possible.

## Where to Look

With those criteria in mind, there are categories of enterprise problems where these conditions frequently align.

**Document processing and classification.** Enterprises process enormous volumes of documents: invoices, contracts, claims, applications, reports. Many of these require human review to classify, extract information from, or route to the right person. AI is well-suited to this work — documents are already in digital form, the classification categories are usually well-defined, and the value of automation (speed, consistency, cost) is measurable. The data is the documents themselves, which are usually accessible.

**Anomaly detection in transaction data.** Transactional systems generate enormous volumes of structured data. Identifying anomalies — unusual transactions, outlier patterns, deviations from historical norms — is a task that AI handles well and that humans handle poorly at scale. Fraud detection in financial systems, unusual expense reports, procurement orders that deviate from historical patterns — all of these are areas where AI can add significant value with data that is usually already available.

**Predictive maintenance.** For organizations with physical assets — manufacturing equipment, fleet vehicles, infrastructure — predicting when maintenance is needed before failure occurs is valuable and often achievable with sensor data that is already being collected. The business case is clear (reduced downtime, lower maintenance costs), the data exists, and the integration point is well-defined (maintenance scheduling system).

**Internal search and knowledge retrieval.** Many enterprises have enormous volumes of internal documentation, policies, procedures, and institutional knowledge that is difficult to find when it is needed. AI-powered search and retrieval — helping employees find the right document, the right policy, the right answer — is an application that works with data already in the organization, requires no integration with operational systems, and delivers clear value that users experience directly.

**Report generation and summarization.** The time people spend reading, synthesizing, and writing reports is significant in most enterprises. AI that can summarize lengthy documents, generate first drafts of standard reports, or extract key information from structured data sources can save real time on work that is well-understood and measurable.

## What to Avoid

The flip side of the criteria above is a list of conditions that suggest a use case is not the right starting point.

Avoid use cases where the data required is in systems with poor data quality, no API, or no clear access path. Avoid use cases where the outcome is hard to measure or where success criteria are vague ("improve strategic decision-making"). Avoid use cases that require redesigning a major process before AI can be deployed. Avoid use cases that depend on integrating many systems simultaneously.

These are not permanently off the table. They are for later — after the organization has built experience, demonstrated value, and developed the organizational capacity to handle more complex work.

## Starting Is Not Waiting

One final point. The analysis and criteria above are meant to help identify the right starting point, not to create an endless planning cycle that delays any action.

The organization that never starts because the data is not quite ready, the process is not quite right, or the use case is not quite ambitious enough will never build the capability to tackle harder problems. At some point, you have to start with what you have, learn from it, and improve.

The goal is to start in a place where success is genuinely achievable — not to wait for perfect conditions that will never arrive. Enterprise AI landscapes are never clean. They are always complicated. The organizations that lead in AI are not the ones with the cleanest data or the most modern stack. They are the ones that learned to move forward within the constraints of the stack they have, while steadily improving it over time.

That is the stack beneath the signal. Learn it. Work with it. And find the value inside it.
