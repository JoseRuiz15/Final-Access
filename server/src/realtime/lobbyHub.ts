import * as queries from '../db/queries/lobbies.js';

/**
 * Registro central de conexiones WebSocket por lobby.
 *
 * Las conexiones viven en memoria del proceso: al reiniciar el servidor
 * (deploy en Railway) se pierden y el cliente se reconecta. El estado real
 * siempre se lee de la base de datos, así que nunca queda desincronizado.
 */

export interface LobbySocket {
  readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  on(event: string, listener: (...args: any[]) => void): void;
}

/** WebSocket.OPEN */
const OPEN = 1;

const lobbyConnections = new Map<number, Set<LobbySocket>>();

export function registerConnection(lobbyId: number, ws: LobbySocket): void {
  let connections = lobbyConnections.get(lobbyId);
  if (!connections) {
    connections = new Set<LobbySocket>();
    lobbyConnections.set(lobbyId, connections);
  }
  connections.add(ws);
}

export function unregisterConnection(lobbyId: number, ws: LobbySocket): void {
  const connections = lobbyConnections.get(lobbyId);
  if (!connections) return;
  connections.delete(ws);
  if (connections.size === 0) {
    lobbyConnections.delete(lobbyId);
  }
}

/** Envía un mensaje a todas las conexiones del lobby (opcionalmente excluyendo una). */
export function broadcast(lobbyId: number, message: object, exclude?: LobbySocket): void {
  const connections = lobbyConnections.get(lobbyId);
  if (!connections) return;

  const data = JSON.stringify(message);
  for (const ws of connections) {
    if (ws === exclude) continue;
    if (ws.readyState !== OPEN) {
      // Conexión caída: se limpia para no filtrar sockets muertos.
      connections.delete(ws);
      continue;
    }
    try {
      ws.send(data);
    } catch {
      connections.delete(ws);
    }
  }
}

/**
 * Envía el estado completo del lobby. El frontend reemplaza su estado local
 * con `message.lobby`, así que este mensaje es la fuente de verdad.
 *
 * Los errores se absorben aquí a propósito: difundir el estado es un efecto
 * secundario y no debe tumbar la operación REST que lo disparó (ni dejar
 * promesas rechazadas sin capturar durante un cierre del servidor).
 *
 * @param data Estado ya consultado, para no repetir la consulta a la BD.
 */
export async function broadcastLobbyState(
  lobbyId: number,
  exclude?: LobbySocket,
  data?: unknown,
): Promise<void> {
  try {
    const lobby = data ?? (await queries.getLobbyWithPlayers(lobbyId));
    if (!lobby) return;
    broadcast(lobbyId, { type: 'lobby_state', lobby }, exclude);
  } catch (err) {
    console.error('No se pudo difundir el estado del lobby:', err);
  }
}

/** Envía solo la lista de jugadores (eventos player_joined / player_left / ...). */
export async function broadcastPlayers(lobbyId: number, type: string): Promise<void> {
  try {
    const lobby = await queries.getLobbyWithPlayers(lobbyId);
    if (!lobby) return;
    broadcast(lobbyId, { type, players: lobby.players });
  } catch (err) {
    console.error('No se pudo difundir la lista de jugadores:', err);
  }
}
