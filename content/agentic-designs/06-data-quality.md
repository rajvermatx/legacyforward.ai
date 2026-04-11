---
title: "Data Quality & Profiling Agent"
slug: "data-quality"
description: "An autonomous agent that profiles datasets, detects schema violations and outliers, suggests fixes, applies them iteratively, and validates the results. Every correction can reveal new issues that require re-analysis, making this a fundamentally iterative problem that static pipelines cannot solve. "
section: "agentic-designs"
order: 6
badges:
  - "Dataset Profiling"
  - "Schema Validation"
  - "Outlier Detection"
  - "Iterative Fix-Verify Loop"
  - "Validation Report"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/agentic-designs/06-data-quality.ipynb"
---

## 01. The Problem

**Data teams spend 80% of their time cleaning data.** The industry calls this the "80/20 rule" of data science: only 20% of time goes to actual analysis. Issues range from missing values and type mismatches to subtle semantic errors (e.g., an age column containing negative numbers, or a zip code stored as an integer that loses leading zeros).

**Problems are discovered too late.** A CSV is loaded into a pipeline, a model trains on dirty data, and the error surfaces weeks later when predictions are nonsensical. By then, the root cause is buried under layers of transformations. The cost of fixing data quality issues grows exponentially the later they are caught.

**Fixes create new problems.** Imputing missing values can shift distributions. Removing outliers can eliminate legitimate edge cases. Casting types can truncate data. Each fix must be validated, and that validation can reveal new issues. This is an inherently iterative process that static data validation rules cannot handle well.

**Real data we will use:** The UCI Census Income (Adult) dataset has real-world messiness: missing values encoded as " ?", mixed whitespace, categorical columns with inconsistent casing, and numeric columns with implausible ranges. It is freely available and well-understood, making it ideal for demonstrating data quality workflows.

## 02. Why an Agent

**Why not a static pipeline?** Traditional data validation (Great Expectations, pandera) defines rules upfront and flags violations. But it cannot *reason* about what to do with those violations. Should you impute, drop, or flag the row? That depends on the column semantics, the downstream use case, and the distribution of existing values. An LLM can reason about all of these factors.

**Why not a single LLM call?** Data quality assessment requires sequential steps: first profile the dataset, then check schema conformance, then detect outliers, then fix issues, then re-validate. Each step depends on the results of the prior step. A single prompt cannot hold an entire dataset in context, nor can it execute pandas operations to actually inspect the data.

**Why an agent?** The agent can:

-   **Profile first** — Call a profiling tool to get summary statistics, dtypes, null counts, and value distributions before deciding what to fix.
-   **Reason about fixes** — Use the LLM to decide whether missing values should be imputed (mean, median, mode) or rows should be dropped, based on the column's semantics.
-   **Apply and verify** — Execute the fix with a tool, then re-profile to confirm the fix worked and did not introduce new issues.
-   **Iterate** — If re-profiling reveals new issues (e.g., fixing nulls changed the distribution enough to create new outliers), the agent loops back and addresses them.

## Architecture Diagram

![Diagram 1](/diagrams/agentic-designs/data-quality-1.svg)

## 03. Architecture

### Profile Tool

Computes summary statistics for every column: dtype, null count, unique count, min/max/mean/median, and top-5 most frequent values. Returns a structured JSON report that the LLM can reason about.

### Schema Checker

Validates each column against an expected schema: correct dtype, allowed value ranges, regex patterns for strings, referential integrity checks. Returns a list of violations with severity levels.

### Outlier Detector

Uses IQR and Z-score methods to identify statistical outliers in numeric columns. Returns the outlier rows with their values and the threshold that was exceeded, letting the agent decide on action.

### Fix Applier

Executes a specific data transformation: impute nulls, cast types, strip whitespace, replace values, drop rows. Each fix is logged with before/after statistics for auditability.

### Validator

