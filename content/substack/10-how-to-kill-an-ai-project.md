---
title: "How to Kill an AI Project (And Why You Should)"
slug: "how-to-kill-an-ai-project-and-why-you-should"
description: "The kill discipline most AI leaders avoid, why 'promising results' after six months is a red flag, and how to communicate a kill decision without career damage."
book: "Signal Capture"
series: "Chaos to Clarity"
---


![Diagram](/diagrams/substack/10-kill-framework.svg)
# How to Kill an AI Project (And Why You Should)

Nobody gets promoted for killing an AI project.

The budget was approved. The team was staffed. Presentations were made to leadership. The project is associated with someone's name — often your name. And now you're sitting with evidence that it isn't working, and you're trying to figure out how to make that evidence not mean what it clearly means.

This is the sunk cost spiral. And it is the single most expensive failure pattern in enterprise AI — not because individual projects run over budget, but because organizations that cannot kill failing initiatives cannot learn from them, cannot redeploy the resources, and cannot build the institutional discipline that makes future AI investments more likely to succeed.

The ability to kill a project — clearly, cleanly, and without organizational damage — is one of the most valuable skills in the AI leader's toolkit. Most leaders never develop it. This article explains why it matters, how to apply it, and how to communicate it upward in a way that enhances rather than damages your credibility.

---

## Why "Promising Results" After Six Months Is a Red Flag

Here is a phrase that should trigger immediate scrutiny: "We're seeing some very promising results, and we believe with a few more months of development we'll be in a position to deliver the value we originally projected."

This sentence, or some version of it, appears in the status update of almost every AI project that is six months past its original delivery date, 40% over budget, and nowhere near its value hypothesis.

It is not always dishonest. Often the people saying it genuinely believe it. But it is a structural feature of sunk cost logic, not an evidence-based assessment.

Here is why: if a project has been running for six months and the original value hypothesis required X quality level by month six, and you are at 60% of X quality at month six, the statement "we're seeing promising results" is true in a narrow sense. Things have improved. There is a 60% where there was once a 0%. Progress is happening.

But the question is not "is there progress?" The question is "does the progress trajectory get us to the required quality level within a defensible additional investment, and if so, what is the mechanism?"

Most "promising results" updates cannot answer that question. They describe the trajectory without modeling where it leads. They project optimism forward without establishing why the next six months will close the gap that the first six months opened. And because the team is close to the work, emotionally invested in the outcome, and professionally exposed if the project is cancelled, there is systematic pressure toward optimism that is entirely independent of the evidence.

The appropriate response to "promising results after six months" is not approval of additional budget. It is a structured kill/pivot/continue decision based on the original criteria.

---


![Diagram](/diagrams/substack/10-kill-framework.svg)
## The Kill Discipline from Signal Capture

The Signal Capture framework is built around a core insight: the decision to kill a project should be made against criteria established before the project began, not against the current state of the project.

This is not a subtle point. It is the entire difference between a kill discipline and a sunk cost spiral.

If you define "kill criteria" at the start of a project — specific conditions that, if met, trigger a kill decision — you remove the decision from the emotional context of an in-progress initiative. The kill decision is not a judgment on the team, a vote of no confidence, or a failure of leadership. It is the criteria doing what they were designed to do.

The Signal Capture kill discipline has three components.

**Pre-committed kill criteria.** Before work begins, define the specific conditions that would trigger a kill decision. These typically include a time threshold ("if we have not achieved X quality level by month 4"), a budget threshold ("if we have spent more than $Y without demonstrating Z"), and a trajectory threshold ("if our progress rate in the last sprint does not support reaching the required quality by the delivery date"). These criteria are written down, reviewed by the sponsoring executive, and documented in the project charter.

**Scheduled decision gates.** Rather than waiting for someone to raise the kill question, schedule it. Build explicit go/pivot/kill decision points into the project plan at regular intervals — typically at the end of each major phase and at any point where a kill criterion might be triggered. At each gate, the team presents evidence against the criteria. The decision is made. The project either continues, pivots in scope or approach, or is killed.

**Separation of the decision from the messenger.** The person who brings evidence that kill criteria have been triggered should be a different person from the sponsoring executive who makes the decision. This separates the analytical function (here is the evidence) from the decision function (here is what we are doing about it), and reduces the pressure on the analyst to manage the news they are delivering.

---

## The Sunk Cost Spiral Anti-Pattern

The sunk cost spiral follows a consistent pattern. Understanding the pattern makes it easier to recognize before it becomes a crisis.

**Month 1-3:** The project has full organizational support. Progress is being made. Everyone is optimistic.

**Month 4-5:** The first significant quality gap becomes visible. The team is not on track to meet the original timeline. The status update describes "good progress" and "a few challenges" but does not surface the gap explicitly. Budget has been spent. No one wants to be the first to say this might not work.

**Month 6-7:** The gap is now undeniable but the team believes they can close it with one more sprint, one more tuning cycle, one more data augmentation pass. Additional budget is requested and often approved, because the alternative is to admit that months 1-6 produced nothing.

**Month 8-10:** The project has now consumed significantly more than the original budget. The quality gap has narrowed but not closed. The sponsoring executive is now personally associated with the initiative and has political exposure if it fails publicly. The team has been promising delivery for months. Both parties are now invested in a positive outcome regardless of the evidence.

