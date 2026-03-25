import Link from 'next/link';

const footerColumns = [
  {
    title: 'Methodology',
    links: [
      { label: 'Meridian Method', href: '/meridian-method' },
      { label: 'Calibration Cycle', href: '/meridian-cycle' },
      { label: 'Why Agile Breaks', href: '/meridian-method#broken-assumptions' },
      { label: 'Licensing', href: '/meridian-method#licensing' },
    ],
  },
  {
    title: 'Program',
    links: [
      { label: 'Allied Skills', href: '/allied-skills' },
      { label: 'Sessions', href: '/allied-skills#sessions' },
      { label: 'Job Aids', href: '/allied-skills#job-aids' },
      { label: 'Credential', href: '/allied-skills#credential' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Resources', href: '/resources' },
      { label: 'Contact', href: '/contact' },
      { label: 'Meridian Compass', href: '/compass' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold tracking-heading">
                LegacyForward
              </span>
              <span className="text-xs font-bold text-gold align-super">&trade;</span>
            </div>
            <p className="mt-2 text-sm text-light italic">
              Calibration-first. Legacy-ready.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gold mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-light hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-xs text-steel">
            &copy; 2026 LegacyForward. The Meridian Method&trade; is a trademark of
            LegacyForward. All rights reserved.
          </p>
          <p className="text-xs text-steel mt-1">
            Developed in the USA. Delivered globally.
          </p>
        </div>
      </div>
    </footer>
  );
}
