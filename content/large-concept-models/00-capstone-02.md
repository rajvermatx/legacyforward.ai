---
title: "Capstone 2: Multilingual Intelligence Brief"
slug: "capstone-02"
description: "A geopolitical intelligence team monitors developments across six regions in four languages. The current process — translate, summarize, synthesize manually — takes five days. This capstone builds the system that synthesizes from multiple languages directly in concept space and delivers the brief in the analyst's language of choice."
section: "large-concept-models"
order: 18
part: "Part 05 Capstones"
---

Part 5 — Capstones

# Capstone 2: Multilingual Intelligence Brief

A geopolitical intelligence team at a multinational energy company monitors policy and regulatory developments across six regions: North America, the EU, the UK, Japan, Brazil, and Indonesia. Relevant content arrives in English, French, German, Japanese, Portuguese, and Indonesian. The current process: route content to regional analysts who translate and summarize, then a senior analyst synthesizes the regional summaries into a weekly brief. End-to-end: five days, minimum.

The bottleneck is not analysis — it is the translation and routing overhead that precedes analysis. SONAR's shared concept space eliminates that overhead. The system in this capstone ingests content in all six languages, reasons over it in concept space without translation, and produces a synthesis in the analyst's language of choice.

### What You Will Learn

- Build a multilingual ingestion pipeline that handles six languages without translation
- Implement cross-lingual thematic clustering to identify common themes across languages
- Generate a synthesized brief from multi-language concept embeddings
- Produce the brief in any SONAR-supported language on demand
- Evaluate synthesis quality using human translator reference outputs

## C2.1 System Architecture

```
[Multilingual Document Ingestion]
    ↓ (SONAR encoding per language)
[Unified Concept Embedding Corpus]
    ↓ (thematic clustering)
[Theme Clusters]
    ↓ (concept model synthesis per theme)
[Synthesized Concept Embeddings]
    ↓ (SONAR decoder → target language)
[Intelligence Brief in Target Language]
```

The key architectural property: language is a property of the input encoding step and the output decoding step. Between those steps, the system operates in language-agnostic concept space. A Japanese regulatory update and a Portuguese regulatory update that address the same policy theme cluster together in concept space, and their synthesis happens without either document being translated.

## C2.2 Multilingual Ingestion

```python
from sonar.inference_pipelines.text import TextToEmbeddingModelPipeline
from dataclasses import dataclass
from datetime import datetime

encoder = TextToEmbeddingModelPipeline(
    encoder="text_sonar_basic_encoder",
    tokenizer="text_sonar_basic_encoder"
)

SONAR_LANG_MAP = {
    "en": "eng_Latn", "fr": "fra_Latn", "de": "deu_Latn",
    "ja": "jpn_Jpan", "pt": "por_Latn", "id": "ind_Latn"
}

@dataclass
class IntelligenceDocument:
    doc_id: str
    title: str
    source_lang: str
    region: str
    publication_date: datetime
    text: str
    sentences: list[str] = None
    embeddings: list[list[float]] = None

def ingest_document(doc: IntelligenceDocument) -> IntelligenceDocument:
    """Encode a document into SONAR concept embeddings."""
    sonar_lang = SONAR_LANG_MAP[doc.source_lang]
    sentences = split_into_sentences(doc.text)
    embeddings = encoder.predict(sentences, source_lang=sonar_lang)

    doc.sentences = sentences
    doc.embeddings = [emb.tolist() for emb in embeddings]
    return doc

def ingest_corpus(documents: list[IntelligenceDocument]) -> list[IntelligenceDocument]:
    """Ingest all documents — language is handled per-document."""
    return [ingest_document(doc) for doc in documents]
```

## C2.3 Cross-Lingual Thematic Clustering

Thematic clustering groups sentences from all documents by their semantic theme, regardless of the language they were written in. The output is a set of clusters, each representing a theme that appears across one or more source languages.

