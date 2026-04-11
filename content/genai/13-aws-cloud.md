---
title: "AWS Cloud Services for GenAI"
slug: "aws-cloud"
description: "A practitioner's guide to deploying GenAI on AWS — Bedrock vs. SageMaker decision framework, serverless architectures, data service selection, security patterns, and cost optimization strategies."
section: "genai"
order: 13
badges:
  - "Amazon Bedrock"
  - "SageMaker"
  - "Lambda + API Gateway"
  - "S3 & DynamoDB"
  - "IAM & Security"
  - "Cost Optimization"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai/13-aws-cloud.ipynb"
---

## 01. Amazon Bedrock

Amazon Bedrock is AWS's managed service for accessing foundation models from multiple providers through a single API. Instead of managing separate accounts and integrations with OpenAI, Anthropic, Meta, Cohere, and Stability AI, Bedrock gives you a unified interface to Claude, Llama, Titan, Command, and other models. You pay per token with no upfront commitments, and your data stays within your AWS account — it is never used to train the underlying models.

>**Think of it like this:** Bedrock is like a food court in your office building. Instead of driving to five different restaurants (API providers), every option is under one roof with the same payment system (AWS billing), the same security badge to get in (IAM), and the same health inspectors watching over everything (CloudTrail, Config).

Bedrock goes beyond basic model access with three powerful features. **Knowledge Bases** provide a fully managed RAG pipeline: you point Bedrock at an S3 bucket of documents, and it handles chunking, embedding, vector storage (using OpenSearch Serverless), and retrieval. **Agents** let you build tool-using agents that can query databases, call APIs, and execute multi-step workflows — all managed by AWS. **Guardrails** provide configurable content filters, PII detection, and topic boundaries as a managed service.

The key advantage of Bedrock over calling model providers directly is **enterprise governance**. All API calls flow through your AWS account, which means they are subject to your IAM policies, VPC network rules, CloudTrail audit logs, and AWS Config compliance rules. You can restrict which models specific teams can access, enforce data residency by choosing specific AWS regions, and monitor usage and costs through standard AWS billing tools.

The tradeoff is that Bedrock's model versions may lag behind the providers' direct APIs by days or weeks. When Anthropic releases a new Claude model, it appears on their API immediately but may take time to arrive on Bedrock. Bedrock also does not support every parameter and feature that each provider's native API offers.

```
import boto3, json

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

# --- Invoke Claude via Bedrock ---
response = bedrock.invoke_model(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    contentType="application/json",
    accept="application/json",
    body=json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "messages": [{
            "role": "user",
            "content": "Explain Amazon Bedrock in 3 sentences."
        }]
    })
)

result = json.loads(response["body"].read())
print(result["content"][0]["text"])

# --- Query a Bedrock Knowledge Base (managed RAG) ---
bedrock_agent = boto3.client("bedrock-agent-runtime")

response = bedrock_agent.retrieve_and_generate(
    input={"text": "What is our company's return policy?"},
    retrieveAndGenerateConfiguration={
        "type": "KNOWLEDGE_BASE",
        "knowledgeBaseConfiguration": {
            "knowledgeBaseId": "KB_ID_HERE",
            "modelArn": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"
        }
    }
)

print(response["output"]["text"])
for citation in response.get("citations", []):
    for ref in citation["retrievedReferences"]:
        print(f"  Source: {ref['location']['s3Location']['uri']}")
```

### What This Means for Practitioners

**Bedrock model selection and cost comparison:**

| Bedrock Model | Provider | Input $/1M | Output $/1M | Best For |
| --- | --- | --- | --- | --- |
| Claude 3.5 Sonnet | Anthropic | $3.00 | $15.00 | Complex reasoning, coding |
| Claude 3 Haiku | Anthropic | $0.25 | $1.25 | Fast, cost-effective tasks |
| Llama 3 70B | Meta | $2.65 | $3.50 | Open-weight, customizable |
| Titan Text Express | Amazon | $0.20 | $0.60 | Simple tasks, lowest cost |
| Command R+ | Cohere | $3.00 | $15.00 | RAG-optimized |

>**Bedrock + LiteLLM:** Use LiteLLM as a unified SDK to call Bedrock models with the same OpenAI-compatible code you use for other providers: `litellm.completion(model="bedrock/anthropic.claude-3-5-sonnet...", messages=[...])`. This makes your code portable between Bedrock, direct API, and self-hosted models.

## 02. SageMaker for GenAI