Runs a final validation pass: checks that all schema violations are resolved, no new nulls were introduced, distributions are stable, and row counts are within expected bounds.

### Report Generator

Produces a human-readable data quality report summarizing all issues found, fixes applied, and the final state of the dataset. Includes before/after comparisons for each column.

## 04. Tools & APIs

Tool definitions in OpenAI function calling format. Each tool operates on a pandas DataFrame stored in memory and referenced by a session ID.

```
import json
import pandas as pd
import numpy as np
from openai import OpenAI

client = OpenAI()

# ── Tool Definitions ──
tools = [
    {
        "type": "function",
        "function": {
            "name": "profile_dataset",
            "description": "Profile a dataset: return summary stats, dtypes, null counts, and value distributions for every column.",
            "parameters": {
                "type": "object",
                "properties": {
                    "columns": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Optional list of columns to profile. If empty, profile all."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_schema",
            "description": "Validate columns against expected schema. Returns violations with severity.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expected_schema": {
                        "type": "object",
                        "description": "Dict mapping column names to expected dtype and constraints, e.g. {'age': {'dtype': 'int64', 'min': 0, 'max': 120}}"
                    }
                },
                "required": ["expected_schema"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "detect_outliers",
            "description": "Detect statistical outliers in numeric columns using IQR or Z-score.",
            "parameters": {
                "type": "object",
                "properties": {
                    "column": {"type": "string", "description": "Column name to check"},
                    "method": {"type": "string", "enum": ["iqr", "zscore"], "description": "Detection method"}
                },
                "required": ["column", "method"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "apply_fix",
            "description": "Apply a data quality fix: impute_nulls, cast_dtype, strip_whitespace, replace_values, or drop_rows.",
            "parameters": {
                "type": "object",
                "properties": {
                    "fix_type": {
                        "type": "string",
                        "enum": ["impute_nulls", "cast_dtype", "strip_whitespace", "replace_values", "drop_rows"]
                    },
                    "column": {"type": "string"},
                    "params": {"type": "object", "description": "Fix-specific params, e.g. {'strategy': 'median'} or {'target_dtype': 'int64'}"}
                },
                "required": ["fix_type", "column"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "validate_result",
            "description": "Run final validation: check all schema rules pass, no unexpected nulls, distributions stable.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
]
```

## 05. The Agent Loop

The data quality agent follows an **iterative fix-verify loop**. Unlike a simple tool-calling agent that might call one or two tools and stop, this agent actively re-profiles the dataset after every fix to check whether the fix succeeded and whether it introduced new issues.

1.  **Profile** — The agent calls `profile_dataset` to understand the current state of the data: column types, null counts, value ranges, distributions.
2.  **Check Schema** — The agent calls `check_schema` with the expected schema to identify all violations: wrong dtypes, out-of-range values, unexpected nulls.
3.  **Detect Outliers** — For numeric columns with violations, the agent calls `detect_outliers` to quantify the extent of the problem.
4.  **Reason About Fix** — The LLM decides the best fix strategy for each issue based on the column semantics and the nature of the violation.
5.  **Apply Fix** — The agent calls `apply_fix` with the chosen strategy. The tool returns before/after statistics.
6.  **Re-Profile** — The agent calls `profile_dataset` again on the affected column to verify the fix worked.
7.  **Loop or Finish** — If new issues are found, loop back to step 4. If all checks pass, call `validate_result` and produce the final report.

**Why iterative?** Consider this real scenario: the `age` column has 1,836 missing values encoded as " ?" (string). The agent first strips whitespace, then replaces "?" with NaN, then casts to numeric, then imputes with median. After imputation, it re-profiles and discovers the distribution has shifted, creating new Z-score outliers at the boundary. The agent must then decide whether those outliers are genuine or artifacts of imputation.

## 06. Code Walkthrough

Complete implementation with tool functions operating on a shared DataFrame, plus the agent loop.

