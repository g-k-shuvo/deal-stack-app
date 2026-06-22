# Deal Command Center — Product Requirements Document (MVP)

| Field | Value |
|---|---|
| Product | DealStack / Deal Command Center (DCC) |
| Operator | Jackim Woods & Co. (single-firm, internal tool) |
| Primary user | Rich Jackim, Managing Director (solo advisor) |
| Document version | 1.1 (MVP — updated to reflect current implementation) |
| Date | 2026-06-22 |
| Status | In progress |
| Source of truth for UI | `Deal Command Center Prototype_v1.html` + `refence-html/` (marketing site) |
| Locked decisions | Internal single-firm tool · all 15 skills (9 sell-side + 6 buy-side) · Next.js (App Router) + Supabase + Anthropic · Dockerized · fully tested · public marketing site live |

---

## 1. Introduction

### 1.1 Purpose
Deal Command Center is an internal, AI-assisted deal-execution workspace for a single M&A advisory firm (Jackim Woods & Co.). It lets the advisor manage deal projects and run a library of Claude-powered "skills" that generate professional M&A work product (CIMs, valuations, teasers, LOIs, engagement letters, buyer/target research, etc.) as branded Office documents.

The product's core loop: **open a deal → run a skill against deal context → preview and refine the draft → export a branded `.docx` / `.xlsx` / `.pptx` to the document library.**

### 1.2 Background
DCC replaces a manual, multi-tool process (templates in Word, models in Excel, ad-hoc ChatGPT prompts) with a structured, context-aware system. The advisor's accumulated firm context (firm profile, advisor bio, house style, document samples) is captured once and automatically injected into every generation, so each output reads as if a junior associate at the firm produced it.

### 1.3 Definitions
| Term | Meaning |
|---|---|
| **Skill** | A configured, repeatable AI task that produces one document type (e.g. "CIM generator"). Firm-managed, not user-authored. |
| **Track** | A workflow lane: **Sell-side** (9 steps) or **Buy-side** (6 steps). |
| **Project** | A single deal/engagement with one client company. |
| **Run** | One execution of a skill against a project; produces one or more versioned outputs. |
| **Output / deliverable** | A generated document file saved to the library. |
| **Context** | The assembled inputs to a skill: firm context + project context + prior outputs + form inputs + source documents. |
| **Chaining** | A skill consuming the outputs of prior skills as context (e.g. CIM uses Valuation + Client profile). |
| **BYO key** | The firm supplies its own Anthropic API key; AI usage is billed to the firm's Anthropic account, not to DCC. |

### 1.4 Relationship to the marketing site
The marketing site (`index.html`, `features.html`, `pricing.html`, brand **"DealStack"**) has been **converted into live Next.js pages** and is now part of this repository — no longer out of scope. It lives under `src/app/(public)/` and is served at `/`, `/features`, and `/pricing`.

> **Important:** The marketing copy describes aspirational features (Due Diligence AI, Secure Data Room, Kanban pipeline, multi-tier SaaS pricing) that are **not** present in the internal Deal Command Center application. The marketing pages are public-facing and do not require authentication. The internal app (Deal Command Center) remains the primary functional scope of this PRD and is protected behind auth at `/dashboard` and sub-routes.

---

## 2. Goals & success metrics

### 2.1 Goals
1. Reduce time-to-first-draft for each M&A document from hours/days to minutes.
2. Produce outputs that meet the firm's "junior associate standard" — a draft a senior advisor reviews and sends, not raw AI text.
3. Centralize all deal context and deliverables in one workspace.
4. Keep AI cost transparent and firm-owned (BYO Anthropic key).

### 2.2 Success metrics (MVP)
| Metric | Target |
|---|---|
| Skill run → usable draft success rate | ≥ 90% of runs need only minor edits |
| Median skill run latency (generation) | ≤ 60s for narrative skills; ≤ 120s for model skills |
| Document export fidelity | 100% of exports open without repair in MS Office / Google Workspace |
| Test coverage (lines) | ≥ 80% overall; 100% on engine, renderers, security utilities |
| Critical-path E2E flows green | 100% in CI before any deploy |

---

## 3. Personas

**Rich Jackim — Managing Director (sole user, MVP).** 30+ years M&A experience, lower middle market ($1M–$25M). Not a power software user. Wants to type minimal input, get a high-quality draft, refine in plain English, download, send. Reviews every AI output with a senior eye. Owns the Anthropic account and the firm's document templates.

Future personas (out of MVP scope): junior associate / analyst seat; multi-advisor firm.

---

## 4. Scope

### 4.1 In scope (MVP)
- 8 application screens + project-selection modal (per prototype).
- All **15 skills** (Track A sell-side ×9, Track B buy-side ×6), each fully runnable end-to-end.
- Project lifecycle: create, edit, list, filter, sort, view, track progress.
- Skill execution: context assembly, context inheritance/chaining, generation (streamed preview), revision loop, versioning, save, export, mark step complete.
- Document export to **DOCX, XLSX, PPTX**.
- Document library: list, filter, sort, download, rename, delete.
- Source-document upload (client financials, tax returns) used as skill context.
- Settings: profile, firm profile, Claude API key (encrypted), AI instructions, document style examples (few-shot), defaults, notifications, storage view, security/password.
- Authentication (single user).
- Full Docker-based local dev, test, and deployment.
- Full automated test suite (unit, integration, E2E) with coverage gates.

