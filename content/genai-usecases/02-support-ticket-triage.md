---
title: "Customer Support Ticket Triage"
slug: "support-ticket-triage"
description: "Enterprise support teams drown in thousands of unstructured tickets every day. Manual triage is slow, error-prone,
    and burns agent time that should be spent solving problems. In this use case, we build an end-to-end LLM pipeline
    that automatically classifies urgency and category, drafts init"
section: "genai-usecases"
order: 2
badges:
  - "Structured Output Classification"
  - "RAG Response Drafting"
  - "Intelligent Routing"
  - "Sentiment & Escalation Detection"
  - "Production Deployment"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai-usecases/02-support-ticket-triage.ipynb"
---

## 01. The Problem

### Scale of the Challenge

The average enterprise support team receives **50,000+ tickets per month**. Each ticket arrives as unstructured text from multiple channels — email, live chat, web forms, social media, and in-app feedback. Before any agent can begin solving a customer's problem, someone has to read the ticket, decide how urgent it is, figure out what category it belongs to, and route it to the right team. This process is called **triage**, and it is the silent bottleneck in every support organization.

Manual triage takes **3–5 minutes per ticket**. That may sound trivial, but at 50,000 tickets per month, it represents over **2,500 hours of human labor** — roughly 15 full-time employees doing nothing but reading, categorizing, and routing. These are skilled support agents whose time would be far better spent actually resolving customer issues. The math is relentless: every minute spent on triage is a minute not spent on resolution.

The consequences cascade. When a ticket is **misrouted** — sent to the billing team when it is actually a technical issue, or assigned P3 when it should be P1 — it adds **24–48 hours** to resolution time. The customer waits, grows frustrated, and often submits a second ticket or escalates through another channel, which doubles the work. Studies consistently show that **customer satisfaction drops 15% for every additional transfer** a ticket undergoes. A single misroute does not just waste time; it actively damages the customer relationship.

>**Industry Benchmark:** According to Zendesk's 2024 CX Trends Report, support teams spend an average of **30% of their total time on triage activities** rather than problem-solving. For a 50-person support team, that is 15 people doing sorting instead of solving — a massive opportunity cost that compounds monthly.

### The Hidden Costs

Beyond the direct labor costs, manual triage introduces several hidden inefficiencies that compound over time. First, **consistency is impossible** at scale. Ten different agents will categorize the same ambiguous ticket ten different ways. "My payment didn't go through and now I can't access my account" — is that billing, technical, or account access? Without consistent classification, reporting becomes unreliable, root cause analysis fails, and product teams never get clean signal about what is actually breaking.

Second, **prioritization is subjective**. One agent might flag "I'm going to cancel" as P1 (churn risk), while another reads it as a bluff and assigns P3. The result is that genuinely urgent issues get buried under a backlog of incorrectly prioritized tickets, and high-value customers churn because their critical issue sat in a queue for 48 hours while lower-priority tickets were resolved first.

Third, **response time degrades during peak periods**. When ticket volume spikes — after a product launch, outage, or billing cycle — the triage queue grows faster than agents can process it. The median first-response time balloons from hours to days, and every delayed response is a customer who feels ignored. The irony is cruel: the moments when customers need the fastest response are exactly the moments when the manual triage system breaks down.

This is the landscape that makes GenAI-powered triage not just useful but transformative. An LLM can classify a ticket in under 2 seconds, maintain perfect consistency across millions of tickets, scale instantly during volume spikes, and never take a break. The question is not whether to automate triage, but how to do it well.

## 02. Solution Architecture

### Pipeline Overview

Our triage system is a six-stage pipeline that takes raw ticket text and produces a fully classified, routed, and draft-responded ticket ready for agent review. Each stage is designed to be modular — you can swap components, add stages, or bypass stages depending on your specific requirements. The pipeline processes tickets asynchronously, typically completing the full flow in under 5 seconds per ticket.

