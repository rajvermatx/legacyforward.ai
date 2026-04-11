---
title: "Supervisor-Worker Pattern"
slug: "supervisor-worker"
description: "The demo looked flawless. A single agent that researched competitors, drafted a market analysis, pulled financial data, and produced a polished report — all in one long chain-of-thought. Then the team deployed it on real queries. The agent would start researching, get distracted by a tangent in the "
section: "agenticai"
order: 10
part: "Part 03 Multi Agent"
---

Part 3 — Multi-Agent Systems

# Supervisor-Worker Pattern

The demo looked flawless. A single agent that researched competitors, drafted a market analysis, pulled financial data, and produced a polished report — all in one long chain-of-thought. Then the team deployed it on real queries. The agent would start researching, get distracted by a tangent in the financial data, forget it was supposed to draft a report, and eventually time out after burning forty dollars in API calls. The problem was not intelligence. The problem was asking one agent to hold an entire workflow in its head at once. The supervisor-worker pattern exists because the same principle that makes human organizations effective applies to agents: a coordinator who plans and delegates will outperform a single genius who tries to do everything alone.

Reading time: ~25 min Project: Task Delegation System Variants: Tech / Software, Healthcare, Finance, Education, E-commerce, Legal

### What You Will Learn

-   How the supervisor-worker pattern separates planning from execution to manage complex multi-step workflows
-   How to design a supervisor agent that decomposes tasks, delegates to specialists, and aggregates results
-   How to build worker agents with focused tool sets and clear responsibility boundaries
-   Strategies for parallel execution that reduce latency without sacrificing correctness
-   How to implement robust error handling and retry logic across a multi-agent system
-   When to choose supervisor-worker over flat orchestration or peer-to-peer agent topologies

## 10.1 The Case for Hierarchy

Single-agent architectures hit a ceiling. As the number of tools grows beyond a dozen, the model struggles to select the right one. As the workflow lengthens beyond five or six steps, earlier context gets compressed or forgotten. As the task requires different reasoning styles — analytical for data extraction, creative for writing, precise for code generation — a single system prompt cannot optimize for all of them.

The supervisor-worker pattern addresses this by splitting the work into two distinct roles. The **supervisor** is responsible for understanding the overall goal, breaking it into subtasks, deciding which worker handles each subtask, and assembling the final result. **Workers** are specialists: each has a narrow system prompt, a focused set of tools, and no knowledge of the broader workflow. A research worker does not know that its output will be used in a report. A code-generation worker does not know that its output will be reviewed by a quality worker. This isolation is a feature, not a limitation — it keeps each agent’s context window focused on a single, well-defined task.

The analogy to human organizations is deliberate. A project manager does not write the code, design the UI, or draft the legal review. They decompose the project into work items, assign each to the right specialist, track progress, handle blockers, and synthesize deliverables. The supervisor agent does precisely the same thing, except its “team” is a set of LLM-powered workers with distinct capabilities.

> Supervisor vs. Orchestrator
> 
> Chapter 9 covered orchestration: the general problem of coordinating agent actions. The supervisor-worker pattern is a specific orchestration topology where one agent has explicit authority over others. In a flat orchestration, agents negotiate or follow a fixed pipeline. In supervisor-worker, the supervisor makes all routing and sequencing decisions. This centralized control makes the system easier to debug and reason about, at the cost of creating a single point of failure.

## 10.2 Architecture Overview

A supervisor-worker system has three layers. The supervisor layer receives the user’s request, plans the workflow, and returns the final answer. The worker layer contains specialized agents, each with its own system prompt and tool set. The tool layer provides the actual capabilities — API calls, database queries, file operations, web searches — that workers use to accomplish their tasks.

![Diagram 1](/diagrams/agenticai/supervisor-worker-1.svg)

Figure 10.1 — Supervisor-worker topology. The supervisor plans and delegates; workers execute with focused tool sets; results flow back for aggregation.