While Bedrock provides access to pre-built foundation models, SageMaker is where you go when you need custom model training, fine-tuning, or self-hosted inference with full control. SageMaker provides managed Jupyter notebooks for experimentation, training jobs that scale to multi-GPU clusters, and real-time inference endpoints that auto-scale based on traffic. For GenAI specifically, SageMaker JumpStart provides one-click deployment of popular open models (Llama, Mistral, Falcon) on optimized GPU instances.

SageMaker's **Inference Components** feature is particularly powerful for cost optimization. Instead of dedicating an entire GPU instance to a single model, you can host multiple models on the same instance and dynamically allocate GPU memory between them. This can reduce inference costs by 50-70% compared to dedicated endpoints for each model.

```
import sagemaker
from sagemaker.jumpstart.model import JumpStartModel

# One-click deployment of Llama 3 via JumpStart
model = JumpStartModel(
    model_id="meta-textgeneration-llama-3-8b-instruct",
    role=sagemaker.get_execution_role(),
)

predictor = model.deploy(
    initial_instance_count=1,
    instance_type="ml.g5.2xlarge",
    endpoint_name="llama3-jumpstart",
)

response = predictor.predict({
    "inputs": "What are the benefits of RAG?",
    "parameters": {"max_new_tokens": 256, "temperature": 0.7}
})
print(response)
```

>**Clean Up Endpoints:** SageMaker endpoints bill by the hour even when idle. Always delete endpoints after experimentation: `predictor.delete_endpoint()`. Use lifecycle policies to auto-delete idle endpoints in non-production environments.

### What This Means for Practitioners

**Bedrock vs. SageMaker decision framework:**

| Decision Factor | Choose Bedrock | Choose SageMaker |
| --- | --- | --- |
| Need frontier models (Claude, GPT) | Yes — managed access, zero infra | No — these are not self-hostable |
| Need to fine-tune on proprietary data | Limited (Bedrock Custom Models) | Yes — full training pipeline |
| Need custom inference logic | No — limited to API parameters | Yes — custom containers, vLLM |
| Traffic pattern | Variable / bursty (pay-per-token) | Steady / high-volume (pay-per-hour) |
| Governance requirements | Strong — IAM, VPC, CloudTrail built in | Strong — but more to configure |
| Team ML expertise | Low — managed everything | High — need to choose instances, optimize |
| Multi-model hosting | Not applicable (API) | Yes — Inference Components |
| Budget | Low-medium volume: cheaper | High volume: cheaper per token |

**In practice, many production systems use both:** Bedrock for the primary LLM calls and SageMaker for custom embedding models or specialized fine-tuned models.

## 03. Serverless GenAI

Not every GenAI application needs GPU instances running 24/7. For many use cases — document processing pipelines, chatbot backends with moderate traffic, scheduled report generation — a serverless architecture using Lambda + API Gateway + Bedrock is the most cost-effective approach. You pay only when requests are being processed, with zero cost during idle periods.

>**Think of it like this:** Running a SageMaker endpoint 24/7 for a chatbot that gets 100 queries per day is like keeping a taxi running all night in case someone needs a ride. Serverless is like calling an Uber — you pay only for the trips.

The main limitation of serverless GenAI is the Lambda timeout (15 minutes maximum) and cold start latency. LLM calls through Bedrock typically complete in 2-15 seconds depending on the model and output length, well within Lambda's limits. For streaming responses, use Lambda Function URL Response Streaming.

```
# Lambda function for Bedrock-powered chatbot
import json, boto3

bedrock = boto3.client("bedrock-runtime")

def handler(event, context):
    body = json.loads(event["body"])
    user_message = body["message"]

    response = bedrock.invoke_model(
        modelId="anthropic.claude-3-haiku-20240307-v1:0",
        contentType="application/json",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 512,
            "messages": [{"role": "user", "content": user_message}]
        })
    )

    result = json.loads(response["body"].read())

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "response": result["content"][0]["text"],
            "model": "claude-3-haiku",
            "usage": result["usage"]
        })
    }
```

## 04. Data Services for GenAI

GenAI applications need several types of data storage: **S3** for document files (PDFs, images) that feed RAG pipelines, **OpenSearch Serverless** or **Aurora PostgreSQL with pgvector** for vector embeddings, **DynamoDB** for conversation history and session state, and **ElastiCache (Redis)** for caching embeddings and LLM responses.

### What This Means for Practitioners

**Choose the right vector store for your situation:**

| Vector Store | Setup Effort | Cost | Best For |
| --- | --- | --- | --- |
| OpenSearch Serverless (via Bedrock KB) | Zero — fully managed | $$ (minimum charges) | Teams using Bedrock Knowledge Bases |
| Aurora PostgreSQL + pgvector | Medium — RDS setup | $ (existing Aurora) | Teams already on PostgreSQL |
| Pinecone / Qdrant on ECS | High — manage infra | $$-$$$ | Need advanced vector DB features |

