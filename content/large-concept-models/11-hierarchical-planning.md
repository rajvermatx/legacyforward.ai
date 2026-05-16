---
title: "Hierarchical Planning and Structured Reasoning"
slug: "hierarchical-planning"
description: "Strategic roadmaps, project decomposition, and multi-phase planning require maintaining consistency across levels and steps. Concept-space arithmetic enables the operations that planning requires — and that LLMs fail on consistently."
section: "large-concept-models"
order: 11
part: "Part 03 Enterprise Application"
---

Part 3 — Enterprise Application

# Hierarchical Planning and Structured Reasoning

A major US bank's technology transformation team spent six months developing a five-year IT modernization plan with a top consulting firm. The plan ran to 400 pages and covered 180 legacy systems across 23 business divisions. Three months after delivery, the internal architecture team identified 14 initiatives that were semantically redundant (two different program names for the same modernization), 6 initiative pairs that were sequenced in an order that violated their stated dependencies, and 3 strategic goals that were internally contradictory.

The consulting firm had not been careless. They had used a combination of structured workshops, document templates, and LLM-assisted drafting. The problem was that LLM-assisted drafting generates each section with limited semantic reference to the others. The sections were individually coherent. The plan was not.

This chapter covers the LCM architecture for hierarchical planning: how concept-space arithmetic enables consistency checks across plan levels, and how to build a planning assistant that catches the failures before they reach delivery.

### What You Will Learn

- Explain why hierarchical planning is a concept-level task
- Design a concept-space consistency check for hierarchical plans
- Implement redundancy detection and contradiction detection for plan elements
- Build a reference architecture for an LCM-powered strategic planning assistant
- Integrate human-in-the-loop review at the points where LCM consistency checks flag issues

## 11.1 Why Planning Fails at Token Level

Hierarchical plans have a structure that token-level generation handles poorly: a goal decomposes into initiatives, initiatives decompose into workstreams, workstreams decompose into projects, projects decompose into tasks. Consistency must hold both vertically (each level must be semantically aligned with the level above) and horizontally (elements at the same level must not be redundant or contradictory).

Token-level generation fails horizontally. An LLM generating initiative 3 attends to the tokens in initiatives 1 and 2, but the attention weight for content that appeared many tokens ago is lower than for recent content. By the time the model is generating initiative 7, the detailed semantic content of initiative 1 is weakly represented in the attention context. The model cannot reliably detect that initiative 7 is semantically redundant with initiative 1 if they use different vocabulary.

Token-level generation also fails at the vocabulary-independence requirement of cross-level consistency. "Modernize the payments infrastructure" and "Upgrade the transaction processing platform" may be two names for the same initiative, or they may be different initiatives that touch overlapping systems. Token-level similarity will not distinguish the cases reliably. Concept-level similarity in SONAR space is a better proxy for semantic equivalence.

## 11.2 Concept-Space Operations for Planning

Three concept-space operations support hierarchical plan validation.

**Redundancy detection.** Two plan elements at the same level are redundant if their concept embeddings are above a similarity threshold. The threshold must be calibrated to the domain: strategic initiatives in the same organization will share vocabulary and be naturally closer in concept space than initiatives in different organizations, so the redundancy threshold must be higher to avoid over-flagging.

```python
import numpy as np
from itertools import combinations

def detect_redundant_pairs(
    plan_elements: list[dict],
    redundancy_threshold: float = 0.92
) -> list[tuple[dict, dict, float]]:
    """
    Identify pairs of plan elements that are semantically redundant.
    plan_elements: list of {"id": str, "text": str, "embedding": list[float]}
    """
    redundant_pairs = []

    for a, b in combinations(plan_elements, 2):
        a_emb = np.array(a["embedding"])
        b_emb = np.array(b["embedding"])
        similarity = np.dot(a_emb, b_emb) / (
            np.linalg.norm(a_emb) * np.linalg.norm(b_emb)
        )
        if similarity >= redundancy_threshold:
            redundant_pairs.append((a, b, float(similarity)))

    return sorted(redundant_pairs, key=lambda x: x[2], reverse=True)
```

