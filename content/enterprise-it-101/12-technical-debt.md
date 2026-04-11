---
title: "Technical Debt Is a Balance Sheet Item"
slug: "technical-debt"
description: "Technical debt is not just a software engineering concept. It is a real financial and operational liability that accumulates on every deferred decision. Understanding it helps leaders make better tradeoff choices."
section: "enterprise-it-101"
order: 12
part: "Part 03 The IT Sprawl Problem"
---

# Technical Debt Is a Balance Sheet Item

The term "technical debt" was coined by software developer Ward Cunningham in 1992 to describe a specific phenomenon: when you take a shortcut in software development — writing code that solves the immediate problem but is not quite right — you create a debt. Like financial debt, it accrues interest. The longer you carry it, the more it costs you.

![Diagram](/diagrams/enterprise-it-101/ch12-technical-debt.svg)

The concept has expanded beyond its original meaning. Today, technical debt refers broadly to any deferred decision or deferred investment in technology that creates ongoing cost or risk. It is not just about code quality. It is about infrastructure that is past its end of life, systems that have not been upgraded, integrations that were built quickly and never properly stabilized, documentation that was never written, security patches that were deferred, architecture decisions that made sense at the time but now constrain what the organization can do.

## The Interest Metaphor

The interest metaphor is worth dwelling on because it explains why technical debt is so insidious.

When an organization takes on financial debt, the interest is visible. It shows up on financial statements. It is tracked and reported. There is institutional accountability for managing it.

When an organization takes on technical debt, the interest is largely invisible. It does not appear on any report. It is not tracked. It accumulates in the form of slower development velocity, more time spent on maintenance rather than new capabilities, more incidents and outages, and more expensive projects when it eventually becomes necessary to modernize.

The interest compounds. A system that is five years out of date is manageable. A system that is fifteen years out of date, that has accumulated fifteen years of customizations and integrations and undocumented business logic, is significantly harder to modernize. The longer the debt goes unaddressed, the more expensive it becomes to eventually pay it off.

## Forms of Technical Debt

Technical debt manifests in several distinct ways in enterprise environments.

**Code debt** is the original meaning: software that works but is written in ways that make it hard to understand, modify, or maintain. The code accomplishes its purpose, but the way it accomplishes it is convoluted, undocumented, or built on outdated patterns. Every time someone needs to change it, they spend extra time understanding it first, and the risk of introducing a bug is higher than it would be with cleaner code.

**Infrastructure debt** refers to hardware and software infrastructure that is past its recommended life or end of vendor support. Servers running operating systems that no longer receive security updates. Databases running versions that the vendor no longer patches. Network equipment that is past its replacement cycle. Infrastructure debt creates security risk — vulnerabilities that are known but cannot be patched — and operational risk, because aging hardware fails more frequently.

**Architecture debt** is accumulated from decisions that were appropriate at the time they were made but now constrain what is possible. A system designed for a few hundred concurrent users that now serves tens of thousands. An integration approach that worked for ten systems but becomes unmanageable at fifty. An authentication model built before security requirements became what they are today. Architecture debt is often the most expensive to address because fixing it requires redesigning, not just maintaining.

**Documentation debt** is perhaps the most underappreciated form. When a system is built, the people who build it understand how it works. When those people leave, that understanding goes with them unless it was documented. In enterprises, systems often outlast the people who built them by decades. Documentation debt means that when something breaks, when someone needs to modify the system, or when an AI initiative needs to understand what business rules the system enforces, nobody knows — and finding out is slow and expensive.

## Who Pays for Technical Debt

One of the structural challenges of technical debt is that the people who accrue it are often not the people who pay for it.

A development team under pressure to ship a feature quickly writes code that works but creates debt. The team moves on. The debt is inherited by whoever maintains the system in the future — which may be a different team, or the same team under different management, several years later. The pressure that created the debt is not felt by the people who eventually pay it off.

This is not a moral failing. It is a structural consequence of how technology work is organized and evaluated. When teams are measured on short-term delivery and not on the long-term health of the systems they build, the rational response is to optimize for short-term delivery.

Changing this requires treating technical debt as a real organizational liability — something that is tracked, reported to leadership, and factored into planning. Some organizations do this formally: engineering teams maintain a register of known technical debt, estimate the cost of addressing each item, and dedicate a portion of each development cycle to debt reduction.

## Technical Debt and AI

Technical debt creates specific challenges for AI initiatives.

First, it constrains data access. AI needs data. Data lives in systems. If those systems are heavily burdened with technical debt — undocumented interfaces, fragile integrations, inconsistent data formats — getting data out of them for AI purposes is significantly harder.

Second, it creates risk for AI-adjacent modernization. Many AI initiatives require some modernization of the underlying systems — better APIs, more real-time data, cleaner data models. If those systems are carrying significant technical debt, the modernization work is more complex and more risky, because the debt needs to be understood and addressed as part of the work.

Third, AI systems themselves can accumulate technical debt rapidly. A machine learning model that is trained and deployed but never maintained — not monitored for performance degradation, not retrained as the underlying data changes, not documented so that someone else can understand how it works — is technical debt. The responsible thing to do when deploying AI is to include a plan for its ongoing maintenance, which many organizations do not do.

Technical debt is not glamorous. It does not make headlines. But it is one of the most significant factors in determining how fast and how successfully an organization can move on AI and modernization. Taking it seriously is a mark of organizational maturity.
