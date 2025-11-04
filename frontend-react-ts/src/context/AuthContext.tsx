// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

// 1. Define the specific literal type for roles
export type UserRole = 'admin' | 'user';

// 2. Define the shape of the user object to be stored in the context
export interface UserState {
    id: number;
    name: string;
    role: UserRole;
}

// 3. Define the shape of the entire authentication state
interface AuthState {
    token: string | null;
    user: UserState | null; // <-- PASTIKAN USER STATE ADA
    isAuthenticated: boolean;
    login: (token: string, user: UserState) => void; // Perbarui tanda tangan fungsi login
    logout: () => void;
}

// 4. Create the Context with a default undefined value
const AuthContext = createContext<AuthState | undefined>(undefined);

// 5. Create the Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [user, setUser] = useState<UserState | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = useCallback((newToken: string, newUser: UserState) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    const isAuthenticated = !!token;

    // Efek untuk menyinkronkan state antar tab browser
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'authToken') {
                setToken(event.newValue);
            }
            if (event.key === 'user') {
                setUser(event.newValue ? JSON.parse(event.newValue) : null);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup listener saat komponen unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 6. Create a Custom Hook for easy context consumption
export const useAuth = (): AuthState => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};