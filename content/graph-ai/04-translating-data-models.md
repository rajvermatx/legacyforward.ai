---
title: "Translating Your Data Model"
slug: "translating-data-models"
description: >-
  A pattern-by-pattern guide to converting ERD structures into graph
  models. Covers five common relational patterns — self-referencing
  tables, many-to-many junctions, polymorphic associations, temporal
  data, and hierarchical categories — with SQL schemas, graph models,
  and clear guidance on when the graph version is better.
section: "graph-ai"
order: 4
part: "Part 02 Graph Thinking"
badges:
  - "Data Modeling"
  - "ERD Translation"
  - "Design Patterns"
---

# Translating Your Data Model

You have an ERD with 30 tables. Here's how to convert the parts that benefit from a graph.

## 01. You Are Not Replacing Your Database


![Diagram 1](/diagrams/graph-ai/ch04-01.svg)

![Diagram 2](/diagrams/graph-ai/ch04-02.svg)
Let us be direct about this before we start: the goal of this chapter is NOT to take your entire relational database and move it into a graph. That would be a bad idea. Most of your data — transactional records, user accounts, financial ledgers, audit logs — is perfectly well-served by a relational database.

The goal is to identify the **specific patterns** in your schema that are hitting the limits of the relational model and would benefit from a graph representation. In most enterprises, this is 10-20% of the overall data model. The other 80-90% stays exactly where it is.

> **Think of it like this:** You do not tear down your house because the attic is poorly organized. You reorganize the attic. This chapter teaches you to find the "attic" in your data model — the parts that are struggling with the relational structure — and reorganize those parts into a graph.

## 02. The Five Patterns

After looking at hundreds of enterprise schemas, the same five patterns come up repeatedly as candidates for graph conversion. We will go through each one in detail, showing the relational schema, the graph equivalent, and the specific reasons why the graph version is better (or when it is not).

The five patterns:

1. Self-referencing table (org hierarchy)
2. Many-to-many junction table
3. Polymorphic associations
4. Temporal data (effective dates)
5. Hierarchical categories

## 03. Pattern 1: Self-Referencing Table (Org Hierarchy)

### The Relational Version

This is the most common pattern that hits the JOIN wall. A table has a foreign key that references itself, creating a tree or DAG (directed acyclic graph).

```sql
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    name VARCHAR(100),
    title VARCHAR(100),
    department VARCHAR(100),
    manager_id INT REFERENCES employees(emp_id)
);

-- Sample data: a 4-level hierarchy
INSERT INTO employees VALUES (1, 'Sarah CEO', 'CEO', 'Executive', NULL);
INSERT INTO employees VALUES (2, 'Tom VP-Eng', 'VP Engineering', 'Engineering', 1);
INSERT INTO employees VALUES (3, 'Lisa VP-Sales', 'VP Sales', 'Sales', 1);
INSERT INTO employees VALUES (4, 'Bob Director', 'Director', 'Engineering', 2);
INSERT INTO employees VALUES (5, 'Alice Manager', 'Manager', 'Engineering', 4);
INSERT INTO employees VALUES (6, 'Carol Dev', 'Developer', 'Engineering', 5);
```

### The Query That Hurts

"Find everyone in Carol's management chain up to the CEO."

```sql
WITH RECURSIVE chain AS (
    SELECT emp_id, name, title, manager_id, 1 AS level
    FROM employees WHERE name = 'Carol Dev'

    UNION ALL

    SELECT e.emp_id, e.name, e.title, e.manager_id, c.level + 1
    FROM employees e
    JOIN chain c ON e.emp_id = c.manager_id
)
SELECT name, title, level FROM chain ORDER BY level;
```

This works, but:
- It requires recursive CTE support (not all databases handle it well)
- Performance degrades as the table grows (each recursion level is a separate query against the table)
- It cannot easily answer "find all paths" or "find shortest path" between two employees
- Adding a second hierarchy (e.g., project reporting, matrix organizations) requires a second self-referencing column or a separate table

### The Graph Version

