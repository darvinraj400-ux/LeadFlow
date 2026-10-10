export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-8" aria-label="Loading">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-border" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-border" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border p-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="mb-3 h-5 animate-pulse rounded bg-surface last:mb-0" />
        ))}
      </div>
    </div>
  );
}
