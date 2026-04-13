---
title: "Code Review Agent"
slug: "capstone-02"
description: "Every engineering team has felt it: a pull request sits in the queue for two days because the only person who knows that subsystem is on vacation. When it finally gets reviewed, the reviewer catches a style violation and a missing null check but misses the SQL injection hiding behind a string interp"
section: "agenticai"
order: 17
part: "Part 05 Capstones"
---

Part 5 — Capstones

# Code Review Agent

Every engineering team has felt it: a pull request sits in the queue for two days because the only person who knows that subsystem is on vacation. When it finally gets reviewed, the reviewer catches a style violation and a missing null check but misses the SQL injection hiding behind a string interpolation on line 247. Code reviews are simultaneously the most important quality gate in software development and the most inconsistent. This capstone builds an automated PR reviewer that combines static analysis, security scanning, style enforcement, and LLM-generated natural-language feedback into a single agent pipeline: the kind of system that ships in your portfolio and demonstrates every pattern from Parts 1 through 4.

Reading time: ~25 min Project: Automated PR Reviewer Variants: DevOps, FinTech, Healthcare, Open Source, Mobile, Data Engineering

### What You Will Learn

-   Design an orchestrator agent that delegates code analysis to specialist worker agents
-   Integrate Git operations and webhook-driven triggers into an agentic pipeline
-   Build AST-parsing and pattern-matching tools for syntax, style, and security analysis
-   Implement confidence scoring so the agent distinguishes hard errors from soft suggestions
-   Generate natural-language review comments that cite specific lines and explain reasoning
-   Deploy the complete system behind a webhook endpoint with observability and cost controls

## C2.1 The Problem: Reviews Are Bottlenecks

Software teams treat code review as a prerequisite for merging, and rightly so. Reviews catch bugs, enforce architectural standards, and transfer knowledge across the team. But the process has three structural weaknesses that no amount of process documentation fixes. First, reviews are **inconsistent**: the same diff reviewed by two engineers produces different findings because each reviewer carries different mental models. Second, reviews are **slow**: the median time-to-first-response for a PR in a large organization is four hours, and complex changes often wait more than a day. Third, reviews are **shallow on security**: spotting injection vulnerabilities or insecure deserialization requires specialized knowledge that generalist engineers do not exercise daily.

An automated code review agent does not replace human reviewers. It handles the mechanical work, style enforcement, known vulnerability patterns, documentation gaps, so that humans can focus on architecture, intent, and edge cases requiring domain judgment.

> Scope Check
> 
> This capstone builds a *review assistant*, not a replacement for human judgment. The agent posts comments and flags issues; a human approves or requests changes. This human-in-the-loop pattern (Chapter 11) is essential for trust. Teams that ship fully autonomous merge bots discover quickly that LLMs hallucinate false positives, and nothing erodes developer trust faster than a bot blocking a correct PR.

## C2.2 System Overview

The code review agent receives a webhook when a pull request is opened or updated. It extracts the diff, routes it through parallel analysis workers, merges findings into a unified report with confidence scores, generates human-readable comments with line-level citations, and posts them back to the pull request. The entire pipeline runs in under ninety seconds for a typical 300-line diff.

1.  **Trigger & Extraction.** A webhook endpoint receives the PR event, clones the repository at the target commit, and computes a structured diff with file paths, hunks, and line numbers.
2.  **Parallel Analysis.** Three specialist workers run concurrently: a security scanner, a style checker, and an LLM-powered logic analyzer.
3.  **Finding Merge.** The orchestrator collects results, deduplicates overlapping findings, and assigns confidence scores (0.0–1.0) based on corroboration across workers.
4.  **Comment Generation.** An LLM generates natural-language review comments for each finding, citing the exact file, line range, and code snippet.
5.  **Posting.** The agent posts inline comments on the PR via the platform API, batching low-confidence findings into a single summary.

![Diagram 1](/diagrams/agenticai/capstone-02-1.svg)

Figure C2-1. Code review pipeline: from PR webhook through parallel analysis to posted review comments.

## C2.3 Architecture: Orchestrator and Specialist Workers

The system follows the supervisor-worker pattern from Chapter 10. An orchestrator agent receives the structured diff and delegates to three workers, each with its own tools, system prompt, and output schema.

| Worker | Tools | Output |
| --- | --- | --- |
| **Security Scanner** | Regex matcher, CVE lookup, entropy-based secret detector | Findings with CWE identifiers, severity, and affected lines |
| **Style Checker** | AST parser, lint rule engine, naming validator | Style violations with rule references and auto-fix suggestions |
| **Logic Analyzer** | LLM chain-of-thought (no external tools) | Bugs, edge cases, complexity warnings with reasoning traces |

