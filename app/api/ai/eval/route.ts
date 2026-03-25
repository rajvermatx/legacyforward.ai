import { NextRequest, NextResponse } from 'next/server';

// POST /api/ai/eval
// Claude eval scoring endpoint — scores LLM outputs against a meridian baseline
// When Claude API is configured, this will call claude-sonnet-4-20250514
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { criteria, output } = body;

    if (!output?.trim()) {
      return NextResponse.json({ error: 'Output text is required' }, { status: 400 });
    }

    // TODO: Replace with actual Claude API call
    // const anthropic = new Anthropic();
    // const message = await anthropic.messages.create({
    //   model: 'claude-sonnet-4-20250514',
    //   max_tokens: 400,
    //   messages: [{ role: 'user', content: `MERIDIAN BASELINE:\n...` }],
    // });

    // Mock eval scoring
    const scores: Record<string, number> = {};
    const criteriaList = criteria || [{ name: 'accuracy', weight: 1 }];

    for (const c of criteriaList) {
      const base = 60 + Math.floor(Math.random() * 30);
      scores[c.name] = base;
    }

    const overall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
    const flag = overall >= 85 ? 'ACCEPTABLE' : overall >= 70 ? 'BORDERLINE' : 'UNACCEPTABLE';

    return NextResponse.json({
      scores,
      overall: Math.round(overall),
      rationale: `This output scores ${Math.round(overall)}% overall. ${flag === 'ACCEPTABLE' ? 'It meets the meridian baseline across evaluated dimensions.' : flag === 'BORDERLINE' ? 'It approaches but does not consistently meet the meridian baseline.' : 'It falls below the meridian baseline on multiple dimensions.'}`,
      flag,
    });
  } catch (error) {
    console.error('Eval API error:', error);
    return NextResponse.json({ error: 'Eval scoring temporarily unavailable' }, { status: 500 });
  }
}
