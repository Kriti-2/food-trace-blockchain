import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Leaf, ScanLine, LayoutDashboard, Wallet, LogOut, Database } from 'lucide-react';
import FoodTraceChainArtifact from './contracts/FoodTraceChain.json';
import ContractAddress from './contracts/contract-address.json';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TrackProduct from './pages/TrackProduct';
import Receipt from './pages/Receipt';
import AdminDashboard from './pages/Admin';
import { useLocation } from 'react-router-dom';

function AppContent({ account, contract, userRole, setUserRole, connectWallet, disconnectWallet }) {
  const location = useLocation();
  const isReceipt = location.pathname.startsWith('/receipt');

  return (
    <>
      {!isReceipt && (
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            <Leaf className="text-primary" />
            FoodTraceChain
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="btn btn-outline" style={{ border: 'none', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Database size={18} /> Global Ledger
            </Link>
            <Link to="/track" className="btn btn-outline">
              <ScanLine size={18} /> Verify Product
            </Link>
            
            {account ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="btn btn-outline">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '2rem' }}>
                  <Wallet size={16} className="text-primary" />
                  <span className="text-sm font-mono">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                  <button onClick={disconnectWallet} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: '0.5rem' }}>
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={connectWallet}>
                <Wallet size={18} /> Connect Wallet
              </button>
            )}
          </div>
        </nav>
      )}

      <main className={isReceipt ? "" : "app-container"} style={isReceipt ? { padding: 0 } : {}}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard account={account} contract={contract} userRole={userRole} setUserRole={setUserRole} />} />
          <Route path="/track" element={<TrackProduct contract={contract} />} />
          <Route path="/track/:id" element={<TrackProduct contract={contract} />} />
          <Route path="/receipt/:id" element={<Receipt />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(0);

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return;
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    
    if (accounts.length > 0) {
      setAccount(accounts[0].address);
      const signer = await provider.getSigner();
      const foodTraceContract = new ethers.Contract(
        ContractAddress.FoodTraceChain,
        FoodTraceChainArtifact.abi,
        signer
      );
      
      setContract(foodTraceContract);
      
      const registered = await foodTraceContract.isRegistered(accounts[0].address);
      if (registered) {
        const role = await foodTraceContract.getUserRole(accounts[0].address);
        setUserRole(Number(role));
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask!");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      
      const signer = await provider.getSigner();
      const foodTraceContract = new ethers.Contract(
        ContractAddress.FoodTraceChain,
        FoodTraceChainArtifact.abi,
        signer
      );
      
      setContract(foodTraceContract);
      
      const registered = await foodTraceContract.isRegistered(accounts[0]);
      if (registered) {
        const role = await foodTraceContract.getUserRole(accounts[0]);
        setUserRole(Number(role));
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => checkIfWalletIsConnected());
  }, []);

  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setUserRole(0);
  };

  return (
    <Router>
      <AppContent 
        account={account}
        contract={contract}
        userRole={userRole}
        setUserRole={setUserRole}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />
    </Router>
  );
}

export default App;