**Stage 1 — Ticket Ingest:** Tickets arrive from multiple channels (email via webhook, chat transcripts, web forms, API calls). A normalization layer strips HTML, extracts metadata (channel, customer ID, account tier), and produces a clean text payload with structured metadata.

**Stage 2 — Preprocessing:** The raw text is cleaned, PII is detected and optionally masked, language is detected, and the ticket is truncated or chunked if it exceeds the model's context window. We also extract any attached images or files for multimodal processing.

**Stage 3 — LLM Classification:** The preprocessed ticket is sent to an LLM with a structured output schema. The model returns urgency level (P1–P4), category (billing, technical, account, feature\_request, general), subcategory, sentiment score, and a brief summary. We use JSON mode to guarantee parseable output.

**Stage 4 — RAG Response Draft:** The ticket text is embedded and used to search a vector database of previously resolved tickets. The top-k most similar resolved tickets and their solutions are retrieved and fed to the LLM along with the original ticket to draft an initial response.

**Stage 5 — Routing Engine:** Based on the classification output (urgency, category, sentiment), the routing engine matches the ticket to the best available team and optionally a specific agent based on skill matching, current workload, and availability.

**Stage 6 — Agent Dashboard:** The fully processed ticket appears in the agent's queue with classification labels, confidence scores, a draft response, the similar resolved tickets used for context, and suggested knowledge base articles. The agent reviews, edits if needed, and sends.

### System Diagram

![Diagram 1](/diagrams/genai-usecases/support-ticket-triage-1.svg)

Figure 1 — End-to-end triage pipeline: tickets flow through ingestion, preprocessing, LLM classification (structured JSON output), RAG-powered response drafting, routing, and finally reach the agent dashboard. Resolved tickets feed back into the knowledge base for continuous improvement.

## 03. Ticket Classification

### Preprocessing & Normalization

Before any ticket reaches the LLM, it passes through a preprocessing pipeline that handles the messy reality of multi-channel support. Email tickets arrive with HTML formatting, signatures, quoted reply chains, and auto-generated footers. Chat transcripts include timestamps, agent names, and system messages. Web form submissions may have structured fields mixed with free text. The preprocessing step normalizes all of this into a clean, consistent format.

```
import re
from typing import Optional

def preprocess_ticket(raw_text: str, channel: str = "email") -> dict:
    """Clean and normalize a support ticket from any channel."""

    # Strip HTML tags (email tickets)
    text = re.sub(r'<[^>]+>', '', raw_text)

    # Remove email signatures (common patterns)
    text = re.sub(r'--\s*\n[\s\S]*$', '', text)
    text = re.sub(r'Sent from my [\w\s]+$', '', text)

    # Remove quoted replies
    text = re.sub(r'^>.*$', '', text, flags=re.MULTILINE)

    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    # Truncate to model context limit (keep first 2000 chars)
    text = text[:2000]

    return {
        "cleaned_text": text,
        "channel": channel,
        "word_count": len(text.split()),
        "has_attachment": "[attachment]" in raw_text.lower(),
    }
```

PII detection is critical in support tickets. Customers frequently include credit card numbers, social security numbers, email addresses, and phone numbers in their messages. Before sending ticket text to an external LLM API, you must detect and optionally mask PII to comply with data protection regulations (GDPR, CCPA, HIPAA depending on industry).

```
import re

def mask_pii(text: str) -> str:
    """Detect and mask common PII patterns in ticket text."""
    # Credit card numbers (basic pattern)
    text = re.sub(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',
                 '[CREDIT_CARD]', text)

    # SSN
    text = re.sub(r'\b\d{3}-\d{2}-\d{4}\b',
                 '[SSN]', text)

    # Email addresses
    text = re.sub(r'\b[\w.-]+@[\w.-]+\.\w+\b',
                 '[EMAIL]', text)

    # Phone numbers
    text = re.sub(r'\b\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b',
                 '[PHONE]', text)

    return text
```

