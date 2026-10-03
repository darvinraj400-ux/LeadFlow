// Client-safe display helpers (no server imports — used by server pages
// and client components alike).

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Score text color: green ≥70, amber 30-69, red <30.
export function scoreColorClass(total: number | null): string {
  if (total === null) return 'text-zinc-500';
  if (total >= 70) return 'text-green-400';
  if (total >= 30) return 'text-amber-400';
  return 'text-red-400';
}
