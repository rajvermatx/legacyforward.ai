---
title: "Capstone 4: Customer 360 with GraphRAG"
slug: "capstone-customer-360-graphrag"
description: >-
  Build a unified customer view combining CRM, support tickets, and
  product data into a knowledge graph. Covers data modeling for
  multi-source customer data, ingestion from three systems, graph-based
  customer journey queries, and a GraphRAG layer that answers "Tell me
  everything about this customer's journey."
section: "graph-ai"
order: 19
part: "Part 06 Capstones"
badges:
  - "Customer 360"
  - "Data Integration"
  - "GraphRAG"
---

# Capstone 4: Customer 360 with GraphRAG

A support agent picks up a call. The customer is frustrated. They bought a product 6 months ago, opened 3 support tickets, got a partial refund, and now the same issue is back. The support agent has to check the CRM, the ticketing system, and the order system — three different screens, three different search boxes — to piece together what happened.

This capstone builds a unified customer graph that connects purchases, support interactions, product issues, and account history into a single queryable structure, then wraps it with a GraphRAG layer so a support agent can ask "Tell me everything about this customer's journey" and get a complete, contextualized answer.

## The Scenario


![Diagram 1](/diagrams/graph-ai/capstone-04.svg)
The company has three source systems:

1. **CRM (Salesforce export):** Customer accounts, contacts, opportunities, activities
2. **Support (Zendesk export):** Tickets, comments, satisfaction scores, resolution times
3. **Product/Orders (internal DB):** Orders, line items, products, returns, refunds

Each system has its own customer ID. The CRM uses `account_id`, support uses `requester_email`, and the order system uses `customer_number`. A customer might be `ACC-4421` in Salesforce, `jane.doe@acme.com` in Zendesk, and `CUST-88912` in the order system.

The goal: unify these identities, build a customer graph, and provide natural language access to the full customer journey.

### What We Are Building

```
CRM Data ──────────┐
                    │
Support Tickets ────┼──> Unified Customer Graph ──> GraphRAG Agent
                    │
Order/Product Data ─┘
```

## Stage 1: The Customer 360 Graph Model

### Schema

| Node Type | Properties | Source |
| --- | --- | --- |
| **Customer** | customer_id, name, email, phone, company, segment, lifetime_value | Unified (all sources) |
| **Account** | account_id, account_name, industry, plan_tier, arr, status | CRM |
| **Contact** | contact_id, name, email, title, role | CRM |
| **Opportunity** | opp_id, name, stage, amount, close_date, probability | CRM |
| **Activity** | activity_id, type (call/email/meeting), date, subject, notes | CRM |
| **Ticket** | ticket_id, subject, status, priority, channel, created, resolved | Support |
| **TicketComment** | comment_id, body, author, created, is_public | Support |
| **Order** | order_id, order_date, total, status, payment_method | Orders |
| **LineItem** | item_id, quantity, unit_price, discount | Orders |
| **Product** | product_id, name, category, version, status | Products |
| **ProductIssue** | issue_id, title, severity, status, affected_versions | Products |
| **Return** | return_id, reason, refund_amount, status, date | Orders |

### Relationship Types

| Relationship | From | To | Properties |
| --- | --- | --- | --- |
| **HAS_ACCOUNT** | Customer | Account | source |
| **HAS_CONTACT** | Account | Contact | is_primary |
| **HAS_OPPORTUNITY** | Account | Opportunity | - |
| **HAD_ACTIVITY** | Contact | Activity | - |
| **OPENED** | Customer | Ticket | - |
| **HAS_COMMENT** | Ticket | TicketComment | - |
| **ABOUT_PRODUCT** | Ticket | Product | - |
| **PLACED** | Customer | Order | - |
| **CONTAINS** | Order | LineItem | - |
| **FOR_PRODUCT** | LineItem | Product | - |
| **RETURNED** | Customer | Return | - |
| **RETURN_OF** | Return | LineItem | - |
| **AFFECTED_BY** | Product | ProductIssue | - |
| **RELATED_TICKET** | Ticket | Ticket | relationship (duplicate/follow_up) |
| **ESCALATED_TO** | Ticket | Contact | escalation_reason |

### Why a Graph Beats a Data Warehouse Here

