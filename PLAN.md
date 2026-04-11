# Consolidation Plan: Unify LegacyForward.ai Platform

## Context

Three separate properties are being merged into a single platform at legacyforward.ai:
- **legacyforward.ai** — Framework site (Signal Capture → Grounded Delivery → Legacy Coexistence)
- **careeralign.com** — Free learning library (6 books, 30 toolkit patterns, 95+ notebooks, 15 cheatsheets, 8 learning paths)
- **app.careeralign.com** — Paid AI career tool (7 AI agents, onboarding, roadmap, coach, wins tracker, career book)

**Target structure:**
```
legacyforward.ai/
├── /                     # Unified home page
├── /framework/[slug]     # Existing framework (keep as-is)
├── /blog/[slug]          # Existing blog (keep as-is)
├── /cheatsheet           # Existing PDF cheatsheet (keep as-is)
├── /about                # Existing about page
├── /library              # Migrated from careeralign.com
│   ├── /books/[book]/[chapter]
│   ├── /toolkit/[category]/[pattern]
│   ├── /learn/[path]/[module]
│   └── /cheatsheets/[slug]
├── /app                  # Migrated from app.careeralign.com (fully rebranded)
│   ├── /login
│   ├── /dashboard
│   ├── /onboarding
│   ├── /caii
│   ├── /roadmap
│   ├── /coach
│   ├── /book
│   ├── /bridge
│   ├── /wins
│   └── /pricing
└── /api/...              # App API routes
```

---

## Phase 0 — Prerequisites (package.json, dependencies)

**Files to modify:** `legacyforward/package.json`

- Add `"prebuild": "node scripts/generate-search-index.mjs"` to scripts
- Add monorepo workspace support OR inline the agent/db packages — decision: **inline** (keep legacyforward as a single Next.js app, not a monorepo; copy agent logic from ca_app packages directly into `lib/agents/`)
- Add dependencies from ca_app that legacyforward.ai will need:
  - `next-auth` v5 (beta)
  - `drizzle-orm`, `better-sqlite3`
  - `openai`
  - `drizzle-kit` (devDep)

---

## Phase 1 — Merge the Content Layer (lib/)

**Goal:** Single unified `lib/content.ts` serving both the existing framework/blog content and all library content. Do not break existing routes.

**Steps:**
1. Move `legacyforward/content/*.md` (blog posts) → `legacyforward/blog-content/`
2. Copy careeralign's `lib/content.ts` as the new `legacyforward/lib/content.ts`, then:
   - Add back `getFrameworkPillars`, `getFrameworkBySlug` (pointing to `framework/`)
   - Add back `getBlogPosts`, `getBlogBySlug` (pointing to `blog-content/`)
   - Keep all careeralign section functions (`getSection`, `getBySlug`, `getSectionMeta`, `getAllSections`)
3. Copy `careeralign/lib/types.ts` → `legacyforward/lib/types.ts` (superset of existing type)
4. Copy `careeralign/lib/nav-helpers.ts` → `legacyforward/lib/nav-helpers.ts`
5. Copy `careeralign/lib/related.ts` → `legacyforward/lib/related.ts`, bulk-replace all `/toolkit/` → `/library/toolkit/`, `/books/` → `/library/books/`
6. Copy `careeralign/lib/path-names.ts` → `legacyforward/lib/path-names.ts`

---

## Phase 2 — Migrate Content Files

**Steps:**
1. Copy entire `careeralign/content/` tree → `legacyforward/content/` (235 .md files, 21 sections, all `_meta.json` files)
2. Copy `careeralign/public/cheatsheets/` → `legacyforward/public/cheatsheets/`
3. Copy `careeralign/public/books/` → `legacyforward/public/books/`
4. Copy `careeralign/public/diagrams/` → `legacyforward/public/diagrams/`
5. Copy `careeralign/public/search-index.json` → `legacyforward/public/search-index.json` (overwritten at build)

