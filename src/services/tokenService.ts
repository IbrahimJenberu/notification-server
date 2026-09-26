import type { firestore as FirestoreNS } from 'firebase-admin';
import { getDb } from '../config/firebase';
import { log } from '../utils/logger';

// ---------------------------------------------------------------------------
// Device token document shape (mirrors FirestoreNotificationRepository)
// ---------------------------------------------------------------------------

export interface DeviceTokenDoc {
  uid: string;
  expoPushToken: string;
  platform: 'ios' | 'android';
  deviceId: string;
  appVersion: string;
  language: string;
  lastActive: FirestoreNS.Timestamp;
  notificationPermission: 'granted' | 'denied' | 'undetermined';
  tokenUpdatedAt: FirestoreNS.Timestamp;
  subscribedTopics: string[];
}

// ---------------------------------------------------------------------------
// Audience resolution
// ---------------------------------------------------------------------------

export type AudienceType = 'all' | 'topic' | 'role' | 'platform';

export interface AudienceTarget {
  type: AudienceType;
  value: string;
}

/**
 * Resolves the full set of Expo push tokens for a given audience target.
 *
 * Backwards-compatible: old token documents (written before the
 * notificationPermission field was added) don't have that field.
 * We do two queries and merge — one for explicitly 'granted', one for
 * documents where the field is absent (legacy registrations, assumed granted
 * since the user voluntarily opened the app and a token was obtained).
 */
export async function resolveTokens(
  tenantId: string,
  audience: AudienceTarget
): Promise<string[]> {
  const db = getDb();
  const col = db.collection(`tenants/${tenantId}/deviceTokens`);

  try {
    // Build the audience filter (applied to both granted + legacy queries)
    const audienceFilter = buildAudienceFilter(col, audience);

    // Query 1: explicitly granted
    const grantedSnap = await audienceFilter
      .where('notificationPermission', '==', 'granted')
      .get();

    // Query 2: legacy documents with no notificationPermission field
    // Firestore doesn't support "field does not exist" natively, so we use
    // a broad query and filter client-side on the small result set.
    const allSnap = await audienceFilter.get();

    const tokens = new Set<string>();

    // Process explicitly granted
    for (const d of grantedSnap.docs) {
      const token = extractToken(d);
      if (token) tokens.add(token);
    }

    // Process legacy (no notificationPermission field) — treat as granted
    for (const d of allSnap.docs) {
      const data = d.data() as Partial<DeviceTokenDoc>;
      if (data.notificationPermission === undefined || data.notificationPermission === null) {
        const token = extractToken(d);
        if (token) tokens.add(token);
      }
    }

    const result = [...tokens];
    log.info('resolveTokens: resolved', {
      tenantId,
      audienceType: audience.type,
      count: result.length,
    });
    return result;
  } catch (err) {
    log.error('resolveTokens: Firestore query failed', {
      tenantId,
      audience,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

function buildAudienceFilter(
  col: FirebaseFirestore.CollectionReference,
  audience: AudienceTarget
): FirebaseFirestore.Query {
  if (audience.type === 'platform') {
    return col.where('platform', '==', audience.value);
  }
  if (audience.type === 'role') {
    return col.where('role', '==', audience.value);
  }
  if (audience.type === 'topic') {
    return col.where('subscribedTopics', 'array-contains', audience.value);
  }
  // 'all' — no additional filter
  return col as unknown as FirebaseFirestore.Query;
}

function extractToken(doc: FirebaseFirestore.QueryDocumentSnapshot): string | null {
  const data = doc.data() as Partial<DeviceTokenDoc>;
  // New format: expoPushToken field; legacy format: doc.id IS the token
  const token = data.expoPushToken ?? doc.id;
  const decoded = decodeURIComponent(token);
  return isValidExpoToken(decoded) ? decoded : isValidExpoToken(token) ? token : null;
}

function isValidExpoToken(token: string): boolean {
  // ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxxxx] or ExpoPushToken[...]
  return /^ExponentPushToken\[.+\]$/.test(token) || /^ExpoPushToken\[.+\]$/.test(token);
}

// ---------------------------------------------------------------------------
// Invalid token cleanup
// ---------------------------------------------------------------------------

/**
 * Called after Expo receipt processing.  Deletes Firestore device token
 * documents whose tokens produced DeviceNotRegistered or InvalidCredentials
 * errors from Expo.  This prevents stale tokens from consuming send quota
 * on future campaigns.
 */
export async function cleanupInvalidTokens(
  tenantId: string,
  invalidTokens: string[]
): Promise<void> {
  if (invalidTokens.length === 0) return;

  const db = getDb();
  const col = db.collection(`tenants/${tenantId}/deviceTokens`);

  // Batch delete in groups of 500 (Firestore limit)
  const chunks = chunkArray(invalidTokens, 500);
  for (const chunk of chunks) {
    const batch = db.batch();
    for (const token of chunk) {
      // Doc ID is either the encoded token (new) or raw token (legacy)
      const encodedId = encodeURIComponent(token);
      batch.delete(col.doc(encodedId));
      // Also try raw token doc ID for backwards compatibility
      batch.delete(col.doc(token));
    }
    try {
      await batch.commit();
    } catch (err) {
      log.warn('cleanupInvalidTokens: batch delete failed', {
        tenantId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  log.info('cleanupInvalidTokens: removed stale tokens', {
    tenantId,
    count: invalidTokens.length,
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
