---
title: "Capstone 1: Research Assistant"
slug: "capstone-01"
description: "A senior analyst at a mid-size consulting firm spends four hours each morning on the same ritual: open twelve browser tabs, skim a handful of reports, copy key figures into a spreadsheet, cross-reference claims across sources, and draft a two-page brief that the partner will read in six minutes. The"
section: "agenticai"
order: 16
part: "Part 05 Capstones"
---

Part 5 — Capstones

# Capstone 1: Research Assistant

A senior analyst at a mid-size consulting firm spends four hours each morning on the same ritual: open twelve browser tabs, skim a handful of reports, copy key figures into a spreadsheet, cross-reference claims across sources, and draft a two-page brief that the partner will read in six minutes. The analyst is not slow. The process is. Manual research does not scale because humans are sequential synthesizers working against a combinatorial information space. Every additional source doubles the cross-referencing burden, every conflicting data point demands a judgment call with no audit trail, and every citation must be tracked by hand. Errors compound silently: a misattributed statistic, a stale figure, a missing counterargument. The final report carries an air of authority it has not earned. This capstone builds the system that replaces that morning ritual: a multi-agent research assistant that plans queries, searches the web in parallel, analyzes documents through RAG, synthesizes findings across sources, and produces a cited report ready for human review.

### What You Will Learn

-   Design a supervisor-worker architecture where a planning agent delegates to specialist agents for search, analysis, synthesis, and citation
-   Implement query decomposition that breaks a broad research question into targeted, parallel sub-queries
-   Build a RAG pipeline that chunks retrieved documents, embeds them, and retrieves relevant passages for cross-source analysis
-   Track provenance and citations end-to-end so every claim in the final report links back to its source
-   Orchestrate parallel web searches and merge results without duplication or contradiction
-   Generate a structured research report with sections, summaries, and inline citations

## C1.1 The Problem with Manual Research

Research is not a single task. It is a pipeline with at least five stages: scoping the question, gathering sources, extracting relevant information, synthesizing across sources, and formatting the output with proper attribution. Humans perform all five stages sequentially, and each stage has failure modes that cascade downstream.

Scoping is where most research goes wrong before it starts. A vague question like “What is the current state of quantum computing?” produces thousands of results spanning hardware, algorithms, error correction, commercial applications, and geopolitics. Without decomposing the question into sub-queries, the researcher either drowns in breadth or picks a narrow slice and calls it comprehensive. Gathering is bottlenecked by attention: a human can realistically read and evaluate perhaps twenty sources in a morning. Extraction is error-prone because context switching between documents degrades short-term memory. Synthesis is where the real value lives — identifying agreements, contradictions, and gaps — but it receives the least time because the earlier stages consumed the budget. Attribution is treated as bookkeeping and done last, which means citations are often approximate or missing.

An agentic system inverts this economics. Query planning is cheap (one LLM call). Gathering is parallelizable (ten searches run simultaneously). Extraction is consistent (the same chunking and retrieval logic applies to every document). Synthesis benefits from the LLM’s ability to hold dozens of passages in context simultaneously. And citation tracking is built into the data model from the first retrieved result, not bolted on at the end.

> Why Not a Single Prompt?
> 
> You could paste your question into a chat interface and get a plausible answer. But a single prompt cannot search the live web, cannot verify its claims against primary sources, cannot tell you which of its statements are well-supported and which are interpolated, and cannot show you the trail of evidence that led to each conclusion. A multi-agent architecture makes the research process transparent, auditable, and reproducible.

## C1.2 System Overview

The research assistant is a four-agent system coordinated by a supervisor. Each agent has a narrow responsibility, a defined input/output contract, and access to specific tools. The supervisor never performs research itself — it plans, delegates, monitors progress, and decides when the research is complete.

