---
title: "Is This Worth Building?"
slug: "is-this-worth-building"
description: "The most expensive AI features are the ones that pass every technical review and fail at the user need. Here's how to catch them before you build."
section: "building-ai-products-that-ship"
order: 1
part: "Part 01 Value"
badges:
  - "Value Hypothesis"
  - "Signal Capture"
---

# Is This Worth Building?

## The Question Nobody Wants to Ask

A certain kind of product meeting happens dozens of times a week at technology companies. Someone — a VP, a founder, a well-meaning senior engineer — says some version of: "We should add AI to this." Maybe they saw a competitor demo. Maybe they just got back from a conference. The idea gets into the roadmap, and three months later a team is deep in the weeds of a feature that nobody stress-tested at the idea level.

![Diagram](/diagrams/ai-pm/ch01-1.svg)

The most valuable skill a product manager can develop right now is the ability to stop that meeting and ask the question that saves companies millions of dollars and months of engineering time: *Does this problem actually need AI?*

AI is expensive to build, hard to maintain, difficult to test, and prone to failure modes that traditional software never encounters. Every hour spent validating whether AI is the right tool is an hour that protects your team from building the wrong thing. That's not skepticism — it's the job.

## Two Very Different Things AI Can Do

The first mistake PMs make when evaluating AI features is treating "AI" as a single category of capability. For product decision-making, there are two fundamentally different things an AI-powered feature can do, and they require different kinds of justification.

**Automation** uses AI to do something a human already does — faster, cheaper, or at greater scale. The task is understood, the output is defined, and the value comes from removing cost or friction. An AI that reads invoices and extracts line items is automating a known task. An AI that categorizes support tickets is automating a known task. The signal you're in this territory: you could write a rubric for what "correct" looks like.

**Transformation** uses AI to do something that wasn't possible before — or that would only have been possible for the most resourceful organizations. An AI that synthesizes a year of customer feedback into a prioritized list of product themes isn't just automating reading; it's creating a qualitative capability most teams simply didn't have. An AI that surfaces churn risk before any human signal appears is producing information that didn't previously exist in actionable form.

Automation cases live and die on economics and accuracy. Transformation cases live and die on whether users trust and act on what the AI surfaces. Both are worth building under the right conditions. But how you validate them, what metrics you track, and what risks you're managing are completely different things.

## The Unlimited Humans Test

The most clarifying question you can ask about an AI feature idea:

**If you had unlimited, infinitely patient, highly skilled humans available at zero cost, could they do this job instead?**

If yes — and the motivation for AI is cost or speed — you're looking at automation. The AI replaces human labor. That's a legitimate thing to build, but your success criteria, risk framework, and ROI all need to be anchored to that economic logic. You need the cost per unit of work today, the cost per unit with AI, and the accuracy threshold below which the automation creates more problems than it solves.

If no — the task requires synthesizing more information than any team could process, or making connections across datasets no individual could hold in their head — you're looking at transformation. The value isn't labor substitution; it's capability creation.

If the answer is "sort of, but it would take too long" — pay attention. This is the gray zone where many of the most valuable AI features live. A human could review every customer session recording to find friction patterns, but you have ten thousand sessions per week. A human could read every competitor's documentation, but there are forty competitors updating constantly. The AI doesn't do the impossible; it makes the impractical operationally viable. That's automation at scale, and it needs different framing than pure transformation.

## The Signal Capture Test: 5 Questions

Before any AI feature advances from conversation to discovery, run it through these five questions.

**Question 1: What is the specific user pain, and how does the user experience it today?**

Vague answers are disqualifying. "Users find it hard to get insights" is not a specific pain. "Users spend 4 hours each week manually pulling data from three systems to build a report they use for exactly one decision" is. The more precisely you can describe the current-state experience — how long it takes, how often it fails, what workarounds people use — the more clearly you can evaluate whether AI changes that experience or just adds complexity to it.

**Question 2: What does "the AI worked" look like in concrete terms?**

If you can't describe success in observable, measurable terms before you build, you won't be able to evaluate it after. "The recommendation is useful" is not a success criterion. "The user takes an action based on the recommendation within 24 hours, and that action correlates with improved outcome X" is. Vagueness here is a warning sign, not a design choice.

**Question 3: What's the cost of being wrong?**

Every AI feature has failure modes. The question isn't whether the AI will sometimes be wrong — it will — but what happens when it is. An AI recommendation that leads to an irreversible decision that harms the user is a catastrophic failure mode. An AI classification that's wrong 8% of the time but users can easily correct is manageable. The acceptable error rate is a product decision, not a technical parameter.

**Question 4: What data does this require, and do you have it?**

AI features are built from data, not logic. What kind of data does the AI need? Does it exist? Is it accessible, of sufficient quality, and something your organization is permitted to use for this purpose? Many promising feature ideas die here — not because the concept is wrong, but because the data foundation doesn't exist and can't be assembled at realistic cost and timeline.

**Question 5: What's the simplest non-AI solution, and why isn't it good enough?**

Most PMs skip this because it feels like it undermines the AI idea. It doesn't — it strengthens it. Articulating the best possible non-AI approach (a rule engine, a simple algorithm, a better UI, a workflow change) and explaining precisely why it falls short is the most rigorous justification you can make for choosing AI. If you can't articulate why the non-AI solution is insufficient, you haven't made the case yet.

