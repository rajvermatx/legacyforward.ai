---
title: "User Stories & Process Modeling"
slug: "user-stories-process-modeling"
description: "How to use LLMs to generate, validate, and split user stories from requirements, and to discover, model, and optimize business processes from documents and data."
section: "ai-for-analysts-and-qa"
order: 6
part: "Part 02 Business Analysis"
---

Part 2: Business Analysis with LLMs

# User Stories & Process Modeling

Two of the most important BA deliverables are user stories and process models. User stories turn requirements into sprint-ready work items. Process models capture how the business actually operates and where it needs to improve. This chapter covers both: generating, validating, and splitting user stories from requirements, and discovering, modelling, and optimizing business processes from documents and data.

Reading time: ~45 min Projects: Agile Story Generator · Process Discovery Engine

---

## Part A: User Story Generation and Refinement

## 6.1 From Requirements to Stories

Requirements and user stories serve different purposes. A requirement describes *what* the system must do. A user story describes *who* needs it, *what* they need, and *why*. The canonical template — "As a [role], I want [capability], so that [benefit]" — forces the author to think from the user's perspective.

The translation from requirements to stories is not one-to-one. A single requirement may generate multiple stories, one per user role or interaction path. Multiple requirements may collapse into a single story when they describe facets of the same user goal.

LLMs excel at this translation for three reasons:

- **Role inference:** LLMs can identify implicit user roles from requirement text ("the finance team needs..." implies an "Accountant" or "Finance Manager" role).
- **Benefit articulation:** Requirements often omit the "so that" clause. LLMs can infer the business benefit from context.
- **Decomposition:** LLMs can break compound requirements into atomic stories that each deliver a testable increment of value.

### The Translation Pipeline

![Diagram 1](/diagrams/llm-ba-qa/user-story-generation-1.svg)

Figure 6-1. Requirements to User Stories Pipeline — from a business requirement through role identification, story generation, validation, and acceptance criteria to a sprint-ready backlog item.

| Input | Process | Output |
| --- | --- | --- |
| Classified requirement | Role extraction, benefit inference | Draft user story |
| Draft user story | Acceptance criteria generation | Story + AC |
| Story + AC | INVEST validation | Validated story or split candidates |
| Split candidates | Story splitting | Right-sized stories |

Throughout this section, "AC" refers to Acceptance Criteria, and "story" is shorthand for "user story." "Epic" refers to a large body of work that can be decomposed into multiple stories.

## 6.2 Generating User Stories with LLMs

The story generation prompt casts the LLM as a senior Product Owner and provides five explicit rules:

1. Each story must be atomic, delivering exactly one piece of user-visible functionality.
2. If the requirement implies multiple user roles, a separate story is created for each role.
3. Compound requirements (those containing "and" joining distinct capabilities) are split into separate stories.
4. The "so that" clause must state a concrete business benefit rather than merely restating the capability.
5. Every story receives a sequential ID and a link back to its source requirement.

The prompt also accepts contextual inputs: the project domain and a list of known user roles. These help the LLM generate stories with consistent role names aligned with your project's terminology.

### Batch Generation Across a Requirement Set

For large requirement sets, process each requirement independently and in parallel using asynchronous API calls. Apply a concurrency limit (for example, 10 simultaneous requests) to stay within API rate limits. After all responses return, merge the story lists and assign sequential IDs (STORY-001, STORY-002) across the full set. This approach lets you generate stories for 50 or more requirements in under a minute.

## 6.3 Acceptance Criteria Automation

Acceptance criteria define when a story is "done." Well-written AC are specific, testable, and complete. LLMs can generate AC in both the Given/When/Then (Gherkin) format and the checklist format, depending on your team's preference.

### Generating Gherkin-Style AC

The acceptance criteria prompt instructs the LLM to generate scenarios in Given/When/Then format for each story. Four rules ensure quality: cover the happy path plus at least one edge case and one error scenario; make each scenario independently testable; use concrete values instead of vague terms ("within 3 seconds" rather than "quickly"); and include boundary conditions where applicable. The output is a JSON object containing the story ID and an array of scenario objects, each with a descriptive name, preconditions, actions, expected outcomes, and a type tag (Happy Path, Edge Case, or Error).

