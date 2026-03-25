'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCompassStore, DiagnosticResponse, Severity } from '@/lib/compass-store';
import { DIAGNOSTIC_DIMENSIONS, RESPONSE_OPTIONS, SCORE_MAP, getSeverity, getSeverityColor } from '@/lib/compass-constants';
import ScoreBadge from '@/components/compass/ui/ScoreBadge';
import ScoreBar from '@/components/compass/ui/ScoreBar';
import dynamic from 'next/dynamic';

const RadarDisplay = dynamic(() => import('@/components/compass/diagnostic/RadarDisplay'), { ssr: false });

type Step = 'context' | 'questions' | 'results';

export default function DiagnosticPage() {
  const params = useParams();
  const projectId = params.id as string;
  const addDiagnostic = useCompassStore((s) => s.addDiagnostic);
  const diagnostics = useCompassStore((s) => s.diagnostics);
  const existing = diagnostics.filter((d) => d.projectId === projectId);
  const latestResult = existing[existing.length - 1];

  const [step, setStep] = useState<Step>(latestResult ? 'results' : 'context');
  const [responses, setResponses] = useState<Record<string, DiagnosticResponse>>({});
  const [contextData, setContextData] = useState({ hasLLMProject: '', systemType: '', legacyComplexity: '' });
  const [currentDim, setCurrentDim] = useState(0);
  const [resultData, setResultData] = useState<typeof latestResult | null>(latestResult || null);

  const allQuestions = DIAGNOSTIC_DIMENSIONS.flatMap((d) => d.questions);

  const handleResponse = (qId: string, value: DiagnosticResponse) => {
    setResponses((prev) => ({ ...prev, [qId]: value }));
  };

  const computeScores = () => {
    const scores: Record<string, number> = {};
    const gaps: { dimension: string; severity: Severity; score: number }[] = [];

    DIAGNOSTIC_DIMENSIONS.forEach((dim) => {
      const dimScores = dim.questions.map((q) => SCORE_MAP[responses[q.id]] ?? 0);
      const avg = dimScores.reduce((a, b) => a + b, 0) / dimScores.length;
      scores[dim.id] = avg;
      gaps.push({ dimension: dim.name, severity: getSeverity(avg), score: avg });
    });

    const overall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

    const result = {
      id: crypto.randomUUID(),
      projectId,
      responses,
      scores,
      gaps,
      aiSummary: `Your overall readiness score is ${Math.round(overall)}%. ${gaps.filter((g) => g.severity === 'Critical').length > 0 ? `Critical gaps found in: ${gaps.filter((g) => g.severity === 'Critical').map((g) => g.dimension).join(', ')}.` : ''} Focus on the lowest-scoring dimension first.`,
      createdAt: new Date().toISOString(),
    };

    addDiagnostic(result);
    setResultData(result);
    setStep('results');
  };

  const answeredCount = Object.keys(responses).length;
  const totalQuestions = allQuestions.length;
  const currentDimData = DIAGNOSTIC_DIMENSIONS[currentDim];

  if (step === 'results' && resultData) {
    const overall = Object.values(resultData.scores).reduce((a, b) => a + b, 0) / Object.values(resultData.scores).length;
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy">Readiness Diagnostic Results</h1>
          <button onClick={() => { setStep('context'); setResponses({}); setResultData(null); setCurrentDim(0); }} className="text-sm text-mid hover:text-blue font-medium">
            Retake diagnostic
          </button>
        </div>

        {/* Overall score */}
        <div className="bg-white rounded-lg border border-light p-6 mb-6 flex items-center gap-6">
          <ScoreBadge score={overall} size="lg" />
          <div>
            <h2 className="font-bold text-navy">Overall Readiness Score</h2>
            <p className="text-sm text-gray">{resultData.aiSummary}</p>
          </div>
        </div>

        {/* Radar */}
        <div className="bg-white rounded-lg border border-light p-6 mb-6">
          <h2 className="text-lg font-bold text-navy mb-4">Dimension Breakdown</h2>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex items-center justify-center">
              <RadarDisplay scores={resultData.scores} />
            </div>
            <div className="flex-1 space-y-4">
              {DIAGNOSTIC_DIMENSIONS.map((dim) => {
                const score = resultData.scores[dim.id] || 0;
                const severity = getSeverity(score);
                const colors = getSeverityColor(severity);
                return (
                  <div key={dim.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-dark">{dim.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{severity}</span>
                    </div>
                    <ScoreBar score={score} showValue={true} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recommended actions */}
        <div className="bg-white rounded-lg border border-light p-6">
          <h2 className="text-lg font-bold text-navy mb-4">Recommended Next Steps</h2>
          <div className="space-y-3">
            {resultData.gaps
              .sort((a, b) => a.score - b.score)
              .slice(0, 3)
              .map((gap, i) => (
                <div key={gap.dimension} className="flex items-start gap-3 p-3 bg-lt-gray rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-gold text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-dark">{gap.dimension} — {gap.severity}</p>
                    <p className="text-xs text-gray mt-0.5">Score: {Math.round(gap.score)}%. Run the relevant ceremony or workbench tool to address this gap.</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-2">Readiness Diagnostic</h1>
      <p className="text-sm text-gray mb-8">20 questions across 5 dimensions. Takes about 10 minutes.</p>

      {step === 'context' && (
        <div className="bg-white rounded-lg border border-light p-6">
          <h2 className="text-lg font-bold text-navy mb-4">Project Context</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Is this team currently working on an LLM project?</label>
              <select value={contextData.hasLLMProject} onChange={(e) => setContextData((p) => ({ ...p, hasLLMProject: e.target.value }))} className="w-full rounded-lg border border-light px-4 py-2.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-gold/50">
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">What type of system?</label>
              <select value={contextData.systemType} onChange={(e) => setContextData((p) => ({ ...p, systemType: e.target.value }))} className="w-full rounded-lg border border-light px-4 py-2.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-gold/50">
                <option value="">Select...</option>
                <option value="rag">RAG</option>
                <option value="finetuned">Fine-tuned</option>
                <option value="prompt">Prompt-based</option>
                <option value="unsure">Not sure</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Legacy environment?</label>
              <select value={contextData.legacyComplexity} onChange={(e) => setContextData((p) => ({ ...p, legacyComplexity: e.target.value }))} className="w-full rounded-lg border border-light px-4 py-2.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-gold/50">
                <option value="">Select...</option>
                <option value="high">High complexity</option>
                <option value="moderate">Moderate</option>
                <option value="greenfield">Greenfield</option>
              </select>
            </div>
            <button onClick={() => setStep('questions')} className="w-full py-2.5 bg-gold text-white font-bold rounded-lg hover:bg-gold/90 transition-colors mt-2">
              Start diagnostic
            </button>
          </div>
        </div>
      )}

      {step === 'questions' && currentDimData && (
        <div>
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-dark">{currentDimData.name}</span>
              <span className="text-gray">{answeredCount}/{totalQuestions} answered</span>
            </div>
            <div className="h-2 bg-lt-gray rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }} />
            </div>
            {/* Dimension tabs */}
            <div className="flex gap-1 mt-4">
              {DIAGNOSTIC_DIMENSIONS.map((dim, i) => (
                <button
                  key={dim.id}
                  onClick={() => setCurrentDim(i)}
                  className={`flex-1 py-2 text-xs font-medium rounded transition-colors ${i === currentDim ? 'bg-navy text-white' : 'bg-white text-gray hover:text-dark border border-light'}`}
                >
                  {dim.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {currentDimData.questions.map((q) => (
              <div key={q.id} className="bg-white rounded-lg border border-light p-5">
                <p className="text-sm font-medium text-dark mb-3">{q.text}</p>
                <div className="grid grid-cols-2 gap-2">
                  {RESPONSE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleResponse(q.id, opt)}
                      className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                        responses[q.id] === opt
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-dark border-light hover:border-mid'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentDim((c) => Math.max(0, c - 1))}
              disabled={currentDim === 0}
              className="px-4 py-2 text-sm text-gray hover:text-dark disabled:opacity-30"
            >
              Previous dimension
            </button>
            {currentDim < DIAGNOSTIC_DIMENSIONS.length - 1 ? (
              <button
                onClick={() => setCurrentDim((c) => c + 1)}
                className="px-5 py-2.5 bg-gold text-white text-sm font-bold rounded-lg hover:bg-gold/90"
              >
                Next dimension
              </button>
            ) : (
              <button
                onClick={computeScores}
                disabled={answeredCount < totalQuestions}
                className="px-5 py-2.5 bg-teal text-white text-sm font-bold rounded-lg hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View results ({answeredCount}/{totalQuestions})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
