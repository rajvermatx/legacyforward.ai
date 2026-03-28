---
title: "Grounded Delivery"
slug: "grounded-delivery"
description: "Agile is a category error for AI. Grounded Delivery defines five phases, probabilistic quality gates, and governance for non-deterministic systems."
pillar: 2
---

# Pillar 2: Grounded Delivery for Non-Deterministic Systems

Agile is a category error for AI. LegacyForward.ai's Grounded Delivery methodology defines five phases — Frame, Explore, Shape, Harden, Operate — with explicit decision gates, probabilistic quality gates, and governance models for hybrid systems where deterministic and non-deterministic components coexist. It replaces the assumption of predictable outputs with a framework designed around experimentation, evaluation, and value validation. This is not a manifesto. It is a delivery methodology you can implement Monday morning.

---

## Why Agile Breaks Down for AI/LLM Systems

Agile is not wrong. It was right — for the problems it was designed to solve. The issue is that AI/LLM delivery presents fundamentally different problems, and Agile's core constructs do not map to them.

### The Deterministic Assumption

Every Agile artifact assumes deterministic behavior:

- **User stories** describe a desired outcome that can be verified. "As a user, I want to search by order number and see my order details." You build it, you test it, it works or it does not. The system returns the same result for the same input every time.
- **Acceptance criteria** define binary conditions. Given X, when Y, then Z. Pass or fail.
- **Definition of Done** assumes you can draw a line and say "this is complete." The feature either meets the spec or it does not.
- **Sprint velocity** assumes work can be estimated in relative units and that completing story points correlates with delivering value.
- **Regression testing** assumes that what passed yesterday will pass today.

None of these hold for non-deterministic systems.

### What Non-Deterministic Actually Means in Practice

When your system includes an LLM, an agent, or any generative AI component:

- **The same input produces different outputs.** Ask the same question twice, get two different answers. Both might be correct. Or one might be subtly wrong in a way that takes domain expertise to detect.
- **Quality is a distribution, not a point.** Your system does not "pass" or "fail" — it performs at a certain level across a range of inputs, with variance you can characterize but never eliminate.
- **The work is research until it is not.** You do not know if a given approach will work until you try it. You may try three approaches before finding one that performs adequately. This is not a failure of planning — it is the nature of the work.
- **Context changes everything.** An LLM that performs well on your test set may degrade on production data that has different distributions, edge cases, or domain-specific language your test set did not cover.
- **The system degrades in ways you cannot predict.** Model updates, prompt drift, data distribution shifts, upstream changes in APIs or knowledge bases — all of these can alter system behavior without any code change.

### Where Scaled Agile Makes It Worse

SAFe, LeSS, and other scaling frameworks compound the problem by adding layers of deterministic ceremony on top:

- **Program Increment (PI) Planning** assumes you can commit to features 8-12 weeks out. For non-deterministic work, you often cannot commit to an approach 2 weeks out.
- **Feature-level tracking** assumes work decomposes into stories that can be estimated and sequenced. Research and experimentation do not decompose this way.
- **Architectural runways** assume you can define the target architecture before building. For AI systems, the architecture often emerges from experimentation — you do not know what the system looks like until you discover what works.
- **Cross-team dependency management** assumes predictable interfaces. When one team's output is non-deterministic, downstream teams cannot plan against it with confidence.

The answer is not to abandon structure. The answer is to replace the wrong structure with the right one.

---

## The Grounded Delivery Model: Five Phases

Grounded Delivery moves through five named phases. These are not sprints. They are not time-boxed iterations. They are phases of work with distinct objectives, activities, and exit criteria — and the exit criteria are probabilistic where the work demands it.

### Phase 1: FRAME

**Objective:** Define the value hypothesis, system boundaries, and success criteria before writing a line of code.

**What Happens:**
- Articulate the value hypothesis in business terms. Not "we want to use AI for X" but "we believe AI can deliver Y measurable outcome because Z."
- Identify whether the problem requires non-deterministic components at all. Many AI initiatives are better solved with deterministic code, rules engines, or simple automation. If deterministic solutions exist, use them. Non-deterministic components carry ongoing cost — do not introduce them without justification.
- Map the system boundary. What is the AI component responsible for? What are its inputs? What are its outputs? What systems does it interact with? Where does it sit relative to legacy systems?
- Define probabilistic success criteria. Not "the system gives correct answers" but "the system provides acceptable responses for at least 90% of queries in the target domain, with less than 2% harmful or critically incorrect responses, measured against a labeled evaluation set of N examples."
- Identify risk boundaries. What happens when the AI component fails or produces garbage? What is the blast radius? What is the fallback?
- Determine the governance model. What level of human oversight is required? What decisions can the system make autonomously? What requires human-in-the-loop?

