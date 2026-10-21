import { FastifyPluginAsync } from 'fastify';
import { authGuard } from '../plugins/authGuard.js';
import fp from 'fastify-plugin';
import { z } from 'zod';
import * as profileService from '../services/profileService.js';

const charactersRoutes: FastifyPluginAsync = async (app) => {
  // Register auth middleware for protected routes in this encapsulation
  app.addHook('preHandler', authGuard);
  // GET /characters - Catálogo global de personajes
  app.get('/characters', {
    config: { public: false },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          rarity: { type: 'string', enum: ['common', 'rare', 'epic', 'legendary', 'mythic'] },
          attackType: { type: 'string', enum: ['melee', 'ranged', 'magic'] },
          isActive: { type: 'boolean', default: true },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            characters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  rarity: { type: 'string' },
                  attackType: { type: 'string' },
                  baseHealth: { type: 'number' },
                  baseSpeed: { type: 'number' },
                  baseDamage: { type: 'number' },
                  textureKey: { type: 'string' },
                  walkTexture: { type: ['string', 'null'] },
                  abilityName: { type: ['string', 'null'] },
                  abilityDesc: { type: ['string', 'null'] },
                  unlockCost: { type: 'number' },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'string' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' },
              },
            },
          },
        },
      },
      tags: ['Characters'],
      summary: 'Listar catálogo de personajes (con filtros y paginación)',
    },
  }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
      rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']).optional(),
      attackType: z.enum(['melee', 'ranged', 'magic']).optional(),
      isActive: z.coerce.boolean().default(true),
    }).parse(req.query);

    const result = await profileService.getCharactersList(query);
    return reply.code(200).send({ ok: true, ...result });
  });

  // POST /characters/:id/unlock - Desbloquear personaje gastando coins
  app.post('/characters/:id/unlock', {
    config: { public: false },
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 1, maxLength: 32 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            message: { type: 'string' },
            character: {
              type: 'object',
              properties: {
                characterId: { type: 'string' },
                unlockedAt: { type: 'string' },
                skinVariant: { type: 'string' },
              },
            },
            newCoinsBalance: { type: 'number' },
          },
        },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        403: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
      tags: ['Characters'],
      summary: 'Desbloquear personaje gastando monedas',
    },
  }, async (req, reply) => {
    const params = z.object({ id: z.string().min(1).max(32) }).parse(req.params);
    try {
      const result = await profileService.unlockCharacter(req.authUser!.id, params.id);
      return reply.code(200).send({
        ok: true,
        message: 'Personaje desbloqueado correctamente',
        ...result,
      });
    } catch (err: any) {
      const status = err.message.includes('insuficientes') ? 403 : 
                     err.message.includes('no encontrado') ? 404 : 400;
      return reply.code(status).send({ error: 'Error', message: err.message });
    }
  });
};

export default fp(charactersRoutes);