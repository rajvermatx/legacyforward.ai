'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCompassStore, RiskClass } from '@/lib/compass-store';
import { EVAL_CRITERIA, RISK_CLASS_THRESHOLDS } from '@/lib/compass-constants';
import ScoreBadge from '@/components/compass/ui/ScoreBadge';
import ScoreBar from '@/components/compass/ui/ScoreBar';
import Link from 'next/link';
import { Plus, Trash2, Play } from 'lucide-react';

type EvalStep = 'meridian' | 'criteria' | 'outputs' | 'results';

export default function EvalScorerPage() {
  const params = useParams();
  const projectId = params.id as string;
  const addEvalSession = useCompassStore((s) => s.addEvalSession);
  const evalSessions = useCompassStore((s) => s.evalSessions);
  const projectSessions = evalSessions.filter((e) => e.projectId === projectId);

  const [step, setStep] = useState<EvalStep>('meridian');
  const [meridian, setMeridian] = useState({ acceptable: [''], unacceptable: [''], riskClass: '' as RiskClass | '', threshold: 80 });
  const [selectedCriteria, setSelectedCriteria] = useState<Record<string, number>>({});
  const [outputs, setOutputs] = useState<{ text: string; input: string }[]>([{ text: '', input: '' }]);
  const [results, setResults] = useState<{
    overallScore: number;
    meridian: { threshold: number };
    gateDecision: string;
    aiRationale: string;
    outputs: { text: string; input?: string; scores: Record<string, number>; overall: number; flag: string; rationale: string }[];
  } | null>(null);

  const toggleCriterion = (id: string) => {
    setSelectedCriteria((prev) => {
      const next = { ...prev };
      if (id in next) { delete next[id]; } else { next[id] = 1; }
      return next;
    });
  };

  const addOutput = () => setOutputs((prev) => [...prev, { text: '', input: '' }]);
  const removeOutput = (i: number) => setOutputs((prev) => prev.filter((_, idx) => idx !== i));
  const updateOutput = (i: number, key: 'text' | 'input', value: string) => {
    setOutputs((prev) => prev.map((o, idx) => idx === i ? { ...o, [key]: value } : o));
  };

  const scoreOutputs = () => {
    // Rule-based scoring simulation
    const criteriaKeys = Object.keys(selectedCriteria);
    const scored = outputs.filter((o) => o.text.trim()).map((output) => {
      const scores: Record<string, number> = {};
      criteriaKeys.forEach((c) => {
        // Simulated score based on output length and complexity
        const base = Math.min(95, 50 + output.text.length / 5);
        scores[c] = Math.round(base + (Math.random() * 20 - 10));
      });
      const overall = criteriaKeys.length > 0
        ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / criteriaKeys.length)
        : 0;
      const flag = overall >= 85 ? 'ACCEPTABLE' : overall >= 70 ? 'BORDERLINE' : 'UNACCEPTABLE';
      return { ...output, scores, overall, flag, rationale: `Score of ${overall}% ${flag === 'ACCEPTABLE' ? 'meets' : 'does not meet'} the meridian threshold.` };
    });

    const overallScore = scored.length > 0 ? Math.round(scored.reduce((a, b) => a + b.overall, 0) / scored.length) : 0;
    const threshold = meridian.threshold;
    const unacceptableCount = scored.filter((s) => s.flag === 'UNACCEPTABLE').length;
    const unacceptablePct = scored.length > 0 ? (unacceptableCount / scored.length) * 100 : 0;

    let gateDecision: 'advance' | 'reset' | 'retire' | 'pending' = 'pending';
    if (overallScore >= threshold && unacceptablePct < 5) gateDecision = 'advance';
    else if (overallScore >= threshold && unacceptablePct >= 5) gateDecision = 'advance'; // with caution
    else if (overallScore >= threshold - 10) gateDecision = 'reset';
    else gateDecision = 'retire';

    const session = {
      id: crypto.randomUUID(),
      projectId,
      meridian: { acceptable: meridian.acceptable.filter(Boolean), unacceptable: meridian.unacceptable.filter(Boolean), riskClass: (meridian.riskClass || 'MEDIUM') as RiskClass, threshold },
      outputs: scored,
      overallScore,
      gateDecision,
      aiRationale: `Overall confidence: ${overallScore}% against a threshold of ${threshold}%. ${gateDecision === 'advance' ? 'Score meets threshold — consider advancing.' : gateDecision === 'reset' ? 'Score is within 10% of threshold — consider resetting with a modified probe.' : 'Score is significantly below threshold — consider retiring this hypothesis.'}`,
      createdAt: new Date().toISOString(),
    };

    addEvalSession(session);
    setResults(session);
    setStep('results');
  };

  if (step === 'results' && results) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-navy mb-6">Eval Results</h1>

        {/* Overall score */}
        <div className="bg-white rounded-lg border border-light p-6 mb-6">
          <div className="flex items-center gap-6">
            <ScoreBadge score={results.overallScore} size="lg" />
            <div className="flex-1">
              <h2 className="font-bold text-navy">Overall Confidence</h2>
              <ScoreBar score={results.overallScore} threshold={results.meridian.threshold} label="" />
            </div>
          </div>
          <div className={`mt-4 p-3 rounded-lg ${results.gateDecision === 'advance' ? 'bg-teal-lt border border-teal/20' : results.gateDecision === 'reset' ? 'bg-gold-lt border border-gold/20' : 'bg-coral-lt border border-coral/20'}`}>
            <p className="text-sm font-bold mb-1">
              Gate recommendation: {results.gateDecision.toUpperCase()}
            </p>
            <p className="text-sm">{results.aiRationale}</p>
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-lg border border-light p-6 mb-6">
          <h2 className="font-bold text-navy mb-3">Distribution</h2>
          <div className="flex gap-4">
            {['ACCEPTABLE', 'BORDERLINE', 'UNACCEPTABLE'].map((flag) => {
              const count = results.outputs.filter((o: { flag: string }) => o.flag === flag).length;
              const color = flag === 'ACCEPTABLE' ? 'text-teal bg-teal-lt' : flag === 'BORDERLINE' ? 'text-amber bg-amber-lt' : 'text-coral bg-coral-lt';
              return (
                <div key={flag} className={`flex-1 text-center py-3 rounded-lg ${color}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs font-medium">{flag}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-output breakdown */}
        <div className="bg-white rounded-lg border border-light p-6 mb-6">
          <h2 className="font-bold text-navy mb-3">Per-output Scores</h2>
          <div className="space-y-3">
            {results.outputs.map((output: { text: string; input?: string; scores: Record<string, number>; overall: number; flag: string; rationale: string }, i: number) => (
              <details key={i} className="border border-light rounded-lg">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-lt-gray">
                  <span className="text-sm font-medium text-dark">Output {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={output.overall} size="sm" />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${output.flag === 'ACCEPTABLE' ? 'bg-teal-lt text-teal' : output.flag === 'BORDERLINE' ? 'bg-amber-lt text-amber' : 'bg-coral-lt text-coral'}`}>{output.flag}</span>
                  </div>
                </summary>
                <div className="px-4 pb-4 space-y-2">
                  <p className="text-xs text-gray">{output.text.substring(0, 200)}{output.text.length > 200 ? '...' : ''}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(output.scores).map(([criterion, score]: [string, number]) => {
                      const c = EVAL_CRITERIA.find((ec) => ec.id === criterion);
                      return (
                        <div key={criterion} className="flex items-center gap-2 text-xs">
                          <span className="text-gray">{c?.name || criterion}:</span>
                          <span className="font-bold text-dark">{score}%</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray italic mt-1">{output.rationale}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setStep('meridian'); setResults(null); setOutputs([{ text: '', input: '' }]); }} className="px-5 py-2.5 bg-gold text-white text-sm font-bold rounded-lg hover:bg-gold/90">
            New eval session
          </button>
          <Link href={`/compass/projects/${projectId}`} className="px-5 py-2.5 border border-light text-sm font-medium text-dark rounded-lg hover:bg-lt-gray">
            Back to project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-2">Eval Scorer</h1>
      <p className="text-sm text-gray mb-6">Score LLM outputs against your human meridian baseline.</p>

      {/* Step indicators */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'meridian', label: '1. Define Meridian' },
          { key: 'criteria', label: '2. Criteria' },
          { key: 'outputs', label: '3. Submit Outputs' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStep(s.key as EvalStep)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${step === s.key ? 'bg-navy text-white' : 'bg-white border border-light text-gray'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-light p-6">
        {step === 'meridian' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-navy mb-4">Define the Meridian Baseline</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Acceptable output examples</label>
                  {meridian.acceptable.map((ex, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <textarea value={ex} onChange={(e) => { const next = [...meridian.acceptable]; next[i] = e.target.value; setMeridian((m) => ({ ...m, acceptable: next })); }} className="flex-1 rounded-lg border border-light px-4 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-gold/50" rows={2} placeholder={`Acceptable example ${i + 1}`} />
                    </div>
                  ))}
                  <button onClick={() => setMeridian((m) => ({ ...m, acceptable: [...m.acceptable, ''] }))} className="text-xs text-mid hover:text-blue">+ Add example</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Unacceptable output examples</label>
                  {meridian.unacceptable.map((ex, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <textarea value={ex} onChange={(e) => { const next = [...meridian.unacceptable]; next[i] = e.target.value; setMeridian((m) => ({ ...m, unacceptable: next })); }} className="flex-1 rounded-lg border border-light px-4 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-gold/50" rows={2} placeholder={`Unacceptable example ${i + 1}`} />
                    </div>
                  ))}
                  <button onClick={() => setMeridian((m) => ({ ...m, unacceptable: [...m.unacceptable, ''] }))} className="text-xs text-mid hover:text-blue">+ Add example</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Risk class</label>
                    <select value={meridian.riskClass} onChange={(e) => { const rc = e.target.value as RiskClass; setMeridian((m) => ({ ...m, riskClass: rc, threshold: RISK_CLASS_THRESHOLDS[rc] || 80 })); }} className="w-full rounded-lg border border-light px-4 py-2.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-gold/50">
                      <option value="">Select...</option>
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Confidence threshold (%)</label>
                    <input type="number" value={meridian.threshold} onChange={(e) => setMeridian((m) => ({ ...m, threshold: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg border border-light px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-gold/50" min={0} max={100} />
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => setStep('criteria')} className="w-full py-2.5 bg-gold text-white font-bold rounded-lg hover:bg-gold/90">
              Next: Select criteria
            </button>
          </div>
        )}

        {step === 'criteria' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-navy mb-4">Evaluation Criteria</h2>
            <p className="text-sm text-gray">Select which dimensions to score. Set weights (default: equal).</p>
            <div className="space-y-2">
              {EVAL_CRITERIA.map((c) => (
                <label key={c.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${c.id in selectedCriteria ? 'bg-gold-lt border-gold/30' : 'bg-white border-light hover:border-mid'}`}>
                  <input type="checkbox" checked={c.id in selectedCriteria} onChange={() => toggleCriterion(c.id)} className="w-4 h-4 rounded border-light text-gold focus:ring-gold" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-dark">{c.name}</span>
                    <p className="text-xs text-gray">{c.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('meridian')} className="px-4 py-2 text-sm text-gray hover:text-dark">Back</button>
              <button onClick={() => setStep('outputs')} disabled={Object.keys(selectedCriteria).length === 0} className="flex-1 py-2.5 bg-gold text-white font-bold rounded-lg hover:bg-gold/90 disabled:opacity-50">
                Next: Submit outputs
              </button>
            </div>
          </div>
        )}

        {step === 'outputs' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-navy mb-4">Submit LLM Outputs</h2>
            <p className="text-sm text-gray">Paste up to 20 outputs to score against the meridian.</p>
            <div className="space-y-4">
              {outputs.map((output, i) => (
                <div key={i} className="border border-light rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-dark">Output {i + 1}</span>
                    {outputs.length > 1 && (
                      <button onClick={() => removeOutput(i)} className="text-gray hover:text-coral"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <textarea value={output.text} onChange={(e) => updateOutput(i, 'text', e.target.value)} className="w-full rounded-lg border border-light px-3 py-2 text-sm text-dark mb-2 focus:outline-none focus:ring-2 focus:ring-gold/50" rows={3} placeholder="Paste LLM output here..." />
                  <input type="text" value={output.input} onChange={(e) => updateOutput(i, 'input', e.target.value)} className="w-full rounded-lg border border-light px-3 py-2 text-xs text-gray focus:outline-none focus:ring-2 focus:ring-gold/50" placeholder="(Optional) Input that produced this output" />
                </div>
              ))}
            </div>
            {outputs.length < 20 && (
              <button onClick={addOutput} className="inline-flex items-center gap-1 text-sm text-mid hover:text-blue">
                <Plus size={14} /> Add output
              </button>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep('criteria')} className="px-4 py-2 text-sm text-gray hover:text-dark">Back</button>
              <button onClick={scoreOutputs} disabled={!outputs.some((o) => o.text.trim())} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-teal text-white font-bold rounded-lg hover:bg-teal/90 disabled:opacity-50">
                <Play size={16} /> Score all outputs
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Previous sessions */}
      {projectSessions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-navy mb-3">Previous Sessions</h2>
          <div className="space-y-2">
            {projectSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg border border-light p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm text-dark">{new Date(session.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs text-gray ml-3">{session.outputs.length} outputs scored</span>
                </div>
                <div className="flex items-center gap-2">
                  {session.overallScore !== undefined && <ScoreBadge score={session.overallScore} size="sm" />}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${session.gateDecision === 'advance' ? 'bg-teal-lt text-teal' : session.gateDecision === 'reset' ? 'bg-gold-lt text-gold' : 'bg-coral-lt text-coral'}`}>
                    {session.gateDecision.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
