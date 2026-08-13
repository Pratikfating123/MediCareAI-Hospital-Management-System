import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  demoLogin: (role: UserRole) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isDoctor: boolean;
  isPatient: boolean;
  isReceptionist: boolean;
  isPharmacist: boolean;
  isLabStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string }> = {
  ADMIN: { email: 'admin@medicare.com', pass: 'Password123!' },
  DOCTOR: { email: 'doctor@medicare.com', pass: 'Password123!' },
  RECEPTIONIST: { email: 'receptionist@medicare.com', pass: 'Password123!' },
  PATIENT: { email: 'patient@medicare.com', pass: 'Password123!' },
  PHARMACIST: { email: 'pharmacist@medicare.com', pass: 'Password123!' },
  LAB_STAFF: { email: 'lab@medicare.com', pass: 'Password123!' },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('medicare_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('medicare_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      localStorage.removeItem('medicare_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const data = await api.login({ email, password: pass });
    localStorage.setItem('medicare_token', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const demoLogin = async (role: UserRole): Promise<User> => {
    const creds = DEMO_CREDENTIALS[role];
    return login(creds.email, creds.pass);
  };

  const register = async (userData: any): Promise<User> => {
    const data = await api.register(userData);
    localStorage.setItem('medicare_token', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('medicare_token');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    demoLogin,
    register,
    logout,
    refreshUser,
    isAdmin: user?.role === 'ADMIN',
    isDoctor: user?.role === 'DOCTOR',
    isPatient: user?.role === 'PATIENT',
    isReceptionist: user?.role === 'RECEPTIONIST',
    isPharmacist: user?.role === 'PHARMACIST',
    isLabStaff: user?.role === 'LAB_STAFF',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
