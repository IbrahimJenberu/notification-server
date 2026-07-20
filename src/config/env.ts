import { z } from 'zod';

const envSchema = z.object({
  // Firebase
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  // Individual credential fields (alternative to FIREBASE_SERVICE_ACCOUNT_JSON)
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // Server
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:8081'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(60),

  // Expo
  EXPO_ACCESS_TOKEN: z.string().optional(),

  // Scheduler
  SCHEDULER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(60_000),

  // Delivery
  SEND_CONCURRENCY: z.coerce.number().int().min(1).max(10).default(3),
  MAX_CHUNK_RETRIES: z.coerce.number().int().min(1).max(10).default(3),
  RETRY_BASE_DELAY_MS: z.coerce.number().int().positive().default(2_000),

  // SMTP (Brevo) — used as fallback env var names
  SMTP_HOST:       z.string().optional(),
  SMTP_PORT:       z.coerce.number().int().positive().optional(),
  SMTP_USER:       z.string().optional(),
  SMTP_PASS:       z.string().optional(),
  EMAIL_FROM:      z.string().optional(),
  EMAIL_FROM_NAME: z.string().optional(),
  APP_NAME:        z.string().optional(),
  APP_URL:         z.string().optional(),
  // Brevo HTTP API key (preferred over SMTP — works on Render free tier)
  BREVO_API_KEY:   z.string().optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.errors.map(e => `  ${e.path.join('.')}: ${e.message}`).join('\n');
    throw new Error(`[SnapInfo NotificationServer] Invalid environment configuration:\n${missing}`);
  }
  return parsed.data;
}

export const env = loadEnv();
export type Env = typeof env;
