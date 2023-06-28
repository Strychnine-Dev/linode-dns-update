import { getDomains, getDomainRecord, getDomainRecords, updateDomainRecord } from '@linode/api-v4';
import got from 'got';
import { config, logger, redisClient } from './config.js';

export async function getPublicIPAddress() {
  try {
    const ipData = await got('http://ifconfig.co').json();

    logger.debug(`IP Address: ${ipData.ip}`);

    return ipData.ip;
  } catch (err) {
    logger.error(`Error retrieving public ip address: ${err.message}`);
    logger.error(err.stack);
    process.exit(2);
  }
}

export async function getLinodeDomainId(domainName) {
  try {
    const domains = (await getDomains()).data;
    const domain = domains.find(d => d.domain === domainName);

    logger.debug(`Linode Domain ID: ${domain.id}`);

    return domain.id;
  } catch (err) {
    logger.error(`Error retrieving Linode domains: ${err.message}`);
    logger.error(err.stack);
    process.exit(2);
  }
}

export async function getLinodeDomainRecord(domainId, hostname) {
  try {
    const records = (await getDomainRecords(domainId)).data;
    const record = records.find(r => r.name === hostname.split('.')[0]);

    logger.debug(`Linode Domain Record ID: ${record.id}`);
    logger.debug(`Current Target: ${record.target}`);

    return record;
  } catch (err) {
    logger.error(`Error retrieving Linode domain records: ${err.message}`);
    logger.error(err.stack);
    process.exit(2);
  }
}

export async function getLinodeDomainRecordById(domainId, recordId) {
  try {
    const record = await getDomainRecord(domainId, recordId);

    logger.debug(`Current Target: ${record.target}`);

    return record;
  } catch (err) {
    logger.error(`Error retrieving Linode domain record: ${err.message}`);
    logger.error(err.stack);
    process.exit(2);
  }
}

export async function updateLinodeDomainRecord(domainId, recordId, target) {
  try {
    await updateDomainRecord(domainId, recordId, { target });
  } catch(err) {
    logger.error(`Error updating record target: ${err.message}`);
    logger.error(err.stack);
    process.exit(2);
  }
}

export async function connectRedisHost() {
  try {
    await redisClient.connect();

    logger.debug(`Connected to Redis host on ${config.redisHost}:${config.redisPort}`);

    redisClient.on('error', err => {
      config.cacheEnabled = false;
      logger.warn(`Warning! Error performing Redis call: ${err.message}`);
      logger.warn('Disabling cache...');
    });
  } catch (err) {
    config.cacheEnabled = false;
    logger.warn(`Warning! Could not connect to Redis: ${err.message}`);
    logger.warn('Disabling cache...');
  }
}

export async function cacheCurrentTarget(recordId, target) {
  logger.debug(`Caching target IP ${target} for record ${recordId}`);

  try {
    await redisClient.set(`${recordId}`, target, {
      EX: config.cacheTimeout > 0 ? config.cacheTimeout : undefined,
    });
  } catch (err) {
    config.cacheEnabled = false;
    logger.warn(`Warning! Error setting Redis key: ${err.message}`);
    logger.warn('Disabling cache...');
  }
}

export async function getTargetFromCache(recordId) {
  try {
    const cachedTarget = await redisClient.get(`${recordId}`);

    logger.debug(`Using target IP from cache: ${cachedTarget}`);

    return cachedTarget;
  } catch (err) {
    config.cacheEnabled = false;
    logger.warn(`Warning! Error reading Redis key: ${err.message}`);
    logger.warn('Disabling cache...');
  }
}

export async function disconnectRedisHost() {
  try {
    await redisClient.quit();

    logger.debug('Disconnected from Redis host');
  } catch (err) {
    logger.warn(`Warning! Error disconnecting from Redis host: ${err.message}`);
  }
}
