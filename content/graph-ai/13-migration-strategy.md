---
title: "Migration Strategy"
slug: "migration-strategy"
description: >-
  How to add a graph database alongside your existing relational
  systems without ripping anything out. Covers the sidecar pattern,
  CDC pipelines from PostgreSQL to Neo4j, phased migration timelines,
  dual-write vs CDC vs batch sync trade-offs, team structure, rollback
  strategies, and a complete CDC pipeline implementation with Debezium.
section: "graph-ai"
order: 13
part: "Part 05 Production"
badges:
  - "Migration"
  - "CDC Pipeline"
  - "Hybrid Architecture"
---

# Migration Strategy

Nobody is asking you to rip out Oracle. Here is how to add graphs incrementally instead.

## 01. Why Nobody Rips and Replaces

Every year, someone proposes ripping out the relational database and replacing it with something new. Every year, that proposal dies. It should. Your relational database has 15 years of battle-tested stored procedures, 200 reports built on top of it, an operations team that knows how to back it up and restore it at 3am, and a vendor support contract that someone in procurement spent 6 months negotiating.

Graph databases do not replace relational databases. They augment them. You add a graph alongside your existing systems, feed it the data that benefits most from graph representation, and query the graph for questions that relational databases answer poorly or not at all.

> **Think of it like this:** You do not tear down your house to add a workshop. You build the workshop in the backyard and run power from the main panel. The house keeps doing what the house does. The workshop handles what the house was never designed for — and they share electricity.

## 02. The Sidecar Pattern

The sidecar pattern is the foundational architecture for incremental graph adoption. Your relational database remains the system of record. The graph database runs alongside it as a read-optimized projection of specific, relationship-heavy data.

```
┌─────────────────────────────────────────────────┐
│                  Applications                    │
│                                                  │
│   ┌────────────┐          ┌────────────────┐    │
│   │ CRUD Ops   │          │ Graph Queries   │    │
│   │ Reports    │          │ Traversals      │    │
│   │ Transactions│         │ Path Analysis   │    │
│   └─────┬──────┘          └───────┬────────┘    │
│         │                         │              │
│   ┌─────▼──────┐   Sync    ┌─────▼────────┐    │
│   │ PostgreSQL │ ────────> │    Neo4j      │    │
│   │  (Primary) │           │  (Sidecar)    │    │
│   └────────────┘           └──────────────┘     │
└─────────────────────────────────────────────────┘
```

### What Stays in the Relational Database

- Transactional writes (orders, payments, user accounts)
- Financial reporting and audit trails
- Data subject to strict ACID compliance requirements
- Any table that existing applications depend on

### What Moves to the Graph

- Relationship-heavy data (organizational hierarchies, product dependencies)
- Data you query by traversal ("find all downstream systems affected by this failure")
- Knowledge graph projections from documents
- Any query that currently requires 4+ JOINs and runs slowly

### The Rule of Thumb

If your question starts with "find all things connected to X," that belongs in the graph. If your question starts with "sum the revenue for Q3," that stays in the relational database.

## 03. What to Migrate First

Not all data benefits equally from graph representation. Start with data that has the highest relationship density and the most painful SQL queries.

### Scoring Your Data for Graph Suitability

| Factor | Score 1 (Low) | Score 5 (High) |
| --- | --- | --- |
| **Relationship density** | Each row references 1-2 other tables | Each row references 5+ other tables with recursive refs |
| **Query complexity** | Simple SELECTs with 1-2 JOINs | Recursive CTEs, 4+ JOINs, self-joins |
| **Traversal depth** | Flat lookups | "Find everything connected within 3 hops" |
| **Schema variability** | Fixed schema, rarely changes | New entity types and relationship types monthly |
| **Business pain** | Queries run fine | Queries time out, reports are late, users complain |

Score each data domain on these 5 factors. A total score of 20 or above means migrate this first. A total score below 10 means leave it in the relational database for now.

### Common High-Scoring Candidates

