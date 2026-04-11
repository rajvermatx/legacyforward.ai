---
title: "Regulatory Compliance Agent"
slug: "regulatory-compliance"
description: "An autonomous agent that parses regulatory texts (EU AI Act, NIST AI RMF, GDPR), extracts actionable requirements, maps them against organizational policies, identifies compliance gaps, and suggests remediation steps. Regulations overlap and contradict each other — the agent must cross-reference mul"
section: "agentic-designs"
order: 7
badges:
  - "Regulation Parsing"
  - "Requirement Extraction"
  - "Policy Mapping"
  - "Gap Analysis"
  - "Remediation Planning"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/agentic-designs/07-regulatory-compliance.ipynb"
---

## 01. The Problem

**Regulations are multiplying.** The EU AI Act alone contains 113 articles and 180 recitals. NIST AI RMF adds another framework. GDPR, HIPAA, SOC 2 — each with hundreds of specific requirements. An organization deploying AI systems may need to comply with all of them simultaneously, and the overlaps and contradictions between frameworks make manual compliance review painfully slow.

**Manual review is error-prone.** A compliance officer reading through the EU AI Act must extract specific obligations (e.g., "providers of high-risk AI systems shall establish a risk management system"), determine if they apply to the organization's AI systems, check if existing policies cover them, and document gaps. This takes weeks of expert time per regulation, and requirements are often missed because they are scattered across non-adjacent sections.

**Requirements evolve.** Regulatory texts are updated, guidance documents are published, and enforcement interpretations change. A compliance assessment done six months ago may be outdated. Organizations need a systematic, repeatable process that can be re-run as regulations change.

**Cross-referencing is the real challenge.** The EU AI Act Article 9 requires "risk management," NIST AI RMF has a "Map" function that covers similar ground, and ISO 42001 has its own risk framework. A single organizational policy may satisfy requirements from multiple regulations, or a single regulation may require multiple policies. This many-to-many mapping is where human reviewers most often miss gaps.

## 02. Why an Agent

**Why not keyword search?** Regulations use legal language that does not match organizational policy terminology. "Providers shall ensure transparency" does not keyword-match to "Our ML Ops team publishes model cards." An LLM can bridge the semantic gap between regulatory language and policy language.

**Why not a single LLM call?** The EU AI Act is over 100 pages. Combined with NIST AI RMF and company policies, the total context exceeds any model's window. Even with large context windows, the task requires structured extraction, cross-referencing, and gap analysis — multiple distinct reasoning steps that benefit from tool-mediated decomposition.

**Why an agent?** The compliance review process is inherently multi-step and adaptive:

-   **Parse regulation sections** — Chunk the regulation into articles/sections and extract structured requirements from each.
-   **Cross-reference** — For each requirement, search across multiple regulations to find overlapping or conflicting obligations.
-   **Map to policies** — Search the organization's policy documents to find which policies address each requirement.
-   **Identify gaps** — Requirements with no matching policy are gaps. The agent must reason about partial coverage (a policy that addresses 60% of a requirement).
-   **Suggest remediation** — For each gap, the agent drafts specific policy language or process changes, referencing the regulatory text.

## Architecture Diagram

![Diagram 1](/diagrams/agentic-designs/regulatory-compliance-1.svg)

## 03. Architecture

### Regulation Parser

Chunks regulatory documents into articles/sections with metadata (article number, title, section). Handles the nested structure of legal texts where sub-paragraphs can contain independent obligations.

### Requirement Extractor

Uses the LLM to extract structured requirements from regulatory text: the obligation, who it applies to, what triggers it, and the compliance threshold. Returns a standardized JSON format.

### Policy Mapper

Performs semantic search over the organization's policy corpus to find policies that address each requirement. Uses embedding similarity with a threshold, plus LLM verification of relevance.

### Gap Analyzer

Compares extracted requirements against mapped policies. Classifies each requirement as: fully covered, partially covered (with coverage percentage), or not covered. Prioritizes gaps by regulatory severity.

### Remediation Suggester

For each gap, generates specific remediation actions: draft policy language, process changes, technical controls, or documentation requirements. References the specific regulatory text that creates the obligation.

### Report Generator

Compiles the full compliance assessment into a structured report: executive summary, requirement-by-requirement analysis, gap heat map, and prioritized remediation roadmap.

## 04. Tools & APIs

Tool definitions for the compliance agent. Each tool operates on a document store containing regulation texts and organizational policies.

