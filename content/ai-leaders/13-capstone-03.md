---
title: "Evaluating an AI Vendor"
slug: "capstone-evaluating-ai-vendor"
description: "A structured process for selecting an AI vendor: define your requirements before you enter the market, run a rigorous three-vendor evaluation, conduct reference checks that actually reveal problems, and negotiate the contract terms that matter."
section: "ai-leaders"
order: 13
part: "Part 06 Capstones"
badges:
  - "Vendor Management"
  - "Capstone"
---

# Evaluating an AI Vendor

Vendor selection is one of the highest-leverage decisions in an AI program. The wrong vendor does not just delay your timeline. It can compromise your data, lock you into a platform you cannot exit, expose you to liability you did not anticipate, and undermine the organizational credibility of your entire AI program.

The right vendor, on the other hand, can materially accelerate your timeline, provide expertise your team does not yet have, and give you a partner for navigating the regulatory and technical complexity of enterprise AI.

Most organizations do not run a rigorous vendor evaluation process. They issue an RFP, receive proposals, run two or three demos, negotiate price, and make a decision that is more influenced by the quality of the vendor's sales presentation than by the evidence of their capability. This capstone gives you a better process.

---

## Before You Enter the Market

The most important step in vendor evaluation happens before you talk to a single vendor: defining what you need clearly enough that you can evaluate whether a vendor can provide it.

Organizations that skip this step end up evaluating vendors on the vendor's terms — demo scenarios the vendor has optimized, reference customers the vendor has curated, and pricing structures the vendor prefers. Your evaluation should be on your terms.

### Define Requirements in Three Tiers

Organize your requirements into three tiers:

**Tier 1: Mandatory Requirements (Must Have)**

These are the conditions that, if not met, disqualify a vendor regardless of their other capabilities. Be strict about what goes here — if everything is mandatory, nothing is. Typical Tier 1 requirements include:

- Data residency and sovereignty requirements (if you have regulatory or policy constraints on where data can be processed or stored)
- Specific compliance certifications (SOC 2 Type II, FedRAMP, HIPAA Business Associate Agreement, ISO 27001)
- Integration requirements with systems you cannot change (specific ERP, CRM, or data infrastructure)
- Language or regional capability requirements
- Minimum contract terms or financial stability requirements

**Tier 2: Differentiated Requirements (Should Have)**

These are the capabilities that distinguish a strong vendor from an adequate one. Performance here drives the scoring, not qualification. Tier 2 requirements might include:

- Domain expertise in your industry (do they have reference cases in your sector?)
- Quality of the implementation and professional services team (not just the product)
- Model accuracy on your specific task type (not benchmark accuracy — your task)
- Customization capability (can they fine-tune to your data, and what does that cost?)
- Product roadmap alignment (are they investing in the capabilities you will need in 18-24 months?)
- Pricing model flexibility (can they structure pricing around value delivered rather than seat or usage volume?)

**Tier 3: Nice to Have**

Capabilities that would add value but are not decision factors. Document these so you do not inadvertently let them drive the evaluation, but acknowledge them in your recommendation reasoning.

### Define Your Evaluation Criteria and Weights

Before you issue any RFP or make any contact with vendors, write down your evaluation criteria and weights. This document becomes the basis of your scoring and prevents the evaluation from being unconsciously hijacked by whichever vendor makes the best impression in the sales process.

**Example (adapt weights to your situation):**

| Criterion | Weight | Rationale |
|---|---|---|
| Technical capability on our specific task | 25% | This is the core of what we are buying |
| Security and compliance posture | 20% | Non-negotiable exposure given our regulatory context |
| Implementation and professional services quality | 15% | Poor implementation is the primary cause of AI project failure |
| Reference quality in our industry/scale | 15% | We need evidence from comparable deployments, not generic references |
| Pricing and commercial terms | 10% | Important but secondary to capability and fit |
| Vendor financial stability and roadmap | 10% | We are making a multi-year commitment |
| Support and escalation model | 5% | We need to know what happens when things go wrong |

