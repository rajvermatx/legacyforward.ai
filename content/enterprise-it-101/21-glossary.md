---
title: "Glossary: 50 Terms Every Non-Technical Leader Should Know"
slug: "glossary"
description: "A plain-language reference for the most important terms in enterprise technology. No jargon without explanation."
section: "enterprise-it-101"
order: 21
part: "Appendix"
---

# Glossary: 50 Terms Every Non-Technical Leader Should Know

**API (Application Programming Interface)** — A defined way for one piece of software to talk to another. APIs let systems exchange data and trigger actions without human involvement. When your CRM automatically pulls data from your billing system, it is using an API.

**Batch processing** — Running a large set of transactions or data operations all at once, on a schedule, rather than one at a time as events occur. Payroll is a classic batch process — it does not calculate your pay every second; it runs once per pay period.

**Business intelligence (BI)** — Tools and processes that help organizations analyze data and make decisions. Dashboards, reports, and data visualizations are BI outputs. Tableau, Power BI, and Looker are common BI tools.

**Change management** — The process of planning, testing, approving, and deploying changes to IT systems in a controlled way. In enterprise IT, change management exists to reduce the risk of changes causing problems in production systems.

**Cloud computing** — A model for consuming computing infrastructure (servers, storage, networking) as a service over the internet rather than owning and operating physical hardware.

**COBOL (Common Business-Oriented Language)** — A programming language created in 1959 that is still widely used in mainframe systems at banks, government agencies, and insurance companies. It is old, but it is processing trillions of dollars in transactions every day.

**COTS (Commercial Off-The-Shelf)** — Software that is built by a vendor for general sale, rather than custom-built for a specific organization. SAP, Salesforce, and Workday are COTS products.

**CRM (Customer Relationship Management)** — Software that manages an organization's interactions with customers. Salesforce is the most widely used CRM. It typically stores contact records, sales pipeline, and customer communication history.

**Data catalog** — A centralized inventory of an organization's data assets — what data exists, where it lives, what it means, and who owns it. A good data catalog makes it possible to find and trust data quickly.

**Data governance** — The policies, processes, and accountabilities that define how data is managed: who can access it, how it can be used, who is responsible for its quality, and how long it is retained.

**Data lake** — A storage system that holds large volumes of data in its raw, unprocessed form. Unlike a data warehouse, a data lake accepts any type of data — structured, semi-structured, and unstructured. Governance challenges frequently lead data lakes to become data swamps.

**Data lakehouse** — A hybrid approach combining the low-cost storage of a data lake with the structure, governance, and query performance of a data warehouse. Databricks pioneered the concept.

**Data pipeline** — An automated process that moves data from one system to another, typically performing transformations along the way. Data pipelines are how data gets from operational systems into data warehouses and AI systems.

**Data swamp** — A data lake that has accumulated data without adequate governance — no documentation, no quality controls, no catalog. Data is technically present but practically unusable.

**Data warehouse** — A database optimized for analytical queries rather than transactional processing. Data from operational systems is extracted, transformed, and loaded into the warehouse on a schedule, making it available for reporting and analysis.

**ERP (Enterprise Resource Planning)** — A category of software that manages core business processes — finance, procurement, HR, supply chain, manufacturing — in an integrated system. SAP and Oracle are the dominant vendors.

**ESB (Enterprise Service Bus)** — An integration platform that routes data between enterprise systems, handling format translation, message queuing, and routing logic. The traditional approach to enterprise integration middleware.

**ETL (Extract, Transform, Load)** — The process of extracting data from source systems, transforming it into the target format, and loading it into a destination system (typically a data warehouse). ETL is the backbone of most enterprise data infrastructure.

**Failover** — The automatic switching to a backup system or component when the primary one fails. Enterprise systems with high availability requirements are designed with failover capabilities so that a single component failure does not take down the whole system.

**Firewall** — A security control that monitors and restricts network traffic. Firewalls are a fundamental component of enterprise security architecture. They define what traffic is allowed into and out of the network.

**General ledger** — The master financial record of an organization, recording all financial transactions. The general ledger is maintained in the ERP or accounting system and is the authoritative source for financial reporting.

**Hybrid cloud** — An architecture where an organization uses both on-premises infrastructure and cloud services. Most large enterprises are hybrid, running some workloads in the cloud and some on their own hardware.

