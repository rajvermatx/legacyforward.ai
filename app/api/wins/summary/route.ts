import { NextRequest, NextResponse } from "next/server";
import { WinsTrackerAgent } from "@/lib/agents";

const agent = new WinsTrackerAgent(process.env.OPENAI_API_KEY!);

export async function POST(request: NextRequest) {
  const { wins, period = "FY 2026" } = await request.json();

  if (!wins?.length) {
    return NextResponse.json(
      { error: "wins array is required" },
      { status: 400 }
    );
  }

  const summary = await agent.generateSummary(wins, period);

  return NextResponse.json({ summary, period, winCount: wins.length });
}
