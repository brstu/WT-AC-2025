module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Ищем файлы с _test.js
  testMatch: ['**/*_test.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
};