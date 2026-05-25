---
title: "Planning AI Development"
slug: "planning-ai-sprints"
description: "Story points assume the outcome is known and the effort is uncertain. AI development flips this: the effort is bounded but you often won't know the outcome until you're deep in it."
section: "building-ai-products-that-ship"
order: 5
part: "Part 03 Delivery"
badges:
  - "Grounded Delivery"
  - "AI Planning"
---

# Planning AI Development

## Why Story Points Don't Work

Story points are an estimation tool designed for a specific kind of work: tasks where the effort is uncertain but the outcome is defined. Given a well-specified requirement, how much effort will it take to build a system that satisfies it? Uncertainty is in the effort. The output is specified.

![Diagram](/diagrams/ai-pm/ch05-1.svg)

AI feature development inverts this. The outcome is uncertain in ways that effort cannot resolve. You can spend three weeks building a classification model and discover, at the end of week three, that the available data doesn't support the required accuracy level. That's not an estimation failure. It's a discovery that the approach doesn't work — and no amount of better story-pointing would have revealed it earlier.

When teams try to apply story points to AI development, one of three dysfunctions follows. The first is inflation: engineers estimate the full range of possible scenarios, producing numbers so large that leadership loses confidence. The second is false precision: teams produce normal-looking estimates, commit them to stakeholders, and miss them when technical exploration reveals unexpected complexity. The third is scope creep: teams hit story point commitments by shipping whatever the model produces by the deadline, regardless of quality.

Quality was the whole point.

## The Grounded Delivery Framework

Grounded Delivery is the LegacyForward framework for AI development planning. It structures AI work into five phases — Frame, Explore, Shape, Harden, and Operate — each with a specific purpose, time-box, and gate decision at the end.

The core insight: AI development alternates between phases of bounded exploration and phases of committed delivery. Mixing them — trying to commit to scope while still exploring, or exploring indefinitely without committing to a direction — produces the pathologies that define most failed AI delivery.

### Phase 1: Frame (1–2 sprints)

**Purpose:** Align the team on the problem, value hypothesis, and success criteria before any technical work begins.

**Activities:**
- Finalize the value hypothesis and probabilistic success criteria
- Complete the evaluation dataset specification
- Define kill criteria for the initiative
- Assess data availability and quality
- Produce a technical risk assessment: what are the open questions, and what would need to be true for each approach to work?

**Gate decision:** Is the problem well-defined enough, data availability confirmed, and success criteria agreed upon to proceed to Explore? If not, extend Frame once or kill the initiative.

**Output:** A one-page Frame document — value hypothesis, success metrics, evaluation set design, kill criteria, and known risks. Not a 20-page PRD.

The common failure in Frame is treating it as a planning phase rather than an alignment phase. The goal isn't a complete development plan. It's shared understanding of what the team is trying to accomplish, how they'll know if it worked, and when they'll stop if it doesn't.

### Phase 2: Explore (2–4 sprints)

**Purpose:** Determine whether the technical approach can reach the quality threshold, using time-boxed experimentation.

**Activities:**
- Prototype 2–3 approaches against a subset of the evaluation dataset
- Assess feasibility: what quality is achievable, at what cost, at what latency?
- Identify the most promising approach based on early results
- Surface any data gaps or quality issues that would prevent reaching the threshold

**Gate decision:** Has one approach demonstrated enough promise to warrant committing to a Shape phase?
- **Go:** At least one approach shows a path to the quality threshold
- **Pivot:** No approach works as designed, but a modified approach might
- **Kill:** No approach shows promise; a fundamental assumption was wrong

**Output:** An Explore summary — what was tried, what results each approach produced, which approach is recommended for Shape, and what remaining technical risks exist.

The Explore phase is where the "we tried three approaches and none worked yet" progress reports come from. This is legitimate progress. It reduces the solution space and provides information that future work depends on. The organizational challenge is helping stakeholders understand that negative results in Explore are valuable outputs, not failures.