The security scanner and style checker are **deterministic tools** that the agent wraps, while the logic analyzer is a **pure LLM reasoning task**. Two of three workers produce reproducible results independent of model temperature. The third contributes creative reasoning that static tools cannot provide.

> Why Not One Big Prompt?
> 
> A single prompt that says “review this code for security, style, and logic” produces scattered, low-confidence output. By splitting into specialist workers, each has a narrower scope and structured output schema. The orchestrator can compare and merge results, catching cases where the security scanner flags a line that the logic analyzer considers safe.

## C2.4 Git Integration and Diff Extraction

The pipeline begins when a webhook delivers a PR event. The handler validates the signature, extracts base and head SHAs, and computes a structured diff. We parse raw diffs into dataclasses so every downstream worker receives clean, typed data.

```
@dataclass
class DiffHunk:
    start_line: int
    end_line: int
    content: str
    added_lines: list[int] = field(default_factory=list)

@dataclass
class FileDiff:
    path: str
    language: str
    hunks: list[DiffHunk] = field(default_factory=list)
    is_new: bool = False

def extract_structured_diff(repo_path: str, base: str, head: str) -> list[FileDiff]:
    raw = subprocess.run(
        ["git", "diff", "--unified=5", f"{base}...{head}"],
        cwd=repo_path, capture_output=True, text=True, check=True,
    ).stdout
    files, current_file, current_hunk = [], None, None
    for line in raw.splitlines():
        if line.startswith("diff --git"):
            path = line.split(" b/")[-1]
            current_file = FileDiff(path=path, language=_detect_language(path))
            files.append(current_file)
        elif line.startswith("@@") and current_file:
            start = int(line.split(" ")[2].split(",")[0].lstrip("+"))
            current_hunk = DiffHunk(start_line=start, end_line=start, content="")
            current_file.hunks.append(current_hunk)
        elif current_hunk is not None:
            current_hunk.content += line + "\n"
            if line.startswith("+") and not line.startswith("+++"):
                current_hunk.added_lines.append(current_hunk.end_line)
            current_hunk.end_line += 1
    return files
```

## C2.5 Building the Security Scanner

The security scanner applies pattern-matching rules to added lines. It uses regex patterns, entropy calculations, and a curated rule database — no LLM calls. This makes it fast, reproducible, and auditable.

```
@dataclass
class SecurityFinding:
    rule_id: str
    severity: str       # "critical", "high", "medium", "low"
    cwe: str
    file: str
    line: int
    snippet: str
    message: str
    confidence: float   # 0.0 to 1.0

SECURITY_RULES = [
    {"id": "SEC-001", "cwe": "CWE-89", "severity": "critical",
     "pattern": re.compile(r"""f['\"].*(?:SELECT|INSERT|UPDATE|DELETE)\s.*\{""", re.I),
     "message": "SQL injection via f-string. Use parameterized queries.",
     "confidence": 0.92},
    {"id": "SEC-002", "cwe": "CWE-798", "severity": "high",
     "pattern": re.compile(r"""(?:password|secret|api_key)\s*=\s*['\"][^'\"]{8,}['\"]"""),
     "message": "Hardcoded credential. Move to environment variables.",
     "confidence": 0.85},
    {"id": "SEC-003", "cwe": "CWE-79", "severity": "high",
     "pattern": re.compile(r"""\.innerHTML\s*=\s*[^;]*(?:user|input|query)""", re.I),
     "message": "XSS via innerHTML with user data. Use textContent or sanitize.",
     "confidence": 0.80},
    {"id": "SEC-004", "cwe": "CWE-502", "severity": "critical",
     "pattern": re.compile(r"""pickle\.loads?\s*\("""),
     "message": "Unsafe deserialization. Use json or a safe serializer.",
     "confidence": 0.95},
]

def scan_security(files: list[FileDiff]) -> list[SecurityFinding]:
    findings = []
    for f in files:
        for hunk in f.hunks:
            for i, line in enumerate(hunk.content.splitlines()):
                if not line.startswith("+"):
                    continue
                code = line[1:]
                for rule in SECURITY_RULES:
                    if rule["pattern"].search(code):
                        findings.append(SecurityFinding(
                            rule_id=rule["id"], severity=rule["severity"],
                            cwe=rule["cwe"], file=f.path,
                            line=hunk.start_line + i, snippet=code.strip(),
                            message=rule["message"], confidence=rule["confidence"],
                        ))
                # Entropy-based secret detection
                for token in re.findall(r"""['\"]([^'\"]{20,})['\"]""", code):
                    if _entropy(token) > 4.5:
                        findings.append(SecurityFinding(
                            rule_id="SEC-ENT", severity="high", cwe="CWE-798",
                            file=f.path, line=hunk.start_line + i,
                            snippet=code.strip(), confidence=0.70,
                            message=f"High-entropy string ({_entropy(token):.1f}) "
                                    f"may be a hardcoded secret.",
                        ))
    return findings
```

