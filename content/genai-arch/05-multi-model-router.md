---
title: "Multi-Model Router"
slug: "multi-model-router"
description: "Intelligently route requests to different LLMs based on task complexity, cost, and latency requirements.
    Use cheap, fast models for simple tasks and reserve expensive, capable models for complex reasoning —
    cutting costs by 60-80% without sacrificing quality where it matters."
section: "genai-arch"
order: 5
badges:
  - "Complexity Classification"
  - "Cost Optimization"
  - "Fallback Chains"
  - "A/B Testing"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai-arch/05-multi-model-router.ipynb"
---

## 1. Architecture Overview

The **Multi-Model Router** pattern replaces a single LLM with a routing layer that dispatches requests to the most appropriate model. Not every request needs the most powerful (and expensive) model. A simple greeting can go to a tiny model; a complex legal analysis needs a frontier model. The router classifies incoming requests and selects the optimal model for each.

This is fundamentally a **cost optimization** architecture. In production, 60-80% of requests are simple enough for small, fast models. By routing those away from expensive models, you can dramatically reduce costs while maintaining quality for the requests that truly need it.

### When to Use

-   High-volume applications where LLM costs are a primary concern
-   Products serving diverse request types (simple FAQ to complex analysis)
-   Latency-sensitive applications where fast responses matter for simple queries
-   Multi-provider strategies for redundancy and best-of-breed selection
-   Gradual model migration (test new models on a subset of traffic)

### Complexity Level

**Moderate.** The routing logic itself is straightforward, but building a good classifier and managing multiple model integrations adds operational complexity. The real challenge is defining "complexity" in a way that reliably predicts which model will produce an acceptable response.

>**Tip:** Start with a simple keyword-based or rule-based router. Only graduate to an LLM-based classifier when you have enough data to understand your traffic patterns. Over-engineering the router is a common mistake.

## 2. Architecture Diagram

![Diagram 1](/diagrams/genai-arch/multi-model-router-1.svg)

Architecture diagram — Multi-Model Router: classify complexity, route to cost-appropriate model

## 3. Components Deep Dive

### Model Selection Criteria

| Criterion | Cheap/Fast Model | Balanced Model | Premium Model |
| --- | --- | --- | --- |
| **Cost (per 1M tokens)** | $0.10 - $0.50 | $2 - $5 | $10 - $30 |
| **Latency (TTFT)** | 50-150ms | 200-500ms | 500-3000ms |
| **Reasoning ability** | Simple extraction, classification | Multi-step, synthesis | Complex analysis, math, code |
| **Context window** | 8K-32K tokens | 128K-200K tokens | 128K-200K tokens |
| **Example models** | Haiku, Flash, GPT-4o-mini | Sonnet, GPT-4o | Opus, o1, o3 |
| **Use cases** | Greetings, FAQ, simple format | Summaries, analysis, code | Legal, math, research, safety |

🔬

#### Classifier Approaches

**Keyword rules:** pattern matching on input. **LLM-based:** use a tiny model to classify complexity. **Embedding similarity:** compare query embedding to cluster centroids of known complexity levels.

🔁

#### Fallback Chains

Try the cheapest viable model first. If response quality is low (detected by a quality check), automatically escalate to the next tier. Balances cost with quality guarantees.

💰

#### Cost Tracking

Log token usage, model selection, and cost per request. Build dashboards showing cost distribution across models, average cost per user, and savings vs. single-model baseline.

🎲

#### A/B Testing

Route a percentage of traffic to different models and compare quality metrics (user satisfaction, task completion, accuracy). Use this data to continuously refine routing rules.

⚡

#### Cascading Strategy

Start with the cheapest model. Run a quality check on the output. If quality is below threshold, re-run with a more capable model. Only ~20% of requests typically need escalation.

🛡

#### Provider Redundancy

Route across multiple providers (Anthropic, OpenAI, Google) for reliability. If one provider is down or rate-limited, automatically failover to an equivalent model on another provider.

>**The 80/20 Rule of Model Routing:** In most applications, ~80% of requests are simple enough for the cheapest model tier. The router's job is to identify the 20% that genuinely need more capability. Even a crude classifier saves significant money.

## 4. Implementation

### Step 1: Define Model Tiers

