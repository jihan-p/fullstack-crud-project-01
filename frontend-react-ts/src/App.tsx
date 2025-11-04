// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductListPage from './pages/ProductListPage'; // Import ProductListPage
import Header from './components/organisms/Header'; // Perbaiki path import Header
import ProfilePage from './pages/ProfilePage'; // Component ProfilePage yang baru
import { useAuth } from '../context/AuthContext';
import LoginPage from './pages/LoginPage';

// Komponen Pelindung (Guard)
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const { isAuthenticated } = useAuth();
    // Jika belum login, alihkan ke halaman login
    return isAuthenticated ? element : <Navigate to="/login" replace />; 
};

function App() {
  return (
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProtectedRoute element={<ProductListPage />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
            <Route path="*" element={<Navigate to="/products" />} />
          </Routes>
        </main>
      </Router>
  );
}

export default App;