---

## Phase 3 — Migrate Library Components

**Components to copy from careeralign with changes noted:**

| Component | Change |
|-----------|--------|
| `SearchDialog.tsx` | Update href prefixes: `/toolkit` → `/library/toolkit`, `/books` → `/library/books`, `/learn` → `/library/learn`, `/cheatsheets` → `/library/cheatsheets` |
| `ReadingProgress.tsx` | Change `STORAGE_KEY` → `"legacyforward-reading-progress"` |
| `ReadingHistoryPanel.tsx` | Same key change; update `sectionLabel()` path mappings to include `library/` prefix |
| `BookSidebar.tsx` | Copy as-is |
| `Breadcrumb.tsx` | Copy as-is |
| `ContentCard.tsx` | Copy as-is |
| `PrevNext.tsx` | Copy as-is |
| `RelatedPatterns.tsx` | Copy as-is (hrefs come from `related.ts` which is updated in Phase 1) |
| `NotebookLink.tsx` | Copy as-is |
| `TextToSpeech.tsx` | Copy as-is (verify `"use client"` present) |

**Components to update in legacyforward:**

- **`Nav.tsx`**: Add Library link (`/library`), App link (`/app`), search icon (dispatch `open-search` event), reading history icon. Import `ReadingHistoryPanel`. Keep existing Framework, Blog, Cheatsheet, About, Subscribe.
- **`Footer.tsx`**: Add Library column (Books, Toolkit, Learn, Cheatsheets). Keep existing Framework and Connect columns. Update copyright to LegacyForward.ai.
- **`Prose.tsx`**: Adopt careeralign's version if richer (check for custom h3 badge formatting, table component conversion).
- **`app/layout.tsx`**: Import and render `SearchDialog` and `ContinueReadingBanner` globally.

---

## Phase 4 — Create /library Route Structure

All new files go under `legacyforward/app/library/`.

**Key architectural decision:** Consolidate careeralign's 6 separate book directories and 6 learn directories into single dynamic routes (`[book]` and `[path]`). Each uses a `bookDefs` / `pathDefs` lookup map at module top.

**Files to create:**

| File | Source / Notes |
|------|----------------|
| `app/library/page.tsx` | New hub page: 4 section cards (Books, Toolkit, Learn, Cheatsheets) |
| `app/library/books/page.tsx` | From `ca/app/books/page.tsx`; update hrefs to `/library/books/...` |
| `app/library/books/[book]/page.tsx` | **Consolidates** 6 `ca/app/books/*/page.tsx` files; `book` param drives `bookDefs` lookup |
| `app/library/books/[book]/[chapter]/page.tsx` | **Consolidates** 6 `ca/app/books/*/[slug]/page.tsx` files |
| `app/library/learn/page.tsx` | From `ca/app/learn/page.tsx`; update hrefs |
| `app/library/learn/[path]/page.tsx` | **Consolidates** 6 learn path pages |
| `app/library/learn/[path]/[module]/page.tsx` | **Consolidates** 6 module pages |
| `app/library/learn/[path]/usecases/page.tsx` | From `ca/app/learn/gcp-mle/usecases/page.tsx` |
| `app/library/learn/[path]/usecases/[slug]/page.tsx` | From `ca/app/learn/gcp-mle/usecases/[slug]/page.tsx` |
| `app/library/toolkit/page.tsx` | From `ca/app/toolkit/page.tsx`; update hrefs |
| `app/library/toolkit/[category]/page.tsx` | **Consolidates** 3 toolkit category pages |
| `app/library/toolkit/[category]/[pattern]/page.tsx` | **Consolidates** 3 pattern detail pages |
| `app/library/cheatsheets/page.tsx` | From `ca/app/cheatsheets/page.tsx`; update hrefs |
| `app/library/cheatsheets/[slug]/page.tsx` | From `ca/app/cheatsheets/[slug]/page.tsx`; update hrefs, domain |