| Agent | Responsibility | Tools | Output |
| --- | --- | --- | --- |
| **Supervisor** | Decomposes the research question, dispatches sub-tasks, tracks progress, decides completion | None (delegates only) | Task plan, routing decisions, completion signal |
| **Search Agent** | Executes web searches, retrieves URLs, fetches page content | Web search API, URL fetcher, content extractor | List of `Source` objects with URL, title, raw text, retrieval timestamp |
| **Analysis Agent** | Chunks documents, runs RAG retrieval, extracts key claims with page-level citations | Text chunker, embedding model, vector store | List of `Finding` objects with claim text, source ID, relevance score, passage excerpt |
| **Synthesis Agent** | Merges findings, resolves contradictions, identifies gaps, produces narrative sections | LLM (long context) | List of `Section` objects with heading, body text, and inline citation markers |
| **Citation Agent** | Validates every citation marker against the source database, formats the bibliography, flags unsupported claims | Source database lookup | Final `Report` with validated citations and bibliography |

The data flows in a directed graph: the supervisor creates a query plan, the search agent populates the source database, the analysis agent produces findings from those sources, the synthesis agent weaves findings into narrative sections, and the citation agent validates and formats the final output. The supervisor can loop back. If the synthesis agent identifies a gap, the supervisor dispatches additional search queries to fill it.

## C1.3 Architecture Diagram

![Diagram 1](/diagrams/agenticai/capstone-01-1.svg)

Figure C1.1 — Research assistant architecture: supervisor delegates to four specialist agents, each with dedicated tools and data sources. The feedback loop allows iterative refinement when gaps are detected.

## C1.4 Data Models

Before writing any agent logic, define the data contracts. Every agent reads and writes typed objects. This eliminates ambiguity at agent boundaries and makes the system testable at each stage independently.

```
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class SubQuery(BaseModel):
    """A single focused question decomposed from the user's research topic."""
    query: str = Field(description="Targeted search query")
    intent: str = Field(description="What this sub-query aims to discover")
    priority: int = Field(ge=1, le=5, description="1 = highest priority")

class QueryPlan(BaseModel):
    """The supervisor's decomposition of the research question."""
    original_question: str
    sub_queries: list[SubQuery]
    max_sources_per_query: int = 5
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Source(BaseModel):
    """A retrieved web document with provenance metadata."""
    source_id: str = Field(description="Unique identifier, e.g., src-001")
    url: str
    title: str
    raw_text: str
    retrieved_at: datetime
    query_used: str = Field(description="The sub-query that found this source")

class Finding(BaseModel):
    """A claim extracted from a source with its supporting passage."""
    finding_id: str
    claim: str = Field(description="One-sentence factual claim")
    source_id: str
    passage: str = Field(description="Verbatim excerpt supporting the claim")
    relevance_score: float = Field(ge=0.0, le=1.0)

class SectionDraft(BaseModel):
    """A narrative section produced by the synthesis agent."""
    heading: str
    body: str = Field(description="Markdown body with [src-XXX] citation markers")
    finding_ids: list[str] = Field(description="Findings used in this section")

class CitedReport(BaseModel):
    """The final output: sections plus a validated bibliography."""
    title: str
    sections: list[SectionDraft]
    bibliography: list[Source]
    unsupported_claims: list[str] = Field(
        default_factory=list,
        description="Claims the citation agent could not verify"
    )
```

> Design Tip
> 
> Notice that `Finding` stores both the claim and the verbatim passage. This dual representation is intentional. The claim is what the synthesis agent uses to reason; the passage is what the citation agent uses to verify. Separating them means the synthesis agent can paraphrase freely while the citation agent can still check the original text.

## C1.5 Query Planning

The supervisor’s first job is query decomposition. A broad research question like “How is generative AI changing drug discovery?” cannot be answered by a single web search. The supervisor breaks it into sub-queries, each targeting a different facet of the topic.

