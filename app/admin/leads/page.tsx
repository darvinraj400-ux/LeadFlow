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
      <h1 className="text-2xl font-semibold tracking-tight text-white">Leads</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active =
            (t.value === null && statusFilter === null) || t.value === statusFilter;
          return (
            <Link
              key={t.label}
              href={href(base, { status: t.value ?? undefined, page: undefined })}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm',
                active
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200',
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {leads.length === 0 ? (
        <p className="rounded-xl border border-zinc-800 px-4 py-8 text-center text-sm text-zinc-400">
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
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>
              Page {page} of {pageCount} · {total} lead{total === 1 ? '' : 's'}
            </span>
            <span className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={href(base, { page: String(page - 1) })}
                  className="rounded-lg border border-zinc-800 px-3 py-1.5 hover:border-zinc-700 hover:text-zinc-200"
                >
                  ← Prev
                </Link>
              ) : null}
              {page < pageCount ? (
                <Link
                  href={href(base, { page: String(page + 1) })}
                  className="rounded-lg border border-zinc-800 px-3 py-1.5 hover:border-zinc-700 hover:text-zinc-200"
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
