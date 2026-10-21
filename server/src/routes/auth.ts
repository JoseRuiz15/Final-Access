import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';
import * as authService from '../services/authService.js';
import * as queries from '../db/queries/auth.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';
import {
  registerStartBodySchema,
  resendVerificationBodySchema,
  loginBodySchema,
} from '../schemas/auth.js';

const verifyEmailBodySchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  code: z.string().length(6).regex(/^\d{6}$/),
});

const authRoutes: FastifyPluginAsync = async (app) => {
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
  // POST /auth/register - Paso 1: Iniciar registro (envía código)
  app.post('/auth/register', {
    config: { public: true },
    schema: {
      body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 32, pattern: '^[a-zA-Z0-9_]+$' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, maxLength: 128 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            message: { type: 'string' },
            devCode: { type: 'string' },
          },
        },
      },
      tags: ['Auth'],
      summary: 'Iniciar registro - envía código de verificación al email',
    },
  }, async (req, reply) => {
    const body = registerStartBodySchema.parse(req.body);
    try {
      const result = await authService.startRegister(body.username, body.email, body.password);
      return reply.code(200).send(result);
    } catch (err: any) {
      // El email o el username ya están en uso: es un error de validación (400),
      // no un fallo del servidor.
      const status = err.message.includes('ya está') || err.message.includes('ya existe') ? 400 : 500;
      return reply.code(status).send({ error: 'Bad Request', message: err.message });
    }
  });

  // POST /auth/verify-email - Paso 2: Verificar código + completar registro
  app.post('/auth/verify-email', {
    config: { public: true },
    schema: {
      body: {
        type: 'object',
        required: ['username', 'email', 'password', 'code'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 32, pattern: '^[a-zA-Z0-9_]+$' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, maxLength: 128 },
          code: { type: 'string', minLength: 6, maxLength: 6, pattern: '^\\d{6}$' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' },
                emailVerified: { type: 'boolean' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
      tags: ['Auth'],
      summary: 'Verificar código y completar registro - devuelve JWT en cookie',
    },
  }, async (req, reply) => {
    const body = verifyEmailBodySchema.parse(req.body);
    const user = await authService.completeRegistration(body.username, body.email, body.password, body.code);

    const token = app.jwt.sign({ id: user.id, email: user.email, username: user.username });
    setAuthCookie(reply, token);

    return reply.code(200).send({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
      },
    });
  });

  // POST /auth/resend-verification - Reenviar código
  app.post('/auth/resend-verification', {
    config: { public: true },
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
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
      tags: ['Auth'],
      summary: 'Reenviar código de verificación',
    },
  }, async (req, reply) => {
    const body = resendVerificationBodySchema.parse(req.body);
    const result = await authService.resendVerification(body.email);
    return reply.code(200).send(result);
  });

  // POST /auth/login - Login tradicional
  app.post('/auth/login', {
    config: { public: true },
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' },
                emailVerified: { type: 'boolean' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
      tags: ['Auth'],
      summary: 'Iniciar sesión - devuelve JWT en cookie',
    },
  }, async (req, reply) => {
    const body = loginBodySchema.parse(req.body);
    const user = await authService.login(body.email, body.password);

    const token = app.jwt.sign({ id: user.id, email: user.email, username: user.username });
    setAuthCookie(reply, token);

    return reply.code(200).send({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
      },
    });
  });

  // POST /auth/logout - Cerrar sesión
  app.post('/auth/logout', {
    config: { public: false },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
      tags: ['Auth'],
      summary: 'Cerrar sesión - borra cookie',
    },
  }, async (req, reply) => {
    clearAuthCookie(reply);
    return reply.code(200).send({ ok: true, message: 'Sesión cerrada correctamente' });
  });

  // GET /auth/me - Obtener usuario actual
  app.get('/auth/me', {
    config: { public: false },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' },
                emailVerified: { type: 'boolean' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
      tags: ['Auth'],
      summary: 'Obtener usuario actual desde JWT',
    },
  }, async (req, reply) => {
    const user = await queries.findUserById(req.authUser!.id);
    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized', message: 'Usuario no encontrado' });
    }

    return reply.code(200).send({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
      },
    });
  });
};

export default fp(authRoutes);