```cypher
// Create the hierarchy
CREATE (sarah:Employee {name: 'Sarah CEO', title: 'CEO', department: 'Executive'})
CREATE (tom:Employee {name: 'Tom VP-Eng', title: 'VP Engineering', department: 'Engineering'})
CREATE (lisa:Employee {name: 'Lisa VP-Sales', title: 'VP Sales', department: 'Sales'})
CREATE (bob:Employee {name: 'Bob Director', title: 'Director', department: 'Engineering'})
CREATE (alice:Employee {name: 'Alice Manager', title: 'Manager', department: 'Engineering'})
CREATE (carol:Employee {name: 'Carol Dev', title: 'Developer', department: 'Engineering'})

CREATE (tom)-[:REPORTS_TO]->(sarah)
CREATE (lisa)-[:REPORTS_TO]->(sarah)
CREATE (bob)-[:REPORTS_TO]->(tom)
CREATE (alice)-[:REPORTS_TO]->(bob)
CREATE (carol)-[:REPORTS_TO]->(alice)

// Query: Carol's management chain
MATCH (carol:Employee {name: 'Carol Dev'})-[:REPORTS_TO*]->(manager)
RETURN manager.name, manager.title
```

The `REPORTS_TO*` syntax means "follow this relationship any number of hops." No recursion. No multiple query passes. One pattern match.

### When the Graph Is Better

| Question | SQL Approach | Cypher Approach | Advantage |
| --- | --- | --- | --- |
| Direct manager | Simple JOIN | Simple MATCH | Tie |
| Full chain to CEO | Recursive CTE | `REPORTS_TO*` | Graph (simpler, faster) |
| All people under VP | Recursive CTE | `REPORTS_TO*` (reverse) | Graph (simpler, faster) |
| Shortest path between two employees | Very complex | `shortestPath()` | Graph (built-in) |
| Matrix reporting (two hierarchies) | Two self-ref columns or junction table | Two relationship types | Graph (cleaner model) |

### When the Relational Version Is Fine

If your hierarchy is shallow (2-3 levels), queries are always "who is X's manager?" (one hop), and you never need to traverse the full chain — keep it in the relational database. The self-referencing foreign key is simple, well-understood, and efficient for single-hop lookups.

## 04. Pattern 2: Many-to-Many Junction Table

### The Relational Version

Junction tables (also called bridge tables or associative tables) are how relational databases model many-to-many relationships. They work, but they have a cost: every query that traverses a many-to-many relationship requires an extra JOIN through the junction table.

```sql
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE skills (
    skill_id INT PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50)
);

-- Junction table
CREATE TABLE employee_skills (
    emp_id INT REFERENCES employees(emp_id),
    skill_id INT REFERENCES skills(skill_id),
    proficiency VARCHAR(20),  -- 'Beginner', 'Intermediate', 'Expert'
    certified_date DATE,
    PRIMARY KEY (emp_id, skill_id)
);
```

### The Query That Hurts

"Find employees who share at least 3 skills with Bob, ranked by overlap."

```sql
SELECT e2.name, COUNT(*) AS shared_skills
FROM employee_skills es1
JOIN employee_skills es2 ON es1.skill_id = es2.skill_id
JOIN employees e1 ON es1.emp_id = e1.emp_id
JOIN employees e2 ON es2.emp_id = e2.emp_id
WHERE e1.name = 'Bob Park'
  AND e2.name != 'Bob Park'
GROUP BY e2.name
HAVING COUNT(*) >= 3
ORDER BY shared_skills DESC;
```

Four JOINs, a self-join on the junction table, GROUP BY, and HAVING. It works, but it is not readable, and performance degrades as the junction table grows.

### The Graph Version

```cypher
// Model
CREATE (bob:Employee {name: 'Bob Park'})
CREATE (python:Skill {name: 'Python', category: 'Programming'})
CREATE (sql:Skill {name: 'SQL', category: 'Data'})
CREATE (k8s:Skill {name: 'Kubernetes', category: 'Infrastructure'})

// Relationships with properties (the junction table data moves here)
CREATE (bob)-[:HAS_SKILL {proficiency: 'Expert', certified_date: date('2023-06-15')}]->(python)
CREATE (bob)-[:HAS_SKILL {proficiency: 'Expert', certified_date: date('2020-01-01')}]->(sql)
CREATE (bob)-[:HAS_SKILL {proficiency: 'Intermediate'}]->(k8s)

// Query: find employees sharing 3+ skills with Bob
MATCH (bob:Employee {name: 'Bob Park'})-[:HAS_SKILL]->(skill)<-[:HAS_SKILL]-(other:Employee)
WITH other, COUNT(skill) AS shared
WHERE shared >= 3
RETURN other.name, shared
ORDER BY shared DESC
```

