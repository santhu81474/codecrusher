import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createChallengeRoom, joinChallengeRoom } from '../services/api';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const ChallengeRooms = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState('lobby'); // lobby, waiting, active, completed
  const [roomCode, setRoomCode] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('');
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [timer, setTimer] = useState(0);
  const [results, setResults] = useState(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const connectSocket = () => {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(`${BACKEND_URL}/challenge-rooms`, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('player_joined', () => {
      toast.success('Opponent joined!');
    });

    socket.on('challenge_started', () => {
      setMode('active');
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
      toast.success('Challenge started!');
    });

    socket.on('opponent_progress', (data) => {
      setOpponentProgress(data.progress);
    });

    socket.on('opponent_finished', (data) => {
      setResults(data.results);
      setMode('completed');
      if (timerRef.current) clearInterval(timerRef.current);
    });

    return socket;
  };

  const handleCreateRoom = async () => {
    try {
      const { data } = await createChallengeRoom();
      const socket = connectSocket();
      socket.emit('join_room', data.roomCode);
      setRoom(data);
      setRoomCode(data.roomCode);
      setMode('waiting');
      toast.success(`Room created! Code: ${data.roomCode}`);
    } catch (err) {
      toast.error('Failed to create room');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinInput.trim()) return;
    try {
      const { data } = await joinChallengeRoom(joinInput.trim());
      const socket = connectSocket();
      socket.emit('join_room', joinInput.trim());
      setRoom(data);
      setRoomCode(joinInput.trim());
      setMode('waiting');
      toast.success('Joined room!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join room');
    }
  };

  const handleStartChallenge = () => {
    if (socketRef.current) {
      socketRef.current.emit('start_challenge', roomCode);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
      <h1 className="page-title" style={{ marginBottom: '4px' }}>Challenge Rooms</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
        Compete head-to-head in real-time coding battles.
      </p>

      {mode === 'lobby' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '700px', margin: '20px auto' }}>
          <div className="card neon-hover" style={{ textAlign: 'center', padding: '40px 24px', cursor: 'pointer' }} onClick={handleCreateRoom}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="1.5" style={{ marginBottom: '16px' }}><path d="M12 5v14M5 12h14"></path></svg>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Create Room</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Host a coding battle and share the code with your opponent.</p>
          </div>
          <div className="card neon-hover" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" style={{ marginBottom: '16px' }}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3"></path></svg>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Join Room</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Enter a room code to join a battle.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" value={joinInput} onChange={(e) => setJoinInput(e.target.value.toUpperCase())} placeholder="ROOM CODE" className="form-input" style={{ flex: 1, fontSize: '14px', textAlign: 'center', letterSpacing: '2px', fontWeight: 600 }} maxLength={6} />
              <button onClick={handleJoinRoom} className="btn btn-primary" style={{ fontSize: '13px' }}>Join</button>
            </div>
          </div>
        </div>
      )}

      {mode === 'waiting' && (
        <div className="card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '48px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Waiting for opponent...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Share this room code with your opponent:</p>
          <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '10px', display: 'inline-block', marginBottom: '24px', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(roomCode); toast.success('Copied!'); }}>
            <code style={{ fontSize: '28px', letterSpacing: '4px', fontWeight: 700, color: 'var(--accent-green)' }}>{roomCode}</code>
          </div>
          <br />
          <button onClick={handleStartChallenge} className="btn btn-primary" style={{ fontSize: '14px', padding: '10px 24px' }}>
            Start Challenge
          </button>
        </div>
      )}

      {mode === 'active' && (
        <div>
          {/* Timer bar */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginBottom: '20px', padding: '12px', borderRadius: '10px', background: 'var(--surface-3, rgba(30,30,46,1))' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time</span>
            <span style={{ fontSize: '24px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>{formatTime(timer)}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Opponent: {opponentProgress}%</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', height: 'calc(100vh - 280px)' }}>
            {/* Your Editor */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Your Solution
              </div>
              <textarea
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (socketRef.current) {
                    const progress = Math.min(Math.floor(e.target.value.length / 5), 100);
                    socketRef.current.emit('player_progress', { roomId: roomCode, progress });
                  }
                }}
                style={{ flex: 1, padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '14px', lineHeight: 1.6, backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', border: 'none', outline: 'none', resize: 'none' }}
                spellCheck={false}
                placeholder="Write your solution here..."
              />
            </div>

            {/* Problem + Status */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)' }}>Challenge Problem</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
                Solve the given problem as fast as you can. The first to submit a correct solution wins!
              </p>
              <div style={{ marginTop: 'auto' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Opponent Progress</h4>
                <div style={{ height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${opponentProgress}%`, background: 'linear-gradient(90deg, var(--accent-amber), var(--accent-red))', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>{opponentProgress}%</span>
              </div>
              <button
                onClick={() => {
                  if (socketRef.current) {
                    socketRef.current.emit('player_finished', { roomId: roomCode, results: { time: timer, code } });
                    setMode('completed');
                    if (timerRef.current) clearInterval(timerRef.current);
                  }
                }}
                className="btn btn-primary"
                style={{ marginTop: '20px', width: '100%' }}
              >
                Submit Solution
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'completed' && (
        <div className="card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '48px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="1.5" style={{ marginBottom: '16px' }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Challenge Complete!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Your time: <strong style={{ color: 'var(--accent-green)' }}>{formatTime(timer)}</strong>
          </p>
          <button onClick={() => { setMode('lobby'); setCode(''); setTimer(0); setResults(null); }} className="btn btn-primary">
            Back to Lobby
          </button>
        </div>
      )}
    </div>
  );
};

export default ChallengeRooms;