```
import json
from openai import OpenAI

client = OpenAI()

# ── Tool Definitions ──
tools = [
    {
        "type": "function",
        "function": {
            "name": "parse_regulation",
            "description": "Parse a regulation document into structured sections. Returns article numbers, titles, and text for a specific regulation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "regulation": {
                        "type": "string",
                        "enum": ["eu_ai_act", "nist_ai_rmf", "gdpr"],
                        "description": "Which regulation to parse"
                    },
                    "section": {
                        "type": "string",
                        "description": "Specific article/section number, e.g. 'Article 9' or 'all'"
                    }
                },
                "required": ["regulation"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "extract_requirements",
            "description": "Extract structured compliance requirements from regulatory text. Returns obligation, applicability, and severity.",
            "parameters": {
                "type": "object",
                "properties": {
                    "regulation": {"type": "string"},
                    "section_text": {"type": "string", "description": "The regulatory text to analyze"},
                    "ai_system_type": {"type": "string", "description": "Type of AI system, e.g. 'high-risk recommendation system'"}
                },
                "required": ["regulation", "section_text"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "map_to_policy",
            "description": "Search organizational policies for coverage of a specific requirement. Returns matching policies with coverage assessment.",
            "parameters": {
                "type": "object",
                "properties": {
                    "requirement_text": {"type": "string", "description": "The requirement to search for"},
                    "policy_corpus": {"type": "string", "enum": ["all", "ai_governance", "data_privacy", "risk_management", "security"]}
                },
                "required": ["requirement_text"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "identify_gaps",
            "description": "Analyze coverage results and identify compliance gaps. Returns gaps with severity and priority.",
            "parameters": {
                "type": "object",
                "properties": {
                    "requirements": {
                        "type": "array",
                        "items": {"type": "object"},
                        "description": "List of requirements with their policy mapping results"
                    }
                },
                "required": ["requirements"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "suggest_remediation",
            "description": "Generate remediation actions for compliance gaps including draft policy text.",
            "parameters": {
                "type": "object",
                "properties": {
                    "gap": {"type": "object", "description": "The compliance gap to remediate"},
                    "organization_context": {"type": "string", "description": "Description of the organization and its AI systems"}
                },
                "required": ["gap"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_report",
            "description": "Generate a structured compliance assessment report with executive summary, gaps, and remediation roadmap.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "regulations_assessed": {"type": "array", "items": {"type": "string"}},
                    "gaps": {"type": "array", "items": {"type": "object"}},
                    "remediations": {"type": "array", "items": {"type": "object"}}
                },
                "required": ["title", "gaps"]
            }
        }
    }
]
```

## 05. The Agent Loop

The compliance agent follows a **systematic coverage loop** — it must ensure every relevant article of every applicable regulation has been assessed, not just the obvious ones.

1.  **Parse Regulations** — The agent calls `parse_regulation` for each applicable regulation (EU AI Act, NIST AI RMF) to get the structured list of articles and sections.
2.  **Extract Requirements** — For each relevant section, the agent calls `extract_requirements` to identify the specific obligations. It filters by the organization's AI system type (e.g., only high-risk provisions if the system is high-risk).
3.  **Map to Policies** — For each requirement, the agent calls `map_to_policy` to search the organization's policy corpus. It uses semantic search, not keyword matching, because regulatory language differs from policy language.
4.  **Identify Gaps** — The agent calls `identify_gaps` with the full list of requirements and their policy mappings. Gaps are classified as critical (no coverage), partial (some coverage), or informational (best practice, not mandatory).
5.  **Cross-Reference** — The agent checks whether gaps in one regulation are covered by compliance with another regulation. For example, GDPR Article 35 (DPIA) may partially satisfy EU AI Act Article 9 (risk management).
6.  **Suggest Remediation** — For each unresolved gap, the agent calls `suggest_remediation` to generate specific actions, draft policy language, and implementation timelines.
7.  **Generate Report** — Finally, `generate_report` compiles everything into a structured compliance assessment.

**Why systematic?** Missing a single high-risk requirement can result in fines of up to 35 million EUR (EU AI Act Article 99). The agent must not skip articles — it iterates through every section of every applicable regulation, even if some seem irrelevant at first glance.

## 06. Code Walkthrough

Complete implementation with a document store, embedding-based policy search, and the compliance agent loop.

