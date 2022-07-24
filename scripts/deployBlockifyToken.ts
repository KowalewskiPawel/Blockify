import { ethers } from "hardhat";

async function main() {
  const BlockifyToken = await ethers.getContractFactory("BlockifyToken");
  const BlockifyTokenContract = await BlockifyToken.deploy();

  await BlockifyTokenContract.deployed();

  console.log("Blockify Token deployed to:", BlockifyTokenContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
