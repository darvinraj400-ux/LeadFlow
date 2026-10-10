'use client';

import { useEffect, useRef } from 'react';

// Magnetic wrapper for the primary hero CTA. On fine-pointer devices the
// child translates toward the cursor (max ±6px, spring-lerped), easing back
// to center on leave. Disabled for touch and reduced-motion. Pure pointer
// events + rAF — no animation library.
export function MagneticCta({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Desktop pointing devices only: touch laptops with a mouse attached
    // still match coarse as primary, so require hover + fine explicitly.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let running = false;

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      if (Math.abs(tx - x) < 0.05 && Math.abs(ty - y) < 0.05) {
        x = tx;
        y = ty;
        running = false;
        el.style.transform = tx === 0 && ty === 0 ? '' : `translate(${x}px, ${y}px)`;
        return;
      }
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      // Distance from cursor to the rect; pull only within ~40px of edges.
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      const dist = Math.hypot(dx, dy);
      if (dist > 40) {
        // Already home: don't wake the loop for distant travel.
        if (tx === 0 && ty === 0 && x === 0 && y === 0) return;
        tx = 0;
        ty = 0;
      } else {
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const vx = e.clientX - cx;
        const vy = e.clientY - cy;
        const mag = Math.hypot(vx, vy) || 1;
        const pull = ((40 - dist) / 40) * 6;
        tx = (vx / mag) * pull;
        ty = (vy / mag) * pull;
      }
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="inline-block">{children}</div>;
}
