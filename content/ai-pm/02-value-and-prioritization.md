---
title: "Value Hypothesis & Portfolio Prioritization"
slug: "value-and-prioritization"
description: "A value hypothesis is the most important document you'll write before building an AI feature — and your backlog of AI ideas is only as useful as your ability to prioritize them ruthlessly. This chapter covers the one-sentence hypothesis template, four validation dimensions, the AI prioritization matrix, kill discipline, and a budget allocation model that balances exploration with delivery."
section: "ai-pm"
order: 2
part: "Part 01 Value"
badges:
  - "Value Validation"
  - "Feature Canvas"
  - "Prioritization"
  - "Portfolio Management"
---

# Value Hypothesis & Portfolio Prioritization

## Why a Hypothesis, Not a Requirement


![Diagram](/diagrams/ai-pm/ch02-1.svg)
Product requirements documents describe what to build. A value hypothesis describes why building it would matter — and under what conditions that belief would be proven wrong.

The distinction is not semantic. When you write a requirement, you are implicitly asserting that the problem is understood and the solution is known. When you write a hypothesis, you are acknowledging that you are working under uncertainty and committing to a structured process for resolving it. In traditional software development, many features are understood well enough that the requirement framing is appropriate. In AI feature development, almost nothing is understood well enough at the outset.

You do not know exactly how accurate the model will be. You do not know whether users will trust its outputs. You do not know whether the feature will change behavior in the ways you expect. You do not know whether the data you have is sufficient or whether you will need to instrument additional collection. Starting with a hypothesis rather than a requirement is not a sign of uncertainty. It is the appropriate epistemic posture for working with probabilistic systems.

> **Think of it like this:** A scientist doesn't say "I'm going to prove that this molecule cures the disease." They say "I hypothesize that this molecule reduces symptoms by mechanism X, and I will design experiments to test that claim." The rigor is in the falsifiability, not the confidence.

This chapter gives you the tools to write a good value hypothesis for an AI feature, and then to prioritize across a backlog of them with the rigor the work demands.

## The One-Sentence Value Hypothesis Template

Every AI feature should have a one-sentence value hypothesis that captures the core claim. The template:

> **We believe that [user segment] will [behavioral outcome] because [AI capability] reduces/enables [specific friction or gap], which we will validate by [measurable signal] within [timeframe].**

This sentence is doing more work than it appears. Here is what each slot means:

**[user segment]** — Not "users." A specific, describable group of people with a shared context and need. "Enterprise account managers who manage more than 50 accounts" is a user segment. "Our customers" is not.

**[behavioral outcome]** — Not an attitude change, not a satisfaction score. An observable change in what users *do*. "Reduce time spent on weekly pipeline reviews by 30%" is a behavioral outcome. "Feel more confident about their pipeline" is not.

**[AI capability]** — The specific thing the AI does that enables the outcome. "Surfaces accounts showing early-warning churn signals before the account manager notices manually" is specific. "Uses AI to provide insights" is not.

**[specific friction or gap]** — What the AI removes or creates that makes the behavioral outcome possible. This anchors the hypothesis in user reality.

**[measurable signal]** — The leading indicator you will track during validation. Not the ultimate business metric, but a signal you can observe during an early experiment or limited release.

**[timeframe]** — Hypotheses without timeframes don't create accountability. The timeframe should be realistic for the validation approach you're planning.

## 5 Real-World Value Hypotheses

The following examples illustrate the difference between a hypothesis that creates useful direction and one that sounds reasonable but provides no guidance when the data comes back ambiguous.

---

**Example 1: AI-assisted meeting notes (strong hypothesis)**

> We believe that mid-level managers who run 8 or more internal meetings per week will spend at least 50% less time on post-meeting documentation because our AI meeting summary feature reduces the effort of capturing and distributing action items, which we will validate by comparing documentation time logged in time-tracking tools for a 30-user cohort over six weeks.

