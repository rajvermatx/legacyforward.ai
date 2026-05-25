---
title: "Capstone: Data Pipeline Orchestrator"
slug: "capstone-data-pipeline"
description: "Build an agentic data pipeline orchestrator that monitors data quality, diagnoses failures, and orchestrates remediation steps across a multi-stage ETL pipeline. This capstone integrates agentic reasoning, tool use for data operations, and human escalation for critical failures."
section: "ai-beyond-the-demo"
order: 65
part: "Part VII — Capstones"
---

Part VII — Capstones

# Capstone: Data Pipeline Orchestrator

Data pipelines fail in complex, context-dependent ways that rule-based alerting cannot diagnose. A pipeline that fails because of a schema change in the source system requires a different remediation than one that fails because of a downstream API outage. An agentic orchestrator that can read error logs, diagnose the root cause, attempt automated remediation, and escalate with a complete diagnostic report when remediation is not possible reduces mean time to resolution and eliminates the manual triage burden that keeps data engineers awake at night.

## Scenario

A data engineering team operates a 15-stage ETL pipeline that feeds an enterprise data warehouse. The pipeline processes 2 million records per day across six source systems. Failures occur 3–5 times per week, typically requiring 45–90 minutes of engineer investigation before remediation begins. The pipeline orchestrator agent handles triage and remediation for the 80% of failures with known root causes, and escalates the remaining 20% with a complete diagnostic report.

## Architecture

**Components:**
- Pipeline monitor: detects failures and triggers the agent
- Log retrieval tool: retrieves error logs from the failed pipeline stage
- Schema inspection tool: inspects current and prior source system schemas
- Data profiling tool: runs data quality checks on the failed batch
- Retry tool: retries a failed pipeline stage with current or modified configuration
- Schema migration tool: applies schema transformations to accommodate schema changes
- Escalation tool: notifies on-call engineer with diagnostic report

**Execution flow:**
1. Pipeline monitor detects stage failure and triggers agent with failure context
2. Agent retrieves error logs for the failed stage
3. Agent classifies the failure type from the logs (schema error, data quality error, API error, resource error)
4. Agent executes the appropriate diagnostic tools for the failure type
5. If remediable: agent applies the remediation and verifies resolution
6. If not remediable: agent assembles complete diagnostic report and escalates

## Implementation

**Failure classification prompt:**
```
Analyze the following pipeline error log and classify the failure type:
- SCHEMA_CHANGE: source system schema changed (new/removed/renamed fields)
- DATA_QUALITY: upstream data fails quality checks (nulls, invalid values, referential integrity)
- API_FAILURE: external API unavailable or returning errors
- RESOURCE: compute or memory resource exhaustion
- UNKNOWN: cannot classify from available information

Error log: {error_log}

Return JSON: {type, confidence, evidence, recommended_next_step}
```

**Remediation decision tree:**
```python
remediation_map = {
    "SCHEMA_CHANGE": [
        "inspect_schema_diff",      # compare current to prior schema
        "apply_schema_migration",   # auto-apply known migration patterns
        "verify_pipeline_stage"     # re-run stage and check output
    ],
    "DATA_QUALITY": [
        "profile_failed_batch",     # identify quality issue location and extent
        "apply_quality_filter",     # filter out failing records if within threshold
        "reprocess_with_logging"    # reprocess with detailed error logging
    ],
    "API_FAILURE": [
        "check_api_status",         # verify API health
        "retry_with_backoff"        # retry after backoff period
    ],
    "RESOURCE": ["escalate"],       # resource issues require human intervention
    "UNKNOWN": ["escalate"]
}
```

**Escalation diagnostic report:**
```
Pipeline Orchestrator Diagnostic Report
Stage: {stage_name} | Failure time: {timestamp}
Error: {error_summary}
Diagnostic steps taken: {steps_with_results}
Failure classification: {classification} (confidence: {confidence})
Remediation attempted: {yes/no} | Outcome: {outcome}
Recommended resolution: {recommendation}
Relevant runbook: {runbook_link}
```

## Key Learning Points

**Failure classification quality determines automation rate.** The orchestrator's autonomous resolution rate depends on how accurately it classifies failure types. Invest in a high-quality classification prompt with few-shot examples for each failure type. Build the classification from real historical failures, not from hypothetical examples.

**Idempotent remediation is essential.** Remediation steps that are not idempotent — that cannot be safely re-run if the first attempt fails — create worse problems than the original failure. Design all remediation tools to be safe to retry.

**Escalation quality is as important as automation rate.** The 20% of failures that require human escalation are often the most complex. An escalation report that enables the engineer to understand the situation in 2 minutes instead of 45 is a significant operational improvement — one that is achievable even before the automation rate improves.

**Monitor the monitor.** The pipeline orchestrator is itself a system that can fail. Build observability for the orchestrator itself: did it correctly classify the failure type? Did its remediation succeed or make things worse? This meta-monitoring drives continuous improvement of the orchestrator's effectiveness.
