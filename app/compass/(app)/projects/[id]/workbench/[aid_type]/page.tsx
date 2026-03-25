'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCompassStore, AidType } from '@/lib/compass-store';
import { JOB_AID_TYPES } from '@/lib/compass-constants';
import FieldWithCoach from '@/components/compass/ui/FieldWithCoach';
import ProgressRing from '@/components/compass/ui/ProgressRing';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Save } from 'lucide-react';

export default function JobAidBuilderPage() {
  const params = useParams();
  const projectId = params.id as string;
  const aidType = params.aid_type as AidType;
  const addJobAid = useCompassStore((s) => s.addJobAid);
  const jobAids = useCompassStore((s) => s.jobAids);
  const pastAids = jobAids.filter((j) => j.projectId === projectId && j.aidType === aidType);
  const aidInfo = JOB_AID_TYPES.find((a) => a.type === aidType);
  const [fields, setFields] = useState<Record<string, string | boolean>>({});
  const [saved, setSaved] = useState(false);

  const updateField = (key: string, value: string | boolean) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const getCompleteness = () => {
    const config = getFieldConfig(aidType);
    const requiredFields = config.filter((f) => f.required);
    if (requiredFields.length === 0) return 0;
    const filled = requiredFields.filter((f) => {
      if (f.type === 'checklist') {
        const items = f.items || [];
        return items.some((item: { id: string; label: string; critical?: boolean }) => fields[item.id]);
      }
      return fields[f.id]?.toString().trim();
    });
    return Math.round((filled.length / requiredFields.length) * 100);
  };

  const handleSave = () => {
    addJobAid({
      id: crypto.randomUUID(),
      projectId,
      aidType,
      fields,
      completeness: getCompleteness(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
  };

  if (!aidInfo) return null;
  const completeness = getCompleteness();
  const fieldConfig = getFieldConfig(aidType);

  if (saved) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <CheckCircle size={48} className="text-teal mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-navy mb-2">Job Aid Saved</h1>
        <p className="text-gray mb-6">{aidInfo.name} has been saved to your project.</p>
        <div className="flex gap-3 justify-center">
          <Link href={`/compass/projects/${projectId}/workbench`} className="px-5 py-2.5 bg-gold text-white text-sm font-bold rounded-lg hover:bg-gold/90">
            Back to workbench
          </Link>
          <button onClick={() => { setSaved(false); setFields({}); }} className="px-5 py-2.5 border border-light text-sm font-medium text-dark rounded-lg hover:bg-lt-gray">
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/compass/projects/${projectId}/workbench`} className="inline-flex items-center gap-1 text-sm text-mid hover:text-blue mb-4">
        <ArrowLeft size={14} /> All job aids
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">{aidInfo.name}</h1>
          <p className="text-sm text-gray mt-1">{aidInfo.description}</p>
        </div>
        <ProgressRing value={completeness} />
      </div>

      {/* Previously saved aids */}
      {pastAids.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-dark uppercase tracking-widest mb-3">Previously Saved</h2>
          <div className="space-y-2">
            {pastAids.map((aid) => (
              <details key={aid.id} className="bg-white rounded-lg border border-light">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-lt-gray">
                  <div className="flex items-center gap-3">
                    <ProgressRing value={aid.completeness} size={32} strokeWidth={3} />
                    <span className="text-sm font-medium text-dark">
                      {new Date(aid.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${aid.completeness === 100 ? 'bg-teal-lt text-teal' : 'bg-gold-lt text-gold'}`}>
                      {aid.completeness}% complete
                    </span>
                  </div>
                </summary>
                <div className="px-4 pb-4 border-t border-light pt-3">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(aid.fields).filter(([, v]) => v && typeof v === 'string' && (v as string).length > 0).slice(0, 8).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs font-bold text-gray uppercase">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}</span>
                        <p className="text-sm text-dark mt-0.5">{String(value).substring(0, 300)}{String(value).length > 300 ? '...' : ''}</p>
                      </div>
                    ))}
                    {Object.entries(aid.fields).filter(([, v]) => typeof v === 'boolean' && v).length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-gray uppercase">Completed items</span>
                        <p className="text-sm text-teal mt-0.5">{Object.entries(aid.fields).filter(([, v]) => typeof v === 'boolean' && v).length} checked</p>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-light p-6 space-y-6">
        {fieldConfig.map((field) => {
          if (field.type === 'checklist') {
            return (
              <div key={field.id}>
                <h3 className="text-sm font-bold text-navy mb-3">{field.label}</h3>
                {field.section && <p className="text-xs text-gray mb-3">{field.section}</p>}
                <div className="space-y-2">
                  {(field.items || []).map((item: { id: string; label: string; critical?: boolean }) => (
                    <label key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${fields[item.id] ? 'bg-teal-lt border-teal/20' : 'bg-white border-light'} ${item.critical ? 'border-l-4 border-l-coral' : ''}`}>
                      <input
                        type="checkbox"
                        checked={!!fields[item.id]}
                        onChange={(e) => updateField(item.id, e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-light text-teal focus:ring-teal"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-dark">{item.label}</span>
                        {item.critical && !fields[item.id] && <span className="ml-2 text-xs font-bold text-coral">BLOCKER</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          }
          if (field.type === 'select') {
            return (
              <div key={field.id}>
                <label className="block text-sm font-medium text-dark mb-1">{field.label}{field.required && <span className="text-coral ml-1">*</span>}</label>
                <select value={String(fields[field.id] || '')} onChange={(e) => updateField(field.id, e.target.value)} className="w-full rounded-lg border border-light px-4 py-2.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-gold/50">
                  <option value="">Select...</option>
                  {(field.options || []).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            );
          }
          return (
            <FieldWithCoach
              key={field.id}
              label={field.label}
              value={String(fields[field.id] || '')}
              onChange={(v) => updateField(field.id, v)}
              placeholder={field.placeholder}
              fieldName={field.id}
              aidType={aidType}
              multiline={field.multiline}
              required={field.required}
            />
          );
        })}

        <div className="pt-4 border-t border-light">
          <button onClick={handleSave} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-white text-sm font-bold rounded-lg hover:bg-gold/90 transition-colors">
            <Save size={16} /> Save job aid
          </button>
        </div>
      </div>
    </div>
  );
}

interface FieldConfig {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  type?: 'select' | 'checklist';
  options?: string[];
  section?: string;
  items?: { id: string; label: string; critical?: boolean }[];
}

function getFieldConfig(aidType: AidType): FieldConfig[] {
  switch (aidType) {
    case 'hypothesis':
      return [
        { id: 'featureName', label: 'Feature name', required: true, placeholder: 'e.g. Customer support summarization' },
        { id: 'hypothesis', label: 'Behavioral hypothesis', required: true, multiline: true, placeholder: 'We believe the system will [BEHAVIOR] for [INPUT CLASS] at [THRESHOLD]% confidence...' },
        { id: 'inputClass', label: 'Input class', required: true, placeholder: 'Typical inputs this feature handles' },
        { id: 'outOfScope', label: 'Out-of-scope inputs', multiline: true, placeholder: 'Inputs this feature should NOT handle' },
        { id: 'riskClass', label: 'Risk class', type: 'select', required: true, options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        { id: 'threshold', label: 'Confidence threshold (%)', required: true, placeholder: 'e.g. 85' },
        { id: 'calibrators', label: 'Calibrators (human judges)', required: true, placeholder: 'Names and roles' },
        { id: 'evalCriteria', label: 'Evaluation criteria', multiline: true, placeholder: 'How will outputs be scored?' },
        { id: 'failureDefinition', label: 'Failure definition', multiline: true, placeholder: 'What constitutes a failure for this feature?' },
        { id: 'edgeCases', label: 'Edge cases', multiline: true, placeholder: 'Known edge cases and expected behavior' },
        { id: 'owner', label: 'Owner', placeholder: 'Who owns this hypothesis?' },
        { id: 'reviewDate', label: 'Review date', placeholder: 'When will this be reviewed?' },
      ];
    case 'test_plan':
      return [
        { id: 'coverage', label: 'Behavioral Coverage', type: 'checklist', required: true, items: [
          { id: 'cov_1', label: 'Tests cover all defined input classes' },
          { id: 'cov_2', label: 'Tests include edge cases from hypothesis' },
          { id: 'cov_3', label: 'Tests cover out-of-scope input rejection' },
          { id: 'cov_4', label: 'Tests validate output format and structure' },
          { id: 'cov_5', label: 'Tests cover multi-turn / context-dependent scenarios' },
        ]},
        { id: 'hallucination', label: 'Hallucination Testing', type: 'checklist', required: true, items: [
          { id: 'hal_1', label: 'Factuality check against source documents', critical: true },
          { id: 'hal_2', label: 'Attribution verification (claims cite sources)', critical: true },
          { id: 'hal_3', label: 'Fabrication detection for entities and numbers' },
          { id: 'hal_4', label: 'Confidence calibration (model knows when it doesn\'t know)' },
        ]},
        { id: 'regression', label: 'Behavioral Regression', type: 'checklist', required: true, items: [
          { id: 'reg_1', label: 'Baseline eval scores recorded before changes', critical: true },
          { id: 'reg_2', label: 'Regression suite runs on model update' },
          { id: 'reg_3', label: 'Regression suite runs on corpus change' },
          { id: 'reg_4', label: 'Regression suite runs on prompt modification' },
        ]},
        { id: 'evaluation', label: 'Semantic Evaluation', type: 'checklist', required: true, items: [
          { id: 'eval_1', label: 'Eval framework selected and configured' },
          { id: 'eval_2', label: 'Human judge agreement measured' },
          { id: 'eval_3', label: 'Automated and human scores compared' },
          { id: 'eval_4', label: 'Scoring rubric documented and shared' },
        ]},
      ];
    case 'sprint_planner':
      return [
        { id: 'cycleNumber', label: 'Cycle number', required: true, placeholder: 'e.g. 3' },
        { id: 'dates', label: 'Cycle dates', required: true, placeholder: 'e.g. Mar 10 – Mar 21' },
        { id: 'hypothesis', label: 'Behavioral hypothesis', required: true, multiline: true, placeholder: 'Link or restate the hypothesis for this cycle' },
        { id: 'riskClass', label: 'Risk class', type: 'select', required: true, options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        { id: 'currentScore', label: 'Current confidence score (%)', required: true, placeholder: 'e.g. 72' },
        { id: 'targetScore', label: 'Target confidence score (%)', required: true, placeholder: 'e.g. 85' },
        { id: 'judges', label: 'Human judges for this cycle', required: true, placeholder: 'Names and roles' },
        { id: 'probeApproach', label: 'Probe approach', required: true, multiline: true, placeholder: 'What will you try this cycle?' },
        { id: 'evalMethod', label: 'Evaluation method', multiline: true, placeholder: 'How will you measure progress?' },
        { id: 'advanceDefinition', label: 'Definition of ADVANCE', multiline: true, placeholder: 'What must be true to advance?' },
        { id: 'resetDefinition', label: 'Definition of RESET', multiline: true, placeholder: 'What triggers a reset?' },
        { id: 'retireDefinition', label: 'Definition of RETIRE', multiline: true, placeholder: 'What triggers retirement?' },
        { id: 'driftWatch', label: 'Drift Watch configured?', type: 'select', options: ['Yes', 'No'] },
        { id: 'corpusReady', label: 'Data Steward corpus readiness?', type: 'select', options: ['Yes', 'No'] },
      ];
    case 'rag_readiness':
      return [
        { id: 'sourceQuality', label: 'Source Document Quality', type: 'checklist', required: true, section: 'Assess the quality and readiness of your source documents.', items: [
          { id: 'src_1', label: 'Source documents are identified and catalogued', critical: true },
          { id: 'src_2', label: 'Document formats are consistent or normalized', critical: true },
          { id: 'src_3', label: 'Documents are current and version-controlled' },
          { id: 'src_4', label: 'Sensitive or restricted content is flagged' },
          { id: 'src_5', label: 'Document ownership is assigned' },
        ]},
        { id: 'chunking', label: 'Chunking & Indexing', type: 'checklist', required: true, items: [
          { id: 'chk_1', label: 'Chunking strategy is documented', critical: true },
          { id: 'chk_2', label: 'Chunk size is appropriate for content type', critical: true },
          { id: 'chk_3', label: 'Overlap strategy defined' },
          { id: 'chk_4', label: 'Metadata preserved during chunking' },
          { id: 'chk_5', label: 'Embedding model selected and tested' },
        ]},
        { id: 'retrievalQuality', label: 'Retrieval Quality', type: 'checklist', required: true, items: [
          { id: 'ret_1', label: 'Retrieval precision measured' },
          { id: 'ret_2', label: 'Retrieval recall measured' },
          { id: 'ret_3', label: 'Top-k parameter tuned' },
          { id: 'ret_4', label: 'Reranking strategy evaluated' },
          { id: 'ret_5', label: 'Failure cases documented (queries with poor retrieval)' },
        ]},
        { id: 'governance', label: 'Governance', type: 'checklist', required: true, items: [
          { id: 'gov_1', label: 'Refresh schedule defined for vector index' },
          { id: 'gov_2', label: 'Named owner for corpus quality' },
          { id: 'gov_3', label: 'Change process for adding/removing sources' },
          { id: 'gov_4', label: 'Drift Watch trigger configured for corpus changes' },
        ]},
      ];
    default:
      return [];
  }
}
