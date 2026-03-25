'use client';
import { useParams } from 'next/navigation';
import { useCompassStore } from '@/lib/compass-store';
import { CEREMONY_TYPES } from '@/lib/compass-constants';
import Link from 'next/link';
import { Anchor, FlaskConical, Users, BarChart3, ShieldCheck, Activity, CheckCircle } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = { Anchor, FlaskConical, Users, BarChart3, ShieldCheck, Activity };

export default function CeremoniesOverviewPage() {
  const params = useParams();
  const projectId = params.id as string;
  const ceremonies = useCompassStore((s) => s.ceremonies);
  const projectCeremonies = ceremonies.filter((c) => c.projectId === projectId);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-2">Ceremony Facilitator</h1>
      <p className="text-sm text-gray mb-8">Run Meridian ceremonies step by step. Each produces a structured artifact.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CEREMONY_TYPES.map((ceremony) => {
          const Icon = iconMap[ceremony.icon] || FlaskConical;
          const completed = projectCeremonies.filter((c) => c.ceremonyType === ceremony.type && c.status === 'complete');
          const inProgress = projectCeremonies.filter((c) => c.ceremonyType === ceremony.type && c.status === 'in_progress');

          return (
            <Link
              key={ceremony.type}
              href={`/compass/projects/${projectId}/ceremonies/${ceremony.type}`}
              className="bg-white rounded-lg border border-light p-5 hover:shadow-md hover:border-mid transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-navy text-sm group-hover:text-mid transition-colors">{ceremony.name}</h3>
                  <p className="text-xs text-gray mt-0.5">Replaces: {ceremony.replaces}</p>
                </div>
              </div>
              {(completed.length > 0 || inProgress.length > 0) && (
                <div className="mt-3 flex gap-2 text-xs">
                  {completed.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-teal">
                      <CheckCircle size={12} /> {completed.length} completed
                    </span>
                  )}
                  {inProgress.length > 0 && (
                    <span className="text-gold">{inProgress.length} in progress</span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