**IaaS (Infrastructure as a Service)** — The most basic cloud service model: the cloud provider supplies virtual computing infrastructure (servers, storage, networking) that the customer configures and manages.

**Integration** — A connection between two systems that allows them to exchange data. Integrations can be real-time (one system calling another's API as events occur) or batch (data transferred on a schedule).

**iPaaS (Integration Platform as a Service)** — A cloud-based integration platform that connects enterprise systems without requiring on-premises middleware. MuleSoft, Dell Boomi, and Azure Logic Apps are examples.

**Legacy system** — A system that the organization cannot easily replace or significantly modify without unacceptable risk or cost. Legacy is defined by replaceability, not age.

**Mainframe** — A type of computer designed for high-volume, high-reliability transaction processing. IBM mainframes still process the majority of the world's financial transactions.

**Master data management (MDM)** — The discipline of creating and maintaining a single, authoritative record for key business entities — typically customers, products, and employees — across multiple systems.

**Middleware** — Software that sits between two other systems and facilitates their communication. Integration platforms and enterprise service buses are forms of middleware.

**Multi-cloud** — Using services from multiple cloud providers. An organization might use AWS for one workload, Azure for another, and Google Cloud for machine learning. Multi-cloud reduces dependency on a single vendor but adds operational complexity.

**On-premises (on-prem)** — Technology infrastructure that the organization owns and operates in its own facilities, as opposed to cloud infrastructure rented from a provider.

**PaaS (Platform as a Service)** — A cloud service model where the provider manages the underlying infrastructure and runtime environment, and the customer deploys applications on top. Google App Engine is an example.

**Point-to-point integration** — Direct connections between individual systems, built independently for each pair of systems that need to communicate. Point-to-point integration works for small numbers of systems but creates spaghetti at scale.

**Procurement** — The business process of purchasing goods and services. Enterprise procurement is typically managed through the ERP system and involves vendor selection, purchase orders, goods receipt, and invoice processing.

**REST API** — The most common type of API in modern software. REST APIs use the same communication protocol as web browsers (HTTP) and are the standard for integrating modern cloud services.

**SaaS (Software as a Service)** — Software delivered over the internet as a service, typically on a subscription basis. The provider manages everything — infrastructure, application, updates. Salesforce, Workday, and Microsoft 365 are SaaS products.

**Shadow IT** — Technology that is in use within an organization but is not managed or sanctioned by the IT organization. Shadow IT emerges when official systems do not meet the needs of the people who need to work.

**Single source of truth** — The system or dataset that is designated as the authoritative record for a specific type of data. When there is only one source of truth, decisions can be made with confidence about which data to trust.

**SOAP (Simple Object Access Protocol)** — An older API standard that uses XML-formatted messages. SOAP was the dominant standard for enterprise web services in the 2000s and is still used by many older enterprise systems.

**SOA (Service-Oriented Architecture)** — An architectural pattern in which software components provide services to other components through a network, using standard protocols. SOA was the precursor to modern microservices architecture.

**System of engagement** — A system that humans interact with to do their work or interact with the organization. CRMs, customer portals, and mobile apps are systems of engagement. They typically read from and write to systems of record.

**System of intelligence** — A system that analyzes data to produce insights, predictions, or automated decisions. Data warehouses, machine learning platforms, and AI systems are systems of intelligence.

**System of record** — The authoritative source of truth for a particular type of data. The ERP is typically the system of record for financial and inventory data; the HR system is the system of record for employee data.

**Technical debt** — Deferred investment in technology quality, architecture, or infrastructure that creates ongoing cost and risk. Like financial debt, technical debt accrues interest over time.

**Uptime** — The percentage of time a system is operational and available. Enterprise systems that process critical operations are typically required to achieve very high uptime — 99.9% or higher — measured in minutes of downtime per year.

**Vendor lock-in** — The condition where the cost of switching from a vendor's technology is so high that it constrains the organization's choices. Lock-in forms through data portability limitations, process dependencies, integration complexity, and skills concentration.

**Virtualization** — The creation of virtual versions of hardware resources — servers, storage, networks — that can be managed independently of the underlying physical hardware. Virtualization is the technology foundation of cloud computing.

**VSAM (Virtual Storage Access Method)** — A file storage method used on IBM mainframes. VSAM datasets are a common way that mainframe systems store and access data. Integrating with VSAM data requires mainframe-specific knowledge and tooling.
