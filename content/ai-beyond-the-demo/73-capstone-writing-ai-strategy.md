---
title: "Capstone: Writing Your AI Strategy"
slug: "capstone-writing-ai-strategy"
description: "Produce a one-page AI strategy document for your organization — grounded in the LegacyForward framework, structured around the five strategy questions, and designed to guide investment decisions and organizational alignment rather than sit in a drawer."
section: "ai-beyond-the-demo"
order: 73
part: "Part VII — Capstones"
---

Part VII — Capstones

# Capstone: Writing Your AI Strategy

Most AI strategies fail not because the organization lacks capability but because the strategy lacks a clear value thesis, concrete prioritization criteria, and accountability for outcomes. A strategy document that leaders will actually use to make decisions is short, opinionated, grounded in the specific organization's context, and honest about what is not being prioritized and why. This capstone produces that document.

## What the Strategy Must Answer

An AI strategy that leaders can act on answers five questions:

**1. What does AI do for this organization specifically?**

Not "AI enables automation and intelligence" — but specifically: which business outcomes will AI contribute to in the next 18 months? Name them: "Reduce customer service cost per contact by 30%", "Enable 2-person due diligence teams to review 3x more targets", "Eliminate 80% of manual contract review for standard agreements."

Strategies that answer this question in generic terms are not strategies — they are marketing copy.

**2. Where will we invest first, and why?**

The portfolio model from Chapter 13: which capabilities are Quick Wins (high confidence, 90-day delivery), which are Capability Builders (medium-term, building infrastructure for later bets), and which are Strategic Bets (high-value, higher uncertainty, 12-18 month horizon)?

The "why" matters as much as the "what." Every investment prioritization decision forecloses other decisions. Documenting why a capability is prioritized above another creates accountability and enables revisiting the decision when circumstances change.

**3. What are we not doing, and why?**

A strategy that prioritizes everything prioritizes nothing. Name the AI capabilities that are explicitly out of scope for this strategy cycle — and the reason. "Autonomous decision-making in underwriting: out of scope due to regulatory uncertainty and model interpretability requirements. Revisit in 12 months." This signals to the organization that the omission is deliberate, not an oversight.

**4. What must be true for this to succeed?**

The critical dependencies: data quality improvements required, organizational capabilities that must be built or hired, governance structures that must be in place, regulatory approvals that must be obtained. Strategies that do not acknowledge their dependencies fail when the dependencies do not materialize as assumed.

**5. How will we know it's working?**

The measurement framework from Chapter 19: model metrics, user behavior metrics, and business outcome metrics — with baseline values and 12-month targets. Strategies that do not define success criteria cannot be evaluated, and cannot be improved.

## The One-Page Strategy Format

```
[ORGANIZATION] AI STRATEGY — [YEAR]

WHAT AI DOES FOR US:
In [18-month horizon], AI will enable us to [2-3 specific outcomes with measurable targets].
This supports [strategic priority] by [mechanism].

WHERE WE INVEST (ordered by priority):

QUICK WINS (deliver in 90 days):
→ [Capability 1]: [one sentence description] | Owner: [team] | Target: [metric]
→ [Capability 2]: [one sentence description] | Owner: [team] | Target: [metric]

CAPABILITY BUILDERS (deliver in 6-12 months):
→ [Capability 3]: [one sentence] | Dependency: [what must be true first]
→ [Capability 4]: [one sentence] | Dependency: [what must be true first]

STRATEGIC BETS (12-18 months, higher uncertainty):
→ [Capability 5]: [one sentence] | Go/no-go decision: [trigger conditions]

WHAT WE ARE NOT DOING (this cycle):
→ [Capability X]: out of scope because [specific reason]. Revisit: [trigger or date]
→ [Capability Y]: out of scope because [specific reason]. Revisit: [trigger or date]

WHAT MUST BE TRUE:
□ Data: [specific data readiness requirement]
□ Talent: [specific capability or hiring requirement]
□ Governance: [specific governance structure required]
□ Infrastructure: [specific technical prerequisite]

HOW WE KNOW IT'S WORKING:
Model: [metric] ≥ [target] by [date]
User behavior: [metric] ≥ [target] by [date]
Business outcome: [metric] ≥ [target] by [date]

GOVERNANCE:
AI Investment Review: quarterly | Owner: [executive]
Strategy update: annually or when [trigger condition]
```

## Exercises for Each Section

**What AI does for us:** List every AI use case discussed in your organization in the past 6 months. Identify which 2–3 connect most directly to the organization's stated strategic priorities. Write one sentence for each that specifies the outcome and the mechanism — not just "AI will help with X" but "AI will reduce Y by Z through A."

**Investment prioritization:** For each AI capability under consideration, score it on four dimensions: strategic value (1–5), confidence in delivery (1–5), data readiness (1–5), organizational readiness (1–5). Plot the scores. Quick Wins score high on confidence and readiness. Strategic Bets score high on strategic value with lower confidence.

**What we are not doing:** Ask: "What AI capabilities have people proposed that we are not prioritizing?" For each, write the one-sentence reason. If you cannot write the reason, the decision has not been made — it has been deferred. Deferred decisions are not strategy.

**Critical dependencies:** For each Quick Win and Capability Builder, list every external dependency — data that must be cleaned, systems that must expose APIs, regulations that must be interpreted, organizational capabilities that must be developed. Any dependency without an owner and timeline is a hidden risk.

**Measurement framework:** Identify the baseline for each metric before the strategy is approved. A strategy that sets targets without baselines cannot be evaluated — and will be evaluated against whatever baseline proves most convenient when the review date arrives.

## Common Strategy Failure Modes

**Too many priorities.** A strategy with eight Quick Wins has no Quick Wins — it has eight undifferentiated projects competing for the same limited attention. Limit Quick Wins to three.

**No accountability.** Every investment must have a named owner. "The AI team" is not an owner. "Sarah Chen, Director of Data Science, accountable to the CFO" is an owner.

**Vague success criteria.** "Improve customer experience" is not a success criterion. "Reduce customer support ticket volume by 20% in the segments where AI handles initial triage" is a success criterion.

**Ignoring the legacy stack.** AI strategies that do not address the integration requirements with existing systems produce AI capabilities that cannot be deployed. Chapter 40 (migration strategies) and Part I (the enterprise foundation) are required context for any AI strategy that will actually be executed.

**Annual updates without triggers.** Strategies that are reviewed annually miss the window to respond to significant changes — a regulatory development, a competitor move, a model capability breakthrough. Define the trigger conditions under which the strategy is reviewed outside the annual cycle.
