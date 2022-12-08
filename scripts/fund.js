const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
	const { deployer } = await getNamedAccounts()
	const fundMe = await ethers.getContract("FundMe", deployer)
	console.log("Contract fund deploying...")
	const transactionResponse = await fundMe.fund({
		value: ethers.utils.parseEther("0.05"),
	})
	await transactionResponse.wait(1)
	console.log("Funded...")
}

main()
	.then(() => {
		process.exit(0)
	})
	.catch((err) => {
		console.log(err.message)
		process.exit(1)
	})