```
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

PLANNING_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a research planning agent. Given a research question,
decompose it into 3-7 focused sub-queries that together provide comprehensive
coverage. Each sub-query should target a distinct aspect: background context,
current state, key players, recent developments, quantitative data, expert
opinions, and counterarguments.

Return a JSON object matching the QueryPlan schema."""),
    ("human", "Research question: {question}")
])

planner_llm = ChatOpenAI(model="gpt-4o", temperature=0.2)
planner_chain = PLANNING_PROMPT | planner_llm.with_structured_output(QueryPlan)

# Usage
plan = planner_chain.invoke({
    "question": "How is generative AI changing drug discovery?"
})
# plan.sub_queries might include:
#   "generative AI drug discovery market size 2024"
#   "AI-designed molecules clinical trials results"
#   "pharma companies using generative AI for drug candidates"
#   "limitations and risks of AI in pharmaceutical R&D"
#   "regulatory stance on AI-generated drug compounds"
```

The priority field on each sub-query matters. If the system runs under a token budget or time constraint, it processes high-priority queries first and may skip lower-priority ones. This graceful degradation means the system always produces *something* useful, even under resource pressure.

## C1.6 Parallel Web Search

The search agent takes the query plan and executes each sub-query against a web search API. The critical design decision is parallelism: sub-queries are independent, so they should run concurrently.

```
import asyncio
from tavily import AsyncTavilyClient

tavily = AsyncTavilyClient(api_key="tvly-...")

async def search_single_query(sub_query: SubQuery, max_results: int) -> list[Source]:
    """Execute one sub-query and return Source objects."""
    results = await tavily.search(
        query=sub_query.query,
        max_results=max_results,
        include_raw_content=True,
    )
    sources = []
    for i, r in enumerate(results.get("results", [])):
        sources.append(Source(
            source_id=f"src-{sub_query.priority:02d}-{i:02d}",
            url=r["url"],
            title=r["title"],
            raw_text=r.get("raw_content", r.get("content", "")),
            retrieved_at=datetime.utcnow(),
            query_used=sub_query.query,
        ))
    return sources

async def search_all(plan: QueryPlan) -> list[Source]:
    """Run all sub-queries in parallel and deduplicate by URL."""
    tasks = [
        search_single_query(sq, plan.max_sources_per_query)
        for sq in sorted(plan.sub_queries, key=lambda q: q.priority)
    ]
    nested = await asyncio.gather(*tasks)
    all_sources = [s for batch in nested for s in batch]

    # Deduplicate: keep first occurrence of each URL
    seen_urls = set()
    unique = []
    for src in all_sources:
        if src.url not in seen_urls:
            seen_urls.add(src.url)
            unique.append(src)
    return unique
```

> Rate Limits and Cost
> 
> Five sub-queries with five results each means twenty-five web fetches in a single research run. Add a semaphore (`asyncio.Semaphore(3)`) to cap concurrency if your search API enforces rate limits. Also set a per-run budget: if the plan generates more than seven sub-queries, truncate to the highest-priority ones. Unbounded parallelism turns a $0.05 research run into a $2.00 surprise.

## C1.7 Document Chunking and RAG

Raw web pages are noisy. A 5,000-word article may contain only three paragraphs relevant to the research question. The analysis agent chunks each source, embeds the chunks, stores them in a vector database, and retrieves the most relevant passages for each sub-query.

```
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100,
    separators=["\n\n", "\n", ". ", " "],
)

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

def build_vector_store(sources: list[Source]) -> Chroma:
    """Chunk all sources and load into an ephemeral vector store."""
    docs, metadatas = [], []
    for src in sources:
        chunks = splitter.split_text(src.raw_text)
        for i, chunk in enumerate(chunks):
            docs.append(chunk)
            metadatas.append({
                "source_id": src.source_id,
                "url": src.url,
                "title": src.title,
                "chunk_index": i,
            })
    store = Chroma.from_texts(
        texts=docs,
        metadatas=metadatas,
        embedding=embeddings,
        collection_name="research_session",
    )
    return store

def retrieve_for_query(store: Chroma, query: str, k: int = 8) -> list[dict]:
    """Retrieve top-k chunks with metadata."""
    results = store.similarity_search_with_score(query, k=k)
    return [
        {
            "text": doc.page_content,
            "source_id": doc.metadata["source_id"],
            "url": doc.metadata["url"],
            "score": float(score),
        }
        for doc, score in results
    ]
```

