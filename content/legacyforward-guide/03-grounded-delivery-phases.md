---
title: "Grounded Delivery: The Five Phases"
slug: "grounded-delivery-phases"
description: "Why Agile breaks for AI — and the five-phase delivery methodology built for non-deterministic systems."
section: "legacyforward-guide"
order: 3
part: "Pillar 2: Grounded Delivery"
badges: ["Grounded Delivery", "Delivery Methodology"]
---

# Grounded Delivery: The Five Phases

![Grounded Delivery: Frame → Explore → Shape → Harden → Operate](/diagrams/legacyforward-guide/03-grounded-delivery-phases-1.svg)

## Why Agile Breaks for AI

Agile works for deterministic systems. Software has rules. The same function called with the same input produces the same output every time. Agile's foundational constructs — user stories with binary acceptance criteria, sprint velocity estimates, regression test suites — all depend on this property.

AI systems are non-deterministic. The same prompt, applied to the same document, at different times, can produce different outputs. Not because of a bug. Because of how large language models and probabilistic systems work. An answer that is correct ninety-four times can be wrong on the ninety-fifth with no error code, no warning, and no traceable root cause.

Here is what breaks when you apply Agile to AI:

| Agile Assumption | AI Reality |
|---|---|
| User stories have binary acceptance criteria (pass/fail) | AI output quality is a distribution, not a point — you need confidence intervals, not checkboxes |
| Sprint velocity is measurable and predictable | AI exploration does not have predictable output — a two-week spike might produce a breakthrough or a dead end |
| Regression tests prevent quality degradation | Model drift, prompt drift, and data shift degrade AI quality between releases without any code change |
| "Done" means releasable | AI systems require ongoing monitoring, retraining, and quality management — they are never done |
| The build phase follows the design phase | AI development is iterative discovery — you cannot design what you have not yet explored |
| Definition of Done is fixed at sprint start | AI quality thresholds evolve as the team learns what "good" means for this specific use case |

> **Think of it like this:** Agile is a production line. You design the car, break the design into parts, build the parts, assemble the car, test it, ship it. Grounded Delivery is more like running a clinical trial. You have a hypothesis. You design experiments. You analyze results. You define what "works" based on evidence, not requirements. You establish ongoing monitoring because the treatment that works today may not work the same way next year.

Grounded Delivery replaces Agile's deterministic machinery with five phases designed for the reality of AI systems: Frame, Explore, Shape, Harden, Operate.

---

## Grounded Delivery vs. Traditional Agile

| Dimension | Traditional Agile | Grounded Delivery |
|---|---|---|
| Quality model | Binary pass/fail tests | Quality distributions with confidence intervals |
| Planning unit | Sprint velocity | Experiment results and learning milestones |
| Acceptance criteria | Deterministic (output equals expected) | Probabilistic (output meets threshold at defined confidence level) |
| Exploration | Time-boxed spikes within sprints | Full dedicated phase (Explore) with explicit gate criteria |
| Test assets | Regression test suite | Evaluation dataset — a first-class asset rivaling production code |
| Done criteria | Feature complete, tests pass | Quality thresholds met, monitoring in place, drift detection active |
| Post-deployment | Maintenance mode | Operate — permanent monitoring, retraining, ongoing evaluation |
| Failure handling | Bug report, fix, regression test | Drift detection, quality gate breach, probabilistic review |
| Governance | Velocity and burn-down | Phase gate decisions: GO / PIVOT / KILL |

---

## Phase 1: Frame

**Objective:** Establish the value target, define what "good" means probabilistically, and create the conditions for honest exploration before development begins.

The Frame phase does not define what to build. It defines what value to pursue and how to know whether the initiative is achieving it. It takes the Value Hypothesis from Signal Capture and translates it into operational terms that can drive delivery decisions.

**Activities:**
- Translate the Value Hypothesis into measurable success criteria expressed as probability distributions, not binary targets. "Summarize regulatory documents with 85% analyst-agreement score at the 90th percentile" is a Frame output. "AI summarizes documents" is not.
- Define the evaluation dataset requirements: what data is needed to know whether the AI is working? The evaluation dataset is designed here, not in Harden.
- Map the legacy integration landscape for this initiative. Which legacy systems participate? What data is needed, at what latency, in what format?
- Identify failure modes: what happens when the AI is wrong? What is the business impact? What is the fallback? Non-deterministic systems must have fallbacks designed from the start, not added as an afterthought.
- Define the go/no-go criteria for the Explore phase. What would cause this initiative to be killed or pivoted before significant development investment?

**Gate: GO / NO-GO.** Frame exits with documented success criteria, evaluation dataset design, integration map, and failure mode analysis. If these cannot be produced — if the team cannot articulate what "good" looks like before they start building — the initiative should not proceed to Explore.

---

## Phase 2: Explore

**Objective:** Validate whether current AI capabilities can actually deliver the claimed value, against real data, with real edge cases — before committing to production development.

