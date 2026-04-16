---
title: "Capstone 4: Data Pipeline Orchestrator"
slug: "capstone-04"
description: "Data pipelines break silently. A column renamed upstream, a vendor switching date formats, a nullable field that was never null until today — each failure looks trivial in hindsight, yet it propagates through warehouses for hours before anyone notices. This capstone builds an agentic ETL system that"
section: "agenticai"
order: 19
part: "Part 05 Capstones"
---

Part 5 — Capstones

# Capstone 4: Data Pipeline Orchestrator

Data pipelines break silently. A column renamed upstream, a vendor switching date formats, a nullable field that was never null until today: each failure looks trivial in hindsight, yet it propagates through warehouses for hours before anyone notices. This capstone builds an agentic ETL system that detects schema drift, validates quality, transforms data, and heals its own failures, replacing the manual triage loop with a supervisor-worker architecture that keeps pipelines healthy around the clock.

### What You Will Learn

-   Design a supervisor-worker agent architecture for multi-stage data pipeline orchestration
-   Build schema inference and drift detection agents that adapt to upstream changes automatically
-   Implement quality-check agents with configurable validation rules and anomaly detection
-   Create self-healing workflows with retry logic, auto-fix strategies, and graceful degradation
-   Wire full observability — structured logs, distributed traces, and pipeline state dashboards
-   Deploy the system with health checks, dead-letter queues, and cost-aware scaling

## C4.1 The Problem: Silent Pipeline Failures

Every data team has a war story. The marketing dashboard showed zero conversions for six hours because a third-party API changed its JSON envelope. The ML model retrained on corrupted features because a CSV upstream switched to semicolons. The compliance report went out with last week’s numbers because a cron job silently failed. These are not edge cases; they are Tuesday.

Traditional ETL pipelines are brittle because they encode assumptions statically. You hardcode column names, set row-count thresholds, and hope nothing changes. When something does, the pipeline either crashes loudly (best case) or passes corrupted data downstream (worst case). The manual repair loop takes hours on a good day.

An agentic pipeline inverts this. Agents *inspect* incoming data, *reason* about what changed, and *act* to fix it, or escalate when the change is too large for automated repair. The goal is not to eliminate human oversight. It is to shrink the gap between “something broke” and “here is what changed, what we did, and what needs your approval.”

> When Not to Auto-Heal
> 
> Self-healing is powerful but not universally appropriate. If a financial data source changes its schema in a way that affects regulatory reporting, the correct action is to halt and escalate — not silently remap columns. Design your healer with an explicit escalation threshold: small fixes happen automatically, large structural changes require human approval.

## C4.2 System Architecture

The system follows a supervisor-worker pattern. A **Pipeline Supervisor** orchestrates the end-to-end flow, delegating each stage to a specialized worker agent. Each worker is stateless and focused on one responsibility.

![Diagram 1](/diagrams/agenticai/capstone-04-1.svg)

Figure C4.1 — Agentic ETL pipeline: data flows top-to-bottom through specialized agents, with a healing loop on quality failures.

| Agent | Responsibility | Tools |
| --- | --- | --- |
| **Pipeline Supervisor** | Stage sequencing, state tracking, escalation | State store, notification API |
| **Schema Analyzer** | Infer types, detect drift, propose column mappings | Schema registry, LLM for semantic matching |
| **Quality Checker** | Validation rules, statistical checks, anomaly detection | Rules engine, stats library |
| **Transformer** | Normalize formats, enrich records, deduplicate | Pandas/Polars, enrichment APIs |
| **Healer** | Diagnose failures, apply auto-fix, retry or escalate | Error taxonomy, fix templates, LLM |

## C4.3 Data Source Connectors

Before agents can reason about data, the system needs to ingest it. A connector interface abstracts the differences between APIs, databases, and file stores behind a uniform contract.

