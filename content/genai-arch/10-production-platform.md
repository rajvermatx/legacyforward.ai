---
title: "Production Platform"
slug: "production-platform"
description: "The capstone architecture: an end-to-end enterprise GenAI platform that unifies every pattern from this series.
    API gateway with auth and rate limiting, intelligent request routing, RAG and agent pipelines,
    multi-model pool, guardrails, semantic caching, observability, cost tracking, and com"
section: "genai-arch"
order: 10
badges:
  - "API Gateway & Auth"
  - "Semantic Caching"
  - "Observability & Tracing"
  - "Cost Tracking"
  - "Multi-Model Routing"
  - "Compliance & Audit"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai-arch/10-production-platform.ipynb"
---

## 1. Architecture Overview

The **Production Platform** is the capstone architecture that combines every pattern from this series into a unified, enterprise-grade GenAI system. It provides a single entry point (API gateway) that authenticates requests, enforces rate limits, routes to the appropriate pipeline (RAG, agent, or direct LLM), applies guardrails, caches responses, tracks costs, and logs everything for observability and compliance.

This is not a single application — it is an **internal platform** that enables multiple teams to build GenAI features without each team reinventing infrastructure. Think of it as the "GenAI operating system" for your organization.

### When to Use

-   Multiple teams or products need GenAI capabilities with shared infrastructure
-   You need centralized cost tracking, security, and compliance across all GenAI usage
-   Different use cases require different pipelines (RAG, agents, fine-tuned models) behind one API
-   Enterprise requirements: audit logging, data retention policies, multi-tenant isolation
-   You want to experiment with models and pipelines using feature flags without code changes

### Complexity Level

**Very High.** This is a platform, not an application. It requires dedicated infrastructure engineering, DevOps, and ongoing operational investment. Only build this when you have 3+ teams consuming GenAI and the operational overhead of per-team infrastructure exceeds the cost of a shared platform.

>**Build vs Buy:** Before building a full platform, evaluate managed options: AWS Bedrock, GCP Vertex AI, Azure AI Studio, or startups like Portkey, LiteLLM, and Helicone. A hybrid approach — managed LLM gateway + custom business logic — is often the fastest path to production.

## 2. Architecture Diagram

![Diagram 1](/diagrams/genai-arch/production-platform-1.svg)

Architecture diagram — Production Platform: end-to-end enterprise GenAI system with gateway, routing, pipelines, model pool, guardrails, caching, and observability

## 3. Components Deep Dive

🛡

#### API Gateway

Single entry point for all GenAI requests. Handles JWT authentication, API key management, per-user/per-team rate limiting, request validation (size, format, content policy), and initial semantic cache lookup. Built with FastAPI, Kong, or AWS API Gateway.

🔌

#### Request Router

Classifies incoming requests and routes to the appropriate pipeline: RAG for knowledge-grounded queries, Agent for multi-step tool-use tasks, Direct LLM for simple completions. Uses feature flags (LaunchDarkly, Unleash) for model/pipeline experiments.

📚

#### Semantic Cache

Embeds the request and searches for semantically similar past queries. If a cached response is found above a similarity threshold (e.g., cosine > 0.95), returns it instantly — saving LLM cost and latency. Cache TTL and invalidation per use case.

⚙

#### LLM Pool

Manages connections to multiple LLM providers (Anthropic, OpenAI, self-hosted). Implements fallback chains: if Claude times out, try GPT-4o; if that fails, use a local Llama model. Tracks availability and latency per provider.

💰

#### Cost Tracker

Tracks token usage and cost per team, project, and user. Enforces budgets with soft alerts (80% threshold) and hard limits (block requests). Generates daily/weekly cost reports. Essential for multi-tenant platforms.

📈

#### Observability Stack

OpenTelemetry-based distributed tracing across all components. Structured JSON logging with request IDs, latency, token counts, and model versions. Prometheus metrics for dashboards. PagerDuty/Slack alerts for anomalies.

🔒

#### Guardrails Layer

Output validation on every response: PII detection and redaction, toxicity scoring, format validation, hallucination checks against source documents. Configurable per use case — stricter for customer-facing, relaxed for internal tools.

