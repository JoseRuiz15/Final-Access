import { getTestApp } from './setup.js';
import type { FastifyInstance } from 'fastify';

export async function createTestApp(): Promise<FastifyInstance> {
  return getTestApp();
}

export async function registerUser(app: FastifyInstance, data: {
  username: string;
  email: string;
  password: string;
}) {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: data,
  });
  return response;
}

export async function verifyEmail(app: FastifyInstance, data: {
  username: string;
  email: string;
  password: string;
  code: string;
}) {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/verify-email',
    payload: data,
  });
  return response;
}

export async function loginUser(app: FastifyInstance, data: {
  email: string;
  password: string;
}) {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: data,
  });
  return response;
}

export function getCookie(headers: Record<string, string | string[] | undefined>): string | undefined {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return undefined;
  if (Array.isArray(setCookie)) return setCookie[0];
  return setCookie;
}

export function parseCookie(cookie: string | undefined): string {
  if (!cookie) return '';
  return cookie.split(';')[0];
}

// Helper to create a full authenticated user
export async function createAuthenticatedUser(app: FastifyInstance, overrides?: Partial<{
  username: string;
  email: string;
  password: string;
}>) {
  const testId = Date.now() + Math.random();
  const username = overrides?.username || `testuser${testId}`;
  const email = overrides?.email || `test${testId}@test.com`;
  const password = overrides?.password || '12345678';

  // Register
  const registerResponse = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { username, email, password },
  });
  const registerData = JSON.parse(registerResponse.body);
  const devCode = registerData.devCode;

  // Verify email
  const verifyResponse = await app.inject({
    method: 'POST',
    url: '/auth/verify-email',
    payload: { username, email, password: overrides?.password || '12345678', code: devCode },
  });

  const cookie = getCookie(verifyResponse.headers);
  const authCookie = cookie ? cookie.split(';')[0] : '';

  return {
    username,
    email,
    password: overrides?.password || '12345678',
    authCookie,
    userId: JSON.parse(verifyResponse.body).user.id,
  };
}