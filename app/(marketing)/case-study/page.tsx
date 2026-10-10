import type { Metadata } from 'next';
import Image from 'next/image';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Case Study — LeadFlow',
  description:
    'How LeadFlow was built: an AI pipeline where the AI classifies and the code scores, plus the Signal redesign that made it look like an instrument.',
};

const FLOW = [
  'Form',
  '/api/leads',
  'insert (pending)',
  'return reference code',
  'background: extract via Groq',
  'score via rubric',
  'route',
  'receipt + sales notify',
  'admin',
];

const DECISIONS = [
  {
    title: 'AI classifies, code scores.',
    body: 'The AI returns discrete categories (company_size, industry, intent, budget_signal). A pure function maps them to points with fixed weights. The total is deterministic given the extraction. Any number the UI shows is traceable to a model output and a specific rule.',
  },
  {
    title: 'Fire-and-forget enrichment with `waitUntil`.',
    body: 'The POST returns the reference code in ~370ms. Enrichment runs after. On Vercel, a floating promise dies when the response returns — I hit exactly that in production, with a stranded pending row to prove it. Fixed with `waitUntil` from `@vercel/functions`, which extends the function lifetime until the promise settles. Verified live: submissions reach the DB enriched within 3s.',
    code: 'waitUntil(runEnrichment(id).catch(console.error));',
  },
  {
    title: 'Spam is a hard override, not a point deduction.',
    body: 'The rubric floor is 8/100 for obvious spam. Added an early return: `if (intent === \'spam\') return all zeros`. Small rule, large narrative payoff — 0 reads as definitive to the UI, 8 doesn\'t.',
  },
  {
    title: 'The Signal design system — one instrument across marketing and admin.',
    body: 'Space Grotesk for display, Inter for body, JetBrains Mono for every number. The mono is doing the heavy lifting: every score, ID, date, and status decision uses it. The number 78 is not "a metric in a card" — it is the product\'s output rendered in the font the product\'s output deserves.',
  },
  {
    title: 'Custom cursor, applied with restraint.',
    body: 'Desktop-only, gated on `(pointer: fine)` and viewport ≥ 1024px. A cyan dot follows the cursor exactly, a ring lerps behind at 80ms. Hidden over inputs so the caret is visible. The rest of the site does not animate on hover — only the cursor. One signature micro-interaction, not ten.',
  },
  {
    title: 'HTML injection in email templates.',
    body: 'Caught during review. User-supplied name/company went unescaped into the receipt HTML. Fixed with `lib/email/escape-html.ts` and newline stripping on the sales-notification subject. A bug that would have shipped silently.',
    code: 'escapeHtml(name) // & < > " \' — text part stays raw',
  },
];

