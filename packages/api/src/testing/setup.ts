import { beforeEach, afterEach } from 'vitest';
import { clearCache } from '../lib/wordService.js';

// Clear word list cache before each test to ensure isolation
beforeEach(() => {
  clearCache();
});

// Clean up after each test
afterEach(() => {
  clearCache();
});

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.NODE_ENV = 'test';