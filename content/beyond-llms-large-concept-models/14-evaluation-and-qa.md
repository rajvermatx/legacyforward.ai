---
title: "Evaluation and Quality Assurance"
slug: "evaluation-and-qa"
description: "BLEU and ROUGE are wrong for LCM evaluation. This chapter covers the emerging LCM evaluation landscape: semantic similarity metrics, hierarchical consistency checks, cross-lingual equivalence testing, and a harness template you can adapt immediately."
section: "beyond-llms-large-concept-models"
order: 14
part: "Part 04 Building and Operating"
---

Part 4 — Building and Operating

# Evaluation and Quality Assurance

Evaluating LCM outputs requires rethinking the evaluation stack from the ground up. The standard NLP metrics — BLEU, ROUGE, perplexity — measure token-level surface similarity. They are the wrong metrics for concept-level outputs, for the same reason that a ruler is the wrong tool for measuring temperature. The unit of measurement does not match the property being measured.

This chapter covers what to measure instead, how to measure it, and what the measurements mean for enterprise quality assurance requirements. It closes with an evaluation harness template that teams can adapt for each of the three flagship use cases from Part 03.

### What You Will Learn

- Explain why token-overlap metrics are inappropriate for LCM output evaluation
- Apply semantic similarity metrics in SONAR space as faithfulness and relevance measures
- Design hierarchical consistency checks for planning and synthesis outputs
- Implement cross-lingual equivalence testing for multilingual outputs
- Build and adapt an evaluation harness for long-document reasoning, multilingual synthesis, and hierarchical planning

## 14.1 Why Token-Overlap Metrics Are Wrong

BLEU (Bilingual Evaluation Understudy) and ROUGE (Recall-Oriented Understudy for Gisting Evaluation) measure overlap between a system output and a reference output at the token level. BLEU counts shared n-grams between the output and reference; ROUGE counts shared tokens. A high BLEU score means the output uses many of the same words as the reference. A low BLEU score means it does not.

For token-level generation tasks (machine translation, where the goal is to produce the same tokens as a reference translation), this is a reasonable proxy for quality. For concept-level generation tasks, it is not.

An LCM producing a synthesis of twelve regulatory documents might produce an output that is semantically equivalent to a human reference but uses entirely different vocabulary. The human expert wrote "the applicant bears the burden of proof." The LCM decoded "the filing party must demonstrate compliance." Both sentences mean the same thing. BLEU gives this output a low score because the token overlap is low. The low BLEU score is a measurement artifact, not a signal of quality.

The inverse problem is equally common. An LLM producing output that closely mirrors the surface form of a reference document may score high on BLEU despite the output being globally incoherent — the sentences are there, in similar vocabulary, but they do not add up to a coherent synthesis. BLEU rewards surface similarity; it does not reward conceptual accuracy.

## 14.2 Semantic Similarity Metrics in SONAR Space

The primary quality signal for LCM output evaluation is semantic similarity in SONAR concept space: how close is the output's concept embedding to the reference concept embedding?

**Sentence-level semantic similarity.** For each output sentence, compute its SONAR embedding and the SONAR embedding of the corresponding reference sentence. The cosine similarity is the semantic similarity score for that sentence. Average across all sentences in the output to get a document-level semantic similarity score.

```python
import numpy as np
from sonar.inference_pipelines.text import TextToEmbeddingModelPipeline

encoder = TextToEmbeddingModelPipeline(
    encoder="text_sonar_basic_encoder",
    tokenizer="text_sonar_basic_encoder"
)

def semantic_similarity(
    output_sentences: list[str],
    reference_sentences: list[str],
    lang: str = "eng_Latn"
) -> dict:
    """
    Compute semantic similarity between output and reference at sentence level.
    Assumes sentences are aligned (output[i] corresponds to reference[i]).
    """
    output_embeddings = encoder.predict(output_sentences, source_lang=lang)
    ref_embeddings = encoder.predict(reference_sentences, source_lang=lang)

    sentence_scores = []
    for out_emb, ref_emb in zip(output_embeddings, ref_embeddings):
        out_arr = np.array(out_emb)
        ref_arr = np.array(ref_emb)
        score = np.dot(out_arr, ref_arr) / (
            np.linalg.norm(out_arr) * np.linalg.norm(ref_arr)
        )
        sentence_scores.append(float(score))

    return {
        "mean_similarity": np.mean(sentence_scores),
        "min_similarity": np.min(sentence_scores),
        "sentence_scores": sentence_scores
    }
```

**Cross-lingual semantic similarity.** For multilingual outputs, the reference and output may be in different languages. SONAR's cross-lingual alignment means cosine similarity in concept space is still meaningful: an English output and a French reference will have high similarity if they express the same content.

