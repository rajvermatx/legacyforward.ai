---
title: "Capstone: Research Assistant Agent"
slug: "capstone-research-assistant"
description: "Build a multi-step research assistant agent that accepts a research question, autonomously gathers information from multiple sources, synthesizes the findings, and produces a structured research brief. This capstone integrates RAG, agentic reasoning, and tool use."
section: "legacyforward-compendium"
order: 63
part: "Part VII — Capstones"
---

Part VII — Capstones

# Capstone: Research Assistant Agent

The research assistant agent is the "Hello World" of agentic AI — approachable enough to build in a focused sprint, complex enough to demonstrate all the core agentic patterns. It requires tool use (web search, document retrieval), multi-step reasoning (planning a research approach, following up on discoveries), and synthesis (combining multiple sources into a coherent output). Building it correctly teaches the fundamentals that transfer to every more complex agentic system.

## Scenario

An enterprise analyst team receives frequent research requests: competitive analysis, regulatory landscape reviews, market sizing questions. Currently, analysts spend hours on each request — searching, reading, synthesizing, writing. The research assistant agent handles the routine research workflow, producing structured research briefs that analysts can review and refine rather than writing from scratch.

## Architecture

**Components:**
- Planner LLM: decomposes the research question into sub-queries
- Web search tool: retrieves current information from web sources
- Vector store retrieval tool: retrieves relevant internal documents
- Synthesis LLM: produces the final research brief from gathered information
- Evaluation step: verifies that the brief addresses the original question

**Execution flow:**
1. Receive research question
2. Planner decomposes into 3–5 specific sub-queries covering different aspects of the question
3. Agent executes each sub-query using web search and/or internal document retrieval
4. Agent collects results, noting source quality and relevance
5. Synthesis LLM produces a structured brief with sections addressing each aspect of the question, with citations
6. Evaluation step checks brief completeness against the original question
7. Brief is returned to the analyst with sources

## Implementation

**System prompt (Planner):**
```
You are a research planning assistant. Given a research question, decompose it into 3–5 specific sub-queries that together cover the key aspects of the question. Each sub-query should be specific enough to return useful results from a web search. Return the sub-queries as a JSON array.
```

**Tool definitions:**
```python
tools = [
    {
        "name": "web_search",
        "description": "Search the web for current information. Use for questions that require recent data, news, or public information.",
        "parameters": {"query": {"type": "string", "description": "The search query"}}
    },
    {
        "name": "internal_search",
        "description": "Search internal document repository for organizational knowledge. Use for questions about internal processes, past projects, or organizational context.",
        "parameters": {"query": {"type": "string"}}
    }
]
```

**Synthesis prompt:**
```
You are a research analyst. Based on the following research findings, write a structured research brief that addresses the original question. The brief should include: an executive summary (3 sentences), key findings (5–7 bullet points), and a section on limitations and gaps. Cite sources inline using [Source N] notation.

Original question: {question}
Research findings: {findings}
```

## Key Learning Points

**Planning quality determines output quality.** A vague plan produces vague research. Spend iteration cycles improving the planner's decomposition before optimizing the synthesizer.

**Source quality must be assessed.** The agent needs heuristics for distinguishing high-quality sources (official publications, research institutions, primary sources) from low-quality ones (marketing content, unsourced claims). Include source quality assessment in the tool result processing.

**Completeness verification catches missing coverage.** The evaluation step that checks whether the brief addresses the original question catches the common failure mode where the agent answers the questions it found easy, not the question that was asked.

**Iteration budget matters.** Set a maximum iteration count (typically 8–12 sub-queries and follow-ups) to prevent the agent from running indefinitely on ambiguous research questions.
