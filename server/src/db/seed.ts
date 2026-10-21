import { db } from './pool.js';
import { levels } from './schema.js';
import { eq } from 'drizzle-orm';
import { pathToFileURL } from 'node:url';
import { sql } from './pool.js';

export async function seedLevels() {
  const existing = await db.select().from(levels).where(eq(levels.id, 1)).limit(1);
  if (existing[0]) {
    console.log('Levels already seeded');
    return;
  }

  await db.insert(levels).values([
    {
      id: 1,
      name: 'Nivel 1 - Tutorial',
      description: 'Aprende los controles básicos del juego',
      unlockOrder: 1,
      isBossLevel: false,
      parTimeSec: 180,
    },
    {
      id: 2,
      name: 'Nivel 2 - Primer Desafío',
      description: 'Enfrenta a tus primeros enemigos',
      unlockOrder: 2,
      isBossLevel: false,
      parTimeSec: 240,
    },
    {
      id: 3,
      name: 'Nivel 3 - La Cueva',
      description: 'Explora la cueva oscura',
      unlockOrder: 3,
      isBossLevel: true,
      parTimeSec: 300,
    },
  ]);

  console.log('✅ Levels seeded successfully');
}

// Permite ejecutar el archivo directamente (`npm run db:seed`) tanto en
// Windows como en Linux/macOS.
const esEjecucionDirecta = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;

if (esEjecucionDirecta) {
  await seedLevels();
  await sql.end({ timeout: 5 });
  process.exit(0);
}