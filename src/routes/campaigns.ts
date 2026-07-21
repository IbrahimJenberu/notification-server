import { Router, type Request } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import { sendRateLimit } from '../middleware/rateLimit';
import {
  dispatchCampaign,
  scheduleCampaign,
  cancelCampaign,
  retryCampaign,
  trackAnalyticsEvent,
} from '../services/campaignService';
import { AppError } from '../middleware/errorHandler';
import { log } from '../utils/logger';

export const campaignsRouter = Router();

// All campaign routes require authentication
campaignsRouter.use(requireAuth as any);

// ---------------------------------------------------------------------------
// Helper — cast Express Request to AuthedRequest after requireAuth ran
// The cast through unknown is necessary because TypeScript can't verify at
// the call site that requireAuth already attached uid/role/tenantId.
// ---------------------------------------------------------------------------
function authed(req: Request): AuthedRequest {
  return req as unknown as AuthedRequest;
}

// ---------------------------------------------------------------------------
// POST /campaigns/:campaignId/dispatch
// ---------------------------------------------------------------------------

campaignsRouter.post(
  '/:campaignId/dispatch',
  sendRateLimit as any,
  async (req, res, next) => {
    try {
      const { campaignId } = req.params;
      const uid = authed(req).uid;
      const tenantId = req.query['tenantId'] as string | undefined;

      if (!tenantId) throw new AppError(400, 'Query param tenantId is required.', 'MISSING_TENANT');
      if (!campaignId) throw new AppError(400, 'Campaign ID is required.', 'MISSING_ID');

      log.info('POST /campaigns/:id/dispatch', { campaignId, tenantId, uid });

      const result = await dispatchCampaign(tenantId, campaignId, uid);

      res.json({
        success: true,
        campaignId,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        deliveredCount: result.deliveredCount,
        inAppCount: result.inAppCount,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /campaigns/:campaignId/schedule
// ---------------------------------------------------------------------------

const scheduleBodySchema = z.object({
  scheduledAt: z.string().datetime({ message: 'scheduledAt must be an ISO 8601 datetime string.' }),
});

campaignsRouter.post('/:campaignId/schedule', async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const uid = authed(req).uid;
    const tenantId = req.query['tenantId'] as string | undefined;

    if (!tenantId) throw new AppError(400, 'Query param tenantId is required.', 'MISSING_TENANT');
    if (!campaignId) throw new AppError(400, 'Campaign ID is required.', 'MISSING_ID');

    const body = scheduleBodySchema.parse(req.body);
    const scheduledAt = new Date(body.scheduledAt);

    await scheduleCampaign(tenantId, campaignId, scheduledAt, uid);

    res.json({ success: true, campaignId, scheduledAt: scheduledAt.toISOString() });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /campaigns/:campaignId/cancel
// ---------------------------------------------------------------------------

campaignsRouter.post('/:campaignId/cancel', async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const uid = authed(req).uid;
    const tenantId = req.query['tenantId'] as string | undefined;

    if (!tenantId) throw new AppError(400, 'Query param tenantId is required.', 'MISSING_TENANT');
    if (!campaignId) throw new AppError(400, 'Campaign ID is required.', 'MISSING_ID');

    await cancelCampaign(tenantId, campaignId, uid);

    res.json({ success: true, campaignId });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /campaigns/:campaignId/retry
// ---------------------------------------------------------------------------

campaignsRouter.post(
  '/:campaignId/retry',
  sendRateLimit as any,
  async (req, res, next) => {
    try {
      const { campaignId } = req.params;
      const uid = authed(req).uid;
      const tenantId = req.query['tenantId'] as string | undefined;

      if (!tenantId) throw new AppError(400, 'Query param tenantId is required.', 'MISSING_TENANT');
      if (!campaignId) throw new AppError(400, 'Campaign ID is required.', 'MISSING_ID');

      const result = await retryCampaign(tenantId, campaignId, uid);

      res.json({
        success: true,
        campaignId,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        deliveredCount: result.deliveredCount,
        inAppCount: result.inAppCount,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /campaigns/:campaignId/analytics
//
// Client-side event tracking — called by the app when a user opens a
// notification or taps the linked post inside it. The client fires this
// endpoint; the server atomically increments the matching counter on the
// campaign document.
//
// Body: { event: 'opened' | 'postOpened', uid?: string }
// ---------------------------------------------------------------------------

const analyticsBodySchema = z.object({
  event: z.enum(['opened', 'postOpened']),
  uid: z.string().optional(),
});

campaignsRouter.post('/:campaignId/analytics', async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const tenantId = req.query['tenantId'] as string | undefined;

    if (!tenantId) throw new AppError(400, 'Query param tenantId is required.', 'MISSING_TENANT');
    if (!campaignId) throw new AppError(400, 'Campaign ID is required.', 'MISSING_ID');

    const body = analyticsBodySchema.parse(req.body);

    log.info('POST /campaigns/:id/analytics', { campaignId, tenantId, event: body.event, uid: body.uid });

    await trackAnalyticsEvent(tenantId, campaignId, body.event, body.uid);

    res.json({ success: true, campaignId, event: body.event });
  } catch (err) {
    next(err);
  }
});
