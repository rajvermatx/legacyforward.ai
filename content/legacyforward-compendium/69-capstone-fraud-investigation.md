---
title: "Capstone: Fraud Investigation Agent"
slug: "capstone-fraud-investigation"
description: "Build a graph-aware fraud investigation agent that traverses a transaction network to identify fraud rings, assess connection strength between flagged and known-fraudulent entities, and produce investigation reports for fraud analysts."
section: "legacyforward-compendium"
order: 69
part: "Part VII — Capstones"
---

Part VII — Capstones

# Capstone: Fraud Investigation Agent

Fraud investigation is fundamentally a graph problem. Individual transactions can look legitimate; fraud becomes visible when you see the network — the shared phone numbers, the common device fingerprints, the circular money flows, the clusters of accounts created within days of each other. A fraud investigation agent that can traverse the transaction graph and surface these network patterns augments analyst capability in ways that rule-based alert systems cannot.

## Scenario

A payments company's fraud team receives 200 flagged account alerts per day. Each alert requires investigation — determining whether the flagged account is part of a fraud ring, which other accounts are connected, and what the fraud pattern is. Currently, analysts spend 30–45 minutes on each investigation using manual graph queries. The fraud investigation agent completes initial investigation in under 2 minutes and produces a structured report that analysts use as a starting point rather than a blank canvas.

## Architecture

**Graph schema:**

Nodes:
- Account (id, created_date, status, risk_score)
- Transaction (id, amount, timestamp, type, status)
- Device (fingerprint, type)
- PhoneNumber (number, carrier)
- IPAddress (address, country)
- KnownFraudRing (id, fraud_type, confirmed_date)

Edges:
- (Account)-[:SENT]->(Transaction)
- (Transaction)-[:RECEIVED_BY]->(Account)
- (Account)-[:USES]->(Device)
- (Account)-[:REGISTERED_WITH]->(PhoneNumber)
- (Account)-[:ACCESSED_FROM]->(IPAddress)
- (Account)-[:MEMBER_OF]->(KnownFraudRing)

**Agent tools:**
- `get_account_details(account_id)` — retrieve account properties and risk signals
- `get_account_connections(account_id, connection_types, depth)` — traverse account connections
- `find_shared_identifiers(account_id)` — find accounts sharing device, phone, or IP
- `get_transaction_pattern(account_id, days)` — analyze transaction timing and amounts
- `check_fraud_ring_proximity(account_id, max_hops)` — find nearest known fraud ring nodes
- `generate_investigation_report(findings)` — produce structured investigation report

## Implementation

**Agent system prompt:**
```
You are a fraud investigation agent. When given an account ID to investigate, you must:
1. Retrieve account details and assess initial risk signals
2. Find accounts that share identifiers (device, phone number, IP address) with the target account
3. Analyze transaction patterns for fraud indicators (rapid account creation, circular flows, structuring)
4. Check proximity to known fraud rings (find paths of length ≤ 4 to KnownFraudRing nodes)
5. Synthesize findings into a risk assessment

Risk levels:
- HIGH: direct connection to known fraud ring, or 3+ shared identifiers with flagged accounts
- MEDIUM: 2nd-degree connection to known fraud ring, or 2 shared identifiers
- LOW: no connections to fraud rings, isolated anomalies that may be legitimate

Always provide evidence for your risk assessment.
```

**Fraud ring proximity query (Cypher):**
```cypher
MATCH path = (a:Account {id: $account_id})-[*1..4]-(ring:KnownFraudRing)
RETURN path, length(path) as distance
ORDER BY distance
LIMIT 10
```

**Investigation report structure:**
```
FRAUD INVESTIGATION REPORT
Account: {account_id} | Investigation timestamp: {timestamp}
Risk Assessment: HIGH / MEDIUM / LOW (confidence: %)

ACCOUNT SUMMARY:
- Created: {date} | Status: {status}
- Transaction volume (30d): {count} transactions, {amount}
- Risk signals: {list}

NETWORK CONNECTIONS:
- Shared identifiers: {count} other accounts share {identifier_types}
  → [Account X]: shares device fingerprint ABC123 (created {date}, risk score: {score})
- Fraud ring proximity: {nearest ring} at {distance} hops
  → Path: Account → [SHARES_DEVICE] → Account Y → [MEMBER_OF] → FraudRing Z

TRANSACTION PATTERNS:
- {pattern description}

ANALYST RECOMMENDATIONS:
- {recommended next steps}
- Similar confirmed cases: {case_ids}
```

## Key Learning Points

**Graph proximity is the key signal.** The distance (in hops) between a flagged account and a known fraud ring node is the most reliable fraud signal in the graph. Accounts 1 hop away are almost certainly fraudulent; accounts 2 hops away warrant investigation; accounts 3–4 hops may be innocent victims. Calibrate the thresholds against historical confirmed fraud cases.

**Shared identifiers form the fraud network edges.** The edges that connect fraud ring members are shared devices, phone numbers, and IP addresses — not direct financial transactions, which fraudsters deliberately obscure. The agent's `find_shared_identifiers` tool is often the most revealing step in the investigation.

**The agent adds narrative, not just data.** Fraud analysts can run the same Cypher queries themselves. The agent's value is in synthesizing the query results into a coherent narrative — "This account shares a device with 3 accounts flagged last week that are members of Fraud Ring FRG-0042, which operates a money mule scheme" — that accelerates the analyst's decision-making.

**False positive management is a product decision.** The risk thresholds that determine HIGH/MEDIUM/LOW ratings should be calibrated to the fraud team's capacity: if the team can investigate 100 HIGH cases per day, set the threshold so approximately 100 cases are rated HIGH. Overly sensitive thresholds that rate 500 cases HIGH per day produce alert fatigue.
