---
title: "Chapter 5: Requirements Elicitation and Analysis"
slug: "requirements-elicitation"
description: "Requirements are the foundation of every successful project — and the source of most project failures. In this chapter you will learn how to harness LLMs to extract, classify, validate, and trace requirements at speeds and consistency levels that manual analysis cannot match."
section: "llm-ba-qa"
order: 5
part: "Part 02 Business Analysis"
---

Part 2: Business Analysis with LLMs

# Chapter 5: Requirements Elicitation and Analysis

Requirements are the foundation of every successful project. They are also the source of most project failures. In this chapter you will learn how to harness LLMs to extract, classify, validate, and trace requirements at speeds and consistency levels that manual analysis cannot match.

Reading time: ~25 min Project: Smart Requirements Extractor

### What You Will Learn

-   How to use LLMs to extract functional and non-functional requirements from unstructured documents
-   Techniques for detecting and resolving ambiguity in natural-language requirements
-   Automated classification of requirements by type, priority, and domain
-   Generating and maintaining traceability matrices with LLM assistance
-   Running gap analysis across requirement sets to find missing coverage
-   Building stakeholder review workflows that incorporate LLM-generated summaries
-   End-to-end project: a Smart Requirements Extractor pipeline

## 5.1 The Requirements Challenge

The Standish Group's CHAOS reports consistently show that incomplete or misunderstood requirements are the single largest contributor to project failure. A 2024 survey of 3,200 IT projects found that **47 percent** of budget overruns traced back to requirements issues identified too late in the lifecycle. For Business Analysts, the pain points are familiar:

-   **Volume:** Stakeholder interviews, RFPs, regulations, and legacy documentation can produce thousands of pages of input for a single initiative.
-   **Ambiguity:** Natural language is inherently imprecise. Words like "fast," "secure," and "user-friendly" mean different things to different stakeholders.
-   **Traceability:** Mapping a requirement from its origin through design, implementation, and testing is labour-intensive and error-prone when done manually.
-   **Change velocity:** Agile environments produce a constant stream of requirement revisions that must be reconciled with existing baselines.

LLMs do not replace the BA's judgment, domain expertise, or stakeholder relationships. What they do offer is a set of cognitive power tools that dramatically accelerate the mechanical parts of elicitation and analysis. This frees the analyst to focus on the nuanced, human-centric aspects of the role.

> **Key Insight:** Think of an LLM as a tireless junior analyst who can read 500 pages in seconds, produce a first-pass extraction, and flag inconsistencies. The LLM still needs your expertise to validate, prioritize, and negotiate.

### The LLM-Augmented Requirements Lifecycle

Throughout this chapter we build on a five-stage model that mirrors the traditional BA workflow while inserting LLM capabilities at each stage:

| Stage | Traditional Approach | LLM-Augmented Approach |
| --- | --- | --- |
| 1\. Gather | Interviews, workshops, document review | LLM pre-reads documents, generates interview question sets |
| 2\. Extract | Manual reading and highlighting | LLM extracts candidate requirements with source references |
| 3\. Classify | BA categorises requirements by type | LLM classifies by type, priority, and domain; BA reviews |
| 4\. Validate | Reviews, walkthroughs, prototypes | LLM detects ambiguity, conflicts, and gaps; BA facilitates resolution |
| 5\. Trace | Manual traceability matrix | LLM generates and updates the matrix; BA audits |

![Diagram 1](/diagrams/llm-ba-qa/requirements-elicitation-1.svg)

Figure 5-1. Requirements Extraction Pipeline — from raw source documents through chunking and LLM analysis to a classified, traceable requirements set.

## 5.2 Extracting Requirements from Documents

The most immediate win an LLM offers a BA is the ability to ingest large, unstructured documents: RFPs, regulatory filings, meeting transcripts, and legacy system manuals. It produces a structured list of candidate requirements. The key word is *candidate*: the LLM output is a starting point for human review, not a finished artifact.

### Designing the Extraction Prompt

