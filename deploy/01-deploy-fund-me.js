// function deployFunc(hre) {
// 	console.log("hi")
//  hre.getNameAccounts()
//  hre.deployments
// }
// module.exports.default = deployFunc

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
	// const {getNameAccounts, deployments} = hre
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()
	const chainId = await getChainId()

	// console.log("network.config.chainId:", network.config.chainId)
	let ethUsdPriceFeedAddress
	if (chainId === "31337") {
		// when going for localhost or hardhat network we need to use a mock
		// deployments.get: obtain most recent deployment
		const ethUsdAggregator = await deployments.get("MockV3Aggregator")
		ethUsdPriceFeedAddress = ethUsdAggregator.address
	} else {
		// go for testnet
		ethUsdPriceFeedAddress = networkConfig[network.name]["ethUsdPriceFeed"]
	}

	log("Deploying FundMe and waiting for confirmations...")
	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: [ethUsdPriceFeedAddress], // put price feed address
		log: true,
		waitConfirmations:
			networkConfig[network.name]["blockConfirmations"] || 1,
	})
	log(`FundMe deployed at ${fundMe.address}`)

	// verify
	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(fundMe.address, [ethUsdPriceFeedAddress])
	}
	log("----------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
