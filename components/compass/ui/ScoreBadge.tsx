'use client';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const color = score >= 85 ? 'bg-score-bg-high text-score-high'
    : score >= 70 ? 'bg-score-bg-med text-score-med'
    : 'bg-score-bg-low text-score-low';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-lg px-4 py-2' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center font-bold rounded-full ${color} ${sizeClass}`}>
      {Math.round(score)}%
    </span>
  );
}