**Month 12+:** The project either gets quietly wound down (at massive cost with no learning extracted), shipped in a degraded form that does not deliver the original value hypothesis, or continues indefinitely as a zombie initiative that consumes resources and organizational attention without producing meaningful results.

The entire spiral could have been short-circuited at month 4 or 5 by applying the kill criteria defined at project start. The reason it wasn't is that no kill criteria were defined, so the decision was made in the emotional and political context of month 6 rather than the rational context of month 0.

---


![Diagram](/diagrams/substack/10-kill-framework.svg)
## The Kill Decision Framework

When kill criteria have been triggered — or when you need to evaluate a project that was started without pre-committed criteria — here is a structured decision process.

**Step 1: State the original value hypothesis.** Write down, in one sentence, what the project was supposed to deliver and by when. If you cannot state this precisely, that is itself important information about why the project is struggling.

**Step 2: Assess the current gap.** What is the quality level now? What was it supposed to be? What is the realistic trajectory to close the gap, based on the progress rate of the last 4 weeks — not the progress rate projected at start?

**Step 3: Calculate the true cost to close.** If you take the realistic trajectory from step 2, how long does it take to reach the required quality level? Multiply that by the weekly run rate. Is that investment defensible against the value hypothesis? Apply the same discount you would apply to any investment that has already overrun.

**Step 4: Identify why the gap exists.** Is it a data problem (insufficient or poor-quality training data)? A model problem (the approach cannot reach the required quality on this task)? A definition problem (the quality threshold was set wrong)? A scope problem (the use case is harder than it appeared)? The reason for the gap determines whether it can be closed. A data problem with a clear resolution path is different from a model problem that reflects a fundamental limitation.

**Step 5: Make one of three decisions.** Continue (the gap can be closed within defensible additional investment, the root cause is understood, the path is clear). Pivot (the original approach cannot reach the required quality, but a revised scope or different approach can deliver meaningful value). Kill (the value hypothesis cannot be achieved within any reasonable investment, or the root cause analysis reveals a fundamental problem that cannot be solved).

| Decision | When to make it |
|---|---|
| Continue | Gap is closeable, root cause is known, path is specific |
| Pivot | Original approach is wrong, but a modified version can deliver value |
| Kill | Value hypothesis cannot be achieved, or cost to close is indefensible |

---

## How to Communicate a Kill Decision Upward

The fear that prevents kill decisions is not irrationality. Leaders who kill projects do sometimes face organizational consequences — especially if the project was a leadership priority, if the kill is perceived as a team failure rather than a clear-eyed decision, or if the communication is handled poorly. Here is how to communicate a kill decision in a way that protects and enhances credibility.

**Lead with the criteria, not the conclusion.** Do not open with "I recommend we kill this project." Open with "When we started this initiative, we agreed that if we had not achieved X quality level by month 4, we would make a go/pivot/kill decision. Here is the evidence against that criterion."

This framing accomplishes something critical: it makes the decision about the criteria, not about the team. You are not saying the team failed. You are saying the criteria have been triggered. The criteria exist precisely so this decision can be made clearly.

**Present the cost-to-close calculation.** Show the math. Not as an argument for killing — as information. What has been spent? What would need to be spent to reach the original quality target? What is the revised expected return, discounted for the delays and overruns already experienced? Let the numbers speak.

**Name what was learned.** A project that reveals what does not work is genuinely valuable. Enumerate the specific things that are now known because this project ran — about the data, the approach, the organizational readiness, the problem definition — that were not known before. This reframes the investment from "we spent $2M and got nothing" to "we spent $2M and eliminated three major uncertainties that would have cost more to learn later."

**Propose the redeployment.** What happens to the team, the data, and the accumulated knowledge? A kill decision that comes with a specific proposal for how resources are redeployed signals organizational maturity. It communicates that this is a portfolio management decision, not a failure response.

**Separate the project kill from any team assessment.** If people need to be managed or redeployed, that is a separate conversation. Do not bundle personnel decisions into the project kill communication. That conflation makes kills feel punitive and makes future teams reluctant to surface problems early.

---


![Diagram](/diagrams/substack/10-kill-framework.svg)
## The Discipline That Compounds

Organizations that develop kill discipline build a compounding advantage over time.

They allocate capital to new initiatives faster, because they trust that failing initiatives will be identified and stopped. They generate more learning per dollar spent, because failed projects produce documented knowledge rather than quiet burials. They build psychological safety for surfacing problems early, because early kill decisions are treated as organizational successes, not failures.

The organizations that cannot kill projects converge on a different outcome. Their capital gets locked in zombie initiatives. Their best people get demoralized working on projects they know are failing. Their AI strategy calcifies around initiatives that cannot be stopped and cannot succeed. And the discipline to start new initiatives atrophies, because starting something means starting something that might fail and cannot be stopped.

Kill discipline is the difference between a portfolio that learns and a portfolio that accumulates losses.

The ability to kill a project clearly, quickly, and without unnecessary organizational damage is not a sign that an AI program is failing. It is a sign that the program is well-run. Develop it deliberately. Protect it actively. Use it early.

---

*This article draws from Signal Capture, AI for Business Leaders, and AI Product Management, free guides at legacyforward.ai/library. The full Chaos to Clarity AI Series covers the complete lifecycle from initiative design through delivery, including kill criteria templates, gate decision frameworks, and portfolio management tools for enterprise AI programs. Read the Chaos to Clarity AI Series, free at legacyforward.ai/library.*
