import { NextRequest, NextResponse } from "next/server";
import { RoadmapAgent } from "@/lib/agents";

const agent = new RoadmapAgent(process.env.OPENAI_API_KEY!);

export async function POST(request: NextRequest) {
  const { currentRole, targetRole, skills, yearsExperience, marketCode } =
    await request.json();

  if (!currentRole || !targetRole) {
    return NextResponse.json(
      { error: "currentRole and targetRole are required" },
      { status: 400 }
    );
  }

  const roadmap = await agent.generate({
    currentRole,
    targetRole,
    skills,
    yearsExperience,
    marketCode,
  });

  return NextResponse.json(roadmap);
}
