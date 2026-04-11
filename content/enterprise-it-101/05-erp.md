---
title: "ERP: The Spine of the Enterprise"
slug: "erp"
description: "Enterprise Resource Planning systems are the central nervous system of most large organizations. Understanding what they do — and why changing them is so hard — is fundamental to understanding enterprise IT."
section: "enterprise-it-101"
order: 5
part: "Part 01 The Foundation"
---

# ERP: The Spine of the Enterprise

If you work at or with a large organization and wonder why things take so long, why processes require so many approvals, or why connecting a new system to the existing infrastructure seems so difficult — there is a good chance ERP is involved.

Enterprise Resource Planning, or ERP, is the category of software that manages the core business processes of an organization. Finance. Procurement. Human resources. Supply chain. Manufacturing. Project management. An ERP system is designed to hold all of these functions together in a single, integrated system — or at least a closely connected family of systems — so that the data flows coherently between them.

The dominant ERP vendors are SAP and Oracle. Between them, they power the back-office operations of a very large share of the global economy. When a large manufacturer wants to know its total inventory position across forty factories in twenty countries, it asks SAP. When a global retailer wants to see which purchase orders are outstanding, it asks Oracle. When a government agency needs to run payroll for fifty thousand employees, it is probably running a version of one of these systems — or a specialized equivalent built for the public sector.

## What ERP Actually Does

The best way to understand ERP is to follow a business transaction through an organization and see all the places it touches.

Imagine a manufacturing company receives a customer order. Here is what needs to happen:

The order needs to be recorded in the sales system. Credit needs to be checked — does this customer have an outstanding balance that should hold the order? If the goods are in inventory, they need to be reserved. If they need to be manufactured, a production order needs to be created. Raw materials need to be checked — is everything needed in stock, or do purchase orders need to be placed with suppliers? When the goods ship, a delivery record needs to be created, the inventory needs to be reduced, and an invoice needs to be generated. When the invoice is paid, the payment needs to be applied to the customer's account and recorded in the general ledger.

Each one of these steps involves data. And all of that data needs to be consistent — the inventory level used when the production order is created needs to be the same inventory level the warehouse team sees when they go to pick the goods.

An ERP system is designed to manage all of these steps in an integrated way, with a single shared data model. The customer order in sales, the production order in manufacturing, the purchase order in procurement, and the invoice in finance all refer to the same transaction, tracked through its lifecycle.

## Why ERP Is So Hard to Change

ERP systems are notoriously difficult and expensive to implement and to change. Large ERP implementations are the subject of case studies in project management failure — projects that ran years over schedule, hundreds of millions of dollars over budget, and in some cases had to be abandoned.

Understanding why helps explain a lot about enterprise IT dynamics.

**They touch everything.** Because ERP integrates so many business functions, a change in one area can have ripple effects across others. Change how the system records a purchase order, and you may affect the way accounts payable processes invoices, the way the general ledger closes the month, and the way the audit trail is maintained. Testing every change requires understanding all of these interdependencies.

**They encode business processes.** An ERP system is not just a database. It is an implementation of how the organization runs its business. When you configure an ERP system, you are making decisions about how procurement works, how approvals flow, how inventory is valued. Those decisions become embedded in the software. Changing them later requires not just a technical change but an organizational one — getting people to work differently.

**Customizations accumulate.** ERP vendors ship a standard product, but most large organizations modify it extensively to match their specific processes. Over years, these customizations pile up. When a vendor releases a new version of the software, the organization has to decide whether to apply the customizations to the new version — which is expensive — or stay on the old version. Many organizations end up years behind on ERP versions because the cost of upgrading is too high, which eventually means they are running software the vendor no longer supports.

**Data quality issues surface during implementation.** When an organization implements or upgrades an ERP system, it has to migrate data from existing systems. This process almost always reveals data quality problems that were invisible before: customer records with missing fields, inventory counts that do not match physical counts, supplier records that are duplicated. Cleaning up this data is time-consuming, and the problems discovered are often politically sensitive — because they reveal that business processes have not been followed consistently.

## ERP and AI

ERP systems hold some of the richest operational data in an enterprise. Financial data, supply chain data, procurement data, workforce data — all of it is potentially valuable for AI applications: demand forecasting, spend analysis, workforce planning, anomaly detection in financial transactions.

The challenge is getting that data out. Modern ERP systems from SAP and Oracle have APIs and data export capabilities, but they are complex. The data model inside an ERP is sophisticated — a single business object like a sales order might be spread across dozens of database tables, each of which needs to be understood to reconstruct the complete picture.

There is also the question of what the data means. ERP data is rich with configuration-dependent values — codes, flags, and statuses that mean different things depending on how the system is configured. Understanding what those values mean requires knowing how the specific organization has configured its ERP instance, which is often documented poorly.

Despite these challenges, ERP data is worth the effort. Organizations that succeed in getting clean, well-understood ERP data into their AI pipelines unlock significant analytical and predictive capability. The work is front-loaded — understanding the data model takes time — but the payoff is access to the most accurate operational data the organization has.
