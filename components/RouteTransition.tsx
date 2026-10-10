'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Wraps in-scope client navigations in document.startViewTransition so
// route changes cross-fade (+8px vertical offset, 320ms total, see the
// ::view-transition CSS). Scope is exactly / and the /admin subtree —
// every other navigation (case study, external, new-tab, hash) goes
// through untouched. Reduced-motion and unsupported browsers navigate
// normally; the app never depends on the transition.
function inScope(path: string): boolean {
  return path === '/' || path === '/admin' || path.startsWith('/admin/');
}

export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (typeof doc.startViewTransition !== 'function') return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement).closest?.('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;
      if (anchor.hasAttribute('download') || anchor.getAttribute('target') === '_blank') return;
      let targetPath: string;
      try {
        targetPath = new URL(href, window.location.origin).pathname;
      } catch {
        return;
      }
      if (!inScope(targetPath) || !inScope(pathname)) return;
      // Same-page navigations (sort, filter, pagination, anchors) update
      // in place — no transition.
      if (targetPath === pathname) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault();
      doc.startViewTransition(() => {
        router.push(href);
      });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [router, pathname]);

  return null;
}