Time-box discipline is non-negotiable. Without a hard end date, Explore becomes infinite research. If the team reaches the end of Explore without a viable approach, the gate decision is Kill or a defined second Explore phase with explicit new hypotheses to test.

### Phase 3: Shape (3–6 sprints)

**Purpose:** Build the AI feature to the quality threshold, with scope committed based on Explore findings.

**Activities:**
- Implement the winning approach to production quality
- Build the product layer — UX, integrations, APIs — that surfaces the AI output to users
- Evaluate against the full evaluation dataset, iterating to reach the quality threshold
- Address known edge cases from the evaluation set
- Complete monitoring and observability infrastructure

**Gate decision:** Does the feature meet the quality threshold on the evaluation set? Does the product layer handle edge cases correctly?
- **Go to Harden**
- **Pivot:** Approach is close but needs modification
- **Kill:** Quality threshold is unachievable with this approach

Shape is the phase where traditional sprint planning works, because the technical approach is now committed and the remaining work is implementation rather than exploration. Story points, sprint goals, and velocity tracking are appropriate here in ways they aren't in Explore.

### Phase 4: Harden (2–3 sprints)

**Purpose:** Validate that the feature works at production quality with real users before full release.

**Activities:**
- Limited beta release to a representative user cohort — not just early adopters
- Monitor quality metrics in production: does the model perform as well on real user inputs as on the evaluation set?
- Address production-specific issues: distribution shift, edge cases the evaluation set didn't cover, latency under real load
- Validate the behavioral outcomes from the value hypothesis: are users actually changing behavior as predicted?
- Confirm operational monitoring and alerting is working correctly

**Gate decision:** Do production quality metrics match the evaluation set quality? Is the behavioral outcome validated?
- **Go to full Operate**
- **Extend Harden** (once, with specific improvement targets)
- **Roll back** (quality in production is materially worse than evaluation performance)

Harden is where teams often discover the gap between evaluation quality and production quality. Real user inputs have patterns the evaluation set didn't cover. The right response is to update the evaluation set with production examples and iterate — not to declare the quality metrics misleading.

### Phase 5: Operate (ongoing)

**Purpose:** Maintain and improve feature quality in production, monitor for drift, and respond to quality degradation.

**Activities:**
- Monitor quality metrics continuously against defined thresholds
- Detect and respond to distribution shift — changes in user input patterns that degrade performance
- Update prompts, retrieval systems, or models in response to quality drift
- Add new evaluation examples from production observations
- Assess whether the feature is achieving the long-term business outcome in the value hypothesis

**Gate decision (quarterly):** Is the feature still delivering its intended value? Is ongoing investment proportionate to the business benefit?
- **Continue**
- **Invest** (increase investment due to strategic importance)
- **Harvest** (reduce maintenance to minimum viable monitoring)
- **Sunset** (retire the feature)

Operate is often treated as maintenance — a reduced-investment state after the excitement of launch. For AI features, this is a mistake. Model quality drifts, user patterns shift, and foundation model providers update APIs in ways that change behavior. An AI feature in Operate requires ongoing active attention. Less than Shape, but more than a traditional software feature in maintenance.

## Time-Boxing Research vs. Committing to Scope

The most important planning discipline in AI development is knowing which phase you're in and applying the right model.

In Explore, you're doing bounded research. The planning question is: "What hypotheses will we test in this time-box, and how will we evaluate them?" You're not committing to a deliverable — you're committing to a set of experiments and a gate decision at the end. Communicating this to stakeholders requires explicit framing: "In the next four sprints, we'll test these three approaches and produce a recommendation. We are not committing to a working feature at the end of this phase."

In Shape and Harden, you're doing committed delivery. Traditional sprint planning applies.

The confusion between these modes is the primary source of AI development planning dysfunction. Teams in Explore get pressured to commit to scope. Teams in Shape keep exploring instead of committing. Making the mode explicit — to the team, to engineering leadership, and to stakeholders — is a core PM responsibility in AI development.

## Reporting Progress in Explore

Traditional sprint reporting ("we completed 18 of 24 story points") is meaningless when the output is research, not features.

