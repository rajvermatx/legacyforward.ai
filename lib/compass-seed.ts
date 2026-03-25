import { useCompassStore } from './compass-store';

/**
 * Seeds a fully populated sample project so new users can experience
 * every module and every page of Meridian Compass immediately.
 *
 * Use case: "Customer Support RAG" — a team building a retrieval-augmented
 * generation system that summarises support tickets for agents.
 *
 * Team: Sarah Chen (Support Lead), Marcus Webb (QA Lead),
 *        Priya Sharma (Product Owner), Ravi Patel (Data Steward)
 */
export function seedSampleProject(): string {
  const store = useCompassStore.getState();
  const projectId = crypto.randomUUID();
  const now = new Date().toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  // ═══════════════════════════════════════════════════════════════════
  // PROJECT
  // ═══════════════════════════════════════════════════════════════════
  store.addProject({
    id: projectId,
    name: 'Customer Support RAG (Sample)',
    description:
      'A RAG system that summarises support tickets so agents can triage without reading full conversation histories. Run the Diagnostic to see your readiness, then try the Eval Scorer.',
    mode: 'solo',
    createdAt: twoWeeksAgo,
    updatedAt: now,
  });

  // ═══════════════════════════════════════════════════════════════════
  // READINESS DIAGNOSTIC
  // ═══════════════════════════════════════════════════════════════════
  store.addDiagnostic({
    id: crypto.randomUUID(),
    projectId,
    responses: {
      q1: 'Partially',
      q2: 'Aware but not practising',
      q3: 'Partially',
      q4: 'Not on our radar',
      q5: 'Partially',
      q6: 'Aware but not practising',
      q7: 'Not on our radar',
      q8: 'Aware but not practising',
      q9: 'Not on our radar',
      q10: 'Aware but not practising',
      q11: 'Not on our radar',
      q12: 'Not on our radar',
      q13: 'Partially',
      q14: 'Not on our radar',
      q15: 'Aware but not practising',
      q16: 'Partially',
      q17: 'Not on our radar',
      q18: 'Not on our radar',
      q19: 'Aware but not practising',
      q20: 'Not on our radar',
    },
    scores: {
      specification: 46,
      testing: 28,
      delivery: 13,
      data: 35,
      governance: 13,
    },
    gaps: [
      { dimension: 'Specification Practice', severity: 'Gap', score: 46 },
      { dimension: 'Testing Practice', severity: 'Critical', score: 28 },
      { dimension: 'Delivery Practice', severity: 'Critical', score: 13 },
      { dimension: 'Data & Retrieval', severity: 'Gap', score: 35 },
      { dimension: 'Change & Governance', severity: 'Critical', score: 13 },
    ],
    aiSummary:
      'Your overall readiness score is 27%. Critical gaps in Testing, Delivery, and Governance indicate that the team is building LLM features without confidence thresholds, behavioral regression checks, or governance protocols. Specification is partially in place but lacks risk-class-based thresholds. Start with the Meridian Baseline Session to establish what "acceptable" looks like before building further.',
    createdAt: twoWeeksAgo,
  });

  // ═══════════════════════════════════════════════════════════════════
  // EVAL SESSIONS — two sessions to show progression
  // ═══════════════════════════════════════════════════════════════════

  // Eval Session 1 (older — Cycle 1 baseline)
  store.addEvalSession({
    id: crypto.randomUUID(),
    projectId,
    meridian: {
      acceptable: [
        'A 3–4 sentence summary capturing the customer issue, product, and prior resolution attempts.',
        'Summary correctly identifies escalation status and ticket priority.',
      ],
      unacceptable: [
        'Summary fabricates facts not in the source ticket.',
        'Summary is too vague to act on — agent still needs to read the full ticket.',
      ],
      riskClass: 'HIGH',
      threshold: 85,
    },
    outputs: [
      {
        text: 'Customer reports intermittent login failures on the mobile app since the v4.1 update. They have cleared cache, reinstalled, and tried two different devices. Issue persists. Account is enterprise tier with SLA.',
        input: 'Ticket #4850 — 580 words, single issue, enterprise customer',
        scores: { accuracy: 84, groundedness: 72, coherence: 90, completeness: 80 },
        overall: 82,
        flag: 'BORDERLINE',
        rationale: 'Mostly accurate but the "enterprise tier with SLA" detail could not be verified in the ticket text — it may have been pulled from account metadata in a related chunk.',
      },
      {
        text: 'Customer wants to cancel.',
        input: 'Ticket #4862 — 350 words, cancellation with detailed reasons',
        scores: { accuracy: 30, groundedness: 50, coherence: 70, completeness: 15 },
        overall: 41,
        flag: 'UNACCEPTABLE',
        rationale: 'Critical failure: the ticket contains detailed reasons for cancellation (pricing, missing features, competitor comparison) — none of which appear in the summary. Completely unactionable.',
      },
      {
        text: 'Customer Jane M. reported a billing discrepancy of $23.50 on her March invoice. She notes that she downgraded from Premium to Basic on March 1 but was charged the Premium rate. Previous contact on Feb 28 confirmed the downgrade was processed.',
        input: 'Ticket #4871 — 720 words, billing issue with history',
        scores: { accuracy: 88, groundedness: 85, coherence: 92, completeness: 90 },
        overall: 89,
        flag: 'ACCEPTABLE',
        rationale: 'Accurate, grounded, and complete. Every claim traces to the ticket. The dollar amount and dates are verified. Actionable for the billing team.',
      },
    ],
    overallScore: 71,
    gateDecision: 'reset',
    aiRationale:
      'Overall confidence: 71% against a threshold of 85%. Only 1 of 3 outputs is acceptable. The vague cancellation summary is a critical failure — this pattern suggests the system struggles with tickets where the customer\'s intent requires reading between the lines. The borderline output suggests metadata leakage from the retrieval step. Recommend reset: focus on retrieval quality before prompt tuning.',
    createdAt: weekAgo,
  });

  // Eval Session 2 (recent — Cycle 2 post-fix)
  store.addEvalSession({
    id: crypto.randomUUID(),
    projectId,
    meridian: {
      acceptable: [
        'A 3–4 sentence summary capturing the customer issue, product, and prior resolution attempts.',
        'Summary correctly identifies escalation status and ticket priority.',
        'No inferred emotional state — only facts present in the ticket.',
      ],
      unacceptable: [
        'Summary fabricates facts not in the source ticket.',
        'Summary is too vague to act on.',
        'Summary infers emotional state not explicitly stated by the customer.',
      ],
      riskClass: 'HIGH',
      threshold: 85,
    },
    outputs: [
      {
        text: 'Customer Jane Doe reported that her wireless headset (SKU WH-400) disconnects intermittently during calls. She has already tried re-pairing and updating firmware. This is her third contact about this issue. Ticket is marked high priority.',
        input: 'Ticket #4892 — 650 words, single issue',
        scores: { accuracy: 91, groundedness: 88, coherence: 94, completeness: 87 },
        overall: 90,
        flag: 'ACCEPTABLE',
        rationale: 'All claims traceable to the source ticket. Concise and actionable. The SKU, troubleshooting steps, and contact history are all verified.',
      },
      {
        text: 'Customer is having problems with their order and wants a refund.',
        input: 'Ticket #4915 — 420 words, two issues (defective product + billing question)',
        scores: { accuracy: 45, groundedness: 60, coherence: 80, completeness: 22 },
        overall: 52,
        flag: 'UNACCEPTABLE',
        rationale: 'Critical failure: misses the billing question entirely. Too vague — the agent still needs to read the full ticket. This output pattern matches the Cycle 1 failure on vague summaries.',
      },
      {
        text: 'Customer Mike R. reports his SaaS dashboard shows incorrect billing totals since the March update. He has compared invoices against his bank statements and found a $47 discrepancy. He was previously told this would be fixed in v3.2, which has since been deployed. No resolution yet.',
        input: 'Ticket #4923 — 890 words, single issue with history',
        scores: { accuracy: 86, groundedness: 83, coherence: 92, completeness: 88 },
        overall: 87,
        flag: 'ACCEPTABLE',
        rationale: 'Captures the issue, prior context, and current status. Groundedness slightly lower — the v3.2 reference should be verified against the ticket. Overall acceptable.',
      },
      {
        text: 'Customer Lisa M. has experienced four consecutive delivery failures for her subscription box. Shipment tracking shows each package was returned to sender. Root cause appears to be an address formatting issue in the order system that was introduced during the March migration.',
        input: 'Ticket #4931 — 510 words, single recurring issue',
        scores: { accuracy: 85, groundedness: 82, coherence: 90, completeness: 86 },
        overall: 86,
        flag: 'ACCEPTABLE',
        rationale: 'Factual and grounded. Note: the earlier version of this output (Cycle 1) included "frustrated" — the prompt fix successfully eliminated the emotional inference. Root cause is accurately attributed.',
      },
      {
        text: 'Customer requests cancellation of premium tier. Reason: not using advanced features. Account has been on premium for 14 months. No prior complaints on file. Last login was 6 weeks ago.',
        input: 'Ticket #4940 — 280 words, cancellation request',
        scores: { accuracy: 92, groundedness: 90, coherence: 88, completeness: 85 },
        overall: 89,
        flag: 'ACCEPTABLE',
        rationale: 'Factual and grounded. Includes useful retention context (14 months, last login). Slightly mechanical tone but fully acceptable for agent triage.',
      },
    ],
    overallScore: 81,
    gateDecision: 'reset',
    aiRationale:
      'Overall confidence: 81% against a threshold of 85%. Improvement from 71% (Cycle 1) to 81% (Cycle 2) — a +10 point gain. Four of five outputs are now acceptable, up from 1 of 3. The emotional inference fix worked (Output #4 no longer infers "frustrated"). However, Output #2 remains a critical failure — the system still produces overly vague summaries for certain ticket types. Groundedness improved from 54% to 80% average. Recommend one more reset cycle focused specifically on the "vague summary" failure pattern before attempting the gate again.',
    createdAt: now,
  });

  // ═══════════════════════════════════════════════════════════════════
  store.setActiveProject(projectId);
  return projectId;
}
