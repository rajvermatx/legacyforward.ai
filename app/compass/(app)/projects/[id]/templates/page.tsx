'use client';
import { useState } from 'react';
import { CEREMONY_TYPES, JOB_AID_TYPES } from '@/lib/compass-constants';
import { Anchor, FlaskConical, Users, BarChart3, ShieldCheck, Activity, FileText, ClipboardCheck, Calendar, Database, Copy, Check } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ceremonyIcons: Record<string, any> = { Anchor, FlaskConical, Users, BarChart3, ShieldCheck, Activity };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const aidIcons: Record<string, any> = { FileText, ClipboardCheck, Calendar, Database };

const CEREMONY_TEMPLATES: Record<string, string> = {
  baseline: `MERIDIAN BASELINE SESSION
========================

Feature name: ___________________
Risk class: LOW / MEDIUM / HIGH / CRITICAL
Human judges: ___________________

ACCEPTABLE OUTPUTS (provide 3-5):
1. Example: ___________________
   Why acceptable: ___________________
2. Example: ___________________
   Why acceptable: ___________________
3. Example: ___________________
   Why acceptable: ___________________

UNACCEPTABLE OUTPUTS (provide 3-5):
1. Example: ___________________
   Why unacceptable: ___________________
2. Example: ___________________
   Why unacceptable: ___________________
3. Example: ___________________
   Why unacceptable: ___________________

BOUNDARY CASES:
1. ___________________
2. ___________________

NOTES: ___________________`,

  hypothesis: `HYPOTHESIS FRAMING
==================

Feature intent (plain language):
___________________

HYPOTHESIS:
"We believe the system will [BEHAVIOR]
for [INPUT CLASS]
at [THRESHOLD]% confidence,
as judged by [CALIBRATORS]."

Behavior: ___________________
Input class: ___________________
Confidence threshold: ___%
Calibrators: ___________________
Risk class: LOW / MEDIUM / HIGH / CRITICAL

COMPLETENESS CHECK:
☐ Behavior defined
☐ Input class defined
☐ Confidence threshold set
☐ Calibrators identified
☐ Risk class assigned`,

  standup: `CALIBRATION STANDUP
===================
Date: ___________________

SIGNAL: What signal did we observe?
(Not what the team did — what the system showed)
___________________

COMPARISON: How does it compare to the meridian?
(Above/below threshold? By how much? Trend?)
___________________

BLOCKERS: What is blocking calibration?
(Not development blockers — measurement blockers)
___________________`,

  eval_review: `EVAL REVIEW
===========

Hypothesis under review: ___________________
Target threshold: ___%
Current score: ___%
Outputs evaluated: ___

EVAL SUMMARY:
___________________

HUMAN JUDGE REVIEW:
Judges reviewed a sample? YES / NO
Assessment: ___________________
Agreement with automated scores? YES / PARTIAL / NO

DECISION: ADVANCE / RESET / RETIRE
Rationale: ___________________`,

  gate: `MERIDIAN GATE
=============

Hypothesis: ___________________
Current confidence: ___%
Gate type: TIER / PRODUCTION / BOTH

JUDGE CONFIRMATION:
(All judges must have reviewed samples)
___________________

VERDICTS:
Judge 1: YES / NO / CONDITIONAL
Judge 2: YES / NO / CONDITIONAL
Judge 3: YES / NO / CONDITIONAL

GATE OUTCOME: PASSED / HELD
Notes: ___________________`,

  drift_watch: `DRIFT WATCH CONFIGURATION
=========================

TRIGGERS (check all that apply):
☐ Model update
☐ Corpus change
☐ Prompt modification
☐ Embedding model change
☐ Input distribution shift
☐ Scheduled (weekly)

MONITORED HYPOTHESES:
___________________

Alert delta: -___% (triggers alert)
Alert recipients: ___________________
Response protocol: ___________________
Acknowledgment SLA: ___ hours`,
};