Explore is not a spike. It is not a two-week experiment wedged into a sprint. It is a full delivery phase with its own objectives, activities, and gate criteria. The purpose is to discover what is possible, what is not possible, and what is possible under which conditions — before anyone writes production code.

**Activities:**
- Run structured experiments against production-representative data. Not curated subsets. Not synthetic data. Real data, including the edge cases and outliers that curated data hides.
- Build and iterate the evaluation dataset. The evaluation dataset is the most important asset produced in Explore — it defines what "good" means for this specific use case and becomes the quality benchmark for everything that follows.
- Explore multiple technical approaches. Do not commit to the first approach that produces a promising demo. Explore competing architectures, model configurations, and prompt strategies. Document what each approach can and cannot do.
- Validate legacy data access. Can the initiative actually access the data it needs from the legacy systems that hold it? In what format? At what latency? Does the actual data quality match the assumed data quality?
- Produce a capability map: a documented assessment of what the AI can reliably do, what it cannot do, and where its performance degrades. This is not a demo reel. It is an honest assessment.

**Gate: GO / PIVOT / KILL.** Explore ends with a Go/Pivot/Kill decision based on evidence. GO means the capability map demonstrates that the value hypothesis is achievable with current technology. PIVOT means the hypothesis needs to be revised. KILL means the hypothesis is not achievable with current technology, the data does not support it, or the integration constraints make it infeasible. Killing an initiative at Explore is success — it means the organization did not spend production development resources on something that would fail.

---

## Phase 3: Shape

**Objective:** Design the production architecture, separating deterministic and non-deterministic components, defining fallback paths, and creating the technical foundation for a system that can be operated and monitored in production.

Shape is where Grounded Delivery's most important architectural principle is implemented: deterministic and non-deterministic components must be separated and governed independently.

**Activities:**
- Design the system architecture with explicit separation between deterministic components (business logic, data validation, integration code, routing) and non-deterministic components (model inference, prompt execution, AI-generated content).
- Design fallback paths for every non-deterministic component. What happens when the AI component is unavailable? When quality drops below acceptable thresholds? When the model produces output that fails validation? Fallbacks must be designed before Harden, not after.
- Define monitoring requirements. What metrics will be tracked? What constitutes a quality gate breach in production? What triggers human review? What triggers automatic rollback?
- Select Legacy Coexistence patterns for each integration point.
- Design the evaluation pipeline. How will the system be evaluated continuously in production? What is the evaluation cadence? Who reviews the results?

**Gate: GO / REDESIGN.** Shape exits with a production architecture that has explicit fallback paths, monitoring design, and legacy integration patterns. An architecture without fallbacks does not exit Shape.

---

## Phase 4: Harden

**Objective:** Build the production system against the architecture defined in Shape, continuously evaluating quality against the thresholds established in Frame, and making explicit decisions when quality gates are not met.

**Activities:**
- Implement deterministic components with conventional engineering rigor: unit tests, integration tests, code review, regression testing.
- Implement non-deterministic components against the evaluation dataset. Every iteration is evaluated against the quality thresholds defined in Frame. Output quality is tracked as a distribution over time, not a point-in-time pass/fail.
- Implement legacy integrations and test against production-representative legacy behavior. Mocked legacy systems in test environments do not replicate the timing, data quality, format variations, and error conditions of production legacy systems.
- Implement monitoring infrastructure before going to production, not after. Drift detection, quality gate thresholds, alerting, and the operational dashboard are built in Harden.
- Conduct red-team evaluation: deliberately attempt to produce failure modes identified in Explore. Document the failure rate. Determine whether it is within the acceptable threshold defined in Frame.

**Gate: GO / CONTINUE / KILL.** Harden exits when quality thresholds from Frame are consistently met in evaluation, legacy integrations are validated against production-representative data, and monitoring is operational.

---

## Phase 5: Operate

**Objective:** Run the AI system in production as a permanent operational discipline — monitoring quality, detecting drift, managing ongoing performance, and feeding evidence back into Signal Capture.

Operate is not maintenance mode. An AI system that is not actively monitored and managed will degrade. Model drift, prompt drift, data distribution shift, and changing business context all erode AI performance between releases — often without any code change, without any error log, and without any user complaint until the damage is significant.

**Activities:**
- Run continuous evaluation against the evaluation dataset. Quality is not a deployment-time property — it is an ongoing property that must be measured.
- Monitor for drift: model drift, prompt drift, and data drift.
- Operate governance checkpoints: regular reviews of quality metrics by the team responsible for the system. These are not optional. An AI system without a defined governance cadence is not in production — it is abandoned.
- Feed operational evidence back into Signal Capture. Is the initiative capturing the value that was hypothesized?
- Manage the human-AI trust boundary. As confidence in the system builds, the trust boundary can be adjusted — from 100% human verification to sampling-based verification to exception-only review. Trust graduation criteria must be explicit.

**There is no exit gate for Operate.** Operate is forever. If the organization is not willing to maintain an AI system in production as a permanent operational discipline, the system should not be deployed.
