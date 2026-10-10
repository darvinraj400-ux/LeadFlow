import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createAdminClient } from '@/lib/supabase';
import { formatDateTime, scoreColorClass } from '@/lib/format';
import { IntentBadge, RoutingBadge, StatusBadge } from '@/components/admin/StatusBadge';
import { ScoreReveal } from '@/components/admin/ScoreReveal';
import { LeadActions } from '@/components/admin/LeadActions';
import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/leads/types';

function TimelineRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-foreground-subtle">{label}</span>
      <span className="text-foreground">{formatDateTime(value)}</span>
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
      <h1 className="font-mono text-lg text-foreground-muted">{lead.reference_code}</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="glass-score rounded-lg">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-foreground">{lead.name}</p>
                  <p className="text-sm text-foreground-muted">{lead.email}</p>
                  {[lead.company, lead.role].filter(Boolean).length > 0 ? (
                    <p className="mt-1 text-sm text-foreground-subtle">
                      {[lead.company, lead.role].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-foreground-subtle">
                    Submitted {formatDateTime(lead.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={lead.status} />
                  <p className={cn('font-mono text-5xl font-bold', scoreColorClass(lead.score_total))}>
                    {lead.score_total ?? '—'}
                    <span className="text-lg text-foreground-subtle">/100</span>
                  </p>
                </div>
              </div>
              {lead.ai_summary ? (
                <p className="border-t border-border pt-4 text-sm leading-relaxed text-foreground">
                  {lead.ai_summary}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border bg-surface rounded-lg shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-foreground">Score breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreReveal
                company_fit={lead.score_company_fit}
                industry_fit={lead.score_industry_fit}
                intent_clarity={lead.score_intent_clarity}
                budget_signal={lead.score_budget_signal}
                total={lead.score_total}
              />
            </CardContent>
          </Card>

          <Card className="border-border bg-surface rounded-lg shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-foreground">Message</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <blockquote className="rounded-lg border border-border bg-background p-4 text-sm leading-relaxed text-foreground">
                {lead.message}
              </blockquote>
              <p className="text-xs text-foreground-subtle">
                Submitted by {lead.name} &lt;{lead.email}&gt;
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface rounded-lg shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-foreground">AI extraction</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {extractionRows.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 text-sm">
                    <dt className="text-foreground-subtle">{k}</dt>
                    <dd className="font-mono text-xs text-foreground">{v ?? '—'}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 text-sm">
                  <dt className="text-foreground-subtle">Intent</dt>
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
                      className="border-border-strong font-mono text-[11px] text-foreground"
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
          <Card className="border-border bg-surface rounded-lg shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-foreground">Routing</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-subtle">Status</span>
                <StatusBadge status={lead.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-subtle">Decision</span>
                <RoutingBadge decision={lead.routing_decision} />
              </div>
              <p className="border-t border-border pt-3 text-xs text-foreground-subtle">
                {routingNote}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface rounded-lg shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-foreground">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadActions leadId={lead.id} currentStatus={lead.status} />
            </CardContent>
          </Card>

          <Card className="border-border bg-surface rounded-lg shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-foreground">Timeline</CardTitle>
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
                <p className="text-xs text-foreground-subtle">AI status: {lead.ai_status}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
