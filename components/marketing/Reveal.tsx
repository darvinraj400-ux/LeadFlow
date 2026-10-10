'use client';

import { useEffect, useRef, useState } from 'react';

// One-shot scroll reveal: opacity 0→1, y 24→0 over 600ms with the expo
// easing token, optional stagger delay. IntersectionObserver with
// once semantics; reduced-motion renders visible immediately (plus a CSS
// guard in globals.css keeps content visible regardless).
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Bottom margin only: a full -80px inset would also delay above-fold
      // content that starts within 80px of the viewport top.
      { rootMargin: '0px 0px -80px 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${visible ? ' reveal-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '600ms',
        transitionTimingFunction: 'var(--ease-out-expo)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
