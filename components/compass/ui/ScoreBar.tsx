'use client';

interface ScoreBarProps {
  score: number;
  threshold?: number;
  label?: string;
  showValue?: boolean;
}

export default function ScoreBar({ score, threshold, label, showValue = true }: ScoreBarProps) {
  const barColor = score >= 85 ? 'bg-score-high' : score >= 70 ? 'bg-score-med' : 'bg-score-low';
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-dark">{label}</span>
        {showValue && <span className="text-sm font-bold text-dark">{Math.round(score)}%</span>}
      </div>}
      <div className="relative w-full h-3 bg-lt-gray rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(score, 100)}%` }} />
        {threshold !== undefined && (
          <div className="absolute top-0 h-full w-0.5 bg-gold" style={{ left: `${threshold}%` }} title={`Threshold: ${threshold}%`} />
        )}
      </div>
    </div>
  );
}
