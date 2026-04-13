---
title: "Ontology Design Without a PhD"
slug: "ontology-design"
description: >-
  How to design a practical ontology for your knowledge graph without
  academic overhead. Covers iterative design starting with five node
  types and five relationship types, common ontology patterns by
  industry, using LLMs to suggest structure, schema validation, and
  anti-patterns to avoid.
section: "graph-ai"
order: 8
part: "Part 03 Building Knowledge Graphs"
badges:
  - "Ontology Design"
  - "Iterative Modeling"
  - "Domain Patterns"
---

# Ontology Design Without a PhD

The consultants quoted $500K for an ontology. This chapter shows how to build one yourself in a week, without academic overhead.

## 01. What an Ontology Actually Is


![Diagram 1](/diagrams/graph-ai/ch08-01.svg)

![Diagram 2](/diagrams/graph-ai/ch08-02.svg)
Strip away the academic language. An ontology is a data model for a knowledge graph. It defines:

- **What types of nodes exist** (Person, Organization, Document, Regulation)
- **What types of relationships exist** (WORKS_AT, MANAGES, REFERENCES)
- **What properties each type has** (Person has name, title, email; WORKS_AT has start_date, department)
- **What constraints apply** (a Person can WORKS_AT an Organization but not at a Document)

If you have ever designed a relational database schema, you have designed something close to an ontology. The difference is that an ontology also encodes domain meaning. It says not just "these two tables are linked" but "a Person works at an Organization, and that relationship has specific meaning."

> **Think of it like this:** A relational schema is a floor plan — it shows where the walls and doors are. An ontology is a floor plan plus a user guide — it shows where the walls and doors are, explains what each room is for, and tells you which rooms are connected by hallways versus which ones you should not walk between.

The reason ontology projects get expensive is that consultants treat them as philosophical exercises. They interview 40 stakeholders, model every conceivable entity type, and debate whether a "Policy" is a subclass of "Document" or a separate concept. They deliver a 200-page specification that nobody can implement.

You do not need that. You need a working ontology that covers your most important entities and relationships, validates against real data, and evolves as you learn more.

## 02. The Five-by-Five Starter

Start with exactly five node types and five relationship types. Not three, not fifty. Five and five.

Why five? It is enough to model meaningful connections without drowning in complexity. It forces you to decide what matters most. It is small enough to validate in a day.

### How to Pick Your Five Node Types

Look at your source documents and ask: "What are the nouns that appear in every important question our users ask?" If your users ask "Which vendor supplies the component that failed inspection?" your nouns are Vendor, Component, and Inspection. If they also ask "Who approved that vendor?" add Person and Approval.

### How to Pick Your Five Relationship Types

Look at the verbs. "Which vendor **supplies** the component that **failed** inspection?" gives you SUPPLIES and FAILED. "Who **approved** that vendor?" gives you APPROVED. Verbs become relationship types.

### Example: Procurement Domain

```
Node Types:
  1. Organization  — vendors, suppliers, internal departments
  2. Person        — approvers, managers, contacts
  3. Component     — parts, materials, assemblies
  4. Document      — contracts, policies, inspection reports
  5. Regulation    — standards, compliance requirements

Relationship Types:
  1. SUPPLIES      — Organization → Component
  2. APPROVED_BY   — Document → Person
  3. COMPLIES_WITH — Component → Regulation
  4. WORKS_AT      — Person → Organization
  5. REFERENCES    — Document → Document
```

That is your starter ontology. It looks simple because it is simple. It can already answer questions that would require five JOINs in a relational database:

```cypher
// Which person approved the contract for the vendor
// that supplies a non-compliant component?
MATCH (p:Person)<-[:APPROVED_BY]-(d:Document)
      <-[:REFERENCES]-(c:Component)-[:SUPPLIES]-(v:Organization)
WHERE NOT (c)-[:COMPLIES_WITH]->(:Regulation)
RETURN p.name, d.name, v.name, c.name
```

