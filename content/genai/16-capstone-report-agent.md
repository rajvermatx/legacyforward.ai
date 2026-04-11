---
title: "Capstone II: Autonomous Report Agent"
slug: "capstone-report-agent"
description: "Build an autonomous multi-agent system that researches a topic, gathers data from multiple sources, synthesizes findings, and produces a structured report — a practitioner's end-to-end agentic project."
section: "genai"
order: 16
badges:
  - "LangGraph Workflows"
  - "Multi-Agent Design"
  - "Tool Integration"
  - "Guardrails"
  - "Human-in-the-Loop"
  - "Report Generation"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai/16-capstone-report-agent.ipynb"
---

## 01. Agent Architecture

![Diagram 1](/diagrams/genai/capstone-report-agent-1.svg)

Report Agent workflow — Planner → Human Approval → Researcher (with tools) → Synthesizer → Writer → Reviewer (loops back on issues)

The system mirrors a real research team. The **Planner agent** takes the user's topic and breaks it into research sub-tasks. The **Researcher agent** has access to web search, document retrieval, and data APIs to gather raw information. The **Synthesizer agent** takes the collected research notes and produces structured analysis. The **Writer agent** transforms the analysis into a well-formatted report with sections, citations, and visualizations. The **Reviewer agent** checks the report for factual consistency, proper citations, and quality.

>**Think of it like this:** This system works like a consulting firm. The project manager (Planner) scopes the work, researchers go gather evidence, an analyst (Synthesizer) makes sense of the data, a writer turns it into a polished deliverable, and an editor (Reviewer) does quality control before it goes to the client. The LangGraph state machine is the project management tool that keeps everyone on track.

These agents are orchestrated by a **LangGraph state machine** that defines the workflow: plan, research, synthesize, write, review. If the reviewer finds issues, the workflow loops back for corrections. A human-in-the-loop checkpoint lets the user review the research plan before the system spends time and API credits executing it.

**Why this matters:** This capstone brings together nearly every concept from the course: LLM APIs, prompt engineering, tool use, RAG, LangGraph orchestration, guardrails, evaluation, and deployment. The supervisor pattern (central orchestrator routing to specialized agents) provides predictability and debuggability — each agent has a clear role, and you can inspect the state at any point.

The **state** is the central data structure that flows through every node:

```
from typing import TypedDict, Annotated
from langgraph.graph import add_messages

class ReportState(TypedDict):
    topic: str                          # User's report topic
    plan: dict                          # Research plan from Planner
    plan_approved: bool                 # Human approval flag
    research_notes: list[dict]          # Raw findings from Researcher
    analysis: str                       # Synthesized analysis
    report: str                         # Final report (Markdown)
    review_feedback: str                # Reviewer's feedback
    review_passed: bool                 # Quality gate
    revision_count: int                 # Track revision loops
    messages: Annotated[list, add_messages]
    budget_used: float                  # Cost tracking ($)
    errors: list[str]                   # Error log
```

The state grows as each agent contributes. The `revision_count` prevents infinite loops — after 3 revisions, the system accepts as-is and flags for human review. The `budget_used` field tracks accumulated API costs to enforce spending limits.

## 02. Research Agent & Tools

The Research agent is the workhorse — it gathers information using a curated tool belt. Each tool is a well-defined function that the agent can call: web search, RAG retrieval (reusing the Document Portal from Capstone I), and structured data APIs.

**Why this matters:** The agent uses the ReAct pattern — it reasons about what information it needs, selects a tool, observes the results, and decides whether to search further. This is autonomous decision-making with real tool calls, not just text generation. The agent is bounded with a maximum number of tool calls per question and content filters on sources.