A data warehouse can certainly hold all this data. But answering "Show me the customer's full journey" in a star schema requires joining the customer dimension to the order fact table, then to the ticket fact table, then to the product dimension, then to the issue table. Each join is a separate query or a complex union. The graph makes it a single traversal from the customer node outward through every connected relationship.

More importantly, the graph captures connections that a warehouse misses:

- "This ticket is about the same product that failed for 15 other customers" (ticket-to-product-to-issue-to-other-tickets)
- "This customer's support contact is also the decision-maker on a pending renewal" (ticket-to-contact-to-opportunity)
- "The product issue causing this ticket was fixed in version 3.2, but this customer is still on 3.1" (issue-to-product-version-to-order-to-lineitem)

## Stage 2: Data Ingestion from Three Sources

```python
import csv
import json
from datetime import datetime
from neo4j import GraphDatabase


class Customer360Builder:
    """Build the unified customer 360 graph from multiple sources."""

    def __init__(self, neo4j_uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(
            neo4j_uri, auth=(user, password)
        )
        self._create_constraints()

    def _create_constraints(self):
        """Set up constraints and indexes."""
        with self.driver.session() as session:
            constraints = [
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (c:Customer) REQUIRE c.customer_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (a:Account) REQUIRE a.account_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (ct:Contact) REQUIRE ct.contact_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (t:Ticket) REQUIRE t.ticket_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (o:Order) REQUIRE o.order_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (p:Product) REQUIRE p.product_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (pi:ProductIssue) REQUIRE pi.issue_id IS UNIQUE",
                "CREATE INDEX IF NOT EXISTS "
                "FOR (c:Customer) ON (c.email)",
                "CREATE INDEX IF NOT EXISTS "
                "FOR (c:Customer) ON (c.name)",
                "CREATE INDEX IF NOT EXISTS "
                "FOR (t:Ticket) ON (t.status)",
                "CREATE INDEX IF NOT EXISTS "
                "FOR (o:Order) ON (o.order_date)",
            ]
            for c in constraints:
                session.run(c)

    # ── Source 1: CRM Data ───────────────────────────────────

    def load_crm_accounts(self, filepath: str):
        """Load CRM account data."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (a:Account {account_id: row.account_id})
                SET a.account_name = row.account_name,
                    a.industry     = row.industry,
                    a.plan_tier    = row.plan_tier,
                    a.arr          = toFloat(row.arr),
                    a.status       = row.status,
                    a.source       = 'crm'
            """, rows=rows)
        print(f"CRM: Loaded {len(rows)} accounts")

    def load_crm_contacts(self, filepath: str):
        """Load CRM contacts and link to accounts."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (ct:Contact {contact_id: row.contact_id})
                SET ct.name  = row.name,
                    ct.email = row.email,
                    ct.title = row.title,
                    ct.role  = row.role
                WITH ct, row
                MATCH (a:Account {account_id: row.account_id})
                MERGE (a)-[r:HAS_CONTACT]->(ct)
                SET r.is_primary = (row.is_primary = 'true')
            """, rows=rows)
        print(f"CRM: Loaded {len(rows)} contacts")

    def load_crm_opportunities(self, filepath: str):
        """Load CRM opportunities."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (o:Opportunity {opp_id: row.opp_id})
                SET o.name        = row.name,
                    o.stage       = row.stage,
                    o.amount      = toFloat(row.amount),
                    o.close_date  = date(row.close_date),
                    o.probability = toInteger(row.probability)
                WITH o, row
                MATCH (a:Account {account_id: row.account_id})
                MERGE (a)-[:HAS_OPPORTUNITY]->(o)
            """, rows=rows)
        print(f"CRM: Loaded {len(rows)} opportunities")

    def load_crm_activities(self, filepath: str):
        """Load CRM activities (calls, emails, meetings)."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (act:Activity {activity_id: row.activity_id})
                SET act.type    = row.type,
                    act.date    = datetime(row.date),
                    act.subject = row.subject,
                    act.notes   = row.notes
                WITH act, row
                MATCH (ct:Contact {contact_id: row.contact_id})
                MERGE (ct)-[:HAD_ACTIVITY]->(act)
            """, rows=rows)
        print(f"CRM: Loaded {len(rows)} activities")

    # ── Source 2: Support Tickets ────────────────────────────

    def load_tickets(self, filepath: str):
        """Load support tickets."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (t:Ticket {ticket_id: row.ticket_id})
                SET t.subject    = row.subject,
                    t.status     = row.status,
                    t.priority   = row.priority,
                    t.channel    = row.channel,
                    t.created    = datetime(row.created),
                    t.resolved   = CASE WHEN row.resolved <> ''
                                   THEN datetime(row.resolved)
                                   ELSE null END,
                    t.csat_score = CASE WHEN row.csat_score <> ''
                                   THEN toInteger(row.csat_score)
                                   ELSE null END
            """, rows=rows)
        print(f"Support: Loaded {len(rows)} tickets")

    def load_ticket_comments(self, filepath: str):
        """Load ticket comments."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (c:TicketComment {comment_id: row.comment_id})
                SET c.body      = row.body,
                    c.author    = row.author,
                    c.created   = datetime(row.created),
                    c.is_public = (row.is_public = 'true')
                WITH c, row
                MATCH (t:Ticket {ticket_id: row.ticket_id})
                MERGE (t)-[:HAS_COMMENT]->(c)
            """, rows=rows)
        print(f"Support: Loaded {len(rows)} comments")

    # ── Source 3: Orders and Products ────────────────────────

    def load_products(self, filepath: str):
        """Load product catalog."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (p:Product {product_id: row.product_id})
                SET p.name     = row.name,
                    p.category = row.category,
                    p.version  = row.version,
                    p.status   = row.status
            """, rows=rows)
        print(f"Products: Loaded {len(rows)} products")

    def load_product_issues(self, filepath: str):
        """Load known product issues."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (pi:ProductIssue {issue_id: row.issue_id})
                SET pi.title             = row.title,
                    pi.severity          = row.severity,
                    pi.status            = row.status,
                    pi.affected_versions = row.affected_versions
                WITH pi, row
                MATCH (p:Product {product_id: row.product_id})
                MERGE (p)-[:AFFECTED_BY]->(pi)
            """, rows=rows)
        print(f"Products: Loaded {len(rows)} known issues")

    def load_orders(self, filepath: str):
        """Load orders with line items."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (o:Order {order_id: row.order_id})
                SET o.order_date      = date(row.order_date),
                    o.total           = toFloat(row.total),
                    o.status          = row.status,
                    o.payment_method  = row.payment_method
            """, rows=rows)
        print(f"Orders: Loaded {len(rows)} orders")

    def load_line_items(self, filepath: str):
        """Load order line items and link to orders and products."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (li:LineItem {item_id: row.item_id})
                SET li.quantity   = toInteger(row.quantity),
                    li.unit_price = toFloat(row.unit_price),
                    li.discount   = toFloat(row.discount)
                WITH li, row
                MATCH (o:Order {order_id: row.order_id})
                MERGE (o)-[:CONTAINS]->(li)
                WITH li, row
                MATCH (p:Product {product_id: row.product_id})
                MERGE (li)-[:FOR_PRODUCT]->(p)
            """, rows=rows)
        print(f"Orders: Loaded {len(rows)} line items")

    def load_returns(self, filepath: str):
        """Load returns and refunds."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (r:Return {return_id: row.return_id})
                SET r.reason        = row.reason,
                    r.refund_amount = toFloat(row.refund_amount),
                    r.status        = row.status,
                    r.date          = date(row.date)
                WITH r, row
                MATCH (li:LineItem {item_id: row.item_id})
                MERGE (r)-[:RETURN_OF]->(li)
            """, rows=rows)
        print(f"Orders: Loaded {len(rows)} returns")

    def close(self):
        self.driver.close()
```

