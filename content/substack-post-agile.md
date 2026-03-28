---
title: "Agile Is Broken for AI. Stop Pretending Otherwise."
slug: "post-agile-delivery"
description: "Agile was built for deterministic systems. AI is not one. The industry needs a new delivery methodology."
date: "2026-03-15"
relatedPillar: "post-agile-delivery"
---

# Agile Is Broken for AI. Stop Pretending Otherwise.

## BLUF

Agile was designed for deterministic systems — software where the same input produces the same output every time. AI and LLM systems are non-deterministic by nature. The industry is forcing fundamentally different work into a methodology that assumes predictable, repeatable outcomes, and wondering why AI projects keep failing. This is not a process improvement problem. It is a category error. We need a Post-Agile delivery methodology built from the ground up for the reality of non-deterministic systems.

---

I need to say something that will make a lot of Scrum Masters uncomfortable.

Your sprints are not working for AI projects. Your user stories do not make sense for LLM outputs. Your acceptance criteria are a fiction when applied to non-deterministic systems. And your velocity metrics are measuring the wrong thing entirely.

This is not an attack on Agile. Agile was a genuine revolution for software delivery. It solved real problems. It replaced bloated waterfall processes with something that actually worked for building deterministic systems — applications where you define an input, write the logic, and get a predictable output. For twenty years, it has been the right tool for the job.

But AI is a different job.

## The Category Error

Here is the core problem nobody wants to name: Agile assumes deterministic outputs. Every ceremony, artifact, and metric in the Agile toolkit is built on the assumption that when you write code, it does what you told it to do. Every time. Predictably.

AI and LLM systems do not work that way. The same prompt can produce different outputs on different runs. The quality of an answer depends on context, training data, retrieval accuracy, and factors that resist simple measurement. "Done" is not a binary state when your system produces probabilistic results.

Try writing a user story for an AI agent: "As a customer service manager, I want the AI agent to resolve customer complaints effectively." What does done look like? What are the acceptance criteria? "The agent gives good answers" is not testable in any meaningful sense. "The agent resolves 85% of complaints" sounds measurable until you realize that complaint complexity varies, resolution is subjective, and the same complaint might get a different response tomorrow than it gets today.

This is not a refinement problem. You cannot backlog-groom your way out of non-determinism.

## The Sprint That Does Not Sprint

Watch what happens when enterprise teams try to run AI projects in two-week sprints.

Sprint 1: The team spends the entire sprint evaluating three different LLM providers, testing prompt strategies, and building a proof of concept. The demo is impressive. Stakeholders are excited. Velocity looks great on paper.

Sprint 2: The team discovers that the POC does not handle edge cases. The LLM hallucinates on certain input types. They spend the sprint on prompt engineering and evaluation — work that does not map to any story point estimate because nobody knows how long it takes to make a non-deterministic system behave reliably.

Sprint 3: Integration with the legacy system of record reveals that the data quality assumptions from the POC were wrong. The team pivots. The burndown chart is a disaster. Management asks why velocity dropped.

Sprint 4: The team is pulled into a "get back on track" meeting. Someone suggests adding more resources. The Scrum Master facilitates a retro where the conclusion is "we need better story estimation." Nobody says the obvious thing: the methodology does not fit the work.

I have watched this pattern repeat across multiple industries. The POC succeeds. The project fails. Leadership blames execution. But execution was never the problem — the delivery framework was.

## Vibe Coding Makes It Worse

Here is the twist that is making this problem accelerate: AI-enabled IDEs and vibe coding are producing code faster than ever. Cursor, Copilot, Windsurf — engineers can generate working prototypes in hours instead of weeks.

This feels like progress. It is not.

Faster code production is not faster value delivery. When a developer uses an AI IDE to scaffold an entire integration layer in an afternoon, that code carries assumptions. It assumes greenfield. It does not know about your legacy constraints, your integration boundaries, or the fact that the downstream system only speaks SOAP and flat files. It does not understand your data governance requirements or your operational reality.

What vibe coding actually does is compress the time between "we had an idea" and "we have a demo" — which means teams hit the real problems faster, with more code to untangle and more stakeholder expectations to manage. The gap between "it works on my machine" and "it works in production against real enterprise systems" is getting wider, not narrower.

Speed without architectural intent is just technical debt at scale. And Agile, as currently practiced, has no mechanism to govern this.

## What Post-Agile Actually Means

Post-Agile is not anti-Agile. It is not a return to waterfall. It is an acknowledgment that non-deterministic systems require a fundamentally different delivery approach. Here is what that looks like in practice:

**Experimentation as a first-class phase.** Not a spike buried in a sprint. Not a research ticket that gets deprioritized. A structured phase with its own governance, its own success criteria, and its own exit conditions. You do not commit to building until you have validated that the non-deterministic system can meet threshold performance within your constraints.

**Probabilistic quality gates.** Binary pass/fail testing does not work for LLM outputs. You need evaluation frameworks that measure output quality across distributions, not individual assertions. "This function returns the correct value" becomes "this system produces acceptable outputs 94% of the time across this evaluation set, with failure modes that fall within defined risk tolerances."

**Value validation loops instead of feature acceptance.** Stop asking "did we build the feature?" Start asking "is the system producing value?" These are fundamentally different questions when the system's behavior varies with every invocation.

**Dual governance.** Real enterprise AI systems have both deterministic and non-deterministic components. The API layer is deterministic. The LLM response is not. Your delivery methodology needs to handle both — applying traditional engineering rigor where it works and probabilistic evaluation where it does not.

**Guardrails for AI-accelerated development.** If your team is vibe coding, you need architectural checkpoints that traditional Agile does not provide. Speed is not the enemy. Ungoverned speed is.

## The Industry Gap

The consulting firms will sell you an AI strategy deck. The cloud vendors will sell you their platform. The Agile coaches will tell you to "adapt the framework." The blogs will tell you about the latest agent framework.

Nobody is connecting value identification, delivery methodology for non-deterministic systems, and legacy coexistence into a single coherent approach. These are not three separate problems. They are one problem with three dimensions, and solving any one of them in isolation is why most enterprise AI initiatives stall.

This is what I am building with LegacyForward — a practitioner's framework and AI-powered platform that addresses all three dimensions together. Not because I read about it in a research paper, but because I have led enough enterprise transformations to know that the current playbook does not work for what comes next.

The organizations that figure this out first will not just be better at AI. They will be better at capturing value from technology investments period. The ones that keep forcing non-deterministic work into deterministic processes will keep producing impressive demos that never make it to production.

The future of enterprise AI delivery is Post-Agile. The only question is how many failed sprints it takes before your organization admits it.

---

*Building the Post-Agile delivery framework at LegacyForward. More at legacyforward.ai.*

**If this resonated, subscribe to LegacyForward for the next piece in this series — where I break down why most enterprise AI initiatives capture zero operational value, and how to fix that.**

---

Substack Tags: Post-Agile, Enterprise AI, AI Transformation, Legacy Modernization, AI Delivery, LLM, Digital Transformation, Technology Leadership, Vibe Coding, Non-Deterministic Systems

Substack Subtitle: Agile was built for deterministic systems. AI is not one. The industry needs a new delivery methodology.
