---
title: "Agile Is a Category Error for AI"
slug: "agile-is-a-category-error-for-ai"
description: "User stories, story points, and acceptance criteria break for non-deterministic systems. Here's what replaces them."
book: "AI Product Management"
series: "Chaos to Clarity"
---


![Diagram](/diagrams/substack/03-agile-vs-grounded.svg)
# Agile Is a Category Error for AI

Here is a story you have probably lived through, or watched unfold.

A team kicks off an AI feature using their standard Agile process. They write user stories. They point the stories. They commit to a sprint. Two weeks later, they report that the model is not producing acceptable results and they need another sprint. Then another. Somewhere around sprint six, someone asks whether the original estimate had any basis in reality. The honest answer is: not really. No one knew. No one could have known.

Management is frustrated. The team is demoralized. The feature is behind. And the underlying problem — the one that caused all of this — has never been named.

Here it is: **Agile is the wrong planning model for AI development.** Not because Agile is bad. Because AI is categorically different from the kind of work Agile was designed for, and applying Agile to AI produces predictable failure modes that look like execution problems but are actually modeling errors.

This is a category error. And until you name it, you will keep making it.

---

## What Agile Actually Assumes

Agile was designed for software development where the outcome is specified but the effort is uncertain. A user story says: given that I am a user who wants to do X, when I do Y, then Z happens. The requirement is defined. The acceptance criteria are deterministic. The question Agile is answering is: how long will it take to build a system that reliably produces Z?

Story points are an estimation tool for uncertain-but-knowable effort. Given a well-defined output, how much work is involved? The planning poker, the velocity tracking, the sprint commitments — all of these assume you can describe what "done" looks like before you start.

AI development inverts this assumption entirely.

With AI, the outcome is uncertain in ways that effort cannot resolve. You can spend three weeks building a classification model and discover at the end of week three that the available training data does not support the required accuracy level. That is not an estimation failure. That is a discovery that the approach does not work. No amount of better story pointing would have revealed it earlier. The information did not exist until you tried.

This is the irreducible reality of AI development: **you cannot know whether an approach works until you test it against real data.** The research phase is not planning overhead you can skip. It is the work.

When teams try to story-point AI development, three specific dysfunctions emerge.

**Inflation:** Engineers estimate the full range of possible scenarios, producing estimates so large that leadership loses confidence and requests a re-estimate. The team low-balls to survive the meeting and the problem is deferred to the sprint review.

**False precision:** Teams produce normal-looking estimates that get committed to stakeholders. When the technical exploration reveals unexpected complexity, the team misses the commitment. This happens not because engineers are bad at estimation but because they were asked to estimate something that was genuinely unknowable.

**Scope erosion:** Teams hit story point commitments by shipping whatever the model produces by the deadline, regardless of quality. The sprint is "complete" on paper. The feature is broken in practice. The quality bar — which was the whole point — was sacrificed to protect the velocity metric.

All three of these are symptoms of a single root cause: using a planning model designed for deterministic outcomes on non-deterministic work.

---


![Diagram](/diagrams/substack/03-agile-vs-grounded.svg)
## The Five Failure Modes of Applying Agile to AI

Before going into what to do instead, it is worth naming the specific places where the mismatch shows up. These are the conversations that signal a team is using the wrong model.

**Acceptance criteria that lie.** A user story might say "the model achieves 90% accuracy." But 90% accuracy on what dataset? Under what conditions? At what operating point on the precision-recall curve? Deterministic acceptance criteria import a false confidence into AI work. A model that achieves 90% accuracy on the evaluation set may perform very differently in production. The acceptance criteria passed. The feature failed.

**Velocity that measures the wrong thing.** Velocity in Agile measures throughput of defined work. In AI development, the most valuable work often produces no deployable output. A week spent discovering that an approach will not work is genuinely valuable — it eliminates a hypothesis and preserves budget. Agile velocity gives that week a score of zero.

**The sprint demo problem.** Agile's two-week demo cadence is built around showing working software. AI development has phases where the honest progress update is "we tried three approaches and none worked yet." That is good progress. It is real information. But it cannot be demoed, it cannot be pointed, and it makes stakeholders nervous in ways that pressure teams to overpromise.

**Estimation ceremonies that guess blindly.** Planning poker works because experienced engineers have a body of similar tasks to calibrate against. "Build a login page" is similar to login pages built before. "Fine-tune a language model on our proprietary document corpus to achieve sub-3-second latency on 10K concurrent users" is not similar to anything most teams have done before. The ceremony produces numbers. The numbers have no predictive value.

**Definition of Done that cannot apply.** Traditional Definition of Done criteria — code reviewed, tests passing, deployed to staging, QA signed off — do not address the central question in AI delivery: is the model good enough? "Tests passing" is a unit test concept. AI evaluation requires a holdout dataset, human review of edge cases, and alignment on what quality threshold is acceptable. These are not sprint ceremonies. They are a different planning model.

