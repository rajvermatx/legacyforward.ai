---
title: "Multi-Agent Systems"
slug: "multi-agent"
description: "Orchestrate multiple specialized AI agents that collaborate to solve complex, multi-step problems.
    Each agent has a defined role, tool access, and communication protocol — coordinated by an
    orchestrator that plans, delegates, synthesizes results, and handles failures gracefully."
section: "genai-arch"
order: 9
badges:
  - "Agent Specialization"
  - "Communication Patterns"
  - "Handoff Protocols"
  - "Cost Control"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai-arch/09-multi-agent.ipynb"
---

## 1. Architecture Overview

The **Multi-Agent System** architecture deploys multiple specialized AI agents, each with a focused role, distinct tool access, and dedicated system prompts. An orchestrator agent plans the overall task, delegates sub-tasks to specialist agents, collects their results, and synthesizes a final response. This pattern excels when no single agent can efficiently handle the full breadth of a complex workflow.

### When to Use

-   Tasks require multiple distinct capabilities (research, coding, analysis, review)
-   A single agent's context window cannot hold all necessary information simultaneously
-   Different sub-tasks benefit from different models, prompts, or temperature settings
-   You need separation of concerns for security (e.g., only one agent accesses production databases)
-   Complex workflows need iterative refinement with feedback loops between specialists

### Complexity Level

**High.** Multi-agent systems multiply the complexity of single-agent architectures. Only use this pattern when you have proven that a single agent with tools cannot meet your quality or capability requirements. Start with 2 agents before scaling to more.

>**Tip:** The most common mistake is creating too many agents. Each additional agent adds latency, cost, and failure modes. Start with the minimum viable agent count and add specialists only when you have clear evidence of improvement.

## 2. Architecture Diagram

![Diagram 1](/diagrams/genai-arch/multi-agent-1.svg)

Architecture diagram — Multi-Agent: orchestrator fans out to specialized agents with tools, collects results, and synthesizes a unified response

## 3. Components Deep Dive

🎯

#### Orchestrator Agent

The central coordinator that decomposes tasks, assigns work to specialists, tracks progress, handles failures, and merges results. Uses a planner prompt that understands all available agents and their capabilities.

🔍

#### Researcher Agent

Specializes in information gathering using search tools, document retrieval, and knowledge bases. Returns structured findings with source citations. Optimized for breadth and accuracy over speed.

💻

#### Coder Agent

Writes, debugs, and executes code in a sandboxed environment. Has access to a code executor (REPL, Docker container) and can install packages, run tests, and iterate on errors autonomously.

🔎

#### Reviewer Agent

Reviews outputs from other agents for correctness, quality, and safety. Runs linting, type checking, and test suites. Can request revisions from the coder agent before approving.

💬

#### Message Bus

Structured communication layer between agents. Messages include sender, recipient, action type (request, response, error), payload, and metadata. Enables logging and replay for debugging.

🛡

#### Safety Controls

Max iteration limits prevent infinite loops. Token budgets cap total cost. Human-in-the-loop escalation triggers when confidence is low or stakes are high. Circuit breakers halt on repeated failures.

### Communication Patterns Comparison

| Pattern | How It Works | Pros | Cons | Best For |
| --- | --- | --- | --- | --- |
| Hierarchical | Orchestrator delegates to agents; agents only talk to orchestrator | Clear control flow, easy to debug | Bottleneck at orchestrator, more round trips | Most production systems |
| Peer-to-Peer | Agents communicate directly with each other | Lower latency, parallel work | Hard to track state, potential loops | Tightly coupled tasks (code + review) |
| Blackboard | Shared workspace; agents read/write to common state | Flexible, decoupled agents | Race conditions, complex state management | Collaborative document editing |

### Framework Comparison

| Framework | Architecture | Strengths | Considerations |
| --- | --- | --- | --- |
| LangGraph | State machine / graph-based | Explicit control flow, persistence, human-in-the-loop | Steeper learning curve, LangChain ecosystem |
| CrewAI | Role-based crew | Simple API, role/goal/backstory abstractions | Less control over execution order |
| Autogen | Conversational agents | Natural multi-turn dialogue, code execution built in | Can be chatty, harder to constrain |

