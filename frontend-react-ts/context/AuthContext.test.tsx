// context/AuthContext.test.tsx
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock localStorage
const localStorageMock = (function() {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useAuth Hook', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should initialize with null user and token', () => {
        const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.name).toBeNull();
        expect(result.current.token).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should load token from localStorage on initialization', () => {
        const mockToken = 'mock-jwt-token-123';
        const mockName = 'Stored User';
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('userName', mockName);

        const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.token).toBe(mockToken);
        expect(result.current.name).toBe(mockName);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set token and name on login and save to localStorage', () => {
        const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
        const { result } = renderHook(() => useAuth(), { wrapper });

        const newToken = 'new-token';
        const newName = 'Test User';
        
        act(() => {
            result.current.login(newToken, newName);
        });

        expect(result.current.token).toBe(newToken);
        expect(result.current.name).toBe(newName);
        expect(localStorage.getItem('authToken')).toBe(newToken);
        expect(localStorage.getItem('userName')).toBe(newName);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear token and name on logout and remove from localStorage', () => {
        const mockToken = 'initial-token';
        const mockName = 'Initial User';
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('userName', mockName);

        const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        // Cek state awal
        expect(result.current.isAuthenticated).toBe(true);
        
        act(() => {
            result.current.logout();
        });

        expect(result.current.token).toBeNull();
        expect(result.current.name).toBeNull();
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(localStorage.getItem('userName')).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });
});