import { NextRequest, NextResponse } from "next/server";
import { WinsTrackerAgent } from "@/lib/agents";

const agent = new WinsTrackerAgent(process.env.OPENAI_API_KEY!);

// POST — log a new win
export async function POST(request: NextRequest) {
  const { text, source = "app" } = await request.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const processed = await agent.process(text);

  // Store in localStorage on client side (no DB yet)
  // Return the processed win with an ID and timestamp
  return NextResponse.json({
    id: crypto.randomUUID(),
    ...processed,
    source,
    createdAt: new Date().toISOString(),
  });
}
