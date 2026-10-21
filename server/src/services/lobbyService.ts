import * as queries from '../db/queries/lobbies.js';
import { broadcast, broadcastLobbyState, broadcastPlayers } from '../realtime/lobbyHub.js';

// ============================================
// LOBBY SERVICE
// ============================================

export async function createLobby(userId: number, data: {
  name: string;
  mode: 'competitive' | 'collaborative';
  maxPlayers: number;
  isPrivate: boolean;
  levelId?: number;
}) {
  const lobby = await queries.createLobby({ ...data, creatorId: userId });
  await broadcastLobbyState(lobby.id);
  return lobby;
}

export async function getLobby(code: string) {
  return queries.getLobbyByCode(code);
}

export async function getLobbyDetailsByCode(code: string) {
  const lobby = await queries.getLobbyByCode(code);
  if (!lobby) return null;
  return queries.getLobbyWithPlayers(lobby.lobby.id);
}

export async function getLobbyDetails(lobbyId: number) {
  return queries.getLobbyWithPlayers(lobbyId);
}

export async function listLobbies(query: {
  page: number;
  limit: number;
  mode?: 'competitive' | 'collaborative';
}) {
  return queries.getPublicLobbies(query);
}

export async function joinLobby(userId: number, lobbyCode: string, characterId?: string) {
  const lobby = await queries.getLobbyByCode(lobbyCode);
  if (!lobby) throw new Error('Lobby no encontrado');

  const result = await queries.joinLobby(lobby.lobby.id, userId, characterId);
  await broadcastPlayers(lobby.lobby.id, 'player_joined');
  return result;
}

export async function leaveLobby(userId: number, lobbyCode: string) {
  const lobby = await queries.getLobbyByCode(lobbyCode);
  if (!lobby) throw new Error('Lobby no encontrado');

  const wasCreator = lobby.lobby.creatorId === userId;

  await queries.leaveLobby(lobby.lobby.id, userId);

  if (wasCreator) {
    // Si el creador se va, el lobby queda cancelado: hay que avisarlo.
    broadcast(lobby.lobby.id, { type: 'lobby_cancelled' });
    await broadcastLobbyState(lobby.lobby.id);
  } else {
    await broadcastPlayers(lobby.lobby.id, 'player_left');
  }

  return { ok: true, message: 'Has salido del lobby' };
}

export async function setReady(userId: number, lobbyCode: string, ready: boolean) {
  const lobby = await queries.getLobbyByCode(lobbyCode);
  if (!lobby) throw new Error('Lobby no encontrado');

  const result = await queries.setPlayerReady(lobby.lobby.id, userId, ready);
  await broadcastPlayers(lobby.lobby.id, 'player_ready');
  return result;
}

export async function startLobby(userId: number, lobbyCode: string) {
  const lobby = await queries.getLobbyByCode(lobbyCode);
  if (!lobby) throw new Error('Lobby no encontrado');

  const result = await queries.startLobby(lobby.lobby.id, userId);
  await broadcastLobbyState(lobby.lobby.id);
  broadcast(lobby.lobby.id, { type: 'match_started' });
  return result;
}

export async function cancelLobby(userId: number, lobbyCode: string) {
  const lobby = await queries.getLobbyByCode(lobbyCode);
  if (!lobby) throw new Error('Lobby no encontrado');

  await queries.cancelLobby(lobby.lobby.id, userId);
  broadcast(lobby.lobby.id, { type: 'lobby_cancelled' });
  await broadcastLobbyState(lobby.lobby.id);
  return { ok: true, message: 'Lobby cancelado' };
}