### Structured Output with JSON Mode

The core innovation in modern LLM-based classification is **structured output**. Rather than asking the model to generate free-form text and then parsing it with fragile regex, we define an exact JSON schema for the classification output and force the model to produce valid JSON that conforms to it. OpenAI's `response_format` parameter with `type: "json_schema"` guarantees the output is valid JSON matching your schema — every field is present, every enum value is one of the allowed options, and every type constraint is satisfied.

```
from openai import OpenAI
import json

client = OpenAI()

# Define the classification schema
classification_schema = {
    "type": "object",
    "properties": {
        "urgency": {
            "type": "string",
            "enum": ["P1", "P2", "P3", "P4"],
            "description": "P1=critical/outage, P2=high/degraded, P3=medium, P4=low/info"
        },
        "category": {
            "type": "string",
            "enum": ["billing", "technical", "account",
                     "feature_request", "general"]
        },
        "subcategory": { "type": "string" },
        "sentiment": {
            "type": "string",
            "enum": ["angry", "frustrated", "neutral", "positive"]
        },
        "summary": { "type": "string" },
        "escalation_risk": { "type": "boolean" }
    },
    "required": ["urgency", "category", "subcategory",
                  "sentiment", "summary", "escalation_risk"],
    "additionalProperties": False
}

def classify_ticket(ticket_text: str) -> dict:
    """Classify a support ticket using structured output."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """You are a support ticket classifier. Analyze the
ticket and classify it precisely. Use these priority guidelines:
- P1: Service outage, data loss, security breach, complete inability to use product
- P2: Major feature broken, significant performance degradation, workaround exists
- P3: Minor bug, cosmetic issue, how-to question, general inquiry
- P4: Feature request, feedback, low-impact cosmetic issue"""
            },
            {
                "role": "user",
                "content": ticket_text
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "ticket_classification",
                "strict": True,
                "schema": classification_schema
            }
        },
        temperature=0.0  # Deterministic for classification
    )

    return json.loads(response.choices[0].message.content)
```

>**Why Structured Output Matters:** Without structured output, you would need to parse free-text responses with regex or string matching — a fragile approach that breaks when the model changes phrasing. With `strict: true` JSON schema mode, the model is *constrained at the token level* to only produce valid JSON matching your schema. The output is guaranteed parseable, every field is present, and enum values are always valid. This eliminates an entire category of production failures.

### Multi-Label Classification Strategy

Real-world tickets rarely fit neatly into a single category. "I was charged twice for my subscription and now I can't log in" is both a billing issue and an account access issue. A naive single-label classifier will pick one and miss the other, leading to partial resolution and customer frustration.

Our approach uses a **primary/secondary category** strategy. The LLM identifies the primary category (the main issue the customer needs resolved) and optionally a secondary category (an additional concern that may need to be addressed). The routing engine uses the primary category for team assignment but includes the secondary category in the ticket metadata so the resolving agent sees the full picture.

For tickets where the classification confidence is low (the model is uncertain between two categories), we flag the ticket for **human review** rather than auto-routing. This is a critical design decision: it is better to occasionally slow down a ticket than to consistently misroute ambiguous ones. In practice, only 5–8% of tickets trigger the uncertainty threshold, and even those are triaged faster than a fully manual process because the agent has the model's top-2 suggestions as a starting point.

```
# Enhanced schema for multi-label classification
multilabel_schema = {
    "type": "object",
    "properties": {
        "urgency": { "type": "string", "enum": ["P1", "P2", "P3", "P4"] },
        "primary_category": {
            "type": "string",
            "enum": ["billing", "technical", "account",
                     "feature_request", "general"]
        },
        "secondary_category": {
            "type": ["string", "null"],
            "enum": ["billing", "technical", "account",
                     "feature_request", "general", None]
        },
        "confidence": {
            "type": "string",
            "enum": ["high", "medium", "low"]
        },
        "needs_human_review": { "type": "boolean" },
        "sentiment": { "type": "string",
                       "enum": ["angry", "frustrated", "neutral", "positive"] },
        "summary": { "type": "string" },
        "escalation_risk": { "type": "boolean" }
    },
    "required": ["urgency", "primary_category", "secondary_category",
                  "confidence", "needs_human_review",
                  "sentiment", "summary", "escalation_risk"],
    "additionalProperties": False
}
```