The junction table is gone. The proficiency and certified_date columns that lived on the junction table are now properties on the `HAS_SKILL` relationship. The query reads like the question: "Start at Bob, find skills he has, find others who also have those skills, count the overlap."

> **Think of it like this:** A junction table is like a guest list for a party that records which guests know which other guests. In a graph, you skip the list — you just draw lines between the people who know each other. The information is the same, but the lines are faster to follow than the list is to search.

### When the Graph Is Better

The graph wins when you are querying **through** the junction table — finding shared connections, traversing from entity to entity via the many-to-many relationship. The relational model wins when you are querying **the junction table itself** — for example, "show me all skill certifications granted in Q3 2024" (a simple SELECT against the junction table with a date filter).

## 05. Pattern 3: Polymorphic Associations

### The Relational Version

Polymorphic associations are a pattern where a single table references multiple other tables using an `entity_type` + `entity_id` pair. It is common in audit logs, comments, and tagging systems.

```sql
CREATE TABLE comments (
    comment_id INT PRIMARY KEY,
    entity_type VARCHAR(50),  -- 'ticket', 'project', 'document'
    entity_id INT,            -- ID in the referenced table
    author_id INT,
    text TEXT,
    created_at TIMESTAMP
);

-- This comment is on ticket #42
INSERT INTO comments VALUES (1, 'ticket', 42, 101, 'Looks good to me', NOW());
-- This comment is on project #7
INSERT INTO comments VALUES (2, 'project', 7, 102, 'Budget needs review', NOW());
-- This comment is on document #15
INSERT INTO comments VALUES (3, 'document', 15, 101, 'Updated section 3', NOW());
```

### Why This Is Problematic

This pattern has well-known issues in relational databases:
- **No foreign key constraint.** You cannot create a foreign key from `entity_id` to multiple tables based on `entity_type`. The database cannot enforce referential integrity.
- **Queries require CASE or UNION.** To get the referenced entity, you need conditional logic or multiple queries.
- **Indexing is inefficient.** A composite index on `(entity_type, entity_id)` helps, but the query planner cannot use it as effectively as a true foreign key index.

```sql
-- Getting comments with their referenced entity requires ugly SQL
SELECT c.text, c.created_at,
    CASE c.entity_type
        WHEN 'ticket' THEN t.title
        WHEN 'project' THEN p.name
        WHEN 'document' THEN d.title
    END AS entity_name
FROM comments c
LEFT JOIN tickets t ON c.entity_type = 'ticket' AND c.entity_id = t.ticket_id
LEFT JOIN projects p ON c.entity_type = 'project' AND c.entity_id = p.project_id
LEFT JOIN documents d ON c.entity_type = 'document' AND c.entity_id = d.doc_id;
```

### The Graph Version

```cypher
// Nodes with different labels
CREATE (ticket:Ticket {id: 42, title: 'Fix login bug'})
CREATE (project:Project {id: 7, name: 'Data Platform'})
CREATE (doc:Document {id: 15, title: 'Architecture Guide'})

CREATE (alice:Employee {id: 101, name: 'Alice'})
CREATE (bob:Employee {id: 102, name: 'Bob'})

// Comments as nodes with relationships
CREATE (c1:Comment {text: 'Looks good to me', created_at: datetime()})
CREATE (c2:Comment {text: 'Budget needs review', created_at: datetime()})
CREATE (c3:Comment {text: 'Updated section 3', created_at: datetime()})

CREATE (c1)-[:ABOUT]->(ticket)
CREATE (c2)-[:ABOUT]->(project)
CREATE (c3)-[:ABOUT]->(doc)

CREATE (alice)-[:WROTE]->(c1)
CREATE (bob)-[:WROTE]->(c2)
CREATE (alice)-[:WROTE]->(c3)

// Query: all comments and their targets — no CASE, no UNION
MATCH (author:Employee)-[:WROTE]->(comment:Comment)-[:ABOUT]->(entity)
RETURN author.name, comment.text, labels(entity)[0] AS entity_type,
       coalesce(entity.title, entity.name) AS entity_name
```

In the graph model, the polymorphic association simply becomes a relationship. The `ABOUT` relationship can point to any type of node — Ticket, Project, or Document — without any special handling. The `entity_type` column disappears because the type is inherent in the node's label.

