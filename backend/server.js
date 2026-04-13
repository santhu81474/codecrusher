require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { errorHandler } = require('./middleware/errorHandler');

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

const io = socketIo(server, {
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

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/snippets', require('./routes/snippetRoutes'));
app.use('/api/gemini', require('./routes/geminiRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/rag', require('./routes/ragRoutes'));

// ...existing code...

// Global Error Handler
app.use(errorHandler);

const Message = require('./models/Message');

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
