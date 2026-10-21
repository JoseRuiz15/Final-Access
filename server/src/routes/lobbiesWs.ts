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

      // Los listeners se registran de INMEDIATO, antes de tocar la base de
      // datos. Si se registrations después, los mensajes que el cliente envía
      // mientras se consulta el lobby se pierden (el primer "listo" del
      // jugador se quedaba colgado cuando la base de datos tardaba).
      let conectado = false;
      let lobbyId = 0;
      const pendientes: any[] = [];

      const procesarMensaje = async (raw: any) => {
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
      };

      socket.on('message', async (raw: any) => {
        if (!conectado) {
          pendientes.push(raw);
          return;
        }
        await procesarMensaje(raw);
      });

      socket.on('close', () => {
        if (!lobbyId) return;
        unregisterConnection(lobbyId, socket);
        void broadcastPlayers(lobbyId, 'player_left').catch(() => {
          // El hub ya absorbe los errores: esto es solo un seguro extra.
        });
      });

      // A partir de aquí sí se consulta la base de datos.
      const lobby = await queries.getLobbyWithPlayersByCode(code);
      if (!lobby) {
        socket.close(4004, 'Lobby no encontrado');
        return;
      }

      lobbyId = lobby.id;

      // Solo los miembros del lobby (o su creador) pueden conectarse.
      const esMiembro =
        lobby.creatorId === userId || (lobby.players ?? []).some((p) => p.userId === userId);
      if (!esMiembro) {
        socket.close(4003, 'No perteneces a este lobby');
        return;
      }

      registerConnection(lobbyId, socket);

      // Estado inicial para quien se conecta y resincronización para el resto:
      // `lobby_state` es la fuente de verdad y evita perder eventos.
      socket.send(JSON.stringify({ type: 'lobby_state', lobby }));
      await broadcastLobbyState(lobbyId, socket, lobby);

      // A partir de este momento los mensajes se procesan al instante.
      conectado = true;
      for (const raw of pendientes) {
        await procesarMensaje(raw);
      }
      pendientes.length = 0;
    });
  });
};

export default fp(lobbiesWsRoutes);
