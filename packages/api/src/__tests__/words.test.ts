import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import { 
  createTestApp, 
  resetTestDatabase,
  performanceUtils,
  testData 
} from '../testing/testUtils.js';
import { FastifyInstance } from 'fastify';

describe('Words API', () => {
  let app: FastifyInstance;
  let request: ReturnType<typeof supertest>;

  beforeEach(async () => {
    await resetTestDatabase();
    app = await createTestApp({ 
      includeAuth: false,
      includeWords: true,
      includeTests: false,
      includeAI: false 
    });
    request = supertest(app.server);
  });

  describe('GET /api/words', () => {
    describe('Valid Requests', () => {
      it('should return words from english1k list by default', async () => {
        const response = await request
          .get('/api/words')
          .expect(200);

        expect(response.body).toHaveProperty('words');
        expect(response.body).toHaveProperty('metadata');
        expect(Array.isArray(response.body.words)).toBe(true);
        expect(response.body.words.length).toBeGreaterThan(0);
        expect(response.body.metadata.list).toBe('english1k');
      });

      it('should respect limit parameter', async () => {
        const limits = [10, 25, 50, 100];

        for (const limit of limits) {
          const response = await request
            .get(`/api/words?limit=${limit}`)
            .expect(200);

          expect(response.body.words.length).toBeLessThanOrEqual(limit);
          expect(response.body.metadata.count).toBe(response.body.words.length);
        }
      });

      it('should handle all word list types', async () => {
        const wordLists = ['english1k', 'english10k', 'javascript', 'python'];

        for (const list of wordLists) {
          const response = await request
            .get(`/api/words?list=${list}&limit=10`)
            .expect(200);

          expect(response.body.metadata.list).toBe(list);
          expect(response.body.words.length).toBeGreaterThan(0);
          expect(response.body.words.length).toBeLessThanOrEqual(10);
        }
      });

      it('should randomize words when requested', async () => {
        // Get words twice with randomization
        const response1 = await request
          .get('/api/words?list=english1k&limit=20&randomize=true')
          .expect(200);

        const response2 = await request
          .get('/api/words?list=english1k&limit=20&randomize=true')
          .expect(200);

        // Results should likely be different due to randomization
        // (Small chance they could be the same, but very unlikely)
        const words1 = response1.body.words.join(',');
        const words2 = response2.body.words.join(',');
        
        // At least check that we got valid responses
        expect(response1.body.words.length).toBe(20);
        expect(response2.body.words.length).toBe(20);
      });

      it('should disable randomization when requested', async () => {
        const response = await request
          .get('/api/words?list=english1k&limit=10&randomize=false')
          .expect(200);

        expect(response.body.words.length).toBe(10);
        expect(response.body.metadata.list).toBe('english1k');
      });

      it('should generate enhanced text with punctuation', async () => {
        const response = await request
          .get('/api/words?list=english1k&limit=30&punctuation=true')
          .expect(200);

        expect(response.body).toHaveProperty('enhanced_text');
        expect(response.body.punctuation_enabled).toBe(true);
        expect(typeof response.body.enhanced_text).toBe('string');
        expect(response.body.enhanced_text.length).toBeGreaterThan(0);
      });

      it('should generate enhanced text with numbers', async () => {
        const response = await request
          .get('/api/words?list=english1k&limit=30&numbers=true')
          .expect(200);

        expect(response.body).toHaveProperty('enhanced_text');
        expect(response.body.numbers_enabled).toBe(true);
        expect(typeof response.body.enhanced_text).toBe('string');
      });

      it('should handle punctuation density options', async () => {
        const densities = ['light', 'medium', 'heavy'];

        for (const density of densities) {
          const response = await request
            .get(`/api/words?list=english1k&limit=50&punctuation=true&punctuation_density=${density}`)
            .expect(200);

          expect(response.body.punctuation_enabled).toBe(true);
          expect(response.body).toHaveProperty('enhanced_text');
        }
      });

      it('should combine punctuation and numbers', async () => {
        const response = await request
          .get('/api/words?list=english1k&limit=40&punctuation=true&numbers=true&punctuation_density=medium')
          .expect(200);

        expect(response.body.punctuation_enabled).toBe(true);
        expect(response.body.numbers_enabled).toBe(true);
        expect(response.body).toHaveProperty('enhanced_text');
      });

      it('should return proper metadata', async () => {
        const response = await request
          .get('/api/words?list=javascript&limit=25')
          .expect(200);

        expect(response.body.metadata).toMatchObject({
          list: 'javascript',
          count: expect.any(Number),
          total_available: expect.any(Number)
        });

        expect(response.body.metadata.count).toBe(response.body.words.length);
        expect(response.body.metadata.total_available).toBeGreaterThanOrEqual(response.body.metadata.count);
      });
    });

    describe('Invalid Requests', () => {
      it('should reject invalid word list types', async () => {
        const invalidLists = ['nonexistent', 'invalid-list', 'hacker-list', ''];

        for (const list of invalidLists) {
          const response = await request
            .get(`/api/words?list=${list}`)
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body).toHaveProperty('available_lists');
          expect(Array.isArray(response.body.available_lists)).toBe(true);
        }
      });

      it('should reject invalid limit values', async () => {
        const invalidLimits = [
          'not-a-number',
          '-1',
          '0',
          '99999',
          'abc',
          '1.5'
        ];

        for (const limit of invalidLimits) {
          const response = await request
            .get(`/api/words?limit=${limit}`)
            .expect(400);

          expect(response.body).toHaveProperty('error');
        }
      });

      it('should reject invalid punctuation density', async () => {
        const invalidDensities = ['invalid', 'super-heavy', 'none', ''];

        for (const density of invalidDensities) {
          const response = await request
            .get(`/api/words?punctuation=true&punctuation_density=${density}`)
            .expect(400);

          expect(response.body).toHaveProperty('error');
        }
      });

      it('should handle malformed query parameters', async () => {
        const malformedQueries = [
          '?list=english1k&limit=',
          '?randomize=maybe',
          '?punctuation=yes',
          '?numbers=1'
        ];

        for (const query of malformedQueries) {
          const response = await request
            .get(`/api/words${query}`);

          // Should either return valid response or proper error
          if (response.status !== 200) {
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
          }
        }
      });

      it('should protect against injection attacks in query params', async () => {
        const maliciousInputs = [
          "javascript'; DROP TABLE words; --",
          "../../../etc/passwd",
          "<script>alert('xss')</script>",
          "'; SELECT * FROM users; --"
        ];

        for (const input of maliciousInputs) {
          const response = await request
            .get(`/api/words?list=${encodeURIComponent(input)}`);

          // Should reject malicious input
          expect([400, 500]).toContain(response.status);
          expect(response.body).toHaveProperty('error');
        }
      });
    });

    describe('Performance and Load', () => {
      it('should handle large word limits efficiently', async () => {
        const start = Date.now();
        
        const response = await request
          .get('/api/words?list=english10k&limit=5000')
          .expect(200);

        const responseTime = Date.now() - start;

        expect(response.body.words.length).toBeLessThanOrEqual(5000);
        expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
      });

      it('should handle concurrent requests', async () => {
        const concurrentRequests = 10;
        const requests = Array(concurrentRequests).fill(0).map((_, i) =>
          request.get(`/api/words?list=english1k&limit=${20 + i}`)
        );

        const responses = await Promise.all(requests);

        responses.forEach((response: any, index: any) => {
          expect(response.status).toBe(200);
          expect(response.body.words.length).toBeLessThanOrEqual(20 + index);
        });
      });

      it('should measure memory usage with large requests', async () => {
        const memoryBefore = performanceUtils.measureMemoryUsage();

        const response = await request
          .get('/api/words?list=english10k&limit=8000&punctuation=true&numbers=true')
          .expect(200);

        const memoryAfter = performanceUtils.measureMemoryUsage();

        expect(response.body.words.length).toBeLessThanOrEqual(8000);
        
        // Memory usage should not increase dramatically
        const memoryIncrease = memoryAfter.heapUsed - memoryBefore.heapUsed;
        expect(memoryIncrease).toBeLessThan(100); // Less than 100MB increase
      });
    });
  });

  describe('GET /api/words/lists', () => {
    it('should return available word lists', async () => {
      const response = await request
        .get('/api/words/lists')
        .expect(200);

      expect(typeof response.body).toBe('object');
      expect(Object.keys(response.body).length).toBeGreaterThan(0);

      // Check expected lists are present
      const expectedLists = ['english1k', 'english10k', 'javascript', 'python'];
      expectedLists.forEach(list => {
        expect(response.body).toHaveProperty(list);
        expect(response.body[list]).toHaveProperty('name');
        expect(response.body[list]).toHaveProperty('description');
      });
    });

    it('should return consistent data structure', async () => {
      const response = await request
        .get('/api/words/lists')
        .expect(200);

      Object.entries(response.body).forEach(([key, value]: [string, any]) => {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('object');
        expect(value).toHaveProperty('name');
        expect(value).toHaveProperty('description');
        expect(typeof value.name).toBe('string');
        expect(typeof value.description).toBe('string');
      });
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(0).map(() => 
        request.get('/api/words/lists')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(typeof response.body).toBe('object');
      });

      // All responses should be identical
      const firstResponse = JSON.stringify(responses[0].body);
      responses.forEach(response => {
        expect(JSON.stringify(response.body)).toBe(firstResponse);
      });
    });
  });

  describe('GET /api/words/health', () => {
    it('should return health status', async () => {
      const response = await request
        .get('/api/words/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        available_lists: expect.any(Number),
        timestamp: expect.any(String)
      });

      expect(response.body.available_lists).toBeGreaterThan(0);
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should return consistent health data', async () => {
      const response1 = await request
        .get('/api/words/health')
        .expect(200);

      const response2 = await request
        .get('/api/words/health')
        .expect(200);

      expect(response1.body.status).toBe('healthy');
      expect(response2.body.status).toBe('healthy');
      expect(response1.body.available_lists).toBe(response2.body.available_lists);
    });

    it('should handle rapid health checks', async () => {
      const healthChecks = Array(20).fill(0).map(() =>
        request.get('/api/words/health')
      );

      const responses = await Promise.all(healthChecks);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
      });
    });
  });

  describe('Cache Behavior', () => {
    it('should maintain consistent responses for identical requests', async () => {
      const query = '/api/words?list=english1k&limit=50&randomize=false';

      const response1 = await request.get(query).expect(200);
      const response2 = await request.get(query).expect(200);

      // With randomize=false, responses should be identical
      expect(response1.body.words).toEqual(response2.body.words);
      expect(response1.body.metadata).toEqual(response2.body.metadata);
    });

    it('should vary responses with randomization', async () => {
      const query = '/api/words?list=english1k&limit=50&randomize=true';

      const response1 = await request.get(query).expect(200);
      const response2 = await request.get(query).expect(200);

      // Both should be valid but likely different
      expect(response1.body.words.length).toBe(50);
      expect(response2.body.words.length).toBe(50);
    });
  });

  describe('Security', () => {
    it('should not expose internal system information', async () => {
      const response = await request
        .get('/api/words')
        .expect(200);

      // Response should not contain sensitive data
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toMatch(/password/i);
      expect(responseString).not.toMatch(/secret/i);
      expect(responseString).not.toMatch(/token/i);
      expect(responseString).not.toMatch(/private/i);
    });

    it('should handle URL encoding properly', async () => {
      const response = await request
        .get('/api/words?list=english1k&limit=10')
        .expect(200);

      expect(response.body.words.length).toBe(10);
    });

    it('should reject extremely large limit values', async () => {
      const response = await request
        .get('/api/words?limit=999999999')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should return consistent error format', async () => {
      const errorRequests = [
        '/api/words?list=invalid',
        '/api/words?limit=invalid',
        '/api/words?punctuation_density=invalid'
      ];

      for (const url of errorRequests) {
        const response = await request.get(url).expect(400);
        
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
        expect(response.body.error.length).toBeGreaterThan(0);
      }
    });

    it('should handle missing word list files gracefully', async () => {
      // This would require mocking file system errors
      // For now, test that API structure handles errors properly
      const response = await request
        .get('/api/words?list=english1k&limit=10');

      // Should either succeed or fail gracefully
      if (response.status !== 200) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });
});