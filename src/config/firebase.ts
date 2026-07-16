import * as admin from 'firebase-admin';
import { env } from './env';

let _db: admin.firestore.Firestore | null = null;

export function initFirebase(): void {
  if (admin.apps.length > 0) return;

  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as admin.ServiceAccount;
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    // ADC — file path set via GOOGLE_APPLICATION_CREDENTIALS env var
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else {
    // Render / Railway / Fly.io: inject service account JSON via env var
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
