---
title: "Capstone: AI Feature Pricing Decision"
slug: "capstone-ai-feature-pricing"
description: "A worked example in pricing under cost pressure: your AI-powered document analysis feature costs $0.50 per document in API calls. You charge customers $29/month for unlimited use. Walk through the cost analysis, usage modeling, tier design, stakeholder communication, and A/B test design needed to make the right call."
section: "ai-pm"
order: 14
part: "Part 06 Capstones"
badges:
  - "Capstone"
  - "Applied Framework"
---

# Capstone: AI Feature Pricing Decision

## The Scenario


![Diagram](/diagrams/ai-pm/capstone-02.svg)
You are the PM for **Paragon**, a document management SaaS platform serving 3,200 paying customers. Your flagship AI feature — document analysis, which extracts key clauses, flags risks, and generates summaries for legal and procurement documents — launched six months ago.

The pricing was set optimistically: unlimited document analysis is included in your $29/month Professional plan and your $89/month Business plan.

The VP of Finance sends you a message:

> "Our AI infrastructure costs hit $47,000 last month. Professional plan revenue for the same period was $68,960 (2,378 customers × $29). After support, infrastructure overhead, and the $47K AI cost, Professional is operating at negative margin. We need to fix this."

Your job: figure out what to do.

---

## Step 1: Cost Analysis Framework

Before deciding anything, understand exactly what you are dealing with.

### The Full Cost Picture

**Monthly AI cost breakdown (last month):**

| Component | Monthly cost | % of total |
|---|---|---|
| Model inference (input + output tokens) | $31,200 | 66% |
| Document parsing and pre-processing | $8,400 | 18% |
| Vector storage and retrieval | $4,700 | 10% |
| Monitoring and logging overhead | $2,700 | 6% |
| **Total** | **$47,000** | **100%** |

**Usage analysis:**

Pull usage data segmented by customer. You find:

| Percentile | Documents analyzed/month | Monthly AI cost/customer |
|---|---|---|
| P50 (median) | 12 | $6.00 |
| P75 | 38 | $19.00 |
| P90 | 95 | $47.50 |
| P95 | 180 | $90.00 |
| P99 | 610 | $305.00 |

**Interpretation**: The median Professional customer costs you $6/month in AI against their $29 in revenue. That is fine. Your P99 customers are costing you $305/month against their $29 revenue. That is a catastrophic unit economics failure. And the top 1% (24 customers) are consuming a disproportionate share of your $47K monthly cost.

**What does the tail look like?**

Pull the top 50 customers by AI usage. Investigate what they are doing:
- Several are running automated batch uploads through your API, hundreds of documents per day
- Some are legal teams processing entire contract repositories
- A few appear to be using your product as a backend for their own client-facing tools

This matters for your response. The automated API users are not your intended user profile and are exploiting an "unlimited" promise that was priced for human use patterns.

### The Revenue Math

| Plan tier | Customers | Monthly revenue | Monthly AI cost | AI cost as % of revenue |
|---|---|---|---|---|
| Professional ($29/mo) | 2,378 | $68,962 | $35,670 (est.) | 52% |
| Business ($89/mo) | 822 | $73,158 | $11,330 (est.) | 15% |
| **Total** | **3,200** | **$142,120** | **$47,000** | **33%** |

**Key insight**: Business plan AI economics are fine at 15% of revenue. Professional plan economics are broken at 52%. The problem is concentrated in one tier and amplified by a small number of heavy users.

---

## Step 2: Usage Modeling and Tier Design

You have several options. Evaluate each against cost, user experience, and competitive positioning.

### Option A: Add Usage Caps to the Professional Plan

Introduce a monthly document limit on Professional (e.g., 50 documents/month) with overage at $0.15/document above the cap.

**Cost impact:**
- Median user (12 docs/month): unaffected, revenue unchanged
- P75 user (38 docs/month): unaffected
- P90 user (95 docs/month): would hit cap; overage revenue = 45 × $0.15 = $6.75/month additional revenue or upgrade pressure
- P99 user (610 docs/month): overage = 560 × $0.15 = $84/month additional OR upgrades to Business

