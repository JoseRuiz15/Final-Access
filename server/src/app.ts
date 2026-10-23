import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import { env } from './config/env.js';
import { ZodError } from 'zod';
import dbPlugin from './plugins/db.js';
import zodPlugin from './plugins/zod.js';
import corsPlugin from './plugins/cors.js';
import rateLimitPlugin from './plugins/rateLimit.js';
import swaggerPlugin from './plugins/swagger.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import charactersRoutes from './routes/characters.js';
import progressionRoutes from './routes/progression.js';
import missionsRoutes from './routes/missions.js';
import lobbiesRoutes from './routes/lobbies.js';
import lobbiesWsRoutes from './routes/lobbiesWs.js';
import { getSmtpConfigSummary, verifySmtpTransport } from './services/emailService.js';

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: { id: number; email: string; username: string };
  }
  interface FastifyRouteConfig {
    public?: boolean;
  }
}

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: env.NODE_ENV === 'development' ? {
      transport: {
        target: 'pino-pretty',
        options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
      },
    } : true,
    // Necesario detrás del proxy de Railway: sin esto `req.ip` es la IP del
    // proxy y el rate limit se comparte entre todos los usuarios.
    trustProxy: true,
    ajv: { customOptions: { coerceTypes: 'array' } },
  });

  // Acepta cuerpos JSON vacíos. Axios envía `Content-Type: application/json`
  // incluso en POST sin payload (p. ej. /auth/logout o /missions/:id/claim),
  // y el parser por defecto de Fastify rechaza esas peticiones.
  app.removeContentTypeParser('application/json');
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    const raw = typeof body === 'string' ? body.trim() : '';
    if (raw === '') {
      done(null, undefined);
      return;
    }
    try {
      done(null, JSON.parse(raw));
    } catch (err) {
      const parseError = err as Error & { statusCode?: number };
      parseError.statusCode = 400;
      done(parseError, undefined);
    }
  });

  // Register JWT and Cookie DIRECTLY at root level (no encapsulation)
  await app.register(fastifyCookie, {
    secret: env.COOKIE_SECRET,
    parseOptions: {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
    },
  });

  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: 'token', signed: false },
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  // WebSocket support
  await app.register(fastifyWebsocket);

  await app.register(dbPlugin);
  await app.register(zodPlugin);
  await app.register(corsPlugin);
  await app.register(rateLimitPlugin);

  // La documentación de la API solo se expone fuera de producción: en Railway
  // publicaría todos los endpoints (y sus esquemas) a cualquier visitante.
  if (env.NODE_ENV !== 'production') {
    await app.register(swaggerPlugin);
  }

  // Rutas REST (wrapped with fp so they don't create new encapsulation)
  await app.register(authRoutes, { prefix: '' });
  await app.register(profileRoutes, { prefix: '' });
  await app.register(charactersRoutes, { prefix: '' });
  await app.register(progressionRoutes, { prefix: '' });
  await app.register(missionsRoutes, { prefix: '' });
  await app.register(lobbiesRoutes, { prefix: '' });

  // WebSocket routes
  await app.register(lobbiesWsRoutes);

  app.get('/health', { config: { public: true } }, async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // Diagnóstico temporal de SMTP: abre una conexión real y devuelve el código
  // de error del proveedor, para no depender de los logs de Render.
  app.get('/health/email', { config: { public: true } }, async (_request, reply) => {
    try {
      const summary = await verifySmtpTransport();
      return { ok: true, ...summary };
    } catch (error) {
      const err = error as Error & {
        code?: string;
        responseCode?: number;
        command?: string;
      };
      return reply.code(503).send({
        ok: false,
        config: getSmtpConfigSummary(),
        code: err.code,
        responseCode: err.responseCode,
        command: err.command,
        message: err.message,
      });
    }
  });

  app.setErrorHandler((error, request, reply) => {
    // Los errores de validación de Zod son 400 (petición inválida), no 500.
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'Datos inválidos',
        statusCode: 400,
        details: error.flatten().fieldErrors,
      });
    }

    app.log.error(error);
    const statusCode = error.statusCode ?? 500;
    return reply.code(statusCode).send({
      error: error.name ?? 'Internal Server Error',
      message: error.message ?? 'Error interno del servidor',
      statusCode,
    });
  });

  // Las rutas de cada plugin registran su propio hook de autenticación en el
  // scope raíz, así que sin este preHandler una ruta inexistente devolvería
  // 401 en vez de 404.
  app.setNotFoundHandler(
    {
      preHandler: async (_request: FastifyRequest, reply: FastifyReply) => reply.code(404).send({
        error: 'Not Found',
        message: 'Ruta no encontrada',
        statusCode: 404,
      }),
    },
    (request, reply) => {
      return reply.code(404).send({
        error: 'Not Found',
        message: `Ruta ${request.method} ${request.url} no encontrada`,
        statusCode: 404,
      });
    },
  );

  return app;
}