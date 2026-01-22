const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/**/*_spec.js',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: true
  }
});