'use client';
import { useState, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';

interface Step {
  title: string;
  content: ReactNode;
}

interface StepWizardProps {
  steps: Step[];
  onComplete: () => void;
  onStepChange?: (fromStep: number, toStep: number) => Promise<void> | void;
  completionLabel?: string;
}

export default function StepWizard({ steps, onComplete, onStepChange, completionLabel = 'Complete' }: StepWizardProps) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goToStep = async (target: number) => {
    if (target === current || transitioning) return;
    if (onStepChange && target > current) {
      setTransitioning(true);
      try {
        await onStepChange(current, target);
      } finally {
        setTransitioning(false);
      }
    }
    setCurrent(target);
  };

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => i < current && goToStep(i)}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                i === current ? 'bg-gold text-white' : i < current ? 'bg-teal text-white' : 'bg-lt-gray text-gray'
              }`}
            >
              {i < current ? <Check size={16} /> : i + 1}
            </button>
            <span className={`text-sm whitespace-nowrap ${i === current ? 'font-bold text-dark' : 'text-gray'}`}>
              {step.title}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-light flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[300px]">
        {steps[current].content}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-light">
        <button
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0 || transitioning}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray hover:text-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        {current < steps.length - 1 ? (
          <button
            onClick={() => goToStep(current + 1)}
            disabled={transitioning}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gold text-white text-sm font-bold rounded-lg hover:bg-gold/90 disabled:opacity-70 transition-colors"
          >
            {transitioning ? (
              <><Loader2 size={16} className="animate-spin" /> Generating...</>
            ) : (
              <>Next <ChevronRight size={16} /></>
            )}
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal text-white text-sm font-bold rounded-lg hover:bg-teal/90 transition-colors"
          >
            <Check size={16} /> {completionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
