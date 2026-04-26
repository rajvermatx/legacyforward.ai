---
title: "Building & Leading AI Teams"
slug: "building-and-leading-ai-teams"
description: "The AI talent market is misunderstood, and managing AI projects requires a different language than traditional software. Here is how to hire right, upskill effectively, and run AI initiatives without being misled about their progress."
section: "ai-leaders"
order: 7
part: "Part 04 Execution"
badges:
  - "Talent Strategy"
  - "Team Structure"
  - "Project Oversight"
---

# Building & Leading AI Teams

A mid-sized financial services firm recently posted a job listing for a "Chief AI Officer" offering $400,000 in total compensation. The listing required ten years of experience with large language models — a technology that became commercially viable in 2022. Twelve months later, the role was still unfilled, the search firm had been replaced twice, and the board was asking why the AI strategy was stalled.

The answer had nothing to do with talent. It had everything to do with a flawed mental model of what AI talent actually means, what roles genuinely require, and whether the right answer was hiring at all.

A VP of Operations at a logistics company spent eighteen months overseeing an AI route optimization project. Every monthly review, the team reported they were "almost there." The dashboard showed progress metrics trending upward. The demo looked impressive. At month seventeen, the team delivered their honest assessment: the model was not performing well enough to deploy, and rebuilding it would require another year.

The VP had not been deceived, exactly. But she had been asking the wrong questions, reading the wrong indicators, and watching the wrong demo. The project was never lying — it was speaking a language she had not learned to interpret.

Building AI teams and leading them effectively are two sides of the same leadership challenge. This chapter addresses both.

---

## Part One: Building Your AI Team


![Diagram](/diagrams/ai-leaders/ch07-1.svg)
### The AI Talent Market Reality

The AI talent market in 2026 is simultaneously overheated and misunderstood.

**What is genuinely scarce:** Deep research scientists who train foundation models from scratch. You do not need these people. The companies that need them are OpenAI, Google, Anthropic, and a handful of well-funded AI labs. Their compensation starts at $500,000 and they will not join your company.

**What is plentiful but poorly labeled:** People who can configure, deploy, and tune existing AI systems, often called "AI engineers" or "ML engineers," are far more available than the market hysteria suggests. Many are sitting inside your organization right now, underutilized and underidentified.

**What is genuinely needed and often overlooked:** Business-facing AI roles. People who understand your industry deeply and can translate that knowledge into AI system requirements. These people may not have "AI" anywhere on their current resume.

