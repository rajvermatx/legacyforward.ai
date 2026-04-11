---
title: "Working with ML Engineering Teams"
slug: "working-with-ml-teams"
description: "The PM-ML engineer collaboration gap is one of the most common sources of friction and failure in AI feature development. This chapter covers the translation layer between product and ML, what to ask for and how, why 'make it more accurate' is not actionable, how to navigate trade-off conversations, and what data scientists mean when they say 'it depends.'"
section: "ai-pm"
order: 6
part: "Part 03 Delivery"
badges:
  - "Team Collaboration"
  - "PM-Engineer Interface"
---

# Working with ML Engineering Teams

## The Translation Gap


![Diagram](/diagrams/ai-pm/ch06-1.svg)
Most product managers have developed a working relationship with software engineers over years of practice. You've learned how to write requirements that are actionable, how to ask for estimates without creating false precision, how to scope down without demoralizing the team, and how to translate user needs into technical work without dictating implementation.

ML engineers and data scientists are different enough from software engineers that this accumulated instinct doesn't fully transfer — and the gaps are in specific places that are predictable and addressable once you know where to look.

The PM-ML translation gap shows up in four recurring patterns:

**Pattern 1: The PM asks for outcomes; the ML engineer hears implementation constraints.** A PM says "I need the recommendation to be more relevant." The ML engineer starts thinking about loss functions, training data curation, and retrieval architecture. The PM is describing a user experience; the ML engineer is hearing a technical specification that's either too vague to act on or implies a specific approach.

**Pattern 2: The ML engineer communicates uncertainty; the PM hears hedging.** An ML engineer says "I think we can probably reach 85% accuracy, but it really depends on the data distribution." The PM hears "they're not committing." The ML engineer means "the answer is genuinely unknown until we see the data, and if I give you a specific number without the caveat I'm misleading you."

**Pattern 3: The PM expects a feature; the ML engineer delivers a capability.** A PM expects a finished, user-facing feature at the end of a sprint. An ML engineer produces a model that achieves the target accuracy — and considers the work done. The gap between "model works" and "feature ships" is substantial and often underplanned.

**Pattern 4: Quality conversations speak different languages.** A PM says "the AI needs to be better." An ML engineer says "precision is 87% but recall is 62%, and improving recall by 10 points would require accepting a precision drop to 79%." These are both about the same underlying issue, but neither person can act on what the other said.

This chapter closes each of these gaps.

## Understanding What ML Engineers Actually Do

The first step in closing the translation gap is having an accurate mental model of what the people you're working with actually spend their time on. This is not about learning ML — it's about understanding the workflow.

An ML engineer or data scientist working on a new AI feature typically moves through three distinct modes of work, often in parallel:

**Data mode:** Understanding, cleaning, and preparing the data that will power the AI. This is usually more work than it appears, because real-world data is messy in ways that become visible only when you try to use it for a specific purpose. Inconsistent labeling, coverage gaps, temporal distribution issues, and representation biases in the training set all surface in data mode and have to be resolved before model quality can be assessed.

**Experimentation mode:** Testing different approaches, architectures, or configurations against the evaluation set to find what works. This is inherently iterative and often negative — many experiments produce "we learned this doesn't work" rather than "we found the answer." Experimentation mode is the equivalent of the Explore phase, and its value is in narrowing the hypothesis space.

**Engineering mode:** Implementing the winning approach at production quality, including serving infrastructure, monitoring, API design, latency optimization, and integration. This is where ML work most closely resembles traditional software engineering, and it's where estimates become more reliable.

A common PM mistake is assuming the team is always in engineering mode — that they know what they're building and are executing against it. When a team is in data or experimentation mode, asking for commit dates creates pressure to prematurely exit exploration, which produces worse outcomes. The PM's job is to track which mode the team is in and apply the appropriate planning model.

## What to Ask For (and What Not to Ask For)

Knowing how to formulate requests is the PM's primary contribution to a productive PM-ML relationship. Here are the most important distinctions.

### Ask for outcomes, not implementations

**Don't ask:** "Can you fine-tune the model on our customer data?"
**Do ask:** "Can you improve the categorization accuracy on customer support tickets? Fine-tuning is one option — I want to understand what approaches are available and what trade-offs each carries."

The first framing assumes a specific technical approach and limits the ML engineer's ability to find the best solution. The second framing describes the outcome and invites expertise on how to reach it.

**Don't ask:** "Can you add more training data?"
**Do ask:** "Our model is performing below threshold on billing-related tickets. What would it take to improve performance in that specific category?"

The first framing makes an assumption about the root cause (insufficient training data) that may be wrong — the problem might be label quality, not volume. The second describes the gap and invites diagnosis.

### Ask for calibrated uncertainty, not false precision

