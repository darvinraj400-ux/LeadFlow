'use client';

import { useEffect, useRef, useState } from 'react';

// Score breakdown reveal for the admin lead detail page — the case study's
// hero visual. On first viewport entry: total counts 0 → final over 1.2s,
// sub-score bars fill staggered 120ms apart, labels fade with their bars,
// weight values fade in as each bar completes, total row fades in last with
// a cyan underline drawing over 300ms. One shot, never replays.
// Reduced-motion renders final values immediately. Values are props read
// from the DB — never recomputed here.
const ROWS = [
  { label: 'Company fit', key: 'company_fit', max: 30 },
  { label: 'Industry fit', key: 'industry_fit', max: 25 },
  { label: 'Intent clarity', key: 'intent_clarity', max: 25 },
  { label: 'Budget signal', key: 'budget_signal', max: 20 },
] as const;

const COUNT_MS = 1200;
const STAGGER_MS = 120;
const BAR_MS = 800;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function ScoreReveal({
  company_fit,
  industry_fit,
  intent_clarity,
  budget_signal,
  total,
}: {
  company_fit: number | null;
  industry_fit: number | null;
  intent_clarity: number | null;
  budget_signal: number | null;
  total: number | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  const values: Record<(typeof ROWS)[number]['key'], number | null> = {
    company_fit,
    industry_fit,
    intent_clarity,
    budget_signal,
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || startedRef.current) return;
    // Final frame, no loop.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setElapsed(COUNT_MS + ROWS.length * STAGGER_MS + BAR_MS);
      setRunning(true);
      startedRef.current = true;
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const dt = now - t0;
      setElapsed(dt);
      if (dt < COUNT_MS + ROWS.length * STAGGER_MS + BAR_MS) {
        raf = requestAnimationFrame(tick);
      } else {
        setRunning(true);
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !startedRef.current) {
          startedRef.current = true;
          observer.disconnect();
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  if (total === null) {
    return (
      <p className="text-sm text-foreground-muted">
        Not scored yet — enrichment is still pending.
      </p>
    );
  }

  const shown = running
    ? total
    : Math.round(easeOutCubic(Math.min(1, elapsed / COUNT_MS)) * total);
  const totalDone = elapsed >= COUNT_MS;

  return (
    <div ref={ref} className="flex flex-col gap-3">
      {ROWS.map((row, i) => {
        const target = values[row.key] ?? 0;
        const local = (elapsed - i * STAGGER_MS) / BAR_MS;
        const filled = local <= 0 ? 0 : easeOutCubic(Math.min(1, local)) * target;
        const done = local >= 1;
        return (
          <div
            key={row.key}
            className="grid grid-cols-[120px_1fr_80px] items-center gap-3"
          >
            <span
              className="text-sm text-foreground-muted transition-opacity duration-200"
              style={{ opacity: local > 0 || running ? 1 : 0 }}
            >
              {row.label}
            </span>
            <div className="h-3 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.min(100, (filled / row.max) * 100)}%` }}
              />
            </div>
            <span
              className="text-right font-mono text-xs text-foreground tabular-nums transition-opacity duration-200"
              style={{ opacity: done || running ? 1 : 0 }}
            >
              {Math.round(filled)} / {row.max}
            </span>
          </div>
        );
      })}
      <div
        className="grid grid-cols-[120px_1fr_80px] items-center gap-3 border-t border-border pt-3 transition-opacity duration-300"
        style={{ opacity: totalDone || running ? 1 : 0 }}
      >
        <span className="text-sm font-medium text-foreground">Total</span>
        <span
          aria-hidden="true"
          className="block h-px bg-accent"
          style={{
            transform: totalDone || running ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transitionProperty: 'transform',
            transitionDuration: '300ms',
            transitionTimingFunction: 'var(--ease-out-expo)',
          }}
        />
        <span className="text-right font-mono text-sm font-bold tabular-nums text-foreground">
          {shown} / 100
        </span>
      </div>
      <p className="text-xs leading-relaxed text-foreground-subtle">
        Weights are fixed: company 30, industry 25, intent 25, budget 20. AI
        classifies; rubric scores deterministically.
      </p>
    </div>
  );
}