The analysis agent then passes each retrieved chunk through an extraction prompt that produces `Finding` objects. The extraction prompt is deliberately narrow: it asks for a single factual claim and the verbatim passage that supports it. This constraint prevents the LLM from hallucinating claims that are not in the source text.

```
EXTRACTION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a precise research analyst. Given a passage from a source
document, extract exactly ONE factual claim supported by the text.

Rules:
- The claim must be directly stated or clearly implied by the passage
- Include the verbatim excerpt that supports the claim (max 200 words)
- Rate relevance to the research question from 0.0 to 1.0
- If the passage contains no relevant claims, return null

Return JSON matching the Finding schema, or null."""),
    ("human", "Research question: {question}\n\nSource ID: {source_id}\n\nPassage:\n{passage}")
])

extraction_chain = EXTRACTION_PROMPT | ChatOpenAI(
    model="gpt-4o-mini", temperature=0
).with_structured_output(Finding | None)
```

## C1.8 Cross-Source Synthesis

The synthesis agent receives all findings and must produce coherent narrative sections. This is the hardest stage because it requires reasoning about agreement, contradiction, and coverage gaps across dozens of findings from different sources.

```
SYNTHESIS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a research synthesis agent. Given a collection of findings
from multiple sources, produce 3-5 narrative sections for a research report.

Requirements:
- Each section has a descriptive heading and 2-4 paragraphs of body text
- Use [src-XXX] citation markers inline wherever you reference a finding
- When sources disagree, present both perspectives and note the contradiction
- Identify gaps: topics the findings do not adequately cover
- Write in a professional, analytical tone suitable for a briefing document
- Do NOT invent facts; every claim must trace to a provided finding

Return a JSON list of SectionDraft objects."""),
    ("human", """Research question: {question}

Findings:
{findings_json}""")
])

synthesis_chain = SYNTHESIS_PROMPT | ChatOpenAI(
    model="gpt-4o", temperature=0.3
).with_structured_output(list[SectionDraft])
```

The synthesis agent’s output includes a list of `finding_ids` per section, which the citation agent uses for validation. If the synthesis agent references a finding that does not exist, the citation agent flags it. If a section makes a claim without a citation marker, that claim gets added to the `unsupported_claims` list.

> Handling Contradictions
> 
> When two sources disagree, the naive approach is to pick the one with the higher relevance score. The better approach is to present both, note the disagreement, and let the human reader decide. Your synthesis prompt should explicitly instruct the LLM to preserve contradictions rather than resolve them. Research reports that hide disagreement are less useful than reports that surface it.

## C1.9 Citation Tracking and Report Generation

The citation agent is the quality gate. It walks through every section, extracts all `[src-XXX]` markers, checks each one against the source database, and builds the bibliography. Any marker that does not map to a real source gets flagged.

```
import re

def validate_citations(
    sections: list[SectionDraft],
    sources: list[Source],
    findings: list[Finding],
) -> CitedReport:
    """Validate citation markers and build the final report."""
    source_lookup = {s.source_id: s for s in sources}
    finding_lookup = {f.finding_id: f for f in findings}
    unsupported = []
    cited_source_ids = set()

    for section in sections:
        # Extract all citation markers from body text
        markers = re.findall(r"\[src-[\w-]+\]", section.body)
        for marker in markers:
            sid = marker.strip("[]")
            if sid in source_lookup:
                cited_source_ids.add(sid)
            else:
                unsupported.append(
                    f"Section '{section.heading}': marker {marker} "
                    f"does not match any retrieved source"
                )

        # Check that all referenced findings exist
        for fid in section.finding_ids:
            if fid not in finding_lookup:
                unsupported.append(
                    f"Section '{section.heading}': references finding "
                    f"'{fid}' which was not produced by analysis"
                )

    # Build bibliography from actually-cited sources only
    bibliography = [
        source_lookup[sid] for sid in sorted(cited_source_ids)
        if sid in source_lookup
    ]

    return CitedReport(
        title=f"Research Report",
        sections=sections,
        bibliography=bibliography,
        unsupported_claims=unsupported,
    )
```

