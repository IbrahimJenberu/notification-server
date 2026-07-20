"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    // Firebase
    FIREBASE_PROJECT_ID: zod_1.z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
    FIREBASE_SERVICE_ACCOUNT_JSON: zod_1.z.string().optional(),
    GOOGLE_APPLICATION_CREDENTIALS: zod_1.z.string().optional(),
    // Individual credential fields (alternative to FIREBASE_SERVICE_ACCOUNT_JSON)
    FIREBASE_CLIENT_EMAIL: zod_1.z.string().optional(),
    FIREBASE_PRIVATE_KEY: zod_1.z.string().optional(),
    // Server
    PORT: zod_1.z.coerce.number().int().positive().default(3001),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('production'),
    // CORS
    ALLOWED_ORIGINS: zod_1.z.string().default('http://localhost:8081'),
    // Rate limiting
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.coerce.number().int().positive().default(60),
    // Expo
    EXPO_ACCESS_TOKEN: zod_1.z.string().optional(),
    // Scheduler
    SCHEDULER_POLL_INTERVAL_MS: zod_1.z.coerce.number().int().positive().default(60_000),
    // Delivery
    SEND_CONCURRENCY: zod_1.z.coerce.number().int().min(1).max(10).default(3),
    MAX_CHUNK_RETRIES: zod_1.z.coerce.number().int().min(1).max(10).default(3),
    RETRY_BASE_DELAY_MS: zod_1.z.coerce.number().int().positive().default(2_000),
    // SMTP (Brevo)
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().int().positive().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().optional(),
    EMAIL_FROM_NAME: zod_1.z.string().optional(),
    APP_NAME: zod_1.z.string().optional(),
    APP_URL: zod_1.z.string().optional(),
});
function loadEnv() {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        const missing = parsed.error.errors.map(e => `  ${e.path.join('.')}: ${e.message}`).join('\n');
        throw new Error(`[SnapInfo NotificationServer] Invalid environment configuration:\n${missing}`);
    }
    return parsed.data;
}
exports.env = loadEnv();
//# sourceMappingURL=env.js.map