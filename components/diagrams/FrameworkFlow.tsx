import Link from "next/link";

export default function FrameworkFlow() {
  const pillars = [
    {
      number: 1,
      title: "Signal Capture",
      slug: "signal-capture",
      subtitle: "Find the value",
      items: [
        { label: "Value Hypothesis", anchor: "stage-1-value-hypothesis" },
        { label: "Value Validation", anchor: "stage-2-value-validation" },
        { label: "Value Tracking", anchor: "stage-3-value-tracking" },
      ],
    },
    {
      number: 2,
      title: "Grounded Delivery",
      slug: "grounded-delivery",
      subtitle: "Build it for reality",
      items: [
        { label: "Frame", anchor: "phase-1-frame" },
        { label: "Explore", anchor: "phase-2-explore" },
        { label: "Shape", anchor: "phase-3-shape" },
        { label: "Harden", anchor: "phase-4-harden" },
        { label: "Operate", anchor: "phase-5-operate" },
      ],
    },
    {
      number: 3,
      title: "Legacy Coexistence",
      slug: "legacy-coexistence",
      subtitle: "Work with what you have",
      items: [
        { label: "Data Exhaust", anchor: "pattern-1-the-data-exhaust-pattern" },
        { label: "Sidecar", anchor: "pattern-2-the-sidecar-pattern" },
        { label: "Gateway", anchor: "pattern-3-the-gateway-pattern" },
        { label: "Shadow Pipeline", anchor: "pattern-4-the-shadow-pipeline-pattern" },
        { label: "Legacy-Aware Agent", anchor: "pattern-5-the-legacy-aware-agent-pattern" },
      ],
    },
  ];

  return (
    <div className="w-full bg-navy-900 rounded-2xl p-6 md:p-10 overflow-hidden">
      {/* Top bar */}
      <div className="bg-teal-500 rounded-xl px-5 py-3 text-center mb-2">
        <p className="text-sm font-bold text-white uppercase tracking-wider">The LegacyForward Framework</p>
        <p className="text-xs text-teal-100">Capture what matters &rarr; Deliver it through reality &rarr; Coexist with what you have</p>
      </div>

      {/* Dashed connectors */}
      <div className="hidden md:flex justify-around px-12 py-1">
        {pillars.map((p) => (
          <div key={p.slug} className="flex flex-col items-center">
            <div className="w-px h-6 border-l-2 border-dashed border-teal-400/50" />
          </div>
        ))}
      </div>

      {/* Pillar cards — equal width grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {pillars.map((pillar) => (
          <div
            key={pillar.slug}
            className="bg-white rounded-xl p-4 text-center shadow-lg shadow-black/20"
          >
            <Link href={`/framework/${pillar.slug}`} className="group">
              <div className="bg-navy-900 text-teal-400 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-2 ring-2 ring-teal-400">
                {pillar.number}
              </div>
              <p className="text-sm font-bold text-navy-900 mb-0.5 group-hover:text-teal-600 transition-colors">{pillar.title}</p>
              <p className="text-xs text-slate-500 mb-3">{pillar.subtitle}</p>
            </Link>
            <div className="space-y-1.5">
              {pillar.items.map((item) => (
                <Link
                  key={item.anchor}
                  href={`/framework/${pillar.slug}#${item.anchor}`}
                  className="block bg-slate-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg px-3 py-2 text-[11px] font-medium text-navy-900 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom connectors + bar */}
      <div className="hidden md:flex justify-around px-12 pt-1 pb-2">
        {pillars.map((p) => (
          <div key={p.slug} className="flex flex-col items-center">
            <div className="w-px h-6 border-l-2 border-dashed border-slate-500/50" />
          </div>
        ))}
      </div>
      <div className="bg-slate-700 rounded-xl px-5 py-3 text-center mt-2 md:mt-0">
        <p className="text-sm font-bold text-white uppercase tracking-wider">Enterprise AI at Scale</p>
        <p className="text-xs text-slate-300">Real value &middot; Grounded methodology &middot; Legacy-aware architecture</p>
      </div>
    </div>
  );
}
