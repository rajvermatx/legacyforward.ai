---
title: "Discovery for AI Features"
slug: "discovery-for-ai"
description: "Discovery for AI features requires techniques that traditional product research doesn't provide. This chapter covers Wizard-of-Oz testing, non-determinism tolerance research, probabilistic acceptance criteria, the user expectations gap — and how to translate all of that into AI story templates with edge case inventories and kill criteria that give your engineering team a real specification."
section: "ai-pm"
order: 3
part: "Part 02 Discovery"
badges:
  - "User Research"
  - "Non-determinism"
  - "Requirements"
  - "Probabilistic Criteria"
---

# Discovery for AI Features

## The Fundamental Research Problem


![Diagram](/diagrams/ai-pm/ch03-1.svg)
User research for a new feature usually starts with a simple premise: go talk to users, understand their pain, show them concepts, gather feedback. This approach works well when the feature exists in a category users understand — a new filter, a redesigned dashboard, a faster workflow. Users can relate it to things they've experienced before and give you useful reactions.

AI features break this premise in a specific way: most users do not have an accurate mental model of what AI can and cannot do. They have a mental model — usually assembled from product demos they've seen, science fiction they've consumed, and media coverage — but it is reliably wrong in ways that will lead your research astray if you don't account for it.

Ask users if they'd like an AI that summarizes their data. They'll say yes. Ask them if they'd like an AI that sometimes gets the summary slightly wrong. They'll say no. Neither answer tells you much that's useful. The first doesn't distinguish genuine demand from reflexive enthusiasm. The second doesn't tell you what "slightly wrong" means to them or whether they'd actually behave differently.

The goal of user research for AI features is not to ask users what they want — it's to expose them to realistic AI behavior and study how they actually respond.

## Why You Can't Just Ask

The problem with asking users about AI features is that the answers you get reflect their imagination of the feature, not their response to it. And imagination almost always creates a more perfect version than reality.

When a user says "I would love it if AI could automatically categorize all my support tickets," they are imagining an AI that categorizes correctly, instantly, without any review burden, and that they can fully trust. When you build that feature and it categorizes correctly 87% of the time (which is actually quite good), they experience something different from their imagination: a system that is sometimes wrong, requires spot-checking, and occasionally creates more work than it saves when corrections are needed.

Their stated preference said "yes." Their behavior in production says "I'll use this only when I'm in a hurry and double-check the ones that matter." That gap — between stated preference and actual usage behavior — is the user research problem you need to solve before you build.

> **Think of it like this:** Asking users whether they want AI in their workflow is like asking someone whether they want a sous chef in their kitchen. "Of course!" they say — imagining a professional who anticipates their needs, prepares everything perfectly, and never makes a mess. What they actually get is an assistant who is excellent at 80% of tasks, occasionally seasons things wrong, and needs to be redirected periodically. Whether the sous chef is worth it depends not on the ideal version, but on the realistic version — and that's what your research needs to expose.

## Wizard-of-Oz Testing

Wizard-of-Oz testing is the single most valuable research technique for AI features. The name comes from the concept in the original story: behind the impressive curtain is a human operating the machinery, not magic.

In a Wizard-of-Oz test, you simulate the AI's behavior with a human — typically a researcher or a knowledgeable team member — while the user interacts with what they believe (or reasonably assume) to be an AI system. The human "wizard" receives the same inputs the AI would receive and produces outputs that simulate what a good AI might produce, including realistic imperfections.

### How to Run a Wizard-of-Oz Test

**Step 1: Define the interaction surface.** What does the AI receive as input, and what does it return as output? Map this precisely. A summarization AI receives a document and returns a summary. A categorization AI receives a ticket and returns a category and confidence score. The Wizard needs to know exactly what to produce.

**Step 2: Define the quality distribution.** A Wizard-of-Oz test that always produces perfect outputs doesn't tell you anything about user tolerance for imperfection. Before the test, define the mix of output quality you'll simulate: perhaps 80% accurate, 15% approximately correct (right category, wrong subcategory), 5% clearly wrong. Use realistic error patterns, not arbitrary ones — if you know what kinds of mistakes the AI is likely to make, simulate those specifically.