```
"""Data source connectors — uniform interface for heterogeneous sources."""
from __future__ import annotations
import csv, httpx
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

@dataclass
class SourceMetadata:
    source_name: str
    fetched_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    record_count: int = 0

@dataclass
class DataBatch:
    records: list[dict[str, Any]]; metadata: SourceMetadata

class BaseConnector(ABC):
    @abstractmethod
    async def fetch(self) -> DataBatch: ...

class APIConnector(BaseConnector):
    def __init__(self, url: str, headers: dict | None = None, records_path: str = "data"):
        self.url, self.headers, self.records_path = url, headers or {}, records_path
    async def fetch(self) -> DataBatch:
        async with httpx.AsyncClient() as client:
            resp = await client.get(self.url, headers=self.headers)
            resp.raise_for_status(); payload = resp.json()
        records = payload
        for key in self.records_path.split("."): records = records[key]
        return DataBatch(records, SourceMetadata(self.url, record_count=len(records)))

class CSVConnector(BaseConnector):
    def __init__(self, path: str, delimiter: str = ","):
        self.path, self.delimiter = path, delimiter
    async def fetch(self) -> DataBatch:
        rows: list[dict[str, Any]] = []
        with Path(self.path).open(newline="") as fh:
            for row in csv.DictReader(fh, delimiter=self.delimiter): rows.append(dict(row))
        return DataBatch(rows, SourceMetadata(self.path, record_count=len(rows)))
```

> Production Tip
> 
> Real deployments should support incremental fetching (cursors, watermarks, change-data-capture) to avoid re-ingesting entire tables on every run. `SourceMetadata` is a natural place to track watermarks across runs.

## C4.4 Schema Analyzer Agent

The schema analyzer infers types, compares against the expected schema, and produces a drift report. For simple changes it proposes automatic mappings. For structural breaks it flags for human review.

```
"""Schema Analyzer Agent — infer, compare, report drift."""
from __future__ import annotations
import json
from dataclasses import dataclass
from enum import Enum
from typing import Any
from openai import AsyncOpenAI

class DriftSeverity(str, Enum):
    NONE = "none"; LOW = "low"; MEDIUM = "medium"; HIGH = "high"

@dataclass
class ColumnInfo:
    name: str; inferred_type: str; nullable: bool; sample_values: list[Any]

@dataclass
class SchemaReport:
    columns: list[ColumnInfo]
    drift_severity: DriftSeverity
    drift_details: list[str]
    suggested_mappings: dict[str, str]   # old_col -> new_col

class SchemaAnalyzerAgent:
    SYSTEM_PROMPT = (
        "You are a schema analysis agent. Given sample records and an expected "
        "schema, detect changes and propose column mappings. Respond JSON only.")

    def __init__(self, client: AsyncOpenAI, model: str = "gpt-4o-mini"):
        self.client, self.model = client, model

    def _infer_type(self, values: list[Any]) -> tuple[str, bool]:
        non_null = [v for v in values if v is not None and v != ""]
        nullable = len(non_null) < len(values)
        if not non_null: return "unknown", True
        # numeric?
        try:
            [float(v) for v in non_null]; return "float", nullable
        except (ValueError, TypeError): pass
        # date?
        from dateutil import parser as dp
        try:
            [dp.parse(str(v)) for v in non_null[:10]]; return "datetime", nullable
        except (ValueError, TypeError): pass
        return "string", nullable

    def infer_schema(self, records: list[dict]) -> list[ColumnInfo]:
        if not records: return []
        cols: dict[str, list] = {}
        for rec in records[:200]:
            for k, v in rec.items(): cols.setdefault(k, []).append(v)
        return [ColumnInfo(n, *self._infer_type(v), v[:3]) for n, v in cols.items()]

    async def detect_drift(self, inferred: list[ColumnInfo],
                           expected: dict[str, str]) -> SchemaReport:
        inf_names = {c.name for c in inferred}; exp_names = set(expected)
        missing, added = exp_names - inf_names, inf_names - exp_names
        details, sev = [], DriftSeverity.NONE
        if missing: details.append(f"Missing: {missing}"); sev = DriftSeverity.HIGH
        if added:   details.append(f"New: {added}"); sev = max(sev, DriftSeverity.LOW, key=lambda s: list(DriftSeverity).index(s))
        for c in inferred:
            if c.name in expected and c.inferred_type != expected[c.name]:
                details.append(f"Type change {c.name}: {expected[c.name]}->{c.inferred_type}")
                if sev.value < DriftSeverity.MEDIUM.value: sev = DriftSeverity.MEDIUM
        suggested = {}
        if missing and added:
            suggested = await self._suggest_mappings(list(missing), list(added), inferred)
        return SchemaReport(inferred, sev, details, suggested)

    async def _suggest_mappings(self, missing, added, inferred):
        info = {c.name: {"type": c.inferred_type, "samples": c.sample_values[:2]}
                for c in inferred if c.name in added}
        resp = await self.client.chat.completions.create(model=self.model,
            messages=[{"role":"system","content":self.SYSTEM_PROMPT},
                      {"role":"user","content":f"Missing:{missing}\nNew:{json.dumps(info,default=str)}\nMap old->new JSON."}],
            response_format={"type":"json_object"}, temperature=0)
        return json.loads(resp.choices[0].message.content)
```