**Cross-level alignment.** Each initiative should be semantically close to its parent goal. A workstream that drifts far from its parent initiative in concept space may be misassigned, may address the wrong problem, or may represent a scope creep that the planning team has not recognized.

```python
def check_vertical_alignment(
    parent: dict,
    children: list[dict],
    alignment_threshold: float = 0.70
) -> list[dict]:
    """
    Identify child elements that are poorly aligned with their parent.
    Low parent-child similarity indicates scope drift or misassignment.
    """
    parent_emb = np.array(parent["embedding"])
    misaligned = []

    for child in children:
        child_emb = np.array(child["embedding"])
        alignment = np.dot(parent_emb, child_emb) / (
            np.linalg.norm(parent_emb) * np.linalg.norm(child_emb)
        )
        if alignment < alignment_threshold:
            misaligned.append({**child, "parent_alignment": float(alignment)})

    return sorted(misaligned, key=lambda x: x["parent_alignment"])
```

**Contradiction detection.** Two plan elements at the same level may address the same topic with contradictory implications. "Reduce the workforce in technology operations by 20%" and "Expand the technology operations center by hiring 50 senior engineers" are contradictory. Their concept embeddings will be close in topic (both about technology operations workforce) but diverge on the headcount direction dimension.

This requires a precomputed direction vector in concept space that encodes the growth/reduction dimension — similar to the obligation direction from Chapter 9. For planning use cases, direction vectors encoding growth/reduction, centralization/decentralization, build/buy, and other common strategic tension dimensions are the most useful.

## 11.3 Reference Architecture: LCM Strategic Planning Assistant

The complete planning assistant follows the same four-stage LCM pattern from Chapter 9, adapted for hierarchical plan generation and validation.

**Stage 1: Goal encoding.** The user provides the high-level strategic goal in natural language. The goal is encoded by SONAR into a goal concept embedding. This embedding becomes the semantic anchor for all subsequent plan generation — every initiative, workstream, and project will be checked for alignment against this anchor.

**Stage 2: Hierarchical concept generation.** The concept model generates concept embeddings for each level of the hierarchy, top-down. Goal → Initiative concept embeddings → Workstream concept embeddings → Project concept embeddings. At each level, the concept model generates N candidate elements for the level, each encoded as a concept embedding, and the consistency checks run before the level is decoded into natural language.

**Stage 3: Consistency validation.** Before decoding any plan element, run the three consistency checks: redundancy detection (flag pairs above threshold), cross-level alignment (flag children below alignment threshold), and contradiction detection (flag pairs that are close in topic but divergent on key strategic dimensions). The validation runs in concept space — no decoding required for the validation step. Only elements that pass validation are decoded.

**Stage 4: Structured plan output.** Validated concept embeddings are decoded into natural language plan elements. The decoded plan includes: the plan hierarchy, the consistency validation results (elements flagged for human review), and the overall plan coherence score (the average parent-child alignment across all levels).

```python
class HierarchicalPlanningAssistant:
    def __init__(self, encoder, concept_model, decoder):
        self.encoder = encoder
        self.concept_model = concept_model
        self.decoder = decoder

    def generate_plan(
        self,
        strategic_goal: str,
        num_initiatives: int = 5,
        num_workstreams_per_initiative: int = 3,
        lang: str = "eng_Latn"
    ) -> PlanResult:
        # Encode strategic goal
        goal_embedding = self.encoder.predict([strategic_goal], source_lang=lang)[0]

        # Generate initiative concept embeddings
        initiative_embeddings = self.concept_model.generate_children(
            parent_embedding=goal_embedding,
            num_children=num_initiatives,
            diversity_weight=0.3  # Penalize similarity among siblings
        )

        # Check initiative-level redundancy
        initiatives_with_embeddings = [
            {"id": f"I{i}", "embedding": emb.tolist()}
            for i, emb in enumerate(initiative_embeddings)
        ]
        redundant_initiatives = detect_redundant_pairs(
            initiatives_with_embeddings, threshold=0.90
        )

        # Decode initiatives (for non-redundant ones)
        decoded_initiatives = []
        flagged_for_review = []

        for item in initiatives_with_embeddings:
            if any(item["id"] in (r[0]["id"], r[1]["id"]) for r in redundant_initiatives):
                flagged_for_review.append({**item, "flag": "potential_redundancy"})
            else:
                decoded_text = self.decoder.predict(
                    [item["embedding"]], target_lang=lang
                )[0]
                decoded_initiatives.append({**item, "text": decoded_text})

        # Generate and validate workstreams for each initiative
        # ... (similar pattern for each level)

        return PlanResult(
            goal=strategic_goal,
            initiatives=decoded_initiatives,
            flagged_elements=flagged_for_review,
            coherence_score=self._compute_coherence(
                goal_embedding, initiative_embeddings
            )
        )

    def _compute_coherence(self, goal_embedding, child_embeddings):
        """Mean parent-child alignment score."""
        goal = np.array(goal_embedding)
        scores = []
        for child_emb in child_embeddings:
            child = np.array(child_emb)
            scores.append(np.dot(goal, child) / (
                np.linalg.norm(goal) * np.linalg.norm(child)
            ))
        return float(np.mean(scores))
```

