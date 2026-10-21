import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';
import * as missionService from '../services/missionService.js';

const missionsRoutes: FastifyPluginAsync = async (app) => {
  // Auth middleware
  app.addHook('preHandler', async (req, reply) => {
    const config = req.routeOptions.config as { public?: boolean } | undefined;
    const isPublic = config?.public === true;
    if (isPublic) return;

    try {
      const payload = await req.jwtVerify<{ id: number; email: string; username: string }>();
      req.authUser = { id: payload.id, email: payload.email, username: payload.username };
    } catch {
      return reply.code(401).send({ error: 'Unauthorized', message: 'Token inválido o expirado' });
    }
  });

  // GET /missions - Misiones activas del usuario
  app.get('/missions', {
    config: { public: false },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            missions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  missionType: { type: 'string' },
                  target: { type: 'number' },
                  currentProgress: { type: 'number' },
                  completed: { type: 'boolean' },
                  claimed: { type: 'boolean' },
                  claimedAt: { type: ['string', 'null'] },
                  rewardCoins: { type: 'number' },
                  rewardXp: { type: 'number' },
                  isDaily: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
      tags: ['Missions'],
      summary: 'Obtener misiones activas del usuario',
    },
  }, async (req, reply) => {
    const missions = await missionService.getUserMissions(req.authUser!.id);
    return reply.code(200).send({ ok: true, missions });
  });

  // POST /missions/:id/claim - Reclamar recompensa de misión
  app.post('/missions/:id/claim', {
    config: { public: false },
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number', minimum: 1 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            message: { type: 'string' },
            rewardCoins: { type: 'number' },
            rewardXp: { type: 'number' },
            newCoinsBalance: { type: 'number' },
            newXp: { type: 'number' },
            newLevel: { type: ['number', 'null'] },
          },
        },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        409: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
      tags: ['Missions'],
      summary: 'Reclamar recompensa de misión completada',
    },
  }, async (req, reply) => {
    const params = z.object({ id: z.number().int().positive() }).parse(req.params);

    try {
      const result = await missionService.claimMission(req.authUser!.id, params.id);
      return reply.code(200).send({
        ok: true,
        message: 'Recompensa reclamada correctamente',
        ...result,
      });
    } catch (err: any) {
      const status = err.message.includes('no encontrada') ? 404 :
                     err.message.includes('ya reclamada') ? 409 : 400;
      return reply.code(status).send({ error: 'Error', message: err.message });
    }
  });
};

export default fp(missionsRoutes);