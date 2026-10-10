import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { LeadForm } from '@/components/form/LeadForm';
import { HeroAtmosphere } from '@/components/marketing/HeroAtmosphere';
import { HeroScore } from '@/components/marketing/HeroScore';
import { MagneticCta } from '@/components/marketing/MagneticCta';
import { PipelineSection } from '@/components/marketing/PipelineSection';
import { Reveal } from '@/components/marketing/Reveal';

export const metadata: Metadata = {
  title: 'Inbound that routes itself',
  description:
    'Relay qualifies, scores, and routes every inbound lead — try the live demo form.',
};

const FEATURES = [
  {
    n: '01',
    title: 'AI enrichment',
    body: 'Every submission is classified — company size, industry, intent, budget signal — seconds after it arrives.',
  },
  {
    n: '02',
    title: 'Transparent scoring',
    body: 'Fixed rubric, fixed weights. The score is deterministic given the extraction — no black-box 78/100.',
  },
  {
    n: '03',
    title: 'Smart routing',
    body: 'Hot leads surface to sales instantly, warm ones queue for review, spam archives itself without contact.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Lead submits',
    body: 'A two-minute form. They get a reference code instantly — no waiting on AI.',
  },
  {
    n: '02',
    title: 'AI classifies',
    body: 'Groq extracts discrete categories, the rubric maps them to points, routing decides the lane.',
  },
  {
    n: '03',
    title: 'Your team acts',
    body: 'Sales sees hot leads with summaries and scores. Everything else is queued or archived.',
  },
];

const BENTO = [
  {
    eyebrow: 'Signal',
    title: 'AI classifies, code scores.',
    body: 'The AI returns discrete categories. A pure function maps them to points with fixed weights. Every score is deterministic given the extraction.',
    span: true,
  },
  {
    eyebrow: 'Audit',
    title: 'Sub-scores you can audit.',
    body: 'Company fit, industry fit, intent clarity, budget signal — each weighted, each visible in the admin.',
    span: false,
  },
  {
    eyebrow: 'Route',
    title: 'Routing that reflects intent.',
    body: '70+ auto-reply. 30–69 queued for review. Below 30 archived. No black box.',
    span: false,
  },
  {
    eyebrow: 'Trace',
    title: 'Every decision logged.',
    body: 'Timestamped, reviewed, and traceable from lead to action.',
    span: true,
  },
];

export default function MarketingHomePage() {
  return (
    <div className="min-h-full bg-background font-sans leading-[1.65] text-foreground">
      <header className="glass-nav sticky top-0 z-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-lg font-semibold tracking-tight">Relay</span>
          <nav className="hidden items-center gap-8 text-sm text-foreground-muted md:flex">
            <Link href="#features" className="hover:text-foreground">
              Product
            </Link>
            <Link href="#how" className="hover:text-foreground">
              How it works
            </Link>
            <Link href="/case-study" className="hover:text-foreground">
              Docs
            </Link>
          </nav>
          <Link
            href="#demo"
            className="rounded-[8px] bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-glow hover:brightness-110"
          >
            Book a demo
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col px-6">
        <section className="relative flex flex-col items-center gap-6 overflow-hidden py-[var(--space-section-y)] text-center">
          <HeroAtmosphere />
          <div className="relative z-10 flex w-full flex-col items-center gap-6">
          <p className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-foreground-muted">
            Relay — a fictional CRM product
          </p>
          <Reveal>
            <h1 className="max-w-3xl font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
              Inbound that routes itself.
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-foreground-muted md:text-lg">
              Relay qualifies, scores, and routes every inbound lead — so your
              team only sees the ones worth their time.
            </p>
          </Reveal>
          <HeroScore />
          <Reveal delay={120}>
            <MagneticCta>
              <Link
                href="#demo"
                className="inline-flex items-center gap-2 rounded-[8px] bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-glow hover:brightness-110"
              >
                Try the live demo <ArrowRight className="h-4 w-4" />
              </Link>
            </MagneticCta>
          </Reveal>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-foreground-subtle">
            Pick a demo below · See the score breakdown in admin
          </p>
          </div>
        </section>

        <section id="demo" className="grid gap-8 py-[var(--space-section-y)] md:grid-cols-5">
          <div className="flex flex-col gap-6 md:col-span-3">
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.02em]">
              What Relay does with one form fill
            </h2>
            <ul className="flex flex-col gap-5">
              {FEATURES.map((f, i) => (
                <li key={f.title}>
                  <Reveal delay={i * 80} className="flex gap-4">
                    <span className="font-mono text-xs leading-6 text-accent">
                      {f.n}
                    </span>
                    <span>
                      <span className="block font-display font-medium">{f.title}</span>
                      <span className="block text-sm leading-relaxed text-foreground-muted">
                        {f.body}
                      </span>
                    </span>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <Reveal delay={120}>
              <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.12em] text-accent">
                Get a demo — this form is live
              </p>
              <LeadForm />
              </div>
            </Reveal>
          </div>
        </section>

        <section id="features" className="grid grid-cols-1 gap-4 py-[var(--space-section-y)] md:grid-cols-2 lg:grid-cols-3">
          {BENTO.map((cell, i) => (
            <Reveal
              key={cell.title}
              delay={(i % 2) * 80}
              className={cell.span ? 'lg:col-span-2' : ''}
            >
            <div
              className="flex h-full flex-col gap-3 rounded-lg border border-border bg-surface p-6 shadow-card"
            >
              <span className="eyebrow">{cell.eyebrow}</span>
              <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">
                {cell.title}
              </h3>
              <p className="text-sm leading-relaxed text-foreground-muted">{cell.body}</p>
            </div>
            </Reveal>
          ))}
        </section>

        <section id="how" className="flex flex-col gap-8 py-[var(--space-section-y)]">
          <h2 className="text-center font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.02em]">
            How it works
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
              <div
                className="flex h-full flex-col gap-2 rounded-lg border border-border bg-surface p-6 shadow-card"
              >
                <span className="font-mono text-sm text-accent">{s.n}</span>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-foreground-muted">{s.body}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <PipelineSection />

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8 font-mono text-xs text-foreground-muted">
          <span className="font-display text-sm font-semibold text-foreground">Relay</span>
          <span>
            Relay is a fictional product built as a portfolio piece. Demo
            submissions are stored and scored for illustration.
          </span>
        </div>
      </footer>
    </div>
  );
}
