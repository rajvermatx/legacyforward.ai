---
title: "Testing Graph Systems"
slug: "testing-graph-systems"
description: >-
  How to test graph databases from unit tests through end-to-end
  validation. Covers the graph test pyramid, Cypher query unit tests
  with fixtures, integration tests for extraction pipelines, query
  regression testing, data quality automation in CI/CD, performance
  benchmarks, and a complete pytest test suite using testcontainers.
section: "graph-ai"
order: 14
part: "Part 05 Production"
badges:
  - "Graph Testing"
  - "Test Pyramid"
  - "CI/CD"
---

# Testing Graph Systems

Your QA team has never tested a graph database. Here's the test pyramid they need.

## 01. Why Graph Testing Is Different

Your QA team knows how to test relational databases. They write SQL assertions, check row counts, validate foreign key integrity. Graph databases require a different mindset because the data model is different. Instead of rows in tables, you have nodes with labels and properties connected by typed relationships. Instead of JOIN correctness, you care about traversal correctness — does following a chain of relationships produce the right result?

Three things make graph testing harder than relational testing:

1. **Schema flexibility.** Neo4j does not enforce a rigid schema. A node can have any properties, and missing properties do not throw errors — they return null. A test must check not just that data exists but that it has the expected shape.

2. **Traversal depth.** A query that traverses 4 relationships is correct only if every hop lands on the right node. One wrong relationship in the middle of the path corrupts the entire result.

3. **Extraction pipelines.** If you are building knowledge graphs from documents (Chapter 7), the LLM-based extraction adds non-determinism. The same document can produce slightly different graphs on different runs.

> **Think of it like this:** Testing a relational database is like proofreading a spreadsheet — you check that cells have the right values. Testing a graph is like checking a subway map — you need to verify that every station exists, every line connects the right stations in the right order, and you can actually get from A to B by following the routes.

## 02. The Graph Test Pyramid

The graph test pyramid has 5 layers, from fastest and most numerous to slowest and fewest:

```
                 ┌─────────────┐
                 │  End-to-End │  Few, slow, expensive
                 ├─────────────┤
              ┌──┤ Performance ├──┐
              │  ├─────────────┤  │
           ┌──┤  │Data Quality │  ├──┐
           │  │  ├─────────────┤  │  │
        ┌──┤  │  │   Query     │  │  ├──┐
        │  │  │  │ Regression  │  │  │  │
     ┌──┤  │  │  ├─────────────┤  │  │  ├──┐
     │  │  │  │  │ Integration │  │  │  │  │
     │  │  │  │  ├─────────────┤  │  │  │  │
     │  │  │  │  │    Unit     │  │  │  │  │  Many, fast, cheap
     └──┴──┴──┴──┴─────────────┴──┴──┴──┴──┘
```

### Layer Summary

| Layer | What It Tests | Speed | Quantity | Run When |
| --- | --- | --- | --- | --- |
| **Unit** | Individual Cypher queries return correct results against fixture data | < 1s each | 50+ | Every commit |
| **Integration** | Extraction pipeline produces correct graph structure | 5-30s each | 20-30 | Every PR |
| **Query Regression** | Traversal results do not change after data updates | 5-10s each | 20-30 | Nightly + before release |
| **Data Quality** | Automated checks from Chapter 9 pass | 10-60s total | 10-20 | Every data load |
| **End-to-End** | Full flow from document to graph to query produces correct answer | 30-120s each | 5-10 | Before release |
| **Performance** | Query latency stays within baseline | 1-5 min total | 10-15 | Weekly + before release |

## 03. Setting Up: Testcontainers for Neo4j

Every test layer below uses testcontainers to spin up a real Neo4j instance in Docker. No mocks. Mocking a graph database gives you false confidence — the mock does not validate Cypher syntax, does not enforce uniqueness constraints, and does not catch traversal errors.

