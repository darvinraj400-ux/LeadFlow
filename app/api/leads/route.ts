import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { createAdminClient } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/admin-auth';
import { extractLead } from '@/lib/ai/extract';
import { scoreLead } from '@/lib/ai/rubric';
import { leadFormSchema, toFieldErrors } from '@/lib/leads/schema';
import { routeByScore } from '@/lib/leads/routing';
import { sendReceiptEmail } from '@/lib/email/send-receipt';
import { notifySales } from '@/lib/email/notify-sales';

// Groq enrichment takes 1-3s after the response; give the function room
// on Vercel (Hobby ceiling is 60s).
export const maxDuration = 30;

// In-memory rate limit: 5 submissions per IP per 10 minutes. Not
// distributed and resets on cold start — accepted limitation for v1.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitHits = new Map<string, number[]>();

function getClientIp(req: Request): string {
  // X-Forwarded-For is client-controlled on the left: a sender can prepend
  // arbitrary entries. The entry our edge appends is the rightmost, so the
  // last entry is the hardest to spoof. Direct (proxiless) requests share
  // the 'unknown' bucket — still limited, just collectively.
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const entries = forwarded
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const last = entries[entries.length - 1];
    if (last) return last;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

const RATE_LIMIT_MAP_CAP = 5000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  // Opportunistic eviction: entries are otherwise only pruned on re-access,
  // so a flood of unique (spoofed) IPs would grow the map without bound.
  if (rateLimitHits.size > RATE_LIMIT_MAP_CAP) {
    for (const [key, times] of rateLimitHits) {
      if (times.every((t) => t <= windowStart)) rateLimitHits.delete(key);
    }
  }
  const hits = (rateLimitHits.get(ip) ?? []).filter((t) => t > windowStart);
  if (hits.length === 0) {
    rateLimitHits.delete(ip);
  } else {
    rateLimitHits.set(ip, hits);
  }
  if (hits.length >= RATE_LIMIT_MAX) {
    return true;
  }
  rateLimitHits.set(ip, [...hits, now]);
  return false;
}

// Background enrichment: runs after the response is sent. Never throws —
// failures mark the row ai_status='failed' and leave status='new' for a
// later retry or manual review. Email failures only skip timestamps; they
// never flip ai_status to failed.
async function runEnrichment(id: string): Promise<void> {
  const db = createAdminClient();
  try {
    const { data: lead, error: selError } = await db
      .from('leads')
      .select('id, reference_code, email, name, company, role, message')
      .eq('id', id)
      .maybeSingle();
    if (selError || !lead) {
      console.error('enrichment: lead lookup failed:', selError?.message ?? 'not found');
      return;
    }

    let extraction;
    let scores;
    try {
      extraction = await extractLead({
        name: lead.name,
        email: lead.email,
        company: lead.company ?? undefined,
        role: lead.role ?? undefined,
        message: lead.message,
      });
      // scoreLead throws on unknown enum values (model drift) — that must
      // also mark the row failed, not leave it pending forever.
      scores = scoreLead(extraction);
    } catch (err) {
      console.error('enrichment: extraction/scoring failed:', err);
      await db.from('leads').update({ ai_status: 'failed' }).eq('id', id);
      return;
    }
    // Shared with the seed script — demo rows route exactly like live ones.
    const { status, routing_decision } = routeByScore(scores.total);

    const { error: updError } = await db
      .from('leads')
      .update({
        ai_status: 'enriched',
        ai_summary: extraction.summary,
        ai_intent: extraction.intent,
        ai_tags: extraction.tags,
        extracted_company_size: extraction.company_size,
        extracted_industry: extraction.industry,
        extracted_role: extraction.role,
        extracted_budget_signal: extraction.budget_signal,
        score_company_fit: scores.company_fit,
        score_industry_fit: scores.industry_fit,
        score_intent_clarity: scores.intent_clarity,
        score_budget_signal: scores.budget_signal,
        score_total: scores.total,
        routing_decision,
        status,
      })
      .eq('id', id);
    if (updError) {
      console.error('enrichment: score update failed:', updError.message);
      await db.from('leads').update({ ai_status: 'failed' }).eq('id', id);
      return;
    }

    if (routing_decision === 'auto_reply' || routing_decision === 'human_review') {
      const receiptSent = await sendReceiptEmail(
        lead.email,
        lead.reference_code,
        lead.name,
      );
      if (receiptSent) {
        const { error: tsError } = await db
          .from('leads')
          .update({ receipt_sent_at: new Date().toISOString() })
          .eq('id', id);
        if (tsError) console.error('enrichment: receipt timestamp failed:', tsError.message);
      }
      const salesNotified = await notifySales({
        id: lead.id,
        reference_code: lead.reference_code,
        email: lead.email,
        name: lead.name,
        company: lead.company,
        score_total: scores.total,
        ai_summary: extraction.summary,
        routing_decision,
      });
      if (salesNotified) {
        const { error: tsError } = await db
          .from('leads')
          .update({ sales_notified_at: new Date().toISOString() })
          .eq('id', id);
        if (tsError) console.error('enrichment: sales timestamp failed:', tsError.message);
      }
    }
  } catch (err) {
    console.error('enrichment failed', err);
  }
}

