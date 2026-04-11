import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard'); // Proceed to Dashboard upon 200 OK from server
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid environment or connection refused.');
    }
  };


  return (
    <div className="card" style={{ maxWidth: '400px', margin: '60px auto', padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        {/* TeamForge mark, matched to navbar branding */}
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 16px' }}>
          <rect x="2" y="4" width="9" height="16" rx="2" fill="url(#tf-left-login)" />
          <rect x="13" y="4" width="9" height="9" rx="2" fill="url(#tf-top-login)" />
          <rect x="13" y="15" width="9" height="5" rx="2" fill="url(#tf-bottom-login)" />
          <defs>
            <linearGradient id="tf-left-login" x1="2" y1="4" x2="11" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#58A6FF" />
              <stop offset="1" stopColor="#1F6FEB" />
            </linearGradient>
            <linearGradient id="tf-top-login" x1="13" y1="4" x2="22" y2="13" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3FB950" />
              <stop offset="1" stopColor="#1A7F37" />
            </linearGradient>
            <linearGradient id="tf-bottom-login" x1="13" y1="15" x2="22" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F2CC60" />
              <stop offset="1" stopColor="#DB6D28" />
            </linearGradient>
          </defs>
        </svg>
        <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: 0 }}>TeamForge Sign-in</h2>
      </div>

      {error && <div style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', border: '1px solid rgba(248, 81, 73, 0.4)', color: '#ff7b72', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="block font-medium mb-2" style={{ color: 'var(--text-main)', fontSize: '14px' }}>Email access token</label>
          <input 
            type="email" 
            className="form-input w-full" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '8px 12px' }}
          />
        </div>
        <div>
          <label className="block font-medium mb-2" style={{ color: 'var(--text-main)', fontSize: '14px' }}>Decryption string (Password)</label>
          <input 
            type="password" 
            className="form-input w-full" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            style={{ padding: '8px 12px' }} 
          />
        </div>
        <button type="submit" className="btn btn-primary mt-2" style={{ width: '100%', padding: '10px' }}>Authorize Signature</button>
      </form>

      <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
        No presence node found? <Link to="/signup" style={{ color: 'var(--link-color)' }}>Construct a footprint.</Link>
      </div>
    </div>
  );
};

export default Login;
