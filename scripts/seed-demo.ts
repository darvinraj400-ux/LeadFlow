// MUST be the first import. This loads .env.local as a side effect,
// before lib/supabase.ts's top-level env guard evaluates.
import './_env';

import { scoreLead, type Extraction } from '../lib/ai/rubric';
import { routeByScore } from '../lib/leads/routing';

// Demo seed (Layer 2). No AI calls: every extraction is pre-baked and the
// score comes from the deterministic scoreLead(). Hand-computed expected
// totals are asserted — if the rubric changes, the seed fails loudly instead
// of silently drifting out of its score bands.
//
// One known rule: intent === 'spam' is a hard override to 0/100, so the
// two spam leads score 0 by construction (not via point summation).

type SeedLead = {
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  message: string;
  extraction: Extraction;
  expectedTotal: number;
};

const LEADS: SeedLead[] = [
  // ---- 5 high-fit (80+) ----
  {
    name: 'Priya Nair',
    email: 'priya@northwindsaas.com',
    company: 'Northwind SaaS',
    role: 'VP Engineering',
    message:
      'We are evaluating analytics vendors for our 200-person engineering org. Budget approved for this quarter — can we get a demo and a quote for annual billing?',
    extraction: {
      company_size: 'mid',
      industry: 'SaaS',
      role: 'VP Engineering',
      intent: 'demo_request',
      budget_signal: 'explicit',
      summary: 'Mid-size SaaS evaluating analytics vendors with approved budget',
      tags: ['demo', 'budget-approved'],
    },
    expectedTotal: 92,
  },
  {
    name: 'Tomas Rivera',
    email: 'tomas@shipfast.dev',
    company: 'Shipfast',
    role: 'CTO',
    message:
      'Our team of 60 builds developer tools and our homegrown dashboard is falling over. We have $30k earmarked — show us what Relay can do next week?',
    extraction: {
      company_size: 'mid',
      industry: 'developer tools',
      role: 'CTO',
      intent: 'demo_request',
      budget_signal: 'explicit',
      summary: 'Mid-size developer tools company requesting a demo with earmarked budget',
      tags: ['demo', 'developer', 'budget-approved'],
    },
    expectedTotal: 92,
  },
  {
    name: 'Amara Okafor',
    email: 'amara@ledgerline.io',
    company: 'Ledgerline',
    role: 'Head of Data',
    message:
      'Fintech with about 800 employees here. We are comparing three analytics platforms and would like a walkthrough focused on audit logging and SSO.',
    extraction: {
      company_size: 'enterprise',
      industry: 'fintech',
      role: 'Head of Data',
      intent: 'demo_request',
      budget_signal: 'implied',
      summary: 'Enterprise fintech comparing vendors and requesting a walkthrough',
      tags: ['enterprise', 'demo', 'fintech'],
    },
    expectedTotal: 91,
  },
  {
    name: 'Jonas Weber',
    email: 'jonas@pipescale.com',
    company: 'Pipescale',
    role: 'Engineering Manager',
    message:
      'We run data infrastructure for around 120 people and need better funnel visibility. Could someone demo the product for our team? We are deciding this half.',
    extraction: {
      company_size: 'mid',
      industry: 'data infrastructure',
      role: 'Engineering Manager',
      intent: 'demo_request',
      budget_signal: 'implied',
      summary: 'Mid-size data infrastructure company requesting a team demo',
      tags: ['demo', 'evaluating'],
    },
    expectedTotal: 83,
  },
  {
    name: 'Sofia Marino',
    email: 'sofia@growthcraft.agency',
    company: 'Growthcraft',
    role: 'Founder',
    message:
      'I run a 500-person performance marketing agency and want Relay for client reporting. Annual contract, ready to sign — please send a demo and pricing.',
    extraction: {
      company_size: 'enterprise',
      industry: 'agency',
      role: 'Founder',
      intent: 'demo_request',
      budget_signal: 'explicit',
      summary: 'Large agency requesting a demo with intent to sign an annual contract',
      tags: ['enterprise', 'demo', 'budget-approved'],
    },
    expectedTotal: 89,
  },
  // ---- 5 mid (40-65) ----
  {
    name: 'Daniel Kim',
    email: 'daniel@brightpath.consulting',
    company: 'Brightpath Consulting',
    role: 'Operations Lead',
    message:
      'Small consulting shop, 15 people. Curious what Relay costs per seat as we grow — any pricing tiers for firms our size?',
    extraction: {
      company_size: 'small',
      industry: 'consulting',
      role: 'Operations Lead',
      intent: 'pricing_question',
      budget_signal: 'implied',
      summary: 'Small consulting firm asking about per-seat pricing tiers',
      tags: ['pricing-sensitive', 'smb'],
    },
    expectedTotal: 57,
  },
  {
    name: 'Fatima Hassan',
    email: 'fatima@medcoreplus.org',
    company: 'Medcore Plus',
    role: 'IT Director',
    message:
      'We are a 90-person healthcare provider looking at analytics options for patient engagement reporting. Still early — gathering information for next year.',
    extraction: {
      company_size: 'mid',
      industry: 'healthcare',
      role: 'IT Director',
      intent: 'general_inquiry',
      budget_signal: 'implied',
      summary: 'Mid-size healthcare provider gathering information for next year',
      tags: ['healthcare', 'early-stage'],
    },
    expectedTotal: 51,
  },
  {
    name: 'Leo Fischer',
    email: 'leo@taskgrid.app',
    company: 'Taskgrid',
    role: 'Founder',
    message:
      'Two of us building B2B software for freelancers. Relay looks interesting — how does it work at a high level?',
    extraction: {
      company_size: 'small',
      industry: 'B2B software',
      role: 'Founder',
      intent: 'general_inquiry',
      budget_signal: 'none',
      summary: 'Small B2B software startup asking how the product works',
      tags: ['startup', 'general'],
    },
    expectedTotal: 49,
  },
  {
    name: 'Grace Adeyemi',
    email: 'grace@paynest.io',
    company: 'Paynest',
    role: null,
    message:
      'What are your plans for a fintech startup processing around $2M monthly? We need pricing before we go further.',
    extraction: {
      company_size: 'unknown',
      industry: 'fintech',
      role: null,
      intent: 'pricing_question',
      budget_signal: 'implied',
      summary: 'Fintech startup of unknown size asking for plan pricing',
      tags: ['pricing-sensitive', 'fintech'],
    },
    expectedTotal: 62,
  },
  {
    name: 'Omar Farouk',
    email: 'omar@souqly.store',
    company: 'Souqly',
    role: 'Owner',
    message: 'Do you offer discounts for online stores? Just checking prices for now.',
    extraction: {
      company_size: 'unknown',
      industry: 'e-commerce',
      role: 'Owner',
      intent: 'pricing_question',
      budget_signal: 'none',
      summary: 'Online store of unknown size checking prices',
      tags: ['pricing-sensitive'],
    },
    expectedTotal: 40,
  },
  // ---- 5 low (10-30) ----
  {
    name: 'Hannah Cole',
    email: 'hannah.cole88@gmail.com',
    company: null,
    role: null,
    message: 'Hi, I run a small restaurant and someone mentioned analytics. What is this?',
    extraction: {
      company_size: 'unknown',
      industry: 'restaurant',
      role: null,
      intent: 'general_inquiry',
      budget_signal: 'none',
      summary: 'Individual asking what the product is',
      tags: ['general'],
    },
    expectedTotal: 24,
  },
  {
    name: 'Kevin Doyle',
    email: 'kevdoyle@yahoo.com',
    company: null,
    role: null,
    message: 'Just me, freelancer. Wondering if Relay could track my invoices somehow?',
    extraction: {
      company_size: 'solo',
      industry: null,
      role: null,
      intent: 'general_inquiry',
      budget_signal: 'none',
      summary: 'Solo freelancer asking about invoice tracking',
      tags: ['general'],
    },
    expectedTotal: 20,
  },
  {
    name: 'Nina Petrova',
    email: 'nina@craftloop.co',
    company: 'Craftloop',
    role: 'Maker',
    message: 'Tiny team of 4 making physical products. Not sure you cover us but thought I would ask what Relay does.',
    extraction: {
      company_size: 'small',
      industry: null,
      role: 'Maker',
      intent: 'other',
      budget_signal: 'none',
      summary: 'Four-person team asking whether the product covers them',
      tags: ['general'],
    },
    expectedTotal: 22,
  },
  {
    name: 'Samuel Mensah',
    email: 's.mensah@tutorbright.org',
    company: 'Tutorbright',
    role: 'Coordinator',
    message:
      'We are a tutoring nonprofit expanding to three cities this year and might need reporting as we hire. Early days, no budget yet.',
    extraction: {
      company_size: 'unknown',
      industry: 'education',
      role: 'Coordinator',
      intent: 'other',
      budget_signal: 'implied',
      summary: 'Education nonprofit expanding with possible future reporting needs',
      tags: ['nonprofit', 'early-stage'],
    },
    expectedTotal: 29,
  },
  {
    name: 'Alex Novak',
    email: 'alex.novak@protonmail.com',
    company: null,
    role: null,
    message: 'Saw an ad. What do you guys do exactly?',
    extraction: {
      company_size: 'solo',
      industry: null,
      role: null,
      intent: 'other',
      budget_signal: 'none',
      summary: 'Individual asking what the company does',
      tags: ['general'],
    },
    expectedTotal: 14,
  },
  // ---- 3 job seekers (~10-15) ----
  {
    name: 'Rachel Green',
    email: 'rachel.green99@gmail.com',
    company: null,
    role: null,
    message:
      'Hi, I am a recent marketing graduate looking for junior roles. Do you have any openings on your growth team?',
    extraction: {
      company_size: 'unknown',
      industry: null,
      role: null,
      intent: 'job_seeker',
      budget_signal: 'none',
      summary: 'Marketing graduate asking about junior openings',
      tags: ['job-seeker'],
    },
    expectedTotal: 12,
  },
  {
    name: 'Vikram Shah',
    email: 'vikram.shah@outlook.com',
    company: null,
    role: 'Store Associate',
    message:
      'I work retail but taught myself Python last year. Hiring any junior developers? Happy to share my GitHub.',
    extraction: {
      company_size: 'solo',
      industry: 'retail',
      role: 'Store Associate',
      intent: 'job_seeker',
      budget_signal: 'none',
      summary: 'Retail worker asking about junior developer openings',
      tags: ['job-seeker', 'developer'],
    },
    expectedTotal: 12,
  },
  {
    name: 'Elena Rodriguez',
    email: 'elena.r.hotel@gmail.com',
    company: null,
    role: 'Front Desk Manager',
    message:
      'Ten years in hospitality management, now looking to switch into tech sales. Any SDR roles going at Relay?',
    extraction: {
      company_size: 'unknown',
      industry: 'hospitality',
      role: 'Front Desk Manager',
      intent: 'job_seeker',
      budget_signal: 'none',
      summary: 'Hospitality manager asking about SDR openings',
      tags: ['job-seeker'],
    },
    expectedTotal: 14,
  },
  // ---- 2 spam (hard override: 0) ----
  {
    name: 'SEO Master',
    email: 'rankup@seoboost-pro.xyz',
    company: null,
    role: null,
    message:
      'Dear sir/madam we offer #1 Google ranking guaranteed in 7 days only $99. Reply YES for free trial backlinks package!!!',
    extraction: {
      company_size: 'solo',
      industry: null,
      role: null,
      intent: 'spam',
      budget_signal: 'none',
      summary: 'SEO services cold pitch',
      tags: ['spam'],
    },
    expectedTotal: 0,
  },
  {
    name: 'Crypto Winner',
    email: 'winner@crypto-giveaway-airdrop.io',
    company: null,
    role: null,
    message:
      'CONGRATULATIONS you have been selected to double your crypto. Send 0.1 BTC to verify wallet and receive 0.2 back instantly.',
    extraction: {
      company_size: 'solo',
      industry: null,
      role: null,
      intent: 'spam',
      budget_signal: 'none',
      summary: 'Crypto doubling-scheme bot message',
      tags: ['spam'],
    },
    expectedTotal: 0,
  },
];

