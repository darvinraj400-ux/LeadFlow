import type { Metadata } from 'next';
import Image from 'next/image';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Case Study — LeadFlow',
  description:
    'How LeadFlow was built: AI classification with deterministic rubric scoring, fire-and-forget enrichment, Groq primary with Gemini fallback, all on free tiers.',
};

const DECISIONS: { title: string; body: string; code?: string }[] = [
  {
    title: 'AI classifies, code scores',
    body: 'The model never outputs a number. It returns discrete categories — company_size, industry, intent, budget_signal — and a pure TypeScript function maps them to points with fixed weights (company 30, industry 25, intent 25, budget 20). The score is deterministic given the extraction: a 92 is traceable to a specific model output plus a specific rule, which is the whole answer to the black-box objection.',
    code: 'scoreLead(extraction) // same input, same score, every time',
  },
  {
    title: 'Spam is a hard override, not a point deduction',
    body: 'The rubric bottomed out at 8/100 for obvious spam — solo, unknown industry, no budget signal. An 8 reads as "some fit," which is wrong; spam has no fit. I added an early return: intent === spam scores 0 across the board. Routing treats 0 as definitive. Three lines, large narrative payoff.',
    code: "if (e.intent === 'spam') return all zeros // 0/100 by construction",
  },
  {
    title: 'Fire-and-forget enrichment via waitUntil',
    body: 'The POST returns the reference code before the AI runs. The visitor sees success in ~370ms; enrichment finishes ~3s later in the same serverless invocation. First version used a floating promise (`void runEnrichment()`) — which silently died on Vercel because the function freezes as soon as the response is sent. Fixed with waitUntil from @vercel/functions, which extends the function lifetime until the promise settles. Would move to a proper job queue at real volume.',
    code: "import { waitUntil } from '@vercel/functions';\nwaitUntil(runEnrichment(id).catch(console.error));\nreturn NextResponse.json({ ok: true, reference_code });",
  },
  {
    title: 'HTML injection in email templates',
    body: 'Security review caught this one before it shipped: the lead\'s name and company went unescaped into the receipt HTML, and the AI summary into the sales notification. An attacker-controlled string rendered in the sales inbox inherits real trust. I added lib/email/escape-html.ts — four replacements applied to every interpolated value — and stripped newlines from the subject line.',
    code: 'escapeHtml(name) // & < > " \' — text part stays raw',
  },
  {
    title: 'RSC function-prop boundary',
    body: 'The leads table passed a sortHref builder from a server component into a client component. TypeScript was happy, next build was happy — it only crashes at request time in production with "Functions cannot be passed directly to Client Components." I moved the URL builder into the client component, which already held everything it needed. The class of bug that only surfaces on first deploy.',
    code: 'props: leads, sort, dir, status // serializable only',
  },
  {
    title: 'Schema/type drift prevention',
    body: 'Three artifacts must agree on every enum literal: the Extraction TS type, the zod schema fed to generateObject, and the SQL CHECK constraints. The first two are pinned together by a compile-time IsExact guard, so changing one side breaks the build until the other follows. The SQL side is covered by a header note and a seed script that asserts exact totals — 20 hand-computed scores that fail loudly on rubric drift.',
    code: 'IsExact<z.infer<schema>, Extraction> // drift = build error',
  },
];

const FLOW = [
  'Lead submits form',
  'POST /api/leads',
  'reference code (immediate)',
  'extract via Groq',
  'score via rubric',
  'route',
  'receipt + sales notify',
  'admin dashboard',
];

