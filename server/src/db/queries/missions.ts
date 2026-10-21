import { db } from '../pool.js';
import { missions, userMissions, playerProfiles } from '../schema.js';
import { eq, and, sql, count } from 'drizzle-orm';
import type { Mission, UserMission } from '../schema.js';

// ============================================
// MISSIONS QUERIES
// ============================================

export async function getUserMissionsWithDetails(userId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await db
    .select({
      userMission: userMissions,
      mission: missions,
    })
    .from(userMissions)
    .innerJoin(missions, eq(userMissions.missionId, missions.id))
    .where(and(
      eq(userMissions.userId, userId),
      eq(userMissions.resetDate, today),
      eq(missions.isActive, true),
    ))
    .orderBy(missions.isDaily, missions.id);

  // Se devuelve una forma plana: el frontend consume `id`, `target` y `claimed`.
  return result.map(row => ({
    id: row.mission.id,
    title: row.mission.title,
    description: row.mission.description,
    missionType: row.mission.missionType,
    target: row.mission.targetValue,
    currentProgress: row.userMission.currentProgress,
    completed: row.userMission.completed,
    claimed: row.userMission.claimedAt !== null,
    claimedAt: row.userMission.claimedAt,
    rewardCoins: row.mission.rewardCoins,
    rewardXp: row.mission.rewardXp,
    isDaily: row.mission.isDaily,
  }));
}

export async function getUserMission(userId: number, missionId: number, resetDate: Date) {
  const result = await db
    .select()
    .from(userMissions)
    .where(and(
      eq(userMissions.userId, userId),
      eq(userMissions.missionId, missionId),
      eq(userMissions.resetDate, resetDate),
    ))
    .limit(1);
  return result[0] ?? null;
}

export async function getOrCreateUserMission(userId: number, missionId: number, resetDate: Date): Promise<UserMission> {
  const existing = await getUserMission(userId, missionId, resetDate);
  if (existing) return existing;

  const result = await db.insert(userMissions).values({
    userId,
    missionId,
    resetDate,
    currentProgress: 0,
    completed: false,
  }).returning();
  return result[0];
}

export async function updateMissionProgress(
  userId: number,
  missionType: 'play_matches' | 'kill_enemies' | 'win_matches' | 'collect_keys' | 'complete_level',
  increment: number
): Promise<Array<{ userMission: UserMission; mission: Mission }>> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find active missions of this type for the user
  const activeMissions = await db
    .select({ userMission: userMissions, mission: missions })
    .from(userMissions)
    .innerJoin(missions, eq(userMissions.missionId, missions.id))
    .where(and(
      eq(userMissions.userId, userId),
      eq(missions.missionType, missionType),
      eq(missions.isActive, true),
      eq(userMissions.resetDate, today),
      eq(userMissions.completed, false),
    ));

  const results = [];
  for (const row of activeMissions) {
    const { userMission, mission } = row;
    const newProgress = Math.min(userMission.currentProgress + increment, mission.targetValue);
    const completed = newProgress >= mission.targetValue;

    await db
      .update(userMissions)
      .set({
        currentProgress: newProgress,
        completed,
        claimedAt: completed ? null : userMission.claimedAt,
      })
      .where(and(
        eq(userMissions.userId, userId),
        eq(userMissions.missionId, mission.id),
        eq(userMissions.resetDate, today),
      ));

    results.push({ userMission: { ...userMission, currentProgress: newProgress, completed }, mission });
  }

  return results;
}

export async function claimMissionReward(userId: number, missionId: number): Promise<{
  mission: Mission;
  rewardCoins: number;
  rewardXp: number;
  newCoinsBalance: number;
  newXp: number;
  newLevel?: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const row = await db
    .select({ userMission: userMissions, mission: missions })
    .from(userMissions)
    .innerJoin(missions, eq(userMissions.missionId, missions.id))
    .where(and(
      eq(userMissions.userId, userId),
      eq(userMissions.missionId, missionId),
      eq(userMissions.resetDate, today),
    ))
    .limit(1);

  if (!row[0]) throw new Error('Misión no encontrada');

  const { userMission, mission } = row[0];

  if (!userMission.completed) throw new Error('Misión no completada');
  if (userMission.claimedAt) throw new Error('Recompensa ya reclamada');

  // Update profile with rewards
  const profileResult = await db
    .update(playerProfiles)
    .set({
      coins: sql`${playerProfiles.coins} + ${mission.rewardCoins}`,
      xp: sql`${playerProfiles.xp} + ${mission.rewardXp}`,
      updatedAt: new Date(),
    })
    .where(eq(playerProfiles.userId, userId))
    .returning();

  const profile = profileResult[0];
  if (!profile) throw new Error('Perfil no encontrado');

  // Mark as claimed
  await db
    .update(userMissions)
    .set({ claimedAt: new Date() })
    .where(and(
      eq(userMissions.userId, userId),
      eq(userMissions.missionId, missionId),
      eq(userMissions.resetDate, today),
    ));

  // Check level up
  let newLevel: number | undefined;
  const xpPerLevel = 1000;
  const calculatedLevel = Math.floor(profile.xp / xpPerLevel) + 1;
  if (calculatedLevel > profile.level) {
    newLevel = calculatedLevel;
    await db
      .update(playerProfiles)
      .set({ level: newLevel, updatedAt: new Date() })
      .where(eq(playerProfiles.userId, userId));
  }

  return {
    mission,
    rewardCoins: mission.rewardCoins,
    rewardXp: mission.rewardXp,
    newCoinsBalance: profile.coins,
    newXp: profile.xp,
    newLevel,
  };
}

export async function initializeUserMissions(userId: number): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeMissions = await db
    .select()
    .from(missions)
    .where(eq(missions.isActive, true));

  for (const mission of activeMissions) {
    await db.insert(userMissions).values({
      userId,
      missionId: mission.id,
      resetDate: today,
      currentProgress: 0,
      completed: false,
    }).onConflictDoNothing();
  }
}