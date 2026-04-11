---
title: "Data Quality for Knowledge Graphs"
slug: "data-quality"
description: >-
  How to test and validate a knowledge graph. Covers automated quality
  checks for orphan nodes, duplicate entities, type violations, and
  missing relationships. Includes consistency validation, coverage
  metrics, human review workflows, continuous monitoring, and a
  complete Python validation pipeline with Neo4j queries.
section: "graph-ai"
order: 9
part: "Part 03 Building Knowledge Graphs"
badges:
  - "Data Quality"
  - "Graph Testing"
  - "Validation Pipeline"
---

# Data Quality for Knowledge Graphs

Your knowledge graph has 50,000 nodes. How do you know they're correct?

## 01. Why Graph Quality Is Different


![Diagram 1](/diagrams/graph-ai/ch09-01.svg)

![Diagram 2](/diagrams/graph-ai/ch09-02.svg)
If you come from a relational background, you know how to test data quality. Check for NULLs in NOT NULL columns. Validate foreign key constraints. Run row counts against expected values. These checks work because relational databases have rigid schemas that define what valid data looks like.

Graphs are different. There are no foreign keys — any node can connect to any other node. There is no NOT NULL constraint by default — a node can have any combination of properties. And the most dangerous quality problems are not missing data but wrong relationships: a Person node connected by WORKS_AT to a Document node instead of an Organization node. That relationship is syntactically valid but semantically nonsensical.

> **Think of it like this:** Testing a relational database is like proofreading a form — you check that every required field is filled in and that dates look like dates. Testing a knowledge graph is like fact-checking a newspaper article — you need to verify not just that the names and dates are present but that the statements connecting them are true. "John Smith approved the vendor contract" is a claim, and you need a way to verify it.

## 02. The Six Categories of Graph Quality Issues

Every quality problem in a knowledge graph falls into one of these six categories:

| Category | What It Means | Example | Detection Difficulty |
| --- | --- | --- | --- |
| **Orphan nodes** | Nodes with no relationships | A Person node floating alone | Easy — simple query |
| **Duplicate entities** | Same real-world thing as multiple nodes | "IBM" and "International Business Machines" | Medium — requires fuzzy matching |
| **Type violations** | Relationships between wrong node types | Person -[:WORKS_AT]-> Document | Easy — schema check |
| **Missing relationships** | Entities that should be connected but are not | Two people from same department, not linked | Hard — requires domain knowledge |
| **Incorrect relationships** | Wrong relationship type or direction | MANAGES going from employee to manager | Hard — requires validation data |
| **Stale data** | Information that was true but no longer is | Former employee still shown as active | Medium — requires temporal checks |

## 03. Automated Quality Checks

These checks can run automatically after every extraction batch. They catch the easiest problems and should be your first line of defense.

### Check 1: Orphan Nodes

Nodes with no relationships are almost always errors. In a knowledge graph built from documents, every entity should connect to at least one other entity or to a source document.

```cypher
// Find all orphan nodes
MATCH (n)
WHERE NOT (n)--()
RETURN labels(n)[0] AS type,
       n.name AS name,
       n.source AS source
ORDER BY type, name

// Count orphans by type
MATCH (n)
WHERE NOT (n)--()
RETURN labels(n)[0] AS type, count(n) AS orphan_count
ORDER BY orphan_count DESC
```

**Threshold:** Fewer than 5% of nodes should be orphans. If you see more, your extraction pipeline is creating entities without capturing their relationships.

### Check 2: Duplicate Entities

```cypher
// Find potential duplicates by normalized name
MATCH (a), (b)
WHERE id(a) < id(b)
  AND labels(a) = labels(b)
  AND toLower(trim(a.name)) = toLower(trim(b.name))
RETURN labels(a)[0] AS type,
       a.name AS name_a,
       b.name AS name_b,
       count{(a)--()} AS rels_a,
       count{(b)--()} AS rels_b

// Find near-duplicates using string similarity
MATCH (a:Organization), (b:Organization)
WHERE id(a) < id(b)
  AND apoc.text.levenshteinSimilarity(
        toLower(a.name), toLower(b.name)
      ) > 0.85
RETURN a.name, b.name,
       apoc.text.levenshteinSimilarity(
         toLower(a.name), toLower(b.name)
       ) AS similarity
ORDER BY similarity DESC
```

