export default function SignalCaptureFlow() {
  const stages = [
    {
      number: 1,
      title: "Value Hypothesis",
      description: "Define where AI creates net new value impossible by any other means",
      gate: "Can you articulate the value? If no → kill.",
    },
    {
      number: 2,
      title: "Value Validation",
      description: "Prove the hypothesis with data before building at scale",
      gate: "Does the data support the hypothesis? If no → pivot or kill.",
    },
    {
      number: 3,
      title: "Value Tracking",
      description: "Measure captured value continuously in production",
      gate: null,
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Funnel diagram */}
      <div className="space-y-0">
        {stages.map((stage, i) => {
          // Funnel narrowing effect via padding
          const indent = i * 24;
          return (
            <div key={stage.number}>
              {/* Stage block */}
              <div
                className="relative bg-white border-2 border-slate-200 rounded-lg p-5"
                style={{ marginLeft: indent, marginRight: indent }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-teal-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                    {stage.number}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-1">{stage.title}</h4>
                    <p className="text-sm text-slate-600">{stage.description}</p>
                  </div>
                </div>
              </div>
              {/* Gate between stages */}
              {stage.gate && (
                <div
                  className="flex items-center gap-2 py-2"
                  style={{ marginLeft: indent + 12, marginRight: indent + 12 }}
                >
                  <div className="flex-1 border-t border-dashed border-amber-400" />
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 shrink-0 text-center">
                    {stage.gate}
                  </span>
                  <div className="flex-1 border-t border-dashed border-amber-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span>Stage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 border-t border-dashed border-amber-400" />
          <span>Decision gate</span>
        </div>
      </div>
    </div>
  );
}
