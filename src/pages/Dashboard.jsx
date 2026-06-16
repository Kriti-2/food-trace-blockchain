import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, UserCheck, Plus, Send } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const ROLES = ['None', 'Farmer', 'Processor', 'Distributor', 'Retailer', 'Consumer'];

export default function Dashboard({ account, contract, userRole, setUserRole }) {
  const [name, setName] = useState('');
  const [roleSelect, setRoleSelect] = useState('1');
  const [isRegistering, setIsRegistering] = useState(false);

  const [productName, setProductName] = useState('');
  const [productData, setProductData] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdProductId, setCreatedProductId] = useState(null);

  const [updateProductId, setUpdateProductId] = useState('');
  const [updateData, setUpdateData] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!account) {
    return (
      <div className="glass-card text-center animate-fade-in" style={{ maxWidth: '500px', margin: '4rem auto' }}>
        <UserCheck size={48} className="text-muted mb-4" style={{ margin: '0 auto' }} />
        <h2 className="mb-2">Authentication Required</h2>
        <p className="text-muted mb-4">Please connect your MetaMask wallet to access the dashboard.</p>
      </div>
    );
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setIsRegistering(true);
    try {
      const tx = await contract.registerUser(name, parseInt(roleSelect));
      await tx.wait();
      setUserRole(parseInt(roleSelect));
      alert("Registration successful!");
    } catch (err) {
      console.error(err);
      alert("Registration failed: " + err.message);
    }
    setIsRegistering(false);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setIsCreating(true);
    try {
      const tx = await contract.createProduct(productName, productData);
      const receipt = await tx.wait();
      
      // Parse event to get Product ID
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'ProductCreated';
        } catch { return false; }
      });
      
      if (event) {
        const parsedLog = contract.interface.parseLog(event);
        setCreatedProductId(parsedLog.args[0].toString());
      }
      
      setProductName('');
      setProductData('');
      alert("Product created successfully!");
    } catch (err) {
      console.error(err);
      alert("Creation failed: " + err.message);
    }
    setIsCreating(false);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setIsUpdating(true);
    try {
      const tx = await contract.updateProductStage(updateProductId, updateData);
      await tx.wait();
      setUpdateProductId('');
      setUpdateData('');
      alert("Product updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Update failed: " + err.message);
    }
    setIsUpdating(false);
  };

  if (userRole === 0) {
    return (
      <div className="glass-card animate-fade-in" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <h2 className="mb-4">Register Account</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name / Company Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Green Valley Farms"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label>Select Role</label>
            <select 
              className="input-field"
              value={roleSelect}
              onChange={(e) => setRoleSelect(e.target.value)}
            >
              <option value="1">Farmer (Creator)</option>
              <option value="2">Processor</option>
              <option value="3">Distributor</option>
              <option value="4">Retailer</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isRegistering}>
            {isRegistering ? 'Registering on Blockchain...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Supply Chain Dashboard</h2>
          <p className="text-muted">Logged in as: <strong style={{ color: 'var(--secondary)' }}>{ROLES[userRole]}</strong></p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {userRole === 1 && (
          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <Plus size={20} className="text-secondary" /> Register New Product
            </h3>
            <form onSubmit={handleCreateProduct}>
              <div className="input-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Organic Arabica Coffee Beans"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Initial Origin Data (JSON/Text)</label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  placeholder="e.g. Harvested on Plot 4A, Temperature: 22°C"
                  value={productData}
                  onChange={(e) => setProductData(e.target.value)}
                  required 
                ></textarea>
              </div>
              <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={isCreating}>
                {isCreating ? 'Mining Transaction...' : 'Mint Product to Blockchain'}
              </button>
            </form>

            {createdProductId && (
              <div className="mt-4 p-4" style={{ background: 'rgba(192, 225, 210, 0.4)', borderRadius: '0.5rem', border: '1px solid rgba(192, 225, 210, 0.8)', textAlign: 'center' }}>
                <p className="text-sm text-muted mb-2">Product successfully created with ID:</p>
                <h2 className="mb-4" style={{ color: 'var(--secondary)' }}>{createdProductId}</h2>
                <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                  <QRCodeSVG value={`${window.location.origin}/receipt/${createdProductId}`} size={128} includeMargin={true} />
                </div>
                <div className="text-center">
                  <Link to={`/track/${createdProductId}`} className="btn btn-outline text-sm">
                    View Tracking Page
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {userRole > 1 && (
          <div className="glass-card">
            <h3 className="flex items-center gap-2 mb-4">
              <Send size={20} className="text-primary" /> Update Product Stage
            </h3>
            <form onSubmit={handleUpdateProduct}>
              <div className="input-group">
                <label>Product ID</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Enter Product ID to update"
                  value={updateProductId}
                  onChange={(e) => setUpdateProductId(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Stage Update Data (JSON/Text)</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  placeholder={userRole === 3 ? "e.g. Shipped to Regional Hub, Temp: -2°C" : "Enter stage transition details..."}
                  value={updateData}
                  onChange={(e) => setUpdateData(e.target.value)}
                  required 
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isUpdating}>
                {isUpdating ? 'Mining Transaction...' : 'Submit Stage Update'}
              </button>
            </form>
          </div>
        )}

        <div className="glass-card">
          <h3 className="flex items-center gap-2 mb-4">
            <Package size={20} className="text-muted" /> Quick Verify
          </h3>
          <p className="text-muted text-sm mb-4">Scan or enter a product ID to verify its authenticity and complete supply chain history on the blockchain.</p>
          <div className="input-group">
            <input type="text" className="input-field" placeholder="Product ID..." id="quickSearchInput" />
          </div>
          <button 
            className="btn btn-outline" 
            style={{ width: '100%' }}
            onClick={() => {
              const val = document.getElementById('quickSearchInput').value;
              if (val) window.location.href = `/track/${val}`;
            }}
          >
            Verify Product
          </button>
        </div>

      </div>
    </div>
  );
}
