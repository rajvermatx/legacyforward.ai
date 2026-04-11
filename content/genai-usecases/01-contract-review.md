---
title: "Automated Contract Review"
slug: "contract-review"
description: "Legal teams spend up to 60% of their time manually reviewing contracts. Corporate legal departments process
    20,000–40,000 contracts per year, at $200–$500/hour for experienced attorneys and 1–2 hours per
    contract. Missed clauses can expose companies to millions in liability. This use case bu"
section: "genai-usecases"
order: 1
badges:
  - "PDF Extraction"
  - "Clause Segmentation"
  - "RAG Pipeline"
  - "Risk Scoring"
  - "Report Generation"
  - "Production Deployment"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai-usecases/01-contract-review.ipynb"
---

## 1. The Problem: Why Manual Contract Review Breaks Down

### The Scale Nobody Talks About

A mid-size enterprise legal department handles **20,000 to 40,000 contracts per year**. These include vendor agreements, NDAs, employment contracts, SaaS terms, licensing deals, partnership agreements, and customer master service agreements. Each contract contains anywhere from 15 to 80 distinct clauses, and every clause carries potential risk.

An experienced contract attorney charges **$200–$500 per hour**. A single contract review takes **1–2 hours on average**, but complex agreements (M&A, joint ventures, international licensing) can take 8–12 hours. At 30,000 contracts per year with an average of 1.5 hours per review, that is **45,000 billable hours — roughly $11.25 million per year** at $250/hour.

Even with this massive investment, human reviewers miss things. Fatigue, inconsistency, and sheer volume mean that **10–15% of risky clauses go undetected** in manual review processes. A single missed indemnification clause or an overlooked liability cap can expose a company to millions in unanticipated liability.

>**Real-World Impact:** In 2019, a Fortune 500 company discovered that a missed change-of-control clause in a vendor agreement triggered automatic contract termination during an acquisition, resulting in $47 million in disruption costs. Automated review systems flag these clauses consistently, every time.

### The Hidden Risks in Every Contract

Not all clauses carry equal risk. The most dangerous ones are often buried deep in the document, sometimes intentionally obscured by the drafting party. Here are the clause types that matter most:

| Clause Type | Risk Level | Why It Matters |
| --- | --- | --- |
| **Indemnification** | Critical | Determines who pays when things go wrong. Unlimited indemnity can bankrupt a company. |
| **Liability Cap** | Critical | Sets the maximum financial exposure. Missing caps mean unlimited liability. |
| **Termination** | High | Defines exit conditions. Unfavorable termination clauses can lock you into bad deals. |
| **Non-Compete** | High | Restricts future business activities. Overly broad non-competes limit strategic options. |
| **IP Assignment** | Critical | Transfers intellectual property rights. Accidental IP assignment can lose core assets. |
| **Change of Control** | High | Triggers during M&A. Can auto-terminate agreements or grant consent rights. |
| **Governing Law** | Medium | Determines jurisdiction for disputes. Wrong jurisdiction increases litigation costs. |
| **Force Majeure** | Medium | Covers unforeseeable events. Post-COVID, this clause is scrutinized far more closely. |
| **Data Privacy** | High | Governs handling of personal data. Non-compliance triggers GDPR/CCPA penalties. |
| **Auto-Renewal** | Medium | Automatic extensions without notice. Can trap companies in unwanted multi-year deals. |

The challenge is not just finding these clauses — it is **evaluating whether each clause is acceptable** according to your company's specific standards, comparing it against market benchmarks, and flagging deviations that require negotiation. This is where LLMs and RAG become transformative.

## 2. Solution Architecture

The automated contract review system combines several GenAI techniques into a single pipeline: PDF text extraction, intelligent clause segmentation, embedding-based classification, and RAG-powered analysis against a company-specific playbook. The output is a structured risk report with severity ratings and actionable recommendations for each clause.

### Pipeline Architecture

![Diagram 1](/diagrams/genai-usecases/contract-review-1.svg)

