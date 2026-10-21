import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import type { FastifyInstance } from 'fastify';
import { createTestApp, registerUser, verifyEmail, getCookie, parseCookie } from './helpers.js';

/**
 * Tests del WebSocket del lobby.
 *
 * Estos requieren un servidor real (no sirve `app.inject()`), así que se
 * levanta en un puerto aleatorio. Comprueban el protocolo que usa el cliente
 * (`src/stores/lobbies.js`): minúsculas y payload en la raíz.
 */
describe('Lobby WebSocket', () => {
  let app: FastifyInstance;
  let baseUrl: string;

  const clients: WebSocket[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    await app.listen({ port: 0, host: '127.0.0.1' });
    const address = app.server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    baseUrl = `ws://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    clients.forEach((ws) => ws.close());
    await app.close();
  });

  async function createUser(tag: string) {
    const username = `ws${tag}${Date.now()}`;
    const email = `${username}@test.com`;
    const password = '12345678';

    const registerResponse = await registerUser(app, { username, email, password });
    const registerData = JSON.parse(registerResponse.body);

    const verifyResponse = await verifyEmail(app, {
      username,
      email,
      password,
      code: registerData.devCode!,
    });

    return parseCookie(getCookie(verifyResponse.headers)!);
  }

  function openSocket(code: string, cookie: string) {
    const ws = new WebSocket(`${baseUrl}/ws/lobby/${code}`, { headers: { Cookie: cookie } });
    const messages: any[] = [];
    ws.on('message', (data) => messages.push(JSON.parse(data.toString())));
    clients.push(ws);
    return { ws, messages };
  }

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  it('rechaza la conexión sin cookie de sesión', async () => {
    const cookie = await createUser('noauth');
    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { cookie },
      payload: { name: 'WS auth', mode: 'competitive', maxPlayers: 2, isPrivate: false },
    });
    const code = JSON.parse(createResponse.body).lobby.code;

    const status = await new Promise<number | undefined>((resolve) => {
      const ws = new WebSocket(`${baseUrl}/ws/lobby/${code}`);
      clients.push(ws);
      ws.on('unexpected-response', (_req, res) => resolve(res.statusCode));
      ws.on('error', () => resolve(undefined));
      ws.on('open', () => resolve(101));
    });

    expect(status).toBe(401);
  });

  it('envía lobby_state con la lista de jugadores al conectarse', async () => {
    const cookie = await createUser('state');
    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { cookie },
      payload: { name: 'WS state', mode: 'competitive', maxPlayers: 3, isPrivate: false },
    });
    const code = JSON.parse(createResponse.body).lobby.code;

    const { messages } = openSocket(code, cookie);
    await wait(1500);

    const state = messages.find((m) => m.type === 'lobby_state');
    expect(state).toBeDefined();
    expect(state.lobby.code).toBe(code);
    expect(Array.isArray(state.lobby.players)).toBe(true);
    expect(state.lobby.players.length).toBeGreaterThan(0);
  });

  it('procesa set_ready y responde player_ready', async () => {
    const cookie = await createUser('ready');
    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { cookie },
      payload: { name: 'WS ready', mode: 'competitive', maxPlayers: 3, isPrivate: false },
    });
    const code = JSON.parse(createResponse.body).lobby.code;

    const { ws, messages } = openSocket(code, cookie);
    await wait(1500);

    ws.send(JSON.stringify({ type: 'set_ready', ready: true }));
    await wait(2000);

    const ready = messages.find((m) => m.type === 'player_ready');
    expect(ready).toBeDefined();
    expect(Array.isArray(ready.players)).toBe(true);
    expect(ready.players.some((p: any) => p.isReady === true)).toBe(true);
  });

  it('responde pong al ping', async () => {
    const cookie = await createUser('ping');
    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { cookie },
      payload: { name: 'WS ping', mode: 'competitive', maxPlayers: 3, isPrivate: false },
    });
    const code = JSON.parse(createResponse.body).lobby.code;

    const { ws, messages } = openSocket(code, cookie);
    await wait(1500);

    ws.send(JSON.stringify({ type: 'ping' }));
    await wait(1000);

    expect(messages.some((m) => m.type === 'pong')).toBe(true);
  });

  it('cierra la conexión de un usuario que no pertenece al lobby', async () => {
    const ownerCookie = await createUser('owner');
    const otherCookie = await createUser('other');

    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { cookie: ownerCookie },
      payload: { name: 'WS member', mode: 'competitive', maxPlayers: 3, isPrivate: false },
    });
    const code = JSON.parse(createResponse.body).lobby.code;

    const closeCode = await new Promise<number | undefined>((resolve) => {
      const { messages } = openSocket(code, otherCookie);
      // Si llegara a abrirse, el servidor lo cerraría con 4003.
      const check = setInterval(() => {
        if (messages.some((m) => m.type === 'lobby_state')) {
          clearInterval(check);
          resolve(101);
        }
      }, 200);
      setTimeout(() => {
        clearInterval(check);
        resolve(undefined);
      }, 3000);
    });

    expect(closeCode).not.toBe(101);
  });

  it('permite unirse a un lobby privado usando el código', async () => {
    const ownerCookie = await createUser('powner');
    const guestCookie = await createUser('pguest');

    const createResponse = await app.inject({
      method: 'POST',
      url: '/lobbies',
      headers: { cookie: ownerCookie },
      payload: { name: 'Privado', mode: 'competitive', maxPlayers: 3, isPrivate: true },
    });
    const code = JSON.parse(createResponse.body).lobby.code;

    const joinResponse = await app.inject({
      method: 'POST',
      url: `/lobbies/${code}/join`,
      headers: { cookie: guestCookie },
      payload: { characterId: 'cosa1' },
    });
    expect(joinResponse.statusCode).toBe(200);

    // Y no debe aparecer en el listado público.
    const listResponse = await app.inject({
      method: 'GET',
      url: '/lobbies',
      headers: { cookie: ownerCookie },
    });
    const list = JSON.parse(listResponse.body);
    expect(list.lobbies.some((l: any) => l.code === code)).toBe(false);
  });
});
