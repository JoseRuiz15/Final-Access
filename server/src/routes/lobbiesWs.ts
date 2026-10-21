import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import * as queries from '../db/queries/lobbies.js';
import { lobbyPlayers } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import {
  registerConnection,
  unregisterConnection,
  broadcastLobbyState,
  broadcastPlayers,
  type LobbySocket,
} from '../realtime/lobbyHub.js';

/**
 * Convierte el payload que entrega 'ws' (Buffer | ArrayBuffer | Buffer[]) en
 * un Buffer legible.
 */
function toBuffer(raw: any): Buffer {
  if (Buffer.isBuffer(raw)) return raw;
  if (Array.isArray(raw)) return Buffer.concat(raw);
  if (raw instanceof ArrayBuffer) return Buffer.from(raw);
  return Buffer.from(String(raw));
}

/**
 * WebSocket del lobby.
 *
 * El protocolo usa nombres en minúsculas y el payload en la raíz, que es lo
 * que espera el cliente (`src/stores/lobbies.js`):
 *   - recibe:  set_ready, set_character, ping
 *   - envía:    lobby_state, player_joined, player_left, player_ready,
 *               player_character, lobby_cancelled, match_started, error
 */
const lobbiesWsRoutes: FastifyPluginAsync = async (app) => {
  app.register(async (fastify) => {
    // El WebSocket reutiliza la cookie de sesión del navegador, así que se
    // autentica igual que el resto de rutas. Sin esto, cualquiera que supiera
    // el código del lobby vería la lista de jugadores.
    fastify.addHook('preHandler', async (req, reply) => {
      try {
        const payload = await req.jwtVerify<{ id: number; email: string; username: string }>();
        req.authUser = { id: payload.id, email: payload.email, username: payload.username };
      } catch {
        return reply.code(401).send({ error: 'Unauthorized', message: 'Token inválido o expirado' });
      }
    });

    fastify.get('/ws/lobby/:code', { websocket: true }, async (conn: any, req: any) => {
      // @fastify/websocket entrega un stream Duplex; el WebSocket real (con
      // send/close/readyState) está en `conn.socket`.
      const socket = conn.socket as LobbySocket;
      const { code } = req.params as { code: string };
      const userId = req.authUser!.id;

      const lobby = await queries.getLobbyByCode(code);
      if (!lobby) {
        socket.close(4004, 'Lobby no encontrado');
        return;
      }

      const lobbyId = lobby.lobby.id;

      // Solo los miembros del lobby (o su creador) pueden conectarse.
      const lobbyData = await queries.getLobbyWithPlayers(lobbyId);
      const isMember =
        lobby.lobby.creatorId === userId ||
        (lobbyData?.players ?? []).some((player) => player.userId === userId);

      if (!isMember) {
        socket.close(4003, 'No perteneces a este lobby');
        return;
      }

      registerConnection(lobbyId, socket);

      // Estado inicial para quien se conecta y resincronización para el resto:
      // `lobby_state` es la fuente de verdad y evita perder eventos.
      if (lobbyData) {
        socket.send(JSON.stringify({ type: 'lobby_state', lobby: lobbyData }));
      }
      await broadcastLobbyState(lobbyId, socket);

      socket.on('message', async (raw: any) => {
        let message: any;
        try {
          message = JSON.parse(toBuffer(raw).toString());
        } catch {
          socket.send(JSON.stringify({ type: 'error', message: 'Mensaje inválido' }));
          return;
        }

        try {
          switch (message.type) {
            case 'ping':
              socket.send(JSON.stringify({ type: 'pong' }));
              break;

            case 'set_ready': {
              // Se acepta el campo plano (`ready`) y también anidado (`payload.ready`).
              const ready = message.ready ?? message.payload?.ready;
              if (typeof ready !== 'boolean') break;
              await queries.setPlayerReady(lobbyId, userId, ready);
              await broadcastPlayers(lobbyId, 'player_ready');
              break;
            }

            case 'set_character': {
              const characterId = message.characterId ?? message.payload?.characterId;
              if (!characterId) break;
              await fastify.db
                .update(lobbyPlayers)
                .set({ characterId })
                .where(and(eq(lobbyPlayers.lobbyId, lobbyId), eq(lobbyPlayers.userId, userId)));
              await broadcastPlayers(lobbyId, 'player_character');
              break;
            }
          }
        } catch (err) {
          socket.send(JSON.stringify({
            type: 'error',
            message: err instanceof Error ? err.message : 'Error desconocido',
          }));
        }
      });

      socket.on('close', () => {
        unregisterConnection(lobbyId, socket);
        void broadcastPlayers(lobbyId, 'player_left').catch(() => {
          // El hub ya absorbe los errores: esto es solo un seguro extra.
        });
      });
    });
  });
};

export default fp(lobbiesWsRoutes);
