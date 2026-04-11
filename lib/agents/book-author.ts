import OpenAI from "openai";

export interface BookChapter {
  number: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface BookData {
  id: string;
  title: string;
  subtitle: string;
  chapters: BookChapter[];
  generatedAt: string;
  totalWords: number;
}

const CHAPTER_PLAN = [
  { number: 1, title: "Your Career Snapshot", part: "Part 1: Who You Are Today", prompt: "Write a personalized career snapshot chapter. Summarize who this person is professionally — their role, experience, strengths, and what makes them unique. Warm and affirming tone." },
  { number: 2, title: "Your Achievement Portfolio", part: "Part 1: Who You Are Today", prompt: "Write about this person's key achievements. Reference their wins/achievements data. Highlight patterns and strengths that emerge. Use STAR-formatted examples." },
  { number: 3, title: "Your Professional DNA", part: "Part 1: Who You Are Today", prompt: "Analyze what makes this person's professional identity distinctive. Identify their core strengths, working style, and values based on their career history." },
  { number: 4, title: "AI & Your Industry", part: "Part 2: Where the World Is Going", prompt: "Explain how AI is transforming this person's specific industry. Use their CAII report data. Be balanced — show both threats and opportunities." },
  { number: 5, title: "Your AI Impact Report", part: "Part 2: Where the World Is Going", prompt: "Present their personalized CAII findings. Which of their tasks are at risk? Which are safe? Frame this empoweringly — focus on what they CAN do." },
  { number: 6, title: "Skills of the Future", part: "Part 2: Where the World Is Going", prompt: "Based on their CAII report and industry trends, outline the skills they need. Prioritize by impact and feasibility." },
  { number: 7, title: "Your Target Roles", part: "Part 3: Your Personalized Roadmap", prompt: "Explain why their target roles are a good fit. Use their roadmap data. Show how their current skills map to the target." },
  { number: 8, title: "The Skill Bridge", part: "Part 3: Your Personalized Roadmap", prompt: "Detail the skill gaps between current and target roles. For each gap, provide specific learning recommendations." },
  { number: 9, title: "Your Action Plan", part: "Part 3: Your Personalized Roadmap", prompt: "Lay out a concrete, time-bound plan with milestones. Reference their roadmap milestones. Be specific about what to do each month." },
  { number: 10, title: "Resources & Courses", part: "Part 3: Your Personalized Roadmap", prompt: "Curate specific learning resources — courses, certifications, books, communities. Tailor to their market (US or India)." },
  { number: 11, title: "Your Resume Strategy", part: "Part 4: Your Toolkit", prompt: "Advise on how to position their resume for target roles. Focus on translating current experience into target role language." },
  { number: 12, title: "Interview Prep Guide", part: "Part 4: Your Toolkit", prompt: "Provide role-specific interview preparation. Include sample questions, STAR answer frameworks, and company research tips." },
  { number: 13, title: "Salary & Negotiation", part: "Part 4: Your Toolkit", prompt: "Provide salary benchmarks for their target roles and market. Include negotiation scripts and strategies." },
  { number: 14, title: "Your Networking Plan", part: "Part 4: Your Toolkit", prompt: "Create a networking strategy. Who should they connect with? How to reach out? Include message templates." },
  { number: 15, title: "Your Transition Narrative", part: "Part 5: Your Story", prompt: "Help them craft a compelling story about their career transition. This is what they'll tell in interviews, networking, and on LinkedIn." },
  { number: 16, title: "Your Unfair Advantage", part: "Part 5: Your Story", prompt: "End on a high note. Explain what makes their cross-functional/non-traditional background a STRENGTH. Inspire confidence." },
];

export class BookAuthorAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateChapter(
    chapterIndex: number,
    context: {
      snapshot?: Record<string, unknown>;
      caiiReport?: Record<string, unknown>;
      roadmap?: Record<string, unknown>;
      wins?: Record<string, unknown>[];
      marketCode?: string;
      userName?: string;
    }
  ): Promise<BookChapter> {
    const plan = CHAPTER_PLAN[chapterIndex];

    const contextText = [
      context.snapshot ? `CAREER SNAPSHOT: ${JSON.stringify(context.snapshot)}` : "",
      context.caiiReport ? `CAII REPORT: ${JSON.stringify(context.caiiReport)}` : "",
      context.roadmap ? `ROADMAP: ${JSON.stringify(context.roadmap)}` : "",
      context.wins?.length ? `ACHIEVEMENTS (${context.wins.length} total): ${JSON.stringify(context.wins.slice(0, 10))}` : "",
    ].filter(Boolean).join("\n\n");

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are writing Chapter ${plan.number} of a personalized Career Bible for ${context.userName || "the user"}.

Book title: "Your Career Bible"
Chapter: "${plan.title}" (${plan.part})

${plan.prompt}

Rules:
- Write 400-600 words
- Use the user's actual data — reference their specific role, skills, achievements, scores
- Warm, professional, empowering tone — like a mentor writing to someone they believe in
- Use "you" and "your" — this is their personal book
- Include specific, actionable advice, not platitudes
- Market: ${context.marketCode === "IN" ? "India — use Indian context" : "US"}
- Do NOT include the chapter title in your response — just the body text
- Use markdown formatting (bold, bullets, paragraphs) for readability`,
        },
        {
          role: "user",
          content: `Here is the user's data:\n\n${contextText}\n\nWrite Chapter ${plan.number}: "${plan.title}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content ?? "";

    return {
      number: plan.number,
      title: plan.title,
      content,
      wordCount: content.split(/\s+/).length,
    };
  }

  getChapterPlan() {
    return CHAPTER_PLAN;
  }

  getTotalChapters() {
    return CHAPTER_PLAN.length;
  }
}

export { CHAPTER_PLAN };
