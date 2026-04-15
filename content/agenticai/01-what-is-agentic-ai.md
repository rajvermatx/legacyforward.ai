---
title: "What Is Agentic AI?"
slug: "what-is-agentic-ai"
description: "A Fortune 500 retailer deployed a chatbot that could answer questions about return policies. Within six months they tried to make it process actual returns, modify shipping addresses, and issue refunds. It could do none of those things — and the failure wasn't a bug. It was an architecture that was "
section: "agenticai"
order: 1
part: "Part 01 Foundations"
---

Part 1 — Foundations

# What Is Agentic AI?

A Fortune 500 retailer deployed a chatbot that could answer questions about return policies. Within six months they tried to make it process actual returns, modify shipping addresses, and issue refunds. It could do none of those things. The failure was not a bug. It was an architecture that was never designed for agency.

### What You Will Learn

-   Define agentic AI and distinguish it from conventional AI systems
-   Map any system onto the autonomy spectrum — from deterministic scripts to multi-agent swarms
-   Identify the four properties that make a system genuinely agentic
-   Explain why large language models unlocked practical agency after decades of AI research
-   Recognize agentic and non-agentic patterns in real-world production systems
-   Build an Autonomy Classifier that scores any system description on the agency spectrum

## 1.1 The Chatbot That Couldn't Act

In early 2024, a major US retailer — let us call them NovaMart — celebrated the rollout of their customer service chatbot. Powered by a fine-tuned large language model, the system could answer questions about store hours, return windows, product availability, and shipping estimates. Customer satisfaction scores for these interactions hovered around 87%, a meaningful improvement over the previous FAQ search bar. By every reasonable metric, the chatbot was a success.

Six months later, the product team proposed an ambitious upgrade: let the chatbot actually *do* things. Instead of merely explaining the return policy, it would initiate returns. Instead of quoting shipping timelines, it would modify delivery addresses. Instead of directing customers to a phone line for refunds, it would issue them. The CEO signed off. Engineering estimated four weeks.

Eight months and three failed launches later, the project was shelved. The chatbot could not reliably determine *when* to act versus when to ask for clarification. It could not maintain context across a multi-step return workflow. It had no mechanism for checking its own work — an incorrect refund of $4,200 to the wrong customer was the final straw. Post-mortem analysis identified a root cause that had nothing to do with model quality or prompt engineering. The system was architecturally incapable of agency.

NovaMart's chatbot was a **reactive system**. It received a question, generated a response, and forgot everything. It had no goals, no ability to plan a sequence of steps, no tools to interact with external systems, and no way to evaluate whether its actions succeeded. The team was trying to bolt agency onto a system that had been designed, from its very foundation, as a sophisticated text-completion engine.

This story is not unusual. Across industries, organizations are discovering the same gap: the distance between a system that can *talk about* actions and a system that can *take* them is not a feature gap. It is an architectural chasm. Understanding that chasm, what lies on either side of it, and how to cross it, is the subject of this chapter.

## 1.2 Defining Agency

The word "agent" has been used in computer science for decades, from software agents in 1990s distributed systems to reinforcement learning agents in game-playing research. In the context of modern AI, we need a precise definition that distinguishes genuinely agentic systems from the marketing-driven use of the word.

An **agentic AI system** is a software system that uses a language model (or other foundation model) as its core reasoning engine, and that exhibits four properties:

1.  **Goal-directedness.** The system pursues an objective over multiple steps, rather than responding to a single input with a single output. It maintains an internal representation of what it is trying to achieve and can assess progress toward that goal.
2.  **Autonomy.** The system makes decisions about what to do next without requiring human input at every step. The degree of autonomy varies — some agents ask for approval at critical junctures, others operate fully independently — but some autonomous decision-making is always present.
3.  **Tool use.** The system interacts with external systems, APIs, databases, file systems, or other resources to gather information and take actions in the world. Without tool use, a system can reason but cannot act.
4.  **Adaptive reasoning.** The system adjusts its approach based on the results of its actions. When a tool call fails, when new information contradicts an assumption, or when a sub-goal turns out to be irrelevant, the system re-plans rather than blindly continuing.

