---
title: "Capstone 4: AI-Powered Sprint Assistant"
slug: "capstone-04"
description: "Sprint ceremonies consume hours every week — planning poker drags on, standup notes get lost, retrospective action items go untracked, and cross-team dependencies slip through the cracks. In this capstone, you will build an assistant that automates the tedious parts of sprint management so teams can"
section: "llm-ba-qa"
order: 17
part: "Part 05 Capstones"
---

Part 5 — Capstones

# Capstone 4: AI-Powered Sprint Assistant

Sprint ceremonies consume hours every week — planning poker drags on, standup notes get lost, retrospective action items go untracked, and cross-team dependencies slip through the cracks. In this capstone, you will build an assistant that automates the tedious parts of sprint management so teams can focus on the conversations that matter.

Building time: ~2 hours Chapters used: 6, 8, 11, 14

### What You Will Build

-   A sprint planner that analyzes the backlog, estimates story complexity, and recommends sprint scope based on team velocity
-   A standup summarizer that parses daily updates and flags blockers, risks, and cross-team dependencies
-   A retrospective analyzer that clusters feedback themes, tracks action item completion, and identifies recurring patterns
-   A dependency tracker that maps inter-team dependencies and alerts when coupled stories fall out of sync
-   A sprint health dashboard that synthesizes all signals into an at-a-glance status report

![Diagram 1](/diagrams/llm-ba-qa/capstone-04-1.svg)

Figure C4.1 — Hub-and-spoke architecture. The Sprint Assistant connects five specialized modules through a shared context store.

## Architecture Overview

The assistant is organized around the sprint lifecycle. Each ceremony has a dedicated module, and a central sprint context store connects them — so the retrospective analyzer knows what was planned, the planner knows what went wrong last sprint, and the standup summarizer knows what was committed.

**Data models:**

```python
from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
from datetime import date

class StoryStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"
    BLOCKED = "blocked"

class RiskLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class UserStory(BaseModel):
    id: str
    title: str
    description: str
    acceptance_criteria: list[str] = Field(default_factory=list)
    story_points: Optional[int] = None
    estimated_points: Optional[int] = Field(
        default=None, description="LLM-estimated story points"
    )
    status: StoryStatus = StoryStatus.TODO
    assignee: Optional[str] = None
    dependencies: list[str] = Field(default_factory=list)
    team: str = "default"

class StandupEntry(BaseModel):
    team_member: str
    date: str
    yesterday: str
    today: str
    blockers: list[str] = Field(default_factory=list)

class RetroFeedback(BaseModel):
    category: str = Field(description="went_well, to_improve, or action_item")
    text: str
    votes: int = 0
    author: Optional[str] = None

class SprintContext(BaseModel):
    sprint_number: int
    start_date: str
    end_date: str
    team_velocity: float = Field(description="Average points completed per sprint")
    stories: list[UserStory] = Field(default_factory=list)
    standup_entries: list[StandupEntry] = Field(default_factory=list)
    retro_feedback: list[RetroFeedback] = Field(default_factory=list)

class Dependency(BaseModel):
    from_story: str
    to_story: str
    from_team: str
    to_team: str
    status: str = Field(description="aligned, at_risk, or blocked")
    notes: str = ""
```

## Step 1: Setup and Data Ingestion

Create sample sprint data to work with. In a real deployment, this would come from Jira, Azure DevOps, or a similar tool:

Create sample sprint data with three datasets: a **backlog** of 6 user stories spanning Platform, Frontend, and Backend teams (with cross-team dependencies like US-101 depending on US-105), **standup entries** from 5 team members (with 3 having active blockers like "waiting for security team approval" and "Redis cluster not available"), and **retrospective feedback** with 10 items across went-well, to-improve, and action-item categories (with vote counts to show priority). In production, this data would come from Jira, Azure DevOps, or Slack integrations.

## Step 2: Core Processing Pipeline — Sprint Planning

The sprint planner analyzes the backlog, estimates story complexity using the LLM, identifies dependencies, and recommends which stories fit into the upcoming sprint based on team velocity.

