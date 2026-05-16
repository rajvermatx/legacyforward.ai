---
title: "Capstone: Compliance Knowledge Graph"
slug: "capstone-compliance-graph"
description: "Build a compliance knowledge graph from regulatory documents and internal policies, enabling AI-powered queries about which regulations apply to specific business activities, how internal policies satisfy regulatory requirements, and where compliance gaps exist."
section: "legacyforward-compendium"
order: 68
part: "Part VII — Capstones"
---

Part VII — Capstones

# Capstone: Compliance Knowledge Graph

Compliance teams spend enormous effort manually mapping regulatory requirements to internal policies — determining which regulations apply to which business activities, whether internal policies address each requirement, and where gaps exist. This mapping is typically maintained in spreadsheets that become stale as regulations change. A compliance knowledge graph makes these relationships machine-queryable, enabling AI-powered compliance analysis that keeps pace with regulatory change.

## Scenario

A financial services compliance team is responsible for ensuring adherence to 12 regulatory frameworks affecting 400 internal policies. The manual mapping is maintained in a 3,000-row spreadsheet that requires 6 weeks of effort to update when a major regulation changes. The compliance knowledge graph makes the mapping queryable, enables automated gap analysis when regulations change, and supports AI-powered compliance question answering.

## Architecture

**Graph schema:**

Nodes:
- Regulation (id, name, jurisdiction, status, effective_date)
- Requirement (id, text, regulation_id, category)
- Policy (id, name, version, owner, last_reviewed)
- PolicySection (id, text, policy_id, section_number)
- BusinessActivity (id, name, description, department)

Edges:
- (Regulation)-[:CONTAINS]->(Requirement)
- (Policy)-[:ADDRESSES]->(Requirement) — with edge property: coverage (full/partial/implicit)
- (BusinessActivity)-[:GOVERNED_BY]->(Requirement)
- (Regulation)-[:SUPERSEDES]->(Regulation)
- (PolicySection)-[:IMPLEMENTS]->(Requirement)

**Construction pipeline:**

1. Ingest regulatory documents → extract Requirements nodes
2. Ingest internal policies → extract PolicySection nodes
3. LLM-powered relationship extraction: which PolicySections address which Requirements
4. Manual review and validation of extracted relationships
5. Ongoing: monitor for regulatory changes, update graph, re-run gap analysis

## Implementation

**Requirement extraction prompt:**
```
Extract all discrete regulatory requirements from the following regulatory text.
A requirement is a specific obligation, prohibition, or standard that an organization must comply with.

For each requirement:
- requirement_id: sequential ID within this regulation (REQ-001, REQ-002, ...)
- text: the requirement stated precisely
- category: one of [data_privacy, reporting, capital, conduct, operational_risk, other]
- obligation_type: one of [mandatory, conditional, recommended]
- subject: who the requirement applies to

Regulatory text: {text}
```

**Policy-to-requirement mapping:**
```
For each regulatory requirement, assess whether the following policy section addresses it.
Coverage levels:
- FULL: the policy section explicitly and completely addresses the requirement
- PARTIAL: the policy section addresses some but not all aspects of the requirement
- IMPLICIT: the policy section's intent covers the requirement but does not explicitly address it
- NONE: the policy section does not address this requirement

Requirement: {requirement_text}
Policy section: {policy_section_text}

Return: {coverage_level, confidence, explanation, quoted_evidence}
```

**Gap analysis query (Cypher):**
```cypher
// Find requirements with no full coverage
MATCH (req:Requirement)<-[:GOVERNED_BY]-(activity:BusinessActivity {name: $activity_name})
WHERE NOT EXISTS {
  MATCH (req)<-[:ADDRESSES {coverage: 'full'}]-(:Policy)
}
RETURN req.id, req.text, req.category,
  COLLECT {
    MATCH (req)<-[:ADDRESSES]-(p:Policy)
    RETURN {policy: p.name, coverage: rel.coverage}
  } AS partial_coverage
ORDER BY req.category
```

**AI compliance Q&A:**
After the graph is built, equip an LLM agent with graph traversal tools to answer compliance questions:

- "What regulations apply to our new mobile payment feature?" → traverse BusinessActivity → Requirements → Regulations
- "Is our data retention policy compliant with GDPR Article 5?" → retrieve PolicySection content, compare against GDPR Article 5 requirements
- "What changes are required if we enter the German market?" → traverse Germany jurisdiction regulations → Requirements → check coverage

## Key Learning Points

**The graph schema is the product.** The compliance knowledge graph's value depends entirely on the quality of the schema design. Requirements that are granular enough to map to specific policy sections are more useful than high-level requirements that map to entire policies. Iterate on schema design with compliance team input before building the ingestion pipeline.

**Human review at the relationship layer is non-negotiable.** LLM-extracted policy-to-requirement mappings have false positives and false negatives that must be caught before the graph is used for compliance decisions. Structure the human review workflow to be efficient — present extracted relationships with supporting evidence for quick accept/reject review.

**The gap analysis is the highest-value query.** The compliance team's primary use of the graph is identifying where requirements are not covered. Optimize for this query: ensure the coverage attribute is reliably set, build the gap analysis as a parameterized query in the UI, and include the severity of uncovered requirements in the output.

**Change propagation is the operational value.** When a regulation changes, the graph enables automatic identification of which policies are affected — a task that takes the compliance team weeks with the spreadsheet approach. Build the change propagation workflow as a first-class feature.
