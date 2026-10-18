import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import * as queries from '../db/queries/lobbies.js';
import { lobbyPlayers } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// Map para almacenar conexiones WebSocket por lobby
const lobbyConnections = new Map<number, Set<any>>();

function broadcastToLobby(lobbyId: number, message: object, exclude?: any) {
  const connections = lobbyConnections.get(lobbyId);
  if (!connections) return;
  
  const data = JSON.stringify(message);
  for (const ws of connections) {
    if (ws !== exclude && ws.readyState === 1) { // WebSocket.OPEN = 1
      ws.send(data);
    }
  }
}

function addConnection(lobbyId: number, ws: any) {
  if (!lobbyConnections.has(lobbyId)) {
    lobbyConnections.set(lobbyId, new Set());
  }
  lobbyConnections.get(lobbyId)!.add(ws);
}

function removeConnection(lobbyId: number, ws: any) {
  const connections = lobbyConnections.get(lobbyId);
  if (connections) {
    connections.delete(ws);
    if (connections.size === 0) {
      lobbyConnections.delete(lobbyId);
    }
  }
}

const lobbiesWsRoutes: FastifyPluginAsync = async (app) => {
  // WebSocket endpoint para lobby
  app.register(async (fastify) => {
    fastify.get('/ws/lobby/:code', { websocket: true }, async (ws: any, req: any) => {
      const params = req.params as { code: string };
      const code = params.code;
      
      // Validar lobby
      const lobby = await queries.getLobbyByCode(code);
      if (!lobby) {
        ws.close(4004, 'Lobby no encontrado');
        return;
      }
      
      const lobbyId = lobby.lobby.id;
      addConnection(lobbyId, ws);
      
      // Enviar estado inicial
      const lobbyData = await queries.getLobbyWithPlayers(lobbyId);
      if (lobbyData) {
        ws.send(JSON.stringify({
          type: 'LOBBY_STATE',
          payload: lobbyData,
        }));
      }
      
      // Notificar a otros que alguien se conectó
      broadcastToLobby(lobbyId, {
        type: 'PLAYER_CONNECTED',
        payload: { userId: req.authUser?.id },
      }, ws);
      
      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          
          switch (message.type) {
            case 'PING':
              ws.send(JSON.stringify({ type: 'PONG' }));
              break;
              
            case 'SET_READY':
              if (message.payload?.ready !== undefined) {
                await queries.setPlayerReady(lobbyId, req.authUser!.id, message.payload.ready);
                
                // Broadcast updated state
                const updatedLobby = await queries.getLobbyWithPlayers(lobbyId);
                broadcastToLobby(lobbyId, {
                  type: 'LOBBY_STATE',
                  payload: updatedLobby,
                });
              }
              break;
              
            case 'CHANGE_CHARACTER':
              if (message.payload?.characterId) {
                // Update player's character
                await fastify.db
                  .update(lobbyPlayers)
                  .set({ characterId: message.payload.characterId })
                  .where(and(
                    eq(lobbyPlayers.lobbyId, lobbyId),
                    eq(lobbyPlayers.userId, req.authUser!.id)
                  ));
                
                const updatedLobby = await queries.getLobbyWithPlayers(lobbyId);
                broadcastToLobby(lobbyId, {
                  type: 'LOBBY_STATE',
                  payload: updatedLobby,
                });
              }
              break;
          }
        } catch (err) {
          ws.send(JSON.stringify({
            type: 'ERROR',
            payload: { message: err instanceof Error ? err.message : 'Error desconocido' },
          }));
        }
      });
      
      ws.on('close', () => {
        removeConnection(lobbyId, ws);
        
        // Notificar a otros que alguien se desconectó
        broadcastToLobby(lobbyId, {
          type: 'PLAYER_DISCONNECTED',
          payload: { userId: req.authUser?.id },
        });
      });
    });
  });
};

export default fp(lobbiesWsRoutes);