The key insight is that each layer operates at a different level of abstraction. The supervisor thinks in terms of tasks: “research competitor pricing,” “analyze trends in the data,” “draft the executive summary.” Workers think in terms of tool calls: “search the web for X,” “query the database for Y,” “format the output as a table.” This separation of concerns means the supervisor’s prompt stays clean and strategic, while each worker’s prompt stays tactical and focused.

## 10.3 Designing the Supervisor

The supervisor is the brain of the system. It receives the user’s request, decomposes it into a plan, dispatches tasks to workers, monitors results, and decides when the overall job is done. A well-designed supervisor has three core capabilities: **task decomposition**, **delegation**, and **result aggregation**.

```
from dataclasses import dataclass, field
from enum import Enum
from typing import Any
import json
import openai

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class Task:
    """A unit of work to be delegated to a worker."""
    id: str
    description: str
    worker_type: str
    dependencies: list[str] = field(default_factory=list)
    status: TaskStatus = TaskStatus.PENDING
    result: Any = None
    error: str = ""
    retries: int = 0

@dataclass
class Plan:
    """An execution plan produced by the supervisor."""
    goal: str
    tasks: list[Task] = field(default_factory=list)
    final_instruction: str = ""

class Supervisor:
    """Supervisor agent that plans, delegates, and aggregates."""

    def __init__(self, workers: dict, model: str = "gpt-4o"):
        self.workers = workers  # name -> Worker instance
        self.model = model
        self.client = openai.OpenAI()
        self.max_retries = 2

    def run(self, user_request: str) -> str:
        """Execute a full supervisor-worker workflow."""
        # Step 1: Decompose the request into a plan
        plan = self._decompose(user_request)
        print(f"Plan: {len(plan.tasks)} tasks for goal: {plan.goal}")

        # Step 2: Execute tasks respecting dependencies
        self._execute_plan(plan)

        # Step 3: Aggregate results into a final answer
        return self._aggregate(plan)

    def _decompose(self, request: str) -> Plan:
        """Use the LLM to break a request into delegatable tasks."""
        worker_descriptions = "\n".join(
            f"- {name}: {w.description}"
            for name, w in self.workers.items()
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{
                "role": "system",
                "content": (
                    "You are a project planning agent. Given a user request "
                    "and available workers, decompose the request into tasks.\n\n"
                    f"Available workers:\n{worker_descriptions}\n\n"
                    "Return JSON with this structure:\n"
                    '{"goal": "...", "tasks": [{"id": "t1", '
                    '"description": "...", "worker_type": "worker_name", '
                    '"dependencies": []}], '
                    '"final_instruction": "How to combine results"}'
                )
            }, {
                "role": "user",
                "content": request,
            }],
            response_format={"type": "json_object"},
            temperature=0.2,
        )

        data = json.loads(response.choices[0].message.content)
        tasks = [
            Task(
                id=t["id"],
                description=t["description"],
                worker_type=t["worker_type"],
                dependencies=t.get("dependencies", []),
            )
            for t in data["tasks"]
        ]
        return Plan(
            goal=data["goal"],
            tasks=tasks,
            final_instruction=data.get("final_instruction", ""),
        )
```

The decomposition step is where the supervisor earns its keep. A good decomposition produces tasks that are **independent where possible** (enabling parallelism), **correctly sequenced where necessary** (using dependency declarations), and **scoped to a single worker’s capabilities** (preventing confusion).

> Decomposition Failures
> 
> The most common supervisor bug is producing tasks that are too vague for workers to execute. “Analyze the data” is not a task; “Calculate the year-over-year revenue growth rate from the quarterly earnings data” is. If your workers consistently return poor results, the problem is usually in the supervisor’s decomposition, not in the workers themselves. Add examples of good task descriptions to the supervisor’s system prompt.

## 10.4 Building Worker Agents

Each worker agent is a focused specialist. It receives a task description from the supervisor, uses its tools to accomplish the task, and returns a structured result. Workers should not know about each other, should not try to do work outside their specialty, and should fail explicitly when they cannot complete a task.