### Example Output

For the story "As a Finance Manager, I want to export monthly reports as PDF, so that I can share them with auditors":

| Scenario | Given | When | Then | Type |
| --- | --- | --- | --- | --- |
| Successful export | A report for March 2026 exists with 150 line items | The user clicks "Export as PDF" | A PDF file is downloaded within 5 seconds containing all 150 line items | Happy path |
| Empty report | A report for April 2026 exists with zero line items | The user clicks "Export as PDF" | A PDF is generated with a "No data available" message | Edge case |
| Export timeout | A report has 50,000 line items and the export exceeds 30 seconds | The user clicks "Export as PDF" | The user sees a progress indicator and can cancel; the system queues the export for background processing | Error |

LLM-generated acceptance criteria often miss domain-specific edge cases (fiscal year boundaries, currency rounding rules, timezone handling). Always review AC with domain experts before marking them as final.

## 6.4 Story Splitting Strategies

Stories that are too large cannot be completed within a single sprint. Stories that are too small create overhead without delivering meaningful value. LLMs can apply well-known splitting patterns systematically.

### The Nine Splitting Patterns

| # | Pattern | When to Use | Example |
| --- | --- | --- | --- |
| 1 | Workflow steps | Story covers a multi-step process | Split "checkout" into cart review, payment, confirmation |
| 2 | Business rules | Multiple rules govern the behaviour | Split discount calculation by rule type |
| 3 | Happy/unhappy paths | Error handling is complex | Separate success flow from error handling |
| 4 | Input methods | Multiple input channels exist | Split "upload document" into drag-drop, file picker, API |
| 5 | Data types | Different data entities are involved | Split "manage users" into create, update, deactivate |
| 6 | Operations (CRUD) | Story involves multiple operations | Separate read from write operations |
| 7 | User roles | Different roles have different needs | Admin view vs. end-user view |
| 8 | Platforms | Cross-platform support needed | Web version first, then mobile |
| 9 | Performance levels | Non-functional requirements are separable | Basic functionality first, then optimize for scale |

### Automated Splitting

The splitting prompt provides the LLM with the oversized story (including its current point estimate, story text, and acceptance criteria) and asks it to apply the most appropriate pattern or combination of patterns. For each resulting sub-story, the model produces a new ID (STORY-003.1, STORY-003.2), the full "As a... I want... so that..." text, the pattern used, a revised point estimate (targeting 1, 2, 3, or 5 points), and any dependencies between sub-stories.

![Diagram 2](/diagrams/llm-ba-qa/user-story-generation-2.svg)

Figure 6-2. Story Splitting Decision Tree — a simplified guide for choosing the right splitting pattern based on story characteristics.

After splitting, re-run acceptance criteria generation on each sub-story. The original AC should be distributed across the sub-stories, with each sub-story getting the specific scenarios it covers.

## 6.5 INVEST Criteria Validation

The INVEST acronym defines six qualities of a well-formed user story: **I**ndependent, **N**egotiable, **V**aluable, **E**stimable, **S**mall, and **T**estable. LLMs can evaluate each criterion and flag stories that need refinement.

### INVEST Validator

The INVEST validation prompt sends the LLM each story along with its acceptance criteria and asks it to evaluate against all six criteria. For each criterion, the model returns a pass/fail flag, a score from 1 (poor) to 5 (excellent), an explanation, and an improvement suggestion for any score below 4. It also computes an overall score and a recommendation: Ready, Needs Refinement, Needs Split, or Reject. Use a very low temperature (0.1) for this evaluation — you want consistent, deterministic assessments.

### Interpreting Results

| Overall Score | Recommendation | Action |
| --- | --- | --- |
| 4.0 – 5.0 | READY | Story can go directly to sprint planning |
| 3.0 – 3.9 | NEEDS_REFINEMENT | Address the specific failing criteria before planning |
| 2.0 – 2.9 | NEEDS_SPLIT | Story is likely too large or too dependent. Split first |
| < 2.0 | REJECT | Story needs fundamental rework; return to requirements |

