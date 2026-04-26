---
title: "Capstone: The AI Chatbot Launch"
slug: "capstone-ai-chatbot-launch"
description: "A complete worked example: you're PM for a B2B SaaS product and the CEO wants an AI-powered support chatbot shipped in 90 days. Walk through every stage of the AI PM framework — from Signal Capture to monitoring — with templates and deliverables at each step."
section: "ai-pm"
order: 13
part: "Part 06 Capstones"
badges:
  - "Capstone"
  - "Applied Framework"
---

# Capstone: The AI Chatbot Launch

## The Scenario

You are the product manager for **Fieldwork**, a B2B SaaS platform used by 2,400 mid-market operations teams to manage field service scheduling, dispatch, and reporting. Average contract value is $18,000/year. Current NPS is 42. Your support team handles approximately 1,800 tickets per month.

The CEO returns from a conference and sends you this message on a Monday morning:

> "Talked to three peers this weekend who've deployed AI chatbots for support. One company cut support tickets by 40%. We need to ship this in 90 days. Let's make it happen."

Your job: figure out whether this is worth doing, how to do it right, and what to deliver at each stage.

![Diagram](/diagrams/ai-pm/capstone-01.svg)

---

## Stage 1: Signal Capture — Is This Worth Building?

Do not open a project in Jira. Do not schedule an engineering scoping session. The first work is validation.

### Signal Capture Questions

**Is there evidence of real user need?**

Pull your last 90 days of support ticket data. Categorize tickets by:
- Type (how-to / bug report / billing / data question / other)
- Resolution path (self-serve possible / required human judgment / required engineering)
- Volume by category

**What you might find for Fieldwork:**

| Category | Monthly volume | Self-serve possible? |
|---|---|---|
| How-to questions (scheduling, dispatch) | 720 | Yes — documentation exists |
| Report configuration questions | 340 | Yes — complex but documentable |
| Integration/API questions | 210 | Partially — needs human for complex cases |
| Bug reports | 310 | No — requires engineering |
| Billing/account questions | 150 | Partially |
| Other | 70 | Mixed |

**Analysis**: Approximately 1,060 tickets per month (59%) are candidates for AI deflection. If the AI deflects 40% of those, that is approximately 424 fewer tickets per month, which is meaningful for a team managing 1,800/month.

**The "unlimited humans" test**: If you had 10 more support reps, what would they do? They would answer the same how-to and configuration questions faster. An AI doing this is not transforming anything. It is automating a cost center. That is legitimate value, but frame it correctly.

**Is 90 days realistic?**

Run the Integration Complexity Estimation (Chapter 10):

| Dimension | Score | Notes |
|---|---|---|
| Data access complexity | 3 | Support tickets exist in Zendesk; product documentation in Confluence |
| Prompt engineering complexity | 3 | FAQ and how-to queries are moderately structured; need good context retrieval |
| Output integration complexity | 2 | Chat widget in app; output is displayed text |
| Safety and moderation complexity | 3 | Wrong answers damage customer trust in a B2B context |
| Existing system fragility | 2 | Chat widget can be added without touching core product |

**Total: 13 — Medium complexity.** 90 days is aggressive but feasible for an MVP. Not feasible for a polished, production-grade chatbot.

**Signal Capture recommendation:** Proceed, but reframe the CEO's request from "ship in 90 days" to "run a controlled pilot in 90 days with defined success criteria."

### Signal Capture Deliverable

A one-page recommendation memo to the CEO:

> "We have validated that approximately 60% of our support tickets are candidates for AI deflection. A 90-day timeline is feasible for a controlled pilot of 10–15% of our user base, with full rollout dependent on pilot results. I recommend we proceed with a pilot rather than a full launch, with the following success criteria: [see kill criteria below]. Here is my proposed plan."

---

## Stage 2: Value Hypothesis and Kill Criteria

### Value Hypothesis

**We believe that** adding an AI-powered support chatbot to Fieldwork

**Will help** operations managers who encounter setup or how-to questions during their workflow