```python
def cross_lingual_similarity(
    output_text: str,
    output_lang: str,
    reference_text: str,
    reference_lang: str
) -> float:
    """
    Compute semantic similarity between output and reference in different languages.
    """
    out_emb = encoder.predict([output_text], source_lang=output_lang)[0]
    ref_emb = encoder.predict([reference_text], source_lang=reference_lang)[0]

    out_arr, ref_arr = np.array(out_emb), np.array(ref_emb)
    return float(np.dot(out_arr, ref_arr) / (
        np.linalg.norm(out_arr) * np.linalg.norm(ref_arr)
    ))
```

**Semantic similarity thresholds.** What is a "good" semantic similarity score? The threshold depends on the task and the domain. For regulatory and legal content, where precision matters, scores below 0.85 may indicate semantic divergence that warrants human review. For executive summaries, where paraphrase is acceptable, a threshold of 0.75 may be sufficient. Calibrate thresholds empirically by measuring similarity scores on a set of known-good and known-bad outputs, then setting the threshold at the point that separates them.

## 14.3 Hierarchical Consistency Checks

For planning and synthesis outputs that have hierarchical structure, semantic similarity to a reference is not sufficient. The output must also be internally consistent.

**Parent-child alignment.** As defined in Chapter 11: measure the cosine similarity between each child element and its parent element in the output hierarchy. A consistently high alignment score indicates that the output maintains its hierarchical structure. A low alignment score for a specific child indicates scope drift.

**Sibling redundancy.** For each pair of sibling elements (elements at the same level of the hierarchy), measure cosine similarity. High sibling similarity indicates potential redundancy. This check applies to both the generated plan elements and to the synthesis sections in a multi-document output.

**Cross-section contradiction.** For synthesis outputs, measure cross-section semantic similarity with an attention to obligation direction (Chapter 9). High topic similarity + high obligation divergence = potential contradiction between sections.

**Automated consistency report:**

```python
def hierarchical_consistency_report(
    plan_hierarchy: dict,  # {"goal": {...}, "initiatives": [{"text": ..., "workstreams": [...]}, ...]}
    redundancy_threshold: float = 0.90,
    alignment_threshold: float = 0.70
) -> dict:
    """
    Generate a consistency report for a hierarchical plan.
    """
    goal_emb = encoder.predict(
        [plan_hierarchy["goal"]["text"]], source_lang="eng_Latn"
    )[0]

    initiative_texts = [i["text"] for i in plan_hierarchy["initiatives"]]
    initiative_embeddings = encoder.predict(initiative_texts, source_lang="eng_Latn")

    # Parent-child alignment
    alignment_scores = []
    for init_emb in initiative_embeddings:
        score = cosine_similarity(goal_emb, init_emb)
        alignment_scores.append(float(score))

    # Sibling redundancy
    redundant_pairs = []
    for i, (text_a, emb_a) in enumerate(zip(initiative_texts, initiative_embeddings)):
        for j, (text_b, emb_b) in enumerate(zip(initiative_texts, initiative_embeddings)):
            if i >= j:
                continue
            sim = cosine_similarity(emb_a, emb_b)
            if sim >= redundancy_threshold:
                redundant_pairs.append({
                    "element_a": text_a, "element_b": text_b, "similarity": float(sim)
                })

    return {
        "goal_alignment": {
            "mean": float(np.mean(alignment_scores)),
            "min": float(np.min(alignment_scores)),
            "scores_by_initiative": alignment_scores
        },
        "redundant_pairs": redundant_pairs,
        "consistency_score": float(np.mean(alignment_scores)) * (1 - len(redundant_pairs) * 0.05)
    }
```

## 14.4 LLM-as-Judge for Concept-Level Evaluation

Semantic similarity metrics are automated and cheap to run, but they measure a proxy for quality rather than quality directly. LLM-as-judge evaluation provides a richer signal at higher cost.

For LCM outputs, the LLM judge should be given:
- The original task specification (what the LCM was asked to do)
- The LCM's decoded output
- The source documents (or a representative subset)
- A rubric with specific criteria

The rubric for concept-level evaluation differs from token-level evaluation rubrics:

| Criterion | What to Measure | Score Range |
|-----------|----------------|-------------|
| **Faithfulness** | Does every claim in the output trace to the source documents? | 1-5 |
| **Coverage** | Does the output address all key themes from the source documents? | 1-5 |
| **Global coherence** | Are the sections consistent with each other? Does the output contradict itself? | 1-5 |
| **Cross-lingual accuracy** | For multilingual outputs: does the output faithfully represent content from all source languages? | 1-5 |
| **Contradiction detection accuracy** | For comparison tasks: did the system correctly identify genuine contradictions and avoid false positives? | 1-5 |

