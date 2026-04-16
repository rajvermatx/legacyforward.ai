---
title: "Reasoning Patterns"
slug: "reasoning-patterns"
description: "Your agent from Chapter 4 can reason one step at a time. But ask it to plan a weekend trip involving flights, hotels, dietary restrictions, and a budget constraint, and it confidently books a hotel in the wrong city. The problem is not intelligence — it is the absence of structured thinking."
section: "agenticai"
order: 5
part: "Part 02 Core Patterns"
---

Part 2 — Core Patterns

# Reasoning Patterns

Your agent from Chapter 4 can reason one step at a time. But ask it to plan a weekend trip involving flights, hotels, dietary restrictions, and a budget constraint, and it confidently books a hotel in the wrong city. The problem is not intelligence. It is the absence of structured thinking.

### What You Will Learn

-   Why direct prompting fails on multi-step problems and how Chain-of-Thought fixes it
-   The difference between zero-shot CoT and few-shot CoT, and when each is appropriate
-   Tree-of-Thought reasoning: exploring multiple paths and pruning dead ends
-   Self-consistency: sampling multiple reasoning chains and voting on the answer
-   Reflection and self-critique: teaching agents to check their own work
-   How reasoning strategy affects tool selection, planning quality, and end-to-end accuracy
-   Building a configurable Reasoning Engine that lets you swap strategies at runtime

## 5.1 When Direct Prompting Breaks

Consider a straightforward question: *"A store sells apples at $1.50 each. You have a $20 bill and need to buy at least 3 apples but want to maximize the number of oranges you can buy at $2.00 each with the remaining money. How many of each fruit do you buy?"*

When you send this to a language model with no reasoning guidance, something interesting happens. The model often answers immediately — "Buy 3 apples ($4.50) and 7 oranges ($14.00), total $18.50" — and it happens to be correct. But change the numbers slightly, add a constraint (say, you also need at least one banana at $1.25), and the model begins making arithmetic errors or ignoring constraints entirely. It is not that the model cannot do math. It is that the model is pattern-matching to a plausible-sounding answer rather than working through the problem systematically.

This is the core failure mode of **direct prompting**: the model compresses multi-step reasoning into a single forward pass. For the model, producing the token "7" (oranges) requires simultaneously holding the apple cost, the remaining budget, the orange price, and the integer division, all in the residual stream at the same layer. Sometimes this works. Often it does not. When it fails, it fails silently, with the same confident tone as when it succeeds.

Here is what this failure looks like in agent code:

```
# direct_prompting.py — asking the model to answer in one shot
import openai

def ask_directly(question: str) -> str:
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Answer the question precisely."},
            {"role": "user", "content": question},
        ],
        temperature=0.0,
    )
    return response.choices[0].message.content

# Multi-step constraint problem
result = ask_directly(
    "A hospital has 12 nurses across 3 shifts. Each shift needs at least 3 "
    "nurses. The night shift requires 1 more nurse than the morning shift. "
    "The evening shift has exactly 4 nurses. How many nurses per shift?"
)
# Model frequently answers: Morning: 3, Evening: 4, Night: 5 → total 12 ✓
# But add a fourth constraint and accuracy drops to ~60%
```

The model gets this particular instance right roughly 85% of the time. But the moment you scale to four constraints, or introduce variables that require backtracking ("if the night shift has fewer than 5, redistribute"), accuracy plummets. The model has no mechanism for trying something, checking it, and revising. It generates tokens left to right, commits to each one, and hopes for the best.

This matters enormously for agents. An agent making decisions about which tools to call, in what order, with what parameters, is solving a multi-step constraint satisfaction problem at every turn. If the underlying reasoning is "one-shot guess," the agent will select the wrong tool, pass the wrong arguments, or skip steps entirely — and then confidently present the result as correct.

> Common Mistake
> 
> Developers often attribute agent failures to "the model is not smart enough" and respond by upgrading to a larger model. In many cases, the same model produces correct answers when given a reasoning structure. Before you spend 10x on tokens, try adding a thinking step. The cheapest performance upgrade is often a prompt change, not a model change.

## 5.2 Chain-of-Thought Prompting

Chain-of-Thought prompting, introduced by Wei et al. (2022), is the single most important reasoning technique in the LLM toolkit. The idea is simple: instead of asking the model to produce an answer directly, you ask it to show its work. The model generates intermediate reasoning steps as tokens, and those tokens become part of the context for subsequent tokens. Each step is grounded in the previous one, turning a single high-difficulty forward pass into multiple low-difficulty passes.

The mechanism is important to understand. When a model generates the text "Step 1: The evening shift has 4 nurses, so we have 12 - 4 = 8 nurses remaining," the tokens "8 nurses remaining" are now in the context window. When the model generates Step 2, it can attend to that "8" directly, rather than recomputing it internally. The chain of thought is, in effect, an **external scratchpad** that offloads intermediate results from the model's hidden state into the token sequence itself.

### 5.2.1 Zero-Shot Chain-of-Thought

The simplest form of CoT requires no examples at all. Kojima et al. (2022) discovered that appending the phrase "Let's think step by step" to a prompt produces chain-of-thought reasoning in most modern language models. This is called **zero-shot CoT** because it requires zero demonstrations — just an instruction to reason.