The final report is a `CitedReport` object that a rendering layer can convert to Markdown, HTML, or PDF. The `unsupported_claims` field is surfaced to the human reviewer, not hidden. Transparency about what the system could not verify is more valuable than a polished facade.

## C1.10 The Agent Graph

With all the pieces defined, the supervisor orchestrates them using a LangGraph state graph. The graph encodes the full research workflow, including the feedback loop for gap-filling.

```
from langgraph.graph import StateGraph, END
from typing import TypedDict

class ResearchState(TypedDict):
    question: str
    plan: QueryPlan | None
    sources: list[Source]
    findings: list[Finding]
    sections: list[SectionDraft]
    report: CitedReport | None
    iteration: int
    max_iterations: int

def plan_node(state: ResearchState) -> dict:
    """Supervisor decomposes the research question."""
    plan = planner_chain.invoke({"question": state["question"]})
    return {"plan": plan}

async def search_node(state: ResearchState) -> dict:
    """Search agent retrieves sources for all sub-queries."""
    sources = await search_all(state["plan"])
    return {"sources": state["sources"] + sources}

def analyze_node(state: ResearchState) -> dict:
    """Analysis agent chunks, embeds, retrieves, and extracts findings."""
    store = build_vector_store(state["sources"])
    all_findings = []
    for sq in state["plan"].sub_queries:
        chunks = retrieve_for_query(store, sq.query, k=6)
        for chunk in chunks:
            finding = extraction_chain.invoke({
                "question": state["question"],
                "source_id": chunk["source_id"],
                "passage": chunk["text"],
            })
            if finding is not None:
                all_findings.append(finding)
    return {"findings": all_findings}

def synthesize_node(state: ResearchState) -> dict:
    """Synthesis agent produces narrative sections from findings."""
    findings_json = [f.model_dump() for f in state["findings"]]
    sections = synthesis_chain.invoke({
        "question": state["question"],
        "findings_json": str(findings_json),
    })
    return {"sections": sections}

def cite_node(state: ResearchState) -> dict:
    """Citation agent validates references and builds final report."""
    report = validate_citations(
        state["sections"], state["sources"], state["findings"]
    )
    report.title = f"Research Report: {state['question']}"
    return {"report": report, "iteration": state["iteration"] + 1}

def should_continue(state: ResearchState) -> str:
    """Supervisor decides: publish or gather more evidence."""
    if state["iteration"] >= state["max_iterations"]:
        return "end"
    if state["report"] and len(state["report"].unsupported_claims) == 0:
        return "end"
    if state["report"] and len(state["report"].unsupported_claims) > 3:
        return "refine"  # Too many gaps; loop back
    return "end"

# Build the graph
graph = StateGraph(ResearchState)
graph.add_node("plan", plan_node)
graph.add_node("search", search_node)
graph.add_node("analyze", analyze_node)
graph.add_node("synthesize", synthesize_node)
graph.add_node("cite", cite_node)

graph.set_entry_point("plan")
graph.add_edge("plan", "search")
graph.add_edge("search", "analyze")
graph.add_edge("analyze", "synthesize")
graph.add_edge("synthesize", "cite")
graph.add_conditional_edges("cite", should_continue, {
    "end": END,
    "refine": "plan",  # Loop back with refined queries
})

research_agent = graph.compile()
```