### Check 3: Type Violations

These are relationships that connect node types your ontology says should not be connected. This check requires the ontology definition from Chapter 8.

```python
from neo4j import GraphDatabase

driver = GraphDatabase.driver(
    "bolt://localhost:7687",
    auth=("neo4j", "password")
)

# Define valid relationship endpoints
VALID_RELATIONSHIPS = {
    "WORKS_AT": {
        "from": ["Person"],
        "to": ["Organization"]
    },
    "SUPPLIES": {
        "from": ["Organization"],
        "to": ["Component", "Product"]
    },
    "APPROVED_BY": {
        "from": ["Document", "Component"],
        "to": ["Person"]
    },
    "MANAGES": {
        "from": ["Person"],
        "to": ["Person", "Organization", "Component"]
    },
    "REFERENCES": {
        "from": ["Document"],
        "to": ["Document", "Regulation"]
    },
    "LOCATED_IN": {
        "from": ["Organization", "Person", "Event"],
        "to": ["Location"]
    },
    "COMPLIES_WITH": {
        "from": ["Component", "Organization"],
        "to": ["Regulation"]
    }
}


def check_type_violations() -> list[dict]:
    """Find relationships connecting wrong node types."""
    violations = []

    with driver.session() as session:
        for rel_type, rules in VALID_RELATIONSHIPS.items():
            valid_from = rules["from"]
            valid_to = rules["to"]

            from_check = " OR ".join(
                f"'{t}' IN labels(a)" for t in valid_from
            )
            to_check = " OR ".join(
                f"'{t}' IN labels(b)" for t in valid_to
            )

            result = session.run(f"""
                MATCH (a)-[r:{rel_type}]->(b)
                WHERE NOT ({from_check})
                   OR NOT ({to_check})
                RETURN a.name AS source,
                       labels(a)[0] AS source_type,
                       type(r) AS rel,
                       b.name AS target,
                       labels(b)[0] AS target_type
                LIMIT 100
            """)

            for record in result:
                violations.append({
                    "relationship": rel_type,
                    "source": f"{record['source']} "
                             f"({record['source_type']})",
                    "target": f"{record['target']} "
                             f"({record['target_type']})",
                    "expected_from": valid_from,
                    "expected_to": valid_to
                })

    return violations
```

### Check 4: Property Completeness

Nodes missing critical properties are less useful for queries and may indicate extraction problems.

```cypher
// Persons without a name (should never happen)
MATCH (p:Person)
WHERE p.name IS NULL OR trim(p.name) = ''
RETURN p, labels(p), keys(p)

// Documents without a source reference
MATCH (d:Document)
WHERE d.source IS NULL
RETURN d.name

// Count property completeness by node type
MATCH (n:Person)
RETURN
  count(n) AS total,
  count(n.name) AS has_name,
  count(n.title) AS has_title,
  count(n.email) AS has_email,
  count(n.department) AS has_department
```

### Check 5: Relationship Direction

Some relationship types only make sense in one direction. REPORTS_TO should go from employee to manager, not the other way around.

```cypher
// Find suspiciously bidirectional relationships
// (same type in both directions between same nodes)
MATCH (a)-[r1:REPORTS_TO]->(b)-[r2:REPORTS_TO]->(a)
RETURN a.name, b.name

// Find self-referential relationships
MATCH (n)-[r]->(n)
RETURN n.name, labels(n)[0] AS type, type(r) AS rel_type
```

## 04. Consistency Validation

Automated checks catch structural problems. Consistency validation catches logical problems — relationships that are structurally valid but do not make sense in context.

### Semantic Consistency Rules

Define rules that encode domain knowledge:

```python
CONSISTENCY_RULES = [
    {
        "name": "person_works_at_one_org",
        "description": "A person should WORKS_AT at most 2 "
                       "organizations (current + maybe previous)",
        "query": """
            MATCH (p:Person)-[:WORKS_AT]->(o:Organization)
            WITH p, count(o) AS org_count
            WHERE org_count > 2
            RETURN p.name, org_count
        """,
        "severity": "warning"
    },
    {
        "name": "no_circular_reporting",
        "description": "REPORTS_TO chains should not form cycles",
        "query": """
            MATCH path = (p:Person)-[:REPORTS_TO*2..10]->(p)
            RETURN [n IN nodes(path) | n.name] AS cycle
            LIMIT 10
        """,
        "severity": "error"
    },
    {
        "name": "documents_have_dates",
        "description": "Contracts and policies should have dates",
        "query": """
            MATCH (d:Document)
            WHERE d.doc_type IN ['contract', 'policy']
              AND d.effective_date IS NULL
            RETURN d.name, d.doc_type
        """,
        "severity": "warning"
    },
    {
        "name": "vendor_has_contract",
        "description": "Organizations marked as vendors should "
                       "have at least one contract relationship",
        "query": """
            MATCH (o:Organization)
            WHERE o.org_type = 'vendor'
              AND NOT (o)-[:BOUND_BY|CONTRACTED_WITH]->(:Document)
            RETURN o.name
        """,
        "severity": "warning"
    },
    {
        "name": "approval_has_approver",
        "description": "Documents with status 'approved' should "
                       "have an APPROVED_BY relationship",
        "query": """
            MATCH (d:Document)
            WHERE d.status = 'approved'
              AND NOT (d)-[:APPROVED_BY]->(:Person)
            RETURN d.name
        """,
        "severity": "error"
    }
]


def run_consistency_checks(
    rules: list[dict]
) -> list[dict]:
    """Run all consistency rules and collect violations."""
    results = []

    with driver.session() as session:
        for rule in rules:
            result = session.run(rule["query"])
            records = list(result)

            if records:
                results.append({
                    "rule": rule["name"],
                    "description": rule["description"],
                    "severity": rule["severity"],
                    "violation_count": len(records),
                    "sample": [dict(r) for r in records[:5]]
                })

    return results
```

## 05. Coverage Metrics

Coverage answers the question: "What percentage of the information in our source documents is represented in the graph?" High entity counts mean nothing if half your documents were skipped or only partially extracted.

### Document Coverage

```python
def check_document_coverage(
    source_files: list[str]
) -> dict:
    """Check what percentage of source documents are in the graph."""
    with driver.session() as session:
        # Get all source references from the graph
        result = session.run("""
            MATCH (n)
            WHERE n.source IS NOT NULL
            RETURN DISTINCT n.source AS source
        """)
        graph_sources = {r["source"] for r in result}

    file_names = {Path(f).name for f in source_files}
    covered = file_names & graph_sources
    missing = file_names - graph_sources

    return {
        "total_documents": len(file_names),
        "covered": len(covered),
        "missing": len(missing),
        "coverage_pct": round(
            len(covered) / len(file_names) * 100, 1
        ) if file_names else 0,
        "missing_files": sorted(missing)[:20]
    }
```

### Entity Density

How many entities per document? Too few suggests under-extraction. Too many suggests hallucination.

```cypher
// Entity density by source document
MATCH (n)
WHERE n.source IS NOT NULL
RETURN n.source AS document,
       count(n) AS entity_count,
       count(DISTINCT labels(n)[0]) AS type_count
ORDER BY entity_count DESC
```

**Expected ranges:**

| Document Type | Entities per Page | Below This = Under-extraction |
| --- | --- | --- |
| Contracts | 5-15 | < 3 |
| Policy documents | 3-10 | < 2 |
| Technical specifications | 8-20 | < 5 |
| Incident reports | 4-12 | < 3 |
| Meeting minutes | 6-15 | < 4 |

### Relationship Density

The ratio of relationships to entities should generally be between 1.0 and 3.0. Below 1.0, most nodes are islands. Above 3.0, the extraction may be creating spurious connections.

```cypher
// Overall relationship-to-entity ratio
MATCH (n)
WITH count(n) AS nodes
MATCH ()-[r]->()
WITH nodes, count(r) AS rels
RETURN nodes, rels,
       round(toFloat(rels) / nodes * 100) / 100 AS ratio
```

## 06. Human Review Workflows

