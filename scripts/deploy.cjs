const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const FoodTraceChain = await hre.ethers.getContractFactory("FoodTraceChain");
  const foodTraceChain = await FoodTraceChain.deploy();

  await foodTraceChain.waitForDeployment();
  const address = await foodTraceChain.getAddress();

  console.log("FoodTraceChain deployed to:", address);

  // Save the contract's artifacts and address to the frontend directory
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ FoodTraceChain: address }, undefined, 2)
  );

  const FoodTraceChainArtifact = artifacts.readArtifactSync("FoodTraceChain");

  fs.writeFileSync(
    contractsDir + "/FoodTraceChain.json",
    JSON.stringify(FoodTraceChainArtifact, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
