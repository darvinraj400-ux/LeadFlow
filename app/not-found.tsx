import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="font-display text-7xl font-semibold tracking-tight text-foreground">404</p>
      <p className="max-w-[50ch] text-base leading-relaxed text-foreground-muted">
        This page wandered off. The leads, at least, are still where you left
        them.
      </p>
      <Link
        href="/"
        className="rounded-[8px] bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Back home
      </Link>
      <p className="mt-6 font-mono text-xs text-foreground-subtle">
        Relay is a fictional product built as a portfolio piece.
      </p>
    </div>
  );
}
