import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { startCodeCast } from '../services/api';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const CodeCast = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState('idle'); // idle, broadcasting, viewing
  const [code, setCode] = useState('// Start typing your code here...\n');
  const [language, setLanguage] = useState('javascript');
  const [roomId, setRoomId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const connectSocket = () => {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(`${BACKEND_URL}/codecast`, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('viewer_count', (count) => setViewerCount(count));
    socket.on('code_updated', (newCode) => setCode(newCode));
    socket.on('receive_chat_message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    return socket;
  };

  const handleStartBroadcast = async () => {
    try {
      const { data } = await startCodeCast();
      const socket = connectSocket();
      socket.emit('join_cast', data.roomId);
      setRoomId(data.roomId);
      setMode('broadcasting');
      toast.success('Broadcasting started! Share the room code.');
    } catch {
      toast.error('Failed to start broadcast');
    }
  };

  const handleJoinCast = () => {
    if (!joinCode.trim()) return;
    const socket = connectSocket();
    socket.emit('join_cast', joinCode.trim());
    setRoomId(joinCode.trim());
    setMode('viewing');
    toast.success('Joined broadcast!');
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (mode === 'broadcasting' && socketRef.current) {
      socketRef.current.emit('code_update', { roomId, code: newCode });
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('send_chat_message', {
      roomId,
      user: user?.name || 'Anonymous',
      message: chatInput
    });
    setChatInput('');
  };

  const handleStop = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave_cast', roomId);
      socketRef.current.disconnect();
    }
    setMode('idle');
    setRoomId('');
    setViewerCount(0);
    setChatMessages([]);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>CodeCast</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Share your code live or watch others code in real-time.</p>
        </div>
        {mode !== 'idle' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: mode === 'broadcasting' ? 'var(--accent-red)' : 'var(--accent-green)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{mode === 'broadcasting' ? 'LIVE' : 'WATCHING'}</span>
            </div>
            <span className="badge" style={{ margin: 0 }}>👁 {viewerCount} viewers</span>
            <button onClick={handleStop} className="btn" style={{ background: 'transparent', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '6px 16px', fontSize: '12px' }}>
              Stop
            </button>
          </div>
        )}
      </div>

      {mode === 'idle' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '700px', margin: '40px auto' }}>
          <div className="card neon-hover" style={{ textAlign: 'center', padding: '40px 24px', cursor: 'pointer' }} onClick={handleStartBroadcast}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="1.5" style={{ marginBottom: '16px' }}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Go Live</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Start broadcasting your code to others in real-time.</p>
          </div>
          <div className="card neon-hover" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" style={{ marginBottom: '16px' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Watch a Cast</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Enter a room code to watch someone code live.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Room code" className="form-input" style={{ flex: 1, fontSize: '13px' }} />
              <button onClick={handleJoinCast} className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>Join</button>
            </div>
          </div>
        </div>
      )}

      {mode !== 'idle' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', height: 'calc(100vh - 230px)' }}>
          {/* Code Editor */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="form-input" style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="typescript">TypeScript</option>
                </select>
              </div>
              {roomId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Room:</span>
                  <code style={{ fontSize: '12px', color: 'var(--accent-green)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(roomId); toast.success('Room code copied!'); }}>
                    {roomId}
                  </code>
                </div>
              )}
            </div>
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              readOnly={mode === 'viewing'}
              style={{
                flex: 1, padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '14px', lineHeight: 1.6,
                backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', border: 'none', outline: 'none', resize: 'none',
                tabSize: 2
              }}
              spellCheck={false}
            />
          </div>

          {/* Chat Sidebar */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Live Chat
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '20px' }}>No messages yet</div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{msg.user}:</span>
                  <span style={{ color: 'var(--text-main)', marginLeft: '6px' }}>{msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendChat} style={{ padding: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '6px' }}>
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Send a message..." className="form-input" style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }} />
              <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeCast;
