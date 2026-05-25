---
title: "Working with ML Engineering Teams"
slug: "working-with-ml-teams"
description: "The instincts that make you good at working with software engineers don't fully transfer to ML engineers. The gaps are predictable, and so are the fixes."
section: "building-ai-products-that-ship"
order: 6
part: "Part 03 Delivery"
badges:
  - "Team Collaboration"
  - "PM-Engineer Interface"
---

# Working with ML Engineering Teams

## The Translation Gap

Most product managers have developed a working relationship with software engineers over years of practice. You've learned how to write requirements that are actionable, ask for estimates without creating false precision, scope down without demoralizing the team, and translate user needs into technical work without dictating implementation.

![Diagram](/diagrams/ai-pm/ch06-1.svg)

ML engineers and data scientists are different enough from software engineers that this accumulated instinct doesn't fully transfer. The gaps are in specific, predictable places.

**Pattern 1: The PM asks for outcomes; the ML engineer hears implementation constraints.** A PM says "I need the recommendation to be more relevant." The ML engineer starts thinking about loss functions, training data curation, and retrieval architecture. The PM is describing a user experience. The ML engineer is hearing a technical specification that's either too vague to act on or implies a specific approach.

**Pattern 2: The ML engineer communicates uncertainty; the PM hears hedging.** An ML engineer says "I think we can probably reach 85% accuracy, but it really depends on the data distribution." The PM hears "they're not committing." The ML engineer means "the answer is genuinely unknown until we see the data, and if I give you a specific number without the caveat I'm misleading you."

**Pattern 3: The PM expects a feature; the ML engineer delivers a capability.** A PM expects a finished, user-facing feature at the end of a sprint. An ML engineer produces a model that achieves the target accuracy and considers the work done. The gap between "model works" and "feature ships" is substantial and often underplanned.

**Pattern 4: Quality conversations speak different languages.** A PM says "the AI needs to be better." An ML engineer says "precision is 87% but recall is 62%, and improving recall by 10 points would require accepting a precision drop to 79%." Both are talking about the same underlying issue. Neither can act on what the other said.

## Understanding What ML Engineers Actually Do

The first step in closing the translation gap is having an accurate mental model of what the people you're working with actually spend their time on. This isn't about learning ML — it's about understanding the workflow.

An ML engineer working on a new AI feature typically moves through three distinct modes, often in parallel:

**Data mode.** Understanding, cleaning, and preparing the data that will power the AI. This is usually more work than it appears, because real-world data is messy in ways that only become visible when you try to use it for a specific purpose. Inconsistent labeling, coverage gaps, temporal distribution issues, representation biases — these surface in data mode and have to be resolved before model quality can be assessed.

**Experimentation mode.** Testing different approaches, architectures, or configurations against the evaluation set to find what works. Inherently iterative and often negative. Many experiments produce "we learned this doesn't work" rather than "we found the answer." This is the Explore phase in practice, and its value is in narrowing the hypothesis space.

**Engineering mode.** Implementing the winning approach at production quality: serving infrastructure, monitoring, API design, latency optimization, integration. This is where ML work most closely resembles traditional software engineering, and where estimates become more reliable.

The common PM mistake is assuming the team is always in engineering mode — that they know what they're building and are executing against it. When a team is in data or experimentation mode, asking for commit dates creates pressure to prematurely exit exploration, which produces worse outcomes. Track which mode the team is in and apply the appropriate planning model.

## What to Ask For (and What Not to Ask For)

### Ask for outcomes, not implementations

**Don't ask:** "Can you fine-tune the model on our customer data?"
**Do ask:** "Can you improve the categorization accuracy on customer support tickets? Fine-tuning is one option — I want to understand what approaches are available and what trade-offs each carries."

The first framing assumes a specific technical approach and limits the ML engineer's ability to find the best solution. The second describes the outcome and invites expertise on how to reach it.

**Don't ask:** "Can you add more training data?"
**Do ask:** "Our model is performing below threshold on billing-related tickets. What would it take to improve performance in that specific category?"

