// src/api/apiUtils.ts

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Helper untuk membuat header autentikasi
export const getAuthHeaders = (token: string) => {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

// Helper untuk fetch dengan autentikasi
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}, token: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: getAuthHeaders(token),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Handle 204 No Content for DELETE requests
    if (response.status === 204) {
        return;
    }
    return response.json();
};