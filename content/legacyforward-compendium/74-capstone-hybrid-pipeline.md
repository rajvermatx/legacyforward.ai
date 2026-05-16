---
title: "Capstone: LLM-LCM Hybrid Reasoning Pipeline"
slug: "capstone-hybrid-pipeline"
description: "Build a hybrid LLM-LCM pipeline that uses LCM concept-level encoding for corpus-scale document reasoning and LLM generation for final output quality — demonstrating the complementary architecture that covers the full enterprise AI task range."
section: "legacyforward-compendium"
order: 74
part: "Part VII — Capstones"
---

Part VII — Capstones

# Capstone: LLM-LCM Hybrid Reasoning Pipeline

This final capstone integrates the two most advanced architectural threads in the compendium: LCM-based concept-level reasoning (Part VI, Chapters 58–62) and LLM-based generation and instruction-following (throughout). The hybrid pipeline demonstrates the complementary architecture — each model type handling the tasks it handles best — and provides a template for enterprise teams building the next generation of knowledge processing systems.

## Scenario

A law firm's knowledge management team wants to build a system that can answer complex research questions by reasoning across a corpus of 10,000 legal cases, statutes, and regulatory documents. The questions require:
- Finding relevant precedents across the full case corpus (corpus scale → LCM advantage)
- Understanding how statutes relate to cases (relationship reasoning → GraphRAG advantage)
- Producing clear, citation-grounded legal summaries (fluent generation → LLM advantage)

No single model handles all three requirements well. The hybrid pipeline routes each requirement to the appropriate model.

## Architecture

```
Research Question
    │
    ▼
[Query Analyzer]
    │
    ├─── Corpus search required? ──► [LCM Retrieval Stage]
    │                                    │
    │                                    ▼
    │                               Concept-level matches
    │                                    │
    ├─── Graph traversal required? ─► [GraphRAG Stage]
    │                                    │
    │                                    ▼
    │                               Relationship context
    │                                    │
    └─── LLM retrieval? ──────────► [Standard RAG Stage]
                                         │
                                         ▼
                                    Document chunks
                                         │
                                         ▼
                               [Context Assembler]
                                         │
                                         ▼
                            [LLM Generation + Polish]
                                         │
                                         ▼
                              Cited Research Summary
```

## Implementation

**Stage 1 — Query Analysis:**
```python
query_analysis_prompt = """
Analyze this research question and determine what retrieval strategies are needed:
1. CORPUS_SCALE: requires searching across many documents (>100) for thematic patterns
2. RELATIONSHIP: requires understanding connections between cases, statutes, or parties
3. SPECIFIC_DOCUMENT: retrieving specific content from known document types

Question: {question}

Return JSON: {corpus_scale: bool, relationship: bool, specific_document: bool, reasoning: str}
"""

analysis = llm.generate(query_analysis_prompt.format(question=question))
routing = json.loads(analysis)
```

**Stage 2A — LCM Retrieval (if corpus_scale):**
```python
# Encode the research question as a concept vector
question_concept = sonar_encoder.predict(
    [question], source_lang="eng_Latn"
)[0]

# Find concept-similar passages across the full 10,000-document corpus
# (This search operates in concept space, not token space)
similar_passages = vector_store.search(
    query_vector=question_concept,
    top_k=20,
    filter={"doc_type": ["case", "statute", "regulation"]}
)

# Use LCM to reason over the retrieved passages
lcm_context = prepare_lcm_context(similar_passages)
lcm_analysis = lcm.generate(lcm_context)  # concept-level synthesis

# Decode to English text
decoded_analysis = sonar_decoder.predict(
    lcm_analysis.concept_vectors,
    target_lang="eng_Latn"
)
```

