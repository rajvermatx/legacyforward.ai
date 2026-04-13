---
title: "Capstone 1: Compliance Knowledge Graph"
slug: "capstone-compliance-knowledge-graph"
description: >-
  Build a regulatory compliance knowledge graph from real documents.
  Covers PDF ingestion, LLM-based entity and relationship extraction,
  Neo4j graph construction, and a GraphRAG query layer that answers
  questions like "Which regulations affect our payment processing system?"
section: "graph-ai"
order: 16
part: "Part 06 Capstones"
badges:
  - "Compliance"
  - "Knowledge Graph"
  - "GraphRAG"
---

# Capstone 1: Compliance Knowledge Graph

Build a system that turns 500 regulatory documents into a searchable graph so compliance officers can ask "Which regulations affect our payment processing system?" and get a traced, sourced answer in seconds instead of days.

## The Scenario


![Diagram 1](/diagrams/graph-ai/capstone-01.svg)
A mid-size financial services firm has 500+ regulatory documents: federal regulations, state-level guidance, internal policies, audit reports, and vendor compliance certificates. When regulators ask "Show us every regulation that affects your payment processing system and the controls you have in place," the compliance team spends 2-3 weeks manually cross-referencing documents.

The goal: build a knowledge graph that captures the relationships between regulations, business processes, controls, systems, and audit findings. Then put a GraphRAG layer on top so compliance officers can query it in natural language.

### What We Are Building

```
PDF/DOCX Files                     User Query
      │                                │
      ▼                                ▼
┌──────────────┐              ┌─────────────────┐
│ Document     │              │ GraphRAG Query   │
│ Ingestion    │              │ Layer            │
└──────┬───────┘              └───────┬─────────┘
       │                              │
       ▼                              ▼
┌──────────────┐              ┌─────────────────┐
│ LLM Entity   │              │ Cypher Query     │
│ Extraction   │              │ Generation       │
└──────┬───────┘              └───────┬─────────┘
       │                              │
       ▼                              ▼
┌──────────────────────────────────────────────┐
│              Neo4j Knowledge Graph            │
│                                              │
│  Regulation ──APPLIES_TO──> Process          │
│  Control ──MITIGATES──> Regulation           │
│  System ──SUPPORTS──> Process                │
│  AuditFinding ──RELATES_TO──> Control        │
│  Document ──CONTAINS──> Regulation           │
└──────────────────────────────────────────────┘
```

## Stage 1: The Ontology

Before extracting anything, define what you are looking for. This is the ontology: the types of entities and relationships the graph will contain.

### Entity Types

| Entity Type | Description | Key Properties |
| --- | --- | --- |
| **Regulation** | A specific regulation, rule, or requirement | name, code, jurisdiction, effective_date, status |
| **Process** | A business process or activity | name, process_id, owner, department |
| **Control** | A control or procedure that mitigates a regulation | name, control_id, type (preventive/detective/corrective), frequency |
| **System** | A technology system or application | name, system_id, vendor, criticality |
| **AuditFinding** | A finding from an audit or assessment | finding_id, severity, status, date |
| **Document** | A source document | title, doc_type, effective_date, source_url |
| **Person** | An individual with a compliance role | name, title, department |
| **Organization** | A regulatory body or business unit | name, org_type |

### Relationship Types

| Relationship | From | To | Properties |
| --- | --- | --- | --- |
| **APPLIES_TO** | Regulation | Process | scope, citation |
| **MITIGATES** | Control | Regulation | coverage (full/partial), notes |
| **SUPPORTS** | System | Process | role (primary/backup) |
| **HAS_FINDING** | AuditFinding | Control | audit_date, auditor |
| **CONTAINS** | Document | Regulation/Control | section, page_number |
| **OWNS** | Person | Process/Control | since_date |
| **ISSUED_BY** | Regulation | Organization | - |
| **DEPENDS_ON** | System | System | dependency_type |
| **SUPERSEDES** | Regulation | Regulation | effective_date |

