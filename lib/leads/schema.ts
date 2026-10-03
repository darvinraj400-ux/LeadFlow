import { z } from 'zod';

// Shared lead-submission contract — single source of truth for the public
// form (client pre-check) and POST /api/leads (server enforcement; the
// server is authoritative). Limits mirror the spec; messages below stay
// generic so validation responses never leak schema details.
export const leadFormSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  company: z.string().trim().max(200).nullish(),
  role: z.string().trim().max(100).nullish(),
  message: z.string().trim().min(10).max(2000),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

// Maps a ZodError to per-field generic messages (no min/max values, no
// regexes, no received values). First issue per field wins.
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (fields[key]) continue;
    switch (issue.code) {
      case 'invalid_type':
        fields[key] =
          (issue as { received?: string }).received === 'undefined'
            ? 'Required'
            : 'Invalid value';
        break;
      case 'too_small':
        fields[key] = 'Too short';
        break;
      case 'too_big':
        fields[key] = 'Too long';
        break;
      case 'invalid_format':
        fields[key] = 'Invalid email';
        break;
      default:
        fields[key] = 'Invalid value';
    }
  }
  return fields;
}