```
from dataclasses import dataclass
from enum import Enum

class Complexity(Enum):
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"

@dataclass
class ModelConfig:
    name: str
    model_id: str
    cost_per_1m_input: float
    cost_per_1m_output: float
    max_tokens: int

MODELS = {
    Complexity.SIMPLE: ModelConfig(
        name="Haiku", model_id="claude-3-5-haiku-20241022",
        cost_per_1m_input=0.25, cost_per_1m_output=1.25, max_tokens=1024,
    ),
    Complexity.MEDIUM: ModelConfig(
        name="Sonnet", model_id="claude-sonnet-4-20250514",
        cost_per_1m_input=3.0, cost_per_1m_output=15.0, max_tokens=2048,
    ),
    Complexity.COMPLEX: ModelConfig(
        name="Opus", model_id="claude-opus-4-20250514",
        cost_per_1m_input=15.0, cost_per_1m_output=75.0, max_tokens=4096,
    ),
}
```

### Step 2: Build the Complexity Classifier

```
import re

# Approach 1: Rule-based classifier (fast, free)
COMPLEX_PATTERNS = [
    r"analyz", r"compar.*and.*contrast", r"step.by.step",
    r"explain.*why", r"write.*code", r"debug",
    r"legal", r"contract", r"math.*proof",
]
SIMPLE_PATTERNS = [
    r"^(hi|hello|hey)", r"^what is", r"^define",
    r"translate", r"summarize this", r"^yes$|^no$",
]

def classify_rule_based(query: str) -> Complexity:
    """Fast, zero-cost classification using regex patterns."""
    q = query.lower().strip()
    if any(re.search(p, q) for p in COMPLEX_PATTERNS):
        return Complexity.COMPLEX
    if any(re.search(p, q) for p in SIMPLE_PATTERNS) or len(q) < 50:
        return Complexity.SIMPLE
    return Complexity.MEDIUM

# Approach 2: LLM-based classifier (more accurate, costs tokens)
def classify_llm_based(query: str, client) -> Complexity:
    """Use a tiny model to classify complexity."""
    response = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=10,
        system="""Classify the user's query complexity.
Reply with exactly one word: SIMPLE, MEDIUM, or COMPLEX.
SIMPLE: greetings, definitions, basic factual questions, translations
MEDIUM: summaries, explanations, moderate analysis
COMPLEX: multi-step reasoning, code, math, legal, detailed analysis""",
        messages=[{"role": "user", "content": query}],
        temperature=0.0,
    )
    label = response.content[0].text.strip().upper()
    return Complexity(label.lower()) if label.lower() in ["simple", "medium", "complex"] else Complexity.MEDIUM
```

### Step 3: Router with Fallback Chain

```
import anthropic
import time
import logging

logger = logging.getLogger(__name__)

class ModelRouter:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self.request_log = []

    def route(self, query: str, system: str = "You are helpful.") -> dict:
        """Route query to appropriate model with fallback."""
        complexity = classify_rule_based(query)
        model_config = MODELS[complexity]

        # Try primary model, fall back to next tier on failure
        fallback_order = [complexity]
        if complexity == Complexity.SIMPLE:
            fallback_order += [Complexity.MEDIUM, Complexity.COMPLEX]
        elif complexity == Complexity.MEDIUM:
            fallback_order += [Complexity.COMPLEX]

        for tier in fallback_order:
            config = MODELS[tier]
            try:
                start = time.time()
                response = self.client.messages.create(
                    model=config.model_id,
                    max_tokens=config.max_tokens,
                    system=system,
                    messages=[{"role": "user", "content": query}],
                )
                latency = time.time() - start

                # Log routing decision
                usage = response.usage
                cost = (
                    usage.input_tokens * config.cost_per_1m_input / 1_000_000
                    + usage.output_tokens * config.cost_per_1m_output / 1_000_000
                )
                self._log(query, config.name, tier.value, latency, cost)

                return {
                    "text": response.content[0].text,
                    "model": config.name,
                    "tier": tier.value,
                    "latency": round(latency, 3),
                    "cost": round(cost, 6),
                }
            except Exception as e:
                logger.warning(f"Model {config.name} failed: {e}. Trying next tier.")

        raise Exception("All model tiers exhausted")

    def _log(self, query, model, tier, latency, cost):
        self.request_log.append({
            "query_preview": query[:80],
            "model": model, "tier": tier,
            "latency": latency, "cost": cost,
        })

# Usage
router = ModelRouter()
result = router.route("What is Python?")       # → Haiku ($0.0001)
result = router.route("Analyze this contract for liability clauses...")  # → Opus ($0.02)
```