> False Positive Management
> 
> Every static analysis tool generates false positives. This system uses three strategies: (1) confidence scores let the orchestrator suppress low-confidence findings, (2) a `.reviewignore` file lets developers mark intentional patterns like test fixtures, and (3) the LLM-generated comment explains *why* the pattern was flagged, giving developers enough context to dismiss false positives quickly.

## C2.6 AST Parsing and Style Checking

The style checker uses Abstract Syntax Tree parsing for structural awareness beyond regex. It understands scope, type annotations, and function signatures. Analysis is scoped to lines modified in the diff — developers rightly object when a bot comments on code they did not touch.

```
class PythonStyleAnalyzer(ast.NodeVisitor):
    def __init__(self, path: str, changed_lines: set[int]):
        self.path = path
        self.changed = changed_lines
        self.findings: list[StyleFinding] = []

    def visit_FunctionDef(self, node):
        if node.lineno not in self.changed:
            return self.generic_visit(node)
        length = (node.end_lineno or node.lineno) - node.lineno
        if length > 40:
            self._add("STY-001", node.lineno,
                f"Function '{node.name}' is {length} lines. Extract helpers.",
                "Break into smaller single-responsibility functions.", 0.80)
        if node.returns is None and not node.name.startswith("_"):
            self._add("STY-002", node.lineno,
                f"Public function '{node.name}' lacks return type annotation.",
                "Add -> ReturnType after parameters.", 0.85)
        if len(node.args.args) > 5:
            self._add("STY-003", node.lineno,
                f"Function '{node.name}' has {len(node.args.args)} params.",
                "Group related parameters into a dataclass.", 0.75)
        self.generic_visit(node)

    def visit_ExceptHandler(self, node):
        if node.lineno in self.changed and node.type is None:
            self._add("STY-004", node.lineno,
                "Bare except catches KeyboardInterrupt and SystemExit.",
                "Catch a specific exception type.", 0.95)
        self.generic_visit(node)

    def _add(self, rule_id, line, message, suggestion, confidence):
        self.findings.append(StyleFinding(
            rule_id=rule_id, file=self.path, line=line,
            message=message, suggestion=suggestion, confidence=confidence))
```

## C2.7 The Logic Analyzer: LLM-Powered Reasoning

The logic analyzer is the only worker that uses the LLM for its core analysis. It applies chain-of-thought reasoning (Chapter 5) to identify bugs, edge cases, and design problems that no static rule can catch.

```
class LogicFinding(BaseModel):
    file: str
    start_line: int
    end_line: int
    category: str       # "bug", "edge_case", "complexity", "performance"
    severity: str       # "error", "warning", "suggestion"
    description: str
    reasoning: str      # Chain-of-thought explanation
    suggestion: str
    confidence: float

LOGIC_SYSTEM_PROMPT = """You are an expert code reviewer. Analyze the diff
for bugs, edge cases, and design issues. Rules:
1. Focus ONLY on added/changed lines (starting with +).
2. Explain reasoning step by step for each finding.
3. Confidence: 0.9+ = certain bug, 0.7-0.9 = likely issue, 0.5-0.7 = suggestion.
4. Do NOT flag style or security issues (other workers handle those).
5. Cite specific line numbers and code snippets."""

def analyze_logic(files, client, model="gpt-4o"):
    context = "\n\n".join(
        f"### {f.path} (lines {h.start_line}-{h.end_line})\n```{f.language}\n{h.content}```"
        for f in files if not f.is_new for h in f.hunks
    )[:30_000]
    response = client.beta.chat.completions.parse(
        model=model, temperature=0.2,
        messages=[
            {"role": "system", "content": LOGIC_SYSTEM_PROMPT},
            {"role": "user", "content": f"Review this diff:\n\n{context}"},
        ],
        response_format=LogicAnalysisResult,
    )
    return response.choices[0].message.parsed
```

The temperature is 0.2 for analytical consistency. The system prompt explicitly excludes style and security concerns, preventing overlap with the deterministic workers. Pydantic structured output (Chapter 6) ensures the orchestrator can process findings programmatically.