📋

#### Compliance & Audit

Immutable audit logs for every request/response. Data retention policies per regulation (GDPR, HIPAA, SOC2). Tenant isolation ensuring no data leakage between teams. Model governance with approval workflows.

### Multi-Tenant Isolation

In a shared platform, each team must be isolated. This means separate API keys, independent rate limits, dedicated cost budgets, isolated vector DB namespaces, and no cross-tenant data leakage in logs or caches. The most common approach is namespace-based isolation with strict access controls at the gateway layer.

| Isolation Layer | Implementation | Purpose |
| --- | --- | --- |
| Authentication | JWT with team/project claims | Identity and authorization |
| Rate Limiting | Per-team token buckets (Redis) | Fair resource sharing |
| Cost Budgets | Per-team monthly caps | Cost control |
| Vector DB | Namespace per team/project | Data isolation |
| Cache | Team-prefixed cache keys | No cross-tenant cache hits |
| Logs | Team ID in every log entry | Audit and debugging |

### Model Fallback Chains

Production systems must handle provider outages gracefully. Define fallback chains per use case:

| Use Case | Primary | Fallback 1 | Fallback 2 |
| --- | --- | --- | --- |
| Customer chat | Claude Sonnet | GPT-4o | Claude Haiku |
| Code generation | Claude Sonnet | GPT-4o | Llama 3.1 70B |
| Summarization | Claude Haiku | GPT-4o-mini | Llama 3.1 8B |
| RAG + analysis | Claude Sonnet | GPT-4o | Queue + retry |

### Deployment Strategies

| Strategy | How It Works | Risk Level | Rollback Speed |
| --- | --- | --- | --- |
| Blue-Green | Two identical environments; switch DNS | Low (instant rollback) | Seconds |
| Canary | Route 5% traffic to new version, ramp up | Very Low | Seconds |
| Feature Flags | Enable new model/pipeline per user/team | Minimal | Instant |
| Shadow Mode | New version runs in parallel, results compared but not served | Zero | N/A |

## 4. Implementation

### FastAPI Platform Skeleton

```
import time
import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

logger = logging.getLogger("genai-platform")

# ---------- Models ----------

class GenAIRequest(BaseModel):
    prompt: str = Field(..., max_length=32000)
    pipeline: str = Field(default="auto", pattern="^(auto|rag|agent|direct)$")
    model: Optional[str] = None
    max_tokens: int = Field(default=1024, le=4096)
    temperature: float = Field(default=0.3, ge=0, le=1)
    team_id: Optional[str] = None

class GenAIResponse(BaseModel):
    request_id: str
    content: str
    model_used: str
    pipeline_used: str
    tokens_in: int
    tokens_out: int
    latency_ms: float
    cached: bool = False
    cost_usd: float = 0.0

# ---------- App ----------

app = FastAPI(title="GenAI Platform", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"])
```

### Authentication & Rate Limiting Middleware

```
from collections import defaultdict
import asyncio

# Simple in-memory rate limiter (use Redis in production)
class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.rpm = requests_per_minute
        self.requests = defaultdict(list)

    def check(self, team_id: str) -> bool:
        now = time.time()
        window = [t for t in self.requests[team_id] if now - t < 60]
        self.requests[team_id] = window
        if len(window) >= self.rpm:
            return False
        self.requests[team_id].append(now)
        return True

rate_limiter = RateLimiter(requests_per_minute=100)

# Team budgets (USD per month)
TEAM_BUDGETS = {"team-alpha": 500.0, "team-beta": 1000.0, "default": 100.0}
team_spend = defaultdict(float)

# Auth dependency
API_KEYS = {"sk-alpha-xxx": "team-alpha", "sk-beta-yyy": "team-beta"}

async def verify_auth(request: Request) -> str:
    """Extract and verify API key, return team_id."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing Authorization header")
    api_key = auth.split(" ", 1)[1]
    team_id = API_KEYS.get(api_key)
    if not team_id:
        raise HTTPException(401, "Invalid API key")
    return team_id

async def check_rate_limit(team_id: str = Depends(verify_auth)) -> str:
    if not rate_limiter.check(team_id):
        raise HTTPException(429, "Rate limit exceeded")
    return team_id

async def check_budget(team_id: str = Depends(check_rate_limit)) -> str:
    budget = TEAM_BUDGETS.get(team_id, TEAM_BUDGETS["default"])
    if team_spend[team_id] >= budget:
        raise HTTPException(402, f"Monthly budget of ${budget} exceeded")
    return team_id
```