## Stage 2: Document Ingestion

```python
import hashlib
from pathlib import Path
from dataclasses import dataclass, field
from pypdf import PdfReader
from docx import Document as DocxDocument


@dataclass
class ChunkedDocument:
    """A document split into processable chunks."""
    doc_id: str
    title: str
    source_path: str
    doc_type: str              # "regulation", "policy", "audit_report"
    chunks: list[dict] = field(default_factory=list)


def extract_text_from_pdf(path: Path) -> str:
    """Extract all text from a PDF file."""
    reader = PdfReader(str(path))
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            pages.append(f"[Page {i+1}]\n{text}")
    return "\n\n".join(pages)


def extract_text_from_docx(path: Path) -> str:
    """Extract all text from a DOCX file."""
    doc = DocxDocument(str(path))
    return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())


def chunk_text(text: str, chunk_size: int = 2000,
               overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        # Try to break at a paragraph boundary
        if end < len(text):
            newline_pos = text.rfind("\n\n", start + chunk_size // 2, end)
            if newline_pos > start:
                end = newline_pos
        chunks.append(text[start:end].strip())
        start = end - overlap
    return chunks


def ingest_document(path: Path, doc_type: str) -> ChunkedDocument:
    """Ingest a document, extract text, and chunk it."""
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        text = extract_text_from_pdf(path)
    elif suffix in (".docx", ".doc"):
        text = extract_text_from_docx(path)
    elif suffix == ".txt":
        text = path.read_text(encoding="utf-8")
    else:
        raise ValueError(f"Unsupported format: {suffix}")

    doc_id = hashlib.sha256(
        f"{path.name}:{text[:500]}".encode()
    ).hexdigest()[:12]

    chunks = chunk_text(text)

    return ChunkedDocument(
        doc_id=doc_id,
        title=path.stem.replace("_", " ").replace("-", " ").title(),
        source_path=str(path),
        doc_type=doc_type,
        chunks=[
            {"chunk_id": f"{doc_id}_chunk_{i}",
             "text": chunk, "index": i}
            for i, chunk in enumerate(chunks)
        ]
    )


def ingest_directory(directory: Path) -> list[ChunkedDocument]:
    """Ingest all supported documents from a directory."""
    # Infer doc_type from subdirectory name
    type_map = {
        "regulations": "regulation",
        "policies": "policy",
        "audit_reports": "audit_report",
        "vendor_certs": "vendor_certificate",
    }

    documents = []
    for subdir, doc_type in type_map.items():
        subdir_path = directory / subdir
        if not subdir_path.exists():
            continue
        for file_path in subdir_path.iterdir():
            if file_path.suffix.lower() in (".pdf", ".docx", ".txt"):
                try:
                    doc = ingest_document(file_path, doc_type)
                    documents.append(doc)
                except Exception as e:
                    print(f"Failed to ingest {file_path}: {e}")

    print(f"Ingested {len(documents)} documents, "
          f"{sum(len(d.chunks) for d in documents)} chunks")
    return documents
```

## Stage 3: LLM-Based Entity and Relationship Extraction

