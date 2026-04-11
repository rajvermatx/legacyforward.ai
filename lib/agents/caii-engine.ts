import { OCCUPATIONS, compositeScore } from "@/lib/db/seed/occupations";
import type { OccupationSeed, TaskSeed } from "@/lib/db/seed/occupations";
import OpenAI from "openai";

export interface CAIIReport {
  occupationCode: string;
  occupationTitle: string;
  overallScore: number;
  confidence: "low" | "medium" | "high";
  riskLevel: "low" | "medium" | "medium-high" | "high";
  taskScores: {
    task: string;
    score: number;
    risk: "low" | "medium" | "high";
    timeWeight: number;
  }[];
  tasksAtRisk: string[];
  tasksSafe: string[];
  skillsToLearn: string[];
  pivotPaths: { role: string; matchPercent: number }[];
  narrative: string;
}

function scoreToRisk(score: number): "low" | "medium" | "high" {
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

function overallRiskLevel(score: number): "low" | "medium" | "medium-high" | "high" {
  if (score >= 70) return "high";
  if (score >= 50) return "medium-high";
  if (score >= 30) return "medium";
  return "low";
}

function findOccupation(roleTitle: string): OccupationSeed | undefined {
  const lower = roleTitle.toLowerCase();
  return OCCUPATIONS.find((o) => {
    const t = o.title.toLowerCase();
    return t.includes(lower) || lower.includes(t) || lower.includes(t.split(" ")[0]);
  });
}

function calculateOccupationScore(occ: OccupationSeed): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const task of occ.tasks) {
    const taskScore = compositeScore(task.aiScores);
    weightedSum += taskScore * task.timeWeight;
    totalWeight += task.timeWeight;
  }
  return Math.round(weightedSum / totalWeight);
}

export class CAIIEngine {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateReport(
    roleTitle: string,
    userContext?: {
      yearsExperience?: number;
      skills?: string[];
      industry?: string;
      marketCode?: "US" | "IN";
    }
  ): Promise<CAIIReport> {
    // Find occupation in seed data
    let occupation = findOccupation(roleTitle);

    // Default to Marketing Manager if not found (for demo)
    if (!occupation) {
      occupation = OCCUPATIONS[0];
    }

    const overallScore = calculateOccupationScore(occupation);

    const taskScores = occupation.tasks.map((task) => {
      const score = compositeScore(task.aiScores);
      return {
        task: task.description,
        score,
        risk: scoreToRisk(score),
        timeWeight: task.timeWeight,
      };
    });

    const tasksAtRisk = taskScores
      .filter((t) => t.risk === "high" || t.risk === "medium")
      .sort((a, b) => b.score - a.score)
      .map((t) => t.task);

    const tasksSafe = taskScores
      .filter((t) => t.risk === "low")
      .sort((a, b) => a.score - b.score)
      .map((t) => t.task);

    // Use LLM to generate narrative, skills to learn, and pivot paths
    const narrativePrompt = `You are the LegacyForward.ai AI Impact Advisor. Generate a brief, empowering analysis for this occupation.

Occupation: ${occupation.title}
Overall CAII Score: ${overallScore}/100 (${overallRiskLevel(overallScore)} risk)
${userContext?.yearsExperience ? `Years of experience: ${userContext.yearsExperience}` : ""}
${userContext?.marketCode === "IN" ? "Market: India" : "Market: US"}

Tasks at risk (AI can do these): ${tasksAtRisk.join(", ")}
Tasks that stay human: ${tasksSafe.join(", ")}

Respond in JSON format:
{
  "narrative": "2-3 sentence empowering summary of what this score means and what to do",
  "skillsToLearn": ["skill1", "skill2", "skill3", "skill4"],
  "pivotPaths": [
    {"role": "Role Name", "matchPercent": 85},
    {"role": "Role Name", "matchPercent": 78},
    {"role": "Role Name", "matchPercent": 72},
    {"role": "Role Name", "matchPercent": 65}
  ]
}

Keep the narrative empowering, not fear-inducing. Focus on what the person CAN do.`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: narrativePrompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    let narrative = "";
    let skillsToLearn: string[] = [];
    let pivotPaths: { role: string; matchPercent: number }[] = [];

    try {
      const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
      narrative = parsed.narrative ?? "";
      skillsToLearn = parsed.skillsToLearn ?? [];
      pivotPaths = parsed.pivotPaths ?? [];
    } catch {
      narrative = `Your role as ${occupation.title} has a CAII score of ${overallScore}/100. Some tasks are automatable, but your human skills remain valuable.`;
      skillsToLearn = ["AI tools for your field", "Data literacy", "Prompt engineering"];
      pivotPaths = [{ role: "Related Senior Role", matchPercent: 75 }];
    }

    return {
      occupationCode: occupation.code,
      occupationTitle: occupation.title,
      overallScore,
      confidence: "medium",
      riskLevel: overallRiskLevel(overallScore),
      taskScores,
      tasksAtRisk,
      tasksSafe,
      skillsToLearn,
      pivotPaths,
      narrative,
    };
  }
}
