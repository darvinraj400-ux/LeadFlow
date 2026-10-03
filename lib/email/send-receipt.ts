import { Resend } from 'resend';
import { escapeHtml } from '@/lib/email/escape-html';

// Fixed-template receipt. Deliberate design decision: the AI's output is
// internal — the lead sees a clean receipt with no AI-generated text and no
// mention of automated analysis.

// TODO: replace with a verified sending domain for production.
const FROM_ADDRESS = 'Relay <onboarding@resend.dev>';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_CONFIGURED =
  !!RESEND_API_KEY && RESEND_API_KEY.startsWith('re_');

if (!RESEND_CONFIGURED) {
  console.warn(
    'send-receipt: RESEND_API_KEY missing or placeholder — receipt emails will no-op.',
  );
}

export async function sendReceiptEmail(
  to: string,
  referenceCode: string,
  name: string,
): Promise<boolean> {
  if (!RESEND_CONFIGURED) return false;
  try {
    const resend = new Resend(RESEND_API_KEY!);
    const subject = `We received your message — ref ${referenceCode}`;
    const text = [
      `Hi ${name},`,
      '',
      `Thanks for reaching out to Relay. Your reference number is ${referenceCode}.`,
      '',
      'A member of our team will get back to you within one business day.',
      '',
      '— The Relay team',
      '',
      'This is an automated confirmation. Replies to this address are monitored.',
    ].join('\n');
    const html = [
      `<p>Hi ${escapeHtml(name)},</p>`,
      `<p>Thanks for reaching out to Relay. Your reference number is <strong>${escapeHtml(referenceCode)}</strong>.</p>`,
      `<p>A member of our team will get back to you within one business day.</p>`,
      `<p>— The Relay team</p>`,
      `<p><small>This is an automated confirmation. Replies to this address are monitored.</small></p>`,
    ].join('\n');
    // NOTE: resend.emails.send resolves (does not throw) on API errors,
    // returning { data, error } — so check error explicitly.
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      text,
      html,
    });
    if (error) {
      console.error('send-receipt: send failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('send-receipt: send failed:', err);
    return false;
  }
}
