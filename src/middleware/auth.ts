import type { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { log } from '../utils/logger';

export type AuthedRequest = Request & {
  uid: string;
  role: string;
  tenantId: string;
};

const ALLOWED_ROLES = new Set(['super_admin', 'admin', 'editor']);

/**
 * Verifies the Firebase ID token from the Authorization header and attaches
 * uid / role / tenantId to the request.  Rejects any caller without a
 * valid token or without the required role.
 *
 * Token format: "Bearer <firebase-id-token>"
 *
 * Role is read from custom claims set by the `assignRole` Cloud Function
 * in functions/src/auth.ts — it is never trusted from the request body.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.headers['authorization'];
  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    return;
  }

  const idToken = authorization.slice(7);
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);

    const role = (decoded['role'] as string | undefined) ?? 'reader';
    if (!ALLOWED_ROLES.has(role)) {
      res.status(403).json({
        error: `Insufficient privileges. Required: editor/admin/super_admin. Got: ${role}`,
      });
      return;
    }

    // Attach to request for downstream handlers
    const authed = req as AuthedRequest;
    authed.uid = decoded.uid;
    authed.role = role;
    authed.tenantId = (decoded['tenantId'] as string | undefined) ?? '';

    next();
  } catch (err) {
    log.warn('requireAuth: token verification failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(401).json({ error: 'Invalid or expired ID token.' });
  }
}

/** Stricter guard — only super_admin may call this endpoint. */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authed = req as AuthedRequest;
  if (authed.role !== 'super_admin' && authed.role !== 'admin') {
    res.status(403).json({ error: 'This action requires admin or super_admin role.' });
    return;
  }
  next();
}