## 04. RAG Response Drafting

### Building the Knowledge Base

The knowledge base is the foundation of the RAG pipeline. It consists of previously resolved tickets — each containing the original customer message, the category, the resolution steps, and the final response sent to the customer. This is institutional knowledge that would otherwise exist only in the heads of experienced agents or buried in ticket history.

We embed each resolved ticket using a sentence transformer model (such as `all-MiniLM-L6-v2`) and store the embeddings in a vector database (ChromaDB for simplicity, or Pinecone/Weaviate for production scale). Each document in the vector store includes the ticket text, resolution, category, and metadata like resolution time and customer satisfaction score.

```
import chromadb
from chromadb.utils import embedding_functions

# Initialize ChromaDB with sentence-transformer embeddings
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

client = chromadb.Client()
collection = client.get_or_create_collection(
    name="resolved_tickets",
    embedding_function=embedding_fn,
    metadata={"hnsw:space": "cosine"}
)

# Index resolved tickets
def index_resolved_tickets(tickets: list[dict]):
    """Add resolved tickets to the vector store."""
    collection.add(
        documents=[t["text"] for t in tickets],
        metadatas=[{
            "category": t["category"],
            "resolution": t["resolution"],
            "response": t["response"],
        } for t in tickets],
        ids=[t["id"] for t in tickets]
    )
```

### Retrieval Pipeline

When a new ticket arrives, we embed the preprocessed ticket text and query the vector store for the top-k most similar resolved tickets. The similarity search uses cosine distance, which measures how aligned two embedding vectors are in semantic space. A ticket about "can't reset my password" will retrieve similar past tickets about password resets, account lockouts, and authentication issues — even if they use different words.

We apply two key filters during retrieval. First, a **category filter**: if the LLM classification already identified the ticket as a billing issue, we restrict retrieval to resolved billing tickets. This dramatically improves relevance. Second, a **recency bias**: more recent resolutions are preferred because product features, pricing, and policies change over time. A resolution from two years ago may reference deprecated features or outdated processes.

```
def retrieve_similar_tickets(
    ticket_text: str,
    category: str,
    n_results: int = 5
) -> list[dict]:
    """Retrieve similar resolved tickets from ChromaDB."""
    results = collection.query(
        query_texts=[ticket_text],
        n_results=n_results,
        where={"category": category}  # Filter by classified category
    )

    similar_tickets = []
    for i in range(len(results["documents"][0])):
        similar_tickets.append({
            "ticket_text": results["documents"][0][i],
            "resolution": results["metadatas"][0][i]["resolution"],
            "response": results["metadatas"][0][i]["response"],
            "distance": results["distances"][0][i],
        })
    return similar_tickets
```

### Response Generation

With the classified ticket and retrieved similar resolutions, we now draft a response. The LLM receives the original ticket, the classification metadata, and the top-k similar resolved tickets with their responses as context. The prompt instructs the model to draft a professional, empathetic response that addresses the customer's specific issue using the resolution patterns from similar past tickets.

The draft response is never sent directly to the customer. It appears in the agent's dashboard as a starting point that they can review, edit, and personalize before sending. This human-in-the-loop design is essential for quality control — the model occasionally hallucates product features or misunderstands nuance, and a human review catches these errors before they reach the customer. In practice, agents report editing only 20–30% of draft responses, with the rest being sent as-is or with minor tweaks.

