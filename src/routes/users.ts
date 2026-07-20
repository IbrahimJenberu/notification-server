import { Router } from 'express';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { log } from '../utils/logger';
import { sendInvitationEmail, sendPasswordResetEmail } from '../services/emailService';

export const usersRouter = Router();

usersRouter.use(requireAuth as any);

function authed(req: any): AuthedRequest {
  return req as unknown as AuthedRequest;
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
  role: z.enum(['super_admin', 'admin', 'editor', 'moderator', 'reader', 'premium_reader']),
  invitedByName: z.string().optional(),
});

usersRouter.post('/invite', requireAdminRole, async (req, res, next) => {
  try {
    const input = inviteSchema.parse(req.body);
    const callerUid = authed(req).uid;

    // Generate a secure temporary password
    const tempPassword = generateTempPassword();

    // 1. Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: input.email,
      password: tempPassword,
      displayName: input.displayName,
      emailVerified: false,
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
        invitedBy: callerUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // 4. Send invitation email (non-blocking — don't fail if SMTP is misconfigured)
    const inviterName = input.invitedByName ?? 'An administrator';
    sendInvitationEmail({
      to: input.email,
      displayName: input.displayName,
      role: input.role,
      invitedBy: inviterName,
      temporaryPassword: tempPassword,
    }).catch(err => {
      log.warn('users.invite: email send failed (non-fatal)', {
        error: err instanceof Error ? err.message : String(err),
        email: input.email,
      });
    });

    // 5. Write audit log
    void writeAudit(input.tenantId, callerUid, 'user.invited', {
      targetUid: userRecord.uid,
      email: input.email,
      role: input.role,
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
  role: z.enum(['super_admin', 'admin', 'editor', 'moderator', 'reader', 'premium_reader']),
});

usersRouter.post('/assign-role', requireAdminRole, async (req, res, next) => {
  try {
    const input = assignRoleSchema.parse(req.body);
    const callerUid = authed(req).uid;

    const userRecord = await admin.auth().getUser(input.uid);
    const existingClaims = (userRecord.customClaims as Record<string, unknown>) ?? {};
    const prevRole = existingClaims['role'] as string | undefined;

    await admin.auth().setCustomUserClaims(input.uid, { ...existingClaims, role: input.role });
    await db()
      .collection(`tenants/${input.tenantId}/users`)
      .doc(input.uid)
      .update({ role: input.role, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    void writeAudit(input.tenantId, callerUid, 'user.role_changed', {
      targetUid: input.uid, prevRole, newRole: input.role,
    });

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
    const callerUid = authed(req).uid;

    await admin.auth().updateUser(input.uid, { disabled: input.suspended });
    await db()
      .collection(`tenants/${input.tenantId}/users`)
      .doc(input.uid)
      .update({ isSuspended: input.suspended, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    void writeAudit(input.tenantId, callerUid, input.suspended ? 'user.suspended' : 'user.reactivated', {
      targetUid: input.uid,
    });

    log.info('users.set-suspended', { uid: input.uid, suspended: input.suspended });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /users/:uid/reset-password
// ---------------------------------------------------------------------------

const resetPasswordSchema = z.object({
  tenantId: z.string().min(1),
  uid: z.string().min(1),
});

usersRouter.post('/:uid/reset-password', requireAdminRole, async (req, res, next) => {
  try {
    const input = resetPasswordSchema.parse({
      tenantId: req.query['tenantId'],
      uid: req.params['uid'],
    });
    const callerUid = authed(req).uid;

    const userRecord = await admin.auth().getUser(input.uid);
    if (!userRecord.email) {
      throw new AppError(400, 'User does not have an email address.', 'NO_EMAIL');
    }

    // Generate Firebase password reset link (uses Firebase Auth email action)
    const resetLink = await admin.auth().generatePasswordResetLink(userRecord.email);

    // Send via Brevo SMTP
    await sendPasswordResetEmail({
      to: userRecord.email,
      displayName: userRecord.displayName ?? null,
      resetLink,
    });

    void writeAudit(input.tenantId, callerUid, 'user.password_reset_sent', {
      targetUid: input.uid,
      email: userRecord.email,
    });

    log.info('users.reset-password: sent', { uid: input.uid });
    res.json({ success: true, email: userRecord.email });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /users/:uid
// ---------------------------------------------------------------------------

usersRouter.delete('/:uid', requireAdminRole, async (req, res, next) => {
  try {
    const tenantId = req.query['tenantId'] as string | undefined;
    const uid = req.params['uid'] as string;

    if (!tenantId) throw new AppError(400, 'tenantId query param is required.', 'MISSING_TENANT');

    const callerUid = authed(req).uid;
    if (callerUid === uid) throw new AppError(400, 'Cannot delete your own account.', 'SELF_DELETE');

    await admin.auth().deleteUser(uid);
    await db().collection(`tenants/${tenantId}/users`).doc(uid).delete();

    void writeAudit(tenantId, callerUid, 'user.deleted', { targetUid: uid });

    log.info('users.delete', { uid });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateTempPassword(): string {
  // 12 chars: letters + digits + special — satisfies most password policies
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += charset[Math.floor(Math.random() * charset.length)];
  }
  return pass;
}

async function writeAudit(
  tenantId: string,
  performedBy: string,
  action: string,
  meta: Record<string, unknown>
): Promise<void> {
  try {
    await db().collection(`tenants/${tenantId}/auditLogs`).add({
      action,
      performedBy,
      ...meta,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'notification-server',
    });
  } catch (_) { /* non-fatal */ }
}
