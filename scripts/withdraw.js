const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
	const { deployer } = await getNamedAccounts()
	const fundMe = await ethers.getContract("FundMe", deployer)
	console.log("Contract withdraw deploying...")
	const transactionResponse = await fundMe.withdraw()
	await transactionResponse.wait(1)
	console.log("withdrawal finished")
}

main()
	.then(() => {
		process.exit(0)
	})
	.catch((error) => {
		console.log(error.message)
		process.exit(1)
	})
