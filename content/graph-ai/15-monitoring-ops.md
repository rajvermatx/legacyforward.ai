---
title: "Monitoring and Operations"
slug: "monitoring-ops"
description: >-
  How to keep a graph database running in production. Covers the three
  things that will break at 3am, key metrics dashboards, alerting rules,
  backup and disaster recovery, scaling patterns including read replicas
  and connection pooling, cost management, and a runbook template for
  common operational issues.
section: "graph-ai"
order: 15
part: "Part 05 Production"
badges:
  - "Monitoring"
  - "Operations"
  - "Alerting"
---

# Monitoring and Operations

It is in production. Three things will wake you up at 3am if you do not monitor them.

## 01. The Three Things

After running graph databases in production across multiple organizations, three categories of failure account for the vast majority of 3am pages:

1. **Query latency spikes.** A query that ran in 200ms starts taking 15 seconds. Users see timeouts. The cause is usually an unindexed property lookup, a Cartesian product in a Cypher query, or a traversal that hit a supernode: a single node with 100,000 or more relationships.

2. **Graph size growth.** The graph was designed for 1 million nodes. It now has 50 million because someone added a data source without considering cardinality. Memory is exhausted, queries slow to a crawl, and the page cache starts evicting.

3. **Extraction pipeline failures.** The CDC pipeline from Chapter 13 stops processing events. The graph falls hours behind the relational database. Applications serve stale data, and nobody notices until a business user reports wrong results.

> **Think of it like this:** A graph database in production is like a highway system. Latency spikes are traffic jams — something is blocking a lane. Growth issues are running out of road capacity. Pipeline failures are on-ramps that have been closed — new data cannot get onto the highway.

## 02. Key Metrics Dashboard

Every graph database deployment needs a dashboard with these metrics. Whether you use Grafana, Datadog, or CloudWatch, track all of them from day one.

### Query Metrics

| Metric | What It Tells You | Collection Method |
| --- | --- | --- |
| **Query latency p50** | Median response time | Neo4j query log + Prometheus |
| **Query latency p95** | Tail latency experienced by 1 in 20 users | Neo4j query log + Prometheus |
| **Query latency p99** | Worst-case for 1 in 100 users | Neo4j query log + Prometheus |
| **Slow query count** | Queries exceeding threshold (e.g., > 1s) | Neo4j query log |
| **Query throughput** | Queries per second | Neo4j metrics endpoint |
| **Active transactions** | Currently executing queries | `dbms.listTransactions()` |

### Resource Metrics

| Metric | What It Tells You | Collection Method |
| --- | --- | --- |
| **Heap usage** | JVM memory pressure | JMX / Prometheus |
| **Page cache hit ratio** | % of reads served from memory vs disk | Neo4j metrics |
| **Page cache evictions** | Data being pushed out of memory | Neo4j metrics |
| **Disk usage** | Total store size and growth rate | OS metrics |
| **CPU utilization** | Processing capacity headroom | OS metrics |
| **GC pause time** | JVM garbage collection impact | JMX |

### Graph-Specific Metrics

| Metric | What It Tells You | Collection Method |
| --- | --- | --- |
| **Node count by label** | Graph size and composition | Periodic Cypher query |
| **Relationship count by type** | Relationship density | Periodic Cypher query |
| **Max node degree** | Supernode detection | Periodic Cypher query |
| **Connection pool utilization** | Driver connection pressure | Neo4j driver metrics |
| **Cluster replication lag** | How far behind read replicas are | Neo4j cluster metrics |

### Pipeline Metrics

| Metric | What It Tells You | Collection Method |
| --- | --- | --- |
| **CDC consumer lag** | Events waiting to be processed | Kafka consumer group metrics |
| **Events processed/sec** | Pipeline throughput | Consumer application metrics |
| **Dead letter queue depth** | Failed events needing attention | DLQ topic metrics |
| **Last successful sync** | How fresh the graph data is | Consumer heartbeat |

