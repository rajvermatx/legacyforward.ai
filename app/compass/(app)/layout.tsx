'use client';
import AppShell from '@/components/compass/layout/AppShell';
import { useCompassStore } from '@/lib/compass-store';
import { usePathname } from 'next/navigation';

export default function CompassAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const projects = useCompassStore((s) => s.projects);
  // Extract projectId from URL if on a project page
  const projectIdMatch = pathname?.match(/\/compass\/projects\/([^\/]+)/);
  const projectId = projectIdMatch?.[1] || undefined;
  const project = projectId ? projects.find((p) => p.id === projectId) : undefined;

  return (
    <AppShell projectId={projectId} projectName={project?.name}>
      {children}
    </AppShell>
  );
}