## 03. Iterative Design: Start Small, Validate, Expand

Ontology design is not a waterfall process. It is iterative. You build a small ontology, load real data, discover what is missing, and then expand.

### Iteration 1: The Starter (Day 1-2)

Define your five-by-five. Load a sample of 20 to 50 documents through the extraction pipeline from Chapter 7. Look at the graph.

**Questions to ask:**
- Can you answer the three most important business questions with this ontology?
- Are there entity types the LLM is extracting that do not fit any of your five node types?
- Are there obvious relationships between entities that you cannot express?

### Iteration 2: Fill the Gaps (Day 3-4)

Based on what you found, add two or three more node types and two or three more relationship types. Common additions after the first iteration:

- **Location** — almost every domain has a geographic component
- **Date/Event** — temporal entities that mark deadlines, milestones, incidents
- **Role** — the function a person performs, separate from the person themselves

Re-extract your sample documents with the expanded ontology. Compare the results.

### Iteration 3: Refine Properties (Day 5)

Now focus on properties. Which attributes on each node type are essential for answering questions? Which relationship properties carry important context?

```python
# Define your ontology as a Python data structure
# for validation and documentation
ONTOLOGY = {
    "node_types": {
        "Organization": {
            "required_properties": ["name"],
            "optional_properties": [
                "org_type", "industry", "website", "status"
            ],
            "description": "Any company, agency, or department"
        },
        "Person": {
            "required_properties": ["name"],
            "optional_properties": [
                "title", "email", "department", "level"
            ],
            "description": "Any individual referenced in documents"
        },
        "Component": {
            "required_properties": ["name"],
            "optional_properties": [
                "part_number", "category", "status", "version"
            ],
            "description": "Physical or logical part, material, "
                          "or assembly"
        },
        "Document": {
            "required_properties": ["name"],
            "optional_properties": [
                "doc_type", "effective_date", "status", "version"
            ],
            "description": "Any formal document — contract, policy, "
                          "report"
        },
        "Regulation": {
            "required_properties": ["name"],
            "optional_properties": [
                "jurisdiction", "effective_date", "category"
            ],
            "description": "Law, standard, or compliance requirement"
        },
        "Location": {
            "required_properties": ["name"],
            "optional_properties": [
                "city", "state", "country", "facility_type"
            ],
            "description": "Physical location or facility"
        },
        "Event": {
            "required_properties": ["name", "date"],
            "optional_properties": [
                "event_type", "severity", "status"
            ],
            "description": "Time-bound occurrence — inspection, "
                          "incident, milestone"
        }
    },
    "relationship_types": {
        "SUPPLIES": {
            "from": "Organization",
            "to": "Component",
            "properties": ["contract_id", "start_date", "end_date"]
        },
        "APPROVED_BY": {
            "from": ["Document", "Component"],
            "to": "Person",
            "properties": ["approval_date", "conditions"]
        },
        "COMPLIES_WITH": {
            "from": "Component",
            "to": "Regulation",
            "properties": ["certification_date", "status"]
        },
        "WORKS_AT": {
            "from": "Person",
            "to": "Organization",
            "properties": ["start_date", "role", "department"]
        },
        "REFERENCES": {
            "from": "Document",
            "to": "Document",
            "properties": ["section", "context"]
        },
        "LOCATED_IN": {
            "from": ["Organization", "Person", "Event"],
            "to": "Location",
            "properties": []
        },
        "MANAGES": {
            "from": "Person",
            "to": ["Person", "Organization", "Component"],
            "properties": ["since"]
        },
        "OCCURRED_AT": {
            "from": "Event",
            "to": "Location",
            "properties": []
        }
    }
}
```

### Iteration 4: Stress Test (Day 6-7)