function bandOf(total: number): 'high' | 'mid' | 'low' {
  if (total >= 80) return 'high';
  if (total >= 40) return 'mid';
  return 'low';
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');

  // Score every lead deterministically and assert the hand-computed totals.
  // Reference codes derive their date part from each row's staggered
  // created_at so code and timestamp never disagree.
  const rows = LEADS.map((lead, i) => {
    const breakdown = scoreLead(lead.extraction);
    if (breakdown.total !== lead.expectedTotal) {
      throw new Error(
        `Rubric drift for "${lead.name}": expected ${lead.expectedTotal}, got ${breakdown.total}. ` +
          `Update expectedTotal or fix the rubric.`,
      );
    }
    // Same routing the live pipeline applies — demo rows land routed.
    const { status, routing_decision } = routeByScore(breakdown.total);
    const date = new Date(Date.now() - i * 11 * 3600 * 1000);
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
    return {
      reference_code: `LF-${yyyymmdd}-${String(i + 1).padStart(4, '0')}`,
      email: lead.email,
      name: lead.name,
      company: lead.company,
      role: lead.role,
      message: lead.message,
      source: 'form',
      // Stagger creation over the last ~9 days so the dashboard has variety.
      created_at: date.toISOString(),
      ai_status: 'enriched',
      ai_summary: lead.extraction.summary,
      ai_intent: lead.extraction.intent,
      ai_tags: lead.extraction.tags,
      extracted_company_size: lead.extraction.company_size,
      extracted_industry: lead.extraction.industry,
      extracted_role: lead.extraction.role,
      extracted_budget_signal: lead.extraction.budget_signal,
      score_company_fit: breakdown.company_fit,
      score_industry_fit: breakdown.industry_fit,
      score_intent_clarity: breakdown.intent_clarity,
      score_budget_signal: breakdown.budget_signal,
      score_total: breakdown.total,
      status,
      routing_decision,
    };
  });

  const histogram = { high: 0, mid: 0, low: 0 };
  for (const r of rows) histogram[bandOf(r.score_total)] += 1;
  if (histogram.high !== 5 || histogram.mid !== 5 || histogram.low !== 10) {
    throw new Error(
      `Seed band drift: expected high=5/mid=5/low=10, got ` +
        `high=${histogram.high}/mid=${histogram.mid}/low=${histogram.low}.`,
    );
  }

  if (dryRun) {
    console.log(`Dry run — ${rows.length} rows, nothing inserted.`);
    for (const r of rows) {
      console.log(
        `  ${r.reference_code}  ${r.name} <${r.email}>  score=${r.score_total} (${bandOf(r.score_total)})`,
      );
    }
    console.log(
      `Bands: high=${histogram.high} mid=${histogram.mid} low=${histogram.low}`,
    );
    return;
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or ' +
        'SUPABASE_SERVICE_ROLE_KEY in .env.local. Fill them in, or run with ' +
        '--dry-run to preview without inserting. (The anon key is required ' +
        'because lib/supabase.ts validates it at import time.)',
    );
  }
  // lib/supabase.ts validates env at import time, so it is imported lazily
  // here — after the guard above — keeping --dry-run fully offline.
  const { createAdminClient } = await import('../lib/supabase');
  const supabase = createAdminClient();

  console.log(`Seeding ${rows.length} leads...`);

  // Wipe existing rows (Supabase requires a filter on delete)
  const { error: delError } = await supabase
    .from('leads')
    .delete()
    .not('id', 'is', null);
  if (delError) throw new Error(`Delete failed: ${delError.message}`);

  const { error: insError } = await supabase.from('leads').insert(rows);
  if (insError) throw new Error(`Insert failed: ${insError.message}`);

  const { data, error: selError } = await supabase
    .from('leads')
    .select('score_total');
  if (selError) throw new Error(`Stats query failed: ${selError.message}`);
  if (!data || data.length === 0) {
    throw new Error(
      'Stats query returned 0 rows after insert — insert may have failed silently.',
    );
  }
  const rawTotals = (data as { score_total: number | null }[]).map(
    (d) => d.score_total,
  );
  const nullCount = rawTotals.filter((t) => t === null).length;
  if (nullCount > 0) {
    throw new Error(
      `${nullCount} inserted row(s) have null score_total — scores must always be set.`,
    );
  }
  const totals = rawTotals as number[];
  const sum = totals.reduce((a, b) => a + b, 0);
  console.log(
    `Inserted ${totals.length} rows. ` +
      `min=${Math.min(...totals)} max=${Math.max(...totals)} ` +
      `avg=${Math.round(sum / totals.length)}. ` +
      `Bands: high=${histogram.high} mid=${histogram.mid} low=${histogram.low}.`,
  );
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
