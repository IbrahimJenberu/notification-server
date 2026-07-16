"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
exports.incrementMetric = incrementMetric;
const express_1 = require("express");
const firebase_1 = require("../config/firebase");
const logger_1 = require("../utils/logger");
exports.healthRouter = (0, express_1.Router)();
const startTime = Date.now();
const metrics = {
    dispatched: 0,
    scheduled: 0,
    cancelled: 0,
    retried: 0,
    totalSent: 0,
    totalFailed: 0,
};
function incrementMetric(key, by = 1) {
    metrics[key] += by;
}
// ---------------------------------------------------------------------------
// GET /health — liveness probe
// ---------------------------------------------------------------------------
exports.healthRouter.get('/health', async (_req, res) => {
    try {
        // Ping a real collection — Firestore rejects reserved __ names
        await (0, firebase_1.getDb)().collection('tenants').limit(1).get();
        res.json({
            status: 'ok',
            uptime: Math.floor((Date.now() - startTime) / 1000),
            timestamp: new Date().toISOString(),
        });
    }
    catch (err) {
        logger_1.log.error('Health check: Firestore unreachable', {
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
exports.healthRouter.get('/metrics', (_req, res) => {
    res.json({
        uptime: Math.floor((Date.now() - startTime) / 1000),
        timestamp: new Date().toISOString(),
        ...metrics,
    });
});
//# sourceMappingURL=health.js.map