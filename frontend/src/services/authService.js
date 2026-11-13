import { API_BASE_URL, USE_BACKEND_API, apiClient } from './apiClient.js';

const BACKEND_UNAVAILABLE_MESSAGE =
  'Authentication requires the Spring Boot backend (set VITE_USE_BACKEND_API=true when running the server).';

/**
 * Authentication service prepared for Spring Boot cookie-based auth & Google OAuth2.
 * Never stores tokens in localStorage or sessionStorage and never simulates login.
 */
export const authService = {
  isBackendEnabled() {
    return USE_BACKEND_API;
  },

  getGoogleAuthUrl() {
    return `${API_BASE_URL}/auth/oauth2/google`;
  },

  async getCurrentUser() {
    if (!USE_BACKEND_API) {
      return null;
    }
    return apiClient.get('/auth/me');
  },

  async login({ email, password }) {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new Error('Please enter both email and password.');
    }
    if (!USE_BACKEND_API) {
      throw new Error(BACKEND_UNAVAILABLE_MESSAGE);
    }
    return apiClient.post('/auth/login', {
      email: trimmedEmail,
      password,
    });
  },

  async register({ username, email, password }) {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    if (!trimmedUsername || !trimmedEmail || !password) {
      throw new Error('Please complete username, email, and password.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }
    if (!USE_BACKEND_API) {
      throw new Error(BACKEND_UNAVAILABLE_MESSAGE);
    }
    return apiClient.post('/auth/register', {
      username: trimmedUsername,
      email: trimmedEmail,
      password,
    });
  },

  async logout() {
    if (!USE_BACKEND_API) {
      return null;
    }
    return apiClient.post('/auth/logout');
  },
};