Effective Explore progress reporting covers four things:

**What we tried:** The specific approaches or hypotheses tested. "We tested three prompt strategies for the summarization task, an extractive approach using our existing search index, and a fine-tuned model approach using 200 labeled examples."

**What we learned:** The result of each experiment, including negative results. "The extractive approach produced high precision but low recall — it captured explicit facts but missed inferred conclusions. The fine-tuned approach reached 84% accuracy on our sample, 3 points below our threshold."

**What we ruled out and why:** "We ruled out the zero-shot approach because it produced hallucinations at an unacceptable rate on domain-specific terminology."

**What we're doing next:** The next set of experiments and the specific question each is designed to answer. "Next sprint: test whether adding domain glossary context to the prompt resolves the terminology hallucination issue."

Also include status relative to the gate: are we on track to produce a Go/Pivot/Kill recommendation at the end of Explore? If not, why, and what needs to change?

## Handling "It Depends" in Planning

AI development conversations frequently produce the engineer's three-word answer: it depends. The sprint will take two weeks, or it might take eight, depending on the data quality. The feature will reach 90% accuracy, or it might reach 80%, depending on the edge case distribution.

The productive response isn't frustration — it's precision. Ask: "What does it depend on, specifically? What would we need to know or do to reduce that dependency?" This converts an unhelpful hedge into a concrete research question. Then ask: "Can we answer that question cheaply before we commit to scope?"

That's the function of Frame and Explore — to systematically resolve the "it depends" questions before Shape commits to scope. If you go into Shape with major unknowns unresolved, you're committing under uncertainty, and that produces exactly the planning failures that make AI development feel chaotic.

## Go/Pivot/Kill Gates in Practice

Each gate produces one of three outcomes. In practice, these decisions are harder than they look because the data is almost never clean.

**Go is clear when:** The approach met or exceeded the quality threshold, the team has high confidence in the data, and the path to the next phase is well-defined.

**Kill is clear when:** The core assumption was wrong. The data doesn't exist, the model can't reach the required accuracy, users don't respond as hypothesized, and there's no reasonable pivot that doesn't amount to a fundamentally different feature.

**Pivot is the hardest gate.** Results are mixed. Some signals are promising, others are concerning. The team believes the approach can work with modifications. This is where sunk cost bias is most dangerous — the most honest answer is sometimes "we should kill this, but we're too invested to say so."

A practical Pivot discipline: every Pivot requires a specific, testable hypothesis about why the modified approach will produce a different result. "We'll try harder" is not a Pivot hypothesis. "We'll add domain-specific context to the prompt because our Explore results showed the model's errors concentrated on domain terminology, and prior work in similar domains shows contextual glossary injection reduces this error type by 30–40%" is a Pivot hypothesis. Pivots without specific hypotheses are perpetual pilots wearing a different name.

## Communicating AI Development Progress to Stakeholders

AI development timelines feel opaque to stakeholders because the exploration model is unfamiliar. Stakeholders expect to see progress measured in features shipped, not hypotheses tested and ruled out. Three framing principles help:

**Describe the risk reduction arc.** Early phases reduce uncertainty. Later phases reduce risk. Launch reduces both. Each phase meaningfully reduces the probability of building the wrong thing or building something that doesn't work. Frame progress as "we're X% through the uncertainty reduction process" rather than "we're X% through development."

**Make the gate decision visible.** Stakeholders should know which gate is next, what the criteria are, and what the team's current assessment looks like. "We're heading into our Explore gate review in three weeks. Based on current results, we think we're on track for a Go decision, with one remaining experiment to run." This gives visibility into decision points without requiring stakeholders to understand ML mechanics.

**Tie progress to the value hypothesis.** Periodically update stakeholders on how developing evidence maps to the original hypothesis. "Our Explore results have increased our confidence in the feasibility dimension. We've identified a data gap that slightly weakens the data dimension — here's what we're doing about it."

The goal in every stakeholder conversation: make the current phase clear, the gate criteria explicit, and the connection to business value visible. Everything else is detail.
