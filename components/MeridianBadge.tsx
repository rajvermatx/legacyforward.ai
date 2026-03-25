import { MERIDIAN_LETTERS } from '@/lib/constants';

export default function MeridianBadge() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {MERIDIAN_LETTERS.map((item, i) => (
        <div
          key={i}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-5 text-center border border-white/10 hover:bg-white/15 transition-colors duration-200"
        >
          <span className="block text-4xl font-bold text-gold font-mono">
            {item.letter}
          </span>
          <span className="block mt-2 text-sm font-semibold text-white">
            {item.title}
          </span>
          <span className="block mt-1 text-xs text-light">
            {item.phrase}
          </span>
        </div>
      ))}
    </div>
  );
}