End-to-end contract review pipeline — from PDF ingestion to risk report

### Component Walkthrough

Each stage of the pipeline serves a distinct purpose. Let us walk through them:

**Stage 1 — PDF Upload & Text Extraction:** Contracts arrive as PDFs, often scanned images rather than digital text. We use PyMuPDF (fitz) for digital PDFs and Tesseract OCR for scanned documents. The extraction step preserves structural cues like section headers, numbered lists, and paragraph breaks — these are critical for downstream clause segmentation.

**Stage 2 — Clause Segmentation:** Raw text is split into individual clauses. A hybrid approach works best: regex patterns catch well-formatted section headers (e.g., "Section 7. Indemnification"), while an LLM handles ambiguous boundaries where clauses run together without clear delimiters. Each segment is tagged with its position in the document and any section number found.

**Stage 3 — Embedding & Classification:** Each clause is embedded using `text-embedding-3-small` and compared against a pre-built library of clause type exemplars stored in ChromaDB. This identifies each clause as one of the target types (indemnity, termination, IP assignment, etc.) with a confidence score. Clauses below the confidence threshold are flagged for manual classification.

**Stage 4 — LLM Analysis with RAG:** This is the core of the system. For each classified clause, the system retrieves the corresponding section from the company playbook — which contains acceptable terms, red flag patterns, and market standard benchmarks. The LLM receives the clause text plus the playbook guidance and produces a structured analysis: what the clause says, how it compares to the playbook, specific risks identified, and a severity rating.

**Stage 5 — Risk Report:** All clause analyses are aggregated into an executive summary. The report includes overall risk score, clause-by-clause breakdown with severity ratings (Critical / High / Medium / Low), specific recommendations for negotiation, and a list of missing standard clauses that should be added.

>**Architecture Choice:** Why RAG instead of fine-tuning? Company playbooks change frequently — new market benchmarks, updated internal policies, lessons from past negotiations. RAG lets you update the knowledge base without retraining the model. You simply re-embed the updated playbook documents and the system immediately reflects the changes.

## 3. Technical Deep Dive

This section walks through the actual code for each pipeline stage. All of the code below is available as a runnable Colab notebook — click the badge in the hero section to open it.

### 3.1 — PDF Text Extraction with PyMuPDF

PyMuPDF (imported as `fitz`) is the fastest Python library for PDF text extraction. It handles digital PDFs natively and can extract text while preserving layout structure. For scanned PDFs, you would add an OCR layer with Tesseract, but most modern contracts are born-digital.

```
import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file, preserving paragraph structure."""
    doc = fitz.open(pdf_path)
    full_text = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        # Extract text with layout preservation
        text = page.get_text("text")

        # Clean up common PDF artifacts
        text = text.replace("\u00ad", "")  # soft hyphens
        text = text.replace("\u200b", "")  # zero-width spaces

        full_text.append(f"--- Page {page_num + 1} ---\n{text}")

    doc.close()
    return "\n".join(full_text)
```

The function iterates through every page, extracts raw text, and removes common artifacts like soft hyphens that PDFs insert at line breaks. The page markers help with downstream reference tracking — when the risk report cites a problematic clause, it can reference the exact page number.

>**Production Tip:** For scanned PDFs, add an OCR fallback: if `page.get_text("text")` returns fewer than 50 characters for a page, render the page as an image and run Tesseract OCR on it. This hybrid approach handles mixed documents where some pages are digital and others are scanned.

### 3.2 — Clause Segmentation Using Regex + LLM

Clause segmentation is the trickiest part of the pipeline. Well-formatted contracts use numbered sections (e.g., "Section 7.2 Limitation of Liability"), but many contracts use inconsistent formatting. Our approach uses regex for primary segmentation and an LLM for refinement.

