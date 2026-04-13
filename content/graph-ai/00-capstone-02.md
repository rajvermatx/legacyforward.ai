---
title: "Capstone 2: Fraud Investigation Agent"
slug: "capstone-fraud-investigation-agent"
description: >-
  Build a graph-powered agent that traces transaction networks to
  investigate suspicious patterns. Covers graph modeling for financial
  transactions, agent architecture with Cypher traversal tools,
  multi-hop money flow tracing, and automated pattern detection for
  fraud rings, rapid movement, and structuring.
section: "graph-ai"
order: 17
part: "Part 06 Capstones"
badges:
  - "Fraud Detection"
  - "Transaction Graph"
  - "Investigation Agent"
---

# Capstone 2: Fraud Investigation Agent

Build an agent that a financial analyst can point at a suspicious account and say "Follow the money." It traces the transaction network across multiple hops, flags suspicious patterns, and produces an investigation report.

## The Scenario


![Diagram 1](/diagrams/graph-ai/capstone-02.svg)
A regional bank's fraud team manually investigates suspicious activity reports (SARs). An analyst gets an alert: Account A-7734 received an unusually large deposit and immediately sent smaller amounts to 8 different accounts. Today, the analyst spends 3-4 hours pulling transaction records, tracing where the money went, checking whether the receiving accounts are connected, and writing up findings.

The goal: build a transaction graph and an agent that automates the "follow the money" analysis. It traces funds across multiple hops, detects common fraud patterns (structuring, rapid movement, circular flows), and generates an investigation summary.

### What We Are Building

```
Transaction Data (CSV/DB)
        │
        ▼
┌──────────────────┐
│ Graph Model      │    Account ──SENT──> Transaction ──TO──> Account
│ Construction     │    Account ──HOLDS──> Entity
└────────┬─────────┘    Entity ──RELATED_TO──> Entity
         │
         ▼
┌──────────────────┐
│ Pattern          │    Detect: structuring, rapid movement,
│ Detection        │    circular flows, unusual volumes
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Investigation    │    Agent with Cypher tools that follows
│ Agent            │    the money and generates reports
└──────────────────┘
```

## Stage 1: The Transaction Graph Model

### Schema

| Node Type | Properties | Description |
| --- | --- | --- |
| **Account** | account_id, account_type, open_date, status, branch | Bank account |
| **Entity** | entity_id, name, entity_type (individual/business), risk_score | Account holder |
| **Transaction** | tx_id, amount, currency, timestamp, tx_type, description | A single transaction |
| **Alert** | alert_id, alert_type, severity, created_date, status | Generated alerts |

| Relationship | From | To | Properties |
| --- | --- | --- | --- |
| **SENT** | Account | Transaction | - |
| **RECEIVED** | Transaction | Account | - |
| **HOLDS** | Entity | Account | role (owner/signatory/beneficiary) |
| **RELATED_TO** | Entity | Entity | relationship (spouse/business_partner/employee) |
| **TRIGGERED** | Transaction | Alert | - |
| **INVESTIGATED** | Alert | Entity | - |

### Why This Model Works for Fraud

In a relational database, tracing money from Account A to Account D through intermediaries requires recursive CTEs or multiple queries joined manually. In the graph, it is a single traversal:

```cypher
MATCH path = (source:Account {account_id: 'A-7734'})
    -[:SENT]->(:Transaction)-[:RECEIVED]->(hop1:Account)
    -[:SENT]->(:Transaction)-[:RECEIVED]->(hop2:Account)
RETURN path
```

Each hop follows the money through one intermediary. Variable-length paths let you follow the money to any depth:

```cypher
MATCH path = (source:Account {account_id: 'A-7734'})
    (-[:SENT]->(:Transaction)-[:RECEIVED]->(:Account)){1,4}
RETURN path
```

## Stage 2: Data Ingestion

