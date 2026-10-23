import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp, registerUser, getCookie, parseCookie } from './helpers.js';
import type { FastifyInstance } from 'fastify';

describe('Progression & Missions Endpoints', () => {
  let app: FastifyInstance;
  let _testPassword = '12345678';
  let authCookie: string;
  let _userId: number;

  beforeAll(async () => {
    app = await createTestApp();

    // El endpoint de registro no devuelve username/email, así que se guardan
    // aquí para reutilizarlos en la verificación.
    const username = `proguser${Date.now()}`;
    const email = `prog${Date.now()}@test.com`;

    const registerResponse = await registerUser(app, {
      username,
      email,
      password: '12345678',
    });
    const registerData = JSON.parse(registerResponse.body);

    const verifyResponse = await app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      payload: {
        username,
        email,
        password: '12345678',
        code: registerData.devCode!,
      },
    });

    const cookie = getCookie(verifyResponse.headers);
    authCookie = parseCookie(cookie!);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /progress - should return game progress and level progress', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/progress',
      headers: { cookie: authCookie },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.gameProgress).toBeDefined();
    expect(data.gameProgress.currentLevelId).toBe(1);
    expect(data.levelProgress).toBeDefined();
    expect(Array.isArray(data.levelProgress)).toBe(true);
  });

  it('POST /progress/1/complete - should complete level 1', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/progress/1/complete',
      headers: { 
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: {
        timeSec: 120,
        stars: 3,
        deaths: 1,
        keys: 2,
        kills: 5,
      },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.levelProgress.completed).toBe(true);
    expect(data.levelProgress.stars).toBe(3);
    expect(data.xpGain).toBeGreaterThan(0);
    expect(data.coinGain).toBeGreaterThan(0);
    expect(data.gameProgress.currentLevelId).toBe(2);
  });

  it('GET /missions - should return missions (empty initially)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/missions',
      headers: { cookie: authCookie },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.missions).toBeDefined();
    expect(Array.isArray(data.missions)).toBe(true);
  });

  it('POST /progress/1/complete again - should update progress', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/progress/1/complete',
      headers: { 
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: {
        timeSec: 90,
        stars: 3,
        deaths: 0,
        keys: 1,
        kills: 3,
      },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    // Second completion with better time
    expect(data.levelProgress.bestTimeSec).toBeLessThanOrEqual(120);
  });

  it('POST /progress/999/complete - should fail with invalid level', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/progress/999/complete',
      headers: { 
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: {
        timeSec: 120,
        stars: 3,
        deaths: 1,
        keys: 2,
        kills: 5,
      },
    });

    expect(response.statusCode).toBe(404);
  });

  it('GET /progress after completion - should show updated progress', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/progress',
      headers: { cookie: authCookie },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.gameProgress.currentLevelId).toBe(2);
    expect(data.levelProgress.length).toBeGreaterThan(0);
    expect(data.levelProgress[0].completed).toBe(true);
    expect(data.levelProgress[0].stars).toBe(3);
  });

  it('POST /progress/3/complete - should keep currentLevelId at 3 (last playable level)', async () => {
    const complete = async (levelId: number) =>
      app.inject({
        method: 'POST',
        url: `/progress/${levelId}/complete`,
        headers: {
          cookie: authCookie,
          'Content-Type': 'application/json',
        },
        payload: {
          timeSec: 150,
          stars: 2,
          deaths: 0,
          keys: 1,
          kills: 6,
        },
      });

    // Nivel 2 → 3
    const level2 = await complete(2);
    expect(level2.statusCode).toBe(200);
    expect(JSON.parse(level2.body).gameProgress.currentLevelId).toBe(3);

    // Nivel 3 → se queda en 3: no existe un nivel 4 jugable.
    const level3 = await complete(3);
    expect(level3.statusCode).toBe(200);
    const data = JSON.parse(level3.body);
    expect(data.levelProgress.completed).toBe(true);
    expect(data.gameProgress.currentLevelId).toBe(3);
  });
});