```
from langchain_core.tools import tool
from openai import AsyncOpenAI
import httpx, json

@tool
async def web_search(query: str) -> str:
    """Search the web for information on a topic.
    Returns summaries of the top 5 results."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.tavily.com/search",
            params={"query": query, "max_results": 5, "api_key": TAVILY_KEY}
        )
        results = resp.json()["results"]
    return "\n\n".join(
        f"[{r['title']}]({r['url']})\n{r['content']}" for r in results
    )

@tool
async def rag_retrieve(query: str, collection: str = "default") -> str:
    """Search uploaded documents using RAG.
    Returns relevant passages with citations."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "http://localhost:8000/query",
            json={"question": query, "collection": collection}
        )
        data = resp.json()
    sources = "\n".join(f"- {s['filename']} p.{s['page']}" for s in data.get("sources", []))
    return f"{data['answer']}\n\nSources:\n{sources}"

@tool
async def fetch_data(url: str, description: str) -> str:
    """Fetch structured data from a public API endpoint."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=15.0)
        resp.raise_for_status()
    return f"Data from {url}:\n{resp.text[:5000]}"

@tool
def save_note(title: str, content: str, sources: list[str]) -> str:
    """Save a research finding as a structured note."""
    return json.dumps({"title": title, "content": content, "sources": sources})

RESEARCH_TOOLS = [web_search, rag_retrieve, fetch_data, save_note]
```

The Research agent wraps these tools in a ReAct loop with budget controls:

```
class ResearchAgent:
    def __init__(self, tools, max_steps: int = 10):
        self.client = AsyncOpenAI()
        self.tools = {t.name: t for t in tools}
        self.max_steps = max_steps
        self.tool_schemas = [
            {"type": "function", "function": {
                "name": t.name, "description": t.description,
                "parameters": t.args_schema.schema()
            }} for t in tools
        ]

    async def research_question(self, question: str, context: str = "") -> list[dict]:
        messages = [{
            "role": "system",
            "content": "You are a thorough research agent. Use tools to gather "
                       "comprehensive information. Save each finding as a note "
                       "with proper source citations. Stop when you have sufficient evidence."
        }, {
            "role": "user",
            "content": f"Context: {context}\n\nQuestion: {question}"
        }]
        notes = []
        for step in range(self.max_steps):
            resp = await self.client.chat.completions.create(
                model="gpt-4o", messages=messages,
                tools=self.tool_schemas, tool_choice="auto"
            )
            msg = resp.choices[0].message
            messages.append(msg)
            if not msg.tool_calls:
                break
            for tc in msg.tool_calls:
                tool_fn = self.tools[tc.function.name]
                args = json.loads(tc.function.arguments)
                result = await tool_fn.ainvoke(args)
                messages.append({"role": "tool", "tool_call_id": tc.id, "content": str(result)})
                if tc.function.name == "save_note":
                    notes.append(json.loads(result))
        return notes
```

## 03. LangGraph Orchestration

LangGraph is the conductor of the multi-agent orchestra. The orchestration defines a **graph** where each node is an agent and each edge is a transition. The review node has a **conditional edge** — if the review passes, the workflow ends; if it fails, it routes back to the Synthesizer.

**Why this matters:** LangGraph provides state persistence (the workflow can be paused and resumed), human-in-the-loop checkpoints (the system pauses for approval before spending API credits on research), and conditional routing (self-correcting quality loops). These are production requirements, not nice-to-haves.

