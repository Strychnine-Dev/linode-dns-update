import { config, logger } from './config.js';
import {
  cacheCurrentTarget,
  connectRedisHost,
  disconnectRedisHost,
  getLinodeDomainId,
  getLinodeDomainRecord,
  getLinodeDomainRecordById,
  getPublicIPAddress,
  getTargetFromCache,
  updateLinodeDomainRecord,
} from './helpers.js';

(async () => {
  logger.info('Linode DNS Updater');

  let domainId;
  let recordId;
  let target;
  let currentTarget;

  if (config.cacheEnabled) {
    await connectRedisHost();
  }

  if (config.domainId) {
    domainId = config.domainId;
  } else if (config.domain) {
    domainId = await getLinodeDomainId(config.domain);
  }

  if (!domainId) {
    logger.error('Cannot find Linode domain');
    process.exit(1);
  }

  if (config.recordId) {
    recordId = config.recordId;

    if (config.cacheEnabled) {
      currentTarget = await getTargetFromCache(recordId);
    }

    if (!currentTarget) {
      const record = await getLinodeDomainRecordById(domainId, recordId);

      if (record) {
        currentTarget = record?.target;

        if (config.cacheEnabled) {
          await cacheCurrentTarget(recordId, currentTarget);
        }
      } else {
        logger.error(`Error: Record ${recordId} does not exist on domain ${domainId}`);
        process.exit(1);
      }
    }
  } else if (config.hostname) {
    const record = await getLinodeDomainRecord(domainId, config.hostname);

    recordId = record?.id;
    currentTarget = record?.target;
  }

  if (!recordId) {
    logger.error('Cannot find Linode domain record');
    process.exit(1);
  }

  target = await getPublicIPAddress();

  if (currentTarget === target) {
    logger.info('Hostname is already up to date');

    if (config.cacheEnabled) {
      await disconnectRedisHost();
    }

    process.exit(0);
  }

  if (config.NODE_ENV === 'production') {
    await updateLinodeDomainRecord(domainId, recordId, target);
  } else {
    logger.info(`Dry Run: Updating domain ${domainId} record ${recordId} from ${currentTarget} to ${target}`);
  }

  if (config.cacheEnabled) {
    await disconnectRedisHost();
  }
})();
