'use client';

import { useEffect, useRef, useState } from 'react';

// The signature moment: a lead being scored live. Counts 00 → 78 over
// ~1.8s with an ease-out, sub-score bars filling in sequence (~150ms
// stagger), each number counting with its bar. One shot — never replays.
// Pure requestAnimationFrame, no animation library. Reduced-motion renders
// the final state immediately with no loop.
const SUBSCORES = [
  { label: 'COMPANY FIT', value: 22, max: 30 },
  { label: 'INDUSTRY FIT', value: 25, max: 25 },
  { label: 'INTENT CLARITY', value: 20, max: 25 },
  { label: 'BUDGET SIGNAL', value: 11, max: 20 },
] as const;

const TOTAL = 78;
const DURATION_MS = 1800;
const STAGGER_MS = 150;
const BAR_MS = 1000;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function HeroScore() {
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  // Tabular two-digit display reserves width up front — no layout shift.
  const [total, setTotal] = useState(0);
  const [bars, setBars] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || startedRef.current) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTotal(TOTAL);
      setBars(SUBSCORES.map((s) => s.value));
      startedRef.current = true;
      return;
    }

    let raf = 0;
    // Loop ends when the longest-running track (the total count) finishes.
    const END_MS = Math.max(
      DURATION_MS,
      (SUBSCORES.length - 1) * STAGGER_MS + BAR_MS,
    );
    const t0 = performance.now();
    const tick = (now: number) => {
      const elapsed = now - t0;
      setTotal(Math.round(easeOutCubic(Math.min(1, elapsed / DURATION_MS)) * TOTAL));
      setBars(
        SUBSCORES.map((s, i) => {
          const local = (elapsed - i * STAGGER_MS) / BAR_MS;
          if (local <= 0) return 0;
          return easeOutCubic(Math.min(1, local)) * s.value;
        }),
      );
      if (elapsed < END_MS) {
        raf = requestAnimationFrame(tick);
      }
    };

    // Run when visible (hero is above the fold on load; observer covers
    // both cases), exactly once.
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

  return (
    <div ref={rootRef} className="flex w-full flex-col items-center gap-6">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-foreground-subtle">
        Inbound from acme.io · Mid-market SaaS
      </p>
      <p
        aria-label={`Lead score ${TOTAL} out of 100`}
        className="font-display min-h-[1em] text-[clamp(6rem,15vw,12rem)] font-medium leading-[1] tracking-[-0.05em] tabular-nums text-foreground"
      >
        {String(total).padStart(2, '0')}
      </p>
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUBSCORES.map((s, i) => (
          <div key={s.label} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between font-mono text-xs">
              <span className="text-foreground-muted">{s.label}</span>
              <span className="tabular-nums text-foreground">
                {Math.round(bars[i])} / {s.max}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.min(100, (bars[i] / s.max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="grid w-full max-w-3xl grid-cols-[1fr_auto] items-baseline gap-3 border-t border-border pt-3 font-mono text-xs">
        <span className="text-foreground-muted">TOTAL</span>
        <span className="tabular-nums text-foreground">
          {String(total).padStart(2, '0')} / 100
        </span>
      </div>
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-foreground-subtle">
        Classified 2026-10-10 14:32 MYT · Ref LF-20261010-0087
      </p>
    </div>
  );
}