## Stage 3: Identity Resolution

The hardest part of Customer 360 is identity resolution — stitching together the same customer across three systems that each use different identifiers.

```python
class IdentityResolver:
    """Resolve customer identities across CRM, support, and orders."""

    def __init__(self, neo4j_driver):
        self.driver = neo4j_driver

    def resolve_by_email(self):
        """Match customers across systems using email address.

        The email is the strongest cross-system identifier:
        - CRM contacts have email
        - Support tickets have requester_email
        - Orders have customer_email

        This creates unified Customer nodes linking all three.
        """
        with self.driver.session() as session:
            # Step 1: Create Customer nodes from CRM contacts
            session.run("""
                MATCH (a:Account)-[:HAS_CONTACT]->(ct:Contact)
                WHERE ct.email IS NOT NULL
                MERGE (c:Customer {email: ct.email})
                SET c.name        = ct.name,
                    c.customer_id = 'CUST-' + toString(id(c))
                MERGE (c)-[:HAS_ACCOUNT]->(a)
            """)
            print("Resolved: CRM contacts -> Customer nodes")

            # Step 2: Link support tickets to Customer nodes
            result = session.run("""
                MATCH (t:Ticket)
                WHERE t.requester_email IS NOT NULL
                MATCH (c:Customer {email: t.requester_email})
                MERGE (c)-[:OPENED]->(t)
                RETURN count(t) AS linked
            """)
            print(f"Resolved: {result.single()['linked']} tickets "
                  f"linked to customers")

            # Step 3: Link orders to Customer nodes
            result = session.run("""
                MATCH (o:Order)
                WHERE o.customer_email IS NOT NULL
                MATCH (c:Customer {email: o.customer_email})
                MERGE (c)-[:PLACED]->(o)
                RETURN count(o) AS linked
            """)
            print(f"Resolved: {result.single()['linked']} orders "
                  f"linked to customers")

            # Step 4: Link tickets to products (via order history)
            result = session.run("""
                MATCH (c:Customer)-[:OPENED]->(t:Ticket)
                WHERE t.product_name IS NOT NULL
                MATCH (p:Product)
                WHERE toLower(p.name) = toLower(t.product_name)
                MERGE (t)-[:ABOUT_PRODUCT]->(p)
                RETURN count(t) AS linked
            """)
            print(f"Resolved: {result.single()['linked']} tickets "
                  f"linked to products")

    def resolve_by_company_name(self):
        """Fuzzy match on company name for records missing email."""
        with self.driver.session() as session:
            # Find orders with company name but no email match
            result = session.run("""
                MATCH (o:Order)
                WHERE o.customer_email IS NULL
                  AND o.company_name IS NOT NULL
                  AND NOT (:Customer)-[:PLACED]->(o)
                MATCH (a:Account)
                WHERE toLower(a.account_name) =
                      toLower(o.company_name)
                MATCH (c:Customer)-[:HAS_ACCOUNT]->(a)
                MERGE (c)-[:PLACED]->(o)
                RETURN count(o) AS linked
            """)
            print(f"Fuzzy resolved: {result.single()['linked']} "
                  f"orders by company name")

    def calculate_lifetime_value(self):
        """Calculate customer lifetime value from order history."""
        with self.driver.session() as session:
            session.run("""
                MATCH (c:Customer)-[:PLACED]->(o:Order)
                WITH c, sum(o.total) AS total_spent,
                     count(o) AS order_count,
                     max(o.order_date) AS last_order
                SET c.lifetime_value = total_spent,
                    c.order_count    = order_count,
                    c.last_order     = last_order
            """)

    def enrich_customer_segment(self):
        """Segment customers based on behavior."""
        with self.driver.session() as session:
            session.run("""
                MATCH (c:Customer)
                OPTIONAL MATCH (c)-[:PLACED]->(o:Order)
                OPTIONAL MATCH (c)-[:OPENED]->(t:Ticket)
                WITH c,
                     coalesce(c.lifetime_value, 0) AS ltv,
                     count(DISTINCT o) AS orders,
                     count(DISTINCT t) AS tickets
                SET c.segment = CASE
                    WHEN ltv > 50000 AND tickets < 3
                        THEN 'champion'
                    WHEN ltv > 50000 AND tickets >= 3
                        THEN 'high_value_at_risk'
                    WHEN ltv > 10000
                        THEN 'growth'
                    WHEN orders = 0
                        THEN 'prospect'
                    ELSE 'standard'
                END
            """)
            print("Enriched: Customer segments calculated")
```

