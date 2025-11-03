// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Konfigurasi service worker dengan semua handler yang telah didefinisikan.
// Ini akan mencegat request di level browser.
export const worker = setupWorker(...handlers);