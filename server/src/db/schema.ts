import {
  pgTable,
  bigserial,
  varchar,
  boolean,
  timestamp,
  smallint,
  bigint,
  integer,
  primaryKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ============================================
// TABLAS (Drizzle ORM)
// ============================================

// --- USERS ---
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  username: varchar('username', { length: 32 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  provider: varchar('provider', { length: 32 }).default('local'),
  providerId: varchar('provider_id', { length: 128 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// --- EMAIL VERIFICATIONS ---
export const emailVerifications = pgTable('email_verifications', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  attempts: smallint('attempts').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  emailIdx: index('idx_email_verifications_email').on(t.email),
}));

// --- PLAYER_PROFILES ---
export const playerProfiles = pgTable('player_profiles', {
  userId: bigint('user_id', { mode: 'number' }).primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 32 }).notNull(),
  level: smallint('level').notNull().default(1),
  xp: bigint('xp', { mode: 'number' }).notNull().default(0),
  coins: bigint('coins', { mode: 'number' }).notNull().default(0),
  equippedCharacterId: varchar('equipped_character_id', { length: 32 }),
  totalPlaytimeSec: bigint('total_playtime_sec', { mode: 'number' }).notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- CHARACTERS ---
export const characters = pgTable('characters', {
  id: varchar('id', { length: 32 }).primaryKey(),
  name: varchar('name', { length: 64 }).notNull(),
  rarity: varchar('rarity', { length: 16 }).notNull().$type<'common'|'rare'|'epic'|'legendary'|'mythic'>(),
  attackType: varchar('attack_type', { length: 16 }).notNull().$type<'melee'|'ranged'|'magic'>(),
  baseHealth: smallint('base_health').notNull(),
  baseSpeed: smallint('base_speed').notNull(),
  baseDamage: smallint('base_damage').notNull(),
  textureKey: varchar('texture_key', { length: 64 }).notNull(),
  walkTexture: varchar('walk_texture', { length: 64 }),
  abilityName: varchar('ability_name', { length: 64 }),
  abilityDesc: varchar('ability_desc', { length: 1024 }),
  unlockCost: bigint('unlock_cost', { mode: 'number' }).notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- PLAYER_CHARACTERS ---
export const playerCharacters = pgTable('player_characters', {
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  characterId: varchar('character_id', { length: 32 }).notNull().references(() => characters.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull().defaultNow(),
  skinVariant: varchar('skin_variant', { length: 32 }).default('default'),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.characterId] }),
}));

// --- LEVELS ---
export const levels = pgTable('levels', {
  id: smallint('id').primaryKey(),
  name: varchar('name', { length: 64 }).notNull(),
  description: varchar('description', { length: 1024 }).notNull(),
  mapImageUrl: varchar('map_image_url', { length: 255 }),
  unlockOrder: smallint('unlock_order').notNull().unique(),
  isBossLevel: boolean('is_boss_level').notNull().default(false),
  parTimeSec: integer('par_time_sec'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- LEVEL_PROGRESS ---
export const levelProgress = pgTable('level_progress', {
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  levelId: smallint('level_id').notNull().references(() => levels.id, { onDelete: 'cascade' }),
  completed: boolean('completed').notNull().default(false),
  stars: smallint('stars').notNull().default(0),
  bestTimeSec: integer('best_time_sec'),
  deaths: smallint('deaths').notNull().default(0),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.levelId] }),
}));

// --- GAME_PROGRESS ---
export const gameProgress = pgTable('game_progress', {
  userId: bigint('user_id', { mode: 'number' }).primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  currentLevelId: smallint('current_level_id').notNull().references(() => levels.id).default(1),
  lives: smallint('lives').notNull().default(5),
  keysCollected: smallint('keys_collected').notNull().default(0),
  enemiesKilled: integer('enemies_killed').notNull().default(0),
  totalPlaytimeSec: bigint('total_playtime_sec', { mode: 'number' }).notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- MISSIONS ---
export const missions = pgTable('missions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  title: varchar('title', { length: 128 }).notNull(),
  description: varchar('description', { length: 1024 }).notNull(),
  missionType: varchar('mission_type', { length: 32 }).notNull().$type<'play_matches'|'kill_enemies'|'win_matches'|'collect_keys'|'complete_level'>(),
  targetValue: integer('target_value').notNull(),
  rewardCoins: bigint('reward_coins', { mode: 'number' }).notNull().default(0),
  rewardXp: bigint('reward_xp', { mode: 'number' }).notNull().default(0),
  isDaily: boolean('is_daily').notNull().default(true),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- USER_MISSIONS ---
export const userMissions = pgTable('user_missions', {
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  missionId: bigint('mission_id', { mode: 'number' }).notNull().references(() => missions.id, { onDelete: 'cascade' }),
  currentProgress: integer('current_progress').notNull().default(0),
  completed: boolean('completed').notNull().default(false),
  claimedAt: timestamp('claimed_at', { withTimezone: true }),
  resetDate: timestamp('reset_date', { withTimezone: false }).notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.missionId, t.resetDate] }),
}));