### Advanced: Cascading (Try Cheap First, Escalate)

```
def cascade(self, query: str, quality_threshold=0.7) -> dict:
    """Try cheapest model first, escalate if quality is low."""
    for tier in [Complexity.SIMPLE, Complexity.MEDIUM, Complexity.COMPLEX]:
        result = self._call_model(query, MODELS[tier])

        # Quality check using a fast heuristic or small LLM
        quality = self._check_quality(query, result["text"])
        if quality >= quality_threshold:
            result["quality_score"] = quality
            return result

        logger.info(f"{tier.value} quality {quality:.2f} below threshold, escalating")

    return result  # Return best effort from top tier

def _check_quality(self, query: str, answer: str) -> float:
    """Quick quality check: is the answer relevant and complete?"""
    response = self.client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=5,
        system="Rate answer quality 0.0-1.0. Reply with just the number.",
        messages=[{"role": "user",
                   "content": f"Q: {query}\nA: {answer[:500]}"}],
        temperature=0.0,
    )
    try:
        return float(response.content[0].text.strip())
    except ValueError:
        return 0.5  # Default to medium if parsing fails
```

## 5. Data Flow

Step-by-step flow of a request through the Multi-Model Router:

![Data Flow](/diagrams/genai-arch/multi-model-router-flow.svg)

| Step | Action | Details |
| --- | --- | --- |
| 1 | Request received | User query arrives at the API gateway |
| 2 | Classify complexity | Router analyzes query using rules, embeddings, or a classifier LLM |
| 3 | Select model | Map complexity tier to model configuration (model ID, max tokens, temperature) |
| 4 | Call selected model | Forward request to the chosen LLM provider |
| 5 | Quality gate (optional) | Check response quality; escalate to higher tier if below threshold |
| 6 | Log routing decision | Record model used, latency, token count, cost, and quality score |
| 7 | Return response | Send generated text back to user with model metadata |

## 6. Trade-offs & Considerations

| Advantage | Limitation |
| --- | --- |
| 60-80% cost reduction vs. using premium model for everything | Classifier adds latency and (if LLM-based) its own cost |
| Faster responses for simple queries (small models are faster) | Misrouting degrades user experience (complex query to weak model) |
| Provider redundancy improves reliability | More models = more API integrations to maintain |
| Enables A/B testing and gradual model migration | Quality consistency across models requires careful prompt tuning |
| Cascading guarantees quality floor at reasonable cost | Cascading worst case is slower and costlier than direct premium call |

### Classifier Approach Comparison

| Approach | Accuracy | Latency | Cost | Maintenance |
| --- | --- | --- | --- | --- |
| **Keyword / regex rules** | Low-Medium | ~0ms | Free | Manual rule updates |
| **ML classifier (sklearn)** | Medium-High | ~5ms | Free | Needs labeled data + retraining |
| **Embedding similarity** | Medium | ~50ms | Minimal | Maintain cluster centroids |
| **LLM-as-classifier** | High | ~200ms | $0.0001/req | Prompt tuning |

>**When to upgrade:** If routing decisions need to consider tool availability and multi-step planning, move to Architecture 06 (Agentic Tool Use). If you need to validate outputs before delivery, add Architecture 07 (Eval & Guardrails).

## 7. Production Checklist

-   Build routing dashboard: model distribution, cost by tier, escalation rate
-   Set up A/B testing framework to compare routing strategies
-   Implement automatic fallback when a provider returns errors or high latency
-   Monitor misrouting rate: track user feedback to detect complexity misclassification
-   Set cost budgets per user/team with automatic tier restrictions when exceeded
-   Cache responses for identical queries to avoid re-routing and re-generation
-   Maintain prompt compatibility across models (different models may need prompt tweaks)
-   Log routing decisions with enough context to debug misroutes after the fact
-   Build a labeled test set of queries at each complexity level for classifier evaluation
-   Implement circuit breakers per provider to prevent cascade failures
-   Track and alert on routing distribution drift (sudden shift to more complex queries)
