import { Router } from 'express';
import { getDb } from '../config/firebase';
import { log } from '../utils/logger';

export const healthRouter = Router();

const startTime = Date.now();
const metrics = {
  dispatched: 0,
  scheduled: 0,
  cancelled: 0,
  retried: 0,
  totalSent: 0,
  totalFailed: 0,
};

export function incrementMetric(
  key: keyof typeof metrics,
  by = 1
): void {
  metrics[key] += by;
}

// ---------------------------------------------------------------------------
// GET /health — liveness probe
// ---------------------------------------------------------------------------

healthRouter.get('/health', async (_req, res) => {
  try {
    // Ping a real collection — Firestore rejects reserved __ names
    await getDb().collection('tenants').limit(1).get();
    res.json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    log.error('Health check: Firestore unreachable', {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(503).json({
      status: 'degraded',
      error: 'Firestore unreachable',
      timestamp: new Date().toISOString(),
    });
  }
});

// ---------------------------------------------------------------------------
// GET /metrics — basic operational counters
// ---------------------------------------------------------------------------

healthRouter.get('/metrics', (_req, res) => {
  res.json({
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    ...metrics,
  });
});
