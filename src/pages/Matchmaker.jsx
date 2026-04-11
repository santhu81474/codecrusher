import React, { useState } from 'react';
import { runAiMatchmaker } from '../services/api';

const Matchmaker = () => {
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  const handleAssemble = async () => {
    if (!requirements.trim()) {
      setError('Please provide project requirements.');
      return;
    }

    setLoading(true);
    setError('');
    setLogs(['Initiating ReAct Protocol...', 'Establishing connection with Database...']);
    setMatches([]);

    try {
      const response = await runAiMatchmaker(requirements);
      const data = response.data;
      
      if (data.logs) {
        // Sequentially display logs to look like computing
        data.logs.forEach((log, index) => {
          setTimeout(() => {
            setLogs(prev => [...prev, log]);
            
            // Once last log is printed, show matches
            if (index === data.logs.length - 1) {
              setTimeout(() => {
                setMatches(data.matches || []);
                setLoading(false);
              }, 1000);
            }
          }, index * 800 + 1000);
        });
      } else {
        setLogs(prev => [...prev, 'Protocol executed directly.']);
        setMatches(data.matches || []);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to assemble team. Core Offline.');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', padding: '0 20px', minHeight: '80vh' }}>
      
      <div style={{ marginBottom: '40px' }}>
        <h1 className="mono" style={{ color: 'var(--neon-green)', letterSpacing: '2px', textShadow: '0 0 10px rgba(46, 204, 113, 0.3)' }}>
          AI_MATCHMAKER_AGENT
        </h1>
        <p className="mono" style={{ color: 'var(--text-muted)' }}>
          Enter your strict project requirements. Our ReAct Agent will parse the global talent network, reason across all active nodes, and output an optimal strike team.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Input Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="mono" style={{ color: 'var(--link-color)', marginBottom: '16px' }}>&gt; Project Specifications</h3>
          <textarea
            className="form-input mono"
            style={{ width: '100%', height: '200px', resize: 'none', backgroundColor: 'rgba(0,0,0,0.4)', color: 'var(--text-main)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            placeholder="e.g. Seeking a Full-Stack developer heavily focused on React and Node.js for an immediate start on a FinTech dashboard. Needs high problem-solving skills..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          ></textarea>
          
          <button 
            className="btn btn-primary mono" 
            style={{ width: '100%', marginTop: '20px', padding: '14px', letterSpacing: '1px' }}
            onClick={handleAssemble}
            disabled={loading}
          >
            {loading ? 'EXECUTING ALGORITHM...' : 'INITIATE COMPILATION RUN'}
          </button>
          
          {error && <p className="mono" style={{ color: '#ef4444', marginTop: '16px', fontSize: '13px' }}>Error: {error}</p>}
        </div>

        {/* Output Panel / Terminal */}
        <div className="glass-panel scan-line" style={{ padding: '24px', backgroundColor: '#050a0f', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
           <h3 className="mono" style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '12px' }}>// ReAct Chain of Thought</h3>
           <div className="mono" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '260px' }}>
              {logs.map((log, i) => {
                let color = 'var(--text-muted)';
                if (log.startsWith('Thought:')) color = '#f59e0b';
                if (log.startsWith('Action:')) color = 'var(--link-color)';
                if (log.startsWith('Observation:')) color = '#8b5cf6';
                if (log.startsWith('Final')) color = 'var(--neon-green)';

                return (
                  <div key={i} style={{ color, fontSize: '13px', lineHeight: '1.4' }}>
                    &gt; {log}
                  </div>
                );
              })}
              {loading && logs.length > 0 && (
                 <div className="mono pulse-glow" style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                    &gt; _
                 </div>
              )}
           </div>
        </div>

      </div>

      {/* Target Acquired Grid */}
      {matches.length > 0 && !loading && (
        <div style={{ marginTop: '50px' }}>
          <h2 className="mono" style={{ color: 'var(--neon-green)', letterSpacing: '1px', borderBottom: '1px dashed var(--neon-green)', paddingBottom: '10px' }}>
            [ MATCHES_ACQUIRED ]
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '30px' }}>
             {matches.map((match, i) => (
                <div key={i} className="card neon-hover" style={{ padding: '24px', position: 'relative' }}>
                   <div style={{ position: 'absolute', top: '24px', right: '24px', opacity: 0.1, color: 'var(--neon-green)' }}>
                     <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                   </div>
                   <h3 className="mono" style={{ color: 'white', marginBottom: '8px', fontSize: '18px' }}>{match.name || 'Anonymous Node'}</h3>
                   <span className="mono badge" style={{ marginBottom: '16px', display: 'inline-block' }}>OPT_ID: {match.userId?.substring(0,6) || 'Unknown'}</span>
                   <p className="mono" style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                     {match.reasoning}
                   </p>
                   <button className="btn btn-outline mono" style={{ width: '100%', marginTop: '20px', fontSize: '11px', padding: '8px' }}>
                     INVITE TO CONNECT
                   </button>
                </div>
             ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Matchmaker;
