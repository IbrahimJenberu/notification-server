import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/** Applied globally to all routes. */
export const globalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
  skip: (req) => req.path === '/health',
});

/** Stricter limit for dispatch/retry — these fan out FCM sends. */
export const sendRateLimit = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Send rate limit exceeded. Max 10 dispatch requests per minute.' },
  keyGenerator: (req) => {
    // Rate-limit per authenticated user, not IP, for send endpoints
    const uid = (req as any).uid as string | undefined;
    return uid ?? req.ip ?? 'unknown';
  },
});
