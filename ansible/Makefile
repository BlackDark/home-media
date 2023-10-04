.DEFAULT_GOAL := install

.PHONY: install
install:
	ansible-galaxy install -r requirements.yml --force

.PHONY: lint
lint:
	ansible-lint
