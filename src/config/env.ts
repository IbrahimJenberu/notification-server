import { z } from 'zod';

const envSchema = z.object({
  // Firebase
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

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
