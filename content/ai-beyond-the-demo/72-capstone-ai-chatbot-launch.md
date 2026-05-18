---
title: "Capstone: The AI Chatbot Launch"
slug: "capstone-ai-chatbot-launch"
description: "Plan and execute the product lifecycle for an enterprise AI chatbot — from discovery through launch and iteration. This capstone applies the full PM toolkit: value hypothesis, discovery, build vs. buy decision, evaluation framework, rollout strategy, and post-launch metrics."
section: "ai-beyond-the-demo"
order: 72
part: "Part VII — Capstones"
---

Part VII — Capstones

# Capstone: The AI Chatbot Launch

The AI chatbot is the most common first enterprise AI product — and the one most frequently launched without a coherent product strategy. Features are built based on what the LLM can do rather than what users need, evaluation is an afterthought, and post-launch metrics are vanity metrics that don't reflect actual value. This capstone walks through the complete PM process for an enterprise AI chatbot — the right way.

## Scenario

A healthcare organization wants to deploy an internal AI assistant for clinical administrative staff — scheduling, documentation, policy lookup, and benefits questions. The PM team must move from initial concept to production launch in 16 weeks, with a patient safety culture that requires careful validation before deployment.

## Discovery Phase (Weeks 1–3)

**Stakeholder interviews — the right questions:**

For an AI feature, the discovery questions must go beyond standard PM discovery to address AI-specific risks:

- "When you look up a policy, how confident are you in what you find? What happens when the information is outdated?"
- "Describe the last time you had to chase down an answer from multiple sources. What would have helped?"
- "What information are you absolutely certain you would check a second source for, regardless of what an AI tool says?"
- "If the AI gave you an incorrect answer, what's the worst case?"

**Data validation during discovery:**

Before committing to features, validate the data:

- What policies and documentation exist in a machine-readable format?
- What is the current quality and freshness of that documentation?
- Who owns updates to the knowledge base?
- What are the access control requirements (can all staff see all policies)?

In healthcare, discovering that the policy documents haven't been updated in 18 months during discovery rather than during build saves a 6-week delay.

**The value hypothesis:**

Format: "We believe [user type] is experiencing [problem] because [root cause]. An AI assistant that [capability] would reduce [metric] by [target]. We'll validate this by [test]."

Example: "We believe clinical admin staff spend 45+ minutes per shift locating policy answers because our documentation is fragmented across 3 systems. An AI assistant with unified policy access would reduce documentation lookup time by 60%. We'll validate with a 2-week shadow mode test measuring time-to-answer on 50 real queries."

## Build Phase (Weeks 4–12)

**Build vs. buy decision:**

Evaluate vendors (Microsoft Copilot for M365, ServiceNow AI, custom RAG) on:
- Knowledge base control (can we keep PHI in our environment?)
- Citation quality (does the answer show what document it came from?)
- Integration with existing systems (Epic, SharePoint, Teams)
- Total cost of ownership at 500 daily active users

Document the decision rationale — the reasoning matters as much as the conclusion for regulatory purposes.

**Evaluation framework (establish before building):**

Success criteria:
- Answer accuracy on 100 manually verified test cases: ≥ 92%
- Citation present for factual claims: 100%
- Response time: ≤ 3 seconds p95
- Failure mode: graceful "I don't know" with escalation path for out-of-scope questions

Failure criteria:
- Any response that contradicts current policy without flagging the contradiction
- Any response that includes PHI from one patient context in another patient context
- Any response that omits a required safety notice

**The evaluation dataset:**

Build the 100-case evaluation dataset from real support ticket history. Do not use synthetic questions. Include:
- 40 routine policy questions (expected: high accuracy)
- 30 ambiguous or edge-case questions (expected: graceful handling)
- 20 out-of-scope questions (expected: escalation, not hallucination)
- 10 adversarial inputs (expected: safe refusal)

## Launch Phase (Weeks 13–16)

**Rollout strategy:**

Week 13: Internal pilot (10 administrative staff volunteers)
Week 14: Expanded beta (50 staff, 2 departments)
Week 15: Controlled rollout (200 staff with opt-out)
Week 16: Full rollout with monitoring

**Gate criteria between phases:**

Beta gate: accuracy ≥ 92% on pilot queries, zero safety-critical failures, CSAT ≥ 4.0/5.0
Controlled rollout gate: accuracy maintained, no escalation rate increase, no new failure patterns

**Post-launch metrics (the right ones):**

Leading indicators (weekly):
- Citation rate on factual responses (target: 100%)
- Escalation rate (baseline: user requests human help)
- Query volume trend

Lagging indicators (monthly):
- Documentation lookup time (measure via shadow observation, not self-report)
- Staff satisfaction with policy access (quarterly survey delta)
- Support ticket volume for questions the AI now handles

Vanity metrics to ignore:
- Total query count (high volume of low-quality queries is not success)
- User satisfaction with the chatbot as a product (vs. satisfaction with the answers)

## Key Learning Points

**Discovery must validate the data before the concept.** In this capstone, the most important discovery finding is the state of the policy documentation. An AI assistant is only as good as the documentation it retrieves. Discovering documentation quality problems during discovery — and fixing them before launch — is the difference between a successful chatbot and a confidently wrong one.

**Healthcare's safety culture is a feature, not a barrier.** The validation requirements that feel slow during build are what make the resulting system trustworthy. Clinical staff who trust the chatbot use it at full value; staff who don't trust it use it as a secondary confirmation tool, which eliminates most of the efficiency gain.

**The evaluation dataset is the product's quality floor.** The 100-case evaluation dataset defines the minimum quality the product must achieve. Cases in the evaluation dataset are the failure modes the team has explicitly decided to handle. Cases not in the dataset are the failure modes that will appear in production. The evaluation dataset quality is bounded by how well the team understands the user's actual query distribution.
