---
title: "APIs: The Connective Tissue"
slug: "apis"
description: "APIs are how modern systems talk to each other. Understanding what APIs are, how they work, and why they fail is fundamental to understanding enterprise integration — and enterprise AI."
section: "enterprise-it-101"
order: 9
part: "Part 02 The Modern Layer"
---

# APIs: The Connective Tissue

If you have heard the term API — Application Programming Interface — and nodded along without being entirely sure what it means, you are not alone. API is one of those terms that gets used constantly in technology conversations and rarely explained well.

![Diagram](/diagrams/enterprise-it-101/ch09-api.svg)

Here is the plain-language version: an API is a defined way for one piece of software to talk to another.

That is it. An API is an agreement between two systems about how they will communicate. System A sends a request in a specific format. System B receives the request, does something, and sends back a response in a specific format. Both sides know what to expect because the API defines the protocol.

## A Simple Analogy

Think of a restaurant. The kitchen is one system. You are another. The waiter is the API.

You do not walk into the kitchen and start cooking. You interact with the waiter — you say what you want, in the format the restaurant expects (you look at a menu, you give your order verbally or in writing), and the waiter carries that request to the kitchen. The kitchen does its work and sends back a response — the food — through the same channel.

The API is the waiter. It defines what requests are valid (you can order anything on the menu, not anything in the world), what format the request should be in (you say "I'll have the salmon" not "give me the pink fish"), and what the response will look like (food on a plate, not raw ingredients).

Different systems have different APIs — different menus, different ordering conventions. An organization with many systems has to manage many different APIs, each with its own protocol.

## Types of APIs

The most common type of API you will encounter in modern enterprise environments is a REST API — Representational State Transfer. REST APIs use the same communication protocol as web browsers (HTTP), are relatively simple to use, and have become the standard for most modern software. When one cloud service wants to talk to another, it almost always uses a REST API.

Older enterprise systems often use different types of APIs. Web services built in the early 2000s frequently use SOAP — Simple Object Access Protocol — which is more verbose and complex than REST but was the standard of its era. Many ERP and mainframe systems expose their data through even older mechanisms: batch file exports, message queues, or proprietary protocols that require specialized connectors.

This diversity of API types is one of the practical challenges in enterprise integration. A modern AI application built using REST APIs needs to integrate with an ERP system that speaks SOAP and a mainframe that exports flat files. Each integration requires different technical approaches and different expertise.

## Why Enterprise APIs Break

In consumer technology, APIs are often treated as products. Google's Maps API, Stripe's payment API, Twilio's messaging API — these are carefully documented, stable, versioned, and treated as revenue-generating products in their own right. When they change, there is a formal deprecation process with advance notice.

In enterprise technology, APIs are often an afterthought. A system exposes an API because it needs to connect to something else, not because the API is designed for broad reuse. Documentation is incomplete. The API is not versioned, so changes can break integrations without warning. Performance and availability are not guaranteed in the way they would be for a commercial API product.

The result is that enterprise integrations are fragile. They work when conditions are exactly right, and they break when something changes: the underlying system is updated, the data format shifts, the authentication mechanism changes, or the system is simply unavailable when the integration tries to connect.

This fragility is a significant operational burden. Someone has to monitor integrations, identify when they break, diagnose the problem, and fix it. In organizations with many integrations, this becomes a continuous maintenance effort.

## The Integration Layer

Large enterprises often have an integration platform — sometimes called an enterprise service bus (ESB), an integration platform as a service (iPaaS), or simply middleware — that sits between systems and manages the connections between them.

Instead of System A connecting directly to System B, both systems connect to the integration platform. The platform handles routing, translation (converting data from one system's format to another's), error handling, and monitoring. When an integration breaks, the problem is visible in the integration platform, not buried somewhere in the connection between two systems.

The integration platform is an important component of enterprise architecture, but it adds its own complexity. It needs to be managed, monitored, and maintained. The mappings between systems — the rules that translate data from one format to another — accumulate over time and can become difficult to understand.

## What This Means for AI

Every AI system that needs to read from or write to enterprise systems will interface with APIs. Understanding the API landscape of the organization is essential to understanding what is feasible for an AI project.

The key questions are practical: Does the system you need data from have an API? Is that API documented? Is it performant enough to support real-time AI use cases, or is it only suitable for batch queries? Is the API stable, or does it change frequently in ways that would break integrations?

For many AI use cases, the right answer is not to call enterprise APIs directly in real time, but to create a data pipeline that extracts data from source systems at a cadence (hourly, daily), transforms and cleans it, and stores it in a format optimized for AI queries. This adds a layer of complexity, but it also insulates the AI system from the fragility of direct API connections to enterprise systems.

Understanding APIs is not about writing code. It is about understanding how data moves between systems — and where the connective tissue is strong versus where it is about to tear.
