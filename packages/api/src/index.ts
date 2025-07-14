// Load environment variables before anything else
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try loading .env from multiple possible locations
const possiblePaths = [
  join(__dirname, '../.env'),  // packages/api/.env
  join(__dirname, '../../.env'), // packages/.env
  join(__dirname, '../../../.env'), // root .env
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  const result = config({ path: envPath });
  if (!result.error) {
    console.log(`[ENV] Successfully loaded environment variables from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.error('[ENV] Warning: No .env file found in any expected location');
}

// Log critical environment variables (without exposing full values)
console.log('[ENV] ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 
  `${process.env.ANTHROPIC_API_KEY.substring(0, 20)}...` : 'NOT SET');

// Validate critical environment variables
const requiredEnvVars = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'JWT_SECRET': process.env.JWT_SECRET,
  'API_PORT': process.env.API_PORT,
  'API_HOST': process.env.API_HOST
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([name, value]) => !value)
  .map(([name]) => name);

if (missingVars.length > 0) {
  console.error('[ENV] Missing required environment variables:', missingVars.join(', '));
  console.error('[ENV] Please check your .env file');
  process.exit(1);
}

// Warn about optional but important variables
if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
  console.warn('[ENV] Warning: ANTHROPIC_API_KEY is not configured. AI features will be disabled.');
}

// Now import other modules after environment is loaded
import Fastify from 'fastify';
import { authRoutes } from './routes/auth.js';
import { testRoutes } from './routes/tests.js';
import { aiRoutes } from './routes/ai.js';
import { wordsRoutes } from './routes/words.js';
import { settingsRoutes } from './routes/settings.js';
import quotesRoutes from './routes/quotes.js';
import { SERVER_CONFIG, SECURITY_CONFIG } from './config/app.config.js';

const fastify = Fastify({
  logger: true,
  bodyLimit: 1048576 // 1MB limit for request body
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
            url: SERVER_CONFIG.devServerUrl,
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
          { name: 'settings', description: 'User settings and preferences' },
          { name: 'quotes', description: 'Famous quotes operations' }
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
      origin: SERVER_CONFIG.corsOrigins, // Allow configured origins
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    });

    // Register JWT plugin
    await fastify.register(import('@fastify/jwt'), {
      secret: SECURITY_CONFIG.jwtSecret
    });

    // Register routes
    await fastify.register(authRoutes);
    await fastify.register(testRoutes);
    await fastify.register(aiRoutes);
    await fastify.register(wordsRoutes);
    await fastify.register(settingsRoutes);
    await fastify.register(quotesRoutes, { prefix: '/api/quotes' });

    // Health check routes
    fastify.get('/', async (request, reply) => {
      return { status: 'ok' };
    });
    
    fastify.get('/health', async (request, reply) => {
      return { status: 'ok' };
    });

    const port = SERVER_CONFIG.port;
    const host = SERVER_CONFIG.host;
    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();