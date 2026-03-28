import type { Metadata } from "next";
import Link from "next/link";
import SubscribeCTA from "@/components/SubscribeCTA";

export const metadata: Metadata = {
  title: "About",
  description:
    "LegacyForward exists to democratize enterprise AI transformation knowledge. Built from extensive experience leading enterprise-scale digital transformations.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">About</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Because the future of AI runs through the systems you already have.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 space-y-12">
          {/* What */}
          <div>
            <h2 className="text-2xl font-bold text-navy-900 mb-4">
              What LegacyForward Is
            </h2>
            <div className="text-slate-700 leading-relaxed space-y-4">
              <p>
                LegacyForward is a framework for enterprise AI adoption that bridges
                the gap between where organizations are — legacy systems, deterministic
                processes, existing investments — and where they need to go: AI-driven
                value creation at scale.
              </p>
              <p>
                It is built on three pillars:{" "}
                <Link href="/framework/value-capture" className="text-teal-600 font-medium hover:underline">
                  Value Capture
                </Link>
                ,{" "}
                <Link href="/framework/post-agile-delivery" className="text-teal-600 font-medium hover:underline">
                  Post-Agile Delivery
                </Link>
                , and{" "}
                <Link href="/framework/legacy-coexistence" className="text-teal-600 font-medium hover:underline">
                  Legacy Coexistence
                </Link>
                . Together, they connect value identification, delivery methodology for
                non-deterministic systems, and legacy integration into a single coherent
                approach.
              </p>
            </div>
          </div>

          {/* Why */}
          <div>
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Why It Exists</h2>
            <div className="text-slate-700 leading-relaxed space-y-4">
              <p>
                The enterprise world is failing at AI adoption — not because of
                technology, but because organizations are chasing hype instead of value,
                forcing non-deterministic AI projects into delivery methods designed for
                deterministic systems, and pretending legacy systems can be replaced when
                they cannot.
              </p>
              <p>
                The consulting firms sell strategy decks. The cloud vendors sell their
                platform. The blogs sell hype. None of them have built a practitioner&apos;s
                framework that connects value identification, delivery methodology, and
                legacy reality into a single coherent approach.
              </p>
            </div>
          </div>

          {/* Who */}
          <div>
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Who Built This</h2>
            <div className="text-slate-700 leading-relaxed space-y-4">
              <p>
                LegacyForward is built from extensive and broad experience leading
                enterprise-scale digital transformations, cloud adoption, and AI
                initiatives across multiple industry segments.
              </p>
              <p>
                This is not academic theory. It is not vendor marketing. It is a
                practitioner&apos;s framework built from the reality of what it takes to make
                AI work in organizations that run on legacy systems, serve millions of
                users, and cannot afford to fail.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div>
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Mission</h2>
            <div className="text-slate-700 leading-relaxed space-y-4">
              <p>
                LegacyForward exists to democratize enterprise AI transformation
                knowledge. The insights required to successfully adopt AI at scale should
                not be locked behind million-dollar consulting engagements.
              </p>
              <p>
                Every organization — regardless of size or budget — deserves access to a
                proven framework for capturing real value from AI while respecting the
                legacy systems that keep their business running.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SubscribeCTA />
    </>
  );
}