```python
# conftest.py — shared fixtures for all graph tests

import pytest
from testcontainers.neo4j import Neo4jContainer
from neo4j import GraphDatabase


@pytest.fixture(scope="session")
def neo4j_container():
    """Start a Neo4j container once for the entire test session."""
    with Neo4jContainer("neo4j:5.26") as container:
        container.with_env(
            "NEO4J_PLUGINS", '["apoc"]'
        )
        yield container


@pytest.fixture(scope="session")
def neo4j_driver(neo4j_container):
    """Create a Neo4j driver connected to the test container."""
    uri = neo4j_container.get_connection_url()
    driver = GraphDatabase.driver(
        uri,
        auth=("neo4j", neo4j_container.NEO4J_ADMIN_PASSWORD)
    )
    yield driver
    driver.close()


@pytest.fixture(autouse=True)
def clean_database(neo4j_driver):
    """Wipe the database before each test."""
    with neo4j_driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
    yield


@pytest.fixture
def session(neo4j_driver):
    """Provide a Neo4j session for individual tests."""
    with neo4j_driver.session() as session:
        yield session


# ── Reusable test data fixtures ──────────────────────────────

@pytest.fixture
def org_hierarchy(session):
    """Create a small org hierarchy for testing."""
    session.run("""
        CREATE (ceo:Person {name: 'Alice Chen', title: 'CEO',
                            employee_id: 1})
        CREATE (vp1:Person {name: 'Bob Kumar', title: 'VP Engineering',
                            employee_id: 2})
        CREATE (vp2:Person {name: 'Carol Diaz', title: 'VP Product',
                            employee_id: 3})
        CREATE (mgr:Person {name: 'Dan Park', title: 'Eng Manager',
                            employee_id: 4})
        CREATE (dev:Person {name: 'Eve Liu', title: 'Developer',
                            employee_id: 5})
        CREATE (eng:Department {name: 'Engineering', dept_id: 10})
        CREATE (prod:Department {name: 'Product', dept_id: 20})

        CREATE (vp1)-[:REPORTS_TO]->(ceo)
        CREATE (vp2)-[:REPORTS_TO]->(ceo)
        CREATE (mgr)-[:REPORTS_TO]->(vp1)
        CREATE (dev)-[:REPORTS_TO]->(mgr)
        CREATE (vp1)-[:WORKS_IN]->(eng)
        CREATE (mgr)-[:WORKS_IN]->(eng)
        CREATE (dev)-[:WORKS_IN]->(eng)
        CREATE (vp2)-[:WORKS_IN]->(prod)
    """)
    return session


@pytest.fixture
def compliance_graph(session):
    """Create a small compliance graph for testing."""
    session.run("""
        CREATE (r1:Regulation {name: 'SOX Section 404',
                               jurisdiction: 'US'})
        CREATE (r2:Regulation {name: 'GDPR Article 30',
                               jurisdiction: 'EU'})
        CREATE (p1:Process {name: 'Payment Processing',
                            process_id: 'PP-001'})
        CREATE (p2:Process {name: 'Customer Onboarding',
                            process_id: 'CO-001'})
        CREATE (c1:Control {name: 'Access Review',
                            control_id: 'AC-001'})
        CREATE (c2:Control {name: 'Data Encryption',
                            control_id: 'DE-001'})

        CREATE (p1)-[:SUBJECT_TO]->(r1)
        CREATE (p2)-[:SUBJECT_TO]->(r2)
        CREATE (c1)-[:MITIGATES]->(r1)
        CREATE (c2)-[:MITIGATES]->(r2)
        CREATE (p1)-[:IMPLEMENTS]->(c1)
        CREATE (p2)-[:IMPLEMENTS]->(c2)
    """)
    return session
```

## 04. Unit Tests: Testing Cypher Queries

Unit tests verify that individual Cypher queries return correct results against known fixture data. Each test loads a small graph, runs one query, and asserts the result.

