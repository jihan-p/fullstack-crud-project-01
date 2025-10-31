// src/mocks/server.ts

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configure MSW server with the created handlers
export const server = setupServer(...handlers);