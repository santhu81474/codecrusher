import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Lightweight code block renderer (no dependency needed)
const CodeBlock = ({ language, code }) => (
  <div style={{ margin: '8px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 12px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', color: 'var(--text-muted)' }}>
      <span>{language}</span>
      <button
        onClick={() => { navigator.clipboard.writeText(code); }}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', padding: '2px 6px' }}
      >
        Copy
      </button>
    </div>
    <pre style={{
      padding: '12px', margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12px',
      lineHeight: 1.5, backgroundColor: 'var(--bg-color)', color: '#e2e8f0', overflowX: 'auto', whiteSpace: 'pre'
    }}>
      {code}
    </pre>
  </div>
);

const TerminalChat = () => {
  const { user: _user } = useAuth(); // eslint-disable-line no-unused-vars
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/terminal/history');
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch terminal history:', error);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || input.length > 250) return;

    const userMessage = { role: 'user', content: input, createdAt: new Date().toISOString(), _id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/terminal/message', { content: currentInput });
      setMessages(prev => [...prev.filter(m => m._id !== userMessage._id), data.userMessage, data.assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { role: 'assistant', content: 'Error: Could not get a response from the assistant.', createdAt: new Date().toISOString(), _id: Date.now() + 1 };
      setMessages(prev => [...prev.filter(m => m._id !== userMessage._id), userMessage, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'code', language: match[1] || 'text', value: match[2] });
      lastIndex = codeBlockRegex.lastIndex;
    }
    if (lastIndex < content.length) {
      parts.push({ type: 'text', value: content.substring(lastIndex) });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return <CodeBlock key={index} language={part.language} code={part.value} />;
      }
      // Render text with line breaks and inline code
      const rendered = part.value.split('\n').map((line, i) => {
        // Handle inline code
        const inlineParts = line.split(/(`[^`]+`)/g).map((seg, j) => {
          if (seg.startsWith('`') && seg.endsWith('`')) {
            return <code key={j} style={{ background: 'var(--primary-glow)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)', border: '1px solid var(--border)' }}>{seg.slice(1, -1)}</code>;
          }
          // Bold
          return seg.split(/(\*\*.*?\*\*)/g).map((s, k) => {
            if (s.startsWith('**') && s.endsWith('**')) {
              return <strong key={k} style={{ color: 'var(--text-primary)' }}>{s.slice(2, -2)}</strong>;
            }
            return s;
          });
        });
        return <React.Fragment key={i}>{inlineParts}{i < part.value.split('\n').length - 1 && <br />}</React.Fragment>;
      });
      return <span key={index}>{rendered}</span>;
    });
  };

  const charCount = input.length;

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Terminal Chat</h1>
      </div>
      
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', overflow: 'hidden' }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '24px' }}>💬</span>
              </div>
              <p style={{ fontSize: '15px', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>Terminal Assistant</p>
              <p style={{ fontSize: '13px' }}>Ask me anything about algorithms, debugging, or the CodeCrusher platform.</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={msg._id || index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                backgroundColor: msg.role === 'user' ? 'var(--primary-glow)' : 'var(--surface-2)',
                border: `1px solid ${msg.role === 'user' ? 'var(--border-hover)' : 'var(--border)'}`,
                wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap', overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {renderContent(msg.content)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '14px 18px', borderRadius: '16px 16px 16px 4px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'pulse 1s infinite' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'pulse 1s infinite 0.2s' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'pulse 1s infinite 0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', backgroundColor: 'var(--surface-2)' }}>
          <form onSubmit={handleSend}>
            <div style={{ position: 'relative' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={250}
                placeholder="Ask the AI anything..."
                className="form-input"
                rows="2"
                style={{ 
                  resize: 'none', 
                  fontFamily: 'var(--font-main)', 
                  paddingRight: '80px',
                  backgroundColor: 'var(--bg-color)'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || charCount > 250 || loading}
                className="btn btn-primary"
                style={{ 
                  position: 'absolute', 
                  right: '8px', 
                  bottom: '12px', 
                  padding: '6px 14px', 
                  fontSize: '12px' 
                }}
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: charCount > 200 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                {charCount}/250 characters
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Press Enter to send, Shift+Enter for new line</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TerminalChat;