```python
import csv
from datetime import datetime
from neo4j import GraphDatabase


class TransactionGraphBuilder:
    """Build the transaction graph from source data."""

    def __init__(self, neo4j_uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(
            neo4j_uri, auth=(user, password)
        )
        self._create_constraints()

    def _create_constraints(self):
        """Create uniqueness constraints and indexes."""
        with self.driver.session() as session:
            constraints = [
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (a:Account) REQUIRE a.account_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (e:Entity) REQUIRE e.entity_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (t:Transaction) REQUIRE t.tx_id IS UNIQUE",
                "CREATE INDEX IF NOT EXISTS "
                "FOR (t:Transaction) ON (t.timestamp)",
                "CREATE INDEX IF NOT EXISTS "
                "FOR (t:Transaction) ON (t.amount)",
                "CREATE INDEX IF NOT EXISTS "
                "FOR (a:Account) ON (a.status)",
            ]
            for c in constraints:
                session.run(c)

    def load_accounts(self, filepath: str):
        """Load accounts from CSV."""
        with open(filepath) as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (a:Account {account_id: row.account_id})
                SET a.account_type = row.account_type,
                    a.open_date    = date(row.open_date),
                    a.status       = row.status,
                    a.branch       = row.branch
            """, rows=rows)
        print(f"Loaded {len(rows)} accounts")

    def load_entities(self, filepath: str):
        """Load entities (account holders) from CSV."""
        with open(filepath) as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (e:Entity {entity_id: row.entity_id})
                SET e.name        = row.name,
                    e.entity_type = row.entity_type,
                    e.risk_score  = toInteger(row.risk_score)
            """, rows=rows)

            # Link entities to accounts
            session.run("""
                UNWIND $rows AS row
                MATCH (e:Entity {entity_id: row.entity_id})
                MATCH (a:Account {account_id: row.account_id})
                MERGE (e)-[r:HOLDS]->(a)
                SET r.role = row.role
            """, rows=rows)
        print(f"Loaded {len(rows)} entities")

    def load_transactions(self, filepath: str, batch_size: int = 5000):
        """Load transactions from CSV in batches."""
        with open(filepath) as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        with self.driver.session() as session:
            for i in range(0, len(rows), batch_size):
                batch = rows[i:i + batch_size]
                session.run("""
                    UNWIND $batch AS row
                    MERGE (t:Transaction {tx_id: row.tx_id})
                    SET t.amount      = toFloat(row.amount),
                        t.currency    = row.currency,
                        t.timestamp   = datetime(row.timestamp),
                        t.tx_type     = row.tx_type,
                        t.description = row.description
                    WITH t, row
                    MATCH (sender:Account {account_id: row.sender_id})
                    MATCH (receiver:Account {account_id: row.receiver_id})
                    MERGE (sender)-[:SENT]->(t)
                    MERGE (t)-[:RECEIVED]->(receiver)
                """, batch=batch)
                print(f"  Loaded batch {i // batch_size + 1} "
                      f"({min(i + batch_size, len(rows))}/{len(rows)})")

        print(f"Loaded {len(rows)} transactions")

    def load_entity_relationships(self, filepath: str):
        """Load relationships between entities."""
        with open(filepath) as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MATCH (e1:Entity {entity_id: row.entity_id_1})
                MATCH (e2:Entity {entity_id: row.entity_id_2})
                MERGE (e1)-[r:RELATED_TO]->(e2)
                SET r.relationship = row.relationship
            """, rows=rows)
        print(f"Loaded {len(rows)} entity relationships")

    def close(self):
        self.driver.close()
```

## Stage 3: Pattern Detection

Fraud patterns are graph patterns. Each detector is a Cypher query that identifies a specific suspicious structure.

