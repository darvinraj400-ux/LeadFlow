import Link from 'next/link';
import { ArrowRight, Gauge, Inbox, Route } from 'lucide-react';
import { LeadForm } from '@/components/form/LeadForm';

const FEATURES = [
  {
    icon: Inbox,
    title: 'AI enrichment',
    body: 'Every submission is classified — company size, industry, intent, budget signal — seconds after it arrives.',
  },
  {
    icon: Gauge,
    title: 'Transparent scoring',
    body: 'Fixed rubric, fixed weights. The score is deterministic given the extraction — no black-box 78/100.',
  },
  {
    icon: Route,
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

export default function MarketingHomePage() {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">Relay</span>
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <Link href="#features" className="hover:text-zinc-100">
              Product
            </Link>
            <Link href="#how" className="hover:text-zinc-100">
              How it works
            </Link>
            <Link href="/case-study" className="hover:text-zinc-100">
              Docs
            </Link>
          </nav>
          <Link
            href="#demo"
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Book a demo
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16 md:py-24">
        <section className="flex flex-col items-center gap-6 text-center">
          <p className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
            Relay — a fictional CRM product
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Inbound that routes itself.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Relay qualifies, scores, and routes every inbound lead — so your
            team only sees the ones worth their time.
          </p>
          <Link
            href="#demo"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Try the live demo <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section id="demo" className="grid gap-8 md:grid-cols-5">
          <div className="flex flex-col gap-6 md:col-span-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              What Relay does with one form fill
            </h2>
            <ul className="flex flex-col gap-5">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                    <f.icon className="h-5 w-5 text-indigo-400" />
                  </span>
                  <span>
                    <span className="block font-medium">{f.title}</span>
                    <span className="block text-sm leading-relaxed text-zinc-400">
                      {f.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="mb-4 text-sm font-medium text-zinc-300">
                Get a demo — this form is live
              </p>
              <LeadForm />
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <f.icon className="h-6 w-6 text-indigo-400" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{f.body}</p>
            </div>
          ))}
        </section>

        <section id="how" className="flex flex-col gap-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <span className="font-mono text-sm text-indigo-400">{s.n}</span>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-zinc-500">
          <span className="text-sm font-semibold text-zinc-300">Relay</span>
          <span>
            Relay is a fictional product built as a portfolio piece. Demo
            submissions are stored and scored for illustration.
          </span>
        </div>
      </footer>
    </div>
  );
}
