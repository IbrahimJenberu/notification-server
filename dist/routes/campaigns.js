"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const campaignService_1 = require("../services/campaignService");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
exports.campaignsRouter = (0, express_1.Router)();
// All campaign routes require authentication
exports.campaignsRouter.use(auth_1.requireAuth);
// ---------------------------------------------------------------------------
// Helper — cast Express Request to AuthedRequest after requireAuth ran
// The cast through unknown is necessary because TypeScript can't verify at
// the call site that requireAuth already attached uid/role/tenantId.
// ---------------------------------------------------------------------------
function authed(req) {
    return req;
}
// ---------------------------------------------------------------------------
// POST /campaigns/:campaignId/dispatch
// ---------------------------------------------------------------------------
exports.campaignsRouter.post('/:campaignId/dispatch', rateLimit_1.sendRateLimit, async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const uid = authed(req).uid;
        const tenantId = req.query['tenantId'];
        if (!tenantId)
            throw new errorHandler_1.AppError(400, 'Query param tenantId is required.', 'MISSING_TENANT');
        if (!campaignId)
            throw new errorHandler_1.AppError(400, 'Campaign ID is required.', 'MISSING_ID');
        logger_1.log.info('POST /campaigns/:id/dispatch', { campaignId, tenantId, uid });
        const result = await (0, campaignService_1.dispatchCampaign)(tenantId, campaignId, uid);
        res.json({
            success: true,
            campaignId,
            sentCount: result.sentCount,
            failedCount: result.failedCount,
        });
    }
    catch (err) {
        next(err);
    }
});
// ---------------------------------------------------------------------------
// POST /campaigns/:campaignId/schedule
// ---------------------------------------------------------------------------
const scheduleBodySchema = zod_1.z.object({
    scheduledAt: zod_1.z.string().datetime({ message: 'scheduledAt must be an ISO 8601 datetime string.' }),
});
exports.campaignsRouter.post('/:campaignId/schedule', async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const uid = authed(req).uid;
        const tenantId = req.query['tenantId'];
        if (!tenantId)
            throw new errorHandler_1.AppError(400, 'Query param tenantId is required.', 'MISSING_TENANT');
        if (!campaignId)
            throw new errorHandler_1.AppError(400, 'Campaign ID is required.', 'MISSING_ID');
        const body = scheduleBodySchema.parse(req.body);
        const scheduledAt = new Date(body.scheduledAt);
        await (0, campaignService_1.scheduleCampaign)(tenantId, campaignId, scheduledAt, uid);
        res.json({ success: true, campaignId, scheduledAt: scheduledAt.toISOString() });
    }
    catch (err) {
        next(err);
    }
});
// ---------------------------------------------------------------------------
// POST /campaigns/:campaignId/cancel
// ---------------------------------------------------------------------------
exports.campaignsRouter.post('/:campaignId/cancel', async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const uid = authed(req).uid;
        const tenantId = req.query['tenantId'];
        if (!tenantId)
            throw new errorHandler_1.AppError(400, 'Query param tenantId is required.', 'MISSING_TENANT');
        if (!campaignId)
            throw new errorHandler_1.AppError(400, 'Campaign ID is required.', 'MISSING_ID');
        await (0, campaignService_1.cancelCampaign)(tenantId, campaignId, uid);
        res.json({ success: true, campaignId });
    }
    catch (err) {
        next(err);
    }
});
// ---------------------------------------------------------------------------
// POST /campaigns/:campaignId/retry
// ---------------------------------------------------------------------------
exports.campaignsRouter.post('/:campaignId/retry', rateLimit_1.sendRateLimit, async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const uid = authed(req).uid;
        const tenantId = req.query['tenantId'];
        if (!tenantId)
            throw new errorHandler_1.AppError(400, 'Query param tenantId is required.', 'MISSING_TENANT');
        if (!campaignId)
            throw new errorHandler_1.AppError(400, 'Campaign ID is required.', 'MISSING_ID');
        const result = await (0, campaignService_1.retryCampaign)(tenantId, campaignId, uid);
        res.json({
            success: true,
            campaignId,
            sentCount: result.sentCount,
            failedCount: result.failedCount,
        });
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=campaigns.js.map