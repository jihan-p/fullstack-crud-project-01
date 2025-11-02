// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Coba ambil token dari localStorage saat inisialisasi
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken); // Simpan token ke localStorage
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('authToken'); // Hapus token dari localStorage
    // Hapus juga data pengguna lainnya saat logout
    localStorage.removeItem('userName');
    localStorage.removeItem('userID');
  };

  // Setiap kali token berubah, status isAuthenticated akan diperbarui
  const isAuthenticated = !!token;

  const value = {
    token,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};