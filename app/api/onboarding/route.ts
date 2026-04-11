import { NextRequest, NextResponse } from "next/server";
import { OnboardingAgent } from "@/lib/agents";
import type { ChatMessage, CareerSnapshot } from "@/lib/app-types";

const agent = new OnboardingAgent(process.env.OPENAI_API_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    message,
    conversationHistory = [],
    marketCode = "US",
  }: {
    message: string;
    conversationHistory: ChatMessage[];
    marketCode: "US" | "IN";
  } = body;

  const context = {
    userId: "demo-user",
    snapshot: null as CareerSnapshot | null,
    conversationHistory,
    marketCode,
    tier: "free" as const,
  };

  const response = await agent.handle(message, context);

  return NextResponse.json({
    message: response.content,
    handoffTo: response.handoffTo,
    isComplete: response.content.includes("[ONBOARDING_COMPLETE]"),
  });
}
