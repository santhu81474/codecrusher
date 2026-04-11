import React, { useState, useMemo } from 'react';

// Network component allows users to browse and search for talents
const Network = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [talents] = useState([
    { id: 1, name: 'Alice Hacker', role: 'Full Stack Engineer', status: 'Online', skills: ['React', 'Node.js', 'MongoDB'], xp: 12450 },
    { id: 2, name: 'Bob Cybersecurity', role: 'Security Analyst', status: 'In a Project', skills: ['Python', 'PenTesting', 'Linux'], xp: 8300 },
    { id: 3, name: 'Charlie Frontend', role: 'UI/UX Designer', status: 'Looking for Team', skills: ['Figma', 'CSS', 'React'], xp: 5420 },
    { id: 4, name: 'Dave Devops', role: 'DevOps Engineer', status: 'Offline', skills: ['Docker', 'AWS', 'Kubernetes'], xp: 11000 },
  ]);

  const filteredTalents = useMemo(() => {
    return talents.filter(talent => 
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [talents, searchQuery]);

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
          Discover top engineering talent for your next project. Filter by skills, availability, and experience to build the perfect team.
        </p>

        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Search by name, role, or skill..."
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
        {filteredTalents.length > 0 ? (
          filteredTalents.map(profile => (
          <div key={profile.id} className="card" style={{ 
            backgroundColor: '#161b22',
            border: '1px solid var(--border-color)',
            borderRadius: '12px', 
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'border-color 0.2s ease, transform 0.2s ease',
            cursor: 'pointer',
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
                  {profile.name[0]}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#c9d1d9', fontWeight: '600' }}>{profile.name}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{profile.role}</div>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', 
                backgroundColor: profile.status === 'Online' ? 'var(--neon-green)' : profile.status === 'Looking for Team' ? '#58A6FF' : '#4f5966',
                boxShadow: profile.status === 'Online' ? '0 0 8px var(--neon-green)' : profile.status === 'Looking for Team' ? '0 0 8px #58A6FF' : 'none'
              }}></span>
              <span style={{ color: '#c9d1d9', fontWeight: 500 }}>{profile.status}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', flexGrow: 1 }}>
              {profile.skills.map(s => (
                <span key={s} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '16px', backgroundColor: '#0d1117', border: '1px solid var(--border-color)', color: '#8b949e', fontWeight: 500 }}>
                  {s}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: 'auto' }}>
              <div className="mono" style={{ fontSize: '15px', color: 'var(--neon-green)', fontWeight: 600 }}>
                {profile.xp.toLocaleString()} XP
              </div>
              <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--neon-green)', color: '#000', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                Recruit
              </button>
            </div>
          </div>
        ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No talents found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;