.PHONY: start-api deploy-dev test

start-api:
	sam build && sam local start-api

deploy-dev:
	sam build && sam deploy --config-env dev

test:
	npm run test