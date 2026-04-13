import React, { useState } from 'react';
import { explainCode } from '../services/api';
import { toast } from 'react-hot-toast';

const AIExplainer = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [level, setLevel] = useState('intermediate');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    if (!code.trim()) {
      toast.error('Please paste some code to explain');
      return;
    }
    setLoading(true);
    setExplanation('');
    try {
      const { data } = await explainCode(code, language, level);
      setExplanation(data.explanation);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to explain code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation);
    toast.success('Explanation copied!');
  };

  const levelOptions = [
    { value: 'beginner', label: 'Beginner', desc: 'Simple analogies, no jargon', icon: '🌱' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Technical but clear', icon: '⚡' },
    { value: 'expert', label: 'Expert', desc: 'Concise, architecture focus', icon: '🔬' },
  ];

  // Simple markdown-like rendering
  const renderExplanation = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      // Bold
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Headers
      if (line.startsWith('### ')) return <h4 key={i} style={{ color: 'var(--accent-green)', marginTop: '16px', marginBottom: '8px', fontSize: '14px' }}>{line.slice(4)}</h4>;
      if (line.startsWith('## ')) return <h3 key={i} style={{ color: 'var(--text-primary)', marginTop: '20px', marginBottom: '8px', fontSize: '16px' }}>{line.slice(3)}</h3>;
      if (line.startsWith('# ')) return <h2 key={i} style={{ color: 'var(--text-primary)', marginTop: '24px', marginBottom: '8px', fontSize: '18px' }}>{line.slice(2)}</h2>;
      
      // Numbered items
      if (/^\d+[\)\.]\s/.test(line)) return <p key={i} style={{ marginLeft: '8px', marginBottom: '6px', color: 'var(--text-main)', lineHeight: 1.6 }}>{parts}</p>;
      
      // Empty line
      if (line.trim() === '') return <br key={i} />;
      
      return <p key={i} style={{ marginBottom: '6px', color: 'var(--text-main)', lineHeight: 1.6 }}>{parts}</p>;
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
      <h1 className="page-title" style={{ marginBottom: '4px' }}>AI Code Explainer</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        Paste any code and get a clear explanation at your chosen complexity level.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', minHeight: '500px' }}>
        {/* Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Language & Level */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="form-input" style={{ width: 'auto', flex: 1 }}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          {/* Level selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {levelOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setLevel(opt.value)}
                className={`card neon-hover`}
                style={{
                  flex: 1, padding: '12px', textAlign: 'center', cursor: 'pointer',
                  borderColor: level === opt.value ? 'var(--primary)' : 'var(--border-color)',
                  background: level === opt.value ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)',
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{opt.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: level === opt.value ? 'var(--primary)' : 'var(--text-primary)' }}>{opt.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</div>
              </button>
            ))}
          </div>

          {/* Code input */}
          <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)' }}>
              Paste your code below
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here..."
              style={{
                flex: 1, padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.6,
                backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', border: 'none', outline: 'none', resize: 'none', minHeight: '300px',
              }}
              spellCheck={false}
            />
          </div>

          <button onClick={handleExplain} disabled={loading || !code.trim()} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
            {loading ? 'Analyzing...' : 'Explain This Code'}
          </button>
        </div>

        {/* Output Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Explanation</span>
            {explanation && (
              <button onClick={handleCopy} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '11px' }}>
                Copy
              </button>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="skeleton" style={{ height: `${16 + Math.random() * 20}px`, width: `${50 + Math.random() * 50}%`, borderRadius: '4px' }} />
                ))}
              </div>
            )}
            {!loading && !explanation && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.5 }}><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                <p style={{ fontSize: '14px' }}>Paste code and click "Explain" to get started</p>
              </div>
            )}
            {!loading && explanation && (
              <div style={{ fontSize: '14px' }}>
                {renderExplanation(explanation)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIExplainer;