```python
from dataclasses import dataclass


@dataclass
class FraudPattern:
    """A detected fraud pattern."""
    pattern_type: str
    severity: str           # "low", "medium", "high", "critical"
    description: str
    accounts_involved: list[str]
    transactions: list[str]
    total_amount: float
    details: dict


class FraudPatternDetector:
    """Detect common fraud patterns in the transaction graph."""

    def __init__(self, neo4j_driver):
        self.driver = neo4j_driver

    def detect_all(self, account_id: str) -> list[FraudPattern]:
        """Run all pattern detectors against an account."""
        patterns = []
        patterns.extend(self.detect_structuring(account_id))
        patterns.extend(self.detect_rapid_movement(account_id))
        patterns.extend(self.detect_circular_flow(account_id))
        patterns.extend(self.detect_fan_out(account_id))
        patterns.extend(self.detect_shared_entity_network(account_id))
        return patterns

    def detect_structuring(
        self, account_id: str, threshold: float = 10000,
        window_hours: int = 24
    ) -> list[FraudPattern]:
        """Detect structuring: multiple transactions just below
        a reporting threshold within a time window."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (a:Account {account_id: $acct})
                      -[:SENT]->(t:Transaction)
                WHERE t.amount >= $lower AND t.amount < $upper
                WITH t ORDER BY t.timestamp
                WITH collect(t) AS txs
                UNWIND range(0, size(txs)-2) AS i
                WITH txs[i] AS t1, txs[i+1] AS t2
                WHERE duration.between(t1.timestamp, t2.timestamp)
                      .hours < $window
                RETURN t1.tx_id AS tx1, t2.tx_id AS tx2,
                       t1.amount AS amount1, t2.amount AS amount2,
                       t1.timestamp AS time1, t2.timestamp AS time2
            """, acct=account_id, lower=threshold * 0.8,
                 upper=threshold, window=window_hours)

            records = list(result)
            if len(records) >= 2:
                tx_ids = set()
                total = 0
                for r in records:
                    tx_ids.update([r["tx1"], r["tx2"]])
                    total += r["amount1"] + r["amount2"]

                return [FraudPattern(
                    pattern_type="structuring",
                    severity="high",
                    description=(
                        f"Detected {len(tx_ids)} transactions between "
                        f"${threshold * 0.8:,.0f} and ${threshold:,.0f} "
                        f"within {window_hours}h windows"
                    ),
                    accounts_involved=[account_id],
                    transactions=list(tx_ids),
                    total_amount=total / 2,  # Deduplicate pairs
                    details={"threshold": threshold,
                             "window_hours": window_hours}
                )]
        return []

    def detect_rapid_movement(
        self, account_id: str, minutes: int = 30
    ) -> list[FraudPattern]:
        """Detect rapid movement: money in and out within minutes."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (a:Account {account_id: $acct})
                MATCH (a)<-[:RECEIVED]-(t_in:Transaction)
                MATCH (a)-[:SENT]->(t_out:Transaction)
                WHERE t_out.timestamp > t_in.timestamp
                  AND duration.between(t_in.timestamp,
                      t_out.timestamp).minutes < $mins
                  AND t_out.amount >= t_in.amount * 0.8
                RETURN t_in.tx_id AS in_tx, t_out.tx_id AS out_tx,
                       t_in.amount AS in_amount,
                       t_out.amount AS out_amount,
                       duration.between(t_in.timestamp,
                           t_out.timestamp).minutes AS gap_minutes
                ORDER BY gap_minutes
            """, acct=account_id, mins=minutes)

            records = list(result)
            if records:
                return [FraudPattern(
                    pattern_type="rapid_movement",
                    severity="high",
                    description=(
                        f"Money in and out within {minutes} minutes "
                        f"({len(records)} instances)"
                    ),
                    accounts_involved=[account_id],
                    transactions=[r["in_tx"] for r in records]
                                + [r["out_tx"] for r in records],
                    total_amount=sum(r["in_amount"] for r in records),
                    details={"instances": len(records),
                             "fastest_minutes": records[0]["gap_minutes"]}
                )]
        return []

    def detect_circular_flow(
        self, account_id: str, max_hops: int = 5
    ) -> list[FraudPattern]:
        """Detect circular flow: money that comes back to the
        originating account through intermediaries."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH path = (a:Account {account_id: $acct})
                    (-[:SENT]->(:Transaction)-[:RECEIVED]->
                     (:Account)){2,""" + str(max_hops) + """}
                    -[:SENT]->(:Transaction)-[:RECEIVED]->(a)
                WITH path, length(path) AS hops,
                     [n IN nodes(path) WHERE n:Account | n.account_id]
                         AS acct_chain
                RETURN DISTINCT acct_chain, hops
                LIMIT 10
            """, acct=account_id)

            records = list(result)
            if records:
                return [FraudPattern(
                    pattern_type="circular_flow",
                    severity="critical",
                    description=(
                        f"Money returns to origin through "
                        f"{len(records)} circular paths"
                    ),
                    accounts_involved=list(set(
                        a for r in records
                        for a in r["acct_chain"]
                    )),
                    transactions=[],
                    total_amount=0,
                    details={
                        "paths": [r["acct_chain"] for r in records],
                        "hop_counts": [r["hops"] for r in records]
                    }
                )]
        return []

    def detect_fan_out(
        self, account_id: str, min_recipients: int = 5,
        window_hours: int = 24
    ) -> list[FraudPattern]:
        """Detect fan-out: one account sending to many accounts
        in a short window."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (a:Account {account_id: $acct})
                      -[:SENT]->(t:Transaction)
                      -[:RECEIVED]->(r:Account)
                WITH a, t, r
                ORDER BY t.timestamp
                WITH a, collect({tx: t, receiver: r}) AS items
                UNWIND range(0, size(items)-1) AS i
                WITH a, items[i].tx AS anchor,
                     [item IN items
                      WHERE duration.between(
                          items[i].tx.timestamp, item.tx.timestamp
                      ).hours <= $window
                      AND item.tx.timestamp >= items[i].tx.timestamp
                     ] AS window_items
                WHERE size(window_items) >= $min_recip
                WITH a, anchor.timestamp AS window_start,
                     size(window_items) AS recipient_count,
                     [item IN window_items | item.receiver.account_id]
                         AS recipients
                RETURN DISTINCT window_start, recipient_count,
                       recipients
                ORDER BY recipient_count DESC
                LIMIT 5
            """, acct=account_id, min_recip=min_recipients,
                 window=window_hours)

            records = list(result)
            if records:
                top = records[0]
                return [FraudPattern(
                    pattern_type="fan_out",
                    severity="medium",
                    description=(
                        f"Sent to {top['recipient_count']} different "
                        f"accounts within {window_hours} hours"
                    ),
                    accounts_involved=[account_id] + top["recipients"],
                    transactions=[],
                    total_amount=0,
                    details={"recipient_count": top["recipient_count"],
                             "window_start": str(top["window_start"])}
                )]
        return []

    def detect_shared_entity_network(
        self, account_id: str
    ) -> list[FraudPattern]:
        """Detect if transaction counterparties share entities
        (common owners, signatories)."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (a:Account {account_id: $acct})
                      -[:SENT]->(:Transaction)
                      -[:RECEIVED]->(r:Account)
                MATCH (e:Entity)-[:HOLDS]->(r)
                MATCH (e)-[:HOLDS]->(other:Account)
                WHERE other <> r AND other <> a
                MATCH (a2:Account)<-[:RECEIVED]-(:Transaction)
                      <-[:SENT]-(other)
                WHERE a2 = a
                RETURN e.name AS shared_entity,
                       r.account_id AS intermediary,
                       other.account_id AS linked_account,
                       e.entity_type AS entity_type
            """, acct=account_id)

            records = list(result)
            if records:
                entities = list(set(r["shared_entity"] for r in records))
                return [FraudPattern(
                    pattern_type="shared_entity_network",
                    severity="high",
                    description=(
                        f"Transaction counterparties share "
                        f"{len(entities)} entities who also transact "
                        f"back to the source"
                    ),
                    accounts_involved=[account_id] + list(set(
                        r["intermediary"] for r in records
                    )),
                    transactions=[],
                    total_amount=0,
                    details={"shared_entities": entities}
                )]
        return []
```

