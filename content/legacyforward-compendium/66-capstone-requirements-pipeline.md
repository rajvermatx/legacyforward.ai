---
title: "Capstone: Requirements-to-Test-Cases Pipeline"
slug: "capstone-requirements-pipeline"
description: "Build an end-to-end pipeline that takes user stories and acceptance criteria as input and produces validated test cases as output. This capstone demonstrates LLM-powered BA/QA workflows and the critical role of human review at each stage."
section: "legacyforward-compendium"
order: 66
part: "Part VII — Capstones"
---

Part VII — Capstones

# Capstone: Requirements-to-Test-Cases Pipeline

The requirements-to-test-cases pipeline is the BA/QA team's highest-leverage AI opportunity. Converting user stories to test cases is repetitive, time-consuming, and requires systematic coverage of happy paths, boundary conditions, and negative cases that human testers routinely miss under deadline pressure. This capstone builds the pipeline end-to-end and demonstrates where human judgment is essential and where it can be reserved for review rather than generation.

## Scenario

A product development team produces 15–20 user stories per sprint. QA engineers currently spend 40% of their time writing test cases from scratch. The requirements-to-test-cases pipeline generates comprehensive test case suites from user stories, with human review focused on validation and curation rather than generation.

## Architecture

**Stages:**
1. Requirements parsing: extract structured requirements from user story text
2. Behavior identification: identify all behaviors the requirement specifies
3. Test case generation: generate happy path, boundary, and negative test cases
4. Gap analysis: identify behaviors not covered by the generated test cases
5. Duplicate detection: remove redundant test cases
6. Human review interface: present curated test cases for QA validation

**Flow:**
```
User Story → [Parse] → Structured Requirements → [Generate] → Raw Test Cases
→ [Gap Analysis] → Annotated Test Cases → [Deduplicate] → Curated Set
→ [Human Review] → Validated Test Suite
```

## Implementation

**Stage 1 — Requirements parsing:**
```
Extract structured requirements from the following user story.
For each requirement, identify:
- The actor (who is taking the action)
- The action (what they are doing)
- The outcome (what should happen)
- The conditions (when this applies)
- Any explicit business rules mentioned

User Story: {user_story}

Return as JSON array of requirement objects.
```

**Stage 3 — Test case generation:**
```
Generate test cases for the following requirement. Generate:
1. Happy path cases: inputs where all conditions are valid and the expected outcome is achieved
2. Boundary cases: inputs at the edges of valid ranges
3. Negative cases: invalid inputs and the expected error behavior
4. Business rule cases: one case that satisfies each business rule and one that violates it

Format each test case as:
- ID: TC-{number}
- Description: one sentence
- Preconditions: what must be true before the test
- Test Steps: numbered steps
- Expected Result: what should happen
- Test Type: HAPPY/BOUNDARY/NEGATIVE/BUSINESS_RULE

Requirement: {requirement}
```

**Stage 4 — Gap analysis:**
```
Review the following requirement and test cases. Identify any behaviors, conditions, or edge cases specified in the requirement that are not covered by the existing test cases. For each gap, describe the missing coverage and suggest the type of test case that would address it.

Requirement: {requirement}
Generated test cases: {test_cases}
```

**Human review interface output:**

Present to the QA engineer:
- Summary: N test cases generated, M gaps identified
- Test cases organized by type (happy/boundary/negative)
- Each test case with a quick accept/reject/edit action
- Gaps highlighted with suggested additional test cases
- Coverage heat map showing which requirement elements are covered

## Key Learning Points

**Multi-stage pipelines catch what single-step generation misses.** Generating test cases in one step produces mostly happy-path cases. The four-stage pipeline — parse, generate, gap-analyze, deduplicate — produces more comprehensive coverage because each stage is focused on a different aspect of quality.

**Gap analysis is the most valuable stage.** The gap analysis stage catches the systematic blind spots in the generation stage — the boundary conditions that the LLM generated happy-path cases for instead of boundary cases, the business rules that were paraphrased but not tested.

**Human review time is cut, not eliminated.** The pipeline reduces QA time from generation (40% of sprint time) to review (10–15% of sprint time). Human reviewers are still essential — they catch cases where the expected result is subtly wrong, where the preconditions are not achievable in the test environment, or where the business rule was misunderstood.

**Formats must match the team's tools.** Test cases generated in Gherkin format can be imported directly into Cucumber-based test frameworks. Test cases in tabular format match TestRail or Xray export formats. Match the output format to the team's existing tooling to maximize adoption.