```
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

async def plan_node(state: ReportState) -> dict:
    client = AsyncOpenAI()
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": "Create a research plan. Output JSON with keys: 'title', "
                       "'sections' (list with 'heading' and 'questions'), 'estimated_sources'."
        }, {"role": "user", "content": f"Topic: {state['topic']}"}],
        response_format={"type": "json_object"}
    )
    plan = json.loads(resp.choices[0].message.content)
    return {"plan": plan, "budget_used": state["budget_used"] + 0.03}

async def research_node(state: ReportState) -> dict:
    agent = ResearchAgent(RESEARCH_TOOLS, max_steps=8)
    all_notes = []
    for section in state["plan"]["sections"]:
        for question in section["questions"]:
            notes = await agent.research_question(
                question, context=f"Report: {state['plan']['title']}, Section: {section['heading']}"
            )
            all_notes.extend(notes)
    return {"research_notes": all_notes, "budget_used": state["budget_used"] + len(all_notes) * 0.05}

async def synthesize_node(state: ReportState) -> dict:
    client = AsyncOpenAI()
    notes_text = "\n\n".join(
        f"### {n['title']}\n{n['content']}\nSources: {', '.join(n['sources'])}"
        for n in state["research_notes"]
    )
    feedback = f"\n\nPrevious review feedback:\n{state['review_feedback']}" if state.get("review_feedback") else ""
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": "Synthesize research notes into structured analysis. "
                       "Identify key themes, contradictions, and gaps. Include all citations."
        }, {"role": "user", "content": f"Plan: {json.dumps(state['plan'])}\n\nNotes:\n{notes_text}{feedback}"}],
        max_tokens=4000
    )
    return {"analysis": resp.choices[0].message.content}

async def write_node(state: ReportState) -> dict:
    client = AsyncOpenAI()
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": "Write a professional report in Markdown. Include: title, executive summary, "
                       "table of contents, detailed sections with [N] citations, and a references section."
        }, {"role": "user", "content": f"Plan:\n{json.dumps(state['plan'])}\n\nAnalysis:\n{state['analysis']}"}],
        max_tokens=8000
    )
    return {"report": resp.choices[0].message.content}

async def review_node(state: ReportState) -> dict:
    client = AsyncOpenAI()
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": "Review this report for factual accuracy, proper citations, logical flow, "
                       "completeness, and quality. Output JSON: 'passed' (bool), 'score' (1-10), 'feedback'."
        }, {"role": "user", "content": state["report"]}],
        response_format={"type": "json_object"}
    )
    review = json.loads(resp.choices[0].message.content)
    return {"review_passed": review["passed"], "review_feedback": review["feedback"],
            "revision_count": state["revision_count"] + 1}

def should_revise(state: ReportState) -> str:
    if state["review_passed"]:
        return "end"
    if state["revision_count"] >= 3:
        return "end"
    return "revise"

# --- Build Graph ---
graph = StateGraph(ReportState)
graph.add_node("planner", plan_node)
graph.add_node("researcher", research_node)
graph.add_node("synthesizer", synthesize_node)
graph.add_node("writer", write_node)
graph.add_node("reviewer", review_node)

graph.set_entry_point("planner")
graph.add_edge("planner", "researcher")
graph.add_edge("researcher", "synthesizer")
graph.add_edge("synthesizer", "writer")
graph.add_edge("writer", "reviewer")
graph.add_conditional_edges("reviewer", should_revise, {"revise": "synthesizer", "end": END})

checkpointer = MemorySaver()
app = graph.compile(checkpointer=checkpointer, interrupt_before=["researcher"])
```

The `interrupt_before=["researcher"]` is the key to human-in-the-loop. The graph pauses before research, displays the plan for user approval, and only proceeds when the user confirms.

## 04. Report Generation

The Writer agent transforms raw analysis into a polished, professional document. The generated report follows a standard structure: executive summary, table of contents, detailed sections with evidence and citations, and a conclusion with recommendations. Each claim is backed by a numbered citation tracing back to the original source.

**Why this matters:** Using structured output (Pydantic models) guarantees the LLM output matches your schema exactly, eliminating JSON parsing errors and ensuring every report has the required sections.

```
from pydantic import BaseModel, Field
import markdown
from pathlib import Path

class ReportSection(BaseModel):
    heading: str
    content: str
    key_findings: list[str]

class StructuredReport(BaseModel):
    title: str
    executive_summary: str
    sections: list[ReportSection]
    conclusion: str
    references: list[str]
    generated_at: str

class ReportFormatter:
    def to_markdown(self, report: StructuredReport) -> str:
        parts = [f"# {report.title}\n", f"*Generated: {report.generated_at}*\n",
                 f"## Executive Summary\n\n{report.executive_summary}\n",
                 "## Table of Contents\n"]
        for i, sec in enumerate(report.sections, 1):
            parts.append(f"{i}. [{sec.heading}](#section-{i})")
        parts.append("")
        for i, sec in enumerate(report.sections, 1):
            parts.append(f'## {i}. {sec.heading}\n')
            parts.append(sec.content + "\n")
            if sec.key_findings:
                parts.append("**Key Findings:**")
                for f in sec.key_findings:
                    parts.append(f"- {f}")
                parts.append("")
        parts.append(f"## Conclusion\n\n{report.conclusion}\n")
        parts.append("## References\n")
        for i, ref in enumerate(report.references, 1):
            parts.append(f"[{i}] {ref}")
        return "\n".join(parts)

    def to_html(self, md_content: str) -> str:
        html_body = markdown.markdown(md_content, extensions=["tables", "toc"])
        return f"""<!DOCTYPE html>
<html><head><style>
  body {{ font-family: Georgia, serif; max-width: 800px;
         margin: 40px auto; padding: 0 20px; line-height: 1.8; }}
  h1 {{ color: #1a1a2e; border-bottom: 2px solid #f59e0b; }}
  h2 {{ color: #16213e; margin-top: 2em; }}
</style></head><body>{html_body}</body></html>"""
```

