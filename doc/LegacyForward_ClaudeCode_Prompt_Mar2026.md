# CLAUDE CODE SCAFFOLDING PROMPT
# legacyforward.ai — Full Website Build
# Version: 1.0 | Date: March 23, 2026
# Author: Rajesh | LegacyForward™
#
# INSTRUCTIONS FOR USE:
# Paste this entire prompt into Claude Code at the start of a new session.
# Claude Code will scaffold the full site. Review each page before committing.
# Do not truncate or summarize this prompt — every section is load-bearing.

---

You are building the production website for **legacyforward.ai** — a consulting and IP business
founded by a practicing Enterprise Architect and Cloud/AI practitioner. The business has two
flagship IP assets:

1. **The Meridian Method™** — a calibration-first delivery methodology for LLM integration in
   legacy enterprise environments, replacing Agile for probabilistic systems.
2. **LLM Allied Skills Program** — a 6-session blended practitioner training program for
   Business Analysts, Quality Analysts, Product Owners, Project Managers, Data Stewards, and
   Change Managers working on LLM projects.

The site must be production-quality, fully responsive, accessible (WCAG 2.1 AA), and deployable
to a static host (Vercel, Netlify, or GitHub Pages). Use **Next.js 14 with App Router** and
**Tailwind CSS**. No UI component library — custom components only, built to the brand spec below.

---

## 1. BRAND SYSTEM

### Color Palette
```
--color-navy:      #0D2B4E   /* Primary dark — backgrounds, headers */
--color-blue:      #1B4F8C   /* Primary brand blue */
--color-mid:       #2E75B6   /* Secondary blue — interactive elements */
--color-steel:     #4A90C4   /* Tertiary blue — hover states */
--color-light:     #D6E4F0   /* Light blue — tinted backgrounds */
--color-pale:      #F0F6FB   /* Very light blue — card backgrounds */
--color-gold:      #C8972A   /* Accent — logo, highlights, CTAs */
--color-gold-lt:   #FDF3DC   /* Gold tint — callout backgrounds */
--color-dark:      #1A1A2E   /* Body text */
--color-gray:      #595959   /* Secondary text */
--color-lt-gray:   #F4F6F9   /* Page background */
--color-teal:      #0F6E56   /* Success / data steward accent */
--color-teal-lt:   #E1F5EE   /* Teal tint */
--color-coral:     #993C1D   /* Warning / reset accent */
--color-coral-lt:  #FAECE7   /* Coral tint */
--color-purple:    #3C3489   /* Human judgment / advanced accent */
--color-purp-lt:   #EEEDFE   /* Purple tint */
--color-amber:     #854F0B   /* Caution / gate accent */
--color-amber-lt:  #FAEEDA   /* Amber tint */
```

### Typography
- **Font**: Inter (Google Fonts) — weights 400, 500, 600, 700
- **Headings**: Inter 700, tracked slightly tight (-0.02em)
- **Body**: Inter 400, line-height 1.75, max-width 68ch for readability
- **Monospace**: JetBrains Mono for any code or acronym displays
- **Scale**: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60 / 72px

### Logo Treatment
- Wordmark: **LegacyForward** in Inter 700, color-navy
- Superscript ™ in color-gold
- Tagline beneath (optional): *"Calibration-first. Legacy-ready."*
- Never use an image for the logo — CSS/SVG text only

### Motion
- Transitions: 200ms ease-out for all interactive states
- Scroll animations: fade-up on section entry (Intersection Observer, no library)
- No parallax, no heavy JS animations — performance first

---

## 2. SITE ARCHITECTURE

Build the following pages. Each page spec follows in Section 3.

```
/                          → Home
/meridian-method           → The Meridian Method™ (methodology deep-dive)
/allied-skills             → LLM Allied Skills Program
/about                     → About LegacyForward + Founder
/resources                 → Resources (downloads, white paper, guides)
/contact                   → Contact + Inquiry form
```

