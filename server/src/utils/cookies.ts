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

function jwtExpiryInSeconds(duration: string): number {
  const match = duration
    .trim()
    .match(
      /^(\d+(?:\.\d+)?)\s*(ms|msecs?|milliseconds?|s|secs?|seconds?|m|mins?|minutes?|h|hrs?|hours?|d|days?|w|weeks?|y|yrs?|years?)$/i,
    );
  if (!match) throw new Error('JWT_EXPIRES_IN debe incluir una unidad de tiempo válida');

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  let secondsPerUnit: number;

  if (unit.startsWith('ms') || unit.startsWith('millisecond')) secondsPerUnit = 0.001;
  else if (unit === 's' || unit.startsWith('sec') || unit.startsWith('second')) secondsPerUnit = 1;
  else if (unit === 'm' || unit.startsWith('min') || unit.startsWith('minute')) secondsPerUnit = 60;
  else if (unit === 'h' || unit.startsWith('hr') || unit.startsWith('hour')) {
    secondsPerUnit = 60 * 60;
  } else if (unit === 'd' || unit.startsWith('day')) secondsPerUnit = 24 * 60 * 60;
  else if (unit === 'w' || unit.startsWith('week')) secondsPerUnit = 7 * 24 * 60 * 60;
  else secondsPerUnit = 365 * 24 * 60 * 60;

  return Math.max(1, Math.ceil(amount * secondsPerUnit));
}

export function setAuthCookie(reply: FastifyReply, token: string): void {
  reply.setCookie('token', token, {
    ...COOKIE_OPTIONS,
    maxAge: jwtExpiryInSeconds(env.JWT_EXPIRES_IN),
  });
}

export function clearAuthCookie(reply: FastifyReply): void {
  reply.clearCookie('token', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}