```
class Worker:
    """A specialized worker agent with focused tools."""

    def __init__(self, name: str, description: str,
                 system_prompt: str, tools: list[dict],
                 tool_handlers: dict, model: str = "gpt-4o"):
        self.name = name
        self.description = description
        self.system_prompt = system_prompt
        self.tools = tools              # OpenAI function schemas
        self.tool_handlers = tool_handlers  # name -> callable
        self.model = model
        self.client = openai.OpenAI()

    def execute(self, task_description: str,
                context: dict = None) -> dict:
        """Execute a task and return structured results."""
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": self._build_prompt(
                task_description, context
            )},
        ]

        # Agentic loop: let the worker call tools until done
        for _ in range(10):  # safety limit on iterations
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=self.tools if self.tools else None,
            )

            choice = response.choices[0]

            # If no tool calls, the worker is done
            if not choice.message.tool_calls:
                return {
                    "status": "completed",
                    "result": choice.message.content,
                    "worker": self.name,
                }

            # Process each tool call
            messages.append(choice.message)
            for tool_call in choice.message.tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)

                handler = self.tool_handlers.get(fn_name)
                if not handler:
                    tool_result = f"Error: unknown tool {fn_name}"
                else:
                    try:
                        tool_result = handler(**fn_args)
                    except Exception as e:
                        tool_result = f"Error: {type(e).__name__}: {e}"

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": str(tool_result),
                })

        return {
            "status": "failed",
            "result": "Worker exceeded maximum iterations",
            "worker": self.name,
        }

    def _build_prompt(self, task: str, context: dict) -> str:
        """Build the task prompt, optionally with context from
        upstream tasks."""
        parts = [f"Task: {task}"]
        if context:
            parts.append("\nContext from previous tasks:")
            for key, value in context.items():
                parts.append(f"\n[{key}]:\n{value}")
        return "\n".join(parts)
```

The worker design has several deliberate constraints. The tool loop is capped at ten iterations to prevent runaway execution. Each tool call is wrapped in a try/except so that a single tool failure does not crash the worker — the error message is passed back to the LLM, which can decide to retry or work around the failure. And the worker returns a structured dictionary, not free-form text, so the supervisor can programmatically check status and extract results.

### Specialization Through System Prompts

The power of worker agents comes from their focused system prompts. Here is how three workers might be configured for a market analysis workflow:

```
research_worker = Worker(
    name="researcher",
    description="Searches the web and extracts structured data",
    system_prompt=(
        "You are a research specialist. Given a research task, "
        "use your search and scraping tools to find relevant "
        "information. Return your findings as structured bullet "
        "points with source URLs. If you cannot find reliable "
        "information, say so explicitly. Do not speculate."
    ),
    tools=[search_tool_schema, scrape_tool_schema],
    tool_handlers={
        "web_search": search_function,
        "scrape_page": scrape_function,
    },
)

analysis_worker = Worker(
    name="analyst",
    description="Analyzes data and produces quantitative insights",
    system_prompt=(
        "You are a data analyst. Given data and an analysis task, "
        "perform calculations, identify trends, and produce "
        "quantitative insights. Show your work. Use the calculator "
        "for all arithmetic. Flag any data quality issues you "
        "encounter. Do not fabricate numbers."
    ),
    tools=[calculator_schema, db_query_schema],
    tool_handlers={
        "calculate": calculator_function,
        "query_database": db_query_function,
    },
)

writing_worker = Worker(
    name="writer",
    description="Drafts polished prose from structured inputs",
    system_prompt=(
        "You are a professional writer. Given research findings "
        "and analysis, draft clear, concise prose. Follow any "
        "formatting instructions precisely. Do not add information "
        "beyond what is provided in your input context. Cite "
        "sources inline where applicable."
    ),
    tools=[formatter_schema],
    tool_handlers={"format_document": formatter_function},
)
```

