"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const firebase_1 = require("./config/firebase");
const rateLimit_1 = require("./middleware/rateLimit");
const errorHandler_1 = require("./middleware/errorHandler");
const campaigns_1 = require("./routes/campaigns");
const health_1 = require("./routes/health");
const scheduler_1 = require("./scheduler");
const logger_1 = require("./utils/logger");
// ---------------------------------------------------------------------------
// Bootstrap Firebase Admin SDK before anything else
// ---------------------------------------------------------------------------
(0, firebase_1.initFirebase)();
// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = (0, express_1.default)();
// Security headers
app.use((0, helmet_1.default)());
// CORS
const allowedOrigins = env_1.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow server-to-server calls (no origin) or listed origins
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS: origin '${origin}' not allowed.`));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json({ limit: '256kb' }));
// Global rate limiting
app.use(rateLimit_1.globalRateLimit);
// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/', health_1.healthRouter);
app.use('/campaigns', campaigns_1.campaignsRouter);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});
// Centralized error handler (must be last)
app.use(errorHandler_1.errorHandler);
// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const server = app.listen(env_1.env.PORT, () => {
    logger_1.log.info('SnapInfo Notification Server started', {
        port: env_1.env.PORT,
        nodeEnv: env_1.env.NODE_ENV,
        allowedOrigins,
    });
    // Start scheduled campaign dispatcher
    (0, scheduler_1.startScheduler)();
});
// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
function shutdown(signal) {
    logger_1.log.info(`${signal} received — shutting down gracefully`);
    (0, scheduler_1.stopScheduler)();
    server.close(err => {
        if (err) {
            logger_1.log.error('Error during server close', { error: err.message });
            process.exit(1);
        }
        logger_1.log.info('Server closed. Exiting.');
        process.exit(0);
    });
    // Force-kill if graceful close takes too long
    setTimeout(() => {
        logger_1.log.error('Graceful shutdown timed out — forcing exit');
        process.exit(1);
    }, 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
    logger_1.log.error('Unhandled promise rejection', {
        error: reason instanceof Error ? reason.message : String(reason),
    });
});
process.on('uncaughtException', (err) => {
    logger_1.log.error('Uncaught exception', { error: err.message });
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map