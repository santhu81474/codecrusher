import React, { useState } from 'react';

const Bounties = () => {
  const [bounties] = useState([
    { id: 1, title: 'Optimize Database Queries', reward: '500 XP', difficulty: 'Hard', status: 'Open', tags: ['MongoDB', 'Performance'], poster: 'Admin' },
    { id: 2, title: 'Fix Auth Middleware Bug', reward: '200 XP', difficulty: 'Medium', status: 'In Progress', tags: ['Express', 'Security'], poster: 'TechCorp' },
    { id: 3, title: 'Implement Dark Mode Toggle', reward: '100 XP', difficulty: 'Easy', status: 'Open', tags: ['React', 'CSS'], poster: 'DesignGuru' },
    { id: 4, title: 'Migrate to TypeScript', reward: '800 XP', difficulty: 'Expert', status: 'Open', tags: ['TypeScript', 'Refactor'], poster: 'StartupInc' },
  ]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Bounty Board</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Claim open tasks to earn XP and build your reputation across the network.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path></svg>
          Post Bounty
        </button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {bounties.map(b => (
          <div key={b.id} className="card glass" style={{ 
            padding: '20px', 
            border: '1px solid var(--border-color)', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'transform 0.2s, border-color 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--neon-green)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, color: 'var(--link-color)', fontSize: '18px' }}>{b.title}</h3>
                <span className="badge" style={{ 
                  backgroundColor: b.status === 'Open' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(210, 153, 34, 0.15)',
                  color: b.status === 'Open' ? 'var(--neon-green)' : '#d29922',
                  border: `1px solid ${b.status === 'Open' ? 'var(--neon-green)' : '#d29922'}`
                }}>{b.status}</span>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)' }}>Posted by <strong style={{ color: 'var(--text-main)' }}>@{b.poster}</strong></p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {b.tags.map(tag => (
                  <span key={tag} style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    backgroundColor: 'rgba(88, 166, 255, 0.1)', 
                    color: 'var(--link-color)',
                    borderRadius: '10px'
                  }}>{tag}</span>
                ))}
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--neon-green)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                +{b.reward}
              </div>
              <div style={{ fontSize: '12px', color: b.difficulty === 'Expert' ? '#f85149' : b.difficulty === 'Hard' ? '#d29922' : 'var(--text-muted)' }}>
                Level: {b.difficulty}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bounties;