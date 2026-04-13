import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Network component allows users to browse and search for talents
const Network = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTalents = async () => {
      if (!searchQuery.trim()) {
        setTalents([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get(`/users/search?name=${searchQuery}`);
        setTalents(data);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchTalents();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleConnect = async (id) => {
    try {
      const { data } = await api.post(`/users/connect/${id}`);
      alert(data.message);
      // Update local state to reflect connection
      setTalents(prev => prev.map(t => {
        if (t._id === id) {
          const isConnected = t.followers?.includes(user?.id);
          return {
            ...t,
            followers: isConnected 
              ? t.followers.filter(f => f !== user?.id)
              : [...(t.followers || []), user?.id]
          };
        }
        return t;
      }));
    } catch (error) {
      console.error('Error connecting to user:', error);
      alert(error.response?.data?.message || 'Failed to connect');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', color: '#c9d1d9', fontWeight: 600 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--neon-green)">
             <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          Hacker Network
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '8px', lineHeight: '1.5' }}>
          Discover top engineering talent for your next project. Search by name to find registered users and build your network.
        </p>

        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Search by profile name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#0d1117',
              color: '#c9d1d9',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Searching network...
          </div>
        ) : talents.length > 0 ? (
          talents.map(profile => (
          <div key={profile._id} className="card" style={{ 
            backgroundColor: '#161b22',
            border: '1px solid var(--border-color)',
            borderRadius: '12px', 
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'border-color 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--neon-green)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9d1d9', fontSize: '20px', fontWeight: '600', border: '1px solid var(--border-color)' }}>
                  {profile.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#c9d1d9', fontWeight: '600' }}>{profile.name}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Level {Math.floor((profile.arenaXP || 0) / 1000) + 1} Hacker</div>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span style={{ color: '#c9d1d9', fontWeight: 500 }}>{profile.followers?.length || 0} Followers</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', flexGrow: 1 }}>
              {(profile.skills || []).map(s => (
                <span key={s} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '16px', backgroundColor: '#0d1117', border: '1px solid var(--border-color)', color: '#8b949e', fontWeight: 500 }}>
                  {s}
                </span>
              ))}
              {profile.skills?.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No skills listed</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: 'auto' }}>
              <div className="mono" style={{ fontSize: '15px', color: 'var(--neon-green)', fontWeight: 600 }}>
                {(profile.arenaXP || 0).toLocaleString()} XP
              </div>
              <button 
                onClick={() => handleConnect(profile._id)}
                className="btn btn-primary" 
                style={{ 
                  padding: '6px 16px', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  backgroundColor: profile.followers?.includes(user?.id) ? 'transparent' : 'var(--neon-green)', 
                  color: profile.followers?.includes(user?.id) ? 'var(--neon-green)' : '#000', 
                  borderRadius: '6px', 
                  border: profile.followers?.includes(user?.id) ? '1px solid var(--neon-green)' : 'none', 
                  cursor: 'pointer' 
                }}>
                {profile.followers?.includes(user?.id) ? 'Connected' : 'Connect'}
              </button>
            </div>
          </div>
        ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            {searchQuery.trim() ? 'No talents found matching your search criteria.' : 'Enter a name to search the network.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;