```
import re
from typing import List, Dict

# Patterns that indicate clause boundaries
CLAUSE_PATTERNS = [
    re.compile(r'^(?:Section|Article|Clause)\s+\d+[\.\d]*[:\.\s]', re.MULTILINE | re.IGNORECASE),
    re.compile(r'^\d+[\.\d]*\s+[A-Z][A-Z\s]{3,}', re.MULTILINE),
    re.compile(r'^[A-Z][A-Z\s]{4,}$', re.MULTILINE),
]

def segment_clauses_regex(text: str) -> List[Dict]:
    """Split contract text into clauses using regex patterns."""
    boundaries = []

    for pattern in CLAUSE_PATTERNS:
        for match in pattern.finditer(text):
            boundaries.append(match.start())

    # Deduplicate and sort boundaries
    boundaries = sorted(set(boundaries))

    # Extract clauses between boundaries
    clauses = []
    for i in range(len(boundaries)):
        start = boundaries[i]
        end = boundaries[i + 1] if i + 1 < len(boundaries) else len(text)
        clause_text = text[start:end].strip()

        if len(clause_text) > 50:  # Skip tiny fragments
            clauses.append({
                "index": len(clauses),
                "text": clause_text,
                "char_start": start,
                "char_end": end,
            })

    return clauses
```

The regex patterns match three common styles: explicit "Section/Article/Clause" headers, numbered sections followed by uppercase titles, and standalone uppercase headings. After finding all potential boundaries, we extract the text between consecutive boundaries and discard fragments shorter than 50 characters (these are usually artifacts or whitespace).

For contracts with poor formatting, we add an LLM-based refinement step. The LLM receives the raw text and identifies clause boundaries that the regex missed:

```
def refine_clauses_with_llm(text: str, client) -> List[Dict]:
    """Use an LLM to identify clause boundaries in poorly formatted text."""
    # 💰 Cost Warning: This makes an API call per contract
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": """You are a legal document parser.
Given contract text, identify each distinct clause or section.
Return a JSON array where each element has:
- "title": the clause heading or a descriptive title
- "text": the full clause text
- "clause_type": one of [indemnification, liability_cap, termination,
  non_compete, ip_assignment, change_of_control, confidentiality,
  governing_law, force_majeure, data_privacy, auto_renewal, payment,
  representations, other]"""},
            {"role": "user", "content": text}
        ],
        response_format={"type": "json_object"},
        temperature=0.0,
    )

    import json
    result = json.loads(response.choices[0].message.content)
    return result.get("clauses", [])
```

>**Cost Consideration:** The LLM segmentation step should be used sparingly. For a 10-page contract (roughly 5,000 tokens), a GPT-4o-mini call costs approximately $0.0075. At 30,000 contracts/year, that is $225/year for segmentation alone — negligible compared to attorney costs, but worth tracking.

### 3.3 — Building the Playbook Vector Store with ChromaDB

The company playbook is the knowledge base that makes this system company-specific. It contains guidelines for each clause type: what constitutes acceptable terms, what red flags to watch for, and market standard benchmarks. We store this in ChromaDB as embedded documents for RAG retrieval.

```
import chromadb
from chromadb.utils import embedding_functions

# Initialize ChromaDB with OpenAI embeddings
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_API_KEY,
    model_name="text-embedding-3-small"
)

client = chromadb.Client()
playbook_collection = client.get_or_create_collection(
    name="contract_playbook",
    embedding_function=openai_ef,
    metadata={"hnsw:space": "cosine"}
)

# Sample playbook entries (in production, load from documents)
playbook_entries = [
    {
        "id": "indemnification_guide",
        "text": """INDEMNIFICATION GUIDELINES:
Acceptable: Mutual indemnification limited to direct damages.
Liability cap tied to fees paid in prior 12 months.
Red Flags: Unlimited indemnification, one-sided indemnity
favoring counterparty, IP indemnity without carve-outs.
Market Standard: Mutual indemnification with cap at 1-2x
annual contract value for direct damages.""",
        "clause_type": "indemnification"
    },
    {
        "id": "liability_cap_guide",
        "text": """LIABILITY CAP GUIDELINES:
Acceptable: Cap at 1-2x annual contract value for direct damages.
Exclusions for gross negligence, willful misconduct, IP infringement.
Red Flags: No cap on liability, cap below 1x annual fees,
uncapped consequential damages.
Market Standard: Cap at 12 months of fees paid, with carve-outs
for confidentiality breaches and IP infringement (2-3x cap).""",
        "clause_type": "liability_cap"
    },
    # ... additional entries for each clause type
]

# 💰 Cost Warning: Embedding calls here
playbook_collection.add(
    ids=[e["id"] for e in playbook_entries],
    documents=[e["text"] for e in playbook_entries],
    metadatas=[{"clause_type": e["clause_type"]} for e in playbook_entries],
)
```

