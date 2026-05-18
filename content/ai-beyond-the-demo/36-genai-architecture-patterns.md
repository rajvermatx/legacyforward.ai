---
title: "GenAI Architecture Patterns — From Chat to Enterprise"
slug: "genai-architecture-patterns"
description: "Generative AI applications in the enterprise follow a small set of recurring architectural patterns. Understanding these patterns — and their tradeoffs — allows architects to match solutions to problems rather than building bespoke architectures for every use case."
section: "ai-beyond-the-demo"
order: 36
part: "Part IV — Enterprise AI Architecture"
---

Part IV — Enterprise AI Architecture

# GenAI Architecture Patterns — From Chat to Enterprise

The landscape of generative AI applications in the enterprise looks diverse from the outside — chatbots, document analyzers, code generators, search systems — but from an architectural perspective, it resolves into a small set of patterns. Each pattern has a characteristic structure, a characteristic set of failure modes, and a characteristic fit to specific use cases. Architects who recognize the patterns can evaluate vendor solutions, design custom systems, and diagnose production problems with much greater efficiency.

### What You Will Learn

- The five GenAI architecture patterns and when each applies
- The characteristic failure modes of each pattern
- How patterns compose into multi-pattern enterprise systems
- The architectural decisions that are hardest to change after deployment

## 36.1 Pattern 1 — Prompted Completion

**Structure:** System prompt + user input → LLM → response. The simplest GenAI architecture. The system prompt establishes the LLM's role, constraints, and output format. The user input provides the specific task or question. The LLM generates a response.

**Best for:** Customer-facing conversational interfaces, internal Q&A chatbots backed by a general knowledge base, content generation tools where domain specificity is not required.

**Failure modes:** Hallucination (the LLM generates plausible but incorrect responses when it does not know the answer), prompt injection (adversarial user inputs that override the system prompt's instructions), inconsistency (different responses to semantically identical inputs at higher temperature settings), and knowledge cutoff gaps (the LLM does not know about events after its training cutoff).

**Architecture note:** Prompted completion architectures benefit disproportionately from prompt engineering investment. The system prompt is the primary lever for output quality, and systematic prompt evaluation pays off faster in this pattern than in any other.

## 36.2 Pattern 2 — RAG (Retrieval-Augmented Generation)

**Structure:** User query → embedding → vector search → context retrieval → LLM (with retrieved context) → grounded response. The LLM's response is grounded in documents retrieved from a vector database.

**Best for:** Document Q&A over proprietary content, knowledge base search, policy and procedure lookup, any application where the LLM needs access to specific, current, or proprietary information not in its training data.

**Failure modes:** Retrieval failures (the relevant document is not retrieved because the query embedding and document embedding are not close enough), grounding failures (the LLM ignores retrieved context and answers from training data), context overflow (retrieved content exceeds the available context window), and stale index (the vector database is not updated when source documents change).

**Architecture note:** RAG quality is more sensitive to chunking strategy, embedding model choice, and retrieval K tuning than to LLM choice. Many teams that get poor RAG results are under-investing in the retrieval layer and over-investing in prompt engineering. Chapter 24 covers RAG failure modes in detail.

## 36.3 Pattern 3 — Structured Extraction

**Structure:** Document input → LLM with extraction prompt → structured output (JSON, table, key-value pairs). The LLM's role is to extract specific information from unstructured input and return it in a structured format that downstream systems can process.

**Best for:** Contract analysis, invoice processing, form data extraction, document classification, entity recognition at scale.

**Failure modes:** Hallucinated extractions (the LLM invents values for fields that are not present in the document), format non-compliance (the LLM returns output that does not parse as the specified JSON schema), sensitivity to document variation (extraction accuracy drops on document formats not well-represented in the evaluation dataset), and boundary cases (the LLM does not handle "field not present" consistently).

**Architecture note:** Structured extraction architectures benefit from function calling or JSON mode API features that constrain the output to a valid schema. Without output schema enforcement, downstream parsers will encounter format errors at production scale. Output validation — checking that extracted values are within expected ranges, in expected formats, and internally consistent — is essential for extraction quality.

## 36.4 Pattern 4 — Agentic Loop

**Structure:** User goal → LLM (reasoning/planning) → tool selection → tool execution → observation → LLM (next step reasoning) → ... → final response. The LLM operates in a loop, selecting tools to execute, observing results, and planning next steps until the goal is achieved.

**Best for:** Multi-step tasks that require external data or actions, complex research workflows, code generation with test execution, any task where the required actions cannot be determined in advance.

**Failure modes:** Loop instability (the agent cannot make progress and enters an infinite loop), tool failure propagation (a tool error causes cascading failures), context explosion (each loop iteration adds to the context window until it overflows), over-tool-use (the agent takes unnecessary actions before concluding), and irreversible side effects (the agent takes an action that cannot be undone — sends an email, deletes a record — based on an incorrect inference).

**Architecture note:** Agentic loop architectures require explicit failure bounds: maximum iteration counts, timeout limits, and checkpoint mechanisms that allow partial results to be returned if the loop cannot complete. Human-in-the-loop checkpoints for irreversible actions are not optional in production agentic systems. Part V covers agentic patterns in depth.

## 36.5 Pattern 5 — Pipeline (Multi-Step LLM)

**Structure:** Input → LLM step 1 (transformation) → intermediate output → LLM step 2 (transformation) → ... → final output. Multiple LLM calls are chained, each transforming the output of the previous step.

**Best for:** Tasks that are too complex for a single LLM call, tasks where quality improves by separating concerns (extract, then classify, then summarize), document processing workflows with distinct stages (parse, analyze, synthesize, format).

**Failure modes:** Error amplification (an error in an early step propagates and compounds through subsequent steps), latency accumulation (each LLM call adds latency; a five-step pipeline may have 5× the latency of a single call), cost accumulation (same as latency — token costs add across steps), and intermediate representation mismatch (the output format from step N is not the format step N+1 expects).

**Architecture note:** Pipeline architectures should validate intermediate outputs between steps rather than passing them directly to the next step. Validation checkpoints that catch format errors and quality issues early prevent error propagation and reduce the debugging cost when pipelines fail. For latency-critical applications, consider whether steps can be parallelized or whether the pipeline can be simplified.

## 36.6 Composing Patterns

Enterprise AI systems often combine multiple patterns:

**RAG + Agentic Loop:** The agent uses retrieval as one of its tools — querying the vector database when it needs information, executing code or APIs when it needs to take action. This is the most common enterprise agentic architecture.

**Pipeline + Structured Extraction:** A pipeline that processes documents through multiple extraction stages, each extracting different information types, with outputs aggregated into a comprehensive structured record.

**Prompted Completion + RAG:** A customer-facing chat interface where simple conversational exchanges use prompted completion, but product or policy questions trigger a RAG retrieval to ground the response in specific documentation.

The pattern composition decision should be driven by the use case, not by architectural preference. Adding patterns increases complexity; each pattern added is a new failure mode surface to manage. Start with the simplest pattern that meets the requirements, and add complexity only when the simpler pattern demonstrably cannot deliver.