```python
import json
import anthropic
from pydantic import BaseModel

client = anthropic.Anthropic()


# ── Pydantic schemas for extraction output ───────────────────

class ExtractedEntity(BaseModel):
    entity_type: str        # Regulation, Process, Control, System, etc.
    name: str
    properties: dict = {}
    source_text: str        # The exact text that mentions this entity


class ExtractedRelationship(BaseModel):
    from_entity: str        # Name of the source entity
    from_type: str
    relationship: str       # APPLIES_TO, MITIGATES, etc.
    to_entity: str          # Name of the target entity
    to_type: str
    properties: dict = {}
    source_text: str


class ExtractionResult(BaseModel):
    entities: list[ExtractedEntity] = []
    relationships: list[ExtractedRelationship] = []


EXTRACTION_PROMPT = """You are an expert compliance analyst extracting
structured data from regulatory documents.

ENTITY TYPES:
- Regulation: A law, rule, regulation, or requirement (e.g., "SOX Section 404", "GDPR Article 30")
- Process: A business process or activity (e.g., "Payment Processing", "Customer Onboarding")
- Control: A control, procedure, or safeguard (e.g., "Quarterly Access Review", "Data Encryption at Rest")
- System: A technology system or application (e.g., "Payment Gateway", "CRM System")
- AuditFinding: An audit finding or deficiency (e.g., "Finding 2024-003: Incomplete access logs")
- Person: An individual with a compliance role (e.g., "Chief Compliance Officer")
- Organization: A regulatory body or business unit (e.g., "SEC", "OCC", "Risk Management")

RELATIONSHIP TYPES:
- APPLIES_TO: Regulation applies to a Process
- MITIGATES: Control mitigates a Regulation
- SUPPORTS: System supports a Process
- HAS_FINDING: AuditFinding relates to a Control
- OWNS: Person owns a Process or Control
- ISSUED_BY: Regulation issued by an Organization
- DEPENDS_ON: System depends on another System
- SUPERSEDES: Regulation supersedes another Regulation

RULES:
1. Extract ONLY entities and relationships that are explicitly stated or clearly implied in the text.
2. Use the exact name or title from the document for entity names.
3. Include the source_text — the exact phrase from the document that supports each extraction.
4. Do NOT invent entities or relationships that are not supported by the text.
5. Normalize regulation names (e.g., "Section 404 of the Sarbanes-Oxley Act" → "SOX Section 404").

DOCUMENT TYPE: {doc_type}
CHUNK:
{chunk_text}

Return valid JSON matching this structure:
{{
  "entities": [
    {{"entity_type": "...", "name": "...", "properties": {{}}, "source_text": "..."}}
  ],
  "relationships": [
    {{"from_entity": "...", "from_type": "...", "relationship": "...",
      "to_entity": "...", "to_type": "...", "properties": {{}}, "source_text": "..."}}
  ]
}}"""


def extract_from_chunk(
    chunk_text: str,
    doc_type: str
) -> ExtractionResult:
    """Extract entities and relationships from a single chunk."""
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": EXTRACTION_PROMPT.format(
                doc_type=doc_type,
                chunk_text=chunk_text
            )
        }]
    )

    text = response.content[0].text
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    data = json.loads(text)
    return ExtractionResult(**data)


def extract_from_document(
    doc: ChunkedDocument
) -> list[ExtractionResult]:
    """Extract from all chunks in a document."""
    results = []
    for chunk in doc.chunks:
        try:
            result = extract_from_chunk(chunk["text"], doc.doc_type)
            results.append(result)
            print(f"  Chunk {chunk['index']}: "
                  f"{len(result.entities)} entities, "
                  f"{len(result.relationships)} relationships")
        except Exception as e:
            print(f"  Chunk {chunk['index']} failed: {e}")
    return results
```

## Stage 4: Entity Resolution and Graph Construction

Entities extracted from different chunks and documents may refer to the same thing. "SOX Section 404," "Sarbanes-Oxley Act Section 404," and "SOX 404" are all the same regulation. Entity resolution merges these duplicates.

