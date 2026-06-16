import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, BarChart3, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      <section className="text-center" style={{ padding: '4rem 0', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(192, 225, 210, 0.4)', color: '#059669', padding: '0.5rem 1rem', borderRadius: '2rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          <ShieldCheck size={18} /> Transparent. Immutable. Secure.
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>
          Blockchain-Based <br />
          <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Food Traceability
          </span>
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '2.5rem' }}>
          Track food products from farm to fork with complete transparency using the Ethereum blockchain. Ensure authenticity and build consumer trust.
        </p>
        <div style={{ background: 'rgba(220, 155, 155, 0.1)', border: '1px dashed var(--primary)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'inline-block' }}>
          <p className="text-sm text-primary mb-1"><strong>Sample Product Available!</strong></p>
          <p className="text-sm text-muted mb-0">I've seeded the blockchain with a sample product. Go to the Tracker and search for <strong>ID: 1</strong> to see its full supply chain history.</p>
        </div>
        <br/>
        <div className="flex justify-center gap-4">
          <Link to="/track" className="btn btn-primary">
            Verify a Product <ChevronRight size={18} />
          </Link>
          <Link to="/dashboard" className="btn btn-outline">
            Supply Chain Portal
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '4rem' }}>
        <div className="glass-card text-center">
          <div style={{ background: 'rgba(220, 155, 155, 0.2)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
            <ShieldCheck size={32} />
          </div>
          <h3 className="mb-2">Tamper-Proof Data</h3>
          <p className="text-muted">Cryptographic hash chains ensure that supply chain records cannot be altered or falsified.</p>
        </div>
        
        <div className="glass-card text-center">
          <div style={{ background: 'rgba(192, 225, 210, 0.4)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#059669' }}>
            <Truck size={32} />
          </div>
          <h3 className="mb-2">End-to-End Tracking</h3>
          <p className="text-muted">Monitor every stage of the journey from the farmer, processor, distributor to the final retailer.</p>
        </div>
        
        <div className="glass-card text-center">
          <div style={{ background: 'rgba(229, 238, 228, 1)', border: '1px solid var(--border)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--text-main)' }}>
            <BarChart3 size={32} />
          </div>
          <h3 className="mb-2">Role-Based Access</h3>
          <p className="text-muted">Smart contracts enforce permissions, ensuring only authorized stakeholders can update product stages.</p>
        </div>
      </section>
    </div>
  );
}
