import { Resend } from 'resend';
import { escapeHtml } from '@/lib/email/escape-html';

// Internal sales notification — fixed template, best-effort. Returns false
// (never throws) so email failure can't affect the lead pipeline.

// TODO: replace with a verified sending domain for production.
const FROM_ADDRESS = 'Relay <onboarding@resend.dev>';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_CONFIGURED =
  !!RESEND_API_KEY && RESEND_API_KEY.startsWith('re_');

if (!RESEND_CONFIGURED || !process.env.SALES_EMAIL) {
  console.warn(
    'notify-sales: RESEND_API_KEY or SALES_EMAIL missing — sales notifications will no-op.',
  );
}

export async function notifySales(lead: {
  id: string;
  reference_code: string;
  email: string;
  name: string;
  company: string | null;
  score_total: number;
  ai_summary: string | null;
  routing_decision: string | null;
}): Promise<boolean> {
  const salesEmail = process.env.SALES_EMAIL;
  if (!RESEND_CONFIGURED || !salesEmail) return false;
  try {
    const resend = new Resend(RESEND_API_KEY!);
    const hot = lead.routing_decision === 'auto_reply';
    // Subject values are lead-controlled: strip line breaks (Resend takes
    // fields as JSON, not raw SMTP headers, but a broken line is still noise).
    const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ');
    const subject = `[Relay] ${hot ? '🔥' : '🟡'} ${oneLine(lead.company || lead.name)} — score ${lead.score_total}`;
    // Never derive the link from the request host (Host-header poisoning).
    // APP_URL is allowlisted config; omit the line entirely if unset.
    let adminUrl: string | null = null;
    const appUrl = process.env.APP_URL;
    if (appUrl) {
      try {
        adminUrl = new URL(`/admin/leads/${lead.id}`, appUrl).toString();
      } catch {
        console.error('notify-sales: invalid APP_URL, omitting admin link');
      }
    }
    const lines = [
      `New ${hot ? 'hot' : 'review-needed'} lead: ${lead.name} (${lead.email})`,
      `Company: ${lead.company ?? '(none given)'}`,
      `Reference: ${lead.reference_code}`,
      `Score: ${lead.score_total}/100`,
      `Routing: ${lead.routing_decision ?? '(unset)'}`,
      `Summary: ${lead.ai_summary ?? '(none)'}`,
    ];
    if (adminUrl) lines.push(`Review: ${adminUrl}`);
    const text = lines.join('\n');
    const html = lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('\n');
    // NOTE: resend.emails.send resolves (does not throw) on API errors,
    // returning { data, error } — so check error explicitly.
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: salesEmail,
      subject,
      text,
      html,
    });
    if (error) {
      console.error('notify-sales: send failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('notify-sales: send failed:', err);
    return false;
  }
}
