import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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

// Tests & Reviews
export const submitTest = (testId, userAnswers) => api.post('/tests/submit', { testId, userAnswers });
export const submitReview = (reviewData) => api.post('/reviews/add', reviewData);

// Leaderboard
export const fetchLeaderboard = () => api.get('/leaderboard');

export default api;