> **Think of it like this:** Polymorphic associations in SQL are like writing "see Room 42 in Building 3" on a sticky note. You have to know that Building 3 is the Tickets building and Room 42 is ticket #42. In a graph, you just draw an arrow from the comment to the ticket. No lookup, no translation.

### When the Graph Is Better

Almost always, for this specific pattern. Polymorphic associations are a workaround for a limitation of the relational model — the inability to create foreign keys to multiple tables. Graphs do not have this limitation. The only case where you might keep the relational version is if you rarely query through the polymorphic column and mostly just insert records (e.g., a write-heavy audit log that is rarely queried).

## 06. Pattern 4: Temporal Data (Effective Dates)

### The Relational Version

Many enterprise schemas track historical relationships using effective date ranges. An employee's department assignment, a product's price, a vendor's certification status — all change over time, and you need to know what was true at any given point.

```sql
CREATE TABLE employee_departments (
    emp_id INT REFERENCES employees(emp_id),
    dept_id INT REFERENCES departments(dept_id),
    effective_from DATE,
    effective_to DATE,  -- NULL means current
    PRIMARY KEY (emp_id, dept_id, effective_from)
);

-- Alice was in Engineering from 2020 to 2023, then moved to Product
INSERT INTO employee_departments VALUES (101, 1, '2020-01-15', '2023-06-30');
INSERT INTO employee_departments VALUES (101, 2, '2023-07-01', NULL);
```

### The Query That Hurts

"Who was in the Engineering department on March 15, 2022?"

```sql
SELECT e.name, e.title
FROM employees e
JOIN employee_departments ed ON e.emp_id = ed.emp_id
JOIN departments d ON ed.dept_id = d.dept_id
WHERE d.name = 'Engineering'
  AND ed.effective_from <= '2022-03-15'
  AND (ed.effective_to IS NULL OR ed.effective_to >= '2022-03-15');
```

This query is manageable. But now try: "Show me all department changes for everyone in Alice's management chain in 2022."

```sql
WITH RECURSIVE chain AS (
    SELECT emp_id, manager_id FROM employees WHERE emp_id = 101
    UNION ALL
    SELECT e.emp_id, e.manager_id
    FROM employees e JOIN chain c ON e.manager_id = c.emp_id
)
SELECT e.name, d1.name AS from_dept, d2.name AS to_dept,
       ed1.effective_to AS change_date
FROM chain c
JOIN employee_departments ed1 ON c.emp_id = ed1.emp_id
JOIN employee_departments ed2 ON c.emp_id = ed2.emp_id
    AND ed2.effective_from = ed1.effective_to + INTERVAL '1 day'
JOIN departments d1 ON ed1.dept_id = d1.dept_id
JOIN departments d2 ON ed2.dept_id = d2.dept_id
JOIN employees e ON c.emp_id = e.emp_id
WHERE ed1.effective_to BETWEEN '2022-01-01' AND '2022-12-31';
```

This is getting painful. Recursive CTE for the hierarchy, self-join on the temporal table to find transitions, and multiple department lookups.

### The Graph Version

```cypher
// Relationships carry temporal properties
CREATE (alice:Employee {name: 'Alice'})
CREATE (eng:Department {name: 'Engineering'})
CREATE (prod:Department {name: 'Product'})

CREATE (alice)-[:BELONGS_TO {from: date('2020-01-15'), to: date('2023-06-30')}]->(eng)
CREATE (alice)-[:BELONGS_TO {from: date('2023-07-01')}]->(prod)

// Query: department changes in Alice's chain during 2022
MATCH (alice:Employee {name: 'Alice'})<-[:REPORTS_TO*]-(report)
MATCH (report)-[bt1:BELONGS_TO]->(dept1)
MATCH (report)-[bt2:BELONGS_TO]->(dept2)
WHERE bt1.to IS NOT NULL
  AND bt1.to >= date('2022-01-01')
  AND bt1.to <= date('2022-12-31')
  AND bt2.from = bt1.to + duration({days: 1})
RETURN report.name, dept1.name AS from_dept, dept2.name AS to_dept, bt1.to AS change_date
```

The hierarchy traversal and the temporal query combine naturally. No recursive CTE. No self-join on the temporal table.

> **Think of it like this:** In the relational model, temporal data creates rows that must be matched and filtered by date ranges — essentially turning every query into a range scan puzzle. In a graph, temporal data lives on the relationships as properties, and the graph traversal handles the hierarchy. The two concerns (time and structure) stay separate instead of tangling together in a complex query.

