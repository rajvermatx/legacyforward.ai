---
title: "Research Synthesis Agent"
slug: "research-synthesis"
description: "Researchers spend weeks conducting literature reviews across thousands of papers. This agent searches multiple academic databases (ArXiv, Semantic Scholar, CrossRef), fetches and analyzes abstracts, extracts key findings, detects contradictions between studies, and synthesizes everything into a cohe"
section: "agentic-designs"
order: 5
badges:
  - "ArXiv API Search"
  - "Semantic Scholar API"
  - "Contradiction Detection"
  - "Citation Graph Traversal"
  - "Iterative Deepening Search"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/agentic-designs/05-research-synthesis.ipynb"
---

## 01. The Problem

A researcher starting a new project on "LLM hallucination mitigation" faces a daunting landscape: ArXiv alone publishes 50+ relevant papers per week in the AI category. Semantic Scholar indexes over 200 million papers. The researcher must search across multiple databases, read abstracts, follow citation chains, identify the most influential papers, detect where studies contradict each other, and synthesize a coherent understanding of the current state of knowledge.

The core challenge is **information overload with judgment**. It is not just about finding papers — it is about determining which papers matter, understanding how they relate to each other, and identifying gaps in the literature. A keyword search returns hundreds of results; the researcher must distinguish between foundational work, incremental improvements, contradictory findings, and dead ends.

Existing tools (Google Scholar, Connected Papers, Elicit) help with search and basic summarization, but they cannot perform the kind of *analytical synthesis* that a literature review requires: identifying that Paper A's results contradict Paper B's claims, that Paper C's methodology addresses Paper D's limitations, or that there is a gap in the literature around a specific sub-topic that represents a research opportunity.

## 02. Why an Agent

**Why not keyword search?** A single search query returns a flat list of results ranked by relevance. But literature review is inherently *iterative*: you read one paper, discover a technique called "retrieval-augmented generation," search for that term, find a foundational paper, follow its citations forward, and discover a new line of research you did not know existed. Each step refines the search strategy based on accumulated knowledge.

**Why not RAG?** RAG is single-pass: retrieve documents, generate a response. Literature review requires multiple passes — search, read, search deeper, compare, identify contradictions, search for resolution. The agent maintains a growing mental model of the research landscape and uses it to guide subsequent searches. This is the "iterative deepening" pattern: each cycle goes deeper and more focused than the last.

**The agent advantage:** The research synthesis agent performs what cognitive scientists call "sensemaking" — it does not just collect information, it organizes it into a coherent narrative. It identifies themes, detects contradictions, traces intellectual lineage through citation chains, and produces a briefing that gives the researcher a structured entry point into the literature. What takes a human 2-3 weeks of reading, the agent can draft in 10 minutes.

## Architecture Diagram

![Diagram 1](/diagrams/agentic-designs/research-synthesis-1.svg)

## 03. Architecture

### Data Sources

ArXiv API for preprints (free, no API key required), Semantic Scholar API for citation graphs and paper metadata (free tier: 100 requests/5 minutes), CrossRef API for DOI resolution and bibliographic data (free, polite pool with mailto parameter).

### Agent Core

An OpenAI function-calling agent prompted as a research librarian. It receives a research question and iteratively searches, reads, and analyzes until it has built a comprehensive understanding of the topic. The system prompt encodes search strategies from information science.

### Tool Registry

Five tools: search\_papers (query ArXiv by keyword/category), fetch\_paper\_details (get metadata and abstract from Semantic Scholar), extract\_findings (parse key claims from an abstract), detect\_contradictions (compare findings across papers), and synthesize\_brief (compile a structured research briefing).

### Iterative Deepening

The agent performs multiple search cycles. Cycle 1: broad keyword search. Cycle 2: search for specific techniques found in Cycle 1. Cycle 3: follow citations of the most relevant papers. Each cycle narrows focus and increases depth, converging on the most relevant subset of the literature.

## 04. Tools & APIs

All three academic APIs used here are free and do not require API keys (Semantic Scholar has an optional key for higher rate limits). The ArXiv API returns Atom XML, which we parse into structured JSON. Semantic Scholar returns rich citation metadata.

