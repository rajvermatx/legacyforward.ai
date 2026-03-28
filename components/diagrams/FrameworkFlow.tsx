import Link from "next/link";

export default function FrameworkFlow() {
  const pillars = [
    {
      number: 1,
      title: "Signal Capture",
      slug: "signal-capture",
      subtitle: "Find the value",
      items: ["Value Hypothesis", "Value Validation", "Value Tracking"],
    },
    {
      number: 2,
      title: "Grounded Delivery",
      slug: "grounded-delivery",
      subtitle: "Build it for reality",
      items: ["Frame", "Explore", "Shape", "Harden", "Operate"],
    },
    {
      number: 3,
      title: "Legacy Coexistence",
      slug: "legacy-coexistence",
      subtitle: "Work with what you have",
      items: ["Data Exhaust", "Sidecar", "Gateway", "Shadow Pipeline", "Legacy-Aware Agent"],
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
          <Link
            key={pillar.slug}
            href={`/framework/${pillar.slug}`}
            className="group bg-white rounded-xl p-4 text-center shadow-lg shadow-black/20 transition-all hover:scale-[1.02]"
          >
            <div className="bg-navy-900 text-teal-400 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-2 ring-2 ring-teal-400">
              {pillar.number}
            </div>
            <p className="text-sm font-bold text-navy-900 mb-0.5 group-hover:text-teal-600 transition-colors">{pillar.title}</p>
            <p className="text-xs text-slate-500 mb-3">{pillar.subtitle}</p>
            <div className="space-y-1.5">
              {pillar.items.map((item) => (
                <div
                  key={item}
                  className="bg-slate-50 rounded-lg px-3 py-2 text-[11px] font-medium text-navy-900"
                >
                  {item}
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom bar */}
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
