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

  // We registered the 4th signer as the IoT device in seed.cjs
  const signers = await hre.ethers.getSigners();
  const iotDevice = signers[3];

  console.log("=========================================");
  console.log("📡 IoT SENSOR BOT STARTED");
  console.log(`Device Address: ${iotDevice.address}`);
  console.log("Targeting Product ID: 1");
  console.log("=========================================\n");

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let count = 0;
  while (true) {
    try {
      count++;
      // Generate a slight fluctuation in temperature
      const temp = (18 + (Math.random() * 2 - 1)).toFixed(2);
      const humidity = (50 + (Math.random() * 5)).toFixed(1);
      
      const payload = `[AUTOMATED TELEMETRY] Container Temp: ${temp}°C | Humidity: ${humidity}%`;
      
      console.log(`[Ping ${count}] Broadcasting telemetry to blockchain...`);
      const tx = await foodTrace.connect(iotDevice).addTelemetry(1, payload);
      await tx.wait();
      
      console.log(`✅ Success! Hash added to Immutable Ledger.`);
      console.log(`Waiting 10 seconds for next ping...\n`);
      
    } catch (err) {
      console.error("❌ Failed to push telemetry. Ensure product ID 1 exists and IoT device is registered.");
      console.error(err.message);
    }
    
    await sleep(10000); // ping every 10 seconds
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
