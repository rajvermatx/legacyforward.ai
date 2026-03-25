# CLAUDE CODE SCAFFOLDING PROMPT
# Meridian Compass — LegacyForward™ Operational Tool
# compass.legacyforward.ai
# Version: 1.0 | Date: March 23, 2026
# Author: Rajesh | LegacyForward™
#
# INSTRUCTIONS FOR USE:
# Paste this entire prompt into Claude Code at the start of a new session.
# Claude Code will scaffold the full tool. Build in the execution order
# specified in Section 8. Do not truncate or summarize this prompt.

---

You are building **Meridian Compass** — the operational companion tool for the Meridian Method™,
a calibration-first LLM delivery methodology developed by LegacyForward. The tool lives at
compass.legacyforward.ai and is free to use, requiring only an email to save work.

Meridian Compass has four modules:
1. **Readiness Diagnostic** — scores an organization's LLM delivery readiness by role
2. **Ceremony Facilitator** — guides teams through all 6 Meridian ceremonies
3. **Practitioner Workbench** — structured job aid builder with AI coaching
4. **Eval Scorer** — scores LLM outputs against a defined meridian baseline

The tool supports both **solo mode** (individual practitioner) and **team mode** (collaborative
session with shared workspace). Projects persist across sessions. Claude API provides qualitative
coaching and feedback. A rule-based scoring engine provides quantitative scores.

---

## 1. TECH STACK

```
Framework:        Next.js 14 (App Router) + TypeScript
Styling:          Tailwind CSS (brand palette from Section 2)
Database:         Supabase (Postgres + Auth + Realtime for team mode)
AI:               Anthropic Claude API (claude-sonnet-4-20250514)
                  — qualitative coaching, feedback, eval scoring rationale
State:            Zustand for client state, React Query for server state
Forms:            React Hook Form + Zod
Rich text:        Tiptap (lightweight, for hypothesis and notes fields)
Export:           react-pdf for PDF export of completed artifacts
Email:            Resend (transactional — magic link auth, artifact delivery)
Deployment:       Vercel (subdomain: compass.legacyforward.ai)
Icons:            Lucide React
Charts:           Recharts (for diagnostic radar chart and confidence scores)
```

### Why Supabase
- Postgres gives you structured project/session data with relational integrity
- Built-in Auth handles magic link login (no password required for free tool)
- Realtime subscriptions power team mode collaborative editing
- Row Level Security ensures users only see their own projects
- Free tier is sufficient for v1

### Why Claude API (Hybrid, not full AI)
- Rule-based engine scores quantitative dimensions (completeness, coverage, threshold logic)
- Claude provides qualitative coaching: "Your hypothesis is missing an input class definition.
  Here is why that matters and how to add one."
- Claude explains eval scores: "This output scored 71% — here are the specific dimensions
  where it fell short and why."
- Claude never replaces the human judge — it coaches the practitioner toward better judgment
- Always use claude-sonnet-4-20250514 for cost efficiency at scale

---

## 2. BRAND SYSTEM

Same palette as legacyforward.ai — this is a product within the brand.

```css
--navy:      #0D2B4E   /* Primary dark */
--blue:      #1B4F8C   /* Brand blue */
--mid:       #2E75B6   /* Interactive */
--steel:     #4A90C4   /* Hover */
--light:     #D6E4F0   /* Tinted bg */
--pale:      #F0F6FB   /* Card bg */
--gold:      #C8972A   /* Accent, CTA */
--gold-lt:   #FDF3DC   /* Gold tint */
--dark:      #1A1A2E   /* Body text */
--gray:      #595959   /* Secondary text */
--lt-gray:   #F4F6F9   /* Page bg */
--teal:      #0F6E56   /* Success / QA */
--teal-lt:   #E1F5EE
--coral:     #993C1D   /* Warning / reset */
--coral-lt:  #FAECE7
--purple:    #3C3489   /* Human judgment */
--purp-lt:   #EEEDFE
--amber:     #854F0B   /* Gate / caution */
--amber-lt:  #FAEEDA
```

**Compass-specific UI additions:**
```css
--score-high:    #0F6E56   /* ≥ 85% confidence — teal */
--score-med:     #854F0B   /* 70–84% — amber */
--score-low:     #993C1D   /* < 70% — coral */
--score-bg-high: #E1F5EE
--score-bg-med:  #FAEEDA
--score-bg-low:  #FAECE7
```

---

## 3. DATABASE SCHEMA