> Tool Isolation Principle
> 
> Give each worker only the tools it needs. A research worker does not need the database query tool. An analysis worker does not need the web search tool. Tool isolation reduces the chance of a worker going off-task and makes it easier to audit what each worker did. If you find a worker needs tools from another worker’s domain, that is a signal to split the task differently at the supervisor level.

## 10.5 Task Decomposition

Task decomposition is the critical planning step where the supervisor converts a vague user request into a directed acyclic graph of concrete, assignable tasks. The quality of decomposition determines the quality of the entire system’s output.

There are three common decomposition strategies:

**Sequential decomposition.** Tasks form a chain: each depends on the output of the previous one. This is the simplest pattern and appropriate when later tasks genuinely need the results of earlier ones. The downside is that total latency equals the sum of all task durations.

**Parallel decomposition.** Independent tasks are identified and marked as having no dependencies. They can execute simultaneously, reducing total latency to the duration of the longest single task. The supervisor must identify which tasks are truly independent — falsely declaring a dependency as independent leads to missing context, while falsely declaring independence as dependent wastes time.

**Hybrid decomposition.** A mix of parallel and sequential phases. This is the most common pattern in real workflows: gather data in parallel, then analyze the combined data sequentially, then produce outputs in parallel from the shared analysis.

```
def _execute_plan(self, plan: Plan) -> None:
    """Execute tasks respecting dependency ordering."""
    completed = {}  # task_id -> result

    while True:
        # Find tasks ready to execute (all deps completed)
        ready = [
            t for t in plan.tasks
            if t.status == TaskStatus.PENDING
            and all(d in completed for d in t.dependencies)
        ]

        if not ready:
            # Check if we are done or stuck
            pending = [
                t for t in plan.tasks
                if t.status == TaskStatus.PENDING
            ]
            if not pending:
                break
            # Stuck: remaining tasks have unmet dependencies
            failed_deps = [
                t for t in plan.tasks
                if t.status == TaskStatus.FAILED
            ]
            if failed_deps:
                raise RuntimeError(
                    f"Plan stuck: {len(pending)} tasks pending, "
                    f"{len(failed_deps)} tasks failed"
                )
            break

        # Execute ready tasks in parallel
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = {}
            for task in ready:
                task.status = TaskStatus.RUNNING
                # Gather context from completed dependencies
                context = {
                    dep_id: completed[dep_id]
                    for dep_id in task.dependencies
                }
                worker = self.workers.get(task.worker_type)
                if not worker:
                    task.status = TaskStatus.FAILED
                    task.error = f"No worker: {task.worker_type}"
                    continue
                futures[executor.submit(
                    worker.execute, task.description, context
                )] = task

            for future in concurrent.futures.as_completed(futures):
                task = futures[future]
                try:
                    result = future.result(timeout=120)
                    if result["status"] == "completed":
                        task.status = TaskStatus.COMPLETED
                        task.result = result["result"]
                        completed[task.id] = result["result"]
                    else:
                        task.status = TaskStatus.FAILED
                        task.error = result.get("result", "Unknown")
                except Exception as e:
                    task.status = TaskStatus.FAILED
                    task.error = str(e)
```

The execution engine is a simple loop: find tasks whose dependencies are satisfied, execute them in parallel, collect results, repeat until all tasks are done or the plan is stuck. The use of `ThreadPoolExecutor` for parallel execution is appropriate here because the bottleneck is I/O (API calls), not CPU computation.

## 10.6 Parallel Execution

Parallel execution is where the supervisor-worker pattern delivers its biggest latency improvement. Instead of running five tasks sequentially — each taking 10–30 seconds of API call time — you run independent tasks simultaneously.

But parallelism introduces three challenges that sequential execution does not have:

**Resource contention.** If all workers share the same API key, parallel requests can hit rate limits. Use a semaphore or token bucket to throttle concurrent requests:

