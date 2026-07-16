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
    if (env_1.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(env_1.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    else if (env_1.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // ADC — file path set via GOOGLE_APPLICATION_CREDENTIALS env var
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
    }
    else {
        // Render / Railway / Fly.io: inject service account JSON via env var
        throw new Error('Firebase Admin SDK: set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS');
    }
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