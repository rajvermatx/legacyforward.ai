export default function LegacyPatternsMap() {
  const patterns = [
    {
      number: 1,
      name: "Data Exhaust",
      desc: "AI analyzes data the legacy system already produces",
      touch: "None",
      latency: "Batch",
    },
    {
      number: 2,
      name: "Sidecar",
      desc: "AI runs alongside, observing and augmenting without modifying",
      touch: "Read-only",
      latency: "Near real-time",
    },
    {
      number: 3,
      name: "Gateway",
      desc: "AI mediates between users and legacy via a new interface layer",
      touch: "Indirect",
      latency: "Real-time",
    },
    {
      number: 4,
      name: "Shadow Pipeline",
      desc: "AI runs in parallel, decisions compared before going live",
      touch: "Parallel",
      latency: "Real-time",
    },
    {
      number: 5,
      name: "Legacy-Aware Agent",
      desc: "Autonomous AI that understands legacy constraints and boundaries",
      touch: "Direct",
      latency: "Real-time",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Architectural layers diagram */}
      <div className="relative">
        {/* Legacy system base layer */}
        <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-4 mb-3">
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Legacy Systems</span>
            <p className="text-xs text-slate-400">Mainframes &middot; SOAP &middot; Flat files &middot; Batch &middot; Databases</p>
          </div>

          {/* Pattern cards on top of legacy layer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {patterns.map((pattern) => (
              <div
                key={pattern.number}
                className="bg-white border border-slate-200 rounded-lg p-3 text-center"
              >
                <div className="bg-teal-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-2">
                  {pattern.number}
                </div>
                <p className="text-sm font-bold text-navy-900 mb-1">{pattern.name}</p>
                <p className="text-xs text-slate-500 mb-2 leading-snug">{pattern.desc}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Touch:</span>
                    <span className="font-medium text-slate-600">{pattern.touch}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Latency:</span>
                    <span className="font-medium text-slate-600">{pattern.latency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI layer on top */}
        <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-3 text-center">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">AI / LLM Layer</span>
          <p className="text-xs text-teal-600">Agents &middot; Models &middot; Pipelines &middot; Orchestration</p>
        </div>

        {/* Bidirectional arrow between layers */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block">
          <svg width="24" height="60" viewBox="0 0 24 60" fill="none" className="text-teal-400">
            <path d="M12 0V60" stroke="currentColor" strokeWidth="2" />
            <path d="M6 6L12 0L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 54L12 60L18 54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Spectrum label */}
      <div className="flex items-center justify-between mt-4 text-xs text-slate-400 px-2">
        <span>&larr; Less integration risk</span>
        <span>More integration risk &rarr;</span>
      </div>
    </div>
  );
}
