---
title: "Prologue: The LegacyForward.ai Framework"
slug: "prologue"
description: "Most AI features fail not because the technology is wrong, but because the teams building them are using frameworks designed for a different kind of software."
section: "building-ai-products-that-ship"
order: 0
part: "Prologue"
---

## The Problem

The standard PM toolkit was designed for deterministic software. Add a feature, and the feature works. The same input produces the same output, every time. You can write acceptance criteria, run regression tests, and call something done.

AI does not work that way. Outputs are probabilistic. Quality degrades over time without anyone touching the code. Edge cases appear in production that weren't in any test set. A model that passes evaluation on Monday fails in a way nobody predicted by Thursday. And the cost of running these features doesn't go away after launch — it compounds.

So teams ship features that look great in demos and get quietly removed six months later because nobody can justify the inference bill, or because the outputs degraded and nobody built the monitoring to catch it, or because the user behavior change they were betting on never materialized.

This book exists because the PM frameworks most teams reach for were written before this problem existed.

## The LegacyForward Framework

Three pillars. Each one addresses a specific place where AI product work breaks down.

**Signal Capture** is about what you choose to build, and why. Most organizations have more data than they can interpret and fewer clear signals than they think. Before any feature gets resources, Signal Capture asks: what decision gets better because this exists? What outcome changes, in a way a finance team would recognize? Without a clear answer, AI projects drift from interesting to expensive to abandoned — usually in that order.

**Grounded Delivery** is about how you build once you've decided to. Language models hallucinate. Recommendation systems degrade. Computer vision fails on edge cases that weren't in the training set. None of that is surprising — the question is whether your planning process accounts for it. Grounded Delivery is the methodology for writing acceptance criteria on outputs that aren't binary, estimating velocity on teams doing evaluation work, and telling stakeholders the truth about what "done" means for an AI feature.

**Legacy Coexistence** is the one most strategies skip. Your data lives in systems built in 2009. Your users have workflows that predate LLMs. Your team runs on processes designed for a stack that looked nothing like what you're deploying now. Rip-and-replace fails at a rate that should embarrass anyone who still pitches it. Legacy Coexistence is the framework for designing AI that works with what's already there.

## How This Book Applies It

Every chapter maps onto one or more pillars.

Signal Capture becomes your value hypothesis — the thing you stress-test before writing a line of spec, before booking a discovery sprint, before anyone commits engineering time. Grounded Delivery becomes your planning methodology — how you scope, estimate, and set expectations on a type of work where "it depends on what the model does" is always part of the answer. Legacy Coexistence becomes your integration strategy — the honest accounting of what existing systems, workflows, and habits your feature has to live alongside rather than replace.

The three aren't a sequence. They run in parallel, and the tension between them is where the real PM work happens.

---

Learn more at [legacyforward.ai](https://legacyforward.ai)
