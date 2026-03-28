import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-navy-900 text-white">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
          The future of AI runs through the systems you already have.
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-4 leading-relaxed">
          LegacyForward is a practitioner&rsquo;s framework for identifying real AI value,
          delivering through non-deterministic reality, and coexisting with the systems
          that actually run your enterprise.
        </p>
        <p className="text-base text-teal-400 font-medium max-w-2xl mx-auto mb-10">
          Signal Capture &rarr; Grounded Delivery &rarr; Legacy Coexistence
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/framework"
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded font-semibold text-lg transition-colors"
          >
            Explore the Framework
          </Link>
          <a
            href="https://legacyforwardai.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-slate-500 hover:border-teal-400 hover:text-teal-400 text-white px-8 py-3 rounded font-semibold text-lg transition-colors"
          >
            Subscribe
          </a>
        </div>
      </div>
    </section>
  );
}
