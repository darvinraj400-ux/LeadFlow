import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createAdminClient } from '@/lib/supabase';
import { LeadTable } from '@/components/admin/LeadTable';
import type { Lead } from '@/lib/leads/types';

const PAGE_SIZE = 50;

const TABS = [
  { label: 'All', value: null },
  { label: 'New', value: 'new' },
  { label: 'Queued', value: 'queued' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Archived', value: 'archived' },
] as const;

const SORT_COLUMNS = {
  score: 'score_total',
  created_at: 'created_at',
} as const;

function href(
  base: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...overrides })) {
    if (v !== undefined && v !== '') params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/admin/leads?${qs}` : '/admin/leads';
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string; dir?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter =
    sp.status && TABS.some((t) => t.value === sp.status) ? sp.status : null;
  const sort: keyof typeof SORT_COLUMNS =
    sp.sort === 'score' || sp.sort === 'created_at' ? sp.sort : 'created_at';
  const dir: 'asc' | 'desc' = sp.dir === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, /^\d+$/.test(sp.page ?? '') ? Number.parseInt(sp.page!, 10) : 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = createAdminClient();
  let query = db
    .from('leads')
    .select('*', { count: 'exact' })
    .order(SORT_COLUMNS[sort], { ascending: dir === 'asc' })
    .range(offset, offset + PAGE_SIZE - 1);
  if (statusFilter) query = query.eq('status', statusFilter);

  const { data, error, count } = await query;
  if (error) {
    throw new Error(`leads list failed: ${error.message}`);
  }
  const leads = (data ?? []) as Lead[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const base = {
    status: statusFilter ?? undefined,
    sort,
    dir,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Leads</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active =
            (t.value === null && statusFilter === null) || t.value === statusFilter;
          return (
            <Link
              key={t.label}
              href={href(base, { status: t.value ?? undefined, page: undefined })}
              className={cn(
                'rounded-[8px] border px-3 py-1.5 text-sm',
                active
                  ? 'border-accent bg-accent-glow text-accent'
                  : 'border-border text-foreground-muted hover:border-border-strong hover:text-foreground',
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {leads.length === 0 ? (
        <p className="rounded-lg border border-border px-4 py-8 text-center text-sm text-foreground-muted">
          No leads matching this filter.
        </p>
      ) : (
        <>
          <LeadTable
            leads={leads}
            sort={sort}
            dir={dir}
            status={statusFilter}
          />
          <div className="flex items-center justify-between font-mono text-xs text-foreground-muted">
            <span>
              Page {page} of {pageCount} · {total} lead{total === 1 ? '' : 's'}
            </span>
            <span className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={href(base, { page: String(page - 1) })}
                  className="rounded-[8px] border border-border px-3 py-1.5 hover:border-border-strong hover:text-foreground"
                >
                  ← Prev
                </Link>
              ) : null}
              {page < pageCount ? (
                <Link
                  href={href(base, { page: String(page + 1) })}
                  className="rounded-[8px] border border-border px-3 py-1.5 hover:border-border-strong hover:text-foreground"
                >
                  Next →
                </Link>
              ) : null}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
