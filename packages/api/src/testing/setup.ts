import { beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { clearCache } from '../lib/wordService.js';
import { 
  initTestDatabase, 
  resetTestDatabase, 
  disconnectTestDatabase 
} from './testUtils.js';

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_test';

// Global test setup
beforeAll(async () => {
  // Initialize test database and ensure schema exists
  const prisma = initTestDatabase();
  
  // Deploy the schema to the test database using Prisma
  // Note: This will be replaced by proper Prisma migrations
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "passwordHash" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "UserSettings" (
        "userId" TEXT NOT NULL PRIMARY KEY,
        "theme" TEXT NOT NULL DEFAULT 'slate',
        "caretStyle" TEXT NOT NULL DEFAULT 'line',
        "paceCaretWpm" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "TestResults" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "wpm" INTEGER NOT NULL,
        "accuracy" DECIMAL NOT NULL,
        "rawWpm" INTEGER NOT NULL,
        "consistency" DECIMAL,
        "config" TEXT NOT NULL,
        "tags" TEXT NOT NULL,
        "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TestResults_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
  } catch (error) {
    // Tables might already exist, which is fine
    console.log('Schema setup completed (tables may already exist)');
  }
});

// Clear state before each test to ensure isolation
beforeEach(async () => {
  // Clear word list cache
  clearCache();
  
  // Reset test database to clean state
  await resetTestDatabase();
});

// Clean up after each test
afterEach(async () => {
  clearCache();
});

// Global test cleanup
afterAll(async () => {
  // Disconnect from test database
  await disconnectTestDatabase();
});