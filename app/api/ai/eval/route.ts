import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

// POST /api/ai/eval
// Scores LLM outputs against a meridian baseline using AI-as-judge
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { criteria, output, meridian } = body;

    if (!output?.trim()) {
      return NextResponse.json({ error: 'Output text is required' }, { status: 400 });
    }

    const criteriaList = criteria || [{ name: 'accuracy', weight: 1 }];
    const criteriaNames = criteriaList.map((c: { name: string }) => c.name);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an LLM output evaluator using the Meridian Method.

You score LLM outputs against a human-defined meridian baseline. The meridian baseline contains examples of acceptable and unacceptable outputs that define the quality standard.

Score each criterion on a 0-100 scale:
- 90-100: Exceeds the meridian baseline
- 80-89: Meets the meridian baseline
- 70-79: Approaches but does not consistently meet the baseline
- 60-69: Falls short on this dimension
- Below 60: Significantly below the baseline

Respond with valid JSON in this exact format:
{
  "scores": { "criterion_name": score_number, ... },
  "overall": overall_average_number,
  "flag": "ACCEPTABLE" | "BORDERLINE" | "UNACCEPTABLE",
  "rationale": "2-3 sentence explanation referencing specific strengths and weaknesses"
}

Flag rules:
- ACCEPTABLE: overall >= 85
- BORDERLINE: overall >= 70
- UNACCEPTABLE: overall < 70`
        },
        {
          role: 'user',
          content: `${meridian ? `MERIDIAN BASELINE:
Acceptable examples: ${meridian.acceptable || 'Not provided'}
Unacceptable examples: ${meridian.unacceptable || 'Not provided'}
Risk class: ${meridian.riskClass || 'MEDIUM'}
Confidence threshold: ${meridian.threshold || 80}%

` : ''}CRITERIA TO SCORE: ${criteriaNames.join(', ')}

OUTPUT TO EVALUATE:
${output}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '';
    const result = JSON.parse(raw);

    // Ensure all criteria have scores
    for (const c of criteriaList) {
      if (!(c.name in result.scores)) {
        result.scores[c.name] = 70;
      }
    }

    // Recalculate overall to be safe
    const values = Object.values(result.scores) as number[];
    result.overall = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    result.flag = result.overall >= 85 ? 'ACCEPTABLE' : result.overall >= 70 ? 'BORDERLINE' : 'UNACCEPTABLE';

    return NextResponse.json(result);
  } catch (error) {
    console.error('Eval API error:', error);
    return NextResponse.json({ error: 'Eval scoring temporarily unavailable. Please try again.' }, { status: 500 });
  }
}
