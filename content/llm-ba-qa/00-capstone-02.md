---
title: "Capstone 2: Automated BRD Analyzer"
slug: "capstone-02"
description: "Business Requirements Documents are the foundation of every project, yet they are riddled with ambiguity, missing edge cases, and inconsistencies that only surface months later during UAT. In this capstone, you will build a tool that analyzes a BRD in minutes, producing a structured quality report t"
section: "llm-ba-qa"
order: 15
part: "Part 05 Capstones"
---

Part 5 — Capstones

# Capstone 2: Automated BRD Analyzer

Business Requirements Documents are the foundation of every project, yet they are riddled with ambiguity, missing edge cases, and inconsistencies that only surface months later during UAT. In this capstone, you will build a tool that analyzes a BRD in minutes and produces a structured quality report that flags problems before a single line of code is written.

Building time: ~2 hours Chapters used: 3, 5, 7, 15

### What You Will Build

-   A BRD parser that extracts sections, requirements, acceptance criteria, and dependencies from structured documents
-   A completeness checker that verifies the BRD covers all expected sections and has no orphaned references
-   An ambiguity detector that flags vague language, undefined terms, and unmeasurable criteria
-   A compliance scanner that checks requirements against organizational templates and industry standards
-   A quality scorecard that summarizes findings with an overall readiness score

![Diagram 1](/diagrams/llm-ba-qa/capstone-02-1.svg)

Figure C2.1 — The BRD Analyzer uses a three-layer architecture: parse the document, run three independent analysis checks in parallel, then aggregate findings into a quality scorecard.

## Architecture Overview

The analyzer uses a three-layer architecture: parsing, analysis, and reporting. The parsing layer extracts structure from the document. The analysis layer runs multiple independent checks in parallel. The reporting layer aggregates findings into a scorecard.

**Data models:** The analyzer uses Pydantic to represent the parsed BRD and every finding:

```python
from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional

class Severity(str, Enum):
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"
    INFO = "info"

class FindingCategory(str, Enum):
    COMPLETENESS = "completeness"
    AMBIGUITY = "ambiguity"
    COMPLIANCE = "compliance"
    CONSISTENCY = "consistency"

class BRDSection(BaseModel):
    """A parsed section of the BRD."""
    heading: str
    level: int = Field(description="Heading level: 1, 2, or 3")
    content: str
    requirements: list[str] = Field(default_factory=list)
    word_count: int = 0

class Finding(BaseModel):
    """A single quality issue found in the BRD."""
    id: str
    category: FindingCategory
    severity: Severity
    location: str = Field(description="Section heading or requirement ID")
    description: str
    suggestion: str = Field(description="Actionable fix recommendation")
    original_text: Optional[str] = None

class BRDAnalysis(BaseModel):
    """Complete analysis result."""
    document_name: str
    total_sections: int
    total_requirements: int
    total_word_count: int
    findings: list[Finding]
    completeness_score: float = Field(ge=0, le=100)
    ambiguity_score: float = Field(ge=0, le=100)
    compliance_score: float = Field(ge=0, le=100)
    overall_score: float = Field(ge=0, le=100)
```

## Step 1: Setup and Data Ingestion

Create the project structure and a sample BRD to analyze:

Here is a sample BRD with deliberate quality issues for the analyzer to find:

Create a sample BRD for a Customer Portal Redesign with deliberate quality issues for the analyzer to find: vague terms ("modern," "easy to use," "fast," "quickly," "relevant"), missing sections (no risk analysis, no data requirements, no acceptance criteria), inconsistent modal verbs ("shall" vs. "should"), and undefined thresholds ("failed login attempts" without specifying how many).

Notice the deliberate issues: vague terms ("modern," "easy to use," "fast," "quickly," "relevant"), missing sections (no risk analysis, no data requirements, no acceptance criteria), inconsistent modal verbs ("shall" vs. "should"), and undefined thresholds ("failed login attempts": how many?).

The parsing module extracts structure from the document:

The parsing module reads the BRD line by line, detecting headings by the `#` prefix. For each section it records the heading text, heading level, content, word count, and any requirement IDs found (matching patterns like `FR-001`, `NFR-01`). This structured representation feeds into all three analyzers.

## Step 2: Core Processing Pipeline — The Three Analyzers

Each analyzer is a focused module that examines one quality dimension. They run independently and produce a list of `Finding` objects.

### 2a. Completeness Checker

The completeness checker compares the BRD's sections against a configurable template of expected sections. It also checks for orphaned references and missing acceptance criteria.

The completeness checker compares the BRD's section headings against a configurable list of expected sections (Executive Summary, Scope, Functional Requirements, Non-Functional Requirements, Data Requirements, Risks, Acceptance Criteria, Glossary, etc.). Missing sections generate findings with severity based on importance: missing Scope or Acceptance Criteria is "major," missing Glossary is "minor." It also flags sections with fewer than 20 words as likely incomplete.

### 2b. Ambiguity Detector

The ambiguity detector uses both rule-based pattern matching (for known vague terms) and LLM analysis (for subtler issues like missing quantifiers and undefined scope). This hybrid approach is faster and cheaper than sending everything to the LLM, while catching more issues than rules alone.

```python
"""modules/ambiguity.py — Detect ambiguous language in requirements."""
import json
import os
import re
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Rule-based: known vague terms
VAGUE_TERMS = [
    (r"\bfast\b", "Define specific response time (e.g., 'under 200ms')"),
    (r"\bquickly\b", "Define specific time threshold"),
    (r"\bmodern\b", "Specify technologies, design patterns, or standards"),
    (r"\beasy to use\b", "Define usability criteria (e.g., 'task completion in < 3 clicks')"),
    (r"\brelevant\b", "Specify exactly which items are relevant and to whom"),
    (r"\bappropriate\b", "Define specific criteria for appropriateness"),
    (r"\buser[- ]friendly\b", "Define measurable usability targets"),
    (r"\befficient\b", "Define specific performance metrics"),
    (r"\bseveral\b", "Specify an exact number or range"),
    (r"\bvarious\b", "List the specific items"),
    (r"\betc\.?\b", "List all items explicitly — 'etc.' hides requirements"),
    (r"\bmultiple formats\b", "List the specific formats (e.g., PDF, CSV, XLSX)"),
    (r"\brelevant regulations\b", "Name the specific regulations (e.g., GDPR, SOX, HIPAA)"),
]

MODAL_INCONSISTENCY = {
    "shall": "mandatory requirement",
    "should": "recommended but optional",
    "may": "truly optional",
    "will": "statement of fact, not a requirement",
    "must": "mandatory (equivalent to shall)",
}

def detect_vague_terms(sections: list[dict]) -> list[dict]:
    """Find known vague terms using regex patterns."""
    findings = []
    finding_id = 0

    for section in sections:
        for pattern, suggestion in VAGUE_TERMS:
            matches = re.finditer(pattern, section["content"], re.IGNORECASE)
            for match in matches:
                finding_id += 1
                # Extract surrounding context
                start = max(0, match.start() - 40)
                end = min(len(section["content"]), match.end() + 40)
                context = section["content"][start:end].strip()

                findings.append({
                    "id": f"AMB-{finding_id:03d}",
                    "category": "ambiguity",
                    "severity": "major",
                    "location": section["heading"],
                    "description": f"Vague term '{match.group()}' found",
                    "suggestion": suggestion,
                    "original_text": f"...{context}...",
                })

    return findings


def detect_modal_inconsistencies(sections: list[dict]) -> list[dict]:
    """Flag inconsistent use of shall/should/may/will."""
    findings = []
    modal_usage = {}

    for section in sections:
        for req_id in section.get("requirements", []):
            for modal in MODAL_INCONSISTENCY:
                if re.search(rf"\b{modal}\b", section["content"], re.IGNORECASE):
                    modal_usage.setdefault(section["heading"], set()).add(modal)

    finding_id = 0
    for heading, modals in modal_usage.items():
        if "shall" in modals and "should" in modals:
            finding_id += 1
            findings.append({
                "id": f"AMB-M-{finding_id:03d}",
                "category": "ambiguity",
                "severity": "minor",
                "location": heading,
                "description": (
                    f"Mixed modal verbs in section: {', '.join(sorted(modals))}. "
                    f"'shall' = mandatory, 'should' = optional. Is this intentional?"
                ),
                "suggestion": (
                    "Use 'shall' consistently for mandatory requirements. "
                    "Reserve 'should' for recommendations and 'may' for options."
                ),
                "original_text": None,
            })

    return findings


def llm_ambiguity_check(sections: list[dict]) -> list[dict]:
    """Use an LLM to find subtler ambiguity issues."""
    # Only send requirement-containing sections to save tokens
    req_sections = [s for s in sections if s.get("requirements")]
    if not req_sections:
        return []

    content_block = "\n\n".join(
        f"### {s['heading']}\n{s['content']}" for s in req_sections
    )

    prompt = f"""Analyze these requirements for ambiguity issues that simple
pattern matching would miss. Look for:
1. Missing boundary conditions (e.g., "after failed attempts" without a count)
2. Undefined scope (e.g., "generate reports" without specifying which reports)
3. Implicit assumptions not stated
4. Conflicting requirements

Requirements:
{content_block}

Return a JSON array of findings. Each finding:
{{"location": "section or req ID", "description": "what's ambiguous",
  "suggestion": "how to fix it", "severity": "major or minor"}}

Return ONLY the JSON array."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a senior BA reviewing a BRD. "
             "Be specific and actionable. Return only JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=1500,
    )

    raw = response.choices[0].message.content.strip()
    try:
        items = json.loads(raw)
    except json.JSONDecodeError:
        import re as re2
        match = re2.search(r"\[.*\]", raw, re2.DOTALL)
        items = json.loads(match.group()) if match else []

    findings = []
    for i, item in enumerate(items, 1):
        findings.append({
            "id": f"AMB-LLM-{i:03d}",
            "category": "ambiguity",
            "severity": item.get("severity", "major"),
            "location": item.get("location", "Unknown"),
            "description": item.get("description", ""),
            "suggestion": item.get("suggestion", ""),
            "original_text": None,
        })

    return findings
```

