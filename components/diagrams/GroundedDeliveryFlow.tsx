export default function GroundedDeliveryFlow() {
  const phases = [
    { name: "FRAME", desc: "Define value hypothesis & boundaries" },
    { name: "EXPLORE", desc: "Research & experiment" },
    { name: "SHAPE", desc: "Converge on architecture" },
    { name: "HARDEN", desc: "Probabilistic quality gates" },
    { name: "OPERATE", desc: "Monitor & adapt in production" },
  ];

  const gates = [
    "GO / NO-GO",
    "GO / PIVOT / KILL",
    "GO / REVISIT",
    "GO / ITERATE",
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bg-navy-900 rounded-2xl p-6 md:p-10 overflow-hidden">
      {/* Top bar: Signal Capture feeds in */}
      <div className="bg-teal-500 rounded-xl px-5 py-3 text-center mb-2">
        <p className="text-sm font-bold text-white uppercase tracking-wider">Signal Captured</p>
        <p className="text-xs text-teal-100">Value hypothesis validated &mdash; ready to deliver</p>
      </div>

      {/* Dashed connectors down */}
      <div className="hidden lg:flex justify-around px-8 py-1">
        {phases.map((p) => (
          <div key={p.name} className="flex flex-col items-center">
            <div className="w-px h-6 border-l-2 border-dashed border-teal-400/50" />
          </div>
        ))}
      </div>

      {/* Phase cards — equal width grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-2">
        {phases.map((phase, i) => (
          <div
            key={phase.name}
            className="bg-white rounded-xl p-4 text-center shadow-lg shadow-black/20"
          >
            <div className="bg-navy-900 text-teal-400 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-2 ring-2 ring-teal-400">
              {i + 1}
            </div>
            <p className="text-sm font-bold text-navy-900 mb-1">{phase.name}</p>
            <p className="text-xs text-slate-500 leading-snug mb-3">{phase.desc}</p>
            {i < phases.length - 1 && (
              <div className="bg-amber-500 rounded-md px-2 py-1.5 mx-auto">
                <p className="text-[10px] font-bold text-white text-center leading-tight">
                  {gates[i]}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dashed connectors down */}
      <div className="hidden lg:flex justify-around px-8 py-1">
        {phases.map((p) => (
          <div key={p.name} className="flex flex-col items-center">
            <div className="w-px h-6 border-l-2 border-dashed border-slate-500/50" />
          </div>
        ))}
      </div>

      {/* Bottom bar: feeds into Legacy Coexistence */}
      <div className="bg-slate-700 rounded-xl px-5 py-3 text-center">
        <p className="text-sm font-bold text-white uppercase tracking-wider">Production Delivery</p>
        <p className="text-xs text-slate-300">Deployed into the legacy landscape via coexistence patterns</p>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-navy-900 ring-2 ring-teal-400" />
          <span>Phase</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-2.5 rounded-sm bg-amber-500" />
          <span>Decision gate</span>
        </div>
      </div>
    </div>
  );
}
