import { z } from 'zod';

// ============================================
// LOBBIES SCHEMAS
// ============================================

export const createLobbyBodySchema = z.object({
  name: z.string().min(1).max(64),
  mode: z.enum(['competitive', 'collaborative']),
  maxPlayers: z.number().int().min(2).max(10).default(5),
  isPrivate: z.boolean().default(true),
  levelId: z.number().int().positive().optional(),
});

export const joinLobbyBodySchema = z.object({
  characterId: z.string().min(1).max(32).optional(),
});

export const lobbyResponseSchema = z.object({
  ok: z.literal(true),
  lobby: z.object({
    id: z.number().int().positive(),
    code: z.string().length(8),
    name: z.string(),
    mode: z.enum(['competitive', 'collaborative']),
    maxPlayers: z.number().int().min(2).max(10),
    isPrivate: z.boolean(),
    creatorId: z.number().int().positive(),
    status: z.enum(['waiting', 'in_progress', 'finished', 'cancelled']),
    levelId: z.number().int().positive().nullable(),
    createdAt: z.string().datetime(),
    startedAt: z.string().datetime().nullable(),
    endedAt: z.string().datetime().nullable(),
    players: z.array(z.object({
      userId: z.number().int().positive(),
      username: z.string(),
      slot: z.number().int().positive(),
      characterId: z.string().nullable(),
      isReady: z.boolean(),
      isCreator: z.boolean(),
      joinedAt: z.string().datetime(),
    })),
  }),
});

export const lobbiesListResponseSchema = z.object({
  ok: z.literal(true),
  lobbies: z.array(z.object({
    id: z.number().int().positive(),
    code: z.string().length(8),
    name: z.string(),
    mode: z.enum(['competitive', 'collaborative']),
    maxPlayers: z.number().int().min(2).max(10),
    isPrivate: z.boolean(),
    status: z.enum(['waiting', 'in_progress', 'finished', 'cancelled']),
    currentPlayers: z.number().int().nonnegative(),
    levelId: z.number().int().positive().nullable(),
    createdAt: z.string().datetime(),
  })),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export const joinResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
  slot: z.number().int().positive(),
});

export const readyResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
  allReady: z.boolean(),
});

export const startResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
  matchId: z.number().int().positive().optional(),
});

// Type exports
export type CreateLobbyBody = z.infer<typeof createLobbyBodySchema>;
export type JoinLobbyBody = z.infer<typeof joinLobbyBodySchema>;
export type LobbyResponse = z.infer<typeof lobbyResponseSchema>;
export type LobbiesListResponse = z.infer<typeof lobbiesListResponseSchema>;
export type JoinResponse = z.infer<typeof joinResponseSchema>;
export type ReadyResponse = z.infer<typeof readyResponseSchema>;
export type StartResponse = z.infer<typeof startResponseSchema>;