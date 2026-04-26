---
title: "Pricing and Packaging AI Features"
slug: "pricing-and-packaging-ai-features"
description: "AI features have cost structures unlike anything else in a software product — and the wrong pricing decision can turn a successful feature into a margin disaster. This chapter gives product managers the frameworks to understand AI cost structures, design sustainable pricing models, manage the free tier trap, and run competitor pricing analysis."
section: "ai-pm"
order: 10
part: "Part 04 Integration"
badges:
  - "Pricing"
  - "Monetization"
---

# Pricing and Packaging AI Features

## The Feature That Costs Money Every Time Someone Uses It

Traditional software features have a comforting economic property: once they are built, the marginal cost of an additional user using them is effectively zero. A user runs a search, applies a filter, exports a spreadsheet. The servers are running anyway, the engineering is amortized across the user base, the cost per interaction is fractions of a cent. This is why software businesses have such attractive unit economics. You build it once and the incremental usage is almost free.

![Diagram](/diagrams/ai-pm/ch10-1.svg)

AI features break this model entirely.

Every time a user invokes your AI feature, you pay something. You pay for the tokens consumed by the model. You pay for the compute to run inference. You pay for the storage of context that gets fed into the prompt. Depending on your architecture, you may pay for vector database queries, embedding computations, and retrieval operations before the model ever starts generating. And you pay this cost every single time, for every single user, at every single scale.

This fundamentally changes the calculus of pricing and packaging. A feature that costs $0.50 per use sounds fine when 100 users are using it. At 10,000 users, you are spending $5,000 a day in variable costs. At 100,000 users using it twice a day, you are spending $100,000 a day. The economics that worked as an experiment collapse spectacularly at scale if you have not priced for the cost structure.

> **Think of it like this:** Pricing an AI feature without understanding its cost structure is like opening a restaurant where every dish requires a different amount of premium ingredients, giving all the dishes the same menu price, and then being surprised when the kitchen says you are losing money on every order. The revenue is real. The problem is the costs are also real. They scale with every customer who walks through the door.

## Cost Structure of AI Features

Before you can make a pricing decision, you need to understand what you are actually paying for. AI feature costs have four layers, and most PMs underestimate the second and third.

### Layer 1: Model Inference Costs

This is the most visible cost: the per-token or per-call fee you pay to your model provider. For most GenAI features, this is the input token cost (what you send to the model) plus the output token cost (what the model returns).

Input tokens are typically cheaper than output tokens. A typical modern frontier model might charge $3–15 per million input tokens and $15–60 per million output tokens. These numbers change frequently as competition increases, so treat specific figures as illustrative, not as current benchmarks.

To estimate this cost:
- Measure your average prompt length in tokens (including any system prompt and context you inject)
- Measure your average response length in tokens
- Multiply by expected call volume
- Apply the provider's per-token rates

A feature with a 2,000-token prompt and a 500-token response at $10/M input and $30/M output costs approximately: (2,000 × $0.000010) + (500 × $0.000030) = $0.020 + $0.015 = **$0.035 per call**.

At 10,000 calls per day, that is $350/day, $10,500/month. Not trivial.

### Layer 2: Retrieval and Context Costs

Many AI features are built with Retrieval-Augmented Generation (RAG) or similar patterns that fetch relevant context before invoking the model. This retrieval has its own cost:

- **Embedding computation**: Converting text into vector representations. Usually cheap per call but adds up at scale.
- **Vector database queries**: Similarity search at scale. Managed vector database pricing varies widely by provider and query volume.
- **Document storage and indexing**: Storing and maintaining the knowledge base that retrieval draws from.

Teams that accurately estimate model inference costs often discover that retrieval costs are comparable or higher when they do the full accounting.

### Layer 3: Infrastructure and Overhead

- **API gateway and monitoring**: Requests to model APIs go through infrastructure that has its own cost.
- **Caching layer**: If you implement output caching (covered in Chapter 14), the cache itself has storage costs.
- **Logging and observability**: Every AI call you log for monitoring, debugging, or compliance purposes has storage and compute cost.
- **Safety and moderation**: If you run outputs through a moderation model before displaying them, that is an additional model call.

### Layer 4: Human Review and Escalation

For AI features in sensitive domains, some percentage of outputs require human review. This is a labor cost, not a compute cost, but it scales with usage just as compute does. Budget for it explicitly.

**The fully-loaded cost per call:**

| Cost component | Typical share of total cost |
|---|---|
| Model inference (input + output tokens) | 50–70% |
| Retrieval and context operations | 15–30% |
| Infrastructure and overhead | 10–20% |
| Human review and escalation | 0–25% (domain-dependent) |

Run this accounting before you set a price. If you do not know your fully-loaded cost per call, you cannot know whether you are pricing for margin or pricing for ruin.

