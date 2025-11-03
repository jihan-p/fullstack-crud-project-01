// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProductListPage from './pages/ProductListPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/organisms/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/products" 
              element={<ProtectedRoute><ProductListPage /></ProtectedRoute>} 
            />
            <Route path="*" element={<Navigate to="/products" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;