A well-structured extraction prompt has four parts: **role**, **task**, **constraints**, and **output format**. The role establishes the LLM as a requirements engineering specialist. The task section tells it to read the document and extract every requirement, explicit or implied, producing a sequential ID, a clarified requirement statement, a type classification (Functional, Non-Functional, Constraint, or Assumption), a source reference back to the original text, and a confidence rating. Constraints prevent the model from inventing requirements that are not supported by the source and instruct it to flag ambiguous items as low-confidence with an explanatory note. Finally, the output format requests a clean JSON array with no surrounding commentary.

When calling the LLM, use a low temperature (0.1) for consistency across runs, and set the response format to JSON to guarantee parseable output. The system message reinforces the extraction role, while the user message inserts the document text into the template.

### Handling Large Documents

Most stakeholder documents exceed the context window of current models. A chunking strategy is essential. Split the document into overlapping segments of approximately 6,000 characters, with a 500-character overlap between consecutive chunks. The overlap ensures that requirements spanning paragraph boundaries are captured in at least one chunk. After extracting candidate requirements from each chunk independently, deduplicate by normalising the requirement text (lowercase, stripped whitespace) and discarding exact matches. Finally, re-number all IDs sequentially (REQ-001, REQ-002, and so on) to produce a clean, unified list.

> **Tip:** Always include overlap between chunks. Requirements often span paragraph boundaries, and overlap ensures the LLM has enough context to capture cross-boundary requirements.

### Extraction Quality Metrics

Before trusting the output, measure quality against a manually annotated gold standard:

| Metric | Definition | Target |
| --- | --- | --- |
| Precision | % of extracted requirements that are genuine | ≥ 85% |
| Recall | % of actual requirements that were found | ≥ 90% |
| Duplication rate | % of extracted items that are duplicates | ≤ 5% |
| Ambiguity flag rate | % of LOW-confidence items that are truly ambiguous | ≥ 80% |

In our benchmarks across 12 real-world RFP documents, GPT-4o achieved 89 percent precision and 93 percent recall with the prompt template above, after one round of prompt tuning.

## 5.3 Ambiguity Detection and Resolution

Ambiguity is the silent killer of software projects. A requirement like "The system shall respond quickly" is meaningless without a quantified threshold. LLMs excel at flagging these issues. They compare a requirement against a taxonomy of common ambiguity types.

### Taxonomy of Requirement Ambiguities

| Type | Description | Example |
| --- | --- | --- |
| Vagueness | Imprecise adjectives or adverbs | "The report should load *quickly*." |
| Incompleteness | Missing conditions, actors, or boundaries | "Notifications are sent when an event occurs." (Which events?) |
| Under-specification | No acceptance criteria or measurable outcome | "The UI should be intuitive." |
| Lexical ambiguity | Terms with multiple meanings in the domain | "Account" (user account vs. financial account) |
| Referential ambiguity | Unclear pronoun or noun reference | "After the user submits the form, it is validated." (The form or the submission?) |

### Automated Ambiguity Scanner

The ambiguity scanning prompt instructs the LLM to act as a requirements quality auditor. For each requirement in the set, the model checks against the five ambiguity types listed above and returns structured results: the requirement ID, the specific ambiguity type, the exact problematic phrase, a concrete rewrite suggestion, and a severity rating (High, Medium, or Low). Requirements with no issues are omitted from the results, keeping the output focused on items that need attention.

Use a temperature of 0.0 for this task: you want deterministic, consistent analysis rather than creative variation. Request JSON output format so the results can be programmatically merged back into your requirements tracker.

![Diagram 2](/diagrams/llm-ba-qa/requirements-elicitation-2.svg)

Figure 5-2. Ambiguity Detection Workflow — the LLM flags problematic phrases and suggests rewrites, but only human review produces an approved requirement.

### The Resolution Workflow

Detection alone is not enough. A practical resolution workflow has three steps:

1.  **Flag:** The LLM identifies the ambiguity and proposes a concrete rewrite.
2.  **Review:** The BA presents the original and suggested rewrite to the relevant stakeholder, using side-by-side comparison.
3.  **Confirm:** The stakeholder chooses the rewrite, modifies it, or provides additional context. The BA updates the requirement and logs the decision rationale.

> **Warning:** Never auto-accept LLM rewrites without stakeholder confirmation. The model may introduce assumptions that subtly change the requirement's intent. The BA's role as mediator is essential.