### Collecting Graph-Specific Metrics

```python
import time
import logging
from dataclasses import dataclass, field
from neo4j import GraphDatabase

logger = logging.getLogger("graph_metrics")


@dataclass
class GraphMetrics:
    """Snapshot of graph database metrics."""
    timestamp: float = field(default_factory=time.time)
    node_counts: dict = field(default_factory=dict)
    rel_counts: dict = field(default_factory=dict)
    total_nodes: int = 0
    total_relationships: int = 0
    max_degree: int = 0
    max_degree_node: str = ""
    store_size_mb: float = 0.0


def collect_graph_metrics(session) -> GraphMetrics:
    """Collect key graph metrics for dashboard."""
    metrics = GraphMetrics()

    # Node counts by label
    result = session.run("""
        CALL db.labels() YIELD label
        CALL {
            WITH label
            MATCH (n) WHERE label IN labels(n)
            RETURN count(n) AS cnt
        }
        RETURN label, cnt ORDER BY cnt DESC
    """)
    for record in result:
        metrics.node_counts[record["label"]] = record["cnt"]
        metrics.total_nodes += record["cnt"]

    # Relationship counts by type
    result = session.run("""
        CALL db.relationshipTypes() YIELD relationshipType AS type
        CALL {
            WITH type
            MATCH ()-[r]->() WHERE type(r) = type
            RETURN count(r) AS cnt
        }
        RETURN type, cnt ORDER BY cnt DESC
    """)
    for record in result:
        metrics.rel_counts[record["type"]] = record["cnt"]
        metrics.total_relationships += record["cnt"]

    # Supernode detection: find the node with most relationships
    result = session.run("""
        MATCH (n)
        WITH n, size([(n)--() | 1]) AS degree
        ORDER BY degree DESC
        LIMIT 1
        RETURN coalesce(n.name, n.id, toString(id(n))) AS node_id,
               labels(n) AS labels, degree
    """)
    record = result.single()
    if record:
        metrics.max_degree = record["degree"]
        metrics.max_degree_node = (
            f"{record['labels'][0]}:{record['node_id']}"
        )

    # Store size
    result = session.run("""
        CALL dbms.queryJmx('org.neo4j:*,name=Store sizes')
        YIELD attributes
        RETURN attributes
    """)
    # Note: exact JMX query depends on Neo4j version

    return metrics


def format_metrics_for_prometheus(metrics: GraphMetrics) -> str:
    """Format metrics as Prometheus text exposition."""
    lines = []
    lines.append(
        f"neo4j_total_nodes {metrics.total_nodes}"
    )
    lines.append(
        f"neo4j_total_relationships {metrics.total_relationships}"
    )
    lines.append(
        f"neo4j_max_node_degree {metrics.max_degree}"
    )

    for label, count in metrics.node_counts.items():
        lines.append(
            f'neo4j_node_count{{label="{label}"}} {count}'
        )

    for rel_type, count in metrics.rel_counts.items():
        lines.append(
            f'neo4j_rel_count{{type="{rel_type}"}} {count}'
        )

    return "\n".join(lines)
```

## 03. Alerting Rules: What to Alert On vs What to Log

Not everything is an alert. Alert fatigue kills on-call teams faster than actual incidents. Use this framework to separate signal from noise:

### Alert Hierarchy

| Level | Action | Example | Channel |
| --- | --- | --- | --- |
| **Page (P1)** | Wake someone up. Production is broken or about to break. | Query p99 > 10s for 5 min, CDC lag > 1 hour, disk > 95% | PagerDuty / phone |
| **Urgent (P2)** | Fix during business hours today. | Query p95 > 2s, cache hit ratio < 80%, DLQ depth > 100 | Slack alert channel |
| **Warning (P3)** | Review this week. Trend is concerning. | Node count growth > 20%/week, GC pauses > 500ms | Slack ops channel |
| **Info** | Log only. Useful for debugging, not actionable now. | Individual slow queries, connection pool fluctuations | Logs / dashboard |