**Stage 2B — GraphRAG (if relationship):**
```python
# Extract entities from the question
entities = extract_entities(question)  # [case names, statute references, parties]

# Traverse the legal knowledge graph
graph_context = []
for entity in entities:
    node = graph.find_node(entity)
    if node:
        # Find related cases, statutes, and regulatory interpretations
        neighbors = graph.traverse(
            node_id=node.id,
            relationship_types=["CITES", "INTERPRETS", "OVERRULES", "HARMONIZES_WITH"],
            depth=2
        )
        graph_context.extend(neighbors)

# Convert graph traversal results to text context
graph_text = format_graph_context(graph_context)
```

**Stage 2C — Standard RAG (if specific_document):**
```python
# Standard embedding-based retrieval for specific document content
question_embedding = embedding_model.encode(question)
rag_results = vector_store.search(
    query_vector=question_embedding,
    top_k=5,
    filter={"doc_type": ["case_brief", "statute_text"]}
)
rag_context = [r.text for r in rag_results]
```

**Stage 3 — Context Assembly and LLM Generation:**
```python
assembled_context = {
    "lcm_synthesis": decoded_analysis if routing["corpus_scale"] else None,
    "graph_relationships": graph_text if routing["relationship"] else None,
    "specific_documents": rag_context if routing["specific_document"] else None
}

final_prompt = f"""
You are a legal research assistant. Answer the following research question using the provided context.
Requirements:
- Cite specific cases, statutes, or regulations for each claim
- Note when claims are supported by multiple sources vs. single sources
- Identify any tensions or conflicts in the sources
- Use precise legal language appropriate for attorney review

Question: {question}

Context from corpus-level analysis:
{assembled_context["lcm_synthesis"] or "Not applicable"}

Context from relationship graph:
{assembled_context["graph_relationships"] or "Not applicable"}

Context from specific documents:
{chr(10).join(assembled_context["specific_documents"]) if assembled_context["specific_documents"] else "Not applicable"}
"""

final_answer = llm.generate(final_prompt)
```

## Evaluation Framework

**End-to-end evaluation:**

The hybrid pipeline must be evaluated as a complete system, not stage by stage:

- **Retrieval coverage:** Do the three retrieval stages collectively surface all the sources a human legal researcher would consult for this question?
- **Generation accuracy:** Does the final answer correctly represent what the retrieved sources say?
- **Citation completeness:** Is every factual claim attributed to a specific source?
- **Routing correctness:** Does the query analyzer correctly identify which retrieval stages are needed?

**Stage-specific failure modes:**

LCM stage failures: concept-level matches that are topically related but legally distinct; decoded text that is semantically correct but legally imprecise
Graph stage failures: entity resolution errors (two names for the same case); outdated relationships in the graph
RAG stage failures: standard vector retrieval failures (vocabulary mismatch, chunking artifacts)
LLM stage failures: conflating sources, generating plausible but uncited claims, missing legal nuances in the synthesis

## Key Learning Points

**Routing is architecturally critical.** A hybrid pipeline that routes all queries through all stages is expensive and slow. The query analyzer that routes to only the necessary stages is the difference between a pipeline that costs $0.05 per query and one that costs $0.50 per query — a 10x cost difference that compounds at scale.

**Context assembly requires weighting, not concatenation.** Dumping LCM output, graph context, and RAG chunks into a single LLM prompt produces prompts where the most important context may be in the middle (recall the primacy/recency effect). Explicitly label each context source and include an instruction for the LLM to weight authoritative sources (primary statutes, recent case law) over secondary analysis.

**The hybrid pipeline is the end of the journey and the beginning of the real work.** This capstone demonstrates the most advanced pattern in the compendium. But shipping it in production requires all of the operational disciplines covered in earlier chapters: MLOps (Chapter 37), observability (Chapter 43), security (Chapter 42), and continuous evaluation (Chapter 27). The architecture is only as good as the engineering discipline that operates it.

The hybrid LLM-LCM pipeline is where the LegacyForward practitioner journey culminates — not at a single model or a single pattern, but at a synthesis that draws on every layer of the compendium to build AI systems that are capable, reliable, governable, and built to last on top of the enterprise stack that will still be there when the next generation of AI arrives.
