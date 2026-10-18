import { z } from 'zod';
import { profileSchema, characterSchema, playerCharacterSchema } from '../db/schema.js';

// ============================================
// PROFILE SCHEMAS
// ============================================

export const updateProfileBodySchema = z.object({
  displayName: z.string().min(1).max(32).optional(),
});

export const profileResponseSchema = z.object({
  ok: z.literal(true),
  profile: z.object({
    userId: z.number().int().positive(),
    displayName: z.string(),
    level: z.number().int().positive(),
    xp: z.number().int().nonnegative(),
    coins: z.number().int().nonnegative(),
    equippedCharacterId: z.string().nullable(),
    totalPlaytimeSec: z.number().int().nonnegative(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  equippedCharacter: characterSchema.nullable(),
  unlockedCharacters: z.array(z.object({
    characterId: z.string(),
    character: characterSchema,
    unlockedAt: z.string().datetime(),
    skinVariant: z.string(),
  })),
});

// ============================================
// CHARACTERS SCHEMAS
// ============================================

export const characterListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']).optional(),
  attackType: z.enum(['melee', 'ranged', 'magic']).optional(),
  isActive: z.coerce.boolean().default(true),
});

export const unlockCharacterBodySchema = z.object({
  // No body needed, characterId comes from params
});

export const equipCharacterBodySchema = z.object({
  characterId: z.string().min(1).max(32),
});

export const charactersListResponseSchema = z.object({
  ok: z.literal(true),
  characters: z.array(characterSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export const unlockResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
  character: z.object({
    characterId: z.string(),
    unlockedAt: z.string().datetime(),
    skinVariant: z.string(),
  }),
  newCoinsBalance: z.number().int().nonnegative(),
});

export const equipResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
  equippedCharacterId: z.string(),
});

// Type exports
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;
export type CharacterListQuery = z.infer<typeof characterListQuerySchema>;
export type UnlockCharacterBody = z.infer<typeof unlockCharacterBodySchema>;
export type EquipCharacterBody = z.infer<typeof equipCharacterBodySchema>;
export type CharactersListResponse = z.infer<typeof charactersListResponseSchema>;
export type UnlockResponse = z.infer<typeof unlockResponseSchema>;
export type EquipResponse = z.infer<typeof equipResponseSchema>;