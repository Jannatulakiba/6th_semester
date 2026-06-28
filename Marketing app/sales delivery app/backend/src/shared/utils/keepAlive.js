import https from 'https';
import http from 'http';
import logger from './logger.js';

export const startKeepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL || process.env.PING_URL;
  if (!url) {
    logger.warn('⚠️ keepAlive: Neither RENDER_EXTERNAL_URL nor PING_URL is set. Self-pinging is disabled.');
    return;
  }

  logger.info(`🔄 keepAlive: Starting self-pinging mechanism for ${url} every 5 minutes.`);

  const interval = 5 * 60 * 1000;

  setInterval(() => {
    logger.info(`💓 keepAlive: Pinging ${url}...`);
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      logger.info(`💓 keepAlive Ping Successful: Status Code ${res.statusCode}`);
    }).on('error', (err) => {
      logger.error(`❌ keepAlive Ping Failed: ${err.message}`);
    });
  }, interval);
};
