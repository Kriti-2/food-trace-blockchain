import { useState, useEffect, useCallback } from 'react';
import { Shield, PackageSearch, Activity, Database, Server } from 'lucide-react';
import { ethers } from 'ethers';
import ContractAddress from '../contracts/contract-address.json';
import FoodTraceChainArtifact from '../contracts/FoodTraceChain.json';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [networkStats, setNetworkStats] = useState({
    blockNumber: 0,
    totalProducts: 0
  });

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(`${window.location.origin}/rpc`);
      const readContract = new ethers.Contract(
        ContractAddress.FoodTraceChain,
        FoodTraceChainArtifact.abi,
        provider
      );

      const blockNum = await provider.getBlockNumber();
      const nextId = await readContract.nextProductId();
      const total = Number(nextId) - 1;

      setNetworkStats({
        blockNumber: blockNum,
        totalProducts: total
      });

      const products = [];
      const states = ['Farmed', 'Processed', 'Distributed', 'Retailed', 'Sold'];

      // Fetch all products by iterating through IDs
      for (let i = 1; i <= total; i++) {
        const p = await readContract.getProduct(i);
        if (p.exists) {
          products.push({
            id: p.id.toString(),
            name: p.name,
            creator: p.creator,
            state: states[Number(p.state)],
            date: new Date(Number(p.creationTime) * 1000).toLocaleString()
          });
        }
      }

      setAllProducts(products.reverse()); // Show newest first
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchAllData());
  }, [fetchAllData]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="flex items-center gap-2">
            <Shield className="text-secondary" /> System Administrator
          </h2>
          <p className="text-muted">Global overview of the entire FoodTrace blockchain network.</p>
        </div>
        <button onClick={fetchAllData} className="btn btn-outline text-sm">
          Refresh Ledger
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card flex items-center gap-4">
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#3b82f6' }}>
            <Database size={24} />
          </div>
          <div>
            <p className="text-muted mb-0 text-sm">Total Products Tracked</p>
            <h3 style={{ margin: 0 }}>{networkStats.totalProducts}</h3>
          </div>
        </div>

        <div className="glass-card flex items-center gap-4">
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: '#10b981' }}>
            <Activity size={24} />
          </div>
          <div>
            <p className="text-muted mb-0 text-sm">Current Block Height</p>
            <h3 style={{ margin: 0 }}>#{networkStats.blockNumber}</h3>
          </div>
        </div>

        <div className="glass-card flex items-center gap-4">
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#8b5cf6' }}>
            <Server size={24} />
          </div>
          <div>
            <p className="text-muted mb-0 text-sm">Network Status</p>
            <h3 style={{ margin: 0, color: '#10b981' }}>Online & Syncing</h3>
          </div>
        </div>
      </div>

      {/* Global Ledger Table */}
      <div className="glass-card p-0" style={{ overflow: 'hidden' }}>
        <div className="p-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.02)' }}>
          <h3 className="mb-0 flex items-center gap-2" style={{ fontSize: '1.1rem' }}>
            <PackageSearch size={18} className="text-primary" /> Global Product Ledger
          </h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-muted">Scanning blockchain blocks...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '1rem' }}>ID</th>
                  <th style={{ padding: '1rem' }}>Product Name</th>
                  <th style={{ padding: '1rem' }}>Current Stage</th>
                  <th style={{ padding: '1rem' }}>Creation Date</th>
                  <th style={{ padding: '1rem' }}>Origin Farmer Wallet</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-muted">No products found on the network.</td>
                  </tr>
                ) : (
                  allProducts.map(p => (
                    <tr key={p.id} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{p.id}</td>
                      <td style={{ padding: '1rem' }}>{p.name}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          background: p.state === 'Sold' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                          color: p.state === 'Sold' ? '#10b981' : '#f59e0b',
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold'
                        }}>
                          {p.state}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{p.date}</td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {p.creator.substring(0,6)}...{p.creator.substring(38)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Link to={`/track/${p.id}`} className="text-primary hover:underline font-bold text-sm">
                          View Trace
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