## C4.5 Quality Checker Agent

Two layers of validation: a deterministic rules engine for known constraints and a statistical anomaly detector for distribution shifts.

```
"""Quality Checker Agent — rules + anomaly detection."""
from __future__ import annotations
import re, statistics
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable

class CheckResult(str, Enum):
    PASS = "pass"; WARN = "warn"; FAIL = "fail"

@dataclass
class ValidationFinding:
    check_name: str; column: str; result: CheckResult; message: str; affected_rows: int = 0

@dataclass
class QualityReport:
    overall: CheckResult; findings: list[ValidationFinding] = field(default_factory=list)
    row_count: int = 0

@dataclass
class ValidationRule:
    name: str; column: str; check_fn: Callable[[Any], bool]; severity: CheckResult = CheckResult.FAIL

class QualityCheckerAgent:
    def __init__(self, rules: list[ValidationRule] | None = None):
        self.rules = rules or []

    def add_not_null(self, col): self.rules.append(ValidationRule(
        f"not_null_{col}", col, lambda v: v is not None and v != ""))

    def add_range_check(self, col, lo, hi): self.rules.append(ValidationRule(
        f"range_{col}", col, lambda v, lo=lo, hi=hi: lo <= float(v) <= hi if v else True))

    def add_pattern_check(self, col, pattern):
        rx = re.compile(pattern)
        self.rules.append(ValidationRule(f"pattern_{col}", col,
            lambda v, rx=rx: bool(rx.match(str(v))) if v else True))

    def validate(self, records: list[dict[str, Any]]) -> QualityReport:
        findings, overall = [], CheckResult.PASS
        for rule in self.rules:
            fails = sum(1 for r in records if not self._safe_check(rule, r))
            if fails:
                findings.append(ValidationFinding(rule.name, rule.column, rule.severity,
                    f"{fails}/{len(records)} rows failed ({fails/len(records)*100:.1f}%)", fails))
                if rule.severity == CheckResult.FAIL: overall = CheckResult.FAIL
        # Statistical anomaly detection on numeric columns
        findings.extend(self._detect_anomalies(records))
        if any(f.result == CheckResult.FAIL for f in findings): overall = CheckResult.FAIL
        return QualityReport(overall, findings, len(records))

    def _safe_check(self, rule, rec):
        try: return rule.check_fn(rec.get(rule.column))
        except Exception: return False

    def _detect_anomalies(self, records) -> list[ValidationFinding]:
        if len(records) < 10: return []
        findings = []
        nums: dict[str, list[float]] = {}
        for r in records:
            for k, v in r.items():
                try: nums.setdefault(k, []).append(float(v))
                except (ValueError, TypeError): pass
        for col, vals in nums.items():
            if len(vals) < 10: continue
            mu, sd = statistics.mean(vals), statistics.stdev(vals)
            if sd == 0: continue
            outliers = sum(1 for v in vals if abs(v - mu) > 3 * sd)
            if outliers / len(vals) > 0.05:
                findings.append(ValidationFinding(f"anomaly_{col}", col, CheckResult.WARN,
                    f"{outliers} outliers beyond 3\u03c3 (mean={mu:.2f}, sd={sd:.2f})", outliers))
        return findings
```

