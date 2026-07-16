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
export declare function startScheduler(): void;
export declare function stopScheduler(): void;
//# sourceMappingURL=scheduler.d.ts.map