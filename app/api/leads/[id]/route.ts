import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/admin-auth';

// PATCH allowlist — only status transitions. Unknown keys are stripped by
// zod, so score/ai columns can never be overwritten through this route.
const PatchSchema = z.object({
  status: z.enum(['contacted', 'replied', 'archived', 'qualified']),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(_req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const db = createAdminClient();
  const { data, error } = await db.from('leads').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('lead detail: fetch failed:', error.message);
    return NextResponse.json({ error: 'Could not fetch lead' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ lead: data });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const { status } = parsed.data;

  const db = createAdminClient();
  const update: { status: string; reviewed_at?: string } = { status };
  if (status === 'contacted' || status === 'replied' || status === 'qualified') {
    update.reviewed_at = new Date().toISOString();
  }
  const { data, error } = await db
    .from('leads')
    .update(update)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) {
    console.error('lead detail: update failed:', error.message);
    return NextResponse.json({ error: 'Could not update lead' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ lead: data });
}
