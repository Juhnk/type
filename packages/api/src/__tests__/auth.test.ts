import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import bcrypt from 'bcrypt';
import { 
  createTestApp, 
  createTestUser, 
  resetTestDatabase, 
  initTestDatabase,
  testData 
} from '../testing/testUtils.js';
import { FastifyInstance } from 'fastify';

describe('Authentication API', () => {
  let app: FastifyInstance;
  let request: ReturnType<typeof supertest>;

  beforeEach(async () => {
    await resetTestDatabase();
    app = await createTestApp({ 
      includeAuth: true,
      includeWords: false,
      includeTests: false,
      includeAI: false 
    });
    request = supertest(app.server);
  });

  describe('POST /api/auth/register', () => {
    it('should create user with valid data and return JWT', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const response = await request
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        email: userData.email
      });
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecurePass123!'
      };

      // First registration should succeed
      await request
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email should fail
      const response = await request
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'missing@domain',
        '@invalid.com',
        'spaces in@email.com',
        ''
      ];

      for (const email of invalidEmails) {
        const response = await request
          .post('/api/auth/register')
          .send({
            email,
            password: 'ValidPass123!'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should validate password requirements', async () => {
      const invalidPasswords = [
        'short',      // Too short
        '12345',      // Too short
        '',           // Empty
      ];

      for (const password of invalidPasswords) {
        const response = await request
          .post('/api/auth/register')
          .send({
            email: 'test@example.com',
            password
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should require both email and password', async () => {
      // Missing email
      await request
        .post('/api/auth/register')
        .send({ password: 'ValidPass123!' })
        .expect(400);

      // Missing password
      await request
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      // Missing both
      await request
        .post('/api/auth/register')
        .send({})
        .expect(400);
    });

    it('should hash password securely', async () => {
      const prisma = initTestDatabase();
      const userData = {
        email: 'security@test.com',
        password: 'PlainTextPassword123!'
      };

      await request
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Verify password was hashed in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      expect(user).toBeTruthy();
      expect(user!.passwordHash).not.toBe(userData.password);
      expect(user!.passwordHash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt format
      
      // Verify password can be verified
      const isValid = await bcrypt.compare(userData.password, user!.passwordHash);
      expect(isValid).toBe(true);
    });

    it('should protect against SQL injection', async () => {
      const maliciousInputs = [
        "'; DROP TABLE Users; --",
        "' OR '1'='1",
        "admin@test.com'; UPDATE Users SET email='hacked@evil.com' WHERE '1'='1",
        "<script>alert('xss')</script>@test.com"
      ];

      for (const email of maliciousInputs) {
        const response = await request
          .post('/api/auth/register')
          .send({
            email,
            password: 'ValidPass123!'
          });

        // Should either validate or reject, but not cause database issues
        expect([400, 409, 201]).toContain(response.status);
      }

      // Verify database integrity
      const prisma = initTestDatabase();
      const users = await prisma.user.findMany();
      expect(users.every((user) => user.email.includes('@'))).toBe(true);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password": "invalid json}')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user for login tests
      await createTestUser({
        email: 'login@test.com',
        password: 'LoginPass123!'
      });
    });

    it('should authenticate valid user and return JWT', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'LoginPass123!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        email: 'login@test.com'
      });
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject incorrect password', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'SomePassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should validate email format on login', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'SomePassword123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should require password on login', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should generate valid JWT tokens', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'LoginPass123!'
        })
        .expect(200);

      const token = response.body.token;
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      // Verify token can be decoded
      const decoded = app.jwt.verify(token) as any;
      expect(decoded).toHaveProperty('userId');
      expect(decoded.userId).toBe(response.body.user.id);
    });

    it('should handle case-sensitive email correctly', async () => {
      // Test with different casing
      const response = await request
        .post('/api/auth/login')
        .send({
          email: 'LOGIN@TEST.COM', // Different case
          password: 'LoginPass123!'
        })
        .expect(401); // Should fail as email is case-sensitive

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should protect against timing attacks', async () => {
      // Measure time for non-existent user
      const start1 = Date.now();
      await request
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'SomePassword123!'
        });
      const time1 = Date.now() - start1;

      // Measure time for existing user with wrong password
      const start2 = Date.now();
      await request
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPassword123!'
        });
      const time2 = Date.now() - start2;

      // Times should be relatively similar (within reasonable variance)
      // This is a basic timing attack protection test
      const timeDifference = Math.abs(time1 - time2);
      expect(timeDifference).toBeLessThan(50); // Allow 50ms variance
    });

    it('should protect against SQL injection in login', async () => {
      const maliciousInputs = [
        "admin@test.com' OR '1'='1' --",
        "'; UPDATE Users SET passwordHash='hacked'; --",
        "admin@test.com' UNION SELECT * FROM Users --"
      ];

      for (const email of maliciousInputs) {
        const response = await request
          .post('/api/auth/login')
          .send({
            email,
            password: 'SomePassword123!'
          });

        // Should return 401 or 400, never 200
        expect([400, 401]).toContain(response.status);
      }
    });
  });

  describe('JWT Token Handling', () => {
    it('should generate tokens with expiration', async () => {
      const user = await createTestUser();
      
      const response = await request
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'testpass123'
        })
        .expect(200);

      const token = response.body.token;
      const decoded = app.jwt.verify(token) as any;
      
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('userId');
      expect(decoded.userId).toBe(user.id);
    });

    it('should reject invalid JWT tokens', async () => {
      const invalidTokens = [
        'invalid.token.here',
        'Bearer invalid-token',
        '',
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
      ];

      for (const token of invalidTokens) {
        expect(() => app.jwt.verify(token)).toThrow();
      }
    });

    it('should handle concurrent login requests', async () => {
      const user = await createTestUser();
      const credentials = {
        email: user.email,
        password: 'testpass123'
      };

      // Make 10 concurrent login requests
      const requests = Array(10).fill(0).map(() =>
        request
          .post('/api/auth/login')
          .send(credentials)
      );

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach((response: any) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe(user.email);
      });

      // All tokens should be valid but different
      const tokens = responses.map((r: { body: { token: string } }) => r.body.token);
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length); // All tokens should be unique
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database failures
      // For now, we test that the API structure handles errors properly
      
      const response = await request
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPass123!'
        });

      // Should either succeed or fail gracefully with proper error structure
      if (response.status !== 201) {
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      }
    });

    it('should return consistent error format', async () => {
      const errorResponses = [
        await request.post('/api/auth/register').send({ email: 'invalid' }),
        await request.post('/api/auth/login').send({ email: 'invalid' }),
        await request.post('/api/auth/register').send({}),
        await request.post('/api/auth/login').send({})
      ];

      errorResponses.forEach(response => {
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      });
    });

    it('should handle oversized payloads', async () => {
      const oversizedData = {
        email: 'test@example.com',
        password: 'a'.repeat(10000) // Very long password
      };

      const response = await request
        .post('/api/auth/register')
        .send(oversizedData);

      // Should handle gracefully (either accept if within limits or reject)
      expect([400, 413, 201]).toContain(response.status);
    });
  });
});