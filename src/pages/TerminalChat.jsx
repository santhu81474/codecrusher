import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
// Keep one persistent connection per client
const socket = io(backendUrl, { autoConnect: false });

const TerminalChat = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Load chat history
    const loadHistory = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}/messages`);
        const formatted = data.map(m => ({
          sender: m.senderId?.name || 'Unknown',
          text: m.text,
          timestamp: new Date(m.timestamp).toLocaleTimeString()
        }));
        setMessages(formatted);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    
    if (projectId) {
      loadHistory();
      socket.connect();
      socket.emit('join_project', projectId);

      const handleReceive = (data) => {
        setMessages((prev) => [...prev, {
          sender: data.sender || 'Unknown',
          text: data.text,
          timestamp: data.timestamp || new Date().toLocaleTimeString()
        }]);
      };

      socket.on('receive_message', handleReceive);

      return () => {
        socket.off('receive_message', handleReceive);
        socket.disconnect();
      };
    }
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (input.startsWith('/')) return; // Handled in onKeyDown

    const msgData = {
      projectId,
      sender: user.name,
      senderId: user.id || user._id, // Pass sender ID to save to DB
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    socket.emit('send_message', msgData);
    setInput('');
  };

  const processCommand = (cmd) => {
    const parts = cmd.split(' ');
    const action = parts[0].toLowerCase();
    
    switch(action) {
      case '/help':
        return 'Available commands: /deploy, /status, /clear, /help';
      case '/deploy':
        return 'Initiating deployment sequence... Deployment to Staging successful.';
      case '/status':
        return 'All systems operational. Node health: 98%.';
      case '/clear':
        setMessages([]);
        return 'Buffer cleared.';
      default:
        return `Unknown command: ${action}`;
    }
  };

  const onInputChange = (e) => {
    // Enforce 250 character limit
    if (e.target.value.length <= 250) {
      setInput(e.target.value);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (input.startsWith('/')) {
        const response = processCommand(input);
        setMessages(prev => [...prev, { sender: 'SYSTEM', text: response, timestamp: new Date().toLocaleTimeString() }]);
        setInput('');
        e.preventDefault();
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
      <h1 className="page-title" style={{ margin: '0 0 16px 0' }}>Terminal Chat</h1>
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          position: 'absolute', top: '4px', right: '0', 
          background: 'transparent', border: 'none', 
          color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' 
        }}
        aria-label="Close"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div className="card glass mono" style={{ 
        height: '500px', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '0', 
        border: '1px solid var(--neon-green)',
        boxShadow: '0 0 15px rgba(46, 160, 67, 0.2)'
      }}>
        {/* Terminal Header */}
        <div style={{ 
          backgroundColor: '#161b22', 
          padding: '8px 16px', 
          borderBottom: '1px solid var(--border-color)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Chat Session: PROJECT_{projectId?.slice(-6).toUpperCase()}</span>
          <span>● ● ●</span>
        </div>

        {/* Messages Bin */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px', 
          backgroundColor: '#0d1117',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ color: 'var(--neon-green)', marginBottom: '16px', fontSize: '13px' }}>
            [System] Connection established. Welcome to the chat.
          </div>
          {messages.map((m, i) => (
             <div key={i} style={{ marginBottom: '10px', fontSize: '14px', lineHeight: 1.4, display: 'flex' }}>
              <span style={{ color: m.sender === 'SYSTEM' ? '#f2cc60' : 'var(--neon-green)', marginRight: '8px', flexShrink: 0 }}>
                [{m.timestamp}] {m.sender}:
              </span>
              <span style={{ 
                color: 'var(--text-main)', 
                wordBreak: 'break-word', 
                whiteSpace: 'pre-wrap',
                flexGrow: 1
              }}>{m.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Command Input */}
        <form onSubmit={handleSend} style={{ 
          padding: '16px', 
          borderTop: '1px solid var(--border-color)', 
          display: 'flex',
          backgroundColor: '#161b22',
          position: 'relative'
        }}>
          <span style={{ color: 'var(--neon-green)', marginRight: '8px' }}>$</span>
          <input 
            type="text"
            value={input}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            maxLength={250}
            autoFocus
            placeholder="Type message or /command..."
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              flex: 1,
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px'
            }}
          />
          <div style={{ 
            position: 'absolute', 
            right: '16px', 
            bottom: '16px', 
            fontSize: '11px', 
            color: input.length >= 250 ? 'red' : 'var(--text-muted)' 
          }}>
            {input.length}/250
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerminalChat;
