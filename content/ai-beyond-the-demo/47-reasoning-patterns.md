---
title: "Reasoning Patterns — ReAct, CoT, Plan-and-Execute"
slug: "reasoning-patterns"
description: "The reasoning pattern an agent uses determines how it approaches complex tasks. Different patterns have different strengths, failure modes, and computational costs. Choosing the right reasoning pattern for the task type is as important as choosing the right model."
section: "ai-beyond-the-demo"
order: 47
part: "Part V — Agentic Systems"
---

Part V — Agentic Systems

# Reasoning Patterns — ReAct, CoT, Plan-and-Execute

Agents do not reason in a single uniform way. The reasoning pattern — the structure by which the agent processes information and decides on actions — is a design choice that affects the agent's performance, reliability, and cost on specific task types. Practitioners who understand the available reasoning patterns can choose the right pattern for the task rather than applying a single pattern to every situation.

### What You Will Learn

- Chain-of-thought and its variants as a reasoning foundation
- The ReAct pattern — reasoning and acting interleaved
- Plan-and-execute as an alternative to reactive reasoning
- When to use each pattern and how to combine them

## 47.1 Chain-of-Thought Reasoning

Chain-of-thought (CoT) is the foundation of agentic reasoning. Before generating a final answer or action, the model generates a sequence of intermediate reasoning steps that work toward the conclusion. "Let me think through this step by step" is the prompt pattern that elicits chain-of-thought; the model's output is both the reasoning trace and the final conclusion.

**Why CoT improves performance:** CoT works because the intermediate reasoning steps constrain the final output. The model generates tokens sequentially; earlier tokens influence later ones. When the model generates a correct intermediate step, it is more likely to generate a correct subsequent step than if it were generating the final answer directly. CoT essentially extends the computational process — more tokens of reasoning before the conclusion — which improves accuracy on complex tasks.

**Zero-shot CoT:** Adding "Let's think step by step" to a prompt elicits chain-of-thought without providing examples. Effective for many reasoning tasks, but the reasoning quality is lower than few-shot CoT for complex domain-specific tasks.

**Few-shot CoT:** Providing examples of correct reasoning traces alongside the prompt teaches the model the reasoning style appropriate for the specific task type. More effective than zero-shot CoT for tasks where the correct reasoning pattern is not obvious from first principles.

**Scratchpad reasoning:** The reasoning trace is generated in a designated "thinking" section that is not included in the final output shown to users. The scratchpad allows the model to reason freely without worrying about the quality of intermediate thoughts, which can improve final output quality.

## 47.2 ReAct — Reasoning and Acting

ReAct (Reasoning + Acting) interleaves reasoning steps with tool calls. The agent alternates between generating reasoning ("I need to find out X. I will use the search tool with query Y") and executing tool calls (calling the search tool with query Y), with each tool result added to the context as an observation for the next reasoning step.

**ReAct structure:**

```
Thought: I need to find the current price of product X.
Action: search(query="product X current price")
Observation: [search results]
Thought: The results show two sources with different prices. I need to verify which is current.
Action: retrieve(url="source1.com/pricing")
Observation: [page content]
Thought: This page was last updated today. The current price is $49.99.
Final Answer: The current price of product X is $49.99.
```

**ReAct strengths:** ReAct is highly adaptable — the agent's next action is determined by what it learns from prior tool calls rather than by a predetermined plan. This makes ReAct effective for tasks where the required actions cannot be determined in advance.

**ReAct weaknesses:** For tasks that require many steps, ReAct accumulates context rapidly — each reasoning step and each tool result adds to the context window. Long ReAct chains can exhaust the context window or produce reasoning that drifts from the original goal. ReAct is also sensitive to tool failures — an early failed tool call can cause the agent to take an incorrect reasoning path for subsequent steps.

**When to use ReAct:** Tasks with high uncertainty about required actions, research tasks where the path depends on what is discovered, troubleshooting tasks where the investigation adapts to findings.

## 47.3 Plan-and-Execute

Plan-and-execute separates planning from execution. In the planning phase, the agent generates a complete plan — a sequence of steps to accomplish the goal — before taking any actions. In the execution phase, the agent executes the planned steps, updating the plan when execution reveals that the original plan needs revision.

**Plan-and-execute structure:**

```
Goal: Produce a competitive analysis of products A, B, and C on pricing, features, and reviews.

Plan:
1. Search for current pricing for product A, B, and C
2. Retrieve feature comparison from each product's official documentation
3. Search for user reviews for each product on review platforms
4. Synthesize pricing, features, and reviews into a comparative table
5. Write the analysis summary

[Execute step 1: search for pricing...]
[Execute step 2: retrieve documentation...]
...
```

**Plan-and-execute strengths:** The explicit plan makes the agent's reasoning transparent and auditable — a human reviewer can verify the plan before execution begins. Planning before acting reduces context pollution from intermediate reasoning traces. For tasks with a predictable sequence of steps, planning is more efficient than ReAct because the agent does not need to reason about what to do next after each step.

**Plan-and-execute weaknesses:** Plans become stale when execution reveals information that changes what the agent should do. A rigid executor that follows the original plan when it should adapt will produce worse results than ReAct for tasks with high uncertainty.

**When to use plan-and-execute:** Tasks with predictable step sequences, tasks where human review of the plan before execution is valuable, tasks where auditability of the agent's approach is a requirement.

## 47.4 Combining Patterns

The most effective production agents often combine reasoning patterns:

**Plan-then-ReAct:** Generate a high-level plan using plan-and-execute, then execute each step using ReAct within the step's scope. The plan provides structure and transparency; ReAct provides adaptability within each step.

**Hierarchical reasoning:** High-level goals are decomposed by a planning agent into sub-goals; each sub-goal is executed by a ReAct agent; the planning agent synthesizes the sub-goal results into the final output. This is the supervisor-worker pattern (Chapter 50) applied to reasoning.

**Verification step:** After generating a result (from any reasoning pattern), an additional reasoning step verifies the result against the original goal. The verifier checks: does this result actually answer the original question? Are there obvious errors? Are there gaps that need to be filled? Verification catches reasoning failures that were not obvious during generation.

**Pattern selection heuristics:**

- Task is well-defined with predictable steps → Plan-and-execute
- Task requires adapting to discovered information → ReAct
- Task has both predictable structure and adaptive sub-steps → Plan-then-ReAct
- Task is a complex goal requiring multiple specialized capabilities → Hierarchical reasoning
- Task has high stakes where errors are costly → Add verification step

Reasoning pattern selection is an architectural decision, not a prompt-engineering detail. The choice affects agent reliability, cost, and auditability in ways that are difficult to change after the agent architecture is established.