### When the Relational Version Is Fine

For simple "what is the current value?" queries without hierarchy traversal, the relational temporal table is perfectly adequate. The date range filter is straightforward, indexes work well, and the query is readable. The graph version adds value specifically when you combine temporal data with graph traversal.

## 07. Pattern 5: Hierarchical Categories

### The Relational Version

Product categories, organizational divisions, document taxonomies — hierarchical categories are everywhere in enterprise data. The relational approach typically uses either adjacency lists (self-referencing table) or materialized paths.

```sql
-- Adjacency list approach
CREATE TABLE categories (
    cat_id INT PRIMARY KEY,
    name VARCHAR(100),
    parent_id INT REFERENCES categories(cat_id)
);

INSERT INTO categories VALUES (1, 'Electronics', NULL);
INSERT INTO categories VALUES (2, 'Computers', 1);
INSERT INTO categories VALUES (3, 'Laptops', 2);
INSERT INTO categories VALUES (4, 'Gaming Laptops', 3);
INSERT INTO categories VALUES (5, 'Business Laptops', 3);
INSERT INTO categories VALUES (6, 'Phones', 1);
INSERT INTO categories VALUES (7, 'Smartphones', 6);

-- Products belong to leaf categories
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    name VARCHAR(200),
    price DECIMAL(10,2),
    cat_id INT REFERENCES categories(cat_id)
);
```

### The Query That Hurts

"Find all products under the Electronics category, at any depth."

```sql
WITH RECURSIVE subcats AS (
    SELECT cat_id FROM categories WHERE name = 'Electronics'
    UNION ALL
    SELECT c.cat_id
    FROM categories c
    JOIN subcats s ON c.parent_id = s.cat_id
)
SELECT p.name, p.price, c.name AS category
FROM products p
JOIN categories c ON p.cat_id = c.cat_id
WHERE c.cat_id IN (SELECT cat_id FROM subcats);
```

Now try: "Find the full category path for each product" (Electronics > Computers > Laptops > Gaming Laptops).

```sql
WITH RECURSIVE cat_path AS (
    SELECT cat_id, name, parent_id, name::TEXT AS path
    FROM categories WHERE parent_id IS NULL

    UNION ALL

    SELECT c.cat_id, c.name, c.parent_id, cp.path || ' > ' || c.name
    FROM categories c
    JOIN cat_path cp ON c.parent_id = cp.cat_id
)
SELECT p.name AS product, cp.path AS category_path
FROM products p
JOIN cat_path cp ON p.cat_id = cp.cat_id;
```

Recursive CTEs again. String concatenation for path building. Performance degrades with deep hierarchies.

### The Graph Version

```cypher
// Create category hierarchy
CREATE (electronics:Category {name: 'Electronics'})
CREATE (computers:Category {name: 'Computers'})
CREATE (laptops:Category {name: 'Laptops'})
CREATE (gaming:Category {name: 'Gaming Laptops'})
CREATE (business:Category {name: 'Business Laptops'})
CREATE (phones:Category {name: 'Phones'})
CREATE (smartphones:Category {name: 'Smartphones'})

CREATE (computers)-[:SUBCATEGORY_OF]->(electronics)
CREATE (laptops)-[:SUBCATEGORY_OF]->(computers)
CREATE (gaming)-[:SUBCATEGORY_OF]->(laptops)
CREATE (business)-[:SUBCATEGORY_OF]->(laptops)
CREATE (phones)-[:SUBCATEGORY_OF]->(electronics)
CREATE (smartphones)-[:SUBCATEGORY_OF]->(phones)

// All products under Electronics
MATCH (p:Product)-[:IN_CATEGORY]->(c:Category)-[:SUBCATEGORY_OF*0..]->(electronics:Category {name: 'Electronics'})
RETURN p.name, p.price, c.name AS category

// Full category path for each product
MATCH (p:Product)-[:IN_CATEGORY]->(leaf:Category)-[:SUBCATEGORY_OF*0..]->(root:Category)
WHERE NOT (root)-[:SUBCATEGORY_OF]->()
WITH p, leaf, collect(root.name) + collect(leaf.name) AS path_parts
RETURN p.name, path_parts
```

The `SUBCATEGORY_OF*0..` syntax means "follow zero or more SUBCATEGORY_OF relationships" — giving you the entire subtree without recursion.

