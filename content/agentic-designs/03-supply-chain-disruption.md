---
title: "Supply Chain Disruption Agent"
slug: "supply-chain-disruption"
description: "Global supply chains have thousands of nodes spanning dozens of countries. When a disruption hits — a port closure, a semiconductor shortage, a geopolitical event — the cascading effects are unpredictable. This agent monitors supplier health indicators, detects anomalies in lead times and delivery r"
section: "agentic-designs"
order: 3
badges:
  - "Supplier Health Monitoring"
  - "Lead Time Anomaly Detection"
  - "UN Comtrade Trade Data"
  - "Rebalancing Simulation"
  - "Iterative Optimization Loop"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/agentic-designs/03-supply-chain-disruption.ipynb"
---

## 01. The Problem

A typical manufacturing company sources components from 500+ suppliers across 30+ countries. Each supplier has its own lead times, quality metrics, and risk profile. When a disruption occurs — whether it is a natural disaster closing a port, a trade policy change imposing new tariffs, or a key supplier going bankrupt — the procurement team must rapidly assess the impact, find alternatives, and rebalance orders to maintain production schedules.

The challenge is **cascading uncertainty**. A semiconductor shortage in Taiwan does not just affect the direct buyer — it cascades to every product that uses those chips, every assembly line that depends on those products, and every customer waiting for delivery. Understanding these cascades requires traversing a complex graph of supplier dependencies, assessing each node's vulnerability, and simulating what happens when you shift volume to alternative sources.

Traditional ERP systems track purchase orders and lead times but cannot reason about disruption cascades, evaluate geopolitical risk, or discover alternative suppliers in real-time. Supply chain analysts spend days manually researching alternatives, comparing logistics costs, and building spreadsheet models. An agent can compress this into minutes by programmatically accessing trade databases, running simulations, and synthesizing recommendations.

## 02. Why an Agent

**Why not a dashboard?** Dashboards show current state but cannot reason about futures. When a supplier shows a 40% increase in lead times, the question is: is this a temporary spike (weather delay) or a structural shift (raw material shortage)? The agent can investigate — checking trade flow data, looking for similar patterns across the industry, and querying news for disruption signals.

**Why iterative optimization?** Finding the optimal rebalancing strategy is not a single-step calculation. The agent might propose shifting 30% of volume from Supplier A to Supplier B, then discover that Supplier B cannot handle the additional capacity. It then searches for Supplier C, finds a viable option but at higher cost, and iterates until it finds a balanced solution that meets cost, capacity, and delivery constraints. This iterative refinement is the hallmark of agentic behavior.

**The agent advantage:** It can interleave data gathering (monitoring, anomaly detection) with analysis (finding alternatives) and planning (simulation). At each step, the agent decides whether it needs more data or has enough to make a recommendation. A fixed pipeline runs all steps regardless; the agent allocates its compute budget where it matters most.

## Architecture Diagram

![Diagram 1](/diagrams/agentic-designs/supply-chain-disruption-1.svg)

## 03. Architecture

### Data Sources

UN Comtrade API for international trade flows, World Bank Logistics Performance Index for country-level logistics quality, and a synthetic supplier database representing internal procurement data with lead times, quality scores, and capacity.

### Agent Core

An OpenAI function-calling agent prompted as a senior supply chain analyst. The agent receives a disruption alert or monitoring query and iteratively investigates, analyzes, and recommends using five specialized tools.

### Tool Registry

Five tools: monitor\_suppliers (check health metrics), detect\_anomaly (flag lead time and delivery rate deviations), find\_alternatives (search trade databases for replacement suppliers), simulate\_rebalance (model volume redistribution), and generate\_plan (produce an actionable mitigation plan).

### Optimization Loop

The agent may run the simulate\_rebalance tool multiple times with different configurations, comparing cost and risk outcomes. It converges on a recommendation by iteratively narrowing the solution space — similar to how a human analyst would build and test multiple scenarios in a spreadsheet.

## 04. Tools & APIs

Each tool operates on structured data and returns JSON. The supplier database is synthetic but mirrors the schema of real ERP procurement data. The UN Comtrade API provides actual international trade statistics.