**Step 3: Design realistic scenarios.** Give users real tasks from their actual workflow, not abstract prompts. "Here are five support tickets — use the categorization tool and then respond to each" produces more useful data than "play around with this categorization feature."

**Step 4: Observe behavior, not opinions.** While users interact with the simulated AI, watch what they do. Do they accept outputs without reviewing them? Do they correct outputs when they're wrong? Do they verify the AI's output against their own judgment? Do they use the output as a starting point or ignore it? How long does it take them to realize an output is wrong?

**Step 5: Ask about the experience, not the technology.** After the session, ask about workflow fit, trust, and frustration points — not about the AI specifically. "When the tool suggested the wrong category on that third ticket, what went through your mind?" yields better data than "Do you trust the AI's categorizations?"

### What Wizard-of-Oz Testing Tells You

Good Wizard-of-Oz testing answers three questions that are impossible to answer through surveys or interviews alone:

1. **At what error rate does the AI become net-negative for the user's workflow?** This is the most important finding. It tells you the quality floor below which shipping the feature would harm users.

2. **What kinds of errors are tolerable and which are catastrophic?** Users often have asymmetric tolerance: they'll accept errors in low-stakes decisions and have zero tolerance for errors in high-stakes ones. This shapes where you invest in quality improvement.

3. **Do users integrate the AI output into their workflow, or do they treat it as advisory?** Some features will become load-bearing — users will stop doing the underlying work themselves and rely entirely on the AI. Others will remain advisory — users will use the AI as a starting point but always apply their own judgment. Knowing which you're building changes how you design the product and how you monitor it in production.

## Discovering Tolerance for Non-Determinism

AI features produce different outputs for similar inputs. A user asks the same question twice and gets two different phrasings. Two users submit similar tickets and get different categorizations. A summary generated today is slightly different from a summary generated tomorrow.

This non-determinism is not a bug. It is intrinsic to how most AI systems work. But users often experience it as a bug — specifically, as inconsistency — and inconsistency erodes trust in ways that are hard to recover from.

Your user research needs to surface users' tolerance for non-determinism, because it is not uniform across user types, workflows, or stakes levels.

### The Non-Determinism Tolerance Research Protocol

Run structured sessions where you deliberately show users two outputs for equivalent inputs and ask them to evaluate both.

**Low-stakes non-determinism:** Show two slightly different summaries of the same document. Ask: does it matter that these are different? Which is better? Would you want the system to always produce the same summary for the same document?

**High-stakes non-determinism:** Show two different risk assessments for similar customer profiles, or two different categorizations for similar support tickets. Watch for elevated concern. Ask: does this variation concern you? How would you handle a situation where you got a different answer than a colleague got for the same case?

**Consequential non-determinism:** Show outputs that differ on a dimension that would change the user's action. A recommendation to escalate vs. a recommendation to resolve. A high-risk vs. medium-risk classification. Ask: if the system had classified this differently, would you have done something different?

Document the patterns. Users who accept non-determinism in informational contexts but are troubled by it in action-triggering contexts are telling you to design different confidence communication for different use cases. Users who expect full consistency even in low-stakes contexts need more explicit framing around how AI works.

> **Think of it like this:** Doctors tolerate diagnostic ambiguity because they've been trained to think probabilistically. Accountants have zero tolerance for rounding inconsistency because their domain requires deterministic precision. Your users bring their professional tolerance calibration to your AI features — you need to know what domain they're working in before you understand what consistency standards they'll hold you to.

## Defining "Good Enough": Probabilistic Acceptance Criteria

Traditional acceptance criteria are binary: the feature does X or it doesn't. You can write a test that passes or fails. AI features require probabilistic acceptance criteria: the feature does X correctly at least Y% of the time under Z conditions.

The job of user research is to establish what Y needs to be for the feature to deliver the behavioral outcome in your value hypothesis. This is not a technical question — it is a user experience question, and the answer has to come from users.

### The Research Method

Design a task where the AI output directly influences a user decision. Structure it so you can control the accuracy rate the user experiences. Run the task at multiple accuracy levels — say 70%, 80%, 90%, 95% — across different user segments and measure:

**Task completion rate:** Do users complete the task successfully even when some AI outputs are wrong?

**Correction rate:** How often do users catch and correct wrong outputs? Does this change at different accuracy levels?

**Trust trajectory:** Does trust in the AI increase, decrease, or stay stable over the course of the session? At what accuracy level does trust deteriorate noticeably?

**Stated threshold:** Ask users directly: "If the tool was right [X]% of the time, would you use it in your daily workflow?" Cross-reference this with their observed behavior — stated and behavioral thresholds often diverge.

From this research, you should be able to produce a table like this:

| Accuracy Level | User Trust | Task Completion | Correction Overhead | Adoption Likelihood |
|---|---|---|---|---|
| 70% | Low — users frequently frustrated | Partial — users abandon complex tasks | High — users re-doing significant work | Unlikely — only for trivial tasks |
| 80% | Moderate — acceptable for advisory use | Good — most tasks completed | Moderate — manageable review burden | Conditional — for lower-stakes decisions |
| 90% | Good — users comfortable delegating | High | Low | High — most users would incorporate |
| 95% | High — users trust proactively | Very high | Minimal | Very high — users rely on it |

This table becomes a direct input to your technical requirements: your team needs to achieve at least the accuracy level that maps to "High adoption likelihood" for your specific user segment and use case. Below that bar, shipping the feature creates user experience harm regardless of the technical achievement.

## The User Expectations Gap

Users arrive at AI features with a set of expectations formed by everything they've seen, read, and experienced. The gap between those expectations and what your feature actually does is one of the primary sources of user disappointment, trust erosion, and eventual abandonment.

The expectations gap has four common forms:

**The precision gap:** Users expect the AI to be precisely right, not approximately right. A summarization AI that captures the main themes of a document but misses one important nuance is, from a user's perspective, wrong — even though from a technical perspective it's performing well.

**The consistency gap:** Users expect the AI to behave consistently across similar inputs. Inconsistency is experienced as unreliability, even when the underlying AI outputs are all technically correct.

**The explanation gap:** Users want to know why the AI said what it said. "This account is at high churn risk" is less useful and less trustworthy than "This account is at high churn risk because NPS dropped 20 points last month and no feature adoption has occurred in 60 days." Without reasoning, users can't evaluate whether the AI's judgment is sound.

**The scope gap:** Users assume the AI knows everything relevant to the task. A customer success AI that provides churn predictions doesn't know about the offline conversation the account manager had last week — but the user expects it to factor in everything relevant.

Each gap needs a research protocol to surface it and a design response to address it. The explanation gap is usually addressed through transparency design. The scope gap is usually addressed through explicit communication about what data the AI does and doesn't see. The precision and consistency gaps require calibrating user expectations through onboarding and ongoing UI communication.

### Closing the Gap Through Research

To surface the expectations gap, run a specific type of session: show users an AI output, then ask them to explain in their own words why the AI produced that output, and what the AI would need to know to improve it.

This exercise reliably reveals assumptions users are carrying that don't match how your feature works. A user who explains a churn prediction by saying "it probably analyzed the email sentiment in their support tickets" when your feature doesn't use email at all has an expectations gap you need to close — either by actually using email sentiment or by clearly communicating that you don't.

## The Problem with "As a User, I Want..."

The standard user story format has served product teams well for decades. "As a [user type], I want [capability] so that [outcome]." It's concise, user-centered, and easy to write. But it was designed for systems where behavior is fully determined by the logic in the code — where given the same inputs, you always get the same output, and where "done" means the system does what it's specified to do.

AI features are not those systems. When you write "as a support manager, I want tickets to be automatically categorized so that I don't have to do it manually," you've written a requirement that cannot be tested with a binary pass/fail. Because the AI categorizes some tickets correctly and some incorrectly — and the question is not whether it categorizes, but *how well* it categorizes, for *which types of tickets*, under *which conditions*, and *what happens* when it's wrong.

A user story that ignores these questions doesn't just fail to specify the feature — it actively misleads the team. Engineering takes it as a functional requirement and builds toward "categorization works." Leadership reads it as a commitment. QA writes tests that verify categorization happens. And nobody writes down the quality bar that actually determines whether the feature creates or destroys user value.

