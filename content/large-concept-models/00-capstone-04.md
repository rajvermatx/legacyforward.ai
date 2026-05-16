---
title: "Capstone 4: LLM-LCM Hybrid Reasoning Pipeline"
slug: "capstone-04"
description: "The enterprise AI stack of 2026 is not LLMs or LCMs — it is LLMs and LCMs, each handling the task type it is built for. This capstone builds the complete hybrid architecture end-to-end: concept router, LCM execution layer, and LLM formatting layer."
section: "large-concept-models"
order: 20
part: "Part 05 Capstones"
---

Part 5 — Capstones

# Capstone 4: LLM-LCM Hybrid Reasoning Pipeline

Every other capstone in this book built a pure-LCM system. This capstone builds what enterprise AI actually looks like in production: a hybrid system where LLMs handle the token-level tasks and LCMs handle the concept-level tasks, and a router determines which is which.

The use case is a knowledge management platform for a multinational professional services firm. The platform handles two types of queries: questions about specific client documents or engagement details (token-level, LLM-appropriate) and cross-engagement synthesis queries that require reasoning across hundreds of documents in multiple languages (concept-level, LCM-appropriate). A single conversational interface must handle both, routing transparently.

This capstone implements the complete stack: LLM-powered concept router, LCM execution layer (the cross-lingual synthesis pipeline from Capstone 2 and the contradiction detection pipeline from Capstone 1, combined), and LLM formatting layer that wraps LCM output in a conversational response.

### What You Will Learn

- Implement the concept router as a production-grade classification component
- Integrate LCM and LLM execution layers behind a unified API
- Build the formatting layer that converts LCM output into conversational responses
- Implement observability across both LLM and LCM pipeline components
- Test the hybrid system for routing accuracy, LCM quality, and end-to-end latency

## C4.1 System Architecture

```
┌─────────────────────────────────────────────────┐
│                  User Interface                  │
└────────────────────────┬────────────────────────┘
                         │ Natural language query
                         ▼
┌─────────────────────────────────────────────────┐
│              Concept Router (LLM)               │
│  Classifies: token_level | concept_level        │
│  Extracts: execution parameters                 │
└──────────────┬──────────────────────────────────┘
               │                │
     token_level                concept_level
               │                │
               ▼                ▼
┌──────────────────┐  ┌────────────────────────────┐
│   LLM Execution  │  │      LCM Execution         │
│   - RAG Q&A      │  │   - SONAR encoding         │
│   - Doc summary  │  │   - Concept-space analysis │
│   - Chat         │  │   - Cross-lingual synthesis│
└──────┬───────────┘  └──────────────┬─────────────┘
       │                             │
       └─────────────┬───────────────┘
                     │ Raw execution output
                     ▼
┌─────────────────────────────────────────────────┐
│           LLM Formatting Layer                  │
│  - Conversational framing                       │
│  - Citation formatting                          │
│  - Follow-up suggestions                        │
└─────────────────────────────────────────────────┘
                     │ Final response
                     ▼
              User Response
```

## C4.2 The Concept Router

```python
from pydantic import BaseModel, Field
from typing import Literal
from openai import OpenAI
import json

client = OpenAI()

class RoutingDecision(BaseModel):
    task_type: Literal["token_level", "concept_level"]
    confidence: float = Field(ge=0.0, le=1.0)
    task_subtype: str
    execution_params: dict
    routing_reason: str

ROUTER_SYSTEM_PROMPT = """
You are a query router for a knowledge management platform. Classify each query as:

TOKEN_LEVEL: Queries answerable from a single document or short context
- Single document Q&A ("What does clause 12.3 of the Smith contract say?")
- Document summarization ("Summarize the Q3 earnings call transcript")
- Factual lookup ("When did the GlobalCorp engagement start?")
- Conversational follow-up on previous response

CONCEPT_LEVEL: Queries requiring cross-document reasoning or cross-lingual synthesis
- Cross-document comparison ("How do our European client contracts compare on IP ownership?")
- Multi-language synthesis ("What are the regulatory trends across our APAC engagements?")
- Contradiction detection ("Do any of our vendor agreements have conflicting IP clauses?")
- Thematic analysis across corpus ("What common challenges appear across our 2024 M&A engagements?")

Return a JSON object matching the RoutingDecision schema.
When confidence < 0.75, default to concept_level (safer to over-route to LCM than under-route).
"""

def route_query(user_query: str, conversation_history: list[dict]) -> RoutingDecision:
    """
    Classify a user query and extract execution parameters.
    """
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": ROUTER_SYSTEM_PROMPT},
            *conversation_history[-4:],  # Recent context
            {"role": "user", "content": f"Query to classify: {user_query}"}
        ],
        response_format={"type": "json_object"},
        temperature=0.1
    )

    result = json.loads(response.choices[0].message.content)
    return RoutingDecision(**result)
```

## C4.3 Token-Level Execution (LLM Path)

