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
export const getUserByUsername = (username) => api.get(`/users/profile/${username}`);
export const updateProfile = (profileData) => api.put('/users/profile', profileData);

// User Search & Network
export const searchUsers = (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`);
export const connectUser = (userId) => api.post(`/users/connect/${userId}`);
export const disconnectUser = (userId) => api.delete(`/users/disconnect/${userId}`);
export const getNetwork = () => api.get('/users/network');

// Projects
export const fetchProjects = () => api.get('/projects');
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (projectData) => api.post('/projects', projectData);
export const applyToProject = (projectId, userSkills) => api.post(`/projects/${projectId}/apply`, { userSkills });
export const fetchUserApplications = () => api.get('/projects/my-applications');
export const deleteProject = (projectId) => api.delete(`/projects/${projectId}`);

// Project Tasks (Sprint Board)
export const addProjectTask = (projectId, task) => api.post(`/projects/${projectId}/tasks`, task);
export const updateProjectTask = (projectId, taskId, updates) => api.put(`/projects/${projectId}/tasks/${taskId}`, updates);
export const deleteProjectTask = (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`);

// Challenges & Arena
export const fetchDailyChallenge = () => api.get('/challenges/daily');
export const fetchAdaptiveChallenge = () => api.get('/challenges/adaptive');
export const testSubmitSolution = (challengeId, code, language) => api.post('/challenges/submit', { challengeId, code, language });

// Tests & Reviews
export const submitTest = (testId, userAnswers) => api.post('/tests/submit', { testId, userAnswers });
export const submitReview = (reviewData) => api.post('/reviews/add', reviewData);

// Snippets
export const getSnippets = () => api.get('/snippets');
export const getUserSnippets = (userId) => api.get(`/snippets/user/${userId}`);
export const createSnippet = (snippet) => api.post('/snippets', snippet);
export const starSnippet = (id) => api.post(`/snippets/${id}/star`);
export const updateSnippet = (id, snippet) => api.put(`/snippets/${id}`, snippet);
export const deleteSnippet = (id) => api.delete(`/snippets/${id}`);

// Leaderboard
export const fetchLeaderboard = () => api.get('/leaderboard');

// AI
export const runAiMatchmaker = (requirements) => api.post('/ai/matchmaker', { requirements });
export const explainCode = (code, language, level) => api.post('/ai/explain', { code, language, level });
export const generateSprintPlan = (description) => api.post('/ai/sprint-plan', { description });

// Gemini
export const analyzeLiveComplexity = (code) => api.post('/gemini/analyze-complexity', { code });

// RAG
export const queryCodebaseRAG = (question) => api.post('/rag/query', { question });

// Terminal
export const getTerminalHistory = () => api.get('/terminal/history');
export const sendTerminalMessage = (content) => api.post('/terminal/message', { content });

// CodeCast
export const startCodeCast = () => api.post('/codecast/start');
export const stopCodeCast = () => api.post('/codecast/stop');

// Challenge Rooms
export const createChallengeRoom = (problemId) => api.post('/challenge-room/create', { problemId });
export const joinChallengeRoom = (code) => api.post(`/challenge-room/join/${code}`);
export const getChallengeRoom = (id) => api.get(`/challenge-room/${id}`);

export default api;
