export default function LegacyPatternsMap() {
  const patterns = [
    {
      number: 1,
      name: "Data Exhaust",
      desc: "Analyze data the legacy system already produces",
      touch: "None",
      latency: "Batch",
    },
    {
      number: 2,
      name: "Sidecar",
      desc: "Observe and augment without modifying",
      touch: "Read-only",
      latency: "Near real-time",
    },
    {
      number: 3,
      name: "Gateway",
      desc: "Mediate via a new interface layer",
      touch: "Indirect",
      latency: "Real-time",
    },
    {
      number: 4,
      name: "Shadow Pipeline",
      desc: "Run in parallel, compare before going live",
      touch: "Parallel",
      latency: "Real-time",
    },
    {
      number: 5,
      name: "Legacy-Aware Agent",
      desc: "Autonomous AI with legacy constraints built in",
      touch: "Direct",
      latency: "Real-time",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bg-navy-900 rounded-2xl p-6 md:p-10 overflow-hidden">
      {/* AI Layer */}
      <div className="bg-teal-500 rounded-xl px-5 py-3 text-center mb-2">
        <p className="text-sm font-bold text-white uppercase tracking-wider">AI / LLM Layer</p>
        <p className="text-xs text-teal-100">Agents &middot; Models &middot; Pipelines &middot; Orchestration</p>
      </div>

      {/* Connection lines — vertical dashes */}
      <div className="flex justify-around px-8 py-1">
        {patterns.map((p) => (
          <div key={p.number} className="hidden lg:flex flex-col items-center">
            <div className="w-px h-6 border-l-2 border-dashed border-teal-400/50" />
          </div>
        ))}
      </div>

      {/* Pattern cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-2">
        {patterns.map((pattern) => (
          <div
            key={pattern.number}
            className="bg-white rounded-xl p-4 text-center shadow-lg shadow-black/20"
          >
            <div className="bg-navy-900 text-teal-400 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-2 ring-2 ring-teal-400">
              {pattern.number}
            </div>
            <p className="text-sm font-bold text-navy-900 mb-1">{pattern.name}</p>
            <p className="text-xs text-slate-500 mb-3 leading-snug">{pattern.desc}</p>
            <div className="bg-slate-50 rounded-lg p-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Touch</span>
                <span className="font-semibold text-navy-900">{pattern.touch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latency</span>
                <span className="font-semibold text-navy-900">{pattern.latency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connection lines — vertical dashes */}
      <div className="flex justify-around px-8 py-1">
        {patterns.map((p) => (
          <div key={p.number} className="hidden lg:flex flex-col items-center">
            <div className="w-px h-6 border-l-2 border-dashed border-slate-500/50" />
          </div>
        ))}
      </div>

      {/* Legacy Layer */}
      <div className="bg-slate-700 rounded-xl px-5 py-3 text-center">
        <p className="text-sm font-bold text-white uppercase tracking-wider">Legacy Systems</p>
        <p className="text-xs text-slate-300">Mainframes &middot; SOAP &middot; Flat files &middot; Batch &middot; Databases</p>
      </div>

      {/* Spectrum */}
      <div className="flex items-center justify-between mt-5 text-xs px-1">
        <span className="text-slate-500">&larr; Less integration risk</span>
        <div className="flex-1 mx-4 h-1 rounded-full bg-gradient-to-r from-teal-500/40 via-amber-500/40 to-red-500/40" />
        <span className="text-slate-500">More risk &rarr;</span>
      </div>
    </div>
  );
}
