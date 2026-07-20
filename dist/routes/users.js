"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const emailService_1 = require("../services/emailService");
exports.usersRouter = (0, express_1.Router)();
exports.usersRouter.use(auth_1.requireAuth);
function authed(req) {
    return req;
}
function requireAdminRole(req, res, next) {
    const role = authed(req).role;
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
const inviteSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    displayName: zod_1.z.string().min(1),
    role: zod_1.z.enum(['super_admin', 'admin', 'editor', 'moderator', 'reader', 'premium_reader']),
    invitedByName: zod_1.z.string().optional(),
});
exports.usersRouter.post('/invite', requireAdminRole, async (req, res, next) => {
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
        (0, emailService_1.sendInvitationEmail)({
            to: input.email,
            displayName: input.displayName,
            role: input.role,
            invitedBy: inviterName,
            temporaryPassword: tempPassword,
        }).catch(err => {
            logger_1.log.warn('users.invite: email send failed (non-fatal)', {
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
        logger_1.log.info('users.invite: created', { uid: userRecord.uid, email: input.email, role: input.role });
        res.json({ uid: userRecord.uid, email: userRecord.email });
    }
    catch (err) {
        next(err);
    }
});
// ---------------------------------------------------------------------------
// POST /users/assign-role
// ---------------------------------------------------------------------------
const assignRoleSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1),
    uid: zod_1.z.string().min(1),
    role: zod_1.z.enum(['super_admin', 'admin', 'editor', 'moderator', 'reader', 'premium_reader']),
});
exports.usersRouter.post('/assign-role', requireAdminRole, async (req, res, next) => {
    try {
        const input = assignRoleSchema.parse(req.body);
        const callerUid = authed(req).uid;
        const userRecord = await admin.auth().getUser(input.uid);
        const existingClaims = userRecord.customClaims ?? {};
        const prevRole = existingClaims['role'];
        await admin.auth().setCustomUserClaims(input.uid, { ...existingClaims, role: input.role });
        await db()
            .collection(`tenants/${input.tenantId}/users`)
            .doc(input.uid)
            .update({ role: input.role, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        void writeAudit(input.tenantId, callerUid, 'user.role_changed', {
            targetUid: input.uid, prevRole, newRole: input.role,
        });
        logger_1.log.info('users.assign-role', { uid: input.uid, role: input.role });
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
// ---------------------------------------------------------------------------
// POST /users/set-suspended
// ---------------------------------------------------------------------------
const suspendSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1),
    uid: zod_1.z.string().min(1),
    suspended: zod_1.z.boolean(),
});
exports.usersRouter.post('/set-suspended', requireAdminRole, async (req, res, next) => {
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
        logger_1.log.info('users.set-suspended', { uid: input.uid, suspended: input.suspended });
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
// ---------------------------------------------------------------------------
// POST /users/:uid/reset-password
// ---------------------------------------------------------------------------
const resetPasswordSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1),
    uid: zod_1.z.string().min(1),
});
exports.usersRouter.post('/:uid/reset-password', requireAdminRole, async (req, res, next) => {
    try {
        const input = resetPasswordSchema.parse({
            tenantId: req.query['tenantId'],
            uid: req.params['uid'],
        });
        const callerUid = authed(req).uid;
        const userRecord = await admin.auth().getUser(input.uid);
        if (!userRecord.email) {
            throw new errorHandler_1.AppError(400, 'User does not have an email address.', 'NO_EMAIL');
        }
        // Generate Firebase password reset link (uses Firebase Auth email action)
        const resetLink = await admin.auth().generatePasswordResetLink(userRecord.email);
        // Send via Brevo SMTP
        await (0, emailService_1.sendPasswordResetEmail)({
            to: userRecord.email,
            displayName: userRecord.displayName ?? null,
            resetLink,
        });
        void writeAudit(input.tenantId, callerUid, 'user.password_reset_sent', {
            targetUid: input.uid,
            email: userRecord.email,
        });
        logger_1.log.info('users.reset-password: sent', { uid: input.uid });
        res.json({ success: true, email: userRecord.email });
    }
    catch (err) {
        next(err);
    }
});
// ---------------------------------------------------------------------------
// DELETE /users/:uid
// ---------------------------------------------------------------------------
exports.usersRouter.delete('/:uid', requireAdminRole, async (req, res, next) => {
    try {
        const tenantId = req.query['tenantId'];
        const uid = req.params['uid'];
        if (!tenantId)
            throw new errorHandler_1.AppError(400, 'tenantId query param is required.', 'MISSING_TENANT');
        const callerUid = authed(req).uid;
        if (callerUid === uid)
            throw new errorHandler_1.AppError(400, 'Cannot delete your own account.', 'SELF_DELETE');
        await admin.auth().deleteUser(uid);
        await db().collection(`tenants/${tenantId}/users`).doc(uid).delete();
        void writeAudit(tenantId, callerUid, 'user.deleted', { targetUid: uid });
        logger_1.log.info('users.delete', { uid });
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function generateTempPassword() {
    // 12 chars: letters + digits + special — satisfies most password policies
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
    let pass = '';
    for (let i = 0; i < 12; i++) {
        pass += charset[Math.floor(Math.random() * charset.length)];
    }
    return pass;
}
async function writeAudit(tenantId, performedBy, action, meta) {
    try {
        await db().collection(`tenants/${tenantId}/auditLogs`).add({
            action,
            performedBy,
            ...meta,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            source: 'notification-server',
        });
    }
    catch (_) { /* non-fatal */ }
}
//# sourceMappingURL=users.js.map