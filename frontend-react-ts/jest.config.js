export default { 
    testEnvironment: 'jsdom',
    // testEnvironment: 'jest-environment-jsdom-latest',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    },
    transform: {
      '^.+\\.(ts|tsx)$': 'babel-jest',
    },
    // testEnvironmentOptions: {
    //   // Memberikan URL yang jelas ke JSDOM, memecahkan masalah localStorage/SecurityError
    //   url: 'http://localhost/', 
    // },
  };