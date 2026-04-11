import React, { useState, useEffect } from 'react';
import { fetchLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const { data } = await fetchLeaderboard();
        setUsers(data || []);
      } catch (err) {
        console.error('Error loading leaderboard', err);
        setError('Unable to load leaderboard at the moment.');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) return <div className="text-center mt-2">Loading leaderboard...</div>;

  if (error) return <div className="text-center mt-2 text-red-500">{error}</div>;

  const myIndex = users.findIndex(u => (u._id || u.id) === user?.id);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Leaderboard</h1>
        {myIndex !== -1 && (
          <div className="card" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(250, 204, 21, 0.15)',
              color: '#FACC15'
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 01.67.415l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.79L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.371a.75.75 0 01.416-1.279l4.21-.612L7.327.665A.75.75 0 018 .25z"/></svg>
            </span>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1 }}>Your Rank</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>#{myIndex + 1}</div>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Rank</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>User</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Top Skills</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Rating</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {users.map((entry, index) => {
              const isMe = (entry._id || entry.id) === user?.id;
              return (
                <tr
                  key={entry._id || entry.id || index}
                  style={{
                    borderBottom: index < users.length - 1 ? '1px solid var(--border-color)' : 'none',
                    backgroundColor: isMe ? 'rgba(56, 139, 253, 0.08)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                    {entry.name}
                    {isMe && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 999,
                          border: '1px solid rgba(56,139,253,0.6)',
                          color: '#58A6FF'
                        }}
                      >
                        you
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {(entry.skills || []).map(s => (
                      <span key={s} className="badge" style={{ marginBottom: 0 }}>{s}</span>
                    ))}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#F59E0B', fontWeight: 500 }}>★ {entry.rating ?? 0}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>{Math.floor((entry.rating || 0) * 100)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
