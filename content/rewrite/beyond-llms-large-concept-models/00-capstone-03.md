---
title: "Capstone 3: Concept-Level Strategic Planner"
slug: "capstone-03"
description: "A technology strategy team produces five-year roadmaps with redundant initiatives, broken dependencies, and contradictory goals baked in by the time they reach the executive committee. This capstone builds the planning assistant that catches all three in concept space before the plan is decoded into prose."
section: "beyond-llms-large-concept-models"
order: 19
part: "Part 05 Capstones"
---

Part 5 — Capstones

# Capstone 3: Concept-Level Strategic Planner

A technology strategy team at a global logistics company generates a five-year digital transformation roadmap every year. The roadmap covers infrastructure modernization, application rationalization, data platform investment, and talent development — four strategic pillars, each with five to eight initiatives, each initiative with three to five workstreams. By the time the roadmap reaches the executive committee, it typically contains: two or three initiatives that are different names for the same program, one or two sequencing errors where a workstream depends on an initiative not scheduled to complete until after the workstream is supposed to start, and at least one pair of initiatives that are strategically contradictory.

The team knows this. They spend the last two weeks before presentation doing a "consistency review" — reading the entire plan looking for these issues. It catches some of them. The executive committee catches others. The ones neither group catches surface during execution.

This capstone builds a planning assistant that runs the consistency review in concept space, where redundancy, sequencing errors, and contradictions are geometric properties — detectable automatically, before the plan is decoded into prose.

## C3.1 Plan Data Model

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

class PlanLevel(str, Enum):
    GOAL = "goal"
    INITIATIVE = "initiative"
    WORKSTREAM = "workstream"
    PROJECT = "project"

class FlagType(str, Enum):
    REDUNDANT = "redundant"
    CONTRADICTORY = "contradictory"
    MISALIGNED = "misaligned"
    DEPENDENCY_CONFLICT = "dependency_conflict"

@dataclass
class PlanElement:
    element_id: str
    level: PlanLevel
    parent_id: Optional[str]
    title: str
    description: str
    dependencies: list[str]  # element_ids that must complete before this starts
    start_quarter: int  # 1-20 for a 5-year plan in quarters
    end_quarter: int
    embedding: list[float] = field(default_factory=list)

@dataclass
class PlanFlag:
    flag_id: str
    flag_type: FlagType
    element_ids: list[str]  # Which elements are flagged
    severity: int  # 1 = critical, 2 = warning, 3 = informational
    description: str
    similarity_score: Optional[float] = None
    divergence_score: Optional[float] = None
    resolution_suggestion: str = ""
    resolved: bool = False
```

## C3.2 Concept-Space Plan Generation

The planning assistant generates plan elements as concept embeddings, conditioned on the strategic goal embedding. Generation happens at each level of the hierarchy, with consistency checks at each level before proceeding to the next.

```python
import numpy as np
from sonar.inference_pipelines.text import TextToEmbeddingModelPipeline, EmbeddingToTextModelPipeline
from lcm.inference import ConceptModel

encoder = TextToEmbeddingModelPipeline(
    encoder="text_sonar_basic_encoder",
    tokenizer="text_sonar_basic_encoder"
)
concept_model = ConceptModel.from_pretrained("facebook/lcm-7b")
decoder = EmbeddingToTextModelPipeline(
    decoder="text_sonar_basic_decoder",
    tokenizer="text_sonar_basic_decoder"
)

def encode_plan_element(element: PlanElement) -> PlanElement:
    """Encode an existing plan element's description into concept space."""
    combined_text = f"{element.title}. {element.description}"
    embedding = encoder.predict([combined_text], source_lang="eng_Latn")[0]
    element.embedding = embedding.tolist()
    return element

def generate_child_elements(
    parent: PlanElement,
    num_children: int,
    level: PlanLevel,
    existing_siblings: list[PlanElement],
    diversity_penalty: float = 0.3
) -> list[PlanElement]:
    """
    Generate concept embeddings for child plan elements.
    Uses diversity penalty to discourage generating redundant children.
    """
    parent_embedding = np.array(parent.embedding)
    sibling_embeddings = [np.array(s.embedding) for s in existing_siblings]

    generated_elements = []

    for i in range(num_children):
        # Generate candidate embedding conditioned on parent
        candidate_embedding = concept_model.generate_single(
            context_embedding=parent_embedding,
            avoid_embeddings=sibling_embeddings + [np.array(e.embedding) for e in generated_elements],
            diversity_penalty=diversity_penalty
        )

        # Decode to get the element description
        description = decoder.predict(
            [candidate_embedding], target_lang="eng_Latn"
        )[0]

        element = PlanElement(
            element_id=f"{parent.element_id}_{level.value}_{i+1:02d}",
            level=level,
            parent_id=parent.element_id,
            title=f"{level.value.capitalize()} {i+1}",  # Will be refined
            description=description,
            dependencies=[],
            start_quarter=parent.start_quarter,
            end_quarter=parent.end_quarter,
            embedding=candidate_embedding.tolist()
        )
        generated_elements.append(element)

    return generated_elements
