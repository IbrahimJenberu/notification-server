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
exports.requireAuth = requireAuth;
exports.requireSuperAdmin = requireSuperAdmin;
const admin = __importStar(require("firebase-admin"));
const logger_1 = require("../utils/logger");
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
async function requireAuth(req, res, next) {
    const authorization = req.headers['authorization'];
    if (!authorization?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or malformed Authorization header.' });
        return;
    }
    const idToken = authorization.slice(7);
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const role = decoded['role'] ?? 'reader';
        if (!ALLOWED_ROLES.has(role)) {
            res.status(403).json({
                error: `Insufficient privileges. Required: editor/admin/super_admin. Got: ${role}`,
            });
            return;
        }
        // Attach to request for downstream handlers
        const authed = req;
        authed.uid = decoded.uid;
        authed.role = role;
        authed.tenantId = decoded['tenantId'] ?? '';
        next();
    }
    catch (err) {
        logger_1.log.warn('requireAuth: token verification failed', {
            error: err instanceof Error ? err.message : String(err),
        });
        res.status(401).json({ error: 'Invalid or expired ID token.' });
    }
}
/** Stricter guard — only super_admin may call this endpoint. */
function requireSuperAdmin(req, res, next) {
    const authed = req;
    if (authed.role !== 'super_admin' && authed.role !== 'admin') {
        res.status(403).json({ error: 'This action requires admin or super_admin role.' });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map