> **Think of it like this:** When electricity became commercially viable in the 1890s, factories did not need to hire physicists who understood Maxwell's equations. They needed electricians who could wire buildings and operators who could run equipment. Today's AI talent market is making the same mistake — confusing research scientists (Maxwell's equations) with the deployment talent (electricians) that actually drives business value.

The talent question, reframed: You are not trying to build a research lab. You are trying to deploy AI capability to drive business outcomes. Those are very different hiring briefs.

---

### The 5 AI Roles in Business Terms

**Role 1: The AI Strategist**

What they do in plain English: They answer the question "where should we use AI and in what order?" They assess your organization's readiness, identify the highest-value use cases, build the business case, and manage stakeholder alignment. They are not writing code.

Background that works: Management consultants who have specialized in AI. Business analysts who have led technology transformations. Product managers who have shipped AI-adjacent products.

Salary range (2026): $180,000 – $280,000 total compensation for a senior individual contributor. $300,000 – $450,000 for a VP-level head of AI strategy.

Could you upskill this? Yes. This is the most upskillable role on the list. A talented senior leader in strategy, operations, or product can acquire AI literacy within 6-9 months and become effective in this role.

---

**Role 2: The AI Engineer**

What they do in plain English: They build the systems — connecting AI models to your data, your workflows, and your interfaces. They are not training AI from scratch. They are configuring, integrating, and customizing existing AI platforms.

Background that works: software engineers with 3+ years of experience, cloud platform engineers, and backend developers. The specific AI skills are learnable relatively quickly; the foundational engineering discipline is what takes years.

Salary range (2026): $160,000 – $260,000 total compensation.

Could you upskill this? Partially. Existing software engineers on your team can acquire AI engineering skills in 3-6 months with structured training. This is often the right path.

---

**Role 3: The Data Engineer**

What they do in plain English: They make sure the data that AI systems need is accessible, clean, reliable, and properly governed. AI runs on data. If your data is a mess, no AI system will compensate for it.

Background that works: Database administrators who have modernized their skills. Analytics engineers. ETL (extract-transform-load) specialists. Cloud data platform engineers.

Salary range (2026): $140,000 – $220,000 total compensation.

Could you upskill this? Yes — often the highest ROI investment on this list. Existing data teams usually need specific AI-related additions (vector databases, data pipeline modernization) rather than wholesale replacement.

---

**Role 4: The AI Product Manager**

What they do in plain English: They own the outcomes of specific AI products or initiatives. They define what the system should do for users, manage the development roadmap, communicate with stakeholders, and measure whether it is working. They sit between the business and the engineering team.

Background that works: Strong general product managers who have managed technical products. Business analysts with project leadership experience. Domain experts (e.g., a claims specialist who wants to lead AI for claims) who develop PM skills.

Salary range (2026): $160,000 – $250,000 total compensation.

Could you upskill this? Yes. This is a strong upskilling candidate from your existing product or program management bench.

---

**Role 5: The AI Governance Lead**

What they do in plain English: They ensure AI systems are used responsibly — tracking regulatory requirements, managing risk exposure, auditing models for bias or failure, and building internal policies. As AI deployment scales, this role becomes non-optional.

Background that works: Legal and compliance professionals who have upskilled on AI. Risk officers with technology backgrounds. Data privacy specialists.

Salary range (2026): $150,000 – $240,000 total compensation. Demand is rising as regulation increases.

Could you upskill this? Yes — and this is often the most natural upskill path, since compliance and legal professionals are already trained in frameworks, documentation, and risk thinking.

---

### Build vs Centralize: Three Team Models

**Model 1: Centralized Center of Excellence (CoE)**

All AI talent sits in a single team — often reporting to the Chief Digital Officer, CTO, or a newly created Chief AI Officer. Business units request AI services from this central team.

Works well when: You are in early stages of AI deployment (first 12-18 months). You need to establish standards, governance, and shared infrastructure. Your business units lack technical maturity to manage AI independently.

Fails when: Business units feel AI is being done "to them" rather than "with them." The CoE becomes a bottleneck and projects queue for months. The CoE team lacks domain knowledge to build solutions that actually fit business needs.

Typical size: 5-15 people for a mid-market company. 20-50 for large enterprises.

---

**Model 2: Embedded Model**

AI talent sits directly inside business units — a data scientist in Finance, an AI engineer in Operations, an AI product manager in Customer Success. The central team is minimal or absent.

Works well when: Business units have clear, distinct AI needs that require deep domain knowledge. The organization has sufficient technical maturity in each unit. Speed and business alignment are the priority over governance uniformity.

Fails when: Each unit invents incompatible approaches — a governance and cost nightmare. AI talent embedded in business units feels isolated and churns. No organization-wide learning or capability building occurs.

---

**Model 3: Hybrid (CoE + Embedded)**

A small central team owns standards, governance, shared platforms, and capability building. Domain-specialist AI roles embed in business units but follow central standards and participate in a community of practice.

Works well when: You have passed the initial deployment phase and need both scale and control. This is where most mature organizations land.

The design principle: the central team owns the "how," meaning standards, tooling, and governance. Embedded teams own the "what," meaning use cases, domain expertise, and business outcomes.

| Model | Best for | Risk | Typical cost (mid-market) |
|---|---|---|---|
| Centralized CoE | Early stage, governance-first | Bottleneck, low business buy-in | $1.5M – $4M/year |
| Embedded | Speed, domain expertise | Fragmentation, governance gaps | $2M – $6M/year |
| Hybrid | Scale with governance | Coordination complexity | $2.5M – $7M/year |

---

### Upskilling Existing Staff: What Is Realistic in 6 Months

The most common mistake in AI talent strategy is defaulting to hiring when the better answer is developing.

**What is achievable in 6 months:**

| Skill | Who can learn it | What they need |
|---|---|---|
| AI literacy (capabilities, limitations, use cases) | Any manager or professional | 20-40 hours of structured learning |
| Prompt engineering for business use cases | Operations, marketing, HR, finance professionals | 10-20 hours + practice |
| AI product management basics | Existing PMs and business analysts | 40-80 hours of focused training |
| AI governance fundamentals | Compliance, legal, risk professionals | 40-60 hours + regulatory review |
| AI engineering (for existing software engineers) | Software engineers with 2+ years experience | 3-6 months dedicated upskilling |
| Data engineering for AI (for existing data teams) | Database and analytics engineers | 2-4 months targeted training |

**What is not realistic in 6 months:**
- Turning a non-technical person into an AI engineer
- Teaching someone without statistics background to evaluate model performance rigorously
- Making a non-programmer into a data scientist

**The 6-month upskilling architecture:**

Month 1-2: Foundation. Everyone in scope completes AI literacy training. Identify the 10-20% who show strong aptitude and interest — these are your internal AI champions.

Month 3-4: Specialization. Technical staff pursue role-specific tracks. Business staff develop use-case identification and prompt skills. AI champions pursue deeper curricula.

Month 5-6: Application. Staff work on real projects (not just training) with coaching from a senior AI person. Progress is measured by outputs, not training completion certificates.

Investment estimate: $3,000 – $8,000 per person for quality upskilling programs. For a team of 50, budget $150,000 – $400,000 plus 10-15% of their time for six months.

> **Think of it like this:** When your company moved to cloud-based software, you did not hire an entirely new workforce. You upskilled your IT team, trained your end users, and hired a few specialists for things that genuinely required new expertise. The pattern is the same with AI.

---

### Outsourcing AI: When It Works and When It Is a Disaster

**When outsourcing works:**

Point solution deployment — you want to deploy a specific AI tool and have no intention of building custom AI systems. Specialist augmentation — you need a capability for a defined period, like an AI security audit or a data quality assessment. Capacity surge — you are building internal capability but need to accelerate delivery on a specific initiative now.

**When outsourcing fails:**

Outsourcing core strategic capability — if AI is central to your competitive differentiation, outsourcing its development means your competitive advantage lives outside your walls. Outsourcing without capability transfer — the consultancy delivers a system, leaves, and your team has no ability to maintain or evolve it. The outsourcing spiral — each phase requires another statement of work, vendor scope expands, dependency deepens.

**The outsourcing test:** Ask yourself: "If this vendor relationship ended tomorrow, what would we have?" If the answer is "nothing we can use," the outsourcing structure is wrong.

---

### Cost Comparison: Hire vs Upskill vs Outsource

| Role | Hire (new) | Upskill (existing) | Outsource |
|---|---|---|---|
| **AI Strategist** | $280K–$450K/yr + 20-30% overhead | $50K–$80K training investment, 3-6 month ramp | $200K–$400K for 6-month engagement |
| **AI Engineer** | $200K–$320K/yr fully loaded | $20K–$40K training for existing engineer | $150K–$250K per project phase |
| **Data Engineer** | $180K–$280K/yr fully loaded | $15K–$30K targeted training | $100K–$200K per phase |
| **AI Product Manager** | $200K–$310K/yr fully loaded | $30K–$60K training for existing PM | $120K–$200K for defined scope |
| **AI Governance Lead** | $180K–$300K/yr fully loaded | $20K–$50K for compliance/legal professional | $80K–$150K for audit/policy work |

**The decision rule:** Hire externally when the role requires expertise that does not exist in your organization and cannot be developed in the timeframe you need. Upskill internally when the gap is learnable, when domain knowledge of your business is important, and when you have 3-12 months before you need full productivity. Outsource when you need a specific capability for a bounded period or when you are buying a product rather than building a capability.

---

## Part Two: Leading AI Projects

### Grounded Delivery: The 5 Phases Explained for Executives

AI projects do not follow the same lifecycle as traditional software projects. Understanding what each phase should produce is the foundation of effective oversight.

**Phase 1: Discovery and Problem Definition (2-6 weeks)**

What is happening: The team is answering a single question — is this problem actually solvable with AI, and is it worth solving? What you should see produced: A written problem statement that includes the specific business outcome being targeted, the data that will be used, how success will be measured, and a clear go/no-go recommendation.

Red flag: The team skips this phase or produces only a slide deck.

Your key question: "What specific, measurable outcome will this system produce, and what data will it use to do that?"

---

**Phase 2: Data and Baseline (3-8 weeks)**

What is happening: The team is preparing the data the AI system will need and establishing a baseline for current performance. The baseline is critical. You cannot measure improvement without knowing where you started.

What you should see produced: A data quality assessment, a documented baseline metric (e.g., "current process takes 4.2 hours per case with 87% accuracy"), and a revised project plan that reflects what was learned about the data.

Red flag: No baseline established. If the team cannot tell you how the current process performs, they cannot tell you whether the AI is an improvement.

Your key question: "What is the current performance of the process this AI will replace or augment, and have we measured it?"

---

**Phase 3: Model Development and Iteration (6-16 weeks)**

What is happening: This is where most of the technical work occurs — building, testing, and iterating on the AI system. This phase is inherently nonlinear. Approaches that looked promising will fail. The team will pivot. Progress will feel slower than expected.

What you should see produced: Regular evaluation reports showing model performance against the baseline, documentation of approaches that were tried and abandoned, and a clear statement of current performance versus target performance.

Red flag: The team cannot produce a performance number. At any point in this phase, you should be able to ask "what is the system's current performance?" and get a specific answer.

Your key question: "What is the system's current performance score, what is the target, and what is standing between here and there?"

---

**Phase 4: Validation and Pilot (4-10 weeks)**

What is happening: The system moves from controlled test data to real-world conditions. A limited set of real users or real use cases are using the system. The team is measuring whether performance in development matches performance in production — and it often does not, because real-world data is messier than test data.

What you should see produced: Pilot results with real performance data (not demo conditions), user feedback including friction points and failures, and a deployment decision recommendation with clear criteria.

Red flag: The pilot is not actually measuring real performance. If the pilot is happening under controlled conditions with selected users and curated data, it is not a pilot — it is an extended demo.

Your key question: "What were the actual performance numbers in the pilot, including failures, and how do they compare to what we saw in development?"

---

**Phase 5: Deployment and Operations (ongoing)**

What is happening: The system is in production, being used at scale. This phase never ends — AI systems require ongoing monitoring, maintenance, and periodic retraining as the world they operate in changes.

What you should see produced: An operational dashboard showing ongoing performance metrics, an escalation process for when the system behaves unexpectedly, and a scheduled review cycle.

Red flag: No monitoring. A deployed AI system that is not being monitored is a liability.

Your key question: "Who owns the ongoing performance of this system, what are they measuring, and what happens when it degrades?"

---

### Why Your AI Project Is "Always 80% Done"

The single most common AI project management problem is the "80% done" phenomenon: the project appears to be almost complete for many months, then suddenly requires a complete rebuild.

> **Think of it like this:** Building an AI system is not like constructing a building, where progress is physically visible and milestones are unambiguous. It is more like training a sports team for a championship. You can have weeks of practice that feel productive — the plays are being run, the drills are completed, the athletes are improving — and still not know whether the team will win the championship until they actually play it. The last 20% of performance improvement is often harder than the first 80%, and practice (development) does not guarantee game performance (production).

**Reason 1: Development performance vs. production performance.** AI systems that work well on controlled test data frequently underperform on real data. Teams report "80% done" based on development metrics, but the real test, production, has not happened yet.

**Reason 2: The last mile is the hardest.** Going from 80% accuracy to 95% accuracy often requires as much work as going from 0% to 80%.

**Reason 3: Integration is not development.** An AI model that works well in isolation may require substantial additional work to integrate with real systems. Teams often report the model as "done" before integration work begins, but integration work can double the timeline.

**What to do about it:** Replace percentage-complete reporting with milestone-based reporting. Instead of "we are 75% done," require: "we have completed Phase 3 development, achieved 89% accuracy on test data, and are beginning the pilot phase with 50 real users. Pilot completion is scheduled for [date]."

Milestones are binary — either done or not done. Percentages are an invitation to happy-talk.

---

### The Right Questions to Ask in AI Project Reviews

**Questions about progress:**
- "What is the current measured performance of the system, in the same unit we used in Phase 1?"
- "What was the performance target we set, and what is the gap?"
- "What have we tried that did not work, and what did we learn from it?"
- "What specifically is blocking us from reaching the target?"

**Questions about data:**
- "What data is the system using, and how was it prepared?"
- "Has anything changed about the data since we started?"
- "What happens when the system sees data it has not been trained on?"

**Questions about the user:**
- "Who has actually used this system in real conditions, and what did they say?"
- "What are the most common failure modes that real users have encountered?"
- "Is the system making people's work better or worse right now?"

**Questions about risk:**
- "If this system makes an error, what is the worst realistic outcome?"
- "How will we know when it makes an error?"
- "What is the plan when — not if — the system fails in production?"

**Questions about the future:**
- "What would cause this project to fail, and how likely is that?"
- "If we were starting this project today with what we know now, would we proceed?"
- "What is the plan to keep this system performing six months after deployment?"

---

### Red Flags That an AI Project Is in Trouble

| Red Flag | What it Usually Means | Your Response |
|---|---|---|
| "We're almost there" for more than 8 weeks | Team is stuck but cannot say so | Demand specific milestones with dates |
| No measurable performance number available | Development is not rigorous or data is broken | Require a metrics report before the next meeting |
| Demo only works with specific inputs | System is not robust | Ask to see the system handle unexpected inputs |
| Team cannot explain what the system does in plain English | Scope is unclear or team is overselling | Require a one-page plain-English system description |
| Scope has expanded significantly since Phase 1 | Problem definition was too vague; scope creep | Return to Phase 1 documentation and renegotiate |
| Key team members have left mid-project | Internal problems the team is not surfacing | Investigate why talent left before proceeding |
| No user feedback from real conditions | Pilot is not real | Mandate a genuine pilot with uncontrolled users |
| Project is ahead of schedule by more than 20% | Target was too easy, or work is being cut | Ask what specifically was simplified or cut |
| Vendor is presenting rather than your team | Dependency problem; your team does not understand the system | Require your team to present all reviews |

---

### How to Read an AI Demo Without Being Fooled

AI demos are one of the most effective management communication tools ever invented, and one of the easiest to misread. The demo for a system that is 40% ready and the demo for a system that is 95% ready can look identical to an executive audience.

**The controlled conditions problem:** Most AI demos are run with carefully selected inputs that the system handles well. Ask the team to handle an input you provide on the spot, not one they have prepared.

**The accuracy theater problem:** A demo can show 95% accuracy on a carefully constructed test dataset that does not represent real-world conditions. Ask to see the same accuracy metric on data from the last 30 days of real operations, not from a pre-prepared test set.

**The latency trap:** A demo running on a well-resourced development environment may appear fast. The production system running on cost-controlled infrastructure, handling hundreds of concurrent users, may be dramatically slower. Ask about performance under load.

**The scorecard for evaluating a demo:**

1. What inputs were used? Were they pre-selected by the team, or can I provide my own?
2. What is the performance metric, and was it measured on real data?
3. What does a failure look like? Ask the team to show you a case where the system got it wrong.
4. Who presented — the vendor or our internal team? If the vendor presented, your team may not fully understand what was built.
5. What is the single biggest unresolved problem? Any honest team will have an answer. No answer is a red flag.

---

### Progress Reporting Template for AI Initiatives

Use this template to standardize reporting across all AI projects.

---

**AI Initiative Status Report**

**Initiative name:**
**Reporting period:**
**Phase:** [Discovery / Data & Baseline / Development / Pilot / Operations]
**Overall status:** [Green / Yellow / Red]

**Current performance metric:**
- Target: [e.g., 94% classification accuracy]
- Current: [e.g., 87% on test data; 82% in pilot conditions]
- Gap: [e.g., 7-12 percentage points]

**Milestones this period:**
- Completed: [list specific deliverables, not activities]
- Missed: [list missed milestones with explanation]
- Planned for next period: [specific milestones with dates]

**Top 3 blockers:**
1.
2.
3.

**Key decisions needed from leadership:**
- [Specific decision, options, recommendation, deadline]

**Risk update:**
- New risks identified this period:
- Risk mitigations completed:

**What we tried that did not work:**
[This section is mandatory. If blank, the report is incomplete.]

**Budget status:**
- Budget to date: $[X]
- Spend to date: $[X]
- Forecast at completion: $[X]

**Team stability:** [Any personnel changes or concerns]

**Recommendation to leadership:** [Proceed / Accelerate / Pause / Pivot / Kill — with one-paragraph rationale]

---

### Making This Work in Practice

The most important change most executives need to make is not learning more about AI. It is insisting on better information from the people running AI projects.

Most AI teams are not trying to mislead their executive sponsors. They are doing genuinely hard work in an environment where progress is nonlinear, where good news and bad news can coexist in the same status update, and where they are often uncertain themselves about when "almost done" will become "actually done."

Your job is to create conditions where honesty is easier than optimism. That means rewarding teams that surface bad news early. It means asking questions that require specific answers rather than accepting vague reassurances. It means establishing a reporting structure where "we don't know yet" is an acceptable answer and "everything is fine" is the answer that triggers scrutiny.

The same principle applies to talent. The executives most effective at building AI teams are not those who post the most ambitious job descriptions or pay the highest salaries. They are those who understand what capability they actually need, where it most efficiently comes from — inside the organization or outside — and how to create the conditions in which that capability can actually produce results.

Both problems — team building and project oversight — are fundamentally about creating organizational conditions for honesty and genuine progress, rather than the performance of progress.