**Key Artifacts:**
- Value Hypothesis Document (replaces business case / feature brief)
- System Boundary Map (replaces solution architecture document for the AI component)
- Probabilistic Success Criteria (replaces acceptance criteria)
- Risk Boundary Definition (replaces risk register for AI-specific risks)
- Governance Model (new — no Agile equivalent)

**Who Is Involved:** Product owner, domain expert, technical lead, AI/ML practitioner, enterprise architect (if legacy integration is in scope).

**Duration:** 1-3 weeks depending on complexity. This is not a phase you rush. Getting Frame wrong means everything downstream is wasted.

---

### Phase 2: EXPLORE

**Objective:** Run structured experiments to determine whether the value hypothesis is achievable and which technical approach works.

**What Happens:**
- Design experiments with explicit hypotheses. "We believe [approach X] will achieve [metric Y] at [threshold Z]." Each experiment has a defined evaluation method and a kill criterion.
- Build minimum viable experiments, not minimum viable products. The goal is to learn, not to ship. Throwaway code is acceptable — in fact, it is expected.
- Test multiple approaches in parallel where feasible. Prompt engineering vs. fine-tuning vs. RAG vs. hybrid. Different models. Different chunking strategies. Different retrieval approaches. The point is to explore the solution space, not to commit to an approach prematurely.
- Build or curate evaluation datasets. You cannot assess non-deterministic systems without evaluation data that is representative, labeled, and large enough to characterize the output distribution. This is not optional. It is the single most important investment in the entire delivery lifecycle.
- Run evaluations. Measure against probabilistic success criteria defined in Frame. Characterize the distribution of outputs, not just the average.
- Document what did not work and why. Failed experiments are deliverables in Explore. They narrow the solution space and prevent future teams from repeating dead ends.

**Key Artifacts:**
- Experiment Log (replaces sprint backlog — tracks hypotheses, approaches, results, and decisions)
- Evaluation Dataset (new — no Agile equivalent, but this is the most valuable artifact in the entire process)
- Approach Assessment (replaces technical spike summary — structured comparison of approaches tried, with data)
- Feasibility Verdict (go/no-go recommendation with evidence)

**Who Is Involved:** AI/ML practitioners, domain experts (for evaluation), technical lead. Product owners receive updates but do not drive daily work — this is a technical discovery phase.

**Duration:** 2-6 weeks. Explore is time-boxed with a hard ceiling. If you have not found a viable approach within the time box, that is a signal — either the problem is harder than expected (revisit Frame) or the technology is not ready (kill the initiative). Do not extend Explore indefinitely.

---

### Phase 3: SHAPE

**Objective:** Turn the winning experimental approach into a production-viable system design, integrating with deterministic components and legacy systems.

**What Happens:**
- Take the approach validated in Explore and design the production system around it. This is where architecture happens — not before experimentation, but informed by it.
- Define the integration boundaries between non-deterministic and deterministic components. Every AI system in production is a hybrid. The LLM generates a response; deterministic code validates, formats, routes, logs, and governs that response. Shape defines where one ends and the other begins.
- Design the evaluation pipeline for production. How will you measure ongoing quality? What metrics? What thresholds trigger alerts? What drift detection is in place?
- Design the fallback paths. When the non-deterministic component fails, degrades, or produces unacceptable output, what happens? Every production AI system needs graceful degradation — this is not a nice-to-have.
- Address legacy integration. If the AI component interacts with legacy systems (and in an enterprise, it will), define the integration pattern. API gateway, event bridge, anti-corruption layer, data replication — whatever the pattern, it is designed here with full awareness of legacy constraints.
- Define the operational model. Who monitors this system? What are the SLAs? How is the non-deterministic component monitored differently from the deterministic components? What does incident response look like when "the AI is giving bad answers" is the incident?
- Build the production evaluation set. Expand the Explore evaluation set to production scale and coverage. Add adversarial examples, edge cases, and domain-specific stress tests.

