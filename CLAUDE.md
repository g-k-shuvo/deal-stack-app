# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Greenfield. The repo currently contains **only `PRD.md`** — no code is scaffolded yet, and this is not yet a git repository. `PRD.md` is the authoritative specification for everything below; read it before implementing. Build work starts at **Phase 0** in PRD §21.

**`PRD.md` is the source of truth.** When a question isn't answered here, find it there. Useful section map:

- §6–7 architecture & stack · §8 screens/routes · §10 per-screen functional requirements (FR IDs)
- §11 skill engine · §12 the 15-skill catalog · §13 rendering · §14 Claude integration · §15 data model
- §18 Docker · §19 testing & quality gates · §21 build phases · §23 open questions · Appendix A seed data

UI source of truth is the prototype `Deal Command Center Prototype_v1.html` (in `C:\Users\KIBRIA\Downloads`). Port it; don't redesign. Three marketing-site HTMLs in that folder (`index/features/pricing`, brand "DealStack") are **out of scope** — they describe features absent from the app.

## What this product is

Deal Command Center (DCC): an **internal, single-firm** AI workspace for one M&A advisory firm (Jackim Woods & Co.). Core loop: open a deal → run a Claude-powered "skill" against deal context → preview/refine the draft → export a branded Office doc (`.docx`/`.xlsx`/`.pptx`) to the library.

## Locked decisions (do not re-litigate)

- **Single-firm internal tool** — no multi-tenancy, no signup, no in-app billing. Data model still carries `firm_id` so multi-firm is possible later without refactor.
- **All 15 skills** — Track A sell-side ×9, Track B buy-side ×6 (PRD §12).
- **Stack:** Next.js (App Router, TS) + Supabase (Postgres/Auth/Storage/Vault) + Anthropic SDK. Renderers: `docxtemplater` (DOCX), `exceljs` (XLSX), `pptxgenjs` (PPTX).
- **Dockerized** dev/test/prod parity, and **everything tested** with coverage gates — both are hard requirements, not optional.
- Membership/billing → informational only (external GoHighLevel). How-to videos → external GHL links, not hosted. "Sync to Claude.ai" → cut from MVP.

## Architecture big picture

The two hard, valuable parts are the **skill engine** and **document rendering**; everything else is CRUD around them.

- **Skill engine (`lib/engine` planned).** Per run: assemble context (firm profile + advisor bio + AI instructions + project/deal context + chained prior outputs + form inputs + uploaded source docs) → build prompt → call Claude → validate → persist a versioned result. Skills are **firm-managed config in the repo** (one object per skill: key, track, step, format, archetype, `chainsFrom`, inputs, `outputSchema`, template), **not** user-authored DB rows.
- **Two archetypes carry all 15 skills** — don't special-case each:
  - `narrative` → model returns structured sections → DOCX/PPTX template.
  - `model` / `data` → model returns inputs or rows → XLSX template.
- **Generation contract:** Claude returns **JSON via tool-use** matching the skill's `outputSchema`. The streamed markdown is only the human preview; the **Office file is rendered from the validated JSON on save/download** (not from the preview text).
- **Chaining:** later skills consume earlier outputs as context (e.g. `sell.cim` chains from `sell.valuation` + `sell.client_profile`). The S4 "auto-context strip" must reflect exactly what was injected.
- **Routing:** real deep-linkable routes (`/`, `/projects`, `/projects/[id]`, `/runs/[id]`, `/library`, `/skills`, `/how-to`, `/settings`) — the prototype's single-page `navigate()` is replaced. Where the prototype was static/dead (search, filters, CRUD, downloads), the PRD's functional behavior governs.

## Invariants (violating these breaks the product)

- **Anthropic key never reaches the browser.** All Claude/storage calls are server-side; the firm's key is stored encrypted (Supabase Vault or AES-256-GCM) and decrypted only at call time; never logged or returned. The app _encryption_ key is an env var; the _Anthropic_ key is a runtime-stored secret, not an env var.
- **The template owns the brand; the AI owns words/numbers.** Never ask the model for raw Office XML.
- **Valuation numbers are computed by spreadsheet formulas in the XLSX template** — the AI supplies inputs/assumptions only, never final computed figures as text.
- **Every output is a draft for human review** ("junior associate standard") — reflect this in UX/wording.
- **Derived values are computed, never stored** (KPIs, progress, "next step", storage usage). The prototype's seed data has deliberate inconsistencies; do not copy them literally.
- **Build CIM-first** (Phase 1 walking skeleton proves the full vertical) before fanning out to the other 14 skills.

## Commands

Package manager is **pnpm**. Node ≥ 22.