```
# zero_shot_cot.py — the simplest reasoning upgrade
import openai

def ask_with_zero_shot_cot(question: str) -> str:
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a careful problem solver."},
            {"role": "user", "content": f"{question}\n\nLet's think step by step."},
        ],
        temperature=0.0,
    )
    return response.choices[0].message.content

result = ask_with_zero_shot_cot(
    "A hospital has 12 nurses across 3 shifts. Each shift needs at least 3 "
    "nurses. The night shift requires 1 more nurse than the morning shift. "
    "The evening shift has exactly 4 nurses. How many nurses per shift?"
)
# Output now shows explicit reasoning:
# Step 1: Evening shift = 4 nurses. Remaining = 12 - 4 = 8.
# Step 2: Let morning = x. Then night = x + 1.
# Step 3: x + (x + 1) = 8 → 2x + 1 = 8 → x = 3.5
# Step 4: Since we need whole nurses, morning = 3, night = 5. Check: 3+4+5 = 12 ✓
# Step 5: Minimum constraint: all shifts ≥ 3 ✓
```

Zero-shot CoT is the lowest-effort, highest-impact change you can make to an agent's reasoning. On the GSM8K math benchmark, zero-shot CoT improved accuracy by 10–15 percentage points across model sizes. On more complex multi-step tasks, the improvement can be even larger.

However, zero-shot CoT has a significant limitation: you have no control over the *structure* of the reasoning. The model might produce three steps or thirteen. It might reason about irrelevant aspects of the problem. It might reach the right answer through a sloppy chain. For production agents where you need predictable, auditable reasoning, you often need more control.

### 5.2.2 Few-Shot Chain-of-Thought

Few-shot CoT gives you that control. Instead of hoping the model reasons well, you *show* it exactly what good reasoning looks like by providing examples of questions paired with ideal step-by-step solutions.

```
# few_shot_cot.py — teaching the model your reasoning structure
import openai

FEW_SHOT_EXAMPLES = [
    {
        "role": "user",
        "content": (
            "A warehouse has 200 items across 4 zones. Zone A has twice as many "
            "items as Zone B. Zone C has 30 items. Zone D has 10 more items than "
            "Zone C. How many items are in each zone?"
        ),
    },
    {
        "role": "assistant",
        "content": (
            "Step 1: Identify known quantities.\n"
            "  - Zone C = 30 items\n"
            "  - Zone D = 30 + 10 = 40 items\n\n"
            "Step 2: Calculate remaining items.\n"
            "  - Zones A + B = 200 - 30 - 40 = 130 items\n\n"
            "Step 3: Set up equations for unknowns.\n"
            "  - Zone A = 2 × Zone B\n"
            "  - 2B + B = 130 → 3B = 130 → B ≈ 43.3\n\n"
            "Step 4: Since items are whole numbers, check constraints.\n"
            "  - B = 43, A = 87 → total = 87 + 43 + 30 + 40 = 200 ✓\n\n"
            "Answer: Zone A = 87, Zone B = 43, Zone C = 30, Zone D = 40."
        ),
    },
]

def ask_with_few_shot_cot(question: str) -> str:
    messages = [
        {"role": "system", "content": (
            "Solve problems step by step. Show your reasoning clearly. "
            "Verify your answer in the final step."
        )},
        *FEW_SHOT_EXAMPLES,
        {"role": "user", "content": question},
    ]
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.0,
    )
    return response.choices[0].message.content
```

The few-shot examples serve as a template. The model learns not just *that* it should reason step by step, but *how* — identify knowns first, then unknowns, set up equations, solve, and verify. This structural consistency is critical for agents because it makes the reasoning trace parseable. If you know the model will always produce a "Verify" step, you can programmatically extract and double-check it.

> Under the Hood
> 
> Why does Chain-of-Thought work mechanically? Transformer models process all tokens in a layer simultaneously, but each token can only attend to tokens that come before it (in autoregressive models). When the model generates "8 nurses remaining" in Step 1, that information becomes directly accessible via attention in Step 2. Without CoT, the model would need to represent "12 minus 4 equals 8" entirely within its hidden state activations — a much harder computation that fails on problems requiring more than 2–3 sequential steps. CoT effectively converts depth (computation within a single forward pass) into length (multiple forward passes over an expanding context).

### 5.2.3 Choosing Between Zero-Shot and Few-Shot CoT

The decision is not always obvious. Here is a practical guide:

| Factor | Zero-Shot CoT | Few-Shot CoT |
| --- | --- | --- |
| Setup effort | None — one extra sentence | Requires crafting 2–5 examples |
| Reasoning structure | Unpredictable format | Follows your template exactly |
| Parsing reliability | Low — format varies | High — consistent structure |
| Token cost | Lower (no examples in prompt) | Higher (examples consume tokens) |
| Domain adaptation | Generic reasoning | Domain-specific patterns |
| Best for | Prototyping, diverse tasks | Production, domain-specific agents |