## The AI Story Template

An AI story has five components that replace the traditional user story format. They're not longer for the sake of ceremony — each component captures something that the traditional format leaves out but that AI features require.

### Component 1: Context and User Problem (same as traditional)
*As [specific user segment], I experience [specific friction] when [specific situation], which currently causes [measurable impact].*

This is familiar territory. The difference is that specificity matters more for AI features because the user segment and situation will determine your evaluation criteria.

### Component 2: AI Capability Hypothesis
*We hypothesize that an AI that [specific AI task and approach] can [change user behavior] by [mechanism of change].*

Note the word "hypothesize." This is deliberate. AI stories should acknowledge that the AI capability you're describing is a hypothesis, not a certainty. The story is a bet that a specific kind of AI behavior will produce a specific kind of user outcome.

### Component 3: Success Metric (probabilistic)
*The feature succeeds when [AI output type] meets [quality threshold] as measured on [evaluation set], resulting in [behavioral outcome] for at least [% of target users].*

The quality threshold is not "it works." It is the specific accuracy, precision, recall, or other quality measure that your user research established as the adoption threshold.

### Component 4: Edge Case Inventory
*Known failure modes: [list]. For each, the designed behavior is [description]. These are acceptable because [rationale] or require mitigation [specific mitigation].*

Edge cases are not afterthoughts in AI requirements — they are first-class content. Because AI systems fail on the tails of the distribution, the edges are where users will most frequently be surprised or harmed.

### Component 5: Kill Criteria
*We will stop or re-scope this feature if [specific condition]: [measured metric] falls below [threshold] after [timeframe or data volume], because [specific harm to users or business].*

Kill criteria turn an open-ended commitment into a time-bounded bet. They are not failure conditions to be avoided — they are decision points at which you will have enough evidence to choose the right next action.

### A Complete AI Story Example

**Context:** As an enterprise account manager responsible for 60+ accounts, I lose time every week manually reviewing usage data across accounts to identify which ones need attention, which means I'm reactive rather than proactive and I miss early churn signals until it's too late.

**AI Capability Hypothesis:** We hypothesize that an AI that scores account health weekly based on product usage patterns, support ticket volume, and NPS signals can cause account managers to initiate proactive outreach more than 48 hours before a renewal conversation, by surfacing accounts in need of attention before the account manager would otherwise notice.

**Success Metric:** The feature succeeds when the account health score correctly identifies accounts that subsequently churn within 90 days with a recall rate of at least 75% and a precision of at least 60% on our evaluation set of 200 historical accounts, and at least 65% of account managers in the pilot cohort initiate a proactive outreach within 5 days of a high-risk alert within 60 days of launch.

**Edge Case Inventory:**
- New accounts (less than 60 days old): Insufficient signal for reliable scoring. Designed behavior: display "insufficient data" indicator rather than a score. Acceptable because new accounts don't present an immediate churn risk.
- Accounts with no product usage in 30+ days: Could indicate churned already vs. legitimate pause in use. Designed behavior: flag for manual review rather than automated scoring. Requires mitigation: clear UI communication about why the account is flagged.
- Accounts with very high support ticket volume: Might score high-risk due to volume even when all tickets are routine. Designed behavior: separate "support intensity" signal from churn risk signal in the UI. Requires mitigation before launch.

**Kill Criteria:** We will pause this feature and re-evaluate if, after 90 days in production with at least 50 account managers, the proactive outreach rate is below 30% (suggesting adoption failure) or if churned accounts identified by the AI score within 90 days represent fewer than 50% of actual churn events (suggesting the model is missing the signal). We will kill the feature entirely if the false positive rate causes account managers to report increased workflow burden due to false alarm fatigue.

---

This story is longer than a traditional user story. It's also far more useful. Every decision the engineering team needs to make — what to optimize for, what to do on the edges, what constitutes done — is answered in the story rather than left for ad hoc decisions during development.

## Defining Success Probabilistically

"The AI is 92% accurate" is a sentence that sounds precise but is almost meaningless without context. 92% accurate at what task? On what data distribution? With what definition of correct? Measured how?