Load 500 or more documents. Run your target queries. Look for:
- Queries that return no results when they should return something
- Entity types that are heavily populated but never queried
- Relationships that are always missing (extraction prompt may need tuning)
- Performance bottlenecks on specific traversal patterns

## 04. Common Ontology Patterns by Industry

You do not need to invent your ontology from scratch. Most industries have recurring patterns.

### Financial Services

| Node Type | Examples | Key Relationships |
| --- | --- | --- |
| Account | Checking, savings, loan, credit | OWNED_BY → Customer |
| Customer | Individual, corporate | HAS_ACCOUNT, RELATED_TO |
| Transaction | Transfer, payment, trade | FROM_ACCOUNT → TO_ACCOUNT |
| Product | Mortgage, credit card, fund | SUBSCRIBED_TO, ISSUED_BY |
| RegulatoryEntity | SEC, FINRA, OCC | REGULATED_BY, REPORTED_TO |

**Typical questions:** "Which customers are connected through shared accounts or transactions?" "What is the chain of transactions from Account A to Account B?" "Which products are affected by this regulatory change?"

### Healthcare

| Node Type | Examples | Key Relationships |
| --- | --- | --- |
| Patient | — | TREATED_BY, DIAGNOSED_WITH |
| Provider | Doctor, nurse, specialist | WORKS_AT, SPECIALIZES_IN |
| Condition | Diagnosis, symptom | COMORBID_WITH, TREATED_BY |
| Medication | Drug, therapy | PRESCRIBED_FOR, INTERACTS_WITH |
| Facility | Hospital, clinic, lab | LOCATED_IN, AFFILIATED_WITH |

**Typical questions:** "Which medications interact with what this patient is already taking?" "Which providers have treated patients with this rare condition?" "What is the referral chain for this patient?"

### Manufacturing

| Node Type | Examples | Key Relationships |
| --- | --- | --- |
| Product | Finished good, assembly | CONTAINS, VERSION_OF |
| Component | Part, material, sub-assembly | SUPPLIED_BY, USED_IN |
| Supplier | Vendor, manufacturer | SUPPLIES, CERTIFIED_BY |
| Facility | Plant, warehouse, line | PRODUCES, STORES |
| QualityEvent | Defect, recall, inspection | AFFECTS, CAUSED_BY |

**Typical questions:** "If this component fails, which finished products are affected?" "Which suppliers provide alternatives for this part?" "What is the full bill of materials for this product?"

### IT / Software

| Node Type | Examples | Key Relationships |
| --- | --- | --- |
| Service | Microservice, API, app | DEPENDS_ON, CALLS |
| Infrastructure | Server, database, queue | HOSTS, CONNECTS_TO |
| Team | Dev team, SRE, platform | OWNS, MAINTAINS |
| Incident | Outage, degradation | AFFECTED, CAUSED_BY |
| Change | Deployment, config change | DEPLOYED_TO, TRIGGERED |

**Typical questions:** "If this database goes down, which services are affected?" "What changed in the last 24 hours that could have caused this incident?" "Which team owns the service that is failing?"

## 05. Using LLMs to Suggest Ontology Structure

You can use an LLM to bootstrap your ontology from sample documents. This is not a replacement for domain expertise. It is an excellent starting point.

```python
import anthropic

client = anthropic.Anthropic()

def suggest_ontology(sample_texts: list[str], domain: str) -> str:
    """Use an LLM to suggest an ontology from sample documents."""
    combined_samples = "\n---\n".join(
        text[:1000] for text in sample_texts[:5]
    )

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": f"""You are an ontology designer. Given these
sample documents from the {domain} domain, suggest a knowledge graph
ontology.

SAMPLE DOCUMENTS:
{combined_samples}

Provide:
1. 5-8 node types with descriptions and key properties
2. 8-12 relationship types with source/target node types
3. 3 example Cypher queries this ontology could answer
4. 2 potential pitfalls or ambiguities to watch for

Format as structured text, not code."""
        }]
    )
    return response.content[0].text
```

