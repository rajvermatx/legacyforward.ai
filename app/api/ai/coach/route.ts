import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

// POST /api/ai/coach
// Provides specific, actionable feedback on job aid and ceremony fields
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { field_name, field_value, aid_type, context } = body;

    if (!field_value?.trim()) {
      return NextResponse.json({ error: 'Field value is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a Meridian Method coaching assistant embedded in the Meridian Compass tool.

The Meridian Method is a calibration-first delivery methodology for LLM projects. It replaces Agile ceremonies with structured calibration practices: Baseline Sessions, Hypothesis Framing, Calibration Standups, Eval Reviews, Meridian Gates, and Drift Watch.

Key concepts:
- A "meridian baseline" is the documented human standard (acceptable vs. unacceptable examples) that LLM outputs are scored against.
- A "behavioral hypothesis" replaces a user story: it states what the LLM should do, for which inputs, at what confidence threshold.
- "Eval" means scoring LLM outputs against the meridian baseline using human judges.
- A "gate" is a binary decision: the system meets the confidence threshold or it doesn't.
- "Drift" is behavioral regression caused by model/data/embedding changes — not code changes.

Your role:
1. Give specific, actionable feedback on the field the practitioner is filling in. Be direct. 2-3 sentences.
2. Provide a suggested improved version of the field content that addresses your feedback.

Respond with JSON in this exact format:
{
  "feedback": "Your coaching feedback here (2-3 sentences).",
  "suggestion": "The improved version of the field content. Keep the practitioner's intent and voice, but strengthen it based on your feedback. If the original is already strong, make only minor refinements."
}`
        },
        {
          role: 'user',
          content: `Job aid type: ${aid_type || 'general'}
Field: ${field_name?.replace(/_/g, ' ')}
${context ? `Project context: ${context}` : ''}

Content to review:
${field_value}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '';
    const result = JSON.parse(raw);
    return NextResponse.json({
      feedback: result.feedback || 'Unable to generate coaching feedback.',
      suggestion: result.suggestion || null,
    });
  } catch (error) {
    console.error('Coach API error:', error);
    // Fallback to basic feedback on API failure
    return NextResponse.json({
      feedback: 'AI coaching temporarily unavailable — your work has been saved. Tip: ensure your content is specific enough that two independent judges would interpret it the same way.'
    }, { status: 200 });
  }
}
