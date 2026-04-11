---
title: "Capstone 3: IT Dependency Mapper"
slug: "capstone-it-dependency-mapper"
description: >-
  Build an application dependency graph for impact analysis. Covers
  ingesting CMDB and service catalog data, building a dependency graph,
  blast radius queries, an impact analysis agent that answers "If the
  payment gateway goes down, what else breaks?", and automated
  dependency report generation.
section: "graph-ai"
order: 18
part: "Part 06 Capstones"
badges:
  - "CMDB"
  - "Impact Analysis"
  - "Dependency Graph"
---

# Capstone 3: IT Dependency Mapper

"If the payment gateway goes down, what else breaks?" Nobody in your organization can answer that question in under an hour. This capstone builds a system that answers it in seconds.

## The Scenario


![Diagram 1](/diagrams/graph-ai/capstone-03.svg)
A mid-size enterprise has 200+ applications, 50+ infrastructure components, and a CMDB (Configuration Management Database) that lives in a spreadsheet that was last updated 6 months ago. When an incident hits a critical system, the operations team calls around asking "Does your app use the payment gateway?" and "Are you connected to the Oracle database on server DB-PROD-03?"

The goal: ingest the service catalog and dependency data into a graph, then build an agent that answers impact questions — "What breaks if X goes down?" — with a complete blast radius report.

### What We Are Building

```
CMDB / Service Catalog           Analyst Question
       │                              │
       ▼                              ▼
┌──────────────┐              ┌─────────────────┐
│ Data          │              │ Impact Analysis  │
│ Ingestion     │              │ Agent            │
└──────┬───────┘              └───────┬─────────┘
       │                              │
       ▼                              ▼
┌──────────────────────────────────────────────┐
│              Dependency Graph                 │
│                                              │
│  Application ──DEPENDS_ON──> Application     │
│  Application ──RUNS_ON──> Server             │
│  Application ──USES──> Database              │
│  Team ──OWNS──> Application                  │
│  Application ──EXPOSES──> API                │
│  Application ──CONSUMES──> API               │
└──────────────────────────────────────────────┘
```

## Stage 1: The Dependency Graph Model

### Schema

| Node Type | Properties | Description |
| --- | --- | --- |
| **Application** | app_id, name, tier (1-4), status, environment, description | A software application or service |
| **Server** | server_id, hostname, ip_address, os, environment, datacenter | Physical or virtual server |
| **Database** | db_id, name, engine (postgres/oracle/mysql), server_id, size_gb | A database instance |
| **API** | api_id, name, version, protocol (REST/gRPC/SOAP), base_url | An API endpoint |
| **Team** | team_id, name, lead, contact_channel, escalation_path | An engineering or ops team |
| **LoadBalancer** | lb_id, name, type (ALB/NLB/F5), vip_address | Load balancer |
| **MessageQueue** | queue_id, name, platform (Kafka/RabbitMQ/SQS), cluster | Message broker |

### Relationship Types

| Relationship | From | To | Properties |
| --- | --- | --- | --- |
| **DEPENDS_ON** | Application | Application | dependency_type (hard/soft), protocol |
| **RUNS_ON** | Application | Server | port, process_name |
| **USES** | Application | Database | connection_pool_size, read_only |
| **EXPOSES** | Application | API | - |
| **CONSUMES** | Application | API | rate_limit, timeout_ms |
| **OWNS** | Team | Application | on_call_schedule |
| **FRONTS** | LoadBalancer | Application | health_check_path |
| **PUBLISHES_TO** | Application | MessageQueue | topic |
| **SUBSCRIBES_TO** | Application | MessageQueue | consumer_group |
| **HOSTED_ON** | Database | Server | - |

### Tier Definitions

| Tier | Description | SLA | Examples |
| --- | --- | --- | --- |
| 1 | Revenue-critical, customer-facing | 99.99% | Payment gateway, checkout, login |
| 2 | Business-critical, internal-facing | 99.95% | Order management, inventory, CRM |
| 3 | Important but not critical | 99.9% | Reporting, analytics, internal tools |
| 4 | Non-critical | 99% | Dev tools, documentation, sandboxes |

## Stage 2: Data Ingestion