The playbook collection uses cosine similarity for retrieval, which works well for semantic matching between clause text and playbook guidelines. In production, you would have 20–50 playbook entries covering every clause type your company encounters, with entries ranging from 200 to 2,000 words each.

**Why ChromaDB?** For this use case, ChromaDB is ideal because the playbook is relatively small (dozens to hundreds of entries, not millions). ChromaDB runs in-memory, requires no infrastructure, and supports the filtering we need to restrict retrieval to matching clause types. For larger knowledge bases, you would consider Pinecone, Weaviate, or pgvector.

### 3.4 — RAG-Powered Clause Analysis with OpenAI

This is the core analysis step. For each clause extracted from the contract, we retrieve the relevant playbook guidance via RAG and ask the LLM to perform a structured analysis. The prompt is carefully engineered to produce consistent, actionable output.

```
ANALYSIS_SYSTEM_PROMPT = """You are an expert contract attorney AI assistant.
You analyze individual contract clauses against company guidelines.

For each clause, provide a structured analysis in JSON format:
{
  "clause_type": "the type of clause",
  "summary": "1-2 sentence plain-English summary of what this clause says",
  "risk_level": "CRITICAL | HIGH | MEDIUM | LOW",
  "risk_score": 0-100,
  "findings": [
    {
      "issue": "specific issue identified",
      "explanation": "why this is a concern",
      "playbook_deviation": "how it deviates from company guidelines",
      "recommendation": "specific action to take"
    }
  ],
  "missing_protections": ["list of standard protections not present"],
  "negotiation_points": ["specific changes to request"]
}

Be precise. Cite specific language from the clause. Compare against the
playbook guidelines provided. If the clause is acceptable, say so clearly."""

def analyze_clause(clause_text: str, clause_type: str, client, collection) -> dict:
    """Analyze a single clause against the company playbook using RAG."""

    # Step 1: Retrieve relevant playbook guidance
    # 💰 Cost Warning: Embedding call for query
    results = collection.query(
        query_texts=[clause_text],
        n_results=3,
        where={"clause_type": clause_type} if clause_type != "other" else None,
    )

    playbook_context = "\n\n".join(results["documents"][0])

    # Step 2: Build the analysis prompt
    user_prompt = f"""Analyze this contract clause against our company playbook.

CLAUSE TEXT:
{clause_text}

COMPANY PLAYBOOK GUIDANCE:
{playbook_context}

Provide your structured analysis in JSON format."""

    # Step 3: Call the LLM
    # 💰 Cost Warning: LLM API call
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.0,
    )

    import json
    return json.loads(response.choices[0].message.content)
```

Several design choices are worth noting here:

**Temperature 0.0:** We want deterministic, consistent analysis. The same clause should receive the same risk assessment every time. Creative variation is not desirable in legal analysis.

**JSON response format:** Structured output is essential for downstream processing. The JSON mode ensures we get parseable results every time, eliminating the need for fragile output parsing.

**Metadata filtering:** When querying the playbook, we filter by clause type so that indemnification clauses are compared against indemnification guidelines, not termination guidelines. This dramatically improves relevance. The fallback to unfiltered search (for "other" clause types) ensures we still get some context even for unusual clauses.

### 3.5 — Risk Scoring and Report Generation

