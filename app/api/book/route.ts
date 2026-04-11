import { NextRequest, NextResponse } from "next/server";
import { BookAuthorAgent } from "@/lib/agents";

const agent = new BookAuthorAgent(process.env.OPENAI_API_KEY!);

// POST — generate a single chapter
export async function POST(request: NextRequest) {
  const { chapterIndex, snapshot, caiiReport, roadmap, wins, marketCode, userName } =
    await request.json();

  if (chapterIndex === undefined || chapterIndex < 0 || chapterIndex > 15) {
    return NextResponse.json({ error: "Invalid chapterIndex (0-15)" }, { status: 400 });
  }

  const chapter = await agent.generateChapter(chapterIndex, {
    snapshot,
    caiiReport,
    roadmap,
    wins,
    marketCode,
    userName,
  });

  return NextResponse.json(chapter);
}

// GET — return chapter plan
export async function GET() {
  return NextResponse.json({
    totalChapters: agent.getTotalChapters(),
    plan: agent.getChapterPlan(),
  });
}
