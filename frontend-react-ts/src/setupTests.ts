// Polyfill fetch APIs (needed for MSW v2)
import 'whatwg-fetch';

// Polyfill TextEncoder/TextDecoder (needed for MSW v2)
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Polyfill BroadcastChannel (needed for MSW v2)
if (typeof BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    constructor(name: string) {}
    postMessage(message: any): void {}
    close(): void {}
  } as any;
}

// Extends Jest's `expect` with custom matchers
import '@testing-library/jest-dom';

import { server } from './mocks/server';

// Aktifkan mocking sebelum semua test
beforeAll(() => server.listen());

// Reset handler setelah setiap test untuk memastikan isolasi
afterEach(() => server.resetHandlers());

// Matikan mocking setelah semua test selesai
afterAll(() => server.close());