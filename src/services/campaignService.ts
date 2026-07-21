import * as admin from 'firebase-admin';
import { getDb } from '../config/firebase';
import { resolveTokens, type AudienceTarget } from './tokenService';
import { sendToTokens } from './expoSender';
import { AppError } from '../middleware/errorHandler';
import { log } from '../utils/logger';

const db = () => getDb();
const FieldValue = admin.firestore.FieldValue;

function campaignRef(tenantId: string, campaignId: string) {
  return db().doc(`tenants/${tenantId}/notificationCampaigns/${campaignId}`);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Campaign {
  title: string;
  message: string;
  imageUrl?: string | null;
  linkedPostId?: string | null;
  audience?: AudienceTarget;
  targetAudience?: string;
  status: string;
  scheduledAt?: admin.firestore.Timestamp | null;
}

// Result shape returned from dispatch / retry — extended with deliveredCount
// and inAppCount so callers (routes, tests) have the full picture.
export interface DispatchResult {
  sentCount: number;
  failedCount: number;
  deliveredCount: number;
  inAppCount: number;
}

// ---------------------------------------------------------------------------
// Dispatch — send immediately
// ---------------------------------------------------------------------------

export async function dispatchCampaign(
  tenantId: string,
  campaignId: string,
  dispatchedBy: string
): Promise<DispatchResult> {
  const ref = campaignRef(tenantId, campaignId);

  // ── Stage 1: Load campaign ───────────────────────────────────────────────
  log.info('dispatchCampaign: loading campaign', { tenantId, campaignId, dispatchedBy });
  const snap = await ref.get();

  if (!snap.exists) {
    throw new AppError(404, `Campaign ${campaignId} not found.`, 'NOT_FOUND');
  }

  const campaign = snap.data() as Campaign;
  const allowed = ['draft', 'scheduled', 'sending', 'failed', 'cancelled'];
  if (!allowed.includes(campaign.status)) {
    throw new AppError(
      422,
      `Campaign status '${campaign.status}' cannot be dispatched.`,
      'INVALID_STATE'
    );
  }

  log.info('dispatchCampaign: campaign loaded', {
    tenantId,
    campaignId,
    title: campaign.title,
    audience: campaign.audience,
    status: campaign.status,
  });

  // ── Stage 2: Idempotency guard ───────────────────────────────────────────
  await ref.update({
    status: 'sending',
    updatedAt: FieldValue.serverTimestamp(),
  });
  log.info('dispatchCampaign: status → sending', { tenantId, campaignId });

  // ── Stage 3: Resolve device tokens ──────────────────────────────────────
  const audience: AudienceTarget = campaign.audience ?? { type: 'all', value: 'all' };

  let tokens: string[];
  try {
    tokens = await resolveTokens(tenantId, audience);
    log.info('dispatchCampaign: tokens resolved', {
      tenantId,
      campaignId,
      audienceType: audience.type,
      tokenCount: tokens.length,
    });
  } catch (err) {
    log.error('dispatchCampaign: token resolution failed', {
      tenantId,
      campaignId,
      error: err instanceof Error ? err.message : String(err),
    });
    await ref.update({ status: 'failed', updatedAt: FieldValue.serverTimestamp() });
    throw err;
  }

  const data: Record<string, string> = { campaignId, tenantId };
  if (campaign.linkedPostId) data.postId = campaign.linkedPostId;

  // ── Stage 4a: No push tokens — in-app inbox only ─────────────────────────
  // Even without push tokens the notification IS delivered: we write it to
  // the /notifications collection so it appears in every user's in-app inbox
  // the next time they open the app. We count this as 1 in-app delivery so
  // the dashboard never reports 0 when a campaign actually reached users.
  if (tokens.length === 0) {
    log.info('dispatchCampaign: no push tokens — in-app delivery only', {
      tenantId,
      campaignId,
    });

    // Write inbox record first — then count it
    const inboxWritten = await writeNotificationRecord(tenantId, campaignId, {
      title: campaign.title,
      message: campaign.message,
      imageUrl: campaign.imageUrl ?? null,
      postId: campaign.linkedPostId ?? null,
    });

    // inAppCount = 1 if the inbox write succeeded, 0 if it failed
    const inAppCount = inboxWritten ? 1 : 0;

    const update: Record<string, unknown> = {
      status: 'sent',
      sentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      // sentCount = push tokens reached (0 here)
      // deliveredCount = total successful deliveries (push + in-app)
      'statistics.sentCount': 0,
      'statistics.deliveredCount': FieldValue.increment(inAppCount),
      'statistics.inAppCount': FieldValue.increment(inAppCount),
    };

    await ref.update(update);

    void writeAuditLog(tenantId, {
      action: 'campaign.dispatch',
      campaignId,
      performedBy: dispatchedBy,
      result: 'sent',
      meta: {
        sentCount: 0,
        failedCount: 0,
        deliveredCount: inAppCount,
        inAppCount,
        reason: 'no_push_tokens',
      },
    });

    log.info('dispatchCampaign: complete (in-app only)', {
      tenantId,
      campaignId,
      inAppCount,
    });

    return { sentCount: 0, failedCount: 0, deliveredCount: inAppCount, inAppCount };
  }

  // ── Stage 4b: Push delivery ──────────────────────────────────────────────
  log.info('dispatchCampaign: sending push notifications', {
    tenantId,
    campaignId,
    tokenCount: tokens.length,
  });

  const result = await sendToTokens(
    tokens,
    {
      title: campaign.title,
      body: campaign.message,
      imageUrl: campaign.imageUrl,
      data,
    },
    tenantId,
    campaignId
  );

  log.info('dispatchCampaign: push send complete', {
    tenantId,
    campaignId,
    sentCount: result.sentCount,
    failedCount: result.failedCount,
  });

  // ── Stage 5: Write inbox record ──────────────────────────────────────────
  const inboxWritten = await writeNotificationRecord(tenantId, campaignId, {
    title: campaign.title,
    message: campaign.message,
    imageUrl: campaign.imageUrl ?? null,
    postId: campaign.linkedPostId ?? null,
  });
  const inAppCount = inboxWritten ? 1 : 0;

  // ── Stage 6: Persist statistics ──────────────────────────────────────────
  // deliveredCount = successfully sent push notifications + in-app inbox write.
  // This gives an accurate "total reaches" number rather than conflating
  // push-specific metrics with in-app delivery.
  const deliveredCount = result.sentCount + inAppCount;
  const newStatus =
    result.failedCount === 0 || result.sentCount > 0 ? 'sent' : 'failed';

  const update: Record<string, unknown> = {
    status: newStatus,
    updatedAt: FieldValue.serverTimestamp(),
    'statistics.sentCount': FieldValue.increment(result.sentCount),
    'statistics.deliveredCount': FieldValue.increment(deliveredCount),
    'statistics.inAppCount': FieldValue.increment(inAppCount),
    'statistics.errorCount': FieldValue.increment(result.failedCount),
  };

  if (newStatus === 'sent') {
    update.sentAt = FieldValue.serverTimestamp();
  } else {
    update.failureDetails = FieldValue.arrayUnion({
      code: 'SEND_FAILED',
      message: `Sent: ${result.sentCount}, failed: ${result.failedCount}`,
      occurredAt: admin.firestore.Timestamp.now(),
    });
  }

  await ref.update(update);

  void writeAuditLog(tenantId, {
    action: 'campaign.dispatch',
    campaignId,
    performedBy: dispatchedBy,
    result: newStatus,
    meta: {
      sentCount: result.sentCount,
      failedCount: result.failedCount,
      deliveredCount,
      inAppCount,
    },
  });

  log.info('dispatchCampaign: complete', {
    tenantId,
    campaignId,
    sentCount: result.sentCount,
    failedCount: result.failedCount,
    deliveredCount,
    inAppCount,
    status: newStatus,
  });

  return {
    sentCount: result.sentCount,
    failedCount: result.failedCount,
    deliveredCount,
    inAppCount,
  };
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

export async function scheduleCampaign(
  tenantId: string,
  campaignId: string,
  scheduledAt: Date,
  scheduledBy: string
): Promise<void> {
  const ref = campaignRef(tenantId, campaignId);
  const snap = await ref.get();
  if (!snap.exists) throw new AppError(404, `Campaign ${campaignId} not found.`, 'NOT_FOUND');

  const campaign = snap.data() as Campaign;
  if (!['draft', 'cancelled'].includes(campaign.status)) {
    throw new AppError(422, `Cannot schedule a campaign with status '${campaign.status}'.`, 'INVALID_STATE');
  }
  if (scheduledAt <= new Date()) {
    throw new AppError(400, 'scheduledAt must be a future date/time.', 'INVALID_DATE');
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

  log.info('scheduleCampaign: scheduled', { tenantId, campaignId, scheduledAt });
}

// ---------------------------------------------------------------------------
// Cancel
// ---------------------------------------------------------------------------

export async function cancelCampaign(
  tenantId: string,
  campaignId: string,
  cancelledBy: string
): Promise<void> {
  const ref = campaignRef(tenantId, campaignId);
  const snap = await ref.get();
  if (!snap.exists) throw new AppError(404, `Campaign ${campaignId} not found.`, 'NOT_FOUND');

  const campaign = snap.data() as Campaign;
  if (campaign.status !== 'scheduled') {
    throw new AppError(422, `Only scheduled campaigns can be cancelled. Current status: '${campaign.status}'.`, 'INVALID_STATE');
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

  log.info('cancelCampaign: cancelled', { tenantId, campaignId });
}

// ---------------------------------------------------------------------------
// Retry
// ---------------------------------------------------------------------------

export async function retryCampaign(
  tenantId: string,
  campaignId: string,
  retriedBy: string
): Promise<DispatchResult> {
  const ref = campaignRef(tenantId, campaignId);
  const snap = await ref.get();
  if (!snap.exists) throw new AppError(404, `Campaign ${campaignId} not found.`, 'NOT_FOUND');

  const campaign = snap.data() as Campaign;
  if (campaign.status !== 'failed') {
    throw new AppError(422, `Only failed campaigns can be retried. Current status: '${campaign.status}'.`, 'INVALID_STATE');
  }

  log.info('retryCampaign: resetting failure details', { tenantId, campaignId, retriedBy });
  await ref.update({ failureDetails: [], updatedAt: FieldValue.serverTimestamp() });
  return dispatchCampaign(tenantId, campaignId, retriedBy);
}

// ---------------------------------------------------------------------------
// Analytics event tracking
//
// Called by the client via POST /campaigns/:id/analytics when a user opens
// a notification or taps the linked post. Atomically increments the
// matching counter so the dashboard shows real engagement numbers.
// ---------------------------------------------------------------------------

export type AnalyticsEvent = 'opened' | 'postOpened';

export async function trackAnalyticsEvent(
  tenantId: string,
  campaignId: string,
  event: AnalyticsEvent,
  uid?: string
): Promise<void> {
  const ref = campaignRef(tenantId, campaignId);

  try {
    const fieldMap: Record<AnalyticsEvent, string> = {
      opened: 'statistics.openCount',
      postOpened: 'statistics.postOpenCount',
    };

    await ref.update({
      [fieldMap[event]]: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    void writeAuditLog(tenantId, {
      action: `campaign.analytics.${event}`,
      campaignId,
      performedBy: uid ?? 'anonymous',
      result: 'recorded',
      meta: { event, uid: uid ?? null },
    });

    log.info('trackAnalyticsEvent: recorded', { tenantId, campaignId, event, uid });
  } catch (err) {
    // Non-fatal: analytics tracking failure must never surface to the user.
    log.warn('trackAnalyticsEvent: failed (non-fatal)', {
      tenantId,
      campaignId,
      event,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ---------------------------------------------------------------------------
// Notification inbox record
// ---------------------------------------------------------------------------

interface NotificationRecordInput {
  title: string;
  message: string;
  imageUrl: string | null;
  postId: string | null;
}

/**
 * Writes to tenants/{tenantId}/notifications so the client in-app inbox
 * displays dispatched campaigns. Uses campaignId as doc ID — idempotent on
 * retry. Returns true on success, false on failure (failure is non-fatal;
 * the caller uses the return value to determine inAppCount contribution).
 */
async function writeNotificationRecord(
  tenantId: string,
  campaignId: string,
  record: NotificationRecordInput
): Promise<boolean> {
  try {
    log.info('writeNotificationRecord: writing inbox record', { tenantId, campaignId });

    await db()
      .collection(`tenants/${tenantId}/notifications`)
      .doc(campaignId)
      .set(
        {
          title: record.title,
          message: record.message,
          imageUrl: record.imageUrl,
          postId: record.postId,
          campaignId,
          sentAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    log.info('writeNotificationRecord: success', { tenantId, campaignId });
    return true;
  } catch (err) {
    log.warn('writeNotificationRecord: failed (non-fatal)', {
      tenantId,
      campaignId,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

interface AuditEntry {
  action: string;
  campaignId: string;
  performedBy: string;
  result: string;
  meta: Record<string, unknown>;
}

async function writeAuditLog(tenantId: string, entry: AuditEntry): Promise<void> {
  try {
    await db()
      .collection(`tenants/${tenantId}/auditLogs`)
      .add({
        ...entry,
        timestamp: FieldValue.serverTimestamp(),
        source: 'notification-server',
      });
    log.debug('writeAuditLog: written', { tenantId, action: entry.action, campaignId: entry.campaignId });
  } catch (err) {
    log.warn('writeAuditLog: failed to write', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