### Specific Thresholds

| Metric | Warning | Urgent | Page |
| --- | --- | --- | --- |
| Query latency p95 | > 500ms | > 2s | > 5s for 5 min |
| Query latency p99 | > 2s | > 5s | > 10s for 5 min |
| Page cache hit ratio | < 90% | < 80% | < 60% |
| Heap utilization | > 70% | > 85% | > 95% |
| Disk utilization | > 70% | > 85% | > 95% |
| CDC consumer lag (events) | > 10,000 | > 50,000 | > 200,000 |
| CDC consumer lag (time) | > 5 min | > 15 min | > 1 hour |
| Dead letter queue depth | > 10 | > 100 | > 1,000 |
| Max node degree | > 10,000 | > 50,000 | > 200,000 |
| Active transactions | > 50 | > 100 | > 200 |

### Alerting Implementation

```python
from dataclasses import dataclass
from enum import Enum

class AlertLevel(Enum):
    INFO = "info"
    WARNING = "warning"
    URGENT = "urgent"
    PAGE = "page"


@dataclass
class AlertRule:
    name: str
    metric: str
    warning_threshold: float
    urgent_threshold: float
    page_threshold: float
    sustained_minutes: int = 0    # 0 = instant alert
    description: str = ""


ALERT_RULES = [
    AlertRule(
        name="query_latency_p95",
        metric="neo4j_query_latency_p95_ms",
        warning_threshold=500,
        urgent_threshold=2000,
        page_threshold=5000,
        sustained_minutes=5,
        description="Query latency p95 exceeds threshold"
    ),
    AlertRule(
        name="cache_hit_ratio",
        metric="neo4j_page_cache_hit_ratio",
        warning_threshold=90,   # Alert when BELOW threshold
        urgent_threshold=80,
        page_threshold=60,
        description="Page cache hit ratio below threshold"
    ),
    AlertRule(
        name="cdc_consumer_lag",
        metric="kafka_consumer_lag_seconds",
        warning_threshold=300,
        urgent_threshold=900,
        page_threshold=3600,
        sustained_minutes=2,
        description="CDC pipeline falling behind"
    ),
    AlertRule(
        name="disk_utilization",
        metric="disk_utilization_percent",
        warning_threshold=70,
        urgent_threshold=85,
        page_threshold=95,
        description="Disk space running low"
    ),
    AlertRule(
        name="supernode_degree",
        metric="neo4j_max_node_degree",
        warning_threshold=10_000,
        urgent_threshold=50_000,
        page_threshold=200_000,
        description="Supernode detected — high relationship count"
    ),
]


def evaluate_alert(rule: AlertRule, current_value: float) -> AlertLevel:
    """Evaluate a metric against alert thresholds."""
    # For "lower is worse" metrics like cache hit ratio
    if rule.name in ("cache_hit_ratio",):
        if current_value < rule.page_threshold:
            return AlertLevel.PAGE
        if current_value < rule.urgent_threshold:
            return AlertLevel.URGENT
        if current_value < rule.warning_threshold:
            return AlertLevel.WARNING
        return AlertLevel.INFO

    # For "higher is worse" metrics
    if current_value >= rule.page_threshold:
        return AlertLevel.PAGE
    if current_value >= rule.urgent_threshold:
        return AlertLevel.URGENT
    if current_value >= rule.warning_threshold:
        return AlertLevel.WARNING
    return AlertLevel.INFO
```

## 04. Backup and Disaster Recovery

Graph databases need backup strategies just as relational databases do. The approach depends on whether you are running self-managed Neo4j or a cloud-managed service.

### Backup Strategy

| Method | When to Use | RPO | RTO | Complexity |
| --- | --- | --- | --- | --- |
| **neo4j-admin dump** | Small to medium databases (< 50GB) | Point-in-time | 15-60 min | Low |
| **neo4j-admin backup** | Enterprise, online backup while running | Near-zero (with tx logs) | 10-30 min | Medium |
| **Cloud snapshots** | Cloud-managed (AuraDB, VM snapshots) | Snapshot interval | 5-15 min | Low |
| **CDC replay** | Rebuild from source relational DB | Depends on CDC lag | Hours | High |

