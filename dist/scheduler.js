"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = startScheduler;
exports.stopScheduler = stopScheduler;
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("./config/firebase");
const env_1 = require("./config/env");
const campaignService_1 = require("./services/campaignService");
const logger_1 = require("./utils/logger");
let schedulerTimer = null;
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
function startScheduler() {
    if (schedulerTimer)
        return; // already running
    logger_1.log.info('Scheduler: starting', {
        pollIntervalMs: env_1.env.SCHEDULER_POLL_INTERVAL_MS,
    });
    // Run immediately on startup, then on interval
    void runSchedulerTick();
    schedulerTimer = setInterval(() => {
        void runSchedulerTick();
    }, env_1.env.SCHEDULER_POLL_INTERVAL_MS);
}
function stopScheduler() {
    if (schedulerTimer) {
        clearInterval(schedulerTimer);
        schedulerTimer = null;
        logger_1.log.info('Scheduler: stopped');
    }
}
async function runSchedulerTick() {
    const db = (0, firebase_1.getDb)();
    const now = admin.firestore.Timestamp.now();
    try {
        // Collection group query across all tenants
        const snap = await db
            .collectionGroup('notificationCampaigns')
            .where('status', '==', 'scheduled')
            .where('scheduledAt', '<=', now)
            .limit(50)
            .get();
        if (snap.empty)
            return;
        logger_1.log.info('Scheduler: found due campaigns', { count: snap.docs.length });
        // Process sequentially to avoid overloading Expo send API on startup
        for (const docSnap of snap.docs) {
            const pathParts = docSnap.ref.path.split('/');
            // Path: tenants/{tenantId}/notificationCampaigns/{campaignId}
            const tenantId = pathParts[1];
            const campaignId = docSnap.id;
            if (!tenantId) {
                logger_1.log.warn('Scheduler: could not extract tenantId from path', {
                    path: docSnap.ref.path,
                });
                continue;
            }
            // Guard: re-check status inside a transaction to prevent double-dispatch
            // if two server instances are running (e.g. during a rolling deploy)
            const dispatched = await tryClaimForDispatch(docSnap.ref);
            if (!dispatched)
                continue;
            try {
                const result = await (0, campaignService_1.dispatchCampaign)(tenantId, campaignId, 'scheduler');
                logger_1.log.info('Scheduler: campaign dispatched', {
                    tenantId,
                    campaignId,
                    sentCount: result.sentCount,
                    failedCount: result.failedCount,
                });
            }
            catch (err) {
                logger_1.log.error('Scheduler: campaign dispatch failed', {
                    tenantId,
                    campaignId,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }
    catch (err) {
        logger_1.log.error('Scheduler: tick failed', {
            error: err instanceof Error ? err.message : String(err),
        });
    }
}
/**
 * Atomically transitions a campaign from 'scheduled' → 'sending'.
 * Returns true if this instance successfully claimed it; false if another
 * instance (or a previous tick) already changed the status.
 */
async function tryClaimForDispatch(ref) {
    const db = (0, firebase_1.getDb)();
    try {
        await db.runTransaction(async (tx) => {
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
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'SKIP')
            return false;
        logger_1.log.error('Scheduler: tryClaimForDispatch failed', { path: ref.path, error: msg });
        return false;
    }
}
//# sourceMappingURL=scheduler.js.map