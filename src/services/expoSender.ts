import { Expo, type ExpoPushMessage, type ExpoPushTicket, type ExpoPushReceipt } from 'expo-server-sdk';
import { env } from '../config/env';
import { getDb, getFirebaseAdmin } from '../config/firebase';
import { cleanupInvalidTokens, chunkArray } from './tokenService';
import { log } from '../utils/logger';

// ---------------------------------------------------------------------------
// Expo client — singleton
// ---------------------------------------------------------------------------

let _expo: Expo | null = null;

function getExpo(): Expo {
  if (!_expo) {
    _expo = new Expo({
      accessToken: env.EXPO_ACCESS_TOKEN,
      useFcmV1: true, // FCM v1 API (required after June 2024)
    });
  }
  return _expo;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SendPayload {
  title: string;
  body: string;
  imageUrl?: string | null;
  data?: Record<string, string>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  categoryId?: string;
  ttl?: number;
  priority?: 'default' | 'normal' | 'high';
}

export interface SendResult {
  sentCount: number;
  failedCount: number;
  invalidTokens: string[];
  ticketIds: string[];
}

// ---------------------------------------------------------------------------
// In-memory receipt store (keyed by ticket ID → token, for cleanup)
// ---------------------------------------------------------------------------
// In a production multi-instance deployment, store in Redis or Firestore.
// For single-instance free-tier deployments, in-memory is sufficient.
const ticketTokenMap = new Map<string, string>(); // ticketId → pushToken

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------

/**
 * Sends push notifications to all provided tokens, respecting Expo chunk size
 * (100 per request), concurrency limits, and retry-with-backoff on transient
 * failures.
 *
 * After sending, schedules receipt processing for 15 minutes later (Expo
 * receipts take ~5–15 min to populate).
 */
export async function sendToTokens(
  tokens: string[],
  payload: SendPayload,
  tenantId: string,
  campaignId: string
): Promise<SendResult> {
  const expo = getExpo();

  const messages: ExpoPushMessage[] = tokens.map(to => ({
    to,
    title: payload.title,
    body: payload.body,
    ...(payload.imageUrl ? { image: payload.imageUrl } : {}),
    data: { ...(payload.data ?? {}), campaignId, tenantId },
    sound: payload.sound ?? 'default',
    badge: payload.badge,
    channelId: payload.channelId ?? 'default',
    categoryId: payload.categoryId,
    ttl: payload.ttl ?? 604_800, // 7 days
    priority: payload.priority ?? 'high',
    mutableContent: true,  // iOS: allows notification service extensions
  }));

  // Expo SDK already chunks at 100; we additionally control concurrency
  const expoChunks = expo.chunkPushNotifications(messages);
  const tokenChunks = chunkArray(tokens, 100);

  let sentCount = 0;
  let failedCount = 0;
  const ticketIds: string[] = [];
  const invalidTokens: string[] = [];

  // Process chunks with controlled concurrency
  const concurrency = env.SEND_CONCURRENCY;
  for (let i = 0; i < expoChunks.length; i += concurrency) {
    const batch = expoChunks.slice(i, i + concurrency);
    const tokenBatch = tokenChunks.slice(i, i + concurrency);

    const results = await Promise.allSettled(
      batch.map((chunk, idx) =>
        sendChunkWithRetry(expo, chunk, tokenBatch[idx] ?? [], campaignId)
      )
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        sentCount += result.value.sentCount;
        failedCount += result.value.failedCount;
        ticketIds.push(...result.value.ticketIds);
        invalidTokens.push(...result.value.invalidTokens);
      } else {
        log.error('expoSender: chunk permanently failed', {
          campaignId,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        });
        failedCount += 100; // conservative — full chunk failed
      }
    }
  }

  // Schedule receipt processing after 15 minutes
  if (ticketIds.length > 0) {
    scheduleReceiptProcessing(ticketIds, tenantId, campaignId, 15 * 60 * 1000);
  }

  // Immediately clean up invalid tokens discovered during send
  if (invalidTokens.length > 0) {
    void cleanupInvalidTokens(tenantId, invalidTokens);
  }

  log.info('expoSender: send complete', { campaignId, sentCount, failedCount, ticketCount: ticketIds.length });

  return { sentCount, failedCount, invalidTokens, ticketIds };
}

