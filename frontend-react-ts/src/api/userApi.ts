// src/api/userApi.ts

import { fetchWithAuth } from './apiUtils';
import type { User } from '../types/User';

const ME_URL = '/users/me'; // Endpoint for the current user
const USERS_URL = '/admin/users'; // FIX: Match the backend's admin route group

export interface UserListResponse {
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

export const fetchCurrentUser = async (token: string): Promise<{ data: User }> => {
    return fetchWithAuth(ME_URL, { method: 'GET' }, token);
};

type UpdateUserData = {
    Name: string;
    Email: string;
};

export const updateCurrentUser = async (userData: UpdateUserData, token: string): Promise<{ data: User }> => {
    return fetchWithAuth(ME_URL, {
        method: 'PUT',
        body: JSON.stringify(userData),
    }, token);
};

export const deleteCurrentUser = async (token: string): Promise<void> => {
    return fetchWithAuth(ME_URL, { method: 'DELETE' }, token);
};

// --- Admin Functions ---

export const fetchAllUsers = async (page: number, limit: number, search: string, token: string): Promise<UserListResponse> => {
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search,
    }).toString();
    
    return fetchWithAuth(`${USERS_URL}?${query}`, { method: 'GET' }, token);
};

// Note: The backend currently only supports PUT /users/me.
// To manage other users, a PUT /users/:id endpoint would be needed.
// This function is a placeholder for that future capability.
export const updateUser = async (id: number, userData: UpdateUserData, token: string): Promise<{ data: User }> => {
    return fetchWithAuth(`${USERS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(userData) }, token);
};

export const deleteUser = async (id: number, token: string): Promise<void> => {
    return fetchWithAuth(`${USERS_URL}/${id}`, { method: 'DELETE' }, token);
};