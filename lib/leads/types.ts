// Row shape for the `leads` table (see docs/schema.sql). Supabase-js is
// untyped here, so admin reads cast to this. Nullable columns stay null
// (never undefined) to match PostgREST payloads.
export type Lead = {
  id: string;
  reference_code: string;
  email: string;
  name: string;
  company: string | null;
  role: string | null;
  message: string;
  source: string;
  created_at: string;
  updated_at: string;
  ai_status: 'pending' | 'enriched' | 'failed';
  ai_summary: string | null;
  ai_intent: string | null;
  ai_tags: string[] | null;
  extracted_company_size: string | null;
  extracted_industry: string | null;
  extracted_role: string | null;
  extracted_budget_signal: string | null;
  score_company_fit: number | null;
  score_industry_fit: number | null;
  score_intent_clarity: number | null;
  score_budget_signal: number | null;
  score_total: number | null;
  status: string;
  routing_decision: string | null;
  receipt_sent_at: string | null;
  sales_notified_at: string | null;
  reviewed_at: string | null;
};