---

## Agile vs. Grounded Delivery

The Grounded Delivery framework is built around one core insight: AI development alternates between phases of bounded exploration and phases of committed delivery. The mistake is mixing them — trying to commit to scope while still exploring, or exploring indefinitely without committing to direction.

Agile is an excellent model for the delivery phases. It is the wrong model for the exploration phases. Grounded Delivery uses different tools for each.

| Dimension | Agile | Grounded Delivery |
|---|---|---|
| Planning unit | Story points | Time-boxed phases |
| Success definition | Acceptance criteria (deterministic) | Quality threshold on evaluation dataset |
| Progress measure | Velocity (throughput) | Hypotheses tested, approaches eliminated |
| Estimation basis | Historical velocity | Phase duration + gate criteria |
| When scope is locked | At sprint start | At end of Explore phase |
| Failure signal | Missed sprint commitment | Failed gate: no approach shows promise |
| Stakeholder update | Sprint demo of working software | Phase summary: what was tried, what was learned |
| Response to "it doesn't work" | Re-estimate, add sprints | Pivot to new approach or kill initiative |
| Research work | Not modeled | Explicit phase (Explore) with time-box |
| Quality gate | Definition of Done | Go/Pivot/Kill decision at each phase end |

The biggest practical difference: in Agile, scope is locked before development begins. In Grounded Delivery, scope is locked after the Explore phase, once you know which technical approach can achieve the required quality. Committing scope before exploration is complete is precisely why AI features consistently miss their estimates.

---


![Diagram](/diagrams/substack/03-agile-vs-grounded.svg)
## The Five Phases of Grounded Delivery

A brief overview of how the framework actually works.

**Phase 1: Frame (1-2 sprints)**

Align the team on the problem, the value hypothesis, and success criteria before any technical work begins. The output is a one-page Frame document: what problem are we solving, what does success look like, how will we measure it, what data do we need, and what are the kill criteria if things are not working? Not a 20-page PRD. One page.

The gate: is the problem well-enough defined and the data availability confirmed to proceed? If not, extend Frame once or stop the initiative.

**Phase 2: Explore (2-4 sprints)**

Time-boxed exploration of whether the technical approach can reach the quality threshold. The team prototypes two to three approaches against a subset of the evaluation dataset, assesses what quality is achievable with each approach, and identifies the most promising path. This phase has a hard end date.

The gate: Go (one approach shows a path to the quality threshold), Pivot (no approach works as designed, but a modified approach might), or Kill (no approach shows promise and the underlying assumption was wrong). Note that Kill is not a failure — it is the framework working. It stops a bad initiative before it consumes the full budget.

**Phase 3: Shape (3-6 sprints)**

Build the AI feature to the quality threshold specified in Frame, with scope committed based on Explore findings. This is where Agile ceremonies become genuinely useful — the what is now known, and the engineering work is the remaining uncertainty.

**Phase 4: Harden (1-2 sprints)**

Address the edge cases surfaced during Shape evaluation. Load testing, monitoring infrastructure, rollback procedures. Traditional quality assurance work with a clear scope.

**Phase 5: Operate**

Running the feature in production — monitoring model drift, managing the feedback loop, planning retraining cycles. AI features do not go static after launch. Model quality degrades as the world changes. Operate is a permanent phase, not a post-launch cleanup sprint.

---

## The Organizational Conversation You Need to Have

None of this works unless the people reviewing progress understand that AI development has a structurally different shape than traditional software development.

The most important conversation is about the Explore phase. You need stakeholders to understand — before exploration begins — that "we tried three approaches and none worked yet" is valuable progress. It is not a team that is struggling. It is a team that is eliminating hypotheses with funded research time, rather than discovering the same information in production after a failed launch.

This requires changing what success looks like during Explore. Success in Explore is not deployable software. Success is a clear, evidence-based gate decision. Go, Pivot, or Kill — with documented reasons. That decision, made well, is worth more than any amount of partially-working code.

The teams that build reliable AI products are not the ones with the best engineers. They are the ones with the clearest process for separating exploration from delivery, and the organizational maturity to run exploration phases without treating them as failure.

Agile is not the enemy. It is a precise tool for a specific job. AI development has a different job. Use the right tool.

---


![Diagram](/diagrams/substack/03-agile-vs-grounded.svg)
*This article draws from AI Product Management, a free guide at legacyforward.ai/library. It covers the full Grounded Delivery framework, evaluation-driven development, how to manage AI sprints with engineering teams, and how to communicate AI progress to non-technical stakeholders. Read it free at legacyforward.ai/library.*
