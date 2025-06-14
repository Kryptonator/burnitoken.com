// tests/setupTests.js
// Setup for DOM and global mocks if needed

// Polyfills for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Example: mock fetch
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    }),
  );

  // Mock console methods for clean test output
  global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };
});

afterAll(() => {
  global.fetch.mockRestore && global.fetch.mockRestore();
});
