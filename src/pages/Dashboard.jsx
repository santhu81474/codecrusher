import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { fetchProjects, applyToProject } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProjects: 0, myApplications: 0, myOwned: 0 });
  const [activity] = useState([
    { id: 1, text: 'New member joined Project Quantum', time: '2m ago', icon: '👤' },
    { id: 2, text: 'Code review submitted', time: '5m ago', icon: '📝' },
    { id: 3, text: 'Asset deployed successfully', time: '12m ago', icon: '🚀' },
  ]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [invertedIndex, setInvertedIndex] = useState({});

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';

  useEffect(() => {
    const loadRealProjects = async () => {
      const cached = sessionStorage.getItem('cached_projects');
      if (cached) {
        const data = JSON.parse(cached);
        setProjects(data);
        const mine = (data || []).filter(p => p.applicants?.includes(user?.id));
        const owned = (data || []).filter(p => p.ownerId?._id === user?.id);
        setStats({
          totalProjects: data?.length || 0,
          myApplications: mine.length,
          myOwned: owned.length
        });
        setLoading(false);
      }

      try {
        const { data } = await fetchProjects();
        sessionStorage.setItem('cached_projects', JSON.stringify(data));
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
      if (!data.success && data.success !== undefined) {
        alert(`Application Failed: ${data.message} (Match Score: ${data.matchScore}%)`);
        return;
      }
      alert(`Success: ${data.message} (Match Score: ${data.matchScore}%)`);
      
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

  useEffect(() => {
    if (projects.length > 0) {
      setTimeout(() => {
        const index = {};
        projects.forEach(p => {
          const keywords = `${p.title} ${p.description} ${p.ownerId?.name || ''}`.toLowerCase().split(/\W+/).filter(w => w.length > 2);
          keywords.forEach(word => {
            if (!index[word]) index[word] = new Set();
            index[word].add(p._id);
          });
        });
        setInvertedIndex(index);
      }, 0);
    }
  }, [projects]);

  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>You are not logged in. Please log in again.</div>;
  }

  const getFilteredProjects = () => {
    if (!searchQuery.trim()) return projects;
    
    const searchTerms = searchQuery.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    if (searchTerms.length === 0) return projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchingIds = null;
    searchTerms.forEach(term => {
      const idsForTerm = invertedIndex[term] || new Set();
      if (matchingIds === null) {
        matchingIds = new Set(idsForTerm);
      } else {
        matchingIds = new Set([...matchingIds].filter(id => idsForTerm.has(id)));
      }
    });

    return projects.filter(p => matchingIds?.has(p._id));
  };

  const filteredProjects = getFilteredProjects();

  if (loading) return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '28px', padding: '0 20px', minHeight: '80vh' }}>
      <div style={{ flex: 7, minWidth: 0 }}>
        <div className="skeleton" style={{ height: 90, marginBottom: 24, borderRadius: 12 }} />
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div className="skeleton" style={{ height: 80, flex: 1, borderRadius: 10 }} />
          <div className="skeleton" style={{ height: 80, flex: 1, borderRadius: 10 }} />
          <div className="skeleton" style={{ height: 80, flex: 1, borderRadius: 10 }} />
        </div>
        <div className="skeleton" style={{ height: 36, width: 280, marginBottom: 20, borderRadius: 8 }} />
        <div className="grid grid-cols-2" style={{ gap: 16 }}>
          <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
        </div>
      </div>
      <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="skeleton" style={{ height: 320, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '28px', padding: '0 20px' }}>
      {/* Left Column: Main Dashboard (70%) */}
      <div style={{ flex: 7, minWidth: 0 }}>
        
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-name">Welcome back, {user?.name?.split(' ')[0] || 'Operator'}</div>
          <div className="welcome-subtitle">
            Session active · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: 28 }}>
          {[
            { label: 'Total Projects', value: stats.totalProjects, color: 'var(--accent-blue)' },
            { label: 'My Applications', value: stats.myApplications, color: 'var(--accent-green)' },
            { label: 'Owned Assets', value: stats.myOwned, color: 'var(--accent-amber)' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Project Network</h1>
          {searchQuery && (
            <span className="badge mono" style={{ color: 'var(--link-color)', borderColor: 'rgba(88, 166, 255, 0.3)', fontSize: '12px', padding: '4px 12px' }}>
              Query: "{searchQuery}"
            </span>
          )}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-2" style={{ gap: '16px' }}>
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
              
              return (
                <div key={project._id} className="card neon-hover" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => setSelectedProject(project)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: 0 }}>{project.title}</h3>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(project.timestamp).toLocaleDateString()}</span>
                    </div>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '10px' }}>
                      by <span style={{ color: 'var(--link-color)', fontWeight: 500 }}>{project.ownerId?.name || 'Anonymous User'}</span>
                    </p>
                    
                    <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '14px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                      {project.requiredSkills.slice(0, 4).map(skill => (
                        <span key={skill} className="badge mono" style={{ fontSize: '10px', margin: 0 }}>{skill}</span>
                      ))}
                      {project.requiredSkills.length > 4 && <span className="badge mono" style={{ fontSize: '10px', margin: 0 }}>+{project.requiredSkills.length - 4}</span>}
                    </div>
                  </div>

                  <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {project.applicants?.length || 0} applicants
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                      <Link onClick={(e) => e.stopPropagation()} to={`/projects/${project._id}/chat`} className="btn btn-outline mono" style={{ fontSize: '11px', padding: '5px 10px' }}>Chat</Link>
                      <button 
                        className={`btn ${hasApplied ? 'btn-outline' : 'btn-primary'} mono`} 
                        onClick={(e) => { e.stopPropagation(); !hasApplied && handleApply(project._id); }} 
                        style={{ fontSize: '11px', padding: '5px 10px', opacity: hasApplied ? 0.6 : 1, cursor: hasApplied ? 'default' : 'pointer' }}
                        disabled={hasApplied}
                      >
                        {hasApplied ? 'Applied' : 'Join'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Sidebar (30%) */}
      <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Quick Actions */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--header-text)', margin: 0 }}>Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
            <Link to="/projects/create" className="neon-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
              <span>Deploy New Project</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--text-muted)' }}><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" /></svg>
            </Link>
            <Link to="/leaderboard" className="neon-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
              <span>Leaderboard</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--text-muted)' }}><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" /></svg>
            </Link>
            <Link to="/arena" className="neon-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
              <span>Algo Arena</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--text-muted)' }}><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" /></svg>
            </Link>
            <Link to="/forge" className="neon-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
              <span>Snippet Forge</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--text-muted)' }}><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" /></svg>
            </Link>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span className="pulse" style={{ width: 8, height: 8, backgroundColor: 'var(--accent-green)', borderRadius: '50%', display: 'inline-block' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--header-text)', margin: 0 }}>Activity Feed</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activity.map(a => (
              <div key={a.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '14px', lineHeight: '20px', flexShrink: 0 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.4', marginBottom: '2px' }}>{a.text}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="card" style={{ padding: '14px 20px' }}>
          <div className="mono" style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent-green)', display: 'inline-block' }} />
              UPTIME: 99.9%
            </span>
            <span>LATENCY: 12ms</span>
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Project details: ${selectedProject.title}`}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}
          onClick={() => setSelectedProject(null)}
        >
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', animation: 'pageIn 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProject(null)} aria-label="Close modal" style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '4px' }}>
              ×
            </button>
            
            <h2 style={{ color: 'var(--header-text)', marginTop: 0, marginBottom: '8px', fontSize: '22px', paddingRight: '40px' }}>{selectedProject.title}</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-text)', fontSize: '12px', fontWeight: 600 }}>
                {selectedProject.ownerId?.name?.charAt(0) || '?'}
              </div>
              <span style={{ color: 'var(--link-color)', fontSize: '14px', fontWeight: 500 }}>
                {selectedProject.ownerId?.name || 'Anonymous User'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                · {new Date(selectedProject.timestamp).toLocaleDateString()}
              </span>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Description</h3>
              <p style={{ lineHeight: 1.7, color: 'var(--text-main)', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{selectedProject.description}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Required Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedProject.requiredSkills?.map(skill => (
                  <span key={skill} className="badge" style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>{skill}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applicants</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedProject.applicants?.length || 0}</div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project ID</div>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedProject._id}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', gap: '12px' }}>
              <Link to={`/projects/${selectedProject._id}/chat`} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Terminal Chat</Link>
              <button 
                className={`btn ${selectedProject.applicants?.includes(user?.id) ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => !selectedProject.applicants?.includes(user?.id) && handleApply(selectedProject._id)}
                disabled={selectedProject.applicants?.includes(user?.id)}
                style={{ flex: 1 }}
              >
                {selectedProject.applicants?.includes(user?.id) ? 'Already Applied' : 'Apply to Join'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