For all files: replace `careeralign.com` → `legacyforward.ai`, `CareerAlign` → `LegacyForward.ai`.

---

## Phase 5 — Migrate /app Route (app.careeralign.com → /app)

**Goal:** The full ca_app platform lives at `legacyforward.ai/app/...`, fully rebranded.

**Strategy:** Copy ca_app's `apps/platform/` Next.js app into `legacyforward/app/app/` as a nested route group. The ca_app monorepo packages (`@careeralign/db`, `@careeralign/agents`, `@careeralign/shared`) are inlined into `legacyforward/lib/`:

| ca_app package | Destination in legacyforward |
|----------------|------------------------------|
| `packages/db/` | `lib/db/` (schema, migrations) |
| `packages/agents/` | `lib/agents/` (all 7 AI agents) |
| `packages/shared/` | `lib/app-types.ts` (types & constants) |

**Files to create under `app/app/`:**

| File | Source |
|------|--------|
| `app/app/page.tsx` | Landing/marketing page for the app (rebrand) |
| `app/app/login/page.tsx` | From `ca_app/apps/platform/app/login/page.tsx` |
| `app/app/dashboard/page.tsx` | From `ca_app/.../dashboard/page.tsx` |
| `app/app/onboarding/page.tsx` | From `ca_app/.../onboarding/page.tsx` |
| `app/app/caii/page.tsx` | From `ca_app/.../caii/page.tsx` |
| `app/app/roadmap/page.tsx` | From `ca_app/.../roadmap/page.tsx` |
| `app/app/coach/page.tsx` | From `ca_app/.../coach/page.tsx` |
| `app/app/book/page.tsx` | From `ca_app/.../book/page.tsx` |
| `app/app/bridge/page.tsx` | From `ca_app/.../bridge/page.tsx` |
| `app/app/wins/page.tsx` | From `ca_app/.../wins/page.tsx` |
| `app/app/pricing/page.tsx` | From `ca_app/.../pricing/page.tsx` |
| `app/api/` (9 routes) | From `ca_app/.../api/` — coach, caii, roadmap, book, bridge, wins, wins/summary, onboarding |

**Auth middleware:** Copy `ca_app/apps/platform/middleware.ts`, update protected paths from `/dashboard` → `/app/dashboard`, etc. (all `/app/...` sub-routes).

**Branding replacements in all /app files:**
- `CareerAlign` → `LegacyForward.ai`
- `careeralign.com` → `legacyforward.ai`
- `@careeralign/agents` imports → `@/lib/agents/...`
- `@careeralign/db` imports → `@/lib/db/...`
- `@careeralign/shared` imports → `@/lib/app-types`
- All internal hrefs: `/dashboard` → `/app/dashboard`, `/coach` → `/app/coach`, etc.

**App-specific Nav:** Create `app/app/layout.tsx` with the app's own sidebar/nav (distinct from the main site nav), wrapping all `/app/...` child pages.

**Environment variables to add to legacyforward:**
- `OPENAI_API_KEY`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST`

---

## Phase 6 — Search Index and Build Script

**Steps:**
1. Copy `careeralign/scripts/generate-search-index.mjs` → `legacyforward/scripts/generate-search-index.mjs`
2. Update all `sectionHrefMap` values to prefix with `/library/`:
   - `blueprints` → `/library/toolkit/blueprints/${slug}`
   - `agentic-designs` → `/library/toolkit/agentic-designs/${slug}`
   - All book sections → `/library/books/[book]/${slug}`
   - All learn sections → `/library/learn/[path]/${slug}`
   - `cheatsheets` → `/library/cheatsheets/${slug}`
3. Add framework content to search index (optional but recommended): `framework: (slug) => \`/framework/${slug}\``

---

## Phase 7 — Update Home Page

**File:** `legacyforward/app/page.tsx`

