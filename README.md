# SnapInfo Notification Server

Production-ready push notification delivery server for the SnapInfo app.  
Replaces Firebase Cloud Functions with a standalone Express server — **no Blaze plan required**.

## Architecture

```
Admin UI (React Native)
    ↓  Firebase ID Token (Authorization: Bearer)
Express Server (this service)
    ↓  Firebase Admin SDK — Firestore reads (device tokens) + writes (campaign status)
Expo Push API
    ↓
APNs / FCM
    ↓
Device (foreground · background · terminated)
```

## Features

- **Dispatch campaigns** — fans out Expo push messages in chunks of 100 with concurrency control
- **Schedule campaigns** — persists `scheduledAt` in Firestore; in-process scheduler polls every 60 s
- **Cancel scheduled campaigns** — atomic status transition via Firestore transaction
- **Retry failed campaigns** — clears failure details and re-dispatches
- **Receipt processing** — fetches Expo delivery receipts 15 min after send; increments `deliveredCount`
- **Invalid token cleanup** — batch-deletes Firestore device token docs for `DeviceNotRegistered` tokens
- **Firebase ID token auth** — verifies every request server-side; rejects non-editor/admin calls
- **Rate limiting** — global + per-user send limits
- **Graceful shutdown** — SIGTERM/SIGINT handlers drain in-flight requests

## Quick Start (local)

```bash
cd notification-server
cp .env.example .env
# Fill in FIREBASE_SERVICE_ACCOUNT_JSON and EXPO_ACCESS_TOKEN
npm install
npm run dev
```

The server starts on `http://localhost:3001`.  
Set `EXPO_PUBLIC_NOTIFICATION_SERVER_URL=http://localhost:3001` in the app's `.env.local`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `FIREBASE_PROJECT_ID` | ✅ | e.g. `snapinfo-53272` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ✅* | Single-line JSON of service account key |
| `GOOGLE_APPLICATION_CREDENTIALS` | ✅* | Path to service account key file (alternative) |
| `EXPO_ACCESS_TOKEN` | Recommended | From expo.dev → Access Tokens |
| `PORT` | — | Default `3001` |
| `ALLOWED_ORIGINS` | — | Comma-separated CORS origins |
| `SCHEDULER_POLL_INTERVAL_MS` | — | Default `60000` (1 min) |
| `SEND_CONCURRENCY` | — | Concurrent Expo chunk sends, default `3` |
| `MAX_CHUNK_RETRIES` | — | Retries per chunk, default `3` |

\* One of `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` is required.

## API

All endpoints (except `/health` and `/metrics`) require `Authorization: Bearer <firebase-id-token>`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness probe — checks Firestore connectivity |
| `GET` | `/metrics` | Operational counters |
| `POST` | `/campaigns/:id/dispatch?tenantId=` | Send campaign immediately |
| `POST` | `/campaigns/:id/schedule?tenantId=` | Schedule for later (`body: { scheduledAt: ISO8601 }`) |
| `POST` | `/campaigns/:id/cancel?tenantId=` | Cancel a scheduled campaign |
| `POST` | `/campaigns/:id/retry?tenantId=` | Retry a failed campaign |

## Deployment

### Render (recommended for free tier)

1. Fork/push this repo to GitHub.  
2. In [render.com](https://render.com) → New → Blueprint → select repo.  
3. Render reads `render.yaml` automatically.  
4. Set `FIREBASE_SERVICE_ACCOUNT_JSON` and `EXPO_ACCESS_TOKEN` as secret env vars in the Render dashboard.  
5. Copy the deployed URL (e.g. `https://snapinfo-notification-server.onrender.com`) into your EAS build secrets as `EXPO_PUBLIC_NOTIFICATION_SERVER_URL`.

> **Note:** Render free tier spins down after 15 min of inactivity.  
> The scheduler will restart and recover any missed campaigns on the next request.

### Fly.io

```bash
# Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
fly auth login
fly launch --config notification-server/fly.toml --no-deploy
fly secrets set FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
fly secrets set EXPO_ACCESS_TOKEN=your_token
fly deploy
```

### Oracle Cloud Always Free / VPS

```bash
docker build -t snapinfo-notification-server .
docker run -d \
  -p 3001:3001 \
  -e FIREBASE_SERVICE_ACCOUNT_JSON='...' \
  -e EXPO_ACCESS_TOKEN='...' \
  -e FIREBASE_PROJECT_ID='snapinfo-53272' \
  --name snapinfo-notifications \
  --restart unless-stopped \
  snapinfo-notification-server
```

## Push Token Lifecycle

Device tokens are stored at `tenants/{tenantId}/deviceTokens/{encodedToken}` with:

```
expoPushToken    — ExponentPushToken[...]
platform         — ios | android
deviceId         — unique device identifier
appVersion       — e.g. "1.0.0"
language         — BCP-47 locale tag
notificationPermission — granted | denied | undetermined
subscribedTopics — for topic-based audience targeting
lastActive       — updated on every registration
```

Tokens are automatically removed when:
- Expo returns `DeviceNotRegistered` in a ticket or receipt
- The user signs out (client calls `removeDeviceToken`)
