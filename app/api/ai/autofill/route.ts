import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

// POST /api/ai/autofill
// Given context from previous steps, generate content for upcoming fields
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, context, targetFields } = body;

    if (!context || !targetFields?.length) {
      return NextResponse.json({ error: 'Context and targetFields are required' }, { status: 400 });
    }

    // Build a readable context string from filled fields
    const contextStr = Object.entries(context)
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}: ${v}`)
      .join('\n');

    // Build target field descriptions
    const fieldsStr = targetFields
      .map((f: { id: string; label: string; placeholder?: string; multiline?: boolean }) =>
        `- "${f.id}": ${f.label}${f.placeholder ? ` (hint: ${f.placeholder})` : ''}${f.multiline ? ' [can be detailed, multi-line]' : ' [keep brief]'}`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a Meridian Method assistant that helps practitioners fill in structured artifacts.

The Meridian Method is a calibration-first delivery methodology for LLM projects. Key concepts:
- "Meridian baseline": human-defined quality standard (acceptable vs. unacceptable examples)
- "Behavioral hypothesis": testable statement about LLM behavior for specific inputs at a confidence threshold
- "Eval": scoring LLM outputs against the baseline using human judges
- "Gate": binary pass/hold decision based on confidence threshold
- "Drift": behavioral regression from model/data/embedding changes
- Risk classes: LOW (70%), MEDIUM (80%), HIGH (90%), CRITICAL (95%) — these are minimum confidence thresholds

You are auto-filling fields for a "${type}" artifact. The practitioner has already provided some context. Generate realistic, specific, and actionable content for the requested fields.

Rules:
- Be specific and concrete — use the context to generate coherent, project-specific content
- Match the tone of a working practitioner, not a tutorial
- For numeric fields (thresholds, scores), pick realistic values aligned with the risk class
- For name/role fields, generate plausible team member names
- Never generate placeholder text like "TBD" or "[fill in]"

Respond with a JSON object where keys are field IDs and values are the suggested content strings.`
        },
        {
          role: 'user',
          content: `CONTEXT (already provided by practitioner):
${contextStr}

FIELDS TO GENERATE:
${fieldsStr}

Generate specific, realistic content for each field based on the context above.`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const suggestions = JSON.parse(raw);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Autofill API error:', error);
    return NextResponse.json({ suggestions: {} }, { status: 200 });
  }
}