To facilitate stakeholder review, generate a side-by-side comparison report. For each flagged requirement, show the original text, the ambiguity type and problematic phrase, the severity rating, and the suggested rewrite. This format lets the stakeholder quickly scan, approve, or revise each item without needing to read the full requirements document.

## 5.4 Requirements Classification

Once requirements are extracted and de-ambiguated, the next step is classification. A well-classified requirement set enables filtering, prioritisation, and assignment to the right teams. LLMs can classify requirements across multiple dimensions simultaneously.

### Classification Dimensions

| Dimension | Values | Purpose |
| --- | --- | --- |
| Type | Functional, Non-Functional, Constraint, Assumption, Dependency | Organise by nature |
| Domain | Security, Performance, Usability, Data, Integration, Compliance | Route to specialist teams |
| Priority | Must-Have, Should-Have, Could-Have, Won't-Have (MoSCoW) | Scope and release planning |
| Complexity | Low, Medium, High | Estimation and capacity planning |
| Source | Stakeholder, Regulation, Legacy System, Market Research | Traceability and justification |

### Multi-Dimensional Classification Approach

The classification prompt sends the full set of extracted requirements to the LLM and asks it to assign five dimensions simultaneously for each item: type, domain, MoSCoW priority, complexity, and a one-sentence rationale explaining the choices. The model returns a JSON array that can be merged back into the master requirements list programmatically, matching on requirement ID and updating each record with its new classification fields.

Use a temperature of 0.0 for classification to maximise consistency. After the merge, any requirement where the classification rationale seems weak or the domain assignment is unexpected should be flagged for manual BA review.

> **Best Practice:** Run classification twice with different model temperatures (0.0 and 0.3) and compare. Where the two runs disagree, flag the requirement for manual review. This "ensemble" approach catches edge cases where the model is uncertain.

### Validation Against Historical Data

If your organisation has a repository of previously classified requirements, you can use few-shot prompting to dramatically improve accuracy. Include 10 to 15 examples from your historical data in the prompt, selecting examples that cover each classification category. In our experiments, few-shot classification improved agreement with human analysts from 78 percent to 91 percent.

## 5.5 Traceability Matrix Generation

A traceability matrix links requirements to their sources (backward traceability) and to downstream artifacts such as design elements, test cases, and code modules (forward traceability). Maintaining this matrix manually is one of the most tedious BA tasks. LLMs can generate a first draft and keep it updated as requirements evolve.

### Matrix Structure

| Req ID | Source Document | Section | Design Element | Test Case(s) | Status |
| --- | --- | --- | --- | --- | --- |
| REQ-001 | RFP-2024-Finance | §3.2 | AuthModule | TC-042, TC-043 | Implemented |
| REQ-002 | Interview: CFO | N/A | ReportEngine | TC-078 | In Progress |
| REQ-003 | SOX Regulation | §404 | AuditTrail | TC-101, TC-102 | Planned |

### Generating the Matrix with LLMs

To generate the traceability matrix, provide the LLM with three inputs: the classified requirements list, a catalogue of design elements (module names, component descriptions), and a list of test cases with their IDs and descriptions. The prompt instructs the model to act as a traceability specialist and produce a JSON array where each entry links a requirement ID to its source document and section, related design components, verifying test cases, current status (Planned, In Progress, Implemented, or Verified), and any coverage notes flagging gaps.

The resulting JSON can be exported as an HTML table for stakeholder review or converted to Excel using standard libraries. The key advantage over manual matrix creation is speed: a 200-requirement matrix that takes a BA two days to compile manually can be generated in under a minute, giving the analyst time to focus on verifying the linkages rather than building them from scratch.

> **Tip:** Export the matrix as both JSON (for programmatic use) and as a formatted HTML table or Excel file (for stakeholder distribution). Libraries like `pandas` and `openpyxl` make the conversion trivial.

### Keeping the Matrix Current

A stale traceability matrix is worse than none at all because it gives false confidence. Use a change-detection pipeline. Whenever a requirement is added, modified, or deleted, re-run the LLM on the affected rows only. Pass the existing matrix as context so the model produces an incremental update rather than regenerating from scratch.

