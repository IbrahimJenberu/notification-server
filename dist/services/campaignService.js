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
exports.dispatchCampaign = dispatchCampaign;
exports.scheduleCampaign = scheduleCampaign;
exports.cancelCampaign = cancelCampaign;
exports.retryCampaign = retryCampaign;
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("../config/firebase");
const tokenService_1 = require("./tokenService");
const expoSender_1 = require("./expoSender");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const db = () => (0, firebase_1.getDb)();
const FieldValue = admin.firestore.FieldValue;
function campaignRef(tenantId, campaignId) {
    return db().doc(`tenants/${tenantId}/notificationCampaigns/${campaignId}`);
}
// ---------------------------------------------------------------------------
// Dispatch — send immediately
// ---------------------------------------------------------------------------
async function dispatchCampaign(tenantId, campaignId, dispatchedBy) {
    const ref = campaignRef(tenantId, campaignId);
    const snap = await ref.get();
    if (!snap.exists) {
        throw new errorHandler_1.AppError(404, `Campaign ${campaignId} not found.`, 'NOT_FOUND');
    }
    const campaign = snap.data();
    const allowed = ['draft', 'scheduled', 'sending', 'failed', 'cancelled'];
    if (!allowed.includes(campaign.status)) {
        throw new errorHandler_1.AppError(422, `Campaign status '${campaign.status}' cannot be dispatched.`, 'INVALID_STATE');
    }
    // Idempotency guard — mark sending first, preventing double-dispatch
    await ref.update({
        status: 'sending',
        updatedAt: FieldValue.serverTimestamp(),
    });
    const audience = campaign.audience ?? { type: 'all', value: 'all' };
    let tokens;
    try {
        tokens = await (0, tokenService_1.resolveTokens)(tenantId, audience);
    }
    catch (err) {
        await ref.update({ status: 'failed', updatedAt: FieldValue.serverTimestamp() });
        throw err;
    }
    const data = { campaignId, tenantId };
    if (campaign.linkedPostId)
        data.postId = campaign.linkedPostId;
    if (tokens.length === 0) {
        logger_1.log.warn('dispatchCampaign: no eligible push tokens — writing inbox record only', {
            tenantId, campaignId,
        });
        await ref.update({
            status: 'sent',
            sentAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            'statistics.sentCount': 0,
        });
        // Still write notification inbox record so in-app users see it
        void writeNotificationRecord(tenantId, campaignId, {
            title: campaign.title,
            message: campaign.message,
            imageUrl: campaign.imageUrl ?? null,
            postId: campaign.linkedPostId ?? null,
        });
        return { sentCount: 0, failedCount: 0 };
    }
    const result = await (0, expoSender_1.sendToTokens)(tokens, {
        title: campaign.title,
        body: campaign.message,
        imageUrl: campaign.imageUrl,
        data,
    }, tenantId, campaignId);
    const newStatus = result.failedCount === 0 || result.sentCount > 0 ? 'sent' : 'failed';
    const update = {
        status: newStatus,
        updatedAt: FieldValue.serverTimestamp(),
        'statistics.sentCount': FieldValue.increment(result.sentCount),
        'statistics.errorCount': FieldValue.increment(result.failedCount),
    };
    if (newStatus === 'sent') {
        update.sentAt = FieldValue.serverTimestamp();
    }
    else {
        update.failureDetails = FieldValue.arrayUnion({
            code: 'SEND_FAILED',
            message: `Sent: ${result.sentCount}, failed: ${result.failedCount}`,
            occurredAt: admin.firestore.Timestamp.now(),
        });
    }
    void writeAuditLog(tenantId, {
        action: 'campaign.dispatch',
        campaignId,
        performedBy: dispatchedBy,
        result: newStatus,
        meta: { sentCount: result.sentCount, failedCount: result.failedCount },
    });
    await ref.update(update);
    // Write to /notifications so in-app inbox shows this notification
    void writeNotificationRecord(tenantId, campaignId, {
        title: campaign.title,
        message: campaign.message,
        imageUrl: campaign.imageUrl ?? null,
        postId: campaign.linkedPostId ?? null,
    });
    logger_1.log.info('dispatchCampaign: complete', {
        tenantId, campaignId, sentCount: result.sentCount, failedCount: result.failedCount,
    });
    return { sentCount: result.sentCount, failedCount: result.failedCount };
}
// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------
async function scheduleCampaign(tenantId, campaignId, scheduledAt, scheduledBy) {
    const ref = campaignRef(tenantId, campaignId);
    const snap = await ref.get();
    if (!snap.exists)
        throw new errorHandler_1.AppError(404, `Campaign ${campaignId} not found.`, 'NOT_FOUND');
    const campaign = snap.data();
    if (!['draft', 'cancelled'].includes(campaign.status)) {
        throw new errorHandler_1.AppError(422, `Cannot schedule a campaign with status '${campaign.status}'.`, 'INVALID_STATE');
    }
    if (scheduledAt <= new Date()) {
        throw new errorHandler_1.AppError(400, 'scheduledAt must be a future date/time.', 'INVALID_DATE');
    }
    await ref.update({
        status: 'scheduled',
        scheduledAt: admin.firestore.Timestamp.fromDate(scheduledAt),
        updatedAt: FieldValue.serverTimestamp(),
    });
    void writeAuditLog(tenantId, {
        action: 'campaign.schedule', campaignId, performedBy: scheduledBy,
        result: 'scheduled', meta: { scheduledAt: scheduledAt.toISOString() },
    });
    logger_1.log.info('scheduleCampaign: scheduled', { tenantId, campaignId, scheduledAt });
}
// ---------------------------------------------------------------------------
// Cancel
// ---------------------------------------------------------------------------
async function cancelCampaign(tenantId, campaignId, cancelledBy) {
    const ref = campaignRef(tenantId, campaignId);
    const snap = await ref.get();
    if (!snap.exists)
        throw new errorHandler_1.AppError(404, `Campaign ${campaignId} not found.`, 'NOT_FOUND');
    const campaign = snap.data();
    if (campaign.status !== 'scheduled') {
        throw new errorHandler_1.AppError(422, `Only scheduled campaigns can be cancelled. Current status: '${campaign.status}'.`, 'INVALID_STATE');
    }
    await ref.update({
        status: 'cancelled',
        cancelledAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });
    void writeAuditLog(tenantId, {
        action: 'campaign.cancel', campaignId, performedBy: cancelledBy,
        result: 'cancelled', meta: {},
    });
    logger_1.log.info('cancelCampaign: cancelled', { tenantId, campaignId });
}
// ---------------------------------------------------------------------------
// Retry
// ---------------------------------------------------------------------------
async function retryCampaign(tenantId, campaignId, retriedBy) {
    const ref = campaignRef(tenantId, campaignId);
    const snap = await ref.get();
    if (!snap.exists)
        throw new errorHandler_1.AppError(404, `Campaign ${campaignId} not found.`, 'NOT_FOUND');
    const campaign = snap.data();
    if (campaign.status !== 'failed') {
        throw new errorHandler_1.AppError(422, `Only failed campaigns can be retried. Current status: '${campaign.status}'.`, 'INVALID_STATE');
    }
    await ref.update({ failureDetails: [], updatedAt: FieldValue.serverTimestamp() });
    return dispatchCampaign(tenantId, campaignId, retriedBy);
}
/**
 * Writes to tenants/{tenantId}/notifications so the client in-app inbox
 * displays dispatched campaigns.  Uses campaignId as doc ID — idempotent on retry.
 * Non-blocking; failures are logged but never surfaced to caller.
 */
async function writeNotificationRecord(tenantId, campaignId, record) {
    try {
        await db()
            .collection(`tenants/${tenantId}/notifications`)
            .doc(campaignId)
            .set({
            title: record.title,
            message: record.message,
            imageUrl: record.imageUrl,
            postId: record.postId,
            campaignId,
            sentAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        logger_1.log.info('writeNotificationRecord: written', { tenantId, campaignId });
    }
    catch (err) {
        logger_1.log.warn('writeNotificationRecord: failed (non-fatal)', {
            tenantId, campaignId,
            error: err instanceof Error ? err.message : String(err),
        });
    }
}
async function writeAuditLog(tenantId, entry) {
    try {
        await db()
            .collection(`tenants/${tenantId}/auditLogs`)
            .add({
            ...entry,
            timestamp: FieldValue.serverTimestamp(),
            source: 'notification-server',
        });
    }
    catch (err) {
        logger_1.log.warn('writeAuditLog: failed to write', {
            error: err instanceof Error ? err.message : String(err),
        });
    }
}
//# sourceMappingURL=campaignService.js.map