export default function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto max-w-[1200px] px-6">
        {/* Hero */}
        <section className="py-20 md:py-28">
          <p className="text-sm font-medium tracking-wide text-indigo-400">Case Study</p>
          <h1 className="mt-3 max-w-[20ch] text-4xl font-semibold tracking-tight text-white md:text-6xl">
            LeadFlow — inbound that routes itself
          </h1>
          <p className="mt-5 max-w-[70ch] text-base leading-relaxed text-zinc-400">
            LeadFlow qualifies, scores, and routes inbound B2B leads through a
            public form, a background AI pipeline, and an admin dashboard. The
            non-trivial part is the scoring contract: the model classifies, a
            fixed rubric scores, and every number in the UI is auditable back
            to a rule.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">Role</dt>
              <dd className="mt-1 text-zinc-200">Solo — design, engineering, documentation.</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Stack</dt>
              <dd className="mt-1 text-zinc-200">
                Next.js 15 · Supabase · Groq / Gemini · Resend · Vercel.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Timeline</dt>
              <dd className="mt-1 text-zinc-200">Built over 2 days.</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://lead-flow-sable.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: 'lg' })}
            >
              Try the live demo
            </a>
            <a
              href="https://github.com/darvinraj400-ux/LeadFlow"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                size: 'lg',
                variant: 'outline',
                className:
                  'border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-white',
              })}
            >
              View source
            </a>
          </div>
          <figure className="mt-14">
            <Image
              src="/case-study/overview.png"
              alt="Relay admin pipeline overview with stats and score distribution"
              width={813}
              height={262}
              sizes="100vw"
              className="w-full rounded-xl border border-zinc-800 shadow-2xl"
            />
            <figcaption className="mt-3 text-center text-sm text-zinc-500">
              The pipeline at a glance — every lead scored, routed, and reviewable.
            </figcaption>
          </figure>
        </section>

        {/* 1. Problem */}
        <section className="border-t border-zinc-800 py-16 md:py-20">
          <p className="text-sm font-medium tracking-wide text-indigo-400">01 — The problem</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Small sales teams drown in inbound they can&apos;t triage
          </h2>
          <div className="mt-6 flex max-w-[70ch] flex-col gap-5 text-base leading-relaxed text-zinc-400">
            <p>
              A five-person B2B sales team gets a few dozen inbound messages a
              week: demo requests next to job seekers next to SEO cold pitches.
              Reading all of them costs hours; ignoring them costs pipeline.
              What the team needs is not a smarter inbox — it is a front door
              that decides, in seconds, which messages deserve a human.
            </p>
            <p>
              The obvious answer — &quot;AI ranks your leads 0-100&quot; — is one I
              didn&apos;t trust enough to build. A model emitting a bare number
              is unauditable: when a rep asks why this lead is a 78 and that
              one a 72, &quot;the model felt like it&quot; ends the
              conversation. Nobody stakes quota on a number nobody can explain,
              so the tool gets ignored and the spreadsheet comes back.
            </p>
            <p>
              What v1 set out to prove is narrower: the AI classifies, the
              rubric scores, and the number is auditable. The model outputs
              discrete categories it can actually observe in the message;
              deterministic code turns those categories into points. Every
              score in the dashboard decomposes into four sub-scores with
              published weights — and that decomposition is the product.
            </p>
          </div>
        </section>

        {/* 2. How it works */}
        <section className="border-t border-zinc-800 py-16 md:py-20">
          <p className="text-sm font-medium tracking-wide text-indigo-400">02 — How it works</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            One form fill, eight steps, three seconds
          </h2>
          <p className="mt-6 max-w-[70ch] text-base leading-relaxed text-zinc-400">
            The request path does the minimum — validate, insert, return a
            reference code — and everything expensive happens after the
            response is already on its way back. The admin dashboard reads the
            same rows the pipeline writes; there is no separate read model.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {FLOW.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-200">
                  {step}
                </span>
                {i < FLOW.length - 1 ? (
                  <span className="text-indigo-400">→</span>
                ) : null}
              </span>
            ))}
          </div>
          <figure className="mt-14">
            <Image
              src="/case-study/leads.png"
              alt="Relay admin leads table with scores, intents, and statuses"
              width={1654}
              height={1072}
              sizes="100vw"
              className="w-full rounded-xl border border-zinc-800 shadow-2xl"
            />
            <figcaption className="mt-3 text-center text-sm text-zinc-500">
              Every lead, filterable and sortable.
            </figcaption>
          </figure>
        </section>

        {/* 3. Technical decisions */}
        <section className="border-t border-zinc-800 py-16 md:py-20">
          <p className="text-sm font-medium tracking-wide text-indigo-400">03 — Technical decisions</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Six calls I&apos;d defend in an interview
          </h2>
          <div className="mt-8 flex flex-col gap-10">
            {DECISIONS.map((d, i) => (
              <div key={d.title}>
                <h3 className="text-lg font-semibold text-white">
                  {d.title}
                </h3>
                <p className="mt-2 max-w-[70ch] text-base leading-relaxed text-zinc-400">
                  {d.body}
                </p>
                {d.code ? (
                  <pre className="mt-3 max-w-[70ch] overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 font-mono text-xs leading-relaxed text-zinc-300">
                    {d.code}
                  </pre>
                ) : null}
                {i === 0 ? (
                  <figure className="mx-auto mt-6 max-w-md">
                    <Image
                      src="/case-study/breakdown.png"
                      alt="Score breakdown panel showing sub-scores and weights"
                      width={1654}
                      height={1381}
                      sizes="(max-width: 768px) 100vw, 448px"
                      className="w-full rounded-xl border border-zinc-800 shadow-2xl"
                    />
                    <figcaption className="mt-3 text-center text-sm text-zinc-500">
                      Sub-scores and weights, rendered straight from the DB. No
                      client-side recomputation.
                    </figcaption>
                  </figure>
                ) : null}
              </div>
            ))}
          </div>
          <figure className="mt-14">
            <Image
              src="/case-study/detail.png"
              alt="Full lead detail page with AI summary, extraction, routing, and timeline"
              width={1215}
              height={911}
              sizes="100vw"
              className="w-full rounded-xl border border-zinc-800 shadow-2xl"
            />
            <figcaption className="mt-3 text-center text-sm text-zinc-500">
              Full lead detail — AI summary, extraction, routing, timeline.
            </figcaption>
          </figure>
        </section>

        {/* 4. Differently */}
        <section className="border-t border-zinc-800 py-16 md:py-20">
          <p className="text-sm font-medium tracking-wide text-indigo-400">04 — What I&apos;d do differently</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Three honest limitations
          </h2>
          <ul className="mt-6 flex max-w-[70ch] list-disc flex-col gap-4 pl-5 text-base leading-relaxed text-zinc-400">
            <li>
              The rate limit is a single-instance in-memory Map. Fine for a
              demo, resets on cold start. Upstash Redis + sliding window is
              the production shape.
            </li>
            <li>
              Receipt delivery to non-owner emails requires a verified Resend
              domain. I would spend the $10/yr on a real domain if this were a
              paid product instead of a portfolio piece.
            </li>
            <li>
              Admin auth is a shared password, not a user system. Fine for a
              portfolio demo, wrong for multi-tenant.
            </li>
          </ul>
        </section>

        {/* 5. Under the hood */}
        <section className="border-t border-zinc-800 py-16 md:py-20">
          <p className="text-sm font-medium tracking-wide text-indigo-400">05 — Under the hood</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            The receipts
          </h2>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['~5,200 lines', 'across ~80 tracked files'],
              ['13 commits', 'layers 1–6 plus prod fixes'],
              ['20 seeded leads', 'score plan 5/5/5/3/2, verified live'],
              ['All green', 'tsc, build, seed — zero paid tools'],
            ].map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <dt className="text-lg font-semibold text-white">{k}</dt>
                <dd className="mt-1 text-sm text-zinc-400">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 max-w-[70ch] text-base leading-relaxed text-zinc-400">
            Groq gpt-oss-120b primary, Gemini 3.1-flash-lite fallback. Supabase,
            Groq, Gemini, Vercel, Resend, and GitHub all on free tiers — the
            only bill for this project is $0.
          </p>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800 py-10 text-sm text-zinc-500">
          <p>
            Built by{' '}
            <a
              href="https://github.com/darvinraj400-ux"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-200 underline-offset-4 hover:underline"
            >
              Darvin Raj
            </a>
            .
          </p>
          <p className="mt-2 text-xs">
            Relay is a fictional CRM. LeadFlow is a portfolio piece — no real
            customer data.
          </p>
        </footer>
      </main>
    </div>
  );
}