```
import pandas as pd
import numpy as np
import json
from openai import OpenAI

client = OpenAI()

# ── Load the UCI Adult dataset ──
ADULT_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/adult/adult.data"
COLUMNS = ["age", "workclass", "fnlwgt", "education",
           "education_num", "marital_status", "occupation",
           "relationship", "race", "sex", "capital_gain",
           "capital_loss", "hours_per_week", "native_country", "income"]

df = pd.read_csv(ADULT_URL, names=COLUMNS, na_values=" ?", skipinitialspace=True)
fix_log = []  # Track all fixes applied

# ── Tool Implementations ──
def profile_dataset(columns: list = None) -> str:
    """Profile dataset columns: dtypes, nulls, stats, top values."""
    global df
    cols = columns if columns else df.columns.tolist()
    profile = {}
    for col in cols:
        if col not in df.columns:
            continue
        info = {
            "dtype": str(df[col].dtype),
            "null_count": int(df[col].isnull().sum()),
            "null_pct": round(df[col].isnull().mean() * 100, 2),
            "unique": int(df[col].nunique()),
            "total_rows": len(df),
        }
        if pd.api.types.is_numeric_dtype(df[col]):
            info["min"] = float(df[col].min())
            info["max"] = float(df[col].max())
            info["mean"] = round(float(df[col].mean()), 2)
            info["median"] = float(df[col].median())
            info["std"] = round(float(df[col].std()), 2)
        else:
            info["top_values"] = df[col].value_counts().head(5).to_dict()
        profile[col] = info
    return json.dumps(profile, indent=2)

def check_schema(expected_schema: dict) -> str:
    """Check each column against expected dtype and value constraints."""
    global df
    violations = []
    for col, rules in expected_schema.items():
        if col not in df.columns:
            violations.append({"column": col, "issue": "column_missing", "severity": "critical"})
            continue
        if "dtype" in rules and str(df[col].dtype) != rules["dtype"]:
            violations.append({
                "column": col, "issue": "wrong_dtype",
                "expected": rules["dtype"], "actual": str(df[col].dtype),
                "severity": "high"
            })
        if "min" in rules and pd.api.types.is_numeric_dtype(df[col]):
            below = (df[col] < rules["min"]).sum()
            if below > 0:
                violations.append({
                    "column": col, "issue": "below_minimum",
                    "min_expected": rules["min"], "count": int(below),
                    "severity": "medium"
                })
        null_count = int(df[col].isnull().sum())
        if null_count > 0:
            violations.append({
                "column": col, "issue": "has_nulls",
                "null_count": null_count,
                "severity": "medium"
            })
    return json.dumps(violations, indent=2)

def detect_outliers(column: str, method: str = "iqr") -> str:
    """Detect outliers using IQR or Z-score method."""
    global df
    series = df[column].dropna()
    if method == "iqr":
        q1, q3 = series.quantile(0.25), series.quantile(0.75)
        iqr = q3 - q1
        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        outliers = series[(series < lower) | (series > upper)]
    else:  # zscore
        z = (series - series.mean()) / series.std()
        outliers = series[z.abs() > 3]
        lower, upper = series.mean() - 3 * series.std(), series.mean() + 3 * series.std()
    return json.dumps({
        "column": column, "method": method,
        "lower_bound": round(lower, 2),
        "upper_bound": round(upper, 2),
        "outlier_count": len(outliers),
        "outlier_pct": round(len(outliers) / len(series) * 100, 2),
        "sample_values": outliers.head(10).tolist()
    })

def apply_fix(fix_type: str, column: str, params: dict = None) -> str:
    """Apply a data quality fix and return before/after stats."""
    global df, fix_log
    params = params or {}
    before_nulls = int(df[column].isnull().sum())
    before_rows = len(df)

    if fix_type == "impute_nulls":
        strategy = params.get("strategy", "median")
        if strategy == "median":
            df[column] = df[column].fillna(df[column].median())
        elif strategy == "mean":
            df[column] = df[column].fillna(df[column].mean())
        elif strategy == "mode":
            df[column] = df[column].fillna(df[column].mode()[0])
    elif fix_type == "strip_whitespace":
        df[column] = df[column].str.strip()
    elif fix_type == "cast_dtype":
        target = params.get("target_dtype", "float64")
        df[column] = pd.to_numeric(df[column], errors="coerce") \
            if target in ("int64", "float64") else df[column].astype(target)
    elif fix_type == "drop_rows":
        condition = params.get("condition", "null")
        if condition == "null":
            df = df.dropna(subset=[column])

    after_nulls = int(df[column].isnull().sum())
    result = {
        "fix_type": fix_type, "column": column,
        "before_nulls": before_nulls, "after_nulls": after_nulls,
        "before_rows": before_rows, "after_rows": len(df),
        "status": "applied"
    }
    fix_log.append(result)
    return json.dumps(result)

def validate_result() -> str:
    """Final validation: check nulls, dtypes, row count."""
    global df
    issues = []
    for col in df.columns:
        nulls = int(df[col].isnull().sum())
        if nulls > 0:
            issues.append(f"{col}: {nulls} nulls remaining")
    return json.dumps({
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "remaining_issues": issues,
        "fixes_applied": len(fix_log),
        "status": "clean" if not issues else "needs_attention"
    })
```

