// src/api/userApi.ts

import { fetchWithAuth } from './apiUtils';
import type { User } from '../types/User';

const BASE_URL = '/users/me'; // Endpoint for the current user

export const fetchCurrentUser = async (token: string): Promise<{ data: User }> => {
    return fetchWithAuth(BASE_URL, { method: 'GET' }, token);
};

type UpdateUserData = {
    Name: string;
    Email: string;
};

export const updateCurrentUser = async (userData: UpdateUserData, token: string): Promise<{ data: User }> => {
    return fetchWithAuth(BASE_URL, {
        method: 'PUT',
        body: JSON.stringify(userData),
    }, token);
};

export const deleteCurrentUser = async (token: string): Promise<void> => {
    return fetchWithAuth(BASE_URL, { method: 'DELETE' }, token);
};