import { NextRequest, NextResponse } from 'next/server';

// POST /api/ai/coach
// Claude coaching endpoint — provides specific, actionable feedback on job aid fields
// When Claude API is configured, this will call claude-sonnet-4-20250514
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { field_name, field_value, aid_type } = body;

    if (!field_value?.trim()) {
      return NextResponse.json({ error: 'Field value is required' }, { status: 400 });
    }

    // TODO: Replace with actual Claude API call
    // const anthropic = new Anthropic();
    // const message = await anthropic.messages.create({
    //   model: 'claude-sonnet-4-20250514',
    //   max_tokens: 200,
    //   system: `You are a Meridian Method coaching assistant...`,
    //   messages: [{ role: 'user', content: `Field: ${field_name}\nValue: ${field_value}\nContext: ${aid_type} - ${context}` }],
    // });

    // Mock coaching response based on field context
    const feedback = generateMockCoaching(field_name, field_value, aid_type);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Coach API error:', error);
    return NextResponse.json({ feedback: 'AI coaching temporarily unavailable — your work has been saved.' }, { status: 200 });
  }
}

function generateMockCoaching(fieldName: string, value: string, aidType: string): string {
  if (value.length < 20) {
    return `Your ${fieldName.replace(/_/g, ' ')} is too brief. The Meridian Method requires specificity — vague definitions lead to ambiguous eval results. Add concrete examples or measurable criteria.`;
  }
  if (aidType === 'hypothesis' && fieldName.includes('threshold') && parseInt(value) < 70) {
    return `A confidence threshold below 70% is unusually low. Even for LOW risk features, thresholds below 70% suggest the hypothesis may not be well-defined. Reconsider whether the input class is too broad.`;
  }
  if (fieldName.includes('input_class') && !value.includes('edge')) {
    return `Your input class definition doesn't mention edge cases. Consider: what happens with very short inputs? Very long ones? Malformed data? Splitting into sub-classes often produces clearer hypotheses.`;
  }
  return `Your ${fieldName.replace(/_/g, ' ')} addresses the core requirement. To strengthen it: add a specific example that illustrates the boundary between acceptable and unacceptable for this dimension.`;
}