### 2c. Compliance Scanner

The compliance scanner checks the BRD against configurable rules: organizational naming conventions, required metadata fields, and standards references:

The compliance scanner runs rule-based checks against the full BRD text: presence of version number, author, and date in metadata; consistency of requirement ID formats (flagging if FR-001 and NFR-01 use different digit counts); presence of acceptance criteria anywhere in the document; and existence of traceability references. Each failed check generates a finding with a specific, actionable recommendation for how to fix it.

## Step 3: Output Generation — The Quality Scorecard

The scorecard aggregates all findings into a single readiness score. The scoring algorithm weights findings by severity and category:

```python
"""modules/scorecard.py — Calculate quality scores and generate the report."""
import json
from datetime import datetime
from pathlib import Path

SEVERITY_DEDUCTIONS = {
    "critical": 15,
    "major": 8,
    "minor": 3,
    "info": 0,
}

def calculate_scores(findings: list[dict]) -> dict:
    """Calculate quality scores per category and overall."""
    categories = {
        "completeness": {"score": 100, "findings": 0},
        "ambiguity": {"score": 100, "findings": 0},
        "compliance": {"score": 100, "findings": 0},
        "consistency": {"score": 100, "findings": 0},
    }

    for finding in findings:
        cat = finding.get("category", "completeness")
        sev = finding.get("severity", "minor")
        if cat in categories:
            categories[cat]["score"] -= SEVERITY_DEDUCTIONS.get(sev, 3)
            categories[cat]["findings"] += 1

    # Clamp scores to 0-100
    for cat in categories:
        categories[cat]["score"] = max(0, categories[cat]["score"])

    # Overall score: weighted average
    weights = {"completeness": 0.30, "ambiguity": 0.35,
               "compliance": 0.20, "consistency": 0.15}
    overall = sum(
        categories[cat]["score"] * weights.get(cat, 0.25)
        for cat in categories
    )

    return {
        "completeness_score": categories["completeness"]["score"],
        "ambiguity_score": categories["ambiguity"]["score"],
        "compliance_score": categories["compliance"]["score"],
        "consistency_score": categories["consistency"]["score"],
        "overall_score": round(overall, 1),
    }


def generate_report(
    document_name: str,
    sections: list[dict],
    findings: list[dict],
    scores: dict,
    output_dir: str = "output",
) -> str:
    """Generate the final analysis report."""
    out = Path(output_dir)
    out.mkdir(exist_ok=True)

    total_reqs = sum(len(s.get("requirements", [])) for s in sections)
    total_words = sum(s.get("word_count", 0) for s in sections)

    # Group findings by severity
    by_severity = {}
    for f in findings:
        sev = f.get("severity", "minor")
        by_severity.setdefault(sev, []).append(f)

    # Build report
    lines = [
        f"# BRD Quality Analysis Report",
        f"**Document:** {document_name}",
        f"**Analyzed:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        "## Quality Scorecard",
        "",
        "| Dimension     | Score  | Rating         |",
        "|---------------|--------|----------------|",
    ]

    for dim in ["completeness", "ambiguity", "compliance", "consistency"]:
        score = scores.get(f"{dim}_score", 0)
        rating = _score_to_rating(score)
        lines.append(f"| {dim.title():13s} | {score:5.1f}% | {rating:14s} |")

    lines.append(f"| **Overall**   | **{scores['overall_score']:.1f}%** | "
                 f"**{_score_to_rating(scores['overall_score'])}** |")
    lines.append("")

    # Document stats
    lines.extend([
        "## Document Statistics",
        f"- **Sections:** {len(sections)}",
        f"- **Requirements:** {total_reqs}",
        f"- **Word count:** {total_words:,}",
        f"- **Total findings:** {len(findings)}",
        "",
    ])

    # Findings by severity
    for severity in ["critical", "major", "minor", "info"]:
        items = by_severity.get(severity, [])
        if items:
            lines.append(f"## {severity.title()} Findings ({len(items)})")
            lines.append("")
            for f in items:
                lines.append(f"### {f['id']}: {f['description']}")
                lines.append(f"**Location:** {f['location']}  ")
                lines.append(f"**Category:** {f['category']}  ")
                if f.get("original_text"):
                    lines.append(f'**Text:** "{f["original_text"]}"  ')
                lines.append(f"**Recommendation:** {f['suggestion']}")
                lines.append("")

    report_text = "\n".join(lines)

    # Write outputs
    report_path = out / "brd_analysis_report.md"
    report_path.write_text(report_text, encoding="utf-8")

    json_path = out / "brd_analysis.json"
    json_path.write_text(json.dumps({
        "document_name": document_name,
        "analyzed_at": datetime.now().isoformat(),
        "scores": scores,
        "sections_count": len(sections),
        "requirements_count": total_reqs,
        "findings": findings,
    }, indent=2), encoding="utf-8")

    print(f"Report: {report_path}")
    print(f"JSON:   {json_path}")
    return str(report_path)


def _score_to_rating(score: float) -> str:
    if score >= 90:
        return "Excellent"
    elif score >= 75:
        return "Good"
    elif score >= 60:
        return "Needs Work"
    elif score >= 40:
        return "Poor"
    else:
        return "Critical"
```

