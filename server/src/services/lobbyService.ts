import * as queries from '../db/queries/lobbies.js';

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
  return queries.createLobby({ ...data, creatorId: userId });
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
  
  return queries.joinLobby(lobby.lobby.id, userId, characterId);
}

export async function leaveLobby(userId: number, lobbyCode: string) {
  const lobby = await queries.getLobbyByCode(lobbyCode);
  if (!lobby) throw new Error('Lobby no encontrado');
  
  await queries.leaveLobby(lobby.lobby.id, userId);
  return { ok: true, message: 'Has salido del lobby' };
}

export async function setReady(userId: number, lobbyCode: string, ready: boolean) {
  const lobby = await queries.getLobbyByCode(lobbyCode);
  if (!lobby) throw new Error('Lobby no encontrado');
  
  return queries.setPlayerReady(lobby.lobby.id, userId, ready);
}

export async function startLobby(userId: number, lobbyCode: string) {
  const lobby = await queries.getLobbyByCode(lobbyCode);
  if (!lobby) throw new Error('Lobby no encontrado');
  
  return queries.startLobby(lobby.lobby.id, userId);
}

export async function cancelLobby(userId: number, lobbyCode: string) {
  const lobby = await queries.getLobbyByCode(lobbyCode);
  if (!lobby) throw new Error('Lobby no encontrado');
  
  await queries.cancelLobby(lobby.lobby.id, userId);
  return { ok: true, message: 'Lobby cancelado' };
}