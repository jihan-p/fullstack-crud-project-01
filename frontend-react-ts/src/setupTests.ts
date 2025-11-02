// Polyfill TextEncoder/TextDecoder (needed for MSW v2)
// Ini harus berada di paling atas agar tersedia sebelum MSW diimpor.
import { TextEncoder, TextDecoder } from 'util';
import { TransformStream } from 'stream/web';

Object.assign(global, {
  TextEncoder,
  TextDecoder,
  TransformStream,
});

// Polyfill fetch APIs (needed for MSW v2)
import 'whatwg-fetch';

// Polyfill BroadcastChannel (needed for MSW v2)
if (typeof BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    constructor(_name: string) {}
    postMessage(_message: any): void {}
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