import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

let loggerOptions = {
  level: isProduction ? 'info' : 'debug',
};

if (!isProduction) {
  try {
    await import('pino-pretty');
    loggerOptions.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };
  } catch {
    // pino-pretty not installed, use default JSON output
  }
}

const logger = pino(loggerOptions);

export default logger;
