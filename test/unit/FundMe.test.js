const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

// only do unit test on development networks
!developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", () => {
			let fundMe, deployer, mockV3Aggregator
			const sendValue = ethers.utils.parseEther("0.02")

			beforeEach(async () => {
				// deploy fundMe contract
				// using hardhat deploy
				// fixture function to run the deployment and snapshot it
				// so that tests don't need to perform all the deployment transactions every time.
				// best example would be using it in beforeEach

				// const accounts = await getSigners()
				// const accountZero = accounts[0]
				deployer = (await getNamedAccounts()).deployer
				await deployments.fixture(["all"])
				fundMe = await ethers.getContract("FundMe", deployer)
				mockV3Aggregator = await ethers.getContract(
					"MockV3Aggregator",
					deployer
				)
			})

			describe("constructor", () => {
				it("set the aggregator addresses correctly", async () => {
					const response = await fundMe.getPriceFeed()
					assert.equal(response, mockV3Aggregator.address)
				})
			})

			describe("fund", () => {
				it("Fails if you don't send enough ETH", () => {
					expect(fundMe.fund()).to.be.revertedWith(
						"You need to spend more ETH!"
					)
				})

				it("Updated the amount funded data structure", async () => {
					// 因为用了library，所以第一个参数自动传入就是msg.value
					await fundMe.fund({ value: sendValue })

					const response = await fundMe.getAddressToAmountFunded(
						deployer
					)
					assert.equal(response.toString(), sendValue.toString())
				})

				it("Adds funder to array of funders", async () => {
					await fundMe.fund({ value: sendValue })
					const funder = await fundMe.getFunder(0)
					assert.equal(funder, deployer)
				})
			})

			describe("withdraw", () => {
				beforeEach(async () => {
					await fundMe.fund({ value: sendValue })
				})

				it("withdraw ETH from a single funder", async () => {
					// Arrange
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)
					// Act
					const transactionResponse = await fundMe.cheaperWithdraw()
					const transactionReceipt = await transactionResponse.wait(1)

					// gasCost
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice)

					const endingingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)
					// Assert
					assert.equal(endingingFundMeBalance, 0)
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)
				})

				it("allow us to withdraw from multiple funders", async () => {
					// hardhat has default 20 signers for testing
					const accounts = await ethers.getSigners()
					// index 0 would be the deployer
					// Arrange
					for (let i = 1; i < 6; i++) {
						// 遍历里面每一个合约对象
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i]
						)
						// 转钱
						await fundMeConnectedContract.fund({ value: sendValue })
					}
					// 我的合约信息
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					// Act
					// withdrawal
					const transactionResponse = await fundMe.cheaperWithdraw()
					const transactionReceipt = await transactionResponse.wait(1)
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice)

					const endingingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)
					// my final balance data
					assert.equal(endingingFundMeBalance, 0)
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)

					// make sure that funders are reset properly
					await expect(fundMe.getFunder(0)).to.be.reverted

					for (let i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						)
					}
				})

				it("Only allows the owner to withdraw funds", async () => {
					const accounts = await ethers.getSigners()
					const attackerConnectedContract = await fundMe.connect(
						accounts[1]
					)
					expect(
						attackerConnectedContract.cheaperWithdraw()
					).to.be.revertedWith("FundMe__NotOwner")
				})
			})
	  })
