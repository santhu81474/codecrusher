import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';

const Forge = () => {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newSnippet, setNewSnippet] = useState({ title: '', description: '', code: '', tags: '' });

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        const { data } = await api.get('/snippets');
        setSnippets(data);
      } catch (error) {
        console.error('Forge connection interrupted', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSnippets();
  }, []);

  const handleStar = async (id) => {
    try {
      const { data } = await api.post(`/snippets/${id}/star`);
      setSnippets(snippets.map(s => s._id === id ? data : s));
    } catch (error) {
      console.error('Star transmission failed', error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/snippets', {
        ...newSnippet,
        tags: newSnippet.tags.split(',').map(t => t.trim())
      });
      setSnippets([data, ...snippets]);
      setShowAdd(false);
      setNewSnippet({ title: '', description: '', code: '', tags: '' });
    } catch (error) {
      console.error('Forge creation failed', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <Skeleton width="400px" height="40px" className="mb-2" />
        <div className="grid grid-cols-2" style={{ gap: '20px' }}>
          <Skeleton height="200px" />
          <Skeleton height="200px" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-2">
        <h1 className="page-title">Snippet Forge</h1>
        <button className="btn btn-primary neon-hover" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel Transfer' : 'Init Forge'}
        </button>
      </div>

      {showAdd && (
        <div className="card glass mb-2" style={{ animation: 'fadeIn 0.3s ease' }}>
          <h2 className="mono mb-1" style={{ fontSize: '1.2rem', color: 'var(--neon-green)' }}>New Artifact.js</h2>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label mono">TITLE</label>
              <input 
                className="form-input mono" 
                value={newSnippet.title} 
                onChange={e => setNewSnippet({...newSnippet, title: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label mono">DESCRIPTION</label>
              <input 
                className="form-input mono" 
                value={newSnippet.description} 
                onChange={e => setNewSnippet({...newSnippet, description: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="form-label mono">Code Buffer</label>
              <textarea 
                className="form-input mono" 
                rows="6" 
                value={newSnippet.code} 
                onChange={e => setNewSnippet({...newSnippet, code: e.target.value})} 
                style={{ resize: 'none' }}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label mono">Tag Metadata (comma-separated)</label>
              <input 
                className="form-input mono" 
                value={newSnippet.tags} 
                onChange={e => setNewSnippet({...newSnippet, tags: e.target.value})} 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Commit to Forge</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        {snippets.map(s => (
          <div key={s._id} className="card neon-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="flex justify-between items-start mb-1">
                <h3 className="mono" style={{ color: 'var(--neon-green)', fontSize: '1.1rem' }}>{s.title}</h3>
                <button 
                  onClick={() => handleStar(s._id)} 
                  className="mono" 
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: s.starredBy?.includes(user?.id) ? 'var(--neon-green)' : 'var(--text-muted)' 
                  }}
                >
                  ★ {s.stars}
                </button>
              </div>
              <p className="text-muted" style={{ fontSize: '13px', marginBottom: '12px' }}>{s.description}</p>
              <pre className="mono" style={{ 
                backgroundColor: '#0d1117', 
                padding: '12px', 
                borderRadius: '6px', 
                fontSize: '12px', 
                maxHeight: '150px', 
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                color: '#888'
              }}>
                {s.code}
              </pre>
            </div>
            <div className="flex justify-between items-center mt-1 pt-1" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span className="mono" style={{ fontSize: '12px' }}>AUTHOR: {s.authorId?.name || 'ANON'}</span>
              <div className="flex gap-1">
                {s.tags?.map(t => <span key={t} className="badge" style={{ fontSize: '10px' }}>#{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forge;
