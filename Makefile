build:
	docker build . -t linode-dns-update:latest

# Usage: `make run LINODE_TOKEN=abc123 DOMAIN=mydomain.com HOSTNAME=myname.mydomain.com`
# Usage: `make run LINODE_TOKEN=abc123 DOMAIN_ID=476 RECORD_ID=128`
run:
	docker run -it --rm \
		-e LINODE_TOKEN=$$LINODE_TOKEN \
		-e DOMAIN=$$DOMAIN \
		-e HOSTNAME=$$HOSTNAME \
		-e DOMAIN_ID=$$DOMAIN_ID \
		-e RECORD_ID=$$RECORD_ID \
	linode-dns-update:latest

push:
	docker tag linode-dns-update:latest registry.strychnine.io/linode-dns-update:1.0.0
	docker tag linode-dns-update:latest registry.strychnine.io/linode-dns-update:latest
	docker push registry.strychnine.io/linode-dns-update:1.0.0
	docker push registry.strychnine.io/linode-dns-update:latest

# Usage: `make install LINODE_TOKEN=abc123 DOMAIN=mydomain.com HOSTNAME=myname.mydomain.com`
# Usage: `make install LINODE_TOKEN=abc123 DOMAIN_ID=476 RECORD_ID=128`
install:
	helm install linode-dns-update helm/linode-dns-update --set linode.token=$$LINODE_TOKEN --set linode.domain=$$DOMAIN --set linode.hostname=$$HOSTNAME --set linode.domainId=$$DOMAIN_ID --set linode.recordId=$$RECORD_ID

uninstall:
	helm uninstall linode-dns-update
