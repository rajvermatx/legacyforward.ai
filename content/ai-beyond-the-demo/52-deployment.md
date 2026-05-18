---
title: "Deploying Agents to Production"
slug: "deployment"
description: "Deploying an agent to production is qualitatively different from deploying a traditional application. Agents are stateful, long-running, and non-deterministic — production deployment must account for these characteristics with infrastructure patterns that traditional DevOps playbooks do not cover."
section: "ai-beyond-the-demo"
order: 52
part: "Part V — Agentic Systems"
---

Part V — Agentic Systems

# Deploying Agents to Production

Development agents run in notebooks and local environments. Production agents operate under real user load, with real data, against real external systems, 24 hours a day. The gap between these environments is larger for agents than for almost any other category of software. Agents are stateful (they maintain context across steps), long-running (they may execute for minutes or hours), non-deterministic (the same input may produce different execution paths), and externally dependent (they call external services that can fail). Each of these characteristics requires specific infrastructure patterns to manage reliably.

### What You Will Learn

- The infrastructure requirements for production agent deployment
- State management patterns for long-running agents
- Scaling and reliability patterns for high-availability agent systems
- The operational runbook for deployed agents

## 52.1 Infrastructure Requirements

Production agents require infrastructure beyond what typical web applications need.

**Persistent state storage.** Unlike stateless web services that can be scaled horizontally and crashed without consequence, agents must be able to resume interrupted execution. This requires persistent storage for agent state: the goal, the current step, the results of completed steps, and the context assembled so far. When an agent process dies or a container restarts, the agent state must be recoverable from storage.

**Durable message queues.** Agent tasks received during processing failures must not be lost. Durable message queues (Kafka, RabbitMQ, AWS SQS, GCP Pub/Sub) ensure that tasks are delivered at least once and that unprocessed tasks survive system restarts. Message queues also provide the backpressure mechanism that prevents more tasks from being routed to an agent than it can process.

**Task schedulers.** For agents that need to resume suspended tasks (awaiting human approval, waiting for an external event), task schedulers manage the state machine: transitioning tasks from pending to in-progress to suspended to resumed to completed. Workflow orchestration tools (Temporal, Prefect, Airflow) provide this capability.

**External service circuit breakers.** Agents that call external services must handle unavailability gracefully. Circuit breakers detect when an external service is consistently failing and stop sending requests to it — allowing the agent to fail fast rather than waiting for timeouts on every call.

**Isolation between agent sessions.** Multiple concurrent agent sessions must be isolated from each other. Shared state or shared tool credentials between sessions create security vulnerabilities and functional interference.

## 52.2 State Management for Long-Running Agents

State management is the most complex infrastructure challenge in production agent deployment. Long-running agents accumulate state across many steps; that state must be managed carefully to prevent memory exhaustion, enable recovery from failures, and support debugging.

**State persistence checkpoints.** After each significant step (tool call completion, sub-task completion, user confirmation), persist the agent state to durable storage. Checkpoint frequency is a trade-off: more frequent checkpoints enable finer-grained recovery but add storage overhead and latency.

**Context window management.** As agents execute many steps, their in-context memory fills. Strategies for managing context growth in long-running agents: rolling window (keep only the N most recent steps in context), summarization (compress older context into summaries), selective retention (keep all results that are still relevant to the current step, discard results from completed sub-tasks).

**State schema versioning.** As the agent is updated, the schema of its state may change. Agents that are mid-execution when a new version is deployed must be able to resume using the new version's code with the old version's state. Define state migration strategies as part of each deployment.

**Audit log.** The complete sequence of states through which the agent passed — every reasoning step, every tool call, every tool result, every state transition — is the audit log. The audit log is essential for debugging failures and is required for compliance in regulated environments. It is not the same as the application log — it is a structured record of the agent's execution, queryable by task ID.

## 52.3 Scaling and Reliability

**Horizontal scaling.** Agent workers can be scaled horizontally — multiple instances processing tasks from a shared queue. Each task is assigned to one worker; the queue prevents duplicate processing. Horizontal scaling handles load spikes by adding workers and handles individual worker failures by reassigning unprocessed tasks.

**Task timeouts.** Every agent task must have a maximum execution time. Tasks that exceed their timeout are failed (with an appropriate error) rather than allowed to run indefinitely. Timeout values should be set based on the expected execution time distribution, not on the maximum possible execution time — tasks with pathological execution times should fail and be investigated, not allowed to run.

**Dead letter queues.** Tasks that fail after the maximum retry count are moved to a dead letter queue for investigation and manual recovery. Dead letter queues prevent failed tasks from blocking the main processing queue while preserving the task data for analysis.

**Graceful shutdown.** Agent workers must implement graceful shutdown: stop accepting new tasks, complete or checkpoint current tasks, and then shut down. Container orchestrators (Kubernetes) send a shutdown signal before killing containers; agents must handle this signal correctly to prevent data loss.

**Health checks.** Agent workers must expose health check endpoints that indicate whether the worker is able to process tasks. Health checks that verify not just process liveness but tool availability (can the agent reach the services its tools depend on?) catch degraded states that liveness checks miss.

## 52.4 The Operational Runbook

Every production agent deployment should have a runbook — a documented response guide for operational scenarios.

**Runbook contents:**

*System overview:* what the agent does, what external services it depends on, what data it reads and writes.

*Monitoring checklist:* what metrics to check, what thresholds indicate a problem, what the expected normal ranges are.

*Common failure scenarios:*
- Agent tasks are stuck in the queue → check worker health, verify queue consumer is running
- Agent tasks are failing at high rate → check error types in logs, identify whether failure is in a specific tool or across all tools
- Agent producing incorrect outputs → check recent model or prompt changes, run evaluation suite, compare against prior evaluation baseline
- External service unavailable → check circuit breaker status, verify service health, implement fallback if available

*Escalation path:* who to contact for each category of failure (infrastructure failures to on-call engineering, model quality failures to ML team, data failures to data engineering).

*Recovery procedures:* how to requeue failed tasks, how to replay from a checkpoint, how to roll back a problematic deployment.

A runbook written before production deployment is always more useful than one written during an incident. Agents that run without a runbook will eventually cause incidents that are diagnosed and recovered from slowly, at the cost of user trust and engineering time that could have been spent elsewhere.
