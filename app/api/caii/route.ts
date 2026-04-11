import { NextRequest, NextResponse } from "next/server";
import { CAIIEngine } from "@/lib/agents";

const engine = new CAIIEngine(process.env.OPENAI_API_KEY!);

export async function POST(request: NextRequest) {
  const { role, yearsExperience, skills, industry, marketCode } =
    await request.json();

  if (!role) {
    return NextResponse.json({ error: "role is required" }, { status: 400 });
  }

  const report = await engine.generateReport(role, {
    yearsExperience,
    skills,
    industry,
    marketCode,
  });

  return NextResponse.json(report);
}
