// src/components/auth/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Backend_URL } from '../constants';

interface AuthContextType {
  user: any;
  backendTokens: any;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [backendTokens, setBackendTokens] = useState<any>(null);
  const navigate = useNavigate(); // Assurez-vous que useNavigate est utilisé à l'intérieur de BrowserRouter

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${Backend_URL}/auth/login`, { email, password });
      setUser(res.data.user);
      setBackendTokens(res.data.backendTokens);
      sessionStorage.setItem('backendTokens', JSON.stringify(res.data.backendTokens));
      navigate('/upload');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await axios.post(`${Backend_URL}/auth/register`, { name, email, password });
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setBackendTokens(null);
    sessionStorage.removeItem('backendTokens');
    navigate('/login'); // Utilisation de navigate à l'intérieur de votre AuthProvider
  }, [navigate]);

  const refreshToken = useCallback(async () => {
    try {
      const tokens = JSON.parse(sessionStorage.getItem('backendTokens')!);
      const res = await axios.post(`${Backend_URL}/auth/refresh`, null, {
        headers: {
          authorization: `Refresh ${tokens.refreshToken}`,
        },
      });
      setBackendTokens(res.data);
      sessionStorage.setItem('backendTokens', JSON.stringify(res.data));
    } catch (error) {
      console.error('Refresh token error:', error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const tokens = sessionStorage.getItem('backendTokens');
    if (tokens) {
      setBackendTokens(JSON.parse(tokens));
    }
  }, []);

  useEffect(() => {
    if (backendTokens && new Date().getTime() >= backendTokens.expiresIn) {
      refreshToken();
    }
  }, [backendTokens, refreshToken]);

  return (
    <AuthContext.Provider value={{ user, backendTokens, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
