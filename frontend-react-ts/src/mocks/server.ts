// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Konfigurasi server mocking untuk lingkungan Node.js (digunakan oleh Jest).
export const server = setupServer(...handlers);