# Build Log

Reverse-chronological. One section per completed layer.

## 2026-10-03 — Layer 6: polish, metadata, README

- Verified scaffolding: root + admin error boundaries (dev-only logging,
  digest surfaced, dark zinc), four loading skeletons shaped like their
  content (landing, overview, table, detail), dark 404 with disclaimer.
  Added what was missing: `app/admin/error.tsx`, all three admin
  `loading.tsx` files, dark restyles of root error/loading/404.
- Metadata: root title template + OG + Twitter, landing title override,
  case-study title + description, `noindex` on `/admin/login` via its own
  layout (client pages can't export metadata). robots allows / and
  disallows /admin + /api; sitemap lists / and /case-study.
- Mobile (inspection only, no device lab): no fixed widths anywhere;
  grids collapse to single column below sm/lg; tables scroll inside
  `overflow-x-auto`; fixed grid tracks total ~260px < 375px. Nothing found
  that forces horizontal scroll.
- README rewritten from scratch (98 lines): decision, stack, setup, env
  table, schema pointer, Vercel notes with the `https://` APP_URL rule,
  deliberate scope cuts, MIT.

## 2026-10-03 — Layer 5: case study

- `app/(marketing)/case-study/page.tsx`: engineering write-up for
  recruiters — problem, pipeline diagram, six technical decisions
  distilled from this log, honest limitations, facts grid.
- Screenshots in `public/case-study/` (overview 813×262, leads
  1654×1072, detail 1215×911, breakdown 1654×1381 — dims read from PNG
  headers) rendered with `next/image` + real width/height.
- Deliberate content call: receipt copy stays fixed-template, AI output
  stays internal — noted in the decisions, not just the code.

## 2026-10-03 — Layer 4: admin dashboard

- Password-gate auth (`leadflow_admin` HMAC cookie, timing-safe verify,
  500ms failure delay, no attempt logging) copied from SupportAI's shape;
  `lib/admin-auth.ts` + `middleware.ts` verified drift-free.
- Overview: 4 stat cards (total / qualified incl. contacted+replied /
  queued / archived), CSS-only 5-bucket score bars, last-8 table.
- Leads table: server-side status tabs, allowlisted sort (score /
  created_at), 50/page offset pagination with preserved query strings.
- Detail is the hero: DB-read sub-scores in `ScoreBreakdown` bars
  (`grid-cols-[120px_1fr_80px]`, never recomputed), routing + actions
  (PATCH, `reviewed_at` on contacted/replied/qualified) + timeline.
- Smoke-verified live (10 checks): unauth 307→login, 401 on wrong pw,
  dashboard stats/distribution/recent render, breakdown bars match DB
  sub-scores exactly, PATCH sets contacted + reviewed_at, filters and
  both sort directions verified row-order-correct, API 404 on bad id.
- Known quirk: detail page `notFound()` renders the 404 UI but returns
  HTTP 200 (reproduced 3× with verified auth, incl. `next start` prod
  build; unmatched routes correctly return 404). Code is correct
  (`if (error || !data) notFound()`); code review concurs this is
  framework-level, not an app bug. Admin-only surface, no impact.

## 2026-10-03 — Layer 3: public form, POST /api/leads, receipt email

- Capture flow: form → POST → `status='new'`/`ai_status='pending'` row,
  `{ok, reference_code}` returns immediately, enrichment runs via
  `void runEnrichment(id).catch()` (extract → score → route → emails).
- Deliberate design decision: the AI's output is internal. The lead sees a
  fixed-template receipt — no AI-generated text, no mention of analysis.
- Routing: ≥70 auto_reply/qualified, 30–69 human_review/queued,
  <30 archive/archived. Receipt only for auto_reply + human_review;
  sales notified for the same two. Failures → ai_status='failed',
  status stays 'new'. Emails never flip ai_status.
- Accepted limitations: in-memory IP rate limit (5/10min, resets on cold
  start); daily-counter ref codes can collide under concurrency (unique
  constraint turns it into a 500, not silent dupes); Vercel may kill the
  background task (~10s) leaving rows `pending` — admin can surface them.
- Smoke-verified live: warm POST 200 in 377ms (pre-enrichment),
  enrichment to `enriched` in ~3s, 400 on invalid, 429 on 6th rapid,
  Resend accepted receipt + sales mail (timestamps set).

## 2026-10-03 — Layer 2: schema, rubric, extraction, seed

- `docs/schema.sql` is the source of truth: `leads` table, 3 indexes,
  `set_updated_at()` trigger. RLS enabled with intentionally zero policies
  (all access via service_role on the server). No anon access at all.
- `lib/ai/rubric.ts`: pure `scoreLead()` — AI classifies, fixed weights
  score (company 30 / industry 25 / intent 25 / budget 20). No AI SDK imports.
- `lib/ai/extract.ts`: one-shot `generateObject` with Groq
  `openai/gpt-oss-120b` primary, Google `gemini-3.1-flash-lite` retry-once
  fallback. Zod schema compile-guarded to mirror the `Extraction` type.
- `scripts/seed-demo.ts`: wipes + inserts 20 leads (5 high / 5 mid /
  5 low / 3 job-seeker / 2 spam) with pre-baked extractions, no AI calls,
  `--dry-run` supported. Seed leaves `status='new'`, routing for later.
- Spam override: `intent === 'spam'` short-circuits to 0/100 (hard override,
  not a deduction; sub-scores returned as 0 for UI consistency).
- Drift check: `Extraction` type, zod schema, and SQL check constraints
  share identical enum strings (`unknown` allowed in both type and SQL;
  industry/role are free-text-or-null in all three). Verified by the
  compile-time `IsExact` guard (type vs schema) and by inspection (vs SQL).
- Live-verified: `tsc` exit 0; `npm run seed` inserted 20 rows
  (total=20 high=5 mid=5 low=10 min=0 max=92 avg=43 — spam rows 0 via
  the hard override, other 18 unchanged); anon key reads 0 rows and
  writes are RLS-blocked, confirming zero policies.

## 2026-10-03 — Layer 1: Scaffold

- Next.js 15 App Router, Tailwind v4, shadcn/ui (Base-UI), AI SDK 7.
- Same stack as SupportAI for consistency. Different AI pattern:
  structured extraction + rubric scoring, not RAG retrieval.
