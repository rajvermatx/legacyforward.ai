'use client';
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppShellProps {
  children: ReactNode;
  projectId?: string;
  projectName?: string;
}

export default function AppShell({ children, projectId, projectName }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-lt-gray">
      <Sidebar projectId={projectId} projectName={projectName} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
