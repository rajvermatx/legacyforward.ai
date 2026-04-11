import OpenAI from "openai";

export interface ProcessedWin {
  rawText: string;
  category: string;
  impactMetrics: string[];
  starFormat: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  tags: string[];
}

export class WinsTrackerAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async process(rawText: string): Promise<ProcessedWin> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are the CareerAlign Wins Tracker. Process a raw achievement entry into structured data.

Return JSON:
{
  "category": "leadership" | "technical" | "collaboration" | "delivery" | "innovation" | "learning",
  "impactMetrics": ["metric1", "metric2"],
  "starFormat": {
    "situation": "Brief context (1 sentence)",
    "task": "What was the challenge/goal (1 sentence)",
    "action": "What the user did (1 sentence)",
    "result": "Outcome with metrics if possible (1 sentence)"
  },
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
- Extract any numbers/metrics from the text (%, $, counts, time saved)
- If the text is brief, infer reasonable STAR details — don't leave fields empty
- Tags should be 2-4 short keywords
- Be generous in interpreting achievements — frame positively`,
        },
        {
          role: "user",
          content: rawText,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    try {
      const data = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
      return { rawText, ...data };
    } catch {
      return {
        rawText,
        category: "delivery",
        impactMetrics: [],
        starFormat: {
          situation: "Context not specified",
          task: rawText,
          action: rawText,
          result: "Completed successfully",
        },
        tags: [],
      };
    }
  }

  async generateSummary(
    wins: ProcessedWin[],
    period: string
  ): Promise<string> {
    const winsText = wins
      .map(
        (w, i) =>
          `${i + 1}. [${w.category}] ${w.rawText} (Metrics: ${w.impactMetrics.join(", ") || "none"})`
      )
      .join("\n");

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are writing a performance review self-assessment summary. Generate a professional, compelling 3-4 paragraph summary from these achievements.

Format for a PMAP/annual review. Group by theme (leadership, technical, collaboration, etc). Highlight key metrics. Use professional language. End with a forward-looking statement about growth goals.

Period: ${period}`,
        },
        {
          role: "user",
          content: `Here are my ${wins.length} achievements for ${period}:\n\n${winsText}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    return completion.choices[0]?.message?.content ?? "Unable to generate summary.";
  }
}