// ---------------------------------------------------------------------------
// Single chunk send with exponential backoff retry
// ---------------------------------------------------------------------------

interface ChunkResult {
  sentCount: number;
  failedCount: number;
  ticketIds: string[];
  invalidTokens: string[];
}

async function sendChunkWithRetry(
  expo: Expo,
  chunk: ExpoPushMessage[],
  chunkTokens: string[],
  campaignId: string
): Promise<ChunkResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt < env.MAX_CHUNK_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = env.RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await sleep(delay);
    }

    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      return processTickets(tickets, chunkTokens, campaignId);
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);

      // Non-retryable errors — immediately surface
      if (msg.includes('InvalidCredentials') || msg.includes('certificate')) {
        log.error('expoSender: non-retryable credential error', { campaignId, error: msg });
        throw err;
      }

      log.warn('expoSender: chunk send attempt failed, retrying', {
        campaignId,
        attempt: attempt + 1,
        maxAttempts: env.MAX_CHUNK_RETRIES,
        error: msg,
      });
    }
  }

  throw lastError;
}

function processTickets(
  tickets: ExpoPushTicket[],
  chunkTokens: string[],
  campaignId: string
): ChunkResult {
  let sentCount = 0;
  let failedCount = 0;
  const ticketIds: string[] = [];
  const invalidTokens: string[] = [];

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i]!;
    const token = chunkTokens[i];

    if (ticket.status === 'ok') {
      sentCount++;
      if (ticket.id) {
        ticketIds.push(ticket.id);
        if (token) ticketTokenMap.set(ticket.id, token);
      }
    } else {
      failedCount++;
      const details = ticket.details;
      if (
        details?.error === 'DeviceNotRegistered' ||
        details?.error === 'InvalidCredentials'
      ) {
        if (token) invalidTokens.push(token);
      }
      log.warn('expoSender: ticket error', {
        campaignId,
        error: details?.error ?? 'unknown',
        token: token ? token.slice(0, 20) + '…' : 'unknown',
      });
    }
  }

  return { sentCount, failedCount, ticketIds, invalidTokens };
}

// ---------------------------------------------------------------------------
// Receipt processing
// ---------------------------------------------------------------------------

function scheduleReceiptProcessing(
  ticketIds: string[],
  tenantId: string,
  campaignId: string,
  delayMs: number
): void {
  setTimeout(() => {
    void processReceipts(ticketIds, tenantId, campaignId);
  }, delayMs);
}

async function processReceipts(
  ticketIds: string[],
  tenantId: string,
  campaignId: string
): Promise<void> {
  const expo = getExpo();
  const db = getDb();
  const admin = getFirebaseAdmin();
  const campaignRef = db.doc(`tenants/${tenantId}/notificationCampaigns/${campaignId}`);

  let deliveredCount = 0;
  let errorCount = 0;
  const invalidTokens: string[] = [];

  // Expo limits receipt queries to 300 IDs per request
  const chunks = chunkArray(ticketIds, 300);

  for (const chunk of chunks) {
    try {
      const receiptMap: Record<string, ExpoPushReceipt> =
        await expo.getPushNotificationReceiptsAsync(chunk);

      for (const [receiptId, receipt] of Object.entries(receiptMap)) {
        if (receipt.status === 'ok') {
          deliveredCount++;
        } else {
          errorCount++;
          if (
            receipt.details?.error === 'DeviceNotRegistered' ||
            receipt.details?.error === 'InvalidCredentials'
          ) {
            const token = ticketTokenMap.get(receiptId);
            if (token) invalidTokens.push(token);
          }
          log.warn('expoSender: receipt error', {
            campaignId,
            receiptId,
            error: receipt.details?.error ?? 'unknown',
          });
        }
        ticketTokenMap.delete(receiptId); // release memory
      }
    } catch (err) {
      log.error('expoSender: receipt processing failed', {
        campaignId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Write delivery stats back to Firestore
  try {
    await campaignRef.update({
      'statistics.deliveredCount': admin.firestore.FieldValue.increment(deliveredCount),
      'statistics.errorCount': admin.firestore.FieldValue.increment(errorCount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    log.error('expoSender: failed to update delivery stats', {
      campaignId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  if (invalidTokens.length > 0) {
    void cleanupInvalidTokens(tenantId, invalidTokens);
  }

  log.info('expoSender: receipts processed', { campaignId, deliveredCount, errorCount });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
