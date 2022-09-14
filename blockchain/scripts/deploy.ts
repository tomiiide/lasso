import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const maxSwaps: string = "4"
  const exchangeAddress: string = process.env.EXCHANGE! // 1inch

  const LassoSwap = await ethers.getContractFactory("LassoSwap");
  const lassoSwap = await LassoSwap.deploy(exchangeAddress, maxSwaps);

  console.log(`Transaction hash: ${lassoSwap.deployTransaction.hash}`)
  await lassoSwap.deployed();

  console.log(`LassoSwap deployed to ${lassoSwap.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
