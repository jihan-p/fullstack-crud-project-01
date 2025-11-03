// src/context/AuthContext.tsx
// REKOMENDASI: Pindahkan file ini ke `src/context/AuthContext.tsx` untuk struktur proyek yang lebih baik.

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

// 1. Definisikan tipe untuk state autentikasi
interface AuthState {
    token: string | null;
    name: string | null;
    isAuthenticated: boolean;
    login: (token: string, name: string) => void;
    logout: () => void;
}

// 2. Buat Context dengan nilai default
const AuthContext = createContext<AuthState | undefined>(undefined);

// 3. Buat Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [name, setName] = useState<string | null>(localStorage.getItem('userName'));

    const login = useCallback((newToken: string, newName: string) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('userName', newName);
        setToken(newToken);
        setName(newName);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        // Hapus juga data lain yang mungkin tersimpan
        localStorage.removeItem('userID');
        setToken(null);
        setName(null);
    }, []);

    const isAuthenticated = !!token;

    // Efek untuk menyinkronkan state antar tab browser
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'authToken') {
                setToken(event.newValue);
            }
            if (event.key === 'userName') {
                setName(event.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup listener saat komponen unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ token, name, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Buat Custom Hook untuk menggunakan context
export const useAuth = (): AuthState => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};