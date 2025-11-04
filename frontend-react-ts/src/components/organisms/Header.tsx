// src/components/layout/Header.tsx

import { Link } from 'react-router-dom';
import NavLinks from '../molecules/NavLinks'; // Impor molekul baru

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800 p-4 text-white shadow-md sticky top-0 z-10">
            <nav className="container mx-auto flex justify-between items-center">
                <Link to="/products" className="text-xl font-bold hover:text-gray-300">
                    ProductApp
                </Link>
                <NavLinks />
            </nav>
        </header>
    );
};

export default Header;