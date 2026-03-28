export default function SignalCaptureFlow() {
  const stages = [
    {
      number: 1,
      title: "Value Hypothesis",
      description: "Define where AI creates net new value impossible by any other means",
      gate: "Can you articulate the value? If no \u2192 kill.",
    },
    {
      number: 2,
      title: "Value Validation",
      description: "Prove the hypothesis with data before building at scale",
      gate: "Does the data support it? If no \u2192 pivot or kill.",
    },
    {
      number: 3,
      title: "Value Tracking",
      description: "Measure captured value continuously in production",
      gate: null,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bg-navy-900 rounded-2xl p-6 md:p-10 overflow-hidden">
      {/* Top bar */}
      <div className="bg-teal-500 rounded-xl px-5 py-3 text-center mb-2">
        <p className="text-sm font-bold text-white uppercase tracking-wider">AI Initiative Proposed</p>
        <p className="text-xs text-teal-100">Before a dollar of funding or a line of code</p>
      </div>

      {/* Dashed connectors down */}
      <div className="hidden md:flex justify-around px-16 py-1">
        {stages.map((s) => (
          <div key={s.number} className="flex flex-col items-center">
            <div className="w-px h-6 border-l-2 border-dashed border-teal-400/50" />
          </div>
        ))}
      </div>

      {/* Stage cards — equal width grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
        {stages.map((stage) => (
          <div
            key={stage.number}
            className="bg-white rounded-xl p-4 text-center shadow-lg shadow-black/20"
          >
            <div className="bg-navy-900 text-teal-400 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-2 ring-2 ring-teal-400">
              {stage.number}
            </div>
            <p className="text-sm font-bold text-navy-900 mb-1">{stage.title}</p>
            <p className="text-xs text-slate-500 leading-snug mb-3">{stage.description}</p>
            {stage.gate && (
              <div className="bg-amber-500 rounded-md px-3 py-1.5">
                <p className="text-[10px] font-bold text-white text-center leading-tight">
                  {stage.gate}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dashed connectors down */}
      <div className="hidden md:flex justify-around px-16 py-1">
        {stages.map((s) => (
          <div key={s.number} className="flex flex-col items-center">
            <div className="w-px h-6 border-l-2 border-dashed border-slate-500/50" />
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="bg-slate-700 rounded-xl px-5 py-3 text-center">
        <p className="text-sm font-bold text-white uppercase tracking-wider">Signal Validated</p>
        <p className="text-xs text-slate-300">Value confirmed &mdash; ready for Grounded Delivery</p>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-navy-900 ring-2 ring-teal-400" />
          <span>Stage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-2.5 rounded-sm bg-amber-500" />
          <span>Decision gate</span>
        </div>
      </div>
    </div>
  );
}
