import { FastifyPluginAsync } from 'fastify';
import { authGuard } from '../plugins/authGuard.js';
import fp from 'fastify-plugin';
import { z } from 'zod';
import * as lobbyService from '../services/lobbyService.js';

const lobbiesRoutes: FastifyPluginAsync = async (app) => {
  // Auth middleware
  app.addHook('preHandler', authGuard);

  // POST /lobbies - Crear lobby
  app.post('/lobbies', {
    config: { public: false },
    schema: {
      body: {
        type: 'object',
        required: ['name', 'mode'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 64 },
          mode: { type: 'string', enum: ['competitive', 'collaborative'] },
          maxPlayers: { type: 'number', minimum: 2, maximum: 10, default: 5 },
          isPrivate: { type: 'boolean', default: true },
          levelId: { type: 'number', minimum: 1 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            lobby: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                code: { type: 'string' },
                name: { type: 'string' },
                mode: { type: 'string' },
                maxPlayers: { type: 'number' },
                isPrivate: { type: 'boolean' },
                creatorId: { type: 'number' },
                status: { type: 'string' },
                levelId: { type: ['number', 'null'] },
                createdAt: { type: 'string' },
                startedAt: { type: ['string', 'null'] },
                endedAt: { type: ['string', 'null'] },
              },
            },
          },
        },
      },
      tags: ['Lobbies'],
      summary: 'Crear un nuevo lobby',
    },
  }, async (req, reply) => {
    const body = z.object({
      name: z.string().min(1).max(64),
      mode: z.enum(['competitive', 'collaborative']),
      maxPlayers: z.number().int().min(2).max(10).default(5),
      isPrivate: z.boolean().default(true),
      levelId: z.number().int().positive().optional(),
    }).parse(req.body);

    const lobby = await lobbyService.createLobby(req.authUser!.id, body);
    return reply.code(200).send({ ok: true, lobby });
  });

  // GET /lobbies - Listar lobbies públicos
  app.get('/lobbies', {
    config: { public: false },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 },
          mode: { type: 'string', enum: ['competitive', 'collaborative'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            lobbies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  code: { type: 'string' },
                  name: { type: 'string' },
                  mode: { type: 'string' },
                  maxPlayers: { type: 'number' },
                  isPrivate: { type: 'boolean' },
                  status: { type: 'string' },
                  currentPlayers: { type: 'number' },
                  levelId: { type: ['number', 'null'] },
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
      tags: ['Lobbies'],
      summary: 'Listar lobbies públicos con filtros',
    },
  }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(50).default(20),
      mode: z.enum(['competitive', 'collaborative']).optional(),
    }).parse(req.query);

    const result = await lobbyService.listLobbies(query);
    return reply.code(200).send({ ok: true, ...result });
  });

  // GET /lobbies/:code - Detalle de lobby con jugadores
  app.get('/lobbies/:code', {
    config: { public: false },
    schema: {
      params: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string', minLength: 8, maxLength: 8 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            lobby: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                code: { type: 'string' },
                name: { type: 'string' },
                mode: { type: 'string' },
                maxPlayers: { type: 'number' },
                isPrivate: { type: 'boolean' },
                creatorId: { type: 'number' },
                status: { type: 'string' },
                levelId: { type: ['number', 'null'] },
                createdAt: { type: 'string' },
                startedAt: { type: ['string', 'null'] },
                endedAt: { type: ['string', 'null'] },
                players: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      userId: { type: 'number' },
                      username: { type: 'string' },
                      slot: { type: 'number' },
                      characterId: { type: ['string', 'null'] },
                      character: { type: ['object', 'null'] },
                      isReady: { type: 'boolean' },
                      isCreator: { type: 'boolean' },
                      joinedAt: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        404: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
      tags: ['Lobbies'],
      summary: 'Obtener detalle de lobby con jugadores',
    },
  }, async (req, reply) => {
    const params = z.object({ code: z.string().length(8) }).parse(req.params);
    const lobby = await lobbyService.getLobbyDetailsByCode(params.code);
    
    if (!lobby) {
      return reply.code(404).send({ error: 'Not Found', message: 'Lobby no encontrado' });
    }
    
    return reply.code(200).send({ ok: true, lobby });
  });

  // POST /lobbies/:code/join - Unirse a lobby
  app.post('/lobbies/:code/join', {
    config: { public: false },
    schema: {
      params: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string', minLength: 8, maxLength: 8 },
        },
      },
      body: {
        type: 'object',
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
            slot: { type: 'number' },
          },
        },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        403: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
      tags: ['Lobbies'],
      summary: 'Unirse a un lobby por código',
    },
  }, async (req, reply) => {
    const params = z.object({ code: z.string().length(8) }).parse(req.params);
    const body = z.object({ characterId: z.string().min(1).max(32).optional() }).parse(req.body);
    
    try {
      const result = await lobbyService.joinLobby(req.authUser!.id, params.code, body.characterId);
      return reply.code(200).send({ ok: true, message: 'Te has unido al lobby', ...result });
    } catch (err: any) {
      const status = err.message.includes('no encontrado') ? 404 :
                     err.message.includes('privado') ? 403 :
                     err.message.includes('lleno') ? 403 : 400;
      return reply.code(status).send({ error: 'Error', message: err.message });
    }
  });

  // DELETE /lobbies/:code/leave - Salir del lobby
  app.delete('/lobbies/:code/leave', {
    config: { public: false },
    schema: {
      params: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string', minLength: 8, maxLength: 8 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
      tags: ['Lobbies'],
      summary: 'Salir del lobby',
    },
  }, async (req, reply) => {
    const params = z.object({ code: z.string().length(8) }).parse(req.params);
    const result = await lobbyService.leaveLobby(req.authUser!.id, params.code);
    return reply.code(200).send(result);
  });

  // PATCH /lobbies/:code/ready - Cambiar estado listo
  app.patch('/lobbies/:code/ready', {
    config: { public: false },
    schema: {
      params: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string', minLength: 8, maxLength: 8 },
        },
      },
      body: {
        type: 'object',
        required: ['ready'],
        properties: {
          ready: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            message: { type: 'string' },
            allReady: { type: 'boolean' },
          },
        },
      },
      tags: ['Lobbies'],
      summary: 'Cambiar estado de listo',
    },
  }, async (req, reply) => {
    const params = z.object({ code: z.string().length(8) }).parse(req.params);
    const body = z.object({ ready: z.boolean() }).parse(req.body);
    
    try {
      const result = await lobbyService.setReady(req.authUser!.id, params.code, body.ready);
      return reply.code(200).send({ 
        ok: true, 
        message: body.ready ? 'Marcado como listo' : 'Marcado como no listo', 
        ...result 
      });
    } catch (err: any) {
      const status = err.message.includes('no encontrado') ? 404 : 400;
      return reply.code(status).send({ error: 'Error', message: err.message });
    }
  });

  // POST /lobbies/:code/start - Iniciar partida (solo creador)
  app.post('/lobbies/:code/start', {
    config: { public: false },
    schema: {
      params: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string', minLength: 8, maxLength: 8 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            message: { type: 'string' },
            matchId: { type: ['number', 'null'] },
          },
        },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        403: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
      tags: ['Lobbies'],
      summary: 'Iniciar partida (solo creador)',
    },
  }, async (req, reply) => {
    const params = z.object({ code: z.string().length(8) }).parse(req.params);
    
    try {
      const result = await lobbyService.startLobby(req.authUser!.id, params.code);
      return reply.code(200).send({ 
        ok: true, 
        message: 'Partida iniciada', 
        matchId: result.matchId ?? null 
      });
    } catch (err: any) {
      const status = err.message.includes('no encontrado') ? 404 :
                     err.message.includes('creador') ? 403 : 400;
      return reply.code(status).send({ error: 'Error', message: err.message });
    }
  });

  // POST /lobbies/:code/cancel - Cancelar lobby (solo creador)
  app.post('/lobbies/:code/cancel', {
    config: { public: false },
    schema: {
      params: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string', minLength: 8, maxLength: 8 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        403: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
      tags: ['Lobbies'],
      summary: 'Cancelar lobby (solo creador)',
    },
  }, async (req, reply) => {
    const params = z.object({ code: z.string().length(8) }).parse(req.params);
    
    try {
      await lobbyService.cancelLobby(req.authUser!.id, params.code);
      return reply.code(200).send({ ok: true, message: 'Lobby cancelado' });
    } catch (err: any) {
      const status = err.message.includes('no encontrado') ? 404 : 403;
      return reply.code(status).send({ error: 'Error', message: err.message });
    }
  });
};

export default fp(lobbiesRoutes);