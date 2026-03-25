interface PhaseCardProps {
  name: string;
  color: string;
  description: string;
  replaces: string;
}

const topBarColors: Record<string, string> = {
  purple: 'bg-purple',
  teal: 'bg-teal',
  mid: 'bg-mid',
  gold: 'bg-gold',
  navy: 'bg-navy',
};

export default function PhaseCard({ name, color, description, replaces }: PhaseCardProps) {
  return (
    <div className="bg-white/10 rounded-lg overflow-hidden backdrop-blur-sm border border-white/10 flex-1 min-w-[200px]">
      <div className={`h-2 ${topBarColors[color] || 'bg-mid'}`} />
      <div className="p-5">
        <h3 className="text-base font-bold text-white uppercase tracking-wide">
          {name}
        </h3>
        <p className="mt-2 text-sm text-light">{description}</p>
        <p className="mt-3 text-xs text-steel">replaces: {replaces}</p>
      </div>
    </div>
  );
}