## Decision Table: AI vs. Traditional Software by Feature Type

| Feature Type | Traditional Approach | AI Adds Value When... | Warning Sign |
|---|---|---|---|
| Search and filtering | Database queries, faceted filters | Relevance requires understanding intent, not just keyword matching | Users can already find what they need with filters |
| Categorization / tagging | Rule engine, dropdown menus | Categories are fuzzy, content varies widely, volume is high | You have fewer than 20 clear categories with explicit rules |
| Summarization | None (users read themselves) | Content volume is too high for human reading; signal is buried in noise | Users prefer reading original content; summaries lose critical context |
| Recommendations | Popularity ranking, manual curation | Personalization matters; individual preferences diverge significantly | All users benefit from the same content; catalog is small |
| Anomaly detection | Threshold alerts, static rules | Normal behavior varies by context; patterns are multivariate | A simple threshold catches most of the cases you care about |
| Content generation | Templates, manual authoring | Volume is high; personalization matters; human authoring bottleneck is real | One or two people can produce this content well at current scale |
| Prediction / forecasting | Historical averages, trend lines | Patterns are complex, multivariate, and change over time | A three-month moving average is already accurate enough |
| Process automation | Workflow tools, RPA | Inputs are unstructured (documents, images, freeform text) | Process is already structured; inputs follow consistent templates |

The warning signs column is the one to read carefully. A warning sign doesn't mean don't build it — it means stop and honestly pressure-test the need before committing.

## Chasing Signal vs. Chasing Excitement

Signal Capture asks a specific question before any feature gets resources: are you responding to a genuine signal from users, or to excitement about the technology?

A genuine signal looks like this: users consistently take a painful workaround to accomplish something, and when you describe an AI-powered version that removes that workaround, they lean forward. Or: a high-value segment isn't using your product for a category of work they're doing elsewhere, and the reason is a capability gap AI can plausibly fill.

A false signal looks like this: no user has ever complained about the problem you're solving. Or the problem exists but users are satisfied with their current solution. Or the feature demos beautifully but doesn't fit into the workflow where the actual decision gets made.

The Signal Capture test isn't passed by proving the AI can do the thing. It's passed by validating that the thing, done well, changes user behavior in a way that creates measurable business value.

## The Anti-Pattern: Solution Looking for a Problem

Every experienced PM has seen this pattern: a team falls in love with a technology and works backward to find a problem it can solve. In the AI era, this is especially dangerous because the technology is genuinely impressive, demos well, and generates real organizational excitement.

The tells are consistent. Teams in this pattern spend more time describing what the AI does than what the user problem is. They measure success by model metrics — accuracy, latency, benchmark scores — rather than user outcomes. They frame competitive risk as "we'll fall behind if we don't have AI" rather than "users will switch to a competitor that solves X better." And when you ask what a user does differently because the feature exists, the answer is vague.

The solution-looking-for-a-problem pattern doesn't just waste resources. It consumes engineering capacity that could go to genuine user needs, creates technical debt in features nobody uses, and trains the organization to evaluate ideas by how impressive they sound rather than what problem they solve.

## Pre-Discovery Checklist

Before an AI feature idea moves from backlog into active discovery work, it should clear this checklist. Each "no" is a blocker — resolve it by doing more research, reframing the feature, or pulling it from consideration.

| Checkpoint | Question | Status |
|---|---|---|
| Problem clarity | Can you describe the user pain in specific, observable terms? | Yes / No / Needs research |
| Success definition | Can you describe success in measurable, behavioral terms? | Yes / No / Needs research |
| Non-AI alternative | Have you articulated why the best non-AI solution is insufficient? | Yes / No / Not yet done |
| Data foundation | Do you know what data is required and that it's accessible? | Yes / No / Needs research |
| Error cost | Have you mapped the failure modes and their impact on users? | Yes / No / Needs research |
| Signal type | Is this automation, transformation, or scaled automation? | Identified / Unclear |
| User signal | Have real users expressed this pain or desire, not just internal stakeholders? | Yes / No / Needs research |

A feature that clears all seven has earned the right to move into discovery. A feature that can't clear the first two hasn't been defined well enough to evaluate.

## Organizational Pressure

Sometimes the pressure to build an AI feature doesn't come from user demand. It comes from a new executive who wants AI in the roadmap, a board presentation that needs to show AI investment, or a competitor who launched something and triggered a company response. These pressures are real. Pretending they don't exist isn't useful.

The right response isn't to abandon the Signal Capture test — it's to apply it transparently and share the results. If a genuine user need exists and AI is the right solution, you have a clear path forward. If the feature is primarily driven by competitive anxiety rather than user need, leadership needs to hear that, framed constructively: here's what would need to be true for this to create real user value, and here's what we need to validate before committing.

The most valuable thing a PM can do in an AI-first product environment is be the person who asks the right questions before the costs are committed, before the team is locked in, and before the feature becomes someone's organizational identity. Disciplined early filtering is what separates teams that build the right things from teams that build impressive demos that users never adopt.
