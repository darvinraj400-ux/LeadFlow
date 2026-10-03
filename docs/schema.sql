-- LeadFlow — source of truth for the Supabase schema (Layer 2).
--
-- How to apply: paste this file into the Supabase SQL editor and run it
-- ONCE on a fresh project. Re-running requires dropping the table first;
-- only the DROP TRIGGER below is re-runnable (it covers function/trigger
-- iteration during development).
--
-- Enum discipline: the check-constraint literals below must stay identical
-- to the unions in lib/ai/rubric.ts (Extraction type) and
-- lib/ai/extract.ts (extractionSchema). Changing an enum means touching
-- all three files — there is no automated cross-check against SQL.
--
-- Access model: every read/write goes through the service_role key on the
-- server (see lib/supabase.ts createAdminClient). The public form inserts
-- via a server route; the admin dashboard reads via server routes.
--
-- RLS is ENABLED below with INTENTIONALLY ZERO policies: the anon key gets
-- no access at all. Do not add policies unless a future layer introduces a
-- client-side (anon-key) read path.

create table leads (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  email text not null,
  name text not null,
  company text,
  role text,
  message text not null,
  source text not null default 'form',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- AI enrichment (populated after extraction)
  ai_status text not null default 'pending'
    check (ai_status in ('pending', 'enriched', 'failed')),
  ai_summary text,
  ai_intent text
    check (ai_intent in ('demo_request', 'pricing_question', 'general_inquiry', 'job_seeker', 'spam', 'other')),
  ai_tags text[] default '{}',

  -- Extracted categories (deterministic inputs to scoring)
  extracted_company_size text
    check (extracted_company_size in ('solo', 'small', 'mid', 'enterprise', 'unknown')),
  extracted_industry text,
  extracted_role text,
  extracted_budget_signal text
    check (extracted_budget_signal in ('explicit', 'implied', 'none')),

  -- Rubric sub-scores
  score_company_fit int,
  score_industry_fit int,
  score_intent_clarity int,
  score_budget_signal int,
  score_total int,

  -- Routing
  status text not null default 'new'
    check (status in ('new', 'queued', 'qualified', 'contacted', 'replied', 'archived')),
  routing_decision text
    check (routing_decision in ('auto_reply', 'human_review', 'archive')),

  -- Action timestamps
  receipt_sent_at timestamptz,
  sales_notified_at timestamptz,
  reviewed_at timestamptz
);

create index leads_status_idx on leads(status);
create index leads_created_at_idx on leads(created_at desc);
create index leads_score_total_idx on leads(score_total desc nulls last);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_updated_at on leads;

create trigger leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- RLS on, zero policies: service_role bypasses RLS; anon gets nothing.
alter table leads enable row level security;