### Request Router & Cost Tracking

```
import anthropic

client = anthropic.Anthropic()

# Cost per 1M tokens (approximate)
MODEL_COSTS = {
    "claude-sonnet-4-20250514": {"input": 3.0, "output": 15.0},
    "claude-haiku-4-20250514":  {"input": 0.25, "output": 1.25},
}

def calculate_cost(model: str, tokens_in: int, tokens_out: int) -> float:
    rates = MODEL_COSTS.get(model, {"input": 5.0, "output": 15.0})
    return (tokens_in * rates["input"] + tokens_out * rates["output"]) / 1_000_000

def classify_pipeline(prompt: str) -> str:
    """Simple classifier to route to the right pipeline."""
    prompt_lower = prompt.lower()
    if any(kw in prompt_lower for kw in ["search", "find", "look up", "what is"]):
        return "rag"
    if any(kw in prompt_lower for kw in ["run", "execute", "book", "schedule"]):
        return "agent"
    return "direct"

@app.post("/v1/generate", response_model=GenAIResponse)
async def generate(
    req: GenAIRequest,
    team_id: str = Depends(check_budget),
):
    request_id = str(uuid.uuid4())
    start = time.time()

    # 1. Route to pipeline
    pipeline = req.pipeline if req.pipeline != "auto" else classify_pipeline(req.prompt)

    # 2. Check semantic cache (simplified)
    cached_response = check_semantic_cache(req.prompt, team_id)
    if cached_response:
        return GenAIResponse(
            request_id=request_id, content=cached_response,
            model_used="cache", pipeline_used=pipeline,
            tokens_in=0, tokens_out=0,
            latency_ms=(time.time() - start) * 1000, cached=True,
        )

    # 3. Call LLM with fallback
    model = req.model or "claude-sonnet-4-20250514"
    try:
        response = client.messages.create(
            model=model,
            max_tokens=req.max_tokens,
            messages=[{"role": "user", "content": req.prompt}],
            temperature=req.temperature,
        )
    except Exception:
        # Fallback to cheaper model
        model = "claude-haiku-4-20250514"
        response = client.messages.create(
            model=model,
            max_tokens=req.max_tokens,
            messages=[{"role": "user", "content": req.prompt}],
            temperature=req.temperature,
        )

    content = response.content[0].text
    tokens_in = response.usage.input_tokens
    tokens_out = response.usage.output_tokens
    cost = calculate_cost(model, tokens_in, tokens_out)

    # 4. Track cost
    team_spend[team_id] += cost

    # 5. Apply guardrails
    content = apply_guardrails(content)

    # 6. Cache response
    store_in_cache(req.prompt, content, team_id)

    # 7. Log for observability
    latency_ms = (time.time() - start) * 1000
    logger.info(json.dumps({
        "request_id": request_id, "team": team_id,
        "pipeline": pipeline, "model": model,
        "tokens_in": tokens_in, "tokens_out": tokens_out,
        "cost_usd": cost, "latency_ms": latency_ms,
    }))

    return GenAIResponse(
        request_id=request_id, content=content,
        model_used=model, pipeline_used=pipeline,
        tokens_in=tokens_in, tokens_out=tokens_out,
        latency_ms=latency_ms, cost_usd=cost,
    )
```

### Semantic Cache Implementation

