---
title: "Chapter 7: Stakeholder Communication and Reporting"
slug: "stakeholder-communication"
description: "The best analysis in the world is worthless if it cannot be communicated effectively. In this chapter you will learn how to use LLMs to generate executive summaries, translate between technical and business language, automate status reports, extract action items from meetings, draft presentation dec"
section: "llm-ba-qa"
order: 7
part: "Part 02 Business Analysis"
---

Part 2 — Business Analysis with LLMs

# Chapter 8: Stakeholder Communication and Reporting

The best analysis in the world is worthless if it cannot be communicated effectively. In this chapter you will learn how to use LLMs to generate executive summaries, translate between technical and business language, automate status reports, extract action items from meetings, draft presentation decks, and adapt content for different audiences — all while maintaining accuracy and your professional voice.

Reading time: ~25 min Project: Report Generator

### What You Will Learn

-   Why communication is the BA's most critical skill and how LLMs augment it
-   Generating executive summaries that highlight decisions, risks, and actions
-   Translating between technical and business terminology bidirectionally
-   Automating weekly and monthly status reports from project data
-   Extracting action items and decisions from meeting transcripts
-   Drafting structured presentation outlines for different audiences
-   Adapting a single piece of content for executive, technical, and operational audiences

## 8.1 The Communication Challenge

Business Analysts sit at the intersection of business and technology, and their primary deliverable is not a document — it is *shared understanding*. Every day, BAs translate between stakeholders who speak different languages: executives care about revenue impact and strategic alignment; developers care about APIs, data models, and edge cases; compliance officers care about regulatory adherence and audit trails.

### The Cost of Miscommunication

| Communication Failure | Typical Impact | Frequency |
| --- | --- | --- |
| Status report misrepresents risk level | Delayed escalation, budget overrun | Common |
| Technical detail overwhelms executive audience | Decision paralysis, lost sponsorship | Very common |
| Meeting action items lost or ambiguous | Repeated meetings, stalled progress | Extremely common |
| Requirements doc too vague for developers | Implementation deviates from intent | Common |
| Presentation lacks business case framing | Initiative not funded despite technical merit | Occasional |

### Where LLMs Fit In

LLMs excel at three communication tasks that consume disproportionate BA time:

1.  **First-draft generation:** Producing an 80-percent-ready draft of a report, summary, or presentation in seconds.
2.  **Tone and audience adaptation:** Rewriting the same content for different audiences without losing accuracy.
3.  **Information extraction:** Pulling structured data (action items, decisions, risks) from unstructured text (transcripts, email threads).

> **The 80/20 Rule:** LLMs generate the first 80 percent of a communication artifact in minutes. The remaining 20 percent — verifying facts, adding organisational context, adjusting political nuance — requires human expertise and takes the same time it always did. The net result is a 60 to 70 percent time saving on communication tasks.

## 8.2 Executive Summary Generation

An executive summary distils a complex document into its essential elements: the situation, the findings, the recommended action, and the associated risks. Executives typically need to make decisions in minutes, not hours, so the summary must front-load the most important information.

### The Pyramid Principle

Barbara Minto's Pyramid Principle is the gold standard for executive communication: start with the conclusion, then provide the supporting arguments, then the details. LLMs can be instructed to follow this structure explicitly.

### Executive Summary Approach

The executive summary prompt enforces the Pyramid Principle structure with six sections: a one-sentence headline stating the key conclusion, a situation paragraph providing context, three to five key findings (each with a bolded finding and one sentence of evidence), a recommendation with a clear call to action, two to three risk bullet points (covering both risks of action and inaction), and three to five numbered next steps with owners and dates. The prompt constrains the output to 400 words maximum, prohibits jargon and unexpanded acronyms, requires concrete numbers from the source, mandates active voice, and instructs the model to explicitly note any missing information rather than fabricating data.

### Batch Summarisation

When preparing for a steering committee, summarise multiple documents in two passes. First, generate an individual executive summary for each document using the prompt above. Second, pass all the individual summaries to a consolidation prompt that produces a single briefing with five sections: overall status (one paragraph), cross-cutting themes and risks, per-project highlights (one bullet each), decisions required (numbered list), and a combined timeline of next steps. This two-pass approach ensures each document gets thorough individual attention while the final output presents a coherent, cross-project view.

