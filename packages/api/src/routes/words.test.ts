import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { wordsRoutes } from './words.js';

describe('Words API Integration Tests', () => {
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

  describe('GET /api/words', () => {
    it('should return words with default parameters', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty('words');
      expect(data).toHaveProperty('metadata');
      expect(Array.isArray(data.words)).toBe(true);
      expect(data.words.length).toBe(100); // Default limit
      expect(data.metadata.list).toBe('english1k'); // Default list
      expect(data.metadata.count).toBe(100);
      expect(data.metadata.total_available).toBeGreaterThan(0);
    });

    it('should return words for specific list type', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=python'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.body);
      expect(data.metadata.list).toBe('python');
      expect(data.words.length).toBe(100);
      expect(data.metadata.total_available).toBe(352);
    });

    it('should respect limit parameter', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=javascript&limit=25'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.body);
      expect(data.words.length).toBe(25);
      expect(data.metadata.count).toBe(25);
      expect(data.metadata.list).toBe('javascript');
    });

    it('should handle randomize parameter', async () => {
      const response1 = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=python&limit=50&randomize=false'
      });

      const response2 = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=python&limit=50&randomize=false'
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);

      const data1 = JSON.parse(response1.body);
      const data2 = JSON.parse(response2.body);

      // Non-randomized should return same order
      expect(data1.words).toEqual(data2.words);
    });

    it('should return different results when randomized', async () => {
      const response1 = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=english1k&limit=50&randomize=true'
      });

      const response2 = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=english1k&limit=50&randomize=true'
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);

      const data1 = JSON.parse(response1.body);
      const data2 = JSON.parse(response2.body);

      // Randomized should likely return different orders (with 50 from 1000+ words)
      expect(data1.words).not.toEqual(data2.words);
    });

    it('should handle zero limit', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=python&limit=0'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.body);
      expect(data.words.length).toBe(0);
      expect(data.metadata.count).toBe(0);
      expect(data.metadata.total_available).toBeGreaterThan(0);
    });

    it('should handle large limits efficiently', async () => {
      const start = Date.now();
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=english1k&limit=1000'
      });

      const duration = Date.now() - start;

      expect(response.statusCode).toBe(200);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
      
      const data = JSON.parse(response.body);
      expect(data.words.length).toBe(1000);
    });

    it('should return 400 for invalid list type', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=invalid'
      });

      expect(response.statusCode).toBe(400);
      
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty('error');
    });

    it('should return 400 for invalid limit', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?limit=abc'
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for negative limit', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?limit=-1'
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for limit exceeding maximum', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?limit=10001'
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle all supported word list types', async () => {
      const listTypes = ['english1k', 'english10k', 'javascript', 'python'];
      
      for (const listType of listTypes) {
        const response = await fastify.inject({
          method: 'GET',
          url: `/api/words?list=${listType}&limit=10`
        });

        expect(response.statusCode).toBe(200);
        
        const data = JSON.parse(response.body);
        expect(data.metadata.list).toBe(listType);
        expect(data.words.length).toBe(10);
      }
    });

    it('should validate response schema', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?list=python&limit=5'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.body);
      
      // Validate response structure
      expect(data).toHaveProperty('words');
      expect(data).toHaveProperty('metadata');
      expect(Array.isArray(data.words)).toBe(true);
      expect(typeof data.metadata).toBe('object');
      
      // Validate metadata structure
      expect(data.metadata).toHaveProperty('list');
      expect(data.metadata).toHaveProperty('count');
      expect(data.metadata).toHaveProperty('total_available');
      expect(typeof data.metadata.list).toBe('string');
      expect(typeof data.metadata.count).toBe('number');
      expect(typeof data.metadata.total_available).toBe('number');
      
      // Validate words are strings
      data.words.forEach((word: any) => {
        expect(typeof word).toBe('string');
        expect(word.length).toBeGreaterThan(0);
      });
    });
  });

  describe('GET /api/words/lists', () => {
    it('should return available word lists', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words/lists'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.body);
      expect(typeof data).toBe('object');
      expect(Object.keys(data)).toHaveLength(4);
      
      // Check required list types
      expect(data).toHaveProperty('english1k');
      expect(data).toHaveProperty('english10k');
      expect(data).toHaveProperty('javascript');
      expect(data).toHaveProperty('python');
    });

    it('should validate lists response schema', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words/lists'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.body);
      
      // Validate each list has required properties
      Object.values(data).forEach((list: any) => {
        expect(list).toHaveProperty('name');
        expect(list).toHaveProperty('description');
        expect(typeof list.name).toBe('string');
        expect(typeof list.description).toBe('string');
        expect(list.name.length).toBeGreaterThan(0);
        expect(list.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('GET /api/words/health', () => {
    it('should return health status', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words/health'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.body);
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('available_lists');
      expect(data).toHaveProperty('timestamp');
      expect(data.status).toBe('healthy');
      expect(data.available_lists).toBe(4);
      expect(typeof data.timestamp).toBe('string');
    });

    it('should validate health response schema', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words/health'
      });

      expect(response.statusCode).toBe(200);
      
      const data = JSON.parse(response.body);
      
      // Validate response structure
      expect(typeof data.status).toBe('string');
      expect(typeof data.available_lists).toBe('number');
      expect(typeof data.timestamp).toBe('string');
      
      // Validate timestamp is valid ISO string
      expect(() => new Date(data.timestamp)).not.toThrow();
      
      // Validate available_lists is positive
      expect(data.available_lists).toBeGreaterThan(0);
    });
  });

  describe('CORS and Headers', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await fastify.inject({
        method: 'OPTIONS',
        url: '/api/words',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET'
        }
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should include CORS headers in responses', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/words?limit=5',
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests efficiently', async () => {
      const start = Date.now();
      
      // Make 10 concurrent requests
      const promises = Array.from({ length: 10 }, () =>
        fastify.inject({
          method: 'GET',
          url: '/api/words?list=english1k&limit=100'
        })
      );

      const responses = await Promise.all(promises);
      const duration = Date.now() - start;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });

      // Should complete in reasonable time
      expect(duration).toBeLessThan(2000);
    });

    it('should handle rapid sequential requests', async () => {
      const start = Date.now();
      
      // Make 5 rapid sequential requests
      for (let i = 0; i < 5; i++) {
        const response = await fastify.inject({
          method: 'GET',
          url: '/api/words?list=python&limit=50'
        });
        expect(response.statusCode).toBe(200);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
  });
});