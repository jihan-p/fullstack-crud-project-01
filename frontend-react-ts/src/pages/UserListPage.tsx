// src/pages/UserListPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAllUsers, updateUser, deleteUser, UserListResponse } from '../api/userApi';
import type { User } from '../types/User';
import { useDebounce } from '../hooks/useDebounce';
import Button from '../components/atoms/Button';
import EditUserModal from '../components/organisms/EditUserModal';

const UserListPage: React.FC = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState<UserListResponse['meta'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for modal and actions
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchUsers = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAllUsers(page, limit, debouncedSearchTerm, token);
            setUsers(response.data);
            setMeta(response.meta);
        } catch (err) {
            setError('Failed to fetch users. You may not have permission to view this page.');
        } finally {
            setLoading(false);
        }
    }, [token, page, limit, debouncedSearchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Reset page to 1 when search term changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm]);

    const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

    const handleEditStart = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (id: number, data: { Name: string; Email: string }) => {
        if (!token) throw new Error("Authentication token is missing.");
        try {
            await updateUser(id, data, token);
            handleModalClose();
            await fetchUsers(); // Refresh the list
        } catch (err) {
            // Re-throw the error to be caught and displayed by the modal
            throw err;
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!token) return;
        if (window.confirm(`Are you sure you want to delete user "${user.Name}" (ID: ${user.ID})?`)) {
            try {
                await deleteUser(user.ID, token);
                // Refresh list. If it was the last item on a page, go to the previous page.
                if (users.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    await fetchUsers();
                }
            } catch (err) {
                setError((err as Error).message || 'Failed to delete user.');
            }
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            {loading && <p>Loading users...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <>
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.ID}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.ID}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.Name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.Email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <Button size="sm" onClick={() => handleEditStart(user)}>Edit</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-gray-500">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-700">
                            Page {meta?.page} of {totalPages} (Total: {meta?.total} users)
                        </span>
                        <div className="space-x-2">
                            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                Previous
                            </Button>
                            <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}
            <EditUserModal
                user={editingUser}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSave={handleSaveUser}
            />
        </div>
    );
};

export default UserListPage;