**Key Artifacts:**
- Hybrid System Architecture (replaces solution architecture — explicitly separates deterministic and non-deterministic components)
- Integration Contract (replaces API specification — defines the contract between AI components and surrounding systems, including legacy)
- Production Evaluation Suite (replaces test plan — probabilistic, continuous, and comprehensive)
- Operational Runbook for AI Components (new — covers monitoring, incident response, and degradation management for non-deterministic behavior)
- Fallback Design (new — defines behavior when AI components fail or degrade)

**Who Is Involved:** Full cross-functional team. This is where engineering, architecture, operations, and domain expertise converge.

**Duration:** 2-4 weeks. Shape produces a buildable design, not a buildable system. Resist the urge to start coding production systems before Shape is complete.

---

### Phase 4: HARDEN

**Objective:** Build the production system and drive quality to the thresholds defined in Frame, validated in Explore, and designed in Shape.

**What Happens:**
- Build production code — both deterministic and non-deterministic components. Deterministic components follow conventional engineering practices. Non-deterministic components follow the architecture defined in Shape.
- Implement the production evaluation pipeline. Continuous evaluation is not a post-launch activity — it is built and running before the system goes live.
- Run the production evaluation suite. Measure quality against probabilistic success criteria. This is not a single test run — it is a statistical assessment across the full evaluation set, repeated under different conditions.
- Harden fallback paths. Test degradation scenarios. Verify that when the AI component fails, the system degrades gracefully and the user experience remains acceptable.
- Perform integration testing with legacy systems and other deterministic components. The AI component must behave correctly within the hybrid architecture, not just in isolation.
- Conduct adversarial testing. Prompt injection, jailbreaking, data poisoning, distribution shift simulation — test the ways this system can fail that deterministic systems cannot.
- Run human evaluation for subjective quality dimensions. For many AI/LLM systems, automated metrics are necessary but not sufficient. Human evaluation by domain experts is required to validate that outputs meet the bar.
- Load test and performance test the full system, including the AI components. LLM latency, token throughput, concurrent request handling, and cost per invocation at scale.

**Key Artifacts:**
- Production System (the built and integrated system)
- Evaluation Results Report (replaces test results — probabilistic quality characterization with confidence intervals)
- Adversarial Test Results (new — no Agile equivalent)
- Human Evaluation Results (new — structured assessment by domain experts)
- Performance and Cost Profile (replaces performance test results — includes AI-specific metrics like cost per invocation, token usage, and latency distribution)
- Go-Live Decision Package (replaces release readiness — includes probabilistic quality assessment, risk characterization, and operational readiness)

**Who Is Involved:** Full engineering team, QA/evaluation specialists, domain experts (for human evaluation), operations team, security team.

**Duration:** 3-8 weeks depending on system complexity. Harden is the longest phase for complex systems because quality is a distribution you converge on, not a checklist you complete.

---

### Phase 5: OPERATE

**Objective:** Run the system in production with continuous evaluation, drift detection, and feedback loops that drive ongoing improvement.

**What Happens:**
- Deploy to production with monitoring from day one. Not just uptime monitoring — quality monitoring. Track the same probabilistic metrics used in Harden, continuously, in production.
- Implement drift detection. Model drift, data drift, concept drift — detect when the system's behavior is changing before users notice.
- Run continuous evaluation against the production evaluation suite. Not once. Not weekly. Continuously, on a sample of production traffic.
- Collect feedback. Explicit (user ratings, thumbs up/down) and implicit (task completion, abandonment, escalation to human). Feed this back into the evaluation set.
- Retrain, re-prompt, or re-architect as needed. Non-deterministic systems require ongoing investment. They do not "go live and stabilize" the way deterministic systems do. Budget for this. Staff for this. The operational cost of an AI system is higher than a deterministic system — account for it.
- Update the evaluation dataset continuously. Production data reveals gaps, edge cases, and failure modes that no pre-production evaluation set captures. The evaluation dataset is a living artifact.
- Conduct periodic human evaluation. Automated metrics track what you know to measure. Human evaluation catches what you do not.

**Key Artifacts:**
- Quality Dashboard (replaces production monitoring — includes probabilistic quality metrics, drift indicators, and evaluation results)
- Feedback Loop Pipeline (new — infrastructure for collecting, processing, and acting on user feedback)
- Evaluation Dataset Updates (ongoing — production-informed additions to the evaluation set)
- Periodic Quality Review (replaces sprint review — structured assessment of system quality, emerging issues, and improvement opportunities)