```python
from neo4j import GraphDatabase
from collections import defaultdict
import re


class ComplianceGraphBuilder:
    """Builds and maintains the compliance knowledge graph."""

    def __init__(self, neo4j_uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(
            neo4j_uri, auth=(user, password)
        )
        self._create_constraints()

    def _create_constraints(self):
        """Create uniqueness constraints and indexes."""
        constraints = [
            "CREATE CONSTRAINT IF NOT EXISTS "
            "FOR (r:Regulation) REQUIRE r.name IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS "
            "FOR (p:Process) REQUIRE p.name IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS "
            "FOR (c:Control) REQUIRE c.name IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS "
            "FOR (s:System) REQUIRE s.name IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS "
            "FOR (d:Document) REQUIRE d.doc_id IS UNIQUE",
            "CREATE INDEX IF NOT EXISTS "
            "FOR (r:Regulation) ON (r.jurisdiction)",
            "CREATE INDEX IF NOT EXISTS "
            "FOR (p:Process) ON (p.department)",
        ]
        with self.driver.session() as session:
            for c in constraints:
                session.run(c)

    @staticmethod
    def normalize_entity_name(name: str, entity_type: str) -> str:
        """Normalize entity names for deduplication."""
        name = name.strip()

        if entity_type == "Regulation":
            # Normalize common regulation name variations
            replacements = {
                r"Sarbanes[- ]Oxley Act\s*": "SOX ",
                r"Dodd[- ]Frank Wall Street Reform.*?Act\s*": "Dodd-Frank ",
                r"General Data Protection Regulation\s*": "GDPR ",
                r"Section\s+": "Section ",
                r"Article\s+": "Article ",
                r"\s+": " ",
            }
            for pattern, replacement in replacements.items():
                name = re.sub(pattern, replacement, name, flags=re.I)

        return name.strip()

    def add_document(self, doc: ChunkedDocument):
        """Add a source document node to the graph."""
        with self.driver.session() as session:
            session.run("""
                MERGE (d:Document {doc_id: $doc_id})
                SET d.title      = $title,
                    d.source_path = $source_path,
                    d.doc_type    = $doc_type,
                    d.chunk_count = $chunk_count,
                    d.ingested    = datetime()
            """, doc_id=doc.doc_id, title=doc.title,
                 source_path=doc.source_path,
                 doc_type=doc.doc_type,
                 chunk_count=len(doc.chunks))

    def add_extraction_results(
        self,
        doc: ChunkedDocument,
        results: list[ExtractionResult]
    ):
        """Add extracted entities and relationships to the graph."""
        with self.driver.session() as session:
            for result in results:
                for entity in result.entities:
                    norm_name = self.normalize_entity_name(
                        entity.name, entity.entity_type
                    )
                    self._merge_entity(
                        session, entity.entity_type, norm_name,
                        entity.properties, entity.source_text,
                        doc.doc_id
                    )

                for rel in result.relationships:
                    from_name = self.normalize_entity_name(
                        rel.from_entity, rel.from_type
                    )
                    to_name = self.normalize_entity_name(
                        rel.to_entity, rel.to_type
                    )
                    self._merge_relationship(
                        session, from_name, rel.from_type,
                        rel.relationship, to_name, rel.to_type,
                        rel.properties, rel.source_text, doc.doc_id
                    )

    def _merge_entity(
        self, session, entity_type: str, name: str,
        properties: dict, source_text: str, doc_id: str
    ):
        """Merge an entity node and link it to its source document."""
        # Dynamically set label based on entity_type
        session.run(f"""
            MERGE (e:{entity_type} {{name: $name}})
            SET e += $properties,
                e.last_updated = datetime()
            WITH e
            MATCH (d:Document {{doc_id: $doc_id}})
            MERGE (d)-[r:CONTAINS]->(e)
            SET r.source_text = $source_text
        """, name=name, properties=properties,
             source_text=source_text, doc_id=doc_id)

    def _merge_relationship(
        self, session, from_name: str, from_type: str,
        rel_type: str, to_name: str, to_type: str,
        properties: dict, source_text: str, doc_id: str
    ):
        """Merge a relationship between two entities."""
        session.run(f"""
            MATCH (a:{from_type} {{name: $from_name}})
            MATCH (b:{to_type} {{name: $to_name}})
            MERGE (a)-[r:{rel_type}]->(b)
            SET r += $properties,
                r.source_text = $source_text,
                r.source_doc = $doc_id
        """, from_name=from_name, to_name=to_name,
             properties=properties, source_text=source_text,
             doc_id=doc_id)

    def get_stats(self) -> dict:
        """Return graph statistics."""
        with self.driver.session() as session:
            nodes = session.run(
                "MATCH (n) RETURN labels(n)[0] AS label, "
                "count(n) AS count ORDER BY count DESC"
            )
            rels = session.run(
                "MATCH ()-[r]->() RETURN type(r) AS type, "
                "count(r) AS count ORDER BY count DESC"
            )
            return {
                "nodes": {r["label"]: r["count"] for r in nodes},
                "relationships": {r["type"]: r["count"] for r in rels}
            }

    def close(self):
        self.driver.close()
```

