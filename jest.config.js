// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['main.js', 'assets/scripts.js', '!**/node_modules/**'],
};