**Who Is Involved:** Operations team, AI/ML practitioners (ongoing), domain experts (periodic evaluation), product owner (quality review and prioritization).

**Duration:** Ongoing. Operate does not end. This is the key mindset shift — non-deterministic systems require permanent investment in quality, evaluation, and improvement. If your organization treats deployment as the finish line, AI systems will degrade.

---

## Decision Gates Between Phases

Each phase transition is a decision gate. Not a rubber stamp — an actual decision, made by accountable people, based on evidence.

### Gate 1: Frame to Explore (GO/NO-GO)

**Decision:** Is the value hypothesis clear, measurable, and worth pursuing?

**Criteria:**
- Value hypothesis is articulated in business terms with measurable outcomes
- Probabilistic success criteria are defined and agreed
- Risk boundaries are defined and the blast radius is acceptable
- The problem genuinely requires non-deterministic components (deterministic alternatives have been considered and rejected with justification)
- Funding and staffing for Explore are approved

**Kill Signal:** If you cannot articulate what "good enough" looks like in measurable terms, you are not ready to explore. Go back.

### Gate 2: Explore to Shape (GO/PIVOT/KILL)

**Decision:** Did experimentation validate that the value hypothesis is achievable? Which approach works?

**Criteria:**
- At least one approach meets or exceeds the probabilistic success criteria on the evaluation dataset
- The evaluation dataset is representative and large enough to have statistical confidence
- Cost, latency, and scalability of the approach are within acceptable bounds
- Failed approaches are documented with clear rationale

**Kill Signal:** No approach meets the bar. The technology is not ready, or the problem is harder than estimated. Kill the initiative or park it for reassessment. Do not push a failing approach into Shape because you have already spent money on Explore.

**Pivot Signal:** An approach partially meets the bar, and the evidence suggests a modified scope or approach could succeed. Revisit Frame with the new information and run a focused Explore.

### Gate 3: Shape to Harden (GO/REVISIT)

**Decision:** Is the production design complete, and does it account for integration, fallback, and operations?

**Criteria:**
- Hybrid system architecture is reviewed and approved
- Integration contracts with legacy and deterministic systems are defined
- Fallback paths are designed for all non-deterministic components
- Production evaluation suite is designed and the evaluation dataset is expanded
- Operational model is defined with clear ownership

**Revisit Signal:** Architecture review surfaces gaps in integration, fallback, or operations. Return to Shape — do not carry design debt into Harden.

### Gate 4: Harden to Operate (GO/ITERATE)

**Decision:** Does the system meet probabilistic quality thresholds and is it operationally ready?

**Criteria:**
- Production evaluation results meet the probabilistic success criteria defined in Frame, with statistical confidence
- Adversarial testing is complete with no critical vulnerabilities
- Human evaluation confirms subjective quality meets the bar
- Fallback paths are tested and functional
- Operational team is trained and monitoring is in place
- Cost per invocation at scale is within budget

**Iterate Signal:** Quality is close but not there. Return to Harden for focused improvement. Do not ship a system that does not meet its own quality criteria because of schedule pressure. You defined those criteria in Frame for a reason.

---

## Quality Gates: Probabilistic, Not Binary

Traditional software quality is binary. The test passes or it fails. The feature works or it does not.

Non-deterministic system quality is probabilistic. The system performs at a certain level across a distribution of inputs, with measurable variance, confidence intervals, and known failure modes.

### How Probabilistic Quality Gates Work

**Define the metric.** What are you measuring? Accuracy, relevance, faithfulness, harmlessness, helpfulness, task completion rate, user satisfaction — whatever matters for this system.

**Define the threshold.** Not "100% correct" but "at least 92% of responses rated acceptable or better by domain experts, with less than 1% rated harmful, measured on the production evaluation set of 500+ examples."

**Define the confidence level.** Your evaluation result is a sample statistic, not a population parameter. "92% acceptable with 95% confidence interval of +/- 3%" is a quality statement. "It seems to work well" is not.

**Define the measurement method.** Automated evaluation, human evaluation, or both. For most LLM systems, you need both. Automated metrics catch regression. Human evaluation catches quality degradation that metrics miss.

