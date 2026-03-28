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
              <Link href="/framework/signal-capture" className="hover:text-teal-400 transition-colors">
                Signal Capture
              </Link>
              <Link href="/framework/grounded-delivery" className="hover:text-teal-400 transition-colors">
                Grounded Delivery
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
        <div className="mt-10 pt-6 border-t border-navy-800 text-xs text-slate-500 space-y-3">
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-400">Disclaimer:</span> The
            information on this website is for general informational purposes only. All
            opinions expressed here are those of the author and do not purport to reflect
            the views or positions of any organization the author is associated with.
            LegacyForward makes no representation or warranty, express or implied. Your
            use of this website and its framework is solely at your own risk. This website
            may contain references or links to third-party content, which we do not
            warrant, endorse, or assume liability for. Some content on this site was
            created with the assistance of AI tools and reviewed and edited by the author.
          </p>
          <p className="text-center">
            &copy; {new Date().getFullYear()} LegacyForward. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