## 4. Implementation

### Three-Agent System with Orchestrator

```
import anthropic
import json
from dataclasses import dataclass, field
from typing import Optional

client = anthropic.Anthropic()

# ---------- Agent definitions ----------

@dataclass
class Agent:
    name: str
    role: str
    system_prompt: str
    tools: list = field(default_factory=list)
    model: str = "claude-sonnet-4-20250514"
    temperature: float = 0.3
    max_tokens: int = 2048

# Define specialist agents
researcher = Agent(
    name="researcher",
    role="Information gathering and analysis",
    system_prompt="""You are a research specialist. Your job is to:
1. Search for relevant information on the given topic
2. Summarize findings with source citations
3. Identify key facts, statistics, and expert opinions
Return structured JSON with keys: findings, sources, confidence.""",
    tools=[{
        "name": "web_search",
        "description": "Search the web for information",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"]
        }
    }]
)

coder = Agent(
    name="coder",
    role="Code writing and execution",
    system_prompt="""You are a coding specialist. Your job is to:
1. Write clean, well-documented code for the given task
2. Execute code and verify it works correctly
3. Fix any errors and iterate until tests pass
Return the final working code with explanation.""",
    tools=[{
        "name": "execute_code",
        "description": "Execute Python code in a sandbox",
        "input_schema": {
            "type": "object",
            "properties": {"code": {"type": "string"}},
            "required": ["code"]
        }
    }]
)

reviewer = Agent(
    name="reviewer",
    role="Quality assurance and review",
    system_prompt="""You are a code reviewer. Your job is to:
1. Review code for correctness, security, and best practices
2. Run linting and type checking
3. Identify bugs, edge cases, and improvements
Return JSON: {approved: bool, issues: [...], suggestions: [...]}""",
    tools=[{
        "name": "run_tests",
        "description": "Run pytest, ruff, and mypy on code",
        "input_schema": {
            "type": "object",
            "properties": {"code": {"type": "string"}},
            "required": ["code"]
        }
    }]
)

AGENTS = {"researcher": researcher, "coder": coder, "reviewer": reviewer}
```

### Orchestrator with Function Calling

```
# ---------- Orchestrator ----------

ORCHESTRATOR_SYSTEM = """You are an orchestrator managing a team of specialist agents.

Available agents:
- researcher: Searches and analyzes information
- coder: Writes and executes code
- reviewer: Reviews code quality and runs tests

For each user request:
1. Break the task into sub-tasks
2. Use the delegate_to_agent tool to assign work
3. Collect results and iterate if needed
4. Synthesize a final response

Rules:
- Max 10 total delegations per request
- Always have the reviewer check code before finalizing
- If an agent fails twice, escalate to the user"""

orchestrator_tools = [{
    "name": "delegate_to_agent",
    "description": "Delegate a sub-task to a specialist agent",
    "input_schema": {
        "type": "object",
        "properties": {
            "agent_name": {
                "type": "string",
                "enum": ["researcher", "coder", "reviewer"]
            },
            "task": {"type": "string"},
            "context": {"type": "string", "default": ""}
        },
        "required": ["agent_name", "task"]
    }
}]

def call_agent(agent: Agent, task: str, context: str = "") -> str:
    """Call a specialist agent with a task."""
    message = f"Task: {task}"
    if context:
        message += f"\n\nContext from other agents:\n{context}"

    response = client.messages.create(
        model=agent.model,
        max_tokens=agent.max_tokens,
        system=agent.system_prompt,
        messages=[{"role": "user", "content": message}],
        temperature=agent.temperature,
    )
    return response.content[0].text

def run_multi_agent(user_request: str, max_delegations: int = 10) -> str:
    """Run the multi-agent orchestration loop."""
    messages = [{"role": "user", "content": user_request}]
    delegation_count = 0
    total_tokens = 0

    while delegation_count < max_delegations:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            system=ORCHESTRATOR_SYSTEM,
            messages=messages,
            tools=orchestrator_tools,
        )
        total_tokens += response.usage.input_tokens + response.usage.output_tokens

        # Check if orchestrator wants to delegate
        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    agent = AGENTS[block.input["agent_name"]]
                    result = call_agent(
                        agent,
                        block.input["task"],
                        block.input.get("context", ""),
                    )
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })
                    delegation_count += 1
                    print(f"  [{delegation_count}] {agent.name}: {block.input['task'][:80]}")

            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})
        else:
            # Orchestrator has synthesized the final answer
            print(f"\nCompleted in {delegation_count} delegations, ~{total_tokens} tokens")
            return response.content[0].text

    return "Max delegations reached. Partial results returned."

# Usage
result = run_multi_agent(
    "Research best practices for rate limiting APIs, then write a Python "
    "implementation with tests, and have it reviewed for production readiness."
)
```

