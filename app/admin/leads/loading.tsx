export default function AdminLeadsLoading() {
  return (
    <div className="flex flex-col gap-6" aria-label="Loading">
      <div className="h-8 w-24 animate-pulse rounded bg-zinc-800" />
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-20 animate-pulse rounded-lg bg-zinc-800" />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="border-b border-zinc-800 px-4 py-4 last:border-0">
            <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
