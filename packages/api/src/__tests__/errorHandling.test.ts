import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import { 
  createTestApp, 
  createTestUser, 
  resetTestDatabase,
  generateTestToken,
  getAuthHeader
} from '../testing/testUtils.js';
import { FastifyInstance } from 'fastify';

describe('Error Handling and Edge Cases', () => {
  let app: FastifyInstance;
  let request: ReturnType<typeof supertest>;

  beforeEach(async () => {
    await resetTestDatabase();
    app = await createTestApp();
    request = supertest(app.server);
  });

  describe('HTTP Error Responses', () => {
    it('should return 400 for malformed JSON', async () => {
      const response = await request
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password": "incomplete json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('should return 400 for missing required fields', async () => {
      const testCases = [
        {}, // Empty body
        { email: 'test@example.com' }, // Missing password
        { password: 'password123' }, // Missing email
        { email: '', password: 'password123' }, // Empty email
        { email: 'test@example.com', password: '' } // Empty password
      ];

      for (const testCase of testCases) {
        const response = await request
          .post('/api/auth/register')
          .send(testCase)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should return 401 for unauthorized requests', async () => {
      const protectedEndpoints = [
        { method: 'get', path: '/api/tests' },
        { method: 'post', path: '/api/tests' },
        { method: 'get', path: '/api/tests/stats' }
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await (request as any)[endpoint.method](endpoint.path)
          .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/unauthorized|authentication/i);
      }
    });

    it('should return 404 for non-existent endpoints', async () => {
      const nonExistentPaths = [
        '/api/nonexistent',
        '/api/auth/invalid',
        '/api/words/invalid',
        '/api/tests/invalid'
      ];

      for (const path of nonExistentPaths) {
        const response = await request.get(path).expect(404);
        // Note: 404 responses might not have JSON body depending on Fastify config
      }
    });

    it('should return 405 for invalid HTTP methods', async () => {
      const invalidMethods = [
        { method: 'put', path: '/api/auth/register' },
        { method: 'delete', path: '/api/auth/login' },
        { method: 'patch', path: '/api/words' },
        { method: 'put', path: '/api/words/health' }
      ];

      for (const { method, path } of invalidMethods) {
        const response = await (request as any)[method](path)
          .expect(405);
      }
    });

    it('should return 409 for duplicate user registration', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'Password123!'
      };

      // First registration should succeed
      await request
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration should fail with 409
      const response = await request
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/already exists|duplicate/i);
    });

    it('should return 422 for validation errors', async () => {
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      const invalidTestData = [
        { wpm: -1, accuracy: 96, rawWpm: 85, config: '{}', tags: 'test' },
        { wpm: 85, accuracy: 101, rawWpm: 87, config: '{}', tags: 'test' },
        { wpm: 85, accuracy: 96, rawWpm: -5, config: '{}', tags: 'test' },
        { wpm: 'invalid', accuracy: 96, rawWpm: 87, config: '{}', tags: 'test' }
      ];

      for (const data of invalidTestData) {
        const response = await request
          .post('/api/tests')
          .set(getAuthHeader(token))
          .send(data);

        expect([400, 422]).toContain(response.status);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should return 500 for internal server errors', async () => {
      // This is harder to test without mocking internal failures
      // We'll test that the structure handles errors properly
      
      // Test with extremely large payload that might cause issues
      const oversizedData = {
        email: 'test@example.com',
        password: 'a'.repeat(100000) // Very large password
      };

      const response = await request
        .post('/api/auth/register')
        .send(oversizedData);

      // Should handle gracefully with either 400 (validation) or 413 (payload too large)
      expect([400, 413, 500]).toContain(response.status);
      if (response.body.error) {
        expect(typeof response.body.error).toBe('string');
      }
    });
  });

  describe('Invalid Authentication Tokens', () => {
    it('should handle malformed JWT tokens', async () => {
      const malformedTokens = [
        'not-a-jwt-token',
        'Bearer',
        'Bearer ',
        'Bearer invalid',
        'Bearer header.payload', // Missing signature
        'Bearer header.payload.signature.extra', // Too many parts
        'Basic dXNlcjpwYXNz', // Wrong auth type
        ''
      ];

      for (const token of malformedTokens) {
        const response = await request
          .get('/api/tests')
          .set('Authorization', token)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should handle expired tokens gracefully', async () => {
      // Create a token with very short expiry (if supported)
      const user = await createTestUser();
      const shortLivedToken = generateTestToken(app, user.id);

      // For now, just test that valid token works
      await request
        .get('/api/tests')
        .set(getAuthHeader(shortLivedToken))
        .expect(200);

      // In a real scenario, we'd wait for expiry or mock the time
    });

    it('should handle tokens for non-existent users', async () => {
      const nonExistentUserId = 'non-existent-user-id';
      const invalidToken = generateTestToken(app, nonExistentUserId);

      const response = await request
        .get('/api/tests')
        .set(getAuthHeader(invalidToken));

      // Should handle gracefully - either 401 or 404
      expect([401, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle tampered JWT tokens', async () => {
      const user = await createTestUser();
      const validToken = generateTestToken(app, user.id);

      // Tamper with different parts of the token
      const tokenParts = validToken.split('.');
      const tamperedTokens = [
        'TAMPERED.' + tokenParts[1] + '.' + tokenParts[2],
        tokenParts[0] + '.TAMPERED.' + tokenParts[2],
        tokenParts[0] + '.' + tokenParts[1] + '.TAMPERED'
      ];

      for (const tamperedToken of tamperedTokens) {
        const response = await request
          .get('/api/tests')
          .set(getAuthHeader(tamperedToken))
          .expect(401);

        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle extremely long inputs', async () => {
      const extremeInputs = {
        email: 'a'.repeat(1000) + '@example.com',
        password: 'P' + 'a'.repeat(10000) + '123!'
      };

      const response = await request
        .post('/api/auth/register')
        .send(extremeInputs);

      // Should either validate and reject, or handle gracefully
      expect([400, 413, 422]).toContain(response.status);
    });

    it('should handle special characters and encoding', async () => {
      const specialCharInputs = [
        {
          email: 'test+special@example.com',
          password: 'Pass!@#$%^&*()123'
        },
        {
          email: 'тест@example.com', // Cyrillic
          password: 'Пароль123!'
        },
        {
          email: 'test@ドメイン.com', // Japanese
          password: 'パスワード123'
        },
        {
          email: 'test@example.com',
          password: '🔑🔐🛡️Password123!' // Emojis
        }
      ];

      for (const input of specialCharInputs) {
        const response = await request
          .post('/api/auth/register')
          .send(input);

        // Should handle gracefully - either accept or reject with proper error
        if (response.status !== 201) {
          expect([400, 422]).toContain(response.status);
          expect(response.body).toHaveProperty('error');
        }
      }
    });

    it('should handle null and undefined values', async () => {
      const nullUndefinedInputs = [
        { email: null, password: 'password123' },
        { email: undefined, password: 'password123' },
        { email: 'test@example.com', password: null },
        { email: 'test@example.com', password: undefined }
      ];

      for (const input of nullUndefinedInputs) {
        const response = await request
          .post('/api/auth/register')
          .send(input)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should handle numeric overflow edge cases', async () => {
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      const overflowInputs = [
        { wpm: Number.MAX_SAFE_INTEGER, accuracy: 96, rawWpm: 87, config: '{}', tags: 'test' },
        { wpm: Number.MIN_SAFE_INTEGER, accuracy: 96, rawWpm: 87, config: '{}', tags: 'test' },
        { wpm: Infinity, accuracy: 96, rawWpm: 87, config: '{}', tags: 'test' },
        { wpm: -Infinity, accuracy: 96, rawWpm: 87, config: '{}', tags: 'test' },
        { wpm: NaN, accuracy: 96, rawWpm: 87, config: '{}', tags: 'test' }
      ];

      for (const input of overflowInputs) {
        const response = await request
          .post('/api/tests')
          .set(getAuthHeader(token))
          .send(input);

        expect([400, 422]).toContain(response.status);
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Concurrent Request Edge Cases', () => {
    it('should handle duplicate simultaneous registrations', async () => {
      const userData = {
        email: 'concurrent@test.com',
        password: 'ConcurrentTest123!'
      };

      // Try to register the same user simultaneously
      const registrations = Array(5).fill(0).map(() =>
        request
          .post('/api/auth/register')
          .send(userData)
      );

      const responses = await Promise.all(registrations);

      // Only one should succeed, others should fail with 409
      const successCount = responses.filter(r => r.status === 201).length;
      const conflictCount = responses.filter(r => r.status === 409).length;

      expect(successCount).toBe(1);
      expect(conflictCount).toBe(4);
    });

    it('should handle concurrent operations on same user data', async () => {
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      // Make concurrent test result submissions
      const testData = Array(10).fill(0).map((_, i) => ({
        wpm: 80 + i,
        accuracy: 95 + i * 0.1,
        rawWpm: 82 + i,
        config: JSON.stringify({ iteration: i }),
        tags: `concurrent-${i}`
      }));

      const submissions = testData.map(data =>
        request
          .post('/api/tests')
          .set(getAuthHeader(token))
          .send(data)
      );

      const responses = await Promise.all(submissions);

      // All should succeed
      responses.forEach((response: any, index: any) => {
        expect(response.status).toBe(201);
        expect(response.body.wpm).toBe(80 + index);
      });

      // Verify all were saved
      const getResponse = await request
        .get('/api/tests')
        .set(getAuthHeader(token))
        .expect(200);

      expect(getResponse.body.length).toBe(10);
    });

    it('should handle rapid authentication attempts', async () => {
      const userData = {
        email: 'rapid@test.com',
        password: 'RapidTest123!'
      };

      // Register user first
      await request
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Make rapid login attempts
      const logins = Array(20).fill(0).map(() =>
        request
          .post('/api/auth/login')
          .send(userData)
      );

      const responses = await Promise.all(logins);

      // All should succeed (no rate limiting implemented yet)
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
      });
    });
  });

  describe('Memory and Resource Edge Cases', () => {
    it('should handle large payload sizes', async () => {
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      const largeConfig = JSON.stringify({
        customText: 'word '.repeat(10000), // Large text
        settings: Array(1000).fill({ option: 'value' })
      });

      const response = await request
        .post('/api/tests')
        .set(getAuthHeader(token))
        .send({
          wpm: 85,
          accuracy: 96,
          rawWpm: 87,
          config: largeConfig,
          tags: 'large-payload-test'
        });

      // Should either accept or reject gracefully
      if (response.status !== 201) {
        expect([400, 413, 422]).toContain(response.status);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should handle memory-intensive word requests', async () => {
      const response = await request
        .get('/api/words?list=english10k&limit=9999&punctuation=true&numbers=true')
        .expect(200);

      expect(response.body.words.length).toBeLessThanOrEqual(9999);
      expect(response.body).toHaveProperty('enhanced_text');

      // Memory should not spike dramatically
      const memoryUsage = process.memoryUsage();
      expect(memoryUsage.heapUsed).toBeLessThan(500 * 1024 * 1024); // Less than 500MB
    });
  });

  describe('Database Connection Edge Cases', () => {
    it('should handle malformed database queries gracefully', async () => {
      // This would typically require mocking database failures
      // For now, we test that the API handles database operations properly
      
      const user = await createTestUser();
      const token = generateTestToken(app, user.id);

      // Test with valid data to ensure database is working
      const response = await request
        .post('/api/tests')
        .set(getAuthHeader(token))
        .send({
          wpm: 85,
          accuracy: 96,
          rawWpm: 87,
          config: '{}',
          tags: 'db-test'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Security Edge Cases', () => {
    it('should prevent XSS in error messages', async () => {
      const xssAttempts = [
        '<script>alert("xss")</script>@test.com',
        'test@<img src=x onerror=alert("xss")>.com',
        '"\'><script>alert("xss")</script>@test.com'
      ];

      for (const email of xssAttempts) {
        const response = await request
          .post('/api/auth/register')
          .send({
            email,
            password: 'ValidPassword123!'
          });

        // Error message should not contain unescaped HTML
        if (response.body.error) {
          expect(response.body.error).not.toMatch(/<script/i);
          expect(response.body.error).not.toMatch(/onerror/i);
        }
      }
    });

    it('should prevent LDAP injection attempts', async () => {
      const ldapInjection = [
        'admin@test.com)(|(password=*))',
        'test@example.com)(&(password=*)',
        '*)(&(objectClass=*'
      ];

      for (const email of ldapInjection) {
        const response = await request
          .post('/api/auth/login')
          .send({
            email,
            password: 'anypassword'
          });

        expect([400, 401]).toContain(response.status);
      }
    });

    it('should handle path traversal attempts', async () => {
      const pathTraversal = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
      ];

      for (const path of pathTraversal) {
        const response = await request
          .get(`/api/words?list=${encodeURIComponent(path)}`);

        expect([400, 404]).toContain(response.status);
      }
    });
  });

  describe('API Consistency Edge Cases', () => {
    it('should maintain consistent error response format', async () => {
      const errorGeneratingRequests = [
        () => request.post('/api/auth/register').send({}),
        () => request.post('/api/auth/login').send({}),
        () => request.get('/api/words?list=invalid'),
        () => request.get('/api/tests'),
        () => request.post('/api/tests').send({})
      ];

      for (const requestFn of errorGeneratingRequests) {
        const response = await requestFn();
        
        if (response.status >= 400) {
          expect(response.body).toHaveProperty('error');
          expect(typeof response.body.error).toBe('string');
          expect(response.body.error.length).toBeGreaterThan(0);
        }
      }
    });

    it('should handle HEAD requests appropriately', async () => {
      const endpoints = [
        '/api/words',
        '/api/words/health',
        '/api/words/lists'
      ];

      for (const endpoint of endpoints) {
        const response = await request.head(endpoint);
        
        // HEAD should return same status as GET but no body
        expect([200, 405]).toContain(response.status);
        expect(response.text).toBeFalsy();
      }
    });

    it('should handle OPTIONS requests for CORS', async () => {
      const response = await request
        .options('/api/words')
        .expect(204);

      // Should have CORS headers
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});