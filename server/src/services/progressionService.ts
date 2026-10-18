import * as queries from '../db/queries/progression.js';
import * as missionQueries from '../db/queries/missions.js';
import { db } from '../db/pool.js';
import { userMissions, missions } from '../db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';

// ============================================
// PROGRESSION SERVICE
// ============================================

export async function getFullProgress(userId: number) {
  const data = await queries.getFullProgress(userId);
  if (!data.gameProgress) {
    data.gameProgress = await queries.createGameProgress(userId);
  }
  return data;
}

export async function completeLevel(
  userId: number,
  levelId: number,
  data: { timeSec: number; stars: number; deaths: number; keys: number; kills: number }
) {
  const level = await queries.getLevelById(levelId);
  if (!level) throw new Error('Nivel no encontrado');

  const gameProgress = await queries.getGameProgress(userId);
  if (!gameProgress) throw new Error('Progreso de juego no encontrado');

  const levelProg = await queries.getLevelProgress(userId, levelId);
  const isFirstCompletion = !levelProg || !levelProg.completed;

  const result = await queries.completeLevel(userId, levelId, data);

  if (isFirstCompletion) {
    await missionQueries.updateMissionProgress(userId, 'complete_level', 1);
    await missionQueries.updateMissionProgress(userId, 'win_matches', 1);
    await missionQueries.updateMissionProgress(userId, 'play_matches', 1);
  }

  if (data.kills > 0) {
    await missionQueries.updateMissionProgress(userId, 'kill_enemies', data.kills);
  }

  if (data.keys > 0) {
    await missionQueries.updateMissionProgress(userId, 'collect_keys', data.keys);
  }

  const missionRewards = await getCompletedMissionRewards(userId);

  return {
    ...result,
    missionRewards,
  };
}

async function getCompletedMissionRewards(userId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completed = await db
    .select({ userMission: userMissions, mission: missions })
    .from(userMissions)
    .innerJoin(missions, eq(userMissions.missionId, missions.id))
    .where(and(
      eq(userMissions.userId, userId),
      eq(userMissions.resetDate, today),
      eq(userMissions.completed, true),
      isNull(userMissions.claimedAt),
    ));

  return completed.map(row => ({
    missionId: row.mission.id,
    rewardCoins: row.mission.rewardCoins,
    rewardXp: row.mission.rewardXp,
  }));
}