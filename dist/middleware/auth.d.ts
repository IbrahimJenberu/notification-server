import type { Request, Response, NextFunction } from 'express';
export type AuthedRequest = Request & {
    uid: string;
    role: string;
    tenantId: string;
};
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
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
/** Stricter guard — only super_admin may call this endpoint. */
export declare function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map