```
import json, requests, statistics
from datetime import datetime

# ── Synthetic supplier database ──
SUPPLIERS = {
    "SUP-001": {
        "name": "TaiwanChip Corp", "country": "TWN", "product": "semiconductors",
        "avg_lead_days": 21, "recent_lead_days": [21, 23, 28, 35, 42],
        "on_time_rate": 0.72, "capacity_pct": 0.95, "unit_cost": 12.50
    },
    "SUP-002": {
        "name": "ShenZhen Electronics", "country": "CHN", "product": "semiconductors",
        "avg_lead_days": 18, "recent_lead_days": [18, 19, 18, 20, 19],
        "on_time_rate": 0.94, "capacity_pct": 0.60, "unit_cost": 14.00
    },
    "SUP-003": {
        "name": "Bavaria Precision GmbH", "country": "DEU", "product": "precision_parts",
        "avg_lead_days": 14, "recent_lead_days": [14, 15, 14, 13, 15],
        "on_time_rate": 0.97, "capacity_pct": 0.70, "unit_cost": 22.00
    },
    "SUP-004": {
        "name": "Korea Semi Inc", "country": "KOR", "product": "semiconductors",
        "avg_lead_days": 25, "recent_lead_days": [24, 25, 26, 25, 24],
        "on_time_rate": 0.91, "capacity_pct": 0.45, "unit_cost": 15.50
    },
    "SUP-005": {
        "name": "MexiParts SA", "country": "MEX", "product": "precision_parts",
        "avg_lead_days": 10, "recent_lead_days": [10, 11, 12, 10, 11],
        "on_time_rate": 0.88, "capacity_pct": 0.55, "unit_cost": 18.00
    }
}

# ── Tool 1: Monitor supplier health ──
def monitor_suppliers(product: str = "") -> str:
    """Get current health metrics for all suppliers, optionally filtered by product."""
    results = []
    for sid, s in SUPPLIERS.items():
        if product and s["product"] != product:
            continue
        results.append({
            "id": sid, "name": s["name"], "country": s["country"],
            "product": s["product"],
            "avg_lead_days": s["avg_lead_days"],
            "latest_lead_days": s["recent_lead_days"][-1],
            "on_time_rate": s["on_time_rate"],
            "capacity_used": s["capacity_pct"],
            "unit_cost": s["unit_cost"]
        })
    return json.dumps(results, indent=2)

# ── Tool 2: Detect anomalies in lead times ──
def detect_anomaly(supplier_id: str, threshold_stddev: float = 2.0) -> str:
    """Detect if a supplier's recent lead times are anomalous using z-score."""
    s = SUPPLIERS.get(supplier_id)
    if not s:
        return json.dumps({"error": "Supplier not found"})

    lead_times = s["recent_lead_days"]
    mean = statistics.mean(lead_times[:-1])  # Historical mean (exclude latest)
    stdev = statistics.stdev(lead_times[:-1]) if len(lead_times) > 2 else 1.0
    latest = lead_times[-1]
    z_score = (latest - mean) / stdev if stdev > 0 else 0

    is_anomaly = abs(z_score) > threshold_stddev
    trend = "increasing" if lead_times[-1] > lead_times[-2] > lead_times[-3] else "stable"

    return json.dumps({
        "supplier_id": supplier_id,
        "name": s["name"],
        "historical_mean": round(mean, 1),
        "latest_lead_days": latest,
        "z_score": round(z_score, 2),
        "is_anomaly": is_anomaly,
        "trend": trend,
        "lead_time_history": lead_times
    }, indent=2)

# ── Tool 3: Find alternative suppliers via UN Comtrade ──
def find_alternatives(product_code: str, exclude_country: str = "") -> str:
    """Search UN Comtrade for countries exporting a product (HS commodity code).
    Use HS code 8542 for semiconductors, 8466 for precision parts."""
    url = "https://comtradeapi.un.org/public/v1/preview/C/A/HS"
    params = {
        "cmdCode": product_code,
        "flowCode": "X",  # Exports
        "partnerCode": 0,  # World
        "period": "2023",
        "motCode": 0,
    }
    try:
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json().get("data", [])
    except:
        # Fallback to synthetic data if API unavailable
        data = [
            {"reporterDesc": "Korea", "reporterCode": "KOR", "primaryValue": 125000000000},
            {"reporterDesc": "Japan", "reporterCode": "JPN", "primaryValue": 45000000000},
            {"reporterDesc": "USA", "reporterCode": "USA", "primaryValue": 38000000000},
            {"reporterDesc": "Germany", "reporterCode": "DEU", "primaryValue": 22000000000},
        ]

    alternatives = []
    for row in sorted(data, key=lambda x: x.get("primaryValue", 0), reverse=True)[:10]:
        country = row.get("reporterCode", row.get("reporterDesc", ""))
        if exclude_country and country == exclude_country:
            continue
        alternatives.append({
            "country": row.get("reporterDesc", country),
            "export_value_usd": row.get("primaryValue", 0),
        })
    return json.dumps(alternatives[:5], indent=2)

# ── Tool 4: Simulate rebalancing ──
def simulate_rebalance(current_allocation: str, proposed_changes: str) -> str:
    """Simulate shifting volume between suppliers and calculate cost/risk impact.
    current_allocation: JSON {supplier_id: volume_pct}
    proposed_changes: JSON {supplier_id: new_volume_pct}"""
    current = json.loads(current_allocation)
    proposed = json.loads(proposed_changes)

    scenarios = {}
    for label, alloc in [("current", current), ("proposed", proposed)]:
        total_cost = 0
        weighted_lead = 0
        weighted_reliability = 0
        max_capacity_risk = 0
        for sid, pct in alloc.items():
            s = SUPPLIERS.get(sid, {})
            if not s:
                continue
            total_cost += s["unit_cost"] * (pct / 100)
            weighted_lead += s["avg_lead_days"] * (pct / 100)
            weighted_reliability += s["on_time_rate"] * (pct / 100)
            new_capacity = s["capacity_pct"] + (pct - current.get(sid, 0)) / 100 * 0.5
            max_capacity_risk = max(max_capacity_risk, new_capacity)

        scenarios[label] = {
            "weighted_cost_per_unit": round(total_cost, 2),
            "weighted_lead_days": round(weighted_lead, 1),
            "weighted_reliability": round(weighted_reliability, 3),
            "max_capacity_utilization": round(max_capacity_risk, 2),
            "capacity_warning": max_capacity_risk > 0.90
        }

    return json.dumps({
        "current": scenarios["current"],
        "proposed": scenarios["proposed"],
        "cost_delta_pct": round(
            (scenarios["proposed"]["weighted_cost_per_unit"] -
             scenarios["current"]["weighted_cost_per_unit"]) /
            scenarios["current"]["weighted_cost_per_unit"] * 100, 1
        ),
        "lead_time_delta_days": round(
            scenarios["proposed"]["weighted_lead_days"] -
            scenarios["current"]["weighted_lead_days"], 1
        )
    }, indent=2)

# ── Tool 5: Generate mitigation plan ──
def generate_plan(summary: str, actions: str) -> str:
    """Generate a structured supply chain mitigation plan."""
    action_list = json.loads(actions)
    lines = ["# Supply Chain Mitigation Plan", ""]
    lines.append(f"**Date:** {datetime.utcnow().strftime('%Y-%m-%d')}")
    lines.append(f"**Summary:** {summary}")
    lines.append("")
    for i, action in enumerate(action_list, 1):
        lines.append(f"## Action {i}: {action.get('title', 'N/A')}")
        lines.append(f"- **Priority:** {action.get('priority', 'medium')}")
        lines.append(f"- **Timeline:** {action.get('timeline', 'TBD')}")
        lines.append(f"- **Details:** {action.get('details', '')}")
        lines.append("")
    return "\n".join(lines)
```

