---
title: "The Complete Enterprise AI Practitioner"
slug: "compendium-prologue"
description: "How nine practitioner books become one sequenced journey — and how to use this compendium to navigate it."
section: "legacyforward-compendium"
order: 0
part: "Prologue"
---

Prologue

# The Complete Enterprise AI Practitioner

This compendium exists because enterprise AI is not one problem. It is at least nine.

There is the infrastructure problem: AI runs on top of the enterprise IT stack, and if you do not understand that stack — its legacy debt, its integration spaghetti, its data quality gaps — you cannot place AI correctly. There is the strategy problem: executives make billion-dollar bets on AI without a shared vocabulary for what it can and cannot do. There is the product problem: product managers who have never shipped a probabilistic system must now own roadmaps built on one. There is the architecture problem: enterprise architects who spent two decades designing deterministic systems must now reason about non-deterministic ones. There is the analyst problem: BAs and QAs whose workflows assumed stable requirements must adapt to systems that change every time a model is updated. And there are the frontier problems: graph databases that unlock relationship reasoning LLMs cannot do, and Large Concept Models that operate at a fundamentally different level of abstraction than the token-based systems most practitioners know.

The LegacyForward.ai catalog addresses each of these problems in a dedicated book. This compendium synthesizes all nine into a single, sequenced journey.

## The LegacyForward Framework

Every book in this catalog is organized around three pillars. Understanding them is the prerequisite for using the compendium well.

**Signal Capture** is the discipline of finding real enterprise value before committing to build. Most AI projects fail not because the technology does not work but because the wrong problem was chosen. Signal Capture asks: is there a genuine signal here — a problem that matters, data that exists, a user who will act on the output — or is this a demonstration looking for a business case? Throughout this compendium, Signal Capture appears as the discipline of asking "is this worth building?" before asking "how do we build it?"

**Grounded Delivery** is the discipline of shipping AI in real enterprise environments — with legacy constraints, compliance requirements, integration dependencies, and organizational politics that no vendor demo accounts for. Grounded Delivery is the antidote to the lab-to-production gap. It asks: what does "done" actually mean for an AI feature in a regulated, auditable, legacy-constrained enterprise? And what does the path from prototype to production actually look like?

**Legacy Coexistence** is the recognition that enterprise AI does not replace the existing stack — it extends it. The mainframe still runs the payroll. The ERP still holds the record of truth. The data warehouse still defines the analytical layer. AI lands on top of all of this, and the practitioners who succeed are the ones who design for coexistence rather than replacement. Legacy Coexistence appears throughout this compendium as a structural constraint on every architecture decision, every product roadmap, and every migration strategy.

## How to Use This Book

This compendium is sequenced as a learning journey. Each part builds on the one before it. The sequencing is not arbitrary — it reflects the dependencies between concepts that exist whether or not you follow them in order.

**Part I — The Enterprise Foundation** starts with IT because you cannot place AI without understanding what it runs on. Every AI project inherits the technical debt, sprawl, and data quality problems of the existing stack. Practitioners who skip this foundation consistently underestimate implementation timelines, overestimate data readiness, and are surprised by integration costs.

**Part II — Strategy and Leadership** comes next because strategy without IT context produces vaporware, but strategy before building ensures practitioners understand *why* before *how*. The chapters here are drawn from the AI for Business Leaders and AI Product Management books — they address the executive framing, investment decision frameworks, organizational readiness questions, and product prioritization tools that determine which AI initiatives get funded and which get cancelled.

**Part III — The Practitioner's Toolkit** bridges strategy to hands-on work. LLM fundamentals, prompt engineering, RAG pipelines, requirements elicitation, test generation, evaluation-driven development — this is the "get your hands dirty" section. It is written for analysts, PMs, and engineers who need to work *with* AI systems, not just direct them from a distance.

**Part IV — Enterprise AI Architecture** follows naturally: once you know what LLMs can do (Part III), you design systems around them. Data architecture for AI, MLOps, GenAI patterns, cloud platforms, migration strategies, cost engineering, security, observability — this is the system design layer where enterprise architects live.

**Part V — Agentic Systems** builds on Part IV's architectural foundation. Agents require RAG (covered in Part III), tool use, orchestration, and production deployment patterns from Part IV. They also require a different mental model than single-call LLM applications — one where the system plans, executes, observes, and corrects across multiple steps without human intervention between them.

**Part VI — Advanced AI Patterns** covers graph databases and Large Concept Models — two paradigms that extend what is possible beyond the standard LLM stack. GraphRAG builds on RAG from Part III. LCMs are an architectural alternative to LLMs that becomes meaningful only after you understand what LLMs can and cannot do. Both are covered last because both assume fluency with the foundations.

**Part VII — Capstones** consolidates twelve high-value projects from across the catalog. Each capstone applies the compendium's full knowledge to a specific, realistic enterprise scenario. They are placed at the end so readers can bring the whole journey to bear on each project.

*One deliberate sequencing note:* Security (Part IV, Chapter 42) arrives after agentic foundations are introduced in Part III but before the deep agentic chapters in Part V. This is intentional — security context should precede building multi-agent systems, not follow it.

## Where to Start If You Are Not Starting at Page One

Not every reader needs to start at Chapter 1. Here are three recommended entry points:

**If you have an IT or infrastructure background** and understand the stack but are new to AI strategy and products → Start at Part II, Chapter 11: *What AI Actually Does (and What It Doesn't).*

**If you already understand AI basics and need to start building** → Start at Part III, Chapter 21: *How LLMs Work — No PhD Required.* The chapters before it will still be here when you want the strategic context.

**If you are an architect or engineer already fluent with LLMs and RAG** and want to move into advanced patterns → Start at Part V, Chapter 45: *What Is Agentic AI?* or jump directly to Part VI, Chapter 53: *The JOIN Wall* for graph patterns.

## A Note on Depth

Each chapter in this compendium is a synthesis — it draws on one or more of the nine source books and distills the most actionable content for a practitioner who is reading the full journey. For any topic where you need greater depth — more code, more worked examples, more decision trees — the source book is the right next step. The compendium is a complete reference; the individual books are deep dives.

The nine source books are: *The Stack Beneath the Signal: Enterprise IT Explained*, *The AI-First Enterprise*, *AI for Business Leaders*, *AI Product Management*, *Agentic AI: Build, Ship, Portfolio*, *The Analyst's AI Toolkit*, *Graph Databases for AI*, *Large Concept Models: The Practitioner's Guide*, and *A Practitioner's Guide to Enterprise AI Transformation*. All are available free at legacyforward.ai.

Now. Let us begin with the stack.
