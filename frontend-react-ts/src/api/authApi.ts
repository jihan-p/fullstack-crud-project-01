// src/api/authApi.ts

const API_BASE_URL = 'http://localhost:8080/api/v1';

interface LoginResponse {
    token: string;
    name: string;
    user_id: number;
}

/**
 * Mengirim permintaan login ke backend.
 * @param email - Email pengguna.
 * @param password - Password pengguna.
 * @returns {Promise<LoginResponse>} Data respons dari server jika login berhasil.
 */
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        // Coba parsing error dari body. Jika body kosong atau bukan JSON, lempar error umum.
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch {
            throw new Error(`An unexpected error occurred: ${response.statusText}`);
        }
    }

    const data: LoginResponse = await response.json();

    // Simpan token dan data pengguna ke localStorage setelah login berhasil
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userName', data.name);
    localStorage.setItem('userID', data.user_id.toString());

    return data;
};

/**
 * Menghapus data autentikasi dari localStorage dan me-refresh halaman.
 */
export const logoutUser = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userID');
    window.location.href = '/login'; // Redirect ke halaman login
};