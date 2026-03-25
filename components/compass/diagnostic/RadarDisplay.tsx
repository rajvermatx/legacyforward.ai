'use client';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import { DIAGNOSTIC_DIMENSIONS, MERIDIAN_BENCHMARK } from '@/lib/compass-constants';

interface RadarDisplayProps {
  scores: Record<string, number>;
}

export default function RadarDisplay({ scores }: RadarDisplayProps) {
  const data = DIAGNOSTIC_DIMENSIONS.map((dim) => ({
    dimension: dim.shortName,
    score: Math.round(scores[dim.id] || 0),
    benchmark: MERIDIAN_BENCHMARK[dim.id] || 75,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid stroke="#D6E4F0" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#1A1A2E' }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#595959' }} />
        <Radar name="Your Team" dataKey="score" stroke="#1B4F8C" fill="#1B4F8C" fillOpacity={0.3} strokeWidth={2} />
        <Radar name="Meridian Benchmark" dataKey="benchmark" stroke="#C8972A" fill="none" strokeWidth={2} strokeDasharray="5 5" />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