> **Tip:** Always review the executive summary for *hallucinated statistics*. LLMs sometimes fabricate specific numbers (e.g., "a 23% improvement") when the source document does not contain them. Cross-check every number against the original.

## 8.3 Technical-to-Business Translation

One of the BA's core skills is translating between technical and business language. LLMs can do this bidirectionally — converting a developer's technical description into business-friendly language, or converting a business request into a technical specification.

### Bidirectional Translation

The translation prompt works in both directions — technical-to-business and business-to-technical — with direction-specific guidelines. When translating **technical to business**, the rules are: replace API names with capability descriptions, replace performance metrics with business impact statements, replace system component names with functional descriptions, use "the system" instead of specific module names, and frame everything in terms of user outcomes and business value. When translating **business to technical**, the rules shift: identify implicit technical requirements, replace vague terms with specific measurable criteria, map business capabilities to system components where possible, add notes about likely technical constraints, and use standard technical vocabulary consistently.

In both directions, the model must preserve all factual content, maintain the same logical structure, and include a brief parenthetical explanation for any concept that cannot be simplified without losing accuracy.

### Translation Examples

| Technical Version | Business Version |
| --- | --- |
| "The REST API endpoint returns a 429 status code when rate limits are exceeded, causing the batch ETL pipeline to fail." | "When too many data requests are sent at once, the data import process stops, which delays report availability." |
| "We need to implement connection pooling and add a circuit breaker pattern to the payment gateway integration." | "We need to make the payment system more resilient so it recovers automatically from temporary outages instead of failing completely." |
| "The database query plan shows a full table scan on the 4.2M-row transactions table, causing P99 latency to exceed 8 seconds." | "Transaction lookups are slow for about 1% of users because the system searches through all records instead of using an index. This affects users during peak hours." |

> **Warning:** Translation can introduce subtle inaccuracies. "The API returns a 429" is precise; "too many requests" is an approximation. Always have the original author review the translation to ensure no critical nuance is lost.

## 8.4 Status Report Automation

Status reports are necessary but time-consuming. Most BAs spend 2 to 4 hours per week compiling data from Jira, Confluence, email, and Slack into a coherent weekly report. LLMs can automate the narrative portions while you provide the raw data.

### Data-Driven Status Report

The status report prompt accepts raw project metrics — sprint velocity versus target, stories completed, stories in progress, stories blocked, bugs found and resolved, current blockers, key accomplishments, risks, and upcoming milestones — and generates a structured report with eight sections: a RAG status indicator with justification, the reporting period, an accomplishments narrative, an in-progress summary, blockers and risks, a metrics table, a next-period plan, and any decisions needed from leadership. The prompt explicitly instructs the model not to fabricate information beyond what the raw data provides.

### Pulling Data from Jira

To fully automate the process, connect the report generator to your project management tool. A Jira data collector uses JQL queries to pull sprint data: completed stories (status = Done), stories in progress, blocked items, and bugs created or resolved in the past week. It calculates velocity from completed story points and assembles all the raw data fields into the format expected by the status report prompt. When scheduled as a weekly job (for example, every Friday afternoon), this integration reduces status report creation from a multi-hour manual effort to a five-minute review-and-send task.

> **Automation Idea:** Schedule this script to run every Friday afternoon using a cron job or CI/CD pipeline. It pulls data from Jira, generates the status report, posts it to Confluence, and sends a Slack notification. Total human effort: a 5-minute review and send.

## 8.5 Meeting Notes and Action Items

Meetings generate valuable decisions and commitments, but these are routinely lost because notes are incomplete or action items are not tracked. LLMs can process meeting transcripts (from tools like Otter.ai, Fireflies, or Microsoft Teams recordings) and produce structured output.

### Meeting Transcript Processor

The meeting transcript prompt extracts structured data from raw transcripts (from tools like Otter.ai, Fireflies, or Microsoft Teams recordings). The output includes an inferred meeting title, extracted attendees, a two-to-three sentence summary, topics discussed (each with what was discussed, any decision made, and open questions), action items (each with the specific task, owner, deadline, priority, and context), risks raised, parking lot items deferred to future meetings, and any scheduled follow-up. The prompt enforces strict rules: only include action items that were explicitly agreed upon, mark unclear owners as "TBD," distinguish between finalised decisions and unresolved questions, and capture intent rather than verbatim quotes.