Automated checks catch structural problems. Humans catch meaning problems. You need both.

### Sampling Strategy

You cannot review every extraction. Sample strategically:

1. **Random sample** — 5% of all extractions, reviewed for general accuracy.
2. **Low-confidence sample** — extractions where the LLM expressed uncertainty (if you capture confidence scores).
3. **High-impact sample** — entities and relationships that appear in the most queries or dashboards.
4. **Edge-case sample** — extractions from document types that are rare or unusual.

```python
def sample_for_review(
    sample_size: int = 50
) -> list[dict]:
    """Pull a stratified sample of entities for human review."""
    samples = []

    with driver.session() as session:
        # Random sample
        result = session.run("""
            MATCH (n)
            WHERE n.source IS NOT NULL
            WITH n, rand() AS r
            ORDER BY r
            LIMIT $limit
            RETURN n.name AS name,
                   labels(n)[0] AS type,
                   n.source AS source,
                   properties(n) AS props,
                   [(n)-[rel]-(m) |
                    {rel: type(rel), target: m.name,
                     target_type: labels(m)[0]}
                   ] AS relationships
        """, limit=sample_size // 2)
        for record in result:
            samples.append({
                "sample_type": "random",
                **dict(record)
            })

        # High-connectivity sample (most connected nodes)
        result = session.run("""
            MATCH (n)
            WITH n, count{(n)--()} AS degree
            ORDER BY degree DESC
            LIMIT $limit
            RETURN n.name AS name,
                   labels(n)[0] AS type,
                   n.source AS source,
                   degree,
                   properties(n) AS props
        """, limit=sample_size // 2)
        for record in result:
            samples.append({
                "sample_type": "high_connectivity",
                **dict(record)
            })

    return samples
```

### Review Interface

A review does not need a fancy UI. A spreadsheet with these columns works:

| Column | Purpose |
| --- | --- |
| Entity Name | The extracted entity |
| Entity Type | The assigned label |
| Source Document | Where it came from |
| Source Text Snippet | The chunk it was extracted from |
| Correct? (Y/N) | Reviewer's judgment |
| Corrected Name | If the name is wrong |
| Corrected Type | If the type is wrong |
| Notes | Additional context |

### Feedback Loop

Review results should feed back into the pipeline:

```python
def apply_review_corrections(corrections: list[dict]):
    """Apply human review corrections to the graph."""
    with driver.session() as session:
        for correction in corrections:
            if not correction.get("correct"):
                if correction.get("action") == "delete":
                    # Remove hallucinated entity
                    session.run("""
                        MATCH (n {name: $name})
                        WHERE $type IN labels(n)
                        DETACH DELETE n
                    """,
                        name=correction["entity_name"],
                        type=correction["entity_type"]
                    )
                elif correction.get("corrected_name"):
                    # Fix entity name
                    session.run("""
                        MATCH (n {name: $old_name})
                        WHERE $type IN labels(n)
                        SET n.name = $new_name
                    """,
                        old_name=correction["entity_name"],
                        type=correction["entity_type"],
                        new_name=correction["corrected_name"]
                    )
                elif correction.get("corrected_type"):
                    # Fix entity type (requires APOC)
                    session.run("""
                        MATCH (n {name: $name})
                        WHERE $old_type IN labels(n)
                        REMOVE n:$old_type
                        SET n:$new_type
                    """,
                        name=correction["entity_name"],
                        old_type=correction["entity_type"],
                        new_type=correction["corrected_type"]
                    )
```

## 07. Continuous Quality Monitoring

Quality is not a one-time check. As new documents are ingested and the graph grows, quality can drift.

### Quality Dashboard Metrics

Track these metrics over time:

```python
def collect_quality_metrics() -> dict:
    """Collect all quality metrics for monitoring."""
    with driver.session() as session:
        metrics = {}

        # Total counts
        result = session.run(
            "MATCH (n) RETURN count(n) AS nodes"
        )
        metrics["total_nodes"] = result.single()["nodes"]

        result = session.run(
            "MATCH ()-[r]->() RETURN count(r) AS rels"
        )
        metrics["total_relationships"] = result.single()["rels"]

        # Orphan rate
        result = session.run("""
            MATCH (n) WHERE NOT (n)--()
            RETURN count(n) AS orphans
        """)
        orphans = result.single()["orphans"]
        metrics["orphan_count"] = orphans
        metrics["orphan_rate"] = round(
            orphans / max(metrics["total_nodes"], 1) * 100, 2
        )

        # Relationship-to-node ratio
        metrics["rel_node_ratio"] = round(
            metrics["total_relationships"] /
            max(metrics["total_nodes"], 1), 2
        )

        # Duplicate candidate count
        result = session.run("""
            MATCH (a), (b)
            WHERE id(a) < id(b)
              AND labels(a) = labels(b)
              AND toLower(trim(a.name)) = toLower(trim(b.name))
            RETURN count(*) AS dupes
        """)
        metrics["exact_duplicate_pairs"] = result.single()["dupes"]

        # Nodes by type
        result = session.run("""
            MATCH (n)
            RETURN labels(n)[0] AS type, count(n) AS count
            ORDER BY count DESC
        """)
        metrics["nodes_by_type"] = {
            r["type"]: r["count"] for r in result
        }

        # Relationships by type
        result = session.run("""
            MATCH ()-[r]->()
            RETURN type(r) AS type, count(r) AS count
            ORDER BY count DESC
        """)
        metrics["rels_by_type"] = {
            r["type"]: r["count"] for r in result
        }

        return metrics
```

### Drift Detection

Compare current metrics against baseline to catch degradation:

```python
import json
from pathlib import Path
from datetime import datetime

METRICS_LOG = "quality_metrics_log.json"

def log_and_check_drift(
    current: dict,
    drift_threshold: float = 0.2
) -> list[str]:
    """Log metrics and alert on significant drift."""
    alerts = []

    # Load previous metrics
    log_path = Path(METRICS_LOG)
    if log_path.exists():
        with open(log_path) as f:
            history = json.load(f)
    else:
        history = []

    if history:
        previous = history[-1]["metrics"]

        # Check orphan rate drift
        if (current["orphan_rate"] >
                previous["orphan_rate"] * (1 + drift_threshold)):
            alerts.append(
                f"Orphan rate increased from "
                f"{previous['orphan_rate']}% to "
                f"{current['orphan_rate']}%"
            )

        # Check ratio drift
        prev_ratio = previous.get("rel_node_ratio", 1.0)
        curr_ratio = current["rel_node_ratio"]
        if abs(curr_ratio - prev_ratio) / max(prev_ratio, 0.1) > \
                drift_threshold:
            alerts.append(
                f"Rel/node ratio changed from "
                f"{prev_ratio} to {curr_ratio}"
            )

        # Check duplicate growth
        prev_dupes = previous.get("exact_duplicate_pairs", 0)
        curr_dupes = current["exact_duplicate_pairs"]
        if curr_dupes > prev_dupes + 10:
            alerts.append(
                f"Duplicate pairs grew from "
                f"{prev_dupes} to {curr_dupes}"
            )

    # Log current
    history.append({
        "timestamp": datetime.now().isoformat(),
        "metrics": current
    })
    with open(log_path, "w") as f:
        json.dump(history, f, indent=2)

    return alerts
```

## 08. The Complete Validation Pipeline

Here is the full pipeline that ties all checks together:

```python
def run_full_validation(
    source_files: list[str] = None,
    ontology: dict = None
) -> dict:
    """Run the complete quality validation pipeline."""
    report = {
        "timestamp": datetime.now().isoformat(),
        "checks": {}
    }

    # 1. Collect basic metrics
    metrics = collect_quality_metrics()
    report["metrics"] = metrics
    print(f"Graph: {metrics['total_nodes']} nodes, "
          f"{metrics['total_relationships']} relationships")

    # 2. Check orphan nodes
    with driver.session() as session:
        result = session.run("""
            MATCH (n) WHERE NOT (n)--()
            RETURN labels(n)[0] AS type, count(n) AS count
        """)
        orphans = {r["type"]: r["count"] for r in result}
    report["checks"]["orphans"] = {
        "status": "pass" if metrics["orphan_rate"] < 5 else "fail",
        "orphan_rate": metrics["orphan_rate"],
        "by_type": orphans
    }
    print(f"Orphan rate: {metrics['orphan_rate']}% "
          f"({'PASS' if metrics['orphan_rate'] < 5 else 'FAIL'})")

    # 3. Check duplicates
    report["checks"]["duplicates"] = {
        "status": "pass" if metrics["exact_duplicate_pairs"] == 0
                  else "warn",
        "count": metrics["exact_duplicate_pairs"]
    }
    print(f"Duplicate pairs: {metrics['exact_duplicate_pairs']}")

    # 4. Type violations (if ontology provided)
    if ontology:
        from chapter08 import validate_schema
        violations = validate_schema(ontology)
        errors = [v for v in violations if v["severity"] == "error"]
        report["checks"]["type_violations"] = {
            "status": "pass" if not errors else "fail",
            "violations": violations
        }
        print(f"Schema violations: {len(violations)} "
              f"({len(errors)} errors)")

    # 5. Consistency rules
    consistency = run_consistency_checks(CONSISTENCY_RULES)
    errors = [c for c in consistency if c["severity"] == "error"]
    report["checks"]["consistency"] = {
        "status": "pass" if not errors else "fail",
        "issues": consistency
    }
    print(f"Consistency issues: {len(consistency)} "
          f"({len(errors)} errors)")

    # 6. Document coverage (if source files provided)
    if source_files:
        coverage = check_document_coverage(source_files)
        report["checks"]["coverage"] = {
            "status": "pass" if coverage["coverage_pct"] > 95
                      else "warn",
            **coverage
        }
        print(f"Document coverage: {coverage['coverage_pct']}%")

    # 7. Drift detection
    alerts = log_and_check_drift(metrics)
    if alerts:
        report["checks"]["drift"] = {
            "status": "warn",
            "alerts": alerts
        }
        for alert in alerts:
            print(f"DRIFT ALERT: {alert}")

    # Summary
    failed = [k for k, v in report["checks"].items()
              if v.get("status") == "fail"]
    warned = [k for k, v in report["checks"].items()
              if v.get("status") == "warn"]

    print(f"\nSummary: {len(failed)} failed, "
          f"{len(warned)} warnings, "
          f"{len(report['checks']) - len(failed) - len(warned)} "
          f"passed")

    return report
```

## 09. Quality Metrics Checklist

Use this table as a reference for what to measure and what thresholds to set:

| Metric | What It Measures | Green | Yellow | Red |
| --- | --- | --- | --- | --- |
| Orphan node rate | % of nodes with no relationships | < 5% | 5-15% | > 15% |
| Exact duplicate rate | % of nodes with exact name matches | 0% | < 2% | > 2% |
| Near-duplicate candidates | Node pairs with > 85% name similarity | < 10 pairs | 10-50 | > 50 |
| Type violation count | Relationships between wrong node types | 0 | 1-5 | > 5 |
| Relationship-to-node ratio | Average relationships per node | 1.0-3.0 | 0.5-1.0 or 3.0-5.0 | < 0.5 or > 5.0 |
| Document coverage | % of source docs represented in graph | > 95% | 80-95% | < 80% |
| Property completeness | % of required properties populated | > 90% | 70-90% | < 70% |
| Self-referential relationships | Nodes connected to themselves | 0 | 1-3 | > 3 |
| Bidirectional duplicates | Same relationship in both directions | 0 | 1-5 | > 5 |
| Consistency rule violations | Failed semantic consistency checks | 0 errors | warnings only | errors present |

## 10. Chapter Checklist

Before moving to the next chapter, make sure you can answer these questions:

- [ ] Can you list the six categories of graph quality issues?
- [ ] Can you write Cypher queries to detect orphan nodes, duplicates, and type violations?
- [ ] Can you define consistency rules specific to your domain?
- [ ] Can you calculate document coverage and entity density metrics?
- [ ] Can you design a sampling strategy for human review?
- [ ] Can you set up continuous quality monitoring with drift detection?

With a quality foundation in place, the next part of the book explores how to use your knowledge graph to power AI systems — starting with GraphRAG, which combines graph traversal with retrieval-augmented generation.