```
import json, requests, xml.etree.ElementTree as ET
from urllib.parse import quote

# ── Tool 1: Search ArXiv for papers ──
def search_papers(query: str, max_results: int = 10, category: str = "cs.CL") -> str:
    """Search ArXiv for papers matching a query in a specific category.
    Categories: cs.CL (NLP), cs.AI (AI), cs.LG (ML), cs.IR (Information Retrieval)"""
    search_query = f"all:{quote(query)}+AND+cat:{category}"
    url = (f"http://export.arxiv.org/api/query?search_query={search_query}"
           f"&start=0&max_results={max_results}&sortBy=relevance")

    resp = requests.get(url, timeout=30)
    resp.raise_for_status()

    # Parse Atom XML response
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    root = ET.fromstring(resp.text)
    papers = []

    for entry in root.findall("atom:entry", ns):
        title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
        summary = entry.find("atom:summary", ns).text.strip()[:300]
        arxiv_id = entry.find("atom:id", ns).text.split("/")[-1]
        published = entry.find("atom:published", ns).text[:10]
        authors = [a.find("atom:name", ns).text
                   for a in entry.findall("atom:author", ns)][:3]

        papers.append({
            "arxiv_id": arxiv_id,
            "title": title,
            "authors": authors,
            "published": published,
            "abstract_preview": summary
        })

    return json.dumps(papers, indent=2)

# ── Tool 2: Get detailed paper metadata from Semantic Scholar ──
def fetch_paper_details(arxiv_id: str) -> str:
    """Fetch citation count, references, and full abstract from Semantic Scholar."""
    url = f"https://api.semanticscholar.org/graph/v1/paper/ArXiv:{arxiv_id}"
    params = {
        "fields": "title,abstract,citationCount,influentialCitationCount,"
                  "references.title,references.citationCount,year"
    }
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    # Extract top references by citation count
    refs = data.get("references", []) or []
    top_refs = sorted(refs, key=lambda r: r.get("citationCount", 0) or 0, reverse=True)[:5]

    return json.dumps({
        "title": data.get("title"),
        "year": data.get("year"),
        "abstract": (data.get("abstract") or "")[:500],
        "citation_count": data.get("citationCount", 0),
        "influential_citations": data.get("influentialCitationCount", 0),
        "top_references": [
            {"title": r.get("title"), "citations": r.get("citationCount", 0)}
            for r in top_refs
        ]
    }, indent=2)

# ── Tool 3: Extract key findings from an abstract ──
def extract_findings(paper_title: str, abstract: str) -> str:
    """Extract structured key findings from a paper abstract.
    Uses heuristic parsing — in production, use an LLM for this step."""
    # Simple heuristic: split by sentences, find claims
    sentences = [s.strip() for s in abstract.replace("\n", " ").split(".") if len(s.strip()) > 30]

    claim_indicators = ["we show", "we find", "we demonstrate", "results show",
                        "we propose", "outperforms", "achieves", "improves",
                        "we introduce", "our approach", "our method"]

    findings = []
    for sent in sentences:
        sent_lower = sent.lower()
        for indicator in claim_indicators:
            if indicator in sent_lower:
                findings.append({
                    "claim": sent.strip(),
                    "type": "method" if "propose" in sent_lower or "introduce" in sent_lower else "result"
                })
                break

    return json.dumps({
        "paper": paper_title,
        "num_findings": len(findings),
        "findings": findings[:5]
    }, indent=2)

# ── Tool 4: Detect contradictions between findings ──
def detect_contradictions(findings_json: str) -> str:
    """Compare findings from multiple papers to detect potential contradictions.
    Input: JSON array of {paper, claim} objects."""
    findings = json.loads(findings_json)

    # Heuristic: flag pairs with opposing sentiment on same topic
    positive_markers = ["improves", "outperforms", "effective", "beneficial", "achieves"]
    negative_markers = ["fails", "does not", "limited", "insufficient", "no significant"]

    contradictions = []
    for i, f1 in enumerate(findings):
        for f2 in findings[i+1:]:
            # Check if claims discuss similar topics but with opposing sentiment
            c1, c2 = f1["claim"].lower(), f2["claim"].lower()
            words1, words2 = set(c1.split()), set(c2.split())
            topic_overlap = len(words1 & words2) / max(len(words1 | words2), 1)

            if topic_overlap > 0.15:  # Similar topic
                pos1 = any(m in c1 for m in positive_markers)
                neg1 = any(m in c1 for m in negative_markers)
                pos2 = any(m in c2 for m in positive_markers)
                neg2 = any(m in c2 for m in negative_markers)

                if (pos1 and neg2) or (neg1 and pos2):
                    contradictions.append({
                        "paper_a": f1["paper"],
                        "claim_a": f1["claim"],
                        "paper_b": f2["paper"],
                        "claim_b": f2["claim"],
                        "topic_overlap": round(topic_overlap, 2)
                    })

    return json.dumps({
        "contradictions_found": len(contradictions),
        "contradictions": contradictions[:5]
    }, indent=2)

# ── Tool 5: Synthesize a research briefing ──
def synthesize_brief(topic: str, papers_json: str, findings_json: str,
                       contradictions_json: str) -> str:
    """Compile all gathered information into a structured research briefing."""
    papers = json.loads(papers_json)
    findings = json.loads(findings_json)
    contradictions = json.loads(contradictions_json)

    lines = [
        f"# Research Synthesis: {topic}",
        "",
        f"**Papers Reviewed:** {len(papers)}",
        f"**Key Findings:** {len(findings)}",
        f"**Contradictions Detected:** {contradictions.get('contradictions_found', 0)}",
        "",
        "## Most Cited Papers",
    ]
    for p in sorted(papers, key=lambda x: x.get("citation_count", 0), reverse=True)[:5]:
        lines.append(f"- **{p.get('title', 'N/A')}** ({p.get('year', '?')}) — {p.get('citation_count', 0)} citations")

    lines.extend(["", "## Key Findings"])
    for f in findings[:8]:
        lines.append(f"- [{f.get('type', 'finding')}] {f.get('claim', '')[:150]}")

    if contradictions.get("contradictions"):
        lines.extend(["", "## Contradictions & Debates"])
        for c in contradictions["contradictions"]:
            lines.append(f"- **{c['paper_a']}** vs **{c['paper_b']}**: conflicting claims on shared topic")

    lines.extend(["", "## Research Gaps", "- (Agent identifies gaps based on missing coverage in reviewed papers)"])

    return "\n".join(lines)
```

