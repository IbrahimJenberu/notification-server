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

// ---------------------------------------------------------------------------
// Dispatch — send immediately
// ---------------------------------------------------------------------------

export async function dispatchCampaign(
  tenantId: string,
  campaignId: string,
  dispatchedBy: string
): Promise<{ sentCount: number; failedCount: number }> {
  const ref = campaignRef(tenantId, campaignId);
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

  // Idempotency guard — mark sending first, preventing double-dispatch
  await ref.update({
    status: 'sending',
    updatedAt: FieldValue.serverTimestamp(),
  });

  const audience: AudienceTarget = campaign.audience ?? { type: 'all', value: 'all' };

  let tokens: string[];
  try {
    tokens = await resolveTokens(tenantId, audience);
  } catch (err) {
    await ref.update({ status: 'failed', updatedAt: FieldValue.serverTimestamp() });
    throw err;
  }

  const data: Record<string, string> = { campaignId, tenantId };
  if (campaign.linkedPostId) data.postId = campaign.linkedPostId;

  if (tokens.length === 0) {
    log.warn('dispatchCampaign: no eligible push tokens — writing inbox record only', {
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

  const newStatus = result.failedCount === 0 || result.sentCount > 0 ? 'sent' : 'failed';
  const update: Record<string, unknown> = {
    status: newStatus,
    updatedAt: FieldValue.serverTimestamp(),
    'statistics.sentCount': FieldValue.increment(result.sentCount),
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

  log.info('dispatchCampaign: complete', {
    tenantId, campaignId, sentCount: result.sentCount, failedCount: result.failedCount,
  });

  return { sentCount: result.sentCount, failedCount: result.failedCount };
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
): Promise<{ sentCount: number; failedCount: number }> {
  const ref = campaignRef(tenantId, campaignId);
  const snap = await ref.get();
  if (!snap.exists) throw new AppError(404, `Campaign ${campaignId} not found.`, 'NOT_FOUND');

  const campaign = snap.data() as Campaign;
  if (campaign.status !== 'failed') {
    throw new AppError(422, `Only failed campaigns can be retried. Current status: '${campaign.status}'.`, 'INVALID_STATE');
  }

  await ref.update({ failureDetails: [], updatedAt: FieldValue.serverTimestamp() });
  return dispatchCampaign(tenantId, campaignId, retriedBy);
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
 * displays dispatched campaigns.  Uses campaignId as doc ID — idempotent on retry.
 * Non-blocking; failures are logged but never surfaced to caller.
 */
async function writeNotificationRecord(
  tenantId: string,
  campaignId: string,
  record: NotificationRecordInput
): Promise<void> {
  try {
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
    log.info('writeNotificationRecord: written', { tenantId, campaignId });
  } catch (err) {
    log.warn('writeNotificationRecord: failed (non-fatal)', {
      tenantId, campaignId,
      error: err instanceof Error ? err.message : String(err),
    });
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
  } catch (err) {
    log.warn('writeAuditLog: failed to write', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
