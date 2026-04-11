---
title: "The Three Layers: Record, Engagement, Intelligence"
slug: "three-layers"
description: "Enterprise systems are organized in three distinct layers that serve different purposes. Understanding these layers is the foundation of understanding how data moves through an organization."
section: "enterprise-it-101"
order: 2
part: "Part 01 The Foundation"
---

# The Three Layers: Record, Engagement, Intelligence

One of the most useful mental models for understanding enterprise technology is the idea of three distinct layers: systems of record, systems of engagement, and systems of intelligence. Each layer has a different job. Each layer has different technical characteristics. And each layer has a different relationship to the other two.

Most enterprise complexity comes from the interactions between these layers — data flowing (or failing to flow) from one to another, systems designed in one layer being asked to do the job of another, or projects that underestimate how hard it is to move information across the boundaries.

## Systems of Record

A system of record is the authoritative source of truth for a particular type of data in an organization.

When a customer places an order, somewhere in the enterprise there is a system that records that order — the canonical, official, definitive record. When an employee is hired, somewhere there is a system that holds the authoritative record of their employment. When a product is manufactured, somewhere there is a system that tracks the inventory. These are systems of record.

Systems of record tend to share certain characteristics. They are old. They are stable. They are designed for reliability above all else — the most important thing they do is not lose data. They often have rigid data structures, because the structure of the data is part of the business contract: an order has these fields, a product has those fields, and changing the fields requires a careful process because everything downstream depends on them.

The most common systems of record in large enterprises are enterprise resource planning systems (ERP), which we will cover in detail in Chapter 5. Other examples include core banking systems in financial services, electronic medical record systems in healthcare, and claims management systems in insurance.

The critical thing to understand about systems of record is that they are authoritative. If the system of record says a customer has five hundred units of inventory, that is the official answer — regardless of what any other system might say. This authority comes with significant responsibility: these systems must be correct, they must be consistent, and they must be available.

## Systems of Engagement

A system of engagement is what people actually interact with to do their work or to interact with the organization.

The gap between systems of record and systems of engagement is often enormous. The system of record might be a mainframe application from 1985 that can only be accessed through a terminal emulator — essentially, a text-based interface that looks like a black screen with green or amber text. Almost no one in the organization can actually use this system directly. Instead, they use a system of engagement: a modern web application, a mobile app, a customer portal, a call center tool.

The system of engagement presents information in a way that humans can work with. It pulls data from the system of record, displays it in a readable format, and writes changes back. It is the face of the technology stack — the part that users see.

Customer relationship management (CRM) systems like Salesforce are a good example of a system of engagement. The customer's actual account record might live in an old banking or billing system, but the sales team interacts with the customer data through Salesforce — a modern, usable interface that reads from and writes to the underlying systems.

The challenge with systems of engagement is that they add a layer of complexity. Now you have two systems that need to stay in sync. Changes made in the system of engagement need to make it back to the system of record. Data in the system of record needs to be accessible to the system of engagement. And if there are multiple systems of engagement — a web portal, a mobile app, a call center tool — they all need to present consistent information.

## Systems of Intelligence

A system of intelligence is a system that takes data from systems of record and systems of engagement, analyzes it, and produces insights, predictions, or decisions.

This layer has grown dramatically with the rise of data analytics, machine learning, and AI. Historically, "intelligence" in enterprise technology meant reporting: dashboards, data warehouses, business intelligence tools that helped executives understand what was happening in the business. Today it means much more: machine learning models that predict customer churn, algorithms that detect fraud, AI systems that automate decisions.

Systems of intelligence are consumers of data. They do not typically create or manage the authoritative record — they read from it. Their value comes from what they can derive from the data: patterns, predictions, anomalies, recommendations.

The challenge for systems of intelligence is getting clean, consistent, complete data from the layers below. This is the source of almost every "AI project runs into data problems" story you will ever hear. The data in the system of record might be accurate for operational purposes but structured in ways that are difficult to analyze. There might be gaps — periods where data was not collected, or was collected differently. There might be inconsistencies between systems of record for different parts of the business.

## How Data Flows Between the Layers

Understanding the three layers is valuable. Understanding how data flows between them is essential.

In a well-designed enterprise, data flows in a relatively coherent path. Transactions happen and are recorded in systems of record. Systems of engagement read from those records and enable people to do their work. Data from both layers is extracted, transformed, and loaded into the intelligence layer, where it can be analyzed.

In reality, the flow is rarely this clean. Data gets duplicated across systems. Systems of engagement maintain their own local copies of data that drift out of sync with the system of record. Intelligence systems work from stale data because the pipeline to refresh it runs overnight, not in real time. Multiple systems of record exist for the same type of data because of acquisitions or departmental decisions made without central coordination.

This is why, when someone says "we want to build an AI system on top of our enterprise data," the first and most important question is not "which AI model should we use?" It is: "what does the data landscape actually look like across these three layers, and what would it take to get clean, consistent data into the intelligence layer?"

The answer to that question determines almost everything about how hard the AI project will be.
