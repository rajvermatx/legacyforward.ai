---
title: "Capstone: Customer Support System"
slug: "capstone-customer-support"
description: "Build an AI customer support system that handles routine inquiries autonomously, escalates complex cases to human agents with full context, and learns from resolution patterns. This capstone integrates RAG, human-in-the-loop design, and feedback loops."
section: "legacyforward-compendium"
order: 64
part: "Part VII — Capstones"
---

Part VII — Capstones

# Capstone: Customer Support System

Customer support is one of the highest-ROI enterprise AI applications — high volume, repetitive queries, clear escalation paths, and measurable outcomes. Building a customer support AI that actually works in production requires getting the RAG retrieval right (customers ask questions in their own words, not in product documentation terms), the escalation design right (wrong escalation decisions damage customer trust), and the feedback loop right (the system must improve from the cases it handles). This capstone covers all three.

## Scenario

A software company handles 2,000 support tickets per day. 60% are routine questions answerable from the documentation. 30% require access to the customer's account data. 10% require human expertise to resolve. The AI support system handles the first two categories autonomously and routes the third to human agents with a complete context packet that eliminates the need for the customer to repeat their problem.

## Architecture

**Components:**
- Intent classifier: categorizes the ticket (documentation question, account question, complex issue)
- RAG retriever: retrieves relevant documentation for documentation questions
- Account data tool: retrieves customer account information for account questions
- Response generator: produces the customer-facing response
- Escalation packager: assembles context for human agent handoff
- Feedback collector: records customer satisfaction signals

**Execution flow:**
1. Customer submits ticket
2. Intent classifier routes to documentation, account, or escalation path
3. Documentation path: RAG retrieval → response generation → response to customer → feedback collection
4. Account path: account data retrieval + RAG retrieval → response generation → response to customer
5. Escalation path: retrieve all context (ticket history, account data, similar resolved cases) → package for human agent → notify agent

## Implementation

**Intent classification prompt:**
```
Classify this customer support ticket into one of three categories:
- DOCUMENTATION: answerable from product documentation and FAQs
- ACCOUNT: requires access to the customer's specific account data (billing, usage, settings)
- ESCALATE: requires human expertise (complex technical issues, billing disputes, complaints)

Ticket: {ticket_text}

Return a JSON object with: category, confidence (0-1), reasoning.
```

**RAG retrieval for support:**
The documentation knowledge base should be chunked at the FAQ-level granularity — each Q&A pair as a separate chunk. This produces higher retrieval precision than paragraph-level chunking for support queries, because support questions are often exact matches or near-matches of FAQ questions.

**Escalation context packet:**
```python
escalation_context = {
    "ticket_summary": "One-sentence summary of the customer's issue",
    "customer_tier": account_data["tier"],
    "account_history": account_data["recent_interactions"][-5:],
    "similar_resolved_cases": retrieve_similar_cases(ticket, n=3),
    "attempted_solutions": [],  # populated if prior automated responses were sent
    "recommended_resolution": llm_recommendation  # LLM suggests the likely solution
}
```

## Key Learning Points

**Confidence thresholds require tuning.** The intent classifier's confidence threshold determines what gets escalated. Too high: many cases escalate unnecessarily, consuming human agent time. Too low: complex cases are handled by the AI and handled poorly. Tune against actual ticket data, not against synthetic examples.

**Documentation quality determines AI quality.** The support AI is only as good as the documentation it retrieves from. Poor documentation — vague answers, outdated content, missing common questions — produces poor AI responses. Document quality improvement is often the highest-ROI pre-launch investment.

**Escalation packets eliminate customer friction.** The most measurable quality improvement in this capstone is the escalation packet: human agents who receive complete context resolve tickets 40–50% faster and do not ask customers to repeat themselves. This is measurable and demonstrates value independently of the AI's autonomous resolution rate.

**Feedback loops drive improvement.** Customer satisfaction signals (CSAT scores, explicit ratings, repeat ticket submissions on the same issue) on AI-handled tickets identify the specific query types where the AI underperforms. Use this signal to expand the documentation, retrain the classifier, or adjust escalation thresholds.