## Stage 4: Customer Journey Queries

These are the queries that make Customer 360 valuable. Each one answers a question that previously required checking multiple systems.

```python
class CustomerJourneyQueries:
    """Pre-built queries for common customer journey questions."""

    def __init__(self, neo4j_driver):
        self.driver = neo4j_driver

    def full_journey(self, customer_email: str) -> dict:
        """Get the complete customer journey."""
        with self.driver.session() as session:
            # Customer profile
            profile = session.run("""
                MATCH (c:Customer {email: $email})
                OPTIONAL MATCH (c)-[:HAS_ACCOUNT]->(a:Account)
                RETURN c {.*} AS customer,
                       collect(a {.*}) AS accounts
            """, email=customer_email).single()

            # Order history
            orders = session.run("""
                MATCH (c:Customer {email: $email})-[:PLACED]->(o:Order)
                OPTIONAL MATCH (o)-[:CONTAINS]->(li:LineItem)
                    -[:FOR_PRODUCT]->(p:Product)
                OPTIONAL MATCH (r:Return)-[:RETURN_OF]->(li)
                WITH o, collect({product: p.name,
                     quantity: li.quantity,
                     price: li.unit_price,
                     returned: r IS NOT NULL}) AS items
                RETURN o {.*} AS order, items
                ORDER BY o.order_date DESC
            """, email=customer_email)
            order_list = [dict(r) for r in orders]

            # Support history
            tickets = session.run("""
                MATCH (c:Customer {email: $email})-[:OPENED]->(t:Ticket)
                OPTIONAL MATCH (t)-[:ABOUT_PRODUCT]->(p:Product)
                OPTIONAL MATCH (t)-[:HAS_COMMENT]->(comment:TicketComment)
                WITH t, p, collect(comment {.body, .author, .created})
                    AS comments
                RETURN t {.*} AS ticket,
                       p.name AS product,
                       comments
                ORDER BY t.created DESC
            """, email=customer_email)
            ticket_list = [dict(r) for r in tickets]

            # Interaction timeline
            timeline = session.run("""
                MATCH (c:Customer {email: $email})
                OPTIONAL MATCH (c)-[:HAS_ACCOUNT]->(:Account)
                    -[:HAS_CONTACT]->(ct:Contact)
                    -[:HAD_ACTIVITY]->(act:Activity)
                WITH c, collect(act {.*, event_type: 'activity'})
                    AS activities
                OPTIONAL MATCH (c)-[:PLACED]->(o:Order)
                WITH c, activities,
                     collect({event_type: 'order',
                              date: o.order_date,
                              total: o.total,
                              order_id: o.order_id}) AS order_events
                OPTIONAL MATCH (c)-[:OPENED]->(t:Ticket)
                WITH activities, order_events,
                     collect({event_type: 'ticket',
                              date: t.created,
                              subject: t.subject,
                              status: t.status,
                              ticket_id: t.ticket_id}) AS ticket_events
                RETURN activities + order_events + ticket_events
                    AS timeline
            """, email=customer_email)
            timeline_data = timeline.single()

            return {
                "profile": dict(profile["customer"]) if profile else {},
                "accounts": profile["accounts"] if profile else [],
                "orders": order_list,
                "tickets": ticket_list,
                "timeline": timeline_data["timeline"] if timeline_data
                           else []
            }

    def find_at_risk_customers(self) -> list[dict]:
        """Find high-value customers with recent negative experiences."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (c:Customer)
                WHERE c.lifetime_value > 10000
                MATCH (c)-[:OPENED]->(t:Ticket)
                WHERE t.created > datetime() - duration('P90D')
                  AND t.priority IN ['high', 'urgent']
                WITH c, count(t) AS recent_urgent_tickets,
                     collect(t.subject) AS ticket_subjects
                WHERE recent_urgent_tickets >= 2
                OPTIONAL MATCH (c)-[:HAS_ACCOUNT]->(a:Account)
                    -[:HAS_OPPORTUNITY]->(opp:Opportunity)
                WHERE opp.stage IN ['Renewal', 'Negotiation']
                RETURN c.name AS customer,
                       c.email AS email,
                       c.lifetime_value AS ltv,
                       c.segment AS segment,
                       recent_urgent_tickets,
                       ticket_subjects,
                       collect(opp {.name, .amount, .stage})
                           AS pending_opportunities
                ORDER BY c.lifetime_value DESC
            """)
            return [dict(r) for r in result]

    def product_issue_impact(self, issue_id: str) -> dict:
        """Find all customers affected by a product issue."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (pi:ProductIssue {issue_id: $issue_id})
                    <-[:AFFECTED_BY]-(p:Product)
                OPTIONAL MATCH (li:LineItem)-[:FOR_PRODUCT]->(p)
                    <-[:CONTAINS]-(o:Order)<-[:PLACED]-(c:Customer)
                OPTIONAL MATCH (t:Ticket)-[:ABOUT_PRODUCT]->(p)
                    <-[:OPENED]-(c2:Customer)
                WITH pi, p,
                     collect(DISTINCT {customer: c.name,
                         email: c.email, ltv: c.lifetime_value})
                         AS affected_by_purchase,
                     collect(DISTINCT {customer: c2.name,
                         email: c2.email,
                         ticket: t.subject})
                         AS affected_with_tickets
                RETURN pi {.*} AS issue,
                       p.name AS product,
                       size(affected_by_purchase) AS customers_with_product,
                       size(affected_with_tickets) AS customers_with_tickets,
                       affected_by_purchase,
                       affected_with_tickets
            """, issue_id=issue_id)
            return dict(result.single()) if result.peek() else {}
```

