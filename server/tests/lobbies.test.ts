import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp, registerUser, verifyEmail, getCookie, parseCookie } from './helpers.js';
import type { FastifyInstance } from 'fastify';

describe('Lobbies Endpoints', () => {
  let app: FastifyInstance;
  let testPassword = '12345678';
  let authCookie: string;

  beforeAll(async () => {
    app = await createTestApp();

    // El endpoint de registro no devuelve username/email, así que se guardan
    // aquí para reutilizarlos en la verificación.
    const username = `lobbyuser${Date.now()}`;
    const email = `lobby${Date.now()}@test.com`;

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        username,
        email,
        password: '12345678',
      },
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

  it('POST /lobbies - should create a new lobby', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { 
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: {
        name: 'Test Lobby',
        mode: 'competitive',
        maxPlayers: 4,
        isPrivate: false,
      },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.lobby).toBeDefined();
    expect(data.lobby.code).toBeDefined();
    expect(data.lobby.code.length).toBe(8);
    expect(data.lobby.name).toBe('Test Lobby');
    expect(data.lobby.mode).toBe('competitive');
    expect(data.lobby.maxPlayers).toBe(4);
    expect(data.lobby.isPrivate).toBe(false);
    expect(data.lobby.status).toBe('waiting');
    expect(data.lobby.creatorId).toBeDefined();
  });

  it('GET /lobbies - should list public lobbies', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/lobbies',
      headers: { cookie: authCookie },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.lobbies).toBeDefined();
    expect(Array.isArray(data.lobbies)).toBe(true);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(20);
  });

  it('GET /lobbies/:code - should return lobby details with players', async () => {
    // First create a lobby
    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { 
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: {
        name: 'Detail Test Lobby',
        mode: 'collaborative',
        maxPlayers: 3,
        isPrivate: false,
      },
    });
    const createData = JSON.parse(createResponse.body);
    const lobbyCode = createData.lobby.code;

    const response = await app.inject({
      method: 'GET',
      url: `/lobbies/${lobbyCode}`,
      headers: { cookie: authCookie },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body);
    expect(data.ok).toBe(true);
    expect(data.lobby).toBeDefined();
    expect(data.lobby.code).toBe(lobbyCode);
    expect(data.lobby.players).toBeDefined();
    expect(Array.isArray(data.lobby.players)).toBe(true);
    expect(data.lobby.players.length).toBeGreaterThan(0);
    expect(data.lobby.players[0].isCreator).toBe(true);
    expect(data.lobby.players[0].isReady).toBe(true);
  });

  it('POST /lobbies/:code/join - should join a public lobby', async () => {
    // Create second user
    const stamp = Date.now();
    const user2Username = `joinuser${stamp}`;
    const user2Email = `join${stamp}@test.com`;

    const user2Register = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        username: user2Username,
        email: user2Email,
        password: '12345678',
      },
    });
    const user2RegisterData = JSON.parse(user2Register.body);

    const user2Verify = await app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      payload: {
        username: user2Username,
        email: user2Email,
        password: '12345678',
        code: user2RegisterData.devCode!,
      },
    });
    const user2Cookie = getCookie(user2Verify.headers);
    const user2AuthCookie = parseCookie(user2Cookie!);

    // Create lobby with first user
    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { 
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: {
        name: 'Join Test Lobby',
        mode: 'competitive',
        maxPlayers: 4,
        isPrivate: false,
      },
    });
    const createData = JSON.parse(createResponse.body);
    const lobbyCode = createData.lobby.code;

    // Second user joins
    const joinResponse = await app.inject({
      method: 'POST',
      url: `/lobbies/${lobbyCode}/join`,
      headers: { 
        cookie: parseCookie(getCookie(user2Verify.headers)!),
        'Content-Type': 'application/json',
      },
      payload: {
        characterId: 'cosa1',
      },
    });

    expect(joinResponse.statusCode).toBe(200);
    const joinData = JSON.parse(joinResponse.body);
    expect(joinData.ok).toBe(true);
    expect(joinData.slot).toBeDefined();
    expect(joinData.slot).toBeGreaterThan(0);
  });

  it('PATCH /lobbies/:code/ready - should set ready status', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { 
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: {
        name: 'Ready Test Lobby',
        mode: 'competitive',
        maxPlayers: 2,
        isPrivate: false,
      },
    });
    const createData = JSON.parse(createResponse.body);
    const lobbyCode = createData.lobby.code;

    // Set ready to false
    const unreadyResponse = await app.inject({
      method: 'PATCH',
      url: `/lobbies/${lobbyCode}/ready`,
      headers: { 
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: { ready: false },
    });

    expect(unreadyResponse.statusCode).toBe(200);
    const unreadyData = JSON.parse(unreadyResponse.body);
    expect(unreadyData.ok).toBe(true);
    expect(unreadyData.allReady).toBe(false);

    // Set ready to true
    const readyResponse = await app.inject({
      method: 'PATCH',
      url: `/lobbies/${lobbyCode}/ready`,
      headers: { 
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: { ready: true },
    });

    expect(readyResponse.statusCode).toBe(200);
    const readyData = JSON.parse(readyResponse.body);
    expect(readyData.ok).toBe(true);
    expect(readyData.allReady).toBe(true);
  });

  it('DELETE /lobbies/:code/leave - should leave lobby', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { 
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: {
        name: 'Leave Test Lobby',
        mode: 'competitive',
        maxPlayers: 2,
        isPrivate: false,
      },
    });
    const createData = JSON.parse(createResponse.body);
    const lobbyCode = createData.lobby.code;

    const leaveResponse = await app.inject({
      method: 'DELETE',
      url: `/lobbies/${lobbyCode}/leave`,
      headers: { cookie: authCookie },
    });

    expect(leaveResponse.statusCode).toBe(200);
    const leaveData = JSON.parse(leaveResponse.body);
    expect(leaveData.ok).toBe(true);
    expect(leaveData.message).toContain('salido');

    // Lobby should be cancelled (creator left)
    const getResponse = await app.inject({
      method: 'GET',
      url: `/lobbies/${lobbyCode}`,
      headers: { cookie: authCookie },
    });
    
    const getData = JSON.parse(getResponse.body);
    // Creator left, lobby should be cancelled
    expect(getData.lobby.status).toBe('cancelled');
  });

  it('POST /lobbies/:code/start - should start match (creator only)', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: {
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: {
        name: 'Start Test Lobby',
        mode: 'competitive',
        maxPlayers: 2,
        isPrivate: false,
      },
    });
    const createData = JSON.parse(createResponse.body);
    const lobbyCode = createData.lobby.code;

    // El creador entra listo, así que hace falta un segundo jugador listo
    // para poder iniciar la partida.
    const stamp = Date.now();
    const user2Username = `startuser${stamp}`;
    const user2Email = `start${stamp}@test.com`;

    const user2Register = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { username: user2Username, email: user2Email, password: '12345678' },
    });
    const user2RegisterData = JSON.parse(user2Register.body);

    const user2Verify = await app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      payload: {
        username: user2Username,
        email: user2Email,
        password: '12345678',
        code: user2RegisterData.devCode!,
      },
    });
    const user2AuthCookie = parseCookie(getCookie(user2Verify.headers)!);

    await app.inject({
      method: 'POST',
      url: `/lobbies/${lobbyCode}/join`,
      headers: { cookie: user2AuthCookie, 'Content-Type': 'application/json' },
      payload: { characterId: 'cosa1' },
    });

    // El segundo jugador marca "listo"
    const readyResponse = await app.inject({
      method: 'PATCH',
      url: `/lobbies/${lobbyCode}/ready`,
      headers: { cookie: user2AuthCookie, 'Content-Type': 'application/json' },
      payload: { ready: true },
    });
    expect(readyResponse.statusCode).toBe(200);

    const startResponse = await app.inject({
      method: 'POST',
      url: `/lobbies/${lobbyCode}/start`,
      headers: { cookie: authCookie },
    });

    expect(startResponse.statusCode).toBe(200);
    const startData = JSON.parse(startResponse.body);
    expect(startData.ok).toBe(true);
    expect(startData.message).toContain('iniciada');
  });

  it('POST /lobbies/:code/cancel - should cancel lobby (creator only)', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { 
        cookie: authCookie,
        'Content-Type': 'application/json',
      },
      payload: {
        name: 'Cancel Test Lobby',
        mode: 'competitive',
        maxPlayers: 2,
        isPrivate: false,
      },
    });
    const createData = JSON.parse(createResponse.body);
    const lobbyCode = createData.lobby.code;

    const cancelResponse = await app.inject({
      method: 'POST',
      url: `/lobbies/${lobbyCode}/cancel`,
      headers: { cookie: authCookie },
    });

    expect(cancelResponse.statusCode).toBe(200);
    const cancelData = JSON.parse(cancelResponse.body);
    expect(cancelData.ok).toBe(true);
    expect(cancelData.message).toContain('cancelado');
  });
});