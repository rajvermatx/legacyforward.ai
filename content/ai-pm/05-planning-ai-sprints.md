---
title: "Planning AI Development"
slug: "planning-ai-sprints"
description: "Story points assume predictable effort. AI development is fundamentally exploratory — you often can't know how long an approach will take until you've tried it. This chapter introduces the Grounded Delivery framework as an AI planning model, explains how to time-box research phases, run Go/Pivot/Kill gates, and report honest progress when 'we tried three approaches and none worked yet' is genuinely meaningful information."
section: "ai-pm"
order: 5
part: "Part 03 Delivery"
badges:
  - "Grounded Delivery"
  - "AI Planning"
---

# Planning AI Development

## Why Story Points Don't Work


![Diagram](/diagrams/ai-pm/ch05-1.svg)
Story points are an estimation tool designed for a specific kind of work: development tasks where the effort is uncertain but the outcome is known. Given a well-defined requirement, how much effort will it take to build a system that satisfies it? The uncertainty is in the effort; the output is specified.

AI feature development inverts this. The outcome is uncertain in ways that the effort cannot resolve. You can spend three weeks building a classification model and discover, at the end of week three, that the available data does not support the required accuracy level. That is not a story point estimation failure. It is a discovery that the approach does not work, and no amount of better estimation would have revealed it earlier.

When teams try to story-point AI development, one of three dysfunctions occurs.

The first is inflation: engineers estimate in story points the full range of possible scenarios, producing estimates so large that leadership loses confidence and requests a re-estimate. The second is false precision: teams produce normal-looking estimates that get committed to stakeholders, and then fail to meet them when the technical exploration reveals unexpected complexity. The third is scope creep: teams hit story point commitments by shipping whatever the model produces by the deadline, regardless of quality. The quality bar was the most important thing.

> **Think of it like this:** Planning AI feature development with story points is like estimating how long it will take to find your keys. You can estimate how long you are willing to look. You cannot estimate how long it will actually take, because that depends on information you do not have yet. What you can do is decide that if you have not found them in 20 minutes, you will try a different strategy, such as the spare key or calling a locksmith. Time-boxed phases, not point-estimated tasks, are the right planning unit.

## The Grounded Delivery Framework

Grounded Delivery is the LegacyForward framework for AI feature development planning. It structures AI work into five phases, each with a specific purpose, time-box, and gate decision at the end. The phases are: Frame, Explore, Shape, Harden, and Operate.

The core insight of Grounded Delivery is that AI development alternates between phases of bounded exploration and phases of committed delivery. Mixing these phases, trying to commit to scope while still exploring, or exploring indefinitely without committing to direction, produces the pathologies that plague most AI feature delivery.

### Phase 1: Frame (1–2 sprints)

**Purpose:** Align the team on the problem, the value hypothesis, and the success criteria before any technical work begins.

**Activities:**
- Finalize the value hypothesis and probabilistic success criteria (Chapter 2)
- Complete the evaluation dataset specification (Chapter 5)
- Define the kill criteria for this initiative
- Assess data availability and quality
- Produce a technical risk assessment: what are the open questions, and what would need to be true for each approach to work?

**Gate decision:** Is the problem well-enough defined, the data availability confirmed, and the success criteria agreed upon to proceed to Explore? If not, either extend Frame (once) or kill the initiative.

**Output:** A shared one-page Frame document: value hypothesis, success metrics, evaluation set design, kill criteria, and known risks. Not a 20-page PRD. One page.

A common failure in Frame is treating it as a planning phase rather than an alignment phase. The goal is not to produce a complete development plan. It is to ensure the team has a shared understanding of what they are trying to accomplish, how they will know if it worked, and when they will stop if it does not.

### Phase 2: Explore (2–4 sprints)

**Purpose:** Determine whether the technical approach can reach the quality threshold, using time-boxed experimentation.

**Activities:**
- Prototype 2–3 approaches against a subset of the evaluation dataset
- Assess feasibility of each approach: what quality is achievable, at what cost, at what latency?
- Identify the most promising approach based on early results
- Surface any data gaps or quality issues that would prevent reaching the threshold

**Gate decision:** Has one approach demonstrated sufficient promise to warrant a Shape phase commitment? Options: Go (at least one approach shows a path to the quality threshold), Pivot (no approach works as designed, but a modified approach might), Kill (no approach shows promise; fundamental assumption was wrong).

**Output:** An Explore summary: what was tried, what results each approach produced, which approach is recommended for Shape, and what remaining technical risks exist.

The Explore phase is where the "we tried three approaches and none worked yet" progress reports come from. This is legitimate, honest progress reporting. It reduces the solution space and provides information that future work will depend on. The organizational challenge is helping stakeholders understand that negative results in Explore are valuable outputs, not failures.

**Time-box discipline:** The Explore phase must have a hard end date. Without it, Explore becomes infinite research and the initiative never reaches committed delivery. If the team reaches the end of Explore without identifying a viable approach, the gate decision is Kill or a defined second Explore phase with explicit new hypotheses to test.

