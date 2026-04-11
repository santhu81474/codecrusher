import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Simple local favorites per user (keyed by user id)
const loadFavorites = (userId) => {
  if (!userId) return new Set();
  try {
    const raw = localStorage.getItem(`tf_favorites_${userId}`);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
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

  useEffect(() => {
    setFavorites(loadFavorites(user?.id));
  }, [user?.id]);

  const toggleFavorite = (projectId) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      saveFavorites(user?.id, next);
      return next;
    });
  };

  const allSkills = Array.from(
    new Set(projects.flatMap(p => p.requiredSkills || []))
  ).sort();

  const filtered = projects
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.ownerId?.name || '').toLowerCase().includes(q)
      );
    })
    .filter(p => {
      if (!skillFilter) return true;
      return (p.requiredSkills || []).includes(skillFilter);
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.applicants?.length || 0) - (a.applicants?.length || 0);
      }
      if (sortBy === 'favorites') {
        const af = favorites.has(a._id) ? 1 : 0;
        const bf = favorites.has(b._id) ? 1 : 0;
        return bf - af;
      }
      // newest
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading project catalog...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#ff7b72' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Explore Projects</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
              style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-muted)' }}
            >
              <path
                fillRule="evenodd"
                d="M11.5 7a4.499 4.499 0 11-8.998 0A4.499 4.499 0 0111.5 7zm-.82 4.74a6 6 0 11-1.06-1.06l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by title, owner, stack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                backgroundColor: 'rgba(13, 17, 23, 1)',
                border: '1px solid var(--border-color)',
                borderRadius: '999px',
                padding: '6px 14px 6px 30px',
                color: 'var(--header-text)',
                outline: 'none',
                fontSize: '14px',
                minWidth: '220px'
              }}
            />
          </div>
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            style={{
              backgroundColor: 'rgba(13, 17, 23, 1)',
              border: '1px solid var(--border-color)',
              borderRadius: '999px',
              padding: '6px 12px',
              color: 'var(--header-text)',
              fontSize: '13px'
            }}
          >
            <option value="">All skills</option>
            {allSkills.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              backgroundColor: 'rgba(13, 17, 23, 1)',
              border: '1px solid var(--border-color)',
              borderRadius: '999px',
              padding: '6px 12px',
              color: 'var(--header-text)',
              fontSize: '13px'
            }}
          >
            <option value="newest">Newest first</option>
            <option value="popular">Most applied</option>
            <option value="favorites">My favorites</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ gap: '16px', alignItems: 'stretch' }}>
        {filtered.map((project) => {
          const isFavorite = favorites.has(project._id);
          const hasApplied = (project.applicants || []).includes(user?.id);
          return (
            <div key={project._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 className="card-title" style={{ marginBottom: 0, fontSize: '1rem' }}>{project.title}</h3>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(project._id)}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: isFavorite ? '#ff7b72' : 'var(--text-muted)'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.318 2.318A3.25 3.25 0 018 3.25a3.25 3.25 0 013.682-1.432A3.251 3.251 0 0113.75 7.09l-5.12 5.682a.75.75 0 01-1.12 0L2.39 7.09A3.25 3.25 0 014.318 2.318z" />
                    </svg>
                  </button>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>
                  by <span style={{ color: 'var(--link-color)', fontWeight: 500 }}>{project.ownerId?.name || 'Unknown'}</span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {project.roleType && <span className="badge">{project.roleType}</span>}
                  {project.seniority && <span className="badge">{project.seniority}</span>}
                  {project.workMode && <span className="badge">{project.workMode}</span>}
                  {project.duration && <span className="badge">{project.duration}</span>}
                  {typeof project.openings === 'number' && project.openings > 0 && (
                    <span className="badge">{project.openings} opening{project.openings > 1 ? 's' : ''}</span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px', lineHeight: 1.5 }}>
                  {project.description.length > 140
                    ? project.description.slice(0, 140) + '...'
                    : project.description}
                </p>
                <div style={{ marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Stack</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(project.requiredSkills || []).map((skill) => (
                      <span key={skill} className="badge" style={{ fontSize: '11px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }}
                  >
                    <path d="M1.5 2.75A1.75 1.75 0 013.25 1h9.5A1.75 1.75 0 0114.5 2.75v10.5a.75.75 0 01-1.28.53L9 10.06 5.28 13.78A.75.75 0 014 13.25V2.75z" />
                  </svg>
                  {project.applicants?.length || 0} joined
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(project.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: 'span 3', marginTop: '48px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h2 className="empty-state-title">No results found</h2>
            <p className="empty-state-desc">
              We couldn't find any projects matching your filters. Try clearing them to see more results.
            </p>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setSkillFilter(''); }}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreProjects;