```python
import csv
import json
from neo4j import GraphDatabase


class DependencyGraphBuilder:
    """Build the IT dependency graph from CMDB data."""

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
                "FOR (a:Application) REQUIRE a.app_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (s:Server) REQUIRE s.server_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (d:Database) REQUIRE d.db_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (api:API) REQUIRE api.api_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (t:Team) REQUIRE t.team_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (lb:LoadBalancer) REQUIRE lb.lb_id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS "
                "FOR (mq:MessageQueue) REQUIRE mq.queue_id IS UNIQUE",
                "CREATE INDEX IF NOT EXISTS "
                "FOR (a:Application) ON (a.name)",
                "CREATE INDEX IF NOT EXISTS "
                "FOR (a:Application) ON (a.tier)",
            ]
            for c in constraints:
                session.run(c)

    def load_applications(self, filepath: str):
        """Load application data from CSV."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (a:Application {app_id: row.app_id})
                SET a.name        = row.name,
                    a.tier        = toInteger(row.tier),
                    a.status      = row.status,
                    a.environment = row.environment,
                    a.description = row.description
            """, rows=rows)
        print(f"Loaded {len(rows)} applications")

    def load_servers(self, filepath: str):
        """Load server data from CSV."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (s:Server {server_id: row.server_id})
                SET s.hostname    = row.hostname,
                    s.ip_address  = row.ip_address,
                    s.os          = row.os,
                    s.environment = row.environment,
                    s.datacenter  = row.datacenter
            """, rows=rows)
        print(f"Loaded {len(rows)} servers")

    def load_databases(self, filepath: str):
        """Load database instances from CSV."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (d:Database {db_id: row.db_id})
                SET d.name    = row.name,
                    d.engine  = row.engine,
                    d.size_gb = toFloat(row.size_gb)
                WITH d, row
                MATCH (s:Server {server_id: row.server_id})
                MERGE (d)-[:HOSTED_ON]->(s)
            """, rows=rows)
        print(f"Loaded {len(rows)} databases")

    def load_dependencies(self, filepath: str):
        """Load application dependencies from CSV.

        CSV columns: source_app_id, target_app_id, dependency_type, protocol
        """
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MATCH (source:Application {app_id: row.source_app_id})
                MATCH (target:Application {app_id: row.target_app_id})
                MERGE (source)-[r:DEPENDS_ON]->(target)
                SET r.dependency_type = row.dependency_type,
                    r.protocol        = row.protocol
            """, rows=rows)
        print(f"Loaded {len(rows)} dependencies")

    def load_runs_on(self, filepath: str):
        """Load application-to-server mappings."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MATCH (a:Application {app_id: row.app_id})
                MATCH (s:Server {server_id: row.server_id})
                MERGE (a)-[r:RUNS_ON]->(s)
                SET r.port         = row.port,
                    r.process_name = row.process_name
            """, rows=rows)
        print(f"Loaded {len(rows)} app-server mappings")

    def load_uses_db(self, filepath: str):
        """Load application-to-database connections."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MATCH (a:Application {app_id: row.app_id})
                MATCH (d:Database {db_id: row.db_id})
                MERGE (a)-[r:USES]->(d)
                SET r.connection_pool_size =
                        toInteger(row.connection_pool_size),
                    r.read_only = (row.read_only = 'true')
            """, rows=rows)
        print(f"Loaded {len(rows)} app-database connections")

    def load_team_ownership(self, filepath: str):
        """Load team-to-application ownership."""
        with open(filepath) as f:
            rows = list(csv.DictReader(f))

        with self.driver.session() as session:
            session.run("""
                UNWIND $rows AS row
                MERGE (t:Team {team_id: row.team_id})
                SET t.name            = row.team_name,
                    t.lead            = row.lead,
                    t.contact_channel = row.contact_channel
                WITH t, row
                MATCH (a:Application {app_id: row.app_id})
                MERGE (t)-[r:OWNS]->(a)
                SET r.on_call_schedule = row.on_call_schedule
            """, rows=rows)
        print(f"Loaded {len(rows)} team ownerships")

    def close(self):
        self.driver.close()
```

## Stage 3: Blast Radius Queries

The core value of the dependency graph is answering "What breaks if X goes down?" These are blast radius queries — starting from a failed component and traversing outward to find everything affected.

