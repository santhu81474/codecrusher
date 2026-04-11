import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if(search.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-main)' }}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          TeamForge
        </Link>
        
        {user && (
          <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)', width: '16px', height: '16px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 104 10.5a6.5 6.5 0 0013 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px 6px 32px',
                color: 'var(--text-main)',
                outline: 'none',
                width: '280px',
                fontSize: '13px',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--text-muted)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </form>
        )}
      </div>

      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/explore">Explore</Link>
            <Link to="/network">Network</Link>

            <div className="dropdown-group">
              <span className="dropdown-trigger">
                Hub ▾
              </span>
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <Link to="/projects/create">Create Project</Link>
                  <Link to="/applications">Applications</Link>
                  <Link to="/bounties">Bounty Board</Link>
                </div>
              </div>
            </div>

            <div className="dropdown-group">
              <span className="dropdown-trigger">
                Arena ▾
              </span>
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <Link to="/arena">Daily Challenge</Link>
                  <Link to="/leaderboard">Leaderboard</Link>
                </div>
              </div>
            </div>

            <div className="dropdown-group">
              <span className="dropdown-trigger">
                More ▾
              </span>
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <Link to="/forge">Snippet Forge</Link>
                  <Link to="/skill-test">Skill Tests</Link>
                  <Link to="/gemini-chat">Tactical AI</Link>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
              <Link to="/profile" style={{ color: 'var(--text-muted)' }}>Profile</Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-outline" 
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                Log out
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/login" className="btn btn-outline">Log in</Link>
            <Link to="/signup" className="btn btn-primary">Sign up</Link>       
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;