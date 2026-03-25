'use client';
import { useState } from 'react';
import { MessageSquare, Loader2, X, Check, RotateCcw } from 'lucide-react';

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
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCoaching = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setSuggestion(null);
    setPreviousValue(null);
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field_name: fieldName, field_value: value, aid_type: aidType, context: context || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback);
        if (data.suggestion && data.suggestion !== value) {
          setSuggestion(data.suggestion);
        }
      } else {
        setFeedback('AI coaching temporarily unavailable — your work has been saved.');
      }
    } catch {
      setFeedback('AI coaching temporarily unavailable — your work has been saved.');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    setPreviousValue(value);
    onChange(suggestion);
    setSuggestion(null);
    setFeedback('Changes applied.');
  };

  const undoSuggestion = () => {
    if (previousValue === null) return;
    onChange(previousValue);
    setPreviousValue(null);
    setFeedback(null);
  };

  const dismiss = () => {
    setFeedback(null);
    setSuggestion(null);
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
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={getCoaching}
          disabled={loading || !value.trim()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-mid hover:text-blue disabled:text-gray disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
          {loading ? 'Getting feedback...' : 'Get AI coaching'}
        </button>
        {previousValue !== null && (
          <button
            type="button"
            onClick={undoSuggestion}
            className="inline-flex items-center gap-1 text-xs font-medium text-coral hover:text-coral/80 transition-colors"
          >
            <RotateCcw size={13} />
            Undo
          </button>
        )}
      </div>

      {/* Feedback panel */}
      {feedback && !suggestion && (
        <div className="relative bg-teal-lt border border-teal/20 rounded-lg p-3">
          <button onClick={dismiss} className="absolute top-2 right-2 text-teal/60 hover:text-teal">
            <X size={14} />
          </button>
          <p className="text-sm text-teal pr-6">{feedback}</p>
        </div>
      )}

      {/* Suggestion panel with Apply / Dismiss */}
      {suggestion && (
        <div className="border border-mid/30 rounded-lg overflow-hidden">
          {feedback && (
            <div className="bg-teal-lt border-b border-teal/20 px-3 py-2">
              <p className="text-sm text-teal">{feedback}</p>
            </div>
          )}
          <div className="bg-pale px-3 py-3">
            <p className="text-xs font-medium text-navy mb-1.5">Suggested revision:</p>
            <p className="text-sm text-dark whitespace-pre-wrap">{suggestion}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-light">
            <button
              type="button"
              onClick={applySuggestion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal rounded-md hover:bg-teal/90 transition-colors"
            >
              <Check size={13} />
              Apply changes
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray hover:text-dark transition-colors"
            >
              <X size={13} />
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
