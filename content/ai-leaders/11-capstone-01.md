---
title: "Writing Your AI Strategy"
slug: "capstone-writing-ai-strategy"
description: "A complete, step-by-step walkthrough for creating an AI strategy document your board will fund and your organization will actually execute — from situation assessment through investment proposal and risk framework."
section: "ai-leaders"
order: 11
part: "Part 06 Capstones"
badges:
  - "Strategy"
  - "Capstone"
---

# Writing Your AI Strategy

The previous chapters gave you the frameworks. This capstone shows you how to assemble them into a single, coherent artifact: a written AI strategy that can be reviewed by your board, funded by your CFO, and executed by your organization.

A written strategy serves a function beyond communication. The discipline of writing forces clarity that verbal discussions rarely produce. If you can write the strategy clearly, you understand it. If you cannot write it clearly, you do not yet understand it well enough to execute it.

This capstone walks you through each section of the strategy document with worked examples, templates, and the specific questions each section must answer.

---

## What an AI Strategy Document Is — and Is Not


![Diagram](/diagrams/ai-leaders/capstone-01.svg)
An AI strategy is not a technology roadmap. Roadmaps describe what you will build and when. A strategy explains why you are building it, what business problem it solves, and how you will know it worked.

An AI strategy is not a vision statement. "We will be an AI-powered organization" is a wish, not a strategy. A strategy contains choices: what you will do and what you will not do, where you will invest and where you will not, what you will measure and what will determine whether you continue.

An AI strategy is not a vendor-driven deployment plan. If your AI strategy is essentially a description of what one vendor told you to buy, you do not have a strategy — you have a procurement plan dressed up as a strategy.

A complete AI strategy has six sections:

1. Situation Assessment
2. Strategic Intent and Priorities
3. Portfolio of Initiatives
4. Investment Proposal
5. Risk Assessment
6. Governance and Accountability

The full document for most mid-sized organizations runs 8 to 15 pages. Longer is rarely better. The board presentation version (see Capstone 2) is a further distillation of this document.

---

## Section 1: Situation Assessment

The situation assessment answers: where are we, honestly, right now?

It has four components.

### 1a. Current AI Footprint

Inventory what AI is already running in your organization — including the AI embedded in software you have purchased but may not think of as "an AI initiative." Most organizations are surprised by how much AI is already in production when they look carefully.

**Template:**

| System / Tool | Vendor | AI Capability | Business Function | Annual Cost | Last Reviewed |
|---|---|---|---|---|---|
| [Example: Salesforce] | Salesforce | Lead scoring, churn prediction | Sales | $XM license | [Date] |
| [Example: ServiceNow] | ServiceNow | Ticket classification, routing | IT Operations | Included in existing license | [Date] |
| [Custom model] | Internal | [Description] | [Function] | $XM | [Date] |

**The questions this component must answer:**
- What AI are we already running?
- What value is it delivering (or what evidence do we have of value)?
- What is our current total AI spend, direct and embedded?

### 1b. Organizational Readiness Assessment

Use the readiness assessment from Chapter 6 (or conduct it fresh). The strategy should honestly characterize your organization's current readiness across data quality, technical infrastructure, governance maturity, and talent. Do not write a strategy that assumes readiness you do not have.

**Template Summary Line:**

"Our organization's AI readiness is assessed as [Level] overall. Our primary strength is [X]. Our primary constraint is [Y], which will require [specific investment / timeline] to address before we can execute [specific class of initiative]."

### 1c. Competitive Context

What is your competitive environment doing with AI? This does not require proprietary intelligence — earnings call analysis, industry analyst reports, and public case studies produce a useful picture.

Be specific. "Our competitors are investing in AI" is not useful. "Two of our top three direct competitors have deployed AI in [specific function] and are citing [specific metric] improvement in public filings" is useful.

### 1d. Opportunity Signal Capture

List the top 5 to 8 AI opportunity signals you have captured from inside the business. These are the places where executives, operators, or customers have identified processes that are slow, expensive, error-prone, or limited by human capacity — and where AI capability exists to address the gap.

Use this format:

| Business Signal | Current State Cost/Impact | AI Opportunity | Confidence Level |
|---|---|---|---|
| "Legal review of vendor contracts takes 3 weeks and delays procurement" | 3 FTE attorneys; $450K/year in legal costs + opportunity cost of delayed vendor onboarding | AI-assisted contract review could reduce time to 48 hours and legal cost by 60% | Medium — needs pilot validation |

---

## Section 2: Strategic Intent and Priorities

The strategic intent answers: given our situation, what are we choosing to do and why?

This section should be one to two pages and contain three elements.

### 2a. The Strategic Thesis

In three to five sentences, state your organization's AI strategy in plain language. Not aspirational language — declarative language.

**Example (not a template to copy — an illustration of the structure):**

