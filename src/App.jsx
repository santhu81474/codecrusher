import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

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
const CodeCast = React.lazy(() => import('./pages/CodeCast'));
const ChallengeRooms = React.lazy(() => import('./pages/ChallengeRooms'));
const AIExplainer = React.lazy(() => import('./pages/AIExplainer'));
const SprintBoard = React.lazy(() => import('./pages/SprintBoard'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', animation: 'pulse 1.5s ease-in-out infinite' }}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '1px' }}>Initializing...</span>
    </div>
  </div>
);

// Page transition wrapper
const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} style={{ animation: 'pageIn 0.25s ease-out forwards' }}>
      {children}
    </div>
  );
};

function AppContent() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            margin: '10px',
            background: 'var(--surface-2, #16161f)',
            color: 'var(--text-primary, #f1f1f3)',
            border: '1px solid var(--border, rgba(255,255,255,0.08))',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
          },
          success: {
            duration: 4000,
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            duration: 5000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Navbar />
      <main style={{ paddingTop: '64px' }}>
        <Suspense fallback={<LoadingFallback />}>
          <PageTransition>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/explore" element={<ProtectedRoute><ExploreProjects /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
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
              
              {/* New Feature Routes */}
              <Route path="/codecast" element={<ProtectedRoute><CodeCast /></ProtectedRoute>} />
              <Route path="/challenge-rooms" element={<ProtectedRoute><ChallengeRooms /></ProtectedRoute>} />
              <Route path="/ai-explain" element={<ProtectedRoute><AIExplainer /></ProtectedRoute>} />
              <Route path="/projects/:id/sprint" element={<ProtectedRoute><SprintBoard /></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </PageTransition>
        </Suspense>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