```sql
-- Users (handled by Supabase Auth, extend with profile)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  email       TEXT NOT NULL,
  name        TEXT,
  role        TEXT,  -- BA | QA | PO | PM | DataSteward | ChangeManager | Other
  org         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (a team's LLM initiative)
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES profiles(id),
  name        TEXT NOT NULL,
  description TEXT,
  mode        TEXT DEFAULT 'solo',  -- solo | team
  invite_code TEXT UNIQUE,          -- for team mode
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Project members (team mode)
CREATE TABLE project_members (
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id),
  role        TEXT,  -- user's role on this project
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- Diagnostic results
CREATE TABLE diagnostics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id),
  responses   JSONB NOT NULL,   -- all question responses
  scores      JSONB NOT NULL,   -- computed scores per dimension
  gaps        JSONB NOT NULL,   -- identified gaps with severity
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Ceremony sessions
CREATE TABLE ceremonies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  ceremony_type TEXT NOT NULL,  -- baseline|hypothesis|standup|eval_review|gate|drift_watch
  status        TEXT DEFAULT 'in_progress',  -- in_progress | complete
  artifact      JSONB,          -- completed ceremony output
  notes         TEXT,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Job aids (practitioner workbench)
CREATE TABLE job_aids (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  aid_type    TEXT NOT NULL,  -- hypothesis|test_plan|sprint_planner|rag_readiness
  fields      JSONB NOT NULL, -- all field values
  ai_feedback JSONB,          -- Claude's coaching feedback per field
  completeness INT,           -- 0-100 rule-based completeness score
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Eval sessions
CREATE TABLE eval_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  hypothesis_id   UUID REFERENCES job_aids(id),  -- links to a hypothesis
  meridian        JSONB NOT NULL,  -- the baseline: acceptable examples, criteria
  outputs         JSONB NOT NULL,  -- array of LLM outputs submitted for scoring
  scores          JSONB NOT NULL,  -- per-output scores and overall confidence
  ai_rationale    TEXT,            -- Claude's qualitative explanation
  gate_decision   TEXT,            -- advance | reset | retire | pending
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceremonies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_aids      ENABLE ROW LEVEL SECURITY;
ALTER TABLE eval_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users access their own projects and projects they are members of
-- (full policies in /supabase/migrations/001_rls.sql)
```

---

## 4. APPLICATION ARCHITECTURE

### Route Structure
```
app/
├── (marketing)/
│   ├── page.tsx                  → Landing page (compass.legacyforward.ai)
│   └── layout.tsx                → Marketing layout (no sidebar)
├── (app)/
│   ├── layout.tsx                → App shell: sidebar + topbar
│   ├── dashboard/
│   │   └── page.tsx              → Projects list + create new
│   ├── projects/[id]/
│   │   ├── page.tsx              → Project overview (radar chart + module nav)
│   │   ├── diagnostic/
│   │   │   └── page.tsx          → Readiness Diagnostic
│   │   ├── ceremonies/
│   │   │   ├── page.tsx          → Ceremonies overview (6 cards)
│   │   │   └── [type]/
│   │   │       └── page.tsx      → Individual ceremony facilitator
│   │   ├── workbench/
│   │   │   ├── page.tsx          → Job aids overview
│   │   │   └── [aid_type]/
│   │   │       └── page.tsx      → Individual job aid builder
│   │   └── eval/
│   │       ├── page.tsx          → Eval sessions list
│   │       └── [session_id]/
│   │           └── page.tsx      → Eval scorer
├── auth/
│   ├── login/page.tsx            → Magic link login
│   └── callback/page.tsx         → Auth callback handler
└── api/
    ├── ai/coach/route.ts         → Claude coaching endpoint
    ├── ai/eval/route.ts          → Claude eval scoring endpoint
    ├── ai/feedback/route.ts      → Claude field feedback endpoint
    └── export/[id]/route.ts      → PDF export endpoint
```

### Shared Components
```
components/
├── layout/
│   ├── AppShell.tsx              → Sidebar + topbar wrapper
│   ├── Sidebar.tsx               → Project nav: modules + progress
│   ├── Topbar.tsx                → Project name + team members + export
│   └── ModeToggle.tsx            → Solo ↔ Team mode switcher
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx                 → Score badges (high/med/low color coding)
│   ├── ProgressRing.tsx          → Circular progress for completeness
│   ├── ScoreBar.tsx              → Horizontal confidence bar
│   ├── RadarChart.tsx            → Diagnostic results radar (Recharts)
│   ├── CoachPanel.tsx            → AI coaching sidebar panel
│   ├── FieldWithCoach.tsx        → Input/textarea + AI feedback trigger
│   ├── CeremonyCard.tsx          → Ceremony status card
│   ├── ArtifactExport.tsx        → Export to PDF button
│   └── TeamAvatars.tsx           → Collaborative presence indicators
├── diagnostic/
│   ├── DiagnosticWizard.tsx      → Multi-step question flow
│   ├── QuestionCard.tsx          → Individual diagnostic question
│   ├── GapReport.tsx             → Scored results + recommended actions
│   └── RadarDisplay.tsx          → Role-by-role radar visualization
├── ceremonies/
│   ├── CeremonyRouter.tsx        → Routes to correct ceremony component
│   ├── BaselineSession.tsx
│   ├── HypothesisFraming.tsx
│   ├── CalibrationStandup.tsx
│   ├── EvalReview.tsx
│   ├── MeridianGate.tsx
│   └── DriftWatch.tsx
├── workbench/
│   ├── HypothesisBuilder.tsx     → Job Aid 1
│   ├── TestPlanBuilder.tsx       → Job Aid 2
│   ├── SprintPlannerBuilder.tsx  → Job Aid 3
│   └── RAGReadinessBuilder.tsx   → Job Aid 4
└── eval/
    ├── MeridianDefiner.tsx       → Define the human meridian baseline
    ├── OutputSubmitter.tsx       → Paste/enter LLM outputs
    ├── ScoreDisplay.tsx          → Per-output scores + overall confidence
    ├── GateDecision.tsx          → Advance / Reset / Retire decision panel
    └── RationalePanel.tsx        → Claude's qualitative explanation
```

