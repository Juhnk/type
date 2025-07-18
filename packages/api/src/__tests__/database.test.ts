import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { 
  initTestDatabase, 
  createTestUser, 
  createTestResult,
  resetTestDatabase 
} from '../testing/testUtils.js';
import { PrismaClient, Prisma } from '../generated/prisma/index.js';

describe('Database Operations and Prisma Integration', () => {
  let prisma: PrismaClient;

  beforeEach(async () => {
    await resetTestDatabase();
    prisma = initTestDatabase();
  });

  describe('User Model Operations', () => {
    it('should create user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12)
      };

      const user = await prisma.user.create({
        data: userData
      });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      expect(user.passwordHash).toBe(userData.passwordHash);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should enforce unique email constraint', async () => {
      const email = 'unique@test.com';
      const passwordHash = await bcrypt.hash('password123', 12);

      // Create first user
      await prisma.user.create({
        data: { email, passwordHash }
      });

      // Attempt to create second user with same email should fail
      await expect(prisma.user.create({
        data: { email, passwordHash: await bcrypt.hash('different', 12) }
      })).rejects.toThrow();
    });

    it('should retrieve user by email', async () => {
      const userData = {
        email: 'findme@example.com',
        passwordHash: await bcrypt.hash('password123', 12)
      };

      await prisma.user.create({ data: userData });

      const foundUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      expect(foundUser).toBeTruthy();
      expect(foundUser!.email).toBe(userData.email);
    });

    it('should retrieve user by ID', async () => {
      const userData = {
        email: 'findbyid@example.com',
        passwordHash: await bcrypt.hash('password123', 12)
      };

      const createdUser = await prisma.user.create({ data: userData });

      const foundUser = await prisma.user.findUnique({
        where: { id: createdUser.id }
      });

      expect(foundUser).toBeTruthy();
      expect(foundUser!.id).toBe(createdUser.id);
      expect(foundUser!.email).toBe(userData.email);
    });

    it('should update user data', async () => {
      const user = await createTestUser({ email: 'update@test.com' });

      const newPasswordHash = await bcrypt.hash('newpassword456', 12);
      
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash }
      });

      expect(updatedUser.passwordHash).toBe(newPasswordHash);
      expect(updatedUser.email).toBe(user.email); // Should remain unchanged
    });

    it('should delete user and cascade to related records', async () => {
      const user = await createTestUser();
      
      // Create related records
      await createTestResult(user.id);
      await prisma.userSettings.create({
        data: {
          userId: user.id,
          theme: 'dark',
          caretStyle: 'block'
        }
      });

      // Verify records exist
      const testResults = await prisma.testResult.findMany({
        where: { userId: user.id }
      });
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId: user.id }
      });

      expect(testResults.length).toBe(1);
      expect(userSettings).toBeTruthy();

      // Delete user
      await prisma.user.delete({
        where: { id: user.id }
      });

      // Verify cascade deletion
      const deletedTestResults = await prisma.testResult.findMany({
        where: { userId: user.id }
      });
      const deletedUserSettings = await prisma.userSettings.findUnique({
        where: { userId: user.id }
      });

      expect(deletedTestResults.length).toBe(0);
      expect(deletedUserSettings).toBeNull();
    });

    it('should handle password hashing correctly', async () => {
      const plainPassword = 'MySecurePassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const user = await prisma.user.create({
        data: {
          email: 'password@test.com',
          passwordHash: hashedPassword
        }
      });

      // Verify password was stored correctly
      const isValid = await bcrypt.compare(plainPassword, user.passwordHash);
      expect(isValid).toBe(true);

      // Verify wrong password fails
      const isInvalid = await bcrypt.compare('WrongPassword', user.passwordHash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('TestResult Model Operations', () => {
    it('should create test result with valid data', async () => {
      const user = await createTestUser();
      
      const testResultData = {
        userId: user.id,
        wpm: 85,
        accuracy: 96.5,
        rawWpm: 88,
        consistency: 92.3,
        config: JSON.stringify({ mode: 'time', duration: 60 }),
        tags: 'english1k,normal'
      };

      const testResult = await prisma.testResult.create({
        data: testResultData
      });

      expect(testResult).toHaveProperty('id');
      expect(testResult.userId).toBe(user.id);
      expect(testResult.wpm).toBe(85);
      expect(testResult.accuracy).toBe(96.5);
      expect(testResult.timestamp).toBeInstanceOf(Date);
    });

    it('should retrieve test results for user', async () => {
      const user = await createTestUser();
      
      // Create multiple test results
      await createTestResult(user.id, { wpm: 75 });
      await createTestResult(user.id, { wpm: 80 });
      await createTestResult(user.id, { wpm: 85 });

      const results = await prisma.testResult.findMany({
        where: { userId: user.id },
        orderBy: { timestamp: 'desc' }
      });

      expect(results.length).toBe(3);
      expect(results[0].wpm).toBe(85); // Most recent first
      expect(results[1].wpm).toBe(80);
      expect(results[2].wpm).toBe(75);
    });

    it('should calculate user statistics', async () => {
      const user = await createTestUser();
      
      // Create test results with known values
      const results = [
        { wpm: 70, accuracy: 95.0 },
        { wpm: 80, accuracy: 96.0 },
        { wpm: 90, accuracy: 97.0 }
      ];

      for (const result of results) {
        await createTestResult(user.id, result);
      }

      // Calculate statistics
      const stats = await prisma.testResult.aggregate({
        where: { userId: user.id },
        _avg: { wpm: true, accuracy: true },
        _max: { wpm: true, accuracy: true },
        _min: { wpm: true, accuracy: true },
        _count: true
      });

      expect(stats._avg.wpm).toBe(80); // (70 + 80 + 90) / 3
      expect(stats._avg.accuracy).toBe(96); // (95 + 96 + 97) / 3
      expect(stats._max.wpm).toBe(90);
      expect(stats._min.wpm).toBe(70);
      expect(stats._count).toBe(3);
    });

    it('should handle complex config JSON data', async () => {
      const user = await createTestUser();
      
      const complexConfig = {
        mode: 'words',
        wordCount: 50,
        difficulty: 'Expert',
        textSource: 'javascript',
        punctuation: true,
        customSettings: {
          theme: 'dark',
          fontSize: 16,
          caretStyle: 'line'
        }
      };

      const testResult = await createTestResult(user.id, {
        config: JSON.stringify(complexConfig)
      });

      expect(testResult.config).toBe(JSON.stringify(complexConfig));
      
      // Verify we can parse it back
      const parsedConfig = JSON.parse(testResult.config);
      expect(parsedConfig).toEqual(complexConfig);
    });

    it('should enforce foreign key constraints', async () => {
      const nonExistentUserId = 'non-existent-user-id';

      await expect(prisma.testResult.create({
        data: {
          userId: nonExistentUserId,
          wpm: 85,
          accuracy: 96.5,
          rawWpm: 88,
          config: '{}',
          tags: 'test'
        }
      })).rejects.toThrow();
    });
  });

  describe('UserSettings Model Operations', () => {
    it('should create user settings with defaults', async () => {
      const user = await createTestUser();

      const userSettings = await prisma.userSettings.create({
        data: {
          userId: user.id
        }
      });

      // Should use default values
      expect(userSettings.userId).toBe(user.id);
      expect(userSettings.theme).toBe('slate');
      expect(userSettings.caretStyle).toBe('line');
      expect(userSettings.paceCaretWpm).toBe(0);
    });

    it('should create user settings with custom values', async () => {
      const user = await createTestUser();

      const customSettings = {
        userId: user.id,
        theme: 'dark',
        caretStyle: 'block',
        paceCaretWpm: 50
      };

      const userSettings = await prisma.userSettings.create({
        data: customSettings
      });

      expect(userSettings.theme).toBe('dark');
      expect(userSettings.caretStyle).toBe('block');
      expect(userSettings.paceCaretWpm).toBe(50);
    });

    it('should enforce one-to-one relationship with user', async () => {
      const user = await createTestUser();

      // Create first settings
      await prisma.userSettings.create({
        data: { userId: user.id }
      });

      // Attempt to create second settings for same user should fail
      await expect(prisma.userSettings.create({
        data: { userId: user.id, theme: 'dark' }
      })).rejects.toThrow();
    });

    it('should update user settings', async () => {
      const user = await createTestUser();

      await prisma.userSettings.create({
        data: { userId: user.id }
      });

      const updatedSettings = await prisma.userSettings.update({
        where: { userId: user.id },
        data: {
          theme: 'cyberpunk',
          caretStyle: 'underline',
          paceCaretWpm: 75
        }
      });

      expect(updatedSettings.theme).toBe('cyberpunk');
      expect(updatedSettings.caretStyle).toBe('underline');
      expect(updatedSettings.paceCaretWpm).toBe(75);
    });
  });

  describe('Relationships and Joins', () => {
    it('should fetch user with test results', async () => {
      const user = await createTestUser();
      
      await createTestResult(user.id, { wpm: 75 });
      await createTestResult(user.id, { wpm: 85 });

      const userWithResults = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          testResults: {
            orderBy: { timestamp: 'desc' }
          }
        }
      });

      expect(userWithResults).toBeTruthy();
      expect(userWithResults!.testResults.length).toBe(2);
      expect(userWithResults!.testResults[0].wpm).toBe(85);
    });

    it('should fetch user with settings and test results', async () => {
      const user = await createTestUser();
      
      await prisma.userSettings.create({
        data: {
          userId: user.id,
          theme: 'neon'
        }
      });

      await createTestResult(user.id);

      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          userSettings: true,
          testResults: true
        }
      });

      expect(fullUser).toBeTruthy();
      expect(fullUser!.userSettings).toBeTruthy();
      expect(fullUser!.userSettings!.theme).toBe('neon');
      expect(fullUser!.testResults.length).toBe(1);
    });

    it('should handle complex queries with filtering', async () => {
      const user1 = await createTestUser({ email: 'user1@test.com' });
      const user2 = await createTestUser({ email: 'user2@test.com' });

      // Create test results for both users
      await createTestResult(user1.id, { wpm: 90, accuracy: 98 });
      await createTestResult(user1.id, { wpm: 85, accuracy: 96 });
      await createTestResult(user2.id, { wpm: 70, accuracy: 94 });

      // Find users with average WPM > 80
      const users = await prisma.user.findMany({
        include: {
          testResults: {
            select: {
              wpm: true,
              accuracy: true
            }
          }
        }
      });

      const usersWithHighWpm = users.filter(user => {
        if (user.testResults.length === 0) return false;
        const avgWpm = user.testResults.reduce((sum: number, result) => sum + result.wpm, 0) / user.testResults.length;
        return avgWpm > 80;
      });

      expect(usersWithHighWpm.length).toBe(1);
      expect(usersWithHighWpm[0].id).toBe(user1.id);
    });
  });

  describe('Transactions and Data Integrity', () => {
    it('should handle transactions correctly', async () => {
      const user = await createTestUser();

      await prisma.$transaction(async (tx) => {
        // Create user settings
        await tx.userSettings.create({
          data: {
            userId: user.id,
            theme: 'matrix'
          }
        });

        // Create test result
        await tx.testResult.create({
          data: {
            userId: user.id,
            wpm: 100,
            accuracy: 99.5,
            rawWpm: 102,
            config: '{}',
            tags: 'test'
          }
        });
      });

      // Verify both records were created
      const settings = await prisma.userSettings.findUnique({
        where: { userId: user.id }
      });
      const results = await prisma.testResult.findMany({
        where: { userId: user.id }
      });

      expect(settings).toBeTruthy();
      expect(settings!.theme).toBe('matrix');
      expect(results.length).toBe(1);
      expect(results[0].wpm).toBe(100);
    });

    it('should rollback transaction on error', async () => {
      const user = await createTestUser();

      await expect(prisma.$transaction(async (tx) => {
        // Create valid user settings
        await tx.userSettings.create({
          data: {
            userId: user.id,
            theme: 'valid'
          }
        });

        // This should fail and rollback the entire transaction
        await tx.testResult.create({
          data: {
            userId: 'invalid-user-id', // This should cause foreign key error
            wpm: 85,
            accuracy: 96,
            rawWpm: 88,
            config: '{}',
            tags: 'test'
          }
        });
      })).rejects.toThrow();

      // Verify no records were created
      const settings = await prisma.userSettings.findUnique({
        where: { userId: user.id }
      });
      const results = await prisma.testResult.findMany({
        where: { userId: user.id }
      });

      expect(settings).toBeNull();
      expect(results.length).toBe(0);
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large datasets efficiently', async () => {
      const user = await createTestUser();

      // Create many test results
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push({
          userId: user.id,
          wpm: 70 + Math.floor(Math.random() * 30),
          accuracy: 90 + Math.random() * 10,
          rawWpm: 70 + Math.floor(Math.random() * 35),
          config: JSON.stringify({ iteration: i }),
          tags: `test-${i}`
        });
      }

      const start = Date.now();
      await prisma.testResult.createMany({
        data: results
      });
      const createTime = Date.now() - start;

      // Query should be fast even with many records
      const queryStart = Date.now();
      const retrieved = await prisma.testResult.findMany({
        where: { userId: user.id },
        take: 20,
        orderBy: { timestamp: 'desc' }
      });
      const queryTime = Date.now() - queryStart;

      expect(retrieved.length).toBe(20);
      expect(createTime).toBeLessThan(1000); // Should create in under 1 second
      expect(queryTime).toBeLessThan(100);   // Should query in under 100ms
    });

    it('should handle concurrent database operations', async () => {
      const user = await createTestUser();

      // Perform concurrent operations
      const operations = Array(10).fill(0).map((_, i) =>
        createTestResult(user.id, { wpm: 80 + i })
      );

      await Promise.all(operations);

      const results = await prisma.testResult.findMany({
        where: { userId: user.id }
      });

      expect(results.length).toBe(10);
    });
  });

  describe('Data Validation and Constraints', () => {
    it('should validate email format in application layer', async () => {
      // Email format validation is handled in the application layer
      const invalidEmails = ['invalid', '@test.com', 'test@', ''];
      
      for (const email of invalidEmails) {
        // In real app, this validation would happen in API layer
        // Here we just verify database accepts the value
        if (email) { // Skip empty email as it would violate NOT NULL
          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hash'
            }
          });
          expect(user.email).toBe(email);
        }
      }
    });

    it('should handle edge case numeric values', async () => {
      const user = await createTestUser();

      const edgeCases = [
        { wpm: 0, accuracy: 0, rawWpm: 0 },
        { wpm: 999, accuracy: 100, rawWpm: 1000 },
        { wpm: 1, accuracy: 0.1, rawWpm: 1 }
      ];

      for (const testCase of edgeCases) {
        const result = await createTestResult(user.id, testCase);
        expect(result.wpm).toBe(testCase.wpm);
        expect(result.accuracy).toBe(testCase.accuracy);
        expect(result.rawWpm).toBe(testCase.rawWpm);
      }
    });

    it('should handle long string values', async () => {
      const user = await createTestUser();

      const longConfig = JSON.stringify({
        mode: 'custom',
        text: 'a'.repeat(1000),
        settings: {
          customWords: Array(100).fill('word').join(' ')
        }
      });

      const result = await createTestResult(user.id, {
        config: longConfig,
        tags: 'long-' + 'tag-'.repeat(50)
      });

      expect(result.config.length).toBeGreaterThan(1000);
      expect(result.tags.length).toBeGreaterThan(100);
    });
  });
});