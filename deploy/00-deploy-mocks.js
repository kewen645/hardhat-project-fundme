const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

// sample parameters for MockV3Aggregator
const DECIMALS = 8
const INITIAL_ANSWER = 2000

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()

	// based on the network u pass in to determine if we should use mock or testnet
	// hardhat can use hardhat/localhost, if --network not passed, it means hardhat
	if (developmentChains.includes(network.name)) {
		log("Local network detected, deploying mocks...")
		await deploy("MockV3Aggregator", {
			contract: "MockV3Aggregator",
			from: deployer,
			log: true,
			args: [DECIMALS, INITIAL_ANSWER],
		})
		log("Mocks deployed...")
		log("----------------------------------------------------")
	}
}

// given tags so that we can specify to deploy
// yarn hardhat deploy --tags mocks
module.exports.tags = ["all", "mocks"]