```
import asyncio

class RateLimitedExecutor:
    """Execute worker tasks with concurrency and rate limiting."""

    def __init__(self, max_concurrent: int = 5,
                 requests_per_minute: int = 60):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.rate_limiter = asyncio.Semaphore(requests_per_minute)
        self._refill_task = None

    async def execute_tasks(self, tasks: list[tuple]) -> list:
        """Execute (worker, task_desc, context) tuples in parallel."""
        self._refill_task = asyncio.create_task(self._refill_tokens())
        try:
            results = await asyncio.gather(*[
                self._run_one(worker, desc, ctx)
                for worker, desc, ctx in tasks
            ], return_exceptions=True)
            return results
        finally:
            self._refill_task.cancel()

    async def _run_one(self, worker, description, context):
        async with self.semaphore:
            await self.rate_limiter.acquire()
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                None, worker.execute, description, context
            )

    async def _refill_tokens(self):
        """Refill rate limiter tokens every second."""
        while True:
            await asyncio.sleep(1.0)
            # Release one token per second (60 per minute)
            try:
                self.rate_limiter.release()
            except ValueError:
                pass  # already at max
```

**Result ordering.** Tasks complete in arbitrary order. The supervisor must match results back to the correct task IDs, not assume the order of completion matches the order of submission.

**Partial failure.** In sequential execution, a failure stops the chain. In parallel execution, some tasks may succeed while others fail. The supervisor must decide: is the overall goal still achievable with partial results? Can the failed tasks be retried? Should the entire plan be re-evaluated?

## 10.7 Result Aggregation

Once all workers have completed their tasks, the supervisor must combine their outputs into a coherent final response. This aggregation step is often where the quality is won or lost.

```
def _aggregate(self, plan: Plan) -> str:
    """Combine worker results into a final response."""
    # Collect all completed results
    results_summary = []
    for task in plan.tasks:
        if task.status == TaskStatus.COMPLETED:
            results_summary.append(
                f"[Task: {task.description}]\n"
                f"Worker: {task.worker_type}\n"
                f"Result:\n{task.result}\n"
            )
        elif task.status == TaskStatus.FAILED:
            results_summary.append(
                f"[Task: {task.description}]\n"
                f"Worker: {task.worker_type}\n"
                f"FAILED: {task.error}\n"
            )

    results_block = "\n---\n".join(results_summary)

    response = self.client.chat.completions.create(
        model=self.model,
        messages=[{
            "role": "system",
            "content": (
                "You are a supervisor agent assembling a final "
                "response from your workers' outputs. Synthesize "
                "the results into a coherent, well-structured "
                "answer. If any tasks failed, acknowledge what "
                "is missing and provide the best answer possible "
                "with the available results. Do not invent "
                "information beyond what the workers provided."
            )
        }, {
            "role": "user",
            "content": (
                f"Original goal: {plan.goal}\n\n"
                f"Aggregation instruction: "
                f"{plan.final_instruction}\n\n"
                f"Worker results:\n{results_block}"
            ),
        }],
        temperature=0.3,
    )

    return response.choices[0].message.content
```

The aggregation prompt is critical. It must tell the supervisor to synthesize, not merely concatenate. Simply pasting worker outputs together produces a disjointed document. The supervisor should identify themes across worker outputs, resolve minor inconsistencies, apply the formatting requested by the user, and flag any gaps caused by failed tasks.

> Aggregation Strategies
> 
> Three common patterns: **Merge** combines complementary outputs (research from worker A plus analysis from worker B into a single report). **Select** picks the best output when multiple workers attempt the same task (useful for quality competition). **Reduce** iteratively summarizes outputs when the combined volume exceeds context window limits. Choose the strategy in the planning step and encode it in the `final_instruction` field of the plan.

## 10.8 Error Handling in Multi-Agent Systems

Error handling in a multi-agent system is fundamentally different from error handling in a single agent. A single agent either succeeds or fails. A multi-agent system can partially succeed, and the supervisor must decide what to do with partial results.