```
import numpy as np
from typing import Optional

# Simplified semantic cache (use Qdrant/Pinecone in production)
class SemanticCache:
    def __init__(self, similarity_threshold: float = 0.95):
        self.threshold = similarity_threshold
        self.entries = []  # list of (embedding, response, team_id, timestamp)

    def lookup(self, query_embedding: np.ndarray, team_id: str) -> Optional[str]:
        """Find semantically similar cached response."""
        best_score, best_response = 0.0, None
        for emb, resp, tid, ts in self.entries:
            if tid != team_id:  # tenant isolation
                continue
            score = np.dot(query_embedding, emb) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(emb)
            )
            if score > best_score:
                best_score, best_response = score, resp
        return best_response if best_score >= self.threshold else None

    def store(self, embedding: np.ndarray, response: str, team_id: str):
        self.entries.append((embedding, response, team_id, time.time()))

cache = SemanticCache(similarity_threshold=0.95)
```

### Observability Middleware

```
from starlette.middleware.base import BaseHTTPMiddleware

class ObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        start = time.time()

        # Add trace headers
        response = await call_next(request)
        latency = (time.time() - start) * 1000

        response.headers["X-Request-Id"] = request_id
        response.headers["X-Latency-Ms"] = f"{latency:.1f}"

        # Structured log entry
        logger.info(json.dumps({
            "type": "http",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "latency_ms": latency,
        }))
        return response

app.add_middleware(ObservabilityMiddleware)
```

### Health & Cost Reporting Endpoints

```
@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0"}

@app.get("/v1/cost-report/{team_id}")
async def cost_report(team_id: str, _: str = Depends(verify_auth)):
    budget = TEAM_BUDGETS.get(team_id, TEAM_BUDGETS["default"])
    spent = team_spend[team_id]
    return {
        "team_id": team_id,
        "budget_usd": budget,
        "spent_usd": round(spent, 4),
        "remaining_usd": round(budget - spent, 4),
        "utilization_pct": round(spent / budget * 100, 1),
    }

@app.get("/v1/models")
async def list_models(_: str = Depends(verify_auth)):
    return {
        "models": [
            {"id": "claude-sonnet-4-20250514", "tier": "premium", "status": "available"},
            {"id": "claude-haiku-4-20250514", "tier": "standard", "status": "available"},
        ],
        "fallback_chain": ["claude-sonnet-4-20250514", "claude-haiku-4-20250514"],
    }
```

## 5. Data Flow

Here is the end-to-end flow of a request through the Production Platform:

![Data Flow](/diagrams/genai-arch/production-platform-flow.svg)

| Step | Action | Details |
| --- | --- | --- |
| 1 | Client sends request | HTTP POST to /v1/generate with API key in Authorization header |
| 2 | Authentication | Gateway validates API key, extracts team\_id and permissions from JWT claims |
| 3 | Rate limiting | Per-team token bucket checked; 429 returned if exceeded |
| 4 | Budget check | Current month's spend verified against team budget; 402 if exhausted |
| 5 | Request validation | Input length, format, and content policy checks applied |
| 6 | Semantic cache lookup | Request embedded and searched against cached responses (cosine > 0.95); cache hit returns instantly |
| 7 | Pipeline routing | Request classified and routed to RAG, Agent, or Direct LLM pipeline based on content or explicit parameter |
| 8 | Pipeline execution | Selected pipeline processes the request (retrieval + augmentation for RAG, tool loops for Agent, direct call for LLM) |
| 9 | LLM pool call | Request sent to primary model; on failure, automatic fallback to next model in chain |
| 10 | Guardrails applied | Output scanned for PII, toxicity, format compliance; violations trigger redaction or rejection |
| 11 | Response cached | Successful response stored in semantic cache for future similar requests |
| 12 | Cost tracked | Token usage multiplied by model pricing, added to team's running total |
| 13 | Observability logged | Structured log entry with request\_id, team, model, tokens, cost, latency, pipeline sent to logging stack |
| 14 | Response returned | Final response with metadata (request\_id, model\_used, cost, latency) sent to client |

>**Performance Budget:** Platform overhead (auth + rate limit + cache lookup + guardrails + logging) should add less than 50ms to end-to-end latency. The LLM call itself dominates at 500ms-5s depending on model and output length. Measure and optimize the overhead separately.

## 6. Trade-offs & Considerations

