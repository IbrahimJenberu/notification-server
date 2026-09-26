import * as admin from 'firebase-admin';
import { getDb } from './config/firebase';
import { env } from './config/env';
import { dispatchCampaign } from './services/campaignService';
import { log } from './utils/logger';

let schedulerTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the in-process scheduler that polls Firestore every
 * SCHEDULER_POLL_INTERVAL_MS for campaigns whose scheduledAt has passed and
 * status is still 'scheduled'.
 *
 * This replaces the Firebase pub/sub Cloud Function `processScheduledCampaigns`
 * — no Blaze plan required.  On Render/Fly.io free tiers, a single server
 * instance runs continuously; this loop fires reliably as long as the process
 * is alive.  On restart, any missed scheduled campaigns are caught on the
 * very first poll (scheduledAt <= now query is intentionally not bounded
 * from below, so missed fires are always recovered).
 */
export function startScheduler(): void {
  if (schedulerTimer) return; // already running

  log.info('Scheduler: starting', {
    pollIntervalMs: env.SCHEDULER_POLL_INTERVAL_MS,
  });

  // Run immediately on startup, then on interval
  void runSchedulerTick();
  schedulerTimer = setInterval(() => {
    void runSchedulerTick();
  }, env.SCHEDULER_POLL_INTERVAL_MS);
}

export function stopScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    log.info('Scheduler: stopped');
  }
}

async function runSchedulerTick(): Promise<void> {
  const db = getDb();
  const now = admin.firestore.Timestamp.now();

  try {
    // Collection group query across all tenants
    const snap = await db
      .collectionGroup('notificationCampaigns')
      .where('status', '==', 'scheduled')
      .where('scheduledAt', '<=', now)
      .limit(50)
      .get();

    if (snap.empty) return;

    log.info('Scheduler: found due campaigns', { count: snap.docs.length });

    // Process sequentially to avoid overloading Expo send API on startup
    for (const docSnap of snap.docs) {
      const pathParts = docSnap.ref.path.split('/');
      // Path: tenants/{tenantId}/notificationCampaigns/{campaignId}
      const tenantId = pathParts[1];
      const campaignId = docSnap.id;

      if (!tenantId) {
        log.warn('Scheduler: could not extract tenantId from path', {
          path: docSnap.ref.path,
        });
        continue;
      }

      // Guard: re-check status inside a transaction to prevent double-dispatch
      // if two server instances are running (e.g. during a rolling deploy)
      const dispatched = await tryClaimForDispatch(docSnap.ref);
      if (!dispatched) continue;

      try {
        const result = await dispatchCampaign(tenantId, campaignId, 'scheduler');
        log.info('Scheduler: campaign dispatched', {
          tenantId,
          campaignId,
          sentCount: result.sentCount,
          failedCount: result.failedCount,
        });
      } catch (err) {
        log.error('Scheduler: campaign dispatch failed', {
          tenantId,
          campaignId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } catch (err) {
    log.error('Scheduler: tick failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Atomically transitions a campaign from 'scheduled' → 'sending'.
 * Returns true if this instance successfully claimed it; false if another
 * instance (or a previous tick) already changed the status.
 */
async function tryClaimForDispatch(
  ref: admin.firestore.DocumentReference
): Promise<boolean> {
  const db = getDb();
  try {
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists || snap.data()?.status !== 'scheduled') {
        throw new Error('SKIP'); // not an error — just means another instance claimed it
      }
      tx.update(ref, {
        status: 'sending',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'SKIP') return false;
    log.error('Scheduler: tryClaimForDispatch failed', { path: ref.path, error: msg });
    return false;
  }
}