**Don't ask:** "How long will this take?"
**Do ask:** "What's the range of possible timelines for this work, and what are the main dependencies that would make it shorter or longer?"

The first framing creates pressure for a single-point estimate that will either be gambled or inflated. The second acknowledges uncertainty and creates useful planning information.

**Don't ask:** "Will this reach 90% accuracy?"
**Do ask:** "Based on what we know about the data and the approach, what accuracy level do you think is achievable in a two-sprint Explore phase? What would need to be true to reach 90%?"

The first framing requests a commitment the engineer can't honestly give. The second surfaces the conditions under which the target is achievable — which is the information you actually need.

### Ask for trade-offs, not decisions

ML engineers often have strong intuitions about technical trade-offs that they don't surface unless asked, because they're uncertain whether it's their call to make. Ask explicitly for the trade-off landscape before making decisions.

**Ask:** "What are the main trade-offs you see between the approaches you're considering? What do we give up and get with each?"

**Ask:** "If we wanted to cut latency in half, what would it cost us in accuracy? And if we wanted to improve accuracy by 5 points, what would it cost in latency or compute?"

**Ask:** "Where in this feature are you most uncertain? What's keeping you up at night technically?"

The last question is particularly valuable. ML engineers often carry technical concerns that they don't raise unless explicitly invited, because they're not sure the PM wants to hear them. Creating a norm of surfacing technical concerns early — rather than at the worst possible time, mid-Harden — is one of the highest-value things a PM can do for an AI feature team.

## Why "Make It More Accurate" Is Not Actionable

"Make it more accurate" is the AI equivalent of "make it faster" or "make it better" in traditional software — directionally correct, but not actionable without significant translation work.

The reason it's not actionable is that "accuracy" for an AI feature is not a single number. It's a multidimensional performance profile with trade-offs between dimensions. Let's take a classification example.

An AI that classifies support tickets into categories can be tuned along multiple quality dimensions:

**Precision:** Of all tickets the AI labels as "billing," what fraction actually are billing tickets? High precision means few false positives — the AI is conservative and only classifies when confident.

**Recall:** Of all the tickets that actually are billing tickets, what fraction does the AI correctly identify? High recall means few false negatives — the AI catches most of the relevant cases.

**Calibration:** When the AI assigns a 90% confidence score, is it right 90% of the time? Calibration is important for features where the confidence score is surfaced to users and influences their behavior.

**Robustness:** Does the AI perform consistently across different user populations, time periods, ticket lengths, and writing styles? A model that performs well on average but poorly for a specific customer segment has a robustness problem.

These dimensions trade off against each other. Improving precision typically reduces recall. Improving robustness across many subpopulations often reduces average performance. When you say "make it more accurate," the ML engineer needs to know: accurate on which dimension, and at what cost to the others?

### The Actionable Version

Convert "make it more accurate" to: "Our user research showed that false positives in the billing category are creating rework for support agents. Can we improve precision in that category, and what would it cost in recall?"

Or: "The evaluation shows we're underperforming on tickets from enterprise customers compared to SMB customers. What would it take to close that performance gap?"

Both of these are precise about where the problem is and give the ML engineer a specific optimization target rather than a generic improvement direction.

## The Trade-Off Conversations

Three trade-offs come up in almost every AI feature delivery and require the PM's input to resolve — because they are not technical decisions, they're product decisions that happen to have technical implications.

### Accuracy vs. Latency

A more accurate AI is often a slower AI. Larger models produce better quality but take longer to respond. Additional processing steps (retrieval, re-ranking, verification) improve quality but add latency. Running the model twice to verify the output improves reliability but doubles response time.

The product decision: what latency is acceptable for the user experience, and what quality improvement is worth a given latency increase?

This depends entirely on how the AI output is used. For a background process that categorizes tickets after they're submitted, a 5-second latency is fine. For an inline typing suggestion that appears as users type, anything over 200ms is unusable. For a nightly report generation, minutes are acceptable. The PM specifies the latency requirement; the ML engineer designs to it.

### Accuracy vs. Cost

Better AI quality typically costs more — either because larger/better models have higher inference costs, because additional processing steps consume more compute, or because fine-tuning and evaluation at the required quality level require expensive human labeling and review.

The product decision: what's the per-call cost at target volume, and does the unit economics of the feature support it?

A feature that costs $0.02 per user per day is sustainable. A feature that costs $0.50 per user per day might only work for enterprise pricing tiers. A feature that costs $0.001 per call but has latency so high that users lose confidence might not be worth the cost saving. The PM needs to understand the cost structure at target scale and evaluate whether it's compatible with the product's economics.

### Automation vs. Human-in-the-Loop

As AI quality improves, the question shifts from "does this work?" to "how much human oversight do we need?" A feature might reach 90% accuracy on easy cases and 70% on hard cases. Do you automate everything and accept the 10% and 30% error rates? Do you automate easy cases and route hard cases to human review? Do you always surface the AI output to a human for approval?