```python
from dataclasses import dataclass, field


@dataclass
class ImpactReport:
    """Report of what is affected when a component goes down."""
    failed_component: str
    failed_type: str
    total_affected: int = 0
    affected_by_tier: dict = field(default_factory=dict)
    affected_apps: list[dict] = field(default_factory=list)
    affected_teams: list[dict] = field(default_factory=list)
    critical_paths: list[list[str]] = field(default_factory=list)
    shared_infrastructure: list[dict] = field(default_factory=list)


class ImpactAnalyzer:
    """Analyze the blast radius of component failures."""

    def __init__(self, neo4j_driver):
        self.driver = neo4j_driver

    def analyze_application_failure(
        self, app_name: str
    ) -> ImpactReport:
        """Determine blast radius if an application goes down."""
        report = ImpactReport(
            failed_component=app_name,
            failed_type="Application"
        )

        with self.driver.session() as session:
            # 1. Find all directly and transitively dependent apps
            result = session.run("""
                MATCH (failed:Application {name: $name})
                MATCH path = (dependent:Application)
                    -[:DEPENDS_ON*1..5]->(failed)
                WHERE dependent <> failed
                WITH DISTINCT dependent,
                     length(shortestPath(
                         (dependent)-[:DEPENDS_ON*]->(failed)
                     )) AS distance
                RETURN dependent.app_id AS app_id,
                       dependent.name AS name,
                       dependent.tier AS tier,
                       dependent.status AS status,
                       distance
                ORDER BY dependent.tier, distance
            """, name=app_name)

            for r in result:
                report.affected_apps.append(dict(r))

            report.total_affected = len(report.affected_apps)

            # Count by tier
            for app in report.affected_apps:
                tier = app["tier"]
                report.affected_by_tier[f"Tier {tier}"] = \
                    report.affected_by_tier.get(f"Tier {tier}", 0) + 1

            # 2. Find affected teams
            result = session.run("""
                MATCH (failed:Application {name: $name})
                MATCH (dependent:Application)
                    -[:DEPENDS_ON*1..5]->(failed)
                MATCH (team:Team)-[:OWNS]->(dependent)
                WITH DISTINCT team,
                     collect(dependent.name) AS affected_apps
                RETURN team.name AS team_name,
                       team.lead AS lead,
                       team.contact_channel AS channel,
                       affected_apps
                ORDER BY size(affected_apps) DESC
            """, name=app_name)

            report.affected_teams = [dict(r) for r in result]

            # 3. Find critical paths (paths through Tier 1 apps)
            result = session.run("""
                MATCH (failed:Application {name: $name})
                MATCH path = (critical:Application {tier: 1})
                    -[:DEPENDS_ON*1..5]->(failed)
                RETURN [n IN nodes(path) | n.name] AS path_nodes
                ORDER BY length(path)
                LIMIT 10
            """, name=app_name)

            report.critical_paths = [
                r["path_nodes"] for r in result
            ]

            # 4. Find shared infrastructure at risk
            result = session.run("""
                MATCH (failed:Application {name: $name})
                MATCH (failed)-[:RUNS_ON]->(server:Server)
                OPTIONAL MATCH (co:Application)-[:RUNS_ON]->(server)
                WHERE co <> failed
                RETURN server.hostname AS server,
                       collect(co.name) AS collocated_apps
            """, name=app_name)

            report.shared_infrastructure = [dict(r) for r in result]

        return report

    def analyze_server_failure(
        self, hostname: str
    ) -> ImpactReport:
        """Determine blast radius if a server goes down."""
        report = ImpactReport(
            failed_component=hostname,
            failed_type="Server"
        )

        with self.driver.session() as session:
            # Find all apps running on this server + their dependents
            result = session.run("""
                MATCH (server:Server {hostname: $hostname})
                MATCH (direct:Application)-[:RUNS_ON]->(server)
                OPTIONAL MATCH (dependent:Application)
                    -[:DEPENDS_ON*1..5]->(direct)
                WITH collect(DISTINCT direct) + collect(DISTINCT dependent)
                    AS all_affected
                UNWIND all_affected AS app
                WHERE app IS NOT NULL
                RETURN DISTINCT app.app_id AS app_id,
                       app.name AS name,
                       app.tier AS tier
                ORDER BY app.tier
            """, hostname=hostname)

            for r in result:
                report.affected_apps.append(dict(r))

            report.total_affected = len(report.affected_apps)

            for app in report.affected_apps:
                tier = app["tier"]
                report.affected_by_tier[f"Tier {tier}"] = \
                    report.affected_by_tier.get(f"Tier {tier}", 0) + 1

            # Find databases on this server
            result = session.run("""
                MATCH (server:Server {hostname: $hostname})
                MATCH (db:Database)-[:HOSTED_ON]->(server)
                OPTIONAL MATCH (app:Application)-[:USES]->(db)
                RETURN db.name AS database,
                       db.engine AS engine,
                       collect(app.name) AS dependent_apps
            """, hostname=hostname)

            report.shared_infrastructure = [dict(r) for r in result]

        return report

    def analyze_database_failure(
        self, db_name: str
    ) -> ImpactReport:
        """Determine blast radius if a database goes down."""
        report = ImpactReport(
            failed_component=db_name,
            failed_type="Database"
        )

        with self.driver.session() as session:
            result = session.run("""
                MATCH (db:Database {name: $name})
                MATCH (direct:Application)-[:USES]->(db)
                OPTIONAL MATCH (dependent:Application)
                    -[:DEPENDS_ON*1..5]->(direct)
                WITH collect(DISTINCT direct) + collect(DISTINCT dependent)
                    AS all_affected
                UNWIND all_affected AS app
                WHERE app IS NOT NULL
                RETURN DISTINCT app.app_id AS app_id,
                       app.name AS name,
                       app.tier AS tier
                ORDER BY app.tier
            """, name=db_name)

            for r in result:
                report.affected_apps.append(dict(r))
            report.total_affected = len(report.affected_apps)

            for app in report.affected_apps:
                tier = app["tier"]
                report.affected_by_tier[f"Tier {tier}"] = \
                    report.affected_by_tier.get(f"Tier {tier}", 0) + 1

        return report

    def format_report(self, report: ImpactReport) -> str:
        """Format an impact report as readable text."""
        lines = [
            f"=== IMPACT ANALYSIS: {report.failed_type} "
            f"'{report.failed_component}' ===\n",
            f"Total affected applications: {report.total_affected}",
        ]

        if report.affected_by_tier:
            lines.append("\nAffected by tier:")
            for tier, count in sorted(report.affected_by_tier.items()):
                lines.append(f"  {tier}: {count} applications")

        if report.critical_paths:
            lines.append(f"\nCritical paths "
                         f"({len(report.critical_paths)} "
                         f"Tier 1 apps affected):")
            for path in report.critical_paths:
                lines.append(f"  {' -> '.join(path)}")

        if report.affected_teams:
            lines.append(f"\nTeams to notify "
                         f"({len(report.affected_teams)}):")
            for team in report.affected_teams:
                lines.append(
                    f"  {team['team_name']} "
                    f"(lead: {team['lead']}, "
                    f"channel: {team['channel']})")
                lines.append(
                    f"    Affected apps: "
                    f"{', '.join(team['affected_apps'])}")

        if report.shared_infrastructure:
            lines.append("\nShared infrastructure at risk:")
            for infra in report.shared_infrastructure:
                lines.append(f"  {infra}")

        return "\n".join(lines)
```