Probabilistic success criteria for AI features need to specify five things to be actionable:

**1. The task definition.** What specific transformation is the AI performing? Not "summarize documents" but "produce a 3–5 sentence summary that captures the main conclusion, the key supporting points, and any action items from meeting transcripts."

**2. The metric type.** Different AI tasks have different appropriate metrics. Classification tasks use precision, recall, and F1. Regression tasks use mean absolute error or similar. Generation tasks often use human evaluation or LLM-as-judge approaches.

**3. The measurement dataset.** Accuracy on a curated, representative, well-labeled dataset is meaningful. Accuracy on the best examples your team hand-selected is not. The evaluation dataset needs to represent the actual distribution of inputs the AI will encounter in production.

**4. The threshold and its source.** The required accuracy level should be derived from user research, not chosen arbitrarily or optimistically. "We need 90% precision because user research showed that below 90% precision, correction overhead exceeds time savings" is a defensible threshold.

**5. The floor vs. the ceiling.** A quality threshold is a minimum bar, not a target to exceed and then stop caring. Document both: the floor below which you won't launch, and the ceiling at which further quality investment stops producing measurable user benefit.

### A Probabilistic Success Criteria Template

| Dimension | Specification |
|---|---|
| Task | [Specific AI task description] |
| Primary metric | [Metric name and definition] |
| Threshold (floor) | [Minimum acceptable level, source: user research / comparable product / business requirement] |
| Threshold (stretch) | [Level at which user benefit is meaningfully better] |
| Evaluation set | [Description: size, composition, labeling approach, representativeness] |
| Measurement cadence | [How often this will be re-measured after launch] |
| Acceptable error types | [Errors the product can tolerate and why] |
| Unacceptable error types | [Errors that will trigger review / escalation / feature pause] |

## Edge Case Taxonomy: What Happens When the AI Is Wrong?

Edge cases for AI features are not the same as edge cases for traditional software. In traditional software, an edge case is usually a boundary condition — what happens when the input is null, when the number overflows, when the file is empty. These are often rare and can be handled by explicit rules.

In AI features, edge cases are situations where the AI's performance degrades below the acceptable threshold — and they are often neither rare nor handled by explicit rules.

The edge case taxonomy for an AI feature should cover four categories:

**Distribution shift:** Inputs that are outside the distribution the AI was trained or designed for. These degrade gradually rather than failing completely, which makes them harder to catch.

**Adversarial or unusual inputs:** Inputs that are within the intended scope but structured in unusual ways that the AI handles poorly. Examples: very short inputs, very long inputs, inputs with unusual formatting, inputs in unexpected languages or registers.

**Consequential errors:** Errors that, even if they occur rarely, have disproportionate impact. The taxonomy should identify which errors are consequential and design explicit mitigations for those.

**Cascading failures:** Situations where the AI's output is used as input to another system, and an error in the AI propagates and amplifies downstream.

For each edge case category, the requirements should specify:
- How the product detects that it's in an edge case situation
- What the designed behavior is (show a lower confidence indicator, flag for human review, fall back to a non-AI behavior, refuse to respond)
- Who is responsible for monitoring and responding to this edge case in production

## The Evaluation Dataset as the Requirement Document

Here is a reframe that changes how most PMs think about AI requirements: **your evaluation dataset is more important than your written requirements.**

This sounds provocative. Written requirements feel like the authoritative specification. But for AI features, the evaluation dataset — the curated set of inputs and expected outputs against which you measure the AI's quality — is the concrete instantiation of your requirements. It answers questions that written requirements can't answer: not "the AI should produce accurate summaries" but "on these 200 documents, with these human-provided reference summaries, the AI's outputs should achieve this level of agreement."

The evaluation dataset makes vague requirements operational. "The AI should handle edge cases gracefully" is a requirement. A dataset that includes 30 edge case examples with specified acceptable outputs is a testable specification.

### What Makes a Good Evaluation Dataset

A good evaluation dataset for an AI feature has four properties:

**Representative:** The dataset should reflect the actual distribution of inputs the AI will encounter in production.

**Labeled:** Each example needs a ground truth label — the output that represents a correct or acceptable response.

