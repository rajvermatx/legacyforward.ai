---
title: "Severe Weather Impact Agent"
slug: "weather-impact"
description: "Businesses lose billions annually to weather disruptions they could have anticipated. This agent monitors NOAA forecasts and NWS alerts in real-time, maps severe weather events to business assets (warehouses, routes, facilities), assesses operational risk severity, and decides whether to trigger aut"
section: "agentic-designs"
order: 2
badges:
  - "NWS API Integration"
  - "NOAA Storm Events"
  - "Asset Geomapping"
  - "Risk Severity Assessment"
  - "Conditional Alert Routing"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/agentic-designs/02-weather-impact.ipynb"
---

## 01. The Problem

The National Weather Service issues thousands of alerts daily — tornado warnings, flood watches, winter storm advisories, excessive heat warnings. For a logistics company with 200 warehouses and 5,000 daily truck routes, each alert is potentially relevant. But most are not. The challenge is rapidly determining which alerts affect which business assets and what operational response is needed.

Current approaches rely on weather monitoring dashboards that display raw alerts on maps. Operations teams must manually interpret each alert, look up which facilities are in the affected zone, assess the severity of impact on current operations, and decide whether to reroute trucks, close facilities, or activate contingency plans. This takes 30-60 minutes per significant weather event — far too slow when a tornado is 45 minutes away.

The fundamental challenge is **conditional multi-step reasoning**: the impact of a weather event depends on its type, severity, timing, the specific assets in the affected area, current operational status of those assets, and the availability of alternatives. A winter storm warning at 2 AM for a warehouse that is closed overnight requires no action. The same storm at 6 AM when trucks are loading requires immediate rerouting.

## 02. Why an Agent

**Why not rule-based alerts?** Rule-based systems can match weather zones to facility locations. But they cannot reason about cascading effects: if a flood closes the I-95 corridor, trucks routed through that area need alternatives, and the receiving warehouses need adjusted ETAs, and customer delivery promises need updating. Each downstream decision depends on the upstream assessment.

**Why not a single LLM call?** The agent needs to call the NWS API to get current alerts, then geolocate affected assets, then check each asset's operational status, then assess the severity based on timing and weather type. This is 4-8 API calls with conditional logic between them. A single LLM call cannot execute external API requests.

**The agent advantage:** The weather impact agent plans its investigation based on the alert type. For a tornado warning, it immediately checks all assets in the polygon and triggers urgent alerts. For a winter storm watch (lower urgency, more lead time), it fetches detailed forecasts, assesses road conditions over the next 24 hours, and recommends preemptive rerouting. The planning and execution are adaptive to the specific situation.

## Architecture Diagram

![Diagram 1](/diagrams/agentic-designs/weather-impact-1.svg)

## 03. Architecture

### Data Sources

NWS API (api.weather.gov) for real-time alerts and forecasts, NOAA Storm Events database for historical severity context, and an internal asset registry with geolocation data for all facilities, routes, and personnel.

### Agent Core

An OpenAI function-calling agent with a system prompt that instructs it to act as a weather operations analyst. The agent fetches alerts, maps them to assets, assesses severity, and decides on response actions based on configurable thresholds.

### Tool Registry

Five tools: fetch\_forecast (get NWS point forecast), get\_active\_alerts (query NWS alerts by state/zone), map\_assets\_in\_zone (geolocate business assets within an alert polygon), assess\_impact (score severity x exposure), and send\_alert (dispatch notifications via configured channels).

### Output

Risk-tiered action recommendations: RED (immediate action — close facility, halt routes), AMBER (preemptive action within 6 hours), GREEN (monitor, no action needed). Each recommendation includes affected assets, estimated impact duration, and suggested mitigations.

## 04. Tools & APIs

The NWS API is free, requires no API key, and returns GeoJSON. It has a courtesy request limit — include a `User-Agent` header with contact information. All tools include error handling and timeout protection.

