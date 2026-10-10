'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ACTIONS = [
  { status: 'contacted', label: 'Mark as contacted' },
  { status: 'replied', label: 'Mark as replied' },
  { status: 'qualified', label: 'Mark as qualified' },
  { status: 'archived', label: 'Archive' },
] as const;

export function LeadActions({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(status: string) {
    if (busy) return;
    setBusy(status);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        toast.error('Could not update status.');
        return;
      }
      toast.success(`Status → ${status}.`);
      router.refresh();
    } catch {
      toast.error('Could not update status.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {ACTIONS.map((a) => {
        const current = currentStatus === a.status;
        const loading = busy === a.status;
        return (
          <Button
            key={a.status}
            type="button"
            variant="outline"
            size="sm"
            disabled={current || busy !== null}
            onClick={() => act(a.status)}
            className={cn(
              'justify-start rounded-[8px] border-border-strong text-foreground-muted hover:bg-surface-hover hover:text-foreground',
              current && 'border-accent/50 text-accent',
            )}
          >
            {loading ? 'Saving…' : current ? `✓ ${a.label}` : a.label}
          </Button>
        );
      })}
    </div>
  );
}
