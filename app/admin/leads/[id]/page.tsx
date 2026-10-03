import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createAdminClient } from '@/lib/supabase';
import { formatDateTime, scoreColorClass } from '@/lib/format';
import { IntentBadge, RoutingBadge, StatusBadge } from '@/components/admin/StatusBadge';
import { ScoreBreakdown } from '@/components/admin/ScoreBreakdown';
import { LeadActions } from '@/components/admin/LeadActions';
import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/leads/types';

function TimelineRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300">{formatDateTime(value)}</span>
    </div>
  );
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();
  const { data, error } = await db.from('leads').select('*').eq('id', id).maybeSingle();
  if (error || !data) notFound();
  const lead = data as Lead;

  const routingNote =
    lead.routing_decision === 'archive'
      ? 'Archived — low fit'
      : lead.routing_decision === 'auto_reply'
        ? 'Receipt sent, sales notified'
        : lead.routing_decision === 'human_review'
          ? 'Awaiting human review'
          : 'Not routed yet';

  const extractionRows: [string, string | null][] = [
    ['Company size', lead.extracted_company_size],
    ['Industry', lead.extracted_industry],
    ['Role', lead.extracted_role],
    ['Budget signal', lead.extracted_budget_signal],
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-mono text-lg text-zinc-400">{lead.reference_code}</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-white">{lead.name}</p>
                  <p className="text-sm text-zinc-400">{lead.email}</p>
                  {[lead.company, lead.role].filter(Boolean).length > 0 ? (
                    <p className="mt-1 text-sm text-zinc-500">
                      {[lead.company, lead.role].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-zinc-500">
                    Submitted {formatDateTime(lead.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={lead.status} />
                  <p className={cn('font-mono text-5xl font-bold', scoreColorClass(lead.score_total))}>
                    {lead.score_total ?? '—'}
                    <span className="text-lg text-zinc-500">/100</span>
                  </p>
                </div>
              </div>
              {lead.ai_summary ? (
                <p className="border-t border-zinc-800 pt-4 text-sm leading-relaxed text-zinc-300">
                  {lead.ai_summary}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-white">Score breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown
                company_fit={lead.score_company_fit}
                industry_fit={lead.score_industry_fit}
                intent_clarity={lead.score_intent_clarity}
                budget_signal={lead.score_budget_signal}
                total={lead.score_total}
              />
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-white">Message</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <blockquote className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-300">
                {lead.message}
              </blockquote>
              <p className="text-xs text-zinc-500">
                Submitted by {lead.name} &lt;{lead.email}&gt;
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-white">AI extraction</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {extractionRows.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 text-sm">
                    <dt className="text-zinc-500">{k}</dt>
                    <dd className="font-mono text-xs text-zinc-200">{v ?? '—'}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 text-sm">
                  <dt className="text-zinc-500">Intent</dt>
                  <dd>
                    <IntentBadge intent={lead.ai_intent} />
                  </dd>
                </div>
              </dl>
              {lead.ai_tags && lead.ai_tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {lead.ai_tags.map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="border-zinc-700 font-mono text-[11px] text-zinc-300"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-white">Routing</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <StatusBadge status={lead.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Decision</span>
                <RoutingBadge decision={lead.routing_decision} />
              </div>
              <p className="border-t border-zinc-800 pt-3 text-xs text-zinc-500">
                {routingNote}
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-white">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadActions leadId={lead.id} currentStatus={lead.status} />
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-white">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <TimelineRow label="Created" value={lead.created_at} />
              {lead.ai_status === 'enriched' ? (
                <TimelineRow label="AI enriched" value={lead.updated_at} />
              ) : null}
              <TimelineRow label="Receipt sent" value={lead.receipt_sent_at} />
              <TimelineRow label="Sales notified" value={lead.sales_notified_at} />
              <TimelineRow label="Reviewed" value={lead.reviewed_at} />
              {lead.ai_status !== 'enriched' ? (
                <p className="text-xs text-zinc-500">AI status: {lead.ai_status}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
