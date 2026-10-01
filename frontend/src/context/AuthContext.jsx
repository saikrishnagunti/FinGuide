import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('finguide_token');
    if (token) {
      api.setToken(token);
      api.getProfile()
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          // Invalid token, clear it
          api.setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    api.setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email, name, password) => {
    const data = await api.register(email, name, password);
    api.setToken(data.token);
    setUser(data.user);
    return data;
  };

  const setSession = (userData, token) => {
    api.setToken(token);
    setUser(userData);
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
