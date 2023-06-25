import got from 'got';
import { getDomains, getDomainRecords, updateDomainRecord } from '@linode/api-v4';
import { config, logger } from './config.js';

(async () => {
  logger.info('Linode DNS Updater');

  let domainId;
  let recordId;
  let target;
  let currentTarget;

  if (config.domainId) {
    domainId = config.domainId;
  } else if (config.domain) {
    try {
      const domains = (await getDomains()).data;
      domainId = domains.find(d => d.domain === config.domain)?.id;
    } catch(err) {
      logger.error(`Error retrieving Linode domains: ${err.message}`);
      logger.error(err.stack);
      process.exit(2);
    }
  }

  if (domainId) {
    logger.debug(`Linode Domain ID: ${domainId}`);
  } else {
    logger.error('Cannot find Linode domain');
    process.exit(1);
  }

  if (config.recordId) {
    recordId = config.recordId;
  } else if (config.hostname) {
    try {
      const records = (await getDomainRecords(domainId)).data;
      const record = records.find(r => r.name === config.hostname.split('.')[0]);

      recordId = record?.id;
      currentTarget = record?.target;
    } catch(err) {
      logger.error(`Error retrieving Linode domain records: ${err.message}`);
      logger.error(err.stack);
      process.exit(2);
    }
  }

  if (recordId) {
    logger.debug(`Linode Domain Record ID: ${domainId}`);
  } else {
    logger.error('Cannot find Linode domain record');
    process.exit(1);
  }

  try {
    target = (await got('http://ifconfig.co').json()).ip;
    logger.debug(`IP Address: ${target}`);
  } catch(err) {
    logger.error(`Error retrieving public ip address: ${err.message}`);
    logger.error(err.stack);
    process.exit(2);
  }

  if (currentTarget === target) {
    logger.info('Hostname is already up to date');
    process.exit(0);
  }

  if (config.NODE_ENV === 'production') {
    try {
      await updateDomainRecord(domainId, recordId, { target });
    } catch(err) {
      logger.error(`Error updating record target: ${err.message}`);
      logger.error(err.stack);
      process.exit(2);
    }
  } else {
    logger.info(`Dry Run: Updating domain ${domainId} record ${recordId} from ${currentTarget} to ${target}`);
  }
})();
