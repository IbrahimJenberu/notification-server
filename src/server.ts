import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { initFirebase } from './config/firebase';
import { globalRateLimit } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { campaignsRouter } from './routes/campaigns';
import { healthRouter } from './routes/health';
import { usersRouter } from './routes/users';
import { startScheduler, stopScheduler } from './scheduler';
import { log } from './utils/logger';

// ---------------------------------------------------------------------------
// Bootstrap Firebase Admin SDK before anything else
// ---------------------------------------------------------------------------
initFirebase();

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls (no origin) or listed origins
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed.`));
      }
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '256kb' }));

// Global rate limiting
app.use(globalRateLimit);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/', healthRouter);
app.use('/campaigns', campaignsRouter);
app.use('/users', usersRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Centralized error handler (must be last)
app.use(errorHandler as express.ErrorRequestHandler);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const server = app.listen(env.PORT, () => {
  log.info('SnapInfo Notification Server started', {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    allowedOrigins,
  });
  // Start scheduled campaign dispatcher
  startScheduler();
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
function shutdown(signal: string): void {
  log.info(`${signal} received — shutting down gracefully`);

  stopScheduler();

  server.close(err => {
    if (err) {
      log.error('Error during server close', { error: err.message });
      process.exit(1);
    }
    log.info('Server closed. Exiting.');
    process.exit(0);
  });

  // Force-kill if graceful close takes too long
  setTimeout(() => {
    log.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled promise rejection', {
    error: reason instanceof Error ? reason.message : String(reason),
  });
});

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception', { error: err.message });
  process.exit(1);
});

export default app;
