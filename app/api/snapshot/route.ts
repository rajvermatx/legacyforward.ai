import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatMessage } from "@/lib/app-types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(request: NextRequest) {
  const { conversationHistory }: { conversationHistory: ChatMessage[] } =
    await request.json();

  const conversationText = conversationHistory
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Extract a structured Career Snapshot from this onboarding conversation. Return JSON only.

{
  "currentRole": "string or null",
  "currentIndustry": "string or null",
  "seniorityLevel": "entry | mid | senior | executive | null",
  "yearsExperience": "number or null",
  "workHistory": [{"title": "", "company": "", "years": 0, "industry": ""}],
  "education": [{"degree": "", "institution": "", "year": 0}],
  "skills": [{"name": "", "proficiency": "beginner|intermediate|advanced|expert", "category": "technical|leadership|creative|analytical|interpersonal"}],
  "aspirations": {"targetRoles": [], "timelineMonths": null, "priorities": []},
  "aiReadiness": {"level": "none|beginner|intermediate|advanced", "toolsUsed": [], "sentiment": "anxious|curious|confident|neutral", "companyAdopting": null},
  "personaType": "pivoter|climber|explorer|adapter|rebuilder",
  "narrativeSummary": "2-3 sentence personalized summary of this person's career story and where they're heading"
}

Extract as much as you can infer from the conversation. Use null for anything not mentioned.`,
      },
      {
        role: "user",
        content: conversationText,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  try {
    const snapshot = JSON.parse(
      completion.choices[0]?.message?.content ?? "{}"
    );
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json(
      { error: "Failed to extract snapshot" },
      { status: 500 }
    );
  }
}
