---
title: "Signal Capture: The Value Assessment Framework"
slug: "signal-capture-framework"
description: "The three-stage framework for evaluating, validating, and tracking value — and the anti-patterns that destroy AI portfolios."
section: "legacyforward-guide"
order: 2
part: "Pillar 1: Signal Capture"
badges: ["Signal Capture", "Portfolio Governance"]
---

# Signal Capture: The Value Assessment Framework

Identifying where AI creates net new value is the first discipline. The second is ensuring that identification holds up under scrutiny — that a plausible story does not get funded as though it were a proven one. The Value Assessment Framework provides the structure for that scrutiny through three sequential stages: Hypothesis, Validation, and Tracking.

Each stage has a gate. Skipping a stage does not save time — it converts a correctable mistake into an expensive one discovered in production.

![Value Assessment Framework: Hypothesis → Validation → Tracking](/diagrams/legacyforward-guide/02-signal-capture-framework-1.svg)

## The Three Stages

Signal Capture is implemented through a three-stage Value Assessment Framework. The stages are sequential. Skipping a stage is not an efficiency gain — it is how organizations waste money on initiatives that should never have been funded.

### Stage 1: Value Hypothesis

Before any technical work begins, every initiative must produce a Value Hypothesis. This is a document, not a slide. It must answer five questions:

**1. Value statement.** One sentence: "This initiative creates [specific value] that is impossible without AI because [reason]." Vague statements fail. "Improve customer experience" is not a value statement. "Identify at-risk customers 60 days before churn by synthesizing behavioral signals across support, usage, and billing data that no analyst could correlate manually" is a value statement.

**2. Transformation test.** Answer the question directly: if we removed the AI and used unlimited human effort, could we achieve the same outcome? Document the reasoning. If the answer is yes, the initiative is automation. Fund it accordingly.

**3. Measurable outcome.** Define what success looks like in operational terms — revenue captured, cost avoided, risk reduced, time-to-insight compressed — with specific targets. "Reduce regulatory review time by 40%" is measurable. "Improve efficiency" is not.

**4. Uniqueness claim.** Which AI capability — pattern recognition, natural language reasoning, cross-system synthesis, probabilistic inference — makes this outcome possible? If the answer is "it just does it faster," this is automation.

**5. Value ceiling estimate.** What is the maximum value this initiative could deliver if everything goes right? If the ceiling is low, the initiative may not justify AI-scale investment even if it succeeds.

**Gate: GO / NO-GO.** An initiative without a complete, credible Value Hypothesis does not proceed. Not into discovery, not into prototyping, not into a hackathon. The gate is a policy, not a review meeting.

### Stage 2: Value Validation

Value validation occurs before significant investment. It answers one question: is the value hypothesis real, or is it a plausible story?

**Data validation.** Does the data required to deliver the value actually exist, and is it accessible? Many value hypotheses assume data availability that does not hold. The most common failure mode: an initiative requires data from a legacy system that cannot export it in a usable format. This is why Legacy Coexistence is a prerequisite input to Signal Capture, not an afterthought. Data validation must account for legacy system constraints — formats, access patterns, extraction limitations.

**Feasibility validation.** Can current AI capabilities actually deliver the claimed value in production, against real data, with real edge cases? Not in a demo. A demo that uses curated data and ignores edge cases validates nothing. This is where the Grounded Delivery Explore phase does its work — structured experiments against real production data.

**Organizational validation.** Will the organization actually use the output? A perfectly valid value hypothesis fails if the humans who need to act on the AI's output do not trust it, cannot interpret it, or have no process for incorporating it into their decisions. The AI does not create value. The decisions made with its output create value. If the output will not be acted on, the value hypothesis is invalid.

**Economic validation.** Does the value justify the full investment? Include the cost of development, data preparation, legacy integration, governance infrastructure, monitoring, retraining, and the organizational change required to realize the value. Initiatives that look attractive on development cost alone often fail economic validation when full lifecycle costs are included.

**Gate: GO / PIVOT / KILL.** If validation passes on all four dimensions, the initiative proceeds to funded development. If one or more dimensions reveal a flaw, the initiative either pivots its hypothesis to address the flaw, or is killed. There is no "continue with known problems" option.

### Stage 3: Value Tracking

Funding an initiative based on a validated hypothesis is not the end of Signal Capture. It is the beginning of accountability.

**Leading indicators** are early signals that value is being captured: accuracy of outputs, time-to-insight improvements, user trust metrics, decision quality measures. They must be defined before deployment, not after.

**Lagging indicators** are actual business outcomes — revenue, cost, risk, compliance posture — attributed to the AI initiative with honest methodology. Attribution requires rigor. "The business improved after we deployed AI" is not attribution.

**Kill triggers** are predefined thresholds that trigger initiative review or termination. If leading indicators fail to materialize within defined timeframes, the initiative is paused for reassessment — not allowed to limp along consuming resources while the team hunts for a success story to justify the spend.

---

## Key Questions: Signal Capture

Practitioners across all roles should be able to answer these questions for any AI initiative they are involved with. If the answers are not documented or not available, the initiative has not completed Signal Capture.

- What specific outcome becomes possible with AI that was impossible without it?
- If we removed the AI and used unlimited human effort, what happens to the outcome?
- What is the value ceiling — the maximum this initiative could deliver if everything goes right?
- What data is required, and have we confirmed it exists and is accessible in the required format and latency?
- Who will act on the AI's output, and how does that action create business value?
- What are the kill triggers, and who has the authority to pull them?
- How is this initiative classified in the portfolio — transformation, automation, or experimental?

---

## Anti-Patterns: Signal Capture

**The Adoption Trap.** Organizations measure AI success by deployment volume — users on platform, queries per day, departments with copilots. These are vanity metrics. Adoption measures activity, not value. An internal chatbot that gets ten thousand queries a month is meaningless if those queries would have been answered faster by a well-organized wiki. High adoption of a low-value tool is worse than low adoption of a high-value tool — it consumes more organizational attention and creates dependency on something that does not justify its existence.

**Solutions Looking for Problems.** AI initiatives begin with the technology — "we need an AI strategy" — rather than with the value — "we have a business problem that only AI can solve." The result is a portfolio of technically interesting projects with no value thesis. The fix is to start every initiative from a business problem, not a technology category.

**Automation as Transformation.** Making a broken process faster is not transformation. If the initiative's value statement can be achieved by throwing enough people at the problem, it is automation. Fund it as automation. Govern it as automation. Do not dress it up as transformation to justify AI-scale investment.

**The Vibe-Coded Commitment.** A team uses AI-assisted development to build a compelling demo in days. The demo is shown to leadership. Leadership commits organizational resources. Nobody validated the value hypothesis — the speed of the demo created momentum that bypassed value discipline. Speed without a value hypothesis is just arriving at the wrong destination faster. The demo is not validation. The demo is a prototype.

**The Perpetual Pilot.** Initiatives stay in "pilot" status indefinitely, avoiding the accountability of production deployment while continuing to consume resources. Every pilot must have a predefined end date with three possible outcomes: promote to production, pivot the value hypothesis, or kill. Permanent pilots are permanent avoidance.

**The Sunk Cost Spiral.** An initiative has consumed significant resources but has not demonstrated value. Leadership keeps funding it because killing it means admitting the investment was wasted. The correct response: the investment is already wasted. Additional funding does not recover it. Kill the initiative and reallocate. The only thing that changes when you continue funding a failing initiative is the size of the loss.
