require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("@nomiclabs/hardhat-solhint")
require("dotenv").config()

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	// configure additional compiler versions
	solidity: {
		compilers: [{ version: "0.8.8" }, { version: "0.7.6" }],
	},
	defaultNetwork: "hardhat",
	networks: {
		goerli: {
			url: GOERLI_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 5,
		},
		polygon: {
			url: MUMBAI_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 80001,
		},
	},
	gasReporter: {
		enabled: false,
		currency: "USD",
		outputFile: "gas-reporter.txt",
		// coinmarketcap: COINMARKETCAP_API_KEY,
		noColors: true,
		token: "ETH",
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	namedAccounts: {
		deployer: {
			default: 0,
			1: 0,
		},
	},
}