The first assumes the root cause (insufficient training data). It might be label quality, not volume. The second describes the gap and invites diagnosis.

### Ask for calibrated uncertainty, not false precision

**Don't ask:** "How long will this take?"
**Do ask:** "What's the range of possible timelines for this work, and what are the main dependencies that would make it shorter or longer?"

The first creates pressure for a single-point estimate that will either be gambled or inflated. The second acknowledges uncertainty and surfaces useful planning information.

**Don't ask:** "Will this reach 90% accuracy?"
**Do ask:** "Based on what we know about the data and the approach, what accuracy level do you think is achievable in a two-sprint Explore phase? What would need to be true to reach 90%?"

The first requests a commitment the engineer can't honestly give. The second surfaces the conditions under which the target is achievable — which is what you actually need.

### Ask for trade-offs, not decisions

ML engineers often have strong intuitions about technical trade-offs that they don't surface unless asked, because they're unsure whether it's their call to make. Ask explicitly before making decisions.

"What are the main trade-offs between the approaches you're considering? What do we give up and get with each?"

"If we wanted to cut latency in half, what would it cost in accuracy? And if we wanted to improve accuracy by 5 points, what would it cost in latency or compute?"

"Where in this feature are you most uncertain? What's keeping you up at night technically?"

That last question is particularly valuable. ML engineers often carry technical concerns they don't raise unless explicitly invited — they're not sure the PM wants to hear them. Creating a norm of surfacing concerns early, rather than mid-Harden at the worst possible moment, is one of the highest-leverage things a PM can do for an AI feature team.

## Why "Make It More Accurate" Is Not Actionable

"Make it more accurate" is the AI equivalent of "make it faster" in traditional software. Directionally correct. Not actionable without significant translation.

The reason: accuracy for an AI feature isn't a single number. It's a multidimensional performance profile with trade-offs between dimensions.

**Precision:** Of all tickets the AI labels as "billing," what fraction actually are billing tickets? High precision means few false positives — the AI is conservative and only classifies when confident.

**Recall:** Of all tickets that actually are billing tickets, what fraction does the AI correctly identify? High recall means few false negatives — the AI catches most of the relevant cases.

**Calibration:** When the AI assigns a 90% confidence score, is it right 90% of the time? Important for features where the confidence score is surfaced to users and influences their behavior.

**Robustness:** Does the AI perform consistently across different user populations, time periods, ticket lengths, and writing styles? A model that performs well on average but poorly for a specific customer segment has a robustness problem.

These dimensions trade off. Improving precision typically reduces recall. Improving robustness across many subpopulations often reduces average performance. When you say "make it more accurate," the ML engineer needs to know: accurate on which dimension, at what cost to the others?

### The Actionable Version

"Our user research showed that false positives in the billing category are creating rework for support agents. Can we improve precision in that category, and what would it cost in recall?"

"The evaluation shows we're underperforming on tickets from enterprise customers compared to SMB. What would it take to close that performance gap?"

Both are precise about where the problem is and give the ML engineer a specific optimization target.

## The Three Trade-Off Conversations

Three trade-offs come up in almost every AI feature delivery. They require the PM's input to resolve — they're product decisions with technical implications, not technical decisions to delegate.

### Accuracy vs. Latency

A more accurate AI is often a slower AI. Larger models produce better quality but take longer. Additional processing steps (retrieval, re-ranking, verification) improve quality but add latency. Running the model twice to verify improves reliability but doubles response time.

The product decision: what latency is acceptable for the user experience, and what quality improvement is worth a given latency increase?

This depends entirely on how the AI output is used. For a background process that categorizes tickets after submission, 5 seconds is fine. For an inline typing suggestion, anything over 200ms is unusable. For a nightly report generation, minutes are acceptable. The PM specifies the latency requirement. The ML engineer designs to it.

### Accuracy vs. Cost

