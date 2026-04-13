---
title: "Capstone: The Failed AI Pilot"
slug: "capstone-failed-ai-pilot"
description: "A worked example in kill discipline: a 6-month AI pilot showed 'promising results' but the team wants another 6 months. Walk through the kill framework, sunk cost analysis, upward communication strategy, and how to redirect the team and salvage learnings."
section: "ai-pm"
order: 15
part: "Part 06 Capstones"
badges:
  - "Capstone"
  - "Applied Framework"
---

# Capstone: The Failed AI Pilot

## The Scenario


![Diagram](/diagrams/ai-pm/capstone-03.svg)
You are the senior PM at **Verity**, a legal tech company serving mid-market law firms. Eight months ago, the VP of Product greenlit an AI-powered contract review feature — "SmartReview" — that was supposed to automatically identify non-standard clauses, flag missing provisions, and suggest edits aligned with the firm's preferred terms.

The pilot was originally planned for 3 months with 10 law firm customers. It is now month 8, with a team of 4 engineers, 1 ML engineer, and a data scientist dedicated to the project.

The team lead presents at the quarterly review:

> "SmartReview has shown really promising results. Our pilot users say they like the interface. We've improved our clause detection accuracy from 54% to 71% over the past 6 months. We think we're close to a breakthrough. We'd like another 6 months to get to 85%+ accuracy before we expand."

Your VP asks you: "What do you think? Should we keep going?"

---

## Step 1: Apply the Kill Discipline Framework

Before responding, you need to ask the questions that separate genuine progress from sunk cost rationalization.

### The Kill Criteria Audit

Go back to the original project brief. What were the success criteria that were established at launch?

If no explicit kill criteria were defined — which is common and a red flag in itself — reconstruct them from the original business case:

**Reconstructed kill criteria from the original proposal:**

| Criterion | Original target | Status at month 8 |
|---|---|---|
| Clause detection accuracy | 85%+ | 71% — NOT MET |
| Pilot customer retention | 8/10 pilot customers actively using at month 3 | 4/10 actively using at month 8 — NOT MET |
| User satisfaction | >4.0/5.0 | 3.2/5.0 — NOT MET |
| Time-to-value for pilot users | Attorneys save >30 min/contract | Saving ~8 min/contract — NOT MET |
| Revenue signal | 3+ pilot customers willing to pay for the feature | 1 has expressed interest — NOT MET |

Every criterion was missed. Not narrowly — by significant margins in most cases.

### The "Promising Results" Interrogation

"Promising results" is one of the most dangerous phrases in AI product development. It is almost always true in a technically accurate but contextually misleading sense. Before accepting this framing, ask:

**1. Promising compared to what?**

Improving from 54% to 71% clause detection accuracy sounds like meaningful progress. But:
- What was the target? (85%)
- What does 71% accuracy mean in practice for attorneys? (3 of every 10 clauses are wrong — is that acceptable for legal work?)
- How does 71% compare to what an attorney does manually? (Attorneys reviewing their own templates likely identify 95%+ of non-standard clauses — the AI is substantially worse)
- What does 71% mean for the user experience? (At this accuracy level, attorneys may be double-checking every AI suggestion, creating more work, not less)

**2. What is the trajectory saying?**

Plot the accuracy improvement over time:

| Month | Accuracy | Month-over-month improvement |
|---|---|---|
| 1 | 54% | (baseline) |
| 2 | 59% | +5pp |
| 3 | 63% | +4pp |
| 4 | 66% | +3pp |
| 5 | 68% | +2pp |
| 6 | 70% | +2pp |
| 7 | 71% | +1pp |
| 8 | 71% | 0pp |

The trajectory is a classic improvement curve that has flattened. The team has reached diminishing returns. Projecting forward: at 1pp improvement per month (optimistically), reaching 85% takes 14 more months. The team is asking for 6.

**3. What are the pilot customers actually doing?**

4 of 10 pilot customers are "actively using" SmartReview at month 8. Dig into this:
- What does "actively using" mean? Weekly? Monthly?
- Of the 6 not actively using it: did they disengage? Did they try it and stop? Why?
- Are the 4 active users using SmartReview because it is genuinely useful, or because they feel obligated as pilot participants?

