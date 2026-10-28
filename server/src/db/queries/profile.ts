import { db } from '../pool.js';
import { playerProfiles, characters, playerCharacters } from '../schema.js';
import { eq, and, sql, count } from 'drizzle-orm';
import type { Profile, Character, PlayerCharacter } from '../schema.js';

// ============================================
// PROFILE QUERIES
// ============================================

export async function getProfileWithDetails(userId: number) {
  const profileResult = await db
    .select()
    .from(playerProfiles)
    .where(eq(playerProfiles.userId, userId))
    .limit(1);

  if (!profileResult[0]) return null;

  const profile = profileResult[0];

  // Get equipped character
  let equippedCharacter = null;
  if (profile.equippedCharacterId) {
    const charResult = await db
      .select()
      .from(characters)
      .where(eq(characters.id, profile.equippedCharacterId))
      .limit(1);
    equippedCharacter = charResult[0] ?? null;
  }

  // Get unlocked characters with details
  const unlockedChars = await db
    .select({
      characterId: playerCharacters.characterId,
      unlockedAt: playerCharacters.unlockedAt,
      skinVariant: playerCharacters.skinVariant,
      character: characters,
    })
    .from(playerCharacters)
    .innerJoin(characters, eq(playerCharacters.characterId, characters.id))
    .where(eq(playerCharacters.userId, userId));

  return {
    profile,
    equippedCharacter,
    unlockedCharacters: unlockedChars.map(row => ({
      characterId: row.characterId,
      character: row.character,
      unlockedAt: row.unlockedAt,
      skinVariant: row.skinVariant ?? 'default',
    })),
  };
}

export async function updateProfile(
  userId: number,
  data: { displayName?: string; avatarCharacterId?: string | null },
): Promise<Profile | null> {
  const updates: Partial<Profile> = { updatedAt: new Date() }
  if (data.displayName !== undefined) updates.displayName = data.displayName
  if (data.avatarCharacterId !== undefined) updates.avatarCharacterId = data.avatarCharacterId

  const result = await db
    .update(playerProfiles)
    .set(updates)
    .where(eq(playerProfiles.userId, userId))
    .returning();
  return result[0] ?? null;
}

export async function equipCharacter(userId: number, characterId: string): Promise<Profile | null> {
  // Verify user owns this character
  const ownership = await db
    .select()
    .from(playerCharacters)
    .where(and(
      eq(playerCharacters.userId, userId),
      eq(playerCharacters.characterId, characterId)
    ))
    .limit(1);

  if (!ownership[0]) {
    throw new Error('No tienes desbloqueado este personaje');
  }

  const result = await db
    .update(playerProfiles)
    .set({ equippedCharacterId: characterId, updatedAt: new Date() })
    .where(eq(playerProfiles.userId, userId))
    .returning();

  return result[0] ?? null;
}

export async function createProfile(userId: number, displayName: string): Promise<Profile> {
  const result = await db.insert(playerProfiles).values({
    userId,
    displayName,
  }).returning();
  return result[0];
}

// ============================================
// CHARACTERS QUERIES
// ============================================

export async function getAllCharacters(query: {
  page: number;
  limit: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  attackType?: 'melee' | 'ranged' | 'magic';
  isActive: boolean;
}) {
  const conditions = [eq(characters.isActive, query.isActive)];
  if (query.rarity) conditions.push(eq(characters.rarity, query.rarity));
  if (query.attackType) conditions.push(eq(characters.attackType, query.attackType));

  const [chars, totalResult] = await Promise.all([
    db
      .select()
      .from(characters)
      .where(and(...conditions))
      .orderBy(characters.rarity, characters.unlockCost)
      .limit(query.limit)
      .offset((query.page - 1) * query.limit),
    db
      .select({ count: count() })
      .from(characters)
      .where(and(...conditions)),
  ]);

  const total = totalResult[0]?.count ?? 0;
  return {
    characters: chars,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getCharacterById(characterId: string): Promise<Character | null> {
  const result = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1);
  return result[0] ?? null;
}

export async function getUserCharacters(userId: number) {
  return db
    .select({
      characterId: playerCharacters.characterId,
      unlockedAt: playerCharacters.unlockedAt,
      skinVariant: playerCharacters.skinVariant,
      character: characters,
    })
    .from(playerCharacters)
    .innerJoin(characters, eq(playerCharacters.characterId, characters.id))
    .where(eq(playerCharacters.userId, userId));
}

export async function isCharacterUnlocked(userId: number, characterId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(playerCharacters)
    .where(and(
      eq(playerCharacters.userId, userId),
      eq(playerCharacters.characterId, characterId)
    ))
    .limit(1);
  return result.length > 0;
}

export async function unlockCharacter(userId: number, characterId: string): Promise<PlayerCharacter> {
  const result = await db.insert(playerCharacters).values({
    userId,
    characterId,
    skinVariant: 'default',
  }).returning();
  return result[0];
}

export async function spendCoins(userId: number, amount: number): Promise<Profile | null> {
  const result = await db
    .update(playerProfiles)
    .set({
      coins: sql`${playerProfiles.coins} - ${amount}`,
      updatedAt: new Date(),
    })
    .where(and(
      eq(playerProfiles.userId, userId),
      sql`${playerProfiles.coins} >= ${amount}`
    ))
    .returning();
  return result[0] ?? null;
}

export async function getProfile(userId: number): Promise<Profile | null> {
  const result = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}
