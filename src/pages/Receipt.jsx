import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ethers } from 'ethers';
import ContractAddress from '../contracts/contract-address.json';
import FoodTraceChainArtifact from '../contracts/FoodTraceChain.json';

export default function Receipt() {
  const { id } = useParams();
  
  const [productData, setProductData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isHashValid, setIsHashValid] = useState(true);

  const fetchProductData = useCallback(async (productId) => {
    if (!productId) return;
    setIsLoading(true);

    try {
      const provider = new ethers.JsonRpcProvider(`${window.location.origin}/rpc`);
      const readContract = new ethers.Contract(
        ContractAddress.FoodTraceChain,
        FoodTraceChainArtifact.abi,
        provider
      );

      const product = await readContract.getProduct(productId);
      
      if (!product.exists) {
        throw new Error("Product does not exist on the blockchain.");
      }
      
      const traceHistory = await readContract.getProductHistory(productId);
      
      setProductData({
        id: product.id.toString(),
        name: product.name,
        creator: product.creator,
        creationTime: new Date(Number(product.creationTime) * 1000).toLocaleString()
      });

      let valid = true;
      
      // Map roles for quick lookup
      const roles = ['Unknown', 'Farmer', 'Processor', 'Distributor', 'Retailer', 'Consumer', 'Automated IoT Sensor'];

      // Fetch roles in parallel for all steps
      const historyPromises = traceHistory.map(async (step, i) => {
        const computedHash = ethers.solidityPackedKeccak256(
          ["uint256", "uint256", "address", "string", "bytes32"],
          [productId, step.timestamp, step.handler, step.data, i === 0 ? ethers.ZeroHash : traceHistory[i-1].stepHash]
        );

        const roleIndex = await readContract.getUserRole(step.handler);
        
        return {
          timestamp: new Date(Number(step.timestamp) * 1000).toLocaleString(),
          role: roles[Number(roleIndex)],
          data: step.data,
          isValid: computedHash === step.stepHash,
          computedHash
        };
      });

      const formattedHistory = await Promise.all(historyPromises);

      // Verify chain validity
      formattedHistory.forEach((step, i) => {
        if (!step.isValid || (i > 0 && traceHistory[i].previousHash !== traceHistory[i-1].stepHash)) {
          valid = false;
        }
      });

      setHistory(formattedHistory);
      setIsHashValid(valid);
    } catch (err) {
      console.error(err);
      setError("Unable to load blockchain data.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (id) {
      Promise.resolve().then(() => fetchProductData(id));
    }
  }, [id, fetchProductData]);

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading Blockchain Ledger...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red', textAlign: 'center', fontFamily: 'sans-serif' }}>{error}</div>;
  }

  return (
    <div style={{ background: '#f5f7f5', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'white', maxWidth: '400px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ background: isHashValid ? '#059669' : '#ef4444', color: 'white', padding: '2rem 1.5rem', textAlign: 'center' }}>
          {isHashValid ? <ShieldCheck size={48} style={{ margin: '0 auto 1rem' }} /> : <ShieldAlert size={48} style={{ margin: '0 auto 1rem' }} />}
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
            {isHashValid ? 'Verified Authentic' : 'Tampering Detected'}
          </h2>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Blockchain Certificate</p>
        </div>

        {/* Product Details */}
        <div style={{ padding: '1.5rem', borderBottom: '2px dashed #e2e8f0' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Product Name</p>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.5rem', color: '#0f172a' }}>{productData.name}</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Blockchain ID</span>
            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>#{productData.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Origin Date</span>
            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{productData.creationTime.split(',')[0]}</span>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Immutable Ledger History</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {history.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CheckCircle2 size={24} color={step.isValid ? '#10b981' : '#ef4444'} />
                  {idx < history.length - 1 && <div style={{ flex: 1, width: '2px', background: '#e2e8f0', margin: '4px 0' }}></div>}
                </div>
                <div style={{ flex: 1, paddingBottom: idx < history.length - 1 ? '1rem' : '0' }}>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold', color: '#0f172a' }}>{step.role}</p>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#64748b' }}>{step.timestamp}</p>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', color: '#334155', border: '1px solid #e2e8f0' }}>
                    {step.data}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Powered by FoodTraceChain</p>
        </div>
      </div>
    </div>
  );
}