For agents, the recommendation is almost always few-shot CoT in production. The upfront cost of writing examples pays for itself in parsing reliability and reasoning consistency. Use zero-shot CoT during development and exploration, then graduate to few-shot once you understand the reasoning patterns your agent needs.

![Diagram 1](/diagrams/agenticai/reasoning-patterns-1.svg)

Figure 5-1. Direct prompting compresses all reasoning into a single step, while Chain-of-Thought externalizes intermediate steps into the token sequence, producing grounded, verifiable answers.

## 5.3 Tree-of-Thought Reasoning

Chain-of-Thought is a single chain — one path from question to answer. This works well for problems with a clear sequence of steps, but many real-world problems are not linear. They require exploring multiple possibilities, evaluating partial solutions, and backtracking when a path leads nowhere.

Consider an agent tasked with debugging a production outage. The symptoms are: API response times increased 5x, database CPU is at 90%, and no recent deployments occurred. The agent needs to consider multiple hypotheses simultaneously — a slow query introduced by a data change, a connection pool leak, an index that was dropped, a spike in traffic — evaluate evidence for each, and prune hypotheses that do not fit the data.

**Tree-of-Thought** (Yao et al., 2023) generalizes CoT from a chain to a tree. Instead of generating one reasoning path, the model explores multiple branches, evaluates each, and selects the most promising ones to continue. Unpromising branches are pruned, saving computation.

The algorithm has three components:

1.  **Thought generation:** at each node, generate multiple possible next steps (typically 2–5).
2.  **Thought evaluation:** use the model itself (or a separate evaluator) to score how promising each branch is.
3.  **Search strategy:** either breadth-first (explore all branches at each depth) or depth-first (follow the most promising branch deeply, backtrack if stuck).

```
# tree_of_thought.py — exploring multiple reasoning paths
import openai
from dataclasses import dataclass

@dataclass
class ThoughtNode:
    content: str
    score: float
    children: list["ThoughtNode"]
    depth: int

def generate_thoughts(problem: str, context: str, n: int = 3) -> list[str]:
    """Generate n possible next reasoning steps."""
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": (
                "You are exploring solutions to a problem. Given the current "
                "reasoning context, propose exactly {n} distinct next steps. "
                "Format: one step per line, numbered 1-{n}."
            ).format(n=n)},
            {"role": "user", "content": (
                f"Problem: {problem}\n\n"
                f"Reasoning so far:\n{context}\n\n"
                f"Propose {n} possible next steps:"
            )},
        ],
        temperature=0.8,  # higher temp for diversity
    )
    text = response.choices[0].message.content
    # Parse numbered lines
    thoughts = []
    for line in text.strip().split("\n"):
        line = line.strip()
        if line and line[0].isdigit():
            # Remove "1. " prefix
            thought = line.split(".", 1)[-1].strip()
            thoughts.append(thought)
    return thoughts[:n]

def evaluate_thought(problem: str, reasoning_path: str) -> float:
    """Score a partial reasoning path from 0.0 to 1.0."""
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": (
                "Evaluate how promising this partial reasoning is for solving "
                "the problem. Respond with a single number from 0.0 (dead end) "
                "to 1.0 (very likely to lead to correct solution)."
            )},
            {"role": "user", "content": (
                f"Problem: {problem}\n\n"
                f"Reasoning path:\n{reasoning_path}"
            )},
        ],
        temperature=0.0,
    )
    try:
        return float(response.choices[0].message.content.strip())
    except ValueError:
        return 0.5  # default if parsing fails

def tree_of_thought(
    problem: str,
    max_depth: int = 3,
    branch_factor: int = 3,
    prune_threshold: float = 0.3,
) -> str:
    """Solve a problem using Tree-of-Thought search."""
    root = ThoughtNode(content="", score=1.0, children=[], depth=0)
    best_path = ""
    best_score = 0.0

    def expand(node: ThoughtNode, context: str):
        nonlocal best_path, best_score

        if node.depth >= max_depth:
            # Leaf node — evaluate complete path
            score = evaluate_thought(problem, context)
            if score > best_score:
                best_score = score
                best_path = context
            return

        # Generate candidate next steps
        thoughts = generate_thoughts(problem, context, n=branch_factor)

        for thought in thoughts:
            new_context = f"{context}\nStep {node.depth + 1}: {thought}"
            score = evaluate_thought(problem, new_context)

            # Prune unpromising branches
            if score < prune_threshold:
                continue

            child = ThoughtNode(
                content=thought, score=score,
                children=[], depth=node.depth + 1,
            )
            node.children.append(child)

            # Recurse into promising branches
            expand(child, new_context)

    expand(root, "")
    return best_path
```

The key insight is the `prune_threshold`. Without pruning, Tree-of-Thought would explore an exponential number of paths (3 branches at 3 depths = 27 leaf nodes, each requiring an LLM call to evaluate). Pruning cuts this dramatically. In practice, most problems see 60–80% of branches pruned after the first step, because the evaluator can quickly identify reasoning paths that contradict known facts or violate constraints.

