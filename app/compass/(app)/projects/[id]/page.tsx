'use client';
import { useParams, useRouter } from 'next/navigation';
import { useCompassStore } from '@/lib/compass-store';
import { DIAGNOSTIC_DIMENSIONS, getSeverity, getSeverityColor } from '@/lib/compass-constants';
import Link from 'next/link';
import { Target, FileDown, BarChart3 } from 'lucide-react';
import dynamic from 'next/dynamic';

const RadarDisplay = dynamic(() => import('@/components/compass/diagnostic/RadarDisplay'), { ssr: false });

const moduleCards = [
  { href: 'diagnostic', label: 'Readiness Diagnostic', description: 'Score your LLM delivery readiness in 10 minutes', icon: Target, color: 'bg-purple' },
  { href: 'templates', label: 'Templates & Resources', description: 'Download ceremony guides and job aid templates', icon: FileDown, color: 'bg-teal' },
  { href: 'eval', label: 'Eval Scorer', description: 'Score LLM outputs against your meridian', icon: BarChart3, color: 'bg-gold' },
];

export default function ProjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const projects = useCompassStore((s) => s.projects);
  const diagnostics = useCompassStore((s) => s.diagnostics);
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    router.push('/compass/dashboard');
    return null;
  }

  const projectDiagnostics = diagnostics.filter((d) => d.projectId === projectId);
  const latestDiagnostic = projectDiagnostics[projectDiagnostics.length - 1];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">{project.name}</h1>
        {project.description && <p className="text-sm text-gray mt-1">{project.description}</p>}
      </div>

      {/* Radar chart if diagnostic exists */}
      {latestDiagnostic && (
        <div className="bg-white rounded-lg border border-light p-6 mb-8">
          <h2 className="text-lg font-bold text-navy mb-4">Readiness Overview</h2>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <RadarDisplay scores={latestDiagnostic.scores} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-dark uppercase tracking-widest mb-3">Dimension Scores</h3>
              <div className="space-y-3">
                {DIAGNOSTIC_DIMENSIONS.map((dim) => {
                  const score = latestDiagnostic.scores[dim.id] || 0;
                  const severity = getSeverity(score);
                  const colors = getSeverityColor(severity);
                  return (
                    <div key={dim.id} className="flex items-center gap-3">
                      <div className="w-32 text-sm font-medium text-dark">{dim.shortName}</div>
                      <div className="flex-1 h-3 bg-lt-gray rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${score >= 80 ? 'bg-score-high' : score >= 60 ? 'bg-score-med' : 'bg-score-low'}`} style={{ width: `${score}%` }} />
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{severity}</span>
                    </div>
                  );
                })}
              </div>
              {latestDiagnostic.aiSummary && (
                <div className="mt-4 p-3 bg-teal-lt rounded-lg border border-teal/20">
                  <p className="text-sm text-teal">{latestDiagnostic.aiSummary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {moduleCards.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={`/compass/projects/${projectId}/${mod.href}`}
              className="bg-white rounded-lg border border-light p-6 hover:shadow-md hover:border-mid transition-all group"
            >
              <div className={`w-12 h-12 rounded-lg ${mod.color} flex items-center justify-center mb-4`}>
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-navy group-hover:text-mid transition-colors">{mod.label}</h3>
              <p className="text-sm text-gray mt-1">{mod.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