### Backup Script

```bash
#!/bin/bash
# neo4j-backup.sh — daily backup with rotation

set -euo pipefail

BACKUP_DIR="/backups/neo4j"
RETENTION_DAYS=14
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="neo4j_backup_${TIMESTAMP}"

echo "Starting backup: ${BACKUP_NAME}"

# Online backup (Enterprise Edition)
neo4j-admin database backup \
    --to-path="${BACKUP_DIR}" \
    --type=full \
    neo4j

# Compress
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
    -C "${BACKUP_DIR}" "${BACKUP_NAME}"

# Upload to cloud storage
aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
    "s3://company-backups/neo4j/${BACKUP_NAME}.tar.gz"

# Clean up local backup directory
rm -rf "${BACKUP_DIR}/${BACKUP_NAME}"

# Rotate old backups
find "${BACKUP_DIR}" -name "*.tar.gz" \
    -mtime +${RETENTION_DAYS} -delete

echo "Backup complete: ${BACKUP_NAME}.tar.gz"
```

### Disaster Recovery Plan

| Scenario | Detection | Recovery Steps | Expected Time |
| --- | --- | --- | --- |
| **Corrupted database** | Startup failure, query errors | Restore from latest backup | 30-60 min |
| **Accidental data deletion** | User report, monitoring | Restore backup, replay CDC from timestamp | 1-2 hours |
| **Hardware failure** | Node unreachable | Failover to read replica, promote to primary | 5-15 min |
| **Cloud region outage** | Health checks fail | Switch to cross-region replica | 15-30 min |
| **Complete data loss** | Everything is gone | Rebuild from relational source via batch sync | 2-8 hours |

The last row is the ultimate safety net of the sidecar pattern. Because the relational database is the system of record, you can always rebuild the graph from scratch. It takes time, but you never truly lose data.

## 05. Scaling Patterns

### Read Replicas

For read-heavy workloads, which graph databases almost always are, add read replicas:

```
                    ┌──────────────────┐
                    │   Application    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Load Balancer   │
                    └──┬─────┬─────┬───┘
                       │     │     │
            ┌──────────▼┐ ┌─▼──────▼──┐
            │  Primary  │ │  Replica   │
            │  (writes) │ │  (reads)   │
            └───────────┘ └────────────┘
```

```python
from neo4j import GraphDatabase, READ_ACCESS, WRITE_ACCESS


def create_driver_with_routing(
    primary_uri: str,
    user: str,
    password: str
) -> GraphDatabase.driver:
    """Create a driver that routes reads to replicas."""
    # Use neo4j:// protocol for automatic routing
    driver = GraphDatabase.driver(
        primary_uri.replace("bolt://", "neo4j://"),
        auth=(user, password),
        max_connection_pool_size=100,
        connection_acquisition_timeout=30
    )
    return driver


def read_query(driver, cypher: str, params: dict = None):
    """Execute a read query — routed to a replica."""
    with driver.session(
        default_access_mode=READ_ACCESS
    ) as session:
        result = session.run(cypher, params or {})
        return [dict(r) for r in result]


def write_query(driver, cypher: str, params: dict = None):
    """Execute a write query — always goes to primary."""
    with driver.session(
        default_access_mode=WRITE_ACCESS
    ) as session:
        result = session.run(cypher, params or {})
        return result.consume()
```

### Connection Pooling

Connection pool exhaustion is a common production issue. Configure these settings before you go live:

| Setting | Default | Recommended | Why |
| --- | --- | --- | --- |
| `max_connection_pool_size` | 100 | 50-200 | Match your concurrency level |
| `connection_acquisition_timeout` | 60s | 30s | Fail fast, don't queue forever |
| `max_connection_lifetime` | 1 hour | 30 min | Prevent stale connections |
| `connection_timeout` | 30s | 10s | Detect unreachable server quickly |
| `keep_alive` | True | True | Detect broken connections |

