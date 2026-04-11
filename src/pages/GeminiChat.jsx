import React, { useState } from 'react';
import api from '../services/api';

const GeminiChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'AI Assistant', text: 'Hello! I am the TeamForge AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMsg = { sender: 'You', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    
    try {
      const res = await api.post('/gemini/chat', { prompt: input });
      setMessages((prev) => [...prev, { sender: 'AI Assistant', text: res.data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'AI Assistant', text: 'Response failed. Please check your connectivity.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px' }}>
      <div className="flex justify-between items-center mb-2">
        <h1 className="page-title">Gemini Chat Portal</h1>
        <div className="mono badge" style={{ color: 'var(--neon-green)', borderColor: 'var(--neon-green)' }}>Encrypted Link: ACTIVE</div>
      </div>

      <div className="glass-panel scan-line" style={{ 
        height: '600px', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        border: '1.5px solid rgba(46, 204, 113, 0.15)'
      }}>
        {/* Chat Output Area */}
        <div style={{ 
          flex: 1, 
          padding: '24px', 
          overflowY: 'auto', 
          backgroundColor: 'rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((m, i) => (
            <div key={i} className="card glass-panel" style={{ 
              alignSelf: m.sender === 'You' ? 'flex-end' : 'flex-start',              flexShrink: 0,              maxWidth: '85%',
              padding: '12px 18px',
              borderLeft: m.sender === 'AI Assistant' ? '3px solid var(--neon-green)' : '1px solid rgba(88, 166, 255, 0.2)',
              borderRight: m.sender === 'You' ? '3px solid var(--link-color)' : '1px solid rgba(255, 255, 255, 0.05)',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div className="mono" style={{ 
                fontSize: 10, 
                color: m.sender === 'AI Assistant' ? 'var(--neon-green)' : 'var(--link-color)',
                marginBottom: 6,
                letterSpacing: 1
              }}>
                {m.sender} // {new Date().toLocaleTimeString()}
              </div>
              <div className="mono" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-main)' }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="mono" style={{ color: 'var(--neon-green)', fontSize: 11, animation: 'pulse 1s infinite' }}>
              {'>'} Generating response...
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} style={{ 
          padding: '20px', 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          gap: '12px',
          backgroundColor: 'rgba(22, 27, 34, 0.8)'
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="form-input mono"
            style={{ flex: 1, fontSize: 14, background: 'rgba(0,0,0,0.3)' }}
            disabled={loading}
          />
          <button 
            className="btn btn-primary neon-hover mono" 
            type="submit" 
            disabled={loading || !input.trim()}
            style={{ padding: '0 32px' }}
          >
            EXECUTE
          </button>
        </form>
      </div>
      
      <div className="mono" style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', opacity: 0.6 }}>
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};

export default GeminiChat;
