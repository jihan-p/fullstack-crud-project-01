// src/components/molecules/NavLinks.tsx

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavLinks: React.FC = () => {
    const { isAuthenticated, logout, user } = useAuth();

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
        }
    };

    return (
        <div className="space-x-6 flex items-center">
            {isAuthenticated ? (
                <>
                    <span className="text-gray-300">Welcome, {user?.name}!</span>
                    <Link to="/products" className="hover:text-gray-300">Products</Link>
                    <Link to="/profile" className="hover:text-gray-300">My Profile</Link>
                    <Link to="/users" className="hover:text-gray-300">User Management</Link>
                    <button 
                        onClick={handleLogout} 
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Logout
                    </button>
                </>
            ) : (
                <Link to="/login" className="hover:text-gray-300">Login</Link>
            )}
        </div>
    );
};

export default NavLinks;