### When to Consider Sharding

Most graph databases, including Neo4j, do not natively shard like relational databases. Before you consider sharding, exhaust these options:

1. **Index everything you query by.** Most latency problems are missing indexes, not capacity problems.
2. **Add read replicas.** If reads are the bottleneck, add replicas.
3. **Optimize queries.** Profile with `EXPLAIN` and `PROFILE` in Cypher. Fix Cartesian products and unbounded variable-length paths.
4. **Increase page cache.** If the cache hit ratio is below 95%, give Neo4j more RAM.
5. **Separate workloads.** Run analytics queries on a replica and operational queries on the primary.

If you have exhausted all of these options and still need more capacity, consider:

- **Domain-based partitioning:** Separate graphs per tenant or per business domain, with cross-graph federation at the application layer.
- **Fabric (Neo4j 5+):** Query across multiple Neo4j databases as if they were one.
- **Purpose-built distributed graph databases:** TigerGraph, Amazon Neptune, or JanusGraph for truly massive scale.

## 06. Cost Management

Cloud graph database costs can surprise teams that do not watch them. Here is what to monitor:

| Cost Driver | How It Grows | How to Control It |
| --- | --- | --- |
| **Instance size** | You picked a bigger machine | Right-size based on actual memory needs |
| **Storage** | Graph grows from new data sources | Monitor node/relationship count growth rate |
| **Read replicas** | You added replicas for read scaling | Only add when p95 latency requires it |
| **Network transfer** | Queries returning large result sets | Limit results in Cypher (`LIMIT`), paginate |
| **Backup storage** | Daily backups accumulate | Set retention policy, compress, tier to cold storage |

### Monthly Cost Estimation Template

```
Instance:     db.r6g.xlarge (4 vCPU, 32GB RAM)     $X/month
Storage:      100GB SSD                              $Y/month
Replicas:     1 read replica (same size)             $X/month
Backups:      14-day retention, ~50GB compressed     $Z/month
Network:      Estimated 500GB transfer               $W/month
──────────────────────────────────────────────────────────────
Total estimated:                                     $TOTAL/month
```

Track actual against estimated cost monthly. Set a budget alert at 80% of your estimate.

## 07. Runbook: Common Issues and Fixes

This runbook covers the 8 most common operational issues. Put it in your team's wiki where on-call engineers can find it at 3am.

### Issue 1: Query Latency Spike

**Symptoms:** p95 latency jumps from 200ms to 5 seconds or more. Users report timeouts.

**Diagnosis:**
```cypher
-- Find the slowest currently running queries
CALL dbms.listQueries() YIELD queryId, query, elapsedTimeMillis
WHERE elapsedTimeMillis > 5000
RETURN queryId, query, elapsedTimeMillis
ORDER BY elapsedTimeMillis DESC
```

**Common causes and fixes:**
1. Missing index: `CREATE INDEX FOR (n:Label) ON (n.property)`
2. Cartesian product: Add relationship patterns to connect disconnected `MATCH` clauses.
3. Supernode hit: Add degree filter `WHERE size((n)--()) < 10000`
4. Unbounded path: Change `[:REL*]` to `[:REL*..5]` with an explicit depth limit.

### Issue 2: CDC Pipeline Stopped

**Symptoms:** Kafka consumer lag growing, graph data is stale.

**Diagnosis:**
```bash
# Check consumer group lag
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --group graph-sync-consumer --describe

# Check connector status
curl -s http://localhost:8083/connectors/pg-graph-connector/status
```

**Common causes and fixes:**
1. Consumer crashed: Restart consumer, check dead letter queue for failed events.
2. Connector lost: Restart Debezium connector, verify PostgreSQL replication slot exists.
3. Schema change: Update CDC handler for new or changed columns, replay from last committed offset.
4. Kafka disk full: Increase retention, add brokers, or reduce topic retention time.