**Define the cadence.** Pre-launch: run the full evaluation suite. Post-launch: run continuously on a sample of production traffic, with periodic full evaluation.

### What Replaces Pass/Fail

| Traditional (Deterministic) | Grounded Delivery (Non-Deterministic) |
|---|---|
| Test passes or fails | Evaluation produces a quality distribution |
| 100% of tests must pass | Quality metric must exceed threshold with statistical confidence |
| Regression = a test that used to pass now fails | Regression = quality metric drops below threshold or variance increases beyond bounds |
| Fix the bug, test passes again | Investigate cause (model drift, data drift, prompt degradation), adjust approach, re-evaluate |
| Ship when all tests pass | Ship when quality distribution meets criteria and operational readiness is confirmed |

### The Evaluation Dataset Is Your Most Important Asset

This cannot be overstated. For non-deterministic systems, the evaluation dataset is more important than the code. Code can be regenerated. Prompts can be rewritten. Models can be swapped. But a high-quality, representative, labeled evaluation dataset that reflects your domain, your edge cases, and your quality standards — that takes months to build and cannot be shortcut.

Invest in it from Explore onward. Expand it in Shape. Use it in Harden. Update it in Operate. Treat it as a first-class artifact with version control, ownership, and quality standards.

---

## Experimentation as First-Class Work

In Agile, experimentation is a "spike" — a time-boxed investigation grudgingly tolerated within a sprint because it does not produce shippable increments. Spikes are second-class citizens. They do not earn velocity. They are treated as overhead.

In Grounded Delivery, experimentation is the primary activity of an entire phase (Explore) and a permanent capability in Operate.

### What This Means in Practice

**Experimentation has its own artifacts.** Experiment logs, evaluation datasets, approach assessments. These are deliverables. They are reviewed. They inform decisions. They are not tickets you close when the spike is done.

**Failed experiments are valued.** A well-documented failed experiment that narrows the solution space is more valuable than a hacked-together demo that "kind of works." Organizations that punish failed experiments get fewer experiments and more hidden failures.

**Experimentation has its own funding model.** Do not fund Explore as part of a delivery budget with committed scope. Fund it as an investigation with a defined time box and a go/no-go decision at the end. This is how pharmaceutical R&D works. It is how venture capital works. Software needs to adopt the same mindset for non-deterministic work.

**Parallel experimentation is the default.** When you do not know which approach will work, try multiple approaches in parallel. This feels wasteful to organizations conditioned by Agile's "one story at a time" mentality. It is not wasteful — it is risk management. Running three experiments in parallel for two weeks is cheaper than running them sequentially for six weeks.

**Experimentation continues in production.** A/B testing, canary deployments, shadow evaluation — these are not nice-to-haves. They are how you continue to learn and improve non-deterministic systems after deployment.

---

## Deterministic and Non-Deterministic: Coexistence in the Delivery Pipeline

Every production AI system is a hybrid. The LLM generates text; deterministic code validates, formats, routes, logs, and governs that text. The agent reasons about actions; deterministic guardrails constrain which actions it can take. The AI component is one part of a system that includes APIs, databases, queues, UIs, integrations, and governance layers — all of which are deterministic.

The delivery pipeline must handle both.

### Dual-Track Governance

**Deterministic components** follow conventional engineering practices. Code review, unit testing, integration testing, CI/CD, version control, standard change management. Agile works fine here. Use it.

**Non-deterministic components** follow Grounded Delivery practices. Experimentation, evaluation-driven development, probabilistic quality gates, continuous monitoring.

**The integration layer** — where deterministic meets non-deterministic — requires specific attention:
- Contract testing between AI components and their deterministic consumers. What format does the AI output come in? What happens when it does not conform?
- Fallback routing. When the AI component times out, returns garbage, or hits a confidence threshold, deterministic code takes over. This logic is deterministic and testable.
- Logging and observability. Every AI invocation is logged with input, output, latency, token count, and metadata. This log feeds evaluation and monitoring. The logging infrastructure is deterministic.
- Governance enforcement. Content filters, PII redaction, compliance checks, approval workflows — all deterministic, all wrapping the non-deterministic component.

### Practical Pipeline Architecture

