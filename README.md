# Containerized Dynamic DNS Agent for Linode

Updates a Linode DNS domain record with your public IP address

## Environment Variables

| Name              | Description                                                                       | Required              |
| ---               | ---                                                                               | ---                   |
| LINODE_TOKEN      | Linode Personal Access Token with Domain Read/Write scope minimum.                | Yes                   |
| DOMAIN            | The Linode domain containing the hostname to be updated.                          | DOMAIN or DOMAIN_ID   |
| DOMAIN_ID         | The Linode domain ID containing the hostname to be updated.                       | DOMAIN or DOMAIN_ID   |
| HOSTNAME          | The Linode domain record (hostname) to be updated.                                | HOSTNAME or RECORD_ID |
| RECORD_ID         | The Linode domain record ID of the hostname to be updated.                        | HOSTNAME or RECORD_ID |
| NODE_ENV          | Node environment, defaults to `production`.                                       | No                    |
| LOG_LEVEL         | Log level, defaults to `info`. Other values: `debug`.                             | No                    |
| ENABLE_CACHE      | Use Redis to cache API results. Values: `true` or `false`, defaults to `false`.   | No                    |
| REDIS_HOST        | Redis host, defaults to `localhost`.                                              | No                    |
| REDIS_PORT        | Redis port, defaults to  `6379`.                                                  | No                    |
| CACHE_TIMEOUT     | Cache timeout in seconds. Set to `-1` to disable, defaults to `3600` (1 hour).    | No                    |

**NOTE:** To reduce API calls to Linode, pass DOMAIN_ID and RECORD_ID rather than DOMAIN and HOSTNAME for automated scripts.

**NOTE:** You can determine your domain and record IDs by running this script with `LOG_LEVEL=debug`.

**NOTE:** To utilize cache, you must set `DOMAIN_ID` and `RECORD_ID` in your environment.

## Docker

You can run this script as a Docker container by passing the required variables above.

```bash
# build the container
make build

# update your DNS record
make run LINODE_TOKEN=abc123 DOMAIN=mydomain.com HOSTNAME=myname.mydomain.com
  # or
make run LINODE_TOKEN=abc123 DOMAIN_ID=476 RECORD_ID=128
```

## Kubernetes (Helm)

You can install this script as a Kubernetes CronJob via helm. By default the job will run every 15 minutes, but you can configure your own values for the chart.

```bash
make install LINODE_TOKEN=abc123 DOMAIN=mydomain.com HOSTNAME=myname.mydomain.com
  # or
make install LINODE_TOKEN=abc123 DOMAIN_ID=476 RECORD_ID=128
```

## Node

For development, or to run the script outside of a container, you can run the script with Node.JS.

```bash
# environment
export LOG_LEVEL=debug
export LINODE_TOKEN=abc123
export DOMAIN=mydomain.com
export HOSTNAME=myname.mydomain.com

# setup
npm install

# update your DNS record
node app
```
