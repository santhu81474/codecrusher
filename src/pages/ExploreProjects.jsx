import React, { useEffect, useState, useRef } from 'react';
import { fetchProjects, applyToProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import RagWidget from '../components/RagWidget';
import { Link } from 'react-router-dom';

const loadFavorites = (userId) => {
  if (!userId) return new Set();
  try {
    const raw = localStorage.getItem(`tf_favorites_${userId}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
};

const saveFavorites = (userId, favs) => {
  if (!userId) return;
  localStorage.setItem(`tf_favorites_${userId}`, JSON.stringify(Array.from(favs)));
};

const ExploreProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState(() => loadFavorites(user?.id));
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProject, setSelectedProject] = useState(null);
  const [applying, setApplying] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchProjects();
        setProjects(data || []);
      } catch (err) {
        console.error('Error loading projects', err);
        setError('Unable to load projects right now.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Sync favorites when user changes
  const currentUserId = user?.id;
  useEffect(() => {
    const newFavorites = loadFavorites(currentUserId);
    setFavorites(newFavorites); // eslint-disable-line react-hooks/set-state-in-effect
  }, [currentUserId]);

  const toggleFavorite = (projectId) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(projectId) ? next.delete(projectId) : next.add(projectId);
      saveFavorites(user?.id, next);
      return next;
    });
  };

  // Modal accessibility
  useEffect(() => {
    if (!selectedProject) return;
    const handleEsc = (e) => { if (e.key === 'Escape') setSelectedProject(null); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    // Focus trap
    if (modalRef.current) modalRef.current.focus();
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [selectedProject]);

  const handleApply = async (project) => {
    if (applying) return;
    setApplying(true);
    try {
      const { data } = await applyToProject(project._id, user?.skills || []);
      if (data.success) {
        toast.success(`Applied! Match: ${data.matchScore}%`);
        setProjects(prev => prev.map(p => {
          if (p._id === project._id) return { ...p, applicants: [...(p.applicants || []), user?.id] };
          return p;
        }));
        if (selectedProject?._id === project._id) {
          setSelectedProject(prev => ({ ...prev, applicants: [...(prev.applicants || []), user?.id] }));
        }
      } else {
        toast.error(data.message || 'Application failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const allSkills = Array.from(new Set(projects.flatMap(p => p.requiredSkills || []))).sort();

  const filtered = projects
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.ownerId?.name || '').toLowerCase().includes(q);
    })
    .filter(p => !skillFilter || (p.requiredSkills || []).includes(skillFilter))
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.applicants?.length || 0) - (a.applicants?.length || 0);
      if (sortBy === 'favorites') return (favorites.has(b._id) ? 1 : 0) - (favorites.has(a._id) ? 1 : 0);
      return new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt);
    });

  if (loading) {
    return (
      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 20px' }}>
        <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '24px', borderRadius: '8px' }} />
        <div className="grid grid-cols-3" style={{ gap: '16px' }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: '260px', borderRadius: '12px' }} />)}
        </div>
      </div>
    );
  }

  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-red)' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Explore Projects</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-muted)' }}>
              <path fillRule="evenodd" d="M11.5 7a4.499 4.499 0 11-8.998 0A4.499 4.499 0 0111.5 7zm-.82 4.74a6 6 0 11-1.06-1.06l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04z" />
            </svg>
            <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: '30px', minWidth: '200px' }} />
          </div>
          <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="form-input" style={{ minWidth: '120px' }}>
            <option value="">All skills</option>
            {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-input" style={{ minWidth: '130px' }}>
            <option value="newest">Newest first</option>
            <option value="popular">Most applied</option>
            <option value="favorites">My favorites</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ gap: '16px', alignItems: 'stretch' }}>
        {filtered.map(project => {
          const isFavorite = favorites.has(project._id);
          const _hasApplied = (project.applicants || []).includes(user?.id);
          const _isOwner = project.ownerId?._id === user?.id;
          return (
            <div key={project._id} className="card neon-hover" onClick={() => setSelectedProject(project)} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 className="card-title" style={{ marginBottom: 0, fontSize: '1rem' }}>{project.title}</h3>
                  <button type="button" onClick={(e) => { e.stopPropagation(); toggleFavorite(project._id); }} aria-label={isFavorite ? 'Remove from favorites' : 'Save'} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isFavorite ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.318 2.318A3.25 3.25 0 018 3.25a3.25 3.25 0 013.682-1.432A3.251 3.251 0 0113.75 7.09l-5.12 5.682a.75.75 0 01-1.12 0L2.39 7.09A3.25 3.25 0 014.318 2.318z" /></svg>
                  </button>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>
                  by <span style={{ color: 'var(--link-color)', fontWeight: 500 }}>{project.ownerId?.name || 'Unknown'}</span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {project.roleType && <span className="badge" style={{ fontSize: '10px', margin: 0 }}>{project.roleType}</span>}
                  {project.seniority && <span className="badge" style={{ fontSize: '10px', margin: 0 }}>{project.seniority}</span>}
                  {project.workMode && <span className="badge" style={{ fontSize: '10px', margin: 0 }}>{project.workMode}</span>}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '10px', lineHeight: 1.5 }}>
                  {project.description.length > 120 ? project.description.slice(0, 120) + '...' : project.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(project.requiredSkills || []).slice(0, 4).map(skill => (
                    <span key={skill} className="badge" style={{ fontSize: '10px', margin: 0 }}>{skill}</span>
                  ))}
                  {(project.requiredSkills || []).length > 4 && <span className="badge" style={{ fontSize: '10px', margin: 0 }}>+{project.requiredSkills.length - 4}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>{project.applicants?.length || 0} applicants</span>
                <span>{new Date(project.timestamp || project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h2 className="empty-state-title">No results found</h2>
            <p className="empty-state-desc">Try adjusting your filters to see more results.</p>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setSkillFilter(''); }}>Clear Filters</button>
          </div>
        )}
      </div>

      {/* Accessible Project Details Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Project details: ${selectedProject.title}`}
          onClick={() => setSelectedProject(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', animation: 'pageIn 0.2s ease-out' }}
          >
            <button onClick={() => setSelectedProject(null)} aria-label="Close modal" style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '4px' }}>
              ×
            </button>

            <h2 style={{ color: 'var(--header-text)', marginTop: 0, marginBottom: '8px', fontSize: '22px', paddingRight: '40px' }}>{selectedProject.title}</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-text)', fontSize: '12px', fontWeight: 600 }}>
                {selectedProject.ownerId?.name?.charAt(0) || '?'}
              </div>
              <Link to={`/profile/${selectedProject.ownerId?.username || selectedProject.ownerId?._id}`} style={{ color: 'var(--link-color)', fontSize: '14px', fontWeight: 500 }}>
                {selectedProject.ownerId?.name || 'Unknown'}
              </Link>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
              {selectedProject.roleType && <span className="badge">{selectedProject.roleType}</span>}
              {selectedProject.seniority && <span className="badge">{selectedProject.seniority}</span>}
              {selectedProject.workMode && <span className="badge">{selectedProject.workMode}</span>}
              {selectedProject.duration && <span className="badge">{selectedProject.duration}</span>}
              {selectedProject.openings > 0 && <span className="badge">{selectedProject.openings} opening{selectedProject.openings > 1 ? 's' : ''}</span>}
              {selectedProject.status && <span className="badge" style={{ borderColor: selectedProject.status === 'open' ? 'var(--accent-green)' : 'var(--accent-amber)', color: selectedProject.status === 'open' ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{selectedProject.status}</span>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Description</h3>
              <p style={{ lineHeight: 1.7, color: 'var(--text-main)', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{selectedProject.description}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Required Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(selectedProject.requiredSkills || []).map(skill => (
                  <span key={skill} className="badge" style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>{skill}</span>
                ))}
              </div>
            </div>

            {selectedProject.githubUrl && (
              <div style={{ marginBottom: '20px' }}>
                <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                  View on GitHub
                </a>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedProject.applicants?.length || 0}</strong> applicants
              </div>
              {(() => {
                const hasApplied = (selectedProject.applicants || []).includes(user?.id);
                const isOwner = selectedProject.ownerId?._id === user?.id;
                if (isOwner) {
                  return <Link to={`/projects/${selectedProject._id}/sprint`} className="btn btn-primary" style={{ fontSize: '13px' }}>Sprint Board</Link>;
                }
                return (
                  <button
                    className={`btn ${hasApplied ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => !hasApplied && handleApply(selectedProject)}
                    disabled={hasApplied || applying}
                    style={{ fontSize: '13px' }}
                  >
                    {applying ? 'Applying...' : hasApplied ? 'Already Applied' : 'Apply to Join'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <RagWidget />
    </div>
  );
};

export default ExploreProjects;
