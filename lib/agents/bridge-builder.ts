import OpenAI from "openai";

export interface SkillTranslation {
  sourceSkill: string;
  targetSkill: string;
  transferability: "high" | "medium" | "low";
  gapAction: string;
}

export interface BridgeAnalysis {
  fromRole: string;
  toRole: string;
  overlapPercent: number;
  transferableSkills: SkillTranslation[];
  gapSkills: string[];
  recommendedSteps: { step: number; title: string; description: string; timeframe: string }[];
  unfairAdvantage: string;
  narrative: string;
}

export class BridgeBuilderAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyze(input: {
    fromRole: string;
    toRole: string;
    skills?: string[];
    yearsExperience?: number;
    marketCode?: "US" | "IN";
  }): Promise<BridgeAnalysis> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are the LegacyForward.ai Bridge Builder. Analyze a career transition and create a skill translation map.

Key principles:
- NEVER frame gaps as weaknesses — frame them as "bridges to build"
- ALWAYS lead with what they HAVE — confidence first
- Show how cross-industry experience is a STRENGTH, not a liability
- Be realistic about timelines
- Market: ${input.marketCode === "IN" ? "India" : "US"}

Return JSON:
{
  "fromRole": "string",
  "toRole": "string",
  "overlapPercent": number (0-100),
  "transferableSkills": [
    {"sourceSkill": "what they have", "targetSkill": "how it translates", "transferability": "high|medium|low", "gapAction": "what to do if medium/low"}
  ],
  "gapSkills": ["skill1", "skill2"],
  "recommendedSteps": [
    {"step": 1, "title": "string", "description": "1 sentence", "timeframe": "1-2 months"}
  ],
  "unfairAdvantage": "2-3 sentences explaining why their background is actually a STRENGTH for the target role",
  "narrative": "2-3 sentence empowering summary of this transition"
}

Include 4-6 transferable skills, 2-4 gap skills, and 4-5 recommended steps.`,
        },
        {
          role: "user",
          content: `From: ${input.fromRole}${input.yearsExperience ? ` (${input.yearsExperience} years)` : ""}
To: ${input.toRole}
${input.skills?.length ? `Current skills: ${input.skills.join(", ")}` : ""}
Analyze this career transition.`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    try {
      return JSON.parse(completion.choices[0]?.message?.content ?? "{}") as BridgeAnalysis;
    } catch {
      return {
        fromRole: input.fromRole,
        toRole: input.toRole,
        overlapPercent: 0,
        transferableSkills: [],
        gapSkills: [],
        recommendedSteps: [],
        unfairAdvantage: "",
        narrative: "Unable to analyze. Please try again.",
      };
    }
  }
}
