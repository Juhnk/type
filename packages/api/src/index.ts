import Fastify from 'fastify';
import { authRoutes } from './routes/auth.js';
import { testRoutes } from './routes/tests.js';

const fastify = Fastify({
  logger: true
});

const start = async () => {
  try {
    // Register JWT plugin
    await fastify.register(import('@fastify/jwt'), {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    });

    // Register routes
    await fastify.register(authRoutes);
    await fastify.register(testRoutes);

    // Health check route
    fastify.get('/', async (request, reply) => {
      return { status: 'ok' };
    });

    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server listening on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();