## 11.4 Human-in-the-Loop Integration

The planning assistant does not replace human judgment — it structures it. The consistency checks produce a prioritized review agenda: the plan elements most likely to be redundant, misaligned, or contradictory. Human reviewers focus on these flagged elements rather than reading the entire plan for consistency.

The workflow:
1. System generates plan concept embeddings and runs consistency checks
2. System decodes validated elements into natural language
3. Flagged elements are presented to human reviewers with context: which other element they are similar to, their similarity score, and the semantic dimension on which they diverge
4. Reviewers resolve flagged items: confirm redundancy and remove one, clarify scope to reduce similarity, or clear the flag if the similarity is coincidental
5. System re-encodes resolved elements and re-runs consistency checks for the affected levels
6. Repeat until no items remain flagged above threshold

This iterative loop is the standard pattern for LCM-assisted planning tasks. The LCM handles the semantic consistency computation; humans handle the judgment calls about organizational priorities, political feasibility, and domain-specific context that the model does not have.

## Summary

Hierarchical planning is a concept-level task because plan consistency — redundancy, cross-level alignment, contradiction — is a semantic property, not a syntactic one. Concept-space operations (similarity, alignment, direction projection) provide the computational substrate for checking these properties. The reference architecture generates plan elements in concept space, validates before decoding, and presents flagged items to human reviewers.

- **LLMs fail horizontally.** Attention decay means LLMs cannot reliably detect redundancy or contradiction between elements separated by many tokens in a long plan document.
- **Three operations: redundancy, alignment, contradiction.** Each maps to a concept-space geometry operation with a calibratable threshold.
- **Human-in-the-loop is the design.** The LCM handles semantic consistency computation; humans handle judgment. The combination is better than either alone.
- **Coherence score as a plan quality metric.** Mean parent-child alignment across all levels is a single number that summarizes plan coherence — useful for tracking quality across plan iterations.

### Exercises

| Type | Exercise | Description |
|------|----------|-------------|
| Coding | **Redundancy detector** | Encode 15 strategic initiative descriptions from a fictional five-year technology transformation plan using SONAR. Compute pairwise cosine similarities. Plot as a heatmap. Identify which pairs exceed your redundancy threshold. Manually review the flagged pairs: are they genuinely redundant, or is the high similarity a coincidence of vocabulary? Adjust the threshold based on your findings. |
| Design | **Direction vector construction** | The contradiction detector requires a precomputed direction vector encoding the growth/reduction strategic tension. Describe how you would construct this direction vector in SONAR concept space. What sentence pairs would you use as positive examples (growth) and negative examples (reduction)? How would you compute the direction vector from these examples? |
| Analysis | **Coherence score calibration** | A planning team produces three different five-year roadmaps for the same strategic goal. Compute the coherence score (mean parent-child alignment) for each. Does the coherence score correlate with the human reviewers' assessment of which plan is the most internally consistent? What would it mean if the coherence score and human assessment disagree? |
