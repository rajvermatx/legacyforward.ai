import { NextRequest, NextResponse } from "next/server";
import { BridgeBuilderAgent } from "@/lib/agents";

const agent = new BridgeBuilderAgent(process.env.OPENAI_API_KEY!);

export async function POST(request: NextRequest) {
  const { fromRole, toRole, skills, yearsExperience, marketCode } =
    await request.json();

  if (!fromRole || !toRole) {
    return NextResponse.json(
      { error: "fromRole and toRole are required" },
      { status: 400 }
    );
  }

  const analysis = await agent.analyze({
    fromRole,
    toRole,
    skills,
    yearsExperience,
    marketCode,
  });

  return NextResponse.json(analysis);
}