## C4.6 Transformer Agent

The transformer normalizes data into the target schema: type coercion, date standardization, whitespace cleanup, and deduplication. Column renames from schema analysis are applied first.

```
"""Transformer Agent — normalize, enrich, deduplicate."""
from __future__ import annotations
import json
from dataclasses import dataclass
from typing import Any
from dateutil import parser as dp

@dataclass
class TransformResult:
    records: list[dict[str, Any]]; applied: list[str]; rows_dropped: int; rows_modified: int

class TransformerAgent:
    def __init__(self, target_schema: dict[str, str], mappings: dict[str, str] | None = None):
        self.target_schema, self.mappings = target_schema, mappings or {}

    def transform(self, records: list[dict[str, Any]]) -> TransformResult:
        applied, modified, out = [], 0, []
        for rec in records:
            row, changed = dict(rec), False
            for old, new in self.mappings.items():
                if old in row: row[new]=row.pop(old); changed=True
            for col, ttype in self.target_schema.items():
                if col not in row: continue
                try:
                    coerced = self._coerce(row[col], ttype)
                    if coerced != row[col]: changed=True
                    row[col] = coerced
                except (ValueError, TypeError): row[col]=None; changed=True
            for k, v in row.items():
                if isinstance(v,str) and v!=v.strip(): row[k]=v.strip(); changed=True
            out.append(row); modified += int(changed)
        before = len(out); out = self._dedup(out)
        if self.mappings: applied.append(f"Renamed: {self.mappings}")
        applied += ["Type coercion","Whitespace normalization"]
        if before-len(out): applied.append(f"Deduped: removed {before-len(out)}")
        return TransformResult(out, applied, before-len(out), modified)

    def _coerce(self, val, ttype):
        if val is None or val == "": return None
        if ttype == "integer": return int(float(val))
        if ttype == "float":   return float(val)
        if ttype == "boolean": return str(val).lower() in ("true", "1", "yes")
        if ttype == "datetime":
            dt = dp.parse(str(val)); return dt.isoformat() if dt else None
        return str(val)

    def _dedup(self, records):
        seen, unique = set(), []
        for r in records:
            key = json.dumps(r, sort_keys=True, default=str)
            if key not in seen: seen.add(key); unique.append(r)
        return unique
```

## C4.7 Healer Agent and Retry Logic

When the quality gate fails, the healer follows three steps: **diagnose** from the quality report, **select a fix strategy** from a known taxonomy, and **apply** deterministically. Issues unresolved within the retry limit trigger escalation.