```python
import numpy as np
from sklearn.cluster import KMeans
from collections import defaultdict

@dataclass
class ThemeCluster:
    cluster_id: int
    theme_label: str  # Auto-generated or manually labeled
    sentences: list[dict]  # [{"text": ..., "lang": ..., "doc_id": ..., "region": ...}]
    centroid: list[float]
    languages_represented: list[str]
    regions_represented: list[str]

def cluster_by_theme(
    documents: list[IntelligenceDocument],
    n_clusters: int = 10,
    min_cluster_size: int = 3
) -> list[ThemeCluster]:
    """
    Group all sentences from all documents into thematic clusters.
    Language boundaries are irrelevant — clustering happens in concept space.
    """
    all_embeddings = []
    all_metadata = []

    for doc in documents:
        for sent, emb in zip(doc.sentences, doc.embeddings):
            all_embeddings.append(emb)
            all_metadata.append({
                "text": sent,
                "lang": doc.source_lang,
                "doc_id": doc.doc_id,
                "region": doc.region
            })

    embedding_matrix = np.array(all_embeddings)

    # K-means clustering in concept space
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(embedding_matrix)

    # Group by cluster
    clusters_by_id = defaultdict(list)
    for i, (meta, label) in enumerate(zip(all_metadata, cluster_labels)):
        clusters_by_id[label].append({**meta, "embedding": all_embeddings[i]})

    # Build ThemeCluster objects
    theme_clusters = []
    for cluster_id, sentences in clusters_by_id.items():
        if len(sentences) < min_cluster_size:
            continue

        centroid = kmeans.cluster_centers_[cluster_id].tolist()
        langs = list(set(s["lang"] for s in sentences))
        regions = list(set(s["region"] for s in sentences))

        theme_clusters.append(ThemeCluster(
            cluster_id=cluster_id,
            theme_label=f"Theme_{cluster_id}",  # Auto-label; refine manually
            sentences=sentences,
            centroid=centroid,
            languages_represented=langs,
            regions_represented=regions
        ))

    # Sort by cluster size (most-represented themes first)
    return sorted(theme_clusters, key=lambda c: len(c.sentences), reverse=True)

def auto_label_theme(cluster: ThemeCluster, llm) -> str:
    """Use an LLM to generate a descriptive theme label from cluster sentences."""
    sample_sentences = [s["text"] for s in cluster.sentences[:5]]
    prompt = f"""
    These sentences are from documents in multiple languages (translated for your reference).
    They were grouped together because they are semantically similar.
    Generate a concise 3-7 word theme label that describes what they have in common.

    Sentences:
    {chr(10).join(sample_sentences)}

    Theme label (3-7 words):
    """
    return llm.invoke(prompt).strip()
```

## C2.4 Per-Theme Synthesis

For each theme cluster, the concept model synthesizes the key insights from all languages into a single concept embedding sequence, which is then decoded into the target language.

```python
from lcm.inference import ConceptModel
from sonar.inference_pipelines.text import EmbeddingToTextModelPipeline

concept_model = ConceptModel.from_pretrained("facebook/lcm-7b")
decoder = EmbeddingToTextModelPipeline(
    decoder="text_sonar_basic_decoder",
    tokenizer="text_sonar_basic_decoder"
)

def synthesize_theme(
    cluster: ThemeCluster,
    output_language: str = "eng_Latn",
    max_output_sentences: int = 5
) -> dict:
    """
    Synthesize a theme cluster into a concise summary in the target language.
    Input is concept embeddings from multiple languages; output is in one language.
    """
    # Use the cluster's sentence embeddings as context
    context_embeddings = [np.array(s["embedding"]) for s in cluster.sentences]

    # Synthesis prompt: encoded into concept space as the generation target
    synthesis_prompt = encoder.predict(
        [f"Summarize the key developments and implications for {cluster.theme_label}."],
        source_lang="eng_Latn"
    )

    # Concept model generates synthesis embeddings
    output_embeddings = concept_model.generate(
        context_embeddings=context_embeddings,
        prompt_embeddings=synthesis_prompt,
        max_output_length=max_output_sentences
    )

    # Decode into target language
    output_sentences = decoder.predict(output_embeddings, target_lang=output_language)

    return {
        "theme": cluster.theme_label,
        "languages_synthesized": cluster.languages_represented,
        "regions_synthesized": cluster.regions_represented,
        "synthesis": " ".join(output_sentences),
        "source_count": len(cluster.sentences)
    }
```