```

## C3.3 Consistency Checks

```python
def cosine_similarity(a: list[float], b: list[float]) -> float:
    a_arr, b_arr = np.array(a), np.array(b)
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr)))

def check_redundancy(
    elements: list[PlanElement],
    threshold: float = 0.90
) -> list[PlanFlag]:
    """Flag pairs of plan elements at the same level that are semantically redundant."""
    flags = []
    for i, elem_a in enumerate(elements):
        for j, elem_b in enumerate(elements):
            if i >= j:
                continue
            similarity = cosine_similarity(elem_a.embedding, elem_b.embedding)
            if similarity >= threshold:
                flags.append(PlanFlag(
                    flag_id=f"REDUNDANT_{elem_a.element_id}_{elem_b.element_id}",
                    flag_type=FlagType.REDUNDANT,
                    element_ids=[elem_a.element_id, elem_b.element_id],
                    severity=2,
                    description=(
                        f'"{elem_a.title}" and "{elem_b.title}" are semantically similar '
                        f"(similarity: {similarity:.2f}). Review for potential consolidation."
                    ),
                    similarity_score=similarity,
                    resolution_suggestion="Consolidate into a single initiative or clarify distinct scope."
                ))
    return flags

def check_parent_alignment(
    parent: PlanElement,
    children: list[PlanElement],
    threshold: float = 0.65
) -> list[PlanFlag]:
    """Flag children that are poorly aligned with their parent's strategic direction."""
    flags = []
    for child in children:
        alignment = cosine_similarity(parent.embedding, child.embedding)
        if alignment < threshold:
            flags.append(PlanFlag(
                flag_id=f"MISALIGNED_{child.element_id}",
                flag_type=FlagType.MISALIGNED,
                element_ids=[parent.element_id, child.element_id],
                severity=1,
                description=(
                    f'"{child.title}" has low alignment with parent '
                    f'"{parent.title}" (alignment: {alignment:.2f}). '
                    f"This workstream may be out of scope or misassigned."
                ),
                similarity_score=alignment,
                resolution_suggestion="Reassign to a different initiative or redefine scope."
            ))
    return flags

def check_contradiction(
    elements: list[PlanElement],
    strategic_dimension_vectors: dict[str, np.ndarray],
    topic_threshold: float = 0.75,
    divergence_threshold: float = 0.28
) -> list[PlanFlag]:
    """
    Flag pairs that address the same strategic topic but diverge on key dimensions.
    strategic_dimension_vectors: {"growth_reduction": vector, "centralize_decentralize": vector}
    """
    flags = []
    for i, elem_a in enumerate(elements):
        for j, elem_b in enumerate(elements):
            if i >= j:
                continue
            topic_sim = cosine_similarity(elem_a.embedding, elem_b.embedding)
            if topic_sim < topic_threshold:
                continue

            a_arr = np.array(elem_a.embedding)
            b_arr = np.array(elem_b.embedding)

            for dim_name, dim_vector in strategic_dimension_vectors.items():
                a_proj = float(np.dot(a_arr, dim_vector))
                b_proj = float(np.dot(b_arr, dim_vector))
                divergence = abs(a_proj - b_proj)

                if divergence > divergence_threshold:
                    flags.append(PlanFlag(
                        flag_id=f"CONTRADICTION_{elem_a.element_id}_{elem_b.element_id}_{dim_name}",
                        flag_type=FlagType.CONTRADICTORY,
                        element_ids=[elem_a.element_id, elem_b.element_id],
                        severity=1,
                        description=(
                            f'"{elem_a.title}" and "{elem_b.title}" address the same '
                            f"strategic topic (similarity: {topic_sim:.2f}) but diverge "
                            f"on the {dim_name} dimension (divergence: {divergence:.2f}). "
                            f"Potential strategic contradiction."
                        ),
                        similarity_score=topic_sim,
                        divergence_score=divergence,
                        resolution_suggestion=f"Reconcile {dim_name} direction between these initiatives."
                    ))
    return flags