Interview the disengaged customers. Their answers will be more revealing than the active users'.

### The Honest Assessment

Based on this analysis, the honest answer to "should we keep going?" is:

**The evidence does not support another 6 months of investment in the current approach.**

The accuracy trajectory has flattened well below the target. Pilot customer retention is poor. The product is not saving attorneys the time promised. Revenue interest is minimal. Asking for 6 more months is asking for the same team and budget to produce a 14-point accuracy improvement when the last 8 months produced a 17-point improvement — but the marginal returns are clearly falling.

---

## Step 2: Evaluate Sunk Cost vs. Future Value

The hardest part of this decision is the sunk cost. Eight months. A 6-person team. Significant infrastructure investment. Real customer relationships. It feels like killing the project wastes all of that.

It does not. This is the sunk cost fallacy, and it is one of the most reliable destroyers of PM credibility.

### The Right Question

The right question is never: "How much have we invested so far?" The right question is always: "If we were starting from scratch today, knowing what we know, would we make this investment?"

The answer, for SmartReview, is: No.

You know the accuracy ceiling is lower than originally modeled. You know attorney adoption is poor. You know the time-savings are insufficient to change behavior. You know the competitive market has moved and at least two other legal tech vendors have launched more capable contract review AI in the last 6 months.

### The Future Value Calculation

The team is asking for 6 more months. What are you buying?

**Optimistic scenario**: The team figures out the accuracy plateau and reaches 85% by month 14.
- You've spent another ~$400K in team cost (rough estimate: 6 people × 6 months)
- You're now in an 85% accuracy product that still has to sell into a market with mature competitors
- You're 14 months from the original launch date and have 1 paying customer interested

**Realistic scenario**: The accuracy plateau is a ceiling caused by data quality and model limitations that 6 more months will partially address. You reach 77–78% accuracy by month 14.
- You've spent the same $400K
- You have a product that is still below the original target, still below what manual review achieves, and still has poor pilot retention
- The decision to kill will be just as hard — but now $400K harder

**The comparison**: What would $400K and 6 headcount months accomplish if redirected to a problem with clearer evidence of fit?

---

## Step 3: Communicate the Kill Decision Upward

Killing a project that has been publicly championed, that has a dedicated team, and that has customer relationships is a leadership communication challenge. How you do it matters as much as what you decide.

### What Not to Do

**Do not present it as a failure.** Presenting the kill as a failure invites defensiveness from everyone who invested in the project and makes the decision harder to accept.

**Do not surprise the VP.** If your VP is going to hear "kill it" for the first time in a group review, they have no time to process and will often default to defending the team rather than engaging with your analysis. Brief them 1:1 before the group meeting.

**Do not let the team hear it from someone else.** Tell the team directly, ideally before the formal communication goes up. They deserve to hear it from you, with context, before the org announcement.

### The Upward Communication Framework

Brief the VP (and skip-level if relevant) with this structure:

**1. The decision, stated clearly upfront.**

"I recommend we close the SmartReview pilot and redirect the team. Here is my reasoning."

Do not bury the recommendation at the end. Decision-makers lose respect for PMs who meander to a conclusion. State it first, justify it after.

**2. The evidence, without editorializing.**

Present the data from Step 1. No dramatic framing. Just: here is what we targeted, here is where we are, here is the trajectory. Let the numbers speak.

**3. The forward path, not just the closedown.**

The worst kill conversations end with "and so we are shutting it down." The best ones continue: "and here is what I propose we do instead." Show that you have thought about where to redirect the team's capability, what you have learned that can be applied elsewhere, and what the team's next assignment should be.

**4. The customer plan.**

"Here is how we will communicate with the 10 pilot firms, what we will offer them, and who owns those relationships going forward." Leaving customers in ambiguity while you sort out the internal decision is not acceptable.

**Sample upward communication:**