- Keep existing Hero, FrameworkFlow, problem statement sections
- Add below the fold: "What's in the Library" — 4 cards (Books, Toolkit, Learn, Cheatsheets) linking to `/library/...`
- Add app teaser section: brief description of the `/app` with CTA

---

## Phase 8 — Redirects and Sitemap

**Redirects (in `legacyforward/next.config.ts`):**
- Add internal redirect: none needed (no path conflicts since `/cheatsheet` ≠ `/library/cheatsheets`)

**Redirects (in `careeralign/next.config.ts` — to sunset that domain):**
```
/toolkit/:path* → https://legacyforward.ai/library/toolkit/:path*
/books/:path*   → https://legacyforward.ai/library/books/:path*
/learn/:path*   → https://legacyforward.ai/library/learn/:path*
/cheatsheets/:path* → https://legacyforward.ai/library/cheatsheets/:path*
/ → https://legacyforward.ai/library
```

**Redirects (in `ca_app`):**
```
/* → https://legacyforward.ai/app/:path*
```

**Sitemap:** Merge `careeralign/app/sitemap.ts` into `legacyforward/app/sitemap.ts`, update all hrefs to `legacyforward.ai/library/...` and add `/app` routes.

---

## Critical Files

| File | Role |
|------|------|
| `legacyforward/lib/content.ts` | Merge point — must serve framework, blog, AND all library content without collision |
| `legacyforward/components/Nav.tsx` | User-visible reflection of unified platform |
| `legacyforward/app/library/books/[book]/[chapter]/page.tsx` | Most structurally complex new file (consolidates 6 careeralign routes) |
| `legacyforward/app/app/layout.tsx` | App-specific layout wrapping all /app/* pages |
| `legacyforward/middleware.ts` | Auth protection for /app/* routes |
| `legacyforward/lib/agents/` | Inlined from ca_app — 7 AI agents |
| `legacyforward/lib/db/` | Inlined from ca_app — Drizzle schema |
| `legacyforward/scripts/generate-search-index.mjs` | Must emit /library/ hrefs |

---

## Risk Areas

1. **`content/` path collision** — Blog posts must move to `blog-content/` *before* careeralign content is copied to `content/`. Strict ordering required.
2. **`generateStaticParams` for consolidated routes** — `[book]/[chapter]` must enumerate all book×chapter combos. Use a `bookDefs` map; add `notFound()` guard for unknown params.
3. **Auth middleware path scope** — `middleware.ts` matcher must be updated from `/dashboard` to `/app/dashboard`, etc., or all /app routes will be unprotected.
4. **`related.ts` hrefs** — 135 hardcoded paths need bulk-replace; verify no `/toolkit/` remains after update.
5. **Agent package imports** — All `@careeralign/agents` imports must resolve to `@/lib/agents/` after inlining. TypeScript will catch misses at build time.
6. **SQLite in serverless** — `better-sqlite3` may conflict with Vercel's edge runtime. If deploying to Vercel, use `@libsql/client` (Turso) or switch to Postgres. Flag this for the user before implementing the DB layer.

---

## Verification

1. `npm run build` — prebuild generates search index, Next.js generates all static pages, zero errors
2. Confirm build output lists `/library/...` and `/app/...` routes
3. Confirm existing `/framework`, `/blog`, `/cheatsheet` routes still appear
4. Navigate `/library/books/agenticai/[first-chapter]` — BookSidebar, TOC, Prose, TextToSpeech render
5. Navigate `/library/toolkit/blueprints/ai-gateway` — RelatedPatterns links use `/library/toolkit/...`
6. Cmd+K search — results have `/library/...` hrefs
7. Navigate `/app/login` → authenticate → `/app/dashboard` loads with user data
8. Navigate `/app/coach` — send a message, AI response streams
9. Grep codebase for `careeralign.com` and `CareerAlign` — zero matches in legacyforward repo
10. `public/search-index.json` — all entries use `/library/...` hrefs