## 05. The Agent Loop

The supply chain agent uses an **iterative optimization loop**. Unlike the threat and weather agents that follow a mostly linear investigation path, this agent may cycle through the simulate\_rebalance tool multiple times, refining its proposed allocation until it finds an acceptable cost-risk trade-off.

**Typical execution flow:**

1.  **Monitor** — Agent calls `monitor_suppliers("semiconductors")` to get current health metrics for all semiconductor suppliers.
2.  **Detect** — Agent notices SUP-001 has degraded metrics, calls `detect_anomaly("SUP-001")` to confirm the lead time spike is statistically significant.
3.  **Search** — Agent calls `find_alternatives("8542", exclude_country="TWN")` to find semiconductor exporters outside Taiwan.
4.  **Simulate v1** — Agent proposes shifting 50% of SUP-001 volume to SUP-002 and SUP-004, calls `simulate_rebalance`.
5.  **Evaluate** — Simulation shows capacity warning for SUP-002. Agent adjusts allocation.
6.  **Simulate v2** — Agent tries a more conservative shift: 30% to SUP-002, 20% to SUP-004. Simulation shows acceptable capacity and a 12% cost increase.
7.  **Plan** — Agent calls `generate_plan` with the recommended strategy.

Steps 4-6 demonstrate the iterative nature — the agent learns from simulation results and refines its approach. This is impossible with a fixed pipeline.

## 06. Code Walkthrough

The agent orchestration loop with tool definitions and dispatcher.

