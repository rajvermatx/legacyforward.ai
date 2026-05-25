---
title: "Tool Use — Giving Agents Access to the World"
slug: "tool-use"
description: "An agent without tools is just a text generator. How you design those tools — what you expose, how precisely you define them, how failures are handled — determines whether your agent is trustworthy enough to run unsupervised."
section: "ai-beyond-the-demo"
order: 48
part: "Part V — Agentic Systems"
---

Part V — Agentic Systems

# Tool Use — Giving Agents Access to the World

An agent without tools can only generate text. Tools are what give agents the ability to retrieve information, execute code, interact with external systems, and affect the world beyond the conversation window. But tool design is one of the most consequential and most underestimated aspects of agent architecture. Poorly designed tools produce agents that use the wrong tool at the wrong time, generate incorrect arguments, and fail in ways that are difficult to debug. Well-designed tools produce agents that are predictable, reliable, and auditable.

## 48.1 How Tool Calling Works

Modern LLM APIs implement tool calling through a structured interaction pattern:

1. The developer defines tools as JSON schemas — each tool has a name, a description, and a parameters object that specifies what arguments the tool accepts.
2. The tool definitions are included in the API call alongside the prompt.
3. The LLM generates either a text response or a tool call — a structured object specifying the tool name and the argument values to pass.
4. The developer's code detects the tool call, executes the specified tool with the specified arguments, and passes the result back to the model as a tool result.
5. The model continues reasoning with the tool result in its context.

The critical insight: the LLM does not execute tools. It generates a description of what tool call to make, and developer code executes the actual tool. The LLM has no direct access to external systems — all external access goes through tools that the developer controls.

This architecture means that tool security is developer responsibility: the developer decides what tools to expose, what authorization those tools enforce, and what the tools actually do when called.

## 48.2 Tool Design Principles

**Write descriptions as instructions, not labels.** The LLM selects tools based on their descriptions. A tool named "search" with the description "Search the web" will be used less accurately than one with the description: "Search the web for current information about a specific query. Use this tool when you need recent information that may not be in your training data, or when you need to verify a specific fact. Do not use this tool for questions that can be answered from your training knowledge."

**Define parameters with precision.** Each parameter in the tool's JSON schema should have a clear description that explains what value is expected, what format it should be in, and what the parameter is used for. Vague parameter descriptions cause the LLM to pass incorrect argument values.

**Design for the happy path and the error path equally.** Every tool call can fail — the API is unavailable, the query returns no results, the required resource does not exist. Define explicit return structures for both success and failure cases. Return structured errors that the LLM can reason about, not Python exceptions or HTTP status codes alone.

**Avoid tool overlap.** When multiple tools serve similar purposes, the LLM may consistently choose the wrong one. If you have both a "search web" tool and a "search knowledge base" tool, the LLM must understand precisely when to use each. Make the distinction in the descriptions explicit and concrete.

**Limit the tool set.** Agents with fewer, well-defined tools perform more reliably than agents with many tools that partially overlap. For any agent task, identify the minimum set of tools required and provide only those. Additional tools add selection complexity without adding capability.

## 48.3 Error Handling Patterns

Tool failures are not exceptional conditions — they are normal occurrences in production agent operation. APIs rate-limit, databases time out, search queries return no results. Agent architecture must handle tool failures gracefully.

**Retry with backoff.** For transient failures (API rate limits, network timeouts), implement automatic retry with exponential backoff before surfacing the error to the agent. Many transient failures resolve on retry without requiring the agent to change its approach.

**Structured error feedback.** When a tool fails, return a structured error that explains what went wrong and, where possible, suggests what the agent should do instead. "No results found for query X. Try a broader query or check the search term spelling" is more useful than "Error: 404".

**Fallback tools.** For critical capabilities, define a fallback tool that provides a degraded but functional alternative when the primary tool fails. A web search fallback might use a different search provider; a database query fallback might use cached results.

**Error threshold escalation.** If an agent fails on the same tool call N times, escalate to a human rather than continuing to retry. Agents that retry indefinitely on unresolvable errors waste resources and delay human intervention.

**Graceful partial completion.** Agents that fail partway through a multi-step task should return the results of the steps that completed successfully along with the explanation of where the task stopped. A partial result with a clear explanation is more useful than no result with a generic error message.

## 48.4 Tool Categories for Enterprise Agents

Enterprise agents typically require tools from several functional categories:

**Information retrieval:**
- Web search (for current, public information)
- Vector store retrieval (for organizational knowledge base)
- Database query (for structured enterprise data)
- Document retrieval (for specific documents by identifier)
- API GET calls (for current state of external systems)

**Code and computation:**
- Code execution (Python, SQL, data analysis)
- Mathematical calculation
- Data transformation and validation

**State modification:**
- Database write (create, update, delete records)
- API POST/PUT/DELETE (create or modify external state)
- File write (create or modify files)
- Message send (email, Slack, Teams notifications)

**Human interaction:**
- Confirmation request (ask a human to approve an action)
- Information request (ask a human for input the agent cannot determine autonomously)
- Escalation (notify a human that the agent cannot complete the task)

**State modification tools require special treatment.** Because they have side effects that may be irreversible, state modification tool calls should be logged in full detail (which tool, what arguments, what result, which user or system initiated the agent session), and high-stakes state modifications should require human confirmation before execution.

The tool architecture for an enterprise agent is essentially the agent's API surface — what the agent can do in the world. Designing it with the same rigor applied to any consequential API produces agents that are predictable, auditable, and safe to operate in production.
