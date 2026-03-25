'use client';

export default function MeridianCycleDiagram() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <h3 className="text-xl md:text-2xl font-bold text-gold">
          The Meridian Method&trade; — Calibration Cycle
        </h3>
        <p className="text-light text-sm mt-1">
          Each cycle advances a behavioral hypothesis toward a confidence threshold
        </p>
      </div>

      {/* Flowchart */}
      <div className="relative flex flex-col items-center">
        {/* Pre-condition note */}
        <p className="text-amber text-xs font-medium italic mb-3">
          Pre-condition: no cycle starts without this
        </p>

        {/* ANCHOR */}
        <FlowNode
          name="Anchor"
          subtitle="Establish human meridian baseline"
          color="purple"
          annotation="replaces Sprint 0"
          annotationSide="left"
        />
        <Connector />

        {/* Probe loop indicator */}
        <div className="relative w-full flex justify-center">
          {/* Left dashed loop line */}
          <div className="hidden md:block absolute left-[8%] top-0 bottom-0 border-l-2 border-dashed border-white/20 rounded-bl-xl" />
          <div className="flex flex-col items-center">
            {/* PROBE */}
            <FlowNode
              name="Probe"
              subtitle="Behavioral hypothesis sprint"
              color="teal"
              annotation="replaces Sprint plan"
              annotationSide="left"
              sideNote="1–2 week cycles"
              sideNoteSide="right"
            />
            <Connector />

            {/* SIGNAL */}
            <FlowNode
              name="Signal"
              subtitle="Eval scoring vs. meridian"
              color="mid"
              annotation="replaces Sprint review"
              annotationSide="left"
              sideNote="Confidence score produced here"
              sideNoteSide="right"
            />
            <Connector />

            {/* GATE */}
            <FlowNode
              name="Gate"
              subtitle="Human calibration check"
              color="gold"
              annotation="replaces Release gate"
              annotationSide="left"
              sideNote="Human judges confirm quality, not just score"
              sideNoteSide="right"
            />
            <Connector />
          </div>
        </div>

        {/* Decision diamond */}
        <div className="relative flex items-center justify-center my-2">
          <div className="w-40 h-20 bg-white/10 border-2 border-white/30 rotate-0 flex items-center justify-center"
            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          >
            <span className="text-white text-xs font-semibold text-center leading-tight">
              Threshold<br />met?
            </span>
          </div>
        </div>

        {/* Advance / Reset split */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-lg mt-4">
          {/* Reset (left - no) */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-white/50 mb-2 font-medium">no</span>
            <div className="w-full bg-coral/20 border-2 border-coral rounded-lg p-4 text-center">
              <span className="block text-base font-bold text-coral">Reset</span>
              <span className="block text-xs text-coral/80 mt-0.5">or retire</span>
              <p className="text-xs text-light mt-2">
                Modify probe or reframe hypothesis
              </p>
            </div>
            {/* Re-enter loop arrow */}
            <div className="mt-2 flex items-center gap-1 text-xs text-white/40 italic">
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 10V2M6 2L2 6M6 2L10 6" />
              </svg>
              re-enter cycle
            </div>
          </div>

          {/* Advance (right - yes) */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-white/50 mb-2 font-medium">yes</span>
            <div className="w-full bg-teal/20 border-2 border-teal rounded-lg p-4 text-center">
              <span className="block text-base font-bold text-teal-lt">Advance</span>
              <p className="text-xs text-light mt-2">
                Next confidence tier or production release
              </p>
            </div>
          </div>
        </div>

        {/* Arrow down to Drift Watch */}
        <div className="my-4 flex flex-col items-center">
          <p className="text-xs text-amber italic mb-2">alert triggers re-calibration</p>
          <Connector />
        </div>

        {/* Drift Watch bar */}
        <div className="w-full max-w-lg bg-white/5 border border-white/20 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-amber animate-pulse" />
            <span className="text-sm font-bold text-gold">Drift Watch — continuous</span>
          </div>
          <p className="text-xs text-steel">
            Monitors behavioral regression: model updates, corpus edits, prompt changes
          </p>
          <p className="text-xs text-white/30 mt-1 italic">No Agile equivalent</p>
        </div>
      </div>
    </div>
  );
}

function FlowNode({
  name,
  subtitle,
  color,
  annotation,
  annotationSide,
  sideNote,
  sideNoteSide,
}: {
  name: string;
  subtitle: string;
  color: string;
  annotation?: string;
  annotationSide?: 'left' | 'right';
  sideNote?: string;
  sideNoteSide?: 'left' | 'right';
}) {
  const bgMap: Record<string, string> = {
    purple: 'bg-purple/20 border-purple',
    teal: 'bg-teal/20 border-teal',
    mid: 'bg-mid/20 border-mid',
    gold: 'bg-gold/20 border-gold',
    navy: 'bg-navy/40 border-white/30',
  };

  const textMap: Record<string, string> = {
    purple: 'text-[#EEEDFE]',
    teal: 'text-teal-lt',
    mid: 'text-light',
    gold: 'text-gold-lt',
    navy: 'text-white',
  };

  return (
    <div className="relative w-full max-w-xs">
      {/* Annotation (left or right) */}
      {annotation && (
        <span
          className={`hidden md:block absolute top-1/2 -translate-y-1/2 text-xs text-white/40 italic whitespace-nowrap ${
            annotationSide === 'left' ? 'right-full mr-4' : 'left-full ml-4'
          }`}
        >
          replaces{' '}
          <span className="text-white/50">
            {annotation.replace('replaces ', '')}
          </span>
        </span>
      )}

      {/* Side note (left or right) */}
      {sideNote && (
        <span
          className={`hidden md:block absolute top-1/2 -translate-y-1/2 text-xs text-steel whitespace-nowrap max-w-[180px] text-wrap ${
            sideNoteSide === 'left' ? 'right-full mr-4 text-right' : 'left-full ml-4 text-left'
          }`}
        >
          {sideNote}
        </span>
      )}

      {/* Node box */}
      <div
        className={`rounded-lg border-2 p-4 text-center transition-all duration-200 hover:scale-[1.02] ${
          bgMap[color] || bgMap.navy
        }`}
      >
        <span className={`block text-lg font-bold ${textMap[color] || 'text-white'}`}>
          {name}
        </span>
        <span className="block text-xs text-light mt-0.5">{subtitle}</span>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex flex-col items-center my-1">
      <div className="w-0.5 h-5 bg-white/20" />
      <svg
        className="w-3 h-3 text-white/30"
        viewBox="0 0 12 12"
        fill="currentColor"
      >
        <path d="M6 12L0 6h12L6 12z" />
      </svg>
    </div>
  );
}