| Data Domain | Typical Score | Why |
| --- | --- | --- |
| Organizational hierarchy | 22 | Deep recursive queries, frequent reorgs |
| IT service dependencies | 24 | Many-to-many, blast radius queries |
| Product component trees | 20 | Deep nesting, variant tracking |
| Fraud transaction networks | 25 | Multi-hop traversals, pattern matching |
| Regulatory compliance mapping | 21 | Cross-references, traceability requirements |
| Customer relationship networks | 19 | Many relationship types, path queries |

## 04. Sync Strategies: Dual-Write vs CDC vs Batch

There are three ways to keep the graph in sync with the relational database. Each has trade-offs that affect your architecture choices.

### Comparison Table

| Factor | Dual-Write | CDC (Change Data Capture) | Batch Sync |
| --- | --- | --- | --- |
| **Latency** | Near-zero (writes to both) | Seconds to low minutes | Minutes to hours |
| **Consistency** | Risk of partial failure | Eventually consistent | Stale between batches |
| **Complexity** | High (app code changes) | Medium (infrastructure) | Low (scheduled job) |
| **Failure modes** | One DB writes, other fails | Pipeline lag, connector crash | Job fails, data stale |
| **Code changes** | Every write path modified | None (reads DB log) | Minimal (add sync job) |
| **Recommended for** | Tiny data, tight coupling | Most production use cases | Initial load, low-change data |
| **Operational burden** | High (distributed transactions) | Medium (manage Kafka/Debezium) | Low (cron job) |

### The Short Answer

Use CDC for production sync. Use batch for the initial data load. Avoid dual-write unless you have a specific reason for it and are prepared to handle distributed transaction failures.

> **Think of it like this:** Dual-write is like asking someone to write a letter and simultaneously type it — they will eventually make a mistake and the two copies will diverge. CDC is like a copy machine that watches everything you write and automatically makes a copy — it can fall behind, but it never forgets. Batch is like photocopying everything at the end of the day — simple, but you are always working with yesterday's information.

## 05. CDC Pipeline: PostgreSQL to Neo4j

CDC (Change Data Capture) reads the database transaction log (the write-ahead log, or WAL, in PostgreSQL) and streams every INSERT, UPDATE, and DELETE as an event. Debezium is the standard open-source CDC connector. It reads the WAL, publishes events to Kafka, and a consumer writes those events to Neo4j.

### Architecture

```
PostgreSQL WAL → Debezium Connector → Kafka Topics → Consumer → Neo4j
```

Each table gets its own Kafka topic. The consumer reads from those topics, transforms each relational row into a graph operation, and executes it against Neo4j.

### Step 1: Configure PostgreSQL for Logical Replication

```sql
-- postgresql.conf changes (or ALTER SYSTEM)
ALTER SYSTEM SET wal_level = 'logical';
ALTER SYSTEM SET max_replication_slots = 4;
ALTER SYSTEM SET max_wal_senders = 4;

-- Create a replication user
CREATE ROLE cdc_user WITH REPLICATION LOGIN PASSWORD 'secure_password';

-- Grant access to the tables you want to capture
GRANT SELECT ON ALL TABLES IN SCHEMA public TO cdc_user;

-- Create a publication for the tables you want to sync
CREATE PUBLICATION graph_sync FOR TABLE
    employees, departments, projects,
    employee_projects, department_hierarchy;
```

### Step 2: Debezium Connector Configuration

```json
{
  "name": "pg-graph-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres-host",
    "database.port": "5432",
    "database.user": "cdc_user",
    "database.password": "secure_password",
    "database.dbname": "enterprise_db",
    "database.server.name": "enterprise",
    "plugin.name": "pgoutput",
    "publication.name": "graph_sync",
    "slot.name": "graph_sync_slot",
    "table.include.list": "public.employees,public.departments,public.projects,public.employee_projects,public.department_hierarchy",
    "transforms": "route",
    "transforms.route.type": "org.apache.kafka.connect.transforms.RegexRouter",
    "transforms.route.regex": "enterprise.public.(.*)",
    "transforms.route.replacement": "graph.sync.$1"
  }
}
```

