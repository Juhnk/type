import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

interface RegisterBody {
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
}