import { db } from './pool.js';
import { characters } from './schema.js';
import { eq } from 'drizzle-orm';

export async function seedCharacters() {
  const existing = await db.select().from(characters).where(eq(characters.id, 'cosa1')).limit(1);
  if (existing[0]) {
    console.log('Characters already seeded');
    return;
  }

  await db.insert(characters).values([
    {
      id: 'cosa1',
      name: 'Cosa 1',
      rarity: 'common',
      attackType: 'melee',
      baseHealth: 100,
      baseSpeed: 5,
      baseDamage: 20,
      textureKey: 'cosa1',
      walkTexture: 'cosa1_walk',
      abilityName: 'Puños de energía',
      abilityDesc: 'Su habilidad consiste en el ataque cuerpo a cuerpo, por lo que tiene que estar cerca del enemigo para infligir daño.',
      unlockCost: 0,
      isActive: true,
    },
    {
      id: 'cosa2',
      name: 'Cosa 2',
      rarity: 'common',
      attackType: 'melee',
      baseHealth: 100,
      baseSpeed: 5,
      baseDamage: 20,
      textureKey: 'cosa2',
      walkTexture: 'cosa2_walk',
      abilityName: 'Sable de luz',
      abilityDesc: 'Su habilidad consiste en atacar con una espada de energía, es necesario estar cerca de los enemigos.',
      unlockCost: 0,
      isActive: true,
    },
    {
      id: 'cosa3',
      name: 'Cosa 3',
      rarity: 'rare',
      attackType: 'melee',
      baseHealth: 120,
      baseSpeed: 6,
      baseDamage: 25,
      textureKey: 'cosa3',
      walkTexture: 'cosa3_walk',
      abilityName: 'Golpe espectral',
      abilityDesc: 'Un personaje ofensivo que causa mucho daño en poco tiempo, ideal para entrar fuerte en batalla.',
      unlockCost: 500,
      isActive: true,
    },
  ]);

  console.log('✅ Characters seeded successfully');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await seedCharacters();
  process.exit(0);
}