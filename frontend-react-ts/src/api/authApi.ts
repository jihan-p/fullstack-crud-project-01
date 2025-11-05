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

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unexpected error occurred' }));
        throw new Error(errorData.error);
    }

    return response.json();
};

export const resetPassword = async (token: string, password: string, password_confirm: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, password_confirm }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unexpected error occurred' }));
        throw new Error(errorData.error);
    }

    return response.json();
};

export const registerUser = async (name: string, email: string, password: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unexpected error occurred' }));
        throw new Error(errorData.error);
    }

    return response.json();
};

export const activateUser = async (token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unexpected error occurred' }));
        throw new Error(errorData.error);
    }

    return response.json();
};