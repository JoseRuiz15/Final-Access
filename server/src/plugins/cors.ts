import { FastifyPluginAsync } from 'fastify';
import fastifyCors from '@fastify/cors';
import fp from 'fastify-plugin';
import { env, allowedOrigins } from '../config/env.js';

const corsPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyCors, {
    // En producción solo se aceptan los orígenes declarados en FRONTEND_URL
    // (separados por coma). Así los preview deployments de Vercel también
    // funcionan si se listan, y ningún otro sitio puede llamar a la API.
    origin: (origin, callback) => {
      // Peticiones sin Origin (curl, healthchecks, same-origin) → permitidas.
      if (!origin) return callback(null, true);
      if (env.NODE_ENV === 'development') return callback(null, true);
      callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
};

export default fp(corsPlugin);