"Our business creates competitive advantage through faster underwriting decisions at higher accuracy than incumbents. AI's primary application for us is therefore in underwriting decision support, not in customer acquisition or marketing, where our competitors have already invested heavily. We will focus our AI investment on three initiatives that directly support underwriting speed and accuracy, accept that we will be behind competitors in AI-assisted marketing for the next 18 months, and revisit that prioritization at our next annual strategy review."

This thesis contains: a source of competitive advantage, a specific AI application aligned to that advantage, explicit choices about what you will not do, and a stated review date.

### 2b. The Prioritization Criteria

Define the criteria you used to select your initiative portfolio. Typical criteria include:

- Strategic alignment (does this support our competitive priorities?)
- Value potential (what is the estimated ROI range?)
- Implementation feasibility (do we have the data, talent, and vendor support?)
- Risk level (what is the exposure if this fails or causes harm?)
- Time to value (can this deliver results within 18 months?)

Weight these criteria based on your organization's situation. A company under near-term profitability pressure should weight time to value heavily. A company with a longer runway and a strategic commitment to competitive differentiation should weight strategic alignment more heavily.

### 2c. What You Are Not Doing

Every strategy document should include an explicit "not doing" list. This is not a list of things you will never do — it is a list of things you are explicitly deprioritizing in the current strategy cycle, with a rationale.

This section is often omitted because it feels like admitting a gap. It actually demonstrates strategic discipline and significantly improves the credibility of the document with sophisticated readers.

---

## Section 3: Portfolio of Initiatives

The portfolio section describes the five specific AI initiatives your strategy will fund and execute. Five is a guideline, not a rule — the right number is the number you can actually staff, govern, and measure with your available resources.

For each initiative, complete the following one-page brief:

### Initiative Brief Template

**Initiative Name:** [Short, memorable name]

**Business Sponsor:** [Named individual, VP or above]

**Problem Statement:** [Two to three sentences: what is the current state, what does it cost, and why is AI the right solution?]

**Proposed Solution:** [Two to three sentences: what will the AI do, in plain language, no jargon]

**Success Metrics:**
- Primary: [The one metric that, if improved, proves this was worth doing]
- Secondary: [Two additional metrics]
- Baseline: [Current state of each metric, measured before deployment]

**Investment:** [Year 1 cost; Year 2 cost; included headcount or FTE impact]

**Timeline:** [Key milestones; go-live date; first measurement date]

**Risk:** [The single most likely failure mode and the mitigation]

**Dependencies:** [What this initiative requires that does not currently exist: data, integration, vendor contract, regulatory clearance]

---

### Portfolio-Level Scoring

After you have written each initiative brief, score the portfolio as a whole using this table:

| Initiative | Strategic Alignment (1-5) | Value Potential (1-5) | Feasibility (1-5) | Risk (1-5, lower=riskier) | Time to Value (1-5) | Weighted Score |
|---|---|---|---|---|---|---|
| Initiative 1 | | | | | | |
| Initiative 2 | | | | | | |
| Initiative 3 | | | | | | |
| Initiative 4 | | | | | | |
| Initiative 5 | | | | | | |

The weighted score should reflect the priority weights you defined in Section 2b. This scoring is a conversation tool, not a precise calculation. If the scoring produces a ranking that does not match your intuition, that is a useful conversation to have with your leadership team — either the scoring is wrong or your intuition is.

---

## Section 4: Investment Proposal

The investment proposal answers: what does this cost, what will we get back, and how do we know?

### 4a. Total Cost of Ownership

Build your cost estimate from the components that are actually chargeable, not just the vendor license:

| Cost Category | Year 1 | Year 2 | Year 3 | Notes |
|---|---|---|---|---|
| Vendor licenses / API costs | | | | |
| Internal engineering / data science time | | | | |
| Integration development | | | | |
| Change management and training | | | | |
| Ongoing model maintenance | | | | |
| Governance and compliance | | | | |
| Infrastructure (cloud compute, storage) | | | | |
| **Total** | | | | |

The most commonly underestimated cost category is internal time. A vendor license that costs $500K may require 3 FTE-years of internal engineering to implement correctly. Omitting the internal time produces a cost estimate that will not survive the first budget review.

### 4b. Value Case by Initiative

For each initiative, provide the value case using the format: confirmed vs. estimated vs. potential.

| Initiative | Confirmed Value (Year 2) | Basis | Estimated Value (Year 2) | Basis |
|---|---|---|---|---|
| Initiative 1 | $X direct cost reduction | Vendor reference, same industry, similar scale | $Y revenue impact | Market analysis, unvalidated |

"Confirmed" means supported by evidence from analogous deployments. "Estimated" means your modeled projection. "Potential" means speculative upside. Clearly labeling which category each figure is in gives your CFO and board the confidence to approve while understanding what you are and are not promising.

### 4c. Portfolio ROI Summary

| | Year 1 | Year 2 | Year 3 | Cumulative |
|---|---|---|---|---|
| Total Investment | | | | |
| Confirmed Value | | | | |
| Estimated Value | | | | |
| Net (Confirmed) | | | | |
| Net (w/ Estimated) | | | | |
| ROI (Confirmed) | | | | |