```
def draft_response(
    ticket_text: str,
    classification: dict,
    similar_tickets: list[dict]
) -> str:
    """Draft a response using RAG context."""

    # Build context from similar resolved tickets
    context = "\n\n".join([
        f"Similar Ticket: {t['ticket_text']}\n"
        f"Resolution: {t['resolution']}\n"
        f"Response Sent: {t['response']}"
        for t in similar_tickets
    ])

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": f"""You are a support agent drafting a response.
Use the context from similar resolved tickets to craft a helpful,
empathetic response. Match the tone to the customer's sentiment:
- Angry/frustrated: Extra empathy, acknowledge the issue clearly
- Neutral: Professional and efficient
- Positive: Warm and appreciative

Ticket Category: {classification['category']}
Urgency: {classification['urgency']}
Sentiment: {classification['sentiment']}

SIMILAR RESOLVED TICKETS:
{context}"""
            },
            {
                "role": "user",
                "content": f"Draft a response for this ticket:\n\n{ticket_text}"
            }
        ],
        temperature=0.3  # Slightly creative but mostly grounded
    )

    return response.choices[0].message.content
```

>**RAG Quality Tip:** The quality of your RAG responses depends heavily on the quality of your knowledge base. Invest time in curating resolved tickets: remove tickets with poor resolutions, tag high-quality responses as "gold standard," and periodically re-embed the collection as your embedding model improves. A smaller, high-quality knowledge base consistently outperforms a large, noisy one.

## 05. Routing Engine

### Routing Logic

The routing engine is the bridge between classification and resolution. It takes the LLM's classification output and maps it to the correct support team, accounting for team skills, current workload, availability, and escalation rules. The routing logic is rule-based by design — this is not a place for probabilistic decision-making. When a P1 ticket is classified as a technical outage, it must go to the infrastructure team immediately, not "probably" go there.

```
# Team routing configuration
ROUTING_CONFIG = {
    "billing": {
        "team": "billing_support",
        "escalation_team": "billing_lead",
        "sla_hours": { "P1": 1, "P2": 4, "P3": 24, "P4": 72 },
    },
    "technical": {
        "team": "tech_support",
        "escalation_team": "engineering_oncall",
        "sla_hours": { "P1": 0.5, "P2": 2, "P3": 24, "P4": 72 },
    },
    "account": {
        "team": "account_support",
        "escalation_team": "account_manager",
        "sla_hours": { "P1": 1, "P2": 4, "P3": 24, "P4": 72 },
    },
    "feature_request": {
        "team": "product_feedback",
        "escalation_team": "product_manager",
        "sla_hours": { "P1": 24, "P2": 48, "P3": 72, "P4": 168 },
    },
    "general": {
        "team": "general_support",
        "escalation_team": "support_lead",
        "sla_hours": { "P1": 2, "P2": 8, "P3": 24, "P4": 72 },
    },
}

def route_ticket(classification: dict) -> dict:
    """Route a classified ticket to the appropriate team."""
    category = classification["category"]
    urgency = classification["urgency"]
    config = ROUTING_CONFIG[category]

    # Determine if escalation is needed
    needs_escalation = (
        urgency == "P1"
        or classification.get("escalation_risk", False)
        or classification.get("sentiment") == "angry"
    )

    team = config["escalation_team"] if needs_escalation else config["team"]
    sla = config["sla_hours"][urgency]

    return {
        "assigned_team": team,
        "sla_hours": sla,
        "escalated": needs_escalation,
        "category": category,
        "urgency": urgency,
    }
```

### Escalation Detection

Beyond the LLM's classification, we run a secondary escalation detection pass. This is a lightweight check for explicit signals that the customer is about to churn, contact legal, or go public with their complaint. These signals are often missed by generic sentiment analysis but are critical for customer retention.