## 05. The Agent Loop

The research synthesis agent uses an **iterative deepening search** pattern. Unlike a flat search that returns results once, this agent performs multiple search cycles, each time going deeper based on what it learned in the previous cycle.

**Cycle 1 — Broad survey:**

1.  Agent calls `search_papers("LLM hallucination mitigation", max_results=10)`
2.  Reviews titles and abstract previews to identify the most relevant papers
3.  Calls `fetch_paper_details` on the top 3-5 papers to get citation counts and references

**Cycle 2 — Technique-focused search:**

1.  From Cycle 1, the agent discovers specific techniques (e.g., "retrieval augmentation", "self-consistency")
2.  Agent calls `search_papers` again with more specific queries
3.  Calls `extract_findings` on each paper to pull out key claims

**Cycle 3 — Citation chain and synthesis:**

1.  Agent follows highly-cited references from Cycle 2 papers
2.  Calls `detect_contradictions` across all collected findings
3.  Calls `synthesize_brief` to compile the final research briefing

The number of cycles is bounded by max\_steps, but the agent can converge early if it determines it has sufficient coverage. This is a key advantage over fixed pipelines: the agent decides when it has "enough" information.

## 06. Code Walkthrough

The complete agent with tool definitions and the iterative deepening system prompt.

```
from openai import OpenAI
import json

client = OpenAI()

# ── Tool Definitions ──
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_papers",
            "description": "Search ArXiv for papers matching a query. Use broad queries first, then narrow based on findings. Categories: cs.CL (NLP), cs.AI, cs.LG, cs.IR.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "max_results": {"type": "integer", "description": "Max papers to return (default 10)"},
                    "category": {"type": "string", "description": "ArXiv category (default cs.CL)"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_paper_details",
            "description": "Get full metadata for a paper from Semantic Scholar: citation count, influential citations, abstract, and top references. Use the ArXiv ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "arxiv_id": {"type": "string", "description": "ArXiv paper ID, e.g. 2305.14251"}
                },
                "required": ["arxiv_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "extract_findings",
            "description": "Extract key claims and findings from a paper's abstract. Returns structured findings tagged as 'method' or 'result'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "paper_title": {"type": "string"},
                    "abstract": {"type": "string"}
                },
                "required": ["paper_title", "abstract"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "detect_contradictions",
            "description": "Compare findings from multiple papers to identify contradicting claims. Input: JSON array of {paper, claim} objects.",
            "parameters": {
                "type": "object",
                "properties": {
                    "findings_json": {"type": "string", "description": "JSON array of {paper, claim} objects"}
                },
                "required": ["findings_json"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "synthesize_brief",
            "description": "Compile all gathered papers, findings, and contradictions into a structured research briefing. Use as the final step.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {"type": "string"},
                    "papers_json": {"type": "string", "description": "JSON array of paper objects with title, year, citation_count"},
                    "findings_json": {"type": "string", "description": "JSON array of finding objects"},
                    "contradictions_json": {"type": "string", "description": "JSON from detect_contradictions"}
                },
                "required": ["topic", "papers_json", "findings_json", "contradictions_json"]
            }
        }
    }
]

# ── Dispatcher ──
TOOL_MAP = {
    "search_papers": search_papers,
    "fetch_paper_details": fetch_paper_details,
    "extract_findings": extract_findings,
    "detect_contradictions": detect_contradictions,
    "synthesize_brief": synthesize_brief,
}

def dispatch_tool(name: str, args: dict) -> str:
    fn = TOOL_MAP.get(name)
    if not fn:
        return json.dumps({"error": f"Unknown tool: {name}"})
    try:
        return fn(**args)
    except Exception as e:
        return json.dumps({"error": f"{type(e).__name__}: {e}"})

# ── Agent ──
SYSTEM_PROMPT = """You are a research librarian conducting a systematic literature review.

Follow the iterative deepening search strategy:
1. CYCLE 1 (Broad): Search for papers with broad queries to survey the landscape.
   Fetch details on the most relevant papers (by title relevance and citation count).
2. CYCLE 2 (Focused): Based on techniques and methods found in Cycle 1, search
   with more specific queries. Extract findings from each relevant paper.
3. CYCLE 3 (Synthesis): Detect contradictions across all findings. Follow citation
   chains from highly-cited papers if important references were missed.
   Synthesize everything into a structured briefing.

Prioritize papers by: influential citation count > total citations > recency.
Always search at least 2 different query formulations to avoid retrieval bias.
Flag any contradictions or ongoing debates in the field."""

def run_research_agent(question: str, max_steps: int = 15) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": question}
    ]

    for step in range(max_steps):
        resp = client.chat.completions.create(
            model="gpt-4o", messages=messages,
            tools=tools, tool_choice="auto"
        )
        msg = resp.choices[0].message
        messages.append(msg)

        if not msg.tool_calls:
            return msg.content

        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            print(f"  [{step+1}] {tc.function.name}({json.dumps(args)[:60]}...)")
            result = dispatch_tool(tc.function.name, args)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result
            })

    return "Agent reached max steps. Partial synthesis available."

# ── Run ──
briefing = run_research_agent(
    "Conduct a literature review on techniques for reducing hallucination "
    "in large language models. Cover retrieval-augmented generation, "
    "self-consistency, and chain-of-thought approaches. Identify any "
    "contradictions between studies."
)
print(briefing)
```

## 07. Key Takeaways

- The ArXiv API is free and requires no API key — it returns Atom XML that must be parsed. Rate limit: 1 request per 3 seconds

- Semantic Scholar's free tier allows 100 requests per 5 minutes. Request an API key for higher limits (1 request/second)

- Use multiple query formulations to avoid retrieval bias. "LLM hallucination" and "language model factuality" return different but overlapping result sets

- Influential citation count (from Semantic Scholar) is more meaningful than total citations — it counts only papers that substantively build on the work

- The heuristic contradiction detector shown here is a starting point. In production, use an LLM to compare specific claims for semantic contradiction

- Iterative deepening search prevents the agent from going too deep on the first query. Breadth first, then depth — mimics expert search behavior

- Always include publication dates in the briefing — a 2024 paper superseding a 2022 finding changes the research landscape

- The agent's synthesis is a starting point for human researchers, not a replacement. Always verify key claims against the original papers
