import OpenAI from "openai";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: "completed" | "in_progress" | "upcoming";
  progress: number;
  skills: string[];
  resources: { title: string; provider: string; url: string; type: string }[];
}

export interface RoadmapData {
  targetRole: string;
  currentRole: string;
  estimatedMonths: number;
  overallProgress: number;
  skillGaps: {
    skill: string;
    currentLevel: string;
    targetLevel: string;
    priority: "high" | "medium" | "low";
  }[];
  milestones: Milestone[];
  narrative: string;
}

export class RoadmapAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generate(input: {
    currentRole: string;
    targetRole: string;
    skills?: string[];
    yearsExperience?: number;
    marketCode?: "US" | "IN";
  }): Promise<RoadmapData> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are the CareerAlign Roadmap Agent. Generate a realistic, personalized career roadmap.

Rules:
- Be realistic about timelines (no "become a PM in 30 days" nonsense)
- Prioritize high-impact skills first
- Include free and affordable learning resources with real URLs when possible
- Generate 4-6 milestones spread over the estimated timeline
- Each milestone should have 1-3 skills and 1-2 specific learning resources
- The first milestone should be achievable within 4-6 weeks (quick win)
- Market: ${input.marketCode === "IN" ? "India — use Indian platforms (Coursera India, NPTEL, Great Learning) and INR pricing" : "US — use global platforms (Coursera, LinkedIn Learning, Udemy)"}

Return JSON:
{
  "targetRole": "string",
  "currentRole": "string",
  "estimatedMonths": number,
  "overallProgress": 0,
  "skillGaps": [{"skill":"","currentLevel":"none|beginner|intermediate","targetLevel":"intermediate|advanced|expert","priority":"high|medium|low"}],
  "milestones": [
    {
      "id": "m1",
      "title": "string",
      "description": "1 sentence",
      "targetDate": "YYYY-MM-DD",
      "status": "upcoming",
      "progress": 0,
      "skills": ["skill1"],
      "resources": [{"title":"Course Name","provider":"Coursera","url":"https://...","type":"course|certification|book|project"}]
    }
  ],
  "narrative": "2-3 sentence empowering summary of the roadmap and why this transition makes sense"
}`,
        },
        {
          role: "user",
          content: `Current role: ${input.currentRole}
Target role: ${input.targetRole}
${input.skills?.length ? `Current skills: ${input.skills.join(", ")}` : ""}
${input.yearsExperience ? `Years of experience: ${input.yearsExperience}` : ""}
Generate a personalized career roadmap.`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    try {
      const data = JSON.parse(completion.choices[0]?.message?.content ?? "{}");

      // Set first milestone to in_progress
      if (data.milestones?.length) {
        data.milestones[0].status = "in_progress";
      }

      // Calculate target dates relative to now
      const now = new Date();
      if (data.milestones) {
        const totalMonths = data.estimatedMonths || 6;
        const interval = totalMonths / data.milestones.length;
        data.milestones.forEach((m: Milestone, i: number) => {
          const d = new Date(now);
          d.setMonth(d.getMonth() + Math.round(interval * (i + 1)));
          m.targetDate = d.toISOString().split("T")[0];
        });
      }

      return data as RoadmapData;
    } catch {
      return {
        targetRole: input.targetRole,
        currentRole: input.currentRole,
        estimatedMonths: 6,
        overallProgress: 0,
        skillGaps: [],
        milestones: [],
        narrative: "Unable to generate roadmap. Please try again.",
      };
    }
  }
}