```
"""Healer Agent — diagnose, fix, retry, or escalate."""
from __future__ import annotations
import json
from dataclasses import dataclass
from enum import Enum
from typing import Any
from openai import AsyncOpenAI

class FixStrategy(str, Enum):
    IMPUTE_NULLS = "impute_nulls"; COERCE_TYPES = "coerce_types"
    DROP_INVALID = "drop_invalid"; REMAP_COLUMNS = "remap_columns"
    CLAMP_OUTLIERS = "clamp_outliers"; ESCALATE = "escalate"

@dataclass
class HealResult:
    strategy: FixStrategy; records: list[dict]; rows_fixed: int
    rows_dropped: int; explanation: str; needs_escalation: bool = False

class HealerAgent:
    SYSTEM_PROMPT = ("You are a data pipeline healer. Given a quality report, choose a fix "
        "strategy: impute_nulls, coerce_types, drop_invalid, remap_columns, "
        "clamp_outliers, escalate. Return JSON: {\"strategy\":\"...\",\"params\":{...},\"explanation\":\"...\"}.")

    def __init__(self, client: AsyncOpenAI, model="gpt-4o-mini", max_retries=3):
        self.client, self.model, self.max_retries = client, model, max_retries

    async def diagnose_and_fix(self, records, quality_report, attempt=1) -> HealResult:
        if attempt > self.max_retries:
            return HealResult(FixStrategy.ESCALATE, records, 0, 0,
                f"Exceeded {self.max_retries} retries. Escalating.", True)
        resp = await self.client.chat.completions.create(model=self.model,
            messages=[{"role":"system","content":self.SYSTEM_PROMPT},
                      {"role":"user","content":json.dumps(quality_report, indent=2)}],
            response_format={"type":"json_object"}, temperature=0)
        dx = json.loads(resp.choices[0].message.content)
        strat = FixStrategy(dx.get("strategy","escalate"))
        if strat == FixStrategy.ESCALATE:
            return HealResult(strat, records, 0, 0, dx.get("explanation",""), True)
        fixed, n_fix, n_drop = self._apply(records, strat, dx.get("params",{}))
        return HealResult(strat, fixed, n_fix, n_drop, dx.get("explanation",""))

    def _apply(self, recs, strat, params):
        col, fixed, dropped, out = params.get("column",""), 0, 0, []
        if strat == FixStrategy.IMPUTE_NULLS:
            fill = params.get("fill_value","")
            for r in recs:
                row = dict(r)
                if not row.get(col): row[col]=fill; fixed+=1
                out.append(row)
        elif strat == FixStrategy.DROP_INVALID:
            for r in recs:
                if r.get(col) in (None,""): dropped+=1
                else: out.append(dict(r))
        elif strat == FixStrategy.CLAMP_OUTLIERS:
            lo, hi = float(params.get("min","-inf")), float(params.get("max","inf"))
            for r in recs:
                row = dict(r)
                try:
                    v = float(row.get(col,0))
                    if v<lo: row[col]=lo; fixed+=1
                    elif v>hi: row[col]=hi; fixed+=1
                except (ValueError,TypeError): pass
                out.append(row)
        else: out = [dict(r) for r in recs]
        return out, fixed, dropped
```

> Design Decision: Deterministic Fixes, LLM Diagnosis
> 
> The LLM only performs *diagnosis and strategy selection*; actual data transformations are deterministic functions. The model never touches your data directly — it decides which well-tested function to call. This keeps the system auditable and prevents hallucinated data values.

## C4.8 Pipeline Supervisor

The supervisor orchestrates the full workflow and logs every state transition for observability.

