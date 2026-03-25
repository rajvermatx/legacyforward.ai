'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import Button from './Button';

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gold shadow-sm">
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-0 shrink-0">
          <span className="text-xl font-bold text-navy tracking-heading">
            LegacyForward
          </span>
          <span className="text-xs font-bold text-gold align-super">&trade;</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-dark hover:text-mid transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          <Button href="/contact" variant="primary" className="text-sm px-4 py-2">
            Contact Us
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-navy"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-50 bg-white">
          <div className="flex flex-col items-center gap-6 pt-12 px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xl font-semibold text-navy hover:text-mid transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button
              href="/contact"
              variant="primary"
              className="mt-4 w-full max-w-xs text-center"
            >
              Contact Us
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
