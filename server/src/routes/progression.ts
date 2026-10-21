import { FastifyPluginAsync } from 'fastify';
import { authGuard } from '../plugins/authGuard.js';
import fp from 'fastify-plugin';
import { z } from 'zod';
import * as progressionService from '../services/progressionService.js';

const progressionRoutes: FastifyPluginAsync = async (app) => {
  // Auth middleware
  app.addHook('preHandler', authGuard);

  // GET /progress - Progreso completo (game_progress + level_progress)
  app.get('/progress', {
    config: { public: false },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            gameProgress: {
              type: 'object',
              properties: {
                userId: { type: 'number' },
                currentLevelId: { type: 'number' },
                lives: { type: 'number' },
                keysCollected: { type: 'number' },
                enemiesKilled: { type: 'number' },
                totalPlaytimeSec: { type: 'number' },
                updatedAt: { type: 'string' },
              },
            },
            levelProgress: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'number' },
                  levelId: { type: 'number' },
                  completed: { type: 'boolean' },
                  stars: { type: 'number' },
                  bestTimeSec: { type: ['number', 'null'] },
                  deaths: { type: 'number' },
                  completedAt: { type: ['string', 'null'] },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
      tags: ['Progression'],
      summary: 'Obtener progreso completo del juego',
    },
  }, async (req, reply) => {
    const progress = await progressionService.getFullProgress(req.authUser!.id);
    return reply.code(200).send({ ok: true, ...progress });
  });

  // POST /progress/:levelId/complete - Completar nivel
  app.post('/progress/:levelId/complete', {
    config: { public: false },
    schema: {
      params: {
        type: 'object',
        required: ['levelId'],
        properties: {
          levelId: { type: 'number', minimum: 1 },
        },
      },
      body: {
        type: 'object',
        required: ['timeSec', 'stars', 'deaths', 'keys', 'kills'],
        properties: {
          timeSec: { type: 'number', minimum: 1 },
          stars: { type: 'number', minimum: 0, maximum: 3 },
          deaths: { type: 'number', minimum: 0 },
          keys: { type: 'number', minimum: 0 },
          kills: { type: 'number', minimum: 0 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            levelProgress: {
              type: 'object',
              properties: {
                userId: { type: 'number' },
                levelId: { type: 'number' },
                completed: { type: 'boolean' },
                stars: { type: 'number' },
                bestTimeSec: { type: ['number', 'null'] },
                deaths: { type: 'number' },
                completedAt: { type: ['string', 'null'] },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
            gameProgress: {
              type: 'object',
              properties: {
                userId: { type: 'number' },
                currentLevelId: { type: 'number' },
                lives: { type: 'number' },
                keysCollected: { type: 'number' },
                enemiesKilled: { type: 'number' },
                totalPlaytimeSec: { type: 'number' },
                updatedAt: { type: 'string' },
              },
            },
            xpGain: { type: 'number' },
            coinGain: { type: 'number' },
            newLevel: { type: ['number', 'null'] },
            unlockedCharacters: { type: 'array', items: { type: 'string' } },
            missionRewards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  missionId: { type: 'number' },
                  rewardCoins: { type: 'number' },
                  rewardXp: { type: 'number' },
                },
              },
            },
          },
        },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
      tags: ['Progression'],
      summary: 'Completar nivel - otorga XP, coins, actualiza misiones',
    },
  }, async (req, reply) => {
    const params = z.object({ levelId: z.number().int().positive() }).parse(req.params);
    const body = z.object({
      timeSec: z.number().int().positive(),
      stars: z.number().int().min(0).max(3),
      deaths: z.number().int().nonnegative(),
      keys: z.number().int().nonnegative(),
      kills: z.number().int().nonnegative(),
    }).parse(req.body);

    try {
      const result = await progressionService.completeLevel(req.authUser!.id, params.levelId, body);
      return reply.code(200).send({ ok: true, ...result });
    } catch (err: any) {
      // Un nivel inexistente es un 404, no un fallo del servidor.
      const status = err.message.includes('no encontrado') ? 404 : 400;
      return reply.code(status).send({ error: 'Error', message: err.message });
    }
  });
};

export default fp(progressionRoutes);