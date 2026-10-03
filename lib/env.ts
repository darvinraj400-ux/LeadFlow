import { z } from 'zod';

// Zod-validated env. Fails fast at import time with a clear error listing
// every missing key, so misconfiguration surfaces during boot, not mid-request.
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  SALES_EMAIL: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  APP_URL: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (parsed.success) return parsed.data;
  const missing = parsed.error.issues
    .map((issue) => issue.path.join('.'))
    .join(', ');
  throw new Error(
    `Missing or invalid environment variables: ${missing}. ` +
      `Copy .env.example to .env.local and fill in every value.`
  );
}

export const env = loadEnv();