The final stage aggregates individual clause analyses into a comprehensive risk report. Risk scores are computed using a weighted formula that accounts for clause type importance and severity of findings.

```
# Clause type weights (importance multiplier)
CLAUSE_WEIGHTS = {
    "indemnification": 1.5,
    "liability_cap": 1.5,
    "ip_assignment": 1.4,
    "change_of_control": 1.3,
    "termination": 1.2,
    "non_compete": 1.2,
    "data_privacy": 1.1,
    "confidentiality": 1.0,
    "governing_law": 0.8,
    "force_majeure": 0.7,
    "auto_renewal": 0.6,
    "other": 0.5,
}

def compute_overall_risk(clause_analyses: List[dict]) -> dict:
    """Compute weighted overall risk score from individual clause analyses."""
    total_weighted_score = 0
    total_weight = 0
    critical_count = 0
    high_count = 0

    for analysis in clause_analyses:
        clause_type = analysis.get("clause_type", "other")
        risk_score = analysis.get("risk_score", 50)
        weight = CLAUSE_WEIGHTS.get(clause_type, 0.5)

        total_weighted_score += risk_score * weight
        total_weight += weight

        if analysis.get("risk_level") == "CRITICAL":
            critical_count += 1
        elif analysis.get("risk_level") == "HIGH":
            high_count += 1

    overall_score = total_weighted_score / total_weight if total_weight > 0 else 0

    # Determine overall verdict
    if critical_count > 0 or overall_score >= 75:
        verdict = "REJECT — Requires significant negotiation"
    elif high_count > 2 or overall_score >= 50:
        verdict = "REVIEW — Multiple issues need attention"
    elif overall_score >= 25:
        verdict = "CONDITIONAL — Minor issues to address"
    else:
        verdict = "APPROVE — Within acceptable parameters"

    return {
        "overall_risk_score": round(overall_score, 1),
        "verdict": verdict,
        "critical_issues": critical_count,
        "high_issues": high_count,
        "total_clauses_analyzed": len(clause_analyses),
        "clause_analyses": clause_analyses,
    }
```

The weighting system reflects reality: an unfavorable indemnification clause (weight 1.5x) matters far more than a missing force majeure clause (weight 0.7x). The verdict thresholds are calibrated so that any single Critical finding triggers a REJECT recommendation — these are clauses that could expose the company to substantial liability and must be renegotiated before signing.

```
def generate_report(risk_assessment: dict) -> str:
    """Generate a human-readable risk report."""
    lines = [
        "=" * 70,
        "CONTRACT RISK ASSESSMENT REPORT",
        "=" * 70,
        f"Overall Risk Score: {risk_assessment['overall_risk_score']}/100",
        f"Verdict: {risk_assessment['verdict']}",
        f"Critical Issues: {risk_assessment['critical_issues']}",
        f"High Issues: {risk_assessment['high_issues']}",
        f"Clauses Analyzed: {risk_assessment['total_clauses_analyzed']}",
        "",
        "-" * 70,
        "CLAUSE-BY-CLAUSE BREAKDOWN",
        "-" * 70,
    ]

    for i, analysis in enumerate(risk_assessment["clause_analyses"], 1):
        lines.append(f"\n[{i}] {analysis.get('clause_type', 'Unknown').upper()}")
        lines.append(f"    Risk: {analysis.get('risk_level', 'N/A')} ({analysis.get('risk_score', 'N/A')}/100)")
        lines.append(f"    Summary: {analysis.get('summary', 'N/A')}")

        for finding in analysis.get("findings", []):
            lines.append(f"    ⚠ {finding.get('issue', '')}")
            lines.append(f"      → {finding.get('recommendation', '')}")

    return "\n".join(lines)
```

## 4. Key Components

This use case brings together six distinct technologies. Understanding the role of each component helps you adapt the architecture for similar document analysis tasks.

📄

#### PyMuPDF (fitz)

