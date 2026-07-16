"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRateLimit = exports.globalRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
/** Applied globally to all routes. */
exports.globalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
    skip: (req) => req.path === '/health',
});
/** Stricter limit for dispatch/retry — these fan out FCM sends. */
exports.sendRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Send rate limit exceeded. Max 10 dispatch requests per minute.' },
    keyGenerator: (req) => {
        // Rate-limit per authenticated user, not IP, for send endpoints
        const uid = req.uid;
        return uid ?? req.ip ?? 'unknown';
    },
});
//# sourceMappingURL=rateLimit.js.map