> Under the Hood
> 
> Tree-of-Thought is computationally expensive — it requires multiple LLM calls per reasoning step. A single ToT solve with 3 branches and 3 depths can require 20–40 LLM calls. This is why ToT is typically reserved for high-stakes decisions where accuracy matters more than latency. In an agent system, you might use zero-shot CoT for routine decisions and escalate to ToT only when the agent detects ambiguity or high risk. The Reasoning Engine project at the end of this chapter implements exactly this adaptive strategy.

![Diagram 2](/diagrams/agenticai/reasoning-patterns-2.svg)

Figure 5-2. Tree-of-Thought explores multiple reasoning branches from each node, prunes low-scoring paths (dashed), and follows the highest-scoring path to the final answer.

## 5.4 Self-Consistency

Self-consistency (Wang et al., 2022) takes a different approach to the "single chain might be wrong" problem. Instead of exploring a tree, it samples multiple independent chains of thought and takes a majority vote on the final answer. The intuition is simple: if three out of five reasoning chains arrive at the same answer via different paths, that answer is probably correct — even if some individual chains have errors.

```
# self_consistency.py — majority vote over multiple reasoning chains
import openai
from collections import Counter

def solve_with_self_consistency(
    question: str,
    num_samples: int = 5,
    temperature: float = 0.7,
) -> dict:
    """
    Sample multiple CoT solutions and return the majority answer.
    Returns both the answer and the confidence (vote fraction).
    """
    answers = []

    for _ in range(num_samples):
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": (
                    "Solve the problem step by step. After your reasoning, "
                    "write your final answer on the last line as: "
                    "ANSWER: "
                )},
                {"role": "user", "content": question},
            ],
            temperature=temperature,  # >0 for diverse chains
        )
        text = response.choices[0].message.content

        # Extract the final answer line
        for line in reversed(text.strip().split("\n")):
            if line.strip().upper().startswith("ANSWER:"):
                answer = line.split(":", 1)[1].strip()
                answers.append(answer)
                break

    # Majority vote
    if not answers:
        return {"answer": "Unable to determine", "confidence": 0.0}

    vote_counts = Counter(answers)
    best_answer, best_count = vote_counts.most_common(1)[0]

    return {
        "answer": best_answer,
        "confidence": best_count / len(answers),
        "vote_distribution": dict(vote_counts),
        "num_chains": num_samples,
    }

# Example usage
result = solve_with_self_consistency(
    "A trader buys 100 shares at $45, sells 60 at $52, then sells the "
    "remaining 40 at $38. What is the total profit or loss?",
    num_samples=5,
)
# result:
# {
#     "answer": "$140 profit",
#     "confidence": 0.8,        # 4 out of 5 chains agree
#     "vote_distribution": {"$140 profit": 4, "$120 profit": 1},
#     "num_chains": 5,
# }
```

Self-consistency is particularly valuable for agents because it provides a built-in **confidence signal**. If all five chains agree, the agent can proceed with high confidence. If the chains are split 3-2, the agent should escalate to a human or use a more expensive reasoning strategy. If the chains produce five different answers, something is fundamentally ambiguous about the problem.

> Production Consideration
> 
> Self-consistency multiplies your token cost by the number of samples. For a 5-sample self-consistency check, you are paying 5x the inference cost. In production, use self-consistency selectively — for high-stakes decisions, ambiguous inputs, or when the agent's initial confidence is low. Many production systems use a two-phase approach: generate one chain first, and only escalate to self-consistency if the model's own logprob confidence is below a threshold.

The temperature parameter is critical. At temperature 0, all chains would be identical (or nearly so), defeating the purpose. A temperature of 0.5–0.8 produces enough diversity for different reasoning paths while keeping each individual chain coherent. Too high (above 1.0) and individual chains become unreliable, polluting the vote.

## 5.5 Reflection and Self-Critique

The reasoning patterns we have covered so far — CoT, ToT, self-consistency — all operate during the initial solve. Reflection adds a second phase: after the model produces an answer, it reviews its own reasoning and corrects any errors it finds. This is inspired by how human experts work — a doctor does not just diagnose; they review the diagnosis against a mental checklist of differential diagnoses, potential biases, and missing data.

Reflection typically follows a two-pass structure:

1.  **Solve pass:** generate a chain-of-thought solution as normal.
2.  **Critique pass:** present the solution back to the model (or a separate model) and ask it to identify errors, missing steps, unsupported assumptions, or alternative approaches.
3.  **Revise pass (optional):** use the critique to generate an improved solution.

```
# reflection.py — solve, critique, revise
import openai

def solve_with_reflection(question: str) -> dict:
    """Solve a problem, critique the solution, then revise."""

    # === Pass 1: Initial solve ===
    solve_response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": (
                "Solve the problem step by step. Be thorough."
            )},
            {"role": "user", "content": question},
        ],
        temperature=0.0,
    )
    initial_solution = solve_response.choices[0].message.content

    # === Pass 2: Critique ===
    critique_response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": (
                "You are a rigorous reviewer. Examine the following solution "
                "for errors, unsupported assumptions, missing steps, and "
                "logical gaps. Be specific about what is wrong and why."
            )},
            {"role": "user", "content": (
                f"Problem: {question}\n\n"
                f"Proposed solution:\n{initial_solution}\n\n"
                "What errors or issues do you find?"
            )},
        ],
        temperature=0.0,
    )
    critique = critique_response.choices[0].message.content

    # === Pass 3: Revise ===
    revise_response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": (
                "Revise the solution based on the critique. Keep what was "
                "correct, fix what was wrong, and add any missing steps."
            )},
            {"role": "user", "content": (
                f"Problem: {question}\n\n"
                f"Original solution:\n{initial_solution}\n\n"
                f"Critique:\n{critique}\n\n"
                "Please provide a corrected solution."
            )},
        ],
        temperature=0.0,
    )
    revised_solution = revise_response.choices[0].message.content

    return {
        "initial_solution": initial_solution,
        "critique": critique,
        "revised_solution": revised_solution,
    }
```