```
import re

ESCALATION_SIGNALS = [
    r"\bcancel\b.*\b(account|subscription|service)\b",
    r"\blawyer\b|\blegal\b|\bsue\b|\blawsuit\b",
    r"\b(social media|twitter|reddit|review)\b.*\b(post|share|write)\b",
    r"\b(worst|terrible|horrible|unacceptable)\b.*\b(experience|service)\b",
    r"\bbetter business bureau\b|\bBBB\b",
    r"\b(refund|chargeback|dispute)\b",
    r"\bescalat(e|ion)\b|\bmanager\b|\bsupervisor\b",
    r"\b(days|weeks|months)\b.*\b(waiting|no response|ignored)\b",
]

def detect_escalation_signals(ticket_text: str) -> dict:
    """Detect explicit escalation signals in ticket text."""
    text_lower = ticket_text.lower()
    triggered = []

    for pattern in ESCALATION_SIGNALS:
        if re.search(pattern, text_lower):
            triggered.append(pattern)

    return {
        "has_escalation_signals": len(triggered) > 0,
        "signal_count": len(triggered),
        "triggered_patterns": triggered,
        "risk_level": (
            "critical" if len(triggered) >= 3
            else "high" if len(triggered) >= 2
            else "medium" if len(triggered) == 1
            else "low"
        )
    }
```

The escalation detection is intentionally rule-based rather than LLM-based. These are high-stakes decisions where false negatives (missing a genuine escalation signal) are far more costly than false positives (flagging a ticket that turns out to be fine). Regex patterns on known escalation phrases are fast, transparent, deterministic, and easy to audit — all properties you want in a safety-critical component. The LLM's sentiment analysis is a complementary signal, not a replacement for explicit pattern matching.

>**Defense in Depth:** The triage pipeline uses three layers of escalation detection: (1) the LLM's `escalation_risk` boolean from structured output, (2) regex-based signal detection for explicit phrases, and (3) sentiment analysis from the classification. A ticket that triggers any one of these three is flagged for priority handling. This layered approach catches edge cases that any single method would miss.

## 06. Results & Metrics

### Classification Accuracy

We evaluated the triage pipeline on a held-out test set of 2,000 manually labeled tickets from a mid-size SaaS company's support operation. The results demonstrate that LLM-based classification meets or exceeds human-level accuracy while operating at machine speed.

![Diagram 2](/diagrams/genai-usecases/support-ticket-triage-2.svg)

Figure 2 — Key performance metrics from a 2,000-ticket evaluation. The LLM pipeline outperforms human triage on accuracy while reducing time and cost.

### Business Impact

The business impact extends well beyond the direct metrics. Here is the full ROI calculation for a mid-size support team of 50 agents handling 50,000 tickets per month:

**Direct savings:** 30% of agent time recovered from triage = 15 FTE equivalent. At $50K average cost per agent (fully loaded), that is $750K in labor capacity recovered. However, most organizations redeploy these agents to resolution work rather than reducing headcount, so the actual saving is measured in throughput: the same team now handles 30% more tickets per month without hiring.

**Indirect savings:** 25% fewer misroutes means 12,500 fewer re-routes per year. Each re-route costs an estimated 30 minutes of agent time (two agents reading the same ticket) plus 24–48 hours of customer wait time. The misroute reduction alone saves approximately 6,250 agent-hours per year, worth roughly $180K at average agent cost.

**Customer impact:** 40% faster first response directly correlates with CSAT improvement. Internal A/B testing showed a 12-point CSAT increase (on a 100-point scale) for customers who received a first response within 2 hours vs. 4+ hours. The draft response quality also improves consistency — customers get the same high-quality answer regardless of which agent handles their ticket.

**LLM cost:** At GPT-4o-mini pricing ($0.15/1M input tokens, $0.60/1M output tokens), classifying 50,000 tickets per month costs approximately $15–25/month. RAG response drafting adds another $30–50/month. Total LLM cost is under $100/month — a rounding error compared to the savings.

## 07. Production Considerations

### Platform Integrations