```
[Deterministic Components]  -->  Standard CI/CD  -->  Standard Testing  -->  Deploy
                                     |
[Non-Deterministic Components] --> Evaluation Pipeline --> Probabilistic Gates --> Deploy
                                     |
[Integration Layer]  -->  Contract Testing + Fallback Testing  -->  Deploy
```

All three tracks feed into a single deployment. The deterministic and non-deterministic components are built, tested, and evaluated separately but deployed together. The integration layer is where you prove they work as a system.

### What This Means for Teams

You do not need two separate teams. You need one team that understands both tracks and knows which practices apply where. The same engineer who writes deterministic API code can write AI evaluation harnesses — provided they understand that the quality model is different.

What you do need is clarity about which track a given piece of work falls on. A task to "improve the prompt" is non-deterministic work — it requires evaluation, not unit testing. A task to "add PII redaction to AI output" is deterministic work — it has a clear spec and binary tests. Conflating the two causes the problems Agile teams experience today: trying to write acceptance criteria for prompt engineering, or trying to estimate story points for research.

---

## Vibe Coding and AI IDEs: Guardrails for AI-Accelerated Development

AI-powered development tools — GitHub Copilot, Cursor, Claude Code, and their successors — have fundamentally changed the speed of code production. This is real. The productivity gains are measurable.

The risk is equally real: speed without architectural intent is technical debt at machine speed.

### The Problem with Unguarded Vibe Coding

Vibe coding — generating code through natural language prompts with minimal manual intervention — produces code optimized for the immediate request. It does not know about:

- Your legacy system constraints. The COBOL batch job that runs at 2 AM and expects a specific file format.
- Your integration boundaries. The API gateway that enforces rate limits, the message queue that expects a specific schema.
- Your security model. The IAM policies, the network segmentation, the data classification rules.
- Your operational reality. The on-call team that has to debug this at 3 AM, the monitoring stack that needs to ingest these logs, the compliance requirements that mandate audit trails.
- Your architectural intent. The decision to use event-driven architecture, the choice of eventual consistency, the boundary between bounded contexts.

AI IDEs generate code that works in isolation. Enterprise systems do not run in isolation.

### Guardrails for Enterprise AI-Accelerated Development

**1. Architectural Context as Input**

AI IDEs must be given architectural context — and the Grounded Delivery process must produce that context as an explicit artifact. The Hybrid System Architecture from Shape is not just documentation for humans; it is input for AI-assisted development. Organizations that skip Shape and go straight to coding (with or without AI assistance) will produce systems that do not fit their landscape.

Practically: establish project-level configuration that encodes constraints — integration patterns, allowed dependencies, security requirements, naming conventions, error handling standards. AI IDEs that can consume these constraints produce dramatically better output than those operating in a vacuum.

**2. The Review Contract**

Every piece of AI-generated code gets reviewed before merge. This is non-negotiable. The review focuses on:

- **Architectural fit.** Does this code respect the system boundaries defined in Shape?
- **Integration correctness.** Does this code interact with other systems (especially legacy) in the prescribed way?
- **Operational readiness.** Is this code observable, debuggable, and operable?
- **Security.** Does this code introduce vulnerabilities, leak data, or bypass governance?

Code review for AI-generated code is harder than for human-written code because the reviewer did not participate in the design thinking. The code appeared fully formed. Reviewers must be especially vigilant about hidden assumptions.

**3. Test Generation Is Not Test Strategy**

AI IDEs can generate tests. This is useful for deterministic components — unit tests, integration tests, contract tests. It is dangerous for non-deterministic components if it creates the illusion of coverage. An AI-generated test for an LLM call that asserts on a specific string is worse than no test — it provides false confidence and breaks on every run.

For non-deterministic components, test strategy must be defined by humans in Shape and Harden. AI IDEs can help implement the evaluation harnesses, but the strategy — what to evaluate, how, and against what thresholds — is a human responsibility.

**4. Velocity Discipline**

AI-accelerated development can produce features faster than the organization can evaluate, integrate, test, and operate them. This is a new form of work-in-progress overload.

Grounded Delivery applies WIP limits not on stories, but on unevaluated components. If a team produces three AI features in a week but only evaluates one, the other two are inventory — not progress. Evaluation throughput, not code production throughput, is the bottleneck to manage.

**5. Disposable Code Mentality**