**Revenue impact model:**
- Users at or below 50 docs: no change
- Users between 51–150 docs: generate $6–$15/month in overage revenue
- Users above 150 docs: strong upgrade incentive to Business

**Estimated cost reduction**: Limits automated usage meaningfully. P99 tail contained. Estimated AI cost reduction for Professional tier: 40–50%, bringing it to approximately 25–30% of tier revenue.

**User impact**: ~85% of Professional users are unaffected. ~15% hit the cap occasionally. <5% hit it every month.

### Option B: Move AI Analysis to Business Plan Only

Remove document analysis from Professional entirely. AI features become a Business-only capability.

**Cost impact**: Professional AI cost drops to near zero.

**Revenue impact**: Customers who chose Professional specifically for document analysis will churn or upgrade. Estimate 30–40% of current Professional customers cited AI analysis in their reason for buying; perhaps 50% of those upgrade, 50% churn.

**This is the highest-risk option**: You are removing a feature that customers are paying for and using. Even if your terms allow it, the trust and relationship cost is significant. Avoid unless Options A and C fail.

### Option C: Introduce a "Professional Plus" Tier at $49/month

Create a new $49/month tier that sits between Professional ($29) and Business ($89), with generous but capped AI document analysis (e.g., 100 documents/month included).

Keep document analysis in Professional at a lower limit (20 documents/month).

**Revenue impact**: Users who want more AI analysis have a natural upgrade path. The $20 uplift on Professional → Professional Plus covers the AI cost differential for moderate users.

**User impact**: Light users stay on Professional ($29, 20 docs/month — fine for occasional use). Moderate users upgrade to Professional Plus ($49, 100 docs/month). Heavy users are on Business ($89, unlimited with fair use policy).

**Estimated margin outcome:**

| Tier | Revenue/customer | Est. AI cost/customer | Contribution |
|---|---|---|---|
| Professional ($29, 20 doc cap) | $29 | ~$4 | $25 |
| Professional Plus ($49, 100 doc cap) | $49 | ~$14 | $35 |
| Business ($89, unlimited w/ fair use) | $89 | ~$22 | $67 |

**This is the recommended option** for most scenarios: it preserves AI access for current customers, creates a natural upgrade path, and corrects the economic imbalance without removing features from existing customers.

### Option Comparison

| Option | Cost fix | Churn risk | Revenue upside | Customer communication risk | Recommendation |
|---|---|---|---|---|---|
| A: Add caps to Professional | Medium | Low | Low | Low | Good short-term fix |
| B: Move AI to Business only | High | High | Medium | High | Last resort |
| C: New Professional Plus tier | High | Low | High | Medium | Recommended |
| D: Raise Professional price | Medium | Medium | Medium | Medium | Alternative to C |
| E: Do nothing | None | None | None | None | Unacceptable |

---

## Step 3: Stakeholder Communication Plan

### Internal Alignment First

Before any external communication, align your internal stakeholders. The sequence:

1. **Finance VP**: Present the cost analysis and the options. Finance needs to be convinced that Option C is a better outcome than Option B. Show the churn model and the revenue projections.

2. **Customer Success VP**: This team will own the customer communication and will field objections. Brief them in detail. Give them talking points, FAQs, and the specific upgrade offer for affected customers.

3. **CEO/Leadership**: Frame as a pricing maturation decision, not a cost crisis. "We under-priced AI when we launched. We're correcting it in a way that's fair to customers and sustainable for the business."

4. **Sales team**: The new tier creates a new thing to sell. Brief them on the positioning and give them a transition period before enforcement.

### Customer Communication

**Timing**: Announce 60 days before enforcement. This is a meaningful change; customers deserve time.

**Segmentation**: Do not send the same email to everyone.

- **Unaffected customers (≤20 docs/month)**: Brief mention in a product update newsletter. "We've introduced a new Professional Plus tier for higher-volume AI analysis. Your current usage is fully within your existing plan."

- **Moderately affected customers (21–100 docs/month)**: Direct email. "We're introducing usage tiers for document analysis. Based on your current usage, you'll want to upgrade to Professional Plus at $49/month to continue at your current volume. Here's a link to upgrade, and we're offering a discounted first 3 months at $39/month as a thank-you for your early adoption."

