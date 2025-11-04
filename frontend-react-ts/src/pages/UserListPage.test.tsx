// src/pages/UserListPage.test.tsx

import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider, useAuth, UserState } from '../context/AuthContext';
import UserListPage from './UserListPage';

const renderWithProviders = (component: React.ReactElement) => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Router><AuthProvider>{children}</AuthProvider></Router>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
        const mockAdminUser: UserState = {
            id: 1,
            name: 'Admin User',
            role: 'admin',
        };
        result.current.login('mock-admin-token', mockAdminUser);
    });
    return render(component, { wrapper });
};

// Definisikan mock function untuk alert dan cegah pop-up di terminal
const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

describe('UserListPage Integration Tests', () => {
    // 1. Bersihkan pemanggilan mock setelah setiap tes
    afterEach(() => {
        server.resetHandlers();
        alertMock.mockClear();
    });

    // 2. Kembalikan fungsi alert ke kondisi semula setelah semua tes
    afterAll(() => {
        alertMock.mockRestore();
    });

    // Test Load & Render
    it('should load and render a list of users in a table', async () => {
        server.use(
            http.get('http://localhost:8080/api/v1/users', () => {
                return HttpResponse.json({
                    data: [
                        { ID: 1, Name: 'Alice', Email: 'alice@example.com' },
                        { ID: 2, Name: 'Bob', Email: 'bob@example.com' },
                    ],
                    meta: { total: 2, page: 1, limit: 10 },
                });
            })
        );

        renderWithProviders(<UserListPage />);

        expect(await screen.findByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('alice@example.com')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
        expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
    });

    // Test Search Functionality
    it('should trigger an API call with the correct search query after debouncing', async () => {
        const user = userEvent.setup();
        let capturedSearchQuery = '';

        server.use(
            http.get('http://localhost:8080/api/v1/users', ({ request }) => {
                const url = new URL(request.url);
                capturedSearchQuery = url.searchParams.get('search') || '';
                return HttpResponse.json({
                    data: [{ ID: 3, Name: 'Carol', Email: 'carol@example.com' }],
                    meta: { total: 1, page: 1, limit: 10 },
                });
            })
        );

        renderWithProviders(<UserListPage />);

        const searchInput = screen.getByPlaceholderText(/Search by name or email.../i);
        await user.type(searchInput, 'Carol');

        // Wait for the debounced search to trigger the API call and update the UI
        await waitFor(() => {
            expect(capturedSearchQuery).toBe('Carol');
        });
        expect(await screen.findByText('Carol')).toBeInTheDocument();
    });

    // Test Pagination
    it('should fetch the next page when "Next" button is clicked', async () => {
        const user = userEvent.setup();
        let capturedPage = '';

        // Initial load (page 1)
        server.use(
            http.get('http://localhost:8080/api/v1/users', ({ request }) => {
                const url = new URL(request.url);
                capturedPage = url.searchParams.get('page') || '1';
                
                if (capturedPage === '2') {
                    return HttpResponse.json({
                        data: [{ ID: 12, Name: 'Zane', Email: 'zane@example.com' }],
                        meta: { total: 12, page: 2, limit: 10 },
                    });
                }
                return HttpResponse.json({
                    data: Array.from({ length: 10 }, (_, i) => ({ ID: i + 1, Name: `User ${i + 1}`, Email: `user${i+1}@test.com`})),
                    meta: { total: 12, page: 1, limit: 10 },
                });
            })
        );

        renderWithProviders(<UserListPage />);

        // Wait for initial data and find the "Next" button
        const nextButton = await screen.findByRole('button', { name: /Next/i });
        expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();

        // Click "Next"
        await user.click(nextButton);

        // Wait for the API to be called with page=2 and UI to update
        await waitFor(() => {
            expect(capturedPage).toBe('2');
        });
        expect(await screen.findByText('Zane')).toBeInTheDocument();
        expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();
    });

    // Test Action Buttons
    it('should open edit modal and handle delete confirmation', async () => {
        const user = userEvent.setup();
        // Setup MSW handlers for this specific test
        server.use(
            // Handler for the initial GET request
            http.get('http://localhost:8080/api/v1/users', () => 
                HttpResponse.json({ 
                    data: [{ ID: 1, Name: 'Alice', Email: 'alice@example.com' }], 
                    meta: { total: 1, page: 1, limit: 10 }
                })
            ),
            // Handler for the DELETE request to remove the warning
            http.delete('http://localhost:8080/api/v1/users/:id', () => {
                return new HttpResponse(null, { status: 204 }); // Standard success response for DELETE
            })
        );

        renderWithProviders(<UserListPage />);

        const editButton = await screen.findByRole('button', { name: /Edit/i });
        await user.click(editButton);

        // Verifikasi modal edit terbuka
        expect(await screen.findByRole('heading', { name: /Edit User/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Name/i)).toHaveValue('Alice');

        const deleteButton = await screen.findByRole('button', { name: /Delete/i });
        
        // Mock window.confirm for the delete action
        const confirmMock = jest.spyOn(window, 'confirm').mockImplementation(() => true);
        
        await user.click(deleteButton);

        // Verifikasi dialog konfirmasi dipanggil
        expect(confirmMock).toHaveBeenCalledWith('Are you sure you want to delete user "Alice" (ID: 1)?');
        
        confirmMock.mockRestore();
    });
});