These four properties exist on a continuum. A system with weak goal-directedness and limited tool use is "slightly agentic." A system with strong autonomous planning, rich tool integration, and sophisticated error recovery is "highly agentic." The binary question, "Is this system an agent?", is less useful than the graded question: "How agentic is this system, and is that the right level of agency for the problem it solves?"

> Under the hood
> 
> The four-property definition we use here aligns closely with the framework proposed by Shunyu Yao et al. in the ReAct paper (2022) and later formalized by research groups at Google DeepMind and Anthropic. Earlier definitions from the multi-agent systems literature (Wooldridge and Jennings, 1995) included properties like "social ability" and "proactiveness" — concepts that map onto our "tool use" and "goal-directedness" respectively, but that were defined before LLMs existed as practical reasoning engines.

### What agency is not

Precision requires us to also state what agency is *not*. A system is not agentic merely because it uses a large language model. ChatGPT, in its default conversational mode, is not an agent. It is a reactive system that generates a single response to a single prompt. A system is not agentic merely because it chains multiple LLM calls together. A pipeline that summarizes a document, then translates the summary, then formats the output is a **chain**, not an agent, because there is no branching decision logic, no re-planning, and no tool interaction with the external world. A system is not agentic merely because a human markets it as one. The label matters less than the architecture.

## 1.3 The Autonomy Spectrum

Rather than drawing a sharp line between "agent" and "not agent," it is more productive to think about a **spectrum of autonomy**. Every software system that involves computation can be placed somewhere on this spectrum, from fully deterministic scripts at one end to autonomous multi-agent swarms at the other. Understanding where a system falls — and where it *should* fall — is one of the most important architectural decisions you will make.

![Diagram 1](/diagrams/agenticai/what-is-agentic-ai-1.svg)

Figure 1.1 — The autonomy spectrum. Systems to the right of the dashed line exhibit genuine agency: goal-directed behavior, autonomous decisions, tool use, and adaptive re-planning.

### Level 0: Scripts

At the leftmost end of the spectrum sit deterministic scripts. A bash script that runs `rsync` every night at 2 AM, a Python ETL job that extracts data from a database and writes it to a CSV, a GitHub Actions workflow that runs tests on every push — these are fully deterministic systems. Given the same inputs, they produce the same outputs. They involve no language models, no decision-making, and no adaptability. When they encounter an error, they crash or retry according to hardcoded logic.

Scripts are not agentic, but they are extraordinarily valuable. The overwhelming majority of production software falls into this category, and for good reason: determinism is a feature, not a limitation. When you need a system to do exactly the same thing every time, a script is the correct architectural choice. One of the most common mistakes in the current AI landscape is replacing a reliable script with an unreliable agent.

### Level 1: Chains

One step rightward on the spectrum, we find **chains** — sequences of LLM calls where the output of one call feeds into the input of the next. A chain might take a customer email, use one LLM call to classify the intent, another to draft a response, and a third to check the response for policy compliance. Each step uses a language model, but the *sequence* of steps is fixed at design time.

Chains are common in production systems, and frameworks like LangChain popularized the pattern. They are more flexible than scripts because the LLM introduces non-determinism at each step. The same email might be classified differently on two runs. But chains are not agentic, because the system never decides *what to do next*. The developer decided that at design time. The chain cannot skip a step, add a step, or choose between alternative paths based on intermediate results.

> Common mistake
> 
> Many teams conflate "uses an LLM" with "is agentic." A three-step LLM chain with no branching logic, no tool calls, and no re-planning is simply a pipeline — a sophisticated one, but a pipeline nonetheless. Calling it an "agent" creates false expectations about its capabilities and leads to the kind of architectural mismatch that doomed NovaMart's chatbot.

### Level 2: Agents

An **agent** is a system that uses a language model to decide what to do next. This is the critical distinction. Where a chain follows a fixed path, an agent follows a *dynamic* path determined at runtime by the LLM's reasoning. The system receives a goal ("process this customer's return"), reasons about what steps are needed, executes those steps using tools, observes the results, and decides whether to continue, re-plan, or terminate.