There are four categories of errors in supervisor-worker systems:

**Worker execution errors.** A worker’s tool call fails (API timeout, rate limit, malformed response). The worker should catch these internally and either retry or return a structured error. The supervisor sees a failed task and decides whether to retry with the same worker, reassign to a different worker, or proceed without that result.

**Decomposition errors.** The supervisor creates tasks that are impossible, circular, or assigned to nonexistent workers. Validate the plan before execution: check for missing worker types, detect dependency cycles, and verify that task descriptions are concrete enough.

**Aggregation errors.** Worker results are contradictory or insufficient for the supervisor to produce a coherent answer. The supervisor should explicitly flag contradictions rather than silently resolving them, and should indicate confidence levels when results are incomplete.

**Timeout errors.** The entire workflow takes too long. Implement a global timeout that triggers graceful degradation: return the best available partial result rather than nothing.

```
def _execute_with_retry(self, plan: Plan) -> None:
    """Execute plan with retry logic for failed tasks."""
    self._execute_plan(plan)

    # Retry failed tasks up to max_retries
    for attempt in range(self.max_retries):
        failed = [
            t for t in plan.tasks
            if t.status == TaskStatus.FAILED
        ]
        if not failed:
            break

        print(f"Retry attempt {attempt + 1}: "
              f"{len(failed)} failed tasks")

        for task in failed:
            task.retries += 1
            task.status = TaskStatus.PENDING
            task.error = ""

            # Optionally refine the task description
            if task.retries > 1:
                task.description = self._refine_task(
                    task.description, task.error
                )

        self._execute_plan(plan)

def _refine_task(self, description: str, error: str) -> str:
    """Ask the LLM to refine a task that previously failed."""
    response = self.client.chat.completions.create(
        model=self.model,
        messages=[{
            "role": "system",
            "content": (
                "A task failed with the error below. Rewrite the "
                "task description to avoid the same failure. Be "
                "more specific and suggest a different approach."
            )
        }, {
            "role": "user",
            "content": (
                f"Original task: {description}\n"
                f"Error: {error}"
            ),
        }],
        temperature=0.4,
    )
    return response.choices[0].message.content
```

The retry logic has a subtle but important detail: after the first failed attempt, the supervisor *refines* the task description. This is not a dumb retry — it uses the LLM to understand why the task failed and produce a better formulation. If a research task failed because the search query was too broad, the refined task might include more specific keywords.

> Circuit Breakers
> 
> Without a retry limit, a flawed task can loop indefinitely: fail, retry, fail, retry. Always cap retries and implement a circuit breaker. If a worker fails three times on the same task, mark it as permanently failed and let the supervisor aggregate without that result. A partial answer delivered in thirty seconds beats a complete answer that never arrives.

## 10.9 Task Delegation Flow

The full delegation lifecycle follows a clear sequence: the user submits a request, the supervisor decomposes it, tasks are dispatched in dependency order, workers execute in parallel where possible, results flow back to the supervisor, and the supervisor produces the final output.

![Diagram 2](/diagrams/agenticai/supervisor-worker-2.svg)

Figure 10.2 — Task delegation and result aggregation flow. The supervisor splits work into parallel tasks, collects results, checks for errors, and merges outputs into a single response.

The decision diamond is the error-handling checkpoint. If all workers succeeded, the supervisor proceeds to aggregation. If any failed, the supervisor decides whether to retry (loop back to task split with a refined task) or skip (proceed to aggregation with partial results and flag the gaps). This retry loop is bounded by the circuit breaker from section 10.8.

## 10.10 Putting It All Together

Here is a complete, runnable example that creates a supervisor with three workers and executes a multi-step research and analysis workflow:

