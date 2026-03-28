import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Cheatsheet",
  description:
    "The LegacyForward framework at a glance — Signal Capture, Grounded Delivery, and Legacy Coexistence condensed into a printable quick reference.",
};

export default function CheatsheetPage() {
  return (
    <>
      {/* Header — hidden in print */}
      <section className="bg-navy-900 text-white no-print">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Framework Cheatsheet
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            The entire LegacyForward framework — stages, gates, anti-patterns,
            key questions, and how the pillars connect. A practitioner&rsquo;s
            quick reference.
          </p>
          <PrintButton />
        </div>
      </section>

      <div className="cheatsheet-content mx-auto max-w-6xl px-6 py-12 space-y-14">

        {/* ===== DECISION AID ===== */}
        <div className="rounded-xl overflow-hidden border border-navy-800">
          <div className="bg-navy-900 px-5 py-2.5">
            <h2 className="text-sm font-bold text-white">Where to Start</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
            <div className="p-5">
              <p className="text-sm text-slate-600 italic mb-2">
                &ldquo;We have AI ideas but don&rsquo;t know which are worth it.&rdquo;
              </p>
              <p className="text-teal-600 font-bold flex items-center gap-2">
                <span className="bg-teal-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
                Signal Capture &rarr;
              </p>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 italic mb-2">
                &ldquo;Our AI projects stall or deliver inconsistent results.&rdquo;
              </p>
              <p className="text-blue-600 font-bold flex items-center gap-2">
                <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
                Grounded Delivery &rarr;
              </p>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 italic mb-2">
                &ldquo;We can&rsquo;t replace legacy systems but need AI to work with them.&rdquo;
              </p>
              <p className="text-violet-600 font-bold flex items-center gap-2">
                <span className="bg-violet-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
                Legacy Coexistence &rarr;
              </p>
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* PILLAR 1: SIGNAL CAPTURE      */}
        {/* ============================= */}
        <div>
          <div className="rounded-xl overflow-hidden border border-teal-200 mb-6">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-3 flex items-center gap-3">
              <span className="bg-white/20 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-white/40 shrink-0">1</span>
              <div>
                <h2 className="text-lg font-bold text-white">Signal Capture</h2>
                <p className="text-teal-100 text-xs">Identify where AI creates value impossible by other means</p>
              </div>
            </div>
            <div className="bg-white p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { num: "1", name: "Value Hypothesis", desc: "Articulate where AI creates net new value before any technical work", gate: "Clear, measurable, worth pursuing; deterministic alternatives ruled out" },
                  { num: "2", name: "Value Validation", desc: "Validate across data, feasibility, organizational, and economic dimensions", gate: "All four pass — data, feasibility, adoption, economics" },
                  { num: "3", name: "Value Tracking", desc: "Measure value continuously in production with leading/lagging indicators", gate: "Thresholds trigger review or kill if progress stalls" },
                ].map((stage) => (
                  <div key={stage.num} className="border border-teal-200 rounded-lg p-4 bg-teal-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-teal-500 text-white text-xs font-bold w-5 h-5 rounded flex items-center justify-center">{stage.num}</span>
                      <h3 className="font-bold text-navy-900 text-sm">{stage.name}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">{stage.desc}</p>
                    <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                      <p className="text-xs font-semibold text-amber-700">GATE: {stage.gate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Signal Capture: Key Questions + Anti-Patterns side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-teal-200 rounded-xl p-5 bg-teal-50/30">
              <h3 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                <span className="text-teal-500">&#9670;</span> Key Questions
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2"><span className="text-teal-500 shrink-0">&#8250;</span> Where does this create net new value we cannot achieve any other way?</li>
                <li className="flex gap-2"><span className="text-teal-500 shrink-0">&#8250;</span> Remove the AI and use unlimited human effort — could we achieve the same result?</li>
                <li className="flex gap-2"><span className="text-teal-500 shrink-0">&#8250;</span> What is success in operational terms — revenue, cost, risk, time-to-insight — with specific targets?</li>
                <li className="flex gap-2"><span className="text-teal-500 shrink-0">&#8250;</span> Does the required data actually exist, and is it accessible?</li>
                <li className="flex gap-2"><span className="text-teal-500 shrink-0">&#8250;</span> Will the organization trust and actually use the output?</li>
                <li className="flex gap-2"><span className="text-teal-500 shrink-0">&#8250;</span> Does the value justify the full cost — development, integration, governance, monitoring, retraining?</li>
              </ul>
            </div>
            <div className="border border-red-200 rounded-xl p-5 bg-red-50/30">
              <h3 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                <span className="text-red-500">&#9888;</span> Anti-Patterns
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li><span className="font-semibold text-red-700">The Adoption Trap</span> — Measuring success by deployment volume (users, queries/day) instead of value delivered</li>
                <li><span className="font-semibold text-red-700">Solutions Looking for Problems</span> — Starting with &ldquo;we need an AI strategy&rdquo; instead of &ldquo;we have a problem only AI can solve&rdquo;</li>
                <li><span className="font-semibold text-red-700">Automation as Transformation</span> — Making a broken process faster is not transformation. Test: remove the AI, could humans achieve the same?</li>
                <li><span className="font-semibold text-red-700">The Vibe-Coded Commitment</span> — AI-assisted dev builds compelling demo in days; leadership commits before validating the value hypothesis</li>
                <li><span className="font-semibold text-red-700">The Perpetual Pilot</span> — Initiatives in &ldquo;pilot&rdquo; indefinitely, avoiding accountability. Every pilot needs a kill date.</li>
                <li><span className="font-semibold text-red-700">The Sunk Cost Spiral</span> — Continuing to fund initiatives that have consumed resources but failed to demonstrate value</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Automation vs Transformation table */}
        <div className="rounded-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-2.5">
            <h3 className="text-sm font-bold text-white">Automation vs. Transformation</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-navy-900 font-semibold text-left">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-200 w-36"></th>
                  <th className="px-4 py-3 border-b border-slate-200">Automation</th>
                  <th className="px-4 py-3 border-b border-slate-200">Transformation</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Definition</td><td className="px-4 py-2.5 border-b border-slate-100">AI performs a task previously done by humans, faster or cheaper</td><td className="px-4 py-2.5 border-b border-slate-100 text-teal-700 font-medium">AI produces an outcome previously impossible at any cost</td></tr>
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">The Test</td><td className="px-4 py-2.5 border-b border-slate-100">Remove the AI. Could enough humans achieve the same result?</td><td className="px-4 py-2.5 border-b border-slate-100 text-teal-700 font-medium">Remove the AI. The outcome ceases to exist entirely.</td></tr>
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Example</td><td className="px-4 py-2.5 border-b border-slate-100">AI reads invoices, extracts fields into a spreadsheet</td><td className="px-4 py-2.5 border-b border-slate-100 text-teal-700 font-medium">AI analyzes 15 years of invoices to identify systematic 4% overcharging</td></tr>
                <tr><td className="px-4 py-2.5 font-semibold text-navy-900">Value Ceiling</td><td className="px-4 py-2.5">Bounded by cost of labor it replaces</td><td className="px-4 py-2.5 text-teal-700 font-medium">Unbounded — net new value that didn&rsquo;t exist before</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================= */}
        {/* PILLAR 2: GROUNDED DELIVERY   */}
        {/* ============================= */}
        <div>
          <div className="rounded-xl overflow-hidden border border-blue-200 mb-6">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-3 flex items-center gap-3">
              <span className="bg-white/20 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-white/40 shrink-0">2</span>
              <div>
                <h2 className="text-lg font-bold text-white">Grounded Delivery</h2>
                <p className="text-blue-100 text-xs">Deliver AI through phases designed for non-deterministic systems</p>
              </div>
            </div>
            <div className="bg-white p-5">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { num: "1", name: "Frame", desc: "Value hypothesis, boundaries, probabilistic success criteria, governance model", gate: "GO / NO-GO" },
                  { num: "2", name: "Explore", desc: "Structured experiments, parallel approaches, build evaluation dataset", gate: "GO / PIVOT / KILL" },
                  { num: "3", name: "Shape", desc: "Production architecture, integration contracts, fallback paths, ops model", gate: "GO / REVISIT" },
                  { num: "4", name: "Harden", desc: "Production code, eval suite, adversarial testing, human evaluation", gate: "GO / ITERATE" },
                  { num: "5", name: "Operate", desc: "Deploy, monitor drift, collect feedback, retrain/re-prompt continuously", gate: "ONGOING" },
                ].map((phase) => (
                  <div key={phase.num} className="border border-blue-200 rounded-lg p-3 bg-blue-50/50 flex flex-col">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded flex items-center justify-center shrink-0">{phase.num}</span>
                      <h3 className="font-bold text-navy-900 text-sm">{phase.name}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mb-2 flex-1">{phase.desc}</p>
                    <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                      <p className="text-xs font-bold text-amber-700 text-center">{phase.gate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grounded Delivery: Key Questions + Anti-Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-blue-200 rounded-xl p-5 bg-blue-50/30">
              <h3 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                <span className="text-blue-500">&#9670;</span> Key Questions by Phase
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li><span className="font-semibold text-blue-700">Frame:</span> Does the problem genuinely require non-deterministic components? What does &ldquo;good enough&rdquo; look like in probabilistic terms?</li>
                <li><span className="font-semibold text-blue-700">Explore:</span> What explicit hypothesis are we testing? How will we evaluate? What is the kill criterion?</li>
                <li><span className="font-semibold text-blue-700">Shape:</span> Where is the boundary between deterministic and non-deterministic components? What are our fallback paths?</li>
                <li><span className="font-semibold text-blue-700">Harden:</span> Does production eval meet probabilistic criteria with statistical confidence? What are the adversarial vectors?</li>
                <li><span className="font-semibold text-blue-700">Operate:</span> How do we detect model drift, data drift, concept drift? Is the eval dataset a living artifact?</li>
              </ul>
            </div>
            <div className="border border-red-200 rounded-xl p-5 bg-red-50/30">
              <h3 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                <span className="text-red-500">&#9888;</span> Anti-Patterns
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li><span className="font-semibold text-red-700">Frame Skipped</span> — Team wants to &ldquo;start building&rdquo; without defining probabilistic success criteria</li>
                <li><span className="font-semibold text-red-700">Velocity as Progress</span> — Code production throughput is not the bottleneck; evaluation throughput is</li>
                <li><span className="font-semibold text-red-700">Test Generation Illusion</span> — AI-generated tests that assert on specific strings provide false confidence for non-deterministic systems</li>
                <li><span className="font-semibold text-red-700">Sunk Cost at Gates</span> — Evidence shows approach is marginal, but team pushes forward because of time already invested</li>
                <li><span className="font-semibold text-red-700">Ship and Forget</span> — Deploying without budget for ongoing evaluation, monitoring, and retraining</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Agile vs Grounded Delivery table */}
        <div className="rounded-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-2.5">
            <h3 className="text-sm font-bold text-white">Agile vs. Grounded Delivery</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-navy-900 font-semibold text-left">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-200 w-40">Construct</th>
                  <th className="px-4 py-3 border-b border-slate-200">Agile (Deterministic)</th>
                  <th className="px-4 py-3 border-b border-slate-200">Grounded Delivery (Non-Deterministic)</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Work Unit</td><td className="px-4 py-2.5 border-b border-slate-100">User Story</td><td className="px-4 py-2.5 border-b border-slate-100 text-blue-700 font-medium">Value Hypothesis</td></tr>
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Success Criteria</td><td className="px-4 py-2.5 border-b border-slate-100">Binary pass/fail acceptance criteria</td><td className="px-4 py-2.5 border-b border-slate-100 text-blue-700 font-medium">Probabilistic thresholds (e.g., 92% acceptable &plusmn;3%)</td></tr>
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Planning</td><td className="px-4 py-2.5 border-b border-slate-100">Estimate in story points, commit to scope</td><td className="px-4 py-2.5 border-b border-slate-100 text-blue-700 font-medium">Time-box investigation, go/no-go on evidence</td></tr>
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Testing</td><td className="px-4 py-2.5 border-b border-slate-100">Regression (what passed yesterday passes today)</td><td className="px-4 py-2.5 border-b border-slate-100 text-blue-700 font-medium">Continuous evaluation (quality distribution shifts)</td></tr>
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Done</td><td className="px-4 py-2.5 border-b border-slate-100">Feature meets spec</td><td className="px-4 py-2.5 border-b border-slate-100 text-blue-700 font-medium">Quality exceeds threshold with statistical confidence</td></tr>
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Experimentation</td><td className="px-4 py-2.5 border-b border-slate-100">Spikes — second-class, grudgingly tolerated</td><td className="px-4 py-2.5 border-b border-slate-100 text-blue-700 font-medium">Full phase (Explore) with artifacts and funding</td></tr>
                <tr><td className="px-4 py-2.5 font-semibold text-navy-900">Post-Deploy</td><td className="px-4 py-2.5">Ship and stabilize</td><td className="px-4 py-2.5 text-blue-700 font-medium">Permanent investment in evaluation and retraining</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================= */}
        {/* PILLAR 3: LEGACY COEXISTENCE  */}
        {/* ============================= */}
        <div>
          <div className="rounded-xl overflow-hidden border border-violet-200 mb-6">
            <div className="bg-gradient-to-r from-violet-700 to-violet-500 px-5 py-3 flex items-center gap-3">
              <span className="bg-white/20 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-white/40 shrink-0">3</span>
              <div>
                <h2 className="text-lg font-bold text-white">Legacy Coexistence</h2>
                <p className="text-violet-100 text-xs">Make AI work alongside the systems that run the enterprise</p>
              </div>
            </div>
            <div className="bg-white p-5">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { num: "1", name: "Data Exhaust", when: "Legacy produces data AI can analyze without real-time access", trait: "Batch latency; decades of unanalyzed data" },
                  { num: "2", name: "Sidecar", when: "AI augments legacy near-real-time without modifying it", trait: "Observes events; supplementary outputs; legacy is SoR" },
                  { num: "3", name: "Gateway", when: "Controlled interface translating modern & legacy protocols", trait: "Encapsulates legacy complexity; deep interface knowledge" },
                  { num: "4", name: "Shadow Pipeline", when: "AI replaces legacy gradually with validated parallel runs", trait: "Both run; outputs compared; confidence before cutover" },
                  { num: "5", name: "Legacy-Aware Agent", when: "Autonomous agents across modern + legacy systems", trait: "Explicit legacy constraints; first-class in planning" },
                ].map((pattern) => (
                  <div key={pattern.num} className="border border-violet-200 rounded-lg p-3 bg-violet-50/50 flex flex-col">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-violet-500 text-white text-xs font-bold w-5 h-5 rounded flex items-center justify-center shrink-0">{pattern.num}</span>
                      <h3 className="font-bold text-navy-900 text-xs leading-tight">{pattern.name}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mb-2 flex-1">{pattern.when}</p>
                    <div className="bg-violet-100 border border-violet-200 rounded px-2 py-1.5">
                      <p className="text-xs text-violet-700 font-medium">{pattern.trait}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legacy Coexistence: Key Questions + Anti-Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-violet-200 rounded-xl p-5 bg-violet-50/30">
              <h3 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                <span className="text-violet-500">&#9670;</span> Key Questions
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2"><span className="text-violet-500 shrink-0">&#8250;</span> What interface types does the legacy system expose? (API, batch, terminal, file)</li>
                <li className="flex gap-2"><span className="text-violet-500 shrink-0">&#8250;</span> What are the extraction constraints? Real-time API vs. nightly batch vs. quarterly exports?</li>
                <li className="flex gap-2"><span className="text-violet-500 shrink-0">&#8250;</span> How stale can the data be before the value hypothesis becomes infeasible?</li>
                <li className="flex gap-2"><span className="text-violet-500 shrink-0">&#8250;</span> When the AI and legacy system disagree, who wins per use case?</li>
                <li className="flex gap-2"><span className="text-violet-500 shrink-0">&#8250;</span> What are the known data quality issues? Field inconsistencies? Missing data?</li>
                <li className="flex gap-2"><span className="text-violet-500 shrink-0">&#8250;</span> How does this legacy system fail? What is the error recovery model?</li>
              </ul>
            </div>
            <div className="border border-red-200 rounded-xl p-5 bg-red-50/30">
              <h3 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                <span className="text-red-500">&#9888;</span> Anti-Patterns
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li><span className="font-semibold text-red-700">The Greenfield Fantasy</span> — &ldquo;Once we modernize, we can deploy AI properly&rdquo; is a strategy for never deploying AI</li>
                <li><span className="font-semibold text-red-700">The Wrapper Illusion</span> — API wrappers hide legacy complexity but don&rsquo;t eliminate batch limits, format constraints, or failure modes</li>
                <li><span className="font-semibold text-red-700">Integration Afterthought</span> — &ldquo;We&rsquo;ll figure out legacy integration later&rdquo; — integration determines feasibility</li>
                <li><span className="font-semibold text-red-700">Screen Scraping Default</span> — Works for demos; breaks in production. Last resort, not a pattern.</li>
                <li><span className="font-semibold text-red-700">The Strangler Fig Misconception</span> — Valid for deterministic modernization, dangerous for AI. AI creates net new capabilities, not function-for-function replacement.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modernization vs Coexistence table */}
        <div className="rounded-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-violet-700 to-violet-500 px-5 py-2.5">
            <h3 className="text-sm font-bold text-white">Rip-and-Replace vs. Legacy Coexistence</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-navy-900 font-semibold text-left">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-200 w-36">Aspect</th>
                  <th className="px-4 py-3 border-b border-slate-200">Rip-and-Replace</th>
                  <th className="px-4 py-3 border-b border-slate-200">Legacy Coexistence</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Premise</td><td className="px-4 py-2.5 border-b border-slate-100">Replace legacy, then deploy AI</td><td className="px-4 py-2.5 border-b border-slate-100 text-violet-700 font-medium">Deploy AI alongside legacy, deliberately designed for hybrid</td></tr>
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Timeline</td><td className="px-4 py-2.5 border-b border-slate-100">Years of multi-system migration</td><td className="px-4 py-2.5 border-b border-slate-100 text-violet-700 font-medium">Weeks to deploy AI, no modernization prerequisite</td></tr>
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Risk</td><td className="px-4 py-2.5 border-b border-slate-100">Existential — entire business depends on switchover</td><td className="px-4 py-2.5 border-b border-slate-100 text-violet-700 font-medium">Bounded — AI augments, legacy remains primary</td></tr>
                <tr><td className="px-4 py-2.5 border-b border-slate-100 font-semibold text-navy-900">Data Access</td><td className="px-4 py-2.5 border-b border-slate-100">Assumes modern APIs and clean data</td><td className="px-4 py-2.5 border-b border-slate-100 text-violet-700 font-medium">Works with data exhaust, batch extracts, file formats</td></tr>
                <tr><td className="px-4 py-2.5 font-semibold text-navy-900">Economics</td><td className="px-4 py-2.5">Hundreds of millions, long ROI</td><td className="px-4 py-2.5 text-violet-700 font-medium">Proportional to AI value capture</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================= */}
        {/* HOW THE PILLARS CONNECT       */}
        {/* ============================= */}
        <div className="rounded-xl overflow-hidden border border-navy-800">
          <div className="bg-navy-900 px-5 py-3">
            <h2 className="text-base font-bold text-white">How the Pillars Connect</h2>
            <p className="text-slate-400 text-xs">The framework is a cycle, not a sequence</p>
          </div>
          <div className="bg-white p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* SC → GD */}
              <div className="border-l-4 border-teal-500 pl-4">
                <h3 className="font-bold text-sm text-navy-900 mb-2">
                  <span className="text-teal-600">Signal Capture</span> &rarr; <span className="text-blue-600">Grounded Delivery</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li>Value Hypothesis becomes the primary input to the Frame phase</li>
                  <li>Value Tracking feeds the probabilistic quality gates — quality is measured by progress toward value, not feature completion</li>
                </ul>
              </div>
              {/* SC → LC */}
              <div className="border-l-4 border-violet-500 pl-4">
                <h3 className="font-bold text-sm text-navy-900 mb-2">
                  <span className="text-teal-600">Signal Capture</span> &rarr; <span className="text-violet-600">Legacy Coexistence</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li>Highest-value AI opportunities often exist because legacy systems contain decades of unanalyzed data</li>
                  <li>Data validation must account for legacy constraints — formats, access patterns, extraction limitations</li>
                  <li>Coexistence patterns determine whether a value hypothesis is technically feasible</li>
                </ul>
              </div>
              {/* GD → LC */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-bold text-sm text-navy-900 mb-2">
                  <span className="text-blue-600">Grounded Delivery</span> &rarr; <span className="text-violet-600">Legacy Coexistence</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li>Explore phase must include legacy integration discovery — don&rsquo;t defer to Harden</li>
                  <li>Shadow Pipeline maps to the Harden phase — quality gates evaluate AI against legacy baselines</li>
                  <li>Dual-track governance: deterministic components use conventional rigor, non-deterministic use probabilistic evaluation</li>
                </ul>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-navy-900">The feedback loop:</span>{" "}
                Signal Capture identifies <em>what</em> to build. Grounded Delivery defines <em>how</em>. Legacy Coexistence ensures it works <em>where it has to</em>. The Operate phase feeds back into Signal Capture — production data reveals whether the value hypothesis was correct, informing the next round.
              </p>
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* RED FLAGS                     */}
        {/* ============================= */}
        <div className="rounded-xl overflow-hidden border border-red-200">
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-5 py-3">
            <h2 className="text-base font-bold text-white">Red Flags — When Something Is Going Wrong</h2>
          </div>
          <div className="bg-white p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold text-sm text-teal-600 mb-2">Signal Capture</h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> Cannot articulate value hypothesis in one sentence</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> Initiative labeled &ldquo;transformation&rdquo; but is really automation</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> No measurable outcome; success criteria are subjective</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> 3-6 months in production, leading indicators haven&rsquo;t materialized</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> 80%+ of portfolio is automation; nothing converting from experimental</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-sm text-blue-600 mb-2">Grounded Delivery</h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> Frame phase skipped — team wants to &ldquo;start building&rdquo;</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> Evaluation dataset doesn&rsquo;t exist, is tiny, or unrepresentative</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> Team completing stories but can&rsquo;t articulate progress toward value</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> Quality defined as &ldquo;it works&rdquo; instead of probabilistic thresholds</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> Deployed without production evaluation suite running</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-sm text-violet-600 mb-2">Legacy Coexistence</h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> &ldquo;We&rsquo;ll modernize first, then deploy AI&rdquo;</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> Legacy integration discovered late in Harden phase</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> Integration discussed in abstract — no one tested actual legacy behavior</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> Trust boundaries between AI and legacy outputs left ambiguous</li>
                  <li className="flex gap-1.5"><span className="text-red-400 shrink-0">&bull;</span> No contingency plan if legacy system becomes unavailable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* CORE PRINCIPLES               */}
        {/* ============================= */}
        <div className="rounded-xl overflow-hidden border border-navy-800">
          <div className="bg-navy-900 px-5 py-3">
            <h2 className="text-base font-bold text-white">Core Principles</h2>
          </div>
          <div className="bg-white p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "bg-red-500", label: "Kill early", text: "Every gate is a chance to stop spending on what won\u2019t work." },
              { icon: "bg-blue-500", label: "Non-deterministic by default", text: "AI outputs are distributions, not binaries. Design for it." },
              { icon: "bg-violet-500", label: "Legacy is a feature", text: "Decades of data and process logic are assets, not obstacles." },
              { icon: "bg-teal-500", label: "Value before technology", text: "If you can\u2019t articulate the value, you can\u2019t build the system." },
              { icon: "bg-amber-500", label: "Operate forever", text: "Non-deterministic systems need permanent monitoring and investment." },
              { icon: "bg-emerald-500", label: "Coexist deliberately", text: "Not rip-and-replace. Not wrappers. Intentional integration patterns." },
            ].map((p) => (
              <div key={p.label} className="flex items-start gap-3">
                <span className={`${p.icon} w-2.5 h-2.5 rounded-full mt-1.5 shrink-0`} />
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-navy-900">{p.label}.</span> {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Web-only footer */}
        <div className="text-center no-print">
          <Link
            href="/framework"
            className="text-teal-600 font-semibold hover:underline"
          >
            Read the full framework &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
