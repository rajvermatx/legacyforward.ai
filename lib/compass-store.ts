import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type Role = 'BA' | 'QA' | 'PO' | 'PM' | 'DataSteward' | 'ChangeManager' | 'Other';
export type ProjectMode = 'solo' | 'team';
export type RiskClass = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CeremonyType = 'baseline' | 'hypothesis' | 'standup' | 'eval_review' | 'gate' | 'drift_watch';
export type AidType = 'hypothesis' | 'test_plan' | 'sprint_planner' | 'rag_readiness';
export type GateDecision = 'advance' | 'reset' | 'retire' | 'pending';
export type DiagnosticResponse = 'Fully in place' | 'Partially' | 'Aware but not practising' | 'Not on our radar';
export type Severity = 'Critical' | 'Gap' | 'Developing' | 'Strong';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  org?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  mode: ProjectMode;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticResult {
  id: string;
  projectId: string;
  responses: Record<string, DiagnosticResponse>;
  scores: Record<string, number>;
  gaps: { dimension: string; severity: Severity; score: number }[];
  aiSummary?: string;
  createdAt: string;
}

export interface CeremonySession {
  id: string;
  projectId: string;
  ceremonyType: CeremonyType;
  status: 'in_progress' | 'complete';
  artifact: Record<string, unknown>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobAid {
  id: string;
  projectId: string;
  aidType: AidType;
  fields: Record<string, unknown>;
  aiFeedback?: Record<string, string>;
  completeness: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvalSession {
  id: string;
  projectId: string;
  hypothesisId?: string;
  meridian: { acceptable: string[]; unacceptable: string[]; riskClass: RiskClass; threshold: number };
  outputs: { text: string; input?: string; scores?: Record<string, number>; overall?: number; flag?: string; rationale?: string }[];
  overallScore?: number;
  gateDecision: GateDecision;
  aiRationale?: string;
  createdAt: string;
}

interface CompassStore {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Projects
  projects: Project[];
  activeProjectId: string | null;
  addProject: (project: Project) => void;
  setActiveProject: (id: string) => void;
  getActiveProject: () => Project | undefined;

  // Diagnostics
  diagnostics: DiagnosticResult[];
  addDiagnostic: (d: DiagnosticResult) => void;
  getProjectDiagnostics: (projectId: string) => DiagnosticResult[];

  // Ceremonies
  ceremonies: CeremonySession[];
  addCeremony: (c: CeremonySession) => void;
  updateCeremony: (id: string, updates: Partial<CeremonySession>) => void;
  getProjectCeremonies: (projectId: string) => CeremonySession[];

  // Job Aids
  jobAids: JobAid[];
  addJobAid: (j: JobAid) => void;
  updateJobAid: (id: string, updates: Partial<JobAid>) => void;
  getProjectJobAids: (projectId: string) => JobAid[];

  // Eval Sessions
  evalSessions: EvalSession[];
  addEvalSession: (e: EvalSession) => void;
  updateEvalSession: (id: string, updates: Partial<EvalSession>) => void;
  getProjectEvalSessions: (projectId: string) => EvalSession[];
}

export const useCompassStore = create<CompassStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),

      projects: [],
      activeProjectId: null,
      addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
      setActiveProject: (id) => set({ activeProjectId: id }),
      getActiveProject: () => {
        const s = get();
        return s.projects.find((p) => p.id === s.activeProjectId);
      },

      diagnostics: [],
      addDiagnostic: (d) => set((s) => ({ diagnostics: [...s.diagnostics, d] })),
      getProjectDiagnostics: (projectId) => get().diagnostics.filter((d) => d.projectId === projectId),

      ceremonies: [],
      addCeremony: (c) => set((s) => ({ ceremonies: [...s.ceremonies, c] })),
      updateCeremony: (id, updates) => set((s) => ({
        ceremonies: s.ceremonies.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),
      getProjectCeremonies: (projectId) => get().ceremonies.filter((c) => c.projectId === projectId),

      jobAids: [],
      addJobAid: (j) => set((s) => ({ jobAids: [...s.jobAids, j] })),
      updateJobAid: (id, updates) => set((s) => ({
        jobAids: s.jobAids.map((j) => j.id === id ? { ...j, ...updates } : j),
      })),
      getProjectJobAids: (projectId) => get().jobAids.filter((j) => j.projectId === projectId),

      evalSessions: [],
      addEvalSession: (e) => set((s) => ({ evalSessions: [...s.evalSessions, e] })),
      updateEvalSession: (id, updates) => set((s) => ({
        evalSessions: s.evalSessions.map((e) => e.id === id ? { ...e, ...updates } : e),
      })),
      getProjectEvalSessions: (projectId) => get().evalSessions.filter((e) => e.projectId === projectId),
    }),
    { name: 'compass-store' }
  )
);
