import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import { 
  createTestApp, 
  createTestUser, 
  resetTestDatabase,
  generateTestToken,
  getAuthHeader,
  initTestDatabase,
  performanceUtils
} from '../testing/testUtils.js';
import { FastifyInstance } from 'fastify';

describe('API Integration Tests', () => {
  let app: FastifyInstance;
  let request: ReturnType<typeof supertest>;

  beforeEach(async () => {
    await resetTestDatabase();
    app = await createTestApp(); // Include all routes
    request = supertest(app.server);
  });

  describe('Authentication Flow Integration', () => {
    it('should complete full registration and login flow', async () => {
      const userData = {
        email: 'integration@test.com',
        password: 'IntegrationTest123!'
      };

      // Step 1: Register user
      const registerResponse = await request
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('token');
      expect(registerResponse.body.user.email).toBe(userData.email);

      const registerToken = registerResponse.body.token;
      const userId = registerResponse.body.user.id;

      // Step 2: Verify user exists in database
      const prisma = initTestDatabase();
      const dbUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      expect(dbUser).toBeTruthy();
      expect(dbUser!.id).toBe(userId);

      // Step 3: Login with same credentials
      const loginResponse = await request
        .post('/api/auth/login')
        .send(userData)
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body.user.email).toBe(userData.email);
      expect(loginResponse.body.user.id).toBe(userId);

      // Tokens should be different (new token generated)
      expect(loginResponse.body.token).not.toBe(registerToken);

      // Step 4: Verify both tokens are valid
      const decoded1 = app.jwt.verify(registerToken) as any;
      const decoded2 = app.jwt.verify(loginResponse.body.token) as any;

      expect(decoded1.userId).toBe(userId);
      expect(decoded2.userId).toBe(userId);
    });

    it('should maintain session across multiple requests', async () => {
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      // Make multiple authenticated requests
      const responses = await Promise.all([
        request.get('/health').set(getAuthHeader(token)),
        request.get('/api/words/health').set(getAuthHeader(token)),
        request.get('/api/words/lists').set(getAuthHeader(token))
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Test Results API Integration', () => {
    it('should save and retrieve test results', async () => {
      // First register a user
      const userData = {
        email: 'results@test.com',
        password: 'TestResults123!'
      };

      const authResponse = await request
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const token = authResponse.body.token;
      const userId = authResponse.body.user.id;

      // Save a test result
      const testResult = {
        wpm: 85,
        accuracy: 96.5,
        rawWpm: 88,
        consistency: 92.0,
        config: JSON.stringify({
          mode: 'time',
          duration: 60,
          difficulty: 'Normal',
          textSource: 'english1k'
        }),
        tags: 'english1k,normal'
      };

      const saveResponse = await request
        .post('/api/tests')
        .set(getAuthHeader(token))
        .send(testResult)
        .expect(201);

      expect(saveResponse.body).toHaveProperty('id');
      expect(saveResponse.body.wpm).toBe(testResult.wpm);

      // Retrieve test results
      const getResponse = await request
        .get('/api/tests')
        .set(getAuthHeader(token))
        .expect(200);

      expect(Array.isArray(getResponse.body)).toBe(true);
      expect(getResponse.body.length).toBe(1);
      expect(getResponse.body[0].wpm).toBe(testResult.wpm);
      expect(getResponse.body[0].userId).toBe(userId);

      // Verify in database
      const prisma = initTestDatabase();
      const dbResults = await prisma.testResult.findMany({
        where: { userId }
      });

      expect(dbResults.length).toBe(1);
      expect(dbResults[0].wpm).toBe(testResult.wpm);
    });

    it('should handle multiple test results for user', async () => {
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      const testResults = [
        { wpm: 70, accuracy: 94.0 },
        { wpm: 80, accuracy: 96.0 },
        { wpm: 90, accuracy: 98.0 }
      ];

      // Save multiple results
      for (const result of testResults) {
        await request
          .post('/api/tests')
          .set(getAuthHeader(token))
          .send({
            ...result,
            rawWpm: result.wpm + 2,
            config: JSON.stringify({ mode: 'test' }),
            tags: 'test'
          })
          .expect(201);
      }

      // Retrieve all results
      const response = await request
        .get('/api/tests')
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.length).toBe(3);
      
      // Should be ordered by timestamp (newest first)
      const wpms = response.body.map((r: { wpm: number }) => r.wpm);
      expect(wpms).toEqual([90, 80, 70]);
    });

    it('should isolate test results between users', async () => {
      const user1 = await createTestUser({ email: 'user1@test.com' });
      const user2 = await createTestUser({ email: 'user2@test.com' });

      const token1 = generateTestToken(app, user1.id);
      const token2 = generateTestToken(app, user2.id);

      // Save result for user1
      await request
        .post('/api/tests')
        .set(getAuthHeader(token1))
        .send({
          wpm: 85,
          accuracy: 96,
          rawWpm: 87,
          config: '{}',
          tags: 'user1'
        })
        .expect(201);

      // Save result for user2
      await request
        .post('/api/tests')
        .set(getAuthHeader(token2))
        .send({
          wpm: 75,
          accuracy: 94,
          rawWpm: 77,
          config: '{}',
          tags: 'user2'
        })
        .expect(201);

      // Each user should only see their own results
      const user1Results = await request
        .get('/api/tests')
        .set(getAuthHeader(token1))
        .expect(200);

      const user2Results = await request
        .get('/api/tests')
        .set(getAuthHeader(token2))
        .expect(200);

      expect(user1Results.body.length).toBe(1);
      expect(user1Results.body[0].wpm).toBe(85);
      expect(user1Results.body[0].tags).toBe('user1');

      expect(user2Results.body.length).toBe(1);
      expect(user2Results.body[0].wpm).toBe(75);
      expect(user2Results.body[0].tags).toBe('user2');
    });
  });

  describe('Words API and User Context Integration', () => {
    it('should provide words API without authentication', async () => {
      // Words API should work without authentication
      const response = await request
        .get('/api/words?list=english1k&limit=10')
        .expect(200);

      expect(response.body.words.length).toBe(10);
      expect(response.body.metadata.list).toBe('english1k');
    });

    it('should work with authenticated requests', async () => {
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      const response = await request
        .get('/api/words?list=javascript&limit=15')
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body.words.length).toBe(15);
      expect(response.body.metadata.list).toBe('javascript');
    });

    it('should handle enhanced text generation with user context', async () => {
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      const response = await request
        .get('/api/words?list=english1k&limit=50&punctuation=true&numbers=true')
        .set(getAuthHeader(token))
        .expect(200);

      expect(response.body).toHaveProperty('enhanced_text');
      expect(response.body.punctuation_enabled).toBe(true);
      expect(response.body.numbers_enabled).toBe(true);
      expect(typeof response.body.enhanced_text).toBe('string');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication errors across all protected endpoints', async () => {
      const protectedEndpoints = [
        { method: 'GET', path: '/api/tests' },
        { method: 'POST', path: '/api/tests' },
        { method: 'GET', path: '/api/tests/stats' }
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request[endpoint.method.toLowerCase() as 'get' | 'post'](endpoint.path)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should handle invalid tokens consistently', async () => {
      const invalidTokens = [
        'Bearer invalid-token',
        'Bearer ',
        'invalid-format',
        'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.invalid'
      ];

      for (const token of invalidTokens) {
        const response = await request
          .get('/api/tests')
          .set('Authorization', token)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should handle database errors gracefully', async () => {
      // Test malformed data that might cause database issues
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      const malformedData = {
        wpm: 'not-a-number',
        accuracy: 'invalid',
        rawWpm: null,
        config: 'invalid-json}',
        tags: null
      };

      const response = await request
        .post('/api/tests')
        .set(getAuthHeader(token))
        .send(malformedData);

      // Should handle validation error gracefully
      expect([400, 422]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Performance Integration Tests', () => {
    it('should handle concurrent user registrations', async () => {
      const registrations = Array(5).fill(0).map((_, i) => 
        request
          .post('/api/auth/register')
          .send({
            email: `concurrent${i}@test.com`,
            password: 'ConcurrentTest123!'
          })
      );

      const responses = await Promise.all(registrations);

      responses.forEach((response: any, index: any) => {
        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe(`concurrent${index}@test.com`);
        expect(response.body).toHaveProperty('token');
      });

      // Verify all users were created in database
      const prisma = initTestDatabase();
      const users = await prisma.user.findMany({
        where: {
          email: {
            startsWith: 'concurrent'
          }
        }
      });

      expect(users.length).toBe(5);
    });

    it('should handle mixed API operations efficiently', async () => {
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      const start = Date.now();

      // Perform mixed operations concurrently
      const operations = [
        request.get('/api/words?list=english1k&limit=20'),
        request.get('/api/words/lists'),
        request.get('/api/words/health'),
        request.post('/api/tests').set(getAuthHeader(token)).send({
          wpm: 85,
          accuracy: 96,
          rawWpm: 87,
          config: '{}',
          tags: 'perf-test'
        }),
        request.get('/api/tests').set(getAuthHeader(token))
      ];

      const responses = await Promise.all(operations);
      const totalTime = Date.now() - start;

      // All operations should succeed
      expect(responses[0].status).toBe(200); // words
      expect(responses[1].status).toBe(200); // lists
      expect(responses[2].status).toBe(200); // health
      expect(responses[3].status).toBe(201); // save test
      expect(responses[4].status).toBe(200); // get tests

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(1000);
    });

    it('should handle stress testing scenarios', async () => {
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      // Create multiple test results rapidly
      const testCreations = Array(20).fill(0).map((_, i) =>
        request
          .post('/api/tests')
          .set(getAuthHeader(token))
          .send({
            wpm: 70 + i,
            accuracy: 90 + (i % 10),
            rawWpm: 72 + i,
            config: JSON.stringify({ iteration: i }),
            tags: `stress-test-${i}`
          })
      );

      const responses = await Promise.all(testCreations);

      // All should succeed
      responses.forEach((response: any, index: any) => {
        expect(response.status).toBe(201);
        expect(response.body.wpm).toBe(70 + index);
      });

      // Verify retrieval is still fast
      const start = Date.now();
      const getResponse = await request
        .get('/api/tests')
        .set(getAuthHeader(token))
        .expect(200);
      const retrievalTime = Date.now() - start;

      expect(getResponse.body.length).toBe(20);
      expect(retrievalTime).toBeLessThan(200); // Should retrieve quickly
    });
  });

  describe('Security Integration Tests', () => {
    it('should prevent unauthorized access to user data', async () => {
      const user1 = await createTestUser({ email: 'user1@test.com' });
      const user2 = await createTestUser({ email: 'user2@test.com' });

      const token1 = generateTestToken(app, user1.id);
      const token2 = generateTestToken(app, user2.id);

      // Create test result for user1
      await request
        .post('/api/tests')
        .set(getAuthHeader(token1))
        .send({
          wpm: 85,
          accuracy: 96,
          rawWpm: 87,
          config: '{}',
          tags: 'private-data'
        })
        .expect(201);

      // User2 should not be able to access user1's data
      const user2Response = await request
        .get('/api/tests')
        .set(getAuthHeader(token2))
        .expect(200);

      expect(user2Response.body.length).toBe(0);

      // Verify user1 can still access their data
      const user1Response = await request
        .get('/api/tests')
        .set(getAuthHeader(token1))
        .expect(200);

      expect(user1Response.body.length).toBe(1);
      expect(user1Response.body[0].tags).toBe('private-data');
    });

    it('should validate JWT token integrity', async () => {
      const user = await createTestUser();
      const validToken = generateTestToken(app, user.id);

      // Tamper with the token
      const tamperedToken = validToken.slice(0, -5) + 'XXXXX';

      const response = await request
        .get('/api/tests')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle SQL injection attempts across endpoints', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'; UPDATE users SET email='hacked'; --"
      ];

      for (const input of maliciousInputs) {
        // Test registration
        const regResponse = await request
          .post('/api/auth/register')
          .send({
            email: input,
            password: 'ValidPassword123!'
          });

        expect([400, 409]).toContain(regResponse.status);

        // Test login
        const loginResponse = await request
          .post('/api/auth/login')
          .send({
            email: input,
            password: 'ValidPassword123!'
          });

        expect([400, 401]).toContain(loginResponse.status);
      }
    });
  });

  describe('Data Consistency Integration', () => {
    it('should maintain data consistency across operations', async () => {
      const userData = {
        email: 'consistency@test.com',
        password: 'ConsistencyTest123!'
      };

      // Register user
      const regResponse = await request
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const userId = regResponse.body.user.id;
      const token = regResponse.body.token;

      // Create multiple test results
      const results = [
        { wpm: 70, accuracy: 94 },
        { wpm: 80, accuracy: 96 },
        { wpm: 90, accuracy: 98 }
      ];

      for (const result of results) {
        await request
          .post('/api/tests')
          .set(getAuthHeader(token))
          .send({
            ...result,
            rawWpm: result.wpm + 2,
            config: JSON.stringify({ mode: 'consistency-test' }),
            tags: 'consistency'
          })
          .expect(201);
      }

      // Verify database state
      const prisma = initTestDatabase();
      
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { testResults: true }
      });

      expect(dbUser).toBeTruthy();
      expect(dbUser!.testResults.length).toBe(3);
      
      const apiResults = await request
        .get('/api/tests')
        .set(getAuthHeader(token))
        .expect(200);

      expect(apiResults.body.length).toBe(3);

      // API and database should be consistent
      const dbWpms = dbUser!.testResults.map((r) => r.wpm).sort();
      const apiWpms = apiResults.body.map((r: { wpm: number }) => r.wpm).sort();
      
      expect(dbWpms).toEqual(apiWpms);
    });
  });
});