### Step 3: The Consumer — Transforming Rows to Graph Operations

```python
import json
import logging
from dataclasses import dataclass
from confluent_kafka import Consumer, KafkaError
from neo4j import GraphDatabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cdc_consumer")


@dataclass
class CDCEvent:
    """Represents a parsed Debezium CDC event."""
    operation: str          # "c" create, "u" update, "d" delete
    table: str
    before: dict | None     # Previous row state (for updates/deletes)
    after: dict | None      # New row state (for creates/updates)
    timestamp_ms: int


def parse_debezium_event(message_value: bytes) -> CDCEvent:
    """Parse a raw Debezium message into a CDCEvent."""
    payload = json.loads(message_value)["payload"]
    source = payload.get("source", {})
    return CDCEvent(
        operation=payload["op"],
        table=source.get("table", "unknown"),
        before=payload.get("before"),
        after=payload.get("after"),
        timestamp_ms=payload.get("ts_ms", 0)
    )


# ── Mapping: relational table → graph operation ──────────────

TABLE_HANDLERS = {}

def handles(table_name: str):
    """Decorator to register a handler for a specific table."""
    def decorator(func):
        TABLE_HANDLERS[table_name] = func
        return func
    return decorator


@handles("employees")
def handle_employee(event: CDCEvent, session):
    """Sync employee rows to Person nodes."""
    if event.operation in ("c", "u"):
        row = event.after
        session.run("""
            MERGE (p:Person {employee_id: $emp_id})
            SET p.name      = $name,
                p.title     = $title,
                p.email     = $email,
                p.status    = $status,
                p.updated   = datetime()
        """, emp_id=row["id"], name=row["name"],
             title=row["title"], email=row["email"],
             status=row.get("status", "active"))

        # If department_id is set, link to department
        if row.get("department_id"):
            session.run("""
                MATCH (p:Person {employee_id: $emp_id})
                MATCH (d:Department {dept_id: $dept_id})
                MERGE (p)-[:WORKS_IN]->(d)
            """, emp_id=row["id"], dept_id=row["department_id"])

        # If manager_id is set, link to manager
        if row.get("manager_id"):
            session.run("""
                MATCH (p:Person {employee_id: $emp_id})
                MATCH (m:Person {employee_id: $mgr_id})
                MERGE (p)-[:REPORTS_TO]->(m)
            """, emp_id=row["id"], mgr_id=row["manager_id"])

    elif event.operation == "d":
        row = event.before
        session.run("""
            MATCH (p:Person {employee_id: $emp_id})
            SET p.status = 'deleted', p.deleted = datetime()
        """, emp_id=row["id"])


@handles("departments")
def handle_department(event: CDCEvent, session):
    """Sync department rows to Department nodes."""
    if event.operation in ("c", "u"):
        row = event.after
        session.run("""
            MERGE (d:Department {dept_id: $dept_id})
            SET d.name    = $name,
                d.code    = $code,
                d.updated = datetime()
        """, dept_id=row["id"], name=row["name"],
             code=row.get("code", ""))
    elif event.operation == "d":
        row = event.before
        session.run("""
            MATCH (d:Department {dept_id: $dept_id})
            SET d.status = 'deleted', d.deleted = datetime()
        """, dept_id=row["id"])


@handles("employee_projects")
def handle_employee_project(event: CDCEvent, session):
    """Sync the join table to WORKS_ON relationships."""
    if event.operation in ("c", "u"):
        row = event.after
        session.run("""
            MATCH (p:Person {employee_id: $emp_id})
            MATCH (proj:Project {project_id: $proj_id})
            MERGE (p)-[r:WORKS_ON]->(proj)
            SET r.role      = $role,
                r.start_date = $start,
                r.updated    = datetime()
        """, emp_id=row["employee_id"],
             proj_id=row["project_id"],
             role=row.get("role", "member"),
             start=row.get("start_date"))
    elif event.operation == "d":
        row = event.before
        session.run("""
            MATCH (p:Person {employee_id: $emp_id})
                  -[r:WORKS_ON]->
                  (proj:Project {project_id: $proj_id})
            DELETE r
        """, emp_id=row["employee_id"],
             proj_id=row["project_id"])


# ── Main consumer loop ───────────────────────────────────────

def run_consumer(
    kafka_bootstrap: str,
    neo4j_uri: str,
    neo4j_user: str,
    neo4j_password: str
):
    """Main CDC consumer loop."""
    consumer = Consumer({
        "bootstrap.servers": kafka_bootstrap,
        "group.id": "graph-sync-consumer",
        "auto.offset.reset": "earliest",
        "enable.auto.commit": False
    })

    topics = [f"graph.sync.{t}" for t in TABLE_HANDLERS]
    consumer.subscribe(topics)

    driver = GraphDatabase.driver(
        neo4j_uri, auth=(neo4j_user, neo4j_password)
    )

    logger.info("CDC consumer started. Listening on %s", topics)
    processed = 0
    errors = 0

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                logger.error("Kafka error: %s", msg.error())
                errors += 1
                continue

            try:
                event = parse_debezium_event(msg.value())
                handler = TABLE_HANDLERS.get(event.table)

                if handler:
                    with driver.session() as session:
                        handler(event, session)
                    processed += 1
                    if processed % 1000 == 0:
                        logger.info(
                            "Processed %d events (%d errors)",
                            processed, errors
                        )

                consumer.commit(msg)

            except Exception as e:
                logger.error(
                    "Failed to process event from %s: %s",
                    msg.topic(), e
                )
                errors += 1
                # In production: send to dead letter queue
                # dlq_producer.produce("graph.sync.dlq", msg.value())

    except KeyboardInterrupt:
        logger.info("Shutting down. Processed %d events.", processed)
    finally:
        consumer.close()
        driver.close()


if __name__ == "__main__":
    run_consumer(
        kafka_bootstrap="localhost:9092",
        neo4j_uri="bolt://localhost:7687",
        neo4j_user="neo4j",
        neo4j_password="password"
    )
```