Reflection is particularly powerful for agent tasks that involve planning. An agent that generates a plan, critiques it for gaps, and revises it before execution will produce better plans than one that executes immediately. The cost is two extra LLM calls, but for complex tasks those calls often save multiple failed tool executions that would cost even more.

> Common Mistake
> 
> A known failure mode of self-critique is **sycophantic revision** — the model agrees with the critique even when the original answer was correct. Research shows that models will sometimes "fix" correct answers into incorrect ones if the critique sounds authoritative. To mitigate this, include a line in the critique prompt: "If the solution is correct, say so explicitly. Do not change correct reasoning." Additionally, consider comparing the initial and revised answers — if they differ, use self-consistency to decide which is more likely correct.

### 5.5.1 Reflection in Agent Loops

Reflection becomes most powerful when integrated into the agent's action loop rather than applied as a post-hoc step. After each tool call, the agent can reflect on whether the result matches expectations and whether the overall plan still makes sense.

```
# reflective_agent_loop.py — reflection integrated into the agent cycle
def reflective_agent_step(state: dict) -> dict:
    """One step of an agent loop with built-in reflection."""

    # 1. Plan the next action
    plan = generate_plan(state["goal"], state["history"])

    # 2. Reflect on the plan before executing
    plan_critique = critique_plan(plan, state["history"])

    if plan_critique["has_issues"]:
        # Revise the plan based on critique
        plan = revise_plan(plan, plan_critique["issues"])

    # 3. Execute the action
    result = execute_action(plan["action"])

    # 4. Reflect on the result
    result_assessment = assess_result(
        expected=plan["expected_outcome"],
        actual=result,
        goal=state["goal"],
    )

    # 5. Update state with reflection
    state["history"].append({
        "plan": plan,
        "plan_critique": plan_critique,
        "result": result,
        "assessment": result_assessment,
    })

    # 6. Check if we need to backtrack
    if result_assessment["progress"] == "negative":
        state["backtrack_count"] += 1
        if state["backtrack_count"] > 3:
            state["status"] = "stuck"  # escalate to human
            return state

    return state
```

This pattern, plan, critique, execute, assess, is the hallmark of robust agent systems. It adds latency to each step, but it prevents the far more expensive failure mode of an agent executing a sequence of wrong actions before anyone notices.

## 5.6 How Reasoning Improves Tool Selection and Planning

Everything we have discussed — CoT, ToT, self-consistency, reflection — has direct implications for the practical problem agents face on every turn: *which tool should I call next, with what arguments, and why?*

Without structured reasoning, tool selection degrades in predictable ways:

-   **Wrong tool:** the agent calls a web search when it should query a database, because it did not reason about where the data actually lives.
-   **Wrong arguments:** the agent passes a vague query to a precise API, because it did not decompose the user's question into the API's parameter space.
-   **Wrong order:** the agent calls Tool B before Tool A, even though Tool B depends on Tool A's output, because it did not plan the dependency chain.
-   **Redundant calls:** the agent calls the same tool three times with slightly different queries, because it does not track what it has already learned.

Chain-of-Thought fixes this by forcing the agent to articulate its plan before executing. A CoT-guided tool selection trace looks like:

```
Thought: The user wants Q3 revenue for Acme Corp. I have two tools:
  1. web_search — general internet search
  2. financial_api — structured financial data by ticker

I should use financial_api because:
  - It returns structured JSON I can parse precisely
  - Revenue is a standard financial metric it supports
  - I need Acme Corp's ticker symbol first — let me search for that

Action: web_search("Acme Corp stock ticker symbol")
Observation: "Acme Corporation trades as ACME on NYSE"

Thought: Good, ticker is ACME. Now I can query the financial API.
Action: financial_api(ticker="ACME", metric="revenue", period="Q3-2024")
Observation: {"revenue": 4200000000, "currency": "USD", "period": "Q3-2024"}
```

Notice how the reasoning step identified that the financial API was the right tool *and* that it needed a prerequisite (the ticker symbol). Without CoT, the agent might have called `web_search("Acme Corp Q3 revenue")` and gotten a six-month-old blog post with stale data.

Tree-of-Thought extends this further for ambiguous tasks. When an agent is uncertain which of several approaches will work, it can explore branches — "If I use the SQL database, I need to know the schema first" versus "If I use the analytics API, I can query directly but the data might be aggregated differently" — and evaluate which path is more likely to succeed before committing to tool calls.

