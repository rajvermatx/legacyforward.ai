export default function SubscribeCTA() {
  return (
    <section className="bg-navy-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Stay ahead of enterprise AI.
        </h2>
        <p className="text-slate-300 mb-8 leading-relaxed">
          Subscribe to LegacyForward for practitioner-level insights on value capture,
          delivery methodology, and making AI work with the systems you already have.
        </p>
        <a
          href="https://legacyforwardai.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded font-semibold text-lg transition-colors"
        >
          Subscribe on Substack
        </a>
      </div>
    </section>
  );
}
