# Build Log

Reverse-chronological. One section per completed layer.

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
