// Test setup file
const fs = require('fs');
const path = require('path');

// Setup test environment
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;

// Clean up test data before each test
beforeEach(async () => {
  const testDataFile = path.join(__dirname, '../src/data/gadgets.json');
  
  // Remove test data file if it exists
  if (fs.existsSync(testDataFile)) {
    fs.unlinkSync(testDataFile);
  }
});

afterAll(async () => {
  // Clean up after all tests
  const testDataFile = path.join(__dirname, '../src/data/gadgets.json');
  
  if (fs.existsSync(testDataFile)) {
    fs.unlinkSync(testDataFile);
  }
});