---

## Running the Three-Vendor Evaluation

Three vendors is the right number for a serious evaluation. Two is too few: you cannot establish a credible competitive dynamic or comparison baseline. Four or more is too many: the evaluation becomes so time-consuming that quality drops, and the differences between vendors become meaningless.

### Stage 1: RFP Issuance (Week 1-2)

Your RFP should be structured around your requirements, not around the vendor's standard presentation format. Specifically:

**Section 1: Mandatory Requirements Response**
Require a yes/no response with evidence for each Tier 1 requirement. Vendors who cannot document compliance with Tier 1 requirements are screened out at this stage.

**Section 2: Use Case Demonstration Requirement**
Do not ask for a generic product demo. Ask for a demonstration on a specific scenario from your actual business context. Provide sample data (appropriately anonymized) or a detailed scenario description. The ability to perform on your task, not a curated demo scenario, is what you are evaluating.

**Section 3: Financial Proposal**
Request pricing in a specific format that reflects your expected usage profile. Do not let vendors propose their preferred pricing structure without translation into your expected cost.

**Section 4: Reference Requirements**
Request three references: one customer of similar size in your industry, one customer who has been live for more than 18 months (maturity evidence), and one customer who experienced a significant problem (what the vendor calls a "challenging engagement"). The last category is the most revealing — vendors who refuse to provide a challenging engagement reference are telling you something.

**Section 5: Security and Compliance Documentation**
Require submission of current security certifications, penetration test summary (or attestation), data processing agreement draft, and subprocessor list.

### Stage 2: RFP Evaluation and Shortlist (Week 3)

Score each vendor's RFP response against your evaluation criteria and weights. Have at least three evaluators — you, your technical lead, and a business stakeholder representing the primary user function. Average the scores; note significant divergences in perception and discuss before proceeding.

**RFP Scoring Template:**

| Criterion | Weight | Vendor A Score (1-5) | Vendor A Weighted | Vendor B Score (1-5) | Vendor B Weighted | Vendor C Score (1-5) | Vendor C Weighted |
|---|---|---|---|---|---|---|---|
| Technical capability | 25% | | | | | | |
| Security/compliance | 20% | | | | | | |
| Implementation quality | 15% | | | | | | |
| Reference quality | 15% | | | | | | |
| Pricing/commercial terms | 10% | | | | | | |
| Financial stability/roadmap | 10% | | | | | | |
| Support model | 5% | | | | | | |
| **Total** | 100% | | | | | | |

After scoring, confirm that all three vendors met all Tier 1 requirements. If any did not, they are removed from consideration at this stage regardless of total score.

### Stage 3: Technical Demonstration (Week 4-5)

Run a two-hour structured demonstration with each vendor. The structure should be identical across all three — same scenario, same questions, same evaluation panel — so that you are comparing comparable things.

**Demonstration Structure:**

**Part 1: Your Use Case (60 minutes)**
Vendors demonstrate their solution against your specific scenario using your data or a close facsimile. Your technical lead should run the vendor through edge cases that were not in the prepared scenario — unusual inputs, ambiguous situations, the kind of data you actually encounter. How the vendor handles these edge cases is often more revealing than the curated demo.

**Part 2: Implementation Discussion (30 minutes)**
Questions to ask:
- Who specifically will be on our implementation team, and what is their experience with deployments at our scale?
- What are the three most common causes of implementation failure for customers like us, and how do you mitigate them?
- What does the first 90 days look like, specifically?
- What do you need from us that most customers underestimate?

**Part 3: Support and Escalation (20 minutes)**
- How are production incidents handled?
- What is the escalation path if there is a model quality issue affecting our customers?
- What is your standard SLA for critical issues, and what has been your actual performance against that SLA in the past 12 months?

