import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import { 
  createTestApp, 
  resetTestDatabase
} from '../testing/testUtils.js';
import { FastifyInstance } from 'fastify';

describe('Basic API Tests', () => {
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

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('Words API (Basic)', () => {
    it('should return words with default parameters', async () => {
      const response = await request
        .get('/api/words')
        .expect(200);

      expect(response.body).toHaveProperty('words');
      expect(response.body).toHaveProperty('metadata');
      expect(Array.isArray(response.body.words)).toBe(true);
      expect(response.body.words.length).toBeGreaterThan(0);
    });

    it('should return available word lists', async () => {
      const response = await request
        .get('/api/words/lists')
        .expect(200);

      expect(typeof response.body).toBe('object');
      expect(Object.keys(response.body).length).toBeGreaterThan(0);
    });

    it('should return health status for words service', async () => {
      const response = await request
        .get('/api/words/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
    });
  });
});