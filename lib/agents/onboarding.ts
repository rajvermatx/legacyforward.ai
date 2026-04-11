import OpenAI from "openai";
import type { Agent, AgentContext, AgentResponse } from "./base";
import type { ChatMessage } from "@/lib/app-types";

const SYSTEM_PROMPT = `You are the LegacyForward.ai Onboarding Coach. Your job is to conduct a warm, conversational coaching session to build the user's Career Snapshot. This is NOT a form — it's a first coaching session.

## Your Approach
- Be warm, professional, and encouraging
- Ask one question at a time — never overwhelm
- Acknowledge what the user shares before moving on
- Adapt your language based on their market (US vs India)
- If they say "I don't know" to aspirations, switch to discovery mode — suggest options based on their background

## 5 Stages (follow in order, but be natural — don't announce stages)

### Stage 1: Identity
Ask about their current role, company type, and how long they've been doing it.
Extract: currentRole, currentIndustry, yearsExperience

### Stage 2: Experience
Ask about their career journey — what they've done, what they're proud of.
Offer to accept a resume upload or LinkedIn profile.
Extract: workHistory, education

### Stage 3: Aspirations
Ask: "If you could wave a magic wand, what would your ideal role look like in 2 years?"
Handle vague answers with suggestions based on their background.
Extract: targetRoles, timelineMonths, priorities

### Stage 4: Skills
Ask about key skills, or infer from their stories.
Extract: skills (with proficiency levels)

### Stage 5: AI Readiness
Ask: "How much are you using AI in your work today?"
Gauge anxiety vs curiosity. Be reassuring if they're anxious.
Extract: aiReadiness (level, toolsUsed, sentiment, companyAdopting)

## Urgency Detection
If the user mentions being laid off, fired, on notice, or "on bench" (India), immediately acknowledge their situation with empathy and switch to Rapid Response Mode — compress the remaining questions and move quickly.

## Output Rules
- Keep responses under 150 words
- End each response with a clear question or prompt
- After completing all 5 stages, summarize what you've learned and tell them you're generating their Career Snapshot
- When done, include this exact marker at the end of your final message: [ONBOARDING_COMPLETE]

## Persona Detection
Based on the conversation, identify which persona fits:
- Pivoter: experienced professional feeling disrupted by AI (40s-50s+)
- Climber: wants to level up strategically (25-40)
- Explorer: unsure what they want, exploring (early career)
- Adapter: employed and stable, wants to future-proof
- Rebuilder: recently laid off or facing layoff (urgent)`;

export class OnboardingAgent implements Agent {
  name = "onboarding";
  systemPrompt = SYSTEM_PROMPT;
  model = "gpt-4o-mini";

  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async handle(
    userMessage: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: this.systemPrompt },
    ];

    // Inject market context
    if (context.marketCode === "IN") {
      messages.push({
        role: "system",
        content:
          'The user is in the Indian market. Use Indian terminology (e.g., "fresher" for entry-level, "on bench" for between projects at IT services firms, "notice period" instead of "two weeks notice"). Reference Indian companies, job portals (Naukri), and salary in INR when relevant.',
      });
    }

    // Add conversation history
    for (const msg of context.conversationHistory) {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    // Add current message
    messages.push({ role: "user", content: userMessage });

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content ?? "";

    return {
      content,
      handoffTo: content.includes("[ONBOARDING_COMPLETE]")
        ? "coach"
        : undefined,
    };
  }
}