**By** giving them instant, accurate answers without waiting for a support ticket response

**Resulting in** a 30%+ reduction in Tier 1 support ticket volume, with user satisfaction scores on chatbot interactions above 3.5/5.0

**We will know this is true when** the chatbot resolves 30%+ of tickets without human escalation, and users who used the chatbot have equivalent or better support NPS compared to ticket-based support.

### Kill Criteria

Define these before you start, write them down, and share them with the CEO.

| Criterion | Kill threshold | Measurement |
|---|---|---|
| Chatbot answer accuracy | <70% of answers rated as "helpful" by users | User thumbs-up rate |
| Human escalation rate | >60% of chatbot interactions escalate to human | Escalation rate during pilot |
| User satisfaction | Chatbot support NPS > 10 points below ticket NPS | Post-interaction survey |
| Harmful / wrong answers | >2 instances of confidently wrong answers in pilot causing customer harm | Manual review + escalations |
| Cost per deflected ticket | >$8 per deflected ticket (vs. ~$12 for human ticket) | Cost / deflected ticket count |

If any kill criterion is met at the 45-day pilot midpoint review, the pilot is paused and the team convenes a kill/pivot decision. No exceptions. The CEO agreed to these criteria at the start; hold the line.

---

## Stage 3: Grounded Delivery — Phased Plan

### Phase 0: Foundation (Weeks 1–3)

**Goal**: Get the infrastructure right before showing anything to users.

**Work:**
- Export and structure all support documentation (KB articles, FAQs, common responses) for RAG ingestion
- Set up shadow mode: chatbot processes all new support tickets in the background; team reviews outputs but nothing is shown to users
- Build evaluation dataset: 200 representative support queries with human-written ideal answers
- Define chatbot persona and escalation rules

**Deliverable**: Shadow mode live; evaluation baseline established.

**Shadow mode targets**: Achieve >70% match rate between chatbot responses and human-ideal responses before proceeding to Phase 1.

### Phase 1: Internal Canary (Week 4)

**Goal**: Validate with zero customer risk.

**Work:**
- Enable chatbot for internal Fieldwork employees only
- Collect thumbs-up/down, corrections, and escalations
- Manual review of 100% of responses during this phase
- Iterate on prompt engineering and knowledge base gaps

**Deliverable**: Internal quality report; decision to proceed to customer pilot.

**Gate criteria**: Internal user satisfaction >4.0/5.0; error rate <5%.

### Phase 2: Limited Customer Pilot (Weeks 5–10)

**Goal**: Validate with real users in a controlled environment.

**Work:**
- Enable chatbot for 10–15% of customer base (opt-in during onboarding or via prominent in-app prompt — NOT default-on at this stage)
- Measure against all kill criteria weekly
- Human review of escalated conversations daily
- 45-day midpoint review with go/kill/pivot decision

**Deliverable**: Pilot results report with recommendation.

**Who to include in pilot**: Power users who are comfortable with beta features; accounts with dedicated CS managers who can provide qualitative feedback; avoid your 10 largest accounts until Phase 3.

### Phase 3: Graduated Rollout (Weeks 11–14, if pilot succeeds)

**Goal**: Expand safely with quality maintained.

**Work:**
- 25% → 50% → 100% rollout over three weeks
- Default-on for new users; opt-in for existing users for first 30 days
- Continue monitoring all quality metrics
- Update support team on volume trends; retrain on escalation patterns

**Deliverable**: Full production deployment; operational handoff to support team.

---

## Stage 4: Evaluation Framework

### Evaluation Dimensions

**Tier 1: Accuracy**

Run your 200-query evaluation set through the chatbot every time you update the knowledge base or prompt. Track:
- Match rate against human-ideal answers (automated semantic similarity)
- Factual error rate (human review of random sample)
- Hallucination rate (answers that assert things not in the knowledge base)

**Tier 2: User Satisfaction**

After each chatbot interaction, show a brief survey:
- "Did this help you solve your issue?" (Yes / Partially / No)
- "How satisfied are you with this response?" (1–5)
- [If "No" or <3]: "What was missing or wrong?" (free text)

