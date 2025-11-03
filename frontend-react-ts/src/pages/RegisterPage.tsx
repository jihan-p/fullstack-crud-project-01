// src/pages/RegisterPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  // TODO: Implement registration form and logic here
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl">Register Page (Under Construction)</h1>
      <p className="mt-4">Sudah punya akun? <Link to="/login" className="text-blue-500">Login di sini</Link></p>
    </div>
  );
};

export default RegisterPage;