```
"""Pipeline Supervisor — orchestrates the full ETL workflow."""
from __future__ import annotations
import logging, time, json
from dataclasses import dataclass, field
from enum import Enum
from typing import Any
from openai import AsyncOpenAI

logger = logging.getLogger("pipeline")

class Stage(str, Enum):
    INIT="init"; INGEST="ingest"; SCHEMA="schema"; VALIDATE="validate"
    TRANSFORM="transform"; GATE="gate"; HEAL="heal"; LOAD="load"
    COMPLETE="complete"; FAILED="failed"

@dataclass
class PipelineState:
    run_id: str; stage: Stage = Stage.INIT; started_at: float = field(default_factory=time.time)
    events: list[dict] = field(default_factory=list); heals: int = 0
    record_count: int = 0; error: str | None = None
    def log(self, etype, data): self.events.append(
        {"ts": time.time(), "stage": self.stage.value, "type": etype, "data": data})

class PipelineSupervisor:
    def __init__(self, connector, expected_schema, client: AsyncOpenAI,
                 model="gpt-4o-mini", max_heals=3, load_fn=None):
        self.connector, self.expected = connector, expected_schema
        self.schema_agent = SchemaAnalyzerAgent(client, model)
        self.quality_agent = QualityCheckerAgent()
        self.transformer = TransformerAgent(expected_schema)
        self.healer = HealerAgent(client, model, max_heals)
        self.max_heals, self.load_fn = max_heals, load_fn

    async def run(self, run_id: str) -> PipelineState:
        st = PipelineState(run_id=run_id)
        try:
            # 1. Ingest
            st.stage = Stage.INGEST; batch = await self.connector.fetch()
            recs = batch.records; st.record_count = len(recs)
            st.log("ingested", {"source": batch.metadata.source_name, "rows": len(recs)})
            # 2. Schema analysis
            st.stage = Stage.SCHEMA; inferred = self.schema_agent.infer_schema(recs)
            report = await self.schema_agent.detect_drift(inferred, self.expected)
            st.log("schema", {"severity": report.drift_severity.value})
            if report.drift_severity == DriftSeverity.HIGH:
                st.stage, st.error = Stage.FAILED, f"High drift: {report.drift_details}"; return st
            if report.suggested_mappings: self.transformer.mappings = report.suggested_mappings
            # 3. Validate raw
            st.stage = Stage.VALIDATE; q = self.quality_agent.validate(recs)
            st.log("validated", {"overall": q.overall.value})
            # 4. Transform
            st.stage = Stage.TRANSFORM; tr = self.transformer.transform(recs); recs = tr.records
            st.log("transformed", {"applied": tr.applied, "dropped": tr.rows_dropped})
            # 5. Quality gate + heal loop
            st.stage = Stage.GATE; fq = self.quality_agent.validate(recs)
            while fq.overall == CheckResult.FAIL and st.heals < self.max_heals:
                st.stage, st.heals = Stage.HEAL, st.heals + 1
                qr = {"overall": fq.overall.value, "findings": [
                    {"check":f.check_name,"col":f.column,"msg":f.message} for f in fq.findings]}
                hr = await self.healer.diagnose_and_fix(recs, qr, st.heals)
                st.log("healed", {"strategy": hr.strategy.value, "fixed": hr.rows_fixed})
                if hr.needs_escalation: st.stage,st.error=Stage.FAILED,hr.explanation; return st
                recs = hr.records; st.stage = Stage.GATE; fq = self.quality_agent.validate(recs)
            if fq.overall == CheckResult.FAIL:
                st.stage, st.error = Stage.FAILED, "Quality gate failed after all heals"; return st
            # 6. Load
            st.stage = Stage.LOAD
            if self.load_fn: await self.load_fn(recs)
            st.log("loaded", {"rows": len(recs)}); st.stage = Stage.COMPLETE
        except Exception as e:
            st.stage, st.error = Stage.FAILED, str(e); logger.exception(e)
        return st
```

## C4.9 Observability and Pipeline State

For production, add structured JSON logging, OpenTelemetry spans per stage, and a dashboard endpoint.

```
"""Observability — structured logging, tracing, dashboard."""
import json, logging
from functools import wraps
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

provider = TracerProvider()
provider.add_span_processor(SimpleSpanProcessor(OTLPSpanExporter()))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("pipeline-orchestrator")

class StructuredLogger:
    def __init__(self, name="pipeline"):
        self.logger = logging.getLogger(name)
        h = logging.StreamHandler(); h.setFormatter(logging.Formatter("%(message)s"))
        self.logger.addHandler(h); self.logger.setLevel(logging.INFO)
    def log(self, level, event, **kw):
        self.logger.info(json.dumps({"event": event, "level": level, **kw}, default=str))

def traced_stage(name):
    def deco(fn):
        @wraps(fn)
        async def wrapper(*a, **kw):
            with tracer.start_as_current_span(name) as span:
                span.set_attribute("pipeline.stage", name)
                try: result = await fn(*a, **kw); span.set_attribute("pipeline.status","ok"); return result
                except Exception as e: span.record_exception(e); raise
        return wrapper
    return deco

def state_to_dashboard(st) -> dict:
    dur = (st.events[-1]["ts"] - st.started_at) if st.events else 0
    return {"run_id": st.run_id, "stage": st.stage.value, "duration_s": round(dur, 2),
            "records": st.record_count, "heals": st.heals, "error": st.error,
            "events": st.events[-10:]}
```

> Dead-Letter Queue
> 
> Records that cannot be fixed after all retries should be routed to a dead-letter queue — a database table, S3 prefix, or message topic — with full error context. This gives operators a clean list to investigate without blocking the rest of the pipeline.

## C4.10 Running the Pipeline

The caller configures connectors, defines the schema and rules, and launches the supervisor.