const JOB_AID_TEMPLATES: Record<string, string> = {
  hypothesis: `LLM ACCEPTANCE CRITERIA TEMPLATE
=================================

Feature name: ___________________
Behavioral hypothesis: ___________________
Input class: ___________________
Out-of-scope inputs: ___________________
Risk class: LOW / MEDIUM / HIGH / CRITICAL
Confidence threshold: ___%
Calibrators: ___________________
Evaluation criteria: ___________________
Failure definition: ___________________
Edge cases: ___________________
Owner: ___________________
Review date: ___________________`,

  test_plan: `LLM TEST DESIGN PLAYBOOK
========================

BEHAVIORAL COVERAGE:
☐ Tests cover all defined input classes
☐ Tests include edge cases from hypothesis
☐ Tests cover out-of-scope input rejection
☐ Tests validate output format and structure
☐ Tests cover multi-turn / context-dependent scenarios

HALLUCINATION TESTING:
☐ Factuality check against source documents [BLOCKER]
☐ Attribution verification [BLOCKER]
☐ Fabrication detection for entities and numbers
☐ Confidence calibration

BEHAVIORAL REGRESSION:
☐ Baseline eval scores recorded [BLOCKER]
☐ Regression suite runs on model update
☐ Regression suite runs on corpus change
☐ Regression suite runs on prompt modification

SEMANTIC EVALUATION:
☐ Eval framework selected and configured
☐ Human judge agreement measured
☐ Automated and human scores compared
☐ Scoring rubric documented and shared`,

  sprint_planner: `MERIDIAN SPRINT PLANNER
=======================

Cycle number: ___
Cycle dates: ___________________
Hypothesis: ___________________
Risk class: LOW / MEDIUM / HIGH / CRITICAL
Current score: ___%
Target score: ___%
Human judges: ___________________

PROBE APPROACH:
___________________

EVALUATION METHOD:
___________________

DEFINITIONS:
ADVANCE if: ___________________
RESET if: ___________________
RETIRE if: ___________________

Drift Watch configured? YES / NO
Data Steward corpus readiness? YES / NO`,

  rag_readiness: `RAG READINESS ASSESSMENT
========================

SOURCE DOCUMENT QUALITY:
☐ Source documents identified and catalogued [BLOCKER]
☐ Document formats consistent or normalized [BLOCKER]
☐ Documents current and version-controlled
☐ Sensitive content flagged
☐ Document ownership assigned

CHUNKING & INDEXING:
☐ Chunking strategy documented [BLOCKER]
☐ Chunk size appropriate for content type [BLOCKER]
☐ Overlap strategy defined
☐ Metadata preserved during chunking
☐ Embedding model selected and tested

RETRIEVAL QUALITY:
☐ Retrieval precision measured
☐ Retrieval recall measured
☐ Top-k parameter tuned
☐ Reranking strategy evaluated
☐ Failure cases documented

GOVERNANCE:
☐ Refresh schedule defined for vector index
☐ Named owner for corpus quality
☐ Change process for adding/removing sources
☐ Drift Watch trigger for corpus changes`,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-mid border border-mid/30 rounded-md hover:bg-pale transition-colors">
      {copied ? <><Check size={13} className="text-teal" /> Copied</> : <><Copy size={13} /> Copy template</>}
    </button>
  );
}

export default function TemplatesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-2">Templates & Resources</h1>
      <p className="text-sm text-gray mb-8">Copy these templates into your team&apos;s docs. Each one is ready to use in your next meeting or planning session.</p>

      {/* Ceremony Templates */}
      <h2 className="text-lg font-bold text-navy mb-4">Ceremony Templates</h2>
      <p className="text-sm text-gray mb-4">These replace traditional Agile ceremonies for LLM projects.</p>
      <div className="space-y-3 mb-10">
        {CEREMONY_TYPES.map((ceremony) => {
          const Icon = ceremonyIcons[ceremony.icon] || Anchor;
          const isExpanded = expanded === ceremony.type;
          return (
            <div key={ceremony.type} className="bg-white rounded-lg border border-light overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : ceremony.type)}
                className="w-full flex items-center gap-4 p-4 hover:bg-lt-gray transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-navy text-sm">{ceremony.name}</h3>
                  <p className="text-xs text-gray">Replaces: {ceremony.replaces}</p>
                </div>
                <span className="text-xs text-mid">{isExpanded ? 'Close' : 'View template'}</span>
              </button>
              {isExpanded && CEREMONY_TEMPLATES[ceremony.type] && (
                <div className="px-4 pb-4 border-t border-light pt-3">
                  <div className="flex justify-end mb-2">
                    <CopyButton text={CEREMONY_TEMPLATES[ceremony.type]} />
                  </div>
                  <pre className="bg-lt-gray rounded-lg p-4 text-sm text-dark whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                    {CEREMONY_TEMPLATES[ceremony.type]}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Job Aid Templates */}
      <h2 className="text-lg font-bold text-navy mb-4">Job Aid Templates</h2>
      <p className="text-sm text-gray mb-4">Practitioner guides for the day-to-day work of running LLM projects.</p>
      <div className="space-y-3">
        {JOB_AID_TYPES.map((aid) => {
          const Icon = aidIcons[aid.icon] || FileText;
          const isExpanded = expanded === `aid_${aid.type}`;
          return (
            <div key={aid.type} className="bg-white rounded-lg border border-light overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : `aid_${aid.type}`)}
                className="w-full flex items-center gap-4 p-4 hover:bg-lt-gray transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-blue flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-navy text-sm">{aid.name}</h3>
                  <p className="text-xs text-gray">{aid.description}</p>
                </div>
                <span className="text-xs text-mid">{isExpanded ? 'Close' : 'View template'}</span>
              </button>
              {isExpanded && JOB_AID_TEMPLATES[aid.type] && (
                <div className="px-4 pb-4 border-t border-light pt-3">
                  <div className="flex justify-end mb-2">
                    <CopyButton text={JOB_AID_TEMPLATES[aid.type]} />
                  </div>
                  <pre className="bg-lt-gray rounded-lg p-4 text-sm text-dark whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                    {JOB_AID_TEMPLATES[aid.type]}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
