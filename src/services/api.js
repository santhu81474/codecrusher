import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically securely inject JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove token and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (profileData) => api.put('/users/profile', profileData);

// Projects
export const fetchProjects = () => api.get('/projects');
export const createProject = (projectData) => api.post('/projects', projectData);
export const applyToProject = (projectId, userSkills) => api.post(`/projects/${projectId}/apply`, { userSkills });
export const fetchUserApplications = () => api.get('/projects/my-applications');
export const deleteProject = (projectId) => api.delete(`/projects/${projectId}`);

// Challenges & Arena
export const fetchDailyChallenge = () => api.get('/challenges/daily');
export const fetchAdaptiveChallenge = () => api.get('/challenges/adaptive');
export const testSubmitSolution = (challengeId, code, language) => api.post('/challenges/submit', { challengeId, code, language });

// Tests & Reviews
export const submitTest = (testId, userAnswers) => api.post('/tests/submit', { testId, userAnswers });
export const submitReview = (reviewData) => api.post('/reviews/add', reviewData);

// Snippets
export const getSnippets = () => api.get('/snippets');
export const createSnippet = (snippet) => api.post('/snippets', snippet);
export const starSnippet = (id) => api.post(`/snippets/${id}/star`);
export const updateSnippet = (id, snippet) => api.put(`/snippets/${id}`, snippet);
export const deleteSnippet = (id) => api.delete(`/snippets/${id}`);

// Leaderboard
export const fetchLeaderboard = () => api.get('/leaderboard');

// AI Matchmaker
export const runAiMatchmaker = (requirements) => api.post('/ai/matchmaker', { requirements });

// Gemini Ext
export const analyzeLiveComplexity = (code) => api.post('/gemini/analyze-complexity', { code });

// RAG (Codebase-grounded Q&A)
export const queryCodebaseRAG = (question) => api.post('/rag/query', { question });

export default api;
