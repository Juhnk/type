import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';

interface TestResultInput {
  wpm: number;
  accuracy: number;
  rawWpm: number;
  consistency?: number;
  config: object;
  tags: string[];
  timestamp?: string;
}

interface SingleTestBody {
  testResult: TestResultInput;
}

interface BulkTestBody {
  testResults: TestResultInput[];
}

export async function testRoutes(fastify: FastifyInstance) {
  // Add authentication hook for all routes in this file
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Authentication required' });
    }
  });

  // Get user's test history endpoint
  fastify.get(
    '/api/me/tests',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                wpm: { type: 'number' },
                accuracy: { type: 'number' },
                rawWpm: { type: 'number' },
                consistency: { type: 'number' },
                config: { type: 'object' },
                tags: { type: 'array', items: { type: 'string' } },
                timestamp: { type: 'string' }
              }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request.user as { userId: string }).userId;

        const testResults = await prisma.testResult.findMany({
          where: {
            userId: userId
          },
          orderBy: {
            timestamp: 'desc'
          }
        });

        return reply.status(200).send(testResults);
      } catch (error) {
        fastify.log.error('Get test history error:', error);
        return reply.status(400).send({ error: 'Failed to retrieve test history' });
      }
    }
  );

  // Single test result endpoint
  fastify.post<{ Body: SingleTestBody }>(
    '/api/me/tests',
    {
      schema: {
        body: {
          type: 'object',
          required: ['testResult'],
          properties: {
            testResult: {
              type: 'object',
              required: ['wpm', 'accuracy', 'rawWpm', 'config', 'tags'],
              properties: {
                wpm: { type: 'number', minimum: 0 },
                accuracy: { type: 'number', minimum: 0, maximum: 100 },
                rawWpm: { type: 'number', minimum: 0 },
                consistency: { type: 'number', minimum: 0, maximum: 100 },
                config: { type: 'object' },
                tags: { type: 'array', items: { type: 'string' } },
                timestamp: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              wpm: { type: 'number' },
              accuracy: { type: 'number' },
              rawWpm: { type: 'number' },
              consistency: { type: 'number' },
              config: { type: 'object' },
              tags: { type: 'array', items: { type: 'string' } },
              timestamp: { type: 'string' }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: SingleTestBody }>, reply: FastifyReply) => {
      try {
        const { testResult } = request.body;
        const userId = (request.user as { userId: string }).userId;

        const savedTestResult = await prisma.testResult.create({
          data: {
            userId,
            wpm: testResult.wpm,
            accuracy: testResult.accuracy,
            rawWpm: testResult.rawWpm,
            consistency: testResult.consistency || null,
            config: testResult.config,
            tags: testResult.tags,
            timestamp: testResult.timestamp ? new Date(testResult.timestamp) : new Date()
          }
        });

        return reply.status(201).send(savedTestResult);
      } catch (error) {
        fastify.log.error('Single test save error:', error);
        return reply.status(400).send({ error: 'Failed to save test result' });
      }
    }
  );

  // Bulk test results endpoint
  fastify.post<{ Body: BulkTestBody }>(
    '/api/me/tests/bulk',
    {
      schema: {
        body: {
          type: 'object',
          required: ['testResults'],
          properties: {
            testResults: {
              type: 'array',
              minItems: 1,
              maxItems: 100, // Reasonable limit for bulk operations
              items: {
                type: 'object',
                required: ['wpm', 'accuracy', 'rawWpm', 'config', 'tags'],
                properties: {
                  wpm: { type: 'number', minimum: 0 },
                  accuracy: { type: 'number', minimum: 0, maximum: 100 },
                  rawWpm: { type: 'number', minimum: 0 },
                  consistency: { type: 'number', minimum: 0, maximum: 100 },
                  config: { type: 'object' },
                  tags: { type: 'array', items: { type: 'string' } },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              count: { type: 'number' },
              message: { type: 'string' }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: BulkTestBody }>, reply: FastifyReply) => {
      try {
        const { testResults } = request.body;
        const userId = (request.user as { userId: string }).userId;

        // Prepare data for bulk insert
        const testResultsData = testResults.map((testResult: TestResultInput) => ({
          userId,
          wpm: testResult.wpm,
          accuracy: testResult.accuracy,
          rawWpm: testResult.rawWpm,
          consistency: testResult.consistency || null,
          config: testResult.config,
          tags: testResult.tags,
          timestamp: testResult.timestamp ? new Date(testResult.timestamp) : new Date()
        }));

        const result = await prisma.testResult.createMany({
          data: testResultsData,
          skipDuplicates: false
        });

        return reply.status(201).send({
          count: result.count,
          message: `Successfully saved ${result.count} test results`
        });
      } catch (error) {
        fastify.log.error('Bulk test save error:', error);
        return reply.status(400).send({ error: 'Failed to save test results' });
      }
    }
  );
}