```
"""Entry point — configure and run."""
import asyncio, uuid, json
from openai import AsyncOpenAI

async def main():
    client = AsyncOpenAI()
    schema = {"user_id": "integer", "email": "string", "signup_date": "datetime",
              "purchase_amount": "float", "country": "string"}
    connector = CSVConnector(path="data/daily_signups.csv")
    qa = QualityCheckerAgent()
    qa.add_not_null("user_id"); qa.add_not_null("email")
    qa.add_pattern_check("email", r"^[^@]+@[^@]+\.[^@]+$")
    qa.add_range_check("purchase_amount", 0, 100_000)
    async def load(recs): print(f"Loaded {len(recs)} records to warehouse")
    sup = PipelineSupervisor(connector, schema, client, max_heals=3, load_fn=load)
    sup.quality_agent = qa
    state = await sup.run(str(uuid.uuid4())[:8])
    print(json.dumps(state_to_dashboard(state), indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(main())
```

> Cost Awareness
> 
> Each run may invoke the LLM multiple times: once for schema drift mapping, once per heal attempt. For a pipeline running hourly across ten sources, this adds up. Track token usage per run in your observability layer and set budget alerts. Use smaller models for routine diagnosis and reserve larger models for complex escalations.

## Portfolio Project: Self-Healing Data Pipeline

Build and deploy a complete pipeline orchestrator with schema inference, quality validation, and self-healing. Include a working supervisor, at least three worker agents, structured observability, and a demo showing the system recovering from an injected failure (a renamed column, corrupt batch, or schema drift).

**Pick one domain variant:**

| Domain Variant | Pipeline Scenarios |
| --- | --- |
| Healthcare Claims | CPT code validation, billing anomaly detection, heal rejected claims with missing diagnosis codes |
| Financial Transactions | Trading data feeds, market-hours and price-bound validation, currency format drift correction |
| E-commerce Orders | Multi-vendor order aggregation, SKU normalization, duplicate shipment resolution |
| IoT Sensor Data | Factory telemetry, calibration drift detection, missing-reading imputation |
| Government Records | Cross-agency reconciliation, SSN/TIN format validation, PII anomaly quarantine |
| Media Analytics | Ad-impression logs, timestamp-zone normalization, campaign ID schema healing |

## Summary

We built a supervisor-worker ETL architecture where each stage, schema inference, quality checking, transformation, and healing, is handled by a focused agent. The system detects schema drift, validates against rules and statistical baselines, repairs common failures autonomously, and escalates cleanly when confidence is insufficient.

### Key Takeaways

-   **Separate diagnosis from action.** Let the LLM choose strategies but keep actual transforms deterministic. This makes the system auditable and prevents hallucinated data values.
-   **Schema drift is the norm.** Build agents that detect and adapt to changes automatically, with clear severity thresholds for auto-fix versus escalation.
-   **Quality gates are non-negotiable.** Validate both before and after transformation. A pipeline that loads without a final quality check will eventually corrupt your warehouse.
-   **Observability is not optional.** Every agent decision, retry, and fix must be logged with full context. Without this, debugging a multi-agent pipeline is impossible.
-   **Design for escalation.** The healer’s most important feature is knowing when to stop. Bounded retries with clear escalation paths prevent the system from amplifying damage.

### Exercises

| Type | Exercise | Description |
| --- | --- | --- |
| Conceptual | **Schema drift response** | A source changes its date column from `YYYY-MM-DD` to Unix epoch timestamps. Walk through how each agent responds. At what severity level should this drift be classified, and why? |
| Coding | **Referential integrity check** | Extend `QualityCheckerAgent` with a referential integrity check: given a set of valid foreign-key values (e.g., country codes), validate that every record’s field appears in the allowed set. Write the rule, integrate it, and test with invalid values. |
| Design | **Scheduling layer** | Your pipeline processes data from eight sources on different schedules. Design a scheduling layer on top of the supervisor that handles concurrent runs, prevents duplicate processing, and provides a unified health dashboard. Sketch the architecture and key data structures. |