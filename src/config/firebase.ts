import * as admin from 'firebase-admin';
import { env } from './env';

let _db: admin.firestore.Firestore | null = null;

export function initFirebase(): void {
  if (admin.apps.length > 0) return;

  const hasClientEmail = Boolean(process.env.FIREBASE_CLIENT_EMAIL);
  const hasPrivateKey  = Boolean(process.env.FIREBASE_PRIVATE_KEY);
  const hasProjectId   = Boolean(process.env.FIREBASE_PROJECT_ID);
  const hasJsonString  = Boolean(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const hasAdc         = Boolean(env.GOOGLE_APPLICATION_CREDENTIALS);

  // Always log which path will be taken — visible in Render logs for debugging
  console.log('[Firebase Init] credential detection:', {
    hasClientEmail,
    hasPrivateKey,
    hasProjectId,
    hasJsonString,
    hasAdc,
    clientEmailPrefix: process.env.FIREBASE_CLIENT_EMAIL?.slice(0, 25) ?? '(none)',
    privateKeyStart:   process.env.FIREBASE_PRIVATE_KEY?.slice(0, 30) ?? '(none)',
  });

  // ── Path 1: three individual env vars (most reliable on Render) ──────────
  if (hasClientEmail && hasPrivateKey && hasProjectId) {
    // Render env vars may store \n as literal backslash-n — normalize to real newlines
    const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');
    console.log('[Firebase Init] → using FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey,
      }),
    });
    return;
  }

  // ── Path 2: full JSON env var ─────────────────────────────────────────────
  if (hasJsonString) {
    console.log('[Firebase Init] → using FIREBASE_SERVICE_ACCOUNT_JSON');
    let rawJson = env.FIREBASE_SERVICE_ACCOUNT_JSON!;
    // Normalize private_key newlines before parsing
    rawJson = rawJson.replace(
      /"private_key"\s*:\s*"([\s\S]*?)(?<!\\)"/,
      (_match, keyContent: string) => {
        const normalized = keyContent
          .replace(/\r\n/g, '\n')
          .replace(/\n/g, '\\n')
          .replace(/\\\\n/g, '\\n');
        return `"private_key": "${normalized}"`;
      }
    );
    let serviceAccount: admin.ServiceAccount;
    try {
      serviceAccount = JSON.parse(rawJson) as admin.ServiceAccount;
    } catch (e) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. ` +
        `Parse error: ${e instanceof Error ? e.message : String(e)}`
      );
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

  throw new Error(
    '[Firebase Init] No credentials found. Set one of:\n' +
    '  • FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY + FIREBASE_PROJECT_ID\n' +
    '  • FIREBASE_SERVICE_ACCOUNT_JSON\n' +
    '  • GOOGLE_APPLICATION_CREDENTIALS'
  );
}

export function getDb(): admin.firestore.Firestore {
  if (!_db) {
    _db = admin.firestore();
  }
  return _db;
}

export function getFirebaseAdmin(): typeof admin {
  return admin;
}