Consider a coding assistant like GitHub Copilot Workspace or Cursor's agent mode. When you describe a feature you want to implement, the system does not follow a fixed three-step pipeline. It reads relevant files, decides which ones to modify, generates code changes, runs tests, reads the test output, adjusts the code if tests fail, and iterates until the tests pass or it determines it cannot make progress. The number of steps, the specific files read, the order of operations — all of this is determined at runtime by the model's reasoning.

Agents exhibit all four properties of agency: they pursue goals (implement the feature), make autonomous decisions (which files to edit), use tools (file system, test runner, linter), and adapt to feedback (fixing failing tests). The key insight is that the *control flow itself* emerges from the model's reasoning rather than being hardcoded by the developer.

### Level 3: Multi-agent systems

At the far right of the spectrum, we find **multi-agent systems** — architectures where multiple agents collaborate to solve a problem. Each agent has its own role, tools, and reasoning process, and they communicate with each other through message passing, shared state, or a supervisory agent that coordinates their work.

A research assistant system might include a "planner" agent that breaks a research question into sub-tasks, a "searcher" agent that queries web APIs and academic databases, a "reader" agent that extracts key findings from retrieved papers, and a "writer" agent that synthesizes everything into a coherent report. Each agent operates semi-independently, and the supervisor routes tasks between them based on the current state of the research.

