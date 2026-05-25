---
title: "Capstone: Automated BRD Analyzer"
slug: "capstone-brd-analyzer"
description: "Build an LLM-powered Business Requirements Document analyzer that checks for ambiguity, incompleteness, untestable requirements, and inter-requirement conflicts — and produces a prioritized remediation report for the BA team."
section: "ai-beyond-the-demo"
order: 67
part: "Part VII — Capstones"
---

Part VII — Capstones

# Capstone: Automated BRD Analyzer

Business Requirements Documents arrive for review containing ambiguous language, unstated assumptions, missing acceptance criteria, and conflicts between requirements that were written by different stakeholders at different times. Finding these problems manually requires experienced BAs reviewing every requirement carefully — work that is valuable but slow. The automated BRD analyzer surfaces these problems systematically, so that human review can focus on resolution rather than detection.

## Scenario

A financial services BA team reviews 20–30 BRDs per year, each averaging 80–120 requirements. Manual quality review takes 2–3 days per BRD. The analyzer completes the quality check in under 10 minutes and produces a prioritized remediation report that the BA team uses as a structured review agenda — focusing discussion on the identified problems rather than reading every requirement from scratch.

## Architecture

**Analysis dimensions:**
1. Ambiguity detection: requirements with terms that different readers interpret differently
2. Completeness checking: requirements missing preconditions, acceptance criteria, or error cases
3. Testability assessment: requirements that cannot be directly tested
4. Conflict detection: requirements that contradict each other
5. Business rule extraction: implicit business rules that should be made explicit

**Pipeline:**
```
BRD Document → [Parse requirements] → Individual requirement objects
→ [Per-requirement analysis] → Issue flags per requirement
→ [Cross-requirement analysis] → Conflict flags
→ [Aggregate and prioritize] → Remediation report
```

## Implementation

**Requirements parsing:**
```
Parse the following BRD section into individual requirements. Each requirement should be:
- A single, atomic requirement (not a compound requirement)
- Assigned an ID if one is present, or a generated ID if not
- Tagged with its section and requirement type (functional/non-functional/constraint)

BRD section: {text}

Return as JSON array.
```

**Ambiguity detection:**
```
Analyze the following requirement for ambiguous terms — words or phrases that different stakeholders might interpret differently. Common ambiguous terms include: "appropriate", "as needed", "user-friendly", "fast", "secure", "flexible", "support", "handle", "manage".

For each ambiguous term found:
- Quote the ambiguous term
- Explain why it is ambiguous (what different interpretations are possible)
- Suggest a more precise reformulation

Requirement: {requirement_text}
```

**Conflict detection (cross-requirement):**
```
Review the following set of requirements and identify any that appear to conflict with each other. A conflict exists when two requirements cannot both be satisfied simultaneously, or when they specify different behavior for the same situation.

For each conflict found:
- Identify the two (or more) requirements involved
- Describe the specific conflict
- Note whether it is a direct contradiction or a potential ambiguity that could manifest as a conflict

Requirements: {requirements_batch}
```

**Prioritization scoring:**
```python
SEVERITY_WEIGHTS = {
    "direct_contradiction": 10,    # must resolve before development
    "ambiguity_in_core_flow": 8,   # high priority
    "missing_error_handling": 6,   # important for completeness
    "untestable": 5,               # blocks QA
    "ambiguity_in_edge_case": 3,   # lower priority
    "implicit_rule": 2             # advisory
}
```

**Remediation report structure:**
```
BRD Quality Analysis — [Document Title]
Analyzed: N requirements | Issues found: M

CRITICAL (resolve before development begins):
[List of direct contradictions with specific requirements cited]

HIGH PRIORITY:
[List of core flow ambiguities and missing error handling]

MEDIUM PRIORITY:
[List of untestable requirements and secondary ambiguities]

ADVISORY:
[List of implicit rules to make explicit]

REQUIREMENTS WITHOUT ISSUES: [count] requirements passed all checks
```

## Key Learning Points

**Batch cross-requirement analysis is essential.** Ambiguity and completeness checks can be run per-requirement. Conflict detection must run across requirement pairs or the full requirement set — conflicts are invisible when requirements are analyzed in isolation. For large BRDs, use sliding windows of 20–30 requirements for conflict detection.

**Domain context improves detection accuracy.** A financial services BRD has domain-specific ambiguity patterns ("appropriate risk disclosure", "timely notification") that a domain-aware system prompt catches more reliably. Include the document's industry domain in the system prompt.

**False positives are managed by prioritization, not elimination.** The analyzer will flag some issues that the BA team considers acceptable. The remediation report's priority tiers allow the team to focus on critical issues and review lower-priority flags with appropriate skepticism. Calibrate the detection thresholds to produce a manageable number of high-priority flags (10–15 for an 80-requirement BRD) rather than trying to eliminate all false positives.

**The report format drives adoption.** BAs who receive an unstructured list of issues do not know where to start. The prioritized report with specific requirement citations, quoted text, and suggested reformulations gives the BA team a clear action sequence. Invest in the report format — it determines whether the tool gets used.