## C2.8 The Orchestrator: Merging and Confidence Scoring

The orchestrator runs all three workers concurrently, normalizes their outputs into a unified schema, and deduplicates overlapping findings. When multiple independent workers flag the same line, confidence is boosted. A SQL injection found by both regex and LLM reasoning is more credible than either alone.

```
async def run_review_pipeline(files, client, config):
    security_task = asyncio.to_thread(scan_security, files)
    style_task = asyncio.to_thread(analyze_style, files)
    logic_task = asyncio.to_thread(analyze_logic, files, client, config["model"])

    security, style, logic = await asyncio.gather(
        security_task, style_task, logic_task)

    # Normalize into UnifiedFinding, then deduplicate
    unified = _normalize(security, style, logic.findings)
    merged = _deduplicate(unified)

    threshold = config.get("confidence_threshold", 0.6)
    return [f for f in merged if f.confidence >= threshold]

def _deduplicate(findings):
    by_loc = {}
    for f in findings:
        by_loc.setdefault((f.file, f.line), []).append(f)
    merged = []
    for group in by_loc.values():
        primary = max(group, key=lambda f: f.confidence)
        all_sources = list({s for f in group for s in f.sources})
        # Each corroborating source adds 0.1, capped at 1.0
        primary.confidence = min(1.0, primary.confidence + 0.1 * (len(all_sources) - 1))
        primary.sources = all_sources
        merged.append(primary)
    return merged
```

## C2.9 Generating Natural-Language Comments

Raw findings need transformation into readable, actionable PR comments. The comment generator uses a structured prompt to produce comments that start with a severity indicator, state the issue in one sentence, show the problematic snippet, explain the risk, and suggest a fix — all within 150 words.

```
COMMENT_PROMPT = """Write a code review comment for this finding.
Format: severity indicator, one-sentence issue, code snippet, why it matters,
specific fix suggestion. Keep under 150 words.

Finding: {file}:{line} [{severity}] {message}
Reasoning: {reasoning}
Snippet: {snippet}"""

async def generate_comments(findings, file_contents, client, model="gpt-4o"):
    comments = []
    for f in findings:
        snippet = _extract_snippet(file_contents.get(f.file, ""), f.line)
        resp = await asyncio.to_thread(lambda: client.chat.completions.create(
            model=model, temperature=0.3, max_tokens=300,
            messages=[{"role": "user", "content": COMMENT_PROMPT.format(
                file=f.file, line=f.line, severity=f.severity,
                message=f.message, reasoning=f.reasoning, snippet=snippet)}],
        ))
        comments.append(ReviewComment(
            file=f.file, line=f.line,
            body=resp.choices[0].message.content, severity=f.severity))
    return comments
```

## C2.10 Posting Comments and the Webhook Endpoint

The final stage posts review comments atomically as a single GitHub review. The `event` is always `"COMMENT"`. The agent surfaces information but never approves or blocks a PR.

```
async def post_review(comments, repo, pr_number, commit_sha, token):
    review_body = {
        "commit_id": commit_sha,
        "event": "COMMENT",  # Never auto-approve or request changes
        "body": f"**Code Review Agent** found **{len(comments)}** item(s).",
        "comments": [
            {"path": c.file, "line": c.line, "body": c.body}
            for c in comments
        ],
    }
    async with httpx.AsyncClient() as http:
        resp = await http.post(
            f"https://api.github.com/repos/{repo}/pulls/{pr_number}/reviews",
            json=review_body,
            headers={"Authorization": f"Bearer {token}",
                     "Accept": "application/vnd.github.v3+json"},
        )
        resp.raise_for_status()

@app.post("/webhook")
async def handle_webhook(request: Request):
    # Validate signature, extract PR data, run pipeline, post review
    payload = await request.json()
    if payload.get("action") not in ("opened", "synchronize"):
        return {"status": "skipped"}
    pr = payload["pull_request"]
    files = extract_structured_diff(repo_path, pr["base"]["sha"], pr["head"]["sha"])
    findings = await run_review_pipeline(files, client, config)
    comments = await generate_comments(findings, get_contents(files), client)
    await post_review(comments, payload["repository"]["full_name"],
                      pr["number"], pr["head"]["sha"], GITHUB_TOKEN)
    return {"findings": len(findings), "comments": len(comments)}
```