### Key Design Decisions in This Pipeline

1. **Soft deletes in the graph.** When a row is deleted from PostgreSQL, the node in Neo4j is not deleted. It is marked as deleted. This preserves historical relationships and avoids orphaning connected nodes.

2. **MERGE, not CREATE.** Every write uses MERGE (upsert) so the pipeline is idempotent. If Kafka redelivers a message, the result is the same.

3. **One handler per table.** The decorator pattern keeps the mapping clean. When you add a new table, you write one function and register it.

4. **Manual commit.** The Kafka offset is committed only after the Neo4j write succeeds. If the consumer crashes mid-write, it re-reads and re-processes the event on restart.

## 06. Phased Migration Timeline

A phased approach reduces risk and builds organizational confidence. Do not try to migrate everything at once.

### Phase 1: Proof of Concept (Weeks 1-4)

**Goal:** Demonstrate graph value with one high-scoring data domain.

| Task | Owner | Duration |
| --- | --- | --- |
| Score data domains for graph suitability | Data Engineer + BA | 3 days |
| Set up Neo4j in a dev environment | Developer | 2 days |
| Batch-load the highest-scoring data domain | Data Engineer | 1 week |
| Build 3-5 graph queries that answer painful business questions | Developer + BA | 1 week |
| Present results to stakeholders | Team Lead | 1 day |

**Exit criteria:** Stakeholders see concrete value. At least one query answers a question that was previously impossible or required hours of manual work.

### Phase 2: Pipeline (Weeks 5-10)

**Goal:** Automated sync from PostgreSQL to Neo4j via CDC.

| Task | Owner | Duration |
| --- | --- | --- |
| Set up Kafka and Debezium in staging | DevOps / Data Engineer | 1 week |
| Implement CDC consumer for Phase 1 tables | Developer | 2 weeks |
| Data consistency validation (compare PG vs Neo4j) | QA | 1 week |
| Build monitoring and alerting | DevOps | 1 week |
| Load testing and performance tuning | Developer + DBA | 1 week |

