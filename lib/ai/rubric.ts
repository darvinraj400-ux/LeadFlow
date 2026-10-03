// Lead qualification rubric (Layer 2).
//
// Design: the AI's job is classification, not scoring. It returns discrete
// categories (company size, industry, intent type, budget signal) and this
// pure, dependency-free function maps them to points with fixed weights.
// The final score is deterministic given the extraction — no black-box
// "AI decides 78/100".
//
// This module has zero imports so it stays trivially testable and safe to
// run anywhere (server, seed script, future tests).

export const TARGET_INDUSTRIES = Object.freeze([
  'saas',
  'b2b software',
  'developer tools',
  'fintech',
  'data infrastructure',
] as const);

export const ADJACENT_INDUSTRIES = Object.freeze([
  'b2b services',
  'consulting',
  'agency',
  'e-commerce',
  'marketplace',
] as const);

export type Extraction = {
  company_size: 'solo' | 'small' | 'mid' | 'enterprise' | 'unknown';
  industry: string | null;
  role: string | null;
  intent:
    | 'demo_request'
    | 'pricing_question'
    | 'general_inquiry'
    | 'job_seeker'
    | 'spam'
    | 'other';
  budget_signal: 'explicit' | 'implied' | 'none';
  summary: string;
  tags: string[];
};

export type ScoreBreakdown = {
  company_fit: number; // 0-30
  industry_fit: number; // 0-25
  intent_clarity: number; // 0-25
  budget_signal: number; // 0-20
  total: number; // 0-100
  weights: {
    company_fit: 30;
    industry_fit: 25;
    intent_clarity: 25;
    budget_signal: 20;
  };
};

const COMPANY_FIT: Record<string, number | undefined> = {
  solo: 4,
  small: 12,
  mid: 22,
  enterprise: 30,
  unknown: 6,
};

const INTENT_CLARITY: Record<string, number | undefined> = {
  demo_request: 25,
  pricing_question: 20,
  general_inquiry: 12,
  other: 6,
  job_seeker: 2,
  spam: 0,
};

const BUDGET_SIGNAL: Record<string, number | undefined> = {
  explicit: 20,
  implied: 11,
  none: 0,
};

// Lookups throw on unknown values instead of producing NaN totals, which
// would silently corrupt inserts (NaN serializes to null).
function scoreField(
  table: Record<string, number | undefined>,
  field: string,
  value: string,
): number {
  const score = table[value];
  if (score === undefined) {
    throw new Error(`scoreLead: unknown ${field} ${JSON.stringify(value)}`);
  }
  return score;
}

function scoreIndustryFit(industry: string | null): number {
  if (industry === null || industry.trim() === '') return 4;
  const normalized = industry.toLowerCase();
  if (TARGET_INDUSTRIES.some((t) => normalized.includes(t))) return 25;
  if (ADJACENT_INDUSTRIES.some((a) => normalized.includes(a))) return 14;
  return 6;
}

export function scoreLead(e: Extraction): ScoreBreakdown {
  // Spam is a hard override, not a point deduction. Routing treats 0 as
  // definitive; sub-scores are still returned for UI consistency.
  if (e.intent === 'spam') {
    return {
      company_fit: 0,
      industry_fit: 0,
      intent_clarity: 0,
      budget_signal: 0,
      total: 0,
      weights: { company_fit: 30, industry_fit: 25, intent_clarity: 25, budget_signal: 20 },
    };
  }
  const company_fit = scoreField(COMPANY_FIT, 'company_size', e.company_size);
  const industry_fit = scoreIndustryFit(e.industry);
  const intent_clarity = scoreField(INTENT_CLARITY, 'intent', e.intent);
  const budget_signal = scoreField(BUDGET_SIGNAL, 'budget_signal', e.budget_signal);
  return {
    company_fit,
    industry_fit,
    intent_clarity,
    budget_signal,
    total: company_fit + industry_fit + intent_clarity + budget_signal,
    weights: {
      company_fit: 30,
      industry_fit: 25,
      intent_clarity: 25,
      budget_signal: 20,
    },
  };
}