> Never Auto-Approve
> 
> The `event` field is always `"COMMENT"`, never `"APPROVE"` or `"REQUEST_CHANGES"`. An automated agent should surface information, not make merge decisions. Teams that trust the agent after weeks of calibration can upgrade to `"REQUEST_CHANGES"` for critical-severity findings only.

## C2.11 Observability and Cost Control

A production review agent needs monitoring across three dimensions: **correctness** (are findings useful?), **latency** (does the review post before the developer context-switches?), and **cost** (how many tokens per review?). Track three key metrics: the dismissal rate (how often developers dismiss findings), the catch rate (how often the agent flags real issues), and the cost per review.

```
async def run_pipeline_instrumented(files, client, config):
    start = time.monotonic()
    total_lines = sum(len(h.added_lines) for f in files for h in f.hunks)
    logger.info("review.started", files=len(files), lines=total_lines)

    findings = await run_review_pipeline(files, client, config)
    elapsed = time.monotonic() - start

    # Cost estimation: ~15 tokens/line, GPT-4o pricing
    est_tokens = total_lines * 15
    logger.info("review.completed", findings=len(findings),
                seconds=round(elapsed, 2),
                est_cost_usd=round(est_tokens * 0.000005, 4))
    return findings
```

> Feedback Loop
> 
> Store every finding and its resolution (accepted, dismissed, modified) in a database. Periodically review dismissed findings: if `SEC-002` is dismissed 40% of the time in test files, add a suppression rule for `**/test_*.py`. This feedback loop turns a noisy tool into a trusted teammate.

## Portfolio Project: Build Your Code Review Agent

Build and deploy a complete automated PR review agent. Your agent must receive webhook events, run at least two analysis workers in parallel, merge findings with confidence scores, and post inline review comments. Include a `.reviewignore` file for false positive suppression and structured logging for observability.

### Choose Your Domain Variant

**DevOps Pipeline Reviewer** Dockerfile, CI/CD YAML, IaC. Flag insecure base images, exposed ports, missing health checks, overly permissive IAM.

**FinTech Compliance Checker** PCI-DSS violations: logged card numbers, unencrypted PII, missing audit trails, transaction validation gaps.

**Healthcare HIPAA Scanner** PHI exposure in logs, unencrypted data at rest, missing access controls, HIPAA-relevant data flows.

**Open Source Maintainer Bot** License compatibility, API breaking changes, documentation coverage, test completeness. Contributor-friendly tone.

**Mobile App Reviewer** Permission escalation, insecure local storage, certificate pinning, background data leaks, platform anti-patterns.

**Data Pipeline Auditor** Schema drift, missing validation, null propagation, partition skew, cost-explosive query patterns in ETL code.

## Summary

This capstone assembled a complete automated PR review agent combining deterministic static analysis with LLM-powered reasoning. The supervisor-worker pattern runs three specialist agents in parallel — security scanning, style checking, and logic analysis — then merges findings with confidence scoring and posts natural-language review comments.

### Key Takeaways

-   **Separate deterministic tools from LLM reasoning.** Static rules for security and style are reproducible and auditable; reserve the LLM for judgment calls requiring contextual reasoning about logic, edge cases, and design.
-   **Confidence scoring turns noise into signal.** Every finding carries a 0.0–1.0 score. Corroborating sources boost confidence. A configurable threshold lets teams tune thoroughness versus noise.
-   **Scope analysis to the diff.** Developers lose trust in tools that comment on lines they did not change. Restrict analysis to added and modified lines only.
-   **Post comments, never approvals.** Use `COMMENT` not `APPROVE` or `REQUEST_CHANGES`. Surface information for human decision-makers; prevent false positives from blocking merges.
-   **Build the feedback loop from day one.** Track dismissal rates, catch rates, and cost per review. Store every finding and resolution to tune rules and thresholds over time.

### Exercises

Conceptual

**Confidence Calibration.** The security scanner assigns `pickle.loads` a confidence of 0.95 and high-entropy strings 0.70. A team finds 30% of entropy findings are false positives (UUID constants) while pickle findings are 100% correct. How would you adjust scores, and what data would you collect to automate calibration?

Coding

**Multi-Language Support.** The style checker handles only Python via `ast`. Extend it to JavaScript/TypeScript using tree-sitter. Implement three rules: arrow function consistency, unused imports, and missing error handling in async/await chains. Match the existing `StyleFinding` schema.

Design

**Rate Limiting and Cost Budgets.** A monorepo with 50 developers generates 200 PRs/day. Each review uses ~15k input and ~3k output tokens. Design a system to stay within $500/month: consider per-PR token caps, priority queues for security paths, caching for unchanged files, and graceful degradation when budget is exhausted.