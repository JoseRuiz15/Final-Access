import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';
import * as profileService from '../services/profileService.js';

const profileRoutes: FastifyPluginAsync = async (app) => {
  // Register auth middleware for protected routes in this encapsulation
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
  // GET /profile - Perfil completo con personaje equipado y desbloqueados
  app.get('/profile', {
    config: { public: false },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            profile: {
              type: 'object',
              properties: {
                userId: { type: 'number' },
                displayName: { type: 'string' },
                level: { type: 'number' },
                xp: { type: 'number' },
                coins: { type: 'number' },
                equippedCharacterId: { type: ['string', 'null'] },
                totalPlaytimeSec: { type: 'number' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
            equippedCharacter: {
              type: ['object', 'null'],
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
              },
            },
            unlockedCharacters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  characterId: { type: 'string' },
                  character: {
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
                    },
                  },
                  unlockedAt: { type: 'string' },
                  skinVariant: { type: 'string' },
                },
              },
            },
          },
        },
        401: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
      tags: ['Profile'],
      summary: 'Obtener perfil completo con personaje equipado y desbloqueados',
    },
  }, async (req, reply) => {
    const fullProfile = await profileService.getFullProfile(req.authUser!.id);
    if (!fullProfile) {
      return reply.code(404).send({ error: 'Not Found', message: 'Perfil no encontrado' });
    }

    const { equippedCharacter, unlockedCharacters, ...profile } = fullProfile;
    return reply.code(200).send({ ok: true, profile, equippedCharacter, unlockedCharacters });
  });

  // PATCH /profile - Actualizar displayName
  app.patch('/profile', {
    config: { public: false },
    schema: {
      body: {
        type: 'object',
        properties: {
          displayName: { type: 'string', minLength: 1, maxLength: 32 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            profile: {
              type: 'object',
              properties: {
                userId: { type: 'number' },
                displayName: { type: 'string' },
                level: { type: 'number' },
                xp: { type: 'number' },
                coins: { type: 'number' },
                equippedCharacterId: { type: ['string', 'null'] },
                totalPlaytimeSec: { type: 'number' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
      tags: ['Profile'],
      summary: 'Actualizar nombre visible del perfil',
    },
  }, async (req, reply) => {
    const body = z.object({ displayName: z.string().min(1).max(32).optional() }).parse(req.body);
    if (!body.displayName) {
      return reply.code(400).send({ error: 'Bad Request', message: 'displayName es requerido' });
    }
    const profile = await profileService.updateDisplayName(req.authUser!.id, body.displayName);
    return reply.code(200).send({ ok: true, profile });
  });

  // PUT /profile/equip - Equipar personaje
  app.put('/profile/equip', {
    config: { public: false },
    schema: {
      body: {
        type: 'object',
        required: ['characterId'],
        properties: {
          characterId: { type: 'string', minLength: 1, maxLength: 32 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            message: { type: 'string' },
            equippedCharacterId: { type: 'string' },
          },
        },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        403: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
      tags: ['Profile'],
      summary: 'Equipar personaje (debe estar desbloqueado)',
    },
  }, async (req, reply) => {
    const body = z.object({ characterId: z.string().min(1).max(32) }).parse(req.body);
    try {
      await profileService.equipCharacter(req.authUser!.id, body.characterId);
      return reply.code(200).send({
        ok: true,
        message: 'Personaje equipado correctamente',
        equippedCharacterId: body.characterId,
      });
    } catch (err: any) {
      return reply.code(403).send({ error: 'Forbidden', message: err.message });
    }
  });
};

export default fp(profileRoutes);
