// src/components/layout/MainLayout.tsx

import React from 'react';
import Header from '../components/organisms/Header'; // Corrected import path

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <Header />
            <main>{children}</main>
        </>
    );
};

export default MainLayout;