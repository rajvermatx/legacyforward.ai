import type { Metadata } from "next";
import Link from "next/link";
import SubscribeCTA from "@/components/SubscribeCTA";

export const metadata: Metadata = {
  title: "About",
  description:
    "LegacyForward.ai exists to solve the three problems that actually kill enterprise AI initiatives — built by a practitioner with 30 years of transformation experience.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            The Future of AI Runs Through the Systems You Already Have
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            LegacyForward.ai is a practitioner-built platform for enterprise AI transformation —
            framework, resources, and tools in one place.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 space-y-14">

          {/* The Problem */}
          <div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">The Problem</p>
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Enterprise AI Is Failing — and Not for the Reasons You Think</h2>
            <div className="text-slate-700 leading-relaxed space-y-4">
              <p>
                Most enterprise AI initiatives fail before they deliver value. Gartner, McKinsey, and
                MIT Sloan have all documented it: somewhere between 70% and 85% of AI projects never
                reach production or fail to deliver measurable ROI. This isn&apos;t a technology problem.
                The models work. The cloud infrastructure exists. The talent is available.
              </p>
              <p>
                The failure is structural — and it comes from three compounding mistakes that nearly
                every organization makes:
              </p>
              <div className="space-y-4 pl-4 border-l-2 border-teal-200 mt-2">
                <div>
                  <p className="font-semibold text-navy-900">1. Chasing AI hype instead of AI value.</p>
                  <p className="text-slate-600 mt-1">
                    Organizations greenlight AI projects based on what competitors are announcing, not
                    on disciplined value identification. POCs multiply. Production deployments don&apos;t.
                    The gap between pilot and value isn&apos;t a deployment problem — it&apos;s a signal problem.
                    Nobody asked the right questions before building.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">2. Forcing non-deterministic AI into deterministic delivery methods.</p>
                  <p className="text-slate-600 mt-1">
                    Agile was designed for software that behaves predictably given identical inputs.
                    LLMs and agentic AI are fundamentally non-deterministic — outputs vary, acceptance
                    criteria can&apos;t be binary, and quality gates built for code don&apos;t translate.
                    Organizations don&apos;t need to abandon Agile. They need to evolve it.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">3. Treating legacy systems as the enemy.</p>
                  <p className="text-slate-600 mt-1">
                    The mainframes, COBOL payroll systems, on-prem ERPs, and SOAP endpoints that power
                    most large organizations aren&apos;t going anywhere. They process trillions in transactions
                    and encode decades of business logic. AI doesn&apos;t replace them — it has to work with
                    them. Organizations that haven&apos;t figured out that integration are stuck.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* The Motivation */}
          <div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">The Motivation</p>
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Built From 30 Years of Making Transformation Actually Work</h2>
            <div className="text-slate-700 leading-relaxed space-y-4">
              <p>
                LegacyForward.ai was built by an Enterprise Architect with over 30 years of experience
                leading large-scale digital transformations — across cloud adoption, AI/ML initiatives,
                and the messy reality of integrating modern systems with legacy infrastructure in
                organizations that cannot afford to fail.
              </p>
              <p>
                Every lesson in the framework came from the field. The value identification patterns
                came from watching too many POCs die because nobody validated the use case. The delivery
                methodology came from watching Agile sprint reviews break down when the output was
                &ldquo;it works most of the time.&rdquo; The legacy coexistence patterns came from actually
                building AI systems on top of COBOL and batch pipelines — not theorizing about it.
              </p>
              <p>
                Thousands of articles, vendors, and consultants talk about enterprise AI. Almost none
                address the intersection of value capture, non-deterministic delivery, and legacy
                reality from someone who has led this work at scale. That gap is what LegacyForward.ai
                was built to close.
              </p>
              <p>
                The insights required to navigate this shift should not cost a million-dollar consulting
                engagement. They should be accessible to every practitioner, architect, and leader
                trying to move their organization forward.
              </p>
            </div>
          </div>

          {/* The Platform */}
          <div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">The Platform</p>
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Three Components. One Coherent Response.</h2>
            <p className="text-slate-700 leading-relaxed mb-8">
              LegacyForward.ai isn&apos;t a blog. It&apos;s a platform with three integrated components,
              each addressing a different layer of the problem.
            </p>

            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <span className="bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shrink-0 mt-0.5">
                    Framework
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-navy-900 mb-2">
                      Signal Capture · Grounded Delivery · Legacy Coexistence
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      The core methodology: three pillars that address the three failure modes
                      directly. Signal Capture gives you a disciplined process for identifying and
                      validating real AI value before committing resources. Grounded Delivery replaces
                      Agile&apos;s deterministic assumptions with phases built for probabilistic AI systems.
                      Legacy Coexistence provides architecture patterns for AI and existing systems to
                      operate together — without rip-and-replace.
                    </p>
                    <Link href="/framework" className="text-sm font-semibold text-teal-600 hover:underline">
                      Explore the Framework →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <span className="bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shrink-0 mt-0.5">
                    Library
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-navy-900 mb-2">
                      Books · Toolkit · Learning Paths · Quick Reference
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      Free practitioner resources organized by role and depth — 7+ books covering
                      AI strategy, architecture, and engineering; 30+ toolkit patterns as actionable
                      blueprints; certification-aligned learning paths for GCP and GenAI; and quick
                      reference guides you can download and use today. No paywalls. No sign-ups.
                    </p>
                    <Link href="/library" className="text-sm font-semibold text-violet-600 hover:underline">
                      Browse the Library →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      App
                    </span>
                    <span className="bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy-900 mb-2">
                      AI-Powered Career Navigation
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      The framework and library tell you what to know. The app figures out what
                      that means for you specifically. Seven AI agents work from your career profile
                      to generate a personalized roadmap, score your AI exposure risk, translate your
                      existing skills to target roles, and produce a 16-chapter career book written
                      about you — not a generic template.
                    </p>
                    <span className="text-sm text-slate-400 cursor-not-allowed">
                      Explore the App → (coming soon)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connect */}
          <div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Connect</p>
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Follow the Work</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              The Substack publication is where new framework thinking, case analyses, and
              practitioner articles get published first. Subscribe to get them in your inbox.
            </p>
            <a
              href="https://legacyforwardai.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors"
            >
              Follow on Substack →
            </a>
          </div>

        </div>
      </section>

      <SubscribeCTA
        headline="Get the framework in your inbox."
        description="New articles, patterns, and practitioner insights on enterprise AI transformation — subscribe to the Substack."
      />
    </>
  );
}
