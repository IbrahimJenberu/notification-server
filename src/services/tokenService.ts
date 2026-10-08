import type { firestore as FirestoreNS } from 'firebase-admin';
import { Expo } from 'expo-server-sdk';
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
 * Backwards-compatible: retrieves all documents matching the audience filter,
 * includes both authenticated users and guest devices (guest_${deviceId}),
 * excludes only explicitly 'denied' devices, and validates tokens.
 */
export async function resolveTokens(tenantId: string, audience: AudienceTarget): Promise<string[]> {
  const db = getDb();
  const col = db.collection(`tenants/${tenantId}/deviceTokens`);

  try {
    const audienceFilter = buildAudienceFilter(col, audience);
    const snap = await audienceFilter.get();

    const tokens = new Set<string>();
    let deniedCount = 0;
    let malformedCount = 0;

    for (const d of snap.docs) {
      const data = d.data() as Partial<DeviceTokenDoc>;
      // Skip only explicitly denied permissions
      if (data.notificationPermission === 'denied') {
        deniedCount++;
        continue;
      }

      const token = extractToken(d);
      if (token) {
        tokens.add(token);
      } else {
        malformedCount++;
      }
    }

    const result = [...tokens];
    log.info('[TOKEN_RESOLUTION]', {
      tenantId,
      audienceType: audience.type,
      audienceValue: audience.value,
      totalDocsFound: snap.docs.length,
      deniedCount,
      malformedCount,
      validTokenCount: result.length,
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
  if (audience.type === 'platform' && audience.value && audience.value !== 'all') {
    return col.where('platform', '==', audience.value);
  }
  if (audience.type === 'role' && audience.value && audience.value !== 'all') {
    return col.where('role', '==', audience.value);
  }
  if (audience.type === 'topic' && audience.value && audience.value !== 'all') {
    return col.where('subscribedTopics', 'array-contains', audience.value);
  }
  // 'all' or wildcard value — query all device tokens
  return col as unknown as FirebaseFirestore.Query;
}

function extractToken(doc: FirebaseFirestore.QueryDocumentSnapshot): string | null {
  const data = doc.data() as Partial<DeviceTokenDoc>;
  const rawToken = data.expoPushToken ?? (doc.data() as any)['pushToken'] ?? doc.id;
  if (!rawToken || typeof rawToken !== 'string') return null;

  const decoded = decodeURIComponent(rawToken);

  if (Expo.isExpoPushToken(decoded) || isValidExpoToken(decoded)) {
    return decoded;
  }
  if (Expo.isExpoPushToken(rawToken) || isValidExpoToken(rawToken)) {
    return rawToken;
  }
  return null;
}

function isValidExpoToken(token: string): boolean {
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
