import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('synapse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('synapse_access_token') || null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize state changes to localStorage
  const setSession = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    if (userData) {
      localStorage.setItem('synapse_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('synapse_user');
    }
    if (token) {
      localStorage.setItem('synapse_access_token', token);
    } else {
      localStorage.removeItem('synapse_access_token');
    }
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      setSession(null, null);
    }
  }, []);

  // Fetch current user details on mount if token exists
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('synapse_access_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res?.data) {
          setUser(res.data);
          localStorage.setItem('synapse_user', JSON.stringify(res.data));
        }
      } catch (err) {
        // Interceptor handles refresh or fires synapse_auth_logout
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();

    // Listen for logout events dispatched by Axios interceptor
    const handleForcedLogout = () => {
      setSession(null, null);
    };
    window.addEventListener('synapse_auth_logout', handleForcedLogout);

    return () => {
      window.removeEventListener('synapse_auth_logout', handleForcedLogout);
    };
  }, []);

  const login = async ({ email, password }) => {
    const res = await authApi.login({ email, password });
    const { user: loggedInUser, accessToken: token } = res.data;
    setSession(loggedInUser, token);
    return loggedInUser;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    const { user: registeredUser, accessToken: token } = res.data;
    setSession(registeredUser, token);
    return registeredUser;
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('synapse_user', JSON.stringify(merged));
      return merged;
    });
  };

  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