The "Testable" criterion is the most reliable LLM evaluation because it is objectively assessable from the acceptance criteria. The "Independent" criterion is the least reliable because it requires knowledge of the full backlog context. Always supply related stories when checking independence.

## 6.6 Story Mapping with AI

Story mapping, popularized by Jeff Patton, arranges stories along two axes: the *user journey* (horizontal) and *priority* (vertical). It provides a bird's-eye view of the product. Teams plan releases by drawing horizontal "release lines" across the map.

An LLM can help with two aspects of story mapping: identifying the user activities and steps that form the horizontal backbone, and placing stories under the correct activity at the right priority level.

The story mapping prompt takes the full set of user stories and organizes them into a two-level hierarchy. At the top level are **activities**, high-level user goals such as "Manage Account" or "Process Orders." Each activity contains **steps** (specific actions like "Register" or "Log In"), and each step contains the stories assigned to it, tagged with a priority level and a suggested release number.

The JSON output can be rendered as an interactive HTML table, exported to tools like Miro or Mural, or printed as a simple text-based grid organized by activity, step, and release tier.

Feed the story map back to the LLM with the prompt "Identify any gaps in the user journey: steps where no stories exist but where a user would logically need functionality." This is a powerful way to discover missing stories.

## 6.7 Backlog Grooming Assistant

Backlog grooming (or refinement) is a recurring ceremony where the team reviews, re-prioritizes, and refines upcoming stories. An LLM-powered grooming assistant can prepare for these sessions by pre-analyzing the backlog and surfacing issues before the meeting begins.

### Pre-Grooming Analysis

The pre-grooming prompt sends the full backlog to the LLM and asks it to produce a structured report across six categories: **stale stories** not updated in 30+ days, **duplicates** that overlap significantly (with merge recommendations), **dependency chains** including any circular dependencies, **estimation gaps** where similar stories have inconsistent point values, **blocked items** referencing external prerequisites, and **refinement candidates** needing more detail before sprint planning. This analysis — which would take a Scrum Master 30 to 60 minutes manually — can be generated in seconds and used as the agenda for the grooming session.

### Interactive Refinement Loop

During the grooming session itself, the assistant operates in conversational mode. It maintains the full backlog in its context window and responds to team questions: "Which stories depend on STORY-042?", "Suggest a rewrite for this vague story," or "What is the total point estimate for Release 2?" Decisions made during the session are recorded with story ID, decision, and rationale. At the end, the assistant generates meeting minutes summarizing all decisions, action items, and responsible owners.

The grooming assistant should augment, not replace, the Scrum Master. Use it to surface data and suggestions, but let the team make the decisions. Over-reliance on AI in ceremonies can reduce team engagement and ownership.

## Project A: Agile Story Generator

Build a complete pipeline that converts a set of requirements into a sprint-ready backlog, including user stories with acceptance criteria, INVEST validation results, and a story map.

### Pipeline Architecture

Requirements from Chapter 5 feed into the Story Generator, which produces draft stories for each requirement. These pass through the AC Generator (acceptance criteria in Gherkin format), then the INVEST Validator. Stories scoring below 3.0 are sent to the Story Splitter. Finally, the Story Mapper organizes all stories into a release plan. The pipeline outputs two JSON files: the full story backlog (with acceptance criteria and INVEST scores) and the story map (with activities, steps, and release assignments).

### Testing Your Pipeline

Create a sample `requirements.json` with 10 requirements covering different types (functional, non-functional, constraint). Run the pipeline and verify that:

- Each requirement produces at least one story
- Stories follow the "As a... I want... so that..." template
- Each story has at least three acceptance criteria scenarios
- INVEST scores are reasonable (compare against your own assessment)
- The story map has a logical activity structure

---

## Part B: Process Modeling and Optimization

## 6.8 Understanding Business Processes

A business process is a sequence of activities that transforms inputs into outputs to deliver value to a customer or stakeholder. Processes range from simple (expense approval) to complex, such as end-to-end order fulfillment spanning multiple departments and systems.

### Process Hierarchy