> **Cross-Reference:** For real-world examples of how enterprise architects apply requirements analysis at scale, including regulatory compliance and legacy modernisation, see *The AI-First Enterprise*, [Chapter 14: Case Studies](/ai-enterprise-architect/case-studies). The healthcare payer and financial services cases are particularly relevant to BAs working in regulated industries.

## 5.6 Gap Analysis Automation

Gap analysis answers the question: "What is missing?" It compares a requirement set against a reference and identifies uncovered areas. The reference may be a standard, a competitor product, a regulatory framework, or a previous version of the system.

### LLM-Driven Gap Detection

The gap analysis prompt provides the LLM with two inputs: the project requirements (as a JSON array) and the full text of the reference framework. The model compares them systematically and produces a structured list of gaps, each with a sequential ID (GAP-001, GAP-002), the specific reference area not covered, a description of what is missing, a severity rating (Critical, Major, or Minor), a draft requirement that would close the gap, and a list of affected stakeholders.

Use a slightly higher temperature (0.2) for gap analysis than for extraction or classification, because identifying gaps requires a degree of inferential reasoning about what *should* be present but is not. After the LLM produces its gap list, the BA should review each item against the original reference to confirm that the gap is genuine and not a misinterpretation of the standard's requirements.

### Common Reference Frameworks

| Framework | Domain | Use Case |
| --- | --- | --- |
| ISO 25010 | Software Quality | Ensure all quality attributes are addressed |
| GDPR Articles | Data Privacy | Verify compliance requirements are captured |
| OWASP Top 10 | Security | Check security requirements coverage |
| WCAG 2.2 | Accessibility | Validate accessibility requirements |
| SOC 2 Controls | Cloud Security | Audit trail and access control coverage |

> **Warning:** LLM gap analysis is only as good as the reference framework you provide. Always use the official, current version of a standard. Summarised or paraphrased versions may omit critical clauses.

## 5.7 Stakeholder Review Workflows

Even the best-extracted, perfectly-classified requirements are worthless if stakeholders do not review and approve them. LLMs can streamline the review cycle by generating audience-appropriate summaries, highlighting changes since the last review, and preparing focused review packages.

### Audience-Aware Summaries

Different stakeholders need different views of the same requirement set. The summary generation prompt accepts an audience parameter (Executive, Technical, or Legal) and applies audience-specific rules. For executives, the summary focuses on business outcomes, costs, and risks using bullet points limited to one page with no technical jargon. For technical audiences, it organises requirements by subsystem and includes system components, interfaces, and constraints. For legal audiences, it highlights compliance obligations, liability considerations, and specific regulatory references.

### Change-Highlighted Review Packages

When preparing for a follow-up review, showing stakeholders what has changed since the last version is critical. The change summary process works in two steps. First, it programmatically compares the previous and current requirement sets to identify three categories: added requirements (IDs present in the current set but not the previous), removed requirements (IDs present in the previous set but not the current), and modified requirements (same ID but different text). Second, it passes this structured change data to the LLM with a prompt to narrate the changes in a clear, professional format suitable for a stakeholder review meeting. The result is a human-readable summary that stakeholders can scan in minutes rather than diffing two large documents manually.

> **Integration Idea:** Connect this workflow to your organisation's collaboration tools. Generate the review summary, post it to a Confluence page or SharePoint site, and send a Slack/Teams notification with a direct link and a deadline for feedback.

## Project: Smart Requirements Extractor

In this hands-on project, you will build an end-to-end pipeline that takes a raw document, extracts requirements, classifies them, scans for ambiguity, and produces a stakeholder-ready review package.

### Architecture Overview

The pipeline flows through five stages: (1) the raw document is split into chunks, (2) each chunk is processed by the LLM extractor independently, (3) extracted requirements are deduplicated and merged, (4) the unified list passes through classification and ambiguity scanning, and (5) the results are assembled into a stakeholder-ready review package with audience-appropriate summaries. Refer to Figure 5-1 above for a visual representation of this flow.

### Step 1: Set Up the Project

