const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, '../src/contracts');

if (!fs.existsSync(contractsDir)) {
  fs.mkdirSync(contractsDir, { recursive: true });
}

const addressPath = path.join(contractsDir, 'contract-address.json');
if (!fs.existsSync(addressPath)) {
  fs.writeFileSync(addressPath, JSON.stringify({ FoodTraceChain: "" }, null, 2));
  console.log('Created placeholder contract-address.json');
}

const artifactPath = path.join(contractsDir, 'FoodTraceChain.json');
if (!fs.existsSync(artifactPath)) {
  fs.writeFileSync(artifactPath, JSON.stringify({ abi: [] }, null, 2));
  console.log('Created placeholder FoodTraceChain.json');
}
