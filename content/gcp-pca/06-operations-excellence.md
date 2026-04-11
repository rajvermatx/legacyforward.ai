---
title: "Ensuring Solution and Operations Excellence"
slug: "operations-excellence"
description: "Well-Architected Framework operational excellence, observability (monitoring, logging, alerting),
    deployment and release management, reliability engineering, chaos engineering, and load testing."
section: "gcp-pca"
order: 6
badges:
  - "Observability"
  - "SRE Principles"
  - "Chaos Engineering"
  - "Release Management"
  - "Load Testing"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-pca/06-operations-excellence.ipynb"
---

## 01. Cloud Monitoring

### Metrics and Dashboards

Cloud Monitoring collects metrics from all GCP services automatically. You can also send **custom metrics** via the Monitoring API or OpenTelemetry.

| Metric Type | Source | Examples | Retention |
| --- | --- | --- | --- |
| **GCP System Metrics** | Automatic from GCP services | CPU utilization, disk IOPS, LB latency | 24 months |
| **Custom Metrics** | Application code via API/OTEL | Business KPIs, queue depth, cache hit rate | 24 months |
| **Agent Metrics** | Ops Agent on VMs | Memory, processes, system logs | 24 months |
| **External Metrics** | Prometheus, Datadog, etc. | Third-party application metrics | Varies |

```
# Install Ops Agent on a Compute Engine VM
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install

# Write a custom metric using gcloud
gcloud monitoring metrics-descriptors create \
    custom.googleapis.com/myapp/queue_depth \
    --type=GAUGE \
    --value-type=INT64 \
    --description="Number of items in the processing queue"

# Create a dashboard from a JSON definition
gcloud monitoring dashboards create \
    --config-from-file=dashboard.json
```

### Alerting Policies

Alerting policies define conditions, notification channels, and documentation for automated incident detection.

```
# Create an alerting policy for high CPU
gcloud monitoring policies create \
    --display-name="High CPU Alert" \
    --condition-display-name="CPU > 80% for 5 min" \
    --condition-filter='metric.type="compute.googleapis.com/instance/cpu/utilization"
        AND resource.type="gce_instance"' \
    --condition-threshold-value=0.8 \
    --condition-threshold-comparison=COMPARISON_GT \
    --condition-threshold-duration=300s \
    --notification-channels=projects/my-project/notificationChannels/12345 \
    --documentation="Investigate high CPU. Check for runaway processes or traffic spike."
```

### Uptime Checks

Uptime checks probe endpoints from multiple global locations. They detect outages before users report them. Uptime checks can verify HTTP response codes, response body content, and SSL certificate expiration.

>**Best Practice:** **Combine uptime checks with SLO monitoring.** An uptime check tells you if the service is reachable. An SLO tells you if the service is meeting its quality targets. Both are needed for comprehensive reliability monitoring.

## 02. Cloud Logging

### Log Types

| Log Type | What It Captures | Default Retention | Can Disable? |
| --- | --- | --- | --- |
| **Admin Activity** | API calls that modify resources (create, delete, update) | 400 days | No (always on) |
| **Data Access** | API calls that read data or metadata | 30 days | Yes (off by default for most) |
| **System Event** | Google-initiated actions (live migration, maintenance) | 400 days | No |
| **Policy Denied** | Denied actions due to security policy violations | 30 days | No |
| **Platform Logs** | GKE, Cloud Run, App Engine application logs | 30 days | Yes |

>**Exam Tip:** **Data Access logs are off by default for most services.** If a compliance question asks about tracking who read BigQuery data or Cloud Storage objects, you must enable Data Access audit logs. Admin Activity logs are always enabled and cannot be disabled.

### Log Sinks and Routing

Log sinks export logs to external destinations for long-term storage, analysis, or SIEM integration.

| Destination | Use Case | Retention |
| --- | --- | --- |
| **Cloud Storage** | Long-term archival, compliance | Configurable (lifecycle policies) |
| **BigQuery** | Log analytics, SQL queries on logs | Configurable (table expiration) |
| **Pub/Sub** | Real-time streaming to SIEM or custom pipeline | N/A (real-time) |
| **Another Project** | Centralized logging across org | Depends on destination |

