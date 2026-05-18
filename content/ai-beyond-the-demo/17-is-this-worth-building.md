---
title: "Is This Worth Building? — Value Hypothesis and Portfolio Prioritization"
slug: "is-this-worth-building"
description: "The most important question in AI product management is the first one: is this worth building? Most teams answer it too quickly. Here is the discipline for answering it rigorously."
section: "ai-beyond-the-demo"
order: 17
part: "Part II — Strategy and Leadership"
---

Part II — Strategy and Leadership

# Is This Worth Building? — Value Hypothesis and Portfolio Prioritization

Product managers for AI face a problem their counterparts in traditional software did not: the output quality is probabilistic, the data dependency is severe, and the cost structure is often unclear until the system is running. These characteristics make the "is this worth building?" question harder and more important than in traditional product development. Teams that skip this question — that move directly from idea to implementation — consistently discover the answer is "no" after months of development.

### What You Will Learn

- The value hypothesis framework for AI features and products
- The three types of AI product bets and how to evaluate each
- The portfolio prioritization model for an AI product backlog
- The signals that tell you a feature is ready to scope versus ready to kill

## 17.1 The Value Hypothesis

A value hypothesis for an AI feature has three components:

**The user problem:** A specific, observable problem experienced by a specific, identifiable user. Not "customers are dissatisfied" but "support agents spend an average of 12 minutes per ticket manually searching the knowledge base, and 40% of tickets require escalation because the answer was not found in time."

**The AI contribution:** What the AI will do to address the problem, and at what accuracy level the contribution becomes valuable. "An AI that suggests relevant knowledge base articles for each incoming ticket, with 80% relevance at the top result, would eliminate most manual search time and reduce escalation rates."

**The value delivered:** The measurable outcome that results when the AI performs as hypothesized. "Reducing average handle time by 8 minutes per ticket across 500 agents would save 4,000 agent-hours per month and reduce escalation costs by an estimated $X."

A hypothesis that cannot be stated this precisely is not ready for scoping. The imprecision is information — it tells you what is not yet understood about the problem.

## 17.2 Three Types of AI Product Bets

AI product decisions fall into three categories with different risk profiles and evaluation criteria:

**Efficiency bets:** AI that automates or accelerates existing workflows without changing their outcome. Document classification, email summarization, form pre-population, scheduled report generation. Low risk (failure is contained to the efficiency gain not materializing), easy to measure (time saved, error rate reduction), and good candidates for quick-win investment.

**Quality bets:** AI that changes the quality of outcomes in existing workflows — better recommendations, more accurate decisions, fewer errors. Medium risk (failure means the quality improvement does not materialize and the investment was wasted), requires baseline measurement to evaluate (you need to know how good the current process is to measure improvement), and appropriate for capability-builder investment.

**Transformation bets:** AI that enables outcomes that were not possible before — new product categories, new business models, new customer capabilities. High risk (the hypothesis must be validated before scaling investment), hard to measure (no baseline exists for something that did not exist before), and appropriate for staged strategic-bet investment.

Most AI product portfolios should be weighted toward efficiency bets (quick value, builds capability and confidence) with selective investment in quality and transformation bets.

## 17.3 Portfolio Prioritization

Prioritizing an AI product backlog requires trading off value, risk, feasibility, and strategic fit. The prioritization model:

**Score value:** How much value will this feature create if the hypothesis is correct? Use the value hypothesis framework — specific, measurable outcomes.

**Score confidence:** How confident are we that the hypothesis is correct? Has it been validated with users? With data? With a prototype?

**Score feasibility:** How hard is this to build given current data, integration, and organizational readiness? Use the data readiness assessment and integration pattern analysis from Part I.

**Score strategic fit:** Does this feature build capability that enables future AI investment? Does it align with the AI strategy from Chapter 13?

Priority = (Value × Confidence) / (1 + Feasibility Cost) × Strategic Fit Multiplier

This is a framework for structured conversation, not a precise formula. The value of writing down scores is that it surfaces disagreements about assumptions — which are the conversations worth having before committing to build.

## 17.4 When to Kill the Idea

Not every idea should be built. The signals that tell you an AI feature is ready to kill rather than scope:

- The value hypothesis cannot be stated specifically and measurably after two rounds of refinement
- The data required does not exist or is not accessible
- The user who would benefit has said they would not use the output in the stated form
- The feasibility cost is higher than the value created
- Three similar features have already been built and not adopted

Killing ideas before scoping is not failure — it is the appropriate application of Signal Capture to the product backlog. Resources redirected from low-signal ideas to high-signal ones deliver more value than resources spread across everything.