```python
# test_cypher_queries.py

class TestOrgQueries:
    """Unit tests for organizational hierarchy queries."""

    def test_direct_reports(self, org_hierarchy):
        """CEO should have exactly 2 direct reports."""
        result = org_hierarchy.run("""
            MATCH (p:Person)-[:REPORTS_TO]->(ceo:Person {name: 'Alice Chen'})
            RETURN p.name AS name ORDER BY name
        """)
        names = [r["name"] for r in result]
        assert names == ["Bob Kumar", "Carol Diaz"]

    def test_full_chain(self, org_hierarchy):
        """Eve should have a 3-hop chain to CEO."""
        result = org_hierarchy.run("""
            MATCH path = (dev:Person {name: 'Eve Liu'})
                -[:REPORTS_TO*]->(ceo:Person {title: 'CEO'})
            RETURN length(path) AS hops,
                   [n IN nodes(path) | n.name] AS chain
        """)
        record = result.single()
        assert record["hops"] == 3
        assert record["chain"] == [
            "Eve Liu", "Dan Park", "Bob Kumar", "Alice Chen"
        ]

    def test_department_members(self, org_hierarchy):
        """Engineering department should have 3 members."""
        result = org_hierarchy.run("""
            MATCH (p:Person)-[:WORKS_IN]->(d:Department {name: 'Engineering'})
            RETURN count(p) AS member_count
        """)
        assert result.single()["member_count"] == 3

    def test_no_orphan_employees(self, org_hierarchy):
        """Every non-CEO person should have a REPORTS_TO relationship."""
        result = org_hierarchy.run("""
            MATCH (p:Person)
            WHERE p.title <> 'CEO'
              AND NOT (p)-[:REPORTS_TO]->(:Person)
            RETURN p.name AS orphan
        """)
        orphans = [r["orphan"] for r in result]
        assert orphans == [], f"Orphan employees found: {orphans}"

    def test_no_circular_reporting(self, org_hierarchy):
        """No person should report to themselves through any chain."""
        result = org_hierarchy.run("""
            MATCH path = (p:Person)-[:REPORTS_TO*]->(p)
            RETURN p.name AS circular
        """)
        circulars = [r["circular"] for r in result]
        assert circulars == [], f"Circular reporting: {circulars}"


class TestComplianceQueries:
    """Unit tests for compliance graph queries."""

    def test_regulations_for_process(self, compliance_graph):
        """Payment Processing should be subject to SOX."""
        result = compliance_graph.run("""
            MATCH (p:Process {name: 'Payment Processing'})
                  -[:SUBJECT_TO]->(r:Regulation)
            RETURN r.name AS regulation
        """)
        assert result.single()["regulation"] == "SOX Section 404"

    def test_controls_for_regulation(self, compliance_graph):
        """Each regulation should have at least one control."""
        result = compliance_graph.run("""
            MATCH (r:Regulation)
            OPTIONAL MATCH (c:Control)-[:MITIGATES]->(r)
            WITH r.name AS regulation, count(c) AS control_count
            WHERE control_count = 0
            RETURN regulation
        """)
        uncontrolled = [r["regulation"] for r in result]
        assert uncontrolled == [], (
            f"Regulations without controls: {uncontrolled}"
        )

    def test_process_to_regulation_traceability(self, compliance_graph):
        """Every process should trace to at least one regulation."""
        result = compliance_graph.run("""
            MATCH (p:Process)
            WHERE NOT (p)-[:SUBJECT_TO]->(:Regulation)
            RETURN p.name AS unregulated
        """)
        unregulated = [r["unregulated"] for r in result]
        assert unregulated == [], (
            f"Processes not linked to regulations: {unregulated}"
        )
```

## 05. Integration Tests: Testing the Extraction Pipeline

Integration tests verify that the end-to-end extraction pipeline — from source data to graph — produces the correct graph structure. These tests run slower because they exercise the full pipeline.