```
from openai import OpenAI
import json

client = OpenAI()

# ── Tool Definitions ──
tools = [
    {
        "type": "function",
        "function": {
            "name": "monitor_suppliers",
            "description": "Get health metrics for suppliers, optionally filtered by product type (semiconductors, precision_parts).",
            "parameters": {
                "type": "object",
                "properties": {
                    "product": {"type": "string", "description": "Filter by product type"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "detect_anomaly",
            "description": "Check if a supplier's recent lead times show a statistically significant deviation from historical norms.",
            "parameters": {
                "type": "object",
                "properties": {
                    "supplier_id": {"type": "string"},
                    "threshold_stddev": {"type": "number", "description": "Z-score threshold (default 2.0)"}
                },
                "required": ["supplier_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "find_alternatives",
            "description": "Search UN Comtrade for top exporting countries of a product. Use HS code 8542 for semiconductors, 8466 for precision parts.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_code": {"type": "string", "description": "HS commodity code"},
                    "exclude_country": {"type": "string", "description": "ISO3 country code to exclude"}
                },
                "required": ["product_code"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "simulate_rebalance",
            "description": "Compare current vs proposed supplier volume allocation. Returns cost, lead time, reliability, and capacity metrics for both scenarios.",
            "parameters": {
                "type": "object",
                "properties": {
                    "current_allocation": {"type": "string", "description": "JSON: {supplier_id: volume_pct}"},
                    "proposed_changes": {"type": "string", "description": "JSON: {supplier_id: new_volume_pct}"}
                },
                "required": ["current_allocation", "proposed_changes"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_plan",
            "description": "Generate a structured mitigation plan document. Use as the final step.",
            "parameters": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string"},
                    "actions": {"type": "string", "description": "JSON array of {title, priority, timeline, details}"}
                },
                "required": ["summary", "actions"]
            }
        }
    }
]

# ── Tool Dispatcher ──
TOOL_MAP = {
    "monitor_suppliers": monitor_suppliers,
    "detect_anomaly": detect_anomaly,
    "find_alternatives": find_alternatives,
    "simulate_rebalance": simulate_rebalance,
    "generate_plan": generate_plan,
}

def dispatch_tool(name: str, args: dict) -> str:
    fn = TOOL_MAP.get(name)
    if not fn:
        return json.dumps({"error": f"Unknown tool: {name}"})
    try:
        return fn(**args)
    except Exception as e:
        return json.dumps({"error": f"{type(e).__name__}: {e}"})

# ── Agent ──
SYSTEM_PROMPT = """You are a senior supply chain analyst. Your job is to:
1. Monitor supplier health metrics and detect anomalies
2. When anomalies are found, investigate root causes and find alternatives
3. Simulate rebalancing strategies — try multiple allocations if the first has issues
4. Generate an actionable mitigation plan

Current supplier allocations for semiconductors:
- SUP-001 (TaiwanChip): 60%
- SUP-002 (ShenZhen): 25%
- SUP-004 (Korea Semi): 15%

Constraints: No single supplier should exceed 90% capacity utilization.
Cost increases up to 15% are acceptable for supply chain resilience.
Always explain trade-offs in your recommendations."""

def run_supply_chain_agent(query: str, max_steps: int = 15) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": query}
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
            args = json.loads(tc.function.arguments)
            print(f"  [{step+1}] {tc.function.name}({json.dumps(args)[:80]})")
            result = dispatch_tool(tc.function.name, args)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result
            })

    return "Agent reached max steps."

# ── Run ──
report = run_supply_chain_agent(
    "Our semiconductor lead times from Taiwan are increasing sharply. "
    "Assess the situation and recommend a rebalancing strategy."
)
print(report)
```

## 07. Key Takeaways

- Use z-score anomaly detection for lead time monitoring — it adapts to each supplier's normal variability rather than using a fixed threshold

- The iterative simulation pattern (propose, evaluate, refine) is more powerful than single-shot optimization because it handles constraints the agent discovers mid-analysis

- UN Comtrade API provides real trade flow data but has rate limits. Cache country-level export data daily since it only updates monthly

- Include capacity utilization in rebalancing simulations — shifting volume to a supplier already at 90% capacity creates a new single point of failure

- Set cost increase thresholds in the system prompt so the agent can make trade-off decisions autonomously within acceptable bounds

- The synthetic supplier database pattern is useful for development and testing. In production, replace with live ERP/procurement API calls

- Log all simulation scenarios the agent evaluated — this audit trail helps procurement teams understand and defend the recommendation

- Consider running the monitoring tools on a schedule and only invoking the full agent when anomalies are detected — this reduces LLM costs significantly