```python
DOCUMENT_QA_PROMPT = """
You are a knowledge management assistant for a professional services firm.
Answer the user's question based on the provided document context.
Be precise and cite specific sections where relevant.
If the answer is not in the provided context, say so clearly — do not guess.

Context documents:
{context}

User question: {query}
"""

def execute_token_level(
    query: str,
    execution_params: dict,
    document_store,  # Standard RAG document store
    llm_client: OpenAI
) -> dict:
    """
    Execute a token-level query using LLM + RAG.
    """
    # Retrieve relevant passages
    relevant_docs = document_store.similarity_search(
        query=query,
        k=execution_params.get("top_k", 5),
        filter=execution_params.get("doc_filter", {})
    )

    context = "\n\n".join([
        f"[{doc.metadata['title']}]: {doc.page_content}"
        for doc in relevant_docs
    ])

    # Generate response
    response = llm_client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": DOCUMENT_QA_PROMPT.format(context=context, query=query)
        }],
        temperature=0.2
    )

    return {
        "execution_type": "token_level",
        "raw_output": response.choices[0].message.content,
        "sources": [doc.metadata for doc in relevant_docs],
        "tokens_used": response.usage.total_tokens
    }
```

## C4.4 Concept-Level Execution (LCM Path)

```python
from sonar.inference_pipelines.text import TextToEmbeddingModelPipeline, EmbeddingToTextModelPipeline
import numpy as np

encoder = TextToEmbeddingModelPipeline(
    encoder="text_sonar_basic_encoder",
    tokenizer="text_sonar_basic_encoder"
)
decoder = EmbeddingToTextModelPipeline(
    decoder="text_sonar_basic_decoder",
    tokenizer="text_sonar_basic_decoder"
)

def execute_concept_level(
    query: str,
    execution_params: dict,
    concept_index,  # SONAR-encoded vector database
    concept_model,
    output_lang: str = "eng_Latn"
) -> dict:
    """
    Execute a concept-level query using LCM reasoning over the concept index.
    """
    # Encode the query into concept space
    query_embedding = encoder.predict([query], source_lang="eng_Latn")[0]

    # Retrieve semantically relevant concept embeddings
    top_k = execution_params.get("top_k", 50)
    results = concept_index.search(
        vector=query_embedding.tolist(),
        limit=top_k,
        score_threshold=execution_params.get("threshold", 0.72)
    )

    # Collect context embeddings and metadata
    context_embeddings = []
    context_metadata = []
    for r in results:
        context_embeddings.append(np.array(r.vector))
        context_metadata.append(r.payload)

    if not context_embeddings:
        return {
            "execution_type": "concept_level",
            "raw_output": "No sufficiently relevant documents found for this cross-document query.",
            "sources": [],
            "embeddings_retrieved": 0
        }

    # Concept model synthesizes across retrieved embeddings
    output_embeddings = concept_model.generate(
        context_embeddings=context_embeddings,
        prompt_embeddings=[query_embedding],
        max_output_length=execution_params.get("max_sentences", 8)
    )

    # Decode into output language
    output_sentences = decoder.predict(output_embeddings, target_lang=output_lang)
    raw_output = " ".join(output_sentences)

    # Generate attribution: which source embeddings most influenced the output
    attributions = []
    for out_emb in output_embeddings:
        out_arr = np.array(out_emb)
        scores = [
            (meta, float(np.dot(out_arr, ctx_emb) / (np.linalg.norm(out_arr) * np.linalg.norm(ctx_emb))))
            for ctx_emb, meta in zip(context_embeddings, context_metadata)
        ]
        top_attr = sorted(scores, key=lambda x: x[1], reverse=True)[:2]
        attributions.extend(top_attr)

    return {
        "execution_type": "concept_level",
        "raw_output": raw_output,
        "sources": list({a[0]["doc_id"]: a[0] for a in attributions}.values()),
        "embeddings_retrieved": len(context_embeddings),
        "attribution": attributions[:5]
    }
```

## C4.5 The Formatting Layer

```python
FORMATTER_SYSTEM_PROMPT = """
You are a professional knowledge management assistant. You receive raw analytical output
from a reasoning system and must reformat it as a clear, professional conversational response.

Rules:
- Do not add any information not present in the raw output
- Do not speculate or extrapolate beyond what the raw output contains
- Format citations as [Source: document_title] inline
- End with 1-2 suggested follow-up questions the user might want to ask
- Match the professional but approachable tone appropriate for a consulting firm
- If the raw output says "No relevant documents found," convey this clearly
"""

def format_response(
    user_query: str,
    execution_result: dict,
    llm_client: OpenAI,
    conversation_history: list[dict]
) -> str:
    """
    Convert raw execution output into a conversational response.
    """
    source_refs = "\n".join([
        f"- {src.get('title', src.get('doc_id', 'Unknown'))}"
        for src in execution_result.get("sources", [])
    ])

    formatter_input = f"""
User query: {user_query}
Execution type: {execution_result['execution_type']}
Raw output: {execution_result['raw_output']}
Sources used:
{source_refs if source_refs else "No specific sources"}
"""

    response = llm_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": FORMATTER_SYSTEM_PROMPT},
            *conversation_history[-2:],
            {"role": "user", "content": formatter_input}
        ],
        temperature=0.3
    )

    return response.choices[0].message.content
```