Multi-agent systems add coordination complexity on top of individual agent complexity. They introduce new failure modes: agents can disagree, work at cross purposes, or enter infinite delegation loops. They also introduce new capabilities: specialization (each agent can be optimized for its role), parallelism (multiple agents can work simultaneously), and redundancy (multiple agents can verify each other's work). We will explore these patterns in depth in Part 3.

## 1.4 Why Now? The LLM Inflection Point

The concept of autonomous software agents is not new. Researchers have been building goal-directed, tool-using, adaptive systems since at least the 1980s. The Stanford Research Institute's STRIPS planner (1971), the BDI (Belief-Desire-Intention) architecture of the 1990s, and decades of work in multi-agent systems all laid theoretical groundwork. So why is agentic AI suddenly practical?

The answer is that large language models solved, or dramatically reduced, four problems that had blocked practical agency for decades:

### Problem 1: Natural language understanding

Older agent architectures required goals and observations to be expressed in formal, structured languages. A BDI agent could reason about `has(customer, return_request, item_id=4521)`, but it could not reason about "Hey, I bought this jacket last week and it's way too big — can I swap it for a medium?" LLMs bridge the gap between human-natural communication and machine-processable structure. They can interpret ambiguous, incomplete, context-dependent natural language and translate it into the kind of structured representations that planning algorithms require.

### Problem 2: Flexible tool use

Pre-LLM agents required developers to write explicit code mapping every possible situation to the appropriate tool call. If the agent encountered a situation the developer had not anticipated, it was stuck. LLMs, by contrast, can be given a description of available tools and figure out which one to use, with what arguments, in what order — including for situations that were never explicitly programmed. The model's broad training on code, documentation, and human reasoning gives it a kind of "common sense" about tool use that was previously impossible to engineer.

### Problem 3: Plan generation and repair

Classical planning algorithms (STRIPS, PDDL, HTN planners) require a complete, formal model of the world — every possible state, every possible action, every possible effect. Building such models for real-world domains is prohibitively expensive. LLMs can generate plausible plans from natural language descriptions and, crucially, can *repair* plans when they fail. "The API returned a 429 rate limit error — I should wait 30 seconds and retry, or try the alternative endpoint" is the kind of adaptive reasoning that would have required hundreds of hand-coded rules in a classical system.

### Problem 4: Generalization across domains

Pre-LLM agents were typically domain-specific. A medical diagnosis agent could not be repurposed for financial analysis without rebuilding it from scratch. LLMs, trained on vast corpora spanning every domain, can reason about medical records, legal contracts, software codebases, and financial statements without domain-specific retraining. This general-purpose reasoning ability means that the *same* agent architecture — the same loop of perceive, reason, act, observe — can be applied across wildly different domains simply by changing the tools and the system prompt.

> Under the hood
> 
> The critical capability that makes LLM-based agents practical is not raw intelligence — it is **instruction following**. The RLHF (Reinforcement Learning from Human Feedback) and instruction-tuning techniques developed between 2022 and 2024 transformed LLMs from text completion engines into systems that can reliably follow structured instructions, output JSON, and respect constraints. Without instruction following, you have a creative text generator. With it, you have a reasoning engine that can drive an agent loop.

## 1.5 Agentic vs. Non-Agentic: A Detailed Comparison

To sharpen the distinction between agentic and non-agentic systems, let us walk through the same task — processing a customer return — as handled by systems at each level of the autonomy spectrum.

### The task

A customer named Maria sends an email: "Hi, I ordered a blue wool sweater (order #8812) two weeks ago. The color is way darker than what was shown online. I'd like to return it for a refund, but I've already thrown away the packaging. Is that going to be a problem?"

### Script approach

A script-based system would parse the email using regex or keyword matching, extract the order number, look up the order in the database, check if it falls within the return window, and generate a template response. It would either approve or deny the return based on rigid rules. It would have no way to handle Maria's question about the missing packaging, because that conditional was never programmed. The system would likely either ignore the question entirely or reject the return because "packaging not confirmed."

### Chain approach

A chain-based system would use an LLM to classify the email intent (return request), extract structured data (order number, reason, concern about packaging), look up the order, generate a policy-aware response, and check it for tone. This is better — the LLM can understand the packaging question and include relevant policy information in the response. But the chain cannot *do* anything. It can generate a helpful reply, but it cannot initiate the return, check packaging policy exceptions, or coordinate with the warehouse.

### Agent approach

An agentic system would reason through the request step by step. First, it would parse the email and identify the customer's intent and concerns. Then it would use a tool to look up order #8812 and verify it is within the return window. Next, it would query the return policy database for packaging exceptions — discovering that packaging is not required for defective or misrepresented items. It would determine that a color discrepancy qualifies as misrepresentation. It would then use the returns API to initiate the return, generate a prepaid shipping label, compose a personalized response to Maria explaining that packaging is not needed in her case, and send the email. If the returns API failed, it would re-plan — perhaps escalating to a human agent or trying an alternative workflow.

The agent did not follow a predetermined path. It decided at each step what to do next based on the information it gathered. The packaging question triggered a policy lookup that a chain would not have known to make. The color discrepancy triggered a classification (misrepresentation) that influenced the policy logic. Each decision was made by the LLM reasoning about the current state, not by a developer anticipating every possible scenario.

### Multi-agent approach

A multi-agent system might handle the same request by routing it to a triage agent, which identifies it as a return request and delegates to a returns specialist agent. The specialist agent processes the return while a compliance agent simultaneously checks that the return follows regulatory requirements (important in some jurisdictions). A quality assurance agent reviews the final customer communication before it is sent. If the specialist agent encounters an edge case, it can consult a policy expert agent rather than attempting to reason through complex policy logic on its own.

> Production consideration
> 
> More agency is not always better. The script approach processes returns in milliseconds with 100% predictability. The agent approach might take 15-30 seconds, costs money in API calls, and introduces the possibility of errors that a deterministic system would never make. The right level of agency depends on the complexity and variability of the task. If 95% of returns follow the same simple path, a script with a "needs human review" escape hatch might be more cost-effective and reliable than a full agent.

## 1.6 The Anatomy of an Agent

Every agentic system, regardless of its complexity or domain, is built from four fundamental components: **perception**, **memory**, **reasoning**, and **action**. These components interact in a continuous loop. The agent perceives its environment, consults and updates its memory, reasons about what to do next, takes an action, and then perceives the result of that action. This loop continues until the agent achieves its goal, determines it cannot make progress, or exceeds a resource budget.

![Diagram 2](/diagrams/agenticai/what-is-agentic-ai-2.svg)

Figure 1.2 — The four components of an agentic system. The LLM core drives the perceive-reason-act loop, with memory providing persistent context and the feedback loop enabling adaptive behavior.

### Perception

The perception layer is how the agent takes in information from the world. At the start of an agent's run, perception typically involves parsing the user's request — understanding what is being asked, extracting key entities and constraints, and forming an initial representation of the task. As the agent executes, perception also includes interpreting the results of tool calls: reading an API response, parsing a database query result, extracting text from a document, or observing error messages from a failed operation.

In LLM-based agents, perception is largely handled by the language model itself. The model's ability to interpret natural language, parse structured data like JSON, and make sense of error messages means that the perception layer is often implicit rather than explicit. However, well-designed agents include preprocessing steps that format raw inputs into representations the model can reason about effectively — converting a raw HTTP response into a clean summary, for example, or extracting only the relevant fields from a large database record.

### Memory

Memory gives the agent context beyond the current turn. Without memory, every step of the agent's execution would be independent, with no access to what happened previously. Memory in LLM-based agents typically exists at two levels:

-   **Short-term memory** (also called working memory or the scratchpad) is the conversation history that accumulates during a single agent run. It includes the original user request, every tool call and its result, every intermediate reasoning step, and any observations the agent has made. In most implementations, short-term memory is simply the context window of the LLM: the growing sequence of messages that the model sees at each step.
-   **Long-term memory** persists across runs and sessions. This might include a vector database of previously encountered problems and their solutions, a user profile with preferences and history, or a knowledge base of domain-specific information. Long-term memory is what allows an agent to learn from experience and personalize its behavior over time.

Memory management is one of the most challenging aspects of agent design. The LLM's context window is finite, and as an agent takes more steps, the accumulated history can exceed that window. Strategies for managing this, including summarization, retrieval-augmented generation, and priority-based truncation, are the subject of Chapter 7.

### Reasoning

Reasoning is the agent's decision-making engine — the component that looks at the current state (what do I know, what have I tried, what was the result) and determines what to do next. In LLM-based agents, reasoning is performed by the language model itself. The quality of an agent's reasoning depends on the model's capability, the design of the system prompt, and the reasoning pattern employed.

The simplest reasoning pattern is **ReAct** (Reasoning + Acting), where the model alternates between thinking steps ("I need to look up the order to check the return window") and action steps (calling the order lookup API). More sophisticated patterns include Chain-of-Thought (explicit step-by-step reasoning before acting), Tree-of-Thought (exploring multiple reasoning paths in parallel), and Reflection (the model critiques its own reasoning to catch errors). These patterns are covered in detail in Chapter 5.

### Action

The action layer is how the agent affects the world. In LLM-based agents, actions are almost always implemented as **tool calls** — structured function calls that the model generates and the runtime executes. Tools can be anything: API calls, database queries, file operations, web searches, calculations, code execution, or even calls to other models. The action layer also includes generating final outputs to the user — the response text, a generated document, a code change, or any other artifact.

The design of the tool interface is critical. Tools must be described clearly enough that the model can figure out when and how to use them. Their outputs must be formatted so the model can interpret them. And their side effects must be managed carefully — an agent that can call a "delete database" tool needs guardrails around when that tool can be invoked. We will cover tool design in Chapter 6 and security considerations in Chapter 14.

## 1.7 Real-World Agentic Systems

Agentic AI is not a theoretical concept — it is deployed in production at scale today. Understanding where and how agents are being used provides concrete anchors for the abstract concepts we have discussed. The following examples span multiple industries and illustrate different points on the autonomy spectrum.

### Software development: Coding assistants

Tools like GitHub Copilot (in agent mode), Cursor, and Claude Code represent some of the most mature agentic AI systems in production. These systems receive high-level task descriptions ("add a dark mode toggle to the settings page"), read codebases, generate multi-file code changes, run tests, interpret errors, and iterate until the implementation is complete. They exhibit strong goal-directedness, extensive tool use (file system, terminal, linter, test runner), and adaptive reasoning (modifying approach based on test failures).

These systems are instructive because they also illustrate the limits of agency. They work best with clear, well-scoped tasks and a comprehensive test suite that provides unambiguous feedback. Open-ended tasks ("make the architecture better") or tasks in codebases with poor test coverage frequently produce suboptimal results, because the agent lacks a reliable signal for evaluating its own progress.

### Healthcare: Clinical decision support

Agentic systems in healthcare operate under uniquely strict constraints. A clinical decision support agent might ingest a patient's medical history, lab results, and current symptoms; query a medical knowledge base for relevant differential diagnoses; cross-reference with drug interaction databases; and generate a structured recommendation for a physician. The critical architectural decision in healthcare agents is the placement of **human-in-the-loop checkpoints** — points where the agent must pause and wait for a clinician's approval before proceeding. No responsible healthcare agent operates without these gates.

### Finance: Automated research and compliance

Financial institutions deploy agentic systems for tasks like earnings analysis (ingesting earnings call transcripts, comparing stated metrics against SEC filings, flagging discrepancies), portfolio rebalancing (monitoring market conditions against investment theses and generating trade recommendations), and compliance monitoring (scanning internal communications for regulatory violations). These systems demonstrate that agency does not require full autonomy — most financial agents operate in an "advisory" mode where they research, analyze, and recommend, but a human makes the final decision.

### Customer support: End-to-end resolution

The most commercially impactful agentic AI deployments are arguably in customer support, where companies like Klarna, Intercom, and Sierra have deployed agents that handle millions of customer interactions per month. These agents go beyond answering questions — they look up orders, process returns, apply discounts, modify subscriptions, and escalate edge cases to human agents. Klarna reported in 2024 that their AI agent handled two-thirds of customer service conversations in its first month, performing the equivalent work of 700 full-time human agents.

### Legal: Contract analysis and due diligence

Legal agentic systems demonstrate the value of multi-step reasoning over domain-specific knowledge. A due diligence agent might receive a set of contracts for an acquisition, systematically read each document, extract key terms (liability caps, indemnification clauses, change-of-control provisions), compare them against standard benchmarks, identify unusual or risky provisions, and generate a structured report with specific page and section references. The agent's ability to maintain context across dozens of documents while tracking cross-references is something that would take a junior attorney days of work.

> Under the hood
> 
> A pattern across all of these examples: the most successful agentic deployments are in domains with **clear success criteria**. A coding agent knows if tests pass. A returns agent knows if the return was processed. A compliance agent can check its findings against regulatory rules. Domains where success is subjective or ambiguous — creative writing, strategic planning, therapy — remain much harder for agentic systems, because the agent has no reliable way to evaluate its own progress.

## 1.8 The Agency Tax: What You Pay for Autonomy

Agency is not free. Every step up the autonomy spectrum brings capabilities, but it also imposes costs that must be weighed against those capabilities. Responsible system design requires clear-eyed accounting of the **agency tax**.

### Latency

A script returns results in milliseconds. A chain completes in seconds. An agent, making multiple LLM calls interspersed with tool calls, might take 30 seconds to several minutes. Multi-agent systems can take even longer. For real-time applications like autocomplete or fraud detection, this latency may be unacceptable.

### Cost

Each LLM call in an agent loop costs money. A single agent run that involves 10 reasoning steps, each consuming 2,000 input tokens and 500 output tokens, costs significantly more than a single prompt-response interaction. Multi-agent systems multiply this cost by the number of agents involved. At scale, the per-interaction cost of agentic systems can be orders of magnitude higher than deterministic alternatives.

### Non-determinism

Agents do not do the same thing every time. Given the same input, an agent might take different paths, call tools in a different order, and produce different outputs. This non-determinism makes testing, debugging, and auditing significantly harder than with deterministic systems. In regulated industries, the inability to guarantee reproducible behavior can be a dealbreaker.

### New failure modes

Agents can fail in ways that scripts and chains cannot. They can enter infinite loops (repeatedly calling the same tool and getting the same error). They can hallucinate tool names or arguments. They can "forget" their goal partway through a long execution. They can take actions with irreversible consequences based on flawed reasoning. Each of these failure modes requires specific mitigations — timeouts, output validation, action confirmation gates, and more — that add engineering complexity.

### Observability requirements

When a script fails, you read the log line. When an agent fails, you need to reconstruct a multi-step reasoning trace, understand why the model made each decision, identify where reasoning went wrong, and determine whether the failure was due to the model, the tools, the prompt, or the data. Agentic systems require fundamentally more sophisticated observability infrastructure than conventional software.

None of these costs argue against building agentic systems. They argue for building them *deliberately*, with a clear understanding of which problems actually require agency and which are better served by simpler approaches. The project at the end of this chapter provides a framework for making that determination.

## Project: Autonomy Classifier

In this project, you will build an **Autonomy Classifier** — a tool that takes a natural language description of any AI system and classifies it on the autonomy spectrum. The classifier will analyze the system description for evidence of the four agency properties (goal-directedness, autonomy, tool use, adaptive reasoning) and produce a scored assessment with a recommended classification (Script, Chain, Agent, or Multi-Agent).

### What you will build

-   A Python function that accepts a system description as input
-   An LLM-powered analysis pipeline that evaluates each of the four agency properties on a 0-3 scale
-   A classification engine that maps the composite score to a position on the autonomy spectrum
-   A structured output that includes the classification, per-property scores, and a brief explanation of the reasoning

### Core implementation

```
import openai
import json
from dataclasses import dataclass

@dataclass
class AutonomyAssessment:
    classification: str          # "Script", "Chain", "Agent", "Multi-Agent"
    overall_score: float         # 0.0 - 3.0
    goal_directedness: int       # 0-3
    autonomy: int                # 0-3
    tool_use: int                # 0-3
    adaptive_reasoning: int      # 0-3
    explanation: str

CLASSIFIER_PROMPT = """You are an AI systems analyst. Given a description of a software
system, evaluate it on four dimensions of agency, each scored 0-3:

1. Goal-directedness (0=no goals, 1=implicit fixed goal, 2=explicit tracked goal,
   3=multiple dynamic goals)
2. Autonomy (0=no decisions, 1=per-step LLM, 2=dynamic routing, 3=full self-direction)
3. Tool use (0=none, 1=hardcoded integrations, 2=model-selected tools,
   3=tool discovery/composition)
4. Adaptive reasoning (0=no adaptation, 1=simple retry, 2=re-planning on failure,
   3=self-reflection and strategy shifts)

Based on the composite score, classify the system:
- 0.0 - 0.7: Script
- 0.8 - 1.5: Chain
- 1.6 - 2.4: Agent
- 2.5 - 3.0: Multi-Agent

Respond with valid JSON matching this schema:
{
  "goal_directedness": int,
  "autonomy": int,
  "tool_use": int,
  "adaptive_reasoning": int,
  "classification": string,
  "explanation": string
}"""

def classify_system(description: str) -> AutonomyAssessment:
    """Classify an AI system on the autonomy spectrum."""
    client = openai.OpenAI()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": CLASSIFIER_PROMPT},
            {"role": "user", "content": description}
        ],
        response_format={"type": "json_object"},
        temperature=0.2
    )
    result = json.loads(response.choices[0].message.content)
    scores = [
        result["goal_directedness"],
        result["autonomy"],
        result["tool_use"],
        result["adaptive_reasoning"]
    ]
    return AutonomyAssessment(
        classification=result["classification"],
        overall_score=round(sum(scores) / len(scores), 2),
        goal_directedness=result["goal_directedness"],
        autonomy=result["autonomy"],
        tool_use=result["tool_use"],
        adaptive_reasoning=result["adaptive_reasoning"],
        explanation=result["explanation"]
    )
```

### Example usage

```
description = """
Our system monitors a Kubernetes cluster. Every 5 minutes, it uses an LLM to
analyze recent pod logs and metrics. If it detects an anomaly, it decides
whether to scale up replicas, restart a pod, or alert a human. It checks
whether its action resolved the anomaly and tries a different approach if
the first one didn't work. It uses kubectl, Prometheus API, and PagerDuty.
"""

assessment = classify_system(description)
print(f"Classification: {assessment.classification}")
print(f"Overall score:  {assessment.overall_score}")
print(f"  Goal-directedness:  {assessment.goal_directedness}/3")
print(f"  Autonomy:           {assessment.autonomy}/3")
print(f"  Tool use:           {assessment.tool_use}/3")
print(f"  Adaptive reasoning: {assessment.adaptive_reasoning}/3")
print(f"\n{assessment.explanation}")
```

### Domain variants

Apply the Autonomy Classifier to systems in your chosen domain. Each variant includes three system descriptions to classify — one that should score as a Chain, one as an Agent, and one as a Multi-Agent system.

| Domain | Chain | Agent | Multi-Agent |
| --- | --- | --- | --- |
| Tech / Software | CI/CD pipeline | Coding assistant | Incident responder |
| Healthcare | Triage chatbot | Diagnosis support | Care coordinator |
| Finance | Report generator | Trading advisor | Compliance monitor |
| Education | Quiz generator | Tutoring system | Curriculum planner |
| E-commerce | Product describer | Shopping assistant | Fulfillment agent |
| Legal | Contract summarizer | Research agent | Negotiation system |

## Summary

This chapter established the conceptual foundation for everything that follows in this book. We began with a concrete failure — a chatbot that could not act — and used it to motivate a precise definition of agentic AI. We mapped the autonomy spectrum from deterministic scripts through chains and agents to multi-agent systems, and we examined the four properties that distinguish genuinely agentic systems: goal-directedness, autonomy, tool use, and adaptive reasoning. We explored why large language models were the catalyst that made practical agency possible after decades of research, and we surveyed real-world agentic systems in production today. Finally, we introduced the agency tax — the costs in latency, money, predictability, and engineering complexity that come with increased autonomy.

1.  **Agency is a spectrum, not a binary.** Systems range from fully deterministic scripts to autonomous multi-agent swarms. The right level of agency depends on the problem, not on what is technically possible.
2.  **Four properties define agency.** Goal-directedness, autonomy, tool use, and adaptive reasoning. A system must exhibit all four to some degree to be genuinely agentic.
3.  **LLMs solved the practical barriers.** Natural language understanding, flexible tool use, plan generation and repair, and cross-domain generalization — these four capabilities turned decades of agent research from theory into deployable systems.
4.  **More agency is not always better.** The agency tax — latency, cost, non-determinism, new failure modes, and observability requirements — means that simpler approaches should be preferred when they suffice.
5.  **Architecture determines capability.** You cannot bolt agency onto a system that was designed as a reactive chatbot. The decision to build an agentic system must be made at the architectural level, not as an afterthought.

### Exercises

#### Conceptual

**Agency audit.** Choose three AI-powered products you use regularly (e.g., a writing assistant, a search engine, a recommendation system). For each one, evaluate it against the four properties of agency. Where does each fall on the autonomy spectrum? Are any of them marketed as "agents" despite lacking one or more agency properties? Write a one-paragraph assessment for each.

#### Coding

**Batch classifier with visualization.** Extend the Autonomy Classifier to accept a JSON file containing multiple system descriptions. For each description, produce the classification and scores. Then generate a visualization (using matplotlib or a simple HTML report) that plots all systems on the autonomy spectrum, with the four property scores shown as a radar chart for each system. This will be useful in later chapters when we need to decide which architectural pattern to apply.

#### Design

**Agency migration plan.** Think of a real system at your organization (or a hypothetical one) that is currently a script or chain but would benefit from being more agentic. Design a migration plan that answers: (1) What specific capabilities does agency unlock? (2) What is the minimum viable level of agency needed? (3) What new failure modes must be mitigated? (4) How will you test and observe the agentic behavior? (5) What is the rollback plan if the agent performs worse than the current system? Present your plan as a one-page architecture decision record (ADR).

> **See also:** For how AI agents fit into enterprise architecture and large-scale orchestration strategies, see *The AI-First Enterprise*, Chapter 11: AI Agents and Orchestration.
