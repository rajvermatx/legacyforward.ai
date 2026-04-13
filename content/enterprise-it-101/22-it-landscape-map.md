---
title: "The IT Landscape Map"
slug: "it-landscape-map"
description: "A plain-language guide to how the enterprise technology layers connect — from foundation to intelligence — and where AI enters the picture."
section: "enterprise-it-101"
order: 22
part: "Appendix"
---

# The IT Landscape Map

The chapters of this book covered the enterprise technology landscape in sequence: foundation first, then modern layers, then sprawl, then AI. This appendix brings those pieces together into a single coherent map. Use it as a reference when you need to orient yourself quickly to how the layers connect.

![Diagram](/diagrams/enterprise-it-101/ch22-it-landscape-map.svg)

## The Five-Layer Model

Enterprise technology can be organized into five layers, each building on the one below it.

---

### Layer 1: Infrastructure

**What it is:** The physical and virtual computing resources, including servers, storage, networking, and data centers, that everything else runs on.

**On-premises:** Servers and network equipment owned and operated by the organization in its own data centers. Managed by infrastructure teams. High upfront cost, full control.

**Cloud:** Computing resources rented from providers (AWS, Azure, Google Cloud). Variable cost, consumed on demand. Managed by the provider for physical infrastructure. The organization manages what runs on top.

**Hybrid:** Most large enterprises run a combination. Some workloads stay on-premises (regulatory requirements, cost, legacy constraints). Others move to cloud (scalability, modern services, managed operations).

**Key insight:** Infrastructure is a foundation, not a differentiator. What matters is what runs on top of it, and whether the infrastructure meets the reliability, security, and performance requirements of the workloads it supports.

---

### Layer 2: Core Systems (Systems of Record)

**What it is:** The authoritative sources of business truth: the systems that hold the data the organization depends on.

**ERP:** Finance, procurement, inventory, manufacturing, HR. The operational spine. SAP and Oracle dominate. Deeply integrated, expensive to change, holds decades of data.

**Core banking / industry-specific platforms:** For regulated industries, including banking cores, insurance policy administration, healthcare EMRs, and government benefits systems. Often mainframe-based or built on legacy platforms. Process the highest-stakes transactions.

**HR systems:** Employee records, payroll, benefits, performance. Workday and SAP SuccessFactors are common in large enterprises.

**Key insight:** Core systems are the hardest to change and hold the most valuable data. They are the primary source of data for analytics and AI, and also the primary source of data access challenges.

---

### Layer 3: Engagement and Workflow (Systems of Engagement)

**What it is:** The systems people actually interact with: the faces of the enterprise technology stack.

**CRM:** Customer records, sales pipeline, support history. Salesforce dominates. The engagement layer for customer-facing processes.

**Collaboration tools:** Email, calendar, messaging, document management. Microsoft 365 and Google Workspace are dominant. These are systems of engagement for internal work.

**Portals and applications:** Customer-facing websites, employee self-service portals, mobile apps. These sit on top of core systems and present their data in usable form.

**Workflow platforms:** Tools that manage processes such as routing approvals, tracking tasks, and managing service requests. ServiceNow is the enterprise standard for IT service management.

**Key insight:** Systems of engagement are the most visible and the most changeable. They are where user experience improvements happen. They read from and write to core systems through integrations.

---

### Layer 4: Integration (The Connective Tissue)

**What it is:** The mechanisms that move data between layers: the plumbing.

**Point-to-point integrations:** Direct connections between two specific systems. Fast to build, fragile at scale. The source of most integration spaghetti.

**Integration platforms (ESB, iPaaS):** Centralized middleware that routes data between systems, handles format translation, and provides monitoring. More complex to set up, much more manageable at scale.

**Event streaming:** High-volume, real-time data movement. Apache Kafka is the most widely used platform. Used when data needs to move in milliseconds and at very high volume.

**Batch ETL:** Scheduled data extraction and loading. The backbone of most data warehouse pipelines. Runs on a schedule (nightly, hourly) rather than in real time.

**Key insight:** Integration is where most enterprise projects underestimate complexity and cost. The integration layer is the reason that "just connect these two systems" is never as simple as it sounds.

---

### Layer 5: Data and Intelligence (Systems of Intelligence)

**What it is:** The infrastructure that holds data for analysis and the systems that derive intelligence from it.

**Data warehouse:** Structured, schema-on-write storage optimized for analytical queries. Holds historical, cleaned, analysis-ready data. Snowflake, BigQuery, and Redshift are the modern platforms.

**Data lake / lakehouse:** Storage for raw and semi-processed data, including unstructured types. The lakehouse model adds structure and governance on top of lake storage.

**Business intelligence:** Dashboards, reports, and visualization tools that help humans understand what the data says. Tableau, Power BI, Looker.

**AI and machine learning:** Systems that learn from historical data to make predictions, classifications, recommendations, or automated decisions. These run on top of the data infrastructure, reading training data from the warehouse or lake and writing outputs back into engagement systems or directly into processes.

**Key insight:** AI lives here, at the top of the stack. Its quality depends entirely on the quality of the layers below: the data in the core systems, the reliability of the integrations, and the governance of the data infrastructure. No amount of model sophistication compensates for weak foundations.

---

## How a Single Business Event Flows Through the Stack

To see how these layers connect in practice, follow a customer order through the map.

A customer places an order through the **engagement layer** (an e-commerce portal). The order is recorded in the **core system** (ERP). The recording triggers an **integration** that notifies the warehouse management system to pick and ship the goods. A separate **ETL batch job** runs overnight, extracting the order record into the **data warehouse**. A week later, an **AI model** trained on historical orders uses this data, along with thousands of similar orders, to update its demand forecasting, which feeds into an **integration** that adjusts future purchase orders in the ERP.

One customer order. Five layers. Multiple integrations. Days from event to AI insight.

This is the enterprise technology landscape. Not clean, not fast, but functional. It is full of data that AI can learn from, once you understand the map.