```
import json, requests
from math import radians, cos, sin, asin, sqrt
from datetime import datetime

HEADERS = {"User-Agent": "(WeatherImpactAgent, ops@example.com)"}

# ── Tool 1: Fetch point forecast from NWS ──
def fetch_forecast(lat: float, lon: float) -> str:
    """Get the 7-day forecast for a specific lat/lon from api.weather.gov."""
    # Step 1: Get the forecast grid endpoint for this location
    point_url = f"https://api.weather.gov/points/{lat},{lon}"
    resp = requests.get(point_url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    forecast_url = resp.json()["properties"]["forecast"]

    # Step 2: Get the actual forecast
    resp = requests.get(forecast_url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    periods = resp.json()["properties"]["periods"][:4]

    result = []
    for p in periods:
        result.append({
            "name": p["name"],
            "temperature": f"{p['temperature']}{p['temperatureUnit']}",
            "wind": f"{p['windSpeed']} {p['windDirection']}",
            "forecast": p["detailedForecast"][:200]
        })
    return json.dumps(result, indent=2)

# ── Tool 2: Get active weather alerts ──
def get_active_alerts(state: str, severity: str = "Severe") -> str:
    """Query NWS for active weather alerts in a state."""
    url = "https://api.weather.gov/alerts/active"
    params = {"area": state, "severity": severity}
    resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
    resp.raise_for_status()
    features = resp.json().get("features", [])

    alerts = []
    for f in features[:10]:
        props = f["properties"]
        alerts.append({
            "event": props["event"],
            "severity": props["severity"],
            "urgency": props["urgency"],
            "headline": props["headline"],
            "areas": props.get("areaDesc", "")[:200],
            "onset": props.get("onset"),
            "expires": props.get("expires")
        })
    return json.dumps(alerts, indent=2)

# ── Tool 3: Map assets within an affected zone ──
def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two points."""
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    return 6371 * 2 * asin(sqrt(a))

def map_assets_in_zone(center_lat: float, center_lon: float, radius_km: float) -> str:
    """Find business assets within a radius of a weather event center."""
    assets = [
        {"name": "Warehouse-ATL", "lat": 33.749, "lon": -84.388, "type": "warehouse", "value": "high"},
        {"name": "Warehouse-DAL", "lat": 32.777, "lon": -96.797, "type": "warehouse", "value": "high"},
        {"name": "Route-I95-NE", "lat": 40.714, "lon": -74.006, "type": "route", "value": "critical"},
        {"name": "DC-East-1", "lat": 39.043, "lon": -77.487, "type": "datacenter", "value": "critical"},
        {"name": "Office-CHI", "lat": 41.878, "lon": -87.630, "type": "office", "value": "medium"},
        {"name": "Route-I10-South", "lat": 30.267, "lon": -97.743, "type": "route", "value": "high"},
    ]
    affected = []
    for a in assets:
        dist = haversine(center_lat, center_lon, a["lat"], a["lon"])
        if dist <= radius_km:
            a["distance_km"] = round(dist, 1)
            affected.append(a)
    return json.dumps(affected, indent=2)

# ── Tool 4: Assess operational impact ──
def assess_impact(event_type: str, severity: str, assets_json: str) -> str:
    """Score the operational impact of a weather event on affected assets."""
    assets = json.loads(assets_json)
    severity_scores = {"Extreme": 1.0, "Severe": 0.8, "Moderate": 0.5, "Minor": 0.2}
    value_scores = {"critical": 1.0, "high": 0.8, "medium": 0.5, "low": 0.2}
    sev_score = severity_scores.get(severity, 0.5)

    results = []
    for asset in assets:
        val_score = value_scores.get(asset.get("value"), 0.5)
        risk = round(sev_score * val_score, 2)
        level = "RED" if risk >= 0.7 else "AMBER" if risk >= 0.4 else "GREEN"
        results.append({
            "asset": asset["name"],
            "risk_score": risk,
            "level": level,
            "action": {
                "RED": "Immediate action: activate contingency plan",
                "AMBER": "Preemptive action: prepare alternatives within 6 hours",
                "GREEN": "Monitor: no immediate action required"
            }[level]
        })
    return json.dumps(results, indent=2)

# ── Tool 5: Send operational alert ──
def send_alert(channel: str, message: str, priority: str) -> str:
    """Send an alert through the specified channel (email, slack, sms)."""
    # In production: integrate with your notification service
    timestamp = datetime.utcnow().isoformat()
    return json.dumps({
        "status": "sent",
        "channel": channel,
        "priority": priority,
        "timestamp": timestamp,
        "message_preview": message[:100]
    })
```

## 05. The Agent Loop

The weather impact agent follows a **plan-then-execute** pattern rather than pure ReAct. The agent first assesses the urgency of the weather situation, then plans its investigation steps accordingly.

**High-urgency flow** (tornado warning, flash flood warning):

1.  **Get alerts** — Immediately fetch active severe alerts for the relevant state.
2.  **Map assets** — For each alert, find all assets within the affected zone using geolocation.
3.  **Assess impact** — Score each affected asset by risk level.
4.  **Send alerts** — Immediately dispatch RED-level notifications via SMS to facility managers.

**Lower-urgency flow** (winter storm watch, heat advisory):

1.  **Get alerts** — Fetch active alerts for the region.
2.  **Fetch forecast** — Get detailed forecasts for each affected asset location to understand timing and severity.
3.  **Map assets** — Identify exposed assets.
4.  **Assess impact** — Score risk with timing context.
5.  **Recommend actions** — Generate preemptive recommendations (reroute trucks before storm, pre-stage generators).