```python
# test_extraction_pipeline.py

import json

class TestExtractionPipeline:
    """Integration tests for the data extraction pipeline."""

    def test_employee_sync_creates_nodes(self, session):
        """Syncing employee records should create Person nodes."""
        # Simulate CDC events (from Chapter 13)
        employees = [
            {"id": 100, "name": "Test User A", "title": "Engineer",
             "email": "a@test.com", "department_id": None,
             "manager_id": None, "status": "active"},
            {"id": 101, "name": "Test User B", "title": "Manager",
             "email": "b@test.com", "department_id": None,
             "manager_id": None, "status": "active"},
        ]

        for emp in employees:
            session.run("""
                MERGE (p:Person {employee_id: $emp_id})
                SET p.name   = $name,
                    p.title  = $title,
                    p.email  = $email,
                    p.status = $status
            """, emp_id=emp["id"], name=emp["name"],
                 title=emp["title"], email=emp["email"],
                 status=emp["status"])

        result = session.run(
            "MATCH (p:Person) RETURN count(p) AS cnt"
        )
        assert result.single()["cnt"] == 2

    def test_relationship_sync_creates_edges(self, session):
        """Syncing join table rows should create relationships."""
        # Create nodes first
        session.run("""
            CREATE (p:Person {employee_id: 100, name: 'User A'})
            CREATE (proj:Project {project_id: 200, name: 'Alpha'})
        """)

        # Simulate relationship sync
        session.run("""
            MATCH (p:Person {employee_id: $emp_id})
            MATCH (proj:Project {project_id: $proj_id})
            MERGE (p)-[r:WORKS_ON]->(proj)
            SET r.role = $role
        """, emp_id=100, proj_id=200, role="lead")

        result = session.run("""
            MATCH (p:Person)-[r:WORKS_ON]->(proj:Project)
            RETURN p.name AS person, proj.name AS project,
                   r.role AS role
        """)
        record = result.single()
        assert record["person"] == "User A"
        assert record["project"] == "Alpha"
        assert record["role"] == "lead"

    def test_idempotent_sync(self, session):
        """Running the same sync twice should not create duplicates."""
        for _ in range(3):
            session.run("""
                MERGE (p:Person {employee_id: 100})
                SET p.name = 'User A', p.title = 'Engineer'
            """)

        result = session.run(
            "MATCH (p:Person {employee_id: 100}) RETURN count(p) AS cnt"
        )
        assert result.single()["cnt"] == 1

    def test_delete_preserves_history(self, session):
        """Soft delete should mark node, not remove it."""
        session.run("""
            CREATE (p:Person {employee_id: 100, name: 'User A',
                              status: 'active'})
            CREATE (proj:Project {project_id: 200, name: 'Alpha'})
            CREATE (p)-[:WORKS_ON]->(proj)
        """)

        # Simulate soft delete
        session.run("""
            MATCH (p:Person {employee_id: 100})
            SET p.status = 'deleted', p.deleted = datetime()
        """)

        # Node still exists
        result = session.run(
            "MATCH (p:Person {employee_id: 100}) "
            "RETURN p.status AS status"
        )
        assert result.single()["status"] == "deleted"

        # Relationship still exists
        result = session.run("""
            MATCH (p:Person {employee_id: 100})-[r:WORKS_ON]->(proj)
            RETURN count(r) AS rel_count
        """)
        assert result.single()["rel_count"] == 1


class TestGraphStructure:
    """Tests that verify the overall graph structure is valid."""

    def test_no_disconnected_nodes(self, org_hierarchy):
        """Every node should have at least one relationship."""
        result = org_hierarchy.run("""
            MATCH (n)
            WHERE NOT (n)--()
            RETURN labels(n) AS labels, properties(n) AS props
        """)
        disconnected = list(result)
        assert len(disconnected) == 0, (
            f"Disconnected nodes: {disconnected}"
        )

    def test_relationship_types_valid(self, org_hierarchy):
        """Only expected relationship types should exist."""
        expected = {"REPORTS_TO", "WORKS_IN"}
        result = org_hierarchy.run("""
            MATCH ()-[r]->()
            RETURN DISTINCT type(r) AS rel_type
        """)
        actual = {r["rel_type"] for r in result}
        unexpected = actual - expected
        assert unexpected == set(), (
            f"Unexpected relationship types: {unexpected}"
        )

    def test_node_labels_valid(self, org_hierarchy):
        """Only expected node labels should exist."""
        expected = {"Person", "Department"}
        result = org_hierarchy.run("""
            MATCH (n)
            UNWIND labels(n) AS label
            RETURN DISTINCT label
        """)
        actual = {r["label"] for r in result}
        unexpected = actual - expected
        assert unexpected == set(), (
            f"Unexpected node labels: {unexpected}"
        )
```

