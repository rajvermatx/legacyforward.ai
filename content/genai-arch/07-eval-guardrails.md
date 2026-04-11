---
title: "Eval & Guardrails"
slug: "eval-guardrails"
description: "Protect your LLM application with input/output validation, safety filters, and automated quality evaluation.
    Guardrails catch prompt injection, PII leaks, toxic content, and malformed outputs before they reach users.
    LLM-as-judge evaluation enables continuous quality monitoring without manua"
section: "genai-arch"
order: 7
badges:
  - "Prompt Injection Detection"
  - "PII Scrubbing"
  - "LLM-as-Judge"
  - "Automated Eval Metrics"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai-arch/07-eval-guardrails.ipynb"
---

## 1. Architecture Overview

The **Eval & Guardrails** architecture wraps your LLM with pre-processing and post-processing layers that validate, filter, and score every interaction. Input guards catch malicious or problematic prompts *before* they reach the model. Output guards validate, sanitize, and quality-check responses *before* they reach the user.

This pattern is non-negotiable for production systems. Without guardrails, your application is vulnerable to prompt injection attacks, PII leakage, toxic output, and inconsistent quality. Without evaluation, you cannot measure whether your system is actually working or degrading over time.

### When to Use

-   Any customer-facing LLM application (chat, search, content generation)
-   Applications handling sensitive data (healthcare, finance, legal)
-   Systems where incorrect or harmful output has real consequences
-   Teams that need to demonstrate compliance and safety to stakeholders
-   Continuous quality monitoring and regression detection across model updates

### Complexity Level

**Moderate.** Individual guard components are straightforward to implement. The challenge is designing a pipeline that is fast enough to not degrade user experience, comprehensive enough to catch edge cases, and flexible enough to update without redeployment.

>**Tip:** Guardrails are not a replacement for good system prompts. They are a safety net. A well-designed system prompt prevents 90% of issues; guardrails catch the remaining 10% that slip through under adversarial conditions.

## 2. Architecture Diagram

![Diagram 1](/diagrams/genai-arch/eval-guardrails-1.svg)

Architecture diagram — Eval & Guardrails: input guards, LLM, output guards, pass/fail gate

## 3. Components Deep Dive

### Input Guards

| Guard | Technique | What It Catches |
| --- | --- | --- |
| **Prompt Injection** | Classifier model, heuristic patterns, canary tokens | "Ignore previous instructions", role-play attacks, delimiter injection |
| **PII Detection** | Regex (SSN, email, phone) + NER models (spaCy, Presidio) | Social Security numbers, credit cards, names, addresses, emails |
| **Topic Filter** | Keyword blocklist + embedding classifier | Off-topic queries, prohibited content categories, competitor mentions |
| **Input Length** | Token counting (tiktoken) | Excessively long inputs designed to waste tokens or overwhelm context |
| **Language Detection** | langdetect, fasttext | Unsupported languages, mixed-language injection attacks |

### Output Guards

| Guard | Technique | What It Catches |
| --- | --- | --- |
| **Safety Classifier** | Toxicity model (Perspective API, OpenAI moderation) | Hate speech, violence, self-harm, explicit content |
| **Factuality Check** | LLM-as-judge, source verification against RAG context | Hallucinated facts, unsupported claims, fabricated citations |
| **Format Validator** | JSON schema validation, regex, Pydantic parsing | Malformed JSON, missing required fields, incorrect data types |
| **PII in Output** | Same PII detection as input, applied to generated text | Model leaking training data, echoing back user PII |
| **Refusal Detector** | Pattern matching on refusal phrases | "I cannot help with that" when the model should have answered |

🛡

#### Prompt Injection Defense

Layer multiple defenses: input classifiers, delimiter isolation (XML tags around user input), canary tokens (unique strings that should never appear in output), and instruction hierarchy in system prompts.

🔒

#### PII Scrubbing

Use **regex** for structured PII (SSN, credit cards, phone numbers) and **NER models** (spaCy, Presidio) for unstructured PII (names, addresses). Replace detected PII with placeholder tokens; optionally restore on output.

⚖

#### LLM-as-Judge

Use a separate LLM call to evaluate response quality on criteria like relevance, accuracy, helpfulness, and safety. Score on a rubric (1-5) with written reasoning. More nuanced than rule-based checks.

📊

#### Automated Eval Metrics

**BLEU/ROUGE:** n-gram overlap with reference. **BERTScore:** semantic similarity via embeddings. **Custom rubrics:** LLM judges domain-specific criteria. Track all metrics over time for regression detection.

🎲

#### A/B Testing Quality

Compare model versions, prompts, or guardrail configurations by routing traffic splits and measuring quality metrics. Statistical significance matters: use proper hypothesis testing, not vibes.

🔄

#### Fallback Strategy

When guardrails block a response: return a safe canned response, retry with a modified prompt, escalate to human review, or return a partial answer with a disclaimer. Never return nothing.