The LLM will typically over-generate. It might suggest 15 node types when you need 7. Use its output as a starting point. Ask which of these types you will actually query and which relationships appear in your real business questions.

## 06. Schema Validation

Once you have an ontology, enforce it. A knowledge graph without schema validation will drift. Extraction pipelines will create nodes with wrong labels, relationships between incompatible types, and missing required properties.

```python
from neo4j import GraphDatabase

driver = GraphDatabase.driver(
    "bolt://localhost:7687",
    auth=("neo4j", "password")
)

def validate_schema(ontology: dict) -> list[dict]:
    """Validate the graph against the ontology definition."""
    violations = []

    with driver.session() as session:
        # Check 1: Unknown node labels
        valid_labels = set(ontology["node_types"].keys())
        result = session.run(
            "CALL db.labels() YIELD label RETURN label"
        )
        for record in result:
            if record["label"] not in valid_labels:
                violations.append({
                    "type": "unknown_label",
                    "detail": f"Label '{record['label']}' not in "
                             f"ontology",
                    "severity": "warning"
                })

        # Check 2: Unknown relationship types
        valid_rels = set(ontology["relationship_types"].keys())
        result = session.run(
            "CALL db.relationshipTypes() YIELD relationshipType "
            "RETURN relationshipType"
        )
        for record in result:
            if record["relationshipType"] not in valid_rels:
                violations.append({
                    "type": "unknown_relationship",
                    "detail": f"Relationship "
                             f"'{record['relationshipType']}' "
                             f"not in ontology",
                    "severity": "warning"
                })

        # Check 3: Missing required properties
        for label, spec in ontology["node_types"].items():
            for prop in spec.get("required_properties", []):
                result = session.run(
                    f"MATCH (n:{label}) "
                    f"WHERE n.{prop} IS NULL "
                    f"RETURN count(n) AS count"
                )
                count = result.single()["count"]
                if count > 0:
                    violations.append({
                        "type": "missing_property",
                        "detail": f"{count} {label} nodes missing "
                                 f"required property '{prop}'",
                        "severity": "error"
                    })

        # Check 4: Invalid relationship endpoints
        for rel_type, spec in ontology["relationship_types"].items():
            from_types = spec["from"]
            if isinstance(from_types, str):
                from_types = [from_types]
            to_types = spec["to"]
            if isinstance(to_types, str):
                to_types = [to_types]

            from_clause = " OR ".join(
                f"'{t}' IN labels(a)" for t in from_types
            )
            to_clause = " OR ".join(
                f"'{t}' IN labels(b)" for t in to_types
            )

            result = session.run(
                f"MATCH (a)-[r:{rel_type}]->(b) "
                f"WHERE NOT ({from_clause}) "
                f"   OR NOT ({to_clause}) "
                f"RETURN count(r) AS count"
            )
            count = result.single()["count"]
            if count > 0:
                violations.append({
                    "type": "invalid_endpoint",
                    "detail": f"{count} {rel_type} relationships "
                             f"connect wrong node types",
                    "severity": "error"
                })

    return violations


def print_validation_report(violations: list[dict]):
    """Print a formatted validation report."""
    errors = [v for v in violations if v["severity"] == "error"]
    warnings = [v for v in violations if v["severity"] == "warning"]

    print(f"Schema Validation: {len(errors)} errors, "
          f"{len(warnings)} warnings\n")

    if errors:
        print("ERRORS:")
        for v in errors:
            print(f"  [{v['type']}] {v['detail']}")

    if warnings:
        print("\nWARNINGS:")
        for v in warnings:
            print(f"  [{v['type']}] {v['detail']}")

    if not violations:
        print("All validations passed.")
```

## 07. Anti-Pattern: Over-Engineering Before You Have Data

The most common ontology failure is spending months designing a comprehensive model before loading any real data. This approach fails for three reasons:

**1. You do not know what you do not know.** Until you see real extracted data, you cannot predict which entity types the LLM will find consistently and which it will struggle with. Designing for 50 entity types when the LLM can only reliably extract 10 is wasted effort.

**2. Schema evolution is cheap in graphs.** Unlike relational databases where adding a column requires an ALTER TABLE and a data migration, adding a new node label or relationship type to a graph is free. You simply start creating nodes with the new label. The cost of starting small and expanding is close to zero.

**3. Unused complexity obscures real problems.** If your ontology has 200 node types but only 15 are populated, every query requires you to remember which types actually have data. Quality checks become noisy because most of the schema is empty. Dashboards show 185 entity types with a zero count, and nobody knows if that is expected or a problem.

> **Think of it like this:** Over-engineering an ontology is like drawing a detailed architectural plan for a 50-room mansion before you know how many people will live in the house. Build a solid 5-room house first. You can always add rooms later, and you will know exactly which rooms you need because you will have lived in the house.

## 08. Starter Ontology Templates

Here are copy-and-paste starter ontologies for common domains. Each one includes the node types, relationship types, and three example queries.

### Template: Vendor Risk Management

```cypher
// Node types
// (:Vendor {name, risk_rating, status, country})
// (:Product {name, category, criticality})
// (:Contract {name, value, start_date, end_date})
// (:Assessment {name, date, score, assessor})
// (:Risk {name, category, severity, status})

// Relationship types
// (Vendor)-[:SUPPLIES]->(Product)
// (Vendor)-[:BOUND_BY]->(Contract)
// (Vendor)-[:ASSESSED_IN]->(Assessment)
// (Assessment)-[:IDENTIFIED]->(Risk)
// (Risk)-[:AFFECTS]->(Product)

// Example queries
// Q1: Which high-risk vendors supply critical products?
MATCH (v:Vendor)-[:SUPPLIES]->(p:Product)
WHERE v.risk_rating = 'high' AND p.criticality = 'critical'
RETURN v.name, collect(p.name) AS products

// Q2: What risks were found in the latest assessment for a vendor?
MATCH (v:Vendor {name: $vendor})-[:ASSESSED_IN]->(a:Assessment)
      -[:IDENTIFIED]->(r:Risk)
ORDER BY a.date DESC
LIMIT 1
RETURN a.date, collect(r.name) AS risks, collect(r.severity) AS severities

// Q3: Which contracts expire within 90 days for vendors with
//     open risks?
MATCH (v:Vendor)-[:BOUND_BY]->(c:Contract)
MATCH (v)-[:ASSESSED_IN]->(:Assessment)-[:IDENTIFIED]->(r:Risk)
WHERE r.status = 'open'
  AND c.end_date <= date() + duration('P90D')
RETURN v.name, c.name, c.end_date, collect(r.name) AS open_risks
```

### Template: IT Service Dependency

```cypher
// Node types
// (:Service {name, tier, owner_team, status})
// (:Database {name, engine, version, host})
// (:Team {name, slack_channel, on_call})
// (:Incident {id, severity, status, start_time})
// (:Change {id, description, deploy_time, status})

// Relationship types
// (Service)-[:DEPENDS_ON]->(Service)
// (Service)-[:READS_FROM|WRITES_TO]->(Database)
// (Team)-[:OWNS]->(Service)
// (Incident)-[:AFFECTED]->(Service)
// (Change)-[:DEPLOYED_TO]->(Service)

// Example queries
// Q1: If the payments database goes down, which services are
//     affected (transitively)?
MATCH (db:Database {name: 'payments-db'})<-[:READS_FROM|WRITES_TO]
      -(s:Service)<-[:DEPENDS_ON*0..5]-(upstream:Service)
RETURN DISTINCT upstream.name, upstream.tier
ORDER BY upstream.tier

// Q2: What changed in the last 24 hours for services involved
//     in this incident?
MATCH (i:Incident {id: $incident_id})-[:AFFECTED]->(s:Service)
      <-[:DEPLOYED_TO]-(c:Change)
WHERE c.deploy_time > datetime() - duration('P1D')
RETURN s.name, c.id, c.description, c.deploy_time

// Q3: Which teams own services with no recent incident response?
MATCH (t:Team)-[:OWNS]->(s:Service)
WHERE NOT EXISTS {
  MATCH (i:Incident)-[:AFFECTED]->(s)
  WHERE i.start_time > datetime() - duration('P90D')
}
RETURN t.name, collect(s.name) AS untested_services
```

