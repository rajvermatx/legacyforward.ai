---
title: "How Sprawl Happens: M&A, Shadow IT, and Organic Growth"
slug: "how-sprawl-happens"
description: "No CIO planned for forty-seven overlapping systems. IT sprawl is the residue of thousands of reasonable decisions made without full visibility into the larger picture."
section: "the-stack-beneath-the-signal"
order: 11
part: "Part 03 The IT Sprawl Problem"
---

# How Sprawl Happens: M&A, Shadow IT, and Organic Growth

No CIO ever sat down and decided to build a technology landscape with forty-seven overlapping systems, three conflicting sources of truth for customer data, and integration spaghetti that nobody fully understands. Sprawl is the accumulated outcome of thousands of reasonable decisions made over time by people solving immediate problems without full visibility into the larger picture.

![Diagram](/diagrams/enterprise-it-101/ch11-sprawl.svg)

Three mechanisms drive most of it.

## Mergers and Acquisitions

When one company acquires another, it inherits that company's technology landscape in its entirety. Not just the systems the acquired company was planning to keep — everything. The ERP system they were in the middle of replacing. The custom application one department built fifteen years ago. The data warehouse that was never quite finished. The SaaS tools that fourteen different teams signed up for independently.

Post-merger integration is supposed to consolidate the two landscapes into one. In practice it is expensive, disruptive, and almost always slower than the plan assumed. The systems being consolidated are deeply integrated with business processes that cannot be interrupted. The people who actually understand the acquired company's systems often leave. The timeline stretches.

A global organization that has done twenty acquisitions over twenty years may be running five different ERP instances, three different HR systems, and customer data spread across four CRMs. Each was inherited from a different acquisition, at different stages of a consolidation plan that gets deprioritized every year in favor of more urgent work.

## Shadow IT

Shadow IT grows whenever official systems fail to meet the needs of the people doing the work.

A team needs a capability that IT says will be delivered in eighteen months. They find a SaaS tool that does most of what they need and sign up. A manager needs a report the official system cannot generate, so they build it in Excel. A department needs to share files with an external partner, but the access control process would take weeks, so they use a personal file-sharing service instead.

Each individual decision is defensible. The cumulative effect is a technology layer that IT does not fully know about, cannot manage, and cannot control. When an organization tries to map its data landscape for an AI initiative, shadow IT is the most common source of surprises. Critical data sits in unofficial systems that nobody cataloged, owned by individuals who may have since left.

## Organic Team-Level Growth

This one is quieter than M&A and less visible than shadow IT. It is the simple accumulation of tools at the team or department level over time.

A team starts with a need. They find a tool. The tool works, so they use it more. They add a second tool that integrates with the first. A new hire arrives and brings something from their last company. Over five years, a team of ten people has built a micro-ecosystem of eight tools. Four are redundant with something the organization already pays for. Two are critical to daily operations. None was ever reviewed by IT security.

Multiply this across every team in a large organization and the math becomes obvious — even if no single decision was wrong.

## Why Sprawl Persists

The cost of cleaning up sprawl is always immediate and concrete. The benefit of a cleaner landscape is diffuse and hard to quantify.

Consolidating two CRM systems requires a migration project: time, money, disruption, risk of data loss, and the change management effort to get people actually using the new system. The benefit — less duplication, cleaner data, lower maintenance cost — is real, but it accumulates slowly across many future projects and is almost impossible to attribute directly to the consolidation work.

So leadership consistently prioritizes new capabilities over landscape rationalization. Every year something more urgent appears. The rationalization project defers again. The sprawl continues, and the cost of eventually addressing it grows.

## What Sprawl Costs

The cost is distributed and mostly invisible. It surfaces in a few places.

**License waste.** Organizations regularly pay for software they are not using, or pay multiple times for tools that do the same thing. IT asset management audits consistently find meaningful savings from decommissioning redundant subscriptions.

**Integration maintenance.** Every connection between two systems requires ongoing maintenance. More systems means more connections. More connections means more people spending time keeping fragile pipelines alive instead of building new things.

**Data quality drift.** Data synchronized across many systems through fragile integrations loses consistency over time. The more systems hold the same data, the harder it is to know which one is authoritative — or whether any of them is.

**Project drag.** Every new initiative has to navigate the existing landscape: understanding dependencies, securing access, building integrations. Sprawl is a tax on everything the organization tries to do.

For AI initiatives, that tax is particularly expensive. AI needs clean, consistent, well-understood data. Sprawl is the primary reason that data is often none of those things.
