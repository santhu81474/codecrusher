import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import SkillTest from './pages/SkillTest';
import Applications from './pages/Applications';
import Reviews from './pages/Reviews';
import Leaderboard from './pages/Leaderboard';
import ExploreProjects from './pages/ExploreProjects';
import Arena from './pages/Arena';
import TerminalChat from './pages/TerminalChat';
import Forge from './pages/Forge';
import GeminiChat from './pages/GeminiChat';
import Bounties from './pages/Bounties';
import Network from './pages/Network';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/explore" element={<ProtectedRoute><ExploreProjects /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/projects/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
              <Route path="/skill-test" element={<ProtectedRoute><SkillTest /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
              <Route path="/projects/:id/review" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/arena" element={<ProtectedRoute><Arena /></ProtectedRoute>} />
              <Route path="/projects/:id/chat" element={<ProtectedRoute><TerminalChat /></ProtectedRoute>} />
              <Route path="/forge" element={<ProtectedRoute><Forge /></ProtectedRoute>} />
              <Route path="/gemini-chat" element={<ProtectedRoute><GeminiChat /></ProtectedRoute>} />
              <Route path="/bounties" element={<ProtectedRoute><Bounties /></ProtectedRoute>} />
              <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