## Stage 4: The Investigation Agent

The agent uses tool use to interact with the graph. The analyst asks a question, and the agent decides which graph queries to run.

```python
import anthropic
import json
from neo4j import GraphDatabase

client = anthropic.Anthropic()


TOOLS = [
    {
        "name": "trace_money_flow",
        "description": (
            "Trace the flow of money from an account through "
            "multiple hops. Returns the chain of accounts and "
            "transactions the money passed through."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "account_id": {
                    "type": "string",
                    "description": "Source account ID to trace from"
                },
                "max_hops": {
                    "type": "integer",
                    "description": "Maximum hops to trace (1-6)",
                    "default": 3
                },
                "min_amount": {
                    "type": "number",
                    "description": "Minimum transaction amount to follow",
                    "default": 0
                }
            },
            "required": ["account_id"]
        }
    },
    {
        "name": "get_account_profile",
        "description": (
            "Get full profile of an account: owner, transaction "
            "volume, counterparties, and risk indicators."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "account_id": {
                    "type": "string",
                    "description": "Account ID to profile"
                }
            },
            "required": ["account_id"]
        }
    },
    {
        "name": "detect_fraud_patterns",
        "description": (
            "Run all fraud pattern detectors against an account. "
            "Checks for structuring, rapid movement, circular "
            "flows, fan-out, and shared entity networks."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "account_id": {
                    "type": "string",
                    "description": "Account ID to analyze"
                }
            },
            "required": ["account_id"]
        }
    },
    {
        "name": "find_connected_entities",
        "description": (
            "Find all entities (people, businesses) connected to "
            "an account and their other accounts."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "account_id": {
                    "type": "string",
                    "description": "Account ID to investigate"
                }
            },
            "required": ["account_id"]
        }
    },
    {
        "name": "run_cypher",
        "description": (
            "Run a custom Cypher query against the transaction "
            "graph for ad-hoc investigation."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Cypher query to execute"
                }
            },
            "required": ["query"]
        }
    }
]


class FraudInvestigationAgent:
    """Agent that investigates suspicious accounts using graph tools."""

    def __init__(self, neo4j_uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(
            neo4j_uri, auth=(user, password)
        )
        self.detector = FraudPatternDetector(self.driver)

    def investigate(self, question: str) -> str:
        """Run an investigation based on an analyst's question."""
        messages = [{
            "role": "user",
            "content": question
        }]

        system_prompt = """You are a fraud investigation agent with
access to a transaction graph database. Your job is to help analysts
investigate suspicious activity.

INVESTIGATION PROTOCOL:
1. Start by profiling the account in question.
2. Trace money flows to see where funds went.
3. Run fraud pattern detection.
4. Check connected entities for related suspicious activity.
5. Synthesize findings into a clear investigation summary.

Always explain what you found and why it matters. Flag anything
that warrants escalation. Be specific — cite account IDs, amounts,
timestamps, and entity names."""

        # Agentic loop
        while True:
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4096,
                system=system_prompt,
                tools=TOOLS,
                messages=messages
            )

            # If the model is done, return the final text
            if response.stop_reason == "end_turn":
                return "".join(
                    block.text for block in response.content
                    if block.type == "text"
                )

            # Process tool calls
            messages.append({
                "role": "assistant",
                "content": response.content
            })

            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = self._execute_tool(
                        block.name, block.input
                    )
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(
                            result, indent=2, default=str
                        )
                    })

            messages.append({
                "role": "user",
                "content": tool_results
            })

    def _execute_tool(self, tool_name: str, params: dict) -> dict:
        """Execute a tool and return results."""
        if tool_name == "trace_money_flow":
            return self._trace_money_flow(**params)
        elif tool_name == "get_account_profile":
            return self._get_account_profile(**params)
        elif tool_name == "detect_fraud_patterns":
            return self._detect_fraud_patterns(**params)
        elif tool_name == "find_connected_entities":
            return self._find_connected_entities(**params)
        elif tool_name == "run_cypher":
            return self._run_cypher(**params)
        return {"error": f"Unknown tool: {tool_name}"}

    def _trace_money_flow(
        self, account_id: str, max_hops: int = 3,
        min_amount: float = 0
    ) -> dict:
        """Trace money flow from an account."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH path = (source:Account {account_id: $acct})
                    (-[:SENT]->(t:Transaction)-[:RECEIVED]->
                     (a:Account)){1,""" + str(min(max_hops, 6)) + """}
                WHERE ALL(t_node IN [n IN nodes(path) WHERE n:Transaction]
                          WHERE t_node.amount >= $min_amt)
                WITH path,
                     [n IN nodes(path) WHERE n:Account | n.account_id]
                         AS account_chain,
                     [n IN nodes(path) WHERE n:Transaction |
                      {tx_id: n.tx_id, amount: n.amount,
                       timestamp: n.timestamp}] AS transactions
                RETURN account_chain, transactions
                LIMIT 20
            """, acct=account_id, min_amt=min_amount)

            flows = [dict(r) for r in result]
            return {
                "account": account_id,
                "flow_count": len(flows),
                "flows": flows
            }

    def _get_account_profile(self, account_id: str) -> dict:
        """Get full account profile."""
        with self.driver.session() as session:
            # Basic info
            acct = session.run("""
                MATCH (a:Account {account_id: $acct})
                OPTIONAL MATCH (e:Entity)-[h:HOLDS]->(a)
                RETURN a {.*} AS account,
                       collect({name: e.name, type: e.entity_type,
                                role: h.role, risk: e.risk_score})
                           AS holders
            """, acct=account_id).single()

            # Transaction summary
            tx_summary = session.run("""
                MATCH (a:Account {account_id: $acct})
                OPTIONAL MATCH (a)-[:SENT]->(out:Transaction)
                OPTIONAL MATCH (a)<-[:RECEIVED]-(inc:Transaction)
                RETURN count(DISTINCT out) AS outgoing_count,
                       coalesce(sum(out.amount), 0) AS total_sent,
                       count(DISTINCT inc) AS incoming_count,
                       coalesce(sum(inc.amount), 0) AS total_received
            """, acct=account_id).single()

            # Top counterparties
            counterparties = session.run("""
                MATCH (a:Account {account_id: $acct})
                      -[:SENT]->(t:Transaction)
                      -[:RECEIVED]->(r:Account)
                WITH r.account_id AS counterparty,
                     count(t) AS tx_count,
                     sum(t.amount) AS total
                ORDER BY total DESC
                LIMIT 10
                RETURN counterparty, tx_count, total
            """, acct=account_id)

            return {
                "account": dict(acct["account"]) if acct else {},
                "holders": acct["holders"] if acct else [],
                "outgoing_count": tx_summary["outgoing_count"],
                "total_sent": tx_summary["total_sent"],
                "incoming_count": tx_summary["incoming_count"],
                "total_received": tx_summary["total_received"],
                "top_counterparties": [dict(r) for r in counterparties]
            }

    def _detect_fraud_patterns(self, account_id: str) -> dict:
        """Run all fraud pattern detectors."""
        patterns = self.detector.detect_all(account_id)
        return {
            "account": account_id,
            "patterns_found": len(patterns),
            "patterns": [
                {
                    "type": p.pattern_type,
                    "severity": p.severity,
                    "description": p.description,
                    "accounts": p.accounts_involved,
                    "amount": p.total_amount,
                    "details": p.details
                }
                for p in patterns
            ]
        }

    def _find_connected_entities(self, account_id: str) -> dict:
        """Find all entities connected to an account."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (a:Account {account_id: $acct})
                      <-[:HOLDS]-(e:Entity)
                OPTIONAL MATCH (e)-[:HOLDS]->(other:Account)
                WHERE other <> a
                OPTIONAL MATCH (e)-[:RELATED_TO]-(related:Entity)
                OPTIONAL MATCH (related)-[:HOLDS]->(rel_acct:Account)
                RETURN e.name AS entity_name,
                       e.entity_type AS entity_type,
                       e.risk_score AS risk_score,
                       collect(DISTINCT other.account_id)
                           AS other_accounts,
                       collect(DISTINCT {name: related.name,
                           relationship: 'related',
                           accounts: collect(DISTINCT
                               rel_acct.account_id)})
                           AS related_entities
            """, acct=account_id)

            return {
                "account": account_id,
                "entities": [dict(r) for r in result]
            }

    def _run_cypher(self, query: str) -> dict:
        """Execute a custom Cypher query."""
        with self.driver.session() as session:
            result = session.run(query)
            records = [dict(r) for r in result]
            return {
                "result_count": len(records),
                "results": records[:25]
            }

    def close(self):
        self.driver.close()


# ── Run an investigation ─────────────────────────────────────

if __name__ == "__main__":
    agent = FraudInvestigationAgent(
        neo4j_uri="bolt://localhost:7687",
        neo4j_user="neo4j",
        neo4j_password="password"
    )

    report = agent.investigate(
        "Account A-7734 received a large deposit yesterday and "
        "immediately sent smaller amounts to 8 different accounts. "
        "Follow the money and tell me if this looks suspicious."
    )

    print("\n=== INVESTIGATION REPORT ===\n")
    print(report)

    agent.close()
```