### Phase 3: Shape (3–6 sprints)

**Purpose:** Build the AI feature to the quality threshold specified in the success criteria, with scope committed based on Explore findings.

**Activities:**
- Implement the winning approach from Explore to production quality
- Build the product layer (UX, integrations, APIs) that surfaces the AI output to users
- Evaluate against the full evaluation dataset, iterating to reach quality threshold
- Address the known edge cases from the evaluation set
- Complete monitoring and observability infrastructure

**Gate decision:** Does the feature meet the quality threshold on the evaluation set? Does the product layer correctly surface AI outputs and handle edge cases? Options: Go to Harden, Pivot (approach is close but needs modification), Kill (quality threshold is unachievable with this approach).

**Output:** A feature that meets the quality threshold in a controlled environment, with monitoring in place, ready for hardening.

Shape is the phase where traditional sprint planning can be used, because the technical approach is now committed and the remaining work is largely implementation rather than exploration. Story points, sprint goals, and velocity tracking are appropriate here in ways they are not in Explore.

### Phase 4: Harden (2–3 sprints)

**Purpose:** Validate that the feature works at production quality with real users before full release.

**Activities:**
- Limited beta release to a representative user cohort (not just early adopters)
- Monitor quality metrics in production — does the model perform as well on real user inputs as on the evaluation set?
- Address production-specific issues: distribution shift, edge cases not covered by the evaluation set, latency under real load
- Validate the behavioral outcomes from the value hypothesis: are users actually changing behavior as predicted?
- Confirm operational monitoring and alerting is functioning correctly

**Gate decision:** Do the production quality metrics match the evaluation set quality? Is the behavioral outcome validated? Options: Go to full Operate, extend Harden (once, with specific improvement targets), Roll back (quality in production is materially worse than evaluation set performance).

**Output:** Confirmation that the evaluation set accurately predicted production quality, and that user behavior in production matches the hypothesis.

Harden is where many teams discover the gap between evaluation quality and production quality. The evaluation dataset was not perfectly representative. Real user inputs have patterns the evaluation set did not cover. The right response is to update the evaluation set with production examples and iterate, not to declare the quality metrics misleading.

### Phase 5: Operate (ongoing)

**Purpose:** Maintain and improve feature quality in production, monitor for drift, and respond to quality degradation.

**Activities:**
- Monitor quality metrics continuously against the defined thresholds
- Detect and respond to distribution shift — changes in user input patterns that degrade model performance
- Update prompts, retrieval systems, or models in response to quality drift
- Add new evaluation examples from production observations
- Assess whether the feature is achieving the long-term business outcome in the value hypothesis

**Gate decision (quarterly):** Is the feature still delivering its intended value? Is the ongoing investment in quality maintenance proportionate to the business benefit? Options: Continue, Invest (increase investment due to strategic importance), Harvest (reduce maintenance to minimum viable monitoring), Sunset (retire the feature).

The Operate phase is often treated as maintenance, a reduced-investment, reduced-attention state after the excitement of launch. This is a mistake for AI features. Model quality drifts. User patterns shift. Foundation model providers update their APIs in ways that change behavior. An AI feature in Operate requires ongoing, active attention, less than Shape, but more than a traditional software feature in maintenance.

## Time-Boxing Research vs. Committing to Scope

The single most important planning discipline in AI development is knowing which phase you are in and applying the right planning model.

In Explore, you are doing bounded research. The planning question is: "What hypotheses will we test in this time-box, and how will we evaluate them?" You are not committing to a deliverable. You are committing to a set of experiments and a gate decision at the end. Communicating this to stakeholders requires explicit framing: "In the next four sprints, we will test these three approaches and produce a recommendation. We are not committing to a working feature at the end of this phase."

In Shape and Harden, you are doing committed delivery. The planning question is: "What work do we need to complete to reach the quality threshold, and how do we sequence it?" Traditional sprint planning applies here.

The confusion between these modes is the primary source of AI development planning dysfunction. Teams in Explore get pressured to commit to scope. Teams in Shape try to keep exploring instead of committing. Getting the mode explicit and communicating it clearly, to the team, to engineering leadership, and to stakeholders, is a core PM responsibility in AI development.

## Reporting Progress in Explore

Progress reporting during Explore requires a different language than traditional sprint reporting. "We completed 18 of 24 story points" is not meaningful when the output is research, not features.

Effective Explore progress reporting covers:

**What we tried:** The specific approaches or hypotheses tested. "We tested three prompt strategies for the summarization task, an extractive approach using our existing search index, and a fine-tuned model approach using 200 labeled examples."

**What we learned:** The result of each experiment, including the negative results. "The extractive approach produced high precision but low recall. It captured explicit facts but missed inferred conclusions. The fine-tuned approach reached 84% accuracy on our sample, 3 points below our threshold."