| Level | Name | Description | Example |
| --- | --- | --- | --- |
| L0 | Value Chain | End-to-end enterprise capabilities | Order to Cash |
| L1 | Process Group | Major functional processes | Sales, Fulfillment, Billing |
| L2 | Process | Defined sequence of activities | Order Processing |
| L3 | Sub-Process | Detailed steps within a process | Credit Check, Inventory Allocation |
| L4 | Task | Atomic unit of work | Verify customer address |

### BPMN 2.0 Essentials

BPMN (Business Process Model and Notation) is the industry standard for visually representing business processes. The core elements:

- **Events:** Start (circle), Intermediate (double circle), End (thick circle). These represent triggers and outcomes.
- **Activities:** Tasks (rounded rectangles) and Sub-Processes (rounded rectangles with a "+" marker).
- **Gateways:** Exclusive (X), Parallel (+), Inclusive (O). These control flow branching and merging.
- **Flows:** Sequence flows (solid arrows), Message flows (dashed arrows), Associations (dotted lines).
- **Swimlanes:** Pools and Lanes that represent participants and departments.

BPMN is not just documentation. Modern BPM engines (Camunda, jBPM, Flowable) can directly execute BPMN XML definitions. An LLM that generates valid BPMN produces artifacts that are both human-readable and machine-executable.

## 6.9 Process Discovery from Documents

Process discovery is the act of understanding how work actually gets done. LLMs add a capability that complements traditional interviews and process mining: extracting process descriptions from the text-heavy documents that already exist in every organization — SOPs, training manuals, email threads, and audit reports.

### Process Extraction Approach

The process discovery prompt instructs the LLM to act as a business process analyst and extract every process described or implied in the source document. For each process, the model produces a rich, structured output: a sequential ID (PROC-001), a descriptive name, the trigger event that initiates the process, the actors (roles and departments) involved, and a detailed step list. Each step includes the step number, the responsible actor, the action performed, required inputs and produced outputs, and a flag indicating whether the step is a decision point (with branching conditions if so). The model also captures the end state, known exception paths, and any mentioned or inferable duration estimates.

### Validating Discovered Processes

Validate extracted processes against these quality checks:

- **Completeness:** Does every process have a clear start trigger and end state?
- **Consistency:** Are actor names consistent across processes? ("Finance Dept" and "Accounting Team" should not refer to the same group.)
- **Granularity:** Are all processes at roughly the same level of detail?
- **Coverage:** Do the extracted processes cover the entire scope of the source document?

A simple automated checker can flag processes missing triggers or end states, those with fewer than two steps, and actor name variants that differ only in capitalization or spacing.

![Diagram 1](/diagrams/llm-ba-qa/process-modeling-1.svg)

Figure 6-3. Process Discovery Pipeline — from source documents through text extraction and LLM analysis to formal BPMN diagrams with optimization recommendations.

Run process discovery on multiple documents from the same department, then ask the LLM to reconcile the results. Different documents often describe the same process at different levels of detail or with different terminology. The reconciliation step produces a more complete picture than any single source.

## 6.10 BPMN Generation with LLMs

Once a process is described in structured JSON, the next step is generating a formal BPMN 2.0 XML definition that can be imported into modeling tools (Camunda Modeler, Signavio, Bizagi) or executed by a BPM engine.

### BPMN XML Generation

The BPMN generation prompt takes the structured process JSON and converts it into valid BPMN 2.0 XML. The prompt enforces seven rules: proper namespace declarations, inclusion of start and end events, exclusive gateways for decision points, parallel gateways for concurrent steps, correct lane assignments within pools, complete sequence flow connections, and compatibility with tools like Camunda Modeler. Use a temperature of 0.0 for maximum consistency in the generated XML structure.

### Validating the Generated BPMN

After generation, validate the XML programmatically by parsing it with an XML library and running structural checks: verify at least one start event and one end event exist, count tasks and gateways, and confirm that sequence flows connect all elements. For full schema validation, compare against the official BPMN 2.0 XSD. Always visually inspect the result in a modeling tool before sharing with stakeholders.

LLM-generated BPMN XML often has minor issues: missing sequence flow connections, incorrect namespace prefixes, or overlapping diagram coordinates. Always validate programmatically and visually before sharing.

### A Simpler Alternative: Mermaid Diagrams