- **Heavily affected customers (>100 docs/month)**: Personal outreach from Customer Success. These are your most valuable customers; a mass email is the wrong channel. CS managers should call or schedule a meeting. Offer a custom package where appropriate.

### Communication Template (Moderately Affected)

> Subject: Important update to your Paragon document analysis plan
>
> Hi [Name],
>
> When we launched AI-powered document analysis six months ago, we offered unlimited use while we learned how customers were using it. You've been one of our most engaged users — thank you.
>
> As we scale the feature, we're introducing usage tiers to ensure we can continue to provide fast, high-quality AI analysis for everyone. Based on your usage, you'll want to move to our new Professional Plus plan ($49/month) which includes 100 documents/month — well above your typical usage.
>
> **Your current plan will not change for 60 days.** After that:
> - Your first 20 documents/month remain included in Professional
> - To continue at your current volume, upgrade to Professional Plus
> - As a thank-you for being an early adopter, your first 3 months of Professional Plus are $39/month
>
> [Upgrade to Professional Plus] [Talk to our team]
>
> Questions? Reply to this email or schedule time with your account manager.

---

## Step 4: A/B Test Design for Pricing Changes

Before committing to the full pricing change, validate your assumptions with an A/B test on new customer acquisition.

**What to test**: New customer sign-up page offering Professional vs. Professional Plus as the default recommendation.

**Why new customers**: Testing pricing changes on existing customers is methodologically messy (they have anchoring bias from their current price) and ethically complicated (you are explicitly offering different prices to similar customers). New customers are the right test population.

**Test design:**

| Variable | Control | Treatment A | Treatment B |
|---|---|---|---|
| Plans shown | Professional ($29) + Business ($89) | Professional ($29) + Pro Plus ($49) + Business ($89) | Pro Plus ($49) highlighted as "Most Popular" + Professional ($29) + Business ($89) |
| Primary metric | Conversion rate to paid | Conversion rate to paid | Conversion rate to paid |
| Secondary metric | ARPU at signup | ARPU at signup | ARPU at signup |
| Tertiary metric | 90-day retention | 90-day retention | 90-day retention |

**Sample size calculation**: You need statistical significance before drawing conclusions. For a 5% conversion rate and a minimum detectable effect of 1 percentage point, you will need approximately 3,800 visitors per variant. At your current signup volume, plan for 4-6 weeks of test duration.

**What you are trying to learn:**

1. Does adding a middle tier increase overall conversion, decrease it, or have no effect? (The "paradox of choice" question — three tiers might confuse buyers.)
2. Does the new middle tier cannibalize Business upgrades or capture users who would have chosen Professional?
3. Is the ARPU impact of the new tier positive after accounting for any conversion rate change?

**Decision criteria:**

- If Treatment A or B shows higher ARPU with comparable conversion rate: adopt the three-tier structure.
- If Treatment A or B shows lower conversion rate despite higher ARPU: calculate total revenue impact; may still be positive if ARPU gain exceeds conversion loss.
- If both treatments show meaningfully lower conversion AND lower ARPU: reconsider the tier structure; try Option A (caps on Professional) instead.

### What Not to Test

Do not A/B test pricing changes on your existing customer base. The ethical bar is much higher, the legal implications in some jurisdictions are significant, and the trust cost if discovered is not worth any learning you'd get. Test pricing on new acquisition; manage existing customers through the communication and migration plan described above.

---

## Summary: The Decision

Given the analysis, the recommended path for Paragon:

1. **Immediately**: Implement a fair use policy for the current Professional plan that caps automated/API usage at 50 documents/month. This addresses the P99 tail with minimal impact on legitimate human users. No announcement needed — this is a terms enforcement measure.

2. **In 30 days**: Launch the A/B test for new customers to validate the Professional Plus tier.

3. **In 60 days**: Based on A/B test results, announce the tier change to existing customers with the communication plan above.

4. **Ongoing**: Track AI cost as % of revenue by tier monthly. Set a target of <20% AI cost for each tier, and review pricing if any tier exceeds 30% for two consecutive months.

The worst outcome in this scenario is not making a pricing change — it is shipping a pricing change without understanding the data, surprising customers, and generating churn that exceeds the cost savings. The framework above is designed to prevent that outcome.
