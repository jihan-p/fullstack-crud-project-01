// context/AuthContext.test.tsx

import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth, UserState } from './AuthContext';

describe('AuthContext', () => {
    // Helper to wrap the hook in the provider
    const renderAuthHook = () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
        return renderHook(() => useAuth(), { wrapper });
    };

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    it('should have a default state of not authenticated', () => {
        const { result } = renderAuthHook();

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.token).toBeNull();
        expect(result.current.user).toBeNull();
    });

    it('should allow a user to log in', () => {
        const { result } = renderAuthHook();
        const mockToken = 'my-secret-token';
        const mockUser: UserState = { id: 1, name: 'Test User', role: 'user' };

        act(() => {
            result.current.login(mockToken, mockUser);
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.token).toBe(mockToken);
        expect(result.current.user?.name).toBe(mockUser.name);
        expect(result.current.user?.role).toBe(mockUser.role);
    });

    it('should store token and user in localStorage on login', () => {
        const { result } = renderAuthHook();
        const mockToken = 'my-secret-token';
        const mockUser: UserState = { id: 1, name: 'Test User', role: 'user' };

        act(() => {
            result.current.login(mockToken, mockUser);
        });

        expect(localStorage.getItem('authToken')).toBe(mockToken);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('should allow a user to log out', () => {
        const { result } = renderAuthHook();
        const mockToken = 'my-secret-token';
        const mockUser: UserState = { id: 1, name: 'Test User', role: 'user' };

        // First, log in
        act(() => {
            result.current.login(mockToken, mockUser);
        });

        expect(result.current.isAuthenticated).toBe(true);

        // Then, log out
        act(() => {
            result.current.logout();
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.token).toBeNull();
        expect(result.current.user).toBeNull();
    });

    it('should remove token and user from localStorage on logout', () => {
        const { result } = renderAuthHook();
        const mockToken = 'my-secret-token';
        const mockUser: UserState = { id: 1, name: 'Test User', role: 'user' };

        act(() => {
            result.current.login(mockToken, mockUser);
        });

        act(() => {
            result.current.logout();
        });

        expect(localStorage.getItem('authToken')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });
});