### Action Item Tracker

The action item tracker accumulates items across multiple meetings, tagging each with its source meeting and date. It provides several queries: retrieving all overdue items (those past their deadline and still open), filtering by owner, and generating polite reminder emails for team members with outstanding tasks. The reminder email generator uses the LLM to produce a professional, friendly message that includes the original deadline and source meeting for each overdue item. When integrated with Jira or another task management tool, each action item can automatically become a tracked task, closing the loop between meetings and actual work.

> **Tip:** Integrate the action item tracker with your project management tool. Create a Jira task for each action item automatically, with the owner, deadline, and meeting context pre-filled. This closes the loop between meetings and actual task tracking.

## 8.6 Presentation Deck Drafting

BAs frequently create presentations for steering committees, sprint reviews, and stakeholder demos. While LLMs cannot generate visual slides directly, they can produce structured outlines with speaker notes that dramatically accelerate deck creation.

### Presentation Outline Generator

The presentation outline prompt accepts four contextual inputs: the target audience, the purpose, the time slot (in minutes), and the key message. It generates a structured JSON outline where each slide has a number, a headline (maximum eight words), a layout type (Title, Bullets, Table, Chart, Quote, Image+Text, or Comparison), the main content, two to three sentences of speaker notes, and a visual suggestion. The prompt enforces good presentation hygiene: start with a hook (not an agenda slide), follow the situation-complication-resolution structure, limit each slide to five bullets maximum, include a "So What?" slide before closing, and end with a clear call to action. The total slide count targets approximately two minutes per slide.

### From Outline to Slides

The JSON outline can be converted to actual slide files using Python libraries such as python-pptx (for Microsoft PowerPoint) or the Google Slides API. Each slide in the outline maps to a slide in the output file, with the title, content, and speaker notes populated automatically. For web-based presentations, the same JSON structure can generate Reveal.js HTML slides. The key advantage of the JSON intermediate format is flexibility — a single generation step supports multiple output formats without re-prompting the LLM.

> **Advanced Approach:** For teams using Google Slides, you can use the Google Slides API to create slides programmatically from the outline JSON. The python-pptx library shown above works for Microsoft PowerPoint. For web-based presentations, generate Reveal.js HTML slides directly.

## 8.7 Multi-Audience Adaptation

The ultimate communication skill is taking a single piece of analysis and presenting it effectively to completely different audiences. LLMs make this scalable by allowing you to generate audience-specific versions from a single source of truth.

### Audience Profile Framework

| Audience | Cares About | Tone | Detail Level | Preferred Format |
| --- | --- | --- | --- | --- |
| C-Suite | ROI, risk, strategic alignment | Confident, concise | High-level only | 1-page brief, 5-slide deck |
| Middle Management | Timeline, resources, dependencies | Professional, balanced | Medium | Status report, Gantt chart |
| Development Team | Technical requirements, architecture, APIs | Direct, technical | High detail | Technical spec, ADRs |
| End Users | What changes, when, how to use | Friendly, supportive | Step-by-step | FAQ, training guide |
| Compliance/Legal | Regulatory adherence, audit trails | Precise, formal | Very high detail | Formal report with references |

### Multi-Audience Adapter

![Diagram 1](/diagrams/llm-ba-qa/stakeholder-communication-1.svg)

Figure 8-1. Multi-Audience Adaptation — a single technical report is transformed into audience-specific formats, each tailored in tone, detail level, and structure.

Each audience profile defines three elements: a label (such as "C-Suite Executive"), generation guidelines (word limits, content focus, and formatting rules), and a target format (for example, "One-page executive brief" or "Technical specification"). The adaptation prompt applies these profile-specific rules to the source content, producing a version tailored in tone, detail level, and structure while preserving factual accuracy. To generate all versions at once, iterate through the defined profiles and call the adaptation function for each, producing a complete communication package from a single source of truth.

