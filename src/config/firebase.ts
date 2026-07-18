import * as admin from 'firebase-admin';
import { env } from './env';

let _db: admin.firestore.Firestore | null = null;

export function initFirebase(): void {
  if (admin.apps.length > 0) return;

  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Render's env var UI sometimes converts literal \n sequences into real
    // newlines inside the JSON string, which breaks JSON.parse(). We normalize
    // the private_key field by replacing real newlines back to \n sequences
    // so the key is always in the format OpenSSL expects.
    let rawJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;

    // If the JSON contains a private_key with real newlines (not \n), fix it
    // by replacing the newlines inside the key value only.
    // Strategy: parse leniently by temporarily replacing newlines inside the key.
    rawJson = rawJson.replace(
      /"private_key"\s*:\s*"([\s\S]*?)(?<!\\)"/,
      (_match, keyContent: string) => {
        // Normalize: real newlines → \n, ensure escaped newlines stay as-is
        const normalized = keyContent
          .replace(/\r\n/g, '\n')          // CRLF → LF
          .replace(/\n/g, '\\n')           // real LF → literal \n
          .replace(/\\\\n/g, '\\n');       // double-escaped \n → single
        return `"private_key": "${normalized}"`;
      }
    );

    let serviceAccount: admin.ServiceAccount;
    try {
      serviceAccount = JSON.parse(rawJson) as admin.ServiceAccount;
    } catch (e) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. ` +
        `Make sure it is a single-line JSON object with \\n in the private_key. ` +
        `Parse error: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else {
    throw new Error(
      'Firebase Admin SDK: set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS'
    );
  }
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