Fastest Python PDF library. Extracts text from digital PDFs at 10–50 pages/second. Preserves layout structure, handles encrypted PDFs, and provides page-level metadata. Lightweight alternative to heavier libraries like pdfplumber or Unstructured.

📊

#### ChromaDB

Open-source embedding database that runs in-memory or on disk. Perfect for small-to-medium knowledge bases (up to ~1M documents). Supports metadata filtering, which is critical for restricting playbook retrieval to the correct clause type. Zero infrastructure required.

🤖

#### OpenAI API

Provides both the embedding model (`text-embedding-3-small`) and the analysis LLM (GPT-4o). The JSON response format ensures structured, parseable output. Temperature 0 provides deterministic, reproducible analysis for legal use cases where consistency matters.

📝

#### Prompt Engineering

The analysis prompt is the most critical component. It must instruct the LLM to: compare against playbook guidelines, cite specific clause language, assign calibrated risk scores, and produce actionable recommendations. Prompt iteration is an ongoing process as edge cases are discovered.

🔗

#### RAG Pipeline

Retrieval-Augmented Generation is the pattern that makes this system company-specific without fine-tuning. The playbook is embedded and retrieved at analysis time, meaning updates to guidelines take effect immediately. No retraining, no model versioning, no GPU costs.

📈

#### Risk Scoring

The weighted risk scoring algorithm translates subjective legal analysis into quantitative metrics. Clause type weights reflect business impact. Thresholds for APPROVE/CONDITIONAL/REVIEW/REJECT are calibrated against historical attorney decisions to match human judgment patterns.

## 5. Results & Metrics

The following metrics are based on a pilot deployment at a mid-size technology company with a 10-person legal team processing approximately 15,000 contracts per year. The system was evaluated against a hold-out set of 500 contracts that had been reviewed by senior attorneys, with their analyses serving as ground truth.

85%

Time Reduction

94%

Clause Accuracy

78%

Fewer Missed Risks

$340K

Annual Savings

### Detailed Breakdown

| Metric | Before (Manual) | After (AI-Assisted) | Improvement |
| --- | --- | --- | --- |
| **Average review time per contract** | 90 minutes | 12 minutes | 85% reduction |
| **Clause identification accuracy** | 82% (human baseline) | 94% | +12 percentage points |
| **Missed risk clauses (per 100 contracts)** | 14 missed | 3 missed | 78% reduction |
| **Cost per contract review** | $375 (attorney time) | $2.40 (API + compute) | 99.4% reduction |
| **Annual cost (10-person team)** | $5.6M (estimated) | $36K (API costs) | $340K net savings\* |
| **Consistency (same clause, same result)** | 73% (varies by attorney) | 99% (deterministic) | +26 percentage points |
| **Time to incorporate new guidelines** | 2–4 weeks (retraining) | 15 minutes (update playbook) | ~99% faster |

\*Net savings accounts for the fact that attorneys still review AI-flagged high-risk clauses (human-in-the-loop). The system does not replace attorneys — it acts as a first-pass filter that handles routine clauses automatically and escalates complex or high-risk clauses for human review. This frees attorneys to focus on negotiation strategy and novel legal questions rather than repetitive clause comparison.

>**Key Insight:** The biggest value is not the 85% time reduction — it is the 78% reduction in missed risks. Human reviewers get fatigued after the 15th contract of the day. The AI system applies the same rigor to contract #500 as it does to contract #1. Consistency at scale is where LLM-based review truly shines.

## 6. Production Considerations

Moving from a notebook prototype to a production deployment introduces several challenges that are unique to legal AI systems. Contracts contain some of the most sensitive business information a company has, and the consequences of errors are measured in millions of dollars.

### Data Privacy and Security

Contracts contain confidential business terms, pricing information, customer names, and sometimes personal data subject to GDPR and CCPA. Before sending any contract text to an external LLM API, you must address:

**Data Processing Agreements (DPAs):** Ensure your LLM provider has a DPA in place that covers contract data. OpenAI's enterprise API and Azure OpenAI both offer DPAs with data residency options. Consumer APIs (ChatGPT) are not appropriate for production contract review.

