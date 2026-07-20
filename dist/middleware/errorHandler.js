"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
class AppError extends Error {
    statusCode;
    code;
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            error: 'Validation failed',
            details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
        });
        return;
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message, code: err.code });
        return;
    }
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    const stack = err instanceof Error ? err.stack : undefined;
    logger_1.log.error('Unhandled error', { path: req.path, method: req.method, error: message, stack });
    // Return the real message in all environments — the client needs it for debugging.
    // Sensitive internals (stack traces) are never sent; only the message string.
    res.status(500).json({ error: message });
}
//# sourceMappingURL=errorHandler.js.map