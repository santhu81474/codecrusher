import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { fetchProjects, applyToProject } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>You are not logged in. Please log in again.</div>;
  }
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProjects: 0, myApplications: 0, myOwned: 0 });
  // Mocked activity feed
  const [activity, setActivity] = useState([
    { id: 1, text: 'Node 0xA1 joined Project Quantum', time: '2m ago' },
    { id: 2, text: 'Node 0xB7 submitted a review', time: '5m ago' },
    { id: 3, text: 'Node 0xC3 deployed a new asset', time: '12m ago' },
  ]);
  
  // Handling Global Search System Queries
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';

  useEffect(() => {
    const loadRealProjects = async () => {
      try {
        const { data } = await fetchProjects();
        setProjects(data);
        const mine = (data || []).filter(p => p.applicants?.includes(user?.id));
        const owned = (data || []).filter(p => p.ownerId?._id === user?.id);
        setStats({
          totalProjects: data?.length || 0,
          myApplications: mine.length,
          myOwned: owned.length
        });
      } catch (error) {
        console.error("Error fetching live projects dataset:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRealProjects();
  }, []);

  const handleApply = async (projectId) => {
    try {
      const { data } = await applyToProject(projectId, user?.skills || []);
      alert(`Success: ${data.message} (Match Score: ${data.matchScore}%)`);
      
      // Mutate local state optimally to reflect database changes visually
      setProjects(prev => prev.map(p => {
        if (p._id === projectId) {
          return { ...p, applicants: [...(p.applicants || []), user?.id] };
        }
        return p;
      }));
    } catch (error) {
      alert(`Application Failed: ${error.response?.data?.message || 'Score match too low or invalid request'}`);
    }
  };

  // ADA Concept: Optimized Search via Inverted Index (O(k * m) pre-processing, O(1) or O(terms) lookup)
  const [invertedIndex, setInvertedIndex] = useState({});

  useEffect(() => {
    if (projects.length > 0) {
      const index = {};
      projects.forEach(p => {
        const keywords = `${p.title} ${p.description} ${p.ownerId?.name || ''}`.toLowerCase().split(/\W+/).filter(w => w.length > 2);
        keywords.forEach(word => {
          if (!index[word]) index[word] = new Set();
          index[word].add(p._id);
        });
      });
      setInvertedIndex(index);
    }
  }, [projects]);

  // Optimized lookup using the index
  const getFilteredProjects = () => {
    if (!searchQuery.trim()) return projects;
    
    const searchTerms = searchQuery.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    if (searchTerms.length === 0) return projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // Intersection of sets for term search
    let matchingIds = null;
    searchTerms.forEach(term => {
      const idsForTerm = invertedIndex[term] || new Set();
      if (matchingIds === null) {
        matchingIds = new Set(idsForTerm);
      } else {
        // Intersection
        matchingIds = new Set([...matchingIds].filter(id => idsForTerm.has(id)));
      }
    });

    return projects.filter(p => matchingIds?.has(p._id));
  };

  const filteredProjects = getFilteredProjects();

  if (loading) return (
    <div style={{ padding: '2rem' }}>
      <div className="skeleton" style={{ height: 40, width: 320, margin: '0 auto 24px', borderRadius: 8 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
      </div>
      <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', gap: '32px', padding: '0 20px' }}>
      {/* Left Column: Main Dashboard (70%) */}
      <div style={{ flex: 7, minWidth: 0 }}>
        
        {/* Command Center Stats Bar */}
        <div className="glass-panel neon-border-dynamic scan-line" style={{ 
          display: 'flex', 
          gap: '32px', 
          marginBottom: 32, 
          alignItems: 'center', 
          padding: '24px 32px',
          position: 'relative'
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Total Projects</div>
            <div className="mono" style={{ fontSize: 32, color: 'var(--neon-green)', fontWeight: 800, textShadow: '0 0 12px rgba(46,204,113,0.4)' }}>{stats.totalProjects}</div>
          </div>
          <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>My Applications</div>
            <div className="mono" style={{ fontSize: 32, color: '#3FB950', fontWeight: 800 }}>{stats.myApplications}</div>
          </div>
          <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Owned Assets</div>
            <div className="mono" style={{ fontSize: 32, color: '#F2CC60', fontWeight: 800 }}>{stats.myOwned}</div>
          </div>
        </div>

        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 className="page-title" style={{ marginBottom: 0, fontSize: '1.8rem' }}>Project Network</h1>
          {searchQuery && (
            <span className="mono" style={{ color: 'var(--link-color)', fontSize: '13px', backgroundColor: 'rgba(88, 166, 255, 0.08)', padding: '6px 14px', borderRadius: '4px', border: '1px solid rgba(88, 166, 255, 0.2)' }}>
              Query Active: "{searchQuery}"
            </span>
          )}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-2" style={{ gap: '20px' }}>
          {filteredProjects.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: 'span 2' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h2 className="empty-state-title">No projects found</h2>
              <p className="empty-state-desc">
                We couldn't find any projects matching your search. Try adjusting your filters or create a new project.
              </p>
              <Link to="/projects/create" className="btn btn-primary">Create Project</Link>
            </div>
          ) : (
            filteredProjects.map(project => {
              const hasApplied = project.applicants?.includes(user?.id);
              const isOwner = project.ownerId?._id === user?.id;
              
              return (
                <div key={project._id} className="card glass-panel neon-hover" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 className="card-title mono" style={{ fontSize: '1.2rem', color: 'var(--neon-green)', margin: 0 }}>{project.title}</h3>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(project.timestamp).toLocaleDateString()}</span>
                    </div>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                      Node Owner: <span style={{ color: 'var(--link-color)' }}>{project.ownerId?.name || 'Anonymous User'}</span>
                    </p>
                    
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '20px', lineHeight: '1.6', height: '4.8em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {project.description}
                    </p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                      {project.requiredSkills.slice(0, 4).map(skill => (
                        <span key={skill} className="badge mono" style={{ fontSize: '10px' }}>{skill}</span>
                      ))}
                      {project.requiredSkills.length > 4 && <span className="badge mono" style={{ fontSize: '10px' }}>+{project.requiredSkills.length - 4}</span>}
                    </div>
                  </div>

                  <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      STATUS: {project.applicants?.length || 0} Active Nodes
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(isOwner || hasApplied) && (
                        <Link to={`/projects/${project._id}/chat`} className="btn btn-outline mono" style={{ fontSize: '11px', padding: '6px 12px' }}>Terminal Chat</Link>
                      )}
                      {!isOwner && !hasApplied && (
                        <button className="btn btn-primary mono" onClick={() => handleApply(project._id)} style={{ fontSize: '11px', padding: '6px 12px' }}>Join Request</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Sidebar (30%) */}
      <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Network Pulse Sidebar */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div className="mono" style={{ color: 'var(--neon-green)', fontSize: '14px', marginBottom: '20px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse" style={{ width: 8, height: 8, backgroundColor: 'var(--neon-green)', borderRadius: '50%' }} />
            Network Pulse
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activity.map(a => (
              <div key={a.id} style={{ borderLeft: '2px solid rgba(46,204,113,0.2)', paddingLeft: '12px', paddingBottom: '4px' }}>
                <div className="mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', marginBottom: '4px' }}>{a.text}</div>
                <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Timestamp Log: {a.time}</div>
              </div>
            ))}
          </div>
          <div className="scan-line" style={{ height: 1, marginTop: 20, opacity: 0.1 }} />
        </div>

        {/* System Operations Sidebar */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="mono" style={{ color: '#58A6FF', fontSize: '14px', marginBottom: '20px', letterSpacing: '2px' }}>System Operations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/create" className="btn btn-primary neon-hover mono" style={{ width: '100%', fontSize: '12px' }}>New Project Deployment</Link>
            <Link to="/leaderboard" className="btn btn-outline mono" style={{ width: '100%', fontSize: '12px' }}>Global Leaderboard</Link>
            <Link to="/arena" className="btn btn-outline mono" style={{ width: '100%', fontSize: '12px' }}>Enter Algo Arena</Link>
            <Link to="/forge" className="btn btn-outline mono" style={{ width: '100%', fontSize: '12px' }}>Access Snippet Forge</Link>
          </div>
        </div>

        {/* Security Log */}
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <div className="mono" style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
            <span>UPTIME: 99.9%</span>
            <span>LATENCY: 12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
