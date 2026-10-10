'use client';

import { useEffect, useRef, useState } from 'react';

// Horizontal pipeline: on desktop the section pins and vertical scroll
// drives the track horizontally through five stages. Pure CSS sticky +
// rAF-throttled translateX — no scroll library. Mobile and reduced-motion
// fall back to a normal vertical stack. SSR renders stacked (no-JS-safe);
// the mount effect upgrades to pinned on capable viewports.
const PANEL_COUNT = 5;

const EXTRACTION: [string, string][] = [
  ['company_size', '"mid"'],
  ['industry', '"saas"'],
  ['intent', '"demo_request"'],
  ['budget_signal', '"implied"'],
];

const SUBSCORES = [
  { label: 'company_fit', value: 22, max: 30 },
  { label: 'industry_fit', value: 25, max: 25 },
  { label: 'intent_clarity', value: 20, max: 25 },
  { label: 'budget_signal', value: 11, max: 20 },
];

const TIMELINE: [string, string][] = [
  ['14:32:01', 'classified'],
  ['14:32:01', 'scored 78'],
  ['14:32:01', 'routed queued'],
  ['14:32:03', 'notified sales'],
];

function PipeCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 font-mono text-xs leading-relaxed shadow-card">
      {children}
    </div>
  );
}

function DataRow({ k, v, bright }: { k: string; v: string; bright?: boolean }) {
  return (
    <p>
      <span className="text-foreground-subtle">{k}: </span>
      <span className={bright ? 'text-accent' : 'text-foreground'}>{v}</span>
    </p>
  );
}

function StageVisual({ stage, active }: { stage: number; active: boolean }) {
  return (
    <PipeCard>
      <DataRow k="name" v='"Maya Chen"' />
      <DataRow k="email" v='"maya@acme.io"' />
      <DataRow k="company" v='"Acme"' />
      <DataRow k="message" v='"Need a demo…"' />
      {stage >= 2 ? (
        <div className="mt-3 border-t border-border pt-3">
          {EXTRACTION.map(([k, v]) => (
            <DataRow key={k} k={k} v={v} bright />
          ))}
        </div>
      ) : null}
      {stage >= 3 ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {SUBSCORES.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-foreground-subtle">{s.label}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: active ? `${Math.round((s.value / s.max) * 100)}%` : '0%',
                    transitionProperty: 'width',
                    transitionDuration: '600ms',
                    transitionTimingFunction: 'var(--ease-out-expo)',
                    transitionDelay: active ? `${i * 150}ms` : '0ms',
                  }}
                />
              </div>
              <span className="w-14 shrink-0 text-right tabular-nums text-foreground">
                {s.value}/{s.max}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {stage >= 4 ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          <span className="rounded-full border border-border px-2.5 py-1 text-foreground-subtle">
            auto_reply
          </span>
          <span className="rounded-full border border-accent bg-accent-glow px-2.5 py-1 text-accent">
            queued
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-foreground-subtle">
            archive
          </span>
        </div>
      ) : null}
      {stage >= 5 ? (
        <div className="mt-3 border-t border-border pt-3">
          {TIMELINE.map(([t, e]) => (
            <p key={`${t}-${e}`}>
              <span className="text-foreground-subtle">{t} → </span>
              <span className="text-foreground">{e}</span>
            </p>
          ))}
        </div>
      ) : null}
    </PipeCard>
  );
}

const STAGES = [
  {
    n: '01',
    label: 'INGEST',
    headline: 'The form arrives.',
    body: 'Name, email, company, and message are captured. The row is inserted with status "pending" — the visitor sees a reference code in under 300ms.',
  },
  {
    n: '02',
    label: 'EXTRACT',
    headline: 'The AI reads the message.',
    body: 'Groq classifies company size, industry, intent, and budget signal. Structured output — no free-text guessing.',
  },
  {
    n: '03',
    label: 'SCORE',
    headline: 'The rubric scores it.',
    body: 'Four weighted sub-scores. Fixed math. No black box — the total is deterministic given the extraction.',
  },
  {
    n: '04',
    label: 'ROUTE',
    headline: 'The pipeline decides.',
    body: '70 or higher: auto-reply and notify sales. 30-69: queue for human review. Below 30: archive.',
  },
  {
    n: '05',
    label: 'ACT',
    headline: 'Your team moves.',
    body: 'Sales sees a summary and a score. Every decision is logged. The right lead gets the right response.',
  },
];

