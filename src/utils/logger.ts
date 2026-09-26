type Level = 'info' | 'warn' | 'error' | 'debug';

function write(level: Level, message: string, context?: Record<string, unknown>): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
  };
  if (level === 'error' || level === 'warn') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const log = {
  info:  (msg: string, ctx?: Record<string, unknown>) => write('info',  msg, ctx),
  warn:  (msg: string, ctx?: Record<string, unknown>) => write('warn',  msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => write('error', msg, ctx),
  debug: (msg: string, ctx?: Record<string, unknown>) => write('debug', msg, ctx),
};