```
import boto3

# DynamoDB for conversation history
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("conversations")

def save_message(session_id: str, role: str, content: str):
    import time
    table.put_item(Item={
        "session_id": session_id,
        "timestamp": int(time.time() * 1000),
        "role": role,
        "content": content,
        "ttl": int(time.time()) + 86400 * 7,  # 7-day TTL
    })

def get_history(session_id: str, limit: int = 20) -> list:
    response = table.query(
        KeyConditionExpression="session_id = :sid",
        ExpressionAttributeValues={":sid": session_id},
        ScanIndexForward=True,
        Limit=limit,
    )
    return [{"role": i["role"], "content": i["content"]} for i in response["Items"]]
```

## 05. Security & IAM

AWS security for GenAI follows the shared responsibility model: AWS secures the infrastructure, you secure your application and data. The critical security controls are: **IAM policies** that restrict which models and actions each service or user can access, **VPC endpoints** that keep Bedrock traffic off the public internet, **KMS encryption** for data at rest and in transit, **CloudTrail** for audit logging of every model invocation, and **AWS Config rules** that enforce compliance standards automatically.

The principle of least privilege is especially important for GenAI. A Lambda function that calls Bedrock should have an IAM policy that allows **only** the specific model IDs it needs, not blanket access to all Bedrock models.

```
// IAM policy: least-privilege Bedrock access
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku*",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet*"
      ]
    },
    {
      "Effect": "Deny",
      "Action": "bedrock:InvokeModel",
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-opus*",
      "Condition": {
        "StringNotEquals": {"aws:PrincipalTag/team": "ml-research"}
      }
    }
  ]
}
```

>**Think of it like this:** IAM for Bedrock is like giving hotel room keys. You give each guest a key that opens only their room, not a master key to the entire floor. And every door opening is logged.

## 06. Cost Management

GenAI costs on AWS can escalate quickly without proper controls. The main cost drivers are: model inference (per-token for Bedrock, per-hour for SageMaker endpoints), GPU instances (g5.2xlarge at ~$1.50/hr is ~$1,100/month if left running), vector database storage (OpenSearch Serverless has minimum charges), and data transfer.

**Provisioned Throughput** on Bedrock lets you reserve model capacity at a fixed monthly cost. If you know you will spend more than roughly $10,000/month in Bedrock on-demand calls, provisioned throughput typically saves 30-50%.

| Cost Strategy | Savings | Effort |
| --- | --- | --- |
| Use smallest effective model (Haiku > Sonnet) | 80-90% | Low — just test quality |
| Cache identical prompts (Redis/ElastiCache) | 30-70% | Medium |
| Provisioned Throughput for high volume | 30-50% | Low — commitment required |
| Auto-scale SageMaker to zero off-hours | 50-70% | Medium |
| Prompt engineering (shorter prompts) | 20-40% | Medium |

```
import boto3

# Set up a CloudWatch alarm for Bedrock costs
cloudwatch = boto3.client("cloudwatch")

cloudwatch.put_metric_alarm(
    AlarmName="BedrockDailyCostAlarm",
    MetricName="EstimatedCharges",
    Namespace="AWS/Billing",
    Statistic="Maximum",
    Period=86400,
    EvaluationPeriods=1,
    Threshold=100.0,  # Alert at $100/day
    ComparisonOperator="GreaterThanThreshold",
    Dimensions=[{"Name": "ServiceName", "Value": "Amazon Bedrock"}],
    AlarmActions=["arn:aws:sns:us-east-1:123456789:cost-alerts"],
)
```

>**Day-One Budget Alerts:** Set up AWS Budget alerts before deploying any GenAI workload. A misconfigured agent loop can generate thousands of API calls in minutes. Set alerts at 50%, 80%, and 100% of your expected monthly budget, and add a hard stop (Lambda + EventBridge) that disables resources if spending exceeds 150%.

## Interview Ready

### How to Explain This in 2 Minutes

>**Elevator Pitch:** AWS provides the full stack for deploying GenAI applications in production. Amazon Bedrock is the managed service for accessing foundation models like Claude, Llama, and Titan through a single API — you get enterprise governance (IAM, VPC, CloudTrail) without managing any ML infrastructure. For custom models, SageMaker handles training, fine-tuning, and hosting on GPU instances with auto-scaling. For cost-effective architectures, Lambda plus API Gateway plus Bedrock gives you a fully serverless GenAI backend that costs zero when idle. The data layer uses S3 for document storage, OpenSearch Serverless for vector embeddings in RAG pipelines, and DynamoDB for conversation history. Security follows least-privilege IAM policies scoped to specific model IDs, VPC endpoints to keep traffic private, and KMS encryption throughout. The biggest operational concern is cost — GPU instances and per-token charges add up fast, so you need budget alerts, auto-scaling policies, and model selection strategies (use Haiku before Sonnet) from day one.

