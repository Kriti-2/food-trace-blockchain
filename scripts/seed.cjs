const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const contractsDir = __dirname + "/../src/contracts";
  const contractAddressPath = contractsDir + "/contract-address.json";
  
  if (!fs.existsSync(contractAddressPath)) {
    console.error("Please deploy the contract first");
    return;
  }
  
  const addressJson = JSON.parse(fs.readFileSync(contractAddressPath, "utf-8"));
  const contractAddress = addressJson.FoodTraceChain;

  const FoodTraceChain = await hre.ethers.getContractFactory("FoodTraceChain");
  const foodTrace = FoodTraceChain.attach(contractAddress);

  const [deployer, processor, distributor, iotDevice] = await hre.ethers.getSigners();

  console.log("Seeding data...");

  try {
    const isRegistered = await foodTrace.isRegistered(deployer.address);
    if (!isRegistered) {
      await (await foodTrace.connect(deployer).registerUser("Green Valley Farms", 1)).wait();
      console.log("Registered Farmer");
    }

    console.log("Creating Sample Product...");
    await (await foodTrace.connect(deployer).createProduct("Premium Organic Coffee Beans", "Harvested at 1500m altitude. Humidity 60%.")).wait();
    console.log("Product Created! ID: 1");

    await (await foodTrace.connect(processor).registerUser("RoastMasters Inc.", 2)).wait();
    await (await foodTrace.connect(processor).updateProductStage(1, "Beans roasted at 200°C for 15 minutes. Packaged in vacuum seal.")).wait();
    console.log("Product updated by Processor");

    await (await foodTrace.connect(distributor).registerUser("Global Logistics", 3)).wait();
    await (await foodTrace.connect(distributor).updateProductStage(1, "Shipped via cold chain. Current temp: 18°C. Destination: NY Hub.")).wait();
    console.log("Product updated by Distributor");

    await (await foodTrace.connect(iotDevice).registerUser("ThermoTracker X-1", 6)).wait();
    console.log("Registered Automated IoT Sensor");

    console.log("Seeding complete! You can now track Product ID: 1");
  } catch (err) {
    console.log("Error seeding (might already be seeded):", err.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
