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
      'A RAG system that summarises support tickets so agents can triage without reading full conversation histories. This is a sample project — explore every module to see how the Meridian Method works in practice.',
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
  // CEREMONIES — all 6 types populated
  // ═══════════════════════════════════════════════════════════════════

  // 1. Meridian Baseline Session — COMPLETE
  store.addCeremony({
    id: crypto.randomUUID(),
    projectId,
    ceremonyType: 'baseline',
    status: 'complete',
    artifact: {
      featureName: 'Support ticket summarisation',
      riskClass: 'HIGH',
      judges: 'Sarah Chen (Senior Support Lead), Marcus Webb (QA Lead), Priya Sharma (Product Owner)',
      acceptable_0:
        'A 3–4 sentence summary capturing the customer issue, the product involved, and any prior resolution attempts. Tone is neutral and professional.',
      acceptable_why_0:
        'Agents can triage without reading the full ticket. Key facts are present and nothing is fabricated.',
      acceptable_1:
        'Summary correctly identifies that the customer has already tried resetting their device and is escalating. Includes the ticket priority level.',
      acceptable_why_1:
        'Avoids wasting agent time repeating troubleshooting steps. Priority context prevents mis-routing.',
      acceptable_2:
        'For multi-issue tickets, the summary lists each issue as a numbered point and identifies the primary issue.',
      acceptable_why_2:
        'Structured output prevents agents from missing secondary complaints.',
      unacceptable_0:
        'Summary states the customer is "frustrated and angry" when the ticket only says "I need this resolved by Friday."',
      unacceptable_why_0:
        'Infers emotional state not present in the source — a hallucination that could bias the agent\'s response.',
      unacceptable_1:
        'Summary references a product SKU that does not appear anywhere in the ticket or the customer\'s account history.',
      unacceptable_why_1:
        'Fabricated detail. If the agent acts on this, they will reference the wrong product and lose credibility.',
      unacceptable_2:
        'Summary is a single sentence: "Customer has a problem with their order." — no specifics, no context.',
      unacceptable_why_2:
        'Too vague to be actionable. The agent still needs to read the full ticket, defeating the purpose of the feature.',
      boundary_0:
        'Summary uses technical jargon from the internal knowledge base that the customer did not use. Accurate but potentially confusing if shown to the customer. Judges disagree on whether this is acceptable for agent-facing summaries.',
      boundary_1:
        'Summary mentions a related product recall that is publicly available information but was not mentioned in the ticket. Sarah says this is helpful context; Marcus says it is out-of-scope inference.',
    },
    notes: 'Baseline established with 3 judges across 2 sessions. Two boundary cases flagged for team discussion in next standup.',
    createdAt: twoWeeksAgo,
    updatedAt: twoWeeksAgo,
  });

  // 2. Hypothesis Framing — COMPLETE
  store.addCeremony({
    id: crypto.randomUUID(),
    projectId,
    ceremonyType: 'hypothesis',
    status: 'complete',
    artifact: {
      featureIntent:
        'The system should generate a concise summary of each incoming support ticket so that agents can triage and respond without reading the full conversation history. The summary must be factually grounded in the ticket content only.',
      behavior:
        'generate an accurate, 3–4 sentence summary that captures the customer issue, product context, and prior resolution attempts without fabricating or inferring details not present in the source',
      inputClass:
        'English-language support tickets between 200–2000 words with a single primary issue, from the past 90 days',
      threshold: '85',
      calibrators: 'Sarah Chen (Senior Support Lead), Marcus Webb (QA Lead)',
      riskClass: 'HIGH',
    },
    notes: 'Hypothesis framed after baseline session. Input class narrowed from "all tickets" to single-issue English tickets after discussion.',
    createdAt: twoWeeksAgo,
    updatedAt: twoWeeksAgo,
  });

  // 3. Calibration Standup — two sessions (1 complete, 1 in-progress)
  store.addCeremony({
    id: crypto.randomUUID(),
    projectId,
    ceremonyType: 'standup',
    status: 'complete',
    artifact: {
      signal:
        'Eval run on 30 tickets: overall score 68%. Accuracy scored 79% but Groundedness was only 54% — 12 of 30 summaries contained at least one claim not traceable to the source ticket. Most common failure: pulling details from similar tickets in the retrieval step.',
      comparison:
        'Well below the 85% threshold. Groundedness is the biggest gap (54% vs. 80% target). Trend: this is our first quantitative measurement, so no trend yet — establishing baseline signal.',
      blockers:
        'Cannot measure Groundedness accurately without a line-by-line attribution tool. Currently relying on manual review by Marcus, which is slow and subjective. Need to decide: build a lightweight attribution check, or accept slower manual review for now?',
    },
    notes: 'First standup using Meridian format. Team found the signal/comparison/blocker structure much more focused than the old "what did you do" format.',
    createdAt: weekAgo,
    updatedAt: weekAgo,
  });

  store.addCeremony({
    id: crypto.randomUUID(),
    projectId,
    ceremonyType: 'standup',
    status: 'in_progress',
    artifact: {
      signal:
        'Eval run on 40 tickets post-retrieval fix: overall score 71%. Accuracy held at 82%. Groundedness improved to 61% — down from 12/30 failures to 8/40. Cross-ticket contamination reduced but not eliminated.',
      comparison:
        'Still below threshold (85%). Groundedness improved by 7 points after the retrieval fix, confirming cross-ticket contamination was a significant factor. But 61% is still below our 80% Groundedness target. Rate of improvement suggests 2–3 more cycles needed.',
      blockers:
        'The retrieval step is still returning chunks from similar tickets when the primary ticket is short (<300 words). Hypothesis: short tickets have fewer unique terms, so the embedding similarity search matches more broadly. Ravi is investigating a minimum-chunk-relevance threshold.',
    },
    createdAt: now,
    updatedAt: now,
  });

  // 4. Eval Review — COMPLETE
  store.addCeremony({
    id: crypto.randomUUID(),
    projectId,
    ceremonyType: 'eval_review',
    status: 'complete',
    artifact: {
      hypothesis:
        'We believe the system will generate an accurate, 3–4 sentence summary for English-language support tickets at 85% confidence.',
      targetThreshold: '85',
      currentScore: '79',
      evalSummary:
        'Batch of 5 hand-picked outputs reviewed in detail. 3 scored ACCEPTABLE (90%, 87%, 89%), 1 BORDERLINE (79%), 1 UNACCEPTABLE (52%). The unacceptable output was a critical failure — too vague to triage. The borderline output inferred emotional state ("frustrated") not present in the source ticket.',
      outputCount: '5',
      judgeReviewed: 'yes',
      judgeAssessment:
        'Sarah Chen agreed with automated scores on 4/5 outputs. She rated Output #4 as UNACCEPTABLE (automated: BORDERLINE) because inferring customer emotion violates the team\'s grounding policy — even when the inference seems reasonable. Marcus Webb agreed with all 5 automated scores. Key insight: the team needs to explicitly codify the "no emotional inference" rule in the meridian baseline.',
      judgeAgreement: 'partial',
      decision: 'reset',
      decisionRationale:
        'Score of 79% does not meet the 85% threshold. Primary failure mode is Groundedness — the retrieval step pulls chunks from similar but unrelated tickets, causing cross-ticket hallucination. The emotional inference issue is a secondary but important failure mode. Reset approach: (1) tighten retrieval with ticket-ID-scoped filtering, (2) add explicit "no emotional inference" instruction to the prompt, (3) re-evaluate on 20 fresh tickets.',
    },
    notes: 'Judge disagreement on Output #4 led to a useful policy clarification. Updated the meridian baseline to explicitly prohibit emotional inference.',
    createdAt: weekAgo,
    updatedAt: weekAgo,
  });

  // 5. Meridian Gate — COMPLETE (held)
  store.addCeremony({
    id: crypto.randomUUID(),
    projectId,
    ceremonyType: 'gate',
    status: 'complete',
    artifact: {
      hypothesis: 'Support ticket summarisation — 85% confidence threshold, HIGH risk class',
      currentScore: '79',
      gateType: 'tier',
      judgeStatus:
        'Sarah Chen (Support Lead) — reviewed ✓\nMarcus Webb (QA Lead) — reviewed ✓\nPriya Sharma (PO) — reviewed ✓',
      verdicts:
        'Sarah Chen: Conditionally — the system must stop inferring emotional state. It is factually inaccurate and could bias agent responses.\nMarcus Webb: No — Groundedness score is below 70% on 2 of 5 outputs. This is not production-ready.\nPriya Sharma: Conditionally — acceptable for internal agent use if we add a "AI-generated" disclaimer banner, but not for customer-facing summaries.',
      outcome: 'held',
      outcomeNotes:
        'Gate HELD. Three conditions before resubmission:\n1. Retrieval precision must improve — implement ticket-ID-scoped filtering to eliminate cross-ticket contamination.\n2. Groundedness must reach ≥80% on a fresh 20-ticket eval batch.\n3. Prompt must explicitly prohibit emotional inference.\nTarget resubmission: end of Cycle 2 (approx. April 4, 2026).',
    },
    notes: 'Clear decision. All three judges aligned on the core issue (Groundedness). Priya raised a useful point about the "AI-generated" disclaimer for the eventual production release.',
    createdAt: weekAgo,
    updatedAt: weekAgo,
  });

  // 6. Drift Watch — COMPLETE
  store.addCeremony({
    id: crypto.randomUUID(),
    projectId,
    ceremonyType: 'drift_watch',
    status: 'complete',
    artifact: {
      triggers: ['Model update', 'Corpus change', 'Prompt modification', 'Embedding model change'],
      monitoredHypotheses:
        'Primary: Support ticket summarisation hypothesis (85% threshold, HIGH risk)\nFuture: FAQ auto-response hypothesis (pending framing — expected Cycle 3)',
      alertDelta: '-5',
      alertRecipients:
        'Marcus Webb (QA Lead) — primary responder\nSarah Chen (Support Lead) — secondary, reviews any output quality alerts\nPriya Sharma (PO) — escalation only, notified if drift persists >48 hours',
      responseProtocol:
        '1. Acknowledge alert within 4 hours (business hours).\n2. Run a quick eval on 10 recent outputs to confirm drift is real.\n3. If confirmed: pause any pending gate decisions and trigger an ad-hoc Eval Review.\n4. If false alarm: document in Drift Log with root cause analysis.\n5. If drift exceeds -10%: escalate to Priya and consider pausing the feature.',
      ackSLA: '4',
    },
    notes: 'Configuration agreed by full team. Ravi will set up a weekly corpus-change notification from the support ticket database.',
    createdAt: weekAgo,
    updatedAt: weekAgo,
  });

  // ═══════════════════════════════════════════════════════════════════
  // PRACTITIONER WORKBENCH — all 4 job aids populated
  // ═══════════════════════════════════════════════════════════════════

  // Job Aid 1: Hypothesis Builder — 100% complete
  store.addJobAid({
    id: crypto.randomUUID(),
    projectId,
    aidType: 'hypothesis',
    fields: {
      featureName: 'Support ticket summarisation',
      hypothesis:
        'We believe the system will generate an accurate, 3–4 sentence summary that captures the customer issue, product context, and prior resolution attempts for English-language support tickets between 200–2000 words at 85% confidence, as judged by Sarah Chen and Marcus Webb.',
      inputClass:
        'English-language support tickets, 200–2000 words, single primary issue, from the last 90 days of the CRM system',
      outOfScope:
        'Non-English tickets, tickets with images/screenshots as primary context, internal agent-to-agent tickets, tickets shorter than 50 words (flagged as insufficient context)',
      riskClass: 'HIGH',
      threshold: '85',
      calibrators: 'Sarah Chen (Senior Support Lead), Marcus Webb (QA Lead)',
      evalCriteria:
        'Accuracy: factual correctness against the source ticket\nGroundedness: every claim must be traceable to specific text in the ticket\nCompleteness: must capture issue + product + prior resolution attempts\nCoherence: readable, professional tone suitable for agent consumption',
      failureDefinition:
        'Critical failure: any fabricated fact not present in the source ticket (zero tolerance). Major failure: missing the primary customer issue. Minor failure: missing secondary details or slightly awkward phrasing.',
      edgeCases:
        'Multi-issue tickets: list issues as numbered points, identify the primary issue.\nVery short tickets (<50 words): flag as "insufficient context" rather than attempting a summary.\nTickets with profanity: summarise the issue without reproducing the language.\nTickets referencing previous interactions: summarise only what is in this ticket, not inferred history.',
      owner: 'Priya Sharma (Product Owner)',
      reviewDate: '2026-04-07',
    },
    aiFeedback: {
      hypothesis:
        'Well-structured hypothesis with all five components present. The input class is specific and the threshold is appropriate for HIGH risk. Consider adding a note about how multi-issue tickets will be handled, as your input class says "single primary issue" but edge cases mention multi-issue scenarios.',
    },
    completeness: 100,
    createdAt: twoWeeksAgo,
    updatedAt: twoWeeksAgo,
  });

  // Job Aid 2: Test Plan — 47% complete (in progress)
  store.addJobAid({
    id: crypto.randomUUID(),
    projectId,
    aidType: 'test_plan',
    fields: {
      cov_1: true,
      cov_2: true,
      cov_3: true,
      cov_4: true,
      cov_5: false,
      hal_1: true,
      hal_2: true,
      hal_3: false,
      hal_4: false,
      reg_1: true,
      reg_2: false,
      reg_3: false,
      reg_4: false,
      eval_1: true,
      eval_2: false,
      eval_3: false,
      eval_4: false,
    },
    completeness: 47,
    createdAt: weekAgo,
    updatedAt: now,
  });

  // Job Aid 3: Sprint Planner — 100% complete
  store.addJobAid({
    id: crypto.randomUUID(),
    projectId,
    aidType: 'sprint_planner',
    fields: {
      cycleNumber: '2',
      dates: 'Mar 24 – Apr 4, 2026',
      hypothesis:
        'We believe the system will generate an accurate, 3–4 sentence summary for English-language support tickets at 85% confidence.',
      riskClass: 'HIGH',
      currentScore: '79',
      targetScore: '85',
      judges: 'Sarah Chen (Senior Support Lead), Marcus Webb (QA Lead)',
      probeApproach:
        'Two-pronged fix: (1) Add ticket-ID-scoped filtering to the retrieval step to eliminate cross-ticket contamination — this addresses the Groundedness failures. (2) Add an explicit "do not infer emotional state" instruction to the summarisation prompt — this addresses the judge disagreement from the Eval Review.',
      evalMethod:
        'Run full eval on 20 fresh tickets after both fixes are deployed. Score on all 4 dimensions (Accuracy, Groundedness, Coherence, Completeness). Human judges (Sarah + Marcus) review all outputs flagged BORDERLINE or UNACCEPTABLE.',
      advanceDefinition:
        'Overall score ≥85% AND Groundedness ≥80% AND <5% UNACCEPTABLE outputs AND both judges agree no critical failures. If all conditions met → advance to production gate.',
      resetDefinition:
        'Score improved but still <85%, OR Groundedness improved but new failure mode emerged. Document the lagging dimension and design a targeted probe for Cycle 3.',
      retireDefinition:
        'Score has not improved for 2 consecutive cycles despite different probe approaches. Escalate to architecture review — the RAG pipeline may need fundamental changes (e.g. different embedding model, re-chunking strategy).',
      driftWatch: 'Yes',
      corpusReady: 'Yes',
    },
    aiFeedback: {
      probeApproach:
        'Good two-pronged approach. The retrieval fix targets the quantitative gap (Groundedness) while the prompt change targets the qualitative gap (emotional inference). Consider measuring each fix independently to understand which has more impact.',
    },
    completeness: 100,
    createdAt: weekAgo,
    updatedAt: weekAgo,
  });

  // Job Aid 4: RAG Readiness — 26% complete (in progress, with blockers)
  store.addJobAid({
    id: crypto.randomUUID(),
    projectId,
    aidType: 'rag_readiness',
    fields: {
      src_1: true,
      src_2: true,
      src_3: false,
      src_4: true,
      src_5: false,
      chk_1: true,
      chk_2: false,
      chk_3: false,
      chk_4: false,
      chk_5: true,
      ret_1: false,
      ret_2: false,
      ret_3: false,
      ret_4: false,
      ret_5: false,
      gov_1: false,
      gov_2: false,
      gov_3: false,
      gov_4: false,
    },
    aiFeedback: {
      sourceQuality:
        'You have BLOCKER items unchecked: source documents are not version-controlled and document ownership is not assigned. These must be resolved before any Probe cycle can produce reliable results — changes to the corpus during a cycle will invalidate your eval scores.',
    },
    completeness: 26,
    createdAt: weekAgo,
    updatedAt: now,
  });

  // ═══════════════════════════════════════════════════════════════════
  // EVAL SESSIONS — two sessions to show history
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