```
# Create a log sink to BigQuery for audit logs
gcloud logging sinks create audit-to-bq \
    bigquery.googleapis.com/projects/my-project/datasets/audit_logs \
    --log-filter='logName:"cloudaudit.googleapis.com"' \
    --use-partitioned-tables

# Create a log sink to Cloud Storage for long-term archival
gcloud logging sinks create all-logs-archive \
    storage.googleapis.com/my-project-log-archive \
    --log-filter='severity >= WARNING'

# Create a log-based metric for error counting
gcloud logging metrics create api-errors \
    --description="Count of API 5xx errors" \
    --log-filter='resource.type="cloud_run_revision"
        AND httpRequest.status >= 500'
```

## 03. SRE Principles

### SLIs, SLOs, and SLAs

| Concept | Definition | Example | Who Defines It |
| --- | --- | --- | --- |
| **SLI (Service Level Indicator)** | A measurable metric of service quality | Request latency p99, error rate, availability % | Engineering team |
| **SLO (Service Level Objective)** | A target value or range for an SLI | "99.9% of requests complete in <200ms" | Engineering + product |
| **SLA (Service Level Agreement)** | A contractual commitment with consequences | "99.9% uptime or credit refund" | Business + legal |

>**Key Concept:** **SLOs should be stricter than SLAs.** If your SLA promises 99.9% uptime, your internal SLO should target 99.95%. This gives you an error budget buffer before violating the contractual SLA. Cloud Monitoring supports creating SLO monitors with burn-rate alerting.

### Error Budgets

An **error budget** is the amount of unreliability your SLO allows. If your SLO is 99.9% availability, your error budget is 0.1% (about 43 minutes per month of allowed downtime).

-   **Budget remaining** — Continue deploying new features, take calculated risks.
-   **Budget exhausted** — Freeze deployments, focus on reliability improvements, reduce change velocity.
-   **Budget policy** — Define what happens at 50%, 75%, 100% budget consumption. Automate alerts.

```
# Create an SLO in Cloud Monitoring
gcloud monitoring slo create \
    --service=my-cloud-run-service \
    --display-name="Availability SLO" \
    --goal=0.999 \
    --rolling-period=30d \
    --request-based-sli-good-total-ratio-threshold-performance \
    --good-service-filter='metric.type="run.googleapis.com/request_count"
        AND metric.labels.response_code_class="2xx"' \
    --total-service-filter='metric.type="run.googleapis.com/request_count"'
```

## 04. Reliability Engineering

### Chaos Engineering

Chaos engineering is the practice of **intentionally injecting failures** into a system to test its resilience. The PCA exam tests your understanding of when and how to apply chaos engineering.

💥

#### Failure Injection

Terminate VMs, kill pods, introduce network latency, simulate disk failures. Validate that autoscaling, health checks, and failover work as designed.

🔬

#### Game Days

Scheduled chaos experiments with the team present. Practice incident response procedures. Document findings and remediation actions.

📊

#### Steady-State Hypothesis

Define what "normal" looks like before injecting chaos. Measure whether the system returns to steady state after the experiment.

-   **Start small** — Begin with non-production environments, graduate to production.
-   **Have a rollback plan** — Every chaos experiment must be reversible.
-   **Monitor continuously** — Watch SLIs during experiments to detect cascading failures.
-   **Automate over time** — Move from manual game days to automated chaos frameworks (Chaos Monkey, Litmus).

### Load Testing

Load testing validates that your architecture handles expected and peak traffic. On GCP, common approaches include:

| Tool | Type | Best For | GCP Integration |
| --- | --- | --- | --- |
| **Locust** | Open-source, Python | HTTP/gRPC, scriptable | Run on GKE or Compute Engine |
| **k6 (Grafana)** | Open-source, JS | HTTP, developer-friendly | Run on GKE, export to Cloud Monitoring |
| **JMeter** | Open-source, Java | Complex protocols, GUI | Run on Compute Engine |
| **Cloud Tasks + Pub/Sub** | GCP-native | Async load generation | Native integration |

>**Important:** **Always load test against production-like environments.** Testing against an under-provisioned staging environment does not validate production resilience. Use the same machine types, autoscaling configurations, and database tiers as production.

## 05. Release Management

### Release Strategies on GCP

| Strategy | GCP Service | Configuration | Monitoring |
| --- | --- | --- | --- |
| **Canary (Cloud Run)** | Cloud Run traffic splitting | `--to-revisions=new=10,old=90` | Error rate, latency by revision |
| **Canary (GKE)** | Cloud Deploy canary strategy | Percentage-based promotion in pipeline | Custom metrics, SLO burn rate |
| **Blue/Green (GKE)** | Service routing (Istio/ASM) | VirtualService weight shifting | Service mesh telemetry |
| **Rolling (MIG)** | Instance Group Updater | `--max-surge=3 --max-unavailable=0` | Health check pass rate |
| **Feature Flags** | Application-level (LaunchDarkly, custom) | Conditional code paths | Per-feature error rates |