**Adversarial:** A good dataset isn't just representative — it's deliberately hard. It includes the edge cases you've identified, the tricky inputs that are near decision boundaries, and inputs designed to expose specific failure modes.

**Versioned:** As you learn more about how the AI fails and what users care about, your evaluation dataset should grow and evolve. Version your dataset the way you version your code.

### Building the Evaluation Dataset in Discovery

The evaluation dataset shouldn't wait until after the model is built. Building it during discovery serves two functions: it forces the team to make explicit decisions about what quality means before those decisions get made implicitly by whoever writes the first evaluation script, and it creates a shared artifact that aligns PM, engineering, and design around the same quality standard.

The process:

1. Collect 200–500 real examples of the inputs the AI will process
2. Have 2–3 domain experts independently label the expected outputs for each example
3. Resolve disagreements through discussion — the disagreements are often the most valuable data, because they reveal ambiguity in your requirements
4. Tag each example by input type, difficulty level, and any known edge case category
5. Document labeling guidelines so that future examples can be labeled consistently

The resulting dataset is not just an evaluation tool — it's a living specification.

## Synthesizing Research Into Acceptance Criteria

The output of your AI user research is not a list of feature requests. It is a set of probabilistic acceptance criteria that define the quality bar the AI feature needs to reach before it creates the value your hypothesis describes.

Document these in a structured format:

**Baseline accuracy requirement:** The AI must achieve [X]% accuracy on [task type] as measured on [evaluation set type], as derived from user tolerance research indicating that below this threshold, users experience [specific failure mode].

**Error type constraints:** Errors of type [A] are more damaging to user trust than errors of type [B], based on user research showing [specific behavioral response to each]. The AI should be optimized to minimize type [A] errors even at some cost to overall accuracy.

**Consistency requirement:** Users expect that similar inputs produce similar outputs. Define "similar" and specify an acceptable variation range based on research findings.

**Explanation requirement:** Users require [type and level of reasoning] alongside the AI output in order to trust and act on the recommendation.

These criteria become the inputs to your technical requirements conversation with the ML team.

## Communicating AI Requirements to Stakeholders

AI requirements create a communication challenge with stakeholders who are accustomed to deterministic specifications. "The AI will be right 87% of the time" is a confusing statement to an executive who is used to software that either works or doesn't.

Three framing strategies help:

**The human comparison frame:** "Our AI categorizes support tickets with 87% accuracy. Our best human agents categorize tickets with approximately 91% accuracy on their best days, and 78% accuracy on average. The AI performs between the average and the best, and it does it instantaneously for every ticket."

**The workflow frame:** "Users will review AI categorizations for the 13% of tickets where the AI is uncertain — the AI will flag these explicitly. For the other 87%, users can accept the categorization with a single click. Net time savings per support manager: 4 hours per week."

**The improvement trajectory frame:** "We're launching at 87% accuracy, which our user research shows is above the adoption threshold of 83%. Our roadmap shows specific improvement investments that will reach 92% by Q3, which is where user research says the correction overhead becomes truly negligible."

## Summary

User research for AI features cannot rely on stated preferences, because users cannot accurately imagine features they haven't experienced. Wizard-of-Oz testing — simulating AI behavior with human operators — is the most reliable way to observe how users actually respond to realistic AI outputs, including realistic imperfections.

Non-determinism tolerance research surfaces the consistency expectations users bring to your feature, which vary significantly by user type and decision stakes. Probabilistic acceptance criteria, derived from behavioral research at multiple accuracy levels, translate user experience requirements into the technical quality targets your team needs to hit.

The user expectations gap — across precision, consistency, explanation, and scope — is a design and communication problem as much as a technical one. Traditional user stories fail for AI features because they assume deterministic behavior and binary success criteria. The AI story template — context, capability hypothesis, probabilistic success metric, edge case inventory, and kill criteria — is honest about uncertainty, specific enough to be testable, and aligned around quality thresholds derived from user research.

Most importantly, the evaluation dataset is the real requirement document for an AI feature. Building it during discovery, not after development, is the practice that separates teams that ship AI features users trust from teams that ship AI features that technically work but fail in production.
