import { setToken } from '@linode/api-v4';
import winston from 'winston';

export const config = {
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  linodeToken: process.env.LINODE_TOKEN,
  domain: process.env.DOMAIN,
  hostname: process.env.HOSTNAME,
  domainId: process.env.DOMAIN_ID,
  recordId: process.env.RECORD_ID,
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
