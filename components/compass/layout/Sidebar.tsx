'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Compass, FlaskConical, Wrench, BarChart3, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  projectId?: string;
  projectName?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

const LINK_DESCRIPTIONS: Record<string, string> = {
  'Dashboard': 'View and manage all your LLM delivery projects. Create new projects or continue existing ones.',
  'Overview': 'Your project hub — readiness scores, module access, and progress at a glance.',
  'Readiness Diagnostic': 'Score your team across 5 dimensions in 10 minutes. Surface gaps and get prioritised recommendations.',
  'Ceremony Facilitator': 'Run all 6 Meridian ceremonies step by step. Each produces a structured, exportable artifact.',
  'Practitioner Workbench': 'Build job aids with AI coaching on every field. Hypothesis, test plan, sprint planner, and RAG readiness.',
  'Eval Scorer': 'Score LLM outputs against your human meridian baseline. Get confidence scores and gate recommendations.',
};

const dashboardLinks = [
  { href: '/compass/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

function getProjectLinks(projectId: string) {
  const base = `/compass/projects/${projectId}`;
  return [
    { href: base, label: 'Overview', icon: Compass },
    { href: `${base}/diagnostic`, label: 'Readiness Diagnostic', icon: BarChart3 },
    { href: `${base}/ceremonies`, label: 'Ceremony Facilitator', icon: FlaskConical },
    { href: `${base}/workbench`, label: 'Practitioner Workbench', icon: Wrench },
    { href: `${base}/eval`, label: 'Eval Scorer', icon: BarChart3 },
  ];
}

export default function Sidebar({ projectId, projectName, collapsed }: SidebarProps) {
  const pathname = usePathname();
  const links = projectId ? getProjectLinks(projectId) : dashboardLinks;

  return (
    <aside className={`bg-navy text-white flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'} min-h-screen`}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link href="/compass" className="flex items-center gap-2">
          <Compass size={24} className="text-gold flex-shrink-0" />
          {!collapsed && (
            <div>
              <span className="text-sm font-bold tracking-heading">Meridian Compass</span>
              <span className="text-[10px] text-gold align-super">&trade;</span>
            </div>
          )}
        </Link>
      </div>

      {/* Project name */}
      {projectName && !collapsed && (
        <div className="px-4 py-3 border-b border-white/10">
          <Link href="/compass/dashboard" className="text-xs text-steel hover:text-white flex items-center gap-1">
            <ChevronLeft size={12} /> All projects
          </Link>
          <p className="text-sm font-medium text-white mt-1 truncate">{projectName}</p>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 py-4">
        {(() => {
          // Find the most specific matching link (longest href that matches)
          const bestMatch = [...links]
            .filter((link) => pathname === link.href || pathname?.startsWith(link.href + '/'))
            .sort((a, b) => b.href.length - a.href.length)[0];

          return links.map((link) => {
            const isActive = bestMatch?.href === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-white/10 text-gold font-medium border-r-2 border-gold' : 'text-light hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && link.label}
              </Link>
            );
          });
        })()}

        {/* Active page description */}
        {!collapsed && (() => {
          const bestMatch = [...links]
            .filter((link) => pathname === link.href || pathname?.startsWith(link.href + '/'))
            .sort((a, b) => b.href.length - a.href.length)[0];
          const description = bestMatch ? LINK_DESCRIPTIONS[bestMatch.label] : null;
          if (!description) return null;
          return (
            <div className="mx-4 mt-4 px-3 py-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-[11px] leading-relaxed text-steel">
                {description}
              </p>
            </div>
          );
        })()}
      </nav>

      {/* Back to main site */}
      <div className="p-4 border-t border-white/10">
        <Link href="/" className={`text-xs text-steel hover:text-white transition-colors ${collapsed ? 'text-center block' : ''}`}>
          {collapsed ? '←' : '← legacyforward.ai'}
        </Link>
      </div>
    </aside>
  );
}