```
import json

# Define tool schemas for workers
search_tool_schema = {
    "type": "function",
    "function": {
        "name": "web_search",
        "description": "Search the web for information",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query",
                }
            },
            "required": ["query"],
        },
    },
}

calculator_schema = {
    "type": "function",
    "function": {
        "name": "calculate",
        "description": "Evaluate a mathematical expression",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "Math expression to evaluate",
                }
            },
            "required": ["expression"],
        },
    },
}

# Stub tool implementations (replace with real ones)
def search_function(query: str) -> str:
    """Stub: replace with actual search API call."""
    return f"Search results for: {query}\n- Result 1\n- Result 2"

def calculator_function(expression: str) -> str:
    """Safe math evaluation."""
    allowed = set("0123456789+-*/.() ")
    if not all(c in allowed for c in expression):
        return "Error: invalid characters in expression"
    try:
        return str(eval(expression))  # safe for numeric-only
    except Exception as e:
        return f"Error: {e}"

# Assemble the system
workers = {
    "researcher": Worker(
        name="researcher",
        description="Searches the web for information",
        system_prompt=(
            "You are a research agent. Use web_search to find "
            "information. Return structured findings."
        ),
        tools=[search_tool_schema],
        tool_handlers={"web_search": search_function},
    ),
    "analyst": Worker(
        name="analyst",
        description="Analyzes data and performs calculations",
        system_prompt=(
            "You are a data analyst. Use the calculator for math. "
            "Return quantitative insights."
        ),
        tools=[calculator_schema],
        tool_handlers={"calculate": calculator_function},
    ),
    "writer": Worker(
        name="writer",
        description="Produces polished written content",
        system_prompt=(
            "You are a writer. Synthesize the provided context "
            "into clear, professional prose."
        ),
        tools=[],
        tool_handlers={},
    ),
}

supervisor = Supervisor(workers=workers)

# Run a workflow
result = supervisor.run(
    "Compare the market capitalization of the top 3 cloud "
    "providers. Include year-over-year growth rates and a "
    "brief analysis of competitive positioning."
)
print(result)
```

This example is deliberately minimal to show the pattern clearly. A production system would add logging at every step, persist task state to a database for recovery, implement streaming so the user sees progress, and include evaluation harnesses to measure the quality of decomposition, worker outputs, and final aggregation.

## 10.11 When to Use Supervisor-Worker

The supervisor-worker pattern is not always the right choice. It adds complexity: more agents means more API calls, more latency for the planning step, and more surface area for failures. Use it when the benefits outweigh these costs.

| Use Supervisor-Worker When | Use a Single Agent When |
| --- | --- |
| The task requires 3+ distinct skill sets (research, analysis, writing) | One skill set handles the entire task |
| Subtasks can run in parallel for latency savings | Tasks are inherently sequential with no parallelism opportunity |
| The tool count exceeds 10–15, causing selection confusion | Fewer than 8 tools, all in the same domain |
| Different subtasks need different model configurations (temperature, model size) | A single model configuration works for everything |
| You need auditability: which agent did what and why | The workflow is simple enough that a trace log suffices |

> Start Simple, Scale Up
> 
> Do not begin with a supervisor-worker architecture. Start with a single agent. When you hit the ceiling — tool confusion, context window overflow, inconsistent quality across different parts of the output — extract the problematic functionality into a worker. The supervisor-worker pattern should emerge from observed limitations, not from an architect’s whiteboard.

## Project: Task Delegation System

Build a supervisor-worker system where a supervisor agent decomposes user requests into subtasks, delegates them to at least three specialized worker agents, executes tasks in parallel where dependencies allow, and aggregates results into a final response. The system must include error handling with retry logic and produce a trace log showing the full execution path.

### Requirements

