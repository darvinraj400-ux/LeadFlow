'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IntentBadge, StatusBadge } from '@/components/admin/StatusBadge';
import { scoreColorClass, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/leads/types';

function SortHead({
  label,
  column,
  sort,
  dir,
  status,
  className,
}: {
  label: string;
  column: 'score' | 'created_at';
  sort: string;
  dir: string;
  status: string | null;
  className?: string;
}) {
  // Same semantics the server page used: toggle dir on the active column,
  // default to desc otherwise; preserve the status filter, reset to page 1.
  const active = sort === column;
  const nextDir = active && dir === 'desc' ? 'asc' : 'desc';
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('sort', column);
  params.set('dir', nextDir);
  const href = `/admin/leads?${params.toString()}`;
  return (
    <TableHead className={cn('text-zinc-400', className)}>
      <Link href={href} className="inline-flex items-center gap-1 hover:text-zinc-100">
        {label}
        <span className="text-xs">{active ? (dir === 'desc' ? '▼' : '▲') : ''}</span>
      </Link>
    </TableHead>
  );
}

export function LeadTable({
  leads,
  sort,
  dir,
  status,
}: {
  leads: Lead[];
  sort: string;
  dir: string;
  status: string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800">
            <TableHead className="text-zinc-400">Reference</TableHead>
            <TableHead className="text-zinc-400">Name / Email</TableHead>
            <TableHead className="text-zinc-400">Company</TableHead>
            <SortHead
              label="Score"
              column="score"
              sort={sort}
              dir={dir}
              status={status}
              className="text-right"
            />
            <TableHead className="text-zinc-400">Intent</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <SortHead
              label="Created"
              column="created_at"
              sort={sort}
              dir={dir}
              status={status}
            />
            <TableHead className="text-zinc-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((l) => (
            <TableRow key={l.id} className="border-zinc-800">
              <TableCell className="font-mono text-xs text-zinc-400">
                {l.reference_code}
              </TableCell>
              <TableCell>
                <span className="block text-sm text-zinc-200">{l.name}</span>
                <span className="block text-xs text-zinc-500">{l.email}</span>
              </TableCell>
              <TableCell className="text-sm text-zinc-300">
                {l.company ?? '—'}
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-mono text-sm font-bold',
                  scoreColorClass(l.score_total),
                )}
              >
                {l.score_total ?? '—'}
              </TableCell>
              <TableCell>
                <IntentBadge intent={l.ai_intent} />
              </TableCell>
              <TableCell>
                <StatusBadge status={l.status} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-zinc-400">
                {timeAgo(l.created_at)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/leads/${l.id}`}
                  className="text-sm text-indigo-400 underline-offset-4 hover:underline"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
