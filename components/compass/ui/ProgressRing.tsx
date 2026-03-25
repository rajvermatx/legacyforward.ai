'use client';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({ value, size = 64, strokeWidth = 6 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 85 ? 'stroke-score-high' : value >= 70 ? 'stroke-score-med' : value >= 50 ? 'stroke-gold' : 'stroke-score-low';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" className="stroke-lt-gray" />
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className={`transition-all duration-500 ${color}`} />
      </svg>
      <span className="absolute text-sm font-bold text-dark">{Math.round(value)}%</span>
    </div>
  );
}