The LLM judge should never be asked for a single quality score — the dimensions are too different to collapse. Each dimension should be scored independently, with a brief justification.

## 14.5 Evaluation Harness Template

The following template provides a starting structure for LCM evaluation. Adapt the metrics and criteria to your specific use case.

```python
class LCMEvaluationHarness:
    """
    Evaluation harness for LCM outputs.
    Adapt for: long-document reasoning, multilingual synthesis, hierarchical planning.
    """

    def __init__(self, encoder, llm_judge=None):
        self.encoder = encoder
        self.llm_judge = llm_judge  # Optional: for LLM-as-judge evaluation

    def evaluate(
        self,
        task_type: str,  # "long_document", "multilingual_synthesis", "planning"
        system_output: str | dict,
        reference: str | dict,
        source_documents: list[str],
        output_lang: str = "eng_Latn",
        reference_lang: str = "eng_Latn"
    ) -> dict:
        results = {}

        # Always run: semantic similarity
        results["semantic_similarity"] = self._semantic_similarity(
            system_output, reference, output_lang, reference_lang
        )

        # Task-specific checks
        if task_type == "long_document":
            results["contradiction_pairs"] = self._check_contradictions(
                system_output, source_documents
            )

        elif task_type == "multilingual_synthesis":
            results["language_coverage"] = self._check_language_coverage(
                system_output, source_documents
            )

        elif task_type == "planning":
            results["hierarchical_consistency"] = hierarchical_consistency_report(
                system_output
            )

        # Optional: LLM-as-judge
        if self.llm_judge:
            results["llm_judge_scores"] = self._llm_judge_evaluation(
                system_output, source_documents, task_type
            )

        return results

    def _semantic_similarity(self, output, reference, output_lang, reference_lang):
        if output_lang == reference_lang:
            return semantic_similarity(
                split_into_sentences(output),
                split_into_sentences(reference),
                lang=output_lang
            )
        else:
            return cross_lingual_similarity(output, output_lang, reference, reference_lang)

    def _check_contradictions(self, output, source_documents):
        # Compare output claims against source documents for faithfulness
        # Flag output sentences with low similarity to any source sentence
        output_sentences = split_into_sentences(output)
        output_embeddings = self.encoder.predict(output_sentences, source_lang="eng_Latn")

        unfaithful = []
        for sent, emb in zip(output_sentences, output_embeddings):
            max_source_sim = max(
                cosine_similarity(emb, src_emb)
                for doc in source_documents
                for src_emb in self.encoder.predict(
                    split_into_sentences(doc), source_lang="eng_Latn"
                )
            )
            if max_source_sim < 0.70:
                unfaithful.append({"sentence": sent, "max_source_similarity": max_source_sim})

        return {"unfaithful_sentences": unfaithful, "faithfulness_rate": 1 - len(unfaithful) / len(output_sentences)}
```

## Summary

LCM evaluation requires replacing token-overlap metrics with semantic similarity in SONAR space, hierarchical consistency checks, and cross-lingual equivalence testing. The evaluation harness template provides a starting structure adaptable to the three flagship use cases.

- **BLEU and ROUGE are wrong.** Token overlap does not measure semantic accuracy. Cosine similarity in SONAR space does.
- **Three evaluation dimensions.** Semantic similarity (how close to the reference?), hierarchical consistency (is the output internally coherent?), and cross-lingual equivalence (does the multilingual output faithfully represent all source languages?).
- **LLM-as-judge adds depth.** Automated metrics are cheap but shallow. LLM-as-judge with a concept-level rubric provides richer signal at higher cost. Use both.
- **The harness is the starting point.** The template provides structure; adapt the task-specific checks to your domain and use case.

### Exercises

| Type | Exercise | Description |
|------|----------|-------------|
| Coding | **Evaluation harness implementation** | Implement the LCMEvaluationHarness for the long-document reasoning use case. Create a test set of five document pairs with three known-good and two known-bad system outputs. Run the harness on all five. Do the scores separate the good outputs from the bad ones? Which metrics are most discriminating? |
| Design | **Rubric development** | Develop an LLM-as-judge rubric for the cross-lingual regulatory mapping use case from Chapter 7. Define five criteria, write scoring guidance for each level (1-5) for each criterion, and write three exemplar outputs for each criterion at levels 1, 3, and 5. |
| Analysis | **Threshold calibration** | Using the semantic similarity implementation, run the metric on 20 output-reference pairs from your domain: 10 pairs that human experts rate as high quality and 10 that experts rate as low quality. Plot the similarity score distributions for each group. At what threshold does the metric correctly separate the groups? How many high-quality outputs fall below the threshold (false negatives) and how many low-quality outputs exceed it (false positives)? |
