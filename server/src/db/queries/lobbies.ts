import { db } from '../pool.js';
import { lobbies, lobbyPlayers, users, characters, levels, matches } from '../schema.js';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import type { Lobby, LobbyPlayer, User, Character, Level } from '../schema.js';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// LOBBIES QUERIES
// ============================================

function generateLobbyCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function createLobby(data: {
  name: string;
  mode: 'competitive' | 'collaborative';
  maxPlayers: number;
  isPrivate: boolean;
  creatorId: number;
  levelId?: number;
}): Promise<Lobby> {
  const code = generateLobbyCode();
  
  const result = await db.insert(lobbies).values({
    code,
    name: data.name,
    mode: data.mode,
    maxPlayers: data.maxPlayers,
    isPrivate: data.isPrivate,
    creatorId: data.creatorId,
    levelId: data.levelId ?? null,
    status: 'waiting',
  }).returning();
  
  const lobby = result[0];
  
  // Add creator as first player
  await db.insert(lobbyPlayers).values({
    lobbyId: lobby.id,
    userId: data.creatorId,
    slot: 1,
    characterId: null,
    isReady: true, // Creator is ready by default
  });
  
  return lobby;
}

export async function getLobbyByCode(code: string) {
  const result = await db
    .select({
      lobby: lobbies,
      creator: users,
    })
    .from(lobbies)
    .innerJoin(users, eq(lobbies.creatorId, users.id))
    .where(eq(lobbies.code, code))
    .limit(1);
  
  return result[0] ?? null;
}

export async function getLobbyById(lobbyId: number) {
  const result = await db
    .select({
      lobby: lobbies,
      creator: users,
    })
    .from(lobbies)
    .innerJoin(users, eq(lobbies.creatorId, users.id))
    .where(eq(lobbies.id, lobbyId))
    .limit(1);
  
  return result[0] ?? null;
}

export async function getLobbyWithPlayers(lobbyId: number) {
  const lobbyResult = await getLobbyById(lobbyId);
  if (!lobbyResult) return null;
  
  const playersResult = await db
    .select({
      player: lobbyPlayers,
      user: users,
      character: characters,
    })
    .from(lobbyPlayers)
    .innerJoin(users, eq(lobbyPlayers.userId, users.id))
    .leftJoin(characters, eq(lobbyPlayers.characterId, characters.id))
    .where(eq(lobbyPlayers.lobbyId, lobbyId))
    .orderBy(lobbyPlayers.slot);
  
  const players = playersResult.map(row => ({
    userId: row.user.id,
    username: row.user.username,
    slot: row.player.slot,
    characterId: row.player.characterId,
    character: row.character ?? null,
    isReady: row.player.isReady,
    isCreator: row.player.userId === lobbyResult.lobby.creatorId,
    joinedAt: row.player.joinedAt.toISOString(),
  }));
  
  return {
    ...lobbyResult.lobby,
    creator: lobbyResult.creator,
    players,
  };
}