> **Warning:** When generating multiple audience versions from the same source, there is a risk of *information drift* — where the adapted versions subtly diverge in facts or emphasis. After generating all versions, use a verification prompt that compares them for factual consistency. Any discrepancies should be resolved by referring back to the original source.

### Verification Step

After generating all audience versions, run a consistency verification step. This uses a separate LLM call (at temperature 0.0 for determinism) that acts as a fact-checker: it compares each adapted version against the original source and flags any factual inconsistencies. For each discrepancy found, it reports which audience version contains the issue, the inconsistent claim, what the original source actually says, and the severity (High, Medium, or Low). Any discrepancies should be resolved by referring back to the original source before distributing the adapted versions.

## Project: Report Generator

Build a multi-format report generator that takes raw project data and meeting transcripts and produces a complete communication package: executive summary, status report, meeting minutes with action items, and a presentation outline — each adapted for the appropriate audience.

### Architecture

![Diagram 2](/diagrams/llm-ba-qa/stakeholder-communication-2.svg)

Figure 8-2. Report Generation Workflow — data from multiple sources flows through aggregation, LLM summarisation, and template application to produce multi-format outputs tailored to each audience.

### Main Pipeline

The main pipeline script accepts three inputs: a JSON file with project metrics, optional meeting transcript files, and a list of target audiences. It runs in five steps: (1) generate a status report from the project data, (2) process any meeting transcripts and accumulate action items, (3) adapt the status report for each target audience, (4) generate a presentation outline in JSON format, and (5) convert the outline to a PowerPoint file. All outputs are written to a specified directory: the base status report, audience-specific versions, the presentation outline, the PowerPoint file, and a JSON file of accumulated action items from all processed meetings.

### Testing the Pipeline

1.  Create a sample `project_data.json` with realistic sprint metrics.
2.  Find or create a sample meeting transcript (even 2 to 3 paragraphs of simulated conversation work).
3.  Run the pipeline and review each output for accuracy and appropriateness.
4.  Compare the executive and developer versions of the status report — verify they contain the same facts but different framing.
5.  Open the PowerPoint file and verify the slide structure matches the outline.

## Summary

-   **Communication is the BA's highest-leverage skill,** and LLMs provide an 80/20 acceleration — generating first drafts in seconds while the BA adds the crucial 20 percent of verification, context, and nuance.
-   **Executive summaries** should follow the Pyramid Principle: conclusion first, then evidence, then detail. LLMs can generate this structure reliably.
-   **Technical-to-business translation** is bidirectional and requires careful review to ensure precision is not lost during simplification.
-   **Status report automation** combines structured project data with LLM narrative generation, potentially saving 2 to 4 hours per week.
-   **Meeting transcript processing** extracts decisions, action items, and risks — closing the gap between what is discussed and what is tracked.
-   **Presentation outlining** with structured JSON output can feed directly into PowerPoint or Google Slides generation.
-   **Multi-audience adaptation** from a single source ensures consistency while tailoring tone, detail level, and format for each stakeholder group. Always verify consistency across versions.

### Exercises

#### Conceptual

1.  A project is behind schedule but the team is confident they can recover. Write two opening paragraphs for the status report: one that would alarm the steering committee unnecessarily, and one that communicates the situation honestly without causing panic. Explain the differences.
2.  Describe three situations where an LLM-generated executive summary could be actively harmful if sent without human review.
3.  Why is the "verification step" for multi-audience adaptation important? Give an example of information drift that could cause a real problem.

#### Coding

1.  Extend the `JiraDataCollector` to include a trend analysis — compare this sprint's metrics to the previous three sprints and include the trend in the status report.
2.  Write a function that takes meeting notes from three consecutive meetings and generates a "progress tracker" showing how action items evolved across meetings (created, progressed, completed, or stalled).
3.  Build a "communication style detector" that analyses a stakeholder's previous emails and generates a profile of their preferred communication style (formal/informal, detail level, preferred length). Use this profile to personalise LLM-generated communications.

#### Design

1.  Design a "Communication Hub" web application where BAs can paste or upload content, select target audiences, and receive adapted versions with a consistency verification report. Sketch the UI and list the API endpoints.
2.  Propose a system that learns from BA feedback on LLM-generated communications over time, building an organisation-specific style guide that improves output quality. How would you collect feedback and integrate it into prompts?