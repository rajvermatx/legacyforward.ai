'use client';
import { useParams } from 'next/navigation';
import { useCompassStore } from '@/lib/compass-store';
import { JOB_AID_TYPES } from '@/lib/compass-constants';
import Link from 'next/link';
import { FileText, ClipboardCheck, Calendar, Database } from 'lucide-react';
import ProgressRing from '@/components/compass/ui/ProgressRing';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = { FileText, ClipboardCheck, Calendar, Database };

export default function WorkbenchOverviewPage() {
  const params = useParams();
  const projectId = params.id as string;
  const jobAids = useCompassStore((s) => s.jobAids);
  const projectAids = jobAids.filter((j) => j.projectId === projectId);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-2">Practitioner Workbench</h1>
      <p className="text-sm text-gray mb-8">Structured job aid builders with AI coaching on every field.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {JOB_AID_TYPES.map((aid) => {
          const Icon = iconMap[aid.icon] || FileText;
          const existing = projectAids.filter((j) => j.aidType === aid.type);
          return (
            <Link
              key={aid.type}
              href={`/compass/projects/${projectId}/workbench/${aid.type}`}
              className="bg-white rounded-lg border border-light p-5 hover:shadow-md hover:border-mid transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-navy text-sm group-hover:text-mid transition-colors">{aid.name}</h3>
                  <p className="text-xs text-gray mt-1">{aid.description}</p>
                </div>
              </div>
              {existing.length > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  {existing.slice(-3).map((j) => (
                    <ProgressRing key={j.id} value={j.completeness} size={36} strokeWidth={4} />
                  ))}
                  <span className="text-xs text-gray">{existing.length} created</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