### 4.2 Out of scope for the internal app (MVP)
- Multi-tenant SaaS, organizations, team seats, role-based access.
- In-app billing / subscription management (the prototype's **Membership** screen is informational only; billing is handled externally in GoHighLevel).
- "Sync to Claude.ai Custom Instructions" (the prototype's amber banner) — claude.ai is a separate product from the API; not built in MVP.
- How-to video production/hosting — the **How-to videos** screen renders a catalog with external GoHighLevel links (configurable); DCC does not host video.
- Marketing-only features absent from the app: Due Diligence AI / chat-with-documents, Secure Virtual Data Room UI, Kanban board, buyer-outreach automation, e-signature, real third-party buyer-matching data.

> Note: The **public marketing site** (`/`, `/features`, `/pricing`) is now in scope and live — see §1.4.

### 4.3 Deferred (post-MVP, design now / build later)
- Multi-user/firm support (data model includes a `firm_id` to allow this later without refactor).
- PPTX advanced theming.
- GoHighLevel CRM data sync.

---

## 5. Product principles
1. **The template owns the brand; the AI owns the words/numbers.** Never ask the model for raw Office XML.
2. **Structured generation.** The model returns validated JSON (via tool-use); renderers turn JSON into files. Free-text is only for the human-readable preview.
3. **Every output is a draft.** UI language and defaults assume human review before send.
4. **Defensible numbers.** Financial models compute via spreadsheet formulas in the template; the AI supplies inputs/assumptions only — it never produces final computed figures as text.
5. **Context is automatic.** The advisor types as little as possible; firm + project + prior-output context is injected without manual entry.
6. **Firm-owned AI.** All Claude calls are server-side using the firm's encrypted key; the key never reaches the browser.
7. **Everything testable.** Every functional requirement has an acceptance criterion and at least one automated test.

---

## 6. System overview & architecture

### 6.1 Route group structure (current implementation)

```
src/app/
├── layout.tsx                  ← Root layout (html/body, globals.css)
├── globals.css                 ← Shared CSS (app shell + public site tokens)
│
├── (public)/                   ← PUBLIC — no auth required
│   ├── layout.tsx              ← Wraps with <Navbar> + <Footer>
│   ├── page.tsx                ← Home page  →  GET /
│   ├── features/page.tsx       ← Features   →  GET /features
│   └── pricing/page.tsx        ← Pricing    →  GET /pricing
│
├── (auth)/                     ← Authentication screens
│   └── login/                  ← Login      →  GET /login
│
└── (protected)/                ← APP — auth-gated (middleware)
    ├── layout.tsx              ← Wraps with <Topbar> + <Sidebar> + app-shell
    ├── dashboard/page.tsx      ← Dashboard  →  GET /dashboard
    ├── projects/               ← Directory + project detail
    ├── library/                ← Document library
    ├── skills/                 ← Skill library
    ├── how-to/                 ← How-to videos
    ├── search/                 ← Global search
    └── settings/               ← Settings
```

**Public shared components:** `src/components/public/Navbar.tsx`, `src/components/public/Footer.tsx`

**App shell components:** `src/components/Topbar.tsx`, `src/components/Sidebar.tsx`

### 6.2 Full system architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│ CLIENT (browser) — Next.js App Router + React                         │
│                                                                        │
│  (public) route group: /, /features, /pricing                         │
│  No auth required. Navbar + Footer. Marketing content.                │
│                                                                        │
│  (protected) route group: /dashboard, /projects, /library, etc.       │
│  Auth-gated. App-shell (Topbar + Sidebar). Streams AI drafts.         │
└────────────────────────┬─────────────────────────────────────────────┘
                         │ HTTPS (server actions / API routes). Key never sent to client.
┌────────────────────────▼─────────────────────────────────────────────┐
│ SERVER (Next.js, Node runtime)                                         │
│  Middleware: auth gate for all routes except /login + public pages     │
│  Skill engine: context assembly + chaining + prompt build              │
│  Anthropic client: tool-use (structured) + streaming + PDF             │
│  Renderers: docx (docxtemplater) · xlsx (exceljs) · pptx              │
│  Auth, settings, encryption (key decrypt at call time)                 │
└──────────┬───────────────────────────────────────┬────────────────────┘
           │                                         │
┌──────────▼──────────┐                   ┌─────────▼───────────────┐
│ Supabase Postgres   │                   │ Supabase Storage        │
│ projects, runs,     │                   │ generated docs +        │
│ documents, settings │                   │ uploaded source files   │
│ + Auth + Vault(key) │                   │ (private buckets)       │
└─────────────────────┘                   └─────────────────────────┘
           │
      Anthropic Claude API (external; firm-billed)
```

All of the above runs in Docker (see §18).

---

## 7. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router)**, TypeScript | Full-stack; SSR + API routes/server actions |
| UI | React + CSS (port prototype styles) | Tabler Icons (self-hosted, not CDN, for offline/Docker determinism) |
| DB | **Supabase Postgres** | Migrations via Supabase CLI |
| Auth | **Supabase Auth** | Single user (email/password) |
| File storage | **Supabase Storage** (private buckets) | Generated + uploaded files |
| Secret storage | **Supabase Vault** or app-level AES-256-GCM | Encrypted Anthropic key |
| AI | **Anthropic SDK** (`@anthropic-ai/sdk`) | Default model: latest Claude (e.g. `claude-opus-4-*` for quality skills, `claude-sonnet-*` for cheaper/faster); configurable per skill |
| DOCX | **docxtemplater** (+ `pizzip`) | Template-based, branded |
| XLSX | **exceljs** | Template workbooks with formulas |
| PPTX | **pptxgenjs** | Slide generation |
| PDF ingest | Claude native PDF document blocks | No separate extraction pipeline in MVP |
| Tests | **Vitest/Jest** (unit/integration) + **Playwright** (E2E) | See §19 |
| CI | GitHub Actions (runs in Docker) | Lint, typecheck, test, coverage gate |
| Container | **Docker** + docker-compose | Dev, test, prod parity |

> Model IDs to be confirmed against the current Anthropic model list at build time; configuration must make the model per-skill overridable.

---

## 8. Information architecture

### 8.1 Public pages (no auth)
| Route | Component | Description |
|---|---|---|
| `/` | `(public)/page.tsx` | Marketing home page (DealStack brand) |
| `/features` | `(public)/features/page.tsx` | Feature overview page |
| `/pricing` | `(public)/pricing/page.tsx` | Pricing plans + comparison (interactive billing toggle) |
| `/contact` | (future) | Early access / waitlist form |

### 8.2 App screens (auth-gated)
| ID | Screen | Route | Sidebar group | Entry points |
|---|---|---|---|---|
| S1 | Dashboard | `/dashboard` | Work | default app landing; topbar logo |
| S2 | Project directory | `/projects` | Work | sidebar; topbar "New project"; dashboard "View all" |
| S3 | Project dashboard | `/projects/[id]` | (contextual) | dashboard card; directory row/Open; modal/exec back |
| S4 | Skill execution | `/projects/[id]/skills/[skillKey]` | (contextual) | project step "Run skill"; skill library "Run skill"; modal "Open skill" |
| S5 | Document library | `/library` | Work | sidebar |
| S6 | Skill library | `/skills` | Reference | sidebar |
| S7 | How-to videos | `/how-to` | Reference | sidebar |
| S8 | Settings | `/settings` | Account | sidebar; topbar avatar |
| M1 | Project-selection modal | overlay | — | buy-side skill "Run skill" |

### 8.3 Navigation graph (app)
```
/dashboard ──card / Continue──► /projects/[id] ──Run skill──► /projects/[id]/skills/[key]
   │                                  ▲   │                              │
   └─ View all ─► /projects ─ Open ───┘   └────── Next step ─────────────┘
/skills ─ sell-side Run ─────────────────────────► /projects/[id]/skills/[key]
         └ buy-side Run ─► Modal ─ Open skill ─────► /projects/[id]/skills/[key]
Topbar logo ─► /dashboard
Topbar: New project ─► /projects   ·   Avatar ─► /settings
Sidebar: Dashboard (/dashboard) · Directory (/projects) · Document library (/library)
         · Skill library (/skills) · How-to videos (/how-to) · Settings (/settings)
```

> **Route change from original PRD:** The dashboard is now at `/dashboard` (not `/`). The root `/` serves the public marketing home page. The Topbar logo link and Sidebar dashboard link have both been updated accordingly.

---

## 9. Global UI requirements (chrome)

| ID | Requirement | Acceptance criterion |
|---|---|---|
| GLB-01 | Top bar shows brand "Deal **Command** Center" (Command in gold), global search, "New project" button, user avatar. Topbar logo links to `/dashboard`. | All present on every authenticated screen; logo click navigates to `/dashboard`. |
| GLB-02 | **Global search** filters projects and documents by name (live). | Typing a query returns matching projects + documents; selecting navigates to the item. *(Prototype: non-functional → now functional.)* |
| GLB-03 | "New project" opens project creation (directory + create form/modal). | Click routes to `/projects` (project creation). |
| GLB-04 | Avatar opens Settings (Profile). | Click routes to `/settings`. |
| GLB-05 | Sidebar groups: Work (Dashboard `/dashboard`, Project directory `/projects`, Document library `/library`), Reference (Skill library `/skills`, How-to videos `/how-to`), Account (Settings `/settings`). Active item highlighted (gold left border). | Active state matches current route; contextual screens (S3/S4) highlight "Project directory". |
| GLB-06 | Color system: navy `#0D2340`, gold `#B8992C`, paper `#F7F7F5`; Tabler icon set. | Visual matches prototype tokens. |
| GLB-07 | Responsive: usable down to tablet width; sidebar collapses below a breakpoint. | No horizontal scroll/overlap at 768px. |
| GLB-08 | All async actions show loading, success, and error states. | Every mutating action has visible feedback. |
| GLB-09 | Public pages (`/`, `/features`, `/pricing`) show a separate `<Navbar>` and `<Footer>` (not the app shell). No authentication required. | Unauthenticated users can browse public pages freely. Authenticated users are not shown the app shell on public pages. |

---

## 10. Functional requirements by screen

### 10.1 S1 — Dashboard (`/dashboard`)
| ID | Requirement |
|---|---|
| DASH-01 | Header greets user by first name and summarizes pending steps ("You have N steps pending across active projects"); N computed from live data. |
| DASH-02 | KPI tiles (live): **Active projects** (with sell/buy split), **Skills run this month** (+delta vs last month), **Total outputs**, **Steps pending**. |
| DASH-03 | "Active projects" list shows up to 3 most-recently-updated active projects as cards: company, contact + title, side badge (Sell/Buy), status badge, industry, est. value/target size, progress bar + %, next step label, "Updated …" relative time, **Continue** button. |
| DASH-04 | Clicking a card or **Continue** opens that project's dashboard (S3). |
| DASH-05 | "View all N projects" link opens the directory (S2). |
| DASH-06 | "Recent activity" feed lists the latest N activity events (colored dot by type, text, relative time), newest first, derived from real events (skill completed, file uploaded, status change, step completed, NDA executed, etc.). |
| DASH-07 | KPIs and lists reflect the true current state (no hard-coded values; resolves prototype inconsistencies such as activity vs. step state). |

### 10.2 S2 — Project directory (`/projects`)
| ID | Requirement |
|---|---|
| DIR-01 | Header shows total project count and active count ("N projects · M active"), computed live. |
| DIR-02 | Status filter pills: All, Active, Prospect, On hold, Closed. Single-select within group; default All. |
| DIR-03 | Type filter pills: All types, Sell-side, Buy-side. Single-select within group; default All. |
| DIR-04 | Status and type filters combine (AND). |
| DIR-05 | Sort control: Last updated (default), Company A–Z, Date created. |
| DIR-06 | Table columns: Company (name + contact), Type, Status, Industry, Progress (bar + "X of Y" steps), Next step, Updated, action. |
| DIR-07 | Clicking a row or its **Open** button opens that project (S3). *(Prototype: only 3 rows wired → now all rows.)* |
| DIR-08 | Empty/zero-result state shown when filters match nothing. |
| DIR-09 | "New project" (here and from topbar) creates a project: required fields — company name, contact name + title, type (sell/buy), industry, status, est. value/target size; optional — website, location, deal fields. Track auto-set from type. |
| DIR-10 | Progress and "next step" are derived from the project's step completion state. |

### 10.3 S3 — Project dashboard (`/projects/[id]`)
| ID | Requirement |
|---|---|
| PRJ-01 | Back link returns to directory. |
| PRJ-02 | Header card: company name, type badge, status badge, **Edit project**; meta row (industry, location, est. value, started date); overall progress bar + "X of N steps completed". |
| PRJ-03 | **Edit project** opens an editable form of all project + deal + contact fields; saves persist. *(Prototype: non-functional → now functional.)* |
| PRJ-04 | Workflow column shows the track's ordered steps (sell-side 9 / buy-side 6) as step cards: number, name, output format, status badge (Completed / In progress / Not started), and — for completed — the linked output (file + date). |
| PRJ-05 | Each step card exposes **Run skill** (opens S4 for that skill in this project) and, when prior output exists, **View prior output** (opens/downloads it). |
| PRJ-06 | Step status transitions: Not started → In progress (on first run) → Completed (on "Mark step complete"). |
| PRJ-07 | Context panel shows live: Company (name, website, industry, location), Deal (est. value, EBITDA, multiple, structure), Contact (name, title, phone), Activity (document count, last updated, engagement start). |
| PRJ-08 | Project supports a notes/activity history (events recorded for the dashboard feed). |

### 10.4 S4 — Skill execution (`/projects/[id]/skills/[skillKey]`)
| ID | Requirement |
|---|---|
| EXEC-01 | Back link returns to the project; breadcrumb shows Directory → Project → Skill (step N). |
| EXEC-02 | Three-pane layout: **Left** = inputs, **Middle** = output/preview, **Right** = save/versions/next. |
| EXEC-03 | Left pane shows the skill title, "Step X of N · Output: FORMAT", and an **auto-context strip** listing inherited context (Company, Industry, Deal size, Prior docs) tagged "auto". |
| EXEC-04 | Left pane shows the skill's input form (fields per §12), pre-filled from project/deal context where possible; editable. |
| EXEC-05 | **Generate** runs the skill: assembles context, calls Claude (structured), streams a human-readable draft into the middle pane, then persists a new version. |
| EXEC-06 | Middle pane shows current version label, format badge, generation timestamp, and the rendered draft preview. |
| EXEC-07 | **Revision bar**: free-text instruction + Send → re-generates a new version using the prior output + instruction, without re-entering form inputs. |
| EXEC-08 | Right pane: **Save to library**, **Download FORMAT**, **Mark step complete**; "This run" version info; "Prior outputs" list (each downloadable); **Next step** button advancing to the next skill/step. |
| EXEC-09 | All versions of a run are retained and listed; any version can be viewed/downloaded. |
| EXEC-10 | "Mark step complete" sets the step to Completed, links the chosen output, updates project progress, and records an activity event. |
| EXEC-11 | "Download" produces the rendered Office file (not the markdown preview). |
| EXEC-12 | Generation/revision failures (API error, invalid key, schema validation failure, timeout) surface a clear, actionable error and do not corrupt prior versions. |

### 10.5 S5 — Document library (`/library`)
| ID | Requirement |
|---|---|
| LIB-01 | Header shows total file count across projects, computed live. |
| LIB-02 | Project filter pills (All projects + per-project) and type filter pills (All types, DOCX, XLSX, PPTX, PDF); combine (AND). |
| LIB-03 | Sort: Date added (default), File name, Project, Type. |
| LIB-04 | Files grouped into **AI deliverables** and **Client-provided documents**. |
| LIB-05 | Each row: type icon (color by format), file name, meta (project · skill or "Uploaded" · date/time), actions: **Download**, **Rename**, **Delete**. |
| LIB-06 | Download streams the stored file. Rename updates the display name. Delete removes the file (with confirm) from storage + DB. *(Prototype: non-functional → now functional.)* |
| LIB-07 | Upload entry point for client-provided documents (drag/drop or picker), associated to a project; supported types include PDF, DOCX, XLSX, PPTX, images. |
| LIB-08 | Deleting a deliverable that is linked to a completed step warns the user and unlinks it. |
| LIB-09 | Empty/zero-result state when filters match nothing. |

### 10.6 S6 — Skill library (`/skills`)
| ID | Requirement |
|---|---|
| SKL-01 | Header shows skill totals ("15 skills · 9 sell-side · 6 buy-side"). |
| SKL-02 | Filters: side pills (All, Sell-side, Buy-side) and format pills (All, DOCX, XLSX, PPTX); combine. |
| SKL-03 | Skills grouped under "Track A — Sell-side (9)" and "Track B — Buy-side (6)". |
| SKL-04 | Each skill card: step number, name (with New/Updated badge where applicable), description, format badge, meta pills (phase label, est. time), **Run skill**. |
| SKL-05 | **Sell-side** "Run skill": if a project context is unambiguous, open S4; otherwise prompt for project (consistent with buy-side modal). For MVP, sell-side "Run skill" opens the project-selection modal filtered to sell-side projects (or "create new"). |
| SKL-06 | **Buy-side** "Run skill" opens the project-selection modal (M1) filtered to buy-side projects. |
| SKL-07 | Skill catalog is firm-managed configuration (not user-editable in MVP); "New"/"Updated" badges driven by skill metadata. |

> Note: the prototype wires sell-side "Run skill" directly to execution (implicitly the current project) and buy-side to the modal. Because the skill library is not inside a project context, MVP routes **both** through project selection (SKL-05/06) for correctness.

### 10.7 S7 — How-to videos (`/how-to`)
| ID | Requirement |
|---|---|
| HOW-01 | Left category nav: Getting started, Sell-side skills, Buy-side skills, Walkthroughs, Tips & best practices; selecting a category shows its video table. |
| HOW-02 | Video tables list # / title / "what you'll learn" / link, per the prototype catalog (Getting started ×4, Sell-side ×9, Buy-side, Walkthroughs, Tips ×3). |
| HOW-03 | Links are external (GoHighLevel) and configurable; a link renders as an external link when set, else "Link pending". |
| HOW-04 | Catalog content is configuration (no video hosting in DCC). |

### 10.8 S8 — Settings (`/settings`)
See §16 for full field-level detail. Summary requirements:
| ID | Requirement |
|---|---|
| SET-01 | Left sub-nav with sections: Account (Profile, Firm profile, Claude API key, Membership), Preferences (AI instructions, Defaults, Notifications), Data (Storage, Security). Selecting shows that section. |
| SET-02 | All editable sections persist on Save and reflect saved values on reload. |
| SET-03 | Claude API key stored encrypted; never returned in plaintext to the client (masked display); "Verify"/"Re-verify" performs a live test call. |
| SET-04 | Membership section is informational only (external GHL billing); no in-app payment. |
| SET-05 | Security: change password; Danger zone: delete account/data with explicit confirmation. |

### 10.9 M1 — Project-selection modal
| ID | Requirement |
|---|---|
| MOD-01 | Modal titled "Select a project" lists eligible projects (filtered by the skill's side) with badge, name, contact, status, progress; plus "Create a new …-side project". |
| MOD-02 | One project selectable (highlighted); **Open skill** proceeds to S4 for the selected project + skill; **Cancel** or backdrop click closes. |
| MOD-03 | "Create new" routes to project creation pre-set to the correct type, then continues to the skill. |

---

## 11. Skill engine

### 11.1 Skill definition (configuration shape)
Each of the 15 skills is a versioned config object in the repo:
```ts
type Skill = {
  key: string;                 // e.g. "sell.cim"
  track: "sell" | "buy";
  step: number;                // ordinal within track
  name: string;
  description: string;
  phase: string;               // e.g. "Marketing prep"
  estMinutes: number;
  format: "docx" | "xlsx" | "pptx";
  archetype: "narrative" | "model" | "data";
  badges?: ("new" | "updated")[];
  chainsFrom: string[];        // skill keys whose outputs feed this one
  inputs: InputField[];        // form fields (with auto-fill source)
  outputSchema: JSONSchema;    // Claude must return JSON matching this (tool-use)
  template: string;            // path to the Office template
  model?: string;              // per-skill model override
};
```

### 11.2 Run lifecycle
1. **Assemble context** (server): firm context (firm profile, advisor bio, AI instructions, defaults) + project context (company, deal, contact) + chained prior outputs (`chainsFrom`) + uploaded source documents + this run's form inputs. (ENG)
2. **Build prompt**: system prompt (role, firm voice, junior-associate standard, formatting rules from AI instructions) + few-shot style example for this skill (if attached) + structured context + task instruction. (ENG)
3. **Call Claude** with **tool-use** forcing a single tool call whose schema = `outputSchema`; stream a markdown rendering of partial content to the UI for the live preview. (AI)
4. **Validate** the returned JSON against `outputSchema`; on failure, auto-retry once with a corrective message, then surface an error. (ENG/AI)
5. **Persist** a new `run` version: store the JSON + a markdown preview. (DATA)
6. **Render on demand**: when the user saves/downloads, map JSON → the skill's Office template → file in storage; record a `document`. (REN)
7. **Revision**: user instruction + prior version's JSON → Claude → new version (same validate/persist path). (AI/ENG)
8. **Complete**: "Mark step complete" links the selected output to the step and advances progress. (PRJ)

### 11.3 Context inheritance / chaining
| ID | Requirement |
|---|---|
| ENG-01 | Context assembly merges firm + project + prior-output + form-input + source-doc context deterministically; the exact assembled context is logged per run (for debugging/tests). |
| ENG-02 | A skill only chains from outputs that exist; missing prerequisites are surfaced (warning + option to run the prerequisite) but do not hard-block. |
| ENG-03 | Token budget is enforced: large source docs are sent as Claude PDF blocks; oversized text context is truncated with a visible notice. |
| ENG-04 | The auto-context strip in S4 reflects exactly what was injected. |
| ENG-05 | All model calls run server-side with the decrypted firm key; the key is never logged or returned to the client. |

### 11.4 Archetypes
| Archetype | Behavior | Renders to | Skills |
|---|---|---|---|
| **narrative** | Model returns structured sections; preview is markdown. | DOCX (template) / PPTX (slides) | most skills |
| **model** | Model returns inputs/assumptions only; spreadsheet formulas compute. | XLSX (template with formulas) | Business valuation |
| **data** | Model returns tabular rows. | XLSX (table) | Data-room checklist, Buyer research, Acquisition target research |

---

## 12. Skill catalog (all 15)

Inputs marked *(auto)* are pre-filled from project/firm context and editable. Inputs without a tag are proposed defaults to confirm with the firm. All skills inherit firm context + AI instructions automatically.

### 12.1 Track A — Sell-side (9)
| Step | Skill (key) | Format | Archetype | Chains from | Key inputs (beyond auto context) |
|---|---|---|---|---|---|
| 1 | Client profile (`sell.client_profile`) | DOCX | narrative | — | Company name *(auto)*, website *(auto)*, industry *(auto)*, location *(auto)*, research focus notes |
| 2 | Business valuation (`sell.valuation`) | XLSX | model | client_profile | Revenue (TTM), EBITDA, owner add-backs, industry multiple range, comparable transactions notes, SBA test toggle |
| 3 | Market assessment (`sell.market_assessment`) | PPTX | narrative | valuation | Valuation range *(auto from valuation)*, target audience, key talking points |
| 4 | Engagement agreement (`sell.engagement`) | DOCX | narrative | client_profile | Success fee % *(auto default 5%)*, retainer *(auto $5,000)*, exclusivity *(auto 12 mo)*, term, scope notes |
| 5 | Data room checklist (`sell.data_room_checklist`) | XLSX | data | client_profile | Business type *(auto)*, deal stage, special categories |
| 6 | CIM generator (`sell.cim`) | DOCX | narrative | valuation, client_profile | Year founded, employees, revenue (TTM), key value drivers, reason for sale |
| 7 | Teaser generator (`sell.teaser`) | DOCX | narrative | cim | Anonymization level, highlight bullets *(auto from CIM)* |
| 8 | Buyer research (`sell.buyer_research`) | XLSX | data | client_profile, valuation | Buyer types (strategic/financial), geography, count target, criteria |
| 9 | LOI generator (`sell.loi`) | DOCX | narrative | valuation | Purchase price, structure (asset/stock), key terms, contingencies |

### 12.2 Track B — Buy-side (6)
| Step | Skill (key) | Format | Archetype | Chains from | Key inputs |
|---|---|---|---|---|---|
| 1 | Client profile (`buy.client_profile`) | DOCX | narrative | — | Buyer company *(auto)*, mandate notes |
| 2 | Buy-side proposal (`buy.proposal`) *(New)* | DOCX | narrative | client_profile | Process overview, fee structure, timeline |
| 3 | Buy-side engagement agreement (`buy.engagement`) *(New)* | DOCX | narrative | proposal | Search criteria, retainer terms, success fee |
| 4 | Acquisition target research (`buy.target_research`) | XLSX | data | client_profile | Acquisition criteria (industry, size, geo), count target |
| 5 | Target profile (`buy.target_profile`) | DOCX | narrative | target_research | Selected target, screening focus |
| 6 | LOI generator (`buy.loi`) | DOCX | narrative | target_profile | Offer price, structure, terms (buyer perspective) |

> Each skill's full prompt, `outputSchema`, and template are produced during build (Phase per §21) and validated by golden tests (§19). Exact input lists beyond the prototype-confirmed CIM fields are to be reviewed with the firm.

---

## 13. Document rendering requirements

| ID | Requirement |
|---|---|
| REN-01 | DOCX rendering uses `docxtemplater` against firm-supplied `.docx` templates with named placeholders and section loops; output carries firm letterhead/branding. |
| REN-02 | XLSX rendering uses `exceljs`; for the valuation skill the template contains pre-built formulas (EBITDA multiples, DCF, SBA financeability) and the renderer writes only input cells. |
| REN-03 | PPTX rendering uses `pptxgenjs` (or template-based) to produce the market-assessment deck (default 7 slides) with firm theme. |
| REN-04 | All generated files open without repair prompts in Microsoft Office and Google Workspace. |
| REN-05 | Rendering is deterministic given the same JSON + template (snapshot-testable). |
| REN-06 | Renderers validate that all required template placeholders are satisfied; missing data fails the render with a clear error rather than producing a broken file. |
| REN-07 | Filenames follow a convention: `{Skill}_{vN}_{Company}.{ext}` (e.g. `CIM_v2_Midwest_HVAC.docx`). |
| REN-08 | Templates are versioned in the repo under `/templates`; changing a template is a reviewable change covered by tests. |

---

## 14. AI / Claude integration requirements

| ID | Requirement |
|---|---|
| AI-01 | All requests use the firm's Anthropic key, decrypted server-side per call; usage is billed to the firm's Anthropic account. |
| AI-02 | Structured outputs enforced via tool-use; the model must return JSON conforming to the skill's `outputSchema`. |
| AI-03 | Streaming: partial content streams to the S4 preview during generation. |
| AI-04 | Source documents (PDF) are sent as native document content blocks; XLSX/CSV inputs are parsed to text and included. |
| AI-05 | System prompt encodes firm voice, AI instructions, formatting rules, and the "junior associate standard". |
| AI-06 | Few-shot: if a document style example is attached for the skill, include it to match structure/tone. |
| AI-07 | Per-skill model selection is configurable; a default model is set centrally and overridable. |
| AI-08 | Robust handling for: invalid/expired key, rate limit, timeout, overloaded, schema-validation failure (one auto-retry), and content refusal — each with a specific user-facing message. |
| AI-09 | Key verification endpoint performs a minimal live call and reports verified/failed. |
| AI-10 | No deal data is sent anywhere except Anthropic; no third-party analytics receive document content. |

---

## 15. Data model

Entities (all rows carry `firm_id` to enable future multi-firm without refactor; MVP has one firm):

| Entity | Key fields |
|---|---|
| **firm** | id, name, website, address, market_focus, industry_specializations, total_transactions, geography, description, advisor_bio, ai_instructions (≤2000 chars), defaults (success_fee, retainer, exclusivity, deal_size_range, default_type, default_status), api_key_encrypted, storage_limit_bytes |
| **user** | id, firm_id, first_name, last_name, email, phone, title, years_experience, auth_id |
| **project** | id, firm_id, company_name, website, industry, location, type (sell/buy), track, status (prospect/active/onhold/closed), est_value/target_size, ebitda, multiple, structure, contact_name, contact_title, contact_phone, engagement_start, created_at, updated_at |
| **project_step** | id, project_id, skill_key, ordinal, status (notstarted/inprogress/completed), linked_document_id, completed_at |
| **run** | id, project_id, skill_key, inputs (jsonb), status, created_at |
| **run_version** | id, run_id, version_no, content_json (jsonb), preview_md, model_used, tokens, created_at |
| **document** | id, firm_id, project_id, run_version_id (nullable for uploads), source (ai/uploaded), skill_key (nullable), filename, format, storage_path, size_bytes, created_at |
| **activity_event** | id, firm_id, project_id, type, text, created_at |
| **style_example** | id, firm_id, skill_key, document_id, created_at |
| **notification_pref** | id, firm_id, key, enabled |

| ID | Requirement |
|---|---|
| DATA-01 | Referential integrity: deleting a project cascades to its steps, runs, versions, documents, events (with confirm). |
| DATA-02 | `project.status`, `type`, step `status` use constrained enums. |
| DATA-03 | Storage usage is computed from `document.size_bytes` and compared to `firm.storage_limit_bytes` (default 10 GB) for the Storage view and warnings. |
| DATA-04 | Row-Level Security restricts all data to the authenticated firm/user. |
| DATA-05 | Migrations are versioned and reproducible; seed data (Appendix A) loads via a seed script. |

---

## 16. Settings — detailed requirements

| ID | Section | Requirement |
|---|---|---|
| SET-10 | **Profile** | Edit first/last name, email, phone, title, years of experience; Save persists. |
| SET-11 | **Firm profile** | Edit firm name, website, address, market focus, industry specializations, total transactions, geography, firm description (third person), advisor bio (third person); used as AI context; Save persists. |
| SET-12 | **Claude API key** | Display masked key + verified state; Update key (re-encrypt + re-verify); Re-verify (live test). Plaintext key never sent to client. Help text states usage bills to the firm's Anthropic account. |
| SET-13 | **Membership** | Informational card: plan name, price, inclusions, renewal date, storage used bar; "Manage billing in GHL" external link. No in-app payment. |
| SET-14 | **AI instructions** | Edit written instructions (≤2000 chars, counter shown); used in every prompt. "Sync to Claude.ai" banner is **not** implemented in MVP (hidden or shown disabled with tooltip). |
| SET-15 | **AI instructions → style examples** | Per-skill accordion; upload one redacted sample document per skill; stored as `style_example` and used for few-shot. Shows "N example attached" / "No example yet". |
| SET-16 | **Defaults** | Edit default engagement type, default status, success fee %, retainer, exclusivity period, deal size range; applied when creating projects / generating engagement docs. |
| SET-17 | **Notifications** | Toggles: skill run completion, new/updated skills, storage warnings, API key issues; persisted. (Delivery mechanism = in-app for MVP; email optional/deferred.) |
| SET-18 | **Storage** | Show total used / limit with breakdown (AI deliverables, client-provided, other); values computed live. |
| SET-19 | **Security** | Change password (current + new + confirm, validated). Danger zone: delete account/data with typed confirmation; states GHL subscription cancelled separately. |

---

## 17. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Security | Anthropic key encrypted at rest (Vault or AES-256-GCM); decrypted only server-side at call time; never logged/returned. |
| NFR-02 | Security | All Claude and storage access server-side; signed, short-lived URLs for downloads. |
| NFR-03 | Security | Auth required for every route/API; RLS enforced at DB. |
| NFR-04 | Security | Input validation on all mutations; file-type/size validation on uploads; CSRF protection on mutations. |
| NFR-05 | Privacy | Deal data sent only to Anthropic; no document content to analytics/third parties. |
| NFR-06 | Performance | Narrative generation streams first tokens ≤ 5s; median full generation ≤ 60s; model skills ≤ 120s. |
| NFR-07 | Performance | Screen navigation ≤ 200ms after data load; lists paginate beyond 100 rows. |
| NFR-08 | Reliability | A failed/partial generation never overwrites a prior good version. |
| NFR-09 | Accessibility | WCAG 2.1 AA: keyboard navigation, focus states, labels, color contrast on navy/gold. |
| NFR-10 | Browser support | Latest Chrome, Edge, Safari, Firefox. |
| NFR-11 | Observability | Structured server logs for runs (no secrets/no document bodies), error tracking, basic request metrics. |
| NFR-12 | Data retention | Deletes are hard-deletes after confirm; export of a project's documents available before delete. |
| NFR-13 | Internationalization | US English, USD; currency/number formatting centralized. |

---

## 18. Docker, environments & DevOps

> Docker is a hard requirement: identical containers for local dev, CI tests, and production.

| ID | Requirement |
|---|---|
| DOCKER-01 | **Multi-stage `Dockerfile`** for the Next.js app: `deps` → `build` → `runner` (minimal, non-root, production node image). Produces a single runnable image. |
| DOCKER-02 | **`docker-compose.yml` (dev)** orchestrates: `app` (Next.js, hot reload), the **Supabase local stack** (Postgres, Auth/GoTrue, Storage, Studio) via Supabase CLI or compose, and any mail stub. One command (`docker compose up`) yields a working environment. |
| DOCKER-03 | **`docker-compose.test.yml`** (or a compose profile) brings up app + DB, runs migrations + seed, then runs the full test suite headless; exits non-zero on any failure. |
| DOCKER-04 | All configuration via environment variables (`.env`); a committed `.env.example` documents every variable (Supabase URL/keys, app secret for key encryption, default model, etc.). No secrets committed. |
| DOCKER-05 | Anthropic key is **not** an environment variable; it is the firm's runtime-stored encrypted secret. The app **encryption key** is an env var/secret. |
| DOCKER-06 | Images are reproducible (pinned base image digests, lockfile-based installs); build is deterministic. |
| DOCKER-07 | Healthcheck endpoint (`/api/health`) used by compose/orchestrator; container reports ready only when DB reachable. |
| DOCKER-08 | Production deployment runs the same image (e.g. Vercel for Next.js + managed Supabase, or a container host); migrations run as a release step. |
| DOCKER-09 | CI uses the Docker images/compose so local and CI behavior match. |
| DOCKER-10 | Tabler Icons and fonts are vendored into the image (no external CDN at runtime) for offline/deterministic builds. |

---

## 19. Testing strategy & quality gates

> Requirement from stakeholder: **everything properly tested.** Every FR maps to ≥1 automated test. Tests run in Docker (§18) and gate CI.

### 19.1 Test levels
| Level | Tooling | Covers |
|---|---|---|
| **Unit** | Vitest/Jest | Skill config validation; context assembly + chaining; prompt builder; output-schema validation; encryption/decryption util; currency/format utils; renderers (DOCX/XLSX/PPTX) produce valid, schema-correct files (parse the output back and assert structure); storage-usage math; filename convention. |
| **Integration** | Vitest/Jest + test DB (Dockerized Supabase) | API routes / server actions: project CRUD, run generate/revise (Claude **mocked**), document upload/download/rename/delete, settings save, key verify (mocked), RLS enforcement, cascade deletes, activity events, KPI/derived computations. |
| **Contract / golden** | Vitest + fixtures | For each of the 15 skills: a recorded Claude JSON response → schema validates → renders → parsed output asserts required sections/cells/slides. Golden files detect unintended drift. |
| **E2E** | Playwright (headless, in Docker) | Full user journeys across real screens with Claude mocked at the network boundary. |
| **Smoke (live, gated)** | Playwright/Vitest | A tiny set of real Anthropic calls behind `RUN_LIVE_AI=1`, excluded from default CI, to sanity-check the live integration. |

### 19.2 E2E critical-path scenarios (must pass)
1. Sign in → land on Dashboard with seeded KPIs.
2. Create a new sell-side project → appears in directory and dashboard.
3. Open project → run **CIM** skill → see streamed draft → revise once → Save to library → Download DOCX → Mark step complete → progress advances.
4. Directory filters (status × type) and sort produce correct sets.
5. Document library: filter by project + type, rename, delete (with confirm), upload a client PDF.
6. Skill library: run a **buy-side** skill → project-selection modal → Open skill → execution screen.
7. Settings: edit firm profile (persists); add/Update Claude key → Verify (mocked) shows verified; attach a style example.
8. Run a skill whose prerequisite is missing → prerequisite warning path.
9. Generation error (mocked API failure) → error surfaced, no version corruption.
10. Global search finds a project and a document.

### 19.3 Quality gates (CI must enforce)
| Gate | Threshold |
|---|---|
| Lint (ESLint) + format (Prettier) | zero errors |
| Type check (`tsc --noEmit`) | zero errors |
| Unit + integration + contract | all pass |
| E2E (Playwright) | all critical-path scenarios pass |
| Coverage (lines) | ≥ 80% overall; **100%** on `lib/engine`, `lib/render`, encryption/security utils |
| Build | production Docker image builds |
| Migrations | apply cleanly on a fresh DB + seed loads |

### 19.4 Test data & mocking
- Seed fixtures = Appendix A (the prototype's firm, projects, documents, activity).
- Claude mocked via a network-level interception layer returning per-skill fixture JSON; deterministic.
- Each test runs against an isolated, migrated, seeded Dockerized DB; no shared mutable state.

---

## 20. Acceptance criteria / Definition of Done

A feature is **Done** when:
1. It satisfies its FR(s) and matches the prototype's intent (where the prototype was static, the functional behavior in this PRD governs).
2. It has passing unit/integration/contract tests and, if user-facing, an E2E scenario.
3. Coverage gates (§19.3) hold.
4. It runs identically via `docker compose up` and in CI.
5. No secrets are exposed client-side or in logs.
6. Generated documents open without repair in Office + Google Workspace.
7. Accessibility checks (keyboard + contrast) pass for the screen.

The **MVP is shippable** when: all 8 screens + modal are functional; all 15 skills run end-to-end producing valid exports; all §19.2 E2E scenarios pass; all quality gates green.

---

## 21. Milestones / phases

| Phase | Deliverable | Exit criterion |
|---|---|---|
| 0 — Scaffold | Dockerized Next.js + Supabase; auth (single user); schema + migrations + seed; Settings → encrypted key + verify; `/api/health`; CI skeleton | `docker compose up` works; CI green on empty suite |
| 1 — Walking skeleton | **CIM** end-to-end: engine + Claude (tool-use, streamed) + DOCX render + revision + save + download + library entry; full test coverage for this path | §19.2 scenario 3 passes for CIM |
| 2 — Workspace | Dashboard, Directory (CRUD/filter/sort), Project dashboard (steps, context, edit), activity events, chaining | §19.2 scenarios 1,2,4 pass |
| 3 — Sell-side DOCX | client profile, engagement, teaser, LOI skills | each runs + golden tests pass |
| 4 — XLSX | exceljs renderer; valuation (model w/ formulas), data-room checklist, buyer research | model + data golden tests pass |
| 5 — Buy-side track | 6 buy-side skills + project-selection modal | §19.2 scenario 6 passes |
| 6 — Settings depth + library | AI instructions, style examples (few-shot), defaults, notifications, storage, security; library rename/delete/upload | §19.2 scenarios 5,7 pass |
| 7 — PPTX | pptxgenjs renderer; market assessment | deck golden test passes |
| 8 — Harden | errors/empty states, a11y, perf, source-doc upload, observability | all gates green; MVP shippable |

---

## 22. Risks & mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Output doesn't look advisor-made | High | Template-based render from firm's real redacted samples; few-shot style examples |
| M&A content quality/consistency | High | Structured prompts + firm context + "draft for review" framing; golden tests on structure |
| Valuation numbers indefensible | High | Formulas in XLSX template; AI supplies inputs only |
| API key leakage | High | Encrypt at rest; server-only decrypt; never log/return |
| Claude API variability (latency, schema drift) | Med | Tool-use enforcement + one auto-retry; streaming UX; timeouts; mocked tests + gated live smoke |
| Scope (15 skills) overrun | Med | Build engine once (2 archetypes); CIM-first skeleton; batch remaining skills |
| Office compatibility issues | Med | REN-04/05 tests open/parse outputs; test in Office + Google |
| Source-doc size / token limits | Med | Claude PDF blocks; truncation with notice (ENG-03) |

---

## 23. Assumptions & open questions

**Assumptions**
- Single user/firm for MVP; data model is multi-firm-ready but multi-tenancy is not built.
- Firm provides real, redacted document templates and at least one style example per high-value skill (CIM, valuation, engagement).
- GoHighLevel handles billing and video hosting externally; DCC only links out.
- Anthropic account + key supplied by the firm.

**Open questions (to confirm with the firm)**
1. Exact input fields per skill beyond CIM (proposed in §12 — confirm).
2. Valuation methodology specifics (multiple ranges, DCF assumptions, SBA test rules) for the template formulas.
3. Which model tier per skill (quality vs. cost).
4. Notification delivery for MVP — in-app only, or email too?
5. Production host (Vercel + managed Supabase vs. self-hosted containers).
6. Retention/export policy specifics on account deletion.

---

## 24. Appendix A — Seed / demo data (from prototype)

**Firm:** Jackim Woods & Co. — Chicago, IL; jackim.com; lower middle market $1M–$25M; specializations Manufacturing, Healthcare, Business Services, Distribution; 70+ transactions; Midwest/National. Defaults: success fee 5%, retainer $5,000/mo, exclusivity 12 months, deal size $1M–$25M. Membership (informational): "Solo Advisor" $297/mo, 10 GB, renews 2026-07-09. Storage used 3.2 GB.

**User:** Rich Jackim — Managing Director; rich@jackim.com; 847-555-0141; 30+ years.

**Projects (7):**
| Company | Contact | Type | Status | Industry | Progress | Next step | Value |
|---|---|---|---|---|---|---|---|
| Midwest HVAC Services | Tom Kowalski (Owner) | Sell | Active | Manufacturing/HVAC | 5/9 (56%) | CIM Generator (Step 6) | $4.2M (EBITDA $840K, 5.0x, asset sale); Dayton OH; started 2026-05-12 |
| Apex Distribution Partners | Sandra Cho (CFO) | Buy | Active | Distribution/Logistics | 2/6 (33%) | Acquisition target research (Step 4) | $8–15M target |
| Lakeview Dental Group | Dr. Karen Wu (Owner) | Sell | Prospect | Healthcare | 2/9 (22%) | Business valuation (Step 2) | $2.8M |
| Summit Tech Solutions | Brian Foster | Sell | Active | Technology | 7/9 (78%) | LOI Generator | — |
| Prairie Winds Energy | Diane Reyes | Sell | On hold | Energy | 4/9 (44%) | Buyer research | — |
| Greenfield Landscaping | Mark Ellis | Sell | Prospect | Services | 1/9 (11%) | Client profile | — |
| NovaCare Home Health | Lisa Tran | Buy | Active | Healthcare | 3/6 (50%) | Target profile | — |

**Midwest HVAC completed steps:** 1 Client profile (DOCX, 5/13), 2 Business valuation (XLSX, 5/15), 3 Market assessment (PPTX, 5/17), 4 Engagement agreement (DOCX, 5/18), 5 Data room checklist (XLSX, 5/20); 6 CIM in progress.

**Documents (sample):** AI — `CIM_v2_Midwest_HVAC.docx`, `Buyer_Research_HVAC_v1.xlsx`, `Market_Assessment_HVAC.pptx`, `Engagement_Agreement_HVAC.docx`, `Engagement_Agreement_Apex.docx`. Client-provided — `HVAC_Financials_3yr.xlsx`, `Tax_Returns_2023_2024.pdf`, `Lakeview_Dental_Financials.pdf`.

**Activity (sample, newest first):** Teaser generator completed (Midwest, 2h); 3 files uploaded to Apex data room (5h); Lakeview moved to Prospect (yesterday); Buyer research completed (Midwest, 2d); Market assessment completed (Lakeview, 3d); NDA executed (Apex buyer #3, 4d); Midwest → Active (1w).

> Note: prototype seed data has minor internal inconsistencies (e.g. activity says Teaser/Buyer research "completed" for Midwest while those steps show "not started"; directory "5 active" vs. 4 active rows). Seed data for DCC must be made internally consistent; derived values (KPIs, progress, "next step") are computed, never stored literally.

**Skill catalog:** 15 skills exactly as §12 (Track A ×9, Track B ×6), with badges: CIM "Updated"; Buy-side proposal and Buy-side engagement "New".

**How-to catalog:** Getting started (Platform overview, API key setup, Your first project, Document library); Sell-side tutorials ×9 (CIM → "Open in GHL", rest "Link pending"); Tips (Better inputs, The revision loop, Junior associate standard). Hosted in GoHighLevel.

---

## 25. Appendix B — Glossary
CIM (Confidential Information Memorandum), LOI (Letter of Intent), NDA (Non-Disclosure Agreement), EBITDA, DCF (Discounted Cash Flow), SBA (Small Business Administration financing), Teaser/Blind profile, Data room, Buy-side/Sell-side, TTM (Trailing Twelve Months), GHL (GoHighLevel), BYO key (Bring-Your-Own Anthropic API key).
```