### Incident Response

A structured incident response process is essential for operations excellence:

1.  **Detect** — Alerting policies, uptime checks, SLO burn-rate alerts trigger notifications.
2.  **Triage** — Determine severity (P1-P4), assign incident commander, open communication channel.
3.  **Mitigate** — Rollback deployment, scale resources, enable failover. Focus on restoring service, not root cause.
4.  **Resolve** — Fix the underlying issue. Deploy fix through normal CI/CD pipeline.
5.  **Post-mortem** — Blameless analysis of what happened, what went well, what to improve. Document action items.

>**Key Concept:** **Blameless post-mortems** are a core SRE practice. Focus on systemic improvements (better monitoring, automated rollback, improved testing) rather than individual blame. Google publishes post-mortem templates that the exam may reference.

## 06. Distributed Tracing

**Cloud Trace** collects latency data from applications to help identify performance bottlenecks. It integrates with Cloud Run, GKE, App Engine, and custom applications via OpenTelemetry.

-   **Automatic Tracing** — Cloud Run, App Engine, and Cloud Functions automatically report traces.
-   **Custom Instrumentation** — Use OpenTelemetry SDK to add spans for custom code paths.
-   **Trace Analysis** — View request waterfall diagrams, identify slow spans, correlate with logs.
-   **Latency Distribution** — Analyze p50, p95, p99 latency across services and time periods.

```
# Python — OpenTelemetry tracing with Cloud Trace exporter
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Set up Cloud Trace exporter
trace.set_tracer_provider(TracerProvider())
tracer_provider = trace.get_tracer_provider()
cloud_trace_exporter = CloudTraceSpanExporter(project_id="my-project")
tracer_provider.add_span_processor(BatchSpanProcessor(cloud_trace_exporter))

# Instrument your code
tracer = trace.get_tracer("my-service")

with tracer.start_as_current_span("process-request") as span:
    span.set_attribute("user.id", user_id)
    result = process_data(data)  # This call will be traced
    span.set_attribute("result.count", len(result))
```

>**Exam Tip:** **The three pillars of observability are metrics (Cloud Monitoring), logs (Cloud Logging), and traces (Cloud Trace).** A complete observability strategy uses all three. Metrics tell you something is wrong, logs tell you what happened, traces tell you where in the request path it happened.

## 07. Exam Tips
>**Scenario 1:** **"A company notices intermittent 502 errors from their Cloud Run service during peak hours..."**  
> Answer: Check Cloud Run metrics (concurrency, instance count, request latency). Likely cause: insufficient max-instances or low concurrency setting. Increase `--max-instances` and `--concurrency`. Set up Cloud Monitoring alerting on 5xx error rate and p99 latency. Use Cloud Trace to identify slow request paths.
>**Scenario 2:** **"An SRE team needs to define SLOs for a critical API with 99.95% availability target..."**  
> Answer: Define SLIs (request success rate, latency p99). Create SLO in Cloud Monitoring with 99.95% target on a 30-day rolling window. Set up burn-rate alerting at 2x, 5x, and 10x consumption rates. Error budget = 0.05% = ~21.6 minutes/month. When budget is <25%, reduce deployment frequency.
>**Scenario 3:** **"A team wants to ensure their GKE application can survive a zone failure..."**  
> Answer: Use a **regional GKE cluster** (nodes across 3 zones). Pod Disruption Budgets to maintain availability during maintenance. Pod anti-affinity rules to spread replicas across zones. Run chaos experiments: kill a node pool in one zone and verify service remains healthy.
>**Scenario 4:** **"A company needs to retain all audit logs for 7 years for compliance..."**  
> Answer: Create a **log sink** to Cloud Storage with a retention-locked bucket (7-year retention policy). Admin Activity logs are retained 400 days by default — the sink ensures long-term archival. Use Cloud Storage Coldline or Archive class for cost efficiency. Optionally sink to BigQuery for queryable compliance reporting.
>**General Strategy:** **Operations excellence is about proactive reliability, not reactive firefighting.** The exam rewards answers that include monitoring, alerting, automation, and continuous improvement. Always mention SLOs, error budgets, and blameless post-mortems when discussing operational practices.

Previous Section

[05 · Managing Implementation](05-managing-implementation.html)

Back to Hub

[PCA Hub](index.html)

All Study Guides