import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { runAiMatchmaker } from '../services/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Simple in-memory cache
const cache = new Map();

const Matchmaker = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const inputRef = useRef(null);

  const handleMatch = async () => {
    if (!requirements.trim()) {
      toast.error('Please describe the project requirements');
      return;
    }

    // Check cache
    const cacheKey = requirements.trim().toLowerCase();
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      setResult(cached);
      setLogs(cached.logs || []);
      toast.success('Loaded from cache');
      return;
    }

    setLoading(true);
    setResult(null);
    setLogs([]);

    try {
      const { data } = await runAiMatchmaker(requirements);
      setResult(data);
      setLogs(data.logs || []);
      
      // Store in cache
      cache.set(cacheKey, data);

      if (data.fallback) {
        toast('AI ranking timed out — showing direct matches', { icon: '⚡' });
      } else {
        toast.success('Matches found!');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Matchmaking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>AI Team Assembly</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Describe your project needs and our AI agent will match you with the best developers.
        </p>
      </div>

      {/* Input Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
          Project Requirements
        </label>
        <textarea
          ref={inputRef}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Describe the skills, experience, and type of developer you need..."
          className="form-input"
          rows="4"
          style={{ resize: 'vertical', marginBottom: '16px' }}
        />
        <button onClick={handleMatch} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
          {loading ? 'Running AI Agent...' : '✦ Find Best Matches'}
        </button>
      </div>

      {/* Skeleton Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '12px', width: '80%', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '12px', width: '60%' }} />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '20px' }}>
              <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: '16px', width: '150px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '12px', width: '90%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Agent Logs */}
      {!loading && logs.length > 0 && (
        <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
            Agent Reasoning
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ fontSize: '12px', color: 'var(--text-main)', paddingLeft: '12px', borderLeft: '2px solid var(--primary-glow)' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && result?.matches && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            Top Matches ({result.matches.length})
            {result.fallback && <span style={{ marginLeft: '8px', color: 'var(--accent-amber)', textTransform: 'none', letterSpacing: 0 }}>(Direct match — AI ranking unavailable)</span>}
          </div>
          {result.matches.map((match, i) => (
            <div key={match.userId || i} className="card neon-hover" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, var(--primary), var(--accent-purple))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 700 }}>
                  {match.name?.charAt(0) || '?'}
                </div>
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', background: i === 0 ? 'var(--accent-amber)' : i === 1 ? 'var(--text-muted)' : 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#000' }}>
                  {i + 1}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{match.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{match.reasoning}</p>
              </div>
              <Link to={`/profile/${match.userId}`} className="btn btn-outline" style={{ flexShrink: 0, fontSize: '12px', padding: '6px 14px' }}>
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matchmaker;