**Part 4: Challenging Questions (10 minutes)**
Close with the questions that most vendors hope you will not ask:
- What are your three biggest weaknesses or limitations for a customer like us?
- Tell me about a customer who churned or significantly scaled back. What happened?
- Your pricing is [X]. What would need to happen for our costs to be significantly higher than that?

The vendor's willingness and ability to answer these questions honestly is itself an evaluation criterion.

---

## Reference Checks That Actually Reveal Problems

Standard reference checks are largely useless. Vendors curate them for success stories, and reference customers know they are supposed to say positive things. To get useful information, change the format.

### The Three-Question Reference Call

Call each reference with this specific framing: "I'm not looking for a sales pitch — you're already a customer and I'm trying to learn. I want to ask you three specific questions about your real experience."

**Question 1: "What is the one thing you wish you had known before you started that you know now?"**

This question bypasses the instinct to be helpful and positive. People answer it honestly because it invites their real learning, not their verdict on the vendor.

**Question 2: "Describe a moment when you were genuinely frustrated with [vendor]. What happened and how did they handle it?"**

Again, this invites a real story rather than a general assessment. The story — and how the vendor responded — is the data you need.

**Question 3: "If you were starting over, would you make the same choice? What would you do differently?"**

This question often reveals the trade-offs the reference customer made that they wish they had understood better.

Do not accept "everything was great" as an answer. Nobody's implementation was problem-free. If a reference is unwilling or unable to describe a problem, treat that as low-quality intelligence, not positive evidence.

### Additional Reference Intelligence Sources

Beyond vendor-curated references:

- **Community forums and user groups:** Enterprise software communities (G2, TrustRadius, industry Slack groups) contain candid user feedback that vendor references do not.
- **LinkedIn conversations:** A brief message to a person who lists the vendor's product on their LinkedIn profile, asking for a quick call, yields surprisingly candid feedback. They have nothing to sell you.
- **Former vendor employees:** People who have left the vendor organization often have candid views about product quality, customer success commitment, and company direction. Find them on LinkedIn.

---

## Contract Negotiation Points for AI

AI vendor contracts contain terms that do not appear in typical software contracts. Most procurement teams are not familiar with them. Brief your legal team with the following checklist before they begin negotiation.

### Data Ownership and Usage

**The clause to watch:** Many AI vendor agreements permit the vendor to use customer data to train or improve their models. This is often buried in a sub-clause, not a headline term.

**What to require:**
- Explicit prohibition on using your data to train models for other customers
- Clear statement that your data belongs to you and does not become part of the vendor's training corpus
- Data deletion obligations on contract termination, with specific timelines and verification

### Subprocessors

**The clause to watch:** AI vendors often rely on a chain of third-party providers (cloud infrastructure, foundation model providers, data annotation services). Each of these is a data access point.

**What to require:**
- Complete subprocessor list at contract execution
- Notification obligation when subprocessors change (minimum 30 days advance notice)
- Your right to object to new subprocessors with an off-ramp if your objection is not resolved

### Model Performance Obligations

**The clause to watch:** AI vendor contracts typically do not guarantee model accuracy or quality. They guarantee availability and often disclaim liability for model outputs entirely.

**What to negotiate:**
- Minimum accuracy or quality thresholds with defined measurement methodology
- Remedies if the model performance degrades below baseline (additional tuning at no cost; credit; exit right)
- Notification obligation if the vendor modifies the underlying model in ways that may affect performance on your task

### Portability and Exit

**The clause to watch:** AI deployments create significant switching costs over time: fine-tuned models, integrated workflows, trained users. Vendors benefit from this lock-in and may not proactively offer portability.

**What to require:**
- Portability of any fine-tuned model weights you have paid to develop
- Export capability for all data you have provided to the system
- Transition assistance obligations on termination (minimum 90-day transition period with vendor support)
- Termination for convenience right (the ability to exit without cause on reasonable notice — 90 days is standard)

### Liability and Indemnification

**The clause to watch:** Standard AI vendor contracts disclaim virtually all liability for harm resulting from model outputs. If your AI system produces an output that causes customer harm, the vendor's contract likely says it is not their problem.

