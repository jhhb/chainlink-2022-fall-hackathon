.PHONY: test compile lint deploy node console deploy-goerli

test:
	yarn hardhat test

compile:
	yarn hardhat compile

lint:
	yarn solhint contracts/*

deploy:
	yarn hardhat deploy --network localhost

node:
	yarn hardhat node

console:
	yarn hardhat console --network localhost

deploy-goerli:
	yarn hardhat deploy --network goerli;
