---
title: "What Is Agentic AI?"
slug: "what-is-agentic-ai"
description: "Agentic AI moves beyond question-answering to goal-directed action. Understanding what agents actually are — and what distinguishes them from chatbots and automation scripts — is the prerequisite for building and evaluating them effectively."
section: "ai-beyond-the-demo"
order: 45
part: "Part V — Agentic Systems"
---

Part V — Agentic Systems

# What Is Agentic AI?

The term "agentic AI" is used to describe systems ranging from simple prompt chains to fully autonomous multi-agent orchestrations. The range obscures a genuine concept: an AI system that takes sequences of actions toward a goal, using tools, memory, and reasoning to navigate uncertainty. Understanding what agentic AI actually is — and what distinguishes it from the AI patterns covered in Parts III and IV — is the starting point for building and deploying agents effectively.

## 45.1 The Defining Characteristics of Agents

An AI system is agentic when it exhibits three characteristics:

**Goal direction.** The agent operates toward a goal that is specified at a level of abstraction above specific actions. "Research competitor pricing and produce a summary report" is a goal. The specific actions required to achieve it — which search queries to run, which sources to retrieve, how to synthesize the results — are determined by the agent, not by the programmer. Contrast with a chatbot that answers a specific question: the user specifies the query, the system provides the answer, the interaction is complete.

**Multi-step action.** The agent takes multiple sequential actions, each informed by the results of prior actions. The sequence is not predetermined — the agent decides what to do next based on what it has learned so far. A research agent might search for information, discover that the initial results are insufficient, formulate a more specific query, retrieve additional sources, and synthesize the combined results. The number of steps and their sequence are determined at runtime, not at design time.

**Tool use.** The agent has access to tools — functions it can call to interact with the world — that extend its capability beyond text generation. Tools might include web search, database queries, code execution, file operations, API calls, or human input requests. Tool use is what makes agents capable of affecting external systems, not just generating text.

An AI system that lacks any of these three characteristics is not agentic in the meaningful sense. A RAG chatbot is not agentic — it answers a specific question using retrieved context, but it does not take multi-step goal-directed actions. A workflow automation script is not agentic — it takes predetermined steps without goal-directed reasoning.

## 45.2 The Agentic Spectrum

Agentic AI exists on a spectrum of autonomy and complexity:

**Level 1 — Assisted agent.** The agent suggests actions for a human to approve before execution. Every action requires human confirmation. The agent's role is to reduce the human's cognitive load by proposing what to do next; the human retains full control over what actually happens.

**Level 2 — Supervised agent.** The agent executes actions autonomously within predefined boundaries, but escalates to a human when it encounters situations outside its authority — actions that exceed a cost or risk threshold, ambiguous situations where it cannot determine the appropriate action, or situations where it has low confidence in its next step.

**Level 3 — Autonomous agent.** The agent executes actions autonomously without human intervention within its defined capability domain. Human review happens after the fact — through monitoring, audit, and periodic spot-checking — rather than before each action.

**Level 4 — Multi-agent system.** Multiple autonomous agents collaborate, with some agents orchestrating others. A supervisor agent decomposes a complex goal into sub-goals and assigns them to specialized worker agents. The supervisor synthesizes the workers' outputs into a final result.

Enterprise deployment of agentic AI typically begins at Level 1 or 2, where human oversight limits the blast radius of agent errors, and progressively moves to higher autonomy levels as the agent's reliability is demonstrated.

## 45.3 What Problems Agentic AI Solves

Agentic AI solves a specific class of problem that simpler AI patterns cannot: tasks that require adaptive multi-step reasoning in the face of uncertain information.

**Research and synthesis.** A research task that requires identifying relevant sources, evaluating their credibility, extracting relevant information, resolving contradictions across sources, and synthesizing a coherent output cannot be accomplished in a single LLM call. An agent that can search, retrieve, evaluate, and iterate until it has sufficient information to synthesize is the appropriate architecture.

**Complex data operations.** A data operation that requires understanding the data to determine what operations are needed — identifying anomalies, deciding how to handle exceptions, transforming data based on content-dependent rules — benefits from agentic reasoning rather than predetermined data pipelines.

**Multi-system coordination.** A business process that touches multiple systems — retrieving data from one, processing it, writing results to another, notifying stakeholders — can be orchestrated by an agent that understands the process goal and adapts to the state of each system rather than following a rigid script.

**Customer or employee assistance.** A virtual assistant that helps users accomplish goals — planning, troubleshooting, completing complex multi-step tasks — requires the ability to take sequences of actions on behalf of the user rather than simply answering questions.

## 45.4 Enterprise Readiness Requirements

Agentic AI raises the enterprise readiness bar above what is required for simpler AI patterns. Before deploying agents in production:

**Defined action boundaries.** What can the agent do? What is it explicitly prohibited from doing? These boundaries must be specified, implemented as tool-level constraints, and validated through adversarial testing.

**Audit infrastructure.** Every action the agent takes must be logged with sufficient detail to reconstruct the agent's reasoning and the state of each system before and after the action. Agents without audit trails cannot be investigated when they cause errors.

**Human escalation paths.** For every situation type the agent might encounter, define the escalation path — how the agent signals that it needs human assistance, and how that assistance is requested and delivered.

**Failure modes and recovery.** Define the recovery action for each category of agent failure: what does the agent do if a tool call fails? What does it do if it exceeds its iteration budget? What does it do if it reaches a state where it cannot make progress? Agents without defined failure handling take undefined actions in undefined states.

**Progressive deployment.** Do not deploy agents at full autonomy before establishing that they perform reliably at supervised autonomy. The progression from Level 1 to Level 3 should be earned through demonstrated reliability, not assumed from development testing.

Part V builds on this foundation with the specific patterns that make agents reliable, maintainable, and production-worthy.