### Issue 3: Out of Memory

**Symptoms:** GC pauses over 1 second, heap usage above 95%, queries timing out.

**Diagnosis:**
```bash
# Check JVM heap usage
curl -s http://localhost:2004/metrics | grep heap

# Check for memory-hungry queries
CALL dbms.listQueries() YIELD query, allocatedBytes
ORDER BY allocatedBytes DESC LIMIT 5
```

**Common causes and fixes:**
1. Page cache too small: Increase `server.memory.pagecache.size`.
2. Heap too small: Increase `server.memory.heap.max_size`.
3. Query returning too much data: Add `LIMIT`, filter earlier in the query.
4. Graph outgrew instance: Upgrade instance size or add read replicas.

### Issue 4: Data Inconsistency Between PostgreSQL and Neo4j

**Symptoms:** Application shows different data depending on which database it queries.

**Diagnosis:**
```python
# Run the consistency check from Chapter 13
results = validate_sync_consistency(pg_conn, neo4j_session)
for check in results:
    if not check["pass"]:
        print(f"FAIL: {check}")
```

**Common causes and fixes:**
1. CDC lag: Wait for consumer to catch up and monitor lag.
2. Dropped events: Check dead letter queue, re-sync affected tables.
3. Handler bug: Fix the CDC handler, replay events from before the bug.
4. Schema drift: PostgreSQL column renamed but handler not updated.

### Issue 5: Supernode Causing Slow Queries

**Symptoms:** Specific traversal queries suddenly slow after a data load.

**Diagnosis:**
```cypher
-- Find nodes with highest degree
MATCH (n)
WITH n, size([(n)--() | 1]) AS degree
WHERE degree > 1000
RETURN labels(n) AS labels, n.name AS name, degree
ORDER BY degree DESC
LIMIT 20
```

**Common causes and fixes:**
1. Data modeling issue: Break the supernode into subgroups (by time period or category, for example).
2. Query issue: Filter relationships by type or property before traversing from the supernode.
3. Legitimate high-degree node: Add a degree check in the query and handle high-degree nodes separately.

### Issue 6: Backup Failure

**Symptoms:** Backup job exited with error. No recent backup available.

**Diagnosis:** Check backup job logs, verify disk space on backup target.

**Fixes:**
1. Disk full: Free space or increase the backup volume.
2. Database locked: Ensure backup runs during a low-traffic period.
3. Permission error: Verify the backup user has correct filesystem permissions.
4. Network error (cloud backup): Retry and verify cloud credentials.

### Issue 7: Read Replica Lag

**Symptoms:** Read replica returns stale data, replication lag metrics climbing.

**Fixes:**
1. Network bottleneck: Check bandwidth between primary and replica.
2. Replica overloaded: Reduce query load or add another replica.
3. Large transaction on primary: Wait for it to complete and replicate.
4. Restart the replica if lag does not recover within a reasonable window.

### Issue 8: Connection Pool Exhaustion

**Symptoms:** "Unable to acquire connection" errors in application logs.

**Fixes:**
1. Increase pool size if current size is too small for the workload.
2. Fix connection leaks: ensure every session is closed (use `with` blocks).
3. Reduce query time to free connections faster.
4. Add a connection acquisition timeout to fail fast rather than queue indefinitely.

## 08. Chapter Checklist

Before you move on, verify:

- [ ] You are monitoring query latency (p50/p95/p99), graph size, and pipeline health
- [ ] Alert thresholds are set and you have tested that alerts fire correctly
- [ ] Backup runs daily and you have tested restore at least once
- [ ] You have a disaster recovery plan that includes "rebuild from relational source"
- [ ] Connection pool is sized correctly and you monitor pool utilization
- [ ] The on-call team has a runbook they can find at 3am
- [ ] Cost monitoring is in place with budget alerts
- [ ] You have identified any supernodes and have queries that handle them gracefully
