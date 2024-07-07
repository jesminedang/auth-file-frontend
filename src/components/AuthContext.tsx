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
  const navigate = useNavigate(); // Assurez que useNavigate est utilisé à l'intérieur de BrowserRouter

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axios.post(`${Backend_URL}/auth/login`, { email, password });
      if (response.status === 200) {
        setUser(response.data.user);
        setBackendTokens(response.data.backendTokens);
        sessionStorage.setItem('backendTokens', JSON.stringify(response.data.backendTokens));
        navigate('/upload');
      } else {
        console.error('Login failed with status:', response.status);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.response?.data);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  }, [navigate]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${Backend_URL}/auth/register`, { name, email, password });
      if (response.status === 201) {
        console.log("User Registered!");
        navigate('/login');
      } else {
        console.error('Registration failed with status:', response.status);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Registration error:', error.response?.data);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    setBackendTokens(null);
    sessionStorage.removeItem('backendTokens');
    navigate('/login'); // Utilisation de navigate à l'intérieur de AuthProvider
  }, [navigate]);

  const refreshToken = useCallback(async () => {
    try {
      const tokens = JSON.parse(sessionStorage.getItem('backendTokens')!);
      const response = await axios.post(`${Backend_URL}/auth/refresh`, null, {
        headers: {
          authorization: `Refresh ${tokens.refreshToken}`,
        },
      });
      if (response.status === 200) {
        setBackendTokens(response.data);
        sessionStorage.setItem('backendTokens', JSON.stringify(response.data));
      } else {
        console.error('Refresh token failed with status:', response.status);
        logout();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Refresh token error:', error.response?.data);
      } else {
        console.error('An unexpected error occurred:', error);
      }
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