```python
"""modules/planner.py — Sprint planning with LLM-powered estimation."""
import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

ESTIMATION_PROMPT = """You are an experienced scrum master estimating user stories.

For each story below, estimate the story points using the Fibonacci scale:
1, 2, 3, 5, 8, 13.

Consider:
- Technical complexity
- Number of acceptance criteria
- Integration points and dependencies
- Uncertainty and risk

Stories:
{stories_json}

Return a JSON array with story ID and estimated points:
[{{"id": "US-101", "estimated_points": 5, "rationale": "brief reason"}}]

Return ONLY the JSON array."""


def estimate_stories(stories: list[dict]) -> list[dict]:
    """Use an LLM to estimate story points for unestimated stories."""
    unestimated = [s for s in stories if s.get("story_points") is None]
    if not unestimated:
        print("  All stories already estimated.")
        return stories

    # Prepare stories for the LLM (remove noisy fields)
    clean = [
        {
            "id": s["id"],
            "title": s["title"],
            "description": s["description"],
            "acceptance_criteria": s.get("acceptance_criteria", []),
            "dependencies": s.get("dependencies", []),
        }
        for s in unestimated
    ]

    prompt = ESTIMATION_PROMPT.format(stories_json=json.dumps(clean, indent=2))

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a scrum master. "
             "Respond only with a JSON array."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=800,
    )

    raw = response.choices[0].message.content.strip()
    try:
        estimates = json.loads(raw)
    except json.JSONDecodeError:
        import re
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        estimates = json.loads(match.group()) if match else []

    # Apply estimates
    est_map = {e["id"]: e for e in estimates}
    for story in stories:
        if story["id"] in est_map:
            story["estimated_points"] = est_map[story["id"]]["estimated_points"]
            story["estimation_rationale"] = est_map[story["id"]].get("rationale", "")
            print(f"  {story['id']}: {story['estimated_points']} points "
                  f"— {story.get('estimation_rationale', '')}")

    return stories


def recommend_sprint_scope(
    stories: list[dict],
    velocity: float,
    buffer: float = 0.85,
) -> dict:
    """Recommend which stories to include in the sprint."""
    capacity = int(velocity * buffer)  # Leave 15% buffer for interruptions
    print(f"\n  Team velocity: {velocity} | Sprint capacity (with buffer): {capacity}")

    # Sort by dependency order, then by value (fewer dependencies first)
    def sort_key(s):
        dep_count = len(s.get("dependencies", []))
        points = s.get("estimated_points") or s.get("story_points") or 5
        return (dep_count, -points)

    sorted_stories = sorted(stories, key=sort_key)

    included = []
    deferred = []
    total_points = 0

    for story in sorted_stories:
        points = story.get("estimated_points") or story.get("story_points") or 5

        # Check if dependencies are included
        deps = story.get("dependencies", [])
        deps_met = all(
            any(i["id"] == dep for i in included) or dep not in [s["id"] for s in stories]
            for dep in deps
        )

        if total_points + points <= capacity and deps_met:
            included.append(story)
            total_points += points
        else:
            reason = "capacity exceeded" if total_points + points > capacity else "unmet dependencies"
            deferred.append({**story, "defer_reason": reason})

    return {
        "included": included,
        "deferred": deferred,
        "total_points": total_points,
        "capacity": capacity,
        "utilization": round(total_points / capacity * 100, 1) if capacity else 0,
    }
```

The standup summarizer parses daily updates, detects blockers and risks, and produces a concise team status:

The standup analyzer sends all daily entries to the LLM in a single call, asking it to produce a structured analysis with five components: an executive summary (2-3 sentences), active blockers with impact ratings and suggested actions, identified risks with affected team members, cross-team coordination flags, and progress concerns for team members who may be stuck. The LLM returns JSON that the system parses and displays with severity indicators.

## Step 3: Output Generation — Retrospective Analysis and Sprint Report

The retrospective analyzer clusters feedback themes, compares against previous sprints to spot recurring issues, and tracks action item completion:

```python
"""modules/retro.py — Analyze retrospective feedback for themes and patterns."""
import json
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

RETRO_PROMPT = """Analyze this sprint retrospective feedback.

Feedback items:
{feedback_json}

Previous sprint action items (check if resolved):
{previous_actions}

Provide a JSON analysis:
1. "themes": Array of identified themes, each with:
   - "theme": short theme name
   - "category": "went_well" or "to_improve"
   - "count": how many feedback items relate to this theme
   - "summary": 1-sentence synthesis
2. "action_items": Array of recommended actions:
   - "action": specific, actionable task
   - "owner_type": "team_lead", "scrum_master", "developer", "ops"
   - "priority": "high", "medium", "low"
   - "addresses_theme": which theme this addresses
3. "recurring_patterns": Array of issues that appeared in previous sprints too
4. "team_morale_signal": "positive", "neutral", or "negative" with brief rationale

Return ONLY the JSON object."""


def analyze_retrospective(
    feedback: list[dict],
    previous_actions: list[str] = None,
) -> dict:
    """Analyze retro feedback for themes, patterns, and action items."""
    if previous_actions is None:
        previous_actions = []

    prompt = RETRO_PROMPT.format(
        feedback_json=json.dumps(feedback, indent=2),
        previous_actions=json.dumps(previous_actions) if previous_actions else "None available",
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an agile coach. Provide insightful, "
             "actionable retrospective analysis. Return only JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=1200,
    )

    raw = response.choices[0].message.content.strip()
    try:
        analysis = json.loads(raw)
    except json.JSONDecodeError:
        import re
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        analysis = json.loads(match.group()) if match else {}

    # Print theme summary
    if analysis.get("themes"):
        print(f"  Identified {len(analysis['themes'])} themes:")
        for t in analysis["themes"]:
            print(f"    [{t.get('category', '?')}] {t.get('theme', '')}: "
                  f"{t.get('summary', '')}")

    morale = analysis.get("team_morale_signal", "unknown")
    print(f"  Team morale signal: {morale}")

    return analysis
```

The dependency tracker maps relationships between stories across teams and alerts on alignment risks:

The dependency tracker builds a map from each story's `dependencies` field, linking the dependent story to its dependency and recording both teams. It determines alignment status automatically: if the dependency is "done," status is "aligned"; if it is "blocked," status is "blocked"; if it is still "todo" while the dependent story is already "in progress," status is "at risk." An LLM analysis call then assesses overall dependency risk, identifies specific risks, recommends actions, and lists cross-team conversations that need to happen.

The sprint health dashboard brings all signals together into one report:

The dashboard generator produces a comprehensive sprint health report combining all module outputs: a **planning summary** table (stories included/deferred, points, utilization), a **standup analysis** section with blocker and risk tables, a **cross-team dependencies** section with status indicators, and **retrospective insights** with themed feedback and action items. The report is written as markdown and also exported as JSON for programmatic consumption.

## Step 4: Validation and Quality

The validation step checks the sprint plan for common mistakes — overcommitment, unresolved dependencies, and missing estimation data:

Sprint plan validation checks five common mistakes: **overcommitment** (utilization above 100%), **high utilization** (above 95%, leaving no buffer), **undercommitment** (below 60%, wasting capacity), **missing estimates** (stories without point values in the sprint), **large stories** (8+ points that risk not completing), and **deferred dependencies** (included stories that depend on deferred stories). Each issue includes a severity level and a specific recommendation for how to fix it.

The main orchestrator:

```python
"""main.py — Orchestrate the AI-powered sprint assistant."""
from data.sample_sprint import BACKLOG, STANDUP_ENTRIES, RETRO_FEEDBACK
from modules.planner import estimate_stories, recommend_sprint_scope
from modules.standup import analyze_standup
from modules.retro import analyze_retrospective
from modules.dependencies import map_dependencies, analyze_dependency_risks
from modules.validate_sprint import validate_sprint_plan
from modules.dashboard import generate_dashboard


def run_sprint_assistant(
    sprint_number: int = 12,
    velocity: float = 25,
):
    """Run the full sprint assistant pipeline."""
    print("=" * 60)
    print(f"AI-Powered Sprint Assistant — Sprint {sprint_number}")
    print("=" * 60)

    # Stage 1: Sprint Planning
    print("\n[1/5] Estimating stories...")
    stories = estimate_stories(BACKLOG)

    print("\n[2/5] Recommending sprint scope...")
    plan = recommend_sprint_scope(stories, velocity=velocity)

    print(f"\n  Included: {len(plan['included'])} stories "
          f"({plan['total_points']} points)")
    print(f"  Deferred: {len(plan['deferred'])} stories")
    print(f"  Utilization: {plan['utilization']}%")

    # Stage 2: Standup Analysis
    print("\n[3/5] Analyzing standups...")
    standup_analysis = analyze_standup(STANDUP_ENTRIES)

    # Stage 3: Retrospective Analysis
    print("\n[4/5] Analyzing retrospective...")
    previous_actions = [
        "Improve code review turnaround time",
        "Set up automated deployment pipeline",
    ]
    retro_analysis = analyze_retrospective(RETRO_FEEDBACK, previous_actions)

    # Stage 4: Dependency Analysis
    print("\n[5/5] Mapping dependencies...")
    dependencies = map_dependencies(stories)
    dependency_analysis = analyze_dependency_risks(dependencies, stories)

    for dep in dependencies:
        status_label = dep["status"].upper()
        print(f"  {dep['from_story']} -> {dep['to_story']} "
              f"({dep['from_team']}/{dep['to_team']}): {status_label}")

    # Validation
    print("\nValidating sprint plan...")
    issues = validate_sprint_plan(plan, velocity)
    if issues:
        for iss in issues:
            print(f"  [{iss['severity']}] {iss['message']}")
    else:
        print("  No issues found.")

    # Generate dashboard
    print("\nGenerating sprint dashboard...")
    report_path = generate_dashboard(
        sprint_number=sprint_number,
        plan=plan,
        standup_analysis=standup_analysis,
        retro_analysis=retro_analysis,
        dependency_analysis=dependency_analysis,
        dependencies=dependencies,
    )

    print("\n" + "=" * 60)
    print("Sprint Assistant Complete!")
    print("=" * 60)

    return report_path


if __name__ == "__main__":
    run_sprint_assistant()
```

## Extensions and Portfolio Tips

-   **Add Slack integration.** Post the daily standup summary and blocker alerts to a Slack channel using webhooks. Send dependency risk alerts as DMs to the relevant team leads. This makes the assistant useful in real time, not just as a batch report.
-   **Build a velocity forecaster.** Use historical sprint data to predict future velocity using both simple moving average and LLM-based analysis of team composition changes, holidays, and technical debt paydown. Show a confidence interval, not just a point estimate.
-   **Integrate with Jira or Azure DevOps.** Pull backlog items, sprint data, and standup notes directly from your project management tool. Push the sprint plan back as a sprint in Jira with stories pre-assigned. This eliminates manual data entry entirely.
-   **Add a meeting prep generator.** Before each ceremony, generate a focused agenda based on current sprint data. For planning: show the recommended scope and dependency warnings. For standup: highlight yesterday's blockers and today's risks. For retro: surface the themes and compare against last sprint's action items.
-   **Build a sprint comparison view.** Compare metrics across the last 5-10 sprints: velocity trend, blocker frequency, action item completion rate, team morale signal. This turns the assistant from a single-sprint tool into a continuous improvement engine.
-   **Add natural language queries.** Let users ask questions like "Which stories are at risk?" or "What blocked us most last sprint?" and have the LLM answer from the sprint context store. This turns the data into a conversational interface.

**Portfolio presentation tip:** Record a 3-minute video walkthrough. Show the tool running against sample data, then show the generated dashboard. Emphasize the cross-team dependency detection — this is the feature that gets the most attention from engineering managers, because it solves a problem that is painful, expensive, and almost never automated.

## Summary

-   You built a comprehensive sprint assistant that automates the analytical work behind planning, standups, retrospectives, and dependency tracking.
-   LLM-powered story estimation provides a useful starting point that teams can adjust, saving 30-60 minutes of planning poker per sprint.
-   The standup analyzer surfaces blockers and risks that might otherwise go unnoticed until they become emergencies.
-   Retrospective theme analysis with historical comparison turns scattered feedback into actionable patterns.
-   Cross-team dependency mapping catches alignment risks early — the kind of problem that traditionally only surfaces during integration testing.
-   The sprint health dashboard gives stakeholders a single-page view of sprint status, replacing multiple manual reports.