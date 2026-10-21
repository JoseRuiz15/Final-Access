import type { FastifyReply } from 'fastify';
import { env } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  // 'none' es obligatorio cuando el frontend y el backend viven en dominios
  // distintos (vercel.app -> railway.app): con 'lax' el navegador no envía la
  // cookie en las peticiones fetch() cross-site.
  sameSite: env.COOKIE_SAME_SITE,
  path: '/',
  // El dominio solo se incluye si viene informado: los navegadores rechazan
  // los public suffixes (.vercel.app, .railway.app).
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

export function setAuthCookie(reply: FastifyReply, token: string): void {
  reply.setCookie('token', token, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60, // 15 minutos (igual que JWT_EXPIRES_IN)
  });
}

export function clearAuthCookie(reply: FastifyReply): void {
  reply.clearCookie('token', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}
