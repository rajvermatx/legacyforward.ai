---
title: "The Supervisor-Worker Pattern"
slug: "supervisor-worker"
description: "The supervisor-worker pattern is the most common and most battle-tested multi-agent architecture. A supervisor agent decomposes goals and routes to specialized workers; workers execute within their domain and report back. Understanding this pattern deeply is the prerequisite for building reliable multi-agent systems."
section: "ai-beyond-the-demo"
order: 50
part: "Part V — Agentic Systems"
---

Part V — Agentic Systems

# The Supervisor-Worker Pattern

The supervisor-worker pattern is to multi-agent systems what the client-server pattern is to networked computing — the foundational architecture that most complex systems build on. Its clarity (a supervisor decomposes goals; workers execute) and its correspondence with how complex work is actually organized in human institutions make it intuitive to design, reason about, and debug. Building and operating the supervisor-worker pattern well is the core competency of agentic system architecture.

### What You Will Learn

- The supervisor's responsibilities and how to design them
- Worker agent design for reliability and predictability
- The routing and synthesis logic that connects supervisor and workers
- The production patterns that make supervisor-worker systems maintainable at scale

## 50.1 The Supervisor's Responsibilities

The supervisor agent is the orchestrator — it holds the goal, decomposes it into sub-tasks, routes sub-tasks to workers, tracks completion, and synthesizes the final output.

**Goal decomposition.** The supervisor receives a high-level goal ("Produce a due diligence report on Company X") and decomposes it into sub-tasks that workers can execute independently ("Research Company X's financial history", "Research Company X's management team", "Research pending litigation", "Review recent news coverage"). Goal decomposition is the most intellectually demanding part of the supervisor's job and the step where supervisors most often fail by decomposing tasks in ways that leave workers without sufficient context or by decomposing into tasks that are not actually independent.

**Worker selection.** The supervisor selects which worker agent is appropriate for each sub-task. Worker selection requires the supervisor to understand each worker's capabilities and limitations well enough to route correctly. Misrouting — sending a research task to a writing worker, or a technical analysis task to a general-purpose worker — produces low-quality outputs that may not be obviously wrong until synthesis.

**Context provision.** When assigning a sub-task to a worker, the supervisor must provide sufficient context for the worker to complete the task correctly. This includes: the sub-task specification, the overall goal (so the worker understands how the sub-task fits into the larger objective), any constraints on the output format or quality, and any relevant information from prior workers' outputs.

**Completion tracking.** The supervisor tracks which sub-tasks have been completed and which are pending. When a worker fails, the supervisor decides whether to retry, reassign to a different worker, or abandon the sub-task and synthesize partial results.

**Result synthesis.** When workers complete their sub-tasks, the supervisor synthesizes their outputs into the final result. Synthesis requires resolving contradictions between workers' outputs, filling gaps that no worker addressed, and producing a coherent output that serves the original goal.

## 50.2 Worker Agent Design

Workers are specialized agents with defined capabilities and defined scopes. Worker design is more straightforward than supervisor design, but several principles separate reliable workers from fragile ones.

**Narrow scope.** Each worker should specialize in a specific capability domain. A research worker that can do web search, database query, and document analysis is three workers collapsed into one — which means it handles each less reliably than a dedicated worker would. Narrow scope enables the worker to be optimized for its specific capability and makes its behavior predictable.

**Explicit input and output contracts.** Define precisely what the worker expects to receive (input format, required fields, optional fields) and what it produces (output format, required fields). Workers that receive inputs in unexpected formats or that produce outputs in unexpected formats break the supervisor's ability to synthesize.

**Self-contained execution.** A worker should be able to complete its sub-task using only the information provided by the supervisor and its tool access. Workers that need to communicate with other workers during execution create coordination complexity and failure points that are hard to manage.

**Failure reporting.** When a worker cannot complete its sub-task, it should return a structured failure report: what it attempted, why it failed, and what information the supervisor would need to resolve the failure (different inputs, a different worker, human assistance). Workers that fail silently — returning partial results without indicating failure — produce synthesis errors that are difficult to trace.

## 50.3 Routing and Synthesis Logic

The routing logic that connects the supervisor to workers and the synthesis logic that produces the final output are where the supervisor-worker pattern becomes either elegant or complex.

**Static routing.** The supervisor has a fixed mapping from task types to workers. "Research tasks → research worker, writing tasks → writing worker, analysis tasks → analysis worker." Static routing is simple to implement and predictable in behavior but inflexible — tasks that do not fit neatly into predefined categories are routed incorrectly.

**Dynamic routing.** The supervisor uses LLM reasoning to determine which worker is best suited for each sub-task at runtime, based on the sub-task's content and the workers' capabilities. Dynamic routing is more flexible but requires careful worker capability documentation — if the supervisor does not have accurate knowledge of each worker's capabilities, it will make routing errors.

**Parallel vs. sequential routing.** Sub-tasks that are independent can be routed to multiple workers simultaneously, reducing total execution time. Sub-tasks with dependencies (Worker B needs Worker A's output before starting) must be routed sequentially. The supervisor must understand the dependency structure of the decomposed task to route efficiently.

**Synthesis patterns:**

Aggregation: combine worker outputs by concatenation or structured merging. Appropriate when workers' outputs address distinct aspects of the goal with no overlap.

Resolution: identify and resolve contradictions between workers' outputs. Appropriate when workers may have reached different conclusions about the same facts.

Refinement: one worker produces a draft; a second worker reviews and improves it. Appropriate for outputs where quality benefits from multiple passes.

## 50.4 Production Patterns

**Supervisor state persistence.** For long-running tasks, the supervisor's state — which sub-tasks are assigned, which are complete, which workers have been invoked — must be persisted so the task can resume after interruption. An in-memory supervisor that loses state on interruption cannot recover from failures in long tasks.

**Worker result caching.** For tasks where the same sub-task may be requested multiple times across different supervisor invocations, cache worker results. Caching is particularly valuable for expensive research operations where the same information is needed across multiple tasks.

**Supervisor self-review.** Before returning the synthesized result to the user, the supervisor reviews it against the original goal: does the output actually accomplish what was requested? Are there obvious gaps or inconsistencies? Self-review catches synthesis errors before they reach the user.

**Observability.** For production supervisor-worker systems, trace every supervisor decision: what goal was received, how it was decomposed, which workers were selected, what each worker returned, how the synthesis proceeded. Without this trace, debugging supervisor-worker failures is nearly impossible — the failure may be in decomposition, routing, a specific worker, or synthesis, and without the trace, there is no way to determine where.

The supervisor-worker pattern's clarity is its greatest advantage. Teams that implement it with the patterns described here build multi-agent systems that can be understood, debugged, and improved — which is the prerequisite for trusting them with consequential enterprise work.
