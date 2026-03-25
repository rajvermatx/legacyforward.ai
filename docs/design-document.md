# LegacyForward & Meridian Compass — Design Document

**Version:** 1.0
**Date:** 24 March 2026
**Platform:** legacyforward.ai

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What This Product Does (Plain Language)](#2-what-this-product-does)
3. [Site Architecture Overview](#3-site-architecture-overview)
4. [The Marketing Site — legacyforward.ai](#4-the-marketing-site)
5. [The Compass Tool — /compass](#5-the-compass-tool)
6. [User Journeys](#6-user-journeys)
7. [Technical Architecture](#7-technical-architecture)
8. [Data Model](#8-data-model)
9. [Component Library](#9-component-library)
10. [API Layer](#10-api-layer)
11. [Styling & Brand System](#11-styling--brand-system)
12. [Security & Storage](#12-security--storage)
13. [Future Roadmap](#13-future-roadmap)

---

## 1. Executive Summary

LegacyForward is a two-part web platform:

1. **Marketing Site** — Educates enterprise teams about why traditional Agile practices fail for LLM (Large Language Model) projects, and introduces the Meridian Method™ as a purpose-built alternative.

2. **Meridian Compass™** — A free, browser-based operational tool that lets practitioners (Business Analysts, QA leads, Project Managers, Product Owners, Data Stewards, and Change Managers) actually *run* the Meridian Method on their LLM projects.

Both parts live in a single Next.js application and share the same brand palette, but the Compass tool has its own layout, navigation, and authentication flow.

---

## 2. What This Product Does

### In Plain Language

**The Problem:**
When companies add AI/LLM features to their existing software, the non-engineering roles — the BAs writing requirements, the QAs writing test plans, the PMs tracking progress — discover that their traditional tools and practices don't work. Requirements can't be fully specified upfront because LLM outputs are probabilistic. "Done" isn't binary anymore. Test automation that checks for exact matches fails. Sprint velocity is meaningless when progress follows an S-curve.

**The Solution:**
LegacyForward teaches these practitioners a new methodology called the Meridian Method. Instead of user stories, teams write *behavioral hypotheses*. Instead of sprint reviews, they hold *eval reviews* where human judges score LLM outputs. Instead of a release gate, they hold a *Meridian Gate* — a formal calibration check.

**The Tool:**
Meridian Compass is the hands-on companion. A new user signs up, gets a pre-populated sample project to explore, and can immediately:

- **Diagnose** their team's readiness across 5 dimensions (20 questions, radar chart output)
- **Facilitate ceremonies** — 6 structured meetings that replace Agile ceremonies
- **Build job aids** — 4 practitioner templates (hypothesis builder, test playbook, sprint planner, RAG readiness assessment) with AI coaching on every field
- **Score LLM outputs** — submit LLM responses, score them against a human baseline, and get a gate recommendation (advance / reset / retire)

Everything is stored in the user's browser. No backend database, no API keys needed.

---

## 3. Site Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     legacyforward.ai                         │
│                                                              │
│  ┌──────────────────────┐    ┌───────────────────────────┐  │
│  │   MARKETING SITE     │    │    MERIDIAN COMPASS™      │  │
│  │                      │    │                           │  │
│  │  /                   │    │  /compass          (land) │  │
│  │  /meridian-method    │    │  /compass/login    (auth) │  │
│  │  /meridian-cycle     │    │  /compass/dashboard       │  │
│  │  /allied-skills      │    │  /compass/projects/[id]   │  │
│  │  /resources          │    │    ├── /diagnostic        │  │
│  │  /about              │    │    ├── /ceremonies/[type]  │  │
│  │  /contact            │    │    ├── /workbench/[aid]    │  │
│  │                      │    │    └── /eval               │  │
│  │  Nav + Footer wrap   │    │                           │  │
│  │  every page          │    │  AppShell (Sidebar +      │  │
│  │                      │    │  Topbar) wraps every page  │  │
│  └──────────────────────┘    └───────────────────────────┘  │
│                                                              │
│  Shared: Tailwind theme · Brand palette · /lib/constants     │
└─────────────────────────────────────────────────────────────┘
```

**Key design decision:** The marketing site and Compass tool share the same Next.js app and Tailwind config, but have completely separate layouts. The marketing site shows the global Nav and Footer. The Compass tool shows its own Sidebar and Topbar — no marketing chrome.

---

## 4. The Marketing Site

### 4.1 Purpose

Convert visitors into training program enquiries and Compass tool users.

### 4.2 Pages

| Route | Page | What It Does |
|-------|------|-------------|
| `/` | Home | Hero, problem statement, MERIDIAN acronym, role cards, CTAs |
| `/meridian-method` | Method | Deep dive: 5 broken assumptions, Waterfall vs Agile vs Meridian comparison, licensing tiers |
| `/meridian-cycle` | Cycle | Visual diagram of the ANCHOR → PROBE → SIGNAL → GATE → ADVANCE/RESET cycle, 6 ceremony descriptions |
| `/allied-skills` | Training | 6-session program overview, job aids, delivery model, pricing (USA & India) |
| `/resources` | Resources | Downloadable white paper, program overview, sample job aid; email-gated premium content |
| `/about` | About | Founder story, credentials (GCP, AWS, NIST AI RMF, FinOps) |
| `/contact` | Contact | Lead capture form with Zod validation, Formspree submission |

### 4.3 Page Layout

```
┌──────────────────────────────────────────┐
│  Nav (sticky)                            │
│  Logo · Method · Cycle · Skills · ...    │
├──────────────────────────────────────────┤
│                                          │
│  Page Content                            │
│  (hero sections, content blocks,         │
│   cards, tables, diagrams)               │
│                                          │
├──────────────────────────────────────────┤
│  Footer                                  │
│  4-column: Brand · Method · Program ·    │
│  Company                                 │
└──────────────────────────────────────────┘
```

### 4.4 The Meridian Method — Conceptual Model

The Meridian Method replaces Agile ceremonies with a calibration-first approach:

```
                    ┌─────────┐
                    │ ANCHOR  │  Establish human baseline
                    │ (Day 0) │  ("What does good look like?")
                    └────┬────┘
                         │
                         ▼
                    ┌─────────┐
                    │  PROBE  │  Run a hypothesis sprint
                    │(1-2 wk) │  ("Can the LLM do X at Y% confidence?")
                    └────┬────┘
                         │
                         ▼
                    ┌─────────┐
                    │ SIGNAL  │  Score outputs vs. baseline
                    │         │  ("How close are we?")
                    └────┬────┘
                         │
                         ▼
                    ┌──────────────┐
                    │  GATE        │
                    │  Threshold   │──── Met? ───▶  ADVANCE
                    │  Check       │                (ship it)
                    └──────┬───────┘
                           │
                       Not met
                           │
                           ▼
                    ┌─────────┐
                    │  RESET  │  Re-frame hypothesis,
                    │         │  try again
                    └────┬────┘
                         │
                         └──────▶ Back to PROBE

        ═══════════════════════════════════
        ║  DRIFT WATCH (continuous)       ║
        ║  Monitor for behavioral drift   ║
        ║  after deployment               ║
        ═══════════════════════════════════
```

### 4.5 Six Ceremonies

| # | Ceremony | Replaces | Who | When |
|---|----------|----------|-----|------|
| 1 | **Meridian Baseline Session** | Sprint 0 / Kickoff | BA, PO, QA, SMEs, Judges | Once per initiative |
| 2 | **Hypothesis Framing** | Sprint Planning | BA, PO, Tech Lead, QA | Start of each cycle |
| 3 | **Calibration Standup** | Daily Standup | Full team + judges | Daily |
| 4 | **Eval Review** | Sprint Review | Full team + stakeholders | End of each cycle |
| 5 | **Meridian Gate** | Release Gate | PO, QA, judges, risk owner | At confidence threshold |
| 6 | **Drift Watch** | *(no Agile equivalent)* | QA, MLOps, Data Steward | Continuous |

### 4.6 Six Practitioner Roles

| Role | Primary Gap | Key Ceremony |
|------|------------|--------------|
| **Business Analyst** | Writing acceptance criteria for probabilistic outputs | Hypothesis Framing |
| **Quality Analyst** | Eval design and behavioral regression monitoring | Signal + Drift Watch |
| **Product Owner** | Embedded human judgment, not end-of-sprint | Meridian Gate |
| **Project Manager** | Calibration cadence, not story points | Calibration Standup |
| **Data Steward** | Retrieval quality is upstream of model quality | Anchor phase |
| **Change Manager** | Communicating probabilistic behavior to users | Drift Watch comms |

---

## 5. The Compass Tool

### 5.1 Purpose

Give practitioners a hands-on operational environment to apply the Meridian Method to their LLM projects.

### 5.2 Application Layout

```
┌───────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────┐ │
│ │          │ │  Topbar                        👤 AK  │ │
│ │ SIDEBAR  │ ├──────────────────────────────────────┤ │
│ │          │ │                                      │ │
│ │ ◈ Logo   │ │                                      │ │
│ │          │ │                                      │ │
│ │ ← All    │ │        MAIN CONTENT AREA             │ │
│ │ projects │ │                                      │ │
│ │          │ │   (Diagnostic / Ceremonies /          │ │
│ │ Overview │ │    Workbench / Eval pages)            │ │
│ │ Diag.    │ │                                      │ │
│ │ Ceremony │ │                                      │ │
│ │ Workbenc │ │                                      │ │
│ │ Eval     │ │                                      │ │
│ │          │ │                                      │ │
│ │ ┌──────┐ │ │                                      │ │
│ │ │Desc │ │ │                                      │ │
│ │ │ box  │ │ │                                      │ │
│ │ └──────┘ │ │                                      │ │
│ │          │ │                                      │ │
│ │ ← site  │ │                                      │ │
│ └──────────┘ └──────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

**Sidebar features:**
- Meridian Compass logo
- "All projects" back link
- Current project name
- 5 navigation links (Overview, Diagnostic, Ceremonies, Workbench, Eval)
- Contextual description panel — shows 3-4 lines describing the currently active page
- "legacyforward.ai" back link

### 5.3 Five Modules

#### Module 1: Readiness Diagnostic

**What it does:** Scores your team across 5 dimensions in ~10 minutes. Surfaces gaps and gives prioritised recommendations.

**How it works:**
```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│ CONTEXT  │────▶│  20 QUESTIONS │────▶│   RESULTS    │
│          │     │  (5 dims ×4) │     │              │
│ LLM type │     │              │     │ Radar chart  │
│ Status   │     │ 4 response   │     │ Dim scores   │
│ Legacy   │     │ options each │     │ Gap list     │
│ complex. │     │              │     │ AI summary   │
└──────────┘     └──────────────┘     └──────────────┘
```

**5 Dimensions assessed:**
1. Specification Practice (BA, PO focus)
2. Testing Practice (QA focus)
3. Delivery Practice (PM, PO focus)
4. Data & Retrieval (Data Steward focus)
5. Change & Governance (Change Manager focus)

**Scoring:**
- "Fully in place" = 100
- "Partially" = 60
- "Aware but not practising" = 25
- "Not on our radar" = 0

**Severity thresholds:** <30 Critical · <60 Gap · <80 Developing · ≥80 Strong

#### Module 2: Ceremony Facilitator

**What it does:** Run all 6 Meridian ceremonies step by step. Each produces a structured, exportable artifact.

**How it works:**
```
┌─────────────────┐     ┌──────────────────────┐
│  CEREMONY LIST  │     │  CEREMONY DETAIL      │
│                 │     │                       │
│  ◼ Baseline     │────▶│  Past sessions        │
│  ◼ Hypothesis   │     │  (expandable cards)   │
│  ◼ Standup      │     │                       │
│  ◼ Eval Review  │     │  ┌─────────────────┐  │
│  ◼ Gate         │     │  │  Step Wizard    │  │
│  ◼ Drift Watch  │     │  │  Step 1 → 2 → 3 │  │
│                 │     │  │  [AI coaching]   │  │
│                 │     │  │  [Save artifact] │  │
│                 │     │  └─────────────────┘  │
└─────────────────┘     └──────────────────────┘
```

Each ceremony type has custom steps and fields. For example:

**Baseline Session steps:**
1. Feature name, risk class, human judges
2. Acceptable examples with explanations
3. Unacceptable examples with explanations
4. Boundary cases and notes

**Hypothesis Framing steps:**
1. Feature intent and behavioral hypothesis
2. Input class, confidence threshold, calibrators
3. Risk class, completeness checklist

#### Module 3: Practitioner Workbench

**What it does:** Build job aids with AI coaching on every field.

**4 Job Aid Templates:**

| Template | For | Key Fields |
|----------|-----|-----------|
| **LLM Acceptance Criteria** | BAs, POs | Behavioral hypothesis, input class, threshold, edge cases, eval criteria |
| **Test Design Playbook** | QAs | Coverage checklist, hallucination tests, regression checks, eval framework |
| **Meridian Sprint Planner** | PMs | Cycle dates, hypothesis, scores, probe approach, advance/reset/retire definitions |
| **RAG Readiness Assessment** | Data Stewards | Source quality, chunking strategy, retrieval metrics, governance checklist |

**AI Coaching pattern:**
```
┌─────────────────────────────────────┐
│  Behavioral Hypothesis              │
│  ┌─────────────────────────────┐    │
│  │ The RAG system will...      │    │
│  └─────────────────────────────┘    │
│         [💡 Get AI coaching]        │
│  ┌─────────────────────────────┐    │
│  │ ✓ Good structure. Consider  │    │
│  │   adding edge cases for     │    │
│  │   multi-language inputs...  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

#### Module 4: Eval Scorer

**What it does:** Score LLM outputs against your human baseline. Get confidence scores and gate recommendations.

**How it works:**
```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐
│ MERIDIAN │──▶│ CRITERIA │──▶│ OUTPUTS  │──▶│   RESULTS    │
│          │   │          │   │          │   │              │
│ Good     │   │ ☑ Accur. │   │ Output 1 │   │ Overall: 81% │
│ examples │   │ ☑ Ground │   │ Output 2 │   │ Gate: RESET  │
│          │   │ ☑ Coher. │   │ Output 3 │   │              │
│ Bad      │   │ ☐ Relev. │   │ ...      │   │ Per-output   │
│ examples │   │ ☑ Compl. │   │          │   │ breakdowns   │
│          │   │ ☑ Safety │   │          │   │              │
│ Risk +   │   │          │   │          │   │ AI rationale │
│ Threshold│   │          │   │          │   │              │
└──────────┘   └──────────┘   └──────────┘   └──────────────┘
```

**Gate recommendation logic:**
- Confidence ≥ threshold → ADVANCE
- Confidence within 10 points of threshold → RESET (try again)
- Confidence far below → RETIRE (abandon hypothesis)

**Risk-class thresholds:**
- LOW risk: 70% confidence required
- MEDIUM: 80%
- HIGH: 90%
- CRITICAL: 95%

### 5.4 Sample Project (New User Onboarding)

When a new user signs up, the system seeds a fully populated "Customer Support RAG" project so they can explore every module immediately.

```
SAMPLE PROJECT: "Customer Support RAG"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Team: Sarah Chen, Marcus Webb, Priya Sharma, Ravi Patel

Timeline:       2 weeks ago ──────────── 1 week ago ──────────── Today
                     │                       │                     │
Diagnostic:     [Baseline: 27%]              │                     │
                                             │                     │
Ceremonies:     [Baseline]  [Hypothesis]  [Standup 1]  [Standup 2]
                                          [Eval Review] [Gate]
                                                       [Drift Watch]
                                             │                     │
Job Aids:       [Hypothesis 100%]            │                     │
                [Sprint Plan 100%]           │                     │
                [Test Plan 47%]              │                     │
                [RAG Ready 26%]              │                     │
                                             │                     │
Eval:                                   [Cycle 1: 71%]  [Cycle 2: 81%]
                                         gate: reset     gate: reset
                                                        (+10 improvement)
```

This gives new users:
- A radar chart with real scores on the Overview page
- Past ceremony artifacts on every ceremony detail page
- In-progress and completed job aids in the Workbench
- Eval history showing iterative improvement

---

## 6. User Journeys

### Journey 1: First-Time Visitor → Tool User

```
legacyforward.ai          /compass               /compass/login
┌──────────┐          ┌──────────────┐        ┌──────────────┐
│ Reads    │          │ Sees 4       │        │ Enters email │
│ about    │─ clicks ─▶│ module       │─ CTA ─▶│ Sets profile │
│ method   │  Compass  │ descriptions │        │ (name, role) │
└──────────┘          └──────────────┘        └──────┬───────┘
                                                      │
         Seeds sample project automatically           │
                                                      ▼
                                              ┌──────────────┐
                                              │ Lands on     │
                                              │ populated    │
                                              │ project      │
                                              │ overview     │
                                              └──────────────┘
```

### Journey 2: Practitioner Running a Cycle

```
Dashboard              Project Overview         Diagnostic
┌──────────┐          ┌──────────────┐        ┌──────────────┐
│ Create   │          │ See radar    │        │ Answer 20    │
│ new      │────────▶ │ chart (if    │───────▶│ questions    │
│ project  │          │ diagnostic   │        │ View scores  │
└──────────┘          │ done)        │        │ + gaps       │
                      └──────────────┘        └──────┬───────┘
                                                      │
    ┌─────────────────────────────────────────────────┘
    ▼
Ceremonies              Workbench                Eval
┌──────────────┐      ┌──────────────┐        ┌──────────────┐
│ 1. Baseline  │      │ Build        │        │ Submit LLM   │
│ 2. Hypothesis│─────▶│ hypothesis   │───────▶│ outputs      │
│ 3. Standups  │      │ + test plan  │        │ Score vs     │
│ 4. Eval Rev. │      │ with AI help │        │ baseline     │
│ 5. Gate      │      │              │        │ Gate: go/no  │
│ 6. Drift     │      └──────────────┘        └──────────────┘
└──────────────┘
```

---

## 7. Technical Architecture

### 7.1 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 14.2.35 |
| **UI Library** | React | 18.x |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 3.4.1 |
| **State Management** | Zustand + persist middleware | 5.0.12 |
| **Charts** | Recharts | 3.8.0 |
| **Icons** | Lucide React | 1.0.1 |
| **Forms** | React Hook Form + Zod | 7.72 / 4.3.6 |
| **Bundler** | Webpack (via Next.js) | — |

### 7.2 Directory Structure

```
legacyforward/
├── app/                              # Next.js App Router pages
│   ├── layout.tsx                    # Root layout (Nav + Footer)
│   ├── page.tsx                      # Home page
│   ├── globals.css                   # Tailwind base + custom styles
│   ├── sitemap.ts                    # SEO sitemap generator
│   ├── fonts/                        # Self-hosted font files
│   ├── about/page.tsx
│   ├── meridian-method/page.tsx
│   ├── meridian-cycle/page.tsx
│   ├── allied-skills/page.tsx
│   ├── resources/page.tsx
│   ├── contact/page.tsx
│   │
│   ├── api/ai/                       # API routes (mock AI endpoints)
│   │   ├── coach/route.ts            # Field-level coaching
│   │   ├── eval/route.ts             # Output scoring
│   │   └── feedback/route.ts         # Ceremony feedback
│   │
│   └── compass/                      # Compass tool (separate layout)
│       ├── layout.tsx                # Compass metadata
│       ├── page.tsx                  # Landing page (public)
│       ├── login/page.tsx            # Auth + onboarding
│       └── (app)/                    # Route group — authenticated shell
│           ├── layout.tsx            # AppShell wrapper
│           ├── dashboard/page.tsx
│           └── projects/[id]/
│               ├── page.tsx          # Project overview
│               ├── diagnostic/page.tsx
│               ├── eval/page.tsx
│               ├── ceremonies/
│               │   ├── page.tsx      # List all 6 types
│               │   └── [type]/page.tsx
│               └── workbench/
│                   ├── page.tsx      # List all 4 aids
│                   └── [aid_type]/page.tsx
│
├── components/
│   ├── Nav.tsx                       # Global navigation
│   ├── Footer.tsx                    # Global footer
│   ├── Button.tsx                    # Primary/secondary/ghost variants
│   ├── SectionHeader.tsx             # Section titles with gold underline
│   ├── CalloutBox.tsx                # Highlighted content boxes
│   ├── MeridianBadge.tsx             # MERIDIAN acronym display
│   ├── MeridianCycleDiagram.tsx      # Interactive cycle flowchart
│   ├── ComparisonTable.tsx           # Waterfall vs Agile vs Meridian
│   ├── PhaseCard.tsx                 # Cycle phase cards
│   ├── RoleCard.tsx                  # Practitioner role cards
│   ├── SessionCard.tsx               # Training session cards
│   ├── JobAidCard.tsx                # Job aid template cards
│   ├── ContactForm.tsx               # Contact form (react-hook-form)
│   ├── EmailCaptureModal.tsx         # Gated resource modal
│   │
│   └── compass/
│       ├── layout/
│       │   ├── AppShell.tsx          # Sidebar + Topbar + content
│       │   ├── Sidebar.tsx           # Project nav + descriptions
│       │   └── Topbar.tsx            # User avatar + logout
│       ├── ui/
│       │   ├── FieldWithCoach.tsx    # Input + AI coaching button
│       │   ├── StepWizard.tsx        # Multi-step form navigation
│       │   ├── ScoreBadge.tsx        # Color-coded score pill
│       │   ├── ScoreBar.tsx          # Horizontal progress bar
│       │   ├── ProgressRing.tsx      # Circular progress indicator
│       │   └── CompassCard.tsx       # Generic card container
│       └── diagnostic/
│           └── RadarDisplay.tsx      # Recharts radar chart
│
├── lib/
│   ├── constants.ts                  # Marketing site content & config
│   ├── compass-constants.ts          # Scoring, dimensions, types
│   ├── compass-store.ts              # Zustand store definition
│   └── compass-seed.ts              # Sample project data generator
│
├── tailwind.config.ts                # Custom theme & colors
├── next.config.mjs                   # Next.js config
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies & scripts
```

### 7.3 Rendering Strategy

```
┌────────────────────────────────────────────────────────────┐
│                    RENDERING MODES                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  STATIC (○)              DYNAMIC (ƒ)                       │
│  Pre-rendered at build   Server-rendered on demand          │
│                                                            │
│  /                       /compass/projects/[id]            │
│  /about                  /compass/projects/[id]/diagnostic │
│  /meridian-method        /compass/projects/[id]/ceremonies │
│  /meridian-cycle         /compass/projects/[id]/eval       │
│  /allied-skills          /compass/projects/[id]/workbench  │
│  /resources              /api/ai/*                         │
│  /contact                                                  │
│  /compass                                                  │
│  /compass/login                                            │
│  /compass/dashboard                                        │
│                                                            │
│  All Compass interactive pages use 'use client'            │
│  for Zustand state access and browser APIs                 │
└────────────────────────────────────────────────────────────┘
```

### 7.4 Layout Hierarchy

```
RootLayout (app/layout.tsx)
│   Fonts: Inter + JetBrains Mono
│   Includes: Nav + Footer
│
├── Marketing Pages (/, /about, /meridian-method, etc.)
│   Each page is a standalone component
│
└── CompassLayout (app/compass/layout.tsx)
    │   Sets Compass-specific metadata
    │   NO Nav or Footer from main site
    │
    ├── Landing Page (/compass)
    │   Public, no auth required
    │
    ├── Login Page (/compass/login)
    │   Public, handles authentication
    │
    └── AppLayout (app/compass/(app)/layout.tsx)
        │   Wraps content in AppShell
        │   Extracts projectId from URL
        │   Passes project context to Sidebar
        │
        ├── Dashboard (/compass/dashboard)
        └── Project pages (/compass/projects/[id]/*)
```

### 7.5 Client-Side Navigation Flow

```
                        ┌─────────────┐
                        │   /compass  │ Public landing
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │   /login    │ Email → Profile → setUser()
                        └──────┬──────┘
                               │ seedSampleProject()
                               │ router.push(/projects/{id})
                        ┌──────▼──────┐
                        │  /projects  │
                        │   /[id]     │ Project Overview
                        └──────┬──────┘
                               │
              ┌────────┬───────┼────────┬─────────┐
              ▼        ▼       ▼        ▼         ▼
         /diagnostic  /ceremonies  /workbench    /eval
                       │              │
                       ▼              ▼
                  /[type]        /[aid_type]
```

---

## 8. Data Model

### 8.1 Entity Relationship Diagram

```
┌─────────┐
│  USER   │
│─────────│
│ id      │
│ email   │
│ name    │
│ role    │──────────────────────────────────────────┐
│ org?    │                                          │
└─────────┘                                          │
                                                     │
┌─────────────────────┐        ┌──────────────────┐  │
│      PROJECT        │        │   DIAGNOSTIC     │  │
│─────────────────────│        │──────────────────│  │
│ id                  │◄───────│ id               │  │
│ name                │  1:N   │ projectId        │  │
│ description         │        │ responses {}     │  │
│ mode (solo/team)    │        │ scores {}        │  │
│ createdAt           │        │ gaps []          │  │
│ updatedAt           │        │ aiSummary?       │  │
└─────────┬───────────┘        │ createdAt        │  │
          │                    └──────────────────┘  │
          │                                          │
          │ 1:N                                      │
          ├──────────────┐                           │
          │              │                           │
          ▼              ▼                           │
┌──────────────┐  ┌──────────────┐                   │
│  CEREMONY    │  │   JOB AID    │                   │
│──────────────│  │──────────────│                   │
│ id           │  │ id           │                   │
│ projectId    │  │ projectId    │                   │
│ ceremonyType │  │ aidType      │                   │
│ status       │  │ fields {}    │                   │
│ artifact {}  │  │ aiFeedback?  │                   │
│ notes?       │  │ completeness │                   │
│ createdAt    │  │ createdAt    │                   │
│ updatedAt    │  │ updatedAt    │                   │
└──────────────┘  └──────────────┘                   │
                                                     │
          ┌──────────────┐                           │
          │ EVAL SESSION │                           │
          │──────────────│                           │
          │ id           │                           │
          │ projectId    │◄──────────────────────────┘
          │ hypothesisId?│      (User creates projects,
          │ meridian {}  │       projects contain all
          │ outputs []   │       other entities)
          │ overallScore?│
          │ gateDecision │
          │ aiRationale? │
          │ createdAt    │
          └──────────────┘
```

### 8.2 Type Definitions

```
Role:               BA | QA | PO | PM | DataSteward | ChangeManager | Other
ProjectMode:        solo | team
RiskClass:          LOW | MEDIUM | HIGH | CRITICAL
CeremonyType:       baseline | hypothesis | standup | eval_review | gate | drift_watch
AidType:            hypothesis | test_plan | sprint_planner | rag_readiness
GateDecision:       advance | reset | retire | pending
DiagnosticResponse: Fully in place | Partially | Aware but not practising | Not on our radar
Severity:           Critical | Gap | Developing | Strong
```

### 8.3 Storage Architecture

```
┌─────────────────────────────────────────────────┐
│                  BROWSER                         │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │              localStorage                  │  │
│  │                                            │  │
│  │  key: 'compass-store'                      │  │
│  │  value: {                                  │  │
│  │    user: User | null,                      │  │
│  │    projects: Project[],                    │  │
│  │    activeProjectId: string | null,         │  │
│  │    diagnostics: DiagnosticResult[],        │  │
│  │    ceremonies: CeremonySession[],          │  │
│  │    jobAids: JobAid[],                      │  │
│  │    evalSessions: EvalSession[]             │  │
│  │  }                                         │  │
│  └────────────────────────────────────────────┘  │
│            ▲                                     │
│            │  Zustand persist middleware          │
│            │  (auto-sync on every state change)   │
│  ┌─────────┴──────────────────────────────────┐  │
│  │         Zustand Store (in-memory)          │  │
│  │                                            │  │
│  │  Actions: setUser, addProject, addCeremony │  │
│  │  Selectors: getProjectDiagnostics, etc.    │  │
│  └────────────────────────────────────────────┘  │
│            ▲                                     │
│            │  React hooks                        │
│  ┌─────────┴──────────────────────────────────┐  │
│  │         React Components                   │  │
│  │  useCompassStore((s) => s.projects)        │  │
│  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Why localStorage, not a database?**
- Zero setup for users (no account creation, no API keys)
- Instant availability (no network latency)
- Privacy-first (data never leaves the browser)
- Supabase-ready: The store interface mirrors a relational schema, making migration straightforward

---

## 9. Component Library

### 9.1 Marketing Site Components

```
LAYOUT
├── Nav                    Sticky header, desktop + mobile menu, 6 links
└── Footer                 4-column footer with brand + methodology + program + company

CONTENT
├── SectionHeader          Title + optional subtitle + gold underline
├── Button                 primary (gold) | secondary (outline) | ghost (transparent)
├── CalloutBox             Colored left-border highlight box with label
├── MeridianBadge          8-letter MERIDIAN acronym grid
├── MeridianCycleDiagram   Interactive SVG flowchart of calibration cycle
├── ComparisonTable        3-column: Waterfall × Agile × Meridian
├── PhaseCard              Phase name + color bar + description
└── RoleCard               Role + gap + ceremony + color accent

TRAINING
├── SessionCard            Session # + title + duration + question + job aid
└── JobAidCard             Icon + title + audience + description

FORMS
├── ContactForm            react-hook-form + Zod validation + Formspree
└── EmailCaptureModal      Modal overlay for gated resource downloads
```

### 9.2 Compass Components

```
LAYOUT
├── AppShell               Sidebar + Topbar + main content area
├── Sidebar                Project nav, active page description, back links
└── Topbar                 User initials avatar, name, logout

UI PRIMITIVES
├── FieldWithCoach         Input + "Get AI coaching" button + feedback panel
├── StepWizard             Step indicators + prev/next + completion handler
├── ScoreBadge             Circular percentage badge (green/amber/red)
├── ScoreBar               Horizontal bar with optional threshold marker
├── ProgressRing           SVG circular progress indicator
└── CompassCard            Generic card container (button variant available)

DATA VISUALIZATION
└── RadarDisplay           Recharts RadarChart — actual scores vs. benchmark overlay
```

### 9.3 Key Component Interactions

```
FieldWithCoach ──POST──▶ /api/ai/coach
                          │
                          ▼
                    Returns coaching
                    feedback string
                          │
                          ▼
                    Displays in teal
                    feedback panel

StepWizard ────▶ Manages step state
                 │
                 ├── Step 1: [FieldWithCoach fields]
                 ├── Step 2: [FieldWithCoach fields]
                 └── Step N: [FieldWithCoach fields]
                              │
                              ▼ onComplete()
                         Store.addCeremony() or
                         Store.addJobAid()

RadarDisplay ◄── scores: Record<string, number>
                 Overlays team scores (blue fill)
                 against MERIDIAN_BENCHMARK (gold dashed line)
```

---

## 10. API Layer

### 10.1 Endpoints

All three endpoints are currently **mock implementations** with rule-based responses. They are designed to be replaced with Claude API calls when ready.

```
POST /api/ai/coach
├── Input:  { field_name, field_value, aid_type, context? }
├── Output: { feedback: string }
├── Used by: FieldWithCoach component
└── Mock logic: Length checks, pattern matching, context-specific tips

POST /api/ai/eval
├── Input:  { criteria: [{name, weight}], output: string }
├── Output: { scores: {}, overall: number, flag: string, rationale: string }
├── Used by: Eval Scorer page
└── Mock logic: Random scores (60-90), flag based on overall threshold

POST /api/ai/feedback
├── Input:  { ceremony_type, step, content }
├── Output: { feedback: string }
├── Used by: Ceremony Facilitator pages
└── Mock logic: Ceremony-type-specific encouragement
```

### 10.2 Future API Architecture (with Claude)

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Browser    │     │   Next.js API   │     │  Claude API  │
│   (Client)   │────▶│   Route Handler │────▶│  (Anthropic) │
│              │     │                 │     │              │
│ FieldWith   │     │ /api/ai/coach   │     │ claude-sonnet│
│  Coach      │     │  - System prompt│     │  -4-20250514 │
│              │     │  - Field context│     │              │
│ Eval page   │     │ /api/ai/eval    │     │ Claude-as-   │
│              │     │  - Meridian     │     │  judge eval  │
│              │     │  - Criteria     │     │              │
└─────────────┘     └─────────────────┘     └──────────────┘
```

---

## 11. Styling & Brand System

### 11.1 Color Palette

```
BRAND COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Navy        ██████  #0D2B4E     Primary dark, headers, sidebar
Blue        ██████  #1B4F8C     Secondary dark
Mid         ██████  #2E75B6     Interactive elements
Steel       ██████  #4A90C4     Muted text on dark
Light       ██████  #D6E4F0     Borders, dividers
Pale        ██████  #F0F6FB     Background tint

Gold        ██████  #C8972A     Primary accent, CTAs, focus states
Teal        ██████  #0F6E56     Success, coaching feedback
Coral       ██████  #993C1D     Warnings, critical severity
Purple      ██████  #3C3489     Phases, roles
Amber       ██████  #854F0B     Mid-range scores

SCORE COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Score High  ██████  Green       ≥85 — "Strong"
Score Med   ██████  Amber       ≥70 — "Developing"
Score Low   ██████  Red         <70  — "Gap" or "Critical"

BACKGROUNDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

White       ██████  #FFFFFF     Cards, content areas
Lt Gray     ██████  #F8FAFC     Page backgrounds (Compass)
Dark        ██████  #1A1A2E     Text on light backgrounds
Gray        ██████  #6B7280     Body text, descriptions
```

### 11.2 Typography

```
FONTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Inter (sans-serif)          Body text, headings, UI
  Weights: 400, 500, 600, 700

JetBrains Mono (monospace)  Code snippets, technical labels

SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
text-xs     11px    Captions, sidebar descriptions
text-sm     14px    Body text, form labels
text-base   16px    Standard paragraph
text-lg     18px    Subheadings
text-xl     20px    Section titles
text-2xl    24px    Page titles
text-3xl+   30px+   Hero headings
```

### 11.3 Component Styling Patterns

```
CARDS
┌──────────────────────────────┐
│  bg-white                    │
│  rounded-lg                  │
│  border border-light         │
│  shadow-sm                   │
│  hover:shadow-md             │
│  hover:border-mid            │
│  p-5 or p-6                  │
└──────────────────────────────┘

BUTTONS
┌──────────────────────────────┐
│  Primary:   bg-gold text-white font-bold rounded-lg
│  Secondary: border-white text-white bg-transparent
│  Ghost:     text-navy hover:bg-pale
│  Disabled:  opacity-50 cursor-not-allowed
└──────────────────────────────┘

FORMS
┌──────────────────────────────┐
│  rounded-lg border-light     │
│  px-4 py-2.5                 │
│  focus:ring-2 ring-gold/50   │
│  focus:border-gold           │
└──────────────────────────────┘
```

---

## 12. Security & Storage

### 12.1 Current Architecture

| Concern | Approach |
|---------|----------|
| **Authentication** | Browser-local only. User profile stored in Zustand/localStorage. No server-side sessions. |
| **Data storage** | 100% client-side via localStorage. No data transmitted to any server (except mock AI endpoints). |
| **Form submission** | Contact form uses Formspree (third-party). No other external data transmission. |
| **API routes** | Mock endpoints return deterministic responses. No API keys stored or used. |
| **XSS prevention** | React's default escaping. No `dangerouslySetInnerHTML` usage. |
| **CSRF** | Not applicable (no server-side state to protect). |

### 12.2 Supabase Migration Path

The data model is designed for straightforward migration to Supabase:

```
localStorage (current)          Supabase (future)
━━━━━━━━━━━━━━━━━━━━           ━━━━━━━━━━━━━━━━━━
compass-store key     ──▶      PostgreSQL tables
├── user              ──▶      auth.users + profiles
├── projects[]        ──▶      projects table
├── diagnostics[]     ──▶      diagnostics table
├── ceremonies[]      ──▶      ceremonies table
├── jobAids[]         ──▶      job_aids table
└── evalSessions[]    ──▶      eval_sessions table

Zustand actions       ──▶      Supabase client queries
  addProject()        ──▶      supabase.from('projects').insert()
  getProjectCeremonies() ──▶   supabase.from('ceremonies').select().eq('project_id', id)
```

---

## 13. Future Roadmap

### Phase 1: AI Integration
- Replace mock `/api/ai/coach` with Claude Sonnet for real-time field coaching
- Replace mock `/api/ai/eval` with Claude-as-judge evaluation
- Add streaming responses for better UX

### Phase 2: Persistence & Collaboration
- Migrate from localStorage to Supabase
- Add proper authentication (email/password, OAuth)
- Enable team mode with shared projects and real-time collaboration

### Phase 3: Export & Reporting
- PDF export for ceremony artifacts
- CSV/JSON export for eval results
- Project health dashboards with trend lines
- Shareable diagnostic results

### Phase 4: Enterprise Features
- Organization accounts with role-based access
- Audit trail for gate decisions
- Integration with existing project management tools (Jira, Linear)
- Custom ceremony templates

---

*Document generated for legacyforward.ai — Meridian Compass™*
*All content © LegacyForward 2026*