> Production Consideration
> 
> In production systems, the reasoning trace is as valuable as the final answer. Store every thought/action/observation trace in structured logs. When an agent fails, these traces are the debugging tool that turns a mysterious failure into a diagnosable one. Many teams index reasoning traces in a vector store and use them for few-shot examples in future prompts — the agent literally learns from its own past reasoning.

## 5.7 Choosing a Reasoning Strategy

No single reasoning strategy is best for all situations. The art of building production agents is knowing when to use each one. Here is a decision framework:

| Strategy | Best For | Cost | Latency |
| --- | --- | --- | --- |
| **Direct prompting** | Simple lookups, classification, extraction | 1x | Lowest |
| **Zero-shot CoT** | Moderate reasoning, general tasks | 1.5x (longer output) | Low |
| **Few-shot CoT** | Domain-specific tasks, structured output | 2x (examples + output) | Low-Med |
| **Self-consistency** | High-stakes single-answer problems | Nx (N samples) | Medium |
| **Tree-of-Thought** | Complex planning, exploration problems | 10–40x | High |
| **Reflection** | Plans, code generation, long-form analysis | 3x | Medium |

A well-designed agent does not use one strategy for everything. It uses a **strategy selector** that examines the incoming task and chooses the appropriate reasoning approach. Simple factual queries get direct prompting. Arithmetic and logic problems get zero-shot CoT. Complex planning tasks get reflection. Ambiguous or high-stakes decisions get ToT or self-consistency.

This is exactly what the chapter project implements.

## Project: Reasoning Engine

The Reasoning Engine is a configurable module that sits between your agent's perception layer and its action layer. It accepts a task, classifies its complexity, selects an appropriate reasoning strategy, executes that strategy, and returns a structured reasoning trace along with the answer.

### Architecture

The engine has four components:

1.  **Task Classifier:** examines the input and assigns a complexity level (simple, moderate, complex, ambiguous).
2.  **Strategy Selector:** maps complexity to a reasoning strategy based on configurable rules.
3.  **Strategy Executor:** runs the selected strategy (CoT, ToT, self-consistency, or reflection).
4.  **Trace Formatter:** packages the reasoning into a structured, loggable output.

