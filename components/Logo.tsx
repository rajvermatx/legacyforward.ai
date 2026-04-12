/**
 * Embedded AI Wordmark — Concept 5
 * "LegacyForward" with teal [AI] badge pill
 */

export function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="text-xl font-bold tracking-tight leading-none">
        Legacy<span className="text-teal-400">Forward</span>
      </span>
      <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-px rounded leading-none translate-y-[-2px]">
        AI
      </span>
    </span>
  );
}

export function LogoWordmarkLight({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="text-xl font-bold tracking-tight leading-none text-navy-900">
        Legacy<span className="text-teal-600">Forward</span>
      </span>
      <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-px rounded leading-none translate-y-[-2px]">
        AI
      </span>
    </span>
  );
}

/** Compact favicon-style SVG icon */
export function LogoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill="#0f172a" />
      <text
        x="3"
        y="14"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="9"
        fontWeight="800"
        fill="white"
        letterSpacing="-0.5"
      >
        LF
      </text>
      <rect x="3" y="18" width="18" height="11" rx="3" fill="#14b8a6" />
      <text
        x="6"
        y="27"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="8"
        fontWeight="700"
        fill="white"
      >
        AI
      </text>
    </svg>
  );
}