### Template: Regulatory Compliance

```cypher
// Node types
// (:Regulation {name, jurisdiction, effective_date, status})
// (:Control {name, description, frequency, owner})
// (:Policy {name, version, approved_date, status})
// (:Finding {id, description, severity, status})
// (:BusinessUnit {name, head, region})

// Relationship types
// (Control)-[:IMPLEMENTS]->(Regulation)
// (Policy)-[:MANDATES]->(Control)
// (Finding)-[:VIOLATES]->(Control)
// (BusinessUnit)-[:SUBJECT_TO]->(Regulation)
// (Finding)-[:FOUND_IN]->(BusinessUnit)

// Example queries
// Q1: Which regulations have controls with open findings?
MATCH (r:Regulation)<-[:IMPLEMENTS]-(c:Control)
      <-[:VIOLATES]-(f:Finding)
WHERE f.status = 'open'
RETURN r.name, c.name, count(f) AS open_findings
ORDER BY open_findings DESC

// Q2: Which business units are non-compliant?
MATCH (bu:BusinessUnit)-[:SUBJECT_TO]->(r:Regulation)
      <-[:IMPLEMENTS]-(c:Control)<-[:VIOLATES]-(f:Finding)
WHERE f.status = 'open'
RETURN bu.name, r.name, count(DISTINCT f) AS violations

// Q3: What is the full compliance chain for a regulation?
MATCH path = (r:Regulation)<-[:IMPLEMENTS]-(c:Control)
              <-[:MANDATES]-(p:Policy)
WHERE r.name = $regulation
RETURN p.name, c.name, c.frequency, c.owner
```

## 09. Evolving Your Ontology

Your ontology will change. New document types arrive and new questions emerge. The key is evolving without breaking existing queries or data.

### Adding Node Types

Just start creating nodes with the new label. Existing queries are not affected.

```cypher
// New requirement: track geographic risk
CREATE (:Country {name: "Taiwan", risk_level: "elevated",
        risk_factors: ["geopolitical", "natural disaster"]})
```

### Adding Relationship Types

Create new relationships alongside existing ones. Do not rename existing relationship types. Renaming breaks queries.

```cypher
// New requirement: track where components are manufactured
MATCH (c:Component {name: "CPU-A100"})
MATCH (country:Country {name: "Taiwan"})
CREATE (c)-[:MANUFACTURED_IN {factory: "TSMC Fab 18"}]->(country)
```

### Deprecating Types

Do not delete old types immediately. Add a deprecated property and migrate them over time.

```cypher
// Mark old relationship type as deprecated
MATCH ()-[r:SUPPLIES]->()
SET r.deprecated = true, r.replacement = "SUPPLIED_BY"
```

## 10. Chapter Checklist

Before moving to the next chapter, make sure you can answer these questions:

- [ ] Can you explain what an ontology is in one sentence?
- [ ] Can you define a five-by-five starter ontology for your domain?
- [ ] Can you describe the iterative design process and why it works?
- [ ] Can you identify the ontology pattern closest to your industry?
- [ ] Can you write a schema validation query to check your graph against your ontology?
- [ ] Can you explain why over-engineering an ontology before loading data is an anti-pattern?

With an ontology in place, the next challenge is making sure the data in your graph is correct. Chapter 9 covers data quality from the QA engineer's perspective.
