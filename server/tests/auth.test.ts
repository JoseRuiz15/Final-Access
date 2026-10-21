import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp, registerUser, verifyEmail, loginUser, getCookie, parseCookie } from './helpers.js';
import type { FastifyInstance } from 'fastify';

describe('Auth Endpoints', () => {
  let app: FastifyInstance;
  let testPassword = '12345678';
  let authCookie: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register - should send verification code', async () => {
    const testEmail = `test${Date.now()}@test.com`;
    const testUsername = `testuser${Date.now()}`;
    
    const response = await registerUser(app, {
      username: testUsername,
      email: testEmail,
      password: testPassword,
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.devCode).toBeDefined();
    expect(data.devCode.length).toBe(6);
  });

  it('POST /auth/verify-email - should verify code and return JWT cookie', async () => {
    // El endpoint de registro no devuelve username/email, así que se guardan
    // aquí para reutilizarlos en la verificación.
    const username = `verifyuser${Date.now()}`;
    const email = `verify${Date.now()}@test.com`;

    const registerResponse = await registerUser(app, {
      username,
      email,
      password: testPassword,
    });
    const registerData = JSON.parse(registerResponse.body);

    const response = await verifyEmail(app, {
      username,
      email,
      password: testPassword,
      code: registerData.devCode!,
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.id).toBeDefined();
    expect(data.user.emailVerified).toBe(true);

    const cookie = getCookie(response.headers);
    expect(cookie).toBeDefined();
    authCookie = parseCookie(cookie!);
  });

  it('GET /auth/me - should return current user with valid cookie', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { cookie: authCookie },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.user.id).toBeDefined();
  });

  it('GET /auth/me - should return 401 without cookie', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
    });

    expect(response.statusCode).toBe(401);
  });

  it('POST /auth/login - should login with email/password', async () => {
    const stamp = Date.now();
    const loginEmail = `login${stamp}@test.com`;
    const loginUsername = `loginuser${stamp}`;
    const secondEmail = `login2${stamp}@test.com`;
    const secondUsername = `loginuser2${stamp}`;

    // First register and verify
    await registerUser(app, {
      username: loginUsername,
      email: loginEmail,
      password: testPassword,
    });
    const registerResponse = await registerUser(app, {
      username: secondUsername,
      email: secondEmail,
      password: testPassword,
    });
    const registerData = JSON.parse(registerResponse.body);

    await verifyEmail(app, {
      username: secondUsername,
      email: secondEmail,
      password: testPassword,
      code: registerData.devCode!,
    });

    // Now login
    const response = await loginUser(app, {
      email: secondEmail,
      password: testPassword,
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.user.email).toBe(secondEmail);
  });

  it('POST /auth/logout - should clear cookie', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: { cookie: authCookie },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.message).toContain('cerrada');
  });

  it('POST /auth/register - should fail with duplicate email', async () => {
    const stamp = Date.now();
    const email = `duplicate${stamp}@test.com`;
    const username = `dupuser${stamp}`;

    // First registration (queda pendiente de verificar)
    const registerResponse = await registerUser(app, {
      username,
      email,
      password: testPassword,
    });
    const registerData = JSON.parse(registerResponse.body);

    // Verificamos para que el usuario exista de verdad en la tabla `users`
    await verifyEmail(app, {
      username,
      email,
      password: testPassword,
      code: registerData.devCode!,
    });

    // Second registration with same email
    const response = await registerUser(app, {
      username: username + '2',
      email,
      password: testPassword,
    });

    expect(response.statusCode).toBe(400);
    const data = JSON.parse(response.body);
    expect(data.error).toBeDefined();
  });

  it('POST /auth/verify-email - should fail with wrong code', async () => {
    const _registerResponse = await registerUser(app, {
      username: `wrongcode${Date.now()}`,
      email: `wrongcode${Date.now()}@test.com`,
      password: testPassword,
    });
    
    const response = await verifyEmail(app, {
      username: `wrongcode${Date.now()}`,
      email: `wrongcode${Date.now()}@test.com`,
      password: testPassword,
      code: '000000',
    });

    expect(response.statusCode).toBe(500);
    const data = JSON.parse(response.body);
    expect(data.error).toBe('Internal Server Error');
  });
});