## 06. Query Regression Tests

Query regression tests capture the expected output of key queries and verify that results do not change after data updates, schema migrations, or Cypher query refactoring.

```python
# test_query_regression.py

import json
from pathlib import Path

GOLDEN_DIR = Path(__file__).parent / "golden_files"


def save_golden(name: str, data: list[dict]):
    """Save expected query results to a golden file."""
    GOLDEN_DIR.mkdir(exist_ok=True)
    path = GOLDEN_DIR / f"{name}.json"
    path.write_text(json.dumps(data, indent=2, default=str))


def load_golden(name: str) -> list[dict]:
    """Load expected query results from a golden file."""
    path = GOLDEN_DIR / f"{name}.json"
    return json.loads(path.read_text())


class TestQueryRegression:
    """Regression tests: key queries must return stable results."""

    def test_reporting_chain_stable(self, org_hierarchy):
        """The reporting chain query should return consistent results."""
        result = org_hierarchy.run("""
            MATCH path = (p:Person)-[:REPORTS_TO*]->(top:Person)
            WHERE NOT (top)-[:REPORTS_TO]->()
            RETURN p.name AS employee,
                   length(path) AS depth,
                   [n IN nodes(path) | n.name] AS chain
            ORDER BY p.name
        """)
        records = [dict(r) for r in result]

        expected = [
            {"employee": "Bob Kumar", "depth": 1,
             "chain": ["Bob Kumar", "Alice Chen"]},
            {"employee": "Carol Diaz", "depth": 1,
             "chain": ["Carol Diaz", "Alice Chen"]},
            {"employee": "Dan Park", "depth": 2,
             "chain": ["Dan Park", "Bob Kumar", "Alice Chen"]},
            {"employee": "Eve Liu", "depth": 3,
             "chain": ["Eve Liu", "Dan Park", "Bob Kumar",
                       "Alice Chen"]},
        ]

        assert records == expected

    def test_department_summary_stable(self, org_hierarchy):
        """Department member counts should be stable."""
        result = org_hierarchy.run("""
            MATCH (p:Person)-[:WORKS_IN]->(d:Department)
            WITH d.name AS department, count(p) AS members
            RETURN department, members
            ORDER BY department
        """)
        records = [dict(r) for r in result]
        assert records == [
            {"department": "Engineering", "members": 3},
            {"department": "Product", "members": 1},
        ]

    def test_compliance_traceability_stable(self, compliance_graph):
        """Compliance traceability results should not drift."""
        result = compliance_graph.run("""
            MATCH (p:Process)-[:SUBJECT_TO]->(r:Regulation)
            OPTIONAL MATCH (c:Control)-[:MITIGATES]->(r)
            RETURN p.name AS process, r.name AS regulation,
                   collect(c.name) AS controls
            ORDER BY p.name
        """)
        records = [dict(r) for r in result]
        assert len(records) == 2
        assert records[0]["process"] == "Customer Onboarding"
        assert records[0]["controls"] == ["Data Encryption"]
```

## 07. Data Quality Tests

These are the automated checks from Chapter 9, packaged to run in CI/CD after every data load. They catch problems before bad data reaches production queries.

