import pino from 'pino';

// Configure logger settings
const logger = pino({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    browser: {
        write: {
            debug: (...args) => console.debug(...args),
            info: (...args) => console.info(...args),
            warn: (...args) => console.warn(...args),
            error: (...args) => console.error(...args),
        },
    },
});

export const elizaLogger = logger; 