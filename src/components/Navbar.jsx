import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Custom debounce to avoid lodash dependency
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const debouncedSearch = useDebounce(search, 300);

  // Search users via API
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]); // eslint-disable-line react-hooks/set-state-in-effect
      setShowDropdown(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const fetchResults = async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(debouncedSearch)}`);
        setSearchResults(data.slice(0, 8));
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    };
    fetchResults();
  }, [debouncedSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setShowDropdown(false); // eslint-disable-line react-hooks/set-state-in-effect
    setSearch(''); // eslint-disable-line react-hooks/set-state-in-effect
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" className="nav-brand-link">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span className="nav-brand-text">CodeCrusher</span>
        </Link>
        
        {user && (
          <div ref={searchRef} style={{ position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)', width: '15px', height: '15px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 104 10.5a6.5 6.5 0 0013 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                className="navbar-search-input"
              />
              {searching && <div className="search-spinner" />}
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(u => (
                  <Link 
                    key={u._id} 
                    to={`/profile/${u.username || u._id}`}
                    className="search-result-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="search-avatar">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} />
                      ) : (
                        <span>{u.name?.charAt(0)?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-primary)' }}>{u.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{u.username || 'user'}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {showDropdown && search.trim() && searchResults.length === 0 && !searching && (
              <div className="search-dropdown">
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No users found
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'nav-active' : ''}>Dashboard</Link>
            <Link to="/explore" className={isActive('/explore') ? 'nav-active' : ''}>Explore</Link>
            <Link to="/network" className={isActive('/network') ? 'nav-active' : ''}>Network</Link>

            <div className="dropdown-group">
              <span className="dropdown-trigger">Hub ▾</span>
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <Link to="/projects/create">Create Project</Link>
                  <Link to="/applications">Applications</Link>
                  <Link to="/bounties">Bounty Board</Link>
                  <Link to="/matchmaker">AI Assembly ✦</Link>
                </div>
              </div>
            </div>

            <div className="dropdown-group">
              <span className="dropdown-trigger">Arena ▾</span>
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <Link to="/arena">Daily Challenge</Link>
                  <Link to="/leaderboard">Leaderboard</Link>
                  <Link to="/challenge-rooms">Battle Rooms</Link>
                  <Link to="/codecast">CodeCast</Link>
                </div>
              </div>
            </div>

            <div className="dropdown-group">
              <span className="dropdown-trigger">More ▾</span>
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <Link to="/forge">Snippet Forge</Link>
                  <Link to="/skill-test">Skill Tests</Link>
                  <Link to="/gemini-chat">Tactical AI</Link>
                  <Link to="/ai-explain">Code Explainer</Link>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '8px', borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
              <Link to="/profile" className="nav-profile-link">
                <div className="nav-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '12px' }}>
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