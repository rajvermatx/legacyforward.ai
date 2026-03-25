export const SCORE_MAP: Record<string, number> = {
  'Fully in place': 100,
  'Partially': 60,
  'Aware but not practising': 25,
  'Not on our radar': 0,
};

export const RESPONSE_OPTIONS = ['Fully in place', 'Partially', 'Aware but not practising', 'Not on our radar'] as const;

export const DIAGNOSTIC_DIMENSIONS = [
  {
    id: 'specification',
    name: 'Specification Practice',
    shortName: 'Specification',
    roles: ['BA', 'PO'],
    questions: [
      { id: 'q1', text: 'Our team writes acceptance criteria that define a confidence threshold, not just a pass/fail outcome.' },
      { id: 'q2', text: 'We have documented what "acceptable" and "unacceptable" outputs look like for our LLM features before development begins.' },
      { id: 'q3', text: 'Our requirements distinguish between input classes — typical inputs, edge cases, and out-of-scope inputs.' },
      { id: 'q4', text: 'We assign a risk class (LOW/MEDIUM/HIGH/CRITICAL) to LLM features and set confidence thresholds accordingly.' },
    ],
  },
  {
    id: 'testing',
    name: 'Testing Practice',
    shortName: 'Testing',
    roles: ['QA'],
    questions: [
      { id: 'q5', text: 'Our test suite goes beyond exact-match testing for LLM features.' },
      { id: 'q6', text: 'We have a protocol for detecting hallucinations — not just checking whether the output exists.' },
      { id: 'q7', text: 'We run behavioral regression checks after model updates, corpus changes, or prompt modifications — even with no code change.' },
      { id: 'q8', text: 'We use an eval framework (RAGAS, LLM-as-judge, or equivalent) to score output quality systematically.' },
    ],
  },
  {
    id: 'delivery',
    name: 'Delivery Practice',
    shortName: 'Delivery',
    roles: ['PM', 'PO'],
    questions: [
      { id: 'q9', text: 'Our sprint planning accounts for eval-driven iteration rather than linear feature completion.' },
      { id: 'q10', text: 'Our definition of done for LLM features references a confidence threshold, not a binary pass/fail.' },
      { id: 'q11', text: 'Human judges are embedded in our build cycle — not only present at sprint review.' },
      { id: 'q12', text: 'We have a defined protocol when a hypothesis fails to reach its confidence threshold.' },
    ],
  },
  {
    id: 'data',
    name: 'Data & Retrieval',
    shortName: 'Data',
    roles: ['DataSteward'],
    questions: [
      { id: 'q13', text: 'We have a documented chunking strategy for our RAG corpus.' },
      { id: 'q14', text: 'We measure retrieval precision and recall — not just end-to-end output quality.' },
      { id: 'q15', text: 'We have a process for refreshing the vector index when source documents change.' },
      { id: 'q16', text: 'A named person owns corpus quality and is involved in sprint planning decisions.' },
    ],
  },
  {
    id: 'governance',
    name: 'Change & Governance',
    shortName: 'Governance',
    roles: ['ChangeManager'],
    questions: [
      { id: 'q17', text: 'We have a documented protocol for communicating to users when system behavior changes without a deployment.' },
      { id: 'q18', text: 'We classify LLM incidents by type (model drift, corpus drift, prompt regression, distribution shift) before routing them.' },
      { id: 'q19', text: 'Governance accountabilities for LLM quality are assigned to named roles, not left to "the team".' },
      { id: 'q20', text: 'We have a Drift Watch equivalent — continuous monitoring that alerts when output quality degrades beyond a threshold.' },
    ],
  },
];

export function getSeverity(score: number): 'Critical' | 'Gap' | 'Developing' | 'Strong' {
  if (score < 30) return 'Critical';
  if (score < 60) return 'Gap';
  if (score < 80) return 'Developing';
  return 'Strong';
}

export function getSeverityColor(severity: string) {
  switch (severity) {
    case 'Critical': return { bg: 'bg-score-bg-low', text: 'text-score-low', border: 'border-score-low' };
    case 'Gap': return { bg: 'bg-amber-lt', text: 'text-amber', border: 'border-amber' };
    case 'Developing': return { bg: 'bg-gold-lt', text: 'text-gold', border: 'border-gold' };
    case 'Strong': return { bg: 'bg-score-bg-high', text: 'text-score-high', border: 'border-score-high' };
    default: return { bg: 'bg-lt-gray', text: 'text-gray', border: 'border-gray' };
  }
}

export function getScoreColor(score: number) {
  if (score >= 85) return { bg: 'bg-score-bg-high', text: 'text-score-high', bar: 'bg-score-high' };
  if (score >= 70) return { bg: 'bg-score-bg-med', text: 'text-score-med', bar: 'bg-score-med' };
  return { bg: 'bg-score-bg-low', text: 'text-score-low', bar: 'bg-score-low' };
}

export const CEREMONY_TYPES = [
  { type: 'baseline' as const, name: 'Meridian Baseline Session', replaces: 'Sprint 0 / Project Kickoff', icon: 'Anchor' },
  { type: 'hypothesis' as const, name: 'Hypothesis Framing', replaces: 'Sprint Planning', icon: 'FlaskConical' },
  { type: 'standup' as const, name: 'Calibration Standup', replaces: 'Daily Standup', icon: 'Users' },
  { type: 'eval_review' as const, name: 'Eval Review', replaces: 'Sprint Review', icon: 'BarChart3' },
  { type: 'gate' as const, name: 'Meridian Gate', replaces: 'Release Gate', icon: 'ShieldCheck' },
  { type: 'drift_watch' as const, name: 'Drift Watch', replaces: 'No Agile equivalent', icon: 'Activity' },
];

export const JOB_AID_TYPES = [
  { type: 'hypothesis' as const, name: 'LLM Acceptance Criteria', description: 'Hypothesis Builder — convert feature intent into a testable behavioral hypothesis', icon: 'FileText' },
  { type: 'test_plan' as const, name: 'LLM Test Design Playbook', description: '4-dimension checklist: coverage, hallucination, regression, eval', icon: 'ClipboardCheck' },
  { type: 'sprint_planner' as const, name: 'Meridian Sprint Planner', description: 'Replaces sprint planning board for LLM feature work', icon: 'Calendar' },
  { type: 'rag_readiness' as const, name: 'RAG Readiness Assessment', description: 'Corpus readiness before any Probe cycle begins', icon: 'Database' },
];

export const RISK_CLASS_THRESHOLDS: Record<string, number> = {
  LOW: 70,
  MEDIUM: 80,
  HIGH: 90,
  CRITICAL: 95,
};

export const EVAL_CRITERIA = [
  { id: 'accuracy', name: 'Accuracy', description: 'Factually correct relative to source' },
  { id: 'groundedness', name: 'Groundedness', description: 'Claims supported by retrieved context' },
  { id: 'coherence', name: 'Coherence', description: 'Logically structured, readable' },
  { id: 'relevance', name: 'Relevance', description: 'Answers the actual question asked' },
  { id: 'completeness', name: 'Completeness', description: 'Covers required elements per hypothesis' },
  { id: 'safety', name: 'Safety', description: 'No harmful, inappropriate, or legally risky content' },
];

// Meridian benchmark scores (what a strong team looks like)
export const MERIDIAN_BENCHMARK: Record<string, number> = {
  specification: 85,
  testing: 80,
  delivery: 75,
  data: 70,
  governance: 65,
};
