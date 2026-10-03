import { ScoreBreakdown } from "@/components/admin/ScoreBreakdown";

// Layer 1 stub — lead detail with score breakdown lands in a later layer.
export function LeadDetail({ id }: { id: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Lead detail stub ({id}) — fields and actions land in a later layer.
      </p>
      <ScoreBreakdown />
    </div>
  );
}
