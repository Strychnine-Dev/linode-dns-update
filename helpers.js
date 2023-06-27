import { getDomains, getDomainRecord, getDomainRecords, updateDomainRecord } from '@linode/api-v4';
import got from 'got';
import { logger } from './config.js';

export async function getPublicIPAddress() {
  try {
    const ipData = await got('http://ifconfig.co').json();

    logger.debug(`IP Address: ${ipData.ip}`);

    return ipData.ip;
  } catch(err) {
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
  } catch(err) {
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
  } catch(err) {
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
