import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  new: 'border-border-strong text-foreground-muted',
  queued: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
  qualified: 'border-green-500/40 bg-green-500/15 text-green-300',
  contacted: 'border-blue-500/40 bg-blue-500/15 text-blue-300',
  replied: 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300',
  archived: 'border-border text-foreground-subtle',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status] ?? STATUS_STYLES.new)}>
      {status}
    </Badge>
  );
}

const INTENT_STYLES: Record<string, string> = {
  demo_request: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
  pricing_question: 'border-blue-500/40 bg-blue-500/15 text-blue-300',
  general_inquiry: 'border-border-strong text-foreground-muted',
  job_seeker: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
  spam: 'border-red-500/40 bg-red-500/15 text-red-300',
  other: 'border-border-strong text-foreground-muted',
};

export function IntentBadge({ intent }: { intent: string | null }) {
  if (!intent) return <span className="text-xs text-foreground-subtle">—</span>;
  return (
    <Badge variant="outline" className={cn(INTENT_STYLES[intent] ?? INTENT_STYLES.other)}>
      {intent}
    </Badge>
  );
}

const ROUTING_STYLES: Record<string, string> = {
  auto_reply: 'border-green-500/40 bg-green-500/15 text-green-300',
  human_review: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
  archive: 'border-border text-foreground-subtle',
};

export function RoutingBadge({ decision }: { decision: string | null }) {
  if (!decision) return <span className="text-xs text-foreground-subtle">—</span>;
  return (
    <Badge variant="outline" className={cn(ROUTING_STYLES[decision] ?? ROUTING_STYLES.archive)}>
      {decision}
    </Badge>
  );
}