### Likely Interview Questions

| Question | What They're Really Asking |
| --- | --- |
| When would you use Bedrock vs. SageMaker for GenAI? | Do you understand that Bedrock is for managed model access with zero infrastructure, while SageMaker is for custom training, fine-tuning, and self-hosted inference with full control? |
| How would you build a serverless GenAI application on AWS? | Can you architect a Lambda + API Gateway + Bedrock pipeline, handle streaming responses, and explain the cost and latency tradeoffs compared to always-on instances? |
| How do you secure LLM access on AWS? | Can you design IAM policies scoped to specific model ARNs, set up VPC endpoints for private connectivity, and implement CloudTrail audit logging for compliance? |
| How would you implement RAG on AWS? | Do you know the managed path (Bedrock Knowledge Bases with OpenSearch Serverless) vs. the custom path (Aurora pgvector, custom chunking, SageMaker embeddings) and when to use each? |
| How do you control GenAI costs on AWS? | Can you identify the main cost drivers (per-token inference, GPU instance hours, vector DB minimums) and propose specific strategies like model tiering, prompt caching, provisioned throughput, and auto-scaling to zero? |

### Model Answers

**Bedrock vs. SageMaker:** I use Bedrock when I need access to frontier models like Claude or Llama without managing infrastructure — it provides a pay-per-token API with built-in governance through IAM, VPC endpoints, and CloudTrail. I switch to SageMaker when I need to fine-tune a model on proprietary data, host an open-weight model with custom inference logic, or need features like inference components for multi-model hosting on shared GPU instances. In practice, many production systems use both: Bedrock for the primary LLM calls and SageMaker for custom embedding models or specialized fine-tuned models.

**Serverless GenAI Architecture:** For moderate-traffic applications, I architect with Lambda handling request processing and prompt construction, API Gateway providing the HTTP endpoint with API key authentication and rate limiting, and Bedrock for model inference. DynamoDB stores conversation history with TTL for automatic cleanup. The key advantage is zero cost during idle periods. For streaming responses, I use Lambda Function URLs with response streaming. The main constraint is Lambda's 15-minute timeout, but Bedrock calls typically complete in 2-15 seconds.

**Cost Control Strategy:** I implement cost controls at multiple levels. First, model tiering — route simple queries to Haiku or Titan and only escalate to Sonnet for complex tasks, saving 80-90% on those requests. Second, prompt caching with ElastiCache Redis to avoid recomputing identical prompts. Third, SageMaker auto-scaling with scale-to-zero for development endpoints. Fourth, AWS Budget alerts at 50%, 80%, and 100% thresholds with an automated kill switch via Lambda and EventBridge at 150%. For high-volume production, I evaluate Bedrock Provisioned Throughput which saves 30-50% over on-demand pricing above roughly $10,000 per month.

### System Design Scenario

>**Design Prompt:** Design a production RAG-powered customer support system on AWS that handles 50,000 queries per day, ingests 10,000 knowledge base documents from S3, and must respond within 3 seconds. The system needs multi-tenant isolation (each customer sees only their own documents), audit logging for compliance, and a total monthly budget of $5,000. Describe your architecture choices for model selection (Bedrock vs. SageMaker), vector storage, document processing pipeline, caching strategy, security boundaries between tenants, and how you would monitor quality and costs in production.

### Common Mistakes

-   **Leaving SageMaker endpoints running after experimentation:** GPU instances like g5.2xlarge cost ~$1.50/hr ($1,100/month). Always delete endpoints when not in use, set up lifecycle policies for non-production environments, and use auto-scaling with scale-to-zero for development workloads.
-   **Using blanket IAM permissions for Bedrock:** Granting `bedrock:InvokeModel` on `*` allows access to all models, including expensive ones like Claude Opus. Always scope IAM policies to specific model ARNs and use condition keys to restrict access by team or environment.
-   **Skipping cost monitoring until the first bill arrives:** GenAI workloads can generate surprising costs from misconfigured agent loops, unexpected traffic spikes, or developers experimenting with large models. Set up AWS Budget alerts and CloudWatch alarms for Bedrock spend on day one, before deploying any workload.

← Previous

[12 · MCP](12-mcp.html)

Next →

[14 · n8n No-Code](14-n8n-no-code.html)
