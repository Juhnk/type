import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { wordsRoutes } from '../routes/words.js';

describe('Error Scenario Testing', () => {
  let fastify: any;

  beforeAll(async () => {
    fastify = Fastify({ logger: false });
    
    // Register CORS plugin
    await fastify.register(import('@fastify/cors'), {
      origin: ['http://localhost:3000', 'http://localhost:3002'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    });

    // Register words routes
    await fastify.register(wordsRoutes);
    
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('Invalid Query Parameters', () => {
    it('should return 400 for invalid list parameter', async () => {
      const invalidLists = ['invalid', 'english', 'java', 'cpp', 'rust', ''];
      
      for (const invalidList of invalidLists) {
        const response = await fastify.inject({
          method: 'GET',
          url: `/api/words?list=${invalidList}`
        });

        expect(response.statusCode).toBe(400);
        
        const data = JSON.parse(response.body);
        expect(data).toHaveProperty('error');
        expect(typeof data.error).toBe('string');
      }
    });

    it('should return 400 for invalid limit parameter values', async () => {
      const invalidLimits = ['abc', 'null', 'undefined', 'NaN', '12.5.3', 'Infinity'];
      
      for (const invalidLimit of invalidLimits) {
        const response = await fastify.inject({
          method: 'GET',
          url: `/api/words?limit=${invalidLimit}`
        });

        expect(response.statusCode).toBe(400);
      }
    });

    it('should return 400 for negative limit values', async () => {
      const negativeLimits = ['-1', '-100', '-0.5'];
      
      for (const negativeLimit of negativeLimits) {
        const response = await fastify.inject({
          method: 'GET',
          url: `/api/words?limit=${negativeLimit}`
        });

        expect(response.statusCode).toBe(400);
      }
    });

    it('should return 400 for limits exceeding maximum', async () => {
      const excessiveLimits = ['10001', '50000', '999999'];
      
      for (const excessiveLimit of excessiveLimits) {
        const response = await fastify.inject({
          method: 'GET',
          url: `/api/words?limit=${excessiveLimit}`
        });

        expect(response.statusCode).toBe(400);
      }
    });

    it('should return 400 for invalid randomize parameter', async () => {
      const invalidRandomize = ['maybe', '1', '0', 'yes', 'no'];
      
      for (const invalidRand of invalidRandomize) {
        const response = await fastify.inject({
          method: 'GET',
          url: `/api/words?randomize=${invalidRand}`
        });

        expect(response.statusCode).toBe(400);
      }
    });

    it('should handle multiple invalid parameters', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=invalid&limit=abc&randomize=maybe'
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle malformed query strings', async () => {
      const malformedUrls = [
        '/api/words?list=',
        '/api/words?limit=',
        '/api/words?randomize=',
        '/api/words?list&limit&randomize',
        '/api/words?list=english1k&=&limit=100'
      ];
      
      for (const url of malformedUrls) {
        const response = await fastify.inject({
          method: 'GET',
          url
        });

        // Should either return 400 or handle gracefully
        expect([200, 400].includes(response.statusCode)).toBe(true);
      }
    });
  });

  describe('HTTP Method Validation', () => {
    it('should return 404 for unsupported methods on /api/words', async () => {
      const unsupportedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of unsupportedMethods) {
        const response = await fastify.inject({
          method,
          url: '/api/words'
        });

        expect(response.statusCode).toBe(404);
      }
    });

    it('should return 404 for unsupported methods on /api/words/lists', async () => {
      const unsupportedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of unsupportedMethods) {
        const response = await fastify.inject({
          method,
          url: '/api/words/lists'
        });

        expect(response.statusCode).toBe(404);
      }
    });

    it('should return 404 for unsupported methods on /api/words/health', async () => {
      const unsupportedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of unsupportedMethods) {
        const response = await fastify.inject({
          method,
          url: '/api/words/health'
        });

        expect(response.statusCode).toBe(404);
      }
    });
  });

  describe('Invalid Endpoints', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const invalidEndpoints = [
        '/api/words/invalid',
        '/api/words/lists/invalid',
        '/api/words/health/invalid',
        '/api/words/data',
        '/api/words/config',
        '/api/word', // singular
        '/api/wordlists'
      ];
      
      for (const endpoint of invalidEndpoints) {
        const response = await fastify.inject({
          method: 'GET',
          url: endpoint
        });

        expect(response.statusCode).toBe(404);
      }
    });

    it('should handle case sensitivity correctly', async () => {
      const caseSensitiveUrls = [
        '/API/words',
        '/api/WORDS',
        '/api/Words',
        '/api/words/LISTS',
        '/api/words/Lists',
        '/api/words/HEALTH',
        '/api/words/Health'
      ];
      
      for (const url of caseSensitiveUrls) {
        const response = await fastify.inject({
          method: 'GET',
          url
        });

        expect(response.statusCode).toBe(404);
      }
    });
  });

  describe('Malformed Requests', () => {
    it('should handle requests with invalid headers', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words',
        headers: {
          'Content-Type': 'invalid/type',
          'Accept': 'invalid/accept',
          'User-Agent': '\x00\x01\x02' // Invalid characters
        }
      });

      // Should handle gracefully, either 200 or proper error
      expect([200, 400, 406].includes(response.statusCode)).toBe(true);
    });

    it('should handle extremely long query parameters', async () => {
      const longValue = 'a'.repeat(10000);
      
      const response = await fastify.inject({
        method: 'GET',
        url: `/api/words?list=${longValue}`
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle special characters in query parameters', async () => {
      const specialChars = ['%', '&', '=', '#', '?', ' ', '+', '<', '>'];
      
      for (const char of specialChars) {
        const response = await fastify.inject({
          method: 'GET',
          url: `/api/words?list=${encodeURIComponent(char)}`
        });

        expect(response.statusCode).toBe(400);
      }
    });

    it('should handle Unicode characters in query parameters', async () => {
      const unicodeChars = ['🚀', '中文', 'العربية', 'русский'];
      
      for (const char of unicodeChars) {
        const response = await fastify.inject({
          method: 'GET',
          url: `/api/words?list=${encodeURIComponent(char)}`
        });

        expect(response.statusCode).toBe(400);
      }
    });
  });

  describe('Rate Limiting and Load Testing', () => {
    it('should handle rapid successive requests', async () => {
      const requests = Array.from({ length: 50 }, (_, i) =>
        fastify.inject({
          method: 'GET',
          url: `/api/words?list=python&limit=${Math.min(i + 1, 100)}`
        })
      );

      const responses = await Promise.all(requests);
      
      // All requests should succeed (no rate limiting implemented)
      responses.forEach(response => {
        expect([200, 429].includes(response.statusCode)).toBe(true);
      });
    });

    it('should handle concurrent requests with different parameters', async () => {
      const lists = ['english1k', 'english10k', 'javascript', 'python'];
      const limits = [10, 50, 100, 200];
      const randomize = [true, false];
      
      const requests = [];
      for (let i = 0; i < 20; i++) {
        const list = lists[i % lists.length];
        const limit = limits[i % limits.length];
        const rand = randomize[i % randomize.length];
        
        requests.push(
          fastify.inject({
            method: 'GET',
            url: `/api/words?list=${list}&limit=${limit}&randomize=${rand}`
          })
        );
      }

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
        
        const data = JSON.parse(response.body);
        expect(data).toHaveProperty('words');
        expect(data).toHaveProperty('metadata');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary limit values', async () => {
      // Test with limits that don't exceed available words
      const testCases = [
        { limit: '0', expectedCount: 0 },
        { limit: '1', expectedCount: 1 },
        { limit: '1000', expectedCount: 1000, list: 'english1k' }
      ];
      
      for (const testCase of testCases) {
        const url = testCase.list 
          ? `/api/words?list=${testCase.list}&limit=${testCase.limit}`
          : `/api/words?limit=${testCase.limit}`;
          
        const response = await fastify.inject({
          method: 'GET',
          url
        });

        expect(response.statusCode).toBe(200);
        
        const data = JSON.parse(response.body);
        expect(data.words.length).toBe(testCase.expectedCount);
      }
    });

    it('should handle empty query parameters gracefully', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.body);
      expect(data.metadata.list).toBe('english1k'); // Default
      expect(data.words.length).toBe(100); // Default limit
    });

    it('should handle duplicate query parameters', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=python&list=javascript&limit=10&limit=20'
      });

      // Should handle gracefully, taking last value or first value
      expect([200, 400].includes(response.statusCode)).toBe(true);
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection attempts', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE words; --",
        "' OR '1'='1",
        "'; SELECT * FROM users; --",
        "' UNION SELECT password FROM users --"
      ];
      
      for (const injection of sqlInjectionAttempts) {
        const response = await fastify.inject({
          method: 'GET',
          url: `/api/words?list=${encodeURIComponent(injection)}`
        });

        expect(response.statusCode).toBe(400);
      }
    });

    it('should prevent XSS attempts', async () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert(document.cookie)</script>'
      ];
      
      for (const xss of xssAttempts) {
        const response = await fastify.inject({
          method: 'GET',
          url: `/api/words?list=${encodeURIComponent(xss)}`
        });

        expect(response.statusCode).toBe(400);
        
        // Ensure response doesn't contain unescaped XSS payload
        expect(response.body).not.toContain('<script>');
        expect(response.body).not.toContain('javascript:');
      }
    });

    it('should prevent path traversal attempts', async () => {
      const pathTraversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
      ];
      
      for (const traversal of pathTraversalAttempts) {
        const response = await fastify.inject({
          method: 'GET',
          url: `/api/words?list=${encodeURIComponent(traversal)}`
        });

        expect(response.statusCode).toBe(400);
      }
    });
  });

  describe('Response Validation', () => {
    it('should ensure all error responses have proper structure', async () => {
      const errorCases = [
        { url: '/api/words?list=invalid', expectedStatus: 400 },
        { url: '/api/words?limit=abc', expectedStatus: 400 },
        { url: '/api/words?limit=-1', expectedStatus: 400 },
        { url: '/api/words/invalid', expectedStatus: 404 }
      ];
      
      for (const testCase of errorCases) {
        const response = await fastify.inject({
          method: 'GET',
          url: testCase.url
        });

        expect(response.statusCode).toBe(testCase.expectedStatus);
        
        const data = JSON.parse(response.body);
        expect(data).toHaveProperty('error');
        expect(typeof data.error).toBe('string');
        expect(data.error.length).toBeGreaterThan(0);
      }
    });

    it('should ensure consistent error message format', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=invalid'
      });

      expect(response.statusCode).toBe(400);
      
      const data = JSON.parse(response.body);
      expect(data.error).toBeTruthy();
      expect(typeof data.error).toBe('string');
    });
  });
});