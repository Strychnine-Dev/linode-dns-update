import { config, logger } from './config.js';
import {
  getLinodeDomainId,
  getLinodeDomainRecord,
  getLinodeDomainRecordById,
  getPublicIPAddress,
  updateLinodeDomainRecord,
} from './helpers.js';

(async () => {
  logger.info('Linode DNS Updater');

  let domainId;
  let recordId;
  let target;
  let currentTarget;

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

    const record = await getLinodeDomainRecordById(domainId, recordId);

    if (record) {
      currentTarget = record?.target;
    } else {
      logger.error(`Error: Record ${recordId} does not exist on domain ${domainId}`);
      process.exit(1);
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
    process.exit(0);
  }

  if (config.NODE_ENV === 'production') {
    await updateLinodeDomainRecord(domainId, recordId, target);
  } else {
    logger.info(`Dry Run: Updating domain ${domainId} record ${recordId} from ${currentTarget} to ${target}`);
  }
})();
