import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-7xl font-semibold tracking-tight">404</p>
      <p className="max-w-[50ch] text-base leading-relaxed text-muted-foreground">
        This page wandered off. The leads, at least, are still where you left
        them.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Back home
      </Link>
      <p className="mt-6 text-xs text-muted-foreground">
        Relay is a fictional product built as a portfolio piece.
      </p>
    </div>
  );
}