**What we ruled out and why:** Approaches that were eliminated. "We ruled out the zero-shot approach because it produced hallucinations at an unacceptable rate on domain-specific terminology."

**What we are doing next:** The next set of experiments and the specific question each is designed to answer. "Next sprint: test whether adding domain glossary context to the prompt resolves the terminology hallucination issue."

**Status relative to gate:** Are we on track to produce a Go/Pivot/Kill recommendation at the end of the Explore phase? If not, why, and what would need to change?

> **Think of it like this:** Explore progress is like reporting on an investigation, not a construction project. A detective does not report "I completed 18 of 24 investigation actions." They report: "I have ruled out the butler, confirmed the weapon was from the study, and I am focusing on the three suspects who had access to the study. I will have a recommendation by Friday." The value is in the narrowing of the hypothesis space, not the completion of predefined tasks.

## Handling "It Depends" in Planning

AI development conversations frequently produce what PMs sometimes call "the engineer's three-word answer": it depends. The sprint will take two weeks, or it might take eight, depending on the data quality. The feature will reach 90% accuracy, or it might reach 80%, depending on the edge case distribution. This is difficult to plan around.

The productive response to "it depends" is not frustration. It is precision. Ask: "What does it depend on, specifically? What would we need to know or do to reduce that dependency?" This converts an unhelpful hedge into a concrete research question. The question then becomes: "Can we answer that question cheaply before we commit to scope?"

This is the function of the Frame and Explore phases: to systematically answer the "it depends" questions before the Shape phase commits to scope. If you go into Shape with major "it depends" questions unresolved, you are committing to scope under uncertainty, which produces exactly the planning failures that make AI development feel chaotic.

## Go/Pivot/Kill Gates in Practice

Each Grounded Delivery gate produces one of three outcomes. In practice, these decisions are harder than they look, because the data is almost never clean.

**Go is clear when:** The approach met or exceeded the quality threshold, the team has high confidence in the data, and the path to the next phase is well-defined.

**Kill is clear when:** The core assumption was wrong. The data does not exist, the model cannot reach the required accuracy, users do not respond to the feature as hypothesized, and there is no reasonable pivot that does not amount to a fundamentally different feature.

**Pivot is the hardest gate:** The results are mixed. Some signals are promising, others are concerning. The team believes the approach can work with modifications. This is where sunk cost bias is most dangerous, because the most honest answer is sometimes "we should kill this, but we are too invested to say so."

A practical Pivot discipline: a Pivot requires a specific, testable hypothesis about why the modified approach will produce a different result. "We will try harder" is not a Pivot hypothesis. "We will add domain-specific context to the prompt because our Explore results showed the model's errors were concentrated on domain terminology, and prior work in similar domains shows that contextual glossary injection reduces this error type by 30–40%" is a Pivot hypothesis. Pivots without specific hypotheses are perpetual pilots in disguise.

## Communicating AI Development Progress to Stakeholders

AI development timelines feel opaque to stakeholders because the exploration model is unfamiliar. Stakeholders expect to see progress measured in features shipped, not in hypotheses tested and ruled out.

The PM's job is to translate. Three framing principles:

**Describe the risk reduction arc:** Early phases reduce uncertainty. Later phases reduce risk. Launch reduces both. Each phase has a meaningful reduction in the probability of building the wrong thing or building something that does not work. Frame progress as "we are X% through the uncertainty reduction process" rather than "we are X% through development."

**Make the Gate decision visible:** Stakeholders should know which gate is next, what the criteria are, and what the team's current assessment is. "We are heading into our Explore gate review in three weeks. Based on current results, we think we are on track for a Go decision, with one remaining experiment to run." This gives stakeholders visibility into decision points without requiring them to understand ML mechanics.

**Tie progress to the value hypothesis:** Periodically update stakeholders on how the developing evidence maps to the original value hypothesis. "Our Explore results have increased our confidence in the feasibility dimension of the hypothesis. We have identified a data gap that slightly weakens the data dimension. Here is what we are doing about it."

## Summary

Story points fail for AI development because AI effort is bounded but AI outcomes are uncertain. The planning unit for exploration is time-boxes and gate decisions, not point estimates. Grounded Delivery's five phases (Frame, Explore, Shape, Harden, Operate) provide a structure that alternates between bounded research and committed delivery, with explicit gate decisions that force honest assessments at each transition.

Progress reporting in Explore is legitimate and valuable, especially when it consists primarily of what did not work and why. Go/Pivot/Kill gates are the structural defense against perpetual pilots, but Pivot decisions need specific testable hypotheses to be credible. Communicating AI development progress to stakeholders requires translating from research language to business language, anchored in the value hypothesis and the risk reduction arc.

The most important discipline in AI development planning is knowing which phase you are in and applying the appropriate planning model. Mixing exploration and commitment produces the planning dysfunction that makes AI development feel unpredictable.
