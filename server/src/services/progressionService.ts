import * as queries from '../db/queries/progression.js';
import * as missionQueries from '../db/queries/missions.js';
import { db } from '../db/pool.js';
import { userMissions, missions } from '../db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';
import { MAX_PLAYABLE_LEVEL_ID } from '../config/gameProgression.js';

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
  data: { timeSec: number; stars: number; deaths: number; keys: number; kills: number; correctKeys?: number }
) {
  if (!Number.isInteger(levelId) || levelId < 1 || levelId > MAX_PLAYABLE_LEVEL_ID) {
    throw new Error(`Solo existen ${MAX_PLAYABLE_LEVEL_ID} niveles jugables`);
  }
  const level = await queries.getLevelById(levelId);
  if (!level) throw new Error('Nivel no encontrado');

  const gameProgress = await queries.getGameProgress(userId);
  if (!gameProgress) throw new Error('Progreso de juego no encontrado');

  const levelProg = await queries.getLevelProgress(userId, levelId);
  const isFirstCompletion = !levelProg || !levelProg.completed;

  const result = await queries.completeLevel(userId, levelId, {
    ...data,
    parTimeSec: level.parTimeSec ?? 180,
    awardXp: isFirstCompletion,
  });

  // El progreso y las monedas ya quedaron confirmados en la transacción.
  // Un fallo secundario de misiones no debe ocultar el saldo persistido.
  let missionRewards: Array<{ missionId: number; rewardCoins: number; rewardXp: number }> = [];
  try {
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

    missionRewards = await getCompletedMissionRewards(userId);
  } catch (error) {
    console.error('No se pudo actualizar el progreso de misiones:', error);
  }

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
