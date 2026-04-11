import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ── Auth (NextAuth-compatible) ──────────────────────────────────

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  marketCode: text("market_code", { enum: ["US", "IN"] }).notNull().default("US"),
  personaType: text("persona_type", {
    enum: ["pivoter", "climber", "explorer", "adapter", "rebuilder"],
  }),
  subscriptionTier: text("subscription_tier", {
    enum: ["free", "pro", "career_bible", "premium"],
  }).notNull().default("free"),
  onboardingComplete: integer("onboarding_complete", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// ── Career Snapshot ─────────────────────────────────────────────

export const careerSnapshots = sqliteTable("career_snapshots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(true),
  currentRole: text("current_role"),
  currentIndustry: text("current_industry"),
  seniorityLevel: text("seniority_level"),
  yearsExperience: integer("years_experience"),
  marketCode: text("market_code", { enum: ["US", "IN"] }).notNull().default("US"),
  workHistory: text("work_history", { mode: "json" }).default("[]"),
  education: text("education", { mode: "json" }).default("[]"),
  skills: text("skills", { mode: "json" }).default("[]"),
  aspirations: text("aspirations", { mode: "json" }).default("{}"),
  aiReadiness: text("ai_readiness", { mode: "json" }).default("{}"),
  narrativeSummary: text("narrative_summary"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Conversations ───────────────────────────────────────────────

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentName: text("agent_name").notNull(),
  sessionType: text("session_type").notNull().default("chat"),
  messages: text("messages", { mode: "json" }).notNull().default("[]"),
  sharedContext: text("shared_context", { mode: "json" }).default("{}"),
  messageCount: integer("message_count").notNull().default(0),
  lastMessageAt: integer("last_message_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Achievements (Wins Tracker) ─────────────────────────────────

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rawText: text("raw_text").notNull(),
  source: text("source", { enum: ["app", "whatsapp", "email", "voice"] }).notNull().default("app"),
  category: text("category"),
  impactMetrics: text("impact_metrics", { mode: "json" }).default("[]"),
  starFormat: text("star_format", { mode: "json" }),
  tags: text("tags", { mode: "json" }).default("[]"),
  reviewPeriod: text("review_period"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
