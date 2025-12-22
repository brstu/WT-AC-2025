export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    '**/src/test/**/*.test.js',
    '**/src/test/**/*.integration.test.js'
  ]
}