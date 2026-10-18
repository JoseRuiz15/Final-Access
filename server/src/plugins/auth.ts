import { FastifyPluginAsync } from 'fastify';
import { env } from '../config/env.js';

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: { id: number; email: string; username: string };
  }
  interface FastifyRouteConfig {
    public?: boolean;
  }
}

// Plugin vacío - JWT/Cookie se registran en app.ts, auth middleware en cada ruta
export const authPlugin: FastifyPluginAsync = async () => {
  // No-op - JWT/Cookie registered at root level in app.ts
  // Auth middleware registered in each route plugin
};