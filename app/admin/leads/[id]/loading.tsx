export default function AdminLeadDetailLoading() {
  return (
    <div className="flex flex-col gap-6" aria-label="Loading">
      <div className="h-6 w-48 animate-pulse rounded bg-zinc-800" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="h-5 w-40 animate-pulse rounded bg-zinc-800" />
              <div className="mt-4 h-24 animate-pulse rounded bg-zinc-800" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="h-5 w-28 animate-pulse rounded bg-zinc-800" />
              <div className="mt-4 h-16 animate-pulse rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