## Pricing Models: Three Approaches and When Each Works

### Included in Base Subscription

AI features are part of the product, with no additional charge and no usage limits communicated to the user. The cost is absorbed into the subscription price.

**When this works:**
- AI feature usage per user is low and predictable
- AI cost is a small fraction of overall COGS (cost of goods sold), typically under 5-10% of subscription revenue
- The AI feature is a key differentiator that drives initial conversion and retention, making it worth subsidizing
- You can absorb cost variance because the user base is paying meaningful per-seat or per-account fees

**When this breaks:**
- Users find ways to use the AI feature far more heavily than your baseline assumption
- A small number of power users consume a disproportionate share of AI costs
- Usage grows without a corresponding growth in subscription revenue

**Guardrail to add**: Even "included" AI features should have soft usage limits that prevent extreme outliers from destroying your unit economics. A "generous" monthly limit that 95% of users never approach is better than no limit and a single customer who runs your AI feature as an automated pipeline and generates a $50,000 monthly cost against their $500/month subscription.

### Premium Tier

AI features are available only at a higher pricing tier. Standard users get the base product; premium users get the base product plus AI capabilities.

**When this works:**
- The AI feature provides clearly differentiated, premium value
- You have a user base that segments naturally between casual and power users
- The premium tier creates a clear upgrade path and conversion lever
- You want to limit AI costs to the subset of users paying enough to cover them

**When this breaks:**
- Customers resist paying for features that feel like they should come with the base product
- The premium tier becomes cluttered with too many features, losing coherence
- A competitor bundles the same AI features at the base tier and uses it to undercut you

**Pricing math**: If your AI cost per monthly active premium user is $12, your premium tier needs to either price for margin above that (e.g., $50/month premium vs. $25/month base) or cross-subsidize from account-level fees.

### Usage-Based Pricing

Users pay for AI features based on how much they use them — per document processed, per query, per generation, per month over a usage threshold.

**When this works:**
- Cost and value both scale with usage, creating natural alignment
- Users who derive more value from the feature naturally pay more
- You need to manage the tail risk of extreme users
- Enterprise customers prefer to pay for what they use rather than a flat fee

**When this breaks:**
- Usage-based pricing creates psychological friction that suppresses feature adoption. Users hesitate to use the feature because they are watching a meter.
- Small-scale users see low bills but feel nickel-and-dimed
- Your sales and billing infrastructure is not set up for usage-based models
- You lose the simplicity of flat-rate pricing that makes buying decisions easy

**Hybrid approach**: Usage-based above a generous included baseline. Users get, for example, 100 AI generations per month included, with additional usage at $0.10/generation. This preserves the simplicity and adoption benefits of the included model for most users while protecting economics at the tail.

## Margin Management: When the Feature Costs More Than It Earns

The most dangerous scenario in AI feature pricing is one that is common: the feature is working, users love it, adoption is growing, and the unit economics are getting worse with every new user.

This is not a hypothetical risk. It has happened to real products, particularly those that launched AI features with optimistic cost assumptions and then watched usage patterns diverge dramatically from projections.

### How to Detect the Problem Early

Track these metrics on a per-user or per-account basis, not just in aggregate:

- **AI cost per monthly active user (MAU)**: How much are you spending on AI per active user per month? Is this stable as volume grows?
- **AI cost as percentage of ARPU (average revenue per user)**: What fraction of what each user pays are you spending on their AI usage?
- **Cost distribution by user decile**: Do your top 10% heaviest AI users account for 50%+ of your AI cost? What segment are they in, and what do they pay?
- **Contribution margin after AI cost**: For each pricing tier, what is the margin after subtracting AI costs? Is it positive?

**Threshold to watch**: If your AI cost for any user segment exceeds 20–25% of the revenue they generate, you have a margin problem that will scale with adoption. Address it before the feature becomes a growth success and a financial problem simultaneously.

### Responses to Margin Compression

| Severity | Response |
|---|---|
| Early warning (AI cost 15–25% of segment revenue) | Introduce soft usage limits; optimize prompts and caching to reduce cost; monitor closely |
| Elevated risk (AI cost 25–40% of segment revenue) | Add usage caps; evaluate premium upsell opportunity; implement aggressive caching; renegotiate model pricing |
| Critical (AI cost >40% of segment revenue) | Immediate pricing or packaging change required; rate-limit affected users; consider feature scope reduction |
| Unsustainable (AI cost > revenue generated) | Shut down unlimited access; move to usage-based pricing immediately; evaluate whether feature should exist in current form |

Never let a margin problem go unaddressed because the feature is popular. Popularity without economics is not success. It is a liability that grows with scale.

## The Free Tier Trap: Giving Away AI to Drive Adoption

