import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, Clock, ShieldAlert, Link as LinkIcon, Info, Download } from 'lucide-react';
import { ethers } from 'ethers';
import { QRCodeCanvas } from 'qrcode.react';
import ContractAddress from '../contracts/contract-address.json';
import FoodTraceChainArtifact from '../contracts/FoodTraceChain.json';

export default function TrackProduct({ contract }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [searchInput, setSearchInput] = useState(id || '');
  const [productData, setProductData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHashValid, setIsHashValid] = useState(true);

  // Initialize a read-only contract if wallet is not connected
  const getReadOnlyContract = useCallback(() => {
    if (contract) return contract;
    // Use Vite proxy so phones on local network can read the blockchain
    const provider = new ethers.JsonRpcProvider(`${window.location.origin}/rpc`);
    return new ethers.Contract(
      ContractAddress.FoodTraceChain,
      FoodTraceChainArtifact.abi,
      provider
    );
  }, [contract]);

  const fetchProductData = useCallback(async (productId) => {
    if (!productId) return;
    setIsLoading(true);
    setError('');
    setProductData(null);
    setHistory([]);
    setIsHashValid(true);

    try {
      const readContract = getReadOnlyContract();
      const product = await readContract.getProduct(productId);
      
      if (!product.exists) {
        throw new Error("Product does not exist on the blockchain.");
      }
      
      const traceHistory = await readContract.getProductHistory(productId);
      
      setProductData({
        id: product.id.toString(),
        name: product.name,
        creator: product.creator,
        state: Number(product.state),
        creationTime: new Date(Number(product.creationTime) * 1000).toLocaleString()
      });

      let valid = true;
      
      // Map roles for quick lookup
      const roles = ['Unknown', 'Farmer', 'Processor', 'Distributor', 'Retailer', 'Consumer', 'Automated IoT Sensor'];

      // Fetch roles and verify hashes in parallel
      const historyPromises = traceHistory.map(async (step, i) => {
        const computedHash = ethers.solidityPackedKeccak256(
          ["uint256", "uint256", "address", "string", "bytes32"],
          [productId, step.timestamp, step.handler, step.data, i === 0 ? ethers.ZeroHash : traceHistory[i-1].stepHash]
        );

        const roleIndex = await readContract.getUserRole(step.handler);
        
        return {
          timestamp: new Date(Number(step.timestamp) * 1000).toLocaleString(),
          handler: step.handler,
          role: roles[Number(roleIndex)],
          data: step.data,
          stepHash: step.stepHash,
          previousHash: step.previousHash,
          isValid: computedHash === step.stepHash && step.previousHash === (i === 0 ? ethers.ZeroHash : traceHistory[i-1].stepHash),
          isIoT: Number(roleIndex) === 6,
          computedHash
        };
      });

      const formattedHistory = await Promise.all(historyPromises);

      // Final chain verification
      formattedHistory.forEach((step, i) => {
        if (!step.isValid || (i > 0 && traceHistory[i].previousHash !== traceHistory[i-1].stepHash)) {
          valid = false;
        }
      });

      setHistory(formattedHistory);
      setIsHashValid(valid);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch product data. Make sure local node is running.");
    }
    setIsLoading(false);
  }, [getReadOnlyContract]);

  useEffect(() => {
    if (id) {
      Promise.resolve().then(() => fetchProductData(id));
    }
  }, [id, fetchProductData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput) {
      navigate(`/track/${searchInput}`);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('product-qr-code');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `foodtrace-qr-${productData?.id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="text-center mb-8">
        <h2>Verify Product Authenticity</h2>
        <p className="text-muted">Enter a product ID to trace its full journey on the blockchain.</p>
      </div>

      <form onSubmit={handleSearch} className="glass-card mb-8" style={{ display: 'flex', gap: '1rem', padding: '1.5rem' }}>
        <input 
          type="text" 
          className="input-field" 
          style={{ flex: 1, margin: 0 }}
          placeholder="Enter Product ID (e.g. 1)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          <Search size={18} /> {isLoading ? 'Searching...' : 'Trace'}
        </button>
      </form>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
          <p className="flex items-center gap-2" style={{ color: 'var(--danger)' }}>
            <ShieldAlert size={20} /> {error}
          </p>
        </div>
      )}

      {productData && !isLoading && (
        <div className="animate-fade-in">
          
          {/* Top Banner & QR Showcase */}
          <div className="glass-card mb-8" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="mb-2" style={{ color: 'var(--secondary)' }}>{productData.name}</h1>
                  <p className="text-muted flex items-center gap-2">
                    <span className="hash-badge">Blockchain ID: {productData.id}</span>
                  </p>
                  <p className="text-sm mt-2 text-muted">Created: {productData.creationTime}</p>
                  <p className="text-sm mt-1 text-muted">Original Creator: <span style={{ fontFamily: 'monospace' }}>{productData.creator}</span></p>
                </div>
              </div>
              
              {isHashValid ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(192, 225, 210, 0.4)', color: '#059669', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 'bold', marginTop: '1rem' }}>
                  <ShieldCheck size={20} /> 100% Verified Authentic on Ethereum
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 'bold', marginTop: '1rem' }}>
                  <ShieldAlert size={20} /> Tampering Detected
                </div>
              )}
            </div>

            {/* Massive QR Code Showcase */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <QRCodeCanvas 
                id="product-qr-code"
                value={`${window.location.origin}/receipt/${productData.id}`} 
                size={180} 
                level={"L"}
                includeMargin={true}
              />
              <p className="text-sm mt-3 mb-0" style={{ fontWeight: 'bold', color: '#333' }}>Scan to Open Certificate</p>
              
              {/* Show Print/Download button if product is Distributed (2) or later */}
              {productData.state >= 2 && (
                <button 
                  onClick={downloadQR}
                  className="btn btn-secondary mt-3" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Download size={16} /> Download QR Label
                </button>
              )}
            </div>
          </div>

          {/* Educational Blockchain Explainer */}
          <div className="glass-card mb-8" style={{ background: 'rgba(246, 244, 232, 0.6)' }}>
            <h4 className="flex items-center gap-2 mb-3 text-secondary">
              <Info size={20} /> How the Blockchain secures this product
            </h4>
            <p className="text-sm text-muted mb-0">
              Unlike a standard database, the timeline below uses <strong>Cryptographic Hash-Chaining</strong>. Each supply chain update generates a unique digital fingerprint (Step Hash) that mathematically includes the fingerprint of the previous step. If a hacker tries to alter the origin farm's data, it changes that step's hash, which automatically breaks every subsequent hash in the chain, instantly exposing the fraud.
            </p>
          </div>

          <h3 className="mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary" /> Supply Chain Timeline (Immutable Ledger)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            {history.map((step, index) => (
              <div key={index} style={{ display: 'flex', gap: '1.5rem' }}>
                {/* Visual Block Linker */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: step.isValid ? (step.isIoT ? '#3b82f6' : 'var(--secondary)') : 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 2 }}>
                    {index + 1}
                  </div>
                  {index < history.length - 1 && (
                    <div style={{ flex: 1, width: '4px', background: step.isIoT ? '#3b82f6' : 'var(--secondary)', margin: '4px 0', opacity: 0.5 }}></div>
                  )}
                </div>

                {/* Block Content */}
                <div className="glass-card" style={{ flex: 1, padding: '1.5rem', border: step.isIoT ? '1px solid #3b82f6' : 'none', background: step.isIoT ? 'rgba(59, 130, 246, 0.02)' : 'var(--surface)' }}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.2rem', margin: 0 }}>
                      <span style={{ color: step.isIoT ? '#3b82f6' : 'var(--primary)' }}>{step.role}</span> {step.isIoT ? 'Ping' : 'Update'}
                    </h4>
                    <span className="text-sm text-muted bg-white px-3 py-1 rounded-full shadow-sm">{step.timestamp}</span>
                  </div>
                  
                  <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', borderLeft: `4px solid ${step.isIoT ? '#3b82f6' : 'var(--primary)'}` }}>
                    <p className="mb-0" style={{ fontWeight: '500', fontFamily: step.isIoT ? 'monospace' : 'inherit' }}>{step.data}</p>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-muted font-bold" style={{ minWidth: '100px' }}>{step.isIoT ? 'Device Address:' : 'Signed By:'}</span>
                      <span style={{ fontFamily: 'monospace', background: 'white', padding: '2px 6px', borderRadius: '4px' }}>{step.handler}</span>
                    </div>
                    
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-muted font-bold" style={{ minWidth: '100px' }}>Previous Hash:</span>
                      <span className="text-muted" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {step.previousHash === ethers.ZeroHash ? '0x000... (Genesis Block)' : step.previousHash}
                      </span>
                    </div>
                    
                    {index > 0 && (
                      <div className="flex justify-center my-2 text-secondary opacity-50">
                        <LinkIcon size={16} />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="text-muted font-bold" style={{ minWidth: '100px' }}>Block Hash:</span>
                      <span className={`hash-badge ${step.isValid ? 'valid-hash' : ''}`} style={{ wordBreak: 'break-all' }}>
                        {step.stepHash}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