| Advantage | Limitation |
| --- | --- |
| Centralized governance, security, and compliance | Significant engineering investment to build and maintain |
| Shared infrastructure reduces per-team cost | Platform team becomes a bottleneck if under-resourced |
| Consistent observability and cost tracking | One-size-fits-all may not fit all team needs |
| Model fallback chains ensure high availability | Additional latency from platform overhead |
| Semantic caching reduces cost and latency | Cache invalidation complexity |
| Feature flags enable safe experimentation | Feature flag debt accumulates over time |
| Multi-tenant isolation protects data | Noisy neighbor problems under high load |

### Infrastructure Options

| Component | Self-Managed | Managed Service |
| --- | --- | --- |
| API Gateway | FastAPI + Nginx | AWS API Gateway, Kong Cloud |
| LLM Routing | Custom router | LiteLLM, Portkey, Helicone |
| Vector DB | Qdrant, Milvus | Pinecone, Weaviate Cloud |
| Observability | Grafana + Prometheus + Jaeger | Datadog, New Relic, Langfuse |
| Compute | Kubernetes (EKS/GKE) | Cloud Run, Lambda, Fargate |
| Caching | Redis Cluster | ElastiCache, Momento |

>**Starting Small:** You do not need all components on day one. Start with: API gateway + auth + single pipeline + cost tracking + basic logging. Add semantic caching, multi-model fallback, and guardrails as usage grows. The architecture diagram shows the end state, not the starting state.

## 7. Production Checklist

This is the most comprehensive checklist in the series — covering every aspect of running a GenAI platform at enterprise scale:

### Security & Authentication

-   API key rotation with zero-downtime (dual-key support during transition)
-   JWT-based auth with team/project/role claims
-   mTLS between internal services
-   Input sanitization to prevent prompt injection attacks
-   Secrets management (Vault, AWS Secrets Manager) for LLM provider keys

### Rate Limiting & Cost Control

-   Per-team and per-user rate limits with configurable RPM/TPM
-   Monthly budget caps per team with soft (alert at 80%) and hard (block at 100%) limits
-   Per-request cost estimation before LLM call (reject if over budget)
-   Daily cost reports emailed to team leads
-   Cost anomaly detection (alert on 3x daily average)

### Reliability & Availability

-   Multi-provider LLM fallback chains with automatic failover
-   Circuit breaker per LLM provider (open after 5 consecutive failures)
-   Health check endpoints for every service component
-   Graceful degradation: serve cached responses during outages
-   Blue-green or canary deployments for all platform updates
-   Auto-scaling based on request queue depth and latency p99

### Observability & Monitoring

-   Distributed tracing (OpenTelemetry) across all services
-   Structured JSON logging with request\_id, team\_id, model, tokens, cost, latency
-   Dashboards: requests/sec, latency p50/p95/p99, error rate, cost per team
-   Alerting on latency spikes, error rate increases, budget thresholds
-   Log retention policy aligned with compliance requirements

### Data & Compliance

-   Immutable audit logs for every request/response (write-once storage)
-   Data retention policies per regulation (GDPR right-to-deletion, HIPAA)
-   PII detection and redaction in both inputs and outputs
-   Multi-tenant data isolation verified by automated tests
-   Model governance: approval workflow before new models go to production
-   Data residency compliance (ensure data stays in required geographic regions)

### Performance & Caching

-   Semantic cache with configurable similarity threshold per use case
-   Cache TTL and invalidation strategy (time-based + event-based)
-   Platform overhead budget: auth + routing + guardrails < 50ms
-   Connection pooling to LLM providers
-   Request queuing with priority levels for burst handling

### Operational Runbooks

-   Runbook: LLM provider outage (switch fallback, notify teams)
-   Runbook: Cost spike investigation (identify team, query, model)
-   Runbook: Security incident (revoke keys, audit logs, notify compliance)
-   Runbook: New team onboarding (API key, budget, namespace setup)
-   Runbook: Model upgrade (shadow deploy, compare metrics, gradual rollout)
-   Disaster recovery tested quarterly with documented RTO/RPO