```python
# test_data_quality.py

class TestDataQuality:
    """Data quality checks — run after every data load."""

    def test_no_duplicate_ids(self, session):
        """No two nodes with the same label should share an ID."""
        checks = [
            ("Person", "employee_id"),
            ("Department", "dept_id"),
            ("Project", "project_id"),
        ]
        for label, id_prop in checks:
            result = session.run(f"""
                MATCH (n:{label})
                WHERE n.{id_prop} IS NOT NULL
                WITH n.{id_prop} AS id, count(*) AS cnt
                WHERE cnt > 1
                RETURN id, cnt
            """)
            dupes = list(result)
            assert len(dupes) == 0, (
                f"Duplicate {id_prop} in {label}: {dupes}"
            )

    def test_required_properties_present(self, org_hierarchy):
        """Key properties should never be null."""
        required = {
            "Person": ["name", "employee_id"],
            "Department": ["name", "dept_id"],
        }
        for label, props in required.items():
            for prop in props:
                result = org_hierarchy.run(f"""
                    MATCH (n:{label})
                    WHERE n.{prop} IS NULL
                    RETURN count(n) AS missing_count
                """)
                count = result.single()["missing_count"]
                assert count == 0, (
                    f"{label}.{prop} is null for {count} nodes"
                )

    def test_no_self_relationships(self, org_hierarchy):
        """No node should have a relationship to itself."""
        result = org_hierarchy.run("""
            MATCH (n)-[r]->(n)
            RETURN labels(n) AS labels, type(r) AS rel_type,
                   n.name AS name
        """)
        self_rels = list(result)
        assert len(self_rels) == 0, (
            f"Self-relationships found: {self_rels}"
        )

    def test_relationship_cardinality(self, org_hierarchy):
        """REPORTS_TO should have cardinality 0..1 (each person has
        at most one manager)."""
        result = org_hierarchy.run("""
            MATCH (p:Person)-[r:REPORTS_TO]->(:Person)
            WITH p, count(r) AS manager_count
            WHERE manager_count > 1
            RETURN p.name AS name, manager_count
        """)
        violations = list(result)
        assert len(violations) == 0, (
            f"Multiple managers: {violations}"
        )

    def test_string_fields_not_empty(self, org_hierarchy):
        """Name fields should not be empty strings."""
        result = org_hierarchy.run("""
            MATCH (p:Person)
            WHERE p.name IS NOT NULL AND trim(p.name) = ''
            RETURN p.employee_id AS id
        """)
        empty_names = list(result)
        assert len(empty_names) == 0, (
            f"Empty names: {empty_names}"
        )
```

## 08. Performance Tests

Performance tests establish baselines and catch regressions before they reach production.

```python
# test_performance.py

import time
import statistics


class TestQueryPerformance:
    """Performance benchmarks for critical graph queries."""

    @staticmethod
    def time_query(session, cypher: str, params: dict = None,
                   iterations: int = 10) -> dict:
        """Run a query multiple times and return timing stats."""
        # Warm-up run
        session.run(cypher, params or {}).consume()

        times = []
        for _ in range(iterations):
            start = time.perf_counter()
            session.run(cypher, params or {}).consume()
            elapsed_ms = (time.perf_counter() - start) * 1000
            times.append(elapsed_ms)

        return {
            "p50": statistics.median(times),
            "p95": sorted(times)[int(len(times) * 0.95)],
            "p99": sorted(times)[int(len(times) * 0.99)],
            "mean": statistics.mean(times),
            "min": min(times),
            "max": max(times),
        }

    def test_hierarchy_traversal_performance(self, org_hierarchy):
        """Full hierarchy traversal should complete under 50ms."""
        stats = self.time_query(org_hierarchy, """
            MATCH path = (p:Person)-[:REPORTS_TO*]->(top:Person)
            WHERE NOT (top)-[:REPORTS_TO]->()
            RETURN p.name, length(path), [n IN nodes(path) | n.name]
        """)
        assert stats["p95"] < 50, (
            f"Hierarchy traversal p95={stats['p95']:.1f}ms, expected <50ms"
        )

    def test_department_aggregation_performance(self, org_hierarchy):
        """Department aggregation should complete under 20ms."""
        stats = self.time_query(org_hierarchy, """
            MATCH (p:Person)-[:WORKS_IN]->(d:Department)
            RETURN d.name, count(p), collect(p.name)
        """)
        assert stats["p95"] < 20, (
            f"Dept aggregation p95={stats['p95']:.1f}ms, expected <20ms"
        )


# ── Benchmark tracking ──────────────────────────────────────

def save_benchmark(name: str, stats: dict, filepath: str = "benchmarks.json"):
    """Append benchmark results for historical tracking."""
    import json
    from datetime import datetime

    entry = {
        "name": name,
        "timestamp": datetime.now().isoformat(),
        **stats
    }

    try:
        with open(filepath) as f:
            benchmarks = json.load(f)
    except FileNotFoundError:
        benchmarks = []

    benchmarks.append(entry)

    with open(filepath, "w") as f:
        json.dump(benchmarks, f, indent=2)
```

