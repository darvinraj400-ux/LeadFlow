// Static score breakdown — the differentiator. Values are read from the
// DB (never recomputed here): the rubric already ran during enrichment.
const ROWS = [
  { label: 'Company fit', key: 'company_fit', max: 30 },
  { label: 'Industry fit', key: 'industry_fit', max: 25 },
  { label: 'Intent clarity', key: 'intent_clarity', max: 25 },
  { label: 'Budget signal', key: 'budget_signal', max: 20 },
] as const;

export function ScoreBreakdown({
  company_fit,
  industry_fit,
  intent_clarity,
  budget_signal,
  total,
}: {
  company_fit: number | null;
  industry_fit: number | null;
  intent_clarity: number | null;
  budget_signal: number | null;
  total: number | null;
}) {
  const values: Record<(typeof ROWS)[number]['key'], number | null> = {
    company_fit,
    industry_fit,
    intent_clarity,
    budget_signal,
  };
  if (total === null) {
    return (
      <p className="text-sm text-zinc-400">
        Not scored yet — enrichment is still pending.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {ROWS.map((row) => {
        const value = values[row.key] ?? 0;
        return (
          <div
            key={row.key}
            className="grid grid-cols-[120px_1fr_80px] items-center gap-3"
          >
            <span className="text-sm text-zinc-400">{row.label}</span>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${Math.round((value / row.max) * 100)}%` }}
              />
            </div>
            <span className="text-right font-mono text-xs text-zinc-300">
              {value} / {row.max}
            </span>
          </div>
        );
      })}
      <div className="grid grid-cols-[120px_1fr_80px] items-center gap-3 border-t border-zinc-800 pt-3">
        <span className="text-sm font-medium text-zinc-200">Total</span>
        <span />
        <span className="text-right font-mono text-sm font-bold text-zinc-100">
          {total} / 100
        </span>
      </div>
      <p className="text-xs leading-relaxed text-zinc-500">
        Weights are fixed: company 30, industry 25, intent 25, budget 20. AI
        classifies; rubric scores deterministically.
      </p>
    </div>
  );
}
