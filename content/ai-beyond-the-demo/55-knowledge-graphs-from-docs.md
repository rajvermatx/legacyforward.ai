---
title: "Building Knowledge Graphs from Documents"
slug: "knowledge-graphs-from-docs"
description: "Enterprise knowledge is locked in documents. Knowledge graph construction — extracting entities and relationships from unstructured text and representing them as a queryable graph — is one of the highest-value applications of LLMs for enterprise data architecture."
section: "ai-beyond-the-demo"
order: 55
part: "Part VI — Advanced AI Patterns"
---

Part VI — Advanced AI Patterns

# Building Knowledge Graphs from Documents

Most enterprise knowledge lives in documents: contracts, policies, reports, emails, meeting notes, technical specifications. This knowledge is accessible to humans who read the documents but is inaccessible to AI systems that need to reason across it — because documents are unstructured, and AI systems that reason across large document corpora need the relationships between concepts to be explicit, not buried in prose.

Knowledge graph construction transforms unstructured document knowledge into structured, queryable graph data. It is one of the most impactful things an organization can do to make its document knowledge AI-accessible.

### What You Will Learn

- The knowledge graph construction pipeline
- LLM-powered entity and relationship extraction
- Graph schema design for enterprise knowledge domains
- Quality control for AI-extracted knowledge

## 55.1 The Knowledge Graph Construction Pipeline

Knowledge graph construction from documents follows a four-stage pipeline:

**Stage 1: Document preprocessing.** Load and parse documents into clean text. Handle format diversity (PDFs, Word documents, HTML, email threads). Apply basic cleaning: remove headers, footers, and navigation elements that are not semantic content. Segment long documents into sections that can be processed as units.

**Stage 2: Entity extraction.** Identify named entities in each document section — the people, organizations, locations, dates, products, regulations, and domain-specific entities that the knowledge graph will represent. LLMs perform entity extraction more accurately than rule-based NER systems for complex enterprise document types, because they understand context and can identify domain-specific entity types without explicit rule programming.

**Stage 3: Relationship extraction.** Identify the relationships between extracted entities. "Contract C is governed by Regulation R", "Person P is employed by Organization O", "Product X is approved for Market M". Relationship extraction is more difficult than entity extraction because it requires understanding the semantic meaning of the connection between entities.

**Stage 4: Graph construction.** Create graph nodes for each unique entity and edges for each relationship. Resolve duplicates — the same entity may appear under different names across documents (a person referred to by full name in some documents and initials in others). Merge duplicate entities and their associated relationships.

## 55.2 LLM-Powered Extraction

LLMs perform entity and relationship extraction through structured prompting.

**Entity extraction prompt pattern:**

```
System: You are a knowledge extraction system. Extract all named entities from the provided text.
Return a JSON array where each element has:
- "entity_text": the text as it appears in the document
- "entity_type": one of [Person, Organization, Location, Product, Regulation, Date, Amount, Other]
- "context": a brief excerpt showing the entity's context

Text: [document section]
```

**Relationship extraction prompt pattern:**

```
System: Given the following entities extracted from a document, identify the relationships between them.
Return a JSON array where each element has:
- "subject": the entity text of the subject
- "relationship": a concise relationship type in SCREAMING_SNAKE_CASE (e.g., EMPLOYED_BY, PARTY_TO, REFERENCES)
- "object": the entity text of the object
- "confidence": your confidence in this relationship (high/medium/low)
- "evidence": the text excerpt that supports this relationship

Entities: [list of extracted entities]
Text: [document section]
```

**Coreference resolution.** Documents use pronouns and abbreviations to refer to entities mentioned earlier. "The Company shall..." refers to the organization named at the top of the contract. Coreference resolution — determining what "the Company" refers to — must be handled before or during extraction. LLMs can perform coreference resolution by providing sufficient preceding context in the extraction prompt.

## 55.3 Graph Schema Design

A knowledge graph schema defines the entity types, relationship types, and property schemas that the graph will represent.

**Domain ontology selection.** The graph schema should reflect the concepts and relationships that matter for the use cases the graph will serve. A compliance knowledge graph has different entity types (Regulation, Requirement, Obligation, Exception) than a supply chain knowledge graph (Supplier, Component, Manufacturer, Certification).

**Schema design principles:**

Relationship types should be specific enough to be unambiguous. "RELATED_TO" is too vague to be useful; "REGULATED_BY", "SUPERSEDES", "EXEMPTED_FROM" are specific relationship types that support meaningful queries.

Properties should be stored at the appropriate level. A relationship property (contract value, certification date) belongs on the edge, not on either node.

Entity identity must be resolvable. Each entity needs a canonical identifier that allows the same entity to be merged across documents. For people: name + organization + role. For organizations: legal name + jurisdiction. For regulations: official identifier.

**Schema evolution.** Knowledge graph schemas evolve as the domain understanding deepens and as new document types are added. Design the schema with explicit versioning and migration paths from the start.

## 55.4 Quality Control

LLM-extracted knowledge is not error-free. Quality control is essential before extracted relationships are used in production AI systems.

**Confidence filtering.** Prompt the LLM to assess its confidence in each extracted relationship. Filter out low-confidence relationships before adding them to the graph. Low-confidence relationships flagged for human review are more useful than low-confidence relationships silently included in the graph.

**Sampling-based human review.** Review a sample of extracted entities and relationships (typically 5–10% for initial quality assessment) to identify systematic extraction errors. Extraction errors that appear in the sample at significant rates indicate prompt or preprocessing problems that must be fixed before processing the full corpus.

**Cross-document validation.** A relationship that appears in multiple documents with consistent details is more likely to be correct than one that appears in only one document or with conflicting details. Cross-document validation — flagging single-source relationships and relationships with inconsistent details across sources — is a lightweight quality control mechanism.

**Domain expert review.** For high-stakes knowledge graphs (compliance, clinical, financial), domain experts must review extracted relationships before they are used in production AI systems. The review is not of every extracted relationship — it is of the relationship types and entity types that the AI system will reason about in consequential contexts.

Knowledge graphs built from documents with careful extraction and quality control are one of the most durable AI investments an enterprise can make — they make document knowledge searchable, queryable, and accessible to AI systems across the organization for years.
