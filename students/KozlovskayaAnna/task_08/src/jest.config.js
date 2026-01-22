module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/public/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  moduleFileExtensions: ['js', 'json'],
  testTimeout: 10000
};