## Step 4: Validation and Quality

Before trusting the output of the analyzer, you need to validate its findings. This step implements self-checks and a confidence calibration layer that uses the LLM to review its own findings (Chapter 15).

The validation module performs two cleanup passes: **deduplication** removes findings with the same location and similar descriptions, and **severity calibration** sends the top 10 major/critical findings to the LLM for review, asking it to assess whether each severity rating is appropriate. If the LLM recommends a downgrade (e.g., from "major" to "minor"), the finding is adjusted. This reduces false positives and builds trust in the analyzer's output.

Now the main orchestrator that ties all stages together:

```python
"""main.py — Orchestrate the BRD analysis pipeline."""
from pathlib import Path
from modules.parse_brd import parse_brd
from modules.completeness import check_completeness
from modules.ambiguity import detect_vague_terms, detect_modal_inconsistencies, llm_ambiguity_check
from modules.compliance import scan_compliance
from modules.validate import deduplicate_findings, validate_severity
from modules.scorecard import calculate_scores, generate_report


def analyze_brd(file_path: str):
    """Run the full BRD analysis pipeline."""
    print("=" * 60)
    print("BRD Quality Analyzer")
    print("=" * 60)

    full_text = Path(file_path).read_text(encoding="utf-8")

    # Stage 1: Parse
    print("\n[1/4] Parsing document...")
    sections = parse_brd(file_path)

    # Stage 2: Analyze (three parallel checks)
    print("\n[2/4] Running analysis checks...")
    findings = []

    print("  Running completeness check...")
    findings.extend(check_completeness(sections))

    print("  Running ambiguity detection (rules)...")
    findings.extend(detect_vague_terms(sections))

    print("  Running modal consistency check...")
    findings.extend(detect_modal_inconsistencies(sections))

    print("  Running ambiguity detection (LLM)...")
    findings.extend(llm_ambiguity_check(sections))

    print("  Running compliance scan...")
    findings.extend(scan_compliance(sections, full_text))

    # Stage 3: Validate
    print(f"\n[3/4] Validating {len(findings)} findings...")
    findings = deduplicate_findings(findings)
    findings = validate_severity(findings)

    # Stage 4: Score and report
    print("\n[4/4] Generating scorecard and report...")
    scores = calculate_scores(findings)
    report_path = generate_report(
        document_name=Path(file_path).name,
        sections=sections,
        findings=findings,
        scores=scores,
    )

    # Summary
    print("\n" + "=" * 60)
    print(f"Overall Score: {scores['overall_score']:.1f}% "
          f"({_score_to_rating(scores['overall_score'])})")
    print(f"Findings: {len(findings)} total")
    print("=" * 60)


def _score_to_rating(score):
    if score >= 90: return "Excellent"
    elif score >= 75: return "Good"
    elif score >= 60: return "Needs Work"
    elif score >= 40: return "Poor"
    else: return "Critical"


if __name__ == "__main__":
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "data/sample_brd.md"
    analyze_brd(path)
```