// --- LOBBIES ---
export const lobbies = pgTable('lobbies', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  code: varchar('code', { length: 8 }).notNull().unique(),
  name: varchar('name', { length: 64 }).notNull(),
  mode: varchar('mode', { length: 32 }).notNull().$type<'competitive'|'collaborative'>(),
  maxPlayers: smallint('max_players').notNull().default(5),
  isPrivate: boolean('is_private').notNull().default(true),
  creatorId: bigint('creator_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 16 }).notNull().default('waiting').$type<'waiting'|'in_progress'|'finished'|'cancelled'>(),
  levelId: smallint('level_id').references(() => levels.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
});

// --- LOBBY_PLAYERS ---
export const lobbyPlayers = pgTable('lobby_players', {
  lobbyId: bigint('lobby_id', { mode: 'number' }).notNull().references(() => lobbies.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  slot: smallint('slot').notNull(),
  characterId: varchar('character_id', { length: 32 }).references(() => characters.id),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  isReady: boolean('is_ready').notNull().default(false),
}, (t) => ({
  pk: primaryKey({ columns: [t.lobbyId, t.userId] }),
  uniqueSlot: uniqueIndex('unique_lobby_slot').on(t.lobbyId, t.slot),
}));

// --- GAME_SERVERS ---
export const gameServers = pgTable('game_servers', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 64 }).notNull(),
  region: varchar('region', { length: 32 }).notNull(),
  mode: varchar('mode', { length: 32 }).notNull().$type<'competitive'|'collaborative'>(),
  maxPlayers: smallint('max_players').notNull(),
  currentPlayers: smallint('current_players').notNull().default(0),
  status: varchar('status', { length: 16 }).notNull().default('online').$type<'online'|'maintenance'|'full'|'offline'>(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- MATCHES ---
export const matches = pgTable('matches', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  mode: varchar('mode', { length: 32 }).notNull().$type<'solo'|'competitive'|'collaborative'>(),
  levelId: smallint('level_id').notNull().references(() => levels.id),
  winnerId: bigint('winner_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
  durationMs: integer('duration_ms').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }).notNull(),
});

// --- MATCH_STATS ---
export const matchStats = pgTable('match_stats', {
  matchId: bigint('match_id', { mode: 'number' }).notNull().references(() => matches.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  kills: smallint('kills').notNull().default(0),
  deaths: smallint('deaths').notNull().default(0),
  keysCollected: smallint('keys_collected').notNull().default(0),
  damageDealt: integer('damage_dealt').notNull().default(0),
  coinsEarned: bigint('coins_earned', { mode: 'number' }).notNull().default(0),
  xpEarned: bigint('xp_earned', { mode: 'number' }).notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.matchId, t.userId] }),
}));

// ============================================
// ZOD SCHEMAS (inferidos de Drizzle para type-safety)
// ============================================

// Users
export const userSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export const safeUserSchema = userSchema.omit({ passwordHash: true });

// Email Verifications
export const emailVerificationSchema = createSelectSchema(emailVerifications);
export const insertEmailVerificationSchema = createInsertSchema(emailVerifications).omit({ id: true, createdAt: true });

// Profiles
export const profileSchema = createSelectSchema(playerProfiles);
export const insertProfileSchema = createInsertSchema(playerProfiles).omit({ createdAt: true, updatedAt: true });

// Characters
export const characterSchema = createSelectSchema(characters);
export const insertCharacterSchema = createInsertSchema(characters).omit({ createdAt: true });
export const playerCharacterSchema = createSelectSchema(playerCharacters);

// Levels
export const levelSchema = createSelectSchema(levels);
export const levelProgressSchema = createSelectSchema(levelProgress);
export const gameProgressSchema = createSelectSchema(gameProgress);

// Missions
export const missionSchema = createSelectSchema(missions);
export const userMissionSchema = createSelectSchema(userMissions);

// Lobbies
export const lobbySchema = createSelectSchema(lobbies);
export const insertLobbySchema = createInsertSchema(lobbies).omit({ id: true, code: true, createdAt: true, startedAt: true, endedAt: true });
export const lobbyPlayerSchema = createSelectSchema(lobbyPlayers);

// Game Servers
export const gameServerSchema = createSelectSchema(gameServers);

// Matches
export const matchSchema = createSelectSchema(matches);
export const matchStatSchema = createSelectSchema(matchStats);

// ============================================
// TIPOS TYPESCRIPT EXPORTADOS
// ============================================
export type User = z.infer<typeof userSchema>;
export type SafeUser = z.infer<typeof safeUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type EmailVerification = z.infer<typeof emailVerificationSchema>;
export type InsertEmailVerification = z.infer<typeof insertEmailVerificationSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Character = z.infer<typeof characterSchema>;
export type PlayerCharacter = z.infer<typeof playerCharacterSchema>;
export type Level = z.infer<typeof levelSchema>;
export type LevelProgress = z.infer<typeof levelProgressSchema>;
export type GameProgress = z.infer<typeof gameProgressSchema>;
export type Mission = z.infer<typeof missionSchema>;
export type UserMission = z.infer<typeof userMissionSchema>;
export type Lobby = z.infer<typeof lobbySchema>;
export type InsertLobby = z.infer<typeof insertLobbySchema>;
export type LobbyPlayer = z.infer<typeof lobbyPlayerSchema>;
export type GameServer = z.infer<typeof gameServerSchema>;
export type Match = z.infer<typeof matchSchema>;
export type MatchStat = z.infer<typeof matchStatSchema>;

// ============================================
// ESQUEMAS COMUNES PARA RESPUESTAS
// ============================================
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  statusCode: z.number().int(),
});