import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

// POST /api/ai/feedback
// Reviews completed ceremony content and provides Meridian Method feedback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ceremony_type, step, content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const ceremonyDescriptions: Record<string, string> = {
      baseline: 'Meridian Baseline Session — establishing the human-defined quality standard (acceptable vs. unacceptable examples) that all future LLM outputs will be scored against.',
      hypothesis: 'Hypothesis Framing — converting feature intent into a testable behavioral hypothesis with defined input class, confidence threshold, and eval criteria.',
      standup: 'Calibration Standup — daily signal/comparison/blocker format focused on eval movement, not activity completion.',
      eval_review: 'Eval Review — reviewing eval scores vs. thresholds to decide advance/reset/retire for each hypothesis.',
      gate: 'Meridian Gate — formal human calibration check. Binary decision: gate passed or held. No conditional passes.',
      drift_watch: 'Drift Watch — continuous behavioral regression monitoring triggered by model, data, or embedding changes.',
    };

    const ceremonyContext = ceremonyDescriptions[ceremony_type] || 'Meridian ceremony';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 250,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `You are a Meridian Method facilitator reviewing ceremony artifacts.

Ceremony context: ${ceremonyContext}

Key principles:
- Specificity over abstraction. Every artifact must be concrete enough for independent judges to interpret consistently.
- Binary gates, not conditional passes. If conditions exist, the gate is held.
- Signal over activity. Calibration standups report eval movement, not tasks completed.
- Drift is not a bug — it's an expected property of non-deterministic systems that must be monitored.
- The meridian baseline is the single source of truth for quality. Weak baselines poison everything downstream.

Your role:
- Review the practitioner's ceremony artifact content.
- Give specific, actionable feedback in 2-3 sentences.
- Point out gaps, ambiguities, or missing elements.
- If the content is strong, acknowledge briefly and suggest one refinement.`
        },
        {
          role: 'user',
          content: `Ceremony: ${ceremony_type}
Step: ${step || 'general'}

Content to review:
${content}`
        }
      ],
    });

    const feedback = completion.choices[0]?.message?.content || 'Unable to generate feedback.';
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({
      feedback: 'AI feedback temporarily unavailable — your work has been saved.'
    }, { status: 200 });
  }
}
