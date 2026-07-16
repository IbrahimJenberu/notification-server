import type { firestore as FirestoreNS } from 'firebase-admin';
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
export declare function resolveTokens(tenantId: string, audience: AudienceTarget): Promise<string[]>;
/**
 * Called after Expo receipt processing.  Deletes Firestore device token
 * documents whose tokens produced DeviceNotRegistered or InvalidCredentials
 * errors from Expo.  This prevents stale tokens from consuming send quota
 * on future campaigns.
 */
export declare function cleanupInvalidTokens(tenantId: string, invalidTokens: string[]): Promise<void>;
export declare function chunkArray<T>(arr: T[], size: number): T[][];
//# sourceMappingURL=tokenService.d.ts.map