// src/components/atoms/LogoutButton.tsx

import React from 'react';
import { logoutUser } from '../../api/authApi'; // Import fungsi logout

const LogoutButton: React.FC = () => {
    
    const handleLogout = () => {
        // Pop-up konfirmasi (Opsional, tapi disarankan)
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            // Panggil fungsi logoutUser yang akan menghapus token dan mengalihkan halaman
            logoutUser();
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-150 ease-in-out"
        >
            Keluar (Logout)
        </button>
    );
};

export default LogoutButton;