AI-generated code is cheap to produce. This is a feature, not a bug — if organizations internalize it. Code that was cheap to produce should be cheap to throw away. When evaluation results in Harden show that an approach does not meet quality thresholds, the response should be "regenerate and try a different approach," not "patch and push through."

Organizations conditioned to value code because it was expensive to produce will struggle with this. The mindset shift: code is a hypothesis. Evaluation data is the asset.

---

## Scaling Across the Enterprise

One team doing Grounded Delivery is a pilot. Enterprise value requires scaling practices across dozens or hundreds of teams, most of whom are also doing deterministic work.

### The Scaling Model: Centers of Practice, Not Centers of Excellence

Centers of Excellence centralize capability and create bottlenecks. Every team that needs AI capability must wait for the CoE. This does not scale.

Centers of Practice distribute capability through standards, tooling, and knowledge sharing:

- **Define the method.** The five phases, the decision gates, the quality gates, the artifacts — these are standardized across the enterprise. Every team delivering non-deterministic components uses the same framework. This does not mean every team executes identically — it means every team speaks the same language and meets the same governance expectations.
- **Provide shared tooling.** Evaluation frameworks, monitoring dashboards, experiment tracking, evaluation dataset management — these are enterprise-shared capabilities. Individual teams should not be building their own evaluation infrastructure from scratch.
- **Embed practitioners.** Every team delivering AI capability needs at least one person who has done it before. In early scaling, these practitioners rotate across teams. Over time, capability becomes distributed.
- **Govern at the gates.** Enterprise governance happens at the decision gates, not through daily oversight. Frame gates ensure value alignment. Explore gates prevent throwing good money after bad. Harden gates enforce quality standards. This is lighter than most enterprise governance and more effective because it is tied to evidence, not ceremony.

### Portfolio-Level Decision Making

At the enterprise level, AI initiatives are managed as a portfolio with explicit investment stages:

- **Frame-stage initiatives** receive minimal funding (staff time for 1-3 weeks). The majority of ideas enter Frame. Many do not exit it. This is correct.
- **Explore-stage initiatives** receive investigation funding (small team for 2-6 weeks). Explore is the highest-risk phase, and the portfolio should expect a significant percentage of initiatives to be killed at the Explore-to-Shape gate.
- **Shape and Harden initiatives** receive delivery funding. By this point, the approach is validated and the risk is execution, not feasibility.
- **Operate-stage systems** receive ongoing operational funding. This is not "maintenance" — it is continuous quality management.

Portfolio managers track initiatives by phase, conversion rates at each gate, and cumulative value delivered in Operate. This is more useful than tracking story points, velocity, or feature counts.

### What Scales and What Does Not

**What scales:**
- The five-phase model
- Decision gates with evidence-based criteria
- Probabilistic quality gates
- Shared evaluation tooling
- Portfolio-level governance by investment stage

**What does not scale and should not be attempted:**
- Centralized AI teams doing all AI work (creates bottlenecks)
- Uniform sprint cadences for non-deterministic work (cadence should match the work, not a calendar)
- Enterprise-wide standardization on one model, one framework, or one approach (the technology is moving too fast — standardize the method, not the implementation)
- Mandatory AI adoption targets ("every team must have an AI initiative") — this produces waste, not value

---

## Artifact Crosswalk: Agile to Grounded Delivery

For teams transitioning from Agile, this maps familiar artifacts to their Grounded Delivery equivalents:

| Agile Artifact | Grounded Delivery Equivalent | Key Difference |
|---|---|---|
| User Story | Value Hypothesis | Describes expected business outcome, not user interaction |
| Acceptance Criteria | Probabilistic Success Criteria | Thresholds with confidence intervals, not binary conditions |
| Sprint Backlog | Experiment Log (Explore) / Work Backlog (Harden) | Explore tracks hypotheses and results, not tasks |
| Definition of Done | Quality Distribution Threshold | Done means "meets probabilistic criteria with statistical confidence" |
| Sprint Review | Quality Review | Reviews evaluation results and quality trends, not demos |
| Sprint Retrospective | Phase Retrospective | Conducted at phase transitions, not every 2 weeks |
| Velocity | Evaluation Throughput | Measures rate of quality validation, not code production |
| Test Suite | Evaluation Suite | Probabilistic, continuous, and domain-expert informed |
| Release Readiness | Go-Live Decision Package | Includes probabilistic quality assessment and operational readiness |
| Product Backlog | Value Opportunity Pipeline | Prioritized by signal capture potential, not feature requests |
| Technical Spike | Explore Phase | Full phase with artifacts, not a time-boxed afterthought |
| CI/CD Pipeline | Dual-Track Pipeline | Separate quality gates for deterministic and non-deterministic components |