1.  **Supervisor agent.** Implement a supervisor that accepts natural language requests, decomposes them into a task graph with explicit dependencies, and produces a plan before execution begins. The plan should be inspectable as JSON.
2.  **Worker agents (3+).** Create at least three specialized workers with distinct system prompts and tool sets. Each worker should handle one domain: research, analysis, content generation, quality review, or similar. Workers must not share tools.
3.  **Parallel execution.** Tasks without dependencies must execute concurrently. Measure and report the latency improvement over sequential execution for your test cases.
4.  **Error handling.** Implement retry with task refinement (the supervisor rewrites failed task descriptions). Include a circuit breaker that caps retries at 3 and falls back to partial results.
5.  **Result aggregation.** The supervisor must synthesize worker outputs into a coherent final response, not merely concatenate them. Handle cases where one or more workers failed.
6.  **Execution trace.** Log every step: plan creation, task dispatch, tool calls within each worker, results, retries, and final aggregation. Export the trace as JSON for debugging.

### Domain Variants

Competitive Intelligence Report Tech / Software — Research competitors, analyze features, draft comparison report

Patient Case Summarizer Healthcare — Gather records, analyze trends, produce clinical summary

Portfolio Rebalancing Advisor Finance — Pull market data, run allocation analysis, draft recommendations

Curriculum Builder Education — Research topics, structure learning objectives, generate materials

Product Launch Planner E-commerce — Market research, pricing analysis, launch copy generation

Contract Review Pipeline Legal — Extract clauses, check compliance, produce risk assessment report

## Summary

The supervisor-worker pattern brings organizational structure to multi-agent systems. A supervisor agent takes responsibility for understanding the user’s goal, decomposing it into concrete subtasks, delegating each to a specialized worker with focused tools, and synthesizing the results into a coherent output. This separation of planning from execution solves the problems that sink single-agent architectures: tool overload, context window exhaustion, and the impossibility of optimizing one system prompt for multiple reasoning styles. The pattern introduces its own costs — planning latency, inter-agent communication overhead, and a single point of failure at the supervisor — but for workflows that require diverse skills and benefit from parallel execution, the trade-off is overwhelmingly positive.

-   The supervisor-worker pattern separates planning from execution. The supervisor decomposes tasks, delegates to specialists, and aggregates results. Workers execute with focused tool sets and no knowledge of the broader workflow. This mirrors how effective human teams operate.
-   Task decomposition quality determines system quality. Vague tasks produce vague results. The supervisor must produce tasks that are concrete, scoped to a single worker, and correctly ordered by dependencies. Add few-shot examples of good decompositions to the supervisor prompt.
-   Parallel execution of independent tasks is where the pattern delivers its biggest latency win. Use dependency analysis to identify independent tasks, a thread or async executor for concurrency, and rate limiters to avoid hitting API ceilings.
-   Error handling must be first-class. Implement retry with task refinement (not dumb retry), circuit breakers to prevent infinite loops, and graceful degradation that returns partial results rather than nothing when a worker fails permanently.
-   Start with a single agent and extract workers only when you observe specific pain points: tool confusion, context overflow, or quality inconsistency. The supervisor-worker pattern should emerge from real limitations, not speculative architecture.

### Exercises

Conceptual

**Failure cascades.** Your supervisor decomposes a request into five tasks: T1 and T2 run in parallel with no dependencies; T3 depends on T1; T4 depends on T2; T5 depends on both T3 and T4. If T1 fails permanently after retries, what happens to T3 and T5? What is the best outcome the supervisor can deliver? Design an aggregation strategy that maximizes the value of partial results in this scenario.

Coding

**Dynamic worker scaling.** Extend the supervisor to dynamically spawn workers based on the plan. Instead of a fixed worker registry, the supervisor should analyze each task, determine the required tools and system prompt, and instantiate a worker on the fly. Implement a worker factory that takes a task description and returns a configured Worker instance. Benchmark the overhead of dynamic instantiation vs. a static registry on a plan with 10 tasks.

Design

**Nested supervisors.** Some workflows are too complex for a single level of supervision. Design a two-level supervisor hierarchy where a top-level supervisor delegates to mid-level supervisors, each managing their own workers. Define the interface between supervisor levels, how errors propagate upward, and how the top-level supervisor aggregates results from multiple sub-supervisors. Sketch the message flow for a request that requires research, data analysis, and report generation, where each of these is its own supervised sub-workflow.