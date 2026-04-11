import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io((import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')) || 'http://localhost:5000');

const TerminalChat = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.emit('join_project', projectId);

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msgData = {
      projectId,
      sender: user.name,
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
    setInput(e.target.value);
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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">Terminal Chat</h1>
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
          backgroundColor: '#0d1117' 
        }}>
          <div style={{ color: 'var(--neon-green)', marginBottom: '16px', fontSize: '13px' }}>
            [System] Connection established. Welcome to the chat.
          </div>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: '10px', fontSize: '14px', lineHeight: 1.4 }}>
              <span style={{ color: m.sender === 'SYSTEM' ? '#f2cc60' : 'var(--neon-green)', marginRight: '8px' }}>
                [{m.timestamp}] {m.sender}:
              </span>
              <span style={{ color: 'var(--text-main)' }}>{m.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Command Input */}
        <form onSubmit={handleSend} style={{ 
          padding: '16px', 
          borderTop: '1px solid var(--border-color)', 
          display: 'flex',
          backgroundColor: '#161b22'
        }}>
          <span style={{ color: 'var(--neon-green)', marginRight: '8px' }}>$</span>
          <input 
            type="text"
            value={input}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
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
        </form>
      </div>
    </div>
  );
};

export default TerminalChat;