> Why a Graph, Not a Chain?
> 
> A simple chain would work for a single pass: plan, search, analyze, synthesize, cite, done. The graph adds conditional edges that let the supervisor loop back when the citation agent flags too many unsupported claims. This feedback loop is what makes the system iterative rather than one-shot. In practice, most research questions resolve in one or two iterations. The `max_iterations` guard prevents infinite loops when a question is genuinely under-served by available web content.

## C1.11 Running the System

Invoking the research agent is a single call. The state propagates through the graph, and you get back a `CitedReport` ready for rendering.

```
import asyncio

async def run_research(question: str, max_iterations: int = 2) -> CitedReport:
    """Execute the full research pipeline."""
    initial_state: ResearchState = {
        "question": question,
        "plan": None,
        "sources": [],
        "findings": [],
        "sections": [],
        "report": None,
        "iteration": 0,
        "max_iterations": max_iterations,
    }
    final_state = await research_agent.ainvoke(initial_state)
    return final_state["report"]

# Run it
report = asyncio.run(run_research(
    "How is generative AI changing drug discovery in 2025?"
))

# Render to markdown
def render_markdown(report: CitedReport) -> str:
    lines = [f"# {report.title}\n"]
    for section in report.sections:
        lines.append(f"## {section.heading}\n")
        lines.append(section.body + "\n")
    lines.append("## References\n")
    for src in report.bibliography:
        lines.append(f"- **[{src.source_id}]** [{src.title}]({src.url}) "
                     f"(retrieved {src.retrieved_at.strftime('%Y-%m-%d')})")
    if report.unsupported_claims:
        lines.append("\n## Verification Notes\n")
        for claim in report.unsupported_claims:
            lines.append(f"- {claim}")
    return "\n".join(lines)

print(render_markdown(report))
```

## C1.12 Testing and Evaluation

A research assistant is only as good as the reports it produces. Testing requires evaluating multiple dimensions: factual accuracy, citation validity, coverage, and coherence.

**Citation validity** is the easiest to automate. Parse every `[src-XXX]` marker, confirm it maps to a source in the bibliography, and verify that the cited passage actually appears in the source’s raw text. This is a deterministic check with no LLM involvement.

**Coverage** is harder. Given the original research question, did the report address all major facets? One approach: use an LLM-as-judge to compare the report’s section headings against a gold-standard outline for the topic. A simpler approach: count the number of unique sources cited and the number of sub-queries that contributed at least one finding.

**Coherence** is subjective but measurable. An LLM-as-judge can rate whether sections flow logically, whether contradictions are properly flagged, and whether the executive summary (if present) accurately reflects the body. Use a rubric with explicit criteria rather than asking for a single quality score.

```
def test_citation_validity(report: CitedReport) -> dict:
    """Deterministic citation validation."""
    source_ids = {s.source_id for s in report.bibliography}
    total_markers, valid_markers = 0, 0
    for section in report.sections:
        markers = re.findall(r"\[src-[\w-]+\]", section.body)
        total_markers += len(markers)
        for m in markers:
            if m.strip("[]") in source_ids:
                valid_markers += 1
    return {
        "total_citations": total_markers,
        "valid_citations": valid_markers,
        "validity_rate": valid_markers / max(total_markers, 1),
        "unsupported_count": len(report.unsupported_claims),
    }
```

## C1.13 Production Considerations

Moving this system from a notebook to production introduces several concerns that do not exist in a demo.

**Token budgets.** A single research run with five sub-queries, twenty-five sources, and two synthesis passes can consume 200,000+ tokens. Set hard limits at each stage: cap the number of sub-queries (seven), the number of sources per query (five), the number of chunks retrieved per query (six), and the number of refinement iterations (two). Surface the token count to the user before execution so they can approve the cost.

**Caching.** If two users research similar topics within the same day, the search results overlap significantly. Cache source fetches by URL with a TTL of 24 hours. Cache embeddings by content hash. Do not cache LLM completions for synthesis because the finding set differs per run.

