export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950" aria-label="Loading">
      <div className="mx-auto w-full max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-20 animate-pulse rounded bg-zinc-800" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-zinc-800" />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-6 py-16">
        <div className="h-4 w-40 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-12 w-3/4 animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-zinc-800" />
      </div>
    </div>
  );
}