```
# reasoning_engine.py — configurable reasoning strategy selector
import openai
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

class Complexity(Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    AMBIGUOUS = "ambiguous"

class Strategy(Enum):
    DIRECT = "direct"
    ZERO_SHOT_COT = "zero_shot_cot"
    FEW_SHOT_COT = "few_shot_cot"
    SELF_CONSISTENCY = "self_consistency"
    TREE_OF_THOUGHT = "tree_of_thought"
    REFLECTION = "reflection"

@dataclass
class ReasoningTrace:
    strategy: Strategy
    complexity: Complexity
    steps: list[str] = field(default_factory=list)
    answer: str = ""
    confidence: float = 0.0
    token_cost: int = 0
    metadata: dict = field(default_factory=dict)

# Default strategy mapping — override per domain
DEFAULT_STRATEGY_MAP = {
    Complexity.SIMPLE: Strategy.DIRECT,
    Complexity.MODERATE: Strategy.ZERO_SHOT_COT,
    Complexity.COMPLEX: Strategy.REFLECTION,
    Complexity.AMBIGUOUS: Strategy.SELF_CONSISTENCY,
}

class ReasoningEngine:
    def __init__(
        self,
        model: str = "gpt-4o",
        strategy_map: Optional[dict] = None,
        few_shot_examples: Optional[list] = None,
        consistency_samples: int = 5,
        tot_branch_factor: int = 3,
        tot_max_depth: int = 3,
    ):
        self.model = model
        self.strategy_map = strategy_map or DEFAULT_STRATEGY_MAP
        self.few_shot_examples = few_shot_examples or []
        self.consistency_samples = consistency_samples
        self.tot_branch_factor = tot_branch_factor
        self.tot_max_depth = tot_max_depth

    def classify_complexity(self, task: str) -> Complexity:
        """Use the LLM to classify task complexity."""
        response = openai.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": (
                    "Classify the complexity of this task. Respond with "
                    "exactly one word: simple, moderate, complex, or ambiguous.\n\n"
                    "- simple: single-step lookup, classification, or extraction\n"
                    "- moderate: 2-4 step reasoning, arithmetic, comparisons\n"
                    "- complex: multi-step planning, dependencies, constraints\n"
                    "- ambiguous: unclear requirements, multiple valid approaches"
                )},
                {"role": "user", "content": task},
            ],
            temperature=0.0,
            max_tokens=10,
        )
        label = response.choices[0].message.content.strip().lower()
        try:
            return Complexity(label)
        except ValueError:
            return Complexity.MODERATE  # safe default

    def select_strategy(self, complexity: Complexity) -> Strategy:
        """Map complexity to strategy using configured rules."""
        return self.strategy_map.get(complexity, Strategy.ZERO_SHOT_COT)

    def execute(
        self,
        task: str,
        strategy_override: Optional[Strategy] = None,
    ) -> ReasoningTrace:
        """Run the full reasoning pipeline."""
        complexity = self.classify_complexity(task)
        strategy = strategy_override or self.select_strategy(complexity)

        trace = ReasoningTrace(strategy=strategy, complexity=complexity)

        if strategy == Strategy.DIRECT:
            trace = self._run_direct(task, trace)
        elif strategy == Strategy.ZERO_SHOT_COT:
            trace = self._run_zero_shot_cot(task, trace)
        elif strategy == Strategy.FEW_SHOT_COT:
            trace = self._run_few_shot_cot(task, trace)
        elif strategy == Strategy.SELF_CONSISTENCY:
            trace = self._run_self_consistency(task, trace)
        elif strategy == Strategy.TREE_OF_THOUGHT:
            trace = self._run_tree_of_thought(task, trace)
        elif strategy == Strategy.REFLECTION:
            trace = self._run_reflection(task, trace)

        return trace

    def _run_direct(self, task: str, trace: ReasoningTrace) -> ReasoningTrace:
        response = openai.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Answer directly and concisely."},
                {"role": "user", "content": task},
            ],
            temperature=0.0,
        )
        trace.answer = response.choices[0].message.content
        trace.confidence = 0.7  # lower confidence for direct
        trace.steps = ["Direct answer (no reasoning chain)"]
        trace.token_cost = response.usage.total_tokens
        return trace

    def _run_zero_shot_cot(
        self, task: str, trace: ReasoningTrace,
    ) -> ReasoningTrace:
        response = openai.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": (
                    "Solve the problem step by step. Show your reasoning. "
                    "End with ANSWER: "
                )},
                {"role": "user", "content": (
                    f"{task}\n\nLet's think step by step."
                )},
            ],
            temperature=0.0,
        )
        text = response.choices[0].message.content
        trace.steps = self._parse_steps(text)
        trace.answer = self._extract_answer(text)
        trace.confidence = 0.8
        trace.token_cost = response.usage.total_tokens
        return trace

    def _run_few_shot_cot(
        self, task: str, trace: ReasoningTrace,
    ) -> ReasoningTrace:
        messages = [
            {"role": "system", "content": (
                "Solve problems step by step following the demonstrated format. "
                "End with ANSWER: "
            )},
            *self.few_shot_examples,
            {"role": "user", "content": task},
        ]
        response = openai.chat.completions.create(
            model=self.model, messages=messages, temperature=0.0,
        )
        text = response.choices[0].message.content
        trace.steps = self._parse_steps(text)
        trace.answer = self._extract_answer(text)
        trace.confidence = 0.85
        trace.token_cost = response.usage.total_tokens
        return trace

    def _run_self_consistency(
        self, task: str, trace: ReasoningTrace,
    ) -> ReasoningTrace:
        from collections import Counter
        answers = []
        total_tokens = 0

        for _ in range(self.consistency_samples):
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": (
                        "Solve step by step. End with ANSWER: "
                    )},
                    {"role": "user", "content": task},
                ],
                temperature=0.7,
            )
            text = response.choices[0].message.content
            total_tokens += response.usage.total_tokens
            answer = self._extract_answer(text)
            if answer:
                answers.append(answer)

        if answers:
            votes = Counter(answers)
            best, count = votes.most_common(1)[0]
            trace.answer = best
            trace.confidence = count / len(answers)
            trace.metadata["vote_distribution"] = dict(votes)
        else:
            trace.answer = "Unable to determine"
            trace.confidence = 0.0

        trace.steps = [
            f"Sampled {self.consistency_samples} reasoning chains",
            f"Answers: {answers}",
            f"Majority vote: {trace.answer}",
        ]
        trace.token_cost = total_tokens
        return trace

    def _run_tree_of_thought(
        self, task: str, trace: ReasoningTrace,
    ) -> ReasoningTrace:
        # Simplified ToT — full implementation in tree_of_thought.py
        best_path = tree_of_thought(
            task,
            max_depth=self.tot_max_depth,
            branch_factor=self.tot_branch_factor,
        )
        trace.steps = best_path.split("\n")
        trace.answer = trace.steps[-1] if trace.steps else ""
        trace.confidence = 0.9
        return trace

    def _run_reflection(
        self, task: str, trace: ReasoningTrace,
    ) -> ReasoningTrace:
        result = solve_with_reflection(task)
        trace.steps = [
            f"Initial: {result['initial_solution'][:200]}...",
            f"Critique: {result['critique'][:200]}...",
            f"Revised: {result['revised_solution'][:200]}...",
        ]
        trace.answer = result["revised_solution"]
        trace.confidence = 0.9
        return trace

    @staticmethod
    def _parse_steps(text: str) -> list[str]:
        """Extract numbered steps from reasoning text."""
        steps = []
        for line in text.split("\n"):
            line = line.strip()
            if line and (
                line.startswith("Step") or
                (len(line) > 2 and line[0].isdigit() and line[1] in ".)")
            ):
                steps.append(line)
        return steps or [text[:200] + "..."]

    @staticmethod
    def _extract_answer(text: str) -> str:
        """Extract answer from ANSWER: line."""
        for line in reversed(text.strip().split("\n")):
            if "ANSWER:" in line.upper():
                return line.split(":", 1)[1].strip()
        # Fallback: last non-empty line
        for line in reversed(text.strip().split("\n")):
            if line.strip():
                return line.strip()
        return ""


# === Usage ===
if __name__ == "__main__":
    engine = ReasoningEngine(model="gpt-4o")

    # The engine automatically selects the right strategy
    trace = engine.execute(
        "What is the capital of France?"  # simple → direct
    )
    print(f"Strategy: {trace.strategy.value}, Answer: {trace.answer}")

    trace = engine.execute(
        "A store has 150 items. Category A has 3x Category B. "
        "Category C has 20 items. How many in each?"  # moderate → CoT
    )
    print(f"Strategy: {trace.strategy.value}, Answer: {trace.answer}")

    trace = engine.execute(
        "Design a database schema for a hospital appointment system "
        "that handles recurring appointments, cancellations, waitlists, "
        "and insurance pre-authorization."  # complex → reflection
    )
    print(f"Strategy: {trace.strategy.value}, Answer: {trace.answer}")

    # Override strategy manually
    trace = engine.execute(
        "Should we deploy to production today?",
        strategy_override=Strategy.SELF_CONSISTENCY,
    )
    print(f"Confidence: {trace.confidence}")
```

