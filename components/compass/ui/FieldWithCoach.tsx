'use client';
import { useState } from 'react';
import { MessageSquare, Loader2, X } from 'lucide-react';

interface FieldWithCoachProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fieldName: string;
  aidType: string;
  context?: string;
  multiline?: boolean;
  required?: boolean;
}

export default function FieldWithCoach({ label, value, onChange, placeholder, fieldName, aidType, context, multiline = false, required = false }: FieldWithCoachProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCoaching = async () => {
    if (!value.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field_name: fieldName, field_value: value, aid_type: aidType, context: context || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback);
      } else {
        setFeedback('AI coaching temporarily unavailable — your work has been saved.');
      }
    } catch {
      setFeedback('AI coaching temporarily unavailable — your work has been saved.');
    } finally {
      setLoading(false);
    }
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-dark">
        {label}
        {required && <span className="text-coral ml-1">*</span>}
      </label>
      <InputComponent
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-light px-4 py-2.5 text-dark bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
        {...(multiline ? { rows: 4 } : { type: 'text' })}
      />
      <button
        type="button"
        onClick={getCoaching}
        disabled={loading || !value.trim()}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-mid hover:text-blue disabled:text-gray disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
        {loading ? 'Getting feedback...' : 'Get AI coaching'}
      </button>
      {feedback && (
        <div className="relative bg-teal-lt border border-teal/20 rounded-lg p-3">
          <button onClick={() => setFeedback(null)} className="absolute top-2 right-2 text-teal/60 hover:text-teal">
            <X size={14} />
          </button>
          <p className="text-sm text-teal pr-6">{feedback}</p>
        </div>
      )}
    </div>
  );
}