Present both the confirmed-only and the confirmed-plus-estimated rows. Presenting only the optimistic number and then missing it destroys credibility. Presenting a range with explicit basis for each component demonstrates financial discipline.

---

## Section 5: Risk Assessment

Use the risk framework from Chapter 7 (AI Risk for the Board) adapted to your specific portfolio.

### Portfolio Risk Register

| Risk | Likelihood (H/M/L) | Impact (H/M/L) | Initiative(s) Affected | Mitigation | Owner |
|---|---|---|---|---|---|
| Data quality insufficient for model accuracy | M | H | Initiatives 1, 3 | Data quality sprint pre-deployment; pilot validation gate | [Name] |
| Vendor contract terms create data ownership exposure | M | M | Initiative 2 | Legal review of data clauses; renegotiation if needed | [Name] |
| Regulatory change in [relevant area] | L | H | Initiative 4 | Monitor regulatory calendar; phased deployment to allow pivot | [Name] |
| Talent gap: insufficient internal ML capability | H | M | All | Upskilling program + specific external hire | [Name] |
| Employee resistance reduces adoption | M | H | Initiative 1 | Change management program; manager training | [Name] |

### Risk Appetite Statement

Add two to three sentences that characterize your organization's AI risk tolerance: "We will accept medium operational risk for high strategic value. We will not accept customer data exposure risk above a low threshold. We will escalate any regulatory uncertainty to the Board before proceeding."

---

## Section 6: Governance and Accountability

### Accountability Structure

| Role | Named Individual | Responsibilities |
|---|---|---|
| Executive Sponsor | [Name] | Quarterly portfolio review; escalation decisions; board reporting |
| AI Program Lead | [Name] | Day-to-day initiative management; monthly reporting; vendor management |
| Risk Owner | [Name] | Incident monitoring; governance compliance; regulatory tracking |
| Measurement Owner | [Name] | Baseline definition; quarterly metrics; reporting integrity |

### Review Cadence

| Review | Frequency | Participants | Output |
|---|---|---|---|
| Initiative status | Monthly | Program lead + initiative leads | Status report + escalations |
| Portfolio review | Quarterly | Executive sponsor + business leaders | Continue/modify/escalate decisions |
| Strategy review | Annually | Executive team + board | Strategy update or revision |

---

## The One-Page Strategy Summary

Every strategy document should have a one-page executive summary that stands alone. Use this template:

---

**AI Strategy: One-Page Summary**

**Date:** [Quarter / Year]
**Author:** [Name and title]
**Status:** [Draft / Approved / In Execution]

**Our Strategic Thesis:**
[3-4 sentences]

**Our Portfolio (5 Initiatives):**

| # | Initiative | Sponsor | Investment | Confirmed Value | Go-Live |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

**Total Investment:** $X over 3 years
**Confirmed Value (Year 2):** $X
**Estimated Value (Year 2):** $X
**Portfolio ROI (Confirmed):** X%

**Top Risks:**
1.
2.
3.

**Key Dependencies:**
- [What the strategy requires to succeed that is not yet secured]

**Decisions Required:**
- [What approval is being sought in this document]

---

## Common Strategy Mistakes and How to Avoid Them

| Mistake | What It Looks Like | The Fix |
|---|---|---|
| Strategy without specificity | "We will leverage AI across the enterprise to drive value" | Name five initiatives, name their owners, name their metrics |
| Readiness overestimation | Strategy requires capabilities the organization does not have | Complete a readiness assessment before writing the strategy |
| Technology-led strategy | "We are deploying GPT-X and LangChain" | Lead with business problems, not technology choices |
| No "not doing" list | Every identified opportunity is in the plan | Make explicit prioritization choices; show what you deprioritized and why |
| Confirmed and estimated value conflated | "Our AI program will deliver $50M in Year 2" | Separate confirmed (evidenced) from estimated (modeled) from potential (speculative) |
| No named accountability | "The AI team will own this" | Every initiative has a named VP-level sponsor and a named measurement owner |
| Missing readiness investments | Strategy costs assume AI is plug-and-play | Include data preparation, integration, and change management in the cost model |

---

## Key Takeaways

- An AI strategy is a set of choices — what you will do, what you will not, what you will measure — not a vision statement or a technology roadmap.
- The six sections are: situation assessment, strategic intent, portfolio of initiatives, investment proposal, risk assessment, governance and accountability.
- Situation assessment starts with an honest inventory of what you already have and an honest readiness assessment — not the readiness you wish you had.
- The initiative portfolio should include five complete briefs, each with named sponsor, specific metrics, baseline measurements, and a realistic cost and timeline.
- Separate confirmed, estimated, and potential value in the investment proposal. The CFO and board who approve your strategy will remember whether your projections were labeled honestly.
- The one-page summary should stand alone and contain everything a board member needs to understand the strategy, the investment, and the decision being requested.
