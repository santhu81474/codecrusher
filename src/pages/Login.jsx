import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid environment or connection refused.');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px'
    }}>
      {/* Dynamic Background Elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 60%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none',
        animation: 'pulse 6s infinite alternate'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '35vw',
        height: '35vw',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none',
        animation: 'pulse 8s infinite alternate-reverse'
      }} />

      {/* Glassmorphic Container */}
      <div 
        className="glass-modal neon-hover"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '40px 32px',
          position: 'relative',
          zIndex: 1,
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 12px 40px rgba(0,0,0,0.6)' : 'var(--shadow-md)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
            border: '1px solid var(--border)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.2)',
            marginBottom: '20px'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sign in to continue to CodeCrusher</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: '#f87171', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '24px', 
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)', fontSize: '13px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <input 
                type="email" 
                className="form-input w-full" 
                placeholder="you@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ paddingLeft: '38px', height: '44px' }}
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
              <a href="#" style={{ color: 'var(--primary)', fontSize: '12px' }}>Forgot?</a>
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <input 
                type="password" 
                className="form-input w-full" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                style={{ paddingLeft: '38px', height: '44px' }} 
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              height: '44px',
              marginTop: '8px', 
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '0.3px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            Sign In
          </button>
        </form>

        <div style={{ 
          marginTop: '32px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: 'var(--text-muted)',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)', zIndex: 0 }}></div>
          <span style={{ position: 'relative', background: 'var(--surface-2)', padding: '0 12px', zIndex: 1 }}>
            New to CodeCrusher? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '500' }}>Create an account</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