```
import json
from openai import OpenAI
import numpy as np

client = OpenAI()

# ── Simulated Regulation Store ──
# In production, these would be parsed from official PDFs
REGULATIONS = {
    "eu_ai_act": {
        "Article 9": {
            "title": "Risk Management System",
            "text": "A risk management system shall be established, implemented, "
                    "documented and maintained in relation to high-risk AI systems. "
                    "The risk management system shall be a continuous iterative process "
                    "planned and run throughout the entire lifecycle of a high-risk AI system.",
            "applies_to": "high-risk"
        },
        "Article 10": {
            "title": "Data and Data Governance",
            "text": "Training, validation and testing data sets shall be subject to "
                    "data governance and management practices appropriate for the "
                    "intended purpose of the high-risk AI system.",
            "applies_to": "high-risk"
        },
        "Article 13": {
            "title": "Transparency and Information to Deployers",
            "text": "High-risk AI systems shall be designed and developed in such a way "
                    "as to ensure that their operation is sufficiently transparent to "
                    "enable deployers to interpret a system's output and use it appropriately.",
            "applies_to": "high-risk"
        },
        "Article 14": {
            "title": "Human Oversight",
            "text": "High-risk AI systems shall be designed and developed in such a way "
                    "that they can be effectively overseen by natural persons during "
                    "the period in which they are in use.",
            "applies_to": "high-risk"
        }
    },
    "nist_ai_rmf": {
        "MAP 1.1": {
            "title": "Intended Purpose and Context",
            "text": "The intended purpose, potentially beneficial uses, context of use, "
                    "and the role of the AI within the broader system are understood.",
            "applies_to": "all"
        },
        "MEASURE 2.6": {
            "title": "Fairness Assessment",
            "text": "The AI system is evaluated for fairness, including bias testing "
                    "across demographic groups and intersectional analysis.",
            "applies_to": "all"
        }
    }
}

# ── Simulated Organization Policies ──
ORG_POLICIES = [
    {
        "id": "POL-001",
        "title": "AI Model Risk Management Policy",
        "text": "All ML models must undergo risk assessment before deployment. "
                "Risk assessments are reviewed quarterly. High-risk models require "
                "VP-level sign-off.",
        "category": "risk_management"
    },
    {
        "id": "POL-002",
        "title": "Data Governance Standards",
        "text": "All datasets used for model training must be cataloged in the data "
                "registry. Data quality checks are run on ingestion. PII is masked.",
        "category": "data_privacy"
    },
    {
        "id": "POL-003",
        "title": "Model Documentation Requirements",
        "text": "Every production model must have a model card documenting its purpose, "
                "training data, performance metrics, and known limitations.",
        "category": "ai_governance"
    }
]

# ── Tool Implementations ──
def parse_regulation(regulation: str, section: str = "all") -> str:
    if regulation not in REGULATIONS:
        return json.dumps({"error": f"Unknown regulation: {regulation}"})
    reg = REGULATIONS[regulation]
    if section != "all" and section in reg:
        return json.dumps({section: reg[section]})
    return json.dumps({k: {"title": v["title"], "applies_to": v["applies_to"]} for k, v in reg.items()})

def extract_requirements(regulation: str, section_text: str, ai_system_type: str = "") -> str:
    """Use LLM to extract structured requirements from regulatory text."""
    extraction = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": f"""Extract compliance requirements from this regulatory text.
Return JSON array of objects with: obligation, who_it_applies_to, trigger_condition, severity.

Regulation: {regulation}
Text: {section_text}
AI System Type: {ai_system_type or 'general'}"""
        }],
        response_format={"type": "json_object"}
    )
    return extraction.choices[0].message.content

def map_to_policy(requirement_text: str, policy_corpus: str = "all") -> str:
    """Semantic search over organization policies using embeddings."""
    # Get embedding for the requirement
    req_emb = client.embeddings.create(
        model="text-embedding-3-small",
        input=requirement_text
    ).data[0].embedding

    # Score each policy by cosine similarity
    matches = []
    for policy in ORG_POLICIES:
        if policy_corpus != "all" and policy["category"] != policy_corpus:
            continue
        pol_emb = client.embeddings.create(
            model="text-embedding-3-small",
            input=policy["text"]
        ).data[0].embedding
        similarity = float(np.dot(req_emb, pol_emb))
        if similarity > 0.3:
            matches.append({
                "policy_id": policy["id"],
                "title": policy["title"],
                "similarity": round(similarity, 3),
                "coverage": "partial" if similarity < 0.7 else "full"
            })
    matches.sort(key=lambda x: x["similarity"], reverse=True)
    return json.dumps({"matches": matches, "coverage_found": len(matches) > 0})

def identify_gaps(requirements: list) -> str:
    gaps = []
    for req in requirements:
        if not req.get("policy_matches"):
            gaps.append({
                "requirement": req["obligation"],
                "regulation": req.get("regulation", "unknown"),
                "severity": req.get("severity", "high"),
                "gap_type": "no_coverage"
            })
        elif all(m["coverage"] == "partial" for m in req["policy_matches"]):
            gaps.append({
                "requirement": req["obligation"],
                "regulation": req.get("regulation", "unknown"),
                "severity": "medium",
                "gap_type": "partial_coverage",
                "existing_policies": [m["policy_id"] for m in req["policy_matches"]]
            })
    return json.dumps({"total_requirements": len(requirements), "gaps": gaps, "gap_count": len(gaps)})

def suggest_remediation(gap: dict, organization_context: str = "") -> str:
    prompt = f"""Suggest remediation for this compliance gap:
Gap: {json.dumps(gap)}
Organization: {organization_context or 'Mid-size tech company deploying AI recommendation systems'}

Return JSON with: action, draft_policy_text, implementation_timeline, effort_estimate."""
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return resp.choices[0].message.content

def generate_report(title: str, gaps: list, regulations_assessed: list = None,
                     remediations: list = None) -> str:
    return json.dumps({
        "title": title,
        "date": "2025-01-15",
        "regulations": regulations_assessed or [],
        "total_gaps": len(gaps),
        "critical_gaps": sum(1 for g in gaps if g.get("severity") == "critical"),
        "gaps": gaps,
        "remediations": remediations or [],
        "status": "assessment_complete"
    }, indent=2)
```

