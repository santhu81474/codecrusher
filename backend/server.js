import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import testRoutes from './routes/testRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import snippetRoutes from './routes/snippetRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import ragRoutes from './routes/ragRoutes.js';
import terminalRoutes from './routes/terminalRoutes.js';
import codecastRoutes from './routes/codecastRoutes.js';
import challengeRoomRoutes from './routes/challengeRoomRoutes.js';

import Message from './models/Message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:3001', 
  'http://127.0.0.1:3001', 
  'http://localhost:5173', 
  'http://127.0.0.1:5173'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Global Middleware
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Route Mappings
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/codecast', codecastRoutes);
app.use('/api/challenge-room', challengeRoomRoutes);


// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Global Error Handler
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('New user connected to Terminal Forge');

  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    console.log(`User joined project node: ${projectId}`);
  });

  socket.on('send_message', async (data) => {
    // data: { projectId, sender, text, senderId }
    try {
      if (data.projectId && data.senderId) {
        const newMessage = await Message.create({
          projectId: data.projectId,
          senderId: data.senderId,
          text: data.text
        });
        const savedMessage = await Message.findById(newMessage._id).populate('senderId', 'name');
        
        io.to(data.projectId).emit('receive_message', {
          _id: savedMessage._id,
          projectId: savedMessage.projectId,
          sender: savedMessage.senderId.name,
          text: savedMessage.text,
          timestamp: savedMessage.timestamp
        });
      } else {
        // Fallback for demo mode matching frontend without ID
        io.to(data.projectId).emit('receive_message', data);
      }
    } catch (err) {
      console.error('Error saving message:', err.message);
      // Still emit to keep real-time flow even if DB fails
      io.to(data.projectId).emit('receive_message', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from node');
  });
});

const challengeRooms = io.of('/challenge-rooms');
challengeRooms.on('connection', (socket) => {
    console.log('a user connected to challenge rooms');

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('player_joined', { userId: socket.id });
    });

    socket.on('start_challenge', (roomId) => {
        challengeRooms.to(roomId).emit('challenge_started');
    });

    socket.on('player_progress', (data) => {
        socket.to(data.roomId).emit('opponent_progress', { progress: data.progress });
    });

    socket.on('player_finished', (data) => {
        challengeRooms.to(data.roomId).emit('opponent_finished', { results: data.results });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected from challenge rooms');
    });
});

const codecastIo = io.of('/codecast');
codecastIo.on('connection', (socket) => {
    console.log('A user connected to CodeCast');

    socket.on('join_cast', (roomId) => {
        socket.join(roomId);
        const room = codecastIo.adapter.rooms.get(roomId);
        const count = room ? room.size : 0;
        codecastIo.to(roomId).emit('viewer_count', count);
        console.log(`A user joined cast ${roomId}. Viewers: ${count}`);
    });

    socket.on('code_update', (data) => {
        socket.to(data.roomId).emit('code_updated', data.code);
    });

    socket.on('send_chat_message', (data) => {
        codecastIo.to(data.roomId).emit('receive_chat_message', {
            user: data.user,
            message: data.message,
        });
    });

    socket.on('leave_cast', (roomId) => {
        socket.leave(roomId);
        const room = codecastIo.adapter.rooms.get(roomId);
        const count = room ? room.size : 0;
        codecastIo.to(roomId).emit('viewer_count', count);
        console.log(`A user left cast ${roomId}. Viewers: ${count}`);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected from CodeCast');
    });
});


console.log('ENV CHECK:', process.env.MONGO_URI ? 'Loaded' : 'Missing');
console.log('Using MONGO_URI value:', process.env.MONGO_URI);

// Start the Protocol
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`TeamForge Backend Protocol Active on Port ${PORT} ⚡`);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connection established successfully.');
  })
  .catch(err => {
    console.error('CRITICAL: MongoDB connection failed:', err.message);
    console.log('Platform status: DEGRADED (Check internet/MONGO_URI)');
  });
