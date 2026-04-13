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
  const { user } = useAuth();
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
            return <code key={j} style={{ background: 'rgba(129,140,248,0.1)', padding: '1px 5px', borderRadius: '3px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{seg.slice(1, -1)}</code>;
          }
          // Bold
          return seg.split(/(\*\*.*?\*\*)/g).map((s, k) => {
            if (s.startsWith('**') && s.endsWith('**')) {
              return <strong key={k}>{s.slice(2, -2)}</strong>;
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
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
      <h1 className="page-title" style={{ marginBottom: '16px' }}>AI Terminal</h1>
      
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}>
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>Ask me anything about coding, debugging, or the CodeCrusher platform.</p>
            <p style={{ fontSize: '12px' }}>Messages are saved and persist across sessions.</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={msg._id || index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '12px 16px', borderRadius: '12px',
              backgroundColor: msg.role === 'user' ? 'var(--primary-glow)' : 'var(--surface-2)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(129,140,248,0.2)' : 'var(--border)'}`,
              wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap', overflow: 'hidden'
            }}>
              <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                {renderContent(msg.content)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}>
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
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 0' }}>
        <form onSubmit={handleSend}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={250}
            placeholder="Ask the AI anything..."
            className="form-input"
            rows="2"
            style={{ resize: 'none', marginBottom: '8px', fontFamily: 'var(--font-main)' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: charCount > 200 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
              {charCount}/250
            </span>
            <button
              type="submit"
              disabled={!input.trim() || charCount > 250 || loading}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '13px' }}
            >
              {loading ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerminalChat;