If full BPMN XML is overkill, ask the LLM to generate Mermaid flowchart syntax instead. Mermaid diagrams render natively in GitHub, Notion, Confluence, and many other tools. The prompt maps process elements to Mermaid shapes: rounded rectangles for tasks, diamonds for decisions, stadium shapes for start and end events, and labeled arrows for conditional flows. This lightweight approach is ideal for early-stage process documentation or when you need quick visual validation before investing in formal BPMN modeling.

## 6.11 Bottleneck Identification

A bottleneck is any step in a process that limits the throughput of the entire system. Traditional bottleneck analysis uses process mining on event logs. LLMs complement this by analyzing qualitative data — interview transcripts, complaint tickets, and delay reports — identifying bottlenecks that may not appear in structured logs.

### Quantitative Bottleneck Analysis

The quantitative approach works from event log data (structured records with case ID, activity name, start time, end time, and resource). For each activity, calculate three metrics: average duration, duration variability (the ratio of the 95th percentile to the median), and throughput per resource. A composite bottleneck score weights these: 40 percent for duration, 30 percent for variability, and 30 percent for inverse resource count. Steps with the highest composite scores are the most likely bottlenecks.

### Qualitative Bottleneck Analysis with LLMs

The LLM-driven approach complements quantitative analysis by processing qualitative inputs: interview transcripts, complaint tickets, and delay reports. The bottleneck prompt provides the LLM with the process description, any available performance metrics, and the qualitative feedback text. For each identified bottleneck, the model returns the affected activity, the supporting evidence, likely root causes, the downstream impact, and a severity rating (Critical, High, Medium, or Low).

The most valuable bottleneck insights often come from combining quantitative and qualitative data. A step with average metrics might still be a bottleneck if interview data reveals frustration, errors, or workarounds not captured in the event log.

## 6.12 Process Optimization Suggestions

Once bottlenecks are identified, LLMs can propose improvements based on established process improvement methodologies: Lean (eliminate waste), Six Sigma (reduce variation), and automation-first strategies.

### Optimization Recommendation Engine

The optimization prompt gives the LLM the full process description alongside the identified bottlenecks and asks it to propose specific, actionable improvements. Each recommendation includes a target activity, an optimization category, a detailed description, a quantified expected impact, the implementation effort level, associated risks, prerequisites, and a qualitative ROI assessment. Recommendations are prioritized by their impact-to-effort ratio, putting "quick wins" at the top.

### Optimization Categories Explained

| Category | Description | When to Apply | Example |
| --- | --- | --- | --- |
| Eliminate | Remove the step entirely | Step adds no value (pure waste) | Remove redundant approval for orders under $100 |
| Automate | Replace manual work with software | Step is rule-based and repetitive | Auto-generate invoices from order data |
| Simplify | Reduce complexity of the step | Step has unnecessary sub-steps or forms | Replace 12-field form with 4-field smart form |
| Parallelise | Run steps concurrently | Steps are independent | Run credit check and inventory check simultaneously |
| Outsource | Delegate to a specialist team or service | Step requires expertise not core to the business | Use a third-party identity verification service |
| Standardise | Create a consistent procedure | Step is done differently by different people | Create a standard checklist for quality review |

Present optimizations on a 2x2 impact-effort matrix. High-impact, low-effort items are "quick wins" that build momentum. Schedule them first to demonstrate value before tackling larger changes.

## 6.13 As-Is to To-Be Mapping

As-Is/To-Be mapping visualizes the current state of a process alongside the proposed future state. LLMs generate the To-Be model by applying the optimization recommendations to the As-Is process.

### Generating the To-Be Process

The To-Be generation prompt takes two inputs: the current (As-Is) process in structured JSON and the list of approved optimizations. The model produces three outputs: the redesigned To-Be process, a list of changes applied (each linked to the optimization that drove it, with change types of Added, Modified, Removed, or Reordered), and a metrics comparison showing estimated before-and-after values for total steps, cycle time, manual step count, and decision points.

![Diagram 2](/diagrams/llm-ba-qa/process-modeling-2.svg)

