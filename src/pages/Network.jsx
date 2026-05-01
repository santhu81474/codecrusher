import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Custom debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Network = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingNetwork, setLoadingNetwork] = useState(true);
  const [connectedIds, setConnectedIds] = useState(new Set());
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load user's current network
  useEffect(() => {
    const loadNetwork = async () => {
      try {
        const { data } = await api.get('/users/network');
        setConnections(data || []);
        setConnectedIds(new Set((data || []).map(c => c._id)));
      } catch (err) {
        console.error('Error loading network:', err);
      } finally {
        setLoadingNetwork(false);
      }
    };
    loadNetwork();
  }, []);

  // Search users
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setResults([]); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const search = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(debouncedSearch)}`);
        // Filter out self
        setResults(data.filter(u => u._id !== user?.id && u._id !== user?._id));
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [debouncedSearch, user]);

  const handleConnect = async (id) => {
    try {
      const { data } = await api.post(`/users/connect/${id}`);
      
      // Update connected state from server response
      setConnectedIds(prev => {
        const next = new Set(prev);
        if (data.connected) {
          next.add(id);
          toast.success('Connected successfully!');
        } else {
          next.delete(id);
          toast.success('Disconnected');
        }
        return next;
      });

      // Refresh network list — single call, only after state update
      const networkRes = await api.get('/users/network');
      setConnections(networkRes.data || []);
    } catch (error) {
      console.error('Error connecting to user:', error);
      toast.error(error.response?.data?.message || 'Failed to connect');
    }
  };

  const sharedSkillsCount = (profileSkills) => {
    if (!user?.skills || !profileSkills) return 0;
    return user.skills.filter(s => profileSkills.includes(s)).length;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
      {/* Header */}
      <header style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Developer Network</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Discover and connect with other developers on the platform.
        </p>
        <div style={{ marginTop: '20px', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 104 10.5a6.5 6.5 0 0013 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by username or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '40px', width: '100%', maxWidth: '500px' }}
          />
        </div>
      </header>

      {/* Search Results */}
      {searchQuery.trim() && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
            Search Results
          </h2>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '10px' }} />
              ))}
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="empty-state" style={{ padding: '40px', marginTop: 0 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <h2 className="empty-state-title">No users found</h2>
              <p className="empty-state-desc">No users found with that name. They may not be registered yet.</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map(profile => {
              const isConnected = connectedIds.has(profile._id);
              return (
                <div key={profile._id} className="card neon-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                  <Link to={`/profile/${profile.username || profile._id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: 600, flexShrink: 0 }}>
                      {profile.avatar ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : profile.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}>{profile.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{profile.username || 'user'}</div>
                      {profile.skills?.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {profile.skills.slice(0, 3).map(s => (
                            <span key={s} className="badge" style={{ fontSize: '10px', margin: 0, padding: '1px 6px' }}>{s}</span>
                          ))}
                          {profile.skills.length > 3 && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{profile.skills.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    {sharedSkillsCount(profile.skills) > 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 500 }}>
                        {sharedSkillsCount(profile.skills)} shared
                      </span>
                    )}
                    <button
                      onClick={() => handleConnect(profile._id)}
                      className={`btn ${isConnected ? 'btn-outline' : 'btn-primary'}`}
                      style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 500 }}
                    >
                      {isConnected ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* My Network */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            My Network ({connections.length})
          </h2>
        </div>

        {loadingNetwork ? (
          <div className="grid grid-cols-3" style={{ gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : connections.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg>
            <h2 className="empty-state-title">No connections yet</h2>
            <p className="empty-state-desc">Search for developers above to start building your network.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3" style={{ gap: '16px' }}>
            {connections.map(conn => (
              <div key={conn._id} className="card neon-hover" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 600, flexShrink: 0 }}>
                    {conn.avatar ? <img src={conn.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : conn.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>{conn.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{conn.username || 'user'}</div>
                  </div>
                </div>

                {conn.skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {conn.skills.slice(0, 4).map(s => (
                      <span key={s} className="badge" style={{ fontSize: '10px', margin: 0 }}>{s}</span>
                    ))}
                  </div>
                )}

                {conn.bio && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {conn.bio.length > 80 ? conn.bio.substring(0, 80) + '...' : conn.bio}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <Link to={`/profile/${conn.username || conn._id}`} className="btn btn-outline" style={{ flex: 1, fontSize: '12px', padding: '6px 12px', textAlign: 'center' }}>
                    View Profile
                  </Link>
                  <button onClick={() => handleConnect(conn._id)} className="btn" style={{ fontSize: '12px', padding: '6px 12px', background: 'transparent', border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }}>
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Network;