## 05. Guardrails & Human-in-the-Loop

Guardrails keep the autonomous agent from going off the rails. We implement three categories: **budget guardrails** track and limit API spending, **content guardrails** scan for prohibited content (legal advice, PII, overconfident claims), and **quality guardrails** verify that citations are valid and the report stays on-topic.

**Why this matters:** A research agent with access to paid APIs can easily spend $50+ on a single report if left unchecked. The budget guard and HITL approval gate are not optional — they are essential production safeguards.

```
from dataclasses import dataclass
import re

@dataclass
class BudgetGuard:
    max_budget: float = 5.0

    def check(self, state: ReportState) -> dict:
        used = state["budget_used"]
        if used >= self.max_budget:
            return {"allowed": False, "reason": "Budget exhausted", "action": "skip_to_synthesis"}
        if used >= self.max_budget * 0.8:
            return {"allowed": True, "warning": f"Budget ${self.max_budget - used:.2f} remaining"}
        return {"allowed": True}

class ContentGuard:
    PROHIBITED = [
        (r"\b\d{3}-\d{2}-\d{4}\b", "ssn_detected"),
        (r"(?i)(guaranteed|certainly will|100% effective)", "overconfident_claim"),
    ]

    def scan(self, text: str) -> list[dict]:
        issues = []
        for pattern, issue_type in self.PROHIBITED:
            if re.search(pattern, text):
                issues.append({"type": issue_type, "severity": "high" if "ssn" in issue_type else "medium"})
        return issues

class CitationGuard:
    def verify(self, report: str, sources: list[dict]) -> dict:
        cited = set(re.findall(r"\[(\d+)\]", report))
        available = set(str(i) for i in range(1, len(sources) + 1))
        invalid = cited - available
        return {"valid": len(invalid) == 0, "invalid_citations": list(invalid),
                "citation_coverage": len(cited) / max(len(available), 1)}
```

Human-in-the-loop checkpoint management:

```
async def run_report_agent(topic: str) -> str:
    config = {"configurable": {"thread_id": "report-1"}}
    initial = {"topic": topic, "budget_used": 0.0, "revision_count": 0,
               "errors": [], "research_notes": [], "plan_approved": False}

    # Phase 1: Run until HITL interrupt (after planner)
    state = await app.ainvoke(initial, config)

    print("=== Research Plan ===")
    print(json.dumps(state["plan"], indent=2))

    approval = input("Approve plan? (yes/no/edit): ")
    if approval.lower() == "no":
        return "Plan rejected by user."

    # Phase 2: Resume execution
    await app.aupdate_state(config, {"plan_approved": True})
    final_state = await app.ainvoke(None, config)
    return final_state["report"]
```

## 06. Evaluation & Deployment

**Why this matters:** Without evaluation, you have no way to know if the agent produces good reports. Without deployment infrastructure, the system cannot run reliably.

The evaluation framework scores reports across multiple dimensions:

```
class ReportEvaluator:
    def __init__(self):
        self.client = AsyncOpenAI()

    async def evaluate(self, state: ReportState) -> dict:
        scores = {}
        report = state["report"]
        scores["has_executive_summary"] = "executive summary" in report.lower()
        scores["has_conclusion"] = "conclusion" in report.lower()
        scores["has_references"] = "references" in report.lower()
        scores["word_count"] = len(report.split())

        citations = re.findall(r"\[\d+\]", report)
        paragraphs = [p for p in report.split("\n\n") if len(p) > 100]
        scores["citation_density"] = len(citations) / max(len(paragraphs), 1)

        resp = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "system",
                "content": "Score this report 1-10 on each dimension. "
                           "Output JSON: {clarity, depth, accuracy, actionability, citations, overall, feedback}"
            }, {"role": "user", "content": f"Topic: {state['topic']}\n\n{report}"}],
            response_format={"type": "json_object"}
        )
        scores["llm_eval"] = json.loads(resp.choices[0].message.content)
        scores["cost"] = state["budget_used"]
        scores["revisions"] = state["revision_count"]
        return scores
```

