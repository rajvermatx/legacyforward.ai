import { NextRequest, NextResponse } from 'next/server';

// POST /api/ai/feedback
// Claude ceremony feedback endpoint — reviews completed ceremony content
// When Claude API is configured, this will call claude-sonnet-4-20250514
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ceremony_type, step, content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // TODO: Replace with actual Claude API call
    // const anthropic = new Anthropic();
    // const message = await anthropic.messages.create({
    //   model: 'claude-sonnet-4-20250514',
    //   max_tokens: 300,
    //   messages: [...],
    // });

    // Mock feedback based on ceremony type
    const feedback = generateMockFeedback(ceremony_type, step, content);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ feedback: 'AI feedback temporarily unavailable — your work has been saved.' }, { status: 200 });
  }
}

function generateMockFeedback(ceremonyType: string, step: string, content: string): string {
  if (content.length < 30) {
    return 'This response needs more detail. The Meridian Method requires explicit documentation — implicit understanding does not survive team changes or model updates.';
  }

  switch (ceremonyType) {
    case 'baseline':
      return 'Your meridian baseline is taking shape. Ensure each example is specific enough that two independent judges would classify it the same way. Ambiguous examples weaken the entire calibration chain.';
    case 'hypothesis':
      return 'Good hypothesis structure. Verify that your input class is narrow enough to be testable — broad input classes often mask significant variation in system behavior across sub-populations.';
    case 'standup':
      return 'Focus on the signal, not the activity. The key question is: did the system behavior move closer to or further from the meridian? If you cannot answer quantitatively, your eval framework may need strengthening.';
    case 'eval_review':
      return 'Review the distribution of scores, not just the average. A high average with wide variance suggests inconsistent behavior that may not survive edge cases in production.';
    case 'gate':
      return 'Gate decisions should be binary: passed or held. Conditional passes create ambiguity. If conditions exist, the gate is held until those conditions are resolved.';
    case 'drift_watch':
      return 'Ensure your alert thresholds are calibrated against actual production variance. Thresholds that are too tight generate alert fatigue; too loose and genuine drift goes undetected.';
    default:
      return 'Your documentation is progressing well. Consider adding specific examples to strengthen the artifact.';
  }
}