### When the Graph Is Better

| Operation | Relational | Graph | Winner |
| --- | --- | --- | --- |
| Find direct children | Simple query | Simple query | Tie |
| Find all descendants | Recursive CTE | `*0..` path | Graph |
| Find category path (breadcrumb) | Recursive CTE + string ops | Path collection | Graph |
| Move a subtree (re-parent) | Update parent_id (one row) | Delete + create relationship | Tie |
| Find products across categories | JOIN with recursive subquery | Pattern match | Graph |
| Category faceted search | Complex, often pre-computed | Natural traversal | Graph |

## 08. The Anti-Pattern: Don't Graph Everything

This is the most important section in this chapter. After seeing how cleanly these five patterns translate to graphs, the temptation is to graph your entire database. Do not do this.

Here is what should stay in your relational database:

### Transactional Data

```sql
-- This belongs in a relational database
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date TIMESTAMP,
    total DECIMAL(12,2),
    status VARCHAR(20)
);

CREATE TABLE order_lines (
    line_id INT PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10,2)
);
```

Orders are tabular. They have a fixed schema. They need ACID transactions. They are queried by simple filters (date ranges, status, customer). There is no benefit to graphing this data.

### Reporting and Aggregation Data

```sql
-- This belongs in a relational database (or a data warehouse)
SELECT DATE_TRUNC('month', order_date) AS month,
       SUM(total) AS revenue,
       COUNT(*) AS order_count,
       AVG(total) AS avg_order_value
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;
```

SQL excels at aggregation. Graph databases can aggregate, but it is not their strength. Keep your reporting queries in SQL.

### Configuration and Settings

```sql
-- This belongs in a relational database
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP
);
```

Simple key-value data with no relationships. No reason to graph this.

### The Rule of Thumb

Ask yourself: **"Is the value in the entities or in the connections?"**

- If the value is in the entities (what a customer ordered, how much revenue this month, what a setting is configured to), use relational.
- If the value is in the connections (who approved what, how entities relate to each other, what path exists between two things), use a graph.

> **Think of it like this:** A spreadsheet is great for tracking expenses. A mind map is great for brainstorming how ideas connect. You would not brainstorm in a spreadsheet, and you would not track expenses in a mind map. Use each tool for what it does best.

## 09. A Practical Translation Process

Here is a step-by-step process for evaluating your existing ERD and identifying what to graph.

### Step 1: List Your Pain Points

Identify the queries that are slow, complex, or impossible in your current relational schema. Look for:
- Recursive CTEs
- Queries with 5+ JOINs
- Queries that developers dread modifying
- Questions that users ask but nobody can answer with existing tools

### Step 2: Map to Patterns

For each pain point, check if it matches one of the five patterns:
- Self-referencing table? → Pattern 1
- Many-to-many junction that gets traversed? → Pattern 2
- Polymorphic association? → Pattern 3
- Temporal + hierarchical combination? → Pattern 4
- Deep category hierarchy? → Pattern 5

### Step 3: Estimate the Subgraph

The tables involved in these pain points are your graph candidates. Sketch the graph model on a whiteboard: what are the nodes? What are the relationships? What properties go where?

### Step 4: Plan the Sync

Your graph will likely need to stay in sync with your relational database (the "source of truth" for most data). Common sync strategies:

| Strategy | How It Works | Best For |
| --- | --- | --- |
| Change Data Capture (CDC) | Stream changes from relational DB to graph | Real-time sync, moderate complexity |
| Scheduled ETL | Periodic batch load from relational to graph | Low frequency, simple setup |
| Dual write | Application writes to both databases | Real-time, but requires careful error handling |
| Event-driven | Publish events; graph consumer updates | Microservices architecture |

### Step 5: Start Small

Pick one pain point. Build the graph for that one use case. Prove it works. Then expand.

## 10. Chapter Checklist

Before moving on, make sure you can answer these questions:

- [ ] Can you identify which of the five patterns exist in your current database?
- [ ] For each pattern, can you sketch the graph equivalent?
- [ ] Do you understand why transactional data should stay in a relational database?
- [ ] Can you articulate the "entities vs. connections" rule of thumb?
- [ ] Do you have a plan for keeping the graph and relational database in sync?

If you answered yes to all five, you are ready for Chapter 5, where we translate SQL queries to Cypher — the graph query language that will feel surprisingly familiar.
