'use client';

import { useEffect, useRef, useState } from 'react';

// Desktop-only custom cursor: 4px cyan dot tracking exactly, 24px ring
// lerping behind (~80ms). Over interactive elements the dot vanishes and
// the ring grows to 1.6x with a thicker border. Renders only on fine
// pointers ≥1024px without reduced-motion; otherwise native cursor stays.
const HOVER_SELECTOR =
  'a, button, select, [role="button"], input, textarea, [data-cursor="hover"]';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  // SSR null (hydration-safe); the mount effect enables on capable devices.
  // The cursor starts off-screen anyway, so the delayed mount is invisible.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mqHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () =>
      setEnabled(
        mqHover.matches &&
          window.innerWidth >= 1024 &&
          !mqMotion.matches,
      );
    sync();
    mqHover.addEventListener('change', sync);
    mqMotion.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    return () => {
      mqHover.removeEventListener('change', sync);
      mqMotion.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!enabled || !dot || !ring) return;
    document.body.classList.add('cursor-custom');

    let raf = 0;
    let last = performance.now();
    let rx = -100;
    let ry = -100;
    let tx = -100;
    let ty = -100;
    let scale = 1;
    let hovering = false;

    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      // ~80ms exponential lag for the ring; dot is exact.
      const k = 1 - Math.exp(-dt / 80);
      rx += (tx - rx) * k;
      ry += (ty - ry) * k;
      scale += ((hovering ? 1.6 : 1) - scale) * k;
      ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      const hot = !!(e.target as HTMLElement).closest?.(HOVER_SELECTOR);
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      dot.style.opacity = hot ? '0' : '1';
      tx = e.clientX;
      ty = e.clientY;
      hovering = hot;
      ring.style.borderWidth = hot ? '2px' : '1px';
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      document.body.classList.remove('cursor-custom');
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1 w-1 rounded-full bg-accent"
        style={{ mixBlendMode: 'normal', transition: 'opacity 200ms ease-out' }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-6 w-6 rounded-full border border-accent"
        style={{ mixBlendMode: 'normal' }}
      />
    </>
  );
}