## 5. Data Flow

Here is the step-by-step flow through the Multi-Agent orchestration:

![Data Flow](/diagrams/genai-arch/multi-agent-flow.svg)

| Step | Action | Details |
| --- | --- | --- |
| 1 | User submits request | A complex task that requires multiple capabilities (research, coding, review) |
| 2 | Orchestrator plans | Breaks the task into sub-tasks, identifies which agents to involve, determines ordering |
| 3 | Fan-out delegation | Orchestrator calls delegate\_to\_agent for each sub-task; independent tasks can run in parallel |
| 4 | Agents execute | Each specialist processes its sub-task using its tools (search, code execution, testing) |
| 5 | Results returned | Agent outputs flow back to the orchestrator as tool results |
| 6 | Iterate if needed | Orchestrator may request revisions, send coder output to reviewer, or ask researcher for more data |
| 7 | Synthesize response | Orchestrator merges all agent outputs into a coherent final answer |
| 8 | Return to user | Final response includes contributions from all agents, with provenance tracking |

>**State Management:** **Shared context** passes relevant results from one agent to another via the orchestrator. **Isolated state** keeps each agent's working memory separate, preventing context pollution. Most production systems use a hybrid: shared task context with isolated agent scratchpads.

## 6. Trade-offs & Considerations

| Advantage | Limitation |
| --- | --- |
| Handles complex, multi-step tasks beyond single agent capability | Significantly higher latency (multiple LLM calls in sequence) |
| Separation of concerns: each agent is focused and testable | Cost multiplied by number of agents and iterations |
| Different models/configs per agent (cost vs quality optimization) | Harder to debug: failures can cascade across agents |
| Built-in quality control via reviewer agent | Risk of infinite loops or excessive iterations |
| Naturally supports human-in-the-loop at any stage | Complex state management and error recovery |

### Cost Control Strategies

-   **Token budgets:** Set per-agent and per-request token limits; terminate early if exceeded
-   **Iteration caps:** Hard limit on total delegations (typically 5-15 per request)
-   **Model tiering:** Use cheaper models for simple agents (researcher: Haiku), expensive models only for the orchestrator
-   **Caching:** Cache agent results for repeated sub-tasks across requests
-   **Early termination:** Stop when the orchestrator has sufficient confidence, even if not all agents have been consulted

>**When to upgrade:** When you need to run multi-agent systems at enterprise scale with shared infrastructure, model management, and observability, move to Architecture 10 (Production Platform).

## 7. Production Checklist

-   Max iteration limits per request (prevent infinite agent loops)
-   Per-agent and per-request token budgets with cost tracking
-   Structured logging of all inter-agent messages for debugging and replay
-   Timeout per agent call with graceful degradation
-   Human-in-the-loop escalation for low-confidence or high-stakes decisions
-   Sandboxed code execution (Docker containers, no network access)
-   Agent-level error recovery: retry with backoff, fallback to simpler approach
-   Circuit breaker: halt entire workflow if error rate exceeds threshold
-   Observability: distributed traces linking all agent calls in a single request
-   A/B test agent configurations (prompts, models, tools) independently
-   Rate limiting on tool calls to prevent abuse of external APIs
-   Replay capability: re-run any request with the same agent state for debugging
