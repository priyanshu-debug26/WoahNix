export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api';
export const USE_BACKEND_API = import.meta.env?.VITE_USE_BACKEND_API === 'true';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

/**
 * Lightweight HTTP client for Spring Boot REST endpoints.
 * Uses `credentials: 'include'` so session/auth cookies remain HTTP-only
 * and are never stored in localStorage or sessionStorage.
 */
export const apiClient = {
  async request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }

    if (!response.ok) {
      let errorMessage = `Request failed (${response.status})`;
      let errorBody = null;
      try {
        errorBody = await response.json();
        if (errorBody?.message) errorMessage = errorBody.message;
      } catch {
        // Response had no JSON body
      }
      throw new ApiError(errorMessage, response.status, errorBody);
    }

    if (response.status === 204) return null;
    return response.json();
  },

  get(path) {
    return this.request(path, { method: 'GET' });
  },

  post(path, body) {
    return this.request(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put(path, body) {
    return this.request(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete(path) {
    return this.request(path, { method: 'DELETE' });
  },
};