## C2.5 Brief Assembly and Delivery

```python
def generate_intelligence_brief(
    theme_syntheses: list[dict],
    output_language: str = "eng_Latn",
    brief_title: str = "Weekly Intelligence Brief",
    max_themes: int = 8
) -> str:
    """
    Assemble per-theme syntheses into a structured intelligence brief.
    """
    lines = [
        f"# {brief_title}",
        f"Generated: {datetime.now().strftime('%Y-%m-%d')}",
        f"Languages synthesized: {', '.join(set(lang for ts in theme_syntheses for lang in ts['languages_synthesized']))}",
        f"Output language: {output_language}",
        "---\n"
    ]

    for i, theme in enumerate(theme_syntheses[:max_themes]):
        lines.extend([
            f"## {i+1}. {theme['theme']}",
            f"*Regions: {', '.join(theme['regions_synthesized'])} | "
            f"Sources: {theme['source_count']} documents in "
            f"{len(theme['languages_synthesized'])} languages*\n",
            theme['synthesis'],
            ""
        ])

    return "\n".join(lines)

# Produce the same brief in multiple languages
for lang_code, lang_name in [("eng_Latn", "English"), ("fra_Latn", "French"), ("jpn_Jpan", "Japanese")]:
    theme_syntheses = [
        synthesize_theme(cluster, output_language=lang_code)
        for cluster in theme_clusters[:8]
    ]
    brief = generate_intelligence_brief(
        theme_syntheses,
        output_language=lang_code,
        brief_title=f"Weekly Intelligence Brief — {lang_name}"
    )
    # Save or distribute the brief
```

## C2.6 Evaluation

Evaluate synthesis quality by comparing system output against reference briefs produced by human multilingual analysts.

**Coverage metric:** For each theme cluster, does the synthesis mention the key facts from each source language? Ask a bilingual domain expert to verify coverage for each language represented in the cluster.

**Faithfulness metric:** Does every claim in the synthesis trace to at least one source sentence in the cluster? Use the semantic similarity harness from Chapter 14 to measure faithfulness: each synthesis sentence should have at least one source sentence with similarity above 0.75.

**Cross-lingual coverage equity:** Are themes from low-volume languages (fewer source documents) represented proportionally? Compute the representation rate for each language: sentences from that language / total sentences in the cluster. Verify that the synthesis references content from all represented languages, not just the most frequent one.

## Portfolio Project: Multilingual Intelligence Brief

Select a domain with publicly available multilingual content. Good options:
- **Climate policy:** IPCC reports and national climate plans (English, French, Spanish, Chinese)
- **Financial regulation:** Central bank policy statements across major economies
- **Technology policy:** AI regulation documents from EU, US, UK, and China

Your system must: ingest documents in at least three languages, cluster by theme in concept space, synthesize each theme into a coherent paragraph, produce the brief in at least two output languages, and evaluate synthesis quality using at least one of the metrics above.

## Summary

This capstone demonstrated multilingual synthesis without translation: SONAR encoding in each source language, clustering in shared concept space, concept model synthesis, and decoding into any target language. The architecture treats language as a rendering concern, not a reasoning constraint.

- **Clustering in concept space is cross-lingual by default.** K-means on SONAR embeddings groups sentences by meaning, not by language.
- **Synthesis happens before decoding.** The concept model reasons over embeddings from all languages simultaneously. The target language is chosen at decode time.
- **The same synthesis, multiple languages.** Producing the brief in French or Japanese requires only changing the decoder's target language parameter — the synthesis is done once.
- **Evaluate coverage per language.** The risk is that high-volume languages dominate the synthesis. Measure representation equity across languages explicitly.
