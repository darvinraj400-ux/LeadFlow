// Score → routing map. Single source of truth shared by the live
// enrichment path (app/api/leads/route.ts) and the seed script, so demo
// data routes exactly the way production rows do.
export type LeadRouting = {
  status: 'qualified' | 'queued' | 'archived';
  routing_decision: 'auto_reply' | 'human_review' | 'archive';
};

export function routeByScore(total: number): LeadRouting {
  if (total >= 70) return { status: 'qualified', routing_decision: 'auto_reply' };
  if (total >= 30) return { status: 'queued', routing_decision: 'human_review' };
  return { status: 'archived', routing_decision: 'archive' };
}
