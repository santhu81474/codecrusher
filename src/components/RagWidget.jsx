import React, { useState, useRef, useEffect } from 'react';
import { queryCodebaseRAG } from '../services/api';

const RagWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'RAG',
      text: 'Codebase RAG Engine online. I can answer questions grounded in the real TeamForge source code. Ask me anything — "How is auth handled?", "What does the Challenge model look like?", etc.',
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setMessages(prev => [...prev, { sender: 'YOU', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await queryCodebaseRAG(question);
      setMessages(prev => [...prev, {
        sender: 'RAG',
        text: data.answer,
        sources: data.sources || [],
        filesIndexed: data.filesIndexed
      }]);
    } catch (err) {
      console.error('RAG error:', err);
      setMessages(prev => [...prev, {
        sender: 'RAG',
        text: 'RAG Pipeline Error: Failed to retrieve codebase context. Check backend connectivity.',
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Floating Action Button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Ask the Codebase (RAG)"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          border: '2px solid rgba(139, 92, 246, 0.6)',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 25px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9000,
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => { e.target.style.transform = 'scale(1.1)'; e.target.style.boxShadow = '0 4px 35px rgba(139, 92, 246, 0.6)'; }}
        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 25px rgba(139, 92, 246, 0.4)'; }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      right: '32px',
      width: '420px',
      height: '580px',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 9000,
      background: 'rgba(13, 17, 23, 0.97)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      boxShadow: '0 8px 40px rgba(0, 0, 0, 0.6), 0 0 60px rgba(139, 92, 246, 0.1)',
      backdropFilter: 'blur(20px)',
      animation: 'fadeIn 0.3s ease-out',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        background: 'rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(139,92,246,0.05))',
            border: '1px solid #8b5cf6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(139,92,246,0.3)'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#8b5cf6', fontWeight: 800, letterSpacing: '1px' }}>
              CODEBASE RAG
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
              RETRIEVAL-AUGMENTED GENERATION
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.4)', fontSize: '20px',
            cursor: 'pointer', lineHeight: 1
          }}
        >
          ×
        </button>
      </div>

      {/* Status Bar */}
      <div style={{
        padding: '8px 20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2ecc71',
          boxShadow: '0 0 8px #2ecc71'
        }} />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
          16 SOURCE FILES INDEXED
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: '9px',
          padding: '2px 8px', borderRadius: '4px',
          backgroundColor: 'rgba(139,92,246,0.15)',
          color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)'
        }}>
          RAG ACTIVE
        </span>
      </div>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.sender === 'YOU' ? 'flex-end' : 'flex-start',
            maxWidth: '90%',
          }}>
            <div style={{
              fontSize: '9px',
              color: m.sender === 'YOU' ? 'rgba(88,166,255,0.6)' : 'rgba(139,92,246,0.7)',
              marginBottom: '4px',
              letterSpacing: '1px',
              textAlign: m.sender === 'YOU' ? 'right' : 'left'
            }}>
              {m.sender === 'YOU' ? 'YOU' : '[ RAG ENGINE ]'}
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: m.sender === 'YOU' ? '12px 12px 0 12px' : '12px 12px 12px 0',
              backgroundColor: m.sender === 'YOU'
                ? 'rgba(88, 166, 255, 0.08)'
                : 'rgba(139, 92, 246, 0.06)',
              border: `1px solid ${m.sender === 'YOU'
                ? 'rgba(88, 166, 255, 0.2)'
                : 'rgba(139, 92, 246, 0.2)'}`,
              fontSize: '12px',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {m.text}
            </div>
            {/* Source files badge */}
            {m.sender === 'RAG' && m.sources && m.sources.length > 0 && (
              <div style={{
                marginTop: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                {m.sources.map((src, si) => (
                  <span key={si} style={{
                    fontSize: '9px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(46, 204, 113, 0.08)',
                    color: '#2ecc71',
                    border: '1px solid rgba(46, 204, 113, 0.2)',
                  }}>
                    {src}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(139, 92, 246, 0.06)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            fontSize: '11px',
            color: '#8b5cf6',
          }}>
            <span style={{ animation: 'pulseGlow 1.5s infinite' }}>Retrieving from codebase...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.4)',
      }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)',
            color: '#8b5cf6', fontSize: '13px', pointerEvents: 'none'
          }}>{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about the codebase..."
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 14px 14px 36px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '10px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '12px',
              outline: 'none',
              fontFamily: '"JetBrains Mono", monospace',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#8b5cf6';
              e.target.style.boxShadow = '0 0 12px rgba(139,92,246,0.2)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(139,92,246,0.2)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default RagWidget;
