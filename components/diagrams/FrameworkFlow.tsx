import Link from "next/link";

export default function FrameworkFlow() {
  const pillars = [
    {
      number: 1,
      title: "Signal Capture",
      slug: "signal-capture",
      subtitle: "Find the value",
      items: ["Value Hypothesis", "Value Validation", "Value Tracking"],
      color: "teal",
    },
    {
      number: 2,
      title: "Grounded Delivery",
      slug: "grounded-delivery",
      subtitle: "Build it for reality",
      items: ["Frame", "Explore", "Shape", "Harden", "Operate"],
      color: "teal",
    },
    {
      number: 3,
      title: "Legacy Coexistence",
      slug: "legacy-coexistence",
      subtitle: "Work with what you have",
      items: ["Data Exhaust", "Sidecar", "Gateway", "Shadow Pipeline", "Legacy-Aware Agent"],
      color: "teal",
    },
  ];

  return (
    <div className="w-full">
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex items-stretch justify-center gap-0">
        {pillars.map((pillar, i) => (
          <div key={pillar.slug} className="flex items-stretch">
            <Link
              href={`/framework/${pillar.slug}`}
              className="group relative bg-white border-2 border-slate-200 hover:border-teal-500 rounded-xl p-6 w-64 transition-all hover:shadow-lg"
            >
              {/* Pillar number badge */}
              <div className="absolute -top-3 left-6 bg-teal-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                Pillar {pillar.number}
              </div>
              <h3 className="text-lg font-bold text-navy-900 mt-1 mb-1 group-hover:text-teal-600 transition-colors">
                {pillar.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4">{pillar.subtitle}</p>
              <div className="space-y-1.5">
                {pillar.items.map((item) => (
                  <div
                    key={item}
                    className="text-xs bg-slate-50 text-slate-600 rounded px-2.5 py-1.5 border border-slate-100"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Link>
            {/* Arrow connector */}
            {i < pillars.length - 1 && (
              <div className="flex items-center px-3">
                <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className="text-teal-400">
                  <path d="M0 12H32" stroke="currentColor" strokeWidth="2" />
                  <path d="M28 6L36 12L28 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical flow */}
      <div className="md:hidden space-y-3">
        {pillars.map((pillar, i) => (
          <div key={pillar.slug}>
            <Link
              href={`/framework/${pillar.slug}`}
              className="group relative block bg-white border-2 border-slate-200 hover:border-teal-500 rounded-xl p-5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="bg-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mt-0.5">
                  {pillar.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-navy-900 group-hover:text-teal-600 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-2">{pillar.subtitle}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pillar.items.map((item) => (
                      <span
                        key={item}
                        className="text-xs bg-slate-50 text-slate-600 rounded px-2 py-1 border border-slate-100"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
            {i < pillars.length - 1 && (
              <div className="flex justify-center py-1">
                <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="text-teal-400">
                  <path d="M12 0V20" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 16L12 24L18 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