export function PipelineSection() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  // SSR stacked (hydration-safe); the mount effect upgrades to pinned.
  const [enabled, setEnabled] = useState<boolean>(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mqWide = window.matchMedia('(min-width: 1024px)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setEnabled(mqWide.matches && !mqMotion.matches);
    sync();
    mqWide.addEventListener('change', sync);
    mqMotion.addEventListener('change', sync);
    return () => {
      mqWide.removeEventListener('change', sync);
      mqMotion.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (trackRef.current) trackRef.current.style.transform = '';
      if (fillRef.current) fillRef.current.style.width = '0%';
      activeRef.current = 0;
      setActive(0);
      return;
    }
    let raf = 0;
    let ticking = false;
    const update = () => {
      ticking = false;
      const pin = pinRef.current;
      const track = trackRef.current;
      if (!pin || !track) return;
      const rect = pin.getBoundingClientRect();
      // Skip work when the pin is fully off-screen.
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      const total = pin.offsetHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      // Container-relative (not vw): 100vw includes scrollbar width on
      // some platforms, which would offset every panel.
      const maxShift = track.scrollWidth - pin.clientWidth;
      track.style.transform = `translate3d(${(-progress * maxShift).toFixed(1)}px, 0, 0)`;
      if (fillRef.current) {
        fillRef.current.style.width = `${Math.round(progress * 100)}%`;
      }
      const next = Math.round(progress * (PANEL_COUNT - 1));
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <section aria-label="The pipeline">
      <div className="mx-auto w-full max-w-6xl px-6 pt-[var(--space-section-y)]">
        <p className="eyebrow">The pipeline</p>
        <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.02em]">
          Five stages. One second.
        </h2>
      </div>
      <div
        ref={pinRef}
        className="relative"
        style={enabled ? { height: `${PANEL_COUNT * 100}vh` } : undefined}
      >
        <div
          className={
            enabled
              ? 'sticky top-0 h-screen supports-[height:100dvh]:h-dvh overflow-hidden'
              : 'mx-auto w-full max-w-6xl px-6 py-[var(--space-block-y)]'
          }
        >
          <div
            ref={trackRef}
            className={
              enabled ? 'flex h-full' : 'flex flex-col gap-16'
            }
            style={enabled ? { width: '500%' } : undefined}
          >
            {STAGES.map((s, i) => {
              const isActive = enabled ? i === active : true;
              return (
                <article
                  key={s.n}
                  aria-label={`Stage ${s.n}: ${s.label}`}
                  className={
                    enabled
                      ? 'flex h-screen supports-[height:100dvh]:h-dvh shrink-0 basis-1/5 items-center justify-center px-6 pb-24 pt-16 transition-opacity duration-200'
                      : 'w-full'
                  }
                  style={enabled ? { opacity: isActive ? 1 : 0.35 } : undefined}
                >
                  <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2">
                    <div className="flex flex-col gap-3">
                      <p className="font-mono text-xs tracking-[0.12em] text-foreground-muted">
                        {s.n} / {s.label}
                      </p>
                      <span
                        aria-hidden="true"
                        className="block h-px bg-accent"
                        style={{
                          width: isActive ? '30%' : '0%',
                          transitionProperty: 'width',
                          transitionDuration: '200ms',
                          transitionTimingFunction: 'var(--ease-out-expo)',
                        }}
                      />
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground md:text-3xl">
                        {s.headline}
                      </h3>
                      <p className="max-w-[60ch] text-sm leading-relaxed text-foreground-muted md:text-base">
                        {s.body}
                      </p>
                    </div>
                    <StageVisual stage={i + 1} active={isActive} />
                  </div>
                </article>
              );
            })}
          </div>
          {enabled ? (
            <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
              <div className="h-[2px] w-[100px] overflow-hidden rounded-full bg-border">
                <div ref={fillRef} className="h-full bg-accent" style={{ width: '0%' }} />
              </div>
              <div className="flex gap-3 font-mono text-[0.6875rem] tracking-[0.12em]">
                {STAGES.map((s, i) => (
                  <span
                    key={s.n}
                    className={i === active ? 'text-accent' : 'text-foreground-subtle'}
                  >
                    {s.n}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
