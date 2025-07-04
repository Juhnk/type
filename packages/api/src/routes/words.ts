import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  getWords, 
  getAvailableWordLists, 
  isValidWordListType, 
  validateLimit,
  WordListType,
  WordsResponse,
  WordsError,
  AVAILABLE_WORD_LISTS
} from '../lib/wordService.js';

// Query parameters interface for GET /api/words
interface WordsQuery {
  list?: string;
  limit?: string;
  randomize?: string;
}

// Schema for the words endpoint
const wordsQuerySchema = {
  type: 'object',
  properties: {
    list: { 
      type: 'string', 
      enum: Object.keys(AVAILABLE_WORD_LISTS),
      description: 'Word list type to retrieve'
    },
    limit: { 
      type: 'string', 
      pattern: '^[0-9]+$',
      description: 'Maximum number of words to return (default: 100, max: 10000)'
    },
    randomize: { 
      type: 'string', 
      enum: ['true', 'false'],
      description: 'Whether to randomize word order (default: true)'
    }
  },
  additionalProperties: false
};

const wordsResponseSchema = {
  200: {
    type: 'object',
    properties: {
      words: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of words from the requested list'
      },
      metadata: {
        type: 'object',
        properties: {
          list: { 
            type: 'string',
            description: 'Word list type that was returned'
          },
          count: { 
            type: 'number',
            description: 'Number of words returned'
          },
          total_available: { 
            type: 'number',
            description: 'Total number of words available in this list'
          }
        },
        required: ['list', 'count', 'total_available']
      }
    },
    required: ['words', 'metadata']
  },
  400: {
    type: 'object',
    properties: {
      error: { type: 'string' },
      available_lists: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    required: ['error']
  },
  500: {
    type: 'object',
    properties: {
      error: { type: 'string' }
    },
    required: ['error']
  }
};

export async function wordsRoutes(fastify: FastifyInstance) {
  // GET /api/words - Main endpoint for retrieving word lists
  fastify.get<{ Querystring: WordsQuery }>(
    '/api/words',
    {
      schema: {
        description: 'Get words from specified word list for typing practice',
        tags: ['words'],
        querystring: wordsQuerySchema,
        response: wordsResponseSchema
      }
    },
    async (request: FastifyRequest<{ Querystring: WordsQuery }>, reply: FastifyReply) => {
      try {
        const { list = 'english1k', limit: limitStr, randomize: randomizeStr } = request.query;
        
        // Validate word list type
        if (!isValidWordListType(list)) {
          const errorResponse: WordsError = {
            error: `Invalid word list type: ${list}. Available types: ${Object.keys(AVAILABLE_WORD_LISTS).join(', ')}`,
            available_lists: Object.keys(AVAILABLE_WORD_LISTS) as WordListType[]
          };
          return reply.status(400).send(errorResponse);
        }
        
        // Validate and parse limit
        let limit: number;
        try {
          limit = validateLimit(limitStr);
        } catch (error) {
          const errorResponse: WordsError = {
            error: error instanceof Error ? error.message : 'Invalid limit parameter',
            available_lists: Object.keys(AVAILABLE_WORD_LISTS) as WordListType[]
          };
          return reply.status(400).send(errorResponse);
        }
        
        // Parse randomize parameter (default: true)
        const randomize = randomizeStr !== 'false';
        
        // Get words
        const wordsResponse: WordsResponse = getWords(list, limit, randomize);
        
        // Log successful request
        fastify.log.info({
          list,
          limit,
          randomize,
          returned_count: wordsResponse.words.length
        }, 'Words API request processed successfully');
        
        return reply.status(200).send(wordsResponse);
        
      } catch (error) {
        // Log error
        fastify.log.error(error, 'Words API error');
        
        // Return generic error response
        return reply.status(500).send({
          error: 'Internal server error while retrieving words'
        });
      }
    }
  );
  
  // GET /api/words/lists - Get available word lists information
  fastify.get(
    '/api/words/lists',
    {
      schema: {
        description: 'Get information about available word lists',
        tags: ['words'],
        response: {
          200: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' }
              },
              required: ['name', 'description']
            }
          }
        }
      }
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const availableLists = getAvailableWordLists();
        
        fastify.log.info('Available word lists requested');
        
        return reply.status(200).send(availableLists);
        
      } catch (error) {
        fastify.log.error(error, 'Error retrieving available word lists');
        
        return reply.status(500).send({
          error: 'Internal server error while retrieving available word lists'
        });
      }
    }
  );
  
  // GET /api/words/health - Health check endpoint for words service
  fastify.get(
    '/api/words/health',
    {
      schema: {
        description: 'Health check for words service',
        tags: ['words'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              available_lists: { type: 'number' },
              timestamp: { type: 'string' }
            },
            required: ['status', 'available_lists', 'timestamp']
          }
        }
      }
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const availableLists = getAvailableWordLists();
        
        return reply.status(200).send({
          status: 'healthy',
          available_lists: Object.keys(availableLists).length,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        fastify.log.error(error, 'Words service health check failed');
        
        return reply.status(500).send({
          status: 'unhealthy',
          error: 'Words service is not functioning properly'
        });
      }
    }
  );
}