## Stage 5: The GraphRAG Query Layer

This is the payoff. Compliance officers ask questions in natural language. The system generates Cypher, queries the graph, and synthesizes a sourced answer.

```python
import anthropic
import json
from neo4j import GraphDatabase

client = anthropic.Anthropic()


CYPHER_GENERATION_PROMPT = """You are a compliance graph query expert.
Given a natural language question about regulatory compliance, generate
a Cypher query to answer it.

GRAPH SCHEMA:
Nodes:
- Regulation (name, code, jurisdiction, effective_date, status)
- Process (name, process_id, owner, department)
- Control (name, control_id, type, frequency)
- System (name, system_id, vendor, criticality)
- AuditFinding (finding_id, severity, status, date)
- Document (doc_id, title, doc_type, source_path)
- Person (name, title, department)
- Organization (name, org_type)

Relationships:
- APPLIES_TO: Regulation -> Process
- MITIGATES: Control -> Regulation
- SUPPORTS: System -> Process
- HAS_FINDING: AuditFinding -> Control
- CONTAINS: Document -> (any entity)
- OWNS: Person -> Process/Control
- ISSUED_BY: Regulation -> Organization
- DEPENDS_ON: System -> System
- SUPERSEDES: Regulation -> Regulation

RULES:
1. Use OPTIONAL MATCH for paths that might not exist.
2. Always return the source document for traceability.
3. Limit results to 25 unless the question asks for a count.
4. Use case-insensitive matching with toLower() for name searches.
5. Return enough context for a human to understand the answer.

QUESTION: {question}

Return ONLY the Cypher query, no explanation."""


ANSWER_SYNTHESIS_PROMPT = """You are a compliance analyst answering
questions based on knowledge graph query results.

QUESTION: {question}

QUERY RESULTS:
{results}

INSTRUCTIONS:
1. Answer the question directly based on the query results.
2. Cite specific regulations, controls, and documents by name.
3. If the results are empty, say "No matching data found in the
   compliance knowledge graph."
4. If the results are partial, note what is covered and what might
   be missing.
5. Format the answer for a compliance officer — clear, precise,
   and traceable.
"""


class ComplianceQueryEngine:
    """GraphRAG query engine for compliance questions."""

    def __init__(self, neo4j_uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(
            neo4j_uri, auth=(user, password)
        )

    def query(self, question: str) -> dict:
        """Answer a compliance question using the knowledge graph."""
        # Step 1: Generate Cypher
        cypher = self._generate_cypher(question)

        # Step 2: Execute query
        with self.driver.session() as session:
            result = session.run(cypher)
            records = [dict(r) for r in result]

        # Step 3: Synthesize answer
        answer = self._synthesize_answer(question, records)

        return {
            "question": question,
            "cypher": cypher,
            "result_count": len(records),
            "results": records[:10],   # First 10 for display
            "answer": answer
        }

    def _generate_cypher(self, question: str) -> str:
        """Generate a Cypher query from a natural language question."""
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": CYPHER_GENERATION_PROMPT.format(
                    question=question
                )
            }]
        )
        cypher = response.content[0].text.strip()
        if "```" in cypher:
            cypher = cypher.split("```")[1]
            if cypher.startswith("cypher"):
                cypher = cypher[6:]
            cypher = cypher.split("```")[0]
        return cypher.strip()

    def _synthesize_answer(
        self, question: str, records: list[dict]
    ) -> str:
        """Synthesize a natural language answer from query results."""
        results_text = json.dumps(records[:25], indent=2, default=str)

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            messages=[{
                "role": "user",
                "content": ANSWER_SYNTHESIS_PROMPT.format(
                    question=question,
                    results=results_text
                )
            }]
        )
        return response.content[0].text

    def close(self):
        self.driver.close()


