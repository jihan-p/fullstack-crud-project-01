// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductListPage from './pages/ProductListPage';
import MainLayout from './pages/MainLayout'; // Import the new layout
import ProfilePage from './pages/ProfilePage';
import UserListPage from './pages/UserListPage'; // NEW: Import UserListPage
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RegisterPage from './pages/RegisterPage';
import ActivationPage from './pages/ActivationPage';

// Komponen Pelindung (Guard)
const ProtectedRoute: React.FC<{ element: React.ReactElement; adminOnly?: boolean }> = ({ element, adminOnly = false }) => {
    const { isAuthenticated, user } = useAuth(); // Asumsikan `user` object memiliki properti `role`

    // 1. Jika pengguna belum login, alihkan ke halaman login.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Jika rute ini hanya untuk admin dan peran pengguna bukan 'admin', alihkan.
    //    Di sini kita asumsikan peran admin disimpan sebagai 'admin'.
    if (adminOnly && user?.role !== 'admin') {
        // Alihkan pengguna non-admin ke halaman produk utama.
        return <Navigate to="/products" replace />;
    }

    return element;
};

function App() {
  return (
      <Router>
        <Routes>
          {/* Public routes without the main header */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes wrapped in the MainLayout */}
          <Route path="/products" element={
            <ProtectedRoute element={<MainLayout><ProductListPage /></MainLayout>} />
          } />
          <Route path="/profile" element={
            <ProtectedRoute element={<MainLayout><ProfilePage /></MainLayout>} />
          } />
          <Route path="/users" element={
            <ProtectedRoute element={<MainLayout><UserListPage /></MainLayout>} adminOnly={true} />
          } />

          {/* Default route */}
          <Route path="*" element={<Navigate to="/products" />} />
        </Routes>
      </Router>
  );
}

export default App;