**Exit criteria:** CDC pipeline runs in staging for 2 weeks with zero data inconsistencies. Monitoring dashboard shows pipeline health.

### Phase 3: Production (Weeks 11-16)

**Goal:** CDC pipeline running in production. Applications querying the graph.

| Task | Owner | Duration |
| --- | --- | --- |
| Deploy Neo4j to production environment | DevOps | 1 week |
| Deploy CDC pipeline to production | DevOps + Data Engineer | 1 week |
| Migrate first application to read from graph | Developer | 2 weeks |
| Runbook creation and on-call training | DevOps + Developer | 1 week |
| Rollback drill (simulate failures, practice recovery) | Whole team | 1 day |

**Exit criteria:** One production application reads from the graph. On-call team can handle common failure scenarios without escalation.

### Phase 4: Expansion (Weeks 17-24)

**Goal:** Additional data domains in the graph. More applications consuming graph data.

| Task | Owner | Duration |
| --- | --- | --- |
| Add 2-3 more data domains to CDC pipeline | Data Engineer + Developer | 3 weeks |
| Build graph-powered features (recommendations, impact analysis) | Developer | 3 weeks |
| Knowledge graph layer (document extraction, Chapter 7) | Data Engineer + Developer | 2 weeks |
| Performance optimization based on production metrics | DBA + Developer | Ongoing |

**Exit criteria:** Graph serves multiple use cases. Team operates independently without external consulting.

## 07. Team Structure: Who Does What

Graph migration is a team effort. Here is who does what.

| Role | Phase 1 Responsibilities | Phase 2-4 Responsibilities |
| --- | --- | --- |
| **DBA** | Assess relational schema for graph suitability, configure WAL for CDC | Monitor replication lag, tune PostgreSQL for CDC load, manage replication slots |
| **Data Engineer** | Design graph data model, batch-load initial data | Build and maintain CDC pipeline, add new table handlers, data quality checks |
| **Developer** | Write Cypher queries, build graph API layer | Integrate graph queries into applications, build new features on graph data |
| **BA / PM** | Identify high-value use cases, score data domains | Define requirements for new graph features, validate business value |
| **QA** | Validate batch-loaded data accuracy | Build data consistency tests, regression tests for graph queries (Chapter 14) |
| **DevOps** | Set up Neo4j dev environment | Deploy and monitor Kafka, Debezium, Neo4j in production, alerting, backups |

### The Common Mistake

Teams often assign graph migration to one person. That person becomes a single point of failure and burns out. The minimum viable team is three people: one data engineer (pipeline), one developer (queries and application integration), and one DevOps person (infrastructure). Everyone else contributes part-time.

## 08. Risk Mitigation

### Rollback Strategy

Every phase needs a rollback plan. Here is the framework:

| Risk | Detection | Rollback | Prevention |
| --- | --- | --- | --- |
| **CDC pipeline drops events** | Comparison query shows count mismatch between PG and Neo4j | Re-run batch sync for affected tables | Dead letter queue, offset tracking, monitoring |
| **Neo4j goes down** | Health check fails, application timeout | Applications fall back to relational queries | Read replicas, automated failover |
| **Data inconsistency** | Consistency check job finds mismatches | Flag affected nodes, re-sync from PG | Nightly consistency validation job |
| **Performance degradation** | Query latency exceeds baseline | Disable graph queries, route to relational | Load testing before launch, query optimization |
| **Schema change in PG** | CDC consumer throws parsing errors | Pause pipeline, update handler, replay | Schema change notifications from DBA, versioned handlers |

### The Fallback Rule

Because the graph is a sidecar and not the system of record, rollback is always the same: stop reading from the graph and go back to reading from the relational database. Your application code should have a feature flag for every graph-powered query path:

```python
from functools import wraps

# Feature flags — toggle graph queries without deployment
GRAPH_FEATURES = {
    "org_hierarchy_traversal": True,
    "impact_analysis": True,
    "dependency_lookup": False,  # Not yet in production
}


def with_graph_fallback(feature_name: str, relational_fallback):
    """Decorator: try graph query, fall back to relational."""
    def decorator(graph_func):
        @wraps(graph_func)
        def wrapper(*args, **kwargs):
            if not GRAPH_FEATURES.get(feature_name, False):
                return relational_fallback(*args, **kwargs)
            try:
                return graph_func(*args, **kwargs)
            except Exception as e:
                logger.warning(
                    "Graph query failed for %s, falling back: %s",
                    feature_name, e
                )
                return relational_fallback(*args, **kwargs)
        return wrapper
    return decorator


# Usage:

def get_org_hierarchy_sql(person_id: int) -> list[dict]:
    """Fallback: recursive CTE in PostgreSQL."""
    # ... existing SQL query ...
    pass


@with_graph_fallback(
    "org_hierarchy_traversal",
    relational_fallback=get_org_hierarchy_sql
)
def get_org_hierarchy(person_id: int) -> list[dict]:
    """Primary: graph traversal in Neo4j."""
    with neo4j_driver.session() as session:
        result = session.run("""
            MATCH path = (p:Person {employee_id: $pid})
                -[:REPORTS_TO*]->(m:Person)
            RETURN [n IN nodes(path) | n.name] AS chain
        """, pid=person_id)
        return [dict(r) for r in result]
```

### Data Consistency Checks

Run these nightly as a scheduled job:

```python
def validate_sync_consistency(pg_conn, neo4j_session):
    """Compare counts and spot-check records between PG and Neo4j."""
    checks = []

    # 1. Count comparison
    pg_count = pg_conn.execute(
        "SELECT COUNT(*) FROM employees WHERE status = 'active'"
    ).fetchone()[0]

    neo4j_count = neo4j_session.run(
        "MATCH (p:Person) WHERE p.status <> 'deleted' RETURN count(p)"
    ).single()[0]

    count_match = abs(pg_count - neo4j_count) <= 5  # Allow small lag
    checks.append({
        "check": "employee_count",
        "pg": pg_count,
        "neo4j": neo4j_count,
        "pass": count_match
    })

    # 2. Spot-check: pick 10 random employees, verify fields match
    sample = pg_conn.execute(
        "SELECT id, name, title, email FROM employees "
        "ORDER BY RANDOM() LIMIT 10"
    ).fetchall()

    mismatches = 0
    for emp in sample:
        neo4j_record = neo4j_session.run(
            "MATCH (p:Person {employee_id: $eid}) "
            "RETURN p.name AS name, p.title AS title, p.email AS email",
            eid=emp.id
        ).single()

        if neo4j_record is None:
            mismatches += 1
        elif (neo4j_record["name"] != emp.name
              or neo4j_record["title"] != emp.title):
            mismatches += 1

    checks.append({
        "check": "spot_check_10",
        "mismatches": mismatches,
        "pass": mismatches == 0
    })

    # 3. Relationship count check
    pg_rels = pg_conn.execute(
        "SELECT COUNT(*) FROM employee_projects"
    ).fetchone()[0]

    neo4j_rels = neo4j_session.run(
        "MATCH ()-[r:WORKS_ON]->() RETURN count(r)"
    ).single()[0]

    rel_match = abs(pg_rels - neo4j_rels) <= 5
    checks.append({
        "check": "works_on_count",
        "pg": pg_rels,
        "neo4j": neo4j_rels,
        "pass": rel_match
    })

    return checks
```

## 09. Chapter Checklist

Before you move on, verify:

- [ ] You have identified which data domains score highest for graph suitability
- [ ] You understand the sidecar pattern — graph augments, does not replace
- [ ] You can explain why CDC beats dual-write for production sync
- [ ] You have a phased plan with clear exit criteria for each phase
- [ ] Every graph query path has a relational fallback with a feature flag
- [ ] Nightly consistency checks are in place before you go live
- [ ] Your rollback plan does not require a deployment. A feature flag flip is sufficient.
