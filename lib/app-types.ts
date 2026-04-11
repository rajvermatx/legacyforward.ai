export type MarketCode = "US" | "IN";

export type PersonaType =
  | "pivoter"
  | "climber"
  | "explorer"
  | "adapter"
  | "rebuilder";

export type SubscriptionTier = "free" | "pro" | "career_bible" | "premium";

export type OnboardingStage =
  | "identity"
  | "experience"
  | "aspirations"
  | "skills"
  | "ai_readiness"
  | "complete";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  agentId?: string;
  timestamp: string;
}

export interface CareerSnapshot {
  currentRole: string | null;
  currentIndustry: string | null;
  seniorityLevel: string | null;
  yearsExperience: number | null;
  workHistory: WorkHistoryEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  aspirations: Aspirations;
  aiReadiness: AIReadiness;
  narrativeSummary: string | null;
}

export interface WorkHistoryEntry {
  title: string;
  company: string;
  years: number;
  industry: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: number;
}

export interface SkillEntry {
  name: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  category: "technical" | "leadership" | "creative" | "analytical" | "interpersonal";
}

export interface Aspirations {
  targetRoles: string[];
  timelineMonths: number | null;
  priorities: string[];
}

export interface AIReadiness {
  level: "none" | "beginner" | "intermediate" | "advanced";
  toolsUsed: string[];
  sentiment: "anxious" | "curious" | "confident" | "neutral";
  companyAdopting: boolean | null;
}

export const ONBOARDING_STAGES: OnboardingStage[] = [
  "identity",
  "experience",
  "aspirations",
  "skills",
  "ai_readiness",
];
