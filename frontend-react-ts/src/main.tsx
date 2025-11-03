import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Asumsi file App utama Anda adalah App.tsx
import './index.css'; // Asumsi ada file CSS global
import { AuthProvider } from '../context/AuthContext';

/**
 * Fungsi asinkron untuk mengaktifkan mocking secara kondisional.
 */
async function enableMocking() {
  // Periksa apakah flag di .env diatur ke 'true'.
  // Variabel dari import.meta.env selalu bertipe string.
  if (import.meta.env.VITE_ENABLE_MOCKING !== 'true') {
    return;
  }

  // Jika ya, impor worker dari MSW.
  const { worker } = await import('./mocks/browser');

  // Mulai worker. Ini akan mencegat request network di browser.
  // 'onUnhandledRequest: 'bypass'' berarti request yang tidak ada mock handler-nya
  // akan diteruskan ke network seperti biasa.
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}

// Panggil fungsi mocking, dan setelah selesai (atau jika tidak aktif),
// render aplikasi React Anda.
enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
});