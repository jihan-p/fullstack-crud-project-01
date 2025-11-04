// src/api/authApi.ts

import type { LoginResponse } from '../types/Auth';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `An unexpected error occurred: ${response.statusText}` }));
        throw new Error(errorData.error || 'Login failed');
    }

    return response.json();
};