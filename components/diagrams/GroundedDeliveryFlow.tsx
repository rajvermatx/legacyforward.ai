export default function GroundedDeliveryFlow() {
  const phases = [
    { name: "FRAME", desc: "Define value hypothesis & boundaries" },
    { name: "EXPLORE", desc: "Research & experiment" },
    { name: "SHAPE", desc: "Converge on architecture" },
    { name: "HARDEN", desc: "Probabilistic quality gates" },
    { name: "OPERATE", desc: "Monitor & adapt in production" },
  ];

  const gates = [
    { label: "GO / NO-GO", between: [0, 1] },
    { label: "GO / PIVOT / KILL", between: [1, 2] },
    { label: "GO / REVISIT", between: [2, 3] },
    { label: "GO / ITERATE", between: [3, 4] },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Desktop: horizontal pipeline */}
      <div className="hidden lg:block">
        {/* Phases row */}
        <div className="flex items-start">
          {phases.map((phase, i) => (
            <div key={phase.name} className="flex items-start flex-1">
              <div className="flex-1 text-center">
                {/* Phase box */}
                <div className="bg-white border-2 border-slate-200 rounded-lg px-3 py-4 mx-1">
                  <div className="bg-teal-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-2">
                    {i + 1}
                  </div>
                  <p className="font-bold text-navy-900 text-sm">{phase.name}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{phase.desc}</p>
                </div>
              </div>
              {/* Gate diamond + arrow */}
              {i < phases.length - 1 && (
                <div className="flex flex-col items-center justify-start pt-6 w-20 shrink-0">
                  <svg width="48" height="20" viewBox="0 0 48 20" fill="none" className="text-teal-400 mb-1">
                    <path d="M0 10H40" stroke="currentColor" strokeWidth="2" />
                    <path d="M36 4L44 10L36 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="w-4 h-4 bg-amber-400 rotate-45 rounded-sm" />
                  <p className="text-[10px] font-medium text-amber-600 mt-1 text-center leading-tight whitespace-nowrap">
                    {gates[i].label}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical pipeline */}
      <div className="lg:hidden space-y-0">
        {phases.map((phase, i) => (
          <div key={phase.name}>
            <div className="flex items-start gap-4 bg-white border-2 border-slate-200 rounded-lg p-4">
              <div className="bg-teal-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <div>
                <p className="font-bold text-navy-900">{phase.name}</p>
                <p className="text-sm text-slate-500">{phase.desc}</p>
              </div>
            </div>
            {i < phases.length - 1 && (
              <div className="flex items-center gap-2 py-2 pl-8">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal-400 shrink-0">
                  <path d="M12 0V16" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 12L12 20L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-400 rotate-45 rounded-sm shrink-0" />
                  <span className="text-xs font-medium text-amber-600">{gates[i].label}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span>Phase</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-400 rotate-45 rounded-sm" />
          <span>Decision gate</span>
        </div>
      </div>
    </div>
  );
}
