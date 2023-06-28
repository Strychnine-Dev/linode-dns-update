import { setToken } from '@linode/api-v4';
import winston from 'winston';
import { createClient } from 'redis';

export const config = {
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  linodeToken: process.env.LINODE_TOKEN,
  domain: process.env.DOMAIN,
  hostname: process.env.HOSTNAME,
  domainId: parseInt(process.env.DOMAIN_ID, 10),
  recordId: parseInt(process.env.RECORD_ID, 10),

  cacheEnabled: process.env.ENABLE_CACHE?.toLowerCase() === 'true',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT, 10) || 6379,
  cacheTimeout: parseInt(process.env.CACHE_TIMEOUT, 10) || 3600,
}

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: config.NODE_ENV === 'production' ?
        winston.format.combine(winston.format.timestamp(), winston.format.json()) :
        winston.format.simple(),
    }),
  ],
});

if (config.linodeToken) {
  setToken(config.linodeToken);
} else {
  logger.error('Linode token is not set');
  process.exit(1);
}

export let redisClient;
if (config.cacheEnabled) {
  if (!config.domainId || !config.recordId) {
    logger.warn('Warning! Cannot use cache without setting DOMAIN_ID and RECORD_ID');
    logger.warn('Disabling cache...');

    config.cacheEnabled = false;
  }

  redisClient = createClient({ url: `redis://${config.redisHost}:${config.redisPort}` });
}