The free tier trap is a specific version of the margin problem, and it deserves its own treatment because it is so common and so seductive.

The logic of the free AI tier sounds reasonable: offer AI features for free to drive adoption, demonstrate value, and convert users to paid. It works for many software features. Why not for AI?

Because most software features have near-zero marginal cost at scale. AI features do not. Every free user who uses your AI feature is a real cost that does not convert to revenue unless and until they pay.

### When Free AI Works

- Your free tier has meaningful usage caps that make the cost per free user small (e.g., 5 AI generations per month)
- Your conversion rate from free to paid is high enough that the cost of free usage is offset by the revenue from conversions
- Free usage generates training data with consent, creating long-term value that justifies the short-term cost
- The feature is strategically valuable for brand and acquisition in a way that justifies a calculated subsidy

### When Free AI Destroys Value

- Free usage is unlimited or the caps are generous enough to be the full product
- Conversion rates are low. Free users are using the feature indefinitely without converting.
- Your free tier is populated by users who have no intention of paying (e.g., students, hobbyists, competitors doing competitive research)
- The free AI feature attracts high-volume automated usage that was never the target user

**The viability test for free AI tiers:**

Estimate your cost per free user per month (actual AI costs). Multiply by your free-to-paid conversion rate. Compare to the average revenue of a converted paid user over their first year. If the math does not work at current conversion rates, the free tier is not a growth strategy. It is a subsidy program.

| Scenario | Monthly free AI cost/user | Conversion rate | LTV of converted user (year 1) | Verdict |
|---|---|---|---|---|
| Works | $0.50 | 8% | $200 | Math works: $6.25 cost per conversion, $200 return |
| Borderline | $2.00 | 5% | $200 | $40 cost per conversion; acceptable if LTV is multi-year |
| Broken | $5.00 | 2% | $200 | $250 cost per conversion; losing money on every customer acquired |
| Disaster | $10.00 | 1% | $200 | $1,000 cost per conversion; shut down the free tier |

## Competitor Pricing Analysis Framework

You cannot price in a vacuum. Your pricing must be calibrated against what competitors charge and what the market has established as a reference point for the value of AI capabilities.

### Step 1: Build the Competitive Matrix

For each direct and adjacent competitor that offers AI features relevant to yours, collect:

- What is the base tier price?
- What AI features are included, and at what limits?
- What does the AI tier cost (if separate)?
- What are the usage caps or limits?
- Is there a usage-based option?
- What are the overage charges?

Do this analysis every quarter. AI pricing is changing rapidly, and competitor moves can significantly shift user expectations.

### Step 2: Calculate Competitive Value Ratios

For each competitor, calculate what the user is getting per dollar:

- AI generations per dollar per month
- Documents processed per dollar per month
- (Whatever the relevant unit is for your category)

This gives you a normalizable comparison. If Competitor A provides 100 AI summaries/month for $30 and Competitor B provides 500 AI summaries/month for $50, they are not the same offer. Your pricing needs to be positioned relative to both.

### Step 3: Identify Positioning Opportunities

| Competitor positioning | Your opportunity |
|---|---|
| All competitors bundle AI at premium tier only | Opportunity to differentiate by including basic AI at base tier |
| All competitors include AI but with low caps | Opportunity to compete on generous usage limits |
| Competitors use complex usage-based pricing | Opportunity to win with simple flat-rate pricing |
| Competitors lead with AI features prominently | Evaluate whether AI is table stakes or if there's a non-AI positioning opportunity |
| One competitor is dramatically cheaper | Investigate: are they subsidizing? Do they have better model economics? Is quality lower? |

### Step 4: Validate with Users

Competitive pricing analysis tells you what the market is charging. User research tells you what your specific users value and what they will pay. Run pricing sensitivity research, such as willingness-to-pay studies, conjoint analysis, or straightforward pricing conversations in user interviews, before setting final prices. Competitor data is an input, not a substitute for direct user signal.

### The Pricing Decision Checklist

Before finalizing AI feature pricing, verify:

- [ ] You know your fully-loaded cost per call (all four layers)
- [ ] You know your cost per monthly active user in the relevant tier
- [ ] You have modeled cost at 10x current usage
- [ ] You have defined contribution margin targets by tier
- [ ] You have analyzed all direct competitors' AI pricing
- [ ] You have validated willingness-to-pay with target users
- [ ] You have defined usage caps that protect margin at the tail
- [ ] You have a plan for communicating pricing changes to existing customers
- [ ] You have a 6-month cost forecast under three usage scenarios (low, expected, high)

Pricing AI features is not a one-time decision. The model costs will change. Competitor prices will change. Your usage patterns will evolve. Build a cadence of quarterly pricing reviews into your operating rhythm, and treat your AI feature economics as a living document rather than a launch deliverable.