# ── Example queries ──────────────────────────────────────────

EXAMPLE_QUERIES = [
    "Which regulations affect our payment processing system?",
    "What controls mitigate SOX Section 404 and are they effective?",
    "Show me all audit findings from 2024 with severity 'high'.",
    "Which systems support payment processing and what do they depend on?",
    "Who owns the controls for GDPR compliance?",
    "Which regulations have no controls mapped to them?",
    "What is the blast radius if the payment gateway goes down?",
]
```

## Stage 6: Putting It All Together

```python
from pathlib import Path


def build_compliance_graph(
    document_dir: str,
    neo4j_uri: str = "bolt://localhost:7687",
    neo4j_user: str = "neo4j",
    neo4j_password: str = "password"
):
    """End-to-end: ingest documents, extract entities, build graph."""
    # 1. Ingest documents
    print("=== Stage 1: Ingesting documents ===")
    documents = ingest_directory(Path(document_dir))

    # 2. Build graph
    print("\n=== Stage 2: Building knowledge graph ===")
    builder = ComplianceGraphBuilder(
        neo4j_uri, neo4j_user, neo4j_password
    )

    for doc in documents:
        print(f"\nProcessing: {doc.title} ({len(doc.chunks)} chunks)")
        builder.add_document(doc)
        results = extract_from_document(doc)
        builder.add_extraction_results(doc, results)

    # 3. Print stats
    stats = builder.get_stats()
    print(f"\n=== Graph Statistics ===")
    print(f"Nodes: {stats['nodes']}")
    print(f"Relationships: {stats['relationships']}")
    builder.close()

    # 4. Test the query engine
    print("\n=== Stage 3: Testing query engine ===")
    engine = ComplianceQueryEngine(
        neo4j_uri, neo4j_user, neo4j_password
    )

    test_question = (
        "Which regulations affect our payment processing system?"
    )
    print(f"\nQuestion: {test_question}")
    result = engine.query(test_question)
    print(f"Cypher: {result['cypher']}")
    print(f"Results: {result['result_count']} records")
    print(f"\nAnswer:\n{result['answer']}")

    engine.close()


if __name__ == "__main__":
    build_compliance_graph("./compliance_documents")
```

## What You Built

This capstone combined every major concept from the book:

| Stage | Concepts Used | Chapters |
| --- | --- | --- |
| Ontology design | Entity types, relationship types, property selection | Chapter 8 |
| Document ingestion | Chunking, PDF/DOCX parsing | Chapter 7 |
| LLM extraction | Entity and relationship extraction with Pydantic schemas | Chapter 7 |
| Entity resolution | Name normalization, MERGE-based deduplication | Chapter 7, 9 |
| Graph construction | Cypher MERGE, constraints, indexes | Chapter 5 |
| GraphRAG queries | Cypher generation from natural language, answer synthesis | Chapter 10 |
| Data quality | Uniqueness constraints, required properties | Chapter 9 |

### Expected Graph Size

For 500 regulatory documents:

| Metric | Expected Range |
| --- | --- |
| Documents | 500 |
| Total chunks | 5,000 - 15,000 |
| Regulations extracted | 200 - 800 |
| Processes | 50 - 200 |
| Controls | 100 - 500 |
| Systems | 30 - 100 |
| Total relationships | 2,000 - 10,000 |
| Extraction time | 4 - 12 hours (API-bound) |
| Query response time | 500ms - 2s (including LLM synthesis) |

### What to Do Next

1. Add a review workflow where compliance officers validate extracted entities and relationships
2. Set up the CDC pipeline (Chapter 13) to keep the graph current as new documents are added
3. Build automated tests (Chapter 14) for graph structure and query regression
4. Add monitoring (Chapter 15) for graph size growth and query latency
