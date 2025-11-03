// pages/LoginPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import LoginPage from './LoginPage'; 

// Import MSW setup (pastikan ini diatur untuk pengujian)
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
    useNavigate: () => mockNavigate,
}));

// Konfigurasi Router dan Context untuk pengujian komponen Page
const renderWithProviders = () => {
    return render(
        <Router>
            <AuthProvider>
                <LoginPage />
            </AuthProvider>
        </Router>
    );
};

describe('LoginPage Integration Tests', () => {
    // MSW server lifecycle (listen, reset, close) sudah diatur secara global di `src/setupTests.ts`.
    // Kita hanya perlu membersihkan mock navigasi di sini.
    afterEach(() => mockNavigate.mockClear());

    it('should render login form elements', () => {
        renderWithProviders();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    it('should display error message on API failure', async () => {
        // Mock API agar gagal (misalnya 401 Unauthorized)
        server.use(
            http.post('http://localhost:8080/api/v1/auth/login', () => {
                return HttpResponse.json({ error: 'Kredensial tidak valid.' }, { status: 401 });
            })
        );

        renderWithProviders();
        
        // Input data
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'wrong@test.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
        
        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        // Verifikasi pesan error
        await waitFor(() => {
            expect(screen.getByText(/An unexpected error occurred: Unauthorized/i)).toBeInTheDocument();
        });
    });
    
    it('should call login context and navigate to /products on successful login', async () => {
        const mockResponse = {
            token: 'fake-jwt-token',
            name: 'Budi Santoso',
            user_id: 1,
        };
        // Mock API agar sukses
        server.use(
            http.post('http://localhost:8080/api/v1/auth/login', () => {
                return HttpResponse.json(mockResponse);
            })
        );

        renderWithProviders();

        // Input data
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'budi.santoso@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'sandi_rahasia123' } });
        
        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        // Verifikasi navigasi dipanggil
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/products');
        });
    });
});