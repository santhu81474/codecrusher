import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

const Arena = () => {
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // AI Assistant State
  const [showAssistant, setShowAssistant] = useState(true); // Default to true for premium feel
  const [aiMode, setAiMode] = useState('mentor'); // Modes: mentor, generator, debugger, interviewer, comedian
  const [chatMessages, setChatMessages] = useState([
    { sender: 'AI', text: 'Tactical Assistant active. How can I help with this algorithm?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const templates = {
    javascript: '// Implement your solution here\nfunction solve() {\n  \n}',
    python: '# Implement your solution here\ndef solve():\n    pass',
    cpp: '// Implement your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
    java: '// Implement your solution here\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}'
  };

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const { data } = await api.get('/challenges/daily');
        setChallenge(data);
        setCode(templates.javascript);
      } catch (error) {
        console.error('Failed to fetch daily challenge', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(templates[newLang]);
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const inputMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'YOU', text: inputMsg }]);
    setChatLoading(true);
    setChatInput('');
    
    try {
      const modeInstructions = {
        mentor: "Act as a helpful Mentor. Focus on explaining concepts clearly and provide hints rather than immediate full code solutions unless explicitly requested.",
        generator: "Act as a pure Code Generator. Provide the exact code requested immediately with minimal explanation. Optimize for speed and directness.",
        debugger: "Act as a strict Code Debugger. Focus entirely on finding edge cases, potential bugs, time/space complexity flaws, and security vulnerabilities in the user's code.",
        interviewer: "Act as a FAANG Technical Interviewer. Ask follow-up questions about algorithmic complexity, alternative approaches, and trade-ops instead of just giving away the answer directly.",
        comedian: "Act as a cynical but helpful Hacker Comedian. Use sarcasm, software engineering tropes, and memes in your responses. Make it extremely dramatic like an friendly colleague."
      };

      const promptData = {
        prompt: `You are an AI assistant in a coding challenge arena.

Current Challenge context:
Title: ${challenge.title}
Problem: ${challenge.problemStatement}

INSTRUCTIONS FOR YOU:
- MODE: ${modeInstructions[aiMode]}
- Act as a chatbot. If the user greets you, greet back warmly and offer assistance.
- If the user asks for code, even if it is unrelated to the current challenge (e.g., "simple sum of numbers code"), provide the code they asked for.
- If the user asks for an explanation, explain the concepts clearly along with the code.
- IMPORTANT: When you DO provide code, ALWAYS wrap it in TRIPLE BACKTICKS (\`\`\`).

Chat History:
${chatMessages.map(m => `${m.sender}: ${m.text}`).join('\n')}
YOU: ${inputMsg}
AI:`
      };
      const res = await api.post('/gemini/chat', promptData);
      setChatMessages(prev => [...prev, { sender: 'AI', text: res.data.response }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { sender: 'AI', text: 'Link Error: Neural response failed. Check connectivity or API quota.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const applySuggestedCode = (text) => {
    const codeMatch = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (codeMatch && codeMatch[1]) {
      setCode(codeMatch[1].trim());
      alert('Synchronization Complete: Code updated in editor.');
    } else {
      alert('Synchronization Failed: No valid code block found in response.');
    }
  };

  const handleSubmit = async () => {
    if (!code || code.trim().length < 10) {
      alert('Critical Error: Transmission too small. Please implement the algorithm.');
      return;
    }

    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await api.post('/challenges/submit', {
        challengeId: challenge._id,
        code,
        language
      });
      setResult(data);
    } catch (error) {
      console.error('Submission failed', error);
      alert('Transmission Error: Signal Lost.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        <Skeleton width="300px" height="40px" className="mb-2" />
        <Skeleton width="100%" height="200px" className="mb-4" />
        <Skeleton width="100%" height="500px" />
      </div>
    );
  }

  return (
    <div className="arena-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px 32px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Info */}
      <div className="mb-6 flex justify-between items-end glass-panel" style={{ padding: '24px 32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="mono" style={{ color: 'var(--neon-green)', fontSize: '12px', letterSpacing: '3px', marginBottom: '12px', textShadow: '0 0 10px rgba(46,204,113,0.5)' }}>
            Daily Challenge Log — {new Date().toLocaleDateString()} ]
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '-1px', color: 'var(--text-main)' }}>{challenge.title}</h1>
          <div className="flex gap-4 mono" style={{ fontSize: '13px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: '8px', display: 'inline-flex' }}>
            <span><span style={{ color: 'var(--text-muted)' }}>DIFFICULTY:</span> <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>{challenge.difficulty.toUpperCase()}</span></span>
            <span style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></span>
            <span><span style={{ color: 'var(--text-muted)' }}>REWARD:</span> <span style={{ color: 'var(--neon-green)', fontWeight: 'bold', textShadow: '0 0 8px rgba(46,204,113,0.4)' }}>+{challenge.points} XP</span></span>
          </div>
        </div>
        
        {!showAssistant && (
          <button 
            onClick={() => setShowAssistant(true)}
            className="btn neon-hover mono" 
            style={{ fontSize: 12, padding: '12px 24px', borderColor: 'var(--neon-green)', color: 'var(--neon-green)', background: 'rgba(46, 204, 113, 0.05)', letterSpacing: '1px' }}
          >
            Enable AI Assistant
          </button>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: showAssistant ? '1fr 450px' : '1fr', 
        gap: '32px', 
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        flex: 1
      }}>
        
        {/* Workspace: Problem + Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Problem Card - Redesigned to be less bulky */}
          <div className="glass-panel scan-line" style={{ padding: '0', borderTop: '4px solid var(--neon-green)' }}>
            <div style={{ padding: '16px 24px', backgroundColor: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="mono" style={{ fontSize: '12px', color: 'var(--neon-green)', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 8, height: 8, backgroundColor: 'var(--neon-green)', borderRadius: '50%', boxShadow: '0 0 8px var(--neon-green)' }} />
                Mission Objective
              </div>
            </div>
            <div style={{ padding: '24px', lineHeight: 1.8, fontSize: '16px', color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-wrap' }}>
              {challenge.problemStatement}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: '600px' }}>
            <div style={{ 
              backgroundColor: 'rgba(0,0,0,0.6)', 
              padding: '16px 24px', 
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                </div>
                <span className="mono" style={{ fontSize: '13px', color: 'var(--text-main)', opacity: 0.9 }}>
                  transmission.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'js'}
                </span>
                <select 
                  value={language} 
                  onChange={handleLanguageChange}
                  className="mono"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--neon-green)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '6px', fontSize: '12px', padding: '6px 12px', outline: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <option value="javascript">Javascript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <div className="mono" style={{ fontSize: '12px', color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: 8, textShadow: '0 0 8px rgba(46,204,113,0.5)' }}>
                <div className="pulse-dot" style={{ width: 8, height: 8, backgroundColor: 'var(--neon-green)', borderRadius: '50%', boxShadow: '0 0 12px var(--neon-green)' }}></div>
                Uplink Stable
              </div>
            </div>
            
            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
              <div className="mono" style={{ padding: '24px 12px', backgroundColor: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.2)', fontSize: '15px', lineHeight: '1.7', textAlign: 'right', userSelect: 'none', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                {Array.from({ length: Math.max(20, code.split('\\n').length) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mono"
                spellCheck="false"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '500px',
                  backgroundColor: 'transparent',
                  color: '#e6edf3',
                  border: 'none',
                  padding: '24px',
                  fontSize: '15px',
                  lineHeight: '1.7',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: '"JetBrains Mono", monospace'
                }}
              />
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.4)', textAlign: 'right' }}>
              <button 
                className="btn btn-primary neon-hover mono" 
                onClick={handleSubmit} 
                disabled={submitting}
                style={{ padding: '14px 48px', letterSpacing: '2px', fontSize: '14px', fontWeight: 'bold' }}
              >
                {submitting ? 'Executing Payload...' : 'Transmit Algorithm'}
              </button>
            </div>
          </div>

          {result && (
            <div className="glass-panel" style={{ 
              padding: '32px', 
              borderLeft: `6px solid ${result.submission.status === 'Accepted' ? 'var(--neon-green)' : '#ff5f56'}`,
              animation: 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>Execution Results</div>
              <h3 className="mono" style={{ color: result.submission.status === 'Accepted' ? 'var(--neon-green)' : '#ff5f56', marginBottom: '20px', fontSize: '24px', textShadow: `0 0 15px ${result.submission.status === 'Accepted' ? 'rgba(46,204,113,0.4)' : 'rgba(255,95,86,0.4)'}` }}>
                {result.submission.status === 'Accepted' ? 'Compilation Success' : 'Compilation Failure'}
              </h3>
              <div className="mono" style={{ fontSize: '15px', display: 'grid', gridTemplateColumns: 'minmax(200px, max-content) minmax(200px, max-content)', gap: 24 }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>STATUS:</span>
                  <span style={{ color: result.submission.status === 'Accepted' ? 'var(--neon-green)' : '#ff5f56', fontWeight: 'bold' }}>{result.submission.status}</span>
                </div>
                {result.pointsEarned > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>XP Gain:</span>
                    <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>+{result.pointsEarned}</span>
                  </div>
                )}
              </div>
              {result.feedback && (
                <div className="mono" style={{ marginTop: '24px', padding: '16px 24px', background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.8)', fontSize: 14, borderLeft: '2px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--neon-green)', marginRight: '8px' }}>{'>'}</span> {result.feedback}
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Sidebar */}
        {showAssistant && (
          <aside className="glass-panel" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100vh - 150px)', 
            position: 'sticky', 
            top: '100px',
            borderRight: '1px solid rgba(46, 204, 113, 0.2)',
            borderBottom: '1px solid rgba(46, 204, 113, 0.2)',
            boxShadow: '-10px 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(46,204,113,0.03)'
          }}>
            {/* AI Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'linear-gradient(135deg, rgba(46,204,113,0.2), rgba(46,204,113,0.05))', border: '1px solid var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(46,204,113,0.3)' }}>
                  <div style={{ width: 14, height: 14, backgroundColor: 'var(--neon-green)', borderRadius: '2px', animation: 'pulseGlow 2s infinite' }} />
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 14, color: 'var(--neon-green)', fontWeight: 800, letterSpacing: '1px', textShadow: '0 0 8px rgba(46,204,113,0.5)' }}>AI Assistant //</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>MODEL: Gemini Pro v3</div>
                </div>
              </div>
              <button 
                onClick={() => setShowAssistant(false)}
                className="mono neon-hover" 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', outline: 'none' }}
                title="Disconnect"
              >
                ×
              </button>
            </div>

            {/* Mode Selector */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--neon-green)', marginBottom: '16px', letterSpacing: '2px' }}>AI Suggestion</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'mentor', label: 'MENTOR' },
                  { id: 'generator', label: 'GENERATE' },
                  { id: 'debugger', label: 'DEBUG' },
                  { id: 'interviewer', label: 'INTERVIEW' },
                  { id: 'comedian', label: 'CYNIC' }
                ].map(mode => (
                  <button 
                    key={mode.id} 
                    onClick={() => setAiMode(mode.id)}
                    className="mono"
                    style={{ 
                      padding: '10px 0',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      border: aiMode === mode.id ? '1px solid var(--neon-green)' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: aiMode === mode.id ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255,255,255,0.02)',
                      color: aiMode === mode.id ? 'var(--neon-green)' : 'var(--text-muted)',
                      boxShadow: aiMode === mode.id ? '0 0 10px rgba(46,204,113,0.2)' : 'none',
                      transition: 'all 0.2s',
                      gridColumn: mode.id === 'comedian' ? '1 / -1' : 'auto'
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div style={{
              flex: 1, 
              padding: '24px', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '24px',
              backgroundColor: 'transparent'
            }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ 
                  alignSelf: m.sender === 'YOU' ? 'flex-end' : 'flex-start',
flexShrink: 0,
                  maxWidth: '85%',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <div className="mono" style={{ 
                    fontSize: 10, 
                    color: m.sender === 'YOU' ? 'var(--link-color)' : 'var(--neon-green)', 
                    marginBottom: 8, 
                    opacity: 0.8,
                    textAlign: m.sender === 'YOU' ? 'right' : 'left',
                    letterSpacing: '1px'
                  }}>
                    {m.sender} // {new Date().toLocaleTimeString()}
                  </div>
                  <div style={{ 
                    backgroundColor: m.sender === 'AI' ? 'rgba(46, 204, 113, 0.05)' : 'rgba(88, 166, 255, 0.05)', 
                    padding: '16px 20px', 
                    borderRadius: m.sender === 'YOU' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    border: `1px solid ${m.sender === 'AI' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(88, 166, 255, 0.2)'}`,
                    boxShadow: `0 4px 15px ${m.sender === 'AI' ? 'rgba(46,204,113,0.05)' : 'rgba(88,166,255,0.05)'}`
                  }}>
                    <div className="mono" style={{ color: 'var(--text-main)', lineHeight: 1.6, fontSize: '13px', whiteSpace: 'pre-wrap' }}>{m.text}</div>
                    
                    {m.sender === 'AI' && m.text.includes('```') && (
                      <button 
                        onClick={() => applySuggestedCode(m.text)}
                        className="btn btn-outline mono neon-hover" 
                        style={{ marginTop: 16, fontSize: 11, padding: '8px 16px', width: '100%', borderColor: 'var(--neon-green)', color: 'var(--neon-green)', background: 'rgba(46,204,113,0.05)', letterSpacing: '1px' }}
                      >
                        Inject Code
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="mono" style={{ fontSize: 12, color: 'var(--neon-green)', alignSelf: 'flex-start', animation: 'pulseGlow 1.5s infinite', background: 'rgba(46,204,113,0.05)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(46,204,113,0.2)' }}>
                  Processing Query...
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendChatMessage} style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <div style={{ position: 'relative' }}>
                <span className="mono" style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--neon-green)', fontSize: '14px' }}>{'>'}</span>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Enter command..." 
                  className="mono"
                  style={{ 
                    width: '100%', 
                    padding: '16px 16px 16px 40px', 
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--neon-green)'; e.target.style.boxShadow = '0 0 10px rgba(46,204,113,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  disabled={chatLoading}
                />
              </div>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Arena;