export default function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-[1200px] px-6">
        {/* Hero */}
        <section className="py-20 md:py-28">
          <p className="text-sm font-medium tracking-wide text-accent">Case Study</p>
          <h1 className="mt-3 max-w-[24ch] font-display text-4xl font-semibold tracking-tight md:text-6xl">
            LeadFlow — an AI pipeline where the AI classifies and the code scores
          </h1>
          <p className="mt-5 max-w-[70ch] text-base leading-relaxed text-foreground-muted">
            LeadFlow qualifies, scores, and routes inbound B2B leads through a
            public form, a background enrichment pipeline, and an admin
            dashboard. The non-trivial part is the scoring contract: a fixed
            rubric turns model classifications into auditable numbers.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-sm">
            <div>
              <dt className="text-foreground-subtle">Role</dt>
              <dd className="mt-1 text-foreground">Solo — design, engineering, documentation.</dd>
            </div>
            <div>
              <dt className="text-foreground-subtle">Stack</dt>
              <dd className="mt-1 text-foreground">
                Next.js 15 · Supabase Postgres · Groq / Gemini · Vercel · Space Grotesk + JetBrains Mono.
              </dd>
            </div>
            <div>
              <dt className="text-foreground-subtle">Timeline</dt>
              <dd className="mt-1 text-foreground">October 3–10, 2026.</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://lead-flow-sable.vercel.app"
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
                  'border-border-strong bg-transparent text-foreground hover:bg-surface-hover hover:text-foreground',
              })}
            >
              View source
            </a>
          </div>
          <figure className="mt-14">
            <Image
              src="/case-study/hero-score.png"
              alt="Relay landing hero showing a live lead score of 78 with sub-score bars"
              width={1440}
              height={900}
              sizes="100vw"
              className="w-full rounded-lg border border-border shadow-elevated"
            />
            <figcaption className="mt-3 text-center text-sm text-foreground-subtle">
              78/100. Every point traceable to a rubric rule and a model output.
            </figcaption>
          </figure>
        </section>

        {/* 1. Problem */}
        <section className="border-t border-border py-16 md:py-20">
          <p className="text-sm font-medium tracking-wide text-accent">01 — The problem</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Small sales teams drown in inbound
          </h2>
          <div className="mt-6 flex max-w-[70ch] flex-col gap-5 text-base leading-relaxed text-foreground-muted">
            <p>
              A five-person B2B sales team gets a few dozen inbound messages a
              week: demo requests next to job seekers next to SEO cold pitches.
              Reading all of them costs hours; ignoring them costs pipeline.
              What the team needs is a front door that decides, in seconds,
              which messages deserve a human.
            </p>
            <p>
              The AI-scoring market answered with a black box — “this lead is
              78” with no audit trail. Nobody stakes quota on a number nobody
              can explain, so the tool gets ignored and the spreadsheet comes
              back.
            </p>
            <p>
              I split the job the other way: the AI only does what it is good
              at (classification) and pure code does the math (scoring). The
              result is a deterministic number that any developer or sales rep
              could trace back to a category and a rule.
            </p>
          </div>
        </section>

        {/* 2. How it works */}
        <section className="border-t border-border py-16 md:py-20">
          <p className="text-sm font-medium tracking-wide text-accent">02 — How it works</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            One form fill, nine steps
          </h2>
          <p className="mt-6 max-w-[70ch] text-base leading-relaxed text-foreground-muted">
            The request path does the minimum — validate, insert, return a
            reference code — and everything expensive happens after the
            response is already on its way back.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {FLOW.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs text-foreground">
                  {step}
                </span>
                {i < FLOW.length - 1 ? (
                  <span className="text-accent">→</span>
                ) : null}
              </span>
            ))}
          </div>
          <pre className="mt-8 max-w-[70ch] overflow-x-auto rounded-lg bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-foreground">
{`// AI returns categories. Code scores them.
// Company fit = 22/30 — not because the AI decided so,
// but because company_size = "mid" maps to 22 in a fixed table.`}
          </pre>
        </section>

        {/* 3. Technical decisions */}
        <section className="border-t border-border py-16 md:py-20">
          <p className="text-sm font-medium tracking-wide text-accent">03 — Technical decisions</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Six calls I&apos;d defend in an interview
          </h2>
          <div className="mt-8 flex flex-col gap-10">
            {DECISIONS.map((d) => (
              <div key={d.title}>
                <h3 className="text-lg font-semibold text-foreground">
                  {d.title}
                </h3>
                <p className="mt-2 max-w-[70ch] text-base leading-relaxed text-foreground-muted">
                  {d.body}
                </p>
                {d.code ? (
                  <pre className="mt-3 max-w-[70ch] overflow-x-auto rounded-lg bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-foreground">
                    {d.code}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* 4. Signal redesign */}
        <section className="border-t border-border py-16 md:py-20">
          <p className="text-sm font-medium tracking-wide text-accent">04 — The Signal redesign</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            An instrument, not a dashboard
          </h2>
          <div className="mt-6 flex max-w-[70ch] flex-col gap-5 text-base leading-relaxed text-foreground-muted">
            <p>
              The original LeadFlow read as an AI-generated SaaS. Dark zinc,
              Inter throughout, three-card feature row. Correct for the
              product, indistinguishable from every other AI-adjacent
              portfolio project. The redesign has a name — Signal — and a
              thesis: an instrument, not a dashboard.
            </p>
            <p>
              The palette is near-black with electric cyan as the signal
              color. Signal-high/mid/low tokens map directly to routing
              decisions (qualified / queued / archived). Typography pairs
              Space Grotesk for headlines, Inter for body, and JetBrains Mono
              for every number in the product. Spacing uses clamp tokens that
              scale section rhythm between 96 and 160 pixels.
            </p>
            <p>
              Three signature moments carry it. The hero shows a live score
              animating from 00 to 78 with sub-score bars filling in
              sequence. The pipeline section pins and scrolls horizontally
              through five stages — ingest, extract, score, route, act. The
              admin lead detail reveals the score breakdown on viewport
              entry: bars fill left-to-right, staggered 120ms, with the total
              counting up. Each moment reflects the product&apos;s actual
              mechanics, not decoration.
            </p>
          </div>
          <figure className="mt-14">
            <Image
              src="/case-study/pipeline.png"
              alt="Pipeline section showing Stage 3 with sub-score bars"
              width={1440}
              height={900}
              sizes="100vw"
              className="w-full rounded-lg border border-border shadow-elevated"
            />
            <figcaption className="mt-3 text-center text-sm text-foreground-subtle">
              Five stages. One instrument.
            </figcaption>
          </figure>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <figure>
              <Image
                src="/case-study/bento.png"
                alt="Asymmetric bento grid of product principles"
                width={1440}
                height={900}
                sizes="100vw"
                className="w-full rounded-lg border border-border shadow-elevated"
              />
              <figcaption className="mt-3 text-center text-sm text-foreground-subtle">
                Bento grid, asymmetric by design.
              </figcaption>
            </figure>
            <figure>
              <Image
                src="/case-study/admin-overview.png"
                alt="Admin overview with glass stat cards and score distribution"
                width={1440}
                height={900}
                sizes="100vw"
                className="w-full rounded-lg border border-border shadow-elevated"
              />
              <figcaption className="mt-3 text-center text-sm text-foreground-subtle">
                Same instrument on the admin side.
              </figcaption>
            </figure>
          </div>
          <figure className="mx-auto mt-8 max-w-[320px]">
            <Image
              src="/case-study/mobile-hero.png"
              alt="Mobile hero with stacked score display"
              width={750}
              height={1688}
              sizes="(max-width: 768px) 100vw, 320px"
              className="w-full rounded-lg border border-border shadow-elevated"
            />
            <figcaption className="mt-3 text-center text-sm text-foreground-subtle">
              Mobile stacks, nothing scrolls sideways.
            </figcaption>
          </figure>
        </section>

        {/* 5. Differently */}
        <section className="border-t border-border py-16 md:py-20">
          <p className="text-sm font-medium tracking-wide text-accent">05 — What I&apos;d do differently</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Three honest limitations
          </h2>
          <ul className="mt-6 flex max-w-[70ch] list-disc flex-col gap-4 pl-5 text-base leading-relaxed text-foreground-muted">
            <li>
              <strong className="text-foreground">Receipt delivery on the free Resend tier is constrained.</strong>{' '}
              The shared sender only delivers to the account owner. Verifying
              a custom domain is the production fix ($10/yr); v1 ships with
              the limitation documented.
            </li>
            <li>
              <strong className="text-foreground">Rate limiting is a Map, not Redis.</strong>{' '}
              Single-instance in-memory. Fine for a demo, resets on cold
              start. Upstash Redis + sliding window is the correct shape.
            </li>
            <li>
              <strong className="text-foreground">Admin auth is a shared password, not a user system.</strong>{' '}
              Correct for a portfolio piece, wrong for multi-tenant. A real
              version would move to Supabase Auth with RLS policies per user.
            </li>
          </ul>
        </section>

        {/* 6. Under the hood */}
        <section className="border-t border-border py-16 md:py-20">
          <p className="text-sm font-medium tracking-wide text-accent">06 — Under the hood</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            The receipts
          </h2>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['31.6 kB / 155 kB', 'First Load JS for / (page / total)'],
              ['22 commits', 'layers, fixes, and this rewrite'],
              ['~5,200 lines', 'no test suite — verified live instead'],
              ['All green', 'tsc, lint, build, seed — zero paid tools'],
            ].map(([k, v]) => (
              <div
                key={k}
                className="rounded-lg border border-border bg-surface p-5 shadow-card"
              >
                <dt className="font-mono text-lg font-semibold text-foreground">{k}</dt>
                <dd className="mt-1 text-sm text-foreground-muted">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 max-w-[70ch] text-base leading-relaxed text-foreground-muted">
            Next.js 15 App Router, Tailwind v4, shadcn Base-UI, Supabase
            Postgres, Groq + Gemini, Resend, Vercel. No 3D, no animation
            library — the redesign was done with pure CSS, rAF, and
            IntersectionObserver.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <figure>
              <Image
                src="/case-study/admin-detail-reveal.png"
                alt="Score breakdown mid-reveal with partially filled bars"
                width={1440}
                height={2400}
                sizes="100vw"
                className="w-full rounded-lg border border-border shadow-elevated"
              />
              <figcaption className="mt-3 text-center text-sm text-foreground-subtle">
                Mid-reveal: labels in, weights pending.
              </figcaption>
            </figure>
            <figure>
              <Image
                src="/case-study/admin-detail.png"
                alt="Lead detail settled with complete score breakdown"
                width={1440}
                height={900}
                sizes="100vw"
                className="w-full rounded-lg border border-border shadow-elevated"
              />
              <figcaption className="mt-3 text-center text-sm text-foreground-subtle">
                Settled a second later.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-10 text-sm text-foreground-subtle">
          <p>
            Built by{' '}
            <a
              href="https://github.com/darvinraj400-ux"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Darvin Raj
            </a>
            .
          </p>
          <p className="mt-2 text-xs">
            Relay is a fictional CRM. LeadFlow is a portfolio piece — no real customers.
          </p>
        </footer>
      </main>
    </div>
  );
}