**Error handling.** Web search APIs fail, URLs return 403s, and LLM calls time out. Wrap each tool call in a retry with exponential backoff. If a source fetch fails, log it and continue — the system should degrade gracefully, not abort. The final report should note which sources could not be retrieved.

**Observability.** Log every agent invocation with its input, output, latency, and token count. Use LangSmith or a custom tracer so you can replay any research run and understand exactly which sources led to which claims. Without this trace, debugging a bad report is impossible.

> Legal and Ethical Considerations
> 
> Web scraping may violate terms of service. Summarizing copyrighted content raises fair-use questions. Auto-generated reports that look authoritative can mislead readers if they contain errors. Always surface the `unsupported_claims` list, always link back to primary sources, and always label the output as AI-generated. Human review is not optional — it is a requirement.

## Portfolio Project: Multi-Agent Research System

Build a complete research assistant using the architecture described in this chapter. Your system must accept a free-text research question, produce a structured report with inline citations and a bibliography, and surface any claims it could not verify. Implement at least one refinement loop where gaps trigger additional searches.

Choose one domain variant and tailor the query planning prompts, source filters, and report format to that domain:

**Tech / Software** Technology landscape analysis, framework comparisons, adoption trends

**Healthcare** Clinical evidence review, drug pipeline analysis, regulatory updates

**Finance** Market research, competitor analysis, regulatory filings, earnings trends

**Education** Pedagogy research, EdTech evaluation, curriculum gap analysis

**E-commerce** Product research, pricing intelligence, review synthesis, market sizing

**Legal** Case law research, statute tracking, precedent analysis, compliance review

## Summary

This capstone combined patterns from earlier chapters — RAG pipelines (Chapter 8), supervisor-worker orchestration (Chapter 10), tool use (Chapter 6), and memory (Chapter 7) — into a production-grade research assistant. The system decomposes broad questions into targeted sub-queries, retrieves and analyzes web sources in parallel, synthesizes findings into narrative sections with inline citations, and validates every claim against the source database before publishing.

-   **Decompose before you search.** A single broad query returns noise. A well-planned set of targeted sub-queries returns signal. Query planning is the supervisor’s most important job.
-   **Parallelize retrieval, serialize synthesis.** Web searches are independent and should run concurrently. Synthesis depends on all findings being present and must wait until retrieval and analysis are complete.
-   **Track provenance from the first byte.** Every chunk, finding, and citation marker traces back to a specific source and URL. Provenance is not a feature you add later — it is a data model decision you make upfront.
-   **Surface uncertainty instead of hiding it.** The `unsupported_claims` field is not a bug list. It is a trust signal. Reports that disclose their limitations are more useful than reports that pretend to be complete.
-   **Budget every stage.** Cap sub-queries, sources per query, chunks per retrieval, and refinement iterations. Without explicit budgets, a single research run can consume an entire day’s token allocation.

### Exercises

| Type | Exercise | Description |
| --- | --- | --- |
| Conceptual | **Uncited claims** | The synthesis agent sometimes produces a section that makes a claim without a `[src-XXX]` citation marker. The citation agent flags this as unsupported. Describe two prompt-engineering strategies that would reduce the frequency of uncited claims in the synthesis output without making the text unreadable. |
| Coding | **Domain filter** | Extend the `search_all` function to accept a `domain_filter` parameter (e.g., `site:arxiv.org` or `site:sec.gov`) that restricts web search results to a specific set of trusted domains. Write tests that verify the filter is applied correctly and that results from untrusted domains are excluded. |
| Design | **Topic-partitioned vector stores** | The current architecture processes all sources through a single vector store. For a research question that spans two distinct topics (e.g., “Compare the AI strategies of the US and EU”), this means US-related chunks and EU-related chunks are mixed together in retrieval. Design an alternative architecture that uses topic-partitioned vector stores and explain how the analysis agent would decide which partition to query for each sub-question. |