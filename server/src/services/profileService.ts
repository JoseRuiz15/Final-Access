import * as queries from '../db/queries/profile.js';
import type { Character } from '../db/schema.js';
import { MAX_PLAYABLE_LEVEL_ID } from '../config/gameProgression.js';

// ============================================
// PROFILE SERVICE
// ============================================

export async function getFullProfile(userId: number) {
  const data = await queries.getProfileWithDetails(userId);
  if (!data) return null;

  const { profile, equippedCharacter, unlockedCharacters } = data;
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    level: Math.min(profile.level, MAX_PLAYABLE_LEVEL_ID),
    xp: profile.xp,
    coins: profile.coins,
    equippedCharacterId: profile.equippedCharacterId,
    avatarCharacterId: profile.avatarCharacterId,
    avatarImageData: profile.avatarImageData,
    totalPlaytimeSec: profile.totalPlaytimeSec,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
    equippedCharacter,
    unlockedCharacters,
  };
}

export async function updateProfile(
  userId: number,
  data: { displayName?: string; avatarCharacterId?: string | null; avatarImageData?: string | null },
) {
  if (data.avatarCharacterId && !(await queries.isCharacterUnlocked(userId, data.avatarCharacterId))) {
    throw new Error('Debes tener desbloqueado ese personaje para usar su retrato');
  }

  const profile = await queries.updateProfile(userId, data);
  if (!profile) throw new Error('Perfil no encontrado');
  return { ...profile, level: Math.min(profile.level, MAX_PLAYABLE_LEVEL_ID) };
}

// ============================================
// CHARACTER SERVICE
// ============================================

export async function getCharactersList(query: {
  page: number;
  limit: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  attackType?: 'melee' | 'ranged' | 'magic';
  isActive: boolean;
}) {
  return queries.getAllCharacters(query);
}

export async function getCharacterById(characterId: string): Promise<Character | null> {
  return queries.getCharacterById(characterId);
}

export async function unlockCharacter(userId: number, characterId: string) {
  // Verify character exists and is active
  const character = await queries.getCharacterById(characterId);
  if (!character) throw new Error('Personaje no encontrado');
  if (!character.isActive) throw new Error('Personaje no disponible');

  // Check if already unlocked
  const alreadyUnlocked = await queries.isCharacterUnlocked(userId, characterId);
  if (alreadyUnlocked) throw new Error('Ya tienes desbloqueado este personaje');

  // Check coins
  const profile = await queries.getProfile(userId);
  if (!profile) throw new Error('Perfil no encontrado');
  if (profile.coins < character.unlockCost) {
    throw new Error(`Monedas insuficientes. Necesitas ${character.unlockCost}, tienes ${profile.coins}`);
  }

  // Spend coins
  const updatedProfile = await queries.spendCoins(userId, character.unlockCost);
  if (!updatedProfile) throw new Error('Error al procesar pago');

  // Unlock character
  const unlocked = await queries.unlockCharacter(userId, characterId);

  return {
    character: {
      characterId: unlocked.characterId,
      unlockedAt: unlocked.unlockedAt.toISOString(),
      skinVariant: unlocked.skinVariant,
    },
    newCoinsBalance: updatedProfile.coins,
  };
}

export async function equipCharacter(userId: number, characterId: string) {
  const profile = await queries.equipCharacter(userId, characterId);
  if (!profile) throw new Error('Error al equipar personaje');
  return profile;
}