>**Defense in Depth:** No single guard is foolproof. Prompt injection detection has false negatives; PII regex misses novel formats. Layer multiple guards with different techniques. The goal is not perfection but making attacks impractical.

## 4. Implementation

### Step 1: PII Detection Guard

```
import re
from dataclasses import dataclass

@dataclass
class GuardResult:
    passed: bool
    reason: str = ""
    sanitized_text: str = ""
    details: dict = None

PII_PATTERNS = {
    "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "credit_card": re.compile(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b"),
    "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
    "phone": re.compile(r"\b(?:\+1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b"),
    "ip_address": re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"),
}

def detect_pii(text: str, scrub: bool = True) -> GuardResult:
    """Detect and optionally scrub PII from text."""
    found = {}
    sanitized = text

    for pii_type, pattern in PII_PATTERNS.items():
        matches = pattern.findall(sanitized)
        if matches:
            found[pii_type] = len(matches)
            if scrub:
                sanitized = pattern.sub(f"[{pii_type.upper()}_REDACTED]", sanitized)

    if found:
        return GuardResult(
            passed=False,
            reason=f"PII detected: {found}",
            sanitized_text=sanitized,
            details={"pii_found": found},
        )
    return GuardResult(passed=True, sanitized_text=text)
```

### Step 2: Prompt Injection Detection

```
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"you\s+are\s+now\s+(?:a\s+)?(?:new|different)",
    r"system\s*:\s*",
    r"</?(?:system|admin|root)>",
    r"do\s+not\s+follow\s+(?:the\s+)?(?:system|original)",
    r"disregard\s+(?:all\s+)?(?:prior|previous)",
    r"pretend\s+(?:you\s+are|to\s+be)",
    r"jailbreak|DAN\s+mode",
]

def detect_injection(text: str) -> GuardResult:
    """Detect common prompt injection patterns."""
    text_lower = text.lower()

    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text_lower):
            return GuardResult(
                passed=False,
                reason=f"Potential prompt injection detected",
                details={"pattern": pattern},
            )

    # Heuristic: excessive special characters or delimiters
    special_ratio = sum(1 for c in text if c in '{}[]<>|\\`') / max(len(text), 1)
    if special_ratio > 0.15:
        return GuardResult(
            passed=False,
            reason="Suspicious character distribution",
            details={"special_ratio": round(special_ratio, 3)},
        )

    return GuardResult(passed=True)
```

### Step 3: Output Safety and Format Validation

```
import json

def validate_json_output(text: str, schema: dict = None) -> GuardResult:
    """Validate that output is well-formed JSON matching schema."""
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        return GuardResult(passed=False, reason=f"Invalid JSON: {e}")

    if schema:
        # Check required fields
        for field in schema.get("required", []):
            if field not in data:
                return GuardResult(
                    passed=False,
                    reason=f"Missing required field: {field}",
                )
    return GuardResult(passed=True, sanitized_text=text)

def check_output_safety(text: str, client) -> GuardResult:
    """Use LLM to check output for safety issues."""
    response = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=50,
        system="""Evaluate this text for safety issues.
Reply with JSON: {"safe": true/false, "reason": "..."}
Flag: hate speech, violence, self-harm, explicit content,
dangerous instructions, or PII disclosure.""",
        messages=[{"role": "user", "content": text[:2000]}],
        temperature=0.0,
    )
    try:
        result = json.loads(response.content[0].text)
        return GuardResult(
            passed=result["safe"],
            reason=result.get("reason", ""),
        )
    except (json.JSONDecodeError, KeyError):
        return GuardResult(passed=True)  # Fail open if guard errors
```

### Step 4: Full Guard Pipeline

```
import anthropic
import logging

logger = logging.getLogger(__name__)

class GuardedLLM:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self.stats = {"total": 0, "input_blocked": 0, "output_blocked": 0, "passed": 0}

    def query(self, user_input: str, system: str = "You are helpful.") -> dict:
        """Full guarded query pipeline."""
        self.stats["total"] += 1

        # === INPUT GUARDS ===

        # 1. Prompt injection check
        injection = detect_injection(user_input)
        if not injection.passed:
            self.stats["input_blocked"] += 1
            logger.warning(f"Injection blocked: {injection.reason}")
            return {"blocked": True, "reason": "Your message was flagged by our safety system."}

        # 2. PII detection and scrubbing
        pii = detect_pii(user_input, scrub=True)
        clean_input = pii.sanitized_text  # Use scrubbed version

        # === LLM CALL ===
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=system,
            messages=[{"role": "user", "content": clean_input}],
        )
        output_text = response.content[0].text

        # === OUTPUT GUARDS ===

        # 3. Safety check
        safety = check_output_safety(output_text, self.client)
        if not safety.passed:
            self.stats["output_blocked"] += 1
            logger.warning(f"Output blocked: {safety.reason}")
            return {"blocked": True, "reason": "Response did not pass safety review."}

        # 4. PII in output check
        output_pii = detect_pii(output_text, scrub=True)
        final_text = output_pii.sanitized_text

        self.stats["passed"] += 1
        return {
            "blocked": False,
            "text": final_text,
            "guards": {
                "input_pii_found": not pii.passed,
                "output_pii_scrubbed": not output_pii.passed,
            }
        }

