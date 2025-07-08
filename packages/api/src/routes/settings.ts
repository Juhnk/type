import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';

interface SettingsBody {
  // Appearance Settings
  theme?: string;
  font?: string;
  fontSize?: number;
  caretStyle?: string;
  caretColor?: string;
  colorScheme?: string;
  animations?: boolean;
  smoothCaret?: boolean;
  showWpmCounter?: boolean;
  showAccuracyCounter?: boolean;
  
  // Behavior Settings
  soundEffects?: boolean;
  keyFeedback?: boolean;
  defaultMode?: string;
  defaultDifficulty?: string;
  defaultDuration?: number;
  defaultWordCount?: number;
  paceCaretWpm?: number;
  paceCaretEnabled?: boolean;
  autoSave?: boolean;
  focusMode?: boolean;
  quickRestart?: boolean;
  blindMode?: boolean;
}

export async function settingsRoutes(fastify: FastifyInstance) {
  // Add authentication hook for all routes
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Authentication required' });
    }
  });

  // Get user settings
  fastify.get(
    '/api/me/settings',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              // Appearance
              theme: { type: 'string' },
              font: { type: 'string' },
              fontSize: { type: 'number' },
              caretStyle: { type: 'string' },
              caretColor: { type: 'string' },
              colorScheme: { type: 'string' },
              animations: { type: 'boolean' },
              smoothCaret: { type: 'boolean' },
              showWpmCounter: { type: 'boolean' },
              showAccuracyCounter: { type: 'boolean' },
              // Behavior
              soundEffects: { type: 'boolean' },
              keyFeedback: { type: 'boolean' },
              defaultMode: { type: 'string' },
              defaultDifficulty: { type: 'string' },
              defaultDuration: { type: 'number' },
              defaultWordCount: { type: 'number' },
              paceCaretWpm: { type: 'number' },
              paceCaretEnabled: { type: 'boolean' },
              autoSave: { type: 'boolean' },
              focusMode: { type: 'boolean' },
              quickRestart: { type: 'boolean' },
              blindMode: { type: 'boolean' },
              // Timestamps
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          },
          404: {
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

        let settings = await prisma.userSettings.findUnique({
          where: { userId }
        });

        if (!settings) {
          // Create default settings if they don't exist
          settings = await prisma.userSettings.create({
            data: { userId }
          });
        }

        return reply.status(200).send(settings);
      } catch (error) {
        fastify.log.error('Get settings error:', error);
        return reply.status(500).send({ error: 'Failed to retrieve settings' });
      }
    }
  );

  // Update user settings
  fastify.put<{ Body: SettingsBody }>(
    '/api/me/settings',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            // Appearance validations
            theme: { 
              type: 'string',
              enum: ['slate', 'dark', 'nord', 'dracula', 'monokai', 'ocean']
            },
            font: { 
              type: 'string',
              enum: ['Roboto Mono', 'Fira Code', 'Source Code Pro', 'JetBrains Mono', 'IBM Plex Mono', 'Cascadia Code']
            },
            fontSize: { type: 'number', minimum: 14, maximum: 24 },
            caretStyle: { type: 'string', enum: ['line', 'block', 'underline'] },
            caretColor: { 
              type: 'string',
              pattern: '^#[0-9a-fA-F]{6}$'
            },
            colorScheme: { type: 'string', enum: ['light', 'dark', 'auto'] },
            animations: { type: 'boolean' },
            smoothCaret: { type: 'boolean' },
            showWpmCounter: { type: 'boolean' },
            showAccuracyCounter: { type: 'boolean' },
            
            // Behavior validations
            soundEffects: { type: 'boolean' },
            keyFeedback: { type: 'boolean' },
            defaultMode: { type: 'string', enum: ['time', 'words', 'quote'] },
            defaultDifficulty: { type: 'string', enum: ['Normal', 'Expert', 'Master'] },
            defaultDuration: { type: 'number', minimum: 15, maximum: 300 },
            defaultWordCount: { type: 'number', enum: [10, 25, 50, 100] },
            paceCaretWpm: { type: 'number', minimum: 0, maximum: 200 },
            paceCaretEnabled: { type: 'boolean' },
            autoSave: { type: 'boolean' },
            focusMode: { type: 'boolean' },
            quickRestart: { type: 'boolean' },
            blindMode: { type: 'boolean' }
          },
          additionalProperties: false
        },
        response: {
          200: {
            type: 'object',
            properties: {
              // All fields from schema
              theme: { type: 'string' },
              font: { type: 'string' },
              fontSize: { type: 'number' },
              caretStyle: { type: 'string' },
              caretColor: { type: 'string' },
              colorScheme: { type: 'string' },
              animations: { type: 'boolean' },
              smoothCaret: { type: 'boolean' },
              showWpmCounter: { type: 'boolean' },
              showAccuracyCounter: { type: 'boolean' },
              soundEffects: { type: 'boolean' },
              keyFeedback: { type: 'boolean' },
              defaultMode: { type: 'string' },
              defaultDifficulty: { type: 'string' },
              defaultDuration: { type: 'number' },
              defaultWordCount: { type: 'number' },
              paceCaretWpm: { type: 'number' },
              paceCaretEnabled: { type: 'boolean' },
              autoSave: { type: 'boolean' },
              focusMode: { type: 'boolean' },
              quickRestart: { type: 'boolean' },
              blindMode: { type: 'boolean' },
              updatedAt: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: SettingsBody }>, reply: FastifyReply) => {
      try {
        const userId = (request.user as { userId: string }).userId;
        const updates = request.body;

        // Remove any undefined values
        const cleanedUpdates = Object.fromEntries(
          Object.entries(updates).filter(([_, value]) => value !== undefined)
        );

        // Update or create settings
        const settings = await prisma.userSettings.upsert({
          where: { userId },
          update: cleanedUpdates,
          create: {
            userId,
            ...cleanedUpdates
          }
        });

        return reply.status(200).send(settings);
      } catch (error) {
        fastify.log.error('Update settings error:', error);
        return reply.status(500).send({ error: 'Failed to update settings' });
      }
    }
  );

  // Reset settings to defaults
  fastify.delete(
    '/api/me/settings',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request.user as { userId: string }).userId;

        await prisma.userSettings.update({
          where: { userId },
          data: {
            // Reset all fields to their defaults
            theme: 'slate',
            font: 'Roboto Mono',
            fontSize: 18,
            caretStyle: 'line',
            caretColor: '#3b82f6',
            colorScheme: 'auto',
            animations: true,
            smoothCaret: true,
            showWpmCounter: true,
            showAccuracyCounter: true,
            soundEffects: false,
            keyFeedback: false,
            defaultMode: 'time',
            defaultDifficulty: 'Normal',
            defaultDuration: 60,
            defaultWordCount: 50,
            paceCaretWpm: 0,
            paceCaretEnabled: false,
            autoSave: true,
            focusMode: false,
            quickRestart: true,
            blindMode: false
          }
        });

        return reply.status(200).send({ message: 'Settings reset to defaults' });
      } catch (error) {
        fastify.log.error('Reset settings error:', error);
        return reply.status(500).send({ error: 'Failed to reset settings' });
      }
    }
  );
}