Why this is strong: the user segment is specific, the behavioral outcome is quantifiable, the AI capability is grounded in a real task, the friction is named ("effort of capturing and distributing"), and the validation signal is observable without relying on self-reported sentiment.

---

**Example 2: AI-assisted meeting notes (weak hypothesis)**

> We believe users will find AI meeting summaries helpful because they save time on documentation.

Why this is weak: "users" is undefined, "helpful" is not behavioral, "save time" is unquantified, and there is no validation signal or timeframe. This hypothesis cannot be tested — you could run a study and collect any outcome, and the hypothesis could be interpreted as confirmed.

---

**Example 3: Predictive churn scoring (strong hypothesis)**

> We believe that customer success managers at accounts with 10+ users will initiate a proactive outreach within 5 days for at least 60% of accounts flagged as high-churn risk, because the AI prediction surfaces specific reasons alongside the risk score, reducing the time needed to formulate an outreach approach, which we will validate through CRM activity logs over one quarter.

Why this is strong: it tests both the quality of the AI output (specific reasons, not just a score) and the user behavior change, and it creates a clear threshold (60% response rate) against which to evaluate.

---

**Example 4: AI content generation (strong hypothesis)**

> We believe that marketing coordinators at mid-market companies will publish at least 2x more social media content per month because the AI draft generator reduces first-draft time from 45 minutes to under 10 minutes, which we will validate by measuring post frequency for a cohort of 20 users during a 60-day beta.

Why this is strong: the leverage ratio (45 min to 10 min) is specific and testable, the expected behavioral outcome (2x post frequency) gives the team a clear target, and the validation approach is concrete.

---

**Example 5: AI-powered search (weak hypothesis)**

> We believe adding AI to search will improve user satisfaction and help users find what they need more easily.

Why this is weak: "improve satisfaction" is not a behavioral outcome, "find what they need more easily" is unquantifiable, and there is no user segment, AI capability description, or validation approach. This is a wish, not a hypothesis.

---

The pattern that separates strong from weak hypotheses is not confidence. It is specificity. A strong hypothesis makes a claim you could be wrong about and tells you how you would know.

## The 4 Validation Dimensions

A value hypothesis is not validated by a single experiment. It has four dimensions, each of which needs to be green before the feature is ready to move to full development.

### Dimension 1: Data Validation

**The question:** Does the data needed to power this AI feature exist, and is it accessible, sufficient in volume, and of adequate quality?

This is frequently the dimension that kills otherwise strong hypotheses, and it kills them late when the team has already invested significantly. Data validation should happen first, before feasibility, before adoption research.

What to assess: Does the data exist in your systems or can it be sourced? How complete is it? How labeled? What is the quality: are there gaps, inconsistencies, or biases that would impair model performance? What is the volume: is there enough to train or fine-tune, or to provide reliable context for retrieval? What are the data governance implications: can you use this data for this purpose given your privacy policies and any applicable regulations?

Red flags: data that exists but is siloed across systems without integration infrastructure. Data that theoretically exists but is locked in unstructured formats requiring significant preprocessing. Historical data that reflects workflows or behaviors that have since changed.

### Dimension 2: Technical Feasibility

**The question:** Is the AI capability you're hypothesizing achievable at a quality level sufficient to produce the behavioral outcome you've described?

