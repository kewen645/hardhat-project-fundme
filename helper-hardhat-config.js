const networkConfig = {
	localhost: {},
	hardhat: {},
	goerli: {
		ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
		blockConfirmations: 6,
	},
	polygon: {
		ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
		blockConfirmations: 6,
	},
}
const developmentChains = ["hardhat", "localhost"]

module.exports = {
	networkConfig,
	developmentChains,
}