# Usage
guard = GuardedLLM()
result = guard.query("My SSN is 123-45-6789. What can I claim on taxes?")
# PII scrubbed before sending to LLM; answer generated safely
```

### Step 5: LLM-as-Judge Evaluation

```
def llm_judge(question: str, answer: str, client, rubric: str = None) -> dict:
    """Evaluate answer quality using LLM-as-judge pattern."""
    default_rubric = """Score the answer on these criteria (1-5 each):
- Relevance: Does it address the question directly?
- Accuracy: Are the facts correct and verifiable?
- Completeness: Does it cover the key aspects?
- Clarity: Is it well-organized and easy to understand?
- Safety: Is it free from harmful or misleading content?

Reply as JSON: {"relevance": N, "accuracy": N, "completeness": N,
"clarity": N, "safety": N, "overall": N, "reasoning": "..."}"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=300,
        system=rubric or default_rubric,
        messages=[{
            "role": "user",
            "content": f"Question: {question}\n\nAnswer: {answer}"
        }],
        temperature=0.0,
    )
    return json.loads(response.content[0].text)
```

## 5. Data Flow

Step-by-step flow of a request through the Eval & Guardrails pipeline:

![Data Flow](/diagrams/genai-arch/eval-guardrails-flow.svg)

| Step | Action | Details |
| --- | --- | --- |
| 1 | User input received | Raw message arrives at API endpoint |
| 2 | Input guard: injection detection | Scan for prompt injection patterns; block if detected |
| 3 | Input guard: PII scrubbing | Detect and replace PII with redaction tokens |
| 4 | Input guard: topic filter | Check if query is within allowed topic scope |
| 5 | LLM generation | Sanitized input sent to LLM with system prompt |
| 6 | Output guard: safety classifier | Check generated text for toxicity, harmful content |
| 7 | Output guard: factuality check | Verify claims against source context (for RAG systems) |
| 8 | Output guard: format validation | Verify JSON schema, required fields, data types |
| 9 | Pass/fail gate | All guards passed: deliver response; any failed: fallback or retry |
| 10 | Logging and evaluation | Record guard decisions, quality scores, and latency for monitoring |

## 6. Trade-offs & Considerations

| Advantage | Limitation |
| --- | --- |
| Prevents prompt injection and data exfiltration | Adds latency (50-500ms per guard, especially LLM-based) |
| Catches PII before it reaches the model or logs | False positives block legitimate queries (user frustration) |
| Ensures consistent output format for downstream systems | LLM-based guards add cost (extra API calls per request) |
| Automated eval enables continuous quality monitoring | No single guard catches all attack vectors (arms race) |
| Compliance and audit trail for regulated industries | Over-aggressive guards can make the product unusable |

### Evaluation Metrics Comparison

| Metric | Type | Strengths | Limitations |
| --- | --- | --- | --- |
| **BLEU** | N-gram overlap | Fast, deterministic | Misses semantic similarity, paraphrases |
| **ROUGE** | Recall-based overlap | Good for summarization | Same limitations as BLEU |
| **BERTScore** | Embedding similarity | Captures semantic meaning | Requires GPU, less interpretable |
| **LLM-as-Judge** | Model-based scoring | Nuanced, multi-criteria | Expensive, potential bias, non-deterministic |
| **Custom rubric** | Domain-specific LLM eval | Tailored to your use case | Requires rubric engineering and calibration |

>**When to upgrade:** Guardrails apply to every architecture. They should be layered on top of Architectures 01-06, not used in isolation. For fine-tuning models to inherently behave safely, see Architecture 08 (Fine-Tuning & Serving).

## 7. Production Checklist

-   Implement at least 3 input guards: injection detection, PII scrubbing, input length validation
-   Implement at least 2 output guards: safety classifier, format validation
-   Build a red team test suite: 50+ adversarial prompts covering known injection techniques
-   Monitor false positive rate: track legitimate queries that guards incorrectly block
-   Set up LLM-as-judge evaluation on a sample of production traffic (daily or weekly batch)
-   Create labeled evaluation dataset with expected answers for regression testing
-   Configure alerts for guard trigger rate spikes (may indicate attack or classifier drift)
-   Implement guard bypass for internal/debugging with proper access controls
-   Version guard configurations and enable rollback without code deployment
-   Run guards in parallel where possible to minimize total latency overhead
-   Document guard coverage gaps and accepted risks for compliance teams
-   Set up A/B testing pipeline to compare guard configurations and their impact on user satisfaction