This is where PMs need to work closely with ML engineering or AI infrastructure teams — not to get certainty (that's not available at this stage), but to get an honest assessment of the technical risk. The right framing for this conversation: "We need to know whether this is a well-explored problem or an open research question. We need to know what the best-in-class accuracy looks like and whether that's good enough for our use case."

What to assess: Is this a task that AI handles well in comparable contexts? What accuracy levels are realistic? What's the latency profile — can the AI respond within the time window the user experience requires? What's the infrastructure cost at the volume you're targeting? Are there known failure modes or bias patterns that need to be designed around?

Red flags: AI tasks requiring reasoning that current models demonstrably struggle with. Latency requirements that current inference speeds cannot meet. Cost per call that makes the unit economics unworkable at scale.

### Dimension 3: Adoption Feasibility

**The question:** Will the target users actually use this feature, trust its outputs, and change their behavior in the ways the hypothesis describes?

This is the dimension most often underweighted by technically-oriented teams. Building an AI feature that works accurately is not sufficient — users have to adopt it, trust it, and integrate it into their workflow. Each of those is a separate challenge.

What to assess: What is the user's current workflow, and how does the AI feature fit into it? Does using the feature require behavior change, and how much? What is the user's baseline level of trust in AI outputs for this type of task? Are there professional, cultural, or process reasons why users might resist AI involvement in this decision? Does the feature surface its outputs at the moment in the workflow when they would be most actionable?

Red flags: features that require users to explicitly navigate to the AI output rather than surfacing it in context. Features in domains where users have strong professional identity tied to the manual task. Features where acting on a wrong AI recommendation is costly enough to create adoption-killing risk aversion.

### Dimension 4: Economic Validation

**The question:** Is the value created by this feature worth the cost to build, maintain, and operate it?

AI features have different economics than traditional software features in ways that matter for this calculation. Model inference has a per-call cost that scales with usage. Evaluation and quality maintenance require ongoing investment that doesn't trail off after launch. Retraining or prompt tuning is a continuous operational cost, not a one-time development cost. And the cost of quality failures — user trust erosion, customer support burden, potential liability — needs to be modeled explicitly.

What to assess: What is the engineering and infrastructure cost to build and launch? What is the ongoing operational cost per user or per call at target scale? What is the maintenance cost, including evaluation, monitoring, and quality improvement? What revenue or cost-savings does the hypothesis claim, and how confident are you in that estimate? What is the break-even timeline?

Red flags: unit economics that only work at scale you have not yet reached. Cost structures driven primarily by third-party API pricing you do not control. ROI models that assume 100% adoption when historical adoption rates for new features at your company are 30%.

## Go/No-Go Gate Criteria

Each validation dimension should produce a gate decision, not just a finding. The following criteria provide a starting framework. Adjust thresholds based on your organization's risk tolerance and strategic context.

| Dimension | Go | Conditional Go | No-Go |
|---|---|---|---|
| Data | Data exists, accessible, quality is sufficient | Data exists but requires 1–2 sprint investment to clean/access | Data doesn't exist or requires major new collection effort |
| Technical Feasibility | Prior art demonstrates achievable accuracy | Technically novel but similar problems have been solved | Open research question; no clear path to required accuracy |
| Adoption | Users express strong pain; workflow fit is natural | Users express pain; workflow integration requires some change management | Users unaware of pain; feature requires significant workflow disruption |
| Economics | Positive ROI within 2 quarters at current scale | Positive ROI at 2x current scale; achievable within 12 months | Unit economics only work at 10x+ current scale |

A feature with all four gates at "Go" should proceed to discovery immediately. A feature with any "No-Go" gate should be paused pending a specific resolution plan. A feature with multiple "Conditional Go" gates needs a prioritized research agenda before moving forward.

## The AI Feature Value Canvas

The following one-page canvas consolidates your value hypothesis work into a format that can be shared, reviewed, and updated across the team. It functions as a living document through early discovery — it should be revisited and refined as new information comes in, not treated as a commitment that locks in your assumptions.

---

**AI Feature Value Canvas**

**Feature Name:**
**Version / Date:**
**PM Owner:**

---

**Value Hypothesis (one sentence):**
*[Fill in using the template: We believe that... will... because... reduces/enables..., which we will validate by... within...]*

---

**User Segment:**
*Who specifically? What context are they in? What do they do today?*

**Specific Pain or Gap:**
*How does the user experience this today? What workaround do they use? How often?*

**AI Capability:**
*What specifically does the AI do? Summarize, classify, predict, generate, detect?*

**Behavioral Change:**
*What will users do differently? Be specific and measurable.*

---

**Validation Plan**

| Dimension | Key Question | How We'll Validate | Timeline | Owner |
|---|---|---|---|---|
| Data | Does sufficient data exist? | | | |
| Feasibility | Can the AI achieve required accuracy? | | | |
| Adoption | Will users adopt and trust? | | | |
| Economics | Does this pencil out? | | | |

---

**Assumptions (ranked by risk)**
1. *Highest-risk assumption — if this is wrong, the whole hypothesis fails*
2.
3.

**Kill Criteria:**
*Under what conditions would we stop this work? What would we need to see to conclude the hypothesis is wrong?*

**Current Gate Status:**
- Data: Go / Conditional Go / No-Go
- Feasibility: Go / Conditional Go / No-Go
- Adoption: Go / Conditional Go / No-Go
- Economics: Go / Conditional Go / No-Go

---

The kill criteria field deserves special emphasis. Many teams fill in the positive validation signals clearly and leave the kill criteria vague. This is a mistake. Knowing when to stop is as important as knowing when to continue. If you cannot articulate what would convince you the hypothesis is wrong, you have not thought through the assumption structure clearly enough.

## Common Hypothesis Failure Modes

**The metric mismatch:** The behavioral outcome in the hypothesis is measurable, but the validation metric doesn't actually measure it. "Users will adopt this faster" is validated by tracking logins, but logins don't distinguish between users who adopted the feature and users who logged in to see what the feature is before ignoring it.

**The user segment drift:** The hypothesis is written for one user segment, but the validation experiment recruits a different segment. The feature appears to validate because this segment has the pain, but the segment you actually need to sell to doesn't.

**The survivorship bias trap:** Validation is done with early adopters — the most motivated, most technically comfortable users — and results are extrapolated to the full user base. Early adopter behavior is not representative of mainstream adoption.

**The demo effect:** The feature is validated using a curated demo dataset or handpicked examples, not a realistic sample of the messy, incomplete, edge-case-laden data it will encounter in production. The hypothesis validates; the production launch disappoints.

**The outcome attribution problem:** The behavioral outcome you're measuring improves during your validation period, but the cause isn't the AI feature — it's something else that changed at the same time (a process change, a product release, a seasonal effect). Without a control group, you can't distinguish.

## The Problem with 10 AI Ideas

Once you have written strong value hypotheses, you will face a new problem: your backlog has too many of them. Here is a situation you will encounter repeatedly. Your organization has developed genuine enthusiasm for AI. Ideas are flowing from engineering, from sales, from the executive team, from customer success. You have a backlog of ten potentially interesting AI feature concepts. Your team has capacity to meaningfully pursue two of them in the next two quarters.

Which two?

This question is harder for AI features than it is for traditional product features, for three specific reasons.

First, **uncertainty is structural, not incidental.** In traditional product development, you can estimate effort with reasonable accuracy once you have done discovery. In AI feature development, even after a thorough discovery phase, you often do not know whether the approach will work at all. Two features that look equivalent on paper can require radically different development timelines depending on data quality, model behavior, and edge case complexity. You often cannot determine which is which until you are deep in the work.

Second, **the impact is harder to compare.** An automation feature that saves your operations team 20 hours per week is valuable, but it is a different kind of value than a transformation feature that enables an entirely new product motion. Comparing them on a single impact score obscures the strategic differences.

Third, **the cost of a wrong bet is higher.** An AI feature that does not work after three months of development has not just failed to deliver value. It has consumed engineering time, burned ML infrastructure costs, created expectations with stakeholders, and potentially shipped a poor user experience that damages trust in AI features broadly.

## Adding the Uncertainty Dimension

The standard impact-vs-feasibility matrix has two axes: how much value does this create, and how hard is it to build? High impact, low effort features go first. Low impact, high effort features get killed. The middle quadrants require judgment.

For AI features, a two-axis matrix is insufficient. You need a third dimension: **uncertainty**. Specifically, the probability that the approach you're planning will actually produce the quality outcome you're hypothesizing, given what you currently know.

This third dimension changes the math entirely. Consider two features:

- Feature A: High impact, medium effort, low uncertainty (you've done this type of AI before, the data is clean, similar implementations exist at comparable companies)
- Feature B: High impact, medium effort, high uncertainty (the approach is novel, the data is messier than you'd like, you're not sure the accuracy you need is achievable)

A traditional matrix would rate them equally. But Feature B carries a materially higher expected cost because a portion of the "medium effort" may be spent discovering that the approach does not work. At that point you have consumed resources and have nothing to show for it.

> **Think of it like this:** Comparing a deterministic software feature to an AI feature on effort alone is like comparing a construction project (you know roughly what it costs to build a known structure) to an oil drilling project (you know the cost of drilling, but not whether there's oil). The uncertainty about the outcome changes everything about how you should budget and sequence the work.

### The AI Prioritization Matrix

Plot your feature ideas across three dimensions. You can do this as a visual matrix or as a scoring table — the scoring table is often more practical for team alignment conversations.

For each feature, score the following (1–5 scale, higher is better for the first two, lower is better for the third):

**Impact Score (1–5):**
- 5: Changes a core user workflow; enables a capability that creates measurable revenue or cost impact; high strategic value
- 3: Meaningful improvement to an existing capability; positive but not transformative user outcome
- 1: Nice to have; limited user segment; marginal efficiency gain

**Feasibility Score (1–5):**
- 5: Straightforward implementation; data is clean and available; well-established AI approach; similar features exist
- 3: Some complexity; data requires preparation; moderate technical risk; similar but not identical problems have been solved
- 1: High complexity; data gaps; novel approach; no clear precedent for required accuracy level

**Uncertainty Score (1–5):**
*Note: score uncertainty high (4–5) when you're less certain — a high score here is a warning signal, not a positive*
- 5: Core assumption is unvalidated; approach is novel; significant data risk; no comparable prior art
- 3: Some validated signal; one or two open technical questions; data quality is mixed
- 1: Strong prior validation; approach is well-understood; data quality is high

**Composite Priority Score = Impact × Feasibility ÷ Uncertainty**

This formula rewards high-impact, high-feasibility features and penalizes uncertainty. Features with extreme uncertainty scores (4–5) should be treated as research spikes, not product commitments, regardless of their impact scores.

| Feature | Impact (1–5) | Feasibility (1–5) | Uncertainty (1–5) | Priority Score |
|---|---|---|---|---|
| Example A | 5 | 4 | 2 | 10.0 |
| Example B | 4 | 4 | 2 | 8.0 |
| Example C | 5 | 3 | 3 | 5.0 |
| Example D | 3 | 5 | 4 | 3.75 |
| Example E | 5 | 2 | 5 | 2.0 |

In this example, Feature E has the same impact score as Feature A but is four times lower priority because its uncertainty and feasibility profiles make it a poor near-term bet. That doesn't mean Feature E is never worth building — it means it needs a research spike to reduce uncertainty before it earns a place in a committed roadmap.

## The Kill Discipline: Every Initiative Needs a Kill Date

The most common AI portfolio failure is not picking the wrong features — it's failing to kill them when they stop making sense. This produces the most expensive outcome in AI product management: the perpetual pilot.

A perpetual pilot is a feature that is always "almost ready," always just one more sprint away from working, always showing promising partial results that justify continued investment without ever reaching the bar required for production. Perpetual pilots consume engineering resources, occupy ML infrastructure, distract the team's attention, and — most insidiously — give leadership the impression that the organization is working on AI without ever delivering user value.

The antidote is the kill date. Every AI initiative, from the day it enters the roadmap, should have a pre-committed date at which the team will explicitly evaluate whether to continue, pivot, or stop — and where stopping is a genuinely acceptable outcome.

The kill date is not a deadline to have the feature done. It is a decision point at which you will look at the evidence available — model quality, user research, data availability, cost modeling — and make a Go/Pivot/Kill decision based on what you see.

**Setting kill dates:** Use the validation timeline you established in your value hypothesis as the starting point. If your hypothesis said you'd validate adoption in six weeks, then six weeks is when you either have the evidence or you don't. If you've been trying to achieve a required accuracy level for eight sprints and you're not converging, that is data — not bad luck.

**Making the kill decision real:** Kill dates only work if killing is culturally acceptable. If your organization treats stopping an AI initiative as a failure rather than as disciplined capital allocation, teams will game the process by always finding a reason to continue. Leadership needs to communicate clearly that killing an initiative that failed to validate is a success of the process, not a failure of the team.

> **Think of it like this:** A kill date in an AI project is like a stop-loss in an investment portfolio. It doesn't mean you expect to lose — it means you've pre-committed to the conditions under which you'll accept the loss rather than doubling down on a losing position.

## Portfolio Balance: Automation vs. Transformation Mix

A healthy AI feature portfolio is not composed exclusively of high-certainty automation features (too conservative) or high-upside transformation features (too risky). It requires a deliberate mix.

The right mix depends on three factors: your organization's current AI maturity, your competitive situation, and your team's capacity for managing uncertainty.

**Early AI maturity (first 1-2 years of meaningful AI investment):**
Target portfolio: ~70% automation, ~30% transformation. Organizations building AI capability for the first time need wins that build trust with users and internal stakeholders, demonstrate that the team can ship AI features that work, and generate the data and operational infrastructure that more ambitious features will require.

**Developing AI maturity (active AI investment, some features in production):**
Target portfolio: ~50% automation, ~50% transformation. You've proven you can ship. Now you need to demonstrate that AI can create differentiated value, not just operational efficiency.

**Advanced AI maturity (multiple AI features in production, ML infrastructure in place):**
Target portfolio: ~30% automation, ~70% transformation. Your competitive advantage is increasingly determined by your ability to do things competitors can't, not by how efficiently you do what everyone else also does.

These are starting ratios, not formulas. The more important principle is that you have deliberate portfolio balance, not an accidental distribution that resulted from whatever was easiest to approve in roadmap conversations.

## Budget Allocation Framework

AI features have different cost structures than traditional software features, and your budget framework needs to reflect this. There are four cost categories that every AI feature budget should address.

**1. Exploration budget (time-boxed research)**
The cost of determining whether an approach is viable before committing to full development. This includes data investigation, technical spike work, early prototyping, and initial user research. This budget should be capped and time-boxed — typically 2–4 sprints.

**2. Development budget (build to launch)**
The cost of building the feature to a launchable state. In AI development, this includes model training or fine-tuning, evaluation dataset creation, integration work, and the UX that surfaces AI outputs to users. This budget should be estimated with explicit uncertainty buffers — 20–40% above your point estimate.

**3. Quality budget (evaluation and hardening)**
Often underestimated and frequently cut when development runs over budget. The quality budget covers evaluation set development, human review of model outputs, edge case identification and mitigation, bias auditing, and the iterative quality improvement work that happens between "technically working" and "safe to launch."

**4. Operations budget (post-launch maintenance)**
The ongoing cost of running an AI feature after launch. This includes inference costs, monitoring, quality drift detection, retraining or prompt tuning, and the human review resources you may need to maintain quality standards.

A simple allocation heuristic for total AI feature budget:

| Phase | Allocation |
|---|---|
| Exploration | 10–15% |
| Development | 50–55% |
| Quality / Hardening | 15–20% |
| First-year operations | 15–20% |

Organizations that routinely underfund quality and operations are building on sand. The features may launch, but they won't sustain.

## Sequencing: Dependencies and Capability Building

Portfolio prioritization is not just about which features are most valuable — it's about the order in which you build them. AI feature development creates infrastructure and capability that subsequent features depend on, and this dependency structure should influence your sequencing decisions.

**Data infrastructure dependencies:** Features that require similar data should be sequenced so that the data engineering investment made for the first feature is reusable for subsequent ones.

**Evaluation infrastructure dependencies:** Every AI feature needs an evaluation framework. The work of building that framework has overhead that compounds if each feature approaches it from scratch.

**Trust-building sequencing:** Users' willingness to trust AI outputs is influenced by their experience with previous AI features from your product. Sequencing high-confidence automation features before ambitious transformation features is not just risk management for the individual features — it's investment in the organizational trust that future features will need.

## A Working Example: Ten Ideas, Two Picks

Imagine you are the PM for an enterprise SaaS product and you have ten AI ideas:

1. Auto-categorize support tickets (clear task, labeled data exists, similar solutions exist)
2. Predict customer churn 30 days out (some signal, historical data exists, well-understood ML problem)
3. Generate first-draft responses to support tickets (LLM, straightforward, data available)
4. Surface relevant documentation when users encounter errors (retrieval, feasible, navigation data available)
5. Auto-generate usage reports for account managers (structured data, LLM, medium complexity)
6. Detect anomalous usage patterns that predict security issues (complex, limited labeled data, novel for your context)
7. Personalize onboarding flow based on user role and behavior (medium complexity, some personalization data)
8. Recommend feature adoption actions to CSMs based on account health (complex, requires good account health model first)
9. Summarize customer health from multiple signals for exec review (structured data, well-understood task, LLM)
10. Predict which free-trial users will convert (conversion data exists, classic ML problem)

Running these through the priority scoring framework:

| # | Impact | Feasibility | Uncertainty | Score |
|---|---|---|---|---|
| 1 | 3 | 5 | 1 | 15.0 |
| 4 | 4 | 4 | 2 | 8.0 |
| 9 | 4 | 4 | 2 | 8.0 |
| 10 | 4 | 4 | 2 | 8.0 |
| 3 | 3 | 4 | 2 | 6.0 |
| 2 | 5 | 3 | 3 | 5.0 |
| 5 | 3 | 3 | 2 | 4.5 |
| 7 | 3 | 3 | 3 | 3.0 |
| 8 | 4 | 2 | 4 | 2.0 |
| 6 | 4 | 2 | 5 | 1.6 |

The top two picks are the ticket auto-categorization (#1) and a three-way tie at 8.0. The tiebreaker between #4, #9, and #10 requires a strategic judgment: which of these builds capability (data infrastructure, evaluation process, user trust) that benefits the most subsequent features? In this case, #10 (conversion prediction) builds a customer health foundation that #2 and #8 would later depend on. It earns the second slot.

Features #8 and #6 get no resources this cycle — but #8 gets a defined exploration spike to reduce uncertainty, and #6 gets parked until labeled data is available.

## Summary

A value hypothesis is the foundation on which all subsequent AI product work rests. Writing it well — with a specific user segment, an observable behavioral outcome, a named AI capability, and a concrete validation plan — is the single most important thing you can do before your team begins discovery work.

The four validation dimensions (data, feasibility, adoption, economics) each need to reach gate status before resources are committed. The AI Feature Value Canvas provides a one-page shared artifact that keeps the team anchored to the original hypothesis as evidence accumulates.

AI portfolio prioritization requires a three-dimensional framework — impact, feasibility, and uncertainty — because uncertainty is structural to AI development, not incidental. The priority formula (Impact × Feasibility ÷ Uncertainty) surfaces the features with the best expected value while making the risk profile visible.

The kill discipline — pre-committed kill dates and kill criteria for every initiative — is the structural defense against perpetual pilots and sunk-cost escalation. Portfolio balance between automation and transformation should be deliberate and calibrated to your organization's AI maturity. Budget allocation needs to explicitly fund exploration, development, quality hardening, and operations.

The goal is not to build the most AI features. It is to build the right ones, at the right time, with enough discipline to stop the wrong ones before they consume everything.
