"use client";

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('admin error boundary:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-start justify-center gap-3">
      <h2 className="text-xl font-semibold text-white">Something went wrong.</h2>
      <p className="max-w-[60ch] text-sm leading-relaxed text-foreground-muted">
        The admin panel hit an unexpected error. Reloading usually fixes it —
        your data is safe.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-[8px] bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Try again
      </button>
    </div>
  );
}
