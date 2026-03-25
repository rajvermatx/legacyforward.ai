'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCompassStore, CeremonyType } from '@/lib/compass-store';
import { CEREMONY_TYPES } from '@/lib/compass-constants';
import StepWizard from '@/components/compass/ui/StepWizard';
import FieldWithCoach from '@/components/compass/ui/FieldWithCoach';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function CeremonyPage() {
  const params = useParams();
  const projectId = params.id as string;
  const ceremonyType = params.type as CeremonyType;
  const addCeremony = useCompassStore((s) => s.addCeremony);
  const ceremonies = useCompassStore((s) => s.ceremonies);
  const pastSessions = ceremonies.filter((c) => c.projectId === projectId && c.ceremonyType === ceremonyType);
  const ceremonyInfo = CEREMONY_TYPES.find((c) => c.type === ceremonyType);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [artifact, setArtifact] = useState<Record<string, any>>({});
  const [completed, setCompleted] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (key: string, value: any) => {
    setArtifact((prev) => ({ ...prev, [key]: value }));
  };

  const handleComplete = () => {
    addCeremony({
      id: crypto.randomUUID(),
      projectId,
      ceremonyType,
      status: 'complete',
      artifact,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setCompleted(true);
  };

  if (!ceremonyInfo) return null;

  if (completed) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <CheckCircle size={48} className="text-teal mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-navy mb-2">Ceremony Complete</h1>
        <p className="text-gray mb-6">{ceremonyInfo.name} has been recorded and saved to your project.</p>
        <div className="flex gap-3 justify-center">
          <Link href={`/compass/projects/${projectId}/ceremonies`} className="px-5 py-2.5 bg-gold text-white text-sm font-bold rounded-lg hover:bg-gold/90">
            Back to ceremonies
          </Link>
          <button onClick={() => { setCompleted(false); setArtifact({}); }} className="px-5 py-2.5 border border-light text-sm font-medium text-dark rounded-lg hover:bg-lt-gray">
            Run another
          </button>
        </div>
      </div>
    );
  }

  const steps = getCeremonySteps(ceremonyType, artifact, updateField);

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/compass/projects/${projectId}/ceremonies`} className="inline-flex items-center gap-1 text-sm text-mid hover:text-blue mb-4">
        <ArrowLeft size={14} /> All ceremonies
      </Link>
      <h1 className="text-2xl font-bold text-navy mb-1">{ceremonyInfo.name}</h1>
      <p className="text-sm text-gray mb-6">Replaces: {ceremonyInfo.replaces}</p>

      {/* Previous sessions */}
      {pastSessions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-dark uppercase tracking-widest mb-3">Previous Sessions</h2>
          <div className="space-y-2">
            {pastSessions.map((session) => (
              <details key={session.id} className="bg-white rounded-lg border border-light">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-lt-gray">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${session.status === 'complete' ? 'bg-teal' : 'bg-gold'}`} />
                    <span className="text-sm font-medium text-dark">
                      {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${session.status === 'complete' ? 'bg-teal-lt text-teal' : 'bg-gold-lt text-gold'}`}>
                      {session.status === 'complete' ? 'Complete' : 'In progress'}
                    </span>
                  </div>
                </summary>
                <div className="px-4 pb-4 border-t border-light pt-3">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(session.artifact).filter(([, v]) => v && typeof v === 'string' && (v as string).length > 0).slice(0, 8).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs font-bold text-gray uppercase">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}</span>
                        <p className="text-sm text-dark mt-0.5">{String(value).substring(0, 300)}{String(value).length > 300 ? '...' : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-light p-6">
        <StepWizard steps={steps} onComplete={handleComplete} completionLabel="Save ceremony artifact" />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCeremonySteps(type: CeremonyType, artifact: Record<string, any>, update: (k: string, v: any) => void) {
  switch (type) {
    case 'baseline':
      return [
        {
          title: 'Context',
          content: (
            <div className="space-y-4">
              <FieldWithCoach label="Feature name" value={artifact.featureName || ''} onChange={(v) => update('featureName', v)} placeholder="e.g. Customer support summarization" fieldName="featureName" aidType="baseline" required />
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Risk class</label>
                <select value={artifact.riskClass || ''} onChange={(e) => update('riskClass', e.target.value)} className="w-full rounded-lg border border-light px-4 py-2.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-gold/50">
                  <option value="">Select...</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <FieldWithCoach label="Human judges" value={artifact.judges || ''} onChange={(v) => update('judges', v)} placeholder="Names and roles of human judges" fieldName="judges" aidType="baseline" multiline />
            </div>
          ),
        },
        {
          title: 'Acceptable outputs',
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray">Provide 3-5 examples of outputs you would consider ACCEPTABLE.</p>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <FieldWithCoach label={`Example ${i + 1}`} value={artifact[`acceptable_${i}`] || ''} onChange={(v) => update(`acceptable_${i}`, v)} placeholder="Describe an acceptable output..." fieldName={`acceptable_example_${i + 1}`} aidType="baseline" multiline />
                  {artifact[`acceptable_${i}`] && (
                    <FieldWithCoach label="Why is this acceptable?" value={artifact[`acceptable_why_${i}`] || ''} onChange={(v) => update(`acceptable_why_${i}`, v)} placeholder="Explain why..." fieldName="acceptable_reasoning" aidType="baseline" />
                  )}
                </div>
              ))}
            </div>
          ),
        },
        {
          title: 'Unacceptable outputs',
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray">Provide 3-5 examples of outputs you would consider UNACCEPTABLE.</p>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <FieldWithCoach label={`Example ${i + 1}`} value={artifact[`unacceptable_${i}`] || ''} onChange={(v) => update(`unacceptable_${i}`, v)} placeholder="Describe an unacceptable output..." fieldName={`unacceptable_example_${i + 1}`} aidType="baseline" multiline />
                  {artifact[`unacceptable_${i}`] && (
                    <FieldWithCoach label="Why is this unacceptable?" value={artifact[`unacceptable_why_${i}`] || ''} onChange={(v) => update(`unacceptable_why_${i}`, v)} placeholder="What specifically fails..." fieldName="unacceptable_reasoning" aidType="baseline" />
                  )}
                </div>
              ))}
            </div>
          ),
        },
        {
          title: 'Boundary cases',
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray">Are there outputs where you are genuinely uncertain — acceptable to some judges but not others?</p>
              {[0, 1, 2].map((i) => (
                <FieldWithCoach key={i} label={`Boundary case ${i + 1}`} value={artifact[`boundary_${i}`] || ''} onChange={(v) => update(`boundary_${i}`, v)} placeholder="Describe the boundary case and the disagreement..." fieldName={`boundary_case_${i + 1}`} aidType="baseline" multiline />
              ))}
            </div>
          ),
        },
        {
          title: 'Summary',
          content: (
            <div className="space-y-4">
              <div className="bg-lt-gray rounded-lg p-4 space-y-3">
                <div><span className="text-xs font-bold text-gray uppercase">Feature:</span> <span className="text-sm text-dark">{artifact.featureName || '—'}</span></div>
                <div><span className="text-xs font-bold text-gray uppercase">Risk Class:</span> <span className="text-sm text-dark">{artifact.riskClass || '—'}</span></div>
                <div><span className="text-xs font-bold text-gray uppercase">Judges:</span> <span className="text-sm text-dark">{artifact.judges || '—'}</span></div>
                <div><span className="text-xs font-bold text-gray uppercase">Acceptable examples:</span> <span className="text-sm text-dark">{[0,1,2,3,4].filter((i) => artifact[`acceptable_${i}`]).length}</span></div>
                <div><span className="text-xs font-bold text-gray uppercase">Unacceptable examples:</span> <span className="text-sm text-dark">{[0,1,2,3,4].filter((i) => artifact[`unacceptable_${i}`]).length}</span></div>
                <div><span className="text-xs font-bold text-gray uppercase">Boundary cases:</span> <span className="text-sm text-dark">{[0,1,2].filter((i) => artifact[`boundary_${i}`]).length}</span></div>
              </div>
            </div>
          ),
        },
      ];

    case 'hypothesis':
      return [
        {
          title: 'Feature intent',
          content: (
            <FieldWithCoach label="Describe the feature in plain language — what should it do?" value={artifact.featureIntent || ''} onChange={(v) => update('featureIntent', v)} placeholder="e.g. The system should summarize customer support tickets..." fieldName="feature_intent" aidType="hypothesis" multiline required />
          ),
        },
        {
          title: 'Hypothesis',
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray italic">&ldquo;We believe the system will [BEHAVIOR] for [INPUT CLASS] at [THRESHOLD]% confidence, as judged by [CALIBRATORS].&rdquo;</p>
              <FieldWithCoach label="Behavior" value={artifact.behavior || ''} onChange={(v) => update('behavior', v)} placeholder="What the system will do..." fieldName="behavior" aidType="hypothesis" required />
              <FieldWithCoach label="Input class" value={artifact.inputClass || ''} onChange={(v) => update('inputClass', v)} placeholder="For what type of inputs..." fieldName="input_class" aidType="hypothesis" required />
              <FieldWithCoach label="Confidence threshold (%)" value={artifact.threshold || ''} onChange={(v) => update('threshold', v)} placeholder="e.g. 85" fieldName="confidence_threshold" aidType="hypothesis" required />
              <FieldWithCoach label="Calibrators (human judges)" value={artifact.calibrators || ''} onChange={(v) => update('calibrators', v)} placeholder="Who judges output quality..." fieldName="calibrators" aidType="hypothesis" required />
            </div>
          ),
        },
        {
          title: 'Risk & threshold',
          content: (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Risk class</label>
                <select value={artifact.riskClass || ''} onChange={(e) => update('riskClass', e.target.value)} className="w-full rounded-lg border border-light px-4 py-2.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-gold/50">
                  <option value="">Select...</option>
                  <option value="LOW">LOW — threshold suggestion: 70%</option>
                  <option value="MEDIUM">MEDIUM — threshold suggestion: 80%</option>
                  <option value="HIGH">HIGH — threshold suggestion: 90%</option>
                  <option value="CRITICAL">CRITICAL — threshold suggestion: 95%</option>
                </select>
              </div>
              {artifact.threshold && parseInt(artifact.threshold) < 70 && (
                <div className="p-3 bg-coral-lt border border-coral/20 rounded-lg text-sm text-coral">
                  Warning: A threshold below 70% is unusually low regardless of risk class. Reconsider.
                </div>
              )}
            </div>
          ),
        },
        {
          title: 'Completeness',
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray">All 5 components must be present for a complete hypothesis.</p>
              {[
                { key: 'behavior', label: 'Behavior defined' },
                { key: 'inputClass', label: 'Input class defined' },
                { key: 'threshold', label: 'Confidence threshold set' },
                { key: 'calibrators', label: 'Calibrators identified' },
                { key: 'riskClass', label: 'Risk class assigned' },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${artifact[item.key] ? 'bg-teal text-white' : 'bg-lt-gray text-gray'}`}>
                    {artifact[item.key] ? '✓' : '—'}
                  </div>
                  <span className={`text-sm ${artifact[item.key] ? 'text-dark' : 'text-gray'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          ),
        },
      ];

    case 'standup':
      return [
        {
          title: 'Signal observed',
          content: (
            <FieldWithCoach label="What signal did we observe yesterday?" value={artifact.signal || ''} onChange={(v) => update('signal', v)} placeholder="Document the actual eval score or qualitative observation — not what the team did, but what the system showed." fieldName="signal_observed" aidType="standup" multiline required />
          ),
        },
        {
          title: 'Meridian comparison',
          content: (
            <FieldWithCoach label="How does it compare to the meridian?" value={artifact.comparison || ''} onChange={(v) => update('comparison', v)} placeholder="Are you above or below threshold? By how much? What is the trend?" fieldName="meridian_comparison" aidType="standup" multiline required />
          ),
        },
        {
          title: 'Calibration blockers',
          content: (
            <FieldWithCoach label="What is blocking calibration?" value={artifact.blockers || ''} onChange={(v) => update('blockers', v)} placeholder="This is not 'what is blocking development' — it is what is preventing you from measuring quality accurately." fieldName="calibration_blockers" aidType="standup" multiline required />
          ),
        },
      ];

    case 'eval_review':
      return [
        {
          title: 'Hypothesis link',
          content: (
            <div className="space-y-4">
              <FieldWithCoach label="Which hypothesis is being reviewed?" value={artifact.hypothesis || ''} onChange={(v) => update('hypothesis', v)} placeholder="State the behavioral hypothesis under review..." fieldName="hypothesis_link" aidType="eval_review" multiline required />
              <FieldWithCoach label="Target confidence threshold" value={artifact.targetThreshold || ''} onChange={(v) => update('targetThreshold', v)} placeholder="e.g. 85%" fieldName="target_threshold" aidType="eval_review" />
            </div>
          ),
        },
        {
          title: 'Evidence',
          content: (
            <div className="space-y-4">
              <FieldWithCoach label="Current confidence score (0-100)" value={artifact.currentScore || ''} onChange={(v) => update('currentScore', v)} placeholder="e.g. 78" fieldName="current_score" aidType="eval_review" required />
              <FieldWithCoach label="Eval results summary" value={artifact.evalSummary || ''} onChange={(v) => update('evalSummary', v)} placeholder="Paste or summarize eval results..." fieldName="eval_summary" aidType="eval_review" multiline />
              <FieldWithCoach label="How many outputs were evaluated?" value={artifact.outputCount || ''} onChange={(v) => update('outputCount', v)} placeholder="e.g. 50" fieldName="output_count" aidType="eval_review" />
            </div>
          ),
        },
        {
          title: 'Human judge review',
          content: (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Have human judges reviewed a sample?</label>
                <select value={artifact.judgeReviewed || ''} onChange={(e) => update('judgeReviewed', e.target.value)} className="w-full rounded-lg border border-light px-4 py-2.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-gold/50">
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              {artifact.judgeReviewed === 'yes' && (
                <>
                  <FieldWithCoach label="Judge assessment" value={artifact.judgeAssessment || ''} onChange={(v) => update('judgeAssessment', v)} placeholder="What was the human assessment?" fieldName="judge_assessment" aidType="eval_review" multiline />
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Did human assessment agree with automated score?</label>
                    <select value={artifact.judgeAgreement || ''} onChange={(e) => update('judgeAgreement', e.target.value)} className="w-full rounded-lg border border-light px-4 py-2.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-gold/50">
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="partial">Partial</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          ),
        },
        {
          title: 'Decision',
          content: (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['advance', 'reset', 'retire'] as const).map((d) => (
                    <button key={d} onClick={() => update('decision', d)} className={`py-3 rounded-lg border text-sm font-bold transition-colors ${artifact.decision === d ? (d === 'advance' ? 'bg-teal text-white border-teal' : d === 'reset' ? 'bg-gold text-white border-gold' : 'bg-coral text-white border-coral') : 'bg-white text-dark border-light hover:border-mid'}`}>
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <FieldWithCoach label="Decision rationale" value={artifact.decisionRationale || ''} onChange={(v) => update('decisionRationale', v)} placeholder={artifact.decision === 'advance' ? 'What moves to the next tier?' : artifact.decision === 'reset' ? 'Describe the modified probe approach' : 'Document why and what was learned'} fieldName="decision_rationale" aidType="eval_review" multiline />
            </div>
          ),
        },
      ];

    case 'gate':
      return [
        {
          title: 'Gate context',
          content: (
            <div className="space-y-4">
              <FieldWithCoach label="Linked hypothesis" value={artifact.hypothesis || ''} onChange={(v) => update('hypothesis', v)} placeholder="State the hypothesis being gated..." fieldName="hypothesis" aidType="gate" multiline required />
              <FieldWithCoach label="Current confidence score" value={artifact.currentScore || ''} onChange={(v) => update('currentScore', v)} placeholder="e.g. 88" fieldName="current_score" aidType="gate" />
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Gate type</label>
                <select value={artifact.gateType || ''} onChange={(e) => update('gateType', e.target.value)} className="w-full rounded-lg border border-light px-4 py-2.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-gold/50">
                  <option value="">Select...</option>
                  <option value="tier">Tier advancement</option>
                  <option value="production">Production release</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          ),
        },
        {
          title: 'Judge confirmation',
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray">All judges must have reviewed output samples before the gate can proceed.</p>
              <FieldWithCoach label="List judges and their review status" value={artifact.judgeStatus || ''} onChange={(v) => update('judgeStatus', v)} placeholder="e.g. Jane Smith (QA) — reviewed ✓, John Doe (BA) — reviewed ✓" fieldName="judge_status" aidType="gate" multiline required />
            </div>
          ),
        },
        {
          title: 'Verdicts',
          content: (
            <div className="space-y-4">
              <FieldWithCoach label="Judge verdicts — did outputs meet the meridian?" value={artifact.verdicts || ''} onChange={(v) => update('verdicts', v)} placeholder="For each judge: Yes / No / Conditionally (with conditions)..." fieldName="judge_verdicts" aidType="gate" multiline required />
            </div>
          ),
        },
        {
          title: 'Gate outcome',
          content: (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Gate outcome</label>
                <div className="grid grid-cols-2 gap-2">
                  {['passed', 'held'].map((o) => (
                    <button key={o} onClick={() => update('outcome', o)} className={`py-3 rounded-lg border text-sm font-bold transition-colors ${artifact.outcome === o ? (o === 'passed' ? 'bg-teal text-white border-teal' : 'bg-coral text-white border-coral') : 'bg-white text-dark border-light hover:border-mid'}`}>
                      GATE {o.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <FieldWithCoach label={artifact.outcome === 'passed' ? 'What advances?' : 'What must change before resubmission?'} value={artifact.outcomeNotes || ''} onChange={(v) => update('outcomeNotes', v)} placeholder="Document the outcome..." fieldName="gate_outcome_notes" aidType="gate" multiline />
            </div>
          ),
        },
      ];

    case 'drift_watch':
      return [
        {
          title: 'Trigger config',
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray">What system changes should trigger a Drift Watch alert?</p>
              {['Model update', 'Corpus change', 'Prompt modification', 'Embedding model change', 'Input distribution shift', 'Scheduled (weekly)'].map((trigger) => (
                <label key={trigger} className="flex items-center gap-2">
                  <input type="checkbox" checked={artifact.triggers?.includes(trigger) || false} onChange={(e) => {
                    const current = artifact.triggers || [];
                    update('triggers', e.target.checked ? [...current, trigger] : current.filter((t: string) => t !== trigger));
                  }} className="w-4 h-4 rounded border-light text-gold focus:ring-gold" />
                  <span className="text-sm text-dark">{trigger}</span>
                </label>
              ))}
            </div>
          ),
        },
        {
          title: 'Monitoring targets',
          content: (
            <div className="space-y-4">
              <FieldWithCoach label="Which hypotheses should be monitored?" value={artifact.monitoredHypotheses || ''} onChange={(v) => update('monitoredHypotheses', v)} placeholder="List the hypotheses to monitor..." fieldName="monitored_hypotheses" aidType="drift_watch" multiline required />
              <FieldWithCoach label="Confidence delta that triggers an alert" value={artifact.alertDelta || '-5'} onChange={(v) => update('alertDelta', v)} placeholder="e.g. -5%" fieldName="alert_delta" aidType="drift_watch" />
            </div>
          ),
        },
        {
          title: 'Alert routing',
          content: (
            <div className="space-y-4">
              <FieldWithCoach label="Who receives alerts?" value={artifact.alertRecipients || ''} onChange={(v) => update('alertRecipients', v)} placeholder="Names and roles..." fieldName="alert_recipients" aidType="drift_watch" multiline required />
              <FieldWithCoach label="First response protocol" value={artifact.responseProtocol || ''} onChange={(v) => update('responseProtocol', v)} placeholder="What happens when an alert fires?" fieldName="response_protocol" aidType="drift_watch" multiline />
              <FieldWithCoach label="Alert acknowledgment SLA (hours)" value={artifact.ackSLA || ''} onChange={(v) => update('ackSLA', v)} placeholder="e.g. 4" fieldName="ack_sla" aidType="drift_watch" />
            </div>
          ),
        },
      ];

    default:
      return [{ title: 'Unknown ceremony', content: <p>Ceremony type not recognized.</p> }];
  }
}
