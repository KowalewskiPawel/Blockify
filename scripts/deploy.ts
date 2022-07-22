import { ethers } from "hardhat";

async function main() {
  const Blockify = await ethers.getContractFactory("Blockify");
  const BlockifyContract = await Blockify.deploy();

  await BlockifyContract.deployed();

  console.log("Blockify deployed to:", BlockifyContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
