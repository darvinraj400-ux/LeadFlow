export default function AdminLeadDetailLoading() {
  return (
    <div className="flex flex-col gap-6" aria-label="Loading">
      <div className="h-6 w-48 animate-pulse rounded bg-surface" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-6">
              <div className="h-5 w-40 animate-pulse rounded bg-border" />
              <div className="mt-4 h-24 animate-pulse rounded bg-border" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-6">
              <div className="h-5 w-28 animate-pulse rounded bg-border" />
              <div className="mt-4 h-16 animate-pulse rounded bg-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
