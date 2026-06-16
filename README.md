# 🌿 FoodTraceChain

A decentralized supply chain traceability DApp built on Ethereum that enables transparent, tamper-proof tracking of food products from farm to consumer.

![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Hardhat](https://img.shields.io/badge/Hardhat-2.28-FFF100?logo=hardhat)
![Ethers.js](https://img.shields.io/badge/Ethers.js-6-2535A0)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)

---

## 📌 Overview

**FoodTraceChain** ensures food safety and authenticity by recording every stage of the supply chain on the blockchain. Each step — from farming to retail — is immutably logged with cryptographic hash chaining, providing consumers with a verifiable, tamper-proof product journey.

### Key Highlights

- 🔗 **Blockchain-backed traceability** — Every supply chain step is permanently recorded on-chain
- 🔐 **Role-based access control** — Farmer, Processor, Distributor, Retailer, Consumer & IoT Sensor roles
- 📱 **QR Code verification** — Consumers can scan QR codes to instantly verify product authenticity
- 🌡️ **IoT Telemetry** — Automated sensor data logging (temperature, humidity) for cold-chain compliance
- 🧾 **Digital Receipts** — Shareable, printable product certificates with full trace history
- ⛓️ **Hash Chaining** — Each trace step is cryptographically linked to the previous one for integrity verification

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)           │
│  Landing Page │ Dashboard │ Track │ Receipt │ Admin  │
└────────────────────────┬────────────────────────────┘
                         │ ethers.js
                         ▼
┌─────────────────────────────────────────────────────┐
│              FoodTraceChain Smart Contract           │
│         (Solidity ^0.8.20 on Hardhat Network)       │
│                                                     │
│  • User Registration & Role Management              │
│  • Product Creation (Farmer-only)                   │
│  • Stage Transitions (Role-enforced)                │
│  • IoT Telemetry Logging                            │
│  • Hash-Chained Trace History                       │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Features

### Supply Chain Roles

| Role | Capabilities |
|------|-------------|
| 🧑‍🌾 **Farmer** | Create new products, log initial harvest data |
| 🏭 **Processor** | Process raw materials, update product stage |
| 🚚 **Distributor** | Log distribution & logistics data |
| 🏪 **Retailer** | Mark product as available for sale |
| 🛒 **Consumer** | Purchase product, verify full trace history |
| 🌡️ **IoT Sensor** | Automated telemetry data logging |

### Product Lifecycle

```
Farmed → Processed → Distributed → Retailed → Sold
```

Each transition is:
- **Role-enforced** — Only the authorized role can advance the product
- **Immutably recorded** — Stored on-chain with timestamp and handler address
- **Hash-chained** — Cryptographically linked to the previous step

### Pages

- **Landing Page** — Hero section with project overview and call to action
- **Dashboard** — Role-based interface for managing products and supply chain operations
- **Track / Verify Product** — Look up any product by ID and view its full trace history
- **Receipt** — QR-code enabled digital certificate for product authenticity
- **Global Ledger (Admin)** — Overview of all products and their current status

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Solidity ^0.8.20 |
| **Development Framework** | Hardhat 2.28 |
| **Frontend** | React 19, React Router 7 |
| **Build Tool** | Vite 8 |
| **Blockchain Interaction** | Ethers.js 6 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **QR Codes** | qrcode.react |
| **Wallet** | MetaMask |

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MetaMask](https://metamask.io/) browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/Kriti-2/food-trace-blockchain.git
cd food-trace-blockchain

# Install dependencies
npm install
```

### Run Local Blockchain

```bash
# Start a local Hardhat node (keep this terminal open)
npx hardhat node
```

### Deploy Smart Contract

```bash
# In a new terminal, deploy the contract to the local network
npx hardhat run scripts/deploy.cjs --network localhost
```

### Start the Frontend

```bash
# Start the Vite dev server
npm run dev
```

The app will be available at `http://localhost:5173`

### Connect MetaMask

1. Open MetaMask and add a custom network:
   - **Network Name:** Hardhat Local
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** ETH
2. Import accounts from Hardhat's test accounts (private keys shown in the `npx hardhat node` terminal)
3. Switch between imported accounts to simulate different supply chain roles

---

## 📂 Project Structure

```
food-trace-blockchain/
├── contracts/
│   └── FoodTraceChain.sol      # Main smart contract
├── scripts/
│   ├── deploy.cjs              # Contract deployment script
│   ├── seed.cjs                # Seed data script for demo
│   └── iot-bot.cjs             # Simulated IoT sensor bot
├── src/
│   ├── contracts/              # Auto-generated ABI & address
│   ├── pages/
│   │   ├── LandingPage.jsx     # Hero landing page
│   │   ├── Dashboard.jsx       # Role-based dashboard
│   │   ├── TrackProduct.jsx    # Product verification
│   │   ├── Receipt.jsx         # Digital certificate
│   │   └── Admin.jsx           # Global ledger view
│   ├── App.jsx                 # Main app with routing & wallet
│   ├── App.css                 # Application styles
│   ├── index.css               # Global design system
│   └── main.jsx                # React entry point
├── hardhat.config.cjs          # Hardhat configuration
├── vite.config.js              # Vite configuration
└── package.json
```

---

## 📜 Smart Contract

The `FoodTraceChain` contract (`contracts/FoodTraceChain.sol`) implements:

- **User Registration** — `registerUser(name, role)` — Self-registration with role selection
- **Product Creation** — `createProduct(name, initialData)` — Farmer-only product creation
- **Stage Updates** — `updateProductStage(productId, data)` — Role-enforced state transitions
- **IoT Telemetry** — `addTelemetry(productId, data)` — Sensor data logging without stage change
- **Queries** — `getProduct()`, `getProductHistory()`, `getUser()`, `getUserRole()`

### Events

| Event | Description |
|-------|-------------|
| `UserRegistered` | Emitted when a new user registers |
| `ProductCreated` | Emitted when a farmer creates a product |
| `ProductUpdated` | Emitted on every stage transition or telemetry log |

---

## 🧪 Demo Workflow

1. **Start** the local blockchain and deploy the contract
2. **Register** as a Farmer using MetaMask Account #1
3. **Create** a product (e.g., "Organic Apples")
4. **Switch** MetaMask to Account #2, register as Processor, advance the product
5. **Repeat** with Distributor (Account #3) and Retailer (Account #4)
6. **Verify** the full trace on the Track page or scan the QR code
7. **Run** `node scripts/iot-bot.cjs` to simulate IoT telemetry data

---

## 👩‍💻 Author

**Kriti Gupta** — [@Kriti-2](https://github.com/Kriti-2)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