## 09. Putting It All Together: CI/CD Integration

Here is how to wire these tests into a CI/CD pipeline:

```yaml
# .github/workflows/graph-tests.yml

name: Graph Database Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-and-integration:
    runs-on: ubuntu-latest
    services:
      neo4j:
        image: neo4j:5.26
        ports:
          - 7687:7687
        env:
          NEO4J_AUTH: neo4j/testpassword
          NEO4J_PLUGINS: '["apoc"]'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: pip install pytest neo4j testcontainers

      - name: Run unit tests
        run: pytest tests/test_cypher_queries.py -v

      - name: Run integration tests
        run: pytest tests/test_extraction_pipeline.py -v

      - name: Run data quality tests
        run: pytest tests/test_data_quality.py -v

  query-regression:
    runs-on: ubuntu-latest
    needs: unit-and-integration
    steps:
      - uses: actions/checkout@v4
      - name: Run regression tests
        run: pytest tests/test_query_regression.py -v

  performance:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: query-regression
    steps:
      - uses: actions/checkout@v4
      - name: Run performance benchmarks
        run: pytest tests/test_performance.py -v
      - name: Upload benchmark results
        uses: actions/upload-artifact@v4
        with:
          name: benchmarks
          path: benchmarks.json
```

### Practical Reference: Test Types Summary

| Test Type | Example | Tool | Layer |
| --- | --- | --- | --- |
| Node existence | "Person 'Alice' exists with title 'CEO'" | pytest + Neo4j driver | Unit |
| Relationship validity | "Alice has exactly 2 direct reports" | pytest + Neo4j driver | Unit |
| Traversal correctness | "Path from Eve to CEO is 3 hops" | pytest + Neo4j driver | Unit |
| Pipeline output | "CDC sync creates correct nodes and edges" | pytest + testcontainers | Integration |
| Idempotency | "Running sync 3x produces 1 node, not 3" | pytest + testcontainers | Integration |
| Result stability | "Reporting chain query returns same results after update" | pytest + golden files | Regression |
| Duplicate detection | "No two Person nodes share an employee_id" | pytest + Cypher | Data Quality |
| Property completeness | "All Person nodes have name and email" | pytest + Cypher | Data Quality |
| Cardinality check | "Each person reports to at most one manager" | pytest + Cypher | Data Quality |
| Latency baseline | "Hierarchy traversal p95 < 50ms" | pytest + timing | Performance |
| Throughput | "Pipeline processes 1000 events/sec" | pytest + timing | Performance |
| Full flow | "Document to graph to query produces correct answer" | pytest + full pipeline | End-to-End |

## 10. Chapter Checklist

Before you move on, verify:

- [ ] Your test suite uses a real Neo4j instance via testcontainers, not mocks
- [ ] Unit tests cover every critical Cypher query in your application
- [ ] Integration tests verify the extraction/sync pipeline produces correct graph structure
- [ ] Query regression tests capture expected results for key traversals
- [ ] Data quality tests check for duplicates, missing properties, and cardinality violations
- [ ] Performance tests track p50/p95/p99 latency for critical queries
- [ ] Tests run in CI/CD on every PR (unit, integration, data quality) and weekly (performance)
- [ ] The database is cleaned between tests to prevent test interdependence
