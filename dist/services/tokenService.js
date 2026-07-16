"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTokens = resolveTokens;
exports.cleanupInvalidTokens = cleanupInvalidTokens;
exports.chunkArray = chunkArray;
const firebase_1 = require("../config/firebase");
const logger_1 = require("../utils/logger");
/**
 * Resolves the full set of Expo push tokens for a given audience target.
 *
 * Backwards-compatible: old token documents (written before the
 * notificationPermission field was added) don't have that field.
 * We do two queries and merge — one for explicitly 'granted', one for
 * documents where the field is absent (legacy registrations, assumed granted
 * since the user voluntarily opened the app and a token was obtained).
 */
async function resolveTokens(tenantId, audience) {
    const db = (0, firebase_1.getDb)();
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
        const tokens = new Set();
        // Process explicitly granted
        for (const d of grantedSnap.docs) {
            const token = extractToken(d);
            if (token)
                tokens.add(token);
        }
        // Process legacy (no notificationPermission field) — treat as granted
        for (const d of allSnap.docs) {
            const data = d.data();
            if (data.notificationPermission === undefined || data.notificationPermission === null) {
                const token = extractToken(d);
                if (token)
                    tokens.add(token);
            }
        }
        const result = [...tokens];
        logger_1.log.info('resolveTokens: resolved', {
            tenantId,
            audienceType: audience.type,
            count: result.length,
        });
        return result;
    }
    catch (err) {
        logger_1.log.error('resolveTokens: Firestore query failed', {
            tenantId,
            audience,
            error: err instanceof Error ? err.message : String(err),
        });
        throw err;
    }
}
function buildAudienceFilter(col, audience) {
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
    return col;
}
function extractToken(doc) {
    const data = doc.data();
    // New format: expoPushToken field; legacy format: doc.id IS the token
    const token = data.expoPushToken ?? doc.id;
    const decoded = decodeURIComponent(token);
    return isValidExpoToken(decoded) ? decoded : isValidExpoToken(token) ? token : null;
}
function isValidExpoToken(token) {
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
async function cleanupInvalidTokens(tenantId, invalidTokens) {
    if (invalidTokens.length === 0)
        return;
    const db = (0, firebase_1.getDb)();
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
        }
        catch (err) {
            logger_1.log.warn('cleanupInvalidTokens: batch delete failed', {
                tenantId,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
    logger_1.log.info('cleanupInvalidTokens: removed stale tokens', {
        tenantId,
        count: invalidTokens.length,
    });
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}
//# sourceMappingURL=tokenService.js.map