Figure 6-4. As-Is to To-Be Mapping — the current process (left) with a bottleneck at the approval step is transformed into an optimized process (right) with automation and step consolidation.

### Comparison Report

The comparison report presents transformation results in a stakeholder-friendly format: a metrics summary table showing before-and-after values, followed by a changes list detailing each modification — which As-Is step was affected, what it became in the To-Be model, the change type, and the optimization recommendation that drove it.

When presenting As-Is/To-Be to executives, use a side-by-side visual with the As-Is on the left and To-Be on the right. Highlight removed steps in red, new steps in green, and modified steps in amber. The metrics comparison table at the bottom provides the business case.

## 6.14 Change Impact Analysis

Before implementing process changes, you must understand the ripple effects. A change impact analysis identifies which systems, roles, policies, and training materials are affected by a process modification.

### Impact Analysis Framework

The impact analysis prompt assesses proposed changes across five dimensions: **people** (roles affected, training needs, headcount implications), **process** (upstream and downstream processes impacted), **technology** (systems, integrations, and data flows), **policy** (regulations, SOPs, and governance documents needing updates), and **risk** (new risks introduced by the change). For each impacted item, the model provides the dimension, what is affected, the impact level (High, Medium, or Low), a description of how it is affected, and the action required to address it. The overall output includes a readiness score from 0 to 100 and a go/no-go recommendation.

### Impact Heatmap

Visualize the results as a heatmap table with the five dimensions as rows and High, Medium, and Low impact counts as columns. This lets decision-makers quickly identify which dimensions have the most critical impacts and where additional preparation is needed.

Change impact analysis is where LLMs are most likely to miss organization-specific factors: union agreements, legacy system constraints, and cultural resistance patterns. Always supplement LLM output with input from change management practitioners who know the organization.

## Project B: Process Discovery Engine

Build an end-to-end tool that takes operational documents as input and produces a complete process analysis package: discovered processes, BPMN diagrams, bottleneck analysis, optimization recommendations, and a To-Be process model with change impact assessment.

### Pipeline Architecture

Source documents (SOPs, manuals, transcripts) feed into the Process Discovery module, which extracts structured process descriptions. These pass through validation, BPMN or Mermaid diagram generation, bottleneck identification, optimization recommendation, As-Is/To-Be mapping, and finally change impact analysis. The main script iterates through all text files in an input directory, discovers processes from each, validates the combined set, generates diagrams, and runs the full analysis chain for each process with bottlenecks.

### Extension Ideas

- Add process mining integration by reading event logs from CSV and correlating them with discovered processes.
- Generate an executive presentation deck (Markdown or HTML slides) summarizing the top three bottlenecks and recommended optimizations.
- Build a web interface using Streamlit that allows stakeholders to upload documents and interact with the results.

---

## Exercises

### Conceptual

1. Explain why the "so that" clause in a user story is critical for prioritization. How would a backlog without benefit statements affect sprint planning?
2. Compare the strengths and weaknesses of Gherkin-style versus checklist-style acceptance criteria. When would you use each?
3. Explain why an LLM might discover a process step that does not appear in any single document but is implied by the combination of multiple documents. Give an example.
4. Compare the strengths of process mining (from event logs) versus LLM-based process discovery (from documents). When would you use each, and when would you combine them?

### Coding

1. Extend the `generate_stories` function to detect and reject stories that violate the "Independent" criterion by checking for shared data dependencies.
2. Write a function that takes two story maps (current and previous sprint) and highlights new stories, removed stories, and stories that moved between releases.
3. Write a function that detects circular dependencies in a set of processes (Process A feeds into Process B, which feeds into Process A).
4. Extend the `validate_bpmn` function to check that every task has at least one incoming and one outgoing sequence flow (no orphaned tasks).

### Design

1. Design a Slack bot that integrates with the Agile Story Generator. Sketch the conversation flow for a user who wants to generate stories from a pasted requirement.
2. Propose a feedback loop where developers mark stories as "unclear during implementation" and this feedback is used to improve the story generation prompt over time.
3. Design a "Process Health Dashboard" that monitors live processes and uses LLM analysis to flag emerging bottlenecks before they become critical. Sketch the architecture and data flows.
