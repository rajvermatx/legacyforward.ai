import type { ChatMessage, CareerSnapshot } from "@/lib/app-types";

export interface AgentContext {
  userId: string;
  snapshot: CareerSnapshot | null;
  conversationHistory: ChatMessage[];
  marketCode: "US" | "IN";
  tier: "free" | "pro" | "career_bible" | "premium";
}

export interface AgentResponse {
  content: string;
  handoffTo?: string;
  sharedContext?: Record<string, unknown>;
  snapshotUpdate?: Partial<CareerSnapshot>;
}

export interface Agent {
  name: string;
  systemPrompt: string;
  model: string;
  handle(userMessage: string, context: AgentContext): Promise<AgentResponse>;
}
