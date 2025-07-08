import Fastify from 'fastify';
import { authRoutes } from './routes/auth.js';
import { testRoutes } from './routes/tests.js';
import { aiRoutes } from './routes/ai.js';
import { wordsRoutes } from './routes/words.js';
import { settingsRoutes } from './routes/settings.js';

const fastify = Fastify({
  logger: true
});

const start = async () => {
  try {
    // Register Swagger documentation
    await fastify.register(import('@fastify/swagger'), {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'TypeAmp API',
          description: 'REST API for TypeAmp typing game application',
          version: '1.0.0',
          contact: {
            name: 'TypeAmp Development Team',
            email: 'dev@typeamp.com'
          }
        },
        servers: [
          {
            url: 'http://localhost:8080',
            description: 'Development server'
          },
          {
            url: 'https://api.typeamp.com',
            description: 'Production server'
          }
        ],
        tags: [
          { name: 'words', description: 'Word list operations' },
          { name: 'auth', description: 'Authentication operations' },
          { name: 'ai', description: 'AI-powered features' },
          { name: 'tests', description: 'Typing test operations' },
          { name: 'settings', description: 'User settings and preferences' }
        ]
      }
    });

    // Register Swagger UI
    await fastify.register(import('@fastify/swagger-ui'), {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      },
      uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
      transformSpecificationClone: true
    });

    // Register CORS plugin
    await fastify.register(import('@fastify/cors'), {
      origin: ['http://localhost:3000', 'http://localhost:3002'], // Allow Next.js dev server ports
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    });

    // Register JWT plugin
    await fastify.register(import('@fastify/jwt'), {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    });

    // Register routes
    await fastify.register(authRoutes);
    await fastify.register(testRoutes);
    await fastify.register(aiRoutes);
    await fastify.register(wordsRoutes);
    await fastify.register(settingsRoutes);

    // Health check routes
    fastify.get('/', async (request, reply) => {
      return { status: 'ok' };
    });
    
    fastify.get('/health', async (request, reply) => {
      return { status: 'ok' };
    });

    const port = process.env.API_PORT ? parseInt(process.env.API_PORT) : 8080;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();