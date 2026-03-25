interface RoleCardProps {
  role: string;
  gap: string;
  ceremony: string;
  color: string;
}

const colorMap: Record<string, string> = {
  blue: 'border-t-blue',
  teal: 'border-t-teal',
  mid: 'border-t-mid',
  purple: 'border-t-purple',
  coral: 'border-t-coral',
  gold: 'border-t-gold',
};

export default function RoleCard({ role, gap, ceremony, color }: RoleCardProps) {
  return (
    <div
      className={`bg-white rounded-lg p-6 border-t-4 shadow-sm hover:shadow-md transition-shadow duration-200 ${
        colorMap[color] || 'border-t-blue'
      }`}
    >
      <h3 className="text-lg font-bold text-navy">{role}</h3>
      <p className="mt-2 text-sm text-gray leading-relaxed">
        <span className="font-medium text-dark">Primary gap:</span> {gap}
      </p>
      <p className="mt-3 text-sm text-teal font-medium">
        Meridian ceremony owned: {ceremony}
      </p>
    </div>
  );
}
