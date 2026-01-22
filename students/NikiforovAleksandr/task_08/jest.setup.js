// Global Jest setup
global.fetch = jest.fn();

// Mock console methods to keep test output clean
console.error = jest.fn();
console.warn = jest.fn();
console.log = jest.fn();

// Mock DOM for MemeCard tests
if (typeof window === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.HTMLDivElement = dom.window.HTMLDivElement;
}