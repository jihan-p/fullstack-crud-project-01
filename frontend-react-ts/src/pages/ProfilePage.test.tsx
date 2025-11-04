// src/pages/ProfilePage.test.tsx (Membutuhkan MSW Setup)

import { render, screen, waitFor, fireEvent, renderHook, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider, useAuth, UserState } from '../context/AuthContext';
import ProfilePage from './ProfilePage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const renderWithProviders = (component: React.ReactElement) => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Router><AuthProvider>{children}</AuthProvider></Router>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
        const mockRegularUser: UserState = {
            id: 1,
            name: 'Test User',
            role: 'user',
        };
        result.current.login('mock-test-token', mockRegularUser);
    });
    return render(component, { wrapper });
};

describe('ProfilePage Integration Tests', () => {
    afterEach(() => {
        server.resetHandlers();
        mockNavigate.mockClear();
    });

    it('should load user data into form fields', async () => {
        // Mock GET /users/me
        server.use(
            http.get('http://localhost:8080/api/v1/users/me', () => {
                return HttpResponse.json({ data: { ID: 1, Name: 'E2E User', Email: 'e2e@test.com' } });
            })
        );
        
        renderWithProviders(<ProfilePage />);

        // Tunggu hingga form terisi
        await waitFor(() => {
            expect(screen.getByLabelText(/Name/i)).toHaveValue('E2E User');
            expect(screen.getByLabelText(/Email/i)).toHaveValue('e2e@test.com');
        });
    });

    it('should update user and show success message', async () => {
        // Mock GET (load data) dan PUT (update)
        server.use(
            http.get('http://localhost:8080/api/v1/users/me', () => {
                return HttpResponse.json({ data: { ID: 1, Name: 'Old Name', Email: 'old@test.com' } });
            }),
            http.put('http://localhost:8080/api/v1/users/me', () => {
                return HttpResponse.json({ data: { ID: 1, Name: 'New Name', Email: 'new@test.com' } });
            })
        );

        renderWithProviders(<ProfilePage />);

        const nameInput = await screen.findByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const saveButton = screen.getByRole('button', { name: /Save Changes/i });

        fireEvent.change(nameInput, { target: { value: 'New Name' } });
        fireEvent.change(emailInput, { target: { value: 'new@test.com' } });
        fireEvent.click(saveButton);

        expect(await screen.findByText('Profile updated successfully!')).toBeInTheDocument();
    });

    it('should call logout and navigate on successful account deletion', async () => {
        window.confirm = jest.fn(() => true);

        server.use(
            http.get('http://localhost:8080/api/v1/users/me', () => {
                return HttpResponse.json({ data: { ID: 1, Name: 'User To Delete', Email: 'delete@me.com' } });
            }),
            http.delete('http://localhost:8080/api/v1/users/me', () => {
                return new HttpResponse(null, { status: 204 });
            })
        );

        renderWithProviders(<ProfilePage />);

        const deleteButton = await screen.findByRole('button', { name: /Delete Account/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });
});