- Install: `pnpm install`
- Dev server: `pnpm dev` (http://localhost:3000)
- Build: `pnpm build` · Start: `pnpm start`
- Typecheck: `pnpm typecheck` · Lint: `pnpm lint` · Format: `pnpm format`
- Tests: `pnpm test` (run once) · `pnpm test:watch` · `pnpm test:coverage`
  - Single file: `pnpm test src/lib/crypto.test.ts`
  - Single test by name: `pnpm test -t "round-trips a secret"`
- E2E (Playwright): `pnpm exec playwright install chromium` once, then `pnpm e2e`
- Docker dev: `docker compose up` · Dockerized test suite: `docker compose -f docker-compose.test.yml up --build --abort-on-container-exit`
- Supabase local stack (CLI not yet vendored): `npx supabase start`, then apply `supabase/migrations/*` and `supabase/seed.sql`

### Platform gotchas (already handled — don't undo)

- **pnpm pre-script check**: `.npmrc` sets `verify-deps-before-run=false`. Without it, `pnpm <script>` aborts with `ERR_PNPM_IGNORED_BUILDS` / `runDepsStatusCheck` because native build scripts (esbuild/sharp/unrs-resolver) are not approved. If scripts ever fail that way, restore that `.npmrc` line, or run the binary directly: `./node_modules/.bin/vitest run`, `./node_modules/.bin/tsc --noEmit`.
- **Next `standalone` output is env-gated**: `next.config.mjs` only enables it when `NEXT_OUTPUT=standalone` (the Dockerfile sets it). On Windows local builds, leave it unset — standalone file-tracing uses symlinks that Windows blocks (EPERM). So local `pnpm build` works; the Docker/Linux build produces the standalone server.
- **Build env**: `pnpm build` reads `APP_ENCRYPTION_KEY` (any base64 string works for build/CI; CI passes a dummy).

### Quality gates (CI: `.github/workflows/ci.yml`)

Lint + `tsc --noEmit` clean · all tests pass · coverage ≥80% overall and **100% lines on `src/lib/engine`, `src/lib/render`, `src/lib/crypto.ts`** (branch gate 85 there — ajv/SDK type-guard fallbacks are unreachable) · production build · E2E (separate job). Live AI smoke tests are gated behind `RUN_LIVE_AI=1` and excluded from default CI.

### Current status

All 8 PRD phases are implemented and green: **typecheck 0 · 72 unit/integration/contract tests · 7 Playwright E2E · production build (12 routes + middleware) · docker compose configs valid · coverage 97% overall, 100% lines on engine/render/crypto.**

The app runs **end-to-end**: every screen + project-picker + new-project + project-edit; all 15 skills run via the skill-execution screen (generate → revise (versions) → save → download → mark complete); DOCX/XLSX/PPTX export all real; document library (upload/rename/delete/download); full settings (firm/profile/defaults/AI instructions/style-examples/notifications/API-key set+verify/danger-zone reset); global search (projects + documents); error/not-found/loading boundaries.

Architecture notes for contributors:

- **Data** is behind the **async** `Repo` interface (`getRepo()`, `src/lib/data`). Default = seeded **in-memory** adapter (deterministic; dev/test/E2E). Set `USE_SUPABASE=1` to use `SupabaseRepo` (`supabase-repo.ts`, maps the SQL schema; needs the migration+seed applied + the `dcc-blobs` storage bucket). **The Supabase adapter + auth are typechecked but not runtime-verified here** (need a live Supabase).
- **Auth** (`middleware.ts` + `src/app/login`, `src/lib/auth`) is gated by `USE_SUPABASE_AUTH=1`; default off so dev/E2E stay open.
- **AI** via `generateForSkill()` (`src/lib/ai/provider.ts`): firm's encrypted key when set, else a deterministic schema-valid **mock** (`src/lib/ai/mock.ts`). Force mock with `DCC_AI_MODE=mock`. `verifyFirmKey()` does a real minimal call in live mode.
- **Renderers** (`src/lib/render`) selected by `rendererFor(skill)`; downloads re-render stored run-version JSON via `/api/download/...`.
- **Server actions** in `src/app/actions.ts`; structured logging via `src/lib/log.ts`.

### E2E

`pnpm exec playwright install chromium` once, then `DCC_AI_MODE=mock pnpm e2e` (specs in `e2e/`, run serially — shared in-memory server).

**Documented follow-ups (need external assets/services, not code gaps):** firm-supplied **branded docxtemplater templates** (programmatic renderer works now); **true token streaming** of live generation (structured tool-use currently returns the whole result); **runtime verification** of the Supabase adapter + `docker compose up` against live services.

## Open questions to confirm with the firm before locking related code

Per-skill input fields beyond CIM; valuation methodology for the formulas; model tier per skill; notification delivery; production host; deletion/retention policy (PRD §23).
