.PHONY: start-api deploy-dev

start-api:
	sam build && sam local start-api

deploy-dev:
	sam build && sam deploy --config-env dev