export async function getPublicLobbies(query: {
  page: number;
  limit: number;
  mode?: 'competitive' | 'collaborative';
  status?: 'waiting' | 'in_progress' | 'finished' | 'cancelled';
}) {
  const conditions = [
    eq(lobbies.isPrivate, false),
    eq(lobbies.status, 'waiting'),
  ];
  
  if (query.mode) conditions.push(eq(lobbies.mode, query.mode));
  
  const [lobbiesList, totalResult] = await Promise.all([
    db
      .select({
        lobby: lobbies,
        creator: users,
        playerCount: count(lobbyPlayers.userId),
      })
      .from(lobbies)
      .innerJoin(users, eq(lobbies.creatorId, users.id))
      .leftJoin(lobbyPlayers, eq(lobbies.id, lobbyPlayers.lobbyId))
      .where(and(...conditions))
      .groupBy(lobbies.id, users.id)
      .orderBy(desc(lobbies.createdAt))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit),
    db
      .select({ count: count() })
      .from(lobbies)
      .where(and(...conditions)),
  ]);
  
  const total = totalResult[0]?.count ?? 0;
  
  return {
    lobbies: lobbiesList.map(row => ({
      id: row.lobby.id,
      code: row.lobby.code,
      name: row.lobby.name,
      mode: row.lobby.mode,
      maxPlayers: row.lobby.maxPlayers,
      isPrivate: row.lobby.isPrivate,
      status: row.lobby.status,
      currentPlayers: Number(row.playerCount),
      levelId: row.lobby.levelId,
      createdAt: row.lobby.createdAt.toISOString(),
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function joinLobby(lobbyId: number, userId: number, characterId?: string): Promise<{ slot: number }> {
  const lobby = await getLobbyById(lobbyId);
  if (!lobby) throw new Error('Lobby no encontrado');
  if (lobby.lobby.status !== 'waiting') throw new Error('El lobby no está disponible');
  if (lobby.lobby.isPrivate) throw new Error('El lobby es privado');
  
  // Check if already in lobby
  const existing = await db
    .select()
    .from(lobbyPlayers)
    .where(and(eq(lobbyPlayers.lobbyId, lobbyId), eq(lobbyPlayers.userId, userId)))
    .limit(1);
  
  if (existing[0]) throw new Error('Ya estás en este lobby');
  
  // Check capacity
  const playerCount = await db
    .select({ count: count() })
    .from(lobbyPlayers)
    .where(eq(lobbyPlayers.lobbyId, lobbyId));
  
  if (Number(playerCount[0]?.count ?? 0) >= lobby.lobby.maxPlayers) {
    throw new Error('Lobby lleno');
  }
  
  // Find available slot
  const occupiedSlots = await db
    .select({ slot: lobbyPlayers.slot })
    .from(lobbyPlayers)
    .where(eq(lobbyPlayers.lobbyId, lobbyId));
  
  const occupied = new Set(occupiedSlots.map(p => p.slot));
  let slot = 1;
  while (occupied.has(slot)) slot++;
  
  // Validate character if provided
  if (characterId) {
    const char = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1);
    if (!char[0]) throw new Error('Personaje no encontrado');
  }
  
  await db.insert(lobbyPlayers).values({
    lobbyId,
    userId,
    slot,
    characterId: characterId ?? null,
    isReady: false,
  });
  
  return { slot };
}

export async function leaveLobby(lobbyId: number, userId: number): Promise<void> {
  const lobby = await getLobbyById(lobbyId);
  if (!lobby) throw new Error('Lobby no encontrado');
  
  // If creator leaves, cancel lobby
  if (lobby.lobby.creatorId === userId) {
    await db.update(lobbies)
      .set({ status: 'cancelled', endedAt: new Date() })
      .where(eq(lobbies.id, lobbyId));
    await db.delete(lobbyPlayers).where(eq(lobbyPlayers.lobbyId, lobbyId));
    return;
  }
  
  // Remove player
  await db.delete(lobbyPlayers)
    .where(and(eq(lobbyPlayers.lobbyId, lobbyId), eq(lobbyPlayers.userId, userId)));
  
  // Check if lobby is empty
  const remaining = await db
    .select({ count: count() })
    .from(lobbyPlayers)
    .where(eq(lobbyPlayers.lobbyId, lobbyId));
  
  if (Number(remaining[0]?.count ?? 0) === 0) {
    await db.update(lobbies)
      .set({ status: 'cancelled', endedAt: new Date() })
      .where(eq(lobbies.id, lobbyId));
  }
}

export async function setPlayerReady(lobbyId: number, userId: number, ready: boolean): Promise<{ allReady: boolean }> {
  const lobby = await getLobbyById(lobbyId);
  if (!lobby) throw new Error('Lobby no encontrado');
  if (lobby.lobby.status !== 'waiting') throw new Error('El lobby no está en espera');
  
  await db.update(lobbyPlayers)
    .set({ isReady: ready })
    .where(and(eq(lobbyPlayers.lobbyId, lobbyId), eq(lobbyPlayers.userId, userId)));
  
  // Check if all players ready
  const players = await db
    .select()
    .from(lobbyPlayers)
    .where(eq(lobbyPlayers.lobbyId, lobbyId));
  
  const allReady = players.length > 0 && players.every(p => p.isReady);
  
  return { allReady };
}

export async function startLobby(lobbyId: number, userId: number): Promise<{ matchId?: number }> {
  const lobby = await getLobbyById(lobbyId);
  if (!lobby) throw new Error('Lobby no encontrado');
  if (lobby.lobby.creatorId !== userId) throw new Error('Solo el creador puede iniciar');
  if (lobby.lobby.status !== 'waiting') throw new Error('El lobby ya no está en espera');
  
  const players = await db
    .select()
    .from(lobbyPlayers)
    .where(eq(lobbyPlayers.lobbyId, lobbyId));
  
  if (players.length < 2) throw new Error('Se necesitan al menos 2 jugadores');
  
  const allReady = players.every(p => p.isReady);
  if (!allReady) throw new Error('Todos los jugadores deben estar listos');
  
  // Update lobby status
  await db.update(lobbies)
    .set({ status: 'in_progress', startedAt: new Date() })
    .where(eq(lobbies.id, lobbyId));
  
  // Create match record
  const matchResult = await db
    .insert(matches)
    .values({
      mode: lobby.lobby.mode,
      levelId: lobby.lobby.levelId ?? 1,
      durationMs: 0,
      startedAt: new Date(),
      endedAt: new Date(),
    })
    .returning();
  
  return { matchId: matchResult[0]?.id };
}

export async function cancelLobby(lobbyId: number, userId: number): Promise<void> {
  const lobby = await getLobbyById(lobbyId);
  if (!lobby) throw new Error('Lobby no encontrado');
  if (lobby.lobby.creatorId !== userId) throw new Error('Solo el creador puede cancelar');
  
  await db.update(lobbies)
    .set({ status: 'cancelled', endedAt: new Date() })
    .where(eq(lobbies.id, lobbyId));
}