The product decision: given the cost of errors and the cost of human review, what's the right level of automation?

This is a risk management decision, not a technical one. The ML engineer can tell you what the accuracy is on each segment. The PM, informed by user research on the cost of errors (Chapter 4), makes the call on automation level.

> **Think of it like this:** An AI copilot for an airplane assists with navigation and routine operations — but a human pilot is always in the loop for critical decisions. An AI that predicts whether a landing is safe doesn't make the landing; it informs the judgment of the person who does. How much of the "flying" you automate depends on the consequences of a wrong call, not on the raw capability of the AI.

## When the Data Scientist Says "It Depends"

"It depends" is the most frequent response to PM questions in AI development, and it's almost always honest rather than evasive. Here's a field guide to the most common "it depends" situations and how to move past them.

**"The accuracy depends on the data quality."**
What they mean: We haven't fully characterized the data yet. If the data is as clean and representative as we hope, we can reach the target. If it has the quality issues we've seen in early exploration, we'll fall short.
How to move forward: Prioritize a data quality assessment sprint before committing to accuracy targets. Ask: "What's the worst-case accuracy if the data quality issues we've identified don't improve? Is that above or below our launch threshold?"

**"The timeline depends on whether the first approach works."**
What they mean: We have a primary approach and an alternative. If the primary works, we'll be done in X weeks. If it doesn't, we'll need Y additional weeks to validate the alternative.
How to move forward: Ask for the full range (best case, most likely case, worst case) and the specific conditions that determine which scenario occurs. Plan to the most likely case, budget contingency for the worst case.

**"The performance depends on the input distribution in production."**
What they mean: We've evaluated on a test set, but we don't know if real user inputs will look like the test set. If they do, our quality metrics transfer. If they don't, we might see degradation.
How to move forward: Prioritize a production input sample analysis before full launch. Ask: "What's the minimum sample size we'd need from a limited beta to characterize the production distribution?"

**"Whether this is possible depends on what 'possible' means."**
What they mean: The task can be done, but the quality may not meet the threshold. A low-quality version is buildable; a high-quality version is uncertain.
How to move forward: Get explicit about the quality threshold and ask whether that specific threshold is achievable. "We need 87% precision on this specific task type. Is that achievable with the current approach? What would it take?"

## Building a Productive PM-ML Relationship

The structural practices that make PM-ML collaboration work:

**Weekly sync with a standing agenda.** Not a status meeting — a working session. Agenda items: current phase status and gate timeline, emerging technical risks, trade-off decisions that need PM input, and blockers. Keep it to 30 minutes; make it recurring.

**Join evaluation reviews.** When the ML team reviews model outputs against the evaluation set, the PM should be in the room (or on the call). Seeing real output examples creates intuition that no summary document can provide. You will catch product issues — wrong tone, confusing explanations, edge cases the ML evaluation didn't flag — that the ML team won't see because they're looking at different dimensions.

**Create a shared vocabulary.** The most productive PM-ML teams develop a shared language for the specific feature they're building. What does "good" look like for this specific output? What kinds of errors are "acceptable"? What does "distribution shift" mean in this specific context? Spending 30 minutes early in the Frame phase building a shared vocabulary on a whiteboard reduces ambiguity throughout the project.

**Treat ML engineers as the experts on feasibility, not on product decisions.** ML engineers can tell you what's achievable. They can model trade-offs. They can characterize risks. The product decisions — what accuracy level to require, what trade-off to accept, what edge cases to design around, when to launch — are yours to make, informed by their expertise. Be explicit about this division of responsibility. "I'm asking you to tell me what's feasible and what the trade-offs are. The decision about which trade-off to accept is mine." This removes the ambiguity about whose call it is and allows ML engineers to surface information without feeling like they're making product commitments.

## Summary

The PM-ML translation gap shows up in four recurring patterns: PM outcomes vs. ML implementation thinking, ML uncertainty vs. PM hedging interpretation, model delivery vs. feature delivery, and quality conversation language mismatches. Each has a practical remedy rooted in asking for outcomes, calibrated ranges, and explicit trade-offs rather than implementations, false precision, and single-number accuracy.

"Make it more accurate" is not actionable because accuracy is multidimensional. Convert it to specific dimensions (precision, recall, robustness), specific user-facing failure modes (false positives causing rework, edge cases causing errors), and specific trade-off questions (what does a 5-point precision improvement cost in recall?).

The three core product decisions in AI trade-off conversations — accuracy vs. latency, accuracy vs. cost, and automation level — are product decisions with technical implications, not technical decisions the PM can delegate. Understanding them, asking the right questions, and making them explicitly is the PM's highest-leverage contribution to an AI feature team.
