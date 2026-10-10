import Link from 'next/link';
import { Archive, Clock, Inbox, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createAdminClient } from '@/lib/supabase';
import { timeAgo } from '@/lib/format';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Lead } from '@/lib/leads/types';

export default async function AdminOverviewPage() {
  const db = createAdminClient();

  const [
    { count: total },
    { count: qualified },
    { count: queued },
    { count: archived },
    { count: b80 },
    { count: b60 },
    { count: b40 },
    { count: b20 },
    { count: b0 },
    { count: unscored },
  ] = await Promise.all([
    db.from('leads').select('*', { count: 'exact', head: true }),
    db
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .in('status', ['qualified', 'contacted', 'replied']),
    db.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'queued'),
    db.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
    // Bucket counts via head queries — never fetch the table to count it.
    db.from('leads').select('*', { count: 'exact', head: true }).gte('score_total', 80),
    db.from('leads').select('*', { count: 'exact', head: true }).gte('score_total', 60).lte('score_total', 79),
    db.from('leads').select('*', { count: 'exact', head: true }).gte('score_total', 40).lte('score_total', 59),
    db.from('leads').select('*', { count: 'exact', head: true }).gte('score_total', 20).lte('score_total', 39),
    db.from('leads').select('*', { count: 'exact', head: true }).gte('score_total', 0).lte('score_total', 19),
    db.from('leads').select('*', { count: 'exact', head: true }).is('score_total', null),
  ]);

  const buckets = [
    { label: '80–100', count: b80 ?? 0 },
    { label: '60–79', count: b60 ?? 0 },
    { label: '40–59', count: b40 ?? 0 },
    { label: '20–39', count: b20 ?? 0 },
    { label: '0–19', count: b0 ?? 0 },
  ];
  const unscoredCount = unscored ?? 0;
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));

  const { data: recent } = await db
    .from('leads')
    .select('id, reference_code, name, company, score_total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(8);

  const stats = [
    { label: 'Total leads', value: total ?? 0, icon: Inbox },
    { label: 'Qualified', value: qualified ?? 0, icon: UserCheck },
    { label: 'Awaiting review', value: queued ?? 0, icon: Clock },
    { label: 'Archived', value: archived ?? 0, icon: Archive },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="glass-score rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium text-foreground-muted">
                {s.label}
              </CardTitle>
              <s.icon className="h-4 w-4 text-foreground-subtle" />
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold tabular-nums text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-surface rounded-lg shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-foreground">Score distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {buckets.map((b) => (
            <div
              key={b.label}
              className="grid grid-cols-[64px_1fr_48px] items-center gap-3"
            >
              <span className="font-mono text-xs text-foreground-muted">{b.label}</span>
              <div className="h-3 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.round((b.count / maxBucket) * 100)}%` }}
                />
              </div>
              <span className="text-right font-mono text-xs tabular-nums text-foreground">
                {b.count}
              </span>
            </div>
          ))}
          {unscoredCount > 0 ? (
            <p className="text-xs text-foreground-subtle">
              {unscoredCount} lead{unscoredCount === 1 ? '' : 's'} not scored yet (pending
              enrichment).
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent leads</h2>
          <Link
            href="/admin/leads"
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
        {!recent || recent.length === 0 ? (
          <p className="rounded-lg border border-border px-4 py-8 text-center text-sm text-foreground-muted">
            No leads yet. Submit the form on the landing page to generate one.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border shadow-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-foreground-muted">Reference</TableHead>
                  <TableHead className="text-foreground-muted">Lead</TableHead>
                  <TableHead className="text-right text-foreground-muted">Score</TableHead>
                  <TableHead className="text-foreground-muted">Status</TableHead>
                  <TableHead className="text-foreground-muted">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recent as Lead[]).map((l) => (
                  <TableRow key={l.id} className="border-border">
                    <TableCell>
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="font-mono text-xs text-accent underline-offset-4 hover:underline"
                      >
                        {l.reference_code}
                      </Link>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {l.company || l.name}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-foreground">
                      {l.score_total ?? '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={l.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground-muted">
                      {timeAgo(l.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