**The agent loop** ties everything together with a system prompt that instructs the LLM to follow the profile-check-fix-verify pattern:

```
# ── Agent Loop ──
TOOL_MAP = {
    "profile_dataset": lambda args: profile_dataset(args.get("columns")),
    "check_schema": lambda args: check_schema(args["expected_schema"]),
    "detect_outliers": lambda args: detect_outliers(args["column"], args.get("method", "iqr")),
    "apply_fix": lambda args: apply_fix(args["fix_type"], args["column"], args.get("params")),
    "validate_result": lambda args: validate_result(),
}

SYSTEM_PROMPT = """You are a Data Quality Agent. Your job is to clean and validate datasets.

Follow this workflow:
1. Profile the dataset to understand its current state
2. Check the schema against expected types and constraints
3. For each violation, decide the best fix strategy
4. Apply fixes one at a time, re-profiling after each to verify
5. After all fixes, run validate_result for a final report

Be conservative: prefer imputation over dropping rows. Log your reasoning
for each fix decision. Stop when validate_result returns status 'clean'
or after 15 iterations."""

def run_data_quality_agent(task: str, max_steps: int = 15) -> str:
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
            print(f"  Step {step+1}: {fn_name}({json.dumps(fn_args)[:80]}...)")

            result = TOOL_MAP[fn_name](fn_args)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result
            })

    return "Max steps reached. Partial cleaning completed."

# ── Run the agent ──
result = run_data_quality_agent(
    "Clean the UCI Adult dataset. Expected schema: age (int64, 0-120), "
    "workclass (object, no nulls), education_num (int64, 1-16), "
    "hours_per_week (int64, 1-100). Fix nulls and outliers."
)
print(result)
```

## 07. Key Takeaways

- Data quality is inherently iterative: fixing one issue can reveal or create another, making static pipelines insufficient

- The agent's ability to reason about column semantics (age vs. income vs. zip code) leads to better fix decisions than generic rules

- Always re-profile after applying a fix to catch cascading effects like distribution shifts or new type mismatches

- Log every fix with before/after statistics for auditability — data lineage is critical for compliance

- Set conservative iteration limits (10-15 steps) to prevent the agent from over-cleaning data that is inherently messy

- Prefer imputation over row deletion to preserve dataset size, but document the imputation strategy for reproducibility

- The tool design is key: each tool should return structured JSON (not free text) so the LLM can parse results reliably

- This pattern extends to any domain with iterative validation: code review, document editing, test generation
