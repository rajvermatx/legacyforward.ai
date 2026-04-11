---
title: "Capstone 3: Intelligent Test Suite Generator"
slug: "capstone-03"
description: "Test suites decay. New features get added without corresponding tests, defect patterns repeat in the same modules, and nobody has time to reprioritize the regression suite. In this capstone, you will build a system that generates, prioritizes, and maintains test suites by learning from your applicat"
section: "llm-ba-qa"
order: 16
part: "Part 05 Capstones"
---

Part 5 — Capstones

# Capstone 3: Intelligent Test Suite Generator

Test suites decay. New features get added without corresponding tests, defect patterns repeat in the same modules, and nobody has time to reprioritize the regression suite. In this capstone, you will build a system that generates, prioritizes, and maintains test suites by learning from your application's change history and defect data — turning reactive QA into proactive quality engineering.

Building time: ~2 hours Chapters used: 9, 10, 12, 15

### What You Will Build

-   A change analyzer that reads git diffs and identifies which features and modules were modified
-   A defect pattern engine that mines historical bug data to find recurring failure modes
-   An intelligent test generator that creates new test cases targeting high-risk changes
-   A test suite optimizer that ranks and trims the regression suite based on risk and coverage
-   A test data generator that produces realistic, privacy-safe test data for each test case

![Diagram 1](/diagrams/llm-ba-qa/capstone-03-1.svg)

Figure C3.1 — Three input channels (code changes, defect history, existing tests) feed into a risk analysis engine that drives targeted test generation.

## Architecture Overview

The system has three input channels — code changes, defect history, and existing test coverage — that feed into a central intelligence layer. The intelligence layer uses an LLM to synthesize these signals into prioritized test generation decisions.

**Data models:**

```python
from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
from datetime import datetime

class RiskLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ChangeType(str, Enum):
    ADDED = "added"
    MODIFIED = "modified"
    DELETED = "deleted"
    RENAMED = "renamed"

class CodeChange(BaseModel):
    file_path: str
    change_type: ChangeType
    lines_added: int = 0
    lines_deleted: int = 0
    diff_content: str = ""
    module: str = Field(description="Inferred module or feature area")

class DefectRecord(BaseModel):
    id: str
    title: str
    module: str
    severity: str
    root_cause: Optional[str] = None
    date_found: str
    component: Optional[str] = None

class RiskAssessment(BaseModel):
    module: str
    risk_level: RiskLevel
    risk_score: float = Field(ge=0, le=100)
    change_factor: float = Field(description="Risk from recent changes")
    defect_factor: float = Field(description="Risk from historical defects")
    coverage_factor: float = Field(description="Risk from low test coverage")
    rationale: str

class GeneratedTest(BaseModel):
    id: str
    title: str
    module: str
    risk_level: RiskLevel
    test_type: str
    preconditions: list[str]
    steps: list[str]
    expected_result: str
    test_data: Optional[dict] = None
    triggered_by: str = Field(description="What triggered this test: change, defect, or gap")
```

## Step 1: Setup and Data Ingestion

The change analyzer reads git history to identify what changed and maps file paths to logical modules:

The change analyzer runs `git log --name-status` to find recently modified files and maps each file path to a logical module name (e.g., `auth/login.py` maps to "Authentication") using a configurable lookup table. For each changed file, it extracts the diff content and counts lines added and deleted. Files with large diffs signal higher change risk.

The defect history loader reads historical bug data and extracts patterns:

The defect analyzer loads historical bug records (from CSV or JSON), counts defects per module, and calculates defect density. It produces a hotspot report showing which modules have the most bugs, with severity breakdowns. Modules with critical defects get flagged as higher risk. The sample dataset includes 8 representative bugs across Authentication, Shopping Cart, Payment Processing, Reporting, and Order Management modules to demonstrate the analysis.

## Step 2: Core Processing Pipeline — Risk-Based Test Generation

The risk analysis engine combines change data and defect patterns to calculate a risk score for each module. Modules with both recent changes and a history of defects get the highest scores:

```python
"""modules/risk_engine.py — Calculate risk scores and prioritize test generation."""
import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def calculate_risk_scores(
    changes: list[dict],
    defect_patterns: dict,
    existing_test_count: dict = None,
) -> list[dict]:
    """Calculate risk score for each module based on changes, defects, and coverage."""
    if existing_test_count is None:
        existing_test_count = {}

    # Gather all modules mentioned in changes or defects
    modules = set()
    for c in changes:
        modules.add(c.get("module", "Unknown"))
    for hotspot in defect_patterns.get("hotspots", []):
        modules.add(hotspot["module"])

    assessments = []
    for module in sorted(modules):
        # Change factor: more lines changed = higher risk
        module_changes = [c for c in changes if c.get("module") == module]
        total_lines = sum(
            c.get("lines_added", 0) + c.get("lines_deleted", 0)
            for c in module_changes
        )
        change_factor = min(100, total_lines * 2)  # Cap at 100

        # Defect factor: more historical defects = higher risk
        hotspot = next(
            (h for h in defect_patterns.get("hotspots", [])
             if h["module"] == module),
            None,
        )
        defect_count = hotspot["defect_count"] if hotspot else 0
        has_critical = False
        if hotspot:
            has_critical = hotspot.get("severity_breakdown", {}).get("critical", 0) > 0
        defect_factor = min(100, defect_count * 20 + (30 if has_critical else 0))

        # Coverage factor: fewer existing tests = higher risk
        test_count = existing_test_count.get(module, 0)
        coverage_factor = max(0, 100 - test_count * 10)  # 0 tests = 100 risk

        # Weighted composite score
        risk_score = (
            change_factor * 0.40 +
            defect_factor * 0.35 +
            coverage_factor * 0.25
        )

        risk_level = (
            "critical" if risk_score >= 75 else
            "high" if risk_score >= 50 else
            "medium" if risk_score >= 25 else
            "low"
        )

        assessments.append({
            "module": module,
            "risk_level": risk_level,
            "risk_score": round(risk_score, 1),
            "change_factor": round(change_factor, 1),
            "defect_factor": round(defect_factor, 1),
            "coverage_factor": round(coverage_factor, 1),
            "rationale": (
                f"{len(module_changes)} files changed ({total_lines} lines), "
                f"{defect_count} historical defects"
                f"{' (includes critical)' if has_critical else ''}, "
                f"{test_count} existing tests"
            ),
        })

    # Sort by risk score descending
    assessments.sort(key=lambda a: a["risk_score"], reverse=True)
    return assessments
```

With risk scores calculated, the test generator focuses its efforts on the highest-risk modules, using the LLM to create targeted test cases:

```python
"""modules/test_generator.py — Generate test cases based on risk assessments."""
import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

GENERATION_PROMPT = """You are a senior QA engineer designing test cases for
a {module} module. This module has been flagged as {risk_level} risk.

Risk context:
{rationale}

Recent code changes in this module:
{change_summary}

Historical defect patterns in this module:
{defect_summary}

Generate {test_count} focused test cases that specifically target:
1. Areas where code changed recently (regression risk)
2. Failure patterns seen in historical defects (repeat risk)
3. Edge cases and boundary conditions in the changed code

For each test case, return a JSON object:
{{
  "title": "concise test title",
  "test_type": "regression|smoke|boundary|negative|integration",
  "preconditions": ["list of preconditions"],
  "steps": ["ordered test steps"],
  "expected_result": "what should happen",
  "triggered_by": "change|defect_pattern|coverage_gap"
}}

Return a JSON array. No markdown fences."""

_counter = 0

def generate_tests_for_module(
    assessment: dict,
    changes: list[dict],
    defect_patterns: dict,
) -> list[dict]:
    """Generate test cases for a specific module based on its risk profile."""
    global _counter

    module = assessment["module"]

    # Determine how many tests to generate based on risk
    risk_to_count = {"critical": 5, "high": 4, "medium": 2, "low": 1}
    test_count = risk_to_count.get(assessment["risk_level"], 2)

    # Summarize changes for this module
    module_changes = [c for c in changes if c.get("module") == module]
    if module_changes:
        change_summary = "\n".join(
            f"- {c['file_path']} ({c['change_type']}, "
            f"+{c.get('lines_added', 0)}/-{c.get('lines_deleted', 0)} lines)"
            for c in module_changes[:5]
        )
    else:
        change_summary = "No recent changes detected."

    # Summarize defect patterns
    hotspot = next(
        (h for h in defect_patterns.get("hotspots", [])
         if h["module"] == module),
        None,
    )
    if hotspot:
        defect_summary = (
            f"Total defects: {hotspot['defect_count']}\n"
            f"Severity breakdown: {json.dumps(hotspot.get('severity_breakdown', {}))}"
        )
    else:
        defect_summary = "No historical defects recorded."

    prompt = GENERATION_PROMPT.format(
        module=module,
        risk_level=assessment["risk_level"],
        rationale=assessment["rationale"],
        change_summary=change_summary,
        defect_summary=defect_summary,
        test_count=test_count,
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a QA engineer. Return only a JSON array."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=2000,
    )

    raw = response.choices[0].message.content.strip()
    try:
        test_cases = json.loads(raw)
    except json.JSONDecodeError:
        import re
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        test_cases = json.loads(match.group()) if match else []

    # Assign IDs and module
    for tc in test_cases:
        _counter += 1
        tc["id"] = f"TC-{_counter:03d}"
        tc["module"] = module
        tc["risk_level"] = assessment["risk_level"]

    return test_cases


def generate_all_tests(
    assessments: list[dict],
    changes: list[dict],
    defect_patterns: dict,
) -> list[dict]:
    """Generate tests for all modules, prioritized by risk."""
    all_tests = []
    for assessment in assessments:
        if assessment["risk_level"] == "low":
            print(f"  Skipping {assessment['module']} (low risk)")
            continue
        print(f"  Generating tests for {assessment['module']} "
              f"({assessment['risk_level']} risk)...")
        tests = generate_tests_for_module(assessment, changes, defect_patterns)
        all_tests.extend(tests)
        print(f"    -> {len(tests)} tests generated")
    return all_tests
```

## Step 3: Output Generation — Test Data and Suite Report

Each test case needs realistic test data. The test data generator uses the Faker library for base data and the LLM for domain-specific values (Chapter 10):

The test data generator uses a two-step approach: the LLM determines what data fields each test case needs (e.g., "user\_email: email, order\_total: amount"), then the Faker library generates realistic values for each field type. For negative tests, it produces intentionally invalid data including empty fields, SQL injection strings, XSS payloads, and oversized inputs. For boundary tests, it generates min/max values, unicode text, floating-point precision edge cases, and zero-length strings.

The suite report generator produces a ranked test execution plan:

The suite report generator produces a markdown report with three sections: a **risk assessment summary table** showing each module's risk level, score, change factor, defect factor, and number of generated tests; **grouped test cases by module** with full details (preconditions, steps, expected results, and test data in JSON format); and a **recommended execution order** listing all tests ranked by risk level for maximum early defect detection.

## Step 4: Validation and Quality

The validation stage checks the generated test suite for quality and completeness. It ensures every high-risk module has sufficient coverage and that no generated test is a duplicate of an existing test:

The suite validator performs two checks: **coverage completeness** verifies that critical-risk modules have at least 4 tests, high-risk at least 3, and medium at least 1, while also flagging high-risk modules with no negative tests; and **duplicate detection** sends all test titles to the LLM to identify semantically similar tests that may be redundant (e.g., "login fails with wrong password" and "authentication error on invalid credentials").

The main orchestrator:

```python
"""main.py — Orchestrate the intelligent test suite generator."""
from modules.change_analyzer import get_recent_changes
from modules.defect_analyzer import load_defects, analyze_defect_patterns, SAMPLE_DEFECTS
from modules.risk_engine import calculate_risk_scores
from modules.test_generator import generate_all_tests
from modules.test_data import enrich_tests_with_data
from modules.suite_validator import check_coverage_completeness, check_duplicate_tests
from modules.suite_report import generate_suite_report


def run_pipeline(
    repo_path: str = ".",
    defect_file: str = None,
    since: str = "1 week ago",
):
    """Run the intelligent test suite generation pipeline."""
    print("=" * 60)
    print("Intelligent Test Suite Generator")
    print("=" * 60)

    # Stage 1: Gather inputs
    print("\n[1/5] Analyzing recent changes...")
    changes = get_recent_changes(repo_path, since=since)

    print("\n[2/5] Analyzing defect history...")
    if defect_file:
        defects = load_defects(defect_file)
    else:
        print("  Using sample defect data...")
        defects = SAMPLE_DEFECTS
    defect_patterns = analyze_defect_patterns(defects)

    # Stage 2: Risk analysis
    print("\n[3/5] Calculating risk scores...")
    assessments = calculate_risk_scores(changes, defect_patterns)
    for a in assessments:
        print(f"  {a['module']:25s} {a['risk_level']:10s} (score: {a['risk_score']:.0f})")

    # Stage 3: Generate tests
    print("\n[4/5] Generating targeted test cases...")
    test_cases = generate_all_tests(assessments, changes, defect_patterns)

    # Enrich with test data
    print("\n  Adding test data...")
    test_cases = enrich_tests_with_data(test_cases)

    # Stage 4: Validate
    print("\n[5/5] Validating test suite...")
    coverage_issues = check_coverage_completeness(assessments, test_cases)
    duplicate_issues = check_duplicate_tests(test_cases)

    all_issues = coverage_issues + duplicate_issues
    if all_issues:
        print(f"  Found {len(all_issues)} issues:")
        for issue in all_issues:
            print(f"    - {issue['message']}")
    else:
        print("  No issues found.")

    # Generate report
    print("\nGenerating report...")
    report_path = generate_suite_report(
        assessments, test_cases, defect_patterns
    )

    print("\n" + "=" * 60)
    print(f"Generated {len(test_cases)} test cases across "
          f"{len(set(t.get('module') for t in test_cases))} modules")
    print("=" * 60)

    return report_path


if __name__ == "__main__":
    import sys
    repo = sys.argv[1] if len(sys.argv) > 1 else "."
    run_pipeline(repo_path=repo)
```

## Extensions and Portfolio Tips

-   **Add CI/CD integration.** Run the generator as a GitHub Action that triggers on every pull request. It analyzes the PR's diff, generates targeted test cases, and posts them as a PR comment. This demonstrates DevOps awareness and makes the tool immediately practical.
-   **Build a test decay detector.** Compare the existing test suite against recent code changes to identify tests that no longer exercise the code they were written for. Flag stale tests for review or deletion. This solves the "test suite bloat" problem that plagues mature projects.
-   **Implement a learning loop.** Track which generated tests actually find defects. Feed this data back into the risk engine to improve future prioritization. Over time, the system learns which types of changes are most likely to cause failures.
-   **Add visual coverage maps.** Generate a heatmap showing test coverage across modules, color-coded by risk level. Use matplotlib or Plotly to create an interactive visualization. Visual outputs make strong portfolio demos.
-   **Support multiple test frameworks.** Generate test code directly in pytest, JUnit, or Cypress format instead of plain-text test cases. This makes the output immediately executable.

**Portfolio presentation tip:** Demo this tool on a real open-source project. Clone a popular GitHub repo, run the generator against its recent commit history, and show the risk assessment and generated tests. Using real data (not just samples) demonstrates that your tool works in the wild.

## Summary

-   You built a system that combines three data sources — code changes, defect history, and test coverage — to make intelligent test generation decisions.
-   Risk-based prioritization ensures testing effort focuses where it matters most, rather than generating tests uniformly.
-   The test data generator uses Faker for speed and the LLM for domain-specific field selection, balancing efficiency and quality.
-   Validation checks catch coverage gaps and duplicate tests before the suite reaches human reviewers.
-   The modular architecture allows each component to be tested, replaced, or extended independently.