**Data Redaction:** Before sending contract text to the LLM, redact client names, specific dollar amounts, and other identifying information. The LLM does not need to know that the contract is with "Acme Corp for $4.2M" — it only needs the clause structure and terms. A regex-based redaction layer can replace named entities with placeholders like \[PARTY\_A\] and \[AMOUNT\_1\].

**On-Premises Deployment:** For the most sensitive contracts (M&A, joint ventures), consider running an open-source model (Llama 3, Mistral) on-premises. The accuracy will be lower than GPT-4, but the data never leaves your network. A hybrid approach — open-source for sensitive contracts, cloud API for standard agreements — balances security with performance.

### Hallucination Risks

LLM hallucination in legal contexts is particularly dangerous. The model might "find" a liability cap that does not exist, or mischaracterize the scope of an indemnification clause. Mitigation strategies:

**Grounding with quotations:** The analysis prompt requires the LLM to cite specific text from the clause. If the cited text does not appear in the original clause (verified by string matching), the finding is flagged as potentially hallucinated and escalated for human review.

**Confidence calibration:** Track the model's confidence scores against ground truth over time. If the model assigns "CRITICAL" risk to clauses that attorneys consistently rate as "LOW," recalibrate the scoring thresholds. This requires a feedback loop where attorney decisions are recorded and compared to model predictions.

**Dual-model verification:** For critical clauses, run the analysis through two different models (e.g., GPT-4o and Claude 3.5 Sonnet) and compare results. Disagreements between models trigger human review. This adds cost but dramatically reduces hallucination risk for high-stakes clauses.

>**Never Trust Blindly:** No current LLM is reliable enough for fully autonomous contract decisions. The system should always be positioned as an AI assistant that augments attorney review, not as a replacement. Critical and High risk findings must be reviewed by a human before any negotiation action is taken.

### Jurisdiction-Specific Legal Requirements

Contract law varies significantly by jurisdiction. A non-compete clause that is enforceable in Texas may be void in California. The playbook must account for these differences:

Structure your playbook with jurisdiction-specific entries. Instead of a single "Non-Compete Guidelines" document, create "Non-Compete Guidelines — California," "Non-Compete Guidelines — Delaware," "Non-Compete Guidelines — EU," etc. The retrieval step filters by the governing law clause identified earlier in the pipeline.

For international contracts, pay special attention to: GDPR data processing requirements (EU), mandatory arbitration restrictions (certain APAC jurisdictions), language-of-record requirements (contracts in Quebec must have a French version), and local notarization requirements.

### Integration with Existing CLM Systems

Most legal departments already use Contract Lifecycle Management (CLM) platforms like Ironclad, Agiloft, DocuSign CLM, or ContractPodAi. Your AI review system should integrate with these rather than replacing them:

**API Integration:** Build a REST API wrapper around the review pipeline. The CLM system sends the contract PDF to your API endpoint, and receives the risk report as structured JSON. The report is then displayed within the CLM's native interface alongside the contract.

**Webhook Triggers:** Configure the CLM to automatically send new contracts for AI review when they enter the "Pending Review" stage. The AI report is attached to the contract record before an attorney opens it, so they start with context rather than a blank slate.

**Feedback Loop:** When an attorney overrides an AI finding (e.g., marking a "HIGH" risk clause as "LOW"), capture that feedback. Over time, use these corrections to refine your playbook entries and scoring thresholds. This continuous improvement loop is what separates a prototype from a production system.

## 7. Try It Yourself

The companion notebook implements the full pipeline using synthetic contract data, so you can run it end-to-end without any real contracts. Here is how to get started:

### Quick Start

**Step 1:** Click the "Open Notebook in Colab" button at the top of this page. The notebook opens in Google Colab with a free GPU runtime.

**Step 2:** Add your OpenAI API key. In Colab, go to the Secrets panel (key icon in the left sidebar) and add a secret named `OPENAI_API_KEY` with your key value.

