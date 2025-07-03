import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

interface RegisterBody {
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: RegisterBody }>(
    '/api/auth/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  createdAt: { type: 'string' }
                }
              },
              token: { type: 'string' }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          409: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
      try {
        const { email, password } = request.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          return reply.status(409).send({ error: 'User with this email already exists' });
        }

        // Hash the password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = await prisma.user.create({
          data: {
            email,
            passwordHash
          },
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        });

        // Generate JWT token
        const token = fastify.jwt.sign({ userId: user.id });

        return reply.status(201).send({
          user,
          token
        });
      } catch (error) {
        fastify.log.error('Registration error:', error);
        return reply.status(400).send({ error: 'Registration failed' });
      }
    }
  );

  // Login endpoint
  fastify.post<{ Body: LoginBody }>(
    '/api/auth/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  createdAt: { type: 'string' }
                }
              },
              token: { type: 'string' }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      try {
        const { email, password } = request.body;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            createdAt: true
          }
        });

        // If user not found, return invalid credentials error
        if (!user) {
          return reply.status(401).send({ error: 'Invalid credentials' });
        }

        // Compare provided password with stored hash
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        // If password doesn't match, return invalid credentials error
        if (!isValidPassword) {
          return reply.status(401).send({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = fastify.jwt.sign({ userId: user.id });

        // Return user (without password hash) and token
        return reply.status(200).send({
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt
          },
          token
        });
      } catch (error) {
        fastify.log.error('Login error:', error);
        return reply.status(400).send({ error: 'Login failed' });
      }
    }
  );
}