## Stage 5: The GraphRAG Agent

```python
import anthropic
import json
from neo4j import GraphDatabase

client = anthropic.Anthropic()


TOOLS = [
    {
        "name": "customer_journey",
        "description": (
            "Get the complete journey for a customer: profile, "
            "orders, support tickets, and interaction timeline."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_email": {
                    "type": "string",
                    "description": "Customer email address"
                }
            },
            "required": ["customer_email"]
        }
    },
    {
        "name": "search_customer",
        "description": (
            "Search for a customer by name, email, company, or "
            "account ID. Use when you don't have the exact email."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search term (name, email, or company)"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "at_risk_customers",
        "description": (
            "Find high-value customers with recent negative "
            "experiences who may be at risk of churning."
        ),
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "product_issue_impact",
        "description": (
            "Find all customers affected by a specific product "
            "issue, including those who purchased the product "
            "and those who opened support tickets."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "issue_id": {
                    "type": "string",
                    "description": "Product issue ID"
                }
            },
            "required": ["issue_id"]
        }
    },
    {
        "name": "run_cypher",
        "description": (
            "Run a custom Cypher query against the customer 360 "
            "graph for ad-hoc analysis."
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


class Customer360Agent:
    """GraphRAG agent for customer 360 queries."""

    def __init__(self, neo4j_uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(
            neo4j_uri, auth=(user, password)
        )
        self.journey = CustomerJourneyQueries(self.driver)

    def ask(self, question: str) -> str:
        """Answer a customer question using the 360 graph."""
        messages = [{"role": "user", "content": question}]

        system_prompt = """You are a customer success agent with access
to a unified customer 360 knowledge graph. This graph combines data
from CRM, support tickets, and order history.

When answering questions:
1. Start by looking up the customer to get their full journey.
2. Summarize the key facts: what they bought, what issues they had,
   their current status.
3. Highlight anything concerning: open tickets, recent returns,
   declining satisfaction.
4. If there is a pending renewal or opportunity, mention it.
5. Be empathetic and actionable — suggest next steps the support
   agent should take.

GRAPH SCHEMA:
- Customer -> HAS_ACCOUNT -> Account
- Account -> HAS_CONTACT -> Contact
- Account -> HAS_OPPORTUNITY -> Opportunity
- Contact -> HAD_ACTIVITY -> Activity
- Customer -> OPENED -> Ticket
- Ticket -> HAS_COMMENT -> TicketComment
- Ticket -> ABOUT_PRODUCT -> Product
- Customer -> PLACED -> Order -> CONTAINS -> LineItem -> FOR_PRODUCT -> Product
- Customer -> RETURNED -> Return -> RETURN_OF -> LineItem
- Product -> AFFECTED_BY -> ProductIssue"""

        while True:
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4096,
                system=system_prompt,
                tools=TOOLS,
                messages=messages
            )

            if response.stop_reason == "end_turn":
                return "".join(
                    b.text for b in response.content
                    if b.type == "text"
                )

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

            messages.append({"role": "user", "content": tool_results})

    def _execute_tool(self, name: str, params: dict) -> dict:
        """Route tool calls."""
        if name == "customer_journey":
            return self.journey.full_journey(**params)
        elif name == "search_customer":
            return self._search_customer(**params)
        elif name == "at_risk_customers":
            return self.journey.find_at_risk_customers()
        elif name == "product_issue_impact":
            return self.journey.product_issue_impact(**params)
        elif name == "run_cypher":
            return self._run_cypher(**params)
        return {"error": f"Unknown tool: {name}"}

    def _search_customer(self, query: str) -> dict:
        """Search for a customer by name, email, or company."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (c:Customer)
                WHERE toLower(c.name) CONTAINS toLower($q)
                   OR toLower(c.email) CONTAINS toLower($q)
                OPTIONAL MATCH (c)-[:HAS_ACCOUNT]->(a:Account)
                RETURN c.customer_id AS id,
                       c.name AS name,
                       c.email AS email,
                       c.segment AS segment,
                       c.lifetime_value AS ltv,
                       collect(a.account_name) AS accounts
                LIMIT 10
            """, q=query)

            matches = [dict(r) for r in result]
            if not matches:
                # Try searching by account name
                result = session.run("""
                    MATCH (a:Account)
                    WHERE toLower(a.account_name) CONTAINS toLower($q)
                    MATCH (c:Customer)-[:HAS_ACCOUNT]->(a)
                    RETURN c.customer_id AS id,
                           c.name AS name,
                           c.email AS email,
                           c.segment AS segment,
                           c.lifetime_value AS ltv,
                           collect(a.account_name) AS accounts
                    LIMIT 10
                """, q=query)
                matches = [dict(r) for r in result]

            return {
                "query": query,
                "match_count": len(matches),
                "matches": matches
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


# ── Run the agent ────────────────────────────────────────────

if __name__ == "__main__":
    agent = Customer360Agent(
        neo4j_uri="bolt://localhost:7687",
        neo4j_user="neo4j",
        neo4j_password="password"
    )

    questions = [
        "Tell me everything about Jane Doe's journey with us.",
        "Which high-value customers are at risk of churning?",
        "How many customers are affected by product issue BUG-2024-019?",
        "I have a customer named 'Acme Corp' on the phone. "
        "What do I need to know before talking to them?",
    ]

    for q in questions:
        print(f"\n{'='*60}")
        print(f"Q: {q}")
        print(f"{'='*60}")
        answer = agent.ask(q)
        print(answer)

    agent.close()
```

