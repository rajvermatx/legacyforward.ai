import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-400 border-t border-navy-800">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-white text-lg font-bold tracking-tight mb-2">
              Legacy<span className="text-teal-400">Forward</span>
            </p>
            <p className="text-sm leading-relaxed">
              The future of AI runs through the systems you already have.
            </p>
          </div>
          <div>
            <p className="text-white text-sm font-semibold mb-3">Framework</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/framework/value-capture" className="hover:text-teal-400 transition-colors">
                Value Capture
              </Link>
              <Link href="/framework/post-agile-delivery" className="hover:text-teal-400 transition-colors">
                Post-Agile Delivery
              </Link>
              <Link href="/framework/legacy-coexistence" className="hover:text-teal-400 transition-colors">
                Legacy Coexistence
              </Link>
            </div>
          </div>
          <div>
            <p className="text-white text-sm font-semibold mb-3">Connect</p>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="https://legacyforwardai.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-400 transition-colors"
              >
                Substack
              </a>
              <Link href="/about" className="hover:text-teal-400 transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-navy-800 text-xs text-slate-500 text-center">
          &copy; {new Date().getFullYear()} LegacyForward. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
