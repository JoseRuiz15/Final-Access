import * as queries from '../db/queries/missions.js';

// ============================================
// MISSION SERVICE
// ============================================

export async function getUserMissions(userId: number) {
  // Asegura que el usuario tenga las misiones de hoy (reset diario perezoso).
  await queries.initializeUserMissions(userId);
  return queries.getUserMissionsWithDetails(userId);
}

export async function initializeUserMissions(userId: number) {
  await queries.initializeUserMissions(userId);
}

export async function claimMission(userId: number, missionId: number) {
  return queries.claimMissionReward(userId, missionId);
}

export async function updateMissionProgress(
  userId: number,
  missionType: 'play_matches' | 'kill_enemies' | 'win_matches' | 'collect_keys' | 'complete_level',
  increment: number
) {
  return queries.updateMissionProgress(userId, missionType, increment);
}