---

## 5. MODULE SPECIFICATIONS

---

### MODULE 1 — READINESS DIAGNOSTIC

**Purpose**: In 10–15 minutes, surface exactly where a team's LLM delivery practice
is breaking and what to do about it first.

**Flow**:
```
Step 1: Role selection
  → "What is your primary role on this project?"
  → BA | QA | PO | PM | Data Steward | Change Manager | Mixed team

Step 2: Project context (3 questions)
  → "Is this team currently working on an LLM project?" Y/N
  → "What type of system?" RAG | Fine-tuned | Prompt-based | Not sure
  → "Legacy environment?" High complexity | Moderate | Greenfield

Step 3: Diagnostic questions (20 questions, 5 per dimension)
  → Delivered as single-page scrollable cards, one at a time
  → 4-point scale: Fully in place | Partially | Aware but not practising | Not on our radar

Step 4: Scored gap report
  → Radar chart: 5 dimensions scored 0–100
  → Per-dimension breakdown with severity (Critical | Gap | Developing | Strong)
  → Top 3 recommended actions with direct links to relevant tool module
  → "Start here" recommendation — which ceremony or job aid to run first
```

**Five Diagnostic Dimensions** (4 questions each):
```
DIMENSION 1 — SPECIFICATION PRACTICE (BA / PO)
Q1: "Our team writes acceptance criteria that define a confidence threshold,
     not just a pass/fail outcome."
Q2: "We have documented what 'acceptable' and 'unacceptable' outputs look like
     for our LLM features before development begins."
Q3: "Our requirements distinguish between input classes — typical inputs,
     edge cases, and out-of-scope inputs."
Q4: "We assign a risk class (LOW/MEDIUM/HIGH/CRITICAL) to LLM features and
     set confidence thresholds accordingly."

DIMENSION 2 — TESTING PRACTICE (QA)
Q5: "Our test suite goes beyond exact-match testing for LLM features."
Q6: "We have a protocol for detecting hallucinations — not just checking
     whether the output exists."
Q7: "We run behavioral regression checks after model updates, corpus changes,
     or prompt modifications — even with no code change."
Q8: "We use an eval framework (RAGAS, LLM-as-judge, or equivalent) to score
     output quality systematically."

DIMENSION 3 — DELIVERY PRACTICE (PM / PO)
Q9:  "Our sprint planning accounts for eval-driven iteration rather than
      linear feature completion."
Q10: "Our definition of done for LLM features references a confidence
      threshold, not a binary pass/fail."
Q11: "Human judges are embedded in our build cycle — not only present
      at sprint review."
Q12: "We have a defined protocol when a hypothesis fails to reach its
      confidence threshold."

DIMENSION 4 — DATA & RETRIEVAL (Data Steward)
Q13: "We have a documented chunking strategy for our RAG corpus."
Q14: "We measure retrieval precision and recall — not just end-to-end
      output quality."
Q15: "We have a process for refreshing the vector index when source
      documents change."
Q16: "A named person owns corpus quality and is involved in sprint
      planning decisions."

DIMENSION 5 — CHANGE & GOVERNANCE (Change Manager / All)
Q17: "We have a documented protocol for communicating to users when
      system behavior changes without a deployment."
Q18: "We classify LLM incidents by type (model drift, corpus drift,
      prompt regression, distribution shift) before routing them."
Q19: "Governance accountabilities for LLM quality are assigned to
      named roles, not left to 'the team'."
Q20: "We have a Drift Watch equivalent — continuous monitoring that
      alerts when output quality degrades beyond a threshold."
```

