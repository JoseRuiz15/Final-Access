import { z } from 'zod';

// ============================================
// PROGRESSION SCHEMAS
// ============================================

export const completeLevelBodySchema = z.object({
  timeSec: z.number().int().positive(),
  stars: z.number().int().min(0).max(3),
  deaths: z.number().int().nonnegative(),
  keys: z.number().int().nonnegative(),
  correctKeys: z.number().int().nonnegative().default(0),
  kills: z.number().int().nonnegative(),
});

export const levelProgressResponseSchema = z.object({
  userId: z.number().int().positive(),
  levelId: z.number().int().positive(),
  completed: z.boolean(),
  stars: z.number().int().min(0).max(3),
  bestTimeSec: z.number().int().positive().nullable(),
  deaths: z.number().int().nonnegative(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const gameProgressResponseSchema = z.object({
  userId: z.number().int().positive(),
  currentLevelId: z.number().int().positive(),
  lives: z.number().int().nonnegative(),
  keysCollected: z.number().int().nonnegative(),
  enemiesKilled: z.number().int().nonnegative(),
  totalPlaytimeSec: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

export const completeLevelResponseSchema = z.object({
  ok: z.literal(true),
  levelProgress: levelProgressResponseSchema,
  gameProgress: gameProgressResponseSchema,
  xpGain: z.number().int().nonnegative(),
  coinGain: z.number().int().nonnegative(),
  coinBreakdown: z.object({
    completion: z.number().int().nonnegative(),
    stars: z.number().int().nonnegative(),
    speed: z.number().int().nonnegative(),
    enemies: z.number().int().nonnegative(),
    correctKeys: z.number().int().nonnegative(),
  }),
  coinsBalance: z.number().int().nonnegative(),
  newLevel: z.number().int().positive().optional(),
  unlockedCharacters: z.array(z.string()).optional(),
  missionRewards: z.array(z.object({
    missionId: z.number().int().positive(),
    rewardCoins: z.number().int().nonnegative(),
    rewardXp: z.number().int().nonnegative(),
  })).optional(),
});

export const fullProgressResponseSchema = z.object({
  ok: z.literal(true),
  gameProgress: gameProgressResponseSchema,
  levelProgress: z.array(levelProgressResponseSchema),
});

// ============================================
// MISSIONS SCHEMAS
// ============================================

export const userMissionWithMissionSchema = z.object({
  userId: z.number().int().positive(),
  missionId: z.number().int().positive(),
  currentProgress: z.number().int().nonnegative(),
  completed: z.boolean(),
  claimedAt: z.string().datetime().nullable(),
  resetDate: z.string().datetime(),
  mission: z.object({
    id: z.number().int().positive(),
    title: z.string(),
    description: z.string(),
    missionType: z.enum(['play_matches', 'kill_enemies', 'win_matches', 'collect_keys', 'complete_level']),
    targetValue: z.number().int().positive(),
    rewardCoins: z.number().int().nonnegative(),
    rewardXp: z.number().int().nonnegative(),
    isDaily: z.boolean(),
    isActive: z.boolean(),
  }),
});

export const missionsResponseSchema = z.object({
  ok: z.literal(true),
  missions: z.array(userMissionWithMissionSchema),
});

export const claimMissionResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
  rewardCoins: z.number().int().nonnegative(),
  rewardXp: z.number().int().nonnegative(),
  newCoinsBalance: z.number().int().nonnegative(),
  newXp: z.number().int().nonnegative(),
  newLevel: z.number().int().positive().optional(),
});

// Type exports
export type CompleteLevelBody = z.infer<typeof completeLevelBodySchema>;
export type LevelProgressResponse = z.infer<typeof levelProgressResponseSchema>;
export type GameProgressResponse = z.infer<typeof gameProgressResponseSchema>;
export type CompleteLevelResponse = z.infer<typeof completeLevelResponseSchema>;
export type FullProgressResponse = z.infer<typeof fullProgressResponseSchema>;
export type UserMissionWithMission = z.infer<typeof userMissionWithMissionSchema>;
export type MissionsResponse = z.infer<typeof missionsResponseSchema>;
export type ClaimMissionResponse = z.infer<typeof claimMissionResponseSchema>;
