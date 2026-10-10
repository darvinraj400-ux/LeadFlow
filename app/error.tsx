"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("error boundary:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h2 className="font-display text-xl font-semibold text-foreground">Something went wrong</h2>
      {error.digest ? (
        <p className="font-mono text-xs text-foreground-subtle">Digest: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-[8px] bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Try again
      </button>
    </div>
  );
}