## Extensions and Portfolio Tips

-   **Add a BRD template generator.** After analyzing a BRD, offer to generate a corrected version with all missing sections pre-populated with placeholder text and all ambiguous terms replaced with measurable alternatives. This turns the analyzer into a complete authoring assistant.
-   **Build a comparison mode.** Accept two BRD versions and highlight what changed, what improved, and what regressed. This is useful for tracking document maturity across review cycles.
-   **Integrate with Confluence.** Use the Confluence REST API to pull BRDs directly from your organization's wiki and push the analysis report back as a comment. This eliminates file-handling friction.
-   **Add industry-specific rule packs.** Create rule sets for healthcare (HIPAA references), finance (SOX compliance), or government (Section 508 accessibility). Store them as YAML configuration files so users can select the appropriate pack.
-   **Build a trend dashboard.** Store analysis results over time and plot quality scores per project. Showing that BRD quality improved from 45% to 82% over three sprints tells a powerful story.

**Portfolio presentation tip:** Show a before-and-after. Present the sample BRD with all its issues, then show the report from the analyzer, then show the improved BRD. The visual progression from messy to clean is compelling. Include the quality scorecard as a screenshot. Hiring managers respond well to dashboards.

## Summary

-   You built a multi-dimensional BRD analyzer that checks completeness, ambiguity, and compliance in a single pass.
-   The hybrid approach — rule-based checks for known patterns, LLM analysis for subtle issues — balances speed, cost, and accuracy.
-   The quality scorecard turns subjective assessments ("this BRD looks okay") into objective, repeatable measurements.
-   Severity validation using LLM self-review reduces false positives and builds trust in automated findings.
-   The modular architecture makes it easy to add new rule packs, industry standards, or custom checks without touching existing code.