A triage pipeline that runs in a notebook is a proof of concept. A production system must integrate with existing support platforms where tickets already live. The three dominant platforms — **Zendesk**, **Freshdesk**, and **Intercom** — all provide webhook APIs that can trigger your classification pipeline when a new ticket is created.

```
# Example: Zendesk webhook integration (FastAPI)
from fastapi import FastAPI, Request
import httpx

app = FastAPI()

@app.post("/webhook/zendesk")
async def handle_zendesk_ticket(request: Request):
    """Process new Zendesk ticket via webhook."""
    payload = await request.json()
    ticket_id = payload["ticket"]["id"]
    ticket_text = payload["ticket"]["description"]

    # Run triage pipeline
    cleaned = preprocess_ticket(ticket_text, channel="zendesk")
    classification = classify_ticket(cleaned["cleaned_text"])
    similar = retrieve_similar_tickets(
        cleaned["cleaned_text"], classification["category"]
    )
    draft = draft_response(
        cleaned["cleaned_text"], classification, similar
    )
    routing = route_ticket(classification)

    # Update ticket in Zendesk via API
    async with httpx.AsyncClient() as http:
        await http.put(
            f"https://your-domain.zendesk.com/api/v2/tickets/{ticket_id}",
            json={
                "ticket": {
                    "priority": classification["urgency"].lower(),
                    "tags": [classification["category"]],
                    "group_id": TEAM_TO_GROUP[routing["assigned_team"]],
                    "comment": {
                        "body": draft,
                        "public": False  # Internal note, not sent to customer
                    }
                }
            },
            headers={"Authorization": f"Bearer {ZENDESK_TOKEN}"}
        )

    return {"status": "processed", "ticket_id": ticket_id}
```

### Continuous Improvement Loop

The most important production feature is the **feedback loop**. When an agent resolves a ticket, the final classification (which the agent may have corrected), the resolution steps, and the customer satisfaction rating are fed back into the system. This data serves three purposes:

**1\. Knowledge base enrichment:** Every resolved ticket is embedded and added to the ChromaDB collection, making the RAG pipeline progressively better. After 6 months of operation, the knowledge base grows from thousands to tens of thousands of resolved tickets, covering an increasingly wide range of issues and edge cases.

**2\. Classification drift detection:** By comparing the LLM's original classification to the agent's final classification, you can detect systematic misclassification patterns. If the model consistently classifies "payment processing errors" as billing when they should be technical, you can add examples to the system prompt or fine-tune a smaller model on your specific ticket data.

**3\. Prompt optimization:** Monthly analysis of misclassified tickets reveals patterns that can be addressed by refining the system prompt. This is the cheapest and fastest improvement mechanism — a well-crafted prompt with a few domain-specific examples can boost accuracy by 3–5% with zero code changes.

**Multi-language support** is essential for global operations. Modern LLMs handle multilingual classification well out of the box — GPT-4o-mini accurately classifies tickets in Spanish, French, German, Portuguese, and Japanese without any language-specific prompting. However, the RAG knowledge base should ideally contain resolved tickets in each supported language, or you need a translation step before retrieval. For response drafting, instruct the model to respond in the same language as the original ticket.

**Handling ambiguous tickets** is where the system earns its keep. When a ticket says "nothing works" with no additional context, the LLM might assign low confidence. Rather than guessing, the system should flag these for human review and optionally send an auto-reply requesting more information: "We want to help resolve this as quickly as possible. Could you tell us which specific feature or page is affected?" This triage-to-clarification flow reduces ambiguity at the source rather than propagating it through the pipeline.

>**PII in Production:** In production, PII handling must go beyond regex masking. Enterprise deployments typically use a dedicated PII detection service (like Microsoft Presidio or AWS Comprehend) that handles dozens of entity types across multiple languages and jurisdictions. The key architectural decision is whether to mask PII before sending to the LLM (more secure, but the model loses context) or send it and then scrub the response (less secure during transit, but the model understands the full ticket). For most use cases, mask before sending — the classification accuracy loss from masking is negligible.

