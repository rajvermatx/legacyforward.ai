'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCompassStore } from '@/lib/compass-store';
import { Plus, FolderOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const user = useCompassStore((s) => s.user);
  const projects = useCompassStore((s) => s.projects);
  const addProject = useCompassStore((s) => s.addProject);
  const setActiveProject = useCompassStore((s) => s.setActiveProject);
  const diagnostics = useCompassStore((s) => s.diagnostics);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  if (!user) {
    router.push('/compass/login');
    return null;
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const project = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      description: newDesc.trim(),
      mode: 'solo' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProject(project);
    setActiveProject(project.id);
    setShowCreate(false);
    setNewName('');
    setNewDesc('');
    router.push(`/compass/projects/${project.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Welcome back, {user.name}</h1>
          <p className="text-sm text-gray mt-1">Manage your LLM delivery projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-white text-sm font-bold rounded-lg hover:bg-gold/90 transition-colors"
        >
          <Plus size={18} /> New project
        </button>
      </div>

      {/* Create project modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-navy mb-4">Create new project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Project name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-light px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  placeholder="e.g. Customer Support RAG"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Description <span className="text-gray">(optional)</span></label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-lg border border-light px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  rows={3}
                  placeholder="Brief description of the LLM initiative"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray hover:text-dark">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-gold text-white text-sm font-bold rounded-lg hover:bg-gold/90 transition-colors">
                  Create project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project list */}
      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-light">
          <FolderOpen size={48} className="text-light mx-auto mb-4" />
          <h2 className="text-lg font-bold text-navy">No projects yet</h2>
          <p className="text-sm text-gray mt-1 mb-6">Create your first project to get started with the Meridian Method.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-white text-sm font-bold rounded-lg hover:bg-gold/90 transition-colors"
          >
            <Plus size={18} /> Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const projectDiagnostics = diagnostics.filter((d) => d.projectId === project.id);
            const latestDiagnostic = projectDiagnostics[projectDiagnostics.length - 1];
            return (
              <Link
                key={project.id}
                href={`/compass/projects/${project.id}`}
                onClick={() => setActiveProject(project.id)}
                className="bg-white rounded-lg border border-light p-6 hover:shadow-md hover:border-mid transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-navy group-hover:text-mid transition-colors">{project.name}</h3>
                    {project.description && <p className="text-sm text-gray mt-1">{project.description}</p>}
                  </div>
                  <ArrowRight size={18} className="text-light group-hover:text-mid transition-colors mt-1" />
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-gray">
                  <span>{project.mode === 'team' ? 'Team' : 'Solo'}</span>
                  <span>&middot;</span>
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  {latestDiagnostic && (
                    <>
                      <span>&middot;</span>
                      <span className="text-teal font-medium">Diagnostic completed</span>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
