/** Cross-section related content mapping for the Toolkit.
 *  Each key is a section/slug, values are related items in other sections. */

export interface RelatedItem {
  title: string;
  href: string;
  section: string;
}

const related: Record<string, RelatedItem[]> = {
  // Blueprints → GenAI Arch / Agentic Designs
  "blueprints/ai-gateway": [
    { title: "Multi-Model Router", href: "/library/toolkit/genai-arch/multi-model-router", section: "GenAI Architecture" },
    { title: "Production GenAI Platform", href: "/library/toolkit/genai-arch/production-platform", section: "GenAI Architecture" },
  ],
  "blueprints/hipaa-ai-pipeline": [
    { title: "Eval & Guardrails", href: "/library/toolkit/genai-arch/eval-guardrails", section: "GenAI Architecture" },
    { title: "Document Processing", href: "/library/toolkit/genai-arch/document-processing", section: "GenAI Architecture" },
  ],
  "blueprints/fraud-detection": [
    { title: "Eval & Guardrails", href: "/library/toolkit/genai-arch/eval-guardrails", section: "GenAI Architecture" },
    { title: "Incident Root Cause Agent", href: "/library/toolkit/agentic-designs/incident-root-cause", section: "Agentic Design" },
  ],
  "blueprints/digital-twin": [
    { title: "Fine-Tuning & Serving", href: "/library/toolkit/genai-arch/fine-tuning-serving", section: "GenAI Architecture" },
  ],
  "blueprints/mlops-platform": [
    { title: "Fine-Tuning & Serving", href: "/library/toolkit/genai-arch/fine-tuning-serving", section: "GenAI Architecture" },
    { title: "Production GenAI Platform", href: "/library/toolkit/genai-arch/production-platform", section: "GenAI Architecture" },
  ],
  "blueprints/rules-to-ml": [
    { title: "Simple Chat API", href: "/library/toolkit/genai-arch/simple-chat-api", section: "GenAI Architecture" },
  ],
  "blueprints/model-governance": [
    { title: "Eval & Guardrails", href: "/library/toolkit/genai-arch/eval-guardrails", section: "GenAI Architecture" },
    { title: "Regulatory Compliance Agent", href: "/library/toolkit/agentic-designs/regulatory-compliance", section: "Agentic Design" },
  ],
  "blueprints/multi-cloud": [
    { title: "Multi-Model Router", href: "/library/toolkit/genai-arch/multi-model-router", section: "GenAI Architecture" },
    { title: "AI Gateway & LLM Router", href: "/library/toolkit/blueprints/ai-gateway", section: "Blueprint" },
  ],
  "blueprints/build-buy-finetune": [
    { title: "Fine-Tuning & Serving", href: "/library/toolkit/genai-arch/fine-tuning-serving", section: "GenAI Architecture" },
    { title: "Simple Chat API", href: "/library/toolkit/genai-arch/simple-chat-api", section: "GenAI Architecture" },
  ],
  "blueprints/enterprise-rag": [
    { title: "RAG Pipeline", href: "/library/toolkit/genai-arch/rag-pipeline", section: "GenAI Architecture" },
    { title: "Research Synthesis Agent", href: "/library/toolkit/agentic-designs/research-synthesis", section: "Agentic Design" },
  ],

  // GenAI Arch → Blueprints / Agentic Designs
  "genai-arch/simple-chat-api": [
    { title: "Conversational Chatbot", href: "/library/toolkit/genai-arch/conversational-chatbot", section: "GenAI Architecture" },
    { title: "Build vs Buy vs Fine-Tune", href: "/library/toolkit/blueprints/build-buy-finetune", section: "Blueprint" },
  ],
  "genai-arch/conversational-chatbot": [
    { title: "Simple Chat API", href: "/library/toolkit/genai-arch/simple-chat-api", section: "GenAI Architecture" },
    { title: "RAG Pipeline", href: "/library/toolkit/genai-arch/rag-pipeline", section: "GenAI Architecture" },
  ],
  "genai-arch/rag-pipeline": [
    { title: "Enterprise RAG", href: "/library/toolkit/blueprints/enterprise-rag", section: "Blueprint" },
    { title: "Research Synthesis Agent", href: "/library/toolkit/agentic-designs/research-synthesis", section: "Agentic Design" },
  ],
  "genai-arch/document-processing": [
    { title: "HIPAA-Compliant AI Pipeline", href: "/library/toolkit/blueprints/hipaa-ai-pipeline", section: "Blueprint" },
    { title: "Data Quality Agent", href: "/library/toolkit/agentic-designs/data-quality", section: "Agentic Design" },
  ],
  "genai-arch/multi-model-router": [
    { title: "AI Gateway & LLM Router", href: "/library/toolkit/blueprints/ai-gateway", section: "Blueprint" },
    { title: "Multi-Cloud AI Strategy", href: "/library/toolkit/blueprints/multi-cloud", section: "Blueprint" },
  ],
  "genai-arch/agentic-tool-use": [
    { title: "Cyber Threat Intel Agent", href: "/library/toolkit/agentic-designs/cyber-threat-intel", section: "Agentic Design" },
    { title: "Multi-Agent Orchestration", href: "/library/toolkit/genai-arch/multi-agent", section: "GenAI Architecture" },
  ],
  "genai-arch/eval-guardrails": [
    { title: "Model Governance", href: "/library/toolkit/blueprints/model-governance", section: "Blueprint" },
    { title: "HIPAA-Compliant AI Pipeline", href: "/library/toolkit/blueprints/hipaa-ai-pipeline", section: "Blueprint" },
  ],
  "genai-arch/fine-tuning-serving": [
    { title: "Build vs Buy vs Fine-Tune", href: "/library/toolkit/blueprints/build-buy-finetune", section: "Blueprint" },
    { title: "MLOps Platform", href: "/library/toolkit/blueprints/mlops-platform", section: "Blueprint" },
  ],
  "genai-arch/multi-agent": [
    { title: "Agentic Tool Use", href: "/library/toolkit/genai-arch/agentic-tool-use", section: "GenAI Architecture" },
    { title: "Research Synthesis Agent", href: "/library/toolkit/agentic-designs/research-synthesis", section: "Agentic Design" },
    { title: "Incident Root Cause Agent", href: "/library/toolkit/agentic-designs/incident-root-cause", section: "Agentic Design" },
  ],
  "genai-arch/production-platform": [
    { title: "AI Gateway & LLM Router", href: "/library/toolkit/blueprints/ai-gateway", section: "Blueprint" },
    { title: "MLOps Platform", href: "/library/toolkit/blueprints/mlops-platform", section: "Blueprint" },
  ],

  // Agentic Designs → GenAI Arch / Blueprints
  "agentic-designs/cyber-threat-intel": [
    { title: "Agentic Tool Use", href: "/library/toolkit/genai-arch/agentic-tool-use", section: "GenAI Architecture" },
    { title: "RAG Pipeline", href: "/library/toolkit/genai-arch/rag-pipeline", section: "GenAI Architecture" },
  ],
  "agentic-designs/weather-impact": [
    { title: "Agentic Tool Use", href: "/library/toolkit/genai-arch/agentic-tool-use", section: "GenAI Architecture" },
  ],
  "agentic-designs/supply-chain-disruption": [
    { title: "Multi-Agent Orchestration", href: "/library/toolkit/genai-arch/multi-agent", section: "GenAI Architecture" },
    { title: "Digital Twin Architecture", href: "/library/toolkit/blueprints/digital-twin", section: "Blueprint" },
  ],
  "agentic-designs/school-teacher": [
    { title: "RAG Pipeline", href: "/library/toolkit/genai-arch/rag-pipeline", section: "GenAI Architecture" },
    { title: "Conversational Chatbot", href: "/library/toolkit/genai-arch/conversational-chatbot", section: "GenAI Architecture" },
  ],
  "agentic-designs/research-synthesis": [
    { title: "RAG Pipeline", href: "/library/toolkit/genai-arch/rag-pipeline", section: "GenAI Architecture" },
    { title: "Enterprise RAG", href: "/library/toolkit/blueprints/enterprise-rag", section: "Blueprint" },
    { title: "Multi-Agent Orchestration", href: "/library/toolkit/genai-arch/multi-agent", section: "GenAI Architecture" },
  ],
  "agentic-designs/data-quality": [
    { title: "Document Processing", href: "/library/toolkit/genai-arch/document-processing", section: "GenAI Architecture" },
    { title: "Agentic Tool Use", href: "/library/toolkit/genai-arch/agentic-tool-use", section: "GenAI Architecture" },
  ],
  "agentic-designs/regulatory-compliance": [
    { title: "Model Governance", href: "/library/toolkit/blueprints/model-governance", section: "Blueprint" },
    { title: "Eval & Guardrails", href: "/library/toolkit/genai-arch/eval-guardrails", section: "GenAI Architecture" },
  ],
  "agentic-designs/open-data-investigator": [
    { title: "RAG Pipeline", href: "/library/toolkit/genai-arch/rag-pipeline", section: "GenAI Architecture" },
    { title: "Research Synthesis Agent", href: "/library/toolkit/agentic-designs/research-synthesis", section: "Agentic Design" },
  ],
  "agentic-designs/incident-root-cause": [
    { title: "Multi-Agent Orchestration", href: "/library/toolkit/genai-arch/multi-agent", section: "GenAI Architecture" },
    { title: "Fraud Detection", href: "/library/toolkit/blueprints/fraud-detection", section: "Blueprint" },
  ],
  "agentic-designs/personal-finance": [
    { title: "Agentic Tool Use", href: "/library/toolkit/genai-arch/agentic-tool-use", section: "GenAI Architecture" },
    { title: "Conversational Chatbot", href: "/library/toolkit/genai-arch/conversational-chatbot", section: "GenAI Architecture" },
  ],
};

export function getRelated(section: string, slug: string): RelatedItem[] {
  return related[`${section}/${slug}`] ?? [];
}
