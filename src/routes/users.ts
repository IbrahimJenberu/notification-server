import { Router } from 'express';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { log } from '../utils/logger';

export const usersRouter = Router();

// All user-management routes require authentication
usersRouter.use(requireAuth as any);

function authed(req: any): AuthedRequest {
  return req as AuthedRequest;
}

function requireAdminRole(req: any, res: any, next: any): void {
  const role: string = authed(req).role;
  if (role !== 'super_admin' && role !== 'admin') {
    res.status(403).json({ error: 'Insufficient privileges. admin or super_admin required.' });
    return;
  }
  next();
}

const db = () => admin.firestore();

// ---------------------------------------------------------------------------
// POST /users/invite
// ---------------------------------------------------------------------------

const inviteSchema = z.object({
  tenantId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  role: z.enum(['super_admin', 'admin', 'editor', 'moderator', 'reader']),
  password: z.string().min(6).optional(),
});

usersRouter.post('/invite', requireAdminRole, async (req, res, next) => {
  try {
    const input = inviteSchema.parse(req.body);

    // 1. Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: input.email,
      password: input.password ?? Math.random().toString(36).slice(-8) + 'A1!',
      displayName: input.displayName,
      emailVerified: true,
    });

    // 2. Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: input.role,
      tenantId: input.tenantId,
    });

    // 3. Mirror in Firestore
    await db()
      .collection(`tenants/${input.tenantId}/users`)
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: input.role,
        tenantId: input.tenantId,
        isSuspended: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    log.info('users.invite: created', { uid: userRecord.uid, email: input.email, role: input.role });

    res.json({ uid: userRecord.uid, email: userRecord.email });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /users/assign-role
// ---------------------------------------------------------------------------

const assignRoleSchema = z.object({
  tenantId: z.string().min(1),
  uid: z.string().min(1),
  role: z.enum(['super_admin', 'admin', 'editor', 'moderator', 'reader']),
});

usersRouter.post('/assign-role', requireAdminRole, async (req, res, next) => {
  try {
    const input = assignRoleSchema.parse(req.body);

    const userRecord = await admin.auth().getUser(input.uid);
    const existingClaims = (userRecord.customClaims as Record<string, unknown>) ?? {};

    await admin.auth().setCustomUserClaims(input.uid, { ...existingClaims, role: input.role });

    await db()
      .collection(`tenants/${input.tenantId}/users`)
      .doc(input.uid)
      .update({ role: input.role, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    log.info('users.assign-role', { uid: input.uid, role: input.role });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /users/set-suspended
// ---------------------------------------------------------------------------

const suspendSchema = z.object({
  tenantId: z.string().min(1),
  uid: z.string().min(1),
  suspended: z.boolean(),
});

usersRouter.post('/set-suspended', requireAdminRole, async (req, res, next) => {
  try {
    const input = suspendSchema.parse(req.body);

    await admin.auth().updateUser(input.uid, { disabled: input.suspended });

    await db()
      .collection(`tenants/${input.tenantId}/users`)
      .doc(input.uid)
      .update({ isSuspended: input.suspended, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    log.info('users.set-suspended', { uid: input.uid, suspended: input.suspended });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /users/:uid
// ---------------------------------------------------------------------------

const deleteSchema = z.object({
  tenantId: z.string().min(1),
  uid: z.string().min(1),
});

usersRouter.delete('/:uid', requireAdminRole, async (req, res, next) => {
  try {
    const input = deleteSchema.parse({
      tenantId: req.query['tenantId'],
      uid: req.params['uid'],
    });

    const callerUid = authed(req).uid;
    if (callerUid === input.uid) {
      throw new AppError(400, 'Cannot delete your own account.', 'SELF_DELETE');
    }

    await admin.auth().deleteUser(input.uid);
    await db().collection(`tenants/${input.tenantId}/users`).doc(input.uid).delete();

    log.info('users.delete', { uid: input.uid });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
