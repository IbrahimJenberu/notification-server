"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
function write(level, message, context) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(context && Object.keys(context).length > 0 ? { context } : {}),
    };
    if (level === 'error' || level === 'warn') {
        console.error(JSON.stringify(entry));
    }
    else {
        console.log(JSON.stringify(entry));
    }
}
exports.log = {
    info: (msg, ctx) => write('info', msg, ctx),
    warn: (msg, ctx) => write('warn', msg, ctx),
    error: (msg, ctx) => write('error', msg, ctx),
    debug: (msg, ctx) => write('debug', msg, ctx),
};
//# sourceMappingURL=logger.js.map