> "SmartReview has been a meaningful learning investment, but the evidence says it's time to redirect. Our accuracy has plateaued at 71% against an 85% target, pilot customer retention is 40%, and user satisfaction is 3.2/5. The trajectory doesn't support reaching the original success criteria in another 6 months.
>
> My recommendation is to close the pilot at the end of this quarter. We'll thank our pilot customers personally, offer them 6 months of complimentary access to our core platform as goodwill, and have our senior CS team manage the transition.
>
> The learnings from SmartReview — our clause taxonomy, the legal document training data we've accumulated, the RAG infrastructure we built — are directly applicable to a narrower use case I want to propose: an AI-powered missing provision checklist for standard NDAs. This is a significantly simpler task with higher accuracy potential. I'd like to present that proposal in two weeks."

### Handling Pushback

**"But we're so close!"** Ask for specificity: what does "close" mean? What will be different in 6 months that is not true today? What evidence supports the belief that the accuracy plateau will break? If the answer is "we think we're almost there," that is not evidence.

**"The pilot customers like it!"** Segment this: which customers like it, how much are they using it, and are they willing to pay for it? Liking a free pilot and paying for a product are different things.

**"We've invested so much already."** Acknowledge the investment directly: "We have, and none of that work is wasted — we've built infrastructure, domain knowledge, and a dataset that will be foundational for what we do next. But the path we're on isn't leading to a product that customers will pay for. More time on this path doesn't change that."

---

## Step 4: Redirect the Team and Salvage Learnings

The kill decision is not the end of the story. How you handle what comes after determines whether the team learns and grows, or whether they feel punished for working on a hard problem.

### What to Preserve

**The data and infrastructure**: The document corpus, clause taxonomy, and RAG retrieval infrastructure built for SmartReview likely has value for future AI features. Document what was built, where it lives, and what future use cases it could serve. Do not let it die with the project.

**The domain knowledge**: The ML engineer and data scientist have spent 8 months learning the structure of legal documents, the vocabulary of contract review, and the failure modes of AI in high-stakes professional contexts. This knowledge does not live in code. It lives in people. Keep them engaged with AI work.

**The relationships**: The pilot customers, even the ones who disengaged, had real conversations with your team about what they needed. These conversations are qualitative research data. Synthesize the findings before the pilot closes.

**The evaluation infrastructure**: The clause detection evaluation suite, the rubrics, the human review process — these are reusable for any future legal AI feature. Document them explicitly.

### How to Brief the Team

Have the conversation in person or on video. Not in a Slack message.

Structure:
1. What you have decided and why, with the evidence briefly stated.
2. What you respect about the work they have done.
3. What is being preserved and why it matters.
4. What is next for each person on the team.

The most important part of point 4 is that you have actually thought about it before the conversation. "I am not sure yet" is not a reassuring answer when someone is hearing their project is being killed. Even a provisional next assignment communicates that the person's future was in your mind when you made the decision.

### The Learnings Report

Before the project fully closes, produce a brief learnings report:

| Question | Answer |
|---|---|
| What did we originally believe? | [The original hypothesis] |
| What turned out to be true? | [What the pilot validated] |
| What turned out to be false? | [What the pilot invalidated] |
| What did we not anticipate? | [Surprises — positive and negative] |
| What should the next team know? | [Specific recommendations for future AI legal tech work] |
| What assets exist that future work should use? | [Data, infrastructure, documentation] |

Share this report broadly — not as a post-mortem of failure, but as institutional knowledge that protects future projects from the same assumptions.

---

## The Meta-Lesson

The real test of kill discipline is not whether you can identify a failing project. Most experienced PMs can see the signs. The test is whether you can make the call before the sunk costs become overwhelming, whether you can communicate it with clarity and respect, and whether you can turn the closedown into a forward-looking moment rather than a backward-looking autopsy.

SmartReview was not a waste. It was an 8-month investment that produced a clear answer to an important question: AI-powered full-contract review at attorney-grade accuracy is not achievable with current technology for this use case at this team's resources. That answer is worth having. It was purchased with 8 months. A team that did not ask the question early enough could have purchased it with 2 years.

Kill discipline is the discipline of buying that answer at the lowest possible price.