## What You Built

| Stage | What It Does | Chapters Referenced |
| --- | --- | --- |
| Graph model | Multi-source customer schema with 12 entity types | Chapter 4, 8 |
| Data ingestion | Batch load from 3 source systems | Chapter 5 |
| Identity resolution | Cross-system customer matching by email and company | Chapter 9 |
| Journey queries | Pre-built traversals for common customer questions | Chapter 6, 12 |
| GraphRAG agent | Natural language access to customer 360 data | Chapter 10, 11 |

### The Graph Advantage Over a Flat CRM View

| Question | Flat CRM | Customer 360 Graph |
| --- | --- | --- |
| "What did this customer buy?" | Check order system separately | One traversal: Customer -> Order -> LineItem -> Product |
| "Did they have support issues?" | Check ticketing system separately | One traversal: Customer -> Ticket -> Product |
| "Is the product they bought affected by a known issue?" | No connection between systems | Ticket -> Product -> ProductIssue (automatic) |
| "Who else is affected by this issue?" | Manual investigation | ProductIssue -> Product -> LineItem -> Order -> Customer |
| "Are they a renewal risk?" | Gut feeling | Graph segment: high LTV + recent urgent tickets + pending opp |

### What to Do Next

1. Add real-time sync via CDC (Chapter 13) so the graph updates as CRM records change and tickets are opened
2. Build a proactive alerting system that flags at-risk customers daily
3. Add product version tracking to automatically identify customers running affected versions
4. Connect to the compliance knowledge graph from Capstone 1 for regulated customer communications
5. Build a dashboard that visualizes the customer graph for account managers