Better quality typically costs more — larger/better models have higher inference costs, additional processing steps consume more compute, and fine-tuning at the required quality level requires expensive human labeling and review.

The product decision: what is the per-call cost at target volume, and do the unit economics of the feature support it?

A feature costing $0.02 per user per day is sustainable. One costing $0.50 per user per day might only work for enterprise pricing tiers. The PM needs to understand the cost structure at target scale and evaluate whether it's compatible with the product's economics.

### Automation vs. Human-in-the-Loop

As AI quality improves, the question shifts from "does this work?" to "how much human oversight do we need?" A feature might reach 90% accuracy on easy cases and 70% on hard cases. Do you automate everything and accept both error rates? Automate easy cases and route hard cases to human review? Always surface the AI output to a human for approval?

The product decision: given the cost of errors and the cost of human review, what's the right level of automation?

This is a risk management decision. The ML engineer can tell you the accuracy on each segment. The PM, informed by user research on the cost of errors, makes the call on automation level.

## When the Data Scientist Says "It Depends"

"It depends" is the most frequent response to PM questions in AI development, and it's almost always honest rather than evasive.

**"The accuracy depends on the data quality."**
What they mean: We haven't fully characterized the data yet. If it's as clean and representative as we hope, we can reach the target. If it has the quality issues we've seen in early exploration, we'll fall short.
How to move forward: Prioritize a data quality assessment sprint before committing to accuracy targets. Ask: "What's the worst-case accuracy if the data quality issues we've identified don't improve? Is that above or below our launch threshold?"

**"The timeline depends on whether the first approach works."**
What they mean: We have a primary approach and an alternative. If the primary works, we'll be done in X weeks. If it doesn't, we'll need Y additional weeks.
How to move forward: Ask for the full range (best case, most likely, worst case) and the specific conditions that determine which scenario occurs. Plan to the most likely case, budget contingency for the worst.

**"The performance depends on the input distribution in production."**
What they mean: We've evaluated on a test set, but we don't know if real user inputs will look like the test set. If they do, our quality metrics transfer. If they don't, we might see degradation.
How to move forward: Prioritize a production input sample analysis before full launch. Ask: "What's the minimum sample size we'd need from a limited beta to characterize the production distribution?"

**"Whether this is possible depends on what 'possible' means."**
What they mean: The task can be done, but the quality may not meet the threshold. A low-quality version is buildable; a high-quality version is uncertain.
How to move forward: Get explicit about the quality threshold and ask whether that specific threshold is achievable. "We need 87% precision on this specific task type. Is that achievable with the current approach? What would it take?"

## Building a Productive PM-ML Relationship

**Weekly sync with a standing agenda.** Not a status meeting — a working session. Agenda items: current phase status and gate timeline, emerging technical risks, trade-off decisions that need PM input, and blockers. Thirty minutes, recurring.

**Join evaluation reviews.** When the ML team reviews model outputs against the evaluation set, the PM should be there. Seeing real output examples creates intuition that no summary document can provide. You'll catch product issues — wrong tone, confusing explanations, edge cases the ML evaluation didn't flag — that the ML team won't see because they're looking at different dimensions.

**Build a shared vocabulary.** The most productive PM-ML teams develop shared language for the specific feature they're building. What does "good" look like for this specific output? What kinds of errors are "acceptable"? What does "distribution shift" mean in this specific context? Thirty minutes early in Frame building shared vocabulary on a whiteboard reduces ambiguity throughout the project.

**Be explicit about decision ownership.** ML engineers can tell you what's achievable, model trade-offs, and characterize risks. The product decisions — what accuracy level to require, which trade-off to accept, what edge cases to design around, when to launch — are yours to make, informed by their expertise. Say this explicitly: "I'm asking you to tell me what's feasible and what the trade-offs are. The decision about which trade-off to accept is mine." This removes ambiguity about whose call it is and allows ML engineers to surface information without feeling like they're making product commitments.

The highest-leverage thing a PM can do in an AI feature team isn't writing better specs. It's asking better questions and making the right decisions faster.