**What to negotiate:**
- Mutual indemnification for IP infringement (if the vendor's model produces output that infringes third-party IP, the vendor should indemnify you)
- A reasonable liability cap — even if you cannot get uncapped liability, you can often negotiate a cap higher than the standard "fees paid in the prior 12 months" that most vendor contracts default to
- Cyber liability obligations for data breach resulting from vendor negligence

### Price Escalation Controls

**The clause to watch:** AI API pricing has historically been volatile. A contract based on current pricing can expose you to significant cost increases at renewal, particularly as usage grows.

**What to require:**
- Multi-year pricing locks or caps on annual price increases (5-10% cap is achievable with most established vendors)
- Volume pricing tiers that reward growth rather than penalizing it
- Most favored customer clause: if the vendor offers better pricing to a comparable customer, you get the same rate

---

## Scoring the Final Decision

After the technical demonstration and reference checks, run a final scoring round with your evaluation panel. Compare the final scores to the initial RFP scores. Any significant shifts should be discussed and the reasoning documented.

### Final Vendor Comparison

| Criterion | Weight | Vendor A | Vendor B | Vendor C |
|---|---|---|---|---|
| RFP score | | | | |
| Technical demo score | | | | |
| Reference quality score | | | | |
| Adjusted for contract terms | | | | |
| **Final weighted score** | | | | |
| **Rank** | | | | |

Adjust the score for contract terms — if one vendor produced significantly better contract terms, that should influence the final comparison, not just the price.

### The Recommendation Document

Write a one-to-two page recommendation document before you present the decision to the approving executive or committee. The document should include:

1. Summary of evaluation process (who was evaluated, what criteria were used)
2. Summary scores for all three vendors
3. Key differentiating factors (the two or three things that most meaningfully separated the final choice from the alternatives)
4. Primary risks with the recommended vendor and mitigations
5. Key contract terms negotiated
6. Explicit statement: "We recommend [Vendor X] for the following reasons, and we are confident in this recommendation because..."

The discipline of writing this document often surfaces second thoughts or unconsidered risks before the contract is signed, while it is still easy to change direction.

---

## Common Vendor Evaluation Failures

| Failure Mode | How It Happens | Prevention |
|---|---|---|
| Evaluating on vendor terms | Vendors drive the demo agenda and reference list | Define your evaluation criteria and use case before any vendor contact |
| Reference bias | Vendors provide only success story references | Ask specifically for challenging engagement references; supplement with independent research |
| Pilot performance ≠ production performance | Vendor pilots are staged for success | Run pilots on your real data, with your real edge cases, by your real users |
| Contract surprises | Procurement reviews standard commercial terms; AI-specific terms are missed | Brief legal team on AI-specific contract checklist before negotiations begin |
| Single evaluator | One person's relationship with a vendor sales rep drives the decision | Three-person evaluation panel; averaged scores with documented reasoning |
| Recency bias | The last vendor to present wins | Score each vendor immediately after demonstration; avoid side-by-side comparison that relies on memory |

---

## Key Takeaways

- Define your requirements — Tier 1 mandatory, Tier 2 differentiated, Tier 3 nice-to-have — before engaging any vendor. Evaluating on your terms, not theirs, is the most important leverage in this process.
- Three vendors is the right number: enough for genuine competitive comparison, few enough for rigorous evaluation.
- Stage the evaluation: RFP and scoring, then technical demonstration on your scenario with your data, then reference checks.
- Reference checks only produce useful information if you change the format: ask about what they wish they had known, ask for a frustration story, ask if they would do it again.
- AI contracts contain terms that standard procurement processes miss: data training rights, subprocessor chains, model performance obligations, portability and exit terms. Brief your legal team specifically on these before negotiation.
- Write a formal recommendation document before presenting the decision — the discipline of writing it surfaces risks and second thoughts while you can still act on them.
