import { db } from '../pool.js';
import { levelProgress, gameProgress, levels, playerProfiles, playerCharacters, characters } from '../schema.js';
import { eq, and, sql } from 'drizzle-orm';
import type { LevelProgress, GameProgress, Level } from '../schema.js';

// ============================================
// PROGRESSION QUERIES
// ============================================

export async function getFullProgress(userId: number) {
  const [gameProgResult, levelProgResult] = await Promise.all([
    db.select().from(gameProgress).where(eq(gameProgress.userId, userId)).limit(1),
    db.select().from(levelProgress).where(eq(levelProgress.userId, userId)).orderBy(levelProgress.levelId),
  ]);

  return {
    gameProgress: gameProgResult[0] ?? null,
    levelProgress: levelProgResult,
  };
}

export async function getLevelProgress(userId: number, levelId: number): Promise<LevelProgress | null> {
  const result = await db
    .select()
    .from(levelProgress)
    .where(and(eq(levelProgress.userId, userId), eq(levelProgress.levelId, levelId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getGameProgress(userId: number): Promise<GameProgress | null> {
  const result = await db.select().from(gameProgress).where(eq(gameProgress.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function getLevelById(levelId: number): Promise<Level | null> {
  const result = await db.select().from(levels).where(eq(levels.id, levelId)).limit(1);
  return result[0] ?? null;
}

export async function completeLevel(
  userId: number,
  levelId: number,
  data: { timeSec: number; stars: number; deaths: number; keys: number; kills: number }
): Promise<{
  levelProgress: LevelProgress;
  gameProgress: GameProgress;
  xpGain: number;
  coinGain: number;
  newLevel?: number;
  unlockedCharacters: string[];
  missionRewards: Array<{ missionId: number; rewardCoins: number; rewardXp: number }>;
}> {
  return await db.transaction(async (tx) => {
    // 1. Upsert level_progress
    const existingLevelProg = await tx
      .select()
      .from(levelProgress)
      .where(and(eq(levelProgress.userId, userId), eq(levelProgress.levelId, levelId)))
      .limit(1);

    let levelProgResult: LevelProgress;
    if (existingLevelProg[0]) {
      const result = await tx
        .update(levelProgress)
        .set({
          completed: true,
          stars: sql`GREATEST(${levelProgress.stars}, ${data.stars})`,
          bestTimeSec: existingLevelProg[0].bestTimeSec
            ? sql`LEAST(${levelProgress.bestTimeSec}, ${data.timeSec})`
            : data.timeSec,
          deaths: sql`${levelProgress.deaths} + ${data.deaths}`,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(levelProgress.userId, userId), eq(levelProgress.levelId, levelId)))
        .returning();
      levelProgResult = result[0];
    } else {
      const result = await tx.insert(levelProgress).values({
        userId,
        levelId,
        completed: true,
        stars: data.stars,
        bestTimeSec: data.timeSec,
        deaths: data.deaths,
        completedAt: new Date(),
      }).returning();
      levelProgResult = result[0];
    }

    // 2. Update game_progress (atomic)
    const gameProgResult = await tx
      .update(gameProgress)
      .set({
        currentLevelId: sql`CASE 
          WHEN ${gameProgress.currentLevelId} = ${levelId} AND ${gameProgress.currentLevelId} < (SELECT MAX(id) FROM ${levels})
          THEN ${levelId + 1}
          ELSE ${gameProgress.currentLevelId}
        END`,
        keysCollected: sql`${gameProgress.keysCollected} + ${data.keys}`,
        enemiesKilled: sql`${gameProgress.enemiesKilled} + ${data.kills}`,
        totalPlaytimeSec: sql`${gameProgress.totalPlaytimeSec} + ${data.timeSec}`,
        updatedAt: new Date(),
      })
      .where(eq(gameProgress.userId, userId))
      .returning();

    const gameProg = gameProgResult[0];
    if (!gameProg) {
      // Create if doesn't exist
      const created = await tx.insert(gameProgress).values({
        userId,
        currentLevelId: levelId + 1,
        keysCollected: data.keys,
        enemiesKilled: data.kills,
        totalPlaytimeSec: data.timeSec,
      }).returning();
      gameProgResult[0] = created[0];
    }

    // 3. Calculate XP and Coins gain
    const xpGain = 100 * data.stars + 50 * data.keys + 10 * data.kills;
    const coinGain = 50 * data.stars + 20 * data.keys;

    // 4. Update profile (XP, coins, totalPlaytimeSec)
    const profileResult = await tx
      .update(playerProfiles)
      .set({
        xp: sql`${playerProfiles.xp} + ${xpGain}`,
        coins: sql`${playerProfiles.coins} + ${coinGain}`,
        totalPlaytimeSec: sql`${playerProfiles.totalPlaytimeSec} + ${data.timeSec}`,
        updatedAt: new Date(),
      })
      .where(eq(playerProfiles.userId, userId))
      .returning();

    const profile = profileResult[0];
    if (!profile) throw new Error('Profile not found');

    // 5. Check level up
    let newLevel: number | undefined;
    let unlockedCharacters: string[] = [];

    const xpPerLevel = 1000; // Simple formula: 1000 XP per level
    const calculatedLevel = Math.floor(profile.xp / xpPerLevel) + 1;

    if (calculatedLevel > profile.level) {
      newLevel = calculatedLevel;
      await tx
        .update(playerProfiles)
        .set({ level: newLevel, updatedAt: new Date() })
        .where(eq(playerProfiles.userId, userId));

      // Check for character unlocks at this new level
      const newChars = await tx
        .select({ id: characters.id })
        .from(characters)
        .where(and(
          eq(characters.isActive, true),
          sql`${characters.unlockCost} <= ${profile.coins}`, // Simplified: unlock if affordable
          sql`${characters.id} NOT IN (SELECT character_id FROM ${playerCharacters} WHERE user_id = ${userId})`
        ))
        .limit(5);

      // Auto-unlock characters that are now affordable (optional game design)
      for (const char of newChars) {
        await tx.insert(playerCharacters).values({
          userId,
          characterId: char.id,
          skinVariant: 'default',
        }).onConflictDoNothing();
        unlockedCharacters.push(char.id);
      }
    }

    // 6. Update missions progress (delegated to mission service)
    // This will be called from service layer

    return {
      levelProgress: levelProgResult,
      gameProgress: gameProgResult[0],
      xpGain,
      coinGain,
      newLevel,
      unlockedCharacters,
      missionRewards: [], // Filled by service
    };
  });
}

export async function createGameProgress(userId: number): Promise<GameProgress> {
  const result = await db.insert(gameProgress).values({
    userId,
    currentLevelId: 1,
    lives: 5,
    keysCollected: 0,
    enemiesKilled: 0,
    totalPlaytimeSec: 0,
  }).returning();
  return result[0];
}