**Scoring Logic** (rule-based):
```typescript
const SCORE_MAP = {
  'Fully in place':           100,
  'Partially':                 60,
  'Aware but not practising':  25,
  'Not on our radar':           0,
};

// Dimension score = average of 4 questions in that dimension
// Overall score = weighted average (weights by role if role provided)
// Severity thresholds:
//   Critical:    score < 30
//   Gap:         30 ≤ score < 60
//   Developing:  60 ≤ score < 80
//   Strong:      score ≥ 80
```

**Claude coaching** — after scoring, Claude receives the gap report and generates:
- A 2-sentence summary of the team's most critical gap
- The single highest-leverage action to take first
- A warning about the most common mistake teams make given this gap profile

**Radar chart**: Recharts RadarChart, 5 dimensions, dual-layer (team score + "Meridian
benchmark" overlay in gold dashes showing what a strong team looks like).

---

### MODULE 2 — CEREMONY FACILITATOR

**Purpose**: Guide a team through each Meridian ceremony step by step, producing a
structured artifact at the end of each session.

**Six ceremonies** — each has: an intro screen, a structured multi-step flow, and an
artifact export. Build as step-by-step wizards, not single forms.

---

#### CEREMONY 1: Meridian Baseline Session
*Replaces: Sprint 0 / Project Kickoff*

```
Step 1: Context
  → Feature name
  → Risk class (dropdown: LOW / MEDIUM / HIGH / CRITICAL)
  → Who are the human judges for this feature? (names + roles)

Step 2: Acceptable outputs
  → "Provide 3–5 examples of outputs you would consider ACCEPTABLE."
  → Rich text input, one example per card
  → For each: "Why is this acceptable?" (forces articulation)

Step 3: Unacceptable outputs
  → "Provide 3–5 examples of outputs you would consider UNACCEPTABLE."
  → For each: "Why is this unacceptable? What specifically fails?"

Step 4: Boundary cases
  → "Are there any outputs where you are genuinely uncertain — acceptable
     to some judges but not others?"
  → Space for up to 3 boundary cases + discussion notes

Step 5: Meridian summary
  → Auto-generated summary card: feature name, risk class, judges,
    acceptable criteria, unacceptable criteria, boundary cases
  → Claude reviews the baseline and flags: "Your acceptable examples
    suggest the threshold is implicitly at X. Your unacceptable examples
    suggest Y is a consistent failure pattern. Consider making these
    explicit in your confidence threshold."
  → Export as PDF artifact
```

---

#### CEREMONY 2: Hypothesis Framing
*Replaces: Sprint Planning*

```
Step 1: Feature intent
  → "Describe the feature in plain language — what should it do?"
  → FieldWithCoach: Claude responds: "Good starting point. Now let's
    make this testable."

Step 2: Convert to hypothesis
  → Guided template:
    "We believe the system will [BEHAVIOR] for [INPUT CLASS]
     at [CONFIDENCE THRESHOLD]% confidence, as judged by [CALIBRATORS]."
  → Each bracket is a separate input with AI coaching
  → Claude validates: "Your input class is very broad — it includes
    both short and long documents. These likely behave differently.
    Consider splitting into two hypotheses."

Step 3: Risk class + threshold
  → Risk class dropdown with explanation of each level
  → Threshold auto-suggested based on risk class, editable
  → Rule-based validation: threshold < 70% triggers a warning
    regardless of risk class

Step 4: Completeness check
  → Rule-based: checks all 5 components present (behavior, input class,
    threshold, calibrators, risk class)
  → Completeness score displayed as progress ring
  → Claude: qualitative assessment of hypothesis quality

Step 5: Export hypothesis card (Job Aid 1 format)
```

---

#### CEREMONY 3: Calibration Standup
*Replaces: Daily Standup*

```
Purpose: Help a PM facilitate a standup using the 3 Meridian questions.
This is a facilitation guide, not a data entry form.

Screen layout:
  → Left panel: the 3 questions displayed large, in sequence
  → Right panel: notes field for each question

Question 1: "What signal did we observe yesterday?"
  → Notes: [freetext]
  → Prompt: "Document the actual eval score or qualitative observation
    — not what the team did, but what the system showed."

Question 2: "How does it compare to the meridian?"
  → Auto-pulls: linked hypothesis + its confidence threshold
  → Notes: [freetext]
  → Prompt: "Are you above or below threshold? By how much?
    What is the trend over the last 3 standups?"

Question 3: "What is blocking calibration?"
  → Notes: [freetext]
  → Prompt: "This is not 'what is blocking development' —
    it is what is preventing you from measuring quality accurately."

End of standup:
  → One-click save to project log
  → Trend line: last 7 standups' confidence scores plotted
  → Flag: if score is declining for 3 consecutive standups,
    show "Consider triggering an early Eval Review"
```

---

#### CEREMONY 4: Eval Review
*Replaces: Sprint Review*

```
Step 1: Link to hypothesis
  → Select the hypothesis being reviewed this cycle
  → Display: target confidence threshold + risk class

Step 2: Evidence submission
  → "What is the current confidence score from your eval run?"
  → Score input (0–100)
  → "Paste or summarize the eval results" (rich text)
  → "How many outputs were evaluated?" (number)
  → "What was the distribution?" — optional: High/Med/Low counts

Step 3: Human judge review
  → "Have human judges reviewed a sample of outputs?" Y/N
  → If yes: "What was their assessment?" (freetext)
  → "Did the human assessment agree with the automated score?" Y/Partial/No
  → If no agreement: "Describe the discrepancy" — Claude flags this
    as requiring a meridian recalibration

Step 4: Decision
  → Three options with structured prompts:
    ADVANCE: "The score meets threshold and gate is passed — describe
              what moves to the next tier"
    RESET:   "Score does not meet threshold — describe the modified
              probe approach"
    RETIRE:  "The hypothesis is not achievable — document why and
              what was learned"

Step 5: Artifact
  → Eval Review Record: hypothesis, score, evidence, judge notes, decision
  → Claude: "Given your score of X against a threshold of Y, your
    decision to [advance/reset/retire] is [appropriate/worth reconsidering
    because...]"
```

---

#### CEREMONY 5: Meridian Gate
*Replaces: Release Gate*

```
Step 1: Gate context
  → Link to hypothesis + current confidence score
  → "Is this gate for: Tier advancement | Production release | Both?"

Step 2: Human judge confirmation
  → List judges (from hypothesis)
  → For each judge: "Has this judge reviewed a sample of outputs?" Y/N
  → If any judge has not reviewed: gate cannot proceed — show blocker

Step 3: Judge verdicts
  → For each judge who has reviewed:
    "Did the outputs meet the defined meridian for this feature?" Yes | No | Conditionally
  → If Conditionally: "Describe the condition"

Step 4: Scoring artifact check
  → Rule-based: is the confidence score above threshold? Y/N
  → Is human judge agreement ≥ 80%? Y/N
  → Both must be true for gate to pass

Step 5: Gate outcome
  → PASSED: all conditions met — document what advances
  → HELD: conditions not met — document what must change before resubmission
  → Claude: "Your gate held because [specific reason]. The highest
    priority fix is [specific recommendation]."

Step 6: Export Gate Record artifact
```

---

#### CEREMONY 6: Drift Watch Configuration
*No Agile equivalent*

```
Step 1: Trigger configuration
  → "What system changes should trigger a Drift Watch alert?"
  → Checkboxes: Model update | Corpus change | Prompt modification |
                Embedding model change | Input distribution shift | Scheduled (weekly)

Step 2: Monitoring targets
  → "Which hypotheses should be monitored?" (multi-select from project hypotheses)
  → For each: "What confidence delta triggers an alert?" (default: -5%)

Step 3: Alert routing
  → "Who receives Drift Watch alerts?" (names + roles)
  → "What is the first response protocol?" (freetext)
  → "Within how many hours should an alert be acknowledged?" (number)

Step 4: Drift log
  → Table: Date | Trigger | Hypothesis | Score before | Score after | Delta | Status
  → Manual entry for v1 (automated via API webhook in v2)
  → If delta > alert threshold: row highlights in coral

Step 5: Export Drift Watch Configuration artifact
```

---

### MODULE 3 — PRACTITIONER WORKBENCH

**Purpose**: Structured builder for all four job aids, with Claude coaching on every
field as the practitioner fills it in.

**The FieldWithCoach pattern** — used throughout the workbench:
```
[Field label]
[Input / textarea]
[Claude Coach button — "Get feedback on this field"]
  → On click: sends field value + field context to Claude API
  → Claude returns: specific, actionable feedback (not generic praise)
  → Feedback displays inline beneath the field in a teal coaching panel
  → User can dismiss or incorporate feedback
```

**Claude coaching system prompt for Workbench** (use in /api/ai/coach route):
```
You are a Meridian Method coaching assistant. You are reviewing a practitioner's
work on [FIELD_NAME] within [JOB_AID_TYPE].

The Meridian Method is a calibration-first delivery methodology for LLM integration
in legacy enterprise environments. Your job is to:
1. Identify the single most important gap or weakness in what the practitioner has written
2. Explain concisely WHY it matters for LLM delivery
3. Give a specific, concrete suggestion for how to improve it

Be direct. Be specific. Do not give generic encouragement.
Do not say "great start" or "good thinking."
If the field is genuinely well-done, say so in one sentence and explain why.
Maximum 100 words per coaching response.

Current field: [FIELD_NAME]
Field value: [FIELD_VALUE]
Job aid context: [CONTEXT]
```

**Four job aids — all in workbench:**

```
JOB AID 1: LLM Acceptance Criteria (Hypothesis Builder)
  Fields: Feature name, behavioral hypothesis (guided template), input class,
          out-of-scope inputs, risk class, confidence threshold, calibrators,
          evaluation criteria, failure definition, edge cases, owner, review date
  Rule scoring: all required fields complete = 100%. Missing field = weighted deduction.
  Export: PDF formatted as the Job Aid 1 card from the training program

JOB AID 2: LLM Test Design Playbook
  Four sections, each with checklist + notes:
  - Behavioral Coverage (5 items)
  - Hallucination Testing (4 items)
  - Behavioral Regression (4 items)
  - Semantic Evaluation (4 items)
  Each item: checkbox + "Notes / evidence" text field
  Claude coaching: available per section (not per item)
  Rule scoring: % of items checked. Unchecked critical items flagged.
  Export: PDF checklist

JOB AID 3: Meridian Sprint Planner
  Fields: Cycle number, dates, behavioral hypothesis (link or restate),
          risk class, current confidence score, target confidence score,
          human judges, probe approach, eval method, definition of advance,
          definition of reset, definition of retire, Drift Watch configured Y/N,
          Data Steward corpus readiness Y/N
  Rule scoring: all fields complete + scores are realistic (target > current)
  Export: PDF sprint card

JOB AID 4: RAG Readiness Assessment
  Four sections with checklists:
  - Source Document Quality (5 items)
  - Chunking & Indexing (5 items)
  - Retrieval Quality (5 items)
  - Governance (4 items)
  Critical items in sections 1 and 2: if unchecked, show BLOCKER warning
  (these must be resolved before Probe phase)
  Claude coaching: available per section
  Rule scoring: % complete. BLOCKER items weighted at 3x.
  Export: PDF checklist
```

---

### MODULE 4 — EVAL SCORER

**Purpose**: Score LLM outputs against a defined human meridian baseline.
Produce a confidence score, a distribution, and a gate recommendation.

**Flow**:

```
Step 1: Link or define a meridian
  → Option A: Link to a Meridian Baseline Session artifact from this project
  → Option B: Quick-define inline (simplified version — 3 acceptable, 3 unacceptable)

Step 2: Evaluation criteria
  → Select which dimensions to score (checkboxes):
    ☐ Accuracy (factually correct relative to source)
    ☐ Groundedness (claims supported by retrieved context)
    ☐ Coherence (logically structured, readable)
    ☐ Relevance (answers the actual question asked)
    ☐ Completeness (covers required elements per hypothesis)
    ☐ Safety (no harmful, inappropriate, or legally risky content)
  → For each selected dimension: set weight (default equal weight, editable)

Step 3: Submit outputs for scoring
  → Paste up to 20 LLM outputs (one per card)
  → Each output: text field + optional "input that produced this" field
  → Button: "Score all outputs"

Step 4: Rule-based scoring (happens immediately, no API call)
  → For each output:
    - Completeness check: does it contain the required elements?
      (rule-based against hypothesis definition)
    - Length validity: within acceptable range?
    - Format compliance: matches expected structure?
  → Partial score produced immediately while Claude runs async

Step 5: Claude qualitative scoring (async, streams in)
  → Claude receives: meridian baseline + evaluation criteria + each output
  → For each output: 0–100 score per dimension + one-sentence rationale
  → Overall output score = weighted average
  → System prompt for eval scoring (in /api/ai/eval route):

    "You are a Meridian Method evaluation assistant scoring LLM outputs
    against a defined human meridian baseline.

    MERIDIAN BASELINE:
    Acceptable examples: [EXAMPLES]
    Unacceptable examples: [EXAMPLES]
    Risk class: [RISK_CLASS]
    Confidence threshold: [THRESHOLD]%

    EVALUATION CRITERIA AND WEIGHTS:
    [CRITERIA_LIST]

    For each output below, provide:
    1. A score (0–100) for each criterion
    2. One sentence explaining the most significant strength or weakness
    3. An overall score (weighted average)
    4. A flag: ACCEPTABLE | BORDERLINE | UNACCEPTABLE

    Be consistent. Compare to the meridian baseline, not to an abstract ideal.
    Score 0–100 for each dimension. Do not round to round numbers.
    Return valid JSON only — no prose outside the JSON structure.

    OUTPUT TO SCORE: [OUTPUT_TEXT]"

Step 6: Results display
  → Summary card: overall confidence score, color coded (teal/amber/coral)
  → Distribution: how many Acceptable / Borderline / Unacceptable
  → Per-output breakdown: expandable cards with dimension scores + rationale
  → Confidence bar against threshold — are you above or below gate?

Step 7: Gate recommendation
  → Rule-based logic:
    - Score ≥ threshold AND < 5% Unacceptable → ADVANCE recommended
    - Score ≥ threshold BUT ≥ 5% Unacceptable → ADVANCE with caution
    - Score within 10% of threshold → RESET recommended
    - Score > 15% below threshold → RETIRE for consideration
  → Claude rationale: 2–3 sentences explaining the recommendation
    in context of the specific failure pattern observed

Step 8: Export Eval Report
  → PDF: hypothesis, meridian summary, scores table, distribution chart,
    gate recommendation, Claude rationale
```

---

## 6. LANDING PAGE (compass.legacyforward.ai)

A focused conversion page — not a full marketing site.

```
Hero (navy background):
  Headline: "Run the Meridian Method. Starting today."
  Subheadline: "Free tools for BAs, QAs, PMs, and product owners
                working on LLM projects."
  CTA: "Start your first project" → /auth/login

Four module cards (white background):
  Each card: module name + one-line description + icon
  Diagnostic | Ceremony Facilitator | Practitioner Workbench | Eval Scorer

How it works (3 steps, light background):
  1. "Run the Readiness Diagnostic" — find your gaps in 10 minutes
  2. "Use the Ceremony Facilitator" — run Meridian ceremonies on live projects
  3. "Score your LLM outputs" — know if you are above the threshold

Social proof bar:
  "Built on the Meridian Method™ — a LegacyForward IP publication"
  Link: "Read the white paper →" → legacyforward.ai/resources

Footer:
  "Meridian Compass is free. No credit card. No install."
  "© 2026 LegacyForward. The Meridian Method™ is a trademark of LegacyForward."
```

---

## 7. AUTH FLOW

Use Supabase magic link auth. No passwords.

```
/auth/login:
  → Email input
  → "Send me a login link" button
  → On submit: supabase.auth.signInWithOtp({ email })
  → Show: "Check your email — link expires in 10 minutes"

/auth/callback:
  → Handle Supabase auth callback
  → On new user: redirect to /onboarding
  → On returning user: redirect to /dashboard

/onboarding (first login only):
  → "What's your name?" (text)
  → "What's your primary role?" (BA/QA/PO/PM/Data Steward/Change Manager/Other)
  → "What organisation are you from?" (text, optional)
  → "Create your first project" → /dashboard
```

---

## 8. EXECUTION ORDER

Build in this exact sequence:

```
Step 1:  Initialize Next.js 14 project with TypeScript + Tailwind
Step 2:  Configure Supabase project, run schema migrations
Step 3:  Configure Tailwind with full brand palette
Step 4:  Build auth flow (login + callback + onboarding)
Step 5:  Build app shell (AppShell, Sidebar, Topbar)
Step 6:  Build dashboard (project list + create project)
Step 7:  Build project overview page (radar chart placeholder)
Step 8:  Build Claude API routes (/api/ai/coach, /api/ai/eval, /api/ai/feedback)
Step 9:  Build FieldWithCoach component (core reusable pattern)
Step 10: Build Readiness Diagnostic (DiagnosticWizard + scoring + radar)
Step 11: Build Practitioner Workbench — Job Aid 1 (Hypothesis Builder) first
         (this is the most-used artifact and validates the FieldWithCoach pattern)
Step 12: Build remaining Workbench job aids (2, 3, 4)
Step 13: Build Ceremony Facilitator — Meridian Baseline Session first
         (produces the meridian that all other ceremonies reference)
Step 14: Build remaining ceremonies (Hypothesis Framing, Standup, Eval Review, Gate, Drift Watch)
Step 15: Build Eval Scorer (requires meridian from Step 13)
Step 16: Build PDF export for all artifacts (react-pdf)
Step 17: Build team mode (project_members, invite code, Supabase Realtime)
Step 18: Build landing page
Step 19: Connect compass.legacyforward.ai subdomain on Vercel
Step 20: End-to-end test: solo user completes full diagnostic → ceremony → workbench → eval
```

---

## 9. CLAUDE API ROUTES

### /api/ai/coach (POST)
```typescript
// Request
{ field_name: string, field_value: string, aid_type: string, context: string }

// Response (streamed)
{ feedback: string }  // max 100 words, specific and actionable

// Rate limit: 10 requests per user per minute
// Model: claude-sonnet-4-20250514
// Max tokens: 200
```

### /api/ai/eval (POST)
```typescript
// Request
{
  meridian: { acceptable: string[], unacceptable: string[], risk_class: string, threshold: number },
  criteria: { name: string, weight: number }[],
  output: string
}

// Response (JSON, not streamed)
{
  scores: { [criterion: string]: number },
  overall: number,
  rationale: string,
  flag: 'ACCEPTABLE' | 'BORDERLINE' | 'UNACCEPTABLE'
}

// Model: claude-sonnet-4-20250514
// Max tokens: 400
// Parse response as JSON — instruct model to return JSON only
```

### /api/ai/feedback (POST)
```typescript
// Request
{ ceremony_type: string, step: string, content: string, context: string }

// Response (streamed)
{ feedback: string }  // 2–3 sentences, ceremony-specific

// Used in ceremony facilitator steps where Claude reviews completed content
```

### Error handling for all AI routes:
```typescript
// Always return a graceful fallback if Claude API fails
// Never let AI failure block form submission
// Log errors but show user: "AI coaching temporarily unavailable —
// your work has been saved."
```

---

## 10. TEAM MODE

When a project is set to team mode:

```
- Owner generates an invite code (6 characters, URL-safe)
- Share link: compass.legacyforward.ai/join/[invite_code]
- Joining member: if authenticated → auto-added to project_members
                  if not → auth first, then join
- Supabase Realtime: subscribe to changes on ceremonies and job_aids tables
  for this project_id
- Presence indicator: show online team members in Topbar (avatars)
- Collaborative editing: last-write-wins for v1 (no conflict resolution)
- Note visible in UI: "Team mode — multiple people can edit this project.
  Last save wins."
```

---

## 11. EXPORT SPECIFICATION

All artifacts export as branded PDFs using react-pdf.

```
PDF template structure (all artifacts):
  Header:  LegacyForward™ logo (text) | Meridian Compass | artifact type | date
  Content: artifact fields in clean two-column layout
  Footer:  "Generated by Meridian Compass | compass.legacyforward.ai | © 2026 LegacyForward"
           "The Meridian Method™ is a trademark of LegacyForward."

Artifact-specific layouts:
  Hypothesis:      Full job aid 1 card format
  Test Plan:       Four-section checklist with completion status
  Sprint Planner:  Two-column planning card
  RAG Readiness:   Four-section checklist with BLOCKER flags highlighted
  Eval Report:     Summary + scores table + distribution + gate recommendation
  Ceremony Record: Ceremony name + step outputs + Claude feedback + outcome
```

---

## 12. COST MANAGEMENT

The tool is free. Claude API calls cost money. Manage carefully.

```
Rate limits per user:
  - Coach feedback: 10 calls/minute, 100 calls/day
  - Eval scoring: 5 calls/minute, 50 calls/day (heavier calls)
  - Ceremony feedback: 3 calls per ceremony session

Token limits:
  - Coach: max_tokens: 200
  - Eval:  max_tokens: 400
  - Feedback: max_tokens: 300

Caching:
  - Cache eval scores for identical (meridian + criteria + output) combinations
  - Cache coach feedback for identical field values (user gets same feedback
    if they submit the same text)
  - Use Supabase as cache store — check before calling API

Cost estimation at scale:
  - 1,000 daily active users
  - Average 5 coach calls + 2 eval calls per session
  - At Sonnet pricing: approximately $15–25/day
  - Acceptable for a free lead generation tool at this scale
  - Add usage tracking from day 1 so you can see cost per user
```

---

## 13. ANALYTICS & LEAD CAPTURE

The tool is free but it is a funnel. Track everything.

```
Events to track (use Vercel Analytics + custom events):
  - diagnostic_completed (+ gap scores)
  - ceremony_started (+ type)
  - ceremony_completed (+ type)
  - job_aid_created (+ type)
  - eval_session_run (+ score + gate_decision)
  - pdf_exported (+ artifact type)
  - upgrade_cta_clicked (link to legacyforward.ai/allied-skills)

Lead capture touchpoints:
  1. After diagnostic: "Want to close these gaps faster?
     See the LLM Allied Skills Program →" (link)
  2. After first ceremony: "Running Meridian on a real project?
     Get certified →" (link)
  3. After first eval: "Your team scored X%. The training program
     teaches practitioners to reach 85%+ →" (link)
  4. On PDF export: footer links to legacyforward.ai

Email capture:
  - Required for login (magic link)
  - On diagnostic completion: offer to email the gap report
    (captures email for non-logged-in users in future)
```

---

## 14. v2 ROADMAP (do not build now — document for later)

```
v2 features:
  - Automated Drift Watch via webhook (model providers send update notifications)
  - Batch eval (upload CSV of outputs, score all at once)
  - Cohort dashboard (facilitator sees all enrolled practitioners' progress)
  - Credential issuance (auto-generate LLM Allied Skills certificate on capstone)
  - API access (enterprises integrate Compass into their delivery toolchain)
  - Slack / Teams integration (Calibration Standup via bot)
  - LMS integration (SCORM export for enterprise LMS)
```

---

END OF PROMPT

This prompt is self-contained. Claude Code should scaffold the full Meridian Compass
tool from this document. The execution order in Section 8 is the critical path —
do not skip steps or build out of sequence.

Generated: March 23, 2026 | LegacyForward™ | compass.legacyforward.ai