// POST /api/leads — public entry. No auth.
export async function POST(req: Request) {
  if (isRateLimited(getClientIp(req))) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = leadFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid submission', fields: toFieldErrors(parsed.error) },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const db = createAdminClient();

  // Daily counter reference code. Racy under concurrent inserts (two
  // requests can compute the same count) — accepted for this demo; the
  // unique constraint turns a collision into a 500, not silent dupes.
  const today = new Date().toISOString().slice(0, 10);
  const { count, error: countError } = await db
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00.000Z`);
  if (countError || count === null) {
    console.error('leads: reference-code count failed:', countError?.message);
    return NextResponse.json(
      { error: 'Could not create lead' },
      { status: 500 },
    );
  }
  const reference_code = `LF-${today.replace(/-/g, '')}-${String(count + 1).padStart(4, '0')}`;

  const { data, error: insError } = await db
    .from('leads')
    .insert({
      reference_code,
      email: input.email,
      name: input.name,
      company: input.company || null,
      role: input.role || null,
      message: input.message,
      source: 'form',
      status: 'new',
      ai_status: 'pending',
    })
    .select('id')
    .single();
  if (insError || !data) {
    console.error('leads: insert failed:', insError?.message);
    return NextResponse.json(
      { error: 'Could not create lead' },
      { status: 500 },
    );
  }

  // Respond first — enrichment must not hold up the response. waitUntil
  // extends the serverless lifetime until the promise settles; a bare
  // floating promise would be frozen (and killed) on Vercel after send.
  waitUntil(
    runEnrichment(data.id).catch((err) => {
      console.error('enrichment failed', err);
    }),
  );
  return NextResponse.json({ ok: true, reference_code });
}

const LIST_STATUSES = [
  'new',
  'queued',
  'qualified',
  'contacted',
  'replied',
  'archived',
] as const;

function parsePositiveInt(value: string | null, fallback: number): number {
  // Strict: no parseInt prefixes ("50abc" → 50) or hex ("0x10").
  if (value === null || !/^\d+$/.test(value)) return fallback;
  return Number.parseInt(value, 10);
}

// GET /api/leads — admin only.
export async function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const status = params.get('status');
  if (
    status !== null &&
    !(LIST_STATUSES as readonly string[]).includes(status)
  ) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
  }
  const limit = Math.min(
    Math.max(parsePositiveInt(params.get('limit'), 50), 1),
    200,
  );
  const offset = Math.max(parsePositiveInt(params.get('offset'), 0), 0);

  const db = createAdminClient();
  let query = db
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (status !== null) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) {
    console.error('leads: list failed:', error.message);
    return NextResponse.json({ error: 'Could not list leads' }, { status: 500 });
  }
  return NextResponse.json({ leads: data, total: count ?? 0, limit, offset });
}
