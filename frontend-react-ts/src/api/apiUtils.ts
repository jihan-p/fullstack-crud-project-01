// src/api/apiUtils.ts

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Helper to create authentication headers
export const getAuthHeaders = (token: string) => {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

// Helper to fetch with authentication
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}, token: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: getAuthHeaders(token),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.error || `An unexpected error occurred: ${response.statusText}`);
    }
    // Handle 204 No Content for DELETE requests
    if (response.status === 204) {
        return;
    }
    return response.json();
};