import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy Pages
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const CreateProject = React.lazy(() => import('./pages/CreateProject'));
const SkillTest = React.lazy(() => import('./pages/SkillTest'));
const Applications = React.lazy(() => import('./pages/Applications'));
const Reviews = React.lazy(() => import('./pages/Reviews'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const ExploreProjects = React.lazy(() => import('./pages/ExploreProjects'));
const Arena = React.lazy(() => import('./pages/Arena'));
const TerminalChat = React.lazy(() => import('./pages/TerminalChat'));
const Forge = React.lazy(() => import('./pages/Forge'));
const GeminiChat = React.lazy(() => import('./pages/GeminiChat'));
const Bounties = React.lazy(() => import('./pages/Bounties'));
const Network = React.lazy(() => import('./pages/Network'));
const Matchmaker = React.lazy(() => import('./pages/Matchmaker'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--neon-green)', fontFamily: 'monospace' }}>
    Loading System Assets...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<LoadingFallback />}>
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
              <Route path="/matchmaker" element={<ProtectedRoute><Matchmaker /></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