This adaptive planning is why an agent outperforms a fixed pipeline. The same system handles a tornado warning (60-second response needed) and a winter storm watch (24-hour planning window) with different strategies.

## 06. Code Walkthrough

The complete agent with tool definitions, dispatcher, and the main agent loop.

```
from openai import OpenAI
import json

client = OpenAI()

# ── Tool Definitions ──
tools = [
    {
        "type": "function",
        "function": {
            "name": "fetch_forecast",
            "description": "Get the NWS 7-day forecast for a specific latitude/longitude. Use to assess upcoming weather conditions at asset locations.",
            "parameters": {
                "type": "object",
                "properties": {
                    "lat": {"type": "number", "description": "Latitude"},
                    "lon": {"type": "number", "description": "Longitude"}
                },
                "required": ["lat", "lon"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_active_alerts",
            "description": "Get active NWS weather alerts for a US state. Returns event type, severity, urgency, and affected areas.",
            "parameters": {
                "type": "object",
                "properties": {
                    "state": {"type": "string", "description": "Two-letter state code, e.g. TX, FL, NY"},
                    "severity": {"type": "string", "enum": ["Extreme", "Severe", "Moderate", "Minor"]}
                },
                "required": ["state"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "map_assets_in_zone",
            "description": "Find all business assets within a given radius of a geographic point. Returns asset names, types, and criticality.",
            "parameters": {
                "type": "object",
                "properties": {
                    "center_lat": {"type": "number"},
                    "center_lon": {"type": "number"},
                    "radius_km": {"type": "number", "description": "Search radius in kilometers"}
                },
                "required": ["center_lat", "center_lon", "radius_km"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "assess_impact",
            "description": "Score the operational impact of a weather event on affected assets. Returns RED/AMBER/GREEN risk levels with recommended actions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "event_type": {"type": "string"},
                    "severity": {"type": "string"},
                    "assets_json": {"type": "string", "description": "JSON array of affected assets from map_assets_in_zone"}
                },
                "required": ["event_type", "severity", "assets_json"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_alert",
            "description": "Send an operational alert via the specified channel. Use for RED and AMBER risk levels only.",
            "parameters": {
                "type": "object",
                "properties": {
                    "channel": {"type": "string", "enum": ["email", "slack", "sms"]},
                    "message": {"type": "string"},
                    "priority": {"type": "string", "enum": ["critical", "high", "medium"]}
                },
                "required": ["channel", "message", "priority"]
            }
        }
    }
]

# ── Tool Dispatcher ──
TOOL_MAP = {
    "fetch_forecast": fetch_forecast,
    "get_active_alerts": get_active_alerts,
    "map_assets_in_zone": map_assets_in_zone,
    "assess_impact": assess_impact,
    "send_alert": send_alert,
}

def dispatch_tool(name: str, args: dict) -> str:
    fn = TOOL_MAP.get(name)
    if not fn:
        return json.dumps({"error": f"Unknown tool: {name}"})
    try:
        return fn(**args)
    except Exception as e:
        return json.dumps({"error": f"{type(e).__name__}: {e}"})

# ── Agent Loop ──
SYSTEM_PROMPT = """You are a weather operations analyst for a logistics company.
Your job is to:
1. Check active weather alerts for states where we have assets
2. Map affected assets using geolocation
3. Assess operational impact severity
4. Send alerts for RED and AMBER risks, recommend actions for all levels

Our assets are in: GA (Atlanta warehouse), TX (Dallas warehouse, I-10 route),
NY (I-95 route), VA (datacenter), IL (Chicago office).

For Extreme/Severe events: prioritize speed, send SMS alerts immediately.
For Moderate events: analyze thoroughly, send email recommendations.
Always explain your reasoning before taking action."""

def run_weather_agent(query: str, max_steps: int = 12) -> str:
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
report = run_weather_agent(
    "Check for severe weather threats across all our operational states. "
    "Assess impact on our assets and send alerts if needed."
)
print(report)
```

## 07. Key Takeaways

- The NWS API is free and requires no API key — just a descriptive User-Agent header with your contact email

- Use the haversine formula for quick distance calculations between assets and weather event centers — it is fast and accurate enough for regional assessments

- Separate urgency tiers in the system prompt so the agent adapts its strategy: immediate response for Extreme events, planned response for Moderate

- Cache NWS API responses for 5-10 minutes to avoid hitting rate limits during multi-state scans

- The send\_alert tool should have a confirmation step for RED-level alerts in production — require human approval before triggering facility shutdowns

- Store agent investigation logs with timestamps for post-incident reviews: what did the agent check, when, and what action did it take

- Test with historical NOAA Storm Events data to validate the agent's risk assessments against known outcomes

- Consider running the agent on a cron schedule (every 15 minutes) rather than on-demand for continuous monitoring
