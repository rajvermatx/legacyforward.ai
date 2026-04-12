import Link from "next/link";
import { LogoWordmark } from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-400 border-t border-navy-800">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-2">
              <LogoWordmark />
            </div>
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
              <Link href="/cheatsheet" className="hover:text-teal-400 transition-colors">
                Quick Reference
              </Link>
            </div>
          </div>
          <div>
            <p className="text-white text-sm font-semibold mb-3">Library</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/library/books" className="hover:text-teal-400 transition-colors">
                Books
              </Link>
              <Link href="/library/toolkit" className="hover:text-teal-400 transition-colors">
                Toolkit
              </Link>
              <Link href="/library/learn" className="hover:text-teal-400 transition-colors">
                Learning Paths
              </Link>
              <Link href="/library/cheatsheets" className="hover:text-teal-400 transition-colors">
                Quick Reference
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
              <Link href="/app" className="hover:text-teal-400 transition-colors">
                App
              </Link>
              <Link href="/about" className="hover:text-teal-400 transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-navy-800 text-xs text-slate-500 space-y-3">
          <p className="leading-relaxed">
            LegacyForward.ai is an independent publication for general informational
            purposes only. All opinions are the author&rsquo;s own and do not represent any
            employer or organization. No warranty is expressed or implied; use of this
            site and its framework is at your own risk. Content is created with the help
            of AI tools, reviewed and edited for accuracy. Third-party links are provided
            for reference and do not imply endorsement.
          </p>
          <p className="text-center">
            &copy; {new Date().getFullYear()} LegacyForward.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
