---
title: "Quick Reference"
slug: "quick-reference"
description: "The LegacyForward.ai framework at a glance — summary tables for Signal Capture, Grounded Delivery, Legacy Coexistence, and Core Principles."
section: "legacyforward-guide"
order: 8
part: "The Complete Framework"
badges: ["Reference", "All Roles"]
---

# Quick Reference

## The LegacyForward.ai Framework at a Glance

| Pillar | Core Question | Stages / Phases | Gate Types | Key Anti-Patterns |
|---|---|---|---|---|
| **Signal Capture** | Where does this create net new value that we cannot achieve any other way? | Hypothesis → Validation → Tracking | GO/NO-GO; GO/PIVOT/KILL; Kill Triggers | Adoption Trap; Sunk Cost Spiral; Vibe-Coded Commitment; Perpetual Pilot; Automation as Transformation |
| **Grounded Delivery** | Are we delivering toward the value hypothesis, or toward a definition of done that does not measure value? | Frame → Explore → Shape → Harden → Operate | GO/NO-GO; GO/PIVOT/KILL; GO/REDESIGN; GO/CONTINUE/KILL; Operate Forever | Frame Skipped; Velocity as Progress; Test Generation Illusion; Sunk Cost at Gates; Ship and Forget |
| **Legacy Coexistence** | How do we create AI value in the enterprise environment we actually have? | Data Exhaust → Sidecar → Gateway → Shadow Pipeline → Legacy-Aware Agent (pattern complexity increases) | Pattern selection gate; Integration validation gate; Trust graduation criteria | Greenfield Fantasy; Wrapper Illusion; Integration Afterthought; Screen Scraping Default; Strangler Fig Misconception |

---

## Signal Capture: Value Assessment at a Glance

| Stage | Primary Question | Key Activities | Gate |
|---|---|---|---|
| Hypothesis | Can we state the value in one sentence? | Value statement; Transformation test; Value ceiling estimate | GO / NO-GO — no hypothesis, no funding |
| Validation | Is the hypothesis real, or plausible? | Data validation; Feasibility validation; Organizational validation; Economic validation | GO / PIVOT / KILL |
| Tracking | Is value being captured? | Leading indicators; Lagging indicators; Kill trigger monitoring | Kill if thresholds breached |

---

## Grounded Delivery: Phase Summary

| Phase | Objective | Primary Deliverable | Gate |
|---|---|---|---|
| Frame | Define what "good" looks like before building | Probabilistic success criteria; Evaluation dataset design; Integration map; Failure mode analysis | GO / NO-GO |
| Explore | Validate what is technically possible against real data | Evaluation dataset; Capability map; Legacy data access validation | GO / PIVOT / KILL |
| Shape | Design production architecture | Deterministic/non-deterministic separation; Fallback paths; Monitoring design; Coexistence pattern selection | GO / REDESIGN |
| Harden | Build and evaluate against quality thresholds | Production system; Monitoring infrastructure; Legacy integration validation; Red-team results | GO / CONTINUE / KILL |
| Operate | Monitor, maintain, and feed evidence back | Quality metrics; Drift detection; Value tracking; Trust graduation decisions | No exit — permanent |

---

## Legacy Coexistence: Pattern Selection Guide

| Pattern | Latency Requirement | Legacy System Modification | Complexity | Best For |
|---|---|---|---|---|
| Data Exhaust | Batch (hours to days) | None | Low | Historical analysis; pattern recognition over accumulated data |
| Sidecar | Near-real-time | None | Medium | Augmenting legacy processes with AI insight without replacing them |
| Gateway | Real-time | None (gateway handles translation) | Medium-High | Agent or API access to legacy systems without modern interfaces |
| Shadow Pipeline | Batch (validation) | None | High | Gradual transition from legacy process to AI process with evidence |
| Legacy-Aware Agent | Mixed (agent handles asynchrony) | None | Highest | Autonomous AI operations spanning modern and legacy systems |

---

## Core Principles Summary

| Principle | In One Line |
|---|---|
| Kill Early | The most expensive initiative is the one that should have been killed in month two and ran for two years. |
| Non-Deterministic by Default | Every process that touches an AI system must be designed for systems whose outputs cannot be predicted with certainty. |
| Legacy Is a Feature | Thirty years of transactional data is the highest-value input your AI can have — design to access it, not replace it. |
| Value Before Technology | Start with a business problem. The question is never "what can we do with AI?" |
| Operate Forever | Deploying without operating is abandonment on a delayed schedule. |
| Coexist Deliberately | Integration patterns must be selected before development begins, not figured out after. |

---

*The LegacyForward.ai Framework is the foundation of the LegacyForward.ai Series. For more, visit [legacyforward.ai](https://legacyforward.ai).*