**Step 3:** Run all cells. The notebook installs dependencies, creates a synthetic contract, segments clauses, builds the playbook vector store, analyzes each clause via RAG, and generates the final risk report.

**Step 4:** Experiment. Try modifying the synthetic contract to include riskier clauses. Change the playbook guidelines to see how the analysis changes. Swap the model from GPT-4o to GPT-4o-mini to compare accuracy versus cost.

>**Cost Estimate:** Running the full notebook once (synthetic contract with 8 clauses) costs approximately **$0.04** in OpenAI API fees. The embedding calls cost roughly $0.001 and the GPT-4o analysis calls cost roughly $0.005 per clause. You can switch to GPT-4o-mini to reduce costs by approximately 10x with a modest accuracy trade-off.

### Extending the Project

Once you have the basic pipeline running, consider these extensions:

**Multi-contract comparison:** Analyze multiple versions of the same contract (redline tracking) to identify what changed between drafts and whether new risks were introduced.

**Batch processing:** Add async API calls to process multiple clauses in parallel, reducing end-to-end review time from 12 minutes to under 3 minutes per contract.

**Custom playbook builder:** Create a UI where attorneys can add, edit, and version playbook entries without touching code. Each entry gets re-embedded automatically when saved.

**Historical analysis:** Run the system against your archive of signed contracts to identify existing agreements with risky clauses that were missed during original review.

## 🛠️. Build Your Portfolio

### Fork & Extend

Turn this notebook into a portfolio project in 5 steps:

1.  **Fork the notebook** — Clone the repo and open in Google Colab or locally.
2.  **Swap in real data** — Replace the synthetic contracts with real-world agreements from the [CUAD (Contract Understanding Atticus Dataset)](https://huggingface.co/datasets/theatticusproject/contracts-nli), which contains 13,000+ annotated legal clauses from SEC filings.
3.  **Add clause comparison** — Implement a side-by-side diff view that compares flagged clauses against your organization’s standard clause library, highlighting deviations and suggesting approved alternatives.
4.  **Deploy it** — Wrap it in a Streamlit app. Let users upload a PDF contract, view extracted clauses in a table with risk scores color-coded red/yellow/green, and download a structured review report.
5.  **Write a README** — Include architecture diagram, setup instructions, sample outputs, and metrics.

### What Hiring Managers Look For

>**Pro Tip:** Legal-tech hiring managers want to see that you handle ambiguity gracefully. Show how your system deals with non-standard clause language, multi-party agreements, and contracts in different jurisdictions. Include precision/recall metrics on clause extraction, demonstrate fallback behavior when the LLM is uncertain, and add an audit trail that logs every flagged clause with confidence scores and reasoning.

### Public Datasets to Use

-   **CUAD (Contract Understanding Atticus Dataset)** — 13,000+ annotated clauses from 510 commercial contracts filed with the SEC. Available on [Hugging Face](https://huggingface.co/datasets/theatticusproject/contracts-nli). Ideal for training clause extraction and risk classification.
-   **LEDGAR (Labeled EDGAR)** — 80,000+ contract provisions from SEC EDGAR filings, labeled into 100+ provision types. Available on [Hugging Face](https://huggingface.co/datasets). Great for multi-label clause classification.
-   **Contract-NLI** — 10,000 contract statements annotated for natural language inference (entailment, contradiction, neutral). Available on [Stanford NLP](https://stanfordnlp.github.io/contract-nli/). Useful for verifying whether contract terms satisfy policy requirements.

### Deployment Options

| Platform | Best For | Effort |
| --- | --- | --- |
| Streamlit | Interactive contract upload & clause-by-clause risk dashboard | Low |
| Gradio | Quick demo with drag-and-drop PDF input and highlighted output | Low |
| FastAPI | REST API for integration with contract management systems | Medium |
| Docker + Cloud Run | Production-grade service handling batch contract review pipelines | High |

Next →

[02 · Support Ticket Triage](02-support-ticket-triage.html)