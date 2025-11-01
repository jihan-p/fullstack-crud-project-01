export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    },
    transform: {
      // Use ts-jest to transform TypeScript and JavaScript files,
      // and tell it to use tsconfig.app.json for JSX settings.
      '^.+\\.(t|j)sx?$': [
        'ts-jest', {
          tsconfig: 'tsconfig.app.json'
        }
      ],
    },
    // Secara default, Jest tidak mentransformasi file dari node_modules.
    // Kita perlu memberitahu Jest untuk mentransformasi beberapa modul ESM.
    // Pola ini mengabaikan semua node_modules KECUALI modul-modul yang disebutkan.
    transformIgnorePatterns: [
      '/node_modules/(?!(@mswjs/interceptors|msw|until-async|@open-draft/until|strict-event-emitter|@open-draft/logger)/)',
    ],
    // Hapus komentar yang tidak digunakan untuk menjaga kebersihan file
  };