### Domain Variants

| Domain | Reasoning Scenario |
| --- | --- |
| Tech / Software | Debug reasoning for production incidents — classify severity, select investigation tools, reason about root causes |
| Healthcare | Differential diagnosis reasoning — systematic elimination of conditions using patient symptoms and test results |
| Finance | Investment analysis reasoning — evaluate trades against risk constraints, compliance rules, and market conditions |
| Education | Adaptive tutoring — diagnose student misconceptions, select appropriate explanations and practice problems |
| E-commerce | Product recommendation reasoning — balance user preferences, inventory, margins, and personalization signals |
| Legal | Legal argument construction — build reasoning chains from statutes, precedent, and case facts |

## Summary

Reasoning patterns are the difference between agents that guess and agents that think. Direct prompting compresses all reasoning into a single forward pass, which fails silently on multi-step problems. Chain-of-Thought fixes this by externalizing intermediate steps into the token stream, letting the model attend to its own partial results. Zero-shot CoT is the minimum viable improvement; few-shot CoT gives you structural control. Tree-of-Thought explores multiple paths for problems where the right approach is not obvious. Self-consistency provides a confidence signal through majority voting. Reflection catches errors after the fact, turning a single-pass system into one that checks its own work.

The most important lesson is that reasoning strategy should not be fixed. Different tasks demand different strategies, and a well-designed agent selects its reasoning approach based on task complexity, cost tolerance, and required confidence. The Reasoning Engine pattern encapsulates this decision, giving you a single interface that adapts to whatever comes in.

### Key Takeaways

1.  **Direct prompting fails silently** on multi-step problems because the model has no scratchpad for intermediate results. Always default to at least zero-shot CoT for anything beyond simple lookups.
2.  **Chain-of-Thought works mechanically**, not magically. It converts computational depth (hard for transformers) into sequence length (easy for transformers). The chain is an external memory for intermediate values.
3.  **Tree-of-Thought and self-consistency trade cost for reliability.** Use them selectively for high-stakes decisions, not on every turn. A 5-sample self-consistency check costs 5x but provides a confidence signal you cannot get any other way.
4.  **Reflection prevents the most expensive agent failures** — confidently executing a wrong plan. A 3x cost increase for plan critique is cheap compared to the cost of rolling back five wrong tool executions.
5.  **Strategy selection is itself a reasoning problem.** The Reasoning Engine pattern classifies task complexity and maps it to the appropriate strategy automatically, so you do not pay Tree-of-Thought prices for simple questions.

### Exercises

#### Conceptual

**Reasoning cost analysis.** You are building an agent that processes 10,000 customer support tickets per day. Each ticket requires a reasoning step to classify priority (high/medium/low) and route to the right team. Using GPT-4o at $5/1M input tokens and $15/1M output tokens, calculate the daily cost difference between: (a) direct prompting, (b) zero-shot CoT, and (c) 3-sample self-consistency. Assume average input is 200 tokens, direct output is 20 tokens, CoT output is 150 tokens. At what error rate does the cost of self-consistency become justified if each misrouted ticket costs $12 in human time to fix?

#### Coding

**Adaptive reasoning engine.** Extend the Reasoning Engine to include a feedback loop: after the answer is used (simulated by a correctness signal), update a local database tracking which strategy worked best for which task type. Over time, the engine should learn that "arithmetic with 4+ variables" needs self-consistency while "simple classification" is fine with direct prompting. Implement this with a SQLite database storing (task\_embedding, strategy, was\_correct) tuples and a nearest-neighbor lookup for strategy selection.

#### Design

**Reasoning for a medical triage agent.** Design the reasoning architecture for an agent that triages emergency room patients based on described symptoms. The agent must: (1) never miss a life-threatening condition, (2) produce an auditable reasoning trace for legal compliance, (3) operate within 5 seconds per patient. Which combination of reasoning strategies would you use? Where would you use CoT vs. self-consistency vs. reflection? How would you handle the case where the model is uncertain about a potentially critical symptom? Draw the decision flowchart and justify each strategy choice in terms of the safety/latency/cost tradeoffs.