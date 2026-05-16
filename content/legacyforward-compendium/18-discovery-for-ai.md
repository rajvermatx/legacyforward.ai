---
title: "Discovery for AI Features — Finding Real Problems"
slug: "discovery-for-ai"
description: "AI product discovery is different from traditional product discovery. The questions are different, the failure modes are different, and the artifacts that come out of it are different."
section: "legacyforward-compendium"
order: 18
part: "Part II — Strategy and Leadership"
---

Part II — Strategy and Leadership

# Discovery for AI Features — Finding Real Problems

Discovery for AI features follows the same discipline as discovery for any product — talk to users, understand their problems, validate hypotheses — but with additional constraints that change what questions to ask and what answers to look for. An AI feature that solves a real user problem can still fail if the data does not support the solution or if the AI output does not fit the user's workflow. Discovery for AI must surface these constraints before scoping begins.

### What You Will Learn

- The discovery questions specific to AI features that traditional discovery does not surface
- How to validate data availability during discovery, not after
- The prototype techniques that validate AI fit without building the model
- The discovery artifacts that feed directly into AI scoping

## 18.1 Additional Discovery Questions for AI

Standard product discovery asks: what is the user's problem, how do they currently solve it, and what would better look like? AI discovery adds:

**What data does the user generate or consume that relates to this problem?** AI features work on data. Understanding what data the user touches in the context of the problem reveals whether an AI solution is feasible. If the problem involves a manual process that produces no digital traces, AI cannot help.

**What would the AI need to know to help with this problem?** This question surfaces the data requirements. If the AI would need to know the user's complete customer history, their purchase patterns, and their support ticket history — and one of those data sources is inaccessible — the feasibility of the solution changes.

**What would the AI's output look like, and where would it appear in the workflow?** Asking users to react to mockups of AI output surfaces workflow fit issues early. An AI that produces a recommendation in a separate tool that users must switch to will not be adopted. An AI that surfaces the same recommendation in the tool the user already uses will be.

**How confident does the AI need to be before the user will act on its output?** Different users and different tasks have different confidence thresholds. Some users will act on a 70% confidence recommendation. Others require 95%. Understanding this threshold before building determines the accuracy level the model must achieve to be useful.

**What happens when the AI is wrong?** Understanding the cost of an incorrect recommendation tells you how much human oversight the workflow requires and what the fallback behavior needs to be.

## 18.2 Validating Data Availability in Discovery

Data availability should be validated during discovery, not after. The discovery data check:

For each data source that the AI would require:
- Does it exist? (Talk to the data team, not just the business user)
- Is it accessible? (API, database connection, file export, or does it require a new integration?)
- Is it of sufficient quality? (Ask the data team about known quality issues, not just the business user)
- Is it governable for this use? (Consult with legal or compliance if personal data is involved)

A data source that fails any of these checks is a feasibility risk that must be resolved or descoped before moving to implementation.

## 18.3 Prototype Techniques for AI Discovery

Building a full AI model during discovery is premature. The prototype techniques that validate AI fit without the model:

**Wizard of Oz testing:** A human plays the role of the AI, reviewing inputs and producing outputs in real time, while the user interface makes it appear that an AI is responding. This tests whether users would act on AI output in the proposed format without requiring a working model.

**Output format testing:** Show users examples of the format in which AI output would be presented — a confidence score, a ranked list, a highlighted document section, a suggested action — and observe their reactions. Does the format fit the workflow? Does the confidence representation make sense?

**Baseline measurement:** Before building any AI, measure the current state of the process the AI would augment. Document average handling time, error rate, volume, and user satisfaction. The baseline is what the AI's performance will be compared against — and it is often more illuminating about the opportunity than any user interview.

## 18.4 Discovery Artifacts for AI Scoping

The artifacts that come out of AI discovery and feed directly into scoping:

**Problem statement:** The specific user problem, stated in terms of what is slow, error-prone, or missing.

**Data inventory:** The data sources required, with their accessibility, quality, and governance status.

**Output specification:** What the AI output looks like, where it appears in the user workflow, and the confidence threshold required for adoption.

**Baseline measurement:** Current state metrics that define what success would mean.

**Feasibility assessment:** A statement of the data risks, integration risks, and accuracy risks that must be resolved before the feature can be committed to the roadmap.

These artifacts are not the product specification. They are the evidence base for the decision about whether to proceed to specification. That decision — which is the "is this worth building?" question from Chapter 17 — should be made explicitly, with these artifacts as inputs, before scoping begins.
