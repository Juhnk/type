import { FastifyInstance } from 'fastify';
import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';
import Fastify from 'fastify';
import { authRoutes } from '../routes/auth.js';
import { wordsRoutes } from '../routes/words.js';
import { testRoutes } from '../routes/tests.js';
import { aiRoutes } from '../routes/ai.js';

// Test database instance
let testPrisma: PrismaClient;

/**
 * Initialize test database connection
 */
export const initTestDatabase = () => {
  if (!testPrisma) {
    // Use dedicated test database for PostgreSQL
    const testDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://typeamp_user:typeamp_dev_pass@localhost:5432/typeamp_test';
    
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: testDbUrl
        }
      },
      log: process.env.DEBUG_TESTS ? ['query', 'info', 'warn', 'error'] : []
    });
  }
  return testPrisma;
};

/**
 * Reset test database by clearing all tables
 */
export const resetTestDatabase = async () => {
  const prisma = initTestDatabase();
  
  // Delete in dependency order
  await prisma.testResult.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();
};

/**
 * Seed test database with initial data
 */
export const seedTestDatabase = async () => {
  const prisma = initTestDatabase();
  
  // Create test users
  const testUsers = [
    {
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 12)
    },
    {
      email: 'admin@typeamp.com',
      passwordHash: await bcrypt.hash('adminpass456', 12)
    }
  ];

  for (const userData of testUsers) {
    await prisma.user.create({
      data: userData
    });
  }
};

/**
 * Create test user with optional data override
 */
export const createTestUser = async (overrides: Partial<{
  email: string;
  password: string;
  passwordHash: string;
}> = {}) => {
  const prisma = initTestDatabase();
  
  const userData = {
    email: overrides.email || `test-${Date.now()}@example.com`,
    passwordHash: overrides.passwordHash || await bcrypt.hash(overrides.password || 'testpass123', 12)
  };

  return prisma.user.create({
    data: userData,
    select: {
      id: true,
      email: true,
      createdAt: true
    }
  });
};

/**
 * Create test result for a user
 */
export const createTestResult = async (userId: string, overrides: Partial<{
  wpm: number;
  accuracy: number;
  rawWpm: number;
  consistency: number;
  config: string;
  tags: string;
}> = {}) => {
  const prisma = initTestDatabase();
  
  return prisma.testResult.create({
    data: {
      userId,
      wpm: overrides.wpm || 75,
      accuracy: overrides.accuracy || 96.5,
      rawWpm: overrides.rawWpm || 78,
      consistency: overrides.consistency || 88.2,
      config: overrides.config || JSON.stringify({ mode: 'time', duration: 60 }),
      tags: overrides.tags || 'english1k'
    }
  });
};

/**
 * Create Fastify app instance for testing
 */
export const createTestApp = async (options: {
  includeAuth?: boolean;
  includeWords?: boolean;
  includeTests?: boolean;
  includeAI?: boolean;
} = {}) => {
  const {
    includeAuth = true,
    includeWords = true,
    includeTests = true,
    includeAI = true
  } = options;

  const app = Fastify({
    logger: false // Disable logging during tests
  });

  // Register CORS
  await app.register(import('@fastify/cors'), {
    origin: true,
    credentials: true
  });

  // Register JWT
  await app.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'test-jwt-secret-key'
  });

  // Register routes based on options
  if (includeAuth) await app.register(authRoutes);
  if (includeWords) await app.register(wordsRoutes);
  if (includeTests) await app.register(testRoutes);
  if (includeAI) await app.register(aiRoutes);

  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  // Make sure the app is ready but don't listen on a port
  await app.ready();

  return app;
};

/**
 * Generate JWT token for testing
 */
export const generateTestToken = (app: FastifyInstance, userId: string): string => {
  return app.jwt.sign({ userId });
};

/**
 * Get authorization header for testing
 */
export const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
});

/**
 * Clean up test database connection
 */
export const disconnectTestDatabase = async () => {
  if (testPrisma) {
    await testPrisma.$disconnect();
  }
};

/**
 * Test data factories
 */
export const testData = {
  validUser: {
    email: 'valid@example.com',
    password: 'ValidPass123!'
  },
  
  invalidUsers: [
    { email: 'invalid-email', password: 'short' },
    { email: 'missing@password.com', password: '' },
    { email: '', password: 'ValidPass123!' },
    { email: 'test@example.com', password: '12345' } // too short
  ],

  testResult: {
    wpm: 85,
    accuracy: 94.2,
    rawWpm: 88,
    consistency: 91.5,
    config: JSON.stringify({ 
      mode: 'time', 
      duration: 60, 
      difficulty: 'Normal',
      textSource: 'english1k'
    }),
    tags: 'english1k,normal'
  },

  wordsQueries: {
    valid: [
      { list: 'english1k', limit: '50' },
      { list: 'english10k', limit: '100', randomize: 'true' },
      { list: 'javascript', limit: '25', punctuation: 'true' },
      { list: 'python', limit: '75', numbers: 'true', punctuation_density: 'heavy' }
    ],
    
    invalid: [
      { list: 'nonexistent', limit: '50' },
      { list: 'english1k', limit: '99999' },
      { list: 'english1k', limit: 'not-a-number' },
      { list: 'english1k', punctuation_density: 'invalid' }
    ]
  }
};

/**
 * Performance testing utilities
 */
export const performanceUtils = {
  /**
   * Measure response time for multiple concurrent requests
   */
  async measureConcurrentRequests(
    requestFunction: () => Promise<any>,
    concurrency: number = 10,
    iterations: number = 5
  ) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const promises = Array(concurrency).fill(0).map(() => requestFunction());
      await Promise.all(promises);
      const end = Date.now();
      results.push(end - start);
    }

    return {
      average: results.reduce((sum, time) => sum + time, 0) / results.length,
      min: Math.min(...results),
      max: Math.max(...results),
      results
    };
  },

  /**
   * Test memory usage during operations
   */
  measureMemoryUsage() {
    const used = process.memoryUsage();
    return {
      rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(used.external / 1024 / 1024 * 100) / 100
    };
  }
};