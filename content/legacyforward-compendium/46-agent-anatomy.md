---
title: "Agent Anatomy — Memory, Tools, Reasoning"
slug: "agent-anatomy"
description: "Every agent is built from the same three components: memory systems that give it context, tools that give it capability, and a reasoning loop that connects them. Understanding how these components work and interact is what distinguishes architects who build reliable agents from those who build unpredictable ones."
section: "legacyforward-compendium"
order: 46
part: "Part V — Agentic Systems"
---

Part V — Agentic Systems

# Agent Anatomy — Memory, Tools, Reasoning

Agents look complex from the outside but are built from a small set of composable components. Every agent — from the simplest research helper to a multi-agent orchestration that automates a business process — is constructed from memory systems, tools, and a reasoning loop. Understanding these components individually and how they interact explains both how agents accomplish complex tasks and why they fail in the specific ways they do.

### What You Will Learn

- The four memory types that agents use and when each applies
- Tool design patterns that make agents reliable rather than fragile
- The reasoning loop and how it connects memory and tools
- The interaction effects between components that produce common agent failure modes

## 46.1 Memory Systems

Agent memory is not a single thing — it is four distinct types of storage with different characteristics and appropriate uses.

**In-context memory.** The agent's context window is the most immediate form of memory: everything in the current prompt — the system prompt, the conversation history, retrieved documents, tool call results, and the agent's reasoning traces — is in-context memory. In-context memory is fast (the model has immediate access to everything in its context window) but bounded (the context window has a maximum size) and ephemeral (it does not persist across agent sessions). For most agents, in-context memory is the primary working memory.

**External memory (vector store).** Documents, prior conversation summaries, and accumulated knowledge are stored in a vector database and retrieved semantically when the agent needs them. External memory is unbounded in storage but requires explicit retrieval — the agent must know to search for relevant information, and the retrieval must succeed. External memory is appropriate for agents that need access to large knowledge bases or that accumulate knowledge across sessions.

**Episodic memory (session logs).** Structured logs of prior agent sessions — what the agent did, what the results were, what errors occurred — stored in a retrievable format. Episodic memory allows agents to learn from experience across sessions: "I tried this approach before and it failed because X; I should try Y instead." Episodic memory requires deliberate implementation and is not included in most off-the-shelf agent frameworks.

**Procedural memory (fine-tuning).** Knowledge encoded directly in the model's weights through fine-tuning. Procedural memory is not retrieved at inference time — it is baked into the model. Fine-tuning is appropriate for domain-specific skills and knowledge that the agent needs consistently across all sessions, not for knowledge that changes over time.

**Memory design tradeoffs:** In-context memory is simplest but bounded. External memory scales but requires retrieval to work correctly. Episodic memory enables improvement over time but adds implementation complexity. Most production agents use in-context memory as the primary working memory, external memory for knowledge base access, and rely on the model's pre-training for general procedural knowledge.

## 46.2 Tools

Tools are the interfaces through which agents interact with the world outside the model. Tool design is one of the most consequential decisions in agent architecture — poorly designed tools make agents unreliable, fragile, and difficult to debug.

**Tool types:**

Information retrieval tools return data to the agent without side effects — web search, database query, vector store lookup, API GET calls. These tools are safe to call multiple times and safe to call without confirmation, because they do not change any external state.

State-modifying tools change external state — database writes, API POST/PUT/DELETE calls, file modifications, message sending. These tools have side effects that may be irreversible. Agent design should require confirmation before state-modifying tool calls in high-stakes or irreversible categories.

Computation tools perform deterministic computation — code execution, mathematical calculation, data transformation. These tools have predictable behavior and are safe to retry.

Human input tools request information or decisions from a human. These tools introduce latency (waiting for human response) but enable the agent to handle situations that exceed its autonomous capability.

**Tool design principles:**

Single purpose: each tool should do one thing and do it clearly. Multi-purpose tools that handle multiple operations based on input parameters are harder for the LLM to use correctly.

Explicit error returns: tools should return structured errors that the agent can reason about, not exceptions that crash the agent loop. The agent needs to know why a tool call failed in order to adapt.

Idempotency: where possible, design tools to be safe to call multiple times with the same arguments. Agents retry failed tool calls; non-idempotent tools that execute side effects on retry cause problems.

Documentation: the agent selects tools based on their descriptions. Tool descriptions must be precise enough that the agent can correctly determine when to use each tool and what arguments to provide.

## 46.3 The Reasoning Loop

The reasoning loop is the architectural pattern that connects memory and tools into agentic behavior. The most common reasoning pattern is ReAct (Reasoning and Acting):

1. **Observe:** The agent receives the current state — the goal, the conversation history, prior observations, and any new input.
2. **Reason:** The agent generates a reasoning trace ("Given the current state, the next step should be...") that makes its decision process explicit.
3. **Act:** The agent selects a tool and generates the arguments for the tool call.
4. **Observe:** The agent receives the tool's output and adds it to its context.
5. **Repeat** until the goal is achieved or the agent determines it cannot make further progress.

**Loop termination:** The agent loop must have defined termination conditions. Natural termination: the agent determines that the goal is achieved and generates a final response. Budget termination: the agent reaches the maximum iteration count, maximum token budget, or maximum time limit. Error termination: the agent encounters an unrecoverable error and escalates to a human. Without explicit termination conditions, agent loops can continue indefinitely.

**Context management in the loop:** As the reasoning loop iterates, the context window fills with tool results and reasoning traces. Agents that run many iterations must manage context growth — summarizing prior iteration results, pruning irrelevant content, and ensuring that the most important information remains accessible. Context overflow mid-loop is a common agent failure mode that is entirely preventable with deliberate context management.

## 46.4 Interaction Effects and Failure Modes

The interaction between memory, tools, and the reasoning loop produces failure modes that cannot be predicted by analyzing each component independently.

**Context poisoning:** An early tool call returns incorrect information. The agent's subsequent reasoning is built on this incorrect foundation, producing compounded errors. The final output is confidently wrong in a way that is difficult to trace without step-by-step reasoning traces.

**Tool hallucination:** The agent generates plausible tool call arguments for a tool that does not support them, or generates calls to tools that do not exist. This produces tool errors that the agent may handle by hallucinating a plausible tool response rather than escalating. Tool hallucination is more common when tool documentation is ambiguous.

**Stuck loops:** The agent cannot make progress — it keeps trying the same tool with the same arguments, getting the same failure, without finding an alternative approach. Stuck loops require explicit detection (the agent is making the same tool call for the Nth time) and forced escalation.

**Goal drift:** Over many iterations, the agent's behavior drifts from the original goal toward sub-goals that were encountered along the way. The agent completes a related task but not the original one. Goal drift is prevented by including the original goal prominently in each iteration of the reasoning loop.

Understanding these failure modes allows architects to design agents with the mitigation strategies built in — structured logging that makes context poisoning traceable, tool validation that prevents hallucination, loop detectors that catch stuck loops, and goal anchoring that prevents drift.