| Evaluation Dimension | Target Score | How to Improve |
| --- | --- | --- |
| Clarity | 8+ | Better writer system prompt, add examples |
| Depth | 7+ | More research steps, broader tool set |
| Accuracy | 9+ | Stronger citation guardrails, fact-checking |
| Actionability | 7+ | Add "recommendations" section to prompt |
| Citation Coverage | >80% | Enforce citations in writer prompt |
| Cost Efficiency | <$3/report | Use GPT-4o-mini for planning, cache searches |

The deployment wraps everything in a FastAPI service with WebSocket progress updates:

```
from fastapi import FastAPI, WebSocket
import json

report_app = FastAPI(title="Report Agent API")

@report_app.websocket("/ws/generate")
async def generate_report(ws: WebSocket):
    await ws.accept()
    data = await ws.receive_json()
    topic = data["topic"]
    config = {"configurable": {"thread_id": data.get("id", "ws-1")}}

    await ws.send_json({"type": "status", "stage": "planning"})
    state = await app.ainvoke(
        {"topic": topic, "budget_used": 0, "revision_count": 0,
         "errors": [], "research_notes": []}, config
    )

    await ws.send_json({"type": "approval_needed", "plan": state["plan"]})
    approval = await ws.receive_json()
    if not approval.get("approved"):
        await ws.send_json({"type": "cancelled"})
        return

    await ws.send_json({"type": "status", "stage": "researching"})
    await app.aupdate_state(config, {"plan_approved": True})
    final = await app.ainvoke(None, config)

    evaluator = ReportEvaluator()
    scores = await evaluator.evaluate(final)

    await ws.send_json({"type": "complete", "report": final["report"],
                        "scores": scores, "cost": final["budget_used"]})
    await ws.close()
```

## Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** I built an autonomous multi-agent system that takes a research topic, breaks it into sub-questions, dispatches specialized agents to gather data from web search, APIs, and RAG sources, then synthesizes everything into a structured, cited report. The orchestration layer uses LangGraph to model the workflow as a state machine with conditional routing, retry logic, and human-in-the-loop approval gates. A dedicated review agent scores the draft on completeness, accuracy, and coherence before the final report is delivered, and guardrails enforce budget limits, content policies, and citation requirements throughout the pipeline.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| How do you coordinate multiple agents without them duplicating work? | Do you understand shared state, task decomposition, and deduplication in multi-agent systems? |
| What happens when one agent fails or returns low-quality data? | Can you design fault-tolerant orchestration with retries, fallbacks, and quality gates? |
| How did you decide which parts require human approval? | Do you understand the trade-off between full autonomy and human-in-the-loop control? |
| How do you ensure the final report is factually grounded? | Can you implement citation tracking, hallucination checks, and a review agent? |
| How would you adapt this system for a different domain? | Is your architecture modular enough to swap tools, prompts, and evaluation criteria? |

### Model Answers

**Multi-Agent Orchestration:** The system uses LangGraph to define a directed graph where each node is a specialized agent. Edges are conditional so the Reviewer can loop the draft back to the Writer if quality thresholds are not met. Shared state carries accumulated evidence and section drafts so agents never duplicate work.

**Tool Integration:** Each agent has a curated tool set. Tool calls are wrapped in retry-with-backoff and results are cached so repeated queries for the same sub-topic are instant. A budget guardrail tracks cumulative LLM spend and halts execution if the pipeline exceeds the configured limit.

**Quality and Safety:** The Reviewer agent uses a multi-dimensional rubric scoring completeness, factual grounding, coherence, and citation density. If any dimension falls below threshold, the draft routes back for revision with specific feedback. Human-in-the-loop interrupts are placed before research starts so the user approves the plan before spending API credits. Content guardrails filter PII and overconfident claims at every generation step.

### Common Mistakes

-   **No exit condition on agent loops:** Allowing the Reviewer-Writer loop to run indefinitely burns tokens and can cause infinite cycles. Always set a maximum iteration count and a graceful fallback.
-   **Conflating orchestration with prompting:** Trying to manage multi-step workflows purely through prompt chaining instead of an explicit state machine makes the system fragile and nearly impossible to debug or extend.
-   **Skipping citation validation:** Generating a report without verifying that every claim traces back to a retrieved source produces authoritative-looking text that may be entirely hallucinated.

Previous

[15 · Capstone I: Document Portal](15-capstone-document-portal.html)

Complete

[Back to Home](index.html)

All Modules Complete