## C4.6 Observability

```python
import time
from dataclasses import dataclass, field

@dataclass
class PipelineTrace:
    trace_id: str
    query: str
    routing_decision: dict
    routing_latency_ms: float
    execution_type: str
    execution_latency_ms: float
    formatting_latency_ms: float
    total_latency_ms: float
    embeddings_retrieved: int = 0
    tokens_used: int = 0
    final_response_length: int = 0
    errors: list[str] = field(default_factory=list)

def run_pipeline_with_observability(
    query: str,
    conversation_history: list[dict],
    document_store,
    concept_index,
    concept_model,
    llm_client: OpenAI
) -> tuple[str, PipelineTrace]:
    """
    Run the complete hybrid pipeline with timing and observability.
    """
    import uuid
    trace_id = str(uuid.uuid4())[:8]
    errors = []

    # Step 1: Route
    t0 = time.time()
    try:
        routing = route_query(query, conversation_history)
        routing_ms = (time.time() - t0) * 1000
    except Exception as e:
        errors.append(f"routing_error: {str(e)}")
        routing = RoutingDecision(
            task_type="token_level",
            confidence=0.5,
            task_subtype="fallback",
            execution_params={},
            routing_reason="Error in router, defaulting to token-level"
        )
        routing_ms = (time.time() - t0) * 1000

    # Step 2: Execute
    t1 = time.time()
    try:
        if routing.task_type == "concept_level":
            execution_result = execute_concept_level(
                query, routing.execution_params, concept_index, concept_model
            )
        else:
            execution_result = execute_token_level(
                query, routing.execution_params, document_store, llm_client
            )
        execution_ms = (time.time() - t1) * 1000
    except Exception as e:
        errors.append(f"execution_error: {str(e)}")
        execution_result = {"execution_type": "error", "raw_output": str(e), "sources": []}
        execution_ms = (time.time() - t1) * 1000

    # Step 3: Format
    t2 = time.time()
    final_response = format_response(query, execution_result, llm_client, conversation_history)
    formatting_ms = (time.time() - t2) * 1000

    trace = PipelineTrace(
        trace_id=trace_id,
        query=query,
        routing_decision=routing.model_dump(),
        routing_latency_ms=routing_ms,
        execution_type=routing.task_type,
        execution_latency_ms=execution_ms,
        formatting_latency_ms=formatting_ms,
        total_latency_ms=routing_ms + execution_ms + formatting_ms,
        embeddings_retrieved=execution_result.get("embeddings_retrieved", 0),
        tokens_used=execution_result.get("tokens_used", 0),
        final_response_length=len(final_response),
        errors=errors
    )

    return final_response, trace
```

## C4.7 Testing and Evaluation

**Routing accuracy test.** Create a labeled test set of 50 queries: 25 token-level, 25 concept-level. Run the router on all 50. Measure accuracy, and analyze misclassifications. Adjust the router prompt based on the error patterns.

**End-to-end quality test.** For each path (token-level and concept-level), create 10 test queries with gold-standard responses. Measure: response faithfulness (does the response match the gold standard?), source attribution accuracy (are the cited sources the correct ones?), and hallucination rate (does the response contain claims not in the source documents?).

**Latency profile.** Run 100 queries through the pipeline and measure the latency breakdown by stage (routing, execution, formatting). For concept-level queries, measure the encoding latency separately from the concept model inference. Identify the bottleneck and assess whether it is within acceptable bounds for your use case.

## Portfolio Project: Knowledge Management Hybrid Assistant

Build a hybrid LLM-LCM knowledge management assistant for a domain you have access to. The system must handle at least two distinct query types from a single conversational interface: one token-level and one concept-level.

Evaluate: routing accuracy on a 30-query test set, response quality for each path (faithfulness, citation accuracy), and end-to-end latency. Document the failure modes you observed and how you addressed them.

## Summary

This capstone built the production hybrid architecture: a concept router that classifies queries, an LCM execution layer for concept-level tasks, an LLM execution layer for token-level tasks, and an LLM formatting layer that produces conversational responses from both. The architecture demonstrates that LLMs and LCMs are not competing choices — they are complementary components of a complete enterprise AI stack.

- **The router is the integration point.** Its accuracy determines whether users get the right capability for their query. Invest in routing quality — it is the highest-leverage component.
- **Attribution is required at the concept level.** The LCM's outputs must be traceable to source documents. Build attribution into the execution layer, not as an afterthought.
- **The formatter decouples quality from conversational fluency.** The LCM produces semantically accurate output; the LLM formatter makes it conversational. Neither can do both well alone.
- **Observability across both layers.** LLM traces and LCM concept-space operations require different instrumentation. Build a unified trace that captures both.