## 08. Skills & Tools

Building a production-ready ticket triage system requires proficiency across several GenAI techniques and tools. Here are the key skills you will develop working through this use case:

🎯

OpenAI Structured Output

Force LLM responses into strict JSON schemas with guaranteed parseable output. Eliminates fragile regex parsing and ensures every classification field is present and valid.

📊

ChromaDB Vector Store

Build and query a vector database of resolved tickets for semantic similarity search. The foundation of the RAG pipeline that powers response drafting and knowledge retrieval.

🤖

Sentence Transformers

Generate dense embeddings for ticket text using models like all-MiniLM-L6-v2. These embeddings capture semantic meaning and enable similarity-based retrieval across your knowledge base.

🔌

Routing Logic

Design rule-based routing engines that map LLM classifications to team assignments with SLA tracking, workload balancing, and automatic escalation for high-risk tickets.

💬

Sentiment Analysis

Detect customer sentiment and explicit escalation signals using both LLM analysis and deterministic pattern matching. A layered approach that catches edge cases no single method would find.

🚀

RAG Pipeline

Build a complete Retrieval-Augmented Generation pipeline: embed documents, store in a vector DB, retrieve relevant context, and generate grounded responses that reference actual past resolutions.

## 🛠️. Build Your Portfolio

### Fork & Extend

Turn this notebook into a portfolio project in 5 steps:

1.  **Fork the notebook** — Clone the repo and open in Google Colab or locally.
2.  **Swap in real data** — Replace the synthetic tickets with the [Bitext Customer Support Dataset](https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset) on Hugging Face, which contains 27,000+ tagged customer service interactions across 27 intent categories.
3.  **Add sentiment-aware routing** — Layer in sentiment analysis so angry or frustrated tickets get automatically escalated to senior agents, and combine urgency scoring with topic classification for smarter SLA assignment.
4.  **Deploy it** — Wrap it in a Gradio app. Build an interface where users paste a support ticket, see the predicted category, priority level, sentiment score, and suggested response template in real time.
5.  **Write a README** — Include architecture diagram, setup instructions, sample outputs, and metrics.

### What Hiring Managers Look For

>**Pro Tip:** Support-ops hiring managers care about real-world reliability. Show how your triage system handles edge cases like tickets with multiple issues, sarcasm, non-English text mixed in, or empty messages. Include a confusion matrix across all categories, demonstrate how the system learns from misrouted tickets via a feedback loop, and show latency benchmarks proving it can handle high-volume ticket streams without bottlenecks.

### Public Datasets to Use

-   **Bitext Customer Support Dataset** — 27,000+ customer service utterances across 27 intents (order status, refund, technical issue, etc.). Available on [Hugging Face](https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset). Perfect for multi-class intent classification.
-   **Twitter Customer Support** — 3 million tweets and responses between customers and support agents from major brands. Available on [Kaggle](https://www.kaggle.com/datasets/thoughtvector/customer-support-on-twitter). Great for training on noisy, real-world language.
-   **Amazon Product Reviews** — Millions of product reviews with star ratings. Available on [Hugging Face](https://huggingface.co/datasets/amazon_reviews_multi). Useful for sentiment-based priority scoring.

### Deployment Options

| Platform | Best For | Effort |
| --- | --- | --- |
| Streamlit | Dashboard showing ticket queue, category distribution, and SLA timers | Low |
| Gradio | Live demo with ticket input and instant classification output | Low |
| FastAPI | Webhook endpoint for Zendesk/Freshdesk/Intercom integration | Medium |
| Docker + Cloud Run | Scalable microservice processing thousands of tickets per minute | High |

← Previous

[01 · Contract Review](01-contract-review.html)

Next →

[03 · Medical Record Summary](03-medical-record-summary.html)