## What You Built

| Stage | What It Does | Chapters Referenced |
| --- | --- | --- |
| Graph model | Transaction-optimized schema with accounts, entities, transactions | Chapter 4, 8 |
| Data ingestion | Batch load from CSV with constraints and indexes | Chapter 5 |
| Pattern detection | 5 fraud detectors as Cypher queries | Chapter 12 |
| Investigation agent | Tool-using agent with graph traversal capabilities | Chapter 11 |

### Fraud Patterns Detected

| Pattern | What It Catches | Graph Query Pattern |
| --- | --- | --- |
| **Structuring** | Splitting large amounts into sub-threshold transactions | Filter by amount range + time window |
| **Rapid movement** | Money in and out within minutes (pass-through) | Match incoming + outgoing with time constraint |
| **Circular flow** | Money returning to origin through intermediaries | Variable-length path back to start node |
| **Fan-out** | One account distributing to many in a short window | Count distinct receivers in time window |
| **Shared entity network** | Counterparties secretly controlled by same entity | Entity-to-account traversal with bi-directional flow |

### What to Do Next

1. Add real-time alerting: run pattern detectors on new transactions as they arrive via CDC
2. Add a "similar case" tool that finds historical investigations with similar patterns
3. Build a visualization layer that renders the transaction graph for the analyst
4. Connect to the compliance knowledge graph from Capstone 1 to cross-reference regulatory requirements