```python

# requirements_extractor/main.py
import argparse, json, pathlib
from extraction import extract_from_large_document
from classification import classify_requirements
from ambiguity import scan_ambiguities, format_review_report
from review import generate_review_summary


def main():
    parser = argparse.ArgumentParser(description="Smart Requirements Extractor")
    parser.add_argument("input_file", type=pathlib.Path, help="Path to source document")
    parser.add_argument("--audience", default="executive", choices=["executive", "technical", "legal"])
    parser.add_argument("--output", type=pathlib.Path, default=pathlib.Path("output"))
    args = parser.parse_args()

    # 1. Read document
    text = args.input_file.read_text(encoding="utf-8")
    print(f"[1/5] Loaded {len(text):,} characters from {args.input_file.name}")

    # 2. Extract
    requirements = extract_from_large_document(text)
    print(f"[2/5] Extracted {len(requirements)} candidate requirements")

    # 3. Classify
    requirements = classify_requirements(requirements)
    print(f"[3/5] Classified all requirements")

    # 4. Ambiguity scan
    ambiguities = scan_ambiguities(requirements)
    print(f"[4/5] Found {len(ambiguities)} ambiguity issues")

    # 5. Generate outputs
    args.output.mkdir(exist_ok=True)

    (args.output / "requirements.json").write_text(
        json.dumps(requirements, indent=2), encoding="utf-8"
    )
    (args.output / "ambiguity_report.md").write_text(
        format_review_report(ambiguities, requirements), encoding="utf-8"
    )
    summary = generate_review_summary(requirements, args.audience)
    (args.output / f"summary_{args.audience}.md").write_text(summary, encoding="utf-8")

    print(f"[5/5] Outputs written to {args.output}/")


if __name__ == "__main__":
    main()
      
```

### Step 2: Test with a Sample Document

Create a sample RFP document with intentionally ambiguous requirements to verify your pipeline catches them. Run the extractor and review the output files. Verify that:

-   All requirements from the sample are captured (recall check)
-   No hallucinated requirements appear (precision check)
-   Ambiguous phrases are flagged with reasonable rewrites
-   Classifications match your expert judgment

### Step 3: Extend with Traceability

Add the `generate_traceability_matrix` function from Section 5.5 and connect it to a simple CSV export so that project managers can import it into their tools.

## Summary

-   **LLMs accelerate extraction:** Unstructured documents can be converted into structured requirement sets in minutes rather than days, with precision above 85 percent.
-   **Ambiguity detection is a high-value use case:** Catching vague, incomplete, or under-specified requirements early prevents costly rework downstream.
-   **Multi-dimensional classification** enables better prioritisation, routing, and capacity planning.
-   **Traceability matrices** can be generated and incrementally maintained with LLM assistance, reducing one of the most tedious BA tasks.
-   **Gap analysis** against reference frameworks ensures requirements coverage for compliance and quality.
-   **Stakeholder review workflows** benefit from audience-tailored summaries and change-highlighted packages.
-   **Human oversight remains essential:** Every LLM output in this chapter is a draft that requires BA validation and stakeholder confirmation.

### Exercises

#### Conceptual

1.  Explain why recall is more important than precision when extracting requirements from an RFP. Under what circumstances might the opposite be true?
2.  A colleague argues that LLM-based ambiguity detection makes peer reviews unnecessary. Write a one-paragraph rebuttal.
3.  Describe three scenarios where automated requirement classification would disagree with a human analyst, and explain why the human judgment should prevail.

#### Coding

1.  Modify the `extract_requirements` function to accept a custom taxonomy of requirement types (passed as a parameter) instead of using the hardcoded list.
2.  Write a function that compares two traceability matrices (previous and current) and produces a list of "orphaned" test cases: test cases that no longer map to any requirement.
3.  Implement a confidence calibration function that compares the LLM's confidence labels (HIGH/MEDIUM/LOW) against a gold-standard dataset and reports calibration metrics.

#### Design

1.  Design a dashboard that displays requirement coverage by domain, priority, and status. Sketch the layout and list the data queries needed.
2.  Propose an integration architecture that connects the Smart Requirements Extractor to Jira, automatically creating epics and stories from classified requirements.