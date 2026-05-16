---
title: "How Graph Databases Actually Work"
slug: "how-graphs-work"
description: "Graph databases are not mysterious. They store nodes and edges, query them with graph query languages, and optimize for traversal operations. Practitioners who understand how they work can design with them effectively rather than treating them as black boxes."
section: "legacyforward-compendium"
order: 54
part: "Part VI — Advanced AI Patterns"
---

Part VI — Advanced AI Patterns

# How Graph Databases Actually Work

Graph databases are one of the categories of technology that practitioners routinely defer to specialists without understanding. This deference is unnecessary — the core concepts are approachable, and practitioners who understand how graph databases work can design effective graph schemas, write useful queries, and evaluate whether a graph database is appropriate for a given problem.

### What You Will Learn

- The data model: nodes, edges, properties, and labels
- Graph query languages: Cypher and Gremlin
- Graph database internals: how traversal is implemented efficiently
- The major graph database options and when to use each

## 54.1 The Graph Data Model

Graph databases represent data as a property graph: a set of nodes connected by edges, each of which can have properties.

**Nodes** represent entities — the "things" in the domain. A customer, a product, an organization, a document, a concept. Each node has a label (its type: "Customer", "Product") and a set of properties (its attributes: name, id, created_date).

**Edges** represent relationships — the connections between entities. "Customer PURCHASED Product", "Document REFERENCES Document", "Organization EMPLOYS Person". Each edge has a type (describing the relationship), a direction (the relationship goes from one node to another), and optionally properties (the purchase date, the reference context, the employment start date).

**Properties** are key-value pairs attached to nodes or edges. Property values can be strings, numbers, booleans, dates, or lists. Properties are how attributes of entities and relationships are stored.

**Labels** categorize nodes. A node can have multiple labels — a "Person" node might also be labeled "Employee" and "Customer". Labels enable filtering queries to specific entity types.

**Example graph fragment:**

```text
Node: (Person {name: "Alice", id: "p001"})
Node: (Organization {name: "Acme Corp", industry: "Manufacturing"})
Edge: (Alice)-[:EMPLOYED_BY {since: 2020, role: "Engineer"}]->(Acme Corp)
Node: (Contract {id: "c042", value: 500000, signed: 2023-03-15})
Edge: (Acme Corp)-[:PARTY_TO {role: "Vendor"}]->(Contract)
```

## 54.2 Graph Query Languages

**Cypher** is the query language of Neo4j and is used by several other graph databases. It uses an ASCII-art notation that visually represents the graph pattern being matched.

Find all contracts that Acme Corp is party to:
```cypher
MATCH (org:Organization)-[:PARTY_TO]->(contract:Contract)
WHERE org.name = "Acme Corp"
RETURN contract
```

Find all people employed by organizations that are party to contracts over $1M:
```cypher
MATCH (person:Person)-[:EMPLOYED_BY]->(org:Organization)-[:PARTY_TO]->(contract:Contract)
WHERE contract.value > 1000000
RETURN person.name, org.name, contract.id
```

Find all paths between two organizations of up to four hops:
```cypher
MATCH path = (org1:Organization)-[*1..4]-(org2:Organization)
WHERE org1.name = "Acme Corp" AND org2.name = "SupplierCo"
RETURN path
```

The variable-length relationship pattern `[*1..4]` is what makes Cypher well-suited to graph traversal — expressing variable-depth traversal in SQL requires complex recursive CTEs.

**Gremlin** is the query language of Apache TinkerPop, used by AWS Neptune, Azure Cosmos DB (Gremlin API), and JanusGraph. Gremlin uses a traversal-based syntax:

```gremlin
g.V().has('Organization', 'name', 'Acme Corp')
  .out('PARTY_TO')
  .has('Contract', 'value', gt(1000000))
  .in('PARTY_TO')
  .out('EMPLOYS')
  .values('name')
```

Gremlin is more verbose than Cypher but is more consistent across graph database implementations.

## 54.3 How Traversal Is Implemented Efficiently

Graph databases achieve efficient traversal through a storage model optimized for following edges.

**Adjacency lists per node.** Each node stores pointers directly to its edges, and each edge stores pointers to its start and end nodes. Following a relationship from a node to its neighbors is a pointer dereference — O(degree) operation — not a table scan. This is what makes graph traversal efficient regardless of database size.

**Index-free adjacency.** Unlike relational databases where JOIN must scan an index to find related rows, graph databases store adjacency information directly with the node. There is no index to scan; the relationship is a direct pointer. Index-free adjacency is the source of graph databases' traversal advantage.

**Property indexes.** For looking up nodes by property value (finding a specific node by name or ID), graph databases maintain indexes on designated properties — similar to relational database indexes. The starting point of a graph traversal is typically a property lookup; the traversal itself uses index-free adjacency.

## 54.4 Graph Database Options

**Neo4j** is the most widely deployed graph database, with a mature ecosystem, Cypher query language, full ACID transactions, and both self-managed and cloud-managed (AuraDB) deployment options. The default choice for greenfield enterprise graph projects.

**AWS Neptune** is a managed graph database service on AWS, supporting both Cypher (via openCypher) and Gremlin. The right choice for organizations deeply invested in AWS who want managed infrastructure without Neo4j licensing.

**Azure Cosmos DB (Gremlin API)** provides globally distributed graph storage using the Gremlin query language. Appropriate for multi-region deployments on Azure with variable throughput requirements.

**Apache AGE (PostgreSQL extension)** adds graph capabilities to PostgreSQL, allowing organizations to store and query graph data in an existing PostgreSQL database. Appropriate when the graph data volume is modest and the organization wants to minimize infrastructure complexity.

**Selection criteria:** For enterprise AI applications, the primary criteria are: query language (Cypher is generally more expressive for complex traversal), ACID compliance (required for graphs that store authoritative enterprise data, not just analytical views), managed cloud availability (reduces operational burden), and integration with existing cloud infrastructure.

Graph databases are not exotic — they are a mature, well-supported category of infrastructure. Organizations that understand them deploy them alongside relational databases for the specific use cases where graph traversal capability matters.