Track these by query category, user segment, and over time.

**Tier 3: Business Impact**

- Weekly ticket volume trend in pilot vs. control group
- Average time to resolution (chatbot vs. ticket)
- Support team capacity freed (tickets saved × avg. handle time)
- Support NPS trend in pilot vs. control group

**Tier 4: Cost**

- Cost per chatbot interaction (all-in: tokens, retrieval, infrastructure)
- Cost per deflected ticket
- Monthly AI cost vs. monthly support cost savings

### Evaluation Cadence

| Frequency | What's reviewed | Who reviews |
|---|---|---|
| Daily | Escalations and flagged responses | PM + Support lead |
| Weekly | Full metrics dashboard vs. kill criteria | PM |
| Bi-weekly | Evaluation suite run; quality trend | PM + AI/ML team |
| 45 days | Formal kill/proceed review | PM + CEO + Support VP |
| End of pilot | Full recommendation memo | PM |

---

## Stage 5: Rollout and Monitoring Plan

### Rollout Communication

**Internal**: Brief the support team before the pilot launches. Frame the chatbot as a tool that handles routine volume so support can focus on complex, relationship-driven issues. Provide training on the escalation workflow. Establish a direct feedback channel for support reps to flag chatbot errors.

**Customer-facing**: "We're piloting an AI support assistant to help you get faster answers. If it doesn't solve your issue, it will connect you to our team in one click. [Enable for my account / Keep standard support]."

Do not call it "AI-powered" in customer-facing language without first confirming your customer base reacts positively to AI branding. Some B2B operations buyers are skeptical. "Intelligent assistant" or "automated help" may be preferable framing depending on research.

### Monitoring Setup

Before Phase 2 launches, the following must be live:

| Metric | Alert threshold | Owner |
|---|---|---|
| Escalation rate | >55% in any 24h period | PM |
| Thumbs-down rate | >30% in any 24h period | PM |
| API error rate | >2% | Engineering |
| p95 latency | >5 seconds | Engineering |
| Daily AI cost | >150% of forecast | PM + Finance |

---

## Template Deliverables at Each Stage

| Stage | Deliverable | Audience |
|---|---|---|
| Signal Capture | 1-page recommendation memo | CEO |
| Value Hypothesis | Value hypothesis doc + kill criteria | CEO + Support VP + Engineering lead |
| Phase 0 | Shadow mode quality report | PM + Engineering |
| Phase 1 | Internal pilot report with go/no-go | PM + Support lead |
| Phase 2 midpoint | 45-day pilot review with kill/proceed recommendation | CEO + leadership team |
| Phase 2 final | Full pilot results report with rollout recommendation | CEO + leadership team |
| Phase 3 | Production launch communication | All customers |
| Ongoing | Monthly AI feature health report | PM + leadership |

---

## Common Failure Modes to Avoid

**Shipping without shadow mode**: Teams skip shadow mode because 90 days is short. Do not. Shadow mode in weeks 1-3 is what makes the rest of the plan safe. If shadow mode reveals that the chatbot is wrong 40% of the time, you have saved yourself from a customer trust crisis.

**Letting the CEO's timeline override the kill criteria**: The most important decision in this capstone is maintaining discipline at the 45-day review. If the metrics do not support proceeding, say so. A failed chatbot in production is more damaging to the CEO's goals than a delayed launch.

**Ignoring the support team**: The support team is a critical stakeholder and a crucial source of quality feedback. Loop them in early, treat them as partners, and make sure their workflow is respected during the transition.

**Optimizing for deflection rate instead of resolution quality**: A chatbot that deflects 50% of tickets by giving vague non-answers that frustrate users has made your product worse, not better. The success metric is resolved issues, not deflected tickets. Define the distinction clearly and track both.

**Never closing the feedback loop**: If users flag errors and nothing changes, they stop flagging errors. Demonstrate that feedback leads to improvements. Announce when you have fixed something a user reported. This converts skeptics into advocates.
