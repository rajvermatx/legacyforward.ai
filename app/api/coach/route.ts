import { NextRequest, NextResponse } from "next/server";
import { CoachAgent } from "@/lib/agents";
import type { ChatMessage, CareerSnapshot } from "@/lib/app-types";

const agent = new CoachAgent(process.env.OPENAI_API_KEY!);

export async function POST(request: NextRequest) {
  const {
    message,
    conversationHistory = [],
    snapshot,
    caiiReport,
    roadmap,
    marketCode = "US",
  }: {
    message: string;
    conversationHistory: ChatMessage[];
    snapshot?: CareerSnapshot;
    caiiReport?: Record<string, unknown>;
    roadmap?: Record<string, unknown>;
    marketCode: "US" | "IN";
  } = await request.json();

  const response = await agent.handle(message, {
    userId: "demo-user",
    snapshot: snapshot || null,
    conversationHistory,
    marketCode,
    tier: "free",
    caiiReport,
    roadmap,
  });

  return NextResponse.json({
    message: response.content,
  });
}
