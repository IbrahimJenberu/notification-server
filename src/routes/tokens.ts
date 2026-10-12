import { Router } from 'express';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { getDb } from '../config/firebase';
import { log } from '../utils/logger';

export const tokensRouter = Router();

const registerTokenSchema = z.object({
  tenantId: z.string().min(1),
  token: z.string().min(1),
  uid: z.string().optional(),
  platform: z.enum(['ios', 'android']).optional(),
  deviceId: z.string().optional(),
  appVersion: z.string().optional(),
  language: z.string().optional(),
  permission: z.enum(['granted', 'denied', 'undetermined']).optional(),
  subscribedTopics: z.array(z.string()).optional(),
  role: z.string().optional(),
});

// POST /tokens/register — direct device token registration via Admin SDK
tokensRouter.post('/register', async (req, res, next) => {
  try {
    const input = registerTokenSchema.parse(req.body);
    const db = getDb();
    const encodedToken = encodeURIComponent(input.token);
    const now = admin.firestore.FieldValue.serverTimestamp();

    const tokenDoc = {
      expoPushToken: input.token,
      uid: input.uid ?? `guest_${input.deviceId ?? Date.now()}`,
      platform: input.platform ?? 'android',
      deviceId: input.deviceId ?? '',
      appVersion: input.appVersion ?? '1.0.0',
      language: input.language ?? 'en',
      notificationPermission: input.permission ?? 'granted',
      subscribedTopics: input.subscribedTopics ?? [],
      role: input.role ?? 'reader',
      tokenUpdatedAt: now,
      updatedAt: now,
      lastActive: now,
    };

    // Store under encoded token doc ID
    await db
      .collection(`tenants/${input.tenantId}/deviceTokens`)
      .doc(encodedToken)
      .set(tokenDoc, { merge: true });

    // Also store under raw token doc ID for backward compatibility
    if (encodedToken !== input.token) {
      await db
        .collection(`tenants/${input.tenantId}/deviceTokens`)
        .doc(input.token)
        .set(tokenDoc, { merge: true });
    }

    log.info('tokens.register: token registered', {
      tenantId: input.tenantId,
      tokenMasked: input.token.slice(0, 20) + '…',
      platform: input.platform,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
