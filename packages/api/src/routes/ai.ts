import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Anthropic from '@anthropic-ai/sdk';

interface GenerateChallengeBody {
  prompt: string;
}

export async function aiRoutes(fastify: FastifyInstance) {
  // Add authentication hook for all routes in this file
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Authentication required' });
    }
  });

  // Generate typing challenge endpoint
  fastify.post<{ Body: GenerateChallengeBody }>(
    '/api/generate-challenge',
    {
      schema: {
        body: {
          type: 'object',
          required: ['prompt'],
          properties: {
            prompt: { 
              type: 'string', 
              minLength: 1,
              maxLength: 200,
              description: 'The topic or theme for the typing challenge'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              text: { type: 'string' }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: GenerateChallengeBody }>, reply: FastifyReply) => {
      try {
        const { prompt } = request.body;
        
        // Check for API key
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          fastify.log.error('ANTHROPIC_API_KEY is not configured');
          return reply.status(500).send({ error: 'AI service is not configured' });
        }

        // Initialize Anthropic client
        const anthropic = new Anthropic({
          apiKey: apiKey,
        });

        // Construct the system prompt for high-quality typing content
        const systemPrompt = `You are an expert content generator for a typing practice application. Your task is to generate a single, well-written paragraph that is exactly 30-60 words long. The content should be:

1. Practical and informative
2. Written in clear, natural language
3. Free of errors, special formatting, or unusual punctuation
4. Suitable for typing practice
5. Engaging and educational

Generate content based on the user's topic. Do not include any introductory phrases, titles, or explanations. Output only the paragraph itself.`;

        // Call Anthropic API
        const response = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 150,
          temperature: 0.7,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: `Generate a typing practice paragraph about: ${prompt}`
            }
          ]
        });

        // Extract the generated text
        const generatedText = response.content[0].type === 'text' 
          ? response.content[0].text.trim()
          : '';

        if (!generatedText) {
          throw new Error('No text was generated');
        }

        return reply.status(200).send({ text: generatedText });
      } catch (error) {
        fastify.log.error('AI generation error:', error);
        
        // Handle specific Anthropic API errors
        if (error instanceof Anthropic.APIError) {
          if (error.status === 401) {
            return reply.status(500).send({ error: 'AI service authentication failed' });
          } else if (error.status === 429) {
            return reply.status(429).send({ error: 'AI service rate limit exceeded' });
          }
        }
        
        return reply.status(500).send({ error: 'Failed to generate typing challenge' });
      }
    }
  );
}