## Stage 4: The Impact Analysis Agent

```python
import anthropic
import json
from neo4j import GraphDatabase

client = anthropic.Anthropic()


TOOLS = [
    {
        "name": "blast_radius",
        "description": (
            "Calculate the blast radius of a component failure. "
            "Returns all affected applications, teams, and "
            "critical paths."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "component_name": {
                    "type": "string",
                    "description": "Name of the failing component"
                },
                "component_type": {
                    "type": "string",
                    "enum": ["application", "server", "database"],
                    "description": "Type of the failing component"
                }
            },
            "required": ["component_name", "component_type"]
        }
    },
    {
        "name": "find_dependencies",
        "description": (
            "Find what an application depends on (upstream) or "
            "what depends on it (downstream)."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "app_name": {
                    "type": "string",
                    "description": "Application name"
                },
                "direction": {
                    "type": "string",
                    "enum": ["upstream", "downstream"],
                    "description": "upstream = what it depends on, "
                                 "downstream = what depends on it"
                },
                "max_depth": {
                    "type": "integer",
                    "default": 3,
                    "description": "Maximum traversal depth"
                }
            },
            "required": ["app_name", "direction"]
        }
    },
    {
        "name": "get_app_details",
        "description": (
            "Get detailed information about an application: "
            "its team, servers, databases, and connections."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "app_name": {
                    "type": "string",
                    "description": "Application name"
                }
            },
            "required": ["app_name"]
        }
    },
    {
        "name": "find_single_points_of_failure",
        "description": (
            "Find components that, if they fail, would take down "
            "multiple Tier 1 or Tier 2 applications."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "min_affected_tier1": {
                    "type": "integer",
                    "default": 2,
                    "description": "Minimum Tier 1 apps affected "
                                 "to flag as SPOF"
                }
            },
            "required": []
        }
    },
    {
        "name": "compare_change_risk",
        "description": (
            "Compare the risk of deploying changes to different "
            "applications based on their dependency graphs."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "app_names": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of application names to compare"
                }
            },
            "required": ["app_names"]
        }
    },
    {
        "name": "run_cypher",
        "description": (
            "Run a custom Cypher query against the dependency graph."
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


class DependencyAgent:
    """Agent that answers IT dependency and impact questions."""

    def __init__(self, neo4j_uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(
            neo4j_uri, auth=(user, password)
        )
        self.analyzer = ImpactAnalyzer(self.driver)

    def ask(self, question: str) -> str:
        """Ask a dependency or impact question."""
        messages = [{"role": "user", "content": question}]

        system_prompt = """You are an IT dependency analysis agent.
You have access to a graph database mapping all applications, servers,
databases, and their dependencies.

When answering questions:
1. Be specific — name applications, teams, servers.
2. Highlight Tier 1 (revenue-critical) impacts first.
3. When reporting blast radius, always mention which teams
   need to be notified.
4. Suggest mitigation strategies when appropriate.
5. Use the tools to gather data before synthesizing an answer."""

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
        """Route tool calls to implementations."""
        if name == "blast_radius":
            return self._blast_radius(**params)
        elif name == "find_dependencies":
            return self._find_dependencies(**params)
        elif name == "get_app_details":
            return self._get_app_details(**params)
        elif name == "find_single_points_of_failure":
            return self._find_spof(**params)
        elif name == "compare_change_risk":
            return self._compare_risk(**params)
        elif name == "run_cypher":
            return self._run_cypher(**params)
        return {"error": f"Unknown tool: {name}"}

    def _blast_radius(
        self, component_name: str, component_type: str
    ) -> dict:
        """Calculate blast radius."""
        if component_type == "application":
            report = self.analyzer.analyze_application_failure(
                component_name)
        elif component_type == "server":
            report = self.analyzer.analyze_server_failure(
                component_name)
        elif component_type == "database":
            report = self.analyzer.analyze_database_failure(
                component_name)
        else:
            return {"error": f"Unknown type: {component_type}"}

        return {
            "failed": report.failed_component,
            "type": report.failed_type,
            "total_affected": report.total_affected,
            "by_tier": report.affected_by_tier,
            "affected_apps": report.affected_apps,
            "teams": report.affected_teams,
            "critical_paths": report.critical_paths,
            "infrastructure": report.shared_infrastructure,
            "formatted": self.analyzer.format_report(report)
        }

    def _find_dependencies(
        self, app_name: str, direction: str, max_depth: int = 3
    ) -> dict:
        """Find upstream or downstream dependencies."""
        with self.driver.session() as session:
            if direction == "upstream":
                result = session.run("""
                    MATCH (app:Application {name: $name})
                    MATCH path = (app)-[:DEPENDS_ON*1.."""
                    + str(max_depth) + """]->(upstream)
                    RETURN upstream.name AS name,
                           upstream.tier AS tier,
                           length(path) AS distance
                    ORDER BY distance, upstream.tier
                """, name=app_name)
            else:
                result = session.run("""
                    MATCH (app:Application {name: $name})
                    MATCH path = (downstream:Application)
                        -[:DEPENDS_ON*1..""" + str(max_depth)
                    + """]->(app)
                    RETURN downstream.name AS name,
                           downstream.tier AS tier,
                           length(path) AS distance
                    ORDER BY distance, downstream.tier
                """, name=app_name)

            deps = [dict(r) for r in result]
            return {
                "app": app_name,
                "direction": direction,
                "count": len(deps),
                "dependencies": deps
            }

    def _get_app_details(self, app_name: str) -> dict:
        """Get comprehensive application details."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (a:Application {name: $name})
                OPTIONAL MATCH (t:Team)-[o:OWNS]->(a)
                OPTIONAL MATCH (a)-[:RUNS_ON]->(s:Server)
                OPTIONAL MATCH (a)-[u:USES]->(d:Database)
                OPTIONAL MATCH (a)-[:DEPENDS_ON]->(upstream:Application)
                OPTIONAL MATCH (downstream:Application)-[:DEPENDS_ON]->(a)
                RETURN a {.*} AS app,
                       collect(DISTINCT {team: t.name, lead: t.lead,
                           channel: t.contact_channel}) AS teams,
                       collect(DISTINCT s.hostname) AS servers,
                       collect(DISTINCT {db: d.name, engine: d.engine,
                           read_only: u.read_only}) AS databases,
                       collect(DISTINCT upstream.name) AS depends_on,
                       collect(DISTINCT downstream.name) AS depended_by
            """, name=app_name)

            record = result.single()
            if not record:
                return {"error": f"Application '{app_name}' not found"}
            return dict(record)

    def _find_spof(self, min_affected_tier1: int = 2) -> dict:
        """Find single points of failure."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (app:Application)
                MATCH (dependent:Application {tier: 1})
                    -[:DEPENDS_ON*1..3]->(app)
                WITH app, count(DISTINCT dependent) AS tier1_count,
                     collect(DISTINCT dependent.name) AS tier1_apps
                WHERE tier1_count >= $min_count
                RETURN app.name AS spof_app,
                       app.tier AS spof_tier,
                       tier1_count,
                       tier1_apps
                ORDER BY tier1_count DESC
            """, min_count=min_affected_tier1)

            spofs = [dict(r) for r in result]
            return {
                "spof_count": len(spofs),
                "single_points_of_failure": spofs
            }

    def _compare_risk(self, app_names: list[str]) -> dict:
        """Compare deployment risk across applications."""
        results = []
        for app_name in app_names:
            with self.driver.session() as session:
                result = session.run("""
                    MATCH (app:Application {name: $name})
                    OPTIONAL MATCH (d:Application)
                        -[:DEPENDS_ON*1..3]->(app)
                    WITH app,
                         count(DISTINCT d) AS dependent_count,
                         count(DISTINCT
                             CASE WHEN d.tier = 1 THEN d END
                         ) AS tier1_count
                    RETURN app.name AS name,
                           app.tier AS tier,
                           dependent_count,
                           tier1_count
                """, name=app_name)

                record = result.single()
                if record:
                    risk_score = (
                        record["tier1_count"] * 10
                        + record["dependent_count"] * 2
                        + (5 - (record["tier"] or 4))
                    )
                    results.append({
                        **dict(record),
                        "risk_score": risk_score
                    })

        results.sort(key=lambda x: x["risk_score"], reverse=True)
        return {"comparisons": results}

    def _run_cypher(self, query: str) -> dict:
        """Execute a custom Cypher query."""
        with self.driver.session() as session:
            result = session.run(query)
            records = [dict(r) for r in result]
            return {"result_count": len(records), "results": records[:25]}

    def close(self):
        self.driver.close()


# ── Run the agent ────────────────────────────────────────────

if __name__ == "__main__":
    agent = DependencyAgent(
        neo4j_uri="bolt://localhost:7687",
        neo4j_user="neo4j",
        neo4j_password="password"
    )

    questions = [
        "If the payment gateway goes down, what else breaks?",
        "What are the single points of failure in our infrastructure?",
        "We need to deploy changes to the order service and the "
        "inventory service this weekend. Which is riskier?",
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
| Graph model | Dependency-optimized schema with tiers and ownership | Chapter 4, 8 |
| Data ingestion | Batch load from CSV with constraints | Chapter 5 |
| Blast radius queries | Multi-hop dependency traversal with tier-aware reporting | Chapter 6, 12 |
| Impact analysis agent | Tool-using agent for dependency questions | Chapter 11 |

### Key Queries This System Answers

| Question | Query Pattern |
| --- | --- |
| "What breaks if X goes down?" | Reverse traversal of DEPENDS_ON from X |
| "What does X depend on?" | Forward traversal of DEPENDS_ON from X |
| "What are our single points of failure?" | Find nodes with many Tier 1 dependents |
| "Which deploy is riskier?" | Compare dependent count and tier impact |
| "Which teams need to know about this outage?" | Traverse DEPENDS_ON then OWNS to find teams |
| "Do these two apps share any infrastructure?" | Find common Server/Database nodes |

### What to Do Next

1. Connect to real CMDB data via API instead of CSV
2. Add the CDC pipeline (Chapter 13) to keep dependencies current as infrastructure changes
3. Build automated discovery: scan network traffic and API calls to detect undocumented dependencies
4. Integrate with incident management (PagerDuty, OpsGenie) to auto-notify affected teams
5. Add change advisory board (CAB) integration to automatically assess deployment risk
