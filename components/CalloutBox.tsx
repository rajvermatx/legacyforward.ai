interface CalloutBoxProps {
  label?: string;
  children: React.ReactNode;
  accent?: 'gold' | 'coral' | 'teal' | 'purple';
}

const accentColors = {
  gold: 'border-gold bg-gold-lt',
  coral: 'border-coral bg-coral-lt',
  teal: 'border-teal bg-teal-lt',
  purple: 'border-purple bg-purp-lt',
};

export default function CalloutBox({
  label,
  children,
  accent = 'gold',
}: CalloutBoxProps) {
  return (
    <div className={`border-l-4 p-6 rounded-r-lg ${accentColors[accent]}`}>
      {label && (
        <span className="block text-xs font-bold uppercase tracking-widest text-gray mb-2">
          {label}
        </span>
      )}
      <div className="text-dark leading-relaxed">{children}</div>
    </div>
  );
}
