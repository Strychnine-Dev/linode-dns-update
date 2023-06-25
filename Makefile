build:
	docker build . -t linode-dns-update:latest

run:
	docker run -it --rm \
		-e LINODE_TOKEN=$$LINODE_TOKEN \
		-e DOMAIN=$$DOMAIN \
		-e HOSTNAME=$$HOSTNAME \
		-e DOMAIN_ID=$$DOMAIN_ID \
		-e RECORD_ID=$$RECORD_ID \
	linode-dns-update:latest
