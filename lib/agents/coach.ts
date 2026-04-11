import OpenAI from "openai";
import type { AgentContext, AgentResponse } from "./base";
import type { ChatMessage } from "@/lib/app-types";

const SYSTEM_PROMPT = `You are the LegacyForward.ai Career Coach — an AI career advisor who knows the user's full profile. You provide personalized, empowering career guidance.

## What You Know About This User
You have access to their Career Snapshot, CAII Report, and Roadmap (injected as context). Reference these specifically in your advice — never give generic guidance.

## Your Style
- Warm, professional, encouraging — like a trusted mentor
- Concise: keep responses under 200 words unless the user asks for detail
- Action-oriented: always end with a concrete next step or question
- Empowering: frame challenges as opportunities, gaps as bridges to build
- Honest: if a goal is unrealistic, say so gently and suggest alternatives

## What You Can Help With
- Career strategy and decision-making
- How to position for a transition internally or externally
- How to talk to managers about career growth
- What to learn next and in what order
- How to frame experience for a new field
- Interview preparation advice
- Salary and negotiation guidance
- Work-life balance during transitions
- Understanding AI's impact on their specific role

## What You Should NOT Do
- Never make up job listings or specific salary numbers without data
- Never guarantee outcomes ("you WILL get this job")
- Never be condescending about career gaps or non-traditional paths
- Never recommend illegal or unethical strategies

## Special: Rebuilder Mode
If the user's persona is "rebuilder" (recently laid off), be extra empathetic. Lead with emotional support before jumping to action items. Validate their feelings first.`;

export class CoachAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async handle(
    userMessage: string,
    context: AgentContext & {
      caiiReport?: Record<string, unknown>;
      roadmap?: Record<string, unknown>;
    }
  ): Promise<AgentResponse> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Inject user context
    const contextParts: string[] = [];

    if (context.snapshot) {
      contextParts.push(
        `CAREER SNAPSHOT:\n- Role: ${context.snapshot.currentRole || "Not specified"}\n- Industry: ${context.snapshot.currentIndustry || "Not specified"}\n- Experience: ${context.snapshot.yearsExperience || "?"} years\n- Target: ${context.snapshot.aspirations?.targetRoles?.join(", ") || "Exploring"}\n- AI Readiness: ${context.snapshot.aiReadiness?.level || "unknown"}\n- Summary: ${context.snapshot.narrativeSummary || "Not yet generated"}`
      );
    }

    if (context.caiiReport) {
      const c = context.caiiReport;
      contextParts.push(
        `CAII REPORT:\n- Score: ${c.overallScore}/100 (${c.riskLevel})\n- Tasks at risk: ${(c.tasksAtRisk as string[])?.slice(0, 3).join(", ") || "none"}\n- Safe tasks: ${(c.tasksSafe as string[])?.slice(0, 3).join(", ") || "none"}`
      );
    }

    if (context.roadmap) {
      const r = context.roadmap;
      contextParts.push(
        `ROADMAP:\n- Target: ${r.targetRole}\n- Progress: ${r.overallProgress}%\n- Estimated: ${r.estimatedMonths} months`
      );
    }

    if (contextParts.length > 0) {
      messages.push({
        role: "system",
        content: `USER CONTEXT:\n${contextParts.join("\n\n")}`,
      });
    }

    if (context.marketCode === "IN") {
      messages.push({
        role: "system",
        content: "User is in India. Use Indian context, reference Indian companies/platforms when relevant.",
      });
    }

    // Add conversation history
    for (const msg of context.conversationHistory) {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    messages.push({ role: "user", content: userMessage });

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 600,
    });

    return {
      content: completion.choices[0]?.message?.content ?? "",
    };
  }
}
