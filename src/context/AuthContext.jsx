import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { authService } from '../services/authService';
import { setUnauthorizedHandler } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const isBackendEnabled = authService.isBackendEnabled();

  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isBackendEnabled);
  const [authError, setAuthError] = useState(null);
  const [authPrompt, setAuthPrompt] = useState(null);

  const refreshSession = useCallback(async () => {
    if (!isBackendEnabled) {
      setUser(null);
      setIsAuthLoading(false);
      return null;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      if (err?.status !== 401) {
        setAuthError(err?.message || 'Could not verify session.');
      }
      setUser(null);
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  }, [isBackendEnabled]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });
    void refreshSession();
    return () => setUnauthorizedHandler(null);
  }, [refreshSession]);

  const login = async (credentials) => {
    setAuthError(null);
    const authenticatedUser = await authService.login(credentials);
    setUser(authenticatedUser);
    setAuthPrompt(null);
    return authenticatedUser;
  };

  const register = async (payload) => {
    setAuthError(null);
    const createdUser = await authService.register(payload);
    setUser(createdUser);
    setAuthPrompt(null);
    return createdUser;
  };

  const continueWithGoogle = () => {
    if (!isBackendEnabled) {
      const message =
        'Google sign-in requires the Spring Boot OAuth2 backend (VITE_USE_BACKEND_API=true).';
      setAuthError(message);
      return { ok: false, error: message };
    }
    window.location.assign(authService.getGoogleAuthUrl());
    return { ok: true };
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const openAuthPrompt = useCallback((reason) => {
    setAuthPrompt({
      reason:
        reason ||
        'Sign in or create an account to save videos and manage your personal feed.',
    });
  }, []);

  const closeAuthPrompt = useCallback(() => {
    setAuthPrompt(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isGuest: !user,
    isAuthLoading,
    authError,
    setAuthError,
    isBackendEnabled,
    authPrompt,
    openAuthPrompt,
    closeAuthPrompt,
    refreshSession,
    login,
    register,
    continueWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

