/**
 * Jest setup file for Whish Payment SDK tests
 */

// Global test configuration
beforeAll(() => {
  // Set test timeout
  jest.setTimeout(10000);
});

afterEach(() => {
  // Clean up any side effects
  jest.clearAllMocks();
});

// Mock environment variables for testing
process.env.NODE_ENV = 'test';

// Global test utilities
export {};