### Shared Components (build these first)
```
components/
  Nav.tsx                  → Top navigation, sticky, with mobile hamburger
  Footer.tsx               → Full footer with nav links, legal, copyright
  Button.tsx               → Primary / Secondary / Ghost variants
  SectionHeader.tsx        → Gold underline heading + optional subtitle
  CalloutBox.tsx           → Accent-left callout with label + body
  MeridianBadge.tsx        → The MERIDIAN acronym display component
  RoleCard.tsx             → Role-specific card (BA, QA, PO, PM, DS, CM)
  PhaseCard.tsx            → Meridian phase card (Anchor/Probe/Signal/Gate/Advance-Reset)
  ComparisonTable.tsx      → Waterfall vs Agile vs Meridian table
  SessionCard.tsx          → Training session card with number, title, objective
  JobAidCard.tsx           → Downloadable job aid card with icon + description
  TestimonialCard.tsx      → Placeholder testimonial card (lorem for now)
  ContactForm.tsx          → Name, email, org, role, message, submit
```

---

## 3. PAGE SPECIFICATIONS

---

### PAGE: / (Home)

**Goal**: Make a visitor in the first 10 seconds understand the problem, feel it, and want to
know more. Do not lead with services. Lead with the insight.

#### Hero Section
- Full-width, dark navy background (#0D2B4E)
- Headline (H1, white, 60px):
  **"Your LLM projects are failing where no one is looking."**
- Subheadline (H2, #8AAFD4, 24px, max-width 640px):
  *"Not in engineering. In the room next to engineering — where the BAs, QAs, PMs, and product
  owners are still using mental models built for deterministic systems."*
- Two CTAs side by side:
  - Primary (gold filled): "Explore the Meridian Method™"  → /meridian-method
  - Secondary (white outline): "View the Training Program"  → /allied-skills
- Below CTAs, small text in #6090B0:
  *"The Meridian Method™ is a registered trademark of LegacyForward."*
- Background: subtle grid pattern using CSS (1px navy-700 lines, 5% opacity) — no image

#### Problem Statement Section
- White background
- SectionHeader: "The Allied Skills Gap"
- Three-column layout (stacks to single on mobile):
  - **Column 1** — Icon: document/spec. Heading: "The BA problem". Body: "Requirements like
    'the system shall accurately summarize' are unverifiable when the system is probabilistic.
    Acceptance criteria written for deterministic outputs will never close on a generative feature."
  - **Column 2** — Icon: test/check. Heading: "The QA problem". Body: "Exact-match regression
    fails silently on LLM systems. A model update can degrade behavior with no code change, no
    deployment, and no test failure. Your green suite means nothing."
  - **Column 3** — Icon: chart/velocity. Heading: "The PM problem". Body: "Story point velocity
    does not apply to eval-driven development. LLM quality follows an S-curve. Sprint forecasts
    built on early velocity will be consistently, expensively wrong."
- Below columns, full-width callout in pale blue (#F0F6FB):
  *"This is not a skills training problem. It is a methodology problem. Agile was not designed
  for probabilistic systems. Neither were the roles that operate inside it."*

#### The Hypothesis Section
- Light gray background (#F4F6F9)
- SectionHeader: "The Hypothesis"
- Large blockquote, centered, navy text, gold left border:
  *"LLM adoption in legacy enterprises will fail primarily because of skill gaps in non-engineering
  roles — not in engineering — and current enablement investments are almost entirely misdirected."*
- Below: two columns
  - Left: "What this means for your organization" + 3 bullet points:
    - Pilots that pass engineering review and fail in delivery
    - Regression that is invisible until it surfaces in production
    - Stakeholder confidence lost to failures no one can explain
  - Right: "What LegacyForward does about it" + 3 bullet points:
    - The Meridian Method™ — a purpose-built delivery methodology
    - LLM Allied Skills Program — role-specific practitioner training
    - Consulting engagements for legacy enterprise LLM transformation

#### MERIDIAN Acronym Section
- Navy background
- SectionHeader in white/gold: "The Meridian Method™"
- Subtitle: "Measurement-first. Eval-driven. Role-embedded. Iterative. Distributed. Incremental.
  Adaptive. Non-deterministic."
- Use MeridianBadge component — 8 cards in 4x2 grid (2x4 on mobile):
  Each card: large gold letter | navy text principle title | white subtitle phrase
  ```
  M — Measurement-first     | Measure before you build
  E — Eval-driven cycles    | Eval drives progress
  R — Role-embedded         | Role-embedded calibration
  I — Iterative confidence  | Iterative confidence cycles
  D — Distributed           | Defined thresholds, not binary done
  I — Incremental           | Incremental trust building
  A — Adaptive              | Adaptive hypothesis framing
  N — Non-deterministic     | Non-deterministic by design
  ```
- CTA below: "Read the full methodology" → /meridian-method

#### Who This Is For Section
- White background
- SectionHeader: "Built for the practitioners surrounding the engineering team"
- 6 RoleCards in 3x2 grid (2x3 tablet, 1x6 mobile):
  Use RoleCard component — each card has:
  - Role name (bold, navy)
  - "Primary gap" — one sentence
  - "Meridian ceremony owned" — one line in teal
  ```
  Business Analyst    | Writing acceptance criteria for probabilistic outputs | Hypothesis Framing
  Quality Analyst     | LLM eval design and behavioral regression monitoring  | Signal + Drift Watch
  Product Owner       | Embedded human judgment, not end-of-sprint reviewer  | Meridian Gate
  Project Manager     | Calibration cadence, not story point velocity         | Calibration Standup
  Data Steward        | Retrieval quality is upstream of model quality         | Anchor phase
  Change Manager      | Communicating probabilistic behavior to users          | Drift Watch comms
  ```

#### Social Proof / Credibility Bar
- Light background, simple horizontal layout
- Text: "Framework developed across enterprise architecture, multi-cloud AI governance,
  and legacy modernization spanning regulated industries."
- Three credential badges (text only, gold border):
  - GCP Professional Cloud Architect
  - AWS ML Engineer
  - Architecture Review Board Co-Chair (regulated industry)

#### Final CTA Section
- Navy background, centered
- Heading: "The methodology exists. The training program exists. The path is mapped."
- Subtext: "The only question is whether your organization will invest in the people
  surrounding the engineers."
- Two CTAs: "Explore the Meridian Method™" | "Contact LegacyForward"

---

### PAGE: /meridian-method

**Goal**: Establish the methodology as rigorous, defensible, and distinct from Agile.
A skeptical CTO should leave this page either convinced or wanting a conversation.

#### Hero
- Navy hero, same grid pattern as home
- H1: "The Meridian Method™"
- H2: "A calibration-first delivery methodology for LLM integration in legacy enterprise environments."
- Subtitle line: "Designed for systems that cannot behave the same way twice."
- Single CTA: "Download the White Paper" → /resources

#### The Core Claim Section
- White background
- CalloutBox (gold accent):
  Label: "THE HYPOTHESIS"
  Body: "Agile did not replace Waterfall. It accelerated it. Both share foundational assumptions
  that are categorically false for generative AI systems. The Meridian Method replaces those
  assumptions with a calibration-first model in which human judgment is the fixed reference
  point from which all system behavior is measured."

#### Five Broken Assumptions Section
- Alternating white / pale-blue rows, each row is a full-width section
- For each assumption, show:
  - Assumption number (large gold numeral)
  - "What Agile assumes" (gray text)
  - "Why it breaks" (navy text, slightly larger)
  - CalloutBox (coral accent) with the failure consequence
  ```
  1. Requirements precede build
     → LLM output cannot be fully specified before it is observed. Spec and build are concurrent.

  2. Done is binary
     → LLM output is a distribution, not a value. Features occupy confidence bands, not pass/fail states.

  3. Velocity is estimable
     → LLM quality follows an S-curve. Early gains are fast; the final 10–15% is disproportionately expensive.

  4. Regression is additive
     → Model updates, corpus changes, and prompt modifications can silently degrade behavior with no code change.

  5. The team builds; the customer accepts
     → Human judgment must be embedded throughout, not staged at sprint review.
  ```

#### Comparison Table Section
- White background
- SectionHeader: "Waterfall vs Agile vs The Meridian Method™"
- ComparisonTable component — full width, 4 columns:
  Dimension | Waterfall | Agile | Meridian Method™ (gold header)
  Rows (10 rows):
  ```
  Unit of work           | Requirement doc   | User story           | Behavioral hypothesis
  Completion signal      | Signed deliverable | Definition of Done   | Confidence Gate
  Progress measure       | Milestones        | Velocity             | Calibration delta
  Requirements timing    | Before build      | Sprint start         | Concurrent with build
  Human judgment role    | Phase-gate sign-off| Sprint review        | First-class instrument throughout
  Regression model       | Additive suite    | Additive automated   | Behavioral regression monitoring
  Legacy environment fit | Poor              | Partial              | Designed for legacy
  Team structure         | Siloed by phase   | Cross-functional     | Calibration-integrated
  Model update handling  | N/A               | N/A                  | Mandatory re-calibration trigger
  Primary IP home        | PMI / PMBOK       | Scrum Alliance / SAFe| LegacyForward™
  ```

#### The Meridian Cycle Section
- Navy background
- SectionHeader in white: "The Meridian Cycle"
- Subtitle: "Five phases. One question throughout: how far are we from the meridian?"
- Five PhaseCards in horizontal flow (wraps to 2+3 on tablet, stacked on mobile):
  Each card: colored top bar | phase name | one-line description | "replaces:" line in gray
  ```
  ANCHOR  (purple)  | Establish human meridian baseline       | replaces: Sprint 0
  PROBE   (teal)    | Behavioral hypothesis sprint            | replaces: Sprint planning
  SIGNAL  (mid)     | Eval scoring vs. meridian              | replaces: Sprint review
  GATE    (gold)    | Human calibration check                | replaces: Release gate
  ADVANCE / RESET (navy/coral split) | Progress or re-hypothesis | replaces: Retrospective
  ```
- Below cards, full-width note in pale:
  "Drift Watch — continuous. Monitors behavioral regression across all system changes:
  model updates, corpus edits, prompt modifications. No Agile equivalent."

#### The Six Ceremonies Section
- White background
- SectionHeader: "Six Ceremonies. Every Role Has a Job."
- Accordion or expandable cards — one per ceremony:
  ```
  Meridian Baseline Session  | Before build. Human judges document acceptable vs unacceptable outputs.
  Hypothesis Framing         | Sprint start. Feature intent → testable behavioral hypothesis.
  Calibration Standup        | Daily. Signal observed vs. meridian — not what did you do.
  Eval Review                | End of cycle. Scores reviewed. Advance, reset, or retire.
  Meridian Gate              | Release decision. Human judges confirm quality is real.
  Drift Watch                | Continuous. No Agile equivalent.
  ```

#### IP & Licensing Section
- Light gray background
- SectionHeader: "Licensing"
- Three cards side by side:
  - **Practitioner License** — included with Allied Skills Program enrollment
  - **Organizational License** — $25,000–$60,000/year, train-the-trainer included
  - **Delivery Partner License** — $40,000–$80,000/year + rev share, co-branding rights
- CTA: "Enquire about licensing" → /contact

---

### PAGE: /allied-skills

**Goal**: Convince an L&D head or delivery lead to run the program. Show rigor, specificity,
and that this is not generic AI literacy.

#### Hero
- Blue (#1B4F8C) background
- H1: "LLM Allied Skills Program"
- H2: "Role-specific fluency for the practitioners surrounding the engineering team."
- Subtitle: "6 sessions. 4 job aids. 6 roles. One capstone. One credential."

#### The Distinction Section
- White background
- Two-column side by side:
  Left column (coral tint, ✗ header):
  **"Generic AI literacy asks:"**
  - What is an LLM?
  - How does RAG work?
  - What is a token?

  Right column (teal tint, ✓ header):
  **"LLM Allied Skills asks:"**
  - How do I write an acceptance criterion when the output is probabilistic? *(BA)*
  - How do I build a regression suite for a system that is not deterministic? *(QA)*
  - How do I scope a story when I cannot predict what the model will return? *(PO)*
  - How do I plan a sprint when progress is measured by eval scores? *(PM)*
  - How do I assess retrieval quality and who owns it when it degrades? *(Data Steward)*
  - How do I communicate system behavior when it can change without a deployment? *(CM)*

#### Six Sessions Section
- Light gray background
- SectionHeader: "The Program"
- 6 SessionCards in 2x3 grid (1x6 mobile):
  Each card: session number (large gold) | title | duration | core question | job aid produced
  ```
  1 | Foundational Fluency      | Weeks 1–3  | How does an LLM work, and why does my practice break?    | Mental model checklist
  2 | Specification & Scoping   | Weeks 4–6  | How do I write requirements for probabilistic outputs?    | LLM Acceptance Criteria Template
  3 | Testing & Validation      | Weeks 7–10 | How do I test a system I cannot fully predict?           | LLM Test Design Playbook
  4 | Delivery & Iteration      | Weeks 11–14| How do I run a project when velocity is non-linear?      | Meridian Sprint Planner
  5 | Data & Retrieval Quality  | Weeks 15–18| Why does my LLM give different answers to the same question? | RAG Readiness Checklist
  6 | Change, Governance & Capstone | Weeks 19–24 | How do I govern a system that can change without a deployment? | Full Job Aid Library + Credential
  ```

#### Four Job Aids Section
- Navy background
- SectionHeader in white/gold: "Four Job Aids. Designed for Live Projects."
- Subtitle: "These are tools, not reading material. Every participant leaves with artifacts
  they use in their next sprint."
- 4 JobAidCards in 2x2 grid:
  ```
  📋 LLM Acceptance Criteria Template  | For BAs and POs | Replaces the traditional acceptance criterion
  📋 LLM Test Design Playbook          | For QAs         | 4-dimension checklist: coverage, hallucination, regression, eval
  📋 Meridian Sprint Planner           | For PMs         | Replaces the sprint planning board for LLM feature work
  📋 RAG Readiness Assessment          | For Data Stewards| Corpus readiness before any Probe cycle begins
  ```
- Below: "Download a sample job aid" → /resources (links to free download)

#### Delivery Model Section
- White background
- Three columns:
  - **Format**: Blended — reading, group exercises, individual reflection
  - **Duration**: Multi-session across 6 weeks minimum, up to 24 weeks for full program
  - **Cohort size**: 15–25 practitioners, cross-functional groups

#### Markets Section
- Two-column, pale background
- Left: **USA Market**
  - Target: Enterprise L&D, digital transformation leads, regulated industry enterprises, system integrators
  - Pricing: $45,000–$65,000 pilot | $120,000–$180,000 full program
  - SI white-label licensing available
- Right: **India Market**
  - Target: Tier 1 IT services firms (delivery excellence heads), Indian BFSI and healthcare
  - Pricing: ₹15,000–₹35,000/seat for B2B cohorts | ₹4,999–₹9,999 individual track
  - IndiaAI Mission framework alignment

#### Credential Section
- Gold tint background
- SectionHeader: "LLM Allied Skills Certified Practitioner™"
- Details:
  - Issued by: LegacyForward
  - Role-specific tracks: BA / QA / PO / PM / Data Steward / Change Manager
  - Assessment: Meridian Method™ Practitioner Assessment + job aid submission
  - Renewal: Annual — requires evidence of active Meridian participation
- CTA: "Enquire about the program" → /contact

---

### PAGE: /about

**Goal**: Establish founder credibility without sounding like a resume.
The story should make the methodology feel inevitable — not invented.

#### Hero
- Navy background
- H1: "About LegacyForward"
- H2: "Built at the intersection of enterprise architecture and enterprise AI adoption."

#### Founder Section
- White background, two-column:
  Left: placeholder headshot area (CSS avatar with initials — no stock photo)
  Right: narrative text

  **Narrative** (write exactly this, in paragraphs):

  "LegacyForward was founded by a practicing enterprise architect with over fifteen years
  of experience governing technology adoption in some of the most complex legacy environments
  in the world — large regulated enterprises with deep institutional constraints.

  The Meridian Method™ was not invented in a whiteboard session. It emerged from watching
  well-resourced, technically capable LLM projects fail repeatedly — not in engineering, but in
  the delivery infrastructure surrounding it. In Architecture Review Boards. In requirements
  sessions. In QA sign-offs. In sprint reviews where human judgment walked in too late.

  The allied skills gap is not theoretical. It is observable in every enterprise LLM pilot that
  passes technical review and then quietly disappears six months later.

  LegacyForward exists to close that gap — through a methodology that names the problem
  precisely, and a training program that gives practitioners the role-specific fluency to
  actually work inside it."

#### Credentials Section
- Light gray background
- SectionHeader: "Credentials & Context"
- Two columns, clean list format:
  Left — Certifications:
  - GCP Professional Cloud Architect
  - AWS ML Engineer
  - Ready Tensor Agentic AI (in progress)
  - NIST AI RMF Practitioner (in progress)
  - FinOps Foundation AI (in progress)

  Right — Experience context:
  - Enterprise AI governance in regulated industries
  - Architecture Review Board Co-Chair
  - Enterprise AI/ML adoption governance
  - Multi-cloud architecture (GCP, AWS)
  - Legacy modernization in regulated environments

#### The Why Section
- Navy background, centered, constrained width (max 720px)
- Pull quote in white, large (30px), gold left bar:
  *"The model is not the risk. We are the risk. And we are also the fix."*
- Attribution: Rajesh, LegacyForward Speaking Guide, March 2026

---

### PAGE: /resources

**Goal**: Demonstrate intellectual depth. Give enough away that visitors trust the IP.
Gate the full documents behind a simple email form.

#### Hero
- Blue background
- H1: "Resources"
- H2: "The methodology is documented. The training program is structured. Start here."

#### Free Downloads Section
- White background
- SectionHeader: "Free Resources"
- 3 resource cards with download/request buttons:
  ```
  📄 The Meridian Method™ White Paper
     "Why Agile breaks on LLM projects and what to do about it."
     Format: PDF | 6 sections | March 2026
     CTA: "Request the white paper" → triggers email capture modal

  📄 LLM Allied Skills — Program Overview
     "The business case, role gap map, and 6-month program skeleton."
     Format: PDF | 9 sections | March 2026
     CTA: "Download the overview" → triggers email capture modal

  📄 Sample Job Aid — LLM Acceptance Criteria Template
     "The BA/PO template that replaces the traditional acceptance criterion."
     Format: PDF | 1 page | March 2026
     CTA: "Download free" → direct download (no gate)
  ```

#### Email Capture Modal
- Simple modal: Name | Email | Organization | Role (dropdown) | Submit
- On submit: show thank-you message, trigger download
- Store submissions: use a simple form service (Formspree or similar)
- No complex backend required for v1

#### Paid / Program Documents Section
- Light gray background
- SectionHeader: "Program Documents"
- Note: "Full program documents are provided to enrolled cohorts and licensed partners."
- Two cards (locked state):
  - LLM Allied Skills Participant Guide — 6 sessions, 4 job aids, capstone
  - Meridian Method™ Licensing Package — ceremonies, IP framework, certification

#### Speaking Resources Section
- Pale blue background
- One card:
  "Available for keynotes, workshops, and practitioner sessions on LLM delivery methodology,
  enterprise AI adoption, and the allied skills gap."
  CTA: "Enquire about speaking" → /contact

---

### PAGE: /contact

**Goal**: Low friction. One form. Clear expectations about response time.

#### Hero
- Navy background, minimal
- H1: "Contact LegacyForward"
- H2: "Enquiries for training programs, methodology licensing, consulting, and speaking."

#### Contact Form Section
- White background, centered, max-width 640px
- ContactForm component:
  ```
  Full name *
  Email address *
  Organization *
  Your role * (dropdown: BA | QA | PM/PO | Data Steward | Change Manager | L&D / HR |
               CIO / CTO / Transformation Lead | Consulting / SI | Other)
  Enquiry type * (dropdown: Training program | Methodology licensing | Consulting engagement |
                  Speaking / keynote | General enquiry)
  Message (textarea, min 3 rows)
  Submit button (gold, full width)
  ```
- Below form: "Expected response: within 2 business days."
- Privacy note: "Your information is used only to respond to your enquiry."

#### Alternative Contact Section
- Light gray, simple
- Email: hello@legacyforward.ai
- LinkedIn: linkedin.com/in/[founder] (placeholder)
- Note: "LegacyForward operates across the USA and India."

---

## 4. NAVIGATION SPECIFICATION

### Top Navigation (Nav.tsx)
- Sticky, white background with gold bottom border (1px, #C8972A)
- Left: LegacyForward™ wordmark (navy + gold ™)
- Center: navigation links
  - The Meridian Method™
  - Allied Skills Program
  - Resources
  - About
- Right: CTA button "Contact Us" (gold, small)
- Mobile: hamburger → full-screen overlay with links stacked

### Footer (Footer.tsx)
- Navy background
- Four columns:
  - **LegacyForward** — tagline + copyright
  - **Methodology** — links: Meridian Method, Why Agile Breaks, Licensing
  - **Program** — links: Allied Skills, Sessions, Job Aids, Credential
  - **Company** — links: About, Resources, Contact
- Bottom bar: "© 2026 LegacyForward. The Meridian Method™ is a trademark of LegacyForward.
  All rights reserved."
- Secondary line: "Developed in the USA. Delivered globally."

---

## 5. TECHNICAL REQUIREMENTS

### Stack
```
Framework:     Next.js 14 (App Router)
Styling:       Tailwind CSS (custom config — extend with brand palette)
Language:      TypeScript throughout
Fonts:         next/font with Inter + JetBrains Mono from Google
Icons:         Lucide React (no custom icon library)
Forms:         React Hook Form + Zod validation
Email:         Formspree (no backend required for v1)
Deployment:    Vercel (preferred) or Netlify
Analytics:     Vercel Analytics (privacy-friendly, no cookie banner needed)
```

### File Structure
```
legacyforward.ai/
├── app/
│   ├── layout.tsx              → Root layout, Nav + Footer
│   ├── page.tsx                → Home
│   ├── meridian-method/
│   │   └── page.tsx
│   ├── allied-skills/
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── resources/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
├── components/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── Button.tsx
│   ├── SectionHeader.tsx
│   ├── CalloutBox.tsx
│   ├── MeridianBadge.tsx
│   ├── RoleCard.tsx
│   ├── PhaseCard.tsx
│   ├── ComparisonTable.tsx
│   ├── SessionCard.tsx
│   ├── JobAidCard.tsx
│   ├── ContactForm.tsx
│   └── EmailCaptureModal.tsx
├── lib/
│   └── constants.ts            → All brand colors, copy strings, data arrays
├── public/
│   └── downloads/              → Place PDFs here for gated/direct download
├── tailwind.config.ts          → Extended with full brand palette
└── next.config.ts
```

### Tailwind Config Extension
```typescript
// tailwind.config.ts
extend: {
  colors: {
    navy:     '#0D2B4E',
    blue:     '#1B4F8C',
    mid:      '#2E75B6',
    steel:    '#4A90C4',
    light:    '#D6E4F0',
    pale:     '#F0F6FB',
    gold:     '#C8972A',
    'gold-lt':'#FDF3DC',
    dark:     '#1A1A2E',
    teal:     '#0F6E56',
    'teal-lt':'#E1F5EE',
    coral:    '#993C1D',
    'coral-lt':'#FAECE7',
    purple:   '#3C3489',
    'purp-lt':'#EEEDFE',
    amber:    '#854F0B',
    'amber-lt':'#FAEEDA',
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
}
```

### Performance Requirements
- Lighthouse score: ≥ 90 on all four metrics (Performance, Accessibility, Best Practices, SEO)
- LCP: < 2.5s on mobile 4G
- No render-blocking resources
- All images: next/image with explicit width/height
- No CLS from fonts: use next/font with display: swap

### SEO Requirements
```typescript
// Each page must export metadata:
export const metadata: Metadata = {
  title: 'Page Title | LegacyForward',
  description: '< 160 chars, unique per page',
  openGraph: {
    title: '...',
    description: '...',
    url: 'https://legacyforward.ai/[page]',
    siteName: 'LegacyForward',
    type: 'website',
  },
}
```
- robots.txt: allow all
- sitemap.xml: auto-generated via next-sitemap
- Canonical URLs on all pages
- Structured data (Organization schema) on home page

### Accessibility
- All interactive elements: visible focus rings (gold, 2px offset)
- Color contrast: all text meets 4.5:1 minimum
- Skip navigation link (visually hidden, visible on focus)
- All images: meaningful alt text
- Form fields: explicit label associations
- Accordion/modal: ARIA roles and keyboard navigation

---

## 6. CONTENT CONSTANTS (lib/constants.ts)

Define all body copy, card data, and arrays in constants.ts so pages stay clean.
Include the following data arrays at minimum:

```typescript
export const MERIDIAN_LETTERS = [
  { letter: 'M', title: 'Measurement-first',    phrase: 'Measure before you build' },
  { letter: 'E', title: 'Eval-driven cycles',   phrase: 'Eval drives progress' },
  { letter: 'R', title: 'Role-embedded',         phrase: 'Role-embedded calibration' },
  { letter: 'I', title: 'Iterative confidence',  phrase: 'Iterative confidence cycles' },
  { letter: 'D', title: 'Distributed',           phrase: 'Defined thresholds, not binary done' },
  { letter: 'I', title: 'Incremental',           phrase: 'Incremental trust building' },
  { letter: 'A', title: 'Adaptive hypothesis',   phrase: 'Adaptive hypothesis framing' },
  { letter: 'N', title: 'Non-deterministic',     phrase: 'Non-deterministic by design' },
];

export const ROLES = [
  { role: 'Business Analyst',      gap: '...', ceremony: 'Hypothesis Framing',    color: 'blue' },
  { role: 'Quality Analyst',       gap: '...', ceremony: 'Signal + Drift Watch',  color: 'teal' },
  { role: 'Product Owner',         gap: '...', ceremony: 'Meridian Gate',         color: 'mid' },
  { role: 'Project Manager',       gap: '...', ceremony: 'Calibration Standup',   color: 'purple' },
  { role: 'Data Steward',          gap: '...', ceremony: 'Anchor phase',          color: 'teal' },
  { role: 'Change Manager',        gap: '...', ceremony: 'Drift Watch comms',     color: 'coral' },
];

export const SESSIONS = [ /* 6 sessions as specified in /allied-skills */ ];
export const PHASES   = [ /* 5 phases as specified in /meridian-method */ ];
export const CEREMONIES = [ /* 6 ceremonies */ ];
export const JOB_AIDS   = [ /* 4 job aids */ ];
```

---

## 7. EXECUTION ORDER

Build in this sequence. Do not skip ahead.

```
Step 1:  Initialize Next.js 14 project with TypeScript and Tailwind
Step 2:  Configure tailwind.config.ts with full brand palette
Step 3:  Set up next/font for Inter and JetBrains Mono
Step 4:  Build shared components (Nav, Footer, Button, SectionHeader)
Step 5:  Populate lib/constants.ts with all data arrays
Step 6:  Build Home page (/) — full implementation
Step 7:  Build /meridian-method — full implementation
Step 8:  Build /allied-skills — full implementation
Step 9:  Build /about — full implementation
Step 10: Build /resources with email capture modal
Step 11: Build /contact with validated form
Step 12: Add metadata to all pages
Step 13: Add robots.txt and sitemap
Step 14: Run Lighthouse audit and fix any score below 90
Step 15: Final review — check all links, forms, and mobile layouts
```

---

## 8. TONE GUIDANCE FOR ALL COPY

Every sentence on this site must pass three tests:

1. **Would a skeptical CTO push back on this?** If not, it is probably too vague.
2. **Does it name the problem before offering the solution?** Lead with insight, not service.
3. **Is it written for practitioners, not for marketers?** No buzzwords, no "cutting-edge AI
   solutions." Plain, precise, authoritative language only.

The site voice is: *authoritative and measured — the expert in the room who has seen this
problem first-hand and built a rigorous answer to it.*

Never use: "leverage," "synergy," "holistic," "cutting-edge," "next-generation," "robust,"
"seamlessly," "innovative," "world-class," or "empower."

Always use: specific role names, specific methodology names, specific failure modes, specific
consequences. Precision is the brand.

---

## 9. DEPLOYMENT CHECKLIST

Before going live at legacyforward.ai:

- [ ] Domain verified on Vercel / Netlify
- [ ] SSL certificate active (auto via Vercel)
- [ ] Formspree endpoint configured and tested (contact form + email capture)
- [ ] PDF downloads placed in /public/downloads/
- [ ] All metadata titles and descriptions reviewed
- [ ] Sitemap submitted to Google Search Console
- [ ] Lighthouse: ≥ 90 all four metrics
- [ ] Mobile layout tested on iOS Safari and Android Chrome
- [ ] All links tested (no broken hrefs)
- [ ] Footer copyright year: 2026
- [ ] Trademark notices present on all pages that reference The Meridian Method™

---

END OF PROMPT

This prompt is self-contained. Claude Code should be able to scaffold the entire
legacyforward.ai site from this document without additional context. If Claude Code
asks clarifying questions, refer it back to the relevant section above.

Generated: March 23, 2026 | LegacyForward™ | legacyforward.ai