The agent loop with the compliance-specific system prompt:

```
# ── Tool Dispatch and Agent Loop ──
TOOL_MAP = {
    "parse_regulation": lambda a: parse_regulation(a["regulation"], a.get("section", "all")),
    "extract_requirements": lambda a: extract_requirements(a["regulation"], a["section_text"], a.get("ai_system_type", "")),
    "map_to_policy": lambda a: map_to_policy(a["requirement_text"], a.get("policy_corpus", "all")),
    "identify_gaps": lambda a: identify_gaps(a["requirements"]),
    "suggest_remediation": lambda a: suggest_remediation(a["gap"], a.get("organization_context", "")),
    "generate_report": lambda a: generate_report(a["title"], a["gaps"], a.get("regulations_assessed"), a.get("remediations")),
}

SYSTEM_PROMPT = """You are a Regulatory Compliance Agent. Your job is to assess an
organization's compliance with AI regulations.

Workflow:
1. Parse each applicable regulation to get its structure
2. Extract requirements from each relevant article
3. Map each requirement to existing organizational policies
4. Identify gaps where policies don't cover requirements
5. Cross-reference: check if compliance with one regulation covers gaps in another
6. Suggest remediation for each unresolved gap
7. Generate a final compliance report

Be thorough: do not skip any article. Classify gaps by severity.
Always cite the specific regulatory article for each finding."""

def run_compliance_agent(task: str, max_steps: int = 20) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": task}
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
            fn_name = tc.function.name
            fn_args = json.loads(tc.function.arguments)
            print(f"  [{step+1}] {fn_name}")
            result = TOOL_MAP[fn_name](fn_args)
            messages.append({
                "role": "tool", "tool_call_id": tc.id, "content": result
            })

    return "Max steps reached."

# ── Run ──
report = run_compliance_agent(
    "Assess our compliance with the EU AI Act and NIST AI RMF. "
    "We deploy a high-risk AI recommendation system for hiring. "
    "Check all relevant articles and identify gaps in our policies."
)
print(report)
```

## 07. Key Takeaways

- Regulatory compliance requires semantic understanding, not keyword matching — LLMs bridge the gap between legal language and organizational policy language

- Systematic coverage is non-negotiable: the agent must iterate through every relevant article, not just the obvious ones

- Cross-referencing across regulations is where the most value lies — compliance with GDPR may partially satisfy EU AI Act requirements

- Embedding-based policy search with LLM verification provides the best balance of recall (finding relevant policies) and precision (confirming relevance)

- Always cite the specific regulatory article for each finding — vague compliance assessments are useless for audit

- This agent does not replace legal counsel; it accelerates the assessment process and ensures systematic coverage

- The same architecture applies to any compliance domain: SOC 2, HIPAA, PCI-DSS, ISO 27001

- Version control for regulations is critical: the agent must know which version of each regulation it is assessing against