def check_dependency_timeline(
    elements: list[PlanElement],
    all_elements_by_id: dict[str, PlanElement]
) -> list[PlanFlag]:
    """Flag elements whose dependencies finish after the dependent element starts."""
    flags = []
    for element in elements:
        for dep_id in element.dependencies:
            if dep_id not in all_elements_by_id:
                continue
            dependency = all_elements_by_id[dep_id]
            if dependency.end_quarter > element.start_quarter:
                flags.append(PlanFlag(
                    flag_id=f"DEP_CONFLICT_{element.element_id}_{dep_id}",
                    flag_type=FlagType.DEPENDENCY_CONFLICT,
                    element_ids=[element.element_id, dep_id],
                    severity=1,
                    description=(
                        f'"{element.title}" starts in Q{element.start_quarter} '
                        f'but depends on "{dependency.title}" which ends in Q{dependency.end_quarter}. '
                        f"Sequencing conflict."
                    ),
                    resolution_suggestion=(
                        f"Delay start of \"{element.title}\" to Q{dependency.end_quarter + 1} "
                        f"or accelerate completion of \"{dependency.title}\"."
                    )
                ))
    return flags
```

## C3.4 Plan Coherence Score

```python
def compute_plan_coherence(
    goal: PlanElement,
    all_elements: list[PlanElement],
    all_flags: list[PlanFlag]
) -> dict:
    """
    Compute an overall plan coherence score.
    """
    initiatives = [e for e in all_elements if e.level == PlanLevel.INITIATIVE]
    workstreams = [e for e in all_elements if e.level == PlanLevel.WORKSTREAM]

    # Goal-initiative alignment
    goal_alignments = [
        cosine_similarity(goal.embedding, init.embedding) for init in initiatives
    ]

    # Initiative-workstream alignment (per parent)
    ws_alignments = []
    for initiative in initiatives:
        children = [w for w in workstreams if w.parent_id == initiative.element_id]
        for ws in children:
            ws_alignments.append(cosine_similarity(initiative.embedding, ws.embedding))

    critical_flags = [f for f in all_flags if f.severity == 1]
    warning_flags = [f for f in all_flags if f.severity == 2]

    base_score = (
        np.mean(goal_alignments) * 0.4 +
        (np.mean(ws_alignments) if ws_alignments else 0.8) * 0.4 +
        1.0 * 0.2
    )
    penalty = len(critical_flags) * 0.08 + len(warning_flags) * 0.03
    coherence_score = max(0.0, min(1.0, base_score - penalty))

    return {
        "coherence_score": round(coherence_score, 3),
        "goal_initiative_alignment": round(float(np.mean(goal_alignments)), 3),
        "initiative_workstream_alignment": round(float(np.mean(ws_alignments)) if ws_alignments else 0.0, 3),
        "critical_flags": len(critical_flags),
        "warning_flags": len(warning_flags),
        "interpretation": (
            "Strong" if coherence_score >= 0.80 else
            "Acceptable" if coherence_score >= 0.65 else
            "Needs revision"
        )
    }
```

## C3.5 Human-in-the-Loop Review Workflow

```python
def present_flags_for_review(flags: list[PlanFlag], elements_by_id: dict) -> None:
    """
    Display flags prioritized by severity for human review.
    In production, this would be a UI component.
    """
    print(f"\n{'='*60}")
    print(f"PLAN CONSISTENCY REVIEW: {len(flags)} items flagged")
    print(f"{'='*60}\n")

    for severity, label in [(1, "CRITICAL"), (2, "WARNING"), (3, "INFORMATIONAL")]:
        severity_flags = [f for f in flags if f.severity == severity and not f.resolved]
        if not severity_flags:
            continue

        print(f"\n[{label}] — {len(severity_flags)} items\n")
        for flag in severity_flags:
            element_titles = [
                elements_by_id[eid].title for eid in flag.element_ids
                if eid in elements_by_id
            ]
            print(f"  Flag: {flag.flag_id[:16]}")
            print(f"  Type: {flag.flag_type.value}")
            print(f"  Elements: {', '.join(element_titles)}")
            print(f"  Issue: {flag.description}")
            print(f"  Suggestion: {flag.resolution_suggestion}")
            if flag.similarity_score:
                print(f"  Similarity: {flag.similarity_score:.3f}")
            print()
```

## Portfolio Project: Five-Year Technology Transformation Plan

Design and validate a five-year technology transformation plan for a fictional enterprise using the Concept-Level Strategic Planner. Your plan must have:
- 1 strategic goal
- 5–7 initiatives
- 3–5 workstreams per initiative
- At least 3 intentional consistency problems (redundancy, contradiction, dependency conflict) that the system should flag

Run the full consistency check suite. Measure: how many of your intentional problems did the system flag? How many false positives were there? Adjust thresholds to optimize precision and recall. Resolve all flagged items and produce a revised plan with an improved coherence score.

The two-week pre-presentation consistency review is a symptom of generating plans without semantic awareness of what came before. The geometry already contains the answer — the system just has to look.
