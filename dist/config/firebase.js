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
exports.initFirebase = initFirebase;
exports.getDb = getDb;
exports.getFirebaseAdmin = getFirebaseAdmin;
const admin = __importStar(require("firebase-admin"));
const env_1 = require("./env");
let _db = null;
function initFirebase() {
    if (admin.apps.length > 0)
        return;
    const hasClientEmail = Boolean(process.env.FIREBASE_CLIENT_EMAIL);
    const hasPrivateKey = Boolean(process.env.FIREBASE_PRIVATE_KEY);
    const hasProjectId = Boolean(process.env.FIREBASE_PROJECT_ID);
    const hasJsonString = Boolean(env_1.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const hasAdc = Boolean(env_1.env.GOOGLE_APPLICATION_CREDENTIALS);
    // Always log which path will be taken — visible in Render logs for debugging
    console.log('[Firebase Init] credential detection:', {
        hasClientEmail,
        hasPrivateKey,
        hasProjectId,
        hasJsonString,
        hasAdc,
        clientEmailPrefix: process.env.FIREBASE_CLIENT_EMAIL?.slice(0, 25) ?? '(none)',
        privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.slice(0, 30) ?? '(none)',
    });
    // ── Path 1: three individual env vars (most reliable on Render) ──────────
    if (hasClientEmail && hasPrivateKey && hasProjectId) {
        // Render env vars may store \n as literal backslash-n — normalize to real newlines
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        console.log('[Firebase Init] → using FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY');
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
        });
        return;
    }
    // ── Path 2: full JSON env var ─────────────────────────────────────────────
    if (hasJsonString) {
        console.log('[Firebase Init] → using FIREBASE_SERVICE_ACCOUNT_JSON');
        let rawJson = env_1.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        // Normalize private_key newlines before parsing
        rawJson = rawJson.replace(/"private_key"\s*:\s*"([\s\S]*?)(?<!\\)"/, (_match, keyContent) => {
            const normalized = keyContent
                .replace(/\r\n/g, '\n')
                .replace(/\n/g, '\\n')
                .replace(/\\\\n/g, '\\n');
            return `"private_key": "${normalized}"`;
        });
        let serviceAccount;
        try {
            serviceAccount = JSON.parse(rawJson);
        }
        catch (e) {
            throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. ` +
                `Parse error: ${e instanceof Error ? e.message : String(e)}`);
        }
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        return;
    }
    // ── Path 3: Application Default Credentials (file on disk) ───────────────
    if (hasAdc) {
        console.log('[Firebase Init] → using GOOGLE_APPLICATION_CREDENTIALS file');
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
        return;
    }
    throw new Error('[Firebase Init] No credentials found. Set one of:\n' +
        '  • FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY + FIREBASE_PROJECT_ID\n' +
        '  • FIREBASE_SERVICE_ACCOUNT_JSON\n' +
        '  • GOOGLE_APPLICATION_CREDENTIALS');
}
function getDb() {
    if (!_db) {
        _db = admin.firestore();
    }
    return _db;
}
function getFirebaseAdmin() {
    return admin;
}
//# sourceMappingURL=firebase.js.map