---

## Implementation Guidance

### Starting Grounded Delivery on Your First Initiative

1. **Pick the right first initiative.** Not the highest-value, not the most visible. Pick one that has a clear value hypothesis, a willing team, and a manageable blast radius. You will make mistakes. Make them where they are cheap.

2. **Run Frame properly.** The temptation will be to skip Frame and start experimenting. Resist it. Frame takes 1-3 weeks. It saves months.

3. **Staff Explore with people who are comfortable with uncertainty.** Not every engineer thrives in research mode. Explore requires people who can design experiments, tolerate ambiguity, and document failures without ego.

4. **Build the evaluation dataset early and invest heavily.** If you take one thing from this document, take this. The quality of your evaluation dataset determines the quality of every decision you make from Explore onward.

5. **Enforce the decision gates.** The hardest gate is Explore-to-Shape. You will have a team that has spent weeks experimenting, produced something promising but not convincing, and wants to push forward. If the evidence does not meet the threshold, do not advance. The gate exists to prevent exactly this kind of sunk-cost reasoning.

6. **Do not abandon Agile for deterministic work.** Grounded Delivery applies to non-deterministic components. Most of your engineering work is still deterministic. Use Agile where Agile works. Use Grounded Delivery where it does not.

7. **Expect the first cycle to be slow.** The first time through the five phases will feel deliberate — slower than "just building it." By the second and third cycle, teams internalize the model and move faster because they make fewer wrong turns, kill failing approaches earlier, and invest in the right quality practices from the start.

---

## How This Connects to the Other Pillars

Grounded Delivery does not operate in isolation. It is one of three pillars in the LegacyForward.ai Framework, and the pillars are designed to reinforce each other.

### Pillar 1: Signal Capture feeds Frame

The Frame phase depends entirely on Pillar 1 (Signal Capture). The value hypothesis that initiates Frame is the output of the Signal Capture process — the disciplined identification of where AI creates net new value, not just task acceleration. Without Signal Capture, teams Frame the wrong problems. They build AI for problems that do not require AI, or they pursue automation disguised as transformation. Signal Capture ensures that every initiative entering the Grounded Delivery pipeline has a defensible reason to exist.

### Pillar 3: Legacy Coexistence shapes Shape and Harden

The Shape phase is where Pillar 3 (Legacy Coexistence) has the most direct impact. When designing the production system, the integration patterns, fallback paths, and hybrid architecture all depend on the legacy landscape. The AI component does not exist in a vacuum — it interacts with systems that may expose SOAP endpoints, flat files, batch interfaces, or databases with no API. Legacy Coexistence provides the architectural patterns that Shape uses to design those integrations. In Harden, legacy integration testing validates that the AI system works within the real enterprise landscape, not just in isolation.

### The Feedback Loop

Signal Capture identifies what to build. Grounded Delivery defines how to build it. Legacy Coexistence ensures it works where it has to work. And the Operate phase feeds back into Signal Capture — production data reveals whether the value hypothesis was correct, which informs the next round of value identification. The framework is a cycle, not a sequence.

---

## Summary

Grounded Delivery is not anti-Agile. It moves beyond Agile in the same way that Agile moved beyond Waterfall — a recognition that the work has changed, and the delivery method must change with it.

The work changed when software moved from manufacturing metaphor to knowledge work metaphor. Agile was the answer.

The work has changed again. Non-deterministic systems do not behave like deterministic software. They require experimentation instead of estimation, evaluation instead of testing, probabilistic quality instead of binary pass/fail, and continuous investment instead of ship-and-stabilize.

Grounded Delivery — Frame, Explore, Shape, Harden, Operate — provides the structure to deliver non-deterministic systems with the same rigor and governance that enterprises demand, without forcing that work into a process that was never designed for it.

The organizations that figure this out first will ship AI that works in production. The rest will keep running sprints and wondering why their AI initiatives fail.

---

*LegacyForward.ai Pillar 2 -- Grounded Delivery for Non-Deterministic Systems*
*Part of the LegacyForward.ai Framework: legacyforward.ai*
