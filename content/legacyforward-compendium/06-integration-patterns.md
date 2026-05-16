---
title: "Integration Patterns for AI-Ready Systems"
slug: "integration-patterns"
description: "How AI connects to enterprise systems — the four integration patterns, when to use each, and the failure modes that appear when the wrong pattern is chosen."
section: "legacyforward-compendium"
order: 6
part: "Part I — The Enterprise Foundation"
---

Part I — The Enterprise Foundation

# Integration Patterns for AI-Ready Systems

An AI model without an integration strategy is a research project. Production AI requires data flowing in and results flowing out through integration points that are reliable, governed, and maintainable. Enterprise architects have a vocabulary for these integrations — APIs, ETL, CDC, event streaming — and AI practitioners who do not share that vocabulary consistently make integration decisions that the infrastructure team later has to undo.

### What You Will Learn

- The four primary integration patterns used to connect AI systems to enterprise data
- When each pattern is appropriate based on latency, volume, and governance requirements
- The anti-patterns that consistently cause AI integration failures
- How to document integration requirements in a format that infrastructure teams can act on

## 6.1 The Four Integration Patterns

**Pattern 1: Batch ETL.** Data is extracted from source systems on a schedule (hourly, daily, weekly), transformed into a consistent format, and loaded into a data store the AI system can access. Appropriate when: data freshness requirements are measured in hours or days, source systems cannot support real-time extraction without performance impact, and data volumes are large enough that streaming is impractical. Common in training data pipelines and historical analytics. Failure mode: the batch job fails silently, the AI trains on stale data, and nobody notices until the model's predictions drift from reality.

**Pattern 2: API-mediated real-time access.** The AI system calls source system APIs at inference time to retrieve current data. Appropriate when: data freshness is required at inference time (the AI needs the current state of a record, not yesterday's state), source systems expose reliable APIs, and request volumes are within API rate limits. Common in decision-support AI where the recommendation must reflect current system state. Failure mode: source system API latency or reliability degrades, causing AI response times to degrade or fail.

**Pattern 3: Change Data Capture (CDC).** Changes in source systems (inserts, updates, deletes) are captured at the database level and streamed to a downstream data platform that the AI system accesses. Appropriate when: AI needs near-real-time data without burdening source systems with API calls, source systems support CDC (most modern relational databases do), and downstream processing can tolerate CDC's event-based data model. Common in operational AI where recommendations must reflect recent activity. Failure mode: CDC lag during high-volume periods causes the AI to operate on temporarily stale data.

**Pattern 4: Event streaming.** Source systems publish events to a streaming platform (Kafka, Pub/Sub, EventBridge) as they occur. AI systems subscribe to relevant event streams and process events as they arrive. Appropriate when: AI must react to events in real time, multiple downstream consumers need the same events, and the event-driven architecture is already established in the organization. Common in fraud detection, real-time personalization, and operational alerting. Failure mode: event schema changes in the source system break the AI's event consumer without warning.

## 6.2 Write-Back Integration

AI that produces recommendations or decisions must often write results back to enterprise systems — updating a record, triggering a workflow, logging a decision, or alerting a human. Write-back integration is more complex than read integration because it requires:

**Idempotency** — if the same write is attempted twice (due to retry logic), the result should be the same as if it were attempted once. Enterprise transactions are not always naturally idempotent, and write-back layers must be designed to handle duplicates.

**Failure handling** — if the write-back fails, the AI's result must not be lost. The failure handling strategy (retry with backoff, dead-letter queue, manual review queue) must be defined before the system goes to production.

**Audit trail** — regulated industries require that every AI-assisted decision be logged with enough context to reconstruct what the AI recommended and why. The write-back layer is where this logging happens.

**Rollback** — some AI decisions can be reversed if they are later found to be incorrect. The write-back layer must support rollback where the business process permits it.

## 6.3 Integration Anti-Patterns

**Direct database connections.** AI systems that connect directly to production databases rather than through designated integration interfaces create availability risks, bypass access controls, and make schema changes operationally dangerous. Always use designated interfaces (APIs, CDC, batch exports) rather than direct database connections.

**Implicit schema coupling.** AI systems that parse raw output from source systems without a schema contract become brittle. When the source system changes its output format, the AI breaks. Define explicit schema contracts and validate against them at the integration boundary.

**Missing retry and backoff.** AI systems that call external APIs without retry logic fail at the rate of the least reliable API they depend on. Implement retry with exponential backoff and circuit breakers on all external calls.

**Undocumented integration inventory.** AI systems that accumulate integrations without documentation become impossible to change safely. Maintain an integration inventory that documents every source, every target, the access mechanism, the data contract, and the owner.

## 6.4 Documenting Integration Requirements

When handing integration requirements to an infrastructure team, the minimum documentation set is:

- **Source system** — name, technology, owner, and access method
- **Data required** — specific fields, entities, and filters
- **Freshness requirement** — maximum acceptable data lag at inference time
- **Volume** — expected request volume and data volume
- **Compliance classification** — data sensitivity and governance requirements
- **Failure behavior** — what the AI system does when the integration is unavailable

This documentation is not overhead — it is the specification that prevents the infrastructure team from building the wrong thing and prevents the AI team from discovering in production that their integration assumptions were wrong.
